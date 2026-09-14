'use client';

import React, { useMemo, useState } from 'react';
import { PieChart } from 'lucide-react';
import { InvestmentAsset, WalletAccount } from '@/lib/types';
import { useTheme } from '@/components/ThemeProvider';
import { usePrivacy } from '@/components/PrivacyProvider';

interface WealthPieChartProps {
  investments: InvestmentAsset[];
  wallets: WalletAccount[];
}

interface SliceData {
  label: string;
  value: number;
  color: string;
  glowColor: string;
  percentage: number;
}

export const WealthPieChart: React.FC<WealthPieChartProps> = ({ investments, wallets }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { theme } = useTheme();
  const { formatCurrency } = usePrivacy();

  const isLight = theme === 'light';

  const slices = useMemo(() => {
    const stockTotal = investments
      .filter(i => i.assetClass === 'STOCK')
      .reduce((sum, i) => sum + i.totalValue, 0);

    const cryptoTotal = investments
      .filter(i => i.assetClass === 'CRYPTO')
      .reduce((sum, i) => sum + i.totalValue, 0);

    const goldTotal = investments
      .filter(i => i.assetClass === 'GOLD')
      .reduce((sum, i) => sum + i.totalValue, 0);

    const cashTotal = wallets.reduce((sum, w) => sum + w.balance, 0);

    const grandTotal = stockTotal + cryptoTotal + goldTotal + cashTotal;
    if (grandTotal === 0) return [];

    const rawSlices: SliceData[] = [
      { label: 'Saham', value: stockTotal, color: '#14b8a6', glowColor: 'rgba(20,184,166,0.35)', percentage: 0 },
      { label: 'Kripto', value: cryptoTotal, color: '#f59e0b', glowColor: 'rgba(245,158,11,0.35)', percentage: 0 },
      { label: 'Emas', value: goldTotal, color: '#eab308', glowColor: 'rgba(234,179,8,0.35)', percentage: 0 },
      { label: 'Kas / Dompet', value: cashTotal, color: '#6366f1', glowColor: 'rgba(99,102,241,0.35)', percentage: 0 },
    ];

    return rawSlices
      .filter(s => s.value > 0)
      .map(s => ({ ...s, percentage: parseFloat(((s.value / grandTotal) * 100).toFixed(1)) }));
  }, [investments, wallets]);

  const totalWealth = useMemo(() => slices.reduce((sum, s) => sum + s.value, 0), [slices]);

  const paths = useMemo(() => {
    if (slices.length === 0) return [];

    const cx = 130, cy = 130, r = 105;
    let cumulativeAngle = -90;

    return slices.map((slice) => {
      const angle = (slice.percentage / 100) * 360;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + angle;
      cumulativeAngle = endAngle;

      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      const x1 = cx + r * Math.cos(startRad);
      const y1 = cy + r * Math.sin(startRad);
      const x2 = cx + r * Math.cos(endRad);
      const y2 = cy + r * Math.sin(endRad);

      const largeArc = angle > 180 ? 1 : 0;

      if (slices.length === 1) {
        return {
          path: `M ${cx},${cy - r} A ${r},${r} 0 1,1 ${cx - 0.001},${cy - r} Z`,
          color: slice.color,
          glowColor: slice.glowColor,
        };
      }

      return {
        path: `M ${cx},${cy} L ${x1},${y1} A ${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`,
        color: slice.color,
        glowColor: slice.glowColor,
      };
    });
  }, [slices]);

  const formatRupiah = (val: number) => {
    if (val >= 1_000_000_000) return `Rp ${(val / 1_000_000_000).toFixed(1)}M`;
    if (val >= 1_000_000) return `Rp ${(val / 1_000_000).toFixed(1)}Jt`;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  if (slices.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6 mt-6">
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 mb-4">
            <PieChart className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-300">Belum Ada Data Alokasi</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[220px]">
            Tambahkan aset investasi atau saldo dompet untuk melihat diagram alokasi kekayaan Anda.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 mt-6 relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-300">
      {/* Background glow */}
      <div className="absolute -right-10 -top-10 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl group-hover:bg-teal-500/10 transition-all duration-500" />
      <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all duration-500" />

      {/* Title */}
      <div className="flex items-center gap-2 mb-5 relative z-10">
        <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/20">
          <PieChart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Alokasi Kekayaan</h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Distribusi aset real-time</p>
        </div>
      </div>

      {/* Chart + Legend layout */}
      <div className="flex flex-col items-center gap-5 relative z-10">
        {/* SVG Donut Chart — Large */}
        <div className="relative">
          {/* Outer glow ring */}
          <div
            className="absolute inset-0 rounded-full animate-pulse-ring"
            style={{
              background: hoveredIndex !== null
                ? `radial-gradient(circle, ${slices[hoveredIndex]?.glowColor || 'transparent'} 0%, transparent 70%)`
                : 'radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)',
              transition: 'background 0.4s ease',
            }}
          />

          <svg viewBox="0 0 260 260" className="w-64 h-64 sm:w-72 sm:h-72 relative z-10">
            {/* Subtle outer ring */}
            <circle cx="130" cy="130" r="118" fill="none" stroke={isLight ? 'rgba(0,0,0,0.08)' : 'rgba(148,163,184,0.06)'} strokeWidth="1" />
            <circle cx="130" cy="130" r="108" fill="none" stroke={isLight ? 'rgba(0,0,0,0.05)' : 'rgba(148,163,184,0.04)'} strokeWidth="0.5" strokeDasharray="3 3" />

            {/* Pie slices */}
            {paths.map((p, i) => (
              <path
                key={i}
                d={p.path}
                fill={p.color}
                stroke={isLight ? '#ffffff' : '#0f172a'}
                strokeWidth="2"
                opacity={hoveredIndex === null || hoveredIndex === i ? 1 : 0.3}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  transition: 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.4,0,0.2,1), filter 0.35s ease',
                  transformOrigin: '130px 130px',
                  transform: hoveredIndex === i ? 'scale(1.06)' : 'scale(1)',
                  filter: hoveredIndex === i ? `drop-shadow(0 0 10px ${p.glowColor})` : 'none',
                  cursor: 'pointer',
                }}
              />
            ))}

            {/* Center donut hole - matching glass-card bg */}
            <circle cx="130" cy="130" r="58" fill={isLight ? '#ffffff' : '#0f172a'} />
            <circle cx="130" cy="130" r="58" fill="url(#centerGradient)" />
            <circle cx="130" cy="130" r="58" fill="none" stroke={isLight ? 'rgba(0,0,0,0.08)' : 'rgba(148,163,184,0.08)'} strokeWidth="1" />

            {/* Center text */}
            <text x="130" y="118" textAnchor="middle" fill={isLight ? '#64748b' : '#64748b'} fontSize="9" fontWeight="600" letterSpacing="1.2">
              TOTAL ASET
            </text>
            <text x="130" y="136" textAnchor="middle" fill={isLight ? '#0f172a' : '#f1f5f9'} fontSize="13" fontWeight="800">
              {formatRupiah(totalWealth)}
            </text>
            {hoveredIndex !== null && (
              <text x="130" y="150" textAnchor="middle" fill={slices[hoveredIndex]?.color || '#94a3b8'} fontSize="9" fontWeight="700">
                {slices[hoveredIndex]?.label} • {slices[hoveredIndex]?.percentage}%
              </text>
            )}

            <defs>
              <radialGradient id="centerGradient" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor={isLight ? 'rgba(248,250,252,0.6)' : 'rgba(30,41,59,0.6)'} />
                <stop offset="100%" stopColor={isLight ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)'} />
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* Legend Grid */}
        <div className="grid grid-cols-2 gap-2.5 w-full">
          {slices.map((slice, i) => {
            const isActive = hoveredIndex === i;
            return (
              <div
                key={slice.label}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-300 cursor-pointer border ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-800/80 border-slate-300 dark:border-slate-600/50 shadow-lg'
                    : 'bg-slate-50/80 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700/50'
                }`}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Color indicator with glow */}
                <div className="relative shrink-0">
                  <div
                    className="w-3 h-3 rounded-full ring-2 ring-black/5 dark:ring-white/10"
                    style={{ backgroundColor: slice.color }}
                  />
                  {isActive && (
                    <div
                      className="absolute inset-0 rounded-full animate-ping"
                      style={{ backgroundColor: slice.color, opacity: 0.4 }}
                    />
                  )}
                </div>

                {/* Label + Value */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium truncate">{slice.label}</span>
                    <span
                      className="text-xs font-extrabold ml-2 tabular-nums"
                      style={{ color: isActive ? slice.color : (isLight ? '#1e293b' : '#e2e8f0') }}
                    >
                      {slice.percentage}%
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium tabular-nums mt-0.5">
                    {formatRupiah(slice.value)}
                  </div>
                  {/* Mini progress bar */}
                  <div className="w-full h-1 rounded-full bg-slate-200 dark:bg-slate-800 mt-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${slice.percentage}%`,
                        backgroundColor: slice.color,
                        boxShadow: isActive ? `0 0 8px ${slice.glowColor}` : 'none',
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
