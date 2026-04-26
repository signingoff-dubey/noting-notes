// Sidebar v2 — more breathing room, Nothing OS editorial feel
const Sidebar = ({ activeSection, setActiveSection, activeFolder, setActiveFolder, onNewNote, onNewTask }) => {
  const [expandedFolders, setExpandedFolders] = React.useState({ work: true });

  const folders = [
    { id: 'work',     name: 'Work',     count: 4 },
    { id: 'personal', name: 'Personal', count: 2 },
    { id: 'research', name: 'Research', count: 3 },
    { id: 'vault',    name: 'Vault',    count: 1, isVault: true },
  ];

  const navItems = [
    { id: 'notes',    label: 'Notes',    icon: IconNotes },
    { id: 'tasks',    label: 'Tasks',    icon: IconTasks },
    { id: 'calendar', label: 'Calendar', icon: IconCalendar },
  ];

  const isNotesActive = activeSection === 'notes' || activeSection === 'editor';

  return (
    <div style={sb.root}>
      {/* Logo / App name */}
      <div style={sb.header}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={sb.logo}>INK</span>
          <span style={sb.logoSub}>NOTES</span>
        </div>
        <span style={sb.version}>0.1</span>
      </div>

      {/* New buttons */}
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button style={sb.newBtn} onClick={onNewNote}
          onMouseEnter={e => Object.assign(e.currentTarget.style, { borderColor: 'var(--color-border-strong)', background: 'var(--color-surface-hover)', color: 'var(--color-text-primary)' })}
          onMouseLeave={e => Object.assign(e.currentTarget.style, { borderColor: 'var(--color-border)', background: 'transparent', color: 'var(--color-text-secondary)' })}>
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Note
        </button>
        <button style={{ ...sb.newBtn, borderStyle: 'dashed' }} onClick={onNewTask}
          onMouseEnter={e => Object.assign(e.currentTarget.style, { borderColor: 'var(--color-border-strong)', background: 'var(--color-surface-hover)', color: 'var(--color-text-primary)' })}
          onMouseLeave={e => Object.assign(e.currentTarget.style, { borderColor: 'var(--color-border)', background: 'transparent', color: 'var(--color-text-secondary)' })}>
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Task
        </button>
      </div>

      <div style={sb.divider} />

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {navItems.map(({ id, label, icon: Ico }) => {
          const isActive = id === 'notes' ? isNotesActive : activeSection === id;
          return (
            <div key={id} style={{ ...sb.navItem, ...(isActive ? sb.navActive : {}) }}
              onClick={() => { setActiveSection(id); setActiveFolder(null); }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--color-sidebar-item-hover)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
              <Ico active={isActive} />
              <span style={{ color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)' }}>{label}</span>
              {isActive && <span style={sb.activeDot} />}
            </div>
          );
        })}

        {/* Folders */}
        <div style={{ marginTop: 20 }}>
          <div style={sb.sectionLabel}>FOLDERS</div>
          {folders.map(folder => {
            const isActive = activeFolder === folder.id;
            return (
              <div key={folder.id}
                style={{ ...sb.navItem, paddingLeft: 28, ...(isActive ? sb.navActive : {}) }}
                onClick={() => { setActiveSection('notes'); setActiveFolder(folder.id); }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--color-sidebar-item-hover)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                {folder.isVault
                  ? <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="1"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  : <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                }
                <span style={{ flex: 1, fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>{folder.name}</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>{folder.count}</span>
              </div>
            );
          })}
        </div>

        {/* Library */}
        <div style={{ marginTop: 20 }}>
          <div style={sb.sectionLabel}>LIBRARY</div>
          {[
            { label: 'Starred', icon: <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
            { label: 'Recent',  icon: <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
            { label: 'All Tags', icon: <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg> },
          ].map(({ label, icon }) => (
            <div key={label} style={{ ...sb.navItem, paddingLeft: 28 }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--color-sidebar-item-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {icon}
              <span style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>{label}</span>
            </div>
          ))}
        </div>
      </nav>

      {/* Bottom */}
      <div style={{ borderTop: '1px solid var(--color-border)' }}>
        <div style={{ ...sb.navItem, gap: 10 }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--color-sidebar-item-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', letterSpacing: '0.04em' }}>Upgrade to Pro</span>
        </div>
        <div style={sb.navItem}
          onClick={() => setActiveSection('settings')}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--color-sidebar-item-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          <span style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>Settings</span>
        </div>
        <div style={sb.navItem}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--color-sidebar-item-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>Sign In</span>
        </div>
      </div>
    </div>
  );
};

// ─── Icon components ──────────────────────────────────────────
const IconNotes    = ({ active }) => <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--color-accent)' : 'var(--color-text-muted)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const IconTasks    = ({ active }) => <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--color-accent)' : 'var(--color-text-muted)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
const IconCalendar = ({ active }) => <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--color-accent)' : 'var(--color-text-muted)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="1"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;

const sb = {
  root: {
    width: 240, minWidth: 240, height: '100%',
    background: 'var(--color-sidebar-bg)',
    borderRight: '1px solid var(--color-border)',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    height: 60, display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 18px',
    borderBottom: '1px solid var(--color-border)',
    flexShrink: 0,
  },
  logo: {
    fontFamily: 'var(--font-display)',
    fontSize: 20, fontWeight: 700,
    color: 'var(--color-text-primary)',
    letterSpacing: '0.18em',
  },
  logoSub: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
    letterSpacing: '0.12em',
  },
  version: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
    background: 'var(--color-surface-2)',
    border: '1px solid var(--color-border)',
    padding: '2px 6px',
    borderRadius: 8,
  },
  newBtn: {
    width: '100%', background: 'transparent',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    padding: '8px 12px',
    borderRadius: 8, cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 150ms',
    display: 'flex', alignItems: 'center', gap: 8,
    letterSpacing: '0.04em',
  },
  divider: { height: 1, background: 'var(--color-border)', flexShrink: 0 },
  sectionLabel: {
    fontSize: 10, color: 'var(--color-text-muted)',
    padding: '0 18px 6px',
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0.12em',
  },
  navItem: {
    height: 38, display: 'flex', alignItems: 'center', gap: 10,
    padding: '0 18px 0 14px', cursor: 'pointer',
    transition: 'background 100ms', userSelect: 'none',
    background: 'transparent', position: 'relative',
    borderLeft: '2px solid transparent',
  },
  navActive: {
    background: 'var(--color-sidebar-item-active)',
    borderLeft: '2px solid var(--color-accent)',
  },
  activeDot: {
    width: 5, height: 5, borderRadius: '50%',
    background: 'var(--color-accent)',
    marginLeft: 'auto', flexShrink: 0,
  },
};

Object.assign(window, { Sidebar, IconNotes, IconTasks, IconCalendar });
