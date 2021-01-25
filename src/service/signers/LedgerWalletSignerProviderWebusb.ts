import { Bytes } from '@crypto-com/chain-jslib/lib/dist/utils/bytes/bytes';
import { BIP44 } from '@chainapsis/cosmosjs/core/bip44';
import { ISignerProvider } from './SignerProvider';
import { LedgerSignerWebusb } from './LedgerSignerWebusb';
import { LedgerConfig } from './LedgerSigner';

export class LedgerWalletSignerProviderWebusb implements ISignerProvider {
  provider: LedgerSignerWebusb;

  constructor() {
    const config = new LedgerConfig(false, new BIP44(44, 394));
    this.provider = new LedgerSignerWebusb(config);
  }

  public async getPubKey(index: number): Promise<Bytes> {
    const result = await this.provider.enable(index);
    return result[1];
  }

  public async getAddress(index: number): Promise<string> {
    const result = await this.provider.enable(index);
    return result[0];
  }

  public async sign(message: Bytes): Promise<Bytes> {
    return this.provider.sign(message);
  }
}
