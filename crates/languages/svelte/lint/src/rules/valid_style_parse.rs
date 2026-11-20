use rsvelte_lint_runner::catalog::Category;
use rsvelte_lint_runner::rule::Reporter;

use super::shared::style_sheet::{StyleVerdict, verdict};
use crate::rule::{File, Files, RuleDefinition, SvelteRule, without_options};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/valid-style-parse",
    files: Files::Components,
    category: Category::Correctness,
    configure: without_options::<ValidStyleParse>,
};

#[derive(Debug, Default)]
struct ValidStyleParse;

impl SvelteRule for ValidStyleParse {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let message = match verdict(file) {
            StyleVerdict::NoStyle | StyleVerdict::Parsed => return,
            StyleVerdict::UnknownLanguage(language) => {
                format!("Found unsupported style element language \"{language}\"")
            }
            StyleVerdict::Error(error) => format!(
                "Error parsing style element. Error message: \"{}:{}:{}: {}\"",
                file.path(),
                error.line,
                error.column,
                error.reason
            ),
        };
        let style = file
            .component()
            .and_then(|component| component.style.as_ref())
            .expect("a verdict comes from a style element");
        reporter.range(message, style.span);
    }
}
