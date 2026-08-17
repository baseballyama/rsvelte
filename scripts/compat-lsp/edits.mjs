// The document after the last change is byte-identical to the opened one, so a
// phase-2 key is comparable to its phase-1 twin and a divergence is a
// state-transition difference alone. The undo is an incremental range too: a
// full-document replacement at the end would restore a server whose incremental
// apply is broken, and hide exactly what this phase exists to reach.
export const OPEN_PHASE = "open";
export const EDIT_PHASES = ["edit"];

const SCRIPT_PROBE =
  "\nimport { tick as __rsvelte_lsp_probe_tick } from 'svelte';\nconst __rsvelte_lsp_probe = __rsvelte_lsp_probe_tick;\n";
const STYLE_PROBE = "\n.rsvelte-lsp-probe { color: red; }\n";
// Unclosed on purpose: the repair path is only exercised if the intermediate
// document is one neither compiler accepts.
const MARKUP_PROBE = "\n{#if __rsvelte_lsp_probe}\n";

export function insertionPoints(text) {
  const points = [];
  const script = text.indexOf("</script>");
  if (script >= 0) points.push({ offset: script, text: SCRIPT_PROBE });
  const style = text.indexOf("</style>");
  if (style >= 0) points.push({ offset: style, text: STYLE_PROBE });
  points.push({ offset: text.length, text: MARKUP_PROBE });
  return points.sort((left, right) => left.offset - right.offset);
}

function positionAt(text, offset) {
  const before = text.slice(0, offset).split("\n");
  return { line: before.length - 1, character: before.at(-1).length };
}

export function editChanges(text) {
  const changes = [];
  const applied = [];
  let current = text;
  let shift = 0;
  for (const point of insertionPoints(text)) {
    const offset = point.offset + shift;
    const position = positionAt(current, offset);
    changes.push({
      range: { start: position, end: position },
      text: point.text,
    });
    current = current.slice(0, offset) + point.text + current.slice(offset);
    applied.push({ offset, length: point.text.length });
    shift += point.text.length;
  }
  for (const entry of applied.reverse()) {
    changes.push({
      range: {
        start: positionAt(current, entry.offset),
        end: positionAt(current, entry.offset + entry.length),
      },
      text: "",
    });
    current =
      current.slice(0, entry.offset) +
      current.slice(entry.offset + entry.length);
  }
  if (current !== text)
    throw new Error("the edit script did not restore the opened document");
  return changes;
}

export function applyChange(text, change) {
  if (!change.range) return change.text;
  const lines = text.split("\n");
  const offsetOf = (position) =>
    lines
      .slice(0, position.line)
      .reduce((sum, line) => sum + line.length + 1, 0) + position.character;
  return (
    text.slice(0, offsetOf(change.range.start)) +
    change.text +
    text.slice(offsetOf(change.range.end))
  );
}
