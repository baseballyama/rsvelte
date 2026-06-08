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

/// If `[start, end)` is an element whose content is pure text spanning multiple
/// lines and whose one-line form fits, return the collapse edit.
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
    if !whole.contains('\n') {
        return None; // already on one line
    }
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
    // A wrapped (multi-line) open tag can't collapse.
    if open.contains('\n') {
        return None;
    }

    let raw = out.get(content_start as usize..content_end as usize)?;
    let had_lead = raw.starts_with([' ', '\t', '\n', '\r']);
    let had_trail = raw.ends_with([' ', '\t', '\n', '\r']);
    let collapsed = raw.split_whitespace().collect::<Vec<_>>().join(" ");

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

    if one_line.contains('\n') {
        return None;
    }
    let column = current_column(out, start);
    if column + one_line.width() > line_width {
        return None;
    }
    Some((start, end, one_line))
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
