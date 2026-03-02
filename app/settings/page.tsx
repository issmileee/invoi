"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type BankAccount = {
  id?: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  isDefault: boolean;
};

type Settings = {
  id: string;
  name: string;
  address: string | null;
  npwp: string | null;
  logoUrl: string | null;
  ppnRate: number;
  ppnEnabled: boolean;
  pphRate: number;
  pphEnabled: boolean;
  notes: string | null;
  terms: string | null;
  bankAccounts: BankAccount[];
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [form, setForm] = useState<Partial<Settings>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        setForm({
          name: data.name,
          address: data.address || "",
          npwp: data.npwp || "",
          ppnRate: data.ppnRate,
          ppnEnabled: data.ppnEnabled,
          pphRate: data.pphRate,
          pphEnabled: data.pphEnabled,
          notes: data.notes || "",
          terms: data.terms || "",
          bankAccounts: data.bankAccounts?.length ? data.bankAccounts.map((b: BankAccount & { id: string }) => ({ bankName: b.bankName, accountName: b.accountName, accountNumber: b.accountNumber, isDefault: b.isDefault })) : [{ bankName: "", accountName: "", accountNumber: "", isDefault: true }],
        });
      });
  }, []);

  const updateBank = (i: number, field: keyof BankAccount, value: string | boolean) => {
    const accounts = [...(form.bankAccounts || [])];
    if (!accounts[i]) accounts[i] = { bankName: "", accountName: "", accountNumber: "", isDefault: false };
    (accounts[i] as Record<string, unknown>)[field] = value;
    if (field === "isDefault" && value) {
      accounts.forEach((a, j) => { if (j !== i) a.isDefault = false; });
    }
    setForm({ ...form, bankAccounts: accounts });
  };

  const addBank = () => {
    setForm({ ...form, bankAccounts: [...(form.bankAccounts || []), { bankName: "", accountName: "", accountNumber: "", isDefault: (form.bankAccounts?.length || 0) === 0 }] });
  };

  const removeBank = (i: number) => {
    const accounts = form.bankAccounts?.filter((_, j) => j !== i) || [];
    if (accounts.length === 0) accounts.push({ bankName: "", accountName: "", accountNumber: "", isDefault: true });
    setForm({ ...form, bankAccounts: accounts });
  };

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await fetch("/api/settings").then((r) => r.json());
      setSettings(data);
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <div className="p-8">Loading...</div>;

  return (
    <>
      <header className="h-20 border-b border-primary/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
        <h2 className="text-xl font-bold">Settings</h2>
        <Link href="/invoices/new" className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm">New Invoice</Link>
      </header>
      <div className="flex flex-1 px-10 py-8 gap-8 max-w-[1440px] mx-auto w-full">
        <aside className="w-64 flex flex-col gap-2 shrink-0">
          <div className="flex flex-col gap-1 mb-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Workspace</h3>
            <a href="#profile" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-semibold">
              <span className="material-symbols-outlined">business</span>
              <span className="text-sm">Business Profile</span>
            </a>
            <a href="#bank" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <span className="material-symbols-outlined">account_balance</span>
              <span className="text-sm">Bank Accounts</span>
            </a>
            <a href="#tax" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <span className="material-symbols-outlined">percent</span>
              <span className="text-sm">Tax Settings</span>
            </a>
          </div>
        </aside>
        <main className="flex-1 flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">Business Profile & Settings</h1>
            <p className="text-slate-500 dark:text-slate-400">Update your company information, banking details, and tax preferences for professional invoicing.</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <section id="profile" className="p-8 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">id_card</span>
                Company Identity
              </h2>
              <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
                <div className="relative group">
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-xl h-32 w-32 flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-700">
                    {form.logoUrl ? <img src={form.logoUrl} alt="Logo" className="w-full h-full object-contain" /> : <span className="material-symbols-outlined text-slate-400 text-4xl">add_photo_alternate</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">Company Logo</p>
                  <p className="text-slate-500 text-sm max-w-xs">This will appear on all your generated invoices. Recommended size: 400x400px.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Legal Business Name</label>
                  <input className="w-full mt-1 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 px-4 py-2 focus:ring-2 focus:ring-primary/20" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tax ID / NPWP</label>
                  <input className="w-full mt-1 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 px-4 py-2" placeholder="00.000.000.0-000.000" value={form.npwp || ""} onChange={(e) => setForm({ ...form, npwp: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Business Address</label>
                  <textarea className="w-full mt-1 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 px-4 py-2" rows={3} placeholder="Street, City, Province, Postal Code" value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
              </div>
            </section>
            <section id="bank" className="p-8 border-b border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">account_balance</span>
                  Bank Accounts
                </h2>
                <button type="button" onClick={addBank} className="flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                  <span className="material-symbols-outlined text-sm">add_circle</span>
                  Add Account
                </button>
              </div>
              <div className="space-y-4">
                {(form.bankAccounts || []).map((acc, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="size-12 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center border border-slate-200 dark:border-slate-600">
                        <span className="material-symbols-outlined text-slate-400">account_balance_wallet</span>
                      </div>
                      <div className="flex-1 grid grid-cols-3 gap-4">
                        <input className="rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800" placeholder="Bank Name" value={acc.bankName} onChange={(e) => updateBank(i, "bankName", e.target.value)} />
                        <input className="rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800" placeholder="Account Name" value={acc.accountName} onChange={(e) => updateBank(i, "accountName", e.target.value)} />
                        <input className="rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800" placeholder="Account Number" value={acc.accountNumber} onChange={(e) => updateBank(i, "accountNumber", e.target.value)} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={acc.isDefault} onChange={(e) => updateBank(i, "isDefault", e.target.checked)} />
                        Default
                      </label>
                      <button type="button" onClick={() => removeBank(i)} className="p-2 text-slate-400 hover:text-red-500">
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <section id="tax" className="p-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">receipt</span>
                Tax Configuration
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-4 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100">PPN (VAT)</span>
                      <p className="text-xs text-slate-500">Standard Value Added Tax</p>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                      <input className="w-12 bg-transparent border-none p-0 text-right focus:ring-0 font-bold" type="number" value={form.ppnRate ?? 11} onChange={(e) => setForm({ ...form, ppnRate: parseFloat(e.target.value) || 0 })} />
                      <span className="text-sm font-bold text-slate-500">%</span>
                    </div>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={form.ppnEnabled ?? true} onChange={(e) => setForm({ ...form, ppnEnabled: e.target.checked })} className="rounded" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Apply to all new invoices by default</span>
                  </label>
                </div>
                <div className="flex flex-col gap-4 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100">PPh 23 (Income Tax)</span>
                      <p className="text-xs text-slate-500">Withholding tax for services</p>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                      <input className="w-12 bg-transparent border-none p-0 text-right focus:ring-0 font-bold" type="number" value={form.pphRate ?? 2} onChange={(e) => setForm({ ...form, pphRate: parseFloat(e.target.value) || 0 })} />
                      <span className="text-sm font-bold text-slate-500">%</span>
                    </div>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={form.pphEnabled ?? false} onChange={(e) => setForm({ ...form, pphEnabled: e.target.checked })} className="rounded" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Apply to all new invoices by default</span>
                  </label>
                </div>
              </div>
            </section>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 flex justify-end gap-4 border-t border-slate-200 dark:border-slate-800">
              <button type="button" className="px-6 py-2.5 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">Discard</button>
              <button type="button" onClick={save} disabled={saving} className="px-8 py-2.5 rounded-lg text-sm font-bold text-white bg-primary hover:opacity-90 shadow-lg shadow-primary/20 disabled:opacity-50">
                {saving ? "Saving..." : "Save Profile Settings"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
