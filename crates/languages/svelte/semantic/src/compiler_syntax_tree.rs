//! Shared template HIR and frontend builder.

mod attributes;
mod builder;
mod lower;

pub use attributes::{Attribute, AttributeValue, Modifiers, Name, StyleValue};
use builder::Either;
pub use builder::{spelled_text, text};
pub use lower::lower;
use rsvelte_kernel::index::{IndexRange, IndexVector};
use rsvelte_kernel::newtype_index;
use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use rsvelte_kernel::source::positions::Span;
pub(crate) use rsvelte_svelte_syntax::names::is_component_name;
pub use rsvelte_svelte_syntax::syntax_tree::Part;
use rsvelte_svelte_syntax::syntax_tree::{TemplateNodeIdentifier, decode_text};
use rsvelte_typescript_tree::{
    DeclarationIdentifier, ExpressionIdentifier, ParametersIdentifier, PatternIdentifier,
};

newtype_index!(
    pub struct CompilerNodeIdentifier;
);
newtype_index!(
    pub struct AttributeIdentifier;
);

#[derive(Debug)]
pub struct CompilerSyntaxTree {
    pub nodes: IndexVector<CompilerNodeIdentifier, Node>,
    pub attributes: IndexVector<AttributeIdentifier, Attribute>,
    /// The frontend's node each HIR node was built from. For Svelte, an `{#if}` chain's node
    /// points at its first `If`; each [`Branch`] carries its own.
    pub origin: IndexVector<CompilerNodeIdentifier, TemplateNodeIdentifier>,
    children: Vec<CompilerNodeIdentifier>,
    branches: Vec<Branch>,
    /// The identifiers of every `{@debug}`.
    debug_identifiers: Vec<ExpressionIdentifier>,
    // Keep component references outside Node so its size stays fixed.
    component_references: Vec<(CompilerNodeIdentifier, ExpressionIdentifier)>,
    pub root: Children,
}

/// A slice of [`CompilerSyntaxTree`]'s list of `{@debug}` identifiers.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub struct NodeList {
    start: u32,
    len: u32,
}

/// A slice of [`CompilerSyntaxTree`]'s child list.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Hash)]
pub struct Children {
    start: u32,
    len: u32,
}

#[derive(Debug)]
pub struct Node {
    pub kind: NodeKind,
    pub span: Span,
    /// The enclosing element or block; `None` at the top level.
    pub parent: Option<CompilerNodeIdentifier>,
}

#[derive(Debug)]
pub enum NodeKind {
    Text {
        raw: Span,
        /// Present only when decoding changed the text.
        decoded: Option<Box<str>>,
        /// The frontend spelled `decoded` itself (Vue's condensed text): `raw` is only where it
        /// came from, and the markup is `decoded` escaped.
        spelled: bool,
    },
    Comment {
        data: Span,
    },
    Expression {
        expression: ExpressionIdentifier,
    },
    Element(Element),
    If {
        branches: Branches,
        /// The final `{:else}`.
        otherwise: Option<Children>,
    },
    Each(Each),
    /// `{#key expression}…{/key}`
    Key {
        expression: ExpressionIdentifier,
        body: Children,
    },
    /// Boxed: the three branches would make every node larger, and the block is rare.
    Await(Box<Await>),
    Snippet(Snippet),
    /// `{@render f(…)}`: a call or an optional call.
    Render {
        expression: ExpressionIdentifier,
    },
    /// `{@html expression}`
    Html {
        expression: ExpressionIdentifier,
    },
    /// `{@const pattern = expression}`: a `const` declaration in the enclosing fragment's scope.
    Const {
        declaration: DeclarationIdentifier,
    },
    /// `{@debug a, b}`
    Debug {
        identifiers: NodeList,
    },
    /// `{let …}` or `{const …}`: a declaration in the enclosing fragment's scope.
    Declaration {
        declaration: DeclarationIdentifier,
    },
}

/// `{#await expression}…{:then value}…{:catch error}…{/await}`. The value and the error are
/// declared in scopes of their own, which only their branch sees.
#[derive(Debug)]
pub struct Await {
    pub expression: ExpressionIdentifier,
    pub value: Option<PatternIdentifier>,
    pub error: Option<PatternIdentifier>,
    pending: Children,
    then: Children,
    catch: Children,
    /// Which of `pending`, `then` and `catch` were written, as [`Await::PENDING`] and the others.
    present: u8,
}

impl Await {
    const CATCH: u8 = 4;
    const PENDING: u8 = 1;
    const THEN: u8 = 2;

    #[must_use]
    pub(crate) fn new(
        expression: ExpressionIdentifier,
        value: Option<PatternIdentifier>,
        error: Option<PatternIdentifier>,
        pending: Option<Children>,
        then: Option<Children>,
        catch: Option<Children>,
    ) -> Self {
        let mut present = 0;
        for (branch, bit) in [
            (pending, Self::PENDING),
            (then, Self::THEN),
            (catch, Self::CATCH),
        ] {
            if branch.is_some() {
                present |= bit;
            }
        }
        Self {
            expression,
            value,
            error,
            pending: pending.unwrap_or_default(),
            then: then.unwrap_or_default(),
            catch: catch.unwrap_or_default(),
            present,
        }
    }

    #[must_use]
    pub const fn pending(&self) -> Option<Children> {
        self.branch(self.pending, Self::PENDING)
    }

    #[must_use]
    pub const fn then(&self) -> Option<Children> {
        self.branch(self.then, Self::THEN)
    }

    #[must_use]
    pub const fn catch(&self) -> Option<Children> {
        self.branch(self.catch, Self::CATCH)
    }

    const fn branch(&self, children: Children, bit: u8) -> Option<Children> {
        if self.present & bit == 0 {
            None
        } else {
            Some(children)
        }
    }
}

/// `{#snippet name(parameters)}…{/snippet}`: `name` is declared in the enclosing fragment's
/// scope, the parameters in a scope of their own that the body sees.
#[derive(Debug)]
pub struct Snippet {
    /// An identifier.
    pub name: ExpressionIdentifier,
    /// `None` for `{#snippet name()}`.
    pub parameters: Option<ParametersIdentifier>,
    pub body: Children,
}

/// `{#each collection as context, index (key)}…{:else}…{/each}`. The context and the index are
/// declared in a scope of their own, which the key and the body see and the collection and the
/// fallback do not.
#[derive(Debug)]
pub struct Each {
    pub collection: ExpressionIdentifier,
    pub context: Option<PatternIdentifier>,
    /// An identifier.
    pub index: Option<PatternIdentifier>,
    pub key: Option<ExpressionIdentifier>,
    pub body: Children,
    pub fallback: Option<Children>,
}

impl Each {
    /// Upstream's `metadata.keyed`: a key other than the index itself.
    #[must_use]
    pub fn keyed(&self, javascript: &rsvelte_typescript_tree::Tree) -> bool {
        let Some(key) = self.key else {
            return false;
        };
        let is_index = match (javascript.get_expression(key), self.index) {
            (oxc_ast::ast::Expression::Identifier(key), Some(index)) => javascript
                .get_pattern(index)
                .pattern
                .get_binding_identifier()
                .is_some_and(|index| index.name == key.name),
            _ => false,
        };
        !is_index
    }
}

#[derive(Debug)]
pub struct Element {
    pub name: Span,
    pub kind: ElementKind,
    /// Without the `this` of `<svelte:element>` and `<svelte:component>`, which is [`Self::this`].
    pub attributes: IndexRange<AttributeIdentifier>,
    pub children: Children,
    /// `<name …>` (or `<name … />`).
    pub start_tag: Span,
    /// The `this` attribute of `<svelte:element>` and `<svelte:component>`, which is not in
    /// [`Self::attributes`].
    pub this: Option<AttributeIdentifier>,
}

/// The Svelte parser's element node types.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ElementKind {
    Regular,
    Component,
    /// `<title>` whose nearest enclosing element is `<svelte:head>`.
    Title,
    /// `<slot>` outside a declarative shadow root.
    Slot,
    /// `svelte:…`; `None` for a name the compiler rejects.
    Metadata(Option<MetadataTag>),
}

impl ElementKind {
    /// Upstream's `Component`, `SvelteComponent` and `SvelteSelf`: a tag that renders a component.
    #[must_use]
    pub const fn renders_component(self) -> bool {
        matches!(
            self,
            Self::Component | Self::Metadata(Some(MetadataTag::Component | MetadataTag::SelfRef))
        )
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum MetadataTag {
    Head,
    Options,
    Window,
    Document,
    Body,
    Element,
    Component,
    SelfRef,
    Fragment,
    Boundary,
}

/// A slice of [`CompilerSyntaxTree`]'s branch list.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Branches {
    start: u32,
    len: u32,
}

#[derive(Debug)]
pub struct Branch {
    pub test: ExpressionIdentifier,
    pub body: Children,
    pub origin: TemplateNodeIdentifier,
}

impl CompilerSyntaxTree {
    #[must_use]
    pub fn component_reference(
        &self,
        identifier: CompilerNodeIdentifier,
    ) -> Option<ExpressionIdentifier> {
        let index = self
            .component_references
            .binary_search_by_key(&identifier, |&(node, _)| node)
            .ok()?;
        Some(self.component_references[index].1)
    }

    /// The expression each component element names its component by.
    pub fn component_references(&self) -> impl Iterator<Item = ExpressionIdentifier> + '_ {
        self.component_references
            .iter()
            .map(|&(_, reference)| reference)
    }

    #[must_use]
    pub fn node(&self, identifier: CompilerNodeIdentifier) -> &Node {
        &self.nodes[identifier]
    }

    #[must_use]
    pub fn children(&self, c: Children) -> &[CompilerNodeIdentifier] {
        &self.children[c.start as usize..(c.start + c.len) as usize]
    }

    #[must_use]
    pub fn debug_identifiers(&self, l: NodeList) -> &[ExpressionIdentifier] {
        &self.debug_identifiers[l.start as usize..(l.start + l.len) as usize]
    }

    #[must_use]
    pub fn branches(&self, b: Branches) -> &[Branch] {
        &self.branches[b.start as usize..(b.start + b.len) as usize]
    }

    #[must_use]
    pub fn attributes(&self, r: IndexRange<AttributeIdentifier>) -> &[Attribute] {
        self.attributes.slice(r)
    }

    /// The child lists of a node, in document order: an `{#each}`'s body before its fallback.
    pub fn child_lists(
        &self,
        identifier: CompilerNodeIdentifier,
    ) -> impl Iterator<Item = Children> {
        let (first, rest): (Option<Children>, [Option<Children>; 3]) =
            match &self.node(identifier).kind {
                NodeKind::Element(el) => (Some(el.children), [None; 3]),
                NodeKind::Each(each) => (Some(each.body), [each.fallback, None, None]),
                &NodeKind::Key { body, .. } => (Some(body), [None; 3]),
                NodeKind::Snippet(s) => (Some(s.body), [None; 3]),
                NodeKind::Await(a) => (None, [a.pending(), a.then(), a.catch()]),
                NodeKind::If {
                    branches,
                    otherwise,
                } => {
                    return Either::Left(
                        self.branches(*branches)
                            .iter()
                            .map(|b| b.body)
                            .chain(*otherwise),
                    );
                }
                NodeKind::Text { .. }
                | NodeKind::Comment { .. }
                | NodeKind::Expression { .. }
                | NodeKind::Render { .. }
                | NodeKind::Html { .. }
                | NodeKind::Const { .. }
                | NodeKind::Debug { .. }
                | NodeKind::Declaration { .. } => (None, [None; 3]),
            };
        Either::Right(first.into_iter().chain(rest.into_iter().flatten()))
    }

    pub fn elements(&self) -> impl Iterator<Item = (CompilerNodeIdentifier, &Element)> {
        self.nodes
            .iter_enumerated()
            .filter_map(|(identifier, n)| match &n.kind {
                NodeKind::Element(el) => Some((identifier, el)),
                _ => None,
            })
    }
}

impl NodeKind {
    /// The text of a `Text` node, decoded.
    #[must_use]
    pub fn text<'a>(&'a self, source_text: &'a str) -> Option<&'a str> {
        match self {
            Self::Text { raw, decoded, .. } => {
                Some(decoded.as_deref().unwrap_or_else(|| raw.text(source_text)))
            }
            _ => None,
        }
    }

    /// A `Text` node that upstream's `data.trim() === ''` calls empty.
    #[must_use]
    pub fn is_blank_text(&self, source_text: &str) -> bool {
        self.text(source_text)
            .is_some_and(|text| text.chars().all(is_ecmascript_whitespace))
    }
}

/// Builds a [`CompilerSyntaxTree`] for a frontend.
///
/// A node is added before its children, so building a child can ask about its ancestors
/// ([`CompilerSyntaxTreeBuilder::element_kind`]); each child list is recorded once its nodes exist
/// ([`CompilerSyntaxTreeBuilder::children`]), which keeps every list contiguous.
#[derive(Debug)]
pub struct CompilerSyntaxTreeBuilder<'s> {
    source_text: &'s str,
    compiler_syntax_tree: CompilerSyntaxTree,
}
