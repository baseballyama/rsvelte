//! A TypeScript overload SIGNATURE may repeat a name; a second IMPLEMENTATION
//! may not (#3484).
//!
//! rsvelte answered this with "TypeScript has overloads, therefore exempt every
//! function-vs-function redeclaration" — the same over-broad rule in two
//! independent places. OXC's TS mode raises no diagnostic at all, so the
//! parse-phase check ported for #3243 has nothing to map, and
//! `2_analyze/scope_builder.rs` carried the same blanket exemption. The real
//! boundary is the BODY, which is why the rows below vary the number of bodies
//! while holding the number of `function` keywords fixed.
//!
//! Every expectation was measured against `submodules/svelte`; the wording,
//! the code and the zero-width span are acorn's.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compile_script(body: &str, lang_ts: bool) -> Result<String, String> {
    let open = if lang_ts {
        "<script lang=\"ts\">"
    } else {
        "<script>"
    };
    let src = format!("{open}\n\t{body}\n</script>\n\n<p>ok</p>\n");
    compile(
        &src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Server,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .map_err(|e| format!("{e:?}"))
}

/// `|` marks the offset official reports, and the marker is stripped before
/// compiling — a fix that rejects at the wrong byte fails here rather than
/// passing.
const DUPLICATE_IMPLEMENTATIONS: &[&str] = &[
    "function f() {} function |f() {}",
    "function f() {} function |f(a: any) {}",
    "function f(a: number): void; function f(a: any) {} function |f(a: any) {}",
];

// `export function f() {} export function f() {}` is deliberately NOT here.
// Both compilers reject it, but rsvelte answers from an earlier export check
// (`Duplicated export 'f'` at the first `f`) where acorn answers
// `Identifier 'f' has already been declared` at the second. That is a message
// and position divergence on an input already rejected, which is #3432's
// subject, not this one's — and asserting it here would make this test fail for
// a reason that has nothing to do with the exemption being narrowed.

/// The whole reason the exemption exists. A body-less declaration may repeat a
/// name any number of times, and `declare function` is the same shape.
const OVERLOAD_SETS: &[&str] = &[
    "function f(a: number): void; function f(a: any) {}",
    "function f(a: number): void; function f(a: string): void; function f(a: any) {}",
    "declare function f(a: number): void; function f(a: any) {}",
    "function f(a: number): void;\nfunction f(a: any) {}",
    // Not a redeclaration at all: a nested block is its own scope.
    "function f() {} { function f() {} }",
    "function f() {}",
];

#[test]
fn a_second_implementation_is_rejected_where_acorn_rejects_it() {
    for marked in DUPLICATE_IMPLEMENTATIONS {
        let body = marked.replace('|', "");
        let at = format!("<script lang=\"ts\">\n\t{marked}")
            .find('|')
            .expect("the marker survives wrapping");
        let err = match compile_script(&body, true) {
            Err(err) => err,
            Ok(code) => panic!("{body:?} must not compile with lang=\"ts\"; emitted:\n{code}"),
        };
        assert!(
            err.contains("js_parse_error"),
            "expected acorn's code for {body:?}, got: {err}"
        );
        assert!(
            err.contains("Identifier 'f' has already been declared"),
            "expected acorn's wording for {body:?}, got: {err}"
        );
        assert!(
            err.contains(&format!("start: Some({at}), end: Some({at})")),
            "expected the zero-width span at {at} for {body:?}, got: {err}"
        );
    }
}

#[test]
fn an_overload_set_still_compiles() {
    for body in OVERLOAD_SETS {
        assert!(
            compile_script(body, true).is_ok(),
            "{body:?} must compile with lang=\"ts\""
        );
    }
}

/// The plain-JS half of the same rule, where a function declaration always has
/// a body — so every one of these is a second implementation.
#[test]
fn the_javascript_side_is_rejected_too() {
    for body in ["function f() {} function f() {}"] {
        let err = compile_script(body, false)
            .expect_err("two implementations must not compile without lang=\"ts\" either");
        assert!(
            err.contains("Identifier 'f' has already been declared"),
            "expected acorn's wording for {body:?}, got: {err}"
        );
    }
    for body in ["function f() {} { function f() {} }", "function f() {}"] {
        assert!(
            compile_script(body, false).is_ok(),
            "{body:?} must still compile"
        );
    }
}

/// Two snippets share `DeclarationKind::Function` with a function declaration,
/// and their duplicate check is a separate one. Narrowing the function
/// exemption must neither silence it nor make it fire twice.
#[test]
fn duplicate_snippets_still_report_exactly_once() {
    let src = "<script>\n\tlet a = 1;\n</script>\n\n{#snippet s()}{a}{/snippet}\n{#snippet s()}{a}{/snippet}\n";
    let err = compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Server,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .map_err(|e| format!("{e:?}"))
    .expect_err("two snippets with one name are a duplicate declaration");
    assert!(
        err.contains("declaration_duplicate"),
        "the snippet check owns this one, not the function check: {err}"
    );
}
