//! Rules that upstream turns off in every setting rsvelte lints: two run only with Svelte 3 or 4,
//! and two need a TypeScript program (`parserOptions.project`), without which upstream reports
//! nothing. They accept upstream's options so a configuration that names them still loads.

use rsvelte_lint_runner::rule::Reporter;
use serde::Deserialize;

use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static EXPERIMENTAL_REQUIRE_STRICT_EVENTS: RuleDefinition = RuleDefinition {
    name: "svelte/experimental-require-strict-events",
    files: Files::Components,
    configure: no_options,
};

pub(super) static REQUIRE_EVENT_DISPATCHER_TYPES: RuleDefinition = RuleDefinition {
    name: "svelte/require-event-dispatcher-types",
    files: Files::Components,
    configure: no_options,
};

pub(super) static NO_UNUSED_PROPS: RuleDefinition = RuleDefinition {
    name: "svelte/no-unused-props",
    files: Files::Components,
    configure: no_unused_props,
};

pub(super) static REQUIRE_EVENT_PREFIX: RuleDefinition = RuleDefinition {
    name: "svelte/require-event-prefix",
    files: Files::Components,
    configure: require_event_prefix,
};

fn no_options(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(Inactive))
}

#[derive(Default, Deserialize)]
#[serde(deny_unknown_fields)]
struct NoUnusedPropsOptions {
    #[serde(rename = "checkImportedTypes")]
    _check_imported_types: Option<bool>,
    #[serde(rename = "ignoreTypePatterns")]
    _ignore_type_patterns: Option<Vec<String>>,
    #[serde(rename = "ignorePropertyPatterns")]
    _ignore_property_patterns: Option<Vec<String>>,
    #[serde(rename = "allowUnusedNestedProperties")]
    _allow_unused_nested_properties: Option<bool>,
}

fn no_unused_props(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.single::<NoUnusedPropsOptions>()?;
    Ok(Box::new(Inactive))
}

#[derive(Default, Deserialize)]
#[serde(deny_unknown_fields)]
struct RequireEventPrefixOptions {
    #[serde(rename = "checkAsyncFunctions")]
    _check_async_functions: Option<bool>,
}

fn require_event_prefix(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.single::<RequireEventPrefixOptions>()?;
    Ok(Box::new(Inactive))
}

#[derive(Debug)]
struct Inactive;

impl SvelteRule for Inactive {
    fn check(&self, _: &File<'_>, _: &mut Reporter<'_>) {}
}
