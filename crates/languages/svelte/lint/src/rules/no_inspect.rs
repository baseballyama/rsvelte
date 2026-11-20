use oxc_ast::AstKind;
use rsvelte_lint_runner::catalog::Category;
use rsvelte_lint_runner::rule::{Report, Reporter};

use super::shared::nodes::from_oxc;
use super::shared::runes::runes;
use crate::rule::{File, Files, RuleDefinition, SvelteRule, without_options};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-inspect",
    files: Files::All,
    category: Category::Correctness,
    configure: without_options::<NoInspect>,
};

#[derive(Debug, Default)]
struct NoInspect;

impl SvelteRule for NoInspect {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        // `$inspect` is a rune only in runes mode; a plain `.js` module has no mode.
        if runes(file) != Some(true) {
            return;
        }
        // Every identifier, as the token `$inspect`: one in a type annotation names it too.
        let mut last = None;
        for node in file.nodes().iter() {
            let (name, at) = match node.kind() {
                AstKind::IdentifierReference(identifier) => {
                    (identifier.name.as_str(), identifier.span)
                }
                AstKind::BindingIdentifier(identifier) => {
                    (identifier.name.as_str(), identifier.span)
                }
                AstKind::IdentifierName(identifier) => (identifier.name.as_str(), identifier.span),
                AstKind::LabelIdentifier(identifier) => (identifier.name.as_str(), identifier.span),
                _ => continue,
            };
            // A shorthand `{ $inspect }` is two nodes over one token.
            if name != "$inspect" || last == Some(at) {
                continue;
            }
            last = Some(at);
            reporter.report(Report::range("Do not use $inspect directive", from_oxc(at)));
        }
    }
}
