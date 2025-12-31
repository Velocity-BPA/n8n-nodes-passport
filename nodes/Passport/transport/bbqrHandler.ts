/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { BBQR_CONFIG } from '../constants/urTypes';
import { generateQRCode, QRGenerateOptions } from './qrHandler';
import * as zlib from 'zlib';

/**
 * BBQr Handler
 *
 * Handles Binary Bitcoin QR (BBQr) animated QR code generation and parsing.
 * BBQr is used by Passport for transmitting large data like PSBTs.
 *
 * Format: Each frame contains:
 * - Header: encoding version, file type, sequence info
 * - Payload: portion of the data
 */

export interface BBQrFrame {
  /** Frame index (0-based) */
  index: number;
  /** Total number of frames */
  total: number;
  /** Frame data */
  data: string;
  /** QR code image (data URL or SVG) */
  qrCode?: string;
}

export interface BBQrAnimation {
  /** All frames */
  frames: BBQrFrame[];
  /** File type indicator */
  fileType: string;
  /** Encoding version */
  version: string;
  /** Original data size */
  originalSize: number;
  /** Frame delay recommendation (ms) */
  frameDelay: number;
}

export interface BBQrParseState {
  /** Received frames */
  frames: Map<number, string>;
  /** Total expected frames */
  totalFrames: number;
  /** File type */
  fileType: string;
  /** Encoding version */
  version: string;
  /** Whether all frames received */
  isComplete: boolean;
}

/**
 * BBQr header structure
 */
interface BBQrHeader {
  version: string;
  fileType: string;
  frameIndex: number;
  totalFrames: number;
}

/**
 * Create BBQr animated QR codes from data
 */
export async function createBBQrAnimation(
  data: Buffer | string,
  fileType: string = 'P',
  options: {
    compress?: boolean;
    frameDelay?: number;
    qrOptions?: QRGenerateOptions;
  } = {},
): Promise<BBQrAnimation> {
  const {
    compress = true,
    frameDelay = BBQR_CONFIG.defaultFrameDelay,
    qrOptions = {},
  } = options;

  // Convert to buffer
  let buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
  const originalSize = buffer.length;

  // Optionally compress
  if (compress && buffer.length > 100) {
    const compressed = zlib.deflateSync(buffer);
    if (compressed.length < buffer.length * 0.9) {
      buffer = compressed;
      fileType = 'Z'; // Indicate compressed
    }
  }

  // Encode as base45 or base64
  const encoded = buffer.toString('base64');

  // Calculate frame size (leave room for header)
  const headerSize = BBQR_CONFIG.headerSize;
  const maxPayloadSize = BBQR_CONFIG.maxBytesPerFrame - headerSize;

  // Split into frames
  const framePayloads: string[] = [];
  for (let i = 0; i < encoded.length; i += maxPayloadSize) {
    framePayloads.push(encoded.slice(i, i + maxPayloadSize));
  }

  const totalFrames = Math.max(framePayloads.length, BBQR_CONFIG.minFrames);

  // Pad if needed
  while (framePayloads.length < totalFrames) {
    framePayloads.push('');
  }

  // Generate frames
  const frames: BBQrFrame[] = [];
  for (let i = 0; i < framePayloads.length; i++) {
    const header = encodeHeader({
      version: 'B',
      fileType,
      frameIndex: i,
      totalFrames: framePayloads.length,
    });

    const frameData = `${header}${framePayloads[i]}`;

    const qrCode = await generateQRCode(frameData, {
      ...qrOptions,
      errorCorrectionLevel: 'L', // Use low ECC for capacity
    });

    frames.push({
      index: i,
      total: framePayloads.length,
      data: frameData,
      qrCode: qrCode as string,
    });
  }

  return {
    frames,
    fileType,
    version: 'B',
    originalSize,
    frameDelay,
  };
}

/**
 * Encode BBQr header
 */
function encodeHeader(header: BBQrHeader): string {
  // Format: B${fileType}${frameIndex:02}${totalFrames:02}
  const frameIdx = header.frameIndex.toString().padStart(2, '0');
  const totalFrames = header.totalFrames.toString().padStart(2, '0');
  return `B${header.fileType}${totalFrames}${frameIdx}`;
}

/**
 * Parse BBQr header from frame data
 */
function parseHeader(frameData: string): BBQrHeader | null {
  if (frameData.length < BBQR_CONFIG.headerSize) {
    return null;
  }

  const version = frameData[0];
  if (version !== 'B') {
    return null;
  }

  const fileType = frameData[1];
  const totalFrames = parseInt(frameData.slice(2, 4), 10);
  const frameIndex = parseInt(frameData.slice(4, 6), 10);

  if (isNaN(totalFrames) || isNaN(frameIndex)) {
    return null;
  }

  return { version, fileType, frameIndex, totalFrames };
}

/**
 * Parse a single BBQr frame
 */
export function parseBBQrFrame(
  frameData: string,
  state?: BBQrParseState,
): BBQrParseState {
  const header = parseHeader(frameData);

  if (!header) {
    throw new Error('Invalid BBQr frame: could not parse header');
  }

  // Initialize or use existing state
  const currentState: BBQrParseState = state || {
    frames: new Map(),
    totalFrames: header.totalFrames,
    fileType: header.fileType,
    version: header.version,
    isComplete: false,
  };

  // Validate consistency
  if (state) {
    if (header.totalFrames !== state.totalFrames) {
      throw new Error('BBQr frame count mismatch');
    }
    if (header.fileType !== state.fileType) {
      throw new Error('BBQr file type mismatch');
    }
  }

  // Store frame payload
  const payload = frameData.slice(BBQR_CONFIG.headerSize);
  currentState.frames.set(header.frameIndex, payload);

  // Check if complete
  currentState.isComplete = currentState.frames.size === currentState.totalFrames;

  return currentState;
}

/**
 * Reassemble data from complete BBQr state
 */
export function reassembleBBQr(state: BBQrParseState): Buffer {
  if (!state.isComplete) {
    throw new Error('Cannot reassemble incomplete BBQr data');
  }

  // Collect frames in order
  const payloads: string[] = [];
  for (let i = 0; i < state.totalFrames; i++) {
    const payload = state.frames.get(i);
    if (payload === undefined) {
      throw new Error(`Missing BBQr frame ${i}`);
    }
    payloads.push(payload);
  }

  // Concatenate and decode
  const combined = payloads.join('');
  let buffer = Buffer.from(combined, 'base64');

  // Decompress if needed
  if (state.fileType === 'Z') {
    buffer = zlib.inflateSync(buffer);
  }

  return buffer;
}

/**
 * Create BBQr for PSBT
 */
export async function createPSBTBBQr(
  psbtBase64: string,
  options?: {
    frameDelay?: number;
    qrOptions?: QRGenerateOptions;
  },
): Promise<BBQrAnimation> {
  return createBBQrAnimation(Buffer.from(psbtBase64, 'base64'), 'P', {
    compress: true,
    ...options,
  });
}

/**
 * Parse PSBT from BBQr frames
 */
export function parsePSBTFromBBQr(state: BBQrParseState): string {
  if (state.fileType !== 'P' && state.fileType !== 'Z') {
    throw new Error('Invalid file type for PSBT');
  }

  const buffer = reassembleBBQr(state);
  return buffer.toString('base64');
}

/**
 * Get frame display info
 */
export function getFrameInfo(animation: BBQrAnimation): {
  totalFrames: number;
  estimatedDuration: number;
  recommendedLoops: number;
} {
  return {
    totalFrames: animation.frames.length,
    estimatedDuration: animation.frames.length * animation.frameDelay,
    recommendedLoops: Math.max(2, Math.ceil(10000 / (animation.frames.length * animation.frameDelay))),
  };
}

/**
 * Generate animated GIF from BBQr frames
 * Note: This is a placeholder - actual implementation would require
 * a GIF encoding library
 */
export async function generateBBQrGif(
  animation: BBQrAnimation,
  _options?: { loop?: boolean; optimize?: boolean },
): Promise<Buffer> {
  // Placeholder - would generate actual GIF
  // In production, use a library like gifencoder
  console.warn('GIF generation not implemented - returning placeholder');
  return Buffer.from(`BBQr Animation: ${animation.frames.length} frames`);
}

/**
 * Calculate optimal frame count for data size
 */
export function calculateOptimalFrames(dataSize: number): number {
  const payloadPerFrame = BBQR_CONFIG.maxBytesPerFrame - BBQR_CONFIG.headerSize;
  const minFrames = Math.ceil(dataSize / payloadPerFrame);
  return Math.max(minFrames, BBQR_CONFIG.minFrames);
}

/**
 * Validate BBQr data integrity
 */
export function validateBBQr(state: BBQrParseState): {
  valid: boolean;
  missingFrames: number[];
  duplicateFrames: number[];
} {
  const missingFrames: number[] = [];
  const duplicateFrames: number[] = [];
  const seen = new Set<number>();

  for (let i = 0; i < state.totalFrames; i++) {
    if (!state.frames.has(i)) {
      missingFrames.push(i);
    }
  }

  state.frames.forEach((_, idx) => {
    if (seen.has(idx)) {
      duplicateFrames.push(idx);
    }
    seen.add(idx);
  });

  return {
    valid: missingFrames.length === 0 && duplicateFrames.length === 0,
    missingFrames,
    duplicateFrames,
  };
}
