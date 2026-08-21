//! Issue #3287: a `//` comment whose newline is the last thing before a
//! template expression's own terminator must not raise `js_parse_error`.
//!
//! rsvelte slices the expression text out of the template and re-parses it
//! wrapped in parentheses. The slice is whitespace-trimmed, which deletes the
//! newline that terminated the line comment, so the synthetic `)` landed inside
//! the comment and the parse failed. Upstream parses in place, where the
//! newline is still there.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compile_error(src: &str, generate: GenerateMode) -> Option<String> {
    match compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    ) {
        Ok(_) => None,
        Err(e) => {
            let s = format!("{e:?}");
            Some(
                s.split("code: \"")
                    .nth(1)
                    .and_then(|t| t.split('"').next())
                    .unwrap_or(&s)
                    .to_string(),
            )
        }
    }
}

#[track_caller]
fn assert_compiles(src: &str) {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        if let Some(code) = compile_error(src, generate) {
            panic!("expected {src:?} to compile ({generate:?}), got error `{code}`");
        }
    }
}

#[test]
fn trailing_line_comment_before_expression_terminator() {
    // Every one of these is accepted by the official compiler.
    assert_compiles("<p>{1 // c\n}</p>");
    assert_compiles("<p>{1 // a\n+ 2 // b\n}</p>");
    assert_compiles("<p title={1 // c\n}>x</p>");
    assert_compiles("<button onclick={() => sink(1) // c\n}>x</button>");
    assert_compiles("{#if true // c\n}<p>x</p>{/if}");
    assert_compiles("{#each [1] as q (q // c\n)}<p>{q}</p>{/each}");
    assert_compiles("{@html String(1) // c\n}");
    assert_compiles("<p {...{ a: 1 } // c\n}>x</p>");
    assert_compiles("<div class={f\n\t? \"a\"\n\t: \"b\" // no\n}>x</div>");
    assert_compiles("{#snippet s(a // c\n)}<p>{a}</p>{/snippet}");
    assert_compiles("{#if true}{@const c = 1 // c\n}<p>{c}</p>{/if}");
    assert_compiles("<div {@attach (n) => {} // c\n}>x</div>");
}

#[test]
fn controls_still_compile() {
    // Shapes that already worked must keep working.
    assert_compiles("<p>{// c\n1}</p>");
    assert_compiles("<p>{1 + // c\n2}</p>");
    assert_compiles("<p>{String(\"a\" // c\n)}</p>");
    assert_compiles("<p>{Object({ a: 1 // c\n})}</p>");
    assert_compiles("<p>{() => {\nsink(1); // c\n}}</p>");
    assert_compiles("<p>{1 /* c */}</p>");
}

#[test]
fn each_header_line_comment_is_still_rejected() {
    // Both compilers reject the comment in the `{#each}` *header* (not the key).
    assert!(
        compile_error("{#each [1] as q // c\n}{/each}", GenerateMode::Client).is_some(),
        "`{{#each}}` header with a trailing line comment must still be rejected"
    );
}
