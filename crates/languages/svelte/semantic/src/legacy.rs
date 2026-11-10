//! What legacy reactivity declares beyond the scripts' scopes.
//!
//! A `$:` assignment declares a name nothing else declares, and `$name` subscribes to the store
//! `name`; upstream's analysis gives them `legacy_reactive` and `store_sub` bindings.

use oxc_ast::ast::{
    AssignmentTarget, AssignmentTargetMaybeDefault, AssignmentTargetProperty, Expression, Statement,
};
use oxc_semantic::{ScopeId, SymbolId};
use oxc_span::Span;
use rsvelte_typescript_tree::{ProgramIdentifier, Tree};
use rustc_hash::FxHashMap;

use crate::resolve::Resolution;

/// A top-level variable: one a script declares, or one a `$:` assignment declares.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum Variable {
    Declared(SymbolId),
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

/// A statement of a script, by its position in the program's body.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct StatementPosition {
    pub program: ProgramIdentifier,
    pub index: u32,
}

impl StatementPosition {
    #[must_use]
    pub fn get(self, tree: &Tree) -> &Statement<'_> {
        &tree.get_program(self.program).body[self.index as usize]
    }
}

/// A variable a `$:` assignment declares.
#[derive(Clone, Debug)]
pub struct Implicit {
    pub name: Box<str>,
    /// The first assigned identifier.
    pub identifier: Span,
    /// The first `$:` statement that assigns it.
    pub statement: StatementPosition,
}

#[derive(Debug)]
pub struct Legacy {
    /// The top-level `$:` statements of the scripts, in source order.
    pub reactive_statements: Vec<StatementPosition>,
    pub implicit: Vec<Implicit>,
    /// Per reference of the analysis (indexed by its id), the top-level variable it refers to.
    pub references: Vec<Option<TopLevel>>,
}

impl Legacy {
    /// The facts of the `programs` (module script first, then instance) that `res` resolved.
    ///
    /// # Panics
    ///
    /// When a program has `u32::MAX` statements or more.
    #[must_use]
    pub fn new(res: &Resolution, programs: &[ProgramIdentifier]) -> Self {
        let tree = res.tree();
        let mut reactive_statements = Vec::new();
        for &program in programs {
            let body = &tree.get_program(program).body;
            reactive_statements.extend(
                body.iter()
                    .enumerate()
                    .filter(|(_, statement)| reactive_body(statement).is_some())
                    .map(|(index, _)| StatementPosition {
                        program,
                        index: u32::try_from(index)
                            .expect("a program has fewer than u32::MAX statements"),
                    }),
            );
        }
        let mut implicit = Vec::new();
        let mut by_name: FxHashMap<&str, u32> = FxHashMap::default();
        for &position in &reactive_statements {
            let Some(Statement::ExpressionStatement(statement)) = reactive_body(position.get(tree))
            else {
                continue;
            };
            let Expression::AssignmentExpression(assignment) = &statement.expression else {
                continue;
            };
            for_each_assigned_identifier(&assignment.left, &mut |identifier| {
                if res.symbol(identifier).is_some() {
                    return;
                }
                let name = identifier.name.as_str();
                by_name.entry(name).or_insert_with(|| {
                    implicit.push(Implicit {
                        name: name.into(),
                        identifier: identifier.span,
                        statement: position,
                    });
                    u32::try_from(implicit.len() - 1).expect("fewer than u32::MAX names")
                });
            });
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
            reactive_statements,
            implicit,
            references,
        }
    }
}

/// The identifiers an assignment's target assigns, in source order.
fn for_each_assigned_identifier<'a>(
    target: &'a AssignmentTarget<'a>,
    f: &mut impl FnMut(&'a oxc_ast::ast::IdentifierReference<'a>),
) {
    match target {
        AssignmentTarget::AssignmentTargetIdentifier(identifier) => f(identifier),
        AssignmentTarget::ArrayAssignmentTarget(array) => {
            for element in array.elements.iter().flatten() {
                maybe_default(element, f);
            }
            if let Some(rest) = &array.rest {
                for_each_assigned_identifier(&rest.target, f);
            }
        }
        AssignmentTarget::ObjectAssignmentTarget(object) => {
            for property in &object.properties {
                match property {
                    AssignmentTargetProperty::AssignmentTargetPropertyIdentifier(p) => {
                        f(&p.binding);
                    }
                    AssignmentTargetProperty::AssignmentTargetPropertyProperty(p) => {
                        maybe_default(&p.binding, f);
                    }
                }
            }
            if let Some(rest) = &object.rest {
                for_each_assigned_identifier(&rest.target, f);
            }
        }
        _ => {}
    }
}

fn maybe_default<'a>(
    target: &'a AssignmentTargetMaybeDefault<'a>,
    f: &mut impl FnMut(&'a oxc_ast::ast::IdentifierReference<'a>),
) {
    match target {
        AssignmentTargetMaybeDefault::AssignmentTargetWithDefault(d) => {
            for_each_assigned_identifier(&d.binding, f);
        }
        target => {
            if let Some(target) = target.as_assignment_target() {
                for_each_assigned_identifier(target, f);
            }
        }
    }
}

/// The body of a `$: body` statement.
#[must_use]
pub fn reactive_body<'s, 'a>(statement: &'s Statement<'a>) -> Option<&'s Statement<'a>> {
    match statement {
        Statement::LabeledStatement(labeled) if labeled.label.name == "$" => Some(&labeled.body),
        _ => None,
    }
}

/// The instance script's scope or the module script's, which encloses it.
#[must_use]
pub fn is_top_level(res: &Resolution, scope: ScopeId) -> bool {
    scope == res.instance_scope() || scope == res.scoping().root_scope_id()
}

#[cfg(test)]
mod tests;
