//! `preserveWhitespace`, which the fixture corpus cannot carry. The expected modules are this
//! port's output, checked equal (as ASTs) to the official compiler's with
//! `{ runes: true, preserveWhitespace: true }` and different from its default.

use rsv_svelte::lower::Target;

const SOURCE: &str = include_str!("preserve_whitespace/App.svelte");

fn compile(target: Target, preserve_whitespace: bool) -> String {
    let c = rsv_svelte::parse::parse(SOURCE).expect("parses");
    let hir = rsv_svelte::hir::lower(&c, SOURCE);
    let mut input = rsv_svelte::svelte_input(&c, &hir, SOURCE);
    input.preserve_whitespace = preserve_whitespace;
    let res = rsv_svelte::resolve::resolve(&c.js, c.program, &hir);
    let an = rsv_svelte::analyze::analyze(&input, &res, "App.svelte");
    rsv_svelte::tasks::compile(&input, &res, &an, target).expect("compiles")
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
