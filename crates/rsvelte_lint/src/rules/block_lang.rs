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

use rsvelte_core::ast::css::StyleSheet;
use rsvelte_core::ast::template::{
    AttributeNode, AttributeValue, AttributeValuePart, Root, Script,
};
use serde_json::Value;

use crate::context::LintContext;
use crate::diagnostic::{Fix, Suggestion, TextEdit};
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

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
