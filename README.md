# n8n-nodes-passport

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for integrating with [Foundation Passport](https://foundationdevices.com/passport/) hardware wallet - the open-source, air-gapped Bitcoin signing device.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-ff6d5a)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![Bitcoin](https://img.shields.io/badge/Bitcoin-Native-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)

## Features

- 🔐 **Air-gapped Security**: Primary support for QR code and SD card communication
- 📝 **PSBT Support**: Full Partially Signed Bitcoin Transaction workflow
- 🏦 **Multisig Ready**: Casa, Unchained, and custom multisig configurations
- 🔄 **Watch-Only Export**: Compatible with Sparrow, Specter, Electrum, BlueWallet, and more
- 📱 **Envoy Integration**: Native support for Foundation's companion app
- 🔒 **Backup & Recovery**: Encrypted backup management and SeedQR support
- 📡 **BBQr Support**: Animated QR codes for large data transfers
- 🔧 **21 Resources**: Comprehensive coverage of Passport capabilities

## Installation

### Community Nodes (Recommended)

1. Go to **Settings** > **Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-passport`
4. Accept the risks and install

### Manual Installation

```bash
# Navigate to your n8n installation
cd ~/.n8n

# Install the package
npm install n8n-nodes-passport

# Restart n8n
```

### Development Installation

```bash
# 1. Clone or extract the package
git clone https://github.com/Velocity-BPA/n8n-nodes-passport.git
cd n8n-nodes-passport

# 2. Install dependencies
npm install

# 3. Build the project
npm run build

# 4. Create symlink to n8n custom nodes directory
# For Linux/macOS:
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-passport

# For Windows (run as Administrator):
# mklink /D %USERPROFILE%\.n8n\custom\n8n-nodes-passport %CD%

# 5. Restart n8n
n8n start
```

## Credentials Setup

### Passport Device Credential

| Field | Description |
|-------|-------------|
| Connection Type | QR, SD Card, or USB |
| Device Identifier | Optional device name/ID |
| Network | Bitcoin Mainnet or Testnet |

### Passport File Credential

| Field | Description |
|-------|-------------|
| SD Card Path | Mount point for SD card |
| Working Directory | Temp directory for processing |
| Backup Password | Password for encrypted backups |

### Bitcoin Network Credential

| Field | Description |
|-------|-------------|
| Network | Mainnet, Testnet, or Regtest |
| Electrum Server | Optional Electrum server URL |
| Block Explorer | Block explorer for verification |

## Resources & Operations

### Device (12 operations)
Get device info, fingerprint, verify authenticity, check battery, test camera, get firmware version, check secure element, get serial number, get supported coins, get device status, reset device, factory reset.

### Account (12 operations)
Create account, list accounts, get account info, rename account, delete account, export xpub/ypub/zpub, export descriptor, get balance, sync account, import from Envoy, export to Envoy, get account health.

### Address (10 operations)
Generate address, get address at index, get address at path, verify on device, get address range, get change address, validate address, get address info, check address usage, export address list.

### QR Code (11 operations)
Generate QR, read QR, encode data, decode data, generate BBQr sequence, read BBQr sequence, encode UR, decode UR, get QR capacity, validate QR data, export animated QR.

### SD Card (11 operations)
Check SD card, list files, read file, write file, delete file, create directory, get file info, export PSBT, import PSBT, backup to SD, restore from SD.

### PSBT (14 operations)
Import PSBT (QR/SD/Base64), export PSBT, sign PSBT, analyze PSBT, finalize PSBT, extract transaction, combine PSBTs, update PSBT, get PSBT info, validate PSBT, add input, add output, set fee rate, estimate size.

### Transaction (9 operations)
Create unsigned, sign transaction, broadcast, get fee estimates, decode transaction, get transaction info, verify transaction, create RBF, create CPFP.

### Message Signing (7 operations)
Sign message, verify signature, sign structured data, create proof, verify proof, get signing address, export signature.

### Multisig (13 operations)
Create wallet, import BSMS, export BSMS, add cosigner, remove cosigner, get cosigner info, sign PSBT, get wallet info, export descriptor, validate config, get signing status, finalize signing, archive wallet.

### Watch-Only (10 operations)
Export to Sparrow, Specter, Electrum, BlueWallet, Bitcoin Core, Nunchuk, Caravan, BTCPay, Wasabi, generic JSON.

### Envoy (7 operations)
Sync account, get account status, export to Envoy, import from Envoy, get Envoy config, update config, disconnect.

### Casa (4 operations)
Register key, get health check, sign transaction, export public key.

### Unchained (4 operations)
Register key, sign transaction, get vault info, export key material.

### Backup (9 operations)
Create encrypted backup, verify backup, restore backup, create SeedQR, export SeedQR, backup to SD, list backups, delete backup, get backup info.

### Seed (9 operations)
Generate seed, import seed, verify seed, export SeedQR, apply passphrase, remove passphrase, get seed info, backup seed, verify backup words.

### Security (10 operations)
Verify supply chain, check secure element, run security audit, verify firmware signature, check for tampering, get security status, enable security features, verify device attestation, check key integrity, export security report.

### PIN (5 operations)
Change PIN, verify PIN, set duress PIN, clear duress PIN, get PIN attempts remaining.

### Firmware (8 operations)
Get current version, check for updates, get firmware hash, verify firmware, download update, install from SD, get release notes, get all versions.

### Extensions (6 operations)
Get installed, install extension, remove extension, get extension info, enable extension, disable extension.

### Health Check (7 operations)
Run full check, camera status, display status, battery status, SD card status, secure element status, memory status.

### Utility (11 operations)
Get address type, validate address, get derivation paths, calculate address, get fee rates, get block height, verify message, test QR camera, test connection, parse descriptor, convert extended key.

## Trigger Node

The `PassportTrigger` node watches for events from Passport devices:

| Event | Description |
|-------|-------------|
| Signed PSBT | Triggers when a signed PSBT is detected |
| New Backup | Triggers when a new backup file is created |
| Signed Message | Triggers when a signed message is available |
| Account Export | Triggers when account data is exported |
| Any File | Triggers on any file change in watched directory |

## Usage Examples

### Basic Transaction Signing

```
[Manual Trigger] → [Passport: Import PSBT] → [Passport: Sign] → [Passport: Export QR]
```

### Multisig Workflow

```
[Webhook] → [Passport: Import PSBT] → [Passport: Sign Multisig] → [Send to Cosigner]
```

### Watch-Only Wallet Setup

```
[Manual] → [Passport: Get Account] → [Passport: Export Sparrow] → [Save to File]
```

### Automated Backup

```
[Schedule] → [Passport: Create Backup] → [Passport: Backup to SD] → [Notify]
```

## Bitcoin Concepts

### Address Types

| Type | BIP | Prefix | Description |
|------|-----|--------|-------------|
| P2WPKH | BIP84 | bc1q | Native SegWit (recommended) |
| P2SH-P2WPKH | BIP49 | 3 | Nested SegWit |
| P2TR | BIP86 | bc1p | Taproot |
| P2PKH | BIP44 | 1 | Legacy |

### Derivation Paths

| Purpose | Path | Description |
|---------|------|-------------|
| Native SegWit | m/84'/0'/n' | Standard receive/change |
| Nested SegWit | m/49'/0'/n' | Compatible with older wallets |
| Taproot | m/86'/0'/n' | Enhanced privacy |
| Legacy | m/44'/0'/n' | Maximum compatibility |
| Multisig | m/48'/0'/n'/2' | BIP48 multisig |

## Networks

| Network | Coin Type | Usage |
|---------|-----------|-------|
| Mainnet | 0 | Production Bitcoin |
| Testnet | 1 | Testing and development |
| Regtest | 1 | Local development |

## Error Handling

The node provides detailed error messages for common issues:

- `DEVICE_NOT_FOUND`: No Passport device detected
- `INVALID_PSBT`: PSBT format or content is invalid
- `SIGNING_REJECTED`: User rejected signing on device
- `NETWORK_MISMATCH`: PSBT network doesn't match device setting
- `INSUFFICIENT_FUNDS`: Not enough funds for transaction
- `SD_CARD_ERROR`: SD card not detected or read error
- `QR_SCAN_FAILED`: Failed to scan QR code

## Security Best Practices

1. **Always verify addresses on device** - Never trust addresses shown only on computer
2. **Use QR codes when possible** - Maintains air-gap security
3. **Verify transaction details** - Check amounts and addresses on Passport screen
4. **Keep firmware updated** - Use the firmware operations to check for updates
5. **Secure your backups** - Use strong passwords for encrypted backups
6. **Test recovery** - Periodically verify backup restoration works
7. **Use multisig for large amounts** - Distribute signing authority

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix lint issues
npm run lint:fix

# Watch mode for development
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please ensure your contributions:

1. Follow the existing code style
2. Include appropriate tests
3. Update documentation as needed
4. Sign the CLA if required

## Support

- 📖 [Documentation](./docs)
- 🐛 [Issue Tracker](https://github.com/Velocity-BPA/n8n-nodes-passport/issues)
- 💬 [Discussions](https://github.com/Velocity-BPA/n8n-nodes-passport/discussions)

## Acknowledgments

- [Foundation Devices](https://foundationdevices.com/) for creating Passport
- [n8n](https://n8n.io/) for the workflow automation platform
- The Bitcoin community for ongoing protocol development
