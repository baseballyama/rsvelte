//! `svelte/no-inline-styles` — disallow attributes and directives that produce
//! inline styles on HTML elements: a `style="…"` attribute, a `style:…`
//! directive, and (when `allowTransitions` is `false`) a `transition:` / `in:` /
//! `out:` directive. Port of the eslint-plugin-svelte rule.
//!
//! A template-walk rule (`check_element`): only HTML elements are inspected,
//! mirroring upstream's `node.kind === 'html'` guard (components and
//! `svelte:*` specials are separate AST nodes and never reach `check_element`).

use rsvelte_core::ast::template::{Attribute, RegularElement};
use serde_json::Value;

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-inline-styles",
    category: RuleCategory::Style,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow attributes and directives that produce inline styles",
    options_schema: Some(
        r#"{ "type": "object", "properties": {
            "allowTransitions": { "type": "boolean" }
        }, "additionalProperties": false }"#,
    ),
};

#[derive(Default)]
pub struct NoInlineStyles;

impl Rule for NoInlineStyles {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_element(&self, ctx: &mut LintContext, el: &RegularElement) {
        let allow_transitions = ctx
            .option0()
            .and_then(|o| o.get("allowTransitions"))
            .and_then(Value::as_bool)
            .unwrap_or(true);

        for attr in &el.attributes {
            match attr {
                Attribute::StyleDirective(d) => {
                    ctx.report(d.start, d.end, "Found disallowed style directive.");
                }
                Attribute::Attribute(a) if a.name == "style" => {
                    ctx.report(a.start, a.end, "Found disallowed style attribute.");
                }
                Attribute::TransitionDirective(t) if !allow_transitions => {
                    ctx.report(t.start, t.end, "Found disallowed transition.");
                }
                _ => {}
            }
        }
    }
}
