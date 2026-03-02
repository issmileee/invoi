"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditClientPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/clients/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setForm({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
          province: data.province || "",
          postalCode: data.postalCode || "",
          npwp: data.npwp || "",
          contactPerson: data.contactPerson || "",
          industry: data.industry || "",
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) router.push("/clients");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <>
      <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-10 py-3 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-4 text-primary">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined">receipt_long</span>
            </div>
            <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold">Invoi</h2>
          </Link>
          <nav className="flex items-center gap-8">
            <Link href="/" className="text-slate-600 dark:text-slate-400 hover:text-primary text-sm">Dashboard</Link>
            <Link href="/invoices" className="text-slate-600 dark:text-slate-400 hover:text-primary text-sm">Invoices</Link>
            <Link href="/clients" className="text-primary text-sm font-bold">Clients</Link>
            <Link href="/reports" className="text-slate-600 dark:text-slate-400 hover:text-primary text-sm">Reports</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center py-10 px-4">
        <div className="w-full max-w-[800px] bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mb-2">
              <Link href="/clients" className="hover:text-primary">Clients</Link>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="text-slate-900 dark:text-slate-100 font-medium">Edit Client</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Edit Client</h1>
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
                  <input required className="w-full h-12 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Tax ID (NPWP)</label>
                  <input className="w-full h-12 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" value={form.npwp} onChange={(e) => setForm({ ...form, npwp: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Industry</label>
                  <select className="w-full h-12 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })}>
                    <option value="">Select industry</option>
                    <option value="tech">Technology</option>
                    <option value="retail">Retail</option>
                    <option value="service">Service</option>
                    <option value="manufacturing">Manufacturing</option>
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
                  <input className="w-full h-12 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                  <input type="email" className="w-full h-12 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                  <input className="w-full h-12 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
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
                  <textarea className="w-full p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">City</label>
                    <input className="w-full h-12 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">State/Province</label>
                    <input className="w-full h-12 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Postal Code</label>
                    <input className="w-full h-12 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
                  </div>
                </div>
              </div>
            </section>
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
              <Link href="/clients" className="px-6 py-3 rounded-lg text-slate-600 dark:text-slate-400 font-bold text-sm">Cancel</Link>
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
