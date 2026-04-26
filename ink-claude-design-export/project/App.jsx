// App v2 — accent color, tweaks→settings, clean layout
const { useState, useEffect } = React;

const ACCENT_MAP = {
  white:  '#f0f0f0',
  red:    '#eb0029',
  green:  '#00d26a',
  blue:   '#58a6ff',
  amber:  '#f59e0b',
  purple: '#a78bfa',
};

const App = () => {
  const [theme,  setTheme]  = useState(() => localStorage.getItem('ink-theme')  || 'nothing-dark');
  const [accent, setAccent] = useState(() => localStorage.getItem('ink-accent') || 'white');
  const [activeSection, setActiveSection] = useState('notes');
  const [activeFolder,  setActiveFolder]  = useState(null);
  const [activeNote,    setActiveNote]    = useState(null);
  const [viewMode,  setViewMode]  = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiOpen, setAiOpen] = useState(false);
  const [notes, setNotes] = useState(SAMPLE_NOTES);
  const [tasks, setTasks] = useState(SAMPLE_TASKS);

  // Apply theme + accent CSS vars
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ink-theme', theme);
  }, [theme]);

  useEffect(() => {
    const color = ACCENT_MAP[accent] || ACCENT_MAP.white;
    document.documentElement.style.setProperty('--color-accent', color);
    // derive dim from accent with low opacity
    document.documentElement.style.setProperty('--color-accent-dim', color + '18');
    localStorage.setItem('ink-accent', accent);
  }, [accent]);

  // Tweaks panel → open Settings
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === '__activate_edit_mode')   setActiveSection('settings');
      if (e.data?.type === '__deactivate_edit_mode') { /* no-op — settings stays open */ }
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && !e.shiftKey && e.key === 'n') { e.preventDefault(); handleNewNote(); }
      if (e.ctrlKey && e.shiftKey  && e.key === 'N') { e.preventDefault(); handleNewTask(); }
      if (e.ctrlKey && e.shiftKey  && e.key === 'A') { e.preventDefault(); setAiOpen(v => !v); }
      if (e.key === 'Escape' && activeSection === 'editor') handleBack();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeSection]);

  const handleNewNote = () => {
    const note = {
      id: Date.now().toString(),
      title: 'Untitled', folder: activeFolder || 'work',
      tags: [], preview: '',
      content: '<p></p>',
      created: 'Apr 19, 2026', modified: 'just now',
      words: 0, readTime: '< 1 min',
      pinned: false, starred: false,
    };
    setNotes(prev => [note, ...prev]);
    setActiveNote(note);
    setActiveSection('editor');
  };

  const handleNewTask = () => setActiveSection('tasks');

  const handleNoteClick = (note) => {
    setActiveNote(note);
    setActiveSection('editor');
  };

  const handleBack = () => {
    setActiveNote(null);
    setActiveSection('notes');
  };

  const isNotesSection = activeSection === 'notes' || activeSection === 'editor';

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--color-bg)', overflow: 'hidden', position: 'relative' }}>

      {/* Left Sidebar */}
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        activeFolder={activeFolder}
        setActiveFolder={setActiveFolder}
        onNewNote={handleNewNote}
        onNewTask={handleNewTask}
      />

      {/* Center panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {activeSection === 'editor' && activeNote
          ? <NoteEditor note={activeNote} onBack={handleBack} />
          : activeSection === 'tasks'
          ? <TasksView tasks={tasks} setTasks={setTasks} />
          : activeSection === 'calendar'
          ? <CalendarView tasks={tasks} />
          : activeSection === 'settings'
          ? <SettingsView theme={theme} setTheme={setTheme} accent={accent} setAccent={setAccent} />
          : <NotesList
              notes={notes}
              activeNoteId={activeNote?.id}
              onNoteClick={handleNoteClick}
              viewMode={viewMode}
              setViewMode={setViewMode}
              activeFolder={activeFolder}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
        }
      </div>

      {/* AI toggle tab */}
      <button
        onClick={() => setAiOpen(v => !v)}
        title="Toggle AI (Ctrl+Shift+A)"
        style={{
          position: 'absolute', right: aiOpen ? 320 : 0,
          top: '50%', transform: 'translateY(-50%)',
          width: 24, height: 52, zIndex: 52,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRight: aiOpen ? '1px solid var(--color-border)' : 'none',
          borderLeft: aiOpen ? 'none' : '1px solid var(--color-border)',
          borderRadius: aiOpen ? '0 2px 2px 0' : '2px 0 0 2px',
          cursor: 'pointer', color: 'var(--color-text-muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'right 250ms ease, background 150ms',
          flexShrink: 0,
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-hover)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--color-surface)'}
      >
        <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          {aiOpen
            ? <polyline points="9 18 15 12 9 6"/>
            : <><path d="M12 3c-4.5 3-6 6-6 9s1.5 6 6 9c4.5-3 6-6 6-9s-1.5-6-6-9z"/><path d="M12 3v18M6 12h12"/></>
          }
        </svg>
      </button>

      {/* AI Sidebar */}
      <div style={{ position: 'relative', width: aiOpen ? 320 : 0, transition: 'width 250ms ease', flexShrink: 0, overflow: 'visible' }}>
        <AISidebar isOpen={aiOpen} onClose={() => setAiOpen(false)} activeNote={activeNote} />
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
