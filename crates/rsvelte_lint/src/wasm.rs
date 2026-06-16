//! Browser entry point for the playground.
//!
//! Exposes `lint(source, filename)` returning a JSON array of diagnostics. The
//! rsvelte_core compiler's own wasm exports (`parse_svelte`, `compile_client`,
//! `compile_server`, `version`) are linked in transitively from the
//! `rsvelte_core/wasm` dependency, so a single wasm module serves the whole
//! playground.
//!
//! This path is `svelte_check`-free: it runs the native rule engine
//! ([`engine::run_native_rules`](crate::engine::run_native_rules)) plus the
//! compiler's own warnings/errors via `compile(GenerateMode::None)`, and emits
//! line/column directly (no `svelte_check::Diagnostic`).

use serde_json::json;
use wasm_bindgen::prelude::*;

use rsvelte_core::compiler::AnalysisError;
use rsvelte_core::{CompileError, CompileOptions, GenerateMode, compile};

use crate::config::LintConfig;
use crate::engine::run_native_rules;
use crate::line_index::LineIndex;
use crate::rule::Severity;
use crate::suppression::Suppressions;

struct Entry {
    severity: &'static str,
    line: u32,
    column: u32,
    end_line: u32,
    end_column: u32,
    code: String,
    message: String,
}

fn sev_str(s: Severity) -> &'static str {
    match s {
        Severity::Error => "error",
        _ => "warning",
    }
}

fn compile_error_code(e: &CompileError) -> String {
    match e {
        CompileError::Analysis(AnalysisError::ValidationWithCode { code, .. }) => code.clone(),
        CompileError::Parse(_) => "parse-error".to_string(),
        _ => "compile-error".to_string(),
    }
}

/// Lint `source`, returning a JSON array of diagnostics:
/// `[{ "severity", "line", "column", "endLine", "endColumn", "code", "message" }]`.
/// Lines are 1-indexed, columns 0-indexed (UTF-16), matching `rsvelte check`.
#[wasm_bindgen]
pub fn lint(source: &str, filename: &str) -> String {
    let config = LintConfig::recommended();
    let line_index = LineIndex::new(source);
    let suppressions = Suppressions::collect(source);
    let mut entries: Vec<Entry> = Vec::new();

    // 1. Compiler warnings / errors (validator wrap) — codegen skipped.
    let options = CompileOptions {
        generate: GenerateMode::None,
        filename: Some(filename.to_string()),
        ..Default::default()
    };
    match compile(source, options) {
        Ok(res) => {
            for w in res.warnings {
                let sev = config.resolve_code(&w.code, Severity::Warn);
                if sev == Severity::Off {
                    continue;
                }
                let (l, c) = w
                    .start
                    .as_ref()
                    .map(|p| (p.line as u32, p.column as u32))
                    .unwrap_or((1, 0));
                let (el, ec) = w
                    .end
                    .as_ref()
                    .map(|p| (p.line as u32, p.column as u32))
                    .unwrap_or((l, c));
                if suppressions.is_suppressed(&w.code, l) {
                    continue;
                }
                entries.push(Entry {
                    severity: sev_str(sev),
                    line: l,
                    column: c,
                    end_line: el,
                    end_column: ec,
                    code: w.code,
                    message: w.message,
                });
            }
        }
        Err(e) => entries.push(Entry {
            severity: "error",
            line: 1,
            column: 0,
            end_line: 1,
            end_column: 0,
            code: compile_error_code(&e),
            message: format!("{e}"),
        }),
    }

    // 2. Native rules (template walk) + script-AST rules. No filesystem in
    // wasm, so no path is threaded (any filesystem-aware rule no-ops here).
    let native = run_native_rules(source, filename, &config, None)
        .into_iter()
        .chain(crate::engine::run_script_rules(source, filename, &config));
    for d in native {
        let (l, c) = line_index.position(d.start);
        if suppressions.is_suppressed(&d.rule, l) {
            continue;
        }
        let (el, ec) = line_index.position(d.end);
        entries.push(Entry {
            severity: sev_str(d.severity),
            line: l,
            column: c,
            end_line: el,
            end_column: ec,
            code: d.rule,
            message: d.message,
        });
    }

    entries.sort_by_key(|e| (e.line, e.column));
    let arr: Vec<_> = entries
        .into_iter()
        .map(|e| {
            json!({
                "severity": e.severity,
                "line": e.line,
                "column": e.column,
                "endLine": e.end_line,
                "endColumn": e.end_column,
                "code": e.code,
                "message": e.message,
            })
        })
        .collect();
    serde_json::to_string(&arr).unwrap_or_else(|_| "[]".to_string())
}

/// The rsvelte-lint crate version (for the playground UI).
#[wasm_bindgen]
pub fn lint_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}
