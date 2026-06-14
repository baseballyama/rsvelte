//! `svelte/no-at-debug-tags` — disallow `{@debug}` tags (debugging leftovers).
//! Port of the eslint-plugin-svelte rule. Upstream is **not** autofixable
//! (`meta.fixable` unset); it offers a *suggestion* (`hasSuggestions: true`)
//! that removes the tag, so we mirror that exactly — `--fix` leaves the tag in
//! place and the editor offers "Remove `{@debug}` from the source".

use rsvelte_core::ast::template::DebugTag;

use crate::context::LintContext;
use crate::diagnostic::{Fix, Suggestion, TextEdit};
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-at-debug-tags",
    category: RuleCategory::Style,
    fixable: Fixable::Suggestion,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow `{@debug}` tags",
    options_schema: None,
};

#[derive(Default)]
pub struct NoAtDebugTags;

impl Rule for NoAtDebugTags {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_debug_tag(&self, ctx: &mut LintContext, tag: &DebugTag) {
        // Upstream `suggest: [{ messageId: 'suggestRemove', fix: fixer.remove(node) }]`.
        let remove = "Remove `{@debug}` from the source";
        ctx.report_with_suggestions(
            tag.start,
            tag.end,
            "Unexpected `{@debug}`.",
            vec![Suggestion {
                desc: remove.to_string(),
                fix: Fix {
                    message: remove.to_string(),
                    edits: vec![TextEdit {
                        start: tag.start,
                        end: tag.end,
                        new_text: String::new(),
                    }],
                },
            }],
        );
    }
}
