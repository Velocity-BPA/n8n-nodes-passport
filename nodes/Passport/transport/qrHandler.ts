/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import * as QRCode from 'qrcode';
import jsQR from 'jsqr';
import { URType, UR_CONFIG } from '../constants/urTypes';

/**
 * QR Handler
 *
 * Handles basic QR code generation and parsing for Passport communication.
 * For animated QR codes (BBQr), see bbqrHandler.ts
 */

export interface QRGenerateOptions {
  /** Error correction level */
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  /** QR code size in pixels */
  width?: number;
  /** Margin around QR (modules) */
  margin?: number;
  /** Dark color */
  darkColor?: string;
  /** Light color */
  lightColor?: string;
  /** Output format */
  format?: 'png' | 'svg' | 'terminal';
}

export interface QRParseResult {
  /** Decoded data */
  data: string;
  /** Whether data is UR encoded */
  isUR: boolean;
  /** UR type if applicable */
  urType?: URType;
  /** Raw bytes if binary */
  bytes?: Uint8Array;
}

export interface URData {
  type: URType;
  data: Uint8Array;
}

/**
 * Default QR generation options
 */
const DEFAULT_OPTIONS: QRGenerateOptions = {
  errorCorrectionLevel: 'M',
  width: 400,
  margin: 4,
  darkColor: '#000000',
  lightColor: '#FFFFFF',
  format: 'png',
};

/**
 * Generate a QR code from data
 */
export async function generateQRCode(
  data: string | Buffer,
  options: QRGenerateOptions = {},
): Promise<string | Buffer> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const qrOptions: QRCode.QRCodeToDataURLOptions = {
    errorCorrectionLevel: opts.errorCorrectionLevel,
    width: opts.width,
    margin: opts.margin,
    color: {
      dark: opts.darkColor,
      light: opts.lightColor,
    },
  };

  const inputData = Buffer.isBuffer(data) ? data.toString('base64') : data;

  switch (opts.format) {
    case 'svg':
      return QRCode.toString(inputData, { ...qrOptions, type: 'svg' });
    case 'terminal':
      return QRCode.toString(inputData, { ...qrOptions, type: 'terminal' });
    case 'png':
    default:
      return QRCode.toDataURL(inputData, qrOptions);
  }
}

/**
 * Generate QR code to file
 */
export async function generateQRCodeToFile(
  data: string | Buffer,
  filePath: string,
  options: QRGenerateOptions = {},
): Promise<void> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const qrOptions: QRCode.QRCodeToFileOptions = {
    errorCorrectionLevel: opts.errorCorrectionLevel,
    width: opts.width,
    margin: opts.margin,
    color: {
      dark: opts.darkColor,
      light: opts.lightColor,
    },
  };

  const inputData = Buffer.isBuffer(data) ? data.toString('base64') : data;
  await QRCode.toFile(filePath, inputData, qrOptions);
}

/**
 * Parse QR code from image data
 */
export function parseQRCode(
  imageData: Uint8ClampedArray,
  width: number,
  height: number,
): QRParseResult | null {
  const result = jsQR(imageData, width, height);

  if (!result) {
    return null;
  }

  const data = result.data;

  // Check if this is a UR-encoded string
  if (data.toLowerCase().startsWith('ur:')) {
    const urResult = parseURString(data);
    return {
      data,
      isUR: true,
      urType: urResult.type,
      bytes: urResult.data,
    };
  }

  return {
    data,
    isUR: false,
  };
}

/**
 * Parse QR code from base64 image
 */
export async function parseQRCodeFromBase64(
  base64Image: string,
): Promise<QRParseResult | null> {
  // Remove data URL prefix if present
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  // This is a simplified implementation
  // In production, use a proper image decoder
  // For now, return null - actual implementation would decode the image
  console.warn('parseQRCodeFromBase64: Image decoding not implemented in this context');
  return null;
}

/**
 * Parse a UR (Uniform Resource) string
 */
export function parseURString(urString: string): URData {
  // UR format: ur:type/data or ur:type/sequence/data
  const lower = urString.toLowerCase();
  if (!lower.startsWith('ur:')) {
    throw new Error('Invalid UR string: must start with ur:');
  }

  const parts = urString.slice(3).split('/');
  if (parts.length < 2) {
    throw new Error('Invalid UR string: missing type or data');
  }

  const type = parts[0] as URType;

  // Get the data part (last element)
  const dataPart = parts[parts.length - 1];

  // Decode from bytewords
  const data = decodeBytewords(dataPart);

  return { type, data };
}

/**
 * Encode data as a UR string
 */
export function encodeURString(type: URType, data: Uint8Array): string {
  const encoded = encodeBytewords(data);
  return `ur:${type}/${encoded}`;
}

/**
 * Bytewords encoding (simplified)
 * In production, use @ngraveio/bc-ur library
 */
const BYTEWORDS = [
  'able', 'acid', 'also', 'apex', 'aqua', 'arch', 'atom', 'aunt',
  'away', 'axis', 'back', 'bald', 'barn', 'belt', 'beta', 'bias',
  // ... full list of 256 words
];

export function encodeBytewords(data: Uint8Array): string {
  // Simplified minimal encoding
  // In production, use proper bytewords encoding
  return Buffer.from(data).toString('hex');
}

export function decodeBytewords(encoded: string): Uint8Array {
  // Simplified minimal decoding
  // In production, use proper bytewords decoding
  return new Uint8Array(Buffer.from(encoded, 'hex'));
}

/**
 * Check if data needs multi-part encoding
 */
export function needsMultiPart(data: Uint8Array): boolean {
  return data.length > UR_CONFIG.maxSinglePartSize;
}

/**
 * Encode PSBT for QR display
 */
export function encodePSBTForQR(psbtBase64: string): string {
  return encodeURString(URType.CRYPTO_PSBT, new Uint8Array(Buffer.from(psbtBase64, 'base64')));
}

/**
 * Decode PSBT from QR
 */
export function decodePSBTFromQR(urString: string): string {
  const { type, data } = parseURString(urString);
  if (type !== URType.CRYPTO_PSBT) {
    throw new Error(`Expected crypto-psbt, got ${type}`);
  }
  return Buffer.from(data).toString('base64');
}

/**
 * Generate address display QR
 */
export async function generateAddressQR(
  address: string,
  options: QRGenerateOptions = {},
): Promise<string> {
  // Use bitcoin: URI scheme for better wallet compatibility
  const bitcoinUri = `bitcoin:${address}`;
  return generateQRCode(bitcoinUri, options) as Promise<string>;
}

/**
 * QR code capacity calculator
 */
export function calculateQRCapacity(
  version: number,
  errorCorrection: 'L' | 'M' | 'Q' | 'H',
): number {
  // Capacities for alphanumeric mode
  const capacities: Record<string, Record<number, number>> = {
    L: { 1: 25, 10: 395, 20: 1249, 30: 2520, 40: 4296 },
    M: { 1: 20, 10: 311, 20: 970, 30: 1992, 40: 3391 },
    Q: { 1: 16, 10: 221, 20: 686, 30: 1429, 40: 2420 },
    H: { 1: 10, 10: 174, 20: 540, 30: 1080, 40: 1852 },
  };

  const ecCapacities = capacities[errorCorrection];
  const versions = Object.keys(ecCapacities).map(Number).sort((a, b) => a - b);

  for (const v of versions) {
    if (v >= version) {
      return ecCapacities[v];
    }
  }

  return ecCapacities[40];
}
