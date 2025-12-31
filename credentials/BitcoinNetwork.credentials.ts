/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  ICredentialType,
  INodeProperties,
  ICredentialTestRequest,
} from 'n8n-workflow';

/**
 * Bitcoin Network Credentials
 *
 * Configures Bitcoin network settings for transaction broadcast,
 * fee estimation, and blockchain queries.
 *
 * Networks:
 * - Mainnet: Production Bitcoin network (real funds)
 * - Testnet: Bitcoin test network (test coins)
 * - Signet: Centralized test network with reliable block times
 */
export class BitcoinNetwork implements ICredentialType {
  name = 'bitcoinNetwork';
  displayName = 'Bitcoin Network';
  documentationUrl = 'https://bitcoin.org/en/developer-reference';

  properties: INodeProperties[] = [
    {
      displayName: 'Network',
      name: 'network',
      type: 'options',
      options: [
        {
          name: 'Mainnet',
          value: 'mainnet',
          description: 'Bitcoin mainnet - real funds, use with caution',
        },
        {
          name: 'Testnet',
          value: 'testnet',
          description: 'Bitcoin testnet - for testing with test coins',
        },
        {
          name: 'Signet',
          value: 'signet',
          description: 'Bitcoin signet - centralized test network',
        },
        {
          name: 'Regtest',
          value: 'regtest',
          description: 'Local regression testing network',
        },
      ],
      default: 'mainnet',
      description: 'Bitcoin network to use for transactions and queries',
    },
    {
      displayName: 'Electrum Server',
      name: 'electrumServer',
      type: 'options',
      options: [
        {
          name: 'Default (Blockstream)',
          value: 'default',
          description: 'Use Blockstream public Electrum servers',
        },
        {
          name: 'Mempool.space',
          value: 'mempool',
          description: 'Use Mempool.space Electrum servers',
        },
        {
          name: 'Custom',
          value: 'custom',
          description: 'Specify custom Electrum server',
        },
      ],
      default: 'default',
      description: 'Electrum server for balance and transaction queries',
    },
    {
      displayName: 'Custom Electrum URL',
      name: 'customElectrumUrl',
      type: 'string',
      default: '',
      placeholder: 'ssl://electrum.example.com:50002',
      displayOptions: {
        show: {
          electrumServer: ['custom'],
        },
      },
      description: 'URL for custom Electrum server (ssl:// or tcp://)',
    },
    {
      displayName: 'Electrum Protocol',
      name: 'electrumProtocol',
      type: 'options',
      options: [
        { name: 'SSL/TLS', value: 'ssl' },
        { name: 'TCP', value: 'tcp' },
      ],
      default: 'ssl',
      displayOptions: {
        show: {
          electrumServer: ['custom'],
        },
      },
      description: 'Protocol for Electrum connection',
    },
    {
      displayName: 'Block Explorer',
      name: 'blockExplorer',
      type: 'options',
      options: [
        {
          name: 'Mempool.space',
          value: 'mempool',
          description: 'Mempool.space block explorer',
        },
        {
          name: 'Blockstream.info',
          value: 'blockstream',
          description: 'Blockstream block explorer',
        },
        {
          name: 'Blockchain.com',
          value: 'blockchain',
          description: 'Blockchain.com explorer',
        },
        {
          name: 'Custom',
          value: 'custom',
          description: 'Specify custom block explorer',
        },
      ],
      default: 'mempool',
      description: 'Block explorer for transaction viewing',
    },
    {
      displayName: 'Custom Block Explorer URL',
      name: 'customBlockExplorerUrl',
      type: 'string',
      default: '',
      placeholder: 'https://explorer.example.com',
      displayOptions: {
        show: {
          blockExplorer: ['custom'],
        },
      },
      description: 'Base URL for custom block explorer',
    },
    {
      displayName: 'Fee Estimation',
      name: 'feeEstimation',
      type: 'collection',
      default: {},
      placeholder: 'Add Fee Setting',
      options: [
        {
          displayName: 'Fee Estimation Source',
          name: 'feeSource',
          type: 'options',
          options: [
            { name: 'Mempool.space', value: 'mempool' },
            { name: 'Blockstream', value: 'blockstream' },
            { name: 'Bitcoin Core RPC', value: 'bitcoincore' },
            { name: 'Custom API', value: 'custom' },
          ],
          default: 'mempool',
          description: 'Source for fee rate estimation',
        },
        {
          displayName: 'Custom Fee API URL',
          name: 'customFeeApiUrl',
          type: 'string',
          default: '',
          placeholder: 'https://api.example.com/fees',
          description: 'URL for custom fee estimation API',
        },
        {
          displayName: 'Default Fee Rate (sat/vB)',
          name: 'defaultFeeRate',
          type: 'number',
          default: 10,
          description: 'Default fee rate if estimation fails',
        },
        {
          displayName: 'Max Fee Rate (sat/vB)',
          name: 'maxFeeRate',
          type: 'number',
          default: 500,
          description: 'Maximum allowed fee rate to prevent overpaying',
        },
      ],
      description: 'Fee estimation configuration',
    },
    {
      displayName: 'Bitcoin Core RPC',
      name: 'bitcoinCoreRpc',
      type: 'collection',
      default: {},
      placeholder: 'Add RPC Setting',
      options: [
        {
          displayName: 'Enable Bitcoin Core RPC',
          name: 'enableRpc',
          type: 'boolean',
          default: false,
          description: 'Whether to use Bitcoin Core RPC for broadcast',
        },
        {
          displayName: 'RPC Host',
          name: 'rpcHost',
          type: 'string',
          default: '127.0.0.1',
          description: 'Bitcoin Core RPC host',
        },
        {
          displayName: 'RPC Port',
          name: 'rpcPort',
          type: 'number',
          default: 8332,
          description: 'Bitcoin Core RPC port (8332 mainnet, 18332 testnet)',
        },
        {
          displayName: 'RPC Username',
          name: 'rpcUsername',
          type: 'string',
          default: '',
          description: 'Bitcoin Core RPC username',
        },
        {
          displayName: 'RPC Password',
          name: 'rpcPassword',
          type: 'string',
          typeOptions: { password: true },
          default: '',
          description: 'Bitcoin Core RPC password',
        },
        {
          displayName: 'RPC Wallet',
          name: 'rpcWallet',
          type: 'string',
          default: '',
          description: 'Wallet name for multi-wallet Bitcoin Core setups',
        },
      ],
      description: 'Bitcoin Core RPC configuration for direct node access',
    },
    {
      displayName: 'API Keys',
      name: 'apiKeys',
      type: 'collection',
      default: {},
      placeholder: 'Add API Key',
      options: [
        {
          displayName: 'Mempool.space API Key',
          name: 'mempoolApiKey',
          type: 'string',
          typeOptions: { password: true },
          default: '',
          description: 'API key for Mempool.space (optional, increases rate limits)',
        },
        {
          displayName: 'Blockstream API Key',
          name: 'blockstreamApiKey',
          type: 'string',
          typeOptions: { password: true },
          default: '',
          description: 'API key for Blockstream API (if required)',
        },
      ],
      description: 'API keys for blockchain services',
    },
    {
      displayName: 'Connection Timeout (ms)',
      name: 'connectionTimeout',
      type: 'number',
      default: 30000,
      description: 'Timeout for network requests in milliseconds',
    },
    {
      displayName: 'Retry Attempts',
      name: 'retryAttempts',
      type: 'number',
      default: 3,
      description: 'Number of retry attempts for failed requests',
    },
  ];

  // Test connection to block explorer API
  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.blockExplorer === "mempool" ? "https://mempool.space" : $credentials.blockExplorer === "blockstream" ? "https://blockstream.info" : $credentials.customBlockExplorerUrl}}',
      url: '/api/blocks/tip/height',
      method: 'GET',
      timeout: 10000,
    },
  };
}
