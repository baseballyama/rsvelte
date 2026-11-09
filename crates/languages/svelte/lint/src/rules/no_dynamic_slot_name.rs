use rsvelte_lint_runner::finding::Fix;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte::syntax::syntax_tree::{Part, TemplateNode};

use super::constant_string::{root, string_if_constant};
use super::expressions::Expressions;
use super::markup::{is_attribute, parts, quote, value_span};
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-dynamic-slot-name",
    files: Files::Components,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(NoDynamicSlotName))
}

#[derive(Debug)]
struct NoDynamicSlotName;

impl SvelteRule for NoDynamicSlotName {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let source = file.source();
        let expressions = Expressions::new(&component.javascript, source);
        for node in &component.nodes {
            let TemplateNode::Element {
                name, attributes, ..
            } = *node
            else {
                continue;
            };
            let element = name.text(source);
            if element != "slot" {
                continue;
            }
            for attribute in component.attributes(attributes) {
                if !is_attribute(component, source, element, attribute)
                    || attribute.name.text(source) != "name"
                {
                    continue;
                }
                let value = parts(component, attribute);
                if value.is_empty() {
                    reporter.report(
                        Report::range("`<slot>` name requires a value.", attribute.span)
                            .message_id("requireValue"),
                    );
                    continue;
                }
                for part in value {
                    let Part::Expression { expression, span } = *part else {
                        continue;
                    };
                    let expression = root(&expressions, || file.semantic(), expression);
                    let report = Report::range("`<slot>` name cannot be dynamic.", span)
                        .message_id("unexpected");
                    let Some(text) = string_if_constant(&expressions, expression) else {
                        reporter.report(report);
                        continue;
                    };
                    let fix = if value.len() == 1 {
                        is_safe(&text, Some("\"")).then(|| {
                            Fix::replace(
                                value_span(component, attribute).expect("a written value"),
                                format!("\"{text}\""),
                            )
                        })
                    } else {
                        is_safe(&text, quote(component, source, attribute))
                            .then(|| Fix::replace(span, text))
                    };
                    reporter.report(match fix {
                        Some(fix) => report.fix(fix),
                        None => report,
                    });
                }
            }
        }
    }
}

/// Whether `text` reads back as itself inside a value with this quote: markup reads a brace as
/// an expression, `&` as a character reference, and the quote (or, unquoted, a space) as the
/// value's end.
fn is_safe(text: &str, quote: Option<&str>) -> bool {
    text.chars().all(|c| match quote {
        _ if matches!(c, '{' | '}' | '&') => false,
        Some(quote) => !quote.starts_with(c),
        None => !(c.is_ascii_whitespace() || matches!(c, '"' | '\'' | '=' | '<' | '>' | '`')),
    })
}

#[cfg(test)]
mod tests;
