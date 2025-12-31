/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * SD Card Handler
 *
 * Handles file operations for Passport's microSD card communication.
 * Used for transferring PSBTs, backups, and configuration files.
 */

export interface SDCardStatus {
  /** Whether SD card is mounted */
  mounted: boolean;
  /** Mount path */
  mountPath: string;
  /** Total space in bytes */
  totalSpace: number;
  /** Free space in bytes */
  freeSpace: number;
  /** File system type */
  fileSystem: string;
  /** Whether card is writable */
  writable: boolean;
}

export interface SDCardFile {
  /** File name */
  name: string;
  /** Full path */
  path: string;
  /** File size in bytes */
  size: number;
  /** Last modified date */
  modified: Date;
  /** Whether file is a directory */
  isDirectory: boolean;
  /** File extension */
  extension: string;
}

export interface PSBTFile extends SDCardFile {
  /** PSBT in base64 format */
  psbt?: string;
  /** Whether PSBT is signed */
  isSigned?: boolean;
}

/**
 * Known Passport SD card directories
 */
export const PASSPORT_DIRECTORIES = {
  /** PSBTs waiting to be signed */
  psbtIn: 'passport/psbt',
  /** Signed PSBTs ready for broadcast */
  psbtOut: 'passport/signed',
  /** Encrypted backups */
  backups: 'passport/backups',
  /** Firmware updates */
  firmware: 'passport/firmware',
  /** Multisig configurations */
  multisig: 'passport/multisig',
  /** Account exports */
  accounts: 'passport/accounts',
};

/**
 * Check if SD card is available
 */
export async function checkSDCard(mountPath: string): Promise<SDCardStatus> {
  try {
    const stats = await fs.promises.stat(mountPath);

    if (!stats.isDirectory()) {
      return {
        mounted: false,
        mountPath,
        totalSpace: 0,
        freeSpace: 0,
        fileSystem: 'unknown',
        writable: false,
      };
    }

    // Check writability
    const testFile = path.join(mountPath, '.n8n-passport-test');
    let writable = false;
    try {
      await fs.promises.writeFile(testFile, 'test');
      await fs.promises.unlink(testFile);
      writable = true;
    } catch {
      writable = false;
    }

    // Get space info (platform-specific, simplified here)
    const spaceInfo = await getSpaceInfo(mountPath);

    return {
      mounted: true,
      mountPath,
      totalSpace: spaceInfo.total,
      freeSpace: spaceInfo.free,
      fileSystem: 'FAT32', // Passport uses FAT32
      writable,
    };
  } catch (error) {
    return {
      mounted: false,
      mountPath,
      totalSpace: 0,
      freeSpace: 0,
      fileSystem: 'unknown',
      writable: false,
    };
  }
}

/**
 * Get disk space info (simplified)
 */
async function getSpaceInfo(
  _mountPath: string,
): Promise<{ total: number; free: number }> {
  // In production, use a library like diskusage
  // This is a simplified placeholder
  return {
    total: 32 * 1024 * 1024 * 1024, // 32GB default
    free: 16 * 1024 * 1024 * 1024, // 16GB free
  };
}

/**
 * List files in SD card directory
 */
export async function listFiles(
  sdCardPath: string,
  subDirectory?: string,
  options?: {
    extensions?: string[];
    recursive?: boolean;
  },
): Promise<SDCardFile[]> {
  const targetPath = subDirectory
    ? path.join(sdCardPath, subDirectory)
    : sdCardPath;

  const files: SDCardFile[] = [];

  try {
    const entries = await fs.promises.readdir(targetPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(targetPath, entry.name);
      const stats = await fs.promises.stat(fullPath);
      const extension = path.extname(entry.name).toLowerCase();

      // Filter by extension if specified
      if (options?.extensions && !entry.isDirectory()) {
        if (!options.extensions.includes(extension)) {
          continue;
        }
      }

      const file: SDCardFile = {
        name: entry.name,
        path: fullPath,
        size: stats.size,
        modified: stats.mtime,
        isDirectory: entry.isDirectory(),
        extension,
      };

      files.push(file);

      // Recursive listing
      if (entry.isDirectory() && options?.recursive) {
        const subFiles = await listFiles(sdCardPath, fullPath, options);
        files.push(...subFiles);
      }
    }

    return files;
  } catch (error) {
    throw new Error(`Failed to list files: ${error}`);
  }
}

/**
 * Read file from SD card
 */
export async function readFile(
  filePath: string,
  encoding: BufferEncoding,
): Promise<string>;
export async function readFile(
  filePath: string,
): Promise<Buffer>;
export async function readFile(
  filePath: string,
  encoding?: BufferEncoding,
): Promise<string | Buffer> {
  try {
    if (encoding) {
      return await fs.promises.readFile(filePath, { encoding });
    }
    return await fs.promises.readFile(filePath);
  } catch (error) {
    throw new Error(`Failed to read file: ${error}`);
  }
}

/**
 * Write file to SD card
 */
export async function writeFile(
  filePath: string,
  data: string | Buffer,
  options?: {
    createDir?: boolean;
    overwrite?: boolean;
  },
): Promise<void> {
  try {
    const dir = path.dirname(filePath);

    // Create directory if needed
    if (options?.createDir) {
      await fs.promises.mkdir(dir, { recursive: true });
    }

    // Check if file exists
    if (!options?.overwrite) {
      try {
        await fs.promises.access(filePath);
        throw new Error('File already exists and overwrite is disabled');
      } catch (err: unknown) {
        const error = err as NodeJS.ErrnoException;
        if (error.code !== 'ENOENT') {
          throw err;
        }
      }
    }

    await fs.promises.writeFile(filePath, data);
  } catch (error) {
    throw new Error(`Failed to write file: ${error}`);
  }
}

/**
 * Delete file from SD card
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    throw new Error(`Failed to delete file: ${error}`);
  }
}

/**
 * Import PSBT from SD card
 */
export async function importPSBT(
  sdCardPath: string,
  fileName?: string,
): Promise<PSBTFile[]> {
  const psbtDir = path.join(sdCardPath, PASSPORT_DIRECTORIES.psbtIn);
  const signedDir = path.join(sdCardPath, PASSPORT_DIRECTORIES.psbtOut);

  const psbts: PSBTFile[] = [];

  // Check both directories
  for (const dir of [signedDir, psbtDir]) {
    try {
      const files = await listFiles(sdCardPath, dir, {
        extensions: ['.psbt', '.txn', '.txt'],
      });

      for (const file of files) {
        if (fileName && file.name !== fileName) {
          continue;
        }

        const content = await readFile(file.path, 'utf8');

        // Determine if signed by checking directory
        const isSigned = dir === signedDir;

        psbts.push({
          ...file,
          psbt: content.trim(),
          isSigned,
        });
      }
    } catch {
      // Directory may not exist
    }
  }

  return psbts;
}

/**
 * Export PSBT to SD card for signing
 */
export async function exportPSBT(
  sdCardPath: string,
  psbtBase64: string,
  fileName: string,
): Promise<string> {
  const psbtDir = path.join(sdCardPath, PASSPORT_DIRECTORIES.psbtIn);
  const filePath = path.join(psbtDir, fileName.endsWith('.psbt') ? fileName : `${fileName}.psbt`);

  await writeFile(filePath, psbtBase64, { createDir: true, overwrite: true });

  return filePath;
}

/**
 * Import backup from SD card
 */
export async function importBackup(
  sdCardPath: string,
  backupName?: string,
): Promise<{ path: string; data: Buffer }[]> {
  const backupDir = path.join(sdCardPath, PASSPORT_DIRECTORIES.backups);

  const backups: { path: string; data: Buffer }[] = [];

  try {
    const files = await listFiles(sdCardPath, backupDir, {
      extensions: ['.7z', '.bin', '.backup'],
    });

    for (const file of files) {
      if (backupName && file.name !== backupName) {
        continue;
      }

      const data = await readFile(file.path) as Buffer;
      backups.push({ path: file.path, data });
    }
  } catch {
    // Directory may not exist
  }

  return backups;
}

/**
 * Export backup to SD card
 */
export async function exportBackup(
  sdCardPath: string,
  backupData: Buffer,
  backupName: string,
): Promise<string> {
  const backupDir = path.join(sdCardPath, PASSPORT_DIRECTORIES.backups);
  const filePath = path.join(backupDir, backupName);

  await writeFile(filePath, backupData, { createDir: true, overwrite: false });

  return filePath;
}

/**
 * Ensure Passport directory structure exists
 */
export async function ensurePassportDirectories(
  sdCardPath: string,
): Promise<void> {
  for (const dir of Object.values(PASSPORT_DIRECTORIES)) {
    const fullPath = path.join(sdCardPath, dir);
    await fs.promises.mkdir(fullPath, { recursive: true });
  }
}

/**
 * Verify file integrity
 */
export async function verifyFile(
  filePath: string,
  _expectedHash?: string,
): Promise<{ valid: boolean; hash: string }> {
  const crypto = await import('crypto');
  const content = await readFile(filePath) as Buffer;
  const hash = crypto.createHash('sha256').update(content).digest('hex');

  return {
    valid: !_expectedHash || hash === _expectedHash,
    hash,
  };
}

/**
 * Get SD card info for Passport
 */
export async function getPassportSDInfo(
  sdCardPath: string,
): Promise<{
  status: SDCardStatus;
  directories: Record<string, boolean>;
  psbtCount: number;
  backupCount: number;
}> {
  const status = await checkSDCard(sdCardPath);

  if (!status.mounted) {
    return {
      status,
      directories: {},
      psbtCount: 0,
      backupCount: 0,
    };
  }

  const directories: Record<string, boolean> = {};
  let psbtCount = 0;
  let backupCount = 0;

  for (const [name, dir] of Object.entries(PASSPORT_DIRECTORIES)) {
    const fullPath = path.join(sdCardPath, dir);
    try {
      await fs.promises.access(fullPath);
      directories[name] = true;

      if (name === 'psbtIn' || name === 'psbtOut') {
        const files = await listFiles(sdCardPath, dir, {
          extensions: ['.psbt', '.txn'],
        });
        psbtCount += files.length;
      }

      if (name === 'backups') {
        const files = await listFiles(sdCardPath, dir, {
          extensions: ['.7z', '.bin', '.backup'],
        });
        backupCount = files.length;
      }
    } catch {
      directories[name] = false;
    }
  }

  return {
    status,
    directories,
    psbtCount,
    backupCount,
  };
}
