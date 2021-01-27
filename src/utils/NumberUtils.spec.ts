import 'mocha';
import { expect } from 'chai';
import { fromScientificNotation, getBaseScaledAmount } from './NumberUtils';
import { UserAsset } from '../models/UserAsset';

describe('Testing Number utils', () => {
  it('Test floating point precision ', () => {
    const asset: UserAsset = {
      decimals: 8,
      mainnetSymbol: '',
      balance: '0',
      description: 'The best asset',
      icon_url: 'some url',
      identifier: 'cbd4bab2cbfd2b3',
      name: 'Best Asset',
      symbol: 'BEST',
      walletId: '',
      stakedBalance: '0',
    };

    expect(getBaseScaledAmount('0.00000003', asset)).to.eq('3');
    expect(getBaseScaledAmount('0.0000000299', asset)).to.eq('2.99');
  });

  it('Test conversion from scientific notation', () => {
    expect(fromScientificNotation('3E-4')).to.eq('0.0003');
    expect(fromScientificNotation('42E-4')).to.eq('0.0042');
    expect(fromScientificNotation('1440')).to.eq('1440');
  });
});