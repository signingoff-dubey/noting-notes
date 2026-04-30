import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'

export function Dropdown({ trigger, items, align = 'left', className }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className={cn('relative', className)}>
      <div onClick={() => setOpen(o => !o)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            'dropdown-in absolute z-50 mt-1 min-w-[140px] bg-surface border border-border-strong rounded-sm shadow-2xl py-1',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {items.map((item, i) =>
            item.separator ? (
              <div key={i} className="h-px bg-border my-1" />
            ) : (
              <button
                key={i}
                onClick={() => { item.onClick?.(); setOpen(false) }}
                disabled={item.disabled}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-1.5 text-sm font-mono text-left transition-colors',
                  item.destructive ? 'text-error hover:bg-surface-hover' : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary',
                  item.disabled && 'opacity-40 cursor-not-allowed',
                )}
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}

export function Select({ value, onChange, options, placeholder, className }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = options.find(o => o.value === value)

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className={cn('relative min-w-0', className)}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between gap-1.5 w-full px-2 py-1 bg-surface-2 border border-border rounded-sm text-xs font-mono text-text-secondary hover:border-border-strong hover:text-text-primary transition-colors min-w-0"
      >
        <span className="truncate min-w-0 flex-1">{selected?.label || placeholder || 'Select...'}</span>
        <ChevronDown size={12} strokeWidth={1.5} className={cn('shrink-0 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="dropdown-in absolute z-50 mt-1 w-full min-w-[140px] bg-surface border border-border-strong rounded-sm shadow-2xl py-1 max-h-48 overflow-y-auto">
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={cn(
                'w-full text-left px-3 py-1.5 text-xs font-mono transition-colors hover:bg-surface-hover truncate block',
                opt.value === value ? 'text-text-primary bg-surface-active' : 'text-text-secondary',
              )}
              title={opt.label}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
