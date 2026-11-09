use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::finding::Fix;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte_syntax::syntax_tree::TemplateNode;
use serde::Deserialize;

use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};
use rsvelte_kernel::source::characters::is_ecmascript_whitespace as is_javascript_whitespace;

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/spaced-html-comment",
    files: Files::Components,
    configure,
};

#[derive(Default, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
enum Spacing {
    #[default]
    Always,
    Never,
}

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    let spacing: Spacing = options.single()?;
    Ok(Box::new(SpacedHtmlComment {
        require: spacing == Spacing::Always,
    }))
}

#[derive(Debug)]
struct SpacedHtmlComment {
    require: bool,
}

impl SvelteRule for SpacedHtmlComment {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let source = file.source();
        for node in &component.nodes {
            let TemplateNode::Comment { span, data } = *node else {
                continue;
            };
            let value = data.text(source);
            if value.chars().all(is_javascript_whitespace) {
                continue;
            }
            let (first, last) = (
                value.chars().next().expect("not blank"),
                value.chars().next_back().expect("not blank"),
            );
            let (start, end) = (data.start_offset, data.end_offset);
            if self.require {
                if !is_javascript_whitespace(first) {
                    reporter.report(
                        Report::range("Expected space or tab after '<!--' in comment.", span)
                            .fix(Fix::insert(start, " ")),
                    );
                }
                if !is_javascript_whitespace(last) {
                    reporter.report(
                        Report::range("Expected space or tab before '-->' in comment.", span)
                            .fix(Fix::insert(end, " ")),
                    );
                }
                continue;
            }
            // One space or tab, not a line break, as upstream's patterns match.
            let blank = |c: char| is_javascript_whitespace(c) && !matches!(c, '\n' | '\r');
            if blank(first) {
                let len = first.len_utf8() as u32;
                reporter.report(
                    Report::range("Unexpected space or tab after '<!--' in comment.", span)
                        .fix(Fix::remove(Span::new(start, start + len))),
                );
            }
            let before_last = value[..value.len() - last.len_utf8()].chars().next_back();
            if blank(last) && before_last.is_some_and(|c| !is_javascript_whitespace(c)) {
                let len = last.len_utf8() as u32;
                reporter.report(
                    Report::range("Unexpected space or tab before '-->' in comment.", span)
                        .fix(Fix::remove(Span::new(end - len, end))),
                );
            }
        }
    }
}
