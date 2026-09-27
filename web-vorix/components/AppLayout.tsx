"use client";

import Sidebar from "./Sidebar";
import ConnectWallet from "./ConnectWallet";
import ModeToggle from "./ModeToggle";
import { Radio, ShieldCheck, Cpu } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Stats & Wallet Bar */}
        <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium">
              <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              <span>Real-time Market Radar Active</span>
            </div>
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/50 text-xs text-slate-400 font-mono">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Agent AI Wallet: 0x1f75...cc57</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Auto TP/SL Protection ON</span>
            </div>
            {/* Single Light-Switch Mode Toggle Button */}
            <ModeToggle />
            {/* Interactive Connect Wallet Button */}
            <ConnectWallet />
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 md:p-8 flex-1 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
