use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_stylesheet_syntax::postcss::InlineNode;
use rsvelte_svelte_syntax::syntax_tree::{AttributeKind, AttributeValue};

use super::style_attribute::{inline_style, is_style};
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/require-optimized-style-attribute",
    files: Files::Components,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(RequireOptimizedStyleAttribute))
}

#[derive(Debug)]
struct RequireOptimizedStyleAttribute;

const COMPLEX: (&str, &str) = ("complex", "It cannot be optimized because too complex.");

impl SvelteRule for RequireOptimizedStyleAttribute {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let source = file.source();
        let mut report = |(id, message): (&'static str, &str), span| {
            reporter.report(Report::range(message, span).message_id(id));
        };
        for (index, attribute) in component.attributes.iter().enumerate() {
            if attribute.kind == AttributeKind::Attribute
                && attribute.shorthand
                && attribute.name.text(source) == "style"
            {
                report(
                    (
                        "shorthand",
                        "It cannot be optimized because style attribute is specified using \
                         shorthand.",
                    ),
                    attribute.span,
                );
                continue;
            }
            if !is_style(attribute, source)
                || matches!(attribute.value, AttributeValue::Parts(p) if p.len == 0)
                || matches!(attribute.value, AttributeValue::True)
            {
                continue;
            }
            let Some(nodes) = inline_style(file, index) else {
                report(COMPLEX, attribute.span);
                continue;
            };
            for node in nodes {
                match node {
                    InlineNode::Declaration(declaration) if declaration.other_holes > 0 => {
                        report(COMPLEX, declaration.span);
                    }
                    InlineNode::Declaration(declaration) if declaration.property_holes > 0 => {
                        report(
                            (
                                "interpolationKey",
                                "It cannot be optimized because property of style declaration \
                             contain interpolation.",
                            ),
                            declaration.property,
                        );
                    }
                    InlineNode::Declaration(_) => {}
                    InlineNode::Comment(span) => report(
                        (
                            "comment",
                            "It cannot be optimized because contains comments.",
                        ),
                        *span,
                    ),
                    InlineNode::Hole { span, .. } => report(COMPLEX, *span),
                }
            }
        }
    }
}
