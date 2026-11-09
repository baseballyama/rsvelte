use rsvelte_lint_runner::finding::Fix;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte::syntax::syntax_tree::{Attribute, AttributeKind, Component, Part, TokenType};

use super::expressions::Expressions;
use super::markup::{parts, value_span};
use super::shorthand_attribute::Options;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/shorthand-directive",
    files: Files::Components,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    let options: Options = options.single()?;
    Ok(Box::new(ShorthandDirective {
        always: options.always(),
    }))
}

#[derive(Debug)]
struct ShorthandDirective {
    always: bool,
}

impl SvelteRule for ShorthandDirective {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let source = file.source();
        let expressions = Expressions::new(&component.javascript, source);
        for attribute in &component.attributes {
            if !matches!(
                attribute.kind,
                AttributeKind::Bind | AttributeKind::Class | AttributeKind::Style
            ) {
                continue;
            }
            let directive = attribute
                .directive_name(&component.modifiers)
                .expect("a directive has a name");
            let name = directive.text(source);
            if attribute.shorthand {
                if !self.always {
                    reporter.report(
                        Report::range("Expected regular directive syntax.", attribute.span)
                            .message_id("expectedRegular")
                            // After the modifiers too: `style:color|important={color}`.
                            .fix(Fix::insert(attribute.name.end_offset, format!("={{{name}}}"))),
                    );
                }
                continue;
            }
            if !self.always || !names_itself(component, &expressions, attribute, name) {
                continue;
            }
            reporter.report(
                Report::range("Expected shorthand directive.", attribute.span)
                    .message_id("expectedShorthand")
                    .fix(remove_value(component, attribute)),
            );
        }
    }
}

/// The value is `{name}`, the directive's own name.
fn names_itself(
    component: &Component,
    expressions: &Expressions<'_>,
    attribute: &Attribute,
    name: &str,
) -> bool {
    let javascript = &component.javascript;
    matches!(
        *parts(component, attribute),
        [Part::Expression { expression, .. }]
            if javascript.is_identifier(expression)
                && !expressions.asserted(expression)
                && javascript.name(expression) == name
    )
}

/// `= value`, quotes included; the whitespace around `=` stays.
fn remove_value(component: &Component, attribute: &Attribute) -> Fix {
    let value = value_span(component, attribute).expect("a written value");
    let tokens = &component.tokens;
    let equals = tokens.get(
        tokens
            .before(value.start_offset)
            .expect("`=` before the value"),
    );
    let mut fix = Fix::new();
    if equals.kind == TokenType::Eq {
        fix.push(equals.span, "");
        fix.push(value, "");
    }
    fix
}
