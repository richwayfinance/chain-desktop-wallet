// import CosmosApp from 'ledger-cosmos-js';
const Zemu = require('@zondax/menu');
import { LedgerSigner, LedgerConfig } from '../../src/service/signers/LedgerSigner';
import {BIP44} from "@chainapsis/cosmosjs/core/bip44";

const CosmosApp: any = require('ledger-cosmos-js').default;

const Resolve = require('path').resolve;

const APP_PATH = Resolve('../app/bin/app.elf');

export class LedgerSignerZemu extends LedgerSigner {
  public sim: any;

  constructor(config: LedgerConfig, account: number = 0) {
    super(config, account);
  }

  async createTransport() {
    if (this.app === null || this.app === undefined) {
      const sim = new Zemu(APP_PATH);
      await sim.start();
      Zemu.default.checkAndPullImage();
      this.app = new CosmosApp(sim.getTransport());
      this.sim = sim;
    }
  }

  async closeTransport() {
    if (this.sim != null) {
      await this.sim.close();
      this.sim = null;
      this.app = null;
      Zemu.stopAllEmuContainers();
    }
  }
}

async function main() {
  let config = new LedgerConfig(false, new BIP44(44, 394));
  let zemu = new LedgerSignerZemu(config, 0);

  try {
    zemu.createTransport();
  } finally {
    zemu.closeTransport();
  }
}

(async () => {
  await main();
})();
