import { useState, useCallback } from 'react'
import { CheckCheck, X } from 'lucide-react'

export function useToast() {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  return { toasts, addToast }
}

export function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.type === 'success'
            ? <CheckCheck size={14} strokeWidth={2.5} />
            : <X size={14} strokeWidth={2.5} />
          }
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}
