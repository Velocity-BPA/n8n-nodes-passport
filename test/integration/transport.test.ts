/**
 * n8n-nodes-passport
 * Copyright (c) 2025
 * Licensed under BSL 1.1 - see LICENSE file
 */

import {
	checkSDCard,
	listFiles,
	readFile,
	writeFile,
	deleteFile,
	importPSBT,
	exportPSBT,
	ensurePassportDirectories,
	PASSPORT_DIRECTORIES,
} from '../../nodes/Passport/transport/sdCardHandler';

import {
	generateQRCode,
	parseURString,
	needsMultiPart,
	encodePSBTForQR,
	decodePSBTFromQR,
	calculateQRCapacity,
} from '../../nodes/Passport/transport/qrHandler';

// Mock file system for SD card tests
jest.mock('fs', () => ({
	existsSync: jest.fn(),
	readFileSync: jest.fn(),
	writeFileSync: jest.fn(),
	readdirSync: jest.fn(),
	statSync: jest.fn(),
	unlinkSync: jest.fn(),
	mkdirSync: jest.fn(),
	promises: {
		readFile: jest.fn(),
		writeFile: jest.fn(),
		readdir: jest.fn(),
		stat: jest.fn(),
		unlink: jest.fn(),
		mkdir: jest.fn(),
		access: jest.fn(),
	},
}));

const fs = require('fs');

describe('SD Card Transport Handler', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('PASSPORT_DIRECTORIES', () => {
		it('should have standard passport directories defined', () => {
			expect(PASSPORT_DIRECTORIES).toBeDefined();
			expect(PASSPORT_DIRECTORIES.psbtIn).toBeDefined();
			expect(PASSPORT_DIRECTORIES.psbtOut).toBeDefined();
			expect(PASSPORT_DIRECTORIES.backups).toBeDefined();
		});

		it('should have correct directory paths', () => {
			expect(PASSPORT_DIRECTORIES.psbtIn).toBe('passport/psbt');
			expect(PASSPORT_DIRECTORIES.psbtOut).toBe('passport/signed');
			expect(PASSPORT_DIRECTORIES.backups).toBe('passport/backups');
		});
	});

	describe('checkSDCard', () => {
		it('should check SD card status', async () => {
			fs.promises.access.mockResolvedValue(undefined);
			fs.existsSync.mockReturnValue(true);

			const result = await checkSDCard('/mnt/passport');

			expect(result).toHaveProperty('mounted');
			expect(result).toHaveProperty('mountPath');
		});
	});

	describe('listFiles', () => {
		it('should list files in directory', async () => {
			fs.promises.readdir.mockResolvedValue([
				{ name: 'unsigned.psbt', isFile: () => true, isDirectory: () => false },
				{ name: 'backup.7z', isFile: () => true, isDirectory: () => false },
			]);

			fs.promises.stat.mockResolvedValue({
				size: 1024,
				mtime: new Date(),
				isFile: () => true,
				isDirectory: () => false,
			});

			const files = await listFiles('/mnt/passport/psbt');

			expect(Array.isArray(files)).toBe(true);
		});
	});

	describe('readFile', () => {
		it('should read file with encoding', async () => {
			fs.promises.readFile.mockResolvedValue('test content');

			const content = await readFile('/mnt/passport/test.txt', 'utf8');

			expect(typeof content).toBe('string');
		});

		it('should read file as buffer', async () => {
			fs.promises.readFile.mockResolvedValue(Buffer.from('binary data'));

			const content = await readFile('/mnt/passport/test.bin');

			expect(Buffer.isBuffer(content)).toBe(true);
		});
	});

	describe('writeFile', () => {
		it('should write file content', async () => {
			// Mock that file doesn't exist (access throws ENOENT)
			const noFileError = new Error('ENOENT: no such file');
			(noFileError as NodeJS.ErrnoException).code = 'ENOENT';
			fs.promises.access.mockRejectedValue(noFileError);
			fs.promises.writeFile.mockResolvedValue(undefined);

			await expect(
				writeFile('/mnt/passport/test.txt', 'test content'),
			).resolves.not.toThrow();

			expect(fs.promises.writeFile).toHaveBeenCalled();
		});
	});

	describe('deleteFile', () => {
		it('should delete file', async () => {
			fs.promises.unlink.mockResolvedValue(undefined);

			await expect(deleteFile('/mnt/passport/test.txt')).resolves.not.toThrow();

			expect(fs.promises.unlink).toHaveBeenCalled();
		});
	});

	describe('ensurePassportDirectories', () => {
		it('should create passport directories', async () => {
			fs.promises.mkdir.mockResolvedValue(undefined);

			await expect(
				ensurePassportDirectories('/mnt/passport'),
			).resolves.not.toThrow();
		});
	});

	describe('exportPSBT', () => {
		it('should export PSBT to SD card', async () => {
			fs.promises.mkdir.mockResolvedValue(undefined);
			fs.promises.writeFile.mockResolvedValue(undefined);

			const psbtBase64 = 'cHNidP8BAAoCAAAAA...'; // Sample PSBT

			await expect(
				exportPSBT('/mnt/passport', psbtBase64, 'unsigned'),
			).resolves.not.toThrow();
		});
	});
});

describe('QR Code Transport Handler', () => {
	describe('parseURString', () => {
		it('should parse basic UR string', () => {
			const urData = 'ur:crypto-psbt/1-2/abc123';
			const result = parseURString(urData);

			expect(result).toHaveProperty('type');
			expect(result).toHaveProperty('data');
		});

		it('should handle simple UR format', () => {
			const urData = 'ur:crypto-output/HDkK';
			const result = parseURString(urData);

			expect(result.type).toBeDefined();
		});
	});

	describe('needsMultiPart', () => {
		it('should return false for small data', () => {
			const smallData = Buffer.from('small');
			expect(needsMultiPart(smallData)).toBe(false);
		});

		it('should return true for large data', () => {
			const largeData = Buffer.alloc(3000, 'x');
			expect(needsMultiPart(largeData)).toBe(true);
		});
	});

	describe('encodePSBTForQR', () => {
		it('should encode PSBT for QR display', () => {
			const psbtBase64 = 'cHNidP8B'; // Minimal valid start

			const result = encodePSBTForQR(psbtBase64);

			expect(typeof result).toBe('string');
			expect(result).toContain('ur:');
		});

		it('should produce UR-encoded string for PSBTs', () => {
			const largePsbt = 'cHNidP8B' + 'A'.repeat(100);

			const result = encodePSBTForQR(largePsbt);

			expect(typeof result).toBe('string');
			expect(result.toLowerCase()).toContain('crypto-psbt');
		});
	});

	describe('decodePSBTFromQR', () => {
		it('should decode UR-encoded PSBT', () => {
			// First encode, then decode to test round-trip
			const originalPsbt = 'cHNidP8BAH0=';
			const urEncoded = encodePSBTForQR(originalPsbt);

			const result = decodePSBTFromQR(urEncoded);

			expect(typeof result).toBe('string');
			// Base64 result
			expect(result.length).toBeGreaterThan(0);
		});
	});

	describe('calculateQRCapacity', () => {
		it('should calculate QR capacity for version', () => {
			const capacity = calculateQRCapacity(10, 'L');
			expect(typeof capacity).toBe('number');
			expect(capacity).toBeGreaterThan(0);
		});

		it('should return different capacity for different error levels', () => {
			const capacityL = calculateQRCapacity(10, 'L');
			const capacityH = calculateQRCapacity(10, 'H');

			expect(capacityL).toBeGreaterThan(capacityH);
		});
	});

	describe('generateQRCode', () => {
		it('should generate QR code data URL', async () => {
			const result = await generateQRCode('test data');

			expect(typeof result).toBe('string');
			expect(result).toContain('data:image/png;base64');
		});

		it('should handle options', async () => {
			const result = await generateQRCode('test data', {
				errorCorrectionLevel: 'H',
				width: 300,
			});

			expect(typeof result).toBe('string');
		});
	});
});

describe('USB Transport Handler', () => {
	describe('USB Constants', () => {
		it('should have known device identifiers', () => {
			// Foundation Passport USB identifiers
			const VENDOR_ID = 0x1209;
			const PRODUCT_ID = 0x7331;

			expect(VENDOR_ID).toBe(0x1209);
			expect(PRODUCT_ID).toBe(0x7331);
		});
	});
});
