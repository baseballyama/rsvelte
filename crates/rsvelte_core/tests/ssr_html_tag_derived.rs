//! Regression tests for SSR `{@html expr}` expression handling.
//!
//! `{@html expr}` on the server must run the same dynamic-expression transforms
//! as a regular `{expr}` tag — in particular `wrap_derived_reads`. On the
//! server a `$derived` binding is a getter function, so `{@html post.html}`
//! where `post = $derived(...)` must compile to `$.html(post().html)`. Without
//! the transform it stayed `$.html(post.html)` (reading `.html` off a function),
//! which renders empty.

use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compile_ssr(source: &str) -> String {
    let options = CompileOptions {
        generate: GenerateMode::Server,
        filename: Some("test.svelte".to_string()),
        css: CssMode::External,
        ..Default::default()
    };
    compile(source, options)
        .expect("compilation should succeed")
        .js
        .code
}

#[test]
fn html_tag_derived_member_calls_getter() {
    let code = compile_ssr(
        "<script>let { data } = $props(); const post = $derived(data.post);</script>\n{@html post.html}",
    );
    assert!(
        code.contains("$.html(post().html)"),
        "expected $.html(post().html) for a $derived binding, got:\n{}",
        code
    );
}

#[test]
fn html_tag_derived_identifier_calls_getter() {
    let code = compile_ssr(
        "<script>let { data } = $props(); const html = $derived(data.html);</script>\n{@html html}",
    );
    assert!(
        code.contains("$.html(html())"),
        "expected $.html(html()) for a $derived binding, got:\n{}",
        code
    );
}

#[test]
fn html_tag_plain_prop_unchanged() {
    let code = compile_ssr("<script>let { post } = $props();</script>\n{@html post.html}");
    assert!(
        code.contains("$.html(post.html)"),
        "non-derived prop should be left as-is, got:\n{}",
        code
    );
}

#[test]
fn html_tag_string_literal_unchanged() {
    let code = compile_ssr("{@html '<p>x</p>'}");
    assert!(
        code.contains("$.html("),
        "string literal should render, got:\n{}",
        code
    );
}
