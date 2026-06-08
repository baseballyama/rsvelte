//! `svelte/no-store-async` — disallow passing an `async` function to a
//! `svelte/store` creator (`writable` / `readable` / `derived`). An async start
//! function breaks the store's auto-unsubscribe behaviour. Port of the
//! eslint-plugin-svelte rule, over the script ESTree program via the
//! [`ScriptRule`] hook (so it also lints `*.svelte.js` / `*.js` module files).
//!
//! The store creators are resolved from their `svelte/store` import — including
//! aliases (`import { writable as w }`) and namespace imports
//! (`import * as stores from 'svelte/store'` → `stores.writable(...)`). The
//! finding is reported at the offending function (covering its `async` keyword),
//! matching upstream's `start .. start + 5` location.

use serde_json::Value;

use crate::context::LintContext;
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::{ScriptKind, ScriptRule, node_start, node_type, walk_js};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-store-async",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Error,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow async functions passed to svelte stores",
    options_schema: None,
};

const STORE_CREATORS: &[&str] = &["writable", "readable", "derived"];

const MESSAGE: &str = "Do not pass async functions to svelte stores.";

fn ident_name(node: &Value) -> Option<&str> {
    if node_type(node) == Some("Identifier") {
        node.get("name").and_then(Value::as_str)
    } else {
        None
    }
}

fn is_async_function(node: &Value) -> bool {
    matches!(
        node_type(node),
        Some("ArrowFunctionExpression") | Some("FunctionExpression")
    ) && node.get("async").and_then(Value::as_bool) == Some(true)
}

#[derive(Default)]
pub struct NoStoreAsync;

impl ScriptRule for NoStoreAsync {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &Value, _kind: ScriptKind) {
        // Resolve `svelte/store` imports: local names bound to a store creator,
        // and any namespace import alias.
        let mut direct: Vec<String> = Vec::new(); // local names of writable/readable/derived
        let mut namespaces: Vec<String> = Vec::new(); // `import * as X`

        walk_js(program, |node, _| {
            if node_type(node) != Some("ImportDeclaration") {
                return;
            }
            if node
                .get("source")
                .and_then(|s| s.get("value"))
                .and_then(Value::as_str)
                != Some("svelte/store")
            {
                return;
            }
            let Some(specs) = node.get("specifiers").and_then(Value::as_array) else {
                return;
            };
            for spec in specs {
                match node_type(spec) {
                    Some("ImportSpecifier") => {
                        let imported = spec
                            .get("imported")
                            .and_then(ident_name)
                            // string-literal imported names (`import { "x" as y }`)
                            .or_else(|| {
                                spec.get("imported")
                                    .and_then(|i| i.get("value"))
                                    .and_then(Value::as_str)
                            });
                        if let Some(imported) = imported
                            && STORE_CREATORS.contains(&imported)
                            && let Some(local) = spec.get("local").and_then(ident_name)
                        {
                            direct.push(local.to_string());
                        }
                    }
                    Some("ImportNamespaceSpecifier") => {
                        if let Some(local) = spec.get("local").and_then(ident_name) {
                            namespaces.push(local.to_string());
                        }
                    }
                    _ => {}
                }
            }
        });

        if direct.is_empty() && namespaces.is_empty() {
            return;
        }

        // Find store-creator calls and report an async second argument.
        let mut reports: Vec<u32> = Vec::new();
        walk_js(program, |node, _| {
            if node_type(node) != Some("CallExpression") {
                return;
            }
            let Some(callee) = node.get("callee") else {
                return;
            };
            let is_creator = match node_type(callee) {
                Some("Identifier") => {
                    ident_name(callee).is_some_and(|n| direct.iter().any(|d| d == n))
                }
                Some("MemberExpression") => {
                    callee.get("computed").and_then(Value::as_bool) != Some(true)
                        && callee
                            .get("object")
                            .and_then(ident_name)
                            .is_some_and(|o| namespaces.iter().any(|n| n == o))
                        && callee
                            .get("property")
                            .and_then(ident_name)
                            .is_some_and(|p| STORE_CREATORS.contains(&p))
                }
                _ => false,
            };
            if !is_creator {
                return;
            }
            let Some(args) = node.get("arguments").and_then(Value::as_array) else {
                return;
            };
            if let Some(fn_arg) = args.get(1)
                && is_async_function(fn_arg)
                && let Some(start) = node_start(fn_arg)
            {
                reports.push(start);
            }
        });

        reports.sort_unstable();
        reports.dedup();
        for start in reports {
            // Upstream reports a 5-wide span starting at the function (its
            // `async` keyword); only the start column is asserted.
            ctx.report(start, start + 5, MESSAGE);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn detects_async_arrow_and_function() {
        assert!(is_async_function(
            &json!({ "type": "ArrowFunctionExpression", "async": true })
        ));
        assert!(is_async_function(
            &json!({ "type": "FunctionExpression", "async": true })
        ));
        assert!(!is_async_function(
            &json!({ "type": "ArrowFunctionExpression", "async": false })
        ));
        assert!(!is_async_function(
            &json!({ "type": "Identifier", "name": "f" })
        ));
    }
}
