use super::{
    Attribute, AttributeIdentifier, Branch, Branches, Children, CompilerNodeIdentifier,
    CompilerSyntaxTree, CompilerSyntaxTreeBuilder, ElementKind, IndexRange, IndexVector,
    MetadataTag, Node, NodeIdentifier, NodeKind, NodeList, Span, TemplateNodeIdentifier,
    decode_text, is_component_name,
};

impl<'s> CompilerSyntaxTreeBuilder<'s> {
    #[must_use]
    pub fn new(source_text: &'s str, nodes: usize, attributes: usize) -> Self {
        CompilerSyntaxTreeBuilder {
            source_text,
            compiler_syntax_tree: CompilerSyntaxTree {
                nodes: IndexVector::with_capacity(nodes),
                attributes: IndexVector::with_capacity(attributes),
                origin: IndexVector::with_capacity(nodes),
                children: Vec::with_capacity(nodes),
                branches: Vec::new(),
                javascript_lists: Vec::new(),
                component_references: Vec::new(),
                root: Children::default(),
            },
        }
    }

    /// Adds a node; an element or an `if` gets its kind from
    /// [`CompilerSyntaxTreeBuilder::set_kind`] once its children are built.
    pub fn node(
        &mut self,
        kind: NodeKind,
        span: Span,
        parent: Option<CompilerNodeIdentifier>,
        origin: TemplateNodeIdentifier,
    ) -> CompilerNodeIdentifier {
        self.compiler_syntax_tree.origin.push(origin);
        self.compiler_syntax_tree
            .nodes
            .push(Node { kind, span, parent })
    }

    pub fn component_reference(
        &mut self,
        identifier: CompilerNodeIdentifier,
        reference: NodeIdentifier,
    ) {
        self.compiler_syntax_tree
            .component_references
            .push((identifier, reference));
    }

    pub fn set_kind(&mut self, identifier: CompilerNodeIdentifier, kind: NodeKind) {
        self.compiler_syntax_tree.nodes[identifier].kind = kind;
    }

    /// For a node whose extent is known only after its children (a chain of branches).
    pub fn set_span(&mut self, identifier: CompilerNodeIdentifier, span: Span) {
        self.compiler_syntax_tree.nodes[identifier].span = span;
    }

    /// Records the attributes of the element `owner` will be; returns their range.
    pub fn attributes(
        &mut self,
        attributes: impl IntoIterator<Item = Attribute>,
    ) -> IndexRange<AttributeIdentifier> {
        let first = self.compiler_syntax_tree.attributes.next_identifier();
        for a in attributes {
            self.compiler_syntax_tree.attributes.push(a);
        }
        IndexRange::new(
            first,
            self.compiler_syntax_tree.attributes.next_identifier(),
        )
    }

    pub fn children(&mut self, identifiers: &[CompilerNodeIdentifier]) -> Children {
        let start = self.compiler_syntax_tree.children.len() as u32;
        self.compiler_syntax_tree.children.extend(identifiers);
        Children {
            start,
            len: identifiers.len() as u32,
        }
    }

    pub fn javascript_list(&mut self, nodes: &[NodeIdentifier]) -> NodeList {
        let start = self.compiler_syntax_tree.javascript_lists.len() as u32;
        self.compiler_syntax_tree.javascript_lists.extend(nodes);
        NodeList {
            start,
            len: nodes.len() as u32,
        }
    }

    pub fn branches(&mut self, branches: impl IntoIterator<Item = Branch>) -> Branches {
        let start = self.compiler_syntax_tree.branches.len() as u32;
        self.compiler_syntax_tree.branches.extend(branches);
        Branches {
            start,
            len: self.compiler_syntax_tree.branches.len() as u32 - start,
        }
    }

    /// Sets the children of an element added with no children yet.
    ///
    /// # Panics
    ///
    /// If `identifier` is not an element.
    pub fn set_element_children(&mut self, identifier: CompilerNodeIdentifier, children: Children) {
        let NodeKind::Element(el) = &mut self.compiler_syntax_tree.nodes[identifier].kind else {
            panic!("{identifier:?} is not an element")
        };
        el.children = children;
    }

    #[must_use]
    pub fn finish(mut self, root: Children) -> CompilerSyntaxTree {
        self.compiler_syntax_tree.root = root;
        self.compiler_syntax_tree
            .component_references
            .sort_unstable_by_key(|&(node, _)| node);
        self.compiler_syntax_tree
    }

    /// Upstream `element` (phases/1-parse/state/element.js): `meta_tags`, then
    /// `regex_valid_component_name`, then `<title>` under `<svelte:head>`, then `<slot>`.
    #[must_use]
    pub fn element_kind(&self, name: &str, parent: Option<CompilerNodeIdentifier>) -> ElementKind {
        if let Some(meta) = name.strip_prefix("svelte:") {
            return ElementKind::Metadata(meta_tag(meta));
        }
        if is_component_name(name) {
            return ElementKind::Component;
        }
        if name == "title" && self.parent_is_head(parent) {
            return ElementKind::Title;
        }
        if name == "slot" && !self.parent_is_shadowroot_template(parent) {
            return ElementKind::Slot;
        }
        ElementKind::Regular
    }

    /// Blocks and elements other than regular elements and components are transparent.
    fn parent_is_head(&self, mut at: Option<CompilerNodeIdentifier>) -> bool {
        while let Some(identifier) = at {
            if let NodeKind::Element(el) = &self.compiler_syntax_tree.nodes[identifier].kind {
                match el.kind {
                    ElementKind::Metadata(Some(MetadataTag::Head)) => return true,
                    ElementKind::Regular | ElementKind::Component => return false,
                    _ => {}
                }
            }
            at = self.compiler_syntax_tree.nodes[identifier].parent;
        }
        false
    }

    fn parent_is_shadowroot_template(&self, mut at: Option<CompilerNodeIdentifier>) -> bool {
        while let Some(identifier) = at {
            if let NodeKind::Element(el) = &self.compiler_syntax_tree.nodes[identifier].kind
                && el.kind == ElementKind::Regular
                && self
                    .compiler_syntax_tree
                    .attributes(el.attributes)
                    .iter()
                    .any(|a| a.name.text(self.source_text) == "shadowrootmode")
            {
                return true;
            }
            at = self.compiler_syntax_tree.nodes[identifier].parent;
        }
        false
    }
}

/// A text node of `raw`, with its decoded text when decoding changes it.
#[must_use]
pub fn text(raw: Span, source_text: &str) -> NodeKind {
    NodeKind::Text {
        raw,
        decoded: match decode_text(raw.text(source_text)) {
            std::borrow::Cow::Borrowed(_) => None,
            std::borrow::Cow::Owned(s) => Some(s.into_boxed_str()),
        },
        spelled: false,
    }
}

/// A text node whose text a frontend spelled; `from` is where it was written.
#[must_use]
pub const fn spelled_text(from: Span, text: Box<str>) -> NodeKind {
    NodeKind::Text {
        raw: from,
        decoded: Some(text),
        spelled: true,
    }
}

fn meta_tag(name: &str) -> Option<MetadataTag> {
    Some(match name {
        "head" => MetadataTag::Head,
        "options" => MetadataTag::Options,
        "window" => MetadataTag::Window,
        "document" => MetadataTag::Document,
        "body" => MetadataTag::Body,
        "element" => MetadataTag::Element,
        "component" => MetadataTag::Component,
        "self" => MetadataTag::SelfRef,
        "fragment" => MetadataTag::Fragment,
        "boundary" => MetadataTag::Boundary,
        _ => return None,
    })
}

// Pinned so a change to a node's layout is a decision: one `Node` per HIR node, one `Attribute`
// per attribute of every component.
#[cfg(target_pointer_width = "64")]
const _: () = assert!(size_of::<Node>() == 56, "`Node` is 56 bytes");
#[cfg(target_pointer_width = "64")]
const _: () = assert!(size_of::<Attribute>() == 64, "`Attribute` is 64 bytes");
const _: () = assert!(
    size_of::<Option<CompilerNodeIdentifier>>() == 4,
    "`Option<CompilerNodeIdentifier>` is 4 bytes"
);

pub(super) enum Either<L, R> {
    Left(L),
    Right(R),
}

impl<T, L: Iterator<Item = T>, R: Iterator<Item = T>> Iterator for Either<L, R> {
    type Item = T;

    fn next(&mut self) -> Option<T> {
        match self {
            Self::Left(l) => l.next(),
            Self::Right(r) => r.next(),
        }
    }
}
