//! Collapse pure-text elements onto one line when they fit.
//!
//! prettier-plugin-svelte reflows an element whose content is only text onto a
//! single line if the result fits within `printWidth` — e.g. a `<button>` or
//! `<p>` whose body sits on its own indented line in the source collapses to
//! `<button> click me! </button>` / `<p>hello</p>`. Whether the leading/trailing
//! whitespace survives as a single space depends on the element's CSS display:
//! block / list-item elements trim it, everything else (inline, inline-block,
//! table-cell, …) keeps one space.
//!
//! This runs as a post-pass over the already-formatted output (re-parsed so node
//! offsets and widths are exact). Elements with tag/expression/block children
//! are left to the whitespace-sensitive indent pass — only pure-text content is
//! reflowed here. Long text that would overflow stays multi-line (fill wrapping
//! is handled upstream by leaving the source breaks).

use rsvelte_core::ast::template::{Fragment, TemplateNode};
use rsvelte_core::{ParseOptions, parse};
use unicode_width::UnicodeWidthStr;

use crate::error::FormatError;
use crate::options::FormatOptions;

pub(crate) fn collapse_pure_text_elements(
    out: &str,
    options: &FormatOptions,
) -> Result<String, FormatError> {
    let root = parse(out, ParseOptions::default()).map_err(FormatError::from_parse)?;
    let line_width = options.js.line_width.value() as usize;

    let mut edits: Vec<(u32, u32, String)> = Vec::new();
    collect(out, &root.fragment, line_width, &mut edits);
    if edits.is_empty() {
        return Ok(out.to_string());
    }

    edits.sort_by_key(|(start, _, _)| std::cmp::Reverse(*start));
    let mut result = out.to_string();
    for (start, end, text) in edits {
        result.replace_range(start as usize..end as usize, &text);
    }
    Ok(result)
}

fn collect(out: &str, fragment: &Fragment, line_width: usize, edits: &mut Vec<(u32, u32, String)>) {
    for node in &fragment.nodes {
        match node {
            TemplateNode::RegularElement(elem) => {
                if is_whitespace_preserving(elem.name.as_str()) {
                    continue;
                }
                if let Some(edit) = try_collapse(
                    out,
                    elem.name.as_str(),
                    elem.start,
                    elem.end,
                    &elem.fragment,
                    line_width,
                ) {
                    edits.push(edit);
                } else if let Some(edit) = try_fill_mixed(
                    out,
                    elem.name.as_str(),
                    elem.start,
                    elem.end,
                    &elem.fragment,
                    line_width,
                ) {
                    edits.push(edit);
                } else {
                    collect(out, &elem.fragment, line_width, edits);
                }
            }
            TemplateNode::Component(c) => collect(out, &c.fragment, line_width, edits),
            TemplateNode::TitleElement(t) => {
                if let Some(edit) = try_collapse(
                    out,
                    t.name.as_str(),
                    t.start,
                    t.end,
                    &t.fragment,
                    line_width,
                ) {
                    edits.push(edit);
                } else {
                    collect(out, &t.fragment, line_width, edits);
                }
            }
            TemplateNode::SlotElement(s) => collect(out, &s.fragment, line_width, edits),
            TemplateNode::SvelteHead(s)
            | TemplateNode::SvelteBody(s)
            | TemplateNode::SvelteDocument(s)
            | TemplateNode::SvelteFragment(s)
            | TemplateNode::SvelteBoundary(s)
            | TemplateNode::SvelteOptions(s)
            | TemplateNode::SvelteSelf(s)
            | TemplateNode::SvelteWindow(s) => collect(out, &s.fragment, line_width, edits),
            TemplateNode::SvelteComponent(c) => collect(out, &c.fragment, line_width, edits),
            TemplateNode::SvelteElement(e) => collect(out, &e.fragment, line_width, edits),
            TemplateNode::IfBlock(blk) => {
                collect(out, &blk.consequent, line_width, edits);
                if let Some(alt) = &blk.alternate {
                    collect(out, alt, line_width, edits);
                }
            }
            TemplateNode::EachBlock(blk) => {
                collect(out, &blk.body, line_width, edits);
                if let Some(fb) = &blk.fallback {
                    collect(out, fb, line_width, edits);
                }
            }
            TemplateNode::AwaitBlock(blk) => {
                if let Some(f) = &blk.pending {
                    collect(out, f, line_width, edits);
                }
                if let Some(f) = &blk.then {
                    collect(out, f, line_width, edits);
                }
                if let Some(f) = &blk.catch {
                    collect(out, f, line_width, edits);
                }
            }
            TemplateNode::KeyBlock(blk) => collect(out, &blk.fragment, line_width, edits),
            TemplateNode::SnippetBlock(blk) => collect(out, &blk.body, line_width, edits),
            _ => {}
        }
    }
}

/// Re-lay-out a pure-text element: render it on one line when it fits, else
/// break the content onto its own indented line(s) (word-fill). Returns the edit
/// when the ideal layout differs from the element's current rendering in `out`.
fn try_collapse(
    out: &str,
    tag: &str,
    start: u32,
    end: u32,
    fragment: &Fragment,
    line_width: usize,
) -> Option<(u32, u32, String)> {
    let (s, e) = (start as usize, end as usize);
    let whole = out.get(s..e)?;
    // Pure text: every child is a Text node.
    if fragment.nodes.is_empty()
        || !fragment
            .nodes
            .iter()
            .all(|n| matches!(n, TemplateNode::Text(_)))
    {
        return None;
    }

    // Content runs from the end of the open tag to the start of the close tag.
    let first = fragment.nodes.first()?;
    let last = fragment.nodes.last()?;
    let (content_start, content_end) = (text_start(first)?, text_end(last)?);
    let open = out.get(s..content_start as usize)?;
    let close = out.get(content_end as usize..e)?;

    let raw = out.get(content_start as usize..content_end as usize)?;
    let had_lead = raw.starts_with([' ', '\t', '\n', '\r']);
    let had_trail = raw.ends_with([' ', '\t', '\n', '\r']);
    let collapsed = raw.split_whitespace().collect::<Vec<_>>().join(" ");

    // One-line form.
    let mut one_line = String::with_capacity(whole.len());
    one_line.push_str(open);
    if !collapsed.is_empty() {
        let edge = !is_block_display(tag); // inline-ish keeps an edge space
        if edge && had_lead {
            one_line.push(' ');
        }
        one_line.push_str(&collapsed);
        if edge && had_trail {
            one_line.push(' ');
        }
    }
    one_line.push_str(close);

    let column = current_column(out, start);
    if !one_line.contains('\n') && column + one_line.width() <= line_width {
        return (one_line != whole).then_some((start, end, one_line));
    }

    // Doesn't fit on one line — break the content onto its own indented line(s).
    // Only when the element sits at the start of its line (so the indent prefix
    // is whitespace we can reuse) and has non-empty content.
    if collapsed.is_empty() {
        return None;
    }
    // Only break when the boundary whitespace is insignificant: the content was
    // separated from the tags by whitespace, or the element is block/list-item
    // (where leading/trailing whitespace is dropped anyway). Inline content that
    // hugs its tags (`}}>text`, no surrounding whitespace) must stay hugged
    // (markup.rs keeps the `>` glued to the text — #798).
    if !((had_lead && had_trail) || is_block_display(tag)) {
        return None;
    }
    let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
    let indent = out.get(line_start..s)?;
    if !indent.bytes().all(|b| b == b' ' || b == b'\t') {
        return None;
    }
    let inner_indent = format!("{indent}  ");
    let avail = line_width.saturating_sub(inner_indent.width()).max(1);

    let mut broken = String::with_capacity(whole.len() + 8);
    broken.push_str(open);
    for line in fill(&collapsed, avail) {
        broken.push('\n');
        broken.push_str(&inner_indent);
        broken.push_str(&line);
    }
    broken.push('\n');
    broken.push_str(indent);
    broken.push_str(close);

    (broken != whole).then_some((start, end, broken))
}

/// Greedy word-wrap `text` into lines no wider than `width` (each line keeps at
/// least one word). Mirrors prettier's fill for inline text content.
fn fill(text: &str, width: usize) -> Vec<String> {
    let mut lines = Vec::new();
    let mut cur = String::new();
    for word in text.split(' ').filter(|w| !w.is_empty()) {
        if cur.is_empty() {
            cur.push_str(word);
        } else if cur.width() + 1 + word.width() <= width {
            cur.push(' ');
            cur.push_str(word);
        } else {
            lines.push(std::mem::take(&mut cur));
            cur.push_str(word);
        }
    }
    if !cur.is_empty() {
        lines.push(cur);
    }
    if lines.is_empty() {
        lines.push(String::new());
    }
    lines
}

fn text_start(node: &TemplateNode) -> Option<u32> {
    match node {
        TemplateNode::Text(t) => Some(t.start),
        _ => None,
    }
}

fn text_end(node: &TemplateNode) -> Option<u32> {
    match node {
        TemplateNode::Text(t) => Some(t.end),
        _ => None,
    }
}

/// Visual column where `pos` sits (width of its line's prefix).
fn current_column(out: &str, pos: u32) -> usize {
    let pos = pos as usize;
    let line_start = out[..pos].rfind('\n').map_or(0, |i| i + 1);
    out[line_start..pos].width()
}

/// Elements whose default CSS display is block / list-item — prettier trims the
/// leading/trailing whitespace of their text content. Everything else keeps a
/// single edge space. Mirrors prettier's `CSS_DISPLAY_DEFAULTS`.
fn is_block_display(tag: &str) -> bool {
    matches!(
        tag,
        "address"
            | "article"
            | "aside"
            | "blockquote"
            | "center"
            | "dd"
            | "details"
            | "dialog"
            | "dir"
            | "div"
            | "dl"
            | "dt"
            | "fieldset"
            | "figcaption"
            | "figure"
            | "footer"
            | "form"
            | "h1"
            | "h2"
            | "h3"
            | "h4"
            | "h5"
            | "h6"
            | "header"
            | "hgroup"
            | "legend"
            | "li"
            | "listing"
            | "main"
            | "menu"
            | "nav"
            | "ol"
            | "optgroup"
            | "option"
            | "p"
            | "plaintext"
            | "pre"
            | "search"
            | "section"
            | "source"
            | "summary"
            | "track"
            | "ul"
            | "xmp"
    )
}

fn is_whitespace_preserving(tag: &str) -> bool {
    matches!(tag, "pre" | "textarea")
}

/// A fill item: an inline token plus whether whitespace preceded it (a break
/// opportunity). Glued tokens (no space) never break apart (`foo{bar}`).
struct Tok {
    text: String,
    space_before: bool,
}

/// Narrow mixed-inline fill: when an element with inline content (text +
/// expression tags / inline elements) is currently on ONE line but overflows
/// printWidth, break its content onto its own indented line(s), greedily packed
/// (prettier fill). Currently-multiline mixed content is left to the
/// whitespace-sensitive indent pass — only the clearly-failing one-line overflow
/// is touched, so passing layouts aren't disturbed.
fn try_fill_mixed(
    out: &str,
    tag: &str,
    start: u32,
    end: u32,
    fragment: &Fragment,
    line_width: usize,
) -> Option<(u32, u32, String)> {
    let (s, e) = (start as usize, end as usize);
    let whole = out.get(s..e)?;
    if whole.contains('\n') {
        return None; // only currently-one-line elements
    }
    let column = current_column(out, start);
    if column + whole.width() <= line_width {
        return None; // already fits
    }
    // Must be mixed (at least one non-text child) and entirely inline.
    let mut has_non_text = false;
    for n in &fragment.nodes {
        if !matches!(n, TemplateNode::Text(_)) {
            has_non_text = true;
            if !is_inline_node(n) {
                return None;
            }
        }
    }
    if !has_non_text {
        return None; // pure text is handled by try_collapse
    }

    let content_start = node_start(fragment.nodes.first()?) as usize;
    let content_end = node_end(fragment.nodes.last()?) as usize;
    let open = out.get(s..content_start)?;
    let close = out.get(content_end..e)?;
    if open.contains('\n') {
        return None;
    }
    let raw = out.get(content_start..content_end)?;
    let had_lead = raw.starts_with([' ', '\t', '\r', '\n']);
    let had_trail = raw.ends_with([' ', '\t', '\r', '\n']);
    // Break only when the boundary whitespace is insignificant (content
    // separated from the tags, or a block/list-item element) so hugged inline
    // content stays hugged.
    if !((had_lead && had_trail) || is_block_display(tag)) {
        return None;
    }

    // Build fill tokens.
    let mut toks: Vec<Tok> = Vec::new();
    let mut pending_space = false;
    for node in &fragment.nodes {
        if let TemplateNode::Text(t) = node {
            let txt = out.get(t.start as usize..t.end as usize)?;
            if txt.starts_with([' ', '\t', '\r', '\n']) {
                pending_space = true;
            }
            for (i, w) in txt.split_whitespace().enumerate() {
                let space_before = (i > 0 || pending_space) && !toks.is_empty();
                toks.push(Tok {
                    text: w.to_string(),
                    space_before,
                });
                pending_space = false;
            }
            if txt.ends_with([' ', '\t', '\r', '\n']) {
                pending_space = true;
            }
        } else {
            let span = out.get(node_start(node) as usize..node_end(node) as usize)?;
            let space_before = pending_space && !toks.is_empty();
            toks.push(Tok {
                text: span.to_string(),
                space_before,
            });
            pending_space = false;
        }
    }
    if toks.is_empty() {
        return None;
    }

    let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
    let indent = out.get(line_start..s)?;
    if !indent.bytes().all(|b| b == b' ' || b == b'\t') {
        return None;
    }
    let inner_indent = format!("{indent}  ");
    let avail = line_width.saturating_sub(inner_indent.width()).max(1);
    let lines = fill_tokens(&toks, avail)?;
    // If everything still fits on a single content line there's nothing to gain.
    if lines.len() == 1 {
        return None;
    }

    let mut broken = String::with_capacity(whole.len() + 8);
    broken.push_str(open);
    for line in lines {
        broken.push('\n');
        broken.push_str(&inner_indent);
        broken.push_str(&line);
    }
    broken.push('\n');
    broken.push_str(indent);
    broken.push_str(close);
    (broken != whole).then_some((start, end, broken))
}

/// Greedy-pack fill tokens into lines no wider than `width`. Glued tokens stay on
/// the current line. Returns `None` if an element token alone exceeds `width`
/// (it needs an internal break this pass doesn't do — leave it untouched).
fn fill_tokens(toks: &[Tok], width: usize) -> Option<Vec<String>> {
    let mut lines: Vec<String> = Vec::new();
    let mut cur = String::new();
    for (i, tok) in toks.iter().enumerate() {
        if i == 0 || !tok.space_before {
            if tok.text.starts_with('<') && i != 0 && tok.text.width() > width {
                return None;
            }
            cur.push_str(&tok.text);
            continue;
        }
        if cur.width() + 1 + tok.text.width() <= width {
            cur.push(' ');
            cur.push_str(&tok.text);
        } else {
            if tok.text.starts_with('<') && tok.text.width() > width {
                return None;
            }
            lines.push(std::mem::take(&mut cur));
            cur.push_str(&tok.text);
        }
    }
    lines.push(cur);
    Some(lines)
}

fn is_inline_node(node: &TemplateNode) -> bool {
    match node {
        TemplateNode::Text(_)
        | TemplateNode::ExpressionTag(_)
        | TemplateNode::HtmlTag(_)
        | TemplateNode::AttachTag(_)
        | TemplateNode::DebugTag(_)
        | TemplateNode::Comment(_)
        | TemplateNode::Component(_) => true,
        TemplateNode::RegularElement(e) => !is_block_display(e.name.as_str()),
        _ => false,
    }
}

fn node_start(node: &TemplateNode) -> u32 {
    template_node_span(node).0
}

fn node_end(node: &TemplateNode) -> u32 {
    template_node_span(node).1
}

fn template_node_span(node: &TemplateNode) -> (u32, u32) {
    match node {
        TemplateNode::Text(n) => (n.start, n.end),
        TemplateNode::Comment(n) => (n.start, n.end),
        TemplateNode::TitleElement(n) => (n.start, n.end),
        TemplateNode::SlotElement(n) => (n.start, n.end),
        TemplateNode::SvelteBody(n)
        | TemplateNode::SvelteDocument(n)
        | TemplateNode::SvelteFragment(n)
        | TemplateNode::SvelteBoundary(n)
        | TemplateNode::SvelteHead(n)
        | TemplateNode::SvelteOptions(n)
        | TemplateNode::SvelteSelf(n)
        | TemplateNode::SvelteWindow(n) => (n.start, n.end),
        TemplateNode::ExpressionTag(n) => (n.start, n.end),
        TemplateNode::HtmlTag(n) => (n.start, n.end),
        TemplateNode::ConstTag(n) => (n.start, n.end),
        TemplateNode::DeclarationTag(n) => (n.start, n.end),
        TemplateNode::DebugTag(n) => (n.start, n.end),
        TemplateNode::RenderTag(n) => (n.start, n.end),
        TemplateNode::AttachTag(n) => (n.start, n.end),
        TemplateNode::IfBlock(n) => (n.start, n.end),
        TemplateNode::EachBlock(n) => (n.start, n.end),
        TemplateNode::AwaitBlock(n) => (n.start, n.end),
        TemplateNode::KeyBlock(n) => (n.start, n.end),
        TemplateNode::SnippetBlock(n) => (n.start, n.end),
        TemplateNode::RegularElement(n) => (n.start, n.end),
        TemplateNode::Component(n) => (n.start, n.end),
        TemplateNode::SvelteComponent(n) => (n.start, n.end),
        TemplateNode::SvelteElement(n) => (n.start, n.end),
    }
}
