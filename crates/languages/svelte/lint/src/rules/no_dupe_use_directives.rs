use rsvelte_lint_runner::catalog::Category;
use rsvelte_lint_runner::rule::Reporter;
use rsvelte_svelte_syntax::syntax_tree::AttributeKind;

use super::shared::duplicate_directives::report_duplicates;
use crate::rule::{File, Files, RuleDefinition, SvelteRule, without_options};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-dupe-use-directives",
    files: Files::Components,
    category: Category::Correctness,
    configure: without_options::<NoDupeUseDirectives>,
};

#[derive(Debug, Default)]
struct NoDupeUseDirectives;

impl SvelteRule for NoDupeUseDirectives {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let source = file.source();
        // The whole key, modifiers included: `use:action|modifier`.
        report_duplicates(
            component,
            source,
            reporter,
            |attribute| (attribute.kind == AttributeKind::Use).then(|| attribute.name.text(source)),
            |key, line| {
                format!("This `{key}` directive is the same and duplicate directives in L{line}.")
            },
        );
    }
}
