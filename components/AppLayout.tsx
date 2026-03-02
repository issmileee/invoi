"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Sidebar from "./Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isInvoiceEditor = pathname === "/invoices/new" || pathname?.match(/^\/invoices\/[a-z0-9-]+\/edit$/);
  const isClientForm = pathname === "/clients/new" || pathname?.match(/^\/clients\/[a-z0-9-]+\/edit$/);
  const isClientsPage = pathname?.startsWith("/clients");

  if (pathname === "/onboarding" || pathname === "/login") {
    return <>{children}</>;
  }

  if (isInvoiceEditor || isClientForm) {
    return (
      <div className="flex h-screen overflow-hidden flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-8 py-3 z-20">
          <div className="flex items-center gap-3">
            <Link href="/" className="size-8 bg-primary text-white flex items-center justify-center rounded-lg">
              <span className="material-symbols-outlined">receipt_long</span>
            </Link>
            <h2 className="text-slate-900 dark:text-white text-xl font-extrabold tracking-tight">Invoi</h2>
          </div>
          <nav className="flex items-center gap-8">
            <Link href="/" className={`text-sm font-semibold transition-colors ${pathname === "/" ? "text-primary font-bold" : "text-slate-600 dark:text-slate-400 hover:text-primary"}`}>Dashboard</Link>
            <Link href="/invoices" className={`text-sm font-semibold transition-colors ${pathname?.startsWith("/invoices") ? "text-primary font-bold" : "text-slate-600 dark:text-slate-400 hover:text-primary"}`}>Invoices</Link>
            <Link href="/clients" className={`text-sm font-semibold transition-colors ${isClientsPage ? "text-primary font-bold" : "text-slate-600 dark:text-slate-400 hover:text-primary"}`}>Clients</Link>
            <Link href="/reports" className={`text-sm font-semibold transition-colors ${pathname?.startsWith("/reports") ? "text-primary font-bold" : "text-slate-600 dark:text-slate-400 hover:text-primary"}`}>Reports</Link>
          </nav>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
