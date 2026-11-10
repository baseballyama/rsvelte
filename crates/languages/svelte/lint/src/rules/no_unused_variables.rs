use rsvelte_lint_runner::rule::Reporter;

use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

#[cfg(test)]
mod tests;

/// `ESLint`'s core rule over a component; `typescript.lint` owns it for modules.
pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "no-unused-vars",
    files: Files::Components,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(NoUnusedVariables))
}

#[derive(Debug)]
struct NoUnusedVariables;

impl SvelteRule for NoUnusedVariables {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        check(file, reporter);
    }
}

fn check(file: &File<'_>, reporter: &mut Reporter<'_>) {
    let facts = rsvelte_typescript_lint::JavaScriptFacts {
        syntax_tree: file.javascript(),
        sem: file.semantic(),
        parents: file.parents(),
    };
    rsvelte_typescript_lint::no_unused_variables(&facts, |_| true, reporter);
}
