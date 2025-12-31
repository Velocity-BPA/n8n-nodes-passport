/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Uniform Resource (UR) Types
 *
 * UR is a method for encoding binary data as text for transmission via QR codes.
 * BCR-2020-005 defines the UR type registry.
 * Passport uses UR for air-gapped communication.
 */

/**
 * UR type identifiers used by Passport
 */
export enum URType {
  /** Cryptographic seed (BIP-39 mnemonic) */
  CRYPTO_SEED = 'crypto-seed',
  /** HD key (extended public/private key) */
  CRYPTO_HDKEY = 'crypto-hdkey',
  /** Key path (derivation path) */
  CRYPTO_KEYPATH = 'crypto-keypath',
  /** Coin info (network identifier) */
  CRYPTO_COININFO = 'crypto-coininfo',
  /** ECDSA signature */
  CRYPTO_ECKEY = 'crypto-eckey',
  /** Crypto address */
  CRYPTO_ADDRESS = 'crypto-address',
  /** Output descriptor */
  CRYPTO_OUTPUT = 'crypto-output',
  /** Account descriptor */
  CRYPTO_ACCOUNT = 'crypto-account',
  /** Partially Signed Bitcoin Transaction */
  CRYPTO_PSBT = 'crypto-psbt',
  /** Generic bytes */
  BYTES = 'bytes',
  /** Animated multi-part encoding */
  MULTI_PART = 'multi-part',
}

/**
 * UR type options for n8n UI
 */
export const UR_TYPE_OPTIONS = [
  {
    name: 'PSBT (Partially Signed Bitcoin Transaction)',
    value: URType.CRYPTO_PSBT,
    description: 'For signing transactions',
  },
  {
    name: 'HD Key (Extended Public Key)',
    value: URType.CRYPTO_HDKEY,
    description: 'For exporting xpub/account info',
  },
  {
    name: 'Account',
    value: URType.CRYPTO_ACCOUNT,
    description: 'Full account descriptor',
  },
  {
    name: 'Output Descriptor',
    value: URType.CRYPTO_OUTPUT,
    description: 'Wallet output script descriptor',
  },
  {
    name: 'Seed',
    value: URType.CRYPTO_SEED,
    description: 'BIP-39 seed for backup (sensitive!)',
  },
  {
    name: 'Bytes',
    value: URType.BYTES,
    description: 'Generic binary data',
  },
];

/**
 * BBQr (Binary Bitcoin QR) Configuration
 *
 * BBQr is an animated QR format for transmitting large data.
 * Used by Passport for PSBTs and other large payloads.
 */
export const BBQR_CONFIG = {
  /** Maximum data per QR frame */
  maxBytesPerFrame: 2953, // QR version 40, ECC L
  /** Minimum frames for animation */
  minFrames: 2,
  /** Maximum recommended frames */
  maxFrames: 100,
  /** Default frame delay in ms */
  defaultFrameDelay: 200,
  /** Frame header size */
  headerSize: 8,
  /** Supported encoding versions */
  versions: ['B'] as const, // Binary
  /** File type indicators */
  fileTypes: {
    psbt: 'P',
    transaction: 'T',
    json: 'J',
    unicode: 'U',
    hex: 'H',
    zlib: 'Z',
  },
};

/**
 * BBQr file type options
 */
export const BBQR_FILE_TYPE_OPTIONS = [
  { name: 'PSBT', value: 'P', description: 'Partially Signed Bitcoin Transaction' },
  { name: 'Transaction', value: 'T', description: 'Signed transaction' },
  { name: 'JSON', value: 'J', description: 'JSON data' },
  { name: 'Unicode', value: 'U', description: 'UTF-8 text' },
  { name: 'Hex', value: 'H', description: 'Hexadecimal data' },
  { name: 'Compressed', value: 'Z', description: 'Zlib compressed data' },
];

/**
 * UR encoding configuration
 */
export const UR_CONFIG = {
  /** Maximum single-part UR size */
  maxSinglePartSize: 2000,
  /** Fragment size for multi-part */
  fragmentSize: 150,
  /** Fountain code redundancy */
  redundancy: 1.5,
  /** CBOR tag for crypto types */
  cborTags: {
    [URType.CRYPTO_SEED]: 300,
    [URType.CRYPTO_HDKEY]: 303,
    [URType.CRYPTO_KEYPATH]: 304,
    [URType.CRYPTO_COININFO]: 305,
    [URType.CRYPTO_ECKEY]: 306,
    [URType.CRYPTO_ADDRESS]: 307,
    [URType.CRYPTO_OUTPUT]: 308,
    [URType.CRYPTO_ACCOUNT]: 311,
    [URType.CRYPTO_PSBT]: 310,
  },
};

/**
 * Coin types for crypto-coininfo
 */
export const CRYPTO_COIN_TYPES = {
  bitcoin: {
    type: 0,
    network: 0, // mainnet
  },
  testnet: {
    type: 1,
    network: 1, // testnet
  },
};

/**
 * QR code versions and capacities
 */
export const QR_VERSIONS = {
  /** Low error correction (7%) */
  low: {
    1: 17,
    10: 271,
    20: 858,
    30: 1732,
    40: 2953,
  },
  /** Medium error correction (15%) */
  medium: {
    1: 14,
    10: 213,
    20: 666,
    30: 1370,
    40: 2331,
  },
  /** Quartile error correction (25%) */
  quartile: {
    1: 11,
    10: 151,
    20: 470,
    30: 982,
    40: 1663,
  },
  /** High error correction (30%) */
  high: {
    1: 7,
    10: 119,
    20: 370,
    30: 742,
    40: 1273,
  },
};

/**
 * SeedQR format constants
 *
 * SeedQR is a compact QR format for BIP-39 seed backup.
 * Stores seed as numeric word indices.
 */
export const SEEDQR_CONFIG = {
  /** Standard SeedQR with 4-digit indices */
  standard: {
    digitsPerWord: 4,
    maxWords: 24,
    prefix: '',
  },
  /** Compact SeedQR with optimized encoding */
  compact: {
    bitsPerWord: 11, // 2048 words = 11 bits
    maxWords: 24,
    prefix: '',
  },
};
