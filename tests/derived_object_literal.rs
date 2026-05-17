//! Regression test for client-side `$derived(objectLiteral…)` losing its
//! object-literal interpretation (baseballyama/rsvelte#150).
//!
//! Bug: `$derived(expr)` is rewritten to `$.derived(() => expr)`. When `expr`
//! starts with `{`, the resulting `() => { … }` is parsed as an arrow with a
//! block body — the object contents become labelled statements and the build
//! fails. Wrap the body in parens (`() => ({ … })`) so the arrow returns the
//! object expression.

use svelte_compiler_rust::{CompileOptions, GenerateMode, compile};

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
fn derived_with_object_literal_index_is_paren_wrapped() {
    let src = r#"<script>
  let pos = $state('center');
  const cls = $derived({ center: 'a', left: 'b' }[pos] ?? 'c');
</script>
<div>{cls}</div>"#;
    let out = compile_client(src);
    // Must wrap in parens so the body is an object-returning expression,
    // not a block.
    assert!(
        out.contains("() => ({"),
        "expected arrow body to be paren-wrapped (`() => ({{ … }})`). Got:\n{out}"
    );
    assert!(
        !out.contains("() => { center:"),
        "unwrapped arrow body would be parsed as a block. Got:\n{out}"
    );
}

#[test]
fn derived_with_object_literal_alone_is_paren_wrapped() {
    // The bare object case — `$derived({ a, b })` should still work.
    let src = r#"<script>
  let a = $state(1);
  let b = $state(2);
  const obj = $derived({ a, b });
</script>
<pre>{JSON.stringify(obj)}</pre>"#;
    let out = compile_client(src);
    assert!(
        out.contains("() => ({"),
        "expected arrow body to be paren-wrapped. Got:\n{out}"
    );
}

#[test]
fn derived_with_non_object_expression_stays_unwrapped() {
    // Regression guard: simple expression bodies must NOT acquire spurious
    // outer parens. They already work today, so unthunk_string's default
    // `() => expr` path produces compact output without the extra parens.
    let src = r#"<script>
  let n = $state(0);
  const doubled = $derived(n * 2);
</script>
<span>{doubled}</span>"#;
    let out = compile_client(src);
    // The arrow body must not be paren-wrapped — only object-literal bodies
    // need the disambiguation.
    assert!(
        out.contains("() => n * 2"),
        "expected `() => n * 2` (no extra parens). Got:\n{out}"
    );
    assert!(
        !out.contains("() => (n * 2)"),
        "expression body should not be unnecessarily paren-wrapped. Got:\n{out}"
    );
}

#[test]
fn derived_with_simple_identifier_call_still_unthunks() {
    // `$derived(foo())` should unthunk to `$.derived(foo)` — make sure the
    // paren-wrap branch doesn't intercept that.
    let src = r#"<script>
  import { getX } from './x.js';
  const x = $derived(getX());
</script>
<span>{x}</span>"#;
    let out = compile_client(src);
    assert!(
        out.contains("$.derived(getX)"),
        "expected unthunked `$.derived(getX)`. Got:\n{out}"
    );
}
