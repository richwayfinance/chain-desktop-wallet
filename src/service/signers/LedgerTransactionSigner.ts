import { Bytes } from '@crypto-com/chain-jslib/lib/dist/utils/bytes/bytes';

import sdk from '@crypto-com/chain-jslib';
import { Big, Units } from '../../utils/ChainJsLib';
import { WalletConfig } from '../../config/StaticConfig';
import {
  TransactionUnsigned,
  DelegateTransactionUnsigned,
  TransferTransactionUnsigned,
  WithdrawStakingRewardUnsigned,
} from './TransactionSupported';
import { ISignerProvider } from './SignerProvider';
import { ITransactionSigner } from './TransactionSigner';

export class LedgerTransactionSigner implements ITransactionSigner {
  public readonly config: WalletConfig;

  public readonly signerProvider: ISignerProvider;

  fee: string;

  gas: string;

  constructor(config: WalletConfig, signerProvider: ISignerProvider) {
    this.config = config;
    this.signerProvider = signerProvider;
    this.fee = '0';
    this.gas = '2000000';
  }

  public getTransactionInfo(phrase: string, transaction: TransactionUnsigned) {
    const cro = sdk.CroSDK({ network: this.config.network });
    const rawTx = new cro.RawTransaction();
    rawTx.setMemo(transaction.memo);

    if (transaction.fee) {
      const fee = new cro.Coin(transaction.fee, Units.BASE);
      this.fee = transaction.fee;
      rawTx.setFee(fee);
    }

    return { cro, rawTx };
  }

  public async signTransfer(
    transaction: TransferTransactionUnsigned,
    phrase: string,
  ): Promise<string> {
    const { cro, rawTx } = this.getTransactionInfo(phrase, transaction);

    const msgSend = new cro.bank.MsgSend({
      fromAddress: transaction.fromAddress,
      toAddress: transaction.toAddress,
      amount: new cro.Coin(transaction.amount, Units.BASE),
    });

    const pubkeyoriginal = await (await this.signerProvider.getPubKey(0)).toUint8Array();
    const pubkey = Bytes.fromUint8Array(pubkeyoriginal.slice(1));
    const signableTx = rawTx
      .appendMessage(msgSend)
      .addSigner({
        publicKey: pubkey,
        accountNumber: new Big(transaction.accountNumber),
        accountSequence: new Big(transaction.accountSequence),
        signMode: 0, //   LEGACY_AMINO_JSON = 0, DIRECT = 1,
      })
      .toSignable();

    const bytesMessage: Bytes =signableTx.toSignDocument(0);
    const signature = await this.signerProvider.sign(bytesMessage);

    return signableTx
      .setSignature(0, signature)
      .toSigned()
      .getHexEncoded();
  }

  public async signDelegateTx(
    transaction: DelegateTransactionUnsigned,
    phrase: string,
  ): Promise<string> {
    const { cro, rawTx } = this.getTransactionInfo(phrase, transaction);

    const delegateAmount = new cro.Coin(transaction.amount, Units.BASE);
    const msgDelegate = new cro.staking.MsgDelegate({
      delegatorAddress: transaction.delegatorAddress,
      validatorAddress: transaction.validatorAddress,
      amount: delegateAmount,
    });

    const pubkeyoriginal = await (await this.signerProvider.getPubKey(0)).toUint8Array();
    const pubkey = Bytes.fromUint8Array(pubkeyoriginal.slice(1));
    const signableTx = rawTx
      .appendMessage(msgDelegate)
      .addSigner({
        publicKey:pubkey,
        accountNumber: new Big(transaction.accountNumber),
        accountSequence: new Big(transaction.accountSequence),
        signMode: 0, //   LEGACY_AMINO_JSON = 0, DIRECT = 1,
      })
      .toSignable();

    const bytesMessage: Bytes =signableTx.toSignDocument(0);
    const signature = await this.signerProvider.sign(bytesMessage);

    return signableTx
      .setSignature(0, signature)
      .toSigned()
      .getHexEncoded();
  }

  public async signWithdrawStakingRewardTx(
    transaction: WithdrawStakingRewardUnsigned,
    phrase: string,
  ): Promise<string> {
    const { cro, rawTx } = this.getTransactionInfo(phrase, transaction);

    const msgWithdrawDelegatorReward = new cro.distribution.MsgWithdrawDelegatorReward({
      delegatorAddress: transaction.delegatorAddress,
      validatorAddress: transaction.validatorAddress,
    });

    const pubkeyoriginal = await (await this.signerProvider.getPubKey(0)).toUint8Array();
    const pubkey = Bytes.fromUint8Array(pubkeyoriginal.slice(1));

  
    const signableTx = rawTx
      .appendMessage(msgWithdrawDelegatorReward)
      .addSigner({
        publicKey:pubkey,
        accountNumber: new Big(transaction.accountNumber),
        accountSequence: new Big(transaction.accountSequence),
        signMode: 0, //   LEGACY_AMINO_JSON = 0, DIRECT = 1,
      })
      .toSignable();

    const bytesMessage: Bytes =signableTx.toSignDocument(0);

    const signature = await this.signerProvider.sign(bytesMessage);
    return signableTx
      .setSignature(0, signature)
      .toSigned()
      .getHexEncoded();
  }
}
