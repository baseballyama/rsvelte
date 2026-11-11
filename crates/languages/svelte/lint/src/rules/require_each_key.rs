use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte_syntax::syntax_tree::TemplateNode;

use super::nodes;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/require-each-key",
    files: Files::Components,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(RequireEachKey))
}

#[derive(Debug)]
struct RequireEachKey;

impl SvelteRule for RequireEachKey {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        for node in &component.nodes {
            let TemplateNode::Each {
                context,
                index,
                key,
                span,
                ..
            } = *node
            else {
                continue;
            };
            // `{#each { length: 8 }}` has no item to key.
            let (Some(context), None) = (context, key) else {
                continue;
            };
            let last = index.unwrap_or(context);
            let after = nodes::span(component.javascript.get_pattern(last)).end_offset;
            let closing = component.tokens.get(
                component
                    .tokens
                    .after(after)
                    .expect("`{#each}` ends with `}`"),
            );
            reporter.report(
                Report::range(
                    "Each block should have a key",
                    Span::new(span.start_offset, closing.span.end_offset),
                )
                .message_id("expectedKey"),
            );
        }
    }
}
