import { Bytes } from '@crypto-com/chain-jslib/lib/dist/utils/bytes/bytes';
import { Secp256k1KeyPair } from '@crypto-com/chain-jslib/lib/dist/keypair/secp256k1';
import { PubKey, PubKeySecp256k1 } from '@chainapsis/cosmosjs/crypto';
import { AccAddress } from '@chainapsis/cosmosjs/common/address';
import { BIP44 } from '@chainapsis/cosmosjs/core/bip44';
import { HDKey } from '../types/ChainJsLib';

const TransportWebUSB: any = require('@ledgerhq/hw-transport-webusb').default;
const TransportU2F: any = require('@ledgerhq/hw-transport-u2f').default;
const TransportHID: any = require('@ledgerhq/hw-transport-node-hid').default;
const CosmosApp: any = require('ledger-cosmos-js').default;

export interface ISignerProvider {
  /// Get array of keys that includes bech32 address string, address bytes and public key from wallet if user have approved the access.
  getPubKey(): Bytes;

  /// Request signature from matched address if user have approved the access.
  sign(message: Bytes): Promise<Bytes>;
}

export class LocalWalletSignerProvider implements ISignerProvider {
  private keyPair: Secp256k1KeyPair;

  constructor(phrase: string, path: string) {
    const importedHDKey = HDKey.fromMnemonic(phrase);
    const privateKey = importedHDKey.derivePrivKey(path);
    this.keyPair = Secp256k1KeyPair.fromPrivKey(privateKey);
  }

  getPubKey(): Bytes {
    return this.keyPair.getPubKey();
  }

  async sign(message: Bytes): Promise<Bytes> {
    const result = this.keyPair.sign(message);
    return Promise.resolve(result);
  }
}

export class LedgerConfig {
  bech32PrefixAccAddr: string;

  bip44: BIP44;

  constructor(testnet: boolean, bip44: BIP44) {
    if (testnet) {
      this.bech32PrefixAccAddr = 'tcro';
    } else {
      this.bech32PrefixAccAddr = 'cro';
    }
    this.bip44 = bip44;
  }
}

export class LedgerWalletSignerProvider implements ISignerProvider {
  private app: any;

  private path: number[] | undefined;

  private key:
    | {
        pubKey: PubKey;
        address: Uint8Array;
      }
    | undefined;

  constructor(
    public readonly config: LedgerConfig,
    public readonly transport: 'WebUSB' | 'U2F' | 'HID',
    private readonly account: number = 0,
    private readonly index: number = 0,
  ) {}

  async enable(): Promise<void> {
    let transport;
    switch (this.transport) {
      case 'WebUSB':
        transport = await TransportWebUSB.create();
        break;
      case 'U2F':
        transport = await TransportU2F.create();
        break;
      case 'HID':
        transport = await TransportHID.create();
        break;
      default:
        throw new Error('Unsupported transport');
    }
    this.app = new CosmosApp(transport);

    let response = await this.app.getVersion();
    if (response.error_message !== 'No errors') {
      throw new Error(`[${response.error_message}] ${response.error_message}`);
    }

    console.log('Response received!');
    console.log(`App Version ${response.major}.${response.minor}.${response.patch}`);
    console.log(`Device Locked: ${response.device_locked}`);
    console.log(`Test mode: ${response.test_mode}`);
    console.log('Full response:');
    console.log(response);

    this.path = this.config.bip44.path(this.account, this.index);

    response = await this.app.getAddressAndPubKey(this.path, this.config.bech32PrefixAccAddr);
    if (response.error_message !== 'No errors') {
      throw new Error(`[${response.error_message}] ${response.error_message}`);
    }

    this.key = {
      address: AccAddress.fromBech32(
        this.config.bech32PrefixAccAddr,
        response.bech32_address,
      ).toBytes(),
      pubKey: new PubKeySecp256k1(response.compressed_pk),
    };

    return Promise.resolve();
  }

  public getAccAddress(): string {
    if (!this.app || !this.path || !this.key) {
      throw new Error('Not approved');
    }

    const bech32Address = new AccAddress(
      this.key!.address,
      this.config.bech32PrefixAccAddr,
    ).toBech32();
    return bech32Address;
  }

  public getPubKey(): Bytes {
    if (!this.app || !this.path || !this.key) {
      throw new Error('Not approved');
    }
    const bytes = Bytes.fromUint8Array(this.key.pubKey.toBytes());
    return bytes;
  }

  public async sign(message: Bytes): Promise<Bytes> {
    if (!this.app || !this.path || !this.key) {
      throw new Error('Not signed in');
    }

    const response = await this.app.sign(this.path, message.toUint8Array());
    if (response.error_message !== 'No errors') {
      throw new Error(`[${response.error_message}] ${response.error_message}`);
    }

    // Ledger has encoded the sig in ASN1 DER format, but we need a 64-byte buffer of <r,s>
    // DER-encoded signature from Ledger:
    // 0 0x30: a header byte indicating a compound structure
    // 1 A 1-byte length descriptor for all what follows (ignore)
    // 2 0x02: a header byte indicating an integer
    // 3 A 1-byte length descriptor for the R value
    // 4 The R coordinate, as a big-endian integer
    //   0x02: a header byte indicating an integer
    //   A 1-byte length descriptor for the S value
    //   The S coordinate, as a big-endian integer
    //  = 7 bytes of overhead
    let { signature } = response;
    if (signature[0] !== 0x30) {
      throw new Error('Ledger assertion failed: Expected a signature header of 0x30');
    }

    // decode DER string format
    let rOffset = 4;
    let rLen = signature[3];
    const sLen = signature[4 + rLen + 1]; // skip over following 0x02 type prefix for s
    let sOffset = signature.length - sLen;
    // we can safely ignore the first byte in the 33 bytes cases
    if (rLen === 33) {
      rOffset++; // chop off 0x00 padding
      rLen--;
    }
    if (sLen === 33) {
      sOffset++;
    } // as above
    const sigR = signature.slice(rOffset, rOffset + rLen); // skip e.g. 3045022100 and pad
    const sigS = signature.slice(sOffset);

    signature = Buffer.concat([sigR, sigS]);
    if (signature.length !== 64) {
      throw new Error(`Ledger assertion failed: incorrect signature length ${signature.length}`);
    }
    const bytes = Bytes.fromUint8Array(new Uint8Array(signature));
    return Promise.resolve(bytes);
  }
}
