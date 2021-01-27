import { Bytes } from '@crypto-com/chain-jslib/lib/dist/utils/bytes/bytes';
import { PubKeySecp256k1 } from '@chainapsis/cosmosjs/crypto';
import { AccAddress } from '@chainapsis/cosmosjs/common/address';
import { BIP44 } from '@chainapsis/cosmosjs/core/bip44';

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

export class LedgerSigner {
  app: any;

  path: number[] | undefined;

  config: LedgerConfig;

  account: number;

  constructor(config: LedgerConfig, account: number = 0) {
    this.config = config;
    this.account = account;
  }

  // override this function
  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-empty-function
  async createTransport() {}

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-empty-function
  async closeTransport() {}

  // tuple : address, pubkey
  public async enable(index: number): Promise<[string, Bytes]> {
    if (this.app == null) {
      await this.createTransport();
    }
    let response = await this.app.getVersion();
    if (response.error_message !== 'No errors') {
      throw new Error(`[${response.error_message}] ${response.error_message}`);
    }

    // purpose(44), coin(394), account(0), change(0), index
    this.path = this.config.bip44.path(this.account, index);

    response = await this.app.getAddressAndPubKey(this.path, this.config.bech32PrefixAccAddr);
    if (response.error_message !== 'No errors') {
      throw new Error(`[${response.error_message}] ${response.error_message}`);
    }

    const key = {
      address: AccAddress.fromBech32(
        response.bech32_address,
        this.config.bech32PrefixAccAddr,
      ).toBytes(),
      pubKey: new PubKeySecp256k1(response.compressed_pk),
    };

    const address = new AccAddress(key.address, this.config.bech32PrefixAccAddr).toBech32();
    const pubkey = Bytes.fromUint8Array(key.pubKey.toBytes());

    const ret: [string, Bytes] = [address, pubkey];
    await this.closeTransport();

    return ret;
  }

  public async sign(message: Bytes): Promise<Bytes> {
    if (this.app == null) {
      await this.createTransport();
    }

    if (!this.app || !this.path) {
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
    await this.closeTransport();
    return bytes;
  }
}
