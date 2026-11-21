use rsvelte_lint_runner::catalog::Category;
use rsvelte_lint_runner::rule::Reporter;
use rsvelte_svelte_syntax::syntax_tree::AttributeKind;

use super::shared::duplicate_directives::report_duplicates;
use crate::rule::{File, Files, RuleDefinition, SvelteRule, without_options};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-dupe-on-directives",
    files: Files::Components,
    category: Category::Correctness,
    configure: without_options::<NoDupeOnDirectives>,
};

#[derive(Debug, Default)]
struct NoDupeOnDirectives;

impl SvelteRule for NoDupeOnDirectives {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let source = file.source();
        // The event alone: `on:click|once` and `on:click` handle the same event.
        report_duplicates(
            component,
            source,
            reporter,
            |attribute| {
                (attribute.kind == AttributeKind::On).then(|| {
                    attribute
                        .directive_name(&component.modifiers)
                        .expect("a directive has a name")
                        .text(source)
                })
            },
            |event, line| {
                format!(
                    "This `on:{event}` directive is the same and duplicate directives in L{line}."
                )
            },
        );
    }
}
