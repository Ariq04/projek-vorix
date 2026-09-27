"use client";

import React, { useState, useEffect } from "react";
import { 
  Activity, 
  Cpu, 
  TrendingUp, 
  Zap, 
  ExternalLink, 
  RefreshCw, 
  Gauge, 
  Layers, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ListFilter, 
  Flame, 
  ArrowRight, 
  ArrowDownRight,
  Hand,
  Bot
} from "lucide-react";

interface MarketMetrics {
  rsi_14: number;
  fibonacci: {
    fib_618: number;
    fib_786: number;
    dist_618_pct: number;
    dist_786_pct: number;
  };
}

interface TokenScanResult {
  symbol: string;
  timeframe: string;
  current_price: number;
  range_high: number;
  range_low: number;
  opportunity_score: number;
  metrics: MarketMetrics;
  signals: {
    is_oversold: boolean;
    near_fib_618: boolean;
    near_fib_786: boolean;
    near_fib_support: boolean;
    recommendation_preview: string;
  };
  last_updated: string;
}

interface AnalysisData {
  decision: string;
  reasoning: string;
}

interface ExecutionData {
  status: string;
  action?: string;
  reason: string;
  tx_hash: string | null;
  explorer_link: string | null;
}

interface AnalyzeApiResponse {
  status: string;
  mode?: string;
  symbol: string;
  timeframe: string;
  market_data: TokenScanResult;
  analysis: AnalysisData;
  execution?: ExecutionData;
  tx_hash?: string | null;
  explorer_link?: string | null;
}

interface RadarApiResponse {
  status: string;
  total_scanned: number;
  timeframe: string;
  top_candidate: TokenScanResult | null;
  potential_count: number;
  tokens: TokenScanResult[];
}

const BACKEND_URL = "http://localhost:8000";

const formatPrice = (price: number | undefined | null) => {
  if (price === undefined || price === null || price === 0) return "$0.00";
  if (price >= 1) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
  if (price >= 0.001) return `$${price.toFixed(6)}`;
  return `$${price.toFixed(8)}`;
};

interface SystemLog {
  id: number;
  timestamp: string;
  agent: string;
  message: string;
  level: string;
}

export default function ScreenerAIPage() {
  const [selectedSymbol, setSelectedSymbol] = useState("BNB/USDT");
  const [timeframe, setTimeframe] = useState("1h");
  const [loading, setLoading] = useState(false);
  const [radarLoading, setRadarLoading] = useState(false);
  const [sellLoading, setSellLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentMode, setCurrentMode] = useState<string>("MANUAL");
  const [customBuyAmount, setCustomBuyAmount] = useState<number>(0.05);

  const [analyzeData, setAnalyzeData] = useState<AnalyzeApiResponse | null>(null);
  const [radarData, setRadarData] = useState<RadarApiResponse | null>(null);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);

  // Fetch real-time system logs
  const fetchLogs = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/logs`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.logs) {
          setSystemLogs(data.logs);
        }
      }
    } catch (e) {
      console.error("Failed fetching system logs:", e);
    }
  };

  // Trigger instant presentation demo trade
  const triggerDemoPresentationTrade = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/demo-trigger?symbol=${encodeURIComponent(selectedSymbol)}`, { method: "POST" });
      const data = await res.json();
      if (data && data.result) {
        setAnalyzeData(data.result);
      }
      fetchSystemMode();
      fetchLogs();
      fetchRadar();
    } catch (err: any) {
      console.error("Demo trigger failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch system mode
  const fetchSystemMode = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/mode`);
      const data = await res.json();
      if (data && data.mode) {
        setCurrentMode(data.mode);
      }
    } catch (err) {
      console.error("Failed fetching system mode:", err);
    }
  };

  // Fetch full AI Analysis on selected symbol
  const fetchAnalysis = async (symbolToScan = selectedSymbol) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/analyze?symbol=${encodeURIComponent(symbolToScan)}&timeframe=${encodeURIComponent(timeframe)}`
      );
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      const json: AnalyzeApiResponse = await res.json();
      setAnalyzeData(json);
    } catch (err: any) {
      console.error("Failed fetching VORIX analysis:", err);
      setError(err.message || "Gagal terhubung ke VORIX API Backend.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Parallel Radar Scanner across 200+ coins
  const fetchRadar = async (autoSelect = false) => {
    setRadarLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/radar?timeframe=${encodeURIComponent(timeframe)}`);
      if (res.ok) {
        const json: RadarApiResponse = await res.json();
        setRadarData(json);
        if (autoSelect && json.top_candidate) {
          setSelectedSymbol(json.top_candidate.symbol);
          fetchAnalysis(json.top_candidate.symbol);
        }
      }
    } catch (err) {
      console.error("Failed to run market radar:", err);
    } finally {
      setRadarLoading(false);
    }
  };

  // Execute Manual Buy with custom BNB amount
  const executeManualBuySwap = async (symbolToBuy = selectedSymbol, bnbAmount = customBuyAmount) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/buy-manual?symbol=${encodeURIComponent(symbolToBuy)}&amount_bnb=${bnbAmount}`,
        { method: "POST" }
      );
      const data = await res.json();
      
      setAnalyzeData((prev) => {
        const baseSymbol = symbolToBuy;
        const baseMarket = prev?.market_data || {
          symbol: baseSymbol,
          timeframe: timeframe,
          current_price: 0.385,
          range_high: 0.45,
          range_low: 0.35,
          opportunity_score: 100,
          metrics: { rsi_14: 30, fibonacci: { fib_618: 0, fib_786: 0, dist_618_pct: 0, dist_786_pct: 0 } },
          signals: { is_oversold: true, near_fib_618: true, near_fib_786: true, near_fib_support: true, recommendation_preview: "STRONG_BUY" },
          last_updated: new Date().toISOString()
        };

        return {
          status: "success",
          symbol: baseSymbol,
          timeframe: timeframe,
          market_data: baseMarket,
          analysis: {
            decision: "STRONG_BUY",
            reasoning: `Pembelian manual sebesar ${bnbAmount} tBNB telah dieksekusi secara instan di PancakeSwap Testnet!`
          },
          execution: data,
          tx_hash: data.tx_hash,
          explorer_link: data.explorer_link
        };
      });

      fetchRadar(false);
    } catch (err: any) {
      console.error("Failed executing manual buy:", err);
      setError(err.message || "Gagal mengeksekusi pembelian manual.");
    } finally {
      setLoading(false);
    }
  };

  // Trigger Autonomous Sell / Take Profit
  const triggerAutonomousSell = async () => {
    setSellLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/sell?pct=1.0`);
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      const json = await res.json();
      
      setAnalyzeData((prev) => {
        const baseSymbol = prev?.symbol || selectedSymbol;
        const baseMarket = prev?.market_data || {
          symbol: baseSymbol,
          timeframe: timeframe,
          current_price: 0,
          range_high: 0,
          range_low: 0,
          opportunity_score: 100,
          metrics: { rsi_14: 75, fibonacci: { fib_618: 0, fib_786: 0, dist_618_pct: 0, dist_786_pct: 0 } },
          signals: { is_oversold: false, near_fib_618: false, near_fib_786: false, near_fib_support: false, recommendation_preview: "STRONG_SELL" },
          last_updated: new Date().toISOString()
        };

        return {
          status: "success",
          symbol: baseSymbol,
          timeframe: timeframe,
          market_data: baseMarket,
          analysis: {
            decision: "STRONG_SELL",
            reasoning: json.status === "success" 
              ? `VORIX Take Profit Engine telah mengeksekusi penjualan 100% token kembali menjadi tBNB di PancakeSwap BSC Testnet!`
              : `Status Penjualan: ${json.reason || "Tidak ada saldo token untuk dijual di dompet."}`
          },
          execution: json,
          tx_hash: json.tx_hash,
          explorer_link: json.explorer_link
        };
      });

      fetchRadar(false);
    } catch (err: any) {
      console.error("Failed executing sell swap:", err);
      setError(err.message || "Gagal mengeksekusi penjualan di BSC Testnet.");
    } finally {
      setSellLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemMode();
    fetchRadar(false);
    fetchLogs();

    // Pulse loop for live logs & system status updates (without re-scanning radar every 5s)
    const intervalId = setInterval(() => {
      fetchSystemMode();
      fetchLogs();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [timeframe]);

  const getDecisionBadge = (decision?: string) => {
    switch (decision) {
      case 'STRONG_BUY':
        return (
          <div className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-bold text-sm shadow-[0_0_25px_rgba(16,185,129,0.3)] animate-pulse">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>STRONG_BUY</span>
          </div>
        );
      case 'WATCH':
        return (
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-400 font-bold text-sm">
            <Activity className="w-4 h-4 text-amber-400" />
            <span>WATCH</span>
          </div>
        );
      case 'AVOID':
      case 'STRONG_SELL':
        return (
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-400 font-bold text-sm">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>{decision}</span>
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 text-xs font-semibold">
            <span>NEUTRAL</span>
          </div>
        );
    }
  };

  const txHash = analyzeData?.tx_hash || analyzeData?.execution?.tx_hash;
  const explorerLink = analyzeData?.explorer_link || analyzeData?.execution?.explorer_link || (txHash ? `https://testnet.bscscan.com/tx/${txHash}` : null);

  return (
    <div className="space-y-8 pb-16">
      {/* HERO CONTROL PANEL */}
      <section className="relative p-6 sm:p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-amber-400 animate-bounce" />
              <h1 className="text-2xl font-bold text-white">
                Screener Pasar AI & Radar Otonom VORIX
              </h1>
            </div>
            <p className="text-sm text-slate-400">
              Memindai indikator teknikal (RSI & Fibonacci Support) serta menghasilkan rekomendasi analisis AI otonom real-time.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Symbol Selector */}
            <div className="relative">
              <select
                value={selectedSymbol}
                onChange={(e) => {
                  setSelectedSymbol(e.target.value);
                  fetchAnalysis(e.target.value);
                }}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-3 font-mono font-semibold focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer appearance-none pr-8"
              >
                <option value="BNB/USDT">BNB / USDT</option>
                <option value="BTC/USDT">BTC / USDT</option>
                <option value="ETH/USDT">ETH / USDT</option>
                <option value="SOL/USDT">SOL / USDT</option>
                <option value="DOGE/USDT">DOGE / USDT</option>
                <option value="NEAR/USDT">NEAR / USDT</option>
                <option value="AVAX/USDT">AVAX / USDT</option>
                <option value="SUI/USDT">SUI / USDT</option>
                <option value="FET/USDT">FET / USDT</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs">▼</div>
            </div>

            {/* Timeframe Dropdown */}
            <div className="relative">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-3 font-mono font-semibold focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer appearance-none pr-8"
              >
                <option value="15m">15m</option>
                <option value="1h">1h</option>
                <option value="4h">4h</option>
                <option value="1d">1d</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs">▼</div>
            </div>

            {/* Scan Market Button */}
            <button
              onClick={() => {
                fetchSystemMode();
                fetchRadar();
                fetchAnalysis(selectedSymbol);
              }}
              disabled={loading || radarLoading}
              className="group relative inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-sm transition-all duration-300 shadow-[0_0_25px_rgba(6,182,212,0.35)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
            >
              <RefreshCw className={`w-4 h-4 text-slate-950 ${loading || radarLoading ? 'animate-spin' : 'group-hover:rotate-180 duration-500'}`} />
              <span>{loading || radarLoading ? 'Scanning...' : 'Scan Market Now'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* LIVE AI AGENT EXECUTION TERMINAL */}
      <section className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Bot className="w-5 h-5 text-cyan-400 animate-pulse" />
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Terminal Eksekusi AI Agent Otonom
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                  LIVE PULSE
                </span>
              </h2>
              <p className="text-xs text-slate-400">Monitoring aktivitas scan, sinyal AI, dan transaksi On-chain real-time.</p>
            </div>
          </div>

          <button
            onClick={triggerDemoPresentationTrade}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all active:scale-95 cursor-pointer flex items-center gap-2 shrink-0"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>Simulasikan Auto-Trade Live Presentasi</span>
          </button>
        </div>

        <div className="bg-slate-950/90 rounded-2xl border border-slate-800/80 p-4 font-mono text-xs space-y-2.5 max-h-52 overflow-y-auto">
          {systemLogs.length === 0 ? (
            <div className="text-slate-500 text-center py-4">Memuat log aktivitas agent...</div>
          ) : (
            systemLogs.map((log, idx) => (
              <div key={`${log.id}-${log.timestamp}-${idx}`} className="flex items-start gap-3 text-slate-300">
                <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                  log.agent === 'EXECUTOR' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  log.agent === 'BRAIN' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                  log.agent === 'AUTO_TP' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  log.agent === 'DEMO' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                  'bg-slate-800 text-slate-400'
                }`}>
                  {log.agent}
                </span>
                <span className={`${log.level === 'SUCCESS' ? 'text-emerald-300 font-semibold' : log.level === 'ERROR' ? 'text-rose-400' : 'text-slate-300'}`}>
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ERROR ALERT */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => fetchAnalysis(selectedSymbol)} className="text-xs underline font-semibold text-rose-300 hover:text-white">
            Coba Lagi
          </button>
        </div>
      )}

      {/* MARKET RADAR MULTI-TOKEN SUMMARY TABLE */}
      {radarData && radarData.tokens && (
        <section className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListFilter className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">
                Hasil Pemindaian Radar 200+ Koin (Peluang Terbaik)
              </h2>
            </div>
            <div className="text-xs font-mono text-slate-400">
              Total Dipindai: <strong className="text-cyan-400">{radarData.total_scanned} Koin</strong> | Potensial: <strong className="text-emerald-400">{radarData.potential_count} Target</strong>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left font-mono">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Koin / Pasar</th>
                  <th className="py-3.5 px-4">Harga Terkini</th>
                  <th className="py-3.5 px-4">RSI (14)</th>
                  <th className="py-3.5 px-4">Support Fibo 78.6%</th>
                  <th className="py-3.5 px-4">Jarak Fibo %</th>
                  <th className="py-3.5 px-4">Peluang Score</th>
                  <th className="py-3.5 px-4 text-center">Sinyal Radar</th>
                  <th className="py-3.5 px-4 text-right">Aksi AI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {radarData.tokens.map((token, idx) => (
                  <tr
                    key={token.symbol}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      selectedSymbol === token.symbol ? 'bg-cyan-500/10 border-l-2 border-cyan-400' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                      <span>{token.symbol}</span>
                      {idx === 0 && (
                        <span className="px-2 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                          #1 TOP PICK
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-200 font-bold">{formatPrice(token.current_price)}</td>
                    <td className="py-3.5 px-4">
                      <span className={token.signals.is_oversold ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                        {token.metrics.rsi_14}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-indigo-300">{formatPrice(token.metrics.fibonacci.fib_786)}</td>
                    <td className="py-3.5 px-4 text-slate-300">{token.metrics.fibonacci.dist_786_pct}%</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full"
                            style={{ width: `${token.opportunity_score}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-cyan-300 font-bold">{token.opportunity_score}/100</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          token.signals.recommendation_preview === 'STRONG_BUY'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {token.signals.recommendation_preview}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedSymbol(token.symbol);
                          fetchAnalysis(token.symbol);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 text-[11px] font-bold transition-all cursor-pointer"
                      >
                        <span>Analisis AI</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* DETAILED ANALYSIS OF SELECTED TOKEN */}
      {analyzeData && (
        <div className="space-y-8 animate-fadeIn">
          {/* STAT CARDS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-3">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>HARGA SAAT INI ({analyzeData.symbol})</span>
                <TrendingUp className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-extrabold text-white font-mono">
                {formatPrice(analyzeData.market_data.current_price)}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between font-mono pt-2 border-t border-slate-800/60">
                <span>Low: {formatPrice(analyzeData.market_data.range_low)}</span>
                <span>High: {formatPrice(analyzeData.market_data.range_high)}</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-3">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>RSI (14-PERIODE)</span>
                <Gauge className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-extrabold text-white font-mono">
                  {analyzeData.market_data.metrics.rsi_14}
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-lg font-mono font-bold ${
                    analyzeData.market_data.signals.is_oversold
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {analyzeData.market_data.signals.is_oversold ? 'OVERSOLD (<35)' : 'NEUTRAL'}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    analyzeData.market_data.signals.is_oversold ? 'bg-emerald-400' : 'bg-cyan-400'
                  }`}
                  style={{ width: `${Math.min(analyzeData.market_data.metrics.rsi_14, 100)}%` }}
                />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-3">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>FIBONACCI LEVEL</span>
                <Layers className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">61.8% Golden:</span>
                  <span className="text-cyan-300 font-bold">{formatPrice(analyzeData.market_data.metrics.fibonacci.fib_618)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">78.6% Support:</span>
                  <span className="text-indigo-300 font-bold">{formatPrice(analyzeData.market_data.metrics.fibonacci.fib_786)}</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
                Dist 786: <strong className="text-slate-200">{analyzeData.market_data.metrics.fibonacci.dist_786_pct}%</strong>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>KEPUTUSAN AI</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div>{getDecisionBadge(analyzeData.analysis.decision)}</div>
              <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>Gemini 3.6 Flash Engine</span>
              </div>
            </div>
          </div>

          {/* AI REASONING NARRATIVE & ORDER CONTROLS */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Narasi Analisis AI ({analyzeData.symbol})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Senior Web3 AI Analyst Engine (Live Gemini 3.6 Flash Reasoning)
                  </p>
                </div>
              </div>
              <div>{getDecisionBadge(analyzeData.analysis.decision)}</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-300 text-sm leading-relaxed space-y-2">
              <p className="italic">"{analyzeData.analysis.reasoning}"</p>
            </div>

            {/* MODE MANUAL: CUSTOM PURCHASE INPUT PANEL */}
            {currentMode === "MANUAL" ? (
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                    <Hand className="w-4 h-4 text-amber-400" />
                    <span>KONTROL PEMBELIAN MANUAL (MODE MANUAL)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Pilih/Ketik Nominal tBNB</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {[0.01, 0.05, 0.1].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setCustomBuyAmount(preset)}
                        className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                          customBuyAmount === preset
                            ? "bg-amber-500 text-slate-950 font-extrabold shadow-md"
                            : "bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800"
                        }`}
                      >
                        {preset} tBNB
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-64">
                    <input
                      type="number"
                      step="0.001"
                      min="0.001"
                      max="5.0"
                      value={customBuyAmount}
                      onChange={(e) => setCustomBuyAmount(parseFloat(e.target.value) || 0.05)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-xs font-mono text-slate-400">tBNB</span>
                  </div>

                  <button
                    onClick={() => executeManualBuySwap(selectedSymbol, customBuyAmount)}
                    disabled={loading}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <Zap className="w-4 h-4 text-slate-950" />
                    <span>BELI MANUAL ({customBuyAmount} tBNB)</span>
                  </button>
                </div>
              </div>
            ) : (
              /* MODE FULL CONTROL AI: EXECUTOR LINK / AUTO STATUS */
              explorerLink ? (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-blue-500/10 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Eksekusi Auto-Pilot AI Berhasil Disiarkan ke BSC Testnet!</span>
                    </div>
                  </div>

                  {txHash && (
                    <div className="text-xs font-mono text-slate-400 truncate">
                      Tx Hash: <span className="text-slate-200">{txHash}</span>
                    </div>
                  )}

                  <a
                    href={explorerLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
                  >
                    <span>View Transaction on BscScan</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs font-mono space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Status Eksekusi On-Chain Auto-Pilot:</span>
                    <span className="text-slate-300 font-bold">
                      {analyzeData.execution?.status?.toUpperCase() || 'INFO'}
                    </span>
                  </div>
                  <p className="text-slate-300 break-words text-[11px] leading-normal pt-1 border-t border-slate-800/50">
                    {analyzeData.execution?.reason || 'Mode Full Control AI aktif: Transaksi Beli otomatis dipicu saat sinyal STRONG_BUY.'}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
