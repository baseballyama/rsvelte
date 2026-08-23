//! Upstream reads the duplicate-attribute rule once, while parsing, and it
//! exempts every attribute named `this` (`1-parse/state/element.js` L246-254);
//! the tag definition it then consumes is `attributes.splice(index, 1)` — the
//! *first* `this` only.
//!
//! rsvelte diverged from both halves: a second copy of the duplicate check in
//! the phase-2 component visitor had no `this` exemption, so
//! `<C bind:this={x} bind:this={x} />` was rejected (issue #3266); and the
//! tag-definition extraction filtered out *every* `this` attribute, so a second
//! one vanished from the output instead of being passed through (issue #3267).

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

const SCRIPT: &str = "<script>\n\timport C from './C.svelte';\n\tlet el = $state(null);\n\tlet tag = $state('div');\n\tlet tag2 = $state('span');\n\tlet v = $state(1);\n\tlet n = $state(0);\n</script>\n";

fn compile_with(markup: &str, generate: GenerateMode) -> Result<String, String> {
    let src = format!("{SCRIPT}{markup}");
    compile(
        &src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .map_err(|e| format!("{e:?}"))
}

/// A repeated `this` is accepted on every host — it is the attribute name that
/// is exempt, not the element type and not the directive form.
#[test]
fn a_repeated_this_is_accepted_on_every_host() {
    for markup in [
        "<C bind:this={el} bind:this={el} />",
        "<div bind:this={el} bind:this={el}></div>",
        "<svelte:element this={tag} bind:this={el} bind:this={el}></svelte:element>",
        "<svelte:component this={C} bind:this={el} bind:this={el} />",
        "{#if n}<svelte:self bind:this={el} bind:this={el} />{/if}",
        "<svelte:element this={tag} this={tag2}>x</svelte:element>",
        "<svelte:component this={C} this={C} />",
    ] {
        for generate in [GenerateMode::Client, GenerateMode::Server] {
            assert!(
                compile_with(markup, generate).is_ok(),
                "{markup} should compile ({generate:?}), got: {:?}",
                compile_with(markup, generate).unwrap_err()
            );
        }
    }
}

/// The opposite direction: no other name is exempt, so removing the phase-2
/// copy must not lose the check. The parse-time port still raises it.
#[test]
fn other_duplicate_attributes_are_still_rejected() {
    for markup in [
        "<C bind:value={v} bind:value={v} />",
        "<C title=\"a\" title=\"b\" />",
        "<div a=\"1\" a=\"2\"></div>",
        "<input bind:value={v} value=\"x\" />",
        "<svelte:component this={C} bind:value={v} bind:value={v} />",
        "{#if n}<svelte:self bind:value={v} bind:value={v} />{/if}",
    ] {
        let err = compile_with(markup, GenerateMode::Client)
            .expect_err(&format!("{markup} must not compile"));
        assert!(
            err.contains("attribute_duplicate"),
            "expected attribute_duplicate for {markup}, got: {err}"
        );
    }
}

/// The second `this` is consumed by nothing, so it is rendered as an ordinary
/// attribute / passed as an ordinary prop.
#[test]
fn a_second_this_is_passed_through() {
    let out = compile_with(
        "<svelte:element this={tag} this={tag2}>x</svelte:element>",
        GenerateMode::Client,
    )
    .expect("compile");
    assert!(
        out.contains("$.attribute_effect($$element, () => ({ this: tag2 }))"),
        "expected the second `this` as an attribute, got: {out}"
    );

    let out = compile_with(
        "<svelte:component this={C} this={C} />",
        GenerateMode::Client,
    )
    .expect("compile");
    assert!(
        out.contains("get this()"),
        "expected the second `this` as a prop, got: {out}"
    );

    let out = compile_with(
        "<svelte:element this={tag} this={tag2}>x</svelte:element>",
        GenerateMode::Server,
    )
    .expect("compile");
    assert!(
        out.contains("$.attr('this', tag2)"),
        "expected the second `this` rendered, got: {out}"
    );

    let out = compile_with(
        "<svelte:component this={C} this={C} />",
        GenerateMode::Server,
    )
    .expect("compile");
    assert!(
        out.contains("C($$renderer, { this: C })"),
        "expected the second `this` as a prop, got: {out}"
    );
}

/// The control for the splice: the *first* `this` is still the tag / component,
/// and a lone `this` is still consumed rather than rendered.
#[test]
fn a_single_this_is_still_consumed_as_the_tag() {
    let out = compile_with(
        "<svelte:element this={tag}>x</svelte:element>",
        GenerateMode::Client,
    )
    .expect("compile");
    assert!(
        out.contains("$.element(node, () => tag,"),
        "expected `tag` as the element, got: {out}"
    );
    assert!(
        !out.contains("attribute_effect"),
        "a lone `this` must not be rendered as an attribute, got: {out}"
    );
}
