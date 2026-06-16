//! `svelte/shorthand-attribute` — enforce use of shorthand syntax in attributes.
//!
//! Option: `[{ "prefer": "always" | "never" }]` (default `"always"`).
//!
//! **always** (default): when an attribute is written as `name={ident}` (or the
//! quoted form `name="{ident}"`) and the expression is an `Identifier` whose
//! name equals the attribute key, report and fix by converting it to `{name}`.
//! Mixed content like `name="{ident} extra"` or `name=" {ident} "` is left alone.
//!
//! **never**: when an attribute is written as the shorthand `{name}`, report and
//! fix by converting it to `name={name}`.
//!
//! Port of `eslint-plugin-svelte/src/rules/shorthand-attribute.ts`.
//! Upstream: `meta.fixable = 'code'`, `type: 'layout'`.

use rsvelte_core::ast::template::{Attribute, AttributeNode, AttributeValue, AttributeValuePart};

use crate::context::LintContext;
use crate::diagnostic::{Fix, TextEdit};
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/shorthand-attribute",
    category: RuleCategory::Formatting,
    fixable: Fixable::Code,
    default_severity: Severity::Off,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Enforce use of shorthand syntax in attribute",
    options_schema: Some(
        r#"[{"type":"object","properties":{"prefer":{"enum":["always","never"]}},"additionalProperties":false}]"#,
    ),
};

/// Detect whether this attribute node is a **shorthand** `{name}` form: the
/// attribute source begins with `{` (no `name=` prefix).
fn is_shorthand(ctx: &LintContext, node: &AttributeNode) -> bool {
    ctx.slice(node.start, node.start + 1) == "{"
}

#[derive(Default)]
pub struct ShorthandAttribute;

impl Rule for ShorthandAttribute {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_attribute(&self, ctx: &mut LintContext, attr: &Attribute) {
        let Attribute::Attribute(node) = attr else {
            return;
        };

        // Determine prefer mode. Default is "always".
        let prefer_never = ctx
            .option0()
            .and_then(|v| v.get("prefer"))
            .and_then(|v| v.as_str())
            == Some("never");

        if prefer_never {
            // never mode: flag shorthand `{name}` → report "Expected regular attribute syntax."
            if is_shorthand(ctx, node) {
                let name = node.name.as_str().to_string();
                let attr_start = node.start;
                ctx.report_with_fix(
                    attr_start,
                    node.end,
                    "Expected regular attribute syntax.",
                    Fix {
                        message: "Replace with regular attribute syntax".to_string(),
                        edits: vec![TextEdit {
                            start: attr_start,
                            end: attr_start,
                            new_text: format!("{name}="),
                        }],
                    },
                );
            }
        } else {
            // always mode: flag `name={ident}` or `name="{ident}"` where ident == name.
            // Skip if it's already a shorthand.
            if is_shorthand(ctx, node) {
                return;
            }

            let name = node.name.as_str();

            match &node.value {
                AttributeValue::Expression(tag) => {
                    // Unquoted: `name={ident}`. The ExpressionTag start is at `{`.
                    if tag.expression.is_identifier(name) {
                        // Fix: remove everything from attr.start up to (not
                        // including) the `{` of the ExpressionTag, leaving `{name}`.
                        ctx.report_with_fix(
                            node.start,
                            node.end,
                            "Expected shorthand attribute.",
                            Fix {
                                message: "Use shorthand attribute".to_string(),
                                edits: vec![TextEdit {
                                    start: node.start,
                                    end: tag.start,
                                    new_text: String::new(),
                                }],
                            },
                        );
                    }
                }
                AttributeValue::Sequence(parts) => {
                    // Quoted form: `name="{ident}"` — exactly one part that is a
                    // single ExpressionTag whose expression is an Identifier with
                    // the same name. Mixed content (text parts or multiple parts)
                    // is not flagged.
                    if parts.len() != 1 {
                        return;
                    }
                    let part = &parts[0];
                    let AttributeValuePart::ExpressionTag(tag) = part else {
                        return;
                    };
                    if !tag.expression.is_identifier(name) {
                        return;
                    }
                    // The source looks like: `name="{ident}"` or `name  =  "{ident}"`
                    // We need to find the opening `"` before `{ident}` and the
                    // closing `"` after `}`.
                    //
                    // Strategy: scan backwards from tag.start to find the `"` (or `'`),
                    // and scan forwards from tag.end to find the matching closing quote.
                    let src = ctx.source().as_bytes();
                    // Find the opening quote: scan back from tag.start.
                    let mut open_quote_pos: Option<u32> = None;
                    let mut i = tag.start as usize;
                    while i > node.start as usize {
                        i -= 1;
                        let b = src[i];
                        if b == b'"' || b == b'\'' {
                            open_quote_pos = Some(i as u32);
                            break;
                        }
                        // Skip whitespace/equals between the key and the quote.
                        if b != b'=' && !b.is_ascii_whitespace() {
                            // Hit something unexpected — not a clean `name="…"` form.
                            return;
                        }
                    }
                    let Some(open_q) = open_quote_pos else {
                        return;
                    };
                    let open_ch = src[open_q as usize];
                    // Find the closing quote after tag.end.
                    let close_q = tag.end as usize;
                    if close_q >= src.len() || src[close_q] != open_ch {
                        return;
                    }
                    // Fix: remove `name=…"` prefix (attr.start..tag.start) and
                    // closing `"` suffix (tag.end..attr.end).
                    let tag_start = tag.start;
                    let tag_end = tag.end;
                    ctx.report_with_fix(
                        node.start,
                        node.end,
                        "Expected shorthand attribute.",
                        Fix {
                            message: "Use shorthand attribute".to_string(),
                            edits: vec![
                                // Remove `name  =  "` prefix
                                TextEdit {
                                    start: node.start,
                                    end: tag_start,
                                    new_text: String::new(),
                                },
                                // Remove closing `"` suffix
                                TextEdit {
                                    start: tag_end,
                                    end: tag_end + 1,
                                    new_text: String::new(),
                                },
                            ],
                        },
                    );
                }
                AttributeValue::True(_) => {
                    // Boolean-only attribute like `disabled` — no value to check.
                }
            }
        }
    }
}
