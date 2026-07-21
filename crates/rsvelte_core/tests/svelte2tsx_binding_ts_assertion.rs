//! Regression: a `bind:` expression carrying a TS assertion (`bind:value={value
//! as never}`, `bind:this={el as HTMLElement}`, `bind:value={x!}`) must strip the
//! assertion from the generated assignment LHS — mirroring upstream svelte2tsx's
//! `getEnd(attr.expression)` — while KEEPING it on the prop/attribute value side.
//!
//! The parser now preserves the assertion wrapper in the binding expression
//! (it used to unwrap it at parse time), so the svelte2tsx port must reproduce
//! upstream's split explicitly.

use rsvelte_core::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn to_tsx(src: &str) -> String {
    let opts = Svelte2TsxOptions {
        filename: "T.svelte".to_string(),
        is_ts_file: true,
        ..Default::default()
    };
    svelte2tsx(src, opts).expect("svelte2tsx").code
}

#[test]
fn element_binding_as_expression_strips_assertion_from_setter() {
    let out = to_tsx(
        "<script lang=\"ts\">let value: string[] = [];</script>\
         <input bind:value={value as never} />",
    );
    // Setter type-widener uses the inner expression (assertion stripped).
    assert!(
        out.contains("() => value = __sveltets_2_any(null)"),
        "setter should strip the `as never`:\n{out}"
    );
    assert!(
        !out.contains("() => value as never = __sveltets_2_any(null)"),
        "assertion leaked into the setter LHS:\n{out}"
    );
    // The bound value side KEEPS the assertion (for type-checking).
    assert!(
        out.contains("\"bind:value\":value as never"),
        "value side should keep the `as never`:\n{out}"
    );
}

#[test]
fn component_binding_as_expression_strips_assertion_from_setter() {
    let out = to_tsx(
        "<script lang=\"ts\">import C from './C.svelte'; let value = '';</script>\
         <C bind:value={value as never} />",
    );
    assert!(
        out.contains("() => value = __sveltets_2_any(null)"),
        "component setter should strip the `as never`:\n{out}"
    );
    assert!(
        out.contains("value:value as never"),
        "component prop value should keep the `as never`:\n{out}"
    );
}

#[test]
fn bind_this_as_expression_moves_assertion_to_rhs() {
    let out = to_tsx(
        "<script lang=\"ts\">let el;</script>\
         <div bind:this={el as HTMLDivElement}></div>",
    );
    // Upstream: `el = $$_var as HTMLDivElement;` — LHS stripped, cast on the RHS.
    assert!(
        out.contains(" as HTMLDivElement;"),
        "bind:this cast should move onto the RHS:\n{out}"
    );
    assert!(
        !out.contains("el as HTMLDivElement ="),
        "bind:this LHS must not carry the cast:\n{out}"
    );
}

#[test]
fn binding_non_null_and_satisfies_strip_from_setter() {
    let non_null =
        to_tsx("<script lang=\"ts\">let value = 0;</script><input bind:value={value!} />");
    assert!(
        non_null.contains("() => value = __sveltets_2_any(null)"),
        "`!` should be stripped from the setter:\n{non_null}"
    );
    assert!(
        non_null.contains("\"bind:value\":value!"),
        "`!` should be kept on the value side:\n{non_null}"
    );

    let satisfies = to_tsx(
        "<script lang=\"ts\">let value = 0;</script>\
         <input bind:value={value satisfies number} />",
    );
    assert!(
        satisfies.contains("() => value = __sveltets_2_any(null)"),
        "`satisfies` should be stripped from the setter:\n{satisfies}"
    );
}

#[test]
fn nested_assertion_only_outermost_is_stripped() {
    // `(without as { foo: number }).foo as number`: the outer `as number` is
    // stripped from the setter LHS; the inner `as { foo: number }` (inside the
    // member object) stays.
    let out = to_tsx(
        "<script lang=\"ts\">let without = { foo: 2 };</script>\
         <input bind:value={(without as { foo: number }).foo as number} />",
    );
    assert!(
        out.contains("() => (without as { foo: number }).foo = __sveltets_2_any(null)"),
        "only the outermost assertion should be stripped:\n{out}"
    );
}
