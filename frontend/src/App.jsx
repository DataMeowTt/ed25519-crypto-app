import { useState } from 'react'
import KeyGenerator from './components/KeyGenerator'
import SignVerify from './components/SignVerify'
import EncryptDecrypt from './components/EncryptDecrypt'
import { useToast, ToastContainer } from './components/Toast'

const TABS = [
  { id: 'keys',    label: 'Tạo Khóa',        icon: '🗝️' },
  { id: 'sign',    label: 'Ký & Xác Thực',   icon: '✍️' },
  { id: 'encrypt', label: 'Mã Hóa & Giải Mã', icon: '🔐' },
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
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            {tab.label}
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
