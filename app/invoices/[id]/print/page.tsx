"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";

type Invoice = {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  client: { name: string; email?: string; address?: string; city?: string; province?: string };
  items: { description: string; quantity: number; unit: string; price: number }[];
};

type Settings = {
  name: string;
  address?: string;
  npwp?: string;
  logoUrl?: string;
  bankAccounts: { bankName: string; accountName: string; accountNumber: string }[];
};

export default function PrintInvoicePage() {
  const params = useParams();
  const id = params.id as string;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/invoices/${id}`).then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
    ]).then(([inv, set]) => {
      setInvoice(inv);
      setSettings(set);
    });
  }, [id]);

  useEffect(() => {
    if (invoice && settings) {
      window.print();
    }
  }, [invoice, settings]);

  if (!invoice || !settings) return <div className="p-8">Loading...</div>;

  const subtotal = invoice.items.reduce((s, i) => s + i.quantity * i.price, 0);
  const bank = settings.bankAccounts?.[0];

  return (
    <div className="bg-white text-slate-900 p-12 max-w-[210mm] mx-auto print:p-12 print:max-w-none">
      <div className="flex justify-between items-start mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="size-12 object-contain" />
            ) : (
              <div className="size-12 bg-slate-900 text-white flex items-center justify-center rounded-lg">
                <span className="material-symbols-outlined">receipt_long</span>
              </div>
            )}
            <span className="text-2xl font-black">INVOI</span>
          </div>
          <div className="text-sm text-slate-600">
            <p className="font-bold text-slate-900">{settings.name}</p>
            {settings.address && <p>{settings.address}</p>}
            {settings.npwp && <p>NPWP: {settings.npwp}</p>}
          </div>
        </div>
        <div className="text-right">
          <h1 className="text-4xl font-black text-primary tracking-tighter mb-2">INVOICE</h1>
          <p className="text-sm font-bold text-slate-500">NO. {invoice.invoiceNumber}</p>
          <p className="text-sm text-slate-500">Date: {formatDate(invoice.issueDate)}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-12 mb-12">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-200 pb-1">Billed To</p>
          <p className="font-bold text-slate-900">{invoice.client.name}</p>
          <p className="text-sm text-slate-600">
            {[invoice.client.address, invoice.client.city && invoice.client.province ? `${invoice.client.city}, ${invoice.client.province}` : invoice.client.city || invoice.client.province, invoice.client.email].filter(Boolean).join("\n")}
          </p>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-200 pb-1">Payment Info</p>
          <p className="text-sm text-slate-600">Due Date: <span className="font-bold text-slate-900">{formatDate(invoice.dueDate)}</span></p>
          {bank && (
            <>
              <p className="text-sm text-slate-600">Bank: {bank.bankName}</p>
              <p className="text-sm text-slate-600">Account: {bank.accountNumber}</p>
            </>
          )}
        </div>
      </div>
      <table className="w-full mb-12">
        <thead>
          <tr className="border-b-2 border-slate-900">
            <th className="text-left py-4 text-xs font-black uppercase tracking-widest">Description</th>
            <th className="text-center py-4 text-xs font-black uppercase tracking-widest">Qty</th>
            <th className="text-right py-4 text-xs font-black uppercase tracking-widest">Price</th>
            <th className="text-right py-4 text-xs font-black uppercase tracking-widest">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, i) => (
            <tr key={i} className="border-b border-slate-200">
              <td className="py-4 text-sm font-medium">{item.description}</td>
              <td className="py-4 text-sm text-center">{item.quantity} {item.unit}</td>
              <td className="py-4 text-sm text-right">{formatCurrency(item.price)}</td>
              <td className="py-4 text-sm font-bold text-right">{formatCurrency(item.quantity * item.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-t-2 border-slate-200 pt-8 flex justify-end">
        <div className="w-1/3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Subtotal</span>
            <span className="font-bold">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-xl border-t border-slate-900 pt-2">
            <span className="font-black">Total</span>
            <span className="font-black text-primary">{formatCurrency(subtotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
