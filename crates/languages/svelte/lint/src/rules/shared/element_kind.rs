use rsvelte_svelte_syntax::names::is_component_name;
use rsvelte_svelte_syntax::syntax_tree::TemplateNode;

/// `svelte-eslint-parser`'s element kinds.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub(crate) enum ElementKind {
    Markup,
    Component,
    /// `<svelte:…>`.
    Special,
}

/// The kind of an element; `None` for other nodes.
pub(crate) fn element_kind(node: &TemplateNode, source: &str) -> Option<ElementKind> {
    let TemplateNode::Element { name, .. } = node else {
        return None;
    };
    let name = name.text(source);
    // By name, not by the parsed reference: Svelte calls `<Foo.>` a component, and it has none.
    Some(if is_component_name(name) {
        ElementKind::Component
    } else if name.starts_with("svelte:") {
        ElementKind::Special
    } else {
        ElementKind::Markup
    })
}

/// An HTML element or `<svelte:element>`, whose `class` and `style` set the element's.
pub(crate) fn is_markup_like(node: &TemplateNode, source: &str) -> bool {
    match (element_kind(node, source), node) {
        (Some(ElementKind::Markup), _) => true,
        (Some(ElementKind::Special), TemplateNode::Element { name, .. }) => {
            name.text(source) == "svelte:element"
        }
        _ => false,
    }
}
