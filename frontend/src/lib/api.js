const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request(method, path, body = null) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : null,
  })
  if (!res.ok) {
    let detail = 'Request failed'
    try {
      const err = await res.json()
      detail = err.detail || detail
    } catch {}
    throw new Error(detail)
  }
  if (res.status === 204) return null
  return res.json()
}

async function upload(path, formData) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    let detail = 'Upload failed'
    try {
      const err = await res.json()
      detail = err.detail || detail
    } catch {}
    throw new Error(detail)
  }
  return res.json()
}

// Temporary: call Groq straight from the browser when no backend is reachable.
// Key comes from the build-time env var VITE_GROQ_API_KEY (never committed).
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_SYSTEM =
  'You are a helpful AI assistant embedded in NOTING, a local notes application. ' +
  'You help the user understand, summarize, and work with their notes. ' +
  'Be concise and direct. Format code with markdown code blocks.'

function streamGroq(payload, onToken, onDone, onError) {
  const ctrl = new AbortController()
  let system = GROQ_SYSTEM
  if (payload.note_content) {
    system += `\n\n## Current Note\n${payload.note_content.slice(0, 6000)}`
  }
  const history = (payload.history || []).slice(-20)
  const messages = [
    { role: 'system', content: system },
    ...history,
    { role: 'user', content: payload.message },
  ]

  fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({ model: payload.model, messages, stream: true }),
    signal: ctrl.signal,
  })
    .then(async (res) => {
      if (!res.ok) {
        let msg = `Groq error ${res.status}`
        try { const err = await res.json(); msg = err.error?.message || msg } catch {}
        throw new Error(msg)
      }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') { onDone?.(); return }
          try {
            const token = JSON.parse(data).choices?.[0]?.delta?.content
            if (token) onToken(token)
          } catch {}
        }
      }
      onDone?.()
    })
    .catch((err) => {
      if (err.name !== 'AbortError') onError?.(err)
    })
  return () => ctrl.abort()
}

export const api = {
  notes: {
    list: ()           => request('GET',    '/api/notes'),
    get:  (id)         => request('GET',    `/api/notes/${id}`),
    create: (data)     => request('POST',   '/api/notes', data),
    update: (id, data) => request('PUT',    `/api/notes/${id}`, data),
    delete: (id)       => request('DELETE', `/api/notes/${id}`),
  },

  folders: {
    list: ()           => request('GET',    '/api/folders'),
    create: (data)     => request('POST',   '/api/folders', data),
    update: (id, data) => request('PUT',    `/api/folders/${id}`, data),
    delete: (id)       => request('DELETE', `/api/folders/${id}`),
  },

  tasks: {
    list: ()           => request('GET',    '/api/tasks'),
    get:  (id)         => request('GET',    `/api/tasks/${id}`),
    create: (data)     => request('POST',   '/api/tasks', data),
    update: (id, data) => request('PUT',    `/api/tasks/${id}`, data),
    delete: (id)       => request('DELETE', `/api/tasks/${id}`),
  },

  attachments: {
    list:    (noteId)  => request('GET',    `/api/attachments/${noteId}`),
    upload:  (noteId, formData) => upload(`/api/attachments/${noteId}`, formData),
    delete:  (id)      => request('DELETE', `/api/attachments/${id}`),
    extract: (id)      => request('GET',    `/api/attachments/extract/${id}`),
  },

  ai: {
    models:        ()       => request('GET',  '/api/ai/models'),
    getConfig:     ()       => request('GET',  '/api/ai/config'),
    saveConfig:    (data)   => request('POST', '/api/ai/config', data),
    memory:        (noteId) => request('GET',  `/api/ai/memory/${noteId}`),
    clearMemory:   (noteId) => request('DELETE', `/api/ai/memory/${noteId}`),
    embed:         (data)   => request('POST', '/api/ai/embed', data),
    semanticSearch:(data)   => request('POST', '/api/ai/semantic-search', data),
    summarize:     (data)   => request('POST', '/api/ai/summarize', data),
    rephrase:      (data)   => request('POST', '/api/ai/rephrase', data),

    chatStream: (payload, onToken, onDone, onError) => {
      if (GROQ_KEY) return streamGroq(payload, onToken, onDone, onError)
      const ctrl = new AbortController()
      fetch(`${BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: ctrl.signal,
      })
        .then(async (res) => {
          if (!res.ok) {
            let msg = 'AI request failed'
            try { const err = await res.json(); msg = err.detail || msg } catch {}
            throw new Error(msg)
          }
          const reader = res.body.getReader()
          const decoder = new TextDecoder()
          let buffer = ''
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop()
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim()
                if (data === '[DONE]') { onDone?.(); return }
                try {
                  const parsed = JSON.parse(data)
                  if (parsed.error) { onError?.(new Error(parsed.error)); return }
                  const token = parsed.response || parsed.content || ''
                  if (token) onToken(token)
                } catch {}
              }
            }
          }
          onDone?.()
        })
        .catch((err) => {
          if (err.name !== 'AbortError') onError?.(err)
        })
      return () => ctrl.abort()
    },
  },

  vault: {
    status: ()     => request('GET',  '/api/vault/status'),
    setup:  (data) => request('PUT',  '/api/vault/pin', data),
    unlock: (data) => request('POST', '/api/vault/unlock', data),
    lock:   ()     => request('POST', '/api/vault/lock'),
  },

  importExport: {
    import:    (formData) => upload('/api/import', formData),
    exportNote: (id, fmt) => `${BASE_URL}/api/export/note/${id}?format=${fmt}`,
    exportAll:  (fmt)     => `${BASE_URL}/api/export/all?format=${fmt}`,
  },

  health: () => request('GET', '/api/health'),
}
