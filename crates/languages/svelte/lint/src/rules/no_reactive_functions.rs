use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::finding::{Fix, Suggestion};
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte::syntax::syntax_tree::TokenType;
use rsvelte_typescript::Kind;

use super::reactive_statements::{between, reactive_statements};
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-reactive-functions",
    files: Files::Components,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(NoReactiveFunctions))
}

#[derive(Debug)]
struct NoReactiveFunctions;

impl SvelteRule for NoReactiveFunctions {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let javascript = &component.javascript;
        let tokens = &component.tokens;
        for (statement, body) in reactive_statements(component, file.source()) {
            let Kind::ExpressionStatement(expression) = javascript.kind(body) else {
                continue;
            };
            let Kind::Assign(_, _, right) = javascript.kind(expression) else {
                continue;
            };
            if !matches!(
                javascript.kind(right),
                Kind::Function { .. } | Kind::Arrow { .. }
            ) {
                continue;
            }
            let span = javascript
                .source_location(statement)
                .span()
                .expect("a parsed statement");
            let mut report = Report::range(
                "Do not create functions inside reactive statements unless absolutely necessary.",
                span,
            )
            .message_id("noReactiveFns");
            // `$`, `:` and the token after them.
            let label = tokens.after(span.start_offset).map(|t| tokens.get(t).span);
            let colon = label
                .and_then(|l| tokens.after(l.end_offset))
                .map(|t| tokens.get(t).span);
            let next = colon
                .and_then(|c| tokens.after(c.end_offset))
                .map(|t| tokens.get(t).span);
            if let (Some(label), Some(colon), Some(next)) = (label, colon, next) {
                let spaced = between(tokens, colon.end_offset, next.start_offset)
                    .any(|token| token.kind == TokenType::Whitespace);
                report = report.suggest(Suggestion {
                    message_id: Some("fixReactiveFns".into()),
                    message: "Move the function out of the reactive statement".to_owned(),
                    fix: Fix::replace(
                        Span::new(label.start_offset, colon.end_offset),
                        if spaced { "const" } else { "const " },
                    ),
                });
            }
            reporter.report(report);
        }
    }
}
