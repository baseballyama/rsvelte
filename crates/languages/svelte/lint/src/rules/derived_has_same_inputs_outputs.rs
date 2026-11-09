use rsvelte_lint_runner::finding::Suggestion;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_typescript_syntax::{Kind, NodeIdentifier};

use super::javascript::span;
use super::svelte_store::{Scopes, rename, store_calls};
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
        let javascript = file.javascript();
        let name = |node| javascript.atom(node).map(|atom| javascript.atoms.get(atom));
        let calls = store_calls(file, &["derived"]);
        if calls.is_empty() {
            return;
        }
        let scopes = Scopes::new(file);
        for (call, _) in calls {
            let Kind::Call { arguments, .. } = javascript.kind(call) else {
                continue;
            };
            let [inputs, function, ..] = *arguments else {
                continue;
            };
            let (Kind::Function { parameters, .. } | Kind::Arrow { parameters, .. }) =
                javascript.kind(function)
            else {
                continue;
            };
            let Some(&parameter) = parameters.first() else {
                continue;
            };
            match (javascript.kind(inputs), javascript.kind(parameter)) {
                (Kind::Identifier(_), Kind::Identifier(_)) => {
                    check(file, &scopes, function, parameter, name(inputs), reporter);
                }
                (Kind::Array(inputs), Kind::ArrayPattern(outputs)) => {
                    for (&input, &output) in inputs.iter().zip(outputs) {
                        if matches!(javascript.kind(output), Kind::Identifier(_)) {
                            check(file, &scopes, function, output, name(input), reporter);
                        }
                    }
                }
                _ => {}
            }
        }
    }
}

/// Reports `output` unless it is `$input`.
fn check(
    file: &File<'_>,
    scopes: &Scopes,
    function: NodeIdentifier,
    output: NodeIdentifier,
    input: Option<&str>,
    reporter: &mut Reporter<'_>,
) {
    let javascript = file.javascript();
    let Some(input) = input else {
        return;
    };
    let expected = format!("${input}");
    let actual = javascript.name(output);
    if actual == expected {
        return;
    }
    let mut report = Report::range(
        format!("The argument name should be '{expected}'."),
        span(javascript, output),
    )
    .message_id("unexpected");
    if let Ok(binding) = scopes.replaceable(file, function, Some(actual), &expected) {
        report = report.suggest(Suggestion {
            message_id: Some("renameParam".into()),
            message: format!("Rename the parameter from {actual} to {expected}."),
            fix: rename(file, output, binding, &expected),
        });
    }
    reporter.report(report);
}
