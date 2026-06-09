//! `svelte/no-at-const-tags` — prefer the `{const …}` declaration tag over the
//! legacy `{@const …}` tag. Port of the eslint-plugin-svelte rule. Only fires in
//! runes mode (the upstream rule's `runes === true` gate), since preserving
//! reactivity outside runes mode would require `$derived(...)`, unavailable
//! there.
//!
//! Detection-parity port: the finding (message + position) matches upstream; the
//! autofix (`{@const x = e}` → `{const x = $derived(e)}`) is not yet ported, so
//! the rule advertises `Fixable::No`.

use rsvelte_core::ast::template::ConstTag;

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-at-const-tags",
    category: RuleCategory::Style,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: true,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Prefer `{const ...}` over legacy `{@const ...}`",
    options_schema: None,
};

const MESSAGE: &str = "Use `{const ...}` declaration tag instead of legacy `{@const ...}`.";

/// Rune markers whose presence indicates the component is in runes mode. A crude
/// substring scan is sufficient: in non-runes components none of these appear.
const RUNE_MARKERS: &[&str] = &[
    "$state",
    "$derived",
    "$props",
    "$effect",
    "$bindable",
    "$inspect",
    "$host",
];

fn uses_runes(source: &str) -> bool {
    RUNE_MARKERS.iter().any(|m| source.contains(m))
        || source.contains("runes={true}")
        || source.contains("runes: true")
}

#[derive(Default)]
pub struct NoAtConstTags;

impl Rule for NoAtConstTags {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_const_tag(&self, ctx: &mut LintContext, tag: &ConstTag) {
        if !uses_runes(ctx.source()) {
            return;
        }
        // `tag.start` points at the `{` of `{@const …}`.
        ctx.report(tag.start, tag.start, MESSAGE);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn runes_detection() {
        assert!(uses_runes("<script>let x = $state(0);</script>"));
        assert!(uses_runes("<script>const d = $derived(x);</script>"));
        assert!(!uses_runes("<script>let items = [1,2,3];</script>"));
    }
}
