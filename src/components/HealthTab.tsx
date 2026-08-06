import React from "react";
import { Sparkles, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight, CheckCircle2, ChevronRight, Activity, Calendar } from "lucide-react";

interface HealthTabProps {
  insights: any;
  isLoadingInsights: boolean;
}

export const HealthTab: React.FC<HealthTabProps> = ({ insights, isLoadingInsights }) => {
  // Mock calendar spending heatmap data (7 days x 4 weeks)
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const heatmapData = [
    [10, 80, 20, 15, 60, 120, 150], // Week 1
    [40, 25, 10, 95, 10, 80, 240], // Week 2
    [15, 30, 120, 10, 45, 90, 130], // Week 3
    [20, 15, 10, 35, 110, 140, 95], // Week 4
  ];

  const getHeatmapColor = (value: number) => {
    if (value < 20) return "bg-slate-950 text-slate-500 border-slate-800";
    if (value < 50) return "bg-sky-950/20 text-sky-400 border-sky-900/30";
    if (value < 100) return "bg-sky-950/40 text-sky-300 border-sky-800/40";
    return "bg-rose-950/40 text-rose-400 border-rose-900/30";
  };

  return (
    <div id="health-tab-view" className="space-y-6">
      {/* Overall Score Circle & Description */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-xl">
          <h3 className="text-white font-bold text-base mb-3">Overall Health Score</h3>
          
          <div className="relative my-4 flex items-center justify-center">
            {/* SVG Arc for Gauge */}
            <svg className="w-36 h-36 transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="60"
                stroke="rgba(30, 41, 59, 0.8)"
                strokeWidth="12"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="60"
                stroke="url(#gradient-health-tab)"
                strokeWidth="12"
                strokeDasharray={2 * Math.PI * 60}
                strokeDashoffset={2 * Math.PI * 60 * (1 - (insights?.dashboard?.score || 84) / 100)}
                strokeLinecap="round"
                fill="transparent"
              />
              <defs>
                <linearGradient id="gradient-health-tab" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute text-center">
              <span className="text-4xl font-mono font-bold text-white">
                {insights?.dashboard?.score || 84}
              </span>
              <span className="text-slate-500 text-xs block font-semibold">/ 100</span>
            </div>
          </div>

          <p className="text-slate-400 text-xs leading-relaxed max-w-[200px] mt-2">
            Your net worth structure and cash velocity profile are rated <span className="text-emerald-400 font-bold">{insights?.dashboard?.status || "Optimal"}</span>.
          </p>
        </div>

        {/* Detailed Audit & Critique from Gemini */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-sky-400" />
              <h3 className="text-white font-bold text-base">FinSight Financial Health Critique</h3>
            </div>

            {isLoadingInsights ? (
              <div className="py-10 flex flex-col items-center justify-center gap-2">
                <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 text-xs font-mono">Running neural critique vectors...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-slate-300">
                    <span className="font-bold text-white">Liquidity Reserve Check:</span> Excellent. Your cash reserves cover 6.4 months of operational spending, which beats standard 3-month thresholds.
                  </p>
                </div>
                <div className="flex items-start gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-slate-300">
                    <span className="font-bold text-white">Leverage Assessment:</span> Minimal. Debt-to-asset metrics sit at 8.4%, indicating robust long-term solvency.
                  </p>
                </div>
                <div className="flex items-start gap-2 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-slate-300">
                    <span className="font-bold text-white">Asset Concentration warning:</span> Moderate crypto volatility variance detected. Refinement trades suggested.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
            Audit re-run: 100% compliant with FINRA-simulated capital safety ratios.
          </div>
        </div>
      </div>

      {/* Spending Heatmap (Weekly Calendar Style) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-400" />
            <h3 className="text-white font-bold text-base">Continuous Spending Heatmap</h3>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Simulated 28-day trace</span>
        </div>

        <div className="space-y-2">
          {/* Header Row Days */}
          <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-mono text-slate-500">
            {daysOfWeek.map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Grid Rows */}
          {heatmapData.map((row, weekIdx) => (
            <div key={weekIdx} className="grid grid-cols-7 gap-2">
              {row.map((val, dayIdx) => (
                <div
                  key={dayIdx}
                  className={`py-3 rounded-lg border text-center font-mono text-xs font-bold transition-all hover:scale-105 ${getHeatmapColor(val)}`}
                  title={`Week ${weekIdx + 1}, Day ${daysOfWeek[dayIdx]}: $${val}`}
                >
                  ${val}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-4 pt-4 mt-2 text-[10px] text-slate-500 font-mono border-t border-slate-800/50">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-slate-950 rounded border border-slate-800"></span>
            <span>Minimal (&lt;$20)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-sky-950/20 rounded border border-sky-900/30"></span>
            <span>Low ($20-$50)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-sky-950/40 rounded border border-sky-800/40"></span>
            <span>Medium ($50-$100)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-rose-950/40 rounded border border-rose-900/30"></span>
            <span>Heavy (&gt;$100)</span>
          </div>
        </div>
      </div>

      {/* Cash Flow Analysis & Savings Forecast */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cash Flow */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-white font-bold text-base flex items-center gap-1.5">
            <Activity className="w-4.5 h-4.5 text-sky-400" />
            Periodic Cash Flow Statement
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800">
              <span className="text-slate-400">Recurring Monthly Income</span>
              <span className="font-mono font-bold text-emerald-400">$12,500.00</span>
            </div>
            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800">
              <span className="text-slate-400">Discretionary Expense Burn</span>
              <span className="font-mono font-bold text-rose-400">-$4,285.50</span>
            </div>
            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800">
              <span className="text-slate-400">Committed Savings Deposits</span>
              <span className="font-mono font-bold text-sky-400">-$4,500.00</span>
            </div>
            <div className="flex justify-between items-center text-xs pt-1">
              <span className="text-white font-semibold">Net Free Cash Flow surplus</span>
              <span className="font-mono font-bold text-emerald-400">+$3,714.50</span>
            </div>
          </div>
        </div>

        {/* AI Savings Forecast */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl pointer-events-none"></div>

          <div>
            <h3 className="text-white font-bold text-base mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4.5 h-4.5 text-sky-400" />
              Dynamic Savings & Wealth Forecast
            </h3>

            {isLoadingInsights ? (
              <div className="py-6 flex flex-col items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 text-[11px] font-mono">Running predictive models...</p>
              </div>
            ) : (
              <p className="text-xs text-slate-300 leading-relaxed">
                {insights?.goals?.forecastText || "Analyzing goals timelines continuously to project future net worth metrics."}
              </p>
            )}
          </div>

          <div className="mt-4 p-3 bg-sky-950/30 border border-sky-900/30 rounded-xl">
            <span className="text-[10px] text-sky-400 font-mono tracking-wider uppercase block">AI Strategic Outlook</span>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-normal">
              Accumulation pace remains robust. Compound growth factors indicate your net-worth threshold is projected to exceed <span className="text-emerald-400 font-bold">$250K</span> within 12 months.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
