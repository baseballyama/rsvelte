use rsvelte_kernel::performance::buffer_pool;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::Range;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct NodeIdentifier(pub u32);

#[derive(Clone, Copy, Debug)]
pub enum Node {
    Source(SourceExpression),
    Program {
        span: Span,
    },
    ProgramParts {
        parts: Range,
    },
    SourceCopy {
        span: Span,
    },
    GeneratedIdentifier {
        prefix: NodeIdentifier,
        index: u32,
    },
    /// svelte2tsx's `$name` for the store a binding at this span names, unmapped.
    StoreSubscription(Span),
    TypeQuery(NodeIdentifier),
    TypeArguments {
        callee: NodeIdentifier,
        arguments: Range,
    },
    TypeAnnotation(NodeIdentifier),
    TypeLiteral(Range),
    TypeProperty {
        name: NodeIdentifier,
        value: NodeIdentifier,
    },
    TypeUnion(Range),
    NamedProperty {
        name: NodeIdentifier,
        value: NodeIdentifier,
    },
    Const {
        name: NodeIdentifier,
        value: NodeIdentifier,
    },
    ExportDefault(NodeIdentifier),
    Expression(SourceExpression),
    Statement(NodeIdentifier),
    Identifier(&'static str),
    StringLiteral(&'static str),
    Member {
        object: NodeIdentifier,
        property: NodeIdentifier,
    },
    Call {
        callee: NodeIdentifier,
        arguments: Range,
    },
    ArrayPattern {
        index: Option<NodeIdentifier>,
        value: Option<NodeIdentifier>,
    },
    Arrow {
        body: Range,
    },
    ForOf {
        binding: NodeIdentifier,
        iterable: NodeIdentifier,
        body: Range,
    },
    Assignment {
        target: NodeIdentifier,
        value: NodeIdentifier,
    },
    Object {
        properties: Range,
    },
    Block {
        body: Range,
    },
    If {
        test: NodeIdentifier,
        consequent: Range,
        alternate: Option<Range>,
    },
    Property {
        name: Span,
        /// svelte2tsx writes the name in lowercase.
        lowercase: bool,
        value: NodeIdentifier,
        end: Option<u32>,
    },
    /// A `{#snippet}` among a component's children, as the prop svelte2tsx passes for it.
    SnippetProperty {
        name: NodeIdentifier,
        parameters: Option<NodeIdentifier>,
        body: Range,
    },
    /// svelte2tsx's `const { a, b } = $$_C.$$prop_def` after a component's call: the names of
    /// its snippet props, typed by its props.
    SnippetNames {
        names: Range,
        component: NodeIdentifier,
    },
    /// svelte2tsx's `children` prop for a component's content, mapped to this offset.
    ImplicitChildren(u32),
    Shorthand(NodeIdentifier),
    Spread(NodeIdentifier),
    ComputedProperty {
        key: NodeIdentifier,
        value: NodeIdentifier,
    },
    Boolean,
    String {
        parts: Range,
        template: bool,
    },
    Text(Span),
    /// Source text without a mapping, so neither findings nor typed lint see this copy.
    UnmappedSource(Span),
    /// A statement whose findings TypeScript drops, as svelte2tsx's ignore comments do.
    Ignored(NodeIdentifier),
    Parenthesized(NodeIdentifier),
    /// `await (value)`.
    Await(NodeIdentifier),
    /// `try { body } catch { catch }`, as svelte2tsx writes an `{#await}` with a `catch`.
    Try {
        body: Range,
        catch: Range,
    },
    /// The template's function, which is `async` as svelte2tsx's render function is.
    Template(Range),
    /// Statements on lines of their own inside a script.
    Statements(Range),
    /// A `{#snippet}` outside a component's children, as svelte2tsx's `const` of an arrow.
    Snippet {
        name: NodeIdentifier,
        type_parameters: Option<NodeIdentifier>,
        parameters: Option<NodeIdentifier>,
        body: Range,
    },
}

#[derive(Clone, Copy, Debug)]
pub struct SourceExpression {
    pub span: Span,
    pub end: u32,
}

#[derive(Debug)]
pub struct SyntaxTree {
    pub(crate) nodes: Vec<Node>,
    pub(crate) children: Vec<NodeIdentifier>,
    pub(crate) root: Range,
}

impl Default for SyntaxTree {
    fn default() -> Self {
        Self {
            nodes: buffer_pool::take_keyed::<Self, _>(),
            children: buffer_pool::take_keyed::<Self, _>(),
            root: Range::default(),
        }
    }
}

impl Drop for SyntaxTree {
    fn drop(&mut self) {
        buffer_pool::give_keyed::<Self, _>(std::mem::take(&mut self.children));
        buffer_pool::give_keyed::<Self, _>(std::mem::take(&mut self.nodes));
    }
}

impl SyntaxTree {
    #[must_use]
    pub fn node(&self, identifier: NodeIdentifier) -> Node {
        self.nodes[identifier.0 as usize]
    }

    #[must_use]
    pub fn children(&self, range: Range) -> &[NodeIdentifier] {
        range.get(&self.children)
    }

    #[must_use]
    pub const fn root(&self) -> Range {
        self.root
    }

    #[must_use]
    pub const fn heap_bytes(&self) -> usize {
        self.nodes.capacity() * size_of::<Node>()
            + self.children.capacity() * size_of::<NodeIdentifier>()
    }

    pub(crate) fn push(&mut self, node: Node) -> NodeIdentifier {
        let identifier = NodeIdentifier(self.nodes.len() as u32);
        self.nodes.push(node);
        identifier
    }

    pub(crate) fn list(&mut self, children: &[NodeIdentifier]) -> Range {
        let range = Range {
            start: self.children.len() as u32,
            len: children.len() as u32,
        };
        self.children.extend_from_slice(children);
        range
    }
}
