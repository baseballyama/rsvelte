use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte_syntax::syntax_tree::TemplateNode;

use super::nodes;
use crate::rule::{File, Files, RuleDefinition, SvelteRule, without_options};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-useless-children-snippet",
    files: Files::Components,
    configure: without_options::<NoUselessChildrenSnippet>,
};

#[derive(Debug, Default)]
struct NoUselessChildrenSnippet;

impl SvelteRule for NoUselessChildrenSnippet {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        for node in &component.nodes {
            let TemplateNode::Element { children, .. } = *node else {
                continue;
            };
            // The element's content is its `children` snippet already.
            for &child in component.children(children) {
                if let TemplateNode::Snippet {
                    name,
                    parameters,
                    span,
                    ..
                } = *component.node(child)
                    && parameters.is_none_or(|parameters| {
                        component
                            .javascript
                            .get_parameters(parameters)
                            .parameters_count()
                            == 0
                    })
                    && nodes::is_named(component.javascript.get_expression(name), "children")
                {
                    reporter.report(
                        Report::range("Found an unnecessary children snippet.", span)
                            .message_id("uselessSnippet"),
                    );
                }
            }
        }
    }
}
