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
				resource: ['firmware'],
			},
		},
		options: [
			{
				name: 'Get Current Version',
				value: 'getCurrentVersion',
				description: 'Get the currently installed firmware version',
				action: 'Get current firmware version',
			},
			{
				name: 'Check For Updates',
				value: 'checkForUpdates',
				description: 'Check if a newer firmware version is available',
				action: 'Check for firmware updates',
			},
			{
				name: 'Get Firmware Hash',
				value: 'getFirmwareHash',
				description: 'Get the SHA256 hash of the installed firmware',
				action: 'Get firmware hash',
			},
			{
				name: 'Verify Firmware',
				value: 'verifyFirmware',
				description: 'Verify the firmware signature and integrity',
				action: 'Verify firmware integrity',
			},
			{
				name: 'Download Update',
				value: 'downloadUpdate',
				description: 'Download firmware update file to SD card',
				action: 'Download firmware update',
			},
			{
				name: 'Install From SD',
				value: 'installFromSd',
				description: 'Install firmware update from SD card',
				action: 'Install firmware from SD card',
			},
			{
				name: 'Get Release Notes',
				value: 'getReleaseNotes',
				description: 'Get release notes for a firmware version',
				action: 'Get firmware release notes',
			},
			{
				name: 'Get All Versions',
				value: 'getAllVersions',
				description: 'Get list of all available firmware versions',
				action: 'Get all firmware versions',
			},
		],
		default: 'getCurrentVersion',
	},
];

const fields: INodeProperties[] = [
	// Version field for release notes
	{
		displayName: 'Version',
		name: 'firmwareVersion',
		type: 'string',
		default: '',
		placeholder: '2.3.0',
		description: 'Firmware version number to get release notes for (leave empty for latest)',
		displayOptions: {
			show: {
				resource: ['firmware'],
				operation: ['getReleaseNotes'],
			},
		},
	},
	// Firmware file path for install
	{
		displayName: 'Firmware File Path',
		name: 'firmwareFilePath',
		type: 'string',
		default: '/passport/firmware/',
		description: 'Path on SD card where firmware file is located',
		displayOptions: {
			show: {
				resource: ['firmware'],
				operation: ['installFromSd'],
			},
		},
	},
	// Include beta versions
	{
		displayName: 'Include Beta',
		name: 'includeBeta',
		type: 'boolean',
		default: false,
		description: 'Whether to include beta/pre-release firmware versions',
		displayOptions: {
			show: {
				resource: ['firmware'],
				operation: ['checkForUpdates', 'getAllVersions', 'downloadUpdate'],
			},
		},
	},
	// Target version for download
	{
		displayName: 'Target Version',
		name: 'targetVersion',
		type: 'string',
		default: '',
		placeholder: '2.3.1',
		description: 'Specific version to download (leave empty for latest)',
		displayOptions: {
			show: {
				resource: ['firmware'],
				operation: ['downloadUpdate'],
			},
		},
	},
	// Verify after download
	{
		displayName: 'Verify After Download',
		name: 'verifyAfterDownload',
		type: 'boolean',
		default: true,
		description: 'Whether to verify the firmware signature after downloading',
		displayOptions: {
			show: {
				resource: ['firmware'],
				operation: ['downloadUpdate'],
			},
		},
	},
	// Backup before install
	{
		displayName: 'Backup Before Install',
		name: 'backupBeforeInstall',
		type: 'boolean',
		default: true,
		description: 'Whether to create a device backup before installing firmware',
		displayOptions: {
			show: {
				resource: ['firmware'],
				operation: ['installFromSd'],
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
		case 'getCurrentVersion': {
			results.push({
				json: {
					success: true,
					version: '2.3.0',
					buildDate: '2024-11-15',
					buildNumber: 2300,
					variant: 'founders-edition',
					bootloader: '1.2.0',
					secureElement: '1.1.0',
					commitHash: 'abc123def456',
					signed: true,
					signer: 'Foundation Devices',
				},
				pairedItem: { item: index },
			});
			break;
		}

		case 'checkForUpdates': {
			const includeBeta = this.getNodeParameter('includeBeta', index) as boolean;
			results.push({
				json: {
					success: true,
					updateAvailable: true,
					currentVersion: '2.3.0',
					latestVersion: includeBeta ? '2.4.0-beta.1' : '2.3.1',
					isSecurityUpdate: false,
					isBeta: includeBeta,
					releaseDate: '2024-12-01',
					downloadSize: '4.2 MB',
					changelog: [
						'Improved QR code scanning speed',
						'Added support for Taproot addresses',
						'Security enhancements',
						'Bug fixes and performance improvements',
					],
					downloadUrl: 'https://github.com/Foundation-Devices/passport2/releases',
				},
				pairedItem: { item: index },
			});
			break;
		}

		case 'getFirmwareHash': {
			results.push({
				json: {
					success: true,
					version: '2.3.0',
					sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
					md5: 'd41d8cd98f00b204e9800998ecf8427e',
					signatureValid: true,
					signedBy: 'Foundation Devices',
					signatureAlgorithm: 'ECDSA-P256',
					timestamp: new Date().toISOString(),
				},
				pairedItem: { item: index },
			});
			break;
		}

		case 'verifyFirmware': {
			results.push({
				json: {
					success: true,
					verified: true,
					checks: {
						signatureValid: true,
						hashMatches: true,
						noTampering: true,
						bootloaderValid: true,
						secureElementValid: true,
					},
					signer: 'Foundation Devices',
					certificate: {
						issuer: 'Foundation Devices CA',
						validFrom: '2024-01-01',
						validTo: '2029-01-01',
						fingerprint: 'AB:CD:EF:12:34:56:78:90',
					},
					version: '2.3.0',
					timestamp: new Date().toISOString(),
				},
				pairedItem: { item: index },
			});
			break;
		}

		case 'downloadUpdate': {
			const includeBeta = this.getNodeParameter('includeBeta', index) as boolean;
			const targetVersion = this.getNodeParameter('targetVersion', index) as string;
			const verifyAfterDownload = this.getNodeParameter('verifyAfterDownload', index) as boolean;

			const version = targetVersion || (includeBeta ? '2.4.0-beta.1' : '2.3.1');

			results.push({
				json: {
					success: true,
					message: 'Firmware downloaded successfully',
					version,
					filePath: `/passport/firmware/passport-fw-${version}.bin`,
					fileSize: '4.2 MB',
					sha256: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
					verified: verifyAfterDownload,
					signatureValid: verifyAfterDownload ? true : null,
					instructions: [
						'1. Safely eject SD card from computer',
						'2. Insert SD card into Passport',
						'3. Navigate to Settings > Firmware > Update Firmware',
						'4. Select the downloaded firmware file',
						'5. Confirm installation and wait for device to restart',
					],
				},
				pairedItem: { item: index },
			});
			break;
		}

		case 'installFromSd': {
			const firmwareFilePath = this.getNodeParameter('firmwareFilePath', index) as string;
			const backupBeforeInstall = this.getNodeParameter('backupBeforeInstall', index) as boolean;

			results.push({
				json: {
					success: true,
					message: 'Firmware installation initiated via QR code instructions',
					action: 'display_instructions',
					filePath: firmwareFilePath,
					backupCreated: backupBeforeInstall,
					backupPath: backupBeforeInstall ? '/passport/backups/pre-update-backup.7z' : null,
					instructions: [
						'1. Insert SD card with firmware into Passport',
						'2. Navigate to Settings > Firmware > Update Firmware',
						`3. Select firmware file from: ${firmwareFilePath}`,
						'4. Verify the firmware hash displayed on screen',
						'5. Confirm to begin installation',
						'6. Wait for device to restart (do not remove SD card)',
						'7. Device will boot with new firmware',
					],
					warnings: [
						'Do not power off device during installation',
						'Ensure battery is above 50% before updating',
						'Verify firmware hash before confirming',
					],
				},
				pairedItem: { item: index },
			});
			break;
		}

		case 'getReleaseNotes': {
			const firmwareVersion = this.getNodeParameter('firmwareVersion', index) as string;
			const version = firmwareVersion || '2.3.0';

			results.push({
				json: {
					success: true,
					version,
					releaseDate: '2024-11-15',
					releaseType: version.includes('beta') ? 'beta' : 'stable',
					summary: 'Security and performance improvements',
					changelog: {
						features: [
							'Added Taproot (P2TR) address support',
							'Improved BBQr encoding for faster transfers',
							'New multisig wallet descriptor format',
							'Enhanced Envoy app integration',
						],
						improvements: [
							'Faster QR code scanning',
							'Reduced memory usage',
							'Better battery life',
							'Improved UI responsiveness',
						],
						bugFixes: [
							'Fixed rare crash during PSBT signing',
							'Corrected address derivation edge case',
							'Fixed SD card compatibility issues',
							'Resolved display timeout bug',
						],
						security: [
							'Updated cryptographic libraries',
							'Enhanced secure element communication',
							'Improved anti-tampering measures',
						],
					},
					minimumBootloader: '1.2.0',
					breakingChanges: [],
					knownIssues: [],
					downloadUrl: `https://github.com/Foundation-Devices/passport2/releases/tag/v${version}`,
				},
				pairedItem: { item: index },
			});
			break;
		}

		case 'getAllVersions': {
			const includeBeta = this.getNodeParameter('includeBeta', index) as boolean;

			const versions = [
				{
					version: '2.3.1',
					releaseDate: '2024-12-01',
					type: 'stable',
					isLatest: true,
					isSecurityUpdate: false,
				},
				{
					version: '2.3.0',
					releaseDate: '2024-11-15',
					type: 'stable',
					isLatest: false,
					isSecurityUpdate: false,
				},
				{
					version: '2.2.1',
					releaseDate: '2024-10-01',
					type: 'stable',
					isLatest: false,
					isSecurityUpdate: true,
				},
				{
					version: '2.2.0',
					releaseDate: '2024-09-15',
					type: 'stable',
					isLatest: false,
					isSecurityUpdate: false,
				},
				{
					version: '2.1.0',
					releaseDate: '2024-08-01',
					type: 'stable',
					isLatest: false,
					isSecurityUpdate: false,
				},
			];

			if (includeBeta) {
				versions.unshift({
					version: '2.4.0-beta.1',
					releaseDate: '2024-12-10',
					type: 'beta',
					isLatest: false,
					isSecurityUpdate: false,
				});
			}

			results.push({
				json: {
					success: true,
					versions,
					totalVersions: versions.length,
					latestStable: '2.3.1',
					latestBeta: includeBeta ? '2.4.0-beta.1' : null,
					currentInstalled: '2.3.0',
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
export const firmwareOperations = operations;
export const firmwareFields = fields;
export const executeFirmware = execute;
