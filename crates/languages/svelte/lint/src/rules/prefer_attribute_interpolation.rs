use oxc_ast::ast::Expression;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte_syntax::syntax_tree::Part;

use super::markup::{Holder, for_each_mustache, has_comment, parts};
use super::nodes;
use super::string_escape::has_useful_escape;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/prefer-attribute-interpolation",
    files: Files::Components,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(PreferAttributeInterpolation))
}

#[derive(Debug)]
struct PreferAttributeInterpolation;

impl SvelteRule for PreferAttributeInterpolation {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let javascript = &component.javascript;
        let source = file.source();
        for_each_mustache(component, source, |mustache| {
            let Holder::Attribute(attribute) = mustache.holder else {
                return;
            };
            if !matches!(parts(component, attribute), [Part::Expression { .. }]) {
                return;
            }
            let Expression::TemplateLiteral(template) =
                javascript.get_expression(mustache.expression)
            else {
                return;
            };
            if template.expressions.is_empty() || has_comment(component, mustache.span) {
                return;
            }
            // Text that markup would read differently: a line break, a brace, an escape.
            if template.quasis.iter().any(|quasi| {
                let raw = nodes::text(quasi, source);
                raw.contains(['\n', '\r', '{']) || has_useful_escape(raw)
            }) {
                return;
            }
            reporter.report(
                Report::range(
                    "Prefer attribute interpolation over a template literal.",
                    mustache.span,
                )
                .message_id("unexpected"),
            );
        });
    }
}
