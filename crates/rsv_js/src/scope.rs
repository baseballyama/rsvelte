//! Scope analysis: declarations, scopes and resolved references.
//!
//! Two passes over the tree: the first creates scopes and declares bindings (so hoisting and
//! use-before-declaration resolve correctly), the second resolves every identifier in a reference
//! position. What a host language adds ([`HostRoot`]: a component's template expressions, and the
//! scopes its own syntax opens, like Vue's `v-for`) is analyzed as if it were nested in the
//! program's top-level scope, which is what makes script-and-template facts ("is this variable used
//! anywhere?") one query instead of two analyses.

use rsv_kernel::idx::{Idx, IndexVec};
use rsv_kernel::intern::Atom;
use rsv_kernel::newtype_index;
use rsv_kernel::source::Span;
use rustc_hash::FxHashMap;

use crate::ast::{Ast, Kind, NodeId, flag};
use crate::ops::AssignOp;

newtype_index!(
    pub struct BindingId;
);
newtype_index!(
    pub struct ScopeId;
    /// The program's scope; also where imports and a component's template names live.
    const ROOT = 0;
);

const NO_BINDING: u32 = u32::MAX;

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum DeclKind {
    Var,
    Let,
    Const,
    Function,
    Param,
    Import,
    /// Declared by the host language's syntax (`v-for="(item, i) in list"`), in a [`HostScope`].
    Host,
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
    #[must_use]
    pub fn init(&self, ast: &Ast) -> Option<NodeId> {
        match ast.kind(self.decl?) {
            Kind::Declarator { init, .. } => init,
            _ => None,
        }
    }
}

#[derive(Clone, Copy, Debug)]
pub struct Scope {
    /// `None` for [`ScopeId::ROOT`].
    pub parent: Option<ScopeId>,
    pub function: bool,
    /// The node that opens the scope (program, function, arrow or block).
    pub node: NodeId,
}

#[derive(Clone, Copy, Debug)]
pub struct Reference {
    pub node: NodeId,
    /// `None` for a global / unresolved name.
    pub binding: Option<BindingId>,
    pub read: bool,
    pub write: bool,
    /// The write a declarator's initialiser or a default value makes (`let x = 1`, `(x = 1) =>
    /// …`). Not counted in [`Binding::writes`], which are the writes after declaration.
    pub init: bool,
    /// The scope the reference occurs in.
    pub scope: ScopeId,
}

/// What a host language evaluates in the program's scope, in document order.
#[derive(Clone, Debug)]
pub enum HostRoot {
    /// An expression evaluated in the enclosing scope.
    Expr(NodeId),
    Scope(HostScope),
}

/// A scope the host's syntax opens: `params` are declared in it ([`DeclKind::Host`]) and `body` is
/// evaluated inside it.
#[derive(Clone, Debug)]
pub struct HostScope {
    /// The node that stands for the scope in [`Scope::node`]; must not open a JavaScript scope.
    pub node: NodeId,
    pub params: Vec<NodeId>,
    pub body: Vec<HostRoot>,
}

#[derive(Debug)]
pub struct Semantic {
    pub scopes: IndexVec<ScopeId, Scope>,
    pub bindings: IndexVec<BindingId, Binding>,
    pub references: Vec<Reference>,
    /// Per node: the binding an identifier declares or refers to (`NO_BINDING` otherwise). Raw
    /// `u32`s rather than `Option<BindingId>` because it has one slot per node of the whole tree.
    node_binding: Vec<u32>,
    node_scope: FxHashMap<NodeId, ScopeId>,
    names: FxHashMap<(ScopeId, Atom), BindingId>,
    /// Indices into `references`, grouped by binding: binding `b` owns
    /// `by_binding[by_binding_start[b]..by_binding_start[b + 1]]`, in source order.
    by_binding: Vec<u32>,
    by_binding_start: Vec<u32>,
    /// Per binding: named in type syntax ([`crate::ast::Ast::type_refs`]). typescript-eslint's
    /// scope analysis counts such a name as a read; the compiler's read counts do not.
    type_referenced: Vec<bool>,
}

impl Semantic {
    #[must_use]
    pub fn binding_of(&self, ident: NodeId) -> Option<BindingId> {
        self.node_binding
            .get(ident.idx())
            .copied()
            .filter(|&b| b != NO_BINDING)
            .map(|b| BindingId::new(b as usize))
    }

    /// Whether type syntax names `b` (`x: B`, `Map<K, B>`, `typeof b`).
    #[must_use]
    pub fn is_type_referenced(&self, b: BindingId) -> bool {
        self.type_referenced[b.index()]
    }

    /// The top-level binding named `name`, if any.
    #[must_use]
    pub fn root_binding(&self, name: Atom) -> Option<BindingId> {
        self.names.get(&(ScopeId::ROOT, name)).copied()
    }

    pub fn references_to(&self, b: BindingId) -> impl Iterator<Item = &Reference> {
        let (lo, hi) = (
            self.by_binding_start[b.index()] as usize,
            self.by_binding_start[b.index() + 1] as usize,
        );
        self.by_binding[lo..hi]
            .iter()
            .map(|&i| &self.references[i as usize])
    }

    /// The nearest enclosing function scope (`ESLint`'s `variableScope`); the program counts as
    /// one.
    ///
    /// # Panics
    ///
    /// Never: the root scope is a function scope, so the walk stops there.
    #[must_use]
    pub fn variable_scope(&self, mut s: ScopeId) -> ScopeId {
        while !self.scopes[s].function {
            s = self.scopes[s]
                .parent
                .expect("the root scope is a function scope");
        }
        s
    }

    fn index_references(&mut self) {
        let mut start = vec![0u32; self.bindings.len() + 1];
        for r in &self.references {
            if let Some(b) = r.binding {
                start[b.index() + 1] += 1;
            }
        }
        for i in 1..start.len() {
            start[i] += start[i - 1];
        }
        let mut fill = start.clone();
        let mut by_binding = vec![0u32; start[self.bindings.len()] as usize];
        for (i, r) in self.references.iter().enumerate() {
            if let Some(b) = r.binding {
                by_binding[fill[b.index()] as usize] = i as u32;
                fill[b.index()] += 1;
            }
        }
        self.by_binding = by_binding;
        self.by_binding_start = start;
    }
}

#[derive(Clone, Copy)]
enum Ctx {
    Expr,
    /// A binding pattern: identifiers declare, defaults and computed keys are expressions.
    /// `init` when the identifiers are also written (an initialised declarator, a default value).
    Pattern {
        init: bool,
    },
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
    /// Host scopes in the order pass 1 created them; pass 2 walks the roots in the same order.
    host_scopes: Vec<ScopeId>,
    next_host_scope: usize,
}

#[must_use]
pub fn analyze(ast: &Ast, program: NodeId, host: &[HostRoot]) -> Semantic {
    let mut a = Analyzer {
        ast,
        s: Semantic {
            scopes: IndexVec::from(vec![Scope {
                parent: None,
                function: true,
                node: program,
            }]),
            bindings: IndexVec::new(),
            references: Vec::new(),
            node_binding: vec![NO_BINDING; ast.len()],
            node_scope: FxHashMap::default(),
            names: FxHashMap::default(),
            by_binding: Vec::new(),
            by_binding_start: Vec::new(),
            type_referenced: Vec::new(),
        },
        stack: vec![ScopeId::ROOT],
        current_decl: None,
        host_scopes: Vec::new(),
        next_host_scope: 0,
    };
    a.s.node_scope.insert(program, ScopeId::ROOT);
    a.declare_children(program);
    a.declare_host(host);
    a.resolve_children(program);
    a.resolve_host(host);
    a.resolve_type_refs();
    a.s.index_references();
    a.s
}

impl Analyzer<'_> {
    fn cur(&self) -> ScopeId {
        *self
            .stack
            .last()
            .expect("the scope stack always holds the root")
    }

    fn function_scope(&self) -> ScopeId {
        self.s.variable_scope(self.cur())
    }

    fn push_scope(&mut self, node: NodeId, function: bool) -> ScopeId {
        let id = self.s.scopes.push(Scope {
            parent: Some(self.cur()),
            function,
            node,
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
            })
        });
        self.s.node_binding[ident.idx()] = id.index() as u32;
    }

    // ---- pass 1 --------------------------------------------------------------------------------

    fn declare_host(&mut self, roots: &[HostRoot]) {
        for r in roots {
            match r {
                HostRoot::Expr(e) => self.declare(*e),
                HostRoot::Scope(h) => {
                    let id = self.push_scope(h.node, false);
                    self.host_scopes.push(id);
                    for &p in &h.params {
                        self.declare_pattern(p, DeclKind::Host);
                    }
                    self.declare_host(&h.body);
                    self.stack.pop();
                }
            }
        }
    }

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
                    self.declare(body);
                } else {
                    self.declare_body(body);
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
                    self.add_binding(local, DeclKind::Import, ScopeId::ROOT);
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

    fn lookup(&self, name: Atom) -> Option<BindingId> {
        self.lookup_from(self.cur(), name)
    }

    fn lookup_from(&self, scope: ScopeId, name: Atom) -> Option<BindingId> {
        let mut s = Some(scope);
        while let Some(scope) = s {
            if let Some(&b) = self.s.names.get(&(scope, name)) {
                return Some(b);
            }
            s = self.s.scopes[scope].parent;
        }
        None
    }

    /// Looks each type-syntax identifier up from the innermost scope whose node contains it; one
    /// outside every scope node (a template expression's cast) is looked up from the root.
    fn resolve_type_refs(&mut self) {
        let ranges: Vec<(ScopeId, Span)> = self
            .s
            .scopes
            .iter_enumerated()
            .filter_map(|(id, s)| self.ast.loc(s.node).span().map(|sp| (id, sp)))
            .collect();
        let mut used = vec![false; self.s.bindings.len()];
        for r in &self.ast.type_refs {
            let scope = ranges
                .iter()
                .filter(|(_, sp)| sp.lo <= r.span.lo && r.span.hi <= sp.hi)
                .min_by_key(|(_, sp)| sp.hi - sp.lo)
                .map_or(ScopeId::ROOT, |&(id, _)| id);
            if let Some(b) = self.lookup_from(scope, r.name) {
                used[b.index()] = true;
            }
        }
        self.s.type_referenced = used;
    }

    fn reference(&mut self, ident: NodeId, read: bool, write: bool) {
        let Some(name) = self.ast.atom(ident) else {
            return;
        };
        let b = self.lookup(name);
        if let Some(b) = b {
            self.s.node_binding[ident.idx()] = b.index() as u32;
            let binding = &mut self.s.bindings[b];
            binding.reads += u32::from(read);
            binding.writes += u32::from(write);
        }
        let scope = self.cur();
        self.s.references.push(Reference {
            node: ident,
            binding: b,
            read,
            write,
            init: false,
            scope,
        });
    }

    fn init_reference(&mut self, ident: NodeId) {
        let b = self.s.binding_of(ident);
        let scope = self.cur();
        self.s.references.push(Reference {
            node: ident,
            binding: b,
            read: false,
            write: true,
            init: true,
            scope,
        });
    }

    fn resolve_host(&mut self, roots: &[HostRoot]) {
        for r in roots {
            match r {
                HostRoot::Expr(e) => self.resolve(*e, Ctx::Expr),
                HostRoot::Scope(h) => {
                    let id = self.host_scopes[self.next_host_scope];
                    self.next_host_scope += 1;
                    self.stack.push(id);
                    for &p in &h.params {
                        self.resolve(p, Ctx::Pattern { init: false });
                    }
                    self.resolve_host(&h.body);
                    self.stack.pop();
                }
            }
        }
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

    #[expect(clippy::too_many_lines, reason = "one arm per node kind and context")]
    fn resolve(&mut self, id: NodeId, ctx: Ctx) {
        match (self.ast.kind(id), ctx) {
            (Kind::Ident(_), Ctx::Pattern { init }) => {
                if init {
                    self.init_reference(id);
                }
            }
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
                let left = match ctx {
                    Ctx::Pattern { .. } => Ctx::Pattern { init: true },
                    other => other,
                };
                self.resolve(l, left);
                self.resolve(r, Ctx::Expr);
            }
            (Kind::Rest(a), _) => self.resolve(a, ctx),
            (Kind::Declarator { id: target, init }, _) => {
                self.resolve(
                    target,
                    Ctx::Pattern {
                        init: init.is_some(),
                    },
                );
                if let Some(i) = init {
                    self.resolve(i, Ctx::Expr);
                }
            }
            (Kind::Function { params, body, .. }, _) => {
                let entered = self.enter(id);
                for &p in params {
                    self.resolve(p, Ctx::Pattern { init: false });
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
                    self.resolve(p, Ctx::Pattern { init: false });
                }
                if expr_body {
                    self.resolve(body, Ctx::Expr);
                } else {
                    self.resolve_children(body);
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
                        self.s.bindings[b].mutations += 1;
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
                self.resolve_children(id);
            }
        }
    }
}
