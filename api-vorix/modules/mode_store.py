import os
import json
import logging
from typing import Dict, Any

logger = logging.getLogger("VORIX-ModeStore")

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
MODE_FILE = os.path.join(DATA_DIR, "system_mode.json")

DEFAULT_MODE_DATA = {
    "mode": "MANUAL",  # "MANUAL" or "FULL_CONTROL_AI"
    "auto_tp_pct": 15.0,
    "auto_sl_pct": 10.0,
    "default_buy_bnb": 0.002,
    "last_updated": ""
}

def _ensure_mode_file():
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(MODE_FILE):
        with open(MODE_FILE, "w", encoding="utf-8") as f:
            json.dump(DEFAULT_MODE_DATA, f, indent=2)

def get_system_mode() -> Dict[str, Any]:
    _ensure_mode_file()
    try:
        with open(MODE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error reading system mode: {e}")
        return DEFAULT_MODE_DATA

def set_system_mode(mode: str, default_buy_bnb: float = 0.05) -> Dict[str, Any]:
    _ensure_mode_file()
    clean_mode = str(mode).upper().strip()
    if clean_mode not in ["MANUAL", "FULL_CONTROL_AI"]:
        clean_mode = "MANUAL"
        
    current_data = get_system_mode()
    current_data["mode"] = clean_mode
    current_data["default_buy_bnb"] = default_buy_bnb
    
    try:
        with open(MODE_FILE, "w", encoding="utf-8") as f:
            json.dump(current_data, f, indent=2)
        logger.info(f"System mode updated to: {clean_mode}")
    except Exception as e:
        logger.error(f"Error saving system mode: {e}")
        
    return current_data
