//! Upstream's `bind:prop={getter, setter}` exemption from the dev `$.assign`
//! wrap is a path shape, not a subtree: `AssignmentExpression.js` L209-215 asks
//! whether the assignment's *parent* is an arrow that is a *direct element* of
//! the `SequenceExpression` owned by the `BindDirective` / `Component` /
//! `SvelteComponent`. Anything nested deeper — an arrow passed through a call,
//! an arrow inside the setter's body — is still wrapped, and the exemption
//! applies to element bindings exactly as it does to component ones.
//!
//! The corpus gates compile with `dev: false`, so nothing else covers this.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_client_dev(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Main.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

const SCRIPT: &str = "<script>\n\timport Comp from './Comp.svelte';\n\tlet scroll = $state({ x: 0, y: 0 });\n\tlet other = $state({ d: 0 });\n\tlet obj = $state({});\n\tfunction wrap(f) { return f; }\n</script>\n";

fn assigns(body: &str) -> usize {
    compile_client_dev(&format!("{SCRIPT}{body}\n"))
        .matches("$.assign(")
        .count()
}

#[test]
fn a_bare_assignment_is_wrapped() {
    // positive control: nothing about `bind:` is involved.
    assert_eq!(
        assigns("<form onsubmit={wrap(() => (scroll.x = obj))}></form>"),
        1
    );
}

#[test]
fn an_element_bind_sequence_setter_arrow_is_exempt() {
    assert_eq!(
        assigns("<input bind:value={() => scroll.x, (v) => (scroll.y = obj)} />"),
        0
    );
}

#[test]
fn a_component_bind_sequence_setter_arrow_is_exempt() {
    assert_eq!(
        assigns("<Comp bind:value={() => scroll.x, (v) => (scroll.y = obj)} />"),
        0
    );
}

#[test]
fn an_arrow_reached_through_a_call_is_not_a_direct_sequence_element() {
    assert_eq!(
        assigns("<Comp bind:value={() => scroll.x, wrap((v) => (scroll.y = obj))} />"),
        1
    );
    assert_eq!(
        assigns("<input bind:value={() => scroll.x, wrap((v) => (scroll.y = obj))} />"),
        1
    );
}

#[test]
fn an_arrow_nested_inside_the_setter_body_is_wrapped() {
    assert_eq!(
        assigns(
            "<Comp bind:value={() => scroll.x, (v) => (scroll.y = wrap(() => (other.d = obj)))} />"
        ),
        1
    );
    assert_eq!(
        assigns(
            "<input bind:value={() => scroll.x, (v) => (scroll.y = wrap(() => (other.d = obj)))} />"
        ),
        1
    );
}

#[test]
fn a_block_bodied_setter_assigns_through_an_expression_statement() {
    // `path.at(-1) === 'ExpressionStatement'` already silences the wrap.
    assert_eq!(
        assigns("<Comp bind:value={() => scroll.x, (v) => { scroll.y = obj; }} />"),
        0
    );
    assert_eq!(
        assigns("<input bind:value={() => scroll.x, (v) => { scroll.y = obj; }} />"),
        0
    );
}

#[test]
fn svelte_component_and_svelte_window_bindings_follow_the_same_rule() {
    assert_eq!(
        assigns(
            "<svelte:component this={Comp} bind:value={() => scroll.x, (v) => (scroll.y = obj)} />"
        ),
        0
    );
    assert_eq!(
        assigns("<svelte:window bind:scrollY={() => scroll.x, (v) => (scroll.y = obj)} />"),
        0
    );
}

#[test]
fn bind_this_sequences_are_exempt_too() {
    assert_eq!(
        assigns("<input bind:this={() => scroll.x, (v) => (scroll.y = obj)} />"),
        0
    );
    assert_eq!(
        assigns("<Comp bind:this={() => scroll.x, (v) => (scroll.y = obj)} />"),
        0
    );
}

#[test]
fn a_coercive_operator_in_a_setter_arrow_is_exempt() {
    assert_eq!(
        assigns("<input bind:value={() => scroll.x, (v) => (scroll.y ??= obj)} />"),
        0
    );
}

#[test]
fn a_plain_member_binding_synthesises_its_setter_and_never_wraps() {
    assert_eq!(assigns("<Comp bind:value={scroll.x} />"), 0);
    assert_eq!(assigns("<input bind:value={scroll.x} />"), 0);
}

#[test]
fn a_setter_body_that_is_itself_a_sequence_is_wrapped() {
    // The assignments' parent is the inner `SequenceExpression`, not the arrow.
    assert_eq!(
        assigns("<input bind:value={() => scroll.x, (v) => (scroll.y = obj, other.d = obj)} />"),
        2
    );
}
