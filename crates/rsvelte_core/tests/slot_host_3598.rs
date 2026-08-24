//! Regression tests for #3598 — the `slot` attribute rule and the
//! `<svelte:fragment>` rule have different host sets, and rsvelte answered both
//! from one flag.
//!
//! Upstream:
//!
//! * `validate_slot_attribute` searches for the nearest owner among
//!   `Component | SvelteComponent | SvelteSelf | SvelteElement | custom
//!   element`, then requires a DIRECT child only when that owner is one of the
//!   first three — a `<svelte:element>` or custom-element owner accepts a
//!   `slot` at any depth.
//! * `SvelteFragment` requires `parent.type === 'Component' ||
//!   'SvelteComponent'` — neither `SvelteSelf` nor `SvelteElement`.
//!
//! So the two lists differ on exactly the two hosts that were wrong, in
//! opposite directions: `<svelte:self>` was missing from the slot rule (an
//! over-rejection of code official compiles) and `<svelte:element>` was present
//! in the fragment rule (an over-acceptance of code official rejects). Each
//! rule had the OTHER host right, so neither is "rsvelte does not know about
//! this element".
//!
//! Every expectation below is the byte-exact verdict of the official compiler
//! (Svelte v5.56.9).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// `Ok(())` or the error code, for `body` placed in a legacy component.
fn verdict(body: &str) -> Result<(), String> {
    let src = format!(
        "<svelte:options runes={{false}} />\n\n<script>\n\timport Comp from \"./Comp.svelte\";\n\texport let depth = 0;\n</script>\n\n{{#if depth < 1}}\n\t{body}\n{{:else}}\n\t<slot name=\"head\" />\n{{/if}}\n"
    );
    compile(
        &src,
        CompileOptions {
            filename: Some("X.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .map(|_| ())
    .map_err(|e| {
        let text = format!("{e:?}");
        for code in [
            "slot_attribute_invalid_placement",
            "svelte_fragment_invalid_placement",
        ] {
            if text.contains(code) {
                return code.to_string();
            }
        }
        text
    })
}

fn assert_ok(body: &str) {
    assert_eq!(verdict(body), Ok(()), "for {body}");
}

fn assert_err(body: &str, code: &str) {
    assert_eq!(verdict(body), Err(code.to_string()), "for {body}");
}

/// The over-rejection: `<svelte:self>` is a `slot` host.
#[test]
fn svelte_self_is_a_slot_host() {
    assert_ok("<svelte:self depth={1}>\n\t\t<b slot=\"head\">h</b>\n\t</svelte:self>");
    assert_ok("<Comp>\n\t\t<b slot=\"head\">h</b>\n\t</Comp>");
    assert_ok("<svelte:component this={Comp}>\n\t\t<b slot=\"head\">h</b>\n\t</svelte:component>");
}

/// The over-acceptance: `<svelte:element>` is NOT a `<svelte:fragment>` host,
/// and neither is `<svelte:self>` — the two lists differ.
#[test]
fn only_a_component_hosts_a_svelte_fragment() {
    assert_ok("<Comp>\n\t\t<svelte:fragment slot=\"head\">h</svelte:fragment>\n\t</Comp>");
    assert_ok(
        "<svelte:component this={Comp}>\n\t\t<svelte:fragment slot=\"head\">h</svelte:fragment>\n\t</svelte:component>",
    );
    for host in [
        "<svelte:element this={\"div\"}>\n\t\t{CHILD}\n\t</svelte:element>",
        "<svelte:self depth={1}>\n\t\t{CHILD}\n\t</svelte:self>",
        "<div>\n\t\t{CHILD}\n\t</div>",
        "<svelte:boundary>\n\t\t{CHILD}\n\t</svelte:boundary>",
    ] {
        for child in [
            "<svelte:fragment slot=\"head\">h</svelte:fragment>",
            "<svelte:fragment>h</svelte:fragment>",
        ] {
            assert_err(
                &host.replace("{CHILD}", child),
                "svelte_fragment_invalid_placement",
            );
        }
    }
}

/// A `<svelte:element>` or custom-element owner accepts a `slot` at ANY depth,
/// which is the half of the slot rule that the direct-child flag cannot
/// express — and the reason `<svelte:element>` had to move from the flag to the
/// owner stack rather than simply be dropped.
#[test]
fn a_dynamic_or_custom_element_owner_accepts_a_slot_at_any_depth() {
    assert_ok("<svelte:element this={\"div\"}>\n\t\t<b slot=\"head\">h</b>\n\t</svelte:element>");
    assert_ok(
        "<svelte:element this={\"div\"}><span><b slot=\"head\">h</b></span></svelte:element>",
    );
    assert_ok("<my-el>\n\t\t<b slot=\"head\">h</b>\n\t</my-el>");
    assert_ok("<my-el><span><b slot=\"head\">h</b></span></my-el>");
}

/// The control in the other direction: a COMPONENT owner still requires a
/// direct child, so a `slot` one element deeper is rejected. This is what the
/// first attempt at the fix broke.
#[test]
fn a_component_owner_still_requires_a_direct_child() {
    assert_err(
        "<Comp>\n\t\t<div><b slot=\"head\">h</b></div>\n\t</Comp>",
        "slot_attribute_invalid_placement",
    );
    assert_err(
        "<svelte:self depth={1}><div><b slot=\"head\">h</b></div></svelte:self>",
        "slot_attribute_invalid_placement",
    );
    assert_err(
        "<div>\n\t\t<b slot=\"head\">h</b>\n\t</div>",
        "slot_attribute_invalid_placement",
    );
    assert_err(
        "<svelte:boundary>\n\t\t<b slot=\"head\">h</b>\n\t</svelte:boundary>",
        "slot_attribute_invalid_placement",
    );
}

/// Every child-bearing host must break the direct-child relation, and the four
/// below did not: they never touched the flag at all, so the component one
/// level up leaked through them. Nothing found this before because the flag was
/// only ever exercised at top level, where its default is already `false` — the
/// host and the enclosing component are two axes and only one was varied.
#[test]
fn an_intervening_host_breaks_the_direct_child_relation() {
    for wrapper in [
        "<svelte:boundary>{CHILD}</svelte:boundary>",
        "<slot name=\"s\">{CHILD}</slot>",
        "<svelte:element this={\"div\"}>{CHILD}</svelte:element>",
        "{#snippet sn()}{CHILD}{/snippet}",
        "<svelte:fragment slot=\"a\">{CHILD}</svelte:fragment>",
        "{#await Promise.resolve(1) then _}{CHILD}{/await}",
    ] {
        for (child, code) in [
            ("<b slot=\"head\">h</b>", "slot_attribute_invalid_placement"),
            (
                "<svelte:fragment slot=\"head\">h</svelte:fragment>",
                "svelte_fragment_invalid_placement",
            ),
        ] {
            let body = format!("<Comp>{}</Comp>", wrapper.replace("{CHILD}", child));
            // Two rows keep the `slot` half legal: a `<svelte:element>` owner
            // owns a `slot` at any depth, and a direct child of a `{#snippet}`
            // is exempt from the rule altogether. Their fragment halves are
            // still errors, which is what makes the two rules separable here.
            let slot_half = code.starts_with("slot_");
            if slot_half
                && (wrapper.starts_with("<svelte:element") || wrapper.starts_with("{#snippet"))
            {
                assert_ok(&body);
            } else {
                assert_err(&body, code);
            }
        }
    }
}
