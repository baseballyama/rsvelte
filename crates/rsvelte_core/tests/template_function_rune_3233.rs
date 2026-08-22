//! Issue #3233: a rune declared inside a function body that lives in a template
//! expression is the same declaration as one inside `<script>`, and gets the
//! same lowering.
//!
//! The template converter treated every such `$state` as a plain local ("no
//! reactive tracking needed"), so `let x = $state(1); x = 2;` in an event
//! handler emitted `let x = 1;` next to a `$.set(x, 2)` that sets a non-signal —
//! the declaration and the assignment disagreed about whether `x` was a signal.
//! Upstream's rule is `is_state_source`: a source iff the binding is reassigned.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(src: &str, dev: bool) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Client,
            dev,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

/// A reassigned `$state` local becomes a source, and its reads go through
/// `$.get` — the two halves that used to disagree.
#[test]
fn a_reassigned_state_local_in_a_handler_is_a_source() {
    let out = client(
        "<script>\n\tlet v = $state(1);\n\tfunction use(a) { return a; }\n</script>\n\n<b onclick={() => { let x = $state(1); x = 2; use(x); }}>{v}</b>\n",
        false,
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("let x = $.state(1);"),
        "declaration not lowered:\n{out}"
    );
    assert!(out.contains("$.set(x, 2)"), "{out}");
    assert!(
        out.contains("use($.get(x))"),
        "the read of a local source was not wrapped:\n{out}"
    );
}

/// `$state.raw` reaches the same rule.
#[test]
fn a_reassigned_raw_state_local_is_a_source() {
    let out = client(
        "<script>\n\tlet v = $state(1);\n</script>\n\n<b onclick={() => { let x = $state.raw(1); x = 2; }}>{v}</b>\n",
        false,
    );
    assert!(out.contains("let x = $.state(1);"), "{out}");
}

/// Over-lowering guard: a local that is never reassigned stays a plain value,
/// exactly as one declared at the top of the instance script does.
#[test]
fn a_state_local_that_is_never_reassigned_stays_a_plain_value() {
    let out = client(
        "<script>\n\tlet v = $state(1);\n</script>\n\n<b onclick={() => { let x = $state(1); v = x; }}>{v}</b>\n",
        false,
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("let x = 1;") && !out.contains("let x = $.state("),
        "a non-reassigned local became a source:\n{out}"
    );
}

/// A `$derived` local is always a signal, so its reads need `$.get` too.
#[test]
fn a_derived_local_in_a_handler_reads_through_get() {
    let out = client(
        "<script>\n\tlet v = $state(1);\n</script>\n\n<b onclick={() => { let x = $derived(v); v = x; }}>{v}</b>\n",
        false,
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("$.derived("), "{out}");
    assert!(
        out.contains("$.set(v, $.get(x), true)"),
        "the read of a local derived was not wrapped:\n{out}"
    );
}

/// Dev mode labels a declared signal with the name it is bound to.
#[test]
fn dev_tags_a_signal_declared_in_a_template_function() {
    let out = client(
        "<script>\n\tlet v = $state(1);\n</script>\n\n<b onclick={() => { let x = $state(1); x = 2; }}>{v}</b>\n",
        true,
    );
    assert!(out.contains("$.tag($.state(1), 'x')"), "{out}");

    let out = client(
        "<script>\n\tlet v = $state(1);\n</script>\n\n<b onclick={() => { let x = $derived(v); v = x; }}>{v}</b>\n",
        true,
    );
    assert!(out.contains("$.tag($.derived("), "{out}");
}

/// A plain local still shadows an outer signal of the same name — the change
/// must not turn every block-local declaration into a signal.
#[test]
fn a_plain_local_still_shadows_an_outer_signal() {
    let out = client(
        "<script>\n\tlet count = $state(1);\n\tfunction use(a) { return a; }\n\tfunction bump() { count += 1; }\n</script>\n\n<b onclick={() => { let count = 1; use(count); bump(); }}>{count}</b>\n",
        false,
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("use(count)"),
        "a shadowing plain local was wrapped as a signal:\n{out}"
    );
}
