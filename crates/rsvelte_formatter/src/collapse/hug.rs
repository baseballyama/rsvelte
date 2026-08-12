use crate::doc::Doc;

use super::{
    FormatOptions, Fragment, IndentUnit, TemplateNode, VisualWidth, attribute_span,
    build_children_doc, child_fragments, current_column, indent_config, is_block_display,
    is_component_tag, is_inline_block, is_inline_node, is_whitespace_preserving, node_end,
    node_start, tab_width, trims_edge_whitespace,
};

/// Pass 1.7: targeted `try_hug_mixed` sweep for elements that have a
/// non-whitespace prefix (indent ending with `>`). This can occur when pass 1
/// hugs a container element — e.g. `<defs>` becomes `<defs\n    >` — so a
/// child element (`<clipPath>`) that was previously at a whitespace indent now
/// immediately follows the parent's closing `>` on the same line. Pass 1 did
/// not process the child independently (the parent edit owned the range), so
/// this pass applies the hug-mixed transform specifically for those cases.
pub(super) fn collect_hug_mixed_non_ws_prefix(
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
        let children = match node {
            TemplateNode::RegularElement(e) => {
                if is_whitespace_preserving(e.name.as_str()) {
                    continue;
                }
                // Check if this element has a non-ws-prefix indent that is exactly
                // `{spaces}>` — a parent's hugged closing `>` immediately before this
                // element.  We intentionally reject longer non-ws indents (e.g. the
                // element follows a sibling's close-tag `</span>`) because those
                // produce incorrect `ws_indent` values in `try_hug_mixed`.
                let s = e.start as usize;
                let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
                let indent = out.get(line_start..s).unwrap_or("");
                let non_ws = !indent.bytes().all(|b| b == b' ' || b == b'\t');
                let is_simple_gt_prefix = non_ws && indent.trim_start_matches([' ', '\t']) == ">";
                if is_simple_gt_prefix
                    && let Some(edit) = try_hug_mixed(
                        out,
                        e.name.as_str(),
                        e.start,
                        e.end,
                        &e.fragment,
                        line_width,
                        options,
                    )
                {
                    edits.push(edit);
                    continue; // edit owns this element, don't recurse
                }
                vec![&e.fragment]
            }
            TemplateNode::Component(c) => {
                let s = c.start as usize;
                let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
                let indent = out.get(line_start..s).unwrap_or("");
                let non_ws = !indent.bytes().all(|b| b == b' ' || b == b'\t');
                let is_simple_gt_prefix = non_ws && indent.trim_start_matches([' ', '\t']) == ">";
                if is_simple_gt_prefix
                    && let Some(edit) = try_hug_mixed(
                        out,
                        c.name.as_str(),
                        c.start,
                        c.end,
                        &c.fragment,
                        line_width,
                        options,
                    )
                {
                    edits.push(edit);
                    continue;
                }
                vec![&c.fragment]
            }
            TemplateNode::SlotElement(s) => {
                let ss = s.start as usize;
                let line_start = out[..ss].rfind('\n').map_or(0, |i| i + 1);
                let indent = out.get(line_start..ss).unwrap_or("");
                let non_ws = !indent.bytes().all(|b| b == b' ' || b == b'\t');
                let is_simple_gt_prefix = non_ws && indent.trim_start_matches([' ', '\t']) == ">";
                if is_simple_gt_prefix
                    && let Some(edit) = try_hug_mixed(
                        out,
                        s.name.as_str(),
                        s.start,
                        s.end,
                        &s.fragment,
                        line_width,
                        options,
                    )
                {
                    edits.push(edit);
                    continue;
                }
                vec![&s.fragment]
            }
            _ => {
                for child in child_fragments(node) {
                    collect_hug_mixed_non_ws_prefix(out, child, line_width, options, edits);
                }
                continue;
            }
        };
        for child in children {
            collect_hug_mixed_non_ws_prefix(out, child, line_width, options, edits);
        }
    }
}

/// If `node` is a huggable display:inline element — single line, simple text
/// content (no nested element tags), an open tag ending in `>` — return its
/// `(open_without_bracket, inner_content, tag)` for the hug break.
pub(super) fn element_hug_parts(
    out: &str,
    node: &TemplateNode,
) -> Option<(String, String, String)> {
    // Extract tag name, attributes, fragment start/end for both RegularElement
    // and Component variants (Components like `<A href="/">text</A>` appear in
    // inline prose runs and need the same hug treatment).
    let (tag, attrs, frag, elem_start, elem_end) = match node {
        TemplateNode::RegularElement(e) => {
            let tag = e.name.as_str();
            if is_block_display(tag) || is_inline_block(tag) || trims_edge_whitespace(tag) {
                return None;
            }
            (tag, &e.attributes, &e.fragment, e.start, e.end)
        }
        TemplateNode::Component(c) => (c.name.as_str(), &c.attributes, &c.fragment, c.start, c.end),
        _ => return None,
    };
    let first = frag.nodes.first()?;
    let last = frag.nodes.last()?;
    let content_start = node_start(first) as usize;
    let content_end = node_end(last) as usize;
    let open = out.get(elem_start as usize..content_start)?;
    let content = out.get(content_start..content_end)?;
    let close = out.get(content_end..elem_end as usize)?;
    // Simple text content, an open tag closed by `>`, a real close tag.
    if content.contains('\n')
        || content.contains('<')
        || content.is_empty()
        || !open.ends_with('>')
        || !close.starts_with("</")
    {
        return None;
    }
    // prettier's shouldHugStart / shouldHugEnd: hug only when content is directly
    // adjacent to the open/close tag (no leading/trailing whitespace). Content that
    // starts or ends with whitespace gets block-break treatment (content on its own
    // indented line with `>` and `</tag>` each on their own lines), not hug.
    if content.starts_with([' ', '\t', '\r', '\n']) || content.ends_with([' ', '\t', '\r', '\n']) {
        return None;
    }
    // The open tag is usually single-line, but the markup pass may have already
    // wrapped its attributes (`<a\n  href="…"\n  class="…">`) when it overflowed.
    // In that case `element_doc` rebuilds the open tag as a wrappable attribute
    // group from the AST (see `build_open_attr_doc`), so the verbatim
    // `open_no_bracket` is only a fallback — reconstruct a flat single-line form
    // from the AST attributes so it (and the doc's flat-print guard) stays valid.
    // Each attribute must itself be single-line for the flat reconstruction.
    let open_no_bracket = if open.contains('\n') {
        let mut flat = format!("<{tag}");
        for attr in attrs {
            let (as_, ae) = attribute_span(attr);
            let atext = out.get(as_ as usize..ae as usize)?;
            if atext.contains('\n') {
                return None; // a multi-line attribute can't sit in a flat open tag
            }
            flat.push(' ');
            flat.push_str(atext);
        }
        flat
    } else {
        open[..open.len() - 1].to_string()
    };
    Some((open_no_bracket, content.to_string(), tag.to_string()))
}

/// Hug-break the single inline-element body of a block (`{#each …}<span>…</span>{/each}`)
/// when the whole one-line block overflows. prettier keeps the body inline-adjacent
/// to the block tags (no whitespace in source) and, on overflow, hugs the element:
/// the close `>` drops to its own indented line with the block close tag glued
/// after it —
///   {#each group.breadcrumbs as breadcrumb}<span>{breadcrumb}</span
///     >{/each}
/// Returns the edit when the block currently renders all on one line and overflows.
pub(super) fn try_hug_block_inline_body(
    out: &str,
    start: u32,
    end: u32,
    body: &Fragment,
    line_width: usize,
    options: &FormatOptions,
) -> Option<(u32, u32, String)> {
    let tw = tab_width(options);
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
    if indent.visual_width(tw) + whole.visual_width(tw) <= line_width {
        return None; // fits on one line
    }
    let prefix = out.get(s..elem_start)?; // block open tag (+ no leading ws)
    let (indent_unit, _) = indent_config(options);
    let hug = format!("{prefix}{open_nb}>{content}</{tag}\n{indent}{indent_unit}>{close}");
    (hug != whole).then_some((start, end, hug))
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
pub(super) fn try_hug_mixed(
    out: &str,
    tag: &str,
    start: u32,
    end: u32,
    fragment: &Fragment,
    line_width: usize,
    options: &FormatOptions,
) -> Option<(u32, u32, String)> {
    let tw = tab_width(options);
    let (indent_unit_hm, indent_width_hm) = indent_config(options);
    // Inline elements hug (prettier's `blockElements` excludes button/input/…),
    // so only true block elements and raw-text elements are ineligible.
    if is_block_display(tag) || is_whitespace_preserving(tag) {
        return None;
    }
    let (s, e) = (start as usize, end as usize);
    let whole = out.get(s..e)?;

    // Must be mixed (≥1 non-text child). Comments are always line boundaries.
    // Flow-block children (IfBlock/EachBlock/…) are not inline nodes but are
    // allowed here: when a non-block element contains a flow block, prettier
    // force-breaks it with the hug form even when it would fit on one line
    // (prettier's `forceBreakContent` / `breakParent` for flow blocks).
    let mut has_non_text = false;
    let mut has_flow_block = false;
    for n in &fragment.nodes {
        if !matches!(n, TemplateNode::Text(_)) {
            has_non_text = true;
            if matches!(n, TemplateNode::Comment(_)) {
                return None;
            }
            let is_flow = matches!(
                n,
                TemplateNode::IfBlock(_)
                    | TemplateNode::EachBlock(_)
                    | TemplateNode::AwaitBlock(_)
                    | TemplateNode::KeyBlock(_)
                    | TemplateNode::SnippetBlock(_)
            );
            if is_flow {
                has_flow_block = true;
            } else if !is_inline_node(n) {
                // For Components, also allow block-display RegularElement children
                // (e.g. `<Component><div>…</div></Component>`). Components have
                // block-level semantics so their block children can be hugged.
                let is_block_child_of_component = is_component_tag(tag)
                    && matches!(
                        n,
                        TemplateNode::RegularElement(_) | TemplateNode::Component(_)
                    );
                if !is_block_child_of_component {
                    return None;
                }
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
    // Exception: for Components (`<Kbd.Group>`, etc.), the trailing edge may have
    // whitespace (newline + indent before `</Tag>`) without affecting the hug — the
    // trailing whitespace is just formatting, not injected CSS whitespace. We allow
    // the hug when only the trailing edge has whitespace, for components only.
    let raw_trail_ws_only = is_component_tag(tag)
        && !raw.starts_with([' ', '\t', '\r', '\n'])
        && raw.ends_with([' ', '\t', '\r', '\n']);
    // Extra exception for Components whose open tag was formatted with `hug_open=true`
    // by markup.rs (the `>` is glued to the last attribute, not on its own line):
    //   `<Component\n  attr>` (hug_open=true) vs `<Component\n  attr\n>` (false).
    // When `hug_open=true`, `open` ends with a non-`\n` char before `>`, and `raw`
    // starts with `\n{inner_indent}` (the child content is on the next indented line).
    // We strip that leading `\n{inner_indent}` from `raw` to produce `adj_raw` so the
    // `open.contains('\n')` path below can apply the correct hug transform.
    // Detect whether markup.rs used `hug_open=true` for this component: the `>`
    // is glued to the last attribute line (not on its own indented line).  In that
    // case the text between the last `\n` in `open` and the trailing `>` is the
    // last attribute content (non-whitespace), whereas `hug_open=false` leaves only
    // whitespace (the outer indent) between the last `\n` and `>`.
    let open_hug_form = open.rfind('\n').is_some_and(|nl_pos| {
        // `after_last_nl` = text between last newline and trailing `>`.
        let after_last_nl = &open[nl_pos + 1..open.len().saturating_sub(1)];
        !after_last_nl.bytes().all(|b| b == b' ' || b == b'\t')
    });
    let adj_raw: Option<&str> = if is_component_tag(tag)
        && open_hug_form // `>` glued to last attribute (hug_open=true from markup)
        && raw.starts_with('\n')
    {
        // Compute outer indent of the component.
        let line_start_a = out[..s].rfind('\n').map_or(0, |i| i + 1);
        let outer_ind_a = out.get(line_start_a..s).unwrap_or("");
        if outer_ind_a.bytes().all(|b| b == b' ' || b == b'\t') {
            let inner_ind_a = format!("{outer_ind_a}{indent_unit_hm}");
            let prefix_a = format!("\n{inner_ind_a}");
            if raw.starts_with(prefix_a.as_str()) && !raw[prefix_a.len()..].starts_with([' ', '\t'])
            {
                Some(&raw[prefix_a.len()..])
            } else {
                None
            }
        } else {
            None
        }
    } else {
        None
    };
    // hug_start && !hug_end, multi-line body: the content's first child is adjacent
    // to `>` (hug_start) but the body ends with whitespace before `</tag>` (not
    // hug_end) and the source kept the body broken across lines. prettier moves the
    // open `>` onto its own indented line so it hugs the first content word, while
    // the trailing whitespace keeps a normal close tag —
    //   `<label …attrs`          (or a multi-line wrapped open tag whose `>` is
    //   `  >{label}`              dropped/glued — either way the `>` lands here)
    //   `  <slot />`
    //   `</label>`
    // rsvelte previously fell through to the early-return below (raw ends with ws),
    // leaving `…attrs>{label}` glued. Mirror `build_element_doc`'s hug_start-only
    // case (`children.rs`) with a string edit. Inline elements only (block elements
    // already returned None above). `onb = open[..-1].trim_end()` exposes the real
    // last attribute line whether the open tag was single-line or wrapped.
    // hug_start = body's first char is not whitespace; !hug_end = body ends with
    // whitespace before the close tag.
    let body_hug_start = !raw.starts_with([' ', '\t', '\r', '\n']);
    let body_not_hug_end = raw.ends_with([' ', '\t', '\r', '\n']);
    if adj_raw.is_none() && raw.contains('\n') && body_hug_start && body_not_hug_end {
        let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
        let indent = out.get(line_start..s)?;
        if indent.bytes().all(|b| b == b' ' || b == b'\t') {
            let inner_indent = format!("{indent}{indent_unit_hm}");
            let onb = open[..open.len() - 1].trim_end();
            let result = format!("{onb}\n{inner_indent}>{raw}{close}");
            return (result != whole).then_some((start, end, result));
        }
    }
    // !hug_start && hug_end, multi-line body: the body has leading whitespace (so
    // the open `>` stays on the open-tag line — not hug_start) but ends adjacent to
    // the close tag (hug_end), and the body is already broken across lines. prettier
    // defers the close tag's final `>` onto its own line at the element indent:
    //   `  <picture …>`
    //   `    …`
    //   `  </picture></GroupSlot`
    //   `>`
    // (mirror of the hug_start branch above — `build_element_doc`'s hug_end-only
    // case, whose trailing `softline, '>'` breaks when the element is multi-line).
    // `close` is the simple `</tag>` here (hug_end ⇒ the last child is a non-text
    // node directly before it); guard `!close.contains('\n')` so an already-deferred
    // close is a no-op.
    if adj_raw.is_none()
        && raw.contains('\n')
        && !body_hug_start // body starts with whitespace
        && !body_not_hug_end // body ends adjacent to the close tag (hug_end)
        && close.ends_with('>')
        && !close.contains('\n')
    {
        let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
        let indent = out.get(line_start..s)?;
        if indent.bytes().all(|b| b == b' ' || b == b'\t') {
            let result = format!("{}\n{indent}>", &whole[..whole.len() - 1]);
            return (result != whole).then_some((start, end, result));
        }
    }
    // When we have an adjusted raw (hug_open form), skip the standard early-return
    // for leading whitespace and jump directly to the `open.contains('\n')` handler.
    if adj_raw.is_none()
        && (raw.starts_with([' ', '\t', '\r', '\n'])
            || (raw.ends_with([' ', '\t', '\r', '\n']) && !raw_trail_ws_only))
    {
        return None;
    }
    let column = current_column(out, start, tw);

    let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
    let indent = out.get(line_start..s)?;
    // Allow a non-whitespace prefix only when it ends with `>` — this happens
    // when an element is immediately preceded by a parent's closing `>` on the
    // same line (e.g. `    ><clipPath …>` inside a `<defs\n    >`). In that
    // case the pure-whitespace part of the prefix is used for inner indentation
    // and the closing `>` position.
    let non_ws_prefix = !indent.bytes().all(|b| b == b' ' || b == b'\t');
    if non_ws_prefix && !indent.ends_with('>') {
        return None;
    }
    // Extract the pure-whitespace portion of the prefix (everything up to and
    // not including a trailing non-whitespace `>`) for use in indented output.
    let ws_indent: &str = if non_ws_prefix {
        let trim_end_pos = indent.rfind([' ', '\t']).map_or(0, |i| i + 1);
        &indent[..trim_end_pos]
    } else {
        indent
    };

    // When the content is already multi-line (e.g. a child element whose
    // attributes wrapped), prettier still applies the hug form: `>` glues
    // to the content's first character and the closing `</tag` sits before
    // the final `>`. Since the content is multi-line the element obviously
    // doesn't fit on one line, so we skip straight to the hug transform.
    // Only handle single-line open tags here; multi-line open tags are
    // handled by the `open.contains('\n')` branch below.
    if raw.contains('\n') && !open.contains('\n') {
        let inner_indent = format!("{ws_indent}{indent_unit_hm}");
        let open_no_bracket = &open[..open.len() - 1];
        // When raw ends with whitespace (component with trailing newline+indent before
        // `</Tag>`), the trailing whitespace provides the correct indentation, so just
        // use `</{tag}>` directly instead of adding `\n{ws_indent}>`.
        let result = if raw_trail_ws_only {
            format!("{open_no_bracket}\n{inner_indent}>{raw}</{tag}>")
        } else {
            format!("{open_no_bracket}\n{inner_indent}>{raw}</{tag}\n{ws_indent}>")
        };
        return (result != whole).then_some((start, end, result));
    }

    // When an adjusted raw is available (the markup pass used hug_open=true and
    // glued `>` to the last attribute), use adj_raw instead of raw for the
    // `open.contains('\n')` block.  adj_raw has the leading `\n{inner_indent}`
    // stripped so the content is directly adjacent to `>`.
    let raw = adj_raw.unwrap_or(raw);
    // Recompute raw_trail_ws_only with the possibly-updated `raw` (adj_raw may end
    // with whitespace even though the original `raw` started with whitespace).
    let raw_trail_ws_only = is_component_tag(tag)
        && !raw.starts_with([' ', '\t', '\r', '\n'])
        && raw.ends_with([' ', '\t', '\r', '\n']);

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
        let inner_indent = format!("{ws_indent}{indent_unit_hm}");
        // When the element is preceded by non-whitespace on the same line (e.g.
        // it follows a sibling's close-tag `>`), `last_line` is just the tag
        // name and does not reflect the true start column. Use `column` (the
        // element's real start column) in that case so we don't incorrectly
        // collapse elements whose merged line would exceed `line_width`.
        let glued = if non_ws_prefix {
            column + 1 + raw.visual_width(tw) + 2 + tag.visual_width(tw)
        } else {
            last_line.visual_width(tw) + 1 + raw.visual_width(tw) + 2 + tag.visual_width(tw)
        };
        if glued <= line_width {
            let result = format!("{onb}>{raw}</{tag}\n{ws_indent}>");
            return (result != whole).then_some((start, end, result));
        }
        // The content is too long to fit even on the inner-indent line. Try to
        // break the content's inner components' attributes using the Doc IR. This
        // handles cases like `<Button\n  >text<Icon class="…"/></Button\n>` where
        // the Icon's attributes need to wrap.
        // For Components where raw ends with whitespace (trailing newline before
        // `</Tag>`), the trailing whitespace provides the natural line break — use
        // `</{tag}>` directly without an additional `\n{ws_indent}>`.  This matches
        // the `raw_trail_ws_only` logic in the single-line-open path.
        let close_form = if raw_trail_ws_only {
            format!("</{tag}>")
        } else {
            format!("</{tag}\n{ws_indent}>")
        };
        let simple = format!("{onb}\n{inner_indent}>{raw}{close_form}");
        // When the hugged inner line `>{raw}</{tag}` overflows, break an inner
        // component's attributes via the Doc IR. The measured group carries the close
        // tag `</tag` (prettier's `group(['>', body, '</tag'])`) so the printer's fits
        // lookahead counts its width — otherwise a child whose own attrs fit but
        // overflow once the close tag is appended never breaks.
        let inner_line =
            inner_indent.visual_width(tw) + 1 + raw.visual_width(tw) + 2 + tag.visual_width(tw);
        if !raw_trail_ws_only
            && inner_line > line_width
            && !raw.contains('\n')
            && let Some(body) = build_children_doc(out, fragment)
        {
            let base_level = if options.js.indent_style.is_tab() {
                inner_indent
                    .bytes()
                    .take_while(|&b| b == b' ' || b == b'\t')
                    .count()
            } else {
                inner_indent.visual_width(tw) / indent_width_hm
            };
            let measured = crate::doc::Doc::Group(vec![
                crate::doc::Doc::Text(">".to_string()),
                body,
                crate::doc::Doc::Text(format!("</{tag}")),
            ]);
            let printed_full = crate::doc::print(
                &measured,
                line_width,
                IndentUnit::new(indent_unit_hm.as_str(), tw),
                base_level,
                inner_indent.visual_width(tw),
            );
            if printed_full.contains('\n') {
                let result2 = format!("{onb}\n{inner_indent}{printed_full}\n{ws_indent}>");
                if result2 != whole {
                    return Some((start, end, result2));
                }
            }
        }
        if simple != whole {
            return Some((start, end, simple));
        }
        // `simple == whole` — already in the hug form but content still overflows.
        // Use the Doc IR to reformat the inner content, allowing component attributes
        // to break.
        let body_opt = build_children_doc(out, fragment);
        if let Some(body) = body_opt {
            let inner_col = inner_indent.visual_width(tw) + 1; // column after the `>`
            let base_level = if options.js.indent_style.is_tab() {
                inner_indent
                    .bytes()
                    .take_while(|&b| b == b' ' || b == b'\t')
                    .count()
            } else {
                inner_indent.visual_width(tw) / indent_width_hm
            };
            let printed = crate::doc::print(
                &body,
                line_width,
                IndentUnit::new(indent_unit_hm.as_str(), tw),
                base_level,
                inner_col,
            );
            if printed != raw {
                let result2 = format!("{onb}\n{inner_indent}>{printed}{close_form}");
                if result2 != whole {
                    return Some((start, end, result2));
                }
            }
        }
        // Last-resort: defer the trailing `>` of the last element's close tag to the
        // next line so the combined `  >{content}</{tag}` line fits.  This matches
        // prettier's "shouldHugEnd" close-tag deferral when the content is adjacent
        // (shouldHugStart) and the full inner line would overflow the print width.
        // Concretely: `<Component\n  >{a}</button></Component\n>` overflows as one
        // line; deferring produces `<Component\n  >{a}</button\n  ></Component\n>`.
        // Only fire when:
        //   - The raw content (all on one line) ends with `>`.
        //   - Removing the trailing `>` makes the inner line fit.
        //   - The result differs from the current form.
        let full_inner =
            inner_indent.visual_width(tw) + 1 + raw.visual_width(tw) + 2 + tag.visual_width(tw);
        if full_inner > line_width && !raw.contains('\n') && raw.ends_with('>') {
            let raw_deferred = &raw[..raw.len() - 1]; // trim the trailing `>`
            let deferred_inner = inner_indent.visual_width(tw) + 1 + raw_deferred.visual_width(tw);
            if deferred_inner <= line_width {
                let result3 = format!(
                    "{onb}\n{inner_indent}>{raw_deferred}\n{inner_indent}></{tag}\n{ws_indent}>"
                );
                if result3 != whole {
                    return Some((start, end, result3));
                }
            }
        }
        return None;
    }

    let element_one_line =
        column + open.visual_width(tw) + raw.visual_width(tw) + close.visual_width(tw);
    if element_one_line <= line_width && !has_flow_block {
        return None; // fits as-is (and no forced break needed)
    }

    // When a flow block child forces a break and the open tag is single-line,
    // apply the hug form directly. The content (including flow blocks like
    // `{#if}`) stays verbatim on the inner-indent line — the Doc IR path below
    // can't handle flow block children (build_children_doc returns None for them),
    // so this is the only path that produces the correct hug form.
    // Limit this to cases where the content fits on the inner-indent line so we
    // don't produce overflowing output.
    if has_flow_block && !open.contains('\n') {
        let inner_indent = format!("{ws_indent}{indent_unit_hm}");
        let open_no_bracket = &open[..open.len() - 1];
        let result = format!("{open_no_bracket}\n{inner_indent}>{raw}</{tag}\n{ws_indent}>");
        return (result != whole).then_some((start, end, result));
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
    let body_opt = build_children_doc(out, fragment);
    let body = body_opt?;
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
    let level = if options.js.indent_style.is_tab() {
        ws_indent
            .bytes()
            .take_while(|&b| b == b' ' || b == b'\t')
            .count()
    } else {
        ws_indent.visual_width(tw) / indent_width_hm
    };
    let printed = crate::doc::print(
        &elem_doc,
        line_width,
        IndentUnit::new(indent_unit_hm.as_str(), tw),
        level,
        column,
    );
    (printed != whole).then_some((start, end, printed))
}
