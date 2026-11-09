use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_typescript::Kind;
use rsvelte_typescript::syntax_tree::Control;

use super::nodes::{span, walk};
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-svelte-internal",
    files: Files::All,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(NoSvelteInternal))
}

#[derive(Debug)]
struct NoSvelteInternal;

impl SvelteRule for NoSvelteInternal {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let tree = file.javascript();
        let source = file.source();
        walk(file, |node| {
            let module = match tree.kind(node) {
                Kind::Import { source, .. }
                | Kind::Control(
                    Control::ExportList {
                        source: Some(source),
                        ..
                    }
                    | Control::ExportAll { source, .. },
                ) => source,
                Kind::ImportExpression { source, .. }
                    if matches!(tree.kind(source), Kind::String) =>
                {
                    source
                }
                _ => return,
            };
            let value = tree.str_value(module, source);
            if value == "svelte/internal" || value.starts_with("svelte/internal/") {
                reporter.report(
                    Report::range(
                        "Using svelte/internal is prohibited. This will be removed in Svelte 6.",
                        span(tree, node),
                    )
                    .message_id("unexpected"),
                );
            }
        });
    }
}
