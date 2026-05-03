import { useState } from 'react'
import { encryptMessage, decryptMessage } from '../api/crypto'
import CopyButton from './CopyButton'

function OutputRow({ label, value }) {
  if (!value) return null
  return (
    <div className="output-block" style={{ marginBottom: 12 }}>
      <div className="output-header">
        <span className="output-label">{label}</span>
        <CopyButton text={value} />
      </div>
      <div className="output-value">{value}</div>
    </div>
  )
}

function EncryptPanel({ onAddToast }) {
  const [senderPriv,   setSenderPriv]   = useState('')
  const [recipientPub, setRecipientPub] = useState('')
  const [plaintext,    setPlaintext]    = useState('')
  const [result,       setResult]       = useState(null)
  const [loading,      setLoading]      = useState(false)

  const handleEncrypt = async () => {
    if (!senderPriv.trim() || !recipientPub.trim() || !plaintext.trim()) {
      onAddToast('Vui lòng nhập đủ khóa và văn bản cần mã hóa.', 'error')
      return
    }
    setLoading(true)
    try {
      const { data } = await encryptMessage(senderPriv.trim(), recipientPub.trim(), plaintext)
      setResult(data)
      onAddToast('Mã hóa thành công!')
    } catch (err) {
      onAddToast(err.response?.data?.detail || 'Lỗi khi mã hóa.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="card-title"><span className="icon">🔐</span> Mã Hóa Thông Điệp</div>
      <div className="card-sub">
        Người gửi dùng X25519 private key của mình cùng X25519 public key của người nhận để
        mã hóa bảo mật thông điệp. Chỉ người nhận mới có thể giải mã.
      </div>
      <div className="algo-badge teal">◆ X25519-ECDH + HKDF-SHA256 + AES-256-GCM</div>

      <div className="field">
        <label>Private Key của Người Gửi (X25519, Base64)</label>
        <textarea
          value={senderPriv}
          onChange={e => setSenderPriv(e.target.value)}
          placeholder="Dán X25519 private key (Base64) của người gửi…"
          rows={3}
        />
      </div>

      <div className="field">
        <label>Public Key của Người Nhận (X25519, Base64)</label>
        <textarea
          value={recipientPub}
          onChange={e => setRecipientPub(e.target.value)}
          placeholder="Dán X25519 public key (Base64) của người nhận…"
          rows={3}
        />
      </div>

      <div className="field">
        <label>Văn bản gốc (Plaintext)</label>
        <textarea
          value={plaintext}
          onChange={e => setPlaintext(e.target.value)}
          placeholder="Nhập nội dung cần mã hóa…"
          rows={5}
        />
      </div>

      <button className="btn btn-primary btn-full" onClick={handleEncrypt} disabled={loading}>
        {loading ? <><span className="spinner" /> Đang mã hóa...</> : '🔐 Mã Hóa'}
      </button>

      {result && (
        <>
          <div className="section-title" style={{ marginTop: 24 }}>Kết quả mã hóa</div>
          <OutputRow label="Ciphertext (Base64) — gửi cùng nonce cho người nhận" value={result.ciphertext_b64} />
          <OutputRow label="Nonce (Base64) — bắt buộc để giải mã" value={result.nonce_b64} />
          <OutputRow label="Ciphertext (Hex, không gồm auth tag)" value={result.ciphertext_hex} />
          <OutputRow label="Auth Tag (Hex — xác thực tính toàn vẹn)" value={result.auth_tag_hex} />
          <OutputRow label="Nonce (Hex)" value={result.nonce_hex} />
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8 }}>
            Thuật toán: {result.algorithm}
          </div>
        </>
      )}
    </div>
  )
}

function DecryptPanel({ onAddToast }) {
  const [recipientPriv, setRecipientPriv] = useState('')
  const [senderPub,     setSenderPub]     = useState('')
  const [ciphertext,    setCiphertext]    = useState('')
  const [nonce,         setNonce]         = useState('')
  const [result,        setResult]        = useState(null)
  const [loading,       setLoading]       = useState(false)

  const handleDecrypt = async () => {
    if (!recipientPriv.trim() || !senderPub.trim() || !ciphertext.trim() || !nonce.trim()) {
      onAddToast('Vui lòng nhập đủ tất cả các trường.', 'error')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const { data } = await decryptMessage(
        recipientPriv.trim(), senderPub.trim(), ciphertext.trim(), nonce.trim()
      )
      setResult(data)
      onAddToast('Giải mã thành công!')
    } catch (err) {
      onAddToast(err.response?.data?.detail || 'Giải mã thất bại — sai khóa, nonce, hoặc dữ liệu bị thay đổi.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="card-title"><span className="icon">🔓</span> Giải Mã Thông Điệp</div>
      <div className="card-sub">
        Người nhận dùng X25519 private key của mình cùng X25519 public key của người gửi
        để giải mã. AES-256-GCM xác thực tính toàn vẹn trước khi giải mã.
      </div>
      <div className="algo-badge teal">◆ X25519-ECDH + HKDF-SHA256 + AES-256-GCM</div>

      <div className="field">
        <label>Private Key của Người Nhận (X25519, Base64)</label>
        <textarea
          value={recipientPriv}
          onChange={e => setRecipientPriv(e.target.value)}
          placeholder="Dán X25519 private key (Base64) của người nhận…"
          rows={3}
        />
      </div>

      <div className="field">
        <label>Public Key của Người Gửi (X25519, Base64)</label>
        <textarea
          value={senderPub}
          onChange={e => setSenderPub(e.target.value)}
          placeholder="Dán X25519 public key (Base64) của người gửi…"
          rows={3}
        />
      </div>

      <div className="row">
        <div className="field">
          <label>Ciphertext (Base64)</label>
          <textarea
            value={ciphertext}
            onChange={e => setCiphertext(e.target.value)}
            placeholder="Dán ciphertext Base64…"
            rows={3}
          />
        </div>
        <div className="field" style={{ maxWidth: 280 }}>
          <label>Nonce (Base64)</label>
          <textarea
            value={nonce}
            onChange={e => setNonce(e.target.value)}
            placeholder="Dán nonce Base64…"
            rows={3}
          />
        </div>
      </div>

      <button className="btn btn-primary btn-full" onClick={handleDecrypt} disabled={loading}>
        {loading ? <><span className="spinner" /> Đang giải mã...</> : '🔓 Giải Mã'}
      </button>

      {result && (
        <>
          <div className="section-title" style={{ marginTop: 24 }}>Kết quả giải mã</div>
          <div className="output-block">
            <div className="output-header">
              <span className="output-label">Văn bản gốc (Plaintext)</span>
              <CopyButton text={result.plaintext} />
            </div>
            <div className="output-value" style={{ color: 'var(--green)', fontSize: 14 }}>
              {result.plaintext}
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8 }}>
            Thuật toán: {result.algorithm}
          </div>
        </>
      )}
    </div>
  )
}

export default function EncryptDecrypt({ onAddToast }) {
  return (
    <div className="content">
      <div className="info-box">
        Sơ đồ mã hóa: Người gửi và người nhận thực hiện{' '}
        <strong>X25519 ECDH</strong> để có shared secret → rút gọn qua{' '}
        <strong>HKDF-SHA256</strong> thành khóa AES-256 → mã hóa bằng{' '}
        <strong>AES-256-GCM</strong> (xác thực + mã hóa đồng thời). Do tính đối xứng của
        ECDH, người nhận thực hiện cùng phép tính và thu được cùng shared secret.
      </div>
      <EncryptPanel onAddToast={onAddToast} />
      <DecryptPanel onAddToast={onAddToast} />
    </div>
  )
}
