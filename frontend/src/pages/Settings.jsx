import { useState } from 'react'
import { useUIStore, ACCENT_MAP } from '@/store/uiStore'
import { cn } from '@/lib/cn'

const THEME_LABELS = {
  'nothing-dark':  'Nothing Dark',
  'nothing-light': 'Nothing Light',
  'midnight':      'Midnight',
  'terminal':      'Terminal',
  'warm-paper':    'Warm Paper',
  'sakura':        'Sakura',
  'forest':        'Forest',
  'win95':         'WIN95',
}

const THEME_PREVIEWS = {
  'nothing-dark':  { bg: '#080808', surface: '#101010', accent: '#fff',     text: '#f0f0f0' },
  'nothing-light': { bg: '#f5f5f0', surface: '#fff',    accent: '#0a0a0a',  text: '#0a0a0a' },
  'midnight':      { bg: '#0d1117', surface: '#161b22', accent: '#58a6ff',  text: '#e6edf3' },
  'terminal':      { bg: '#000',    surface: '#001100', accent: '#00ff41',  text: '#00ff41' },
  'warm-paper':    { bg: '#f4ede4', surface: '#fdf6ed', accent: '#2c1f14',  text: '#2c1f14' },
  'sakura':        { bg: '#1a0f14', surface: '#231520', accent: '#ff85b3',  text: '#f5d5e8' },
  'forest':        { bg: '#0d1408', surface: '#111c0c', accent: '#6dcc50',  text: '#d4ebc8' },
  'win95':         { bg: '#008080', surface: '#c0c0c0', accent: '#000080',  text: '#000000', win95: true },
}

const TABS = ['Appearance', 'Editor', 'AI', 'Data', 'Shortcuts']

function ThemeSwatch({ themeKey, active, onClick }) {
  const p = THEME_PREVIEWS[themeKey]
  const isWin95 = themeKey === 'win95'

  const win95Preview = (
    <div className="w-full h-12 overflow-hidden" style={{ background: '#008080' }}>
      {/* fake win95 window */}
      <div style={{
        margin: '4px 6px 0',
        background: '#c0c0c0',
        boxShadow: 'inset -1px -1px 0 #808080, inset 1px 1px 0 #fff, inset -2px -2px 0 #404040, inset 2px 2px 0 #dfdfdf',
      }}>
        {/* title bar */}
        <div style={{
          background: 'linear-gradient(to right, #000080, #1084d0)',
          padding: '1px 3px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ color: '#fff', fontSize: 7, fontFamily: 'Tahoma, Arial, sans-serif', fontWeight: 700 }}>
            Noting
          </span>
          <div style={{ display: 'flex', gap: 1 }}>
            {['_','□','×'].map(c => (
              <span key={c} style={{
                width: 9, height: 9, background: '#c0c0c0', fontSize: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'inset -1px -1px 0 #808080, inset 1px 1px 0 #fff',
                color: '#000', fontFamily: 'monospace',
              }}>{c}</span>
            ))}
          </div>
        </div>
        {/* content area */}
        <div style={{ background: '#fff', height: 18, padding: '2px 3px' }}>
          <div style={{ height: 2, width: 28, background: '#000', marginBottom: 2 }} />
          <div style={{ height: 2, width: 20, background: '#808080' }} />
        </div>
      </div>
    </div>
  )

  return (
    <button
      onClick={onClick}
      className="flex flex-col gap-2 p-3 border text-left transition-all duration-[150ms]"
      style={{
        borderRadius: 8,
        borderColor: active ? 'var(--color-accent)' : 'var(--color-border)',
        background: active ? 'var(--color-accent-dim)' : 'transparent',
      }}
    >
      {isWin95 ? win95Preview : (
        <div className="w-full h-12 overflow-hidden flex" style={{ background: p.bg, borderRadius: 4 }}>
          <div className="w-8 h-full border-r" style={{ background: p.surface, borderColor: p.accent + '33' }} />
          <div className="flex-1 flex flex-col justify-center px-2 gap-1">
            <div className="h-1.5 w-16 rounded" style={{ background: p.text + 'cc' }} />
            <div className="h-1 w-10 rounded" style={{ background: p.text + '66' }} />
            <div className="h-1 w-12 rounded" style={{ background: p.text + '44' }} />
          </div>
          <div className="w-4 flex items-center justify-center">
            <div className="w-2 h-2 rounded-sm" style={{ background: p.accent }} />
          </div>
        </div>
      )}
      <span className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
        {THEME_LABELS[themeKey]}
      </span>
      {active && (
        <span className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent)' }}>
          Active
        </span>
      )}
    </button>
  )
}

function AccentSwatch({ accentKey, active, onClick }) {
  const entry = ACCENT_MAP[accentKey]
  return (
    <button
      onClick={onClick}
      title={entry.label}
      className="flex flex-col items-center gap-1.5 transition-all duration-[150ms]"
    >
      <div
        className="w-8 h-8 border-2 transition-all"
        style={{
          borderRadius: 8,
          background: entry.color,
          borderColor: active ? entry.color : 'transparent',
          boxShadow: active ? `0 0 0 2px var(--color-bg), 0 0 0 4px ${entry.color}` : 'none',
        }}
      />
      <span
        className="font-mono"
        style={{
          fontSize: 'var(--text-xs)',
          color: active ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
        }}
      >
        {entry.label}
      </span>
    </button>
  )
}

function Section({ title, children }) {
  return (
    <div className="border p-6" style={{ borderRadius: 10, borderColor: 'var(--color-border)' }}>
      <h3 className="font-mono mb-4" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
        {title}
      </h3>
      {children}
    </div>
  )
}

function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: 'var(--color-border)' }}>
      <div className="flex flex-col gap-0.5">
        <span className="font-body text-sm" style={{ color: 'var(--color-text-primary)' }}>{label}</span>
        {description && (
          <span className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            {description}
          </span>
        )}
      </div>
      <div className="shrink-0 ml-4">{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative w-9 h-5 transition-colors duration-200"
      style={{
        borderRadius: 99,
        background: checked ? 'var(--color-accent)' : 'var(--color-surface-2)',
        border: '1px solid',
        borderColor: checked ? 'var(--color-accent)' : 'var(--color-border)',
      }}
    >
      <span
        className="absolute top-0.5 transition-all duration-200"
        style={{
          left: checked ? 'calc(100% - 18px)' : 2,
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: checked ? 'var(--color-bg)' : 'var(--color-text-muted)',
        }}
      />
    </button>
  )
}

function RangeSlider({ value, onChange, min, max, step, label }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-32"
        style={{ accentColor: 'var(--color-accent)' }}
      />
      <span className="font-mono w-8 text-right" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
        {value}{label}
      </span>
    </div>
  )
}

// ── Tab content ────────────────────────────────────

function AppearanceTab({ theme, setTheme, themes, accent, setAccent }) {
  return (
    <div className="flex flex-col gap-6">
      <Section title="Theme">
        <div className="grid grid-cols-3 gap-3">
          {themes.map(t => (
            <ThemeSwatch key={t} themeKey={t} active={theme === t} onClick={() => setTheme(t)} />
          ))}
        </div>
      </Section>

      <Section title="Accent Color">
        <p className="font-mono mb-4" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          Accent color affects highlights, active states, and interactive elements.
        </p>
        <div className="flex items-center gap-6">
          {Object.keys(ACCENT_MAP).map(key => (
            <AccentSwatch key={key} accentKey={key} active={accent === key} onClick={() => setAccent(key)} />
          ))}
        </div>
      </Section>
    </div>
  )
}

function EditorTab() {
  const [fontSize, setFontSize] = useState(16)
  const [lineHeight, setLineHeight] = useState(18)
  const [autosave, setAutosave] = useState(2)
  const [spellcheck, setSpellcheck] = useState(true)
  const [typewriterMode, setTypewriterMode] = useState(false)
  const [focusMode, setFocusMode] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <Section title="Typography">
        <SettingRow label="Font size" description="Base editor font size">
          <RangeSlider value={fontSize} onChange={setFontSize} min={12} max={24} step={1} label="px" />
        </SettingRow>
        <SettingRow label="Line height" description="Line spacing multiplier">
          <RangeSlider value={lineHeight} onChange={setLineHeight} min={14} max={24} step={1} label="px" />
        </SettingRow>
      </Section>

      <Section title="Behaviour">
        <SettingRow label="Autosave delay" description="Seconds before auto-saving">
          <RangeSlider value={autosave} onChange={setAutosave} min={1} max={10} step={1} label="s" />
        </SettingRow>
        <SettingRow label="Spellcheck" description="Underline misspelled words">
          <Toggle checked={spellcheck} onChange={setSpellcheck} />
        </SettingRow>
        <SettingRow label="Typewriter mode" description="Keep cursor centred on screen">
          <Toggle checked={typewriterMode} onChange={setTypewriterMode} />
        </SettingRow>
        <SettingRow label="Focus mode" description="Fade out everything except current paragraph">
          <Toggle checked={focusMode} onChange={setFocusMode} />
        </SettingRow>
      </Section>
    </div>
  )
}

function AITab() {
  const [streaming, setStreaming] = useState(true)
  const [memory, setMemory] = useState(true)

  return (
    <div className="flex flex-col gap-6">
      <Section title="Provider">
        <SettingRow label="AI engine" description="Cloud inference via Groq API">
          <span className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent)' }}>
            Groq
          </span>
        </SettingRow>
        <SettingRow label="Model" description="Change model via the AI sidebar dropdown">
          <span className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            llama-3.3-70b-versatile
          </span>
        </SettingRow>
      </Section>

      <Section title="Behaviour">
        <SettingRow label="Streaming" description="Show AI response token by token">
          <Toggle checked={streaming} onChange={setStreaming} />
        </SettingRow>
        <SettingRow label="Note memory" description="AI remembers context from current note">
          <Toggle checked={memory} onChange={setMemory} />
        </SettingRow>
      </Section>
    </div>
  )
}

function DataTab() {
  return (
    <div className="flex flex-col gap-6">
      <Section title="Storage">
        <div className="flex flex-col gap-2">
          {[
            ['Data directory', '../data/'],
            ['Notes', 'notes.json'],
            ['Tasks', 'tasks.json'],
            ['Attachments', 'data/attachments/'],
            ['Embeddings', 'data/embeddings/'],
          ].map(([label, val]) => (
            <div key={label} className="flex items-center justify-between py-1.5 border-b last:border-0" style={{ borderColor: 'var(--color-border)' }}>
              <span className="font-body text-sm" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
              <span className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{val}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Export">
        <div className="flex flex-col gap-2">
          <button
            className="flex items-center justify-center h-9 px-4 border font-mono transition-all duration-[150ms]"
            style={{
              borderRadius: 8,
              borderColor: 'var(--color-border)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-secondary)',
            }}
          >
            Export all notes as JSON
          </button>
          <button
            className="flex items-center justify-center h-9 px-4 border font-mono transition-all duration-[150ms]"
            style={{
              borderRadius: 8,
              borderColor: 'var(--color-border)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-secondary)',
            }}
          >
            Export all notes as Markdown
          </button>
        </div>
      </Section>

      <Section title="About">
        <div className="flex flex-col gap-2">
          {[
            ['Version', 'v0.1.0'],
            ['AI Engine', 'Groq (cloud)'],
            ['Storage', 'localStorage'],
            ['Built with', 'React + Vite'],
          ].map(([label, val]) => (
            <div key={label} className="flex items-center justify-between py-1.5 border-b last:border-0" style={{ borderColor: 'var(--color-border)' }}>
              <span className="font-body text-sm" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
              <span className="font-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{val}</span>
            </div>
          ))}
          <p className="font-mono pt-2" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            Think local. Think deep.
          </p>
        </div>
      </Section>
    </div>
  )
}

function ShortcutsTab() {
  const shortcuts = [
    ['New Note',           'Ctrl+N'],
    ['New Task',          'Ctrl+Shift+N'],
    ['Search',            'Ctrl+F'],
    ['Toggle AI Sidebar', 'Ctrl+Shift+A'],
    ['Bold',              'Ctrl+B'],
    ['Italic',            'Ctrl+I'],
    ['Underline',         'Ctrl+U'],
    ['Code Block',        'Ctrl+Shift+C'],
    ['Heading 1',         'Ctrl+1'],
    ['Heading 2',         'Ctrl+2'],
    ['Heading 3',         'Ctrl+3'],
    ['Task List',         'Ctrl+Shift+T'],
    ['Back to List',      'Escape'],
  ]

  return (
    <Section title="Keyboard Shortcuts">
      <div className="flex flex-col">
        {shortcuts.map(([action, shortcut]) => (
          <div
            key={action}
            className="flex items-center justify-between py-2 border-b last:border-0"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <span className="font-body text-sm" style={{ color: 'var(--color-text-secondary)' }}>{action}</span>
            <kbd
              className="font-mono border"
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                background: 'var(--color-surface-2)',
                borderColor: 'var(--color-border)',
                borderRadius: 6,
                padding: '2px 8px',
              }}
            >
              {shortcut}
            </kbd>
          </div>
        ))}
      </div>
    </Section>
  )
}

// ── Main Settings page ────────────────────────────

export function Settings() {
  const { theme, setTheme, themes, accent, setAccent } = useUIStore()
  const [activeTab, setActiveTab] = useState('Appearance')

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 shrink-0 border-b"
        style={{ height: 48, borderColor: 'var(--color-border)' }}
      >
        <h2 className="font-mono" style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
          Settings
        </h2>
      </div>

      {/* Tabs */}
      <div
        className="flex items-center gap-1 px-4 border-b shrink-0"
        style={{ borderColor: 'var(--color-border)', height: 40 }}
      >
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="font-mono px-3 h-full transition-colors duration-[150ms] relative"
            style={{
              fontSize: 'var(--text-xs)',
              color: activeTab === tab ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
            }}
          >
            {tab}
            {activeTab === tab && (
              <span
                className="absolute bottom-0 left-0 right-0"
                style={{ height: 2, background: 'var(--color-accent)', borderRadius: '2px 2px 0 0' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 min-h-0">
        <div className="max-w-2xl mx-auto">
          {activeTab === 'Appearance' && (
            <AppearanceTab theme={theme} setTheme={setTheme} themes={themes} accent={accent} setAccent={setAccent} />
          )}
          {activeTab === 'Editor'     && <EditorTab />}
          {activeTab === 'AI'         && <AITab />}
          {activeTab === 'Data'       && <DataTab />}
          {activeTab === 'Shortcuts'  && <ShortcutsTab />}
        </div>
      </div>
    </div>
  )
}
