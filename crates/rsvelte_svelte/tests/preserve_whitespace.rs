//! `preserveWhitespace`, which the fixture corpus cannot carry. The expected modules are this
//! port's output, checked equal (as ASTs) to the official compiler's with
//! `{ runes: true, preserveWhitespace: true }` and different from its default.

use rsvelte_svelte::compilation::lower::Target;

const SOURCE: &str = include_str!("preserve_whitespace/App.svelte");

fn compile(target: Target, preserve_whitespace: bool) -> String {
    let component = rsvelte_svelte::syntax::parse::parse(SOURCE).expect("parses");
    let compiler_syntax_tree =
        rsvelte_svelte::compilation::compiler_syntax_tree::lower(&component, SOURCE);
    let mut input = rsvelte_svelte::svelte_input(&component, &compiler_syntax_tree, SOURCE);
    input.preserve_whitespace = preserve_whitespace;
    let resolution = rsvelte_svelte::semantic::resolve::resolve(
        &component.javascript,
        component.program,
        &compiler_syntax_tree,
    );
    let analysis = rsvelte_svelte::semantic::analyze::analyze(&input, &resolution, "App.svelte");
    rsvelte_svelte::computation::tasks::compile(&input, &resolution, &analysis, target)
        .expect("compiles")
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
