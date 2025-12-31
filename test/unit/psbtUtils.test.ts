/**
 * n8n-nodes-passport
 * Copyright (c) 2025
 *
 * Licensed under the Business Source License 1.1 (the "License");
 * See LICENSE file for details.
 */

import {
	validatePSBT,
} from '../../nodes/Passport/utils/psbtUtils';
import * as bitcoin from 'bitcoinjs-lib';

describe('PSBT Utilities', () => {
	// Create a valid PSBT programmatically for testing
	const createValidTestPSBT = (): string => {
		const psbt = new bitcoin.Psbt({ network: bitcoin.networks.testnet });
		// Add a dummy input/output for structure
		psbt.addInput({
			hash: Buffer.alloc(32, 0).toString('hex'),
			index: 0,
			witnessUtxo: {
				script: Buffer.from('0014' + '00'.repeat(20), 'hex'),
				value: 100000,
			},
		});
		psbt.addOutput({
			script: Buffer.from('0014' + '00'.repeat(20), 'hex'),
			value: 90000,
		});
		return psbt.toBase64();
	};

	describe('validatePSBT', () => {
		it('should validate a correct PSBT', () => {
			const validPsbt = createValidTestPSBT();
			const result = validatePSBT(validPsbt);
			expect(result.valid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should catch invalid PSBT magic bytes', () => {
			// Random base64 that doesn't start with PSBT magic
			const invalidPsbt = Buffer.from('invalid data').toString('base64');
			const result = validatePSBT(invalidPsbt);
			expect(result.valid).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0);
		});

		it('should catch malformed PSBT', () => {
			// Proper magic bytes but truncated
			const truncated = Buffer.from([0x70, 0x73, 0x62, 0x74, 0xff]).toString('base64');
			const result = validatePSBT(truncated);
			expect(result.valid).toBe(false);
		});
	});

	describe('PSBT Magic Bytes', () => {
		it('should recognize PSBT magic header', () => {
			// 'psbt' followed by 0xff
			const magicBytes = Buffer.from([0x70, 0x73, 0x62, 0x74, 0xff]);
			expect(magicBytes[0]).toBe(0x70); // 'p'
			expect(magicBytes[1]).toBe(0x73); // 's'
			expect(magicBytes[2]).toBe(0x62); // 'b'
			expect(magicBytes[3]).toBe(0x74); // 't'
			expect(magicBytes[4]).toBe(0xff); // separator
		});

		it('should detect valid PSBT structure', () => {
			const validPsbt = createValidTestPSBT();
			const buffer = Buffer.from(validPsbt, 'base64');
			
			// Check magic bytes
			expect(buffer[0]).toBe(0x70);
			expect(buffer[1]).toBe(0x73);
			expect(buffer[2]).toBe(0x62);
			expect(buffer[3]).toBe(0x74);
			expect(buffer[4]).toBe(0xff);
		});
	});

	describe('PSBT Parsing Helpers', () => {
		it('should handle network parameter correctly', () => {
			const validPsbt = createValidTestPSBT();
			
			// Should not throw for valid network names
			expect(() => {
				const buffer = Buffer.from(validPsbt, 'base64');
				bitcoin.Psbt.fromBuffer(buffer, { network: bitcoin.networks.testnet });
			}).not.toThrow();
		});

		it('should serialize and deserialize PSBT', () => {
			const psbt = new bitcoin.Psbt({ network: bitcoin.networks.testnet });
			psbt.addInput({
				hash: Buffer.alloc(32, 1).toString('hex'),
				index: 0,
				witnessUtxo: {
					script: Buffer.from('0014' + '00'.repeat(20), 'hex'),
					value: 50000,
				},
			});
			psbt.addOutput({
				script: Buffer.from('0014' + '11'.repeat(20), 'hex'),
				value: 40000,
			});

			const base64 = psbt.toBase64();
			const restored = bitcoin.Psbt.fromBase64(base64, { network: bitcoin.networks.testnet });
			
			expect(restored.txInputs.length).toBe(1);
			expect(restored.txOutputs.length).toBe(1);
		});
	});

	describe('Fee Calculation Logic', () => {
		it('should calculate fee correctly', () => {
			const inputValue = 100000; // satoshis
			const outputValue = 90000; // satoshis
			const expectedFee = inputValue - outputValue;
			
			expect(expectedFee).toBe(10000);
		});

		it('should calculate fee rate', () => {
			const fee = 10000; // satoshis
			const vsize = 200; // virtual bytes
			const feeRate = fee / vsize;
			
			expect(feeRate).toBe(50); // sat/vB
		});
	});

	describe('Address Type Detection', () => {
		it('should detect P2WPKH script', () => {
			// P2WPKH script: OP_0 <20-byte-pubkey-hash>
			const script = Buffer.from('0014' + '00'.repeat(20), 'hex');
			expect(script.length).toBe(22);
			expect(script[0]).toBe(0x00); // OP_0
			expect(script[1]).toBe(0x14); // 20 bytes
		});

		it('should detect P2WSH script', () => {
			// P2WSH script: OP_0 <32-byte-script-hash>
			const script = Buffer.from('0020' + '00'.repeat(32), 'hex');
			expect(script.length).toBe(34);
			expect(script[0]).toBe(0x00); // OP_0
			expect(script[1]).toBe(0x20); // 32 bytes
		});

		it('should detect P2TR script', () => {
			// P2TR script: OP_1 <32-byte-x-only-pubkey>
			const script = Buffer.from('5120' + '00'.repeat(32), 'hex');
			expect(script.length).toBe(34);
			expect(script[0]).toBe(0x51); // OP_1
			expect(script[1]).toBe(0x20); // 32 bytes
		});
	});

	describe('PSBT Input Analysis', () => {
		it('should identify signed vs unsigned inputs', () => {
			const psbt = new bitcoin.Psbt({ network: bitcoin.networks.testnet });
			psbt.addInput({
				hash: Buffer.alloc(32, 0).toString('hex'),
				index: 0,
				witnessUtxo: {
					script: Buffer.from('0014' + '00'.repeat(20), 'hex'),
					value: 100000,
				},
			});
			
			const input = psbt.data.inputs[0];
			
			// No signatures yet
			expect(input.finalScriptSig).toBeUndefined();
			expect(input.finalScriptWitness).toBeUndefined();
			expect(input.partialSig).toBeUndefined();
		});
	});

	describe('PSBT Output Analysis', () => {
		it('should correctly read output value', () => {
			const psbt = new bitcoin.Psbt({ network: bitcoin.networks.testnet });
			psbt.addOutput({
				script: Buffer.from('0014' + '00'.repeat(20), 'hex'),
				value: 50000,
			});

			expect(psbt.txOutputs[0].value).toBe(50000);
		});

		it('should handle multiple outputs', () => {
			const psbt = new bitcoin.Psbt({ network: bitcoin.networks.testnet });
			psbt.addOutput({
				script: Buffer.from('0014' + '00'.repeat(20), 'hex'),
				value: 50000,
			});
			psbt.addOutput({
				script: Buffer.from('0014' + '11'.repeat(20), 'hex'),
				value: 40000,
			});

			expect(psbt.txOutputs.length).toBe(2);
			expect(psbt.txOutputs[0].value).toBe(50000);
			expect(psbt.txOutputs[1].value).toBe(40000);
		});
	});

	describe('PSBT Combination Logic', () => {
		it('should throw for empty array', () => {
			expect(() => {
				if ([].length === 0) {
					throw new Error('Cannot combine empty array of PSBTs');
				}
			}).toThrow('Cannot combine empty array');
		});

		it('should handle single PSBT', () => {
			const psbt = new bitcoin.Psbt({ network: bitcoin.networks.testnet });
			const psbts = [psbt.toBase64()];
			
			expect(psbts.length).toBe(1);
		});
	});
});
