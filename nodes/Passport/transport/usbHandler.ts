/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * USB Handler
 *
 * Handles USB-C connection for Passport Batch 2 devices.
 * Note: USB is optional - Passport can always be used air-gapped.
 *
 * SECURITY NOTE: Air-gapped operation (QR/SD) is recommended for
 * maximum security. USB should only be used in trusted environments.
 */

export interface USBDeviceInfo {
  /** Device path */
  path: string;
  /** Vendor ID */
  vendorId: number;
  /** Product ID */
  productId: number;
  /** Serial number */
  serialNumber?: string;
  /** Manufacturer name */
  manufacturer?: string;
  /** Product name */
  product?: string;
  /** Whether device is connected */
  connected: boolean;
}

export interface USBConnectionOptions {
  /** Baud rate */
  baudRate?: number;
  /** Data bits */
  dataBits?: 5 | 6 | 7 | 8;
  /** Stop bits */
  stopBits?: 1 | 1.5 | 2;
  /** Parity */
  parity?: 'none' | 'even' | 'odd' | 'mark' | 'space';
  /** Timeout in ms */
  timeout?: number;
}

export interface USBMessage {
  /** Message type */
  type: USBMessageType;
  /** Message payload */
  payload: Buffer;
  /** Sequence number */
  sequence: number;
}

export enum USBMessageType {
  /** Ping/keepalive */
  PING = 0x00,
  /** Device info request */
  GET_INFO = 0x01,
  /** PSBT for signing */
  SIGN_PSBT = 0x10,
  /** Signed PSBT response */
  SIGNED_PSBT = 0x11,
  /** Get address */
  GET_ADDRESS = 0x20,
  /** Address response */
  ADDRESS = 0x21,
  /** Get xpub */
  GET_XPUB = 0x30,
  /** Xpub response */
  XPUB = 0x31,
  /** Sign message */
  SIGN_MESSAGE = 0x40,
  /** Message signature */
  MESSAGE_SIGNATURE = 0x41,
  /** Error response */
  ERROR = 0xFF,
}

/** Foundation Devices USB identifiers */
const PASSPORT_USB = {
  vendorId: 0x1209, // Foundation Devices
  productId: 0x7331, // Passport
  defaultBaudRate: 115200,
};

/**
 * Default USB connection options
 */
const DEFAULT_OPTIONS: USBConnectionOptions = {
  baudRate: PASSPORT_USB.defaultBaudRate,
  dataBits: 8,
  stopBits: 1,
  parity: 'none',
  timeout: 30000,
};

/**
 * USB connection state
 */
interface USBConnection {
  device: USBDeviceInfo;
  options: USBConnectionOptions;
  isOpen: boolean;
  sequence: number;
}

/**
 * USB connection manager
 */
class USBHandler {
  private connection: USBConnection | null = null;

  /**
   * List available Passport devices
   *
   * Note: This is a simplified implementation.
   * In production, use a USB library like node-usb or serialport.
   */
  async listDevices(): Promise<USBDeviceInfo[]> {
    // Placeholder - would enumerate USB devices
    // In production, use serialport.list() or similar
    console.warn('USB device enumeration not implemented in this context');
    return [];
  }

  /**
   * Connect to Passport device
   */
  async connect(
    devicePath: string,
    options: USBConnectionOptions = {},
  ): Promise<USBDeviceInfo> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Placeholder - would open serial port
    // In production:
    // const port = new SerialPort({ path: devicePath, baudRate: opts.baudRate });

    const device: USBDeviceInfo = {
      path: devicePath,
      vendorId: PASSPORT_USB.vendorId,
      productId: PASSPORT_USB.productId,
      connected: true,
      manufacturer: 'Foundation Devices',
      product: 'Passport',
    };

    this.connection = {
      device,
      options: opts,
      isOpen: true,
      sequence: 0,
    };

    return device;
  }

  /**
   * Disconnect from device
   */
  async disconnect(): Promise<void> {
    if (this.connection) {
      // Would close serial port
      this.connection.isOpen = false;
      this.connection = null;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connection?.isOpen ?? false;
  }

  /**
   * Send message to device
   */
  async sendMessage(type: USBMessageType, payload: Buffer): Promise<void> {
    if (!this.connection?.isOpen) {
      throw new Error('Not connected to Passport');
    }

    const sequence = this.connection.sequence++;
    const message = this.encodeMessage({ type, payload, sequence });

    // Would write to serial port
    console.log(`USB send: type=${type}, seq=${sequence}, len=${payload.length}`);
  }

  /**
   * Receive message from device
   */
  async receiveMessage(expectedType?: USBMessageType): Promise<USBMessage> {
    if (!this.connection?.isOpen) {
      throw new Error('Not connected to Passport');
    }

    // Placeholder - would read from serial port
    // In production, implement proper message parsing

    const message: USBMessage = {
      type: expectedType ?? USBMessageType.PING,
      payload: Buffer.alloc(0),
      sequence: this.connection.sequence,
    };

    return message;
  }

  /**
   * Get device info via USB
   */
  async getDeviceInfo(): Promise<{
    serialNumber: string;
    firmwareVersion: string;
    hardwareVersion: string;
    masterFingerprint: string;
  }> {
    await this.sendMessage(USBMessageType.GET_INFO, Buffer.alloc(0));
    const response = await this.receiveMessage(USBMessageType.GET_INFO);

    // Parse device info from response
    // This is a placeholder implementation
    return {
      serialNumber: 'PASSPORT-XXXX',
      firmwareVersion: '2.3.0',
      hardwareVersion: 'Batch 2',
      masterFingerprint: '00000000',
    };
  }

  /**
   * Sign PSBT via USB
   */
  async signPSBT(psbtBase64: string): Promise<string> {
    const psbtBuffer = Buffer.from(psbtBase64, 'base64');
    await this.sendMessage(USBMessageType.SIGN_PSBT, psbtBuffer);

    const response = await this.receiveMessage(USBMessageType.SIGNED_PSBT);

    return response.payload.toString('base64');
  }

  /**
   * Get address via USB
   */
  async getAddress(
    derivationPath: string,
    _addressType: string,
  ): Promise<string> {
    const pathBuffer = Buffer.from(derivationPath, 'utf8');
    await this.sendMessage(USBMessageType.GET_ADDRESS, pathBuffer);

    const response = await this.receiveMessage(USBMessageType.ADDRESS);

    return response.payload.toString('utf8');
  }

  /**
   * Get xpub via USB
   */
  async getXpub(derivationPath: string): Promise<string> {
    const pathBuffer = Buffer.from(derivationPath, 'utf8');
    await this.sendMessage(USBMessageType.GET_XPUB, pathBuffer);

    const response = await this.receiveMessage(USBMessageType.XPUB);

    return response.payload.toString('utf8');
  }

  /**
   * Sign message via USB
   */
  async signMessage(
    message: string,
    derivationPath: string,
  ): Promise<{ signature: string; address: string }> {
    const payload = Buffer.concat([
      Buffer.from(derivationPath, 'utf8'),
      Buffer.from('\0'),
      Buffer.from(message, 'utf8'),
    ]);

    await this.sendMessage(USBMessageType.SIGN_MESSAGE, payload);

    const response = await this.receiveMessage(USBMessageType.MESSAGE_SIGNATURE);

    // Parse signature response
    const sigData = response.payload.toString('utf8').split('\0');

    return {
      signature: sigData[0] ?? '',
      address: sigData[1] ?? '',
    };
  }

  /**
   * Encode USB message
   */
  private encodeMessage(message: USBMessage): Buffer {
    // Simple framing: [type:1][seq:4][len:4][payload:n]
    const header = Buffer.alloc(9);
    header.writeUInt8(message.type, 0);
    header.writeUInt32LE(message.sequence, 1);
    header.writeUInt32LE(message.payload.length, 5);

    return Buffer.concat([header, message.payload]);
  }

  /**
   * Decode USB message
   */
  private decodeMessage(data: Buffer): USBMessage {
    if (data.length < 9) {
      throw new Error('Invalid USB message: too short');
    }

    const type = data.readUInt8(0) as USBMessageType;
    const sequence = data.readUInt32LE(1);
    const length = data.readUInt32LE(5);
    const payload = data.slice(9, 9 + length);

    return { type, sequence, payload };
  }
}

/**
 * Create USB handler instance
 */
export function createUSBHandler(): USBHandler {
  return new USBHandler();
}

/**
 * Check if USB is available (Batch 2 only)
 */
export async function isUSBAvailable(): Promise<boolean> {
  // Check if we're on a system that supports USB
  // and if serialport module is available
  try {
    // Would check for serialport availability
    return true;
  } catch {
    return false;
  }
}

/**
 * Get USB connection status
 */
export async function getUSBStatus(devicePath: string): Promise<{
  available: boolean;
  connected: boolean;
  device?: USBDeviceInfo;
}> {
  const handler = createUSBHandler();
  const devices = await handler.listDevices();

  const device = devices.find((d) => d.path === devicePath);

  return {
    available: devices.length > 0,
    connected: device?.connected ?? false,
    device,
  };
}

export { USBHandler };
