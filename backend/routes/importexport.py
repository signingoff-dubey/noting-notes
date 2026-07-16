"""
Import / Export routing.

Import endpoints:
  POST /api/import          — upload a Markdown or HTML file, create a new note

Export endpoints:
  GET  /api/export/{note_id}?format=markdown|html   — export a single note
  GET  /api/export?format=json                       — export all notes as JSON bundle
"""

import json
import logging
import tempfile
import os
from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Query, UploadFile, File
from fastapi.responses import FileResponse, JSONResponse

from backend.storage import store

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["import-export"])


# ──────────────── TipTap JSON → text converters ────────────────

def _tiptap_to_markdown(node: dict, depth: int = 0) -> str:
    """Recursively convert a TipTap JSON node to Markdown text."""
    node_type = node.get("type", "")
    content = node.get("content", [])

    if node_type == "doc":
        return "\n\n".join(
            part for child in content if (part := _tiptap_to_markdown(child, depth).strip())
        )

    if node_type == "heading":
        level = node.get("attrs", {}).get("level", 1)
        prefix = "#" * level
        inner = _inline_content_to_markdown(content)
        return f"{prefix} {inner}"

    if node_type == "paragraph":
        return _inline_content_to_markdown(content)

    if node_type == "bulletList":
        items = []
        for child in content:
            items.append("- " + _list_item_text(child))
        return "\n".join(items)

    if node_type == "orderedList":
        items = []
        for i, child in enumerate(content, start=1):
            items.append(f"{i}. " + _list_item_text(child))
        return "\n".join(items)

    if node_type == "listItem":
        return _list_item_text(node)

    if node_type == "taskList":
        items = []
        for child in content:
            checked = child.get("attrs", {}).get("checked", False)
            mark = "x" if checked else " "
            items.append(f"- [{mark}] " + _list_item_text(child))
        return "\n".join(items)

    if node_type == "blockquote":
        inner = "\n\n".join(
            _tiptap_to_markdown(child, depth) for child in content
        )
        return "\n".join(f"> {line}" for line in inner.splitlines())

    if node_type in ("codeBlock", "code_block"):
        language = node.get("attrs", {}).get("language", "")
        inner_text = "".join(
            child.get("text", "") for child in content if child.get("type") == "text"
        )
        return f"```{language}\n{inner_text}\n```"

    if node_type == "horizontalRule":
        return "---"

    if node_type == "image":
        attrs = node.get("attrs", {})
        src = attrs.get("src", "")
        alt = attrs.get("alt", "")
        return f"![{alt}]({src})"

    if node_type == "table":
        return _tiptap_table_to_markdown(node)

    if node_type == "text":
        return _apply_marks(node.get("text", ""), node.get("marks", []))

    # Fallback: recurse into children
    return "\n\n".join(
        _tiptap_to_markdown(child, depth) for child in content
    )


def _inline_content_to_markdown(content: list[dict]) -> str:
    return "".join(_tiptap_to_markdown(child) for child in content)


def _list_item_text(node: dict) -> str:
    """Flatten a listItem's paragraph content to a single string."""
    parts = []
    for child in node.get("content", []):
        if child.get("type") == "paragraph":
            parts.append(_inline_content_to_markdown(child.get("content", [])))
        else:
            parts.append(_tiptap_to_markdown(child))
    return " ".join(parts)


def _apply_marks(text: str, marks: list[dict]) -> str:
    for mark in marks:
        mt = mark.get("type", "")
        if mt == "bold":
            text = f"**{text}**"
        elif mt == "italic":
            text = f"_{text}_"
        elif mt == "code":
            text = f"`{text}`"
        elif mt == "strike":
            text = f"~~{text}~~"
        elif mt == "link":
            href = mark.get("attrs", {}).get("href", "")
            text = f"[{text}]({href})"
        elif mt == "highlight":
            text = f"=={text}=="
    return text


def _tiptap_table_to_markdown(node: dict) -> str:
    rows_md: list[str] = []
    rows = node.get("content", [])
    for row_idx, row in enumerate(rows):
        cells = row.get("content", [])
        cell_texts = []
        for cell in cells:
            inner = " ".join(
                _inline_content_to_markdown(p.get("content", []))
                for p in cell.get("content", [])
            )
            cell_texts.append(inner.strip())
        rows_md.append("| " + " | ".join(cell_texts) + " |")
        if row_idx == 0:
            rows_md.append("| " + " | ".join("---" for _ in cell_texts) + " |")
    return "\n".join(rows_md)


def _tiptap_to_html(node: dict) -> str:
    """Recursively convert a TipTap JSON node to HTML."""
    node_type = node.get("type", "")
    content = node.get("content", [])

    if node_type == "doc":
        return "".join(_tiptap_to_html(child) for child in content)

    if node_type == "heading":
        level = node.get("attrs", {}).get("level", 1)
        inner = _inline_content_to_html(content)
        return f"<h{level}>{inner}</h{level}>\n"

    if node_type == "paragraph":
        inner = _inline_content_to_html(content)
        return f"<p>{inner}</p>\n"

    if node_type == "bulletList":
        items = "".join(f"<li>{_list_item_html(c)}</li>" for c in content)
        return f"<ul>{items}</ul>\n"

    if node_type == "orderedList":
        items = "".join(f"<li>{_list_item_html(c)}</li>" for c in content)
        return f"<ol>{items}</ol>\n"

    if node_type == "taskList":
        items = []
        for child in content:
            checked = child.get("attrs", {}).get("checked", False)
            chk = ' checked' if checked else ''
            items.append(f"<li><input type='checkbox'{chk} disabled> {_list_item_html(child)}</li>")
        return f"<ul>{''.join(items)}</ul>\n"

    if node_type == "blockquote":
        inner = "".join(_tiptap_to_html(child) for child in content)
        return f"<blockquote>{inner}</blockquote>\n"

    if node_type in ("codeBlock", "code_block"):
        language = node.get("attrs", {}).get("language", "")
        inner_text = _escape_html(
            "".join(child.get("text", "") for child in content if child.get("type") == "text")
        )
        cls = f' class="language-{language}"' if language else ""
        return f"<pre><code{cls}>{inner_text}</code></pre>\n"

    if node_type == "horizontalRule":
        return "<hr>\n"

    if node_type == "image":
        attrs = node.get("attrs", {})
        src = _escape_html(attrs.get("src", ""))
        alt = _escape_html(attrs.get("alt", ""))
        return f'<img src="{src}" alt="{alt}">\n'

    if node_type == "table":
        return _tiptap_table_to_html(node)

    if node_type == "text":
        return _apply_marks_html(
            _escape_html(node.get("text", "")),
            node.get("marks", [])
        )

    return "".join(_tiptap_to_html(child) for child in content)


def _inline_content_to_html(content: list[dict]) -> str:
    return "".join(_tiptap_to_html(child) for child in content)


def _list_item_html(node: dict) -> str:
    parts = []
    for child in node.get("content", []):
        if child.get("type") == "paragraph":
            parts.append(_inline_content_to_html(child.get("content", [])))
        else:
            parts.append(_tiptap_to_html(child))
    return "".join(parts)


def _escape_html(text: str) -> str:
    return (
        text.replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace('"', "&quot;")
    )


def _apply_marks_html(text: str, marks: list[dict]) -> str:
    for mark in marks:
        mt = mark.get("type", "")
        if mt == "bold":
            text = f"<strong>{text}</strong>"
        elif mt == "italic":
            text = f"<em>{text}</em>"
        elif mt == "code":
            text = f"<code>{text}</code>"
        elif mt == "strike":
            text = f"<s>{text}</s>"
        elif mt == "link":
            href = _escape_html(mark.get("attrs", {}).get("href", ""))
            text = f'<a href="{href}">{text}</a>'
        elif mt == "highlight":
            text = f"<mark>{text}</mark>"
    return text


def _tiptap_table_to_html(node: dict) -> str:
    rows_html = []
    for row_idx, row in enumerate(node.get("content", [])):
        cells = row.get("content", [])
        cell_tag = "th" if row_idx == 0 else "td"
        cells_html = "".join(
            f"<{cell_tag}>{_inline_content_to_html(c.get('content', []))}</{cell_tag}>"
            for c in cells
        )
        rows_html.append(f"<tr>{cells_html}</tr>")
    return f"<table>{''.join(rows_html)}</table>\n"


# ──────────────── Import helpers ────────────────

def _markdown_to_tiptap(text: str) -> dict:
    """
    Minimal Markdown → TipTap JSON converter.
    Converts line-by-line: headings, paragraphs, code fences, list items.
    """
    lines = text.splitlines()
    nodes: list[dict] = []
    i = 0
    while i < len(lines):
        line = lines[i]

        # Heading
        if line.startswith("#"):
            level = len(line) - len(line.lstrip("#"))
            level = min(level, 6)
            text_part = line[level:].strip()
            nodes.append({
                "type": "heading",
                "attrs": {"level": level},
                "content": [{"type": "text", "text": text_part}],
            })
            i += 1
            continue

        # Fenced code block
        if line.startswith("```"):
            lang = line[3:].strip()
            code_lines = []
            i += 1
            while i < len(lines) and not lines[i].startswith("```"):
                code_lines.append(lines[i])
                i += 1
            i += 1  # skip closing ```
            nodes.append({
                "type": "codeBlock",
                "attrs": {"language": lang},
                "content": [{"type": "text", "text": "\n".join(code_lines)}],
            })
            continue

        # Bullet list item
        if line.startswith("- ") or line.startswith("* "):
            item_text = line[2:].strip()
            nodes.append({
                "type": "bulletList",
                "content": [{
                    "type": "listItem",
                    "content": [{"type": "paragraph", "content": [{"type": "text", "text": item_text}]}],
                }],
            })
            i += 1
            continue

        # Horizontal rule
        if line.strip() in ("---", "***", "___"):
            nodes.append({"type": "horizontalRule"})
            i += 1
            continue

        # Blank line or paragraph
        stripped = line.strip()
        if stripped:
            nodes.append({
                "type": "paragraph",
                "content": [{"type": "text", "text": stripped}],
            })
        i += 1

    return {"type": "doc", "content": nodes}


def _html_to_tiptap(html_text: str) -> dict:
    """Wrap raw HTML content in a single TipTap paragraph for now."""
    # For full fidelity an HTML parser would be used; a plain paragraph is safe fallback.
    return {
        "type": "doc",
        "content": [
            {"type": "paragraph", "content": [{"type": "text", "text": html_text.strip()}]}
        ],
    }


# ──────────────── Routes ────────────────

@router.post("/import")
async def import_note(file: UploadFile = File(...)) -> dict:
    """
    Import a Markdown or HTML file as a new note.
    Returns the created note object.
    """
    filename = file.filename or "imported"
    raw = await file.read()
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError:
        text = raw.decode("latin-1", errors="replace")

    ext = os.path.splitext(filename)[1].lower()
    mime = (file.content_type or "").lower()

    if ext in (".md", ".markdown") or "markdown" in mime:
        content = _markdown_to_tiptap(text)
    elif ext in (".htm", ".html") or "html" in mime:
        content = _html_to_tiptap(text)
    else:
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported file type '{ext}'. Supported: .md, .html"
        )

    # Derive a title from the filename (strip extension)
    title = os.path.splitext(filename)[0]

    now = datetime.now(timezone.utc).isoformat()
    note = {
        "id": str(uuid4()),
        "title": title,
        "content": content,
        "folder_id": None,
        "tags": [],
        "pinned": False,
        "starred": False,
        "is_vault": False,
        "archived": False,
        "vault_content": None,
        "word_count": len(text.split()),
        "attachments": [],
        "created_at": now,
        "updated_at": now,
    }
    saved = await store.write_note(note)
    logger.info("Imported note '%s' from file '%s'", note["id"], filename)
    return saved


@router.get("/export/{note_id}")
async def export_note(
    note_id: str,
    format: str = Query(default="markdown", regex="^(markdown|html)$"),
) -> FileResponse:
    """
    Export a single note as Markdown or HTML.
    Returns a FileResponse with the appropriate Content-Type.
    """
    note = await store.read_note(note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    title = note.get("title", "note")
    content = note.get("content") or {}

    if format == "markdown":
        body = _tiptap_to_markdown(content) if isinstance(content, dict) else str(content)
        suffix = ".md"
        media_type = "text/markdown"
    else:
        body = _tiptap_to_html(content) if isinstance(content, dict) else str(content)
        body = f"<!DOCTYPE html><html><head><meta charset='utf-8'><title>{_escape_html(title)}</title></head><body>{body}</body></html>"
        suffix = ".html"
        media_type = "text/html"

    # Write to a temp file so FileResponse can stream it
    tmp = tempfile.NamedTemporaryFile(
        mode="w",
        suffix=suffix,
        delete=False,
        encoding="utf-8",
    )
    try:
        tmp.write(body)
        tmp.flush()
        tmp_path = tmp.name
    finally:
        tmp.close()

    safe_title = "".join(c if c.isalnum() or c in "-_ " else "_" for c in title)[:80]
    download_name = f"{safe_title}{suffix}"

    return FileResponse(
        path=tmp_path,
        media_type=media_type,
        filename=download_name,
        background=None,
    )


@router.get("/export")
async def export_all_notes(
    format: str = Query(default="json", regex="^json$"),
) -> JSONResponse:
    """Export all notes as a JSON bundle."""
    notes = await store.read_all_notes()
    bundle = {
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "count": len(notes),
        "notes": notes,
    }
    return JSONResponse(content=bundle)
