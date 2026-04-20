// Center panel v2 — Obsidian/Notion inspired layout, more breathing room
const { useState, useRef, useEffect } = React;

// ─── Sample Data ───────────────────────────────────────────────
const SAMPLE_NOTES = [
  { id: '1', title: 'Q2 Product Roadmap', folder: 'work', tags: ['product', 'planning'], pinned: true, starred: true,
    preview: 'Key initiatives for Q2: redesign onboarding flow, ship mobile app v2, integrate payment processor. Timeline aligned with engineering.',
    content: `<h1>Q2 Product Roadmap</h1><p>Key initiatives for Q2 that we need to ship before the end of June.</p><h2>Engineering</h2><ul><li>Redesign onboarding flow — reduces drop-off by ~30%</li><li>Mobile app v2 — new navigation paradigm</li><li>Payment processor integration</li></ul><h2>Design</h2><p>Full design audit of core flows. Ship new design system by April 30.</p><blockquote>Priority: shipping matters more than perfection right now.</blockquote>`,
    created: 'Apr 12, 2026', modified: '2h ago', words: 342, readTime: '2 min' },
  { id: '2', title: 'Meeting Notes — Apr 19', folder: 'work', tags: ['meetings'],
    preview: 'Attendees: Kabir, Sarah, Dev team. Discussed sprint priorities, blocking issues on auth module, new hire onboarding plan.',
    content: `<h1>Meeting Notes — Apr 19</h1><p><strong>Date:</strong> April 19, 2026<br/><strong>Attendees:</strong> Kabir, Sarah, Dev team</p><h2>Agenda</h2><ul><li>Sprint priorities</li><li>Blocking issues on auth module</li><li>New hire onboarding plan</li></ul><h2>Action Items</h2><ul><li>Kabir → fix auth module by Friday</li><li>Sarah → prepare onboarding doc</li><li>Dev team → code review backlog</li></ul>`,
    created: 'Apr 19, 2026', modified: '20m ago', words: 128, readTime: '1 min' },
  { id: '3', title: 'LLM Architecture Notes', folder: 'research', tags: ['ai', 'research'],
    preview: 'Exploring transformer attention mechanisms. Key insight: KV cache dramatically reduces inference cost at longer context lengths.',
    content: `<h1>LLM Architecture Notes</h1><p>Deep dive into transformer attention mechanisms and their implications for local inference.</p><h2>Key Concepts</h2><p>The <code>KV cache</code> stores key-value pairs from previous tokens, dramatically reducing inference cost at longer context lengths.</p><pre>def attention(q, k, v):\n    scores = q @ k.T / sqrt(d_k)\n    return softmax(scores) @ v</pre><h2>Observations</h2><blockquote>At Q4 quantization, mistral:7b fits in ~4GB VRAM with minimal quality loss.</blockquote>`,
    created: 'Apr 10, 2026', modified: 'Yesterday', words: 891, readTime: '5 min' },
  { id: '4', title: 'Thinking Fast and Slow', folder: 'personal', tags: ['books', 'psychology'],
    preview: 'System 1 vs System 2 thinking. Kahneman\'s dual process theory. Cognitive biases: anchoring, availability heuristic, loss aversion.',
    content: `<h1>Thinking Fast and Slow</h1><p><em>Daniel Kahneman</em> — finished April 2026</p><h2>Core Framework</h2><p><strong>System 1:</strong> Fast, automatic, intuitive.<br/><strong>System 2:</strong> Slow, deliberate, effortful.</p><h2>Key Biases</h2><ul><li><strong>Anchoring</strong> — first number heard skews all subsequent estimates</li><li><strong>Availability heuristic</strong> — what comes to mind easily feels more probable</li><li><strong>Loss aversion</strong> — losses hurt ~2× more than equivalent gains feel good</li></ul>`,
    created: 'Apr 5, 2026', modified: '2 days ago', words: 620, readTime: '4 min' },
  { id: '5', title: 'INK — Design Decisions', folder: 'work', tags: ['design', 'product'],
    preview: 'Why Nothing OS aesthetic? Sharp edges signal precision. The aesthetic self-selects for power users who distrust flashy UX.',
    content: `<h1>INK — Design Decisions</h1><h2>Why Nothing OS Aesthetic?</h2><p>Sharp edges signal precision. The monochrome palette removes color as a distraction. The aesthetic self-selects for power users who distrust flashy UX.</p><h2>Font Choices</h2><p><strong>Space Mono</strong> for UI chrome — the dot-matrix feel is on-brand.<br/><strong>Geist</strong> for content — readable at length, not boring.</p><h2>No Rounded Corners</h2><p>Every rounded corner is a small lie — pretending the tool is friendlier than it is.</p>`,
    created: 'Apr 18, 2026', modified: '1 day ago', words: 445, readTime: '3 min' },
  { id: '6', title: 'Grocery + Errands', folder: 'personal', tags: ['personal'],
    preview: 'Milk, eggs, bread, coffee beans (Ethiopian). Drop off dry cleaning. Pick up prescription.',
    content: `<h1>Grocery + Errands</h1><h2>Grocery</h2><ul><li>Milk</li><li>Eggs (free range)</li><li>Bread (sourdough)</li><li>Coffee beans — Ethiopian single origin</li><li>Olive oil</li></ul><h2>Errands</h2><ul><li>Drop off dry cleaning — before 6pm</li><li>Pick up prescription at Walgreens</li><li>Return library books</li></ul>`,
    created: 'Apr 19, 2026', modified: '3h ago', words: 48, readTime: '< 1 min' },
];

const SAMPLE_TASKS = [
  { id: 't1', title: 'Finish INK prototype', desc: 'Complete the interactive UI prototype for review', due: 'Apr 20, 2026', priority: 'urgent', status: 'in-progress', tags: ['design'] },
  { id: 't2', title: 'Review PRD with team', desc: 'Go through milestone 2 requirements', due: 'Apr 21, 2026', priority: 'high', status: 'todo', tags: ['product'] },
  { id: 't3', title: 'Set up Ollama locally', desc: 'Pull mistral:7b and nomic-embed-text models', due: 'Apr 22, 2026', priority: 'high', status: 'todo', tags: ['dev'] },
  { id: 't4', title: 'Write architecture doc', desc: 'FastAPI + React structure, file layout', due: 'Apr 23, 2026', priority: 'medium', status: 'done', tags: ['dev'] },
  { id: 't5', title: 'Design system audit', desc: 'Compare design system vs prototype output', due: 'Apr 25, 2026', priority: 'low', status: 'todo', tags: ['design'] },
  { id: 't6', title: 'Repo scaffolding', desc: 'Set up monorepo, run.bat, install deps', due: 'Apr 19, 2026', priority: 'urgent', status: 'done', tags: ['dev'] },
];

const priorityColors = { urgent: 'var(--color-priority-urgent)', high: 'var(--color-priority-high)', medium: 'var(--color-priority-medium)', low: 'var(--color-priority-low)', none: 'var(--color-text-muted)' };

// ─── NotesList ────────────────────────────────────────────────
const NotesList = ({ notes, activeNoteId, onNoteClick, viewMode, setViewMode, activeFolder, searchQuery, setSearchQuery }) => {
  const filtered = notes.filter(n => {
    if (activeFolder && n.folder !== activeFolder) return false;
    if (searchQuery) return n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.preview.toLowerCase().includes(searchQuery.toLowerCase());
    return true;
  });

  const pinned = filtered.filter(n => n.pinned);
  const rest = filtered.filter(n => !n.pinned);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top bar */}
      <div style={cx.topBar}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
          <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input style={cx.searchInput} placeholder="Search notes..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <select style={cx.miniSelect}>
            <option>Last edited</option><option>Created</option><option>A–Z</option>
          </select>
          <div style={cx.viewToggle}>
            {['list', 'grid'].map(v => (
              <button key={v} title={v + ' view'} style={{ ...cx.viewBtn, background: viewMode === v ? 'var(--color-surface-active)' : 'transparent', color: viewMode === v ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }} onClick={() => setViewMode(v)}>
                {v === 'list'
                  ? <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                  : <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Folder breadcrumb */}
      <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>
            {activeFolder ? activeFolder.toUpperCase() : 'ALL NOTES'}
          </span>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--color-text-muted)', display: 'inline-block' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)' }}>{filtered.length} notes</span>
        </div>
      </div>

      {/* Notes */}
      <div style={{ flex: 1, overflow: 'auto', ...(viewMode === 'grid' ? { display: 'flex', flexWrap: 'wrap', gap: 12, padding: 20, alignContent: 'flex-start' } : {}) }}>
        {viewMode === 'list' && pinned.length > 0 && (
          <>
            <div style={cx.listGroupLabel}>◆ PINNED</div>
            {pinned.map(n => <NoteListItem key={n.id} note={n} isActive={activeNoteId === n.id} onClick={() => onNoteClick(n)} />)}
            {rest.length > 0 && <div style={cx.listGroupLabel}>NOTES</div>}
          </>
        )}
        {viewMode === 'list'
          ? rest.map(n => <NoteListItem key={n.id} note={n} isActive={activeNoteId === n.id} onClick={() => onNoteClick(n)} />)
          : filtered.map(n => <NoteGridCard key={n.id} note={n} isActive={activeNoteId === n.id} onClick={() => onNoteClick(n)} />)
        }
        {filtered.length === 0 && (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}>No notes found.</div>
        )}
      </div>
    </div>
  );
};

const NoteListItem = ({ note, isActive, onClick }) => (
  <div style={{ ...cx.noteListItem, ...(isActive ? cx.noteListItemActive : {}) }}
    onClick={onClick}
    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--color-surface)'; }}
    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, gap: 12 }}>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', fontWeight: 500, color: 'var(--color-text-primary)', lineHeight: 1.3, flex: 1, textWrap: 'pretty' }}>{note.title}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', flexShrink: 0, marginTop: 2 }}>{note.modified}</span>
    </div>
    <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', marginBottom: 10, lineHeight: 1.55 }}>
      {note.preview}
    </div>
    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
      <span style={{ ...cx.folderChip }}>{note.folder}</span>
      {note.tags.map(t => <span key={t} style={cx.tag}>{t}</span>)}
    </div>
  </div>
);

const NoteGridCard = ({ note, isActive, onClick }) => (
  <div style={{ ...cx.gridCard, ...(isActive ? { borderColor: 'var(--color-border-strong)', boxShadow: '0 0 0 1px var(--color-border-strong)' } : {}) }}
    onClick={onClick}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.background = 'var(--color-surface)'; }}
    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'var(--color-surface-2)'; } }}>
    <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 8, lineHeight: 1.3 }}>{note.title}</div>
    <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', lineHeight: 1.55, flex: 1, marginBottom: 14 }}>{note.preview}</div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: 4 }}>{note.tags.slice(0, 2).map(t => <span key={t} style={cx.tag}>{t}</span>)}</div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)' }}>{note.modified}</span>
    </div>
  </div>
);

// ─── NoteEditor ───────────────────────────────────────────────
const NoteEditor = ({ note, onBack }) => {
  const [title, setTitle] = useState(note.title);
  const [saveStatus, setSaveStatus] = useState('saved');
  const [selectionVisible, setSelectionVisible] = useState(false);
  const [floatPos, setFloatPos] = useState({ top: 0, left: 0 });
  const editorWrapRef = useRef(null);
  const saveTimer = useRef(null);

  useEffect(() => { setTitle(note.title); setSaveStatus('saved'); }, [note.id]);

  const triggerSave = () => {
    setSaveStatus('saving');
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setSaveStatus('saved'), 2000);
  };

  const handleMouseUp = () => {
    const sel = window.getSelection();
    if (sel && sel.toString().length > 2) {
      try {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const wrap = editorWrapRef.current?.getBoundingClientRect();
        if (wrap) {
          setFloatPos({ top: rect.top - wrap.top - 44, left: Math.max(8, Math.min(rect.left - wrap.left, wrap.width - 300)) });
          setSelectionVisible(true);
        }
      } catch (e) {}
    } else { setSelectionVisible(false); }
  };

  const execCmd = (cmd, val) => { document.execCommand(cmd, false, val); };

  const toolbarGroups = [
    [
      { label: 'H1', title: 'Heading 1', action: () => execCmd('formatBlock','h1') },
      { label: 'H2', title: 'Heading 2', action: () => execCmd('formatBlock','h2') },
      { label: 'H3', title: 'Heading 3', action: () => execCmd('formatBlock','h3') },
    ],
    [
      { label: 'B',  title: 'Bold',          style: { fontWeight: 700 },                         action: () => execCmd('bold') },
      { label: 'I',  title: 'Italic',         style: { fontStyle: 'italic' },                     action: () => execCmd('italic') },
      { label: 'U',  title: 'Underline',      style: { textDecoration: 'underline' },              action: () => execCmd('underline') },
      { label: 'S',  title: 'Strikethrough',  style: { textDecoration: 'line-through' },           action: () => execCmd('strikeThrough') },
    ],
    [
      { label: '•',   title: 'Bullet list',   action: () => execCmd('insertUnorderedList') },
      { label: '1.',  title: 'Numbered list', action: () => execCmd('insertOrderedList') },
      { label: '☑',  title: 'Checklist',     action: () => {} },
    ],
    [
      { label: '</>',  title: 'Code block',  action: () => execCmd('formatBlock','pre') },
      { label: '❝',   title: 'Quote',        action: () => execCmd('formatBlock','blockquote') },
      { label: '─',   title: 'Divider',      action: () => execCmd('insertHorizontalRule') },
    ],
    [
      { label: '⊞', title: 'Table',        action: () => {} },
      { label: '∑', title: 'Math / LaTeX', action: () => {} },
      { label: '⊕', title: 'Attach file',  action: () => {} },
    ],
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Back + title row */}
      <div style={{ padding: '14px 24px 12px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'flex-start', gap: 14, flexShrink: 0 }}>
        <button style={cx.backBtn} onClick={onBack}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-text-primary)'; e.currentTarget.style.background = 'var(--color-surface-hover)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'transparent'; }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div style={{ flex: 1 }}>
          <input
            style={cx.titleInput}
            value={title}
            onChange={e => { setTitle(e.target.value); triggerSave(); }}
            placeholder="Untitled"
          />
          {/* Meta row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            <span style={cx.folderChip}>{note.folder}</span>
            {note.tags.map(t => <span key={t} style={cx.tag}>{t}</span>)}
            <span style={{ ...cx.tag, borderStyle: 'dashed', cursor: 'pointer', color: 'var(--color-text-muted)' }}>+ tag</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', paddingTop: 4 }}>
          <button style={{ ...cx.iconToolBtn }} title="Version history">
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </button>
          <button style={{ ...cx.iconToolBtn }} title="Export">
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </button>
          <button style={{ ...cx.iconToolBtn }} title="More options">
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div style={cx.toolbar}>
        {toolbarGroups.map((group, gi) => (
          <React.Fragment key={gi}>
            {gi > 0 && <div style={cx.toolbarDivider} />}
            {group.map(btn => (
              <button key={btn.label} title={btn.title}
                style={{ ...cx.toolbarBtn, ...(btn.style || {}) }}
                onMouseDown={e => { e.preventDefault(); btn.action(); }}
                onMouseEnter={e => Object.assign(e.currentTarget.style, { background: 'var(--color-surface-hover)', color: 'var(--color-text-primary)' })}
                onMouseLeave={e => Object.assign(e.currentTarget.style, { background: 'transparent', color: 'var(--color-text-secondary)' })}>
                {btn.label}
              </button>
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* Editor area */}
      <div ref={editorWrapRef} style={{ flex: 1, overflow: 'auto', position: 'relative' }} onMouseUp={handleMouseUp}>
        {/* Floating toolbar */}
        {selectionVisible && (
          <div style={{ ...cx.floatingToolbar, top: floatPos.top, left: floatPos.left }}>
            {[
              { label: 'B', cmd: 'bold', style: { fontWeight: 700 } },
              { label: 'I', cmd: 'italic', style: { fontStyle: 'italic' } },
              { label: 'U', cmd: 'underline', style: { textDecoration: 'underline' } },
              { label: 'S', cmd: 'strikeThrough', style: { textDecoration: 'line-through' } },
            ].map(f => (
              <button key={f.label} style={{ ...cx.floatBtn }} onMouseDown={e => { e.preventDefault(); execCmd(f.cmd); }}>
                <span style={f.style}>{f.label}</span>
              </button>
            ))}
            <div style={{ width: 1, background: 'var(--color-border-strong)', margin: '4px 3px' }} />
            {['⚡ Explain', '≡ Summarize', '↺ Rephrase', '✦ Ask AI'].map(a => (
              <button key={a} style={{ ...cx.floatBtn, background: 'var(--color-accent-dim)', fontSize: 11 }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-active)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--color-accent-dim)'}>
                {a}
              </button>
            ))}
          </div>
        )}

        <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 40px 80px' }}>
          <div
            style={cx.editorContent}
            contentEditable
            suppressContentEditableWarning
            onInput={triggerSave}
            dangerouslySetInnerHTML={{ __html: note.content }}
          />
        </div>
      </div>

      {/* Footer */}
      <div style={cx.editorFooter}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: saveStatus === 'saved' ? 'var(--color-success)' : 'var(--color-warning)', display: 'inline-block', flexShrink: 0 }} />
          {saveStatus === 'saved' ? 'Saved' : 'Saving...'}
        </span>
        <span style={cx.footerDot} />
        <span>{note.words} words · {note.readTime} read</span>
        <span style={cx.footerDot} />
        <span>Created {note.created}</span>
        <span style={cx.footerDot} />
        <span>Modified {note.modified}</span>
      </div>
    </div>
  );
};

// ─── TasksView ────────────────────────────────────────────────
const statusLabels = { todo: 'To Do', 'in-progress': 'In Progress', done: 'Done', archived: 'Archived' };

const TasksView = ({ tasks, setTasks }) => {
  const [filter, setFilter] = useState('active');

  const filtered = tasks.filter(t =>
    filter === 'all'    ? true :
    filter === 'active' ? t.status !== 'done' && t.status !== 'archived' :
    filter === 'done'   ? t.status === 'done' : true
  );

  const toggleDone = id => setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'done' ? 'todo' : 'done' } : t));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={cx.topBar}>
        <div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>TASKS</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginLeft: 8 }}>— {filtered.length}</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['all', 'active', 'done'].map(f => (
            <button key={f} style={{ ...cx.pill, ...(filter === f ? cx.pillActive : {}) }} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
        <button style={cx.primaryBtn}>+ New Task</button>
      </div>

      {/* Table header */}
      <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 130px 90px 110px', gap: 0, padding: '8px 24px', borderBottom: '1px solid var(--color-border)', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', letterSpacing: '0.1em', flexShrink: 0 }}>
        <span/><span>TITLE</span><span>DUE</span><span>PRIORITY</span><span>STATUS</span>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {filtered.map(task => (
          <div key={task.id}
            style={{ display: 'grid', gridTemplateColumns: '28px 1fr 130px 90px 110px', gap: 0, padding: '14px 24px', borderBottom: '1px solid var(--color-border)', alignItems: 'center', opacity: task.status === 'done' ? 0.45 : 1, transition: 'all 150ms' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div onClick={() => toggleDone(task.id)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <div style={{ width: 16, height: 16, border: `1px solid ${task.status === 'done' ? 'var(--color-success)' : 'var(--color-border-strong)'}`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: task.status === 'done' ? 'var(--color-success)' : 'transparent', transition: 'all 150ms' }}>
                {task.status === 'done' && <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
            </div>
            <div style={{ paddingRight: 16 }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', textDecoration: task.status === 'done' ? 'line-through' : 'none', marginBottom: 3 }}>{task.title}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{task.desc}</div>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{task.due}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: priorityColors[task.priority], display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: priorityColors[task.priority], textTransform: 'uppercase', letterSpacing: '0.06em' }}>{task.priority}</span>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-secondary)', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', padding: '3px 7px', borderRadius: 8, display: 'inline-block' }}>{statusLabels[task.status]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── CalendarView ─────────────────────────────────────────────
const CalendarView = ({ tasks }) => {
  const [view, setView] = useState('month');
  const [current, setCurrent] = useState(new Date(2026, 3, 1));
  const year = current.getFullYear(), month = current.getMonth();
  const monthName = current.toLocaleString('default', { month: 'long' });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const tasksByDay = {};
  tasks.forEach(t => {
    const m = t.due.match(/Apr (\d+)/);
    if (m) { const d = +m[1]; tasksByDay[d] = tasksByDay[d] || []; tasksByDay[d].push(t); }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={cx.topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button style={cx.iconToolBtn} onClick={() => setCurrent(new Date(year, month - 1, 1))}>
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', minWidth: 120, textAlign: 'center' }}>{monthName} {year}</span>
          <button style={cx.iconToolBtn} onClick={() => setCurrent(new Date(year, month + 1, 1))}>
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <button style={{ ...cx.pill, marginLeft: 8 }} onClick={() => setCurrent(new Date(2026, 3, 1))}>Today</button>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['month', 'week', 'day'].map(v => (
            <button key={v} style={{ ...cx.pill, ...(view === v ? cx.pillActive : {}) }} onClick={() => setView(v)}>{v}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 20px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderLeft: '1px solid var(--color-border)', borderTop: '1px solid var(--color-border)', marginTop: 16 }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', letterSpacing: '0.08em', borderRight: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>{d}</div>
          ))}
          {days.map((day, i) => {
            const isToday = day === 19 && month === 3 && year === 2026;
            const dayTasks = day ? (tasksByDay[day] || []) : [];
            return (
              <div key={i} style={{ minHeight: 90, background: day ? 'var(--color-bg)' : 'var(--color-surface)', borderRight: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: day ? '8px 10px' : 0, transition: 'background 100ms' }}
                onMouseEnter={e => { if (day) e.currentTarget.style.background = 'var(--color-surface)'; }}
                onMouseLeave={e => { if (day) e.currentTarget.style.background = 'var(--color-bg)'; }}>
                {day && (
                  <>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: isToday ? 0 : 'none', background: isToday ? 'var(--color-accent)' : 'transparent', color: isToday ? 'var(--color-bg)' : 'var(--color-text-secondary)', marginBottom: 4 }}>{day}</span>
                    {dayTasks.slice(0, 2).map(t => (
                      <div key={t.id} style={{ borderLeft: `2px solid ${priorityColors[t.priority]}`, background: 'var(--color-surface-2)', padding: '2px 6px', marginBottom: 3, overflow: 'hidden' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{t.title}</span>
                      </div>
                    ))}
                    {dayTasks.length > 2 && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)' }}>+{dayTasks.length - 2}</span>}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── SettingsView ─────────────────────────────────────────────
const THEMES = [
  { id: 'nothing-dark',  label: 'Nothing Dark',  swatch: '#0a0a0a' },
  { id: 'nothing-light', label: 'Nothing Light',  swatch: '#f5f5f0' },
  { id: 'terminal',      label: 'Terminal',        swatch: '#001100' },
  { id: 'warm-paper',    label: 'Warm Paper',      swatch: '#f4ede4' },
  { id: 'midnight',      label: 'Midnight',         swatch: '#0d1117' },
  { id: 'sakura',        label: 'Sakura',           swatch: '#1a1014' },
  { id: 'forest',        label: 'Forest',           swatch: '#0c1208' },
];

const ACCENTS = [
  { id: 'white',   label: 'White',         color: '#f0f0f0' },
  { id: 'red',     label: 'Nothing Red',   color: '#eb0029' },
  { id: 'green',   label: 'Nothing Green', color: '#00d26a' },
  { id: 'blue',    label: 'Midnight Blue', color: '#58a6ff' },
  { id: 'amber',   label: 'Amber',         color: '#f59e0b' },
  { id: 'purple',  label: 'Purple',        color: '#a78bfa' },
];

const SettingsView = ({ theme, setTheme, accent, setAccent }) => {
  const [fontSize, setFontSize] = useState(16);
  const [autosave, setAutosave] = useState(2);
  const [activeTab, setActiveTab] = useState('appearance');

  const tabs = ['appearance', 'editor', 'ai', 'data', 'shortcuts'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={cx.topBar}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>SETTINGS</span>
      </div>

      {/* Settings tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--color-border)', padding: '0 24px', flexShrink: 0 }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: activeTab === tab ? 'var(--color-text-primary)' : 'var(--color-text-muted)', background: 'transparent', border: 'none', borderBottom: activeTab === tab ? '2px solid var(--color-accent)' : '2px solid transparent', padding: '10px 14px', cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'all 150ms', marginBottom: -1 }}>
            {tab}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '32px 40px', maxWidth: 640 }}>

        {activeTab === 'appearance' && (
          <>
            <SettSection title="Theme">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
                {THEMES.map(t => (
                  <button key={t.id} onClick={() => setTheme(t.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: theme === t.id ? 'var(--color-surface-active)' : 'var(--color-surface-2)', border: `1px solid ${theme === t.id ? 'var(--color-border-strong)' : 'var(--color-border)'}`, borderRadius: 8, cursor: 'pointer', transition: 'all 150ms' }}>
                    <span style={{ width: 16, height: 16, borderRadius: 6, background: t.swatch, border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: theme === t.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', textAlign: 'left', lineHeight: 1.3 }}>{t.label}</span>
                  </button>
                ))}
              </div>
            </SettSection>

            <SettSection title="Accent Color">
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {ACCENTS.map(a => (
                  <button key={a.id} onClick={() => setAccent(a.id)}
                    title={a.label}
                    style={{ width: 36, height: 36, borderRadius: 8, background: a.color, border: `2px solid ${accent === a.id ? 'var(--color-text-primary)' : 'transparent'}`, outline: accent === a.id ? '2px solid var(--color-border-strong)' : 'none', outlineOffset: 2, cursor: 'pointer', transition: 'all 150ms', flexShrink: 0 }} />
                ))}
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 8 }}>Accent affects sidebar indicators, active states, and interactive elements.</p>
            </SettSection>
          </>
        )}

        {activeTab === 'editor' && (
          <>
            <SettSection title="Font Size">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <input type="range" min={13} max={20} value={fontSize} onChange={e => setFontSize(+e.target.value)} style={{ flex: 1, accentColor: 'var(--color-accent)' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', minWidth: 40 }}>{fontSize}px</span>
              </div>
            </SettSection>
            <SettSection title="Autosave Delay">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <input type="range" min={1} max={10} value={autosave} onChange={e => setAutosave(+e.target.value)} style={{ flex: 1, accentColor: 'var(--color-accent)' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', minWidth: 40 }}>{autosave}s</span>
              </div>
            </SettSection>
            <SettSection title="Default Folder">
              <select>
                <option>Root (no folder)</option><option>Work</option><option>Personal</option>
              </select>
            </SettSection>
          </>
        )}

        {activeTab === 'ai' && (
          <>
            <SettSection title="Model">
              <select>
                <option>mistral:7b-instruct-q4_K_M</option><option>llama3:8b</option><option>gemma:7b</option>
              </select>
            </SettSection>
            <SettSection title="Context Window">
              <select>
                <option>Last 20 messages</option><option>Last 10</option><option>Last 50</option>
              </select>
            </SettSection>
          </>
        )}

        {activeTab === 'data' && (
          <SettSection title="Manage Data">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Export all notes as ZIP', danger: false },
                { label: 'Import from Obsidian / Notion', danger: false },
                { label: 'Backup to JSON', danger: false },
                { label: 'Clear all data', danger: true },
              ].map(({ label, danger }) => (
                <button key={label} style={{ padding: '9px 14px', background: 'transparent', border: `1px solid ${danger ? 'var(--color-error)' : 'var(--color-border)'}`, color: danger ? 'var(--color-error)' : 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', borderRadius: 8, cursor: 'pointer', textAlign: 'left', transition: 'all 150ms', letterSpacing: '0.04em' }}>{label}</button>
              ))}
            </div>
          </SettSection>
        )}

        {activeTab === 'shortcuts' && (
          <SettSection title="Keyboard Shortcuts">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid var(--color-border)' }}>
              {[
                ['New Note', 'Ctrl+N'],
                ['New Task', 'Ctrl+Shift+N'],
                ['Search', 'Ctrl+F'],
                ['Toggle AI Sidebar', 'Ctrl+Shift+A'],
                ['Bold', 'Ctrl+B'],
                ['Italic', 'Ctrl+I'],
                ['Underline', 'Ctrl+U'],
                ['Code Block', 'Ctrl+Shift+C'],
                ['Heading 1', 'Ctrl+1'],
                ['Heading 2', 'Ctrl+2'],
                ['Back to List', 'Escape'],
              ].map(([action, shortcut], i) => (
                <div key={action} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: i < 10 ? '1px solid var(--color-border)' : 'none' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{action}</span>
                  <kbd style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-muted)', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', padding: '2px 7px', borderRadius: 8 }}>{shortcut}</kbd>
                </div>
              ))}
            </div>
          </SettSection>
        )}

        <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid var(--color-border)', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', letterSpacing: '0.06em' }}>
          INK v0.1.0 · Local-first · Powered by Ollama · Nothing OS aesthetic
        </div>
      </div>
    </div>
  );
};

const SettSection = ({ title, children }) => (
  <div style={{ marginBottom: 32 }}>
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', letterSpacing: '0.12em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
      {title.toUpperCase()}
      <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
    </div>
    {children}
  </div>
);

// ─── Shared styles ─────────────────────────────────────────────
const cx = {
  topBar: {
    height: 52, display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', padding: '0 20px', gap: 12,
    borderBottom: '1px solid var(--color-border)', flexShrink: 0,
  },
  searchInput: {
    width: '100%', background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
    padding: '7px 10px 7px 32px',
    borderRadius: 8, outline: 'none', transition: 'border-color 150ms',
  },
  miniSelect: {
    background: 'transparent', border: '1px solid var(--color-border)',
    color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)', padding: '5px 8px',
    borderRadius: 8, cursor: 'pointer', outline: 'none',
  },
  viewToggle: {
    display: 'flex', border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden',
  },
  viewBtn: {
    width: 28, height: 28, border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 100ms',
  },
  listGroupLabel: {
    fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)',
    letterSpacing: '0.1em', padding: '12px 20px 6px',
  },
  noteListItem: {
    padding: '18px 20px',
    borderBottom: '1px solid var(--color-border)',
    cursor: 'pointer', transition: 'background 100ms',
    background: 'transparent',
  },
  noteListItemActive: {
    background: 'var(--color-surface-active)',
    borderLeft: '2px solid var(--color-accent)',
    paddingLeft: 18,
  },
  gridCard: {
    width: 'calc(50% - 6px)',
    background: 'var(--color-surface-2)',
    border: '1px solid var(--color-border)',
    padding: '18px 20px', borderRadius: 10,
    cursor: 'pointer', transition: 'all 150ms',
    display: 'flex', flexDirection: 'column',
    minHeight: 150,
  },
  folderChip: {
    height: 20, padding: '0 8px',
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface-2)',
    borderRadius: 8,
    fontFamily: 'var(--font-mono)',
    fontSize: 10, color: 'var(--color-text-muted)',
    display: 'inline-flex', alignItems: 'center',
    letterSpacing: '0.04em',
  },
  tag: {
    height: 20, padding: '0 7px',
    border: '1px solid var(--color-border)',
    background: 'transparent',
    borderRadius: 8,
    fontFamily: 'var(--font-mono)',
    fontSize: 10, color: 'var(--color-text-secondary)',
    display: 'inline-flex', alignItems: 'center',
  },
  toolbar: {
    height: 40, background: 'var(--color-surface)',
    borderBottom: '1px solid var(--color-border)',
    display: 'flex', alignItems: 'center',
    padding: '0 16px', gap: 1, flexShrink: 0, overflowX: 'auto',
  },
  toolbarBtn: {
    width: 28, height: 28, background: 'transparent',
    border: 'none', borderRadius: 8,
    color: 'var(--color-text-secondary)',
    fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 100ms', flexShrink: 0,
  },
  toolbarDivider: {
    width: 1, height: 18, background: 'var(--color-border)', margin: '0 4px', flexShrink: 0,
  },
  editorContent: {
    fontFamily: 'var(--font-editor)', fontSize: 16,
    lineHeight: 1.8, color: 'var(--color-text-primary)',
    outline: 'none', minHeight: '60vh',
  },
  editorFooter: {
    height: 38, borderTop: '1px solid var(--color-border)',
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '0 24px', fontFamily: 'var(--font-mono)',
    fontSize: 11, color: 'var(--color-text-muted)', flexShrink: 0,
  },
  footerDot: {
    width: 3, height: 3, borderRadius: '50%',
    background: 'var(--color-border-strong)', flexShrink: 0,
    display: 'inline-block',
  },
  backBtn: {
    width: 28, height: 28, background: 'transparent',
    border: '1px solid var(--color-border)',
    borderRadius: 8, color: 'var(--color-text-muted)',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 150ms', flexShrink: 0, marginTop: 4,
  },
  titleInput: {
    background: 'transparent', border: 'none',
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-xl)', fontWeight: 600,
    width: '100%', outline: 'none', lineHeight: 1.2,
  },
  iconToolBtn: {
    width: 28, height: 28, background: 'transparent',
    border: '1px solid var(--color-border)',
    borderRadius: 8, color: 'var(--color-text-muted)',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 150ms',
  },
  floatingToolbar: {
    position: 'absolute', zIndex: 100,
    background: 'var(--color-bg)',
    border: '1px solid var(--color-border-strong)',
    borderRadius: 8, boxShadow: '0 6px 24px rgba(0,0,0,0.6)',
    padding: 3, display: 'flex', alignItems: 'center', gap: 1,
    animation: 'floatIn 100ms ease', height: 34,
  },
  floatBtn: {
    height: 28, padding: '0 8px',
    background: 'transparent', border: 'none',
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)',
    cursor: 'pointer', borderRadius: 8,
    display: 'flex', alignItems: 'center', transition: 'background 100ms',
  },
  pill: {
    background: 'transparent', border: '1px solid var(--color-border)',
    color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)', padding: '4px 10px',
    borderRadius: 8, cursor: 'pointer', transition: 'all 150ms',
    letterSpacing: '0.04em',
  },
  pillActive: {
    background: 'var(--color-surface-active)',
    color: 'var(--color-text-primary)',
    borderColor: 'var(--color-border-strong)',
  },
  primaryBtn: {
    background: 'var(--color-accent)', color: 'var(--color-bg)',
    border: 'none', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
    padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
    letterSpacing: '0.04em',
  },
};

Object.assign(window, {
  NotesList, NoteEditor, TasksView, CalendarView, SettingsView,
  SAMPLE_NOTES, SAMPLE_TASKS, THEMES, ACCENTS, cx,
});
