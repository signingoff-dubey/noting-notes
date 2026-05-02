import { Mark, mergeAttributes } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

const NOTELINK_RE = /\[\[([^\]]+)\]\]/g

export const NoteLink = Mark.create({
  name: 'noteLink',
  priority: 1000,
  inclusive: false,

  addAttributes() {
    return {
      noteId: { default: null },
      noteTitle: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-note-link]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, {
      'data-note-link': HTMLAttributes.noteId || '',
      class: 'ink-note-link',
    }), 0]
  },
})

export function createNoteLinkPlugin(findNoteByTitle) {
  return new Plugin({
    key: new PluginKey('noteLinkDecorations'),
    state: {
      init(_, state) {
        return buildDecorations(state, findNoteByTitle)
      },
      apply(tr, old, _, newState) {
        if (tr.docChanged) return buildDecorations(newState, findNoteByTitle)
        return old
      },
    },
    props: {
      decorations(state) {
        return this.getState(state)
      },
    },
  })
}

function buildDecorations(state, findNoteByTitle) {
  const decorations = []
  state.doc.descendants((node, pos) => {
    if (!node.isText) return
    const text = node.text || ''
    let match
    NOTELINK_RE.lastIndex = 0
    while ((match = NOTELINK_RE.exec(text)) !== null) {
      const start = pos + match.index
      const end = start + match[0].length
      const title = match[1].trim()
      const linked = findNoteByTitle(title)
      decorations.push(
        Decoration.inline(start, end, {
          class: linked ? 'ink-note-link' : 'ink-note-link-broken',
          'data-note-link-id': linked?.id || '',
          'data-note-link-title': title,
        })
      )
    }
  })
  return DecorationSet.create(state.doc, decorations)
}
