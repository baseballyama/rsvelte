use rsvelte_svelte_syntax::syntax_tree::TemplateNode;

/// `svelte-eslint-parser`'s element kinds.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub(super) enum ElementKind {
    Markup,
    Component,
    /// `<svelte:…>`.
    Special,
}

/// The kind of an element; `None` for other nodes.
pub(super) fn element_kind(node: &TemplateNode, source: &str) -> Option<ElementKind> {
    let TemplateNode::Element {
        name, component, ..
    } = node
    else {
        return None;
    };
    Some(if !component.is_none() {
        ElementKind::Component
    } else if name.text(source).starts_with("svelte:") {
        ElementKind::Special
    } else {
        ElementKind::Markup
    })
}

/// An HTML element or `<svelte:element>`, whose `class` and `style` set the element's.
pub(super) fn is_markup_like(node: &TemplateNode, source: &str) -> bool {
    match (element_kind(node, source), node) {
        (Some(ElementKind::Markup), _) => true,
        (Some(ElementKind::Special), TemplateNode::Element { name, .. }) => {
            name.text(source) == "svelte:element"
        }
        _ => false,
    }
}
