use crate::options::FormatOptions;

use super::elements::{is_block_element, is_html_block_display_element, is_void_element};
use super::util::indent_str;

/// If the element isn't self-closing, normalize its closing tag to
/// `</tagname>` (no internal whitespace).
pub(super) fn push_close_tag(
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
    // Inline element with a whitespace-only body (`<span> </span>`): when its open
    // tag wraps, the close tag drops to its own line and the whitespace body is
    // absorbed into that break. See [`is_empty_nonhug_element`].
    empty_nonhug: bool,
    // Whether the element's last child ends exactly at `element_end` — then the
    // `</…>` sitting there is that CHILD's close tag (`<li><span>x</span></ul>`),
    // not a mis-typed close tag for this element, and the mismatch fallback must
    // not claim it.
    last_child_ends_here: bool,
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
    let span = find_close_tag_span(source, element_end, tag_name).or_else(|| {
        (!last_child_ends_here).then(|| find_any_close_tag_span(source, element_end))?
    });
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
                let content_end = crate::source_offset(end_idx - trailing_ws_only);
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
            } else {
                // The implicit close sits directly against the next sibling's
                // `<` (`<li>a<li>b`), so there is no whitespace to replace —
                // insert the close tag. The indent pass owns the separator.
                edits.push((element_end, element_end, format!("</{tag_name}>")));
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
    if empty_nonhug && open_wrapped {
        // Inline element with a whitespace body and a wrapped open tag: prettier
        // prints `group([...openingTag, '>', line, '</tag>'])`, and the `line`
        // breaks because the wrapped open tag forces the group open — so the close
        // tag drops to its own line at the element indent and the whitespace body
        // is absorbed into that break. The open `>` glued to the last attribute
        // line under `bracketSameLine` (see `push_open_tag`) or dedented otherwise.
        //
        // `<textarea>` is a raw-text exception: the oracle glues `>` and, under the
        // default `bracketSameLine: false`, glues the close tag too (`…"></textarea>`,
        // no break — the whitespace body is dropped). Only `bracketSameLine: true`
        // breaks the body (`…">`\n`</textarea>`).
        let bytes = source.as_bytes();
        let mut content_end = start as usize;
        while content_end > 0
            && matches!(bytes[content_end - 1], b' ' | b'\t' | b'\n' | b'\r' | 0x0c)
        {
            content_end -= 1;
        }
        let raw_text_glues_close = tag_name == "textarea" && !options.bracket_same_line;
        if raw_text_glues_close {
            edits.push((
                crate::source_offset(content_end),
                end,
                format!("</{tag_name}>"),
            ));
        } else {
            let indent = indent_str(depth, &options.js);
            edits.push((
                crate::source_offset(content_end),
                end,
                format!("\n{indent}</{tag_name}>"),
            ));
        }
    } else if hug_close {
        let indent = indent_str(depth, &options.js);
        edits.push((start, end, format!("</{tag_name}\n{indent}>")));
    } else if open_wrapped
        && is_empty
        && options.bracket_same_line
        && is_html_block_display_element(tag_name)
    {
        // A block-display element with a wrapping open tag whose body is empty (or
        // whitespace-only, which the oracle treats as empty): under
        // `bracketSameLine` the open `>` glues to the last attribute (see
        // `push_open_tag`), so the close tag drops to its own line and any
        // whitespace body is absorbed into that break — matching the oracle
        // `<div`\n`  …">`\n`</div>`. The default (`bracketSameLine: false`) keeps
        // the dedented `></div>` form of the branch below. See #1721.
        let bytes = source.as_bytes();
        let mut content_end = start as usize;
        while content_end > 0
            && matches!(bytes[content_end - 1], b' ' | b'\t' | b'\n' | b'\r' | 0x0c)
        {
            content_end -= 1;
        }
        let indent = indent_str(depth, &options.js);
        edits.push((
            crate::source_offset(content_end),
            end,
            format!("\n{indent}</{tag_name}>"),
        ));
    } else if open_wrapped && is_empty && options.bracket_same_line {
        // An empty element's wrapped open `>` dedents onto its own line (see the
        // `!empty_element` guard in `push_open_tag`), so `>` and `</tag` glue as
        // `…"`\n`></tag` — matching prettier's empty `shouldHugStart && hugEnd`
        // branch. `canOmitSoftlineBeforeClosingTag` then decides the final `>`:
        // when the element is followed by collapse-whitespace / the doc end / a
        // block parent's close tag it is glued (`></tag>`), otherwise a softline
        // dedents it onto its own line (`></tag`\n`>`), mirroring #1687's port.
        if can_omit_softline_before_closing_tag(source, element_end) {
            edits.push((start, end, format!("</{tag_name}>")));
        } else {
            let indent = indent_str(depth, &options.js);
            edits.push((start, end, format!("</{tag_name}\n{indent}>")));
        }
    } else {
        edits.push((start, end, format!("</{tag_name}>")));
    }
}

/// prettier-plugin-svelte's `canOmitSoftlineBeforeClosingTag`, evaluated
/// structurally from the text after the element's close tag (its caller already
/// gates on `bracketSameLine`): `!hugsStartOfNextNode(node) ||
/// isLastChildWithinParentBlockElement(path)`.
///
/// - `hugsStartOfNextNode` is false at the doc end or when HTML-collapse
///   whitespace follows — the softline before the closing `>` may be omitted;
/// - otherwise a node abuts the close tag, and the softline may still be omitted
///   only when that node is a block parent's own close tag (`</block…`), i.e.
///   this element is that block's last child.
///
/// The block test uses `is_html_block_display_element` — prettier's `blockElements`
/// list, which excludes `script`/`style` — to match `isLastChildWithinParentBlockElement`
/// exactly (and its collapse-pass mirror `omit_softline_allowed`, which uses the
/// same `is_block_display`).
fn can_omit_softline_before_closing_tag(source: &str, element_end: u32) -> bool {
    let rest = &source[element_end as usize..];
    match rest.chars().next() {
        None | Some(' ' | '\t' | '\n' | '\u{0C}' | '\r') => true,
        Some(_) => rest.strip_prefix("</").is_some_and(|after| {
            let name: String = after
                .chars()
                .take_while(|c| c.is_ascii_alphanumeric() || *c == '-' || *c == ':')
                .collect();
            is_html_block_display_element(&name)
        }),
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
pub(super) fn find_close_tag_span(
    source: &str,
    element_end: u32,
    tag_name: &str,
) -> Option<(u32, u32)> {
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

    Some((crate::source_offset(lt), crate::source_offset(end)))
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
    Some((crate::source_offset(lt), crate::source_offset(end)))
}
