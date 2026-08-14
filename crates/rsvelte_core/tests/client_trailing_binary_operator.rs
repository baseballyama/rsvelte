//! A line ending in a binary operator continues the statement.
//!
//! Two client text passes decide where a statement ends by looking only at what
//! comes *after* the line break — the initializer scanner behind
//! `$.mutable_source(...)` and the instance-script line accumulator. Neither
//! looked at the operator the line ends with, so `a ||` / `a ===` with the right
//! operand on the next line closed the statement and emitted `$.mutable_source(a
//! ||)` / `$.set(v, a ===)`, which is not parseable JavaScript.
//!
//! The server target derives both from its own scanners and was already correct,
//! so it is the control.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_to(source: &str, generate: GenerateMode) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some("A.svelte".to_string()),
            generate,
            ..Default::default()
        },
    )
    .expect("compile failed")
    .js
    .code
}

/// The initializer scanner: `let` promoted to state, its initializer split over
/// a trailing `||`.
const TRAILING_OR: &str = "<script>\n  let flag = foo(1) !== undefined ||\n    foo(2) !== undefined\n  function go() { flag = true }\n</script>\n\n<p on:click={go}>{flag}</p>\n";

/// The line accumulator: a `$:` statement split over a trailing `===`.
const TRAILING_STRICT_EQUALS: &str =
    "<script>\n  export let item;\n  $: v = item.a ===\n    1;\n</script>\n\n<p>{v}</p>\n";

#[test]
fn client_keeps_the_operand_after_a_trailing_or() {
    let out = compile_to(TRAILING_OR, GenerateMode::Client);
    assert!(
        out.contains("$.mutable_source(foo(1) !== undefined || foo(2) !== undefined)"),
        "the initializer was cut at the trailing `||`:\n{out}"
    );
}

#[test]
fn server_keeps_the_operand_after_a_trailing_or() {
    let out = compile_to(TRAILING_OR, GenerateMode::Server);
    assert!(
        out.contains("foo(1) !== undefined || foo(2) !== undefined"),
        "the initializer was cut at the trailing `||`:\n{out}"
    );
}

#[test]
fn client_keeps_the_operand_after_a_trailing_strict_equals() {
    let out = compile_to(TRAILING_STRICT_EQUALS, GenerateMode::Client);
    assert!(
        out.contains("$.set(v, item().a === 1)"),
        "the reactive statement was cut at the trailing `===`:\n{out}"
    );
}

#[test]
fn server_keeps_the_operand_after_a_trailing_strict_equals() {
    let out = compile_to(TRAILING_STRICT_EQUALS, GenerateMode::Server);
    assert!(
        out.contains("v = item.a === 1"),
        "the reactive statement was cut at the trailing `===`:\n{out}"
    );
}

/// An operator inside a trailing comment is prose, not a continuation. Testing
/// the raw line instead of the code on it would merge the two declarations, and
/// the tests above would not notice.
#[test]
fn an_operator_inside_a_comment_is_not_a_continuation() {
    let source = "<script>\n  export let a = 1; // wide || tall\n  export let b = 2;\n</script>\n\n<p>{a}{b}</p>\n";
    let out = compile_to(source, GenerateMode::Client);
    assert!(
        out.contains("$.prop($$props, 'a', 8, 1)") && out.contains("$.prop($$props, 'b', 8, 2)"),
        "the comment's `||` merged the two declarations:\n{out}"
    );
}

/// Every operator a line may end with and still continue. `-` and `/` are
/// deliberately absent — `a--` ends a statement and `/` also closes a block
/// comment, so neither can be decided by suffix matching; a line ending in
/// either still emits invalid output until the scan is token-aware.
const CONTINUING_OPERATORS: &[&str] = &[
    "||",
    "&&",
    "??",
    "+",
    "==",
    "!=",
    "<=",
    ">=",
    "*",
    "%",
    "<",
    ">",
    "|",
    "&",
    "^",
    "**",
    "<<",
    ">>",
    "in",
    "instanceof",
];

fn operator_matrix_source(op: &str) -> String {
    format!(
        "<script>\n  export let item;\n  export let width = 1;\n  $: kind =\n    item.a {op}\n    item.b;\n  function toggle() {{ width = 2; }}\n</script>\n\n<button on:click={{toggle}}>{{kind}}{{width}}</button>\n"
    )
}

/// The matrix this list is pinned against: narrowing it back to a handful of
/// operators reintroduces #2637 for the rest.
#[test]
fn every_continuing_operator_keeps_its_right_operand() {
    for op in CONTINUING_OPERATORS {
        let out = compile_to(&operator_matrix_source(op), GenerateMode::Client);
        let want = format!("$.set(kind, item().a {op} item().b)");
        assert!(
            out.contains(&want),
            "a line ending in `{op}` cut the statement; expected `{want}`:\n{out}"
        );
    }
}

/// `,` continues too, but a sequence expression is not an assignment, so its
/// emitted shape differs from the operators above.
#[test]
fn a_trailing_comma_keeps_its_right_operand() {
    let out = compile_to(&operator_matrix_source(","), GenerateMode::Client);
    assert!(
        out.contains("kind = item().a, item().b;"),
        "a line ending in `,` cut the sequence:\n{out}"
    );
}

/// `in` and `instanceof` are word operators. A bare `ends_with("in")` matches the
/// identifier `margin` too, and the statement would swallow the next line —
/// *wrong* code, which no parser catches, where the bug being fixed produced
/// *unparseable* code, which every parser catches.
#[test]
fn an_identifier_ending_in_in_is_not_the_in_operator() {
    // `margin` must be a local, not a prop: a prop is rewritten to `margin()`
    // before this scan runs, and the trailing `in` is gone before it is asked
    // about — the test would then pass with the guard removed.
    let source = "<script>\n  let margin = 1;\n  let scaled = margin\n  let other = 2;\n  function go() { other = 3; scaled = 4 }\n</script>\n\n<p on:click={go}>{scaled}{other}</p>\n";
    let out = compile_to(source, GenerateMode::Client);
    assert!(
        out.contains("$.mutable_source(margin)") && out.contains("$.mutable_source(2)"),
        "`margin` was read as a trailing `in` and swallowed the next declaration:\n{out}"
    );
}

/// `let m: Map<string, number>` ends in `>` and is a complete statement, so
/// treating a trailing `>` as a continuation would swallow the next declaration —
/// silently, since the result still parses. It does not, but only because
/// `remove_typescript_nodes` strips the annotation before these scanners run;
/// this pins that ordering rather than the tails being unambiguous. `|` (union)
/// and `<`/`>` (generics) are the same argument.
#[test]
fn a_typescript_annotation_tail_is_not_a_continuation() {
    let source = "<script lang=\"ts\">\n  let u: string | number\n  let m: Map<string, number>\n  let n = 1;\n  function go() { n = 2; u = 'a'; m = new Map() }\n</script>\n\n<p on:click={go}>{n}{u}{m}</p>\n";
    let out = compile_to(source, GenerateMode::Client);
    assert!(
        out.contains("let u = $.mutable_source()")
            && out.contains("let m = $.mutable_source()")
            && out.contains("let n = $.mutable_source(1)"),
        "a TS annotation's trailing `|` / `>` swallowed the next declaration:\n{out}"
    );
}

/// `a++` ends a statement even though it ends in `+`. Reading every trailing `+`
/// as a continuation would swallow the next statement.
#[test]
fn a_post_increment_still_ends_the_statement() {
    let source = "<script>\n  let n = 0;\n  function go() {\n    n++\n    n = n * 2\n  }\n</script>\n\n<p on:click={go}>{n}</p>\n";
    let out = compile_to(source, GenerateMode::Client);
    assert!(
        out.contains("$.set(n, $.get(n) * 2)"),
        "the post-increment swallowed the next statement:\n{out}"
    );
}
