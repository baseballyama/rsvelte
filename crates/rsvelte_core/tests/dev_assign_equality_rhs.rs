//! `$.assign` (dev mutation validation) is skipped when the assigned value is a
//! known primitive. This pass runs over the *settled* script, by which point the
//! dev equality rewrite has turned `a === b` into `$.strict_equals(a, b)` — a
//! call, not a `BinaryExpression` — while upstream evaluates the original
//! right-hand side and sees a primitive. Without looking through the lowering,
//! the same source is wrapped here and not there.
//!
//! The corpus gates' `client` target compiles with `dev: false`, where no
//! lowering happens, so only the `client-dev` target can see this at all.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client_dev(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("A.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

fn arrow_body(rhs: &str) -> String {
    client_dev(&format!(
        "<script>\n\tconst list = [];\n\texport function f() {{ list.forEach((el) => el.checked = {rhs}); }}\n</script>\n<p>x</p>\n"
    ))
}

#[test]
fn an_equality_right_hand_side_is_still_a_known_primitive() {
    let out = arrow_body("el.y === 0");
    assert!(
        out.contains("el.checked = $.strict_equals(el.y, 0)"),
        "expected the bare assignment, got:\n{out}"
    );
    assert!(
        !out.contains("$.assign("),
        "expected no wrapper, got:\n{out}"
    );
}

#[test]
fn the_loose_and_negated_spellings_lower_the_same_way() {
    for rhs in ["el.y == 0", "el.y !== 0", "el.y != 0"] {
        let out = arrow_body(rhs);
        assert!(
            !out.contains("$.assign("),
            "`{rhs}` should not be wrapped, got:\n{out}"
        );
    }
}

#[test]
fn a_logical_whose_branches_are_primitive_is_primitive() {
    let out = arrow_body("el.y === 0 && 1");
    assert!(
        !out.contains("$.assign("),
        "expected no wrapper, got:\n{out}"
    );
}

/// The lookthrough must not make every call primitive: a call upstream cannot
/// evaluate is still UNKNOWN, and the wrapper has to stay.
#[test]
fn an_ordinary_call_is_still_wrapped() {
    let out = client_dev(
        "<script>\n\tconst list = [];\n\texport function f(g) { list.forEach((el) => el.checked = g(el.y)); }\n</script>\n<p>x</p>\n",
    );
    assert!(
        out.contains("$.assign(el, 'checked', '='"),
        "expected the wrapper, got:\n{out}"
    );
}

/// A relational operator is never lowered, so it exercises the `BinaryExpression`
/// arm directly — the control that shows the two tests above are not both
/// passing for the same reason.
#[test]
fn a_relational_right_hand_side_was_never_affected() {
    let out = arrow_body("el.y < 0");
    assert!(
        !out.contains("$.assign("),
        "expected no wrapper, got:\n{out}"
    );
    assert!(
        out.contains("el.checked = el.y < 0"),
        "expected the bare assignment, got:\n{out}"
    );
}
