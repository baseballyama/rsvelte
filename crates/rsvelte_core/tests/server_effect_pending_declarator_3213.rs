//! Upstream's server `VariableDeclaration` visitor takes `args[0] ?? void 0`
//! for a rune it does not special-case, so a declarator initializer never
//! reaches the `CallExpression` visitor that lowers `$effect.pending()` to `0`
//! (#3213). rsvelte applied the call-expression rule everywhere, so a component
//! instance script emitted `let v = 0`.
//!
//! `server/effect_pending_ast.rs` — the `.svelte.js` module path — already had
//! the declarator rule and its own test for it, so the two ports of one
//! upstream visitor disagreed with each other.
//!
//! Every expectation here is the official compiler's output for the same source.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn server(script: &str) -> String {
    compile(
        &format!("<script>\n\t{script}\n</script>\n<b>x</b>"),
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Server,
            dev: false,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

#[test]
fn a_declarator_initializer_is_void_0() {
    for (script, expected) in [
        ("let v = $effect.pending();", "let v = void 0;"),
        ("const v = $effect.pending();", "const v = void 0;"),
        (
            "let a = 1, v = $effect.pending(), c = 3;",
            "let v = void 0;",
        ),
        (
            "function f() { let v = $effect.pending(); return v; }\n\tlet q = f();",
            "let v = void 0;",
        ),
    ] {
        let out = server(script);
        assert!(
            out.contains(expected),
            "{script}\nexpected {expected}\n{out}"
        );
    }
}

#[test]
fn every_other_position_is_still_zero() {
    // The negative control: outside a declarator initializer the call-expression
    // rule still applies, so the fix must not become a blanket `void 0`.
    for (script, expected) in [
        ("let v = 1 + $effect.pending();", "let v = 1 + 0;"),
        ("const o = { p: $effect.pending() };", "p: 0"),
    ] {
        let out = server(script);
        assert!(
            out.contains(expected),
            "{script}\nexpected {expected}\n{out}"
        );
    }
}

#[test]
fn an_allow_listed_rune_keeps_its_call_lowering() {
    // `$effect.tracking` and `$effect.root` ARE on upstream's declarator
    // allow-list, so their initializers do reach the call-expression visitor.
    assert!(
        server("let v = $effect.tracking();").contains("let v = false;"),
        "{}",
        server("let v = $effect.tracking();")
    );
    assert!(
        server("let v = $effect.root(() => {});").contains("let v = () => {};"),
        "{}",
        server("let v = $effect.root(() => {});")
    );
}
