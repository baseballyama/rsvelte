use super::*;

/// Recursively visit every expression mustache and member-chain-break any that
/// sits on an overflowing line (see [`try_break_inline_content_tag`]).
pub(super) fn collect_content_tag_breaks(
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

/// Pass 1.8: break block-display elements that land at a non-ws `>` prefix.
///
/// When pass 1 hugs a Component (`<Component\n  ><div>…</div></Component\n>`),
/// the `<div>` is placed immediately after the hugged `>` — its "indent" is
/// `  >` (non-whitespace).  `try_break_block_overflow` normally requires a
/// pure-whitespace indent, so pass 1 can't handle this.  This targeted pass
/// extracts the whitespace portion (`  `) from the `  >` prefix and applies
/// the block-break logic manually.
pub(super) fn collect_break_block_non_ws_prefix(
    out: &str,
    fragment: &Fragment,
    line_width: usize,
    tw: usize,
    edits: &mut Vec<(u32, u32, String)>,
) {
    for (node_idx, node) in fragment.nodes.iter().enumerate() {
        // A `<!-- prettier-ignore -->`d node and its whole subtree stay verbatim.
        if crate::prettier_ignore::preceded_by_prettier_ignore(&fragment.nodes, node_idx) {
            continue;
        }
        match node {
            TemplateNode::RegularElement(e) => {
                if is_whitespace_preserving(e.name.as_str()) {
                    continue;
                }
                let s = e.start as usize;
                let end = e.end as usize;
                let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
                let indent = out.get(line_start..s).unwrap_or("");
                let non_ws = !indent.bytes().all(|b| b == b' ' || b == b'\t');
                let is_simple_gt_prefix = non_ws && indent.trim_start_matches([' ', '\t']) == ">";
                if is_simple_gt_prefix && is_block_display(e.name.as_str()) {
                    // Extract the whitespace-only portion of the prefix.
                    let ws_indent: &str = {
                        let trim_pos = indent.rfind([' ', '\t']).map_or(0, |i| i + 1);
                        &indent[..trim_pos]
                    };
                    // Only act when the whole element is on one line and overflows.
                    let whole = out.get(s..end).unwrap_or("");
                    let column = indent.visual_width(tw) + 1; // +1 for the `>` char
                    if !whole.contains('\n') && column + whole.visual_width(tw) > line_width {
                        // Find first and last non-whitespace children.
                        if let (Some(first_child), Some(last_child)) = (
                            e.fragment.nodes.iter().find(
                                |n| !matches!(n, TemplateNode::Text(t) if crate::is_blank_text(t.data.as_ref())),
                            ),
                            e.fragment.nodes.iter().rfind(
                                |n| !matches!(n, TemplateNode::Text(t) if crate::is_blank_text(t.data.as_ref())),
                            ),
                        ) {
                            let first_start = node_start(first_child) as usize;
                            let last_end = node_end(last_child) as usize;
                            let open = out.get(s..first_start).unwrap_or("");
                            let close = out.get(last_end..end).unwrap_or("");
                            let content = out.get(first_start..last_end).unwrap_or("");
                            if open.ends_with('>') && !content.is_empty() {
                                let inner_indent = format!("{ws_indent}  ");
                                let broken =
                                    format!("{open}\n{inner_indent}{content}\n{ws_indent}{close}");
                                if broken != whole {
                                    edits.push((e.start, e.end, broken));
                                    continue; // edit owns this element
                                }
                            }
                        }
                    }
                }
                collect_break_block_non_ws_prefix(out, &e.fragment, line_width, tw, edits);
            }
            _ => {
                for child in child_fragments(node) {
                    collect_break_block_non_ws_prefix(out, child, line_width, tw, edits);
                }
            }
        }
    }
}

/// Break the member chain / binary of an inline expression mustache that sits on
/// an overflowing line, in place. Used for a mustache glued into a hugged inline
/// element's mixed body (`<td\n  >\u{a}\u{emoji.charCodeAt(1).toString(16)}</td`)
/// where the open tag already broke but the long trailing expression kept its
/// chain on one line. Reformats just the `{…}` span, leaving the surrounding
/// text/expressions untouched.
pub(super) fn try_break_inline_content_tag(
    out: &str,
    node: &TemplateNode,
    line_width: usize,
    options: &FormatOptions,
) -> Option<(u32, u32, String)> {
    let tw = tab_width(options);
    let es = node_start(node) as usize;
    let ee = node_end(node) as usize;
    let span = out.get(es..ee)?; // `{expr}`
    if !span.starts_with('{') || !span.ends_with('}') || span.contains('\n') || span.len() <= 2 {
        return None;
    }
    let line_start = out[..es].rfind('\n').map_or(0, |i| i + 1);
    let line_end = out[ee..].find('\n').map_or(out.len(), |i| ee + i);
    let line = out.get(line_start..line_end)?;
    if line.visual_width(tw) <= line_width {
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
    // If the rightmost `{…}` is followed by a space (indicating prose fill words
    // continue on the same line), this expression is in a fill run that the fill
    // algorithm already broke at the word boundary. Breaking the expression here
    // would split it unnecessarily. Leave it for the fill.
    // Note: a suffix glued directly to the `}` (like `px)` in `{getPixels(...)}px)`)
    // is NOT a fill-run word separator — it's a unit suffix, so we still break it.
    if out
        .get(ee..line_end)
        .is_some_and(|rest| rest.starts_with(' ') || rest.starts_with('\t'))
    {
        return None;
    }
    let _start_col = current_column(out, es as u32, tw);
    // Continuation lands at the line's own indent + one level.
    let indent = &out[line_start..es];
    let lead_ws: String = indent.chars().take_while(|c| c.is_whitespace()).collect();
    let cont_cols = lead_ws.visual_width(tw);
    let inner = span.get(1..span.len() - 1)?.trim();
    // Force OXC to break the expression at the MINIMUM narrowing: use
    // `width = single_line_len - 1` (one char narrower than the flat form).
    // This forces exactly the outermost break (e.g. a call expression breaks its
    // argument list) while giving inner content the widest possible budget —
    // avoiding deep over-breaking when the expression is inside a long line.
    // Previously we computed `width = line_width - inner_start_col - 1 - trailing`,
    // which used the expression's column in the file. For a mustache that sits
    // deep on the line (e.g. at column 65 in an 80-col file), this gave a width
    // as small as 13, causing `df.format(date.end.toDate(getLocalTimeZone()))`
    // to break all the way down to `toDate(\n  getLocalTimeZone(),\n)` instead
    // of the expected `df.format(\n  date.end.toDate(getLocalTimeZone()),\n)`.
    let single_line_len = inner.visual_width(tw);
    let width = single_line_len.saturating_sub(1).max(1);
    let wrapped =
        crate::expression::reformat_content_at_width(inner, options, width, cont_cols).ok()?;
    if !wrapped.contains('\n') {
        return None; // didn't break — leave it
    }
    let broken = format!("{{{wrapped}}}");
    (broken != span).then_some((es as u32, ee as u32, broken))
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
pub(super) fn try_break_content_tag_block(
    out: &str,
    tag: &str,
    start: u32,
    end: u32,
    fragment: &Fragment,
    line_width: usize,
    options: &FormatOptions,
) -> Option<(u32, u32, String)> {
    let tw = tab_width(options);
    if !is_block_display(tag) {
        return None;
    }
    // Exactly one non-whitespace child, and it must be a content tag.
    let mut child: Option<&TemplateNode> = None;
    for n in &fragment.nodes {
        if matches!(n, TemplateNode::Text(t) if crate::is_blank_text(t.data.as_ref())) {
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
    if span.contains('\n') || span.len() <= kw_lead + kw_trail {
        return None;
    }

    // When the open tag is multi-line (attributes wrapped), the content tag
    // should break to its own indented line — prettier puts `>` on its own
    // line at the element's indent level, then the content at child indent,
    // then the close tag at the element's indent. This handles:
    //   <p
    //     transition:foo
    //   >{thing}</p>  →  <p\n    transition:foo\n  >\n    {thing}\n  </p>
    if open.contains('\n') {
        if !open.ends_with('>') {
            return None;
        }
        // Determine the element's indent by finding the line start of `start`.
        let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
        let indent = out.get(line_start..s)?;
        if !indent.bytes().all(|b| b == b' ' || b == b'\t') {
            return None;
        }
        let inner_indent = format!("{indent}  ");
        // The last line of `open` ends with `>`, e.g. `    >`.
        // When the `>` is already on its own line (the last line of `open` is
        // purely whitespace + `>`), prettier's block-element behaviour always
        // breaks the content onto its own indented line rather than gluing it to
        // the `>` — matching how prettier formats `<p\n  attr\n>{expr}</p>`.
        // Only skip breaking when the `>` is glued to the last attribute (hug_open
        // form), where the last line contains more than just `>`.
        let open_last_line = open.rsplit('\n').next().unwrap_or(open);
        let gt_on_own_line = open_last_line.trim_start_matches([' ', '\t']) == ">";
        if !gt_on_own_line {
            let glued_width =
                open_last_line.visual_width(tw) + span.visual_width(tw) + close.visual_width(tw);
            if glued_width <= line_width {
                return None; // fits on the attr+`>` line — leave as-is
            }
        }
        // Break: remove the trailing `>` from the open, put `>` on a new line,
        // then the content, then close.
        // Use `trim_end()` (not just spaces/tabs) so that the trailing `\n    `
        // before the `>` is also removed — otherwise the format string's `\n`
        // prefix would produce a double-newline (blank line) between the last
        // attribute and the `>`.
        let open_without_gt = open[..open.len() - 1].trim_end();
        let inner = span.get(kw_lead..span.len() - kw_trail)?.trim();
        let width = line_width.saturating_sub(inner_indent.visual_width(tw) + kw_lead + kw_trail);
        let wrapped = crate::expression::reformat_content_at_width(
            inner,
            options,
            width,
            inner_indent.visual_width(tw),
        )
        .ok()?;
        let kw_prefix = &span[..kw_lead];
        let new_tag = format!("{kw_prefix}{wrapped}}}");
        let broken =
            format!("{open_without_gt}\n{indent}>\n{inner_indent}{new_tag}\n{indent}{close}");
        return (broken != whole).then_some((start, end, broken));
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
    let inner_indent = format!("{indent}  ");

    let inner = span.get(kw_lead..span.len() - kw_trail)?.trim();
    let width = line_width.saturating_sub(inner_indent.visual_width(tw) + kw_lead + kw_trail);
    let wrapped = crate::expression::reformat_content_at_width(
        inner,
        options,
        width,
        inner_indent.visual_width(tw),
    )
    .ok()?;
    let kw_prefix = &span[..kw_lead]; // `{@html ` / `{`
    let new_tag = format!("{kw_prefix}{wrapped}}}");
    let broken = format!("{open}\n{inner_indent}{new_tag}\n{indent}{close}");
    (broken != whole).then_some((start, end, broken))
}

/// Break a block-display element whose ENTIRE content (any combination of
/// expression tags, text, block nodes) is currently inline (the span has no
/// newline) but the whole line overflows 80 cols.
///
/// prettier-plugin-svelte's fill/group layout always breaks a block element's
/// content to its own indented line when the one-line form overflows:
///
///   <p>{_0}{_1}…{_40}</p>  →  <p>\n    {_0}{_1}…{_40}\n  </p>
///   <div>{#each …}{/each}</div>  →  <div>\n  {#each …}{/each}\n</div>
///
/// This is the last-resort break: only fires when `try_collapse`, `try_fill_mixed`,
/// `try_hug_mixed`, and `try_break_content_tag_block` all declined.
pub(super) fn try_break_block_overflow(
    out: &str,
    tag: &str,
    start: u32,
    end: u32,
    fragment: &Fragment,
    line_width: usize,
    tw: usize,
) -> Option<(u32, u32, String)> {
    if !is_block_display(tag) {
        return None;
    }

    let (s, e) = (start as usize, end as usize);
    let whole = out.get(s..e)?;

    // Only act on elements that are currently all inline.
    if whole.contains('\n') {
        return None;
    }

    // prettier-plugin-svelte's `forceBreakContent`: a block-display element whose
    // fragment contains any control-flow block child (IfBlock, EachBlock, AwaitBlock,
    // KeyBlock, SnippetBlock) ALWAYS breaks its content onto a new indented line —
    // even when the whole element fits in 80 columns. This mirrors prettier's
    // `breakParent` / `forceBreakContent` mechanism where Svelte flow-control
    // blocks generate `hardline` separators that force the enclosing group to break.
    let has_flow_block_child = fragment.nodes.iter().any(|n| {
        matches!(
            n,
            TemplateNode::IfBlock(_)
                | TemplateNode::EachBlock(_)
                | TemplateNode::AwaitBlock(_)
                | TemplateNode::KeyBlock(_)
                | TemplateNode::SnippetBlock(_)
        )
    });

    if !has_flow_block_child {
        // Must overflow.
        let column = current_column(out, start, tw);
        if column + whole.visual_width(tw) <= line_width {
            return None;
        }
    }

    // Need at least one non-whitespace child.
    let first_child = fragment
        .nodes
        .iter()
        .find(|n| !matches!(n, TemplateNode::Text(t) if crate::is_blank_text(t.data.as_ref())))?;
    let last_child = fragment
        .nodes
        .iter()
        .rfind(|n| !matches!(n, TemplateNode::Text(t) if crate::is_blank_text(t.data.as_ref())))?;

    let first_start = node_start(first_child) as usize;
    let last_end = node_end(last_child) as usize;

    // open tag = element start up to first meaningful child.
    let open = out.get(s..first_start)?;
    // close tag = last meaningful child end to element end.
    let close = out.get(last_end..e)?;
    // content = everything from first to last meaningful child (inclusive).
    let content = out.get(first_start..last_end)?;

    if open.is_empty() || close.is_empty() || content.is_empty() {
        return None;
    }
    // The open tag must end with `>` (no multi-line open).
    if !open.ends_with('>') {
        return None;
    }
    // Content must be fully inline (no newlines).
    if content.contains('\n') {
        return None;
    }

    // Derive element indent from the text before `start` on the same line.
    let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
    let indent = out.get(line_start..s)?;
    if !indent.bytes().all(|b| b == b' ' || b == b'\t') {
        return None;
    }
    let inner_indent = format!("{indent}  ");

    let broken = format!("{open}\n{inner_indent}{content}\n{indent}{close}");
    (broken != whole).then_some((start, end, broken))
}

/// Break a block-display element whose content is multi-line but the content
/// is still "glued" to the open and/or close tag (i.e., no newline immediately
/// after `>` or before `</tag>`). This happens when an ExpressionTag or child
/// element had its content reformatted to span multiple lines AFTER the indent
/// pass already ran — so the element's outer `>content</tag>` boundary was
/// never re-laid out.
///
/// Example:
///   `<p>{x1 +\n    x2 + ... x32}</p>`
/// becomes:
///   `<p>\n  {x1 +\n    x2 + ... x32}\n</p>`
///
/// Only fires when:
/// - The element is block-display.
/// - The whole element is multi-line.
/// - The open tag is single-line (no newline before `>`).
/// - The content starts on the same line as `>` (no `\n` right after `>`).
/// - The close tag is on the same line as the last content character.
pub(super) fn try_break_block_multiline_content(
    out: &str,
    tag: &str,
    start: u32,
    end: u32,
    fragment: &Fragment,
) -> Option<(u32, u32, String)> {
    if !is_block_display(tag) {
        return None;
    }

    let (s, e) = (start as usize, end as usize);
    let whole = out.get(s..e)?;

    // Only act on elements that already have newlines (multi-line content).
    if !whole.contains('\n') {
        return None;
    }

    // Need at least one non-whitespace child.
    let first_child = fragment
        .nodes
        .iter()
        .find(|n| !matches!(n, TemplateNode::Text(t) if crate::is_blank_text(t.data.as_ref())))?;
    let last_child = fragment
        .nodes
        .iter()
        .rfind(|n| !matches!(n, TemplateNode::Text(t) if crate::is_blank_text(t.data.as_ref())))?;

    let first_start = node_start(first_child) as usize;
    let last_end = node_end(last_child) as usize;

    // open tag = element start up to first meaningful child.
    let open = out.get(s..first_start)?;
    // close tag = last meaningful child end to element end.
    let close = out.get(last_end..e)?;
    // content = everything from first to last meaningful child (inclusive).
    let content = out.get(first_start..last_end)?;

    if open.is_empty() || close.is_empty() || content.is_empty() {
        return None;
    }
    // Open tag must end with `>`.
    if !open.ends_with('>') {
        return None;
    }

    let open_multiline = open.contains('\n');

    if open_multiline {
        // Multi-line open tag (attributes wrapped): the content must be
        // single-line and must start immediately after the `>` (no newline).
        // If content is already on its own line, nothing to do.
        if content.contains('\n') {
            return None;
        }
        // Content must start on the same line as `>`.
        if out.as_bytes().get(first_start) == Some(&b'\n') {
            return None;
        }
        // Close tag must start on the same line as the last content char.
        if out.as_bytes().get(last_end) == Some(&b'\n') {
            return None;
        }

        // Derive indent from the last line of the open tag (the `>` line).
        let last_nl = open.rfind('\n').unwrap();
        let last_open_line = &open[last_nl + 1..]; // e.g. "    >"
        let ws_len = last_open_line
            .len()
            .saturating_sub(last_open_line.trim_start().len());
        let indent = &last_open_line[..ws_len];
        if !indent.bytes().all(|b| b == b' ' || b == b'\t') {
            return None;
        }
        let inner_indent = format!("{indent}  ");

        let broken = format!("{open}\n{inner_indent}{content}\n{indent}{close}");
        return (broken != whole).then_some((start, end, broken));
    }

    // Single-line open tag path.
    // Content must be multi-line (otherwise try_break_block_overflow handles it).
    if !content.contains('\n') {
        return None;
    }
    // The content must start on the SAME line as `>` (otherwise it's already broken).
    // Check: the char immediately after `>` is NOT a newline.
    if out.as_bytes().get(first_start) == Some(&b'\n') {
        return None;
    }
    // The close tag must start on the SAME line as the last content char.
    if out.as_bytes().get(last_end) == Some(&b'\n') {
        return None;
    }

    // Derive element indent from the text before `start` on the same line.
    let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
    let indent = out.get(line_start..s)?;
    if !indent.bytes().all(|b| b == b' ' || b == b'\t') {
        return None;
    }
    let inner_indent = format!("{indent}  ");

    let broken = format!("{open}\n{inner_indent}{content}\n{indent}{close}");
    (broken != whole).then_some((start, end, broken))
}

/// Strip trailing whitespace from a `<slot>` element's inline content.
/// prettier-plugin-svelte trims trailing edge whitespace for component-like elements:
///   `<slot><!-- placeholder--> </slot>` → `<slot><!-- placeholder--></slot>`
///   `<slot><!-- note--> foobar </slot>` → `<slot><!-- note--> foobar</slot>`
pub(super) fn try_strip_trailing_slot_space(
    out: &str,
    start: u32,
    end: u32,
    fragment: &Fragment,
) -> Option<(u32, u32, String)> {
    let (s, e) = (start as usize, end as usize);
    let whole = out.get(s..e)?;
    if whole.contains('\n') {
        return None; // only collapse inline slots
    }
    // The last child must be a Text node (possibly whitespace-only, possibly with content).
    let last = fragment.nodes.last()?;
    let TemplateNode::Text(t) = last else {
        return None;
    };
    if t.data.is_empty() {
        return None;
    }
    // The rendered text in `out` for this node's span.
    let ts = node_start(last) as usize;
    let te = node_end(last) as usize;
    let rendered = out.get(ts..te)?;
    if rendered.is_empty() {
        return None;
    }
    let trimmed = rendered.trim_end();
    // Only act if there actually IS trailing whitespace to remove.
    if trimmed.len() == rendered.len() {
        return None;
    }
    // Build replacement: open..content_before_trailing_ws + trimmed_text + close_tag.
    let close = out.get(te..e)?;
    let replacement = format!("{}{}{}", &out[s..ts], trimmed, close);
    (replacement != whole).then_some((start, end, replacement))
}
