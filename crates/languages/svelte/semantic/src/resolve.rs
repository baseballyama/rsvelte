//! Binding resolution and classification as side tables over the component's oxc trees.
//!
//! One `oxc_semantic` analysis covers the module script, the instance script and the template
//! (`host::ComponentHost`), so "is this name used anywhere" is one query.

use std::cell::RefCell;

use oxc_ast::AstKind;
use oxc_ast::ast::{
    CallExpression, Expression, IdentifierReference, Program, PropertyKey, VariableDeclarationKind,
};
use oxc_semantic::{ReferenceId, ScopeId, Scoping, SymbolFlags, SymbolId};
use oxc_span::{GetSpan, Span};
use rsvelte_typescript_semantic::semantic::Semantic;
use rsvelte_typescript_tree::{ProgramIdentifier, Tree};
use rustc_hash::FxHashMap;

use crate::compiler_syntax_tree::{
    AttributeIdentifier, CompilerNodeIdentifier, CompilerSyntaxTree,
};

mod classify;
mod counts;
mod host;
mod imports;
mod runes;
mod walk;

pub use counts::Counts;
pub use runes::{RUNE_ROOTS, RUNES, is_rune, rune_call};
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

/// `symbol` unless only `declare` declarations make it: upstream strips them before its analysis.
pub(crate) fn bound(scoping: &Scoping, symbol: Option<SymbolId>) -> Option<SymbolId> {
    let ambient = |flags: SymbolFlags| flags.contains(SymbolFlags::Ambient);
    symbol.filter(|&symbol| {
        !ambient(scoping.symbol_flags(symbol))
            || !(scoping.symbol_redeclarations(symbol).iter()).all(|r| ambient(r.flags))
    })
}

mod cell;

struct Facts<'a> {
    bindings: Vec<BindingInformation<'a>>,
    counts: Counts,
    /// The instance calls `$props()` (upstream `needs_props`).
    uses_props: bool,
    /// Some script or template expression holds an `await`.
    awaits: bool,
    /// The rune names that subscribe to a store instead, such as `$state` beside a `state`.
    subscribed: runes::Subscriptions,
    /// A component: a module has no store subscriptions.
    stores: bool,
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
    resolve_scripts(tree, instance, module, compiler_syntax_tree, true)
}

/// Analyzes a `.svelte.js` or `.svelte.ts` module, `program` of `tree`. Upstream's
/// `analyze_module` reads a rune name as the rune even beside a binding of its store's name.
#[must_use]
pub fn resolve_module(tree: &Tree, program: ProgramIdentifier) -> Resolution {
    let template =
        crate::compiler_syntax_tree::CompilerSyntaxTreeBuilder::new(tree.source_text(), 0, 0)
            .finish(crate::compiler_syntax_tree::Children::default());
    resolve_scripts(tree, None, Some(program), &template, false)
}

/// `stores`: whether a `$name` beside a binding `name` subscribes to it, as in a component.
fn resolve_scripts(
    tree: &Tree,
    instance: Option<ProgramIdentifier>,
    module: Option<ProgramIdentifier>,
    compiler_syntax_tree: &CompilerSyntaxTree,
    stores: bool,
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
            (None, None) => (
                rsvelte_typescript_semantic::semantic::empty_program(tree),
                None,
            ),
        };
        let host = host::ComponentHost {
            tree,
            template: &template,
            nested_instance,
            names: &template_names,
            scopes: RefCell::new(FxHashMap::default()),
        };
        let mut built = builder.build_with_host(root, &host);
        if let Some(instance) = nested_instance {
            imports::hoist(instance, built.semantic.scoping_mut());
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
        let counts = counts::count(
            tree,
            scoping,
            &programs,
            instance.map(|p| tree.get_program(p)),
            &template,
        );
        let subscribed = if stores {
            let instance_program = instance.and_then(|p| tree.get_program(p).scope_id.get());
            let instance_body = instance.map_or(&[][..], |p| &tree.get_program(p).body[..]);
            runes::subscribed(
                semantic,
                instance_scope,
                instance_program,
                instance_body,
                module.is_some(),
            )
        } else {
            runes::Subscriptions::default()
        };
        let bindings =
            classify::classify(semantic, &subscribed, &counts, compiler_syntax_tree, &names);
        let uses_props =
            instance.is_some_and(|p| has_props_rune(semantic, &subscribed, tree.get_program(p)));
        // The nodes hold the scripts and the template's expressions in one flat list, which is
        // cheaper to scan than to walk.
        let awaits = (semantic.nodes().iter())
            .any(|node| matches!(node.kind(), AstKind::AwaitExpression(_)));
        Facts {
            bindings,
            counts,
            uses_props,
            awaits,
            subscribed,
            stores,
            scopes,
            names,
            instance_scope,
        }
    }))
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

    /// [`Semantic::syntax_error`](rsvelte_typescript_semantic::semantic::Semantic::syntax_error),
    /// with what acorn reports for it.
    #[must_use]
    pub fn javascript_syntax_error(&self) -> Option<&rsvelte_typescript_tree::SyntaxError> {
        self.semantic().javascript_syntax_error()
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

    /// The instance calls `$props()` (upstream `needs_props`).
    #[must_use]
    pub fn uses_props(&self) -> bool {
        self.0.borrow_dependent().uses_props
    }

    /// Some script or template expression holds an `await`, so the checks that look for one
    /// need to walk.
    #[must_use]
    pub fn awaits(&self) -> bool {
        self.0.borrow_dependent().awaits
    }

    /// The symbol `reference` resolves to; `None` for a global, for a name only `declare`
    /// declarations bind, or for an identifier the analysis did not visit, such as one a task
    /// built.
    #[must_use]
    pub fn symbol(&self, reference: &IdentifierReference<'_>) -> Option<SymbolId> {
        bound(
            self.scoping(),
            self.scoping()
                .get_reference(reference.reference_id.get()?)
                .symbol_id(),
        )
    }

    /// Where the reference `reference` is.
    #[must_use]
    pub fn reference_span(&self, reference: ReferenceId) -> Span {
        let node = self.scoping().get_reference(reference).node_id();
        self.semantic().nodes().kind(node).span()
    }

    /// Whether `reference` is the callee of a call to the rune it names, which upstream's
    /// `get_rune` of the reference's parent reads.
    #[must_use]
    pub fn calls_rune(&self, reference: ReferenceId) -> bool {
        let nodes = self.semantic().nodes();
        let node = self.scoping().get_reference(reference).node_id();
        let AstKind::IdentifierReference(identifier) = nodes.kind(node) else {
            return false;
        };
        let AstKind::CallExpression(call) = nodes.parent_kind(node) else {
            return false;
        };
        matches!(&call.callee, Expression::Identifier(callee) if callee.span == identifier.span)
            && is_rune(&identifier.name)
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

    /// Each name no binding declares that `wanted` takes, with its value references. Upstream
    /// erases a `declare`d name, so it declares nothing.
    pub fn unbound(
        &self,
        wanted: impl Fn(&str) -> bool,
    ) -> impl Iterator<Item = (&str, Vec<ReferenceId>)> {
        let scoping = self.scoping();
        let ambient = (scoping.symbol_ids())
            .filter(|&s| scoping.symbol_flags(s).contains(SymbolFlags::Ambient))
            .map(|s| {
                (
                    scoping.symbol_name(s),
                    scoping.get_resolved_reference_ids(s),
                )
            });
        (scoping.root_unresolved_references().iter())
            .map(|(name, references)| (name.as_str(), references.as_slice()))
            .chain(ambient)
            .filter(move |(name, _)| wanted(name))
            .map(|(name, references)| {
                let values = (references.iter().copied())
                    .filter(|&r| scoping.get_reference(r).flags().is_value())
                    .collect();
                (name, values)
            })
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

    /// See [`Counts::reassigned`].
    #[must_use]
    pub fn reassigned(&self, symbol: SymbolId) -> bool {
        self.counts().reassigned(symbol)
    }

    /// See [`Counts::exported`].
    #[must_use]
    pub fn exported_by_specifier(&self) -> &FxHashMap<SymbolId, u32> {
        &self.counts().exported
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
    /// `store_sub` binding): in a component, any `$name` but `$` and `$$name`, unless it names a
    /// rune.
    #[must_use]
    pub fn is_store_subscription(&self, name: &str) -> bool {
        let facts = self.0.borrow_dependent();
        facts.stores
            && name
                .strip_prefix('$')
                .is_some_and(|store| !store.is_empty() && !store.starts_with('$'))
            && (!is_rune(name) || facts.subscribed.contains(name))
    }

    /// Upstream `is_state_source`: in runes mode a `$state` needs a signal only if it is
    /// reassigned, or if `accessors`, as a custom element's are, can read it from outside.
    #[must_use]
    pub fn is_state_source(&self, symbol: SymbolId, accessors: bool) -> bool {
        matches!(
            self.binding(symbol).kind,
            BindingKind::State | BindingKind::RawState
        ) && (accessors || self.reassigned(symbol))
    }

    /// Upstream `is_prop_source`, runes mode.
    #[must_use]
    pub fn is_prop_source(&self, symbol: SymbolId) -> bool {
        let info = self.binding(symbol);
        matches!(
            info.kind,
            BindingKind::Property | BindingKind::BindableProperty
        ) && (self.reassigned(symbol) || info.initial.is_some() || self.mutations(symbol) > 0)
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
            if res.reassigned(symbol) {
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

fn has_props_rune(
    semantic: &Semantic,
    subscribed: &runes::Subscriptions,
    program: &Program<'_>,
) -> bool {
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

/// Each name of a `let:` value under a default value, which assigns it where the directive
/// declares it.
pub fn let_names_under_a_default(value: &Expression<'_>, mut f: impl FnMut(Span)) {
    host::for_each_target(value, false, &mut |span, _, default| {
        if default {
            f(span);
        }
    });
}

#[cfg(test)]
mod tests;
