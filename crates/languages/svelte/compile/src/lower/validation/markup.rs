//! The template errors upstream's parser and analysis raise, one walk for elements and
//! components.

use oxc_ast::ast::Expression;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_semantic::compiler_syntax_tree::{
    Attribute, Each, ElementKind, MetadataTag, Modifiers,
};
use rsvelte_typescript_tree::{ExpressionIdentifier, Tree};
use rustc_hash::FxHashSet;

mod lets;
mod placement;
mod slots;

use placement::Ancestors;

use super::super::special::invalid;
use super::super::{
    AttributeValue, Children, CompileInput, CompilerNodeIdentifier, Diagnostic, Element, NodeKind,
    is_custom_element_node, is_directive,
};
use crate::render_plan::is_template_whitespace;

/// The nearest component, `<svelte:element>` or custom element above a node, which decides where a
/// `slot` attribute may go.
#[derive(Clone, Copy)]
enum Owner {
    Component(CompilerNodeIdentifier),
    Element,
}

/// Upstream's `parent_element` and what its `RegularElement` visitor reads from the path above.
#[derive(Clone, Copy, Default)]
struct Placement<'a> {
    /// The nearest regular element, unless a component or snippet is nearer.
    parent: Option<&'a str>,
    depth: u32,
    /// A block lies between the node and `parent`.
    crossed_block: bool,
    ancestors: Ancestors,
}

/// # Errors
///
/// `svelte_fragment_invalid_placement`, `slot_attribute_invalid_placement`,
/// `node_invalid_placement` or `bind_invalid_expression`, at the first node in document order
/// that has one.
pub(in crate::lower) fn check(input: &CompileInput<'_>) -> Result<(), Diagnostic> {
    walk(
        input,
        input.component.compiler_syntax_tree.root,
        None,
        &Placement::default(),
    )
}

fn walk<'a>(
    input: &CompileInput<'a>,
    children: Children,
    owner: Option<Owner>,
    placement: &Placement<'a>,
) -> Result<(), Diagnostic> {
    let tree = input.component.compiler_syntax_tree;
    let source = input.component.source_text;
    let mut slots = FxHashSet::default();
    for &identifier in tree.children(children) {
        let node = tree.node(identifier);
        let text = match &node.kind {
            NodeKind::Expression { .. } => true,
            kind => kind
                .text(source)
                .is_some_and(|text| text.contains(|c| !is_template_whitespace(c))),
        };
        if text
            && let Some(parent) = placement.parent
            && let Some(message) = placement::invalid_with_parent("#text", parent)
        {
            return node_invalid_placement(&message, node.span);
        }
        let (inner, inner_placement) = match &node.kind {
            NodeKind::Element(el) => element(input, identifier, el, owner, placement, &mut slots)?,
            NodeKind::Each(each) if let Some(rune) = each_rune(input, each) => {
                return super::state_invalid_placement(rune, node.span);
            }
            NodeKind::If { .. } | NodeKind::Each(_) | NodeKind::Await(_) | NodeKind::Key { .. } => {
                (
                    owner,
                    Placement {
                        crossed_block: true,
                        ancestors: placement.ancestors.cross_block(),
                        ..*placement
                    },
                )
            }
            NodeKind::Snippet(_) => (owner, Placement::default()),
            _ => (owner, *placement),
        };
        for children in tree.child_lists(identifier) {
            walk(input, children, inner, &inner_placement)?;
        }
    }
    Ok(())
}

/// Upstream's `EachBlock` refuses a context named `$state` or `$derived`.
fn each_rune<'a>(input: &CompileInput<'a>, each: &Each) -> Option<&'a str> {
    let context = input.component.javascript.get_pattern(each.context?);
    let oxc_ast::ast::BindingPattern::BindingIdentifier(name) = &context.pattern else {
        return None;
    };
    let name = name.name.as_str();
    matches!(name, "$state" | "$derived").then_some(name)
}

/// Upstream's `node_invalid_placement` for a regular element, and the placement of its children.
fn element_placement<'a>(
    input: &CompileInput<'a>,
    identifier: CompilerNodeIdentifier,
    el: &Element,
    placement: &Placement<'a>,
) -> Result<Placement<'a>, Diagnostic> {
    match el.kind {
        ElementKind::Regular => {}
        kind if kind.renders_component() => return Ok(Placement::default()),
        ElementKind::Metadata(Some(MetadataTag::Element | MetadataTag::Fragment)) => {
            return Ok(Placement::default());
        }
        _ => return Ok(*placement),
    }
    let name = el.name.text(input.component.source_text);
    if let Some(parent) = placement.parent {
        // Past a block upstream only warns, and every later message is a warning too.
        let message = placement::invalid_with_parent(name, parent).map_or_else(
            || placement.ancestors.invalid(name),
            |message| (!placement.crossed_block).then_some(message),
        );
        if let Some(message) = message {
            let span = input.component.compiler_syntax_tree.node(identifier).span;
            return node_invalid_placement(&message, span);
        }
    }
    Ok(Placement {
        parent: Some(name),
        depth: placement.depth + 1,
        crossed_block: false,
        ancestors: placement.parent.map_or(placement.ancestors, |parent| {
            (placement.ancestors).below((parent, placement.depth, placement.crossed_block), name)
        }),
    })
}

fn node_invalid_placement<T>(message: &str, span: Span) -> Result<T, Diagnostic> {
    invalid(
        "node_invalid_placement",
        &format!(
            "{message}. The browser will 'repair' the HTML (by moving, removing, or inserting \
             elements) which breaks Svelte's assumptions about the structure of your components."
        ),
        span,
    )
}

/// The owner and placement are returned because the children are checked against them.
fn element<'a>(
    input: &CompileInput<'a>,
    identifier: CompilerNodeIdentifier,
    el: &'a Element,
    owner: Option<Owner>,
    placement: &Placement<'a>,
    slots: &mut FxHashSet<&'a str>,
) -> Result<(Option<Owner>, Placement<'a>), Diagnostic> {
    let tree = input.component.compiler_syntax_tree;
    let source = input.component.source_text;
    let node = tree.node(identifier);
    let attributes = tree.attributes(el.attributes);
    let parent = node.parent.map(|parent| &tree.node(parent).kind);
    // Upstream's `SvelteFragment` takes a component or `<svelte:component>`, not `<svelte:self>`.
    if el.kind == ElementKind::Metadata(Some(MetadataTag::Fragment))
        && !matches!(parent, Some(NodeKind::Element(p)) if matches!(p.kind, ElementKind::Component | ElementKind::Metadata(Some(MetadataTag::Component))))
    {
        return invalid(
            "svelte_fragment_invalid_placement",
            "`<svelte:fragment>` must be the direct child of a component",
            node.span,
        );
    }
    lets::fragment(el, attributes)?;
    event_handlers(source, el, attributes)?;
    let slot = attributes
        .iter()
        .find(|a| !is_directive(&a.value) && a.name.text(source) == "slot");
    if let Some(slot) = slot
        && matches!(
            el.kind,
            ElementKind::Regular
                | ElementKind::Metadata(Some(MetadataTag::Element | MetadataTag::Fragment))
        )
        && !matches!(parent, Some(NodeKind::Snippet(_)))
        && !match owner {
            Some(Owner::Component(component)) => node.parent == Some(component),
            Some(Owner::Element) => true,
            None => false,
        }
    {
        return invalid(
            "slot_attribute_invalid_placement",
            "Element with a slot='...' attribute must be a child of a component or a descendant of \
                a custom element",
            slot.span,
        );
    }
    let fills = match owner {
        Some(Owner::Component(component)) => node.parent == Some(component),
        _ => false,
    };
    // Upstream's `SlotElement` checks no `slot` attribute of its own.
    if let Some(slot) = slot
        && el.kind != ElementKind::Slot
        && (fills || matches!(parent, Some(NodeKind::Snippet(_))))
    {
        slots::check(input, slot, node.parent.filter(|_| fills), slots)?;
    }
    if matches!(
        el.kind,
        ElementKind::Regular | ElementKind::Metadata(Some(MetadataTag::Element))
    ) {
        animation(input, parent, attributes)?;
    }
    // The parser has moved content but one text into a `value` after the element's own.
    let values = (attributes.iter())
        .filter(|a| !is_directive(&a.value) && a.name.text(source) == "value")
        .count();
    if el.kind == ElementKind::Regular
        && el.name.text(source) == "textarea"
        && values > usize::from(tree.children(el.children).is_empty())
    {
        return invalid(
            "textarea_invalid_content",
            "A `<textarea>` can have either a value attribute or (equivalently) child content, but \
                not both",
            node.span,
        );
    }
    let placement = element_placement(input, identifier, el, placement)?;
    directives(input, el, attributes)?;
    lets::snippet_conflict(input, el, attributes)?;
    let owner = match el.kind {
        kind if kind.renders_component() => Some(Owner::Component(identifier)),
        ElementKind::Metadata(Some(MetadataTag::Element)) => Some(Owner::Element),
        ElementKind::Regular if is_custom_element_node(tree, source, el) => Some(Owner::Element),
        _ => owner,
    };
    Ok((owner, placement))
}

/// Upstream's `animate:` checks: the element is the one child of a keyed `{#each}`, with one
/// such directive.
fn animation(
    input: &CompileInput<'_>,
    parent: Option<&NodeKind>,
    attributes: &[Attribute],
) -> Result<(), Diagnostic> {
    const PLACEMENT: &str = "An element that uses the `animate:` directive must be the only child \
        of a keyed `{#each ...}` block";
    let tree = input.component.compiler_syntax_tree;
    let source = input.component.source_text;
    let mut animated = false;
    for a in attributes
        .iter()
        .filter(|a| matches!(a.value, AttributeValue::Animate { .. }))
    {
        let Some(NodeKind::Each(each)) = parent else {
            return invalid("animation_invalid_placement", PLACEMENT, a.span);
        };
        if each.key.is_none() {
            return invalid(
                "animation_missing_key",
                &format!("{PLACEMENT}. Did you forget to add a key to your each block?"),
                a.span,
            );
        }
        let children = (tree.children(each.body).iter())
            .map(|&child| &tree.node(child).kind)
            .filter(|kind| {
                !matches!(
                    kind,
                    NodeKind::Comment { .. }
                        | NodeKind::Const { .. }
                        | NodeKind::Declaration { .. }
                ) && !kind.is_blank_text(source)
            })
            .count();
        if children > 1 {
            return invalid("animation_invalid_placement", PLACEMENT, a.span);
        }
        if animated {
            return invalid(
                "animation_duplicate",
                "An element can only have one 'animate' directive",
                a.span,
            );
        }
        animated = true;
    }
    Ok(())
}

/// Upstream's `attribute_invalid_event_handler`: an `on…` attribute of an element is an
/// expression.
fn event_handlers(source: &str, el: &Element, attributes: &[Attribute]) -> Result<(), Diagnostic> {
    if matches!(
        el.kind,
        ElementKind::Regular | ElementKind::Metadata(Some(MetadataTag::Element))
    ) && let Some(handler) = attributes.iter().find(|a| {
        let name = a.name.text(source);
        name.len() > 2
            && name.starts_with("on")
            && matches!(
                a.value,
                AttributeValue::Boolean
                    | AttributeValue::Static(_)
                    | AttributeValue::Interpolated(_)
            )
    }) {
        return invalid(
            "attribute_invalid_event_handler",
            "Event attribute must be a JavaScript expression, not a string",
            handler.span,
        );
    }
    Ok(())
}

/// The directives' own checks, which upstream makes after the element's.
fn directives(
    input: &CompileInput<'_>,
    el: &Element,
    attributes: &[Attribute],
) -> Result<(), Diagnostic> {
    let source = input.component.source_text;
    // Upstream's `BindDirective` reads `parent.name`, which is the tag as written.
    let host = match el.kind {
        ElementKind::Regular => Some(el.name.text(source)),
        ElementKind::Metadata(Some(MetadataTag::Element)) => Some("svelte:element"),
        _ => None,
    };
    for a in attributes {
        if let (AttributeValue::Bind(_), Some(host)) = (&a.value, host) {
            super::super::bindings::check_target(source, host, attributes, a)?;
        }
        if let AttributeValue::Style { modifiers, .. } = &a.value
            && ![Modifiers::default(), Modifiers::IMPORTANT].contains(modifiers)
        {
            return invalid(
                "style_directive_invalid_modifier",
                "`style:` directive can only use the `important` modifier",
                a.span,
            );
        }
        if let AttributeValue::Bind(target) = a.value
            && a.name.text(source) == "group"
            && matches!(
                input.component.javascript.get_expression(target),
                Expression::SequenceExpression(_)
            )
        {
            return invalid(
                "bind_group_invalid_expression",
                "`bind:group` can only bind to an Identifier or MemberExpression",
                a.span,
            );
        }
        if let AttributeValue::Bind(target) = a.value
            && !binds_a_name(input.component.javascript, target)
        {
            return invalid(
                "bind_invalid_expression",
                "Can only bind to an Identifier or MemberExpression or a `{get, set}` pair",
                a.span,
            );
        }
    }
    Ok(())
}

/// Upstream's `bind_invalid_expression` test: a `{get, set}` pair, or a member chain that starts
/// from a name, with no optional chain in it, which cannot be assigned to.
fn binds_a_name(javascript: &Tree, target: ExpressionIdentifier) -> bool {
    // Upstream erases types before it analyzes the template.
    let mut link = javascript.get_expression(target).get_inner_expression();
    if let Expression::SequenceExpression(sequence) = link {
        return sequence.expressions.len() == 2;
    }
    while let Some(member) = link.as_member_expression() {
        link = member.object().get_inner_expression();
    }
    matches!(link, Expression::Identifier(_))
}
