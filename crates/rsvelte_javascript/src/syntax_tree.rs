//! The columnar JS AST.
//!
//! A node is a row across five columns — `tags` (u8), `flags` (u8: operator or variant bits),
//! `data` (two u32), `source_locations` (two u32) — 18 bytes with no padding, plus variable-length
//! child lists in `extra`. Children are [`NodeIdentifier`]s (u32), never pointers, so the tree is
//! `Send + Sync`, trivially relocatable, and can be handed across an ABI as plain buffers.
//!
//! Text is not copied: identifier names are interned per document, and string/template literals
//! point into the source unless decoding changed their bytes (then they live in `strings`).
//!
//! The builder methods (`ident`, `call`, `member`, …) are the one way to create nodes; the parser
//! and every lowering use them, and so would any other parser plugged in behind this AST.
//!
//! Columns are taken from and returned to the per-thread
//! [`rsvelte_kernel::performance::buffer_pool`] so that, in steady state, building a tree for the
//! next document reuses the previous document's capacity.

use rsvelte_kernel::performance::buffer_pool;
use rsvelte_kernel::source::interning::{Atom, Interner};
use rsvelte_kernel::source::positions::{SourceLocation, Span};
use rsvelte_kernel::source::tokens::Tokens;

use crate::lexer::T;
use crate::operators::{
    AssignmentOperator, BinaryOperator, LogicalOperator, UnaryOperator, UpdateOperator,
};

#[derive(Clone, Copy, PartialEq, Eq, Hash, Debug, PartialOrd, Ord)]
#[repr(transparent)]
pub struct NodeIdentifier(pub u32);

impl NodeIdentifier {
    pub const NONE: Self = Self(u32::MAX);

    #[inline]
    #[must_use]
    pub fn is_none(self) -> bool {
        self == Self::NONE
    }

    #[inline]
    #[must_use]
    pub fn opt(self) -> Option<Self> {
        if self.is_none() { None } else { Some(self) }
    }

    #[inline]
    #[must_use]
    pub const fn index(self) -> usize {
        self.0 as usize
    }
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
#[repr(u8)]
pub enum Tag {
    Program,
    VariableDeclaration,
    Declarator,
    ExpressionStatement,
    FunctionDeclaration,
    Return,
    If,
    /// `for (initializer; test; update) body`. Built by compilers; the parser does not read it yet.
    For,
    Block,
    Empty,
    Import,
    ImportDefault,
    ImportNamed,
    ImportNamespace,
    ExportNamed,
    ExportDefault,
    /// A TypeScript-only statement (`type`, `interface`, `declare …`): erased by compilation, kept
    /// verbatim by source-preserving consumers.
    TypeScriptDeclaration,
    /// `interface Name { key?: T; … }` with property members only; any other interface is a
    /// `TypeScriptDeclaration`.
    TypeScriptInterface,
    /// A property member of a [`Tag::TypeScriptInterface`]; its type is a
    /// [`TypeScriptKind::Annotation`].
    TypeScriptPropertySignature,
    Identifier,
    Number,
    String,
    Boolean,
    Null,
    This,
    Template,
    TemplateElement,
    Array,
    Object,
    Property,
    Spread,
    Member,
    Call,
    New,
    Arrow,
    FunctionExpression,
    Unary,
    Update,
    Binary,
    Logical,
    Conditional,
    Assign,
    Sequence,
    Await,
    ObjectPattern,
    ArrayPattern,
    AssignPattern,
    Rest,
    Hole,
}

pub mod flag {
    pub const VAR: u8 = 0;
    pub const LET: u8 = 1;
    pub const CONST: u8 = 2;
    pub const ASYNC: u8 = 1;
    pub const EXPRESSION_BODY: u8 = 2;
    pub const SHORTHAND: u8 = 1;
    pub const COMPUTED: u8 = 2;
    pub const METHOD: u8 = 4;
    pub const OPTIONAL: u8 = 1;
    pub const PREFIX: u8 = 0x80;
    /// String: value lives in `strings`, not in the source.
    pub const OWNED: u8 = 1;
    pub const TAIL: u8 = 2;
    /// Call/New: annotated `/* @__PURE__ */`.
    pub const PURE: u8 = 4;
    /// Import/Export: `import type` / `export type` (erased).
    pub const TYPE_ONLY: u8 = 8;
}

/// A decoded view of one node. Lists borrow the `extra` column directly.
#[derive(Clone, Copy, Debug)]
pub enum Kind<'a> {
    Program(&'a [NodeIdentifier]),
    VariableDeclaration {
        kind: u8,
        declarations: &'a [NodeIdentifier],
    },
    Declarator {
        identifier: NodeIdentifier,
        initializer: Option<NodeIdentifier>,
    },
    ExpressionStatement(NodeIdentifier),
    Function {
        name: Option<NodeIdentifier>,
        parameters: &'a [NodeIdentifier],
        body: NodeIdentifier,
        is_async: bool,
        declaration: bool,
    },
    Return(Option<NodeIdentifier>),
    If {
        test: NodeIdentifier,
        consequent: NodeIdentifier,
        alternate: Option<NodeIdentifier>,
    },
    For {
        /// A variable declaration or an expression.
        initializer: Option<NodeIdentifier>,
        test: Option<NodeIdentifier>,
        update: Option<NodeIdentifier>,
        body: NodeIdentifier,
    },
    Block(&'a [NodeIdentifier]),
    Empty,
    Import {
        specifiers: &'a [NodeIdentifier],
        source: NodeIdentifier,
        type_only: bool,
    },
    ImportDefault(NodeIdentifier),
    ImportNamed {
        imported: NodeIdentifier,
        local: NodeIdentifier,
    },
    ImportNamespace(NodeIdentifier),
    ExportNamed(NodeIdentifier),
    ExportDefault(NodeIdentifier),
    TypeScriptDeclaration,
    TypeScriptInterface {
        name: NodeIdentifier,
        members: &'a [NodeIdentifier],
    },
    TypeScriptPropertySignature {
        key: NodeIdentifier,
        optional: bool,
    },
    Identifier(Atom),
    Number(f64),
    String,
    Boolean(bool),
    Null,
    This,
    Template {
        quasis: &'a [NodeIdentifier],
        expressions: &'a [NodeIdentifier],
    },
    TemplateElement {
        tail: bool,
    },
    Array(&'a [NodeIdentifier]),
    Object(&'a [NodeIdentifier]),
    Property {
        key: NodeIdentifier,
        value: NodeIdentifier,
        shorthand: bool,
        computed: bool,
        method: bool,
    },
    Spread(NodeIdentifier),
    Member {
        object: NodeIdentifier,
        property: NodeIdentifier,
        computed: bool,
        optional: bool,
    },
    Call {
        callee: NodeIdentifier,
        arguments: &'a [NodeIdentifier],
        optional: bool,
        pure: bool,
    },
    New {
        callee: NodeIdentifier,
        arguments: &'a [NodeIdentifier],
    },
    Arrow {
        parameters: &'a [NodeIdentifier],
        body: NodeIdentifier,
        is_async: bool,
        expression_body: bool,
    },
    Unary(UnaryOperator, NodeIdentifier),
    Update {
        op: UpdateOperator,
        prefix: bool,
        arg: NodeIdentifier,
    },
    Binary(BinaryOperator, NodeIdentifier, NodeIdentifier),
    Logical(LogicalOperator, NodeIdentifier, NodeIdentifier),
    Conditional {
        test: NodeIdentifier,
        consequent: NodeIdentifier,
        alternate: NodeIdentifier,
    },
    Assign(AssignmentOperator, NodeIdentifier, NodeIdentifier),
    Sequence(&'a [NodeIdentifier]),
    Await(NodeIdentifier),
    ObjectPattern(&'a [NodeIdentifier]),
    ArrayPattern(&'a [NodeIdentifier]),
    AssignPattern(NodeIdentifier, NodeIdentifier),
    Rest(NodeIdentifier),
    Hole,
}

#[derive(Debug)]
pub struct SyntaxTree {
    tags: Vec<Tag>,
    flags: Vec<u8>,
    data: Vec<[u32; 2]>,
    source_locations: Vec<SourceLocation>,
    /// Child lists, each stored as `[len, identifiers…]`; also fixed-size records for nodes with
    /// >2 fields.
    extra: Vec<NodeIdentifier>,
    /// Decoded string values and synthesized text.
    strings: String,
    pub atoms: Interner,
    /// Comment locations in source order (`//…` and `/*…*/`, delimiters included).
    pub comments: Vec<Span>,
    /// Every token the parser consumed, in source order. With [`SyntaxTree::comments`] and
    /// whitespace in the gaps, they are the parsed regions of the source (typescript-eslint's
    /// `tokens` and `comments`).
    pub tokens: Tokens<T>,
    /// TypeScript syntax the tree erases, in source order. Compilation ignores it;
    /// source-preserving consumers (the formatter, the type-check projection) read it back by
    /// node.
    pub typescript: Vec<TypeScriptSyntax>,
    /// TypeScript constructs with runtime meaning, which erasing types cannot remove, in source
    /// order. A compiler that only erases types refuses them; other consumers may ignore them.
    pub typescript_runtime: Vec<TypeScriptRuntime>,
    /// Identifiers in type syntax that may name a binding (`A` in `x: A`, `Map<K, A>`, `typeof
    /// a`), in source order. The tree has no nodes for types, so scope analysis reads them here.
    pub type_references: Vec<TypeRef>,
    /// The parser's stack of lists being gathered; empty between parses.
    pub(crate) scratch: Vec<NodeIdentifier>,
}

/// A position in an [`SyntaxTree`]'s side tables ([`SyntaxTree::mark`], [`SyntaxTree::rewind`]).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Mark {
    tokens: usize,
    comments: usize,
    typescript: usize,
    typescript_runtime: usize,
    type_references: usize,
}

/// One piece of erased TypeScript syntax, attached to the node it belongs to.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct TypeScriptSyntax {
    pub node: NodeIdentifier,
    pub kind: TypeScriptKind,
    /// The type (after `:` / `as` / `satisfies`), the `<…>` list, or the `!` / `?` token.
    pub span: Span,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum TypeScriptKind {
    /// `x: T` on a binding or parameter.
    Annotation,
    /// `(…): T` on a function or arrow.
    ReturnType,
    /// `<T>` on a function or arrow.
    TypeParameters,
    /// `e as T`, on `e`.
    As,
    /// `e satisfies T`, on `e`.
    Satisfies,
    /// `e!`, on `e`.
    NonNull,
    /// `p?` on a parameter.
    Optional,
    /// `<T>` after a callee (`f<T>(…)`, `new C<T>(…)`), on the callee.
    TypeArgs,
}

/// An identifier in type syntax: a candidate reference whose binding scope analysis looks up.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct TypeRef {
    pub name: Atom,
    pub span: Span,
}

/// A TypeScript construct that has a runtime value, so it is not type syntax to erase.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct TypeScriptRuntime {
    pub feature: TypeScriptFeature,
    pub span: Span,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum TypeScriptFeature {
    /// `enum`, `declare enum`: an enum declares an object even under `declare`'s spelling.
    Enum,
    /// `namespace N { … }` whose body holds a statement other than type declarations.
    NamespaceWithValues,
}

impl Default for SyntaxTree {
    fn default() -> Self {
        Self::new()
    }
}

/// Buffers go back to the pool, under this type's key, in the reverse of the order
/// [`SyntaxTree::new`] takes them: the pool hands out the last one given first, so each column gets
/// back a buffer of its own size (`extra` and `scratch` share a type).
impl Drop for SyntaxTree {
    fn drop(&mut self) {
        buffer_pool::give_keyed::<Self, _>(std::mem::take(&mut self.scratch));
        buffer_pool::give_keyed::<Self, _>(std::mem::take(&mut self.type_references));
        buffer_pool::give_keyed::<Self, _>(std::mem::take(&mut self.typescript_runtime));
        buffer_pool::give_keyed::<Self, _>(std::mem::take(&mut self.typescript));
        buffer_pool::give_keyed::<Self, _>(std::mem::take(&mut self.comments));
        buffer_pool::give_string::<Self>(std::mem::take(&mut self.strings));
        buffer_pool::give_keyed::<Self, _>(std::mem::take(&mut self.extra));
        buffer_pool::give_keyed::<Self, _>(std::mem::take(&mut self.source_locations));
        buffer_pool::give_keyed::<Self, _>(std::mem::take(&mut self.data));
        buffer_pool::give_keyed::<Self, _>(std::mem::take(&mut self.flags));
        buffer_pool::give_keyed::<Self, _>(std::mem::take(&mut self.tags));
    }
}

impl SyntaxTree {
    #[must_use]
    pub fn new() -> Self {
        Self {
            tags: buffer_pool::take_keyed::<Self, _>(),
            flags: buffer_pool::take_keyed::<Self, _>(),
            data: buffer_pool::take_keyed::<Self, _>(),
            source_locations: buffer_pool::take_keyed::<Self, _>(),
            extra: buffer_pool::take_keyed::<Self, _>(),
            strings: buffer_pool::take_string::<Self>(),
            atoms: Interner::new(),
            comments: buffer_pool::take_keyed::<Self, _>(),
            tokens: Tokens::new(),
            typescript: buffer_pool::take_keyed::<Self, _>(),
            typescript_runtime: buffer_pool::take_keyed::<Self, _>(),
            type_references: buffer_pool::take_keyed::<Self, _>(),
            scratch: buffer_pool::take_keyed::<Self, _>(),
        }
    }

    #[must_use]
    pub const fn len(&self) -> usize {
        self.tags.len()
    }

    #[must_use]
    pub const fn is_empty(&self) -> bool {
        self.tags.is_empty()
    }

    /// Bytes held by the columns (capacity, not length), for memory reports.
    #[must_use]
    pub const fn heap_bytes(&self) -> usize {
        self.tags.capacity()
            + self.flags.capacity()
            + self.data.capacity() * 8
            + self.source_locations.capacity() * 8
            + self.extra.capacity() * 4
            + self.strings.capacity()
            + self.tokens.heap_bytes()
    }

    #[inline]
    #[must_use]
    pub fn tag(&self, identifier: NodeIdentifier) -> Tag {
        self.tags[identifier.index()]
    }

    #[inline]
    #[must_use]
    pub fn flags(&self, identifier: NodeIdentifier) -> u8 {
        self.flags[identifier.index()]
    }

    #[inline]
    #[must_use]
    pub fn source_location(&self, identifier: NodeIdentifier) -> SourceLocation {
        self.source_locations[identifier.index()]
    }

    #[inline]
    fn d(&self, identifier: NodeIdentifier) -> [u32; 2] {
        self.data[identifier.index()]
    }

    /// The raw `data` pair; for in-source strings and template elements, the value's byte range.
    #[inline]
    #[must_use]
    pub fn raw_data(&self, identifier: NodeIdentifier) -> [u32; 2] {
        self.data[identifier.index()]
    }

    #[inline]
    const fn nid(v: u32) -> NodeIdentifier {
        NodeIdentifier(v)
    }

    fn list_at(&self, at: u32) -> &[NodeIdentifier] {
        let len = self.extra[at as usize].0 as usize;
        &self.extra[at as usize + 1..at as usize + 1 + len]
    }

    fn rec(&self, at: u32, i: usize) -> NodeIdentifier {
        self.extra[at as usize + i]
    }

    #[must_use]
    #[expect(clippy::too_many_lines, reason = "one arm per node tag")]
    pub fn kind(&self, identifier: NodeIdentifier) -> Kind<'_> {
        let [a, b] = self.d(identifier);
        let f = self.flags(identifier);
        let opt = |v: u32| NodeIdentifier(v).opt();
        match self.tag(identifier) {
            Tag::Program => Kind::Program(self.list_at(a)),
            Tag::VariableDeclaration => Kind::VariableDeclaration {
                kind: f,
                declarations: self.list_at(a),
            },
            Tag::Declarator => Kind::Declarator {
                identifier: Self::nid(a),
                initializer: opt(b),
            },
            Tag::ExpressionStatement => Kind::ExpressionStatement(Self::nid(a)),
            Tag::FunctionDeclaration | Tag::FunctionExpression => Kind::Function {
                name: self.rec(a, 0).opt(),
                parameters: self.list_at(self.rec(a, 1).0),
                body: self.rec(a, 2),
                is_async: f & flag::ASYNC != 0,
                declaration: self.tag(identifier) == Tag::FunctionDeclaration,
            },
            Tag::Return => Kind::Return(opt(a)),
            Tag::If => Kind::If {
                test: self.rec(a, 0),
                consequent: self.rec(a, 1),
                alternate: self.rec(a, 2).opt(),
            },
            Tag::For => Kind::For {
                initializer: self.rec(a, 0).opt(),
                test: self.rec(a, 1).opt(),
                update: self.rec(a, 2).opt(),
                body: self.rec(a, 3),
            },
            Tag::Block => Kind::Block(self.list_at(a)),
            Tag::Empty => Kind::Empty,
            Tag::Import => Kind::Import {
                specifiers: self.list_at(a),
                source: Self::nid(b),
                type_only: f & flag::TYPE_ONLY != 0,
            },
            Tag::ImportDefault => Kind::ImportDefault(Self::nid(a)),
            Tag::ImportNamed => Kind::ImportNamed {
                imported: Self::nid(a),
                local: Self::nid(b),
            },
            Tag::ImportNamespace => Kind::ImportNamespace(Self::nid(a)),
            Tag::ExportNamed => Kind::ExportNamed(Self::nid(a)),
            Tag::ExportDefault => Kind::ExportDefault(Self::nid(a)),
            Tag::TypeScriptDeclaration => Kind::TypeScriptDeclaration,
            Tag::TypeScriptInterface => Kind::TypeScriptInterface {
                name: Self::nid(a),
                members: self.list_at(b),
            },
            Tag::TypeScriptPropertySignature => Kind::TypeScriptPropertySignature {
                key: Self::nid(a),
                optional: f & flag::OPTIONAL != 0,
            },
            Tag::Identifier => Kind::Identifier(Atom(a)),
            Tag::Number => Kind::Number(f64::from_bits(u64::from(a) | (u64::from(b) << 32))),
            Tag::String => Kind::String,
            Tag::Boolean => Kind::Boolean(a != 0),
            Tag::Null => Kind::Null,
            Tag::This => Kind::This,
            Tag::Template => Kind::Template {
                quasis: self.list_at(a),
                expressions: self.list_at(b),
            },
            Tag::TemplateElement => Kind::TemplateElement {
                tail: f & flag::TAIL != 0,
            },
            Tag::Array => Kind::Array(self.list_at(a)),
            Tag::Object => Kind::Object(self.list_at(a)),
            Tag::Property => Kind::Property {
                key: Self::nid(a),
                value: Self::nid(b),
                shorthand: f & flag::SHORTHAND != 0,
                computed: f & flag::COMPUTED != 0,
                method: f & flag::METHOD != 0,
            },
            Tag::Spread => Kind::Spread(Self::nid(a)),
            Tag::Member => Kind::Member {
                object: Self::nid(a),
                property: Self::nid(b),
                computed: f & flag::COMPUTED != 0,
                optional: f & flag::OPTIONAL != 0,
            },
            Tag::Call => Kind::Call {
                callee: Self::nid(a),
                arguments: self.list_at(b),
                optional: f & flag::OPTIONAL != 0,
                pure: f & flag::PURE != 0,
            },
            Tag::New => Kind::New {
                callee: Self::nid(a),
                arguments: self.list_at(b),
            },
            Tag::Arrow => Kind::Arrow {
                parameters: self.list_at(a),
                body: Self::nid(b),
                is_async: f & flag::ASYNC != 0,
                expression_body: f & flag::EXPRESSION_BODY != 0,
            },
            Tag::Unary => Kind::Unary(UnaryOperator::from_u8(f), Self::nid(a)),
            Tag::Update => Kind::Update {
                op: UpdateOperator::from_u8(f & !flag::PREFIX),
                prefix: f & flag::PREFIX != 0,
                arg: Self::nid(a),
            },
            Tag::Binary => Kind::Binary(BinaryOperator::from_u8(f), Self::nid(a), Self::nid(b)),
            Tag::Logical => Kind::Logical(LogicalOperator::from_u8(f), Self::nid(a), Self::nid(b)),
            Tag::Conditional => Kind::Conditional {
                test: self.rec(a, 0),
                consequent: self.rec(a, 1),
                alternate: self.rec(a, 2),
            },
            Tag::Assign => Kind::Assign(AssignmentOperator::from_u8(f), Self::nid(a), Self::nid(b)),
            Tag::Sequence => Kind::Sequence(self.list_at(a)),
            Tag::Await => Kind::Await(Self::nid(a)),
            Tag::ObjectPattern => Kind::ObjectPattern(self.list_at(a)),
            Tag::ArrayPattern => Kind::ArrayPattern(self.list_at(a)),
            Tag::AssignPattern => Kind::AssignPattern(Self::nid(a), Self::nid(b)),
            Tag::Rest => Kind::Rest(Self::nid(a)),
            Tag::Hole => Kind::Hole,
        }
    }

    /// Calls `f` on each direct child, in source order.
    #[expect(clippy::too_many_lines, reason = "one arm per node kind")]
    pub fn for_each_child(&self, identifier: NodeIdentifier, mut f: impl FnMut(NodeIdentifier)) {
        let mut each =
            |identifiers: &[NodeIdentifier]| Self::visit_present_nodes(identifiers, &mut f);
        match self.kind(identifier) {
            Kind::Program(l)
            | Kind::Block(l)
            | Kind::Array(l)
            | Kind::Object(l)
            | Kind::Sequence(l)
            | Kind::ObjectPattern(l)
            | Kind::ArrayPattern(l) => each(l),
            Kind::VariableDeclaration { declarations, .. } => each(declarations),
            Kind::Declarator {
                identifier,
                initializer,
            } => each(&[identifier, initializer.unwrap_or(NodeIdentifier::NONE)]),
            Kind::ExpressionStatement(e)
            | Kind::Spread(e)
            | Kind::Await(e)
            | Kind::Rest(e)
            | Kind::ExportNamed(e)
            | Kind::ExportDefault(e)
            | Kind::ImportDefault(e)
            | Kind::ImportNamespace(e)
            | Kind::Unary(_, e)
            | Kind::Update { arg: e, .. } => each(&[e]),
            Kind::Function {
                name,
                parameters,
                body,
                ..
            } => {
                each(&[name.unwrap_or(NodeIdentifier::NONE)]);
                each(parameters);
                each(&[body]);
            }
            Kind::Return(e) => each(&[e.unwrap_or(NodeIdentifier::NONE)]),
            Kind::If {
                test,
                consequent,
                alternate,
            } => each(&[test, consequent, alternate.unwrap_or(NodeIdentifier::NONE)]),
            Kind::For {
                initializer,
                test,
                update,
                body,
            } => each(&[
                initializer.unwrap_or(NodeIdentifier::NONE),
                test.unwrap_or(NodeIdentifier::NONE),
                update.unwrap_or(NodeIdentifier::NONE),
                body,
            ]),
            Kind::Import {
                specifiers, source, ..
            } => {
                each(specifiers);
                each(&[source]);
            }
            Kind::ImportNamed { imported, local } => each(&[imported, local]),
            Kind::Template {
                quasis,
                expressions,
            } => {
                Self::for_each_template_child(quasis, expressions, &mut each);
            }
            Kind::Property {
                key,
                value,
                shorthand,
                ..
            } => Self::for_each_property_child(key, value, shorthand, &mut each),
            Kind::Member {
                object, property, ..
            } => each(&[object, property]),
            Kind::Call {
                callee, arguments, ..
            }
            | Kind::New { callee, arguments } => {
                each(&[callee]);
                each(arguments);
            }
            Kind::Arrow {
                parameters, body, ..
            } => {
                each(parameters);
                each(&[body]);
            }
            Kind::Binary(_, l, r)
            | Kind::Logical(_, l, r)
            | Kind::Assign(_, l, r)
            | Kind::AssignPattern(l, r) => each(&[l, r]),
            Kind::Conditional {
                test,
                consequent,
                alternate,
            } => each(&[test, consequent, alternate]),
            // Types are not scope-visible: an interface's names never resolve as values.
            Kind::TypeScriptDeclaration
            | Kind::TypeScriptInterface { .. }
            | Kind::TypeScriptPropertySignature { .. }
            | Kind::Identifier(_)
            | Kind::Number(_)
            | Kind::String
            | Kind::Boolean(_)
            | Kind::Null
            | Kind::This
            | Kind::TemplateElement { .. }
            | Kind::Empty
            | Kind::Hole => {}
        }
    }

    fn visit_present_nodes(identifiers: &[NodeIdentifier], visit: &mut impl FnMut(NodeIdentifier)) {
        identifiers
            .iter()
            .copied()
            .filter(|child| !child.is_none())
            .for_each(visit);
    }

    fn for_each_property_child(
        key: NodeIdentifier,
        value: NodeIdentifier,
        shorthand: bool,
        each: &mut impl FnMut(&[NodeIdentifier]),
    ) {
        if shorthand {
            each(&[value]);
        } else {
            each(&[key, value]);
        }
    }

    fn for_each_template_child(
        quasis: &[NodeIdentifier],
        expressions: &[NodeIdentifier],
        each: &mut impl FnMut(&[NodeIdentifier]),
    ) {
        for (index, quasi) in quasis.iter().enumerate() {
            each(&[*quasi]);
            if let Some(expression) = expressions.get(index) {
                each(&[*expression]);
            }
        }
    }

    /// How far the side tables a parse appends to (tokens, comments, TypeScript syntax) reach now.
    #[must_use]
    pub const fn mark(&self) -> Mark {
        Mark {
            tokens: self.tokens.len(),
            comments: self.comments.len(),
            typescript: self.typescript.len(),
            typescript_runtime: self.typescript_runtime.len(),
            type_references: self.type_references.len(),
        }
    }

    /// Drops what parses after `mark` recorded in the side tables, for an embedding language that
    /// discards a parse and reads the region again. The nodes stay, unreachable from any root.
    pub fn rewind(&mut self, mark: Mark) {
        self.tokens.truncate(mark.tokens);
        self.comments.truncate(mark.comments);
        self.typescript.truncate(mark.typescript);
        self.typescript_runtime.truncate(mark.typescript_runtime);
        self.type_references.truncate(mark.type_references);
    }

    /// What the parser recorded since `tokens_from` tokens and `comments_from` comments, merged in
    /// source order: `Some(kind)` for a token, `None` for a comment. An embedding language copies
    /// this into its own token table, with whitespace in the gaps.
    pub fn recorded_since(
        &self,
        tokens_from: usize,
        comments_from: usize,
    ) -> impl Iterator<Item = (Option<T>, Span)> + '_ {
        let mut tokens = self.tokens.since(tokens_from).iter().peekable();
        let mut comments = self.comments[comments_from..].iter().peekable();
        std::iter::from_fn(move || {
            let token_first = match (tokens.peek(), comments.peek()) {
                (None, None) => return None,
                (Some(t), Some(c)) => t.span.start_offset < c.start_offset,
                (t, _) => t.is_some(),
            };
            if token_first {
                tokens.next().map(|t| (Some(t.kind), t.span))
            } else {
                comments.next().map(|&c| (None, c))
            }
        })
    }

    /// Per node, its parent (`NodeIdentifier::NONE` for roots). A side table built on demand: the
    /// tree itself stores no back edges, so it stays immutable and compact for the tasks that
    /// never ask.
    #[must_use]
    pub fn parents(&self) -> Vec<NodeIdentifier> {
        let mut parents = vec![NodeIdentifier::NONE; self.len()];
        for i in 0..self.len() as u32 {
            self.for_each_child(NodeIdentifier(i), |c| {
                parents[c.index()] = NodeIdentifier(i);
            });
        }
        parents
    }

    /// The name of an identifier node.
    ///
    /// # Panics
    ///
    /// If `identifier` is not an identifier.
    #[must_use]
    pub fn name(&self, identifier: NodeIdentifier) -> &str {
        match self.kind(identifier) {
            Kind::Identifier(a) => self.atoms.get(a),
            k => panic!("not an identifier: {k:?}"),
        }
    }

    #[must_use]
    pub fn atom(&self, identifier: NodeIdentifier) -> Option<Atom> {
        match self.kind(identifier) {
            Kind::Identifier(a) => Some(a),
            _ => None,
        }
    }

    /// The decoded value of a string literal, or the raw text of a template element.
    #[must_use]
    pub fn str_value<'s>(&'s self, identifier: NodeIdentifier, source_text: &'s str) -> &'s str {
        let [a, b] = self.d(identifier);
        if self.flags(identifier) & flag::OWNED != 0 {
            &self.strings[a as usize..b as usize]
        } else {
            &source_text[a as usize..b as usize]
        }
    }

    // ---- builder -------------------------------------------------------------------------------

    #[inline]
    fn push(
        &mut self,
        tag: Tag,
        flags: u8,
        data: [u32; 2],
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let identifier = NodeIdentifier(self.tags.len() as u32);
        self.tags.push(tag);
        self.flags.push(flags);
        self.data.push(data);
        self.source_locations.push(source_location.into());
        identifier
    }

    fn list(&mut self, items: &[NodeIdentifier]) -> u32 {
        let at = self.extra.len() as u32;
        self.extra.push(NodeIdentifier(items.len() as u32));
        self.extra.extend_from_slice(items);
        at
    }

    fn record(&mut self, items: &[NodeIdentifier]) -> u32 {
        let at = self.extra.len() as u32;
        self.extra.extend_from_slice(items);
        at
    }

    fn own_str(&mut self, s: &str) -> [u32; 2] {
        let start = self.strings.len() as u32;
        self.strings.push_str(s);
        [start, self.strings.len() as u32]
    }

    pub fn program(
        &mut self,
        body: &[NodeIdentifier],
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let l = self.list(body);
        self.push(Tag::Program, 0, [l, 0], source_location)
    }

    pub fn var_declaration(
        &mut self,
        kind: u8,
        declarations: &[NodeIdentifier],
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let l = self.list(declarations);
        self.push(Tag::VariableDeclaration, kind, [l, 0], source_location)
    }

    pub fn declarator(
        &mut self,
        identifier: NodeIdentifier,
        initializer: Option<NodeIdentifier>,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(
            Tag::Declarator,
            0,
            [identifier.0, initializer.unwrap_or(NodeIdentifier::NONE).0],
            source_location,
        )
    }

    /// `kind name = initializer;` with a single declarator.
    pub fn let_(
        &mut self,
        kind: u8,
        identifier: NodeIdentifier,
        initializer: Option<NodeIdentifier>,
    ) -> NodeIdentifier {
        let d = self.declarator(identifier, initializer, SourceLocation::SYNTHETIC);
        self.var_declaration(kind, &[d], SourceLocation::SYNTHETIC)
    }

    pub fn expression_statement(&mut self, e: NodeIdentifier) -> NodeIdentifier {
        let source_location = self.source_location(e);
        self.push(Tag::ExpressionStatement, 0, [e.0, 0], source_location)
    }

    pub fn expression_statement_at(
        &mut self,
        e: NodeIdentifier,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(Tag::ExpressionStatement, 0, [e.0, 0], source_location)
    }

    pub fn function(
        &mut self,
        declaration: bool,
        name: Option<NodeIdentifier>,
        parameters: &[NodeIdentifier],
        body: NodeIdentifier,
        is_async: bool,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let p = self.list(parameters);
        let r = self.record(&[
            name.unwrap_or(NodeIdentifier::NONE),
            NodeIdentifier(p),
            body,
        ]);
        self.push(
            if declaration {
                Tag::FunctionDeclaration
            } else {
                Tag::FunctionExpression
            },
            if is_async { flag::ASYNC } else { 0 },
            [r, 0],
            source_location,
        )
    }

    pub fn return_(
        &mut self,
        arg: Option<NodeIdentifier>,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(
            Tag::Return,
            0,
            [arg.unwrap_or(NodeIdentifier::NONE).0, 0],
            source_location,
        )
    }

    pub fn if_(
        &mut self,
        test: NodeIdentifier,
        consequent: NodeIdentifier,
        alternate: Option<NodeIdentifier>,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let r = self.record(&[test, consequent, alternate.unwrap_or(NodeIdentifier::NONE)]);
        self.push(Tag::If, 0, [r, 0], source_location)
    }

    pub fn for_(
        &mut self,
        initializer: Option<NodeIdentifier>,
        test: Option<NodeIdentifier>,
        update: Option<NodeIdentifier>,
        body: NodeIdentifier,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let none = NodeIdentifier::NONE;
        let r = self.record(&[
            initializer.unwrap_or(none),
            test.unwrap_or(none),
            update.unwrap_or(none),
            body,
        ]);
        self.push(Tag::For, 0, [r, 0], source_location)
    }

    pub fn block(
        &mut self,
        body: &[NodeIdentifier],
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let l = self.list(body);
        self.push(Tag::Block, 0, [l, 0], source_location)
    }

    pub fn empty(&mut self, source_location: impl Into<SourceLocation>) -> NodeIdentifier {
        self.push(Tag::Empty, 0, [0, 0], source_location)
    }

    pub fn import(
        &mut self,
        specifiers: &[NodeIdentifier],
        source: NodeIdentifier,
        type_only: bool,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let l = self.list(specifiers);
        self.push(
            Tag::Import,
            if type_only { flag::TYPE_ONLY } else { 0 },
            [l, source.0],
            source_location,
        )
    }

    pub fn import_default(
        &mut self,
        local: NodeIdentifier,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(Tag::ImportDefault, 0, [local.0, 0], source_location)
    }

    pub fn import_named(
        &mut self,
        imported: NodeIdentifier,
        local: NodeIdentifier,
        type_only: bool,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(
            Tag::ImportNamed,
            if type_only { flag::TYPE_ONLY } else { 0 },
            [imported.0, local.0],
            source_location,
        )
    }

    pub fn import_namespace(
        &mut self,
        local: NodeIdentifier,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(Tag::ImportNamespace, 0, [local.0, 0], source_location)
    }

    pub fn export_named(
        &mut self,
        declaration: NodeIdentifier,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(Tag::ExportNamed, 0, [declaration.0, 0], source_location)
    }

    pub fn export_default(
        &mut self,
        declaration: NodeIdentifier,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(Tag::ExportDefault, 0, [declaration.0, 0], source_location)
    }

    pub fn typescript_declaration(
        &mut self,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(Tag::TypeScriptDeclaration, 0, [0, 0], source_location)
    }

    pub fn typescript_interface(
        &mut self,
        name: NodeIdentifier,
        members: &[NodeIdentifier],
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let l = self.list(members);
        self.push(Tag::TypeScriptInterface, 0, [name.0, l], source_location)
    }

    pub fn typescript_prop_sig(
        &mut self,
        key: NodeIdentifier,
        optional: bool,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let f = if optional { flag::OPTIONAL } else { 0 };
        self.push(
            Tag::TypeScriptPropertySignature,
            f,
            [key.0, 0],
            source_location,
        )
    }

    pub fn ident_atom(
        &mut self,
        atom: Atom,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(Tag::Identifier, 0, [atom.0, 0], source_location)
    }

    pub fn ident(
        &mut self,
        name: &str,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let a = self.atoms.intern(name);
        self.ident_atom(a, source_location)
    }

    /// A synthesized identifier.
    pub fn identifier(&mut self, name: &str) -> NodeIdentifier {
        self.ident(name, SourceLocation::SYNTHETIC)
    }

    pub fn write_number(
        &mut self,
        v: f64,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let bits = v.to_bits();
        self.push(
            Tag::Number,
            0,
            [bits as u32, (bits >> 32) as u32],
            source_location,
        )
    }

    /// A string literal whose value is the source bytes `value` (no escapes in between).
    pub fn str_in_source(
        &mut self,
        value: Span,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(
            Tag::String,
            0,
            [value.start_offset, value.end_offset],
            source_location,
        )
    }

    pub fn str_owned(
        &mut self,
        value: &str,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let d = self.own_str(value);
        self.push(Tag::String, flag::OWNED, d, source_location)
    }

    pub fn write_string(&mut self, value: &str) -> NodeIdentifier {
        self.str_owned(value, SourceLocation::SYNTHETIC)
    }

    pub fn write_boolean(
        &mut self,
        v: bool,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(Tag::Boolean, 0, [u32::from(v), 0], source_location)
    }

    pub fn null(&mut self, source_location: impl Into<SourceLocation>) -> NodeIdentifier {
        self.push(Tag::Null, 0, [0, 0], source_location)
    }

    pub fn this(&mut self, source_location: impl Into<SourceLocation>) -> NodeIdentifier {
        self.push(Tag::This, 0, [0, 0], source_location)
    }

    pub fn template(
        &mut self,
        quasis: &[NodeIdentifier],
        expressions: &[NodeIdentifier],
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        debug_assert_eq!(
            quasis.len(),
            expressions.len() + 1,
            "a template has one more quasi than expressions"
        );
        let q = self.list(quasis);
        let e = self.list(expressions);
        self.push(Tag::Template, 0, [q, e], source_location)
    }

    /// A template element whose raw text is the source bytes `raw`.
    pub fn template_element_in_source(
        &mut self,
        raw: Span,
        tail: bool,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(
            Tag::TemplateElement,
            if tail { flag::TAIL } else { 0 },
            [raw.start_offset, raw.end_offset],
            source_location,
        )
    }

    /// A template element with synthesized raw text (already escaped for a template literal).
    pub fn template_element(&mut self, raw: &str, tail: bool) -> NodeIdentifier {
        let d = self.own_str(raw);
        self.push(
            Tag::TemplateElement,
            flag::OWNED | if tail { flag::TAIL } else { 0 },
            d,
            SourceLocation::SYNTHETIC,
        )
    }

    pub fn array(
        &mut self,
        items: &[NodeIdentifier],
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let l = self.list(items);
        self.push(Tag::Array, 0, [l, 0], source_location)
    }

    pub fn object(
        &mut self,
        props: &[NodeIdentifier],
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let l = self.list(props);
        self.push(Tag::Object, 0, [l, 0], source_location)
    }

    pub fn property(
        &mut self,
        key: NodeIdentifier,
        value: NodeIdentifier,
        flags: u8,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(Tag::Property, flags, [key.0, value.0], source_location)
    }

    pub fn spread(
        &mut self,
        arg: NodeIdentifier,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(Tag::Spread, 0, [arg.0, 0], source_location)
    }

    pub fn member(
        &mut self,
        object: NodeIdentifier,
        property: NodeIdentifier,
        computed: bool,
        optional: bool,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let f =
            if computed { flag::COMPUTED } else { 0 } | if optional { flag::OPTIONAL } else { 0 };
        self.push(Tag::Member, f, [object.0, property.0], source_location)
    }

    /// `object.name`, synthesized.
    pub fn dot(&mut self, object: NodeIdentifier, name: &str) -> NodeIdentifier {
        let p = self.identifier(name);
        self.member(object, p, false, false, SourceLocation::SYNTHETIC)
    }

    pub fn call(
        &mut self,
        callee: NodeIdentifier,
        arguments: &[NodeIdentifier],
        optional: bool,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let l = self.list(arguments);
        self.push(
            Tag::Call,
            if optional { flag::OPTIONAL } else { 0 },
            [callee.0, l],
            source_location,
        )
    }

    /// `callee(arguments)`, synthesized.
    pub fn call0(
        &mut self,
        callee: NodeIdentifier,
        arguments: &[NodeIdentifier],
    ) -> NodeIdentifier {
        self.call(callee, arguments, false, SourceLocation::SYNTHETIC)
    }

    /// `$.name(arguments)` — the shape of nearly every runtime call a lowering emits.
    pub fn runtime(
        &mut self,
        ns: &str,
        name: &str,
        arguments: &[NodeIdentifier],
    ) -> NodeIdentifier {
        let n = self.identifier(ns);
        let callee = self.dot(n, name);
        self.call0(callee, arguments)
    }

    pub fn mark_pure(&mut self, call: NodeIdentifier) {
        self.flags[call.index()] |= flag::PURE;
    }

    pub fn new_(
        &mut self,
        callee: NodeIdentifier,
        arguments: &[NodeIdentifier],
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let l = self.list(arguments);
        self.push(Tag::New, 0, [callee.0, l], source_location)
    }

    pub fn arrow(
        &mut self,
        parameters: &[NodeIdentifier],
        body: NodeIdentifier,
        expression_body: bool,
        is_async: bool,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let l = self.list(parameters);
        let f = if expression_body {
            flag::EXPRESSION_BODY
        } else {
            0
        } | if is_async { flag::ASYNC } else { 0 };
        self.push(Tag::Arrow, f, [l, body.0], source_location)
    }

    pub fn unary(
        &mut self,
        op: UnaryOperator,
        arg: NodeIdentifier,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(Tag::Unary, op as u8, [arg.0, 0], source_location)
    }

    pub fn update(
        &mut self,
        op: UpdateOperator,
        prefix: bool,
        arg: NodeIdentifier,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(
            Tag::Update,
            op as u8 | if prefix { flag::PREFIX } else { 0 },
            [arg.0, 0],
            source_location,
        )
    }

    pub fn binary(
        &mut self,
        op: BinaryOperator,
        l: NodeIdentifier,
        r: NodeIdentifier,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(Tag::Binary, op as u8, [l.0, r.0], source_location)
    }

    pub fn logical(
        &mut self,
        op: LogicalOperator,
        l: NodeIdentifier,
        r: NodeIdentifier,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(Tag::Logical, op as u8, [l.0, r.0], source_location)
    }

    pub fn cond(
        &mut self,
        test: NodeIdentifier,
        consequent: NodeIdentifier,
        alternate: NodeIdentifier,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let r = self.record(&[test, consequent, alternate]);
        self.push(Tag::Conditional, 0, [r, 0], source_location)
    }

    pub fn assign(
        &mut self,
        op: AssignmentOperator,
        target: NodeIdentifier,
        value: NodeIdentifier,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(Tag::Assign, op as u8, [target.0, value.0], source_location)
    }

    pub fn seq(
        &mut self,
        items: &[NodeIdentifier],
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let l = self.list(items);
        self.push(Tag::Sequence, 0, [l, 0], source_location)
    }

    pub fn await_(
        &mut self,
        arg: NodeIdentifier,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(Tag::Await, 0, [arg.0, 0], source_location)
    }

    pub fn object_pat(
        &mut self,
        props: &[NodeIdentifier],
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let l = self.list(props);
        self.push(Tag::ObjectPattern, 0, [l, 0], source_location)
    }

    pub fn array_pat(
        &mut self,
        items: &[NodeIdentifier],
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let l = self.list(items);
        self.push(Tag::ArrayPattern, 0, [l, 0], source_location)
    }

    pub fn assign_pat(
        &mut self,
        left: NodeIdentifier,
        right: NodeIdentifier,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(Tag::AssignPattern, 0, [left.0, right.0], source_location)
    }

    pub fn rest(
        &mut self,
        arg: NodeIdentifier,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(Tag::Rest, 0, [arg.0, 0], source_location)
    }

    pub fn hole(&mut self, source_location: impl Into<SourceLocation>) -> NodeIdentifier {
        self.push(Tag::Hole, 0, [0, 0], source_location)
    }
}

// Layout guard: a node row stays 18 bytes across the five columns.
const _: () = assert!(
    size_of::<Tag>() + size_of::<u8>() + size_of::<[u32; 2]>() + size_of::<Span>() == 18,
    "a node row grew past 18 bytes"
);
const _: () = assert!(size_of::<NodeIdentifier>() == 4, "NodeIdentifier is a u32");
