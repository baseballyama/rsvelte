use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::finding::Fix;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte_syntax::syntax_tree::{AttributeKind, Component, Part, TemplateNode, TokenType};
use serde::Deserialize;

use super::markup::{is_attribute, parts};
use super::nodes;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/shorthand-attribute",
    files: Files::Components,
    configure,
};

#[derive(Default, Deserialize)]
#[serde(deny_unknown_fields)]
pub(super) struct Options {
    prefer: Option<Prefer>,
}

#[derive(Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub(super) enum Prefer {
    Always,
    Never,
}

impl Options {
    /// Whether the shorthand is preferred, as it is by default.
    pub(super) fn always(&self) -> bool {
        self.prefer != Some(Prefer::Never)
    }
}

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    let options: Options = options.single()?;
    Ok(Box::new(ShorthandAttribute {
        always: options.always(),
    }))
}

#[derive(Debug)]
struct ShorthandAttribute {
    always: bool,
}

impl SvelteRule for ShorthandAttribute {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let javascript = &component.javascript;
        let source = file.source();
        for node in &component.nodes {
            let TemplateNode::Element {
                name, attributes, ..
            } = *node
            else {
                continue;
            };
            let element = name.text(source);
            for attribute in component.attributes(attributes) {
                let key = attribute.name.text(source);
                if !self.always {
                    if attribute.kind == AttributeKind::Attribute && attribute.shorthand {
                        reporter.report(
                            Report::range("Expected regular attribute syntax.", attribute.span)
                                .message_id("expectedRegular")
                                .fix(Fix::insert(attribute.span.start_offset, format!("{key}="))),
                        );
                    }
                    continue;
                }
                if !is_attribute(component, source, element, attribute) {
                    continue;
                }
                let [Part::Expression { expression, span }] = *parts(component, attribute) else {
                    continue;
                };
                if !nodes::is_named(javascript.get_expression(expression), key) {
                    continue;
                }
                let report = Report::range("Expected shorthand attribute.", attribute.span)
                    .message_id("expectedShorthand");
                // The shorthand holds a name alone: `{(a)}` and `{/* c */ a}` do not compile.
                if !is_bare_name(component, span) {
                    reporter.report(report);
                    continue;
                }
                // Keep the `{name}` and drop `name=` with any quotes around it.
                let mut fix =
                    Fix::remove(Span::new(attribute.span.start_offset, span.start_offset));
                fix.push(Span::new(span.end_offset, attribute.span.end_offset), "");
                reporter.report(report.fix(fix));
            }
        }
    }
}

/// Whether the mustache at `span` holds one token between its braces, apart from whitespace.
fn is_bare_name(component: &Component, span: Span) -> bool {
    let mut tokens = component
        .tokens
        .within(span)
        .iter()
        .filter(|token| token.kind != TokenType::Whitespace);
    matches!(
        (tokens.next(), tokens.next(), tokens.next(), tokens.next()),
        (
            Some(open),
            Some(name),
            Some(close),
            None
        ) if open.kind == TokenType::MustacheOpen
            && matches!(name.kind, TokenType::JavaScript(_))
            && close.kind == TokenType::MustacheClose
    )
}
