//! Engine-only JSON diagnostic API, shared by every out-of-process binding.
//!
//! Both the wasm export ([`crate::wasm`]) and the NAPI export ([`crate::napi`])
//! are thin wrappers over the two functions here, so a native (`.node`) and a
//! wasm consumer see **byte-identical JSON**. This path is `svelte_check`-free:
//! it runs the native rule engine ([`run_native_rules`](crate::engine::run_native_rules)
//! and [`run_script_rules`](crate::engine::run_script_rules)) plus the
//! compiler's own warnings/errors via `compile(GenerateMode::None)`, and emits
//! line/column directly.

use serde_json::json;

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

fn sev_catalog(s: Severity) -> &'static str {
    match s {
        Severity::Off => "off",
        Severity::Warn => "warning",
        Severity::Error => "error",
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

    // 2. Native rules (template walk) + script-AST rules. No filesystem here, so
    // no path is threaded (any filesystem-aware rule no-ops).
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

/// The full catalog of diagnostic ids [`lint`] can emit, as a JSON array:
/// `[{ "name", "defaultSeverity", "category", "description" }]`.
///
/// Two sources are unioned (the same universe [`lint`] draws from): the native
/// rules that actually run in this path (via `run_native_rules` /
/// `run_script_rules`; their `svelte/` prefix is stripped so a consumer can
/// re-namespace) and the compiler / validator / a11y warning codes
/// ([`valid_warning_codes`](rsvelte_core::compiler::phases::phase2_analyze::utils::valid_warning_codes),
/// bare snake_case, always emitted at warning severity). Consumed by
/// `@rsvelte/oxlint-plugin` to register its rule set + generate its recommended
/// config directly from the engine.
pub fn lint_rules() -> String {
    use rsvelte_core::compiler::phases::phase2_analyze::utils::valid_warning_codes;

    fn category_str(c: crate::rule::RuleCategory) -> &'static str {
        match c {
            crate::rule::RuleCategory::Correctness => "correctness",
            crate::rule::RuleCategory::A11y => "a11y",
            crate::rule::RuleCategory::Style => "style",
            crate::rule::RuleCategory::Formatting => "formatting",
        }
    }

    let mut arr: Vec<serde_json::Value> = Vec::new();
    let mut seen = std::collections::HashSet::new();

    // Native rules — the template-AST + script-AST sets that actually run in the
    // `lint` path. The native-only meta-rules (wired into `runner::lint_source`)
    // never fire here, so they are intentionally excluded. Ids are
    // `svelte/<rule>` → `<rule>`.
    let template_metas = crate::registry::all_rules();
    let script_metas = crate::registry::all_script_rules();
    let metas = template_metas
        .iter()
        .map(|r| r.meta())
        .chain(script_metas.iter().map(|r| r.meta()));
    for meta in metas {
        if !seen.insert(meta.name) {
            continue;
        }
        let name = meta.name.strip_prefix("svelte/").unwrap_or(meta.name);
        arr.push(json!({
            "name": name,
            "defaultSeverity": sev_catalog(meta.default_severity),
            "category": category_str(meta.category),
            "description": meta.docs,
        }));
    }

    // Compiler / validator / a11y warning codes (bare snake_case, no RuleMeta).
    // These are always emitted at warning severity by the compiler wrap.
    for code in valid_warning_codes() {
        let category = if code.starts_with("a11y_") {
            "a11y"
        } else if code.starts_with("css_") {
            "style"
        } else {
            "correctness"
        };
        arr.push(json!({
            "name": *code,
            "defaultSeverity": "warning",
            "category": category,
            "description": "Svelte compiler warning",
        }));
    }

    serde_json::to_string(&arr).unwrap_or_else(|_| "[]".to_string())
}
