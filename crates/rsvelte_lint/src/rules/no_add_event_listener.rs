//! `svelte/no-add-event-listener` — warn against the use of `addEventListener`.
//!
//! Port of eslint-plugin-svelte's `no-add-event-listener` rule. In Svelte 5 the
//! recommended way to attach DOM event listeners is the `on` function from
//! `svelte/events` (which respects the component lifecycle), so any direct use of
//! `addEventListener` should be flagged.
//!
//! Runs over the `<script>` (instance / module) ESTree program via the
//! [`ScriptRule`] hook. Upstream offers a *suggestion* (rewrite to `on(...)`),
//! but the rsvelte oracle only checks detection, so this is detection-only
//! ([`Fixable::No`]).
//!
//! A `CallExpression` is reported when its callee is either:
//!   - a non-computed `MemberExpression` whose property is an `Identifier`
//!     named `addEventListener` (e.g. `el.addEventListener(...)`), or
//!   - a bare `Identifier` named `addEventListener` (e.g. `addEventListener(...)`,
//!     i.e. the global on `window`).
//!
//! The finding is reported at the `CallExpression` node start so the column
//! matches upstream.

use serde_json::Value;

use crate::context::LintContext;
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::{ScriptKind, ScriptRule, node_start, node_type, walk_js};

const MESSAGE: &str =
    "Do not use `addEventListener`. Use the `on` function from `svelte/events` instead.";

static META: RuleMeta = RuleMeta {
    name: "svelte/no-add-event-listener",
    category: RuleCategory::Style,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Warns against the use of `addEventListener`",
    options_schema: None,
};

#[derive(Default)]
pub struct NoAddEventListener;

impl ScriptRule for NoAddEventListener {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &Value, _kind: ScriptKind) {
        let mut reports: Vec<u32> = Vec::new();
        walk_js(program, |node, _ancestors| {
            if node_type(node) != Some("CallExpression") {
                return;
            }
            let Some(callee) = node.get("callee") else {
                return;
            };
            if !is_add_event_listener_callee(callee) {
                return;
            }
            if let Some(start) = node_start(node) {
                reports.push(start);
            }
        });

        for start in reports {
            ctx.report(start, start, MESSAGE.to_string());
        }
    }
}

/// Whether a `CallExpression` callee targets `addEventListener` — either a
/// `<obj>.addEventListener` member access (non-computed, property identifier) or
/// a bare `addEventListener` identifier (the global on `window`).
fn is_add_event_listener_callee(callee: &Value) -> bool {
    match node_type(callee) {
        Some("MemberExpression") => {
            // `obj["addEventListener"](...)` (computed) is NOT matched upstream.
            if callee.get("computed").and_then(Value::as_bool) == Some(true) {
                return false;
            }
            let property = callee.get("property");
            property.and_then(|p| {
                if node_type(p) != Some("Identifier") {
                    return None;
                }
                p.get("name").and_then(Value::as_str)
            }) == Some("addEventListener")
        }
        Some("Identifier") => {
            callee.get("name").and_then(Value::as_str) == Some("addEventListener")
        }
        _ => false,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn matches_member_property() {
        let callee = json!({
            "type": "MemberExpression",
            "computed": false,
            "object": { "type": "Identifier", "name": "window" },
            "property": { "type": "Identifier", "name": "addEventListener" }
        });
        assert!(is_add_event_listener_callee(&callee));
    }

    #[test]
    fn matches_bare_identifier() {
        let callee = json!({ "type": "Identifier", "name": "addEventListener" });
        assert!(is_add_event_listener_callee(&callee));
    }

    #[test]
    fn rejects_computed_member() {
        let callee = json!({
            "type": "MemberExpression",
            "computed": true,
            "object": { "type": "Identifier", "name": "window" },
            "property": { "type": "Literal", "value": "addEventListener" }
        });
        assert!(!is_add_event_listener_callee(&callee));
    }

    #[test]
    fn rejects_other_property() {
        let callee = json!({
            "type": "MemberExpression",
            "computed": false,
            "object": { "type": "Identifier", "name": "window" },
            "property": { "type": "Identifier", "name": "removeEventListener" }
        });
        assert!(!is_add_event_listener_callee(&callee));
    }

    #[test]
    fn rejects_other_identifier() {
        let callee = json!({ "type": "Identifier", "name": "on" });
        assert!(!is_add_event_listener_callee(&callee));
    }
}
