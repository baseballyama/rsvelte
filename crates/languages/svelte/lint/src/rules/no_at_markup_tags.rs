use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte_syntax::syntax_tree::TemplateNode;

use crate::rule::{File, Files, RuleDefinition, SvelteRule, without_options};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-at-html-tags",
    files: Files::Components,
    configure: without_options::<NoAtMarkupTags>,
};

#[derive(Debug, Default)]
struct NoAtMarkupTags;

impl SvelteRule for NoAtMarkupTags {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        for node in &component.nodes {
            if let TemplateNode::Html { span, .. } = *node {
                reporter.report(Report::range("`{@html}` can lead to XSS attack.", span));
            }
        }
    }
}
