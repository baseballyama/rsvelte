//! A **computed** property key in a `<script>` carried a span one byte early,
//! so every position derived from it — the `bidirectional_control_characters`
//! warning here, and anything else that reads a position out of the serialized
//! program — pointed at the `[` instead of at the key expression.
//!
//! Cause: `convert_property_key` is the program-path key converter (its callers
//! are all `*_for_program`), but its computed branch reached for
//! `convert_expression`, which subtracts one byte "for the paren we added" —
//! the wrapper a **template** expression is parsed inside and a script is not.
//! The identifier branches beside it never had the subtraction, which is why a
//! plain key was right and only a computed one was wrong.
//!
//! Every expectation below was read off the official compiler
//! (`submodules/svelte`), **one input per process** — the upstream bidi regex
//! carries the `g` flag and `.test()` advances its `lastIndex`, so a multi-case
//! run in one process reports different answers than a real compile does.

use rsvelte_core::{CompileOptions, GenerateMode, Warning, compile};

/// U+202E RIGHT-TO-LEFT OVERRIDE.
const RLO: &str = "\u{202e}";

fn warnings(src: &str) -> Vec<Warning> {
    compile(
        src,
        CompileOptions {
            filename: Some("Main.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .warnings
}

/// `line:column` of every bidi warning, in emission order.
fn bidi(src: &str) -> Vec<String> {
    warnings(src)
        .iter()
        .filter(|w| w.code == "bidirectional_control_characters")
        .map(|w| {
            let pos = w.start.as_ref().expect("warning has a start position");
            format!("{}:{}", pos.line, pos.column)
        })
        .collect()
}

/// Every host a computed property key has in a script: an object literal, a
/// class field, a class method, a destructuring pattern, and `<script module>`.
/// All were one column early.
#[test]
fn a_computed_key_in_a_script_is_not_one_column_early() {
    assert_eq!(
        bidi(&format!("<script>let o = {{[\"a{RLO}b\"]: 1}};</script>")),
        ["1:18"]
    );
    assert_eq!(
        bidi(&format!(
            "<script>let o = {{a: 1, [\"a{RLO}b\"]: 1}};</script>"
        )),
        ["1:24"]
    );
    assert_eq!(
        bidi(&format!(
            "<script>class K {{ [\"a{RLO}b\"] = 1; }}</script>"
        )),
        ["1:19"]
    );
    assert_eq!(
        bidi(&format!(
            "<script>class K {{ [\"a{RLO}b\"]() {{}} }}</script>"
        )),
        ["1:19"]
    );
    assert_eq!(
        bidi(&format!(
            "<script>let {{[\"a{RLO}b\"]: v}} = {{}};</script>"
        )),
        ["1:14"]
    );
    assert_eq!(
        bidi(&format!(
            "<script module>let o = {{[\"a{RLO}b\"]: 1}};</script>"
        )),
        ["1:25"]
    );
}

/// The key's whole subtree moved, not just a string literal directly under the
/// bracket: a template literal and a nested binary operand were equally early.
#[test]
fn the_whole_key_subtree_moves_with_it() {
    assert_eq!(
        bidi(&format!("<script>let o = {{[`a{RLO}b`]: 1}};</script>")),
        ["1:19"]
    );
    assert_eq!(
        bidi(&format!(
            "<script>let o = {{[1 + \"a{RLO}b\"]: 1}};</script>"
        )),
        ["1:22"]
    );
}

/// Controls. A plain key, a bare literal and a computed **member** all take
/// different paths and were already correct — the fix must not move them, or it
/// is paying for the computed key with its neighbours.
#[test]
fn the_neighbouring_positions_are_unaffected() {
    assert_eq!(
        bidi(&format!("<script>let o = {{k: \"a{RLO}b\"}};</script>")),
        ["1:20"]
    );
    assert_eq!(
        bidi(&format!("<script>let s = \"a{RLO}b\";</script>")),
        ["1:16"]
    );
    assert_eq!(
        bidi(&format!("<script>let v = ({{}})[\"a{RLO}b\"];</script>")),
        ["1:21"]
    );
}

/// A template expression IS parsed inside the paren wrapper, so it was already
/// right and must stay right — this is the case whose converter the script path
/// was borrowing.
#[test]
fn a_template_expression_keeps_its_positions() {
    assert_eq!(
        bidi(&format!("<b>{{JSON.stringify({{[\"a{RLO}b\"]: 1}})}}</b>")),
        ["1:21"]
    );
    assert_eq!(bidi(&format!("<b>{{({{}})[\"a{RLO}b\"]}}</b>")), ["1:9"]);
}
