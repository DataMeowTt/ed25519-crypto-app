from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import crypto_engine

app = FastAPI(title="Ed25519 Crypto API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Health ───────────────────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {"status": "ok"}


# ─── Key Generation ───────────────────────────────────────────────────────────

@app.post("/api/keys/ed25519")
def gen_ed25519():
    try:
        return crypto_engine.generate_ed25519_keypair()
    except Exception as exc:
        raise HTTPException(500, str(exc))


@app.post("/api/keys/x25519")
def gen_x25519():
    try:
        return crypto_engine.generate_x25519_keypair()
    except Exception as exc:
        raise HTTPException(500, str(exc))


# ─── Sign / Verify ────────────────────────────────────────────────────────────

class SignRequest(BaseModel):
    private_key_b64: str
    message: str


@app.post("/api/sign")
def sign(req: SignRequest):
    try:
        return crypto_engine.sign_message(req.private_key_b64, req.message)
    except Exception as exc:
        raise HTTPException(400, str(exc))


class VerifyRequest(BaseModel):
    public_key_b64: str
    message: str
    signature_b64: str


@app.post("/api/verify")
def verify(req: VerifyRequest):
    try:
        return crypto_engine.verify_signature(
            req.public_key_b64, req.message, req.signature_b64
        )
    except Exception as exc:
        raise HTTPException(400, str(exc))


# ─── Encrypt / Decrypt ────────────────────────────────────────────────────────

class EncryptRequest(BaseModel):
    sender_private_b64: str
    recipient_public_b64: str
    plaintext: str


@app.post("/api/encrypt")
def encrypt(req: EncryptRequest):
    try:
        return crypto_engine.encrypt_message(
            req.sender_private_b64, req.recipient_public_b64, req.plaintext
        )
    except Exception as exc:
        raise HTTPException(400, str(exc))


class DecryptRequest(BaseModel):
    recipient_private_b64: str
    sender_public_b64: str
    ciphertext_b64: str
    nonce_b64: str


@app.post("/api/decrypt")
def decrypt(req: DecryptRequest):
    try:
        return crypto_engine.decrypt_message(
            req.recipient_private_b64,
            req.sender_public_b64,
            req.ciphertext_b64,
            req.nonce_b64,
        )
    except Exception as exc:
        raise HTTPException(400, str(exc))
