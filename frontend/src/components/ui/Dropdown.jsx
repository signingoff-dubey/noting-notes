import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'

export function Dropdown({ trigger, items, align = 'left', className }) {
  const [open, setOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const ref = useRef(null)
  const triggerRef = useRef(null)
  const itemsRef = useRef(null)

  const enabledItems = items.filter(item => !item.disabled && !item.separator)
  const enabledCount = enabledItems.length

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleKeyDown = useCallback((e) => {
    if (!open) return
    switch (e.key) {
      case 'Escape':
        setOpen(false)
        triggerRef.current?.focus()
        break
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex(i => {
          const next = i + 1
          return next >= enabledCount ? 0 : next
        })
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(i => {
          const prev = i - 1
          return prev < 0 ? enabledCount - 1 : prev
        })
        break
      case 'Home':
        e.preventDefault()
        setFocusedIndex(0)
        break
      case 'End':
        e.preventDefault()
        setFocusedIndex(enabledCount - 1)
        break
      case 'Enter':
      case ' ':
        if (focusedIndex >= 0) {
          e.preventDefault()
          const item = enabledItems[focusedIndex]
          item.onClick?.()
          setOpen(false)
        }
        break
      case 'Tab':
        setOpen(false)
        break
    }
  }, [open, focusedIndex, enabledCount, enabledItems])

  useEffect(() => {
    if (itemsRef.current && focusedIndex >= 0) {
      const itemEl = itemsRef.current.querySelector(`[data-item-index="${focusedIndex}"]`)
      itemEl?.scrollIntoView({ block: 'nearest' })
    }
  }, [focusedIndex, open])

  const getEnabledIndex = (visualIndex) => {
    let count = -1
    for (let i = 0; i < items.length; i++) {
      if (!items[i].disabled && !items[i].separator) count++
      if (count === visualIndex) return i
    }
    return -1
  }

  return (
    <div ref={ref} className={cn('relative', className)}>
      <div
        ref={triggerRef}
        onClick={() => setOpen(o => !o)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="dropdown-menu"
      >
        {trigger}
      </div>
      {open && (
        <div
          ref={itemsRef}
          id="dropdown-menu"
          role="menu"
          className={cn(
            'dropdown-in absolute z-50 mt-1 min-w-[140px] bg-surface border border-border-strong rounded-sm shadow-2xl py-1',
            align === 'right' ? 'right-0' : 'left-0',
          )}
          onKeyDown={handleKeyDown}
        >
          {items.map((item, i) => {
            const isSeparator = item.separator
            const isDisabled = item.disabled
            const enabledIdx = getEnabledIndex(items.indexOf(item))

            if (isSeparator) {
              return (
                <div key={i} role="separator" className="h-px bg-border my-1" />
              )
            }

            return (
              <button
                key={i}
                role="menuitem"
                disabled={isDisabled}
                tabIndex={open && enabledIdx === focusedIndex ? 0 : -1}
                data-item-index={enabledIdx}
                onClick={() => { if (!isDisabled) { item.onClick?.(); setOpen(false) } }}
                onMouseEnter={() => !isDisabled && setFocusedIndex(enabledIdx)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-1.5 text-sm font-mono text-left transition-colors',
                  isDisabled ? 'opacity-40 cursor-not-allowed' : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary',
                  item.destructive && !isDisabled ? 'text-error' : '',
                  enabledIdx === focusedIndex && !isDisabled ? 'bg-surface-hover text-text-primary' : '',
                )}
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                {item.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function Select({ value, onChange, options, placeholder, className }) {
  const [open, setOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const ref = useRef(null)
  const triggerRef = useRef(null)
  const selected = options.find(o => o.value === value)

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleKeyDown = useCallback((e) => {
    if (!open) return
    switch (e.key) {
      case 'Escape':
        setOpen(false)
        triggerRef.current?.focus()
        break
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex(i => (i + 1) % options.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(i => (i - 1 + options.length) % options.length)
        break
      case 'Home':
        e.preventDefault()
        setFocusedIndex(0)
        break
      case 'End':
        e.preventDefault()
        setFocusedIndex(options.length - 1)
        break
      case 'Enter':
      case ' ':
        if (focusedIndex >= 0) {
          e.preventDefault()
          onChange(options[focusedIndex].value)
          setOpen(false)
        }
        break
      case 'Tab':
        setOpen(false)
        break
    }
  }, [open, focusedIndex, options.length, onChange])

  return (
    <div ref={ref} className={cn('relative min-w-0', className)}>
      <button
        ref={triggerRef}
        onClick={() => setOpen(o => !o)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="select-options"
        className="flex items-center justify-between gap-1.5 w-full px-2 py-1 bg-surface-2 border border-border rounded-sm text-xs font-mono text-text-secondary hover:border-border-strong hover:text-text-primary transition-colors min-w-0"
      >
        <span className="truncate min-w-0 flex-1">{selected?.label || placeholder || 'Select...'}</span>
        <ChevronDown size={12} strokeWidth={1.5} className={cn('shrink-0 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div
          id="select-options"
          role="listbox"
          aria-activedescendant={focusedIndex >= 0 ? `select-option-${focusedIndex}` : undefined}
          className="dropdown-in absolute z-50 mt-1 w-full min-w-[140px] bg-surface border border-border-strong rounded-sm shadow-2xl py-1 max-h-48 overflow-y-auto"
          onKeyDown={handleKeyDown}
        >
          {options.map((opt, i) => (
            <button
              key={opt.value}
              id={`select-option-${i}`}
              role="option"
              aria-selected={opt.value === value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              onMouseEnter={() => setFocusedIndex(i)}
              className={cn(
                'w-full text-left px-3 py-1.5 text-xs font-mono transition-colors hover:bg-surface-hover truncate block',
                opt.value === value ? 'text-text-primary bg-surface-active' : 'text-text-secondary',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}