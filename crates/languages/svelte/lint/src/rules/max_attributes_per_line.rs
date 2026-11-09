use rsvelte_lint_runner::finding::Fix;
use rsvelte_lint_runner::rule::{Report, Reporter};
use serde::Deserialize;

use super::tags::{TagAttribute, start_tags, whitespace_before};
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/max-attributes-per-line",
    files: Files::Components,
    configure,
};

#[derive(Default, Deserialize)]
#[serde(deny_unknown_fields)]
struct Options {
    multiline: Option<f64>,
    singleline: Option<f64>,
}

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    let options: Options = options.single()?;
    Ok(Box::new(MaxAttributesPerLine {
        multiline: maximum(options.multiline)?,
        singleline: maximum(options.singleline)?,
    }))
}

#[expect(
    clippy::cast_possible_truncation,
    clippy::cast_sign_loss,
    reason = "a whole number of at least 1"
)]
fn maximum(value: Option<f64>) -> Result<usize, String> {
    match value {
        None => Ok(1),
        Some(n) if n >= 1.0 && n.fract() == 0.0 => Ok(n as usize),
        // JavaScript indexes `attributes[1.5]` as absent, so a fraction never reports.
        Some(n) if n >= 1.0 => Ok(usize::MAX),
        Some(_) => Err("the maximum must be at least 1".to_owned()),
    }
}

#[derive(Debug)]
struct MaxAttributesPerLine {
    multiline: usize,
    singleline: usize,
}

impl SvelteRule for MaxAttributesPerLine {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let tokens = &component.tokens;
        let source = file.source();
        let lines = file.context.line_index();
        let line = |offset: u32| lines.line_column(offset).line;
        let mut report = |attribute: TagAttribute| {
            let gap = whitespace_before(tokens, attribute.span.start_offset);
            reporter.report(
                Report::range(
                    format!("'{}' should be on a new line.", attribute.key.text(source)),
                    attribute.span,
                )
                .fix(Fix::replace(gap, "\n")),
            );
        };
        for tag in start_tags(component) {
            if line(tag.span.start_offset) == line(tag.span.end_offset) {
                if let Some(attribute) = tag.attributes(tokens).nth(self.singleline) {
                    report(attribute);
                }
                continue;
            }
            // Attributes join a line when they start on the line the line's first one ends.
            let mut group_end_line = None;
            let mut in_group = 0;
            for attribute in tag.attributes(tokens) {
                if group_end_line == Some(line(attribute.span.start_offset)) {
                    in_group += 1;
                } else {
                    group_end_line = Some(line(attribute.span.end_offset));
                    in_group = 0;
                }
                if in_group == self.multiline {
                    report(attribute);
                }
            }
        }
    }
}
