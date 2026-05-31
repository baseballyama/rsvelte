//! Regression test pin for the inline-JS statement-conversion cluster
//! (issue #456, H-109..H-112).
//!
//! Every finding in this cluster was addressed by an earlier PR. The bug
//! shapes (statement-to-string converter losing `switch`, mis-emitting
//! `for...in` as `for...of`, dropping a labeled `outer: …`, and flattening a
//! destructured catch parameter) are easy to regress when the converter is
//! touched, so pin each one with a single targeted assertion.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn client(src: &str) -> String {
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

#[test]
fn h109_switch_statement_is_preserved() {
    // `switch (x) { case … }` must survive the inline-JS converter as a real
    // switch — previously it was flattened to an `if` chain that mis-grouped
    // fall-through arms.
    let out = client(
        r#"<script>
            function f(x) {
                switch (x) {
                    case 1: return "a";
                    default: return "b";
                }
            }
        </script>{f(1)}"#,
    );
    assert!(out.contains("switch"), "got:\n{out}");
    assert!(out.contains("case 1"), "got:\n{out}");
    assert!(out.contains("default"), "got:\n{out}");
}

#[test]
fn h110_for_in_stays_for_in() {
    let out = client(
        r#"<script>
            let obj = { a: 1, b: 2 };
            function g() {
                let out = "";
                for (let k in obj) { out += k; }
                return out;
            }
        </script>{g()}"#,
    );
    assert!(
        out.contains("for(let k in obj)") || out.contains("for (let k in obj)"),
        "got:\n{out}"
    );
}

#[test]
fn h111_labeled_break_keeps_its_label() {
    let out = client(
        r#"<script>
            function h() {
                outer: for (let i = 0; i < 10; i++) {
                    for (let j = 0; j < 10; j++) {
                        if (j === 5) break outer;
                    }
                }
            }
        </script>{h()}"#,
    );
    assert!(out.contains("outer:"), "label must survive, got:\n{out}");
    assert!(
        out.contains("break outer"),
        "labeled break must survive, got:\n{out}"
    );
}

#[test]
fn h112_destructured_catch_param_is_preserved() {
    let out = client(
        r#"<script>
            let s = "";
            function k() {
                try { throw new Error("x"); }
                catch ({ message }) { s = message; }
                return s;
            }
        </script>{k()}"#,
    );
    assert!(
        out.contains("catch({ message })") || out.contains("catch ({ message })"),
        "destructured catch param must survive, got:\n{out}"
    );
}
