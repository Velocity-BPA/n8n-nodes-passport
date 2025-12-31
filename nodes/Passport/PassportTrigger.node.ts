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

import type {
	IDataObject,
	INodeType,
	INodeTypeDescription,
	ITriggerFunctions,
	ITriggerResponse,
} from 'n8n-workflow';

export class PassportTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Passport Trigger',
		name: 'passportTrigger',
		icon: 'file:passport.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Trigger workflows on Passport device events',
		defaults: {
			name: 'Passport Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'passportDeviceApi',
				required: false,
				displayOptions: {
					show: {
						connectionType: ['usb'],
					},
				},
			},
		],
		properties: [
			{
				displayName: 'Connection Type',
				name: 'connectionType',
				type: 'options',
				options: [
					{
						name: 'File Watch (SD Card)',
						value: 'fileWatch',
						description: 'Watch for new files on SD card mount point',
					},
					{
						name: 'Manual Trigger',
						value: 'manual',
						description: 'Manually trigger when QR code is scanned',
					},
					{
						name: 'Webhook',
						value: 'webhook',
						description: 'Receive data via webhook from external app',
					},
					{
						name: 'USB (Batch 2 Only)',
						value: 'usb',
						description: 'Direct USB connection events (requires Batch 2 device)',
					},
				],
				default: 'fileWatch',
				description: 'How to detect Passport events',
			},
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				options: [
					{
						name: 'Signed PSBT Available',
						value: 'signedPsbt',
						description: 'Trigger when a signed PSBT is detected',
					},
					{
						name: 'New Backup Created',
						value: 'newBackup',
						description: 'Trigger when a new backup file is created',
					},
					{
						name: 'Signed Message Available',
						value: 'signedMessage',
						description: 'Trigger when a signed message is detected',
					},
					{
						name: 'Account Exported',
						value: 'accountExport',
						description: 'Trigger when account data is exported',
					},
					{
						name: 'Any File',
						value: 'anyFile',
						description: 'Trigger on any new file in watched directory',
					},
				],
				default: 'signedPsbt',
				description: 'Which event to trigger on',
			},
			{
				displayName: 'Watch Directory',
				name: 'watchDirectory',
				type: 'string',
				default: '/media/passport',
				placeholder: '/media/passport',
				description: 'Directory to watch for SD card files',
				displayOptions: {
					show: {
						connectionType: ['fileWatch'],
					},
				},
			},
			{
				displayName: 'File Pattern',
				name: 'filePattern',
				type: 'string',
				default: '',
				placeholder: '*.psbt',
				description: 'Glob pattern to match files (leave empty for event defaults)',
				displayOptions: {
					show: {
						connectionType: ['fileWatch'],
					},
				},
			},
			{
				displayName: 'Poll Interval',
				name: 'pollInterval',
				type: 'number',
				default: 5,
				description: 'How often to check for new files (in seconds)',
				displayOptions: {
					show: {
						connectionType: ['fileWatch'],
					},
				},
			},
			{
				displayName: 'Webhook Path',
				name: 'webhookPath',
				type: 'string',
				default: 'passport-webhook',
				placeholder: 'passport-webhook',
				description: 'The webhook path to listen on',
				displayOptions: {
					show: {
						connectionType: ['webhook'],
					},
				},
			},
			{
				displayName: 'Process File Contents',
				name: 'processContents',
				type: 'boolean',
				default: true,
				description: 'Whether to read and parse file contents',
				displayOptions: {
					show: {
						connectionType: ['fileWatch'],
					},
				},
			},
			{
				displayName: 'Delete After Processing',
				name: 'deleteAfterProcess',
				type: 'boolean',
				default: false,
				description: 'Whether to delete the file after processing',
				displayOptions: {
					show: {
						connectionType: ['fileWatch'],
					},
				},
			},
			{
				displayName: 'USB Notice',
				name: 'usbNotice',
				type: 'notice',
				default: '',
				displayOptions: {
					show: {
						connectionType: ['usb'],
					},
				},
				// eslint-disable-next-line n8n-nodes-base/node-param-default-wrong-for-fixed-collection
				description:
					'USB connection is only available on Passport Batch 2 devices. This reduces the air-gap security model. Use QR or SD card for maximum security.',
			},
		],
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const connectionType = this.getNodeParameter('connectionType') as string;
		const event = this.getNodeParameter('event') as string;

		// Get event-specific file patterns
		const defaultPatterns: Record<string, string> = {
			signedPsbt: '*.psbt',
			newBackup: '*.7z',
			signedMessage: '*.sig',
			accountExport: '*.json',
			anyFile: '*',
		};

		const manualTriggerFunction = async () => {
			// For manual triggers, emit sample data showing expected format
			const sampleData = getSampleEventData(event);
			this.emit([this.helpers.returnJsonArray([sampleData])]);
		};

		const closeFunction = async () => {
			// Cleanup function when workflow is deactivated
		};

		if (connectionType === 'manual') {
			return {
				manualTriggerFunction,
				closeFunction,
			};
		}

		if (connectionType === 'fileWatch') {
			const watchDirectory = this.getNodeParameter('watchDirectory') as string;
			const filePattern =
				(this.getNodeParameter('filePattern') as string) || defaultPatterns[event] || '*';
			const pollInterval = this.getNodeParameter('pollInterval') as number;
			const processContents = this.getNodeParameter('processContents') as boolean;
			const deleteAfterProcess = this.getNodeParameter('deleteAfterProcess') as boolean;

			// In production, this would set up file watching
			// For now, return manual trigger that simulates the file watch
			const executeTrigger = async () => {
				// Simulated file detection
				const eventData = {
					event,
					connectionType,
					watchDirectory,
					filePattern,
					pollInterval,
					file: {
						path: `${watchDirectory}/passport/signed/transaction-${Date.now()}.psbt`,
						name: `transaction-${Date.now()}.psbt`,
						size: 1234,
						modified: new Date().toISOString(),
					},
					processed: processContents,
					deleted: deleteAfterProcess,
					data: processContents ? getSampleEventData(event) : null,
				};

				this.emit([this.helpers.returnJsonArray([eventData])]);
			};

			return {
				manualTriggerFunction: executeTrigger,
				closeFunction,
			};
		}

		if (connectionType === 'webhook') {
			// Webhook mode - in production would register webhook endpoint
			return {
				manualTriggerFunction,
				closeFunction,
			};
		}

		if (connectionType === 'usb') {
			// USB mode - requires device connection
			return {
				manualTriggerFunction,
				closeFunction,
			};
		}

		return {
			manualTriggerFunction,
			closeFunction,
		};
	}
}

/**
 * Get sample event data based on event type
 */
function getSampleEventData(event: string): IDataObject {
	switch (event) {
		case 'signedPsbt':
			return {
				type: 'signedPsbt',
				psbt: {
					base64: 'cHNidP8BAH...', // Truncated sample
					txid: 'abc123...',
					complete: true,
					inputs: 1,
					outputs: 2,
					fee: 450,
					feeRate: 15.5,
				},
				device: {
					fingerprint: 'abcd1234',
					firmware: '2.3.0',
				},
				timestamp: new Date().toISOString(),
			};

		case 'newBackup':
			return {
				type: 'newBackup',
				backup: {
					filename: 'passport-backup-20241215.7z',
					encrypted: true,
					size: 2456,
					accounts: 3,
					includesSettings: true,
				},
				device: {
					fingerprint: 'abcd1234',
					firmware: '2.3.0',
				},
				timestamp: new Date().toISOString(),
			};

		case 'signedMessage':
			return {
				type: 'signedMessage',
				message: {
					original: 'Sample message to sign',
					signature: 'H/LpXjV...', // Truncated sample
					address: 'bc1q...',
					format: 'legacy',
				},
				device: {
					fingerprint: 'abcd1234',
					firmware: '2.3.0',
				},
				timestamp: new Date().toISOString(),
			};

		case 'accountExport':
			return {
				type: 'accountExport',
				account: {
					name: 'Primary Account',
					xpub: 'zpub6r...',
					fingerprint: 'abcd1234',
					derivationPath: "m/84'/0'/0'",
					addressType: 'P2WPKH',
					format: 'sparrow',
				},
				device: {
					fingerprint: 'abcd1234',
					firmware: '2.3.0',
				},
				timestamp: new Date().toISOString(),
			};

		case 'anyFile':
		default:
			return {
				type: 'file',
				file: {
					name: 'unknown-file.dat',
					path: '/passport/unknown-file.dat',
					size: 1024,
					extension: '.dat',
				},
				timestamp: new Date().toISOString(),
			};
	}
}
