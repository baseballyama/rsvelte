//! `svelte/no-ignored-unsubscribe` — disallow ignoring the unsubscribe function
//! returned by a store's `.subscribe()` call.
//!
//! Port of the eslint-plugin-svelte rule — the esquery selector
//! `ExpressionStatement > CallExpression > MemberExpression.callee[property.name='subscribe']`.
//! `[property.name=…]` matches an Identifier or PrivateIdentifier property
//! whether or not the access is computed (`bus[subscribe](…)` and
//! `this.#subscribe(…)` fire; `bus['subscribe'](…)` does not, because a Literal
//! property has no `.name`). The selector also runs over
//! template-expression statements (event-handler bodies), so components are
//! checked once in `check_root`; the script pass covers standalone modules.

use serde_json::Value;

use rsvelte_core::ast::template::Root;

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::rules::store_refs::handled_by_template_pass;
use crate::script::{
    ProgramView, ScriptKind, ScriptRule, node_end, node_start, node_type, walk_js,
};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-ignored-unsubscribe",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Off,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow ignoring the unsubscribe returned by store `.subscribe()`",
    options_schema: None,
};

const MESSAGE: &str = "Ignoring returned value of the subscribe method is forbidden.";

fn scan(tree: &Value, reports: &mut Vec<(u32, u32)>) {
    walk_js(tree, |node, ancestors| {
        // `node` must be the `.subscribe` MemberExpression callee.
        if node_type(node) != Some("MemberExpression") {
            return;
        }
        let Some(prop) = node.get("property") else {
            return;
        };
        // esquery `[property.name='subscribe']` reads the field, so an Identifier
        // or a PrivateIdentifier property matches regardless of `computed`; a
        // Literal property never does.
        if !matches!(node_type(prop), Some("Identifier" | "PrivateIdentifier"))
            || prop.get("name").and_then(Value::as_str) != Some("subscribe")
        {
            return;
        }
        // Parent must be a CallExpression whose callee IS this member, and the
        // grandparent must be an ExpressionStatement (return value discarded).
        let Some(parent) = ancestors.last() else {
            return;
        };
        if node_type(parent) != Some("CallExpression") {
            return;
        }
        let is_callee = parent
            .get("callee")
            .and_then(node_start)
            .zip(node_start(node))
            .is_some_and(|(a, b)| a == b);
        if !is_callee {
            return;
        }
        let grandparent = ancestors.get(ancestors.len().wrapping_sub(2));
        if grandparent.map(|g| node_type(g)) != Some(Some("ExpressionStatement")) {
            return;
        }
        // Upstream reports `node.property`.
        if let (Some(start), Some(end)) = (node_start(prop), node_end(prop)) {
            reports.push((start, end));
        }
    });
}

fn emit(ctx: &mut LintContext, mut reports: Vec<(u32, u32)>) {
    reports.sort_unstable();
    reports.dedup();
    for (start, end) in reports {
        ctx.report(start, end, MESSAGE);
    }
}

#[derive(Default)]
pub struct NoIgnoredUnsubscribe;

impl ScriptRule for NoIgnoredUnsubscribe {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &ProgramView<'_>, _kind: ScriptKind) {
        if handled_by_template_pass(ctx.filename()) {
            return;
        }
        let mut reports = Vec::new();
        scan(program.value(), &mut reports);
        emit(ctx, reports);
    }
}

impl Rule for NoIgnoredUnsubscribe {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_root(&self, ctx: &mut LintContext, root: &Root) {
        let root_json = ctx.root_json(root);
        if root_json.is_null() {
            return;
        }
        let mut reports = Vec::new();
        for tree in [
            root_json.get("instance").and_then(|s| s.get("content")),
            root_json.get("module").and_then(|s| s.get("content")),
            root_json.get("fragment"),
        ]
        .into_iter()
        .flatten()
        {
            scan(tree, &mut reports);
        }
        emit(ctx, reports);
    }
}
