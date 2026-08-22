//! Which component-like node is the immediate parent decides two different
//! upstream questions, and they name different sets.
//!
//! `validate_slot_attribute` (`2-analyze/visitors/shared/attribute.js`) treats
//! `Component`, `SvelteComponent`, `SvelteSelf` **and** `SvelteElement` as slot
//! owners, while `SvelteFragment.js` accepts only `Component` and
//! `SvelteComponent` as a legal `<svelte:fragment>` parent. rsvelte answered both
//! from one boolean, so `<svelte:self>` lost the first and `<svelte:element>` won
//! the second.
//!
//! Every verdict here is the official compiler's, measured on the same source.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn outcome(src: &str, generate: GenerateMode, dev: bool) -> Result<String, String> {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate,
            dev,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .map_err(|e| e.to_string())
}

/// All four targets the corpus compiles, since a placement rule lives in phase 2
/// and must hold for every one of them.
fn for_each_target(src: &str, mut check: impl FnMut(Result<String, String>, &str)) {
    for (generate, dev, label) in [
        (GenerateMode::Client, false, "client"),
        (GenerateMode::Client, true, "client-dev"),
        (GenerateMode::Server, false, "server"),
        (GenerateMode::Server, true, "server-dev"),
    ] {
        check(outcome(src, generate, dev), label);
    }
}

const HEAD: &str = "<script>\n\tlet { C, n, x, depth = 0 } = $props();\n</script>\n\n";

/// Upstream's slot-owner walk names `SvelteSelf`, so this is legal code that
/// rsvelte rejected.
#[test]
fn svelte_self_owns_the_slots_of_its_direct_children() {
    let src = format!(
        "{HEAD}{{#if depth < 2}}<svelte:self depth={{depth + 1}}><b slot=\"named\">{{n}}</b></svelte:self>{{/if}}\n"
    );
    for_each_target(&src, |result, label| {
        let code = result.unwrap_or_else(|e| panic!("[{label}] rejected legal source: {e}"));
        assert!(
            code.contains("named:"),
            "[{label}] the child did not become a slot prop:\n{code}"
        );
    });
}

/// The same shape one node over, which already worked and must keep working —
/// it is what makes the row above a `<svelte:self>` statement rather than a
/// statement about slots.
#[test]
fn svelte_component_owns_the_slots_of_its_direct_children() {
    let src = format!(
        "{HEAD}<svelte:component this={{C}}><b slot=\"named\">{{n}}</b></svelte:component>\n"
    );
    for_each_target(&src, |result, label| {
        let code = result.unwrap_or_else(|e| panic!("[{label}] rejected legal source: {e}"));
        assert!(
            code.contains("named:"),
            "[{label}] the child did not become a slot prop:\n{code}"
        );
    });
}

/// `<svelte:element>` is a slot owner too.
#[test]
fn svelte_element_owns_the_slots_of_its_direct_children() {
    let src =
        format!("{HEAD}<svelte:element this={{x}}><b slot=\"named\">{{n}}</b></svelte:element>\n");
    for_each_target(&src, |result, label| {
        result.unwrap_or_else(|e| panic!("[{label}] rejected legal source: {e}"));
    });
}

/// …but it is not a legal `<svelte:fragment>` parent: `SvelteFragment.js` lists
/// `Component` and `SvelteComponent` only. rsvelte accepted this.
#[test]
fn svelte_element_is_not_a_svelte_fragment_parent() {
    let src = format!(
        "{HEAD}<svelte:element this={{x}}><svelte:fragment slot=\"named\">{{n}}</svelte:fragment></svelte:element>\n"
    );
    for_each_target(&src, |result, label| {
        let err = result.expect_err(&format!("[{label}] accepted what official rejects"));
        assert!(
            err.contains("svelte_fragment_invalid_placement"),
            "[{label}] wrong diagnostic: {err}"
        );
    });
}

/// Neither is `<svelte:self>` — the case that a single "is a component" flag
/// cannot tell apart from the slot-owner question above.
#[test]
fn svelte_self_is_not_a_svelte_fragment_parent() {
    let src = format!(
        "{HEAD}{{#if depth < 2}}<svelte:self depth={{depth + 1}}><svelte:fragment slot=\"named\">{{n}}</svelte:fragment></svelte:self>{{/if}}\n"
    );
    for_each_target(&src, |result, label| {
        let err = result.expect_err(&format!("[{label}] accepted what official rejects"));
        assert!(
            err.contains("svelte_fragment_invalid_placement"),
            "[{label}] wrong diagnostic: {err}"
        );
    });
}

/// The positive half of that pair, so the rule above is not satisfied by
/// rejecting `<svelte:fragment>` everywhere.
#[test]
fn a_component_is_a_svelte_fragment_parent() {
    let src = format!("{HEAD}<C><svelte:fragment slot=\"named\">{{n}}</svelte:fragment></C>\n");
    for_each_target(&src, |result, label| {
        result.unwrap_or_else(|e| panic!("[{label}] rejected legal source: {e}"));
    });
}

/// `{@const}` placement reads a different stack, and `<svelte:self>` is absent
/// from upstream's list there while `<svelte:component>` is present. Pinned
/// because the fix above moves `<svelte:self>` closer to a component and must
/// not move it here.
#[test]
fn const_tag_placement_still_separates_the_two() {
    let under_self = format!(
        "{HEAD}{{#if depth < 2}}<svelte:self depth={{depth + 1}}>{{@const c = n}}<b>{{c}}</b></svelte:self>{{/if}}\n"
    );
    for_each_target(&under_self, |result, label| {
        let err = result.expect_err(&format!("[{label}] accepted what official rejects"));
        assert!(
            err.contains("const_tag_invalid_placement"),
            "[{label}] wrong diagnostic: {err}"
        );
    });

    let under_component = format!(
        "{HEAD}<svelte:component this={{C}}>{{@const c = n}}<b>{{c}}</b></svelte:component>\n"
    );
    for_each_target(&under_component, |result, label| {
        result.unwrap_or_else(|e| panic!("[{label}] rejected legal source: {e}"));
    });
}

/// A `slot="…"` that is not a *direct* child is still a placement error, so the
/// widened owner set did not widen into "anywhere below a component".
#[test]
fn a_slot_attribute_below_an_element_is_still_rejected() {
    let src = format!(
        "{HEAD}{{#if depth < 2}}<svelte:self depth={{depth + 1}}><div><b slot=\"named\">{{n}}</b></div></svelte:self>{{/if}}\n"
    );
    for_each_target(&src, |result, label| {
        let err = result.expect_err(&format!("[{label}] accepted what official rejects"));
        assert!(
            err.contains("slot_attribute_invalid_placement"),
            "[{label}] wrong diagnostic: {err}"
        );
    });
}
