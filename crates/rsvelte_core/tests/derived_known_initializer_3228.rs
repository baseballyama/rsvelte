//! Issue #3228 (= #3213 item 2): a `$derived` whose argument is a compile-time
//! known value is not reactive, so the element gets `textContent` once and no
//! text node — upstream's `Identifier` visitor gates `has_state` on
//! `!scope.evaluate(node).is_known`.
//!
//! `Binding::initial` carries two encodings — the initializer node's JSON, or
//! the literal's own source text when the initializer IS a literal — and the
//! literal form is the one that used to read as "not known".

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(decl: &str) -> String {
    compile(
        &format!("<script>\n\t{decl}\n</script>\n<b>{{rd}}</b>\n"),
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

/// A known derived: no `template_effect`, and the template carries no text node.
fn assert_static(decl: &str) {
    let out = client(decl);
    assert!(
        out.contains("b.textContent = $.get(rd);"),
        "{decl} should fold to textContent: {out}"
    );
    assert!(!out.contains("template_effect"), "{decl}: {out}");
    assert!(out.contains("$.from_html(`<b></b>`)"), "{decl}: {out}");
}

/// An unknown derived keeps its text node and its effect.
fn assert_reactive(decl: &str) {
    let out = client(decl);
    assert!(out.contains("template_effect"), "{decl}: {out}");
    assert!(out.contains("$.from_html(`<b> </b>`)"), "{decl}: {out}");
}

#[test]
fn a_derived_over_a_literal_is_not_reactive() {
    assert_static("let rd = $derived(1);");
    assert_static("let rd = $derived('a');");
    assert_static("let rd = $derived(true);");
    assert_static("let rd = $derived(null);");
    assert_static("let rd = $derived(undefined);");
    assert_static("let rd = $derived(1n);");
    assert_static("let rd = $derived(`x`);");
}

/// `$derived.by(() => <expr>)` evaluates the arrow's expression body, matching
/// upstream's `case '$derived.by'` in `scope.evaluate`.
#[test]
fn a_derived_by_over_a_literal_expression_body_is_not_reactive() {
    assert_static("let rd = $derived.by(() => 1);");
}

/// The rows that already agreed, kept so the fix cannot flip them.
#[test]
fn a_derived_over_a_known_identifier_is_still_not_reactive() {
    assert_static("const K = 1;\n\tlet rd = $derived(K);");
    assert_static("let n = $state(1);\n\tlet rd = $derived(n * 2);");
}

/// A value upstream evaluates to `UNKNOWN` stays reactive: an object/array
/// literal has no `Evaluation` arm, and a block-bodied `$derived.by` is
/// explicitly unknown.
#[test]
fn an_unknown_derived_stays_reactive() {
    assert_reactive("let rd = $derived([]);");
    assert_reactive("let rd = $derived({});");
    assert_reactive("let rd = $derived.by(() => { return 1; });");
}
