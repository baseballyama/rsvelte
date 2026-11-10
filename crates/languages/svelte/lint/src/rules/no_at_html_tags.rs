use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte_syntax::syntax_tree::TemplateNode;

use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-at-html-tags",
    files: Files::Components,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(NoAtHtmlTags))
}

#[derive(Debug)]
struct NoAtHtmlTags;

impl SvelteRule for NoAtHtmlTags {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        for node in &component.nodes {
            if let TemplateNode::Html { span, .. } = *node {
                reporter.report(
                    Report::range("`{@html}` can lead to XSS attack.", span)
                        .message_id("unexpected"),
                );
            }
        }
    }
}
