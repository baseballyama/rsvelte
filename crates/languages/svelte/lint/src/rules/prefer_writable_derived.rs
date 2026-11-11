use rsvelte_lint_runner::finding::{Fix, Suggestion};
use rsvelte_lint_runner::rule::{Report, Reporter};
use oxc_ast::AstKind;
use oxc_ast::ast::{
    Argument, AssignmentOperator, AssignmentTarget, CallExpression, Expression, FunctionBody,
    IdentifierReference, Statement,
};

use super::javascript::walk;
use super::nodes::{is_named, span, text};
use super::runes::runes_or_undetermined;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/prefer-writable-derived",
    files: Files::All,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(PreferWritableDerived))
}

#[derive(Debug)]
struct PreferWritableDerived;

impl SvelteRule for PreferWritableDerived {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        if !runes_or_undetermined(file) {
            return;
        }
        let source = file.source();
        let semantic = file.semantic();
        let scoping = semantic.scoping();
        walk(file, |node| {
            let AstKind::CallExpression(call) = node.kind() else {
                return;
            };
            let Some((target, value)) = effect_assignment(call) else {
                return;
            };
            let Some(symbol) = target
                .reference_id
                .get()
                .and_then(|reference| scoping.get_reference(reference).symbol_id())
            else {
                return;
            };
            let AstKind::VariableDeclarator(declarator) =
                semantic.nodes().kind(scoping.symbol_declaration(symbol))
            else {
                return;
            };
            let Some(initializer @ Expression::CallExpression(state)) = &declarator.init else {
                return;
            };
            if !is_named(&state.callee, "$state") {
                return;
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
                .message_id("unexpected")
                .suggest(Suggestion {
                    message_id: Some("suggestRewrite".into()),
                    message: "Rewrite $state and $effect to $derived".to_owned(),
                    fix,
                }),
            );
        });
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

/// The one statement of a body, a directive counting as a statement as in `ESTree`.
fn only_statement<'a>(body: &'a FunctionBody<'a>) -> Option<&'a Statement<'a>> {
    match (body.directives.as_slice(), body.statements.as_slice()) {
        ([], [statement]) => Some(statement),
        _ => None,
    }
}
