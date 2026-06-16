//! `svelte/valid-compile` — surface the Svelte compiler's own warnings/errors as
//! lint findings. Port of the eslint-plugin-svelte rule.
//!
//! ## Relationship to the validator wrap
//!
//! rsvelte already surfaces every compiler warning/error/a11y finding under its
//! *own* code (e.g. `a11y_missing_attribute`) via [`crate::validator`], which is
//! finer-grained than eslint-plugin-svelte's single `valid-compile` rule. This
//! rule reproduces the upstream shape: every compiler warning (and, for a
//! compile error, that error) reported under the single id `svelte/valid-compile`
//! with the message `"{message}({code})"`. To avoid double-reporting against the
//! validator wrap it is **off by default** (opt-in), and it is wired into
//! [`crate::runner::lint_source`] rather than the per-node rule walk because its
//! input is the whole-component compile result.
//!
//! ### Known divergences
//! - The `onwarn` / `warningFilter` config callbacks (`svelte.config.js`) are JS
//!   functions; a native linter can't execute them, so fixtures relying on them
//!   are out of scope (skipped in the oracle).

use std::path::Path;

use rsvelte_core::compiler::Position;
use rsvelte_core::svelte_check::diagnostic::Diagnostic;
use rsvelte_core::{CompileOptions, GenerateMode, compile};
use serde_json::Value;

use crate::config::LintConfig;
use crate::line_index::LineIndex;
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::validator::{range_from, to_dsev};

pub static META: RuleMeta = RuleMeta {
    name: "svelte/valid-compile",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    // Off by default: the validator wrap already surfaces compiler warnings under
    // their own codes. Opt in to get them under the single `valid-compile` id.
    default_severity: Severity::Off,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "disallow warnings when compiling",
    options_schema: Some(
        r#"{ "type": "object", "properties": {
            "ignoreWarnings": { "type": "boolean" }
        }, "additionalProperties": false }"#,
    ),
};

/// Warning codes upstream always ignores (`missing-declaration`), in both the
/// Svelte-5 underscore and Svelte-4 hyphen spellings.
const ALWAYS_IGNORED: &[&str] = &["missing-declaration", "missing_declaration"];

/// `css_unused_selector` codes (both spellings) — ignored when the warning falls
/// inside a `<style global>` element (upstream `isGlobalStyleNode`).
const UNUSED_SELECTOR: &[&str] = &["css_unused_selector", "css-unused-selector"];

fn ignore_warnings_enabled(options: Option<&Value>) -> bool {
    options
        .and_then(|o| o.as_array())
        .and_then(|a| a.first())
        .and_then(|v| v.get("ignoreWarnings"))
        .and_then(Value::as_bool)
        .unwrap_or(false)
}

/// Compile `source` (warnings-only) and surface the result under
/// `svelte/valid-compile`. Returns empty when the rule is `Off`.
pub fn valid_compile_diagnostics(
    source: &str,
    file: &Path,
    base_options: &CompileOptions,
    config: &LintConfig,
) -> Vec<Diagnostic> {
    let severity = config.resolve_code(META.name, META.default_severity);
    if severity == Severity::Off {
        return Vec::new();
    }
    let ignore_warnings = ignore_warnings_enabled(config.options_for(META.name));

    let options = CompileOptions {
        generate: GenerateMode::None,
        filename: Some(file.display().to_string()),
        ..base_options.clone()
    };

    let global_ranges = global_style_ranges(source);

    match compile(source, options) {
        Ok(res) => {
            // `kind === 'warn'`: `ignoreWarnings` suppresses the whole set.
            if ignore_warnings {
                return Vec::new();
            }
            res.warnings
                .into_iter()
                .filter(|w| !ALWAYS_IGNORED.contains(&w.code.as_str()))
                // `css_unused_selector` inside a `<style global>` is ignored.
                .filter(|w| {
                    !(UNUSED_SELECTOR.contains(&w.code.as_str())
                        && is_global_style_node(&global_ranges, w.start.as_ref(), w.end.as_ref()))
                })
                .map(|w| Diagnostic {
                    file: file.to_path_buf(),
                    severity: to_dsev(severity),
                    range: range_from(w.start.as_ref(), w.end.as_ref()),
                    message: format!("{}({})", w.message, w.code),
                    code: Some(META.name.to_string()),
                    source: "svelte",
                })
                .collect()
        }
        // `kind === 'error'`: a hard compile error is reported even with
        // `ignoreWarnings` (upstream only short-circuits the `warn` kind).
        Err(e) => {
            let (code, message, range) = crate::validator::compile_error_parts(&e);
            if ALWAYS_IGNORED.contains(&code.as_str()) {
                return Vec::new();
            }
            let message = if code.is_empty() {
                message
            } else {
                format!("{message}({code})")
            };
            vec![Diagnostic {
                file: file.to_path_buf(),
                severity: to_dsev(severity),
                range,
                message,
                code: Some(META.name.to_string()),
                source: "svelte",
            }]
        }
    }
}

/// `[start, end]` line/column ranges of every `<style global>` element, used to
/// suppress `css_unused_selector` warnings inside them (upstream's
/// `isGlobalStyleNode`). Positions are 1-based line / 0-based column, matching
/// the compiler warning positions.
fn global_style_ranges(source: &str) -> Vec<((u32, u32), (u32, u32))> {
    let li = LineIndex::new(source);
    let bytes = source.as_bytes();
    let mut out = Vec::new();
    let mut i = 0;
    while i + 6 <= bytes.len() {
        if &bytes[i..i + 6] != b"<style" {
            i += 1;
            continue;
        }
        // Boundary after `<style` (ws / `>` / `/`).
        let after = bytes.get(i + 6).copied();
        if !matches!(after, Some(c) if c == b' ' || c == b'\t' || c == b'\n' || c == b'\r' || c == b'>' || c == b'/')
        {
            i += 6;
            continue;
        }
        // Read the start tag up to `>`, tracking quotes.
        let mut j = i + 6;
        let mut quote: Option<u8> = None;
        let mut tag_end = None;
        while j < bytes.len() {
            let c = bytes[j];
            match quote {
                Some(q) => {
                    if c == q {
                        quote = None;
                    }
                }
                None => {
                    if c == b'"' || c == b'\'' {
                        quote = Some(c);
                    } else if c == b'>' {
                        tag_end = Some(j);
                        break;
                    }
                }
            }
            j += 1;
        }
        let Some(tag_end) = tag_end else { break };
        let start_tag = &source[i + 6..tag_end];
        // Match a `global` *attribute name* (upstream `attr.key.name === 'global'`),
        // not a `global` attribute *value* like `<style lang=global>`.
        let has_global = crate::svelte_scan::has_attr(start_tag, "global");
        if has_global {
            // Element end: the `</style>` close (or EOF if unterminated).
            let close = source[tag_end..]
                .find("</style>")
                .map(|rel| tag_end + rel + "</style>".len())
                .unwrap_or(source.len());
            out.push((li.position(i as u32), li.position(close as u32)));
        }
        i = tag_end + 1;
    }
    out
}

/// Whether the warning's `[start, end]` is contained in any global-style range
/// (line/column inclusive comparison, matching upstream `isGlobalStyleNode`).
fn is_global_style_node(
    ranges: &[((u32, u32), (u32, u32))],
    start: Option<&Position>,
    end: Option<&Position>,
) -> bool {
    let (Some(start), Some(end)) = (start, end) else {
        return false;
    };
    let s = (start.line as u32, start.column as u32);
    let e = (end.line as u32, end.column as u32);
    ranges.iter().any(|(rs, re)| *rs <= s && e <= *re)
}
