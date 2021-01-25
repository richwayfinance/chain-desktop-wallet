import { Bytes } from '@crypto-com/chain-jslib/lib/dist/utils/bytes/bytes';
const { ipcMain } = require('electron');
import { LedgerSignerNative } from './LedgerSignerNative';
import { LedgerConfig } from '../src/service/signers/LedgerSigner';
import { BIP44 } from '@chainapsis/cosmosjs/core/bip44';
export class IpcMain {
  provider: LedgerSignerNative;
  constructor() {
    let config = new LedgerConfig(false, new BIP44(44, 394));
    this.provider = new LedgerSignerNative(config);
  }
  setup() {
    ipcMain.on('asynchronous-message', (event, arg) => {
      event.reply('asynchronous-reply', 'pong');
    });

    ipcMain.on('synchronous-message', (event, arg) => {
      event.returnValue = 'pong';
    });

    ipcMain.on('enableWallet', async (event, arg) => {
      let ret = {};
      try {
        let index = arg.index;
        const info = await this.provider.enable(index);
        let accountInfo = info[0];
        let accountPubKey = info[1].toUint8Array();
        ret = {
          success: true,
          account: accountInfo,
          pubKey: accountPubKey,
          label: 'enableWallet reply',
        };
      } catch (e) {
        ret = {
          success: false,
        };
        console.error('enableWallet error ' + e);
      } finally {
      }

      event.returnValue = ret;
    });
    // arg: string
    ipcMain.on('signMessage', async (event, arg) => {
      let argBuffer = Buffer.from(arg);
      let signature = await this.provider.sign(Bytes.fromBuffer(argBuffer));
      let signatureArray = signature.toUint8Array();
      let ret = { signed: signatureArray, original: arg, label: 'signMessage reply' };
      event.returnValue = ret;
    });
  }
}
