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
    SpreadAttribute, SvelteOptions, TemplateNode,
};
use unicode_width::UnicodeWidthStr;

use crate::error::FormatError;
use crate::expression::{expand_obj_arg_call, format_attribute_value_expression};
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
    for (i, node) in fragment.nodes.iter().enumerate() {
        if crate::prettier_ignore::preceded_by_prettier_ignore(&fragment.nodes, i) {
            continue;
        }
        collect_node_open_tag_edits(source, node, depth, options, edits)?;
    }
    Ok(())
}

/// Format the top-level `<svelte:options …>` open tag. It is hoisted out of the
/// fragment into `root.options`, so the normal fragment walk never sees it —
/// without this its attributes keep their source indentation (tabs) and its
/// attribute-value expressions stay unformatted.
pub(crate) fn collect_options_open_tag_edit(
    source: &str,
    opts: &SvelteOptions,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    if opts.attributes.is_empty() {
        return Ok(());
    }
    let attrs: Vec<Attribute> = opts
        .attributes
        .iter()
        .cloned()
        .map(Attribute::Attribute)
        .collect();
    push_open_tag(
        source,
        opts.start,
        "svelte:options",
        &attrs,
        None,
        0,
        false,
        options,
        edits,
    )?;
    Ok(())
}

/// Whether a fragment has no rendered content — empty or whitespace-only text.
fn is_empty_fragment(fragment: &Fragment) -> bool {
    fragment
        .nodes
        .iter()
        .all(|n| matches!(n, TemplateNode::Text(t) if crate::is_blank_text(t.data.as_str())))
}

/// Emit the open-tag + close-tag rewrite edits for one attribute-bearing
/// element and recurse into its fragment. `this_expression` is the reactive
/// `this={X}` slot carried by `<svelte:component>` / `<svelte:element>`; `None`
/// for every other element.
#[allow(clippy::too_many_arguments)]
fn handle_element(
    source: &str,
    start: u32,
    end: u32,
    name: &str,
    attributes: &[Attribute],
    this_expression: Option<&Expression>,
    fragment: &Fragment,
    depth: usize,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    let is_empty = is_empty_fragment(fragment);
    let wrapped = push_open_tag(
        source,
        start,
        name,
        attributes,
        this_expression,
        depth,
        is_empty,
        options,
        edits,
    )?;
    push_close_tag(source, end, name, wrapped, depth, is_empty, options, edits);
    collect_open_tag_edits(source, fragment, depth + 1, options, edits)?;
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
        TemplateNode::RegularElement(elem) => handle_element(
            source,
            elem.start,
            elem.end,
            elem.name.as_str(),
            &elem.attributes,
            None,
            &elem.fragment,
            depth,
            options,
            edits,
        )?,
        TemplateNode::Component(c) => handle_element(
            source,
            c.start,
            c.end,
            c.name.as_str(),
            &c.attributes,
            None,
            &c.fragment,
            depth,
            options,
            edits,
        )?,
        TemplateNode::TitleElement(t) => handle_element(
            source,
            t.start,
            t.end,
            t.name.as_str(),
            &t.attributes,
            None,
            &t.fragment,
            depth,
            options,
            edits,
        )?,
        TemplateNode::SlotElement(s) => handle_element(
            source,
            s.start,
            s.end,
            s.name.as_str(),
            &s.attributes,
            None,
            &s.fragment,
            depth,
            options,
            edits,
        )?,
        TemplateNode::SvelteHead(s)
        | TemplateNode::SvelteBody(s)
        | TemplateNode::SvelteDocument(s)
        | TemplateNode::SvelteFragment(s)
        | TemplateNode::SvelteBoundary(s)
        | TemplateNode::SvelteOptions(s)
        | TemplateNode::SvelteSelf(s) => handle_element(
            source,
            s.start,
            s.end,
            s.name.as_str(),
            &s.attributes,
            None,
            &s.fragment,
            depth,
            options,
            edits,
        )?,
        // prettier-plugin-svelte always emits `<svelte:window />` as self-closing
        // (even when the source uses the paired `<svelte:window></svelte:window>` form).
        // When empty, delete the close tag too; when non-empty (a compiler error),
        // fall through to the normal paired rendering.
        TemplateNode::SvelteWindow(s) => {
            let empty = is_empty_fragment(&s.fragment);
            if empty {
                push_open_tag(
                    source,
                    s.start,
                    s.name.as_str(),
                    &s.attributes,
                    None,
                    depth,
                    empty,
                    options,
                    edits,
                )?;
                // Delete the close tag (replace it with nothing) so that the
                // self-closing `/>` open tag isn't followed by `</svelte:window>`.
                if let Some((close_start, close_end)) =
                    find_close_tag_span(source, s.end, s.name.as_str())
                {
                    edits.push((close_start, close_end, String::new()));
                }
                collect_open_tag_edits(source, &s.fragment, depth + 1, options, edits)?;
            } else {
                handle_element(
                    source,
                    s.start,
                    s.end,
                    s.name.as_str(),
                    &s.attributes,
                    None,
                    &s.fragment,
                    depth,
                    options,
                    edits,
                )?;
            }
        }
        TemplateNode::SvelteComponent(c) => handle_element(
            source,
            c.start,
            c.end,
            c.name.as_str(),
            &c.attributes,
            Some(&c.expression),
            &c.fragment,
            depth,
            options,
            edits,
        )?,
        TemplateNode::SvelteElement(e) => handle_element(
            source,
            e.start,
            e.end,
            e.name.as_str(),
            &e.attributes,
            Some(&e.tag),
            &e.fragment,
            depth,
            options,
            edits,
        )?,
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
    // Whether the element's fragment has no non-whitespace content.  Used to
    // guard case 4 (implicitly-closed elements with trailing whitespace): we
    // only replace the trailing whitespace with `</tag>` when there IS actual
    // non-whitespace content inside the element.  Empty elements (e.g.
    // `<duiv>\n`) have their whitespace preserved by the collapse pass.
    is_empty: bool,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) {
    // First try to find the close tag using the AST's tag name.  When the
    // source has a mismatched close tag (e.g. `<duiv>…</div>`, a typo in a
    // test fixture), fall back to locating ANY `</…>` that ends at the element
    // boundary and replace it with the correct AST tag name.
    // If neither finds a close tag (element was implicitly closed — e.g. `<duiv>`
    // without any matching `</duiv>` in source), insert a synthetic close tag at
    // `element_end`.  This mirrors the oracle (prettier-plugin-svelte), which
    // always emits a close tag based on the AST element name regardless of what
    // the source contains.
    let span = find_close_tag_span(source, element_end, tag_name)
        .or_else(|| find_any_close_tag_span(source, element_end));
    let Some((start, end)) = span else {
        // No explicit close tag at element_end.  There are three cases:
        //
        // 1. Self-closing element (`<tag />`): `bytes[element_end-1] == '>'`
        //    and `bytes[element_end-2] == '/'`.  No close tag needed.
        // 2. Void element (`<br>`, `<input>`, …): recognised by
        //    `is_void_element`. No close tag needed.
        // 3. An element whose open tag ends with a plain `>` but has no
        //    matching close tag in source — e.g. `<keygen>` (treated as
        //    non-void by the Svelte parser but no `</keygen>` follows).
        //    The oracle (prettier-plugin-svelte) emits a close tag for
        //    these, so we insert one.  Elements that the parser closed
        //    implicitly with trailing content (e.g. `<duiv>\n` where
        //    `bytes[element_end-1] != '>'`) are handled by the indent pass
        //    (`force_break_content` trailing edge) instead.
        let bytes = source.as_bytes();
        let end_idx = element_end as usize;
        let prev = bytes.get(end_idx.wrapping_sub(1)).copied();
        let prev2 = bytes.get(end_idx.wrapping_sub(2)).copied();
        let is_self_closing_slash = prev == Some(b'>') && prev2 == Some(b'/');
        // `is_void_element` covers HTML void elements; also exclude HTML
        // declarations like `<!doctype html>` (tag name starts with `!`).
        let is_void = is_void_element(tag_name) || tag_name.starts_with('!');
        let has_trailing_content = prev != Some(b'>');
        if !is_self_closing_slash && !is_void && !has_trailing_content {
            // Case 3: empty-body element with no close tag (e.g. `<keygen>`).
            // We can't insert at `element_end` because a whitespace Text node
            // at that position would have an indent-normalizer edit
            // `(element_end, element_end+1, "\n")` that conflicts.  Instead,
            // supersede the open-tag edit pushed by `push_open_tag` with a
            // combined `<tag></ tag>` replacement that covers the entire open-
            // tag span.  That replacement's start (`element_end - open_tag_len`)
            // is strictly less than the Text node's start (`element_end`), so
            // the two edits never overlap.
            if let Some(last) = edits.last_mut()
                && last.1 == element_end
            {
                // The last edit is the open-tag replacement `(start, element_end,
                // rendered_open)` — append `</tag>` to its replacement text.
                use std::fmt::Write as _;
                let _ = write!(last.2, "</{tag_name}>");
            } else {
                // Fallback: just insert at element_end (may conflict in rare
                // cases but safe enough for normal source).
                edits.push((element_end, element_end, format!("</{tag_name}>")));
            }
        } else if !is_self_closing_slash && !is_void && has_trailing_content && !is_empty {
            // Case 4: Implicitly-closed element with non-whitespace content
            // whose AST `end` includes trailing whitespace (newline + indent)
            // that belongs to the parent, not the element's content.
            // E.g. `<li>a\n\t` where `\n\t` is the indentation leading to the
            // next sibling `<li>`.
            //
            // Walk backwards from `element_end` to find the last non-whitespace
            // byte (the actual content end), then REPLACE the trailing whitespace
            // with `</tag>`.  The adjacent-block indent loop will re-insert the
            // `\n{child_indent}` separator before the next sibling, so removing
            // the raw `\n\t` is safe.
            //
            // The `!is_empty` guard prevents this from firing for elements that
            // have only whitespace content (e.g. `<duiv>\n`) — those are handled
            // by the collapse pass (whitespace-only → `<tag> </tag>`).
            //
            // Only apply when ALL trailing bytes are ASCII whitespace — if
            // non-whitespace bytes are present the element has actual trailing
            // content (e.g. `<li>text more</ul>`) that we must not remove.
            let trailing_ws_only = bytes[..end_idx]
                .iter()
                .rev()
                .take_while(|&&b| matches!(b, b' ' | b'\t' | b'\n' | b'\r'))
                .count();
            if trailing_ws_only > 0 {
                let content_end = (end_idx - trailing_ws_only) as u32;
                // Replace trailing whitespace with `\n{indent}</tag>`.
                // The indent pass may also emit an edit on this same span
                // (normalising `\n\t` to `\n{child_indent}`) — the overlap
                // detection in `lib.rs` ensures markup's edit wins and the
                // indent edit is skipped, so the newline + indent here is
                // the only whitespace emitted before the close tag.
                let parent_indent = indent_str(depth, &options.js);
                edits.push((
                    content_end,
                    element_end,
                    format!("\n{parent_indent}</{tag_name}>"),
                ));
            }
        }
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
        && !is_block_element(tag_name)
        && (start as usize)
            .checked_sub(1)
            .and_then(|i| source.as_bytes().get(i))
            .is_some_and(|&b| !b.is_ascii_whitespace() && b != b'>');
    if hug_close {
        let indent = indent_str(depth, &options.js);
        edits.push((start, end, format!("</{tag_name}\n{indent}>")));
    } else if open_wrapped && is_empty && options.bracket_same_line {
        // `bracketSameLine` glues the wrapped open tag's `>` to the last
        // attribute (`…role="c">`), so an empty element's close tag drops to its
        // own line at the element indent (`…role="c">\n</div>`). Emit the
        // newline as part of the close-tag replacement so it never conflicts
        // with the open-tag edit that ends at this same position.
        let indent = indent_str(depth, &options.js);
        edits.push((start, end, format!("\n{indent}</{tag_name}>")));
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

/// Fallback: locate ANY `</name>` close tag that ends at `element_end`.
/// Used when `find_close_tag_span` fails because the source has a mismatched
/// close tag (e.g. `<duiv>…</div>` — the parser uses the element's AST tag
/// name but the source written the wrong name).  This finds the `<` of the
/// actual close tag so the caller can replace it with the correct tag name.
fn find_any_close_tag_span(source: &str, element_end: u32) -> Option<(u32, u32)> {
    let bytes = source.as_bytes();
    let end = element_end as usize;
    if end == 0 || end > bytes.len() || bytes[end - 1] != b'>' {
        return None;
    }
    // Walk back: `>`, optional whitespace, tag name, `/`, `<`.
    let mut i = end - 1; // at '>'
    i = i.checked_sub(1)?;
    while matches!(bytes[i], b' ' | b'\t' | b'\n' | b'\r') {
        i = i.checked_sub(1)?;
    }
    // Skip the tag name (alphanumeric / hyphen / colon / dot for custom elements).
    while i > 0 && matches!(bytes[i], b'a'..=b'z' | b'A'..=b'Z' | b'0'..=b'9' | b'-' | b':' | b'.')
    {
        i -= 1;
    }
    let slash = i;
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
/// One entry in an element's open tag: the `this={…}` slot, an attribute
/// (index into the element's attribute list), or a comment (index into the
/// scanned open-tag comments). The interleaving order is computed once by
/// source position and reused across both render passes.
enum OpenTagItem {
    This,
    Attr(usize),
    Comment(usize),
}

/// Render the `this={X}` / `this="X"` slot of `<svelte:component>` /
/// `<svelte:element>`. Returns `Ok(None)` when the expression has no source
/// span or cannot be formatted — the caller aborts the open-tag rewrite then.
fn render_this_attr(
    source: &str,
    expr: &Expression,
    options: &FormatOptions,
    attr_depth: usize,
) -> Result<Option<String>, FormatError> {
    let (Some(expr_start), Some(expr_end)) = (expr.start(), expr.end()) else {
        return Ok(None);
    };
    // Detect `this="string"` — the byte before the expression start is a
    // quote, meaning the attribute was written as a plain string value rather
    // than `this={expr}`. Preserve the string form (`this="value"`) rather
    // than converting to the brace form, which would turn `this="div"` into
    // `this={div}` (an identifier reference, not a string literal).
    let prev_byte = (expr_start as usize)
        .checked_sub(1)
        .and_then(|i| source.as_bytes().get(i))
        .copied();
    let this_attr = if matches!(prev_byte, Some(b'"') | Some(b'\'')) {
        let raw = source
            .get(expr_start as usize..expr_end as usize)
            .unwrap_or("")
            .trim();
        format!("this=\"{raw}\"")
    } else if let Some(formatted) = format_expression_at(source, expr, options, attr_depth)? {
        format!("this={{{formatted}}}")
    } else {
        return Ok(None);
    };
    Ok(Some(this_attr))
}

fn push_open_tag(
    source: &str,
    element_start: u32,
    tag_name: &str,
    attributes: &[Attribute],
    this_expression: Option<&Expression>,
    depth: usize,
    empty_element: bool,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<bool, FormatError> {
    let Some(open_tag_end) = find_open_tag_end(source, element_start, attributes) else {
        return Ok(false);
    };

    // Void HTML elements (`<input>`, `<br>`, `<hr>`, …) have no closing tag;
    // prettier-plugin-svelte normalizes them to the self-closing ` />` form
    // even when the source omits the slash.
    // `<svelte:window>` is also emitted as self-closing when it has no
    // children (the common case). When it does have children (a compiler error,
    // but the formatter still processes it), it keeps the non-self-closing form.
    let last_attr_end = attributes.last().map_or(0, |a| attribute_span(a).1);
    let self_closing = is_self_closing_inner(source, open_tag_end, last_attr_end)
        || is_void_element(tag_name)
        || (tag_name == "svelte:window" && empty_element);

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
    // A block element never hugs (`shouldHugStart` returns false for it), so its
    // `>` always breaks to its own line when the open tag wraps — even with text
    // directly after it (block elements trim edge whitespace, so no significant
    // whitespace is injected).
    // Exception: `<pre>` / `<textarea>` always hug `>` to the last attribute —
    // breaking `>` onto its own line would inject a newline before the content,
    // changing how the browser renders these whitespace-sensitive elements
    // (oxfmt 0.56 treats `<textarea>` content as verbatim raw text, like `<pre>`).
    // Whether `tag_name` is a Svelte Component (uppercase-initial or `svelte:*`).
    let is_component = tag_name.starts_with("svelte:")
        || tag_name
            .chars()
            .next()
            .is_some_and(|c| c.is_ascii_uppercase());
    let hug_open = !self_closing
        && (matches!(tag_name, "pre" | "textarea")
            || (!is_block_element(tag_name)
                && source
                    .as_bytes()
                    .get(open_tag_end as usize)
                    .is_some_and(|&b| {
                        if b == b'<' {
                            // The byte after `>` is `<`: either a child element or the
                            // close tag (`</tag>`).
                            // - For plain HTML inline elements, prettier never hugs a
                            //   leading element child (the `>` breaks to its own line).
                            // - For Svelte Components, prettier uses `shouldHugStart` for
                            //   element children (non-whitespace-sensitive). Hug when the
                            //   next byte is NOT `/` (child, not close tag).
                            is_component
                                && source
                                    .as_bytes()
                                    .get(open_tag_end as usize + 1)
                                    .is_some_and(|&b2| b2 != b'/')
                        } else {
                            !b.is_ascii_whitespace()
                        }
                    })));

    // When the open tag wraps, each attribute renders at `depth + 1` indent, so
    // its value expression must make its wrap decision against a width narrowed
    // by that lead (#795).
    let attr_depth = depth + 1;

    // `this={X}` / `this="X"` is rendered once (its shape is identical in the
    // one-line and wrapped passes) and emitted first regardless of source
    // position.
    let this_attr = match this_expression {
        Some(expr) => match render_this_attr(source, expr, options, attr_depth)? {
            Some(text) => Some(text),
            None => return Ok(false),
        },
        None => None,
    };

    // Comments inside an element's open tag are owned by this rewrite, so they'd
    // be silently dropped if we rebuilt the tag from the attribute list alone
    // (#685). Scan them once — they are stable across both render passes.
    let comments = collect_open_tag_comments(source, element_start, open_tag_end, attributes);
    let has_line_comment = comments.iter().any(|c| c.is_line);

    // Determine the interleaved order of `this` / attributes / comments by
    // source position once; the order is identical across both render passes
    // (only an attribute's rendered text changes when the tag wraps), so the
    // sort is done a single time here rather than per pass. `this` sits at
    // `element_start` (the `<`), strictly before every attribute/comment, so it
    // always sorts first.
    let mut order: Vec<(u32, OpenTagItem)> =
        Vec::with_capacity(attributes.len() + comments.len() + 1);
    if this_attr.is_some() {
        order.push((element_start, OpenTagItem::This));
    }
    for (i, attr) in attributes.iter().enumerate() {
        order.push((attribute_span(attr).0, OpenTagItem::Attr(i)));
    }
    for (i, c) in comments.iter().enumerate() {
        order.push((c.start, OpenTagItem::Comment(i)));
    }
    order.sort_by_key(|(start, _)| *start);

    // Materialize the open-tag items in source order. `wrapped_pass` selects the
    // attribute rendering: `false` for the one-line probe, `true` once the tag
    // is known to wrap (each attribute value re-narrowed by its `name={` lead).
    let render_items = |wrapped_pass: bool| -> Result<Vec<String>, FormatError> {
        order
            .iter()
            .map(|(_, item)| match item {
                OpenTagItem::This => Ok(this_attr.clone().unwrap_or_default()),
                OpenTagItem::Attr(i) => {
                    render_attribute(&attributes[*i], source, options, attr_depth, wrapped_pass)
                }
                OpenTagItem::Comment(i) => Ok(comments[*i].text.clone()),
            })
            .collect()
    };

    let rendered_attrs: Vec<String> = render_items(false)?;

    let one_liner = render_one_line(tag_name, &rendered_attrs, self_closing);

    // Structural estimate: `depth × indent_width`.
    let depth_indent_width = indent_visual_width(depth, &options.js);
    // When the element appears inline immediately after a block tag closer `}`
    // on the same source line (e.g. `{#if cond}<div …>` or `{:else}<span>`),
    // the actual column of the element's `<` is higher than the depth estimate.
    // Use the source column in that case so the fit check correctly detects
    // overflow and wraps the open tag.  This is specifically limited to `}`-
    // prefixed cases to avoid false positives when the preceding character is
    // `>` (a close tag) or anything that changes between source and formatted.
    let leading_indent_width =
        if element_start > 0 && source.as_bytes().get(element_start as usize - 1) == Some(&b'}') {
            let line_start = source[..element_start as usize]
                .rfind('\n')
                .map_or(0, |i| i + 1);
            let source_col = source
                .get(line_start..element_start as usize)
                .map_or(0, |prefix| prefix.width());
            std::cmp::max(depth_indent_width, source_col)
        } else {
            depth_indent_width
        };
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
    let open_one_line_width = leading_indent_width + visual_width(&one_liner);
    // When the element hugs its content (an inline element whose first child
    // touches the `>`), the closing `>` of the open tag moves down to the hugged
    // content line (`<button …attrs`\n`  >text</button`\n`>`). So the attribute
    // line that must fit is the open tag WITHOUT that trailing `>` — don't wrap
    // the attributes just because the `>` alone tips the tag one column over.
    // For both hug-open elements (where `>` lands on the hugged-content line)
    // and empty non-self-closing elements (where `shape_two` may break `>` to its
    // own line), the `>` itself is NOT on the attribute line — so the fit check
    // must exclude it. Subtract 1 when either condition applies.
    let open_fit_width = if !self_closing && one_liner.ends_with('>') && (hug_open || empty_element)
    {
        open_one_line_width - 1
    } else {
        open_one_line_width
    };
    let open_fits = open_fit_width <= line_width;
    let fits_one_line = !has_line_comment && !any_multiline_attr && open_fits;

    // prettier wraps the open tag when the whole element overflows flat, not just
    // the open tag. For an empty element the flat element is `open + </tag>`, so
    // when the open tag fits one line but `open + close` overflows, keep the
    // attributes on one line and break only the `>` onto the next line
    // (`<my-stepper …a …b`\n`></my-stepper>`) — the inner attr-group stays flat
    // while the outer element-group breaks. (Non-empty content width isn't
    // measured here — that's the full group model, out of scope.)
    let close_width = if empty_element && !self_closing {
        tag_name.len() + 3 // "</" + name + ">"
    } else {
        0
    };
    let element_overflows = close_width > 0 && open_one_line_width + close_width > line_width;
    // shape_two keeps attributes on one line and only breaks the `>` onto the
    // next line. This matches prettier's group model for components / svelte:*
    // special elements (the inner attr-group stays flat). For plain HTML block
    // elements, prettier instead wraps the attributes (full multi-line shape),
    // so shape_two is suppressed for them — they get the full `wrapped` path.
    // Prettier's `singleAttributePerLine`: an element with more than one
    // attribute always breaks every attribute onto its own line, even when they
    // would fit flat. `this={…}` (the special `<svelte:component this=…>` /
    // `<svelte:element this=…>` slot) counts as an attribute, matching
    // prettier-plugin-svelte's `node.attributes.length` test. A lone attribute
    // stays inline.
    let force_single_attr = options.single_attribute_per_line
        && (attributes.len() + usize::from(this_expression.is_some())) > 1;

    let shape_two = !rendered_attrs.is_empty()
        && fits_one_line
        && element_overflows
        && one_liner.ends_with('>')
        && !is_block_element(tag_name)
        // singleAttributePerLine forces the full multi-line shape, not the
        // attrs-on-one-line `shape_two`.
        && !force_single_attr;
    // For HTML block elements (div, p, section, …), when the full empty element
    // overflows the print width but the open tag alone fits, prettier still wraps
    // the attributes. This matches the group-model where the outer element group
    // breaking forces the inner attr-group to break too.
    let force_wrap_block = !rendered_attrs.is_empty()
        && fits_one_line
        && element_overflows
        && is_block_element(tag_name);

    // A no-attribute hug-open element (e.g. `<code>`) whose position overflows
    // the line needs its `>` moved to the content's line — the same hug-break
    // that prettier applies when there are attributes.  This fires only when
    // the element is already at an overflowing column (detected via source_col
    // from the `}` prefix check) so that normal in-line `<code>` stays flat.
    let hug_overflow = rendered_attrs.is_empty() && hug_open && !self_closing && !open_fits;
    let wrapped = !(rendered_attrs.is_empty() || fits_one_line)
        || shape_two
        || force_wrap_block
        || hug_overflow
        || force_single_attr;

    // Second pass: once we know the open tag wraps (attributes each on their own
    // line at `attr_depth`), re-render the attributes narrowing each value
    // expression by its `name={` prefix so a long value breaks where prettier
    // does. Only the multi-line shape (not `shape_two`, whose attributes stay on
    // one line) needs this; one-line tags keep the inline rendering above.
    let rendered_attrs = if wrapped && !shape_two {
        render_items(true)?
    } else {
        rendered_attrs
    };

    let rendered = if shape_two {
        // `one_liner` ends in `>`; drop it and put the `>` on the next line.
        let outer_indent = indent_str(depth, &options.js);
        format!("{}\n{outer_indent}>", &one_liner[..one_liner.len() - 1])
    } else if wrapped {
        render_multi_line(
            tag_name,
            &rendered_attrs,
            self_closing,
            depth,
            &options.js,
            hug_open,
            options.bracket_same_line,
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

/// Canonical list of HTML block-display elements (prettier-plugin-svelte's
/// `blockElements` / `isBlockElement`), shared with the collapse pass. These
/// elements never hug their start/end (`shouldHugStart` / `shouldHugEnd` return
/// false), so when their open tag wraps the closing `>` always breaks onto its
/// own line — even when text content sits directly after it.
///
/// Does NOT include `script` / `style` — those are whitespace-preserving in the
/// collapse pass (handled by `is_whitespace_preserving`) but count as block
/// elements here for open-tag layout purposes.
pub(crate) fn is_html_block_display_element(tag_name: &str) -> bool {
    matches!(
        tag_name,
        "address"
            | "article"
            | "aside"
            | "blockquote"
            | "dd"
            | "details"
            | "dialog"
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
            | "hr"
            | "li"
            | "main"
            | "nav"
            | "ol"
            | "p"
            | "pre"
            | "section"
            | "table"
            | "ul"
    )
}

fn is_block_element(tag_name: &str) -> bool {
    // `script` and `style` are block elements for open-tag layout purposes even
    // though the collapse pass treats them as whitespace-preserving separately.
    is_html_block_display_element(tag_name) || matches!(tag_name, "script" | "style")
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
    bracket_same_line: bool,
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
        // verbatim and must NOT be re-indented. (A wrapped interpolation inside
        // such a value already had its continuation lines re-indented to the
        // attribute column by `render_attribute_value_sequence`.)
        if is_string_value_attr(a) {
            out.push_str(a);
        } else if is_verbatim_interpolation_value(a) {
            // Interior whitespace between interpolations is literal HTML the oracle
            // keeps verbatim; re-indenting it would double-count the source indent.
            out.push_str(a);
        } else if a.starts_with("/*") {
            // Block comment sourced verbatim from the open-tag region: its
            // interior lines already carry the original source indentation
            // (tabs/spaces from the author). Adding `inner_indent` on top would
            // double-indent every continuation line, producing mixed
            // spaces+tabs (#A). Emit verbatim — the leading `inner_indent` was
            // already pushed above.
            out.push_str(a);
        } else {
            // For expression-led attributes that also contain raw HTML text
            // continuation lines (tab-indented), re-indent only the JS expression
            // part and keep the raw text verbatim.
            out.push_str(&reindent_attr_with_raw_text(a, &inner_indent));
        }
    }
    if hug_open && !self_closing && !attrs.is_empty() {
        // Whitespace-sensitive inline content: glue the `>` to the last
        // attribute line so no significant whitespace is injected before the
        // content (#798). The collapse pass (`try_hug_mixed`) later decides
        // whether to keep it glued or move it to a new indented line, depending
        // on whether the resulting line would overflow the print width.
        out.push('>');
    } else if hug_open && !self_closing {
        // No attributes but the element still needs the `>` on the
        // content's line (overflow hug): emit `<tagname\n{inner_indent}>`.
        out.push('\n');
        out.push_str(&inner_indent);
        out.push('>');
    } else if bracket_same_line && !attrs.is_empty() {
        // `bracketSameLine`: keep the closer glued to the last attribute line
        // instead of dropping it to its own line. Self-closing keeps the space
        // (` />`); a normal tag's `>` sits flush after the last attribute.
        if self_closing {
            out.push_str(" />");
        } else {
            out.push('>');
        }
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

/// Whether an interpolation-led string value (`name="{…}…"`) has newlines that
/// are *all* literal HTML text (brace-depth 0, between interpolations) rather
/// than a wrapped `{expr}` continuation — so it can be emitted verbatim to
/// preserve source whitespace. False for no-newline values or any newline inside
/// `{…}` (brace-depth > 0), which take the re-indent path.
fn is_verbatim_interpolation_value(a: &str) -> bool {
    let Some((_, value)) = a.split_once('=') else {
        return false;
    };
    if !value.starts_with("\"{") {
        return false;
    }
    let mut depth: i32 = 0;
    let mut quote: Option<u8> = None;
    let mut escaped = false;
    let mut saw_newline_at_depth0 = false;
    for &b in value.as_bytes() {
        match quote {
            // Inside a JS string literal: only its own *unescaped* closing
            // delimiter ends it; braces/newlines there are not structural.
            Some(q) => {
                if escaped {
                    escaped = false;
                } else if b == b'\\' {
                    escaped = true;
                } else if b == q {
                    quote = None;
                }
            }
            None => match b {
                b'\'' | b'"' | b'`' if depth > 0 => quote = Some(b),
                b'{' => depth += 1,
                b'}' => depth -= 1,
                // Inside `{…}` a newline is a wrapped continuation (re-indent);
                // at depth 0 it is literal text (verbatim).
                b'\n' if depth > 0 => return false,
                b'\n' => saw_newline_at_depth0 = true,
                _ => {}
            },
        }
    }
    saw_newline_at_depth0
}

/// Re-indent an expression-led attribute (`class="{expr}\nraw-text…"`).
///
/// OXC always formats JS with spaces (never tabs). When an attribute starts with
/// a JS expression (`"{`) but also has continuation lines that start with a tab
/// (`\n\t`), those tab-indented lines are raw HTML attribute text — not formatted
/// JS — and must be kept verbatim. Split the attribute at the first `\n\t` and
/// re-indent only the expression part; append the raw text as-is.
///
/// Falls back to `reindent(a, prefix, true)` when no `\n\t` is found (pure JS
/// attribute — the normal path).
fn reindent_attr_with_raw_text(a: &str, prefix: &str) -> String {
    // Find the first occurrence of a newline followed by a tab — this marks the
    // boundary between formatted JS and raw source text.
    if let Some(split_pos) = a.find("\n\t") {
        let js_part = &a[..split_pos];
        let raw_part = &a[split_pos..]; // starts with "\n\t…"
        let reindented_js = crate::reindent::reindent(js_part, prefix, true);
        format!("{reindented_js}{raw_part}")
    } else {
        crate::reindent::reindent(a, prefix, true)
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

fn is_self_closing_inner(source: &str, open_tag_end: u32, last_attr_end: u32) -> bool {
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
            b'/' => {
                // A `/` that is at or before the last attribute's end is part
                // of the attribute value (e.g. `href=/` in `<a href=/>`) and
                // does NOT indicate self-closing syntax.
                if last_attr_end > 0 && (i as u32) < last_attr_end {
                    return false;
                }
                return true;
            }
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
    narrow_value: bool,
) -> Result<String, FormatError> {
    match attr {
        Attribute::Attribute(node) => {
            render_attribute_node(node, source, options, attr_depth, narrow_value)
        }
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
            // `bind:value={value}` → `bind:value` only when shorthand is allowed
            // (`svelteAllowShorthand`, default true).
            if options.allow_shorthand && inner == d.name.as_str() && modifiers.is_empty() {
                Ok(format!("bind:{}", d.name))
            } else {
                Ok(format!("bind:{}{modifiers}={{{inner}}}", d.name))
            }
        }
        Attribute::ClassDirective(d) => {
            // Columns before the value's `{`: `class:` + name + `=` (the `{` is
            // counted separately). Narrowing by this prefix once the open tag has
            // wrapped makes a long value break where prettier-plugin-svelte does
            // (#795) — matching `style:` / `on:` / `use:` etc.
            let prefix = visual_width("class:") + visual_width(d.name.as_str()) + 1;
            let inner = render_directive_value_narrow(
                source,
                &d.expression,
                d.end,
                options,
                attr_depth,
                narrow_value,
                prefix,
            )?;
            // `class:active={active}` → `class:active` only when shorthand is
            // allowed (`svelteAllowShorthand`, default true).
            if options.allow_shorthand && inner == d.name.as_str() {
                Ok(format!("class:{}", d.name))
            } else {
                Ok(format!("class:{}={{{inner}}}", d.name))
            }
        }
        Attribute::OnDirective(d) => {
            let modifiers = render_modifiers(&d.modifiers);
            if let Some(expr) = &d.expression {
                // prefix = "on:" + name + modifiers + "=" (the `{` is counted separately)
                let prefix = 3 + visual_width(d.name.as_str()) + visual_width(&modifiers) + 1;
                let inner = render_directive_value_narrow(
                    source,
                    expr,
                    d.end,
                    options,
                    attr_depth,
                    narrow_value,
                    prefix,
                )?;
                Ok(format!("on:{}{modifiers}={{{inner}}}", d.name))
            } else {
                Ok(format!("on:{}{modifiers}", d.name))
            }
        }
        Attribute::TransitionDirective(d) => {
            let pfx_kw = if d.intro && d.outro {
                "transition"
            } else if d.intro {
                "in"
            } else {
                "out"
            };
            let modifiers = render_modifiers(&d.modifiers);
            if let Some(expr) = &d.expression {
                let prefix = visual_width(pfx_kw)
                    + 1
                    + visual_width(d.name.as_str())
                    + visual_width(&modifiers)
                    + 1;
                let inner = render_directive_value_narrow(
                    source,
                    expr,
                    d.end,
                    options,
                    attr_depth,
                    narrow_value,
                    prefix,
                )?;
                Ok(format!("{pfx_kw}:{}{modifiers}={{{inner}}}", d.name))
            } else {
                Ok(format!("{pfx_kw}:{}{modifiers}", d.name))
            }
        }
        Attribute::AnimateDirective(d) => {
            if let Some(expr) = &d.expression {
                // "animate:" + name + "="
                let prefix = 8 + visual_width(d.name.as_str()) + 1;
                let inner = render_directive_value_narrow(
                    source,
                    expr,
                    d.end,
                    options,
                    attr_depth,
                    narrow_value,
                    prefix,
                )?;
                Ok(format!("animate:{}={{{inner}}}", d.name))
            } else {
                Ok(format!("animate:{}", d.name))
            }
        }
        Attribute::UseDirective(d) => {
            if let Some(expr) = &d.expression {
                // "use:" + name + "="
                let prefix = 4 + visual_width(d.name.as_str()) + 1;
                let inner = render_directive_value_narrow(
                    source,
                    expr,
                    d.end,
                    options,
                    attr_depth,
                    narrow_value,
                    prefix,
                )?;
                Ok(format!("use:{}={{{inner}}}", d.name))
            } else {
                Ok(format!("use:{}", d.name))
            }
        }
        Attribute::StyleDirective(d) => {
            let modifiers = render_modifiers(&d.modifiers);
            // Columns before the value's `{`: `style:` + name + modifiers + `=`.
            let prefix = visual_width("style:")
                + visual_width(d.name.as_str())
                + visual_width(&modifiers)
                + 1;
            let value = render_attribute_value_for_directive(
                &d.value,
                source,
                options,
                attr_depth,
                narrow_value,
                prefix,
            )?;
            // Shorthand: `style:color={color}` → `style:color` when the
            // expression is a simple identifier matching the directive name,
            // mirroring prettier-plugin-svelte's shorthand collapsing — gated on
            // `svelteAllowShorthand` (default true). With shorthand disabled the
            // full `style:color={color}` form is emitted, reconstructing the
            // implicit `{name}` value for a source-bare `style:color`.
            let shorthand_value = format!("{{{}}}", d.name);
            if options.allow_shorthand
                && (value.is_empty() || (modifiers.is_empty() && value == shorthand_value))
            {
                Ok(format!("style:{}{modifiers}", d.name))
            } else {
                let value = if value.is_empty() {
                    &shorthand_value
                } else {
                    &value
                };
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

/// `extra_lead` that narrows an expression to `inline_len - 1` columns — the
/// minimal width that forces OXC to break it at its top-level operator while
/// leaving inner content the widest budget.
fn minimal_break_extra(base_width: usize, inline_len: usize) -> usize {
    base_width.saturating_sub(inline_len) + 1
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

/// Whether an expression value is "shallow" — it wraps by breaking at its own
/// top-level operators (a ternary / binary / logical / member chain) rather than
/// by opening a nested block body. Block-bodied values (arrow handlers, object /
/// array literals, function expressions) keep their continuation lines at the
/// attribute indent with full width, so they must NOT be narrowed by the
/// `name={` prefix (that over-wraps the body). Detected syntactically: no arrow
/// and no leading object/array/function token.
fn is_shallow_value(src: &str) -> bool {
    if src.contains("=>") {
        return false;
    }
    let t = src.trim_start();
    // A leading `(` is a parenthesized operand of a shallow expression
    // (`(a ?? b) === c`), not a block body — only arrows open a body, and those
    // are already excluded by the `=>` check above.
    !(t.starts_with('{') || t.starts_with('[') || t.starts_with("function"))
}

/// Render an attribute whose value is a single `{expr}` mustache (whether the
/// source wrote it bare `attr={expr}` or quoted `attr="{expr}"` — prettier
/// renders both unquoted). Applies the `name={name}` → `{name}` shorthand.
fn render_single_expression_value(
    node: &AttributeNode,
    inner_src: &str,
    _source: &str,
    options: &FormatOptions,
    attr_depth: usize,
    narrow_value: bool,
) -> Result<String, FormatError> {
    if inner_src.is_empty() {
        return Ok(format!("{}={{}}", node.name));
    }
    // When the open tag wraps, attribute values are narrowed so OXC breaks them
    // at the right column.  Two cases:
    //
    // SHALLOW value (a function call / ternary / binary / logical chain — anything
    // that does NOT start with `{`/`[`/`function`/`=>`):
    //   First format at indent-only width (no extra_lead) to get a reference result.
    //   - If single-line: check whether the full attribute line (`indent + name={ +
    //     value + }`) overflows; if so, re-format with `prefix` as `extra_lead` to
    //     force a break at the right point.
    //   - If multi-line AND the first line ends with `{` or `[` (an expanded
    //     call-argument block): the continuation lines do NOT carry the `name={`
    //     prefix, so return the wider-width result as-is — narrowing by `prefix`
    //     would over-constrain inner expressions (e.g. `styles.fn({ prop: clsx(a,
    //     b) })` would wrongly break `clsx(a, b)` even though it fits).
    //   - If multi-line AND the first line does NOT end with `{`/`[` (a ternary,
    //     binary, or member chain that wraps at an operator): re-format with
    //     `prefix` as `extra_lead` so the break point matches prettier's output
    //     (the operator-break lands at the narrower column).
    //
    // NOT-SHALLOW value (an arrow handler / object / array literal):
    //   Format at indent-only width first.  If the result is still single-line but
    //   the full line overflows:
    //   - ARROW (`=>` present): re-format with `prefix - indent_width` as extra_lead
    //     so the arrow body gets exactly one indent level of room.
    //   - BLOCK-BODY (starts with `{` / `[` / `function`): re-format at
    //     `narrowed = inline_len - 1` (one character narrower than the inline form)
    //     to force the outer block to expand.  This is the minimal narrowing that
    //     triggers expansion: OXC only wraps when the content exceeds the width, so
    //     exactly `inline_len - 1` forces the outer `{…}` to split while giving the
    //     inner content the widest possible budget (maximizing the chance that
    //     nested calls like `styles.fn({ prop: clsx(a, b) })` stay on one line).
    //     Using `prefix - indent_width` as extra_lead would over-narrow the budget
    //     and wrongly break inner expressions for deep objects like
    //     `classes={{ input: styles.fn({ prop: clsx(a, b) }) }}`.
    let prefix = visual_width(node.name.as_str()) + 2;
    let indent_width = options.js.indent_width.value() as usize;
    let formatted = format_attribute_value_expression(inner_src, options, attr_depth, 0)?;
    let formatted = if narrow_value {
        let indent_cols = attr_depth * indent_width;
        let line_width = options.js.line_width.value() as usize;
        if !formatted.contains('\n') {
            // Single-line: check if the full rendered line `indent + name={value}`
            // overflows. `prefix` (`name.len() + 2`) already covers `name={`
            // INCLUDING the opening `{`, so only the closing `}` adds one more
            // column beyond the value — counting `{` again here would over-report
            // the width by one and wrongly break a value that fills exactly to the
            // print width (an 80-column `disabledDates={[…]}` line).
            if indent_cols + prefix + visual_width(&formatted) + 1 > line_width {
                if is_shallow_value(inner_src) {
                    // For a shallow expression (call / ternary / binary / logical chain),
                    // first try re-formatting with `extra_lead = prefix`.  If that
                    // produces a single-line result (i.e., the expression still fits
                    // within the narrowed width), keep it — the oracle allows the
                    // attribute line to overflow slightly in that case.
                    // If the `prefix`-narrowed result is MULTI-LINE (the top-level call
                    // was forced to break), check whether widening to `single_line_len`
                    // would keep the inner arguments on one line: using
                    // `narrowed = single_line_len` is the minimum that forces the break
                    // while giving arguments the widest possible budget.
                    // Example: `cn(value !== framework && "text-transparent")` (44 chars)
                    // at attr_depth=15 (base_width=50): `prefix=7` gives narrowed=43 and
                    // over-breaks the `&&` argument (arg=44 > 43).  Widening to
                    // narrowed=44 (= single_line_len) keeps the argument on one line
                    // (arg=44 ≤ 44).
                    let prefix_result =
                        format_attribute_value_expression(inner_src, options, attr_depth, prefix)?;
                    if prefix_result.contains('\n') {
                        // The `prefix` narrowing forced a break. Try widening to
                        // `single_line_len` to give inner content more room.
                        let base_width = line_width.saturating_sub(indent_cols);
                        let single_line_len = visual_width(&formatted);
                        let extra_lead = base_width.saturating_sub(single_line_len);
                        if extra_lead < prefix {
                            // Widening would give more room — try the wider result.
                            let wider = format_attribute_value_expression(
                                inner_src, options, attr_depth, extra_lead,
                            )?;
                            // Only use the wider result if it is still multi-line
                            // (ensures the break happened — single-line would mean we
                            // accidentally collapsed and we should keep the prefix result).
                            if wider.contains('\n') {
                                wider
                            } else {
                                prefix_result
                            }
                        } else {
                            prefix_result
                        }
                    } else {
                        prefix_result
                    }
                } else if inner_src.contains("=>") {
                    // Arrow function: narrow so the arrow body breaks when the
                    // attribute line overflows.
                    //
                    // Oracle rule: a 1-char overflow (total line = line_width + 1) is
                    // tolerated — oracle keeps the value single-line.  Only when the
                    // overflow is >= 2 chars do we apply a tighter narrowing.
                    //
                    // Default narrowing: `arrow_extra = prefix - indent_width`
                    // (one level of indented room for the arrow body).
                    //
                    // Tight narrowing (overflow >= 2): use `base_width - inline_len + 1`.
                    // This is the minimum extra_lead that forces OXC to break the
                    // top-level arrow (since narrowed = inline_len - 1 < inline_len),
                    // while giving the continuation body the widest possible budget
                    // (narrowed = inline_len - 1, far more room than prefix-based
                    // narrowing).  Do NOT take max with `prefix - indent_width` because
                    // that over-narrows the body when `prefix` is large (e.g. a
                    // 15-char attribute name like `onValueChange`).
                    let base_width = line_width.saturating_sub(indent_cols);
                    let inline_len = visual_width(&formatted);
                    let inline_total = indent_cols + prefix + 1 + inline_len + 1;
                    let arrow_extra = if inline_total > line_width + 1 {
                        // Overflow >= 2: use tight narrowing to force the arrow break
                        // while giving the body maximum room.
                        base_width.saturating_sub(inline_len) + 1
                    } else {
                        // Overflow == 1: oracle allows it to stay single-line.
                        prefix.saturating_sub(indent_width)
                    };
                    format_attribute_value_expression(inner_src, options, attr_depth, arrow_extra)?
                } else {
                    // Block-body (object / array / function): force expansion by
                    // formatting at exactly one char narrower than the inline form.
                    // The `format_attribute_value_expression` API uses extra_lead,
                    // so convert: narrowed = full_width − indent_cols − extra_lead,
                    // meaning extra_lead = full_width − indent_cols − (inline_len − 1).
                    let inline_len = visual_width(&formatted);
                    // full_width − indent_cols is the budget without extra_lead
                    let base_width = line_width.saturating_sub(indent_cols);
                    // extra_lead that yields narrowed = inline_len − 1
                    let extra_lead = base_width.saturating_sub(inline_len.saturating_sub(1));
                    format_attribute_value_expression(inner_src, options, attr_depth, extra_lead)?
                }
            } else {
                formatted
            }
        } else if is_shallow_value(inner_src) {
            // Multi-line shallow: check the first line to decide whether to
            // re-format with extra_lead.
            let first_line = formatted.lines().next().unwrap_or("").trim_end();
            // If the first line ends with `{` or `[`, an inner block/array is
            // being expanded — the continuation lines are inside that block and
            // do NOT start at the attribute column with the `name={` prefix.
            // Keep the wider-width result to avoid over-constraining inner exprs.
            if first_line.ends_with('{') || first_line.ends_with('[') || first_line.ends_with('(') {
                formatted
            } else {
                // The `name={` prefix only narrows the FIRST line; continuation
                // lines sit at the attribute indent (already measured). Adopt the
                // prefix-narrowed result only when it changes the first line, else
                // keep the indent-only one so nested interiors aren't over-broken.
                let prefixed =
                    format_attribute_value_expression(inner_src, options, attr_depth, prefix)?;
                let prefixed_first = prefixed.lines().next().unwrap_or("").trim_end();
                if prefixed_first == first_line {
                    formatted
                } else {
                    prefixed
                }
            }
        } else {
            formatted
        }
    } else {
        formatted
    };
    // Svelte attribute shorthand: `name={name}` → `{name}`.
    // Only apply shorthand when the attribute name is a valid JS identifier
    // (starts with a letter, `_`, or `$`; remainder is alphanumeric / `_` / `$`).
    // Names like `0` or `my-attr` are not valid identifiers and must keep the
    // full `name={expr}` form to avoid producing invalid Svelte syntax.
    let name = node.name.as_str();
    let is_valid_js_identifier = name
        .chars()
        .next()
        .is_some_and(|c| c.is_alphabetic() || c == '_' || c == '$')
        && name
            .chars()
            .all(|c| c.is_alphanumeric() || c == '_' || c == '$');
    // `name={name}` → `{name}` only when shorthand is allowed
    // (`svelteAllowShorthand`, default true).
    if options.allow_shorthand && is_valid_js_identifier && formatted == name {
        Ok(format!("{{{formatted}}}"))
    } else {
        Ok(format!("{}={{{formatted}}}", name))
    }
}

fn render_attribute_node(
    node: &AttributeNode,
    source: &str,
    options: &FormatOptions,
    attr_depth: usize,
    narrow_value: bool,
) -> Result<String, FormatError> {
    match &node.value {
        AttributeValue::True(_) => Ok(node.name.to_string()),
        AttributeValue::Expression(tag) => {
            let inner_src = expression_tag_inner(tag, source).trim();
            render_single_expression_value(
                node,
                inner_src,
                source,
                options,
                attr_depth,
                narrow_value,
            )
        }
        // prettier-plugin-svelte strips the quotes around a value that is a
        // single mustache and nothing else: `attr="{expr}"` → `attr={expr}`
        // (which then shorthands to `{attr}` when the expression is exactly the
        // attribute name). A value with surrounding text (`"a {x}"`) or multiple
        // interpolations (`"{a}{b}"`) keeps its quotes — handled below.
        AttributeValue::Sequence(parts)
            if matches!(parts.as_slice(), [AttributeValuePart::ExpressionTag(_)]) =>
        {
            // The guard already established the single-`ExpressionTag` shape;
            // re-bind through the same slice pattern so the two stay in sync.
            let [AttributeValuePart::ExpressionTag(tag)] = parts.as_slice() else {
                unreachable!()
            };
            let inner_src = expression_tag_inner(tag, source).trim();
            render_single_expression_value(
                node,
                inner_src,
                source,
                options,
                attr_depth,
                narrow_value,
            )
        }
        AttributeValue::Sequence(parts) => {
            // Tailwind class sort: a fully static value (no `{expr}`) of a
            // configured class attribute is reordered before printing. Values
            // with interpolation are left to the normal path — their class list
            // isn't statically known.
            if let Some(sorter) = &options.class_sorter
                && options
                    .class_attributes
                    .iter()
                    .any(|a| a == node.name.as_str())
                && let Some(raw) = static_attribute_text(parts)
            {
                return Ok(format!("{}=\"{}\"", node.name, sorter(&raw)));
            }

            // Columns before the value body on the first line: `name="`.
            let name_prefix = visual_width(node.name.as_str()) + 2;
            let body = render_attribute_value_sequence(
                parts,
                source,
                options,
                attr_depth,
                name_prefix,
                narrow_value,
            )?;
            Ok(format!("{}=\"{}\"", node.name, body))
        }
    }
}

/// The raw text of a fully static attribute value (every part is literal text,
/// no `{expr}`), or `None` if it contains interpolation.
fn static_attribute_text(parts: &[AttributeValuePart]) -> Option<String> {
    let mut out = String::new();
    for part in parts {
        match part {
            AttributeValuePart::Text(t) => out.push_str(t.raw.as_str()),
            AttributeValuePart::ExpressionTag(_) => return None,
        }
    }
    Some(out)
}

fn render_attribute_value_for_directive(
    value: &AttributeValue,
    source: &str,
    options: &FormatOptions,
    attr_depth: usize,
    narrow_value: bool,
    prefix: usize,
) -> Result<String, FormatError> {
    match value {
        AttributeValue::True(_) => Ok(String::new()),
        AttributeValue::Expression(tag) => {
            let inner_src = expression_tag_inner(tag, source).trim();
            if inner_src.is_empty() {
                return Ok("{}".to_string());
            }
            let indent_cols = attr_depth * options.js.indent_width.value() as usize;
            let formatted = format_attribute_value_expression(inner_src, options, attr_depth, 0)?;
            // Same shallow-overflow re-narrow as a plain attribute value: when the
            // open tag wraps and a single-line value overflows once the
            // `style:name={` prefix is counted, re-format narrowed by the prefix
            // so a ternary / binary breaks at its top level.
            let line_width = options.js.line_width.value() as usize;
            let formatted = if narrow_value
                && !formatted.contains('\n')
                && indent_cols + prefix + 1 + visual_width(&formatted) + 1 > line_width
            {
                format_attribute_value_expression(inner_src, options, attr_depth, prefix + 1)?
            } else {
                formatted
            };
            Ok(format!("{{{formatted}}}"))
        }
        AttributeValue::Sequence(parts) => {
            // When the entire value is a single mustache expression with no
            // surrounding text (e.g. `style:color="{expr}"`), prettier-plugin-svelte
            // normalises to the bare-mustache form `style:color={expr}`.
            // Detect: exactly one non-empty ExpressionTag part, all Text parts empty.
            let sole_expr = parts
                .iter()
                .filter(|p| !matches!(p, AttributeValuePart::Text(t) if t.data.is_empty()))
                .collect::<Vec<_>>();
            if sole_expr.len() == 1
                && let Some(AttributeValuePart::ExpressionTag(tag)) = sole_expr.first()
            {
                let inner_src = expression_tag_inner(tag, source).trim();
                if !inner_src.is_empty() {
                    let indent_cols = attr_depth * options.js.indent_width.value() as usize;
                    let formatted =
                        format_attribute_value_expression(inner_src, options, attr_depth, 0)?;
                    let line_width = options.js.line_width.value() as usize;
                    let formatted = if narrow_value
                        && !formatted.contains('\n')
                        && indent_cols + prefix + 1 + visual_width(&formatted) + 1 > line_width
                    {
                        format_attribute_value_expression(
                            inner_src,
                            options,
                            attr_depth,
                            prefix + 1,
                        )?
                    } else {
                        formatted
                    };
                    return Ok(format!("{{{formatted}}}"));
                }
            }
            // Directive value body starts after `style:name="`: prefix + the `"`.
            let body = render_attribute_value_sequence(
                parts,
                source,
                options,
                attr_depth,
                prefix + 1,
                narrow_value,
            )?;
            Ok(format!("\"{body}\""))
        }
    }
}

fn render_attribute_value_sequence(
    parts: &[AttributeValuePart],
    source: &str,
    options: &FormatOptions,
    attr_depth: usize,
    name_prefix: usize,
    narrow_value: bool,
) -> Result<String, FormatError> {
    // When the value starts with literal text (`"bg: {expr}"`), render_multi_line
    // treats it as a verbatim string and does NOT re-indent it, so a wrapped
    // interpolation's continuation lines must be re-indented here. When the value
    // starts with the interpolation (`"{expr}%"`), the value is not a string-value
    // attr and render_multi_line re-indents the whole thing — so don't double it.
    let value_starts_with_text =
        matches!(parts.first(), Some(AttributeValuePart::Text(t)) if !t.data.is_empty());
    let mut out = String::new();
    for (i, part) in parts.iter().enumerate() {
        match part {
            AttributeValuePart::Text(t) => {
                // Emit the RAW source text, not the entity-decoded `data` — a value
                // like `title="&quot;"` must keep `&quot;` (decoding it to `"` would
                // prematurely close the quoted value and corrupt the markup).
                out.push_str(t.raw.as_str());
            }
            AttributeValuePart::ExpressionTag(tag) => {
                let inner_src = expression_tag_inner(tag, source).trim();
                if inner_src.is_empty() {
                    out.push_str("{}");
                } else {
                    // The expression sits inside a double-quoted attribute
                    // (`class="…{expr}…"`); prettier prefers single quotes for
                    // its string literals so they don't clash with the `"`
                    // delimiter (`{x ?? ''}`, not `{x ?? ""}`).
                    let mut opts = options.clone();
                    opts.js.quote_style = QuoteStyle::Single;
                    // When the open tag wraps, narrow a shallow interpolated
                    // expression by the columns it can't use on its first line:
                    // everything before its `{` (the `name="` prefix plus value
                    // text already emitted on this line) AND after its `}` (the
                    // remaining literal text on the line plus the closing `"`).
                    //
                    // Same two-pass logic as `render_single_expression_value`:
                    // first format at indent-only width; if multi-line and the
                    // first line ends with `{`/`[` (expanded call-argument block),
                    // keep the wider result to avoid over-constraining inner exprs.
                    let on_line = out.rsplit('\n').next().unwrap_or(&out);
                    // A multi-line string value (`style="…\n\tleft: {expr}%;\n…"`)
                    // already carries the interpolation's physical column in the
                    // emitted leading text on its own line (the source tabs/spaces),
                    // so `lead_cols` IS the start column — the attribute's logical
                    // indent must NOT be added on top (that double-counts and
                    // over-breaks an expression that actually fits). On a single-line
                    // value the logical indent still applies.
                    let value_is_multiline = out.contains('\n');
                    let lead_cols = if value_is_multiline {
                        visual_width(on_line)
                    } else {
                        name_prefix + visual_width(on_line)
                    };
                    // `format_attribute_value_expression` narrows the print width by
                    // `attr_depth` indent levels. For a multi-line string value the
                    // interpolation's physical indent is the literal text already on
                    // its line (counted in `lead_cols`), NOT the logical attribute
                    // depth — so pass depth 0 there to avoid subtracting the indent
                    // twice (which over-breaks: e.g. a member chain wraps instead of
                    // the top-level `??`).
                    let effective_attr_depth = if value_is_multiline { 0 } else { attr_depth };
                    // Trailing columns that share the interpolation's closing-`}`
                    // LINE — i.e. literal text up to the next newline only. A
                    // multi-line string value (`style="…\n\twidth: {r * 2}px;\n…"`)
                    // keeps each interpolation on its own physical line, so text on
                    // SUBSEQUENT lines must not count toward this one's width (else a
                    // trivial `{r * 2}` is force-broken to fit a phantom-long line).
                    let mut trailing_cols = 0usize;
                    for p in &parts[i + 1..] {
                        match p {
                            AttributeValuePart::Text(t) => {
                                let raw = t.raw.as_str();
                                if let Some(nl) = raw.find('\n') {
                                    trailing_cols += visual_width(&raw[..nl]);
                                    break;
                                }
                                trailing_cols += visual_width(raw);
                            }
                            // A following interpolation continues the same line; its
                            // width is unknown here, so (as before) count it as 0.
                            AttributeValuePart::ExpressionTag(_) => {}
                        }
                    }
                    // Whether there are trailing expression tags after this one.
                    // When true, the closing `)` of an expanded-arg form would land
                    // on a line followed by the next interpolation, producing
                    // `fn(\n  {...},\n)} {expr}` which the oracle does NOT emit.
                    let has_trailing_expr = parts[i + 1..]
                        .iter()
                        .any(|p| matches!(p, AttributeValuePart::ExpressionTag(_)));
                    let first_pass = format_attribute_value_expression(
                        inner_src,
                        &opts,
                        effective_attr_depth,
                        0,
                    )?;
                    let formatted = if narrow_value && is_shallow_value(inner_src) {
                        let indent_cols = attr_depth * opts.js.indent_width.value() as usize;
                        // For a multi-line string value the physical indent is already
                        // in `lead_cols`; don't add the logical attribute indent again.
                        let effective_indent = if value_is_multiline { 0 } else { indent_cols };
                        let line_width_val = opts.js.line_width.value() as usize;
                        // Narrowing strategy: narrow only by the expression's START
                        // column (indent + prefix + `{`). When the expression wraps to
                        // multiple lines, the trailing text after `}` lands on the final
                        // continuation line — NOT the first — so it must NOT influence
                        // the first-line break decision (narrowing by the trailing width
                        // over-breaks nested calls/args). When the start-column form
                        // still fits on one line but the full assembled line overflows,
                        // force the MINIMAL break below (`force_extra`) so only the
                        // expression's top-level operator wraps, matching the oracle.
                        let extra_start = lead_cols + 1; // chars before `{`
                        if effective_indent + extra_start >= line_width_val {
                            // Expression starts at or past the print width.
                            // OXC formatted at indent-only width. When there are no
                            // trailing interpolations, apply the prettier-style
                            // outer expansion for single-object-arg calls:
                            // - Single-line `fn({ k: v })` → `fn(\n  { k: v },\n)`
                            // - Multi-line `fn({\n  k: v,\n})` → `fn(\n  {\n    k: v,\n  },\n)`
                            let indent_w = opts.js.indent_width.value() as usize;
                            if !has_trailing_expr {
                                let first_line_fp =
                                    first_pass.lines().next().unwrap_or("").trim_end();
                                // Try expansion for multi-line `fn({` form.
                                let try_expand = if first_pass.contains('\n')
                                    && (first_line_fp.ends_with('{')
                                        || first_line_fp.ends_with('['))
                                {
                                    expand_obj_arg_call(&first_pass, indent_w)
                                } else if !first_pass.contains('\n') {
                                    // Single-line `fn({ k: v })` — try outer expansion.
                                    expand_obj_arg_call(&first_pass, indent_w)
                                } else {
                                    None
                                };
                                if let Some(expanded) = try_expand {
                                    expanded
                                } else if !first_pass.contains('\n') {
                                    // Past-width but breakable (the outer guard already
                                    // ensured `is_shallow_value`): force the minimal
                                    // break so the oracle's top-level split happens.
                                    let base_width =
                                        line_width_val.saturating_sub(effective_indent);
                                    let force_extra = minimal_break_extra(
                                        base_width,
                                        visual_width(first_pass.as_str()),
                                    );
                                    let forced = format_attribute_value_expression(
                                        inner_src,
                                        &opts,
                                        effective_attr_depth,
                                        force_extra,
                                    )?;
                                    if forced.contains('\n') {
                                        forced
                                    } else {
                                        first_pass
                                    }
                                } else {
                                    first_pass
                                }
                            } else {
                                first_pass
                            }
                        } else if !first_pass.contains('\n') {
                            // Wide first-pass produced a single-line result.
                            // Check if it fits with trailing on the same line.
                            let total = effective_indent
                                + lead_cols
                                + 1
                                + visual_width(first_pass.as_str())
                                + 1
                                + trailing_cols
                                + 1;
                            if total <= line_width_val {
                                // Fits: no narrowing needed
                                first_pass
                            } else {
                                // Doesn't fit on one line. The oracle breaks the
                                // expression at its MINIMAL break point (top-level
                                // operator) and lets the trailing literal sit on the
                                // final continuation line — it never narrows by the
                                // trailing width (doing so over-breaks nested calls/args,
                                // e.g. `fieldError(form, 'fullName')` exploding into
                                // multi-line arguments). So pick the narrowest width that
                                // still keeps the expression's first line intact.
                                // First try start-column narrowing (the original approach).
                                let start_result = format_attribute_value_expression(
                                    inner_src,
                                    &opts,
                                    effective_attr_depth,
                                    extra_start,
                                )?;
                                if start_result.contains('\n') {
                                    // Start-column narrowing already breaks the expression
                                    // — use it (matches the oracle's break point for long
                                    // ternaries where the expression itself is wider than
                                    // the available space after the prefix).
                                    start_result
                                } else {
                                    // Start-column didn't break (expression fits at extra_start).
                                    // The expression is short relative to base_width but the
                                    // trailing text is enormous.  Force the minimum break:
                                    // `narrowed = expr_len - 1` so OXC breaks the expression
                                    // itself (e.g. ternary at `?`/`:` or comparison at `===`),
                                    // accepting that the trailing text may overflow on the last
                                    // continuation line.
                                    let base_width =
                                        line_width_val.saturating_sub(effective_indent);
                                    let force_extra = minimal_break_extra(
                                        base_width,
                                        visual_width(first_pass.as_str()),
                                    );
                                    let forced = format_attribute_value_expression(
                                        inner_src,
                                        &opts,
                                        effective_attr_depth,
                                        force_extra,
                                    )?;
                                    if forced.contains('\n') {
                                        forced
                                    } else {
                                        // Still can't break via width narrowing.
                                        // For `fn({ key: val })` calls without trailing
                                        // expressions, prettier-plugin-svelte expands to
                                        // `fn(\n  { key: val },\n)` — apply that.
                                        let indent_w = opts.js.indent_width.value() as usize;
                                        if !has_trailing_expr {
                                            if let Some(expanded) =
                                                expand_obj_arg_call(&start_result, indent_w)
                                            {
                                                expanded
                                            } else {
                                                start_result
                                            }
                                        } else {
                                            start_result
                                        }
                                    }
                                }
                            }
                        } else {
                            // Multi-line first-pass (at indent-only width).
                            let first_line = first_pass.lines().next().unwrap_or("").trim_end();
                            if first_line.ends_with('{') || first_line.ends_with('(') {
                                // OXC expanded a call argument block (`fn({` / `fn(`).
                                // prettier-plugin-svelte instead keeps the arg on its own
                                // line: `fn(\n  {\n    ...\n  },\n)`. Apply that transform
                                // when the expression is a single-object-arg call and
                                // there are no trailing interpolations.
                                let indent_w = opts.js.indent_width.value() as usize;
                                if !has_trailing_expr {
                                    if let Some(expanded) =
                                        expand_obj_arg_call(&first_pass, indent_w)
                                    {
                                        expanded
                                    } else {
                                        first_pass
                                    }
                                } else {
                                    first_pass
                                }
                            } else {
                                // Operator-break or computed-member-access break (`?.[`)
                                // — re-format at start-column width so the break lands
                                // where the brace column dictates (trailing text is on a
                                // subsequent line, not relevant here).
                                format_attribute_value_expression(
                                    inner_src,
                                    &opts,
                                    effective_attr_depth,
                                    extra_start,
                                )?
                            }
                        }
                    } else {
                        first_pass
                    };
                    // A wrapped interpolation's continuation lines come back at
                    // column 0+1level; push them out to the attribute column so
                    // they align under the attribute — but only when this value is
                    // a verbatim string (render_multi_line won't re-indent it).
                    let formatted = if formatted.contains('\n') && value_starts_with_text {
                        let prefix = indent_str(attr_depth, &options.js);
                        crate::reindent::reindent(&formatted, &prefix, true)
                    } else {
                        formatted
                    };
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
    // Read the raw source between `{...` and `}` so that a TypeScript cast
    // like `{...restProps as any}` is preserved verbatim — the parser narrows
    // the expression span down to just the identifier, silently dropping `as T`.
    // This mirrors the `format_directive_value` approach for directive TS casts
    // (#682).  Fall back to the AST-expression path when the source braces can't
    // be located.
    let raw_inner = source
        .get(spread.start as usize..spread.end as usize)
        .and_then(|s| {
            // Strip leading `{...` (4 bytes) and trailing `}` (1 byte).
            s.strip_prefix("{...").and_then(|s| s.strip_suffix('}'))
        })
        .map(str::trim);
    let inner = if let Some(raw) = raw_inner.filter(|s| !s.is_empty()) {
        crate::expression::format_attribute_value_expression(raw, options, attr_depth, 0)?
    } else {
        format_expression_at(source, &spread.expression, options, attr_depth)?.unwrap_or_default()
    };
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

/// Like `render_directive_value` but re-narrows single-line values that would
/// overflow the line when preceded by `prefix` characters at the attribute
/// indent column. Only re-narrows when `narrow_value` is true (i.e. the open
/// tag has already been broken to multi-line). Unlike plain attribute values,
/// directive values include arrow-function handlers (`on:click={(e) => ...}`)
/// which prettier also re-narrows, so we do not apply the `is_shallow_value`
/// guard that the plain-attribute path uses.
fn render_directive_value_narrow(
    source: &str,
    expr: &Expression,
    value_end: u32,
    options: &FormatOptions,
    attr_depth: usize,
    narrow_value: bool,
    prefix: usize,
) -> Result<String, FormatError> {
    let formatted = render_directive_value(source, expr, value_end, options, attr_depth)?;
    if narrow_value && !formatted.contains('\n') {
        let indent_cols = attr_depth * options.js.indent_width.value() as usize;
        let line_width = options.js.line_width.value() as usize;
        // `{` + formatted + `}` = 1 brace on each side
        if indent_cols + prefix + 1 + visual_width(&formatted) + 1 > line_width {
            // For shallow (non-block) values use `prefix + 1` (the `{` counts
            // against the first-line budget and the value has no multi-line
            // continuation, so narrowing by the full prefix + brace is safe).
            //
            // For arrow-function values the body sits on the next line at
            // `+indent_width` relative to the expression, which the final
            // re-indent pass lifts to `attr_indent + indent_width` in the
            // template. The effective available width for the body is
            // `line_width - (attr_indent + indent_width)`, which is
            // `line_width - attr_indent - prefix + (prefix - indent_width)`.
            // Using `extra_lead = prefix - indent_width` (instead of `prefix`)
            // leaves the body exactly one indent level of room, preventing
            // over-narrow breakage of nested object / array arguments.
            let indent_width = options.js.indent_width.value() as usize;
            // An expression-bodied arrow must split after `=>`; `prefix -
            // indent_width` yields `narrowed = inline_len` (fits exactly, off by
            // one), so use the minimal-break width instead.
            let is_expr_arrow = formatted.contains("=>")
                && formatted
                    .split_once("=>")
                    .is_some_and(|(_, body)| !body.trim_start().starts_with('{'));
            let extra_lead = if is_shallow_value(&formatted) {
                prefix + 1
            } else if is_expr_arrow {
                let base_width = line_width.saturating_sub(indent_cols);
                minimal_break_extra(base_width, visual_width(&formatted))
            } else {
                prefix.saturating_sub(indent_width)
            };
            if let Some(s) = crate::expression::format_directive_value_extra(
                source, expr, value_end, options, attr_depth, extra_lead,
            )? {
                return Ok(s);
            }
        }
    }
    Ok(formatted)
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
        raw, options, attr_depth, 0,
    )?))
}
