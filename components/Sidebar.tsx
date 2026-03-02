"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", icon: "dashboard", label: "Dashboard" },
  { href: "/invoices", icon: "description", label: "Invoices" },
  { href: "/clients", icon: "group", label: "Clients" },
  { href: "/reports", icon: "analytics", label: "Reports" },
  { href: "/settings", icon: "settings", label: "Settings" },
  { href: "/admin/password", icon: "admin_panel_settings", label: "Admin" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 border-r border-primary/10 bg-white dark:bg-slate-900 flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-white">
          <span className="material-symbols-outlined">receipt_long</span>
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-primary">Invoi</h1>
          <p className="text-xs text-slate-500 font-medium">Invoice Management System</p>
        </div>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                isActive
                  ? "bg-primary text-white font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-primary/5 hover:text-primary"
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-primary/10">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div className="size-8 flex-shrink-0 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-sm">account_circle</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">Admin</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Administrator</p>
          </div>
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/login";
            }}
            className="text-slate-400 hover:text-rose-500 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
