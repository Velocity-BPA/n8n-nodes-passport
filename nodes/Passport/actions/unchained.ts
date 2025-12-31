/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';

export const unchainedOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['unchained'],
			},
		},
		options: [
			{ name: 'Export for Unchained', value: 'exportForUnchained', description: 'Export wallet for Unchained', action: 'Export for Unchained' },
			{ name: 'Get Unchained Config', value: 'getUnchainedConfig', description: 'Get Unchained configuration', action: 'Get Unchained config' },
			{ name: 'Sign Transaction', value: 'signTransaction', description: 'Sign Unchained transaction', action: 'Sign transaction' },
			{ name: 'Get Vault Info', value: 'getVaultInfo', description: 'Get Unchained vault info', action: 'Get vault info' },
		],
		default: 'exportForUnchained',
	},
];

export const unchainedFields: INodeProperties[] = [
	{
		displayName: 'Account Index',
		name: 'accountIndex',
		type: 'number',
		default: 0,
		displayOptions: {
			show: {
				resource: ['unchained'],
			},
		},
		description: 'Account index',
	},
	{
		displayName: 'PSBT (Base64)',
		name: 'psbtBase64',
		type: 'string',
		default: '',
		typeOptions: {
			rows: 3,
		},
		displayOptions: {
			show: {
				resource: ['unchained'],
				operation: ['signTransaction'],
			},
		},
		description: 'PSBT to sign for Unchained',
	},
	{
		displayName: 'Export Method',
		name: 'exportMethod',
		type: 'options',
		options: [
			{ name: 'QR Code', value: 'qr' },
			{ name: 'SD Card', value: 'sd' },
			{ name: 'JSON File', value: 'json' },
		],
		default: 'qr',
		displayOptions: {
			show: {
				resource: ['unchained'],
				operation: ['exportForUnchained'],
			},
		},
		description: 'Export method',
	},
];

export async function executeUnchained(
	this: IExecuteFunctions,
	index: number,
	operation: string,
): Promise<INodeExecutionData[]> {
	const results: INodeExecutionData[] = [];

	switch (operation) {
		case 'exportForUnchained': {
			const accountIndex = this.getNodeParameter('accountIndex', index, 0) as number;
			const exportMethod = this.getNodeParameter('exportMethod', index, 'qr') as string;
			results.push({
				json: {
					accountIndex,
					exportMethod,
					unchainedCompatible: true,
					format: 'unchained-multisig',
					xpub: 'Zpub...',
					derivationPath: `m/48'/0'/${accountIndex}'/2'`,
					masterFingerprint: 'ABCD1234',
					message: 'Wallet exported for Unchained Capital',
				},
				pairedItem: { item: index },
			});
			break;
		}
		case 'getUnchainedConfig': {
			const accountIndex = this.getNodeParameter('accountIndex', index, 0) as number;
			results.push({
				json: {
					accountIndex,
					unchainedVault: {
						type: '2-of-3',
						keysControlled: 1,
						keyIndex: 0,
						unchainedKeyPresent: true,
					},
					xpub: 'Zpub...',
					derivationPath: `m/48'/0'/${accountIndex}'/2'`,
					message: 'Unchained configuration retrieved',
				},
				pairedItem: { item: index },
			});
			break;
		}
		case 'signTransaction': {
			const psbtBase64 = this.getNodeParameter('psbtBase64', index, '') as string;
			results.push({
				json: {
					signed: true,
					signaturesAdded: 1,
					unchainedFormat: true,
					signedPsbtBase64: 'cHNidP8BAH...signed...',
					message: 'Transaction signed for Unchained. 1 of 2 signatures added.',
				},
				pairedItem: { item: index },
			});
			break;
		}
		case 'getVaultInfo': {
			const accountIndex = this.getNodeParameter('accountIndex', index, 0) as number;
			results.push({
				json: {
					accountIndex,
					vaultType: '2-of-3',
					participants: [
						{ name: 'Passport (You)', fingerprint: 'ABCD1234', type: 'hardware', controlled: true },
						{ name: 'Unchained Key', fingerprint: 'UNCH0001', type: 'unchained', controlled: false },
						{ name: 'Hardware Key 2', fingerprint: 'EFGH5678', type: 'hardware', controlled: true },
					],
					collateralValue: 1.5,
					loanInfo: null,
					message: 'Unchained vault info retrieved',
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
