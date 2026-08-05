//! Named-slot children of a component and the `$$slot_def` lowering.
//! Mirrors `htmlxtojsx_v2/nodes/slot.ts` and `Let.ts`.

use crate::ast::template::{
    Attribute, AttributeValue, AttributeValuePart, Component, Fragment, RegularElement,
    SvelteComponentElement, SvelteElement, TemplateNode,
};
use crate::svelte2tsx::magic_string::MagicString;
use crate::svelte2tsx::svelte2tsx::{Svelte2TsxOptions, slice_src};

use crate::svelte2tsx::template::attributes::attribute::format_attribute_node;
use crate::svelte2tsx::template::attributes::binding::format_bind_directive;
use crate::svelte2tsx::template::attributes::class_style::build_class_style_directive_suffix_segments;
use crate::svelte2tsx::template::attributes::event_handler::format_on_directive;
use crate::svelte2tsx::template::attributes::let_::{
    build_let_destructure_string, has_let_directives,
};
use crate::svelte2tsx::template::attributes::spread::format_spread_attribute;
use crate::svelte2tsx::template::attributes::transition::format_transition_directive;
use crate::svelte2tsx::template::ctx::{Counter, TemplateNodeExt};
use crate::svelte2tsx::template::segs::segs_to_string;
use crate::svelte2tsx::template::utils::expr::get_expression_range;
use crate::svelte2tsx::template::utils::opener_spacing::{OpenerCtx, opener_spacing};
use crate::svelte2tsx::template::utils::source::{find_closing_tag_start, find_opening_tag_end};
use crate::svelte2tsx::template::walk::{process_fragment_inplace, process_node_inplace};

use super::inline_component::{handle_component, handle_svelte_component, handle_svelte_self};
use super::slot_element::slot_attr_static_name;
use crate::svelte2tsx::template::attributes::action::format_use_directive;

/// True if `attributes` contains a `slot` attribute whose value is anything
/// other than the static string `"default"` — i.e. a *non-default* slot target.
///
/// Mirrors official `handleImplicitChildren`'s skip condition:
/// `a.name === 'slot' && a.value[0]?.data !== 'default'`. A dynamic
/// `slot={foo}` (no static `.data`) counts as non-default, as does any static
/// `slot="name"` except `slot="default"`.
pub(crate) fn has_non_default_slot_attr(attributes: &[Attribute], _source: &str) -> bool {
    for attr in attributes {
        if let Attribute::Attribute(node) = attr
            && node.name == "slot"
        {
            // Read the static text data of the first value part, if any.
            let value0_data: Option<String> = match &node.value {
                AttributeValue::Sequence(parts) => match parts.first() {
                    Some(AttributeValuePart::Text(text)) => Some(text.raw.to_string()),
                    _ => None,
                },
                _ => None,
            };
            return value0_data.as_deref() != Some("default");
        }
    }
    false
}

/// Check if a component's fragment has meaningful children for slot purposes.
///
/// Returns true if the component has any non-text children, or text children
/// with non-whitespace content.
pub(crate) fn has_component_slot_children(fragment: &Fragment, source: &str) -> bool {
    for node in &fragment.nodes {
        match node {
            TemplateNode::Text(text) => {
                // Use the DECODED `text.data` (HTML entities resolved), not the
                // raw source: `&nbsp;` decodes to U+00A0 which IS whitespace, so
                // `<Component>&nbsp;</Component>` has no meaningful default-slot
                // content and must not get a synthetic `children` prop. Mirrors
                // upstream `handleImplicitChildren`'s `node.data` check.
                if text.data.chars().any(|c| !c.is_whitespace()) {
                    return true;
                }
            }
            // `{#snippet}` blocks are passed as implicit *props*, not as
            // default-slot content, so they must not trigger the synthetic
            // `children` prop (which would otherwise produce a false
            // `'children' does not exist in type '$$ComponentProps'`).
            // Comments are likewise ignorable. Mirrors upstream
            // `handleImplicitChildren`, which skips `SnippetBlock` / `Comment`
            // and only fakes a `children` prop for a real default-slot child.
            TemplateNode::SnippetBlock(_) | TemplateNode::Comment(_) => {}
            // A `<slot>` child never contributes default-slot content — official
            // `handleImplicitChildren` skips every `child.type === 'Slot'`
            // unconditionally (it forwards a slot, it isn't slotted content).
            TemplateNode::SlotElement(_) => {}
            // Non-default-slot children (`<el slot="name">`, `slot={dynamic}`,
            // `<svelte:fragment slot="name">`, etc.) populate their slot, NOT
            // the default `children` prop, so they must not trigger the
            // synthetic `children`. Only default-slot content (no `slot=`, or
            // `slot="default"`) counts. Mirrors upstream `handleImplicitChildren`
            // which skips any child whose `slot` value isn't `"default"`.
            TemplateNode::RegularElement(el)
                if has_non_default_slot_attr(&el.attributes, source) => {}
            TemplateNode::Component(c) if has_non_default_slot_attr(&c.attributes, source) => {}
            TemplateNode::SvelteFragment(f) if has_non_default_slot_attr(&f.attributes, source) => {
            }
            TemplateNode::SvelteElement(e) if has_non_default_slot_attr(&e.attributes, source) => {}
            TemplateNode::SvelteSelf(s) if has_non_default_slot_attr(&s.attributes, source) => {}
            TemplateNode::SvelteComponent(sc)
                if has_non_default_slot_attr(&sc.attributes, source) => {}
            _ => return true,
        }
    }
    false
}

/// The `let:`-bearing attributes of an *element-kind* node — every node official
/// svelte2tsx models as an `Element` (`Element` / `Slot` / `SlotTemplate` /
/// `Title` / the `svelte:` meta tags), whose `let:` destructures from the
/// ENCLOSING component's `$$slot_def` (`Element.addSlotLet` →
/// `this.parent.name`).
///
/// Component-kind nodes (`<Child let:foo>`, `<svelte:component let:foo>`,
/// `<svelte:self let:foo>`) return `None`: their `let:` belongs to their OWN
/// slot (`InlineComponent.addSlotLet` → `this.name`).
fn element_kind_attributes<'a>(node: &'a TemplateNode<'a>) -> Option<&'a [Attribute<'a>]> {
    match node {
        TemplateNode::RegularElement(el) => Some(&el.attributes),
        TemplateNode::SlotElement(el) => Some(&el.attributes),
        TemplateNode::SvelteElement(el) => Some(&el.attributes),
        TemplateNode::TitleElement(el) => Some(&el.attributes),
        TemplateNode::SvelteFragment(el)
        | TemplateNode::SvelteBoundary(el)
        | TemplateNode::SvelteHead(el)
        | TemplateNode::SvelteBody(el)
        | TemplateNode::SvelteDocument(el)
        | TemplateNode::SvelteOptions(el)
        | TemplateNode::SvelteWindow(el) => Some(&el.attributes),
        _ => None,
    }
}

/// Check whether any element-kind node in THIS component's slot scope carries
/// `let:` directives, and so destructures from the component's `$$slot_def` —
/// which forces the `const $$_inst = new …` form.
///
/// Control-flow blocks are transparent to that scope: official svelte2tsx only
/// pushes its `element` stack for elements/components, so a `<div let:x>` nested
/// in `{#if}` / `{#each}` / `{#await}` / `{#key}` still has the component as its
/// `parent`. This therefore recurses through blocks but NOT into nested
/// elements/components (each owns its own slot scope) nor `{#snippet}` bodies
/// (official resets `element` to `undefined` there).
pub(crate) fn has_default_slot_let_children(fragment: &Fragment) -> bool {
    fragment.nodes.iter().any(|node| {
        if let Some(attrs) = element_kind_attributes(node) {
            return has_let_directives(attrs);
        }
        match node {
            TemplateNode::IfBlock(block) => {
                has_default_slot_let_children(&block.consequent)
                    || block
                        .alternate
                        .as_ref()
                        .is_some_and(|alt| has_default_slot_let_children(alt))
            }
            TemplateNode::EachBlock(block) => {
                has_default_slot_let_children(&block.body)
                    || block
                        .fallback
                        .as_ref()
                        .is_some_and(|fb| has_default_slot_let_children(fb))
            }
            TemplateNode::AwaitBlock(block) => {
                block
                    .pending
                    .as_ref()
                    .is_some_and(|p| has_default_slot_let_children(p))
                    || block
                        .then
                        .as_ref()
                        .is_some_and(|t| has_default_slot_let_children(t))
                    || block
                        .catch
                        .as_ref()
                        .is_some_and(|c| has_default_slot_let_children(c))
            }
            TemplateNode::KeyBlock(block) => has_default_slot_let_children(&block.fragment),
            _ => false,
        }
    })
}

/// The `$$slot_def.default` destructure an element-kind child of a component
/// emits for its OWN `let:` directives, or `None` when `slot_inst` says this
/// node is not in a component's slot scope, it has no `let:`, or a static
/// `slot=` retargets it at a NAMED slot (official's `addSlotName` replaces the
/// `default` key, so those callers emit the `$$slot_def["…"]` form instead).
/// Mirrors `Element.performTransformation`'s `slotLetsTransformation`.
///
/// The block is emitted by the node's own handler, and therefore *after* the
/// handler's leading gap — official runs it through the SAME `transform()` call
/// as the opening-tag rewrite, so the gap precedes the destructure.
pub(crate) fn default_slot_let_block(
    attributes: &[Attribute],
    slot_inst: Option<&String>,
    source: &str,
) -> Option<String> {
    let inst = slot_inst?;
    if !has_let_directives(attributes) || slot_attr_static_name(attributes).is_some() {
        return None;
    }
    Some(format!(
        "{{const {{/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,{}}} = {}.$$slot_def.default;$$_$$;",
        build_let_destructure_string(attributes, source),
        inst
    ))
}

/// The `$$slot_def["name"]` destructure an element-kind child emits when a
/// static `slot=` retargets it at a named slot (official `addSlotName`).
pub(crate) fn named_slot_let_block(
    attributes: &[Attribute],
    inst: &str,
    target_slot: &str,
    source: &str,
) -> String {
    format!(
        "{{const {{/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,{}}} = {}.$$slot_def[\"{}\"];$$_$$;",
        build_let_destructure_string(attributes, source),
        inst,
        target_slot
    )
}

/// Check if any children have `slot="name"` attributes (named slots).
pub(crate) fn has_named_slot_children(fragment: &Fragment) -> bool {
    for node in &fragment.nodes {
        match node {
            TemplateNode::RegularElement(el) if slot_attr_static_name(&el.attributes).is_some() => {
                return true;
            }
            TemplateNode::Component(comp) if slot_attr_static_name(&comp.attributes).is_some() => {
                return true;
            }
            // `<svelte:fragment slot="name" let:foo>` is the Svelte 4 idiom
            // for distributing children into a named slot — it shows up here
            // as `SvelteFragment`. Treat it like the others.
            TemplateNode::SvelteFragment(el) if slot_attr_static_name(&el.attributes).is_some() => {
                return true;
            }
            // `<slot slot="name">` forwards a `<slot>` into the parent
            // component's named slot.
            TemplateNode::SlotElement(el) if slot_attr_static_name(&el.attributes).is_some() => {
                return true;
            }
            // `<svelte:element this={tag} slot="name">` targets a named slot.
            TemplateNode::SvelteElement(el) if slot_attr_static_name(&el.attributes).is_some() => {
                return true;
            }
            // `<svelte:boundary slot="name">` is an `Element` upstream too.
            TemplateNode::SvelteBoundary(el) if slot_attr_static_name(&el.attributes).is_some() => {
                return true;
            }
            // `<svelte:component this={expr} slot="name">` and `<svelte:self
            // slot="name">` are `InlineComponent`s in official svelte2tsx
            // (same as a named `<Component slot="name">`), so they forward
            // into the parent's `$$slot_def[...]` the same way (#2136).
            TemplateNode::SvelteComponent(sc)
                if slot_attr_static_name(&sc.attributes).is_some() =>
            {
                return true;
            }
            TemplateNode::SvelteSelf(el) if slot_attr_static_name(&el.attributes).is_some() => {
                return true;
            }
            // Control-flow blocks are transparent to slot distribution: a
            // `<div slot="foo">` nested inside `{#if}` / `{#each}` / `{#await}`
            // / `{#key}` still targets the component's named slot (official
            // svelte2tsx keeps `parent` pointing at the enclosing component
            // across blocks). Recurse into their fragments — but NOT into
            // nested elements/components (which own their own slot scope) or
            // `{#snippet}` bodies (snippet props, not slots).
            TemplateNode::IfBlock(block)
                if has_named_slot_children(&block.consequent)
                    || block
                        .alternate
                        .as_ref()
                        .is_some_and(|alt| has_named_slot_children(alt)) =>
            {
                return true;
            }
            TemplateNode::EachBlock(block)
                if has_named_slot_children(&block.body)
                    || block
                        .fallback
                        .as_ref()
                        .is_some_and(|fb| has_named_slot_children(fb)) =>
            {
                return true;
            }
            TemplateNode::AwaitBlock(block)
                if block
                    .pending
                    .as_ref()
                    .is_some_and(|p| has_named_slot_children(p))
                    || block
                        .then
                        .as_ref()
                        .is_some_and(|t| has_named_slot_children(t))
                    || block
                        .catch
                        .as_ref()
                        .is_some_and(|c| has_named_slot_children(c)) =>
            {
                return true;
            }
            TemplateNode::KeyBlock(block) if has_named_slot_children(&block.fragment) => {
                return true;
            }
            _ => {}
        }
    }
    false
}

/// Process component children with slot awareness.
///
/// This handles:
/// - Default slot wrapping with `let:` destructuring
/// - Named slot wrapping with `slot="name"` children
///
/// Returns whether the default-slot block is still open at the closing tag and
/// so must be closed by the caller's closing-tag overwrite.
///
/// Takes the owning node's parts rather than a `&Component` so `<svelte:component>`
/// (a `SvelteComponentElement`) can share the exact same slot lowering.
#[must_use]
pub(crate) fn process_component_children_with_slots(
    attributes: &[Attribute],
    fragment: &Fragment,
    node_end: u32,
    inst_var: &str,
    has_lets: bool,
    open_default_slot_block: bool,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString<'_>,
    counter: &mut Counter,
    depth: u32,
) -> bool {
    // The component's OWN `let:` directives open a single `$$slot_def.default`
    // block before the first child; it stays open across every child (named-slot
    // children nest their own `$$slot_def["…"]` block inside it) and is closed
    // after the last one. When a direct `{#snippet}` child was already demoted to
    // a component prop, the caller emits this opening text itself right after the
    // relocated prop (mirrors official's `snippetPropVariablesDeclaration` then
    // `defaultSlotLetTransformation` ordering) — signalled via `open_default_slot_block`
    // — since inserting it at `first_node.start()` here would land inside the
    // moved snippet chunk if that snippet happens to be the fragment's first node.
    let mut prev_end: Option<u32> = None;

    if has_lets
        && open_default_slot_block
        && let Some(first_node) = fragment.nodes.first()
    {
        str.append_left_fmt(
            first_node.start(),
            format_args!(
                "{{const {{/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,{}}} = {}.$$slot_def.default;$$_$$;",
                build_let_destructure_string(attributes, source),
                inst_var
            ),
        );
    }

    for node in &fragment.nodes {
        // A direct `{#snippet}` child is always demoted to a component prop by
        // the caller (mirrors official's unconditional `parentComponent` check),
        // never processed as slot-scoped content, so it takes no part here beyond
        // marking its end for the block-close position below.
        if matches!(node, TemplateNode::SnippetBlock(s) if s.start < s.end) {
            prev_end = Some(node.end());
            continue;
        }

        let is_named_slot = match node {
            TemplateNode::RegularElement(el) => slot_attr_static_name(&el.attributes).is_some(),
            TemplateNode::Component(child_comp) => {
                slot_attr_static_name(&child_comp.attributes).is_some()
            }
            TemplateNode::SvelteFragment(el) => slot_attr_static_name(&el.attributes).is_some(),
            TemplateNode::SvelteComponent(sc) => slot_attr_static_name(&sc.attributes).is_some(),
            TemplateNode::SvelteSelf(el) => slot_attr_static_name(&el.attributes).is_some(),
            _ => false,
        };

        if is_named_slot {
            // The default slot's `$$slot_def.default` block stays open
            // through all children. Each named slot child carries its
            // own inner `$$slot_def["..."]` block (handled by the
            // dedicated handlers below); they're nested inside the
            // outer default block.

            // Process the named slot child (children of the parent component are at depth+1)
            match node {
                TemplateNode::RegularElement(el) => {
                    handle_named_slot_element(el, inst_var, source, options, str, counter, depth);
                }
                TemplateNode::Component(child_comp) => {
                    handle_named_slot_component(
                        child_comp, inst_var, source, options, str, counter, depth,
                    );
                }
                TemplateNode::SvelteFragment(el) => {
                    handle_named_slot_svelte_fragment(
                        el, inst_var, source, options, str, counter, depth,
                    );
                }
                TemplateNode::SvelteComponent(sc) => {
                    handle_named_slot_svelte_component(
                        sc, inst_var, source, options, str, counter, depth,
                    );
                }
                TemplateNode::SvelteSelf(el) => {
                    handle_named_slot_svelte_self(
                        el, inst_var, source, options, str, counter, depth,
                    );
                }
                _ => {
                    process_node_inplace(node, source, options, str, counter, depth);
                }
            }
        } else {
            // Default-slot child: mark the component slot context and process
            // normally. The handler itself emits the `$$slot_def.default`
            // destructure for the node's OWN `let:` directives (mirroring
            // `Element.performTransformation`), and the same context reaches an
            // element nested inside this child's control-flow blocks (`{#if}` /
            // `{#each}` / …) — which official also treats as a direct slot
            // consumer, since blocks do not push its `element` stack. A nested
            // element/component clears it (each owns its own slot scope) via its
            // handler's `take()`.
            let prev_slot = counter.slot_inst.replace(inst_var.to_string());
            process_node_inplace(node, source, options, str, counter, depth);
            counter.slot_inst = prev_slot;
        }

        prev_end = Some(node.end());
    }

    // Close the component's own default-slot block.
    if has_lets {
        // Find the position to close: after the last node, before the closing tag
        if let Some(end) = prev_end {
            let closing_tag_start = find_closing_tag_start(source, node_end);
            if closing_tag_start < node_end {
                // The closing tag's own collapsed gaps come first, so the caller
                // emits this `}` as part of that overwrite.
                return true;
            }
            str.append_left(end, "}");
        }
    }
    false
}

/// Handle a regular element child with `slot="name"` attribute inside a component.
///
/// Wraps the element in a `$$slot_def["name"]` destructuring block.
pub(crate) fn handle_named_slot_element(
    el: &RegularElement,
    inst_var: &str,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString<'_>,
    counter: &mut Counter,
    depth: u32,
) {
    let slot_name = slot_attr_static_name(&el.attributes).unwrap_or_default();
    let let_destructure = build_let_destructure_string(&el.attributes, source);

    // Build the slot def block opener
    let block_open = format!(
        "{{const {{/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,{}}} = {}.$$slot_def[\"{}\"];$$_$$;",
        let_destructure, inst_var, slot_name
    );

    // Build attributes string excluding `slot` and `let:` directives
    let attrs_str = build_named_slot_element_attrs(&el.attributes, source);

    let opening_tag_end =
        find_opening_tag_end(source, el.start, el.end, el.name.as_str(), &el.attributes);

    // class:/style: directives lower to statements after createElement
    // (`class:bar` → ` bar;`), same as a regular element. The `let:` binding
    // itself is consumed by the `$$slot_def[…]` destructure above (and any use
    // in the body emits its own reference), so it is NOT re-emitted here.
    let class_style_suffix = segs_to_string(
        &build_class_style_directive_suffix_segments(&el.attributes, source),
        source,
    );

    let spacing = opener_spacing(
        source,
        el.start,
        &el.name,
        opening_tag_end,
        Some((el.start + 1, el.start + 1 + el.name.len() as u32)),
        &el.attributes,
        &counter.element_opener_comments,
        OpenerCtx {
            is_element: true,
            in_component_slot: true,
            tag_name: &el.name,
            is_slot_tag: false,
        },
    );
    // NOTE: the `let:foo={bar}` binding is reflected purely via the slot-def
    // destructure (`{ …, foo: bar } = …$$slot_def["…"]`); official emits NO
    // separate `bar;` reflection statement (that would duplicate the `{bar}`
    // content expression).
    let opener = format!(
        "{}{}{{ svelteHTML.createElement(\"{}\", {{{}{}}});{}",
        " ".repeat(spacing.before_block),
        block_open,
        el.name,
        " ".repeat(spacing.in_attr_object),
        attrs_str,
        class_style_suffix
    );
    str.overwrite(el.start, opening_tag_end, &opener);

    // This named-slot element is a RegularElement — its children are at depth+1.
    process_fragment_inplace(&el.fragment, source, options, str, counter, depth + 1);

    // Void elements (`<input slot="x">`) and source-self-closing tags have no
    // `</tag>`; calling `find_closing_tag_start` would scan backward and match
    // an unrelated earlier `</…>` (e.g. `</script>`), overwriting everything in
    // between. Append the closing braces at `el.end` instead. Mirrors
    // `handle_regular_element`.
    let is_self_closing_source = slice_src(source, el.start as usize, el.end as usize)
        .trim_end()
        .ends_with("/>");
    let is_void = crate::compiler::utils::is_void_element(&el.name);
    if is_void || is_self_closing_source {
        str.append_left(el.end, " }}");
    } else {
        let closing_tag_start = find_closing_tag_start(source, el.end);
        if closing_tag_start < el.end {
            str.overwrite(closing_tag_start, el.end, " }}");
        } else {
            str.append_left(el.end, " }}");
        }
    }
}

/// Handle a `<svelte:fragment slot="name" let:foo>` child inside a parent
/// component. `<svelte:fragment>` itself doesn't render to HTML — it's a
/// virtual element used to distribute children into a named slot. The JS
/// reference still emits a `svelteHTML.createElement("svelte:fragment", { })`
/// (with `slot` and `let:` attributes stripped), wrapped in the slot let
/// destructure block.
pub(crate) fn handle_named_slot_svelte_fragment(
    el: &SvelteElement,
    inst_var: &str,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString<'_>,
    counter: &mut Counter,
    depth: u32,
) {
    let slot_name = slot_attr_static_name(&el.attributes).unwrap_or_default();
    let let_destructure = build_let_destructure_string(&el.attributes, source);

    // Leading ` ` matches the JS reference, which produces
    // `\t {const ... ;{ svelteHTML.createElement(...)` after the tab indent
    // is preserved.
    let block_open = format!(
        " {{const {{/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,{}}} = {}.$$slot_def[\"{}\"];$$_$$;",
        let_destructure, inst_var, slot_name
    );

    let opening_tag_end =
        find_opening_tag_end(source, el.start, el.end, el.name.as_str(), &el.attributes);
    let closing_tag_start = find_closing_tag_start(source, el.end);
    let has_closing_tag = closing_tag_start < el.end;

    // Emit the slot-def block + a `svelteHTML.createElement("svelte:fragment", {  })`
    // with the `slot` / `let:` attributes stripped. The JS reference's
    // position-preserving emission leaves one space per stripped attribute
    // visible inside the empty `{}` (so `slot="x" let:y` → 2 spaces,
    // `slot="x" let:y let:z` → 3 spaces, etc.).
    let attrs_str = build_named_slot_element_attrs(&el.attributes, source);
    let inner = if attrs_str.is_empty() {
        let stripped_count = el
            .attributes
            .iter()
            .filter(|a| {
                matches!(
                    a,
                    Attribute::Attribute(node)
                        if node.name == "slot"
                ) || matches!(a, Attribute::LetDirective(_))
            })
            .count();
        " ".repeat(stripped_count.max(1))
    } else {
        attrs_str
    };
    let opener = format!(
        "{}{{ svelteHTML.createElement(\"svelte:fragment\", {{{}}});",
        block_open, inner
    );

    if !has_closing_tag {
        // Self-closing `<svelte:fragment slot="x" />` — body has no nodes.
        let combined = format!("{} }}}}", opener);
        str.overwrite(el.start, el.end, &combined);
        return;
    }

    str.overwrite(el.start, opening_tag_end, &opener);
    // `<svelte:fragment slot=…>` emits its own `createElement("svelte:fragment")`,
    // so it is an element nesting level — children (their `$$_<name><depth>`
    // instance vars) are at depth + 1.
    process_fragment_inplace(&el.fragment, source, options, str, counter, depth + 1);
    str.overwrite(closing_tag_start, el.end, " }}");
}

/// Handle a component child with `slot="name"` attribute inside a parent component.
pub(crate) fn handle_named_slot_component(
    comp: &Component,
    inst_var: &str,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString<'_>,
    counter: &mut Counter,
    depth: u32,
) {
    let slot_name = slot_attr_static_name(&comp.attributes).unwrap_or_default();
    let let_destructure = build_let_destructure_string(&comp.attributes, source);

    // Build the slot def block opener
    let block_open = format!(
        "{{const {{/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,{}}} = {}.$$slot_def[\"{}\"];$$_$$;",
        let_destructure, inst_var, slot_name
    );

    // Insert the block opener before the component
    // The component's own leading gaps precede the `$$slot_def[…]` prologue, so
    // they are emitted here (`handle_component` skips them for this path).
    let spacing = opener_spacing(
        source,
        comp.start,
        &comp.name,
        find_opening_tag_end(source, comp.start, comp.end, &comp.name, &comp.attributes),
        source[comp.start as usize..]
            .find(comp.name.as_str())
            .map(|o| {
                let start = comp.start + o as u32;
                (start, start + comp.name.len() as u32)
            }),
        &comp.attributes,
        &counter.element_opener_comments,
        OpenerCtx {
            is_element: false,
            in_component_slot: true,
            tag_name: &comp.name,
            is_slot_tag: false,
        },
    );
    str.append_left_fmt(
        comp.start,
        format_args!("{}{}", " ".repeat(spacing.before_block), block_open),
    );

    // Process the component normally. Suppress its component-name reference at
    // the close so we can emit it *outside* the component's own block (matching
    // official `endTransformation` order: component-block `}`, then `Name`, then
    // the named-slot-block `}`).
    counter.named_slot_component_close = true;
    counter.suppress_component_lets = true;
    handle_component(comp, source, options, str, counter, depth);

    // Emit the component-name reference (non-self-closing only — official maps
    // `</Name>` to `Name`; self-closing components have no name reference) and
    // close the named-slot block.
    let closing_tag_start = find_closing_tag_start(source, comp.end);
    if closing_tag_start < comp.end {
        // The closing tag's gaps were emitted by the component's own overwrite.
        str.append_left_fmt(comp.end, format_args!("{}}}", comp.name));
    } else {
        str.append_left(comp.end, "}");
    }
}

/// Handle a `<svelte:component this={expr} slot="name">` child inside a parent
/// component. Official svelte2tsx models `svelte:component` as an
/// `InlineComponent`, so a named-slot child of that kind forwards through the
/// exact same `$$slot_def[...]` lowering as a named component
/// (`handle_named_slot_component`) — see #2136.
pub(crate) fn handle_named_slot_svelte_component(
    comp: &SvelteComponentElement,
    inst_var: &str,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString<'_>,
    counter: &mut Counter,
    depth: u32,
) {
    let slot_name = slot_attr_static_name(&comp.attributes).unwrap_or_default();
    let let_destructure = build_let_destructure_string(&comp.attributes, source);

    let block_open = format!(
        "{{const {{/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,{}}} = {}.$$slot_def[\"{}\"];$$_$$;",
        let_destructure, inst_var, slot_name
    );

    // The `this={expr}` range stands in for the "name" head `handle_component`
    // uses (`svelte:component` has no literal component-name token), same as
    // `handle_svelte_component`'s own spacing computation.
    let opening_tag_end =
        find_opening_tag_end(source, comp.start, comp.end, &comp.name, &comp.attributes);
    let spacing = opener_spacing(
        source,
        comp.start,
        &comp.name,
        opening_tag_end,
        get_expression_range(&comp.expression),
        &comp.attributes,
        &counter.element_opener_comments,
        OpenerCtx {
            is_element: false,
            in_component_slot: true,
            tag_name: &comp.name,
            is_slot_tag: false,
        },
    );
    str.append_left_fmt(
        comp.start,
        format_args!("{}{}", " ".repeat(spacing.before_block), block_open),
    );

    // Process the node normally; suppress its own `slot=` prop / default-slot
    // `let:` emission — both are consumed by the block open above.
    counter.named_slot_component_close = true;
    counter.suppress_component_lets = true;
    handle_svelte_component(comp, source, options, str, counter, depth);

    // `svelte:component` keeps no name mapping on its closing tag (unlike a
    // named component) — just close the named-slot block.
    str.append_left(comp.end, "}");
}

/// Handle a `<svelte:self slot="name">` child inside a parent component.
/// Official svelte2tsx models `svelte:self` as an `InlineComponent` too, so it
/// forwards through the same lowering as `handle_named_slot_svelte_component`
/// (#2136).
pub(crate) fn handle_named_slot_svelte_self(
    el: &SvelteElement,
    inst_var: &str,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString<'_>,
    counter: &mut Counter,
    depth: u32,
) {
    let slot_name = slot_attr_static_name(&el.attributes).unwrap_or_default();
    let let_destructure = build_let_destructure_string(&el.attributes, source);

    let block_open = format!(
        "{{const {{/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,{}}} = {}.$$slot_def[\"{}\"];$$_$$;",
        let_destructure, inst_var, slot_name
    );

    // `svelte:self` emits its opener as a pure string (no source range head),
    // same as `handle_svelte_self`'s own spacing computation.
    let opening_tag_end =
        find_opening_tag_end(source, el.start, el.end, el.name.as_str(), &el.attributes);
    let spacing = opener_spacing(
        source,
        el.start,
        &el.name,
        opening_tag_end,
        None,
        &el.attributes,
        &counter.element_opener_comments,
        OpenerCtx {
            is_element: false,
            in_component_slot: true,
            tag_name: &el.name,
            is_slot_tag: false,
        },
    );
    str.append_left_fmt(
        el.start,
        format_args!("{}{}", " ".repeat(spacing.before_block), block_open),
    );

    counter.named_slot_component_close = true;
    counter.suppress_component_lets = true;
    handle_svelte_self(el, source, options, str, counter, depth);

    // `svelte:self` keeps no name mapping on its closing tag — just close the
    // named-slot block.
    str.append_left(el.end, "}");
}

/// Build attribute string for a named slot element, excluding `slot` and `let:` directives.
pub(crate) fn build_named_slot_element_attrs(attributes: &[Attribute], source: &str) -> String {
    let mut parts: Vec<String> = Vec::new();

    for attr in attributes {
        match attr {
            Attribute::Attribute(node) => {
                if node.name == "slot" {
                    continue;
                }
                // Named-slot elements become `svelteHTML.createElement(…)` calls,
                // so they are real DOM elements — apply data-* wrapping.
                if let Some(s) = format_attribute_node(node, source, true) {
                    parts.push(s);
                }
            }
            Attribute::SpreadAttribute(spread) => {
                if let Some(s) = format_spread_attribute(spread, source) {
                    parts.push(s);
                }
            }
            Attribute::BindDirective(bind) => {
                parts.push(format_bind_directive(bind, source));
            }
            Attribute::OnDirective(on) => {
                parts.push(format_on_directive(on, source));
            }
            Attribute::ClassDirective(_) | Attribute::StyleDirective(_) => {
                // class:/style: are not props — they lower to statements after
                // createElement (see the suffix in handle_named_slot_element).
            }
            Attribute::TransitionDirective(transition) => {
                if let Some(s) = format_transition_directive(transition, source) {
                    parts.push(s);
                }
            }
            Attribute::UseDirective(use_dir) => {
                if let Some(s) = format_use_directive(use_dir, source) {
                    parts.push(s);
                }
            }
            // Skip let: directives and animate
            Attribute::AnimateDirective(_) | Attribute::LetDirective(_) => {}
            Attribute::AttachTag(_) => {}
        }
    }

    parts.join("")
}
