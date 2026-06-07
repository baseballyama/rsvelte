//! `svelte/require-each-key` — require a key on `{#each}` blocks. Keyed each
//! blocks let Svelte preserve component state and DOM identity across reorders.
//! Port of the eslint-plugin-svelte rule (pure-syntactic).

use rsvelte_core::ast::template::EachBlock;

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/require-each-key",
    category: RuleCategory::Style,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Require keyed `{#each}` blocks",
};

#[derive(Default)]
pub struct RequireEachKey;

impl Rule for RequireEachKey {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_each(&self, ctx: &mut LintContext, block: &EachBlock) {
        if block.key.is_some() {
            return;
        }
        // Point at the `{#each ...iterable...}` opener rather than the whole
        // block (which would span every child).
        let end = block.expression.end().unwrap_or(block.start);
        ctx.report(
            block.start,
            end.max(block.start),
            "Each block should have a key",
        );
    }
}
