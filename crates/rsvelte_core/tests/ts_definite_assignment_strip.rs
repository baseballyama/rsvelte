//! Regression test: TS definite-assignment assertions must be erased (issue #1980).
//!
//! Bug: `let element!: HTMLDivElement;` had its annotation removed but kept the
//! `!`, emitting the invalid `let element!;`. That also hid the declarator from
//! the legacy reactive-`let` rewrite, so the `$.mutable_source()` initializer
//! upstream emits went missing.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compile_ts(src: &str, generate: GenerateMode) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("DefiniteAssign.svelte".to_string()),
            generate,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

const BIND_THIS: &str = "<script lang=\"ts\">\n\tlet element!: HTMLDivElement;\n</script>\n\n<div bind:this={element}></div>\n";

#[test]
fn legacy_bind_this_declares_mutable_source() {
    let out = compile_ts(BIND_THIS, GenerateMode::Client);
    assert!(!out.contains("element!"), "leftover `!` in:\n{out}");
    assert!(
        out.contains("let element = $.mutable_source();"),
        "expected the legacy `$.mutable_source()` initializer, got:\n{out}"
    );
}

#[test]
fn server_keeps_the_declaration() {
    let out = compile_ts(BIND_THIS, GenerateMode::Server);
    assert!(!out.contains("element!"), "leftover `!` in:\n{out}");
    assert!(
        out.contains("let element;"),
        "expected `let element;` to survive, got:\n{out}"
    );
}

#[test]
fn runes_mode_declaration_is_plain() {
    let src = "<script lang=\"ts\">\n\tlet element!: HTMLDivElement;\n\t$effect(() => console.log(element));\n</script>\n\n<div bind:this={element}></div>\n";
    let out = compile_ts(src, GenerateMode::Client);
    assert!(!out.contains("element!"), "leftover `!` in:\n{out}");
    // Runes mode leaves the binding alone — no `$.mutable_source()` wrapper.
    assert!(
        out.contains("let element;"),
        "expected a plain `let element;`, got:\n{out}"
    );
}

#[test]
fn class_field_definite_assertion_is_stripped() {
    let src = "<script lang=\"ts\">\n\tclass Foo {\n\t\tx!: string;\n\t}\n\tconsole.log(new Foo());\n</script>\n";
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let out = compile_ts(src, generate);
        assert!(!out.contains("x!"), "leftover `!` in:\n{out}");
        assert!(out.contains("class Foo {"), "class dropped:\n{out}");
    }
}
