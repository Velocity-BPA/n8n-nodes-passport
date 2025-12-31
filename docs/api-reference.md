# API Reference

Complete reference for all Passport node operations.

## Resources Overview

| Resource | Operations | Description |
|----------|------------|-------------|
| Device | 12 | Device info, verification, status |
| Account | 12 | Account management, xpub export |
| Address | 10 | Address generation, verification |
| QR Code | 11 | QR/BBQr encoding and decoding |
| SD Card | 11 | File operations on SD card |
| PSBT | 14 | Transaction signing workflow |
| Transaction | 9 | Transaction creation, broadcast |
| Message Signing | 7 | Sign and verify messages |
| Multi-Signature | 13 | Multisig wallet operations |
| Watch-Only Export | 10 | Export to wallet software |
| Envoy | 7 | Envoy app integration |
| Casa | 4 | Casa vault integration |
| Unchained | 4 | Unchained Capital integration |
| Backup | 9 | Backup management |
| Seed | 9 | Seed phrase operations |
| Security | 10 | Security checks, verification |
| PIN | 5 | PIN management |
| Firmware | 8 | Firmware updates |
| Extensions | 6 | Extension management |
| Health Check | 7 | Device diagnostics |
| Utility | 11 | Bitcoin utilities |

---

## Device

### getInfo

Get comprehensive device information.

**Parameters:**
- `includeAccounts` (boolean): Include account list
- `includeFirmware` (boolean): Include firmware details

**Returns:**
```json
{
  "model": "Passport Batch 2",
  "serialNumber": "PPBT2-123456",
  "firmwareVersion": "2.3.0",
  "batteryLevel": 85,
  "accounts": [...]
}
```

### verifyDevice

Verify device authenticity using Foundation's supply chain verification.

**Parameters:**
- `challengeMessage` (string): Optional challenge nonce

**Returns:**
```json
{
  "isAuthentic": true,
  "certificateChain": ["root", "intermediate", "device"],
  "signature": "..."
}
```

### getBatteryStatus

Get battery level and charging status.

### getCameraStatus

Test and get camera functionality status.

### getSecureElementInfo

Get secure element (ATECC608B) information.

### getStorageInfo

Get internal storage usage.

### listAccounts

List all accounts on device.

### getSettings

Get device settings.

### factoryReset

Initiate factory reset (requires confirmation).

### reboot

Reboot the device.

### powerOff

Power off the device.

### getSupplyChainInfo

Get supply chain verification details.

---

## Account

### create

Create a new account.

**Parameters:**
- `accountName` (string): Name for the account
- `scriptType` (enum): native_segwit, nested_segwit, legacy, taproot
- `accountNumber` (number): BIP44 account number

### list

List all accounts.

### delete

Delete an account (requires confirmation).

### rename

Rename an existing account.

### exportXpub

Export extended public key.

**Parameters:**
- `accountName` (string): Account to export
- `format` (enum): standard, zpub, ypub, vpub

**Returns:**
```json
{
  "xpub": "xpub6CUGRUon...",
  "derivationPath": "m/84'/0'/0'",
  "fingerprint": "a1b2c3d4"
}
```

### exportDescriptor

Export output descriptor.

**Parameters:**
- `accountName` (string): Account to export
- `includeChecksum` (boolean): Add descriptor checksum

### getDerivationPath

Get derivation path for account.

### setDefaultAccount

Set default account for operations.

### getAccountInfo

Get detailed account information.

### verifyAccount

Verify account derivation.

### importAccount

Import account from descriptor.

---

## Address

### generate

Generate new address.

**Parameters:**
- `accountName` (string): Account to use
- `addressType` (enum): receive, change
- `index` (number): Optional specific index

**Returns:**
```json
{
  "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  "derivationPath": "m/84'/0'/0'/0/15",
  "index": 15
}
```

### verifyOnDevice

Display address on device for verification.

### getRange

Get a range of addresses.

**Parameters:**
- `startIndex` (number): Starting index
- `count` (number): Number of addresses

### getCurrentIndex

Get current address index.

### getGapLimit

Get address gap limit setting.

### setGapLimit

Set address gap limit.

### validateAddress

Validate a Bitcoin address.

### getAddressInfo

Get address derivation information.

### findAddress

Find index of a known address.

### deriveAtPath

Derive address at specific path.

---

## QR Code

### encode

Encode data as QR code.

**Parameters:**
- `data` (string): Data to encode
- `format` (enum): standard, bbqr, ur

### decode

Decode QR code data.

### generateBbqr

Generate BBQr animated sequence.

### assembleBbqr

Assemble BBQr parts into complete data.

### generateUr

Generate UR (Uniform Resource) encoded data.

### parseUr

Parse UR encoded data.

### scanFromCamera

Initiate camera scanning.

### getProgress

Get BBQr assembly progress.

### displayOnDevice

Display QR on Passport screen.

### exportAsImage

Export QR as image file.

### estimatePartCount

Estimate BBQr part count for data size.

---

## SD Card

### listFiles

List files in directory.

**Parameters:**
- `path` (string): Directory path
- `extension` (string): Filter by extension

### readFile

Read file contents.

### writeFile

Write data to file.

### deleteFile

Delete a file.

### createDirectory

Create a directory.

### findPsbtFiles

Find PSBT files on card.

### importPsbt

Import PSBT from file.

### exportPsbt

Export PSBT to file.

### getSpaceInfo

Get SD card space information.

### formatCard

Format SD card (requires confirmation).

### ejectSafely

Safely eject SD card.

---

## PSBT

### importForSigning

Import PSBT for signing.

**Parameters:**
- `psbt` (string): PSBT data (base64 or hex)
- `format` (enum): base64, hex

**Returns:**
```json
{
  "imported": true,
  "inputs": 2,
  "outputs": 3,
  "fee": 1500,
  "requiresConfirmation": true
}
```

### sign

Sign imported PSBT on device.

### finalize

Finalize signed PSBT.

### extractTransaction

Extract raw transaction from finalized PSBT.

### analyze

Analyze PSBT details.

### combine

Combine multiple PSBTs (for multisig).

### validateInputs

Validate PSBT inputs belong to device.

### getSigningProgress

Get signing progress for multisig.

### addInput

Add input to PSBT.

### addOutput

Add output to PSBT.

### updateInputs

Update PSBT inputs with UTXO data.

### serializeForExport

Serialize PSBT for export.

### convertFormat

Convert between PSBT formats.

### checkCanSign

Check if device can sign this PSBT.

---

## Transaction

### create

Create unsigned transaction.

**Parameters:**
- `inputs` (array): Transaction inputs
- `outputs` (array): Transaction outputs
- `feeRate` (number): Fee rate in sat/vB

### signAndFinalize

Sign and finalize transaction.

### broadcast

Broadcast signed transaction.

### getStatus

Get transaction status.

### estimateFee

Estimate transaction fee.

### decodeRaw

Decode raw transaction hex.

### calculateTxid

Calculate transaction ID.

### verifySignatures

Verify transaction signatures.

### createRbf

Create RBF (replace-by-fee) transaction.

---

## Message Signing

### signMessage

Sign a message.

**Parameters:**
- `message` (string): Message to sign
- `derivationPath` (string): Path for signing key
- `format` (enum): standard, electrum

**Returns:**
```json
{
  "signature": "H3nKl...",
  "address": "bc1q...",
  "message": "..."
}
```

### verifySignature

Verify a message signature.

### signWithAccount

Sign using account's default key.

### signWithAddress

Sign with specific address.

### getBip322Signature

Get BIP-322 format signature.

### verifyBip322

Verify BIP-322 signature.

### listSignedMessages

List previously signed messages.

---

## Multi-Signature

### createWallet

Create multisig wallet.

**Parameters:**
- `walletName` (string): Wallet name
- `requiredSignatures` (number): M in M-of-N
- `totalCosigners` (number): N in M-of-N

### importCosigner

Import cosigner key.

### exportCosignerKey

Export this device's cosigner key.

### listWallets

List registered multisig wallets.

### getWalletInfo

Get multisig wallet details.

### deleteWallet

Delete multisig wallet.

### importBsms

Import BSMS format config.

### exportBsms

Export BSMS format config.

### generateReceiveAddress

Generate multisig receive address.

### verifyMultisigAddress

Verify multisig address on device.

### getSigningStatus

Get signing status for multisig PSBT.

### addPartialSignature

Add partial signature to PSBT.

### finalizeMultisig

Finalize multisig transaction.

---

## Watch-Only Export

### sparrow

Export for Sparrow Wallet.

### electrum

Export for Electrum.

### bluetWallet

Export for BlueWallet.

### specter

Export for Specter Desktop.

### bitcoinCore

Export for Bitcoin Core.

### wasabi

Export for Wasabi Wallet.

### nunchuk

Export for Nunchuk.

### generic

Export generic watch-only config.

### coldcard

Export Coldcard-compatible format.

### caravan

Export for Unchained Caravan.

---

## Envoy

### connectToEnvoy

Initiate Envoy connection.

### syncAccount

Sync account with Envoy.

### getEnvoyStatus

Get Envoy connection status.

### exportForEnvoy

Export data for Envoy app.

### importFromEnvoy

Import data from Envoy.

### disconnectEnvoy

Disconnect from Envoy.

### getEnvoyBackup

Get Envoy backup data.

---

## Casa

### exportForCasa

Export key for Casa vault.

### verifyCasaSetup

Verify Casa integration.

### signCasaHealthCheck

Sign Casa health check.

### getCasaStatus

Get Casa registration status.

---

## Unchained

### exportForUnchained

Export key for Unchained vault.

### signUnchainedHealthCheck

Sign Unchained health check.

### getUnchainedConfig

Get Unchained configuration.

### verifyUnchainedSetup

Verify Unchained setup.

---

## Backup

### create

Create encrypted backup.

**Parameters:**
- `backupCode` (string): 6-digit backup code
- `includeSettings` (boolean): Include device settings

### restore

Restore from backup.

### verify

Verify backup integrity.

### list

List available backups.

### delete

Delete a backup file.

### getBackupInfo

Get backup file details.

### exportSeedQr

Export as SeedQR format.

### importSeedQr

Import from SeedQR.

### encryptBackup

Encrypt existing backup.

---

## Seed

### generateNew

Generate new seed phrase.

### verifyWords

Verify seed word entry.

### getWordList

Get BIP39 word list.

### checkWord

Check if word is valid BIP39.

### setPassphrase

Set BIP39 passphrase.

### clearPassphrase

Clear passphrase (temporary).

### hasPassphrase

Check if passphrase is set.

### getFingerprint

Get master fingerprint.

### deriveXpub

Derive xpub at path.

---

## Security

### runSupplyChainVerification

Run full supply chain verification.

### checkTamperStatus

Check for tampering indicators.

### getSecurityLog

Get security event log.

### clearSecurityLog

Clear security log.

### enableDuressPin

Enable duress PIN.

### disableDuressPin

Disable duress PIN.

### getSecuritySettings

Get security settings.

### updateSecuritySettings

Update security settings.

### verifyFirmwareSignature

Verify firmware signature.

### checkBootloaderIntegrity

Check bootloader integrity.

---

## PIN

### change

Change device PIN.

### verify

Verify PIN is correct.

### getAttempts

Get remaining PIN attempts.

### setBrickPin

Set brick PIN (anti-theft).

### setDuressPin

Set duress PIN.

---

## Firmware

### getCurrentVersion

Get current firmware version.

### checkForUpdates

Check for available updates.

### downloadUpdate

Download firmware update.

### verifyFirmware

Verify firmware file.

### installFromSd

Install firmware from SD card.

### getReleaseNotes

Get release notes.

### getFirmwareHash

Get firmware hash.

### getAllVersions

List all firmware versions.

---

## Extensions

### getInstalled

List installed extensions.

### installExtension

Install a .pex extension.

### removeExtension

Remove an extension.

### getInfo

Get extension details.

### enableExtension

Enable an extension.

### disableExtension

Disable an extension.

---

## Health Check

### runFullCheck

Run comprehensive diagnostics.

**Returns:**
```json
{
  "overall": "healthy",
  "camera": "ok",
  "display": "ok",
  "battery": "ok",
  "sdCard": "ok",
  "secureElement": "ok",
  "memory": "ok"
}
```

### cameraStatus

Test camera functionality.

### displayStatus

Test display.

### batteryStatus

Get battery health.

### sdCardStatus

Check SD card status.

### secureElementStatus

Check secure element.

### memoryStatus

Check memory usage.

---

## Utility

### validateAddress

Validate Bitcoin address format.

**Parameters:**
- `address` (string): Address to validate
- `network` (enum): mainnet, testnet

### getAddressType

Detect address type.

### getDerivationPaths

Get standard derivation paths.

### calculateAddress

Calculate address from xpub.

### getFeeRates

Get current fee rate estimates.

### getBlockHeight

Get current block height.

### verifyMessage

Verify signed message.

### testQrCamera

Test QR scanning capability.

### testConnection

Test device connection.

### parseDescriptor

Parse output descriptor.

### convertExtendedKey

Convert between xpub formats.
