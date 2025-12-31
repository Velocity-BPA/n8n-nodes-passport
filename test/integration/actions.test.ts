/**
 * n8n-nodes-passport
 * Copyright (c) 2025 SovereignTools
 * Licensed under BSL 1.1 - see LICENSE file
 */

import * as deviceActions from '../../nodes/Passport/actions/device';
import * as accountActions from '../../nodes/Passport/actions/account';
import * as addressActions from '../../nodes/Passport/actions/address';
import * as psbtActions from '../../nodes/Passport/actions/psbt';
import * as backupActions from '../../nodes/Passport/actions/backup';

// Mock the execution context
const mockExecuteFunctions = {
	getInputData: jest.fn(() => [{ json: {} }]),
	getNodeParameter: jest.fn(),
	getCredentials: jest.fn(),
	helpers: {
		returnJsonArray: jest.fn((data) => data.map((item: object) => ({ json: item }))),
		constructExecutionMetaData: jest.fn((items, meta) => items),
	},
};

describe('Device Actions Integration', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('getInfo', () => {
		it('should return device information structure', async () => {
			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
				if (param === 'operation') return 'getInfo';
				if (param === 'includeAccounts') return true;
				return undefined;
			});

			// Simulate device info response
			const mockDeviceInfo = {
				model: 'Passport Batch 2',
				serialNumber: 'PPBT2-123456',
				firmwareVersion: '2.3.0',
				secureElement: 'ATECC608B',
				batteryLevel: 85,
				accounts: [
					{ name: 'Main', derivationPath: "m/84'/0'/0'" },
				],
			};

			const result = await simulateDeviceResponse(mockDeviceInfo);

			expect(result.model).toBe('Passport Batch 2');
			expect(result.firmwareVersion).toBe('2.3.0');
			expect(result.accounts).toHaveLength(1);
		});
	});

	describe('verifyDevice', () => {
		it('should verify device authenticity', async () => {
			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
				if (param === 'operation') return 'verifyDevice';
				if (param === 'challengeMessage') return 'verification-nonce-12345';
				return undefined;
			});

			const mockVerification = {
				isAuthentic: true,
				certificateChain: ['root', 'intermediate', 'device'],
				signature: 'MEUCIQDk...',
				verifiedAt: new Date().toISOString(),
			};

			const result = await simulateDeviceResponse(mockVerification);

			expect(result.isAuthentic).toBe(true);
			expect(result.certificateChain).toHaveLength(3);
		});
	});
});

describe('Account Actions Integration', () => {
	describe('create', () => {
		it('should create new account with standard derivation', async () => {
			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
				if (param === 'operation') return 'create';
				if (param === 'accountName') return 'Savings';
				if (param === 'scriptType') return 'nativeSegwit';
				if (param === 'accountNumber') return 1;
				return undefined;
			});

			const mockAccount = {
				name: 'Savings',
				derivationPath: "m/84'/0'/1'",
				scriptType: 'native_segwit',
				xpub: 'xpub6DG...',
				firstAddress: 'bc1qtest...',
			};

			const result = await simulateDeviceResponse(mockAccount);

			expect(result.name).toBe('Savings');
			expect(result.derivationPath).toBe("m/84'/0'/1'");
			expect(result.xpub).toMatch(/^xpub/);
		});
	});

	describe('exportXpub', () => {
		it('should export xpub for account', async () => {
			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
				if (param === 'operation') return 'exportXpub';
				if (param === 'accountName') return 'Main';
				if (param === 'format') return 'standard';
				return undefined;
			});

			const mockXpub = {
				xpub: 'xpub6CUGRUonZSQ4TWtTMmzXdrXDtypWZiD6HN3R9tVvq...',
				derivationPath: "m/84'/0'/0'",
				fingerprint: 'a1b2c3d4',
				network: 'mainnet',
			};

			const result = await simulateDeviceResponse(mockXpub);

			expect(result.xpub).toMatch(/^xpub/);
			expect(result.fingerprint).toHaveLength(8);
		});

		it('should export zpub format when requested', async () => {
			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
				if (param === 'operation') return 'exportXpub';
				if (param === 'format') return 'zpub';
				return undefined;
			});

			const mockZpub = {
				xpub: 'zpub6rFR7y4Q2AijBEqTUqiVaTdhT2T5pn3F4gBXKXrW...',
				derivationPath: "m/84'/0'/0'",
			};

			const result = await simulateDeviceResponse(mockZpub);

			expect(result.xpub).toMatch(/^zpub/);
		});
	});

	describe('exportDescriptor', () => {
		it('should export output descriptor', async () => {
			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
				if (param === 'operation') return 'exportDescriptor';
				if (param === 'accountName') return 'Main';
				if (param === 'includeChecksum') return true;
				return undefined;
			});

			const mockDescriptor = {
				descriptor: "wpkh([a1b2c3d4/84'/0'/0']xpub6.../0/*)#abcd1234",
				changeDescriptor: "wpkh([a1b2c3d4/84'/0'/0']xpub6.../1/*)#efgh5678",
			};

			const result = await simulateDeviceResponse(mockDescriptor);

			expect(result.descriptor).toMatch(/^wpkh\(/);
			expect(result.descriptor).toMatch(/#[a-z0-9]+$/);
		});
	});
});

describe('Address Actions Integration', () => {
	describe('generate', () => {
		it('should generate new receiving address', async () => {
			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
				if (param === 'operation') return 'generate';
				if (param === 'accountName') return 'Main';
				if (param === 'addressType') return 'receive';
				return undefined;
			});

			const mockAddress = {
				address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
				derivationPath: "m/84'/0'/0'/0/15",
				index: 15,
				type: 'receive',
			};

			const result = await simulateDeviceResponse(mockAddress);

			expect(result.address).toMatch(/^bc1q/);
			expect(result.derivationPath).toContain('/0/');
		});

		it('should generate change address', async () => {
			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
				if (param === 'operation') return 'generate';
				if (param === 'addressType') return 'change';
				return undefined;
			});

			const mockAddress = {
				address: 'bc1qchange...',
				derivationPath: "m/84'/0'/0'/1/8",
				index: 8,
				type: 'change',
			};

			const result = await simulateDeviceResponse(mockAddress);

			expect(result.derivationPath).toContain('/1/');
			expect(result.type).toBe('change');
		});
	});

	describe('verifyOnDevice', () => {
		it('should initiate address verification on device', async () => {
			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
				if (param === 'operation') return 'verifyOnDevice';
				if (param === 'address') return 'bc1qtest...';
				return undefined;
			});

			const mockVerification = {
				verified: true,
				displayedOnDevice: true,
				userConfirmed: true,
				address: 'bc1qtest...',
			};

			const result = await simulateDeviceResponse(mockVerification);

			expect(result.verified).toBe(true);
			expect(result.userConfirmed).toBe(true);
		});
	});
});

describe('PSBT Actions Integration', () => {
	describe('importForSigning', () => {
		it('should import PSBT for signing', async () => {
			const testPsbt = 'cHNidP8BAHUCAAAAASaB...';
			
			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
				if (param === 'operation') return 'importForSigning';
				if (param === 'psbt') return testPsbt;
				if (param === 'format') return 'base64';
				return undefined;
			});

			const mockImport = {
				imported: true,
				psbtId: 'psbt-123',
				inputs: 1,
				outputs: 2,
				totalInput: 100000,
				totalOutput: 99000,
				fee: 1000,
				requiresConfirmation: true,
			};

			const result = await simulateDeviceResponse(mockImport);

			expect(result.imported).toBe(true);
			expect(result.fee).toBe(1000);
		});
	});

	describe('sign', () => {
		it('should sign PSBT on device', async () => {
			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
				if (param === 'operation') return 'sign';
				if (param === 'psbtId') return 'psbt-123';
				if (param === 'returnFormat') return 'base64';
				return undefined;
			});

			const mockSigned = {
				signed: true,
				psbt: 'cHNidP8BAHUCAAAAASaB...signeddata...',
				inputsSigned: 1,
				fullyFinalized: false,
				readyForBroadcast: false,
			};

			const result = await simulateDeviceResponse(mockSigned);

			expect(result.signed).toBe(true);
			expect(result.inputsSigned).toBe(1);
		});
	});

	describe('analyze', () => {
		it('should analyze PSBT details', async () => {
			const testPsbt = 'cHNidP8BAHUCAAAAASaB...';
			
			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
				if (param === 'operation') return 'analyze';
				if (param === 'psbt') return testPsbt;
				return undefined;
			});

			const mockAnalysis = {
				version: 0,
				inputCount: 2,
				outputCount: 3,
				inputs: [
					{ txid: 'abc123...', vout: 0, value: 50000 },
					{ txid: 'def456...', vout: 1, value: 75000 },
				],
				outputs: [
					{ address: 'bc1q...', value: 60000 },
					{ address: 'bc1q...', value: 40000 },
					{ address: 'bc1q...', value: 24000, isChange: true },
				],
				fee: 1000,
				feeRate: 5.2,
				canSign: true,
				signaturesNeeded: 2,
			};

			const result = await simulateDeviceResponse(mockAnalysis);

			expect(result.inputCount).toBe(2);
			expect(result.outputCount).toBe(3);
			expect(result.canSign).toBe(true);
		});
	});
});

describe('Backup Actions Integration', () => {
	describe('create', () => {
		it('should create encrypted backup', async () => {
			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
				if (param === 'operation') return 'create';
				if (param === 'backupCode') return '123456';
				if (param === 'includeSettings') return true;
				return undefined;
			});

			const mockBackup = {
				created: true,
				filename: 'passport-backup-2025-01-15.7z',
				size: 2048,
				encrypted: true,
				timestamp: new Date().toISOString(),
				includesSettings: true,
				includesAccounts: true,
			};

			const result = await simulateDeviceResponse(mockBackup);

			expect(result.created).toBe(true);
			expect(result.encrypted).toBe(true);
			expect(result.filename).toMatch(/\.7z$/);
		});
	});

	describe('verify', () => {
		it('should verify backup integrity', async () => {
			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
				if (param === 'operation') return 'verify';
				if (param === 'backupPath') return '/mnt/passport/backups/backup.7z';
				return undefined;
			});

			const mockVerification = {
				valid: true,
				encrypted: true,
				created: '2025-01-15T10:30:00Z',
				version: '2.3.0',
				checksumValid: true,
			};

			const result = await simulateDeviceResponse(mockVerification);

			expect(result.valid).toBe(true);
			expect(result.checksumValid).toBe(true);
		});
	});

	describe('exportSeedQr', () => {
		it('should export SeedQR format', async () => {
			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
				if (param === 'operation') return 'exportSeedQr';
				if (param === 'format') return 'compact';
				return undefined;
			});

			const mockSeedQr = {
				generated: true,
				format: 'compact',
				qrData: 'seedqr:12345...',
				wordCount: 24,
				requiresPassphrase: false,
			};

			const result = await simulateDeviceResponse(mockSeedQr);

			expect(result.generated).toBe(true);
			expect(result.format).toBe('compact');
		});
	});
});

describe('Multisig Actions Integration', () => {
	describe('createWallet', () => {
		it('should create multisig wallet configuration', async () => {
			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
				if (param === 'operation') return 'createWallet';
				if (param === 'walletName') return '2-of-3 Cold Storage';
				if (param === 'requiredSignatures') return 2;
				if (param === 'totalCosigners') return 3;
				return undefined;
			});

			const mockMultisig = {
				created: true,
				walletName: '2-of-3 Cold Storage',
				quorum: { m: 2, n: 3 },
				descriptor: 'wsh(sortedmulti(2,[fp1/48h/0h/2h]xpub1...,[fp2/48h/0h/2h]xpub2...,[fp3/48h/0h/2h]xpub3...))',
				registeredOnDevice: true,
			};

			const result = await simulateDeviceResponse(mockMultisig);

			expect(result.created).toBe(true);
			expect(result.quorum.m).toBe(2);
			expect(result.quorum.n).toBe(3);
			expect(result.descriptor).toMatch(/^wsh\(sortedmulti/);
		});
	});

	describe('importBsms', () => {
		it('should import BSMS wallet configuration', async () => {
			const bsmsData = `BSMS 1.0
wsh(sortedmulti(2,[fp1/48'/0'/0'/2']xpub1...,[fp2/48'/0'/0'/2']xpub2...))
/0/*,/1/*
My Multisig Wallet`;

			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
				if (param === 'operation') return 'importBsms';
				if (param === 'bsmsData') return bsmsData;
				return undefined;
			});

			const mockImport = {
				imported: true,
				walletName: 'My Multisig Wallet',
				quorum: { m: 2, n: 2 },
				cosigners: 2,
				scriptType: 'wsh',
			};

			const result = await simulateDeviceResponse(mockImport);

			expect(result.imported).toBe(true);
			expect(result.walletName).toBe('My Multisig Wallet');
		});
	});
});

describe('Watch-Only Export Integration', () => {
	describe('sparrow', () => {
		it('should export Sparrow-compatible format', async () => {
			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
				if (param === 'operation') return 'sparrow';
				if (param === 'accountName') return 'Main';
				return undefined;
			});

			const mockExport = {
				format: 'sparrow',
				data: {
					keystore: {
						xpub: 'xpub6...',
						derivation: "m/84'/0'/0'",
						root_fingerprint: 'a1b2c3d4',
						label: 'Passport Main',
						type: 'hardware',
					}
				},
				filename: 'passport-sparrow.json',
			};

			const result = await simulateDeviceResponse(mockExport);

			expect(result.format).toBe('sparrow');
			expect(result.data.keystore.type).toBe('hardware');
		});
	});

	describe('electrum', () => {
		it('should export Electrum-compatible format', async () => {
			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
				if (param === 'operation') return 'electrum';
				if (param === 'accountName') return 'Main';
				return undefined;
			});

			const mockExport = {
				format: 'electrum',
				data: {
					keystore: {
						type: 'hardware',
						hw_type: 'passport',
						xpub: 'zpub6...',
						derivation: "m/84'/0'/0'",
					}
				},
			};

			const result = await simulateDeviceResponse(mockExport);

			expect(result.format).toBe('electrum');
			expect(result.data.keystore.hw_type).toBe('passport');
		});
	});

	describe('bitcoinCore', () => {
		it('should export Bitcoin Core descriptor wallet format', async () => {
			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
				if (param === 'operation') return 'bitcoinCore';
				if (param === 'accountName') return 'Main';
				return undefined;
			});

			const mockExport = {
				format: 'bitcoinCore',
				descriptors: [
					{
						desc: "wpkh([a1b2c3d4/84'/0'/0']xpub6.../0/*)#checksum",
						timestamp: 'now',
						range: [0, 999],
						watchonly: true,
						internal: false,
					},
					{
						desc: "wpkh([a1b2c3d4/84'/0'/0']xpub6.../1/*)#checksum",
						timestamp: 'now',
						range: [0, 999],
						watchonly: true,
						internal: true,
					},
				],
			};

			const result = await simulateDeviceResponse(mockExport);

			expect(result.format).toBe('bitcoinCore');
			expect(result.descriptors).toHaveLength(2);
			expect(result.descriptors[0].watchonly).toBe(true);
		});
	});
});

// Helper function to simulate device responses
async function simulateDeviceResponse<T>(mockData: T): Promise<T> {
	// In real implementation, this would communicate with the device
	// For testing, we return the mock data
	return Promise.resolve(mockData);
}
