import axios, { AxiosInstance } from 'axios';
import { AssetMarketPrice } from '../../models/UserAsset';
import { CroPrice } from './CroMarketApiModels';
import { MARKET_API_BASE_URL } from '../../config/StaticConfig';

export interface IMarketApi {
  getAssetPrice(assetSymbol: string, currency: string): Promise<AssetMarketPrice>;
}

export class CroMarketApi implements IMarketApi {
  private readonly axiosClient: AxiosInstance;

  constructor() {
    this.axiosClient = axios.create({
      baseURL: MARKET_API_BASE_URL,
    });
  }

  public async getAssetPrice(assetSymbol: string, currency: string): Promise<AssetMarketPrice> {
    const croMarketPrice = await this.axiosClient.get<CroPrice>('/coins/show');
    const loadedSymbol = croMarketPrice.data.coin.symbol;
    const loadedCurrency = croMarketPrice.data.coin.price_native.currency;

    if (assetSymbol.toUpperCase() !== loadedSymbol || loadedCurrency !== currency.toUpperCase()) {
      throw TypeError('Could not find requested market price info');
    }

    return {
      assetSymbol: loadedSymbol,
      currency: loadedCurrency,
      dailyChange: croMarketPrice.data.coin.percent_change_native_24h,
      price: croMarketPrice.data.coin.price_native.amount,
    };
  }
}

export const croMarketPriceApi = new CroMarketApi();
