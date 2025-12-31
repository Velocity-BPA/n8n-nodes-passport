/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { URType, SEEDQR_CONFIG } from '../constants/urTypes';
import * as bip39 from 'bip39';

/**
 * QR Utilities
 *
 * Higher-level utilities for QR code operations with Passport.
 */

export interface UREncodedData {
  type: URType;
  parts: string[];
  isSinglePart: boolean;
}

export interface SeedQRData {
  /** Seed words */
  words: string[];
  /** Word count (12 or 24) */
  wordCount: number;
  /** Whether compact encoding is used */
  isCompact: boolean;
  /** Raw encoded data */
  encoded: string;
}

/**
 * Encode data as UR for QR display
 */
export function encodeAsUR(
  data: Buffer,
  type: URType,
  maxPartSize: number = 200,
): UREncodedData {
  const encoded = data.toString('hex');

  if (encoded.length <= maxPartSize) {
    return {
      type,
      parts: [`ur:${type}/${encoded}`],
      isSinglePart: true,
    };
  }

  // Split into parts
  const parts: string[] = [];
  const totalParts = Math.ceil(encoded.length / maxPartSize);

  for (let i = 0; i < totalParts; i++) {
    const start = i * maxPartSize;
    const end = Math.min(start + maxPartSize, encoded.length);
    const partData = encoded.slice(start, end);

    parts.push(`ur:${type}/${i + 1}-${totalParts}/${partData}`);
  }

  return {
    type,
    parts,
    isSinglePart: false,
  };
}

/**
 * Decode UR parts back to data
 */
export function decodeUR(parts: string[]): { type: URType; data: Buffer } {
  if (parts.length === 0) {
    throw new Error('No UR parts provided');
  }

  // Parse first part to get type
  const firstPart = parts[0].toLowerCase();
  if (!firstPart.startsWith('ur:')) {
    throw new Error('Invalid UR format');
  }

  const [typeAndSeq, ...dataParts] = firstPart.slice(3).split('/');
  const type = typeAndSeq.split('-')[0] as URType;

  // Combine data parts
  let combinedData = '';

  if (parts.length === 1 && !typeAndSeq.includes('-')) {
    // Single part
    combinedData = dataParts.join('/');
  } else {
    // Multi-part
    const sortedParts = parts
      .map((p) => {
        const match = p.match(/\/(\d+)-(\d+)\//);
        if (!match) return { index: 0, data: '' };
        return {
          index: parseInt(match[1], 10),
          data: p.split('/').pop() || '',
        };
      })
      .sort((a, b) => a.index - b.index);

    combinedData = sortedParts.map((p) => p.data).join('');
  }

  return {
    type,
    data: Buffer.from(combinedData, 'hex'),
  };
}

/**
 * Create SeedQR from seed words
 *
 * SeedQR encodes seed words as 4-digit word indices.
 * Used for backing up seed via QR code.
 *
 * SECURITY WARNING: SeedQR contains your complete seed!
 * Only use in secure, air-gapped environments.
 */
export function createSeedQR(words: string[]): SeedQRData {
  if (words.length !== 12 && words.length !== 24) {
    throw new Error('Seed must be 12 or 24 words');
  }

  // Validate all words are in BIP-39 wordlist
  const wordlist = bip39.wordlists.english;
  const indices: number[] = [];

  for (const word of words) {
    const index = wordlist.indexOf(word.toLowerCase());
    if (index === -1) {
      throw new Error(`Invalid BIP-39 word: ${word}`);
    }
    indices.push(index);
  }

  // Standard SeedQR: 4 digits per word (0000-2047)
  const encoded = indices
    .map((idx) => idx.toString().padStart(SEEDQR_CONFIG.standard.digitsPerWord, '0'))
    .join('');

  return {
    words,
    wordCount: words.length,
    isCompact: false,
    encoded,
  };
}

/**
 * Create Compact SeedQR from seed words
 *
 * Compact SeedQR uses binary encoding for smaller QR codes.
 * Each word is 11 bits (2048 possible words).
 */
export function createCompactSeedQR(words: string[]): SeedQRData {
  if (words.length !== 12 && words.length !== 24) {
    throw new Error('Seed must be 12 or 24 words');
  }

  const wordlist = bip39.wordlists.english;
  const indices: number[] = [];

  for (const word of words) {
    const index = wordlist.indexOf(word.toLowerCase());
    if (index === -1) {
      throw new Error(`Invalid BIP-39 word: ${word}`);
    }
    indices.push(index);
  }

  // Binary encoding: 11 bits per word
  const totalBits = words.length * SEEDQR_CONFIG.compact.bitsPerWord;
  const bytes = Math.ceil(totalBits / 8);
  const buffer = Buffer.alloc(bytes);

  let bitOffset = 0;
  for (const index of indices) {
    // Write 11 bits at current offset
    const byteOffset = Math.floor(bitOffset / 8);
    const bitWithinByte = bitOffset % 8;

    // May span up to 3 bytes
    const value = index << (24 - 11 - bitWithinByte);
    buffer[byteOffset] |= (value >> 16) & 0xff;
    if (byteOffset + 1 < bytes) {
      buffer[byteOffset + 1] |= (value >> 8) & 0xff;
    }
    if (byteOffset + 2 < bytes) {
      buffer[byteOffset + 2] |= value & 0xff;
    }

    bitOffset += 11;
  }

  return {
    words,
    wordCount: words.length,
    isCompact: true,
    encoded: buffer.toString('hex'),
  };
}

/**
 * Parse SeedQR back to words
 */
export function parseSeedQR(encoded: string, isCompact: boolean = false): string[] {
  const wordlist = bip39.wordlists.english;
  const words: string[] = [];

  if (isCompact) {
    // Compact binary encoding
    const buffer = Buffer.from(encoded, 'hex');
    const wordCount = buffer.length === 17 ? 12 : 24; // 132 bits for 12, 264 for 24

    let bitOffset = 0;
    for (let i = 0; i < wordCount; i++) {
      const byteOffset = Math.floor(bitOffset / 8);
      const bitWithinByte = bitOffset % 8;

      // Read 11 bits
      let value = 0;
      value |= (buffer[byteOffset] << 16);
      if (byteOffset + 1 < buffer.length) {
        value |= (buffer[byteOffset + 1] << 8);
      }
      if (byteOffset + 2 < buffer.length) {
        value |= buffer[byteOffset + 2];
      }

      const index = (value >> (24 - 11 - bitWithinByte)) & 0x7ff;
      words.push(wordlist[index]);

      bitOffset += 11;
    }
  } else {
    // Standard numeric encoding
    const digitsPerWord = SEEDQR_CONFIG.standard.digitsPerWord;
    for (let i = 0; i < encoded.length; i += digitsPerWord) {
      const indexStr = encoded.slice(i, i + digitsPerWord);
      const index = parseInt(indexStr, 10);

      if (index < 0 || index >= 2048) {
        throw new Error(`Invalid word index: ${index}`);
      }

      words.push(wordlist[index]);
    }
  }

  // Validate checksum
  const mnemonic = words.join(' ');
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error('Invalid seed: checksum failed');
  }

  return words;
}

/**
 * Validate QR data format
 */
export function validateQRFormat(data: string): {
  format: 'ur' | 'bbqr' | 'seedqr' | 'seedqr-compact' | 'raw' | 'unknown';
  valid: boolean;
} {
  // Check UR format
  if (data.toLowerCase().startsWith('ur:')) {
    return { format: 'ur', valid: true };
  }

  // Check BBQr format (starts with B)
  if (data.startsWith('B') && data.length > 6) {
    const fileType = data[1];
    if ('PTJUHZ'.includes(fileType)) {
      return { format: 'bbqr', valid: true };
    }
  }

  // Check SeedQR format (numeric, 48 or 96 digits)
  if (/^\d+$/.test(data)) {
    if (data.length === 48 || data.length === 96) {
      return { format: 'seedqr', valid: true };
    }
  }

  // Check compact SeedQR (hex, 17 or 33 bytes)
  if (/^[0-9a-fA-F]+$/.test(data)) {
    if (data.length === 34 || data.length === 66) {
      return { format: 'seedqr-compact', valid: true };
    }
  }

  // Raw data
  if (data.length > 0) {
    return { format: 'raw', valid: true };
  }

  return { format: 'unknown', valid: false };
}

/**
 * Generate QR data for account export
 */
export function generateAccountQR(
  xpub: string,
  derivationPath: string,
  masterFingerprint: string,
): string {
  const accountData = {
    xpub,
    path: derivationPath,
    fingerprint: masterFingerprint,
  };

  return JSON.stringify(accountData);
}

/**
 * Generate QR data for address display
 */
export function generateAddressQR(
  address: string,
  amount?: number,
  label?: string,
  message?: string,
): string {
  let uri = `bitcoin:${address}`;
  const params: string[] = [];

  if (amount !== undefined && amount > 0) {
    params.push(`amount=${(amount / 100000000).toFixed(8)}`);
  }
  if (label) {
    params.push(`label=${encodeURIComponent(label)}`);
  }
  if (message) {
    params.push(`message=${encodeURIComponent(message)}`);
  }

  if (params.length > 0) {
    uri += '?' + params.join('&');
  }

  return uri;
}

/**
 * Parse Bitcoin URI from QR
 */
export function parseBitcoinURI(uri: string): {
  address: string;
  amount?: number;
  label?: string;
  message?: string;
} {
  if (!uri.toLowerCase().startsWith('bitcoin:')) {
    // Might be a plain address
    return { address: uri };
  }

  const [addressPart, paramsPart] = uri.slice(8).split('?');
  const result: { address: string; amount?: number; label?: string; message?: string } = {
    address: addressPart,
  };

  if (paramsPart) {
    const params = new URLSearchParams(paramsPart);
    const amountStr = params.get('amount');
    if (amountStr) {
      result.amount = Math.round(parseFloat(amountStr) * 100000000);
    }
    const label = params.get('label');
    if (label) {
      result.label = decodeURIComponent(label);
    }
    const message = params.get('message');
    if (message) {
      result.message = decodeURIComponent(message);
    }
  }

  return result;
}
