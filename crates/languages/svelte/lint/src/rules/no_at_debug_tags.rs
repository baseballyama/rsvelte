use rsvelte_lint_runner::catalog::Category;
use rsvelte_lint_runner::finding::{Fix, Suggestion};
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte_syntax::syntax_tree::TemplateNode;

use crate::rule::{File, Files, RuleDefinition, SvelteRule, without_options};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-at-debug-tags",
    files: Files::Components,
    category: Category::Correctness,
    configure: without_options::<NoAtDebugTags>,
};

#[derive(Debug, Default)]
struct NoAtDebugTags;

impl SvelteRule for NoAtDebugTags {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        for node in &component.nodes {
            if let TemplateNode::Debug { span, .. } = *node {
                reporter.report(Report::range("Unexpected `{@debug}`.", span).suggest(
                    Suggestion {
                        message: "Remove `{@debug}` from the source".to_owned(),
                        fix: Fix::remove(span),
                    },
                ));
            }
        }
    }
}
