/**
 * Attach ripple effect to any element.
 * Usage: const ripple = useRipple(); <button {...ripple} />
 */
export function useRipple() {
  const createRipple = (e) => {
    const el = e.currentTarget
    if (!el) return

    const rect = el.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top  - size / 2

    const wave = document.createElement('span')
    wave.className = 'ripple-wave'
    wave.style.width  = `${size}px`
    wave.style.height = `${size}px`
    wave.style.left   = `${x}px`
    wave.style.top    = `${y}px`

    el.appendChild(wave)
    wave.addEventListener('animationend', () => wave.remove(), { once: true })
  }

  return {
    className: 'ripple-root',
    onMouseDown: createRipple,
  }
}
