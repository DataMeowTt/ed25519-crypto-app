import { useState } from 'react'
import { PenLine, ScanSearch, CheckCircle2, XCircle, Cpu } from 'lucide-react'
import { signMessage, verifySignature } from '../api/crypto'
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

function SignPanel({ onAddToast }) {
  const [privKey,   setPrivKey]   = useState('')
  const [message,   setMessage]   = useState('')
  const [result,    setResult]    = useState(null)
  const [loading,   setLoading]   = useState(false)

  const handleSign = async () => {
    if (!privKey.trim() || !message.trim()) {
      onAddToast('Vui lòng nhập đủ khóa bí mật và thông điệp.', 'error')
      return
    }
    setLoading(true)
    try {
      const { data } = await signMessage(privKey.trim(), message)
      setResult(data)
      onAddToast('Ký thành công!')
    } catch (err) {
      onAddToast(err.response?.data?.detail || 'Lỗi khi ký.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="card-title"><PenLine size={18} strokeWidth={2} /> Ký Thông Điệp</div>
      <div className="card-sub">
        Dùng Ed25519 private key để tạo chữ ký số cho thông điệp bất kỳ.
      </div>
      <div className="algo-badge indigo"><Cpu size={11} strokeWidth={2} /> Ed25519 · Chữ ký số (64 bytes)</div>

      <div className="field">
        <label>Private Key (Base64)</label>
        <textarea
          value={privKey}
          onChange={e => setPrivKey(e.target.value)}
          placeholder="Dán Ed25519 private key (Base64) vào đây…"
          rows={3}
        />
      </div>

      <div className="field">
        <label>Thông điệp cần ký</label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Nhập thông điệp muốn ký số…"
          rows={4}
        />
      </div>

      <button className="btn btn-primary btn-full" onClick={handleSign} disabled={loading}>
        {loading ? <><span className="spinner" /> Đang ký...</> : <><PenLine size={14} strokeWidth={2.5} /> Ký Thông Điệp</>}
      </button>

      {result && (
        <>
          <div className="section-title" style={{ marginTop: 24 }}>Kết quả chữ ký</div>
          <OutputRow label="Chữ ký (Base64) — dùng để xác thực" value={result.signature_b64} />
          <OutputRow label="Chữ ký (Hex)" value={result.signature_hex} />
          <OutputRow label="SHA-512 của thông điệp" value={result.message_sha512} />
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8 }}>
            Kích thước chữ ký: {result.signature_size_bytes} bytes · Thuật toán: {result.algorithm}
          </div>
        </>
      )}
    </div>
  )
}

function VerifyPanel({ onAddToast }) {
  const [pubKey,   setPubKey]   = useState('')
  const [message,  setMessage]  = useState('')
  const [sig,      setSig]      = useState('')
  const [result,   setResult]   = useState(null)
  const [loading,  setLoading]  = useState(false)

  const handleVerify = async () => {
    if (!pubKey.trim() || !message.trim() || !sig.trim()) {
      onAddToast('Vui lòng nhập đủ khóa công khai, thông điệp và chữ ký.', 'error')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const { data } = await verifySignature(pubKey.trim(), message, sig.trim())
      setResult(data)
    } catch (err) {
      onAddToast(err.response?.data?.detail || 'Lỗi khi xác thực.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="card-title"><ScanSearch size={18} strokeWidth={2} /> Xác Thực Chữ Ký</div>
      <div className="card-sub">
        Kiểm tra xem chữ ký có được tạo bởi private key tương ứng với public key đã cho hay không.
      </div>
      <div className="algo-badge indigo"><Cpu size={11} strokeWidth={2} /> Ed25519 · Xác thực chữ ký</div>

      <div className="field">
        <label>Public Key (Base64)</label>
        <textarea
          value={pubKey}
          onChange={e => setPubKey(e.target.value)}
          placeholder="Dán Ed25519 public key (Base64) vào đây…"
          rows={3}
        />
      </div>

      <div className="field">
        <label>Thông điệp gốc</label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Nhập thông điệp ban đầu (phải khớp với thông điệp đã ký)…"
          rows={4}
        />
      </div>

      <div className="field">
        <label>Chữ ký (Base64)</label>
        <textarea
          value={sig}
          onChange={e => setSig(e.target.value)}
          placeholder="Dán chữ ký Base64 từ bước ký vào đây…"
          rows={3}
        />
      </div>

      <button className="btn btn-primary btn-full" onClick={handleVerify} disabled={loading}>
        {loading ? <><span className="spinner" /> Đang xác thực...</> : <><ScanSearch size={14} strokeWidth={2.5} /> Xác Thực Chữ Ký</>}
      </button>

      {result && (
        <div className={`verify-result ${result.valid ? 'valid' : 'invalid'}`}>
          <div className="verify-icon">
            {result.valid
              ? <CheckCircle2 size={28} strokeWidth={2} />
              : <XCircle size={28} strokeWidth={2} />
            }
          </div>
          <div>
            <div className="verify-title">
              {result.valid ? 'Chữ ký HỢP LỆ' : 'Chữ ký KHÔNG HỢP LỆ'}
            </div>
            <div className="verify-detail">{result.detail}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SignVerify({ onAddToast }) {
  return (
    <div className="content">
      <div className="info-box">
        <strong>Ed25519</strong> là thuật toán chữ ký số trên đường cong Twisted Edwards Curve25519.
        Mỗi chữ ký dài <strong>64 bytes</strong>. Bất kỳ ai có public key đều có thể xác thực,
        nhưng chỉ người giữ private key mới có thể tạo chữ ký hợp lệ.
      </div>
      <SignPanel onAddToast={onAddToast} />
      <VerifyPanel onAddToast={onAddToast} />
    </div>
  )
}
