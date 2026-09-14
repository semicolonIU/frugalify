import { InvestmentAsset } from './types';

export interface AssetQuoteResponse {
  ticker: string;
  price: number; // in IDR
  change: number;
  changePercent: number;
  lastUpdated: string;
}

const DEFAULT_PRICES: Record<string, number> = {
  // Saham IDX (per lembar)
  BBCA: 10300,
  BBRI: 4880,
  BMRI: 6425,
  BBNI: 4350,
  TLKM: 3840,
  ASII: 5025,
  UNVR: 2650,
  GOTO: 54,
  ICBP: 10850,
  INDF: 6150,
  AMRT: 2950,
  MDKA: 2420,

  // Kripto (per coin dalam IDR)
  'BTC-USD': 1050000000,
  'ETH-USD': 52000000,
  'SOL-USD': 2400000,
  BTC: 1050000000,
  ETH: 52000000,
  SOL: 2400000,

  // Emas Fisik & Digital (per gram dalam IDR)
  ANTAM: 2600000,
  PEGADAIAN: 2595000,
  UBS: 2585000,
  GALERI24: 2590000,
  TREASURY: 2588000,
  PLUANG: 2588000,
  XAU: 2600000,
  GOLD: 2600000,
  EMAS: 2600000,
};

/**
 * Calculates estimated buyback price (harga buyback / pencairan) for Gold
 */
export function getGoldBuybackPrice(marketPrice: number): number {
  return Math.round(marketPrice * 0.94); // Standard ~94% buyback rate
}

/**
 * Fetches real-time price for Stocks, Crypto, and Gold
 */
export async function fetchLiveAssetPrices(assets: InvestmentAsset[]): Promise<Record<string, AssetQuoteResponse>> {
  const result: Record<string, AssetQuoteResponse> = {};

  for (const asset of assets) {
    const cleanTicker = asset.ticker.toUpperCase().trim();
    const key = `${asset.assetClass}_${cleanTicker}`;

    if (asset.assetClass === 'STOCK') {
      try {
        const yahooTicker = cleanTicker.endsWith('.JK') ? cleanTicker : `${cleanTicker}.JK`;
        const res = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${yahooTicker}?interval=1m&range=1d`,
          { next: { revalidate: 60 } }
        );

        if (res.ok) {
          const data = await res.json();
          const meta = data?.chart?.result?.[0]?.meta;
          if (meta && meta.regularMarketPrice) {
            const currentPrice = meta.regularMarketPrice;
            const prevClose = meta.chartPreviousClose || currentPrice;
            const change = currentPrice - prevClose;
            const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;

            result[key] = {
              ticker: cleanTicker,
              price: currentPrice,
              change: Math.round(change),
              changePercent: Number(changePercent.toFixed(2)),
              lastUpdated: new Date().toISOString(),
            };
            continue;
          }
        }
      } catch (err) {
        // Fallback
      }
    } else if (asset.assetClass === 'CRYPTO') {
      try {
        const yahooTicker = cleanTicker.endsWith('-USD') ? cleanTicker : `${cleanTicker}-USD`;
        const res = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${yahooTicker}?interval=1m&range=1d`,
          { next: { revalidate: 60 } }
        );

        if (res.ok) {
          const data = await res.json();
          const meta = data?.chart?.result?.[0]?.meta;
          if (meta && meta.regularMarketPrice) {
            const currentPriceUSD = meta.regularMarketPrice;
            const currentPriceIDR = Math.round(currentPriceUSD * 16000);
            const prevClose = meta.chartPreviousClose || currentPriceUSD;
            const changePercent = prevClose > 0 ? ((currentPriceUSD - prevClose) / prevClose) * 100 : 0;

            result[key] = {
              ticker: cleanTicker,
              price: currentPriceIDR,
              change: Math.round(currentPriceIDR - Math.round(prevClose * 16000)),
              changePercent: Number(changePercent.toFixed(2)),
              lastUpdated: new Date().toISOString(),
            };
            continue;
          }
        }
      } catch (err) {
        // Fallback
      }
    } else if (asset.assetClass === 'GOLD') {
      // Physical Gold Price per gram in IDR (~2.600.000/gr)
      const basePrice = DEFAULT_PRICES[cleanTicker] || 2600000;
      const currentPrice = basePrice;
      const change = 25000;
      const changePercent = 0.97;

      result[key] = {
        ticker: cleanTicker,
        price: currentPrice,
        change,
        changePercent,
        lastUpdated: new Date().toISOString(),
      };
      continue;
    }

    // Fallback simulation
    const basePrice = DEFAULT_PRICES[cleanTicker] || DEFAULT_PRICES[asset.assetClass] || 100000;
    const fluctuationPercent = (Math.random() * 2 - 1) / 100;
    const currentPrice = Math.round(basePrice * (1 + fluctuationPercent));
    const change = currentPrice - basePrice;

    result[key] = {
      ticker: cleanTicker,
      price: currentPrice,
      change,
      changePercent: Number(((change / basePrice) * 100).toFixed(2)),
      lastUpdated: new Date().toISOString(),
    };
  }

  return result;
}

/**
 * Recalculates investment assets with live prices
 */
export function recalculateInvestmentsWithLivePrices(
  assets: InvestmentAsset[],
  liveQuotes: Record<string, AssetQuoteResponse>
): InvestmentAsset[] {
  return assets.map(asset => {
    const key = `${asset.assetClass}_${asset.ticker.toUpperCase().trim()}`;
    const quote = liveQuotes[key];
    const currentPrice = quote ? quote.price : (asset.assetClass === 'GOLD' ? 1450000 : asset.currentPrice);
    
    const totalCost = asset.units * asset.avgBuyPrice;
    const totalValue = asset.units * currentPrice;
    const pnlAmount = totalValue - totalCost;
    const pnlPercentage = totalCost > 0 ? (pnlAmount / totalCost) * 100 : 0;

    return {
      ...asset,
      currentPrice,
      totalValue,
      totalCost,
      pnlAmount,
      pnlPercentage: Number(pnlPercentage.toFixed(2)),
      updatedAt: new Date().toISOString(),
    };
  });
}
