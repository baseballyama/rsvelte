use rsvelte_lint_runner::rule::Reporter;

use super::style_sheet::{StyleVerdict, verdict};
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/valid-style-parse",
    files: Files::Components,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(ValidStyleParse))
}

#[derive(Debug)]
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
