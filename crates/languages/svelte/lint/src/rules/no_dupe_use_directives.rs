use rsvelte_lint_runner::rule::Reporter;
use rsvelte_svelte::syntax::syntax_tree::AttributeKind;

use super::duplicate_directives::report_duplicates;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-dupe-use-directives",
    files: Files::Components,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(NoDupeUseDirectives))
}

#[derive(Debug)]
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
