//! The SSR constant fold is vetoed by name through `slot_let_shadows`, and
//! three template bindings were missing from it (#3215): an `{#await … then n}`
//! value, an `{#each … as _, n}` index used directly as the loop variable, and
//! every each-block binding inside the `{:else}` fallback — which upstream
//! visits with the each block's own scope.
//!
//! Every expectation here is the official compiler's output for the same source.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

const PRELUDE: &str =
    "<script>\n\tlet n = 7;\n\tconst pr = Promise.resolve(1);\n\tlet items = [1, 2];\n</script>\n";

fn server(body: &str) -> String {
    compile(
        &format!("{PRELUDE}{body}"),
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Server,
            dev: false,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

#[test]
fn an_await_value_shadows_the_instance_binding() {
    for body in [
        "{#await pr then n}<b>{n}</b>{/await}",
        "{#await pr then { n }}<b>{n}</b>{/await}",
    ] {
        let out = server(body);
        assert!(out.contains("${$.escape(n)}"), "{body}\n{out}");
        assert!(!out.contains("<b>7</b>"), "{body}\n{out}");
    }
}

#[test]
fn an_each_index_used_as_the_loop_variable_shadows_the_instance_binding() {
    // No group binding, so the loop variable IS the user's name and there is no
    // alias declaration to record the shadow from.
    let out = server("{#each items as _, n}<b>{n}</b>{/each}");
    assert!(out.contains("${$.escape(n)}"), "{out}");
    assert!(!out.contains("<b>7</b>"), "{out}");
}

#[test]
fn the_else_fallback_is_inside_the_each_scope() {
    // Nothing is bound to `n` when the fallback runs, but upstream still visits
    // it with the each scope (`if (node.fallback) visit(node.fallback, { scope })`),
    // so the read must not fold to the instance literal.
    let out = server("{#each items as n}<b>{n}</b>{:else}<i>{n}</i>{/each}");
    assert!(out.contains("<i>${$.escape(n)}</i>"), "{out}");
    assert!(!out.contains("<i>7</i>"), "{out}");
}

#[test]
fn a_non_shadowing_name_still_folds() {
    // The negative control: without a shadow the instance literal must still be
    // inlined, or the fix would be a blanket disable of the fold.
    let out = server("{#each items as q}<b>{n}</b>{/each}");
    assert!(out.contains("<b>7</b>"), "{out}");

    let out = server("{#await pr then q}<b>{n}</b>{/await}");
    assert!(out.contains("<b>7</b>"), "{out}");
}
