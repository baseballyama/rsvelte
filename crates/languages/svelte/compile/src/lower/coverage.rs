//! The template syntax this port does not lower yet, refused before lowering starts so neither
//! target meets it.

use rsvelte_svelte_semantic::compiler_syntax_tree::{
    CompilerNodeIdentifier, ElementKind, MetadataTag,
};
use rsvelte_typescript_semantic::scope::DeclarationKind;

use super::{
    Attribute, AttributeValue, BindingKind, CompileInput, Diagnostic, Element, NodeIdentifier,
    NodeKind, Resolution, unsupported,
};

pub(super) fn check(input: &CompileInput<'_>, res: &Resolution) -> Result<(), Diagnostic> {
    let tree = input.component.compiler_syntax_tree;
    for (identifier, node) in tree.nodes.iter_enumerated() {
        let what = match &node.kind {
            NodeKind::Text { .. }
            | NodeKind::Comment { .. }
            | NodeKind::Expression { .. }
            | NodeKind::If { .. } => None,
            NodeKind::Each(each) => each
                .context()
                .is_none()
                .then_some("an `{#each}` block without `as`"),
            NodeKind::Element(el) => {
                check_element(input, res, identifier, el)?;
                None
            }
            NodeKind::Key { .. } => Some("a `{#key}` block"),
            NodeKind::Await(_) => Some("an `{#await}` block"),
            NodeKind::Snippet(snippet) => {
                let parent_is_boundary = tree.node(identifier).parent.is_some_and(|parent| matches!(&tree.node(parent).kind, NodeKind::Element(element) if element.kind == ElementKind::Metadata(Some(MetadataTag::Boundary))));
                if parent_is_boundary
                    && matches!(
                        input.component.javascript.name(snippet.name),
                        "failed" | "pending"
                    )
                {
                    None
                } else {
                    Some("this snippet")
                }
            }
            NodeKind::Render { .. } => Some("a `{@render}` tag"),
            NodeKind::Html { .. } => Some("an `{@html}` tag"),
            NodeKind::Const { .. } => Some("a `{@const}` tag"),
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
    let component = el.kind == ElementKind::Component;
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
    for a in attributes {
        let name = a.name.text(source);
        if let (Some(tag), &AttributeValue::Bind(target)) = (tag, &a.value)
            && !(tag == "svelte:element" && name == "this")
        {
            check_element_binding(input, res, tag, attributes, a, target)?;
        }
        let what = match a.value {
            AttributeValue::On { .. } if !component && el.kind != ElementKind::Regular => continue,
            AttributeValue::On { .. } => "an `on:` directive",
            AttributeValue::Use { .. } => "a `use:` directive",
            AttributeValue::Transition { .. } => "a transition",
            AttributeValue::Animate { .. } => "an `animate:` directive",
            AttributeValue::Style { .. } => "a `style:` directive",
            AttributeValue::Let(_) => "a `let:` directive",
            _ if !component => {
                if name == "slot" && !super::is_directive(&a.value) && in_component {
                    "a named slot"
                } else {
                    continue;
                }
            }
            AttributeValue::Bind(_) if name == "this" => "`bind:this` on a component",
            AttributeValue::Bind(_) if name == "group" => "`bind:group` on a component",
            AttributeValue::Bind(target) if !is_bindable(input, res, target, true) => {
                "a component binding to anything but a `let`, `$state`, a prop or a member"
            }
            AttributeValue::Attach(_) => "an attachment on a component",
            AttributeValue::Class(_) => "a `class:` directive on a component",
            AttributeValue::Bind(_) | AttributeValue::Spread(_) => continue,
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

fn has_content(input: &CompileInput<'_>, el: &Element) -> bool {
    let tree = input.component.compiler_syntax_tree;
    tree.children(el.children).iter().any(|&child| {
        let kind = &tree.node(child).kind;
        !matches!(kind, NodeKind::Comment { .. })
            && !kind.is_blank_text(input.component.source_text)
    })
}

/// `$state` or a member of an `{#each}` item; a component also takes a `let`, a prop, or a
/// member of any declared name.
fn is_bindable(
    input: &CompileInput<'_>,
    res: &Resolution,
    target: NodeIdentifier,
    component: bool,
) -> bool {
    let javascript = input.component.javascript;
    let root = javascript.member_root(target);
    if !javascript.is_identifier(root) {
        return false;
    }
    let member = root != target;
    res.binding(root)
        .is_some_and(|(binding, info)| match info.kind {
            BindingKind::State | BindingKind::RawState => true,
            BindingKind::Each => member,
            _ if !component => false,
            BindingKind::Property | BindingKind::BindableProperty => true,
            BindingKind::Normal => {
                member
                    || matches!(
                        res.sem.bindings[binding].kind,
                        DeclarationKind::Let | DeclarationKind::Variable
                    )
            }
            _ => member,
        })
}

/// A supported property on a supported element, as upstream's `binding_properties` names it,
/// with no `value`, `checked` or `group` beside it.
fn check_element_binding(
    input: &CompileInput<'_>,
    res: &Resolution,
    tag: &str,
    attributes: &[Attribute],
    a: &Attribute,
    target: NodeIdentifier,
) -> Result<(), Diagnostic> {
    let source_text = input.component.source_text;
    let property = a.name.text(source_text);
    if !supported_binding(source_text, tag, attributes, property) {
        return unsupported(&format!("`bind:{property}` on this `<{tag}>`"), a.span);
    }
    let beside = attributes.iter().any(|o| {
        !std::ptr::eq(o, a) && matches!(o.name.text(source_text), "value" | "checked" | "group")
    });
    if beside {
        return unsupported(
            "a binding beside a `value`, `checked` or `group` attribute",
            a.span,
        );
    }
    if !is_bindable(input, res, target, false) {
        return unsupported(
            "a binding to anything but `$state` or a member of `$state` or of an `{#each}` item",
            a.span,
        );
    }
    Ok(())
}

/// Upstream `binding_properties` that this port lowers, by element.
///
/// `bind:value` on `<input>` (not a checkbox, radio or file input) and `bind:checked` on a
/// checkbox, with the `type` written as static text; `bind:value` on a `<select>` whose
/// `multiple` is static.
fn supported_binding(
    source_text: &str,
    tag: &str,
    attributes: &[Attribute],
    property: &str,
) -> bool {
    if tag != "input" && tag != "select" {
        return false;
    }
    // Upstream rejects a `multiple` that is not static on a bound `<select>`.
    let static_multiple = attributes.iter().all(|a| {
        a.name.text(source_text) != "multiple"
            || matches!(a.value, AttributeValue::Boolean | AttributeValue::Static(_))
    });
    let mut ty = Some("text");
    for a in attributes {
        if a.name.text(source_text) == "type" && !matches!(a.value, AttributeValue::Bind(_)) {
            ty = match &a.value {
                AttributeValue::Static(v) => Some(&**v),
                _ => None,
            };
        }
    }
    match (property, ty) {
        ("value", Some(t)) if tag == "input" => !matches!(t, "checkbox" | "radio" | "file"),
        ("value", _) => tag == "select" && static_multiple,
        ("checked", Some(t)) => tag == "input" && t == "checkbox",
        _ => false,
    }
}
