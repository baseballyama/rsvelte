//! `svelte/html-closing-bracket-new-line` — require or disallow a line break
//! before a tag's closing bracket (`>` or `/>`).
//!
//! Option (`options[0]`, an object):
//! - `singleline`: `"never"` (default) | `"always"` — when all attributes of
//!   the start tag fit on one line.
//! - `multiline`: `"always"` (default) | `"never"` — when the start tag spans
//!   multiple lines.
//! - `selfClosingTag` (optional object):
//!   - `singleline`: overrides the outer `singleline` for self-closing tags.
//!   - `multiline`: overrides the outer `multiline` for self-closing tags.
//!
//! The rule inspects the text between the last token before the closing
//! bracket and the bracket itself, counting `\n` characters to determine
//! `actual` line breaks. When `actual != expected` a finding is reported and
//! a fix replaces that span with the correct number of newlines.
//!
//! For end tags (`</div>`), adding a line break makes no sense, so fixes are
//! only emitted when we need to *remove* extra line breaks (`expected == 0`).
//!
//! Port of `eslint-plugin-svelte/src/rules/html-closing-bracket-new-line.ts`.
//! Upstream: `meta.fixable = 'code'`, `type: 'suggestion'`.

use rsvelte_core::ast::template::{
    Attribute, Component, RegularElement, SlotElement, SvelteComponentElement,
    SvelteDynamicElement, SvelteElement,
};

use crate::context::LintContext;
use crate::diagnostic::{Fix, TextEdit};
use crate::line_index::LineIndex;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/html-closing-bracket-new-line",
    category: RuleCategory::Formatting,
    fixable: Fixable::Code,
    default_severity: Severity::Off,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Require or disallow a line break before tag's closing brackets",
    options_schema: Some(
        r#"[{"type":"object","properties":{"singleline":{"enum":["always","never"]},"multiline":{"enum":["always","never"]},"selfClosingTag":{"type":"object","properties":{"singleline":{"enum":["always","never"]},"multiline":{"enum":["always","never"]}},"additionalProperties":false,"minProperties":1}},"additionalProperties":false}]"#,
    ),
};

/// Helper to get `end` from an `Attribute`.
fn attr_end(a: &Attribute) -> u32 {
    match a {
        Attribute::Attribute(n) => n.end,
        Attribute::SpreadAttribute(n) => n.end,
        Attribute::AttachTag(n) => n.end,
        Attribute::BindDirective(n) => n.end,
        Attribute::OnDirective(n) => n.end,
        Attribute::ClassDirective(n) => n.end,
        Attribute::StyleDirective(n) => n.end,
        Attribute::TransitionDirective(n) => n.end,
        Attribute::AnimateDirective(n) => n.end,
        Attribute::UseDirective(n) => n.end,
        Attribute::LetDirective(n) => n.end,
    }
}

/// Get the phrase for a count of line breaks (matching upstream `getPhrase`).
fn get_phrase(line_breaks: u32) -> String {
    match line_breaks {
        0 => "no line breaks".to_string(),
        1 => "1 line break".to_string(),
        n => format!("{n} line breaks"),
    }
}

/// Option value: whether a line break is expected.
#[derive(Clone, Copy, PartialEq, Eq)]
enum Expect {
    Always,
    Never,
}

/// Parsed rule options.
struct Options {
    singleline: Expect,
    multiline: Expect,
    self_closing_singleline: Option<Expect>,
    self_closing_multiline: Option<Expect>,
}

fn parse_expect(s: &str) -> Expect {
    if s == "always" {
        Expect::Always
    } else {
        Expect::Never
    }
}

fn load_options(ctx: &LintContext) -> Options {
    let opt = ctx.option0();
    let singleline = opt
        .and_then(|v| v.get("singleline"))
        .and_then(|v| v.as_str())
        .map(parse_expect)
        .unwrap_or(Expect::Never);
    let multiline = opt
        .and_then(|v| v.get("multiline"))
        .and_then(|v| v.as_str())
        .map(parse_expect)
        .unwrap_or(Expect::Always);
    let sc = opt.and_then(|v| v.get("selfClosingTag"));
    let self_closing_singleline = sc
        .and_then(|v| v.get("singleline"))
        .and_then(|v| v.as_str())
        .map(parse_expect);
    let self_closing_multiline = sc
        .and_then(|v| v.get("multiline"))
        .and_then(|v| v.as_str())
        .map(parse_expect);
    Options {
        singleline,
        multiline,
        self_closing_singleline,
        self_closing_multiline,
    }
}

/// Find the end offset of the start-tag's `>` or `/>`.
/// Returns `(bracket_end, is_self_closing)` or `None` if not found.
fn find_start_bracket(src: &[u8], scan_from: u32, el_end: u32) -> Option<(u32, bool)> {
    let mut i = scan_from as usize;
    while i < el_end as usize && i < src.len() {
        if src[i] == b'>' {
            let self_closing = i > 0 && src[i - 1] == b'/';
            return Some(((i + 1) as u32, self_closing));
        }
        i += 1;
    }
    None
}

/// Count newlines in a source slice `[from, to)`.
fn count_newlines(src: &[u8], from: u32, to: u32) -> u32 {
    let from = from as usize;
    let to = (to as usize).min(src.len());
    if from >= to {
        return 0;
    }
    src[from..to].iter().filter(|&&b| b == b'\n').count() as u32
}

#[derive(Default)]
pub struct HtmlClosingBracketNewLine;

impl HtmlClosingBracketNewLine {
    /// Check the start-tag bracket (`>` or `/>`).
    fn check_start_tag(
        &self,
        ctx: &mut LintContext,
        el_start: u32,
        el_end: u32,
        el_name_end: u32,
        attributes: &[Attribute],
    ) {
        let src = ctx.source().as_bytes();
        let scan_from = attributes.last().map(attr_end).unwrap_or(el_name_end);
        let Some((bracket_end, is_self_closing)) = find_start_bracket(src, scan_from, el_end)
        else {
            return;
        };
        // bracket_end points right after `>`. The `>` is at bracket_end - 1.
        let gt_pos = bracket_end - 1;
        // Position of `/` for self-closing, or `>` otherwise.
        let bracket_start = if is_self_closing { gt_pos - 1 } else { gt_pos };

        // The "between" zone: whitespace between the last token and `/>` or `>`.
        let between_end = bracket_start;
        // Find the end of the token before the whitespace.
        let prev_end = {
            let mut p = between_end as usize;
            while p > el_start as usize {
                let b = src[p - 1];
                if b != b' ' && b != b'\t' && b != b'\n' && b != b'\r' {
                    break;
                }
                p -= 1;
            }
            p as u32
        };

        // Determine singleline vs multiline.
        // Upstream: "singleline if tag start line == prevToken end line".
        let li = LineIndex::new(ctx.source());
        let tag_start_line = li.line(el_start);
        let prev_end_line = li.line(prev_end);
        let is_singleline = tag_start_line == prev_end_line;

        let opts = load_options(ctx);
        let expected = if is_self_closing {
            let sc_singleline = opts.self_closing_singleline.unwrap_or(opts.singleline);
            let sc_multiline = opts.self_closing_multiline.unwrap_or(opts.multiline);
            if is_singleline {
                sc_singleline
            } else {
                sc_multiline
            }
        } else if is_singleline {
            opts.singleline
        } else {
            opts.multiline
        };

        let expected_count = if expected == Expect::Always { 1 } else { 0 };
        let actual_count = count_newlines(src, prev_end, between_end);

        if actual_count == expected_count {
            return;
        }

        let message = format!(
            "Expected {} before closing bracket, but {} found.",
            get_phrase(expected_count),
            get_phrase(actual_count),
        );

        let new_text = "\n".repeat(expected_count as usize);
        ctx.report_with_fix(
            prev_end,
            bracket_start,
            message,
            Fix {
                message: "Fix closing bracket line break".to_string(),
                edits: vec![TextEdit {
                    start: prev_end,
                    end: between_end,
                    new_text,
                }],
            },
        );
    }

    /// Check the end-tag bracket (`>`). Only removes extra line breaks; never
    /// adds one (upstream: "For SvelteEndTag, does not make sense to add a
    /// line break, so we only fix if there are extra line breaks").
    fn check_end_tag(&self, ctx: &mut LintContext, el_end: u32, start_tag_end: u32) {
        // End tag runs from start_tag_end to el_end.
        // The `>` is the last char: el_end - 1.
        let src = ctx.source().as_bytes();

        // el_end points past the `>` so `>` is at el_end - 1.
        let gt_pos = el_end - 1;
        if src[gt_pos as usize] != b'>' {
            return;
        }

        // Find the start of the end tag (`<` of `</name`).
        // The end tag lives between start_tag_end and el_end.
        // Scan backwards from gt_pos to find `<`.
        let end_tag_start = {
            let mut p = gt_pos as usize;
            while p > start_tag_end as usize {
                if src[p] == b'<' {
                    break;
                }
                p -= 1;
            }
            p as u32
        };

        // Find the end of the token before the whitespace before `>`.
        // The end tag looks like `</name   >` — scan backwards from gt_pos.
        let between_end = gt_pos; // whitespace ends here (exclusive)
        let mut prev_end = between_end as usize;
        while prev_end > start_tag_end as usize {
            let b = src[prev_end - 1];
            if b != b' ' && b != b'\t' && b != b'\n' && b != b'\r' {
                break;
            }
            prev_end -= 1;
        }
        let prev_end = prev_end as u32;

        // Use the end-tag's own `<` as the "node start" for singleline detection,
        // mirroring upstream's `node.loc.start` for the SvelteEndTag node.
        let li = LineIndex::new(ctx.source());
        let end_tag_start_line = li.line(end_tag_start);
        let prev_end_line = li.line(prev_end);
        let is_singleline = end_tag_start_line == prev_end_line;

        let opts = load_options(ctx);
        let expected = if is_singleline {
            opts.singleline
        } else {
            opts.multiline
        };
        let expected_count = if expected == Expect::Always { 1 } else { 0 };
        let actual_count = count_newlines(src, prev_end, between_end);

        if actual_count == expected_count {
            return;
        }
        // For end tags, only report (and fix) when we need to REMOVE line breaks
        // (expected == 0). Upstream returns early when `expected != 0`.
        if expected_count != 0 {
            return;
        }

        let message = format!(
            "Expected {} before closing bracket, but {} found.",
            get_phrase(expected_count),
            get_phrase(actual_count),
        );

        ctx.report_with_fix(
            prev_end,
            gt_pos,
            message,
            Fix {
                message: "Fix closing bracket line break".to_string(),
                edits: vec![TextEdit {
                    start: prev_end,
                    end: between_end,
                    new_text: String::new(),
                }],
            },
        );
    }

    /// Shared logic for any element-like node.
    fn check_element_like(
        &self,
        ctx: &mut LintContext,
        el_start: u32,
        el_end: u32,
        el_name: &str,
        attributes: &[Attribute],
    ) {
        let el_name_end = el_start + 1 + el_name.len() as u32;
        self.check_start_tag(ctx, el_start, el_end, el_name_end, attributes);

        // Check end tag only when one exists (start tag does not span whole element).
        let src = ctx.source().as_bytes();
        let scan_from = attributes.last().map(attr_end).unwrap_or(el_name_end);
        if let Some((start_tag_end, _)) = find_start_bracket(src, scan_from, el_end)
            && start_tag_end < el_end
        {
            self.check_end_tag(ctx, el_end, start_tag_end);
        }
    }
}

impl Rule for HtmlClosingBracketNewLine {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_element(&self, ctx: &mut LintContext, el: &RegularElement) {
        self.check_element_like(ctx, el.start, el.end, el.name.as_str(), &el.attributes);
    }

    fn check_component(&self, ctx: &mut LintContext, c: &Component) {
        self.check_element_like(ctx, c.start, c.end, c.name.as_str(), &c.attributes);
    }

    fn check_svelte_element(&self, ctx: &mut LintContext, el: &SvelteElement) {
        self.check_element_like(ctx, el.start, el.end, el.name.as_str(), &el.attributes);
    }

    fn check_svelte_component(&self, ctx: &mut LintContext, el: &SvelteComponentElement) {
        self.check_element_like(ctx, el.start, el.end, "svelte:component", &el.attributes);
    }

    fn check_svelte_dynamic_element(&self, ctx: &mut LintContext, el: &SvelteDynamicElement) {
        self.check_element_like(ctx, el.start, el.end, "svelte:element", &el.attributes);
    }

    fn check_slot(&self, ctx: &mut LintContext, el: &SlotElement) {
        self.check_element_like(ctx, el.start, el.end, "slot", &el.attributes);
    }
}
