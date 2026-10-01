//! Scope analysis: declarations, scopes and resolved references.
//!
//! Two passes over the tree: the first creates scopes and declares bindings (so hoisting and
//! use-before-declaration resolve correctly), the second resolves every identifier in a reference
//! position. What a host language adds ([`HostRoot`]: a component's template expressions, and the
//! scopes its own syntax opens, like Vue's `v-for`) is analyzed as if it were nested in the
//! program's top-level scope, which is what makes script-and-template facts ("is this variable used
//! anywhere?") one query instead of two analyses.

use rsvelte_kernel::newtype_index;
use rsvelte_kernel::source::index::{IndexVector, TypedIndex};
use rsvelte_kernel::source::interning::Atom;
use rsvelte_kernel::source::positions::Span;
use rustc_hash::FxHashMap;

use crate::operators::AssignmentOperator;
use crate::syntax_tree::{Kind, NodeIdentifier, SyntaxTree, flag};

newtype_index!(
    pub struct BindingIdentifier;
);
newtype_index!(
    pub struct ScopeIdentifier;
    /// The program's scope; also where imports and a component's template names live.
    const ROOT = 0;
);

const NO_BINDING: u32 = u32::MAX;

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum DeclarationKind {
    Variable,
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
    pub kind: DeclarationKind,
    /// The declaring identifier.
    pub node: NodeIdentifier,
    pub scope: ScopeIdentifier,
    /// The declarator (`let x = …`) or import specifier the binding came from, if any.
    pub declaration: Option<NodeIdentifier>,
    pub reads: u32,
    /// Assignments and updates after declaration.
    pub writes: u32,
    /// Assignments and updates through a member (`x.y = 1`, `x[i]++`).
    pub mutations: u32,
}

impl Binding {
    /// The initialiser of the declarator the binding came from (`initializer` in `let x =
    /// initializer`).
    #[must_use]
    pub fn initializer(&self, syntax_tree: &SyntaxTree) -> Option<NodeIdentifier> {
        match syntax_tree.kind(self.declaration?) {
            Kind::Declarator { initializer, .. } => initializer,
            _ => None,
        }
    }
}

#[derive(Clone, Copy, Debug)]
pub struct Scope {
    /// `None` for [`ScopeIdentifier::ROOT`].
    pub parent: Option<ScopeIdentifier>,
    pub function: bool,
    /// The node that opens the scope (program, function, arrow or block).
    pub node: NodeIdentifier,
}

#[derive(Clone, Copy, Debug)]
pub struct Reference {
    pub node: NodeIdentifier,
    /// `None` for a global / unresolved name.
    pub binding: Option<BindingIdentifier>,
    pub read: bool,
    pub write: bool,
    /// The write a declarator's initialiser or a default value makes (`let x = 1`, `(x = 1) =>
    /// …`). Not counted in [`Binding::writes`], which are the writes after declaration.
    pub initializer: bool,
    /// The scope the reference occurs in.
    pub scope: ScopeIdentifier,
}

/// What a host language evaluates in the program's scope, in document order.
#[derive(Clone, Debug)]
pub enum HostRoot {
    /// An expression evaluated in the enclosing scope.
    Expression(NodeIdentifier),
    /// An expression the host's syntax reads and also assigns (Svelte's `bind:value={x}`).
    Bound(NodeIdentifier),
    Scope(HostScope),
}

/// A scope the host's syntax opens: `parameters` are declared in it ([`DeclarationKind::Host`]) and
/// `body` is evaluated inside it.
#[derive(Clone, Debug)]
pub struct HostScope {
    /// The node that stands for the scope in [`Scope::node`]; must not open a JavaScript scope.
    pub node: NodeIdentifier,
    pub parameters: Vec<NodeIdentifier>,
    pub body: Vec<HostRoot>,
}

#[derive(Debug)]
pub struct Semantic {
    pub scopes: IndexVector<ScopeIdentifier, Scope>,
    pub bindings: IndexVector<BindingIdentifier, Binding>,
    pub references: Vec<Reference>,
    /// Per node: the binding an identifier declares or refers to (`NO_BINDING` otherwise). Raw
    /// `u32`s rather than `Option<BindingIdentifier>` because it has one slot per node of the
    /// whole tree.
    node_binding: Vec<u32>,
    node_scope: FxHashMap<NodeIdentifier, ScopeIdentifier>,
    names: FxHashMap<(ScopeIdentifier, Atom), BindingIdentifier>,
    /// Indices into `references`, grouped by binding: binding `b` owns
    /// `by_binding[by_binding_start[b]..by_binding_start[b + 1]]`, in source order.
    by_binding: Vec<u32>,
    by_binding_start: Vec<u32>,
    /// Per binding: named in type syntax ([`crate::syntax_tree::SyntaxTree::type_references`]).
    /// typescript-eslint's scope analysis counts such a name as a read; the compiler's read
    /// counts do not.
    type_referenced: Vec<bool>,
}

impl Semantic {
    #[must_use]
    pub fn binding_of(&self, ident: NodeIdentifier) -> Option<BindingIdentifier> {
        self.node_binding
            .get(ident.index())
            .copied()
            .filter(|&b| b != NO_BINDING)
            .map(|b| BindingIdentifier::new(b as usize))
    }

    /// Whether type syntax names `b` (`x: B`, `Map<K, B>`, `typeof b`).
    #[must_use]
    pub fn is_type_referenced(&self, b: BindingIdentifier) -> bool {
        self.type_referenced[b.index()]
    }

    /// The top-level binding named `name`, if any.
    #[must_use]
    pub fn root_binding(&self, name: Atom) -> Option<BindingIdentifier> {
        self.names.get(&(ScopeIdentifier::ROOT, name)).copied()
    }

    /// The scope `node` opens (a function, a block, a [`HostScope`]'s node).
    #[must_use]
    pub fn scope_of(&self, node: NodeIdentifier) -> Option<ScopeIdentifier> {
        self.node_scope.get(&node).copied()
    }

    /// What `name` refers to in `scope`: its own binding or the nearest enclosing one.
    #[must_use]
    pub fn lookup(&self, mut scope: ScopeIdentifier, name: Atom) -> Option<BindingIdentifier> {
        loop {
            if let Some(&b) = self.names.get(&(scope, name)) {
                return Some(b);
            }
            scope = self.scopes[scope].parent?;
        }
    }

    pub fn references_to(&self, b: BindingIdentifier) -> impl Iterator<Item = &Reference> {
        let (start_offset, end_offset) = (
            self.by_binding_start[b.index()] as usize,
            self.by_binding_start[b.index() + 1] as usize,
        );
        self.by_binding[start_offset..end_offset]
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
    pub fn variable_scope(&self, mut s: ScopeIdentifier) -> ScopeIdentifier {
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
enum ReferenceContext {
    Expression,
    /// A binding pattern: identifiers declare, defaults and computed keys are expressions.
    /// `initializer` when the identifiers are also written (an initialised declarator, a default
    /// value).
    Pattern {
        initializer: bool,
    },
    /// An assignment target; `read` for compound operators.
    Target {
        read: bool,
    },
}

struct Analyzer<'a> {
    syntax_tree: &'a SyntaxTree,
    s: Semantic,
    stack: Vec<ScopeIdentifier>,
    /// The declarator/specifier being declared in pass 1.
    current_declaration: Option<NodeIdentifier>,
    /// Host scopes in the order pass 1 created them; pass 2 walks the roots in the same order.
    host_scopes: Vec<ScopeIdentifier>,
    next_host_scope: usize,
}

#[must_use]
pub fn analyze(syntax_tree: &SyntaxTree, program: NodeIdentifier, host: &[HostRoot]) -> Semantic {
    let mut a = Analyzer {
        syntax_tree,
        s: Semantic {
            scopes: IndexVector::from(vec![Scope {
                parent: None,
                function: true,
                node: program,
            }]),
            bindings: IndexVector::new(),
            references: Vec::new(),
            node_binding: vec![NO_BINDING; syntax_tree.len()],
            node_scope: FxHashMap::default(),
            names: FxHashMap::default(),
            by_binding: Vec::new(),
            by_binding_start: Vec::new(),
            type_referenced: Vec::new(),
        },
        stack: vec![ScopeIdentifier::ROOT],
        current_declaration: None,
        host_scopes: Vec::new(),
        next_host_scope: 0,
    };
    a.s.node_scope.insert(program, ScopeIdentifier::ROOT);
    a.declare_children(program);
    a.declare_host(host);
    a.resolve_children(program);
    a.resolve_host(host);
    a.resolve_type_references();
    a.s.index_references();
    a.s
}

impl Analyzer<'_> {
    fn cur(&self) -> ScopeIdentifier {
        *self
            .stack
            .last()
            .expect("the scope stack always holds the root")
    }

    fn function_scope(&self) -> ScopeIdentifier {
        self.s.variable_scope(self.cur())
    }

    fn push_scope(&mut self, node: NodeIdentifier, function: bool) -> ScopeIdentifier {
        let identifier = self.s.scopes.push(Scope {
            parent: Some(self.cur()),
            function,
            node,
        });
        self.s.node_scope.insert(node, identifier);
        self.stack.push(identifier);
        identifier
    }

    fn add_binding(
        &mut self,
        ident: NodeIdentifier,
        kind: DeclarationKind,
        scope: ScopeIdentifier,
    ) {
        let Some(name) = self.syntax_tree.atom(ident) else {
            return;
        };
        let identifier = *self.s.names.entry((scope, name)).or_insert_with(|| {
            self.s.bindings.push(Binding {
                name,
                kind,
                node: ident,
                scope,
                declaration: self.current_declaration,
                reads: 0,
                writes: 0,
                mutations: 0,
            })
        });
        self.s.node_binding[ident.index()] = identifier.index() as u32;
    }

    // ---- pass 1 --------------------------------------------------------------------------------

    fn declare_host(&mut self, roots: &[HostRoot]) {
        for r in roots {
            match r {
                HostRoot::Expression(e) | HostRoot::Bound(e) => self.declare(*e),
                HostRoot::Scope(h) => {
                    let identifier = self.push_scope(h.node, false);
                    self.host_scopes.push(identifier);
                    for &p in &h.parameters {
                        self.declare_pattern(p, DeclarationKind::Host);
                    }
                    self.declare_host(&h.body);
                    self.stack.pop();
                }
            }
        }
    }

    fn declare_children(&mut self, identifier: NodeIdentifier) {
        let mut children = Vec::new();
        self.syntax_tree
            .for_each_child(identifier, |c| children.push(c));
        for c in children {
            self.declare(c);
        }
    }

    fn declare(&mut self, identifier: NodeIdentifier) {
        match self.syntax_tree.kind(identifier) {
            Kind::VariableDeclaration { kind, declarations } => {
                let dk = match kind {
                    flag::LET => DeclarationKind::Let,
                    flag::CONST => DeclarationKind::Const,
                    _ => DeclarationKind::Variable,
                };
                for &d in declarations {
                    if let Kind::Declarator {
                        identifier: target,
                        initializer,
                    } = self.syntax_tree.kind(d)
                    {
                        self.current_declaration = Some(d);
                        self.declare_pattern(target, dk);
                        self.current_declaration = None;
                        if let Some(i) = initializer {
                            self.declare(i);
                        }
                    }
                }
            }
            Kind::Function {
                name,
                parameters,
                body,
                declaration,
                ..
            } => {
                if let (Some(n), true) = (name, declaration) {
                    let s = self.cur();
                    self.add_binding(n, DeclarationKind::Function, s);
                }
                self.push_scope(identifier, true);
                if let (Some(n), false) = (name, declaration) {
                    let s = self.cur();
                    self.add_binding(n, DeclarationKind::Function, s);
                }
                for &p in parameters {
                    self.declare_pattern(p, DeclarationKind::Param);
                }
                self.declare_body(body);
                self.stack.pop();
            }
            Kind::Arrow {
                parameters,
                body,
                expression_body,
                ..
            } => {
                self.push_scope(identifier, true);
                for &p in parameters {
                    self.declare_pattern(p, DeclarationKind::Param);
                }
                if expression_body {
                    self.declare(body);
                } else {
                    self.declare_body(body);
                }
                self.stack.pop();
            }
            Kind::Block(_) => {
                self.push_scope(identifier, false);
                self.declare_children(identifier);
                self.stack.pop();
            }
            Kind::Import { specifiers, .. } => {
                for &sp in specifiers {
                    self.current_declaration = Some(sp);
                    let local = match self.syntax_tree.kind(sp) {
                        Kind::ImportDefault(l) | Kind::ImportNamespace(l) => l,
                        Kind::ImportNamed { local, .. } => local,
                        _ => continue,
                    };
                    self.add_binding(local, DeclarationKind::Import, ScopeIdentifier::ROOT);
                }
                self.current_declaration = None;
            }
            _ => self.declare_children(identifier),
        }
    }

    /// A function body block shares the function's scope.
    fn declare_body(&mut self, body: NodeIdentifier) {
        self.s.node_scope.insert(body, self.cur());
        self.declare_children(body);
    }

    fn declare_pattern(&mut self, p: NodeIdentifier, kind: DeclarationKind) {
        match self.syntax_tree.kind(p) {
            Kind::Identifier(_) => {
                let scope = if kind == DeclarationKind::Variable {
                    self.function_scope()
                } else {
                    self.cur()
                };
                self.add_binding(p, kind, scope);
            }
            Kind::ObjectPattern(props) => {
                for &pr in props {
                    match self.syntax_tree.kind(pr) {
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
            Kind::ArrayPattern(items) => {
                for &it in items {
                    self.declare_pattern(it, kind);
                }
            }
            Kind::AssignPattern(l, r) => {
                self.declare_pattern(l, kind);
                self.declare(r);
            }
            Kind::Rest(a) => self.declare_pattern(a, kind),
            _ => {}
        }
    }

    // ---- pass 2 --------------------------------------------------------------------------------

    fn lookup(&self, name: Atom) -> Option<BindingIdentifier> {
        self.lookup_from(self.cur(), name)
    }

    fn lookup_from(&self, scope: ScopeIdentifier, name: Atom) -> Option<BindingIdentifier> {
        self.s.lookup(scope, name)
    }

    /// Looks each type-syntax identifier up from the innermost scope whose node contains it; one
    /// outside every scope node (a template expression's cast) is looked up from the root.
    fn resolve_type_references(&mut self) {
        let ranges: Vec<(ScopeIdentifier, Span)> = self
            .s
            .scopes
            .iter_enumerated()
            .filter_map(|(identifier, s)| {
                self.syntax_tree
                    .source_location(s.node)
                    .span()
                    .map(|sp| (identifier, sp))
            })
            .collect();
        let mut used = vec![false; self.s.bindings.len()];
        for r in &self.syntax_tree.type_references {
            let scope = ranges
                .iter()
                .filter(|(_, sp)| {
                    sp.start_offset <= r.span.start_offset && r.span.end_offset <= sp.end_offset
                })
                .min_by_key(|(_, sp)| sp.end_offset - sp.start_offset)
                .map_or(ScopeIdentifier::ROOT, |&(identifier, _)| identifier);
            if let Some(b) = self.lookup_from(scope, r.name) {
                used[b.index()] = true;
            }
        }
        self.s.type_referenced = used;
    }

    fn reference(&mut self, ident: NodeIdentifier, read: bool, write: bool) {
        let Some(name) = self.syntax_tree.atom(ident) else {
            return;
        };
        let b = self.lookup(name);
        if let Some(b) = b {
            self.s.node_binding[ident.index()] = b.index() as u32;
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
            initializer: false,
            scope,
        });
    }

    fn initializer_reference(&mut self, ident: NodeIdentifier) {
        let b = self.s.binding_of(ident);
        let scope = self.cur();
        self.s.references.push(Reference {
            node: ident,
            binding: b,
            read: false,
            write: true,
            initializer: true,
            scope,
        });
    }

    fn resolve_host(&mut self, roots: &[HostRoot]) {
        for r in roots {
            match r {
                HostRoot::Expression(e) => self.resolve(*e, ReferenceContext::Expression),
                HostRoot::Bound(e) => self.resolve(*e, ReferenceContext::Target { read: true }),
                HostRoot::Scope(h) => {
                    let identifier = self.host_scopes[self.next_host_scope];
                    self.next_host_scope += 1;
                    self.stack.push(identifier);
                    for &p in &h.parameters {
                        self.resolve(p, ReferenceContext::Pattern { initializer: false });
                    }
                    self.resolve_host(&h.body);
                    self.stack.pop();
                }
            }
        }
    }

    fn resolve_children(&mut self, identifier: NodeIdentifier) {
        let mut children = Vec::new();
        self.syntax_tree
            .for_each_child(identifier, |c| children.push(c));
        for c in children {
            self.resolve(c, ReferenceContext::Expression);
        }
    }

    fn enter(&mut self, identifier: NodeIdentifier) -> bool {
        match self.s.node_scope.get(&identifier) {
            Some(&s) if s != self.cur() => {
                self.stack.push(s);
                true
            }
            _ => false,
        }
    }

    #[expect(clippy::too_many_lines, reason = "one arm per node kind and context")]
    fn resolve(&mut self, identifier: NodeIdentifier, context: ReferenceContext) {
        match (self.syntax_tree.kind(identifier), context) {
            (Kind::Identifier(_), ReferenceContext::Pattern { initializer }) => {
                if initializer {
                    self.initializer_reference(identifier);
                }
            }
            (Kind::Identifier(_), ReferenceContext::Target { read }) => {
                self.reference(identifier, read, true);
            }
            (Kind::Identifier(_), ReferenceContext::Expression) => {
                self.reference(identifier, true, false);
            }
            (Kind::ObjectPattern(props), _) => {
                for &pr in props {
                    match self.syntax_tree.kind(pr) {
                        Kind::Property {
                            key,
                            value,
                            computed,
                            ..
                        } => {
                            if computed {
                                self.resolve(key, ReferenceContext::Expression);
                            }
                            self.resolve(value, context);
                        }
                        Kind::Rest(a) => self.resolve(a, context),
                        _ => {}
                    }
                }
            }
            (Kind::ArrayPattern(items), _) => {
                for &it in items {
                    self.resolve(it, context);
                }
            }
            (Kind::AssignPattern(l, r), _) => {
                let left = match context {
                    ReferenceContext::Pattern { .. } => {
                        ReferenceContext::Pattern { initializer: true }
                    }
                    other => other,
                };
                self.resolve(l, left);
                self.resolve(r, ReferenceContext::Expression);
            }
            (Kind::Rest(a), _) => self.resolve(a, context),
            (
                Kind::Declarator {
                    identifier: target,
                    initializer,
                },
                _,
            ) => {
                self.resolve(
                    target,
                    ReferenceContext::Pattern {
                        initializer: initializer.is_some(),
                    },
                );
                if let Some(i) = initializer {
                    self.resolve(i, ReferenceContext::Expression);
                }
            }
            (
                Kind::Function {
                    parameters, body, ..
                },
                _,
            ) => {
                let entered = self.enter(identifier);
                for &p in parameters {
                    self.resolve(p, ReferenceContext::Pattern { initializer: false });
                }
                self.resolve_children(body);
                if entered {
                    self.stack.pop();
                }
            }
            (
                Kind::Arrow {
                    parameters,
                    body,
                    expression_body,
                    ..
                },
                _,
            ) => {
                let entered = self.enter(identifier);
                for &p in parameters {
                    self.resolve(p, ReferenceContext::Pattern { initializer: false });
                }
                if expression_body {
                    self.resolve(body, ReferenceContext::Expression);
                } else {
                    self.resolve_children(body);
                }
                if entered {
                    self.stack.pop();
                }
            }
            (Kind::Block(_), _) => {
                let entered = self.enter(identifier);
                self.resolve_children(identifier);
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
                self.resolve(object, ReferenceContext::Expression);
                if computed {
                    self.resolve(property, ReferenceContext::Expression);
                }
                if let ReferenceContext::Target { .. } = context {
                    let mut root = object;
                    while let Kind::Member { object, .. } = self.syntax_tree.kind(root) {
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
                    self.resolve(key, ReferenceContext::Expression);
                }
                self.resolve(value, ReferenceContext::Expression);
            }
            (Kind::Assign(op, target, value), _) => {
                self.resolve(
                    target,
                    ReferenceContext::Target {
                        read: op != AssignmentOperator::Assign,
                    },
                );
                self.resolve(value, ReferenceContext::Expression);
            }
            (Kind::Update { arg, .. }, _) => {
                self.resolve(arg, ReferenceContext::Target { read: true });
            }
            _ => {
                self.resolve_children(identifier);
            }
        }
    }
}
