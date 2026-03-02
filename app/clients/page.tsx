"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency, getInitials } from "@/lib/utils";

type Client = {
  id: string;
  name: string;
  email: string | null;
  address: string | null;
  outstanding: number;
  _count: { invoices: number };
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/clients?search=${encodeURIComponent(search)}`)
      .then((r) => r.json())
      .then(setClients)
      .finally(() => setLoading(false));
  }, [search]);

  const deleteClient = async (id: string, name: string) => {
    if (!confirm(`Delete client "${name}"?`)) return;
    const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
    if (res.ok) {
      setClients((c) => c.filter((x) => x.id !== id));
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Cannot delete: client may have invoices.");
    }
  };

  return (
    <>
      <header className="h-16 border-b border-primary/10 bg-white dark:bg-slate-900/80 backdrop-blur flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input className="w-full bg-background-light dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary rounded-lg pl-10 pr-4 py-2 text-sm" placeholder="Search clients, emails or company..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/clients/new" className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all">
            <span className="material-symbols-outlined text-sm">person_add</span>
            Add New Client
          </Link>
        </div>
      </header>
      <section className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Client Directory</h2>
            <p className="text-slate-500 text-sm mt-1">Manage {clients.length} active business relationships.</p>
          </div>
          <div className="flex gap-2">
            <a href={`/api/reports/csv?year=${new Date().getFullYear()}`} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-800 border border-primary/10 rounded-lg hover:bg-primary/5 text-slate-600 dark:text-slate-300">
              <span className="material-symbols-outlined text-base">file_download</span>
              Export
            </a>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-primary/10 rounded-xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-slate-500">Loading...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary/5 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-black tracking-widest">
                  <th className="px-6 py-4">Client Name</th>
                  <th className="px-6 py-4">Contact Email</th>
                  <th className="px-6 py-4">Total Invoices</th>
                  <th className="px-6 py-4">Outstanding</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-8 bg-primary/20 text-primary rounded-lg flex items-center justify-center font-bold text-xs">{getInitials(c.name)}</div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{c.name}</p>
                          <p className="text-[11px] text-slate-500 font-medium leading-tight">{c.address || "-"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{c.email || "-"}</td>
                    <td className="px-6 py-4 text-sm font-medium">{c._count.invoices}</td>
                    <td className="px-6 py-4">
                      <span className={c.outstanding > 0 ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-1 rounded text-xs font-bold" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded text-xs font-bold"}>
                        {formatCurrency(c.outstanding)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/clients/${c.id}/edit`} className="p-2 text-slate-400 hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-lg">edit_square</span>
                        </Link>
                        <button type="button" onClick={() => deleteClient(c.id, c.name)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {clients.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">No clients yet. Add your first client!</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </>
  );
}
