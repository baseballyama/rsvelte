//! `svelte/no-restricted-html-elements` — forbid configured HTML elements.
//! Option-driven (inert until configured), demonstrating the per-rule options
//! plumbing. Port of the eslint-plugin-svelte rule.
//!
//! Options are a variadic list; each entry is either a bare tag name string or
//! `{ "elements": ["tag", …], "message"?: "custom text" }`.

use rsvelte_core::ast::template::RegularElement;
use serde_json::Value;

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-restricted-html-elements",
    category: RuleCategory::Style,
    fixable: Fixable::No,
    // Off by default (opt-in): inert without `elements` options, and
    // `recommended: false` upstream.
    default_severity: Severity::Off,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow specific HTML elements (configured via options)",
    options_schema: Some(
        r#"{ "type": "array", "items": { "oneOf": [
            { "type": "string" },
            { "type": "object", "properties": {
                "elements": { "type": "array", "items": { "type": "string" } },
                "message": { "type": "string" }
            }, "additionalProperties": false }
        ] } }"#,
    ),
};

#[derive(Default)]
pub struct NoRestrictedHtmlElements;

impl Rule for NoRestrictedHtmlElements {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_element(&self, ctx: &mut LintContext, el: &RegularElement) {
        let Some(items) = ctx.options().and_then(Value::as_array) else {
            return;
        };
        let name = el.name.as_str();
        let end = el.start + 1 + name.len() as u32;

        for item in items {
            let (matched, message) = match item {
                Value::String(s) => (
                    s == name,
                    format!("Unexpected use of forbidden HTML element {name}."),
                ),
                Value::Object(o) => {
                    let listed = o
                        .get("elements")
                        .and_then(Value::as_array)
                        .map(|a| a.iter().any(|e| e.as_str() == Some(name)))
                        .unwrap_or(false);
                    let msg = o
                        .get("message")
                        .and_then(Value::as_str)
                        .map(str::to_string)
                        .unwrap_or_else(|| {
                            format!("Unexpected use of forbidden HTML element {name}.")
                        });
                    (listed, msg)
                }
                _ => (false, String::new()),
            };
            if matched {
                ctx.report(el.start, end, message);
                return;
            }
        }
    }
}
