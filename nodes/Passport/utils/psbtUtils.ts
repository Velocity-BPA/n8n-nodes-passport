/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import * as bitcoin from 'bitcoinjs-lib';
import { AddressType } from '../constants/addressTypes';

/**
 * PSBT Utilities
 *
 * Utilities for working with Partially Signed Bitcoin Transactions.
 * PSBTs are the standard format for signing transactions with hardware wallets.
 */

export interface PSBTInfo {
  /** Transaction ID (if finalized) */
  txid?: string;
  /** PSBT version */
  version: number;
  /** Number of inputs */
  inputCount: number;
  /** Number of outputs */
  outputCount: number;
  /** Total input value (satoshis) */
  inputValue: number;
  /** Total output value (satoshis) */
  outputValue: number;
  /** Fee in satoshis */
  fee: number;
  /** Fee rate in sat/vB */
  feeRate: number;
  /** Virtual size in vBytes */
  vsize: number;
  /** Whether PSBT is fully signed */
  isComplete: boolean;
  /** Number of signatures needed */
  signaturesNeeded: number;
  /** Number of signatures present */
  signaturesPresent: number;
}

export interface PSBTInput {
  /** Input index */
  index: number;
  /** Previous output txid */
  txid: string;
  /** Previous output index */
  vout: number;
  /** Input value in satoshis */
  value: number;
  /** Script type */
  scriptType: string;
  /** Whether input is signed */
  isSigned: boolean;
  /** Derivation paths */
  bip32Derivation?: Array<{
    pubkey: string;
    masterFingerprint: string;
    path: string;
  }>;
}

export interface PSBTOutput {
  /** Output index */
  index: number;
  /** Output address */
  address: string;
  /** Value in satoshis */
  value: number;
  /** Whether this is a change output */
  isChange: boolean;
  /** Script type */
  scriptType: string;
}

/**
 * Get Bitcoin network from string
 */
function getNetwork(networkName: string): bitcoin.Network {
  switch (networkName.toLowerCase()) {
    case 'testnet':
      return bitcoin.networks.testnet;
    case 'regtest':
      return bitcoin.networks.regtest;
    case 'mainnet':
    default:
      return bitcoin.networks.bitcoin;
  }
}

/**
 * Parse PSBT from base64 string
 */
export function parsePSBT(
  psbtBase64: string,
  network: string = 'mainnet',
): bitcoin.Psbt {
  const psbtBuffer = Buffer.from(psbtBase64, 'base64');
  return bitcoin.Psbt.fromBuffer(psbtBuffer, { network: getNetwork(network) });
}

/**
 * Serialize PSBT to base64 string
 */
export function serializePSBT(psbt: bitcoin.Psbt): string {
  return psbt.toBase64();
}

/**
 * Get PSBT information
 */
export function getPSBTInfo(
  psbtBase64: string,
  network: string = 'mainnet',
): PSBTInfo {
  const psbt = parsePSBT(psbtBase64, network);
  const tx = psbt.data.globalMap.unsignedTx;

  let inputValue = 0;
  let outputValue = 0;
  let signaturesPresent = 0;
  let signaturesNeeded = 0;

  // Calculate input value
  for (let i = 0; i < psbt.data.inputs.length; i++) {
    const input = psbt.data.inputs[i];
    if (input.witnessUtxo) {
      inputValue += input.witnessUtxo.value;
    } else if (input.nonWitnessUtxo) {
      const prevTx = bitcoin.Transaction.fromBuffer(input.nonWitnessUtxo);
      const vout = psbt.txInputs[i].index;
      inputValue += prevTx.outs[vout].value;
    }

    // Count signatures
    signaturesNeeded++;
    if (input.partialSig && input.partialSig.length > 0) {
      signaturesPresent++;
    } else if (input.finalScriptSig || input.finalScriptWitness) {
      signaturesPresent++;
    }
  }

  // Calculate output value
  for (const output of psbt.txOutputs) {
    outputValue += output.value;
  }

  const fee = inputValue - outputValue;

  // Estimate vsize
  const vsize = estimateVsize(psbt);
  const feeRate = vsize > 0 ? Math.ceil(fee / vsize) : 0;

  const isComplete = signaturesPresent === signaturesNeeded;

  return {
    txid: isComplete ? psbt.extractTransaction().getId() : undefined,
    version: 2, // PSBT v2
    inputCount: psbt.data.inputs.length,
    outputCount: psbt.txOutputs.length,
    inputValue,
    outputValue,
    fee,
    feeRate,
    vsize,
    isComplete,
    signaturesNeeded,
    signaturesPresent,
  };
}

/**
 * Get PSBT inputs
 */
export function getPSBTInputs(
  psbtBase64: string,
  network: string = 'mainnet',
): PSBTInput[] {
  const psbt = parsePSBT(psbtBase64, network);
  const inputs: PSBTInput[] = [];

  for (let i = 0; i < psbt.data.inputs.length; i++) {
    const input = psbt.data.inputs[i];
    const txInput = psbt.txInputs[i];

    let value = 0;
    if (input.witnessUtxo) {
      value = input.witnessUtxo.value;
    } else if (input.nonWitnessUtxo) {
      const prevTx = bitcoin.Transaction.fromBuffer(input.nonWitnessUtxo);
      value = prevTx.outs[txInput.index].value;
    }

    const isSigned =
      (input.partialSig && input.partialSig.length > 0) ||
      !!input.finalScriptSig ||
      !!input.finalScriptWitness;

    const bip32Derivation = input.bip32Derivation?.map((d) => ({
      pubkey: d.pubkey.toString('hex'),
      masterFingerprint: d.masterFingerprint.toString('hex'),
      path: Array.isArray(d.path) ? `m/${d.path.join('/')}` : `m/${d.path}`,
    }));

    inputs.push({
      index: i,
      txid: Buffer.from(txInput.hash).reverse().toString('hex'),
      vout: txInput.index,
      value,
      scriptType: detectInputScriptType(input),
      isSigned,
      bip32Derivation,
    });
  }

  return inputs;
}

/**
 * Get PSBT outputs
 */
export function getPSBTOutputs(
  psbtBase64: string,
  network: string = 'mainnet',
  knownAddresses?: string[],
): PSBTOutput[] {
  const psbt = parsePSBT(psbtBase64, network);
  const outputs: PSBTOutput[] = [];
  const net = getNetwork(network);

  for (let i = 0; i < psbt.txOutputs.length; i++) {
    const output = psbt.txOutputs[i];
    const psbtOutput = psbt.data.outputs[i];

    let address = '';
    try {
      address = bitcoin.address.fromOutputScript(output.script, net);
    } catch {
      address = 'Unknown';
    }

    // Check if this is a change output
    const isChange =
      !!psbtOutput.bip32Derivation ||
      (knownAddresses?.includes(address) ?? false);

    outputs.push({
      index: i,
      address,
      value: output.value,
      isChange,
      scriptType: detectOutputScriptType(output.script),
    });
  }

  return outputs;
}

/**
 * Detect input script type
 */
function detectInputScriptType(input: {
  witnessUtxo?: { script: Buffer };
  redeemScript?: Buffer;
  nonWitnessUtxo?: Buffer;
  witnessScript?: Buffer;
}): string {
  if (input.witnessUtxo) {
    const script = input.witnessUtxo.script;
    if (script.length === 22 && script[0] === 0x00 && script[1] === 0x14) {
      return AddressType.P2WPKH;
    }
    if (script.length === 34 && script[0] === 0x00 && script[1] === 0x20) {
      return AddressType.P2WSH;
    }
    if (script.length === 34 && script[0] === 0x51 && script[1] === 0x20) {
      return AddressType.P2TR;
    }
  }
  if (input.redeemScript) {
    return AddressType.P2SH_P2WPKH;
  }
  return AddressType.P2PKH;
}

/**
 * Detect output script type
 */
function detectOutputScriptType(script: Buffer): string {
  if (script.length === 25 && script[0] === 0x76) {
    return AddressType.P2PKH;
  }
  if (script.length === 23 && script[0] === 0xa9) {
    return AddressType.P2SH;
  }
  if (script.length === 22 && script[0] === 0x00 && script[1] === 0x14) {
    return AddressType.P2WPKH;
  }
  if (script.length === 34 && script[0] === 0x00 && script[1] === 0x20) {
    return AddressType.P2WSH;
  }
  if (script.length === 34 && script[0] === 0x51 && script[1] === 0x20) {
    return AddressType.P2TR;
  }
  return 'unknown';
}

/**
 * Estimate transaction virtual size
 */
function estimateVsize(psbt: bitcoin.Psbt): number {
  // Rough estimation - actual size depends on signatures
  const baseSize = 10; // Version + locktime
  const inputSize = psbt.data.inputs.length * 68; // Average input size
  const outputSize = psbt.txOutputs.length * 34; // Average output size

  // Weight = base * 4 + witness
  const weight = (baseSize + outputSize) * 4 + inputSize * 4;
  return Math.ceil(weight / 4);
}

/**
 * Finalize PSBT
 */
export function finalizePSBT(
  psbtBase64: string,
  network: string = 'mainnet',
): string {
  const psbt = parsePSBT(psbtBase64, network);
  psbt.finalizeAllInputs();
  return psbt.toBase64();
}

/**
 * Extract transaction from finalized PSBT
 */
export function extractTransaction(
  psbtBase64: string,
  network: string = 'mainnet',
): { txHex: string; txid: string } {
  const psbt = parsePSBT(psbtBase64, network);
  const tx = psbt.extractTransaction();

  return {
    txHex: tx.toHex(),
    txid: tx.getId(),
  };
}

/**
 * Combine multiple PSBTs
 */
export function combinePSBTs(
  psbts: string[],
  network: string = 'mainnet',
): string {
  if (psbts.length === 0) {
    throw new Error('No PSBTs to combine');
  }

  const net = getNetwork(network);
  const combined = bitcoin.Psbt.fromBase64(psbts[0], { network: net });

  for (let i = 1; i < psbts.length; i++) {
    const other = bitcoin.Psbt.fromBase64(psbts[i], { network: net });
    combined.combine(other);
  }

  return combined.toBase64();
}

/**
 * Validate PSBT
 */
export function validatePSBT(psbtBase64: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  try {
    const buffer = Buffer.from(psbtBase64, 'base64');

    // Check magic bytes
    if (
      buffer.length < 5 ||
      buffer[0] !== 0x70 ||
      buffer[1] !== 0x73 ||
      buffer[2] !== 0x62 ||
      buffer[3] !== 0x74 ||
      buffer[4] !== 0xff
    ) {
      errors.push('Invalid PSBT magic bytes');
    }

    // Try to parse
    bitcoin.Psbt.fromBuffer(buffer);
  } catch (error) {
    errors.push(`Parse error: ${error}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get fee information from PSBT
 */
export function getFeeInfo(
  psbtBase64: string,
  network: string = 'mainnet',
): {
  fee: number;
  feeRate: number;
  recommended: boolean;
  warning?: string;
} {
  const info = getPSBTInfo(psbtBase64, network);

  let warning: string | undefined;
  let recommended = true;

  // Check for suspicious fee
  if (info.feeRate < 1) {
    warning = 'Fee rate is very low, transaction may not confirm';
    recommended = false;
  } else if (info.feeRate > 500) {
    warning = 'Fee rate is very high';
    recommended = false;
  }

  // Check if fee is more than 10% of output
  if (info.fee > info.outputValue * 0.1) {
    warning = 'Fee is more than 10% of transaction value';
    recommended = false;
  }

  return {
    fee: info.fee,
    feeRate: info.feeRate,
    recommended,
    warning,
  };
}
