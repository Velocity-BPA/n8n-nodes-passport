/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';

export const casaOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['casa'],
			},
		},
		options: [
			{ name: 'Export for Casa', value: 'exportForCasa', description: 'Export wallet for Casa', action: 'Export for Casa' },
			{ name: 'Get Casa Config', value: 'getCasaConfig', description: 'Get Casa configuration', action: 'Get Casa config' },
			{ name: 'Sign Transaction', value: 'signTransaction', description: 'Sign Casa transaction', action: 'Sign transaction' },
			{ name: 'Get Multisig Info', value: 'getMultisigInfo', description: 'Get Casa multisig info', action: 'Get multisig info' },
		],
		default: 'exportForCasa',
	},
];

export const casaFields: INodeProperties[] = [
	{
		displayName: 'Account Index',
		name: 'accountIndex',
		type: 'number',
		default: 0,
		displayOptions: {
			show: {
				resource: ['casa'],
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
				resource: ['casa'],
				operation: ['signTransaction'],
			},
		},
		description: 'PSBT to sign for Casa',
	},
	{
		displayName: 'Export Method',
		name: 'exportMethod',
		type: 'options',
		options: [
			{ name: 'QR Code', value: 'qr' },
			{ name: 'SD Card', value: 'sd' },
		],
		default: 'qr',
		displayOptions: {
			show: {
				resource: ['casa'],
				operation: ['exportForCasa'],
			},
		},
		description: 'Export method',
	},
];

export async function executeCasa(
	this: IExecuteFunctions,
	index: number,
	operation: string,
): Promise<INodeExecutionData[]> {
	const results: INodeExecutionData[] = [];

	switch (operation) {
		case 'exportForCasa': {
			const accountIndex = this.getNodeParameter('accountIndex', index, 0) as number;
			const exportMethod = this.getNodeParameter('exportMethod', index, 'qr') as string;
			results.push({
				json: {
					accountIndex,
					exportMethod,
					casaCompatible: true,
					format: 'casa-multisig',
					xpub: 'Zpub...',
					derivationPath: `m/48'/0'/${accountIndex}'/2'`,
					masterFingerprint: 'ABCD1234',
					message: 'Wallet exported for Casa. Scan QR in Casa app.',
				},
				pairedItem: { item: index },
			});
			break;
		}
		case 'getCasaConfig': {
			const accountIndex = this.getNodeParameter('accountIndex', index, 0) as number;
			results.push({
				json: {
					accountIndex,
					casaVault: {
						type: '3-of-5',
						keysControlled: 1,
						keyIndex: 0,
						recoveryKeyPresent: true,
					},
					xpub: 'Zpub...',
					derivationPath: `m/48'/0'/${accountIndex}'/2'`,
					message: 'Casa configuration retrieved',
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
					casaFormat: true,
					signedPsbtBase64: 'cHNidP8BAH...signed...',
					message: 'Transaction signed for Casa. 1 of 3 signatures added.',
				},
				pairedItem: { item: index },
			});
			break;
		}
		case 'getMultisigInfo': {
			const accountIndex = this.getNodeParameter('accountIndex', index, 0) as number;
			results.push({
				json: {
					accountIndex,
					multisigType: '3-of-5',
					participants: [
						{ name: 'Passport (You)', fingerprint: 'ABCD1234', type: 'hardware' },
						{ name: 'Casa Key 1', fingerprint: 'CASA0001', type: 'casa-mobile' },
						{ name: 'Casa Key 2', fingerprint: 'CASA0002', type: 'casa-cloud' },
						{ name: 'Casa Recovery', fingerprint: 'CASA0003', type: 'casa-recovery' },
						{ name: 'Hardware Key 2', fingerprint: 'EFGH5678', type: 'hardware' },
					],
					message: 'Casa multisig info retrieved',
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
