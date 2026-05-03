"""
Ed25519 Crypto Engine
Implements:
  - Ed25519 key generation, signing, and verification
  - X25519 ECDH + HKDF-SHA256 + AES-256-GCM for authenticated encryption
Both algorithms operate on Curve25519 (Edwards and Montgomery forms respectively).
"""

import os
import base64
import hashlib
from typing import Any

from cryptography.hazmat.primitives.asymmetric.ed25519 import (
    Ed25519PrivateKey,
    Ed25519PublicKey,
)
from cryptography.hazmat.primitives.asymmetric.x25519 import (
    X25519PrivateKey,
    X25519PublicKey,
)
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.exceptions import InvalidSignature


# ─── Key Generation ───────────────────────────────────────────────────────────

def generate_ed25519_keypair() -> dict[str, Any]:
    priv = Ed25519PrivateKey.generate()
    pub = priv.public_key()

    priv_raw = priv.private_bytes(
        serialization.Encoding.Raw,
        serialization.PrivateFormat.Raw,
        serialization.NoEncryption(),
    )
    pub_raw = pub.public_bytes(
        serialization.Encoding.Raw,
        serialization.PublicFormat.Raw,
    )

    return {
        "algorithm": "Ed25519",
        "curve": "Curve25519 (Edwards form — Twisted Edwards curve)",
        "key_size_bits": 256,
        "private_key_b64": base64.b64encode(priv_raw).decode(),
        "private_key_hex": priv_raw.hex(),
        "public_key_b64": base64.b64encode(pub_raw).decode(),
        "public_key_hex": pub_raw.hex(),
    }


def generate_x25519_keypair() -> dict[str, Any]:
    priv = X25519PrivateKey.generate()
    pub = priv.public_key()

    priv_raw = priv.private_bytes(
        serialization.Encoding.Raw,
        serialization.PrivateFormat.Raw,
        serialization.NoEncryption(),
    )
    pub_raw = pub.public_bytes(
        serialization.Encoding.Raw,
        serialization.PublicFormat.Raw,
    )

    return {
        "algorithm": "X25519",
        "curve": "Curve25519 (Montgomery form — for ECDH key exchange)",
        "key_size_bits": 256,
        "private_key_b64": base64.b64encode(priv_raw).decode(),
        "private_key_hex": priv_raw.hex(),
        "public_key_b64": base64.b64encode(pub_raw).decode(),
        "public_key_hex": pub_raw.hex(),
    }


# ─── Sign / Verify ────────────────────────────────────────────────────────────

def sign_message(private_key_b64: str, message: str) -> dict[str, Any]:
    priv_raw = base64.b64decode(private_key_b64)
    priv = Ed25519PrivateKey.from_private_bytes(priv_raw)

    msg_bytes = message.encode("utf-8")
    signature = priv.sign(msg_bytes)

    return {
        "algorithm": "Ed25519",
        "signature_b64": base64.b64encode(signature).decode(),
        "signature_hex": signature.hex(),
        "signature_size_bytes": len(signature),
        "message_sha512": hashlib.sha512(msg_bytes).hexdigest(),
    }


def verify_signature(
    public_key_b64: str, message: str, signature_b64: str
) -> dict[str, Any]:
    pub_raw = base64.b64decode(public_key_b64)
    pub = Ed25519PublicKey.from_public_bytes(pub_raw)

    msg_bytes = message.encode("utf-8")
    sig = base64.b64decode(signature_b64)

    try:
        pub.verify(sig, msg_bytes)
        return {
            "valid": True,
            "detail": "Chữ ký hợp lệ — xác thực thành công.",
        }
    except InvalidSignature:
        return {
            "valid": False,
            "detail": "Chữ ký không hợp lệ — xác thực thất bại.",
        }


# ─── Encrypt / Decrypt ────────────────────────────────────────────────────────

_HKDF_INFO = b"ed25519-crypto-app-v1-aes256gcm"


def _derive_aes_key(shared_secret: bytes) -> bytes:
    return HKDF(
        algorithm=hashes.SHA256(),
        length=32,
        salt=None,
        info=_HKDF_INFO,
    ).derive(shared_secret)


def encrypt_message(
    sender_private_b64: str,
    recipient_public_b64: str,
    plaintext: str,
) -> dict[str, Any]:
    sender_priv = X25519PrivateKey.from_private_bytes(
        base64.b64decode(sender_private_b64)
    )
    recipient_pub = X25519PublicKey.from_public_bytes(
        base64.b64decode(recipient_public_b64)
    )

    shared_secret = sender_priv.exchange(recipient_pub)
    aes_key = _derive_aes_key(shared_secret)

    nonce = os.urandom(12)          # 96-bit random nonce for AES-GCM
    aesgcm = AESGCM(aes_key)
    ct_with_tag = aesgcm.encrypt(nonce, plaintext.encode("utf-8"), None)

    ciphertext = ct_with_tag[:-16]
    auth_tag   = ct_with_tag[-16:]

    return {
        "algorithm": "X25519-ECDH + HKDF-SHA256 + AES-256-GCM",
        "ciphertext_b64": base64.b64encode(ct_with_tag).decode(),
        "ciphertext_hex": ciphertext.hex(),
        "nonce_b64": base64.b64encode(nonce).decode(),
        "nonce_hex": nonce.hex(),
        "auth_tag_hex": auth_tag.hex(),
    }


def decrypt_message(
    recipient_private_b64: str,
    sender_public_b64: str,
    ciphertext_b64: str,
    nonce_b64: str,
) -> dict[str, Any]:
    recipient_priv = X25519PrivateKey.from_private_bytes(
        base64.b64decode(recipient_private_b64)
    )
    sender_pub = X25519PublicKey.from_public_bytes(
        base64.b64decode(sender_public_b64)
    )

    shared_secret = recipient_priv.exchange(sender_pub)
    aes_key = _derive_aes_key(shared_secret)

    nonce       = base64.b64decode(nonce_b64)
    ct_with_tag = base64.b64decode(ciphertext_b64)

    aesgcm = AESGCM(aes_key)
    plaintext = aesgcm.decrypt(nonce, ct_with_tag, None)

    return {
        "plaintext": plaintext.decode("utf-8"),
        "algorithm": "X25519-ECDH + HKDF-SHA256 + AES-256-GCM",
    }
