use rsvelte_lint_runner::rule::Reporter;
use rsvelte_svelte::compilation::compiler_syntax_tree::NodeKind;

use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/valid-each-key",
    files: Files::Components,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(ValidEachKey))
}

#[derive(Debug)]
struct ValidEachKey;

impl SvelteRule for ValidEachKey {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        check(file, reporter);
    }
}

fn check(file: &File<'_>, reporter: &mut Reporter<'_>) {
    let component = file.component().expect("a component rule");
    let tree = file.normalized().expect("a component rule");
    let resolution = file.resolution().expect("a component rule");
    let javascript = &component.javascript;
    let span = |node| {
        javascript
            .source_location(node)
            .span()
            .expect("a source node has a span")
    };
    let mut pending = Vec::new();
    for node in &tree.nodes {
        let NodeKind::Each(each) = &node.kind else {
            continue;
        };
        let Some(key) = each.key() else {
            continue;
        };
        let context_span = each.context().map(span);
        let index_span = each.index().map(span);
        let collection_span = span(each.collection);
        pending.clear();
        pending.push(key);
        let mut uses_iteration_variable = false;
        while let Some(expression) = pending.pop() {
            if let Some(binding) = resolution.sem.binding_of(expression) {
                let declared = span(resolution.sem.bindings[binding].node);
                let contains = |outer: rsvelte_kernel::source::positions::Span| {
                    outer.start_offset <= declared.start_offset
                        && declared.end_offset <= outer.end_offset
                };
                if context_span.is_some_and(contains)
                    || index_span.is_some_and(contains)
                    || contains(collection_span)
                {
                    uses_iteration_variable = true;
                    break;
                }
            }
            javascript.for_each_child(expression, |child| pending.push(child));
        }
        if !uses_iteration_variable {
            reporter.range(
                "Expected key to use the variables which are defined by the `{#each}` block.",
                span(key),
            );
        }
    }
}
