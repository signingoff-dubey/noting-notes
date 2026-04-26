import { cn } from '@/lib/cn'
import { Spinner } from './Spinner'
import { useRipple } from '@/lib/useRipple'

const variants = {
  primary:     'bg-accent text-bg hover:opacity-85 border-transparent',
  secondary:   'bg-transparent text-text-primary border border-border hover:bg-surface-hover',
  ghost:       'bg-transparent text-text-secondary border-transparent hover:bg-surface-hover hover:text-text-primary',
  destructive: 'bg-error text-white border-transparent hover:opacity-85',
  accent:      'bg-accent-dim text-text-primary border border-border hover:bg-surface-hover',
}

const sizes = {
  sm:   'h-7 px-3 text-xs',
  md:   'h-8 px-4 text-sm',
  lg:   'h-9 px-5 text-base',
  icon: 'h-7 w-7 p-0',
}

export function Button({
  children,
  variant = 'secondary',
  size = 'md',
  onClick,
  disabled,
  loading,
  className,
  type = 'button',
  title,
  ...props
}) {
  const ripple = useRipple()

  const { onMouseDown: parentOnMouseDown, ...restProps } = props

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      {...ripple}
      onMouseDown={(e) => {
        ripple.onMouseDown(e)
        parentOnMouseDown?.(e)
      }}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-mono transition-all duration-[150ms] cursor-pointer select-none',
        'rounded border',
        ripple.className,
        variants[variant],
        sizes[size],
        (disabled || loading) && 'opacity-40 cursor-not-allowed',
        className,
      )}
      {...restProps}
    >
      {loading ? <Spinner size="sm" /> : children}
    </button>
  )
}
