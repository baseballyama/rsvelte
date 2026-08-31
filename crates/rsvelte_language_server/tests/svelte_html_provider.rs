//! The merge `svelteHtmlDataProvider` performs is ported, so it is compared to
//! the provider's own answer for every tag it serves. Regenerate the fixture
//! with `node scripts/dev/generate-html-data.mjs`.

use std::collections::BTreeMap;

use rsvelte_language_server::html_data::provider::{attributes, tags};

const ORACLE: &str = include_str!("data/svelte-html-attributes.json");

#[test]
fn every_tag_is_served_the_attributes_upstream_serves_it() {
    let expected: BTreeMap<String, Vec<String>> =
        serde_json::from_str(ORACLE).expect("parse the provider oracle");

    // `provideTags` repeats `slot`, and the fixture is keyed by name, so the
    // duplicate collapses on both sides.
    let names: Vec<&str> = tags().map(|tag| tag.name).collect();
    assert_eq!(names.len(), 127, "the provider serves 127 tags");
    assert_eq!(
        names.iter().filter(|name| **name == "slot").count(),
        2,
        "Svelte declares its own `slot` beside the upstream one"
    );

    let divergent: Vec<String> = expected
        .iter()
        .filter(|(tag, wanted)| {
            let actual: Vec<String> = attributes(tag)
                .into_iter()
                .map(|provided| provided.name.into_owned())
                .collect();
            actual != **wanted
        })
        .map(|(tag, _)| tag.clone())
        .collect();
    assert!(
        divergent.is_empty(),
        "{} of {} tags diverge: {divergent:?}",
        divergent.len(),
        expected.len()
    );
}

/// `mapToSvelteEvent` rewrites a tag attribute's leading `on`, and the global
/// list carries both spellings because the provider concatenates the upstream
/// globals with the renamed copies.
#[test]
fn a_tag_attribute_is_renamed_while_the_globals_keep_both_spellings() {
    let body: Vec<String> = attributes("body")
        .into_iter()
        .map(|provided| provided.name.into_owned())
        .collect();
    assert!(
        body.contains(&"on:unload".to_string()),
        "renamed tag attribute"
    );
    assert!(
        !body.contains(&"onunload".to_string()),
        "the original is gone"
    );
    assert!(body.contains(&"onclick".to_string()), "upstream global");
    assert!(
        body.contains(&"on:click".to_string()),
        "Svelte's copy of it"
    );
}

/// `provideAttributes` gives these two their own attributes and no globals.
#[test]
fn a_boundary_is_served_no_globals() {
    let boundary: Vec<String> = attributes("svelte:boundary")
        .into_iter()
        .map(|provided| provided.name.into_owned())
        .collect();
    assert_eq!(boundary, vec!["onerror".to_string()]);
    assert!(
        !attributes("svelte:head").is_empty(),
        "other Svelte tags do get them"
    );
}
