import { NextRequest, NextResponse } from 'next/server';
import { fetchDynamicQuote, MonthlyExpenseMetrics } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const metrics: MonthlyExpenseMetrics = {
      totalExpense: body.totalExpense ?? body.totalShopee ?? 0,
      totalIncome: body.totalIncome ?? 0,
      budget: body.budget ?? 5000000,
      remainingBudget: body.remainingBudget ?? 5000000 - (body.totalShopee ?? 0),
      usedPercentage: body.usedPercentage ?? 0,
      shopeeTotal: body.shopeeTotal ?? 0,
      dailyAvg: body.dailyAvg ?? 0,
      status: body.status ?? body.budgetStatus ?? 'AMAN',
    };

    const quoteData = await fetchDynamicQuote(metrics);
    return NextResponse.json({ success: true, data: quoteData });
  } catch (error: any) {
    console.error('API Quote error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal menghasilkan quote finansial' },
      { status: 500 }
    );
  }
}
