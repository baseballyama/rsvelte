//! Regression test for the dev `$.assign` stale-assignment-value wrap.
//!
//! `build_assignment` wraps member assignments in *value* position so the
//! runtime can warn when the overwritten value was state. The wrap lived only on
//! the legacy JSON assignment converter, which the typed `JsNode` path
//! superseded, so it never fired.
//!
//! The corpus gates compile with `dev: false`, so nothing else covers this.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_client_dev(src: &str) -> String {
    let result = compile(
        src,
        CompileOptions {
            filename: Some("src/Assign.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: true,
            runes: Some(true),
            ..Default::default()
        },
    )
    .expect("compile");
    result.js.code
}

#[test]
fn value_position_member_assignment_is_wrapped() {
    let src = "<script>let key = {}, o = {};</script>\n\
               <button onclick={() => [(key.a = o), (key.b = o)]}>x</button>\n";
    let out = compile_client_dev(src);
    assert!(
        out.contains("$.assign(key, 'a', '=', o, 'src/\u{200b}Assign.svelte:2:25')"),
        "expected the stale-value wrap with a rootDir-relative location, got:\n{out}"
    );
    assert!(
        out.contains("$.assign(key, 'b', '=', o, 'src/\u{200b}Assign.svelte:2:38')"),
        "expected both operands wrapped, got:\n{out}"
    );
}

#[test]
fn coercive_operator_gets_a_lazy_getter() {
    let src = "<script>let key = {}, o = {};</script>\n\
               <button onclick={() => [(key.a ??= o)]}>x</button>\n";
    let out = compile_client_dev(src);
    assert!(
        out.contains("$.assign(key, 'a', '??=', () => o,"),
        "expected the lazy getter for a coercive operator, got:\n{out}"
    );
}

#[test]
fn statement_position_and_handler_bodies_are_not_wrapped() {
    let src = "<script>let key = {}, o = {};</script>\n\
               <button onclick={() => (key.a = o)}>x</button>\n\
               <button onclick={() => { key.b = o; }}>y</button>\n";
    let out = compile_client_dev(src);
    assert!(
        !out.contains("$.assign("),
        "the direct handler arrow body and statement position are both exempt, got:\n{out}"
    );
}

#[test]
fn component_attribute_arrow_bodies_are_not_wrapped() {
    let src = "<script>import C from './C.svelte'; let key = {}, o = {};</script>\n\
               <C onchange={(e) => (key.a = o)} />\n";
    let out = compile_client_dev(src);
    assert!(
        !out.contains("$.assign("),
        "component attribute arrow bodies are exempt upstream, got:\n{out}"
    );
}
