use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::finding::Fix;
use rsvelte_lint_runner::rule::{Report, Reporter};
use serde::Deserialize;

use super::tags::{closing_token, end_tags, start_tags};
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/html-closing-bracket-new-line",
    files: Files::Components,
    configure,
};

#[derive(Clone, Copy, Debug, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
enum Value {
    Always,
    Never,
}

#[derive(Default, Deserialize)]
#[serde(deny_unknown_fields, rename_all = "camelCase")]
struct Options {
    singleline: Option<Value>,
    multiline: Option<Value>,
    self_closing_tag: Option<SelfClosingTag>,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct SelfClosingTag {
    singleline: Option<Value>,
    multiline: Option<Value>,
}

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    let options: Options = options.single()?;
    let singleline = options.singleline.unwrap_or(Value::Never);
    let multiline = options.multiline.unwrap_or(Value::Always);
    let self_closing = options.self_closing_tag.as_ref();
    if self_closing.is_some_and(|s| s.singleline.is_none() && s.multiline.is_none()) {
        return Err("`selfClosingTag` needs a property".to_owned());
    }
    Ok(Box::new(HtmlClosingBracketNewLine {
        lines: [singleline, multiline],
        self_closing: [
            self_closing
                .and_then(|s| s.singleline)
                .unwrap_or(singleline),
            self_closing.and_then(|s| s.multiline).unwrap_or(multiline),
        ],
    }))
}

/// The expected line breaks: single-line, then multiline.
#[derive(Debug)]
struct HtmlClosingBracketNewLine {
    lines: [Value; 2],
    self_closing: [Value; 2],
}

impl SvelteRule for HtmlClosingBracketNewLine {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let tokens = &component.tokens;
        let lines = file.context.line_index();
        let line = |offset: u32| lines.line_column(offset).line;
        let start = start_tags(component).map(|tag| {
            let values = if tag.self_closing {
                self.self_closing
            } else {
                self.lines
            };
            (tag.span, values, false)
        });
        let end = end_tags(tokens).map(|span| (span, self.lines, true));
        for (tag, values, end_tag) in start.chain(end) {
            let closing = closing_token(tokens, tag).span.start_offset;
            // The token before, comments skipped: they are replaced too.
            let previous = tokens.get(tokens.before(closing).expect("a tag name precedes"));
            let previous = previous.span.end_offset;
            let multiline = line(tag.start_offset) != line(previous);
            let expected = u32::from(values[usize::from(multiline)] == Value::Always);
            let actual = line(closing) - line(previous);
            if actual == expected || (end_tag && expected != 0) {
                continue;
            }
            let gap = Span::new(previous, closing);
            reporter.report(
                Report::range(
                    format!(
                        "Expected {} before closing bracket, but {} found.",
                        phrase(expected),
                        phrase(actual)
                    ),
                    gap,
                )
                .fix(Fix::replace(gap, "\n".repeat(expected as usize))),
            );
        }
    }
}

fn phrase(line_breaks: u32) -> String {
    match line_breaks {
        0 => "no line breaks".to_owned(),
        1 => "1 line break".to_owned(),
        n => format!("{n} line breaks"),
    }
}
