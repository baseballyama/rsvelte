//! Regression test for issue #2054: a `with` statement anywhere in script
//! content must be rejected exactly like the official compiler rejects it.
//!
//! Component scripts (and `.svelte.js`/`.svelte.ts` modules) are ESM and
//! therefore always strict, so upstream acorn — parsed with
//! `sourceType: 'module'` — throws `js_parse_error('with' in strict mode)`
//! at the `with` keyword before Svelte's own analysis ever runs (see
//! `submodules/svelte/packages/svelte/src/compiler/phases/1-parse/acorn.js`).
//! `oxc_parser` has no strict-mode syntax-restriction pass at all, so rsvelte
//! used to accept `with` silently; the fix scans the parsed AST for the first
//! `WithStatement` and synthesizes the same `js_parse_error`.

use rsvelte_core::{
    CompileOptions, GenerateMode, ModuleCompileOptions, compile, compile_module,
    compiler::{CompileError, CssMode},
    error::ParseError,
};

#[track_caller]
fn assert_with_rejected(src: &str) {
    let with_pos = src.find("with").expect("`with` keyword in source");
    let err = compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            runes: Some(true),
            ..Default::default()
        },
    )
    .err()
    .unwrap_or_else(|| panic!("expected a `with` parse error for {src:?}, but it compiled"));

    let CompileError::Parse(ParseError::SvelteError {
        code,
        message,
        span,
    }) = err
    else {
        panic!("expected a SvelteError for {src:?}, got: {err:?}");
    };

    assert_eq!(code, "js_parse_error", "for {src:?}");
    assert_eq!(
        message, "'with' in strict mode\nhttps://svelte.dev/e/js_parse_error",
        "for {src:?}"
    );
    assert_eq!(span, (with_pos, with_pos), "for {src:?}");
}

#[test]
fn with_statement_in_instance_script_is_rejected() {
    assert_with_rejected("<script>\n  with (x) {}\n</script>");
}

#[test]
fn with_statement_in_module_script_is_rejected() {
    assert_with_rejected("<script module>\n  with (x) {}\n</script>");
}

#[test]
fn with_statement_in_typescript_script_is_rejected() {
    assert_with_rejected("<script lang=\"ts\">\n  with (x) {}\n</script>");
}

#[test]
fn with_statement_nested_in_function_is_rejected() {
    assert_with_rejected("<script>\n  function f() { with (x) {} }\n</script>");
}

#[test]
fn with_statement_in_svelte_js_module_is_rejected() {
    let src = "with (x) {}\n";
    let with_pos = src.find("with").expect("`with` keyword in source");
    let err = compile_module(
        src,
        ModuleCompileOptions {
            generate: GenerateMode::Client,
            filename: Some("test.svelte.js".to_string()),
            ..Default::default()
        },
    )
    .err()
    .unwrap_or_else(|| panic!("expected a `with` parse error for {src:?}, but it compiled"));

    let CompileError::Parse(ParseError::SvelteError {
        code,
        message,
        span,
    }) = err
    else {
        panic!("expected a SvelteError for {src:?}, got: {err:?}");
    };

    assert_eq!(code, "js_parse_error");
    assert_eq!(
        message,
        "'with' in strict mode\nhttps://svelte.dev/e/js_parse_error"
    );
    assert_eq!(span, (with_pos, with_pos));
}

/// The identifier `with` as a substring (e.g. inside a string literal or a
/// longer identifier like `within`) must not trigger a false positive — only
/// an actual `WithStatement` node does.
#[test]
fn with_substring_does_not_false_positive() {
    let ok = compile(
        "<script>\n  let within = 1;\n  let s = 'within the woods';\n  console.log(within, s);\n</script>",
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            runes: Some(true),
            ..Default::default()
        },
    );
    assert!(
        ok.is_ok(),
        "expected `within`/`'within the woods'` to compile, got: {ok:?}"
    );
}
