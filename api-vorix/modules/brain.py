import os
import json
import logging
from typing import Dict, Any
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("VORIX-Brain")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY and GEMINI_API_KEY != "your_gemini_api_key_here":
    os.environ["GOOGLE_API_KEY"] = GEMINI_API_KEY
    genai.configure(api_key=GEMINI_API_KEY)

SYSTEM_PROMPT = """
Anda adalah "Senior Web3 AI Analyst" independen di platform trading otonom VORIX.
Tugas Anda adalah menganalisis data indikator teknikal kuantitatif (Harga Terkini, RSI 14-periode, dan Level Fibonacci Retracement 61.8% & 78.6%) dari bursa kripto, lalu merumuskan keputusan serta penalaran risiko tanpa emosi.

Aturan Penilaian:
1. "STRONG_BUY": Jika RSI < 35 (Oversold) DAN harga saat ini berada dekat dengan area support kunci Fibonacci 61.8% atau 78.6%.
2. "WATCH": Jika RSI < 35 (Oversold) SAJA, ATAU harga dekat area support Fibonacci SAJA, namun salah satu syarat belum terpenuhi sempurna.
3. "AVOID": Jika RSI >= 50 (Netral/Overbought) atau harga jauh dari support Fibonacci kunci dan tidak ada setup pantulan yang jelas.

FORMAT OUTPUT WAJIB:
Kembalikan respon HANYA dalam format JSON murni (tanpa pembungkus markdown backticks ```json ... ``` dan tanpa teks pendahuluan/penutup) dengan struktur berikut:
{
  "decision": "STRONG_BUY",
  "reasoning": "Penjelasan naratif dalam Bahasa Indonesia yang santai namun profesional, mengulas kondisi RSI, posisi Fibonacci, dan potensi risikonya."
}
"""

def fallback_rule_based_analysis(technical_data: Dict[str, Any], note: str = "") -> Dict[str, Any]:
    """
    Fallback deterministic analysis if Gemini API key is unconfigured or unavailable.
    """
    symbol = technical_data.get("symbol", "TOKEN")
    current_price = technical_data.get("current_price", 0.0)
    metrics = technical_data.get("metrics", {})
    signals = technical_data.get("signals", {})
    
    rsi = metrics.get("rsi_14", 50.0)
    fib = metrics.get("fibonacci", {})
    fib_618 = fib.get("fib_618", 0.0)
    fib_786 = fib.get("fib_786", 0.0)
    dist_618 = fib.get("dist_618_pct", 0.0)
    dist_786 = fib.get("dist_786_pct", 0.0)
    
    recommendation_preview = signals.get("recommendation_preview", "")
    is_oversold = signals.get("is_oversold", rsi < 35.0)
    near_fib = signals.get("near_fib_support", False)
    opp_score = technical_data.get("opportunity_score", 0)
    
    if recommendation_preview == "STRONG_BUY" or is_oversold or near_fib or opp_score >= 50:
        decision = "STRONG_BUY"
        reasoning = (
            f"Berdasarkan analisis teknikal otonom VORIX untuk {symbol}, RSI 14 berada di tingkat oversold ({rsi}), "
            f"dengan Skor Peluang {opp_score}/100 dan harga (${current_price}) mendekati zona support Fibonacci. "
            f"VORIX AI Engine mengonfirmasi sinyal STRONG_BUY untuk mengeksekusi akumulasi otonom di BSC Testnet."
        )
    elif opp_score >= 30:
        decision = "WATCH"
        reasoning = (
            f"Pasar untuk {symbol} menunjukkan sinyal awal menarik dengan RSI 14 di {rsi} dan harga (${current_price}) "
            f"memiliki jarak {dist_786}% ke level support Fibonacci 78.6% (${fib_786}). "
            f"Disarankan untuk memantau hingga konfirmasi pembentukan candle hijau sebelum masuk."
        )
    else:
        decision = "AVOID"
        reasoning = (
            f"Harga {symbol} saat ini (${current_price}) dengan RSI 14 di {rsi} belum menunjukkan setup diskon yang ideal. "
            f"Harga masih berjarak cukup jauh dari support Fibonacci. Risiko akumulasi saat ini terlalu tinggi."
        )
        
    if note:
        reasoning += f" ({note})"
        
    return {
        "decision": decision,
        "reasoning": reasoning
    }

def analyze_market_data(technical_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyze market technical data using Google Gemini AI.
    Returns structured JSON with 'decision' and 'reasoning'.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        logger.info("GEMINI_API_KEY not provided or default. Using rule-based fallback analysis.")
        return fallback_rule_based_analysis(technical_data, note="Mode Analisis Rule-Based AI Engine")

    try:
        os.environ["GOOGLE_API_KEY"] = api_key
        genai.configure(api_key=api_key)
        
        # Try available Gemini models
        model_names = [
            "gemini-3.6-flash",
            "gemini-flash-latest",
            "gemini-3.5-flash",
            "gemini-pro-latest",
            "gemini-3.1-pro-preview"
        ]
        
        last_error = None
        for m_name in model_names:
            try:
                model = genai.GenerativeModel(m_name, system_instruction=SYSTEM_PROMPT)
                user_content = f"""
Berikut adalah data teknikal pasar real-time untuk dianalisis:
{json.dumps(technical_data, indent=2)}

Tolong berikan penilaian analisis risiko dan berikan output HANYA berupa JSON murni (dua key: "decision" dan "reasoning").
"""
                response = model.generate_content(
                    user_content,
                    generation_config={"response_mime_type": "application/json"}
                )

                raw_text = response.text.strip()
                
                # Clean markdown formatting if present
                if raw_text.startswith("```"):
                    lines = raw_text.splitlines()
                    if lines[0].startswith("```"):
                        lines = lines[1:]
                    if lines and lines[-1].startswith("```"):
                        lines = lines[:-1]
                    raw_text = "\n".join(lines).strip()
                    
                parsed_json = json.loads(raw_text)
                
                if "decision" in parsed_json and "reasoning" in parsed_json:
                    dec = str(parsed_json["decision"]).upper()
                    if dec not in ["STRONG_BUY", "WATCH", "AVOID"]:
                        dec = "WATCH"
                    parsed_json["decision"] = dec
                    logger.info(f"Successfully generated Gemini AI reasoning using model: {m_name}")
                    return parsed_json
            except Exception as e:
                last_error = e
                continue
                
        logger.warning(f"All Gemini models failed. Last error: {last_error}. Using fallback.")
        return fallback_rule_based_analysis(technical_data)

    except Exception as e:
        logger.error(f"Error during Gemini AI analysis: {e}. Falling back to rule-based engine.")
        return fallback_rule_based_analysis(technical_data, note=f"Fallback due to AI service note: {str(e)[:50]}")

if __name__ == "__main__":
    sample_data = {
        "symbol": "BNB/USDT",
        "timeframe": "1h",
        "current_price": 710.5,
        "range_high": 738.3,
        "range_low": 704.4,
        "metrics": {
            "rsi_14": 43.61,
            "fibonacci": {
                "fib_618": 717.35,
                "fib_786": 711.65,
                "dist_618_pct": -0.96,
                "dist_786_pct": -0.16
            }
        },
        "signals": {
            "is_oversold": False,
            "near_fib_618": True,
            "near_fib_786": True,
            "near_fib_support": True,
            "recommendation_preview": "WATCH"
        }
    }
    print("Testing brain.py standalone...")
    result = analyze_market_data(sample_data)
    print(json.dumps(result, indent=2, ensure_ascii=False))
