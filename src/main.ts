// Note Status, like Inkdrop's: Active, On Hold, Completed or Dropped. The status is a `#status-<id>` tag in the note, so
// it syncs with the note and the sidebar's tags filter by it. The text rules are in status.ts.
import type { EditorView, NoteInfo, Plugin } from "fulgurite"
import { type Status, setStatus, statusOf, statuses } from "./status"

const plugin: Plugin = {
  onLoad(ctx) {
    /** One edit, so one undo; the cursor stays on the text it was on. */
    const apply = (view: EditorView, status: Status | null) => {
      const edit = setStatus(view.text, status)
      if (!edit) return
      const { start, end, text } = edit
      const cursor = view.cursor
      view.replace(start, end, text)
      view.moveCursor(cursor <= start ? cursor : cursor >= end ? cursor + text.length - (end - start) : Math.min(cursor, start + text.length))
    }
    const detail = (note: NoteInfo) => note.body.split("\n").find((l) => l.trim()) ?? ""

    ctx.commands.add({
      id: "set",
      name: "Set status…",
      editorCallback(view) {
        const current = statusOf(view.text)
        const items = [
          { id: "none", label: "None", detail: current ? "" : "Current" },
          ...statuses.map((s) => ({ id: s.id, label: s.name, detail: s.id === current ? "Current" : `#status-${s.id}` })),
        ]
        ctx.ui.suggest({ placeholder: "Set the note's status", items }, (id, view) => apply(view, id === "none" ? null : (id as Status)))
      },
    })
    for (const s of statuses) {
      ctx.commands.add({ id: `set-${s.id}`, name: `Set status to ${s.name}`, editorCallback: (view) => apply(view, s.id) })
    }
    ctx.commands.add({ id: "clear", name: "Clear status", editorCallback: (view) => apply(view, null) })

    ctx.commands.add({
      id: "show",
      name: "Show notes by status…",
      callback() {
        const items = statuses.map((s) => ({ id: s.id, label: s.name, detail: `#status-${s.id}` }))
        ctx.ui.suggest({ placeholder: "Show notes by status", items }, (id) => {
          const name = statuses.find((s) => s.id === id)?.name ?? id
          const notes = ctx.notes.list({ tag: `status-${id}` })
          if (notes.length === 0) return ctx.notice(`No ${name} notes`)
          // A picker opened from a picker's onChoose: the host sends it with this choice's result.
          const items = notes.map((n) => ({ id: n.id, label: n.title || "Untitled", detail: detail(n) }))
          ctx.ui.suggest({ placeholder: `${name} notes`, items }, (noteId) => ctx.notes.open(noteId))
        })
      },
    })
  },
}

export default plugin
