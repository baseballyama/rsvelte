use super::{
    FormatOptions, Fragment, TemplateNode, VisualWidth, apply_edits, child_fragments,
    current_column, did_self_close, indent_config, is_block_display, is_whitespace_preserving,
    node_end, node_start, parse_formatted, split_open_tag_attrs, tab_width, with_pre_content,
};
use rsvelte_core::ast::template::RegularElement;

/// Whether a `<pre>`'s attributes stay on its open-tag line. prettier keeps the
/// attribute group flat when everything up to the first line-break opportunity
/// fits — its `fits` runs past `>` into the content, and `printPre` offers a
/// break at a text newline, at a mustache's first breakable JS group, or at a
/// child tag's own attribute / hug break; only a content with none of those
/// charges the close tag too.
pub(super) fn pre_attrs_fit(
    column: usize,
    open_width: usize,
    tag_name: &str,
    content_prefix: (usize, bool),
    line_width: usize,
) -> bool {
    let (content, found_break) = content_prefix;
    let close = if found_break { 0 } else { tag_name.len() + 3 };
    column + open_width + content + close <= line_width
}

/// Columns of a `<pre>` content up to its first line-break opportunity, and
/// whether one was found (else the whole content was measured). `None` for a
/// content this walk does not model (a block, a `{@render}`).
pub(super) fn pre_content_prefix(
    out: &str,
    nodes: &[TemplateNode],
    options: &FormatOptions,
) -> Option<(usize, bool)> {
    let tw = tab_width(options);
    let mut width = 0;
    for node in nodes {
        let span = out.get(node_start(node) as usize..node_end(node) as usize)?;
        match node {
            TemplateNode::Text(_) => {
                if let Some(nl) = span.find('\n') {
                    return Some((width + span[..nl].visual_width(tw), true));
                }
                width += span.visual_width(tw);
            }
            TemplateNode::ExpressionTag(_) | TemplateNode::HtmlTag(_) => {
                let (head, inner) = split_mustache(span)?;
                let Some(inner) = inner else {
                    width += span.visual_width(tw);
                    continue;
                };
                // At width 1 every breakable group breaks, so the first line
                // ends exactly at the first opportunity.
                let minimal =
                    crate::expression::reformat_content_at_width(inner, options, 1, 0).ok()?;
                match minimal.find('\n') {
                    Some(nl) => {
                        return Some((
                            width + head.visual_width(tw) + minimal[..nl].visual_width(tw),
                            true,
                        ));
                    }
                    None => width += head.visual_width(tw) + minimal.visual_width(tw) + 1,
                }
            }
            TemplateNode::RegularElement(e) => {
                width += 1 + e.name.len();
                if !e.attributes.is_empty()
                    || !is_block_display(e.name.as_str())
                    || did_self_close(out, e.end)
                {
                    return Some((width, true));
                }
                width += 1;
                let (inner, found) = pre_content_prefix(out, &e.fragment.nodes, options)?;
                width += inner;
                if found {
                    return Some((width, true));
                }
                width += e.name.len() + 3;
            }
            TemplateNode::Component(c) => return Some((width + 1 + c.name.len(), true)),
            TemplateNode::Comment(_) => {
                if span.contains('\n') {
                    return None;
                }
                width += span.visual_width(tw);
            }
            _ => return None,
        }
    }
    Some((width, false))
}

/// `{expr}` / `{@html expr}` → its head (`{` / `{@html `) and trimmed
/// expression, `None` for an empty mustache.
fn split_mustache(span: &str) -> Option<(&'static str, Option<&str>)> {
    let head = if span.starts_with("{@html") {
        "{@html "
    } else {
        "{"
    };
    let inner = span
        .strip_prefix(head.trim_end())?
        .strip_suffix('}')?
        .trim();
    Some((head, (!inner.is_empty()).then_some(inner)))
}

/// Lay out the mustaches on a `<pre>`'s content lines the way prettier's
/// printer walks its groups, left to right: a mustache breaks when its flat
/// form plus everything up to the next line-break opportunity overflows, its
/// first line is charged what precedes it on the line and its last line what
/// follows, and its continuation lines sit one level inside the element.
/// `content_col` is the column right after the open tag's `>`. Stops at the
/// first child tag, whose own layout owns the rest of the line.
pub(super) fn layout_pre_mustaches(
    out: &str,
    elem: &RegularElement,
    content_col: usize,
    line_width: usize,
    options: &FormatOptions,
) -> Vec<(u32, u32, String)> {
    let tw = tab_width(options);
    let iw = options.js.indent_width.value() as usize;
    let cont_cols = current_column(out, elem.start, tw) + iw;
    let mut edits = Vec::new();
    let mut col = content_col;
    let nodes = &elem.fragment.nodes;
    for (i, node) in nodes.iter().enumerate() {
        let Some(span) = out.get(node_start(node) as usize..node_end(node) as usize) else {
            return edits;
        };
        match node {
            TemplateNode::Text(_) | TemplateNode::Comment(_) => {
                col = match span.rfind('\n') {
                    Some(nl) => span[nl + 1..].visual_width(tw),
                    None => col + span.visual_width(tw),
                };
            }
            TemplateNode::ExpressionTag(_) | TemplateNode::HtmlTag(_) => {
                if span.contains('\n') {
                    col = span[span.rfind('\n').unwrap_or(0) + 1..].visual_width(tw);
                    continue;
                }
                let Some((head, Some(inner))) = split_mustache(span) else {
                    col += span.visual_width(tw);
                    continue;
                };
                let Some((rest, found)) = pre_content_prefix(out, &nodes[i + 1..], options) else {
                    return edits;
                };
                let rest = rest + if found { 0 } else { elem.name.len() + 3 };
                let flat = span.visual_width(tw);
                if col + flat + rest <= line_width {
                    col += flat;
                    continue;
                }
                let first_line_offset = (col + head.visual_width(tw)).saturating_sub(cont_cols);
                let Ok(wrapped) = crate::expression::reformat_content_layout(
                    inner,
                    options,
                    line_width.saturating_sub(cont_cols).max(1),
                    cont_cols,
                    first_line_offset,
                    1 + rest,
                ) else {
                    return edits;
                };
                let Some(last_nl) = wrapped.rfind('\n') else {
                    col += flat;
                    continue;
                };
                col = wrapped[last_nl + 1..].visual_width(tw) + 1;
                let broken = format!("{head}{wrapped}}}");
                if broken != span {
                    edits.push((node_start(node), node_end(node), broken));
                }
            }
            _ => return edits,
        }
    }
    edits
}

/// Break a `<pre>`'s attributes one per line, `>` hugging the last (prettier
/// never dedents a `<pre>`'s `>`). Rewrites the open tag only, so a child
/// open-tag edit in the same pass cannot overlap it; returns the edit with the
/// column the content starts at once wrapped.
pub(super) fn wrap_pre_own_attrs(
    out: &str,
    elem: &RegularElement,
    options: &FormatOptions,
) -> Option<((u32, u32, String), usize)> {
    let tw = tab_width(options);
    let s = elem.start as usize;
    let open_end = node_start(elem.fragment.nodes.first()?) as usize;
    let open = out.get(s..open_end)?;
    if open.contains('\n') || !open.ends_with('>') {
        return None;
    }
    let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
    let indent = out.get(line_start..s)?;
    if !indent.bytes().all(|b| b == b' ' || b == b'\t') {
        return None;
    }
    let inner = open.get(1..open.len() - 1)?;
    let attrs = split_open_tag_attrs(inner.get(inner.find(' ')? + 1..)?.trim());
    let last = attrs.last()?;
    let iw = options.js.indent_width.value() as usize;
    let attr_col = indent.visual_width(tw) + iw;
    let inner_indent = " ".repeat(attr_col);
    let mut new_open = format!("<{}", elem.name);
    for attr in &attrs {
        new_open.push('\n');
        new_open.push_str(&inner_indent);
        new_open.push_str(attr);
    }
    new_open.push('>');
    Some((
        (
            crate::source_offset(s),
            crate::source_offset(open_end),
            new_open,
        ),
        attr_col + last.visual_width(tw) + 1,
    ))
}

struct PreReindent<'a> {
    tab_lines: &'a std::collections::HashSet<usize>,
    ignored_ranges: &'a [(usize, usize)],
    indent_width: usize,
    content_depth: usize,
    hugged: bool,
    source_uses_tabs: bool,
    configured_tabs: bool,
}

fn reindent_pre_lines(formatted: &str, context: &PreReindent<'_>) -> String {
    let mut result = String::new();
    let mut offset = 0usize;
    let mut first_line = true;
    for line in formatted.split('\n') {
        if first_line && context.hugged {
            result.push_str(line.trim_start_matches(' '));
            first_line = false;
        } else {
            result.push('\n');
            let ignored = context
                .ignored_ranges
                .iter()
                .any(|&(start, end)| offset > start && offset < end);
            if ignored {
                result.push_str(line);
            } else {
                let trimmed = line.trim_start_matches(' ');
                if !trimmed.is_empty() {
                    let spaces = line.len() - trimmed.len();
                    let depth = spaces / context.indent_width + context.content_depth;
                    let tabs = if context.tab_lines.contains(&offset) {
                        context.source_uses_tabs
                    } else {
                        context.configured_tabs
                    };
                    if tabs {
                        for _ in 0..depth {
                            result.push('\t');
                        }
                    } else {
                        for _ in 0..depth * context.indent_width {
                            result.push(' ');
                        }
                    }
                    result.push_str(trimmed);
                }
            }
        }
        offset += line.len() + 1;
    }
    if !context.hugged {
        result.push('\n');
        let close_depth = context.content_depth.saturating_sub(1);
        if context.source_uses_tabs {
            for _ in 0..close_depth {
                result.push('\t');
            }
        } else {
            for _ in 0..close_depth * context.indent_width {
                result.push(' ');
            }
        }
    }
    result
}

/// Whether a fragment has any element/component/slot child that (a) has at
/// least one attribute AND (b) itself has non-text children (elements,
/// expression tags, or blocks).  Used as a secondary trigger for
/// [`reformat_pre_inner`] so that `<pre>` elements containing
/// `<code class="…"><span>…</span></code>` structure are reformatted even when
/// no control-flow blocks are present.  Elements without attributes are left
/// verbatim to avoid disturbing plain `<pre><div><span>…</span></div></pre>`
/// structures whose oracle output keeps the inner content as-is.
pub(super) fn fragment_has_element_with_children(fragment: &Fragment) -> bool {
    fragment.nodes.iter().any(|n| {
        let (child_frag, has_attrs) = match n {
            TemplateNode::RegularElement(e) => (Some(&e.fragment), !e.attributes.is_empty()),
            TemplateNode::Component(c) => (Some(&c.fragment), !c.attributes.is_empty()),
            TemplateNode::SlotElement(e) => (Some(&e.fragment), !e.attributes.is_empty()),
            _ => (None, false),
        };
        (has_attrs
            && child_frag.is_some_and(|f| {
                f.nodes.iter().any(|cn| {
                    matches!(
                        cn,
                        TemplateNode::RegularElement(_)
                            | TemplateNode::Component(_)
                            | TemplateNode::SlotElement(_)
                    )
                })
            }))
            || child_fragments(n)
                .iter()
                .any(|f| fragment_has_element_with_children(f))
    })
}

pub(super) fn fragment_has_block(fragment: &Fragment) -> bool {
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

fn fragment_needs_block_reformat(fragment: &Fragment) -> bool {
    fragment.nodes.iter().any(|n| {
        matches!(n, TemplateNode::RegularElement(e) if matches!(e.name.as_str(), "script" | "style"))
            || child_fragments(n)
                .iter()
                .any(|f| fragment_has_block(f) || fragment_needs_block_reformat(f))
    })
}

/// Walk the tree (tracking nesting depth) and, for each `<pre>`/`<textarea>` whose
/// raw-content subtree contains a block or whose attributed children need layout, push an edit
/// re-formatting its inner content with the pre hybrid rule
/// (see [`reformat_pre_inner`]).
pub(super) fn collect_pre_block_reformats(
    out: &str,
    fragment: &Fragment,
    depth: usize,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) {
    for (i, node) in fragment.nodes.iter().enumerate() {
        // A `<!-- prettier-ignore -->`d node and its whole subtree stay verbatim.
        if crate::prettier_ignore::preceded_by_prettier_ignore(&fragment.nodes, i) {
            continue;
        }
        if let TemplateNode::RegularElement(e) = node
            && matches!(e.name.as_str(), "pre" | "textarea")
            && (fragment_has_element_with_children(&e.fragment)
                || fragment_needs_block_reformat(&e.fragment))
        {
            if let Some(edit) = reformat_pre_inner(out, e, depth + 1, options) {
                edits.push(edit);
            }
            continue; // its subtree is owned by this edit
        }
        if let TemplateNode::RegularElement(e) = node
            && matches!(e.name.as_str(), "pre" | "textarea")
        {
            collect_direct_pre_block_body_indents(out, &e.fragment, depth + 1, options, edits);
            continue;
        }
        for child in child_fragments(node) {
            collect_pre_block_reformats(out, child, depth + 1, options, edits);
        }
    }
}

fn collect_direct_pre_block_body_indents(
    out: &str,
    fragment: &Fragment,
    depth: usize,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) {
    for node in &fragment.nodes {
        if let TemplateNode::IfBlock(block) = node
            && let Some(TemplateNode::Text(text)) = block.consequent.nodes.first()
        {
            let raw = out
                .get(text.start as usize..text.end as usize)
                .unwrap_or_default();
            let leading = raw
                .bytes()
                .take_while(|b| *b == b' ' || *b == b'\t')
                .count();
            if leading > 0 && !raw[..leading].contains('\n') {
                let indent = indent_config(options).0.repeat(depth + 1);
                edits.push((
                    text.start,
                    text.start + leading as u32,
                    format!("\n{indent}"),
                ));
            }
        }
    }
}

/// After re-indenting a `<pre>` inner content, collapse multi-line span elements
/// whose content is text-only (no child elements, so no `<` in the text body)
/// back to a single inline line.
///
/// Prettier's `isPreTagContent` mode keeps such spans on one line even when the
/// result slightly overflows `printWidth`, because the content has no natural
/// break-points.  Our sub-format doesn't know the final column so it may break
/// them — this pass reverses that break.
///
/// Pattern (tabs for element-direct lines; spaces for block-body lines):
/// ```text
/// TABS<span ATTRS\n
/// SPACES>TEXT</span\n    ← TEXT contains no '<' (text-only body)
/// SPACES>
/// ```
/// Collapses to:
/// ```text
/// TABS<span ATTRS>TEXT</span>
/// ```
/// Collapse multi-line `<span>` elements inside `<pre>` whose content is
/// text-only (no child elements) back onto a single line, mimicking prettier's
/// `isPreTagContent` behaviour where pure-text spans with no natural break
/// points are not broken even if the result would slightly overflow `printWidth`.
///
/// `narrowed_width` is the sub-format's effective print width (already reduced
/// by the `<pre>` nesting depth). The check mirrors prettier's logic: the
/// collapsed element (without leading indentation) must fit within
/// `narrowed_width`. Tab-prefixed lines count tabs as 1 char each for the
/// width test because the sub-format sees space indentation but we've already
/// converted to tabs in the re-indent pass.
pub(super) fn collapse_text_only_spans(s: &str, narrowed_width: usize) -> String {
    // Fast path: nothing to do if there is no multi-line span pattern.
    if !s.contains("</span\n") {
        return s.to_string();
    }

    let mut out = String::with_capacity(s.len());
    let mut remaining = s;

    while let Some(nl_pos) = remaining.find('\n') {
        let line = &remaining[..nl_pos];
        let trimmed = line.trim_start_matches(['\t', ' ']);

        // Detect: a line ending with an open-tag fragment (no closing '>').
        // The line starts with whitespace + '<' + a tag name (element or component).
        // The open tag has no closing '>' on this line (it's a multi-line tag).
        if !trimmed.is_empty()
            && trimmed.starts_with('<')
            && !trimmed.starts_with("</")
            && !trimmed.ends_with('>')
            && !trimmed.ends_with("/>")
        {
            // Check if the next line matches '>(TEXT)</span' with TEXT containing no '<'.
            let after_nl = &remaining[nl_pos + 1..];
            if let Some(next_nl_pos) = after_nl.find('\n') {
                let next_line = &after_nl[..next_nl_pos];
                let next_trimmed = next_line.trim_start_matches(' ');

                // Next line must start with '>' and end with '</span' (no closing '>')
                if next_trimmed.starts_with('>') && next_trimmed.ends_with("</span") {
                    // The TEXT content is between '>' and '</span'.
                    let text_content = &next_trimmed[1..next_trimmed.len() - 6];
                    // TEXT must contain no '<' (text-only, no child elements).
                    if !text_content.contains('<') {
                        // Check if the line after THAT is a single '>' (closes </span).
                        let after_next_nl = &after_nl[next_nl_pos + 1..];
                        let third_nl_pos = after_next_nl.find('\n');
                        let third_line =
                            third_nl_pos.map_or(after_next_nl, |p| &after_next_nl[..p]);
                        let third_trimmed = third_line.trim_start_matches([' ', '\t']);

                        if third_trimmed == ">" {
                            // Width check: prettier's `isPreTagContent` collapses a
                            // text-only span when the element content (without leading
                            // indentation) fits within the sub-format's narrowed width.
                            // This matches the case where the sub-format broke the span
                            // only because of the leading indentation, not because the
                            // element body itself overflows the effective width.
                            //
                            // `trimmed` is `<span ATTRS` (no `>`).
                            // Collapsed content = trimmed + ">" + text + "</span>".
                            let collapsed_content_width = trimmed.chars().count()
                                + 1 // '>'
                                + text_content.chars().count()
                                + 7; // '</span>'
                            if collapsed_content_width <= narrowed_width {
                                // Collapse: emit PREFIX<span ATTRS>TEXT</span>
                                out.push_str(line);
                                out.push('>');
                                out.push_str(text_content);
                                out.push_str("</span>");
                                // Skip the three consumed lines.
                                remaining = third_nl_pos.map_or("", |p| &after_next_nl[p..]);
                                continue;
                            }
                        }
                    }
                }
            }
        }

        out.push_str(line);
        out.push('\n');
        remaining = &remaining[nl_pos + 1..];
    }
    out.push_str(remaining);
    out
}

/// Re-format the inner content of a `<pre>`/`<textarea>` that contains a block.
/// `content_depth` is the nesting depth of the element's children. The content is
/// formatted standalone at a width narrowed by `content_depth` levels (so embedded
/// JS / blocks break exactly as they would at their real column), then every line
/// is re-indented out to its real depth — using the `<pre>` source's own tab/space
/// style for whitespace that is the direct child of an element (oxfmt preserves it
/// verbatim), and the document's configured indent style for block bodies and
/// formatted internals (attributes, JS, wrapped open tags), which are freshly
/// generated rather than preserved.
pub(super) fn reformat_pre_inner(
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

    // Whitespace inside `<pre>` is preserved verbatim by oxfmt, so the reformatted
    // structure below only becomes tabs when the SOURCE indented with tabs. A
    // `<pre>` whose body is space-indented keeps spaces throughout.
    let pre_uses_tabs = raw_inner.lines().any(|l| l.starts_with('\t'));

    let iw = options.js.indent_width.value() as usize;
    let full_width = options.js.line_width.value() as usize;
    // Format the children standalone, but narrowed so a depth-0 layout matches the
    // breaks at the real `content_depth`.
    //
    // Under `useTabs`, `<pre>` content is re-indented with TABS (1 char each)
    // rather than spaces (`iw` chars each).  The sub-format sees space indentation,
    // so a line at sub-depth D appears as `D*iw` chars, but in the final output the
    // tab-indented prefix uses only `D + content_depth` chars (one per tab level).
    // Using `content_depth * iw` as the narrowing over-narrows for tab lines,
    // causing hug-overflow on elements that would fit when tab-indented.
    //
    // The saving per sub-depth level is `iw - 1` chars (tab = 1 vs space = iw).
    // We add one level's saving (`iw - 1`) to account for the typical case where
    // grandchildren at sub-depth 1 (e.g. `<span>` inside `<code>` inside `<pre>`)
    // are tab-lines in the final output.
    // Correct narrowing for space-indented lines: `content_depth * iw` extra chars.
    // For tab-indented lines at depth D: only `content_depth - D*(iw-1)` extra chars,
    // which is LESS. So using `content_depth * iw` as the narrowing over-narrows
    // tab lines — they may break in the sub-format when they would fit at the real
    // width.  Over-breaking in the sub-format is harmless (produces more verbose but
    // still correct output) whereas under-narrowing leaves space lines too wide,
    // causing incorrect single-line output for lines that overflow at the real column.
    // Use `content_depth * iw` (correct for space lines) as the primary narrowing.
    let narrowed = full_width
        .saturating_sub(content_depth)
        .saturating_add(iw - 1)
        .max(20);
    let mut sub_opts = options.clone();
    sub_opts.js.line_width =
        oxc_formatter_core::LineWidth::try_from(crate::formatter_width(narrowed)).ok()?;
    // The re-indent pass below (`spaces / iw`) only understands space-based
    // indentation columns — it strips leading `' '` and measures depth by byte
    // count, then re-emits either spaces or (for element-direct lines) tabs at
    // the real depth. Under `useTabs` the sub-format would otherwise inherit the
    // outer tab style and hand back tab-indented lines that `trim_start_matches(' ')`
    // can't see through, leaving their original tab prefix embedded verbatim and
    // getting a second, wrongly-computed indent prepended in front of it (mixed
    // space+tab output, #2151). Force spaces for this internal working
    // representation regardless of the caller's style; the final loop below is
    // what decides tabs vs spaces in the real output.
    sub_opts.js.indent_style = oxc_formatter_core::IndentStyle::Space;
    let formatted =
        with_pre_content(|| crate::format(raw_inner.trim_matches(['\n', '\r']), &sub_opts)).ok()?;
    let formatted = formatted.trim_end_matches('\n');
    if formatted.is_empty() {
        return None;
    }
    // After the recursive format, child elements (Components like `<Button>`)
    // whose open tags are multi-line may have `>` on its own line because the
    // formatter doesn't know they're inside `<pre>` (no `isPreTagContent` hug).
    // Fix those: move `>` back to hug the last attribute line (Sub-case B only
    // — overflow-breaking Sub-case A doesn't apply here since we're at narrowed
    // width and the outer re-indent will shift everything anyway).
    let formatted = {
        let sub_root_pre = parse_formatted(formatted)?;
        let pre_fix_edits = fix_pre_child_hug_only(formatted, &sub_root_pre.fragment);
        if pre_fix_edits.is_empty() {
            formatted.to_string()
        } else {
            apply_edits(formatted, pre_fix_edits)
        }
    };
    let formatted = formatted.trim_end_matches('\n');
    // Unpack span siblings that our fill algorithm packed together but whose
    // next line would overflow full_width after re-indentation.  The fill
    // algorithm may produce `</span><span\n(SPACES)>CONTENT` when both the
    // opening `<span` and the closing `</span>` fit on one line; prettier
    // inside `<pre>` (isPreTagContent) uses hardlines between siblings when
    // the resulting line would overflow, so the break belongs BETWEEN the
    // siblings (`</span\n(PARENT)><span>CONTENT`), not inside the open tag.
    // Only applies to no-attribute spans so we don't disturb legitimate
    // deferred-`>` open tags caused by attribute overflow.
    let formatted = fix_pre_packed_span_siblings(formatted, iw, content_depth, full_width);
    // For lines that still overflow after re-indent and end with `</span>SUFFIX</span`,
    // break the `>SUFFIX</span` to the next line (removing the `>` from the inner close).
    // This matches prettier's isPreTagContent behaviour for spans whose trailing content
    // would push the line past full_width even with the correct narrowed budget.
    let formatted = fix_pre_overflow_close_suffix(&formatted, iw, content_depth, full_width);
    let formatted = formatted.trim_end_matches('\n');

    // Whether the original content was hugged directly after `>` (no leading
    // whitespace). When hugged, the first line stays inline (no leading `\n`)
    // and subsequent lines are re-indented normally.
    let hugged = !raw_inner.starts_with(|c: char| c.is_ascii_whitespace());

    // Hugged first-line overflow fix: the sub-format doesn't know the actual
    // column of the first inline line (it equals `prefix_col`, the column of the
    // `>` that closes the `<pre>` open tag).  An inline element at sub-column
    // `col` has actual column `prefix_col + col`.  When the element overflows at
    // the actual column, apply a hug-break in `formatted` so re-indentation
    // produces the correct prettier `hugStart && hugEnd` layout.
    let first_line_fixed: Option<String> = if hugged {
        let gt_pos = inner_start - 1; // position of the closing `>` of the open tag
        let gt_line_start = out[..gt_pos].rfind('\n').map_or(0, |i| i + 1);
        let prefix_col = gt_pos - gt_line_start + 1; // columns before first inner char
        fix_pre_hugged_first_line(formatted, prefix_col, full_width, iw)
    } else {
        None
    };
    let formatted: &str = first_line_fixed
        .as_ref()
        .map_or(formatted, |fixed| fixed.trim_end_matches('\n'));

    // Determine which line-starts in `formatted` are element-direct whitespace
    // (→ verbatim source style). Everything else is reformatted structure (block
    // bodies, wrapped attributes, wrapped JS) and follows the document's
    // configured indent style, not the `<pre>` source's own tab usage.
    let sub_root = parse_formatted(formatted)?;
    let mut tab_lines: HashSet<usize> = HashSet::new();
    collect_pre_tab_lines(formatted, &sub_root.fragment, true, &mut tab_lines);
    let configured_tabs = options.js.indent_style.is_tab();

    // A `<!-- prettier-ignore -->`d descendant's own subtree must stay
    // byte-verbatim: only the line carrying its opening tag (indentation
    // generated by the *parent*) goes through the normal re-indent below.
    let mut ignored_ranges: Vec<(usize, usize)> = Vec::new();
    collect_ignored_ranges(&sub_root.fragment, &mut ignored_ranges);

    let result = reindent_pre_lines(
        formatted,
        &PreReindent {
            tab_lines: &tab_lines,
            ignored_ranges: &ignored_ranges,
            indent_width: iw,
            content_depth,
            hugged,
            source_uses_tabs: pre_uses_tabs,
            configured_tabs,
        },
    );

    // Post-processing: collapse multi-line spans whose content is text-only
    // (no child elements) back to a single inline line, matching prettier's
    // behaviour for `<pre>` content where short spans with only text are kept
    // on one line even if the result slightly overflows the print width.
    //
    // Pattern (with TABs for element-direct lines, SPACES for block-body lines):
    //   TABS<span ATTRS\n
    //   SPACES>TEXT</span\n     ← TEXT has no '<' (text-only, no child elements)
    //   SPACES>
    //
    // Collapsed form:
    //   TABS<span ATTRS>TEXT</span>
    let result = collapse_text_only_spans(&result, narrowed);

    let replacement = result;
    let current = out.get(inner_start..inner_end)?;
    (replacement != current).then_some((
        crate::source_offset(inner_start),
        crate::source_offset(inner_end),
        replacement,
    ))
}

/// Collect the `(start, end)` byte ranges (in `formatted`) of every
/// `<!-- prettier-ignore -->`d node's subtree, so the final re-indent pass in
/// [`reformat_pre_inner`] can leave lines strictly inside one untouched — an
/// ignored node's own content must stay byte-verbatim; only the line carrying
/// its opening tag (whose indentation is generated by the *parent*) still
/// goes through normal re-indentation.
pub(super) fn collect_ignored_ranges(fragment: &Fragment, ranges: &mut Vec<(usize, usize)>) {
    for (i, node) in fragment.nodes.iter().enumerate() {
        if crate::prettier_ignore::preceded_by_prettier_ignore(&fragment.nodes, i) {
            ranges.push((node_start(node) as usize, node_end(node) as usize));
            continue; // the whole subtree is covered by this one range
        }
        for child in child_fragments(node) {
            collect_ignored_ranges(child, ranges);
        }
    }
}

/// Collect the line-start byte offsets in `formatted` whose indentation is
/// element-direct whitespace (preserved verbatim by oxfmt inside `<pre>`, so it
/// uses the `<pre>` source's own tab/space style): a node whose parent fragment
/// belongs to a regular element, plus every element's own closing-tag line.
/// Block bodies (parent is a block) and reformatted internals are NOT element-
/// direct — the caller renders those in the document's configured indent style.
pub(super) fn collect_pre_tab_lines(
    formatted: &str,
    fragment: &Fragment,
    parent_is_element: bool,
    set: &mut std::collections::HashSet<usize>,
) {
    for node in &fragment.nodes {
        let ns = node_start(node) as usize;
        let line_start = formatted[..ns].rfind('\n').map_or(0, |i| i + 1);
        // Only mark element-direct structural nodes (elements, components, block
        // constructs) as tab lines — NOT text or expression nodes that happen to
        // start on a new line inside an element.  An ExpressionTag like `{value}`
        // or a Text node that wraps onto its own line is still inline content and
        // must use space indentation, not tabs.
        let is_structural = !matches!(
            node,
            TemplateNode::Text(_) | TemplateNode::ExpressionTag(_) | TemplateNode::HtmlTag(_)
        );
        if parent_is_element
            && is_structural
            && formatted[line_start..ns]
                .bytes()
                .all(|b| b == b' ' || b == b'\t')
        {
            set.insert(line_start);
        }
        // An element's (or component's) own close tag is element-direct
        // trailing whitespace — use tabs.
        let (child_frag, child_end_pos) = match node {
            TemplateNode::RegularElement(e) => (Some(&e.fragment), Some(node_end(node) as usize)),
            TemplateNode::Component(c) => (Some(&c.fragment), Some(node_end(node) as usize)),
            _ => (None, None),
        };
        if let (Some(frag), Some(ne)) = (child_frag, child_end_pos) {
            collect_pre_tab_lines(formatted, frag, true, set);
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

/// Unpack `</span><span\n(SPACES)>CONTENT` patterns in a sub-formatted string
/// when the (SPACES)>CONTENT line would overflow `full_width` after re-indentation.
///
/// Our fill algorithm may pack sibling `<span>` nodes together:
/// `...PREV</span><span\n    >NEXT_CONTENT`
/// Prettier inside `<pre>` (isPreTagContent) instead breaks between siblings:
/// `...PREV</span\n  ><span>NEXT_CONTENT`
/// when the next line would overflow after the re-indent pass adds
/// `content_depth * iw` extra leading spaces.
///
/// Only no-attribute spans are candidates: `</span><span\n` (with nothing
/// between `<span` and the newline).  Spans with attributes have legitimate
/// deferred-`>` open tags caused by attribute overflow and must not be moved.
pub(super) fn fix_pre_packed_span_siblings(
    s: &str,
    iw: usize,
    content_depth: usize,
    full_width: usize,
) -> String {
    // Fast path: if the pattern can't appear, return unchanged.
    if !s.contains("</span><span\n") {
        return s.to_string();
    }
    let mut out = String::with_capacity(s.len() + 64);
    let mut remaining = s;
    while !remaining.is_empty() {
        // Find the next `</span><span` on a line (not inside a string — we're
        // operating on already-formatted HTML-like content).
        let Some(packed_pos) = remaining.find("</span><span") else {
            out.push_str(remaining);
            break;
        };
        // Check that `</span><span` is immediately followed by `\n` (no attrs,
        // no `>` — just the bare open tag then a newline).
        let after_span = &remaining[packed_pos + 12..]; // after "</span><span"
        if !after_span.starts_with('\n') {
            // `<span` has attributes or `>` immediately — not a packing break.
            // Advance past it and continue.
            out.push_str(&remaining[..packed_pos + 12]);
            remaining = after_span;
            continue;
        }
        // `after_span` starts with `\n(SPACES)>CONTENT`. Extract (SPACES).
        let rest_after_nl = &after_span[1..]; // skip the '\n'
        let sp_len = rest_after_nl.bytes().take_while(|&b| b == b' ').count();
        let after_spaces = &rest_after_nl[sp_len..];
        if !after_spaces.starts_with('>') || sp_len < iw {
            // Not a deferred-`>` line, or at top level (can't determine parent).
            out.push_str(&remaining[..packed_pos + 12]);
            remaining = after_span;
            continue;
        }
        // Determine the depth of the deferred-`>` line in the sub-format.
        // Its depth is sp_len / iw.  After re-indent, the line's prefix width
        // is (sp_len / iw + content_depth) * iw.  The content starts after `>`.
        let defer_depth = sp_len / iw;
        let content_start = &after_spaces[1..]; // skip `>`
        // Find end of this next line (the deferred-`>` line)
        let next_line_end = content_start.find('\n').unwrap_or(content_start.len());
        let next_line_content = &content_start[..next_line_end];
        // Full width of re-indented deferred-`>` line:
        //   (defer_depth + content_depth) * iw  +  1 (for '>')  +  next_line_content.len()
        let next_reindented_width =
            (defer_depth + content_depth) * iw + 1 + next_line_content.len();
        // Also check the CURRENT line with `<span` packed onto it.  The parent
        // indent is (sp_len - iw) spaces.  The current line's content starts after
        // those spaces; its full content is the portion up to `</span><span` (12
        // chars) in `remaining`.  Re-indented width of current line WITH `<span`:
        //   (parent_depth + content_depth) * iw + (current_content_len + 5)
        // where 5 = len("<span"), and parent_depth = (sp_len - iw) / iw = sp_len/iw - 1.
        let parent_depth = defer_depth.saturating_sub(1);
        let cur_line_start_in_remaining = remaining[..packed_pos].rfind('\n').map_or(0, |p| p + 1);
        let cur_sp_len = remaining[cur_line_start_in_remaining..packed_pos]
            .bytes()
            .take_while(|&b| b == b' ')
            .count();
        // The packed current line's content = stuff before `</span><span` (the
        // portion not yet in `out`) + `</span><span` (12 chars).
        let cur_content_len = packed_pos - cur_line_start_in_remaining - cur_sp_len + 12; // 12 = "</span><span" appended by packing
        let cur_reindented_width = (cur_sp_len / iw + content_depth) * iw + cur_content_len;
        // Also check the UNPACKED form: after unpacking, the sibling span moves
        // from the deferred `>` position (depth `defer_depth`) to the parent level
        // (depth `parent_depth = defer_depth - 1`).  The unpacked line becomes
        // `(parent_indent)><span>(next_line_content)` where `><span>` is 7 chars.
        // If THIS would overflow, we must unpack so `fix_pre_overflow_close_suffix`
        // can handle the resulting long line correctly.
        let unpacked_rw = (parent_depth + content_depth) * iw + 7 + next_line_content.len();
        if next_reindented_width <= full_width
            && cur_reindented_width <= full_width
            && unpacked_rw <= full_width
        {
            // All fit — keep the packing as-is.
            out.push_str(&remaining[..packed_pos + 12]);
            remaining = after_span;
            continue;
        }
        // The next line would overflow.  Unpack: replace `</span><span\n(SPACES)>`
        // with `</span\n(PARENT_INDENT)><span>` where PARENT_INDENT = (SPACES - iw).
        // Note: the `>` of `</span>` is moved to the start of the next line as part
        // of `><span>` — prettier uses the same `>` to both complete the previous
        // close tag and start the next sibling's deferred open.  So we emit
        // `</span` (without `>`) + `\n` + parent_indent + `><span>`.
        let parent_indent_len = sp_len.saturating_sub(iw);
        out.push_str(&remaining[..packed_pos]); // everything before `</span>`
        out.push_str("</span\n"); // start of close tag (no `>`), then newline
        for _ in 0..parent_indent_len {
            out.push(' ');
        }
        out.push_str("><span>");
        // Skip past `</span><span\n(SPACES)>` — `after_spaces` is at `>CONTENT`,
        // so skip the `>` to land at CONTENT.
        remaining = &after_spaces[1..]; // skip the deferred `>`
    }
    out
}

/// For lines in a sub-formatted string that would overflow `full_width` after
/// re-indentation and end with `</span>SUFFIX</span` (inner close + suffix text +
/// outer close without `>`), break before `>SUFFIX</span` so that the deferred
/// close of the inner span moves to the next line.
///
/// This matches prettier's behaviour inside `<pre>` (isPreTagContent) where the
/// narrow line budget forces the inner close + trailing content to the next line:
///
/// ```text
///   ><span> x=<span class="...">VAL</span>,</span     (overflows after re-indent)
/// ```
/// becomes:
/// ```text
///   ><span> x=<span class="...">VAL</span            (fits)
///     >,</span                                         (continuation at depth+1)
/// ```
pub(super) fn fix_pre_overflow_close_suffix(
    s: &str,
    iw: usize,
    content_depth: usize,
    full_width: usize,
) -> String {
    // Fast path: need `</span>` (inner close with `>`) in the string at all.
    if !s.contains("</span>") {
        return s.to_string();
    }
    let mut out = String::with_capacity(s.len() + 32);
    let mut remaining = s;
    loop {
        let Some(nl_pos) = remaining.find('\n') else {
            // Last line (no trailing newline).
            out.push_str(remaining);
            break;
        };
        let line = &remaining[..nl_pos];
        let sp_len = line.bytes().take_while(|&b| b == b' ').count();
        let content = &line[sp_len..];
        let mut transformed = false;
        // Check: line ends with `</span` (outer close, no `>`) and contains
        // a `</span>` (inner close with `>`) followed by suffix with no `<`.
        if content.ends_with("</span") {
            let outer_close_start = content.len() - 6; // start of outer `</span`
            if let Some(inner_close_rel) = content[..outer_close_start].rfind("</span>") {
                let inner_close_end = inner_close_rel + 7; // after `</span>`
                let suffix = &content[inner_close_end..outer_close_start];
                if !suffix.contains('<') {
                    // Check if re-indented width overflows.
                    let real_depth = sp_len / iw + content_depth;
                    let reindented_width = real_depth * iw + content.len();
                    if reindented_width > full_width {
                        // Break: emit leading spaces + content up to `</span`
                        // (the inner close without `>`), then newline + deeper
                        // indent + `>` + suffix + `</span`.
                        // Byte position of inner close end (excluding `>`).
                        let break_at = sp_len + inner_close_rel + 6;
                        out.push_str(&remaining[..break_at]);
                        out.push('\n');
                        for _ in 0..sp_len + iw {
                            out.push(' ');
                        }
                        out.push('>');
                        out.push_str(suffix);
                        out.push_str("</span");
                        out.push('\n');
                        remaining = &remaining[nl_pos + 1..];
                        transformed = true;
                    }
                }
            }
        }
        if !transformed {
            out.push_str(line);
            out.push('\n');
            remaining = &remaining[nl_pos + 1..];
        }
    }
    out
}

/// For a `<pre>` whose content is hugged (starts inline after `>`), the
/// sub-format doesn't know the actual column of the first line.  An inline
/// element at sub-column `col` has actual column `prefix_col + col` in the
/// final output.  When such an element overflows `full_width`, apply a hug-break
/// so re-indentation produces the correct prettier layout.
///
/// Only applies to attribute-free inline `RegularElement`s whose content is
/// directly adjacent (shouldHugStart && shouldHugEnd) and fits on a single line
/// in the sub-format.  Elements with attributes are already handled by the
/// existing markup/collapse passes.
///
/// Returns `Some(modified_formatted)` if a break was applied, `None` otherwise.
pub(super) fn fix_pre_hugged_first_line(
    formatted: &str,
    prefix_col: usize,
    full_width: usize,
    iw: usize,
) -> Option<String> {
    // Quick exit: if the first line is short enough, no overflow is possible.
    let first_line_end = formatted.find('\n').unwrap_or(formatted.len());
    if prefix_col.saturating_add(first_line_end) <= full_width {
        return None;
    }
    let sub_root = parse_formatted(formatted)?;
    let mut edits: Vec<(usize, usize, String)> = Vec::new();
    collect_pre_first_line_hug_breaks(
        formatted,
        &sub_root.fragment,
        prefix_col,
        full_width,
        iw,
        0,
        &mut edits,
    );
    if edits.is_empty() {
        return None;
    }
    // Apply edits right-to-left so earlier offsets stay valid.
    edits.sort_by_key(|(s, _, _)| std::cmp::Reverse(*s));
    let mut result = formatted.to_string();
    for (s, e, rep) in edits {
        result.replace_range(s..e, &rep);
    }
    Some(result)
}

/// Recursively find inline `RegularElements` (no attributes) on line 0 of
/// `formatted` that overflow at `prefix_col + col_in_formatted` and collect
/// hug-break edits.  `block_depth` counts the number of flow-block bodies
/// that enclose this fragment at the first line.
pub(super) fn collect_pre_first_line_hug_breaks(
    formatted: &str,
    fragment: &Fragment,
    prefix_col: usize,
    full_width: usize,
    iw: usize,
    block_depth: usize,
    edits: &mut Vec<(usize, usize, String)>,
) {
    for node in &fragment.nodes {
        let s = node_start(node) as usize;
        // Skip nodes that start on a later line.
        if formatted[..s].contains('\n') {
            continue;
        }
        match node {
            TemplateNode::RegularElement(e) => {
                let e_start = e.start as usize;
                let e_end = e.end as usize;
                let tag = e.name.as_str();
                // Only attribute-free inline elements (attributes are handled by the
                // existing multi-line open-tag hug paths in the collapse pass).
                if !e.attributes.is_empty()
                    || is_block_display(tag)
                    || is_whitespace_preserving(tag)
                {
                    continue;
                }
                // Skip if the element itself already spans multiple lines.
                let Some(elem_text) = formatted.get(e_start..e_end) else {
                    continue;
                };
                if elem_text.contains('\n') {
                    continue;
                }
                // Open tag must end with `>` directly after tag name (no attrs).
                let open_end_rel = match elem_text.find('>') {
                    Some(i) => i + 1,
                    None => continue,
                };
                let open_end = e_start + open_end_rel;
                let close_start = match elem_text.rfind("</") {
                    Some(i) => e_start + i,
                    None => continue,
                };
                if close_start <= open_end {
                    continue;
                }
                let Some(content) = formatted.get(open_end..close_start) else {
                    continue;
                };
                // Require directly adjacent content (shouldHugStart && shouldHugEnd).
                if content.is_empty()
                    || content.starts_with([' ', '\t', '\r', '\n'])
                    || content.ends_with([' ', '\t', '\r', '\n'])
                    || content.contains('\n')
                {
                    continue;
                }
                // Compute actual column of this element.
                let line_start_of_elem = formatted[..e_start].rfind('\n').map_or(0, |i| i + 1);
                let col_in_fmt = e_start - line_start_of_elem;
                let actual_col = prefix_col + col_in_fmt;
                let elem_len = e_end - e_start; // byte length ≈ display width for ASCII
                if actual_col + elem_len <= full_width {
                    continue; // fits — no break needed
                }
                // Build the hug-break replacement.
                // `inner_indent`: the `>` that opens the content sits at
                //   `(block_depth + 1) * iw` spaces (one extra level for the hug).
                // `ws_indent`: the closing `>` of `</tag>` sits at
                //   `block_depth * iw` spaces (back to the element's block level).
                let inner_indent = " ".repeat((block_depth + 1) * iw);
                let ws_indent = " ".repeat(block_depth * iw);
                let Some(open_no_bracket) = formatted.get(e_start..open_end - 1) else {
                    continue;
                };
                let rep =
                    format!("{open_no_bracket}\n{inner_indent}>{content}</{tag}\n{ws_indent}>");
                edits.push((e_start, e_end, rep));
            }
            TemplateNode::IfBlock(blk) => {
                // Consequent body is one level deeper.
                collect_pre_first_line_hug_breaks(
                    formatted,
                    &blk.consequent,
                    prefix_col,
                    full_width,
                    iw,
                    block_depth + 1,
                    edits,
                );
                // Alternate (`{:else}`) is at the same block_depth as the if.
                if let Some(alt) = &blk.alternate {
                    collect_pre_first_line_hug_breaks(
                        formatted,
                        alt,
                        prefix_col,
                        full_width,
                        iw,
                        block_depth,
                        edits,
                    );
                }
            }
            other => {
                // EachBlock, AwaitBlock, KeyBlock, SnippetBlock — recurse with + 1.
                for child in child_fragments(other) {
                    collect_pre_first_line_hug_breaks(
                        formatted,
                        child,
                        prefix_col,
                        full_width,
                        iw,
                        block_depth + 1,
                        edits,
                    );
                }
            }
        }
    }
}

/// Wrap the sole content-tag child of a whitespace-preserving element
/// (`<pre>{expr}</pre>`) when its one-line rendering overflows. Unlike a block
/// element, the tags stay glued to the content (no surrounding newlines — the
/// element preserves whitespace), so only the expression breaks internally with
/// its continuation lines pushed out two levels past the element's indent:
///   <pre>{part.value.name +
///       "\n" +
///       part.value.stack.replace(/^\n+/, "")}</pre>
pub(super) fn try_break_pre_content_tag(
    out: &str,
    start: u32,
    end: u32,
    fragment: &Fragment,
    line_width: usize,
    options: &FormatOptions,
) -> Option<(u32, u32, String)> {
    let tw = tab_width(options);
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
    let column = current_column(out, start, tw);
    if column + open.visual_width(tw) + span.visual_width(tw) + close.visual_width(tw) <= line_width
    {
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
    let cont_cols = indent.visual_width(tw) + iw;
    let inner = span.get(1..span.len() - 1)?.trim(); // strip the `{` … `}`
    // Force the top-level expression to break: the last line carries `}</pre>`,
    // which oxc can't see, so narrow the width by that glued suffix.
    let suffix = 1 + close.visual_width(tw); // `}` + `</tag>`
    let width = line_width.saturating_sub(cont_cols + suffix).max(1);
    let wrapped =
        crate::expression::reformat_content_at_width(inner, options, width, cont_cols).ok()?;
    if !wrapped.contains('\n') {
        return None; // didn't actually break
    }
    let broken = format!("{open}{{{wrapped}}}{close}");
    (broken != whole).then_some((start, end, broken))
}

/// Break a `<textarea>`'s tags around its whitespace-sensitive content the way
/// prettier does: when the content is multiline (or the one-line element
/// overflows), the open tag's `>` drops to its own line one level in iff the
/// content does not start with a newline, and the close tag becomes
/// `</textarea\n{indent}>` iff the content does not end with one — so no
/// formatter-inserted newline ever changes the rendered value. Attributes stay
/// on the open line (unlike `<pre>`, whose attrs break per line and hug `>`).
pub(super) fn try_break_textarea_tags(
    out: &str,
    start: u32,
    end: u32,
    fragment: &Fragment,
    line_width: usize,
    options: &FormatOptions,
) -> Option<(u32, u32, String)> {
    let tw = tab_width(options);
    let (s, e) = (start as usize, end as usize);
    let whole = out.get(s..e)?;
    let (first, last) = (fragment.nodes.first()?, fragment.nodes.last()?);
    let (cs, ce) = (node_start(first) as usize, node_end(last) as usize);
    let open = out.get(s..cs)?;
    let close = out.get(ce..e)?;
    let mut content = out.get(cs..ce)?.to_string();
    // Only a still-unbroken element: one-line open tag, one-line close tag.
    if open.contains('\n') || !open.ends_with('>') || close.contains('\n') || !close.ends_with('>')
    {
        return None;
    }
    let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
    let indent = out.get(line_start..s)?;
    if !indent.bytes().all(|b| b == b' ' || b == b'\t') {
        return None;
    }
    if !content.contains('\n') {
        let column = current_column(out, start, tw);
        if column + whole.visual_width(tw) <= line_width {
            return None;
        }
        // A sole overflowing expression child breaks internally as well.
        if let Some((_, _, rewritten)) =
            try_break_pre_content_tag(out, start, end, fragment, line_width, options)
        {
            content = rewritten
                .get(open.len()..rewritten.len() - close.len())?
                .to_string();
        }
    }
    // prettier borrows the parent's `>` only when the first child is
    // leading-space-sensitive AND has no leading spaces at all
    // (`needsToBorrowParentOpeningTagEndMarker`), and the closing tag's `<`
    // only when the last child has no trailing spaces — ANY whitespace, not
    // just a newline, keeps that tag glued.
    let open_break = !content.starts_with(super::is_html_ws);
    let close_break = !content.ends_with(super::is_html_ws);
    if !open_break && !close_break {
        return None;
    }
    let (unit, _) = indent_config(options);
    let mut result = String::new();
    if open_break {
        result.push_str(&open[..open.len() - 1]);
        result.push('\n');
        result.push_str(indent);
        result.push_str(&unit);
        result.push('>');
    } else {
        result.push_str(open);
    }
    result.push_str(&content);
    if close_break {
        result.push_str(&close[..close.len() - 1]);
        result.push('\n');
        result.push_str(indent);
        result.push('>');
    } else {
        result.push_str(close);
    }
    (result != whole).then_some((crate::source_offset(s), crate::source_offset(e), result))
}

/// Break a `<pre>` (or `<textarea>`) element's own open-tag attributes when the
/// whole element is on one line but overflows `line_width`.
///
/// Example: `<pre class="language-svelte !-mt-2 mb-0">{processedCode}</pre>` at
/// column 10 (85 chars total) →
/// ```text
///   <pre
///     class="language-svelte !-mt-2 mb-0">{processedCode}</pre>
/// ```
///
/// This covers the case where the open tag alone fits but `open + content +
/// close` overflows, and the content expression is too simple to break (so
/// `try_break_pre_content_tag` returns None).
pub(super) fn try_break_pre_own_attrs(
    out: &str,
    start: u32,
    end: u32,
    fragment: &Fragment,
    line_width: usize,
    options: &FormatOptions,
) -> Option<(u32, u32, String)> {
    let tw = tab_width(options);
    let (s, e) = (start as usize, end as usize);
    let whole = out.get(s..e)?;
    // Only single-line elements.
    if whole.contains('\n') {
        return None;
    }
    // Only elements that overflow.
    let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
    let indent = out.get(line_start..s)?;
    if !indent.bytes().all(|b| b == b' ' || b == b'\t') {
        return None;
    }
    let column = indent.visual_width(tw);
    if column + whole.visual_width(tw) <= line_width {
        return None;
    }
    // Prefer breaking a child element's open tag over the `<pre>`'s own attrs:
    // prettier keeps `<pre class="…">` glued and dangles the inner `<code
    // class="…">`'s `>` (handled by case 3). Defer whenever a direct child
    // element has a single-line open tag with attributes to break.
    let has_breakable_child = fragment.nodes.iter().any(|n| {
        let (cs, cfrag) = match n {
            TemplateNode::RegularElement(el) => (el.start as usize, &el.fragment),
            TemplateNode::Component(c) => (c.start as usize, &c.fragment),
            _ => return false,
        };
        let Some(child_open_end) = cfrag.nodes.first().map(|f| node_start(f) as usize) else {
            return false;
        };
        out.get(cs..child_open_end)
            .is_some_and(|open| !open.contains('\n') && open.contains(' ') && open.ends_with('>'))
    });
    if has_breakable_child {
        return None;
    }
    // Find the open tag end (position right after `>` of the opening tag).
    let open_end = node_start(fragment.nodes.first()?) as usize;
    let open = out.get(s..open_end)?;
    // Must be a single-line open tag with at least one attribute.
    if open.contains('\n') || !open.contains(' ') || !open.ends_with('>') {
        return None;
    }
    // Parse: `<tagname attr1 attr2 ...>`
    let inner = open.get(1..open.len() - 1)?; // strip `<` and `>`
    let sp = inner.find(' ')?;
    let tag_name = &inner[..sp];
    let attrs_str = inner[sp + 1..].trim();
    let attrs = split_open_tag_attrs(attrs_str);
    if attrs.is_empty() {
        return None;
    }
    let iw = options.js.indent_width.value() as usize;
    let inner_indent = " ".repeat(column + iw);
    let mut new_open = format!("<{tag_name}");
    for attr in &attrs {
        new_open.push('\n');
        new_open.push_str(&inner_indent);
        new_open.push_str(attr);
    }
    // `<pre>` always hugs: `>` stays on the last attribute line.
    new_open.push('>');
    let rest = out.get(open_end..e)?;
    let result = format!("{new_open}{rest}");
    (result != whole).then_some((crate::source_offset(s), crate::source_offset(e), result))
}

/// Fix the `>` placement for direct children of a `<pre>` inner-content
/// fragment that was re-formatted via [`reformat_pre_inner`].  Only applies
/// Sub-case B (hug `>` to last attribute line): elements whose open tags are
/// multi-line and end with `\n{spaces}>` should have `>` moved to hug the
/// last attr, matching prettier's `isPreTagContent` behavior. Sub-case A
/// (overflow-breaking) is deliberately omitted here — the content is already
/// at a narrowed width and the outer re-indent will handle real column layout.
pub(super) fn fix_pre_child_hug_only(out: &str, fragment: &Fragment) -> Vec<(u32, u32, String)> {
    let mut edits = Vec::new();
    for node in &fragment.nodes {
        let (child_start, child_end, child_fragment) = match node {
            TemplateNode::RegularElement(e) => (e.start, e.end, &e.fragment),
            TemplateNode::Component(c) => (c.start, c.end, &c.fragment),
            _ => continue,
        };
        let cs = child_start as usize;
        let ce = child_end as usize;
        let Some(whole) = out.get(cs..ce) else {
            continue;
        };
        // Only act on multi-line open tags.
        let Some(first_child_node) = child_fragment.nodes.first() else {
            continue;
        };
        let open_end = node_start(first_child_node) as usize;
        let Some(open) = out.get(cs..open_end) else {
            continue;
        };
        if !open.contains('\n') {
            continue;
        }
        // Strip trailing whitespace to find the actual `>` of the open tag.
        let open_tag_only = open.trim_end_matches(|c: char| c.is_ascii_whitespace());
        if !open_tag_only.ends_with('>') {
            continue;
        }
        let Some(last_nl) = open_tag_only.rfind('\n') else {
            continue;
        };
        let after_last_nl = &open_tag_only[last_nl + 1..];
        // The line immediately before `>` must consist only of spaces (the
        // non-hug `>` placement). `open_tag_only` ends with `>`, so strip it.
        let Some(before_gt) = after_last_nl.strip_suffix('>') else {
            continue;
        };
        if !before_gt.bytes().all(|b| b == b' ') {
            continue;
        }
        // Move `>` to hug the last attribute line, preserving any element-direct
        // whitespace (tabs/newline) between `>` and the first child.
        //
        // `trailing_ws` is the whitespace between the close `>` of the open tag and
        // the first child's content start.  When the first child IS a whitespace-only
        // Text node (e.g. "\n  " between `>` and the first element child), that node
        // contributes no visible content of its own — include it in `trailing_ws` so
        // the rewrite can still hug the `>` to the last attribute.
        // `content_start` is where the actual content (after trailing_ws) begins.
        let (trailing_ws, content_start) = if open_tag_only.len() == open.len()
            && let TemplateNode::Text(t) = first_child_node
            && t.data.split_whitespace().next().is_none()
        {
            // First child is a whitespace-only Text node right after `>`. Include it.
            let text_end = t.end as usize;
            (out.get(open_end..text_end).unwrap_or(""), text_end)
        } else {
            (&open[open_tag_only.len()..], open_end)
        };
        // If trailing_ws is still empty (content starts inline immediately after `>`),
        // the element is already correctly hugged — skip.
        if trailing_ws.is_empty() {
            continue;
        }
        let new_open = format!("{}>", &open_tag_only[..last_nl]);
        let result = format!("{new_open}{trailing_ws}{}", &out[content_start..ce]);
        if result != whole {
            edits.push((child_start, child_end, result));
        }
    }
    edits
}

/// Fix open-tag `>` placement for direct child elements of `<pre>` (or
/// `<textarea>`).  Two sub-cases:
///
/// **A — one-liner overflows**: `<code id="x">long content` → insert
/// `\n{gt_indent}` before the `>` of the open tag:
/// ```text
///     <pre><code id="x"
///             >long content
/// ```
///
/// **B — multi-line attrs, non-hug `>`**: the markup formatter placed `>` on
/// its own line (the default for non-block elements whose content starts with
/// whitespace). Inside `<pre>` that is wrong — a newline before the content
/// would inject significant whitespace. Convert to hug form:
/// ```text
///     <pre><code
///         id="x"
///         class="y">raw content
/// ```
pub(super) fn try_fix_pre_child_open_tags(
    out: &str,
    pre_start: u32,
    fragment: &Fragment,
    line_width: usize,
    options: &FormatOptions,
    // `(open_end, column)` of a `<pre>` open tag another edit in this pass is
    // wrapping: a child on that line is measured from `column`, not from the
    // flat open tag still in `out`.
    wrapped_open: Option<(usize, usize)>,
) -> Vec<(u32, u32, String)> {
    let tw = tab_width(options);
    let mut edits = Vec::new();
    // Determine the `<pre>` element's leading indent column.
    let pre_s = pre_start as usize;
    let pre_line_start = out[..pre_s].rfind('\n').map_or(0, |i| i + 1);
    let pre_leading = &out[pre_line_start..pre_s];
    let pre_indent_col = if pre_leading.bytes().all(|b| b == b' ' || b == b'\t') {
        pre_leading.visual_width(tw)
    } else {
        // `<pre>` does not start at the beginning of its line (e.g. it directly
        // follows another element). Use its actual column.
        current_column(out, pre_start, tw)
    };
    let iw = options.js.indent_width.value() as usize;

    for node in &fragment.nodes {
        // Handle both RegularElement and Component — both can appear as direct
        // children of `<pre>` and need the same open-tag `>` placement fix.
        let (child_start, child_end, child_fragment, child_name) = match node {
            TemplateNode::RegularElement(e) => (e.start, e.end, &e.fragment, e.name.as_str()),
            TemplateNode::Component(c) => (c.start, c.end, &c.fragment, c.name.as_str()),
            _ => continue,
        };
        let cs = child_start as usize;
        let ce = child_end as usize;
        let Some(whole) = out.get(cs..ce) else {
            continue;
        };
        let line_start = out[..cs].rfind('\n').map_or(0, |i| i + 1);
        // Width of the line from its start through `to`, read past a `<pre>`
        // open tag that is being wrapped in this same pass.
        let line_cols = |to: usize| match wrapped_open {
            Some((pre_open_end, column)) if line_start < pre_open_end => {
                column + out[pre_open_end..to].visual_width(tw)
            }
            _ => out[line_start..to].visual_width(tw),
        };
        // Sub-case C: a self-closing child (`<Highlight {value} />`) whose line
        // overflows breaks its attributes one per line, ` />` dedented one level,
        // like any wrapped self-closing tag.
        if child_fragment.nodes.is_empty() {
            if !whole.contains('\n')
                && did_self_close(out, child_end)
                && let Some(inner) = whole.strip_prefix('<').and_then(|w| w.strip_suffix("/>"))
                && let Some(sp) = inner.find(' ')
            {
                let line_nl = out[ce..].find('\n').map_or(out.len(), |i| ce + i);
                if line_cols(line_nl) <= line_width {
                    continue;
                }
                let attrs = split_open_tag_attrs(inner[sp + 1..].trim());
                if attrs.is_empty() {
                    continue;
                }
                let attr_indent = " ".repeat(pre_indent_col + 2 * iw);
                let mut result = format!("<{}", &inner[..sp]);
                for attr in attrs {
                    result.push('\n');
                    result.push_str(&attr_indent);
                    result.push_str(attr);
                }
                result.push('\n');
                result.push_str(&" ".repeat(pre_indent_col + iw));
                result.push_str("/>");
                if result != whole {
                    edits.push((child_start, child_end, result));
                }
            }
            continue;
        }
        // Find where the child's open tag ends (position right after `>`).
        let open_end = node_start(&child_fragment.nodes[0]) as usize;
        let Some(open) = out.get(cs..open_end) else {
            continue;
        };

        // Sub-case A: single-line open tag whose line overflows.
        // The child element may have newlines in its content (text with `\n`,
        // a closing `</code>` on its own line, etc.) — we only need the OPEN
        // TAG to be a single line, and that line to overflow.
        if !open.contains('\n') {
            if !open.ends_with('>') {
                continue;
            }
            // Measure the full line (from start through the first `\n` after
            // the open-tag `>`, i.e. including the content that follows `>`).
            let line_nl = out[open_end..]
                .find('\n')
                .map_or(out.len(), |i| open_end + i);
            // Prettier dangles a `<pre>` child's open `>` when the child spans
            // multiple lines (its content has a newline) OR the glued open-tag
            // line overflows — a short single-line child (`<code class="x">y</code>`)
            // stays glued.
            let content = out.get(open_end..ce).unwrap_or("");
            let content_multiline = content.contains('\n');
            if line_cols(line_nl) <= line_width && !content_multiline {
                continue; // fits on one line and single-line content — no action
            }
            // An attribute-free open tag only breaks because its first child
            // borrows the `>`, which needs an inline tag whose content is
            // leading-whitespace-sensitive.
            if !open.contains(' ')
                && (is_block_display(child_name) || content.starts_with([' ', '\t', '\r', '\n']))
            {
                continue;
            }
            // Drop `>` to a new indented line.  The indent sits two levels
            // deeper than `<pre>`'s own indent (one for the child element, one
            // for the inner "attr" indent) so it aligns under the child's attrs
            // in the standard multi-line open-tag shape.
            let gt_indent = " ".repeat(pre_indent_col + 2 * iw);
            // When the open tag is broken onto its own line, prettier's
            // `shouldHugEnd` also dangles the close `>` onto its own line
            // (`</code\n{indent}>`) whenever the last content char is
            // whitespace-sensitive text touching the close tag — one indent
            // level shallower than the open `>` (mirroring `push_close_tag`).
            let content_and_close = &out[open_end..ce];
            let tail = dangle_pre_child_close(content_and_close, child_name, pre_indent_col + iw);
            let result = format!(
                "{}\n{}>{}",
                &out[cs..open_end - 1],
                gt_indent,
                tail.as_deref().unwrap_or(content_and_close),
            );
            if result != whole {
                edits.push((child_start, child_end, result));
            }
        }
        // Sub-case B: multi-line open tag with `>` dropped to its own line.
        else if open.contains('\n') {
            // `open` runs from the child's start up to the first child's AST
            // start, so it may include whitespace / tabs that follow the `>`
            // (element-direct whitespace before the first child node). Strip
            // trailing whitespace to find where the actual `>` is.
            let open_tag_only = open.trim_end_matches(|c: char| c.is_ascii_whitespace());
            // The open tag (stripped) must end with `\n{spaces}>` (non-hug form).
            if open_tag_only.ends_with('>')
                && let Some(last_nl) = open_tag_only.rfind('\n')
            {
                let after_last_nl = &open_tag_only[last_nl + 1..];
                // The line before `>` must consist entirely of spaces (the
                // indent for the non-hug `>` placement). `open_tag_only` ends
                // with `>` (guarded above), so strip it.
                // Re-hug the `>` to the last attribute only when the attributes
                // themselves are broken across lines (the `<code` opener is alone
                // on the first line). When the attrs all sit on the opener line and
                // only the `>` was dropped (`<code class="…"\n    >`), prettier keeps
                // the `>` dangling — the short-open, multi-line-content shape — so
                // leave it alone.
                let attrs_multiline = open_tag_only[..last_nl].contains('\n');
                if attrs_multiline
                    && after_last_nl
                        .strip_suffix('>')
                        .is_some_and(|s| s.bytes().all(|b| b == b' '))
                {
                    // Move `>` to hug the last attribute line (remove the
                    // `\n{spaces}` before `>`). Keep the whitespace between
                    // `>` and the first child intact (it's element-direct
                    // whitespace, e.g. tabs).
                    let trailing_ws = &open[open_tag_only.len()..];
                    let new_open = format!("{}>", &open_tag_only[..last_nl]);
                    let result = format!("{new_open}{trailing_ws}{}", &out[open_end..ce]);
                    if result != whole {
                        edits.push((child_start, child_end, result));
                    }
                }
            }
        }
    }
    edits
}

/// When a `<pre>`/`<textarea>` child element's open tag has been broken onto
/// its own line, prettier's `shouldHugEnd` dangles the close `>` onto its own
/// line too — but only when the last content char is whitespace-sensitive text
/// touching the close tag (non-whitespace, and not the `>` of a nested child
/// close tag), matching [`crate::markup`]'s `hug_close`. `content_and_close` is
/// the child's content followed by its `</name>` close tag; returns the rewritten
/// span with `</name>` replaced by `</name\n{close_indent spaces}>`, or `None`
/// when the shape doesn't qualify.
pub(super) fn dangle_pre_child_close(
    content_and_close: &str,
    tag_name: &str,
    close_indent: usize,
) -> Option<String> {
    let close_lit = format!("</{tag_name}>");
    let content = content_and_close.strip_suffix(&close_lit)?;
    let last = content.chars().next_back()?;
    if last.is_ascii_whitespace() || last == '>' {
        return None;
    }
    Some(format!(
        "{content}</{tag_name}\n{}>",
        " ".repeat(close_indent)
    ))
}
