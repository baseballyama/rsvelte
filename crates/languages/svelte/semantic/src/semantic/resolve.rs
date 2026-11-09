//! Binding resolution and classification as side tables over immutable trees.

use rsvelte_kernel::index::IndexVector;
use rsvelte_svelte_compiler_syntax_tree::compiler_syntax_tree::CompilerSyntaxTree;
use rsvelte_typescript::scope::{self, BindingIdentifier, Semantic};
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};

mod classify;
mod roots;
mod runes;

pub use runes::{RUNES, rune_call};

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
pub struct BindingInformation {
    pub kind: BindingKind,
    /// A function declaration or a variable initialised with a function.
    pub is_function: bool,
    /// For props: the default value; for state/derived: the rune's argument.
    pub initial: Option<NodeIdentifier>,
    /// For props: the key in `$$props` (the property name, not the local name).
    pub prop_key: Option<NodeIdentifier>,
}

#[derive(Debug)]
pub struct Resolution {
    pub sem: Semantic,
    pub bindings: IndexVector<BindingIdentifier, BindingInformation>,
    /// The instance calls `$props()` (upstream `needs_props`).
    pub uses_props: bool,
    /// The rune names that subscribe to a store instead, such as `$state` beside a `state`.
    subscribed: Vec<&'static str>,
}

/// Resolves the script and the template of `compiler_syntax_tree`, which any frontend may have
/// built over `syntax_tree`, whose string values `source_text` holds.
#[must_use]
pub fn resolve(
    syntax_tree: &SyntaxTree,
    source_text: &str,
    program: NodeIdentifier,
    compiler_syntax_tree: &CompilerSyntaxTree,
) -> Resolution {
    resolve_with_module(
        syntax_tree,
        source_text,
        program,
        None,
        compiler_syntax_tree,
    )
}

#[must_use]
pub fn resolve_with_module(
    syntax_tree: &SyntaxTree,
    source_text: &str,
    program: NodeIdentifier,
    module: Option<NodeIdentifier>,
    compiler_syntax_tree: &CompilerSyntaxTree,
) -> Resolution {
    let mut host = Vec::new();
    roots::template_roots(compiler_syntax_tree, compiler_syntax_tree.root, &mut host);
    let sem = scope::analyze_enclosed(syntax_tree, module, program, &host);
    let subscribed = runes::subscribed(syntax_tree, source_text, &sem, program, module);
    let bindings = classify::classify(
        syntax_tree,
        &sem,
        &subscribed,
        program,
        module,
        compiler_syntax_tree,
    );
    Resolution {
        uses_props: has_props_rune(syntax_tree, &sem, &subscribed, program),
        sem,
        bindings,
        subscribed,
    }
}

/// The identifiers a binding pattern declares.
pub fn for_each_pattern_identifier(
    syntax_tree: &SyntaxTree,
    p: NodeIdentifier,
    f: &mut impl FnMut(NodeIdentifier),
) {
    match syntax_tree.kind(p) {
        Kind::Identifier(_) => f(p),
        Kind::ObjectPattern(props) => {
            for &pr in props {
                match syntax_tree.kind(pr) {
                    Kind::Property { value, .. } => {
                        for_each_pattern_identifier(syntax_tree, value, f);
                    }
                    Kind::Rest(a) => for_each_pattern_identifier(syntax_tree, a, f),
                    _ => {}
                }
            }
        }
        Kind::ArrayPattern(items) => {
            for &it in items {
                for_each_pattern_identifier(syntax_tree, it, f);
            }
        }
        Kind::AssignPattern(l, _) | Kind::Rest(l) => for_each_pattern_identifier(syntax_tree, l, f),
        _ => {}
    }
}

impl Resolution {
    /// Upstream `get_rune`: the rune the call `e` makes, with its first argument. A callee whose
    /// root is a binding, or a store subscription such as `$state` beside a `state`, makes none.
    #[must_use]
    pub fn rune(
        &self,
        syntax_tree: &SyntaxTree,
        e: NodeIdentifier,
    ) -> Option<(&'static str, Option<NodeIdentifier>)> {
        runes::rune(syntax_tree, &self.sem, &self.subscribed, e)
    }

    /// Whether the unbound reference `name` subscribes to a store (upstream analysis's synthetic
    /// `store_sub` binding): any `$name` but `$` and `$$name`, unless it names a rune.
    #[must_use]
    pub fn is_store_subscription(&self, name: &str) -> bool {
        name.strip_prefix('$')
            .is_some_and(|store| !store.is_empty() && !store.starts_with('$'))
            && (!RUNES.contains(&name) || self.subscribed.contains(&name))
    }

    #[must_use]
    pub fn binding(
        &self,
        ident: NodeIdentifier,
    ) -> Option<(BindingIdentifier, &BindingInformation)> {
        let b = self.sem.binding_of(ident)?;
        Some((b, &self.bindings[b]))
    }

    /// Upstream `is_state_source`: in runes mode a `$state` needs a signal only if it is
    /// reassigned.
    #[must_use]
    pub fn is_state_source(&self, b: BindingIdentifier) -> bool {
        let info = &self.bindings[b];
        matches!(info.kind, BindingKind::State | BindingKind::RawState)
            && self.sem.bindings[b].writes > 0
    }

    /// Upstream `is_prop_source`, runes mode.
    #[must_use]
    pub fn is_prop_source(&self, b: BindingIdentifier) -> bool {
        let info = &self.bindings[b];
        let s = &self.sem.bindings[b];
        matches!(
            info.kind,
            BindingKind::Property | BindingKind::BindableProperty
        ) && (s.writes > 0 || info.initial.is_some() || s.mutations > 0)
    }

    /// Upstream `should_proxy`: whether `$state(e)` makes a deep proxy of `e`'s value.
    #[must_use]
    pub fn should_proxy(&self, syntax_tree: &SyntaxTree, e: NodeIdentifier) -> bool {
        proxyable(syntax_tree, Some(self), e)
    }

    /// Evaluates `e` of the component's own tree.
    #[must_use]
    pub fn evaluate(
        &self,
        syntax_tree: &SyntaxTree,
        source_text: &str,
        e: NodeIdentifier,
    ) -> crate::semantic::evaluate::Evaluation {
        crate::semantic::evaluate::Evaluator::new(syntax_tree, source_text, self)
            .evaluate(crate::semantic::evaluate::Tree::Source, e)
    }

    /// Evaluates `e` of a lowered tree, resolving names in `scope`.
    #[must_use]
    pub fn evaluate_output(
        &self,
        source: &SyntaxTree,
        source_text: &str,
        out: &SyntaxTree,
        e: NodeIdentifier,
        scope: scope::ScopeIdentifier,
    ) -> crate::semantic::evaluate::Evaluation {
        crate::semantic::evaluate::Evaluator::new(source, source_text, self)
            .evaluate(crate::semantic::evaluate::Tree::Output(out, scope), e)
    }
}

/// `res` is `None` for a binding's initial value, which upstream checks without a scope.
fn proxyable(syntax_tree: &SyntaxTree, res: Option<&Resolution>, e: NodeIdentifier) -> bool {
    match syntax_tree.kind(e) {
        Kind::String
        | Kind::Regex { .. }
        | Kind::BigInt
        | Kind::Number(_)
        | Kind::Boolean(_)
        | Kind::Null
        | Kind::Template { .. }
        | Kind::Arrow { .. }
        | Kind::Unary(..)
        | Kind::Binary(..)
        | Kind::Function {
            declaration: false, ..
        } => false,
        Kind::Identifier(_) if syntax_tree.name(e) == "undefined" => false,
        Kind::Identifier(_) => {
            let Some(res) = res else {
                return true;
            };
            let Some((b, info)) = res.binding(e) else {
                return true;
            };
            let s = &res.sem.bindings[b];
            if s.writes > 0 {
                return true;
            }
            // Analysis rewires a prop's initial from `$props()` to its default.
            let initial = match info.kind {
                BindingKind::Property
                | BindingKind::BindableProperty
                | BindingKind::RestProperty => info.initial,
                _ => s.initializer(syntax_tree),
            };
            initial.is_none_or(|initializer| proxyable(syntax_tree, None, initializer))
        }
        _ => true,
    }
}

fn has_props_rune(
    syntax_tree: &SyntaxTree,
    sem: &Semantic,
    subscribed: &[&str],
    program: NodeIdentifier,
) -> bool {
    let Kind::Program(body) = syntax_tree.kind(program) else {
        unreachable!("a script parses to a program")
    };
    body.iter()
        .any(|&statement| match syntax_tree.kind(statement) {
            Kind::VariableDeclaration { declarations, .. } => declarations.iter().any(|&d| {
                let Kind::Declarator {
                    initializer: Some(i),
                    ..
                } = syntax_tree.kind(d)
                else {
                    return false;
                };
                runes::rune(syntax_tree, sem, subscribed, i).is_some_and(|(r, _)| r == "$props")
            }),
            _ => false,
        })
}
