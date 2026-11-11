use oxc_ast::ast::IdentifierReference;
use oxc_ast_visit::Visit;
use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::rule::Reporter;
use rsvelte_svelte_semantic::compiler_syntax_tree::NodeKind;
use rsvelte_svelte_semantic::resolve::Resolution;

use super::nodes;
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
    for node in &tree.nodes {
        let NodeKind::Each(each) = &node.kind else {
            continue;
        };
        let Some(key) = each.key else {
            continue;
        };
        let key = javascript.get_expression(key);
        let mut uses = UsesIterationVariable {
            resolution,
            context: each.context.map(|p| nodes::span(javascript.get_pattern(p))),
            index: each.index.map(|p| nodes::span(javascript.get_pattern(p))),
            collection: nodes::span(javascript.get_expression(each.collection)),
            found: false,
        };
        uses.visit_expression(key);
        if !uses.found {
            reporter.range(
                "Expected key to use the variables which are defined by the `{#each}` block.",
                nodes::span(key),
            );
        }
    }
}

/// Whether a reference in the key resolves to a name the context, the index or the collection
/// declares.
struct UsesIterationVariable<'r> {
    resolution: &'r Resolution,
    context: Option<Span>,
    index: Option<Span>,
    collection: Span,
    found: bool,
}

impl<'a> Visit<'a> for UsesIterationVariable<'_> {
    fn visit_identifier_reference(&mut self, it: &IdentifierReference<'a>) {
        let Some(symbol) = self.resolution.symbol(it) else {
            return;
        };
        let declared = super::node_span(self.resolution.scoping().symbol_span(symbol));
        let contains = |outer: Span| {
            outer.start_offset <= declared.start_offset && declared.end_offset <= outer.end_offset
        };
        if self.context.is_some_and(contains)
            || self.index.is_some_and(contains)
            || contains(self.collection)
        {
            self.found = true;
        }
    }
}
