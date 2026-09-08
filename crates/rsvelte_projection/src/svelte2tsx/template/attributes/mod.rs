//! Attribute and directive emission.
//!
//! This module assembles an element / component opener's attribute list; the
//! submodules format the individual attribute and directive kinds.

pub(super) mod action;
pub(super) mod attribute;
pub(super) mod binding;
pub(super) mod class_style;
pub(super) mod directive_suffix;
pub(super) mod event_handler;
pub(super) mod let_;
pub(super) mod spread;
pub(super) mod svg;
pub(super) mod transition;

use crate::ast::template::Attribute;
use crate::svelte2tsx::template::ctx::ElementOpenerCommentIndex;
use crate::svelte2tsx::template::nodes::attach_tag::format_attach_tag_segments;
use crate::svelte2tsx::template::segs::{
    Seg, segs_push_fmt, segs_push_lit, segs_push_lit_open, segs_push_src,
};
use crate::svelte2tsx::template::utils::expr::{
    extend_expr_end_with_ts_postfix, get_expression_range, get_expression_text,
    get_set_binding_ranges,
};

use attribute::{AttrHost, append_attribute_node_segments, trailing_attr_comment_segs};
use binding::{bind_is_filtered_from_props, format_bind_directive_segments};
use event_handler::format_on_directive_segments;
use spread::format_spread_attribute_segments;

/// End offset of an attribute or directive in the element opener.
pub(super) const fn attribute_end(attr: &Attribute) -> u32 {
    match attr {
        Attribute::Attribute(n) => n.end,
        Attribute::SpreadAttribute(n) => n.end,
        Attribute::AttachTag(n) => n.end,
        Attribute::BindDirective(n) => n.end,
        Attribute::OnDirective(n) => n.end,
        Attribute::ClassDirective(n) => n.end,
        Attribute::StyleDirective(n) => n.end,
        Attribute::TransitionDirective(n) => n.end,
        Attribute::AnimateDirective(n) => n.end,
        Attribute::UseDirective(n) => n.end,
        Attribute::LetDirective(n) => n.end,
    }
}

/// The opener's trailing comments, but only for the attribute kinds that emit
/// into the props object — the directives lowered to statements after the
/// `createElement(…)` call have no value site to hang them off.
fn opener_trailing_comment_range(attributes: &[Attribute]) -> Option<u32> {
    match attributes.last()? {
        Attribute::ClassDirective(_)
        | Attribute::StyleDirective(_)
        | Attribute::TransitionDirective(_)
        | Attribute::AnimateDirective(_)
        | Attribute::UseDirective(_) => None,
        last => Some(attribute_end(last)),
    }
}

/// Insert `trailing` just before the emitted part's closing `,` (and inside a
/// `...__sveltets_2_empty({…})` / `…cssProp({…})` wrapper), mirroring official's
/// `addAttribute(name, [value, ...trailingComments])` placement.
fn splice_trailing_segs(segs: &mut Vec<Seg>, trailing: &[Seg]) {
    if trailing.is_empty() {
        return;
    }
    let Some(Seg::Lit(last)) = segs.last().cloned() else {
        return;
    };
    let suffix_len = if last.ends_with("}),") {
        3
    } else if last.ends_with(',') {
        1
    } else {
        return;
    };
    let (head, tail) = last.split_at(last.len() - suffix_len);
    let tail = tail.to_string();
    segs.pop();
    if !head.is_empty() {
        segs.push(Seg::Lit(head.to_string()));
    }
    segs.extend(trailing.iter().cloned());
    segs.push(Seg::Lit(tail));
}

/// Structured-bake counterpart of `build_attributes_string_with_tag`.
///
/// Emits the inner content of `{ ... }` in `createElement(name, { ... })`
/// as a list of `Seg`s. Source-bearing expressions (regular attribute
/// values, `on:` / `class:` / `style:` handlers, spreads, `@attach`
/// expressions) become `Seg::Src` so their column mapping survives the
/// element-opener overwrite. A `bind:` directive's prop value is a `Seg::Src`
/// too (`format_bind_directive_segments`), which is what upstream's
/// `rangeWithTrailingPropertyAccess` emits; the branches that contribute no
/// prop at all are mapped by `bind_directive_suffix_segs` instead.
pub(super) fn build_attribute_segments(
    attributes: &[Attribute],
    source: &str,
    comments: &ElementOpenerCommentIndex,
    in_slot_context: bool,
    opener_content_start: Option<u32>,
    host: AttrHost,
    preserve_bind: bool,
) -> Vec<Seg> {
    let mut segs: Vec<Seg> = Vec::with_capacity(attributes.len().saturating_mul(2));
    let mut any_pushed = false;
    // Position immediately after the previous attribute (or after the tag name
    // for the first attribute). Used to recover a comment that precedes a
    // `data-*` attribute in the element opener.
    let mut prev_end = opener_content_start;

    let push_with_separator = |segs: &mut Vec<Seg>, inner: Vec<Seg>| {
        if inner.is_empty() {
            return;
        }
        for s in inner {
            match s {
                Seg::Lit(t) => segs_push_lit(segs, &t),
                Seg::LitOpen(t) => segs_push_lit_open(segs, &t),
                Seg::Src(a, b) => segs_push_src(segs, a, b),
            }
        }
    };

    for attr in attributes {
        match attr {
            Attribute::Attribute(node) => {
                // A comment in the opener between the previous attribute and this
                // one (`<div data-one="1" // c\n data-two="2">`) is preserved
                // inside this attribute's `__sveltets_2_empty({ … })` wrapper.
                let leading = match prev_end {
                    Some(pe) if pe <= node.start => {
                        let slice = source.get(pe as usize..node.start as usize).unwrap_or("");
                        if slice.contains("/*") || slice.contains("//") {
                            slice
                        } else {
                            ""
                        }
                    }
                    _ => "",
                };
                append_attribute_node_segments(&mut segs, node, source, comments, host, leading);
                any_pushed = true;
                prev_end = Some(node.end);
            }
            Attribute::SpreadAttribute(spread) => {
                push_with_separator(&mut segs, format_spread_attribute_segments(spread, source));
                any_pushed = true;
            }
            Attribute::BindDirective(bind) => {
                // A get/set binding stays a `"bind:…": __sveltets_2_get_set_binding(…)`
                // prop even on one-way binding attributes (`clientWidth`), since
                // official's one-way lowering only applies to non-get/set bindings.
                let is_get_set = get_set_binding_ranges(&bind.expression, source).is_some();
                // `bind:this` (even as get/set) is never a prop — it's lowered to
                // an element-var assignment. The get/set exception only keeps
                // one-way binding *attributes* (clientWidth, …) as props.
                if (is_get_set && bind.name != "this")
                    || !bind_is_filtered_from_props(&bind.name, host.tag())
                {
                    let part = format_bind_directive_segments(bind, source, preserve_bind);
                    push_with_separator(&mut segs, part);
                    any_pushed = true;
                }
            }
            Attribute::OnDirective(on) => {
                let part = format_on_directive_segments(on, source);
                push_with_separator(&mut segs, part);
                any_pushed = true;
            }
            Attribute::ClassDirective(_)
            | Attribute::StyleDirective(_)
            | Attribute::TransitionDirective(_)
            | Attribute::UseDirective(_)
            | Attribute::AnimateDirective(_) => {
                // `class:`/`style:` are directives, not attributes — they must
                // NOT be emitted as `HTMLProps` keys (the props object is
                // type-checked against `HTMLProps<tag, …>`, which has no
                // `class:NAME` / `style:PROP` keys, so they would trip the
                // excess-property check). They are lowered to statements
                // appended *after* the `createElement(...)` call by
                // `build_class_style_directive_suffix_segments`, mirroring
                // upstream `htmlxtojsx_v2/nodes/{Class,StyleDirective}.ts`.
            }
            Attribute::LetDirective(let_dir) => {
                // A `let:` directive on an element that is NOT a slot receiver
                // (not a direct/through-block child of a component — `slot_inst`
                // is unset) is a regular, deprecated attribute: `"let:x": true`
                // (or the expression). In a slot context it is consumed by the
                // `$$slot_def` destructure, so emit nothing. Mirrors official
                // `Let.ts` `handleLet`'s else branch.
                if !in_slot_context {
                    let mut part: Vec<Seg> = Vec::new();
                    if let Some(ref expr) = let_dir.expression {
                        segs_push_fmt(&mut part, format_args!("\"let:{}\":", let_dir.name));
                        if let Some((s, e)) = get_expression_range(expr) {
                            segs_push_src(&mut part, s, e);
                        } else {
                            segs_push_lit(&mut part, get_expression_text(expr, source));
                        }
                        segs_push_lit(&mut part, ",");
                    } else {
                        segs_push_fmt(&mut part, format_args!("\"let:{}\":true,", let_dir.name));
                    }
                    push_with_separator(&mut segs, part);
                    any_pushed = true;
                }
            }
            Attribute::AttachTag(attach) => {
                let part = format_attach_tag_segments(attach, source);
                push_with_separator(&mut segs, part);
                any_pushed = true;
            }
        }
    }

    if any_pushed && let Some(end) = opener_trailing_comment_range(attributes) {
        let trailing = trailing_attr_comment_segs(end, source, comments);
        splice_trailing_segs(&mut segs, &trailing);
    }

    // The leading whitespace inside `{ … }` is not per-attribute: it is the
    // opening tag's collapsed source gaps, counted by `opener_spacing`.
    segs
}

/// A component's `props: { … }` entries as segments: one value-or-empty
/// leading space and `let:` spacers, with every expression surfaced as a
/// `Seg::Src` so `emit_segmented_overwrite` keeps its source mapping.
pub(super) fn build_component_props_segments(
    attributes: &[Attribute],
    source: &str,
    comments: &ElementOpenerCommentIndex,
    drop_slot: bool,
) -> Vec<Seg> {
    let mut inner: Vec<Seg> = Vec::with_capacity(attributes.len().saturating_mul(2));

    let extend_segs = |dst: &mut Vec<Seg>, src: Vec<Seg>| {
        for s in src {
            match s {
                Seg::Lit(t) => segs_push_lit(dst, &t),
                Seg::LitOpen(t) => segs_push_lit_open(dst, &t),
                Seg::Src(a, b) => segs_push_src(dst, a, b),
            }
        }
    };

    for attr in attributes {
        match attr {
            Attribute::Attribute(node) => {
                // `slot="foo"` stays a normal `slot` prop on the component
                // EXCEPT when the component is being named-slot-routed by its
                // parent (static `slot=` inside a parent component), where the
                // attribute is consumed by the `$$slot_def[...]` wrapper.
                if node.name == "slot" && drop_slot {
                    continue;
                }
                // is_element=false: --* attrs get __sveltets_2_cssProp wrapping
                // inside append_attribute_node_segments (mirrors Attribute.ts).
                // Components preserve attribute-name case, so the tag is unused.
                append_attribute_node_segments(
                    &mut inner,
                    node,
                    source,
                    comments,
                    AttrHost::Component,
                    "",
                );
            }
            Attribute::SpreadAttribute(spread) => {
                extend_segs(&mut inner, format_spread_attribute_segments(spread, source));
            }
            Attribute::BindDirective(bind) => {
                if bind.name == "this" {
                    continue;
                }
                // Mirror official Binding.ts: a *shorthand* component binding
                // (`bind:value`, no `={…}`) becomes a shorthand object property
                // — just the bound expression (`value`), not `value:value`. The
                // shorthand test is whether the expression starts immediately
                // after `bind:`. Explicit `bind:foo={expr}` stays `foo:expr,`.
                let expr_range = get_expression_range(&bind.expression);
                let is_shorthand = get_set_binding_ranges(&bind.expression, source).is_none()
                    && expr_range.is_some_and(|(s, _)| {
                        s == bind.start
                            + u32::try_from("bind:".len()).expect("literal length fits in u32")
                    });
                if is_shorthand {
                    let (s, e) = expr_range.unwrap();
                    segs_push_src(&mut inner, s, e);
                    segs_push_lit(&mut inner, ",");
                    continue;
                }
                // Component-side bind:foo={expr} → foo:expr, (no quotes,
                // no `bind:` prefix). Mirrors the JS reference.
                segs_push_fmt(&mut inner, format_args!("{}:", bind.name));
                if let Some(((gs, ge), (ss, se))) = get_set_binding_ranges(&bind.expression, source)
                {
                    // Svelte 5 function binding `bind:foo={getFn, setFn}` →
                    // `foo:__sveltets_2_get_set_binding(getFn, setFn),` so both
                    // callables are type-checked against the bindable prop type
                    // (mirrors `handleBinding`'s `isGetSetBinding` branch in
                    // `htmlxtojsx_v2/nodes/Binding.ts`). Splicing the raw
                    // `getFn, setFn` tuple into the props literal would produce
                    // invalid TSX (issue #726).
                    segs_push_lit(&mut inner, "__sveltets_2_get_set_binding(");
                    segs_push_src(&mut inner, gs, ge);
                    segs_push_lit(&mut inner, ",");
                    segs_push_src(&mut inner, ss, se);
                    segs_push_lit(&mut inner, ")");
                } else if let Some((s, e)) = get_expression_range(&bind.expression) {
                    // Preserve a trailing TS postfix (`bind:value={value as string}`)
                    // the parser narrowed out of the expression span.
                    let extended = extend_expr_end_with_ts_postfix(source, e, bind.end);
                    segs_push_src(&mut inner, s, extended);
                } else {
                    segs_push_lit(&mut inner, get_expression_text(&bind.expression, source));
                }
                segs_push_lit(&mut inner, ",");
            }
            Attribute::OnDirective(_)
            | Attribute::ClassDirective(_)
            | Attribute::StyleDirective(_)
            | Attribute::TransitionDirective(_)
            | Attribute::UseDirective(_)
            | Attribute::LetDirective(_)
            | Attribute::AnimateDirective(_) => {
                // Excluded from component props - handled as $on() calls.
            }
            Attribute::AttachTag(attach) => {
                let part = format_attach_tag_segments(attach, source);
                extend_segs(&mut inner, part);
            }
        }
    }

    if let Some(end) = opener_trailing_comment_range(attributes) {
        let trailing = trailing_attr_comment_segs(end, source, comments);
        splice_trailing_segs(&mut inner, &trailing);
    }

    inner
}
