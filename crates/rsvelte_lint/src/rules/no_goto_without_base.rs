//! `svelte/no-goto-without-base` — disallow calling `SvelteKit`'s `goto()` with a
//! URL that isn't prefixed with the configured `base` path.
//!
//! Port of the eslint-plugin-svelte rule (deprecated upstream in favour of
//! `no-navigation-without-resolve`, but still a distinct rule with its own
//! fixtures).
//!
//! Upstream's single `Program` handler sees the whole component — both
//! `<script>` blocks and every template expression share one scope tree — so
//! this runs as a `check_root` rule over the serialized component and falls back
//! to `check_program` only for standalone JS/TS modules, which have no root.
//! `goto` and `base` are matched by resolving each occurrence against that scope
//! tree (see the `kit_nav` module), not by name, so a parameter named `goto` is not a
//! navigation call and a parameter named `base` is not the base path.

use rsvelte_core::ast::template::Root;
use serde_json::Value;

use crate::context::LintContext;
use crate::engine::{SourceKind, classify_source};
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::rules::kit_nav::{NavKind, PrefixVar, ScopeIndex, is_base_reference, nav_call_kind};
use crate::script::{
    ProgramView, ScriptKind, ScriptRule, node_end, node_start, node_type, walk_js,
};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-goto-without-base",
    category: RuleCategory::Style,
    fixable: Fixable::No,
    default_severity: Severity::Off,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow using `goto()` without the base path",
    options_schema: None,
};

const MESSAGE: &str = "Found a goto() call with a url that isn't prefixed with the base path.";

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

/// Whether `goto()`'s first argument counts as base-prefixed.
///
/// Upstream's `checkBinaryExpression` / `checkTemplateLiteral` require the
/// prefix to be an `Identifier` *node* that is in `basePathNames`, so a
/// namespace member (`paths.base + '/x'`) is reported however the set was
/// built — which is why `is_base_reference` is called with `namespace_member:
/// false` here and with `true` in `no-navigation-without-base`.
fn first_arg_is_base_prefixed(idx: &ScopeIndex<'_>, path: &Value) -> bool {
    match node_type(path) {
        // `basePathNames` holds identifier occurrences, so only a direct
        // `base` reference on the left counts.
        Some("BinaryExpression") => path
            .get("left")
            .filter(|l| node_type(l) == Some("Identifier"))
            .is_some_and(|l| is_base_reference(idx, &PrefixVar::Ident(l), false)),
        Some("Literal") => is_scheme_prefixed(&literal_value_string(path)),
        Some("TemplateLiteral") => crate::rules::kit_nav::template_first_part(path)
            .filter(|part| node_type(part) == Some("Identifier"))
            .is_some_and(|part| is_base_reference(idx, &PrefixVar::Ident(part), false)),
        _ => false,
    }
}

#[derive(Default)]
pub struct NoGotoWithoutBase;

impl NoGotoWithoutBase {
    fn run(ctx: &mut LintContext, json: &Value) {
        let idx = ScopeIndex::build(json);
        let mut reports: Vec<(u32, u32)> = Vec::new();
        walk_js(json, |node, _| {
            if node_type(node) != Some("CallExpression")
                || nav_call_kind(&idx, node) != Some(NavKind::Goto)
            {
                return;
            }
            let Some(path) = node
                .get("arguments")
                .and_then(Value::as_array)
                .and_then(|args| args.first())
            else {
                return;
            };
            let ok = first_arg_is_base_prefixed(&idx, path);
            // Upstream reports `loc: path.loc` — the whole first argument.
            if !ok
                && let Some(s) = node_start(path)
                && let Some(e) = node_end(path)
            {
                reports.push((s, e));
            }
        });
        reports.sort_unstable();
        for (start, end) in reports {
            ctx.report(start, end, MESSAGE);
        }
    }
}

impl Rule for NoGotoWithoutBase {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_root(&self, ctx: &mut LintContext, root: &Root) {
        let json = ctx.root_json(root);
        if json.is_null() {
            return;
        }
        Self::run(ctx, &json);
    }
}

impl ScriptRule for NoGotoWithoutBase {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &ProgramView<'_>, _kind: ScriptKind) {
        // A component is covered by `check_root`, which sees both scripts and
        // the template at once; only a standalone module needs this pass.
        if !matches!(classify_source(ctx.filename()), SourceKind::Module { .. }) {
            return;
        }
        Self::run(ctx, program.value());
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn base_import(local: &str, namespace: bool) -> Value {
        json!({
            "type": "ImportDeclaration",
            "source": { "type": "Literal", "value": "$app/paths" },
            "specifiers": [if namespace {
                json!({
                    "type": "ImportNamespaceSpecifier",
                    "local": { "type": "Identifier", "name": local }
                })
            } else {
                json!({
                    "type": "ImportSpecifier",
                    "imported": { "type": "Identifier", "name": "base" },
                    "local": { "type": "Identifier", "name": local }
                })
            }]
        })
    }

    /// `<prefix> + '/x'` as the first argument of a `goto()` call.
    fn program_with_prefix(import: Value, prefix: Value) -> Value {
        json!({ "type": "Program", "body": [import, {
            "type": "ExpressionStatement",
            "expression": {
                "type": "BinaryExpression",
                "operator": "+",
                "left": prefix,
                "right": { "type": "Literal", "value": "/x" }
            }
        }] })
    }

    #[test]
    fn named_base_import_prefixes() {
        let root = program_with_prefix(
            base_import("base", false),
            json!({ "type": "Identifier", "name": "base" }),
        );
        let idx = ScopeIndex::build(&root);
        assert!(first_arg_is_base_prefixed(
            &idx,
            &root["body"][1]["expression"]
        ));
    }

    /// `import * as paths from '$app/paths'; goto(paths.base + '/x')`.
    ///
    /// Upstream cannot be observed on this shape — `extractBasePathReferences`
    /// throws on a namespace import — but its `checkBinaryExpression` reports
    /// whenever the left operand is not an `Identifier`, so a namespace member
    /// is not a base prefix for THIS rule (unlike `no-navigation-without-base`,
    /// which resolves the member). Ungated by the corpus for that reason.
    #[test]
    fn namespace_base_member_is_not_a_prefix() {
        let root = program_with_prefix(
            base_import("paths", true),
            json!({
                "type": "MemberExpression",
                "computed": false,
                "object": { "type": "Identifier", "name": "paths" },
                "property": { "type": "Identifier", "name": "base" }
            }),
        );
        let idx = ScopeIndex::build(&root);
        assert!(!first_arg_is_base_prefixed(
            &idx,
            &root["body"][1]["expression"]
        ));
    }

    #[test]
    fn scheme_prefix() {
        assert!(is_scheme_prefixed("http://x"));
        assert!(is_scheme_prefixed("https://x"));
        assert!(is_scheme_prefixed("mailto:a@b"));
        assert!(is_scheme_prefixed("tel:+1"));
        assert!(!is_scheme_prefixed("/foo"));
        assert!(!is_scheme_prefixed("/user:42"));
    }
}
