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
use crate::rule::{
    Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity, SpecialElement,
};

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

/// Reconstruct the `this={…}` attribute span from an optional inner-expression
/// span (`<svelte:element>` / `<svelte:component>`), or `None` when either end
/// is missing or the backward scan fails.
fn this_attr_span(src: &str, expr_start: Option<u32>, expr_end: Option<u32>) -> Option<(u32, u32)> {
    let (s, e) = (expr_start?, expr_end?);
    crate::rules::find_this_attr_span(src.as_bytes(), s, e)
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

/// One attribute (real or the spliced-in implicit `this`) in source order.
struct AttrItem {
    start: u32,
    end: u32,
    name: String,
}

/// Emit the "should be on a new line" report + whitespace-to-newline fix for
/// `item`.
fn report_item(ctx: &mut LintContext, item: &AttrItem, el_start: u32, src_bytes: &[u8]) {
    let name = &item.name;
    let prev_end = prev_token_end(src_bytes, el_start, item.start);
    ctx.report_with_fix(
        item.start,
        item.end,
        format!("'{name}' should be on a new line."),
        Fix {
            message: format!("Move '{name}' to new line"),
            edits: vec![TextEdit {
                start: prev_end,
                end: item.start,
                new_text: "\n".to_string(),
            }],
        },
    );
}

#[derive(Default)]
pub struct MaxAttributesPerLine;

impl MaxAttributesPerLine {
    /// `this_span` is the reconstructed `this={…}` span for
    /// `<svelte:element>` / `<svelte:component>`. svelte-eslint-parser keeps
    /// `this` in the attribute list (at its source position, which may be in the
    /// middle, e.g. `<svelte:element class this type>`), whereas rsvelte stores
    /// it outside `attributes`. We splice it back in at its source position so it
    /// participates in counting, line grouping, and reporting exactly like a
    /// normal attribute.
    fn check_tag(
        &self,
        ctx: &mut LintContext,
        el_start: u32,
        attributes: &[Attribute],
        this_span: Option<(u32, u32)>,
        generics_name: Option<&str>,
    ) {
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

        let src = ctx.source();

        // Build the source-ordered attribute list, splicing in the implicit
        // `this` at its real position.
        let mut items: Vec<AttrItem> = attributes
            .iter()
            .map(|a| {
                // On `<script>` a valid `generics="…"` is reported with its full
                // attribute text (svelte-eslint-parser's SvelteGenericsDirective);
                // an invalid one keeps the key-only name. `generics_name` carries
                // the full text when valid.
                let name = match a {
                    Attribute::Attribute(n) if n.name == "generics" => generics_name
                        .map(str::to_string)
                        .unwrap_or_else(|| attr_name(src, a)),
                    _ => attr_name(src, a),
                };
                AttrItem {
                    start: attr_start(a),
                    end: attr_end(a),
                    name,
                }
            })
            .collect();
        if let Some((s, e)) = this_span {
            let pos = items
                .iter()
                .position(|it| it.start > s)
                .unwrap_or(items.len());
            items.insert(
                pos,
                AttrItem {
                    start: s,
                    end: e,
                    name: "this".to_string(),
                },
            );
        }
        if items.is_empty() {
            return;
        }

        let li = LineIndex::new(src);
        let src_bytes = src.as_bytes();

        // Determine singleline vs multiline: is the start-tag on one line?
        // Upstream uses `node.loc.start.line === node.loc.end.line` (the
        // SvelteStartTag); we approximate via the first item's start line vs the
        // last item's end line.
        let is_single = li.line(items.first().unwrap().start) == li.line(items.last().unwrap().end);

        if is_single {
            // Single-line: more than singleline_max attributes ⇒ report the
            // (singleline_max)th (0-indexed) item.
            if items.len() as u32 > singleline_max {
                report_item(ctx, &items[singleline_max as usize], el_start, src_bytes);
            }
        } else {
            // Multi-line: group items sharing a line, report any line with more
            // than multiline_max items (`groupAttributesByLine`).
            let mut i = 0;
            while i < items.len() {
                let line = li.line(items[i].start);
                let mut j = i + 1;
                while j < items.len() && li.line(items[j].start) == line {
                    j += 1;
                }
                let count = (j - i) as u32;
                if count > multiline_max {
                    report_item(ctx, &items[i + multiline_max as usize], el_start, src_bytes);
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
        self.check_tag(ctx, el.start, &el.attributes, None, None);
    }

    fn check_component(&self, ctx: &mut LintContext, c: &Component) {
        self.check_tag(ctx, c.start, &c.attributes, None, None);
    }

    fn check_svelte_element(&self, ctx: &mut LintContext, el: &SvelteElement) {
        self.check_tag(ctx, el.start, &el.attributes, None, None);
    }

    fn check_svelte_component(&self, ctx: &mut LintContext, el: &SvelteComponentElement) {
        // `<svelte:component this={…}>` — the `this` expression is stored
        // separately; reconstruct its span so it counts as the leading attribute.
        let this_span = this_attr_span(ctx.source(), el.expression.start(), el.expression.end());
        self.check_tag(ctx, el.start, &el.attributes, this_span, None);
    }

    fn check_svelte_dynamic_element(&self, ctx: &mut LintContext, el: &SvelteDynamicElement) {
        // `<svelte:element this={…}>` — same as svelte:component, via `el.tag`.
        let this_span = this_attr_span(ctx.source(), el.tag.start(), el.tag.end());
        self.check_tag(ctx, el.start, &el.attributes, this_span, None);
    }

    fn check_slot(&self, ctx: &mut LintContext, el: &SlotElement) {
        self.check_tag(ctx, el.start, &el.attributes, None, None);
    }

    fn check_special_element(&self, ctx: &mut LintContext, el: &SpecialElement<'_>) {
        // On `<script>`, svelte-eslint-parser types a *valid* `generics="…"` as a
        // `SvelteGenericsDirective` whose message uses the full attribute text,
        // but keeps an *invalid* one as a `SvelteAttribute` (key-only message).
        // Decide which by parsing the value as TS; pass the full text when valid.
        let generics_name = generics_report_name(ctx.source(), &el.attributes);
        self.check_tag(
            ctx,
            el.start,
            &el.attributes,
            None,
            generics_name.as_deref(),
        );
    }
}

/// If the start tag has a `generics="…"` attribute whose value is syntactically
/// valid TypeScript type parameters, return its full attribute text
/// (`generics="…"`) — the name svelte-eslint-parser reports for a
/// `SvelteGenericsDirective`. Returns `None` for no generics attribute or an
/// invalid value (where the key-only `generics` name applies).
fn generics_report_name(src: &str, attributes: &[Attribute]) -> Option<String> {
    let (start, end) = attributes.iter().find_map(|a| match a {
        Attribute::Attribute(n) if n.name == "generics" => Some((n.start, n.end)),
        _ => None,
    })?;
    let full = src.get(start as usize..end as usize)?;
    // The value is between the first and last double-quote of `generics="…"`.
    let q1 = full.find('"')?;
    let q2 = full.rfind('"')?;
    if q2 <= q1 {
        return None;
    }
    let value = &full[q1 + 1..q2];
    let wrapped = format!("type __RsvelteGenerics<{value}> = unknown;");
    if rsvelte_core::compiler::phases::ts_snippet_is_valid(&wrapped, true) {
        Some(full.to_string())
    } else {
        None
    }
}
