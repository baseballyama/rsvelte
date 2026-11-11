use oxc_ast::ast::Statement;
use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::finding::{Fix, Suggestion};
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte_syntax::syntax_tree::TokenType;

use super::nodes::span;
use super::reactive_statements::{between, reactive_statements};
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-extra-reactive-curlies",
    files: Files::Components,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(NoExtraReactiveCurlies))
}

#[derive(Debug)]
struct NoExtraReactiveCurlies;

impl SvelteRule for NoExtraReactiveCurlies {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        for (_, body) in reactive_statements(component, file.source()) {
            let Statement::BlockStatement(block) = body else {
                continue;
            };
            if block.body.len() != 1 {
                continue;
            }
            let block = span(block.as_ref());
            let mut report = Report::range(
                "Do not wrap reactive statements in curly braces unless necessary.",
                block,
            )
            .message_id("extraCurlies");
            // The tokens and comments of the block: `{`, the first after it, the last before
            // `}`, and `}`.
            let mut tokens = between(&component.tokens, block.start_offset, block.end_offset)
                .filter(|token| token.kind != TokenType::Whitespace)
                .map(|token| token.span);
            let (open, second) = (tokens.next(), tokens.next());
            let mut last_two = (second, None);
            for span in tokens {
                last_two = (last_two.1.or(last_two.0), Some(span));
            }
            if let (Some(open), Some(second), (Some(penultimate), Some(close))) =
                (open, second, last_two)
            {
                let mut fix = Fix::remove(Span::new(open.start_offset, second.start_offset));
                fix.push(Span::new(penultimate.end_offset, close.end_offset), "");
                report = report.suggest(Suggestion {
                    message_id: Some("removeExtraCurlies".into()),
                    message: "Remove the unnecessary curly braces.".to_owned(),
                    fix,
                });
            }
            reporter.report(report);
        }
    }
}
