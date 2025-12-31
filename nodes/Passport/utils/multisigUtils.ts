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
 * Multisig wallet configuration interface
 */
export interface MultisigConfig {
	name: string;
	requiredSignatures: number;
	totalSigners: number;
	addressType: 'P2WSH' | 'P2SH-P2WSH' | 'P2SH';
	cosigners: CosignerInfo[];
	derivationPath: string;
}

/**
 * Cosigner information
 */
export interface CosignerInfo {
	name: string;
	fingerprint: string;
	xpub: string;
	derivationPath: string;
}

/**
 * BSMS (Bitcoin Secure Multisig Setup) descriptor
 */
export interface BsmsDescriptor {
	version: string;
	token: string;
	descriptor: string;
	name: string;
}

/**
 * Parse a BSMS format file content
 */
export function parseBsms(content: string): BsmsDescriptor {
	const lines = content.trim().split('\n');

	if (lines.length < 3) {
		throw new Error('Invalid BSMS format: insufficient lines');
	}

	// BSMS format:
	// Line 1: BSMS <version>
	// Line 2: Descriptor template or /token/ for rounds
	// Line 3+: Descriptor or metadata

	const versionMatch = lines[0].match(/^BSMS\s+(\d+\.\d+)$/);
	if (!versionMatch) {
		throw new Error('Invalid BSMS format: missing version header');
	}

	return {
		version: versionMatch[1],
		token: lines[1].startsWith('/') ? lines[1].slice(1, -1) : '',
		descriptor: lines.slice(2).join('\n'),
		name: extractNameFromDescriptor(lines.slice(2).join('\n')),
	};
}

/**
 * Generate BSMS format from multisig config
 */
export function generateBsms(config: MultisigConfig): string {
	const descriptor = generateDescriptor(config);

	const lines = ['BSMS 1.0', '', descriptor, `/No path restrictions/`, config.name];

	return lines.join('\n');
}

/**
 * Generate an output descriptor from multisig config
 */
export function generateDescriptor(config: MultisigConfig): string {
	const sortedCosigners = [...config.cosigners].sort((a, b) =>
		a.fingerprint.localeCompare(b.fingerprint),
	);

	const keyExpressions = sortedCosigners.map((cosigner) => {
		return `[${cosigner.fingerprint}${cosigner.derivationPath.replace('m', '')}]${cosigner.xpub}/0/*`;
	});

	const multiPart = `sortedmulti(${config.requiredSignatures},${keyExpressions.join(',')})`;

	switch (config.addressType) {
		case 'P2WSH':
			return `wsh(${multiPart})`;
		case 'P2SH-P2WSH':
			return `sh(wsh(${multiPart}))`;
		case 'P2SH':
			return `sh(${multiPart})`;
		default:
			return `wsh(${multiPart})`;
	}
}

/**
 * Parse a descriptor to extract multisig info
 */
export function parseDescriptor(descriptor: string): MultisigConfig | null {
	// Match sortedmulti or multi pattern
	const multiMatch = descriptor.match(/(?:sorted)?multi\((\d+),(.+)\)/);
	if (!multiMatch) {
		return null;
	}

	const requiredSignatures = parseInt(multiMatch[1], 10);
	const keysSection = multiMatch[2];

	// Split keys section by comma, but respect brackets
	const cosigners: CosignerInfo[] = [];
	
	// Match individual key expressions: [fingerprint/path]xpub/derivation
	// Use a more precise pattern that matches each key individually
	const keyRegex = /\[([a-fA-F0-9]{8})([^\]]*)\]([xyztuvw]pub[a-zA-Z0-9]+)(?:\/[\d\*\/]+)?/g;
	
	let match;
	while ((match = keyRegex.exec(keysSection)) !== null) {
		cosigners.push({
			name: `Cosigner ${cosigners.length + 1}`,
			fingerprint: match[1],
			derivationPath: match[2] ? `m${match[2]}` : 'm',
			xpub: match[3],
		});
	}

	// Determine address type
	let addressType: 'P2WSH' | 'P2SH-P2WSH' | 'P2SH' = 'P2WSH';
	if (descriptor.startsWith('sh(wsh(')) {
		addressType = 'P2SH-P2WSH';
	} else if (descriptor.startsWith('sh(') && !descriptor.includes('wsh(')) {
		addressType = 'P2SH';
	}

	return {
		name: '',
		requiredSignatures,
		totalSigners: cosigners.length,
		addressType,
		cosigners,
		derivationPath: cosigners[0]?.derivationPath || "m/48'/0'/0'/2'",
	};
}

/**
 * Validate multisig configuration
 */
export function validateMultisigConfig(config: MultisigConfig): { valid: boolean; errors: string[] } {
	const errors: string[] = [];

	if (config.requiredSignatures < 1) {
		errors.push('Required signatures must be at least 1');
	}

	if (config.requiredSignatures > config.totalSigners) {
		errors.push('Required signatures cannot exceed total signers');
	}

	if (config.totalSigners < 2) {
		errors.push('Multisig requires at least 2 signers');
	}

	if (config.totalSigners > 15) {
		errors.push('Maximum 15 signers supported');
	}

	if (config.cosigners.length !== config.totalSigners) {
		errors.push(`Expected ${config.totalSigners} cosigners, got ${config.cosigners.length}`);
	}

	// Validate each cosigner
	const fingerprints = new Set<string>();
	for (const cosigner of config.cosigners) {
		if (!/^[a-fA-F0-9]{8}$/.test(cosigner.fingerprint)) {
			errors.push(`Invalid fingerprint for ${cosigner.name}: ${cosigner.fingerprint}`);
		}

		if (fingerprints.has(cosigner.fingerprint)) {
			errors.push(`Duplicate fingerprint: ${cosigner.fingerprint}`);
		}
		fingerprints.add(cosigner.fingerprint);

		if (!cosigner.xpub.match(/^[xyztuvw]pub[a-zA-Z0-9]{100,115}$/)) {
			errors.push(`Invalid xpub for ${cosigner.name}`);
		}
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}

/**
 * Generate Specter Desktop wallet format
 */
export function generateSpecterFormat(config: MultisigConfig): object {
	return {
		label: config.name,
		blockheight: 0,
		descriptor: generateDescriptor(config),
		devices: config.cosigners.map((cosigner) => ({
			type: 'other',
			label: cosigner.name,
			fingerprint: cosigner.fingerprint,
		})),
	};
}

/**
 * Generate Coldcard multisig format
 */
export function generateColdcardFormat(config: MultisigConfig): string {
	const lines = [
		`# Coldcard Multisig setup file`,
		`#`,
		`Name: ${config.name}`,
		`Policy: ${config.requiredSignatures} of ${config.totalSigners}`,
		``,
		`Derivation: ${config.derivationPath}`,
		`Format: ${config.addressType}`,
		``,
	];

	config.cosigners.forEach((cosigner, index) => {
		lines.push(`# Cosigner ${index + 1}: ${cosigner.name}`);
		lines.push(`${cosigner.fingerprint}: ${cosigner.xpub}`);
		lines.push('');
	});

	return lines.join('\n');
}

/**
 * Generate Nunchuk wallet format
 */
export function generateNunchukFormat(config: MultisigConfig): object {
	return {
		id: `ms_${Date.now()}`,
		name: config.name,
		m: config.requiredSignatures,
		n: config.totalSigners,
		address_type: config.addressType.toLowerCase(),
		is_escrow: false,
		signers: config.cosigners.map((cosigner) => ({
			master_fingerprint: cosigner.fingerprint,
			derivation_path: cosigner.derivationPath,
			xpub: cosigner.xpub,
			name: cosigner.name,
			type: 'hardware',
		})),
	};
}

/**
 * Extract wallet name from descriptor (if present)
 */
function extractNameFromDescriptor(descriptor: string): string {
	// Look for name comment
	const nameMatch = descriptor.match(/Name:\s*(.+)/i);
	if (nameMatch) {
		return nameMatch[1].trim();
	}
	return 'Imported Multisig';
}

/**
 * Calculate the quorum description
 */
export function getQuorumDescription(required: number, total: number): string {
	const descriptions: Record<string, string> = {
		'2-3': 'Standard collaborative custody (2-of-3)',
		'3-5': 'Enhanced security setup (3-of-5)',
		'2-2': 'Dual signature required (2-of-2)',
		'1-2': 'Convenience with backup (1-of-2)',
	};

	const key = `${required}-${total}`;
	return descriptions[key] || `Custom setup (${required}-of-${total})`;
}
