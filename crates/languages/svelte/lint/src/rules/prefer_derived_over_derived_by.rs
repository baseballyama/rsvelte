use oxc_ast::AstKind;
use oxc_ast::ast::{
    Argument, CallExpression, Expression, FormalParameters, FunctionBody, Statement,
};
use rsvelte_lint_runner::finding::Fix;
use rsvelte_lint_runner::rule::{Report, Reporter};

use super::javascript::walk;
use super::nodes::{is_named, span, text};
use super::runes::runes_or_undetermined;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/prefer-derived-over-derived-by",
    files: Files::All,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(PreferDerivedOverDerivedBy))
}

#[derive(Debug)]
struct PreferDerivedOverDerivedBy;

impl SvelteRule for PreferDerivedOverDerivedBy {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        if !runes_or_undetermined(file) {
            return;
        }
        let source = file.source();
        walk(file, |node| {
            let AstKind::CallExpression(call) = node.kind() else {
                return;
            };
            let Some(expression) = derived_by_expression(call) else {
                return;
            };
            let replacement = format!("$derived({})", text(expression, source));
            reporter.report(
                Report::range(
                    "Unnecessary use of `$derived.by()`. Use `$derived()` directly for simple \
                        expressions.",
                    span(call),
                )
                .message_id("unnecessary")
                .fix(Fix::replace(span(call), replacement)),
            );
        });
    }
}

/// The expression a `$derived.by(() => expression)` call returns, when it could be `$derived`.
fn derived_by_expression<'a>(call: &'a CallExpression<'a>) -> Option<&'a Expression<'a>> {
    let [argument] = call.arguments.as_slice() else {
        return None;
    };
    let Expression::StaticMemberExpression(member) = &call.callee else {
        return None;
    };
    if !is_named(&member.object, "$derived") || member.property.name != "by" {
        return None;
    }
    let body = match argument {
        Argument::ArrowFunctionExpression(arrow)
            if !arrow.r#async && no_parameters(&arrow.params) =>
        {
            if let Some(expression) = arrow.body.as_expression() {
                return Some(expression);
            }
            arrow.body.as_function_body()?
        }
        Argument::FunctionExpression(function)
            if !function.r#async && !function.generator && no_parameters(&function.params) =>
        {
            function.body.as_deref()?
        }
        _ => return None,
    };
    only_statement(body).and_then(|statement| match statement {
        Statement::ReturnStatement(statement) => statement.argument.as_ref(),
        _ => None,
    })
}

fn no_parameters(parameters: &FormalParameters<'_>) -> bool {
    parameters.items.is_empty() && parameters.rest.is_none()
}

/// The one statement of a body, a directive counting as a statement as in `ESTree`.
fn only_statement<'a>(body: &'a FunctionBody<'a>) -> Option<&'a Statement<'a>> {
    match (body.directives.as_slice(), body.statements.as_slice()) {
        ([], [statement]) => Some(statement),
        _ => None,
    }
}
