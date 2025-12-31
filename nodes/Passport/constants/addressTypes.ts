/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Bitcoin Address Types
 *
 * Defines the various address formats supported by Passport and Bitcoin.
 */

export enum AddressType {
  /** Legacy Pay-to-Public-Key-Hash (1...) */
  P2PKH = 'p2pkh',
  /** Pay-to-Script-Hash (3...) */
  P2SH = 'p2sh',
  /** Native SegWit Pay-to-Witness-Public-Key-Hash (bc1q...) */
  P2WPKH = 'p2wpkh',
  /** Nested SegWit (3... wrapping bc1q) */
  P2SH_P2WPKH = 'p2sh-p2wpkh',
  /** Taproot (bc1p...) */
  P2TR = 'p2tr',
  /** Pay-to-Witness-Script-Hash (bc1q... multisig) */
  P2WSH = 'p2wsh',
  /** Nested P2WSH (3... wrapping bc1q multisig) */
  P2SH_P2WSH = 'p2sh-p2wsh',
}

export const ADDRESS_TYPE_OPTIONS = [
  {
    name: 'Native SegWit (P2WPKH)',
    value: AddressType.P2WPKH,
    description: 'Recommended - Lower fees, bc1q... addresses',
  },
  {
    name: 'Taproot (P2TR)',
    value: AddressType.P2TR,
    description: 'Latest format with privacy benefits, bc1p... addresses',
  },
  {
    name: 'Nested SegWit (P2SH-P2WPKH)',
    value: AddressType.P2SH_P2WPKH,
    description: 'Compatible with older wallets, 3... addresses',
  },
  {
    name: 'Legacy (P2PKH)',
    value: AddressType.P2PKH,
    description: 'Original format, higher fees, 1... addresses',
  },
];

export const MULTISIG_ADDRESS_TYPE_OPTIONS = [
  {
    name: 'Native SegWit Multisig (P2WSH)',
    value: AddressType.P2WSH,
    description: 'Recommended for multisig, bc1q... addresses',
  },
  {
    name: 'Nested SegWit Multisig (P2SH-P2WSH)',
    value: AddressType.P2SH_P2WSH,
    description: 'Compatible with older wallets, 3... addresses',
  },
  {
    name: 'Legacy Multisig (P2SH)',
    value: AddressType.P2SH,
    description: 'Original multisig format, 3... addresses',
  },
];

/**
 * Address type prefixes for mainnet
 */
export const ADDRESS_PREFIXES_MAINNET = {
  [AddressType.P2PKH]: '1',
  [AddressType.P2SH]: '3',
  [AddressType.P2SH_P2WPKH]: '3',
  [AddressType.P2WPKH]: 'bc1q',
  [AddressType.P2TR]: 'bc1p',
  [AddressType.P2WSH]: 'bc1q',
  [AddressType.P2SH_P2WSH]: '3',
};

/**
 * Address type prefixes for testnet
 */
export const ADDRESS_PREFIXES_TESTNET = {
  [AddressType.P2PKH]: 'm',
  [AddressType.P2SH]: '2',
  [AddressType.P2SH_P2WPKH]: '2',
  [AddressType.P2WPKH]: 'tb1q',
  [AddressType.P2TR]: 'tb1p',
  [AddressType.P2WSH]: 'tb1q',
  [AddressType.P2SH_P2WSH]: '2',
};

/**
 * Extended public key version bytes
 */
export const XPUB_VERSIONS = {
  mainnet: {
    xpub: 0x0488b21e, // Legacy P2PKH
    ypub: 0x049d7cb2, // P2SH-P2WPKH
    zpub: 0x04b24746, // P2WPKH
    Ypub: 0x0295b43f, // Multisig P2SH-P2WSH
    Zpub: 0x02aa7ed3, // Multisig P2WSH
  },
  testnet: {
    tpub: 0x043587cf, // Legacy P2PKH
    upub: 0x044a5262, // P2SH-P2WPKH
    vpub: 0x045f1cf6, // P2WPKH
    Upub: 0x024289ef, // Multisig P2SH-P2WSH
    Vpub: 0x02575483, // Multisig P2WSH
  },
};

/**
 * Script types for output descriptors
 */
export const SCRIPT_TYPES = {
  [AddressType.P2PKH]: 'pkh',
  [AddressType.P2SH]: 'sh',
  [AddressType.P2WPKH]: 'wpkh',
  [AddressType.P2SH_P2WPKH]: 'sh(wpkh',
  [AddressType.P2TR]: 'tr',
  [AddressType.P2WSH]: 'wsh',
  [AddressType.P2SH_P2WSH]: 'sh(wsh',
};
