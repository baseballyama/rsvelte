//! `preserveWhitespace`, which the fixture corpus cannot carry. The expected modules are this
//! port's output, checked equal (as ASTs) to the official compiler's with
//! `{ runes: true, preserveWhitespace: true }` and different from its default.

use rsvelte_svelte_compile::{CompileOptions, Target};

const SOURCE: &str = include_str!("preserve_whitespace/App.svelte");

fn compile(generate: Target, preserve_whitespace: bool) -> String {
    let options = CompileOptions {
        filename: "App.svelte".to_owned(),
        generate,
        preserve_whitespace,
        css_hash: None,
    };
    rsvelte_svelte_compile::compile(SOURCE, &options)
        .expect("compiles")
        .js
        .code
}

#[test]
fn client_keeps_template_whitespace() {
    let expected = include_str!("preserve_whitespace/client.js");
    assert_eq!(compile(Target::Client, true), expected);
    assert_ne!(compile(Target::Client, false), expected);
}

#[test]
fn server_keeps_template_whitespace() {
    let expected = include_str!("preserve_whitespace/server.js");
    assert_eq!(compile(Target::Server, true), expected);
    assert_ne!(compile(Target::Server, false), expected);
}
