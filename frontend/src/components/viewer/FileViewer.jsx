import { useState, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X, FileText, File } from 'lucide-react'
import * as XLSX from 'xlsx'
import * as mammoth from 'mammoth'
import JSZip from 'jszip'

import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`

/* ── PDF Viewer ── */
function PdfViewer({ dataUrl }) {
  const [numPages, setNumPages] = useState(null)
  const [page, setPage] = useState(1)
  const [scale, setScale] = useState(1.0)

  return (
    <div className="flex flex-col h-full">
      {/* PDF controls */}
      <div
        className="flex items-center gap-2 px-3 shrink-0 border-b"
        style={{ height: 40, borderColor: 'var(--color-border)' }}
      >
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="w-6 h-6 flex items-center justify-center rounded transition-colors hover:bg-[var(--color-surface-hover)] disabled:opacity-30"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <ChevronLeft size={12} strokeWidth={1.5} />
        </button>
        <span className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          {page} / {numPages ?? '…'}
        </span>
        <button
          onClick={() => setPage(p => Math.min(numPages || p, p + 1))}
          disabled={page >= (numPages || 1)}
          className="w-6 h-6 flex items-center justify-center rounded transition-colors hover:bg-[var(--color-surface-hover)] disabled:opacity-30"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <ChevronRight size={12} strokeWidth={1.5} />
        </button>
        <div className="w-px h-4 mx-1" style={{ background: 'var(--color-border)' }} />
        <button
          onClick={() => setScale(s => Math.max(0.5, +(s - 0.25).toFixed(2)))}
          className="w-6 h-6 flex items-center justify-center rounded transition-colors hover:bg-[var(--color-surface-hover)]"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <ZoomOut size={12} strokeWidth={1.5} />
        </button>
        <span className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => setScale(s => Math.min(3, +(s + 0.25).toFixed(2)))}
          className="w-6 h-6 flex items-center justify-center rounded transition-colors hover:bg-[var(--color-surface-hover)]"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <ZoomIn size={12} strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex-1 overflow-auto min-h-0 flex justify-center p-4" style={{ background: 'var(--color-surface-2)' }}>
        <Document
          file={dataUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={<span className="font-mono" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Loading PDF…</span>}
          error={<span className="font-mono" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-error, #ef4444)' }}>Failed to load PDF</span>}
        >
          <Page pageNumber={page} scale={scale} />
        </Document>
      </div>
    </div>
  )
}

/* ── DOCX Viewer ── */
function DocxViewer({ dataUrl }) {
  const [html, setHtml] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const base64 = dataUrl.split(',')[1]
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    mammoth.convertToHtml({ arrayBuffer: bytes.buffer })
      .then(result => setHtml(result.value))
      .catch(() => setError('Failed to parse DOCX'))
  }, [dataUrl])

  if (error) return <div className="p-6 font-mono" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-error, #ef4444)' }}>{error}</div>
  if (!html) return <div className="p-6 font-mono" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Converting…</div>

  return (
    <div
      className="flex-1 overflow-auto min-h-0 p-8"
      style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', lineHeight: 1.7 }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

/* ── XLSX Viewer ── */
function XlsxViewer({ dataUrl }) {
  const [sheets, setSheets] = useState(null)
  const [activeSheet, setActiveSheet] = useState(0)
  const [error, setError] = useState(null)

  useEffect(() => {
    try {
      const base64 = dataUrl.split(',')[1]
      const binary = atob(base64)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
      const wb = XLSX.read(bytes.buffer, { type: 'array' })
      const result = wb.SheetNames.map(name => ({
        name,
        data: XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: '' }),
      }))
      setSheets(result)
    } catch {
      setError('Failed to parse spreadsheet')
    }
  }, [dataUrl])

  if (error) return <div className="p-6 font-mono" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-error, #ef4444)' }}>{error}</div>
  if (!sheets) return <div className="p-6 font-mono" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Parsing…</div>

  const current = sheets[activeSheet]

  return (
    <div className="flex flex-col h-full">
      {/* Sheet tabs */}
      {sheets.length > 1 && (
        <div className="flex overflow-x-auto shrink-0 border-b" style={{ borderColor: 'var(--color-border)' }}>
          {sheets.map((s, i) => (
            <button
              key={s.name}
              onClick={() => setActiveSheet(i)}
              className="px-4 py-2 font-mono shrink-0 transition-colors"
              style={{
                fontSize: 'var(--text-xs)',
                color: activeSheet === i ? 'var(--color-accent)' : 'var(--color-text-muted)',
                borderBottom: activeSheet === i ? '2px solid var(--color-accent)' : '2px solid transparent',
                background: 'none',
              }}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}
      <div className="flex-1 overflow-auto min-h-0">
        <table className="w-full border-collapse" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)' }}>
          <tbody>
            {current.data.map((row, ri) => (
              <tr key={ri} style={{ borderBottom: '1px solid var(--color-border)' }}>
                {(Array.isArray(row) ? row : []).map((cell, ci) => {
                  const Tag = ri === 0 ? 'th' : 'td'
                  return (
                    <Tag
                      key={ci}
                      className="px-3 py-1.5 text-left"
                      style={{
                        color: ri === 0 ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                        fontWeight: ri === 0 ? 600 : 400,
                        borderRight: '1px solid var(--color-border)',
                        background: ri === 0 ? 'var(--color-surface-2)' : 'transparent',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {String(cell ?? '')}
                    </Tag>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── PPTX Viewer ── */
function PptxViewer({ dataUrl }) {
  const [slides, setSlides] = useState(null)
  const [activeSlide, setActiveSlide] = useState(0)
  const [error, setError] = useState(null)

  useEffect(() => {
    const base64 = dataUrl.split(',')[1]
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)

    JSZip.loadAsync(bytes.buffer)
      .then(zip => {
        const slideFiles = Object.keys(zip.files)
          .filter(f => f.match(/^ppt\/slides\/slide\d+\.xml$/))
          .sort((a, b) => {
            const na = parseInt(a.match(/\d+/)[0])
            const nb = parseInt(b.match(/\d+/)[0])
            return na - nb
          })

        return Promise.all(slideFiles.map(async (path, i) => {
          const xml = await zip.files[path].async('text')
          const parser = new DOMParser()
          const doc = parser.parseFromString(xml, 'text/xml')
          const textNodes = Array.from(doc.querySelectorAll('t'))
          const text = textNodes.map(n => n.textContent).join(' ').trim()
          return { index: i + 1, text }
        }))
      })
      .then(result => setSlides(result))
      .catch(() => setError('Failed to parse PPTX'))
  }, [dataUrl])

  if (error) return <div className="p-6 font-mono" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-error, #ef4444)' }}>{error}</div>
  if (!slides) return <div className="p-6 font-mono" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Parsing slides…</div>

  const current = slides[activeSlide]

  return (
    <div className="flex flex-col h-full">
      {/* Slide nav */}
      <div
        className="flex items-center gap-2 px-3 shrink-0 border-b"
        style={{ height: 40, borderColor: 'var(--color-border)' }}
      >
        <button
          onClick={() => setActiveSlide(s => Math.max(0, s - 1))}
          disabled={activeSlide === 0}
          className="w-6 h-6 flex items-center justify-center rounded transition-colors hover:bg-[var(--color-surface-hover)] disabled:opacity-30"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <ChevronLeft size={12} strokeWidth={1.5} />
        </button>
        <span className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          Slide {activeSlide + 1} / {slides.length}
        </span>
        <button
          onClick={() => setActiveSlide(s => Math.min(slides.length - 1, s + 1))}
          disabled={activeSlide >= slides.length - 1}
          className="w-6 h-6 flex items-center justify-center rounded transition-colors hover:bg-[var(--color-surface-hover)] disabled:opacity-30"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <ChevronRight size={12} strokeWidth={1.5} />
        </button>
        <div className="flex-1" />
        <span className="font-mono" style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-muted)' }}>Text only</span>
      </div>

      {/* Slide thumbnail strip */}
      <div
        className="flex gap-1 px-2 py-2 overflow-x-auto shrink-0 border-b"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-2)' }}
      >
        {slides.map((s, i) => (
          <button
            key={i}
            onClick={() => setActiveSlide(i)}
            className="shrink-0 rounded-sm transition-all"
            style={{
              width: 56,
              height: 36,
              background: i === activeSlide ? 'var(--color-accent-dim)' : 'var(--color-surface)',
              border: `1px solid ${i === activeSlide ? 'var(--color-accent)' : 'var(--color-border)'}`,
              fontSize: 8,
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text-muted)',
              overflow: 'hidden',
              padding: '2px 4px',
              textAlign: 'left',
              lineHeight: 1.3,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 1 }}>{i + 1}</div>
            <div style={{ overflow: 'hidden', maxHeight: 20 }}>{s.text.slice(0, 40)}</div>
          </button>
        ))}
      </div>

      {/* Slide content */}
      <div className="flex-1 overflow-auto min-h-0 p-6 flex items-start justify-center">
        <div
          className="w-full max-w-sm rounded-xl flex items-center justify-center"
          style={{
            aspectRatio: '16/9',
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            padding: '24px',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-primary)',
              lineHeight: 1.6,
              textAlign: 'center',
              whiteSpace: 'pre-wrap',
            }}
          >
            {current?.text || <span style={{ color: 'var(--color-text-muted)' }}>Empty slide</span>}
          </p>
        </div>
      </div>
    </div>
  )
}

/* ── Main FileViewer ── */
export function FileViewer({ attachment, onClose }) {
  const { name, type, dataUrl } = attachment

  const renderContent = () => {
    if (type === 'application/pdf' || name.endsWith('.pdf')) {
      return <PdfViewer dataUrl={dataUrl} />
    }
    if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || name.endsWith('.docx')) {
      return <DocxViewer dataUrl={dataUrl} />
    }
    if (type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || name.endsWith('.xlsx') || name.endsWith('.csv')) {
      return <XlsxViewer dataUrl={dataUrl} />
    }
    if (type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || name.endsWith('.pptx')) {
      return <PptxViewer dataUrl={dataUrl} />
    }
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <File size={32} strokeWidth={1} style={{ color: 'var(--color-text-muted)' }} />
        <p className="font-mono" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          Preview not available for this file type
        </p>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col shrink-0 border-l"
      style={{
        width: 480,
        borderColor: 'var(--color-border)',
        background: 'var(--color-surface)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 shrink-0 border-b"
        style={{ height: 48, borderColor: 'var(--color-border)' }}
      >
        <FileText size={14} strokeWidth={1.5} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
        <span
          className="flex-1 font-mono truncate"
          style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}
        >
          {name}
        </span>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-surface-hover)]"
          style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}
        >
          <X size={14} strokeWidth={1.5} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {renderContent()}
      </div>
    </div>
  )
}
