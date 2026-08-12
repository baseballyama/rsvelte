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
use crate::svelte2tsx::svelte2tsx::slice_src;
use crate::svelte2tsx::template::ctx::ElementOpenerCommentIndex;
use crate::svelte2tsx::template::nodes::attach_tag::format_attach_tag_segments;
use crate::svelte2tsx::template::segs::{
    Seg, segs_push_fmt, segs_push_lit, segs_push_src, segs_to_string,
};
use crate::svelte2tsx::template::utils::expr::{
    extend_expr_end_with_ts_postfix, get_expression_range, get_expression_text,
    get_set_binding_ranges,
};

use action::format_use_directive;
use attribute::{
    append_attribute_node_segments, format_attribute_node, trailing_attr_comment_segs,
    trailing_attr_comment_text,
};
use binding::{bind_is_filtered_from_props, format_bind_directive_segments};
use class_style::{format_class_directive, format_style_directive};
use event_handler::format_on_directive_segments;
use spread::{format_spread_attribute, format_spread_attribute_segments};
use transition::format_transition_directive;

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

/// String counterpart of [`splice_trailing_segs`].
fn splice_trailing_text(part: &mut String, trailing: &str) {
    if trailing.is_empty() {
        return;
    }
    let suffix_len = if part.ends_with("}),") {
        3
    } else if part.ends_with(',') {
        1
    } else {
        return;
    };
    part.insert_str(part.len() - suffix_len, trailing);
}

/// Build the attributes string for TSX output.
///
/// Returns the inner content for `{ ... }` in createElement or component props.
pub(super) fn build_attributes_string(
    attributes: &[Attribute],
    source: &str,
    comments: &ElementOpenerCommentIndex,
    in_slot_context: bool,
    preserve_case: bool,
) -> String {
    build_attributes_string_with_tag(
        attributes,
        source,
        comments,
        "",
        in_slot_context,
        preserve_case,
    )
}

pub(super) fn build_attributes_string_with_tag(
    attributes: &[Attribute],
    source: &str,
    comments: &ElementOpenerCommentIndex,
    parent_tag: &str,
    in_slot_context: bool,
    preserve_case: bool,
) -> String {
    let segs = build_attribute_segments(
        attributes,
        source,
        comments,
        parent_tag,
        in_slot_context,
        None,
        preserve_case,
    );
    segs_to_string(&segs, source)
}

/// Structured-bake counterpart of `build_attributes_string_with_tag`.
///
/// Emits the inner content of `{ ... }` in `createElement(name, { ... })`
/// as a list of `Seg`s. Source-bearing expressions (regular attribute
/// values, `on:` / `class:` / `style:` handlers, spreads, `@attach`
/// expressions) become `Seg::Src` so their column mapping survives the
/// element-opener overwrite. `bind:` directives stay as literals — their
/// expression also appears in `build_bind_directive_suffix` where the
/// column mapping is already exact.
pub(super) fn build_attribute_segments(
    attributes: &[Attribute],
    source: &str,
    comments: &ElementOpenerCommentIndex,
    parent_tag: &str,
    in_slot_context: bool,
    opener_content_start: Option<u32>,
    preserve_case: bool,
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
                append_attribute_node_segments(
                    &mut segs,
                    node,
                    source,
                    comments,
                    true,
                    parent_tag,
                    leading,
                    preserve_case,
                );
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
                    || !bind_is_filtered_from_props(&bind.name, parent_tag)
                {
                    let part = format_bind_directive_segments(bind, source);
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

/// Build the attributes/props string for a component, excluding `on:` directives.
///
/// `on:` directives on components become `.$on()` calls instead of props,
/// so they are filtered out here.
///
/// When `on:` directives are present but filtered out, a space is added inside
/// the empty braces to match the JS svelte2tsx output: `props: { }`.
pub(super) fn build_component_props_string(
    attributes: &[Attribute],
    source: &str,
    comments: &ElementOpenerCommentIndex,
    drop_slot: bool,
) -> String {
    let mut parts: Vec<String> = Vec::new();

    for attr in attributes {
        match attr {
            Attribute::Attribute(node) => {
                // `slot="foo"` stays a normal prop EXCEPT when this node is
                // being named-slot-routed by its parent component, where the
                // attribute is consumed by the `$$slot_def[...]` wrapper
                // instead (mirrors `build_component_props_segments`'s
                // `drop_slot`, and official's `element.parent instanceof
                // InlineComponent` check in `handleAttribute`).
                if node.name == "slot" && drop_slot {
                    continue;
                }
                // is_element=false: --* attrs are wrapped with __sveltets_2_cssProp
                // inside format_attribute_node (mirrors Attribute.ts `addProp`).
                parts.push(format_attribute_node(node, source, false));
            }
            Attribute::SpreadAttribute(spread) => {
                parts.push(format_spread_attribute(spread, source));
            }
            Attribute::BindDirective(bind) => {
                // `bind:foo={expr}` on a component becomes a regular prop
                // `foo:expr,` (no `bind:` prefix) — mirrors the JS reference
                // for InlineComponent. `bind:this` is filtered out; the
                // ensureBindings() helper is added at the call site.
                if bind.name == "this" {
                    continue;
                }
                // Shorthand `bind:value` (expression right after `bind:`) →
                // shorthand prop `value`; explicit `bind:foo={expr}` → `foo:expr`.
                let expr_range = get_expression_range(&bind.expression);
                let is_shorthand = get_set_binding_ranges(&bind.expression, source).is_none()
                    && expr_range.is_some_and(|(s, _)| {
                        s == bind.start
                            + u32::try_from("bind:".len()).expect("literal length fits in u32")
                    });
                if is_shorthand {
                    let (s, e) = expr_range.unwrap();
                    parts.push(format!("{},", slice_src(source, s as usize, e as usize)));
                } else {
                    // Preserve a trailing TS postfix (`bind:value={value as string}`) —
                    // the parser narrows it out of the expression span so we must extend
                    // manually (mirrors upstream Binding.ts using `attr.expression.end`
                    // which includes the full TSAsExpression span).
                    let expr_text = if let Some((s, e)) = get_expression_range(&bind.expression) {
                        let extended = extend_expr_end_with_ts_postfix(source, e, bind.end);
                        slice_src(source, s as usize, extended as usize)
                    } else {
                        get_expression_text(&bind.expression, source)
                    };
                    parts.push(format!("{}:{},", bind.name, expr_text));
                }
            }
            Attribute::OnDirective(_)
            | Attribute::LetDirective(_)
            | Attribute::AnimateDirective(_) => {
                // Excluded from component props - handled as $on() calls
            }
            Attribute::ClassDirective(class) => {
                parts.push(format_class_directive(class, source));
            }
            Attribute::StyleDirective(style) => {
                parts.push(format_style_directive(style, source));
            }
            Attribute::TransitionDirective(transition) => {
                parts.push(format_transition_directive(transition, source));
            }
            Attribute::UseDirective(use_dir) => {
                parts.push(format_use_directive(use_dir, source));
            }
            Attribute::AttachTag(attach) => {
                // `{@attach expr}` becomes `[Symbol("@attach")]:expr,`
                // — same prop-key form as on regular elements.
                let expr_text = get_expression_text(&attach.expression, source);
                parts.push(format!("[Symbol(\"@attach\")]:{expr_text},"));
            }
        }
    }

    if let Some(end) = opener_trailing_comment_range(attributes)
        && let Some(last) = parts.last_mut()
    {
        splice_trailing_text(last, &trailing_attr_comment_text(end, source, comments));
    }

    parts.join("")
}

/// Structured-bake variant of [`build_component_props_string`]. Same
/// shape — single value-or-empty leading space, `let:` spacers — but
/// surfaces every expression as a `Seg::Src` so the eventual
/// `emit_segmented_overwrite` keeps the per-character source map.
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
                    &mut inner, node, source, comments, false, "", "", false,
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
