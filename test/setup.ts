/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

// Jest setup file for n8n-nodes-passport

// Increase timeout for async operations
jest.setTimeout(10000);

// Mock n8n-workflow
jest.mock('n8n-workflow', () => ({
  INodeType: jest.fn(),
  INodeTypeDescription: jest.fn(),
  IExecuteFunctions: jest.fn(),
  ILoadOptionsFunctions: jest.fn(),
  INodePropertyOptions: jest.fn(),
  NodeOperationError: class NodeOperationError extends Error {
    constructor(node: any, message: string) {
      super(message);
      this.name = 'NodeOperationError';
    }
  },
}));

// Global test utilities
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
