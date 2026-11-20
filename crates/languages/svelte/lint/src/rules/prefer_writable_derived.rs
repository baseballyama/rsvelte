use oxc_ast::AstKind;
use oxc_ast::ast::{
    Argument, AssignmentOperator, AssignmentTarget, CallExpression, Expression,
    IdentifierReference, Statement,
};
use rsvelte_lint_runner::catalog::Category;
use rsvelte_lint_runner::finding::{Fix, Suggestion};
use rsvelte_lint_runner::rule::{Report, Reporter};

use super::shared::nodes::{is_named, only_statement, span, text};
use super::shared::runes::runes_or_undetermined;
use crate::rule::{File, Files, RuleDefinition, SvelteRule, without_options};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/prefer-writable-derived",
    files: Files::All,
    category: Category::Correctness,
    configure: without_options::<PreferWritableDerived>,
};

#[derive(Debug, Default)]
struct PreferWritableDerived;

impl SvelteRule for PreferWritableDerived {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        if !runes_or_undetermined(file) {
            return;
        }
        let source = file.source();
        let semantic = file.semantic();
        let scoping = semantic.scoping();
        for node in file.nodes().iter() {
            let AstKind::CallExpression(call) = node.kind() else {
                continue;
            };
            let Some((target, value)) = effect_assignment(call) else {
                continue;
            };
            let Some(symbol) = target
                .reference_id
                .get()
                .and_then(|reference| scoping.get_reference(reference).symbol_id())
            else {
                continue;
            };
            let AstKind::VariableDeclarator(declarator) =
                semantic.nodes().kind(scoping.symbol_declaration(symbol))
            else {
                continue;
            };
            let Some(initializer @ Expression::CallExpression(state)) = &declarator.init else {
                continue;
            };
            if !is_named(&state.callee, "$state") {
                continue;
            }
            let mut fix = Fix::replace(
                span(initializer),
                format!("$derived({})", text(value, source)),
            );
            fix.push(span(call), "");
            reporter.report(
                Report::range(
                    "Prefer using writable $derived instead of $state and $effect",
                    span(declarator),
                )
                .suggest(Suggestion {
                    message: "Rewrite $state and $effect to $derived".to_owned(),
                    fix,
                }),
            );
        }
    }
}

/// `$effect(() => { target = value; })` or `$effect.pre(…)` → (`target`, `value`).
fn effect_assignment<'a>(
    call: &'a CallExpression<'a>,
) -> Option<(&'a IdentifierReference<'a>, &'a Expression<'a>)> {
    let [argument] = call.arguments.as_slice() else {
        return None;
    };
    let is_effect = match &call.callee {
        callee @ Expression::Identifier(_) => is_named(callee, "$effect"),
        Expression::StaticMemberExpression(member) => {
            is_named(&member.object, "$effect") && member.property.name == "pre"
        }
        Expression::ComputedMemberExpression(member) => {
            is_named(&member.object, "$effect") && is_named(&member.expression, "pre")
        }
        _ => false,
    };
    if !is_effect {
        return None;
    }
    let body = match argument {
        Argument::ArrowFunctionExpression(arrow)
            if arrow.params.items.is_empty() && arrow.params.rest.is_none() =>
        {
            arrow.body.as_function_body()?
        }
        Argument::FunctionExpression(function)
            if function.params.items.is_empty() && function.params.rest.is_none() =>
        {
            function.body.as_deref()?
        }
        _ => return None,
    };
    let Statement::ExpressionStatement(statement) = only_statement(body)? else {
        return None;
    };
    match &statement.expression {
        Expression::AssignmentExpression(assignment)
            if assignment.operator == AssignmentOperator::Assign =>
        {
            match &assignment.left {
                AssignmentTarget::AssignmentTargetIdentifier(target) => {
                    Some((target, &assignment.right))
                }
                _ => None,
            }
        }
        _ => None,
    }
}
