import React from "react";
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, FileText, MapPin, Tag, CheckCircle2, AlertTriangle, AlertCircle, RefreshCw } from "lucide-react";
import { Expense } from "../types";

interface ExpenseCalendarTimelineProps {
  expenses: Expense[];
  onSelectExpense: (expense: Expense) => void;
}

export const ExpenseCalendarTimeline: React.FC<ExpenseCalendarTimelineProps> = ({ expenses, onSelectExpense }) => {
  const [currentDate, setCurrentDate] = React.useState(new Date(2026, 6, 20)); // July 2026 as per simulation data
  const [selectedDay, setSelectedDay] = React.useState<number | null>(null);

  // Calendar helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  // Get days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Get first day of week
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Group expenses by date (YYYY-MM-DD)
  const expensesByDate = React.useMemo(() => {
    return expenses.reduce((acc, e) => {
      acc[e.date] = acc[e.date] || [];
      acc[e.date].push(e);
      return acc;
    }, {} as Record<string, Expense[]>);
  }, [expenses]);

  // Generate calendar cells
  const cells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    cells.push({ day: null, dateStr: "" });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ day, dateStr });
  }

  // Selected day expenses
  const selectedDateStr = selectedDay
    ? `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
    : "";
  const selectedDayExpenses = selectedDay ? expensesByDate[selectedDateStr] || [] : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* 1. Expense Calendar Matrix (7 cols) */}
      <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-white font-bold text-base flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-sky-400" />
                Expense Calendar
              </h3>
              <p className="text-slate-400 text-xs">A visual map of cash outflow density by day of the month.</p>
            </div>
            
            {/* Month Nav */}
            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-850">
              <button
                onClick={handlePrevMonth}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-bold text-white px-2">
                {monthNames[month]} {year}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid Header */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] text-slate-500 uppercase font-black tracking-wider border-b border-slate-800/60 pb-2 mb-2">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {cells.map((cell, idx) => {
              if (cell.day === null) {
                return <div key={`empty-${idx}`} className="h-14 bg-slate-950/20 rounded-lg"></div>;
              }

              const dayExpenses = expensesByDate[cell.dateStr] || [];
              const dayTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
              const isSelected = selectedDay === cell.day;

              // Color indicators based on spending volume
              let bubbleStyle = "bg-slate-800/40 text-slate-500 border border-slate-850/40";
              if (dayTotal > 0 && dayTotal <= 50) {
                bubbleStyle = "bg-emerald-950/20 text-emerald-400 border border-emerald-500/20";
              } else if (dayTotal > 50 && dayTotal <= 300) {
                bubbleStyle = "bg-sky-950/30 text-sky-400 border border-sky-500/30";
              } else if (dayTotal > 300) {
                bubbleStyle = "bg-rose-950/30 text-rose-400 border border-rose-500/30";
              }

              return (
                <button
                  key={`day-${cell.day}`}
                  onClick={() => setSelectedDay(cell.day)}
                  className={`h-14 rounded-xl p-1.5 flex flex-col justify-between text-left transition-all cursor-pointer ${bubbleStyle} ${
                    isSelected ? "ring-2 ring-sky-500 ring-offset-2 ring-offset-slate-900 border-sky-500" : "hover:scale-[1.03]"
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold">{cell.day}</span>
                  {dayTotal > 0 && (
                    <span className="text-[9px] font-mono font-bold truncate block self-end">
                      ${Math.round(dayTotal).toLocaleString()}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Expanded Detail Panel */}
        {selectedDay && (
          <div className="mt-6 p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
              <p className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Outflows on July {selectedDay}, 2026
              </p>
              <span className="px-2 py-0.5 bg-slate-900 text-slate-400 text-[10px] font-mono rounded">
                {selectedDayExpenses.length} Records
              </span>
            </div>

            {selectedDayExpenses.length === 0 ? (
              <p className="text-[11px] text-slate-500 font-mono py-2">No outflows logged on this date.</p>
            ) : (
              <div className="space-y-2">
                {selectedDayExpenses.map((exp) => (
                  <div
                    key={exp.id}
                    onClick={() => onSelectExpense(exp)}
                    className="flex justify-between items-center p-2 hover:bg-slate-900 rounded-lg cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-white">{exp.merchant}</p>
                      <span className="text-[9px] font-mono text-slate-500">{exp.category} • {exp.paymentMethod || "Corporate Cash"}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono font-bold text-white">${exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* 2. Chronological Timeline View (5 cols) */}
      <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800/60 pb-3">
          <div>
            <h3 className="text-white font-bold text-base flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-purple-400" />
              Chronological Timeline
            </h3>
            <p className="text-slate-400 text-xs">A structural logging flow of expenditures, audits, and uploads.</p>
          </div>
        </div>

        {/* Timeline Core Scrollable View */}
        <div className="flex-1 overflow-y-auto pr-1 max-h-[460px] space-y-4 relative pl-4 border-l border-slate-800">
          {expenses.map((exp, idx) => {
            const isWorkflowPending = exp.approvalStatus === "Pending" || exp.approvalStatus === "Submitted";
            const isFlagged = exp.status === "Flagged";

            return (
              <div key={exp.id} className="relative group cursor-pointer" onClick={() => onSelectExpense(exp)}>
                
                {/* Timeline Dot Connector */}
                <span className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-slate-900 ${
                  isFlagged ? "bg-rose-500" : isWorkflowPending ? "bg-amber-500 animate-pulse" : "bg-sky-500"
                }`}></span>

                <div className="p-3 bg-slate-950/60 hover:bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-xl transition-all space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="text-[10px] text-slate-500 font-mono">{exp.date}</p>
                      <h4 className="text-xs font-black text-white group-hover:text-sky-400 transition-colors mt-0.5">{exp.merchant}</h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-white">
                      ${exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {exp.notes && (
                    <p className="text-[10px] text-slate-400 italic line-clamp-1">"{exp.notes}"</p>
                  )}

                  {/* Badges Flow */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-1.5 py-0.5 bg-slate-900 text-slate-400 text-[8px] font-mono rounded font-semibold uppercase tracking-wider border border-slate-800">
                      {exp.category}
                    </span>

                    {exp.tags && exp.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="px-1.5 py-0.5 bg-purple-950/20 text-purple-400 text-[8px] font-mono rounded flex items-center gap-0.5">
                        <Tag className="w-2 h-2" />
                        #{tag}
                      </span>
                    ))}

                    {/* Geolocation marker if exists */}
                    {exp.location && (
                      <span className="px-1.5 py-0.5 bg-sky-950/10 text-sky-400 text-[8px] font-mono rounded flex items-center gap-0.5 truncate max-w-[120px]">
                        <MapPin className="w-2 h-2" />
                        {exp.location}
                      </span>
                    )}
                  </div>

                  {/* Simulated Receipt Attachment Thumbnail Indicator */}
                  <div className="flex items-center justify-between border-t border-slate-900/80 pt-2 text-[9px] font-mono text-slate-500">
                    <span className="flex items-center gap-1 text-sky-500">
                      <FileText className="w-3 h-3" />
                      receipt_img.png
                    </span>
                    <span className={`px-1.5 py-0.2 rounded font-bold uppercase ${
                      exp.approvalStatus === "Cleared"
                        ? "text-emerald-400 bg-emerald-950/20"
                        : exp.approvalStatus === "Approved"
                        ? "text-sky-400 bg-sky-950/20"
                        : "text-amber-500 bg-amber-950/10"
                    }`}>
                      {exp.approvalStatus || "Cleared"}
                    </span>
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
