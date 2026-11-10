use rsvelte_lint_runner::finding::Fix;
use rsvelte_lint_runner::rule::{Report, Reporter};
use serde::Deserialize;

use super::markup::{start_tags, whitespace_before};
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/first-attribute-linebreak",
    files: Files::Components,
    configure,
};

#[derive(Clone, Copy, Debug, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
enum Location {
    Below,
    Beside,
}

#[derive(Default, Deserialize)]
#[serde(deny_unknown_fields)]
struct Options {
    multiline: Option<Location>,
    singleline: Option<Location>,
}

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    let options: Options = options.single()?;
    Ok(Box::new(FirstAttributeLinebreak {
        multiline: options.multiline.unwrap_or(Location::Below),
        singleline: options.singleline.unwrap_or(Location::Beside),
    }))
}

#[derive(Debug)]
struct FirstAttributeLinebreak {
    multiline: Location,
    singleline: Location,
}

impl SvelteRule for FirstAttributeLinebreak {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let tokens = &component.tokens;
        let lines = file.context.ecmascript_line_index();
        let line = |offset: u32| lines.line(offset);
        for tag in start_tags(component) {
            let mut attributes = tag.attributes(tokens);
            let Some(first) = attributes.next() else {
                continue;
            };
            let last = attributes.next_back().unwrap_or(first);
            let location = if line(first.span.start_offset) == line(last.span.end_offset) {
                self.singleline
            } else {
                self.multiline
            };
            let name_line = line(tag.name.end_offset);
            let first_line = line(first.span.start_offset);
            let (message, text) = match location {
                Location::Beside if name_line == first_line => continue,
                Location::Below if name_line < first_line => continue,
                Location::Beside => ("Expected no linebreak before this attribute.", " "),
                Location::Below => ("Expected a linebreak before this attribute.", "\n"),
            };
            let gap = whitespace_before(tokens, first.span.start_offset);
            reporter.report(Report::range(message, first.span).fix(Fix::replace(gap, text)));
        }
    }
}
