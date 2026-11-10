use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::finding::Fix;
use rsvelte_lint_runner::rule::{Report, Reporter};
use serde::Deserialize;

use super::markup::{closing_token, end_tags, start_tags, whitespace_before};
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/html-closing-bracket-spacing",
    files: Files::Components,
    configure,
};

#[derive(Clone, Copy, Debug, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
enum Value {
    Always,
    Never,
    Ignore,
}

#[derive(Default, Deserialize)]
#[serde(deny_unknown_fields)]
struct Options {
    #[serde(rename = "startTag")]
    start: Option<Value>,
    #[serde(rename = "endTag")]
    end: Option<Value>,
    #[serde(rename = "selfClosingTag")]
    self_closing: Option<Value>,
}

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    let options: Options = options.single()?;
    Ok(Box::new(HtmlClosingBracketSpacing {
        start: options.start.unwrap_or(Value::Never),
        end: options.end.unwrap_or(Value::Never),
        self_closing: options.self_closing.unwrap_or(Value::Always),
    }))
}

#[derive(Debug)]
struct HtmlClosingBracketSpacing {
    start: Value,
    end: Value,
    self_closing: Value,
}

impl SvelteRule for HtmlClosingBracketSpacing {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let tokens = &component.tokens;
        let source = file.source();
        let start = start_tags(component).map(|tag| {
            let value = if tag.self_closing {
                self.self_closing
            } else {
                self.start
            };
            (tag.span, value)
        });
        let end = end_tags(tokens).map(|span| (span, self.end));
        for (tag, value) in start.chain(end) {
            let closing = closing_token(tokens, tag).span.start_offset;
            let spaces = whitespace_before(tokens, closing);
            if spaces.text(source).contains('\n') {
                continue;
            }
            let at = Span::new(spaces.start_offset, tag.end_offset);
            match value {
                Value::Always if spaces.is_empty() => reporter.report(
                    Report::range("Expected space before '>', but not found.", at)
                        .fix(Fix::insert(closing, " ")),
                ),
                Value::Never if !spaces.is_empty() => reporter.report(
                    Report::range("Expected no space before '>', but found.", at)
                        .fix(Fix::remove(spaces)),
                ),
                _ => {}
            }
        }
    }
}
