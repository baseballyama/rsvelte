//! Target independent render regions, fixed before JavaScript lowering.

use rsvelte_kernel::index::IndexVector;
use rsvelte_kernel::newtype_index;
use rsvelte_svelte_semantic::compiler_syntax_tree::{
    AttributeValue, Children, ElementKind, MetadataTag, NodeKind,
};
use rustc_hash::FxHashMap;

use crate::input::CompileInput;

mod namespace;
mod normalize;
pub use namespace::Namespace;
pub(crate) use namespace::{is_mathml, is_svg};
pub use normalize::{Cleaned, Item, Parent, clean_nodes};

newtype_index!(
    struct RegionIdentifier;
);

#[derive(Debug)]
pub struct Region {
    pub hoisted: Box<[rsvelte_svelte_semantic::compiler_syntax_tree::CompilerNodeIdentifier]>,
    pub items: Box<[Item<'static>]>,
    pub text_first: bool,
    /// Upstream's inferred fragment namespace, which picks the template function.
    pub namespace: Namespace,
}

#[derive(Debug)]
pub struct NamespacePlan(namespace::Namespaces);

impl NamespacePlan {
    #[must_use]
    pub fn build(input: &CompileInput<'_>) -> Self {
        Self(namespace::build(input))
    }

    #[must_use]
    pub fn get(
        &self,
        node: rsvelte_svelte_semantic::compiler_syntax_tree::CompilerNodeIdentifier,
    ) -> Namespace {
        self.0.get(node)
    }

    /// Upstream `infer_namespace` for the fragment `nodes`, which their parent node holds.
    #[must_use]
    pub fn infer(
        &self,
        tree: &rsvelte_svelte_semantic::compiler_syntax_tree::CompilerSyntaxTree,
        source_text: &str,
        nodes: &[rsvelte_svelte_semantic::compiler_syntax_tree::CompilerNodeIdentifier],
    ) -> Namespace {
        self.0.infer(tree, source_text, nodes)
    }

    /// Drops the whitespace-only text between `nodes` that their `namespace` drops.
    pub fn drop_foreign_whitespace(
        &self,
        cleaned: &mut Cleaned<'_>,
        namespace: Namespace,
        nodes: &[rsvelte_svelte_semantic::compiler_syntax_tree::CompilerNodeIdentifier],
    ) {
        if self.0.drops_whitespace(namespace, nodes) {
            cleaned.items.retain(|item| match item {
                Item::Text { data, .. } => !data.chars().all(char::is_whitespace),
                _ => true,
            });
        }
    }
}

#[derive(Debug)]
pub struct RenderPlan {
    namespaces: NamespacePlan,
    regions: IndexVector<RegionIdentifier, Region>,
    source_regions: FxHashMap<Children, RegionIdentifier>,
}

impl RenderPlan {
    #[must_use]
    pub fn build(input: &CompileInput<'_>) -> Self {
        let mut plan = Self {
            namespaces: NamespacePlan::build(input),
            regions: IndexVector::new(),
            source_regions: FxHashMap::default(),
        };
        plan.region(
            input,
            input.component.compiler_syntax_tree.root,
            Parent::Root,
            input.preserve_whitespace
                || input
                    .component
                    .compiler_syntax_tree
                    .elements()
                    .any(|(_, element)| {
                        element.kind == ElementKind::Metadata(Some(MetadataTag::Options))
                            && input
                                .component
                                .compiler_syntax_tree
                                .attributes(element.attributes)
                                .iter()
                                .any(|attribute| {
                                    attribute.name.text(input.component.source_text)
                                        == "preserveWhitespace"
                                        && match attribute.value {
                                            AttributeValue::Boolean => true,
                                            AttributeValue::Expression { expression, .. }
                                            | AttributeValue::Shorthand(expression) => matches!(
                                                input.component.javascript.kind(expression),
                                                rsvelte_typescript_syntax::Kind::Boolean(true)
                                            ),
                                            _ => false,
                                        }
                                })
                    }),
        );
        plan
    }

    #[must_use]
    pub(crate) fn namespace(
        &self,
        node: rsvelte_svelte_semantic::compiler_syntax_tree::CompilerNodeIdentifier,
    ) -> Namespace {
        self.namespaces.get(node)
    }

    /// # Panics
    /// If the plan has no region for this child-list key.
    #[must_use]
    pub fn fragment(&self, children: Children) -> &Region {
        let identifier = self
            .source_regions
            .get(&children)
            .expect("every render region was prepared");
        &self.regions[*identifier]
    }

    fn region(
        &mut self,
        input: &CompileInput<'_>,
        children: Children,
        parent: Parent<'_>,
        preserve: bool,
    ) {
        // Empty child lists can share an offset; they all normalize to the same empty region.
        if self.source_regions.contains_key(&children) {
            return;
        }
        let tree = input.component.compiler_syntax_tree;
        let mut cleaned = clean_nodes(
            tree,
            input.component.source_text,
            parent,
            tree.children(children),
            preserve,
        );
        let nodes = tree.children(children);
        let namespace = self
            .namespaces
            .infer(tree, input.component.source_text, nodes);
        if !preserve {
            self.namespaces
                .drop_foreign_whitespace(&mut cleaned, namespace, nodes);
        }
        let region = Region {
            hoisted: cleaned.hoisted,
            items: cleaned
                .items
                .into_iter()
                .map(|item| match item {
                    Item::Node(node) => Item::Node(node),
                    Item::Expression(expression) => Item::Expression(expression),
                    Item::Text { data, raw } => Item::Text {
                        data: data.into_owned().into(),
                        raw: raw.into_owned().into(),
                    },
                })
                .collect(),
            text_first: cleaned.text_first,
            namespace,
        };
        let identifier = self.regions.push(region);
        self.source_regions.insert(children, identifier);
        for &node in tree.children(children) {
            match &tree.node(node).kind {
                NodeKind::Element(element) if element.kind == ElementKind::Component => {
                    self.region(input, element.children, Parent::Component, preserve);
                }
                NodeKind::Element(element) => {
                    let tag = element.name.text(input.component.source_text);
                    let tag = if tag.bytes().any(|byte| byte.is_ascii_uppercase()) {
                        std::borrow::Cow::Owned(tag.to_ascii_lowercase())
                    } else {
                        std::borrow::Cow::Borrowed(tag)
                    };
                    self.region(
                        input,
                        element.children,
                        Parent::Element(&tag),
                        preserve
                            || matches!(tag.as_ref(), "pre" | "textarea")
                            || element.kind == ElementKind::Title,
                    );
                }
                NodeKind::If {
                    branches,
                    otherwise,
                } => {
                    for branch in tree.branches(*branches) {
                        self.region(input, branch.body, Parent::Block, preserve);
                    }
                    if let Some(otherwise) = otherwise {
                        self.region(input, *otherwise, Parent::Block, preserve);
                    }
                }
                NodeKind::Each(each) => {
                    self.region(input, each.body, Parent::Each, preserve);
                    if let Some(fallback) = each.fallback {
                        self.region(input, fallback, Parent::Each, preserve);
                    }
                }
                NodeKind::Key { .. } | NodeKind::Await(_) => {
                    for c in tree.child_lists(node) {
                        self.region(input, c, Parent::Block, preserve);
                    }
                }
                NodeKind::Snippet(snippet) => {
                    self.region(input, snippet.body, Parent::Snippet, preserve);
                }
                NodeKind::Text { .. }
                | NodeKind::Comment { .. }
                | NodeKind::Expression { .. }
                | NodeKind::Render { .. }
                | NodeKind::Html { .. }
                | NodeKind::Const { .. }
                | NodeKind::Debug { .. }
                | NodeKind::Declaration { .. } => {}
            }
        }
    }
}
