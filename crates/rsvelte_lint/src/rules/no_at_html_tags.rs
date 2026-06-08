//! `svelte/no-at-html-tags` — disallow `{@html ...}`, which bypasses Svelte's
//! escaping and is a common XSS vector. Port of the eslint-plugin-svelte rule
//! of the same name (a pure-syntactic, AST-only check).

use rsvelte_core::ast::template::HtmlTag;

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-at-html-tags",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow use of `{@html}` to prevent XSS attacks",
    options_schema: None,
};

#[derive(Default)]
pub struct NoAtHtmlTags;

impl Rule for NoAtHtmlTags {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_html_tag(&self, ctx: &mut LintContext, tag: &HtmlTag) {
        ctx.report_with_help(
            tag.start,
            tag.end,
            "`{@html}` can lead to XSS attack.",
            "Ensure the value is trusted/sanitized, or render it without `{@html}`.",
        );
    }
}
