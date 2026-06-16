//! `svelte/no-ignored-unsubscribe` — disallow ignoring the unsubscribe function
//! returned by a store's `.subscribe()` call. Port of the eslint-plugin-svelte
//! rule: flag a `<expr>.subscribe(...)` call used as a bare expression statement
//! (its return value discarded). Runs over the script ESTree program via the
//! [`ScriptRule`] hook.

use serde_json::Value;

use crate::context::LintContext;
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::{ScriptKind, ScriptRule, node_start, node_type, walk_js};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-ignored-unsubscribe",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow ignoring the unsubscribe returned by store `.subscribe()`",
    options_schema: None,
};

const MESSAGE: &str = "Ignoring returned value of the subscribe method is forbidden.";

#[derive(Default)]
pub struct NoIgnoredUnsubscribe;

impl ScriptRule for NoIgnoredUnsubscribe {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &Value, _kind: ScriptKind) {
        // Selector: ExpressionStatement > CallExpression > MemberExpression.callee[property.name='subscribe'].
        let mut reports: Vec<u32> = Vec::new();
        walk_js(program, |node, ancestors| {
            // `node` must be the `.subscribe` MemberExpression callee.
            if node_type(node) != Some("MemberExpression") {
                return;
            }
            if node.get("computed").and_then(Value::as_bool) == Some(true) {
                return;
            }
            let Some(prop) = node.get("property") else {
                return;
            };
            if node_type(prop) != Some("Identifier")
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
                .map(|(a, b)| a == b)
                .unwrap_or(false);
            if !is_callee {
                return;
            }
            let grandparent = ancestors.get(ancestors.len().wrapping_sub(2));
            if grandparent.map(|g| node_type(g)) != Some(Some("ExpressionStatement")) {
                return;
            }
            if let Some(start) = node_start(prop) {
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
