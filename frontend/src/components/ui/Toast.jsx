import { useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/cn'

const icons = {
  success: <CheckCircle size={15} strokeWidth={1.5} />,
  error:   <AlertCircle size={15} strokeWidth={1.5} />,
  warning: <AlertTriangle size={15} strokeWidth={1.5} />,
  info:    <Info size={15} strokeWidth={1.5} />,
}

const bgTints = {
  success: 'color-mix(in oklch, var(--color-success) 9%, var(--color-surface))',
  error:   'color-mix(in oklch, var(--color-error) 9%, var(--color-surface))',
  warning: 'color-mix(in oklch, var(--color-warning) 9%, var(--color-surface))',
  info:    'color-mix(in oklch, var(--color-accent) 9%, var(--color-surface))',
}

const textColors = {
  success: 'text-success',
  error:   'text-error',
  warning: 'text-warning',
  info:    'text-info',
}

function ToastItem({ toast }) {
  const removeToast = useUIStore(s => s.removeToast)
  return (
    <div
      role="status"
      aria-live="polite"
      className="toast-enter flex items-start gap-3 w-80 border border-border-strong rounded-sm p-3"
      style={{ background: bgTints[toast.type] }}
    >
      <span className={cn('mt-0.5 shrink-0', textColors[toast.type])}>
        {icons[toast.type]}
      </span>
      <p className="flex-1 font-body text-sm text-text-primary leading-snug">
        {toast.message}
      </p>
      <button
        onClick={() => removeToast(toast.id)}
        className="shrink-0 text-text-muted hover:text-text-secondary transition-colors"
        aria-label="Dismiss notification"
      >
        <X size={13} strokeWidth={1.5} />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const toasts = useUIStore(s => s.toasts)

  useEffect(() => {
    if (!toasts.length) return
    const handler = (e) => {
      if (e.key === 'Escape') {
        const lastToast = toasts[toasts.length - 1]
        useUIStore.getState().removeToast(lastToast.id)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [toasts])

  if (!toasts.length) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map(t => <ToastItem key={t.id} toast={t} />)}
    </div>
  )
}