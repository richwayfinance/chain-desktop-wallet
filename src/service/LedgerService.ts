import { ISignerProvider } from './signers/SignerProvider';
// eslint-disable-next-line   @typescript-eslint/no-unused-vars
import { LedgerWalletSignerProviderNative } from './signers/LedgerWalletSignerProviderNative';
// eslint-disable-next-line     @typescript-eslint/no-unused-vars
import { LedgerWalletSignerProviderWebusb } from './signers/LedgerWalletSignerProviderWebusb';
// eslint-disable-next-line     @typescript-eslint/no-unused-vars
import { LedgerWalletSignerProviderZemu } from './signers/LedgerWalletSignerProviderZemu';

export const useWebusbForLedger = true;

export function createLedgerDevice(): ISignerProvider {
  let signerProvider: ISignerProvider;
  if (useWebusbForLedger) {
    signerProvider = new LedgerWalletSignerProviderZemu();
  } else {
    signerProvider = new LedgerWalletSignerProviderWebusb();
    // signerProvider = new LedgerWalletSignerProviderNative();
  }
  return signerProvider;
}
