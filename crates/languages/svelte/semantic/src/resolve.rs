//! Binding resolution and classification as side tables over the component's oxc trees.
//!
//! One `oxc_semantic` analysis covers the module script, the instance script and the template
//! ([`host::ComponentHost`]), so "is this name used anywhere" is one query.

use std::cell::RefCell;

use oxc_ast::AstKind;
use oxc_ast::ast::{
    CallExpression, Expression, IdentifierReference, Program, PropertyKey, VariableDeclarationKind,
};
use oxc_semantic::{ReferenceId, ScopeId, Scoping, SymbolId};
use oxc_span::{GetSpan, Span};
use rsvelte_typescript_semantic::semantic::Semantic;
use rsvelte_typescript_tree::{ProgramIdentifier, Tree};
use rustc_hash::FxHashMap;

use crate::compiler_syntax_tree::{
    AttributeIdentifier, CompilerNodeIdentifier, CompilerSyntaxTree, NodeKind,
};

mod classify;
mod counts;
mod host;
mod runes;
mod walk;

pub use counts::Counts;
pub use runes::{RUNE_ROOTS, RUNES, lowers, rune_call};
pub use walk::{Roots, TemplateName, TemplateScope, walk};

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum BindingKind {
    Normal,
    State,
    RawState,
    Derived,
    DerivedBy,
    Property,
    BindableProperty,
    RestProperty,
    /// Declared by an `{#each}` context.
    Each,
    /// The index of an unkeyed `{#each}` (upstream `static`): it never changes for an item.
    StaticIndex,
    /// The index of a keyed `{#each}` (upstream `template`).
    KeyedIndex,
    /// A `{#snippet}` parameter.
    Snippet,
    /// Declared by `{@const}`, `{:then}`, `{:catch}` or `let:` (upstream `template`).
    Template,
}

#[derive(Clone, Copy, Debug)]
pub struct BindingInformation<'a> {
    pub kind: BindingKind,
    /// A function declaration or a variable initialised with a function.
    pub is_function: bool,
    /// For props: the default value; for state/derived: the rune's argument.
    pub initial: Option<&'a Expression<'a>>,
    /// For props: the key in `$$props` (the property name, not the local name).
    pub prop_key: Option<&'a PropertyKey<'a>>,
}

/// The symbols of the names the template declares outside a JavaScript pattern.
#[derive(Debug, Default)]
pub(crate) struct TemplateNames {
    pub(crate) snippets: FxHashMap<CompilerNodeIdentifier, SymbolId>,
    pub(crate) lets: FxHashMap<AttributeIdentifier, Vec<SymbolId>>,
}

mod cell {
    #![allow(
        clippy::mem_forget,
        reason = "self_cell's expansion forgets its guard on purpose"
    )]

    use rsvelte_typescript_semantic::semantic::Semantic;

    use super::Facts;

    self_cell::self_cell!(
        pub(super) struct Cell {
            owner: Semantic,
            #[covariant]
            dependent: Facts,
        }
    );
}

struct Facts<'a> {
    bindings: Vec<BindingInformation<'a>>,
    counts: Counts,
    /// The instance calls `$props()` (upstream `needs_props`).
    uses_props: bool,
    /// The rune names that subscribe to a store instead, such as `$state` beside a `state`.
    subscribed: Vec<&'static str>,
    scopes: FxHashMap<TemplateScope, ScopeId>,
    names: TemplateNames,
    instance_scope: ScopeId,
}

/// The names of a component and what they are.
pub struct Resolution(cell::Cell);

impl std::fmt::Debug for Resolution {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Resolution")
            .field("semantic", self.semantic())
            .finish_non_exhaustive()
    }
}

/// Analyzes the component whose scripts and template expressions are in `tree`.
#[must_use]
pub fn resolve(
    tree: &Tree,
    instance: Option<ProgramIdentifier>,
    module: Option<ProgramIdentifier>,
    compiler_syntax_tree: &CompilerSyntaxTree,
) -> Resolution {
    let mut scopes = FxHashMap::default();
    let mut names = TemplateNames::default();
    let template = walk::Recorded::new(compiler_syntax_tree);
    let semantic = Semantic::build(tree.clone(), |tree, builder| {
        let allocator = tree.allocator();
        let template_names = host::Names::new(tree, allocator, compiler_syntax_tree);
        let instance = instance.map(|p| tree.get_program(p));
        let (root, nested_instance) = match (module.map(|p| tree.get_program(p)), instance) {
            (Some(module), instance) => (module, instance),
            (None, Some(instance)) => (instance, None),
            (None, None) => (empty_program(tree), None),
        };
        let host = host::ComponentHost {
            tree,
            template: &template,
            nested_instance,
            names: &template_names,
            scopes: RefCell::new(FxHashMap::default()),
        };
        let mut built = builder.build_with_host(root, &host);
        if let Some(module) = module {
            allow_snippet_exports(
                tree,
                tree.get_program(module),
                compiler_syntax_tree,
                &mut built,
            );
        }
        counts::mark_bound_writes(tree, &template, built.semantic.scoping_mut());
        scopes = host.scopes.take();
        names = template_names.symbols();
        built
    });
    Resolution(cell::Cell::new(semantic, |semantic| {
        let tree = semantic.tree();
        let scoping = semantic.scoping();
        let programs: Vec<&Program<'_>> = module
            .into_iter()
            .chain(instance)
            .map(|p| tree.get_program(p))
            .collect();
        let instance_scope = instance
            .and_then(|p| tree.get_program(p).scope_id.get())
            .unwrap_or_else(|| scoping.root_scope_id());
        let counts = counts::count(tree, scoping, &programs, &template);
        let subscribed = runes::subscribed(semantic, instance_scope);
        let bindings =
            classify::classify(semantic, &subscribed, &counts, compiler_syntax_tree, &names);
        let uses_props =
            instance.is_some_and(|p| has_props_rune(semantic, &subscribed, tree.get_program(p)));
        Facts {
            bindings,
            counts,
            uses_props,
            subscribed,
            scopes,
            names,
            instance_scope,
        }
    }))
}

/// Svelte lets the module script export a snippet the template declares at its top level, which
/// is no binding of the module's scope.
fn allow_snippet_exports(
    tree: &Tree,
    module: &Program<'_>,
    compiler_syntax_tree: &CompilerSyntaxTree,
    built: &mut oxc_semantic::SemanticBuilderReturn<'_>,
) {
    // A nested snippet's export is upstream's `snippet_invalid_export`, which the compiler raises.
    let snippets: Vec<&str> = compiler_syntax_tree
        .nodes
        .iter()
        .filter_map(|node| match &node.kind {
            NodeKind::Snippet(snippet) => match tree.get_expression(snippet.name) {
                Expression::Identifier(name) => Some(name.name.as_str()),
                _ => None,
            },
            _ => None,
        })
        .collect();
    if snippets.is_empty() {
        return;
    }
    let exported: Vec<u32> = module
        .body
        .iter()
        .filter_map(|statement| match statement {
            oxc_ast::ast::Statement::ExportNamedDeclaration(export) => Some(&export.specifiers),
            _ => None,
        })
        .flatten()
        .filter_map(|specifier| match &specifier.local {
            oxc_ast::ast::ModuleExportName::IdentifierReference(local)
                if snippets.contains(&local.name.as_str()) =>
            {
                Some(local.span.start)
            }
            _ => None,
        })
        .collect();
    built.diagnostics.retain(|diagnostic| {
        !diagnostic
            .labels
            .first()
            .is_some_and(|label| exported.contains(&label.offset()))
    });
}

/// The program a component without scripts resolves its template in.
fn empty_program(tree: &Tree) -> &Program<'_> {
    let ast = oxc_ast::builder::AstBuilder::new(tree.allocator());
    let program = Program::new(
        Span::empty(0),
        oxc_span::SourceType::mjs(),
        tree.source_text(),
        oxc_allocator::ArenaVec::new_in(&ast),
        None,
        oxc_allocator::ArenaVec::new_in(&ast),
        oxc_allocator::ArenaVec::new_in(&ast),
        &ast,
    );
    tree.allocator().alloc(program)
}

impl Resolution {
    #[must_use]
    pub fn semantic(&self) -> &Semantic {
        self.0.borrow_owner()
    }

    #[must_use]
    pub fn tree(&self) -> &Tree {
        self.semantic().tree()
    }

    #[must_use]
    pub fn scoping(&self) -> &Scoping {
        self.semantic().scoping()
    }

    /// The first error a module rejects that no parser reported, in the scripts or the template.
    #[must_use]
    pub fn syntax_error(&self) -> Option<&rsvelte_kernel::diagnostics::Diagnostic> {
        self.semantic().syntax_error()
    }

    /// The instance script's scope, where the template's names resolve first; the root scope when
    /// there is no instance script.
    #[must_use]
    pub fn instance_scope(&self) -> ScopeId {
        self.0.borrow_dependent().instance_scope
    }

    /// The scope the template opened for `scope`; `None` for a fragment that declares nothing.
    #[must_use]
    pub fn template_scope(&self, scope: TemplateScope) -> Option<ScopeId> {
        self.0.borrow_dependent().scopes.get(&scope).copied()
    }

    /// The symbol `{#snippet name()}` at `node` declares.
    #[must_use]
    pub fn snippet(&self, node: CompilerNodeIdentifier) -> Option<SymbolId> {
        self.0.borrow_dependent().names.snippets.get(&node).copied()
    }

    /// The symbols the `let:` directive `attribute` declares.
    #[must_use]
    pub fn let_names(&self, attribute: AttributeIdentifier) -> &[SymbolId] {
        self.0
            .borrow_dependent()
            .names
            .lets
            .get(&attribute)
            .map_or(&[], Vec::as_slice)
    }

    /// The instance calls `$props()` (upstream `needs_props`).
    #[must_use]
    pub fn uses_props(&self) -> bool {
        self.0.borrow_dependent().uses_props
    }

    /// The symbol `reference` resolves to; `None` for a global, or for an identifier the analysis
    /// did not visit, such as one a task built.
    #[must_use]
    pub fn symbol(&self, reference: &IdentifierReference<'_>) -> Option<SymbolId> {
        let reference = reference.reference_id.get()?;
        self.scoping().get_reference(reference).symbol_id()
    }

    /// Where the reference `reference` is.
    #[must_use]
    pub fn reference_span(&self, reference: ReferenceId) -> Span {
        let node = self.scoping().get_reference(reference).node_id();
        self.semantic().nodes().kind(node).span()
    }

    /// The scope the reference `reference` is in.
    #[must_use]
    pub fn reference_scope(&self, reference: ReferenceId) -> ScopeId {
        let node = self.scoping().get_reference(reference).node_id();
        self.semantic().nodes().get_node(node).scope_id()
    }

    /// Whether `scope` is a JavaScript function's. A `{#snippet}` is not one.
    #[must_use]
    pub fn is_function_scope(&self, scope: ScopeId) -> bool {
        let node = self.scoping().get_node_id(scope);
        matches!(
            self.semantic().nodes().kind(node),
            AstKind::Function(_) | AstKind::ArrowFunctionExpression(_)
        )
    }

    /// The names no binding declares, which a store subscription or a global may be.
    pub fn unresolved_names(&self) -> impl Iterator<Item = &str> {
        self.scoping()
            .root_unresolved_references()
            .keys()
            .map(oxc_ast::ast::Ident::as_str)
    }

    /// The node that declares `symbol`: a declarator, a function, an import specifier, ….
    #[must_use]
    pub fn declaration(&self, symbol: SymbolId) -> AstKind<'_> {
        self.semantic()
            .nodes()
            .kind(self.scoping().symbol_declaration(symbol))
    }

    /// `var`, `let`, … of the declaration of a variable `symbol`.
    #[must_use]
    pub fn variable_kind(&self, symbol: SymbolId) -> Option<VariableDeclarationKind> {
        let nodes = self.semantic().nodes();
        nodes
            .ancestor_kinds(self.scoping().symbol_declaration(symbol))
            .find_map(|kind| match kind {
                AstKind::VariableDeclaration(d) => Some(d.kind),
                _ => None,
            })
            .filter(|_| matches!(self.declaration(symbol), AstKind::VariableDeclarator(_)))
    }

    #[must_use]
    pub fn binding(&self, symbol: SymbolId) -> &BindingInformation<'_> {
        &self.0.borrow_dependent().bindings[symbol.index()]
    }

    #[must_use]
    pub fn counts(&self) -> &Counts {
        &self.0.borrow_dependent().counts
    }

    #[must_use]
    pub fn writes(&self, symbol: SymbolId) -> u32 {
        self.counts().writes[symbol.index()]
    }

    #[must_use]
    pub fn mutations(&self, symbol: SymbolId) -> u32 {
        self.counts().mutations[symbol.index()]
    }

    /// The initialiser of the declarator `symbol` came from (`initializer` in `let x =
    /// initializer`).
    #[must_use]
    pub fn initializer(&self, symbol: SymbolId) -> Option<&Expression<'_>> {
        classify::initializer(self.semantic(), symbol)
    }

    /// Upstream `get_rune`: the rune the call `e` makes, with its first argument. A callee whose
    /// root is a binding, or a store subscription such as `$state` beside a `state`, makes none.
    #[must_use]
    pub fn rune<'a>(
        &self,
        e: &'a Expression<'a>,
    ) -> Option<(&'static str, Option<&'a Expression<'a>>)> {
        runes::rune(self.semantic(), &self.0.borrow_dependent().subscribed, e)
    }

    /// [`Resolution::rune_named`] of a call that is no optional chain's end, which the caller
    /// knows.
    #[must_use]
    pub fn rune_of_call(&self, call: &CallExpression<'_>) -> Option<&'static str> {
        runes::named_in_scope(self.semantic(), &self.0.borrow_dependent().subscribed, call)
    }

    /// The rune the call `e` names by its callee's shape, inside an optional chain too: the
    /// rune upstream's visitors of a call see.
    #[must_use]
    pub fn rune_named<'a>(&self, e: &'a Expression<'a>) -> Option<&'static str> {
        runes::named_in_scope_anywhere(self.semantic(), &self.0.borrow_dependent().subscribed, e)
    }

    /// Whether the unbound reference `name` subscribes to a store (upstream analysis's synthetic
    /// `store_sub` binding): any `$name` but `$` and `$$name`, unless it names a rune.
    #[must_use]
    pub fn is_store_subscription(&self, name: &str) -> bool {
        name.strip_prefix('$')
            .is_some_and(|store| !store.is_empty() && !store.starts_with('$'))
            && (!RUNES.contains(&name) || self.0.borrow_dependent().subscribed.contains(&name))
    }

    /// Upstream `is_state_source`: in runes mode a `$state` needs a signal only if it is
    /// reassigned.
    #[must_use]
    pub fn is_state_source(&self, symbol: SymbolId) -> bool {
        matches!(
            self.binding(symbol).kind,
            BindingKind::State | BindingKind::RawState
        ) && self.writes(symbol) > 0
    }

    /// Upstream `is_prop_source`, runes mode.
    #[must_use]
    pub fn is_prop_source(&self, symbol: SymbolId) -> bool {
        let info = self.binding(symbol);
        matches!(
            info.kind,
            BindingKind::Property | BindingKind::BindableProperty
        ) && (self.writes(symbol) > 0 || info.initial.is_some() || self.mutations(symbol) > 0)
    }

    /// Upstream `should_proxy`: whether `$state(e)` makes a deep proxy of `e`'s value.
    #[must_use]
    pub fn should_proxy(&self, e: &Expression<'_>) -> bool {
        proxyable(Some(self), e)
    }
}

/// `res` is `None` for a binding's initial value, which upstream checks without a scope.
fn proxyable(res: Option<&Resolution>, e: &Expression<'_>) -> bool {
    // Upstream asks after the types are erased.
    match crate::typescript::without_typescript(e) {
        Expression::StringLiteral(_)
        | Expression::RegExpLiteral(_)
        | Expression::BigIntLiteral(_)
        | Expression::NumericLiteral(_)
        | Expression::BooleanLiteral(_)
        | Expression::NullLiteral(_)
        | Expression::TemplateLiteral(_)
        | Expression::ArrowFunctionExpression(_)
        | Expression::UnaryExpression(_)
        | Expression::BinaryExpression(_)
        | Expression::FunctionExpression(_) => false,
        Expression::Identifier(identifier) if identifier.name == "undefined" => false,
        Expression::Identifier(identifier) => {
            let Some(res) = res else {
                return true;
            };
            let Some(symbol) = res.symbol(identifier) else {
                return true;
            };
            if res.writes(symbol) > 0 {
                return true;
            }
            let info = res.binding(symbol);
            // Analysis rewires a prop's initial from `$props()` to its default.
            let initial = match info.kind {
                BindingKind::Property
                | BindingKind::BindableProperty
                | BindingKind::RestProperty => info.initial,
                _ => res.initializer(symbol),
            };
            initial.is_none_or(|initializer| proxyable(None, initializer))
        }
        _ => true,
    }
}

fn has_props_rune(semantic: &Semantic, subscribed: &[&str], program: &Program<'_>) -> bool {
    use oxc_ast::ast::Statement;
    program.body.iter().any(|statement| match statement {
        Statement::VariableDeclaration(declaration) => declaration.declarations.iter().any(|d| {
            d.init.as_ref().is_some_and(|init| {
                runes::rune(semantic, subscribed, init).is_some_and(|(r, _)| r == "$props")
            })
        }),
        _ => false,
    })
}

#[cfg(test)]
mod tests;
