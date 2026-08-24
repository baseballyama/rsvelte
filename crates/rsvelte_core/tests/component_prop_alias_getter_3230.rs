//! A function value is never `is_known` to upstream's `scope.evaluate`, so a
//! `const` that ALIASES a local function is not a known value and a component
//! prop reading it is passed through a getter (issue #3230). rsvelte's
//! `is_expression_known_json` answered `true` for any `is_function()` binding,
//! which made the alias known and the prop pass by value. Every expectation
//! here is the official compiler's output for the same source.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("A.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("must compile")
    .js
    .code
}

fn component(declaration: &str, host: &str) -> String {
    client(&format!(
        "<script>\n\timport C from './C.svelte';\n\t{declaration}\n</script>\n\n{host}\n"
    ))
}

#[test]
fn an_alias_of_a_local_function_is_passed_through_a_getter() {
    for declaration in [
        "const h = () => {};\n\tconst cb = h;",
        "let h = () => {};\n\tconst cb = h;",
        "const h = () => {};\n\tlet cb = h;",
        "function h() {}\n\tconst cb = h;",
        "const g = () => {};\n\tconst h = g;\n\tconst cb = h;",
    ] {
        let out = component(declaration, "<C {cb} />");
        assert!(
            out.contains("get cb()"),
            "an aliased function is not a known value:\n{declaration}\n{out}"
        );
    }
}

#[test]
fn an_aliased_function_spreads_through_a_thunk() {
    let out = component("const h = () => {};\n\tconst cb = h;", "<C {...{ cb }} />");
    assert!(
        out.contains("$.spread_props(() => ({ cb }))"),
        "the spread reads the props lazily, got:\n{out}"
    );
}

#[test]
fn a_direct_function_or_literal_is_still_inlined() {
    for declaration in [
        "const cb = () => {};",
        "const h = 1;\n\tconst cb = h;",
        "const h = 'x';\n\tconst cb = h;",
    ] {
        let out = component(declaration, "<C {cb} />");
        assert!(
            out.contains("{ cb }") && !out.contains("get cb()"),
            "an inlinable value must not grow a getter:\n{declaration}\n{out}"
        );
    }
}

#[test]
fn an_element_event_handler_is_unaffected() {
    let out = component(
        "const h = () => {};\n\tconst cb = h;",
        "<button onclick={cb}>x</button>",
    );
    assert!(
        out.contains("$.delegated('click', button, cb)") || out.contains("'click', button, cb"),
        "an element handler still receives the binding directly, got:\n{out}"
    );
}
