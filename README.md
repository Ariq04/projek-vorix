# 🚀 VORIX — Autonomous AI Agent Trading & Portfolio Manager on BNB Chain

[![BNB Smart Chain](https://img.shields.io/badge/BNB_Chain-Testnet_ChainID_97-F3BA2F?style=for-the-badge&logo=binance&logoColor=black)](https://testnet.bscscan.com/)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python_3.10+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Google Gemini AI](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

**VORIX** is an autonomous AI agent designed for **Indonesia Web3 Hackathon (AI Agents Track)**. It continuously scans crypto and meme tokens on BNB Chain, analyzes market sentiment using Google Gemini 2.5 Flash, dynamically sizes positions, and automatically executes DEX swap transactions on-chain via Web3.py.

---

## 🌟 Key Features

1. **🤖 Autonomous AI Sentiment & Technical Analysis**
   - Integrates Google Gemini 2.5 Flash to evaluate real-time token price action, volume surges, and social sentiment.
   - Generates actionable trade confidence scores and directional signals (`BUY`, `SELL`, `HOLD`).

2. **⚡ On-Chain DEX Trading Engine (BNB Chain Testnet)**
   - Executes autonomous token swaps via PancakeSwap V2 Router (`0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3`).
   - Automated gas management maintaining a minimum safety buffer of `0.001 tBNB` for non-stop execution.

3. **🛡️ Dynamic Risk & Position Sizing**
   - Allocates 10–15% of available wallet balance per trade to enforce prudent risk management.
   - Real-time Portfolio sync tracking positions, PnL ($), win rate %, and trading volume.

4. **📊 Institutional Dashboard UI**
   - Built with Next.js 15, Tailwind CSS, and Lucide Icons with sleek dark mode aesthetics.
   - Micro-cap price formatting (supports prices down to 8 decimal places `$0.00000438`).
   - Interactive Historical Trade Audit log with date filtering and live BscScan transaction hash links.

---

## 🏗️ Architecture Overview

```
 ┌─────────────────────────────────────────────────────────┐
 │                   VORIX Web Dashboard                   │
 │       Next.js 15 + React 19 + TypeScript + Tailwind     │
 └────────────────────────────┬────────────────────────────┘
                              │ Dynamic API REST / WebSocket
 ┌────────────────────────────▼────────────────────────────┐
 │                    VORIX FastAPI Engine                 │
 │       Python 3.10+ + Web3.py + Autonomous Worker        │
 └─────────────┬─────────────────────────────┬─────────────┘
               │                             │
 ┌─────────────▼─────────────┐ ┌─────────────▼─────────────┐
 │    Google Gemini 2.5      │ │      BNB Smart Chain      │
 │  AI Reasoning & Analysis  │ │      Testnet (Chain 97)   │
 └───────────────────────────┘ └───────────────────────────┘
```

---

## 🔗 Proven On-Chain Transactions (BNB Testnet)

All trades executed by VORIX are verifiable on **BscScan Testnet**:

| Token Pair | Trade Type | Amount | BscScan Tx Hash |
| :--- | :---: | :---: | :--- |
| **WIF / USDT** | `BUY` | 5.60 WIF | [`0x6919b492...b122`](https://testnet.bscscan.com/tx/0x6919b4927bb628c69ba6726b062ab22d829400f6b2983c3ff6abdff08c63b122) |
| **BOME / USDT** | `BUY` | 1,357.55 BOME | [`0x3ab25a8f...7093`](https://testnet.bscscan.com/tx/0x3ab25a8f8f5ea95d8db3952ec251ed3aafded79771e783aea4f83f0f609a7093) |
| **FET / USDT** | `BUY` | 5.65 FET | [`0x6dbec7e9...784c`](https://testnet.bscscan.com/tx/0x6dbec7e95899929a922dcb6a391261a9e43b202776ac500d5a9082314e83784c) |

---

## 🛠️ Tech Stack & Dependencies

- **Frontend**: Next.js 15, React 19, Tailwind CSS, Lucide React
- **Backend**: Python 3.10+, FastAPI, Web3.py, `eth_account`, Google GenAI SDK
- **Blockchain Network**: BNB Smart Chain Testnet (Chain ID `97`)
- **DEX Protocol**: PancakeSwap V2 Testnet Router (`0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3`)

---

## 💻 Local Setup & Installation

### 1. Clone Repository
```bash
git clone https://github.com/your-username/projek-vorix.git
cd projek-vorix
```

### 2. Backend Setup (`api-vorix`)
```bash
cd api-vorix
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env and set your GEMINI_API_KEY and VORIX_PRIVATE_KEY

python main.py
```
*Backend API will run at `http://localhost:8000`.*

### 3. Frontend Setup (`web-vorix`)
```bash
cd ../web-vorix
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000

npm run dev
```
*Frontend app will be available at `http://localhost:3000`.*

---

## 📜 Submission Details & Track Info

- **Hackathon**: Indonesia Web3 Hackathon
- **Track**: AI Agents Track
- **Network**: BNB Smart Chain (BSC Testnet)
- **Target Audience**: DeFi traders, Web3 automated liquidity manager, AI autonomous trading agents.

---

© 2026 VORIX Team. Built with ❤️ for BNB Chain & AI Web3 Innovation.
