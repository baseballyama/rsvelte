//! Regression tests for issue #2029 — the dev `$.apply` event-handler wrapper
//! was emitted for `onclick={…}` but not for the legacy `on:click={…}` form.
//!
//! Upstream builds both through one `build_event_handler`, so the two paths must
//! agree: a handler that is an inline function or a plain function declaration is
//! passed straight through, and anything else is wrapped — in dev via `$.apply`,
//! otherwise via `handler?.apply(this, $$args)`.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compile_client(src: &str, dev: bool) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Comp.svelte".to_string()),
            generate: GenerateMode::Client,
            dev,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

#[test]
fn legacy_member_handler_uses_apply_in_dev() {
    let src =
        "<script>export let selfControl;</script><button on:click={selfControl.toggle}>go</button>";
    let out = compile_client(src, true);
    assert!(
        out.contains("$.apply(() => selfControl().toggle, this, $$args, Comp, [1, 58])"),
        "in:\n{out}"
    );
}

#[test]
fn legacy_imported_handler_uses_apply_in_dev() {
    let src = "<script>import { f } from './h.js';</script><button on:click={f}>go</button>";
    let out = compile_client(src, true);
    assert!(
        out.contains("$.apply(() => f, this, $$args, Comp,"),
        "in:\n{out}"
    );
}

/// A call handler is memoized first, and carries the two trailing flags:
/// `has_side_effects` (it is a call) and `remove_parens` (zero-arg identifier callee).
#[test]
fn legacy_call_handler_carries_the_trailing_flags() {
    let src = "<script>export let cb;</script><button on:click={cb()}>go</button>";
    let out = compile_client(src, true);
    assert!(
        out.contains("$.apply(() => $.get(event_handler), this, $$args, Comp,"),
        "in:\n{out}"
    );
    assert!(
        out.contains("], true, true)"),
        "missing trailing flags in:\n{out}"
    );
}

#[test]
fn production_keeps_the_optional_apply_form() {
    let src =
        "<script>export let selfControl;</script><button on:click={selfControl.toggle}>go</button>";
    let out = compile_client(src, false);
    assert!(
        out.contains("selfControl().toggle?.apply(this, $$args)"),
        "in:\n{out}"
    );
    assert!(
        !out.contains("$.apply("),
        "dev wrapper leaked into production:\n{out}"
    );
}

/// Handlers upstream passes straight through must not gain a wrapper.
#[test]
fn inline_and_declared_handlers_are_not_wrapped() {
    for src in [
        "<script>let n = 0;</script><button on:click={() => n++}>go</button>",
        "<script>function f() {}</script><button on:click={f}>go</button>",
    ] {
        let out = compile_client(src, true);
        assert!(!out.contains("$.apply("), "handler was wrapped in:\n{out}");
    }
}

/// An identifier that resolves to no binding is a global. Outside dev it is used
/// as-is, but dev still wraps it — upstream only short-circuits on `!dev`, so the
/// unbound case must not return early on its own.
#[test]
fn unbound_global_handler_is_wrapped_in_dev_only() {
    let src = "<button on:click={someGlobal}>go</button>";
    let dev = compile_client(src, true);
    assert!(
        dev.contains("$.apply(() => someGlobal, this, $$args, Comp, [1, 18])"),
        "in:\n{dev}"
    );
    let prod = compile_client(src, false);
    assert!(!prod.contains("$.apply("), "in:\n{prod}");
}
