"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Search, 
  Wallet, 
  History, 
  BrainCircuit
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Screener AI (200+)",
      href: "/",
      icon: Search,
      badge: "Live Radar"
    },
    {
      name: "Portofolio & Aset Saya",
      href: "/portfolio",
      icon: Wallet,
      badge: "Holdings"
    },
    {
      name: "History & Rekap Harian",
      href: "/history",
      icon: History,
      badge: "PnL"
    }
  ];

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800/80 flex flex-col justify-between p-4 min-h-screen backdrop-blur-xl shrink-0">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-slate-800/60">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-950 p-1 border border-slate-800/80 shadow-lg shadow-cyan-500/20">
            <img src="/vorix-logo.png" alt="VORIX Logo" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <h1 className="font-bold text-lg bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent tracking-wide">
              VORIX <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">v1.1</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-tight">VISION ON-CHAIN AI</p>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <div className="px-3 mb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Menu Utama
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/10 text-cyan-300 border border-cyan-500/30 shadow-md shadow-cyan-500/5 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                      isActive
                        ? "bg-cyan-500/30 text-cyan-200"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* System Stats Widget */}
        <div className="mt-8 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Gemini 3.6 Flash
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">Active</span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300 pt-1 border-t border-slate-800/60">
            <div className="flex justify-between">
              <span className="text-slate-500">Network:</span>
              <span className="font-mono text-cyan-300">BSC Testnet</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Scan Engine:</span>
              <span className="font-mono text-slate-300">200+ Pairs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="pt-4 border-t border-slate-800/60 text-center">
        <p className="text-[11px] text-slate-500">VORIX Trading Engine</p>
        <p className="text-[10px] text-slate-600 font-mono mt-0.5">Autonomous Web3 Intelligence</p>
      </div>
    </aside>
  );
}
