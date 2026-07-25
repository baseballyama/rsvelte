use rsvelte_core::ast::js::Expression;
use rsvelte_core::ast::template::Attribute;
use unicode_width::UnicodeWidthStr;

use crate::error::FormatError;
use crate::options::FormatOptions;

use super::attribute::render_attribute;
use super::directive::format_expression_at;
use super::elements::{is_block_element, is_html_block_display_element, is_void_element};
use super::render_tag::{render_multi_line, render_one_line};
use super::util::{
    attribute_span, find_open_tag_end, indent_str, indent_visual_width, is_self_closing_inner,
    visual_width,
};

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

pub(super) fn push_open_tag(
    source: &str,
    element_start: u32,
    tag_name: &str,
    attributes: &[Attribute],
    this_expression: Option<&Expression>,
    depth: usize,
    empty_element: bool,
    // Inline element with a whitespace-only body (`<span> </span>`): its wrapped
    // open `>` glues to the last attribute line under `bracketSameLine`, unlike the
    // hug case (source-empty inline) whose `>` dedents onto its own line. See
    // [`is_empty_nonhug_element`].
    empty_nonhug: bool,
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

    // A source-empty `<textarea>` glues its `>` to the last attribute line by
    // default (`hug_open`), but prettier's empty `shouldHugStart && shouldHugEnd`
    // branch dangles the `>` onto its own line (`…"`\n`></textarea>`) when the glued
    // last line — `{indent}{last attr}></textarea>` — would exceed the print
    // width. (`<pre>` is a block element and always glues, so it is untouched.)
    // Detect that by rendering the glued form and measuring its last line plus
    // the `</textarea>` close width. `shape_two` handles the single-attribute
    // on-tag-line shape separately, so this only applies on the wrapped path.
    // A whitespace-*body* `<textarea>` (`empty_nonhug`) is exempt: the oracle keeps
    // its `>` glued in that shape (the body break / drop is handled in
    // `push_close_tag`), so the width-based dangle must not fire.
    let hug_open = if empty_element
        && !empty_nonhug
        && tag_name == "textarea"
        && wrapped
        && !shape_two
        && hug_open
    {
        let glued = render_multi_line(
            tag_name,
            &rendered_attrs,
            self_closing,
            depth,
            &options.js,
            true,
            options.bracket_same_line,
        );
        let last_line = glued.rsplit('\n').next().unwrap_or("");
        let close_width = tag_name.len() + 3; // "</" + name + ">"
        // Keep gluing (hug_open = true) only when it fits; otherwise dangle.
        visual_width(last_line) + close_width <= line_width
    } else {
        hug_open
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
            // A source-empty inline element (`shouldHugStart && shouldHugEnd`)
            // keeps its wrapped open `>` inside a hugged group that breaks onto its
            // own line (`…"`\n`></span>`), so it dedents even under
            // `bracketSameLine`. An inline element with a whitespace body
            // (`<span> </span>`, not a hug) instead glues `>` to the last attribute
            // line (`…">`), matching prettier's `group([...openingTag, '>', line, …])`.
            // A self-closing element (`<input … />`) always glues its ` />`.
            // A block-display element never hugs, so its `>` glues to the last
            // attribute under `bracketSameLine` even when empty (`<div …">`\n`</div>`,
            // vs the inline empty hug `></span>`). See #1721.
            options.bracket_same_line
                && (self_closing
                    || !empty_element
                    || empty_nonhug
                    || is_html_block_display_element(tag_name)),
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
