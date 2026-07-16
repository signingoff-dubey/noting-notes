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
    memory:        (noteId) => request('GET',  `/api/ai/memory/${noteId}`),
    clearMemory:   (noteId) => request('DELETE', `/api/ai/memory/${noteId}`),
    embed:         (data)   => request('POST', '/api/ai/embed', data),
    semanticSearch:(data)   => request('POST', '/api/ai/semantic-search', data),
    summarize:     (data)   => request('POST', '/api/ai/summarize', data),
    rephrase:      (data)   => request('POST', '/api/ai/rephrase', data),

    chatStream: (payload, onToken, onDone, onError) => {
      const ctrl = new AbortController()
      fetch(`${BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: ctrl.signal,
      })
        .then(async (res) => {
          if (!res.ok) throw new Error('AI request failed')
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
