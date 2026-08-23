use crate::width::VisualWidth;
use rsvelte_core::ast::js::Expression;
use rsvelte_core::ast::template::Attribute;

use crate::error::FormatError;
use crate::options::FormatOptions;

use super::attribute::render_attribute;
use super::directive::format_expression_at;
use super::elements::{is_block_element, is_html_block_display_element, is_void_element};
use super::render_tag::{render_multi_line, render_one_line};
use super::util::{
    attribute_span, find_open_tag_end, indent_str, indent_visual_width, is_self_closing_inner,
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

enum ThisAttribute {
    Absent,
    Present(String),
    Unrenderable,
}

struct OpenTagLayoutPlan {
    shape_two: bool,
    wrapped: bool,
}

struct OpenTagShapeInput<'a> {
    tag_name: &'a str,
    rendered_attrs: &'a [String],
    element: OpenTagElementShape,
    constraints: OpenTagFormatConstraints,
    open_one_line_width: usize,
    one_liner: &'a str,
    line_width: usize,
}

struct OpenTagElementShape {
    self_closing: bool,
    hug_open: bool,
    empty: bool,
}
struct OpenTagFormatConstraints {
    has_line_comment: bool,
    force_single_attribute: bool,
}

impl OpenTagLayoutPlan {
    fn new(input: &OpenTagShapeInput<'_>) -> Self {
        let fit_width = if !input.element.self_closing
            && input.one_liner.ends_with('>')
            && (input.element.hug_open || input.element.empty)
        {
            input.open_one_line_width - 1
        } else {
            input.open_one_line_width
        };
        let open_fits = fit_width <= input.line_width;
        let fits_one_line = !input.constraints.has_line_comment
            && !input
                .rendered_attrs
                .iter()
                .any(|attribute| attribute.contains('\n'))
            && open_fits;
        let close_width = usize::from(input.element.empty && !input.element.self_closing)
            * (input.tag_name.len() + 3);
        let element_overflows =
            close_width > 0 && input.open_one_line_width + close_width > input.line_width;
        let shape_two = !input.rendered_attrs.is_empty()
            && fits_one_line
            && element_overflows
            && input.one_liner.ends_with('>')
            && !is_block_element(input.tag_name)
            && !input.constraints.force_single_attribute;
        let force_wrap_block = !input.rendered_attrs.is_empty()
            && fits_one_line
            && element_overflows
            && is_block_element(input.tag_name);
        let hug_overflow = input.rendered_attrs.is_empty()
            && input.element.hug_open
            && !input.element.self_closing
            && !open_fits;
        let wrapped = !(input.rendered_attrs.is_empty() || fits_one_line)
            || shape_two
            || force_wrap_block
            || hug_overflow
            || input.constraints.force_single_attribute;
        Self { shape_two, wrapped }
    }
}

struct OpenTagRenderer<'a> {
    source: &'a str,
    attributes: &'a [Attribute<'a>],
    options: &'a FormatOptions,
    attr_depth: usize,
    this_attr: Option<String>,
    comments: Vec<OpenTagComment>,
    order: Vec<(u32, OpenTagItem)>,
    regular_element: bool,
}

impl<'a> OpenTagRenderer<'a> {
    fn new(
        source: &'a str,
        element_start: u32,
        open_tag_end: u32,
        attributes: &'a [Attribute<'a>],
        this_attr: Option<String>,
        options: &'a FormatOptions,
        attr_depth: usize,
        regular_element: bool,
    ) -> Self {
        let comments = collect_open_tag_comments(source, element_start, open_tag_end, attributes);
        let mut order = Vec::with_capacity(attributes.len() + comments.len() + 1);
        if this_attr.is_some() {
            order.push((element_start, OpenTagItem::This));
        }
        for (index, attribute) in attributes.iter().enumerate() {
            order.push((attribute_span(attribute).0, OpenTagItem::Attr(index)));
        }
        for (index, comment) in comments.iter().enumerate() {
            order.push((comment.start, OpenTagItem::Comment(index)));
        }
        order.sort_by_key(|(start, _)| *start);
        Self {
            source,
            attributes,
            options,
            attr_depth,
            this_attr,
            comments,
            order,
            regular_element,
        }
    }

    fn has_line_comment(&self) -> bool {
        self.comments.iter().any(|comment| comment.is_line)
    }

    fn render_items(&self, wrapped: bool) -> Result<Vec<String>, FormatError> {
        self.order
            .iter()
            .map(|(_, item)| match item {
                OpenTagItem::This => Ok(self.this_attr.clone().unwrap_or_default()),
                OpenTagItem::Attr(index) => render_attribute(
                    &self.attributes[*index],
                    self.source,
                    self.options,
                    self.attr_depth,
                    wrapped,
                    self.regular_element,
                ),
                OpenTagItem::Comment(index) => Ok(self.comments[*index].text.clone()),
            })
            .collect()
    }
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
    let this_attr = if matches!(prev_byte, Some(b'"' | b'\'')) {
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

fn open_tag_layout(
    source: &str,
    open_tag_end: u32,
    tag_name: &str,
    attributes: &[Attribute],
    empty_element: bool,
) -> (bool, bool) {
    let last_attr_end = attributes
        .last()
        .map_or(0, |attribute| attribute_span(attribute).1);
    let self_closing = is_self_closing_inner(source, open_tag_end, last_attr_end)
        || is_void_element(tag_name)
        || (tag_name == "svelte:window" && empty_element);
    let component = tag_name.starts_with("svelte:")
        || tag_name
            .chars()
            .next()
            .is_some_and(|character| character.is_ascii_uppercase());
    let hugs_content = source
        .as_bytes()
        .get(open_tag_end as usize)
        .is_some_and(|byte| {
            if *byte == b'<' {
                component
                    && source
                        .as_bytes()
                        .get(open_tag_end as usize + 1)
                        .is_some_and(|next| *next != b'/')
            } else {
                !byte.is_ascii_whitespace()
            }
        });
    let hug_open = !self_closing
        && (matches!(tag_name, "pre" | "textarea")
            || (!is_block_element(tag_name) && hugs_content));
    (self_closing, hug_open)
}

fn open_tag_this_attribute(
    source: &str,
    expression: Option<&Expression>,
    options: &FormatOptions,
    attr_depth: usize,
) -> Result<ThisAttribute, FormatError> {
    match expression {
        None => Ok(ThisAttribute::Absent),
        Some(expression) => Ok(render_this_attr(source, expression, options, attr_depth)?
            .map_or(ThisAttribute::Unrenderable, ThisAttribute::Present)),
    }
}

fn open_tag_leading_indent(
    source: &str,
    element_start: u32,
    depth: usize,
    options: &FormatOptions,
) -> usize {
    let structural = indent_visual_width(depth, &options.js);
    if element_start > 0 && source.as_bytes().get(element_start as usize - 1) == Some(&b'}') {
        let line_start = source[..element_start as usize]
            .rfind('\n')
            .map_or(0, |index| index + 1);
        let source_column = source
            .get(line_start..element_start as usize)
            .map_or(0, |prefix| {
                prefix.visual_width(crate::width::tab_width(options))
            });
        structural.max(source_column)
    } else {
        structural
    }
}

fn open_tag_renderer<'a>(
    source: &'a str,
    element_start: u32,
    open_tag_end: u32,
    attributes: &'a [Attribute<'a>],
    this_attr: Option<String>,
    options: &'a FormatOptions,
    attr_depth: usize,
    regular_element: bool,
) -> OpenTagRenderer<'a> {
    OpenTagRenderer::new(
        source,
        element_start,
        open_tag_end,
        attributes,
        this_attr,
        options,
        attr_depth,
        regular_element,
    )
}

fn initial_open_tag_render<'a>(
    source: &'a str,
    element_start: u32,
    open_tag_end: u32,
    attributes: &'a [Attribute<'a>],
    this_attr: Option<String>,
    options: &'a FormatOptions,
    attr_depth: usize,
    regular_element: bool,
) -> Result<(OpenTagRenderer<'a>, bool, Vec<String>), FormatError> {
    let renderer = open_tag_renderer(
        source,
        element_start,
        open_tag_end,
        attributes,
        this_attr,
        options,
        attr_depth,
        regular_element,
    );
    let has_line_comment = renderer.has_line_comment();
    let rendered_attrs = renderer.render_items(false)?;
    Ok((renderer, has_line_comment, rendered_attrs))
}

fn one_line_open_tag(
    tag_name: &str,
    rendered_attrs: &[String],
    self_closing: bool,
    leading_indent: usize,
    tab_width: usize,
) -> (String, usize) {
    let text = render_one_line(tag_name, rendered_attrs, self_closing);
    let width = leading_indent + text.visual_width(tab_width);
    (text, width)
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
    // prettier-plugin-svelte's `class`-value whitespace collapse is keyed on the
    // parent being a `RegularElement`, which the tag name alone cannot decide
    // (`title` / `slot` are their own node types).
    regular_element: bool,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<bool, FormatError> {
    let tw = crate::width::tab_width(options);
    let this_end = this_expression.and_then(Expression::end);
    let Some(open_tag_end) = find_open_tag_end(source, element_start, attributes, this_end) else {
        return Ok(false);
    };

    let (self_closing, hug_open) =
        open_tag_layout(source, open_tag_end, tag_name, attributes, empty_element);

    // When the open tag wraps, each attribute renders at `depth + 1` indent, so
    // its value expression must make its wrap decision against a width narrowed
    // by that lead (#795).
    let attr_depth = depth + 1;

    // `this={X}` / `this="X"` is rendered once (its shape is identical in the
    // one-line and wrapped passes) and emitted first regardless of source
    // position.
    let this_attr = match open_tag_this_attribute(source, this_expression, options, attr_depth)? {
        ThisAttribute::Absent => None,
        ThisAttribute::Present(attribute) => Some(attribute),
        ThisAttribute::Unrenderable => return Ok(false),
    };

    let (renderer, has_line_comment, rendered_attrs) = initial_open_tag_render(
        source,
        element_start,
        open_tag_end,
        attributes,
        this_attr,
        options,
        attr_depth,
        regular_element,
    )?;

    let leading_indent_width = open_tag_leading_indent(source, element_start, depth, options);
    let line_width = options.js.line_width.value() as usize;
    let (one_liner, open_one_line_width) = one_line_open_tag(
        tag_name,
        &rendered_attrs,
        self_closing,
        leading_indent_width,
        tw,
    );

    let force_single_attr = options.attributes.single_attribute_per_line
        && (attributes.len() + usize::from(this_expression.is_some())) > 1;
    let shape_input = OpenTagShapeInput {
        tag_name,
        rendered_attrs: &rendered_attrs,
        element: OpenTagElementShape {
            self_closing,
            hug_open,
            empty: empty_element,
        },
        constraints: OpenTagFormatConstraints {
            has_line_comment,
            force_single_attribute: force_single_attr,
        },
        open_one_line_width,
        one_liner: &one_liner,
        line_width,
    };
    let plan = OpenTagLayoutPlan::new(&shape_input);
    let shape_two = plan.shape_two;
    let wrapped = plan.wrapped;

    // Second pass: once we know the open tag wraps (attributes each on their own
    // line at `attr_depth`), re-render the attributes narrowing each value
    // expression by its `name={` prefix so a long value breaks where prettier
    // does. Only the multi-line shape (not `shape_two`, whose attributes stay on
    // one line) needs this; one-line tags keep the inline rendering above.
    let rendered_attrs = if wrapped && !shape_two {
        renderer.render_items(true)?
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
        let closing_tag_width = tag_name.len() + 3; // "</" + name + ">"
        // Keep gluing (hug_open = true) only when it fits; otherwise dangle.
        last_line.visual_width(tw) + closing_tag_width <= line_width
    } else {
        hug_open
    };

    let open_tag_text = if shape_two {
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

    edits.push((element_start, open_tag_end, open_tag_text));
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
                start: crate::source_offset(start),
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
                start: crate::source_offset(start),
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
