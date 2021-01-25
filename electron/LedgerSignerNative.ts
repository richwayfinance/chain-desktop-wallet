import { LedgerSigner, LedgerConfig } from '../src/service/signers/LedgerSigner';
const TransportHID: any = require('@ledgerhq/hw-transport-node-hid').default;
const CosmosApp: any = require('ledger-cosmos-js').default;
export class LedgerSignerNative extends LedgerSigner {
  constructor(config: LedgerConfig, account: number = 0) {
    super(config, account);
  }

  async createTransport() {
    if (this.app === null || this.app === undefined) {
      const transport = await TransportHID.open();
      this.app = new CosmosApp(transport);
    }
  }
}
