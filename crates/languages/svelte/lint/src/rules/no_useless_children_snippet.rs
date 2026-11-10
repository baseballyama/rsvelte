use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte_syntax::syntax_tree::TemplateNode;

use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-useless-children-snippet",
    files: Files::Components,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(NoUselessChildrenSnippet))
}

#[derive(Debug)]
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
                    && parameters.len == 0
                    && component.javascript.name(name) == "children"
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
