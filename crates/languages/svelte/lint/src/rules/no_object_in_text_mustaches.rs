use oxc_ast::ast::Expression;
use rsvelte_lint_runner::rule::{Report, Reporter};

use super::markup::{Holder, for_each_mustache, parts};
use crate::rule::{File, Files, RuleDefinition, SvelteRule, without_options};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-object-in-text-mustaches",
    files: Files::Components,
    configure: without_options::<NoObjectInTextMustaches>,
};

#[derive(Debug, Default)]
struct NoObjectInTextMustaches;

impl SvelteRule for NoObjectInTextMustaches {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        for_each_mustache(component, file.source(), |mustache| {
            let phrase = match component.javascript.get_expression(mustache.expression) {
                Expression::ObjectExpression(_) => "object",
                Expression::ArrayExpression(_) => "array",
                Expression::ArrowFunctionExpression(_) | Expression::FunctionExpression(_) => {
                    "function"
                }
                Expression::ClassExpression(_) => "class",
                _ => return,
            };
            // The whole value of an attribute may be a prop that takes an object.
            if let Holder::Attribute(attribute) = mustache.holder
                && parts(component, attribute).len() == 1
            {
                return;
            }
            reporter.report(
                Report::range(
                    format!("Unexpected {phrase} in text mustache interpolation."),
                    mustache.span,
                )
                .message_id("unexpected"),
            );
        });
    }
}
