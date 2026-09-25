# Note Status

Note statuses for [fulgurite](https://github.com/fulgurite-plugin), like Inkdrop's: Active, On Hold, Completed or
Dropped. The status is a tag in the note (`#status-active`, `#status-on-hold`, `#status-completed`, `#status-dropped`),
so it syncs with the note and the sidebar's tags filter by it. A note has at most one.

- **Set status…** (⌘P) picks one, or None. Setting it changes the tag where it is, or adds it on its own line at the
  end of the note; None takes it out. One undo puts it back.
- **Set status to Active** (On Hold, Completed, Dropped) and **Clear status**, to put on keys: Settings › Shortcuts,
  or a vimrc line such as `nnoremap <leader>sa :fulgurite.note-status:set-active<CR>`
- **Show notes by status…** picks a status, then one of its notes (newest first), and opens it. It works with no note
  open.

## Development

See [api](https://github.com/fulgurite-plugin/fulgurite-api). `npm test` checks the tag rules (`src/status.ts`).
