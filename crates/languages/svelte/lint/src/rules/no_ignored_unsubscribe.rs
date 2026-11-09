use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_typescript_syntax::Kind;

use super::javascript::{is_optional_chain, span, walk};
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-ignored-unsubscribe",
    files: Files::All,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(NoIgnoredUnsubscribe))
}

#[derive(Debug)]
struct NoIgnoredUnsubscribe;

impl SvelteRule for NoIgnoredUnsubscribe {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let javascript = file.javascript();
        walk(file, |node| {
            let Kind::ExpressionStatement(call) = javascript.kind(node) else {
                return;
            };
            let Kind::Call { callee, .. } = javascript.kind(call) else {
                return;
            };
            if is_optional_chain(javascript, call) {
                return;
            }
            // `property.name` is also an identifier's name inside brackets.
            if let Kind::Member { property, .. } = javascript.kind(callee)
                && javascript.atom(property).map(|a| javascript.atoms.get(a)) == Some("subscribe")
            {
                reporter.report(
                    Report::range(
                        "Ignoring returned value of the subscribe method is forbidden.",
                        span(javascript, property),
                    )
                    .message_id("forbidden"),
                );
            }
        });
    }
}
