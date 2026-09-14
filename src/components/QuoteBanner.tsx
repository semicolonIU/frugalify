'use client';

import React from 'react';
import { Quote, Sparkles, RefreshCw } from 'lucide-react';
import { FinancialQuoteResponse } from '@/lib/types';

interface QuoteBannerProps {
  quote: FinancialQuoteResponse | null;
  onRefreshQuote: () => void;
  isLoading: boolean;
}

export const QuoteBanner: React.FC<QuoteBannerProps> = ({
  quote,
  onRefreshQuote,
  isLoading,
}) => {
  if (!quote) return null;

  return (
    <div className="relative mb-6 rounded-2xl p-0.5 bg-gradient-to-r from-emerald-500/30 via-teal-500/30 to-amber-500/30 shadow-xl overflow-hidden">
      <div className="glass-panel rounded-[15px] p-4 sm:p-5 relative bg-white/90 dark:bg-slate-950/80 transition-colors duration-300">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Quote className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 animate-pulse" /> Tips & Financial Quote
                </span>
              </div>
              <p className="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-100 italic leading-relaxed">
                "{quote.text}"
              </p>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {quote.author}
              </p>
            </div>
          </div>

          <button
            onClick={onRefreshQuote}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all shrink-0 disabled:opacity-50 active:scale-95"
            title="Generate Quote Baru dengan Gemini AI"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-500' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
