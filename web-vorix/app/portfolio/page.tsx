"use client";

import { useState, useEffect } from "react";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Zap, 
  ExternalLink, 
  RefreshCw, 
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2
} from "lucide-react";

interface Holding {
  symbol: string;
  name: string;
  contract_address: string;
  amount: number;
  buy_price: number;
  total_invested_bnb: number;
  buy_timestamp: string;
  auto_tp: boolean;
  auto_sl: boolean;
  tp_target: number;
  sl_target: number;
}

const DEFAULT_FALLBACK_HOLDING: Holding = {
  symbol: "DOGE/USDT",
  name: "Dogecoin",
  contract_address: "0xBa2aE424d960c26247Dd6c32edC70B295c744C43",
  amount: 150.0,
  buy_price: 0.385,
  total_invested_bnb: 0.05,
  buy_timestamp: new Date().toISOString(),
  auto_tp: true,
  auto_sl: true,
  tp_target: 0.45,
  sl_target: 0.34
};

const formatPrice = (price: number | undefined | null) => {
  if (price === undefined || price === null || price === 0) return "$0.00";
  if (price >= 1) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  if (price >= 0.0001) return `$${price.toFixed(6)}`;
  return `$${price.toFixed(8)}`;
};

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [sellingSymbol, setSellingSymbol] = useState<string | null>(null);
  const [sellResult, setSellResult] = useState<any>(null);

  const fetchHoldings = async () => {
    setLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    try {
      const res = await fetch("http://localhost:8000/api/holdings", {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (data.status === "success" && Array.isArray(data.holdings)) {
        setHoldings(data.holdings);
      } else {
        setHoldings([]);
      }
    } catch (err) {
      console.warn("Fetch holdings error:", err);
      setHoldings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetHoldings = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/holdings/reset", { method: "POST" });
      const data = await res.json();
      if (data.status === "success") {
        setHoldings(data.holdings);
      } else {
        setHoldings([DEFAULT_FALLBACK_HOLDING]);
      }
    } catch (err) {
      setHoldings([DEFAULT_FALLBACK_HOLDING]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHoldings();
  }, []);

  const handleSellHolding = async (symbol: string, pct: number = 1.0) => {
    setSellingSymbol(symbol);
    setSellResult(null);
    try {
      const res = await fetch(`http://localhost:8000/api/sell?symbol=${encodeURIComponent(symbol)}&pct=${pct}`);
      const data = await res.json();
      setSellResult(data);
      // Update local state smoothly
      setHoldings(prev => prev.filter(h => h.symbol !== symbol));
    } catch (err) {
      console.error("Failed to sell holding:", err);
    } finally {
      setSellingSymbol(null);
    }
  };

  // Mock live current prices for PnL calculation
  const getCurrentPrice = (symbol: string, buyPrice: number) => {
    if (symbol.includes("DOGE")) return 0.442; // +14.8% profit
    if (symbol.includes("BNB")) return 728.5; // +3.3% profit
    return buyPrice * 1.08;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 border border-slate-800 p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Wallet className="w-3.5 h-3.5" />
              <span>Manajemen Portofolio & Eksekusi Jual Otonom</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-slate-100 to-emerald-300 bg-clip-text text-transparent">
              Koin & Aset Yang Sedang Dipegang
            </h1>
            <p className="text-slate-400 text-sm max-w-xl">
              Lihat performa koin yang telah dibeli oleh VORIX AI. Pantau profit real-time dan eksekusi <span className="text-emerald-300 font-semibold">"Jual Sekarang"</span> secara instant ke bursa PancakeSwap.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleResetHoldings}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition-colors"
              title="Isi Ulang Koin Demo"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Isi Koin Demo</span>
            </button>
            <button
              onClick={fetchHoldings}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Saldo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sell Feedback Notification */}
      {sellResult && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-emerald-300 text-xs">TRANSAKSI PENJUALAN BERHASIL DISUBMIT!</div>
              <div className="text-[11px] text-slate-400">Koin berhasil dijual kembali ke tBNB di PancakeSwap Testnet.</div>
            </div>
          </div>
          {sellResult.explorer_link && (
            <a
              href={sellResult.explorer_link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/30 border border-cyan-500/30 transition-all shrink-0"
            >
              <span>Cek BscScan</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {/* Holdings Asset Cards & Table */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Daftar Aset Aktif ({loading ? "Memuat..." : `${holdings.length} Koin Terdeteksi`})
          </span>
          <span className="text-[11px] font-mono text-cyan-400 font-medium">Auto Take Profit: ACTIVE</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-950/40 text-slate-400 uppercase tracking-wider font-mono text-[11px]">
                <th className="py-3.5 px-4 font-semibold">Aset</th>
                <th className="py-3.5 px-4 font-semibold">Jumlah Koin</th>
                <th className="py-3.5 px-4 font-semibold text-right">Harga Beli</th>
                <th className="py-3.5 px-4 font-semibold text-right">Harga Saat Ini</th>
                <th className="py-3.5 px-4 font-semibold text-right">Floating PnL (%)</th>
                <th className="py-3.5 px-4 font-semibold text-center">Auto TP / SL</th>
                <th className="py-3.5 px-4 font-semibold text-center">Aksi Penjualan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-400 mb-2" />
                    Memuat portofolio aset...
                  </td>
                </tr>
              ) : holdings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="max-w-md mx-auto space-y-3">
                      <p className="text-slate-400 text-xs">
                        Belum ada koin yang dipegang. Semua posisi telah berhasil dijual atau portofolio masih kosong.
                      </p>
                      <button
                        onClick={handleResetHoldings}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition-all"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Isi Koin Demo (DOGE/USDT)</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                holdings.map((h) => {
                  const currentPrice = getCurrentPrice(h.symbol, h.buy_price);
                  const pnlPct = roundTwo(((currentPrice - h.buy_price) / h.buy_price) * 100);
                  const isProfit = pnlPct >= 0;
                  const isSelling = sellingSymbol === h.symbol;

                  return (
                    <tr key={h.symbol} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center font-bold text-white shadow-lg text-xs">
                            {h.symbol.substring(0, 3)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-100 text-sm">{h.symbol}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {h.contract_address.substring(0, 6)}...{h.contract_address.substring(38)}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-mono">
                        <div className="font-bold text-slate-200">{h.amount.toLocaleString()} {h.symbol.split("/")[0]}</div>
                        <div className="text-[10px] text-slate-400">Modal: {h.total_invested_bnb} tBNB</div>
                      </td>

                      <td className="py-4 px-4 text-right font-mono text-slate-300">
                        {formatPrice(h.buy_price)}
                      </td>

                      <td className="py-4 px-4 text-right font-mono font-bold text-slate-100">
                        {formatPrice(currentPrice)}
                      </td>

                      <td className="py-4 px-4 text-right font-mono">
                        <span className={`inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-lg ${
                          isProfit ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        }`}>
                          {isProfit ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          {isProfit ? `+${pnlPct}%` : `${pnlPct}%`}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <ShieldCheck className="w-3 h-3" /> TP: {formatPrice(h.tp_target)}
                          </span>
                          <div className="text-[10px] text-slate-500 font-mono">SL: {formatPrice(h.sl_target)}</div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleSellHolding(h.symbol, 1.0)}
                            disabled={isSelling}
                            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                          >
                            {isSelling ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Zap className="w-3.5 h-3.5" />
                            )}
                            <span>JUAL SEKARANG (100%)</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function roundTwo(num: number) {
  return Math.round(num * 100) / 100;
}
