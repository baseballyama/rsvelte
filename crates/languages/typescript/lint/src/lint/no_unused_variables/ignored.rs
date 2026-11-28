//! What `no-unused-vars`'s options make of a name before its uses are read.

use oxc_ast::AstKind;
use oxc_ast::ast::{BindingIdentifier, BindingPattern, ClassElement};
use oxc_semantic::{NodeId, SymbolId};
use rustc_hash::FxHashSet;

use super::options::{Args, CaughtErrors, IgnorePattern, NoUnusedVariablesOptions};
use super::{Facts, parameter_function};

/// What the options make of a symbol before its uses are read.
pub(super) enum Filtered {
    Kept,
    Skipped,
    /// A pattern ignores it, as the kind of name it describes.
    Ignored(Described),
}

/// The kinds of name the rule's messages and ignore patterns tell apart.
#[derive(Clone, Copy)]
pub(super) enum Described {
    ArrayElement,
    CaughtError,
    Arg,
    Var,
}

impl Described {
    pub(super) const fn of(
        self,
        options: &NoUnusedVariablesOptions,
    ) -> (&'static str, Option<&IgnorePattern>) {
        match self {
            Self::ArrayElement => (
                "elements of array destructuring",
                options.destructured_array_ignore_pattern.as_ref(),
            ),
            Self::CaughtError => (
                "caught errors",
                options.caught_errors_ignore_pattern.as_ref(),
            ),
            Self::Arg => ("args", options.args_ignore_pattern.as_ref()),
            Self::Var => ("vars", options.vars_ignore_pattern.as_ref()),
        }
    }
}

/// `collectUnusedVariables`'s checks of the options, in its order.
pub(super) fn filter(
    f: &Facts<'_>,
    options: &NoUnusedVariablesOptions,
    symbol: SymbolId,
    declaration: NodeId,
    marked: &FxHashSet<SymbolId>,
) -> Filtered {
    let name = f.scoping.symbol_name(symbol);
    let matches =
        |pattern: &Option<IgnorePattern>| pattern.as_ref().is_some_and(|p| p.matches(name));
    let in_array = || {
        declared_in(f, symbol, |n| matches!(f.kind(n), AstKind::ArrayPattern(_)))
            || referenced_in(f, symbol, |n| {
                matches!(f.kind(n), AstKind::ArrayAssignmentTarget(_))
            })
    };
    if matches(&options.destructured_array_ignore_pattern) && in_array() {
        return Filtered::Ignored(Described::ArrayElement);
    }
    match f.kind(declaration) {
        AstKind::Class(class)
            if options.ignore_class_with_static_init_block
                && (class.body.body.iter()).any(|e| matches!(e, ClassElement::StaticBlock(_))) =>
        {
            return Filtered::Skipped;
        }
        AstKind::CatchParameter(_) => {
            if options.caught_errors == CaughtErrors::None {
                return Filtered::Skipped;
            }
            if matches(&options.caught_errors_ignore_pattern) {
                return Filtered::Ignored(Described::CaughtError);
            }
        }
        AstKind::FormalParameter(_) | AstKind::FormalParameterRest(_) => {
            if options.args == Args::None {
                return Filtered::Skipped;
            }
            if matches(&options.args_ignore_pattern) {
                return Filtered::Ignored(Described::Arg);
            }
            if options.args == Args::AfterUsed
                && is_plain_parameter(f, symbol, declaration)
                && !is_after_last_used_parameter(f, declaration, marked)
            {
                return Filtered::Skipped;
            }
        }
        _ if matches(&options.vars_ignore_pattern) => return Filtered::Ignored(Described::Var),
        AstKind::VariableDeclarator(_)
            if options.ignore_using_declarations
                && f.parent(declaration).is_some_and(
                    |d| matches!(f.kind(d), AstKind::VariableDeclaration(d) if d.kind.is_using()),
                ) =>
        {
            return Filtered::Skipped;
        }
        _ => {}
    }
    if options.ignore_rest_siblings
        && (declared_in(f, symbol, |n| has_rest_sibling(f, n))
            || referenced_in(f, symbol, |n| has_rest_sibling(f, n)))
    {
        return Filtered::Skipped;
    }
    Filtered::Kept
}

/// The kind of name a message about `symbol` describes: `getVariableDescription` of its first
/// definition.
pub(super) fn described_by_declaration(
    f: &Facts<'_>,
    options: &NoUnusedVariablesOptions,
    symbol: SymbolId,
    declaration: NodeId,
) -> Described {
    if options.destructured_array_ignore_pattern.is_some()
        && declared_in(f, symbol, |n| matches!(f.kind(n), AstKind::ArrayPattern(_)))
    {
        return Described::ArrayElement;
    }
    match f.kind(declaration) {
        AstKind::CatchParameter(_) => Described::CaughtError,
        AstKind::FormalParameter(_) | AstKind::FormalParameterRest(_) => Described::Arg,
        _ => Described::Var,
    }
}

/// Whether the parent of the name that declares `symbol` passes `test`.
fn declared_in(f: &Facts<'_>, symbol: SymbolId, test: impl Fn(NodeId) -> bool) -> bool {
    f.identifiers[symbol.index()]
        .and_then(|identifier| f.parent(identifier))
        .is_some_and(test)
}

/// Whether the parent of a reference to `symbol` passes `test`.
fn referenced_in(f: &Facts<'_>, symbol: SymbolId, test: impl Fn(NodeId) -> bool) -> bool {
    (f.scoping.get_resolved_reference_ids(symbol).iter()).any(|&id| {
        f.parent(f.scoping.get_reference(id).node_id())
            .is_some_and(&test)
    })
}

/// `hasRestSibling`: a property of an object pattern that ends in a rest element.
fn has_rest_sibling(f: &Facts<'_>, node: NodeId) -> bool {
    let property = matches!(
        f.kind(node),
        AstKind::BindingProperty(_)
            | AstKind::AssignmentTargetPropertyIdentifier(_)
            | AstKind::AssignmentTargetPropertyProperty(_)
    );
    property
        && f.parent(node).is_some_and(|pattern| match f.kind(pattern) {
            AstKind::ObjectPattern(pattern) => pattern.rest.is_some(),
            AstKind::ObjectAssignmentTarget(target) => target.rest.is_some(),
            _ => false,
        })
}

/// `isFunction(def.name.parent)`: the parameter is the bare name, with no pattern, default or
/// rest around it, of a function with a body.
fn is_plain_parameter(f: &Facts<'_>, symbol: SymbolId, parameter: NodeId) -> bool {
    let with_body =
        parameter_function(f, parameter).is_some_and(|function| match f.kind(function) {
            AstKind::Function(function) => function.body.is_some(),
            AstKind::ArrowFunctionExpression(_) => true,
            _ => false,
        });
    match f.kind(parameter) {
        AstKind::FormalParameter(p) => {
            with_body
                && p.initializer.is_none()
                && matches!(&p.pattern, BindingPattern::BindingIdentifier(i) if i.symbol_id.get() == Some(symbol))
        }
        _ => false,
    }
}

/// `isAfterLastUsedArg`: no later parameter of the same function has a reference or is marked
/// used, where a default value is a write reference to each name its pattern declares.
fn is_after_last_used_parameter(
    f: &Facts<'_>,
    parameter: NodeId,
    marked: &FxHashSet<SymbolId>,
) -> bool {
    let Some(AstKind::FormalParameters(list)) = f.parent(parameter).map(|list| f.kind(list)) else {
        return true;
    };
    let after = f.span(parameter).end;
    let mut later = list
        .items
        .iter()
        .filter(|item| item.span.start >= after)
        .map(|item| &item.pattern)
        .chain(list.rest.as_ref().map(|rest| &rest.rest.argument));
    let mut unused = |identifier: &BindingIdentifier<'_>| {
        identifier.symbol_id.get().is_none_or(|symbol| {
            f.scoping.get_resolved_reference_ids(symbol).is_empty()
                && !marked.contains(&symbol)
                && !f.identifiers[symbol.index()]
                    .iter()
                    .any(|&identifier| f.written_where_declared(identifier))
        })
    };
    later.all(|pattern| pattern.all_binding_identifiers(&mut unused))
}
