//! `svelte/require-optimized-style-attribute` — require style attributes that
//! can be optimized into `style:property` directives by the compiler.
//!
//! A `style="…"` attribute value is **unoptimized** when:
//! - It is written in shorthand form (`{style}` — maps to
//!   `style={style}` at parse time, but the source byte starts with `{`).
//! - The entire value is a JS expression (`style={expr}`): reported as
//!   `complex`.
//! - The value sequence contains a CSS comment (`/* … */`): reported as
//!   `comment` at the `/*` position.
//! - A `{…}` interpolation appears in a CSS property-key position (followed by
//!   `:`): reported as `interpolationKey` at the `{` position.
//! - A `{…}` interpolation is standalone (not after a `: ` and not followed by
//!   `:`): reported as `complex` at the `{` position.
//!
//! Port of `eslint-plugin-svelte/src/rules/require-optimized-style-attribute.ts`.
//! Upstream: `meta.type = 'suggestion'`, not `recommended`.

use rsvelte_core::ast::template::{Attribute, AttributeValue, AttributeValuePart, Text};

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/require-optimized-style-attribute",
    category: RuleCategory::Style,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Require style attributes that can be optimized",
    options_schema: None,
};

/// Find the byte offset of the first `/*` inside a text node's raw content,
/// returning `text.start + inner_offset` when found.
fn find_css_comment(text: &Text) -> Option<u32> {
    let raw = text.raw.as_str();
    // Find `/*` but not inside a string (simple scan; style attribute values
    // are not expected to contain string literals with `/*`).
    let bytes = raw.as_bytes();
    let mut i = 0usize;
    while i + 1 < bytes.len() {
        if bytes[i] == b'/' && bytes[i + 1] == b'*' {
            return Some(text.start + i as u32);
        }
        i += 1;
    }
    None
}

#[derive(Default)]
pub struct RequireOptimizedStyleAttribute;

impl Rule for RequireOptimizedStyleAttribute {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_attribute(&self, ctx: &mut LintContext, attr: &Attribute) {
        let Attribute::Attribute(node) = attr else {
            return;
        };
        if node.name != "style" {
            return;
        }

        // Shorthand `{style}` — the source at the attribute start is `{`.
        if ctx.slice(node.start, node.start + 1) == "{" {
            ctx.report(
                node.start,
                node.end,
                "It cannot be optimized because style attribute is specified using shorthand.",
            );
            return;
        }

        match &node.value {
            AttributeValue::True(_) => {
                // Boolean-only (`style` without a value): nothing to check.
            }
            AttributeValue::Expression(tag) => {
                // `style={expr}` — the whole value is a JS expression.
                ctx.report(
                    tag.start,
                    tag.end,
                    "It cannot be optimized because too complex.",
                );
            }
            AttributeValue::Sequence(parts) => {
                check_sequence(ctx, parts);
            }
        }
    }
}

/// Analyse the parts of a quoted style attribute value for unoptimizable
/// patterns and report each one.
///
/// State machine that tracks where we are in the CSS declaration stream:
///
/// ```text
///   BEFORE_COLON  --":"-->  AFTER_COLON
///       ^                       |
///       `------";"-------------'
/// ```
///
/// An interpolation `{…}` is:
/// - in **key position**  when we are in BEFORE_COLON and the next text starts
///   with `:` → `interpolationKey`.
/// - in **value position** when we are in AFTER_COLON → OK (optimizable).
/// - **standalone** (BEFORE_COLON and next text does not start with `:`) → `complex`.
fn check_sequence(ctx: &mut LintContext, parts: &[AttributeValuePart]) {
    // We scan text parts to update whether we're before or after the `:` of the
    // current CSS declaration.  The state is reset to BEFORE_COLON on every `;`.
    //
    // `after_colon` = true means we have seen a `:` since the last `;` in the
    // accumulated text context (or since the start).
    let mut after_colon = false;

    for (i, part) in parts.iter().enumerate() {
        match part {
            AttributeValuePart::Text(text) => {
                // Check for CSS comments `/* … */` in the static text.
                if let Some(pos) = find_css_comment(text) {
                    ctx.report(
                        pos,
                        pos + 2,
                        "It cannot be optimized because contains comments.",
                    );
                }
                // Update the colon/semicolon state from this text segment.
                // We only care about `:` and `;` outside of parens (CSS function
                // calls like `translate(…)` contain `,` but not `:` or `;`).
                // A simple scan is sufficient because we don't allow nested
                // interpolations in property keys.
                let raw = text.raw.as_str();
                let mut depth = 0i32; // paren depth
                for ch in raw.chars() {
                    match ch {
                        '(' => depth += 1,
                        ')' => depth -= 1,
                        ':' if depth == 0 => after_colon = true,
                        ';' if depth == 0 => after_colon = false,
                        _ => {}
                    }
                }
            }
            AttributeValuePart::ExpressionTag(tag) => {
                // Peek at what text immediately follows this expression.
                let next_text_trimmed = parts.get(i + 1).and_then(|p| {
                    if let AttributeValuePart::Text(t) = p {
                        Some(t.raw.as_str())
                    } else {
                        None
                    }
                });

                let next_starts_with_colon =
                    next_text_trimmed.is_some_and(|s| s.trim_start().starts_with(':'));

                if next_starts_with_colon {
                    // Key interpolation: `{key}: value`.
                    ctx.report(
                        tag.start,
                        tag.end,
                        "It cannot be optimized because property of style declaration contain interpolation.",
                    );
                    // After `{key}:` we are in value position.
                    after_colon = true;
                } else if after_colon {
                    // Value interpolation inside a declaration — optimizable.
                    // State stays after_colon (unchanged).
                } else {
                    // Standalone interpolation — not a recognized CSS value slot.
                    ctx.report(
                        tag.start,
                        tag.end,
                        "It cannot be optimized because too complex.",
                    );
                }
            }
        }
    }
}
