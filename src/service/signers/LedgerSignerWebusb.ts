import CosmosApp from 'ledger-cosmos-js';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import { LedgerSigner, LedgerConfig } from './LedgerSigner';

export class LedgerSignerWebusb extends LedgerSigner {
  public transport: TransportWebHID;

  constructor(config: LedgerConfig, account: number = 0) {
    super(config, account);
  }

  async createTransport() {
    if (this.app === null || this.app === undefined) {
      const transport = await TransportWebHID.create();
      this.app = new CosmosApp(transport);
      this.transport = transport;
    }
  }

  async closeTransport() {
    if (this.transport != null) {
      this.transport.close();
      this.transport = null;
      this.app = null;
    }
  }
}
