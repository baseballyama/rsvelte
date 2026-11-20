//! What the rules on legacy reactivity share: its facts, and how the template uses expressions.
//!
//! A `$:` assignment declares a name nothing else declares, and `$name` subscribes to the store
//! `name`; upstream's analysis gives them `legacy_reactive` and `store_sub` bindings.

use oxc_ast::ast::Statement;
use oxc_semantic::{NodeId, ScopeId, SymbolId};
use rsvelte_kernel::computation::database::{Artifact, DocumentContext};
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_semantic::legacy::{for_each_reactive_assignee, reactive_body};
use rsvelte_svelte_semantic::resolve::Resolution;
use rsvelte_svelte_syntax::syntax_tree::{AttributeKind, AttributeValue, Part};
use rsvelte_typescript_semantic::semantic::Semantic;
use rsvelte_typescript_tree::{ProgramIdentifier, Tree};
use rustc_hash::FxHashMap;

use crate::computation::Linted;
use crate::rule::File;

/// The component's legacy reactivity: the variables `$:` assignments declare, and store
/// subscriptions.
#[derive(Debug)]
pub(crate) struct LegacyReactivity;

impl Artifact for LegacyReactivity {
    type Output = Legacy;

    const NAME: &'static str = "svelte.lint.legacy_reactivity";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let linted = Linted::of(context).expect("lint requests legacy reactivity after parsing");
        let component = linted.component;
        let programs: Vec<ProgramIdentifier> =
            component.scripts().map(|script| script.program).collect();
        Legacy::new(linted.resolution(), &programs)
    }
}

/// The component's legacy reactivity facts.
pub(crate) fn legacy<'a>(file: &File<'a>) -> &'a Legacy {
    file.context.get::<LegacyReactivity>()
}

/// The expression of each `bind:` directive, written out or shorthand, with the directive's span.
pub(crate) fn bindings(file: &File<'_>) -> FxHashMap<NodeId, Span> {
    let component = file.component().expect("a component's bindings");
    // Analyzed first, so that the ids are the analysis's.
    let _analyzed: &Semantic = file.semantic();
    let javascript = &component.javascript;
    component
        .attributes
        .iter()
        .filter(|attribute| attribute.kind == AttributeKind::Bind)
        .filter_map(|attribute| {
            let AttributeValue::Parts(parts) = attribute.value else {
                return None;
            };
            match component.parts(parts) {
                [Part::Expression { expression, .. }] => Some((
                    javascript.get_expression(*expression).node_id(),
                    attribute.span,
                )),
                _ => None,
            }
        })
        .collect()
}

/// A top-level variable: one a script declares, or one a `$:` assignment declares.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub(crate) enum Variable {
    Declared(SymbolId),
    /// An index into [`Legacy::implicit`].
    Implicit(u32),
}

/// What a reference refers to among the top-level variables.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub(crate) struct TopLevel {
    pub(crate) variable: Variable,
    /// `$name` reads the store `name`.
    pub(crate) store: bool,
}

/// A statement of a script, by its position in the program's body.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub(crate) struct StatementPosition {
    pub(crate) program: ProgramIdentifier,
    pub(crate) index: u32,
}

impl StatementPosition {
    #[must_use]
    pub(crate) fn get(self, tree: &Tree) -> &Statement<'_> {
        &tree.get_program(self.program).body[self.index as usize]
    }
}

/// A variable a `$:` assignment declares.
#[derive(Clone, Debug)]
pub(crate) struct Implicit {
    pub(crate) name: Box<str>,
    /// The first assigned identifier.
    pub(crate) identifier: oxc_span::Span,
    /// The first `$:` statement that assigns it.
    pub(crate) statement: StatementPosition,
}

#[derive(Debug)]
pub(crate) struct Legacy {
    pub(crate) implicit: Vec<Implicit>,
    /// Per reference of the analysis (indexed by its id), the top-level variable it refers to.
    pub(crate) references: Vec<Option<TopLevel>>,
}

impl Legacy {
    /// The facts of the `programs` (module script first, then instance) that `res` resolved.
    ///
    /// # Panics
    ///
    /// When a program has `u32::MAX` statements or more.
    #[must_use]
    pub(crate) fn new(res: &Resolution, programs: &[ProgramIdentifier]) -> Self {
        let tree = res.tree();
        let mut implicit = Vec::new();
        let mut by_name: FxHashMap<&str, u32> = FxHashMap::default();
        for &program in programs {
            for (index, statement) in tree.get_program(program).body.iter().enumerate() {
                let Some(body) = reactive_body(statement) else {
                    continue;
                };
                let statement = StatementPosition {
                    program,
                    index: u32::try_from(index)
                        .expect("a program has fewer than u32::MAX statements"),
                };
                for_each_reactive_assignee(body, &mut |identifier| {
                    if res.symbol(identifier).is_some() {
                        return;
                    }
                    let name = identifier.name.as_str();
                    by_name.entry(name).or_insert_with(|| {
                        implicit.push(Implicit {
                            name: name.into(),
                            identifier: identifier.span,
                            statement,
                        });
                        u32::try_from(implicit.len() - 1).expect("fewer than u32::MAX names")
                    });
                });
            }
        }
        let scoping = res.scoping();
        let is_top = |symbol: SymbolId| is_top_level(res, scoping.symbol_scope_id(symbol));
        let top_level = |name: &str| -> Option<Variable> {
            if let Some(&index) = by_name.get(name) {
                return Some(Variable::Implicit(index));
            }
            let symbol = scoping.find_binding(res.instance_scope(), name.into())?;
            is_top(symbol).then_some(Variable::Declared(symbol))
        };
        let mut references = vec![None; scoping.references_len()];
        for symbol in scoping.symbol_ids() {
            let top = is_top(symbol).then_some(TopLevel {
                variable: Variable::Declared(symbol),
                store: false,
            });
            for &reference in scoping.get_resolved_reference_ids(symbol) {
                references[reference.index()] = top;
            }
        }
        for (name, ids) in scoping.root_unresolved_references() {
            let name = name.as_str();
            let top = if let Some(&variable) = by_name.get(name) {
                Some(TopLevel {
                    variable: Variable::Implicit(variable),
                    store: false,
                })
            } else {
                name.strip_prefix('$')
                    .filter(|store| !store.starts_with('$'))
                    .and_then(|store| {
                        Some(TopLevel {
                            variable: top_level(store)?,
                            store: true,
                        })
                    })
            };
            for &reference in ids {
                references[reference.index()] = top;
            }
        }
        Self {
            implicit,
            references,
        }
    }
}

/// The instance script's scope or the module script's, which encloses it.
#[must_use]
pub(crate) fn is_top_level(res: &Resolution, scope: ScopeId) -> bool {
    scope == res.instance_scope() || scope == res.scoping().root_scope_id()
}

#[cfg(test)]
mod tests;
