//! Regression test: `{@render ...}` must contain a call expression (issue #1786).
//!
//! Upstream rejects this in `1-parse/state/tag.js` right after `read_expression`:
//! anything that is not a `CallExpression` (or a `ChainExpression` wrapping one)
//! is a `render_tag_invalid_expression` parse error — so `{@render new foo()}`
//! errors even though it has a `callee`.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn try_compile(src: &str) -> Result<(), (String, String, usize, usize)> {
    match compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            runes: Some(true),
            ..Default::default()
        },
    ) {
        Ok(_) => Ok(()),
        Err(e) => {
            let s = format!("{e:?}");
            let code = s
                .split("code: \"")
                .nth(1)
                .and_then(|t| t.split('"').next())
                .unwrap_or("")
                .to_string();
            let message = s
                .split("message: \"")
                .nth(1)
                .and_then(|t| t.split("\", span:").next())
                .unwrap_or("")
                .replace("\\n", "\n");
            let span = s
                .split("span: (")
                .nth(1)
                .and_then(|t| t.split(')').next())
                .map(|t| {
                    let mut it = t.split(", ");
                    let a = it.next().unwrap_or("0").trim().parse().unwrap_or(0);
                    let b = it.next().unwrap_or("0").trim().parse().unwrap_or(0);
                    (a, b)
                })
                .unwrap_or((0, 0));
            Err((code, message, span.0, span.1))
        }
    }
}

#[track_caller]
fn assert_invalid(src: &str, start: usize, end: usize) {
    match try_compile(src) {
        Ok(()) => panic!("expected `render_tag_invalid_expression` for {src:?}, but it compiled"),
        Err((code, message, s, e)) => {
            assert_eq!(
                code, "render_tag_invalid_expression",
                "for {src:?} expected `render_tag_invalid_expression`, got `{code}`"
            );
            assert_eq!(
                message,
                "`{@render ...}` tags can only contain call expressions\nhttps://svelte.dev/e/render_tag_invalid_expression",
                "wrong message for {src:?}"
            );
            assert_eq!((s, e), (start, end), "wrong span for {src:?}");
        }
    }
}

#[track_caller]
fn assert_compiles(src: &str) {
    if let Err((code, _, _, _)) = try_compile(src) {
        panic!("expected {src:?} to compile, got error `{code}`");
    }
}

#[test]
fn non_call_render_expressions_are_rejected() {
    // Spans match the official compiler's (the expression node, parens removed).
    assert_invalid("{@render new foo()}", 9, 18);
    assert_invalid("{@render foo}", 9, 12);
    assert_invalid("{@render foo.bar}", 9, 16);
    assert_invalid("{@render foo``}", 9, 14);
    assert_invalid("{@render (a,b)}", 10, 13);
    assert_invalid("{@render 1}", 9, 10);
}

#[test]
fn call_render_expressions_still_compile() {
    assert_compiles("{@render foo()}");
    assert_compiles("{@render foo?.()}");
    assert_compiles("{@render a?.b()}");
    assert_compiles("{@render foo.bar()}");
    assert_compiles("{@render (cond ? a : b)()}");
    assert_compiles("{@render (foo())}");
    assert_compiles("{#snippet x()}y{/snippet}{@render x()}");
}
