use super::{
    FormatOptions, Fragment, IndentUnit, TemplateNode, attribute_span, block_branch_bounds,
    did_self_close, element_hug_parts, element_source_empty, ends_with_space_no_break,
    is_block_display, is_html_void_element, is_html_ws, is_inline_block, is_inline_regular_element,
    is_whitespace_preserving, leading_linebreaks, node_end, node_start, node_to_child,
    omit_softline_allowed, split_html_ws, starts_with_space_no_break, trailing_linebreaks,
    trim_html_ws_end, trim_html_ws_start,
};

/// prettier-plugin-svelte's `printSvelteBlockChildren`:
/// `[indent([startline, group(printChildren(…))]), endline]`.
///
/// `startline` / `endline` are dropped when the branch's tag hugs its first /
/// last child (`checkWhitespaceAtStartOfSvelteBlock` → `'none'`), which is what
/// keeps `{#if a}x{/if}` flat. Otherwise prettier picks `line` or `hardline`, but
/// the enclosing block group always carries a `breakParent`, so both render as a
/// newline and a hardline stands in for either.
pub(super) fn build_block_branch_doc(
    out: &str,
    frag: &Fragment,
    start: usize,
    end: usize,
    line_width: usize,
    options: &FormatOptions,
) -> Option<Vec<crate::doc::Doc>> {
    use crate::children::Child;
    use crate::doc::Doc;
    let raw = out.get(start..end)?;
    let hug_start = !raw.starts_with(|c: char| c.is_ascii_whitespace());
    let hug_end = !raw.ends_with(|c: char| c.is_ascii_whitespace());

    let mut children: Vec<Child> = Vec::with_capacity(frag.nodes.len());
    for n in &frag.nodes {
        children.push(node_to_child(out, n, line_width, options)?);
    }
    // The branch tag owns its own outer whitespace, so trim it off the edge text
    // children (prettier's `trimTextNodeLeft` / `trimTextNodeRight`).
    if let Some(Child::Text(t)) = children.first_mut() {
        *t = trim_html_ws_start(t).to_string();
    }
    if let Some(Child::Text(t)) = children.last_mut() {
        *t = trim_html_ws_end(t).to_string();
    }

    let mut inner: Vec<Doc> = Vec::new();
    if !hug_start {
        inner.push(Doc::Hardline);
    }
    inner.push(Doc::Group(crate::children::print_children(children)));
    let mut parts = vec![Doc::Indent(inner)];
    if !hug_end {
        parts.push(Doc::Hardline);
    }
    Some(parts)
}

/// Build an `{#if}` chain's Doc, mirroring prettier's `IfBlock` print plus
/// `printIfBlockAlternate`: `group([def, breakParent])`. svelte desugars
/// `{:else if}` into an alternate whose sole child is an `elseif` `IfBlock`, so the
/// chain is walked iteratively (each branch tag is the verbatim source between
/// the previous branch's content and the next one's).
pub(super) fn build_if_block_doc(
    out: &str,
    blk: &rsvelte_core::ast::template::IfBlock,
    line_width: usize,
    options: &FormatOptions,
) -> Option<crate::doc::Doc> {
    use crate::doc::Doc;
    let mut parts: Vec<Doc> = Vec::new();
    let mut cur = blk;
    let mut tok_start = blk.start as usize;
    loop {
        let (cs, ce) = block_branch_bounds(out, &cur.consequent)?;
        parts.push(Doc::Text(out.get(tok_start..cs)?.to_string()));
        parts.extend(build_block_branch_doc(
            out,
            &cur.consequent,
            cs,
            ce,
            line_width,
            options,
        )?);
        tok_start = ce;
        let Some(alt) = &cur.alternate else { break };
        if let Some(chained) = crate::indent::else_if_branch(alt) {
            cur = chained;
        } else {
            let (as_, ae) = block_branch_bounds(out, alt)?;
            parts.push(Doc::Text(out.get(tok_start..as_)?.to_string()));
            parts.extend(build_block_branch_doc(
                out, alt, as_, ae, line_width, options,
            )?);
            tok_start = ae;
            break;
        }
    }
    parts.push(Doc::Text(out.get(tok_start..blk.end as usize)?.to_string()));
    Some(Doc::Group(vec![Doc::Concat(parts), Doc::BreakParent]))
}

/// Build the Doc for a flow block whose branches don't chain (`{#each}` with its
/// optional `{:else}` fallback, `{#key}`). Same `group([def, breakParent])` shape
/// as [`build_if_block_doc`]; each branch tag is the verbatim source between the
/// previous branch's content and the next one's.
pub(super) fn build_simple_block_doc(
    out: &str,
    start: u32,
    end: u32,
    branches: &[&Fragment],
    line_width: usize,
    options: &FormatOptions,
) -> Option<crate::doc::Doc> {
    use crate::doc::Doc;
    let mut parts: Vec<Doc> = Vec::new();
    let mut tok_start = start as usize;
    for frag in branches {
        let (cs, ce) = block_branch_bounds(out, frag)?;
        parts.push(Doc::Text(out.get(tok_start..cs)?.to_string()));
        parts.extend(build_block_branch_doc(
            out, frag, cs, ce, line_width, options,
        )?);
        tok_start = ce;
    }
    parts.push(Doc::Text(out.get(tok_start..end as usize)?.to_string()));
    Some(Doc::Group(vec![Doc::Concat(parts), Doc::BreakParent]))
}

/// Build the faithful `children::build_element_doc` Doc for an inline
/// `RegularElement`, recursing on its children via [`node_to_child`]. Returns
/// `None` if any child is unsupported or an attribute span is multi-line.
pub(super) fn build_inline_element_doc(
    out: &str,
    e: &rsvelte_core::ast::template::RegularElement,
    line_width: usize,
    options: &FormatOptions,
) -> Option<crate::doc::Doc> {
    use crate::children::{Child, ElementLayout, build_element_doc};
    let attrs = build_attrs_concat(out, &e.attributes, options)?;
    let mut children: Vec<Child> = Vec::with_capacity(e.fragment.nodes.len());
    for n in &e.fragment.nodes {
        children.push(node_to_child(out, n, line_width, options)?);
    }
    let children = layout_children(out, &e.fragment.nodes, e.start, children);
    Some(build_element_doc(ElementLayout {
        name: e.name.to_string(),
        attrs,
        children,
        is_inline: !is_block_display(e.name.as_str()),
        self_closing: did_self_close(out, e.end) || is_html_void_element(e.name.as_str()),
        omit_softline_allowed: omit_softline_allowed(out, e.end),
    }))
}

/// Component doc for [`node_to_child`]. prettier's `isInlineElement` /
/// `isBlockElement` both require `type === 'RegularElement'`, so a Component is
/// neither — `printChildren` pushes it bare, which is `Child::Other`.
pub(super) fn build_component_doc(
    out: &str,
    c: &rsvelte_core::ast::template::Component,
    line_width: usize,
    options: &FormatOptions,
) -> Option<crate::doc::Doc> {
    use crate::children::{Child, ElementLayout, build_element_doc};
    let attrs = build_attrs_concat(out, &c.attributes, options)?;
    let mut children: Vec<Child> = Vec::with_capacity(c.fragment.nodes.len());
    for n in &c.fragment.nodes {
        children.push(node_to_child(out, n, line_width, options)?);
    }
    let children = layout_children(out, &c.fragment.nodes, c.start, children);
    Some(build_element_doc(ElementLayout {
        name: c.name.to_string(),
        attrs,
        children,
        // `is_inline` gates hugging, not the child classification: prettier's
        // `shouldHugStart`/`End` only bail for block elements, and a Component is
        // never one.
        is_inline: true,
        self_closing: did_self_close(out, c.end),
        omit_softline_allowed: omit_softline_allowed(out, c.end),
    }))
}

/// Build the `attrs` Doc for [`crate::children::ElementLayout`] — the inner
/// attribute concat that `build_element_doc` places inside
/// `<name` + `Indent(Group([attrs, opener_trailing]))`. Mirrors prettier's
/// per-attribute `[line, attr]` join: `Concat([Line, attr1, Line, attr2, …])`,
/// or `Text("")` when there are no attributes. Reads each attribute's OWN source
/// span (single-line even when the open tag was already wrapped across lines in
/// `out`); returns `None` if any attribute span is itself multi-line.
pub(super) fn build_attrs_concat(
    out: &str,
    attrs: &[rsvelte_core::ast::template::Attribute],
    options: &FormatOptions,
) -> Option<crate::doc::Doc> {
    use crate::doc::Doc;
    if attrs.is_empty() {
        return Some(Doc::Text(String::new()));
    }
    // prettier's `attributeLine`: `singleAttributePerLine` joins a multi-attribute
    // tag with `hardline` instead of `line`, so the tag breaks regardless of width.
    let sep = if options.attributes.single_attribute_per_line && attrs.len() > 1 {
        Doc::Hardline
    } else {
        Doc::Line
    };
    let mut parts: Vec<Doc> = Vec::with_capacity(attrs.len() * 2);
    for attr in attrs {
        let (as_, ae) = attribute_span(attr);
        let atext = out.get(as_ as usize..ae as usize)?;
        if atext.contains('\n') {
            return None;
        }
        parts.push(sep.clone());
        parts.push(Doc::Text(atext.to_string()));
    }
    Some(Doc::Concat(parts))
}

/// element's hug `Group`. Boundary whitespace is handled so an element can hug in
/// place (the preceding text fill's trailing `line` stays flat) or move to a
/// fresh line (a `hardline`). The first child's leading and last child's trailing
/// whitespace are dropped (the element wrapper owns that newline).
///
/// `options` is what lets a content tag be modelled as a breakable group rather
/// than an atom; without it the hug's `>` … `</tag` columns are measured against
/// a tag that can never absorb them.
pub(super) fn build_children_doc(
    out: &str,
    fragment: &Fragment,
    options: Option<&FormatOptions>,
) -> Option<crate::doc::Doc> {
    build_children_doc_nodes(out, &fragment.nodes, false, false, options)
}

/// Build a breakable `group([RawExpr{flat, broken}])` for a content-level tag
/// (`{expr}` / `{@render …}`) so it participates in a prose fill exactly like
/// prettier-plugin-svelte: the tag's own group decides flat-vs-broken via `fits`,
/// and a trailing prose word glues to the closing `)}` (through the following
/// fill's leading `line`) instead of dropping to a fresh line. Returns `None`
/// when the tag can't be flattened or doesn't break into an argument block — the
/// caller then keeps the atomic-text path.
pub(super) fn content_tag_breakable_doc(
    out: &str,
    node: &TemplateNode,
    options: &FormatOptions,
) -> Option<crate::doc::Doc> {
    use crate::doc::Doc;
    let span = out.get(node_start(node) as usize..node_end(node) as usize)?;
    let (prefix, expr_src): (&str, &str) = match node {
        TemplateNode::ExpressionTag(_) => ("", span.strip_prefix('{')?.strip_suffix('}')?.trim()),
        TemplateNode::RenderTag(t) => {
            let (Some(s), Some(e)) = (t.expression.start(), t.expression.end()) else {
                return None;
            };
            ("@render ", out.get(s as usize..e as usize)?.trim())
        }
        TemplateNode::HtmlTag(t) => {
            let (Some(s), Some(e)) = (t.expression.start(), t.expression.end()) else {
                return None;
            };
            ("@html ", out.get(s as usize..e as usize)?.trim())
        }
        _ => return None,
    };
    if expr_src.is_empty() {
        return None;
    }
    // Canonical flat inner (one line). Bail if it can't be flattened.
    let flat_inner =
        crate::expression::reformat_content_at_width(expr_src, options, u16::MAX as usize, 0)
            .ok()?;
    if flat_inner.contains('\n') {
        return None;
    }
    // Keep the flat form byte-verbatim when the tag is already single-line in the
    // formatted output (no drift); reconstruct it only for an already-broken tag.
    let flat = if span.contains('\n') {
        format!("{{{prefix}{flat_inner}}}")
    } else {
        span.to_string()
    };
    let src = crate::doc::RawExprSource {
        expr: expr_src.to_string(),
        prefix: prefix.to_string(),
        options: std::sync::Arc::new(options.clone()),
    };
    // The column-unaware shape: all a doc builder can know, and the fallback for
    // a print-time rebuild that fails.
    let lines = crate::expression::raw_expr::broken_lines(&src, usize::MAX)?;
    Some(Doc::Group(vec![Doc::RawExpr {
        flat,
        broken: lines,
        src: Some(Box::new(src)),
    }]))
}

/// Source of the `[<!-- prettier-ignore -->, ignored node]` pair at `i` when the
/// comment is glued directly to a single-line node: prettier keeps filling the
/// surrounding prose across such a pair, printing only its source verbatim.
pub(super) fn inline_ignore_atom<'a>(
    out: &'a str,
    nodes: &[TemplateNode],
    i: usize,
) -> Option<&'a str> {
    let comment = nodes.get(i)?;
    if !crate::prettier_ignore::is_prettier_ignore_comment(comment) {
        return None;
    }
    let ignored = nodes.get(i + 1)?;
    if node_end(comment) != node_start(ignored) {
        return None;
    }
    let span = out.get(node_start(comment) as usize..node_end(ignored) as usize)?;
    (!span.contains('\n')).then_some(span)
}

fn append_non_text_doc(
    out: &str,
    node: &TemplateNode,
    options: Option<&FormatOptions>,
    docs: &mut Vec<crate::doc::Doc>,
    ws_prev: &mut bool,
) -> Option<()> {
    use crate::doc::Doc;
    if is_inline_regular_element(node) {
        let element = element_doc(out, node)?;
        if *ws_prev {
            docs.push(Doc::Group(vec![Doc::Line, element]));
        } else {
            docs.push(element);
        }
        *ws_prev = false;
        return Some(());
    }
    if let Some(options) = options
        && matches!(
            node,
            TemplateNode::ExpressionTag(_) | TemplateNode::HtmlTag(_) | TemplateNode::RenderTag(_)
        )
        && let Some(doc) = content_tag_breakable_doc(out, node, options)
    {
        docs.push(doc);
        *ws_prev = false;
        return Some(());
    }
    let span = out.get(node_start(node) as usize..node_end(node) as usize)?;
    if span.contains('\n') {
        return None;
    }
    let element = if matches!(node, TemplateNode::Component(component) if component.fragment.nodes.is_empty())
    {
        build_self_closing_component_doc(out, node)
            .or_else(|| element_doc(out, node))
            .unwrap_or_else(|| Doc::Text(span.to_string()))
    } else if matches!(node, TemplateNode::Component(_)) {
        element_doc(out, node).unwrap_or_else(|| Doc::Text(span.to_string()))
    } else {
        build_self_closing_component_doc(out, node).unwrap_or_else(|| Doc::Text(span.to_string()))
    };
    if *ws_prev {
        docs.push(Doc::Group(vec![Doc::Line, element]));
    } else {
        docs.push(element);
    }
    *ws_prev = false;
    Some(())
}

fn append_inline_ignore_atom(atom: &str, docs: &mut Vec<crate::doc::Doc>, ws_prev: &mut bool) {
    use crate::doc::Doc;
    let part = Doc::Text(atom.to_string());
    match docs.last_mut() {
        Some(Doc::Fill(parts)) => parts.push(part),
        _ if *ws_prev => docs.push(Doc::Fill(vec![Doc::Line, part])),
        _ => docs.push(Doc::Fill(vec![part])),
    }
    *ws_prev = false;
}

fn skip_ignored_node(skip_ignored: &mut bool) -> bool {
    std::mem::take(skip_ignored)
}

fn finish_children_docs(docs: Vec<crate::doc::Doc>) -> Option<crate::doc::Doc> {
    (!docs.is_empty()).then_some(crate::doc::Doc::Concat(docs))
}

#[derive(Clone, Copy)]
enum TextTrimming {
    Neither,
    Left,
    Right,
    Both,
}

impl TextTrimming {
    const fn from_edges(left: bool, right: bool) -> Self {
        match (left, right) {
            (false, false) => Self::Neither,
            (true, false) => Self::Left,
            (false, true) => Self::Right,
            (true, true) => Self::Both,
        }
    }

    const fn edges(self) -> (bool, bool) {
        match self {
            Self::Neither => (false, false),
            Self::Left => (true, false),
            Self::Right => (false, true),
            Self::Both => (true, true),
        }
    }
}

struct TextPartLayout {
    trimming: TextTrimming,
    soft_break: bool,
    merge_previous_fill: bool,
}

fn append_text_parts(text: &str, layout: &TextPartLayout, docs: &mut Vec<crate::doc::Doc>) {
    use crate::doc::Doc;
    if layout.soft_break && !layout.merge_previous_fill {
        docs.push(Doc::Line);
        return;
    }
    let (trim_left, trim_right) = layout.trimming.edges();
    let parts = split_text_to_docs(text, trim_left, trim_right);
    if let (true, Some(Doc::Fill(previous))) = (layout.merge_previous_fill, docs.last_mut()) {
        previous.extend(parts);
    } else if split_html_ws(text).next().is_none() {
        docs.extend(parts);
    } else {
        docs.push(Doc::Fill(parts));
    }
}

// `use_word_first`: when true, a trailing text node that follows a non-void
// inline element and starts with a space is converted to word-first format.
// Only pass `true` from `try_fill_run` where the element fits flat in context.
pub(super) fn build_children_doc_nodes(
    out: &str,
    nodes: &[TemplateNode],
    allow_elem_expr_collapse: bool,
    use_word_first: bool,
    options: Option<&FormatOptions>,
) -> Option<crate::doc::Doc> {
    use crate::doc::Doc;
    let n = nodes.len();
    let mut docs: Vec<Doc> = Vec::new();
    // Whether the previous text node ended with a (trimmed) space, so the next
    // inline element carries a leading `line` (prettier's
    // `handleWhitespaceOfPrevTextNode`).
    let mut ws_prev = false;
    // Set after an inline `<!-- prettier-ignore -->` atom so its ignored node is
    // not printed a second time.
    let mut skip_ignored = false;
    // Set after an inline atom so the following text keeps filling in the same
    // `Fill` — the atom is one of its (unbreakable) words, not a sibling doc.
    let mut merge_into_fill = false;

    for (i, node) in nodes.iter().enumerate() {
        if skip_ignored_node(&mut skip_ignored) {
            continue;
        }
        if let Some(atom) = inline_ignore_atom(out, nodes, i) {
            append_inline_ignore_atom(atom, &mut docs, &mut ws_prev);
            skip_ignored = true;
            merge_into_fill = true;
            continue;
        }
        let merge_prev_fill = std::mem::take(&mut merge_into_fill);
        match node {
            TemplateNode::Text(t) => {
                ws_prev = false;
                let txt = out.get(t.start as usize..t.end as usize)?;
                let trim_left = i == 0;
                let trim_right = i == n - 1;
                let prev_inline =
                    i > 0 && !merge_prev_fill && is_inline_regular_element(&nodes[i - 1]);
                let next_inline = i + 1 < n && is_inline_regular_element(&nodes[i + 1]);
                let mut tl = trim_left;
                let mut tr = trim_right;
                // prettier's `handleTextChild` returns early for the first/last
                // child (no trim, no flag) — the wrapper owns that boundary — so
                // the boundary handling below only applies to middle text nodes.
                let ws_only = split_html_ws(txt).next().is_none();
                //
                // Leading space after an inline element: trim it from this fill
                // and append a `line` to the previous element's doc so the
                // element and the following space break together (the element
                // can then sit at the end of a line with the next word wrapping).
                //
                // For the LAST text node after a VOID inline element (empty fragment,
                // e.g. `<input>`, `<br>`), use a unified Fill([elem, Line, w1, Line, w2, …]).
                // This lets the fill algorithm decide whether elem+first_word fits
                // (and break before the first word when it doesn't) rather than
                // having the old Fill([Line, words…]) structure, where Line acts as
                // a 1-char content atom that always "fits", causing the first word
                // to overflow on the same line as the element.
                //
                // For content elements (non-empty fragment, e.g. `<code>`, `<strong>`),
                // keep the old Fill([Line, words…]) structure: the Line acts as a
                // 1-char content atom that fits after the element's closing `>`,
                // keeping text glued to the closing `>` even when the element itself
                // was forced multi-line by its attributes.
                // A TRUE void HTML element (`<input>`, `<br>`, `<img>`, `<hr>`, …)
                // always ends with `/>` and has no closing tag. Its cursor
                // position after printing is well-defined even when its attributes
                // wrap, so a unified Fill correctly models the line-break decision.
                // Empty non-void elements (`<span></span>`, `<span class="…"></span>`)
                // also have `e.fragment.nodes.is_empty()` but their hug-doc may
                // place the close tag on an indented line — merging those into a
                // unified Fill breaks the `></tag> text` glue. Restrict the unified
                // path to HTML void elements only.
                let prev_is_void_inline = i > 0
                    && matches!(&nodes[i - 1], TemplateNode::RegularElement(e)
                        if is_html_void_element(e.name.as_str()));
                if !trim_left && prev_inline && starts_with_space_no_break(txt) && !ws_only {
                    // Count text words to decide whether to merge into a unified Fill.
                    // With only ONE word (e.g. "°F"), the old Fill([Line, word]) structure
                    // correctly tolerates slight overflow — prettier keeps a lone final word
                    // on the same line as the element even if it overflows by a char or two.
                    // With TWO or more words, the unified Fill correctly breaks before the
                    // first word when it doesn't fit after the element.
                    let text_word_count = split_html_ws(txt).count();
                    if trim_right && prev_is_void_inline && text_word_count >= 2 {
                        // Last text node (≥2 words) after a void inline element: unified Fill.
                        if let Some(prev) = docs.pop() {
                            let text_parts = split_text_to_docs(txt, true, true);
                            let mut fill_parts = vec![prev, Doc::Line];
                            fill_parts.extend(text_parts);
                            docs.push(Doc::Fill(fill_parts));
                            continue;
                        }
                        // No prev element to merge; fall through to normal handling.
                    } else if !trim_right {
                        // Middle text node: old Group([prev, Line]) + Fill([words]).
                        if let Some(prev) = docs.pop() {
                            docs.push(Doc::Group(vec![prev, Doc::Line]));
                        }
                        tl = true;
                    } else if use_word_first && !prev_is_void_inline && n == 2 {
                        // Last text node after a non-void inline element when the
                        // caller requested word-first format (i.e. `try_fill_run`),
                        // and the run has exactly 2 nodes (element + text).
                        // Wrap the element in Group([prev, Line]) so the fill starts
                        // with a word; the fill algorithm then correctly breaks at
                        // the right boundary instead of placing an overflowing word
                        // on the current line via the separator-first pair-fits check.
                        // Only safe when the element is known to fit flat (guaranteed
                        // by try_fill_run's non-ws-prefix guard and indentation check).
                        // Void elements (input, br, img) keep the old behavior since
                        // their text content (e.g. " °F") should stay glued to them.
                        // Restrict to n==2 (single element + text): longer runs have
                        // middle nodes handled by the `!trim_right` branch already;
                        // applying Group([elem, Line]) to the tail element of a 5-node
                        // run shifts the fill structure in a way that breaks the
                        // intermediate word-wrap boundaries.
                        if let Some(prev) = docs.pop() {
                            docs.push(Doc::Group(vec![prev, Doc::Line]));
                        }
                        tl = true;
                    }
                    // trim_right && (prev_is_void_inline || !use_word_first): old behavior.
                }
                // Trailing space before an inline element: trim it from this fill
                // and flag the element to carry the leading `line` (hug in place):
                // a first text node instead keeps its trailing `line` inside the
                // fill (prints as a flat space) and the inline element stays bare,
                // so it hug-breaks in place rather than breaking onto its own line.
                //
                // Special case: a whitespace-only text node between two inline
                // elements (e.g. `<kbd>…</kbd> <kbd>K</kbd>` with Text(" ")
                // in the middle) fires BOTH the prev-inline and next-inline checks.
                // The prev-inline check already appended a trailing `Line` to the
                // preceding element's doc; adding a leading `Line` via `ws_prev`
                // would produce two spaces in flat mode. Skip `ws_prev` when the
                // separator was already placed by `tl`.
                if !trim_left
                    && !trim_right
                    && next_inline
                    && ends_with_space_no_break(txt)
                    && !(ws_only && tl)
                {
                    tr = true;
                    ws_prev = true;
                }
                // Special case: when `allow_elem_expr_collapse` is true (the run
                // covers all non-whitespace content of the parent fragment, meaning
                // there are no block siblings like `{#if}`/`{#each}` outside the
                // run), a whitespace-only single-newline separator that immediately
                // follows a content inline element (prev_inline) can be a soft break
                // (Doc::Line) instead of a hard break. This lets the enclosing group
                // collapse the run to one line in flat mode when it fits.
                //
                // Example: `<strong>{x}</strong>\n    {feature.endText}` inside an
                // `{#if}` body — the `\n    ` should be Doc::Line so the two nodes
                // collapse to `<strong>{x}</strong> {feature.endText}` when the line
                // fits. This does NOT fire when there are block siblings (e.g.
                // `<strong>{title}</strong>` before a `{#if}` block) because
                // `allow_elem_expr_collapse` is false in that case.
                // A "phrasing content" inline element is one that acts as a
                // prose carrier (e.g. `<strong>`, `<em>`, `<a>`, `<span>`):
                // not block-display, not inline-block (button/select/input),
                // not whitespace-preserving, and has actual content children
                // (non-void). This mirrors the `prev_is_inline_html` logic
                // in indent.rs that suppresses space-to-newline conversion
                // after such elements.
                let prev_is_phrasing_inline = i > 0
                    && matches!(&nodes[i - 1], TemplateNode::RegularElement(e)
                        if !is_block_display(e.name.as_str())
                            && !is_inline_block(e.name.as_str())
                            && !is_whitespace_preserving(e.name.as_str())
                            && !e.fragment.nodes.is_empty());
                // The following node must NOT be another inline element —
                // two sibling elements (`<a>home</a>\n<a>about</a>`) stay on
                // separate lines.  Only collapse when the next node is an
                // ExpressionTag / HtmlTag / etc. (a non-element inline atom).
                let next_is_not_element = i + 1 < n
                    && !matches!(
                        &nodes[i + 1],
                        TemplateNode::RegularElement(_)
                            | TemplateNode::Component(_)
                            | TemplateNode::SlotElement(_)
                    );
                let use_soft_break = allow_elem_expr_collapse
                    && ws_only
                    && !trim_left
                    && !trim_right
                    && prev_is_phrasing_inline
                    && next_is_not_element
                    && txt.chars().filter(|&c| c == '\n').count() == 1;
                append_text_parts(
                    txt,
                    &TextPartLayout {
                        trimming: TextTrimming::from_edges(tl, tr),
                        soft_break: use_soft_break,
                        merge_previous_fill: merge_prev_fill,
                    },
                    &mut docs,
                );
            }
            other => {
                append_non_text_doc(out, other, options, &mut docs, &mut ws_prev)?;
            }
        }
    }
    finish_children_docs(docs)
}

/// Build a wrappable open-tag doc (`<tag` + an attribute group) for a regular
/// element, so a long open tag can break its attributes onto their own lines.
///
/// When `hug_start` is `true` (prettier's `shouldHugStart && !isEmpty`), the `>`
/// belongs to the hugged content so no trailing `dedent(softline)` is emitted:
///   `['<', name, indent(group([line, attr1, line, attr2, …]))]`
///
/// When `hug_start` is `false` (non-hugging element, or empty element), a
/// `Dedent(Softline)` is appended inside the attribute group so the closing `>`
/// lands at the outer (un-indented) column when the group breaks:
///   `['<', name, indent(group([line, attr1, …, dedent(softline)]))]`
///
/// Returns `None` (caller keeps the atomic open string) when there are no
/// attributes or any attribute is multi-line in the formatted output.
pub(super) fn build_open_attr_doc(
    out: &str,
    node: &TemplateNode,
    tag: &str,
    hug_start: bool,
) -> Option<crate::doc::Doc> {
    use crate::doc::Doc;
    // Support both RegularElement and Component (the latter appears in inline
    // prose runs as `<A href="/">text</A>` etc.).
    let attrs: &[_] = match node {
        TemplateNode::RegularElement(e) => &e.attributes,
        TemplateNode::Component(c) => &c.attributes,
        TemplateNode::SlotElement(s) => &s.attributes,
        _ => return None,
    };
    if attrs.is_empty() {
        return None;
    }
    let mut group_parts: Vec<Doc> = Vec::with_capacity(attrs.len() * 2 + 1);
    for attr in attrs {
        let (as_, ae) = attribute_span(attr);
        let atext = out.get(as_ as usize..ae as usize)?;
        if atext.contains('\n') {
            return None; // a multi-line attribute can't sit in this flat group
        }
        group_parts.push(Doc::Line);
        group_parts.push(Doc::Text(atext.to_string()));
    }
    // When not hugging start, add dedent(softline) so the trailing `>` drops back
    // to the outer column on break — mirrors prettier's openingTag assembly:
    // `indent(group([…attrs, hugStart && !isEmpty ? '' : dedent(softline)]))`.
    if !hug_start {
        group_parts.push(Doc::Dedent(vec![Doc::Softline]));
    }
    Some(Doc::Concat(vec![
        Doc::Text(format!("<{tag}")),
        Doc::Indent(vec![Doc::Group(group_parts)]),
    ]))
}

/// Build a wrappable doc for a self-closing `Component` with attributes, so that
/// a long `<Icon class="…" />` inside an inline fill can break its attributes
/// onto their own lines (dedenting `/>` back to the outer column).
///
/// Returns `None` if the component is not self-closing, has no attributes, has
/// multi-line attributes, or if the flat print would not match the verbatim span.
///
/// Mirrors prettier-plugin-svelte's self-closing-tag assembly (~1126-1135):
///   `group(['<', name, indent(group([line, attr1, …, dedent(line)])), '/>'])`
///
/// `dedent(line)` is the key: in flat mode `line` = space so `/>` is adjacent to
/// the last attribute (`<Name attr />`); in break mode `line` emits a newline at
/// `indent-1` (the outer column) so `/>` lands un-indented (`<Name\n  attr\n/>`).
/// `bracketSameLine` is always false for components (no `>` hugging), so the
/// `' '` before `/>` does NOT appear in the closing text.
pub(super) fn build_self_closing_component_doc(
    out: &str,
    node: &TemplateNode,
) -> Option<crate::doc::Doc> {
    use crate::doc::Doc;
    let TemplateNode::Component(c) = node else {
        return None;
    };
    // Only for self-closing (empty fragment) components with attributes.
    if c.attributes.is_empty() || !c.fragment.nodes.is_empty() {
        return None;
    }
    let span = out.get(c.start as usize..c.end as usize)?;
    // Must be a single-line self-closing component ending with ` />`
    // (space before `/>`; without a space it would be a different source shape).
    if span.contains('\n') || !span.ends_with(" />") {
        return None;
    }
    let name = c.name.as_str();
    let mut group_parts: Vec<Doc> = Vec::with_capacity(c.attributes.len() * 2 + 1);
    for attr in &c.attributes {
        let (as_, ae) = attribute_span(attr);
        let atext = out.get(as_ as usize..ae as usize)?;
        if atext.contains('\n') {
            return None;
        }
        group_parts.push(Doc::Line);
        group_parts.push(Doc::Text(atext.to_string()));
    }
    // `dedent(line)`: flat → " " (space before `</>`), break → newline at indent-1.
    // This is the spec's `!bracketSameLine ? dedent(line) : ''` — since
    // bracketSameLine is always false for components, `dedent(line)` is always used.
    group_parts.push(Doc::Dedent(vec![Doc::Line]));
    let doc = Doc::Group(vec![
        Doc::Text(format!("<{name}")),
        Doc::Indent(vec![Doc::Group(group_parts)]),
        Doc::Text("/>".to_string()), // no leading space: the `dedent(line)` provides it
    ]);
    // Guard: the flat print must match the verbatim span (trimmed).
    let flat = crate::doc::print(&doc, 999_999, IndentUnit::new("  ", 2), 0, 0);
    if flat.trim() != span.trim() {
        return None;
    }
    Some(doc)
}

/// Build a breakable doc for a self-closing **`RegularElement`** (`<input … />`,
/// `<img … />`) inside a children/prose fill. Unlike
/// [`build_self_closing_component_doc`] this reads each attribute's own span
/// (which is single-line even when the element was already wrapped across lines
/// in `out`), so an already-multi-line self-closing element still becomes a
/// breakable attribute group. Returns `None` when there are no attributes, the
/// element has content, an attribute is itself multi-line, or the rebuilt flat
/// form wouldn't round-trip to the canonical `<tag a b c />`.
pub(super) fn build_self_closing_regular_doc(
    out: &str,
    node: &TemplateNode,
) -> Option<crate::doc::Doc> {
    use crate::doc::Doc;
    let TemplateNode::RegularElement(e) = node else {
        return None;
    };
    if e.attributes.is_empty() || !e.fragment.nodes.is_empty() {
        return None;
    }
    let span = out.get(e.start as usize..e.end as usize)?;
    if !span.trim_end().ends_with("/>") {
        return None;
    }
    let tag = e.name.as_str();
    let mut group_parts: Vec<Doc> = Vec::with_capacity(e.attributes.len() * 2 + 1);
    let mut flat_attrs = String::new();
    for attr in &e.attributes {
        let (as_, ae) = attribute_span(attr);
        let atext = out.get(as_ as usize..ae as usize)?;
        if atext.contains('\n') {
            return None;
        }
        group_parts.push(Doc::Line);
        group_parts.push(Doc::Text(atext.to_string()));
        if !flat_attrs.is_empty() {
            flat_attrs.push(' ');
        }
        flat_attrs.push_str(atext);
    }
    // `dedent(line)`: flat → " " (space before `/>`), break → newline at indent-1.
    group_parts.push(Doc::Dedent(vec![Doc::Line]));
    let doc = Doc::Group(vec![
        Doc::Text(format!("<{tag}")),
        Doc::Indent(vec![Doc::Group(group_parts)]),
        Doc::Text("/>".to_string()),
    ]);
    // Guard: the flat form must equal the canonical single-line `<tag a b c />`
    // so this never changes bytes when the element already fits on one line.
    let expected = format!("<{tag} {flat_attrs} />");
    let flat = crate::doc::print(&doc, 999_999, IndentUnit::new("  ", 2), 0, 0);
    if flat != expected {
        return None;
    }
    Some(doc)
}

/// Build a breakable doc for a void HTML element (`<br />`, `<img … />`,
/// `<input … />`) inside a children/prose fill, so an overflowing line dangles
/// the `/>` onto its own line at the outer indent — prettier's self-closing open
/// tag `group(['<', tag, indent(group([…attrs, dedent(line)])), '/>'])`. Unlike
/// [`build_self_closing_regular_doc`] this also handles the no-attribute case
/// (`<br />`). Returns `None` (caller keeps the verbatim atom) when the span is
/// multi-line or the rebuilt flat form wouldn't round-trip to `<tag … />`, so a
/// void element that already fits on its line never changes bytes.
pub(super) fn build_void_element_doc(
    out: &str,
    e: &rsvelte_core::ast::template::RegularElement,
) -> Option<crate::doc::Doc> {
    use crate::doc::Doc;
    let span = out.get(e.start as usize..e.end as usize)?;
    if span.contains('\n') || !span.trim_end().ends_with("/>") {
        return None;
    }
    let tag = e.name.as_str();
    let mut group_parts: Vec<Doc> = Vec::with_capacity(e.attributes.len() * 2 + 1);
    let mut flat_attrs = String::new();
    for attr in &e.attributes {
        let (as_, ae) = attribute_span(attr);
        let atext = out.get(as_ as usize..ae as usize)?;
        if atext.contains('\n') {
            return None;
        }
        group_parts.push(Doc::Line);
        group_parts.push(Doc::Text(atext.to_string()));
        if !flat_attrs.is_empty() {
            flat_attrs.push(' ');
        }
        flat_attrs.push_str(atext);
    }
    // `dedent(line)`: flat → " " (space before `/>`), break → newline at indent-1.
    group_parts.push(Doc::Dedent(vec![Doc::Line]));
    let doc = Doc::Group(vec![
        Doc::Text(format!("<{tag}")),
        Doc::Indent(vec![Doc::Group(group_parts)]),
        Doc::Text("/>".to_string()),
    ]);
    // Guard: the flat form must equal the canonical single-line element, so this
    // never changes bytes when the element already fits on one line.
    let expected = if flat_attrs.is_empty() {
        format!("<{tag} />")
    } else {
        format!("<{tag} {flat_attrs} />")
    };
    let flat = crate::doc::print(&doc, 999_999, IndentUnit::new("  ", 2), 0, 0);
    if flat != expected {
        return None;
    }
    Some(doc)
}

/// The doc for one inline element: a hug `Group` for a huggable display:inline
/// element, otherwise the verbatim single-line span.
pub(super) fn element_doc(out: &str, node: &TemplateNode) -> Option<crate::doc::Doc> {
    use crate::doc::Doc;
    if let Some((open_no_bracket, content, tag)) = element_hug_parts(out, node, false, false) {
        // The open tag is normally atomic, but when it has attributes build it as
        // a wrappable attribute group so a long open tag inside prose can break
        // its attributes onto their own lines (`<a`\n`  href="…">text</a`\n`>`).
        // hug_start=true: content hugs the open tag, so no dedent(softline) inside
        // the attribute group — the `>` belongs to the hugged content assembly.
        let open_doc =
            build_open_attr_doc(out, node, &tag, true).unwrap_or(Doc::Text(open_no_bracket));
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
    // Self-closing RegularElement with attributes (`<input … />`): build a
    // breakable attribute group so it can break inside a fill — and, crucially, so
    // the fill sees its wide flat width and breaks the surrounding separators (a
    // multi-line self-closing sibling forces the run to break, e.g. layercake AxisY
    // `<input … /> <span>…</span>`). Previously `element_doc` returned None here,
    // which made the whole `build_children_doc` bail and left the run unreflowed.
    if let Some(doc) = build_self_closing_regular_doc(out, node) {
        return Some(doc);
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
                // hug_start=false: empty element (isEmpty=true) → add dedent(softline)
                // so the trailing `>` lands at the outer column on break.
                && let Some(open_doc) = build_open_attr_doc(out, node, tag, false)
            {
                return Some(Doc::Group(vec![open_doc, Doc::Text(format!("></{tag}>"))]));
            }
        }
    }
    // Inline-block elements with simple text content (`<button onclick=…>text</button>`):
    // build a hug doc so the open tag can break its attributes when the element
    // chain overflows.  `element_hug_parts` excludes `is_inline_block` tags (they
    // aren't whitespace-sensitive for standalone hug purposes) but in an inline fill
    // run we still need a breakable doc so adjacent elements can reflow rather than
    // merging onto one overflowing line.  Only for non-empty, text-only content
    // directly adjacent (no leading/trailing space — shouldHugStart && shouldHugEnd).
    if let TemplateNode::RegularElement(e) = node {
        let tag = e.name.as_str();
        if is_inline_block(tag) && !e.attributes.is_empty() && !e.fragment.nodes.is_empty() {
            let span = out.get(node_start(node) as usize..node_end(node) as usize)?;
            if span.contains('\n') {
                return None;
            }
            let first = e.fragment.nodes.first();
            let last = e.fragment.nodes.last();
            if let (Some(first), Some(last)) = (first, last) {
                let content_start = node_start(first) as usize;
                let content_end = node_end(last) as usize;
                let open_text = out.get(node_start(node) as usize..content_start)?;
                let content = out.get(content_start..content_end)?;
                let close = out.get(content_end..node_end(node) as usize)?;
                if !content.contains('\n')
                    && !content.contains('<')
                    && !content.is_empty()
                    && open_text.ends_with('>')
                    && close.starts_with("</")
                    && !content.starts_with([' ', '\t', '\r', '\n'])
                    && !content.ends_with([' ', '\t', '\r', '\n'])
                {
                    let open_doc = build_open_attr_doc(out, node, tag, true)
                        .unwrap_or_else(|| Doc::Text(open_text[..open_text.len() - 1].to_string()));
                    // Build a fill doc for the content so mixed text+expr content
                    // (e.g. `count {await delay(count)} | …`) can fill-wrap when
                    // the element is inside a multi-element run and overflows.
                    // Fall back to a flat text atom when the content has no fill
                    // break points (e.g. a pure text "resolve" that fits inline).
                    let inner_content_doc = build_children_doc(out, &e.fragment, None).map_or_else(
                        || Doc::Group(vec![Doc::Text(format!(">{content}</{tag}"))]),
                        |body| {
                            Doc::Group(vec![Doc::Concat(vec![
                                Doc::Text(">".to_string()),
                                body,
                                Doc::Text(format!("</{tag}")),
                            ])])
                        },
                    );
                    return Some(Doc::Group(vec![
                        open_doc,
                        Doc::Group(vec![Doc::Indent(vec![Doc::Softline, inner_content_doc])]),
                        Doc::Softline,
                        Doc::Text(">".to_string()),
                    ]));
                }
            }
        }
    }
    // Non-block RegularElement with element content (content.contains('<')) that is
    // fully inline (no `\n`): prettier hugs start/end when the content is directly
    // adjacent (no leading/trailing whitespace), even when the content contains
    // nested HTML tags. This handles table-section elements like `<tbody>`, `<tr>`,
    // SVG container elements, and any non-block inline element containing child HTML.
    // Build the same hug group as `element_hug_parts` but without the `contains('<')` guard.
    if let TemplateNode::RegularElement(e) = node {
        let tag = e.name.as_str();
        if !is_block_display(tag) && !is_inline_block(tag) && !is_whitespace_preserving(tag) {
            let elem_start = e.start as usize;
            let elem_end = e.end as usize;
            if let (Some(first), Some(last)) =
                (e.fragment.nodes.first(), e.fragment.nodes.last())
                && let (Some(open), Some(content), Some(close)) = (
                    out.get(elem_start..node_start(first) as usize),
                    out.get(node_start(first) as usize..node_end(last) as usize),
                    out.get(node_end(last) as usize..elem_end),
                )
                && !open.contains('\n')
                && !content.contains('\n')
                && content.contains('<') // only this path (text-only handled by element_hug_parts)
                && !content.is_empty()
                && open.ends_with('>')
                && close.starts_with("</")
            {
                let open_no_bracket = &open[..open.len() - 1]; // strip trailing `>`
                let inner_text = format!(">{content}</{tag}");
                let open_doc = build_open_attr_doc(out, node, tag, true)
                    .unwrap_or_else(|| Doc::Text(open_no_bracket.to_string()));
                // Try recursive children doc so nested elements (e.g. `<span>` with
                // a `<ColorIndicator />` child) can break their own attributes when
                // the enclosing group breaks, rather than being treated as an opaque
                // string.  A flat-match guard ensures 0-regression: only switch to
                // the recursive doc when it prints flat-identically to the opaque text.
                // Only switch to the recursive doc when:
                //   (a) the fragment contains at least one inline element with
                //       attributes (an element whose open tag can break), AND
                //   (b) no non-first text node starts with whitespace.
                // Condition (b) ensures `build_children_doc_nodes` does not inject
                // Doc::Line separators before text words (e.g. `" os"` after a
                // `<span>` produces `[Line, Text("os")]` which would break in
                // break mode, causing `<span><span>import</span> os</span>` to
                // split "os" onto its own line).  The first text node's leading
                // whitespace IS safe because build_children_doc_nodes trims it
                // (trim_left=true for i==0); we re-inject it via `lead_ws`.
                let has_attr_element = e.fragment.nodes.iter().any(|n| match n {
                    TemplateNode::RegularElement(c) => !c.attributes.is_empty(),
                    TemplateNode::Component(c) => !c.attributes.is_empty(),
                    TemplateNode::SlotElement(s) => !s.attributes.is_empty(),
                    _ => false,
                });
                let body_text_safe = e.fragment.nodes.iter().enumerate().all(|(idx, n)| {
                    if idx == 0 {
                        return true; // first node leading WS is trimmed by build_children_doc
                    }
                    match n {
                        TemplateNode::Text(t) => {
                            let txt = out.get(t.start as usize..t.end as usize).unwrap_or("");
                            !txt.starts_with(|c: char| c.is_ascii_whitespace())
                        }
                        _ => true,
                    }
                });
                let inner_body_doc = if has_attr_element && body_text_safe {
                    build_children_doc(out, &e.fragment, None).and_then(|body| {
                        // Flat-match guard: only switch to the recursive doc when it
                        // prints identically to the opaque text (modulo boundary
                        // whitespace that `build_children_doc_nodes` trims from the
                        // first/last child).  Compare the body alone against `content`
                        // so leading/trailing space differences don't cause a spurious
                        // mismatch — the surrounding `>` / `</{tag}` wrappers are
                        // structural and don't vary.
                        let flat_body =
                            crate::doc::print(&body, 1_000_000, IndentUnit::new("  ", 2), 0, 0);
                        if flat_body.trim() == content.trim() {
                            // Re-inject leading/trailing whitespace that
                            // `build_children_doc_nodes` trims from the first/last
                            // child, so the flat form of recursive_content still
                            // equals `inner_text` (important for the hug-doc to
                            // produce correct output when the group stays flat).
                            let lead_ws = &content[..content.len() - content.trim_start().len()];
                            let trail_ws = &content[content.trim_end().len()..];
                            let open_text = if lead_ws.is_empty() {
                                ">".to_string()
                            } else {
                                format!(">{lead_ws}")
                            };
                            let close_text = if trail_ws.is_empty() {
                                format!("</{tag}")
                            } else {
                                format!("{trail_ws}</{tag}")
                            };
                            let recursive_content = Doc::Concat(vec![
                                Doc::Text(open_text),
                                body,
                                Doc::Text(close_text),
                            ]);
                            Some(Doc::Group(vec![recursive_content]))
                        } else {
                            None
                        }
                    })
                } else {
                    None
                };
                let inner_doc =
                    inner_body_doc.unwrap_or_else(|| Doc::Group(vec![Doc::Text(inner_text)]));
                return Some(Doc::Group(vec![
                    open_doc,
                    Doc::Group(vec![Doc::Indent(vec![Doc::Softline, inner_doc])]),
                    Doc::Softline,
                    Doc::Text(">".to_string()),
                ]));
            }
        }
    }
    // `<slot>` with non-empty content that is fully inline (no `\n`):
    // prettier hugs start/end when the content is directly adjacent (no leading/
    // trailing whitespace), even when the content contains nested HTML. Build the
    // same hug group as `element_hug_parts` but without the `contains('<')` guard.
    if let TemplateNode::SlotElement(e) = node {
        let tag = e.name.as_str();
        let elem_start = e.start as usize;
        let elem_end = e.end as usize;
        if let (Some(first), Some(last)) = (e.fragment.nodes.first(), e.fragment.nodes.last())
            && let (Some(open), Some(content), Some(close)) = (
                out.get(elem_start..node_start(first) as usize),
                out.get(node_start(first) as usize..node_end(last) as usize),
                out.get(node_end(last) as usize..elem_end),
            )
            && !open.contains('\n')
            && !content.contains('\n')
            && !content.is_empty()
            && open.ends_with('>')
            && close.starts_with("</")
            && !content.starts_with([' ', '\t', '\r', '\n'])
            && !content.ends_with([' ', '\t', '\r', '\n'])
        {
            let open_no_bracket = &open[..open.len() - 1]; // strip trailing `>`
            let inner_text = format!(">{content}</{tag}");
            let open_doc = build_open_attr_doc(out, node, tag, true)
                .unwrap_or_else(|| Doc::Text(open_no_bracket.to_string()));
            // Try recursive children doc so nested elements can break their own
            // attributes when the enclosing group breaks.  Flat-match guard for
            // 0-regression: only switch when the body prints flat-identically to
            // `content` (modulo boundary trimming by build_children_doc_nodes).
            let inner_body_doc = build_children_doc(out, &e.fragment, None).and_then(|body| {
                let flat_body = crate::doc::print(&body, 1_000_000, IndentUnit::new("  ", 2), 0, 0);
                if flat_body.trim() == content.trim() {
                    let recursive_content = Doc::Concat(vec![
                        Doc::Text(">".to_string()),
                        body,
                        Doc::Text(format!("</{tag}")),
                    ]);
                    Some(Doc::Group(vec![recursive_content]))
                } else {
                    None
                }
            });
            let inner_doc =
                inner_body_doc.unwrap_or_else(|| Doc::Group(vec![Doc::Text(inner_text)]));
            return Some(Doc::Group(vec![
                open_doc,
                Doc::Group(vec![Doc::Indent(vec![Doc::Softline, inner_doc])]),
                Doc::Softline,
                Doc::Text(">".to_string()),
            ]));
        }
    }
    // Inline-block element WITHOUT attributes but WITH simple text content:
    // produce a hug doc where the CLOSE `>` can defer to the next line when
    // the combined line (element + following content) overflows the print width.
    // This handles e.g. `<button>Hello, this is a test</button>` inside a
    // Component's hug body where the Component's close tag tips the line over 80.
    // The doc is:
    //   Group(["<button>Hello...</button", Softline, ">"])
    // Flat: `<button>Hello...</button>` (Softline = nothing in flat mode) ✓
    // Break: `<button>Hello...</button\n  >` (close `>` deferred to next indent line)
    // Gate: only inline-block without attributes, text-only single-line content.
    if let TemplateNode::RegularElement(e) = node
        && is_inline_block(e.name.as_str())
        && e.attributes.is_empty()
        && !e.fragment.nodes.is_empty()
        && e.fragment
            .nodes
            .iter()
            .all(|n| matches!(n, TemplateNode::Text(_)))
        && let (Some(first), Some(last)) = (e.fragment.nodes.first(), e.fragment.nodes.last())
    {
        let elem_start = e.start as usize;
        let elem_end = e.end as usize;
        let content_start = node_start(first) as usize;
        let content_end = node_end(last) as usize;
        if let (Some(open), Some(content), Some(close_tag)) = (
            out.get(elem_start..content_start),
            out.get(content_start..content_end),
            out.get(content_end..elem_end),
        ) {
            // Only simple single-line hugged content (no whitespace edges).
            if !open.contains('\n')
                && !content.contains('\n')
                && open.ends_with('>')
                && close_tag.starts_with("</")
                && close_tag.ends_with('>')
                && !content.starts_with([' ', '\t', '\r', '\n'])
                && !content.ends_with([' ', '\t', '\r', '\n'])
            {
                // Everything except the final `>` of the close tag.
                let without_final_gt =
                    format!("{open}{content}{}", &close_tag[..close_tag.len() - 1]);
                return Some(Doc::Group(vec![
                    Doc::Text(without_final_gt),
                    Doc::Softline,
                    Doc::Text(">".to_string()),
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
pub(super) fn split_text_to_docs(
    text: &str,
    trim_left: bool,
    trim_right: bool,
) -> Vec<crate::doc::Doc> {
    use crate::doc::Doc;
    let starts_ws = text.starts_with(is_html_ws);
    let ends_ws = text.ends_with(is_html_ws);
    let words: Vec<&str> = split_html_ws(text).collect();
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

/// The `children` for an element's [`ElementLayout`], with whitespace-only wrap
/// artifacts dropped under `bracketSameLine` so a source-empty element takes the
/// hug layout (prettier's empty source element has no children). Genuine
/// source-whitespace elements keep their child, so `<span> </span>` stays non-hug.
pub(super) fn layout_children(
    out: &str,
    nodes: &[TemplateNode],
    el_start: u32,
    children: Vec<crate::children::Child>,
) -> Vec<crate::children::Child> {
    if crate::children::bracket_same_line() && element_source_empty(out, nodes, el_start) {
        Vec::new()
    } else {
        children
    }
}
