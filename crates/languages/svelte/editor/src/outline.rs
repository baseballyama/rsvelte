//! The outline the official language server reads a component as: the markup's elements and
//! comments, with the blocks between them left out, and the scripts and the style sheet as
//! elements.

use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{Component, Range, TagAttributes, TemplateNode};

#[derive(Clone, Copy)]
pub(crate) enum Item<'a> {
    /// An element or a comment, by its node.
    Node(u32),
    /// A script or the style sheet.
    Tag {
        span: Span,
        attributes: &'a [TagAttributes],
    },
}

/// The items at the top of `component`, in the order they are written.
pub(crate) fn top_level<'a>(component: &'a Component, text: &str) -> Vec<Item<'a>> {
    let mut items = within(component, text, component.root);
    let scripts = [&component.module, &component.instance]
        .into_iter()
        .flatten();
    let tags = (scripts.map(|script| (script.span, script.attributes.as_slice())))
        .chain((component.style.iter()).map(|style| (style.span, style.attributes.as_slice())));
    items.extend(tags.map(|(span, attributes)| Item::Tag { span, attributes }));
    items.sort_by_key(|item| match *item {
        Item::Node(id) => component.nodes[id as usize].span().start_offset,
        Item::Tag { span, .. } => span.start_offset,
    });
    items
}

/// The elements and comments of `nodes` and of the blocks among them, in order.
pub(crate) fn within<'a>(component: &'a Component, text: &str, nodes: Range) -> Vec<Item<'a>> {
    let mut items = Vec::new();
    collect(component, text, nodes, &mut items);
    items
}

fn collect<'a>(component: &'a Component, text: &str, nodes: Range, items: &mut Vec<Item<'a>>) {
    for &id in nodes.get(&component.children) {
        match &component.nodes[id as usize] {
            // The server reads `<!doctype html>` as a declaration, not an element.
            TemplateNode::Element { name, .. } if name.text(text).starts_with('!') => {}
            TemplateNode::Element { .. } | TemplateNode::Comment { .. } => {
                items.push(Item::Node(id));
            }
            TemplateNode::If {
                consequent,
                alternate,
                ..
            } => {
                collect(component, text, *consequent, items);
                if let Some(alternate) = alternate {
                    collect(component, text, *alternate, items);
                }
            }
            TemplateNode::Each {
                body,
                fallback,
                has_fallback,
                ..
            } => {
                collect(component, text, *body, items);
                if *has_fallback {
                    collect(component, text, *fallback, items);
                }
            }
            TemplateNode::Key { body, .. } | TemplateNode::Snippet { body, .. } => {
                collect(component, text, *body, items);
            }
            TemplateNode::Await {
                pending,
                then,
                catch,
                ..
            } => {
                for branch in [pending, then, catch] {
                    if let Some(branch) = branch.present() {
                        collect(component, text, branch, items);
                    }
                }
            }
            _ => {}
        }
    }
}
