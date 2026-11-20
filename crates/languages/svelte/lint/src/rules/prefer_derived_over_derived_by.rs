use oxc_ast::AstKind;
use oxc_ast::ast::{Argument, CallExpression, Expression, FormalParameters, Statement};
use rsvelte_lint_runner::finding::Fix;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_typescript_tree::node_span;

use super::shared::nodes::{is_named, only_statement, text};
use super::shared::runes::in_runes_mode;
use crate::rule::{File, Files, RuleDefinition, SvelteRule, without_options};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/prefer-derived-over-derived-by",
    files: Files::All,
    configure: without_options::<PreferDerivedOverDerivedBy>,
};

#[derive(Debug, Default)]
struct PreferDerivedOverDerivedBy;

impl SvelteRule for PreferDerivedOverDerivedBy {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        if !in_runes_mode(file) {
            return;
        }
        let source = file.source();
        for node in file.nodes().iter() {
            let AstKind::CallExpression(call) = node.kind() else {
                continue;
            };
            let Some(expression) = derived_by_expression(call) else {
                continue;
            };
            let replacement = format!("$derived({})", text(expression, source));
            reporter.report(
                Report::range(
                    "Unnecessary use of `$derived.by()`. Use `$derived()` directly for simple \
                        expressions.",
                    node_span(call),
                )
                .fix(Fix::replace(node_span(call), replacement)),
            );
        }
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
