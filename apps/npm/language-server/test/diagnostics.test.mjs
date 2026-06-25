// Unit tests for the rsvelte_lint → LSP Diagnostic conversion.
// Imports the esbuild-emitted ESM lib (run `pnpm run build` first).

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  entryToDiagnostic,
  lintJsonToDiagnostics,
} from "../dist/lib/diagnostics.mjs";

// LSP DiagnosticSeverity numeric values (vscode-languageserver-protocol).
const SEV_ERROR = 1;
const SEV_WARNING = 2;
const SEV_INFO = 3;
const SEV_HINT = 4;

test("maps line (1-idx) → LSP line (0-idx) and keeps column as character", () => {
  const d = entryToDiagnostic({
    severity: "warning",
    line: 5,
    column: 2,
    endLine: 5,
    endColumn: 10,
    code: "a11y_foo",
    message: "msg",
  });
  assert.deepEqual(d.range, {
    start: { line: 4, character: 2 },
    end: { line: 4, character: 10 },
  });
  assert.equal(d.code, "a11y_foo");
  assert.equal(d.source, "rsvelte");
  assert.equal(d.message, "msg");
});

test("severity mapping", () => {
  const mk = (severity) =>
    entryToDiagnostic({
      severity,
      line: 1,
      column: 0,
      endLine: 1,
      endColumn: 1,
      code: "c",
      message: "m",
    }).severity;
  assert.equal(mk("error"), SEV_ERROR);
  assert.equal(mk("warning"), SEV_WARNING);
  assert.equal(mk("warn"), SEV_WARNING);
  assert.equal(mk("info"), SEV_INFO);
  assert.equal(mk("information"), SEV_INFO);
  assert.equal(mk("hint"), SEV_HINT);
  assert.equal(mk("unknown-thing"), SEV_WARNING); // default → warning
});

test("missing end falls back to start", () => {
  const d = entryToDiagnostic({
    severity: "error",
    line: 1,
    column: 0,
    endLine: 0,
    endColumn: 0,
    code: "parse-error",
    message: "boom",
  });
  // endLine 0 → falls back to entry.line (1) → 0-idx 0.
  assert.deepEqual(d.range.start, { line: 0, character: 0 });
  assert.deepEqual(d.range.end, { line: 0, character: 0 });
});

test("lintJsonToDiagnostics parses an array", () => {
  const json = JSON.stringify([
    {
      severity: "warning",
      line: 2,
      column: 1,
      endLine: 2,
      endColumn: 3,
      code: "x",
      message: "y",
    },
  ]);
  const ds = lintJsonToDiagnostics(json);
  assert.equal(ds.length, 1);
  assert.equal(ds[0].range.start.line, 1);
});

test("lintJsonToDiagnostics tolerates malformed input", () => {
  assert.deepEqual(lintJsonToDiagnostics("not json"), []);
  assert.deepEqual(lintJsonToDiagnostics("{}"), []);
  assert.deepEqual(lintJsonToDiagnostics("null"), []);
});
