//! Legacy syntax: what makes a component a legacy one, and the names a `$:` assignment declares
//! that nothing else declares (upstream's `legacy_reactive` bindings).

use oxc_ast::ast::{
    AssignmentTarget, AssignmentTargetMaybeDefault, AssignmentTargetProperty, Declaration,
    Expression, Statement, VariableDeclarationKind,
};
use rsvelte_svelte_syntax::syntax_tree::Component;

use crate::resolve::Resolution;

/// Whether a top-level `$:` assignment of `body` declares `name`, as upstream's scopes do for an
/// assigned name that `bound` says nothing declares.
pub(crate) fn declares_implicitly(
    body: &[Statement<'_>],
    name: &str,
    bound: impl Fn(&oxc_ast::ast::IdentifierReference<'_>) -> bool,
) -> bool {
    body.iter().filter_map(reactive_body).any(|statement| {
        let mut found = false;
        for_each_reactive_assignee(statement, &mut |identifier| {
            found |= identifier.name == name && !bound(identifier);
        });
        found
    })
}

/// The identifiers that `$: body` assigns when `body` is an assignment, in source order.
pub fn for_each_reactive_assignee<'a>(
    body: &'a Statement<'a>,
    f: &mut impl FnMut(&'a oxc_ast::ast::IdentifierReference<'a>),
) {
    if let Statement::ExpressionStatement(statement) = body
        && let Expression::AssignmentExpression(assignment) = &statement.expression
    {
        for_each_assigned_identifier(&assignment.left, f);
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

/// The syntax that makes a component in legacy mode (`runes` false) a legacy component, as runes
/// mode rejects it: an `export let`, a `$:`, `$$props`, `$$restProps` or `runes={false}`.
#[must_use]
pub fn legacy_syntax(
    component: &Component,
    resolution: &Resolution,
    source: &str,
    runes: bool,
) -> Option<&'static str> {
    if runes {
        return None;
    }
    if component.svelte_option(source, "runes").is_some() {
        return Some("<svelte:options runes={false}>");
    }
    let tree = &component.javascript;
    for statement in component
        .instance
        .iter()
        .flat_map(|script| &tree.get_program(script.program).body)
    {
        if reactive_body(statement).is_some() {
            return Some("$:");
        }
        if let Statement::ExportDeclaration(export) = statement
            && let Declaration::VariableDeclaration(declaration) = &export.declaration
            && declaration.kind != VariableDeclarationKind::Const
        {
            return Some("export let");
        }
    }
    resolution
        .unbound(|name| matches!(name, "$$props" | "$$restProps"))
        .map(|(name, _)| {
            if name == "$$props" {
                "$$props"
            } else {
                "$$restProps"
            }
        })
        .next()
}

#[cfg(test)]
mod tests;
