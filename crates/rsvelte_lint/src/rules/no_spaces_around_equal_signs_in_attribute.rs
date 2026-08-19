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

use rsvelte_core::ast::template::{Attribute, SvelteComponentElement, SvelteDynamicElement};

use crate::context::LintContext;
use crate::diagnostic::{Fix, TextEdit};
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::rules::js_whitespace::is_js_whitespace;

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
/// stopping at the first `=` or whitespace (JS `\s`) character.
///
/// This works uniformly for all attribute variants:
/// - `AttributeNode` (`class`): stops at `=` or whitespace before the value.
/// - Directives (`bind:test`, `style:width`, `on:click`, …): stops at `=`
///   or whitespace after the full `prefix:name` key.
/// - Shorthand (`{class}`, i.e., `class` starts at `{`): `{` is neither `=`
///   nor whitespace, so the scan runs to the end — `eqSource` is empty and
///   no whitespace is found, naturally excluding the shorthand.
fn key_end(source: &str, node_start: u32, node_end: u32) -> u32 {
    let end = (node_end as usize).min(source.len());
    let slice = &source[node_start as usize..end];
    let off = slice
        .find(|c: char| c == '=' || is_js_whitespace(c))
        .unwrap_or(slice.len());
    node_start + u32::try_from(off).expect("source offsets are represented as u32")
}

/// The leading `^[\s=]*` prefix of `src` (bytes while char is JS whitespace or
/// `=`).
fn eq_source_len(src: &str) -> usize {
    src.find(|c: char| c != '=' && !is_js_whitespace(c))
        .unwrap_or(src.len())
}

#[derive(Default)]
pub struct NoSpacesAroundEqualSignsInAttribute;

impl NoSpacesAroundEqualSignsInAttribute {
    fn check(ctx: &mut LintContext, node_start: u32, node_end: u32) {
        let ke = key_end(ctx.source(), node_start, node_end);
        Self::check_eq_region(ctx, ke, node_end);
    }

    /// Verify the `^[\s=]*` region starting at `ke` (the oracle's key-range
    /// end) against `node_end`.
    fn check_eq_region(ctx: &mut LintContext, ke: u32, node_end: u32) {
        // Slice from key-end to node-end.
        let tail = ctx.slice(ke, node_end);
        let eq_len = eq_source_len(tail);
        let eq_src = &tail[..eq_len];
        // The rule is about spaces *around an equal sign*: only report when the
        // region actually contains a `=`. A shorthand attribute written with
        // inner spaces (`{ id }`) has a whitespace-only eq region (the key scan
        // stops at the space after `{`) but no `=`, so upstream — which measures
        // the gap between the key node and the value node — never reports it.
        if !eq_src.contains('=') || !eq_src.chars().any(is_js_whitespace) {
            return;
        }
        let eq_end = ke + u32::try_from(eq_len).expect("source offsets are represented as u32");
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

impl NoSpacesAroundEqualSignsInAttribute {
    /// The virtual `this=` on `<svelte:component>` / `<svelte:element>` is a
    /// `SvelteSpecialDirective` upstream, whose KEY range runs from `this` up to
    /// the `=` itself — so whitespace before the `=` is inside the key and only
    /// whitespace after the `=` is ever reported.
    fn check_this(ctx: &mut LintContext, el_start: u32) {
        let Some((this_start, this_end)) =
            crate::rules::this_attr::oracle_this_attr_span(ctx.source(), el_start)
        else {
            return;
        };
        let bytes = ctx.source().as_bytes();
        let Some(eq) = bytes[(this_start as usize + 4)..this_end as usize]
            .iter()
            .position(|&b| b == b'=')
            .map(|off| this_start + 4 + u32::try_from(off).expect("offsets fit u32"))
        else {
            return;
        };
        Self::check_eq_region(ctx, eq, this_end);
    }
}

impl Rule for NoSpacesAroundEqualSignsInAttribute {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_svelte_component(&self, ctx: &mut LintContext, el: &SvelteComponentElement) {
        Self::check_this(ctx, el.start);
    }

    fn check_svelte_dynamic_element(&self, ctx: &mut LintContext, el: &SvelteDynamicElement) {
        Self::check_this(ctx, el.start);
    }

    fn check_attribute(&self, ctx: &mut LintContext, attr: &Attribute) {
        match attr {
            // SpreadAttribute (`{...x}`) and AttachTag have no key=value
            // structure — skip them.
            Attribute::SpreadAttribute(_) | Attribute::AttachTag(_) => {}
            Attribute::Attribute(node) => Self::check(ctx, node.start, node.end),
            Attribute::BindDirective(node) => Self::check(ctx, node.start, node.end),
            Attribute::OnDirective(node) => Self::check(ctx, node.start, node.end),
            Attribute::ClassDirective(node) => Self::check(ctx, node.start, node.end),
            Attribute::StyleDirective(node) => Self::check(ctx, node.start, node.end),
            Attribute::TransitionDirective(node) => Self::check(ctx, node.start, node.end),
            Attribute::AnimateDirective(node) => Self::check(ctx, node.start, node.end),
            Attribute::UseDirective(node) => Self::check(ctx, node.start, node.end),
            Attribute::LetDirective(node) => Self::check(ctx, node.start, node.end),
        }
    }
}
