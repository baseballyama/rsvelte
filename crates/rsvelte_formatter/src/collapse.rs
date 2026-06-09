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
    collect(out, &root.fragment, line_width, options, &mut edits);
    let result = if edits.is_empty() {
        out.to_string()
    } else {
        apply_edits(out, edits)
    };

    // Second pass: the hug/break edits above may leave a long expression mustache
    // on an overflowing line (a hugged element's trailing `{a.b().c()}`). Re-parse
    // and member-chain-break those in place — this can't run in the first pass
    // because the hug edit that creates the overflowing line owns the element and
    // suppresses recursion into it.
    let root2 = parse(&result, ParseOptions::default()).map_err(FormatError::from_parse)?;
    let mut edits2: Vec<(u32, u32, String)> = Vec::new();
    collect_content_tag_breaks(&result, &root2.fragment, line_width, options, &mut edits2);
    let result = if edits2.is_empty() {
        result
    } else {
        apply_edits(&result, edits2)
    };

    // Third pass: `<pre>` / `<textarea>` whose content contains a block. rsvelte
    // otherwise leaves their whole subtree verbatim, but oxfmt formats the block
    // bodies (space-indented) + embedded JS while keeping element-direct
    // whitespace as raw tabs. Re-format those subtrees with that hybrid rule.
    let root3 = parse(&result, ParseOptions::default()).map_err(FormatError::from_parse)?;
    let mut edits3: Vec<(u32, u32, String)> = Vec::new();
    collect_pre_block_reformats(&result, &root3.fragment, 0, options, &mut edits3);
    if edits3.is_empty() {
        return Ok(result);
    }
    Ok(apply_edits(&result, edits3))
}

/// Whether a fragment (recursively) contains a control-flow block — the trigger
/// for the `<pre>` hybrid reformat (a `<pre>` of only raw text is left verbatim).
fn fragment_has_block(fragment: &Fragment) -> bool {
    fragment.nodes.iter().any(|n| {
        matches!(
            n,
            TemplateNode::IfBlock(_)
                | TemplateNode::EachBlock(_)
                | TemplateNode::AwaitBlock(_)
                | TemplateNode::KeyBlock(_)
                | TemplateNode::SnippetBlock(_)
        ) || child_fragments(n).iter().any(|f| fragment_has_block(f))
    })
}

/// Walk the tree (tracking nesting depth) and, for each `<pre>`/`<textarea>` whose
/// content contains a block, push an edit re-formatting its inner content with the
/// pre hybrid rule (see [`reformat_pre_inner`]).
fn collect_pre_block_reformats(
    out: &str,
    fragment: &Fragment,
    depth: usize,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) {
    for node in &fragment.nodes {
        if let TemplateNode::RegularElement(e) = node
            && matches!(e.name.as_str(), "pre" | "textarea")
            && fragment_has_block(&e.fragment)
        {
            if let Some(edit) = reformat_pre_inner(out, e, depth + 1, options) {
                edits.push(edit);
            }
            continue; // its subtree is owned by this edit
        }
        for child in child_fragments(node) {
            collect_pre_block_reformats(out, child, depth + 1, options, edits);
        }
    }
}

/// Re-format the inner content of a `<pre>`/`<textarea>` that contains a block.
/// `content_depth` is the nesting depth of the element's children. The content is
/// formatted standalone at a width narrowed by `content_depth` levels (so embedded
/// JS / blocks break exactly as they would at their real column), then every line
/// is re-indented out to its real depth — using TABS for whitespace that is the
/// direct child of an element (oxfmt preserves it) and SPACES for block bodies and
/// formatted internals (attributes, JS, wrapped open tags).
fn reformat_pre_inner(
    out: &str,
    elem: &rsvelte_core::ast::template::RegularElement,
    content_depth: usize,
    options: &FormatOptions,
) -> Option<(u32, u32, String)> {
    use std::collections::HashSet;
    // The inner-content span runs from the end of the open tag `>` to the start of
    // the close tag `</pre>`.
    let whole = out.get(elem.start as usize..elem.end as usize)?;
    let open_rel = whole.find('>')? + 1;
    let close_rel = whole.rfind("</")?;
    if close_rel <= open_rel {
        return None;
    }
    let inner_start = elem.start as usize + open_rel;
    let inner_end = elem.start as usize + close_rel;
    let raw_inner = out.get(inner_start..inner_end)?;

    let iw = options.js.indent_width.value() as usize;
    let full_width = options.js.line_width.value() as usize;
    // Format the children standalone, but narrowed so a depth-0 layout matches the
    // breaks at the real `content_depth`.
    let narrowed = full_width.saturating_sub(content_depth * iw).max(20);
    let mut sub_opts = options.clone();
    sub_opts.js.line_width = oxc_formatter_core::LineWidth::try_from(narrowed as u16).ok()?;
    let formatted = crate::format(raw_inner.trim_matches(['\n', '\r']), &sub_opts).ok()?;
    let formatted = formatted.trim_end_matches('\n');
    if formatted.is_empty() {
        return None;
    }

    // Determine which line-starts in `formatted` are element-direct whitespace
    // (→ tabs). Everything else stays spaces.
    let sub_root = parse(formatted, ParseOptions::default()).ok()?;
    let mut tab_lines: HashSet<usize> = HashSet::new();
    collect_pre_tab_lines(formatted, &sub_root.fragment, true, &mut tab_lines);

    // Re-indent every line: shift by `content_depth` levels; tab-marked lines use
    // tabs, the rest use spaces.
    let mut result = String::new();
    let mut offset = 0usize;
    for line in formatted.split('\n') {
        result.push('\n');
        let trimmed = line.trim_start_matches(' ');
        if !trimmed.is_empty() {
            let spaces = line.len() - trimmed.len();
            let real_depth = spaces / iw + content_depth;
            if tab_lines.contains(&offset) {
                for _ in 0..real_depth {
                    result.push('\t');
                }
            } else {
                for _ in 0..real_depth * iw {
                    result.push(' ');
                }
            }
            result.push_str(trimmed);
        }
        offset += line.len() + 1; // +1 for the '\n' split removed
    }
    // The close tag's own line: pre-direct trailing whitespace → tabs at the
    // element's depth (one less than its content).
    result.push('\n');
    for _ in 0..content_depth.saturating_sub(1) {
        result.push('\t');
    }

    let replacement = result;
    let current = out.get(inner_start..inner_end)?;
    (replacement != current).then_some((inner_start as u32, inner_end as u32, replacement))
}

/// Collect the line-start byte offsets in `formatted` whose indentation is
/// element-direct whitespace (preserved as tabs by oxfmt inside `<pre>`): a node
/// whose parent fragment belongs to a regular element, plus every element's own
/// closing-tag line. Block bodies (parent is a block) keep spaces.
fn collect_pre_tab_lines(
    formatted: &str,
    fragment: &Fragment,
    parent_is_element: bool,
    set: &mut std::collections::HashSet<usize>,
) {
    for node in &fragment.nodes {
        let ns = node_start(node) as usize;
        let line_start = formatted[..ns].rfind('\n').map_or(0, |i| i + 1);
        if parent_is_element
            && formatted[line_start..ns]
                .bytes()
                .all(|b| b == b' ' || b == b'\t')
        {
            set.insert(line_start);
        }
        // An element's own close tag is element-direct trailing whitespace.
        if let TemplateNode::RegularElement(e) = node {
            collect_pre_tab_lines(formatted, &e.fragment, true, set);
            let ne = node_end(node) as usize;
            let close_ls = formatted[..ne.saturating_sub(1)]
                .rfind('\n')
                .map_or(0, |i| i + 1);
            if close_ls != line_start
                && formatted[close_ls..]
                    .trim_start_matches([' ', '\t'])
                    .starts_with("</")
            {
                set.insert(close_ls);
            }
        } else {
            for child in child_fragments(node) {
                collect_pre_tab_lines(formatted, child, false, set);
            }
        }
    }
}

fn apply_edits(src: &str, mut edits: Vec<(u32, u32, String)>) -> String {
    edits.sort_by_key(|(start, _, _)| std::cmp::Reverse(*start));
    let mut result = src.to_string();
    for (start, end, text) in edits {
        result.replace_range(start as usize..end as usize, &text);
    }
    result
}

/// Recursively visit every expression mustache and member-chain-break any that
/// sits on an overflowing line (see [`try_break_inline_content_tag`]).
fn collect_content_tag_breaks(
    out: &str,
    fragment: &Fragment,
    line_width: usize,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) {
    for node in &fragment.nodes {
        if let TemplateNode::ExpressionTag(_) = node
            && let Some(edit) = try_break_inline_content_tag(out, node, line_width, options)
        {
            edits.push(edit);
        }
        for child in child_fragments(node) {
            collect_content_tag_breaks(out, child, line_width, options, edits);
        }
    }
}

/// The child fragments of a container node (for a generic recursive walk).
fn child_fragments(node: &TemplateNode) -> Vec<&Fragment> {
    match node {
        TemplateNode::RegularElement(e) => vec![&e.fragment],
        TemplateNode::Component(c) => vec![&c.fragment],
        TemplateNode::TitleElement(t) => vec![&t.fragment],
        TemplateNode::SvelteElement(e) => vec![&e.fragment],
        TemplateNode::SvelteBoundary(b) => vec![&b.fragment],
        TemplateNode::IfBlock(b) => {
            let mut v = vec![&b.consequent];
            if let Some(a) = &b.alternate {
                v.push(a);
            }
            v
        }
        TemplateNode::EachBlock(b) => {
            let mut v = vec![&b.body];
            if let Some(f) = &b.fallback {
                v.push(f);
            }
            v
        }
        TemplateNode::AwaitBlock(b) => {
            let mut v = Vec::new();
            if let Some(f) = &b.pending {
                v.push(f);
            }
            if let Some(f) = &b.then {
                v.push(f);
            }
            if let Some(f) = &b.catch {
                v.push(f);
            }
            v
        }
        TemplateNode::KeyBlock(b) => vec![&b.fragment],
        TemplateNode::SnippetBlock(b) => vec![&b.body],
        _ => Vec::new(),
    }
}

/// Whether `node` may sit inside a fragment-level inline prose run that the run
/// fill reflows. Text, mustaches/html-tags, and ONE-LINE inline elements
/// (`<input/>`, `<br/>`, an empty `<span/>`, or `<code>foo</code>` whose whole
/// rendering is currently on one line) qualify. A one-line inline element is safe
/// to fold into the run's single edit because recursing into it produces no edit
/// (its content already fits), so the two edits can't overlap. Block elements,
/// comments, components, and multi-line elements are run boundaries.
fn is_run_member(out: &str, node: &TemplateNode) -> bool {
    match node {
        TemplateNode::Text(_) | TemplateNode::ExpressionTag(_) | TemplateNode::HtmlTag(_) => true,
        TemplateNode::RegularElement(e) => {
            if is_block_display(e.name.as_str()) || is_whitespace_preserving(e.name.as_str()) {
                return false;
            }
            // A multi-line span has already broken (attrs / content) — leave it as
            // a boundary so we don't try to re-inline it (and so recursion, which
            // may still edit it, owns its layout).
            out.get(node_start(node) as usize..node_end(node) as usize)
                .is_some_and(|span| !span.contains('\n'))
        }
        _ => false,
    }
}

/// Reflow a fragment's inline prose runs (text words interspersed with one-line
/// inline elements) that overflow — e.g. a top-level `<input/> °C =\n<input/> °F`
/// run between a comment and `<style>`, or `<p>` body text with inline `<code>`
/// atoms. Only fires for a PROPER sub-run (the fragment also has non-inline
/// siblings); a whole-element inline body is handled by `try_fill_mixed` at the
/// element level instead. Each run that gets an edit also pushes its covered byte
/// span into `consumed` so `collect` skips recursing into the elements inside it
/// (their layout is now owned by the run edit — recursing would risk an
/// overlapping edit).
fn fill_inline_runs(
    out: &str,
    fragment: &Fragment,
    line_width: usize,
    edits: &mut Vec<(u32, u32, String)>,
    consumed: &mut Vec<(u32, u32)>,
) {
    let nodes = &fragment.nodes;
    if nodes.iter().all(|n| is_run_member(out, n)) {
        return; // whole fragment is one run — owned by the element-level fill
    }
    let mut i = 0;
    while i < nodes.len() {
        if !is_run_member(out, &nodes[i]) {
            i += 1;
            continue;
        }
        let mut j = i;
        while j < nodes.len() && is_run_member(out, &nodes[j]) {
            j += 1;
        }
        if let Some(edit) = try_fill_run(out, &nodes[i..j], line_width) {
            consumed.push((edit.0, edit.1));
            edits.push(edit);
        }
        i = j;
    }
}

/// Reflow one inline-prose run (a node slice) in place when it overflows.
fn try_fill_run(out: &str, run: &[TemplateNode], line_width: usize) -> Option<(u32, u32, String)> {
    // Trim whitespace-only edge text nodes — the surrounding layout owns them.
    let mut lo = 0;
    let mut hi = run.len();
    while lo < hi && matches!(&run[lo], TemplateNode::Text(t) if t.data.trim().is_empty()) {
        lo += 1;
    }
    while hi > lo && matches!(&run[hi - 1], TemplateNode::Text(t) if t.data.trim().is_empty()) {
        hi -= 1;
    }
    let run = &run[lo..hi];
    // Need prose: at least one text word. A run may be a pure-text paragraph
    // (`<p>` body text up to a multi-line `<svg>` sibling) or text interspersed
    // with childless inline elements — both reflow to printWidth here.
    let has_word = run
        .iter()
        .any(|n| matches!(n, TemplateNode::Text(t) if t.data.split_whitespace().next().is_some()));
    if !has_word {
        return None;
    }
    let first = run.first()?;
    let last = run.last()?;
    // The edit covers content only; an edge text node's leading/trailing
    // whitespace is the separator to the surrounding (non-run) siblings and must
    // survive (e.g. the blank line before a following `<style>`).
    let mut s = node_start(first) as usize;
    if let TemplateNode::Text(t) = first {
        let d = out.get(t.start as usize..t.end as usize)?;
        s += d.len() - d.trim_start().len();
    }
    let mut e = node_end(last) as usize;
    if let TemplateNode::Text(t) = last {
        let d = out.get(t.start as usize..t.end as usize)?;
        e -= d.len() - d.trim_end().len();
    }
    let whole = out.get(s..e)?;

    // The run must start at the beginning of its line so its column = that line's
    // indentation (all whitespace); otherwise we can't safely reflow it.
    let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
    let indent = out.get(line_start..s)?;
    if !indent.is_empty() && !indent.bytes().all(|b| b == b' ' || b == b'\t') {
        return None;
    }
    let indent_cols = indent.width();
    let content_doc = build_children_doc_nodes(out, run)?;
    let base_level = indent_cols / 2;
    // Flat width (a hardline forces multi-line).
    let flat = crate::doc::print(
        crate::doc::Doc::Group(vec![content_doc.clone()]),
        1_000_000,
        "  ",
        base_level,
        0,
    );
    if !flat.contains('\n') && indent_cols + flat.width() <= line_width {
        return None; // fits flat — leave as-is
    }
    let printed = crate::doc::print(content_doc, line_width, "  ", base_level, indent_cols);
    (printed != whole).then_some((s as u32, e as u32, printed))
}

fn collect(
    out: &str,
    fragment: &Fragment,
    line_width: usize,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) {
    let mut consumed: Vec<(u32, u32)> = Vec::new();
    fill_inline_runs(out, fragment, line_width, edits, &mut consumed);
    let in_consumed_run =
        |start: u32, end: u32| consumed.iter().any(|&(s, e)| s <= start && end <= e);
    for node in &fragment.nodes {
        match node {
            TemplateNode::RegularElement(elem) => {
                if is_whitespace_preserving(elem.name.as_str()) {
                    // `<pre>` / `<textarea>` preserve whitespace, so collapse never
                    // reflows their text — but a sole content mustache whose
                    // expression overflows still wraps (the JS is formatted), with
                    // `<pre>{` and `}</pre>` glued. The shared format-time width
                    // check under-counts the glued tag prefix, so handle it here.
                    if matches!(elem.name.as_str(), "pre" | "textarea")
                        && let Some(edit) = try_break_pre_content_tag(
                            out,
                            elem.name.as_str(),
                            elem.start,
                            elem.end,
                            &elem.fragment,
                            line_width,
                            options,
                        )
                    {
                        edits.push(edit);
                    }
                    continue;
                }
                // A run fill already reflowed this element inline — its layout is
                // owned by that edit, so recursing would risk an overlapping edit.
                if in_consumed_run(elem.start, elem.end) {
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
                    options,
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
                } else if let Some(edit) = try_break_content_tag_block(
                    out,
                    elem.name.as_str(),
                    elem.start,
                    elem.end,
                    &elem.fragment,
                    line_width,
                    options,
                ) {
                    edits.push(edit);
                } else {
                    collect(out, &elem.fragment, line_width, options, edits);
                }
            }
            TemplateNode::Component(c) => {
                if let Some(edit) = try_collapse(
                    out,
                    c.name.as_str(),
                    c.start,
                    c.end,
                    &c.fragment,
                    line_width,
                ) {
                    edits.push(edit);
                } else if let Some(edit) = try_hug_mixed(
                    out,
                    c.name.as_str(),
                    c.start,
                    c.end,
                    &c.fragment,
                    line_width,
                ) {
                    edits.push(edit);
                } else {
                    collect(out, &c.fragment, line_width, options, edits);
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
                    collect(out, &t.fragment, line_width, options, edits);
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
                    collect(out, &s.fragment, line_width, options, edits);
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
                    collect(out, &s.fragment, line_width, options, edits);
                }
            }
            TemplateNode::SvelteHead(s)
            | TemplateNode::SvelteBody(s)
            | TemplateNode::SvelteDocument(s)
            | TemplateNode::SvelteFragment(s)
            | TemplateNode::SvelteOptions(s)
            | TemplateNode::SvelteSelf(s)
            | TemplateNode::SvelteWindow(s) => {
                collect(out, &s.fragment, line_width, options, edits)
            }
            TemplateNode::SvelteComponent(c) => {
                collect(out, &c.fragment, line_width, options, edits)
            }
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
                    collect(out, &e.fragment, line_width, options, edits);
                }
            }
            TemplateNode::IfBlock(blk) => {
                collect(out, &blk.consequent, line_width, options, edits);
                if let Some(alt) = &blk.alternate {
                    collect(out, alt, line_width, options, edits);
                }
            }
            TemplateNode::EachBlock(blk) => {
                if let Some(edit) =
                    try_hug_block_inline_body(out, blk.start, blk.end, &blk.body, line_width)
                {
                    edits.push(edit);
                } else {
                    collect(out, &blk.body, line_width, options, edits);
                }
                if let Some(fb) = &blk.fallback {
                    collect(out, fb, line_width, options, edits);
                }
            }
            TemplateNode::AwaitBlock(blk) => {
                if let Some(f) = &blk.pending {
                    collect(out, f, line_width, options, edits);
                }
                if let Some(f) = &blk.then {
                    collect(out, f, line_width, options, edits);
                }
                if let Some(f) = &blk.catch {
                    collect(out, f, line_width, options, edits);
                }
            }
            TemplateNode::KeyBlock(blk) => {
                if let Some(edit) =
                    try_hug_block_inline_body(out, blk.start, blk.end, &blk.fragment, line_width)
                {
                    edits.push(edit);
                } else {
                    collect(out, &blk.fragment, line_width, options, edits);
                }
            }
            TemplateNode::SnippetBlock(blk) => collect(out, &blk.body, line_width, options, edits),
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

/// Break the member chain / binary of an inline expression mustache that sits on
/// an overflowing line, in place. Used for a mustache glued into a hugged inline
/// element's mixed body (`<td\n  >\u{a}\u{emoji.charCodeAt(1).toString(16)}</td`)
/// where the open tag already broke but the long trailing expression kept its
/// chain on one line. Reformats just the `{…}` span, leaving the surrounding
/// text/expressions untouched.
fn try_break_inline_content_tag(
    out: &str,
    node: &TemplateNode,
    line_width: usize,
    options: &FormatOptions,
) -> Option<(u32, u32, String)> {
    let es = node_start(node) as usize;
    let ee = node_end(node) as usize;
    let span = out.get(es..ee)?; // `{expr}`
    if !span.starts_with('{') || !span.ends_with('}') || span.contains('\n') || span.len() <= 2 {
        return None;
    }
    let line_start = out[..es].rfind('\n').map_or(0, |i| i + 1);
    let line_end = out[ee..].find('\n').map_or(out.len(), |i| ee + i);
    let line = out.get(line_start..line_end)?;
    if line.width() <= line_width {
        return None; // line fits — nothing to break
    }
    // Break only the RIGHTMOST mustache on the overflowing line: breaking it pulls
    // everything after its first member down, which resolves the overflow. An
    // earlier mustache (another `{…}` still follows on the line) is left flat —
    // prettier breaks only the chain straddling the edge (`\u{a}\u{b.c().d()}`
    // breaks just `{b…}`).
    if out.get(ee..line_end)?.contains('{') {
        return None;
    }
    let start_col = current_column(out, es as u32);
    // Continuation lands at the line's own indent + one level (the chain dots).
    let indent = &out[line_start..es];
    let lead_ws: String = indent.chars().take_while(|c| c.is_whitespace()).collect();
    let cont_cols = lead_ws.width();
    // Force oxc to break: narrow the width by the columns the inner expression
    // already sits at (its start column) plus the glued trailing text (`}</td…`).
    let inner_start_col = start_col + 1; // past the `{`
    let trailing = out.get(ee..line_end)?.width();
    let width = line_width
        .saturating_sub(inner_start_col + 1 + trailing)
        .max(1);
    let inner = span.get(1..span.len() - 1)?.trim();
    let wrapped =
        crate::expression::reformat_content_at_width(inner, options, width, cont_cols).ok()?;
    if !wrapped.contains('\n') {
        return None; // didn't break — leave it
    }
    let broken = format!("{{{wrapped}}}");
    (broken != span).then_some((es as u32, ee as u32, broken))
}

/// Wrap the sole content-tag child of a whitespace-preserving element
/// (`<pre>{expr}</pre>`) when its one-line rendering overflows. Unlike a block
/// element, the tags stay glued to the content (no surrounding newlines — the
/// element preserves whitespace), so only the expression breaks internally with
/// its continuation lines pushed out two levels past the element's indent:
///   <pre>{part.value.name +
///       "\n" +
///       part.value.stack.replace(/^\n+/, "")}</pre>
fn try_break_pre_content_tag(
    out: &str,
    tag: &str,
    start: u32,
    end: u32,
    fragment: &Fragment,
    line_width: usize,
    options: &FormatOptions,
) -> Option<(u32, u32, String)> {
    // Exactly one child, an expression tag (the only content-tag kind that
    // appears glued inside `<pre>` / `<textarea>` in practice).
    if fragment.nodes.len() != 1 {
        return None;
    }
    let node = &fragment.nodes[0];
    let TemplateNode::ExpressionTag(_) = node else {
        return None;
    };
    let (s, e) = (start as usize, end as usize);
    let whole = out.get(s..e)?;
    let cs = node_start(node) as usize;
    let ce = node_end(node) as usize;
    let open = out.get(s..cs)?; // `<pre>`
    let close = out.get(ce..e)?; // `</pre>`
    let span = out.get(cs..ce)?; // `{expr}`
    // Only an as-yet-unbroken, overflowing element (a multi-line span was already
    // wrapped at format time — leave it).
    if open.contains('\n') || span.contains('\n') || span.len() <= 2 {
        return None;
    }
    let column = current_column(out, start);
    if column + open.width() + span.width() + close.width() <= line_width {
        return None; // fits on one line
    }
    let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
    let indent = out.get(line_start..s)?;
    if !indent.bytes().all(|b| b == b' ' || b == b'\t') {
        return None;
    }
    // Continuation lines sit one indent level past the element; the expression
    // formatter adds its own level for the broken binary on top of that.
    let iw = options.js.indent_width.value() as usize;
    let cont_cols = indent.width() + iw;
    let inner = span.get(1..span.len() - 1)?.trim(); // strip the `{` … `}`
    // Force the top-level expression to break: the last line carries `}</pre>`,
    // which oxc can't see, so narrow the width by that glued suffix.
    let suffix = 1 + close.width(); // `}` + `</tag>`
    let width = line_width.saturating_sub(cont_cols + suffix).max(1);
    let wrapped =
        crate::expression::reformat_content_at_width(inner, options, width, cont_cols).ok()?;
    if !wrapped.contains('\n') {
        return None; // didn't actually break
    }
    let broken = format!("{open}{{{wrapped}}}{close}");
    (broken != whole).then_some((start, end, broken))
}

/// Hug-break the single inline-element body of a block (`{#each …}<span>…</span>{/each}`)
/// when the whole one-line block overflows. prettier keeps the body inline-adjacent
/// to the block tags (no whitespace in source) and, on overflow, hugs the element:
/// the close `>` drops to its own indented line with the block close tag glued
/// after it —
///   {#each group.breadcrumbs as breadcrumb}<span>{breadcrumb}</span
///     >{/each}
/// Returns the edit when the block currently renders all on one line and overflows.
fn try_hug_block_inline_body(
    out: &str,
    start: u32,
    end: u32,
    body: &Fragment,
    line_width: usize,
) -> Option<(u32, u32, String)> {
    let (s, e) = (start as usize, end as usize);
    let whole = out.get(s..e)?;
    // Only a block that currently renders entirely on one line.
    if whole.contains('\n') {
        return None;
    }
    // Body must be exactly one huggable inline element (directly adjacent to both
    // block tags — guaranteed single-line by `whole` having no newline).
    if body.nodes.len() != 1 {
        return None;
    }
    let elem = &body.nodes[0];
    let (open_nb, content, tag) = element_hug_parts(out, elem)?;
    let elem_start = node_start(elem) as usize;
    let elem_end = node_end(elem) as usize;
    // The block's close tag must glue directly to the element (no whitespace).
    let close = out.get(elem_end..e)?;
    if !close.starts_with("{/") {
        return None;
    }
    // The block must sit at the start of its line (indent = whitespace prefix).
    let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
    let indent = out.get(line_start..s)?;
    if !indent.bytes().all(|b| b == b' ' || b == b'\t') {
        return None;
    }
    if indent.width() + whole.width() <= line_width {
        return None; // fits on one line
    }
    let prefix = out.get(s..elem_start)?; // block open tag (+ no leading ws)
    let hug = format!("{prefix}{open_nb}>{content}</{tag}\n{indent}  >{close}");
    (hug != whole).then_some((start, end, hug))
}

/// Inline-block elements (prettier `CSS_DISPLAY_DEFAULTS`) — display:inline-block.
/// They are not huggable: on overflow they block-break rather than hug.
fn is_inline_block(tag: &str) -> bool {
    matches!(
        tag,
        "input" | "button" | "select" | "object" | "video" | "audio"
    )
}

/// Break a BLOCK element whose only child is a single content tag (`{expr}` /
/// `{@html …}` / `{@render …}`) onto its own line and wrap that tag's expression
/// at the resulting column when the element overflows:
///   <h1>
///     {@html foo(
///       …
///     )}
///   </h1>
/// Restricted to a single content-tag child so it can't disturb prose / multi-
/// child content (which the fill / hug paths own).
fn try_break_content_tag_block(
    out: &str,
    tag: &str,
    start: u32,
    end: u32,
    fragment: &Fragment,
    line_width: usize,
    options: &FormatOptions,
) -> Option<(u32, u32, String)> {
    if !is_block_display(tag) {
        return None;
    }
    // Exactly one non-whitespace child, and it must be a content tag.
    let mut child: Option<&TemplateNode> = None;
    for n in &fragment.nodes {
        if matches!(n, TemplateNode::Text(t) if t.data.trim().is_empty()) {
            continue;
        }
        if child.is_some() {
            return None;
        }
        child = Some(n);
    }
    let node = child?;
    // `(lead, trail)` = the wrapper columns around the expression: `{@html ` / `}`.
    let (kw_lead, kw_trail) = match node {
        TemplateNode::HtmlTag(_) => (7usize, 1usize), // `{@html ` … `}`
        TemplateNode::RenderTag(_) => (9, 1),         // `{@render ` … `}`
        TemplateNode::ExpressionTag(_) => (1, 1),     // `{` … `}`
        _ => return None,
    };

    let (s, e) = (start as usize, end as usize);
    let whole = out.get(s..e)?;
    let cs = node_start(node) as usize;
    let ce = node_end(node) as usize;
    let open = out.get(s..cs)?;
    let close = out.get(ce..e)?;
    let span = out.get(cs..ce)?; // the content tag, e.g. `{@html …}`
    if open.contains('\n') || span.contains('\n') || span.len() <= kw_lead + kw_trail {
        return None;
    }
    let column = current_column(out, start);
    if column + open.width() + span.width() + close.width() <= line_width {
        return None; // fits on one line
    }

    let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
    let indent = out.get(line_start..s)?;
    if !indent.bytes().all(|b| b == b' ' || b == b'\t') {
        return None;
    }
    let inner_indent = format!("{indent}  ");

    let inner = span.get(kw_lead..span.len() - kw_trail)?.trim();
    let width = line_width.saturating_sub(inner_indent.width() + kw_lead + kw_trail);
    let wrapped =
        crate::expression::reformat_content_at_width(inner, options, width, inner_indent.width())
            .ok()?;
    let kw_prefix = &span[..kw_lead]; // `{@html ` / `{`
    let new_tag = format!("{kw_prefix}{wrapped}}}");
    let broken = format!("{open}\n{inner_indent}{new_tag}\n{indent}{close}");
    (broken != whole).then_some((start, end, broken))
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
    // Inline elements hug (prettier's `blockElements` excludes button/input/…),
    // so only true block elements and raw-text elements are ineligible.
    if is_block_display(tag) || is_whitespace_preserving(tag) {
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
    if !open.ends_with('>') || !close.starts_with("</") {
        return None;
    }
    let raw = out.get(content_start..content_end)?;
    // Hug only when content is directly adjacent to BOTH tags (shouldHugStart /
    // shouldHugEnd). Whitespace-separated content is `try_fill_mixed`'s job.
    if raw.starts_with([' ', '\t', '\r', '\n']) || raw.ends_with([' ', '\t', '\r', '\n']) {
        return None;
    }
    // Only act on currently-one-line content; multi-line content is left alone
    // (its exact reflow needs the full element-group model).
    if raw.contains('\n') {
        return None;
    }
    let column = current_column(out, start);

    let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
    let indent = out.get(line_start..s)?;
    if !indent.bytes().all(|b| b == b' ' || b == b'\t') {
        return None;
    }

    // A multi-line open tag means markup already attribute-wrapped it. prettier's
    // hugged-content group glues `>{content}</tag` to the last attribute line (with
    // the final `>` on its own line) when it fits after the last attr, otherwise
    // it drops the content to its own indented line. Markup can't decide this (no
    // content awareness) — and may have dropped the open `>` to its own line — so
    // finish the decision here, re-gluing to the real last attribute line.
    if open.contains('\n') {
        // Strip the open `>` and any whitespace markup left before a dropped `>`,
        // exposing the real last attribute line.
        let onb = open[..open.len() - 1].trim_end();
        let last_line = onb.rsplit('\n').next().unwrap_or(onb);
        let glued = last_line.width() + 1 + raw.width() + 2 + tag.width();
        let result = if glued <= line_width {
            format!("{onb}>{raw}</{tag}\n{indent}>")
        } else {
            let inner_indent = format!("{indent}  ");
            format!("{onb}\n{inner_indent}>{raw}</{tag}\n{indent}>")
        };
        return (result != whole).then_some((start, end, result));
    }

    let element_one_line = column + open.width() + raw.width() + close.width();
    if element_one_line <= line_width {
        return None; // fits as-is
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
    options: &FormatOptions,
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

    // Prose content (text words interspersed with tags/elements) is always
    // re-flowed. Content made of only elements / expressions is re-flowed ONLY
    // when the source forces a break (a `hardline` survives the flat render — a
    // source blank line or a newline between two non-text nodes). Otherwise such
    // content stays on one line / is hugged, so leave it to the hug / indent
    // passes (prettier doesn't prose-fill space-separated mustaches that fit).
    let has_text_word = fragment
        .nodes
        .iter()
        .any(|n| matches!(n, TemplateNode::Text(t) if t.data.split_whitespace().next().is_some()));
    if !has_text_word && !flat.contains('\n') {
        return None;
    }

    if !flat.contains('\n') {
        let element_one_line = column + open.width() + flat.width() + close.width();
        // A block element whose flat element line overflows puts its content on
        // its own line; an inline element would instead hug, so leave those.
        if element_one_line <= line_width || !is_block_display(tag) {
            return None;
        }
    }
    let mut printed = crate::doc::print(
        content_doc,
        line_width,
        "  ",
        base_level,
        inner_indent.width(),
    );

    // Post-pass: a trailing content mustache `{call(...)}` that is glued to the
    // preceding content (no break point before it, e.g. `…:{pad(x)}`) can't move
    // to its own line, so when it overflows it must wrap its own call args. The
    // doc fill treats it as one atom, so re-format it here at its actual column.
    if printed.lines().count() <= 1
        && let Some(last) = fragment.nodes.last()
        && matches!(last, TemplateNode::ExpressionTag(_))
    {
        let mspan = out.get(node_start(last) as usize..node_end(last) as usize)?;
        let glued_after_nonspace = printed
            .strip_suffix(mspan)
            .and_then(|p| p.chars().next_back())
            .is_some_and(|c| !c.is_whitespace());
        let inner = mspan
            .strip_prefix('{')
            .and_then(|s| s.strip_suffix('}'))
            .map(str::trim)
            .unwrap_or("");
        let mcol = inner_indent.width() + printed.width().saturating_sub(mspan.width());
        // Only a call / member chain (not an object / array / arrow literal) wraps
        // by breaking its own internals; leave those to other paths.
        let wrappable =
            !inner.is_empty() && !inner.contains("=>") && !inner.starts_with(['{', '[']);
        if glued_after_nonspace && wrappable && mcol + mspan.width() > line_width {
            let w = line_width.saturating_sub(mcol + 2); // `{` + `}`
            if let Ok(wrapped) = crate::expression::reformat_content_at_width(
                inner,
                options,
                w,
                inner_indent.width(),
            ) && wrapped.contains('\n')
            {
                let head = &printed[..printed.len() - mspan.len()];
                printed = format!("{head}{{{wrapped}}}");
            }
        }
    }

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
    build_children_doc_nodes(out, &fragment.nodes)
}

fn build_children_doc_nodes(out: &str, nodes: &[TemplateNode]) -> Option<crate::doc::Doc> {
    use crate::doc::Doc;
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

/// Build a wrappable open-tag doc (`<tag` + an attribute group) for a regular
/// element, so a long open tag can break its attributes onto their own lines —
/// prettier's `['<', name, indent(group([line, attr1, line, attr2, …]))]` for a
/// hugging element (no trailing softline; the `>` belongs to the hugged content).
/// Returns `None` (caller keeps the atomic open string) when there are no
/// attributes or any attribute is multi-line in the formatted output.
fn build_open_attr_doc(out: &str, node: &TemplateNode, tag: &str) -> Option<crate::doc::Doc> {
    use crate::doc::Doc;
    let TemplateNode::RegularElement(e) = node else {
        return None;
    };
    if e.attributes.is_empty() {
        return None;
    }
    let mut group_parts: Vec<Doc> = Vec::with_capacity(e.attributes.len() * 2);
    for attr in &e.attributes {
        let (as_, ae) = attribute_span(attr);
        let atext = out.get(as_ as usize..ae as usize)?;
        if atext.contains('\n') {
            return None; // a multi-line attribute can't sit in this flat group
        }
        group_parts.push(Doc::Line);
        group_parts.push(Doc::Text(atext.to_string()));
    }
    Some(Doc::Concat(vec![
        Doc::Text(format!("<{tag}")),
        Doc::Indent(vec![Doc::Group(group_parts)]),
    ]))
}

/// Source span of an attribute, mirroring `markup::attribute_span`.
fn attribute_span(attr: &rsvelte_core::ast::template::Attribute) -> (u32, u32) {
    use rsvelte_core::ast::template::Attribute;
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
        // The open tag is normally atomic, but when it has attributes build it as
        // a wrappable attribute group so a long open tag inside prose can break
        // its attributes onto their own lines (`<a`\n`  href="…">text</a`\n`>`).
        let open_doc = build_open_attr_doc(out, node, &tag).unwrap_or(Doc::Text(open_no_bracket));
        // prettier's `hugStart && hugEnd` doc: the hugged content lives in its
        // OWN group so `>{content}</tag` stays glued to the open tag when it fits
        // (only the trailing `>` drops to its own line), independent of whether
        // the outer element group breaks.
        return Some(Doc::Group(vec![
            open_doc,
            Doc::Group(vec![Doc::Indent(vec![
                Doc::Softline,
                Doc::Group(vec![Doc::Text(format!(">{content}</{tag}"))]),
            ])]),
            Doc::Softline,
            Doc::Text(">".to_string()),
        ]));
    }
    // Empty inline element with attributes (`<span class=… aria-label=…></span>`):
    // wrap the attributes and drop `></tag>` to its own line at the base indent
    // when the open tag overflows.
    if let TemplateNode::RegularElement(e) = node {
        let tag = e.name.as_str();
        if e.fragment.nodes.is_empty()
            && !e.attributes.is_empty()
            && !is_block_display(tag)
            && !is_whitespace_preserving(tag)
        {
            let span = out.get(node_start(node) as usize..node_end(node) as usize)?;
            // Only the `<tag …attrs></tag>` shape (not self-closing, no content).
            if !span.contains('\n')
                && span.ends_with(&format!("></{tag}>"))
                && let Some(open_doc) = build_open_attr_doc(out, node, tag)
            {
                return Some(Doc::Group(vec![
                    open_doc,
                    Doc::Softline,
                    Doc::Text(format!("></{tag}>")),
                ]));
            }
        }
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
