//! Regression test: client snippet-parameter destructuring lowering (issue #446,
//! H-100..H-103). Object-pattern aliases, per-element + whole-parameter defaults,
//! object/array rest, and nested array patterns must match upstream Svelte's
//! `extract_paths` output instead of the previous hand-rolled partial handling.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn cj(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            runes: Some(true),
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

#[track_caller]
fn assert_contains(src: &str, needle: &str) {
    let out = cj(src);
    assert!(
        out.contains(needle),
        "expected output of {src:?} to contain:\n  {needle}\ngot:\n{out}"
    );
}

#[test]
fn object_pattern_binds_alias_not_key() {
    // H-100: `{ id: value }` binds the local alias `value`, reading `.id`.
    assert_contains(
        r#"{#snippet foo({ id: value })}<p>{value}</p>{/snippet}{@render foo({id:1})}"#,
        "let value = () => ($$arg0?.()).id;",
    );
}

#[test]
fn object_pattern_default_uses_fallback() {
    // H-101: per-property default wraps the read in `$.fallback`.
    assert_contains(
        r#"{#snippet foo({ id = 5 })}<p>{id}</p>{/snippet}{@render foo({})}"#,
        "let id = $.derived_safe_equal(() => $.fallback(($$arg0?.()).id, 5));",
    );
}

#[test]
fn object_pattern_rest_excludes_consumed_keys() {
    // H-101: object rest emits `$.exclude_from_object(base, ['id'])`.
    assert_contains(
        r#"{#snippet foo({ id, ...rest })}<p>{id}</p>{/snippet}{@render foo({id:1,a:2})}"#,
        "let rest = () => $.exclude_from_object($$arg0?.(), ['id']);",
    );
}

#[test]
fn array_pattern_default_and_index() {
    // H-102: array patterns materialise via `$.to_array` and read `$.get($$array)[i]`,
    // with per-element defaults.
    let src = r#"{#snippet foo([a = 1, b])}<p>{a}-{b}</p>{/snippet}{@render foo([undefined,2])}"#;
    assert_contains(
        src,
        "var $$array = $.derived(() => $.to_array($$arg0?.(), 2));",
    );
    assert_contains(
        src,
        "let a = $.derived_safe_equal(() => $.fallback($.get($$array)[0], 1));",
    );
    assert_contains(src, "let b = () => $.get($$array)[1];");
}

#[test]
fn array_pattern_nested_and_rest() {
    // H-102: nested object inside an array, plus an array rest element.
    let src =
        r#"{#snippet foo([{ id }, ...rest])}<p>{id}</p>{/snippet}{@render foo([{id:1},2,3])}"#;
    assert_contains(
        src,
        "var $$array = $.derived(() => $.to_array($$arg0?.()));",
    );
    assert_contains(src, "let id = () => $.get($$array)[0].id;");
    assert_contains(src, "let rest = () => $.get($$array).slice(1);");
}

#[test]
fn whole_parameter_default_is_applied() {
    // H-103: a whole-parameter default `= { id: 1 }` wraps the base in `$.fallback`.
    assert_contains(
        r#"{#snippet foo({ id } = { id: 1 })}<p>{id}</p>{/snippet}{@render foo()}"#,
        "let id = $.derived_safe_equal(() => $.fallback($$arg0?.(), () => ({ id: 1 }), true).id);",
    );
}

#[test]
fn render_tag_async_and_call_args_share_one_counter() {
    // H-099: an awaited arg ($0) and a memoised-call arg ($1) must not both be $0.
    // `await` in a template expression needs the experimental.async gate.
    let src = r#"{#snippet foo(a, b)}<p>{a}{b}</p>{/snippet}{@render foo(await p, bar())}"#;
    let out = compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            runes: Some(true),
            experimental: rsvelte_core::compiler::ExperimentalOptions { r#async: true },
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    assert!(out.contains("$0"), "got:\n{out}");
    assert!(out.contains("let $1 = $.derived(bar)"), "got:\n{out}");
}
