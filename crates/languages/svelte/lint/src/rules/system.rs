use rsvelte_lint_runner::catalog::Category;

use crate::rule::{Files, RuleDefinition, RuleOptions, SvelteRule};

/// Turns off, outside `<script>`, the rules `settings.svelte.ignoreWarnings` names; `lint`
/// applies it. Upstream's checks that the setting is an array of strings are the settings' type;
/// an invalid pattern fails here.
pub(crate) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/system",
    files: Files::Components,
    category: Category::Correctness,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    options.settings.compile_ignored_rules()?;
    Ok(Box::new(super::inactive::Inactive))
}
