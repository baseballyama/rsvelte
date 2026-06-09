//! `svelte/no-extra-reactive-curlies` — disallow wrapping a single reactive
//! statement in curly braces (`$: { foo = bar; }`). A reactive block with just
//! one statement doesn't need the braces. Port of the eslint-plugin-svelte rule.
//!
//! Runs over the `<script>` ESTree program via the [`ScriptRule`] hook. A `$:`
//! reactive statement is a `LabeledStatement` whose label is `$`; the rule
//! flags one whose body is a `BlockStatement` with exactly one statement,
//! reporting at the block. The upstream fix is suggestion-only (not an autofix),
//! so the rule reports without an attached fix.

use serde_json::Value;

use crate::context::LintContext;
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::{ScriptKind, ScriptRule, node_start, node_type, walk_js};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-extra-reactive-curlies",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: true,
    },
    type_aware: false,
    docs: "Disallow wrapping single reactive statements in curly braces",
    options_schema: None,
};

const MESSAGE: &str = "Do not wrap reactive statements in curly braces unless necessary.";

#[derive(Default)]
pub struct NoExtraReactiveCurlies;

impl ScriptRule for NoExtraReactiveCurlies {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &Value, _kind: ScriptKind) {
        let mut reports: Vec<(u32, u32)> = Vec::new();
        walk_js(program, |node, _| {
            if node_type(node) != Some("LabeledStatement") {
                return;
            }
            if node
                .get("label")
                .and_then(|l| l.get("name"))
                .and_then(Value::as_str)
                != Some("$")
            {
                return;
            }
            let Some(body) = node.get("body") else { return };
            if node_type(body) != Some("BlockStatement") {
                return;
            }
            let one_stmt = body
                .get("body")
                .and_then(Value::as_array)
                .is_some_and(|b| b.len() == 1);
            if !one_stmt {
                return;
            }
            if let (Some(s), Some(e)) = (node_start(body), body.get("end").and_then(Value::as_u64))
            {
                reports.push((s, e as u32));
            }
        });

        for (start, end) in reports {
            ctx.report(start, end, MESSAGE);
        }
    }
}
