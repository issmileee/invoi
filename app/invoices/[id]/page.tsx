"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";

type Invoice = {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: string;
  notes: string | null;
  client: { id: string; name: string; email: string | null; phone: string | null; address: string | null; city: string | null; province: string | null };
  items: { description: string; quantity: number; unit: string; price: number }[];
  payments: { id: string; amount: number; paymentDate: string; method: string | null; reference: string | null; notes: string | null }[];
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/invoices/${id}`)
      .then((r) => r.json())
      .then(setInvoice);
  }, [id]);

  const subtotal = invoice?.items.reduce((s, i) => s + i.quantity * i.price, 0) ?? 0;
  const totalPaid = invoice?.payments.reduce((s, p) => s + p.amount, 0) ?? 0;
  const balance = subtotal - totalPaid;

  const getStatusClass = (status: string) => {
    const map: Record<string, string> = {
      paid: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
      partial: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
      sent: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
      draft: "bg-slate-100 dark:bg-slate-800 text-slate-600",
      overdue: "bg-rose-100 dark:bg-rose-900/30 text-rose-600",
    };
    return map[status] || "bg-slate-100 text-slate-600";
  };

  const recordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) return;
    setSubmitting(true);
    try {
      await fetch(`/api/invoices/${id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, paymentDate, method: "bank_transfer" }),
      });
      const res = await fetch(`/api/invoices/${id}`);
      const data = await res.json();
      setInvoice(data);
      setShowPaymentModal(false);
      setPaymentAmount("");
    } finally {
      setSubmitting(false);
    }
  };

  if (!invoice) return <div className="p-8">Loading...</div>;

  return (
    <div className="overflow-y-auto bg-background-light dark:bg-background-dark">
      <div className="px-8 pt-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <Link href="/" className="hover:text-primary">Dashboard</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <Link href="/invoices" className="hover:text-primary">Invoices</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-slate-900 dark:text-slate-100 font-medium">{invoice.invoiceNumber}</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-black tracking-tight mb-1">Invoice {invoice.invoiceNumber}</h2>
            <p className="text-slate-500 dark:text-slate-400">Created on {formatDate(invoice.issueDate)}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/invoices/${id}/edit`} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors">
              <span className="material-symbols-outlined text-lg">edit</span>
              Edit
            </Link>
            <a href={`/invoices/${id}/print`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors">
              <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
              Export PDF
            </a>
            {invoice.status !== "paid" && (
              <button onClick={() => setShowPaymentModal(true)} className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:brightness-110 transition-all">
                <span className="material-symbols-outlined text-lg">payments</span>
                Record Payment
              </button>
            )}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              {["draft", "sent", "partial", "paid"].map((s) => (
                <span key={s} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase ${invoice.status === s ? "bg-primary/20 text-primary border border-primary/30" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                  {s}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-4 border-l border-slate-200 dark:border-slate-800 pl-6">
              <div className="text-right">
                <p className="text-xs text-slate-500 uppercase font-bold">Remaining Balance</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">{formatCurrency(balance)}</p>
              </div>
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-lg">Invoice Items</h3>
                <span className="text-sm text-slate-500 font-medium">{invoice.items.length} Items</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">Description</th>
                      <th className="px-6 py-4">Qty</th>
                      <th className="px-6 py-4 text-right">Price</th>
                      <th className="px-6 py-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {invoice.items.map((item, i) => (
                      <tr key={i} className="text-sm">
                        <td className="px-6 py-4 font-medium">{item.description}</td>
                        <td className="px-6 py-4">{item.quantity} {item.unit}</td>
                        <td className="px-6 py-4 text-right">{formatCurrency(item.price)}</td>
                        <td className="px-6 py-4 text-right">{formatCurrency(item.quantity * item.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 dark:bg-slate-800/30">
                    <tr>
                      <td className="px-6 py-3 text-sm text-slate-500 text-right font-medium" colSpan={3}>Subtotal</td>
                      <td className="px-6 py-3 text-sm text-right font-bold">{formatCurrency(subtotal)}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-sm text-slate-500 text-right font-medium" colSpan={3}>Total Paid</td>
                      <td className="px-6 py-3 text-sm text-right font-bold text-emerald-600">-{formatCurrency(totalPaid)}</td>
                    </tr>
                    <tr className="border-t border-slate-200 dark:border-slate-700">
                      <td className="px-6 py-4 text-base font-black text-right" colSpan={3}>Remaining Balance</td>
                      <td className="px-6 py-4 text-base font-black text-right text-primary">{formatCurrency(balance)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-lg">Payment History</h3>
              </div>
              <div className="p-6">
                <div className="space-y-8">
                  {invoice.payments.length > 0 ? (
                    invoice.payments.map((p) => (
                      <div key={p.id} className="flex items-start gap-6">
                        <div className="size-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-lg">done_all</span>
                        </div>
                        <div className="flex-1 flex justify-between items-start">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">Payment Received</p>
                            <p className="text-sm text-slate-500">{p.method || "Bank Transfer"}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-slate-900 dark:text-white">{formatCurrency(p.amount)}</p>
                            <p className="text-xs text-slate-500">{formatDate(p.paymentDate)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-sm">No payments recorded yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="font-bold text-slate-500 uppercase text-xs tracking-widest mb-4">Client Information</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">{getInitials(invoice.client.name)}</div>
                <div>
                  <p className="font-black">{invoice.client.name}</p>
                </div>
              </div>
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                {invoice.client.email && (
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <span className="material-symbols-outlined text-base">mail</span>
                    {invoice.client.email}
                  </div>
                )}
                {invoice.client.phone && (
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <span className="material-symbols-outlined text-base">call</span>
                    {invoice.client.phone}
                  </div>
                )}
                {invoice.client.address && (
                  <div className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <span className="material-symbols-outlined text-base">location_on</span>
                    <span>{invoice.client.address}{invoice.client.city && `, ${invoice.client.city}`}</span>
                  </div>
                )}
              </div>
              <Link href={`/clients/${invoice.client.id}/edit`} className="block w-full mt-6 py-2 rounded-lg text-primary bg-primary/5 font-bold text-sm hover:bg-primary/10 transition-colors text-center">
                View Full Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowPaymentModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-8 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-6">Record Payment</h3>
            <form onSubmit={recordPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Amount</label>
                <input type="number" required className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Date</label>
                <input type="date" className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="flex-1 py-2 rounded-lg border border-slate-200 font-bold">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2 rounded-lg bg-primary text-white font-bold disabled:opacity-50">
                  {submitting ? "Saving..." : "Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
