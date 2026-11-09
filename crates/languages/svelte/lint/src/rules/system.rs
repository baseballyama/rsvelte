use rsvelte_lint_runner::rule::Reporter;

use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

/// Turns off, outside `<script>`, the rules `settings.svelte.ignoreWarnings` names; `lint`
/// applies it. Upstream's checks that the setting is an array of strings are the settings' type;
/// an invalid pattern fails here.
pub(crate) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/system",
    files: Files::Components,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    options.settings.compile_ignored_rules()?;
    Ok(Box::new(System))
}

#[derive(Debug)]
struct System;

impl SvelteRule for System {
    fn check(&self, _: &File<'_>, _: &mut Reporter<'_>) {}
}
