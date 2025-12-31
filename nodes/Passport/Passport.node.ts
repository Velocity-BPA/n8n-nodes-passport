/**
 * n8n-nodes-passport
 * Copyright (c) 2025 Velocity BPA
 *
 * Licensed under the Business Source License 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://mariadb.com/bsl11/
 *
 * Change Date: 2030-01-01
 * Change License: Apache License, Version 2.0
 *
 * NOTICE: This software is provided for evaluation, development, and
 * non-commercial use. Commercial use requires a separate license from
 * Velocity BPA. Contact licensing@velobpa.com for commercial licensing.
 */

import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';

// Import resource operations
import { deviceOperations, deviceFields, executeDevice } from './actions/device';
import { accountOperations, accountFields, executeAccount } from './actions/account';
import { addressOperations, addressFields, executeAddress } from './actions/address';
import { qrCodeOperations, qrCodeFields, executeQrCode } from './actions/qrCode';
import { sdCardOperations, sdCardFields, executeSdCard } from './actions/sdCard';
import { psbtOperations, psbtFields, executePsbt } from './actions/psbt';
import { transactionOperations, transactionFields, executeTransaction } from './actions/transaction';
import { messageSigningOperations, messageSigningFields, executeMessageSigning } from './actions/messageSigning';
import { multiSigOperations, multiSigFields, executeMultiSig } from './actions/multiSig';
import { watchOnlyOperations, watchOnlyFields, executeWatchOnly } from './actions/watchOnly';
import { envoyOperations, envoyFields, executeEnvoy } from './actions/envoy';
import { casaOperations, casaFields, executeCasa } from './actions/casa';
import { unchainedOperations, unchainedFields, executeUnchained } from './actions/unchained';
import { backupOperations, backupFields, executeBackup } from './actions/backup';
import { seedOperations, seedFields, executeSeed } from './actions/seed';
import { securityOperations, securityFields, executeSecurity } from './actions/security';
import { pinOperations, pinFields, executePin } from './actions/pin';
import { firmwareOperations, firmwareFields, executeFirmware } from './actions/firmware';
import { extensionsOperations, extensionsFields, executeExtensions } from './actions/extensions';
import { healthCheckOperations, healthCheckFields, executeHealthCheck } from './actions/healthCheck';
import { utilityOperations, utilityFields, executeUtility } from './actions/utility';

export class Passport implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Passport',
		name: 'passport',
		icon: 'file:passport.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Foundation Passport hardware wallet',
		defaults: {
			name: 'Passport',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'passportDevice',
				required: true,
			},
			{
				name: 'passportFile',
				required: false,
			},
			{
				name: 'bitcoinNetwork',
				required: false,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Account',
						value: 'account',
						description: 'Manage wallet accounts and export keys',
					},
					{
						name: 'Address',
						value: 'address',
						description: 'Generate and verify Bitcoin addresses',
					},
					{
						name: 'Backup',
						value: 'backup',
						description: 'Create and manage device backups',
					},
					{
						name: 'Casa',
						value: 'casa',
						description: 'Casa multisig integration',
					},
					{
						name: 'Device',
						value: 'device',
						description: 'Device information and status',
					},
					{
						name: 'Envoy',
						value: 'envoy',
						description: 'Envoy companion app integration',
					},
					{
						name: 'Extensions',
						value: 'extensions',
						description: 'Manage device extensions',
					},
					{
						name: 'Firmware',
						value: 'firmware',
						description: 'Firmware management and updates',
					},
					{
						name: 'Health Check',
						value: 'healthCheck',
						description: 'Device health diagnostics',
					},
					{
						name: 'Message Signing',
						value: 'messageSigning',
						description: 'Sign and verify messages',
					},
					{
						name: 'Multi-Signature',
						value: 'multiSig',
						description: 'Multi-signature wallet operations',
					},
					{
						name: 'PIN',
						value: 'pin',
						description: 'PIN management',
					},
					{
						name: 'PSBT',
						value: 'psbt',
						description: 'Partially signed Bitcoin transaction operations',
					},
					{
						name: 'QR Code',
						value: 'qrCode',
						description: 'QR code generation and parsing',
					},
					{
						name: 'SD Card',
						value: 'sdCard',
						description: 'MicroSD card file operations',
					},
					{
						name: 'Security',
						value: 'security',
						description: 'Security verification and checks',
					},
					{
						name: 'Seed',
						value: 'seed',
						description: 'Seed phrase management',
					},
					{
						name: 'Transaction',
						value: 'transaction',
						description: 'Bitcoin transaction operations',
					},
					{
						name: 'Unchained',
						value: 'unchained',
						description: 'Unchained Capital integration',
					},
					{
						name: 'Utility',
						value: 'utility',
						description: 'Utility functions and helpers',
					},
					{
						name: 'Watch-Only Export',
						value: 'watchOnly',
						description: 'Export watch-only wallet data',
					},
				],
				default: 'device',
			},
			// Device operations
			...deviceOperations,
			...deviceFields,
			// Account operations
			...accountOperations,
			...accountFields,
			// Address operations
			...addressOperations,
			...addressFields,
			// QR Code operations
			...qrCodeOperations,
			...qrCodeFields,
			// SD Card operations
			...sdCardOperations,
			...sdCardFields,
			// PSBT operations
			...psbtOperations,
			...psbtFields,
			// Transaction operations
			...transactionOperations,
			...transactionFields,
			// Message Signing operations
			...messageSigningOperations,
			...messageSigningFields,
			// Multi-Signature operations
			...multiSigOperations,
			...multiSigFields,
			// Watch-Only Export operations
			...watchOnlyOperations,
			...watchOnlyFields,
			// Envoy operations
			...envoyOperations,
			...envoyFields,
			// Casa operations
			...casaOperations,
			...casaFields,
			// Unchained operations
			...unchainedOperations,
			...unchainedFields,
			// Backup operations
			...backupOperations,
			...backupFields,
			// Seed operations
			...seedOperations,
			...seedFields,
			// Security operations
			...securityOperations,
			...securityFields,
			// PIN operations
			...pinOperations,
			...pinFields,
			// Firmware operations
			...firmwareOperations,
			...firmwareFields,
			// Extensions operations
			...extensionsOperations,
			...extensionsFields,
			// Health Check operations
			...healthCheckOperations,
			...healthCheckFields,
			// Utility operations
			...utilityOperations,
			...utilityFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		// Log BSL 1.1 notice (non-blocking, informational only)
		this.logger.warn(
			'n8n-nodes-passport is licensed under BSL 1.1. ' +
			'Commercial use requires a separate license from Velocity BPA. ' +
			'Contact licensing@velobpa.com for details.',
		);

		for (let i = 0; i < items.length; i++) {
			try {
				let result: INodeExecutionData[];

				switch (resource) {
					case 'device':
						result = await executeDevice.call(this, i, operation);
						break;
					case 'account':
						result = await executeAccount.call(this, i, operation);
						break;
					case 'address':
						result = await executeAddress.call(this, i, operation);
						break;
					case 'qrCode':
						result = await executeQrCode.call(this, i, operation);
						break;
					case 'sdCard':
						result = await executeSdCard.call(this, i, operation);
						break;
					case 'psbt':
						result = await executePsbt.call(this, i, operation);
						break;
					case 'transaction':
						result = await executeTransaction.call(this, i, operation);
						break;
					case 'messageSigning':
						result = await executeMessageSigning.call(this, i, operation);
						break;
					case 'multiSig':
						result = await executeMultiSig.call(this, i, operation);
						break;
					case 'watchOnly':
						result = await executeWatchOnly.call(this, i, operation);
						break;
					case 'envoy':
						result = await executeEnvoy.call(this, i, operation);
						break;
					case 'casa':
						result = await executeCasa.call(this, i, operation);
						break;
					case 'unchained':
						result = await executeUnchained.call(this, i, operation);
						break;
					case 'backup':
						result = await executeBackup.call(this, i, operation);
						break;
					case 'seed':
						result = await executeSeed.call(this, i, operation);
						break;
					case 'security':
						result = await executeSecurity.call(this, i, operation);
						break;
					case 'pin':
						result = await executePin.call(this, i, operation);
						break;
					case 'firmware':
						result = await executeFirmware.call(this, i, operation);
						break;
					case 'extensions':
						result = await executeExtensions.call(this, i, operation);
						break;
					case 'healthCheck':
						result = await executeHealthCheck.call(this, i, operation);
						break;
					case 'utility':
						result = await executeUtility.call(this, i, operation);
						break;
					default:
						throw new Error(`Unknown resource: ${resource}`);
				}

				returnData.push(...result);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
							resource,
							operation,
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
