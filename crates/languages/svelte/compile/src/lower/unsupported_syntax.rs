//! The template syntax this port does not lower yet, refused before lowering starts so neither
//! target meets it.

use oxc_ast::ast::Expression;
use oxc_syntax::keyword::is_reserved_keyword;
use rsvelte_svelte_semantic::compiler_syntax_tree::{
    CompilerNodeIdentifier, ElementKind, MetadataTag, Name, StyleValue,
};
use rsvelte_typescript_tree::ExpressionIdentifier;

use super::bindings::property_of;
use super::global_binding_table::GlobalBinding;
use super::javascript::member_root;
use super::{
    Attribute, AttributeValue, BindingKind, CompileInput, CompilerSyntaxTree, Diagnostic, Element,
    NodeKind, Resolution, Target, unsupported,
};

pub(super) fn refuse(input: &CompileInput<'_>, res: &Resolution) -> Result<(), Diagnostic> {
    let tree = input.component.compiler_syntax_tree;
    let source = input.component.source_text;
    let renders = tree
        .nodes
        .iter()
        .any(|node| matches!(node.kind, NodeKind::Render { .. }));
    for node in &tree.nodes {
        let what = match &node.kind {
            NodeKind::Text { .. }
            | NodeKind::Comment { .. }
            | NodeKind::Expression { .. }
            | NodeKind::If { .. }
            | NodeKind::Snippet(_)
            | NodeKind::Key { .. }
            | NodeKind::Await(_)
            | NodeKind::Each(_)
            | NodeKind::Debug { .. }
            | NodeKind::Html { .. }
            | NodeKind::Render { .. }
            | NodeKind::Const { .. } => None,
            // Upstream renders `<select>` and `<option>` content apart, which is not lowered.
            NodeKind::Declaration { .. } => node.parent.and_then(|p| match &tree.node(p).kind {
                NodeKind::Element(el)
                    if matches!(el.name.text(source), "select" | "option" | "optgroup") =>
                {
                    Some("a declaration tag in `<select>` or `<option>`")
                }
                _ => None,
            }),
            // A custom element may mix them, which upstream compiles and this port does not lower.
            NodeKind::Element(el) if el.kind == ElementKind::Slot && renders => {
                Some("a `<slot>` beside a `{@render}` tag")
            }
            // Upstream reads a `<slot>`'s `let:` from the `$$slotProps` of the component content
            // it is in, and from no binding outside one.
            NodeKind::Element(el)
                if el.kind == ElementKind::Slot
                    && (tree.attributes(el.attributes).iter())
                        .any(|a| matches!(a.value, AttributeValue::Let(_)))
                    && !in_component_content(tree, node.parent) =>
            {
                Some("a `let:` on a `<slot>` outside a component's content")
            }
            NodeKind::Element(el) => {
                check_element(input, res, el)?;
                None
            }
        };
        if let Some(what) = what {
            return unsupported(what, node.span);
        }
    }
    Ok(())
}

/// What one target does not lower. Upstream's client throws at a `let:` on an element that is
/// not regular, a `<slot>` or `<svelte:fragment>`, and at a binding named after a property no
/// element has, such as an inherited `bind:toString`; its server ignores the first and renders
/// the second as an attribute.
pub(super) fn refuse_for_target(
    input: &CompileInput<'_>,
    target: Target,
) -> Result<(), Diagnostic> {
    if target == Target::Server {
        return Ok(());
    }
    let tree = input.component.compiler_syntax_tree;
    for node in &tree.nodes {
        if let NodeKind::Element(el) = &node.kind
            && !el.kind.renders_component()
            && !matches!(
                el.kind,
                ElementKind::Regular
                    | ElementKind::Slot
                    | ElementKind::Metadata(Some(MetadataTag::Fragment))
            )
            && let Some(a) = (tree.attributes(el.attributes).iter())
                .find(|a| matches!(a.value, AttributeValue::Let(_)))
        {
            return unsupported("a `let:` directive", a.span);
        }
        if let NodeKind::Element(el) = &node.kind
            && let Some((a, what)) = unknown_binding(input, el)
        {
            return unsupported(&what, a.span);
        }
        // Upstream's client assigns to the name, `this = $$value`, which does not parse.
        if let NodeKind::Element(el) = &node.kind
            && let Some(a) = tree.attributes(el.attributes).iter().find(|a| {
                matches!(a.value, AttributeValue::Bind(target)
                    if matches!(input.component.javascript.get_expression(target),
                        Expression::Identifier(name) if is_reserved_keyword(&name.name)))
            })
        {
            return unsupported("a `bind:` shorthand named by a reserved word", a.span);
        }
    }
    Ok(())
}

/// A binding of `el` whose name no element or global property has, which the client cannot
/// lower, with what to call it.
fn unknown_binding<'t>(input: &CompileInput<'t>, el: &Element) -> Option<(&'t Attribute, String)> {
    let tree = input.component.compiler_syntax_tree;
    let source = input.component.source_text;
    let tag = match el.kind {
        ElementKind::Regular => el.name.text(source),
        ElementKind::Metadata(Some(MetadataTag::Element)) => "svelte:element",
        ElementKind::Metadata(Some(
            MetadataTag::Window | MetadataTag::Document | MetadataTag::Body,
        )) => "",
        _ => return None,
    };
    let known = |name: &str| match el.kind {
        ElementKind::Metadata(Some(tag)) if tag != MetadataTag::Element => {
            GlobalBinding::of(tag, name).is_some()
        }
        _ => property_of(name).is_some(),
    };
    let a = (tree.attributes(el.attributes).iter())
        .find(|a| matches!(a.value, AttributeValue::Bind(_)) && !known(a.name.text(source)))?;
    let what = if tag.is_empty() {
        "this global binding".to_owned()
    } else {
        format!("`bind:{}` on this `<{tag}>`", a.name.text(source))
    };
    Some((a, what))
}

/// Whether `at` is in a component's content, which takes slot props, with no snippet between.
fn in_component_content(tree: &CompilerSyntaxTree, mut at: Option<CompilerNodeIdentifier>) -> bool {
    while let Some(identifier) = at {
        let node = tree.node(identifier);
        match &node.kind {
            NodeKind::Element(el) if el.kind.renders_component() => return true,
            NodeKind::Snippet(_) => return false,
            _ => at = node.parent,
        }
    }
    false
}

/// The element and component attributes this port does not lower yet.
fn check_element(
    input: &CompileInput<'_>,
    res: &Resolution,
    el: &Element,
) -> Result<(), Diagnostic> {
    let tree = input.component.compiler_syntax_tree;
    let source = input.component.source_text;
    let component = el.kind.renders_component();
    // Upstream checks the element's name as written.
    let tag = match el.kind {
        ElementKind::Regular => Some(el.name.text(source)),
        ElementKind::Metadata(Some(MetadataTag::Element)) => Some("svelte:element"),
        _ => None,
    };
    let attributes = tree.attributes(el.attributes);
    for a in attributes {
        let name = a.name.text(source);
        if let (Some(tag), &AttributeValue::Bind(target)) = (tag, &a.value)
            && !(tag == "svelte:element" && name == "this")
        {
            check_element_binding(input, res, tag, attributes, a, target)?;
        }
        let what = match a.value {
            AttributeValue::On { .. }
            | AttributeValue::Use { .. }
            | AttributeValue::Transition { .. }
            | AttributeValue::Animate { .. }
                if !component =>
            {
                continue;
            }
            AttributeValue::Style { .. } if matches!(&a.value, AttributeValue::Style { value, .. } if matches!(**value, StyleValue::Empty)) => {
                "a `style:` directive without a value"
            }
            AttributeValue::Let(_) => continue,
            _ if !component => continue,
            AttributeValue::Bind(target) if name == "this" => {
                check_target(input, res, a, target)?;
                continue;
            }
            AttributeValue::Bind(target) => {
                check_target(input, res, a, target)?;
                continue;
            }
            AttributeValue::Class(_) => "a `class:` directive on a component",
            _ => continue,
        };
        return unsupported(what, a.span);
    }
    Ok(())
}

/// Upstream's `bind_invalid_value` takes more: this is `$state`, a `$derived`, a prop, a
/// `let`, a store, or a member of a declared name or of `$state`.
fn is_bindable(input: &CompileInput<'_>, res: &Resolution, target: ExpressionIdentifier) -> bool {
    let target = input
        .component
        .javascript
        .get_expression(target)
        .get_inner_expression()
        .get_inner_expression();
    let Some(root) = member_root(target) else {
        return false;
    };
    let member = !matches!(target, Expression::Identifier(_));
    let Some(symbol) = res.symbol(root) else {
        return member || res.is_store_subscription(&root.name);
    };
    match res.binding(symbol).kind {
        // Upstream rejects a `const` or an import, as the rune walk does; a function or a class
        // is a name it assigns.
        BindingKind::Normal
        | BindingKind::State
        | BindingKind::RawState
        | BindingKind::Derived
        | BindingKind::DerivedBy
        | BindingKind::Property
        | BindingKind::BindableProperty => true,
        _ => member,
    }
}

fn is_accessors(input: &CompileInput<'_>, target: ExpressionIdentifier) -> bool {
    matches!(
        input
            .component
            .javascript
            .get_expression(target)
            .get_inner_expression(),
        Expression::SequenceExpression(_)
    )
}

/// A target that [`is_bindable`] takes, a getter and a setter, or one validation rejects.
fn check_target(
    input: &CompileInput<'_>,
    res: &Resolution,
    a: &Attribute,
    target: ExpressionIdentifier,
) -> Result<(), Diagnostic> {
    if !is_accessors(input, target)
        && !is_bindable(input, res, target)
        && !rejected(input, res, target)
    {
        return unsupported(
            "a binding to anything but a `let`, `$state`, `$derived`, a prop or a member",
            a.span,
        );
    }
    Ok(())
}

/// A binding upstream rejects, whose error the rune walk raises.
fn rejected(input: &CompileInput<'_>, res: &Resolution, target: ExpressionIdentifier) -> bool {
    super::validation::rejects_binding(res, input.component.javascript.get_expression(target))
}

/// A binding validation accepted, with no `value` or `checked` attribute or `group` beside it.
fn check_element_binding(
    input: &CompileInput<'_>,
    res: &Resolution,
    tag: &str,
    attributes: &[Attribute],
    a: &Attribute,
    target: ExpressionIdentifier,
) -> Result<(), Diagnostic> {
    let source_text = input.component.source_text;
    let property = a.name.text(source_text);
    if property == "this" {
        return check_target(input, res, a, target);
    }
    // A group or a checkbox keeps its `value` apart, as `__value`.
    let keeps_value = matches!(property, "group" | "checked");
    let beside = attributes.iter().any(|o| {
        !std::ptr::eq(o, a)
            && match o.name.text(source_text) {
                // A `<textarea>`'s moved content, which a binding renders after.
                "value" if tag == "textarea" && matches!(o.name, Name::Spelled { .. }) => false,
                "value" if !super::is_directive(&o.value) => !keeps_value,
                "checked" => {
                    !matches!(property, "group" | "value") && !super::is_directive(&o.value)
                }
                "group" => true,
                _ => false,
            }
    });
    if beside {
        return unsupported(
            "a binding beside a `value`, `checked` or `group` attribute",
            a.span,
        );
    }
    if property == "group" {
        let source = input.component.javascript.get_expression(target);
        let snippet = member_root(source.get_inner_expression())
            .and_then(|root| res.symbol(root))
            .is_some_and(|symbol| res.binding(symbol).kind == BindingKind::Snippet);
        // Upstream rejects a group of a getter and a setter, or of a snippet's parameter.
        if is_accessors(input, target) || snippet {
            return unsupported("this `bind:group` target", a.span);
        }
    }
    check_target(input, res, a, target)
}
