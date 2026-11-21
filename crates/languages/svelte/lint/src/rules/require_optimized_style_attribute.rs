use rsvelte_lint_runner::catalog::Category;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_stylesheet_syntax::postcss::InlineNode;
use rsvelte_svelte_syntax::syntax_tree::{AttributeKind, AttributeValue};

use super::shared::style_attribute::{inline_style, is_style};
use crate::rule::{File, Files, RuleDefinition, SvelteRule, without_options};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/require-optimized-style-attribute",
    files: Files::Components,
    category: Category::Perf,
    configure: without_options::<RequireOptimizedStyleAttribute>,
};

#[derive(Debug, Default)]
struct RequireOptimizedStyleAttribute;

const COMPLEX: &str = "It cannot be optimized because too complex.";

impl SvelteRule for RequireOptimizedStyleAttribute {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let source = file.source();
        let mut report = |message: &str, span| {
            reporter.report(Report::range(message, span));
        };
        for (index, attribute) in component.attributes.iter().enumerate() {
            if attribute.kind == AttributeKind::Attribute
                && attribute.shorthand
                && attribute.name.text(source) == "style"
            {
                report(
                    "It cannot be optimized because style attribute is specified using \
                         shorthand.",
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
                            "It cannot be optimized because property of style declaration \
                             contain interpolation.",
                            declaration.property,
                        );
                    }
                    InlineNode::Declaration(_) => {}
                    InlineNode::Comment(span) => {
                        report("It cannot be optimized because contains comments.", *span);
                    }
                    InlineNode::Hole { span, .. } => report(COMPLEX, *span),
                }
            }
        }
    }
}
