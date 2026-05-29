//! Regression test: printing a pending-only `{#await}` block (no `:then` /
//! `:catch`) must not emit a dangling `{:` (issue #467, H-052).

use svelte_compiler_rust::compiler::print::print_with_source;
use svelte_compiler_rust::{ParseOptions, parse};

fn print_roundtrip(src: &str) -> String {
    let ast = parse(
        src,
        ParseOptions {
            modern: true,
            ..Default::default()
        },
    )
    .expect("parse");
    print_with_source(&ast, None, Some(src))
        .expect("print")
        .code
}

#[test]
fn pending_only_await_has_no_dangling_separator() {
    let src = "{#await promise}\n\t<p>waiting...</p>\n{/await}";
    let out = print_roundtrip(src);
    assert!(
        !out.contains("{:"),
        "pending-only await must not emit a `{{:` separator, got:\n{out}"
    );
    assert!(out.contains("{#await promise}"), "got:\n{out}");
    assert!(out.contains("{/await}"), "got:\n{out}");
    assert!(out.contains("<p>waiting...</p>"), "got:\n{out}");
}

#[test]
fn full_await_still_prints_all_clauses() {
    let src = "{#await promise}\n\tp\n{:then value}\n\tt\n{:catch error}\n\tc\n{/await}";
    let out = print_roundtrip(src);
    assert!(out.contains("{:then value}"), "got:\n{out}");
    assert!(out.contains("{:catch error}"), "got:\n{out}");
    assert!(out.contains("{/await}"), "got:\n{out}");
}
