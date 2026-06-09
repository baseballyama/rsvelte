//! `svelte/no-goto-without-base` — disallow calling SvelteKit's `goto()` with a
//! URL that isn't prefixed with the configured `base` path. Port of the
//! eslint-plugin-svelte rule (deprecated upstream in favour of
//! `no-navigation-without-resolve`, but still a distinct rule with its own
//! fixtures).
//!
//! Runs over the `<script>` ESTree program via the [`ScriptRule`] hook. `goto`
//! is matched through its `$app/navigation` import (alias aware) and `base`
//! through its `$app/paths` import. For each `goto(arg)` call the first argument
//! must be base-prefixed: a `base + '…'` binary expression, a `` `${base}…` ``
//! template literal starting with `base`, or an absolute-URL string literal
//! (`scheme:` prefix). Anything else is reported.

use std::collections::HashSet;

use serde_json::Value;

use crate::context::LintContext;
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::{ScriptKind, ScriptRule, node_start, node_type, walk_js};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-goto-without-base",
    category: RuleCategory::Style,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow using `goto()` without the base path",
    options_schema: None,
};

const MESSAGE: &str = "Found a goto() call with a url that isn't prefixed with the base path.";

/// Collect the local names that an import from `module` binds for the given
/// exported `name` (alias aware: `import { base as b }` → `b`).
fn import_locals(program: &Value, module: &str, name: &str, out: &mut HashSet<String>) {
    walk_js(program, |node, _| {
        if node_type(node) != Some("ImportDeclaration") {
            return;
        }
        if node
            .get("source")
            .and_then(|s| s.get("value"))
            .and_then(Value::as_str)
            != Some(module)
        {
            return;
        }
        let Some(specs) = node.get("specifiers").and_then(Value::as_array) else {
            return;
        };
        for spec in specs {
            if node_type(spec) != Some("ImportSpecifier") {
                continue;
            }
            let imported = spec
                .get("imported")
                .and_then(|i| i.get("name"))
                .and_then(Value::as_str);
            if imported == Some(name)
                && let Some(local) = spec
                    .get("local")
                    .and_then(|l| l.get("name"))
                    .and_then(Value::as_str)
            {
                out.insert(local.to_string());
            }
        }
    });
}

/// A string literal value counts as base-prefixed only when it is an absolute
/// URL — `^[+a-z]*:` (optional scheme chars then a colon), case-insensitive.
fn is_scheme_prefixed(s: &str) -> bool {
    let bytes = s.as_bytes();
    let mut i = 0;
    while i < bytes.len() && (bytes[i] == b'+' || bytes[i].is_ascii_alphabetic()) {
        i += 1;
    }
    bytes.get(i) == Some(&b':')
}

/// A literal's value, stringified the way upstream does (`value?.toString()`).
fn literal_value_string(lit: &Value) -> String {
    match lit.get("value") {
        Some(Value::String(s)) => s.clone(),
        Some(Value::Number(n)) => n.to_string(),
        Some(Value::Bool(b)) => b.to_string(),
        _ => String::new(),
    }
}

/// The starting identifier name of a template literal — the first non-empty
/// part, if it is an interpolated identifier. Mirrors upstream's
/// `extractStartingIdentifier`.
fn template_starting_identifier(tpl: &Value) -> Option<String> {
    let quasis = tpl.get("quasis").and_then(Value::as_array)?;
    let exprs = tpl.get("expressions").and_then(Value::as_array)?;
    // (start, is_quasi, raw-empty / identifier-name) parts sorted by position.
    let mut parts: Vec<(u64, bool, Option<String>)> = Vec::new();
    for q in quasis {
        let start = q.get("start").and_then(Value::as_u64).unwrap_or(0);
        let raw_empty = q
            .get("value")
            .and_then(|v| v.get("raw"))
            .and_then(Value::as_str)
            .map(|r| r.is_empty())
            .unwrap_or(false);
        // store identifier-name = None for quasis; raw_empty flagged via bool
        parts.push((
            start,
            true,
            if raw_empty { Some(String::new()) } else { None },
        ));
    }
    for e in exprs {
        let start = e.get("start").and_then(Value::as_u64).unwrap_or(0);
        let ident = if node_type(e) == Some("Identifier") {
            e.get("name").and_then(Value::as_str).map(str::to_string)
        } else {
            None
        };
        parts.push((start, false, ident));
    }
    parts.sort_by_key(|p| p.0);
    for (_start, is_quasi, payload) in parts {
        if is_quasi {
            // Empty quasi (payload == Some("")) → skip; non-empty → not an ident.
            match payload {
                Some(ref s) if s.is_empty() => continue,
                _ => return None,
            }
        } else {
            // Expression part: identifier name or None (non-identifier).
            return payload;
        }
    }
    None
}

#[derive(Default)]
pub struct NoGotoWithoutBase;

impl ScriptRule for NoGotoWithoutBase {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &Value, _kind: ScriptKind) {
        let mut goto_names: HashSet<String> = HashSet::new();
        import_locals(program, "$app/navigation", "goto", &mut goto_names);
        if goto_names.is_empty() {
            return;
        }
        let mut base_names: HashSet<String> = HashSet::new();
        import_locals(program, "$app/paths", "base", &mut base_names);

        let mut reports: Vec<u32> = Vec::new();
        walk_js(program, |node, _| {
            if node_type(node) != Some("CallExpression") {
                return;
            }
            let is_goto = node
                .get("callee")
                .filter(|c| node_type(c) == Some("Identifier"))
                .and_then(|c| c.get("name"))
                .and_then(Value::as_str)
                .is_some_and(|n| goto_names.contains(n));
            if !is_goto {
                return;
            }
            let Some(args) = node.get("arguments").and_then(Value::as_array) else {
                return;
            };
            let Some(path) = args.first() else { return };
            let ok = match node_type(path) {
                Some("BinaryExpression") => path
                    .get("left")
                    .filter(|l| node_type(l) == Some("Identifier"))
                    .and_then(|l| l.get("name"))
                    .and_then(Value::as_str)
                    .is_some_and(|n| base_names.contains(n)),
                Some("Literal") => is_scheme_prefixed(&literal_value_string(path)),
                Some("TemplateLiteral") => {
                    template_starting_identifier(path).is_some_and(|n| base_names.contains(&n))
                }
                _ => false,
            };
            if !ok && let Some(s) = node_start(path) {
                reports.push(s);
            }
        });

        for start in reports {
            ctx.report(start, start, MESSAGE);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn scheme_prefix() {
        assert!(is_scheme_prefixed("http://x"));
        assert!(is_scheme_prefixed("https://x"));
        assert!(is_scheme_prefixed("mailto:a@b"));
        assert!(is_scheme_prefixed("tel:+1"));
        assert!(!is_scheme_prefixed("/foo"));
        assert!(!is_scheme_prefixed("/user:42"));
    }

    #[test]
    fn template_start_ident() {
        // `${base}/foo/` → leading empty quasi, then base identifier.
        let tpl = json!({
            "type": "TemplateLiteral",
            "quasis": [
                { "type": "TemplateElement", "start": 1, "value": { "raw": "" } },
                { "type": "TemplateElement", "start": 8, "value": { "raw": "/foo/" } }
            ],
            "expressions": [ { "type": "Identifier", "start": 3, "name": "base" } ]
        });
        assert_eq!(template_starting_identifier(&tpl).as_deref(), Some("base"));

        // `/foo/${base}` → leading non-empty quasi → None.
        let tpl2 = json!({
            "type": "TemplateLiteral",
            "quasis": [
                { "type": "TemplateElement", "start": 1, "value": { "raw": "/foo/" } },
                { "type": "TemplateElement", "start": 12, "value": { "raw": "" } }
            ],
            "expressions": [ { "type": "Identifier", "start": 8, "name": "base" } ]
        });
        assert_eq!(template_starting_identifier(&tpl2), None);
    }
}
