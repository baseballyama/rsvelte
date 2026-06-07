//! `svelte/no-at-debug-tags` — disallow `{@debug}` tags (debugging leftovers).
//! Port of the eslint-plugin-svelte rule; autofixable by removing the tag.

use rsvelte_core::ast::template::DebugTag;

use crate::context::LintContext;
use crate::diagnostic::{Fix, TextEdit};
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-at-debug-tags",
    category: RuleCategory::Style,
    fixable: Fixable::Code,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow `{@debug}` tags",
};

#[derive(Default)]
pub struct NoAtDebugTags;

impl Rule for NoAtDebugTags {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_debug_tag(&self, ctx: &mut LintContext, tag: &DebugTag) {
        ctx.report_with_fix(
            tag.start,
            tag.end,
            "Unexpected `{@debug}` tag",
            Fix {
                message: "Remove the `{@debug}` tag".to_string(),
                edits: vec![TextEdit {
                    start: tag.start,
                    end: tag.end,
                    new_text: String::new(),
                }],
            },
        );
    }
}
