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

mod declare;
mod resolve;
