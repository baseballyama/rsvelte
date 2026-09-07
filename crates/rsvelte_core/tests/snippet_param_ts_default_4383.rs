//! A snippet parameter's default is built from the parsed node, not from its
//! source span (#4383).
//!
//! `build_snippet_function` reconstructed each parameter's spelling by slicing
//! `source[param.start..param.end]` and re-parsing the joined list as plain JS.
//! The span still covers the TypeScript the parse erased — `(t: T) => t` spans
//! `t: T`, and OXC reads `<string>() => 1` as a **generic arrow** whose span
//! starts at the `<` — so the slice was either wrong or rejected. On a
//! rejection `reparse_params` returned `None` and the caller fell back to
//! `($$renderer)`, silently discarding EVERY declared parameter while the body
//! still read them: `function s($$renderer) { … p … }`.
//!
//! The default now comes from `visit_expr_raw`, which converts the parsed
//! (already TS-erased) node, so no TypeScript can reach the emitted text and no
//! parse can fail. The pattern half stays textual — a pattern has no expression
//! to convert.
//!
//! Every expectation is the line `svelte.compile({ generate: 'server' })` emits
//! for that source, read out of `submodules/svelte` at `VERSION === '5.57.0'`.
//! The four TS rows are the fix; the rest are controls that were already EQ and
//! must stay so — a change that reached only the reported `<string>()` shape
//! passes one row of four.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// `(name, parameter list, the line the official compiler emits)`.
#[rustfmt::skip]
const CELLS: &[(&str, &str, &str)] = &[
    ("plain", r#"p"#, r#"function s($$renderer, p) {"#),
    ("num", r#"p = 1"#, r#"function s($$renderer, p = 1) {"#),
    ("annot", r#"p: any = 1"#, r#"function s($$renderer, p = 1) {"#),
    ("cast_num", r#"p = <string>1"#, r#"function s($$renderer, p = 1) {"#),
    ("cast_ident", r#"p = <string>obj"#, r#"function s($$renderer, p = obj) {"#),
    ("cast_arrow", r#"p = <string>() => 1"#, r#"function s($$renderer, p = () => 1) {"#),
    ("two_cast", r#"q, p = <string>() => 1"#, r#"function s($$renderer, q, p = () => 1) {"#),
    ("generic_arrow", r#"p = <T,>(t: T) => t"#, r#"function s($$renderer, p = (t) => t) {"#),
    ("annot_arrow", r#"p = (t: T) => t"#, r#"function s($$renderer, p = (t) => t) {"#),
    ("nonnull", r#"p = obj!"#, r#"function s($$renderer, p = obj) {"#),
    ("cast_call", r#"p = <string>obj.f()"#, r#"function s($$renderer, p = obj.f()) {"#),
    ("arrow", r#"p = () => 1"#, r#"function s($$renderer, p = () => 1) {"#),
    ("obj_pat", r#"{ a = 1 }"#, r#"function s($$renderer, { a = 1 }) {"#),
    ("arr_pat", r#"[a = 1]"#, r#"function s($$renderer, [a = 1]) {"#),
    ("default_obj", r#"p = { a: 1 }"#, r#"function s($$renderer, p = { a: 1 }) {"#),
    ("member", r#"p = obj.a"#, r#"function s($$renderer, p = obj.a) {"#),
    ("ternary_flat", r#"p = obj.a ? 1 : 2"#, r#"function s($$renderer, p = obj.a ? 1 : 2) {"#),
    ("tpl", r#"p = `a`"#, r#"function s($$renderer, p = `a`) {"#),
    ("await_like", r#"p = obj.a ?? (obj.b ?? 1)"#, r#"function s($$renderer, p = obj.a ?? (obj.b ?? 1)) {"#),
    ("bin_par", r#"p = (1 + 2) * 3"#, r#"function s($$renderer, p = (1 + 2) * 3) {"#),
];

/// The four rows whose parameter list carries TypeScript. Named rather than
/// detected, so adding a TS row without adding it here fails the count below.
const TS_ROWS: &[&str] = &["cast_arrow", "two_cast", "generic_arrow", "annot_arrow"];

fn server_line(params: &str) -> String {
    let src = format!(
        "<script lang=\"ts\">let obj: any; let q: any;</script>\n\
         {{#snippet s({params})}}{{p}}{{/snippet}}\n{{@render s()}}\n"
    );
    compile(
        &src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Server,
            dev: false,
            ..Default::default()
        },
    )
    .map(|out| {
        out.js
            .code
            .lines()
            .find(|line| line.contains("function s("))
            .unwrap_or("(none)")
            .trim()
            .to_string()
    })
    .unwrap_or_else(|error| format!("THREW {error}"))
}

#[test]
fn a_typescript_default_keeps_the_whole_parameter_list() {
    let mut checked = 0;
    for (name, params, expected) in CELLS {
        if !TS_ROWS.contains(name) {
            continue;
        }
        assert_eq!(&server_line(params), expected, "{name}: `{params}`");
        checked += 1;
    }
    assert_eq!(checked, TS_ROWS.len(), "every TS row is in the table");
}

#[test]
fn the_shapes_that_already_worked_are_unmoved() {
    for (name, params, expected) in CELLS {
        if TS_ROWS.contains(name) {
            continue;
        }
        assert_eq!(&server_line(params), expected, "{name}: `{params}`");
    }
}

/// The amplifier, asserted on its own: a parameter the old path could not read
/// took its SIBLING with it, so `q` disappeared from a list whose only TS is in
/// `p`'s default. A fix that reads the TS parameter but rebuilds the list from
/// the ones it could read passes the row above and fails this one.
#[test]
fn a_sibling_parameter_is_not_collateral() {
    let line = server_line("q, p = <string>() => 1");
    assert!(line.contains("$$renderer, q, p ="), "got: {line}");
}

/// The body still reads `p`, so the old output referenced an undeclared name.
/// This is the property that makes it a correctness hole rather than byte
/// parity, and it is not visible in the parameter list alone.
#[test]
fn the_emitted_function_declares_every_name_its_body_reads() {
    let src = "<script lang=\"ts\">let obj: any;</script>\n\
               {#snippet s(p = <string>() => 1)}{p}{/snippet}\n{@render s()}\n";
    let code = compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Server,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compiles")
    .js
    .code;
    let header = code
        .lines()
        .find(|line| line.contains("function s("))
        .expect("emits the snippet function");
    assert!(
        header.contains(", p ="),
        "`p` is read in the body; got: {header}"
    );
}
