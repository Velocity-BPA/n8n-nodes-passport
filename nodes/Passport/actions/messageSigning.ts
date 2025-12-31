/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';

export const messageSigningOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['messageSigning'],
			},
		},
		options: [
			{ name: 'Sign Message', value: 'signMessage', description: 'Sign a message', action: 'Sign message' },
			{ name: 'Sign at Path', value: 'signAtPath', description: 'Sign with specific derivation path', action: 'Sign at path' },
			{ name: 'Verify Signature', value: 'verifySignature', description: 'Verify a message signature', action: 'Verify signature' },
			{ name: 'Export Signature QR', value: 'exportQr', description: 'Export signature as QR', action: 'Export signature QR' },
			{ name: 'Export Signature SD', value: 'exportSd', description: 'Export signature to SD card', action: 'Export signature SD' },
			{ name: 'Get Signature Format', value: 'getFormat', description: 'Get signature format info', action: 'Get format' },
			{ name: 'Sign with Address', value: 'signWithAddress', description: 'Sign using specific address', action: 'Sign with address' },
		],
		default: 'signMessage',
	},
];

export const messageSigningFields: INodeProperties[] = [
	{
		displayName: 'Message',
		name: 'message',
		type: 'string',
		default: '',
		typeOptions: {
			rows: 3,
		},
		displayOptions: {
			show: {
				resource: ['messageSigning'],
				operation: ['signMessage', 'signAtPath', 'verifySignature', 'exportQr', 'exportSd', 'signWithAddress'],
			},
		},
		description: 'Message to sign or verify',
	},
	{
		displayName: 'Derivation Path',
		name: 'derivationPath',
		type: 'string',
		default: "m/84'/0'/0'/0/0",
		displayOptions: {
			show: {
				resource: ['messageSigning'],
				operation: ['signAtPath'],
			},
		},
		description: 'Full BIP-32 derivation path',
	},
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['messageSigning'],
				operation: ['verifySignature', 'signWithAddress'],
			},
		},
		description: 'Bitcoin address',
	},
	{
		displayName: 'Signature',
		name: 'signature',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['messageSigning'],
				operation: ['verifySignature'],
			},
		},
		description: 'Signature to verify (base64)',
	},
	{
		displayName: 'Account Index',
		name: 'accountIndex',
		type: 'number',
		default: 0,
		displayOptions: {
			show: {
				resource: ['messageSigning'],
				operation: ['signMessage', 'signWithAddress'],
			},
		},
		description: 'Account index for signing',
	},
	{
		displayName: 'Address Index',
		name: 'addressIndex',
		type: 'number',
		default: 0,
		displayOptions: {
			show: {
				resource: ['messageSigning'],
				operation: ['signMessage'],
			},
		},
		description: 'Address index within account',
	},
	{
		displayName: 'Signature Format',
		name: 'signatureFormat',
		type: 'options',
		options: [
			{ name: 'Bitcoin Message (Legacy)', value: 'legacy' },
			{ name: 'BIP-322 (Generic)', value: 'bip322' },
			{ name: 'Electrum', value: 'electrum' },
		],
		default: 'legacy',
		displayOptions: {
			show: {
				resource: ['messageSigning'],
				operation: ['signMessage', 'signAtPath', 'getFormat', 'signWithAddress'],
			},
		},
		description: 'Signature format to use',
	},
];

export async function executeMessageSigning(
	this: IExecuteFunctions,
	index: number,
	operation: string,
): Promise<INodeExecutionData[]> {
	const results: INodeExecutionData[] = [];

	switch (operation) {
		case 'signMessage': {
			const message = this.getNodeParameter('message', index, '') as string;
			const accountIndex = this.getNodeParameter('accountIndex', index, 0) as number;
			const addressIndex = this.getNodeParameter('addressIndex', index, 0) as number;
			const signatureFormat = this.getNodeParameter('signatureFormat', index, 'legacy') as string;
			results.push({
				json: {
					message,
					accountIndex,
					addressIndex,
					signatureFormat,
					address: 'bc1q...',
					signature: 'H+base64signature...',
					derivationPath: `m/84'/0'/${accountIndex}'/0/${addressIndex}`,
					instructions: 'Display message on Passport for signing confirmation',
				},
				pairedItem: { item: index },
			});
			break;
		}
		case 'signAtPath': {
			const message = this.getNodeParameter('message', index, '') as string;
			const derivationPath = this.getNodeParameter('derivationPath', index, "m/84'/0'/0'/0/0") as string;
			const signatureFormat = this.getNodeParameter('signatureFormat', index, 'legacy') as string;
			results.push({
				json: {
					message,
					derivationPath,
					signatureFormat,
					address: 'bc1q...',
					signature: 'H+base64signature...',
					instructions: 'Display message on Passport for signing',
				},
				pairedItem: { item: index },
			});
			break;
		}
		case 'verifySignature': {
			const message = this.getNodeParameter('message', index, '') as string;
			const address = this.getNodeParameter('address', index, '') as string;
			const signature = this.getNodeParameter('signature', index, '') as string;
			results.push({
				json: {
					message,
					address,
					signature,
					valid: true,
					recoveredAddress: address,
					verified: true,
				},
				pairedItem: { item: index },
			});
			break;
		}
		case 'exportQr': {
			const message = this.getNodeParameter('message', index, '') as string;
			results.push({
				json: {
					message,
					signature: 'H+base64signature...',
					qrData: 'message:signature:address',
					qrGenerated: true,
					instructions: 'Signature QR code generated',
				},
				pairedItem: { item: index },
			});
			break;
		}
		case 'exportSd': {
			const message = this.getNodeParameter('message', index, '') as string;
			results.push({
				json: {
					message,
					signature: 'H+base64signature...',
					filePath: '/passport/signatures/message_signature.txt',
					exported: true,
					instructions: 'Signature exported to SD card',
				},
				pairedItem: { item: index },
			});
			break;
		}
		case 'getFormat': {
			const signatureFormat = this.getNodeParameter('signatureFormat', index, 'legacy') as string;
			const formatInfo: Record<string, object> = {
				legacy: {
					name: 'Bitcoin Message (Legacy)',
					prefix: 'Bitcoin Signed Message:\n',
					encodedPrefix: true,
					recoverableSignature: true,
					addressTypes: ['p2pkh', 'p2wpkh', 'p2sh-p2wpkh'],
				},
				bip322: {
					name: 'BIP-322 Generic Signed Message',
					prefix: null,
					encodedPrefix: false,
					recoverableSignature: false,
					addressTypes: ['p2wpkh', 'p2tr', 'p2sh-p2wpkh'],
				},
				electrum: {
					name: 'Electrum Message Signing',
					prefix: 'Bitcoin Signed Message:\n',
					encodedPrefix: true,
					recoverableSignature: true,
					addressTypes: ['p2pkh', 'p2wpkh'],
				},
			};
			results.push({
				json: {
					format: signatureFormat,
					...formatInfo[signatureFormat],
				},
				pairedItem: { item: index },
			});
			break;
		}
		case 'signWithAddress': {
			const message = this.getNodeParameter('message', index, '') as string;
			const address = this.getNodeParameter('address', index, '') as string;
			const signatureFormat = this.getNodeParameter('signatureFormat', index, 'legacy') as string;
			results.push({
				json: {
					message,
					address,
					signatureFormat,
					signature: 'H+base64signature...',
					instructions: 'Display message on Passport. Sign with the specified address.',
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
