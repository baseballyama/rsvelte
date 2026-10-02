//! Target independent render regions, fixed before JavaScript lowering.

use rsvelte_kernel::newtype_index;
use rsvelte_kernel::source::index::IndexVector;
use rustc_hash::FxHashMap;

use super::compiler_syntax_tree::{Children, NodeKind};
use super::input::CompileInput;

mod normalize;
pub use normalize::{Cleaned, Item, Parent, clean_nodes};

newtype_index!(
    struct RegionIdentifier;
);

#[derive(Debug)]
pub struct RenderPlan {
    regions: IndexVector<RegionIdentifier, Cleaned<'static>>,
    source_regions: FxHashMap<Children, RegionIdentifier>,
}

impl RenderPlan {
    #[must_use]
    pub fn build(input: &CompileInput<'_>) -> Self {
        let mut plan = Self {
            regions: IndexVector::new(),
            source_regions: FxHashMap::default(),
        };
        plan.region(
            input,
            input.compiler_syntax_tree.root,
            Parent::Root,
            input.preserve_whitespace,
        );
        plan
    }

    /// # Panics
    /// If the plan has no region for this child-list key.
    #[must_use]
    pub fn fragment(&self, children: Children) -> &Cleaned<'static> {
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
        let tree = input.compiler_syntax_tree;
        let cleaned = clean_nodes(
            tree,
            input.source_text,
            parent,
            tree.children(children),
            preserve,
        );
        let region = Cleaned {
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
                    let tag = element.name.text(input.source_text).to_ascii_lowercase();
                    self.region(
                        input,
                        element.children,
                        Parent::Element(&tag),
                        preserve || matches!(tag.as_str(), "pre" | "textarea"),
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
                NodeKind::Text { .. } | NodeKind::Comment { .. } | NodeKind::Expression { .. } => {}
            }
        }
    }
}
