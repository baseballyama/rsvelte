use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_lint_runner::rule::Reporter;
use rsvelte_svelte_semantic::Resolved;
use rsvelte_svelte_syntax::Parsed;

use crate::computation::Parents;

#[cfg(test)]
mod tests;

pub(super) fn check(context: &DocumentContext<'_>, reporter: &mut Reporter<'_>) {
    let component = context
        .get::<Parsed>()
        .as_ref()
        .expect("lint checks parsing first");
    let resolution = context
        .get::<Resolved>()
        .as_ref()
        .expect("a parsed component resolves");
    let facts = rsvelte_typescript_lint::JavaScriptFacts {
        syntax_tree: &component.javascript,
        sem: &resolution.sem,
        parents: context.get::<Parents>(),
    };
    rsvelte_typescript_lint::no_unused_variables(&facts, |_| true, reporter);
}
