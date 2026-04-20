import { cn } from '@/lib/cn'

const sizes = { sm: 14, md: 20, lg: 32 }

export function Spinner({ size = 'md', className }) {
  const px = sizes[size] ?? sizes.md
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('animate-spin text-text-secondary', className)}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}
