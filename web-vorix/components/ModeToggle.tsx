"use client";

import React, { useState, useEffect } from "react";
import { Hand, Bot, Sparkles, CheckCircle2 } from "lucide-react";
import { BACKEND_URL } from "@/config/api";

export default function ModeToggle() {
  const [mode, setMode] = useState<"MANUAL" | "FULL_CONTROL_AI">("MANUAL");
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchCurrentMode = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/mode`);
      const data = await res.json();
      if (data && data.mode) {
        setMode(data.mode);
      }
    } catch (err) {
      console.error("Failed to fetch system mode:", err);
    }
  };

  useEffect(() => {
    fetchCurrentMode();
  }, []);

  const handleToggleMode = async () => {
    const nextMode = mode === "MANUAL" ? "FULL_CONTROL_AI" : "MANUAL";
    setMode(nextMode); // Optimistic instant toggle update
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/mode?mode=${nextMode}`, {
        method: "POST"
      });
      const data = await res.json();
      if (data.status === "success") {
        window.dispatchEvent(new Event("vorix-mode-changed"));
        if (nextMode === "FULL_CONTROL_AI") {
          setToastMessage("🤖 Mode Full Control AI Aktif: VORIX akan otomatis membeli koin STRONG_BUY & mengeksekusi Auto-Sell Take Profit!");
        } else {
          setToastMessage("🖐️ Mode Manual Aktif: Pembelian memerlukan pemicu manual dengan nominal custom pilihan Anda.");
        }

        setTimeout(() => {
          setToastMessage(null);
        }, 4500);
      }
    } catch (err) {
      console.error("Failed to update mode:", err);
    } finally {
      setLoading(false);
    }
  };

  const isFullControl = mode === "FULL_CONTROL_AI";

  return (
    <div className="relative inline-flex items-center">
      {/* Light Switch Toggle Button */}
      <button
        onClick={handleToggleMode}
        disabled={loading}
        title="Klik untuk mengubah Mode Trading (Manual vs Full Control AI)"
        className={`group relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all duration-300 cursor-pointer shadow-lg select-none border ${
          isFullControl
            ? "bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/20 hover:border-emerald-400"
            : "bg-slate-900/90 text-amber-300 border-amber-500/30 hover:border-amber-400 shadow-slate-900/40"
        }`}
      >
        {/* Animated Status Dot */}
        <span className="relative flex h-2.5 w-2.5">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isFullControl ? "bg-emerald-400" : "bg-amber-400"
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              isFullControl ? "bg-emerald-500" : "bg-amber-500"
            }`}
          />
        </span>

        {/* Icon & Label */}
        <div className="flex items-center gap-1.5 font-mono">
          {isFullControl ? (
            <>
              <Bot className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>FULL CONTROL AI</span>
            </>
          ) : (
            <>
              <Hand className="w-3.5 h-3.5 text-amber-400" />
              <span>MODE MANUAL</span>
            </>
          )}
        </div>

        {/* Switch Slider Pill Indicator */}
        <div
          className={`w-7 h-4 rounded-full p-0.5 transition-colors duration-300 flex items-center ${
            isFullControl ? "bg-emerald-500 justify-end" : "bg-slate-800 justify-start"
          }`}
        >
          <div className="w-3 h-3 rounded-full bg-slate-950 shadow-md" />
        </div>
      </button>

      {/* Floating Transition Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 max-w-md bg-slate-900/95 border border-cyan-500/40 text-slate-100 p-4 rounded-2xl shadow-2xl backdrop-blur-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-3">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="font-bold text-xs text-cyan-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              PERUBAHAN MODE BERHASIL!
            </div>
            <p className="text-[11px] text-slate-300 leading-normal font-sans">{toastMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
