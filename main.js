"use strict";
var __plugin = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/main.ts
  var main_exports = {};
  __export(main_exports, {
    default: () => main_default
  });

  // src/status.ts
  var statuses = [
    { id: "active", name: "Active" },
    { id: "on-hold", name: "On Hold" },
    { id: "completed", name: "Completed" },
    { id: "dropped", name: "Dropped" }
  ];
  var tagPattern = /(?<!\S)#status-(active|on-hold|completed|dropped)(?![\p{Alphabetic}\p{N}_-])/u;
  function statusOf(body) {
    return tagPattern.exec(body)?.[1] ?? null;
  }
  function setStatus(body, status) {
    const tag = status && `#status-${status}`;
    const found = tagPattern.exec(body);
    if (!found) {
      if (!tag) return null;
      return { start: body.length, end: body.length, text: body === "" ? tag : body.endsWith("\n") ? `${tag}
` : `
${tag}` };
    }
    let start = found.index;
    let end = start + found[0].length;
    if (tag) return found[0] === tag ? null : { start, end, text: tag };
    if (/[ \t]/.test(body.charAt(end))) end++;
    else if (/[ \t]/.test(body.charAt(start - 1))) start--;
    const lineStart = body.lastIndexOf("\n", start - 1) + 1;
    const newline = body.indexOf("\n", end);
    const lineEnd = newline < 0 ? body.length : newline;
    if (body.slice(lineStart, start).trim() || body.slice(end, lineEnd).trim()) return { start, end, text: "" };
    return newline < 0 ? { start: Math.max(lineStart - 1, 0), end: lineEnd, text: "" } : { start: lineStart, end: lineEnd + 1, text: "" };
  }

  // src/main.ts
  var plugin = {
    onLoad(ctx) {
      const apply = (view, status) => {
        const edit = setStatus(view.text, status);
        if (!edit) return;
        const { start, end, text } = edit;
        const cursor = view.cursor;
        view.replace(start, end, text);
        view.moveCursor(cursor <= start ? cursor : cursor >= end ? cursor + text.length - (end - start) : Math.min(cursor, start + text.length));
      };
      const detail = (note) => note.body.split("\n").find((l) => l.trim()) ?? "";
      ctx.commands.add({
        id: "set",
        name: "Set status\u2026",
        editorCallback(view) {
          const current = statusOf(view.text);
          const items = [
            { id: "none", label: "None", detail: current ? "" : "Current" },
            ...statuses.map((s) => ({ id: s.id, label: s.name, detail: s.id === current ? "Current" : `#status-${s.id}` }))
          ];
          ctx.ui.suggest({ placeholder: "Set the note's status", items }, (id, view2) => apply(view2, id === "none" ? null : id));
        }
      });
      for (const s of statuses) {
        ctx.commands.add({ id: `set-${s.id}`, name: `Set status to ${s.name}`, editorCallback: (view) => apply(view, s.id) });
      }
      ctx.commands.add({ id: "clear", name: "Clear status", editorCallback: (view) => apply(view, null) });
      ctx.commands.add({
        id: "show",
        name: "Show notes by status\u2026",
        callback() {
          const items = statuses.map((s) => ({ id: s.id, label: s.name, detail: `#status-${s.id}` }));
          ctx.ui.suggest({ placeholder: "Show notes by status", items }, (id) => {
            const name = statuses.find((s) => s.id === id)?.name ?? id;
            const notes = ctx.notes.list({ tag: `status-${id}` });
            if (notes.length === 0) return ctx.notice(`No ${name} notes`);
            const items2 = notes.map((n) => ({ id: n.id, label: n.title || "Untitled", detail: detail(n) }));
            ctx.ui.suggest({ placeholder: `${name} notes`, items: items2 }, (noteId) => ctx.notes.open(noteId));
          });
        }
      });
    }
  };
  var main_default = plugin;
  return __toCommonJS(main_exports);
})();
