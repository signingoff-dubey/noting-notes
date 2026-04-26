# DESIGN_SYSTEM.md — NOTED

Visual language, component specs, and UI rules for Claude Design.
This file tells Claude Design exactly how every element should look.

---

## 1. AESTHETIC DIRECTION

**Primary theme**: Nothing OS Dark — brutally minimal, monochromatic, typographically precise.
**Mood**: A tool that respects your intelligence. No rounded corners trying to be friendly. No colorful CTAs begging for attention. Cold, sharp, focused. Like a high-end engineering notebook.
**One thing people will remember**: The dot-matrix typography on a pitch-black surface. Feels like you're hacking but in a beautiful way.

---

## 2. TYPOGRAPHY

### Primary Font: Space Mono (Google Fonts)
Used for: UI labels, navigation, headings, anything that should feel "Nothing OS"
- Monospace, deliberate, has that dot-matrix adjacent feel

### Body Font: Geist (Vercel's font, Google Fonts)
Used for: Note content, descriptions, body text
- Clean, readable, modern, not boring

### Display/Accent: Ndot-55 (if licensable) → fallback: Space Mono
Used for: App name, large headings
- Pure Nothing OS aesthetic

### Type Scale (CSS Variables)
```css
--text-xs: 0.6875rem;    /* 11px — timestamps, metadata */
--text-sm: 0.75rem;      /* 12px — labels, tags, secondary */
--text-base: 0.875rem;   /* 14px — body text, UI labels */
--text-md: 1rem;         /* 16px — note content default */
--text-lg: 1.125rem;     /* 18px — section headings */
--text-xl: 1.375rem;     /* 22px — note title */
--text-2xl: 1.75rem;     /* 28px — page headings */
--text-3xl: 2.25rem;     /* 36px — display */

--font-mono: 'Space Mono', 'Courier New', monospace;
--font-body: 'Geist', 'Inter', sans-serif;
--font-editor: 'Geist', 'Georgia', serif;
```

---

## 3. COLOR SYSTEM

### Nothing Dark (Default Theme)
```css
[data-theme="nothing-dark"] {
  /* Backgrounds */
  --color-bg: #0a0a0a;              /* Main app background */
  --color-surface: #111111;         /* Cards, panels */
  --color-surface-2: #181818;       /* Nested surfaces */
  --color-surface-hover: #1f1f1f;   /* Hover states */
  --color-surface-active: #252525;  /* Active/selected */

  /* Borders */
  --color-border: #222222;
  --color-border-strong: #333333;

  /* Text */
  --color-text-primary: #f0f0f0;
  --color-text-secondary: #888888;
  --color-text-muted: #444444;
  --color-text-disabled: #2f2f2f;

  /* Accents */
  --color-accent: #ffffff;           /* Primary action, active states */
  --color-accent-dim: #2a2a2a;       /* Subtle accent backgrounds */

  /* Status Colors (muted, not bright) */
  --color-success: #4a7c59;
  --color-warning: #7c6a2a;
  --color-error: #7c3a3a;
  --color-info: #2a4a7c;

  /* Priority Colors (tasks) */
  --color-priority-urgent: #cc4444;
  --color-priority-high: #cc7744;
  --color-priority-medium: #ccaa44;
  --color-priority-low: #44aa66;

  /* Sidebar */
  --color-sidebar-bg: #0a0a0a;
  --color-sidebar-item-hover: #141414;
  --color-sidebar-item-active: #1a1a1a;
}
```

### Nothing Light Theme
```css
[data-theme="nothing-light"] {
  --color-bg: #f5f5f0;
  --color-surface: #ffffff;
  --color-surface-2: #f0f0eb;
  --color-surface-hover: #e8e8e3;
  --color-surface-active: #e0e0db;
  --color-border: #d0d0cb;
  --color-border-strong: #b0b0ab;
  --color-text-primary: #0a0a0a;
  --color-text-secondary: #555555;
  --color-text-muted: #999999;
  --color-accent: #0a0a0a;
  --color-accent-dim: #e8e8e3;
  /* status colors same but lighter background */
}
```

### Terminal Theme
```css
[data-theme="terminal"] {
  --color-bg: #000000;
  --color-surface: #001100;
  --color-surface-2: #002200;
  --color-surface-hover: #003300;
  --color-border: #003300;
  --color-text-primary: #00ff41;
  --color-text-secondary: #00aa2a;
  --color-text-muted: #005514;
  --color-accent: #00ff41;
  --font-primary: 'Space Mono', monospace;
  --font-body: 'Space Mono', monospace;
  --font-editor: 'Space Mono', monospace;
}
```

### Warm Paper Theme
```css
[data-theme="warm-paper"] {
  --color-bg: #f4ede4;
  --color-surface: #fdf6ed;
  --color-surface-2: #ede6dd;
  --color-border: #d4c4b0;
  --color-text-primary: #2c1f14;
  --color-text-secondary: #7a6555;
  --color-accent: #2c1f14;
  --font-primary: 'Playfair Display', serif;
  --font-body: 'Lora', serif;
}
```

---

## 4. SPACING SYSTEM

Use Tailwind's default spacing scale. Key values:
- `2px` — micro gaps within components
- `4px` — tight spacing (icon gaps)
- `8px` — component internal padding
- `12px` — default element padding
- `16px` — card padding
- `20px` — section spacing
- `24px` — major section gaps
- `32px` — page-level spacing

Sidebar width: `240px` (fixed)
AI sidebar width: `340px` (fixed)
Min center width: `480px`

---

## 5. COMPONENT SPECIFICATIONS

### 5.1 Left Sidebar

```
Width: 240px
Background: var(--color-sidebar-bg)
Border-right: 1px solid var(--color-border)
Font: var(--font-mono)
Font-size: var(--text-sm)

Top section (app name):
  Height: 56px
  App name in --font-mono, --text-md, --color-text-primary
  Small version badge --text-xs --color-text-muted

Navigation items:
  Height: 36px
  Padding: 8px 16px
  Border-radius: 0px (sharp, not rounded)
  Hover: background var(--color-sidebar-item-hover)
  Active: background var(--color-sidebar-item-active), left border 2px solid --color-accent
  Icon: 16px, stroke-width 1.5 (Lucide icons)
  Label: --text-sm, --color-text-secondary → active: --color-text-primary

New Note / New Task buttons:
  Full width
  Background: transparent
  Border: 1px solid var(--color-border)
  Hover: border-color --color-border-strong, bg --color-surface-hover
  Text: + New Note in --font-mono --text-sm
  Margin: 12px 12px
  Border-radius: 2px (barely rounded)

Folder tree:
  Folder item: same as nav item
  Folder indent: 12px per level
  Expand chevron: 10px, animates on open
  Note count badge: --text-xs --color-text-muted, far right

Bottom section:
  Separator: 1px solid --color-border
  Subscribe to Pro: accent color, subtle glow on hover
  Settings + Profile: same nav item style
```

### 5.2 Note Cards (List View)

```
Background: transparent (hover: --color-surface)
Border-bottom: 1px solid --color-border
Padding: 14px 16px
Border-radius: 0

Title: --text-base, --color-text-primary, --font-body, font-weight: 500
Preview: --text-sm, --color-text-secondary, 2 lines max, line-clamp-2
Date: --text-xs, --color-text-muted, far right of title row
Tags: small chips, height 18px, --text-xs, border 1px solid --color-border, 
      background --color-surface-2, border-radius 2px
Pinned indicator: small dot or pin icon, --color-accent, top-right

Active note (currently open): background --color-surface-active
                               left border: 2px solid --color-accent
```

### 5.3 Note Cards (Grid View)

```
Width: calc(50% - 8px) or 33% depending on panel width
Aspect ratio: free height based on content
Background: --color-surface
Border: 1px solid --color-border
Padding: 16px
Border-radius: 2px
Hover: border-color --color-border-strong, subtle shadow

Title: --text-base, font-weight 500
Preview: --text-sm, --color-text-secondary, 3 lines, line-clamp-3
Footer: tags + date in one row, --text-xs
```

### 5.4 Editor Toolbar

```
Background: --color-surface
Border-bottom: 1px solid --color-border
Padding: 4px 8px
Sticky at top of editor
Height: 40px
Font: all buttons in --font-mono

Button style:
  Size: 28px × 28px
  Border-radius: 2px
  Hover: background --color-surface-hover
  Active/pressed: background --color-surface-active, color --color-accent
  
Dividers between button groups: 1px solid --color-border, height 20px, margin 0 4px

Groups (left to right):
  [H1 H2 H3] | [B I U S] | [Highlight▼] | [• 1. ☑] | [Code Quote] | 
  [─ Table] | [∑ Math] | [Link] | [─ (spacer)] | [+ Attach]
```

### 5.5 Floating Toolbar (Text Selection)

```
Position: absolute, above selection (via TipTap BubbleMenu)
Background: --color-bg
Border: 1px solid --color-border-strong
Border-radius: 3px
Box-shadow: 0 4px 20px rgba(0,0,0,0.5)
Padding: 3px
Height: 34px

Left group: [B] [I] [U] [S] [Highlight] [Code] [Link]
Divider
Right group (AI, slightly differentiated color):
  [⚡ Explain] [≡ Summarize] [↺ Rephrase] [✦ Ask AI]
  These buttons: background --color-accent-dim, color --color-text-primary
  Hover: background --color-surface-active

Animation: fade in + slide up 4px (100ms ease)
```

### 5.6 AI Sidebar

```
Width: 340px
Position: fixed right, full height
Background: --color-surface
Border-left: 1px solid --color-border
Z-index: 50

Open/close: translate-x animation (250ms ease)
Toggle button: fixed button on right edge of screen, 
               32px wide, center height, 
               background --color-surface, border --color-border
               Arrow icon that flips direction

Header (top 48px):
  Model selector dropdown (left)
  Note context selector dropdown (right)
  Both: --text-xs, --font-mono, background --color-surface-2
  Dropdown border: 1px solid --color-border

Chat area:
  Scrollable
  Messages alternate: user (right-aligned, background --color-accent-dim) 
                       ai (left-aligned, background transparent)
  Message font: --text-sm, --font-body
  Streaming message: cursor blink at end while streaming
  Timestamps: --text-xs, --color-text-muted

Input bar (bottom 60px):
  Border-top: 1px solid --color-border
  Textarea: auto-growing, max 4 lines
  Send button: --color-accent background, --color-bg text, 28px × 28px, border-radius 2px
  Attach button: icon only, --color-text-secondary
```

### 5.7 File Viewer Panel

```
Width: 50% of center (when split view)
Background: --color-surface
Border-left: 1px solid --color-border

Toolbar (top 40px):
  Left: filename (--text-sm --font-mono, truncated)
  Right: [Page X/Y] [Maximize ↗] [✕ Close]
  
Maximize state: takes 100% width, note editor hidden
Back from maximize: note editor returns to 50%

PDF viewer:
  Page navigation: arrows + page number input
  Text selection: enabled, triggers FloatingToolbar
  Annotation: selected text highlighted in --color-accent-dim
  
Annotation toolbar (when annotation mode on):
  Highlight | Add comment | color picker (5 muted colors)
```

### 5.8 Modal / Dialog

```
Overlay: rgba(0,0,0,0.7) backdrop
Panel: background --color-surface, border 1px solid --color-border-strong,
       border-radius 2px (not 8px), max-width 480px, padding 24px
Title: --text-lg --font-mono
Body: --text-base --font-body --color-text-secondary
Buttons: right-aligned
  Cancel: transparent, border 1px solid --color-border
  Confirm: depends on action (delete = --color-error, normal = --color-accent)
Animation: scale from 0.97 + fade (150ms)
```

### 5.9 Tags / Chips

```
Height: 20px
Padding: 0 8px
Border: 1px solid --color-border
Background: transparent
Border-radius: 2px
Font: --text-xs --font-mono --color-text-secondary
Hover: border-color --color-border-strong --color-text-primary
Max width: 100px, text truncated with ellipsis
+ Add tag: same style but dashed border, + prefix
```

### 5.10 Buttons

```
Primary:
  Background: --color-accent
  Color: --color-bg
  Border: none
  Padding: 8px 16px
  Font: --text-sm --font-mono
  Border-radius: 2px
  Hover: opacity 0.85

Secondary:
  Background: transparent
  Color: --color-text-primary
  Border: 1px solid --color-border
  Hover: background --color-surface-hover

Ghost:
  Background: transparent
  Color: --color-text-secondary
  Border: none
  Hover: background --color-surface-hover, color --color-text-primary

Destructive:
  Background: --color-error
  Color: white

All buttons: cursor: pointer, transition: all 150ms
Disabled: opacity 0.4, cursor: not-allowed
Loading: show Spinner (see below), same size as content
```

### 5.11 Spinner

```
Size variants: sm (14px), md (20px), lg (32px)
Style: simple spinning ring, stroke-width 2
Color: --color-text-secondary for neutral, --color-accent for primary
Animation: rotate 0.8s linear infinite
```

### 5.12 Toast Notifications

```
Position: bottom-right, 16px margin
Width: 320px
Background: --color-surface
Border: 1px solid --color-border-strong
Border-radius: 2px
Left border: 3px solid (green=success, red=error, yellow=warning, blue=info)
Font: --text-sm --font-body
Padding: 12px 16px
Animation: slide in from right (200ms), fade out after 3s
Stack: multiple toasts stack upward, 8px gap
Close button: ✕ top right, --color-text-muted
```

---

## 6. LAYOUT RULES

- **No border-radius above 3px** anywhere in the app. Nothing OS is sharp.
- **No box-shadows** except for modals and floating toolbar (dark, heavy shadows only)
- **No gradients** on interactive elements. Flat colors only.
- **Consistent 1px borders** — not 2px, not 0.5px.
- **Every interactive element needs a hover state**.
- **Every interactive element needs a focus-visible state** (keyboard nav).
- **Monospace font for all UI chrome** (nav, buttons, labels, metadata).
- **Serif/sans for content** (editor, descriptions).

---

## 7. ANIMATION PRINCIPLES

- Fast: 100–150ms for micro interactions (hover, button press)
- Medium: 200–250ms for panels opening/closing (AI sidebar, viewer panel)
- Slow: 300–400ms for page transitions
- **Easing**: `ease` for opening, `ease-in` for closing
- **Never animate opacity from 0 if element shifts layout** — use visibility + opacity together
- Loading skeletons instead of spinners for content loading (note list, attachments)

---

## 8. ICONOGRAPHY

Use **Lucide React** exclusively. No mixing icon libraries.
- Stroke width: 1.5 (not the default 2 — thinner looks more premium)
- Sizes: 14px (tiny), 16px (normal UI), 20px (medium), 24px (large/prominent)
- Color: inherit from parent text color

Key icons:
- New note: `FilePlus`
- New task: `ListPlus`
- Notes: `FileText`
- Tasks: `CheckSquare`
- Calendar: `Calendar`
- Settings: `Settings`
- AI sidebar: `Sparkles`
- Folder: `Folder` / `FolderOpen`
- Tag: `Tag`
- Vault: `Lock` / `Unlock`
- Attach: `Paperclip`
- Expand: `Maximize2`
- Close: `X`
- Back: `ArrowLeft`
- Search: `Search`
- Grid view: `LayoutGrid`
- List view: `List`
- Star: `Star`
- Pin: `Pin`
- More options: `MoreHorizontal`
- Delete: `Trash2`

---

## 9. RESPONSIVE BEHAVIOR

Layer 1 is desktop-only. Minimum width: `1024px`.
No mobile support in v1. Don't add breakpoints below 1024px.

At 1024px: AI sidebar hidden by default, viewer panel compresses.
At 1280px+: Comfortable experience with all panels.
At 1600px+: Center panel gets more breathing room.

---

## 10. ACCESSIBILITY

- All interactive elements must be keyboard focusable
- Focus ring: `outline: 2px solid var(--color-accent)`, `outline-offset: 2px`
- Color contrast: all text must meet WCAG AA (4.5:1 minimum)
- Aria labels on icon-only buttons
- Modals trap focus and close on Escape
- Screen reader: aria-live on AI streaming responses

---

## 11. EDITOR TYPOGRAPHY (Inside Note)

```css
.editor-content {
  font-family: var(--font-editor);
  font-size: var(--text-md);       /* 16px */
  line-height: 1.8;
  color: var(--color-text-primary);
  
  h1 { font-size: 2rem; font-weight: 600; margin: 24px 0 12px; }
  h2 { font-size: 1.5rem; font-weight: 600; margin: 20px 0 10px; }
  h3 { font-size: 1.25rem; font-weight: 600; margin: 16px 0 8px; }
  
  p { margin: 0 0 12px; }
  
  code { font-family: var(--font-mono); font-size: 0.875em; 
         background: var(--color-surface-2); padding: 2px 5px; border-radius: 2px; }
  
  pre { background: var(--color-surface); border: 1px solid var(--color-border);
        border-radius: 2px; padding: 16px; overflow-x: auto; }
  
  blockquote { border-left: 2px solid var(--color-border-strong);
               margin: 0; padding: 4px 16px; color: var(--color-text-secondary); }
  
  table { border-collapse: collapse; width: 100%; margin: 16px 0; }
  td, th { border: 1px solid var(--color-border); padding: 8px 12px; }
  th { background: var(--color-surface-2); font-weight: 600; }
  
  ul, ol { padding-left: 24px; margin: 0 0 12px; }
  li { margin: 4px 0; }
  
  .task-list { list-style: none; padding-left: 0; }
  .task-item { display: flex; gap: 8px; align-items: flex-start; }
}
```
