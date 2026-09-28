//! The columnar JS AST.
//!
//! A node is a row across five columns — `tags` (u8), `flags` (u8: operator or variant bits),
//! `data` (two u32), `locs` (two u32) — 18 bytes with no padding, plus variable-length child lists
//! in `extra`. Children are [`NodeId`]s (u32), never pointers, so the tree is `Send + Sync`, trivially
//! relocatable, and can be handed across an ABI as plain buffers.
//!
//! Text is not copied: identifier names are interned per document, and string/template literals
//! point into the source unless decoding changed their bytes (then they live in `strs`).
//!
//! The builder methods (`ident`, `call`, `member`, …) are the one way to create nodes; the parser
//! and every lowering use them, and so would any other parser plugged in behind this AST.
//!
//! Columns are taken from and returned to the per-thread [`rsv_kernel::pool`] so that, in steady
//! state, building a tree for the next document reuses the previous document's capacity.

use crate::ops::{AssignOp, BinOp, LogicalOp, UnaryOp, UpdateOp};
use rsv_kernel::intern::{Atom, Interner};
use rsv_kernel::pool;
use rsv_kernel::source::{Loc, Span};

#[derive(Clone, Copy, PartialEq, Eq, Hash, Debug, PartialOrd, Ord)]
#[repr(transparent)]
pub struct NodeId(pub u32);

impl NodeId {
    pub const NONE: NodeId = NodeId(u32::MAX);

    #[inline]
    pub fn is_none(self) -> bool {
        self == NodeId::NONE
    }

    #[inline]
    pub fn opt(self) -> Option<NodeId> {
        if self.is_none() { None } else { Some(self) }
    }

    #[inline]
    pub fn idx(self) -> usize {
        self.0 as usize
    }
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
#[repr(u8)]
pub enum Tag {
    Program,
    VarDecl,
    Declarator,
    ExprStmt,
    FnDecl,
    Return,
    If,
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
    TsDecl,
    /// `interface Name { key?: T; … }` with property members only; any other interface is a `TsDecl`.
    TsInterface,
    /// A property member of a [`Tag::TsInterface`]; its type is a [`TsKind::Annotation`].
    TsPropSig,
    Ident,
    Num,
    Str,
    Bool,
    Null,
    This,
    Template,
    TemplateElem,
    Array,
    Object,
    Property,
    Spread,
    Member,
    Call,
    New,
    Arrow,
    FnExpr,
    Unary,
    Update,
    Binary,
    Logical,
    Cond,
    Assign,
    Seq,
    Await,
    ObjectPat,
    ArrayPat,
    AssignPat,
    Rest,
    Hole,
}

pub mod flag {
    pub const VAR: u8 = 0;
    pub const LET: u8 = 1;
    pub const CONST: u8 = 2;
    pub const ASYNC: u8 = 1;
    pub const EXPR_BODY: u8 = 2;
    pub const SHORTHAND: u8 = 1;
    pub const COMPUTED: u8 = 2;
    pub const METHOD: u8 = 4;
    pub const OPTIONAL: u8 = 1;
    pub const PREFIX: u8 = 0x80;
    /// Str: value lives in `strs`, not in the source.
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
    Program(&'a [NodeId]),
    VarDecl {
        kind: u8,
        decls: &'a [NodeId],
    },
    Declarator {
        id: NodeId,
        init: Option<NodeId>,
    },
    ExprStmt(NodeId),
    Function {
        name: Option<NodeId>,
        params: &'a [NodeId],
        body: NodeId,
        is_async: bool,
        decl: bool,
    },
    Return(Option<NodeId>),
    If {
        test: NodeId,
        cons: NodeId,
        alt: Option<NodeId>,
    },
    Block(&'a [NodeId]),
    Empty,
    Import {
        specifiers: &'a [NodeId],
        source: NodeId,
        type_only: bool,
    },
    ImportDefault(NodeId),
    ImportNamed {
        imported: NodeId,
        local: NodeId,
    },
    ImportNamespace(NodeId),
    ExportNamed(NodeId),
    ExportDefault(NodeId),
    TsDecl,
    TsInterface {
        name: NodeId,
        members: &'a [NodeId],
    },
    TsPropSig {
        key: NodeId,
        optional: bool,
    },
    Ident(Atom),
    Num(f64),
    Str,
    Bool(bool),
    Null,
    This,
    Template {
        quasis: &'a [NodeId],
        exprs: &'a [NodeId],
    },
    TemplateElem {
        tail: bool,
    },
    Array(&'a [NodeId]),
    Object(&'a [NodeId]),
    Property {
        key: NodeId,
        value: NodeId,
        shorthand: bool,
        computed: bool,
        method: bool,
    },
    Spread(NodeId),
    Member {
        object: NodeId,
        property: NodeId,
        computed: bool,
        optional: bool,
    },
    Call {
        callee: NodeId,
        args: &'a [NodeId],
        optional: bool,
        pure: bool,
    },
    New {
        callee: NodeId,
        args: &'a [NodeId],
    },
    Arrow {
        params: &'a [NodeId],
        body: NodeId,
        is_async: bool,
        expr_body: bool,
    },
    Unary(UnaryOp, NodeId),
    Update {
        op: UpdateOp,
        prefix: bool,
        arg: NodeId,
    },
    Binary(BinOp, NodeId, NodeId),
    Logical(LogicalOp, NodeId, NodeId),
    Cond {
        test: NodeId,
        cons: NodeId,
        alt: NodeId,
    },
    Assign(AssignOp, NodeId, NodeId),
    Seq(&'a [NodeId]),
    Await(NodeId),
    ObjectPat(&'a [NodeId]),
    ArrayPat(&'a [NodeId]),
    AssignPat(NodeId, NodeId),
    Rest(NodeId),
    Hole,
}

pub struct Ast {
    tags: Vec<Tag>,
    flags: Vec<u8>,
    data: Vec<[u32; 2]>,
    locs: Vec<Loc>,
    /// Child lists, each stored as `[len, ids…]`; also fixed-size records for nodes with >2 fields.
    extra: Vec<NodeId>,
    /// Decoded string values and synthesized text.
    strs: String,
    pub atoms: Interner,
    /// Comment locs in source order (`//…` and `/*…*/`, delimiters included).
    pub comments: Vec<Span>,
    /// TypeScript syntax the tree erases, in source order. Compilation ignores it; source-preserving
    /// consumers (the formatter, the type-check projection) read it back by node.
    pub ts: Vec<TsSyntax>,
}

/// One piece of erased TypeScript syntax, attached to the node it belongs to.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct TsSyntax {
    pub node: NodeId,
    pub kind: TsKind,
    /// The type (after `:` / `as` / `satisfies`), the `<…>` list, or the `!` / `?` token.
    pub span: Span,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum TsKind {
    /// `x: T` on a binding or parameter.
    Annotation,
    /// `(…): T` on a function or arrow.
    ReturnType,
    /// `<T>` on a function or arrow.
    TypeParams,
    /// `e as T`, on `e`.
    As,
    /// `e satisfies T`, on `e`.
    Satisfies,
    /// `e!`, on `e`.
    NonNull,
    /// `p?` on a parameter.
    Optional,
}

impl Default for Ast {
    fn default() -> Self {
        Ast::new()
    }
}

impl Drop for Ast {
    fn drop(&mut self) {
        pool::give(std::mem::take(&mut self.tags));
        pool::give(std::mem::take(&mut self.flags));
        pool::give(std::mem::take(&mut self.data));
        pool::give(std::mem::take(&mut self.locs));
        pool::give(std::mem::take(&mut self.extra));
        pool::give(std::mem::take(&mut self.comments));
    }
}

impl Ast {
    pub fn new() -> Ast {
        Ast {
            tags: pool::take(),
            flags: pool::take(),
            data: pool::take(),
            locs: pool::take(),
            extra: pool::take(),
            strs: String::new(),
            atoms: Interner::new(),
            comments: pool::take(),
            ts: Vec::new(),
        }
    }

    pub fn len(&self) -> usize {
        self.tags.len()
    }

    pub fn is_empty(&self) -> bool {
        self.tags.is_empty()
    }

    /// Bytes held by the columns (capacity, not length), for memory reports.
    pub fn heap_bytes(&self) -> usize {
        self.tags.capacity()
            + self.flags.capacity()
            + self.data.capacity() * 8
            + self.locs.capacity() * 8
            + self.extra.capacity() * 4
            + self.strs.capacity()
    }

    #[inline]
    pub fn tag(&self, id: NodeId) -> Tag {
        self.tags[id.idx()]
    }

    #[inline]
    pub fn flags(&self, id: NodeId) -> u8 {
        self.flags[id.idx()]
    }

    #[inline]
    pub fn loc(&self, id: NodeId) -> Loc {
        self.locs[id.idx()]
    }

    #[inline]
    fn d(&self, id: NodeId) -> [u32; 2] {
        self.data[id.idx()]
    }

    /// The raw `data` pair; for in-source strings and template elements, the value's byte range.
    #[inline]
    pub fn raw_data(&self, id: NodeId) -> [u32; 2] {
        self.data[id.idx()]
    }

    #[inline]
    fn nid(v: u32) -> NodeId {
        NodeId(v)
    }

    fn list_at(&self, at: u32) -> &[NodeId] {
        let len = self.extra[at as usize].0 as usize;
        &self.extra[at as usize + 1..at as usize + 1 + len]
    }

    fn rec(&self, at: u32, i: usize) -> NodeId {
        self.extra[at as usize + i]
    }

    pub fn kind(&self, id: NodeId) -> Kind<'_> {
        let [a, b] = self.d(id);
        let f = self.flags(id);
        let opt = |v: u32| NodeId(v).opt();
        match self.tag(id) {
            Tag::Program => Kind::Program(self.list_at(a)),
            Tag::VarDecl => Kind::VarDecl {
                kind: f,
                decls: self.list_at(a),
            },
            Tag::Declarator => Kind::Declarator {
                id: Self::nid(a),
                init: opt(b),
            },
            Tag::ExprStmt => Kind::ExprStmt(Self::nid(a)),
            Tag::FnDecl | Tag::FnExpr => Kind::Function {
                name: self.rec(a, 0).opt(),
                params: self.list_at(self.rec(a, 1).0),
                body: self.rec(a, 2),
                is_async: f & flag::ASYNC != 0,
                decl: self.tag(id) == Tag::FnDecl,
            },
            Tag::Return => Kind::Return(opt(a)),
            Tag::If => Kind::If {
                test: self.rec(a, 0),
                cons: self.rec(a, 1),
                alt: self.rec(a, 2).opt(),
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
            Tag::TsDecl => Kind::TsDecl,
            Tag::TsInterface => Kind::TsInterface {
                name: Self::nid(a),
                members: self.list_at(b),
            },
            Tag::TsPropSig => Kind::TsPropSig {
                key: Self::nid(a),
                optional: f & flag::OPTIONAL != 0,
            },
            Tag::Ident => Kind::Ident(Atom(a)),
            Tag::Num => Kind::Num(f64::from_bits((a as u64) | ((b as u64) << 32))),
            Tag::Str => Kind::Str,
            Tag::Bool => Kind::Bool(a != 0),
            Tag::Null => Kind::Null,
            Tag::This => Kind::This,
            Tag::Template => Kind::Template {
                quasis: self.list_at(a),
                exprs: self.list_at(b),
            },
            Tag::TemplateElem => Kind::TemplateElem {
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
                args: self.list_at(b),
                optional: f & flag::OPTIONAL != 0,
                pure: f & flag::PURE != 0,
            },
            Tag::New => Kind::New {
                callee: Self::nid(a),
                args: self.list_at(b),
            },
            Tag::Arrow => Kind::Arrow {
                params: self.list_at(a),
                body: Self::nid(b),
                is_async: f & flag::ASYNC != 0,
                expr_body: f & flag::EXPR_BODY != 0,
            },
            Tag::Unary => Kind::Unary(UnaryOp::from_u8(f), Self::nid(a)),
            Tag::Update => Kind::Update {
                op: UpdateOp::from_u8(f & !flag::PREFIX),
                prefix: f & flag::PREFIX != 0,
                arg: Self::nid(a),
            },
            Tag::Binary => Kind::Binary(BinOp::from_u8(f), Self::nid(a), Self::nid(b)),
            Tag::Logical => Kind::Logical(LogicalOp::from_u8(f), Self::nid(a), Self::nid(b)),
            Tag::Cond => Kind::Cond {
                test: self.rec(a, 0),
                cons: self.rec(a, 1),
                alt: self.rec(a, 2),
            },
            Tag::Assign => Kind::Assign(AssignOp::from_u8(f), Self::nid(a), Self::nid(b)),
            Tag::Seq => Kind::Seq(self.list_at(a)),
            Tag::Await => Kind::Await(Self::nid(a)),
            Tag::ObjectPat => Kind::ObjectPat(self.list_at(a)),
            Tag::ArrayPat => Kind::ArrayPat(self.list_at(a)),
            Tag::AssignPat => Kind::AssignPat(Self::nid(a), Self::nid(b)),
            Tag::Rest => Kind::Rest(Self::nid(a)),
            Tag::Hole => Kind::Hole,
        }
    }

    /// Calls `f` on each direct child, in source order.
    pub fn for_each_child(&self, id: NodeId, mut f: impl FnMut(NodeId)) {
        let mut each = |ids: &[NodeId]| {
            ids.iter()
                .copied()
                .filter(|c| !c.is_none())
                .for_each(&mut f)
        };
        match self.kind(id) {
            Kind::Program(l)
            | Kind::Block(l)
            | Kind::Array(l)
            | Kind::Object(l)
            | Kind::Seq(l)
            | Kind::ObjectPat(l)
            | Kind::ArrayPat(l) => each(l),
            Kind::VarDecl { decls, .. } => each(decls),
            Kind::Declarator { id, init } => each(&[id, init.unwrap_or(NodeId::NONE)]),
            Kind::ExprStmt(e)
            | Kind::Spread(e)
            | Kind::Await(e)
            | Kind::Rest(e)
            | Kind::ExportNamed(e)
            | Kind::ExportDefault(e) => each(&[e]),
            Kind::ImportDefault(e) | Kind::ImportNamespace(e) => each(&[e]),
            Kind::Unary(_, e) => each(&[e]),
            Kind::Update { arg, .. } => each(&[arg]),
            Kind::Function {
                name, params, body, ..
            } => {
                each(&[name.unwrap_or(NodeId::NONE)]);
                each(params);
                each(&[body]);
            }
            Kind::Return(e) => each(&[e.unwrap_or(NodeId::NONE)]),
            Kind::If { test, cons, alt } => each(&[test, cons, alt.unwrap_or(NodeId::NONE)]),
            Kind::Import {
                specifiers, source, ..
            } => {
                each(specifiers);
                each(&[source]);
            }
            Kind::ImportNamed { imported, local } => each(&[imported, local]),
            Kind::Template { quasis, exprs } => {
                for (i, q) in quasis.iter().enumerate() {
                    each(&[*q]);
                    if let Some(e) = exprs.get(i) {
                        each(&[*e]);
                    }
                }
            }
            Kind::Property {
                key,
                value,
                shorthand,
                ..
            } => {
                if shorthand {
                    each(&[value])
                } else {
                    each(&[key, value])
                }
            }
            Kind::Member {
                object, property, ..
            } => each(&[object, property]),
            Kind::Call { callee, args, .. } | Kind::New { callee, args } => {
                each(&[callee]);
                each(args);
            }
            Kind::Arrow { params, body, .. } => {
                each(params);
                each(&[body]);
            }
            Kind::Binary(_, l, r)
            | Kind::Logical(_, l, r)
            | Kind::Assign(_, l, r)
            | Kind::AssignPat(l, r) => each(&[l, r]),
            Kind::Cond { test, cons, alt } => each(&[test, cons, alt]),
            // Types are not scope-visible: an interface's names never resolve as values.
            Kind::TsDecl
            | Kind::TsInterface { .. }
            | Kind::TsPropSig { .. }
            | Kind::Ident(_)
            | Kind::Num(_)
            | Kind::Str
            | Kind::Bool(_)
            | Kind::Null
            | Kind::This
            | Kind::TemplateElem { .. }
            | Kind::Empty
            | Kind::Hole => {}
        }
    }

    /// The name of an identifier node.
    pub fn name(&self, id: NodeId) -> &str {
        match self.kind(id) {
            Kind::Ident(a) => self.atoms.get(a),
            k => panic!("not an identifier: {k:?}"),
        }
    }

    pub fn atom(&self, id: NodeId) -> Option<Atom> {
        match self.kind(id) {
            Kind::Ident(a) => Some(a),
            _ => None,
        }
    }

    /// The decoded value of a string literal, or the raw text of a template element.
    pub fn str_value<'s>(&'s self, id: NodeId, src: &'s str) -> &'s str {
        let [a, b] = self.d(id);
        if self.flags(id) & flag::OWNED != 0 {
            &self.strs[a as usize..b as usize]
        } else {
            &src[a as usize..b as usize]
        }
    }

    // ---- builder -------------------------------------------------------------------------------

    #[inline]
    fn push(&mut self, tag: Tag, flags: u8, data: [u32; 2], loc: impl Into<Loc>) -> NodeId {
        let id = NodeId(self.tags.len() as u32);
        self.tags.push(tag);
        self.flags.push(flags);
        self.data.push(data);
        self.locs.push(loc.into());
        id
    }

    fn list(&mut self, items: &[NodeId]) -> u32 {
        let at = self.extra.len() as u32;
        self.extra.push(NodeId(items.len() as u32));
        self.extra.extend_from_slice(items);
        at
    }

    fn record(&mut self, items: &[NodeId]) -> u32 {
        let at = self.extra.len() as u32;
        self.extra.extend_from_slice(items);
        at
    }

    fn own_str(&mut self, s: &str) -> [u32; 2] {
        let start = self.strs.len() as u32;
        self.strs.push_str(s);
        [start, self.strs.len() as u32]
    }

    pub fn program(&mut self, body: &[NodeId], loc: impl Into<Loc>) -> NodeId {
        let l = self.list(body);
        self.push(Tag::Program, 0, [l, 0], loc)
    }

    pub fn var_decl(&mut self, kind: u8, decls: &[NodeId], loc: impl Into<Loc>) -> NodeId {
        let l = self.list(decls);
        self.push(Tag::VarDecl, kind, [l, 0], loc)
    }

    pub fn declarator(&mut self, id: NodeId, init: Option<NodeId>, loc: impl Into<Loc>) -> NodeId {
        self.push(
            Tag::Declarator,
            0,
            [id.0, init.unwrap_or(NodeId::NONE).0],
            loc,
        )
    }

    /// `kind name = init;` with a single declarator.
    pub fn let_(&mut self, kind: u8, id: NodeId, init: Option<NodeId>) -> NodeId {
        let d = self.declarator(id, init, Loc::SYNTHETIC);
        self.var_decl(kind, &[d], Loc::SYNTHETIC)
    }

    pub fn expr_stmt(&mut self, e: NodeId) -> NodeId {
        let loc = self.loc(e);
        self.push(Tag::ExprStmt, 0, [e.0, 0], loc)
    }

    pub fn expr_stmt_at(&mut self, e: NodeId, loc: impl Into<Loc>) -> NodeId {
        self.push(Tag::ExprStmt, 0, [e.0, 0], loc)
    }

    pub fn function(
        &mut self,
        decl: bool,
        name: Option<NodeId>,
        params: &[NodeId],
        body: NodeId,
        is_async: bool,
        loc: impl Into<Loc>,
    ) -> NodeId {
        let p = self.list(params);
        let r = self.record(&[name.unwrap_or(NodeId::NONE), NodeId(p), body]);
        self.push(
            if decl { Tag::FnDecl } else { Tag::FnExpr },
            if is_async { flag::ASYNC } else { 0 },
            [r, 0],
            loc,
        )
    }

    pub fn return_(&mut self, arg: Option<NodeId>, loc: impl Into<Loc>) -> NodeId {
        self.push(Tag::Return, 0, [arg.unwrap_or(NodeId::NONE).0, 0], loc)
    }

    pub fn if_(
        &mut self,
        test: NodeId,
        cons: NodeId,
        alt: Option<NodeId>,
        loc: impl Into<Loc>,
    ) -> NodeId {
        let r = self.record(&[test, cons, alt.unwrap_or(NodeId::NONE)]);
        self.push(Tag::If, 0, [r, 0], loc)
    }

    pub fn block(&mut self, body: &[NodeId], loc: impl Into<Loc>) -> NodeId {
        let l = self.list(body);
        self.push(Tag::Block, 0, [l, 0], loc)
    }

    pub fn empty(&mut self, loc: impl Into<Loc>) -> NodeId {
        self.push(Tag::Empty, 0, [0, 0], loc)
    }

    pub fn import(
        &mut self,
        specifiers: &[NodeId],
        source: NodeId,
        type_only: bool,
        loc: impl Into<Loc>,
    ) -> NodeId {
        let l = self.list(specifiers);
        self.push(
            Tag::Import,
            if type_only { flag::TYPE_ONLY } else { 0 },
            [l, source.0],
            loc,
        )
    }

    pub fn import_default(&mut self, local: NodeId, loc: impl Into<Loc>) -> NodeId {
        self.push(Tag::ImportDefault, 0, [local.0, 0], loc)
    }

    pub fn import_named(
        &mut self,
        imported: NodeId,
        local: NodeId,
        type_only: bool,
        loc: impl Into<Loc>,
    ) -> NodeId {
        self.push(
            Tag::ImportNamed,
            if type_only { flag::TYPE_ONLY } else { 0 },
            [imported.0, local.0],
            loc,
        )
    }

    pub fn import_namespace(&mut self, local: NodeId, loc: impl Into<Loc>) -> NodeId {
        self.push(Tag::ImportNamespace, 0, [local.0, 0], loc)
    }

    pub fn export_named(&mut self, decl: NodeId, loc: impl Into<Loc>) -> NodeId {
        self.push(Tag::ExportNamed, 0, [decl.0, 0], loc)
    }

    pub fn export_default(&mut self, decl: NodeId, loc: impl Into<Loc>) -> NodeId {
        self.push(Tag::ExportDefault, 0, [decl.0, 0], loc)
    }

    pub fn ts_decl(&mut self, loc: impl Into<Loc>) -> NodeId {
        self.push(Tag::TsDecl, 0, [0, 0], loc)
    }

    pub fn ts_interface(
        &mut self,
        name: NodeId,
        members: &[NodeId],
        loc: impl Into<Loc>,
    ) -> NodeId {
        let l = self.list(members);
        self.push(Tag::TsInterface, 0, [name.0, l], loc)
    }

    pub fn ts_prop_sig(&mut self, key: NodeId, optional: bool, loc: impl Into<Loc>) -> NodeId {
        let f = if optional { flag::OPTIONAL } else { 0 };
        self.push(Tag::TsPropSig, f, [key.0, 0], loc)
    }

    pub fn ident_atom(&mut self, atom: Atom, loc: impl Into<Loc>) -> NodeId {
        self.push(Tag::Ident, 0, [atom.0, 0], loc)
    }

    pub fn ident(&mut self, name: &str, loc: impl Into<Loc>) -> NodeId {
        let a = self.atoms.intern(name);
        self.ident_atom(a, loc)
    }

    /// A synthesized identifier.
    pub fn id(&mut self, name: &str) -> NodeId {
        self.ident(name, Loc::SYNTHETIC)
    }

    pub fn num(&mut self, v: f64, loc: impl Into<Loc>) -> NodeId {
        let bits = v.to_bits();
        self.push(Tag::Num, 0, [bits as u32, (bits >> 32) as u32], loc)
    }

    /// A string literal whose value is the source bytes `value` (no escapes in between).
    pub fn str_in_source(&mut self, value: Span, loc: impl Into<Loc>) -> NodeId {
        self.push(Tag::Str, 0, [value.lo, value.hi], loc)
    }

    pub fn str_owned(&mut self, value: &str, loc: impl Into<Loc>) -> NodeId {
        let d = self.own_str(value);
        self.push(Tag::Str, flag::OWNED, d, loc)
    }

    pub fn str(&mut self, value: &str) -> NodeId {
        self.str_owned(value, Loc::SYNTHETIC)
    }

    pub fn bool(&mut self, v: bool, loc: impl Into<Loc>) -> NodeId {
        self.push(Tag::Bool, 0, [v as u32, 0], loc)
    }

    pub fn null(&mut self, loc: impl Into<Loc>) -> NodeId {
        self.push(Tag::Null, 0, [0, 0], loc)
    }

    pub fn this(&mut self, loc: impl Into<Loc>) -> NodeId {
        self.push(Tag::This, 0, [0, 0], loc)
    }

    pub fn template(&mut self, quasis: &[NodeId], exprs: &[NodeId], loc: impl Into<Loc>) -> NodeId {
        debug_assert_eq!(quasis.len(), exprs.len() + 1);
        let q = self.list(quasis);
        let e = self.list(exprs);
        self.push(Tag::Template, 0, [q, e], loc)
    }

    /// A template element whose raw text is the source bytes `raw`.
    pub fn template_elem_in_source(
        &mut self,
        raw: Span,
        tail: bool,
        loc: impl Into<Loc>,
    ) -> NodeId {
        self.push(
            Tag::TemplateElem,
            if tail { flag::TAIL } else { 0 },
            [raw.lo, raw.hi],
            loc,
        )
    }

    /// A template element with synthesized raw text (already escaped for a template literal).
    pub fn template_elem(&mut self, raw: &str, tail: bool) -> NodeId {
        let d = self.own_str(raw);
        self.push(
            Tag::TemplateElem,
            flag::OWNED | if tail { flag::TAIL } else { 0 },
            d,
            Loc::SYNTHETIC,
        )
    }

    pub fn array(&mut self, items: &[NodeId], loc: impl Into<Loc>) -> NodeId {
        let l = self.list(items);
        self.push(Tag::Array, 0, [l, 0], loc)
    }

    pub fn object(&mut self, props: &[NodeId], loc: impl Into<Loc>) -> NodeId {
        let l = self.list(props);
        self.push(Tag::Object, 0, [l, 0], loc)
    }

    pub fn property(
        &mut self,
        key: NodeId,
        value: NodeId,
        flags: u8,
        loc: impl Into<Loc>,
    ) -> NodeId {
        self.push(Tag::Property, flags, [key.0, value.0], loc)
    }

    pub fn spread(&mut self, arg: NodeId, loc: impl Into<Loc>) -> NodeId {
        self.push(Tag::Spread, 0, [arg.0, 0], loc)
    }

    pub fn member(
        &mut self,
        object: NodeId,
        property: NodeId,
        computed: bool,
        optional: bool,
        loc: impl Into<Loc>,
    ) -> NodeId {
        let f =
            if computed { flag::COMPUTED } else { 0 } | if optional { flag::OPTIONAL } else { 0 };
        self.push(Tag::Member, f, [object.0, property.0], loc)
    }

    /// `object.name`, synthesized.
    pub fn dot(&mut self, object: NodeId, name: &str) -> NodeId {
        let p = self.id(name);
        self.member(object, p, false, false, Loc::SYNTHETIC)
    }

    pub fn call(
        &mut self,
        callee: NodeId,
        args: &[NodeId],
        optional: bool,
        loc: impl Into<Loc>,
    ) -> NodeId {
        let l = self.list(args);
        self.push(
            Tag::Call,
            if optional { flag::OPTIONAL } else { 0 },
            [callee.0, l],
            loc,
        )
    }

    /// `callee(args)`, synthesized.
    pub fn call0(&mut self, callee: NodeId, args: &[NodeId]) -> NodeId {
        self.call(callee, args, false, Loc::SYNTHETIC)
    }

    /// `$.name(args)` — the shape of nearly every runtime call a lowering emits.
    pub fn runtime(&mut self, ns: &str, name: &str, args: &[NodeId]) -> NodeId {
        let n = self.id(ns);
        let callee = self.dot(n, name);
        self.call0(callee, args)
    }

    pub fn mark_pure(&mut self, call: NodeId) {
        self.flags[call.idx()] |= flag::PURE;
    }

    pub fn new_(&mut self, callee: NodeId, args: &[NodeId], loc: impl Into<Loc>) -> NodeId {
        let l = self.list(args);
        self.push(Tag::New, 0, [callee.0, l], loc)
    }

    pub fn arrow(
        &mut self,
        params: &[NodeId],
        body: NodeId,
        expr_body: bool,
        is_async: bool,
        loc: impl Into<Loc>,
    ) -> NodeId {
        let l = self.list(params);
        let f =
            if expr_body { flag::EXPR_BODY } else { 0 } | if is_async { flag::ASYNC } else { 0 };
        self.push(Tag::Arrow, f, [l, body.0], loc)
    }

    pub fn unary(&mut self, op: UnaryOp, arg: NodeId, loc: impl Into<Loc>) -> NodeId {
        self.push(Tag::Unary, op as u8, [arg.0, 0], loc)
    }

    pub fn update(
        &mut self,
        op: UpdateOp,
        prefix: bool,
        arg: NodeId,
        loc: impl Into<Loc>,
    ) -> NodeId {
        self.push(
            Tag::Update,
            op as u8 | if prefix { flag::PREFIX } else { 0 },
            [arg.0, 0],
            loc,
        )
    }

    pub fn binary(&mut self, op: BinOp, l: NodeId, r: NodeId, loc: impl Into<Loc>) -> NodeId {
        self.push(Tag::Binary, op as u8, [l.0, r.0], loc)
    }

    pub fn logical(&mut self, op: LogicalOp, l: NodeId, r: NodeId, loc: impl Into<Loc>) -> NodeId {
        self.push(Tag::Logical, op as u8, [l.0, r.0], loc)
    }

    pub fn cond(&mut self, test: NodeId, cons: NodeId, alt: NodeId, loc: impl Into<Loc>) -> NodeId {
        let r = self.record(&[test, cons, alt]);
        self.push(Tag::Cond, 0, [r, 0], loc)
    }

    pub fn assign(
        &mut self,
        op: AssignOp,
        target: NodeId,
        value: NodeId,
        loc: impl Into<Loc>,
    ) -> NodeId {
        self.push(Tag::Assign, op as u8, [target.0, value.0], loc)
    }

    pub fn seq(&mut self, items: &[NodeId], loc: impl Into<Loc>) -> NodeId {
        let l = self.list(items);
        self.push(Tag::Seq, 0, [l, 0], loc)
    }

    pub fn await_(&mut self, arg: NodeId, loc: impl Into<Loc>) -> NodeId {
        self.push(Tag::Await, 0, [arg.0, 0], loc)
    }

    pub fn object_pat(&mut self, props: &[NodeId], loc: impl Into<Loc>) -> NodeId {
        let l = self.list(props);
        self.push(Tag::ObjectPat, 0, [l, 0], loc)
    }

    pub fn array_pat(&mut self, items: &[NodeId], loc: impl Into<Loc>) -> NodeId {
        let l = self.list(items);
        self.push(Tag::ArrayPat, 0, [l, 0], loc)
    }

    pub fn assign_pat(&mut self, left: NodeId, right: NodeId, loc: impl Into<Loc>) -> NodeId {
        self.push(Tag::AssignPat, 0, [left.0, right.0], loc)
    }

    pub fn rest(&mut self, arg: NodeId, loc: impl Into<Loc>) -> NodeId {
        self.push(Tag::Rest, 0, [arg.0, 0], loc)
    }

    pub fn hole(&mut self, loc: impl Into<Loc>) -> NodeId {
        self.push(Tag::Hole, 0, [0, 0], loc)
    }
}

// Layout guard: a node row stays 18 bytes across the five columns.
const _: () =
    assert!(size_of::<Tag>() + size_of::<u8>() + size_of::<[u32; 2]>() + size_of::<Span>() == 18);
const _: () = assert!(size_of::<NodeId>() == 4);
