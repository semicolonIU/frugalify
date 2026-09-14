import { CashTransaction, InvestmentAsset, UserSettings, FinancialLivingScore } from './types';

export function calculateFinancialLivingScore(
  transactions: CashTransaction[],
  investments: InvestmentAsset[],
  settings: UserSettings
): FinancialLivingScore {
  // Active Month Filter (Aligned with Card Pengeluaran Bulan Ini)
  const currentMonthKey = new Date().toISOString().substring(0, 7);
  const currentMonthExpenses = transactions.filter(
    t => t.type === 'EXPENSE' && (!t.date || t.date.startsWith(currentMonthKey))
  );
  const currentMonthIncomes = transactions.filter(
    t => t.type === 'INCOME' && (!t.date || t.date.startsWith(currentMonthKey))
  );

  const expenses = currentMonthExpenses.length > 0 ? currentMonthExpenses : transactions.filter(t => t.type === 'EXPENSE');
  const incomes = currentMonthIncomes.length > 0 ? currentMonthIncomes : transactions.filter(t => t.type === 'INCOME');

  const totalMonthlyExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalMonthlyIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);

  // Shopee / E-commerce total
  const shopeeExpenses = expenses
    .filter(e => e.platform === 'Screenshot Shopee' || e.category.toLowerCase().includes('shopee') || e.category.toLowerCase().includes('e-commerce') || e.category.toLowerCase().includes('marketplace'))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalInvestmentValue = investments.reduce((acc, curr) => acc + curr.totalValue, 0);
  const totalWalletBalance = settings.wallets.reduce((acc, curr) => acc + curr.balance, 0);

  const budget = settings.monthlyExpenseBudget > 0 ? settings.monthlyExpenseBudget : 5000000;
  const remainingBudget = budget - totalMonthlyExpenses;
  const expenseToBudgetRatio = Math.round((totalMonthlyExpenses / budget) * 100);

  const currentDay = new Date().getDate() || 1;
  const dailyAvg = Math.round(totalMonthlyExpenses / currentDay);

  // 1. Budget Control Score (Max 40 points)
  // 0% - 80% = 40 pts, 80%-100% = 30-39 pts, >100% decreases rapidly
  let budgetScore = 40;
  if (expenseToBudgetRatio > 120) {
    budgetScore = Math.max(0, Math.round(40 - (expenseToBudgetRatio - 100) * 1.5));
  } else if (expenseToBudgetRatio > 100) {
    budgetScore = Math.round(40 - (expenseToBudgetRatio - 100) * 1.0);
  } else if (expenseToBudgetRatio > 80) {
    budgetScore = Math.round(40 - (expenseToBudgetRatio - 80) * 0.5);
  } else {
    budgetScore = 40;
  }

  // 2. Impulse Buying Control Score (Max 30 points)
  // Shopee / Marketplace ratio < 15% = 30 pts, 15-40% scales down, > 40% = 0 pts
  let impulseScore = 30;
  const shopeeRatio = totalMonthlyExpenses > 0 ? (shopeeExpenses / totalMonthlyExpenses) * 100 : 0;
  if (shopeeRatio > 40) {
    impulseScore = 0;
  } else if (shopeeRatio > 15) {
    impulseScore = Math.round(30 - ((shopeeRatio - 15) / 25) * 30);
  } else {
    impulseScore = 30;
  }

  // 3. Investment & Net Worth Growth Score (Max 30 points)
  let investmentScore = 15;
  if (totalInvestmentValue >= budget * 3) {
    investmentScore = 30;
  } else if (totalInvestmentValue >= budget * 1.5) {
    investmentScore = 25;
  } else if (totalInvestmentValue >= budget) {
    investmentScore = 20;
  } else if (totalInvestmentValue > 0) {
    investmentScore = 15;
  } else {
    investmentScore = 5;
  }

  const finalScore = Math.min(100, Math.max(0, budgetScore + impulseScore + investmentScore));

  // Determine status & actionable recommendation aligned with Expense Card
  let status: FinancialLivingScore['status'] = 'Sangat Sehat & Frugal';
  let recommendation = `Pengeluaran bulan ini terkontrol rapi (${expenseToBudgetRatio}% dari budget). Sisa kuota Rp ${Math.max(0, remainingBudget).toLocaleString('id-ID')} sangat ideal terus disisihkan ke portofolio investasi!`;

  if (expenseToBudgetRatio > 100 || finalScore < 55) {
    status = 'Boros / Overbudget';
    recommendation = `Perhatian! Pengeluaran telah melebihi batas budget bulan ini sebesar Rp ${Math.abs(remainingBudget).toLocaleString('id-ID')} (${expenseToBudgetRatio}% terpakai). Hentikan belanja impulsif dan kurangi pengeluaran non-primer!`;
  } else if (expenseToBudgetRatio > 80 || finalScore < 80 || shopeeRatio > 25) {
    status = 'Waspada / Perlu Kontrol';
    recommendation = `Waspada! Pengeluaran bulan ini menyentuh ${expenseToBudgetRatio}% dari budget (rerata Rp ${dailyAvg.toLocaleString('id-ID')}/hari). Jaga sisa kuota Rp ${remainingBudget.toLocaleString('id-ID')} hingga akhir bulan!`;
  }

  // Savings ratio calculation
  const referenceIncome = totalMonthlyIncome > 0 
    ? totalMonthlyIncome 
    : Math.max(budget, totalMonthlyExpenses + totalWalletBalance * 0.1);
    
  const savingsRatio = Math.min(100, Math.max(0, Math.round(((referenceIncome - totalMonthlyExpenses) / referenceIncome) * 100)));

  return {
    score: finalScore,
    status,
    budgetScore,
    impulseScore,
    investmentScore,
    savingsRatio,
    shopeeImpulseRatio: Math.round(shopeeRatio),
    expenseToBudgetRatio,
    recommendation,
  };
}
