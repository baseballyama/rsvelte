//! `<svelte:window>` / `<svelte:body>` / `<svelte:head>` and the other
//! `svelte:` meta elements.

use std::fmt::Write as _;

use crate::ast::template::{SvelteElement, TemplateNode};
use crate::svelte2tsx::magic_string::MagicString;
use crate::svelte2tsx::svelte2tsx::Svelte2TsxOptions;

use crate::svelte2tsx::template::attributes::binding::{
    any_bind_needs_element_var, build_bind_directive_suffix, element_var_base_name,
};
use crate::svelte2tsx::template::attributes::build_attributes_string;
use crate::svelte2tsx::template::attributes::directive_suffix::build_directive_prefix_suffix;
use crate::svelte2tsx::template::ctx::Counter;
use crate::svelte2tsx::template::utils::opener_spacing::{OpenerCtx, opener_spacing};
use crate::svelte2tsx::template::utils::source::{find_closing_tag_start, find_opening_tag_end};
use crate::svelte2tsx::template::walk::process_node_inplace;

use super::text::handle_text_trimmed;

use super::component_slots::{
    build_named_slot_element_attrs, default_slot_let_block, named_slot_let_block,
};
use super::slot_element::slot_attr_static_name;
use super::snippet_block::handle_snippet_block_as_component_prop;

/// The `svelte:` tags upstream `Element.ts` names with a plain string literal in
/// `getStartTransformation` / the `_name` switch. Everything else — including
/// `svelte:boundary` and `svelte:document` — falls through to the `default`
/// branch, which keeps the tag name as a *source range*; that extra kept range
/// changes the gap arithmetic in `transform`.
const LITERAL_NAME_TAGS: [&str; 5] = [
    "svelte:options",
    "svelte:head",
    "svelte:window",
    "svelte:body",
    "svelte:fragment",
];

/// `legacy.js::remove_surrounding_whitespace_nodes`, which the Svelte-4 AST
/// conversion applies to `<svelte:boundary>` children (and `{#snippet}` bodies)
/// but to no other element: a whitespace-only first/last `Text` child is dropped
/// from the array svelte2tsx walks, and a content-bearing one has its `data`
/// trimmed while keeping its source range.
#[derive(Clone, Copy, Default)]
struct SurroundingWhitespace {
    first: EdgeWhitespace,
    last: EdgeWhitespace,
}

#[derive(Clone, Copy, Default, PartialEq, Eq)]
enum EdgeWhitespace {
    #[default]
    Keep,
    Drop,
    Trim,
}

impl SurroundingWhitespace {
    fn of(nodes: &[TemplateNode], source: &str) -> Self {
        let classify = |node: Option<&TemplateNode>| match node {
            Some(TemplateNode::Text(text)) => {
                if text.data.chars().all(char::is_whitespace) {
                    // Dropping leaves the source range verbatim, which is only
                    // safe when the source is whitespace too: `&nbsp;` decodes
                    // to whitespace but its six raw characters are not valid TS.
                    let raw = source
                        .get(text.start as usize..text.end as usize)
                        .unwrap_or_default();
                    if raw.chars().all(char::is_whitespace) {
                        EdgeWhitespace::Drop
                    } else {
                        EdgeWhitespace::Keep
                    }
                } else {
                    EdgeWhitespace::Trim
                }
            }
            _ => EdgeWhitespace::Keep,
        };
        let first = classify(nodes.first());
        let last = classify(nodes.last());
        Self { first, last }
    }

    /// Start of the first child that survives, i.e. upstream
    /// `computeStartTagEnd`'s `children[0].start`.
    fn first_kept_start(&self, nodes: &[TemplateNode]) -> Option<u32> {
        let kept = if self.first == EdgeWhitespace::Drop {
            &nodes[1..]
        } else {
            nodes
        };
        kept.first().map(node_start)
    }
}

fn node_start(node: &TemplateNode) -> u32 {
    use TemplateNode as N;
    match node {
        N::Text(n) => n.start,
        N::Comment(n) => n.start,
        N::ExpressionTag(n) => n.start,
        N::HtmlTag(n) => n.start,
        N::ConstTag(n) => n.start,
        N::DeclarationTag(n) => n.start,
        N::DebugTag(n) => n.start,
        N::RenderTag(n) => n.start,
        N::AttachTag(n) => n.start,
        N::IfBlock(n) => n.start,
        N::EachBlock(n) => n.start,
        N::AwaitBlock(n) => n.start,
        N::KeyBlock(n) => n.start,
        N::SnippetBlock(n) => n.start,
        N::RegularElement(n) => n.start,
        N::Component(n) => n.start,
        N::SvelteComponent(n) => n.start,
        N::SvelteElement(n) => n.start,
        N::TitleElement(n) => n.start,
        N::SlotElement(n) => n.start,
        N::SvelteOptions(n)
        | N::SvelteBody(n)
        | N::SvelteDocument(n)
        | N::SvelteFragment(n)
        | N::SvelteBoundary(n)
        | N::SvelteHead(n)
        | N::SvelteSelf(n)
        | N::SvelteWindow(n) => n.start,
    }
}

/// Handle Svelte special elements (svelte:body, svelte:window, etc.).
///
/// `svelte:boundary` is special: like `InlineComponent` in the upstream
/// svelte2tsx, any `{#snippet}` blocks that are **direct children** of
/// `<svelte:boundary>` become **implicit properties** of the element's
/// `createElement` attributes object instead of standalone `const` declarations.
/// This mirrors upstream `SnippetBlock.ts::hoistSnippetBlock` which returns
/// early for `SvelteBoundary` (treating it exactly like `InlineComponent`),
/// and `Element.ts::addAttribute` which the upstream `handleSnippet` calls to
/// insert the snippet body as an attr-value transform.
///
/// For all other special elements the snippet children remain standalone
/// declarations (the default behaviour for elements/blocks).
pub fn handle_svelte_special_element(
    el: &SvelteElement,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString<'_>,
    counter: &mut Counter,
    depth: u32,
) {
    if el.start >= el.end {
        return;
    }

    // These are all `Element`s in official svelte2tsx: they own their own slot
    // scope (children must not inherit the component context) and forward their
    // own `let:` through the enclosing component's `$$slot_def`, keyed by a
    // static `slot=` when present.
    let saved_slot = counter.slot_inst.take();
    let named_slot: Option<(&str, &str)> = saved_slot
        .as_ref()
        .zip(slot_attr_static_name(&el.attributes))
        .map(|(inst, name)| (inst.as_str(), name));
    let named_slot_block = named_slot
        .as_ref()
        .map(|(inst, target_slot)| named_slot_let_block(&el.attributes, inst, target_slot, source));
    let default_slot_let = default_slot_let_block(&el.attributes, saved_slot.as_ref(), source);

    let is_boundary = el.name == "svelte:boundary";
    let whitespace = if is_boundary {
        SurroundingWhitespace::of(&el.fragment.nodes, source)
    } else {
        SurroundingWhitespace::default()
    };
    // `computeStartTagEnd` ends the opener transform at the first child, so
    // source between `>` and that child is collapsed. Only `<svelte:boundary>`
    // can have a gap there — every other element keeps its leading whitespace as
    // a `Text` child that starts right after the `>`.
    let opening_tag_end = whitespace
        .first_kept_start(&el.fragment.nodes)
        .filter(|_| whitespace.first == EdgeWhitespace::Drop)
        .unwrap_or_else(|| {
            find_opening_tag_end(source, el.start, el.end, el.name.as_str(), &el.attributes)
        });
    // In a named-slot context the `slot` attribute is consumed by the wrapper
    // block, so build the attributes without it.
    let attrs_str = if named_slot.is_some() {
        build_named_slot_element_attrs(&el.attributes, source)
    } else {
        build_attributes_string(
            &el.attributes,
            source,
            &counter.element_opener_comments,
            saved_slot.is_some(),
            options.namespace.preserves_attribute_case(),
        )
    };

    let (attrs_str, indent) = special_element_opening_layout(
        el,
        source,
        counter,
        opening_tag_end,
        attrs_str,
        saved_slot.is_some(),
        named_slot_block.as_ref().or(default_slot_let.as_ref()),
        str,
    );

    // `svelte:boundary` treats direct {#snippet} children as implicit props on
    // the `createElement` attrs object — exactly like InlineComponent in the
    // upstream. Check whether any direct children are snippet blocks.
    let has_snippet_children = el.name == "svelte:boundary"
        && el
            .fragment
            .nodes
            .iter()
            .any(|n| matches!(n, TemplateNode::SnippetBlock(s) if s.start < s.end));

    if has_snippet_children {
        handle_boundary_snippet_props(
            el,
            source,
            options,
            str,
            counter,
            depth,
            opening_tag_end,
            &indent,
            &attrs_str,
            whitespace,
        );
    } else {
        handle_standard_special_element(
            el,
            source,
            options,
            str,
            counter,
            depth,
            opening_tag_end,
            &indent,
            &attrs_str,
            whitespace,
        );
    }

    if named_slot.is_some() || default_slot_let.is_some() {
        str.append_left(el.end, "}");
    }
    counter.slot_inst = saved_slot;
}

fn special_element_opening_layout(
    el: &SvelteElement,
    source: &str,
    counter: &Counter,
    opening_tag_end: u32,
    attrs: String,
    in_component_slot: bool,
    slot_let_block: Option<&String>,
    str: &mut MagicString<'_>,
) -> (String, String) {
    let head = (!LITERAL_NAME_TAGS.contains(&el.name.as_str())).then(|| {
        (
            el.start + 1,
            el.start + 1 + u32::try_from(el.name.len()).expect("tag name length fits in u32"),
        )
    });
    let spacing = opener_spacing(
        source,
        el.start,
        &el.name,
        opening_tag_end,
        head,
        &el.attributes,
        &counter.element_opener_comments,
        OpenerCtx {
            is_element: true,
            in_component_slot,
            tag_name: &el.name,
            is_slot_tag: false,
        },
    );
    let attrs = if spacing.in_attr_object > 0 {
        format!("{}{}", " ".repeat(spacing.in_attr_object), attrs)
    } else {
        attrs
    };
    let indent = " ".repeat(spacing.before_block);
    let indent = if let Some(block) = slot_let_block {
        str.append_left_fmt(el.start, format_args!("{indent}{block}"));
        String::new()
    } else {
        indent
    };
    (attrs, indent)
}

fn handle_standard_special_element(
    el: &SvelteElement,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString<'_>,
    counter: &mut Counter,
    depth: u32,
    opening_tag_end: u32,
    indent: &str,
    attrs: &str,
    whitespace: SurroundingWhitespace,
) {
    let (opener, has_directives) =
        standard_special_element_opener(el, source, options, depth, indent, attrs);
    str.overwrite(el.start, opening_tag_end, &opener);

    for (index, node) in el.fragment.nodes.iter().enumerate() {
        process_child(
            node,
            index,
            &el.fragment.nodes,
            whitespace,
            source,
            options,
            str,
            counter,
            depth + 1,
        );
    }

    let extra_close = if has_directives { "}" } else { "" };
    let closing_tag_start = find_closing_tag_start(source, el.end);
    if closing_tag_start < el.end {
        str.overwrite_fmt(closing_tag_start, el.end, format_args!(" }}{extra_close}"));
    } else {
        str.append_left_fmt(el.end, format_args!("}}{extra_close}"));
    }
}

fn standard_special_element_opener(
    el: &SvelteElement,
    source: &str,
    options: &Svelte2TsxOptions,
    depth: u32,
    indent: &str,
    attrs: &str,
) -> (String, bool) {
    let element_var = any_bind_needs_element_var(&el.attributes, source)
        .then(|| format!("$$_{}{}", element_var_base_name(&el.name), depth));
    let bind_suffix = build_bind_directive_suffix(
        &el.attributes,
        source,
        element_var.as_deref(),
        &el.name,
        options.is_ts_file || !options.emit_jsdoc,
    );
    let element_var_decl = element_var
        .as_ref()
        .map(|value| format!("const {value} = "))
        .unwrap_or_default();
    let action_tag = if el.name == "svelte:body" {
        "body"
    } else {
        el.name.as_str()
    };
    let (directive_prefix, directive_suffix, action_count) =
        build_directive_prefix_suffix(&el.attributes, source, action_tag);
    let actions_arg = action_arguments(action_count);
    let has_directives = !directive_prefix.is_empty();
    let opener = if has_directives {
        format!(
            "{indent}{{{directive_prefix}{{ {element_var_decl}svelteHTML.createElement(\"{}\"{actions_arg}, {{{attrs}}});{bind_suffix}{directive_suffix}",
            el.name,
        )
    } else {
        format!(
            "{indent}{{ {element_var_decl}svelteHTML.createElement(\"{}\", {{{attrs}}});{bind_suffix}{directive_suffix}",
            el.name,
        )
    };
    (opener, has_directives)
}

fn action_arguments(action_count: usize) -> String {
    if action_count == 0 {
        return String::new();
    }

    let mut args = String::from(", __sveltets_2_union(");
    for index in 0..action_count {
        if index > 0 {
            args.push(',');
        }
        let _ = write!(args, "$$action_{index}");
    }
    args.push(')');
    args
}

fn handle_boundary_snippet_props(
    el: &SvelteElement,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString<'_>,
    counter: &mut Counter,
    depth: u32,
    opening_tag_end: u32,
    indent: &str,
    attrs: &str,
    whitespace: SurroundingWhitespace,
) {
    str.overwrite(
        el.start,
        opening_tag_end,
        &format!(
            "{indent}{{ svelteHTML.createElement(\"{}\", {{{attrs}",
            el.name
        ),
    );
    let mut anchor = opening_tag_end;
    let mut last_snippet_end = None;
    for (index, node) in el.fragment.nodes.iter().enumerate() {
        if let TemplateNode::SnippetBlock(snippet) = node {
            if snippet.start >= snippet.end {
                continue;
            }
            handle_snippet_block_as_component_prop(
                snippet,
                source,
                options,
                str,
                counter,
                depth + 1,
            );
            if snippet.start == anchor {
                anchor = snippet.end;
            } else {
                str.move_range(snippet.start, snippet.end, anchor);
            }
            last_snippet_end = Some(snippet.end);
        } else {
            process_child(
                node,
                index,
                &el.fragment.nodes,
                whitespace,
                source,
                options,
                str,
                counter,
                depth + 1,
            );
        }
    }
    if let Some(end) = last_snippet_end {
        str.append_left(end, "});");
    } else {
        str.prepend_right(opening_tag_end, "});");
    }
    let closing_start = find_closing_tag_start(source, el.end);
    if closing_start < el.end {
        str.overwrite(closing_start, el.end, " }");
    } else {
        str.append_left(el.end, "}");
    }
}

/// Walk a fragment whose surrounding whitespace `legacy.js` removes.
pub(super) fn process_fragment_trimmed(
    nodes: &[TemplateNode],
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString<'_>,
    counter: &mut Counter,
    depth: u32,
) {
    let whitespace = SurroundingWhitespace::of(nodes, source);
    for (index, node) in nodes.iter().enumerate() {
        process_child(
            node, index, nodes, whitespace, source, options, str, counter, depth,
        );
    }
}

/// Dispatch one child, applying the `<svelte:boundary>` whitespace surgery: a
/// dropped node is never visited (so its source survives verbatim) and a
/// trimmed one is blanked from its shortened `data`.
#[allow(clippy::too_many_arguments)]
fn process_child(
    node: &TemplateNode,
    index: usize,
    nodes: &[TemplateNode],
    whitespace: SurroundingWhitespace,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString<'_>,
    counter: &mut Counter,
    depth: u32,
) {
    if let TemplateNode::Text(text) = node {
        let is_first = index == 0;
        let is_last = index + 1 == nodes.len();
        if (is_first && whitespace.first == EdgeWhitespace::Drop)
            || (is_last && whitespace.last == EdgeWhitespace::Drop)
        {
            return;
        }
        let trim_start = is_first && whitespace.first == EdgeWhitespace::Trim;
        let trim_end = is_last && whitespace.last == EdgeWhitespace::Trim;
        if trim_start || trim_end {
            handle_text_trimmed(text, str, trim_start, trim_end);
            return;
        }
    }
    process_node_inplace(node, source, options, str, counter, depth);
}
