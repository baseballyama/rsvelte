use rsvelte_kernel::source::index::IndexVector;
use rsvelte_svelte::compilation::compiler_syntax_tree::{
    AttributeValue, Children, CompilerNodeIdentifier, ElementKind, MetadataTag, NodeKind,
};

use crate::input::CompileInput;

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum Namespace {
    #[default]
    Html,
    Svg,
    Mathml,
}

impl Namespace {
    fn parse(value: &str) -> Self {
        match value {
            "svg" | "http://www.w3.org/2000/svg" => Self::Svg,
            "mathml" | "http://www.w3.org/1998/Math/MathML" => Self::Mathml,
            _ => Self::Html,
        }
    }
}

#[derive(Debug)]
pub(super) enum Namespaces {
    AllDefault,
    Foreign(IndexVector<CompilerNodeIdentifier, Namespace>),
}

impl Namespaces {
    pub(super) fn get(&self, node: CompilerNodeIdentifier) -> Namespace {
        match self {
            Self::AllDefault => Namespace::Html,
            Self::Foreign(namespaces) => namespaces[node],
        }
    }
}

pub(super) fn build(input: &CompileInput<'_>) -> Namespaces {
    let tree = input.component.compiler_syntax_tree;
    let configured = tree
        .elements()
        .find_map(|(_, element)| {
            if element.kind != ElementKind::Metadata(Some(MetadataTag::Options)) {
                return None;
            }
            tree.attributes(element.attributes)
                .iter()
                .find_map(|attribute| {
                    if attribute.name.text(input.component.source_text) != "namespace" {
                        return None;
                    }
                    crate::input::static_string(input, &attribute.value).map(Namespace::parse)
                })
        })
        .unwrap_or(Namespace::Html);
    let has_foreign = configured != Namespace::Html
        || tree.elements().any(|(_, element)| {
            if matches!(
                element.name.text(input.component.source_text),
                "svg" | "math"
            ) {
                return true;
            }
            tree.attributes(element.attributes).iter().any(|attribute| {
                if attribute.name.text(input.component.source_text) != "xmlns" {
                    return false;
                }
                match &attribute.value {
                    AttributeValue::Static(value) => Namespace::parse(value) != Namespace::Html,
                    _ => false,
                }
            })
        });
    if !has_foreign {
        return Namespaces::AllDefault;
    }
    let mut namespaces = IndexVector::from_element_n(Namespace::Html, tree.nodes.len());
    walk(input, tree.root, configured, configured, &mut namespaces);
    Namespaces::Foreign(namespaces)
}

fn walk(
    input: &CompileInput<'_>,
    children: Children,
    inherited: Namespace,
    configured: Namespace,
    namespaces: &mut IndexVector<CompilerNodeIdentifier, Namespace>,
) {
    let tree = input.component.compiler_syntax_tree;
    for &identifier in tree.children(children) {
        let mut namespace = inherited;
        let mut children_namespace = inherited;
        match &tree.node(identifier).kind {
            NodeKind::Element(element) => {
                let name = element.name.text(input.component.source_text);
                namespace = match name {
                    "svg" => Namespace::Svg,
                    "math" => Namespace::Mathml,
                    _ => inherited,
                };
                if let Some(value) =
                    tree.attributes(element.attributes)
                        .iter()
                        .find_map(|attribute| {
                            if attribute.name.text(input.component.source_text) != "xmlns" {
                                return None;
                            }
                            if let AttributeValue::Static(value) = &attribute.value {
                                Some(value.as_ref())
                            } else {
                                None
                            }
                        })
                {
                    namespace = Namespace::parse(value);
                }
                children_namespace = if name == "foreignObject" {
                    Namespace::Html
                } else {
                    namespace
                };
            }
            NodeKind::Snippet(_) => children_namespace = configured,
            _ => {}
        }
        namespaces[identifier] = namespace;
        for children in tree.child_lists(identifier) {
            walk(input, children, children_namespace, configured, namespaces);
        }
    }
}
