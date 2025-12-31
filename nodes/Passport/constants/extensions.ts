/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Passport Extensions
 *
 * Passport supports extensions that add additional functionality.
 * Extensions can be installed, enabled, or disabled on the device.
 */

/**
 * Known extension identifiers
 */
export enum ExtensionId {
  /** Casa multisig support */
  CASA = 'casa',
  /** Unchained Capital support */
  UNCHAINED = 'unchained',
  /** Postmix (Whirlpool) support */
  POSTMIX = 'postmix',
  /** Key manager */
  KEY_MANAGER = 'key_manager',
  /** Developer tools */
  DEV_TOOLS = 'dev_tools',
  /** Health check extended */
  HEALTH_CHECK = 'health_check',
}

/**
 * Extension options for n8n UI
 */
export const EXTENSION_OPTIONS = [
  {
    name: 'Casa',
    value: ExtensionId.CASA,
    description: 'Casa multisig platform integration',
  },
  {
    name: 'Unchained Capital',
    value: ExtensionId.UNCHAINED,
    description: 'Unchained Capital vault integration',
  },
  {
    name: 'Postmix',
    value: ExtensionId.POSTMIX,
    description: 'Whirlpool postmix account support',
  },
  {
    name: 'Key Manager',
    value: ExtensionId.KEY_MANAGER,
    description: 'Advanced key derivation management',
  },
  {
    name: 'Developer Tools',
    value: ExtensionId.DEV_TOOLS,
    description: 'Developer and debugging tools',
  },
  {
    name: 'Health Check',
    value: ExtensionId.HEALTH_CHECK,
    description: 'Extended device health diagnostics',
  },
];

/**
 * Extension metadata
 */
export const EXTENSION_INFO = {
  [ExtensionId.CASA]: {
    name: 'Casa',
    version: '1.0.0',
    author: 'Foundation Devices',
    description: 'Enables Casa 3-of-5 multisig workflow integration',
    requiredFirmware: '2.0.0',
    size: 15360,
  },
  [ExtensionId.UNCHAINED]: {
    name: 'Unchained Capital',
    version: '1.0.0',
    author: 'Foundation Devices',
    description: 'Enables Unchained Capital vault key signing',
    requiredFirmware: '2.0.0',
    size: 12288,
  },
  [ExtensionId.POSTMIX]: {
    name: 'Postmix',
    version: '1.0.0',
    author: 'Foundation Devices',
    description: 'Support for Whirlpool postmix accounts',
    requiredFirmware: '2.1.0',
    size: 8192,
  },
  [ExtensionId.KEY_MANAGER]: {
    name: 'Key Manager',
    version: '1.0.0',
    author: 'Foundation Devices',
    description: 'Advanced key derivation and management',
    requiredFirmware: '2.0.0',
    size: 10240,
  },
  [ExtensionId.DEV_TOOLS]: {
    name: 'Developer Tools',
    version: '1.0.0',
    author: 'Foundation Devices',
    description: 'Developer utilities and debugging',
    requiredFirmware: '2.0.0',
    size: 20480,
  },
  [ExtensionId.HEALTH_CHECK]: {
    name: 'Health Check',
    version: '1.0.0',
    author: 'Foundation Devices',
    description: 'Extended hardware diagnostics',
    requiredFirmware: '2.0.0',
    size: 5120,
  },
};

/**
 * Passport device batch information
 */
export enum DeviceBatch {
  BATCH_1 = 'batch1',
  BATCH_2 = 'batch2',
  FOUNDERS_EDITION = 'founders',
}

export const DEVICE_BATCH_OPTIONS = [
  {
    name: 'Batch 1',
    value: DeviceBatch.BATCH_1,
    description: 'Original Passport - QR and microSD only',
  },
  {
    name: 'Batch 2',
    value: DeviceBatch.BATCH_2,
    description: 'Passport Batch 2 - Includes USB-C',
  },
  {
    name: "Founder's Edition",
    value: DeviceBatch.FOUNDERS_EDITION,
    description: 'Limited edition Passport',
  },
];

/**
 * Device batch capabilities
 */
export const DEVICE_CAPABILITIES = {
  [DeviceBatch.BATCH_1]: {
    hasUsb: false,
    hasBluetooth: false,
    hasNfc: false,
    qrCamera: true,
    sdCard: true,
    secureElement: true,
    avalancheNoise: true,
    antiTamperMesh: true,
  },
  [DeviceBatch.BATCH_2]: {
    hasUsb: true,
    hasBluetooth: false,
    hasNfc: false,
    qrCamera: true,
    sdCard: true,
    secureElement: true,
    avalancheNoise: true,
    antiTamperMesh: true,
  },
  [DeviceBatch.FOUNDERS_EDITION]: {
    hasUsb: false,
    hasBluetooth: false,
    hasNfc: false,
    qrCamera: true,
    sdCard: true,
    secureElement: true,
    avalancheNoise: true,
    antiTamperMesh: true,
  },
};

/**
 * Firmware version information
 */
export const FIRMWARE_INFO = {
  latestVersion: '2.3.0',
  minimumSupported: '2.0.0',
  releaseNotes: 'https://github.com/Foundation-Devices/passport2/releases',
  downloadUrl: 'https://foundation.xyz/passport/firmware',
  signingKey: 'Foundation Devices Signing Key',
};

/**
 * Error codes specific to Passport
 */
export enum PassportErrorCode {
  DEVICE_NOT_FOUND = 'PASSPORT_DEVICE_NOT_FOUND',
  CONNECTION_FAILED = 'PASSPORT_CONNECTION_FAILED',
  INVALID_QR = 'PASSPORT_INVALID_QR',
  PSBT_REJECTED = 'PASSPORT_PSBT_REJECTED',
  USER_CANCELLED = 'PASSPORT_USER_CANCELLED',
  SUPPLY_CHAIN_FAILED = 'PASSPORT_SUPPLY_CHAIN_FAILED',
  TAMPER_DETECTED = 'PASSPORT_TAMPER_DETECTED',
  FIRMWARE_INVALID = 'PASSPORT_FIRMWARE_INVALID',
  PIN_LOCKED = 'PASSPORT_PIN_LOCKED',
  SD_CARD_ERROR = 'PASSPORT_SD_CARD_ERROR',
  INSUFFICIENT_SPACE = 'PASSPORT_INSUFFICIENT_SPACE',
  INVALID_SEED = 'PASSPORT_INVALID_SEED',
  INVALID_PATH = 'PASSPORT_INVALID_PATH',
  MULTISIG_ERROR = 'PASSPORT_MULTISIG_ERROR',
  EXTENSION_ERROR = 'PASSPORT_EXTENSION_ERROR',
}

/**
 * Error messages for user display
 */
export const ERROR_MESSAGES: Record<PassportErrorCode, string> = {
  [PassportErrorCode.DEVICE_NOT_FOUND]:
    'Passport device not found. Check connection and try again.',
  [PassportErrorCode.CONNECTION_FAILED]:
    'Failed to connect to Passport. Verify connection type settings.',
  [PassportErrorCode.INVALID_QR]:
    'Invalid QR code data. Ensure the QR is from Passport.',
  [PassportErrorCode.PSBT_REJECTED]:
    'PSBT was rejected by Passport. Check transaction details.',
  [PassportErrorCode.USER_CANCELLED]:
    'Operation cancelled by user on Passport device.',
  [PassportErrorCode.SUPPLY_CHAIN_FAILED]:
    'Supply chain verification failed. Device may not be authentic.',
  [PassportErrorCode.TAMPER_DETECTED]:
    'Tamper detection triggered. Device security may be compromised.',
  [PassportErrorCode.FIRMWARE_INVALID]:
    'Firmware signature verification failed.',
  [PassportErrorCode.PIN_LOCKED]:
    'Device is locked. Enter PIN on Passport to continue.',
  [PassportErrorCode.SD_CARD_ERROR]:
    'SD card error. Check card is inserted and formatted correctly.',
  [PassportErrorCode.INSUFFICIENT_SPACE]:
    'Insufficient space on SD card.',
  [PassportErrorCode.INVALID_SEED]:
    'Invalid seed words provided.',
  [PassportErrorCode.INVALID_PATH]:
    'Invalid derivation path.',
  [PassportErrorCode.MULTISIG_ERROR]:
    'Multisig operation failed. Verify configuration.',
  [PassportErrorCode.EXTENSION_ERROR]:
    'Extension operation failed.',
};
