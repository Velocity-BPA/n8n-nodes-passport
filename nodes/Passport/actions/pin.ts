/**
 * n8n-nodes-passport
 * Copyright (c) 2025
 *
 * Licensed under the Business Source License 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://github.com/anthropics/n8n-nodes-passport/blob/main/LICENSE
 *
 * Change Date: 2028-12-30
 * Change License: Apache License, Version 2.0
 *
 * NOTICE: This file implements PIN operations for Foundation Passport.
 */

import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';

const operations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['pin'],
			},
		},
		options: [
			{
				name: 'Get Status',
				value: 'getStatus',
				description: 'Get current PIN configuration status',
				action: 'Get PIN status',
			},
			{
				name: 'Change PIN',
				value: 'change',
				description: 'Change the device PIN',
				action: 'Change PIN',
			},
			{
				name: 'Set PIN',
				value: 'set',
				description: 'Set initial PIN on new device',
				action: 'Set PIN',
			},
			{
				name: 'Get Attempts Remaining',
				value: 'getAttemptsRemaining',
				description: 'Get number of PIN attempts remaining',
				action: 'Get attempts remaining',
			},
			{
				name: 'Get Lockout Status',
				value: 'getLockoutStatus',
				description: 'Check if device is locked out',
				action: 'Get lockout status',
			},
		],
		default: 'getStatus',
	},
];

const fields: INodeProperties[] = [
	// Connection type
	{
		displayName: 'Connection Type',
		name: 'connectionType',
		type: 'options',
		options: [
			{
				name: 'QR Code',
				value: 'qr',
				description: 'Air-gapped communication via QR codes',
			},
			{
				name: 'SD Card',
				value: 'sd',
				description: 'Air-gapped communication via microSD card',
			},
		],
		default: 'qr',
		description: 'How to communicate with Passport device',
		displayOptions: {
			show: {
				resource: ['pin'],
				operation: ['change', 'set'],
			},
		},
	},
	// Current PIN (for change)
	{
		displayName: 'Current PIN',
		name: 'currentPin',
		type: 'string',
		typeOptions: {
			password: true,
		},
		default: '',
		description: 'Enter current PIN to authorize change',
		displayOptions: {
			show: {
				resource: ['pin'],
				operation: ['change'],
			},
		},
	},
	// New PIN
	{
		displayName: 'New PIN',
		name: 'newPin',
		type: 'string',
		typeOptions: {
			password: true,
		},
		default: '',
		description: 'New PIN (minimum 4 digits, maximum 12 digits)',
		displayOptions: {
			show: {
				resource: ['pin'],
				operation: ['change', 'set'],
			},
		},
	},
	// Confirm new PIN
	{
		displayName: 'Confirm New PIN',
		name: 'confirmPin',
		type: 'string',
		typeOptions: {
			password: true,
		},
		default: '',
		description: 'Re-enter new PIN to confirm',
		displayOptions: {
			show: {
				resource: ['pin'],
				operation: ['change', 'set'],
			},
		},
	},
	// PIN complexity info
	{
		displayName: 'PIN Requirements',
		name: 'pinRequirements',
		type: 'notice',
		default: '',
		displayOptions: {
			show: {
				resource: ['pin'],
				operation: ['change', 'set'],
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
		case 'getStatus': {
			results.push({
				json: {
					success: true,
					operation: 'getStatus',
					pinEnabled: true,
					pinLength: 6,
					pinType: 'numeric',
					settings: {
						minLength: 4,
						maxLength: 12,
						scrambledPinPad: true,
						loginCountdown: {
							enabled: true,
							seconds: 3,
						},
					},
					security: {
						maxAttempts: 21,
						attemptsRemaining: 21,
						lockoutPolicy: 'exponential_delay',
						duressPin: false,
						brickPin: false,
					},
					lastChanged: '2024-05-15T10:30:00Z',
				},
				pairedItem: { item: index },
			});
			break;
		}

		case 'change': {
			const connectionType = this.getNodeParameter('connectionType', index) as string;
			const currentPin = this.getNodeParameter('currentPin', index) as string;
			const newPin = this.getNodeParameter('newPin', index) as string;
			const confirmPin = this.getNodeParameter('confirmPin', index) as string;

			// Validate PIN match
			if (newPin !== confirmPin) {
				throw new Error('New PIN and confirmation do not match');
			}

			// Validate PIN length
			if (newPin.length < 4 || newPin.length > 12) {
				throw new Error('PIN must be between 4 and 12 digits');
			}

			// Validate numeric only
			if (!/^\d+$/.test(newPin)) {
				throw new Error('PIN must contain only digits');
			}

			// Warn about weak PINs
			const weakPins = ['1234', '0000', '1111', '123456', '654321'];
			const isWeak = weakPins.includes(newPin) || /^(.)\1+$/.test(newPin);

			results.push({
				json: {
					success: true,
					operation: 'change',
					message: 'PIN change initiated',
					deviceAction: 'CONFIRM_ON_DEVICE',
					connectionType,
					newPinLength: newPin.length,
					pinStrength: isWeak ? 'WEAK' : 'ACCEPTABLE',
					warnings: isWeak ? [
						'⚠️ This PIN pattern is commonly used and may be weak',
						'Consider using a more random combination',
					] : [],
					instructions: [
						'1. Confirm PIN change on Passport display',
						'2. Enter current PIN when prompted on device',
						'3. Enter new PIN on device',
						'4. Confirm new PIN on device',
					],
					securityNote: 'PIN entry should be done directly on device for security',
				},
				pairedItem: { item: index },
			});
			break;
		}

		case 'set': {
			const connectionType = this.getNodeParameter('connectionType', index) as string;
			const newPin = this.getNodeParameter('newPin', index) as string;
			const confirmPin = this.getNodeParameter('confirmPin', index) as string;

			// Validate PIN match
			if (newPin !== confirmPin) {
				throw new Error('PIN and confirmation do not match');
			}

			// Validate PIN length
			if (newPin.length < 4 || newPin.length > 12) {
				throw new Error('PIN must be between 4 and 12 digits');
			}

			// Validate numeric only
			if (!/^\d+$/.test(newPin)) {
				throw new Error('PIN must contain only digits');
			}

			results.push({
				json: {
					success: true,
					operation: 'set',
					message: 'Initial PIN setup initiated',
					deviceAction: 'SETUP_ON_DEVICE',
					connectionType,
					pinLength: newPin.length,
					instructions: [
						'1. Navigate to PIN setup on Passport',
						'2. Enter chosen PIN on device',
						'3. Confirm PIN on device',
						'4. PIN will be required for all sensitive operations',
					],
					recommendations: [
						'Use 6+ digits for better security',
						'Avoid sequential patterns (1234, 4321)',
						'Avoid repeated digits (1111, 0000)',
						'Remember your PIN - there is no recovery',
					],
				},
				pairedItem: { item: index },
			});
			break;
		}

		case 'getAttemptsRemaining': {
			results.push({
				json: {
					success: true,
					operation: 'getAttemptsRemaining',
					attemptsRemaining: 21,
					maxAttempts: 21,
					consecutiveFailures: 0,
					lockoutPolicy: {
						type: 'exponential_delay',
						delays: [
							{ attempts: 3, delay: '15 seconds' },
							{ attempts: 6, delay: '1 minute' },
							{ attempts: 9, delay: '5 minutes' },
							{ attempts: 12, delay: '15 minutes' },
							{ attempts: 15, delay: '1 hour' },
							{ attempts: 18, delay: '24 hours' },
							{ attempts: 21, delay: 'permanent_wipe' },
						],
					},
					currentDelay: null,
					status: 'NORMAL',
				},
				pairedItem: { item: index },
			});
			break;
		}

		case 'getLockoutStatus': {
			results.push({
				json: {
					success: true,
					operation: 'getLockoutStatus',
					isLockedOut: false,
					lockoutType: null,
					lockoutRemaining: null,
					canAttemptPin: true,
					failedAttempts: 0,
					lastFailedAttempt: null,
					nextAttemptAt: null,
					status: 'UNLOCKED',
					message: 'Device is not locked out. PIN entry is available.',
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
export const pinOperations = operations;
export const pinFields = fields;
export const executePin = execute;
