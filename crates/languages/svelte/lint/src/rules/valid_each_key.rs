use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_svelte::compilation::compiler_syntax_tree::NodeKind;
use rsvelte_svelte::{Normalized, Parsed, Resolved};

pub(super) fn check(context: &DocumentContext<'_>, out: &mut Vec<Diagnostic>) {
    let component = context
        .get::<Parsed>()
        .as_ref()
        .expect("lint checks parsing first");
    let tree = context
        .get::<Normalized>()
        .as_ref()
        .expect("a parsed component lowers");
    let resolution = context
        .get::<Resolved>()
        .as_ref()
        .expect("a parsed component resolves");
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
            out.push(Diagnostic::error(
                "svelte/valid-each-key",
                "Expected key to use the variables which are defined by the `{#each}` block.",
                span(key),
            ));
        }
    }
}
