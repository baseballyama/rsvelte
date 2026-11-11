//! The template syntax this port does not lower yet, refused before lowering starts so neither
//! target meets it.

use oxc_ast::ast::{Expression, VariableDeclarationKind};
use rsvelte_svelte_semantic::compiler_syntax_tree::{
    CompilerNodeIdentifier, ElementKind, MetadataTag, Part, StyleValue,
};
use rsvelte_typescript_tree::ExpressionIdentifier;

use super::bindings::{Lowering, attribute_value, property_of};
use super::javascript::member_root;
use super::{
    Attribute, AttributeValue, BindingKind, CompileInput, Diagnostic, Element, NodeKind,
    Resolution, unsupported,
};

pub(super) fn check(input: &CompileInput<'_>, res: &Resolution) -> Result<(), Diagnostic> {
    let tree = input.component.compiler_syntax_tree;
    let source = input.component.source_text;
    let ignores_html_changes = tree.nodes.iter().any(|node| {
        matches!(node.kind, NodeKind::Comment { data } if data.text(source).contains("hydration_html_changed"))
    });
    let renders = tree
        .nodes
        .iter()
        .any(|node| matches!(node.kind, NodeKind::Render { .. }));
    for (identifier, node) in tree.nodes.iter_enumerated() {
        let what = match &node.kind {
            NodeKind::Text { .. }
            | NodeKind::Comment { .. }
            | NodeKind::Expression { .. }
            | NodeKind::If { .. }
            | NodeKind::Snippet(_)
            | NodeKind::Key { .. }
            | NodeKind::Render { .. } => None,
            // Upstream passes a `svelte-ignore hydration_html_changed` on to `$.html`.
            NodeKind::Html { .. } => ignores_html_changes.then_some("an ignored `{@html}` change"),
            NodeKind::Each(each) => each
                .context
                .is_none()
                .then_some("an `{#each}` block without `as`"),
            // Upstream's `slot_snippet_conflict`.
            NodeKind::Element(el) if el.kind == ElementKind::Slot && renders => {
                Some("a `<slot>` beside a `{@render}` tag")
            }
            NodeKind::Element(el) => {
                check_element(input, res, identifier, el)?;
                // Upstream moves a boundary's `{@const}` into its `failed` snippet, and rejects one
                // that a component's snippet reads.
                let has = |f: fn(&NodeKind) -> bool| {
                    tree.children(el.children)
                        .iter()
                        .any(|&c| f(&tree.node(c).kind))
                };
                (has(|k| matches!(k, NodeKind::Const { .. }))
                    && (el.kind == ElementKind::Metadata(Some(MetadataTag::Boundary))
                        || has(|k| matches!(k, NodeKind::Snippet(_)))))
                .then_some("a `{@const}` beside a snippet")
            }
            NodeKind::Await(_) => Some("an `{#await}` block"),
            &NodeKind::Const { declaration } => const_tag(input, res, declaration),
            NodeKind::Debug { .. } => Some("a `{@debug}` tag"),
            NodeKind::Declaration { .. } => Some("a declaration tag"),
        };
        if let Some(what) = what {
            return unsupported(what, node.span);
        }
    }
    Ok(())
}

/// The element and component attributes this port does not lower yet.
fn check_element(
    input: &CompileInput<'_>,
    res: &Resolution,
    identifier: CompilerNodeIdentifier,
    el: &Element,
) -> Result<(), Diagnostic> {
    let tree = input.component.compiler_syntax_tree;
    let source = input.component.source_text;
    // Upstream sets a custom element's attributes as properties, which is not lowered.
    if super::is_custom_element_node(tree, source, el)
        && let Some(a) = tree
            .attributes(el.attributes)
            .iter()
            .find(|a| super::is_directive(&a.value) || a.name.text(source) != "is")
    {
        return unsupported("an attribute on a custom element", a.span);
    }
    // Upstream's `slot_element_invalid_attribute`.
    if el.kind == ElementKind::Slot
        && let Some(a) = tree.attributes(el.attributes).iter().find(|a| {
            super::is_directive(&a.value)
                && !matches!(a.value, AttributeValue::Spread(_) | AttributeValue::Let(_))
        })
    {
        return unsupported("a directive on `<slot>`", a.span);
    }
    let component = el.kind.renders_component();
    let in_component = tree.node(identifier).parent.is_some_and(|parent| {
        matches!(&tree.node(parent).kind, NodeKind::Element(owner) if owner.kind.renders_component())
    });
    // Upstream checks the element's name as written.
    let tag = match el.kind {
        ElementKind::Regular => Some(el.name.text(source)),
        ElementKind::Metadata(Some(MetadataTag::Element)) => Some("svelte:element"),
        _ => None,
    };
    let attributes = tree.attributes(el.attributes);
    if tag == Some("textarea") {
        check_textarea(input, el)?;
    }
    for a in attributes {
        let name = a.name.text(source);
        if let (Some(tag), &AttributeValue::Bind(target)) = (tag, &a.value)
            && !(tag == "svelte:element" && name == "this")
        {
            check_element_binding(input, res, tag, attributes, a, target)?;
        }
        if component {
            check_component_attribute(a)?;
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
            AttributeValue::On { .. } => "an `on:` directive",
            AttributeValue::Style { .. } if matches!(&a.value, AttributeValue::Style { value, .. } if matches!(**value, StyleValue::Empty)) => {
                "a `style:` directive without a value"
            }
            // Upstream adds an empty `style` beside its own empty `class`, which this port does
            // not.
            AttributeValue::Style { .. } if tag == Some("svelte:element") => {
                "a `style:` directive on `<svelte:element>`"
            }
            AttributeValue::Style { .. } if !component => continue,
            AttributeValue::Let(_) => "a `let:` directive",
            _ if !component => {
                if name == "slot" && !super::is_directive(&a.value) && in_component {
                    "a named slot"
                } else {
                    continue;
                }
            }
            AttributeValue::Bind(target) if name == "this" => {
                check_target(input, res, a, target)?;
                continue;
            }
            AttributeValue::Bind(target) => {
                check_target(input, res, a, target)?;
                continue;
            }
            AttributeValue::Attach(_) => "an attachment on a component",
            AttributeValue::Class(_) => "a `class:` directive on a component",
            AttributeValue::Spread(_) => continue,
            _ if name.starts_with("--") => "a CSS custom property on a component",
            _ if name == "slot" => "a `slot` attribute",
            _ if name == "children" && has_content(input, el) => {
                "a `children` prop beside the component's content"
            }
            _ => continue,
        };
        return unsupported(what, a.span);
    }
    Ok(())
}

/// Upstream moves a `<textarea>`'s content that is not one text into its `value`.
fn check_textarea(input: &CompileInput<'_>, el: &Element) -> Result<(), Diagnostic> {
    let tree = input.component.compiler_syntax_tree;
    let source = input.component.source_text;
    let attributes = tree.attributes(el.attributes);
    let children = tree.children(el.children);
    let text =
        |&child: &CompilerNodeIdentifier| matches!(tree.node(child).kind, NodeKind::Text { .. });
    if !children.is_empty()
        && (children.len() > 1
            || !children.iter().all(text)
            || attribute_value(source, attributes, "value").is_some())
    {
        return unsupported(
            "a `<textarea>` with content beside a `value`, or not one text",
            el.name,
        );
    }
    if let Some(AttributeValue::Interpolated(parts)) = attribute_value(source, attributes, "value")
        && let Some(Part::Text(first)) = parts.first()
        && matches!(
            first.text(source).as_bytes(),
            [b'\n', ..] | [b'\r', b'\n', ..]
        )
    {
        return unsupported("a `<textarea>` value that starts with a newline", el.name);
    }
    Ok(())
}

fn has_content(input: &CompileInput<'_>, el: &Element) -> bool {
    let tree = input.component.compiler_syntax_tree;
    tree.children(el.children).iter().any(|&child| {
        let kind = &tree.node(child).kind;
        !matches!(kind, NodeKind::Comment { .. })
            && !kind.is_blank_text(input.component.source_text)
    })
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
        return res.is_store_subscription(&root.name);
    };
    match res.binding(symbol).kind {
        BindingKind::State
        | BindingKind::RawState
        | BindingKind::Derived
        | BindingKind::DerivedBy
        | BindingKind::Property
        | BindingKind::BindableProperty => true,
        BindingKind::Normal => {
            member
                || matches!(
                    res.variable_kind(symbol),
                    Some(VariableDeclarationKind::Let | VariableDeclarationKind::Var)
                )
        }
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

/// Upstream's `component_invalid_directive`, which the refusals below would hide.
fn check_component_attribute(a: &Attribute) -> Result<(), Diagnostic> {
    match a.value {
        AttributeValue::Use { .. }
        | AttributeValue::Transition { .. }
        | AttributeValue::Animate { .. }
        | AttributeValue::Style { .. }
        | AttributeValue::Class(_) => super::special::invalid(
            "component_invalid_directive",
            "This type of directive is not valid on components",
            a.span,
        ),
        _ => Ok(()),
    }
}

/// A binding upstream rejects, whose error the rune walk raises.
fn rejected(input: &CompileInput<'_>, res: &Resolution, target: ExpressionIdentifier) -> bool {
    super::validation::rejects_binding(res, input.component.javascript.get_expression(target))
}

/// A supported property on a supported element, as upstream's `binding_properties` names it,
/// with no `value` or `checked` attribute or `group` beside it.
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
    if !supported_binding(source_text, tag, attributes, property) {
        return unsupported(&format!("`bind:{property}` on this `<{tag}>`"), a.span);
    }
    // A group or a checkbox keeps its `value` apart, as `__value`.
    let keeps_value = matches!(property, "group" | "checked");
    let beside = attributes.iter().any(|o| {
        !std::ptr::eq(o, a)
            && match o.name.text(source_text) {
                "value" if !super::is_directive(&o.value) => {
                    !keeps_value || matches!(o.value, AttributeValue::Interpolated(_))
                }
                "checked" => !super::is_directive(&o.value),
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

/// A `bind:` property that upstream's `BindDirective` analysis accepts on `tag`; this port
/// raises none of the errors it would.
fn supported_binding(
    source_text: &str,
    tag: &str,
    attributes: &[Attribute],
    property: &str,
) -> bool {
    let Some(p) = property_of(property) else {
        return false;
    };
    // Upstream checks `svelte:element` against each property's elements too.
    if tag == "svelte:element" || p.elements.is_some_and(|e| !e.contains(&tag)) {
        return false;
    }
    if tag == "input" {
        // Upstream takes only `bind:value` beside a `type` not written as text.
        let ty = match attribute_value(source_text, attributes, "type") {
            None => None,
            Some(AttributeValue::Static(ty)) => Some(&**ty),
            Some(AttributeValue::Boolean) => return false,
            Some(_) => return property == "value",
        };
        let wanted = match property {
            "checked" => Some("checkbox"),
            "files" => Some("file"),
            _ => ty,
        };
        if ty != wanted {
            return false;
        }
    }
    if tag == "select"
        && attribute_value(source_text, attributes, "multiple")
            .is_some_and(|m| !matches!(m, AttributeValue::Boolean | AttributeValue::Static(_)))
    {
        return false;
    }
    if property == "offsetWidth" && rsvelte_svelte_syntax::names::is_svg(tag) {
        return false;
    }
    if p.lowering == Lowering::ContentEditable {
        let editable = attribute_value(source_text, attributes, "contenteditable");
        if !matches!(
            editable,
            Some(AttributeValue::Boolean | AttributeValue::Static(_))
        ) {
            return false;
        }
    }
    true
}

/// The `{@const}` tags this port does not lower: a destructured one, and one that reads a later
/// tag, which upstream rejects as a cycle.
fn const_tag(
    input: &CompileInput<'_>,
    res: &Resolution,
    declaration: rsvelte_typescript_tree::DeclarationIdentifier,
) -> Option<&'static str> {
    struct Later<'r> {
        res: &'r Resolution,
        start: u32,
        found: bool,
    }
    impl<'a> oxc_ast_visit::Visit<'a> for Later<'_> {
        fn visit_identifier_reference(&mut self, it: &oxc_ast::ast::IdentifierReference<'a>) {
            if let Some(symbol) = self.res.symbol(it) {
                self.found |= self.res.binding(symbol).kind == BindingKind::Template
                    && self.res.scoping().symbol_span(symbol).start > self.start;
            }
        }
    }
    let d = &input
        .component
        .javascript
        .get_declaration(declaration)
        .declarations[0];
    if !matches!(d.id, oxc_ast::ast::BindingPattern::BindingIdentifier(_)) {
        return Some("a destructured `{@const}` tag");
    }
    let mut later = Later {
        res,
        start: d.span.start,
        found: false,
    };
    if let Some(init) = &d.init {
        oxc_ast_visit::Visit::visit_expression(&mut later, init);
    }
    later.found.then_some("a `{@const}` that reads a later one")
}
