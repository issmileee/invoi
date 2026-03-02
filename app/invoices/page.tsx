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

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = statusFilter ? `/api/invoices?status=${statusFilter}` : "/api/invoices";
    fetch(url)
      .then((r) => r.json())
      .then(setInvoices)
      .finally(() => setLoading(false));
  }, [statusFilter]);

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

  const deleteInvoice = async (id: string) => {
    if (!confirm("Delete this invoice?")) return;
    await fetch(`/api/invoices/${id}`, { method: "DELETE" });
    setInvoices((c) => c.filter((x) => x.id !== id));
  };

  return (
    <>
      <header className="h-20 border-b border-primary/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
        <div className="flex items-center gap-6">
          <h2 className="text-xl font-bold">Invoices</h2>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary w-64 text-sm" placeholder="Search invoices..." type="text" />
          </div>
        </div>
        <Link href="/invoices/new" className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined text-lg">add</span>
          New Invoice
        </Link>
      </header>
      <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="flex gap-2">
          <button onClick={() => setStatusFilter("")} className={`px-3 py-1.5 rounded-lg text-sm font-bold ${!statusFilter ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600"}`}>All</button>
          <button onClick={() => setStatusFilter("draft")} className={`px-3 py-1.5 rounded-lg text-sm font-bold ${statusFilter === "draft" ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600"}`}>Draft</button>
          <button onClick={() => setStatusFilter("sent")} className={`px-3 py-1.5 rounded-lg text-sm font-bold ${statusFilter === "sent" ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600"}`}>Sent</button>
          <button onClick={() => setStatusFilter("partial")} className={`px-3 py-1.5 rounded-lg text-sm font-bold ${statusFilter === "partial" ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600"}`}>Partial</button>
          <button onClick={() => setStatusFilter("paid")} className={`px-3 py-1.5 rounded-lg text-sm font-bold ${statusFilter === "paid" ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600"}`}>Paid</button>
          <button onClick={() => setStatusFilter("overdue")} className={`px-3 py-1.5 rounded-lg text-sm font-bold ${statusFilter === "overdue" ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600"}`}>Overdue</button>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-primary/5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-8 py-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Client</th>
                  <th className="px-8 py-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Invoice #</th>
                  <th className="px-8 py-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-8 py-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="px-8 py-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {loading ? (
                  <tr><td colSpan={6} className="px-8 py-12 text-center text-slate-500">Loading...</td></tr>
                ) : (
                  invoices.map((inv) => {
                    const amount = inv.items.reduce((s, i) => s + i.quantity * i.price, 0);
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">{getInitials(inv.client.name)}</div>
                            <p className="text-sm font-bold">{inv.client.name}</p>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-sm font-medium">#{inv.invoiceNumber}</td>
                        <td className="px-8 py-5 text-sm font-medium">{formatDate(inv.issueDate)}</td>
                        <td className="px-8 py-5 text-sm font-bold">{formatCurrency(amount)}</td>
                        <td className="px-8 py-5">
                          <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase ${getStatusClass(inv.status)}`}>{inv.status}</span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <Link href={`/invoices/${inv.id}`} className="p-2 text-slate-400 hover:text-primary transition-colors">
                              <span className="material-symbols-outlined">visibility</span>
                            </Link>
                            <Link href={`/invoices/${inv.id}/edit`} className="p-2 text-slate-400 hover:text-primary transition-colors">
                              <span className="material-symbols-outlined">edit</span>
                            </Link>
                            <button type="button" onClick={() => deleteInvoice(inv.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
                {!loading && invoices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-slate-500">No invoices yet. <Link href="/invoices/new" className="text-primary font-bold hover:underline">Create your first invoice</Link></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
