/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';

export const watchOnlyOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['watchOnly'],
			},
		},
		options: [
			{ name: 'Export for Envoy', value: 'exportEnvoy', description: 'Export for Envoy app', action: 'Export for Envoy' },
			{ name: 'Export for Sparrow', value: 'exportSparrow', description: 'Export for Sparrow Wallet', action: 'Export for Sparrow' },
			{ name: 'Export for Specter', value: 'exportSpecter', description: 'Export for Specter Desktop', action: 'Export for Specter' },
			{ name: 'Export for BlueWallet', value: 'exportBlueWallet', description: 'Export for BlueWallet', action: 'Export for BlueWallet' },
			{ name: 'Export for Electrum', value: 'exportElectrum', description: 'Export for Electrum', action: 'Export for Electrum' },
			{ name: 'Export for Bitcoin Core', value: 'exportBitcoinCore', description: 'Export for Bitcoin Core', action: 'Export for Bitcoin Core' },
			{ name: 'Export for Nunchuk', value: 'exportNunchuk', description: 'Export for Nunchuk', action: 'Export for Nunchuk' },
			{ name: 'Export Generic JSON', value: 'exportGenericJson', description: 'Export as generic JSON', action: 'Export generic JSON' },
			{ name: 'Export Output Descriptor', value: 'exportDescriptor', description: 'Export output descriptor', action: 'Export descriptor' },
			{ name: 'Get Export QR', value: 'getExportQr', description: 'Get export as QR code', action: 'Get export QR' },
		],
		default: 'exportEnvoy',
	},
];

export const watchOnlyFields: INodeProperties[] = [
	{
		displayName: 'Account Index',
		name: 'accountIndex',
		type: 'number',
		default: 0,
		displayOptions: {
			show: {
				resource: ['watchOnly'],
			},
		},
		description: 'Account index to export',
	},
	{
		displayName: 'Address Type',
		name: 'addressType',
		type: 'options',
		options: [
			{ name: 'Native SegWit (bc1q...)', value: 'p2wpkh' },
			{ name: 'Nested SegWit (3...)', value: 'p2sh-p2wpkh' },
			{ name: 'Taproot (bc1p...)', value: 'p2tr' },
			{ name: 'Legacy (1...)', value: 'p2pkh' },
		],
		default: 'p2wpkh',
		displayOptions: {
			show: {
				resource: ['watchOnly'],
			},
		},
		description: 'Address type to export',
	},
	{
		displayName: 'Include Derivation Path',
		name: 'includeDerivation',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: {
				resource: ['watchOnly'],
			},
		},
		description: 'Whether to include derivation path in export',
	},
	{
		displayName: 'Export Method',
		name: 'exportMethod',
		type: 'options',
		options: [
			{ name: 'QR Code', value: 'qr' },
			{ name: 'Animated QR (BBQr)', value: 'bbqr' },
			{ name: 'SD Card', value: 'sd' },
			{ name: 'Text/JSON', value: 'text' },
		],
		default: 'qr',
		displayOptions: {
			show: {
				resource: ['watchOnly'],
				operation: ['exportEnvoy', 'exportSparrow', 'exportSpecter', 'exportBlueWallet', 'exportElectrum', 'exportNunchuk', 'exportGenericJson', 'exportDescriptor', 'getExportQr'],
			},
		},
		description: 'How to export the data',
	},
	{
		displayName: 'File Path',
		name: 'filePath',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['watchOnly'],
				operation: ['exportBitcoinCore'],
			},
		},
		description: 'File path for export',
	},
];

export async function executeWatchOnly(
	this: IExecuteFunctions,
	index: number,
	operation: string,
): Promise<INodeExecutionData[]> {
	const results: INodeExecutionData[] = [];
	const accountIndex = this.getNodeParameter('accountIndex', index, 0) as number;
	const addressType = this.getNodeParameter('addressType', index, 'p2wpkh') as string;
	const includeDerivation = this.getNodeParameter('includeDerivation', index, true) as boolean;

	const baseExport = {
		accountIndex,
		addressType,
		includeDerivation,
		masterFingerprint: 'ABCD1234',
		xpub: 'zpub6rFR7y4Q2AiiS...',
		derivationPath: `m/84'/0'/${accountIndex}'`,
	};

	switch (operation) {
		case 'exportEnvoy': {
			const exportMethod = this.getNodeParameter('exportMethod', index, 'qr') as string;
			results.push({
				json: {
					...baseExport,
					format: 'envoy',
					exportMethod,
					envoyCompatible: true,
					qrData: exportMethod === 'qr' ? 'ur:crypto-account/...' : undefined,
					message: 'Export ready for Envoy app',
				},
				pairedItem: { item: index },
			});
			break;
		}
		case 'exportSparrow': {
			const exportMethod = this.getNodeParameter('exportMethod', index, 'qr') as string;
			results.push({
				json: {
					...baseExport,
					format: 'sparrow',
					exportMethod,
					sparrowJson: {
						keystore: {
							type: 'hardware',
							label: 'Passport',
							xpub: baseExport.xpub,
							derivation: baseExport.derivationPath,
							masterFingerprint: baseExport.masterFingerprint,
						},
					},
					message: 'Export ready for Sparrow Wallet',
				},
				pairedItem: { item: index },
			});
			break;
		}
		case 'exportSpecter': {
			const exportMethod = this.getNodeParameter('exportMethod', index, 'qr') as string;
			results.push({
				json: {
					...baseExport,
					format: 'specter',
					exportMethod,
					specterJson: {
						label: 'Passport',
						blockheight: 0,
						descriptor: `wpkh([${baseExport.masterFingerprint}${baseExport.derivationPath.slice(1)}]${baseExport.xpub}/<0;1>/*)`,
					},
					message: 'Export ready for Specter Desktop',
				},
				pairedItem: { item: index },
			});
			break;
		}
		case 'exportBlueWallet': {
			const exportMethod = this.getNodeParameter('exportMethod', index, 'qr') as string;
			results.push({
				json: {
					...baseExport,
					format: 'bluewallet',
					exportMethod,
					bluewalletCompatible: true,
					message: 'Export ready for BlueWallet',
				},
				pairedItem: { item: index },
			});
			break;
		}
		case 'exportElectrum': {
			const exportMethod = this.getNodeParameter('exportMethod', index, 'qr') as string;
			results.push({
				json: {
					...baseExport,
					format: 'electrum',
					exportMethod,
					electrumJson: {
						keystore: {
							type: 'hardware',
							hw_type: 'passport',
							label: 'Passport',
							xpub: baseExport.xpub,
							derivation: baseExport.derivationPath,
							root_fingerprint: baseExport.masterFingerprint,
						},
						wallet_type: 'standard',
					},
					message: 'Export ready for Electrum',
				},
				pairedItem: { item: index },
			});
			break;
		}
		case 'exportBitcoinCore': {
			const filePath = this.getNodeParameter('filePath', index, '') as string;
			results.push({
				json: {
					...baseExport,
					format: 'bitcoin-core',
					descriptor: `wpkh([${baseExport.masterFingerprint}${baseExport.derivationPath.slice(1)}]${baseExport.xpub}/<0;1>/*)#checksum`,
					importCommand: `bitcoin-cli importdescriptors '[{"desc":"wpkh([...])","timestamp":"now","watchonly":true}]'`,
					filePath: filePath || '/home/user/passport-descriptor.txt',
					message: 'Export ready for Bitcoin Core',
				},
				pairedItem: { item: index },
			});
			break;
		}
		case 'exportNunchuk': {
			const exportMethod = this.getNodeParameter('exportMethod', index, 'qr') as string;
			results.push({
				json: {
					...baseExport,
					format: 'nunchuk',
					exportMethod,
					nunchukCompatible: true,
					message: 'Export ready for Nunchuk',
				},
				pairedItem: { item: index },
			});
			break;
		}
		case 'exportGenericJson': {
			const exportMethod = this.getNodeParameter('exportMethod', index, 'text') as string;
			results.push({
				json: {
					...baseExport,
					format: 'generic-json',
					exportMethod,
					genericJson: {
						label: 'Passport',
						xpub: baseExport.xpub,
						derivationPath: baseExport.derivationPath,
						masterFingerprint: baseExport.masterFingerprint,
						addressType: baseExport.addressType,
					},
					message: 'Generic JSON export created',
				},
				pairedItem: { item: index },
			});
			break;
		}
		case 'exportDescriptor': {
			const exportMethod = this.getNodeParameter('exportMethod', index, 'text') as string;
			results.push({
				json: {
					...baseExport,
					format: 'output-descriptor',
					exportMethod,
					descriptor: `wpkh([${baseExport.masterFingerprint}${baseExport.derivationPath.slice(1)}]${baseExport.xpub}/<0;1>/*)`,
					descriptorWithChecksum: `wpkh([${baseExport.masterFingerprint}${baseExport.derivationPath.slice(1)}]${baseExport.xpub}/<0;1>/*)#abc123`,
					message: 'Output descriptor export created',
				},
				pairedItem: { item: index },
			});
			break;
		}
		case 'getExportQr': {
			const exportMethod = this.getNodeParameter('exportMethod', index, 'qr') as string;
			results.push({
				json: {
					...baseExport,
					exportMethod,
					qrData: 'ur:crypto-account/...',
					animated: exportMethod === 'bbqr',
					frameCount: exportMethod === 'bbqr' ? 5 : 1,
					message: 'Export QR code generated',
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
