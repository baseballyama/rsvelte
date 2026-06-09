//! Open-tag attribute normalization.
//!
//! Rewrites every element's open tag (`<tag attr1 attr2 ...>` or `... />`)
//! with one normalized form per element. The rewrite includes the
//! attribute list, so attribute-level expressions are formatted inline
//! and the separate "edit per attribute expression" path in
//! [`crate::expression`] is bypassed for everything inside an element's
//! open tag.
//!
//! What this module owns:
//! - Element open tags for every variant in [`TemplateNode`] that has
//!   attributes (`RegularElement`, `Component`, `SvelteComponent`,
//!   `SvelteElement`, `SlotElement`, `TitleElement`, plus the
//!   `Svelte*` special-element family).
//! - Attribute rendering (one space between attrs, normalized
//!   self-closing as ` />`, shorthand for `name={name}` and
//!   `bind:name={name}` / `class:name={name}`).
//! - `this={X}` expressions on `<svelte:component>` and
//!   `<svelte:element>` — they live in the open tag.
//!
//! What it does NOT own (those edits still come from
//! [`crate::expression`]):
//! - Template-position `{expr}`, `{@html ...}`, `{@render ...}`,
//!   `{@debug ...}`, `{@attach ...}` standalone tags
//! - Block headers (`{#if EXPR}`, `{#each ...}`, ...)
//! - Children fragments (recursed into separately by the caller)

use oxc_formatter::{JsFormatOptions, QuoteStyle};
use rsvelte_core::ast::js::Expression;
use rsvelte_core::ast::template::{
    Attribute, AttributeNode, AttributeValue, AttributeValuePart, ExpressionTag, Fragment, IfBlock,
    SpreadAttribute, TemplateNode,
};
use unicode_width::UnicodeWidthStr;

use crate::error::FormatError;
use crate::expression::format_attribute_value_expression;
use crate::indent::else_if_branch;
use crate::options::FormatOptions;

/// Walk a `Fragment` recursively and append open-tag rewrite edits for
/// every element with attributes. `depth` is the indent level at which
/// this fragment's elements render (the root call passes `0`).
pub(crate) fn collect_open_tag_edits(
    source: &str,
    fragment: &Fragment,
    depth: usize,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    for node in &fragment.nodes {
        collect_node_open_tag_edits(source, node, depth, options, edits)?;
    }
    Ok(())
}

fn collect_node_open_tag_edits(
    source: &str,
    node: &TemplateNode,
    depth: usize,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    match node {
        TemplateNode::RegularElement(elem) => {
            let wrapped = push_open_tag(
                source,
                elem.start,
                elem.name.as_str(),
                &elem.attributes,
                None,
                depth,
                options,
                edits,
            )?;
            push_close_tag(
                source,
                elem.end,
                elem.name.as_str(),
                wrapped,
                depth,
                options,
                edits,
            );
            collect_open_tag_edits(source, &elem.fragment, depth + 1, options, edits)?;
        }
        TemplateNode::Component(c) => {
            let wrapped = push_open_tag(
                source,
                c.start,
                c.name.as_str(),
                &c.attributes,
                None,
                depth,
                options,
                edits,
            )?;
            push_close_tag(
                source,
                c.end,
                c.name.as_str(),
                wrapped,
                depth,
                options,
                edits,
            );
            collect_open_tag_edits(source, &c.fragment, depth + 1, options, edits)?;
        }
        TemplateNode::TitleElement(t) => {
            let wrapped = push_open_tag(
                source,
                t.start,
                t.name.as_str(),
                &t.attributes,
                None,
                depth,
                options,
                edits,
            )?;
            push_close_tag(
                source,
                t.end,
                t.name.as_str(),
                wrapped,
                depth,
                options,
                edits,
            );
            collect_open_tag_edits(source, &t.fragment, depth + 1, options, edits)?;
        }
        TemplateNode::SlotElement(s) => {
            let wrapped = push_open_tag(
                source,
                s.start,
                s.name.as_str(),
                &s.attributes,
                None,
                depth,
                options,
                edits,
            )?;
            push_close_tag(
                source,
                s.end,
                s.name.as_str(),
                wrapped,
                depth,
                options,
                edits,
            );
            collect_open_tag_edits(source, &s.fragment, depth + 1, options, edits)?;
        }
        TemplateNode::SvelteHead(s)
        | TemplateNode::SvelteBody(s)
        | TemplateNode::SvelteDocument(s)
        | TemplateNode::SvelteFragment(s)
        | TemplateNode::SvelteBoundary(s)
        | TemplateNode::SvelteOptions(s)
        | TemplateNode::SvelteSelf(s)
        | TemplateNode::SvelteWindow(s) => {
            let wrapped = push_open_tag(
                source,
                s.start,
                s.name.as_str(),
                &s.attributes,
                None,
                depth,
                options,
                edits,
            )?;
            push_close_tag(
                source,
                s.end,
                s.name.as_str(),
                wrapped,
                depth,
                options,
                edits,
            );
            collect_open_tag_edits(source, &s.fragment, depth + 1, options, edits)?;
        }
        TemplateNode::SvelteComponent(c) => {
            let wrapped = push_open_tag(
                source,
                c.start,
                c.name.as_str(),
                &c.attributes,
                Some(&c.expression),
                depth,
                options,
                edits,
            )?;
            push_close_tag(
                source,
                c.end,
                c.name.as_str(),
                wrapped,
                depth,
                options,
                edits,
            );
            collect_open_tag_edits(source, &c.fragment, depth + 1, options, edits)?;
        }
        TemplateNode::SvelteElement(e) => {
            let wrapped = push_open_tag(
                source,
                e.start,
                e.name.as_str(),
                &e.attributes,
                Some(&e.tag),
                depth,
                options,
                edits,
            )?;
            push_close_tag(
                source,
                e.end,
                e.name.as_str(),
                wrapped,
                depth,
                options,
                edits,
            );
            collect_open_tag_edits(source, &e.fragment, depth + 1, options, edits)?;
        }
        // Blocks have child fragments but no attributes themselves.
        // Their bodies are conceptually one level deeper than the block.
        TemplateNode::IfBlock(blk) => {
            // `{:else if}` chains stay at the same depth as the opening `{#if}`
            // (svelte nests them as `elseif` IfBlocks in the alternate); follow
            // the chain instead of recursing so attributes don't gain an extra
            // indent level per branch. See `indent.rs::else_if_branch`.
            let mut current: &IfBlock = blk;
            loop {
                collect_open_tag_edits(source, &current.consequent, depth + 1, options, edits)?;
                match &current.alternate {
                    Some(alt) => match else_if_branch(alt) {
                        Some(chained) => current = chained,
                        None => {
                            collect_open_tag_edits(source, alt, depth + 1, options, edits)?;
                            break;
                        }
                    },
                    None => break,
                }
            }
        }
        TemplateNode::EachBlock(blk) => {
            collect_open_tag_edits(source, &blk.body, depth + 1, options, edits)?;
            if let Some(fb) = &blk.fallback {
                collect_open_tag_edits(source, fb, depth + 1, options, edits)?;
            }
        }
        TemplateNode::AwaitBlock(blk) => {
            if let Some(frag) = &blk.pending {
                collect_open_tag_edits(source, frag, depth + 1, options, edits)?;
            }
            if let Some(frag) = &blk.then {
                collect_open_tag_edits(source, frag, depth + 1, options, edits)?;
            }
            if let Some(frag) = &blk.catch {
                collect_open_tag_edits(source, frag, depth + 1, options, edits)?;
            }
        }
        TemplateNode::KeyBlock(blk) => {
            collect_open_tag_edits(source, &blk.fragment, depth + 1, options, edits)?;
        }
        TemplateNode::SnippetBlock(blk) => {
            collect_open_tag_edits(source, &blk.body, depth + 1, options, edits)?;
        }
        _ => {}
    }
    Ok(())
}

/// If the element isn't self-closing, normalize its closing tag to
/// `</tagname>` (no internal whitespace).
fn push_close_tag(
    source: &str,
    element_end: u32,
    tag_name: &str,
    open_wrapped: bool,
    depth: usize,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) {
    let Some((start, end)) = find_close_tag_span(source, element_end, tag_name) else {
        return;
    };
    // When the open tag wrapped and the element's content is whitespace-
    // sensitive inline content (the last content char touches the close tag
    // with no whitespace), prettier-plugin-svelte breaks the closing `>` onto
    // its own line at the element's indent (`</button\n>`) so the trailing
    // newline lands *inside* the close tag and no whitespace is added after the
    // content (#798).
    // Symmetric with `hug_open`: only break the close `>` when text content
    // touches it. A trailing `>` (the end of a child element `</child>`) is not
    // text, so the close `>` can break normally.
    let hug_close = open_wrapped
        && (start as usize)
            .checked_sub(1)
            .and_then(|i| source.as_bytes().get(i))
            .is_some_and(|&b| !b.is_ascii_whitespace() && b != b'>');
    if hug_close {
        let indent = indent_str(depth, &options.js);
        edits.push((start, end, format!("</{tag_name}\n{indent}>")));
    } else {
        edits.push((start, end, format!("</{tag_name}>")));
    }
}

/// Locate the element's closing tag `</tagname ...>` that ends exactly at
/// `element_end`. The close tag must be the text *immediately* ending at
/// `element_end`: `<`, `/`, the tag name, optional whitespace, then `>`.
///
/// This is deliberately strict. Self-closing / void elements (`<span />`,
/// `<br>`) have no close tag, so this returns `None` for them. An earlier
/// version scanned backward for *any* `</`, which would happily match the
/// `</` of a preceding `</script>` block or sibling element's close tag —
/// producing a bogus edit that overwrote everything in between (see #669).
fn find_close_tag_span(source: &str, element_end: u32, tag_name: &str) -> Option<(u32, u32)> {
    let bytes = source.as_bytes();
    let end = element_end as usize;
    if end == 0 || end > bytes.len() || bytes[end - 1] != b'>' {
        return None;
    }

    // Walk back over whitespace between the tag name and the closing `>`.
    let mut i = end - 1; // at '>'
    i = i.checked_sub(1)?;
    while matches!(bytes[i], b' ' | b'\t' | b'\n' | b'\r') {
        i = i.checked_sub(1)?;
    }

    // `bytes[i]` is now the last character of the tag name; match the name
    // backward (case-insensitively, matching HTML close-tag semantics).
    let name = tag_name.as_bytes();
    let name_end = i + 1;
    let name_start = name_end.checked_sub(name.len())?;
    if !bytes[name_start..name_end].eq_ignore_ascii_case(name) {
        return None;
    }

    // The tag name must be preceded by `</`.
    let slash = name_start.checked_sub(1)?;
    let lt = slash.checked_sub(1)?;
    if bytes[slash] != b'/' || bytes[lt] != b'<' {
        return None;
    }

    Some((lt as u32, end as u32))
}

/// Push one edit covering the element's open tag span (from `<` to the
/// `>` that closes the opener, inclusive). `this_expression` is the
/// reactive `this={X}` expression carried by `<svelte:component>` and
/// `<svelte:element>` — emitted as the first attribute when present so
/// the rendering is independent of where the parser placed it in the
/// source.
///
/// Two rendering shapes are considered:
/// - **One-line** — `<tag attr1 attr2 ...>` / `<tag attr1 .../>`. Used
///   when the rendered tag plus the parent indent fits within
///   `options.js.line_width`.
/// - **Multi-line** — `<tag\n  attr1\n  attr2\n>` / `<tag\n  ...\n/>`.
///   Each attribute on its own line at `depth + 1` indent, the closing
///   `>` (or `/>`) on a new line at `depth` indent. Used when the
///   one-liner would overflow.
///
/// Returns `true` when the open tag was rendered in the wrapped (multi-line)
/// shape — the caller threads this into [`push_close_tag`] so the closing `>`
/// of a whitespace-sensitive inline element can break onto its own line.
#[allow(clippy::too_many_arguments)]
fn push_open_tag(
    source: &str,
    element_start: u32,
    tag_name: &str,
    attributes: &[Attribute],
    this_expression: Option<&Expression>,
    depth: usize,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<bool, FormatError> {
    let Some(open_tag_end) = find_open_tag_end(source, element_start, attributes) else {
        return Ok(false);
    };

    // Void HTML elements (`<input>`, `<br>`, `<hr>`, …) have no closing tag;
    // prettier-plugin-svelte normalizes them to the self-closing ` />` form
    // even when the source omits the slash.
    let self_closing = is_self_closing(source, open_tag_end) || is_void_element(tag_name);

    // When the open tag wraps, the closing `>` normally lands on its own line at
    // the outer indent. But if the element's content is whitespace-sensitive
    // inline content (the first content char touches the `>` with no
    // whitespace), moving the `>` to its own line would inject significant
    // whitespace before the content — so prettier-plugin-svelte keeps the `>`
    // glued to the last attribute (`}}>text`) instead (#798).
    // Only text content (not a child element `<…>` and not an empty element
    // whose `>` is immediately followed by its own `</tag>`) is treated as
    // whitespace-sensitive here — matching #798's "inline text children". A
    // leading `<` means the next thing is a tag, so the `>` can safely break.
    let hug_open = !self_closing
        && source
            .as_bytes()
            .get(open_tag_end as usize)
            .is_some_and(|&b| !b.is_ascii_whitespace() && b != b'<');

    // Build the list of fully-rendered open-tag items (attributes plus any
    // comments interleaved between them), each tagged with its source
    // position so the rendering order matches the source. Comments inside an
    // element's open tag are owned by this rewrite, so they'd be silently
    // dropped if we rebuilt the tag from the attribute list alone (#685).
    let mut items: Vec<(u32, String)> = Vec::with_capacity(attributes.len() + 1);

    // When the open tag wraps, each attribute renders at `depth + 1` indent, so
    // its value expression must make its wrap decision against a width narrowed
    // by that lead (#795).
    let attr_depth = depth + 1;

    if let Some(expr) = this_expression
        && let Some(formatted) = format_expression_at(source, expr, options, attr_depth)?
    {
        // `this={X}` is emitted first regardless of source position.
        items.push((element_start, format!("this={{{formatted}}}")));
    }

    for attr in attributes {
        let (attr_start, _) = attribute_span(attr);
        items.push((
            attr_start,
            render_attribute(attr, source, options, attr_depth)?,
        ));
    }

    let comments = collect_open_tag_comments(source, element_start, open_tag_end, attributes);
    let has_line_comment = comments.iter().any(|c| c.is_line);
    for c in comments {
        items.push((c.start, c.text));
    }

    items.sort_by_key(|(start, _)| *start);
    let rendered_attrs: Vec<String> = items.into_iter().map(|(_, text)| text).collect();

    let one_liner = render_one_line(tag_name, &rendered_attrs, self_closing);

    let leading_indent_width = indent_visual_width(depth, &options.js);
    let line_width = options.js.line_width.value() as usize;

    // A multi-line attribute value (e.g. a multi-line arrow handler or a
    // `bind:` getter/setter pair) can't sit on a single tag line — its
    // continuation lines would collapse toward column 0 instead of aligning
    // under the attribute. Force the multi-line shape so each attribute lands
    // on its own line and its continuation lines are re-indented to the
    // attribute column (#692).
    let any_multiline_attr = rendered_attrs.iter().any(|a| a.contains('\n'));

    // A `//` line comment can't share a line with the closing `>` (it would
    // comment out the rest of the tag), so any line comment forces the
    // multi-line shape.
    let fits_one_line = !has_line_comment
        && !any_multiline_attr
        && leading_indent_width + visual_width(&one_liner) <= line_width;

    let wrapped = !(rendered_attrs.is_empty() || fits_one_line);
    let rendered = if wrapped {
        render_multi_line(
            tag_name,
            &rendered_attrs,
            self_closing,
            depth,
            &options.js,
            hug_open,
        )
    } else {
        one_liner
    };

    edits.push((element_start, open_tag_end, rendered));
    Ok(wrapped)
}

/// A comment found between attributes inside an element's open tag.
struct OpenTagComment {
    start: u32,
    text: String,
    is_line: bool,
}

/// Scan the open-tag region for `//` and `/* … */` comments that sit in the
/// gaps between attributes (or before the first / after the last). These are
/// not part of the attribute list, so they must be collected separately to
/// avoid being dropped when the open tag is rewritten (#685).
fn collect_open_tag_comments(
    source: &str,
    element_start: u32,
    open_tag_end: u32,
    attributes: &[Attribute],
) -> Vec<OpenTagComment> {
    let bytes = source.as_bytes();
    let name_end = open_tag_name_end(source, element_start);
    let end = (open_tag_end as usize).min(bytes.len());

    // Attribute spans (sorted) so we can skip over them while scanning gaps.
    let mut spans: Vec<(usize, usize)> = attributes
        .iter()
        .map(|a| {
            let (s, e) = attribute_span(a);
            (s as usize, e as usize)
        })
        .collect();
    spans.sort_by_key(|s| s.0);

    let mut comments = Vec::new();
    let mut i = name_end;
    let mut span_idx = 0;
    while i < end {
        // Skip past any attribute span covering `i`.
        while span_idx < spans.len() && spans[span_idx].1 <= i {
            span_idx += 1;
        }
        if span_idx < spans.len() && spans[span_idx].0 <= i {
            i = spans[span_idx].1;
            continue;
        }

        if bytes[i] == b'/' && bytes.get(i + 1) == Some(&b'/') {
            let start = i;
            i += 2;
            while i < end && bytes[i] != b'\n' {
                i += 1;
            }
            let text = source[start..i].trim_end().to_string();
            comments.push(OpenTagComment {
                start: start as u32,
                text,
                is_line: true,
            });
        } else if bytes[i] == b'/' && bytes.get(i + 1) == Some(&b'*') {
            let start = i;
            i += 2;
            while i < end && !(bytes[i] == b'*' && bytes.get(i + 1) == Some(&b'/')) {
                i += 1;
            }
            i = (i + 2).min(end);
            comments.push(OpenTagComment {
                start: start as u32,
                text: source[start..i].to_string(),
                is_line: false,
            });
        } else {
            i += 1;
        }
    }
    comments
}

/// Return the byte offset just past the `<tagname` opener (the first
/// whitespace / `>` / `/` after the tag name).
fn open_tag_name_end(source: &str, element_start: u32) -> usize {
    let bytes = source.as_bytes();
    let mut i = element_start as usize + 1;
    while i < bytes.len() && !matches!(bytes[i], b' ' | b'\t' | b'\n' | b'\r' | b'>' | b'/') {
        i += 1;
    }
    i
}

/// HTML void elements — they never have a closing tag and are emitted in the
/// self-closing ` />` form (matching prettier-plugin-svelte's default).
fn is_void_element(tag_name: &str) -> bool {
    matches!(
        tag_name,
        "area"
            | "base"
            | "br"
            | "col"
            | "embed"
            | "hr"
            | "img"
            | "input"
            | "link"
            | "meta"
            | "param"
            | "source"
            | "track"
            | "wbr"
    )
}

fn render_one_line(tag_name: &str, attrs: &[String], self_closing: bool) -> String {
    let mut out = String::with_capacity(tag_name.len() + 16);
    out.push('<');
    out.push_str(tag_name);
    for a in attrs {
        out.push(' ');
        out.push_str(a);
    }
    if self_closing {
        out.push_str(" />");
    } else {
        out.push('>');
    }
    out
}

fn render_multi_line(
    tag_name: &str,
    attrs: &[String],
    self_closing: bool,
    depth: usize,
    js_opts: &JsFormatOptions,
    hug_open: bool,
) -> String {
    let inner_indent = indent_str(depth + 1, js_opts);
    let outer_indent = indent_str(depth, js_opts);
    let mut out = String::with_capacity(tag_name.len() + attrs.len() * 16);
    out.push('<');
    out.push_str(tag_name);
    for a in attrs {
        out.push('\n');
        out.push_str(&inner_indent);
        // A multi-line attribute value (arrow handler, `bind:` getter/setter,
        // …) is formatted at column 0 by the delegated expression formatter;
        // re-indent its continuation lines to the attribute column so they
        // align under the attribute instead of collapsing to column 0 (#692).
        // `skip_first` leaves the value's first line alone — the attribute
        // indent was already emitted before it.
        //
        // A quoted string value (`style="…\n…"` / `class="…"`) is HTML text, not
        // formatter output: its interior whitespace is literal, so it's emitted
        // verbatim and must NOT be re-indented.
        if is_string_value_attr(a) {
            out.push_str(a);
        } else {
            out.push_str(&crate::reindent::reindent(a, &inner_indent, true));
        }
    }
    if hug_open && !self_closing {
        // Whitespace-sensitive inline content: glue the `>` to the last
        // attribute line (`}}>text`) so no significant whitespace is injected
        // before the content (#798).
        out.push('>');
    } else {
        out.push('\n');
        out.push_str(&outer_indent);
        if self_closing {
            out.push_str("/>");
        } else {
            out.push('>');
        }
    }
    out
}

/// Whether a rendered attribute's value is a *literal* quoted string
/// (`style="…"` / `class="a {x}"`) whose interior whitespace is HTML text and
/// must be kept verbatim — as opposed to a quoted single expression
/// (`pos="{expr}"`), whose formatted multi-line value still needs re-indenting.
/// The value part (after the first `=`) must start with `"` but not `"{`.
fn is_string_value_attr(a: &str) -> bool {
    match a.split_once('=') {
        Some((_, value)) => value.starts_with('"') && !value.starts_with("\"{"),
        None => false,
    }
}

fn indent_str(level: usize, js_opts: &JsFormatOptions) -> String {
    if js_opts.indent_style.is_tab() {
        "\t".repeat(level)
    } else {
        " ".repeat(level * js_opts.indent_width.value() as usize)
    }
}

/// Visual column width of an indent. For tabs, treat one tab as
/// `indent_width` visual columns (matches how most editors display
/// them).
fn indent_visual_width(level: usize, js_opts: &JsFormatOptions) -> usize {
    level * js_opts.indent_width.value() as usize
}

/// Visual width of a rendered string, matching how `oxfmt` / prettier measure
/// line length: East Asian Wide and Fullwidth characters (CJK text, fullwidth
/// punctuation, …) count as two columns and combining marks as zero. Counting
/// bare `chars()` under-measured CJK-heavy open tags, so they never crossed
/// `printWidth` and never wrapped even when `oxfmt` would (#762).
fn visual_width(s: &str) -> usize {
    UnicodeWidthStr::width(s)
}

// ─── source-scan helpers ────────────────────────────────────────────────

fn attribute_span(attr: &Attribute) -> (u32, u32) {
    match attr {
        Attribute::Attribute(n) => (n.start, n.end),
        Attribute::SpreadAttribute(s) => (s.start, s.end),
        Attribute::AttachTag(a) => (a.start, a.end),
        Attribute::BindDirective(d) => (d.start, d.end),
        Attribute::OnDirective(d) => (d.start, d.end),
        Attribute::ClassDirective(d) => (d.start, d.end),
        Attribute::StyleDirective(d) => (d.start, d.end),
        Attribute::TransitionDirective(d) => (d.start, d.end),
        Attribute::AnimateDirective(d) => (d.start, d.end),
        Attribute::UseDirective(d) => (d.start, d.end),
        Attribute::LetDirective(d) => (d.start, d.end),
    }
}

/// Scan forward from after the last attribute (or just past `<tagname`
/// when there are none) and return the position **after** the `>` that
/// closes the opener.
fn find_open_tag_end(source: &str, element_start: u32, attributes: &[Attribute]) -> Option<u32> {
    let scan_from = if let Some(last) = attributes.last() {
        attribute_span(last).1 as usize
    } else {
        // Skip the leading `<` and consume tag-name chars.
        let bytes = source.as_bytes();
        let mut i = element_start as usize + 1;
        while i < bytes.len() && !matches!(bytes[i], b' ' | b'\t' | b'\n' | b'\r' | b'>' | b'/') {
            i += 1;
        }
        i
    };

    let bytes = source.as_bytes();
    let mut i = scan_from;
    while i < bytes.len() {
        // Skip over comments so a `>` inside `// …` / `/* … */` (which can
        // sit between the last attribute and the closing `>`) doesn't end
        // the open tag prematurely (#685).
        if bytes[i] == b'/' && bytes.get(i + 1) == Some(&b'/') {
            i += 2;
            while i < bytes.len() && bytes[i] != b'\n' {
                i += 1;
            }
            continue;
        }
        if bytes[i] == b'/' && bytes.get(i + 1) == Some(&b'*') {
            i += 2;
            while i < bytes.len() && !(bytes[i] == b'*' && bytes.get(i + 1) == Some(&b'/')) {
                i += 1;
            }
            i += 2;
            continue;
        }
        if bytes[i] == b'>' {
            return Some((i + 1) as u32);
        }
        i += 1;
    }
    None
}

fn is_self_closing(source: &str, open_tag_end: u32) -> bool {
    let bytes = source.as_bytes();
    if open_tag_end < 2 {
        return false;
    }
    let mut i = open_tag_end as usize - 2;
    loop {
        match bytes[i] {
            b' ' | b'\t' | b'\n' | b'\r' => {
                if i == 0 {
                    return false;
                }
                i -= 1;
            }
            b'/' => return true,
            _ => return false,
        }
    }
}

// ─── attribute rendering ────────────────────────────────────────────────

fn render_attribute(
    attr: &Attribute,
    source: &str,
    options: &FormatOptions,
    attr_depth: usize,
) -> Result<String, FormatError> {
    match attr {
        Attribute::Attribute(node) => render_attribute_node(node, source, options, attr_depth),
        Attribute::SpreadAttribute(spread) => render_spread(spread, source, options, attr_depth),
        Attribute::AttachTag(attach) => {
            let inner = format_expression_at(source, &attach.expression, options, attr_depth)?
                .unwrap_or_default();
            Ok(format!("{{@attach {inner}}}"))
        }
        Attribute::BindDirective(d) => {
            let modifiers = render_modifiers(&d.modifiers);
            // A Svelte 5 function binding `bind:value={get, set}` (a top-level
            // sequence expression) renders without outer parens and breaks its
            // braces onto their own lines when the members don't fit (#795b).
            let lead_cols = attr_depth * options.js.indent_width.value() as usize
                + visual_width(&format!("bind:{}{modifiers}=", d.name));
            if let Some(value) = crate::expression::format_function_binding(
                source,
                &d.expression,
                d.end,
                options,
                attr_depth,
                lead_cols,
            )? {
                return Ok(format!("bind:{}{modifiers}={value}", d.name));
            }
            let inner = render_directive_value(source, &d.expression, d.end, options, attr_depth)?;
            if inner == d.name.as_str() && modifiers.is_empty() {
                Ok(format!("bind:{}", d.name))
            } else {
                Ok(format!("bind:{}{modifiers}={{{inner}}}", d.name))
            }
        }
        Attribute::ClassDirective(d) => {
            let inner = render_directive_value(source, &d.expression, d.end, options, attr_depth)?;
            if inner == d.name.as_str() {
                Ok(format!("class:{}", d.name))
            } else {
                Ok(format!("class:{}={{{inner}}}", d.name))
            }
        }
        Attribute::OnDirective(d) => {
            let modifiers = render_modifiers(&d.modifiers);
            if let Some(expr) = &d.expression {
                let inner = render_directive_value(source, expr, d.end, options, attr_depth)?;
                Ok(format!("on:{}{modifiers}={{{inner}}}", d.name))
            } else {
                Ok(format!("on:{}{modifiers}", d.name))
            }
        }
        Attribute::TransitionDirective(d) => {
            let prefix = if d.intro && d.outro {
                "transition"
            } else if d.intro {
                "in"
            } else {
                "out"
            };
            let modifiers = render_modifiers(&d.modifiers);
            if let Some(expr) = &d.expression {
                let inner = render_directive_value(source, expr, d.end, options, attr_depth)?;
                Ok(format!("{prefix}:{}{modifiers}={{{inner}}}", d.name))
            } else {
                Ok(format!("{prefix}:{}{modifiers}", d.name))
            }
        }
        Attribute::AnimateDirective(d) => {
            if let Some(expr) = &d.expression {
                let inner = render_directive_value(source, expr, d.end, options, attr_depth)?;
                Ok(format!("animate:{}={{{inner}}}", d.name))
            } else {
                Ok(format!("animate:{}", d.name))
            }
        }
        Attribute::UseDirective(d) => {
            if let Some(expr) = &d.expression {
                let inner = render_directive_value(source, expr, d.end, options, attr_depth)?;
                Ok(format!("use:{}={{{inner}}}", d.name))
            } else {
                Ok(format!("use:{}", d.name))
            }
        }
        Attribute::StyleDirective(d) => {
            let modifiers = render_modifiers(&d.modifiers);
            let value =
                render_attribute_value_for_directive(&d.value, source, options, attr_depth)?;
            if value.is_empty() {
                Ok(format!("style:{}{modifiers}", d.name))
            } else {
                Ok(format!("style:{}{modifiers}={value}", d.name))
            }
        }
        Attribute::LetDirective(d) => {
            // `let:item` (shorthand) or `let:item={pattern}` with a
            // destructuring pattern as the value.
            if let Some(expr) = &d.expression {
                let (Some(s), Some(e)) = (expr.start(), expr.end()) else {
                    return Ok(format!("let:{}", d.name));
                };
                let raw = source.get(s as usize..e as usize).unwrap_or("").trim();
                if raw.is_empty() || raw == d.name.as_str() {
                    Ok(format!("let:{}", d.name))
                } else {
                    let pattern = crate::expression::format_pattern_source(raw, options)?;
                    Ok(format!("let:{}={{{pattern}}}", d.name))
                }
            } else {
                Ok(format!("let:{}", d.name))
            }
        }
    }
}

/// Return the source text of an `ExpressionTag`'s inner expression, without
/// the surrounding `{`/`}`.
///
/// A regular `name={expr}` attribute's `ExpressionTag` spans the braces, so we
/// strip one byte from each end. But the attribute shorthand `{name}` is
/// parsed (matching upstream `start: id.start, end: id.end`) so its
/// `ExpressionTag` spans only the identifier — there are no braces to strip.
/// Blindly slicing `start+1..end-1` there dropped the first and last character
/// of the identifier, silently rewriting `{width}` to `width={idt}` (#679). So
/// only peel braces when they're actually present at the span boundaries.
fn expression_tag_inner<'a>(tag: &ExpressionTag, source: &'a str) -> &'a str {
    let (start, end) = (tag.start as usize, tag.end as usize);
    let bytes = source.as_bytes();
    if bytes.get(start) == Some(&b'{') && end > start + 1 && bytes.get(end - 1) == Some(&b'}') {
        source.get(start + 1..end - 1).unwrap_or("")
    } else {
        source.get(start..end).unwrap_or("")
    }
}

fn render_attribute_node(
    node: &AttributeNode,
    source: &str,
    options: &FormatOptions,
    attr_depth: usize,
) -> Result<String, FormatError> {
    match &node.value {
        AttributeValue::True(_) => Ok(node.name.to_string()),
        AttributeValue::Expression(tag) => {
            let inner_src = expression_tag_inner(tag, source).trim();
            if inner_src.is_empty() {
                return Ok(format!("{}={{}}", node.name));
            }
            let formatted = format_attribute_value_expression(inner_src, options, attr_depth)?;
            // Svelte attribute shorthand: `name={name}` → `{name}`.
            if formatted == node.name.as_str() {
                Ok(format!("{{{formatted}}}"))
            } else {
                Ok(format!("{}={{{formatted}}}", node.name))
            }
        }
        AttributeValue::Sequence(parts) => {
            let body = render_attribute_value_sequence(parts, source, options, attr_depth)?;
            Ok(format!("{}=\"{}\"", node.name, body))
        }
    }
}

fn render_attribute_value_for_directive(
    value: &AttributeValue,
    source: &str,
    options: &FormatOptions,
    attr_depth: usize,
) -> Result<String, FormatError> {
    match value {
        AttributeValue::True(_) => Ok(String::new()),
        AttributeValue::Expression(tag) => {
            let inner_src = expression_tag_inner(tag, source).trim();
            if inner_src.is_empty() {
                return Ok("{}".to_string());
            }
            let formatted = format_attribute_value_expression(inner_src, options, attr_depth)?;
            Ok(format!("{{{formatted}}}"))
        }
        AttributeValue::Sequence(parts) => {
            let body = render_attribute_value_sequence(parts, source, options, attr_depth)?;
            Ok(format!("\"{body}\""))
        }
    }
}

fn render_attribute_value_sequence(
    parts: &[AttributeValuePart],
    source: &str,
    options: &FormatOptions,
    attr_depth: usize,
) -> Result<String, FormatError> {
    let mut out = String::new();
    for part in parts {
        match part {
            AttributeValuePart::Text(t) => {
                out.push_str(t.data.as_str());
            }
            AttributeValuePart::ExpressionTag(tag) => {
                let inner_src = source
                    .get(tag.start as usize + 1..tag.end as usize - 1)
                    .unwrap_or("")
                    .trim();
                if inner_src.is_empty() {
                    out.push_str("{}");
                } else {
                    // The expression sits inside a double-quoted attribute
                    // (`class="…{expr}…"`); prettier prefers single quotes for
                    // its string literals so they don't clash with the `"`
                    // delimiter (`{x ?? ''}`, not `{x ?? ""}`).
                    let mut opts = options.clone();
                    opts.js.quote_style = QuoteStyle::Single;
                    let formatted =
                        format_attribute_value_expression(inner_src, &opts, attr_depth)?;
                    out.push('{');
                    out.push_str(&formatted);
                    out.push('}');
                }
            }
        }
    }
    Ok(out)
}

fn render_spread(
    spread: &SpreadAttribute,
    source: &str,
    options: &FormatOptions,
    attr_depth: usize,
) -> Result<String, FormatError> {
    let inner =
        format_expression_at(source, &spread.expression, options, attr_depth)?.unwrap_or_default();
    Ok(format!("{{...{inner}}}"))
}

fn render_modifiers<S: AsRef<str>>(modifiers: &[S]) -> String {
    if modifiers.is_empty() {
        return String::new();
    }
    let mut out = String::new();
    for m in modifiers {
        out.push('|');
        out.push_str(m.as_ref());
    }
    out
}

/// Slice the expression's source span, trim it, and format. Returns
/// `None` if the span is missing or empty.
/// Format a directive's `{ EXPR }` value. Prefers the source-brace slice
/// ([`crate::expression::format_directive_value`]) so a TS cast the parser
/// narrows away — `bind:value={value as string}` → bare `value` node — is
/// preserved verbatim (#682), and falls back to the bare-node formatter when
/// the value braces can't be located. `value_end` is the directive node's
/// `end` (just past the closing `}`).
fn render_directive_value(
    source: &str,
    expr: &Expression,
    value_end: u32,
    options: &FormatOptions,
    attr_depth: usize,
) -> Result<String, FormatError> {
    if let Some(s) =
        crate::expression::format_directive_value(source, expr, value_end, options, attr_depth)?
    {
        return Ok(s);
    }
    Ok(format_expression_at(source, expr, options, attr_depth)?.unwrap_or_default())
}

fn format_expression_at(
    source: &str,
    expr: &Expression,
    options: &FormatOptions,
    attr_depth: usize,
) -> Result<Option<String>, FormatError> {
    let (Some(start), Some(end)) = (expr.start(), expr.end()) else {
        return Ok(None);
    };
    let raw = source
        .get(start as usize..end as usize)
        .unwrap_or("")
        .trim();
    if raw.is_empty() {
        return Ok(None);
    }
    Ok(Some(format_attribute_value_expression(
        raw, options, attr_depth,
    )?))
}
