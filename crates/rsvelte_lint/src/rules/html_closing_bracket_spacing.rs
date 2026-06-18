//! `svelte/html-closing-bracket-spacing` — require or disallow a space before a
//! tag's closing bracket (`>` / `/>`).
//!
//! Option (`options[0]`, an object), each value `"always"` | `"never"` |
//! `"ignore"`:
//! - `startTag` (default `"never"`) — non-self-closing opening tags (`<p>`).
//! - `endTag` (default `"never"`) — closing tags (`</p>`).
//! - `selfClosingTag` (default `"always"`) — self-closing opening tags (`<br/>`).
//!
//! For each tag the rule isolates the trailing `(\s*)/?>` of the tag source. A
//! newline in that whitespace run makes the tag exempt. Otherwise `"always"`
//! requires (and inserts) exactly one space before `/?>` when none is present,
//! and `"never"` forbids (and removes) any whitespace there.
//!
//! Port of `eslint-plugin-svelte/src/rules/html-closing-bracket-spacing.ts`.
//! Upstream: `meta.fixable = 'whitespace'`, `type: 'layout'`.

use rsvelte_core::ast::template::{
    Attribute, Component, RegularElement, SlotElement, SvelteComponentElement,
    SvelteDynamicElement, SvelteElement,
};

use crate::context::LintContext;
use crate::diagnostic::{Fix, TextEdit};
use crate::rule::{
    Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity, SpecialElement,
};

static META: RuleMeta = RuleMeta {
    name: "svelte/html-closing-bracket-spacing",
    category: RuleCategory::Formatting,
    fixable: Fixable::Code,
    default_severity: Severity::Off,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Require or disallow a space before tag's closing brackets",
    options_schema: Some(
        r#"[{"type":"object","properties":{"startTag":{"enum":["always","never","ignore"]},"endTag":{"enum":["always","never","ignore"]},"selfClosingTag":{"enum":["always","never","ignore"]}},"additionalProperties":false}]"#,
    ),
};

#[derive(Clone, Copy, PartialEq, Eq)]
enum Mode {
    Always,
    Never,
    Ignore,
}

fn mode_of(ctx: &LintContext, key: &str, default: Mode) -> Mode {
    match ctx
        .option0()
        .and_then(|v| v.get(key))
        .and_then(|v| v.as_str())
    {
        Some("always") => Mode::Always,
        Some("never") => Mode::Never,
        Some("ignore") => Mode::Ignore,
        _ => default,
    }
}

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

/// The trailing `(\s*)/?>` of a tag whose closing `>` ends at `tag_end`
/// (exclusive). Returns `(spaces_start, spaces_len, has_newline)`, where the
/// whitespace run before the `/?>` is `[spaces_start, spaces_start +
/// spaces_len)` and `has_newline` is set when that run contains a line break.
fn trailing_match(src: &[u8], tag_end: u32) -> (u32, u32, bool) {
    // `>` is at tag_end - 1.
    let mut pos = tag_end as usize; // points just after `>`
    pos -= 1; // the `>`
    // optional `/`
    if pos > 0 && src[pos - 1] == b'/' {
        pos -= 1;
    }
    // collect preceding whitespace
    let spaces_end = pos; // exclusive end of whitespace run (== start of `/?>`)
    let mut spaces_start = spaces_end;
    let mut has_newline = false;
    while spaces_start > 0 {
        let b = src[spaces_start - 1];
        if b == b' ' || b == b'\t' || b == b'\n' || b == b'\r' || b == 0x0c {
            if b == b'\n' || b == b'\r' {
                has_newline = true;
            }
            spaces_start -= 1;
        } else {
            break;
        }
    }
    let spaces_len = (spaces_end - spaces_start) as u32;
    (spaces_start as u32, spaces_len, has_newline)
}

#[derive(Default)]
pub struct HtmlClosingBracketSpacing;

impl HtmlClosingBracketSpacing {
    fn check_tag(&self, ctx: &mut LintContext, mode: Mode, tag_end: u32) {
        if mode == Mode::Ignore {
            return;
        }
        let src = ctx.source().as_bytes();
        let (spaces_start, spaces_len, has_newline) = trailing_match(src, tag_end);
        if has_newline {
            return;
        }
        if mode == Mode::Always && spaces_len == 0 {
            // insert a space before `/?>`.
            ctx.report_with_fix(
                spaces_start,
                tag_end,
                "Expected space before '>', but not found.",
                Fix {
                    message: "Insert space before '>'".to_string(),
                    edits: vec![TextEdit {
                        start: spaces_start,
                        end: spaces_start,
                        new_text: " ".to_string(),
                    }],
                },
            );
        } else if mode == Mode::Never && spaces_len > 0 {
            // remove the whitespace run.
            ctx.report_with_fix(
                spaces_start,
                tag_end,
                "Expected no space before '>', but found.",
                Fix {
                    message: "Remove space before '>'".to_string(),
                    edits: vec![TextEdit {
                        start: spaces_start,
                        end: spaces_start + spaces_len,
                        new_text: String::new(),
                    }],
                },
            );
        }
    }
}

impl HtmlClosingBracketSpacing {
    /// Shared implementation for any element-like node.
    fn check_element_like(
        &self,
        ctx: &mut LintContext,
        el_start: u32,
        el_end: u32,
        el_name_len: usize,
        attributes: &[Attribute],
    ) {
        let src = ctx.source().as_bytes();

        // --- locate the start-tag closing `>` / `/>` ---
        // Scan from after the last attribute (or after the element name when
        // there are no attributes) for the first `>`. After the attribute list
        // only whitespace, an optional `/`, and the `>` remain, so a raw scan is
        // safe (no `>` inside attribute values can fool us).
        let name_end = el_start + 1 + el_name_len as u32;
        let scan_from = attributes.last().map(attr_end).unwrap_or(name_end);
        let mut i = scan_from as usize;
        let mut start_gt: Option<u32> = None;
        while i < src.len() {
            if src[i] == b'>' {
                start_gt = Some((i + 1) as u32);
                break;
            }
            i += 1;
        }
        let Some(start_tag_end) = start_gt else {
            return;
        };
        let self_closing = start_tag_end >= 2 && src[(start_tag_end - 2) as usize] == b'/';

        let start_mode = if self_closing {
            mode_of(ctx, "selfClosingTag", Mode::Always)
        } else {
            mode_of(ctx, "startTag", Mode::Never)
        };
        self.check_tag(ctx, start_mode, start_tag_end);

        // --- end tag (only when one exists) ---
        // A separate end tag exists iff the start tag does not span the whole
        // element. `el_end` is the byte after the element's final `>`.
        if start_tag_end < el_end {
            let end_mode = mode_of(ctx, "endTag", Mode::Never);
            self.check_tag(ctx, end_mode, el_end);
        }
    }
}

impl Rule for HtmlClosingBracketSpacing {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_element(&self, ctx: &mut LintContext, el: &RegularElement) {
        self.check_element_like(
            ctx,
            el.start,
            el.end,
            el.name.as_str().len(),
            &el.attributes,
        );
    }

    fn check_component(&self, ctx: &mut LintContext, c: &Component) {
        self.check_element_like(ctx, c.start, c.end, c.name.as_str().len(), &c.attributes);
    }

    fn check_slot(&self, ctx: &mut LintContext, el: &SlotElement) {
        self.check_element_like(ctx, el.start, el.end, "slot".len(), &el.attributes);
    }

    fn check_svelte_element(&self, ctx: &mut LintContext, el: &SvelteElement) {
        self.check_element_like(
            ctx,
            el.start,
            el.end,
            el.name.as_str().len(),
            &el.attributes,
        );
    }

    fn check_svelte_component(&self, ctx: &mut LintContext, el: &SvelteComponentElement) {
        self.check_element_like(
            ctx,
            el.start,
            el.end,
            "svelte:component".len(),
            &el.attributes,
        );
    }

    fn check_svelte_dynamic_element(&self, ctx: &mut LintContext, el: &SvelteDynamicElement) {
        self.check_element_like(
            ctx,
            el.start,
            el.end,
            "svelte:element".len(),
            &el.attributes,
        );
    }

    fn check_special_element(&self, ctx: &mut LintContext, el: &SpecialElement<'_>) {
        self.check_element_like(ctx, el.start, el.end, el.name.len(), &el.attributes);
    }
}
