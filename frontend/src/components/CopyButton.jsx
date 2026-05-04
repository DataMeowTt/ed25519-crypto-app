import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export default function CopyButton({ text, className = '' }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* fallback omitted — modern browsers support clipboard API */
    }
  }

  return (
    <button
      className={`copy-btn ${copied ? 'copied' : ''} ${className}`}
      onClick={handleCopy}
      title="Copy to clipboard"
    >
      {copied
        ? <><Check size={11} strokeWidth={2.5} /> Copied</>
        : <><Copy size={11} strokeWidth={2} /> Copy</>
      }
    </button>
  )
}
