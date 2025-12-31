# Security Best Practices

This guide covers security considerations when using n8n-nodes-passport for Bitcoin operations.

## Air-Gap Principles

### Why Air-Gap Matters

Passport is designed as an air-gapped hardware wallet. The device never connects directly to the internet, which protects your private keys from online attacks.

### Maintaining Air-Gap with n8n

When using n8n to automate Passport operations, maintain air-gap security by:

1. **Prefer QR codes or SD cards** over USB connections
2. **Never store sensitive data** in n8n workflows
3. **Verify all transactions on device** before signing
4. **Use watch-only wallets** for balance checking

## Connection Method Security

### QR Code (Most Secure)

- ✅ Fully air-gapped
- ✅ No physical connection
- ✅ Visual verification possible
- ⚠️ Limited data capacity
- ⚠️ Requires camera setup

**Best for**: Small transactions, address verification

### SD Card (Secure)

- ✅ Air-gapped
- ✅ Large data capacity
- ✅ Offline file transfer
- ⚠️ Requires physical handling
- ⚠️ Card could be compromised if shared

**Best for**: Large PSBTs, batch operations, backups

**Security tips**:
- Use dedicated SD cards for Passport only
- Store SD cards securely when not in use
- Format cards after sensitive operations

### USB (Least Secure)

- ⚠️ Direct connection to computer
- ⚠️ Potential malware vector
- ✅ Fastest data transfer
- ✅ Bidirectional communication

**Best for**: Development, testing only

**If you must use USB**:
- Use a dedicated, air-gapped computer
- Enable USB debugging only when needed
- Disable USB debugging after use

## Credential Security

### Passport Device Credentials

- Store credentials securely in n8n
- Use environment variables for sensitive paths
- Never commit credentials to version control

### Bitcoin Network Selection

- **Always verify network** before signing
- Use testnet for development and testing
- Double-check mainnet transactions

## Workflow Security

### Transaction Verification

Always include verification steps in your workflows:

```
1. Import PSBT
2. Display transaction summary
3. PAUSE: Require manual verification
4. Verify on device screen
5. Sign only after confirmation
```

### Address Verification

Never send funds to addresses without verification:

```
1. Generate address
2. Display on Passport screen
3. Compare addresses visually
4. Only use if addresses match
```

### Backup Security

When automating backups:

- Store backup codes offline
- Encrypt backups before cloud storage
- Test backup restoration periodically
- Never store unencrypted seed phrases

## Multi-Signature Security

### Quorum Selection

- **2-of-3**: Good balance of security and recovery
- **3-of-5**: Higher security, more complex recovery
- **2-of-2**: Simple but no redundancy

### Key Distribution

- Store keys in geographically separate locations
- Use different hardware wallet brands
- Document recovery procedures

### BSMS Handling

- Verify BSMS data before import
- Check fingerprints match expected devices
- Store BSMS files securely (they reveal xpubs)

## Workflow Design Patterns

### Secure Transaction Flow

```
[Trigger] → [Build PSBT] → [Human Approval] → [Sign on Passport] → [Broadcast]
           ↓
      [Save to audit log]
```

### Batch Processing with Limits

```
[For Each Transaction]
    ↓
[Check Amount < Threshold]
    ↓
[If Over: Queue for Manual Review]
[If Under: Process Automatically]
```

### Address Verification Loop

```
[Generate Address] → [Display on Device] → [Confirm Match] → [Use Address]
                                         ↓
                               [If Mismatch: Alert & Stop]
```

## What NOT to Do

### Never:

- ❌ Store seed phrases in n8n
- ❌ Automate signing without verification
- ❌ Skip device confirmation prompts
- ❌ Share backup codes in workflows
- ❌ Use USB for production signing
- ❌ Store PSBTs with sensitive amounts unencrypted
- ❌ Auto-broadcast large transactions

### Avoid:

- ⚠️ Processing large volumes without rate limiting
- ⚠️ Running workflows on public/shared n8n instances
- ⚠️ Storing xpubs where they could be correlated

## Audit and Monitoring

### Log Important Events

- Transaction signing requests
- Address generation
- Backup creation
- Firmware updates
- Failed verification attempts

### Alert Conditions

Set up alerts for:
- Signing failures
- Unexpected transaction amounts
- Multiple failed PIN attempts
- Firmware verification failures

### Periodic Reviews

- Review transaction history monthly
- Verify multisig quorum unchanged
- Check firmware is up to date
- Test backup restoration annually

## Incident Response

### If You Suspect Compromise

1. **Stop** all automated workflows
2. **Verify** device authenticity (supply chain verification)
3. **Check** all registered multisig wallets
4. **Review** recent transactions
5. **Consider** moving funds to new wallet

### If Backup Code Exposed

1. Create new backup immediately
2. Delete old backup files
3. Update backup code on device
4. Verify new backup works

### If Device Lost/Stolen

1. Use duress PIN if set (will show decoy wallet)
2. Begin recovery with backup
3. Move funds to new wallet
4. Report theft if applicable

## Supply Chain Security

### Device Verification

Always verify new devices:

```
Resource: Security
Operation: Run Supply Chain Verification
```

This checks:
- Certificate chain validity
- Secure element authenticity
- Firmware signatures

### Firmware Updates

Only install verified firmware:

1. Download from official source
2. Verify hash matches published hash
3. Check signature is valid
4. Install via SD card

## Network Security

### n8n Instance Security

- Run n8n on private/trusted network
- Use HTTPS for web interface
- Restrict access with authentication
- Keep n8n updated

### Node Communication

- Use local connections when possible
- Avoid exposing Passport-related endpoints
- Consider VPN for remote access

## Privacy Considerations

### Address Reuse

- Generate new addresses for each transaction
- Use proper gap limit settings
- Monitor address exposure

### XPub Exposure

Extended public keys reveal:
- All derived addresses
- Transaction history
- Balance information

Keep xpubs confidential:
- Don't share unnecessarily
- Store encrypted
- Limit access in workflows

### Metadata

Be aware that workflows may leak:
- Transaction timing patterns
- Amount patterns
- Address usage patterns

## Compliance and Legal

### Record Keeping

Maintain records of:
- All signed transactions
- Verification steps taken
- Approval workflows
- Incident responses

### Access Control

- Implement role-based access in n8n
- Require multiple approvals for large transactions
- Log all access to wallet operations

## Resources

- [Foundation Devices Security](https://docs.foundationdevices.com/security)
- [Bitcoin Security Guide](https://bitcoin.org/en/secure-your-wallet)
- [BIP39 Passphrase Best Practices](https://wiki.trezor.io/Passphrase)
- [Multisig Security Models](https://btcguide.github.io/)
