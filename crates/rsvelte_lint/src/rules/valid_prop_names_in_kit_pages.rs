//! `svelte/valid-prop-names-in-kit-pages` — disallow invalid prop names in
//! SvelteKit route components (`+page.svelte`, `+layout.svelte`,
//! `+error.svelte`).
//!
//! The rule is filename-gated: it only fires on SvelteKit route files. In
//! Svelte 5 (runes mode) it flags `$props()` destructuring that uses prop
//! names outside the allowed set for the file type:
//!
//! - `+page.svelte`:   `data`, `form`, `params`, `snapshot`
//! - `+layout.svelte`: `data`, `form`, `params`, `snapshot`, `children`
//! - `+error.svelte`:  `error`
//!
//! Port of `eslint-plugin-svelte/src/rules/valid-prop-names-in-kit-pages.ts`.

use serde_json::Value;

use crate::context::LintContext;
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::{ScriptKind, ScriptRule, node_end, node_start, node_type, walk_js};

static META: RuleMeta = RuleMeta {
    name: "svelte/valid-prop-names-in-kit-pages",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow invalid props in SvelteKit route components",
    options_schema: None,
};

const MESSAGE: &str = "disallow invalid props in SvelteKit route components.";

/// Allowed `$props()` destructuring keys for each SvelteKit route file type
/// (Svelte 5 only).
fn allowed_prop_names(filename: &str) -> Option<&'static [&'static str]> {
    if filename == "+page.svelte" {
        Some(&["data", "form", "params", "snapshot"])
    } else if filename == "+layout.svelte" {
        Some(&["data", "form", "params", "snapshot", "children"])
    } else if filename == "+error.svelte" {
        Some(&["error"])
    } else {
        None
    }
}

/// Whether this `VariableDeclarator` is a `$props()` call:
/// `let { ... } = $props()`.
fn is_props_declarator(node: &Value) -> bool {
    node.get("init")
        .and_then(|init| {
            if node_type(init) != Some("CallExpression") {
                return None;
            }
            let callee = init.get("callee")?;
            if node_type(callee) != Some("Identifier") {
                return None;
            }
            callee.get("name").and_then(Value::as_str)
        })
        .is_some_and(|name| name == "$props")
}

#[derive(Default)]
pub struct ValidPropNamesInKitPages;

impl ScriptRule for ValidPropNamesInKitPages {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &Value, kind: ScriptKind) {
        // Only inspect the instance script (not the module script).
        if kind != ScriptKind::Instance {
            return;
        }

        let filename = ctx.filename();
        let Some(allowed) = allowed_prop_names(filename) else {
            // Not a recognized SvelteKit route file — no-op.
            return;
        };

        // Collect (start, end) of invalid prop-key identifiers.
        let mut reports: Vec<(u32, u32)> = Vec::new();

        walk_js(program, |node, _ancestors| {
            if node_type(node) != Some("VariableDeclarator") {
                return;
            }
            if !is_props_declarator(node) {
                return;
            }

            // id must be an ObjectPattern.
            let Some(id) = node.get("id") else { return };
            if node_type(id) != Some("ObjectPattern") {
                return;
            }

            let Some(properties) = id.get("properties").and_then(Value::as_array) else {
                return;
            };

            for prop in properties {
                // Only ordinary (non-rest) Property nodes with an Identifier key.
                if node_type(prop) != Some("Property") {
                    continue;
                }
                let Some(key) = prop.get("key") else { continue };
                if node_type(key) != Some("Identifier") {
                    continue;
                }
                let Some(name) = key.get("name").and_then(Value::as_str) else {
                    continue;
                };
                if allowed.contains(&name) {
                    continue;
                }
                // Flag at the key identifier.
                if let (Some(s), Some(e)) = (node_start(key), node_end(key)) {
                    reports.push((s, e));
                }
            }
        });

        for (start, end) in reports {
            ctx.report(start, end, MESSAGE);
        }
    }
}
