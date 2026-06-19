//! Regression test: `bind:prop={() => get, set}` (SequenceExpression binding) in a component
//! must emit `return bind_get();` / `bind_set($$value);` in the getter/setter bodies, NOT the
//! raw extracted expressions.
//!
//! Bug: `ComponentPropItem::Binding` stored the raw getter/setter expressions (e.g.
//! `() => checked` / `onCheckedChange`) and the emission in build.rs wrote them directly into the
//! getter/setter bodies.  The official compiler hoists the expressions into `var bind_get = …;`
//! `var bind_set = …;` declarations and then references them as `bind_get()` / `bind_set($$value)`
//! inside the accessor object.
//!
//! Fix: `ComponentPropItem::Binding::getter_expr` / `setter_expr` now hold the **call expressions**
//! (`bind_get()` / `bind_set($$value)`) that reference the hoisted vars, while the raw expressions
//! are stored only in `ComponentBinding::SequenceExpression` for the `VarDeclaration` hoisting.
//! Multiple SequenceExpression bindings on the same component get unique suffixed names
//! (`bind_get_1` / `bind_set_1`, …) mirroring `scope.generate('bind_get')` upstream.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn ssr(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Server,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// A component with a single SequenceExpression binding must hoist the getter/setter
/// and reference them as `bind_get()` / `bind_set($$value)` — not inline the raw expr.
#[test]
fn seq_binding_getter_body_references_hoisted_var() {
    // Minimal reproduction of the data-table-checkbox pattern:
    //   <Checkbox bind:checked={() => checked, onCheckedChange} />
    let src = r#"<script>
import Checkbox from './Checkbox.svelte';
let checked = $state(false);
function onCheckedChange(v) { checked = v; }
</script>
<Checkbox bind:checked={() => checked, onCheckedChange} />"#;

    let out = ssr(src);

    // The hoisted declarations must be present.
    assert!(
        out.contains("bind_get = () => checked"),
        "expected `var bind_get = () => checked` in output, got:\n{out}"
    );
    assert!(
        out.contains("bind_set = onCheckedChange"),
        "expected `var bind_set = onCheckedChange` in output, got:\n{out}"
    );

    // The getter body must call `bind_get()`, NOT inline `() => checked`.
    assert!(
        out.contains("return bind_get()"),
        "expected `return bind_get();` in getter body, got:\n{out}"
    );
    // The old (buggy) form inlined the raw getter expression.
    assert!(
        !out.contains("return () => checked"),
        "must NOT inline raw getter expression in getter body, got:\n{out}"
    );

    // The setter body must call `bind_set($$value)`, NOT inline `onCheckedChange`.
    // (The setter body should end with `bind_set($$value);` as a statement.)
    assert!(
        out.contains("bind_set($$value)"),
        "expected `bind_set($$value);` in setter body, got:\n{out}"
    );
    // The old buggy form wrote the raw setter expression as a bare statement inside the
    // setter body.  The string `onCheckedChange` may appear in the hoisted `var bind_set = onCheckedChange;`
    // declaration, but it must NOT appear INSIDE a `set checked($$value)` body.
    // We check this by verifying the setter body contains the call, not a bare identifier.
    let setter_block_start = out.find("set checked($$value)").unwrap_or(0);
    let setter_block = &out[setter_block_start..];
    assert!(
        setter_block.contains("bind_set($$value)"),
        "setter body must contain `bind_set($$value)` call, got:\n{out}"
    );
}

/// Two SequenceExpression bindings on the same component must get distinct hoisted
/// var names (`bind_get` / `bind_get_1`, etc.) so they don't collide.
#[test]
fn multiple_seq_bindings_get_unique_hoisted_var_names() {
    let src = r#"<script>
import Widget from './Widget.svelte';
let a = $state(false);
let b = $state(0);
function setA(v) { a = v; }
function setB(v) { b = v; }
</script>
<Widget bind:alpha={() => a, setA} bind:beta={() => b, setB} />"#;

    let out = ssr(src);

    // Both pairs of hoisted vars must be present with unique names.
    assert!(
        out.contains("bind_get = () => a"),
        "expected `bind_get = () => a` in output, got:\n{out}"
    );
    assert!(
        out.contains("bind_set = setA"),
        "expected `bind_set = setA` in output, got:\n{out}"
    );
    assert!(
        out.contains("bind_get_1 = () => b"),
        "expected `bind_get_1 = () => b` in output, got:\n{out}"
    );
    assert!(
        out.contains("bind_set_1 = setB"),
        "expected `bind_set_1 = setB` in output, got:\n{out}"
    );

    // Both getters must call their respective hoisted var.
    assert!(
        out.contains("return bind_get()"),
        "expected `return bind_get();` for alpha getter, got:\n{out}"
    );
    assert!(
        out.contains("return bind_get_1()"),
        "expected `return bind_get_1();` for beta getter, got:\n{out}"
    );
}
