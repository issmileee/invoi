"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Admin Account, 2: Business Profile
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [businessForm, setBusinessForm] = useState({
    name: "",
    address: "",
    npwp: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
  });

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/auth/check-admin");
        const data = await res.json();
        if (data.hasAdmin) {
          setStep(2); // If admin exists, skip to business profile
        }
      } catch (err) {
        console.error(err);
      } finally {
        setChecking(false);
      }
    };
    checkAdmin();
  }, []);

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/setup-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminForm),
      });
      
      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        throw new Error("Server returned an invalid response");
      }

      if (res.ok && data.success) {
        // Auto login
        const loginRes = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: adminForm.email, password: adminForm.password }),
        });
        
        if (loginRes.ok) {
          setStep(2);
        } else {
          const loginData = await loginRes.json();
          alert(loginData.error || "Login failed after account creation");
        }
      } else {
        alert(data.error || "Failed to create admin");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...businessForm,
          bankAccounts: businessForm.bankName && businessForm.accountNumber ? [{ bankName: businessForm.bankName, accountName: businessForm.accountName || businessForm.bankName, accountNumber: businessForm.accountNumber, isDefault: true }] : [],
        }),
      });
      
      if (!res.ok) {
        throw new Error("Failed to save business profile");
      }
      
      // Use window.location.href for a hard redirect to ensure middleware and layout re-evaluate
      window.location.href = "/";
    } catch (err: any) {
      alert(err.message || "Failed to save business profile");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-3 mb-12 justify-center">
          <div className="size-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
            <span className="material-symbols-outlined text-2xl select-none notranslate" style={{ fontFeatureSettings: "'liga' 1" }}>receipt_long</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold tracking-tight text-primary">Invoi</h1>
            <p className="text-sm text-slate-500">Setup Inisial</p>
          </div>
        </div>

        {step === 1 ? (
          <form onSubmit={handleAdminSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Buat Akun Admin</h2>
              <p className="text-sm text-slate-500">Akun ini akan digunakan untuk mengelola aplikasi.</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nama Lengkap</label>
                <input required className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Administrator" value={adminForm.name} onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email</label>
                <input type="email" required className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="admin@example.com" value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Password</label>
                <input type="password" required className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="••••••••" value={adminForm.password} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:opacity-90 disabled:opacity-50 shadow-lg shadow-primary/20 transition-all">
              {loading ? "Memproses..." : "Buat Akun & Lanjut"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleBusinessSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Profil Bisnis</h2>
              <p className="text-sm text-slate-500">Informasi ini akan muncul di invoice Anda.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nama Bisnis</label>
                <input required className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="PT Contoh Indah" value={businessForm.name} onChange={(e) => setBusinessForm({ ...businessForm, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Alamat</label>
                <textarea className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all" rows={3} placeholder="Alamat lengkap bisnis" value={businessForm.address} onChange={(e) => setBusinessForm({ ...businessForm, address: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nama Bank</label>
                  <input className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="BCA / Mandiri" value={businessForm.bankName} onChange={(e) => setBusinessForm({ ...businessForm, bankName: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">No. Rekening</label>
                  <input className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="12345678" value={businessForm.accountNumber} onChange={(e) => setBusinessForm({ ...businessForm, accountNumber: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Atas Nama</label>
                  <input className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Nama Pemilik" value={businessForm.accountName} onChange={(e) => setBusinessForm({ ...businessForm, accountName: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => window.location.href = "/"} className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Lewati</button>
              <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-primary text-white font-bold hover:opacity-90 disabled:opacity-50 shadow-lg shadow-primary/20 transition-all">
                {loading ? "Menyimpan..." : "Selesai"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
