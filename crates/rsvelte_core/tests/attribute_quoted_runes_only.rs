//! Upstream gates `attribute_quoted` behind runes mode: both callers of
//! `validate_attribute` (`shared/element.js`, `shared/component.js`) sit inside
//! `if (context.state.analysis.runes)`. rsvelte hoisted the quoted-attribute
//! check out of that gate at all four emission sites, so a legacy component
//! got a warning upstream never emits and the user cannot act on.

use rsvelte_core::{CompileOptions, GenerateMode, Warning, compile};

fn warnings(src: &str) -> Vec<Warning> {
    compile(
        src,
        CompileOptions {
            filename: Some("Main.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .warnings
}

fn quoted(src: &str) -> Vec<Warning> {
    warnings(src)
        .into_iter()
        .filter(|w| w.code == "attribute_quoted")
        .collect()
}

const RUNES: &str = "<svelte:options runes />";

#[test]
fn legacy_component_attribute_is_not_flagged() {
    assert!(
        quoted("<script>let x = 1;</script>\n<Component id=\"{x}\" />").is_empty(),
        "legacy mode must not warn"
    );
}

#[test]
fn legacy_svelte_component_attribute_is_not_flagged() {
    assert!(
        quoted("<script>let x = 1;</script>\n<svelte:component this={C} id=\"{x}\" />").is_empty(),
        "legacy mode must not warn"
    );
}

#[test]
fn legacy_svelte_self_attribute_is_not_flagged() {
    let src = "<script>let x = 1;</script>\n{#if x}<svelte:self id=\"{x}\" />{/if}";
    assert!(quoted(src).is_empty(), "legacy mode must not warn");
}

#[test]
fn legacy_custom_element_attribute_is_not_flagged() {
    assert!(
        quoted("<script>let x = 1;</script>\n<my-el id=\"{x}\"></my-el>").is_empty(),
        "legacy mode must not warn"
    );
}

/// Pin: runes mode still warns. This is the half of the check that stays, and
/// it fails if the fix suppresses the warning outright instead of gating it.
#[test]
fn runes_component_attribute_is_still_flagged() {
    let src = format!("{RUNES}\n<Component id=\"{{x}}\" />");
    assert_eq!(quoted(&src).len(), 1, "runes mode must still warn");
}

/// Pin: a runes-mode custom element still warns, but a plain element never does
/// — upstream restricts the check to components and custom elements.
#[test]
fn runes_custom_element_warns_but_plain_element_does_not() {
    let src = format!("{RUNES}\n<my-el id=\"{{x}}\"></my-el>");
    assert_eq!(quoted(&src).len(), 1, "custom element must warn in runes");
    let src = format!("{RUNES}\n<div id=\"{{x}}\"></div>");
    assert!(quoted(&src).is_empty(), "plain element must never warn");
}

/// The warning must carry the attribute's span; upstream's `w.attribute_quoted`
/// takes the attribute as its node.
#[test]
fn warning_points_at_the_attribute() {
    let src = format!("{RUNES}\n<Component class=\"a\" id=\"{{x}}\" />");
    let ws = quoted(&src);
    let pos = ws[0].start.as_ref().expect("attribute_quoted has no start");
    let line = src.lines().nth(pos.line - 1).unwrap();
    assert!(
        line[pos.column..].starts_with("id="),
        "expected the attribute, got column {} -> {:?}",
        pos.column,
        &line[pos.column..]
    );
}

/// Upstream's wording names components and custom elements; rsvelte's said
/// "Quoted attribute values", which is wrong for plain elements.
///
/// Asserted in full, not by prefix: the corpus gate compares `(code, line,
/// column)` and never the message, so this test is the **only** observer of
/// this string in the repo. A prefix assertion would leave the advice clause
/// and the docs URL watched by nothing — which is the condition that let the
/// wrong wording ship in the first place.
#[test]
fn message_matches_upstream() {
    let src = format!("{RUNES}\n<Component id=\"{{x}}\" />");
    assert_eq!(
        quoted(&src)[0].message,
        "Quoted attributes on components and custom elements will be stringified in a future \
         version of Svelte. If this isn't what you want, remove the quotes\n\
         https://svelte.dev/e/attribute_quoted"
    );
}
