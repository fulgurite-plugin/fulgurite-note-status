// `npm test`: Node runs the TypeScript as it is (type stripping, Node 22.18+).
import assert from "node:assert/strict"
import test from "node:test"
import { setStatus, statusOf } from "../src/status.ts"

test("status tags", () => {
  const set = (body: string, status: Parameters<typeof setStatus>[1]) => {
    const edit = setStatus(body, status)
    return edit ? body.slice(0, edit.start) + edit.text + body.slice(edit.end) : body
  }
  // Appended on its own line
  assert.equal(set("", "active"), "#status-active")
  assert.equal(set("Plan", "active"), "Plan\n#status-active")
  assert.equal(set("Plan\n", "on-hold"), "Plan\n#status-on-hold\n")
  for (const body of ["", "Plan", "Plan\n"]) assert.equal(set(set(body, "active"), null), body) // clearing undoes setting
  // Changed in place, and no edit when it's already there
  assert.equal(set("Plan #status-active #work", "dropped"), "Plan #status-dropped #work")
  assert.equal(setStatus("#status-completed", "completed"), null)
  // Cleared with one space, or with its line
  assert.equal(set("Plan #status-active #work", null), "Plan #work")
  assert.equal(set("Plan #status-active", null), "Plan")
  assert.equal(set("a\n#status-active\nb", null), "a\nb")
  assert.equal(set("Plan\n#status-active", null), "Plan")
  assert.equal(setStatus("Plan", null), null)
  // Only real tags count, like the core's
  assert.equal(statusOf("a#status-active #status-activex x #status-on-hold"), "on-hold")
  assert.equal(statusOf("no status"), null)
})
