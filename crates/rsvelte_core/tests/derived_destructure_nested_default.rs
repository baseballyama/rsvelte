//! Regression test for `let { prop: { a, b } = default } = $derived(expr)`
//! (baseballyama/rsvelte#163).
//!
//! Two bugs landed together:
//!
//! 1. `find_and_transform_one_destructure` interpreted the inner sub-pattern's
//!    default-value form (`{ a, b } = default`) as a destructure *assignment*
//!    and wrapped it in an `(($$value) => { … })(rhs)` IIFE — which is
//!    invalid JavaScript at LValue position. Now suppressed when the inner
//!    `{`/`[` is nested inside an enclosing binding pattern.
//!
//! 2. The fallback emitter built `() => default` arrow bodies without
//!    paren-wrapping object-literal defaults, so `default = { width: 0, … }`
//!    became `() => { width: 0, … }` — an arrow with a *block* body, not
//!    one returning the object. Mirrors the same fix from #150 / #151.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_client(src: &str) -> String {
    let result = compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile");
    result.js.code
}

#[test]
fn nested_pattern_with_object_default_emits_per_leaf_derived() {
    let src = r#"<script>
  let { node } = $props();
  let {
    measured: { width: measuredWidth, height: measuredHeight } = { width: 0, height: 0 },
  } = $derived(node);
</script>
<p>{measuredWidth} {measuredHeight}</p>"#;
    let out = compile_client(src);
    // No IIFE inside the destructure LHS slot.
    assert!(
        !out.contains("(($$value) =>"),
        "found IIFE in destructure LHS (invalid JS):\n{out}"
    );
    // Each leaf should be its own `$.derived(...)` declaration.
    assert!(
        out.contains("measuredWidth = $.derived"),
        "expected `measuredWidth = $.derived(...)`. Got:\n{out}"
    );
    assert!(
        out.contains("measuredHeight = $.derived"),
        "expected `measuredHeight = $.derived(...)`. Got:\n{out}"
    );
    // Default object literal must be paren-wrapped in the arrow body.
    assert!(
        out.contains("() => ({"),
        "default-value arrow body must be paren-wrapped to return the object:\n{out}"
    );
    // $.fallback wires the default and the property access.
    assert!(
        out.contains("$.fallback"),
        "expected `$.fallback` call. Got:\n{out}"
    );
}

#[test]
fn nested_pattern_with_object_default_no_iife_remnants() {
    // Make sure `$derived(node)` itself was rewritten to `$.derived(...)` and
    // not left as the raw rune call.
    let src = r#"<script>
  let { node } = $props();
  let {
    measured: { width: measuredWidth } = { width: 0 },
  } = $derived(node);
</script>
<p>{measuredWidth}</p>"#;
    let out = compile_client(src);
    assert!(
        !out.contains("$derived(node)"),
        "the `$derived(node)` rune was not rewritten:\n{out}"
    );
}

#[test]
fn destructure_assignment_with_reactive_target_still_rewrites() {
    // Regression guard: top-level destructure ASSIGNMENT (no `let`) of state
    // variables must still be rewritten so reactivity is honoured — the
    // exact form is a comma-separated sequence of `$.set(...)` calls.
    let src = r#"<script>
  let a = $state(0);
  let b = $state(0);
  function pull(obj) {
    ({ x: a, y: b } = obj);
  }
</script>
<button onclick={() => pull({ x: 1, y: 2 })}>go</button>"#;
    let out = compile_client(src);
    assert!(
        out.contains("$.set(a,") && out.contains("$.set(b,"),
        "destructure assignment of reactive targets should rewrite to $.set calls:\n{out}"
    );
}
