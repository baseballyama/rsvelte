use super::*;

/// Pass 1.9: break the open tag of inline/component elements that land on an
/// overflowing line with non-whitespace text before them.
///
/// Pattern:
///   `      Explore … of <span class="font-medium …">`  (>80 cols)
/// becomes:
///   `      Explore … of <span\n        class="font-medium …"\n      >`
///
/// Only fires when:
/// - The element has at least one attribute.
/// - The element's open tag is currently single-line.
/// - The line containing the element's open `<` overflows the print width.
/// - There is non-whitespace text before the element on the same line.
/// - The element's content starts with whitespace (`hug_start=false`).
///
/// The broken form uses the line's leading-whitespace as `indent` and
/// `indent + "  "` as `inner_indent` for attributes.
pub(super) fn collect_break_inline_open_tag(
    out: &str,
    fragment: &Fragment,
    line_width: usize,
    edits: &mut Vec<(u32, u32, String)>,
) {
    for node in &fragment.nodes {
        match node {
            TemplateNode::RegularElement(e) => {
                // For block/whitespace-preserving elements that are EMPTY (no
                // children, no attributes), break the open tag when the whole
                // line overflows and there is inline content after the element.
                // Example: `  <script></script>{@html ...}` (86 chars) →
                //          `  <script\n  ></script>{@html ...}`.
                let elem_fragment_empty = e.fragment.nodes.iter().all(
                    |n| matches!(n, TemplateNode::Text(t) if crate::is_blank_text(t.data.as_ref())),
                );
                if (is_block_display(e.name.as_str()) || is_whitespace_preserving(e.name.as_str()))
                    && e.attributes.is_empty()
                    && elem_fragment_empty
                    && let Some(edit) = try_break_empty_block_open_tag(
                        out,
                        e.name.as_str(),
                        e.start,
                        e.end,
                        line_width,
                    )
                {
                    edits.push(edit);
                    continue;
                }
                if is_whitespace_preserving(e.name.as_str()) {
                    continue;
                }
                // Only inline (non-block) regular elements.
                if !is_block_display(e.name.as_str())
                    && let Some(edit) = try_break_inline_open_tag(
                        out,
                        e.name.as_str(),
                        &e.attributes,
                        e.start,
                        e.end,
                        &e.fragment,
                        line_width,
                    )
                {
                    // A whole-element edit (`edit.1 == e.end`) rewrites the tag
                    // *and its children* in one span, so a child edit collected
                    // below would apply against now-stale offsets inside that
                    // span — corrupting the output or panicking `apply_edits`.
                    // Skip recursion in that case. An open-tag-only edit
                    // (`edit.1 < e.end`) leaves the children untouched, so
                    // recursion into them is still safe.
                    let whole_element = edit.1 == e.end;
                    edits.push(edit);
                    if whole_element {
                        continue;
                    }
                }
                collect_break_inline_open_tag(out, &e.fragment, line_width, edits);
            }
            TemplateNode::Component(c) => {
                let mut whole_element = false;
                if let Some(edit) = try_break_inline_open_tag(
                    out,
                    c.name.as_str(),
                    &c.attributes,
                    c.start,
                    c.end,
                    &c.fragment,
                    line_width,
                ) {
                    whole_element = edit.1 == c.end;
                    edits.push(edit);
                }
                if !whole_element {
                    collect_break_inline_open_tag(out, &c.fragment, line_width, edits);
                }
            }
            _ => {
                for child in child_fragments(node) {
                    collect_break_inline_open_tag(out, child, line_width, edits);
                }
            }
        }
    }
}

/// Try to break the open tag of an inline/component element whose line overflows
/// and has non-whitespace text before it. Returns `None` when the conditions
/// are not met or the element is already correctly broken.
pub(super) fn try_break_inline_open_tag(
    out: &str,
    tag: &str,
    attrs: &[rsvelte_core::ast::template::Attribute],
    elem_start: u32,
    elem_end: u32,
    fragment: &Fragment,
    line_width: usize,
) -> Option<(u32, u32, String)> {
    // Must have attributes to break. Zero-attribute elements in hug_start=true
    // contexts can't be broken safely without tree-level indent information.
    if attrs.is_empty() {
        return None;
    }
    // Must have at least one child so we can locate the end of the open tag
    // (the `>` is immediately followed by the first child's start position).
    let first = fragment.nodes.first()?;
    let open_tag_end = node_start(first) as usize;

    // Get the open tag text (from `<` to just after `>`).
    let open_tag = out.get(elem_start as usize..open_tag_end)?;

    // Open tag must be single-line (not already broken) and end with `>`.
    if open_tag.contains('\n') || !open_tag.ends_with('>') {
        return None;
    }

    // Check the line containing the element's opening `<`.
    let elem_start_usize = elem_start as usize;
    let line_start = out[..elem_start_usize].rfind('\n').map_or(0, |i| i + 1);
    // Line end: find the next `\n` starting from after the open tag.
    let line_end = out[open_tag_end..]
        .find('\n')
        .map_or(out.len(), |i| open_tag_end + i);
    let line = out.get(line_start..line_end)?;

    // Line must overflow.
    if line.width() <= line_width {
        return None;
    }

    // There must be non-whitespace text before the element on this line.
    let before = out.get(line_start..elem_start_usize)?;
    if before.is_empty() || before.bytes().all(|b| b == b' ' || b == b'\t') {
        return None; // element is at line start — not our target
    }

    // Extract leading whitespace of the line as the base indent for the tag.
    let ws_end = before
        .char_indices()
        .find(|(_, c)| !c.is_whitespace())
        .map_or(before.len(), |(i, _)| i);
    let indent = &before[..ws_end];
    let inner_indent = format!("{indent}  ");

    // Collect attribute texts; bail on any multi-line attribute.
    let mut attr_texts: Vec<&str> = Vec::with_capacity(attrs.len());
    for attr in attrs {
        let (as_, ae) = attribute_span(attr);
        let atext = out.get(as_ as usize..ae as usize)?;
        if atext.contains('\n') {
            return None;
        }
        attr_texts.push(atext);
    }

    // Check whether content starts with whitespace (hug_start=false) or directly
    // after `>` (hug_start=true).
    let first_child_text = out.get(open_tag_end..node_end(first) as usize)?;
    let hug_start = !first_child_text.starts_with([' ', '\t', '\r', '\n']);

    if !hug_start {
        // hug_start=false: build broken open tag with `>` on its own line.
        //   <tag
        //     attr1
        //     attr2
        //   >
        let mut broken = format!("<{tag}");
        for atext in &attr_texts {
            broken.push('\n');
            broken.push_str(&inner_indent);
            broken.push_str(atext);
        }
        broken.push('\n');
        broken.push_str(indent);
        broken.push('>');

        // Only emit if different from the current open tag.
        (broken != open_tag).then_some((elem_start, open_tag_end as u32, broken))
    } else {
        // hug_start=true: the element's content starts directly after `>` with no
        // whitespace. We need to break the open tag so that `>content</tag` stays
        // glued, and the close tag's `>` goes on its own line at the base indent.
        //
        // Only apply when the element has at least 2 attributes. Single-attribute
        // elements are left inline even if the line overflows, matching prettier's
        // behavior of not breaking short inline elements that can't be meaningfully
        // split without disrupting reading flow.
        if attr_texts.len() < 2 {
            return None;
        }

        // The whole element text: `<tag attrs>content</tag>`
        // We replace it with one of two patterns depending on whether
        // `{before}<tag attrs_without_close_angle` fits in line_width:
        //
        // Option A (attrs need full break):
        //   <tag
        //     attr1
        //     attrN>content</tag
        //   >
        //
        // Option B (only close-angle needs to break):
        //   <tag attr1 attrN
        //     >content</tag
        //   >

        let elem_end_usize = elem_end as usize;
        // The whole element text must be single-line (no internal newlines except
        // possibly in content — skip if element is already multi-line).
        let whole = out.get(elem_start_usize..elem_end_usize)?;
        if whole.contains('\n') {
            return None;
        }

        // Find the close tag: `</tag>` is the suffix.
        // We locate `</tag` working backwards from elem_end.
        let close_pat = format!("</{tag}");
        let close_rel = whole.rfind(close_pat.as_str())?;
        let content = whole.get(open_tag.len()..close_rel)?; // text between open `>` and `</tag`
        // The close tag `>` is the last character.
        if !whole.ends_with('>') {
            return None;
        }
        // close_tag_text = `</tag>` (everything from close_rel to end)
        let close_tag_text = whole.get(close_rel..)?;
        // Strip trailing `>` to get `</tag`, then we'll append `\n{indent}>`.
        let close_tag_without_angle = close_tag_text.strip_suffix('>')?;

        // Check if Option B fits: `{before}<tag attr1 attrN` (no `>`) ≤ line_width.
        // We use the open_tag minus the trailing `>` character.
        let open_tag_without_angle = open_tag.strip_suffix('>')?;
        let option_b_prefix_len = before.width() + open_tag_without_angle.width();

        let broken = if option_b_prefix_len <= line_width {
            // Option B: keep `<tag attrs` on the current line, break at `>`.
            //   <tag attr1 attrN
            //     >content</tag
            //   >
            format!(
                "{open_tag_without_angle}\n{inner_indent}>{content}{close_tag_without_angle}\n{indent}>"
            )
        } else {
            // Option A: break each attr onto its own line.
            //   <tag
            //     attr1
            //     attrN>content</tag
            //   >
            let mut broken = format!("<{tag}");
            for (i, atext) in attr_texts.iter().enumerate() {
                broken.push('\n');
                broken.push_str(&inner_indent);
                broken.push_str(atext);
                // Last attr: close angle `>` and content stay on the same line.
                if i == attr_texts.len() - 1 {
                    broken.push('>');
                    broken.push_str(content);
                    broken.push_str(close_tag_without_angle);
                    broken.push('\n');
                    broken.push_str(indent);
                    broken.push('>');
                }
            }
            broken
        };

        if broken == whole {
            return None;
        }
        Some((elem_start, elem_end, broken))
    }
}

/// Try to break the open tag of an EMPTY block/whitespace-preserving element
/// (no attributes, no children) that sits at line-start on a line that overflows
/// because of following inline content.
///
/// Example (`html-tag-script-2`):
///   `  <script></script>{@html `...`}` (86 chars, overflows 80)
/// → `  <script\n  ></script>{@html `...`}`
///
/// Prettier-plugin-svelte breaks the `<tagname>` open tag to `<tagname\n{indent}>`
/// when the full line (element + following sibling content) would overflow. This
/// gives prettier a break point even though the element itself has nothing to split.
pub(super) fn try_break_empty_block_open_tag(
    out: &str,
    tag: &str,
    elem_start: u32,
    elem_end: u32,
    line_width: usize,
) -> Option<(u32, u32, String)> {
    let s = elem_start as usize;

    // The expected open tag is `<tagname>` with no attributes.
    let expected_open = format!("<{tag}>");
    let open_len = expected_open.len();
    let open_tag = out.get(s..s + open_len)?;
    if open_tag != expected_open {
        return None; // has attributes or not this form
    }
    let open_tag_end = s + open_len;

    // Check the line containing the element.
    let line_start = out[..s].rfind('\n').map_or(0, |i| i + 1);
    let line_end = out[elem_end as usize..]
        .find('\n')
        .map_or(out.len(), |i| elem_end as usize + i);
    let line = out.get(line_start..line_end)?;

    // Line must overflow.
    if line.width() <= line_width {
        return None;
    }

    // There must be non-whitespace content AFTER the element's close tag on this
    // line. If the element itself is the only thing on the line, this pass is not
    // needed (another pass handles that case).
    let after_elem = out.get(elem_end as usize..line_end)?;
    if after_elem.bytes().all(|b| b.is_ascii_whitespace()) {
        return None;
    }

    // The element must start at a pure-whitespace line prefix (it's at the indent
    // column, not following other inline content on the same line).
    let before = out.get(line_start..s)?;
    if !before.bytes().all(|b| b == b' ' || b == b'\t') {
        return None;
    }
    let indent = before;

    // Break: `<tagname\n{indent}>`
    let broken = format!("<{tag}\n{indent}>");
    Some((elem_start, open_tag_end as u32, broken))
}

/// Pass 1.95: re-collapse broken open tags whose single-line form now fits at
/// their current column. This undoes incorrect breaks from pass 1 that were
/// caused by a long preceding line; after pass 1.9 has broken inline elements
/// to shorten those lines, the previously-broken element may now sit at a
/// shorter column and fit on one line.
///
/// Example (TextDecoration.svelte): pass 1 broke the red `<Span>` open tag
/// because it was on the same 199-char line as the green `<Span>`. After pass
/// 1.9 broke the green `<Span>`, the red `<Span>` moved to a line starting
/// with `  >, ` (column 5). Its single-line form (74 chars) now fits: 5+74=79.
pub(super) fn collect_recollapse_open_tag(
    out: &str,
    fragment: &Fragment,
    line_width: usize,
    edits: &mut Vec<(u32, u32, String)>,
) {
    for node in &fragment.nodes {
        match node {
            TemplateNode::RegularElement(e) => {
                if is_whitespace_preserving(e.name.as_str()) {
                    continue;
                }
                if let Some(edit) = try_recollapse_open_tag(
                    out,
                    e.name.as_str(),
                    &e.attributes,
                    e.start,
                    &e.fragment,
                    line_width,
                ) {
                    edits.push(edit);
                }
                collect_recollapse_open_tag(out, &e.fragment, line_width, edits);
            }
            TemplateNode::Component(c) => {
                if let Some(edit) = try_recollapse_open_tag(
                    out,
                    c.name.as_str(),
                    &c.attributes,
                    c.start,
                    &c.fragment,
                    line_width,
                ) {
                    edits.push(edit);
                }
                collect_recollapse_open_tag(out, &c.fragment, line_width, edits);
            }
            _ => {
                for child in child_fragments(node) {
                    collect_recollapse_open_tag(out, child, line_width, edits);
                }
            }
        }
    }
}

pub(super) fn try_recollapse_open_tag(
    out: &str,
    tag: &str,
    attrs: &[rsvelte_core::ast::template::Attribute],
    elem_start: u32,
    fragment: &Fragment,
    line_width: usize,
) -> Option<(u32, u32, String)> {
    if attrs.is_empty() {
        return None;
    }
    let first = fragment.nodes.first()?;
    let open_tag_end = node_start(first) as usize;
    let open_tag = out.get(elem_start as usize..open_tag_end)?;

    // Open tag must be multi-line (contains `\n`) to be worth recollapsing.
    if !open_tag.contains('\n') {
        return None;
    }
    // Open tag must end with `>`.
    if !open_tag.ends_with('>') {
        return None;
    }

    // The element must have non-whitespace text before it on the same line.
    // Elements at line start were broken by pass 1 for their own reasons (e.g.,
    // a long attribute list) — we only recollapse elements that were broken
    // because of the long PRECEDING CONTEXT, which is reflected by having
    // non-whitespace content before them on the same line.
    let elem_start_usize = elem_start as usize;
    let line_start = out[..elem_start_usize].rfind('\n').map_or(0, |i| i + 1);
    let before = out.get(line_start..elem_start_usize)?;
    if before.is_empty() || before.bytes().all(|b| b == b' ' || b == b'\t') {
        return None; // element is at line start — don't recollapse
    }

    // Only recollapse when the content after `>` starts with whitespace
    // (hug_start=false). For hug_start=true elements, the multi-line open tag
    // is part of the hug break pattern and must not be collapsed back to a
    // single-line form — collapsing would inline the content and break the
    // close-tag `>` structure.
    let first_child_text = out.get(open_tag_end..node_end(first) as usize)?;
    if !first_child_text.starts_with([' ', '\t', '\r', '\n']) {
        return None; // hug_start=true — don't recollapse
    }

    // Build the single-line form: `<tag attr1 attr2>`.
    let mut single_line = format!("<{tag}");
    for attr in attrs {
        let (as_, ae) = attribute_span(attr);
        let atext = out.get(as_ as usize..ae as usize)?;
        // If any attribute is multi-line, can't collapse to single line.
        if atext.contains('\n') {
            return None;
        }
        single_line.push(' ');
        single_line.push_str(atext);
    }
    single_line.push('>');

    // Check if single-line form fits at the element's current column.
    let col = before.width();
    if col + single_line.width() > line_width {
        return None;
    }

    // Only emit if the forms differ.
    (single_line != open_tag).then_some((elem_start, open_tag_end as u32, single_line))
}

/// Split an attribute string (`attr1 attr2="val" attr3={expr}`) into individual
/// attribute tokens, respecting quoted values so spaces inside quotes don't split.
pub(super) fn split_open_tag_attrs(attrs: &str) -> Vec<&str> {
    let mut result = Vec::new();
    let mut start = 0;
    let mut in_quote = false;
    let mut quote_char = b'"';
    let bytes = attrs.as_bytes();
    for (i, &b) in bytes.iter().enumerate() {
        if in_quote {
            if b == quote_char {
                in_quote = false;
            }
        } else if b == b'"' || b == b'\'' {
            in_quote = true;
            quote_char = b;
        } else if b == b' ' {
            let attr = attrs[start..i].trim();
            if !attr.is_empty() {
                result.push(attr);
            }
            start = i + 1;
        }
    }
    let last = attrs[start..].trim();
    if !last.is_empty() {
        result.push(last);
    }
    result
}
