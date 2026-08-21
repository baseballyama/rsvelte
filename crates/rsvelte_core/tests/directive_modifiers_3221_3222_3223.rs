//! Directive modifiers, across the host axis (#3221, #3222, #3223).
//!
//! Upstream splits EVERY directive name on `|` in one place
//! (`1-parse/state/element.js`, `tag.name.slice(colon_index + 1).split('|')`) and
//! only then lets each directive decide which modifiers it accepts. Three
//! decisions had drifted here, and each expected value below was read off the
//! official compiler:
//!
//! * `use:` / `class:` / `animate:` / `let:` — the directives whose accepted
//!   modifier list is EMPTY — never split, so the modifier stayed inside the
//!   emitted name (#3221).
//! * `style:` modifier validation ran from the `RegularElement` / `SvelteElement`
//!   visitors only, so `<svelte:body|window|document>` accepted an unknown one
//!   (#3222) — and it tested membership rather than the whole list, so a repeated
//!   `important` passed on every host.
//! * a component's `on:` modifier check was membership too, so `|once|once`
//!   compiled (#3223) on `Component` and `<svelte:self>` while
//!   `<svelte:component>` — a third copy of the same check — rejected it.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

const SCRIPT: &str = "<script>\n\timport Comp from './Comp.svelte';\n\timport { flip } from 'svelte/animate';\n\tlet flag = true;\n\tlet color = 'red';\n\tlet items = [{ id: 1 }];\n\tfunction handler() {}\n\tfunction action() {}\n</script>\n";

fn compile_src(src: &str, generate: GenerateMode) -> Result<String, String> {
    compile(
        src,
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

fn client(markup: &str) -> String {
    compile_src(&format!("{SCRIPT}{markup}"), GenerateMode::Client)
        .unwrap_or_else(|e| panic!("expected {markup} to compile, got: {e}"))
}

fn server(markup: &str) -> String {
    compile_src(&format!("{SCRIPT}{markup}"), GenerateMode::Server)
        .unwrap_or_else(|e| panic!("expected {markup} to compile, got: {e}"))
}

fn client_err(markup: &str) -> String {
    compile_src(&format!("{SCRIPT}{markup}"), GenerateMode::Client)
        .err()
        .unwrap_or_else(|| panic!("expected {markup} to be rejected"))
}

// ---- #3221: the modifier must not reach codegen ----------------------------

/// The hosts on which `use:` and `animate:` are legal and lowered by the client
/// transform. `%s` is the directive.
const ACTION_HOSTS: &[&str] = &[
    "<div %s>x</div>",
    "<input %s />",
    "<svelte:element this={'div'} %s>x</svelte:element>",
    "<svelte:body %s />",
    "<svelte:window %s />",
    "<svelte:document %s />",
    "{#each items as item (item.id)}<div %s>x</div>{/each}",
];

/// The hosts on which `class:` is legal, compared on both targets — the server
/// drops `use:` and `animate:` entirely, so `class:` is the only one of the
/// three whose divergence is observable there.
const CLASS_HOSTS: &[&str] = &[
    "<div %s>x</div>",
    "<input %s />",
    "<svelte:element this={'div'} %s>x</svelte:element>",
    "{#each items as item (item.id)}<div %s>x</div>{/each}",
    "<svelte:head><div %s>x</div></svelte:head>",
];

#[test]
fn use_modifier_is_not_part_of_the_action_name() {
    for host in ACTION_HOSTS {
        let out = client(&host.replace("%s", "use:action|once"));
        assert!(
            !out.contains("action|once"),
            "modifier leaked into the action name on {host}:\n{out}"
        );
        assert!(
            out.contains("action?."),
            "expected the plain action call on {host}:\n{out}"
        );
        assert_eq!(
            out,
            client(&host.replace("%s", "use:action")),
            "a modifier `use:` does not accept must not change the output on {host}"
        );
    }
}

#[test]
fn animate_modifier_is_not_part_of_the_transition_name() {
    let host = "{#each items as item (item.id)}<div %s>x</div>{/each}";
    let out = client(&host.replace("%s", "animate:flip|local"));
    assert!(
        !out.contains("flip|local"),
        "modifier leaked into the animation name:\n{out}"
    );
    assert_eq!(
        out,
        client(&host.replace("%s", "animate:flip")),
        "a modifier `animate:` does not accept must not change the output"
    );
}

#[test]
fn class_modifier_is_not_part_of_the_class_name() {
    for host in CLASS_HOSTS {
        for spelling in ["class:on|once={flag}", "class:on|once"] {
            let plain = spelling.replace("|once", "");
            for out in [
                client(&host.replace("%s", spelling)),
                server(&host.replace("%s", spelling)),
            ] {
                assert!(
                    !out.contains("on|once"),
                    "modifier leaked into the class name on {host} ({spelling}):\n{out}"
                );
            }
            assert_eq!(
                client(&host.replace("%s", spelling)),
                client(&host.replace("%s", &plain)),
                "client output must not depend on a modifier `class:` does not accept ({host}, {spelling})"
            );
            assert_eq!(
                server(&host.replace("%s", spelling)),
                server(&host.replace("%s", &plain)),
                "server output must not depend on a modifier `class:` does not accept ({host}, {spelling})"
            );
        }
    }
}

#[test]
fn let_modifier_is_not_part_of_the_slot_variable_name() {
    for host in [
        "<div %s>x</div>",
        "<input %s />",
        "{#each items as item (item.id)}<div %s>x</div>{/each}",
        "<Comp %s>x</Comp>",
    ] {
        let out = client(&host.replace("%s", "let:x|foo"));
        assert!(
            !out.contains("x|foo"),
            "modifier leaked into the let: name on {host}:\n{out}"
        );
        assert_eq!(
            out,
            client(&host.replace("%s", "let:x")),
            "a modifier `let:` does not accept must not change the output on {host}"
        );
    }
}

#[test]
fn an_empty_directive_name_before_a_modifier_is_still_empty() {
    for markup in ["<div use:|once>x</div>", "<div class:|once>x</div>"] {
        let err = client_err(markup);
        assert!(
            err.contains("directive_missing_name"),
            "expected directive_missing_name for {markup}, got: {err}"
        );
    }
}

// ---- #3222: `style:` modifier validation, on every host --------------------

/// Every host `style:` is legal on. The regular-element rows are the control:
/// they already rejected an unknown modifier, so a run where they alone fail
/// separates "the rule broke" from "the rule never ran here".
const STYLE_HOSTS: &[&str] = &[
    "<div %s>x</div>",
    "<input %s />",
    "<svelte:element this={'div'} %s>x</svelte:element>",
    "<svelte:head><div %s>x</div></svelte:head>",
    "{#each items as item (item.id)}<div %s>x</div>{/each}",
    "<svelte:body %s />",
    "<svelte:window %s />",
    "<svelte:document %s />",
];

#[test]
fn unknown_style_modifier_is_rejected_on_every_host() {
    for host in STYLE_HOSTS {
        for spelling in ["style:color|nope={color}", "style:color|nope"] {
            let err = client_err(&host.replace("%s", spelling));
            assert!(
                err.contains("style_directive_invalid_modifier"),
                "expected style_directive_invalid_modifier on {host} ({spelling}), got: {err}"
            );
        }
    }
}

#[test]
fn repeated_important_style_modifier_is_rejected_on_every_host() {
    for host in STYLE_HOSTS {
        let err = client_err(&host.replace("%s", "style:color|important|important={color}"));
        assert!(
            err.contains("style_directive_invalid_modifier"),
            "expected style_directive_invalid_modifier on {host}, got: {err}"
        );
    }
}

#[test]
fn a_single_important_style_modifier_is_accepted_on_every_host() {
    for host in STYLE_HOSTS {
        for spelling in ["style:color|important={color}", "style:color|important"] {
            client(&host.replace("%s", spelling));
            server(&host.replace("%s", spelling));
        }
    }
}

// ---- #3223: a component's `on:` modifier list is compared, not searched ----

/// The three hosts that carry a component's `on:` modifier check. They are three
/// separate copies of it here, and only `<svelte:component>` had it right.
const COMPONENT_HOSTS: &[&str] = &[
    "<Comp %s />",
    "<svelte:component this={Comp} %s />",
    "{#if flag}<svelte:self %s />{/if}",
];

#[test]
fn repeated_once_on_a_component_handler_is_rejected() {
    for host in COMPONENT_HOSTS {
        let err = client_err(&host.replace("%s", "on:click|once|once={handler}"));
        assert!(
            err.contains("event_handler_invalid_component_modifier"),
            "expected event_handler_invalid_component_modifier on {host}, got: {err}"
        );
    }
}

#[test]
fn a_single_once_on_a_component_handler_is_accepted() {
    for host in COMPONENT_HOSTS {
        client(&host.replace("%s", "on:click|once={handler}"));
    }
}

#[test]
fn repeated_once_on_a_regular_element_is_still_legal() {
    // The negative control for the check above: upstream applies the whole-list
    // comparison to components only, so the element arm must keep accepting it.
    client("<div on:click|once|once={handler}>x</div>");
}
