//! `<!-- svelte-ignore ownership_invalid_mutation -->` reaches a `bind:` setter.
//!
//! Upstream `c7d8233` (svelte#18718) copies the directive's ignores onto the
//! assignment `BindDirective` synthesizes, so `validate_mutation` bails on it.
//! What a node carries is the WHOLE enclosing stack
//! (`ignore_map.set(node, get_ignore_snapshot())`, `2-analyze/index.js:138`), so
//! an ignore on a wrapping block reaches the element inside it — the `{#each}`
//! and `{#if}` rows are what separate the node's own comment from the stack.
//!
//! `build_bind_this` builds its own assignment and inherits nothing, so
//! `bind:this` is the negative control: the same comment must NOT suppress it.
//! Every expectation is the pinned oracle's own answer (Svelte v5.57.0).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

const HEAD: &str = "<script>\n\tlet { item } = $props();\n</script>\n\n";
const IGNORE: &str = "<!-- svelte-ignore ownership_invalid_mutation -->\n";

fn client_dev(markup: &str) -> String {
    compile(
        &format!("{HEAD}{markup}\n"),
        CompileOptions {
            filename: Some("X.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// Both halves of the emission: the preamble declaration and the call. A fix
/// that dropped only the call would leave an unused `$$ownership_validator`.
fn validates(markup: &str) -> bool {
    let out = client_dev(markup);
    let declared = out.contains("$$ownership_validator = $.create_ownership_validator");
    let called = out.contains("$$ownership_validator.mutation(");
    assert_eq!(
        declared, called,
        "the declaration and the call must agree:\n{out}"
    );
    called
}

#[test]
fn an_ignore_on_the_element_suppresses_its_binding() {
    assert!(
        validates("<input bind:value={item.heading} />"),
        "control: without the comment the setter is validated"
    );
    assert!(
        !validates(&format!("{IGNORE}<input bind:value={{item.heading}} />")),
        "the directive inherits the element's ignores"
    );
}

#[test]
fn an_ignore_on_a_wrapping_block_reaches_the_binding() {
    for wrapper in [
        "{#each [1] as i}<input bind:value={item.heading} />{/each}",
        "{#if true}<input bind:value={item.heading} />{/if}",
    ] {
        assert!(
            validates(wrapper),
            "control: without the comment {wrapper} is validated"
        );
        assert!(
            !validates(&format!("{IGNORE}{wrapper}")),
            "an ignore on the wrapping block reaches the element: {wrapper}"
        );
    }
}

/// `build_bind_this` synthesizes its own assignment and copies no ignores, so
/// the same comment leaves `bind:this` validated. A shared helper that read the
/// flag for every binding kind would fail here.
#[test]
fn the_same_ignore_does_not_reach_bind_this() {
    assert!(
        validates(&format!("{IGNORE}<div bind:this={{item.el}}></div>")),
        "bind:this inherits no ignores"
    );
}
