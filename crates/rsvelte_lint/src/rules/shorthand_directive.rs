//! `svelte/shorthand-directive` — enforce use of shorthand syntax in directives.
//!
//! Option: `[{ "prefer": "always" | "never" }]` (default `"always"`).
//!
//! Applies to `bind:`, `class:`, and `style:` directives.
//!
//! In **always** mode (default) the rule flags long-form directives where the
//! expression is an `Identifier` whose name matches the directive key:
//! `bind:value={value}` → `bind:value`, `class:active={active}` →
//! `class:active`, `style:color={color}` → `style:color`. Mixed content is
//! left alone.
//!
//! In **never** mode the rule flags shorthand directives and requires the
//! explicit `={name}` value: `bind:value` → `bind:value={value}`, etc.
//!
//! Port of `eslint-plugin-svelte/src/rules/shorthand-directive.ts`.
//! Upstream: `meta.fixable = 'code'`, `type: 'layout'`.

use rsvelte_core::ast::template::{Attribute, AttributeValue, AttributeValuePart};

use crate::context::LintContext;
use crate::diagnostic::{Fix, TextEdit};
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/shorthand-directive",
    category: RuleCategory::Formatting,
    fixable: Fixable::Code,
    default_severity: Severity::Off,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Enforce use of shorthand syntax in directives",
    options_schema: Some(
        r#"[{"type":"object","properties":{"prefer":{"enum":["always","never"]}},"additionalProperties":false}]"#,
    ),
};

/// The common shape extracted from the three shorthand-capable directive kinds.
struct DirectiveInfo<'a> {
    start: u32,
    end: u32,
    /// Directive key name (e.g. `value` for `bind:value`).
    name: &'a str,
    /// Already in shorthand form (`bind:value` / `style:color`).
    is_shorthand: bool,
    /// Long-form value is exactly `{name}` — i.e. shortenable.
    shortenable: bool,
}

/// Whether an attribute value is exactly a single `{ident}` whose identifier
/// name equals `name` (covers both the `Expression` and one-element `Sequence`
/// encodings the parser may produce for `style:x={x}`).
fn value_is_named_identifier(value: &AttributeValue, name: &str) -> bool {
    match value {
        AttributeValue::Expression(tag) => tag.expression.is_identifier(name),
        AttributeValue::Sequence(parts) => {
            matches!(parts.as_slice(), [AttributeValuePart::ExpressionTag(tag)] if tag.expression.is_identifier(name))
        }
        AttributeValue::True(_) => false,
    }
}

#[derive(Default)]
pub struct ShorthandDirective;

impl ShorthandDirective {
    /// Apply the always/never report to a gathered directive.
    fn report(&self, ctx: &mut LintContext, info: &DirectiveInfo, prefer_never: bool) {
        if prefer_never {
            if info.is_shorthand {
                // `bind:value` → `bind:value={value}`
                ctx.report_with_fix(
                    info.start,
                    info.end,
                    "Expected regular directive syntax.",
                    Fix {
                        message: "Use regular directive syntax".to_string(),
                        edits: vec![TextEdit {
                            start: info.end,
                            end: info.end,
                            new_text: format!("={{{}}}", info.name),
                        }],
                    },
                );
            }
        } else if !info.is_shorthand && info.shortenable {
            // `bind:value={value}` → `bind:value`: drop from the `=` to the end.
            let src = ctx.slice(info.start, info.end);
            let Some(eq_offset) = src.find('=') else {
                return;
            };
            let remove_start = info.start + eq_offset as u32;
            ctx.report_with_fix(
                info.start,
                info.end,
                "Expected shorthand directive.",
                Fix {
                    message: "Use shorthand directive".to_string(),
                    edits: vec![TextEdit {
                        start: remove_start,
                        end: info.end,
                        new_text: String::new(),
                    }],
                },
            );
        }
    }
}

impl Rule for ShorthandDirective {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_attribute(&self, ctx: &mut LintContext, attr: &Attribute) {
        let prefer_never = ctx
            .option0()
            .and_then(|v| v.get("prefer"))
            .and_then(|v| v.as_str())
            == Some("never");

        // Gather the common fields for the three directive kinds that support
        // shorthand syntax; bail for every other attribute/directive.
        // `bind:`/`class:` carry the value as an `expression`; `style:` as an
        // `AttributeValue` (shorthand = boolean-`True` value).
        let info = match attr {
            Attribute::BindDirective(n) => DirectiveInfo {
                start: n.start,
                end: n.end,
                name: n.name.as_str(),
                is_shorthand: !ctx.slice(n.start, n.end).contains('='),
                shortenable: n.expression.is_identifier(n.name.as_str()),
            },
            Attribute::ClassDirective(n) => DirectiveInfo {
                start: n.start,
                end: n.end,
                name: n.name.as_str(),
                is_shorthand: !ctx.slice(n.start, n.end).contains('='),
                shortenable: n.expression.is_identifier(n.name.as_str()),
            },
            Attribute::StyleDirective(n) => DirectiveInfo {
                start: n.start,
                end: n.end,
                name: n.name.as_str(),
                is_shorthand: matches!(n.value, AttributeValue::True(_)),
                shortenable: value_is_named_identifier(&n.value, n.name.as_str()),
            },
            _ => return,
        };

        self.report(ctx, &info, prefer_never);
    }
}
