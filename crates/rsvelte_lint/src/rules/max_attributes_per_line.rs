//! `svelte/max-attributes-per-line` — enforce the maximum number of attributes
//! per line on a start tag.
//!
//! Option (`options[0]`, an object):
//! - `singleline` (default `1`) — max attributes per line when the start tag
//!   fits on a single line.
//! - `multiline` (default `1`) — max attributes per line when the start tag
//!   spans multiple lines.
//!
//! When the count is exceeded for a line, the first attribute that exceeds the
//! limit is reported with the message "'{{name}}' should be on a new line."
//! The autofix replaces the whitespace between the previous token and the
//! offending attribute with a single newline.
//!
//! Port of `eslint-plugin-svelte/src/rules/max-attributes-per-line.ts`.
//! Upstream: `meta.fixable = 'whitespace'`, `type: 'layout'`.

use rsvelte_core::ast::template::{
    Attribute, Component, RegularElement, SlotElement, SvelteComponentElement,
    SvelteDynamicElement, SvelteElement,
};

use crate::context::LintContext;
use crate::diagnostic::{Fix, TextEdit};
use crate::line_index::LineIndex;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/max-attributes-per-line",
    category: RuleCategory::Formatting,
    fixable: Fixable::Code,
    default_severity: Severity::Off,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Enforce the maximum number of attributes per line",
    options_schema: Some(
        r#"[{"type":"object","properties":{"multiline":{"type":"number","minimum":1},"singleline":{"type":"number","minimum":1}},"additionalProperties":false}]"#,
    ),
};

/// Get the start of an attribute.
fn attr_start(a: &Attribute) -> u32 {
    match a {
        Attribute::Attribute(n) => n.start,
        Attribute::SpreadAttribute(n) => n.start,
        Attribute::AttachTag(n) => n.start,
        Attribute::BindDirective(n) => n.start,
        Attribute::OnDirective(n) => n.start,
        Attribute::ClassDirective(n) => n.start,
        Attribute::StyleDirective(n) => n.start,
        Attribute::TransitionDirective(n) => n.start,
        Attribute::AnimateDirective(n) => n.start,
        Attribute::UseDirective(n) => n.start,
        Attribute::LetDirective(n) => n.start,
    }
}

/// Get the end of an attribute.
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

/// Get a human-readable name for an attribute (mirrors upstream `report`).
fn attr_name(src: &str, a: &Attribute) -> String {
    let start = attr_start(a) as usize;
    let end = attr_end(a) as usize;
    if end <= start || end > src.len() {
        return String::new();
    }
    match a {
        // For spread attributes `{...x}` / attach tags `{@attach x}`, upstream
        // uses the full attribute text (the `else` branch of `report`).
        Attribute::SpreadAttribute(_) | Attribute::AttachTag(_) => {
            src.get(start..end).unwrap_or("").to_string()
        }
        // A plain/shorthand attribute: upstream slices `attribute.key.range`,
        // i.e. the key identifier. The structured `name` already holds it for
        // both `class="x"` (→ `class`) and the shorthand `{fileInfo}` (→
        // `fileInfo`); a text slice would stop at the leading `{` of a shorthand
        // and yield an empty name.
        Attribute::Attribute(node) => node.name.to_string(),
        // Directives (`bind:value`, `on:click`, `class:active`, …): upstream
        // slices the full `prefix:name` key range. The source up to the first
        // `=`, `{`, or whitespace reproduces it (directive keys never start with
        // `{`, so the slice is non-empty).
        _ => {
            let slice = src.get(start..end).unwrap_or("");
            let key_end = slice
                .find(|c: char| c == '=' || c == '{' || c.is_ascii_whitespace())
                .map(|off| start + off)
                .unwrap_or(end);
            src.get(start..key_end).unwrap_or("").to_string()
        }
    }
}

/// Find the end of the previous token before `attr_start` (the whitespace
/// between the previous token and this attribute will be replaced with `\n`).
fn prev_token_end(src: &[u8], el_start: u32, attr_start_off: u32) -> u32 {
    let mut pos = attr_start_off as usize;
    let lo = el_start as usize;
    while pos > lo {
        let b = src[pos - 1];
        if b != b' ' && b != b'\t' && b != b'\n' && b != b'\r' {
            break;
        }
        pos -= 1;
    }
    pos as u32
}

#[derive(Default)]
pub struct MaxAttributesPerLine;

impl MaxAttributesPerLine {
    fn check_tag(&self, ctx: &mut LintContext, el_start: u32, attributes: &[Attribute]) {
        if attributes.is_empty() {
            return;
        }

        let opt = ctx.option0();
        let multiline_max: u32 = opt
            .and_then(|v| v.get("multiline"))
            .and_then(|v| v.as_u64())
            .map(|n| n as u32)
            .unwrap_or(1);
        let singleline_max: u32 = opt
            .and_then(|v| v.get("singleline"))
            .and_then(|v| v.as_u64())
            .map(|n| n as u32)
            .unwrap_or(1);

        let li = LineIndex::new(ctx.source());

        // Determine singleline vs multiline: is the start-tag on one line?
        // Upstream uses `node.loc.start.line === node.loc.end.line`, where the
        // node is the SvelteStartTag. We approximate this: compare line of the
        // first attribute's start to line of the last attribute's end.
        let first_start = attr_start(attributes.first().unwrap());
        let last_end = attr_end(attributes.last().unwrap());
        let is_single = li.line(first_start) == li.line(last_end);

        let src = ctx.source();
        let src_bytes = src.as_bytes();

        if is_single {
            // Single-line: if more than singleline_max attributes, report the
            // (singleline_max)th attribute (0-indexed: index singleline_max).
            if attributes.len() as u32 > singleline_max {
                let attr = &attributes[singleline_max as usize];
                let start = attr_start(attr);
                let end = attr_end(attr);
                let name = attr_name(src, attr);
                let prev_end = prev_token_end(src_bytes, el_start, start);
                ctx.report_with_fix(
                    start,
                    end,
                    format!("'{name}' should be on a new line."),
                    Fix {
                        message: format!("Move '{name}' to new line"),
                        edits: vec![TextEdit {
                            start: prev_end,
                            end: start,
                            new_text: "\n".to_string(),
                        }],
                    },
                );
            }
        } else {
            // Multi-line: group attributes by line, report any line that has
            // more than multiline_max attributes.
            //
            // Upstream `groupAttributesByLine` groups attributes sharing the
            // same line. We replicate this by checking consecutive attributes
            // that share a line.
            let mut i = 0;
            while i < attributes.len() {
                let line = li.line(attr_start(&attributes[i]));
                let mut j = i + 1;
                while j < attributes.len() && li.line(attr_start(&attributes[j])) == line {
                    j += 1;
                }
                // attributes[i..j] are all on the same line.
                let count = (j - i) as u32;
                if count > multiline_max {
                    let attr = &attributes[i + multiline_max as usize];
                    let start = attr_start(attr);
                    let end = attr_end(attr);
                    let name = attr_name(src, attr);
                    let prev_end = prev_token_end(src_bytes, el_start, start);
                    ctx.report_with_fix(
                        start,
                        end,
                        format!("'{name}' should be on a new line."),
                        Fix {
                            message: format!("Move '{name}' to new line"),
                            edits: vec![TextEdit {
                                start: prev_end,
                                end: start,
                                new_text: "\n".to_string(),
                            }],
                        },
                    );
                }
                i = j;
            }
        }
    }
}

impl Rule for MaxAttributesPerLine {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_element(&self, ctx: &mut LintContext, el: &RegularElement) {
        self.check_tag(ctx, el.start, &el.attributes);
    }

    fn check_component(&self, ctx: &mut LintContext, c: &Component) {
        self.check_tag(ctx, c.start, &c.attributes);
    }

    fn check_svelte_element(&self, ctx: &mut LintContext, el: &SvelteElement) {
        self.check_tag(ctx, el.start, &el.attributes);
    }

    fn check_svelte_component(&self, ctx: &mut LintContext, el: &SvelteComponentElement) {
        self.check_tag(ctx, el.start, &el.attributes);
    }

    fn check_svelte_dynamic_element(&self, ctx: &mut LintContext, el: &SvelteDynamicElement) {
        self.check_tag(ctx, el.start, &el.attributes);
    }

    fn check_slot(&self, ctx: &mut LintContext, el: &SlotElement) {
        self.check_tag(ctx, el.start, &el.attributes);
    }
}
