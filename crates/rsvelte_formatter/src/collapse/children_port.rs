use super::{
    FormatOptions, Fragment, IndentUnit, TemplateNode, VisualWidth, build_attrs_concat,
    build_component_doc, build_if_block_doc, build_inline_element_doc, build_simple_block_doc,
    build_void_element_doc, child_fragments, content_tag_breakable_doc, current_column,
    did_self_close, in_pre_content, indent_config, is_block_display, is_html_void_element,
    is_inline_block, is_whitespace_preserving, node_end, node_start, omit_softline_allowed,
    orig_text_for, tab_width,
};

pub(super) enum ChildrenPortResult {
    Declined,
    Claimed(Option<(u32, u32, String)>),
}

fn child_profile(fragment: &Fragment) -> (bool, bool, bool, bool) {
    let has_prose_word = fragment.nodes.iter().any(
        |node| matches!(node, TemplateNode::Text(text) if text.data.split_whitespace().next().is_some()),
    );
    let has_non_text = fragment
        .nodes
        .iter()
        .any(|node| !matches!(node, TemplateNode::Text(_)));
    let has_any_text = fragment
        .nodes
        .iter()
        .any(|node| matches!(node, TemplateNode::Text(_)));
    let block_run = has_any_text
        && fragment.nodes.iter().all(|node| match node {
            TemplateNode::Text(text) => text.data.split_whitespace().next().is_none(),
            TemplateNode::IfBlock(_) | TemplateNode::RenderTag(_) => true,
            _ => false,
        });
    (has_prose_word, has_non_text, has_any_text, block_run)
}

fn supports_children_port(fragment: &Fragment) -> bool {
    let (has_prose_word, has_non_text, has_any_text, block_run) = child_profile(fragment);
    if !has_non_text || (!has_prose_word && ((has_any_text && !block_run) || in_pre_content())) {
        return false;
    }
    !has_prose_word
        || !fragment
            .nodes
            .iter()
            .any(|node| matches!(node, TemplateNode::RenderTag(_)))
}

/// Recurse the tree running ONLY `try_children_port` on each `RegularElement`.
/// Used as the final collapse pass so the faithful children port has the last
/// word over the earlier breaking passes. When the port claims an element
/// (`Some(_)`), its layout is authoritative — apply any edit and don't recurse
/// into it; otherwise recurse into the node's child fragments.
pub(super) fn collect_children_port_only(
    out: &str,
    fragment: &Fragment,
    line_width: usize,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) {
    for (i, node) in fragment.nodes.iter().enumerate() {
        // A `<!-- prettier-ignore -->`d node and its whole subtree stay verbatim.
        if crate::prettier_ignore::preceded_by_prettier_ignore(&fragment.nodes, i) {
            continue;
        }
        // Never descend into whitespace-preserving subtrees (`<pre>`,
        // `<textarea>`, `<script>`, `<style>`) — their content is verbatim, so a
        // pure-text inline element inside (`<pre>…<span>C\nD</span>…`) must NOT be
        // collapsed (mirrors prettier's `isPreTagContent` ancestor guard).
        if let TemplateNode::RegularElement(e) = node
            && is_whitespace_preserving(e.name.as_str())
        {
            continue;
        }
        if matches!(
            node,
            TemplateNode::RegularElement(_) | TemplateNode::Component(_)
        ) && let ChildrenPortResult::Claimed(maybe_edit) =
            try_children_port(out, node, line_width, options)
        {
            if let Some(edit) = maybe_edit {
                edits.push(edit);
            }
            continue;
        }
        for f in child_fragments(node) {
            collect_children_port_only(out, f, line_width, options, edits);
        }
    }
}

/// Recursively convert a template node into a `children::Child`, building any
/// nested inline element via the faithful `children::build_element_doc` port
/// (NOT the approximate `element_doc`, which over-breaks inline content). Returns
/// `None` for any node the cut doesn't yet support (block / inline-block element,
/// component, comment, flow block) so the whole port bails.
pub(super) fn node_to_child(
    out: &str,
    node: &TemplateNode,
    line_width: usize,
    options: &FormatOptions,
) -> Option<crate::children::Child> {
    use crate::children::Child;
    use crate::doc::Doc;
    match node {
        TemplateNode::Text(t) => {
            // Prefer the pre-collapse source text (whitespace-faithful) when the
            // children-port pass recorded one; the words are identical, so this
            // only corrects boundary whitespace an earlier pass may have changed.
            let txt = match orig_text_for(t.start) {
                Some(orig) => orig,
                None => out.get(t.start as usize..t.end as usize)?.to_string(),
            };
            Some(Child::Text(txt))
        }
        // Void HTML element (`<br/>`, `<input/>`) — verbatim, must be single-line.
        TemplateNode::RegularElement(ve) if is_html_void_element(ve.name.as_str()) => {
            let span = out.get(ve.start as usize..ve.end as usize)?;
            if span.contains('\n') {
                return None;
            }
            // Build a breakable self-closing group so an overflowing prose line can
            // dangle the `/>` (`<br\n/>`), matching prettier; falls back to the
            // verbatim atom when the span isn't a canonical `<tag … />`.
            let doc =
                build_void_element_doc(out, ve).unwrap_or_else(|| Doc::Text(span.to_string()));
            Some(Child::Inline(doc))
        }
        // Non-void inline content element (`<a>`, `<span>`, `<strong>`, …) — built
        // recursively via the faithful port so its own layout matches prettier.
        TemplateNode::RegularElement(ve)
            if !is_block_display(ve.name.as_str())
                && !is_inline_block(ve.name.as_str())
                && !is_whitespace_preserving(ve.name.as_str()) =>
        {
            Some(Child::Inline(build_inline_element_doc(
                out, ve, line_width, options,
            )?))
        }
        // Block-display element (`<div>`, `<h1>`, `<ul>`, …). prettier classifies
        // these as block children: `print_children` puts each on its own line and
        // forces the parent to break (`forceBreakContent`).
        TemplateNode::RegularElement(ve)
            if is_block_display(ve.name.as_str())
                && !is_whitespace_preserving(ve.name.as_str()) =>
        {
            Some(Child::Block(build_inline_element_doc(
                out, ve, line_width, options,
            )?))
        }
        TemplateNode::Component(c) => Some(Child::Other(build_component_doc(
            out, c, line_width, options,
        )?)),
        // Cut 3: mustache atoms (`{expr}`, `{@html …}`). prettier-plugin-svelte's
        // `isInlineElement` requires `type === 'RegularElement'`, so a MustacheTag
        // is NOT inline — it goes through `printChildren`'s `else` branch: pushed
        // BARE (no `group([line, …])`) with no preceding-text trim. That is
        // `Child::Other` (verbatim atom, no whitespace handling); the surrounding
        // text nodes stay `fill(splitTextToDocs(...))`, so `label: {value}` is kept
        // together and only the inter-item spaces break. (Mapping to `Child::Inline`
        // — a `group([line, …])` — broke `label:` from `{value}`; verified against
        // prettier's own `printDocToString` that the bare-atom structure matches.)
        // `{@render …}` is likewise a bare mustache atom in prettier-plugin-svelte
        // (a RenderTag is not a `RegularElement`, so `isInlineElement` is false and
        // it goes through `printChildren`'s `else` branch, pushed bare). Treating it
        // like an expression tag lets an element run containing `{@render}` (e.g. a
        // `<title>{@render title()}</title>` inside an `{#if}`) be claimed by the
        // port instead of bailing to the approximate legacy layout.
        TemplateNode::ExpressionTag(_) | TemplateNode::HtmlTag(_) | TemplateNode::RenderTag(_) => {
            let span = out.get(node_start(node) as usize..node_end(node) as usize)?;
            if span.contains('\n') {
                return matches!(node, TemplateNode::ExpressionTag(_))
                    .then(|| content_tag_breakable_doc(out, node, options))
                    .flatten()
                    .map(Child::Other);
            }
            Some(Child::Other(Doc::Text(span.to_string())))
        }
        // Flow blocks. `isBlockElement` requires `type === 'RegularElement'`, so
        // these are NOT block children — like a mustache they go through
        // `printChildren`'s `else` branch and are pushed bare. Their own print is
        // `group([def, breakParent])`, so they force every enclosing group to break
        // even when the whole element would fit on one line.
        TemplateNode::IfBlock(blk) => Some(Child::Other(build_if_block_doc(
            out, blk, line_width, options,
        )?)),
        TemplateNode::EachBlock(blk) => {
            let mut branches: Vec<&Fragment> = vec![&blk.body];
            branches.extend(blk.fallback.as_ref());
            Some(Child::Other(build_simple_block_doc(
                out, blk.start, blk.end, &branches, line_width, options,
            )?))
        }
        TemplateNode::KeyBlock(blk) => Some(Child::Other(build_simple_block_doc(
            out,
            blk.start,
            blk.end,
            &[&blk.fragment],
            line_width,
            options,
        )?)),
        _ => None,
    }
}

/// The content bounds of a flow-block branch: from just past the `}` that closes
/// its opening tag to the `{` that opens the next one (`{:else…}` / `{/if}`).
/// Mirrors prettier's `lastIndexOf('}', firstChild.start)` probe, which exists
/// because the AST swallows whitespace between the tag and its first child.
pub(super) fn block_branch_bounds(out: &str, frag: &Fragment) -> Option<(usize, usize)> {
    let first = frag.nodes.first()?;
    let last = frag.nodes.last()?;
    let start = out[..node_start(first) as usize].rfind('}')? + 1;
    let last_end = node_end(last) as usize;
    let end = last_end + out[last_end..].find('{')?;
    (start <= end).then_some((start, end))
}

/// Milestone-2 layout-port entry (cut 1): route an inline `RegularElement` whose
/// content is **prose text interleaved with single-line HTML void elements**
/// (e.g. `<label class="…"><input … /> Only show states starting with 'T'</label>`)
/// through the faithful prettier-plugin-svelte port in `children.rs`
/// (`build_element_doc` / `print_children`) instead of the approximate
/// `try_fill_mixed` / `try_hug_mixed` string logic. This is the cluster where the
/// approximate fill construction diverged from oxfmt (the oracle keeps the first
/// word glued to the preceding void element and wraps later). The gate is a strict
/// subset of `try_fill_mixed`'s; anything else falls through unchanged.
///
/// Returns [`ChildrenPortResult::Declined`] when the element is not a cut-1
/// shape. A claimed result owns the element even when it has no edit.
pub(super) fn try_children_port(
    out: &str,
    node: &TemplateNode,
    line_width: usize,
    options: &FormatOptions,
) -> ChildrenPortResult {
    use crate::children::{Child, ElementLayout, build_element_doc};

    let tw = tab_width(options);
    let (tag, attributes, fragment, start, end, is_inline, self_closing) = match node {
        TemplateNode::RegularElement(e) => (
            e.name.as_str(),
            e.attributes.as_slice(),
            &e.fragment,
            e.start,
            e.end,
            !is_block_display(e.name.as_str()),
            did_self_close(out, e.end) || is_html_void_element(e.name.as_str()),
        ),
        TemplateNode::Component(c) => (
            c.name.as_str(),
            c.attributes.as_slice(),
            &c.fragment,
            c.start,
            c.end,
            true,
            did_self_close(out, c.end),
        ),
        _ => return ChildrenPortResult::Declined,
    };
    // Cut 1: inline or block elements (not pre/textarea/script/style, not
    // inline-block like button/select/input). `is_inline` follows prettier's
    // `isInlineElement` = not in the block-element list.
    if is_whitespace_preserving(tag) || is_inline_block(tag) {
        return ChildrenPortResult::Declined;
    }
    let (s, ee) = (start as usize, end as usize);
    let Some(whole) = out.get(s..ee) else {
        return ChildrenPortResult::Declined;
    };

    if !supports_children_port(fragment) {
        return ChildrenPortResult::Declined;
    }

    // open/close sanity: content directly bounded by `>` … `</`.
    let (Some(first), Some(last)) = (fragment.nodes.first(), fragment.nodes.last()) else {
        return ChildrenPortResult::Declined;
    };
    let content_start = node_start(first) as usize;
    let content_end = node_end(last) as usize;
    let (Some(open), Some(close)) = (out.get(s..content_start), out.get(content_end..ee)) else {
        return ChildrenPortResult::Declined;
    };
    if !open.ends_with('>') || !close.starts_with("</") {
        return ChildrenPortResult::Declined;
    }

    // The base indent level comes from the line's leading whitespace run. A
    // prose prefix (`.<span …>`) is allowed — the element's real column is
    // tracked separately by `start_col`. A prefix ending at a `>` or `}` is a
    // hug/glue boundary owned by another pass, so leave those alone.
    let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
    let Some(full_prefix) = out.get(line_start..s) else {
        return ChildrenPortResult::Declined;
    };
    let ws_len = full_prefix
        .bytes()
        .take_while(|&b| b == b' ' || b == b'\t')
        .count();
    let Some(indent) = full_prefix.get(..ws_len) else {
        return ChildrenPortResult::Declined;
    };
    if full_prefix[ws_len..].ends_with(['>', '}']) {
        return ChildrenPortResult::Declined;
    }
    let (unit, width) = indent_config(options);
    let base_level = if options.js.indent_style.is_tab() {
        ws_len
    } else {
        indent.visual_width(tw) / width
    };
    let start_col = current_column(out, start, tw);

    // Build the ElementLayout from the AST, recursively converting each child via
    // the faithful port (`node_to_child` bails on any unsupported child).
    let Some(attrs) = build_attrs_concat(out, attributes, options) else {
        return ChildrenPortResult::Declined;
    };
    let mut children: Vec<Child> = Vec::with_capacity(fragment.nodes.len());
    for n in &fragment.nodes {
        let Some(child) = node_to_child(out, n, line_width, options) else {
            return ChildrenPortResult::Declined;
        };
        children.push(child);
    }
    let doc = build_element_doc(ElementLayout {
        name: tag.to_string(),
        attrs,
        children,
        is_inline,
        // Inert at this call site — the gate above requires a non-text child, so
        // `is_empty` is never true here. Only the recursive descent into children
        // (`build_inline_element_doc`) reaches the self-closing branch.
        self_closing,
        omit_softline_allowed: omit_softline_allowed(out, end),
    });
    let doc = crate::doc::propagate_breaks(doc);
    let printed = crate::doc::print(
        &doc,
        line_width,
        IndentUnit::new(unit.as_str(), tw),
        base_level,
        start_col,
    );

    // Corruption guard: the non-whitespace content must be byte-identical (the
    // port only ever changes whitespace/line breaks, never content). If it isn't,
    // don't claim the element — let the legacy passes handle it.
    if !printed
        .chars()
        .filter(|c| !c.is_whitespace())
        .eq(whole.chars().filter(|c| !c.is_whitespace()))
    {
        return ChildrenPortResult::Declined;
    }
    // Claim the element. Emit an edit only when it changes something; a noop still
    // claims it so the caller does NOT fall through to try_fill_mixed/try_hug_mixed
    // (which would re-break the already-correct prose).
    ChildrenPortResult::Claimed((printed != whole).then_some((start, end, printed)))
}

/// Prepend `leading` (a `Doc::Line` or `Doc::Hardline`) to the outermost
/// `Doc::Fill` within `doc`. This produces prettier's "inverted" fill
/// structure `[Line/Hardline, word, Line, word, ...]` for text nodes that
/// started with whitespace, giving "last-word overflow tolerance".
pub(super) fn prepend_leading_to_fill(
    doc: crate::doc::Doc,
    leading: crate::doc::Doc,
) -> crate::doc::Doc {
    use crate::doc::Doc;
    match doc {
        Doc::Concat(mut items) => {
            if let Some(Doc::Fill(parts)) = items.first_mut() {
                parts.insert(0, leading);
            }
            Doc::Concat(items)
        }
        Doc::Fill(mut parts) => {
            parts.insert(0, leading);
            Doc::Fill(parts)
        }
        other => other,
    }
}

/// Returns `true` when the character immediately before `text_start` in `out`
/// is the `>` of a **close tag** (e.g. `</h3>`) rather than an open tag.
/// Used to decide whether a newline-leading text node was trimmed by prettier's
/// `trimTextNodeLeft` (first-child path → open tag before it) or not (between
/// block siblings → close tag before it).
pub(super) fn text_preceded_by_close_tag(out: &str, text_start: usize) -> bool {
    if text_start == 0 {
        return false;
    }
    // The character immediately before the text node must be `>`.
    let before = &out[..text_start];
    if !before.ends_with('>') {
        return false;
    }
    // A self-closing tag (`<Code … />`) is a preceding SIBLING, so — like a close
    // tag — the text after it is not the parent's first child and prettier does
    // NOT trim its leading whitespace. `splitTextToDocs` then keeps the leading
    // linebreak as a hardline (Case B).
    if before.ends_with("/>") {
        return true;
    }
    // Search backwards (at most 512 bytes) for the matching `<`.
    // Ensure search_start is on a valid UTF-8 char boundary.
    let mut search_start = before.len().saturating_sub(512);
    while search_start < before.len() && !before.is_char_boundary(search_start) {
        search_start += 1;
    }
    let search = &before[search_start..];
    let Some(rel_pos) = search.rfind('<') else {
        return false;
    };
    // If the char after `<` is `/`, it's a close tag.
    search.as_bytes().get(rel_pos + 1) == Some(&b'/')
}
