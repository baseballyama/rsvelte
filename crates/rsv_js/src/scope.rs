//! Scope analysis: declarations, scopes and resolved references.
//!
//! Two passes over the tree: the first creates scopes and declares bindings (so hoisting and
//! use-before-declaration resolve correctly), the second resolves every identifier in a reference
//! position. Extra roots (a component's template expressions) are analyzed as if they were nested
//! in the program's top-level scope, which is what makes script-and-template facts ("is this
//! variable used anywhere?") one query instead of two analyses.

use crate::ast::{Ast, Kind, NodeId, Tag, flag};
use crate::ops::AssignOp;
use rsv_kernel::intern::Atom;
use rustc_hash::FxHashMap;

pub type BindingId = u32;
pub type ScopeId = u32;
pub const NONE: u32 = u32::MAX;

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum DeclKind {
    Var,
    Let,
    Const,
    Function,
    Param,
    Import,
}

#[derive(Clone, Debug)]
pub struct Binding {
    pub name: Atom,
    pub kind: DeclKind,
    /// The declaring identifier.
    pub node: NodeId,
    pub scope: ScopeId,
    /// The declarator (`let x = …`) or import specifier the binding came from, if any.
    pub decl: Option<NodeId>,
    pub reads: u32,
    /// Assignments and updates after declaration.
    pub writes: u32,
    /// Assignments and updates through a member (`x.y = 1`, `x[i]++`).
    pub mutations: u32,
}

impl Binding {
    /// The initialiser of the declarator the binding came from (`init` in `let x = init`).
    pub fn init(&self, ast: &Ast) -> Option<NodeId> {
        match ast.kind(self.decl?) {
            Kind::Declarator { init, .. } => init,
            _ => None,
        }
    }
}

#[derive(Clone, Copy, Debug)]
pub struct Scope {
    pub parent: ScopeId,
    pub function: bool,
}

#[derive(Clone, Copy, Debug)]
pub struct Reference {
    pub node: NodeId,
    /// `NONE` for a global / unresolved name.
    pub binding: BindingId,
    pub read: bool,
    pub write: bool,
}

pub struct Semantic {
    pub scopes: Vec<Scope>,
    pub bindings: Vec<Binding>,
    pub references: Vec<Reference>,
    /// Per node: the binding an identifier declares or refers to (`NONE` otherwise).
    pub node_binding: Vec<u32>,
    node_scope: FxHashMap<NodeId, ScopeId>,
    names: FxHashMap<(ScopeId, Atom), BindingId>,
}

impl Semantic {
    pub fn binding_of(&self, ident: NodeId) -> Option<BindingId> {
        self.node_binding
            .get(ident.idx())
            .copied()
            .filter(|&b| b != NONE)
    }

    /// The top-level binding named `name`, if any.
    pub fn root_binding(&self, name: Atom) -> Option<BindingId> {
        self.names.get(&(0, name)).copied()
    }

    pub fn references_to(&self, b: BindingId) -> impl Iterator<Item = &Reference> {
        self.references.iter().filter(move |r| r.binding == b)
    }
}

#[derive(Clone, Copy)]
enum Ctx {
    Expr,
    /// A binding pattern: identifiers declare, defaults and computed keys are expressions.
    Pattern,
    /// An assignment target; `read` for compound operators.
    Target {
        read: bool,
    },
}

struct Analyzer<'a> {
    ast: &'a Ast,
    s: Semantic,
    stack: Vec<ScopeId>,
    /// The declarator/specifier being declared in pass 1.
    current_decl: Option<NodeId>,
}

pub fn analyze(ast: &Ast, program: NodeId, extra_roots: &[NodeId]) -> Semantic {
    let mut a = Analyzer {
        ast,
        s: Semantic {
            scopes: vec![Scope {
                parent: NONE,
                function: true,
            }],
            bindings: Vec::new(),
            references: Vec::new(),
            node_binding: vec![NONE; ast.len()],
            node_scope: FxHashMap::default(),
            names: FxHashMap::default(),
        },
        stack: vec![0],
        current_decl: None,
    };
    a.s.node_scope.insert(program, 0);
    a.declare_children(program);
    for &r in extra_roots {
        a.declare(r);
    }
    a.resolve_children(program);
    for &r in extra_roots {
        a.resolve(r, Ctx::Expr);
    }
    a.s
}

impl Analyzer<'_> {
    fn cur(&self) -> ScopeId {
        *self.stack.last().unwrap()
    }

    fn function_scope(&self) -> ScopeId {
        let mut s = self.cur();
        while !self.s.scopes[s as usize].function {
            s = self.s.scopes[s as usize].parent;
        }
        s
    }

    fn push_scope(&mut self, node: NodeId, function: bool) -> ScopeId {
        let id = self.s.scopes.len() as ScopeId;
        self.s.scopes.push(Scope {
            parent: self.cur(),
            function,
        });
        self.s.node_scope.insert(node, id);
        self.stack.push(id);
        id
    }

    fn add_binding(&mut self, ident: NodeId, kind: DeclKind, scope: ScopeId) {
        let Some(name) = self.ast.atom(ident) else {
            return;
        };
        let id = *self.s.names.entry((scope, name)).or_insert_with(|| {
            self.s.bindings.push(Binding {
                name,
                kind,
                node: ident,
                scope,
                decl: self.current_decl,
                reads: 0,
                writes: 0,
                mutations: 0,
            });
            self.s.bindings.len() as BindingId - 1
        });
        self.s.node_binding[ident.idx()] = id;
    }

    // ---- pass 1 --------------------------------------------------------------------------------

    fn declare_children(&mut self, id: NodeId) {
        let mut kids = Vec::new();
        self.ast.for_each_child(id, |c| kids.push(c));
        for c in kids {
            self.declare(c);
        }
    }

    fn declare(&mut self, id: NodeId) {
        match self.ast.kind(id) {
            Kind::VarDecl { kind, decls } => {
                let dk = match kind {
                    flag::LET => DeclKind::Let,
                    flag::CONST => DeclKind::Const,
                    _ => DeclKind::Var,
                };
                for &d in decls {
                    if let Kind::Declarator { id: target, init } = self.ast.kind(d) {
                        self.current_decl = Some(d);
                        self.declare_pattern(target, dk);
                        self.current_decl = None;
                        if let Some(i) = init {
                            self.declare(i);
                        }
                    }
                }
            }
            Kind::Function {
                name,
                params,
                body,
                decl,
                ..
            } => {
                if let (Some(n), true) = (name, decl) {
                    let s = self.cur();
                    self.add_binding(n, DeclKind::Function, s);
                }
                self.push_scope(id, true);
                if let (Some(n), false) = (name, decl) {
                    let s = self.cur();
                    self.add_binding(n, DeclKind::Function, s);
                }
                for &p in params {
                    self.declare_pattern(p, DeclKind::Param);
                }
                self.declare_body(body);
                self.stack.pop();
            }
            Kind::Arrow {
                params,
                body,
                expr_body,
                ..
            } => {
                self.push_scope(id, true);
                for &p in params {
                    self.declare_pattern(p, DeclKind::Param);
                }
                if expr_body {
                    self.declare(body)
                } else {
                    self.declare_body(body)
                }
                self.stack.pop();
            }
            Kind::Block(_) => {
                self.push_scope(id, false);
                self.declare_children(id);
                self.stack.pop();
            }
            Kind::Import { specifiers, .. } => {
                for &sp in specifiers {
                    self.current_decl = Some(sp);
                    let local = match self.ast.kind(sp) {
                        Kind::ImportDefault(l) | Kind::ImportNamespace(l) => l,
                        Kind::ImportNamed { local, .. } => local,
                        _ => continue,
                    };
                    self.add_binding(local, DeclKind::Import, 0);
                }
                self.current_decl = None;
            }
            _ => self.declare_children(id),
        }
    }

    /// A function body block shares the function's scope.
    fn declare_body(&mut self, body: NodeId) {
        self.s.node_scope.insert(body, self.cur());
        self.declare_children(body);
    }

    fn declare_pattern(&mut self, p: NodeId, kind: DeclKind) {
        match self.ast.kind(p) {
            Kind::Ident(_) => {
                let scope = if kind == DeclKind::Var {
                    self.function_scope()
                } else {
                    self.cur()
                };
                self.add_binding(p, kind, scope);
            }
            Kind::ObjectPat(props) => {
                for &pr in props {
                    match self.ast.kind(pr) {
                        Kind::Property {
                            key,
                            value,
                            computed,
                            ..
                        } => {
                            if computed {
                                self.declare(key);
                            }
                            self.declare_pattern(value, kind);
                        }
                        Kind::Rest(a) => self.declare_pattern(a, kind),
                        _ => {}
                    }
                }
            }
            Kind::ArrayPat(items) => {
                for &it in items {
                    self.declare_pattern(it, kind);
                }
            }
            Kind::AssignPat(l, r) => {
                self.declare_pattern(l, kind);
                self.declare(r);
            }
            Kind::Rest(a) => self.declare_pattern(a, kind),
            _ => {}
        }
    }

    // ---- pass 2 --------------------------------------------------------------------------------

    fn lookup(&self, name: Atom) -> BindingId {
        let mut s = self.cur();
        while s != NONE {
            if let Some(&b) = self.s.names.get(&(s, name)) {
                return b;
            }
            s = self.s.scopes[s as usize].parent;
        }
        NONE
    }

    fn reference(&mut self, ident: NodeId, read: bool, write: bool) {
        let Some(name) = self.ast.atom(ident) else {
            return;
        };
        let b = self.lookup(name);
        if b != NONE {
            self.s.node_binding[ident.idx()] = b;
            let binding = &mut self.s.bindings[b as usize];
            binding.reads += read as u32;
            binding.writes += write as u32;
        }
        self.s.references.push(Reference {
            node: ident,
            binding: b,
            read,
            write,
        });
    }

    fn resolve_children(&mut self, id: NodeId) {
        let mut kids = Vec::new();
        self.ast.for_each_child(id, |c| kids.push(c));
        for c in kids {
            self.resolve(c, Ctx::Expr);
        }
    }

    fn enter(&mut self, id: NodeId) -> bool {
        match self.s.node_scope.get(&id) {
            Some(&s) if s != self.cur() => {
                self.stack.push(s);
                true
            }
            _ => false,
        }
    }

    fn resolve(&mut self, id: NodeId, ctx: Ctx) {
        match (self.ast.kind(id), ctx) {
            (Kind::Ident(_), Ctx::Pattern) => {}
            (Kind::Ident(_), Ctx::Target { read }) => self.reference(id, read, true),
            (Kind::Ident(_), Ctx::Expr) => self.reference(id, true, false),
            (Kind::ObjectPat(props), _) => {
                for &pr in props {
                    match self.ast.kind(pr) {
                        Kind::Property {
                            key,
                            value,
                            computed,
                            ..
                        } => {
                            if computed {
                                self.resolve(key, Ctx::Expr);
                            }
                            self.resolve(value, ctx);
                        }
                        Kind::Rest(a) => self.resolve(a, ctx),
                        _ => {}
                    }
                }
            }
            (Kind::ArrayPat(items), _) => {
                for &it in items {
                    self.resolve(it, ctx);
                }
            }
            (Kind::AssignPat(l, r), _) => {
                self.resolve(l, ctx);
                self.resolve(r, Ctx::Expr);
            }
            (Kind::Rest(a), _) => self.resolve(a, ctx),
            (Kind::Declarator { id: target, init }, _) => {
                self.resolve(target, Ctx::Pattern);
                if let Some(i) = init {
                    self.resolve(i, Ctx::Expr);
                }
            }
            (Kind::Function { params, body, .. }, _) => {
                let entered = self.enter(id);
                for &p in params {
                    self.resolve(p, Ctx::Pattern);
                }
                self.resolve_children(body);
                if entered {
                    self.stack.pop();
                }
            }
            (
                Kind::Arrow {
                    params,
                    body,
                    expr_body,
                    ..
                },
                _,
            ) => {
                let entered = self.enter(id);
                for &p in params {
                    self.resolve(p, Ctx::Pattern);
                }
                if expr_body {
                    self.resolve(body, Ctx::Expr)
                } else {
                    self.resolve_children(body)
                }
                if entered {
                    self.stack.pop();
                }
            }
            (Kind::Block(_), _) => {
                let entered = self.enter(id);
                self.resolve_children(id);
                if entered {
                    self.stack.pop();
                }
            }
            (Kind::Import { .. }, _) => {}
            (
                Kind::Member {
                    object,
                    property,
                    computed,
                    ..
                },
                _,
            ) => {
                self.resolve(object, Ctx::Expr);
                if computed {
                    self.resolve(property, Ctx::Expr);
                }
                if let Ctx::Target { .. } = ctx {
                    let mut root = object;
                    while let Kind::Member { object, .. } = self.ast.kind(root) {
                        root = object;
                    }
                    if let Some(b) = self.s.binding_of(root) {
                        self.s.bindings[b as usize].mutations += 1;
                    }
                }
            }
            (
                Kind::Property {
                    key,
                    value,
                    computed,
                    shorthand,
                    ..
                },
                _,
            ) => {
                if computed && !shorthand {
                    self.resolve(key, Ctx::Expr);
                }
                self.resolve(value, Ctx::Expr);
            }
            (Kind::Assign(op, target, value), _) => {
                self.resolve(
                    target,
                    Ctx::Target {
                        read: op != AssignOp::Assign,
                    },
                );
                self.resolve(value, Ctx::Expr);
            }
            (Kind::Update { arg, .. }, _) => self.resolve(arg, Ctx::Target { read: true }),
            _ => {
                if self.ast.tag(id) == Tag::TsDecl {
                    return;
                }
                self.resolve_children(id);
            }
        }
    }
}
