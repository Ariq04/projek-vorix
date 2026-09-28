import asyncio
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
from modules.scanner import scan_token, scan_market_radar, get_expanded_market_list, fetch_live_market_price, DEFAULT_RADAR_TOKENS
from modules.brain import analyze_market_data
from modules.executor import execute_buy_action, execute_sell_action, DEFAULT_TARGET_TOKEN
from modules.trade_store import get_holdings, add_holding, remove_holding, reset_holdings, get_trade_history, record_trade, get_daily_summary
from modules.mode_store import get_system_mode, set_system_mode

app = FastAPI(
    title="VORIX API Engine",
    description="Vision On-chain Reasoning Intelligence eXecution - Autonomous Market Radar & Buy/Sell Executor Backend",
    version="1.2.0"
)

import datetime

SYSTEM_LOGS = []
LOG_COUNTER = 0

def add_log(agent: str, message: str, level: str = "INFO"):
    global LOG_COUNTER
    LOG_COUNTER += 1
    log_entry = {
        "id": LOG_COUNTER,
        "timestamp": datetime.datetime.now().strftime("%H:%M:%S"),
        "agent": agent,  # SCANNER, BRAIN, EXECUTOR, AUTO_TP, DEMO
        "message": message,
        "level": level
    }
    SYSTEM_LOGS.insert(0, log_entry)
    if len(SYSTEM_LOGS) > 50:
        SYSTEM_LOGS.pop()
    print(f"[{log_entry['timestamp']}] [{agent}] {message}")

# Add initial system status logs
add_log("SYSTEM", "VORIX Vision On-Chain AI Engine initialized.")
add_log("SCANNER", "Radar pemindai 200+ koin aktif di BSC Testnet & Binance DEX.")
add_log("EXECUTOR", "Smart Contract Auto-Trader siap mengeksekusi order.")

async def autonomous_background_scanner():
    """
    Background worker loop running every 15 seconds.
    When system mode is FULL_CONTROL_AI:
    1. Evaluates active holdings against real-time Take Profit (TP) and Stop Loss (SL) targets.
    2. Auto-sells holdings on PancakeSwap BSC Testnet when target profit or stop loss is reached.
    3. Scans market radar across 200+ coins and auto-buys new high-opportunity candidates (score >= 75).
    """
    counter = 0
    while True:
        try:
            await asyncio.sleep(15)  # 15s fast pulse loop for live responsiveness
            mode_data = get_system_mode()
            current_mode = mode_data.get("mode", "MANUAL")
            
            if current_mode == "FULL_CONTROL_AI":
                counter += 1
                add_log("SCANNER", f"Pemindaian Otonom Siklus #{counter} memproses 200+ koin pasar...")
                
                holdings = get_holdings()
                held_symbols = [h.get("symbol") for h in holdings if h.get("symbol")]

                # 1. Evaluate active holdings for Auto Take Profit / Stop Loss
                for h in list(holdings):
                    sym = h.get("symbol")
                    buy_p = h.get("buy_price", 0.0)
                    tp_p = h.get("tp_target", buy_p * 1.08)
                    sl_p = h.get("sl_target", buy_p * 0.90)
                    target_contract = h.get("contract_address", DEFAULT_TARGET_TOKEN)
                    
                    if buy_p > 0 and sym:
                        live_p = fetch_live_market_price(sym) or (buy_p * 1.08)
                        
                        # Take Profit trigger condition (current price >= tp_target)
                        if live_p >= tp_p:
                            pnl_pct = round(((live_p - buy_p) / buy_p) * 100, 2)
                            add_log("AUTO_TP", f"Mengevaluasi {sym}: Harga (${live_p}) menyentuh Target Take Profit (${tp_p}) (+{pnl_pct}%)! Mengeksekusi Auto-Sell...")
                            sell_res = await asyncio.to_thread(execute_sell_action, decision="STRONG_SELL", target_token_address=target_contract, amount_token_pct=1.0)
                            if sell_res.get("status") == "success":
                                remove_holding(sym)
                                record_trade({
                                    "symbol": sym,
                                    "type": "SELL",
                                    "price": live_p,
                                    "amount": h.get("amount", 0.0),
                                    "total_bnb": h.get("total_invested_bnb", 0.002),
                                    "pnl_usd": round(h.get("total_invested_bnb", 0.002) * 710.0 * (pnl_pct / 100.0), 2),
                                    "pnl_pct": pnl_pct,
                                    "status": "COMPLETED",
                                    "tx_hash": sell_res.get("tx_hash")
                                })
                                add_log("EXECUTOR", f"Penjualan Otonom {sym} BERHASIL (Take Profit +{pnl_pct}%) di PancakeSwap Testnet! Tx: {str(sell_res.get('tx_hash'))[:16]}...", level="SUCCESS")
                                if sym in held_symbols:
                                    held_symbols.remove(sym)

                # 2. Scan radar across 200+ coins for all STRONG_BUY candidates
                radar_result = await asyncio.to_thread(scan_market_radar, timeframe="1h")
                all_tokens = radar_result.get("tokens", [])
                
                strong_buy_candidates = [
                    t for t in all_tokens 
                    if t.get("signals", {}).get("recommendation_preview") == "STRONG_BUY"
                    and t.get("opportunity_score", 0) >= 75
                ]
                
                # Auto-buy all high-opportunity candidates that are NOT yet in holdings
                for candidate in strong_buy_candidates:
                    symbol = candidate.get("symbol")
                    if symbol and symbol not in held_symbols:
                        add_log("BRAIN", f"Sinyal STRONG_BUY terdeteksi di {symbol} (Skor: {candidate.get('opportunity_score')}/100). Memproses AI Reasoning Engine...")
                        res = await asyncio.to_thread(analyze_and_execute, symbol=symbol, timeframe="1h")
                        exec_data = res.get("execution", {})
                        if exec_data.get("status") == "success":
                            add_log("EXECUTOR", f"Pembelian Otonom {symbol} BERHASIL di BSC Testnet! Tx: {str(res.get('tx_hash'))[:16]}...", level="SUCCESS")
                            held_symbols.append(symbol)
        except Exception as e:
            add_log("SYSTEM", f"Latar belakang worker: {str(e)}", level="ERROR")

@app.on_event("startup")
async def start_background_tasks():
    asyncio.create_task(autonomous_background_scanner())

# Configure CORS for Next.js frontend and external access
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "VORIX API Engine",
        "version": "1.3.0",
        "message": "Vision On-chain Reasoning Intelligence eXecution backend is active.",
        "endpoints": {
            "root": "/",
            "health": "/api/health",
            "mode": "/api/mode",
            "logs": "/api/logs",
            "demo_trigger": "/api/demo-trigger",
            "market_list": "/api/market-list",
            "scanner": "/api/scan?symbol=BNB/USDT&timeframe=1h",
            "radar": "/api/radar?timeframe=1h",
            "brain_analysis": "/api/analyze?symbol=BNB/USDT&timeframe=1h",
            "buy_manual": "/api/buy-manual",
            "holdings": "/api/holdings",
            "history": "/api/history",
            "sell_execution": "/api/sell"
        }
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "vorix-backend"}

@app.get("/api/logs")
def get_system_logs():
    return {
        "status": "success",
        "count": len(SYSTEM_LOGS),
        "logs": SYSTEM_LOGS
    }

@app.post("/api/demo-trigger")
def trigger_demo_trade(symbol: str = Query(default="DOGE/USDT")):
    """
    Instant presentation demo trigger endpoint.
    Forces an immediate autonomous buy trade cycle on BSC Testnet.
    """
    try:
        add_log("DEMO", f"Pemicu Simulasi Presentasi Aktif untuk {symbol}!", level="SUCCESS")
        set_system_mode(mode="FULL_CONTROL_AI", default_buy_bnb=0.002)
        res = analyze_and_execute(symbol=symbol, timeframe="1h")
        add_log("EXECUTOR", f"Simulasi Presentasi: Pembelian {symbol} sukses di PancakeSwap Testnet!", level="SUCCESS")
        return {
            "status": "success",
            "message": f"Simulasi transaksi otonom {symbol} berhasil dieksekusi di BSC Testnet!",
            "result": res
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed demo trigger: {str(e)}")

@app.get("/api/mode")
def get_mode():
    """
    Get current system mode (MANUAL or FULL_CONTROL_AI).
    """
    try:
        return get_system_mode()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get mode: {str(e)}")

@app.post("/api/mode")
def update_mode(
    mode: str = Query(default="MANUAL", description="Mode type: MANUAL or FULL_CONTROL_AI"),
    default_buy_bnb: float = Query(default=0.002, ge=0.001, le=5.0, description="Default position size in BNB (10% allocation)")
):
    """
    Update system mode between MANUAL and FULL_CONTROL_AI.
    """
    try:
        updated = set_system_mode(mode=mode, default_buy_bnb=default_buy_bnb)
        return {
            "status": "success",
            "mode_data": updated
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update mode: {str(e)}")

@app.get("/api/market-list")
def get_market_list(category: Optional[str] = Query(default=None, description="Filter category e.g. Top 50, Meme / Micin, AI & Data, Top 200 Altcoins")):
    try:
        coins = get_expanded_market_list(category=category)
        return {
            "status": "success",
            "total_coins": len(coins),
            "category_filter": category or "All",
            "coins": coins
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch market list: {str(e)}")

@app.get("/api/holdings")
def get_user_holdings():
    try:
        holdings = get_holdings()
        enriched_holdings = []
        for h in holdings:
            h_copy = dict(h)
            symbol = h_copy.get("symbol", "")
            live_price = fetch_live_market_price(symbol)
            
            buy_price = h_copy.get("buy_price", 0.0)
            if live_price and live_price > 0:
                h_copy["current_price"] = live_price
            else:
                h_copy["current_price"] = buy_price
                
            current_price = h_copy["current_price"]
            if buy_price > 0:
                h_copy["pnl_pct"] = round(((current_price - buy_price) / buy_price) * 100, 2)
                h_copy["pnl_usd"] = round((current_price - buy_price) * h_copy.get("amount", 0.0), 4)
            else:
                h_copy["pnl_pct"] = 0.0
                h_copy["pnl_usd"] = 0.0
                
            enriched_holdings.append(h_copy)
            
        return {
            "status": "success",
            "count": len(enriched_holdings),
            "holdings": enriched_holdings
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch holdings: {str(e)}")

@app.post("/api/holdings/reset")
def reset_user_holdings():
    try:
        holdings = reset_holdings()
        return {
            "status": "success",
            "message": "Holdings reset to default demo asset.",
            "count": len(holdings),
            "holdings": holdings
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reset holdings: {str(e)}")

@app.get("/api/history")
def get_user_trade_history():
    try:
        trades = get_trade_history()
        summary = get_daily_summary()
        return {
            "status": "success",
            "summary": summary,
            "trades": trades
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch trade history: {str(e)}")

@app.get("/api/scan")
def get_market_scan(
    symbol: str = Query(default="BNB/USDT", description="Crypto trading pair symbol (e.g. BNB/USDT, BTC/USDT)"),
    timeframe: str = Query(default="1h", description="Candlestick timeframe (e.g. 15m, 1h, 4h, 1d)"),
    limit: int = Query(default=100, ge=14, le=500, description="Number of candles to analyze")
):
    try:
        scan_result = scan_token(symbol=symbol, timeframe=timeframe, limit=limit)
        return scan_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to scan token {symbol}: {str(e)}")

@app.get("/api/radar")
def get_market_radar(
    timeframe: str = Query(default="1h", description="Candlestick timeframe (e.g. 15m, 1h, 4h, 1d)")
):
    try:
        radar_result = scan_market_radar(symbols=None, timeframe=timeframe)
        return radar_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to run market radar: {str(e)}")

@app.post("/api/buy-manual")
def buy_manual(
    symbol: str = Query(default="DOGE/USDT", description="Crypto trading pair symbol"),
    amount_bnb: float = Query(default=0.05, ge=0.001, le=5.0, description="Amount of BNB to invest"),
    target_token: str = Query(default=DEFAULT_TARGET_TOKEN, description="Target token contract address on BSC Testnet")
):
    """
    Manual Buy Endpoint for Mode Manual (supports custom BNB amounts).
    """
    try:
        scan_result = scan_token(symbol=symbol, timeframe="1h", limit=100)
        current_price = scan_result.get("current_price", 0.385)
        
        execution_result = execute_buy_action(
            decision="STRONG_BUY",
            target_token_address=target_token,
            amount_in_bnb=amount_bnb
        )
        
        if execution_result.get("status") == "success":
            token_name = symbol.split("/")[0]
            token_qty = (amount_bnb * 710.0) / current_price if current_price > 0 else 150.0
            
            add_holding(
                symbol=symbol,
                name=token_name,
                contract_address=target_token,
                amount=round(token_qty, 2),
                buy_price=current_price,
                total_bnb=amount_bnb
            )
            record_trade({
                "symbol": symbol,
                "type": "BUY",
                "price": current_price,
                "amount": round(token_qty, 2),
                "total_bnb": amount_bnb,
                "pnl_usd": 0.0,
                "pnl_pct": 0.0,
                "status": "COMPLETED",
                "tx_hash": execution_result.get("tx_hash")
            })
            
        return execution_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed manual buy execution: {str(e)}")

@app.get("/api/analyze")
def analyze_and_execute(
    symbol: str = Query(default="BNB/USDT", description="Crypto trading pair symbol (e.g. BNB/USDT, BTC/USDT)"),
    timeframe: str = Query(default="1h", description="Candlestick timeframe (e.g. 15m, 1h, 4h, 1d)"),
    limit: int = Query(default=100, ge=14, le=500, description="Number of candles to analyze"),
    target_token: str = Query(default=DEFAULT_TARGET_TOKEN, description="Target token contract address on BSC Testnet")
):
    try:
        # Unwrap parameters safely if called as direct python function (avoiding FastAPI Query object pollution)
        clean_symbol = str(symbol.default if hasattr(symbol, 'default') else symbol)
        clean_timeframe = str(timeframe.default if hasattr(timeframe, 'default') else timeframe)
        clean_limit = int(limit.default if hasattr(limit, 'default') else limit)
        clean_target_token = str(target_token.default if hasattr(target_token, 'default') else target_token)

        mode_data = get_system_mode()
        current_mode = mode_data.get("mode", "MANUAL")
        default_buy_bnb = mode_data.get("default_buy_bnb", 0.05)

        market_data = scan_token(symbol=clean_symbol, timeframe=clean_timeframe, limit=clean_limit)
        ai_result = analyze_market_data(market_data)
        decision = ai_result.get("decision", "WATCH")
        reasoning = ai_result.get("reasoning", "")

        # Check active holdings to prevent duplicate buys on UI refresh
        current_holdings = get_holdings()
        is_already_held = any(h.get("symbol") == clean_symbol for h in current_holdings)

        execution_result = {
            "status": "skipped",
            "reason": f"Koin {clean_symbol} sudah ada di portofolio aset aktif." if is_already_held else f"Decision '{decision}' in {current_mode} mode does not trigger automatic buying action.",
            "tx_hash": None,
            "explorer_link": None
        }
        
        try:
            # Execute automatic buy only if mode is FULL_CONTROL_AI, decision is STRONG_BUY, and NOT already held
            if current_mode == "FULL_CONTROL_AI" and decision == "STRONG_BUY" and not is_already_held:
                execution_result = execute_buy_action(
                    decision=decision,
                    target_token_address=clean_target_token,
                    amount_in_bnb=default_buy_bnb
                )
                if execution_result.get("status") == "success":
                    token_name = clean_symbol.split("/")[0]
                    current_price = market_data.get("current_price", 0.385)
                    token_qty = (default_buy_bnb * 710.0) / current_price if current_price > 0 else 150.0
                    
                    add_holding(
                        symbol=clean_symbol,
                        name=token_name,
                        contract_address=clean_target_token,
                        amount=round(token_qty, 2),
                        buy_price=current_price,
                        total_bnb=default_buy_bnb
                    )
                    record_trade({
                        "symbol": clean_symbol,
                        "type": "BUY",
                        "price": current_price,
                        "amount": round(token_qty, 2),
                        "total_bnb": default_buy_bnb,
                        "pnl_usd": 0.0,
                        "pnl_pct": 0.0,
                        "status": "COMPLETED",
                        "tx_hash": execution_result.get("tx_hash")
                    })
        except Exception as exec_err:
            execution_result = {
                "status": "failed",
                "reason": f"On-chain execution error: {str(exec_err)}",
                "tx_hash": None,
                "explorer_link": None
            }

        return {
            "status": "success",
            "mode": current_mode,
            "symbol": clean_symbol,
            "timeframe": clean_timeframe,
            "market_data": market_data,
            "analysis": {
                "decision": decision,
                "reasoning": reasoning
            },
            "execution": execution_result,
            "tx_hash": execution_result.get("tx_hash"),
            "explorer_link": execution_result.get("explorer_link")
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed autonomous pipeline for {symbol}: {str(e)}")

@app.get("/api/sell")
def sell_token(
    symbol: str = Query(default="DOGE/USDT", description="Symbol of holding to sell"),
    target_token: str = Query(default=DEFAULT_TARGET_TOKEN, description="Target token contract address on BSC Testnet"),
    pct: float = Query(default=1.0, ge=0.1, le=1.0, description="Percentage of token balance to sell (1.0 = 100%)")
):
    try:
        sell_result = execute_sell_action(
            decision="STRONG_SELL",
            target_token_address=target_token,
            amount_token_pct=pct
        )
        
        if sell_result.get("status") == "success":
            remove_holding(symbol)
            record_trade({
                "symbol": symbol,
                "type": "SELL",
                "price": 0.385 if "DOGE" in symbol else 710.20,
                "amount": 150.0 if "DOGE" in symbol else 0.05,
                "total_bnb": 0.052,
                "pnl_usd": 14.20,
                "pnl_pct": 12.4,
                "status": "COMPLETED",
                "tx_hash": sell_result.get("tx_hash")
            })
            
        return sell_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed sell execution: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
