//! The template errors upstream's parser and analysis raise, one walk for elements and
//! components.

use oxc_ast::ast::Expression;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_semantic::compiler_syntax_tree::{
    Attribute, Each, EachKey, ElementKind, MetadataTag, Modifiers, Part,
};
use rsvelte_typescript_tree::{ExpressionIdentifier, Tree, document_span};
use rustc_hash::FxHashSet;

mod handlers;
mod lets;
mod slot_snippets;
mod slots;

pub(in crate::lower) use handlers::mixed_syntaxes;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_svelte_semantic::compiler_syntax_tree::{
    AttributeValue, Children, CompilerNodeIdentifier, Element, NodeKind,
};
use rsvelte_svelte_semantic::markup_tree::{Ancestors, invalid_with_parent};
use rsvelte_svelte_semantic::typescript::without_typescript;
use rsvelte_svelte_semantic::warnings::{TransitionDirections, slot_name_error};
pub(in crate::lower) use slot_snippets::slot_snippet_conflict;

use crate::input::CompileInput;
use crate::lower::attributes::is_directive;
use crate::lower::invalid;
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
/// that has one, with where upstream's walk raises it: an element's own checks where the walk
/// enters it, before its directives' expressions.
pub(in crate::lower) fn check(input: &CompileInput<'_>) -> Result<(), (u32, Diagnostic)> {
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
) -> Result<(), (u32, Diagnostic)> {
    let tree = input.component.compiler_syntax_tree;
    let source = input.component.source_text;
    let mut slots = FxHashSet::default();
    for &identifier in tree.children(children) {
        let node = tree.node(identifier);
        let here = |e: Diagnostic| (node.span.start_offset, e);
        let text = match &node.kind {
            NodeKind::Expression { .. } => true,
            kind => kind
                .text(source)
                .is_some_and(|text| text.contains(|c| !is_template_whitespace(c))),
        };
        if text
            && let Some(parent) = placement.parent
            && let Some(message) = invalid_with_parent("#text", parent)
        {
            return node_invalid_placement(&message, node.span).map_err(here);
        }
        let (inner, inner_placement) = match &node.kind {
            NodeKind::Element(el) => {
                let entered = element(input, identifier, el, owner, placement, &mut slots);
                let entered = entered.map_err(here)?;
                let attributes = tree.attributes(el.attributes);
                directives(input, el, attributes).map_err(|e| (e.span.start_offset, e))?;
                lets::snippet_conflict(input, el, attributes).map_err(here)?;
                entered
            }
            NodeKind::Each(each) if let Some(rune) = each_rune(input, each) => {
                return super::state_invalid_placement(rune, node.span).map_err(here);
            }
            NodeKind::Each(each) if let Err(e) = each_key(input.component.javascript, each) => {
                return Err(here(e));
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

/// Upstream's `attribute_invalid_sequence_expression`, which it raises in runes mode only: an
/// attribute's expression, or a component's attachment, that is a sequence without parentheses of
/// its own. Each error comes with the start of its element, where the walk raises it.
pub(in crate::lower) fn unparenthesized_sequence(
    input: &CompileInput<'_>,
) -> Option<(u32, Diagnostic)> {
    let tree = input.component.compiler_syntax_tree;
    let javascript = input.component.javascript;
    (tree.elements())
        .filter(|(_, el)| {
            el.kind.renders_component()
                || matches!(
                    el.kind,
                    ElementKind::Regular | ElementKind::Metadata(Some(MetadataTag::Element))
                )
        })
        .filter_map(|(identifier, el)| {
            let sequence = tree.attributes(el.attributes).iter().find_map(|a| {
                let expression = match a.value {
                    AttributeValue::Expression { expression, .. } => expression,
                    AttributeValue::Attach(expression) if el.kind.renders_component() => expression,
                    _ => return None,
                };
                let expression = javascript.get_expression(expression);
                let span = oxc_span::GetSpan::span(expression);
                (matches!(expression, Expression::SequenceExpression(_))
                    && javascript.parentheses(span) == 0)
                    .then_some(span)
            })?;
            let error = crate::lower::error(
                "attribute_invalid_sequence_expression",
                "Comma-separated expressions are not allowed as attribute/directive values in \
                    runes mode, unless wrapped in parentheses",
                document_span(sequence),
            );
            Some((tree.node(identifier).span.start_offset, error))
        })
        .min_by_key(|&(at, _)| at)
}

/// How the block tells its items apart.
///
/// # Errors
///
/// Upstream's `each_key_without_as`.
pub(in crate::lower) fn each_key(javascript: &Tree, each: &Each) -> Result<EachKey, Diagnostic> {
    each.key(javascript).map_err(|key| {
        let key = without_typescript(javascript.get_expression(key));
        let key = oxc_span::GetSpan::span(key);
        crate::lower::error(
            "each_key_without_as",
            "An `{#each ...}` block without an `as` clause cannot have a key",
            document_span(key),
        )
    })
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
        let message = invalid_with_parent(name, parent).map_or_else(
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
        format!(
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
    element_attributes(source, el, attributes)?;
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
        let mut directions = TransitionDirections::default();
        if let Some(error) = attributes.iter().find_map(|a| match a.value {
            AttributeValue::Transition { intro, outro, .. } => {
                directions.visit(intro, outro, a.span)
            }
            _ => None,
        }) {
            return Err(error);
        }
        event_modifiers(attributes)?;
    }
    if el.kind.renders_component() {
        component_attributes(attributes)?;
    }
    if el.kind == ElementKind::Slot {
        slot_attributes(attributes, source)?;
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
    let owner = match el.kind {
        kind if kind.renders_component() => Some(Owner::Component(identifier)),
        ElementKind::Metadata(Some(MetadataTag::Element)) => Some(Owner::Element),
        ElementKind::Regular if tree.is_custom_element(el, source) => Some(Owner::Element),
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
                format!("{PLACEMENT}. Did you forget to add a key to your each block?"),
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

/// The `on:` modifiers an element takes, as upstream's `validate_element` checks them.
fn event_modifiers(attributes: &[Attribute]) -> Result<(), Diagnostic> {
    for a in attributes {
        let AttributeValue::On { modifiers, .. } = a.value else {
            continue;
        };
        if modifiers.contains(Modifiers::NOT_AN_EVENT_MODIFIER) {
            return invalid(
                "event_handler_invalid_modifier",
                "Valid event modifiers are preventDefault, stopPropagation, \
                    stopImmediatePropagation, capture, once, passive, nonpassive, self or trusted",
                a.span,
            );
        }
        for (conflict, name) in [
            (Modifiers::PASSIVE_AND_NONPASSIVE, "nonpassive"),
            (Modifiers::PASSIVE_AND_PREVENT_DEFAULT, "preventDefault"),
        ] {
            if modifiers.contains(conflict) {
                return invalid(
                    "event_handler_invalid_modifier_combination",
                    format!("The 'passive' and '{name}' modifiers cannot be used together"),
                    a.span,
                );
            }
        }
    }
    Ok(())
}

/// Upstream's component checks of each attribute: a directive's kind, an `on:` modifier but one
/// `once`, and an unquoted value of several parts.
fn component_attributes(attributes: &[Attribute]) -> Result<(), Diagnostic> {
    for a in attributes {
        unquoted_sequence(a)?;
        match a.value {
            AttributeValue::Use { .. }
            | AttributeValue::Transition { .. }
            | AttributeValue::Animate { .. }
            | AttributeValue::Style { .. }
            | AttributeValue::Class(_) => {
                return invalid(
                    "component_invalid_directive",
                    "This type of directive is not valid on components",
                    a.span,
                );
            }
            AttributeValue::On { modifiers, .. }
                if ![Modifiers::default(), Modifiers::ONCE].contains(&modifiers) =>
            {
                return invalid(
                    "event_handler_invalid_component_modifier",
                    "Event modifiers other than 'once' can only be used on DOM elements",
                    a.span,
                );
            }
            _ => {}
        }
    }
    Ok(())
}

/// Upstream's `SlotElement`: attributes, spreads and `let:` only, and a static `name` that is not
/// `default`.
fn slot_attributes(attributes: &[Attribute], source: &str) -> Result<(), Diagnostic> {
    for a in attributes {
        match &a.value {
            AttributeValue::Spread(_) | AttributeValue::Let(_) => {}
            value if is_directive(value) => {
                return invalid(
                    "slot_element_invalid_attribute",
                    "`<slot>` can only receive attributes and (optionally) let directives",
                    a.span,
                );
            }
            value if a.name.text(source) == "name" => {
                let name = match value {
                    AttributeValue::Static(text) => Some(&**text),
                    _ => None,
                };
                if let Some((code, message)) = slot_name_error(name) {
                    return invalid(code, message, a.span);
                }
            }
            _ => {}
        }
    }
    Ok(())
}

/// Upstream `validate_element`'s checks of each attribute of an element, in its order: an
/// unquoted value of several parts, a name no element takes, and an `on…` attribute that is not
/// an expression.
fn element_attributes(
    source: &str,
    el: &Element,
    attributes: &[Attribute],
) -> Result<(), Diagnostic> {
    if !matches!(
        el.kind,
        ElementKind::Regular | ElementKind::Metadata(Some(MetadataTag::Element))
    ) {
        return Ok(());
    }
    // Upstream checks the start tag's attributes before it moves a `<textarea>`'s content into a
    // `value`.
    let written = |a: &&Attribute| a.span.end_offset <= el.start_tag.end_offset;
    for a in (attributes.iter())
        .filter(written)
        .filter(|a| !is_directive(&a.value))
    {
        unquoted_sequence(a)?;
        let name = a.name.text(source);
        if is_invalid_attribute_name(name) {
            return invalid(
                "attribute_invalid_name",
                format!("'{name}' is not a valid attribute name"),
                a.span,
            );
        }
        if name.len() > 2
            && name.starts_with("on")
            && matches!(
                a.value,
                AttributeValue::Boolean
                    | AttributeValue::Static(_)
                    | AttributeValue::Interpolated(_)
            )
        {
            return invalid(
                "attribute_invalid_event_handler",
                "Event attribute must be a JavaScript expression, not a string",
                a.span,
            );
        }
    }
    Ok(())
}

/// Upstream's `regex_illegal_attribute_character`.
fn is_invalid_attribute_name(name: &str) -> bool {
    name.starts_with(|c: char| c.is_ascii_digit() || c == '-' || c == '.')
        || name.contains(|c| "^$@%&#?!|()[]{}*+~;".contains(c))
}

/// Upstream's `attribute_unquoted_sequence`: a value of text and expressions needs quotes, which
/// put its last part's end before the attribute's.
fn unquoted_sequence(a: &Attribute) -> Result<(), Diagnostic> {
    let AttributeValue::Interpolated(parts) = &a.value else {
        return Ok(());
    };
    let last_end = |part: &Part| match *part {
        Part::Text(span) | Part::Expression { span, .. } => span.end_offset,
    };
    if parts.len() > 1
        && parts
            .last()
            .is_some_and(|p| last_end(p) == a.span.end_offset)
    {
        return invalid(
            "attribute_unquoted_sequence",
            "Attribute values containing `{...}` must be enclosed in quote marks, unless the \
                value only contains the expression",
            a.span,
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
            crate::lower::bindings::check_binding(source, host, attributes, a)?;
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
            && let pair @ Expression::SequenceExpression(_) =
                input.component.javascript.get_expression(target)
            && input
                .component
                .javascript
                .parentheses(oxc_span::GetSpan::span(pair))
                > 0
        {
            return invalid(
                "bind_invalid_parens",
                format!(
                    "`bind:{}={{get, set}}` must not have surrounding parentheses",
                    a.name.text(source)
                ),
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
