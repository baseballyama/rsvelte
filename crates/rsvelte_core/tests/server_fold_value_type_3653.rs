//! Regression tests for #3653 — the SSR binding-initializer fold carried a
//! folded constant as its RENDERED TEXT, so `const r = '1' + '1'` rendered `2`.
//!
//! This is the client fold's defect (#3027) on the other side of the compiler:
//! in a `FxHashMap<String, String>` the string `'1'` and the number `1` are one
//! value, and `+` is the operator that can tell them apart. The map now holds
//! `EvalValue` — the same type `evaluate.rs` uses for template expressions,
//! which is why `{'1' + '1'}` written directly was always right — and the
//! operators fold through `eval_binary`, the one port of JS coercion here.
//!
//! Two more defects were in the same scan and are covered below: the split
//! picked `*` FIRST, which makes it the tree's root (`1 + 2 * 3` → `9`), and it
//! picked the LEFTMOST operator, which is the wrong associativity
//! (`10 - 3 - 2` → `9`).
//!
//! Every expectation is the byte-exact output of the official compiler
//! (Svelte v5.56.9).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// One expression per row, with the value JS gives it.
const CASES: [(&str, &str); 22] = [
    ("'1' + '1'", "11"),
    ("'1' + 1", "11"),
    ("1 + '1'", "11"),
    ("1 + 1", "2"),
    ("'a' + 1", "a1"),
    ("'1' + true", "1true"),
    ("'1' + null", "1null"),
    ("'1' + undefined", "1undefined"),
    ("'2' * '3'", "6"),
    ("'3' - '1'", "2"),
    ("'a' - 1", "NaN"),
    ("'1' + '1' + '1'", "111"),
    ("1 + 2 * 3", "7"),
    ("'x' + 2 * 3", "x6"),
    ("0.1 + 0.2", "0.30000000000000004"),
    ("'' + 0", "0"),
    ("true + 1", "2"),
    ("null + 1", "1"),
    ("'10' + 9", "109"),
    ("-1 + '1'", "-11"),
    ("10 - 3 - 2", "5"),
    ("'2' * '3' + '1'", "61"),
];

fn server(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("X.svelte".to_string()),
            generate: GenerateMode::Server,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// The defect: a `const` initializer folded by the text scan.
#[test]
fn a_const_initializer_folds_with_js_coercion() {
    for (expr, expected) in CASES {
        let code = server(&format!(
            "<script>\n\tconst r = {expr};\n</script>\n<p>{{r}}</p>\n"
        ));
        assert!(
            code.contains(&format!("$$renderer.push(`<p>{expected}</p>`);")),
            "for {expr:?} (expected {expected:?}) in:\n{code}"
        );
    }
}

/// The same expression written directly in the template was always right —
/// that path already went through `EvalValue`. It is the positive control that
/// named the representation rather than any one operator.
#[test]
fn the_direct_template_expression_agrees_with_the_binding() {
    for (expr, expected) in CASES {
        let code = server(&format!("<p>{{{expr}}}</p>\n"));
        assert!(
            code.contains(&format!("$$renderer.push(`<p>{expected}</p>`);")),
            "for {expr:?} (expected {expected:?}) in:\n{code}"
        );
    }
}

/// A folded constant read through a second binding keeps its type: rendering it
/// to text at the first hop is exactly what lost `'1'`.
#[test]
fn a_folded_constant_stays_a_value_across_a_second_binding() {
    for (expr, one, two) in [
        ("'1' + '1'", "11", "1111"),
        ("1 + 1", "2", "4"),
        ("'a' + 1", "a1", "a1a1"),
        ("1 + 2 * 3", "7", "14"),
    ] {
        let code = server(&format!(
            "<script>\n\tconst a = {expr};\n\tconst r = a + a;\n</script>\n<p>{{a}}{{r}}</p>\n"
        ));
        assert!(
            code.contains(&format!("$$renderer.push(`<p>{one}{two}</p>`);")),
            "for {expr:?} in:\n{code}"
        );
    }
}

/// `$derived` and `{@const}` reach the same scan through different hosts.
#[test]
fn the_other_hosts_fold_the_same_way() {
    let derived = server("<script>\n\tconst r = $derived('1' + '1');\n</script>\n<p>{r}</p>\n");
    assert!(
        derived.contains("$$renderer.push(`<p>11</p>`);"),
        "in:\n{derived}"
    );
    let const_tag = server(
        "<script>\n\tconst q = 1;\n</script>\n{#if q}{@const r = '1' + '1'}<p>{r}</p>{/if}\n",
    );
    assert!(const_tag.contains("<p>11</p>"), "in:\n{const_tag}");
}

/// The client was byte-identical to official throughout — its fold already went
/// through a typed value — which is half of why only output equality could see
/// this. It also folds, so it is a second oracle for the same arithmetic.
#[test]
fn the_client_folds_the_same_values() {
    for (expr, expected) in CASES {
        let code = compile(
            &format!("<script>\n\tconst r = {expr};\n</script>\n<p>{{r}}</p>\n"),
            CompileOptions {
                filename: Some("X.svelte".to_string()),
                generate: GenerateMode::Client,
                ..Default::default()
            },
        )
        .expect("compile")
        .js
        .code;
        assert!(
            code.contains(&format!("p.textContent = '{expected}';")),
            "for {expr:?} (expected {expected:?}) in:\n{code}"
        );
    }
}
