"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";

type MonthlyData = { month: string; year: number; invoiced: number; received: number };

export default function ReportsPage() {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/reports/monthly?year=${year}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [year]);

  const totalInvoiced = data.reduce((s, m) => s + m.invoiced, 0);
  const totalReceived = data.reduce((s, m) => s + m.received, 0);
  const maxVal = Math.max(...data.map((m) => m.received), 1);

  return (
    <>
      <header className="h-20 border-b border-primary/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
        <h2 className="text-xl font-bold">Reports</h2>
        <div className="flex items-center gap-4">
          <select className="bg-slate-100 dark:bg-slate-800 rounded-lg px-4 py-2 text-sm font-bold" value={year} onChange={(e) => setYear(parseInt(e.target.value, 10))}>
            <option value={year}>{year}</option>
            <option value={year - 1}>{year - 1}</option>
          </select>
          <a href={`/api/reports/csv?year=${year}`} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90">
            <span className="material-symbols-outlined text-lg">download</span>
            Export CSV
          </a>
        </div>
      </header>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-primary/5 shadow-sm">
            <p className="text-slate-500 text-sm font-medium">Total Invoiced ({year})</p>
            <h3 className="text-2xl font-bold mt-1">{formatCurrency(totalInvoiced)}</h3>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-primary/5 shadow-sm">
            <p className="text-slate-500 text-sm font-medium">Total Received ({year})</p>
            <h3 className="text-2xl font-bold mt-1">{formatCurrency(totalReceived)}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-primary/5 shadow-sm">
          <h3 className="text-lg font-bold mb-8">Monthly Income Trends</h3>
          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading...</div>
          ) : (
            <div className="h-64 flex items-end gap-2">
              {data.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-primary/30 rounded-t transition-all" style={{ height: `${(m.received / maxVal) * 150}px`, minHeight: "4px" }} />
                  <span className="text-[11px] font-bold text-slate-400 uppercase">{m.month}</span>
                  <span className="text-[10px] text-slate-500 font-medium">{formatCurrency(m.received)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
