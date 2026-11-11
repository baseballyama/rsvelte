//! Target independent render regions, fixed before JavaScript lowering.

use rsvelte_kernel::index::{IndexRange, IndexVector};
use rsvelte_kernel::newtype_index;
use rsvelte_svelte_semantic::compiler_syntax_tree::{
    AttributeIdentifier, AttributeValue, Children, CompilerNodeIdentifier, CompilerSyntaxTree,
    ElementKind, MetadataTag, NodeKind,
};
use rustc_hash::FxHashMap;

use crate::input::CompileInput;

mod namespace;
mod normalize;
pub use namespace::{Namespace, Namespaces};
pub(crate) use normalize::is_template_whitespace;
pub use normalize::{Cleaned, Item, Parent, clean_nodes};

newtype_index!(
    struct RegionIdentifier;
);

#[derive(Debug)]
pub struct Region {
    pub hoisted: Box<[CompilerNodeIdentifier]>,
    pub items: Box<[Item<'static>]>,
    pub text_first: bool,
    /// Upstream's inferred fragment namespace, which picks the template function.
    pub namespace: Namespace,
}

/// Each slot's name and region.
type Slots = Box<[(Box<str>, RegionIdentifier)]>;

#[derive(Debug)]
pub struct RenderPlan {
    namespaces: Namespaces,
    regions: IndexVector<RegionIdentifier, Region>,
    source_regions: FxHashMap<Children, RegionIdentifier>,
    /// The slots of each component that has a child with a `slot` name.
    slots: FxHashMap<CompilerNodeIdentifier, Slots>,
}

impl RenderPlan {
    #[must_use]
    pub fn build(input: &CompileInput<'_>) -> Self {
        let mut plan = Self {
            namespaces: Namespaces::build(input),
            regions: IndexVector::new(),
            source_regions: FxHashMap::default(),
            slots: FxHashMap::default(),
        };
        plan.region(
            input,
            input.component.compiler_syntax_tree.root,
            Parent::Root,
            preserves_whitespace(input),
        );
        plan
    }

    #[must_use]
    pub(crate) fn namespace(&self, node: CompilerNodeIdentifier) -> Namespace {
        self.namespaces.get(node)
    }

    /// Upstream `metadata.svg` and `metadata.mathml` of the element `node`.
    #[must_use]
    pub(crate) fn named(&self, node: CompilerNodeIdentifier) -> Namespace {
        self.namespaces.named(node)
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

    /// The regions of a component's slots, in upstream's order: all its `children` as `default`
    /// unless a child names its slot.
    pub(crate) fn slots(
        &self,
        component: CompilerNodeIdentifier,
        children: Children,
    ) -> impl Iterator<Item = (&str, &Region)> {
        let slots = self.slots.get(&component);
        let default = slots
            .is_none()
            .then(|| ("default", self.fragment(children)));
        let named = slots.into_iter().flatten();
        named
            .map(|(name, identifier)| (&**name, &self.regions[*identifier]))
            .chain(default)
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
        let nodes = input.component.compiler_syntax_tree.children(children);
        let identifier = self.nodes_region(input, nodes, parent, preserve);
        self.source_regions.insert(children, identifier);
    }

    fn component_regions(
        &mut self,
        input: &CompileInput<'_>,
        component: CompilerNodeIdentifier,
        children: Children,
        preserve: bool,
    ) {
        self.region(input, children, Parent::Component, preserve);
        let tree = input.component.compiler_syntax_tree;
        let source = input.component.source_text;
        let Some(groups) = slot_groups(tree, source, tree.children(children)) else {
            return;
        };
        let slots = groups
            .into_iter()
            .map(|(name, nodes)| {
                let region = self.nodes_region(input, &nodes, Parent::Component, preserve);
                (name.into(), region)
            })
            .collect();
        self.slots.insert(component, slots);
    }

    fn nodes_region(
        &mut self,
        input: &CompileInput<'_>,
        nodes: &[CompilerNodeIdentifier],
        parent: Parent<'_>,
        preserve: bool,
    ) -> RegionIdentifier {
        let tree = input.component.compiler_syntax_tree;
        let (namespace, drops_whitespace) =
            self.namespaces
                .fragment(tree, input.component.source_text, nodes);
        let cleaned = clean_nodes(
            tree,
            input.component.source_text,
            parent,
            nodes,
            preserve,
            drops_whitespace,
        );
        let region = Region {
            hoisted: cleaned.hoisted,
            items: cleaned
                .items
                .into_iter()
                .map(|item| match item {
                    Item::Node(node) => Item::Node(node),
                    Item::Comment => Item::Comment,
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
        for &node in nodes {
            match &tree.node(node).kind {
                NodeKind::Element(element) if element.kind.renders_component() => {
                    self.component_regions(input, node, element.children, preserve);
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
                            || matches!(tag.as_ref(), "pre" | "textarea" | "script")
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
        identifier
    }
}

/// The `preserveWhitespace` option, or `<svelte:options preserveWhitespace>` set to true.
fn preserves_whitespace(input: &CompileInput<'_>) -> bool {
    let component = &input.component;
    let (tree, javascript) = (&component.compiler_syntax_tree, &component.javascript);
    input.preserve_whitespace
        || tree.elements().any(|(_, element)| {
            element.kind == ElementKind::Metadata(Some(MetadataTag::Options))
                && tree.attributes(element.attributes).iter().any(|attribute| {
                    attribute.name.text(component.source_text) == "preserveWhitespace"
                        && match attribute.value {
                            AttributeValue::Boolean => true,
                            AttributeValue::Expression { expression, .. }
                            | AttributeValue::Shorthand(expression) => matches!(
                                javascript.get_expression(expression).get_inner_expression(),
                                oxc_ast::ast::Expression::BooleanLiteral(literal) if literal.value
                            ),
                            _ => false,
                        }
                })
        })
}

/// A component's children but its snippets, grouped by the slot they fill (upstream
/// `determine_slot`), in the order upstream's object lists the names; `None` when every child
/// fills the default slot.
fn slot_groups<'t>(
    tree: &'t CompilerSyntaxTree,
    source: &str,
    nodes: &[CompilerNodeIdentifier],
) -> Option<Vec<(&'t str, Vec<CompilerNodeIdentifier>)>> {
    let slot = |node| match &tree.node(node).kind {
        NodeKind::Snippet(_) => None,
        NodeKind::Element(element) => Some(slot_name(tree, source, element.attributes)),
        _ => Some(None),
    };
    nodes.iter().find_map(|&node| slot(node).flatten())?;
    let mut groups: Vec<(&str, Vec<CompilerNodeIdentifier>)> = Vec::new();
    for &node in nodes {
        let Some(name) = slot(node) else { continue };
        let name = name.unwrap_or("default");
        match groups.iter_mut().find(|(n, _)| *n == name) {
            Some((_, group)) => group.push(node),
            None => groups.push((name, vec![node])),
        }
    }
    // Object keys that are array indices come first, in numeric order.
    groups.sort_by_key(|&(name, _)| array_index(name).map_or((1, 0), |index| (0, index)));
    Some(groups)
}

fn array_index(name: &str) -> Option<u32> {
    let index = name.parse::<u32>().ok().filter(|&i| i != u32::MAX)?;
    (index.to_string() == name).then_some(index)
}

/// The name a static `slot` attribute gives (upstream `determine_slot`).
pub(crate) fn slot_name<'t>(
    tree: &'t CompilerSyntaxTree,
    source: &str,
    attributes: IndexRange<AttributeIdentifier>,
) -> Option<&'t str> {
    if !tree.has_static_slot(attributes) {
        return None;
    }
    tree.attributes(attributes)
        .iter()
        .find_map(|a| match &a.value {
            AttributeValue::Static(name) if a.name.text(source) == "slot" => Some(&**name),
            _ => None,
        })
}
