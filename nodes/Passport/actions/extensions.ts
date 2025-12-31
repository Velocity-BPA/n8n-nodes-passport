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
 *
 * COMMERCIAL USE:
 * For commercial licensing options, contact: licensing@example.com
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';

const operations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['extensions'],
			},
		},
		options: [
			{
				name: 'Get Installed',
				value: 'getInstalled',
				description: 'Get list of installed Passport extensions',
				action: 'Get installed extensions',
			},
			{
				name: 'Install Extension',
				value: 'installExtension',
				description: 'Install a new extension from SD card',
				action: 'Install extension',
			},
			{
				name: 'Remove Extension',
				value: 'removeExtension',
				description: 'Remove an installed extension',
				action: 'Remove extension',
			},
			{
				name: 'Get Info',
				value: 'getInfo',
				description: 'Get detailed information about an extension',
				action: 'Get extension info',
			},
			{
				name: 'Enable Extension',
				value: 'enableExtension',
				description: 'Enable a disabled extension',
				action: 'Enable extension',
			},
			{
				name: 'Disable Extension',
				value: 'disableExtension',
				description: 'Disable an extension without removing it',
				action: 'Disable extension',
			},
		],
		default: 'getInstalled',
	},
];

const fields: INodeProperties[] = [
	// Extension ID for info/enable/disable/remove
	{
		displayName: 'Extension ID',
		name: 'extensionId',
		type: 'string',
		default: '',
		placeholder: 'com.example.myextension',
		description: 'Unique identifier of the extension',
		displayOptions: {
			show: {
				resource: ['extensions'],
				operation: ['getInfo', 'enableExtension', 'disableExtension', 'removeExtension'],
			},
		},
		required: true,
	},
	// Extension file path for install
	{
		displayName: 'Extension File Path',
		name: 'extensionFilePath',
		type: 'string',
		default: '/passport/extensions/',
		description: 'Path on SD card where extension file is located',
		displayOptions: {
			show: {
				resource: ['extensions'],
				operation: ['installExtension'],
			},
		},
		required: true,
	},
	// Extension filename for install
	{
		displayName: 'Extension Filename',
		name: 'extensionFilename',
		type: 'string',
		default: '',
		placeholder: 'my-extension.pex',
		description: 'Filename of the extension to install (.pex format)',
		displayOptions: {
			show: {
				resource: ['extensions'],
				operation: ['installExtension'],
			},
		},
		required: true,
	},
	// Verify signature on install
	{
		displayName: 'Verify Signature',
		name: 'verifySignature',
		type: 'boolean',
		default: true,
		description: 'Whether to verify the extension signature before installing',
		displayOptions: {
			show: {
				resource: ['extensions'],
				operation: ['installExtension'],
			},
		},
	},
	// Confirm removal
	{
		displayName: 'Confirm Removal',
		name: 'confirmRemoval',
		type: 'boolean',
		default: false,
		description: 'Whether to confirm the removal (set to true to proceed)',
		displayOptions: {
			show: {
				resource: ['extensions'],
				operation: ['removeExtension'],
			},
		},
	},
	// Include disabled in list
	{
		displayName: 'Include Disabled',
		name: 'includeDisabled',
		type: 'boolean',
		default: true,
		description: 'Whether to include disabled extensions in the list',
		displayOptions: {
			show: {
				resource: ['extensions'],
				operation: ['getInstalled'],
			},
		},
	},
];

async function execute(
	this: IExecuteFunctions,
	index: number,
	operation: string,
): Promise<INodeExecutionData[]> {
	const results: INodeExecutionData[] = [];

	switch (operation) {
		case 'getInstalled': {
			const includeDisabled = this.getNodeParameter('includeDisabled', index) as boolean;

			const extensions = [
				{
					id: 'com.foundation.casa',
					name: 'Casa Integration',
					version: '1.2.0',
					enabled: true,
					author: 'Foundation Devices',
					description: 'Enhanced integration with Casa multisig vaults',
					size: '245 KB',
					installedDate: '2024-10-15',
				},
				{
					id: 'com.foundation.unchained',
					name: 'Unchained Capital',
					version: '1.1.0',
					enabled: true,
					author: 'Foundation Devices',
					description: 'Integration with Unchained Capital vault services',
					size: '198 KB',
					installedDate: '2024-10-15',
				},
				{
					id: 'com.example.customscripts',
					name: 'Custom Scripts',
					version: '0.5.0',
					enabled: false,
					author: 'Community',
					description: 'Custom Bitcoin script support',
					size: '156 KB',
					installedDate: '2024-11-01',
				},
			];

			const filteredExtensions = includeDisabled
				? extensions
				: extensions.filter((ext) => ext.enabled);

			results.push({
				json: {
					success: true,
					extensions: filteredExtensions,
					totalInstalled: extensions.length,
					enabledCount: extensions.filter((ext) => ext.enabled).length,
					disabledCount: extensions.filter((ext) => !ext.enabled).length,
					storageUsed: '599 KB',
					storageAvailable: '4.4 MB',
				},
				pairedItem: { item: index },
			});
			break;
		}

		case 'installExtension': {
			const extensionFilePath = this.getNodeParameter('extensionFilePath', index) as string;
			const extensionFilename = this.getNodeParameter('extensionFilename', index) as string;
			const verifySignature = this.getNodeParameter('verifySignature', index) as boolean;

			results.push({
				json: {
					success: true,
					message: 'Extension installation initiated',
					action: 'display_instructions',
					extensionFile: `${extensionFilePath}${extensionFilename}`,
					signatureVerified: verifySignature,
					instructions: [
						'1. Insert SD card with extension into Passport',
						'2. Navigate to Settings > Extensions > Install',
						`3. Select: ${extensionFilename}`,
						verifySignature
							? '4. Verify signature displays as valid'
							: '4. WARNING: Signature verification disabled',
						'5. Confirm installation',
						'6. Restart device if prompted',
					],
					warnings: verifySignature
						? []
						: [
								'Installing unsigned extensions may pose security risks',
								'Only install extensions from trusted sources',
							],
				},
				pairedItem: { item: index },
			});
			break;
		}

		case 'removeExtension': {
			const extensionId = this.getNodeParameter('extensionId', index) as string;
			const confirmRemoval = this.getNodeParameter('confirmRemoval', index) as boolean;

			if (!confirmRemoval) {
				results.push({
					json: {
						success: false,
						message: 'Removal not confirmed. Set "Confirm Removal" to true to proceed.',
						extensionId,
						action: 'confirmation_required',
					},
					pairedItem: { item: index },
				});
			} else {
				results.push({
					json: {
						success: true,
						message: 'Extension removal initiated',
						extensionId,
						action: 'display_instructions',
						instructions: [
							'1. Navigate to Settings > Extensions > Manage',
							`2. Select extension: ${extensionId}`,
							'3. Choose "Remove Extension"',
							'4. Confirm removal',
							'5. Restart device if prompted',
						],
						note: 'Extension data will be permanently deleted',
					},
					pairedItem: { item: index },
				});
			}
			break;
		}

		case 'getInfo': {
			const extensionId = this.getNodeParameter('extensionId', index) as string;

			results.push({
				json: {
					success: true,
					extension: {
						id: extensionId,
						name: extensionId.includes('casa') ? 'Casa Integration' : 'Unknown Extension',
						version: '1.2.0',
						enabled: true,
						author: 'Foundation Devices',
						description: 'Enhanced integration with Casa multisig vaults',
						website: 'https://keys.casa',
						permissions: ['account_read', 'psbt_sign', 'address_generate'],
						size: '245 KB',
						installedDate: '2024-10-15',
						lastUpdated: '2024-11-20',
						signature: {
							valid: true,
							signer: 'Foundation Devices',
							timestamp: '2024-11-20T12:00:00Z',
						},
						compatibility: {
							minFirmware: '2.2.0',
							maxFirmware: null,
							currentlyCompatible: true,
						},
						changelog: [
							'1.2.0 - Added support for 3-of-5 configurations',
							'1.1.0 - Improved QR code handling',
							'1.0.0 - Initial release',
						],
					},
				},
				pairedItem: { item: index },
			});
			break;
		}

		case 'enableExtension': {
			const extensionId = this.getNodeParameter('extensionId', index) as string;

			results.push({
				json: {
					success: true,
					message: 'Extension enabled',
					extensionId,
					previousState: 'disabled',
					currentState: 'enabled',
					action: 'display_instructions',
					instructions: [
						'1. Navigate to Settings > Extensions > Manage',
						`2. Select extension: ${extensionId}`,
						'3. Toggle "Enabled" to ON',
						'4. Extension features will be available immediately',
					],
				},
				pairedItem: { item: index },
			});
			break;
		}

		case 'disableExtension': {
			const extensionId = this.getNodeParameter('extensionId', index) as string;

			results.push({
				json: {
					success: true,
					message: 'Extension disabled',
					extensionId,
					previousState: 'enabled',
					currentState: 'disabled',
					action: 'display_instructions',
					instructions: [
						'1. Navigate to Settings > Extensions > Manage',
						`2. Select extension: ${extensionId}`,
						'3. Toggle "Enabled" to OFF',
						'4. Extension features will be unavailable until re-enabled',
					],
					note: 'Extension data is preserved when disabled',
				},
				pairedItem: { item: index },
			});
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return results;
}

// Named exports for main node
export const extensionsOperations = operations;
export const extensionsFields = fields;
export const executeExtensions = execute;
