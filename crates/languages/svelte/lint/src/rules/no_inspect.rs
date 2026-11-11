use oxc_ast::AstKind;
use rsvelte_lint_runner::rule::{Report, Reporter};

use super::javascript::{span, walk};
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
        // Every identifier, as the token `$inspect`: one in a type annotation names it too.
        let mut last = None;
        walk(file, |node| {
            let (name, at) = match node.kind() {
                AstKind::IdentifierReference(identifier) => {
                    (identifier.name.as_str(), identifier.span)
                }
                AstKind::BindingIdentifier(identifier) => {
                    (identifier.name.as_str(), identifier.span)
                }
                AstKind::IdentifierName(identifier) => (identifier.name.as_str(), identifier.span),
                AstKind::LabelIdentifier(identifier) => (identifier.name.as_str(), identifier.span),
                _ => return,
            };
            // A shorthand `{ $inspect }` is two nodes over one token.
            if name != "$inspect" || last == Some(at) {
                return;
            }
            last = Some(at);
            reporter.report(
                Report::range("Do not use $inspect directive", span(at)).message_id("unexpected"),
            );
        });
    }
}
