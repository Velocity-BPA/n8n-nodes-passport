/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Bitcoin Derivation Paths
 *
 * BIP-44/49/84/86 derivation path standards for different address types.
 * Passport uses these paths to derive keys from the master seed.
 */

import { AddressType } from './addressTypes';

/**
 * BIP Purpose numbers for each address type
 */
export const BIP_PURPOSES = {
  [AddressType.P2PKH]: 44, // BIP-44 Legacy
  [AddressType.P2SH_P2WPKH]: 49, // BIP-49 Nested SegWit
  [AddressType.P2WPKH]: 84, // BIP-84 Native SegWit
  [AddressType.P2TR]: 86, // BIP-86 Taproot
  [AddressType.P2WSH]: 48, // BIP-48 Multisig
  [AddressType.P2SH_P2WSH]: 48, // BIP-48 Multisig
};

/**
 * Coin types per BIP-44
 */
export const COIN_TYPES = {
  mainnet: 0, // Bitcoin mainnet
  testnet: 1, // Bitcoin testnet/signet/regtest
};

/**
 * Standard derivation path templates
 */
export const DERIVATION_PATH_TEMPLATES = {
  /** BIP-44 Legacy: m/44'/0'/account'/change/index */
  bip44: "m/44'/{{coin}}'/{{account}}'/{{change}}/{{index}}",
  /** BIP-49 Nested SegWit: m/49'/0'/account'/change/index */
  bip49: "m/49'/{{coin}}'/{{account}}'/{{change}}/{{index}}",
  /** BIP-84 Native SegWit: m/84'/0'/account'/change/index */
  bip84: "m/84'/{{coin}}'/{{account}}'/{{change}}/{{index}}",
  /** BIP-86 Taproot: m/86'/0'/account'/change/index */
  bip86: "m/86'/{{coin}}'/{{account}}'/{{change}}/{{index}}",
  /** BIP-48 Multisig: m/48'/0'/account'/script'/change/index */
  bip48: "m/48'/{{coin}}'/{{account}}'/{{script}}'/{{change}}/{{index}}",
};

/**
 * Default derivation paths for common configurations
 */
export const DEFAULT_DERIVATION_PATHS = {
  /** Native SegWit, first account */
  nativeSegwit: "m/84'/0'/0'",
  /** Taproot, first account */
  taproot: "m/86'/0'/0'",
  /** Nested SegWit, first account */
  nestedSegwit: "m/49'/0'/0'",
  /** Legacy, first account */
  legacy: "m/44'/0'/0'",
  /** Testnet Native SegWit */
  testnetNativeSegwit: "m/84'/1'/0'",
  /** Testnet Taproot */
  testnetTaproot: "m/86'/1'/0'",
};

/**
 * Multisig script types for BIP-48
 */
export const MULTISIG_SCRIPT_TYPES = {
  p2shMultisig: 0, // Legacy P2SH multisig
  p2shP2wshMultisig: 1, // Nested SegWit multisig
  p2wshMultisig: 2, // Native SegWit multisig
};

/**
 * Derivation path options for n8n UI
 */
export const DERIVATION_PATH_OPTIONS = [
  {
    name: "Native SegWit (BIP-84): m/84'/0'/0'",
    value: "m/84'/0'/0'",
    description: 'Recommended - bc1q... addresses with lowest fees',
  },
  {
    name: "Taproot (BIP-86): m/86'/0'/0'",
    value: "m/86'/0'/0'",
    description: 'Latest format - bc1p... addresses with privacy benefits',
  },
  {
    name: "Nested SegWit (BIP-49): m/49'/0'/0'",
    value: "m/49'/0'/0'",
    description: 'Backward compatible - 3... addresses',
  },
  {
    name: "Legacy (BIP-44): m/44'/0'/0'",
    value: "m/44'/0'/0'",
    description: 'Original format - 1... addresses, higher fees',
  },
  {
    name: 'Custom Path',
    value: 'custom',
    description: 'Specify a custom derivation path',
  },
];

/**
 * Wallet-specific derivation paths
 * Different software wallets may use non-standard paths
 */
export const WALLET_DERIVATION_PATHS = {
  /** Electrum uses slightly different paths */
  electrum: {
    segwit: "m/0'/0/{{index}}", // Electrum legacy segwit
    native: "m/84'/0'/0'/{{change}}/{{index}}",
  },
  /** Blue Wallet standard paths */
  blueWallet: {
    segwit: "m/84'/0'/0'/{{change}}/{{index}}",
    taproot: "m/86'/0'/0'/{{change}}/{{index}}",
  },
  /** Sparrow standard paths */
  sparrow: {
    nativeSegwit: "m/84'/0'/0'/{{change}}/{{index}}",
    taproot: "m/86'/0'/0'/{{change}}/{{index}}",
    nestedSegwit: "m/49'/0'/0'/{{change}}/{{index}}",
  },
  /** Casa multisig paths */
  casa: {
    multisig: "m/48'/0'/0'/2'/{{change}}/{{index}}",
  },
  /** Unchained multisig paths */
  unchained: {
    multisig: "m/48'/0'/0'/2'/{{change}}/{{index}}",
  },
};

/**
 * Parse a derivation path string into components
 */
export interface DerivationPathComponents {
  purpose: number;
  coinType: number;
  account: number;
  change?: number;
  index?: number;
  scriptType?: number; // For BIP-48 multisig
}

/**
 * Hardened derivation indicator
 */
export const HARDENED_OFFSET = 0x80000000;

/**
 * Check if a path component is hardened
 */
export function isHardened(component: string): boolean {
  return component.endsWith("'") || component.endsWith('h');
}

/**
 * Parse hardened component value
 */
export function parseComponent(component: string): number {
  const isHard = isHardened(component);
  const value = parseInt(component.replace(/['h]/g, ''), 10);
  return isHard ? value + HARDENED_OFFSET : value;
}
