import { useState } from 'react'
import { generateEd25519Keys, generateX25519Keys } from '../api/crypto'
import CopyButton from './CopyButton'

function KeyCard({ label, b64, hex, type }) {
  return (
    <div className="key-display">
      <div className="key-display-header">
        <span className={`key-display-label ${type}`}>{label}</span>
        <CopyButton text={b64} />
      </div>
      <div className="key-value">{b64}</div>
      <div className="key-hex">HEX: {hex}</div>
    </div>
  )
}

function KeyPairSection({ title, badge, badgeClass, description, onGenerate, keys, loading }) {
  return (
    <div className="card">
      <div className="card-title">
        <span className="icon">{badgeClass === 'indigo' ? '🔏' : '🔒'}</span>
        {title}
      </div>
      <div className="card-sub">{description}</div>

      <div className={`algo-badge ${badgeClass}`}>◆ {badge}</div>

      <button
        className="btn btn-primary btn-full"
        onClick={onGenerate}
        disabled={loading}
      >
        {loading ? <><span className="spinner" /> Đang tạo...</> : '⚡ Tạo Cặp Khóa Mới'}
      </button>

      {keys && (
        <>
          <div className="section-title" style={{ marginTop: 24 }}>Kết quả</div>
          <div className="key-grid">
            <KeyCard
              label="Private Key (bí mật)"
              b64={keys.private_key_b64}
              hex={keys.private_key_hex}
              type="private"
            />
            <KeyCard
              label="Public Key (công khai)"
              b64={keys.public_key_b64}
              hex={keys.public_key_hex}
              type="public"
            />
          </div>

          <div className="output-block" style={{ marginTop: 16 }}>
            <div className="output-header">
              <span className="output-label">Thông tin thuật toán</span>
            </div>
            <div className="output-value" style={{ fontSize: 12, color: 'var(--text-2)' }}>
              Thuật toán  : {keys.algorithm}{'\n'}
              Đường cong  : {keys.curve}{'\n'}
              Kích thước  : {keys.key_size_bits} bits
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function KeyGenerator({ onAddToast }) {
  const [ed25519Keys, setEd25519Keys] = useState(null)
  const [x25519Keys,  setX25519Keys]  = useState(null)
  const [loadingEd,   setLoadingEd]   = useState(false)
  const [loadingX,    setLoadingX]    = useState(false)

  const handleGenEd25519 = async () => {
    setLoadingEd(true)
    try {
      const { data } = await generateEd25519Keys()
      setEd25519Keys(data)
      onAddToast('Tạo cặp khóa Ed25519 thành công!')
    } catch {
      onAddToast('Lỗi khi tạo khóa Ed25519', 'error')
    } finally {
      setLoadingEd(false)
    }
  }

  const handleGenX25519 = async () => {
    setLoadingX(true)
    try {
      const { data } = await generateX25519Keys()
      setX25519Keys(data)
      onAddToast('Tạo cặp khóa X25519 thành công!')
    } catch {
      onAddToast('Lỗi khi tạo khóa X25519', 'error')
    } finally {
      setLoadingX(false)
    }
  }

  return (
    <div className="content">
      <div className="info-box">
        <strong>Curve25519</strong> là nền tảng của cả hai thuật toán. <strong>Ed25519</strong> sử dụng
        dạng Edwards (ký số), còn <strong>X25519</strong> sử dụng dạng Montgomery (trao đổi khóa
        Diffie–Hellman). Khóa trong tab này được dùng cho các thao tác ở tab Ký & Xác thực và Mã hóa.
      </div>

      <KeyPairSection
        title="Cặp Khóa Ed25519 — Ký Số"
        badge="Ed25519 · Chữ ký số"
        badgeClass="indigo"
        description="Tạo cặp khóa private / public Ed25519 dùng để ký và xác thực chữ ký số (tab Ký & Xác thực)."
        onGenerate={handleGenEd25519}
        keys={ed25519Keys}
        loading={loadingEd}
      />

      <KeyPairSection
        title="Cặp Khóa X25519 — Mã Hóa"
        badge="X25519 · ECDH Key Exchange"
        badgeClass="teal"
        description="Tạo cặp khóa X25519 dùng cho trao đổi khóa ECDH, kết hợp AES-256-GCM để mã hóa / giải mã (tab Mã hóa)."
        onGenerate={handleGenX25519}
        keys={x25519Keys}
        loading={loadingX}
      />
    </div>
  )
}
