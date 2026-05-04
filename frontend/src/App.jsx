import { useState } from 'react'
import { KeyRound, PenLine, ShieldCheck } from 'lucide-react'
import KeyGenerator from './components/KeyGenerator'
import SignVerify from './components/SignVerify'
import EncryptDecrypt from './components/EncryptDecrypt'
import { useToast, ToastContainer } from './components/Toast'

const TABS = [
  { id: 'keys',    label: 'Tạo Khóa',         Icon: KeyRound },
  { id: 'sign',    label: 'Ký & Xác Thực',    Icon: PenLine },
  { id: 'encrypt', label: 'Mã Hóa & Giải Mã', Icon: ShieldCheck },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('keys')
  const { toasts, addToast } = useToast()

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="header">
        <div className="header-badge">Curve25519 · Ed25519 · X25519 · AES-256-GCM</div>
        <h1>Ed25519 Crypto Suite</h1>
        <p>
          Công cụ mã hóa, giải mã và ký số trên đường cong Elliptic Curve25519.
          Tất cả thao tác mật mã được thực hiện phía server bằng Python.
        </p>
      </header>

      {/* ── Tab Navigation ── */}
      <nav className="tab-nav">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`tab-btn ${activeTab === id ? 'active' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={15} strokeWidth={2} />
            {label}
          </button>
        ))}
      </nav>

      {/* ── Content ── */}
      {activeTab === 'keys'    && <KeyGenerator   onAddToast={addToast} />}
      {activeTab === 'sign'    && <SignVerify      onAddToast={addToast} />}
      {activeTab === 'encrypt' && <EncryptDecrypt  onAddToast={addToast} />}

      <ToastContainer toasts={toasts} />
    </div>
  )
}
