/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { ICredentialType, INodeProperties } from 'n8n-workflow';

/**
 * Passport File Credentials
 *
 * Configures file handling for Passport data import/export operations.
 * Used for PSBT files, backup files, export data, and QR code images.
 */
export class PassportFile implements ICredentialType {
  name = 'passportFile';
  displayName = 'Passport File Settings';
  documentationUrl = 'https://docs.foundation.xyz/passport';

  properties: INodeProperties[] = [
    {
      displayName: 'Import Directory',
      name: 'importDirectory',
      type: 'string',
      default: './passport-import',
      placeholder: '/path/to/import',
      description: 'Directory for importing files (PSBTs, configs, backups)',
    },
    {
      displayName: 'Export Directory',
      name: 'exportDirectory',
      type: 'string',
      default: './passport-export',
      placeholder: '/path/to/export',
      description: 'Directory for exporting files (signed PSBTs, QR codes)',
    },
    {
      displayName: 'QR Code Output Directory',
      name: 'qrOutputDirectory',
      type: 'string',
      default: './passport-qr',
      placeholder: '/path/to/qr-output',
      description: 'Directory for generated QR code images',
    },
    {
      displayName: 'Backup Directory',
      name: 'backupDirectory',
      type: 'string',
      default: './passport-backup',
      placeholder: '/path/to/backups',
      description: 'Directory for encrypted backup files',
    },
    {
      displayName: 'File Naming Convention',
      name: 'fileNamingConvention',
      type: 'options',
      options: [
        {
          name: 'Timestamp Prefix',
          value: 'timestamp',
          description: 'Prefix files with ISO timestamp (e.g., 2024-01-15T10-30-00)',
        },
        {
          name: 'UUID',
          value: 'uuid',
          description: 'Use UUID v4 for unique file names',
        },
        {
          name: 'Sequential',
          value: 'sequential',
          description: 'Use sequential numbering (001, 002, etc.)',
        },
        {
          name: 'Custom Template',
          value: 'custom',
          description: 'Use custom naming template',
        },
      ],
      default: 'timestamp',
      description: 'How to name exported files',
    },
    {
      displayName: 'Custom File Template',
      name: 'customFileTemplate',
      type: 'string',
      default: '{{type}}_{{fingerprint}}_{{timestamp}}',
      placeholder: '{{type}}_{{fingerprint}}_{{timestamp}}',
      displayOptions: {
        show: {
          fileNamingConvention: ['custom'],
        },
      },
      description: 'Template for custom file names. Variables: {{type}}, {{fingerprint}}, {{timestamp}}, {{index}}',
    },
    {
      displayName: 'PSBT File Options',
      name: 'psbtFileOptions',
      type: 'collection',
      default: {},
      placeholder: 'Add PSBT Option',
      options: [
        {
          displayName: 'PSBT File Extension',
          name: 'psbtExtension',
          type: 'options',
          options: [
            { name: '.psbt', value: 'psbt' },
            { name: '.txn', value: 'txn' },
            { name: '.txt', value: 'txt' },
          ],
          default: 'psbt',
          description: 'File extension for PSBT files',
        },
        {
          displayName: 'PSBT Encoding',
          name: 'psbtEncoding',
          type: 'options',
          options: [
            { name: 'Base64', value: 'base64' },
            { name: 'Hex', value: 'hex' },
            { name: 'Binary', value: 'binary' },
          ],
          default: 'base64',
          description: 'Encoding format for PSBT files',
        },
      ],
      description: 'Options for PSBT file handling',
    },
    {
      displayName: 'QR Code Options',
      name: 'qrCodeOptions',
      type: 'collection',
      default: {},
      placeholder: 'Add QR Option',
      options: [
        {
          displayName: 'QR Image Format',
          name: 'qrImageFormat',
          type: 'options',
          options: [
            { name: 'PNG', value: 'png' },
            { name: 'SVG', value: 'svg' },
            { name: 'JPEG', value: 'jpeg' },
          ],
          default: 'png',
          description: 'Image format for QR code exports',
        },
        {
          displayName: 'QR Size (pixels)',
          name: 'qrSize',
          type: 'number',
          default: 400,
          description: 'Size of generated QR code images',
        },
        {
          displayName: 'QR Error Correction',
          name: 'qrErrorCorrection',
          type: 'options',
          options: [
            { name: 'Low (7%)', value: 'L' },
            { name: 'Medium (15%)', value: 'M' },
            { name: 'Quartile (25%)', value: 'Q' },
            { name: 'High (30%)', value: 'H' },
          ],
          default: 'M',
          description: 'Error correction level for QR codes',
        },
      ],
      description: 'Options for QR code generation',
    },
    {
      displayName: 'Backup Options',
      name: 'backupOptions',
      type: 'collection',
      default: {},
      placeholder: 'Add Backup Option',
      options: [
        {
          displayName: 'Encrypt Backups',
          name: 'encryptBackups',
          type: 'boolean',
          default: true,
          description: 'Whether to encrypt backup files',
        },
        {
          displayName: 'Compression',
          name: 'compression',
          type: 'boolean',
          default: true,
          description: 'Whether to compress backup files',
        },
      ],
      description: 'Options for backup file handling',
    },
    {
      displayName: 'Auto-Cleanup Settings',
      name: 'autoCleanupSettings',
      type: 'collection',
      default: {},
      placeholder: 'Add Cleanup Setting',
      options: [
        {
          displayName: 'Enable Auto-Cleanup',
          name: 'enableAutoCleanup',
          type: 'boolean',
          default: false,
          description: 'Whether to automatically clean up old files',
        },
        {
          displayName: 'Cleanup After Days',
          name: 'cleanupAfterDays',
          type: 'number',
          default: 30,
          description: 'Delete files older than this many days',
        },
        {
          displayName: 'Keep Backups',
          name: 'keepBackups',
          type: 'boolean',
          default: true,
          description: 'Whether to preserve backup files during cleanup',
        },
        {
          displayName: 'Clean Signed PSBTs Only',
          name: 'cleanSignedPsbtsOnly',
          type: 'boolean',
          default: true,
          description: 'Whether to only clean up signed (completed) PSBTs',
        },
      ],
      description: 'Automatic file cleanup configuration',
    },
  ];
}
