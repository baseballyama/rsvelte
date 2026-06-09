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
                } else if let Some(edit) = try_hug_mixed(
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
            TemplateNode::Component(c) => {
                if let Some(edit) = try_hug_mixed(
                    out,
                    c.name.as_str(),
                    c.start,
                    c.end,
                    &c.fragment,
                    line_width,
                ) {
                    edits.push(edit);
                } else {
                    collect(out, &c.fragment, line_width, edits);
                }
            }
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
                } else if let Some(edit) = try_hug_mixed(
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
            TemplateNode::SlotElement(s) => {
                if let Some(edit) = try_collapse(
                    out,
                    s.name.as_str(),
                    s.start,
                    s.end,
                    &s.fragment,
                    line_width,
                ) {
                    edits.push(edit);
                } else {
                    collect(out, &s.fragment, line_width, edits);
                }
            }
            TemplateNode::SvelteBoundary(s) => {
                if let Some(edit) = try_collapse(
                    out,
                    s.name.as_str(),
                    s.start,
                    s.end,
                    &s.fragment,
                    line_width,
                ) {
                    edits.push(edit);
                } else {
                    collect(out, &s.fragment, line_width, edits);
                }
            }
            TemplateNode::SvelteHead(s)
            | TemplateNode::SvelteBody(s)
            | TemplateNode::SvelteDocument(s)
            | TemplateNode::SvelteFragment(s)
            | TemplateNode::SvelteOptions(s)
            | TemplateNode::SvelteSelf(s)
            | TemplateNode::SvelteWindow(s) => collect(out, &s.fragment, line_width, edits),
            TemplateNode::SvelteComponent(c) => collect(out, &c.fragment, line_width, edits),
            TemplateNode::SvelteElement(e) => {
                if let Some(edit) = try_collapse(
                    out,
                    e.name.as_str(),
                    e.start,
                    e.end,
                    &e.fragment,
                    line_width,
                ) {
                    edits.push(edit);
                } else if let Some(edit) = try_hug_mixed(
                    out,
                    e.name.as_str(),
                    e.start,
                    e.end,
                    &e.fragment,
                    line_width,
                ) {
                    edits.push(edit);
                } else {
                    collect(out, &e.fragment, line_width, edits);
                }
            }
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

    // Empty element (whitespace-only body): collapse to `<tag></tag>` — the
    // close tag glues directly to the `>`, dropping the body whitespace. This
    // holds even when the open tag wrapped across lines (`<svelte:boundary\n
    // onerror={…}\n></svelte:boundary>`), which the one-line path below rejects
    // because the open tag contains a newline.
    if collapsed.is_empty() {
        let result = format!("{open}{close}");
        return (result != whole).then_some((start, end, result));
    }

    // One-line form.
    let mut one_line = String::with_capacity(whole.len());
    one_line.push_str(open);
    if !collapsed.is_empty() {
        let edge = !trims_edge_whitespace(tag); // inline-ish keeps an edge space
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
    let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
    let indent = out.get(line_start..s)?;
    if !indent.bytes().all(|b| b == b' ' || b == b'\t') {
        return None;
    }
    let inner_indent = format!("{indent}  ");

    // A pure-inline element (CSS display `inline`: `<a>`, `<span>`, … — not
    // inline-block like `<button>`, not block) is whitespace-sensitive, so it
    // can't put its text on its own line. prettier instead uses the "hug" break:
    //   <a href="…"
    //     >content</a
    //   >
    // — the `>` glues to the content so no whitespace is injected. The open tag
    // must fit on one line and the `>content</tag` line must fit; otherwise this
    // needs attribute-wrapping / content fill we don't do here.
    //
    // The hug only applies when the content is directly adjacent to the tags
    // (prettier's `shouldHugStart`/`shouldHugEnd`: hug iff the first/last child
    // does NOT start/end with whitespace). When the content is separated from
    // the tags by whitespace (`<button>\n  click me\n</button>`), prettier
    // block-breaks instead, so fall through to the block-break path below.
    if !trims_edge_whitespace(tag) && !had_lead && !had_trail {
        if open.contains('\n') || !open.ends_with('>') {
            return None;
        }
        let hug_width = inner_indent.width() + 1 + collapsed.width() + 2 + tag.width();
        if hug_width > line_width {
            return None;
        }
        let open_no_bracket = &open[..open.len() - 1];
        let hug = format!("{open_no_bracket}\n{inner_indent}>{collapsed}</{tag}\n{indent}>");
        return (hug != whole).then_some((start, end, hug));
    }

    // Block / inline-block: break the content onto its own line(s). Only when the
    // boundary whitespace is insignificant (content separated from the tags, or
    // a block/list-item element) so hugged inline text stays hugged (#798).
    if !((had_lead && had_trail) || trims_edge_whitespace(tag)) {
        return None;
    }
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
    // `pre` / `textarea` preserve whitespace; `script` / `style` carry raw
    // JS/CSS already formatted by their dedicated passes (oxfmt). None of these
    // may have their text content reflowed as prose by the collapse pass.
    matches!(tag, "pre" | "textarea" | "script" | "style")
}

/// Tags whose text content has its leading/trailing whitespace trimmed when
/// collapsed onto one line: block / list-item elements (CSS_DISPLAY_DEFAULTS),
/// plus the `display:contents` elements `<slot>` / `<svelte:boundary>`, which
/// prettier / oxfmt also edge-trim (`<slot> x </slot>` → `<slot>x</slot>`).
/// Everything else (inline, inline-block, table-cell, …) keeps one edge space.
fn trims_edge_whitespace(tag: &str) -> bool {
    is_block_display(tag) || matches!(tag, "slot" | "svelte:boundary" | "svelte:element")
}

/// If `node` is a huggable display:inline element — single line, simple text
/// content (no nested element tags), an open tag ending in `>` — return its
/// `(open_without_bracket, inner_content, tag)` for the hug break.
fn element_hug_parts(out: &str, node: &TemplateNode) -> Option<(String, String, String)> {
    let TemplateNode::RegularElement(e) = node else {
        return None;
    };
    let tag = e.name.as_str();
    if is_block_display(tag) || is_inline_block(tag) || trims_edge_whitespace(tag) {
        return None;
    }
    let first = e.fragment.nodes.first()?;
    let last = e.fragment.nodes.last()?;
    let content_start = node_start(first) as usize;
    let content_end = node_end(last) as usize;
    let open = out.get(e.start as usize..content_start)?;
    let content = out.get(content_start..content_end)?;
    let close = out.get(content_end..e.end as usize)?;
    // Single line, open tag closed by `>`, simple text content, real close tag.
    if open.contains('\n')
        || content.contains('\n')
        || content.contains('<')
        || content.is_empty()
        || !open.ends_with('>')
        || !close.starts_with("</")
    {
        return None;
    }
    let open_no_bracket = open[..open.len() - 1].to_string();
    Some((open_no_bracket, content.to_string(), tag.to_string()))
}

/// Inline-block elements (prettier `CSS_DISPLAY_DEFAULTS`) — display:inline-block.
/// They are not huggable: on overflow they block-break rather than hug.
fn is_inline_block(tag: &str) -> bool {
    matches!(
        tag,
        "input" | "button" | "select" | "object" | "video" | "audio"
    )
}

/// Hug-break an inline element whose mixed inline content (expression tags /
/// text / inline elements, directly adjacent to the tags) overflows one line.
/// prettier's `shouldHugStart` / `shouldHugEnd` are true for an inline element
/// whose first/last child is not a text node starting/ending with whitespace, so
/// the open `>` and the close `</tag` glue to the content and only the final `>`
/// sits on its own line:
///   <title
///     >{a} / {b}</title
///   >
/// This mirrors `try_collapse`'s pure-text hug branch, but the content is the
/// rendered mixed-content doc instead of a collapsed text run.
fn try_hug_mixed(
    out: &str,
    tag: &str,
    start: u32,
    end: u32,
    fragment: &Fragment,
    line_width: usize,
) -> Option<(u32, u32, String)> {
    // Inline display only — block / inline-block elements never hug.
    if is_block_display(tag) || is_inline_block(tag) || is_whitespace_preserving(tag) {
        return None;
    }
    let (s, e) = (start as usize, end as usize);
    let whole = out.get(s..e)?;

    // Must be mixed (≥1 non-text child) and entirely inline (no comments).
    let mut has_non_text = false;
    for n in &fragment.nodes {
        if !matches!(n, TemplateNode::Text(_)) {
            has_non_text = true;
            if matches!(n, TemplateNode::Comment(_)) || !is_inline_node(n) {
                return None;
            }
        }
    }
    if !has_non_text {
        return None; // pure text → try_collapse
    }

    let content_start = node_start(fragment.nodes.first()?) as usize;
    let content_end = node_end(fragment.nodes.last()?) as usize;
    let open = out.get(s..content_start)?;
    let close = out.get(content_end..e)?;
    if open.contains('\n') || !open.ends_with('>') || !close.starts_with("</") {
        return None;
    }
    let raw = out.get(content_start..content_end)?;
    // Hug only when content is directly adjacent to BOTH tags (shouldHugStart /
    // shouldHugEnd). Whitespace-separated content is `try_fill_mixed`'s job.
    if raw.starts_with([' ', '\t', '\r', '\n']) || raw.ends_with([' ', '\t', '\r', '\n']) {
        return None;
    }
    // Only act on currently-one-line content that overflows; multi-line content
    // is left alone (its exact reflow needs the full element-group model).
    if raw.contains('\n') {
        return None;
    }
    let column = current_column(out, start);
    let element_one_line = column + open.width() + raw.width() + close.width();
    if element_one_line <= line_width {
        return None; // fits as-is
    }

    let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
    let indent = out.get(line_start..s)?;
    if !indent.bytes().all(|b| b == b' ' || b == b'\t') {
        return None;
    }

    // Build prettier's `hugStart && hugEnd` element doc and let the printer make
    // the two independent break decisions:
    //   group([
    //     '<tag …attrs',                                    // open (no `>`)
    //     group(indent([softline, group(['>', body, '</tag'])])),  // hugged
    //     softline,
    //     '>',
    //   ])
    // The inner hugged group keeps `>{body}</tag` glued to the open tag when it
    // fits (only the outer `>` drops to its own line, e.g. `<text …>…</text`\n`>`)
    // and otherwise moves `>{body}</tag` to its own indented line (e.g. `<title`\n
    // `  >…</title`\n`>`).
    use crate::doc::Doc;
    let body = build_children_doc(out, fragment)?;
    let open_no_bracket = open[..open.len() - 1].to_string();
    let inner = Doc::Group(vec![Doc::Concat(vec![
        Doc::Text(">".to_string()),
        body,
        Doc::Text(format!("</{tag}")),
    ])]);
    let hugged = Doc::Group(vec![Doc::Indent(vec![Doc::Softline, inner])]);
    let elem_doc = Doc::Group(vec![
        Doc::Text(open_no_bracket),
        hugged,
        Doc::Softline,
        Doc::Text(">".to_string()),
    ]);
    let level = indent.width() / 2;
    let printed = crate::doc::print(elem_doc, line_width, "  ", level, column);
    (printed != whole).then_some((start, end, printed))
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
    // Must be mixed (at least one non-text child) and entirely inline.
    let mut has_non_text = false;
    for n in &fragment.nodes {
        if !matches!(n, TemplateNode::Text(_)) {
            has_non_text = true;
            // A comment always sits on its own line(s) — never fill it inline
            // with the surrounding prose. Leave the whole fragment to the
            // indent pass (which keeps the comment on its own line).
            if matches!(n, TemplateNode::Comment(_)) || !is_inline_node(n) {
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

    // Only "prose" content (text words interspersed with inline tags/elements)
    // is re-flowed — content made of just elements/expressions keeps its source
    // line structure (prettier doesn't prose-fill it), so require at least one
    // text word.
    let has_text_word = fragment
        .nodes
        .iter()
        .any(|n| matches!(n, TemplateNode::Text(t) if t.data.split_whitespace().next().is_some()));
    if !has_text_word {
        return None;
    }

    let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
    let indent = out.get(line_start..s)?;
    if !indent.bytes().all(|b| b == b' ' || b == b'\t') {
        return None;
    }
    let inner_indent = format!("{indent}  ");

    // Build the prettier content doc (a Concat of per-text-node fills with the
    // inline elements as hug groups in between — a port of prettier-plugin-svelte's
    // `printChildren`) and print it. This reproduces the prose fill + in-place
    // inline-element hug-break exactly.
    let content_doc = build_children_doc(out, fragment)?;
    let base_level = inner_indent.width() / 2;

    // Decide flat-vs-break from the element's *flat* width, not the laid-out
    // result — the content carries bare `line` separators (between mustaches /
    // atoms) that would always break when printed in break mode. Render the
    // content all-flat (a huge width) to measure: a `hardline` (a source blank
    // line) still forces a newline, so flat content with a `\n` is inherently
    // multi-line and must break.
    let flat = crate::doc::print(
        crate::doc::Doc::Group(vec![content_doc.clone()]),
        1_000_000,
        "  ",
        base_level,
        0,
    );
    let column = current_column(out, start);
    if !flat.contains('\n') {
        let element_one_line = column + open.width() + flat.width() + close.width();
        // A block element whose flat element line overflows puts its content on
        // its own line; an inline element would instead hug, so leave those.
        if element_one_line <= line_width || !is_block_display(tag) {
            return None;
        }
    }
    let printed = crate::doc::print(
        content_doc,
        line_width,
        "  ",
        base_level,
        inner_indent.width(),
    );
    let broken = format!("{open}\n{inner_indent}{printed}\n{indent}{close}");
    (broken != whole).then_some((start, end, broken))
}

/// Port of prettier-plugin-svelte's `printChildren` for inline (prose) content:
/// a `Concat` of each text node's `fill(splitTextToDocs)` and each inline
/// element's hug `Group`. Boundary whitespace is handled so an element can hug in
/// place (the preceding text fill's trailing `line` stays flat) or move to a
/// fresh line (a `hardline`). The first child's leading and last child's trailing
/// whitespace are dropped (the element wrapper owns that newline).
fn build_children_doc(out: &str, fragment: &Fragment) -> Option<crate::doc::Doc> {
    use crate::doc::Doc;
    let nodes = &fragment.nodes;
    let n = nodes.len();
    let mut docs: Vec<Doc> = Vec::new();
    // Whether the previous text node ended with a (trimmed) space, so the next
    // inline element carries a leading `line` (prettier's
    // `handleWhitespaceOfPrevTextNode`).
    let mut ws_prev = false;

    for (i, node) in nodes.iter().enumerate() {
        match node {
            TemplateNode::Text(t) => {
                ws_prev = false;
                let txt = out.get(t.start as usize..t.end as usize)?;
                let trim_left = i == 0;
                let trim_right = i == n - 1;
                let prev_inline = i > 0 && is_inline_regular_element(&nodes[i - 1]);
                let next_inline = i + 1 < n && is_inline_regular_element(&nodes[i + 1]);
                let mut tl = trim_left;
                let mut tr = trim_right;
                // prettier's `handleTextChild` returns early for the first/last
                // child (no trim, no flag) — the wrapper owns that boundary — so
                // the boundary handling below only applies to middle text nodes.
                //
                // Leading space after an inline element: trim it from this fill
                // and append a `line` to the previous element's doc so the
                // element and the following space break together (the element
                // can then sit at the end of a line with the next word wrapping).
                if !trim_left && !trim_right && prev_inline && starts_with_space_no_break(txt) {
                    if let Some(prev) = docs.pop() {
                        docs.push(Doc::Group(vec![prev, Doc::Line]));
                    }
                    tl = true;
                }
                // Trailing space before an inline element: trim it from this fill
                // and flag the element to carry the leading `line` (hug in place):
                // a first text node instead keeps its trailing `line` inside the
                // fill (prints as a flat space) and the inline element stays bare,
                // so it hug-breaks in place rather than breaking onto its own line.
                if !trim_left && !trim_right && next_inline && ends_with_space_no_break(txt) {
                    tr = true;
                    ws_prev = true;
                }
                let parts = split_text_to_docs(txt, tl, tr);
                if txt.split_whitespace().next().is_none() {
                    // Whitespace-only separator (between mustaches / atoms): emit
                    // the bare `line`(s) so they break with the surrounding
                    // element group (prettier's `splitTextToDocs` returns a bare
                    // line here, governed by the parent group's break mode) rather
                    // than a lone `Fill` that always prints flat.
                    docs.extend(parts);
                } else {
                    docs.push(Doc::Fill(parts));
                }
            }
            other if is_inline_regular_element(other) => {
                let elem = element_doc(out, other)?;
                if ws_prev {
                    docs.push(Doc::Group(vec![Doc::Line, elem]));
                } else {
                    docs.push(elem);
                }
                ws_prev = false;
            }
            other => {
                // Expression tag / html tag / component / … : verbatim atom.
                let span = out.get(node_start(other) as usize..node_end(other) as usize)?;
                if span.contains('\n') {
                    return None;
                }
                docs.push(Doc::Text(span.to_string()));
                ws_prev = false;
            }
        }
    }
    if docs.is_empty() {
        return None;
    }
    Some(Doc::Concat(docs))
}

/// Whether `node` is an inline-display regular element (gets the hug treatment).
fn is_inline_regular_element(node: &TemplateNode) -> bool {
    matches!(node, TemplateNode::RegularElement(e)
        if !is_block_display(e.name.as_str()) && !is_whitespace_preserving(e.name.as_str()))
}

/// The doc for one inline element: a hug `Group` for a huggable display:inline
/// element, otherwise the verbatim single-line span.
fn element_doc(out: &str, node: &TemplateNode) -> Option<crate::doc::Doc> {
    use crate::doc::Doc;
    if let Some((open_no_bracket, content, tag)) = element_hug_parts(out, node) {
        return Some(Doc::Group(vec![
            Doc::Text(open_no_bracket),
            Doc::Indent(vec![
                Doc::Softline,
                Doc::Group(vec![Doc::Text(format!(">{content}</{tag}"))]),
            ]),
            Doc::Softline,
            Doc::Text(">".to_string()),
        ]));
    }
    let span = out.get(node_start(node) as usize..node_end(node) as usize)?;
    if span.contains('\n') {
        return None;
    }
    Some(Doc::Text(span.to_string()))
}

/// Port of prettier's `splitTextToDocs`: words joined by soft `line` breaks, a
/// leading/trailing `line` kept when the text starts/ends with whitespace, and a
/// `hardline` substituted when that boundary whitespace contains a line break
/// (doubled for a blank line). `trim_left`/`trim_right` drop the leading/trailing
/// separator entirely (owned by the element wrapper).
fn split_text_to_docs(text: &str, trim_left: bool, trim_right: bool) -> Vec<crate::doc::Doc> {
    use crate::doc::Doc;
    let starts_ws = text.starts_with(|c: char| c.is_whitespace());
    let ends_ws = text.ends_with(|c: char| c.is_whitespace());
    let words: Vec<&str> = text.split_whitespace().collect();
    let lead_break = leading_linebreaks(text);
    let trail_break = trailing_linebreaks(text);

    let mut docs: Vec<Doc> = Vec::new();
    if words.is_empty() {
        // Whitespace-only text node between two siblings: a single separator
        // (or a blank line when the source had ≥2 newlines).
        if !trim_left && !trim_right {
            match lead_break {
                0 => docs.push(Doc::Line),
                1 => docs.push(Doc::Hardline),
                _ => {
                    docs.push(Doc::Hardline);
                    docs.push(Doc::Hardline);
                }
            }
        }
        return docs;
    }
    if starts_ws && !trim_left {
        match lead_break {
            0 => docs.push(Doc::Line),
            1 => docs.push(Doc::Hardline),
            _ => {
                docs.push(Doc::Hardline);
                docs.push(Doc::Hardline);
            }
        }
    }
    for (i, w) in words.iter().enumerate() {
        if i > 0 {
            docs.push(Doc::Line);
        }
        docs.push(Doc::Text((*w).to_string()));
    }
    if ends_ws && !trim_right {
        match trail_break {
            0 => docs.push(Doc::Line),
            1 => docs.push(Doc::Hardline),
            _ => {
                docs.push(Doc::Hardline);
                docs.push(Doc::Hardline);
            }
        }
    }
    docs
}

/// Number of newlines in the leading whitespace run (capped at 2).
fn leading_linebreaks(s: &str) -> usize {
    s.chars()
        .take_while(|c| c.is_whitespace())
        .filter(|c| *c == '\n')
        .take(2)
        .count()
}

/// Number of newlines in the trailing whitespace run (capped at 2).
fn trailing_linebreaks(s: &str) -> usize {
    s.chars()
        .rev()
        .take_while(|c| c.is_whitespace())
        .filter(|c| *c == '\n')
        .take(2)
        .count()
}

fn ends_with_space_no_break(s: &str) -> bool {
    s.ends_with(|c: char| c.is_whitespace()) && trailing_linebreaks(s) == 0
}

fn starts_with_space_no_break(s: &str) -> bool {
    s.starts_with(|c: char| c.is_whitespace()) && leading_linebreaks(s) == 0
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

pub(crate) fn template_node_span(node: &TemplateNode) -> (u32, u32) {
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
