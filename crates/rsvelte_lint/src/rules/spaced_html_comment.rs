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
use crate::rules::js_whitespace::{is_js_space_not_crlf, is_js_whitespace, js_trim};

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

#[derive(Default)]
pub struct SpacedHtmlComment;

impl Rule for SpacedHtmlComment {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_comment(&self, ctx: &mut LintContext, comment: &Comment) {
        let data = comment.data.as_str();

        // Skip blank comments (trimmed content is empty). Mirrors upstream:
        // `if (!node.value.trim()) return;` — JS trim, so U+FEFF is blank.
        if js_trim(data).is_empty() {
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
            if data.starts_with(|c: char| !is_js_whitespace(c)) {
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
            if data.ends_with(|c: char| !is_js_whitespace(c)) {
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
            // never: a leading non-line-terminator whitespace char → report.
            // Mirrors upstream `/^[^\S\n\r]/u.exec(node.value)?.[0]` — the
            // pattern has no quantifier, so it matches (and the fix removes)
            // exactly one character.
            let begin_space = data.chars().next().filter(|&c| is_js_space_not_crlf(c));
            if let Some(c) = begin_space {
                let remove_end = after_open
                    + u32::try_from(c.len_utf8()).expect("source offsets are represented as u32");
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

            // never: a trailing non-line-terminator whitespace char preceded
            // IMMEDIATELY by a non-whitespace character → report. Mirrors
            // upstream `/(?<=\S)[^\S\n\r]$/u` — again a single-character match,
            // so `x  ` (two trailing spaces) is NOT flagged (the lookbehind
            // sees a space).
            let last_ch = data.chars().next_back();
            if let Some(last) = last_ch.filter(|&c| is_js_space_not_crlf(c)) {
                let before_trail = &data[..data.len() - last.len_utf8()];
                if before_trail
                    .chars()
                    .next_back()
                    .is_some_and(|c| !is_js_whitespace(c))
                {
                    let remove_start = before_close
                        - u32::try_from(last.len_utf8())
                            .expect("source offsets are represented as u32");
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
