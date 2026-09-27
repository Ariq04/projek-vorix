Project Name: VORIX (Vision On-chain Reasoning Intelligence eXecution)

Hackathon Track: 🤖 AI Agents

Target Blockchain: BNB Smart Chain (BSC Testnet)

Architecture: Next.js (Frontend) + FastAPI (Backend)

1. 🎯 Identitas & Visi Proyek (Filosofi VORIX)
Membangun entitas kecerdasan buatan terdesentralisasi yang tidak hanya mengamati pasar, tetapi juga bertindak. Nama VORIX merepresentasikan alur kerja otonom agen ini dari hulu ke hilir:

V (Vision): Kemampuan memindai (scanning) ratusan data token di bursa secara real-time.

O (On-chain): Seluruh aksi dan bukti eksekusi terjadi langsung di atas jaringan BNB Chain.

R (Reasoning): Menggunakan Multi-Agent System (LLM) untuk memberikan penalaran logis layaknya analis manusia.

I (Intelligence): Pengambilan keputusan tanpa emosi, murni didasarkan pada metrik kuantitatif (RSI & Fibonacci).

X (eXecution): Eksekusi transaksi mandiri via Smart Contract tanpa intervensi klik manual manusia.

2. 🚨 Problem & Solution
Problem: Retail trader rentan terhadap bias emosional (FOMO/Panic) dan terbatas secara fisik untuk mengawasi berbagai token kripto di banyak timeframe secara bersamaan 24/7.

Solution: Mendelegasikan tugas tersebut kepada VORIX, agen AI yang bertindak sebagai pemindai pasar (Scanner), perumus risiko (Risk Manager), sekaligus eksekutor transaksi (On-Chain Executor).

3. 🛠️ Tech Stack (Kumpulan Teknologi)
Frontend (UI/UX): Next.js, React, TypeScript, Tailwind CSS.

Web3 Frontend: Wagmi, Viem (Untuk koneksi wallet MetaMask pengguna).

Backend (API & AI): Python, FastAPI, Uvicorn.

Data Kuantitatif: ccxt (Market Data), pandas, pandas_ta (Kalkulasi RSI & Fibo).

AI Engine: LangChain / Google Gemini API.

Web3 Backend (Eksekutor): web3.py (Interaksi Smart Contract PancakeSwap Router Testnet).

4. ✨ Core Features (Fokus MVP Hackathon)
Ruang lingkup produk (MVP) difokuskan pada 3 fitur otonom utama agar selesai tepat waktu:

Autonomous Market Radar (Vision & Intelligence)

Sistem memindai 10 koin teratas di bursa secara berkala di latar belakang.

Memfilter koin yang memenuhi syarat teknikal tajam: RSI < 35 (Oversold) DAN Harga memantul di area Fibonacci (61.8% / 78.6%).

Multi-Agent Deep Analysis (Reasoning)

Menerjemahkan angka teknis yang kaku menjadi narasi bahasa manusia (analisis risiko & fundamental).

Memberikan keputusan akhir yang terkalibrasi: STRONG_BUY, WATCH, atau AVOID.

On-Chain Action Executor (On-chain & eXecution)

Jika status STRONG_BUY dikeluarkan oleh otak AI, sistem backend Python otomatis merakit transaksi menggunakan Private Key dompet Agen VORIX.

Mengeksekusi fungsi swapExactETHForTokens di PancakeSwap Router secara otonom.

Mencetak Transaction Hash (TxHash) ke antarmuka web sebagai bukti sah utilitas di atas jaringan BNB Chain.

5. 📂 Struktur Direktori Proyek
(Panduan arsitektur Decoupled di Antigravity IDE)

Plaintext
vorix-workspace/
├── api-vorix/                    # BACKEND (Python)
│   ├── .env                      # Kredensial rahasia (Gemini API & Private Key)
│   ├── requirements.txt          # Daftar dependensi Python
│   ├── main.py                   # Server FastAPI & Konfigurasi CORS
│   ├── modules/
│   │   ├── scanner.py            # Logika CCXT & Pandas TA (Vision & Intelligence)
│   │   ├── brain.py              # Logika LangChain & Gemini (Reasoning)
│   │   └── executor.py           # Logika Web3.py & PancakeSwap (On-chain & eXecution)
│   └── data/
│       └── active_tokens.json    # Cache memori sementara agen AI
│
└── web-vorix/                    # FRONTEND (Next.js)
    ├── .env.local                # URL target Backend (http://localhost:8000)
    ├── package.json              # Daftar dependensi JS/TS
    ├── app/
    │   ├── layout.tsx            # Konfigurasi Provider Wagmi (Web3)
    │   └── page.tsx              # Halaman Utama / Dashboard VORIX
    └── components/
        ├── TokenTable.tsx        # UI tabel hasil pemindaian radar
        ├── AiAnalysisModal.tsx   # UI popup penalaran narasi AI
        └── ConnectWallet.tsx     # UI tombol otentikasi MetaMask
6. 🚀 Fase Eksekusi (Roadmap Pengerjaan)
Urutan prioritas penyelesaian tugas:

[ ] Fase 1: Fondasi Penglihatan (Backend - scanner.py)

Menyusun API menggunakan FastAPI.

Membangun fungsi penarik data (candlestick) dan penghitung RSI serta Fibonacci yang 100% akurat.

[ ] Fase 2: Otak Penalaran (Backend - brain.py)

Mengintegrasikan Prompt khusus ke model Gemini.

Membuat endpoint yang mengembalikan hasil narasi analitis dan keputusan berformat JSON.

[ ] Fase 3: Tangan Eksekusi (Backend - executor.py)

Menghubungkan web3.py dengan RPC BNB Testnet.

Menyusun dan menguji fungsi tanda tangan transaksi (sign transaction) ke Router PancakeSwap.

[ ] Fase 4: Antarmuka Interaktif (Frontend - Next.js)

Menginisialisasi proyek Next.js dengan Tailwind CSS.

Menghubungkan UI dengan API Backend (Fase 1-3) dan menambahkan interaksi otentikasi Web3 (Wagmi).