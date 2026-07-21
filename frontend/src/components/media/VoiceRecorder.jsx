import { useRef, useState, useCallback, useEffect } from 'react'
import { Mic, Square, Play, Pause, Check, Trash2, Loader2 } from 'lucide-react'
import { formatDuration } from './utils'

export function VoiceRecorder({ onSave, onCancel }) {
  const [state, setState] = useState('idle')
  const [recordedBlob, setRecordedBlob] = useState(null)
  const [recordDuration, setRecordDuration] = useState(0)
  const [playbackTime, setPlaybackTime] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState(null)
  const mediaRecorder = useRef(null)
  const chunks = useRef([])
  const timerRef = useRef(null)
  const audioRef = useRef(null)
  const seekRef = useRef(null)
  const [scrubbing, setScrubbing] = useState(false)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [])

  const startRecording = async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunks.current = []
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorder.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data)
      }

      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunks.current, { type: 'audio/webm' })
        setRecordedBlob(blob)
        setState('preview')
        setRecordDuration(0)
        if (timerRef.current) clearInterval(timerRef.current)
      }

      recorder.start()
      setState('recording')
      const startTime = Date.now()
      timerRef.current = setInterval(() => {
        setRecordDuration(Math.floor((Date.now() - startTime) / 1000))
      }, 200)
    } catch (err) {
      setError('Microphone access denied. Allow microphone and try again.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop()
    }
  }

  const togglePlayback = useCallback(() => {
    if (!audioRef.current || !recordedBlob) return
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play()
      setPlaying(true)
    }
  }, [playing, recordedBlob])

  useEffect(() => {
    if (!recordedBlob) return
    const url = URL.createObjectURL(recordedBlob)
    const audio = new Audio(url)
    audioRef.current = audio

    audio.ontimeupdate = () => {
      if (!scrubbing) setPlaybackTime(audio.currentTime)
    }
    audio.onended = () => {
      setPlaying(false)
      setPlaybackTime(0)
    }
    audio.onloadedmetadata = () => setPlaybackTime(0)

    return () => {
      audio.pause()
      URL.revokeObjectURL(url)
    }
  }, [recordedBlob, scrubbing])

  const handleSeek = useCallback((e) => {
    if (!seekRef.current || !audioRef.current) return
    const rect = seekRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const seekTime = Math.max(0, Math.min(x, 1)) * (audioRef.current.duration || 0)
    audioRef.current.currentTime = seekTime
    setPlaybackTime(seekTime)
  }, [])

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

  const handleSave = () => {
    if (!recordedBlob) return
    const reader = new FileReader()
    reader.onload = () => {
      onSave({
        dataUrl: reader.result,
        duration: Math.max(playbackTime, audioRef.current?.duration || recordDuration),
        name: `Voice note ${new Date().toLocaleTimeString()}`,
      })
    }
    reader.readAsDataURL(recordedBlob)
  }

  const currentDuration = state === 'preview' && audioRef.current
    ? audioRef.current.duration || recordDuration
    : recordDuration
  const progress = state === 'preview' && currentDuration > 0
    ? (playbackTime / currentDuration) * 100
    : 0

  return (
    <div
      className="rounded-lg p-3 flex flex-col gap-2"
      style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
    >
      <div className="flex items-center gap-2">
        <Mic size={14} strokeWidth={1.5} style={{ color: state === 'recording' ? 'var(--color-error, #ef4444)' : 'var(--color-text-muted)' }} />
        <span className="font-mono flex-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
          {state === 'idle' && 'Record a voice note'}
          {state === 'recording' && 'Recording...'}
          {state === 'preview' && 'Review recording'}
        </span>
        <span className="font-mono tabular-nums" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          {formatDuration(currentDuration)}
        </span>
      </div>

      {error && (
        <p className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error, #ef4444)' }}>
          {error}
        </p>
      )}

      {state === 'recording' && (
        <div className="flex items-center gap-2">
          {/* Simple waveform simulation */}
          <div className="flex-1 flex items-center gap-0.5 h-8">
            {Array.from({ length: 32 }, (_, i) => (
              <div
                key={i}
                className="flex-1 rounded-full animate-pulse"
                style={{
                  height: `${20 + Math.sin(Date.now() / 200 + i * 0.8) * 20 + Math.random() * 10}%`,
                  background: 'var(--color-error, #ef4444)',
                  opacity: 0.6 + Math.random() * 0.4,
                }}
              />
            ))}
          </div>
          <button
            onClick={stopRecording}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0"
            style={{ background: 'var(--color-error, #ef4444)' }}
            aria-label="Stop recording"
          >
            <Square size={12} fill="white" stroke="white" strokeWidth={0} />
          </button>
        </div>
      )}

      {(state === 'preview' || state === 'idle') && (
        <div className="flex items-center gap-2">
          {state === 'preview' ? (
            <>
              {/* Seekbar */}
              <div className="flex-1">
                <div
                  ref={seekRef}
                  className="relative h-1.5 cursor-pointer group/seek rounded-full"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                  onMouseDown={handleScrubStart}
                >
                  <div
                    className="absolute left-0 top-0 h-full rounded-full pointer-events-none"
                    style={{ width: `${progress}%`, background: 'var(--color-accent)' }}
                  />
                </div>
              </div>

              <button onClick={togglePlayback} className="w-7 h-7 flex items-center justify-center rounded-md transition-colors hover:bg-surface-hover shrink-0" style={{ color: 'var(--color-text-secondary)' }} aria-label={playing ? 'Pause' : 'Play'}>
                {playing ? <Pause size={14} /> : <Play size={14} />}
              </button>

              <button onClick={handleSave} className="w-7 h-7 flex items-center justify-center rounded-md transition-colors hover:bg-surface-hover shrink-0" style={{ color: 'var(--color-success, #22c55e)' }} title="Save recording" aria-label="Save recording">
                <Check size={14} strokeWidth={2} />
              </button>
              <button onClick={onCancel} className="w-7 h-7 flex items-center justify-center rounded-md transition-colors hover:bg-surface-hover shrink-0" style={{ color: 'var(--color-text-muted)' }} title="Discard recording" aria-label="Discard recording">
                <Trash2 size={14} strokeWidth={1.5} />
              </button>
            </>
          ) : (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-3 h-8 rounded-lg transition-colors"
              style={{ background: 'var(--color-accent)', color: 'var(--color-bg)' }}
            >
              <Mic size={12} strokeWidth={2} />
              <span className="font-mono text-xs font-medium">Start Recording</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
