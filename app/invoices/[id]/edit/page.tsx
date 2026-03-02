"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import InvoicePreview from "@/components/InvoicePreview";

type Client = { id: string; name: string; email?: string; address?: string; city?: string; province?: string };
type BankAccount = { id: string; bankName: string; accountName: string; accountNumber: string; isDefault: boolean };
type Settings = { name: string; address?: string; npwp?: string; logoUrl?: string; ppnRate: number; ppnEnabled: boolean; pphRate: number; pphEnabled: boolean; bankAccounts: BankAccount[] };
type LineItem = { description: string; quantity: number; unit: string; price: number };

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [clients, setClients] = useState<Client[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [clientId, setClientId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [items, setItems] = useState<LineItem[]>([{ description: "", quantity: 1, unit: "pcs", price: 0 }]);
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [discountValue, setDiscountValue] = useState(0);
  const [ppnEnabled, setPpnEnabled] = useState(true);
  const [pphEnabled, setPphEnabled] = useState(false);
  const [bankAccountId, setBankAccountId] = useState("");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/clients").then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
      fetch(`/api/invoices/${id}`).then((r) => r.json()),
    ]).then(([cl, set, inv]) => {
      setClients(cl);
      setSettings(set);
      setClientId(inv.clientId);
      setInvoiceNumber(inv.invoiceNumber);
      setDueDate(inv.dueDate.slice(0, 10));
      setIssueDate(inv.issueDate.slice(0, 10));
      setItems(inv.items?.length ? inv.items.map((i: LineItem) => ({ ...i, unit: i.unit || "pcs" })) : [{ description: "", quantity: 1, unit: "pcs", price: 0 }]);
      setDiscountType(inv.discountType || "percent");
      setDiscountValue(inv.discountValue || 0);
      setPpnEnabled(inv.ppnEnabled ?? true);
      setPphEnabled(inv.pphEnabled ?? false);
      setBankAccountId(inv.bankAccountId || "");
      setNotes(inv.notes || "");
      setTerms(inv.terms || "");
      const def = set?.bankAccounts?.find((b: BankAccount) => b.isDefault);
      if (def && !inv.bankAccountId) setBankAccountId(def.id);
      setLoading(false);
    });
  }, [id]);

  const selectedClient = clients.find((c) => c.id === clientId);
  const selectedBank = settings?.bankAccounts?.find((b) => b.id === bankAccountId);

  const updateItem = (i: number, field: keyof LineItem, value: string | number) => {
    const next = [...items];
    (next[i] as Record<string, unknown>)[field] = value;
    setItems(next);
  };

  const addItem = () => setItems([...items, { description: "", quantity: 1, unit: "pcs", price: 0 }]);
  const removeItem = (i: number) => items.length > 1 && setItems(items.filter((_, j) => j !== i));

  const subtotal = items.reduce((s, i) => s + i.quantity * i.price, 0);
  const discount = discountType === "percent" ? (subtotal * discountValue) / 100 : discountValue;
  const afterDiscount = subtotal - discount;
  const ppn = ppnEnabled && settings ? (afterDiscount * (settings.ppnRate || 11)) / 100 : 0;
  const pph = pphEnabled && settings ? (afterDiscount * (settings.pphRate || 2)) / 100 : 0;
  const total = afterDiscount + ppn - pph;

  const save = async () => {
    if (!clientId) return alert("Pilih klien terlebih dahulu");
    setSaving(true);
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          issueDate,
          dueDate,
          notes: notes || undefined,
          terms: terms || undefined,
          discountType,
          discountValue,
          ppnEnabled,
          pphEnabled,
          bankAccountId: bankAccountId || undefined,
          items: items.filter((i) => i.description.trim()).map((i) => ({ ...i, quantity: Number(i.quantity), price: Number(i.price) })),
        }),
      });
      if (res.ok) router.push(`/invoices/${id}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex flex-1 flex-col overflow-hidden h-full">
      <div className="flex flex-1 overflow-hidden min-h-0">
        <aside className="w-1/3 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900 overflow-hidden shrink-0">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest mb-2">
              <span className="material-symbols-outlined text-sm">edit_note</span>
              Invoice Editor
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Edit Invoice</h1>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">General Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Select Client</label>
                  <select className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm py-3 px-4" value={clientId} onChange={(e) => setClientId(e.target.value)}>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Invoice Number</label>
                  <input className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg text-sm py-3 px-4" value={invoiceNumber} readOnly />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                  <input type="date" className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg text-sm py-3 px-4" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
              </div>
            </section>
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Line Items</h3>
                <button type="button" onClick={addItem} className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
                  <span className="material-symbols-outlined text-sm">add_circle</span>
                  Add Item
                </button>
              </div>
              <div className="space-y-3">
                {items.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-start">
                    <div className="col-span-6">
                      <input className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg text-sm py-2 px-3" placeholder="Description" value={item.description} onChange={(e) => updateItem(i, "description", e.target.value)} />
                    </div>
                    <div className="col-span-2">
                      <input type="number" className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg text-sm py-2 px-3" value={item.quantity} onChange={(e) => updateItem(i, "quantity", parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="col-span-3">
                      <input type="number" className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg text-sm py-2 px-3" value={item.price || ""} onChange={(e) => updateItem(i, "price", parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="col-span-1 pt-6 text-center">
                      <button type="button" onClick={() => removeItem(i)} className="text-slate-300 hover:text-red-500">
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Discount & Tax</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Discount Type</label>
                  <select className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg text-sm py-2 px-3" value={discountType} onChange={(e) => setDiscountType(e.target.value as "percent" | "fixed")}>
                    <option value="percent">Percent</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Discount Value</label>
                  <input type="number" className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg text-sm py-2 px-3" value={discountValue || ""} onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)} />
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={ppnEnabled} onChange={(e) => setPpnEnabled(e.target.checked)} />
                <span className="text-sm">PPN {settings?.ppnRate ?? 11}%</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={pphEnabled} onChange={(e) => setPphEnabled(e.target.checked)} />
                <span className="text-sm">PPh 23 {settings?.pphRate ?? 2}%</span>
              </label>
            </section>
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Payment & Notes</h3>
              <select className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg text-sm py-2 px-3" value={bankAccountId} onChange={(e) => setBankAccountId(e.target.value)}>
                <option value="">-- Pilih Rekening --</option>
                {settings?.bankAccounts?.map((b) => (
                  <option key={b.id} value={b.id}>{b.bankName} - {b.accountNumber}</option>
                ))}
              </select>
              <textarea className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg text-sm py-2 px-3" rows={2} placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
              <textarea className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg text-sm py-2 px-3" rows={2} placeholder="Terms" value={terms} onChange={(e) => setTerms(e.target.value)} />
            </section>
          </div>
        </aside>
        <section className="w-2/3 bg-slate-100 dark:bg-slate-950 flex flex-col p-8 overflow-y-auto custom-scrollbar items-center">
          <InvoicePreview
            businessName={settings?.name || "My Business"}
            businessAddress={settings?.address}
            businessNpwp={settings?.npwp}
            logoUrl={settings?.logoUrl}
            client={selectedClient || { name: "Select client" }}
            invoiceNumber={invoiceNumber}
            issueDate={issueDate}
            dueDate={dueDate}
            items={items.filter((i) => i.description.trim())}
            subtotal={subtotal}
            discount={discount}
            ppn={ppn}
            pph={pph}
            total={total}
            bank={selectedBank ? { bankName: selectedBank.bankName, accountName: selectedBank.accountName, accountNumber: selectedBank.accountNumber } : undefined}
            notes={notes || undefined}
            terms={terms || undefined}
          />
        </section>
      </div>
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 shrink-0 z-30">
        <div className="max-w-7xl mx-auto flex justify-end">
          <button type="button" onClick={save} disabled={saving} className="px-8 py-2.5 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50">
            <span className="material-symbols-outlined text-lg">save</span>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </footer>
    </div>
  );
}
