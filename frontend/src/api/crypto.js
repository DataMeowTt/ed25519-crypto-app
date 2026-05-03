import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export const generateEd25519Keys = () => api.post('/keys/ed25519')
export const generateX25519Keys  = () => api.post('/keys/x25519')

export const signMessage = (private_key_b64, message) =>
  api.post('/sign', { private_key_b64, message })

export const verifySignature = (public_key_b64, message, signature_b64) =>
  api.post('/verify', { public_key_b64, message, signature_b64 })

export const encryptMessage = (sender_private_b64, recipient_public_b64, plaintext) =>
  api.post('/encrypt', { sender_private_b64, recipient_public_b64, plaintext })

export const decryptMessage = (recipient_private_b64, sender_public_b64, ciphertext_b64, nonce_b64) =>
  api.post('/decrypt', { recipient_private_b64, sender_public_b64, ciphertext_b64, nonce_b64 })
