//! A `$state` declared bare in a `case` clause stays reactive.
//!
//! **This is a deliberate divergence from the official compiler — do not "fix" it
//! toward official.** For this one shape official lowers the declaration to
//! `$.state(...)` but leaves the references alone, so its own output does `s++` on a
//! `Source` object and the component renders `NaN`. rsvelte emits `$.update(s)` /
//! `$.get(s)`, which is what the braced form of the same case clause compiles to on
//! *both* compilers.
//!
//! The rule: an upstream defect is reproduced only when both outputs behave identically
//! and the disagreement is bytes alone. This one computes a different answer at runtime,
//! so byte parity does not get to require it — byte equality serves the drop-in
//! replacement goal rather than outranking it.
//!
//! `upstream_issues/3420-svelte-case-clause-state-references-untransformed.md` carries the
//! measurement, the brace control that rules out intent, and the open cause attribution.
//! If upstream fixes this, that file and this test are what have to go.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(script: &str, dev: bool) -> String {
    let source = format!(
        "<script>\n\t{script}\n</script>\n\n<button onclick={{() => a++}}>{{a}}{{f(1)}}</button>\n"
    );
    compile(
        &source,
        CompileOptions {
            generate: GenerateMode::Client,
            dev,
            ..Default::default()
        },
    )
    .expect("compile failed")
    .js
    .code
}

/// `$.state(1)` rather than `let s = $.state(1)`, because dev wraps the declaration in
/// `$.tag(...)`; the two reference forms are what this test is actually about.
#[track_caller]
fn assert_reactive(code: &str) {
    for needle in ["$.state(1)", "$.update(s)", "return $.get(s)"] {
        assert!(
            code.contains(needle),
            "expected to find\n  {needle}\nin:\n{code}"
        );
    }
    // The negative half, and the one that fails if someone moves rsvelte toward official:
    // upstream's brace-less output keeps the source's `s++` on a `Source` object.
    assert!(
        !code.contains("s++"),
        "the untransformed `s++` is upstream's NaN-producing output; rsvelte must not \
         emit it:\n{code}"
    );
}

/// The diverging shape. Official emits `s++` and `return s` here, which is `NaN` at
/// runtime; the braced control below is what says that is not intentional.
#[test]
fn a_bare_case_clause_declaration_stays_reactive() {
    let script = "let a = $state(0);\n\tfunction f(k) {\n\t\tswitch (k) {\n\t\t\tcase 1:\n\t\t\t\tlet s = $state(1);\n\t\t\t\ts++;\n\t\t\t\treturn s;\n\t\t}\n\t}";
    assert_reactive(&client(script, false));
    assert_reactive(&client(script, true));
}

/// Control, and the reason the row above is read as an upstream defect rather than a
/// deliberate deopt: adding braces changes nothing else about the declaration, and both
/// compilers then agree on exactly the output rsvelte produces without them.
#[test]
fn a_braced_case_clause_declaration_stays_reactive() {
    let script = "let a = $state(0);\n\tfunction f(k) {\n\t\tswitch (k) {\n\t\t\tcase 1: {\n\t\t\t\tlet s = $state(1);\n\t\t\t\ts++;\n\t\t\t\treturn s;\n\t\t\t}\n\t\t}\n\t}";
    assert_reactive(&client(script, false));
    assert_reactive(&client(script, true));
}

/// Control: the other statement kind that can host a declaration without a function
/// boundary. Both compilers handle it, which is what narrows the defect to `SwitchCase`
/// rather than "a declaration somewhere unusual".
#[test]
fn a_labeled_block_declaration_stays_reactive() {
    let script = "let a = $state(0);\n\tfunction f() {\n\t\touter: {\n\t\t\tlet s = $state(1);\n\t\t\ts++;\n\t\t\treturn s;\n\t\t}\n\t}";
    assert_reactive(&client(script, false));
    assert_reactive(&client(script, true));
}
