//! `svelte/no-inline-styles`.
//!
//! `svelte/no-inline-styles` — disallow attributes and directives that produce
//! inline styles on HTML elements: a `style="…"` attribute, a `style:…`
//! directive, and (when `allowTransitions` is `false`) a `transition:` / `in:` /
//! `out:` directive.
//!
//! Port of the eslint-plugin-svelte rule.
//!
//! A template-walk rule: only HTML elements are inspected, mirroring upstream's
//! `node.kind === 'html'` guard. `<slot>` and `<title>` are HTML elements to
//! svelte-eslint-parser but dedicated nodes here; components and `svelte:*`
//! specials are excluded.

use rsvelte_core::ast::template::{Attribute, RegularElement, SlotElement, TitleElement};
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

impl NoInlineStyles {
    fn check_attributes(&self, ctx: &mut LintContext, attributes: &[Attribute]) {
        let allow_transitions = ctx
            .option0()
            .and_then(|o| o.get("allowTransitions"))
            .and_then(Value::as_bool)
            .unwrap_or(true);

        for attr in attributes {
            match attr {
                Attribute::StyleDirective(d) => {
                    ctx.report(d.start, d.end, "Found disallowed style directive.");
                }
                Attribute::Attribute(a) if a.name == "style" => {
                    // Skip shorthand attributes (`{style}`) — they have type
                    // `SvelteShorthandAttribute` in svelte-eslint-parser and are
                    // NOT flagged by the oracle's `attribute.type === 'SvelteAttribute'`
                    // check.  Detect shorthands by looking at the first source byte:
                    // shorthand attributes start with `{` (not the attribute name).
                    if ctx.slice(a.start, a.start + 1) == "{" {
                        continue;
                    }
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

impl Rule for NoInlineStyles {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_element(&self, ctx: &mut LintContext, el: &RegularElement) {
        self.check_attributes(ctx, &el.attributes);
    }

    // `<slot>` and `<title>` are `SvelteHTMLElement` (kind `html`) to svelte-eslint-parser.
    fn check_slot(&self, ctx: &mut LintContext, el: &SlotElement) {
        self.check_attributes(ctx, &el.attributes);
    }

    fn check_title(&self, ctx: &mut LintContext, el: &TitleElement) {
        self.check_attributes(ctx, &el.attributes);
    }
}
