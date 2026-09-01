//! An `{#await … then X}` / `{:catch X}` binding shadows a prop of the same name.
//!
//! Upstream shadows by overriding the transform:
//!
//! ```js
//! // 3-transform/client/visitors/AwaitBlock.js, create_derived_block_argument
//! context.state.transform[node.name] = { read: get_value };
//! ```
//!
//! rsvelte registered that transform too — and still emitted the prop read,
//! because a non-source prop never reaches `state.transform`: the identifier
//! arm returns `$$props.name` early and its only shadow guard is
//! `shadowed_prop_names`, which `each_block`, `snippet_block` and `const_tag`
//! all populate and the await visitor did not.
//!
//! A prop with a DEFAULT was unaffected, which is why this looked narrower than
//! it was: a default makes the prop a source, so the read falls through to the
//! transform that was already correct. The population is a runes-mode prop with
//! no default, `$bindable()` included.
//!
//! The controls matter in both directions here. A binding whose name does not
//! collide must keep reading `$.get(value)`; an `{#each}` item shadowing the
//! same prop must keep working; and the top-level reads before the blocks must
//! stay `$$props.code`, or the fix would be "never read the prop".

use rsvelte_core::{CompileOptions, CssMode, GenerateMode, compile};

const SRC: &str = include_str!(
    "../../../compatibility/pattern-corpus/issues/4107-await-block-binding-shadows-a-prop.svelte"
);

fn client(dev: bool) -> String {
    compile(
        SRC,
        CompileOptions {
            filename: Some("C.svelte".into()),
            generate: GenerateMode::Client,
            dev,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

#[test]
fn an_await_binding_wins_over_a_prop_of_the_same_name() {
    for (label, dev) in [("client", false), ("client-dev", true)] {
        let code = client(dev);
        assert!(!code.contains("COMPILE_ERROR"), "{label}: {code}");

        // `then`, `catch` and a destructured `then` each bind `code`; the
        // attribute is a second read site inside the first block.
        assert_eq!(
            code.matches("$.get(code)").count(),
            4,
            "{label}: an await binding did not shadow the prop:\n{code}"
        );
        assert!(
            !code.contains("$$props.code)")
                && !code.contains("$.set_attribute(div, 'id', $$props.code)"),
            "{label}: a read inside an await block still went to the prop:\n{code}"
        );
    }
}

#[test]
fn the_shadow_does_not_escape_the_block() {
    // The top-level `{code}` and `{rest.x}` sit before every block and must
    // stay prop reads — otherwise the fix is "never read the prop".
    for (label, dev) in [("client", false), ("client-dev", true)] {
        let code = client(dev);
        assert!(
            code.contains("$$props.code") && code.contains("$$props.x"),
            "{label}: a top-level prop read was captured by a block binding:\n{code}"
        );
    }
}

#[test]
fn the_neighbouring_binding_kinds_do_not_move() {
    // Controls, each already correct before the fix: a non-colliding `then`
    // binding, an `{#each}` item shadowing the same prop, and a prop with a
    // default (a source prop, which never took the `$$props.` path).
    for (label, dev) in [("client", false), ("client-dev", true)] {
        let code = client(dev);
        assert!(
            code.contains("$.get(value)"),
            "{label}: a non-colliding await binding lost its read:\n{code}"
        );
        // The each item is the callback's own parameter, so its read is the
        // bare name — not a `$.get`, and not the prop.
        assert!(
            code.contains("$.set_text(text_6, code));"),
            "{label}: the each item's own read moved:\n{code}"
        );
        assert!(
            code.contains("$.get(other)"),
            "{label}: the defaulted prop's await binding moved:\n{code}"
        );
    }
}

#[test]
fn the_server_target_is_unaffected() {
    let out = compile(
        SRC,
        CompileOptions {
            filename: Some("C.svelte".into()),
            generate: GenerateMode::Server,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"));

    assert!(!out.contains("COMPILE_ERROR"), "server: {out}");
    assert!(
        !out.contains("$.get(code)"),
        "server: a client-only read wrapper leaked into SSR:\n{out}"
    );
}
