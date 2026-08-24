//! Leading whitespace of the generated attribute/props object literal.
//!
//! Official svelte2tsx rewrites an opening tag with `MagicString` moves
//! (`htmlxtojsx_v2/utils/node-utils.ts::transform`): every kept source range is
//! moved to the end of the opener, and each run of source characters *between*
//! two kept ranges is collapsed to a single space that is moved there too —
//! ahead of the attribute chunks, because the gap moves run before the deferred
//! attribute moves. Those spaces therefore surface directly after the `, {` that
//! opens the attribute object, and their count is observable in the output
//! (`<div a="1" b="2">` → `createElement("div", {   "a":…`).
//!
//! rsvelte assembles the opener from segments rather than moves, so it has to
//! reproduce that count. This module models the kept ranges official would emit
//! for an opening tag and replays `transform`'s gap bookkeeping over them.

use crate::ast::template::{Attribute, AttributeValue, AttributeValuePart, BindDirective};
use crate::svelte2tsx::template::attributes::attribute::{
    leading_attr_comment_segs, trailing_attr_comment_segs,
};
use crate::svelte2tsx::template::ctx::ElementOpenerCommentIndex;
use crate::svelte2tsx::template::segs::Seg;
use crate::svelte2tsx::template::utils::expr::{
    extend_expr_end_with_ts_postfix, get_expression_end_stripping_ts, get_expression_range,
    get_set_binding_ranges,
};

type Range = (u32, u32);

fn source_offset(value: usize) -> u32 {
    u32::try_from(value).expect("template source offsets are represented as u32")
}

/// `oneWayBindingAttributes` in `htmlxtojsx_v2/nodes/Binding.ts`.
const ONE_WAY_BINDINGS: [&str; 10] = [
    "clientWidth",
    "clientHeight",
    "offsetWidth",
    "offsetHeight",
    "duration",
    "seeking",
    "ended",
    "readyState",
    "naturalWidth",
    "naturalHeight",
];

/// `oneWayBindingAttributesNotOnElement` in `htmlxtojsx_v2/nodes/Binding.ts`.
const ONE_WAY_BINDINGS_NOT_ON_ELEMENT: [&str; 7] = [
    "contentRect",
    "contentBoxSize",
    "borderBoxSize",
    "devicePixelContentBoxSize",
    "buffered",
    "played",
    "seekable",
];

/// The lowering context that decides how individual attributes are emitted.
#[derive(Clone, Copy)]
pub struct OpenerCtx<'a> {
    /// `Element` (HTML tag, `svelte:head`/`window`/…, `slot`, `svelte:element`)
    /// as opposed to `InlineComponent` (component, `svelte:component`,
    /// `svelte:self`). Several attribute handlers branch on this.
    pub is_element: bool,
    /// The node is slot content of an enclosing component, so `slot="…"` and
    /// `let:…` are lowered into the slot prologue instead of the attribute list.
    pub in_component_slot: bool,
    /// Tag name as written (`input` enables the `bind:group` special case).
    pub tag_name: &'a str,
    /// `<slot>`: its `name` attribute is consumed by the start transformation.
    pub is_slot_tag: bool,
    /// The `bind:` prefix survives into the emitted property name. Mirrors
    /// upstream's `preserveBind = options.typingsNamespace === 'svelteHTML'`;
    /// a custom typings namespace drops the prefix even on an element.
    pub preserve_bind: bool,
}

/// The two space runs an opening tag leaves behind.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct OpenerSpacing {
    /// Gaps that stay where they were, ahead of the generated `{ …createElement`.
    pub before_block: usize,
    /// Gaps moved to the end of the opener, which land right after the `{` that
    /// opens the attribute/props object.
    pub in_attr_object: usize,
}

/// Whitespace official svelte2tsx leaves around an opening tag's lowering.
///
/// `head` is the source range the element's `getStartTransformation()`
/// contributes (the tag name for a regular element, the `svelte:element` tag
/// expression, the `<slot>` name, the component name); `None` for the special
/// `svelte:head`/`window`/`body`/`options`/`fragment` elements and
/// `svelte:self`, which emit a pure string there.
#[allow(clippy::too_many_arguments)]
pub fn opener_spacing(
    source: &str,
    node_start: u32,
    tag_name: &str,
    transform_end: u32,
    head: Option<Range>,
    attributes: &[Attribute],
    comments: &ElementOpenerCommentIndex,
    ctx: OpenerCtx,
) -> OpenerSpacing {
    let tag_name_end = node_start + 1 + source_offset(tag_name.len());
    let mut ranges: Vec<Range> = Vec::with_capacity(attributes.len() * 2 + 2);
    if let Some(range) = head {
        ranges.push(range);
    }
    // `Element`/`InlineComponent` constructor: the whitespace right after the
    // tag name is kept (and marks the delete destination) so deleted characters
    // still map onto the attribute object.
    let delete_dest = source
        .as_bytes()
        .get(tag_name_end as usize)
        .filter(|b| b.is_ascii_whitespace())
        .map(|_| {
            ranges.push((tag_name_end, tag_name_end + 1));
            tag_name_end
        });

    let last = attributes.len().saturating_sub(1);
    for (index, attr) in attributes.iter().enumerate() {
        push_attribute_ranges(&mut ranges, attr, source, comments, index == last, &ctx);
    }

    count_gaps(node_start, transform_end, delete_dest, &ranges)
}

/// Spaces upstream leaves ahead of a closing tag's lowering.
///
/// `performTransformation` runs a second `transform` over `</name…>`, so the
/// same gaps collapse there. That array carries no delete marker, so no gap is
/// ever moved and all of them land before the generated `}`. `name_range` is the
/// `</Component>` → `Component}` mapping an `InlineComponent` keeps; elements and
/// the `svelte:` tags keep nothing and always collapse to a single space.
pub fn closing_tag_spacing(
    closing_tag_start: u32,
    node_end: u32,
    name_range: Option<Range>,
) -> usize {
    let ranges: Vec<Range> = name_range.into_iter().collect();
    count_gaps(closing_tag_start, node_end, None, &ranges).before_block
}

/// Replay of `transform`'s move/removal bookkeeping. Each run of source
/// characters between two kept ranges collapses to one space; whether that
/// space is moved to the end of the opener or stays in place decides which side
/// of the generated `{ …createElement(` it ends up on.
fn count_gaps(start: u32, end: u32, delete_dest: Option<u32>, ranges: &[Range]) -> OpenerSpacing {
    // A transformation is skipped as a move when it is zero-length, but it still
    // counts for the "does another transformation start here?" lookup that
    // decides whether a range swallows the character after it.
    let starts: Vec<u32> = ranges.iter().map(|&(s, _)| s).collect();
    let mut moves: Vec<Range> = Vec::with_capacity(ranges.len());
    for &(t_start, t_end) in ranges {
        if t_start == t_end {
            continue;
        }
        let t_end = if t_end + 1 < end && !starts.contains(&t_end) {
            t_end + 1
        } else {
            t_end
        };
        // Ranges past the opener (implicit snippet props reach into the
        // children) never produce a gap space and `transform` rewinds past them.
        if t_start < end {
            moves.push((t_start, t_end));
        }
    }
    moves.sort_by_key(|&(s, _)| s);
    let mut spacing = OpenerSpacing {
        before_block: 0,
        in_attr_object: 0,
    };
    // A gap only travels to the end of the opener when a delete destination was
    // recorded (the tag name is followed by whitespace) and it sits past it.
    let moved = |remove_start: u32| {
        delete_dest.is_some_and(|dest| remove_start > dest) && remove_start < end
    };
    let mut remove_start = start;
    for &(m_start, m_end) in &moves {
        if remove_start < m_start && m_start < end {
            if moved(remove_start) {
                spacing.in_attr_object += 1;
            } else {
                spacing.before_block += 1;
            }
        }
        remove_start = m_end;
    }
    if remove_start < end {
        // The first character after the last kept range is deleted outright.
        remove_start += 1;
    }
    if remove_start < end {
        if moved(remove_start) && remove_start + 1 < end {
            spacing.in_attr_object += 1;
        } else {
            spacing.before_block += 1;
        }
    }
    spacing
}

/// Kept source ranges for one attribute, mirroring the `htmlxtojsx_v2/nodes/*`
/// handler that lowers it.
fn push_attribute_ranges(
    out: &mut Vec<Range>,
    attr: &Attribute,
    source: &str,
    comments: &ElementOpenerCommentIndex,
    is_last: bool,
    ctx: &OpenerCtx,
) {
    // Both skip paths below bail before upstream reaches
    // `getLeadingCommentTransformation`, so they contribute no comment ranges.
    if let Attribute::Attribute(node) = attr {
        // `<slot name="…">` is consumed by the start transformation.
        if ctx.is_slot_tag && node.name == "name" {
            return;
        }
        if node.name == "slot"
            && ctx.in_component_slot
            && let AttributeValue::Sequence(parts) = &node.value
            && let [AttributeValuePart::Text(text)] = parts.as_slice()
        {
            // `addSlotName` keeps only the slot name text.
            out.push((text.start, text.end));
            return;
        }
    }
    push_comment_ranges(
        out,
        attribute_start(attr),
        attribute_end(attr),
        source,
        comments,
        is_last,
    );

    match attr {
        Attribute::Attribute(node) => push_plain_attribute_ranges(out, node, source),
        Attribute::SpreadAttribute(spread) => {
            out.push((spread.start + 1, spread.end - 1));
        }
        Attribute::AttachTag(attach) => {
            if let Some(range) = get_expression_range(&attach.expression) {
                out.push(range);
            }
        }
        Attribute::BindDirective(bind) => push_binding_ranges(out, bind, source, ctx),
        Attribute::OnDirective(on) => {
            push_named_directive_ranges(out, on.start, &on.name, on.expression.as_ref(), source);
        }
        Attribute::ClassDirective(class) => {
            if let Some((s, e)) = get_expression_range(&class.expression) {
                out.push(with_trailing_property_access(source, s, e));
            }
        }
        Attribute::StyleDirective(style) => match &style.value {
            AttributeValue::True(_) => {
                out.push((directive_name_start(source, style.start), style.end));
            }
            AttributeValue::Expression(tag) => {
                out.push((tag.start + 1, tag.end - 1));
            }
            AttributeValue::Sequence(parts) => match parts.as_slice() {
                [] => out.push((directive_name_start(source, style.start), style.end)),
                [AttributeValuePart::Text(text)] => out.push((text.start, text.end)),
                [AttributeValuePart::ExpressionTag(tag)] => out.push((tag.start + 1, tag.end - 1)),
                parts => out.push((
                    value_part_start(&parts[0]),
                    value_part_end(&parts[parts.len() - 1]),
                )),
            },
        },
        Attribute::TransitionDirective(directive) => push_named_directive_ranges(
            out,
            directive.start,
            &directive.name,
            directive.expression.as_ref(),
            source,
        ),
        Attribute::AnimateDirective(directive) => push_named_directive_ranges(
            out,
            directive.start,
            &directive.name,
            directive.expression.as_ref(),
            source,
        ),
        Attribute::UseDirective(directive) => push_named_directive_ranges(
            out,
            directive.start,
            &directive.name,
            directive.expression.as_ref(),
            source,
        ),
        Attribute::LetDirective(let_dir) => {
            let name_start = let_dir.start + 4; // `let:`
            let is_slot_let = !ctx.is_element || ctx.in_component_slot;
            if is_slot_let {
                out.push((name_start, name_start + source_offset(let_dir.name.len())));
            } else {
                // A `let:` outside a component is lowered as a plain attribute,
                // whose name range covers the `let:` prefix too.
                out.push((
                    let_dir.start,
                    name_start + source_offset(let_dir.name.len()),
                ));
            }
            if let Some(expr) = &let_dir.expression
                && let Some(range) = get_expression_range(expr)
            {
                out.push(range);
            }
        }
    }
}

fn push_named_directive_ranges(
    out: &mut Vec<Range>,
    start: u32,
    name: &str,
    expression: Option<&crate::ast::js::Expression<'_>>,
    source: &str,
) {
    let name_start = directive_name_start(source, start);
    out.push((name_start, name_start + source_offset(name.len())));
    if let Some(expression) = expression
        && let Some((start, end)) = get_expression_range(expression)
    {
        out.push(with_trailing_property_access(source, start, end));
    }
}

fn push_plain_attribute_ranges(
    out: &mut Vec<Range>,
    node: &crate::ast::AttributeNode<'_>,
    source: &str,
) {
    if let AttributeValue::Expression(tag) = &node.value
        && tag.start == node.start + 1
    {
        if let Some((s, e)) = get_expression_range(&tag.expression) {
            out.push(if s == e {
                (s.saturating_sub(1), e)
            } else {
                (s, e)
            });
        }
        return;
    }
    out.push((node.start, node.start + source_offset(node.name.len())));
    match &node.value {
        AttributeValue::True(_) => {}
        AttributeValue::Expression(tag) => {
            if let Some((s, e)) = get_expression_range(&tag.expression) {
                out.push(with_trailing_property_access(
                    source,
                    s,
                    extend_expr_end_with_ts_postfix(source, e, node.end),
                ));
            }
        }
        AttributeValue::Sequence(parts) => match parts.as_slice() {
            [] => {}
            [AttributeValuePart::Text(text)] => out.push(if text.start == text.end {
                (text.start.saturating_sub(1), text.end + 1)
            } else {
                (text.start, text.end)
            }),
            [AttributeValuePart::ExpressionTag(tag)] => {
                if let Some((s, e)) = get_expression_range(&tag.expression) {
                    out.push(with_trailing_property_access(source, s, e));
                }
            }
            parts => out.push((
                value_part_start(&parts[0]),
                value_part_end(&parts[parts.len() - 1]),
            )),
        },
    }
}

fn push_binding_ranges(out: &mut Vec<Range>, bind: &BindDirective, source: &str, ctx: &OpenerCtx) {
    let Some((expr_start, expr_end)) = get_expression_range(&bind.expression) else {
        return;
    };
    let get_set = get_set_binding_ranges(&bind.expression, source);
    let stripped_end =
        get_expression_end_stripping_ts(&bind.expression, source).unwrap_or(expr_end);

    // `appendOneWayBinding`: `expr = <assignment>;`, with the stripped-off TS
    // annotation re-emitted as a second range.
    let push_one_way = |out: &mut Vec<Range>| {
        out.push((expr_start, stripped_end));
        if stripped_end < expr_end {
            out.push((stripped_end, expr_end));
        }
    };

    if bind.name == "this" {
        match get_set {
            Some((_, set)) => out.push(set),
            None => push_one_way(out),
        }
        return;
    }

    if get_set.is_none() && ctx.is_element {
        if bind.name == "group" && ctx.tag_name == "input" {
            push_one_way(out);
            return;
        }
        if ONE_WAY_BINDINGS.contains(&bind.name.as_str()) {
            push_one_way(out);
            return;
        }
        if ONE_WAY_BINDINGS_NOT_ON_ELEMENT.contains(&bind.name.as_str()) {
            out.push((expr_start, stripped_end));
            return;
        }
    }

    let name_start = bind.start + 5; // `bind:`
    // The `svelteHTML` typings namespace (the default) keeps the `bind:` prefix
    // in the emitted property name on elements, which widens the name range.
    let preserve_bind = ctx.is_element && ctx.preserve_bind;
    if expr_start == name_start {
        // Shorthand `bind:value`.
        if preserve_bind {
            out.push(with_trailing_property_access(source, expr_start, expr_end));
        } else {
            // The name IS the expression; there is no separate value.
            out.push((expr_start, expr_end));
        }
        return;
    }
    let equals = source_offset(source[..=expr_start as usize].rfind('=').unwrap_or(0));
    out.push((
        if preserve_bind {
            bind.start
        } else {
            name_start
        },
        equals,
    ));
    match get_set {
        Some((get, set)) => {
            out.push(get);
            out.push(with_trailing_property_access(source, set.0, set.1));
        }
        None => out.push(with_trailing_property_access(source, expr_start, expr_end)),
    }
}

/// `getLeadingCommentTransformation` / `getTrailingCommentTransformation`.
fn push_comment_ranges(
    out: &mut Vec<Range>,
    attr_start: u32,
    attr_end: u32,
    source: &str,
    comments: &ElementOpenerCommentIndex,
    is_last: bool,
) {
    if comments.is_empty() {
        return;
    }
    let mut segs = leading_attr_comment_segs(attr_start, source, comments);
    if is_last {
        segs.extend(trailing_attr_comment_segs(attr_end, source, comments));
    }
    out.extend(segs.into_iter().filter_map(|seg| match seg {
        Seg::Src(s, e) => Some((s, e)),
        Seg::Lit(_) => None,
    }));
}

/// Position right after the `:` that separates a directive's kind from its name.
fn directive_name_start(source: &str, node_start: u32) -> u32 {
    source[node_start as usize..]
        .find(':')
        .map_or(node_start, |offset| node_start + source_offset(offset) + 1)
}

/// `withTrailingPropertyAccess`: a member access left dangling behind the parsed
/// expression (an artifact of svelte2tsx's pre-parse) is pulled back in.
fn with_trailing_property_access(source: &str, start: u32, end: u32) -> Range {
    let bytes = source.as_bytes();
    let mut i = end as usize;
    while i < bytes.len() {
        let ch = bytes[i];
        if ch.is_ascii_whitespace() {
            i += 1;
            continue;
        }
        if ch == b'.' {
            return (start, source_offset(i) + 1);
        }
        if ch == b'?' && bytes.get(i + 1) == Some(&b'.') {
            return (start, source_offset(i) + 2);
        }
        break;
    }
    (start, end)
}

const fn value_part_start(part: &AttributeValuePart) -> u32 {
    match part {
        AttributeValuePart::Text(text) => text.start,
        AttributeValuePart::ExpressionTag(tag) => tag.start,
    }
}

const fn value_part_end(part: &AttributeValuePart) -> u32 {
    match part {
        AttributeValuePart::Text(text) => text.end,
        AttributeValuePart::ExpressionTag(tag) => tag.end,
    }
}

const fn attribute_start(attr: &Attribute) -> u32 {
    match attr {
        Attribute::Attribute(node) => node.start,
        Attribute::SpreadAttribute(spread) => spread.start,
        Attribute::AttachTag(attach) => attach.start,
        Attribute::BindDirective(bind) => bind.start,
        Attribute::OnDirective(on) => on.start,
        Attribute::ClassDirective(class) => class.start,
        Attribute::StyleDirective(style) => style.start,
        Attribute::TransitionDirective(transition) => transition.start,
        Attribute::AnimateDirective(animate) => animate.start,
        Attribute::UseDirective(use_dir) => use_dir.start,
        Attribute::LetDirective(let_dir) => let_dir.start,
    }
}

const fn attribute_end(attr: &Attribute) -> u32 {
    match attr {
        Attribute::Attribute(node) => node.end,
        Attribute::SpreadAttribute(spread) => spread.end,
        Attribute::AttachTag(attach) => attach.end,
        Attribute::BindDirective(bind) => bind.end,
        Attribute::OnDirective(on) => on.end,
        Attribute::ClassDirective(class) => class.end,
        Attribute::StyleDirective(style) => style.end,
        Attribute::TransitionDirective(transition) => transition.end,
        Attribute::AnimateDirective(animate) => animate.end,
        Attribute::UseDirective(use_dir) => use_dir.end,
        Attribute::LetDirective(let_dir) => let_dir.end,
    }
}
