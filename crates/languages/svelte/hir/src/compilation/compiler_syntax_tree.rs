//! Shared template HIR and frontend builder.

mod builder;

use builder::Either;
pub use builder::{spelled_text, text};
use rsvelte_kernel::newtype_index;
use rsvelte_kernel::source::index::{IndexRange, IndexVector};
use rsvelte_kernel::source::positions::Span;
pub use rsvelte_svelte_syntax::names::is_component_name;
pub use rsvelte_svelte_syntax::syntax_tree::Part;
use rsvelte_svelte_syntax::syntax_tree::{TemplateNodeIdentifier, decode_text};
use rsvelte_typescript::NodeIdentifier;

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
    /// Lists of JavaScript nodes: snippet parameters and `{@debug}` identifiers.
    javascript_lists: Vec<NodeIdentifier>,
    // Keep component references outside Node so its size stays fixed.
    component_references: Vec<(CompilerNodeIdentifier, NodeIdentifier)>,
    pub root: Children,
}

/// A slice of [`CompilerSyntaxTree`]'s list of JavaScript nodes.
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
        expression: NodeIdentifier,
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
        expression: NodeIdentifier,
        body: Children,
    },
    /// Boxed: the three branches would make every node larger, and the block is rare.
    Await(Box<Await>),
    Snippet(Snippet),
    /// `{@render f(…)}`: a call or an optional call.
    Render {
        expression: NodeIdentifier,
    },
    /// `{@html expression}`
    Html {
        expression: NodeIdentifier,
    },
    /// `{@const pattern = expression}`: a `const` declaration in the enclosing fragment's scope.
    Const {
        declaration: NodeIdentifier,
    },
    /// `{@debug a, b}`
    Debug {
        identifiers: NodeList,
    },
    /// `{let …}` or `{const …}`: a declaration in the enclosing fragment's scope.
    Declaration {
        declaration: NodeIdentifier,
    },
}

/// `{#await expression}…{:then value}…{:catch error}…{/await}`. The value and the error are
/// declared in scopes of their own, which only their branch sees.
#[derive(Debug)]
pub struct Await {
    pub expression: NodeIdentifier,
    /// A pattern node; `NodeIdentifier::NONE` when absent, as is `error`.
    pub value: NodeIdentifier,
    pub error: NodeIdentifier,
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
    pub fn new(
        expression: NodeIdentifier,
        value: NodeIdentifier,
        error: NodeIdentifier,
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

    #[must_use]
    pub const fn value(&self) -> Option<NodeIdentifier> {
        some(self.value)
    }

    #[must_use]
    pub const fn error(&self) -> Option<NodeIdentifier> {
        some(self.error)
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
    /// An identifier node.
    pub name: NodeIdentifier,
    /// Pattern nodes.
    pub parameters: NodeList,
    pub body: Children,
}

/// `{#each collection as context, index (key)}…{:else}…{/each}`. The context and the index are
/// declared in a scope of their own, which the key and the body see and the collection and the
/// fallback do not.
#[derive(Debug)]
pub struct Each {
    pub collection: NodeIdentifier,
    /// A pattern node; `NodeIdentifier::NONE` when absent, as are `index` and `key`.
    pub context: NodeIdentifier,
    /// An identifier node.
    pub index: NodeIdentifier,
    pub key: NodeIdentifier,
    pub body: Children,
    pub fallback: Option<Children>,
}

impl Each {
    #[must_use]
    pub const fn context(&self) -> Option<NodeIdentifier> {
        some(self.context)
    }

    #[must_use]
    pub const fn index(&self) -> Option<NodeIdentifier> {
        some(self.index)
    }

    #[must_use]
    pub const fn key(&self) -> Option<NodeIdentifier> {
        some(self.key)
    }

    /// Upstream's `metadata.keyed`: a key other than the index itself.
    #[must_use]
    pub fn keyed(&self, javascript: &rsvelte_typescript::SyntaxTree) -> bool {
        let Some(key) = self.key() else {
            return false;
        };
        let is_index = matches!(
            javascript.kind(key),
            rsvelte_typescript::Kind::Identifier(_)
        ) && self.index().is_some_and(|i| {
            javascript.atom(i).is_some() && javascript.atom(i) == javascript.atom(key)
        });
        !is_index
    }
}

const fn some(identifier: NodeIdentifier) -> Option<NodeIdentifier> {
    if identifier.0 == NodeIdentifier::NONE.0 {
        None
    } else {
        Some(identifier)
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
    pub test: NodeIdentifier,
    pub body: Children,
    pub origin: TemplateNodeIdentifier,
}

/// An attribute name as the compiler reads it: as written, or as a frontend spells it in Svelte
/// (Vue's `@click` is Svelte's `onclick`).
#[derive(Debug, Clone)]
pub enum Name {
    Source(Span),
    Spelled { text: Box<str>, span: Span },
}

impl Name {
    #[must_use]
    pub fn text<'a>(&'a self, source_text: &'a str) -> &'a str {
        match self {
            Self::Source(span) => span.text(source_text),
            Self::Spelled { text, .. } => text,
        }
    }

    /// Where it was written.
    #[must_use]
    pub const fn span(&self) -> Span {
        match *self {
            Self::Source(span) | Self::Spelled { span, .. } => span,
        }
    }
}

#[derive(Debug)]
pub struct Attribute {
    pub name: Name,
    pub value: AttributeValue,
    pub span: Span,
    pub owner: CompilerNodeIdentifier,
    /// The frontend's identifier of the attribute; for Svelte, an index into the surface attribute
    /// list.
    pub origin: u32,
}

#[derive(Debug)]
pub enum AttributeValue {
    /// `<input disabled>`
    Boolean,
    /// Text only, character references decoded; `a=""` is `Static("")`.
    Static(Box<str>),
    /// `a={e}`, or `a="{e}"` with `quoted`.
    Expression {
        expression: NodeIdentifier,
        quoted: bool,
    },
    /// `{a}`
    Shorthand(NodeIdentifier),
    /// Text and expressions, or several expressions: `class="a {b}"`. Empty for `a=` followed by
    /// nothing, which is not the empty text `a=""`: the compiler sets it at runtime.
    Interpolated(Box<[Part]>),
    /// `bind:name={e}`: the attribute's name is the bound property.
    Bind(NodeIdentifier),
    /// `{@attach e}`: the attribute's name is empty.
    Attach(NodeIdentifier),
    /// `class:name={e}`: the attribute's name is the class.
    Class(NodeIdentifier),
    /// `{...e}`: the attribute's name is empty.
    Spread(NodeIdentifier),
    /// `on:name={handler}`: the attribute's name is the event; without a handler the event is
    /// forwarded.
    On {
        handler: Option<NodeIdentifier>,
        modifiers: Modifiers,
    },
    /// `use:action={argument}`: `action` is an identifier or a member chain.
    Use {
        action: NodeIdentifier,
        argument: Option<NodeIdentifier>,
    },
    /// `transition:`, `in:` or `out:`.
    Transition {
        function: NodeIdentifier,
        argument: Option<NodeIdentifier>,
        intro: bool,
        outro: bool,
        modifiers: Modifiers,
    },
    /// `animate:name={parameters}`
    Animate {
        function: NodeIdentifier,
        argument: Option<NodeIdentifier>,
    },
    /// `style:property={value}`: the attribute's name is the property. Boxed: the value has the
    /// shapes of an attribute's, and directives are rare.
    Style {
        value: Box<StyleValue>,
        modifiers: Modifiers,
    },
    /// `let:name={pattern}`
    Let(Option<NodeIdentifier>),
}

/// The value of a `style:` directive.
#[derive(Debug)]
pub enum StyleValue {
    /// `style:color`, which reads `color`.
    Shorthand(NodeIdentifier),
    /// `style:--name`: nothing to read.
    Empty,
    Static(Box<str>),
    Expression {
        expression: NodeIdentifier,
        quoted: bool,
    },
    Interpolated(Box<[Part]>),
}

/// A directive's `|modifier`s, one bit each.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub struct Modifiers(u16);

impl Modifiers {
    pub const CAPTURE: Self = Self(1 << 3);
    pub const GLOBAL: Self = Self(1 << 9);
    pub const IMPORTANT: Self = Self(1 << 11);
    pub const LOCAL: Self = Self(1 << 10);
    pub const NONPASSIVE: Self = Self(1 << 6);
    pub const ONCE: Self = Self(1 << 4);
    pub const PASSIVE: Self = Self(1 << 5);
    pub const PREVENT_DEFAULT: Self = Self(1);
    pub const SELF: Self = Self(1 << 7);
    pub const STOP_IMMEDIATE_PROPAGATION: Self = Self(1 << 2);
    pub const STOP_PROPAGATION: Self = Self(1 << 1);
    pub const TRUSTED: Self = Self(1 << 8);

    /// The modifier a name stands for, if any.
    #[must_use]
    pub fn parse(name: &str) -> Option<Self> {
        Some(match name {
            "preventDefault" => Self::PREVENT_DEFAULT,
            "stopPropagation" => Self::STOP_PROPAGATION,
            "stopImmediatePropagation" => Self::STOP_IMMEDIATE_PROPAGATION,
            "capture" => Self::CAPTURE,
            "once" => Self::ONCE,
            "passive" => Self::PASSIVE,
            "nonpassive" => Self::NONPASSIVE,
            "self" => Self::SELF,
            "trusted" => Self::TRUSTED,
            "global" => Self::GLOBAL,
            "local" => Self::LOCAL,
            "important" => Self::IMPORTANT,
            _ => return None,
        })
    }

    #[must_use]
    pub const fn contains(self, other: Self) -> bool {
        self.0 & other.0 == other.0
    }

    #[must_use]
    pub const fn with(self, other: Self) -> Self {
        Self(self.0 | other.0)
    }

    #[must_use]
    pub const fn is_empty(self) -> bool {
        self.0 == 0
    }
}

impl CompilerSyntaxTree {
    #[must_use]
    pub fn component_reference(
        &self,
        identifier: CompilerNodeIdentifier,
    ) -> Option<NodeIdentifier> {
        let index = self
            .component_references
            .binary_search_by_key(&identifier, |&(node, _)| node)
            .ok()?;
        Some(self.component_references[index].1)
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
    pub fn javascript_list(&self, l: NodeList) -> &[NodeIdentifier] {
        &self.javascript_lists[l.start as usize..(l.start + l.len) as usize]
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

    #[must_use]
    pub const fn heap_bytes(&self) -> usize {
        self.nodes.capacity() * size_of::<Node>()
            + self.attributes.capacity() * size_of::<Attribute>()
            + self.origin.capacity() * size_of::<TemplateNodeIdentifier>()
            + self.children.capacity() * size_of::<CompilerNodeIdentifier>()
            + self.branches.capacity() * size_of::<Branch>()
            + self.javascript_lists.capacity() * size_of::<NodeIdentifier>()
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
