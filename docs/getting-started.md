# Getting Started with n8n-nodes-passport

This guide will help you get up and running with the Passport hardware wallet integration for n8n.

## Prerequisites

- **n8n** version 1.0.0 or later
- **Foundation Passport** hardware wallet (Batch 2 or later)
- **MicroSD card** (for SD card connection method)

## Installation

### From npm (Recommended)

```bash
cd ~/.n8n/custom
npm install n8n-nodes-passport
```

### From Source

```bash
git clone https://github.com/sovereign-tools/n8n-nodes-passport.git
cd n8n-nodes-passport
npm install
npm run build
npm link

cd ~/.n8n/custom
npm link n8n-nodes-passport
```

After installation, restart n8n to load the new nodes.

## Configuration

### Step 1: Add Credentials

1. Open n8n and go to **Credentials**
2. Click **Add Credential**
3. Search for and add:
   - **Passport Device** - Connection settings
   - **Bitcoin Network** - Network selection (mainnet/testnet)
   - **Passport File** (optional) - SD card paths

### Step 2: Configure Passport Device Credentials

Choose your connection method:

#### QR Code Connection (Recommended)
- **Connection Type**: QR Code
- No additional configuration needed
- Passport will display QR codes for data exchange

#### SD Card Connection
- **Connection Type**: SD Card
- **Mount Path**: Path where SD card is mounted (e.g., `/media/passport`)
- Works well for large PSBTs and batch operations

#### USB Connection (Advanced)
- **Connection Type**: USB
- **Device Path**: Usually `/dev/ttyACM0` on Linux
- Requires USB debugging enabled on Passport

### Step 3: Configure Bitcoin Network

- **Network**: Select mainnet or testnet
- **Fee Estimation**: Configure fee source if needed

## Your First Workflow

### Example: Generate a New Address

1. Create a new workflow
2. Add a **Manual Trigger** node
3. Add a **Passport** node
4. Configure the Passport node:
   - **Resource**: Address
   - **Operation**: Generate
   - **Account Name**: Main (or your account name)
   - **Address Type**: receive

5. Connect the nodes and execute

### Example: Sign a Transaction

1. Add **Passport** node with:
   - **Resource**: PSBT
   - **Operation**: Import for Signing
   - **PSBT**: Your unsigned PSBT (base64)

2. Add another **Passport** node with:
   - **Resource**: PSBT
   - **Operation**: Sign

3. The workflow will:
   - Import the PSBT to Passport
   - Display transaction details for verification
   - Return the signed PSBT

## Connection Methods Explained

### QR Codes

Best for simple transactions. Passport displays animated QR codes (BBQr format) that can be scanned with a webcam.

**Pros**: Air-gapped, no physical connection needed
**Cons**: Limited data size, requires camera setup

### SD Card

Best for large transactions, multisig, and batch operations.

**Pros**: Handles large PSBTs, fast data transfer
**Cons**: Requires physical card handling

**Workflow**:
1. n8n writes unsigned PSBT to SD card
2. Insert SD card into Passport
3. Sign on Passport
4. Remove SD card
5. n8n reads signed PSBT

### USB (Advanced)

Direct communication with Passport via USB.

**Pros**: Fastest, bidirectional communication
**Cons**: Requires USB debugging, not fully air-gapped

## Common Operations

### Watch-Only Wallet Setup

Export your Passport's public keys to wallet software:

```
Resource: Watch-Only Export
Operation: Sparrow / Electrum / Bitcoin Core
Account: Your account name
```

### Multisig Configuration

Create a multisig wallet with multiple hardware wallets:

```
Resource: Multi-Signature
Operation: Create Wallet
Required Signatures: 2
Total Cosigners: 3
```

### Backup Management

Create encrypted backups:

```
Resource: Backup
Operation: Create
Include Settings: Yes
```

## Troubleshooting

### Node not appearing in n8n

1. Verify installation: `ls ~/.n8n/custom/node_modules/n8n-nodes-passport`
2. Restart n8n completely
3. Check n8n logs for errors

### SD card not detected

1. Verify mount path is correct
2. Check file permissions
3. Ensure SD card is formatted correctly (FAT32)

### QR code scanning issues

1. Ensure good lighting
2. Position camera properly
3. For large data, use BBQr animated codes

### Connection timeout

1. Verify Passport is powered on
2. Check connection method settings
3. For USB: verify device path

## Next Steps

- Read the [API Reference](./api-reference.md) for all operations
- Explore [Example Workflows](./examples.md)
- Review [Security Best Practices](./security.md)
- Set up [Multisig Wallets](./multisig.md)

## Getting Help

- GitHub Issues: Report bugs and feature requests
- n8n Community: General n8n questions
- Foundation Devices: Passport-specific questions
