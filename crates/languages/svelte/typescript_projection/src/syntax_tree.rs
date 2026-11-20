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
    /// A JavaScript declaration's type, in a `JSDoc` comment before it.
    DeclaredType(NodeIdentifier),
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
    TypeAlias {
        name: NodeIdentifier,
        value: NodeIdentifier,
    },
    ExportDefault(NodeIdentifier),
    /// svelte2tsx's `$$render` of a generic component: the instance script and the template in a
    /// function of the type parameters, which returns the contract.
    Render {
        /// None for a component without generics, whose render function takes no parameters.
        type_parameters: Option<TypeParameters>,
        /// Whether the instance awaits outside every block and function, as svelte2tsx checks.
        asynchronous: bool,
        body: Range,
        /// The script's start tag up to the `generics` value, which svelte2tsx overwrites with
        /// the function's name.
        name: Option<Span>,
    },
    Return(NodeIdentifier),
    /// The default export of a generic component, whose call signature takes its type
    /// parameters, as svelte2tsx's `$$IsomorphicComponent`.
    GenericExport {
        type_parameters: TypeParameters,
        /// The parameters' names, which instantiate the render function.
        names: Range,
        /// The parameters without modifiers, for the interface and the instance type.
        declared: Range,
    },
    Expression(SourceExpression),
    /// `value;` without parentheses, as svelte2tsx writes a mustache tag, so TypeScript reads a
    /// function or class there as a declaration and reports what it lacks.
    Bare(SourceExpression),
    Statement(NodeIdentifier),
    Identifier(&'static str),
    /// The component `<svelte:self>` renders, whose props svelte2tsx does not check.
    AnyComponent,
    StringLiteral(&'static str),
    /// A generated string whose findings fall on the empty range at `at`.
    StringLiteralAt {
        value: &'static str,
        at: u32,
    },
    Member {
        object: NodeIdentifier,
        property: NodeIdentifier,
    },
    /// `object[index]`.
    Index {
        object: NodeIdentifier,
        index: NodeIdentifier,
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
        spelling: Spelling,
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
    Spread {
        value: NodeIdentifier,
        /// The source `...`, where a finding on the spread starts.
        dots: Span,
    },
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
    /// The object `value`, whose opening brace maps to `open` and closing brace to `close`, so
    /// that a finding on all of it starts and ends there. Without `close`, it ends where the last
    /// property does.
    Located {
        value: NodeIdentifier,
        open: Span,
        close: Option<Span>,
    },
    /// Text that needs no escape as a string literal, which a finding on the literal locates.
    QuotedText(Span),
    /// Source text without a mapping, so neither findings nor typed lint see this copy.
    UnmappedSource(Span),
    /// `(parts) as written`, as svelte2tsx writes a type assertion `<written>parts`.
    AsType {
        parts: Range,
        written: Span,
    },
    /// A `$$Generic` alias as svelte2tsx's unmapped type parameter, `name extends constraint`.
    TypeParameter {
        name: Span,
        constraint: Option<Span>,
    },
    /// A statement whose findings TypeScript drops, as svelte2tsx's ignore comments do.
    Ignored(NodeIdentifier),
    /// A property after the comments written before its attribute, on lines of their own, so
    /// that a `// @ts-ignore` among them covers it.
    Commented {
        comments: Span,
        value: NodeIdentifier,
    },
    Parenthesized(NodeIdentifier),
    /// The target of `target = value as T`, which svelte2tsx writes for a one-way binding to
    /// `target as T`: the assertion follows the value.
    Asserted {
        target: NodeIdentifier,
        assertion: Span,
    },
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

/// A generic component's type parameters, without their angle brackets.
#[derive(Clone, Copy, Debug)]
pub enum TypeParameters {
    /// The `generics` attribute's text, which the render function maps.
    Attribute(Span),
    /// The `$$Generic` aliases' [`Node::TypeParameter`]s, which nothing maps.
    Declared(Range),
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
    /// Neither script is TypeScript, so the projection is JavaScript without type syntax.
    pub(crate) javascript: bool,
}

impl Default for SyntaxTree {
    fn default() -> Self {
        Self {
            nodes: buffer_pool::take_keyed::<Self, _>(),
            children: buffer_pool::take_keyed::<Self, _>(),
            root: Range::default(),
            javascript: false,
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

    /// The extension a checker reads the projection as: `.js` without type syntax of its own.
    #[must_use]
    pub const fn extension(&self) -> &'static str {
        if self.javascript { ".js" } else { ".ts" }
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

/// How svelte2tsx writes a [`Node::Property`]'s name.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Spelling {
    AsWritten,
    Lowercase,
    /// `on:` before the event's name, where svelte-check reports a finding on the name.
    Event,
}
