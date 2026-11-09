//! What legacy reactivity declares beyond the scripts' scopes.
//!
//! A `$:` assignment declares a name nothing else declares, and `$name` subscribes to the store
//! `name`; upstream's analysis gives them `legacy_reactive` and `store_sub` bindings.

use rsvelte_kernel::source::interning::Atom;
use rsvelte_typescript_semantic::scope::{BindingIdentifier, ScopeIdentifier, Semantic};
use rsvelte_typescript_syntax::syntax_tree::Control;
use rsvelte_typescript_syntax::{Kind, NodeIdentifier, SyntaxTree};
use rustc_hash::FxHashMap;

use super::resolve::for_each_pattern_identifier;

/// A top-level variable: one a script declares, or one a `$:` assignment declares.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum Variable {
    Declared(BindingIdentifier),
    /// An index into [`Legacy::implicit`].
    Implicit(u32),
}

/// What a reference refers to among the top-level variables.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct TopLevel {
    pub variable: Variable,
    /// `$name` reads the store `name`.
    pub store: bool,
}

/// A variable a `$:` assignment declares.
#[derive(Clone, Copy, Debug)]
pub struct Implicit {
    pub name: Atom,
    /// The first assigned identifier.
    pub identifier: NodeIdentifier,
    /// The assignment of the first `$:` statement that assigns it.
    pub assignment: NodeIdentifier,
}

#[derive(Debug)]
pub struct Legacy {
    /// The top-level `$:` statements of the scripts, in source order.
    pub reactive_statements: Vec<NodeIdentifier>,
    pub implicit: Vec<Implicit>,
    /// Per reference of the [`Semantic`] (same index), the top-level variable it refers to.
    pub references: Vec<Option<TopLevel>>,
}

impl Legacy {
    /// The facts of the `programs` (module script first, then instance) resolved by `sem`.
    #[must_use]
    pub fn new(syntax_tree: &SyntaxTree, sem: &Semantic, programs: &[NodeIdentifier]) -> Self {
        let mut reactive_statements = Vec::new();
        for &program in programs {
            let Kind::Program(body) = syntax_tree.kind(program) else {
                continue;
            };
            reactive_statements.extend(
                body.iter()
                    .copied()
                    .filter(|&statement| reactive_body(syntax_tree, statement).is_some()),
            );
        }
        let mut implicit = Vec::new();
        let mut by_name: FxHashMap<Atom, u32> = FxHashMap::default();
        for &statement in &reactive_statements {
            let Some(body) = reactive_body(syntax_tree, statement) else {
                continue;
            };
            let Kind::ExpressionStatement(assignment) = syntax_tree.kind(body) else {
                continue;
            };
            let Kind::Assign(_, left, _) = syntax_tree.kind(assignment) else {
                continue;
            };
            for_each_pattern_identifier(syntax_tree, left, &mut |identifier| {
                if sem.binding_of(identifier).is_some() {
                    return;
                }
                let Some(name) = syntax_tree.atom(identifier) else {
                    return;
                };
                by_name.entry(name).or_insert_with(|| {
                    implicit.push(Implicit {
                        name,
                        identifier,
                        assignment,
                    });
                    implicit.len() as u32 - 1
                });
            });
        }
        let top_level = |name: Atom| -> Option<Variable> {
            if let Some(&index) = by_name.get(&name) {
                return Some(Variable::Implicit(index));
            }
            let binding = sem.root_binding(name)?;
            is_top_level(sem, sem.bindings[binding].scope).then_some(Variable::Declared(binding))
        };
        let references = sem
            .references
            .iter()
            .map(|reference| {
                if let Some(binding) = reference.binding {
                    return is_top_level(sem, sem.bindings[binding].scope).then_some(TopLevel {
                        variable: Variable::Declared(binding),
                        store: false,
                    });
                }
                let name = syntax_tree.atom(reference.node)?;
                if let Some(variable) = by_name.get(&name) {
                    return Some(TopLevel {
                        variable: Variable::Implicit(*variable),
                        store: false,
                    });
                }
                let store = syntax_tree.atoms.get(name).strip_prefix('$')?;
                if store.starts_with('$') {
                    return None;
                }
                Some(TopLevel {
                    variable: top_level(syntax_tree.atoms.lookup(store)?)?,
                    store: true,
                })
            })
            .collect();
        Self {
            reactive_statements,
            implicit,
            references,
        }
    }
}

/// The body of a `$: body` statement.
#[must_use]
pub fn reactive_body(
    syntax_tree: &SyntaxTree,
    statement: NodeIdentifier,
) -> Option<NodeIdentifier> {
    match syntax_tree.kind(statement) {
        Kind::Control(Control::Labeled { label, body }) if syntax_tree.name(label) == "$" => {
            Some(body)
        }
        _ => None,
    }
}

/// The instance script's scope or the module script's, which encloses it.
#[must_use]
pub fn is_top_level(sem: &Semantic, scope: ScopeIdentifier) -> bool {
    scope == ScopeIdentifier::ROOT || sem.scopes[scope].parent.is_none()
}

#[cfg(test)]
mod tests;
