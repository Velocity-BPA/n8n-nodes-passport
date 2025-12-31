/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  ICredentialType,
  INodeProperties,
  ICredentialTestRequest,
} from 'n8n-workflow';

/**
 * Passport Device Credentials
 *
 * Configures connection method for Foundation Passport hardware wallet.
 * Passport is an air-gapped device - primary communication is via QR codes.
 *
 * Connection Methods:
 * - QR Code: Air-gapped, primary method - scan animated BBQr codes
 * - MicroSD Card: Transfer files via removable storage
 * - USB-C: Direct connection (Passport Batch 2 only)
 */
export class PassportDevice implements ICredentialType {
  name = 'passportDevice';
  displayName = 'Passport Device';
  documentationUrl = 'https://docs.foundation.xyz/passport';

  properties: INodeProperties[] = [
    {
      displayName: 'Connection Type',
      name: 'connectionType',
      type: 'options',
      options: [
        {
          name: 'QR Code (Air-Gapped)',
          value: 'qr',
          description: 'Primary air-gapped method using animated BBQr codes',
        },
        {
          name: 'MicroSD Card',
          value: 'sd',
          description: 'Transfer files via MicroSD card',
        },
        {
          name: 'USB-C (Batch 2 Only)',
          value: 'usb',
          description: 'Direct USB connection for Passport Batch 2',
        },
      ],
      default: 'qr',
      description: 'Method used to communicate with Passport device',
    },
    {
      displayName: 'QR Scan Method',
      name: 'qrScanMethod',
      type: 'options',
      options: [
        {
          name: 'Camera Capture',
          value: 'camera',
          description: 'Use connected camera to scan QR codes from Passport',
        },
        {
          name: 'Image Upload',
          value: 'upload',
          description: 'Upload QR code images or screenshots',
        },
        {
          name: 'Clipboard Paste',
          value: 'clipboard',
          description: 'Paste base64-encoded QR data from clipboard',
        },
      ],
      default: 'upload',
      displayOptions: {
        show: {
          connectionType: ['qr'],
        },
      },
      description: 'How to capture QR codes displayed by Passport',
    },
    {
      displayName: 'BBQr Frame Delay (ms)',
      name: 'bbqrFrameDelay',
      type: 'number',
      default: 200,
      displayOptions: {
        show: {
          connectionType: ['qr'],
        },
      },
      description: 'Delay between animated QR frames in milliseconds',
    },
    {
      displayName: 'SD Card Path',
      name: 'sdCardPath',
      type: 'string',
      default: '/media/passport',
      placeholder: '/media/passport or D:\\',
      displayOptions: {
        show: {
          connectionType: ['sd'],
        },
      },
      description: 'Mount point or drive letter for MicroSD card',
    },
    {
      displayName: 'USB Device Path',
      name: 'usbDevicePath',
      type: 'string',
      default: '/dev/ttyACM0',
      placeholder: '/dev/ttyACM0 or COM3',
      displayOptions: {
        show: {
          connectionType: ['usb'],
        },
      },
      description: 'USB serial device path (Passport Batch 2 only)',
    },
    {
      displayName: 'USB Baud Rate',
      name: 'usbBaudRate',
      type: 'number',
      default: 115200,
      displayOptions: {
        show: {
          connectionType: ['usb'],
        },
      },
      description: 'Serial baud rate for USB connection',
    },
    {
      displayName: 'Device Label',
      name: 'deviceLabel',
      type: 'string',
      default: '',
      placeholder: 'My Passport',
      description: 'Optional label to identify this Passport device',
    },
    {
      displayName: 'Envoy App Settings',
      name: 'envoySettings',
      type: 'collection',
      default: {},
      placeholder: 'Add Envoy Setting',
      options: [
        {
          displayName: 'Enable Envoy Sync',
          name: 'enableEnvoySync',
          type: 'boolean',
          default: false,
          description: 'Whether to sync with Foundation Envoy mobile app',
        },
        {
          displayName: 'Envoy API Endpoint',
          name: 'envoyApiEndpoint',
          type: 'string',
          default: 'https://api.foundation.xyz',
          description: 'Envoy API server endpoint',
        },
      ],
      description: 'Settings for Envoy mobile app integration',
    },
    {
      displayName: 'Security Options',
      name: 'securityOptions',
      type: 'collection',
      default: {},
      placeholder: 'Add Security Option',
      options: [
        {
          displayName: 'Verify Supply Chain',
          name: 'verifySupplyChain',
          type: 'boolean',
          default: true,
          description: 'Whether to verify device authenticity on connection',
        },
        {
          displayName: 'Check Firmware Signature',
          name: 'checkFirmwareSignature',
          type: 'boolean',
          default: true,
          description: 'Whether to verify firmware is signed by Foundation',
        },
        {
          displayName: 'Require Device Verification',
          name: 'requireDeviceVerification',
          type: 'boolean',
          default: false,
          description: 'Whether to require physical device verification for signing',
        },
      ],
      description: 'Security verification options',
    },
  ];

  // Credential test is limited for air-gapped devices
  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.envoySettings?.envoyApiEndpoint || "https://api.foundation.xyz"}}',
      url: '/health',
      method: 'GET',
      skipSslCertificateValidation: false,
    },
  };
}
