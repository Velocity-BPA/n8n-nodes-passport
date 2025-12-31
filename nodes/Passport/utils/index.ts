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

export * from './psbtUtils';
export * from './qrUtils';

// Re-export multisigUtils with prefixes to avoid conflicts
export {
	parseBsms,
	generateBsms,
	generateDescriptor as generateMultisigDescriptor,
	parseDescriptor as parseMultisigDescriptor,
	validateMultisigConfig,
	generateSpecterFormat,
	generateColdcardFormat,
	generateNunchukFormat,
	getQuorumDescription,
} from './multisigUtils';

export type {
	MultisigConfig,
	CosignerInfo,
	BsmsDescriptor,
} from './multisigUtils';

// Re-export descriptorUtils (these are the primary descriptor functions)
export {
	parseDescriptor,
	generateDescriptor,
	validateDescriptor,
	describeDescriptor,
	extractFingerprints,
	hasFingerprint,
	deriveFromDescriptor,
} from './descriptorUtils';

export type {
	ParsedDescriptor,
	KeyOrigin,
	DescriptorType,
	ScriptType,
} from './descriptorUtils';
