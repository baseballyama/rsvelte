//! `svelte/first-attribute-linebreak` — enforce the location of the first
//! attribute on an element's opening tag.
//!
//! Option (`options[0]`, an object):
//! - `multiline`: `"below"` (default) | `"beside"` — where the first attribute
//!   should sit when the start tag spans multiple lines (the first and last
//!   attribute are on different lines).
//! - `singleline`: `"beside"` (default) | `"below"` — where the first attribute
//!   should sit when all attributes share a line.
//!
//! `"beside"` ⇒ the first attribute must be on the same line as the element
//! name; `"below"` ⇒ it must be on a later line. Mismatches are reported on the
//! first attribute and fixed by replacing the whitespace between the element
//! name (the token before the first attribute) and the first attribute with a
//! single space (`beside`) or newline (`below`).
//!
//! Port of `eslint-plugin-svelte/src/rules/first-attribute-linebreak.ts`.
//! Upstream: `meta.fixable = 'whitespace'`, `type: 'layout'`.

use rsvelte_core::ast::template::{
    Attribute, Component, RegularElement, SlotElement, SvelteComponentElement,
    SvelteDynamicElement, SvelteElement,
};

use crate::context::LintContext;
use crate::diagnostic::{Fix, TextEdit};
use crate::line_index::LineIndex;
use crate::rule::{
    Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity, SpecialElement,
};

static META: RuleMeta = RuleMeta {
    name: "svelte/first-attribute-linebreak",
    category: RuleCategory::Formatting,
    fixable: Fixable::Code,
    default_severity: Severity::Off,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Enforce the location of first attribute",
    options_schema: Some(
        r#"[{"type":"object","properties":{"multiline":{"enum":["below","beside"]},"singleline":{"enum":["below","beside"]}},"additionalProperties":false}]"#,
    ),
};

#[derive(Clone, Copy, PartialEq, Eq)]
enum Loc {
    Below,
    Beside,
}

const fn attr_start(a: &Attribute) -> u32 {
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

const fn attr_end(a: &Attribute) -> u32 {
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

#[derive(Default)]
pub struct FirstAttributeLinebreak;

impl FirstAttributeLinebreak {
    /// `el_start` is the element's `<`, `name` is the tag name. The token before
    /// the first attribute is the element name; its end offset is
    /// `el_start + 1 + name.len()`.
    fn check_tag(ctx: &mut LintContext, el_start: u32, name: &str, attributes: &[Attribute]) {
        let entries: Vec<(u32, u32)> = attributes
            .iter()
            .map(|a| (attr_start(a), attr_end(a)))
            .collect();
        Self::check_tag_entries(ctx, el_start, name, &entries);
    }

    /// Like [`check_tag`], but over pre-built `(start, end)` attribute spans —
    /// used to splice the virtual `this` attribute of `<svelte:component>` /
    /// `<svelte:element>` in at its source position.
    fn check_tag_entries(ctx: &mut LintContext, el_start: u32, name: &str, entries: &[(u32, u32)]) {
        let Some(&first) = entries.first() else {
            return;
        };
        let last = *entries.last().unwrap();

        let opt = ctx.option0();
        let multiline = if opt
            .and_then(|v| v.get("multiline"))
            .and_then(|v| v.as_str())
            == Some("beside")
        {
            Loc::Beside
        } else {
            Loc::Below
        };
        let singleline = if opt
            .and_then(|v| v.get("singleline"))
            .and_then(|v| v.as_str())
            == Some("below")
        {
            Loc::Below
        } else {
            Loc::Beside
        };

        let li = LineIndex::new(ctx.source());
        let first_start = first.0;
        let first_line = li.line(first_start);
        let last_line = li.line(last.1);
        // The element name's end offset → its line.
        let name_end = el_start
            + 1
            + u32::try_from(name.len()).expect("element-name widths are represented as u32");
        let name_line = li.line(name_end);

        let location = if first_line == last_line {
            singleline
        } else {
            multiline
        };

        match location {
            Loc::Beside => {
                if name_line == first_line {
                    return;
                }
            }
            Loc::Below => {
                if name_line < first_line {
                    return;
                }
            }
        }

        let message = match location {
            Loc::Beside => "Expected no linebreak before this attribute.",
            Loc::Below => "Expected a linebreak before this attribute.",
        };
        let replacement = match location {
            Loc::Beside => " ",
            Loc::Below => "\n",
        };

        ctx.report_with_fix(
            first_start,
            first.1,
            message,
            Fix {
                message: "Fix first-attribute linebreak".to_string(),
                edits: vec![TextEdit {
                    start: name_end,
                    end: first_start,
                    new_text: replacement.to_string(),
                }],
            },
        );
    }
}

impl Rule for FirstAttributeLinebreak {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_element(&self, ctx: &mut LintContext, el: &RegularElement) {
        Self::check_tag(ctx, el.start, el.name.as_str(), &el.attributes);
    }

    fn check_component(&self, ctx: &mut LintContext, c: &Component) {
        Self::check_tag(ctx, c.start, c.name.as_str(), &c.attributes);
    }

    fn check_slot(&self, ctx: &mut LintContext, el: &SlotElement) {
        Self::check_tag(ctx, el.start, "slot", &el.attributes);
    }

    fn check_svelte_element(&self, ctx: &mut LintContext, el: &SvelteElement) {
        Self::check_tag(ctx, el.start, el.name.as_str(), &el.attributes);
    }

    fn check_svelte_component(&self, ctx: &mut LintContext, el: &SvelteComponentElement) {
        let entries = entries_with_this(ctx.source(), &el.attributes, el.start);
        Self::check_tag_entries(ctx, el.start, "svelte:component", &entries);
    }

    fn check_svelte_dynamic_element(&self, ctx: &mut LintContext, el: &SvelteDynamicElement) {
        let entries = entries_with_this(ctx.source(), &el.attributes, el.start);
        Self::check_tag_entries(ctx, el.start, "svelte:element", &entries);
    }

    fn check_special_element(&self, ctx: &mut LintContext, el: &SpecialElement<'_>) {
        // svelte-eslint-parser extracts <script>/<style> blocks with a literal
        // `</script>` / `</style>` end-tag regex; when the end tag is written
        // differently (`</style\n>`) the block is not found and the start tag's
        // attributes come out EMPTY — so the oracle reports nothing for them.
        if (el.name == "script" || el.name == "style")
            && !special_end_tag_is_literal(ctx.source(), el)
        {
            return;
        }
        Self::check_tag(ctx, el.start, el.name, &el.attributes);
    }
}

/// Build `(start, end)` attribute entries with the reconstructed `this={…}`
/// attribute spliced in at its source position.
fn entries_with_this(src: &str, attributes: &[Attribute], el_start: u32) -> Vec<(u32, u32)> {
    let mut entries: Vec<(u32, u32)> = attributes
        .iter()
        .map(|a| (attr_start(a), attr_end(a)))
        .collect();
    if let Some(span) = crate::rules::this_attr::oracle_this_attr_span(src, el_start) {
        let pos = entries
            .iter()
            .position(|&(start, _)| start > span.0)
            .unwrap_or(entries.len());
        entries.insert(pos, span);
    }
    entries
}

/// Whether the special element's end tag is the literal `</name>` the oracle's
/// block-extraction regex requires (case-insensitive, per its `/giu` flags).
fn special_end_tag_is_literal(src: &str, el: &SpecialElement<'_>) -> bool {
    let close = format!("</{}>", el.name);
    let end = el.end as usize;
    end >= close.len()
        && src
            .get(end - close.len()..end)
            .is_some_and(|t| t.eq_ignore_ascii_case(&close))
}
