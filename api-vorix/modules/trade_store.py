import os
import json
import logging
from datetime import datetime
from typing import Dict, Any, List

logger = logging.getLogger("VORIX-TradeStore")

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
HOLDINGS_FILE = os.path.join(DATA_DIR, "holdings.json")
TRADES_FILE = os.path.join(DATA_DIR, "trades.json")

def _ensure_data_files():
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(HOLDINGS_FILE):
        # Initial seed holding (DOGE token purchased on BSC Testnet)
        initial_holdings = [
            {
                "symbol": "DOGE/USDT",
                "name": "Dogecoin",
                "contract_address": "0xBa2aE424d960c26247Dd6c32edC70B295c744C43",
                "amount": 150.0,
                "buy_price": 0.385,
                "total_invested_bnb": 0.05,
                "buy_timestamp": datetime.now().isoformat(),
                "auto_tp": True,
                "auto_sl": True,
                "tp_target": 0.45,
                "sl_target": 0.34
            }
        ]
        with open(HOLDINGS_FILE, "w", encoding="utf-8") as f:
            json.dump(initial_holdings, f, indent=2)

    if not os.path.exists(TRADES_FILE):
        # Initial seed trades
        initial_trades = [
            {
                "id": "tx_seed_001",
                "date": datetime.now().strftime("%Y-%m-%d"),
                "timestamp": datetime.now().isoformat(),
                "symbol": "DOGE/USDT",
                "type": "BUY",
                "price": 0.385,
                "amount": 150.0,
                "total_bnb": 0.05,
                "pnl_usd": 12.50,
                "pnl_pct": 14.8,
                "status": "COMPLETED",
                "tx_hash": "0x8f2d5e9a1b4c3d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e"
            },
            {
                "id": "tx_seed_002",
                "date": datetime.now().strftime("%Y-%m-%d"),
                "timestamp": datetime.now().isoformat(),
                "symbol": "BNB/USDT",
                "type": "BUY",
                "price": 705.20,
                "amount": 0.05,
                "total_bnb": 0.05,
                "pnl_usd": 5.40,
                "pnl_pct": 3.2,
                "status": "COMPLETED",
                "tx_hash": "0xa1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0"
            }
        ]
        with open(TRADES_FILE, "w", encoding="utf-8") as f:
            json.dump(initial_trades, f, indent=2)

DEFAULT_SEED_HOLDINGS = [
    {
        "symbol": "DOGE/USDT",
        "name": "Dogecoin",
        "contract_address": "0xBa2aE424d960c26247Dd6c32edC70B295c744C43",
        "amount": 150.0,
        "buy_price": 0.385,
        "total_invested_bnb": 0.05,
        "buy_timestamp": datetime.now().isoformat(),
        "auto_tp": True,
        "auto_sl": True,
        "tp_target": 0.45,
        "sl_target": 0.34
    }
]

def reset_holdings() -> List[Dict[str, Any]]:
    save_holdings(DEFAULT_SEED_HOLDINGS)
    return DEFAULT_SEED_HOLDINGS

def get_holdings() -> List[Dict[str, Any]]:
    _ensure_data_files()
    try:
        with open(HOLDINGS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except Exception as e:
        logger.error(f"Error reading holdings: {e}")
        return []

def save_holdings(holdings: List[Dict[str, Any]]) -> bool:
    _ensure_data_files()
    try:
        with open(HOLDINGS_FILE, "w", encoding="utf-8") as f:
            json.dump(holdings, f, indent=2)
        return True
    except Exception as e:
        logger.error(f"Error saving holdings: {e}")
        return False

def add_holding(symbol: str, name: str, contract_address: str, amount: float, buy_price: float, total_bnb: float) -> List[Dict[str, Any]]:
    holdings = get_holdings()
    existing = False
    for h in holdings:
        if h["symbol"] == symbol:
            h["amount"] += amount
            h["total_invested_bnb"] += total_bnb
            h["buy_price"] = buy_price
            existing = True
            break
            
    if not existing:
        holdings.append({
            "symbol": symbol,
            "name": name,
            "contract_address": contract_address,
            "amount": amount,
            "buy_price": buy_price,
            "total_invested_bnb": total_bnb,
            "buy_timestamp": datetime.now().isoformat(),
            "auto_tp": True,
            "auto_sl": True,
            "tp_target": round(buy_price * 1.15, 4),
            "sl_target": round(buy_price * 0.90, 4)
        })
        
    save_holdings(holdings)
    return holdings

def get_trade_history() -> List[Dict[str, Any]]:
    _ensure_data_files()
    try:
        with open(TRADES_FILE, "r", encoding="utf-8") as f:
            trades = json.load(f)
            trades.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
            return trades
    except Exception as e:
        logger.error(f"Error reading trades: {e}")
        return []

def record_trade(trade_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    _ensure_data_files()
    try:
        trades = get_trade_history()
        if "id" not in trade_data:
            trade_data["id"] = f"tx_{int(datetime.now().timestamp())}"
        if "date" not in trade_data:
            trade_data["date"] = datetime.now().strftime("%Y-%m-%d")
        if "timestamp" not in trade_data:
            trade_data["timestamp"] = datetime.now().isoformat()
            
        trades.insert(0, trade_data)
        with open(TRADES_FILE, "w", encoding="utf-8") as f:
            json.dump(trades, f, indent=2)
        return trades
    except Exception as e:
        logger.error(f"Error recording trade: {e}")
        return []

def remove_holding(symbol: str) -> List[Dict[str, Any]]:
    holdings = get_holdings()
    new_holdings = [h for h in holdings if h["symbol"] != symbol]
    save_holdings(new_holdings)
    return new_holdings

def get_daily_summary() -> Dict[str, Any]:
    trades = get_trade_history()
    today_str = datetime.now().strftime("%Y-%m-%d")
    
    today_trades = [t for t in trades if t.get("date") == today_str]
    total_trades_today = len(today_trades)
    
    today_pnl_usd = sum(t.get("pnl_usd", 0.0) for t in today_trades)
    total_volume_bnb = sum(t.get("total_bnb", 0.0) for t in today_trades)
    
    winning_trades = [t for t in trades if t.get("pnl_usd", 0.0) > 0]
    win_rate = round((len(winning_trades) / len(trades)) * 100, 1) if trades else 0.0
    
    return {
        "today_date": today_str,
        "total_trades_today": total_trades_today,
        "today_pnl_usd": round(today_pnl_usd, 2),
        "total_volume_bnb": round(total_volume_bnb, 4),
        "win_rate_pct": win_rate,
        "total_trades_all_time": len(trades)
    }
