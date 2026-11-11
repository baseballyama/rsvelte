use oxc_ast::ast::{
    ArrayExpressionElement, BindingIdentifier, BindingPattern, Expression, FormalParameter,
};
use rsvelte_lint_runner::finding::Suggestion;
use rsvelte_lint_runner::rule::{Report, Reporter};

use super::nodes::span;
use super::svelte_store::{Function, Scopes, rename, store_calls};
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/derived-has-same-inputs-outputs",
    files: Files::All,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(DerivedHasSameInputsOutputs))
}

#[derive(Debug)]
struct DerivedHasSameInputsOutputs;

impl SvelteRule for DerivedHasSameInputsOutputs {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let calls = store_calls(file, &["derived"]);
        if calls.is_empty() {
            return;
        }
        let scopes = Scopes::new(file);
        for (call, _) in calls {
            let [inputs, function, ..] = call.arguments.as_slice() else {
                continue;
            };
            let (Some(inputs), Some(function)) = (
                inputs.as_expression(),
                function.as_expression().and_then(Function::of),
            ) else {
                continue;
            };
            let Some(parameter) = function.parameters.items.first() else {
                continue;
            };
            match (inputs, plain(parameter)) {
                (
                    Expression::Identifier(input),
                    Some(BindingPattern::BindingIdentifier(output)),
                ) => {
                    check(
                        file,
                        &scopes,
                        function,
                        output,
                        Some(input.name.as_str()),
                        reporter,
                    );
                }
                (
                    Expression::ArrayExpression(inputs),
                    Some(BindingPattern::ArrayPattern(outputs)),
                ) => {
                    for (input, output) in inputs.elements.iter().zip(&outputs.elements) {
                        if let Some(BindingPattern::BindingIdentifier(output)) = output {
                            let input = match input {
                                ArrayExpressionElement::Identifier(input) => {
                                    Some(input.name.as_str())
                                }
                                _ => None,
                            };
                            check(file, &scopes, function, output, input, reporter);
                        }
                    }
                }
                _ => {}
            }
        }
    }
}

/// The parameter's pattern, unless a default value wraps it.
fn plain<'a>(parameter: &'a FormalParameter<'a>) -> Option<&'a BindingPattern<'a>> {
    parameter
        .initializer
        .is_none()
        .then_some(&parameter.pattern)
}

/// Reports `output` unless it is `$input`.
fn check(
    file: &File<'_>,
    scopes: &Scopes<'_>,
    function: Function<'_>,
    output: &BindingIdentifier<'_>,
    input: Option<&str>,
    reporter: &mut Reporter<'_>,
) {
    let Some(input) = input else {
        return;
    };
    let expected = format!("${input}");
    let actual = output.name.as_str();
    if actual == expected {
        return;
    }
    let mut report = Report::range(
        format!("The argument name should be '{expected}'."),
        span(output),
    )
    .message_id("unexpected");
    if let Ok(symbol) = scopes.replaceable(file, function, Some(actual), &expected) {
        report = report.suggest(Suggestion {
            message_id: Some("renameParam".into()),
            message: format!("Rename the parameter from {actual} to {expected}."),
            fix: rename(file, span(output), symbol, &expected),
        });
    }
    reporter.report(report);
}
