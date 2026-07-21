import { useRef, useState, useCallback, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react'
import { formatDuration } from './utils'

export function VideoPlayer({ src, title }) {
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const seekRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [scrubbing, setScrubbing] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const hideTimer = useRef(null)

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
      setPlaying(true)
    } else {
      videoRef.current.pause()
      setPlaying(false)
    }
  }, [])

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current || scrubbing) return
    setCurrentTime(videoRef.current.currentTime)
  }, [scrubbing])

  const handleLoadedMeta = useCallback(() => {
    if (videoRef.current) setDuration(videoRef.current.duration)
  }, [])

  const handleSeek = useCallback((e) => {
    if (!seekRef.current || !videoRef.current) return
    const rect = seekRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const seekTime = Math.max(0, Math.min(x, 1)) * duration
    videoRef.current.currentTime = seekTime
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

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !videoRef.current.muted
    setMuted(videoRef.current.muted)
  }

  const handleVolume = (e) => {
    const v = parseFloat(e.target.value)
    if (!videoRef.current) return
    videoRef.current.volume = v
    videoRef.current.muted = v === 0
    setVolume(v)
    setMuted(v === 0)
  }

  const toggleFullscreen = async () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen()
      setFullscreen(true)
    } else {
      await document.exitFullscreen()
      setFullscreen(false)
    }
  }

  useEffect(() => {
    const onFsChange = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    if (playing) {
      hideTimer.current = setTimeout(() => setShowControls(false), 2500)
    }
  }, [playing])

  useEffect(() => {
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current) }
  }, [])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      ref={containerRef}
      className="relative group rounded-lg overflow-hidden bg-black"
      style={{ maxWidth: 640 }}
      onMouseEnter={() => setShowControls(true)}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => { if (playing) setShowControls(false) }}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full block cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMeta}
        onEnded={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        playsInline
        preload="metadata"
      />

      {/* Big center play button */}
      {!playing && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center transition-opacity hover:opacity-80"
          aria-label="Play"
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.6)' }}
          >
            <Play size={24} fill="white" stroke="white" strokeWidth={0} />
          </div>
        </button>
      )}

      {/* Controls overlay */}
      <div
        className="absolute bottom-0 left-0 right-0 transition-opacity duration-200"
        style={{
          opacity: showControls || !playing ? 1 : 0,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
          padding: '24px 12px 8px',
        }}
      >
        {/* Seekbar */}
        <div
          ref={seekRef}
          className="relative h-1.5 cursor-pointer group/seek rounded-full mb-2"
          style={{ background: 'rgba(255,255,255,0.2)' }}
          onMouseDown={handleScrubStart}
        >
          <div
            className="absolute left-0 top-0 h-full rounded-full pointer-events-none"
            style={{ width: `${progress}%`, background: 'var(--color-accent)' }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full pointer-events-none opacity-0 group-hover/seek:opacity-100 transition-opacity"
            style={{
              left: `calc(${progress}% - 6px)`,
              background: 'var(--color-accent)',
              boxShadow: '0 0 4px rgba(0,0,0,0.5)',
            }}
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-2">
          <button onClick={togglePlay} className="text-white hover:opacity-80 transition-opacity" aria-label={playing ? 'Pause' : 'Play'}>
            {playing ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" />}
          </button>

          <span className="font-mono text-xs text-white/80">
            {formatDuration(currentTime)} / {formatDuration(duration)}
          </span>

          <div className="flex-1" />

          <button onClick={toggleMute} className="text-white/80 hover:text-white transition-colors" aria-label={muted ? 'Unmute' : 'Mute'}>
            {muted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={handleVolume}
            className="w-16 h-1 accent-white cursor-pointer"
            aria-label="Volume"
          />

          <button onClick={toggleFullscreen} className="text-white/80 hover:text-white transition-colors" aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
            {fullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
          </button>
        </div>
      </div>

      {title && (
        <div className="absolute top-2 left-3" style={{ opacity: showControls ? 1 : 0, transition: 'opacity 0.2s' }}>
          <span className="font-mono text-xs text-white/70 drop-shadow-md">{title}</span>
        </div>
      )}
    </div>
  )
}
