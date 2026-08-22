//! `scope.evaluate` recurses into a binding's initializer whatever its shape,
//! so a `const` initialised with a logical expression or a regex literal is a
//! known value and folds into the template (issue #3249). Phase 2 kept neither
//! node: `LogicalExpression` was missing from `init_needs_expr_json`, and a
//! regex set `binding.initial = Some("/ab/g")`, which closed the AST path that
//! could evaluate it. Every expectation here is the official compiler's output
//! for the same source.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compiled(src: &str, generate: GenerateMode) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("A.svelte".to_string()),
            generate,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("must compile")
    .js
    .code
}

fn source(init: &str, read: &str) -> String {
    format!("<script>\n\tconst c = {init};\n</script>\n{read}\n")
}

#[test]
fn a_logical_initializer_folds_on_every_target() {
    for (init, folded) in [
        ("1 || 2", "1"),
        ("1 && 2", "2"),
        ("null ?? 3", "3"),
        ("0 || 3", "3"),
        ("true && false", "false"),
    ] {
        let client = compiled(&source(init, "{c}"), GenerateMode::Client);
        assert!(
            client.contains(&format!("text.nodeValue = '{folded}';")),
            "`{init}` must fold to `{folded}` on the client, got:\n{client}"
        );
        assert!(
            !client.contains("template_effect"),
            "`{init}` is a known value, so the read is not reactive:\n{client}"
        );
        let server = compiled(&source(init, "{c}"), GenerateMode::Server);
        assert!(
            server.contains(&format!("<!---->{folded}`")),
            "`{init}` must fold to `{folded}` on the server, got:\n{server}"
        );
    }
}

#[test]
fn a_regex_initializer_folds_to_its_source() {
    let client = compiled(&source("/ab/g", "{c}"), GenerateMode::Client);
    assert!(
        client.contains("text.nodeValue = '/ab/g';"),
        "a regex stringifies to its source, got:\n{client}"
    );
    let server = compiled(&source("/ab/g", "{c}"), GenerateMode::Server);
    assert!(
        server.contains("<!---->/ab/g`"),
        "a regex stringifies to its source, got:\n{server}"
    );
}

#[test]
fn a_folded_regex_is_an_object_not_a_string() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let out = compiled(&source("/ab/g", "{typeof c}"), generate);
        assert!(
            out.contains("object"),
            "`typeof /ab/g` is `object`, got:\n{out}"
        );
        assert!(
            !out.contains("'string'") && !out.contains("<!---->string`"),
            "a regex must not be folded as a string value, got:\n{out}"
        );
    }
}
