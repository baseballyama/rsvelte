//! `svelte/no-store-async`.
//!
//! `svelte/no-store-async` — disallow passing an `async` function to a
//! `svelte/store` creator (`writable` / `readable` / `derived`). An async start
//! function breaks the store's auto-unsubscribe behaviour. Port of the
//! eslint-plugin-svelte rule.
//!
//! Creator calls are resolved with the shared reference tracker
//! ([`store_refs`](crate::rules::store_refs)): import aliases, const aliases,
//! later assignments, namespace members (incl. literal computed keys), local
//! shadows and template-expression calls all behave like upstream's
//! `extractStoreReferences`. Components are handled once per file in
//! `check_root`; the `ScriptRule` pass covers standalone `.svelte.(js|ts)`
//! modules.

use serde_json::Value;

use rsvelte_core::ast::template::Root;

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::rules::store_refs::{
    RefTracker, component_tracker, handled_by_template_pass, module_is_ts, module_tracker,
    store_creator_calls,
};
use crate::script::{ProgramView, ScriptKind, ScriptRule, node_start, node_type};

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

const MESSAGE: &str = "Do not pass async functions to svelte stores.";

fn is_async_function(node: &Value) -> bool {
    matches!(
        node_type(node),
        Some("ArrowFunctionExpression" | "FunctionExpression")
    ) && node.get("async").and_then(Value::as_bool) == Some(true)
}

fn run(ctx: &mut LintContext, tracker: &RefTracker<'_>) {
    let mut reports: Vec<u32> = Vec::new();
    for (call, _name) in store_creator_calls(tracker, &["writable", "readable", "derived"]) {
        let Some(args) = call.get("arguments").and_then(Value::as_array) else {
            continue;
        };
        if let Some(fn_arg) = args.get(1)
            && is_async_function(fn_arg)
            && let Some(start) = node_start(fn_arg)
        {
            reports.push(start);
        }
    }
    reports.sort_unstable();
    reports.dedup();
    for start in reports {
        // Upstream reports a 5-wide span starting at the function (its
        // `async` keyword); only the start column is asserted.
        ctx.report(start, start + 5, MESSAGE);
    }
}

#[derive(Default)]
pub struct NoStoreAsync;

impl ScriptRule for NoStoreAsync {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &ProgramView<'_>, _kind: ScriptKind) {
        if handled_by_template_pass(ctx.filename()) {
            return;
        }
        let tracker = module_tracker(ctx.source(), program.value(), module_is_ts(ctx.filename()));
        run(ctx, &tracker);
    }
}

impl Rule for NoStoreAsync {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_root(&self, ctx: &mut LintContext, root: &Root) {
        let root_json = ctx.root_json(root);
        if root_json.is_null() {
            return;
        }
        let tracker = component_tracker(ctx.source(), root, &root_json);
        run(ctx, &tracker);
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
