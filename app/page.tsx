"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";

type Invoice = {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: string;
  client: { name: string };
  items: { quantity: number; price: number }[];
  payments: { amount: number }[];
};

export default function DashboardPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ month: string; invoiced: number; received: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/invoices").then((r) => r.json()),
      fetch(`/api/reports/monthly?year=${new Date().getFullYear()}`).then((r) => r.json()),
    ]).then(([inv, monthly]) => {
      setInvoices(inv);
      setMonthlyData(monthly);
      setLoading(false);
    });
  }, []);

  const totalInvoiced = invoices.reduce((s, i) => s + i.items.reduce((a, it) => a + it.quantity * it.price, 0), 0);
  const totalPaid = invoices.flatMap((i) => i.payments).reduce((s, p) => s + p.amount, 0);
  const pendingBalance = totalInvoiced - totalPaid;

  const getStatusClass = (status: string) => {
    const map: Record<string, string> = {
      paid: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
      partial: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
      sent: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
      draft: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
      overdue: "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400",
    };
    return map[status] || "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
  };

  const maxChart = Math.max(...monthlyData.map((m) => m.received), 1);

  return (
    <>
      <header className="h-20 border-b border-primary/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
        <div className="flex items-center gap-6">
          <h2 className="text-xl font-bold">Dashboard Overview</h2>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary w-64 text-sm" placeholder="Search transactions, clients..." type="text" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="size-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-primary hover:text-white transition-all">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <Link href="/invoices/new" className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-lg">add</span>
            New Invoice
          </Link>
        </div>
      </header>

      <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-primary/5 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <span className="material-symbols-outlined">account_balance_wallet</span>
                  </div>
                </div>
                <p className="text-slate-500 text-sm font-medium">Total Invoiced</p>
                <h3 className="text-2xl font-bold mt-1">{formatCurrency(totalInvoiced)}</h3>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-primary/5 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                    <span className="material-symbols-outlined">payments</span>
                  </div>
                </div>
                <p className="text-slate-500 text-sm font-medium">Received Payments</p>
                <h3 className="text-2xl font-bold mt-1">{formatCurrency(totalPaid)}</h3>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-primary/5 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                    <span className="material-symbols-outlined">pending_actions</span>
                  </div>
                </div>
                <p className="text-slate-500 text-sm font-medium">Pending Balance</p>
                <h3 className="text-2xl font-bold mt-1">{formatCurrency(pendingBalance)}</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-primary/5 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-lg font-bold">Monthly Income Trends</h3>
                    <p className="text-sm text-slate-500 font-medium">Last 6 Months performance overview</p>
                  </div>
                  <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs font-bold py-2 px-4 focus:ring-primary">
                    <option>Year {new Date().getFullYear()}</option>
                    <option>Year {new Date().getFullYear() - 1}</option>
                  </select>
                </div>
                <div className="h-64 relative flex items-end gap-2">
                  {monthlyData.slice(0, 6).map((m, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-primary/20 rounded-t flex flex-col justify-end" style={{ height: `${(m.received / maxChart) * 120}px`, minHeight: "4px" }} />
                      <span className="text-[11px] font-bold text-slate-400 uppercase">{m.month}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-primary/5 shadow-sm flex flex-col">
                <h3 className="text-lg font-bold mb-6">Quick Actions</h3>
                <div className="space-y-4 flex-1">
                  <Link href="/clients/new" className="w-full flex items-center gap-4 p-4 rounded-xl border border-primary/10 hover:border-primary/40 hover:bg-primary/5 transition-all group block">
                    <div className="size-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">person_add</span>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold group-hover:text-primary transition-colors">Add New Client</p>
                      <p className="text-[11px] text-slate-500 font-medium">Expand your business reach</p>
                    </div>
                  </Link>
                  <a href={`/api/reports/csv?year=${new Date().getFullYear()}`} className="w-full flex items-center gap-4 p-4 rounded-xl border border-primary/10 hover:border-primary/40 hover:bg-primary/5 transition-all group block">
                    <div className="size-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500">
                      <span className="material-symbols-outlined">download</span>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold group-hover:text-primary transition-colors">Export Report</p>
                      <p className="text-[11px] text-slate-500 font-medium">Download CSV/PDF records</p>
                    </div>
                  </a>
                  <Link href="/invoices/new" className="w-full flex items-center gap-4 p-4 rounded-xl border border-primary/10 hover:border-primary/40 hover:bg-primary/5 transition-all group block">
                    <div className="size-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500">
                      <span className="material-symbols-outlined">mail</span>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold group-hover:text-primary transition-colors">Create Invoice</p>
                      <p className="text-[11px] text-slate-500 font-medium">New invoice for client</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-primary/5 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-primary/5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">Recent Invoice Activities</h3>
                  <p className="text-sm text-slate-500 font-medium">Overview of your latest transactions</p>
                </div>
                <Link href="/invoices" className="text-primary text-sm font-bold hover:underline">View All</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-8 py-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Client</th>
                      <th className="px-8 py-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Date</th>
                      <th className="px-8 py-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Amount</th>
                      <th className="px-8 py-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/5">
                    {invoices.slice(0, 5).map((inv) => {
                      const amount = inv.items.reduce((s, i) => s + i.quantity * i.price, 0);
                      return (
                        <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">{getInitials(inv.client.name)}</div>
                              <div>
                                <p className="text-sm font-bold">{inv.client.name}</p>
                                <p className="text-[11px] text-slate-500 font-medium">#{inv.invoiceNumber}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-sm font-medium">{formatDate(inv.issueDate)}</td>
                          <td className="px-8 py-5 text-sm font-bold">{formatCurrency(amount)}</td>
                          <td className="px-8 py-5">
                            <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase ${getStatusClass(inv.status)}`}>{inv.status}</span>
                          </td>
                          <td className="px-8 py-5">
                            <Link href={`/invoices/${inv.id}`} className="text-slate-400 hover:text-primary">
                              <span className="material-symbols-outlined">more_horiz</span>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                    {invoices.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-8 py-12 text-center text-slate-500">No invoices yet. Create your first invoice!</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
