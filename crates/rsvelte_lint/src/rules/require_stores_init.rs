//! `svelte/require-stores-init` — require an initial value when creating a
//! `svelte/store` (`writable`/`readable` need ≥1 arg, `derived` needs ≥3). Port
//! of the eslint-plugin-svelte rule, over the script ESTree program via the
//! [`ScriptRule`] hook (so it also covers `*.svelte.js` module files).

use serde_json::Value;

use crate::context::LintContext;
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::rules::store_refs::collect_store_creators;
use crate::script::{ScriptKind, ScriptRule, node_start, node_type, walk_js};

static META: RuleMeta = RuleMeta {
    name: "svelte/require-stores-init",
    category: RuleCategory::Style,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Require an initial value when creating a store",
    options_schema: None,
};

const MESSAGE: &str = "Always set a default value for svelte stores.";

#[derive(Default)]
pub struct RequireStoresInit;

impl ScriptRule for RequireStoresInit {
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
            let Some(name) = creators.creator_of(callee) else {
                return;
            };
            let min_args = match name {
                "writable" | "readable" => 1,
                "derived" => 3,
                _ => 0,
            };
            let args = node.get("arguments").and_then(Value::as_array);
            let len = args.map(|a| a.len()).unwrap_or(0);
            let has_spread = args
                .map(|a| a.iter().any(|x| node_type(x) == Some("SpreadElement")))
                .unwrap_or(false);
            if len >= min_args || has_spread {
                return;
            }
            if let Some(start) = node_start(node) {
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
