//! `svelte/valid-prop-names-in-kit-pages` — disallow invalid prop names in
//! `SvelteKit` route components (`+page.svelte`, `+layout.svelte`,
//! `+error.svelte`).
//!
//! The rule is filename-gated: it only fires on `SvelteKit` route files. In
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
use crate::rules::kit_routes;
use crate::script::{ProgramView, ScriptKind, ScriptRule, node_end, node_start, node_type};

static META: RuleMeta = RuleMeta {
    name: "svelte/valid-prop-names-in-kit-pages",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Error,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow invalid props in SvelteKit route components",
    options_schema: None,
};

const MESSAGE: &str = "disallow invalid props in SvelteKit route components.";

const PAGE_PROP_NAMES: [&str; 4] = ["data", "form", "params", "snapshot"];
const LAYOUT_PROP_NAMES: [&str; 5] = ["data", "form", "params", "snapshot", "children"];
const ERROR_PROP_NAMES: [&str; 1] = ["error"];
/// The Svelte 3/4 `export let` branch keeps its own list, and upstream applies
/// it regardless of the project's Svelte version.
const LEGACY_PAGE_PROP_NAMES: [&str; 5] = ["data", "form", "params", "snapshot", "errors"];

/// Allowed `$props()` destructuring keys for each `SvelteKit` route file type
/// (Svelte 5 only). `None` when the file is not a route file of this project
/// (see [`kit_routes::route_file_type`]).
fn allowed_prop_names(ctx: &LintContext) -> Option<&'static [&'static str]> {
    match kit_routes::route_file_type(ctx)? {
        "+layout.svelte" => Some(&LAYOUT_PROP_NAMES),
        "+error.svelte" => Some(&ERROR_PROP_NAMES),
        _ => Some(&PAGE_PROP_NAMES),
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

/// `checkProp` — flag every `ObjectPattern` key outside `expected`. A
/// non-pattern `id` is ignored.
fn check_prop(id: &Value, expected: &[&str], reports: &mut Vec<(u32, u32)>) {
    if node_type(id) != Some("ObjectPattern") {
        return;
    }
    let Some(properties) = id.get("properties").and_then(Value::as_array) else {
        return;
    };
    for prop in properties {
        if node_type(prop) != Some("Property") {
            continue;
        }
        let Some(key) = prop
            .get("key")
            .filter(|k| node_type(k) == Some("Identifier"))
        else {
            continue;
        };
        let Some(name) = key.get("name").and_then(Value::as_str) else {
            continue;
        };
        if !expected.contains(&name)
            && let (Some(s), Some(e)) = (node_start(key), node_end(key))
        {
            reports.push((s, e));
        }
    }
}

/// `ExportNamedDeclaration > VariableDeclaration > VariableDeclarator`.
fn is_exported_declarator(ancestors: &[&Value]) -> bool {
    let len = ancestors.len();
    len >= 2
        && node_type(ancestors[len - 1]) == Some("VariableDeclaration")
        && node_type(ancestors[len - 2]) == Some("ExportNamedDeclaration")
}

#[derive(Default)]
pub struct ValidPropNamesInKitPages;

impl ScriptRule for ValidPropNamesInKitPages {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &ProgramView<'_>, kind: ScriptKind) {
        // Only inspect the instance script (not the module script).
        if kind != ScriptKind::Instance {
            return;
        }

        let Some(allowed) = allowed_prop_names(ctx) else {
            // Not a recognized SvelteKit route file, or not under src/routes — no-op.
            return;
        };

        // Collect (start, end) of invalid prop-key identifiers.
        let mut reports: Vec<(u32, u32)> = Vec::new();

        program.walk(|node, ancestors| {
            if node_type(node) != Some("VariableDeclarator") {
                return;
            }
            // Svelte 3/4: `export let …`. Upstream's selector has no version
            // guard, so it fires in a Svelte 5 project too.
            if is_exported_declarator(ancestors) {
                match node.get("id") {
                    Some(id) if node_type(id) == Some("Identifier") => {
                        let name = id.get("name").and_then(Value::as_str).unwrap_or_default();
                        if !LEGACY_PAGE_PROP_NAMES.contains(&name)
                            && let (Some(s), Some(e)) = (node_start(node), node_end(node))
                        {
                            reports.push((s, e));
                        }
                    }
                    Some(id) => check_prop(id, &LEGACY_PAGE_PROP_NAMES, &mut reports),
                    None => {}
                }
            }
            // Svelte 5: `let { … } = $props()`.
            if is_props_declarator(node)
                && let Some(id) = node.get("id")
            {
                check_prop(id, allowed, &mut reports);
            }
        });

        reports.sort_unstable();
        for (start, end) in reports {
            ctx.report(start, end, MESSAGE);
        }
    }
}
