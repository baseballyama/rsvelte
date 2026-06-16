//! `svelte/no-spaces-around-equal-signs-in-attribute` — disallow spaces around
//! equal signs in attribute definitions.
//!
//! For every attribute/directive node (except spread and attach-tag), the rule
//! takes the source slice from the KEY's end to the node's end, matches the
//! leading `^[\s=]*` prefix ("eqSource"), and reports if that prefix contains
//! any whitespace. The autofix replaces the matched range with a single `=`.
//!
//! Port of `eslint-plugin-svelte/src/rules/no-spaces-around-equal-signs-in-attribute.ts`.
//! Upstream: `meta.fixable = 'whitespace'`, `type: 'layout'`, no options.

use rsvelte_core::ast::template::Attribute;

use crate::context::LintContext;
use crate::diagnostic::{Fix, TextEdit};
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-spaces-around-equal-signs-in-attribute",
    category: RuleCategory::Formatting,
    fixable: Fixable::Code,
    default_severity: Severity::Off,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow spaces around equal signs in attribute definitions",
    options_schema: None,
};

/// Find the end of the attribute key by scanning from `start` forward,
/// stopping at the first `=` or ASCII whitespace character.
///
/// This works uniformly for all attribute variants:
/// - `AttributeNode` (`class`): stops at `=` or whitespace before the value.
/// - Directives (`bind:test`, `style:width`, `on:click`, …): stops at `=`
///   or whitespace after the full `prefix:name` key.
/// - Shorthand (`{class}`, i.e., `class` starts at `{`): `{` is neither `=`
///   nor whitespace, so the scan runs to the end — `eqSource` is empty and
///   no whitespace is found, naturally excluding the shorthand.
fn key_end(source: &[u8], node_start: u32, node_end: u32) -> u32 {
    let end = node_end as usize;
    let mut pos = node_start as usize;
    while pos < end {
        let b = source[pos];
        if b == b'=' || b == b' ' || b == b'\t' || b == b'\n' || b == b'\r' {
            break;
        }
        pos += 1;
    }
    pos as u32
}

/// The leading `^[\s=]*` prefix of `src` (bytes while char is whitespace or `=`).
fn eq_source_len(src: &str) -> usize {
    src.find(|c: char| c != '=' && !c.is_whitespace())
        .unwrap_or(src.len())
}

#[derive(Default)]
pub struct NoSpacesAroundEqualSignsInAttribute;

impl NoSpacesAroundEqualSignsInAttribute {
    fn check(&self, ctx: &mut LintContext, node_start: u32, node_end: u32) {
        let src_bytes = ctx.source().as_bytes();
        let ke = key_end(src_bytes, node_start, node_end);
        // Slice from key-end to node-end.
        let tail = ctx.slice(ke, node_end);
        let eq_len = eq_source_len(tail);
        let eq_src = &tail[..eq_len];
        // The rule is about spaces *around an equal sign*: only report when the
        // region actually contains a `=`. A shorthand attribute written with
        // inner spaces (`{ id }`) has a whitespace-only eq region (the key scan
        // stops at the space after `{`) but no `=`, so upstream — which measures
        // the gap between the key node and the value node — never reports it.
        if !eq_src.contains('=') || !eq_src.chars().any(|c| c.is_whitespace()) {
            return;
        }
        let eq_end = ke + eq_len as u32;
        ctx.report_with_fix(
            ke,
            eq_end,
            "Unexpected spaces found around equal signs.",
            Fix {
                message: "Replace with `=`".to_string(),
                edits: vec![TextEdit {
                    start: ke,
                    end: eq_end,
                    new_text: "=".to_string(),
                }],
            },
        );
    }
}

impl Rule for NoSpacesAroundEqualSignsInAttribute {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_attribute(&self, ctx: &mut LintContext, attr: &Attribute) {
        match attr {
            // SpreadAttribute (`{...x}`) and AttachTag have no key=value
            // structure — skip them.
            Attribute::SpreadAttribute(_) | Attribute::AttachTag(_) => {}
            Attribute::Attribute(node) => self.check(ctx, node.start, node.end),
            Attribute::BindDirective(node) => self.check(ctx, node.start, node.end),
            Attribute::OnDirective(node) => self.check(ctx, node.start, node.end),
            Attribute::ClassDirective(node) => self.check(ctx, node.start, node.end),
            Attribute::StyleDirective(node) => self.check(ctx, node.start, node.end),
            Attribute::TransitionDirective(node) => self.check(ctx, node.start, node.end),
            Attribute::AnimateDirective(node) => self.check(ctx, node.start, node.end),
            Attribute::UseDirective(node) => self.check(ctx, node.start, node.end),
            Attribute::LetDirective(node) => self.check(ctx, node.start, node.end),
        }
    }
}
