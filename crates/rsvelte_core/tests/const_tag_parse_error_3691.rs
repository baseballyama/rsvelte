//! Regression tests for #3691 — a `{@const}` initializer swallowed every
//! `js_parse_error` into an empty identifier, so the component compiled.
//!
//! `{@const}` reads its declaration through `parse_js_expression`, whose
//! `parse_js_expression_internal` ends in
//! `.unwrap_or_else(|| create_empty_identifier(""))`. Upstream's
//! `read_declaration` parses the whole declaration with acorn and propagates.
//!
//! The other template slots were already right — they call
//! `parse_js_expression_strict` / `parse_js_expression_attribute`, which return
//! a `ParseResult` — so they are the positive control that names the path.
//! `{@const}` could not simply call the strict variant, because that one defers
//! into an `Expression::Lazy` and this tag inspects its parsed declaration
//! during the parse.
//!
//! This is an over-acceptance: rsvelte accepted a document official rejects. No
//! comparison of accepted programs can see it, and the collected corpus is at
//! zero here because published code compiles.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn try_compile(src: &str, generate: GenerateMode) -> Result<String, String> {
    compile(
        src,
        CompileOptions {
            filename: Some("X.svelte".to_string()),
            generate,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .map_err(|e| format!("{e:?}"))
}

const HEAD: &str = "<script>\n\tconst obj = { a: 1 };\n</script>\n";

/// Every shape official rejects with `js_parse_error` must be rejected here too,
/// on both targets.
#[test]
fn an_unparseable_initializer_is_rejected() {
    const INITS: [&str; 6] = [
        "new.target",
        "1 +",
        "=>",
        "f() = 1",
        "a..b",
        // A reserved word as the whole initializer.
        "class",
    ];
    for init in INITS {
        let src = format!("{HEAD}{{#if true}}{{@const c = {init}}}<span>{{c}}</span>{{/if}}\n");
        for generate in [GenerateMode::Client, GenerateMode::Server] {
            let err = try_compile(&src, generate).expect_err("must be rejected");
            assert!(err.contains("js_parse_error"), "{init:?}: {err}");
        }
    }
}

/// The `{#each}` host reaches the same reader by a different route, and it is
/// where a `{@const}` most often lives.
#[test]
fn the_each_host_rejects_it_too() {
    let src = format!("{HEAD}{{#each [1] as _}}{{@const c = 1 +}}<span>{{c}}</span>{{/each}}\n");
    let err = try_compile(&src, GenerateMode::Client).expect_err("must be rejected");
    assert!(err.contains("js_parse_error"), "{err}");
}

/// The pattern half of the declaration is read by the same call, so an
/// unparseable LHS must report as well. Official raises `expected_pattern`
/// here — a Svelte-level error from its own declaration reader — and rsvelte
/// still raises `js_parse_error`; both reject, which is the property this
/// test pins. The code divergence is tracked separately.
#[test]
fn an_unparseable_pattern_is_rejected() {
    for body in ["{@const 1 + = 2}", "{@const 1 +}"] {
        let src = format!("{HEAD}{{#if true}}{body}<span>x</span>{{/if}}\n");
        try_compile(&src, GenerateMode::Client).expect_err("must be rejected");
    }
}

/// The controls: a valid `{@const}` in every shape the reader supports must
/// still compile, on both targets. A fix that propagated too eagerly — or that
/// mistook the deferral for the parse — would move these.
#[test]
fn a_valid_const_tag_still_compiles() {
    const BODIES: [&str; 4] = [
        "{@const c = 1 + 2}",
        "{@const { a } = obj}",
        "{@const [x] = [obj]}",
        // Upstream allows a PARENTHESIZED sequence and only rejects a bare one.
        "{@const c = (1, 2)}",
    ];
    for body in BODIES {
        let src = format!("{HEAD}{{#if true}}{body}<span>ok</span>{{/if}}\n");
        for generate in [GenerateMode::Client, GenerateMode::Server] {
            try_compile(&src, generate).unwrap_or_else(|e| panic!("{body:?} rejected: {e}"));
        }
    }
}

/// The sequence-expression rule is raised from the parsed initializer, so it
/// has to survive the initializer becoming a `?`. It is the one error this arm
/// already reported.
#[test]
fn a_bare_sequence_initializer_still_reports_its_own_error() {
    let src = format!("{HEAD}{{#if true}}{{@const a = 1, c = 2}}<span>{{a}}</span>{{/if}}\n");
    let err = try_compile(&src, GenerateMode::Client).expect_err("must be rejected");
    assert!(err.contains("const_tag_invalid_expression"), "{err}");
}

/// The positive control that names the path: the other slots already reported,
/// and must keep doing so.
#[test]
fn the_other_slots_are_unchanged() {
    for body in ["{1 +}", "<div title={1 +}></div>", "{#if 1 +}y{/if}"] {
        let src = format!("{HEAD}{body}\n");
        let err = try_compile(&src, GenerateMode::Client).expect_err("must be rejected");
        assert!(
            err.contains("js_parse_error") || err.contains("expected_token"),
            "{body:?}: {err}"
        );
    }
}
