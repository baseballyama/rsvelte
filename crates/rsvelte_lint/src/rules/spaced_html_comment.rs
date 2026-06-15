//! `svelte/spaced-html-comment` — enforce consistent spacing after `<!--` and
//! before `-->` in HTML comments.
//!
//! Option: `["always" | "never"]` (default `"always"`).
//!
//! **always** (default): every non-blank comment must have at least one space
//! or tab immediately after `<!--` and immediately before `-->`. A comment
//! whose trimmed content is empty is left alone.
//!
//! **never**: no space or tab (excluding `\n`/`\r`) is allowed immediately
//! after `<!--` or immediately before `-->` (again, only for non-blank
//! comments). Newline-only padding is allowed and not flagged.
//!
//! Port of `eslint-plugin-svelte/src/rules/spaced-html-comment.ts`.
//! Upstream: `meta.fixable = 'whitespace'`, `type: 'layout'`.

use rsvelte_core::ast::template::Comment;

use crate::context::LintContext;
use crate::diagnostic::{Fix, TextEdit};
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/spaced-html-comment",
    category: RuleCategory::Formatting,
    fixable: Fixable::Code,
    default_severity: Severity::Off,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Enforce consistent spacing after '<!--' and before '-->' in HTML comments",
    options_schema: Some(r#"[{"enum":["always","never"]}]"#),
};

/// Whether `c` is a horizontal whitespace character (space or tab) but NOT a
/// line terminator. Mirrors upstream's `[^\S\n\r]` character class.
#[inline]
fn is_h_space(c: char) -> bool {
    c == ' ' || c == '\t'
}

#[derive(Default)]
pub struct SpacedHtmlComment;

impl Rule for SpacedHtmlComment {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_comment(&self, ctx: &mut LintContext, comment: &Comment) {
        let data = comment.data.as_str();

        // Skip blank comments (trimmed content is empty). Mirrors upstream:
        // `if (!node.value.trim()) return;`
        if data.trim().is_empty() {
            return;
        }

        // Determine mode from options[0]. Default is "always".
        // The config array is `["always"]` or `["never"]`, so option0() returns
        // the string directly.
        let require_space = ctx.option0().and_then(|v| v.as_str()) != Some("never");

        // `comment.start` points to `<!--`, so:
        //   data after `<!--` starts at `comment.start + 4`
        //   data before `-->` ends at `comment.end - 3`
        let after_open = comment.start + 4; // byte offset of data[0]
        let before_close = comment.end - 3; // byte offset just after data's last byte

        if require_space {
            // always: data must START with whitespace (space/tab/newline all OK)
            if data.starts_with(|c: char| !c.is_whitespace()) {
                // Insert a single space immediately after `<!--`.
                ctx.report_with_fix(
                    comment.start,
                    comment.end,
                    "Expected space or tab after '<!--' in comment.",
                    Fix {
                        message: "Insert space after '<!--'".to_string(),
                        edits: vec![TextEdit {
                            start: after_open,
                            end: after_open,
                            new_text: " ".to_string(),
                        }],
                    },
                );
            }
            // always: data must END with whitespace
            if data.ends_with(|c: char| !c.is_whitespace()) {
                // Insert a single space immediately before `-->`.
                ctx.report_with_fix(
                    comment.start,
                    comment.end,
                    "Expected space or tab before '-->' in comment.",
                    Fix {
                        message: "Insert space before '-->'".to_string(),
                        edits: vec![TextEdit {
                            start: before_close,
                            end: before_close,
                            new_text: " ".to_string(),
                        }],
                    },
                );
            }
        } else {
            // never: leading horizontal whitespace (NOT \n/\r) → report
            // Mirrors upstream `/^[^\S\n\r]/u.exec(node.value)?.[0]`
            let begin_spaces: String = data.chars().take_while(|&c| is_h_space(c)).collect();
            if !begin_spaces.is_empty() {
                let remove_end = after_open + begin_spaces.len() as u32;
                ctx.report_with_fix(
                    comment.start,
                    comment.end,
                    "Unexpected space or tab after '<!--' in comment.",
                    Fix {
                        message: "Remove space after '<!--'".to_string(),
                        edits: vec![TextEdit {
                            start: after_open,
                            end: remove_end,
                            new_text: String::new(),
                        }],
                    },
                );
            }

            // never: trailing horizontal whitespace (space/tab but NOT \n/\r)
            // preceded IMMEDIATELY by a non-whitespace character → report.
            // Mirrors upstream `/(?<=\S)[^\S\n\r]$/u`.
            //
            // The regex matches when the LAST character of `data` is a space/tab
            // AND the character immediately before it is non-whitespace.
            // `comment ` → flagged; `comment\n    ` → NOT flagged (before trail
            // is `\n`).
            let last_ch = data.chars().next_back();
            if last_ch.is_some_and(is_h_space) {
                // Count how many trailing h-space bytes to remove.
                let trailing_bytes: usize = data
                    .bytes()
                    .rev()
                    .take_while(|&b| b == b' ' || b == b'\t')
                    .count();
                // The char immediately before the trailing h-spaces.
                let before_trail = &data[..data.len() - trailing_bytes];
                if before_trail
                    .chars()
                    .next_back()
                    .is_some_and(|c| !c.is_whitespace())
                {
                    let remove_start = before_close - trailing_bytes as u32;
                    ctx.report_with_fix(
                        comment.start,
                        comment.end,
                        "Unexpected space or tab before '-->' in comment.",
                        Fix {
                            message: "Remove space before '-->'".to_string(),
                            edits: vec![TextEdit {
                                start: remove_start,
                                end: before_close,
                                new_text: String::new(),
                            }],
                        },
                    );
                }
            }
        }
    }
}
