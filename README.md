# Ed25519 Crypto Suite

A web application for **encryption, decryption, and digital signing** on the Elliptic Curve **Curve25519**, covering two algorithm variants:

| Algorithm | Curve Form | Purpose |
|-----------|------------|---------|
| **Ed25519** | Twisted Edwards | Digital signing & signature verification |
| **X25519** | Montgomery | ECDH key exchange → AES-256-GCM encryption |

The backend is written in **Python / FastAPI** using the PyCA `cryptography` library. The frontend is built with **React + Vite** and features a clean dark-themed UI.

---

## Project Structure

```
ed25519-crypto-app/
│
├── backend/                    ← Python / FastAPI
│   ├── main.py                 ← REST API endpoint definitions
│   ├── crypto_engine.py        ← All cryptographic logic (Ed25519, X25519, AES-GCM)
│   ├── requirements.txt        ← Python dependencies
│   └── .venv/                  ← Python virtual environment (auto-created by start.sh)
│
├── frontend/                   ← React / Vite
│   ├── index.html              ← HTML entry point
│   ├── vite.config.js          ← Vite config + /api proxy → port 8000
│   ├── package.json
│   └── src/
│       ├── main.jsx            ← React entry point
│       ├── App.jsx             ← Root component, manages tab navigation
│       ├── App.css             ← Global CSS (dark theme, CSS variables, layout)
│       ├── api/
│       │   └── crypto.js       ← Axios client for all backend API calls
│       └── components/
│           ├── KeyGenerator.jsx    ← "Generate Keys" tab: Ed25519 & X25519 keypair generation
│           ├── SignVerify.jsx      ← "Sign & Verify" tab: Ed25519 sign and verify
│           ├── EncryptDecrypt.jsx  ← "Encrypt & Decrypt" tab: X25519 ECDH + AES-256-GCM
│           ├── CopyButton.jsx      ← Clipboard copy button component
│           └── Toast.jsx           ← Floating toast notifications (success / error)
│
├── start.sh                    ← One-command startup script for both servers
└── README.md
```

### Data Flow

```
Browser (React)
    │
    │  HTTP POST /api/*
    ▼
FastAPI (main.py)          ← Validates request body, routes to handler
    │
    ▼
crypto_engine.py           ← Executes cryptographic operations in pure Python
    │
    │  JSON response
    ▼
Browser — renders result (Base64 / Hex) with Copy buttons
```

### Encryption Scheme

```
Sender:    X25519 Private Key ─┐
                                ├─ ECDH ──► Shared Secret ──► HKDF-SHA256 ──► AES-256 Key
Recipient: X25519 Public Key  ─┘                                                    │
                                                                                     │
Plaintext ─────────────────────────── AES-256-GCM (96-bit random nonce) ──► Ciphertext + Auth Tag
```

Because ECDH is commutative, the recipient derives the same shared secret using their own private key and the sender's public key, then decrypts with AES-256-GCM.

---

## Getting Started

### Prerequisites

- **Python** ≥ 3.11
- **Node.js** ≥ 18 with **npm** ≥ 9

> **Note (macOS + Anaconda):** If `npm` is installed via Anaconda and not on your PATH, run this once before starting:
> ```bash
> export PATH="/opt/anaconda3/bin:$PATH"
> ```
> To make it permanent, add that line to `~/.zshrc` and run `source ~/.zshrc`.

### Option 1 — One-command start (recommended)

```bash
cd ed25519-crypto-app
chmod +x start.sh
./start.sh
```

The script will automatically:
1. Create a Python virtual environment (`.venv`) inside `backend/`
2. Run `pip install -r requirements.txt`
3. Start the FastAPI server at `http://localhost:8000`
4. Run `npm install` if `node_modules` is missing
5. Start the React dev server at `http://localhost:5173`

Press `Ctrl+C` to stop both servers.

### Option 2 — Manual setup (two terminals)

**Terminal 1 — Backend:**
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## Using the UI

Open your browser at **http://localhost:5173**.

### Tab 1 · Generate Keys

| Action | Result |
|--------|--------|
| Click **⚡ Generate New Keypair** (Ed25519 section) | Generates a signing keypair. Copy and save the keys for use in the Sign tab. |
| Click **⚡ Generate New Keypair** (X25519 section) | Generates an encryption keypair. Copy and save for use in the Encrypt tab. |
| Click **Copy** next to any value | Copies the Base64-encoded key to clipboard. |

> **Security note:** Private keys are only shown within the current browser session. Store them securely if you need to reuse them.

### Tab 2 · Sign & Verify

**Sign a message:**
1. Paste your **Ed25519 Private Key** (Base64).
2. Enter the message to sign.
3. Click **✍️ Sign Message** — you receive a 64-byte signature in Base64 and Hex.

**Verify a signature:**
1. Paste the **Ed25519 Public Key** (Base64).
2. Enter the original message exactly as it was signed.
3. Paste the **signature** (Base64).
4. Click **🔎 Verify Signature** — a green banner indicates a valid signature; red indicates invalid.

### Tab 3 · Encrypt & Decrypt

Scenario: Alice wants to send a secret message to Bob.

**Encrypt (Alice's side):**
1. Enter **Alice's X25519 Private Key** (Base64).
2. Enter **Bob's X25519 Public Key** (Base64).
3. Enter the plaintext to encrypt.
4. Click **🔐 Encrypt** — receive the Ciphertext and Nonce (both Base64).
5. Send both the ciphertext and nonce to Bob (they can be transmitted over an insecure channel).

**Decrypt (Bob's side):**
1. Enter **Bob's X25519 Private Key** (Base64).
2. Enter **Alice's X25519 Public Key** (Base64).
3. Paste the Ciphertext and Nonce received from Alice.
4. Click **🔓 Decrypt** — the original plaintext is revealed.

---

## API Reference

Interactive Swagger UI is available at `http://localhost:8000/docs`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/keys/ed25519` | Generate an Ed25519 keypair |
| POST | `/api/keys/x25519` | Generate an X25519 keypair |
| POST | `/api/sign` | Sign a message with Ed25519 |
| POST | `/api/verify` | Verify an Ed25519 signature |
| POST | `/api/encrypt` | Encrypt with X25519-ECDH + AES-256-GCM |
| POST | `/api/decrypt` | Decrypt with X25519-ECDH + AES-256-GCM |
