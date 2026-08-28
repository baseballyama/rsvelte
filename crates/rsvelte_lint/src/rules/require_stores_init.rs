//! `svelte/require-stores-init`.
//!
//! `svelte/require-stores-init` — require an initial value when creating a
//! `svelte/store` (`writable`/`readable` need ≥1 arg, `derived` needs ≥3). Port
//! of the eslint-plugin-svelte rule. Creator calls are resolved with the shared
//! reference tracker (aliases, namespace members, shadows, template calls);
//! components run once in `check_root`, standalone modules in the script pass.

use serde_json::Value;

use rsvelte_core::ast::template::Root;

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::rules::store_refs::{
    RefTracker, component_tracker, handled_by_template_pass, module_is_ts, module_tracker,
    store_creator_calls,
};
use crate::script::{ProgramView, ScriptKind, ScriptRule, node_end, node_start, node_type};

static META: RuleMeta = RuleMeta {
    name: "svelte/require-stores-init",
    category: RuleCategory::Style,
    fixable: Fixable::No,
    default_severity: Severity::Off,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Require an initial value when creating a store",
    options_schema: None,
};

const MESSAGE: &str = "Always set a default value for svelte stores.";

fn run(ctx: &mut LintContext, tracker: &RefTracker<'_>) {
    let mut reports: Vec<(u32, u32)> = Vec::new();
    for (call, name) in store_creator_calls(tracker, &["writable", "readable", "derived"]) {
        let min_args = match name {
            "writable" | "readable" => 1,
            "derived" => 3,
            _ => 0,
        };
        let args = call.get("arguments").and_then(Value::as_array);
        let len = args.map_or(0, std::vec::Vec::len);
        let has_spread =
            args.is_some_and(|a| a.iter().any(|x| node_type(x) == Some("SpreadElement")));
        if len >= min_args || has_spread {
            continue;
        }
        // Upstream reports `node` — the whole creator call.
        if let (Some(start), Some(end)) = (node_start(call), node_end(call)) {
            reports.push((start, end));
        }
    }
    reports.sort_unstable();
    reports.dedup();
    for (start, end) in reports {
        ctx.report(start, end, MESSAGE);
    }
}

#[derive(Default)]
pub struct RequireStoresInit;

impl ScriptRule for RequireStoresInit {
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

impl Rule for RequireStoresInit {
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
