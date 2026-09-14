import { NextRequest, NextResponse } from 'next/server';
import { fetchLiveAssetPrices } from '@/lib/stocks';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tickersParam = searchParams.get('tickers');

    const tickers = tickersParam
      ? tickersParam.split(',').map(t => t.trim())
      : ['BBCA', 'BBRI', 'TLKM', 'ASII', 'GOTO', 'BMRI', 'UNVR', 'ICBP'];

    // Create dummy InvestmentAsset objects for stocks
    const assets = tickers.map(ticker => ({
      id: ticker,
      assetClass: 'STOCK' as const,
      ticker,
      name: ticker,
      units: 0,
      avgBuyPrice: 0,
      currentPrice: 0,
      totalCost: 0,
      totalValue: 0,
      pnlAmount: 0,
      pnlPercentage: 0,
      updatedAt: new Date().toISOString(),
    }));

    const liveQuotes = await fetchLiveAssetPrices(assets);
    // Return only price info per ticker
    const data = tickers.map(ticker => {
      const key = `STOCK_${ticker.toUpperCase()}`;
      const quote = liveQuotes[key];
      return quote ? { ...quote } : { ticker, currentPrice: 0, change: 0, changePercentage: 0 };
    });
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('API Stocks error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal mengambil data live saham' },
      { status: 500 }
    );
  }
}
