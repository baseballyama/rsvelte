//! `svelte/require-store-callbacks-use-set-param` — the start callback passed to
//! `readable` / `writable` must name its first parameter `set`. Port of the
//! eslint-plugin-svelte rule (the `set`-rename is a suggestion the oracle
//! ignores; detection only). Runs over the script ESTree program via the
//! [`ScriptRule`] hook.

use serde_json::Value;

use crate::context::LintContext;
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::rules::store_refs::{collect_store_creators, is_function_expr};
use crate::script::{ScriptKind, ScriptRule, node_start, node_type, walk_js};

static META: RuleMeta = RuleMeta {
    name: "svelte/require-store-callbacks-use-set-param",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Require `readable`/`writable` store callbacks to use a `set` parameter",
    options_schema: None,
};

const MESSAGE: &str = "Store callbacks must use `set` param.";

#[derive(Default)]
pub struct RequireStoreCallbacksUseSetParam;

impl ScriptRule for RequireStoreCallbacksUseSetParam {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &Value, _kind: ScriptKind) {
        let creators = collect_store_creators(program);
        if creators.is_empty() {
            return;
        }
        let mut reports: Vec<u32> = Vec::new();
        walk_js(program, |node, _| {
            if node_type(node) != Some("CallExpression") {
                return;
            }
            let Some(callee) = node.get("callee") else {
                return;
            };
            // Only `readable` / `writable` take a `set`-style start callback.
            match creators.creator_of(callee) {
                Some("readable") | Some("writable") => {}
                _ => return,
            }
            let Some(args) = node.get("arguments").and_then(Value::as_array) else {
                return;
            };
            let Some(fn_arg) = args.get(1) else {
                return;
            };
            if !is_function_expr(fn_arg) {
                return;
            }
            let param0 = fn_arg
                .get("params")
                .and_then(Value::as_array)
                .and_then(|p| p.first());
            // Report when there is no first param, or it is an Identifier not
            // named `set`. A destructuring/other pattern param is left alone.
            let bad = match param0 {
                None => true,
                Some(p) if node_type(p) == Some("Identifier") => {
                    p.get("name").and_then(Value::as_str) != Some("set")
                }
                Some(_) => false,
            };
            if bad && let Some(start) = node_start(fn_arg) {
                reports.push(start);
            }
        });
        reports.sort_unstable();
        reports.dedup();
        for start in reports {
            ctx.report(start, start, MESSAGE);
        }
    }
}
