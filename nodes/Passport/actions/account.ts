/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';

export const accountOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['account'],
			},
		},
		options: [
			{ name: 'Get Account', value: 'getAccount', description: 'Get account information', action: 'Get account' },
			{ name: 'Get Fingerprint', value: 'getFingerprint', description: 'Get account fingerprint', action: 'Get fingerprint' },
			{ name: 'Get Xpub', value: 'getXpub', description: 'Get extended public key (xpub)', action: 'Get xpub' },
			{ name: 'Get Ypub', value: 'getYpub', description: 'Get ypub (BIP-49)', action: 'Get ypub' },
			{ name: 'Get Zpub', value: 'getZpub', description: 'Get zpub (BIP-84)', action: 'Get zpub' },
			{ name: 'Export QR', value: 'exportQr', description: 'Export account as QR code', action: 'Export QR' },
			{ name: 'Export to SD', value: 'exportSd', description: 'Export account to SD card', action: 'Export to SD' },
			{ name: 'Get Descriptors', value: 'getDescriptors', description: 'Get output descriptors', action: 'Get descriptors' },
			{ name: 'Get Derivation Path', value: 'getDerivationPath', description: 'Get account derivation path', action: 'Get derivation path' },
			{ name: 'Import to Envoy', value: 'importEnvoy', description: 'Import account to Envoy app', action: 'Import to Envoy' },
			{ name: 'List Accounts', value: 'listAccounts', description: 'List all accounts on device', action: 'List accounts' },
			{ name: 'Create Account', value: 'createAccount', description: 'Create new account', action: 'Create account' },
		],
		default: 'getAccount',
	},
];

export const accountFields: INodeProperties[] = [
	{
		displayName: 'Account Index',
		name: 'accountIndex',
		type: 'number',
		default: 0,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['getAccount', 'getXpub', 'getYpub', 'getZpub', 'exportQr', 'exportSd', 'getDescriptors', 'getDerivationPath'],
			},
		},
		description: 'Account index (0 = first account)',
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
				resource: ['account'],
				operation: ['getXpub', 'getYpub', 'getZpub', 'createAccount'],
			},
		},
		description: 'Bitcoin address type',
	},
	{
		displayName: 'Account Name',
		name: 'accountName',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['createAccount'],
			},
		},
		description: 'Name for the new account',
	},
	{
		displayName: 'Export Format',
		name: 'exportFormat',
		type: 'options',
		options: [
			{ name: 'Generic JSON', value: 'json' },
			{ name: 'Output Descriptor', value: 'descriptor' },
			{ name: 'Sparrow', value: 'sparrow' },
			{ name: 'Specter', value: 'specter' },
			{ name: 'Electrum', value: 'electrum' },
		],
		default: 'json',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['exportSd', 'exportQr'],
			},
		},
		description: 'Export format for account data',
	},
];

export async function executeAccount(
	this: IExecuteFunctions,
	index: number,
	operation: string,
): Promise<INodeExecutionData[]> {
	const results: INodeExecutionData[] = [];

	switch (operation) {
		case 'getAccount': {
			const accountIndex = this.getNodeParameter('accountIndex', index, 0) as number;
			results.push({
				json: {
					accountIndex,
					name: `Account ${accountIndex}`,
					addressType: 'Native SegWit',
					derivationPath: `m/84'/0'/${accountIndex}'`,
					masterFingerprint: 'ABCD1234',
					xpub: 'xpub6...',
					message: 'Scan account export QR from Passport',
				},
				pairedItem: { item: index },
			});
			break;
		}
		case 'getFingerprint': {
			results.push({
				json: {
					masterFingerprint: 'ABCD1234',
					message: 'Master fingerprint from device',
				},
				pairedItem: { item: index },
			});
			break;
		}
		case 'getXpub': {
			const accountIndex = this.getNodeParameter('accountIndex', index, 0) as number;
			results.push({
				json: {
					xpub: 'xpub6CUGRUonZSQ4TWtTMmzXdrXDtyPWKi...',
					derivationPath: `m/44'/0'/${accountIndex}'`,
					fingerprint: 'ABCD1234',
					message: 'Scan xpub QR from Passport',
				},
				pairedItem: { item: index },
			});
			break;
		}
		case 'getYpub': {
			const accountIndex = this.getNodeParameter('accountIndex', index, 0) as number;
			results.push({
				json: {
					ypub: 'ypub6Ww3iepA8NMhJ3qL...',
					derivationPath: `m/49'/0'/${accountIndex}'`,
					fingerprint: 'ABCD1234',
					message: 'Scan ypub QR from Passport',
				},
				pairedItem: { item: index },
			});
			break;
		}
		case 'getZpub': {
			const accountIndex = this.getNodeParameter('accountIndex', index, 0) as number;
			results.push({
				json: {
					zpub: 'zpub6rFR7y4Q2AiiS...',
					derivationPath: `m/84'/0'/${accountIndex}'`,
					fingerprint: 'ABCD1234',
					message: 'Scan zpub QR from Passport',
				},
				pairedItem: { item: index },
			});
			break;
		}
		case 'exportQr': {
			const accountIndex = this.getNodeParameter('accountIndex', index, 0) as number;
			const exportFormat = this.getNodeParameter('exportFormat', index, 'json') as string;
			results.push({
				json: {
					accountIndex,
					exportFormat,
					qrData: 'ur:crypto-account/...',
					animated: false,
					message: 'Account export QR generated',
				},
				pairedItem: { item: index },
			});
			break;
		}
		case 'exportSd': {
			const accountIndex = this.getNodeParameter('accountIndex', index, 0) as number;
			const exportFormat = this.getNodeParameter('exportFormat', index, 'json') as string;
			results.push({
				json: {
					accountIndex,
					exportFormat,
					filePath: '/passport/accounts/account_0.json',
					message: 'Account exported to SD card',
				},
				pairedItem: { item: index },
			});
			break;
		}
		case 'getDescriptors': {
			const accountIndex = this.getNodeParameter('accountIndex', index, 0) as number;
			results.push({
				json: {
					accountIndex,
					receiveDescriptor: `wpkh([ABCD1234/84'/0'/${accountIndex}']xpub.../0/*)`,
					changeDescriptor: `wpkh([ABCD1234/84'/0'/${accountIndex}']xpub.../1/*)`,
					message: 'Output descriptors from Passport',
				},
				pairedItem: { item: index },
			});
			break;
		}
		case 'getDerivationPath': {
			const accountIndex = this.getNodeParameter('accountIndex', index, 0) as number;
			results.push({
				json: {
					accountIndex,
					derivationPath: `m/84'/0'/${accountIndex}'`,
					purpose: 84,
					coinType: 0,
					account: accountIndex,
					message: 'Derivation path for account',
				},
				pairedItem: { item: index },
			});
			break;
		}
		case 'importEnvoy': {
			results.push({
				json: {
					success: true,
					envoyFormat: true,
					message: 'Scan the QR code with Envoy app to import account',
				},
				pairedItem: { item: index },
			});
			break;
		}
		case 'listAccounts': {
			results.push({
				json: {
					accounts: [
						{ index: 0, name: 'Account 0', addressType: 'Native SegWit' },
						{ index: 1, name: 'Account 1', addressType: 'Taproot' },
					],
					message: 'Accounts retrieved from device',
				},
				pairedItem: { item: index },
			});
			break;
		}
		case 'createAccount': {
			const accountName = this.getNodeParameter('accountName', index, '') as string;
			const addressType = this.getNodeParameter('addressType', index, 'p2wpkh') as string;
			results.push({
				json: {
					success: true,
					accountName: accountName || 'New Account',
					addressType,
					message: 'Account creation initiated on device',
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
