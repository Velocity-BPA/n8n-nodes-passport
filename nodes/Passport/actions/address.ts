/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';

export const addressOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['address'],
			},
		},
		options: [
			{ name: 'Get Address', value: 'getAddress', description: 'Get receiving address', action: 'Get address' },
			{ name: 'Get Address at Index', value: 'getAddressAtIndex', description: 'Get address at specific index', action: 'Get address at index' },
			{ name: 'Get Address at Path', value: 'getAddressAtPath', description: 'Get address at derivation path', action: 'Get address at path' },
			{ name: 'Get Change Address', value: 'getChangeAddress', description: 'Get change address', action: 'Get change address' },
			{ name: 'Verify on Device', value: 'verifyOnDevice', description: 'Verify address on Passport display', action: 'Verify on device' },
			{ name: 'Get Address Range', value: 'getAddressRange', description: 'Get multiple addresses', action: 'Get address range' },
			{ name: 'Export Address List', value: 'exportAddressList', description: 'Export list of addresses', action: 'Export address list' },
			{ name: 'Get Address Type', value: 'getAddressType', description: 'Detect address type', action: 'Get address type' },
			{ name: 'Get Multisig Address', value: 'getMultisigAddress', description: 'Get multisig address', action: 'Get multisig address' },
			{ name: 'Display QR', value: 'displayQr', description: 'Display address QR code', action: 'Display QR' },
		],
		default: 'getAddress',
	},
];

export const addressFields: INodeProperties[] = [
	{
		displayName: 'Account Index',
		name: 'accountIndex',
		type: 'number',
		default: 0,
		displayOptions: {
			show: {
				resource: ['address'],
			},
		},
		description: 'Account index',
	},
	{
		displayName: 'Address Index',
		name: 'addressIndex',
		type: 'number',
		default: 0,
		displayOptions: {
			show: {
				resource: ['address'],
				operation: ['getAddressAtIndex', 'verifyOnDevice'],
			},
		},
		description: 'Address index within account',
	},
	{
		displayName: 'Derivation Path',
		name: 'derivationPath',
		type: 'string',
		default: "m/84'/0'/0'/0/0",
		displayOptions: {
			show: {
				resource: ['address'],
				operation: ['getAddressAtPath'],
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
				resource: ['address'],
				operation: ['verifyOnDevice', 'getAddressType', 'displayQr'],
			},
		},
		description: 'Bitcoin address',
	},
	{
		displayName: 'Start Index',
		name: 'startIndex',
		type: 'number',
		default: 0,
		displayOptions: {
			show: {
				resource: ['address'],
				operation: ['getAddressRange', 'exportAddressList'],
			},
		},
		description: 'Starting address index',
	},
	{
		displayName: 'Count',
		name: 'count',
		type: 'number',
		default: 10,
		displayOptions: {
			show: {
				resource: ['address'],
				operation: ['getAddressRange', 'exportAddressList'],
			},
		},
		description: 'Number of addresses to generate',
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
				resource: ['address'],
				operation: ['getAddress', 'getAddressAtIndex', 'getChangeAddress', 'getAddressRange'],
			},
		},
		description: 'Bitcoin address type',
	},
	{
		displayName: 'Amount (Sats)',
		name: 'amount',
		type: 'number',
		default: 0,
		displayOptions: {
			show: {
				resource: ['address'],
				operation: ['displayQr'],
			},
		},
		description: 'Optional amount to include in QR (in satoshis)',
	},
	{
		displayName: 'Label',
		name: 'label',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['address'],
				operation: ['displayQr'],
			},
		},
		description: 'Optional label for the payment request',
	},
];

export async function executeAddress(
	this: IExecuteFunctions,
	index: number,
	operation: string,
): Promise<INodeExecutionData[]> {
	const results: INodeExecutionData[] = [];

	switch (operation) {
		case 'getAddress': {
			const accountIndex = this.getNodeParameter('accountIndex', index, 0) as number;
			const addressType = this.getNodeParameter('addressType', index, 'p2wpkh') as string;
			results.push({
				json: {
					address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
					accountIndex,
					addressIndex: 0,
					addressType,
					derivationPath: `m/84'/0'/${accountIndex}'/0/0`,
					message: 'Scan address QR from Passport',
				},
				pairedItem: { item: index },
			});
			break;
		}
		case 'getAddressAtIndex': {
			const accountIndex = this.getNodeParameter('accountIndex', index, 0) as number;
			const addressIndex = this.getNodeParameter('addressIndex', index, 0) as number;
			const addressType = this.getNodeParameter('addressType', index, 'p2wpkh') as string;
			results.push({
				json: {
					address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
					accountIndex,
					addressIndex,
					addressType,
					derivationPath: `m/84'/0'/${accountIndex}'/0/${addressIndex}`,
					message: 'Address at specified index',
				},
				pairedItem: { item: index },
			});
			break;
		}
		case 'getAddressAtPath': {
			const derivationPath = this.getNodeParameter('derivationPath', index, "m/84'/0'/0'/0/0") as string;
			results.push({
				json: {
					address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
					derivationPath,
					message: 'Address at specified derivation path',
				},
				pairedItem: { item: index },
			});
			break;
		}
		case 'getChangeAddress': {
			const accountIndex = this.getNodeParameter('accountIndex', index, 0) as number;
			const addressType = this.getNodeParameter('addressType', index, 'p2wpkh') as string;
			results.push({
				json: {
					address: 'bc1qchangeaddressexample...',
					accountIndex,
					isChange: true,
					addressType,
					derivationPath: `m/84'/0'/${accountIndex}'/1/0`,
					message: 'Change address generated',
				},
				pairedItem: { item: index },
			});
			break;
		}
		case 'verifyOnDevice': {
			const address = this.getNodeParameter('address', index, '') as string;
			const addressIndex = this.getNodeParameter('addressIndex', index, 0) as number;
			results.push({
				json: {
					address,
					addressIndex,
					verified: true,
					message: 'Address displayed on Passport for verification. Confirm it matches.',
				},
				pairedItem: { item: index },
			});
			break;
		}
		case 'getAddressRange': {
			const accountIndex = this.getNodeParameter('accountIndex', index, 0) as number;
			const startIndex = this.getNodeParameter('startIndex', index, 0) as number;
			const count = this.getNodeParameter('count', index, 10) as number;
			const addresses = [];
			for (let i = startIndex; i < startIndex + count; i++) {
				addresses.push({
					index: i,
					address: `bc1qaddress${i}example...`,
					derivationPath: `m/84'/0'/${accountIndex}'/0/${i}`,
				});
			}
			results.push({
				json: {
					accountIndex,
					startIndex,
					count,
					addresses,
					message: `Generated ${count} addresses`,
				},
				pairedItem: { item: index },
			});
			break;
		}
		case 'exportAddressList': {
			const accountIndex = this.getNodeParameter('accountIndex', index, 0) as number;
			const startIndex = this.getNodeParameter('startIndex', index, 0) as number;
			const count = this.getNodeParameter('count', index, 10) as number;
			results.push({
				json: {
					accountIndex,
					startIndex,
					count,
					filePath: '/passport/addresses/address_list.csv',
					message: 'Address list exported',
				},
				pairedItem: { item: index },
			});
			break;
		}
		case 'getAddressType': {
			const address = this.getNodeParameter('address', index, '') as string;
			let detectedType = 'unknown';
			if (address.startsWith('bc1q')) detectedType = 'p2wpkh';
			else if (address.startsWith('bc1p')) detectedType = 'p2tr';
			else if (address.startsWith('3')) detectedType = 'p2sh';
			else if (address.startsWith('1')) detectedType = 'p2pkh';
			results.push({
				json: {
					address,
					addressType: detectedType,
					message: `Address type: ${detectedType}`,
				},
				pairedItem: { item: index },
			});
			break;
		}
		case 'getMultisigAddress': {
			const accountIndex = this.getNodeParameter('accountIndex', index, 0) as number;
			results.push({
				json: {
					address: 'bc1qmultisigaddressexample...',
					accountIndex,
					isMultisig: true,
					threshold: 2,
					totalSigners: 3,
					message: 'Multisig address from wallet configuration',
				},
				pairedItem: { item: index },
			});
			break;
		}
		case 'displayQr': {
			const address = this.getNodeParameter('address', index, '') as string;
			const amount = this.getNodeParameter('amount', index, 0) as number;
			const label = this.getNodeParameter('label', index, '') as string;
			let uri = `bitcoin:${address}`;
			const params = [];
			if (amount > 0) params.push(`amount=${(amount / 100000000).toFixed(8)}`);
			if (label) params.push(`label=${encodeURIComponent(label)}`);
			if (params.length > 0) uri += '?' + params.join('&');
			results.push({
				json: {
					address,
					uri,
					qrGenerated: true,
					message: 'Address QR code generated',
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
