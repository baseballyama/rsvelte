//! The template syntax this port does not lower yet, refused before lowering starts so neither
//! target meets it.

use rsvelte_svelte::compilation::compiler_syntax_tree::{ElementKind, MetadataTag};

use super::{AttributeValue, CompileInput, Diagnostic, NodeKind, unsupported};

pub(super) fn check(input: &CompileInput<'_>) -> Result<(), Diagnostic> {
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
                for a in tree.attributes(el.attributes) {
                    let what = match a.value {
                        AttributeValue::On { .. } if el.kind != ElementKind::Regular => continue,
                        AttributeValue::On { .. } => "an `on:` directive",
                        AttributeValue::Use { .. } => "a `use:` directive",
                        AttributeValue::Transition { .. } => "a transition",
                        AttributeValue::Animate { .. } => "an `animate:` directive",
                        AttributeValue::Style { .. } => "a `style:` directive",
                        AttributeValue::Let(_) => "a `let:` directive",
                        _ => continue,
                    };
                    return unsupported(what, a.span);
                }
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
