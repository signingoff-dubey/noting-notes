import { useRef, useState, useCallback, useEffect } from 'react'
import { Play, Pause } from 'lucide-react'
import { formatDuration } from './utils'

export function AudioPlayer({ src, duration: initialDuration }) {
  const audioRef = useRef(null)
  const seekRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(initialDuration || 0)
  const [scrubbing, setScrubbing] = useState(false)

  useEffect(() => {
    if (!src) return
    const audio = new Audio(src)
    audioRef.current = audio
    audio.onloadedmetadata = () => {
      if (isFinite(audio.duration)) setDuration(audio.duration)
    }
    audio.ontimeupdate = () => {
      if (!scrubbing) setCurrentTime(audio.currentTime)
    }
    audio.onended = () => { setPlaying(false); setCurrentTime(0) }
    return () => { audio.pause() }
  }, [src, scrubbing])

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return
    if (audioRef.current.paused) {
      audioRef.current.play()
      setPlaying(true)
    } else {
      audioRef.current.pause()
      setPlaying(false)
    }
  }, [])

  const handleSeek = useCallback((e) => {
    if (!seekRef.current || !audioRef.current) return
    const rect = seekRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const seekTime = Math.max(0, Math.min(x, 1)) * duration
    audioRef.current.currentTime = seekTime
    setCurrentTime(seekTime)
  }, [duration])

  const handleScrubStart = useCallback((e) => {
    e.preventDefault()
    setScrubbing(true)
    handleSeek(e)
  }, [handleSeek])

  useEffect(() => {
    if (!scrubbing) return
    const onMove = (e) => handleSeek(e)
    const onUp = () => setScrubbing(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [scrubbing, handleSeek])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
      style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
    >
      <button onClick={togglePlay} className="w-7 h-7 flex items-center justify-center rounded-md transition-colors hover:bg-surface-hover shrink-0" style={{ color: 'var(--color-text-secondary)' }} aria-label={playing ? 'Pause' : 'Play'}>
        {playing ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
      </button>

      <div
        ref={seekRef}
        className="flex-1 h-1.5 cursor-pointer group/seek rounded-full"
        style={{ background: 'rgba(255,255,255,0.12)' }}
        onMouseDown={handleScrubStart}
      >
        <div
          className="relative h-full rounded-full"
          style={{ width: `${progress}%`, background: 'var(--color-accent)', transition: scrubbing ? 'none' : 'width 0.1s linear' }}
        />
      </div>

      <span className="font-mono tabular-nums shrink-0" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
        {formatDuration(currentTime)} / {formatDuration(duration)}
      </span>
    </div>
  )
}
