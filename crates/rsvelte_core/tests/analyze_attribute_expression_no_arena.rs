//! Regression: phase 2 analyze must not panic when an attribute value is a
//! complex expression (arena-allocated `JsNode`) and no serialize arena has
//! been installed on the calling thread.
//!
//! The previous implementation called `serde_json::to_value(&expr_tag.expression)`
//! directly in `regular_element::visit`. That goes through `JsNode::serialize`,
//! which dereferences `SERIALIZE_ARENA` via `expect("serialize arena not set")`
//! for every nested child id. WASM and the `compile_profile` binary set up
//! the arena explicitly, but `analyze_component` itself does not — so any
//! direct caller (the `profiler` binary, downstream embedders, future bench
//! harnesses) hit the panic on the first non-trivial expression attribute.
//!
//! The fix is to use `Expression::as_json()` which falls back to a
//! per-thread deserialization arena when no serialize arena is active.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_client(src: &str) {
    compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile must not panic");
}

#[test]
fn arrow_function_attribute_value_does_not_panic() {
    // Arrow function as event handler — `JsNode::ArrowFunctionExpression`
    // owns arena-allocated children, so serializing it requires the arena.
    let src = r#"<script>
  let count = $state(0);
</script>
<button onclick={() => count++}>{count}</button>"#;
    compile_client(src);
}

#[test]
fn class_attribute_with_arrow_expression_does_not_panic() {
    // Complex `class={…}` expression. Was the second regression path
    // (`AttributeValue::Expression` branch in `regular_element::visit`).
    let src = r#"<script>
  let active = $state(true);
</script>
<div class={active ? 'on' : 'off'}>x</div>"#;
    compile_client(src);
}

#[test]
fn sequence_class_with_member_expression_does_not_panic() {
    // `class="a-{obj.x}"` — sequence with an `ExpressionTag` whose
    // expression is a `MemberExpression` (also arena-allocated).
    let src = r#"<script>
  let obj = $state({ x: 1 });
</script>
<div class="a-{obj.x}">y</div>"#;
    compile_client(src);
}
