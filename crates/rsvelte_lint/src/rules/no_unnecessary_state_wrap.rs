//! `svelte/no-unnecessary-state-wrap` — disallow wrapping an already-reactive
//! class instance in `$state(...)`. The reactive classes from `svelte/reactivity`
//! (`SvelteSet`, `SvelteMap`, `SvelteURL`, `SvelteURLSearchParams`, `SvelteDate`,
//! `MediaQuery`) are deeply reactive on their own, so `$state(new SvelteSet())`
//! is redundant. Port of the eslint-plugin-svelte rule.
//!
//! Runs over the `<script>` ESTree program via the [`ScriptRule`] hook. Built-in
//! reactive classes are matched through the `svelte/reactivity` import (alias
//! aware — `import { SvelteSet as S }` then `$state(new S())` reports
//! `SvelteSet`); the `additionalReactiveClasses` option matches by callee name
//! directly. With `allowReassign`, a wrapped binding that is later reassigned
//! (including via a two-way `bind:`) is left alone. The upstream fix is
//! suggestion-only, so the rule reports without an autofix.

use std::collections::{HashMap, HashSet};

use serde_json::Value;

use crate::context::LintContext;
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::{ScriptKind, ScriptRule, node_start, node_type, walk_js};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-unnecessary-state-wrap",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: true,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow unnecessary `$state` wrapping of reactive classes",
    options_schema: Some(
        r#"{ "type": "object", "properties": {
            "additionalReactiveClasses": { "type": "array", "items": { "type": "string" }, "uniqueItems": true },
            "allowReassign": { "type": "boolean" }
        }, "additionalProperties": false }"#,
    ),
};

const REACTIVE_CLASSES: &[&str] = &[
    "SvelteSet",
    "SvelteMap",
    "SvelteURL",
    "SvelteURLSearchParams",
    "SvelteDate",
    "MediaQuery",
];

/// The callee Identifier name of a `new X()` / `X()` argument, if any.
fn ctor_callee_name(arg: &Value) -> Option<&str> {
    match node_type(arg) {
        Some("NewExpression") | Some("CallExpression") => arg
            .get("callee")
            .filter(|c| node_type(c) == Some("Identifier"))
            .and_then(|c| c.get("name"))
            .and_then(Value::as_str),
        _ => None,
    }
}

/// Whether `node` is a `$state(...)` call.
fn is_state_call(node: &Value) -> bool {
    node_type(node) == Some("CallExpression")
        && node
            .get("callee")
            .filter(|c| node_type(c) == Some("Identifier"))
            .and_then(|c| c.get("name"))
            .and_then(Value::as_str)
            == Some("$state")
}

#[derive(Default)]
pub struct NoUnnecessaryStateWrap;

impl ScriptRule for NoUnnecessaryStateWrap {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &Value, _kind: ScriptKind) {
        let opts = ctx.option0();
        let additional: HashSet<String> = opts
            .and_then(|o| o.get("additionalReactiveClasses"))
            .and_then(Value::as_array)
            .map(|a| {
                a.iter()
                    .filter_map(|v| v.as_str().map(str::to_string))
                    .collect()
            })
            .unwrap_or_default();
        let allow_reassign = opts
            .and_then(|o| o.get("allowReassign"))
            .and_then(Value::as_bool)
            .unwrap_or(false);

        // `svelte/reactivity` imports: local name → exported (canonical) name,
        // restricted to the known reactive classes.
        let mut import_map: HashMap<String, String> = HashMap::new();
        walk_js(program, |node, _| {
            if node_type(node) != Some("ImportDeclaration") {
                return;
            }
            if node
                .get("source")
                .and_then(|s| s.get("value"))
                .and_then(Value::as_str)
                != Some("svelte/reactivity")
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
                let local = spec
                    .get("local")
                    .and_then(|l| l.get("name"))
                    .and_then(Value::as_str);
                if let (Some(imported), Some(local)) = (imported, local)
                    && REACTIVE_CLASSES.contains(&imported)
                {
                    import_map.insert(local.to_string(), imported.to_string());
                }
            }
        });

        // Reassignment set (only needed when `allowReassign` is on). Covers
        // `x = ...` and `bind:` getter/setter writes via the analyzed scope, plus
        // shorthand `bind:x` two-way bindings detected from the source.
        let reassigned: HashSet<String> = if allow_reassign {
            let mut set: HashSet<String> = crate::scope::analyze_scope(ctx.source())
                .map(|a| {
                    a.root
                        .bindings
                        .iter()
                        .filter(|b| b.reassigned)
                        .map(|b| b.name.clone())
                        .collect()
                })
                .unwrap_or_default();
            collect_shorthand_bind_names(ctx.source(), &mut set);
            set
        } else {
            HashSet::new()
        };

        // Each `$state(...)` must sit in a `const/let x = $state(...)` declarator
        // (VariableDeclarator with an Identifier id); associate the wrap with that
        // binding so the allow-reassign skip can apply.
        let mut valid_reports: Vec<(u32, String)> = Vec::new();
        walk_js(program, |node, _| {
            if node_type(node) != Some("VariableDeclarator") {
                return;
            }
            let id_name = node
                .get("id")
                .filter(|i| node_type(i) == Some("Identifier"))
                .and_then(|i| i.get("name"))
                .and_then(Value::as_str);
            let Some(id_name) = id_name else { return };
            let Some(init) = node.get("init").filter(|i| !i.is_null()) else {
                return;
            };
            if !is_state_call(init) {
                return;
            }
            if allow_reassign && reassigned.contains(id_name) {
                return;
            }
            let Some(args) = init.get("arguments").and_then(Value::as_array) else {
                return;
            };
            for arg in args {
                let Some(name) = ctor_callee_name(arg) else {
                    continue;
                };
                let class_name = if let Some(canonical) = import_map.get(name) {
                    canonical.clone()
                } else if additional.contains(name) {
                    name.to_string()
                } else {
                    continue;
                };
                if let Some(s) = node_start(arg) {
                    valid_reports.push((s, class_name));
                }
            }
        });

        for (start, class_name) in valid_reports {
            ctx.report(
                start,
                start,
                format!("{class_name} is already reactive, $state wrapping is unnecessary."),
            );
        }
    }
}

/// Add variables targeted by a shorthand two-way binding (`bind:name` with no
/// `={...}`) to `set`. These are write references upstream's `isReassigned` sees
/// but that don't appear as an assignment in the analyzed scope.
fn collect_shorthand_bind_names(source: &str, set: &mut HashSet<String>) {
    let bytes = source.as_bytes();
    let needle = b"bind:";
    let mut i = 0;
    while i + needle.len() < bytes.len() {
        if &bytes[i..i + needle.len()] == needle {
            let mut j = i + needle.len();
            let start = j;
            while j < bytes.len() {
                let c = bytes[j];
                if c == b'_' || c == b'$' || c.is_ascii_alphanumeric() {
                    j += 1;
                } else {
                    break;
                }
            }
            if j > start {
                let name = &source[start..j];
                // Shorthand only: not followed by `=` (which would be a
                // `bind:name={...}` getter/setter form already covered by scope).
                let next = bytes.get(j).copied();
                if next != Some(b'=') {
                    set.insert(name.to_string());
                }
            }
            i = j;
        } else {
            i += 1;
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn ctor_name_detection() {
        assert_eq!(
            ctor_callee_name(
                &json!({ "type": "NewExpression", "callee": { "type": "Identifier", "name": "SvelteSet" } })
            ),
            Some("SvelteSet")
        );
        assert_eq!(
            ctor_callee_name(
                &json!({ "type": "CallExpression", "callee": { "type": "Identifier", "name": "foo" } })
            ),
            Some("foo")
        );
        assert_eq!(
            ctor_callee_name(&json!({ "type": "Literal", "value": 42 })),
            None
        );
    }

    #[test]
    fn shorthand_bind_scan() {
        let mut set = HashSet::new();
        collect_shorthand_bind_names("<Bug3 bind:svelteSet />", &mut set);
        assert!(set.contains("svelteSet"));

        // Getter/setter form is not a shorthand → not added here.
        let mut set2 = HashSet::new();
        collect_shorthand_bind_names("<Bug3 bind:svelteSet={x} />", &mut set2);
        assert!(!set2.contains("svelteSet"));
    }
}
