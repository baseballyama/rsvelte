//! `svelte/no-dupe-use-directives`.
//!
//! `svelte/no-dupe-use-directives` — flag duplicate `use:` (action) directives
//! on the same start tag. Two `use:` directives are duplicates when they share
//! the same key (`use:` + name) AND their expressions are token-equal (same
//! tokens ignoring comments and whitespace); a directive with no expression
//! only duplicates another with no expression.
//!
//! Port of the eslint-plugin-svelte rule.
//!
//! Mirrors `no-dupe-on-directives` but for `UseDirective` (which, unlike event
//! handlers, has no modifiers — the key is purely `use:<name>`).

use rsvelte_core::ast::template::{
    Attribute, Component, RegularElement, SlotElement, SvelteComponentElement,
    SvelteDynamicElement, SvelteElement, UseDirective,
};

use crate::context::LintContext;
use crate::rule::{
    Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity, SpecialElement,
};
use crate::rules::js_tokens::equal_tokens;

static META: RuleMeta = RuleMeta {
    name: "svelte/no-dupe-use-directives",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Error,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow duplicate `use:` directives",
    options_schema: None,
};

#[derive(Default)]
pub struct NoDupeUseDirectives;

impl NoDupeUseDirectives {
    fn check_start_tag(ctx: &mut LintContext, attributes: &[Attribute]) {
        // `use:` directives in source order.
        let directives: Vec<&UseDirective> = attributes
            .iter()
            .filter_map(|a| match a {
                Attribute::UseDirective(d) => Some(d),
                _ => None,
            })
            .collect();

        if directives.len() < 2 {
            return;
        }

        // Group by (key text, token-equal handler expression).
        let mut groups: Vec<(String, Handler<'_>, Vec<usize>)> = Vec::new();

        for (i, d) in directives.iter().enumerate() {
            let key_text = format!("use:{}", d.name.as_str());
            let handler = d.expression.as_ref().map_or(Handler::None, |expr| {
                match (expr.start(), expr.end()) {
                    (Some(s), Some(e2)) => Handler::Source(ctx.slice(s, e2)),
                    _ => Handler::Unknown,
                }
            });

            if let Some(group) = groups
                .iter_mut()
                .find(|(k, h, _)| *k == key_text && h.matches(&handler))
            {
                group.2.push(i);
            } else {
                groups.push((key_text, handler, vec![i]));
            }
        }

        for (key_text, _handler, members) in &groups {
            if members.len() < 2 {
                continue;
            }
            for &idx in members {
                let node = directives[idx];
                // lineNo is the line of the OTHER duplicate: members[0] unless
                // this node IS members[0], then members[1].
                let other_idx = if members[0] == idx {
                    members[1]
                } else {
                    members[0]
                };
                let line_no = line_of(ctx.source(), directives[other_idx].start);
                ctx.report(
                    node.start,
                    node.end,
                    format!(
                        "This `{key_text}` directive is the same and duplicate directives in L{line_no}."
                    ),
                );
            }
        }
    }
}

impl Rule for NoDupeUseDirectives {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_element(&self, ctx: &mut LintContext, el: &RegularElement) {
        Self::check_start_tag(ctx, &el.attributes);
    }

    fn check_component(&self, ctx: &mut LintContext, c: &Component) {
        Self::check_start_tag(ctx, &c.attributes);
    }

    fn check_svelte_element(&self, ctx: &mut LintContext, el: &SvelteElement) {
        Self::check_start_tag(ctx, &el.attributes);
    }

    fn check_svelte_component(&self, ctx: &mut LintContext, el: &SvelteComponentElement) {
        Self::check_start_tag(ctx, &el.attributes);
    }

    fn check_svelte_dynamic_element(&self, ctx: &mut LintContext, el: &SvelteDynamicElement) {
        Self::check_start_tag(ctx, &el.attributes);
    }

    fn check_slot(&self, ctx: &mut LintContext, el: &SlotElement) {
        Self::check_start_tag(ctx, &el.attributes);
    }

    fn check_special_element(&self, ctx: &mut LintContext, el: &SpecialElement<'_>) {
        Self::check_start_tag(ctx, &el.attributes);
    }
}

/// The action expression of one directive, compared the way upstream's `find`
/// compares them: a missing expression matches only another missing one, and two
/// present ones match when their token streams are equal.
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn line_of_counts_newlines() {
        assert_eq!(line_of("a\nb\nc", 0), 1);
        assert_eq!(line_of("a\nb\nc", 2), 2);
        assert_eq!(line_of("a\nb\nc", 4), 3);
    }

    #[test]
    fn line_of_counts_a_lone_cr() {
        assert_eq!(line_of("a\rb\rc", 2), 2);
        assert_eq!(line_of("a\rb\rc", 4), 3);
    }
}
