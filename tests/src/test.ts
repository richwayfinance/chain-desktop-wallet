// import CosmosApp from 'ledger-cosmos-js';
import { Zemu } from '@zondax/zemu';
import { LedgerSigner, LedgerConfig } from '../../src/service/signers/LedgerSigner';

const CosmosApp: any = require('ledger-cosmos-js').default;

const Resolve = require('path').resolve;

const APP_PATH = Resolve('../../app/bin/app.elf');

export class LedgerSignerZemu extends LedgerSigner {
  public sim: any;

  constructor(config: LedgerConfig, account: number = 0) {
    super(config, account);
  }

  async createTransport() {
    if (this.app === null || this.app === undefined) {
      const sim = new Zemu(APP_PATH);
      await sim.start();
      this.app = new CosmosApp(sim.getTransport());
      this.sim = sim;
    }
  }

  async closeTransport() {
    if (this.sim != null) {
      await this.sim.close();
      this.sim = null;
      this.app = null;
    }
  }
}

console.log('OK');
