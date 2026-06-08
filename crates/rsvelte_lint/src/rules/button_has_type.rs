//! `svelte/button-has-type` — require a valid, explicit `type` on `<button>`.
//! Without it the browser defaults to `type="submit"`, a common footgun inside
//! forms. Port of the eslint-plugin-svelte rule, including its `button`/
//! `submit`/`reset` options that forbid otherwise-valid type values.

use rsvelte_core::ast::template::{Attribute, AttributeValue, AttributeValuePart, RegularElement};

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/button-has-type",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Require an explicit, valid `type` attribute on `<button>` elements",
    options_schema: Some(
        r#"{ "type": "object", "properties": {
            "button": { "type": "boolean" },
            "submit": { "type": "boolean" },
            "reset":  { "type": "boolean" }
        }, "additionalProperties": false }"#,
    ),
};

/// The statically-known shape of a `type=...` value.
enum TypeValue {
    /// Boolean attribute or empty string — `<button type>` / `type=""`.
    Empty,
    /// Contains an interpolation — `type={x}` / `type="a{b}"`. Trusted.
    Dynamic,
    /// A fully static string value.
    Static(String),
}

fn type_value(value: &AttributeValue) -> TypeValue {
    match value {
        AttributeValue::True(_) => TypeValue::Empty,
        AttributeValue::Expression(_) => TypeValue::Dynamic,
        AttributeValue::Sequence(parts) => {
            if parts.is_empty() {
                return TypeValue::Empty;
            }
            let mut s = String::new();
            for p in parts {
                match p {
                    AttributeValuePart::Text(t) => s.push_str(&t.data),
                    AttributeValuePart::ExpressionTag(_) => return TypeValue::Dynamic,
                }
            }
            if s.is_empty() {
                TypeValue::Empty
            } else {
                TypeValue::Static(s)
            }
        }
    }
}

#[derive(Default)]
pub struct ButtonHasType;

impl Rule for ButtonHasType {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_element(&self, ctx: &mut LintContext, el: &RegularElement) {
        if !el.name.eq_ignore_ascii_case("button") {
            return;
        }

        let mut has_spread = false;
        for attr in &el.attributes {
            match attr {
                Attribute::Attribute(node) if node.name.eq_ignore_ascii_case("type") => {
                    // A static or dynamic `type=...` decides the outcome.
                    match type_value(&node.value) {
                        TypeValue::Empty => ctx.report(
                            node.start,
                            node.end,
                            "A value must be set for button type attribute.",
                        ),
                        TypeValue::Dynamic => {}
                        TypeValue::Static(value) => {
                            let allowed = matches!(value.as_str(), "button" | "submit" | "reset");
                            if !allowed {
                                ctx.report(
                                    node.start,
                                    node.end,
                                    format!(
                                        "{value} is an invalid value for button type attribute."
                                    ),
                                );
                            } else if !ctx.option_bool(&value, true) {
                                ctx.report(
                                    node.start,
                                    node.end,
                                    format!(
                                        "{value} is a forbidden value for button type attribute."
                                    ),
                                );
                            }
                        }
                    }
                    return;
                }
                // `bind:type` carries a runtime value — trusted, no report.
                Attribute::BindDirective(d) if d.name.eq_ignore_ascii_case("type") => return,
                // A spread (`{...props}`) may carry `type` at runtime.
                Attribute::SpreadAttribute(_) => has_spread = true,
                _ => {}
            }
        }

        if has_spread {
            return;
        }

        // No `type`, no `bind:type`, no spread → flag the `<button` opener.
        let end = el.start + 1 + el.name.len() as u32;
        ctx.report(
            el.start,
            end,
            "Missing an explicit type attribute for button.",
        );
    }
}
