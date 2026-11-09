use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_typescript::lexer::T;

use super::runes::runes;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-inspect",
    files: Files::All,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(NoInspect))
}

#[derive(Debug)]
struct NoInspect;

impl SvelteRule for NoInspect {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        // `$inspect` is a rune only in runes mode; a plain `.js` module has no mode.
        if runes(file) != Some(true) {
            return;
        }
        let source = file.source();
        // Tokens, not nodes: an identifier in a type annotation names `$inspect` too.
        for token in file.javascript().tokens.iter() {
            if token.kind == T::Identifier && token.span.text(source) == "$inspect" {
                reporter.report(
                    Report::range("Do not use $inspect directive", token.span)
                        .message_id("unexpected"),
                );
            }
        }
    }
}
