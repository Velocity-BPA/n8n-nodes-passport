/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Wallet Export Formats
 *
 * Defines the various export formats supported by Passport for
 * creating watch-only wallets in different software.
 */

/**
 * Supported wallet software for watch-only exports
 */
export enum WalletSoftware {
  ENVOY = 'envoy',
  SPARROW = 'sparrow',
  SPECTER = 'specter',
  BLUEWALLET = 'bluewallet',
  ELECTRUM = 'electrum',
  BITCOIN_CORE = 'bitcoincore',
  NUNCHUK = 'nunchuk',
  CASA = 'casa',
  UNCHAINED = 'unchained',
  GENERIC_JSON = 'generic_json',
  OUTPUT_DESCRIPTOR = 'descriptor',
}

/**
 * Wallet export format options for n8n UI
 */
export const WALLET_FORMAT_OPTIONS = [
  {
    name: 'Envoy (Foundation)',
    value: WalletSoftware.ENVOY,
    description: 'Foundation Envoy mobile app - Official companion',
  },
  {
    name: 'Sparrow Wallet',
    value: WalletSoftware.SPARROW,
    description: 'Sparrow desktop wallet - JSON export',
  },
  {
    name: 'Specter Desktop',
    value: WalletSoftware.SPECTER,
    description: 'Specter Desktop - JSON export',
  },
  {
    name: 'Blue Wallet',
    value: WalletSoftware.BLUEWALLET,
    description: 'Blue Wallet mobile - ZPUB/XPUB export',
  },
  {
    name: 'Electrum',
    value: WalletSoftware.ELECTRUM,
    description: 'Electrum wallet - JSON export',
  },
  {
    name: 'Bitcoin Core',
    value: WalletSoftware.BITCOIN_CORE,
    description: 'Bitcoin Core - Output descriptors',
  },
  {
    name: 'Nunchuk',
    value: WalletSoftware.NUNCHUK,
    description: 'Nunchuk wallet - BSMS/JSON export',
  },
  {
    name: 'Casa',
    value: WalletSoftware.CASA,
    description: 'Casa multisig platform',
  },
  {
    name: 'Unchained Capital',
    value: WalletSoftware.UNCHAINED,
    description: 'Unchained Capital vault',
  },
  {
    name: 'Generic JSON',
    value: WalletSoftware.GENERIC_JSON,
    description: 'Universal JSON format with all data',
  },
  {
    name: 'Output Descriptor',
    value: WalletSoftware.OUTPUT_DESCRIPTOR,
    description: 'BIP-380 output descriptor format',
  },
];

/**
 * Wallet export configurations
 */
export const WALLET_EXPORT_CONFIGS = {
  [WalletSoftware.ENVOY]: {
    format: 'json',
    extension: '.json',
    includeDerivation: true,
    includeFingerprint: true,
    qrSupport: true,
    animated: true, // Uses BBQr
  },
  [WalletSoftware.SPARROW]: {
    format: 'json',
    extension: '.json',
    includeDerivation: true,
    includeFingerprint: true,
    qrSupport: true,
    animated: true,
  },
  [WalletSoftware.SPECTER]: {
    format: 'json',
    extension: '.json',
    includeDerivation: true,
    includeFingerprint: true,
    qrSupport: true,
    animated: false,
  },
  [WalletSoftware.BLUEWALLET]: {
    format: 'xpub',
    extension: '.txt',
    includeDerivation: false,
    includeFingerprint: false,
    qrSupport: true,
    animated: false,
  },
  [WalletSoftware.ELECTRUM]: {
    format: 'json',
    extension: '.json',
    includeDerivation: true,
    includeFingerprint: true,
    qrSupport: false,
    animated: false,
  },
  [WalletSoftware.BITCOIN_CORE]: {
    format: 'descriptor',
    extension: '.txt',
    includeDerivation: true,
    includeFingerprint: true,
    qrSupport: false,
    animated: false,
  },
  [WalletSoftware.NUNCHUK]: {
    format: 'bsms',
    extension: '.bsms',
    includeDerivation: true,
    includeFingerprint: true,
    qrSupport: true,
    animated: true,
  },
  [WalletSoftware.CASA]: {
    format: 'json',
    extension: '.json',
    includeDerivation: true,
    includeFingerprint: true,
    qrSupport: true,
    animated: false,
  },
  [WalletSoftware.UNCHAINED]: {
    format: 'json',
    extension: '.json',
    includeDerivation: true,
    includeFingerprint: true,
    qrSupport: false,
    animated: false,
  },
  [WalletSoftware.GENERIC_JSON]: {
    format: 'json',
    extension: '.json',
    includeDerivation: true,
    includeFingerprint: true,
    qrSupport: true,
    animated: true,
  },
  [WalletSoftware.OUTPUT_DESCRIPTOR]: {
    format: 'descriptor',
    extension: '.txt',
    includeDerivation: true,
    includeFingerprint: true,
    qrSupport: true,
    animated: false,
  },
};

/**
 * BSMS (Bitcoin Secure Multisig Setup) constants
 * BIP-129 specification
 */
export const BSMS_CONSTANTS = {
  version: 'BSMS 1.0',
  tokenPrefix: 'BSMS 1.0',
  descriptorPrefix: 'wsh(sortedmulti(',
  checksumLength: 8,
};

/**
 * Export file templates
 */
export const EXPORT_TEMPLATES = {
  sparrow: {
    name: 'Passport',
    policy: {
      type: 'single',
      script_type: 'p2wpkh',
    },
    keystore: {
      label: 'Passport',
      derivation: '',
      xpub: '',
      master_fingerprint: '',
    },
  },
  specter: {
    name: 'Passport',
    descriptor: '',
  },
  electrum: {
    keystore: {
      type: 'hardware',
      hw_type: 'passport',
      label: 'Passport',
      derivation: '',
      xpub: '',
      root_fingerprint: '',
    },
    wallet_type: 'standard',
  },
};

/**
 * Multisig configuration formats
 */
export enum MultisigFormat {
  BSMS = 'bsms',
  SPECTER = 'specter',
  COLDCARD = 'coldcard',
  NUNCHUK = 'nunchuk',
  GENERIC = 'generic',
}

export const MULTISIG_FORMAT_OPTIONS = [
  {
    name: 'BSMS (BIP-129)',
    value: MultisigFormat.BSMS,
    description: 'Bitcoin Secure Multisig Setup standard',
  },
  {
    name: 'Specter Desktop',
    value: MultisigFormat.SPECTER,
    description: 'Specter multisig JSON format',
  },
  {
    name: 'Coldcard',
    value: MultisigFormat.COLDCARD,
    description: 'Coldcard multisig export format',
  },
  {
    name: 'Nunchuk',
    value: MultisigFormat.NUNCHUK,
    description: 'Nunchuk multisig configuration',
  },
  {
    name: 'Generic JSON',
    value: MultisigFormat.GENERIC,
    description: 'Universal JSON multisig format',
  },
];
