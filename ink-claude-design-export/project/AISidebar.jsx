// AISidebar v2
const AISidebar = ({ isOpen, onClose, activeNote }) => {
  const [messages, setMessages] = React.useState([
    { role: 'ai', text: 'Ready. Ask me anything about the open note, or pick an action below.' }
  ]);
  const [input, setInput] = React.useState('');
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [model, setModel] = React.useState('mistral:7b');
  const chatRef = React.useRef(null);

  const aiActions = [
    { label: 'Summarize', icon: '≡' },
    { label: 'Action items', icon: '◆' },
    { label: 'Rephrase', icon: '↺' },
    { label: 'Generate tags', icon: '#' },
    { label: 'Fix grammar', icon: '✓' },
    { label: 'To outline', icon: '⊟' },
  ];

  const simulateStream = (text) => {
    setIsStreaming(true);
    const aiMsg = { role: 'ai', text: '' };
    setMessages(prev => [...prev, aiMsg]);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      if (i > text.length) {
        clearInterval(iv);
        setIsStreaming(false);
        setMessages(prev => { const n = [...prev]; n[n.length - 1] = { role: 'ai', text }; return n; });
      } else {
        setMessages(prev => { const n = [...prev]; n[n.length - 1] = { role: 'ai', text: text.slice(0, i) }; return n; });
      }
    }, 16);
  };

  const sendMessage = () => {
    if (!input.trim() || isStreaming) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setInput('');
    const responses = [
      'Based on the current note, here are the key themes: the content is well-structured with clear sections and actionable items throughout.',
      'I\'ve analyzed the note. The main points cover several interconnected ideas that build toward a clear conclusion.',
      'Here\'s what I found in the note: strong conceptual foundation, three distinct argument threads, and several implicit action items worth surfacing.',
    ];
    setTimeout(() => simulateStream(responses[Math.floor(Math.random() * responses.length)]), 400);
  };

  React.useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  return (
    <div style={{
      ...ai.root,
      transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 250ms ease',
    }}>
      {/* Header */}
      <div style={ai.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: 'var(--color-accent)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>✦</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', letterSpacing: '0.08em' }}>AI ASSISTANT</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <select style={ai.select} value={model} onChange={e => setModel(e.target.value)}>
            <option value="mistral:7b">mistral:7b</option>
            <option value="llama3:8b">llama3:8b</option>
            <option value="gemma:7b">gemma:7b</option>
          </select>
          <button style={ai.closeXBtn} onClick={onClose} title="Close AI panel">
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      {/* Note context */}
      <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Context:</span>
        <select style={{ ...ai.select, flex: 1, maxWidth: '100%' }}>
          <option>{activeNote ? activeNote.title : 'No note open'}</option>
        </select>
      </div>

      {/* Quick actions */}
      <div style={ai.actions}>
        {aiActions.map(a => (
          <button key={a.label} style={ai.actionBtn}
            onClick={() => { setInput(a.label); }}
            onMouseEnter={e => Object.assign(e.currentTarget.style, { background: 'var(--color-surface-active)', borderColor: 'var(--color-border-strong)', color: 'var(--color-text-primary)' })}
            onMouseLeave={e => Object.assign(e.currentTarget.style, { background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' })}>
            <span style={{ color: 'var(--color-accent)', marginRight: 4, fontSize: 10 }}>{a.icon}</span>{a.label}
          </button>
        ))}
      </div>

      {/* Chat */}
      <div ref={chatRef} style={ai.chat}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 4 }}>
            {msg.role === 'ai' && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', letterSpacing: '0.06em' }}>✦ {model}</span>
            )}
            <div style={{
              maxWidth: '88%',
              background: msg.role === 'user' ? 'var(--color-surface-2)' : 'transparent',
              border: msg.role === 'user' ? '1px solid var(--color-border)' : 'none',
              padding: msg.role === 'user' ? '8px 12px' : '0',
              borderRadius: 8,
            }}>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', lineHeight: 1.65, fontFamily: 'var(--font-body)' }}>
                {msg.text}
                {isStreaming && i === messages.length - 1 && msg.role === 'ai' && (
                  <span style={{ animation: 'blink 1s step-end infinite' }}>▌</span>
                )}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={ai.inputBar}>
        <textarea
          style={ai.textarea}
          placeholder="Ask about this note..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
          rows={2}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
          <button style={ai.sendBtn} onClick={sendMessage}>
            Send
            <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>

      {/* Peek tab (when closed) */}
      {!isOpen && (
        <button style={ai.peekTab} onClick={() => {}}>
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      )}
    </div>
  );
};

const ai = {
  root: {
    position: 'absolute', right: 0, top: 0, bottom: 0,
    width: 320, zIndex: 50,
    background: 'var(--color-surface)',
    borderLeft: '1px solid var(--color-border)',
    display: 'flex', flexDirection: 'column',
  },
  header: {
    height: 48, display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 14px',
    borderBottom: '1px solid var(--color-border)',
    flexShrink: 0,
  },
  select: {
    background: 'var(--color-surface-2)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    padding: '5px 28px 5px 8px',
    borderRadius: 8, cursor: 'pointer', outline: 'none',
    appearance: 'none',
    WebkitAppearance: 'none',
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23555'/%3E%3C/svg%3E\")",
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 8px center',
  },
  closeXBtn: {
    width: 24, height: 24, background: 'transparent',
    border: 'none', borderRadius: 8, cursor: 'pointer',
    color: 'var(--color-text-muted)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'color 150ms',
  },
  actions: {
    display: 'flex', flexWrap: 'wrap', gap: 5,
    padding: '10px 14px',
    borderBottom: '1px solid var(--color-border)',
    flexShrink: 0,
  },
  actionBtn: {
    background: 'var(--color-surface-2)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    padding: '4px 9px',
    borderRadius: 8, cursor: 'pointer',
    transition: 'all 100ms',
    display: 'flex', alignItems: 'center',
  },
  chat: {
    flex: 1, overflow: 'auto',
    display: 'flex', flexDirection: 'column', gap: 14,
    padding: '14px',
  },
  inputBar: {
    borderTop: '1px solid var(--color-border)',
    padding: '10px 14px',
    flexShrink: 0,
  },
  textarea: {
    width: '100%',
    background: 'var(--color-surface-2)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-sm)',
    padding: '8px 10px',
    borderRadius: 8,
    resize: 'none',
    outline: 'none',
    lineHeight: 1.5,
    display: 'block',
    boxSizing: 'border-box',
    transition: 'border-color 150ms',
  },
  sendBtn: {
    background: 'var(--color-accent)',
    color: 'var(--color-bg)',
    border: 'none',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    padding: '5px 12px',
    borderRadius: 8, cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 6,
    letterSpacing: '0.04em',
    transition: 'opacity 150ms',
  },
  peekTab: {
    position: 'absolute', left: -24, top: '50%',
    transform: 'translateY(-50%)',
    width: 24, height: 48,
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRight: 'none',
    borderRadius: '2px 0 0 2px',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--color-text-secondary)',
  },
};

Object.assign(window, { AISidebar });
