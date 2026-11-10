use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte_syntax::syntax_tree::TemplateNode;

use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-nested-style-tag",
    files: Files::Components,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(NoNestedStyleTag))
}

#[derive(Debug)]
struct NoNestedStyleTag;

impl SvelteRule for NoNestedStyleTag {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let source = file.source();
        // The top-level `<style>` is the component's style sheet, not a template element.
        for node in &component.nodes {
            if let TemplateNode::Element { name, span, .. } = *node
                && name.text(source) == "style"
            {
                reporter.report(
                    Report::range(
                        "Nested `<style>` elements are not scoped and may lead to unintended \
                         styles being applied.",
                        span,
                    )
                    .message_id("nestedStyle"),
                );
            }
        }
    }
}
