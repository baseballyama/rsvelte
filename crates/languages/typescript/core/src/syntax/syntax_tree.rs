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
    Regex,
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
    Control,
    ImportExpression,
    MetaProperty,
    BigInt,
    Class,
    Super,
    Yield,
}

pub mod flag {
    pub const GROUPED: u8 = 0x40;
    pub const VAR: u8 = 0;
    pub const LET: u8 = 1;
    pub const CONST: u8 = 2;
    pub const ASYNC: u8 = 1;
    pub const GENERATOR: u8 = 4;
    pub const EXPRESSION_BODY: u8 = 2;
    pub const SHORTHAND: u8 = 1;
    pub const COMPUTED: u8 = 2;
    pub const METHOD: u8 = 4;
    pub const GETTER: u8 = 8;
    pub const SETTER: u8 = 16;
    pub const OPTIONAL: u8 = 1;
    pub const PREFIX: u8 = 0x80;
    /// String: value lives in `strings`, not in the source.
    pub const OWNED: u8 = 1;
    pub const TAIL: u8 = 2;
    /// Call/New: annotated `/* @__PURE__ */`.
    pub const PURE: u8 = 4;
    /// Import/Export: `import type` / `export type` (erased).
    pub const TYPE_ONLY: u8 = 8;
    pub const IMPORT_ATTRIBUTES: u8 = 16;
}

/// A decoded view of one node. Lists borrow the `extra` column directly.
#[derive(Clone, Copy, Debug)]
pub enum Kind<'a> {
    Control(Control<'a>),
    Class(Class<'a>),
    Super,
    Yield {
        argument: Option<NodeIdentifier>,
        delegate: bool,
    },
    ImportExpression {
        source: NodeIdentifier,
        options: Option<NodeIdentifier>,
    },
    MetaProperty {
        meta: NodeIdentifier,
        property: NodeIdentifier,
    },
    BigInt,
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
        attributes: Option<NodeIdentifier>,
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
    Regex {
        pattern: Span,
        flags: Span,
    },
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
        getter: bool,
        setter: bool,
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

    pub fn grouped(&mut self, identifier: NodeIdentifier) -> NodeIdentifier {
        self.push(
            self.tag(identifier),
            self.flags(identifier) | flag::GROUPED,
            self.d(identifier),
            self.source_location(identifier),
        )
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
}

// Layout guard: a node row stays 18 bytes across the five columns.
const _: () = assert!(
    size_of::<Tag>() + size_of::<u8>() + size_of::<[u32; 2]>() + size_of::<Span>() == 18,
    "a node row grew past 18 bytes"
);
const _: () = assert!(size_of::<NodeIdentifier>() == 4, "NodeIdentifier is a u32");

mod classes;
mod control;
mod expressions;
mod read;
mod statements;
pub use classes::Class;
pub use control::Control;
mod traverse;

mod typescript;
pub use typescript::{
    TypeRef, TypeScriptFeature, TypeScriptKind, TypeScriptRuntime, TypeScriptSyntax,
};
