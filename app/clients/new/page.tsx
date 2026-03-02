"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewClientPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    npwp: "",
    contactPerson: "",
    industry: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        router.push(`/clients`);
      } else {
        const err = await res.json();
        setError(err.error || "Failed to save client. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <main className="flex-1 overflow-y-auto flex flex-col items-center py-10 px-4">
        <div className="w-full max-w-[800px] bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mb-2">
              <Link href="/clients" className="hover:text-primary">Clients</Link>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="text-slate-900 dark:text-slate-100 font-medium">Add New Client</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Add New Client</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Create a new client profile for your invoices and tracking.</p>
          </div>
          <form onSubmit={submit} className="p-8 space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-6 text-primary">
                <span className="material-symbols-outlined">business</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Business Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Business Name</label>
                  <input required className="w-full h-12 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" placeholder="e.g. Acme Corporation Ltd." value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Tax ID (NPWP)</label>
                  <input className="w-full h-12 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" placeholder="00.000.000.0-000.000" value={form.npwp} onChange={(e) => setForm({ ...form, npwp: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Industry (Optional)</label>
                  <select className="w-full h-12 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })}>
                    <option value="">Select industry</option>
                    <option value="tech">Technology</option>
                    <option value="retail">Retail</option>
                    <option value="service">Service</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </section>
            <section>
              <div className="flex items-center gap-2 mb-6 text-primary">
                <span className="material-symbols-outlined">person</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Contact Person</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                  <input className="w-full h-12 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" placeholder="John Doe" value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                  <input type="email" className="w-full h-12 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" placeholder="john@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                  <input className="w-full h-12 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" placeholder="+62 812 3456 7890" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
            </section>
            <section>
              <div className="flex items-center gap-2 mb-6 text-primary">
                <span className="material-symbols-outlined">location_on</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Billing Address</h3>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Street Address</label>
                  <textarea className="w-full p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" placeholder="Enter complete billing address" rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">City</label>
                    <input className="w-full h-12 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" placeholder="Jakarta" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">State/Province</label>
                    <input className="w-full h-12 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" placeholder="DKI Jakarta" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Postal Code</label>
                    <input className="w-full h-12 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" placeholder="12345" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
                  </div>
                </div>
              </div>
            </section>
            {error && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
              <Link href="/clients" className="px-6 py-3 rounded-lg text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</Link>
              <button type="submit" disabled={saving} className="px-8 py-3 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50">
                <span className="material-symbols-outlined text-[18px]">save</span>
                {saving ? "Saving..." : "Save Client"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
