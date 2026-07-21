import { XIcon } from 'lucide-react'
import { VideoPlayer } from './VideoPlayer'
import { AudioPlayer } from './AudioPlayer'

export function MediaAttachments({ attachments, onRemove }) {
  const mediaItems = (attachments || []).filter(a =>
    a.type === 'video' || a.type === 'audio' || a.type === 'voice'
  )
  if (!mediaItems.length) return null

  return (
    <div className="flex flex-col gap-3 px-6 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
      <span className="font-mono uppercase tracking-widest" style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-muted)' }}>
        Media
      </span>
      <div className="flex flex-col gap-2">
        {mediaItems.map(att => (
          <div key={att.id} className="relative group/media">
            {att.type === 'video' ? (
              <VideoPlayer src={att.dataUrl || att.src} title={att.name} />
            ) : (
              <AudioPlayer src={att.dataUrl || att.src} duration={att.duration} />
            )}
            {onRemove && (
              <button
                onClick={() => onRemove(att.id)}
                className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full opacity-0 group-hover/media:opacity-100 transition-opacity"
                style={{ background: 'var(--color-error, #ef4444)' }}
                aria-label={`Remove ${att.name}`}
              >
                <XIcon size={10} strokeWidth={2} color="white" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
