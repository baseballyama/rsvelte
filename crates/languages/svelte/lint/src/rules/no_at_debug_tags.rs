use rsvelte_lint_runner::finding::{Fix, Suggestion};
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte::syntax::syntax_tree::TemplateNode;

use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-at-debug-tags",
    files: Files::Components,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(NoAtDebugTags))
}

#[derive(Debug)]
struct NoAtDebugTags;

impl SvelteRule for NoAtDebugTags {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        for node in &component.nodes {
            if let TemplateNode::Debug { span, .. } = *node {
                reporter.report(
                    Report::range("Unexpected `{@debug}`.", span)
                        .message_id("unexpected")
                        .suggest(Suggestion {
                            message_id: Some("suggestRemove".into()),
                            message: "Remove `{@debug}` from the source".to_owned(),
                            fix: Fix::remove(span),
                        }),
                );
            }
        }
    }
}
