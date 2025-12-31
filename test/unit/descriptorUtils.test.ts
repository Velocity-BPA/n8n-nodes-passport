/**
 * n8n-nodes-passport
 * Copyright (c) 2025
 *
 * Licensed under the Business Source License 1.1 (the "License");
 * See LICENSE file for details.
 */

import {
	parseDescriptor,
	generateDescriptor,
	validateDescriptor,
	describeDescriptor,
	extractFingerprints,
	hasFingerprint,
	deriveFromDescriptor,
} from '../../nodes/Passport/utils/descriptorUtils';

// Sample valid extended public keys for testing
const sampleXpub1 = 'xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8';
const sampleXpub2 = 'xpub68NZiKmJWnxxS6aaHmn81bvJeTESw724CRDs6HbuccFQN9Ku14VQrADWgqbhhTHBaohPX4CjNLf9fq9MYo6oDaPPLPxSb7gwQN3ih19Zm4Y';
const sampleXpub3 = 'xpub6CUGRUonZSQ4TWtTMmzXdrXDtypWZiD6QqKeToU5pmhVBYrT22QJ9M8KQJtNJfChv9dJJAXxCMprewfh6pVqq3FZB2A9vmJwqwP8jvEnrGc';
const sampleTpub = 'tpubDDgEAMpHn8tX5Bs19WWJLZBeFzbcdBKxRP7gg2HAsJm5jMgrE6BLw8VBmHNSBD5LCY1N1FwWdXqPeKQtmjhk4BPt1qGz2P7uzHfSbMJPg9p';

describe('Descriptor Utilities', () => {
	describe('parseDescriptor', () => {
		it('should parse a wpkh descriptor', () => {
			const descriptor = `wpkh([abcd1234/84'/0'/0']${sampleXpub1}/0/*)`;
			const result = parseDescriptor(descriptor);

			expect(result.type).toBe('wpkh');
			expect(result.scriptType).toBe('P2WPKH');
			expect(result.isRanged).toBe(true);
			expect(result.network).toBe('mainnet');
		});

		it('should parse a pkh descriptor', () => {
			const descriptor = `pkh([abcd1234/44'/0'/0']${sampleXpub1}/0/*)`;
			const result = parseDescriptor(descriptor);

			expect(result.type).toBe('pkh');
			expect(result.scriptType).toBe('P2PKH');
		});

		it('should parse a sh(wpkh()) descriptor', () => {
			const descriptor = `sh(wpkh([abcd1234/49'/0'/0']${sampleXpub1}/0/*))`;
			const result = parseDescriptor(descriptor);

			expect(result.type).toBe('sh');
			expect(result.scriptType).toBe('P2SH-P2WPKH');
		});

		it('should parse a tr descriptor', () => {
			const descriptor = `tr([abcd1234/86'/0'/0']${sampleXpub1}/0/*)`;
			const result = parseDescriptor(descriptor);

			expect(result.type).toBe('tr');
			expect(result.scriptType).toBe('P2TR');
		});

		it('should parse a wsh multisig descriptor', () => {
			const descriptor = `wsh(sortedmulti(2,[abcd1234/48'/0'/0'/2']${sampleXpub1},[efgh5678/48'/0'/0'/2']${sampleXpub2}))`;
			const result = parseDescriptor(descriptor);

			expect(result.type).toBe('wsh');
			expect(result.scriptType).toBe('P2WSH');
			expect(result.isMultisig).toBe(true);
			expect(result.multisigInfo?.required).toBe(2);
			expect(result.multisigInfo?.sorted).toBe(true);
		});

		it('should extract key origins', () => {
			const descriptor = `wpkh([abcd1234/84'/0'/0']${sampleXpub1}/0/*)`;
			const result = parseDescriptor(descriptor);

			expect(result.keys.length).toBe(1);
			expect(result.keys[0].fingerprint).toBe('abcd1234');
		});

		it('should detect testnet keys', () => {
			const descriptor = `wpkh([abcd1234/84'/1'/0']${sampleTpub}/0/*)`;
			const result = parseDescriptor(descriptor);

			expect(result.network).toBe('testnet');
		});

		it('should detect mainnet keys', () => {
			const descriptor = `wpkh([abcd1234/84'/0'/0']${sampleXpub1}/0/*)`;
			const result = parseDescriptor(descriptor);

			expect(result.network).toBe('mainnet');
		});

		it('should extract checksum', () => {
			const descriptor = `wpkh([abcd1234/84'/0'/0']${sampleXpub1}/0/*)#abc12345`;
			const result = parseDescriptor(descriptor);

			expect(result.checksum).toBe('abc12345');
		});
	});

	describe('generateDescriptor', () => {
		it('should generate a P2WPKH descriptor', () => {
			const keys = [
				{
					fingerprint: 'abcd1234',
					derivationPath: "m/84'/0'/0'",
					publicKey: sampleXpub1,
					keyType: 'xpub' as const,
				},
			];

			const descriptor = generateDescriptor('P2WPKH', keys);

			expect(descriptor).toContain('wpkh(');
			expect(descriptor).toContain('[abcd1234');
			expect(descriptor).toContain(sampleXpub1);
		});

		it('should generate a multisig descriptor', () => {
			const keys = [
				{
					fingerprint: 'abcd1234',
					derivationPath: "m/48'/0'/0'/2'",
					publicKey: sampleXpub1,
					keyType: 'xpub' as const,
				},
				{
					fingerprint: 'efgh5678',
					derivationPath: "m/48'/0'/0'/2'",
					publicKey: sampleXpub2,
					keyType: 'xpub' as const,
				},
			];

			const descriptor = generateDescriptor('P2WSH', keys, {
				required: 2,
				sorted: true,
			});

			expect(descriptor).toContain('wsh(');
			expect(descriptor).toContain('sortedmulti(2,');
		});
	});

	describe('validateDescriptor', () => {
		it('should validate a correct descriptor', () => {
			const descriptor = `wpkh([abcd1234/84'/0'/0']${sampleXpub1})`;
			const result = validateDescriptor(descriptor);

			expect(result.valid).toBe(true);
			expect(result.errors.length).toBe(0);
		});

		it('should catch unbalanced parentheses', () => {
			const descriptor = 'wpkh([abcd1234]xpub...';
			const result = validateDescriptor(descriptor);

			expect(result.valid).toBe(false);
		});

		it('should catch invalid function names', () => {
			const descriptor = 'invalid(xpub...)';
			const result = validateDescriptor(descriptor);

			expect(result.valid).toBe(false);
		});

		it('should validate checksum length', () => {
			const descriptor = `wpkh([abcd1234]${sampleXpub1})#abc`;
			const result = validateDescriptor(descriptor);

			// Checksum should be 8 characters
			expect(result.errors.some((e) => e.includes('checksum'))).toBe(true);
		});
	});

	describe('describeDescriptor', () => {
		it('should describe a simple descriptor', () => {
			const descriptor = `wpkh([abcd1234/84'/0'/0']${sampleXpub1})`;
			const description = describeDescriptor(descriptor);

			expect(description).toContain('P2WPKH');
			expect(description).toContain('mainnet');
		});

		it('should describe a multisig descriptor', () => {
			const descriptor = `wsh(sortedmulti(2,[abcd1234/48'/0'/0'/2']${sampleXpub1},[ef125678/48'/0'/0'/2']${sampleXpub2}))`;
			const description = describeDescriptor(descriptor);

			expect(description).toContain('2-of-2');
			expect(description).toContain('multisig');
		});
	});

	describe('extractFingerprints', () => {
		it('should extract all fingerprints', () => {
			const descriptor = `wsh(sortedmulti(2,[abcd1234/48'/0'/0'/2']${sampleXpub1},[ef125678/48'/0'/0'/2']${sampleXpub2},[12349012/48'/0'/0'/2']${sampleXpub3}))`;
			const fingerprints = extractFingerprints(descriptor);

			expect(fingerprints).toContain('abcd1234');
			expect(fingerprints).toContain('ef125678');
			expect(fingerprints).toContain('12349012');
			expect(fingerprints.length).toBe(3);
		});
	});

	describe('hasFingerprint', () => {
		it('should find existing fingerprint', () => {
			const descriptor = `wpkh([abcd1234/84'/0'/0']${sampleXpub1})`;
			expect(hasFingerprint(descriptor, 'abcd1234')).toBe(true);
		});

		it('should not find non-existing fingerprint', () => {
			const descriptor = `wpkh([abcd1234/84'/0'/0']${sampleXpub1})`;
			expect(hasFingerprint(descriptor, 'xxxxxxxx')).toBe(false);
		});

		it('should be case insensitive', () => {
			const descriptor = `wpkh([ABCD1234/84'/0'/0']${sampleXpub1})`;
			expect(hasFingerprint(descriptor, 'abcd1234')).toBe(true);
		});
	});

	describe('deriveFromDescriptor', () => {
		it('should derive receive address', () => {
			const descriptor = `wpkh([abcd1234/84'/0'/0']${sampleXpub1}/0/*)`;
			const derived = deriveFromDescriptor(descriptor, 5, false);

			expect(derived).toContain('/0/5');
			expect(derived).not.toContain('/*');
		});

		it('should derive change address', () => {
			const descriptor = `wpkh([abcd1234/84'/0'/0']${sampleXpub1}/0/*)`;
			const derived = deriveFromDescriptor(descriptor, 3, true);

			expect(derived).toContain('/1/3');
		});
	});
});
