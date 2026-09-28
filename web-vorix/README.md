# 🚀 VORIX — Autonomous AI Agent Trading & Portfolio Manager on BNB Chain

[![BNB Smart Chain](https://img.shields.io/badge/BNB_Chain-Testnet_ChainID_97-F3BA2F?style=for-the-badge&logo=binance&logoColor=black)](https://testnet.bscscan.com/)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python_3.10+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Google Gemini AI](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

> **💡 One-Liner Pitch:**  
> *"VORIX is an autonomous Web3 AI agent on BNB Chain that continuously scans markets, executes zero-friction DEX trades, and safeguards your portfolio 24/7—so you can sleep soundly at 3 AM."*

---

## 📽️ Submission Quick Links

- **🎥 Demo Video (2-4 Mins)**: [Watch Product Demo on YouTube / Loom](https://youtube.com) *(Update with your video link)*
- **🌐 Live Web Application**: `http://localhost:3000` *(Or your Vercel deployment URL)*
- **📦 GitHub Repository**: [https://github.com/Ariq04/projek-vorix](https://github.com/Ariq04/projek-vorix)

---

## 📜 Key Smart Contract & Wallet Addresses (BSC Testnet)

| Component | Network | Contract / Address | Explorer Link |
| :--- | :---: | :--- | :--- |
| **PancakeSwap V2 Router** | BSC Testnet (97) | `0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3` | [BscScan](https://testnet.bscscan.com/address/0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3) |
| **Wrapped BNB (WBNB)** | BSC Testnet (97) | `0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd` | [BscScan](https://testnet.bscscan.com/address/0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd) |
| **Mock USDT Token** | BSC Testnet (97) | `0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684` | [BscScan](https://testnet.bscscan.com/address/0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684) |
| **VORIX AI Agent Wallet** | BSC Testnet (97) | `0x1f7596a297921b3a165b4c194511d73a8111cc57` | [BscScan](https://testnet.bscscan.com/address/0x1f7596a297921b3a165b4c194511d73a8111cc57) |

---

## 🔄 User & Autonomous Agent Flow

```
 ┌────────────────┐     ┌────────────────┐     ┌────────────────┐     ┌────────────────┐
 │ 1. Market Radar│ ──► │ 2. Gemini 2.5  │ ──► │ 3. Risk & Size │ ──► │ 4. On-Chain    │
 │    Scanner     │     │    AI Reason   │     │    Calculator  │     │    DEX Swap    │
 └────────────────┘     └────────────────┘     └────────────────┘     └───────┬────────┘
                                                                              │
                                                               ┌──────────────▼─────────┐
                                                               │ 5. Real-Time Portfolio │
                                                               │    & BscScan Audit     │
                                                               └────────────────────────┘
```

1. **Market Radar Scanning**: VORIX worker continuously scans 200+ active crypto and meme tokens on BNB Chain.
2. **Gemini 2.5 Flash Reasoning**: Quant data (RSI 14, Fibonacci 61.8%/78.6% levels, price action) is evaluated by LLM.
3. **Risk & Position Management**: Auto-calculates 10–15% wallet allocation per trade while preserving a `0.001 tBNB` gas safety cushion.
4. **On-Chain DEX Execution**: Directly signs and executes Web3 swap transactions on PancakeSwap V2 Router without user manual input.
5. **Real-Time Audit & Tracking**: Syncs live holdings, floating PnL (%), and transaction hash links for 100% transparent verification.

---

## 🌟 Key Features

1. **🤖 Autonomous AI Sentiment & Technical Analysis**
   - Integrates Google Gemini 2.5 Flash to evaluate real-time token price action, volume surges, and market momentum.
   - Generates actionable trade confidence scores (0-100) and directional signals (`BUY`, `SELL`, `HOLD`).

2. **⚡ On-Chain DEX Trading Engine (BNB Chain Testnet)**
   - Executes autonomous token swaps via PancakeSwap V2 Router.
   - Automated gas management maintaining a minimum safety buffer of `0.001 tBNB` for non-stop execution.

3. **🛡️ Dynamic Risk & Position Sizing**
   - Allocates 10–15% of available wallet balance per trade to enforce prudent risk management.
   - Real-time Portfolio sync tracking positions, PnL ($), win rate %, and trading volume.

4. **📊 Institutional Dashboard UI**
   - Built with Next.js 15, Tailwind CSS, and Lucide Icons with sleek dark mode aesthetics.
   - Micro-cap price formatting (supports prices down to 8 decimal places `$0.00000438`).
   - Interactive Historical Trade Audit log with date filtering and live BscScan transaction hash links.

---

## 🔗 Proven On-Chain Transactions (BNB Testnet)

All trades executed by VORIX are verifiable on **BscScan Testnet**:

| Token Pair | Trade Type | Amount | BscScan Tx Hash |
| :--- | :---: | :---: | :--- |
| **PEPE / USDT** | `BUY` | 320,541.76 PEPE | [`0xf34a44b8...3391`](https://testnet.bscscan.com/tx/0xf34a44b83fe9bd1a3e2dd715af88ec4c702fac4d3588a6adb6d7be5f14513391) |
| **WIF / USDT** | `BUY` | 5.60 WIF | [`0x6919b492...b122`](https://testnet.bscscan.com/tx/0x6919b4927bb628c69ba6726b062ab22d829400f6b2983c3ff6abdff08c63b122) |
| **BOME / USDT** | `BUY` | 1,357.55 BOME | [`0x3ab25a8f...7093`](https://testnet.bscscan.com/tx/0x3ab25a8f8f5ea95d8db3952ec251ed3aafded79771e783aea4f83f0f609a7093) |
| **FET / USDT** | `BUY` | 5.65 FET | [`0x6dbec7e9...784c`](https://testnet.bscscan.com/tx/0x6dbec7e95899929a922dcb6a391261a9e43b202776ac500d5a9082314e83784c) |

---

## 📈 Business Model & VC Monetization Roadmap

### Revenue Streams (Monetization Strategy)
1. **Performance Fee**: 1.5% success fee deducted only on net profitable AI trades.
2. **Subscription Tier (SaaS)**: Premium AI Scanner tier offering sub-second radar scanning for institutional traders.
3. **DEX Referral Rebate**: Volume-based fee sharing partnership with BNB Chain DEX protocols.

### VC Roadmap (Future Vision)
- **Q4 2026 (Account Abstraction)**: ERC-4337 non-custodial user vault integration (Web3Auth / Privy) for seamless multi-user onboarding.
- **Q1 2027 (Decentralized AI Memory)**: BNB Greenfield integration to store AI model weights and historical trade memory verifiably on-chain.
- **Q2 2027 (Scaling & Cross-Chain)**: Deployment on **opBNB Layer 2** for ultra-low latency & sub-cent gas execution.

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
git clone https://github.com/Ariq04/projek-vorix.git
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
