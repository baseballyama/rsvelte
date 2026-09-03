//! A legacy `export let` default is emitted eagerly (`$.prop(…, 8, <expr>)`) when
//! upstream's `is_simple_expression` accepts it and lazily (`24, () => <expr>`)
//! otherwise — and upstream runs that test on the **visited** expression, not on
//! the source. In dev the four equality operators are rewritten to
//! `$.strict_equals` / `$.equals` CALLS unconditionally (`BinaryExpression.js`),
//! so a default containing one is non-simple in dev and simple in prod.
//!
//! rsvelte answered from the source shape, so `export let straight = edgeStyle ===
//! 'straight'` came out eager in dev where official thunks it.
//!
//! The rows below therefore cross the operator with `dev`: the same cell must be
//! eager in one column and lazy in the other, which no single-mode grid can state.
//! Every expected string was taken from the official Svelte compiler
//! (`submodules/svelte/packages/svelte/src/compiler/index.js`).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// The `$.prop(...)` call for `p`, with the `let p = ` prefix and the `;` removed.
fn prop_call(default_expr: &str, dev: bool) -> String {
    let src = format!(
        "<script>\n\tconst a = 'x';\n\tconst b = 'y';\n\tconst c = 'z';\n\tfunction f() {{ return 1; }}\n\texport let p = {default_expr};\n</script>\n<p>{{p}}</p>\n"
    );
    let js = compile(
        &src,
        CompileOptions {
            filename: Some("M.svelte".to_string()),
            generate: GenerateMode::Client,
            dev,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    let line = js
        .lines()
        .map(str::trim)
        .find(|l| l.contains("$.prop($$props, 'p'"))
        .unwrap_or_else(|| panic!("no `$.prop` line for `{default_expr}` (dev={dev}) in:\n{js}"));
    let start = line.find("$.prop($$props, 'p'").expect("call");
    line[start..].trim_end_matches(';').to_string()
}

/// `(name, default, official prod, official dev)`.
const CELLS: &[(&str, &str, &str, &str)] = &[
    (
        "=== at the top level",
        "a === 'x'",
        "$.prop($$props, 'p', 8, a === 'x')",
        "$.prop($$props, 'p', 24, () => $.strict_equals(a, 'x'))",
    ),
    (
        "!== at the top level",
        "a !== 'x'",
        "$.prop($$props, 'p', 8, a !== 'x')",
        "$.prop($$props, 'p', 24, () => $.strict_equals(a, 'x', false))",
    ),
    (
        "== at the top level",
        "a == 'x'",
        "$.prop($$props, 'p', 8, a == 'x')",
        "$.prop($$props, 'p', 24, () => $.equals(a, 'x'))",
    ),
    (
        "!= at the top level",
        "a != 'x'",
        "$.prop($$props, 'p', 8, a != 'x')",
        "$.prop($$props, 'p', 24, () => $.equals(a, 'x', false))",
    ),
    (
        // A relational operator is not rewritten, so this cell must NOT move with
        // `dev` — it is what separates "an equality operator" from "a binary
        // expression".
        "< is not rewritten",
        "a < 1",
        "$.prop($$props, 'p', 8, a < 1)",
        "$.prop($$props, 'p', 8, a < 1)",
    ),
    (
        "+ is not rewritten",
        "a + 1",
        "$.prop($$props, 'p', 8, a + 1)",
        "$.prop($$props, 'p', 8, a + 1)",
    ),
    (
        // The recursion reaches it through a logical operator.
        "=== inside ||",
        "a || (b === 'x')",
        "$.prop($$props, 'p', 8, a || b === 'x')",
        "$.prop($$props, 'p', 24, () => a || $.strict_equals(b, 'x'))",
    ),
    (
        "=== in a ternary consequent",
        "a ? b === 'x' : c",
        "$.prop($$props, 'p', 8, a ? b === 'x' : c)",
        "$.prop($$props, 'p', 24, () => a ? $.strict_equals(b, 'x') : c)",
    ),
    (
        "=== in a ternary alternate",
        "a ? b : (c === 'x')",
        "$.prop($$props, 'p', 8, a ? b : c === 'x')",
        "$.prop($$props, 'p', 24, () => a ? b : $.strict_equals(c, 'x'))",
    ),
    (
        "a literal",
        "1",
        "$.prop($$props, 'p', 8, 1)",
        "$.prop($$props, 'p', 8, 1)",
    ),
    (
        "an identifier",
        "a",
        "$.prop($$props, 'p', 8, a)",
        "$.prop($$props, 'p', 8, a)",
    ),
    (
        // Lazy in BOTH modes, and through the no-arg-callee unwrap rather than a
        // thunk — so a fix that made everything lazy still has to spell this one
        // differently.
        "a no-argument call",
        "f()",
        "$.prop($$props, 'p', 24, f)",
        "$.prop($$props, 'p', 24, f)",
    ),
    (
        // An arrow is simple whatever its body holds, so the recursion never
        // enters it: this is the cell that fails if the check is a text search
        // for the operator rather than a walk of the simple-expression positions.
        "=== inside an arrow body",
        "() => a === 'x'",
        "$.prop($$props, 'p', 8, () => a === 'x')",
        "$.prop($$props, 'p', 8, () => $.strict_equals(a, 'x'))",
    ),
];

#[test]
fn an_equality_operator_makes_a_legacy_prop_default_lazy_in_dev_only() {
    // Both directions, and cells that must NOT move with `dev`: a rule keyed on
    // `dev` alone, or on "is this a BinaryExpression", fails one of these halves.
    assert!(
        CELLS.iter().any(|(_, _, prod, dev)| prod != dev),
        "no cell distinguishes the two modes"
    );
    assert!(
        CELLS.iter().filter(|(_, _, prod, dev)| prod == dev).count() >= 5,
        "too few cells are mode-invariant"
    );

    for (name, default_expr, want_prod, want_dev) in CELLS {
        assert_eq!(
            prop_call(default_expr, false),
            *want_prod,
            "cell `{name}` (prod)"
        );
        assert_eq!(
            prop_call(default_expr, true),
            *want_dev,
            "cell `{name}` (dev)"
        );
    }
}
