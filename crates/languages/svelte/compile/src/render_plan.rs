//! Target independent render regions, fixed before JavaScript lowering.

use rsvelte_kernel::newtype_index;
use rsvelte_kernel::source::index::IndexVector;
use rsvelte_svelte::compilation::compiler_syntax_tree::{
    AttributeValue, Children, ElementKind, MetadataTag, NodeKind,
};
use rustc_hash::FxHashMap;

use crate::input::CompileInput;

mod namespace;
mod normalize;
pub use namespace::Namespace;
pub use normalize::{Cleaned, Item, Parent, clean_nodes};

newtype_index!(
    struct RegionIdentifier;
);

#[derive(Debug)]
pub struct Region {
    pub hoisted: Box<[rsvelte_svelte::compilation::compiler_syntax_tree::CompilerNodeIdentifier]>,
    pub items: Box<[Item<'static>]>,
    pub text_first: bool,
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
        node: rsvelte_svelte::compilation::compiler_syntax_tree::CompilerNodeIdentifier,
    ) -> Namespace {
        self.0.get(node)
    }

    pub fn clean_foreign_whitespace(
        &self,
        cleaned: &mut Cleaned<'_>,
        tree: &rsvelte_svelte::compilation::compiler_syntax_tree::CompilerSyntaxTree,
        preserve: bool,
    ) {
        if matches!(self.0, namespace::Namespaces::AllDefault) {
            return;
        }
        let mut namespaces = cleaned
            .items
            .iter()
            .filter_map(|item| {
                if let Item::Node(node) = item
                    && matches!(tree.node(*node).kind, NodeKind::Element(_))
                {
                    Some(self.get(*node))
                } else {
                    None
                }
            })
            .peekable();
        let foreign =
            namespaces.peek().is_some() && namespaces.all(|namespace| namespace != Namespace::Html);
        if foreign && !preserve {
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
                                                rsvelte_typescript::Kind::Boolean(true)
                                            ),
                                            _ => false,
                                        }
                                })
                    }),
        );
        plan
    }

    #[must_use]
    pub fn namespace(
        &self,
        node: rsvelte_svelte::compilation::compiler_syntax_tree::CompilerNodeIdentifier,
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
        self.namespaces
            .clean_foreign_whitespace(&mut cleaned, tree, preserve);
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
        };
        let identifier = self.regions.push(region);
        self.source_regions.insert(children, identifier);
        for &node in tree.children(children) {
            match &tree.node(node).kind {
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
