//! `svelte/block-lang` — disallow languages other than those specified in the
//! configuration for the `lang` attribute of `<script>` and `<style>` blocks.
//!
//! Options (first element of the options array):
//! - `enforceScriptPresent` (bool, default false): require a `<script>` block.
//! - `enforceStylePresent`  (bool, default false): require a `<style>` block.
//! - `script` (string | null | array): allowed lang(s) for `<script>`.
//!   `null` means the attribute must be omitted. Defaults to `null`.
//! - `style`  (string | null | array): allowed lang(s) for `<style>`.
//!   `null` means the attribute must be omitted. Defaults to `null`.
//!
//! Port of `eslint-plugin-svelte/src/rules/block-lang.ts`.
//! Upstream: `meta.type = 'suggestion'`, `hasSuggestions: true`.

// `Path` is only used by the native-only source-scan fallback below.
#[cfg(feature = "native")]
use std::path::Path;

use rsvelte_core::ast::css::StyleSheet;
use rsvelte_core::ast::template::{
    AttributeNode, AttributeValue, AttributeValuePart, Root, Script,
};
// `svelte_check` is native-only; only the source-scan fallback below produces
// `Diagnostic`s, so these imports are gated with it.
#[cfg(feature = "native")]
use rsvelte_core::svelte_check::diagnostic::{Diagnostic, Position, Range};
use serde_json::Value;

// `LintConfig` is only referenced by the native-only source-scan fallback below.
#[cfg(feature = "native")]
use crate::config::LintConfig;
use crate::context::LintContext;
use crate::diagnostic::{Fix, Suggestion, TextEdit};
#[cfg(feature = "native")]
use crate::line_index::LineIndex;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
#[cfg(feature = "native")]
use crate::validator::to_dsev;

static META: RuleMeta = RuleMeta {
    name: "svelte/block-lang",
    category: RuleCategory::Style,
    fixable: Fixable::Suggestion,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow languages other than those specified for <script>/<style> blocks",
    options_schema: Some(
        r#"[{"type":"object","properties":{
            "enforceScriptPresent":{"type":"boolean"},
            "enforceStylePresent":{"type":"boolean"},
            "script":{"oneOf":[{"type":["string","null"]},{"type":"array","items":{"type":["string","null"]},"minItems":1}]},
            "style":{"oneOf":[{"type":["string","null"]},{"type":"array","items":{"type":["string","null"]},"minItems":1}]}
        },"additionalProperties":false}]"#,
    ),
};

// ---------------------------------------------------------------------------
// Option parsing
// ---------------------------------------------------------------------------

/// Extract `script` or `style` option as a list of allowed langs (`None` =
/// the lang attribute must be omitted).
fn parse_lang_option(opts: Option<&Value>, key: &str) -> Vec<Option<String>> {
    let raw = opts.and_then(|o| o.get(key));
    match raw {
        None => vec![None],
        Some(Value::Null) => vec![None],
        Some(Value::String(s)) => vec![Some(s.clone())],
        Some(Value::Array(arr)) => arr
            .iter()
            .map(|v| match v {
                Value::Null => None,
                Value::String(s) => Some(s.clone()),
                _ => None,
            })
            .collect(),
        _ => vec![None],
    }
}

// ---------------------------------------------------------------------------
// Helpers for extracting the lang from a node
// ---------------------------------------------------------------------------

/// Get the `lang` attribute value (lowercased) from a `<script>` block, or
/// `None` when the attribute is absent (shorthand `lang` without value counts
/// as an empty string).
fn get_script_lang(script: &Script) -> Option<String> {
    find_script_lang_attr(script).map(|attr| match &attr.value {
        AttributeValue::True(_) => String::new(),
        AttributeValue::Sequence(parts) => parts
            .iter()
            .filter_map(|p| {
                if let AttributeValuePart::Text(t) = p {
                    Some(t.data.as_str())
                } else {
                    None
                }
            })
            .collect::<String>()
            .to_lowercase(),
        AttributeValue::Expression(_) => String::new(),
    })
}

/// Find the `lang` `AttributeNode` within a `<script>` block's attributes.
fn find_script_lang_attr(script: &Script) -> Option<&AttributeNode> {
    script.attributes.iter().find(|a| a.name == "lang")
}

/// Get the `lang` attribute value (lowercased) from a `<style>` block stored
/// as raw JSON, or `None` when absent.
fn get_style_lang(css: &StyleSheet) -> Option<String> {
    for attr in &css.attributes {
        if attr.get("name").and_then(Value::as_str) == Some("lang") {
            let raw_val = attr.get("value")?;
            // Shorthand / boolean: lang present but no value.
            if raw_val.as_bool().is_some() {
                return Some(String::new());
            }
            // Sequence: look for the first Text part's `data`.
            if let Some(seq) = raw_val.as_array() {
                for part in seq {
                    if part.get("type").and_then(Value::as_str) == Some("Text")
                        && let Some(data) = part.get("data").and_then(Value::as_str)
                    {
                        return Some(data.to_lowercase());
                    }
                }
            }
            return Some(String::new());
        }
    }
    None
}

/// Read `start` / `end` of the `lang` attribute from a `<style>` block's JSON
/// attributes list.
fn style_lang_attr_range(css: &StyleSheet) -> Option<(u32, u32)> {
    for attr in &css.attributes {
        if attr.get("name").and_then(Value::as_str) == Some("lang") {
            let start = attr.get("start").and_then(Value::as_u64)?;
            let end = attr.get("end").and_then(Value::as_u64)?;
            return Some((start as u32, end as u32));
        }
    }
    None
}

// ---------------------------------------------------------------------------
// Pretty-print the allowed languages list
// ---------------------------------------------------------------------------

fn pretty_print_langs(langs: &[Option<String>]) -> String {
    let has_null = langs.iter().any(|l| l.is_none());
    let non_null: Vec<String> = langs
        .iter()
        .filter_map(|l| l.as_ref())
        .map(|s| format!("\"{s}\""))
        .collect();
    if non_null.is_empty() {
        return "omitted".to_string();
    }
    let null_text = if has_null { "either omitted or " } else { "" };
    let non_null_text = if non_null.len() == 1 {
        non_null[0].clone()
    } else {
        format!("one of {}", non_null.join(", "))
    };
    format!("{null_text}{non_null_text}")
}

// ---------------------------------------------------------------------------
// Suggestion builders
// ---------------------------------------------------------------------------

/// Build suggestions for a `<script>` block where we need to REPLACE the
/// existing `lang` attribute with each allowed value, or REMOVE it when
/// `null` is the only allowed lang.
fn build_replace_script_lang_suggestions(
    allowed: &[Option<String>],
    script: &Script,
) -> Vec<Suggestion> {
    let lang_attr = find_script_lang_attr(script);
    let has_null = allowed.iter().any(|l| l.is_none());
    let non_null: Vec<&str> = allowed
        .iter()
        .filter_map(|l| l.as_deref())
        .filter(|s| !s.is_empty())
        .collect();

    let mut suggestions = Vec::new();

    // When the only allowed value is `null` and there IS an existing lang attr
    // → offer to remove the lang attribute.
    if non_null.is_empty() && has_null {
        if let Some(attr) = lang_attr {
            suggestions.push(Suggestion {
                desc: "Replace a <script> block with the lang attribute omitted.".to_string(),
                fix: Fix {
                    message: "Remove lang attribute".to_string(),
                    edits: vec![TextEdit {
                        // Remove ` lang="..."` including the leading space.
                        start: attr.start.saturating_sub(1),
                        end: attr.end,
                        new_text: String::new(),
                    }],
                },
            });
        }
        return suggestions;
    }

    for lang in &non_null {
        let new_attr_text = format!("lang=\"{lang}\"");
        let suggestion = if let Some(attr) = lang_attr {
            Suggestion {
                desc: format!(
                    "Replace a <script> block with the lang attribute set to \"{lang}\"."
                ),
                fix: Fix {
                    message: format!("Set lang=\"{lang}\""),
                    edits: vec![TextEdit {
                        start: attr.start,
                        end: attr.end,
                        new_text: new_attr_text,
                    }],
                },
            }
        } else {
            // No existing lang attr — insert.
            // `<script` is 7 bytes; insert after the tag name, before ` lang`.
            let insert_at = script.start + 7;
            Suggestion {
                desc: format!("Add lang attribute to a <script> block with the value \"{lang}\"."),
                fix: Fix {
                    message: format!("Add lang=\"{lang}\""),
                    edits: vec![TextEdit {
                        start: insert_at,
                        end: insert_at,
                        new_text: format!(" lang=\"{lang}\""),
                    }],
                },
            }
        };
        suggestions.push(suggestion);
    }
    suggestions
}

/// Build suggestions for a `<style>` block where we need to REPLACE or
/// REMOVE the existing `lang` attribute.
fn build_replace_style_lang_suggestions(
    allowed: &[Option<String>],
    css: &StyleSheet,
) -> Vec<Suggestion> {
    let attr_range = style_lang_attr_range(css);
    let has_null = allowed.iter().any(|l| l.is_none());
    let non_null: Vec<&str> = allowed
        .iter()
        .filter_map(|l| l.as_deref())
        .filter(|s| !s.is_empty())
        .collect();

    let mut suggestions = Vec::new();

    // Remove case.
    if non_null.is_empty() && has_null {
        if let Some((attr_start, attr_end)) = attr_range {
            suggestions.push(Suggestion {
                desc: "Replace a <style> block with the lang attribute omitted.".to_string(),
                fix: Fix {
                    message: "Remove lang attribute".to_string(),
                    edits: vec![TextEdit {
                        start: attr_start.saturating_sub(1),
                        end: attr_end,
                        new_text: String::new(),
                    }],
                },
            });
        }
        return suggestions;
    }

    for lang in &non_null {
        let new_attr_text = format!("lang=\"{lang}\"");
        let suggestion = if let Some((attr_start, attr_end)) = attr_range {
            Suggestion {
                desc: format!("Replace a <style> block with the lang attribute set to \"{lang}\"."),
                fix: Fix {
                    message: format!("Set lang=\"{lang}\""),
                    edits: vec![TextEdit {
                        start: attr_start,
                        end: attr_end,
                        new_text: new_attr_text,
                    }],
                },
            }
        } else {
            // `<style` is 6 bytes; insert after the tag name, before ` lang`.
            let insert_at = css.start + 6;
            Suggestion {
                desc: format!("Add lang attribute to a <style> block with the value \"{lang}\"."),
                fix: Fix {
                    message: format!("Add lang=\"{lang}\""),
                    edits: vec![TextEdit {
                        start: insert_at,
                        end: insert_at,
                        new_text: format!(" lang=\"{lang}\""),
                    }],
                },
            }
        };
        suggestions.push(suggestion);
    }
    suggestions
}

// ---------------------------------------------------------------------------
// Rule impl
// ---------------------------------------------------------------------------

#[derive(Default)]
pub struct BlockLang;

impl Rule for BlockLang {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_root(&self, ctx: &mut LintContext, root: &Root) {
        let opts = ctx.option0();

        let enforce_script = opts
            .and_then(|o| o.get("enforceScriptPresent"))
            .and_then(Value::as_bool)
            .unwrap_or(false);
        let enforce_style = opts
            .and_then(|o| o.get("enforceStylePresent"))
            .and_then(Value::as_bool)
            .unwrap_or(false);

        let allowed_script = parse_lang_option(opts, "script");
        let allowed_style = parse_lang_option(opts, "style");

        let source = ctx.source().to_string();

        // Collect script blocks (instance + module).
        let mut script_nodes: Vec<&Script> = Vec::new();
        if let Some(inst) = root.instance.as_deref() {
            script_nodes.push(inst);
        }
        if let Some(modul) = root.module.as_deref() {
            script_nodes.push(modul);
        }

        // Enforce presence.
        if script_nodes.is_empty() && enforce_script {
            let msg = format!(
                "The <script> block should be present and its lang attribute should be {}.",
                pretty_print_langs(&allowed_script)
            );
            // Suggestions: only when allowed langs include non-null values.
            let suggestions = build_enforce_script_suggestions(&allowed_script);
            ctx.report_with_suggestions(1, 2, msg, suggestions);
        }

        // Check each script block's lang.
        for script in &script_nodes {
            let actual_lang = get_script_lang(script);
            // Compare the actual lang (or None when absent) against allowed.
            let actual_opt: Option<String> = actual_lang.map(|s| s.to_lowercase());
            let allowed_lc: Vec<Option<String>> = allowed_script
                .iter()
                .map(|l| l.as_ref().map(|s| s.to_lowercase()))
                .collect();
            if !allowed_lc.contains(&actual_opt) {
                let msg = format!(
                    "The lang attribute of the <script> block should be {}.",
                    pretty_print_langs(&allowed_script)
                );
                let suggestions = build_replace_script_lang_suggestions(&allowed_script, script);
                ctx.report_with_suggestions(script.start, script.end, msg, suggestions);
            }
        }

        // Style block.
        let css = root.css.as_deref();
        if css.is_none() && enforce_style {
            let msg = format!(
                "The <style> block should be present and its lang attribute should be {}.",
                pretty_print_langs(&allowed_style)
            );
            let suggestions = build_enforce_style_suggestions(&allowed_style, &source);
            ctx.report_with_suggestions(1, 2, msg, suggestions);
        }

        if let Some(css) = css {
            let actual_lang = get_style_lang(css);
            let actual_opt: Option<String> = actual_lang.map(|s| s.to_lowercase());
            let allowed_lc: Vec<Option<String>> = allowed_style
                .iter()
                .map(|l| l.as_ref().map(|s| s.to_lowercase()))
                .collect();
            if !allowed_lc.contains(&actual_opt) {
                let msg = format!(
                    "The lang attribute of the <style> block should be {}.",
                    pretty_print_langs(&allowed_style)
                );
                let suggestions = build_replace_style_lang_suggestions(&allowed_style, css);
                ctx.report_with_suggestions(css.start, css.end, msg, suggestions);
            }
        }
    }
}

/// Suggestions for when no `<script>` block is present but
/// `enforceScriptPresent` is true.  Inserts `<script lang="…">\n</script>\n\n`
/// at the very beginning of the source (upstream's `insertTextAfterRange([0,0],
/// …)`).
fn build_enforce_script_suggestions(allowed: &[Option<String>]) -> Vec<Suggestion> {
    allowed
        .iter()
        .filter_map(|lang| lang.as_ref())
        .filter(|s| !s.is_empty())
        .map(|lang| {
            let new_block = format!("<script lang=\"{lang}\">\n</script>\n\n");
            Suggestion {
                desc: format!(
                    "Add a lang attribute to a <script> block with the value \"{lang}\"."
                ),
                fix: Fix {
                    message: format!("Add <script lang=\"{lang}\">"),
                    edits: vec![TextEdit {
                        start: 0,
                        end: 0,
                        new_text: new_block,
                    }],
                },
            }
        })
        .collect()
}

/// Suggestions for when no `<style>` block is present but
/// `enforceStylePresent` is true.  Appends `\n<style lang="…">\n</style>\n`
/// at the end of the source.
fn build_enforce_style_suggestions(allowed: &[Option<String>], source: &str) -> Vec<Suggestion> {
    let src_len = source.len() as u32;
    allowed
        .iter()
        .filter_map(|lang| lang.as_ref())
        .filter(|s| !s.is_empty())
        .map(|lang| {
            let new_block = format!("<style lang=\"{lang}\">\n</style>\n\n");
            Suggestion {
                desc: format!("Add a lang attribute to a <style> block with the value \"{lang}\"."),
                fix: Fix {
                    message: format!("Add <style lang=\"{lang}\">"),
                    edits: vec![TextEdit {
                        start: src_len,
                        end: src_len,
                        new_text: new_block,
                    }],
                },
            }
        })
        .collect()
}

// ---------------------------------------------------------------------------
// Source-scan fallback for parse-failure files
// ---------------------------------------------------------------------------

/// Emit block-lang diagnostics via source scanning for files that the Svelte
/// parser cannot fully parse (e.g. files with invalid CSS or TypeScript errors).
/// When the parser succeeds, [`BlockLang::check_root`] handles the rule via the
/// normal AST path and this function is a no-op (to avoid double-reporting).
///
/// Native-only: it produces `rsvelte_core::svelte_check::Diagnostic`s and is
/// only invoked from the native `runner`, so it is excluded from the wasm build.
#[cfg(feature = "native")]
pub fn block_lang_source_scan_diagnostics(
    source: &str,
    file: &Path,
    config: &LintConfig,
    parse_ok: bool,
) -> Vec<Diagnostic> {
    let severity = config.resolve_code(META.name, META.default_severity);
    if severity == Severity::Off {
        return Vec::new();
    }

    // Only run when the AST path was skipped — `BlockLang::check_root` already
    // covers every file the lint engine could parse. `parse_ok` is the result of
    // the caller's single LENIENT parse (`lenient_script: true`): a
    // `<style lang="scss">` / `<script lang="…">` block parses leniently (so
    // `check_root` fires) and running the source scan on top would double-report,
    // so bail out when the shared parse succeeded.
    if parse_ok {
        return Vec::new();
    }

    let opts = config.options_for(META.name);
    let allowed_script = parse_lang_option(opts, "script");
    let allowed_style = parse_lang_option(opts, "style");

    let li = LineIndex::new(source);
    let mut out = Vec::new();

    // Check <script> blocks.
    for block in crate::svelte_scan::script_blocks(source) {
        let attrs = &block.open_tag_attrs;
        let lang = crate::svelte_scan::attr_value(attrs, "lang");
        let actual_opt: Option<String> = lang.map(|s| s.to_lowercase());
        let allowed_lc: Vec<Option<String>> = allowed_script
            .iter()
            .map(|l| l.as_ref().map(|s| s.to_lowercase()))
            .collect();
        if !allowed_lc.contains(&actual_opt) {
            let msg = format!(
                "The lang attribute of the <script> block should be {}.",
                pretty_print_langs(&allowed_script)
            );
            let (line, column) = li.position(block.tag_start as u32);
            out.push(Diagnostic {
                file: file.to_path_buf(),
                severity: to_dsev(severity),
                range: Some(Range {
                    start: Position { line, column },
                    end: Position { line, column },
                }),
                message: msg,
                code: Some(META.name.to_string()),
                source: "svelte",
            });
        }
    }

    // Check <style> block.
    for (tag_start, lang) in style_scan(source) {
        let actual_opt: Option<String> = if lang.is_empty() {
            None
        } else {
            Some(lang.to_lowercase())
        };
        let allowed_lc: Vec<Option<String>> = allowed_style
            .iter()
            .map(|l| l.as_ref().map(|s| s.to_lowercase()))
            .collect();
        if !allowed_lc.contains(&actual_opt) {
            let msg = format!(
                "The lang attribute of the <style> block should be {}.",
                pretty_print_langs(&allowed_style)
            );
            let (line, column) = li.position(tag_start);
            out.push(Diagnostic {
                file: file.to_path_buf(),
                severity: to_dsev(severity),
                range: Some(Range {
                    start: Position { line, column },
                    end: Position { line, column },
                }),
                message: msg,
                code: Some(META.name.to_string()),
                source: "svelte",
            });
        }
    }

    out
}

/// Yield `(tag_start_byte, lang)` for every `<style …>` element. `lang` is the
/// value of a `lang` attribute, or `""` (plain CSS) when absent. Mirrors the
/// scanner in `valid_style_parse.rs`.
///
/// Only used by the native-only source-scan fallback, so gated alongside it.
#[cfg(feature = "native")]
fn style_scan(source: &str) -> Vec<(u32, String)> {
    let bytes = source.as_bytes();
    let mut out = Vec::new();
    let mut i = 0;
    while i + 6 <= bytes.len() {
        if &bytes[i..i + 6] != b"<style" {
            i += 1;
            continue;
        }
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
        let lang =
            crate::svelte_scan::attr_value(&source[i + 6..tag_end], "lang").unwrap_or_default();
        out.push((i as u32, lang));
        i = tag_end + 1;
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn parse_lang_option_forms() {
        // Absent / explicit null → `[None]` (means "omitted is required").
        assert_eq!(parse_lang_option(None, "style"), vec![None]);
        assert_eq!(parse_lang_option(Some(&json!({})), "style"), vec![None]);
        assert_eq!(
            parse_lang_option(Some(&json!({ "style": null })), "style"),
            vec![None]
        );
        // Single string.
        assert_eq!(
            parse_lang_option(Some(&json!({ "style": "scss" })), "style"),
            vec![Some("scss".to_string())]
        );
        // Array with a mix of null + strings.
        assert_eq!(
            parse_lang_option(Some(&json!({ "script": [null, "ts"] })), "script"),
            vec![None, Some("ts".to_string())]
        );
        // A different key is unaffected.
        assert_eq!(
            parse_lang_option(Some(&json!({ "style": "scss" })), "script"),
            vec![None]
        );
    }

    #[test]
    fn pretty_print_langs_messages() {
        assert_eq!(pretty_print_langs(&[None]), "omitted");
        assert_eq!(pretty_print_langs(&[Some("ts".to_string())]), "\"ts\"");
        assert_eq!(
            pretty_print_langs(&[None, Some("ts".to_string())]),
            "either omitted or \"ts\""
        );
        assert_eq!(
            pretty_print_langs(&[Some("ts".to_string()), Some("js".to_string())]),
            "one of \"ts\", \"js\""
        );
    }
}
