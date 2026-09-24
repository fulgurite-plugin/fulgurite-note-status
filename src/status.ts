// The status tag's text rules, apart from the plugin so `npm test` runs them without the app.

/** Inkdrop's statuses. A note carries at most one, as the tag `#status-<id>`. */
export const statuses = [
  { id: "active", name: "Active" },
  { id: "on-hold", name: "On Hold" },
  { id: "completed", name: "Completed" },
  { id: "dropped", name: "Dropped" },
] as const

export type Status = (typeof statuses)[number]["id"]

/** A status tag the way the core reads tags: `#` after the start or whitespace, and the tag ends where letters, digits,
 *  `_` and `-` do (so `#status-active` inside `#status-activex` is no status). */
const tagPattern = /(?<!\S)#status-(active|on-hold|completed|dropped)(?![\p{Alphabetic}\p{N}_-])/u

/** The note's status: its first status tag. */
export function statusOf(body: string): Status | null {
  return (tagPattern.exec(body)?.[1] as Status | undefined) ?? null
}

/** The one edit that gives `body` the status (null = none), or null when it already has it. An existing tag changes in
 *  place; clearing takes the tag with one space beside it, or its whole line when nothing else is on it. A new tag goes
 *  on its own line at the end, so clearing it puts the body back as it was. */
export function setStatus(body: string, status: Status | null): { start: number; end: number; text: string } | null {
  const tag = status && `#status-${status}`
  const found = tagPattern.exec(body)
  if (!found) {
    if (!tag) return null
    // Ending like the body did, so clearing it gives the body back exactly.
    return { start: body.length, end: body.length, text: body === "" ? tag : body.endsWith("\n") ? `${tag}\n` : `\n${tag}` }
  }
  let start = found.index
  let end = start + found[0].length
  if (tag) return found[0] === tag ? null : { start, end, text: tag }

  if (/[ \t]/.test(body.charAt(end))) end++
  else if (/[ \t]/.test(body.charAt(start - 1))) start--
  const lineStart = body.lastIndexOf("\n", start - 1) + 1
  const newline = body.indexOf("\n", end)
  const lineEnd = newline < 0 ? body.length : newline
  if (body.slice(lineStart, start).trim() || body.slice(end, lineEnd).trim()) return { start, end, text: "" }
  // The line goes with a newline: its own, or the one before it when it's the last line.
  return newline < 0 ? { start: Math.max(lineStart - 1, 0), end: lineEnd, text: "" } : { start: lineStart, end: lineEnd + 1, text: "" }
}
