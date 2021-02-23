import * as Zemu from '@zondax/zemu';
import CosmosApp from 'ledger-cosmos-js';
import * as path from 'path';
import { LedgerSigner } from '../../src/service/signers/LedgerSigner';
import { ISignerProvider } from '../../src/service/signers/SignerProvider';
import { LedgerTransactionSigner } from '../../src/service/signers/LedgerTransactionSigner';
import { CustomDevNet } from '../../src/config/StaticConfig';
import { Bytes } from '@crypto-com/chain-jslib/lib/dist/utils/bytes/bytes';


const APP_PATH = path.resolve(`./app/bin/app.elf`);

const seed = 'equip will roof matter pink blind book anxiety banner elbow sun young';
const SIM_OPTIONS = {
  logging: true,
  start_delay: 4000,
  X11: true,
  custom: `-s "${seed}" --display=headless --color LAGOON_BLUE`,
};

const example_tx_str = {
  account_number: '108',
  chain_id: 'cosmoshub-3',
  fee: {
    amount: [
      {
        amount: '600',
        denom: 'basecro',
      },
    ],
    gas: '200000',
  },
  memo: '',
  msgs: [
    {
      type: 'cosmos-sdk/MsgWithdrawDelegationReward',
      value: {
        delegator_address: 'cro19umvgcvk8cxsvzemy239nj9ngc2ltukantgyp3',
        validator_address: 'crovaloper1648ynlpdw7fqa2axt0w2yp3fk542junl7rsvq6',
      },
    },
    {
      type: 'cosmos-sdk/MsgDelegate',
      value: {
        amount: {
          amount: '20139397',
          denom: 'basecro',
        },
        delegator_address: 'cro19umvgcvk8cxsvzemy239nj9ngc2ltukantgyp3',
        validator_address: 'crovaloper1648ynlpdw7fqa2axt0w2yp3fk542junl7rsvq6',
      },
    },
  ],
  sequence: '106',
};

// async function debugScenario(sim, app) {
//   const path = [44, 394, 0, 0, 0];
//   let tx = JSON.stringify(example_tx_str);
//   const addr = await app.getAddressAndPubKey(path, 'cro');
//   console.log(addr);
//
//   console.log(tx);
//
//   // do not wait here..
//   const signatureRequest = app.sign(path, tx);
//   await Zemu.default.sleep(10000);
//
//   var i;
//   for (i=0; i<16; i++) {
//       await Zemu.default.sleep(500);
//       console.log("right click");
//       await sim.clickRight();
//   }
//   await sim.clickBoth();
//
//   let resp = await signatureRequest;
//   console.log(resp);
// }


export class LedgerSignerZemu extends LedgerSigner {
  public sim: any;

  constructor(account: number = 0) {
    super(account);
    this.sim = new Zemu.default(APP_PATH);
  }

  async createTransport() {
    await Zemu.default.checkAndPullImage();
    if (this.app === null || this.app === undefined) {
      await this.sim.start(SIM_OPTIONS);
      this.app = new CosmosApp(this.sim.getTransport());
    }
  }
  async closeTransport() {
    if (this.sim === null) {
      console.log("transport already closed");
    } else {
      await this.sim.close();
      this.sim = null;
      await Zemu.default.stopAllEmuContainers();
    }
  }
}

// async function main2() {
//
//   const sim = new Zemu.default(APP_PATH);
//
//   try {
//     await sim.start(SIM_OPTIONS);
//     // const app = new CosmosApp(sim.getTransport());
//
//     ////////////
//     /// TIP you can use zemu commands here to take the app to the point where you trigger a breakpoint
//
//     // await debugScenario(sim, app);
//
//     /// TIP
//   } finally {
//     await sim.close();
//     await Zemu.default.stopAllEmuContainers();
//   }
// }

export class LedgerWalletSignerProviderZemu implements ISignerProvider {
  provider: LedgerSignerZemu;

  constructor() {
    this.provider = new LedgerSignerZemu();
  }

  public async getPubKey(index: number): Promise<Bytes> {
    const result = await this.provider.enable(index, 'cro'); // dummy value
    return result[1];
  }

  public async getAddress(index: number, addressPrefix: string): Promise<string> {
    const result = await this.provider.enable(index, addressPrefix);
    return result[0];
  }

  public async sign(message: Bytes): Promise<Bytes> {
    return this.provider.sign(message);
  }
}


async function main() {
  const ledgerZemu =new LedgerSignerZemu(0);
  try {
    const p = await ledgerZemu.enable(0, "cro");
    console.log(p);
  } finally {
    await ledgerZemu.closeTransport();
  }

  const signerProvider = new LedgerWalletSignerProviderZemu();
  console.log(signerProvider);
  const signer = new LedgerTransactionSigner(
      CustomDevNet,
      signerProvider,
  );
  console.log(signer);
}


(async () => {
    await main();
    console.log(example_tx_str);
})();
