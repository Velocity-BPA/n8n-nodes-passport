/**
 * n8n-nodes-passport
 * Copyright (c) 2025
 *
 * Licensed under the Business Source License 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://github.com/anthropics/n8n-nodes-passport/blob/main/LICENSE
 *
 * Change Date: 2028-12-30
 * Change License: GNU General Public License v3.0 or later
 */

/**
 * Parsed output descriptor structure
 */
export interface ParsedDescriptor {
	type: DescriptorType;
	scriptType: ScriptType;
	keys: KeyOrigin[];
	isMultisig: boolean;
	multisigInfo?: {
		required: number;
		total: number;
		sorted: boolean;
	};
	isRanged: boolean;
	network: 'mainnet' | 'testnet';
	checksum?: string;
}

/**
 * Descriptor types
 */
export type DescriptorType =
	| 'pk'
	| 'pkh'
	| 'wpkh'
	| 'sh'
	| 'wsh'
	| 'tr'
	| 'multi'
	| 'sortedmulti'
	| 'combo'
	| 'addr'
	| 'raw';

/**
 * Script types
 */
export type ScriptType =
	| 'P2PK'
	| 'P2PKH'
	| 'P2WPKH'
	| 'P2SH'
	| 'P2SH-P2WPKH'
	| 'P2WSH'
	| 'P2SH-P2WSH'
	| 'P2TR'
	| 'unknown';

/**
 * Key origin information
 */
export interface KeyOrigin {
	fingerprint: string;
	derivationPath: string;
	publicKey: string;
	keyType: 'xpub' | 'ypub' | 'zpub' | 'tpub' | 'pubkey';
}

/**
 * Parse a Bitcoin output descriptor
 */
export function parseDescriptor(descriptor: string): ParsedDescriptor {
	// Remove whitespace
	const clean = descriptor.replace(/\s+/g, '');

	// Extract checksum if present
	let checksum: string | undefined;
	let body = clean;
	const checksumMatch = clean.match(/#([a-z0-9]{8})$/);
	if (checksumMatch) {
		checksum = checksumMatch[1];
		body = clean.slice(0, -9);
	}

	// Determine script type and parse
	const result: ParsedDescriptor = {
		type: 'pkh',
		scriptType: 'unknown',
		keys: [],
		isMultisig: false,
		isRanged: body.includes('/*'),
		network: determineNetwork(body),
		checksum,
	};

	// Parse based on outer wrapper
	if (body.startsWith('wpkh(')) {
		result.type = 'wpkh';
		result.scriptType = 'P2WPKH';
		result.keys = parseKeys(body.slice(5, -1));
	} else if (body.startsWith('pkh(')) {
		result.type = 'pkh';
		result.scriptType = 'P2PKH';
		result.keys = parseKeys(body.slice(4, -1));
	} else if (body.startsWith('sh(wpkh(')) {
		result.type = 'sh';
		result.scriptType = 'P2SH-P2WPKH';
		result.keys = parseKeys(body.slice(8, -2));
	} else if (body.startsWith('sh(wsh(')) {
		result.type = 'sh';
		result.scriptType = 'P2SH-P2WSH';
		result.isMultisig = true;
		parseMultisig(body.slice(7, -2), result);
	} else if (body.startsWith('wsh(')) {
		result.type = 'wsh';
		result.scriptType = 'P2WSH';
		result.isMultisig = true;
		parseMultisig(body.slice(4, -1), result);
	} else if (body.startsWith('tr(')) {
		result.type = 'tr';
		result.scriptType = 'P2TR';
		result.keys = parseKeys(body.slice(3, -1));
	} else if (body.startsWith('sh(')) {
		result.type = 'sh';
		result.scriptType = 'P2SH';
		parseMultisig(body.slice(3, -1), result);
	} else if (body.startsWith('pk(')) {
		result.type = 'pk';
		result.scriptType = 'P2PK';
		result.keys = parseKeys(body.slice(3, -1));
	} else if (body.startsWith('addr(')) {
		result.type = 'addr';
		result.scriptType = 'unknown';
	} else if (body.startsWith('raw(')) {
		result.type = 'raw';
		result.scriptType = 'unknown';
	}

	return result;
}

/**
 * Parse key expressions from descriptor body
 */
function parseKeys(body: string): KeyOrigin[] {
	const keys: KeyOrigin[] = [];

	// Match key origin format: [fingerprint/path]xpub/derivation
	// Use a pattern that handles keys separated by commas
	// Pattern: [8-char-hex/optional-path]xpub-key/optional-derivation
	const keyPattern = /\[([a-fA-F0-9]{8})((?:\/[\dh']+)+)?\]([xyztuvw]pub[a-zA-Z0-9]{80,120})(?:\/[\d*\/]*)?/g;
	let match;

	while ((match = keyPattern.exec(body)) !== null) {
		keys.push({
			fingerprint: match[1].toLowerCase(),
			derivationPath: match[2] ? `m${match[2]}` : 'm',
			publicKey: match[3],
			keyType: determineKeyType(match[3]),
		});
	}

	// Also check for bare keys without origin
	if (keys.length === 0) {
		const bareKeyMatch = body.match(/^([xyztuvw]pub[a-zA-Z0-9]{80,120})/);
		if (bareKeyMatch) {
			keys.push({
				fingerprint: '00000000',
				derivationPath: 'm',
				publicKey: bareKeyMatch[1],
				keyType: determineKeyType(bareKeyMatch[1]),
			});
		}
	}

	return keys;
}

/**
 * Parse multisig descriptor content
 */
function parseMultisig(body: string, result: ParsedDescriptor): void {
	const multiMatch = body.match(/^(sorted)?multi\((\d+),(.+)\)$/);
	if (!multiMatch) {
		result.isMultisig = false;
		return;
	}

	result.isMultisig = true;
	result.multisigInfo = {
		required: parseInt(multiMatch[2], 10),
		total: 0,
		sorted: !!multiMatch[1],
	};

	result.keys = parseKeys(multiMatch[3]);
	result.multisigInfo.total = result.keys.length;
}

/**
 * Determine key type from prefix
 */
function determineKeyType(key: string): KeyOrigin['keyType'] {
	if (key.startsWith('xpub') || key.startsWith('xprv')) return 'xpub';
	if (key.startsWith('ypub') || key.startsWith('yprv')) return 'ypub';
	if (key.startsWith('zpub') || key.startsWith('zprv')) return 'zpub';
	if (key.startsWith('tpub') || key.startsWith('tprv')) return 'tpub';
	return 'pubkey';
}

/**
 * Determine network from descriptor content
 */
function determineNetwork(body: string): 'mainnet' | 'testnet' {
	if (body.includes('tpub') || body.includes('upub') || body.includes('vpub')) {
		return 'testnet';
	}
	return 'mainnet';
}

/**
 * Generate a descriptor from components
 */
export function generateDescriptor(
	scriptType: ScriptType,
	keys: KeyOrigin[],
	multisigConfig?: { required: number; sorted: boolean },
): string {
	const keyStrings = keys.map((key) => {
		const path = key.derivationPath.replace('m', '').replace(/'/g, 'h');
		return `[${key.fingerprint}${path}]${key.publicKey}`;
	});

	if (multisigConfig && keys.length > 1) {
		const multiType = multisigConfig.sorted ? 'sortedmulti' : 'multi';
		const multiContent = `${multiType}(${multisigConfig.required},${keyStrings.join(',')})`;

		switch (scriptType) {
			case 'P2WSH':
				return `wsh(${multiContent})`;
			case 'P2SH-P2WSH':
				return `sh(wsh(${multiContent}))`;
			case 'P2SH':
				return `sh(${multiContent})`;
			default:
				return `wsh(${multiContent})`;
		}
	}

	const keyStr = keyStrings[0] || '';

	switch (scriptType) {
		case 'P2WPKH':
			return `wpkh(${keyStr})`;
		case 'P2PKH':
			return `pkh(${keyStr})`;
		case 'P2SH-P2WPKH':
			return `sh(wpkh(${keyStr}))`;
		case 'P2TR':
			return `tr(${keyStr})`;
		default:
			return `wpkh(${keyStr})`;
	}
}

/**
 * Validate descriptor syntax
 */
export function validateDescriptor(descriptor: string): { valid: boolean; errors: string[] } {
	const errors: string[] = [];

	// Check balanced parentheses
	let depth = 0;
	for (const char of descriptor) {
		if (char === '(') depth++;
		if (char === ')') depth--;
		if (depth < 0) {
			errors.push('Unbalanced parentheses: extra closing parenthesis');
			break;
		}
	}
	if (depth > 0) {
		errors.push('Unbalanced parentheses: missing closing parenthesis');
	}

	// Check for valid outer function
	const validFunctions = ['pk', 'pkh', 'wpkh', 'sh', 'wsh', 'tr', 'multi', 'sortedmulti', 'combo', 'addr', 'raw'];
	const outerMatch = descriptor.match(/^([a-z]+)\(/);
	if (!outerMatch || !validFunctions.includes(outerMatch[1])) {
		errors.push(`Invalid or missing descriptor function. Valid: ${validFunctions.join(', ')}`);
	}

	// Check for key origin format
	const keyOriginPattern = /\[[a-fA-F0-9]{8}[^\]]*\]/g;
	const brackets = descriptor.match(/\[[^\]]*\]/g) || [];
	for (const bracket of brackets) {
		if (!keyOriginPattern.test(bracket)) {
			// Reset regex
			keyOriginPattern.lastIndex = 0;
			if (!bracket.match(/^\[[a-fA-F0-9]{8}/)) {
				errors.push(`Invalid key origin format: ${bracket}. Expected [fingerprint/path]`);
			}
		}
		keyOriginPattern.lastIndex = 0;
	}

	// Check checksum if present
	const checksumMatch = descriptor.match(/#([a-z0-9]+)$/);
	if (checksumMatch && checksumMatch[1].length !== 8) {
		errors.push(`Invalid checksum length: expected 8 characters, got ${checksumMatch[1].length}`);
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}

/**
 * Get human-readable description of descriptor
 */
export function describeDescriptor(descriptor: string): string {
	const parsed = parseDescriptor(descriptor);

	let description = `${parsed.scriptType} `;

	if (parsed.isMultisig && parsed.multisigInfo) {
		description += `${parsed.multisigInfo.required}-of-${parsed.multisigInfo.total} multisig `;
		if (parsed.multisigInfo.sorted) {
			description += '(sorted) ';
		}
	}

	description += `on ${parsed.network}`;

	if (parsed.isRanged) {
		description += ' (ranged)';
	}

	if (parsed.keys.length > 0) {
		description += `\nKeys: ${parsed.keys.length}`;
		parsed.keys.forEach((key, i) => {
			description += `\n  ${i + 1}. ${key.fingerprint} @ ${key.derivationPath}`;
		});
	}

	return description;
}

/**
 * Extract fingerprints from descriptor
 */
export function extractFingerprints(descriptor: string): string[] {
	const parsed = parseDescriptor(descriptor);
	return parsed.keys.map((k) => k.fingerprint);
}

/**
 * Check if descriptor contains a specific fingerprint
 */
export function hasFingerprint(descriptor: string, fingerprint: string): boolean {
	const fingerprints = extractFingerprints(descriptor);
	return fingerprints.includes(fingerprint.toLowerCase());
}

/**
 * Add derivation suffix to ranged descriptor
 */
export function deriveFromDescriptor(descriptor: string, index: number, isChange: boolean = false): string {
	const changePath = isChange ? '1' : '0';
	return descriptor
		.replace('/0/*', `/${changePath}/${index}`)
		.replace('/*', `/${index}`);
}
