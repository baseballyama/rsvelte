//! `svelte/no-dupe-on-directives`.
//!
//! `svelte/no-dupe-on-directives` — disallow duplicate `on:` directives on the
//! same start tag. Two `on:event` directives are duplicates when they share the
//! same event type AND a token-equal handler expression (modifiers are
//! irrelevant; a bare `on:event` with no expression only matches another bare
//! `on:event`).
//!
//! Port of the eslint-plugin-svelte rule.
//!
//! Detection is per start-tag, and upstream visits every `SvelteStartTag`, so
//! every element hook has to run the same helper — a `<svelte:window>` start tag
//! is as much a start tag as a `<div>` one.

use rsvelte_core::ast::template::{
    Attribute, Component, OnDirective, RegularElement, SlotElement, SvelteComponentElement,
    SvelteDynamicElement, SvelteElement,
};

use crate::context::LintContext;
use crate::rule::{
    Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity, SpecialElement,
};
use crate::rules::js_tokens::equal_tokens;

static META: RuleMeta = RuleMeta {
    name: "svelte/no-dupe-on-directives",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Error,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow duplicate `on:` directives",
    options_schema: None,
};

/// The handler expression of one directive, as upstream's `find` compares them:
/// a missing expression matches only another missing one, and two present ones
/// match when their token streams are equal.
enum Handler<'a> {
    None,
    Source(&'a str),
    /// A present expression whose span could not be recovered — never equal to
    /// anything, since treating it as `None` would match bare directives.
    Unknown,
}

impl Handler<'_> {
    fn matches(&self, other: &Self) -> bool {
        match (self, other) {
            (Self::None, Self::None) => true,
            (Self::Source(a), Self::Source(b)) => equal_tokens(a, b),
            _ => false,
        }
    }
}

/// 1-based line number of the byte `offset` within `source`, under the line
/// convention the reported `loc` uses — a lone `\r` terminates a line, which
/// counting `\n` alone misses.
fn line_of(source: &str, offset: u32) -> usize {
    crate::line_index::LineIndex::new(source).line(offset) as usize
}

#[derive(Default)]
pub struct NoDupeOnDirectives;

impl NoDupeOnDirectives {
    fn check_attributes(ctx: &mut LintContext, attributes: &[Attribute]) {
        // Group on:directives by event type (in source order), then sub-group
        // by token-equal handler expression. Each sub-group keeps the indices
        // of its directives (into a flat list of OnDirective refs).
        let directives: Vec<&OnDirective> = attributes
            .iter()
            .filter_map(|a| match a {
                Attribute::OnDirective(on) => Some(on),
                _ => None,
            })
            .collect();

        // (event type, handler) -> list of directive indices. Source order is
        // preserved by iterating `directives` in order and pushing into the
        // matching sub-group, mirroring upstream's Map.
        let mut groups: Vec<(&str, Handler<'_>, Vec<usize>)> = Vec::new();

        for (idx, on) in directives.iter().enumerate() {
            let ty = on.name.as_str();
            let handler = on.expression.as_ref().map_or(Handler::None, |expr| {
                match (expr.start(), expr.end()) {
                    (Some(s), Some(e)) => Handler::Source(ctx.slice(s, e)),
                    _ => Handler::Unknown,
                }
            });

            if let Some(group) = groups
                .iter_mut()
                .find(|(g_ty, g_handler, _)| *g_ty == ty && g_handler.matches(&handler))
            {
                group.2.push(idx);
            } else {
                groups.push((ty, handler, vec![idx]));
            }
        }

        for (_ty, _handler, members) in &groups {
            if members.len() < 2 {
                continue;
            }
            for &m in members {
                let on = directives[m];
                // lineNo: the line of the FIRST member if this is not the
                // first member, otherwise the line of the SECOND member.
                let other_idx = if members[0] == m {
                    members[1]
                } else {
                    members[0]
                };
                let line_no = line_of(ctx.source(), directives[other_idx].start);
                let ty = on.name.as_str();
                // Upstream reports the whole `SvelteDirective`, modifiers and
                // handler expression included.
                ctx.report(
                    on.start,
                    on.end,
                    format!(
                        "This `on:{ty}` directive is the same and duplicate directives in L{line_no}."
                    ),
                );
            }
        }
    }
}

impl Rule for NoDupeOnDirectives {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_element(&self, ctx: &mut LintContext, el: &RegularElement) {
        Self::check_attributes(ctx, &el.attributes);
    }

    fn check_component(&self, ctx: &mut LintContext, c: &Component) {
        Self::check_attributes(ctx, &c.attributes);
    }

    fn check_svelte_element(&self, ctx: &mut LintContext, el: &SvelteElement) {
        Self::check_attributes(ctx, &el.attributes);
    }

    fn check_svelte_component(&self, ctx: &mut LintContext, el: &SvelteComponentElement) {
        Self::check_attributes(ctx, &el.attributes);
    }

    fn check_svelte_dynamic_element(&self, ctx: &mut LintContext, el: &SvelteDynamicElement) {
        Self::check_attributes(ctx, &el.attributes);
    }

    fn check_slot(&self, ctx: &mut LintContext, el: &SlotElement) {
        Self::check_attributes(ctx, &el.attributes);
    }

    fn check_special_element(&self, ctx: &mut LintContext, el: &SpecialElement<'_>) {
        Self::check_attributes(ctx, &el.attributes);
    }
}

#[cfg(test)]
mod tests {
    use super::line_of;

    #[test]
    fn line_of_counts_newlines() {
        let src = "a\nb\nc";
        assert_eq!(line_of(src, 0), 1);
        assert_eq!(line_of(src, 2), 2);
        assert_eq!(line_of(src, 4), 3);
    }

    #[test]
    fn line_of_counts_a_lone_cr() {
        // The message embeds the other directive's line, and a CR-only file
        // still has lines.
        let src = "a\rb\rc";
        assert_eq!(line_of(src, 2), 2);
        assert_eq!(line_of(src, 4), 3);
    }
}
