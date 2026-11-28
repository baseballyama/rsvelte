use rsvelte_kernel::performance::buffer_pool;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::Range;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub(crate) struct NodeIdentifier(pub(crate) u32);

/// The bytes one [`Node::TextChunk`] holds, which keep [`Node`] at its size.
const TEXT_CHUNK: usize = 32;

#[derive(Clone, Copy, Debug)]
pub(crate) enum Node {
    Source(SourceExpression),
    /// A script copied as it is, ended by a `;` at [`crate::cut_short_at`] when there is one.
    Program {
        span: Span,
        end_tag: Option<Span>,
    },
    ProgramParts {
        parts: Range,
        end_tag: Option<Span>,
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
    /// `{ a, b }` on one line, of properties written as `Parts`, so that the source lines after it
    /// stay where they are.
    InlineTypeLiteral(Range),
    TypeProperty {
        name: NodeIdentifier,
        value: NodeIdentifier,
        optional: bool,
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
    /// The component, under a name whose type is the component's instance.
    ExportDefault {
        component: NodeIdentifier,
        instance: Instance,
    },
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
    /// A string the projection computes, such as a prop's name from its key's value: `len` bytes
    /// held by the [`Node::TextChunk`]s from `first` on.
    ComputedStringLiteral {
        first: NodeIdentifier,
        len: u32,
    },
    /// Bytes of a [`Node::ComputedStringLiteral`], which only that node reads; the tree keeps no
    /// string buffer, as few projections compute a string.
    TextChunk([u8; TEXT_CHUNK]),
    /// A generated string whose findings fall on the empty range at `at`.
    /// A name whose text TypeScript reports at the source offset `at`.
    IdentifierAt {
        name: &'static str,
        at: u32,
    },
    /// svelte2tsx's name of a component's instance: `$$_`, the tag's name reversed and how many
    /// elements enclose it. A finding on the name falls on the empty range at `at`.
    Instance {
        tag: Span,
        depth: u32,
        at: Option<u32>,
    },
    /// `/** @typedef {value} name */`, a type alias in JavaScript.
    TypeDefinition {
        name: NodeIdentifier,
        value: NodeIdentifier,
    },
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
    /// `let name = value;`, on a line of its own.
    Let {
        name: NodeIdentifier,
        value: NodeIdentifier,
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
        /// The source `...`, where a finding on the spread starts; `None` in generated code.
        dots: Option<Span>,
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
    /// Its parts one after another: svelte2tsx's copy of a slot prop with the names it unpacks
    /// written as the values they read.
    Parts(Range),
    /// svelte2tsx's `comment({})` for the `JSDoc` comment that types a JavaScript component's
    /// props, which TypeScript reads as a cast.
    CommentCast(Span),
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
    /// An expression whose findings svelte-check hides, as code svelte2tsx writes between its
    /// ignore comments.
    IgnoredRange(NodeIdentifier),
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
    /// The template's function, which is `async` as svelte2tsx's render function is, its head
    /// at the instance script's [`crate::cut_short_at`] when there is one.
    Template {
        body: Range,
        head: Option<Span>,
    },
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

// Pinned so a change to a node's layout is a decision: the tree holds one `Node` per generated
// or copied part of every component.
#[cfg(target_pointer_width = "64")]
const _: () = assert!(size_of::<Node>() == 40, "`Node` is 40 bytes");

/// How a component makes its instance, which the type of its default export's name is:
/// svelte2tsx's `ReturnType` or `InstanceType` of the component.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub(crate) enum Instance {
    /// A function component, whose call returns the instance.
    Returned,
    /// An isomorphic component, a class and a function at once, whose `new` constructs it.
    Constructed,
}

impl Instance {
    /// svelte2tsx's component of a render function that returns nothing: its helper's
    /// constraints.
    pub(crate) const fn unrendered(self) -> &'static str {
        match self {
            Self::Returned => "__rsvelte_unrendered_component",
            Self::Constructed => "__rsvelte_unrendered_isomorphic",
        }
    }
}

/// A generic component's type parameters, without their angle brackets.
#[derive(Clone, Copy, Debug)]
pub(crate) enum TypeParameters {
    /// The `generics` attribute's text, which the render function maps.
    Attribute(Span),
    /// The `$$Generic` aliases' [`Node::TypeParameter`]s, which nothing maps.
    Declared(Range),
}

#[derive(Clone, Copy, Debug)]
pub(crate) struct SourceExpression {
    pub(crate) span: Span,
    pub(crate) end: u32,
}

#[derive(Debug)]
pub struct SyntaxTree {
    pub(crate) nodes: Vec<Node>,
    pub(crate) children: Vec<NodeIdentifier>,
    pub(crate) root: Range,
    /// Neither script is TypeScript, so the projection is JavaScript without type syntax.
    pub(crate) javascript: bool,
    /// The instance script has a hole. A hole is copied as written, so its text can close the
    /// render function before the return of the component; a script without one parses balanced.
    pub(crate) holes: bool,
}

impl Default for SyntaxTree {
    fn default() -> Self {
        Self {
            nodes: buffer_pool::take_keyed::<Self, _>(),
            children: buffer_pool::take_keyed::<Self, _>(),
            root: Range::default(),
            javascript: false,
            holes: false,
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
    pub(crate) fn node(&self, identifier: NodeIdentifier) -> Node {
        self.nodes[identifier.0 as usize]
    }

    #[must_use]
    pub(crate) fn children(&self, range: Range) -> &[NodeIdentifier] {
        range.get(&self.children)
    }

    /// The extension a checker reads the projection as: `.js` without type syntax of its own.
    #[must_use]
    pub const fn extension(&self) -> &'static str {
        if self.javascript { ".js" } else { ".ts" }
    }

    #[must_use]
    pub(crate) const fn root(&self) -> Range {
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

    pub(crate) fn computed_string_literal(&mut self, text: &str) -> NodeIdentifier {
        let first = NodeIdentifier(self.nodes.len() as u32);
        for part in text.as_bytes().chunks(TEXT_CHUNK) {
            let mut chunk = [0; TEXT_CHUNK];
            chunk[..part.len()].copy_from_slice(part);
            self.push(Node::TextChunk(chunk));
        }
        self.push(Node::ComputedStringLiteral {
            first,
            len: text.len() as u32,
        })
    }

    /// The text of a [`Node::ComputedStringLiteral`].
    #[must_use]
    pub(crate) fn computed_text(&self, first: NodeIdentifier, len: u32) -> String {
        let mut bytes = Vec::with_capacity(len as usize);
        for node in &self.nodes[first.0 as usize..] {
            let (Node::TextChunk(chunk), Some(left)) =
                (node, (len as usize).checked_sub(bytes.len()))
            else {
                break;
            };
            bytes.extend_from_slice(&chunk[..left.min(TEXT_CHUNK)]);
        }
        String::from_utf8(bytes).expect("the chunks hold a string's bytes")
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
pub(crate) enum Spelling {
    AsWritten,
    Lowercase,
    /// `on:` before the event's name, where svelte-check reports a finding on the name.
    Event,
}

#[cfg(test)]
mod tests;
