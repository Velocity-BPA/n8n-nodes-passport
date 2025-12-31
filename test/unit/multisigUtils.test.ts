/**
 * n8n-nodes-passport
 * Unit Tests - Multisig Utilities
 */

import {
	parseBsms,
	generateBsms,
	generateDescriptor,
	parseDescriptor,
	validateMultisigConfig,
	generateSpecterFormat,
	generateColdcardFormat,
	generateNunchukFormat,
	getQuorumDescription,
	type MultisigConfig,
	type CosignerInfo,
} from '../../nodes/Passport/utils/multisigUtils';

// Type definitions for wallet format outputs
interface SpecterFormat {
	label: string;
	blockheight: number;
	descriptor: string;
	devices: Array<{ type: string; label: string; fingerprint: string }>;
}

interface NunchukFormat {
	id: string;
	name: string;
	m: number;
	n: number;
	address_type: string;
	is_escrow: boolean;
	signers: Array<{
		master_fingerprint: string;
		derivation_path: string;
		xpub: string;
		name: string;
		type: string;
	}>;
}

// Valid test xpubs (real format, 111 chars after xpub)
const testXpub1 = 'xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8';
const testXpub2 = 'xpub68NZiKmJWnxxS6aaHmn81bvJeTESw724CRDs6HbuccFQN9Ku14VQrADWgqbhhTHBaohPX4CjNLf9fq9MYo6oDaPPLPxSb7gwQN3ih19Zm4Y';
const testXpub3 = 'xpub6CUGRUonZSQ4TWtTMmzXdrXDtypWZiD6QqKeToU5pmhVBYrT22QJ9M8KQJtNJfChv9dJJAXxCMprewfh6pVqq3FZB2A9vmJwqwP8jvEnrGc';

describe('Multisig Utilities', () => {
	const sampleCosigners: CosignerInfo[] = [
		{
			name: 'Passport 1',
			fingerprint: 'abcd1234',
			xpub: testXpub1,
			derivationPath: "m/48'/0'/0'/2'",
		},
		{
			name: 'Passport 2',
			fingerprint: 'ef125678',
			xpub: testXpub2,
			derivationPath: "m/48'/0'/0'/2'",
		},
		{
			name: 'Passport 3',
			fingerprint: '12349012',
			xpub: testXpub3,
			derivationPath: "m/48'/0'/0'/2'",
		},
	];

	const sampleConfig: MultisigConfig = {
		name: 'Test Multisig Wallet',
		requiredSignatures: 2,
		totalSigners: 3,
		addressType: 'P2WSH',
		cosigners: sampleCosigners,
		derivationPath: "m/48'/0'/0'/2'",
	};

	describe('generateDescriptor', () => {
		it('should generate P2WSH multisig descriptor', () => {
			const descriptor = generateDescriptor(sampleConfig);

			expect(descriptor).toContain('wsh(');
			expect(descriptor).toContain('sortedmulti(2,');
			expect(descriptor).toContain('[abcd1234');
			expect(descriptor).toContain('[ef125678');
			expect(descriptor).toContain('[12349012');
		});

		it('should generate P2SH-P2WSH descriptor', () => {
			const config = { ...sampleConfig, addressType: 'P2SH-P2WSH' as const };
			const descriptor = generateDescriptor(config);

			expect(descriptor).toContain('sh(wsh(');
		});

		it('should generate P2SH descriptor', () => {
			const config = { ...sampleConfig, addressType: 'P2SH' as const };
			const descriptor = generateDescriptor(config);

			expect(descriptor).toMatch(/^sh\(sortedmulti/);
		});

		it('should sort cosigners by fingerprint', () => {
			const descriptor = generateDescriptor(sampleConfig);

			// Verify fingerprints appear in sorted order
			// Sorted order: 12349012, abcd1234, ef125678
			const firstIndex = descriptor.indexOf('12349012');
			const secondIndex = descriptor.indexOf('abcd1234');
			const thirdIndex = descriptor.indexOf('ef125678');

			expect(firstIndex).toBeLessThan(secondIndex);
			expect(secondIndex).toBeLessThan(thirdIndex);
		});
	});

	describe('parseDescriptor', () => {
		it('should parse a valid multisig descriptor', () => {
			// Generate a real descriptor and parse it back
			const descriptor = generateDescriptor(sampleConfig);
			const result = parseDescriptor(descriptor);

			expect(result).not.toBeNull();
			expect(result?.requiredSignatures).toBe(2);
			expect(result?.totalSigners).toBe(3);
			expect(result?.addressType).toBe('P2WSH');
		});

		it('should return null for non-multisig descriptor', () => {
			const descriptor = `wpkh([abcd1234]${testXpub1})`;
			const result = parseDescriptor(descriptor);

			expect(result).toBeNull();
		});

		it('should detect address type correctly', () => {
			const p2wshConfig = { ...sampleConfig, addressType: 'P2WSH' as const };
			const p2shp2wshConfig = { ...sampleConfig, addressType: 'P2SH-P2WSH' as const };
			const p2shConfig = { ...sampleConfig, addressType: 'P2SH' as const };

			expect(parseDescriptor(generateDescriptor(p2wshConfig))?.addressType).toBe('P2WSH');
			expect(parseDescriptor(generateDescriptor(p2shp2wshConfig))?.addressType).toBe('P2SH-P2WSH');
			expect(parseDescriptor(generateDescriptor(p2shConfig))?.addressType).toBe('P2SH');
		});
	});

	describe('validateMultisigConfig', () => {
		it('should validate a correct config', () => {
			const result = validateMultisigConfig(sampleConfig);

			expect(result.valid).toBe(true);
			expect(result.errors.length).toBe(0);
		});

		it('should reject invalid required signatures', () => {
			const config = { ...sampleConfig, requiredSignatures: 0 };
			const result = validateMultisigConfig(config);

			expect(result.valid).toBe(false);
			expect(result.errors.some((e) => e.includes('at least 1'))).toBe(true);
		});

		it('should reject required > total', () => {
			const config = { ...sampleConfig, requiredSignatures: 4 };
			const result = validateMultisigConfig(config);

			expect(result.valid).toBe(false);
		});

		it('should reject single signer', () => {
			const config = {
				...sampleConfig,
				totalSigners: 1,
				cosigners: [sampleCosigners[0]],
			};
			const result = validateMultisigConfig(config);

			expect(result.valid).toBe(false);
		});

		it('should reject more than 15 signers', () => {
			const manyCosigners = Array.from({ length: 16 }, (_, i) => ({
				...sampleCosigners[0],
				fingerprint: `0000000${i.toString(16)}`,
				name: `Cosigner ${i}`,
			}));

			const config = {
				...sampleConfig,
				totalSigners: 16,
				cosigners: manyCosigners,
			};
			const result = validateMultisigConfig(config);

			expect(result.valid).toBe(false);
		});

		it('should reject duplicate fingerprints', () => {
			const config = {
				...sampleConfig,
				cosigners: [
					sampleCosigners[0],
					{ ...sampleCosigners[1], fingerprint: 'abcd1234' },
					sampleCosigners[2],
				],
			};
			const result = validateMultisigConfig(config);

			expect(result.valid).toBe(false);
			expect(result.errors.some((e) => e.includes('Duplicate'))).toBe(true);
		});

		it('should validate fingerprint format', () => {
			const config = {
				...sampleConfig,
				cosigners: [
					{ ...sampleCosigners[0], fingerprint: 'invalid' },
					sampleCosigners[1],
					sampleCosigners[2],
				],
			};
			const result = validateMultisigConfig(config);

			expect(result.valid).toBe(false);
		});
	});

	describe('parseBsms', () => {
		it('should parse valid BSMS content', () => {
			const bsms = `BSMS 1.0

wsh(sortedmulti(2,[abcd1234/48h/0h/0h/2h]${testXpub1},[efgh5678/48h/0h/0h/2h]${testXpub2}))
/No path restrictions/
Test Wallet`;

			const result = parseBsms(bsms);

			expect(result.version).toBe('1.0');
			expect(result.descriptor).toContain('sortedmulti');
		});

		it('should throw on invalid BSMS', () => {
			const invalid = 'Invalid content';

			expect(() => parseBsms(invalid)).toThrow();
		});
	});

	describe('generateBsms', () => {
		it('should generate valid BSMS format', () => {
			const bsms = generateBsms(sampleConfig);

			expect(bsms).toContain('BSMS 1.0');
			expect(bsms).toContain('sortedmulti');
		});
	});

	describe('generateSpecterFormat', () => {
		it('should generate Specter Desktop format', () => {
			const format = generateSpecterFormat(sampleConfig) as SpecterFormat;

			expect(format.label).toBe(sampleConfig.name);
			expect(format.descriptor).toContain('sortedmulti');
			expect(format.devices.length).toBe(3);
		});
	});

	describe('generateColdcardFormat', () => {
		it('should generate Coldcard format', () => {
			const format = generateColdcardFormat(sampleConfig);

			expect(typeof format).toBe('string');
			expect(format).toContain('Name:');
			expect(format).toContain('Policy:');
			expect(format).toContain('Derivation:');
		});
	});

	describe('generateNunchukFormat', () => {
		it('should generate Nunchuk format', () => {
			const format = generateNunchukFormat(sampleConfig) as NunchukFormat;

			expect(format.name).toBe(sampleConfig.name);
			expect(format.m).toBe(2);
			expect(format.n).toBe(3);
			expect(format.signers.length).toBe(3);
		});
	});

	describe('getQuorumDescription', () => {
		it('should describe 2-of-3', () => {
			expect(getQuorumDescription(2, 3)).toContain('2-of-3');
		});

		it('should describe 3-of-5', () => {
			expect(getQuorumDescription(3, 5)).toContain('3-of-5');
		});

		it('should handle custom quorums', () => {
			expect(getQuorumDescription(7, 10)).toContain('7-of-10');
		});
	});
});
