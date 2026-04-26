import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/cn'

const icons = {
  success: <CheckCircle size={15} strokeWidth={1.5} />,
  error:   <AlertCircle size={15} strokeWidth={1.5} />,
  warning: <AlertTriangle size={15} strokeWidth={1.5} />,
  info:    <Info size={15} strokeWidth={1.5} />,
}

const borderColors = {
  success: 'border-l-success',
  error:   'border-l-error',
  warning: 'border-l-warning',
  info:    'border-l-info',
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
      className={cn(
        'toast-enter flex items-start gap-3 w-80 bg-surface border border-border-strong rounded-sm p-3',
        'border-l-[3px]',
        borderColors[toast.type],
      )}
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
      >
        <X size={13} strokeWidth={1.5} />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const toasts = useUIStore(s => s.toasts)
  if (!toasts.length) return null
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map(t => <ToastItem key={t.id} toast={t} />)}
    </div>
  )
}
