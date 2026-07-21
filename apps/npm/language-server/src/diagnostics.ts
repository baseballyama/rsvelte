/**
 * Conversion from rsvelte_lint's wasm JSON output to LSP `Diagnostic`s.
 *
 * The wasm `lint(source, filename)` export returns a JSON array of entries
 * (see `crates/rsvelte_lint_bindings/src/wasm.rs`):
 *
 *   { "severity": "error"|"warning", "line": 1, "column": 0,
 *     "endLine": 1, "endColumn": 5, "code": "...", "message": "..." }
 *
 * `line`/`endLine` are 1-indexed; `column`/`endColumn` are 0-indexed UTF-16
 * offsets (the same encoding LSP uses by default), so the mapping to an LSP
 * `Range` is a straight `line - 1` with `character = column`.
 *
 * This module is deliberately free of any wasm / `vscode-languageserver`
 * runtime dependency so it can be unit-tested in isolation.
 */

import {
  type Diagnostic,
  DiagnosticSeverity,
} from "vscode-languageserver/node";

/** One entry as emitted by the rsvelte_lint wasm `lint()` export. */
export interface LintEntry {
  severity: string;
  line: number;
  column: number;
  endLine: number;
  endColumn: number;
  code: string;
  message: string;
}

const SOURCE = "rsvelte";

function mapSeverity(severity: string): DiagnosticSeverity {
  switch (severity) {
    case "error":
      return DiagnosticSeverity.Error;
    case "info":
    case "information":
      return DiagnosticSeverity.Information;
    case "hint":
      return DiagnosticSeverity.Hint;
    case "warn":
    case "warning":
    default:
      return DiagnosticSeverity.Warning;
  }
}

/** Convert a single rsvelte_lint entry to an LSP `Diagnostic`. */
export function entryToDiagnostic(entry: LintEntry): Diagnostic {
  const startLine = Math.max(0, entry.line - 1);
  const startChar = Math.max(0, entry.column);
  // Some entries (e.g. a hard compile error reported at 1:0) carry no real
  // end — fall back to the start so the range stays valid.
  const endLine = Math.max(0, (entry.endLine || entry.line) - 1);
  const endChar = Math.max(0, entry.endColumn ?? entry.column);
  return {
    severity: mapSeverity(entry.severity),
    range: {
      start: { line: startLine, character: startChar },
      end: { line: endLine, character: endChar },
    },
    code: entry.code,
    source: SOURCE,
    message: entry.message,
  };
}

/**
 * Parse the JSON string returned by the lint wasm and map every entry to an
 * LSP `Diagnostic`. A malformed payload yields an empty array rather than
 * throwing — diagnostics must never crash the server.
 */
export function lintJsonToDiagnostics(json: string): Diagnostic[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((e): e is LintEntry => !!e && typeof e === "object")
    .map(entryToDiagnostic);
}
