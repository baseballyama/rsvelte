use rsvelte_lint_runner::finding::{Fix, Suggestion};
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_typescript_syntax::Kind;
use rsvelte_typescript_syntax::operators::AssignmentOperator;

use super::reactive_statements::reactive_statements;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-reactive-literals",
    files: Files::Components,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(NoReactiveLiterals))
}

#[derive(Debug)]
struct NoReactiveLiterals;

impl SvelteRule for NoReactiveLiterals {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let javascript = &component.javascript;
        let span = |node| {
            javascript
                .source_location(node)
                .span()
                .expect("a parsed node")
        };
        for (statement, body) in reactive_statements(component, file.source()) {
            let Kind::ExpressionStatement(expression) = javascript.kind(body) else {
                continue;
            };
            let Kind::Assign(operator, left, right) = javascript.kind(expression) else {
                continue;
            };
            // ESTree's `Literal`, `[]` and `{}`.
            let literal = match javascript.kind(right) {
                Kind::String
                | Kind::Number(_)
                | Kind::Boolean(_)
                | Kind::Null
                | Kind::Regex { .. }
                | Kind::BigInt => true,
                Kind::Array(elements) => elements.is_empty(),
                Kind::Object(properties) => properties.is_empty(),
                _ => false,
            };
            if !literal {
                continue;
            }
            let statement = span(statement);
            let mut report = Report::range(
                "Do not assign literal values inside reactive statements unless absolutely \
                 necessary.",
                statement,
            )
            .message_id("noReactiveLiterals");
            // Upstream also suggests `let a += 1` and `let obj.x = 1`, which do not parse.
            if operator == AssignmentOperator::Assign && javascript.is_identifier(left) {
                report = report.suggest(Suggestion {
                    message_id: Some("fixReactiveLiteral".into()),
                    message: "Move the literal out of the reactive statement into an assignment"
                        .to_owned(),
                    fix: Fix::replace(
                        statement,
                        format!("let {}", span(expression).text(file.source())),
                    ),
                });
            }
            reporter.report(report);
        }
    }
}
