//! Regression tests for #3557 — a `globals` call in a `const`'s initializer
//! either did not fold at all, or folded and still lost the `textContent` fast
//! path.
//!
//! Upstream keeps ONE `globals` table (`phases/scope.js:26-74`), whose entries
//! pair a type marker with the real JS function, and `scope.evaluate` calls that
//! function when every argument is known. rsvelte had ported it twice: the
//! server's `3_transform/server/evaluate.rs` carries the whole table, while the
//! client's constant folder had its own copy holding eight `Math.*` names — so
//! `String('a')` and `Math.trunc(-1.7)` folded on the server and not on the
//! client. Neither gate compares the two ports to each other. The client's arm
//! now asks the server's table, which is also what makes the SHADOW row below
//! meaningful: `get_global_keypath` yields nothing for a bound name, and the
//! client's copy never checked.
//!
//! The second cause is one the fold alone cannot show. `get_literal_value_json`
//! refuses to fold any expression whose `has_call` is set, because upstream
//! memoizes a template chunk BEFORE evaluating it — but that is a property of
//! the template expression, not of a binding's initializer, which is never
//! memoized. `initial_is_non_reactive` evaluated an initializer at depth 0 and
//! so took that bail, which is why `Math.max(1, k)` folded to `'5'` through the
//! identifier arm (which does enter at depth 1) and was simultaneously reported
//! as reactive state — a value written by `text.nodeValue = '5'` into a
//! `<u> </u>` placeholder that can never change.
//!
//! The two causes are separable, and the last two tests are the inputs that
//! separate them: an inline `{Math.max(1, k)}` must stay reactive (the depth-0
//! bail is correct there — official memoizes it) while `const v = Math.max(1,
//! k); {v}` folds, and `Math.hypot` — absent from upstream's table though every
//! sibling `Math.*` is in it — must not fold at all.
//!
//! Every expectation below is the byte-exact output of the official compiler
//! (Svelte v5.56.9).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// `<u>{body}</u>` with `head` appended to the instance script. `w` is written,
/// so a genuinely reactive read stays reactive.
fn compile_client(head: &str, body: &str, dev: bool) -> String {
    let src = format!(
        "<script>\n\tlet w = $state(1);\n\tconst k = 5;\n\tfunction bump() {{ w += 1; }}\n{head}</script>\n<button onclick={{bump}}>b</button>\n<u>{body}</u>\n"
    );
    compile(
        &src,
        CompileOptions {
            filename: Some("X.svelte".to_string()),
            generate: GenerateMode::Client,
            dev,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// The element is empty in the template and written once, with no text node and
/// no `$.reset`.
fn assert_folds(head: &str, body: &str, expected: &str) {
    for dev in [false, true] {
        let code = compile_client(head, body, dev);
        assert!(
            code.contains("<u></u>`"),
            "expected an empty <u> template for {body} (dev={dev}) in:\n{code}"
        );
        assert!(
            code.contains(&format!("u.textContent = '{expected}';")),
            "expected textContent '{expected}' for {body} (dev={dev}) in:\n{code}"
        );
        assert!(
            !code.contains("$.child(u"),
            "expected no text node for {body} (dev={dev}) in:\n{code}"
        );
    }
}

/// The other direction: a whitespace placeholder, a text node and a reactive
/// write.
fn assert_reactive(head: &str, body: &str) {
    for dev in [false, true] {
        let code = compile_client(head, body, dev);
        assert!(
            code.contains("<u> </u>`"),
            "expected a placeholder <u> for {body} (dev={dev}) in:\n{code}"
        );
        assert!(
            code.contains("$.child(u, true)") && code.contains("$.template_effect("),
            "expected a reactive text node for {body} (dev={dev}) in:\n{code}"
        );
        assert!(
            !code.contains("textContent"),
            "expected no textContent for {body} (dev={dev}) in:\n{code}"
        );
    }
}

/// The defect, both halves: names the client's copy held (so the value folded)
/// and names only the server's did (so it did not).
#[test]
fn a_global_call_initializer_reaches_the_text_content_path() {
    for (init, expected) in [
        ("Math.max(1, k)", "5"),
        ("Math.min(1, k)", "1"),
        ("Math.pow(2, k)", "32"),
        ("String(\"a\")", "a"),
        ("String(k)", "5"),
        ("Number(\"5\")", "5"),
        ("Math.trunc(-1.7)", "-1"),
        ("Math.sign(-3)", "-1"),
        ("Math.cbrt(27)", "3"),
        ("Math.log2(8)", "3"),
        ("Number.isInteger(k)", "true"),
    ] {
        assert_folds(&format!("\tconst v = {init};\n"), "{v}", expected);
    }
}

/// `Math.round` is half-UP in JS and half-away-from-zero in Rust, which only
/// the negative halves can tell apart — the client's copy called
/// `f64::round`, the server's the `(n + 0.5).floor()` upstream means.
#[test]
fn the_rounding_rule_is_the_javascript_one() {
    for (init, expected) in [
        ("Math.round(1.5)", "2"),
        ("Math.round(-0.5)", "0"),
        ("Math.round(-1.5)", "-1"),
        ("Math.round(-2.5)", "-2"),
    ] {
        assert_folds(&format!("\tconst v = {init};\n"), "{v}", expected);
    }
}

/// The initializer is evaluated at a non-zero depth, but the TEMPLATE
/// expression still takes the `has_call` bail — official memoizes the chunk
/// before evaluating it, so the inline form is reactive while the `const` form
/// folds. Without this row the fix reads as "drop the bail".
#[test]
fn the_inline_form_of_the_same_call_stays_memoized() {
    assert_folds("\tconst v = Math.max(1, k);\n", "{v}", "5");
    assert_reactive("", "{Math.max(1, k)}");
}

/// `Math.hypot` is the one `Math.*` name upstream's table omits, so it is the
/// row that says the fix reads a table rather than a `Math.` prefix — the
/// mistake the phase-2 copy made (#3555).
#[test]
fn a_name_outside_the_table_does_not_fold() {
    for init in [
        "Math.hypot(3, 4)",
        "Math.nope(1)",
        "Math.maxx(1)",
        "Number.nope(1)",
        "String.nope(1)",
    ] {
        assert_reactive(&format!("\tconst v = {init};\n"), "{v}");
    }
}

/// A bound name is not the global. The client's copy matched `Math` by name
/// alone, so a local `const Math` folded to the real `Math.max`'s answer.
#[test]
fn a_shadowed_global_is_not_the_global() {
    for (head, init) in [
        ("\tconst Math = { max: () => 9 };\n", "Math.max(1, k)"),
        ("\tconst String = () => \"z\";\n", "String(\"a\")"),
        ("\tfunction Number() { return 7; }\n", "Number(\"5\")"),
    ] {
        assert_reactive(&format!("{head}\tconst v = {init};\n"), "{v}");
    }
}

/// An argument that is genuinely reactive keeps the whole call reactive, which
/// is the row the depth change could have broken: `w` is written, so its read
/// is not known however deep the evaluation starts.
#[test]
fn a_reactive_argument_keeps_the_call_reactive() {
    for init in ["Math.max(1, w)", "String(w)", "Number(w)", "Math.abs(w)"] {
        assert_reactive(&format!("\tconst v = {init};\n"), "{v}");
    }
}

/// The positive control that names the shape: the server has carried the whole
/// table all along, so it folded every row of the first test while the client
/// did not. Two ports of one upstream function, and no gate compares them.
#[test]
fn the_server_already_folded_all_of_these() {
    for (init, expected) in [
        ("Math.max(1, k)", "5"),
        ("String(\"a\")", "a"),
        ("Math.trunc(-1.7)", "-1"),
    ] {
        let src =
            format!("<script>\n\tconst k = 5;\n\tconst v = {init};\n</script>\n<u>{{v}}</u>\n");
        let code = compile(
            &src,
            CompileOptions {
                filename: Some("X.svelte".to_string()),
                generate: GenerateMode::Server,
                ..Default::default()
            },
        )
        .expect("compile")
        .js
        .code;
        assert!(
            code.contains(&format!("<u>{expected}</u>")),
            "for {init} in:\n{code}"
        );
    }
}
