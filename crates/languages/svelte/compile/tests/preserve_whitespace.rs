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

#[test]
fn the_template_end_is_trimmed_as_javascript_trims() {
    let options = |generate| CompileOptions {
        filename: "App.svelte".to_owned(),
        generate,
        preserve_whitespace: true,
        css_hash: None,
    };
    for generate in [Target::Client, Target::Server] {
        for (source, kept) in [("<p>a</p>\u{85}", true), ("<p>a</p>\u{3000}", false)] {
            let code = rsvelte_svelte_compile::compile(source, &options(generate))
                .expect("compiles")
                .js
                .code;
            let last = source.chars().last().expect("a character");
            assert_eq!(code.contains(last), kept, "{source:?} on {generate:?}");
        }
    }
}
