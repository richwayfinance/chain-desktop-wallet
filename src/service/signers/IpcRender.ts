import { Bytes } from '@crypto-com/chain-jslib/lib/dist/utils/bytes/bytes';
import { ISignerProvider } from './SignerProvider';

let electron: any;
if (window.require) {
  electron = window.require('electron');
}
export class IpcRender implements ISignerProvider {
  // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  // eslint-disable-next-line  class-methods-use-this
  async getPubKey(index: number): Promise<Bytes> {
    const arg = electron.ipcRenderer.sendSync('enableWallet', {
      index,
      message: 'enableWallet request for getPubKey',
    });
    const ret = Bytes.fromBuffer(Buffer.from(arg.pubKey));
    return ret;
  }

  // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  // eslint-disable-next-line  class-methods-use-this
  async getAddress(index: number): Promise<string> {
    const arg = electron.ipcRenderer.sendSync('enableWallet', {
      index,
      message: 'enableWallet request for getAddress',
    });
    return arg.account;
  }

  // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  // eslint-disable-next-line  class-methods-use-this
  async sign(message: Bytes): Promise<Bytes> {
    const stringMessage = message.toBuffer().toString();
    const arg = electron.ipcRenderer.sendSync('signMessage', stringMessage);
    return Bytes.fromBuffer(Buffer.from(arg.signed));
  }
}
