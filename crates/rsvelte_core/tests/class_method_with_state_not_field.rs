//! Regression test: a class method whose body contains a rune call (or text
//! shaped like `... = $state(...)`) must not be mis-parsed as a class field
//! by the line-based class-rune scanner (issue #452, H-057).
//!
//! Bug: `parse_state_field` extracted the field name by `trimmed.find('=')` and
//! ran the result through a *sanitiser*. For `class C { m(){ let x = $state(0); return "}"; } }`
//! the first `=` lives inside the method body, so the scanner extracted
//! `m(){ let x` as a name, then emitted a private backing
//! `#m____let_x = $.state(0)` and a quoted accessor — corrupting the whole class.
//! `parse_state_field` now rejects anything that doesn't look like a valid
//! class-field name (plain identifier, quoted, or computed `[expr]`).

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
fn method_body_with_state_call_is_not_a_field() {
    let out = client(r#"<script>class C { m(){ let x = $state(0); return "}"; } }</script>"#);
    // No private backing for the method-name garbage, no quoted accessor.
    assert!(
        !out.contains("#m____let_x"),
        "method body must not become a sanitised field, got:\n{out}"
    );
    assert!(
        !out.contains("\"m(){ let x\""),
        "method body must not become a quoted accessor, got:\n{out}"
    );
    // The method is preserved verbatim (its function-local `$state(0)` is just
    // the legacy `$state` call lowered to `0`, which is the expected behaviour
    // for a non-runes mode function-scope rune call).
    assert!(
        out.contains("class C { m(){"),
        "class body should survive, got:\n{out}"
    );
}

#[test]
fn normal_class_state_field_still_lowers() {
    let out = client(r#"<script>class C { x = $state(0); }</script>"#);
    assert!(out.contains("#x = $.state(0);"), "got:\n{out}");
    assert!(out.contains("get x()"), "got:\n{out}");
    assert!(out.contains("set x(value)"), "got:\n{out}");
}

#[test]
fn h058_paren_in_string_already_lexical() {
    // Pinned: rune-arg paren scan is JS-lexical-aware, so a `)` inside a string
    // does not truncate.
    let out = client(r#"<script>class C { x = $state(")"); }</script>"#);
    assert!(out.contains("$.state(\")\")"), "got:\n{out}");
}

#[test]
fn h059_new_class_with_args_does_not_double_parenthesise() {
    // Pinned: `new class { … }(args)` keeps `(args)`, not `()`.
    let out = client(
        r#"<script>let x = new class { v = $state(0); constructor(a, b){} }(1, 2);</script>"#,
    );
    assert!(
        out.contains("})(1, 2)"),
        "user's original args must be preserved, got:\n{out}"
    );
    assert!(
        !out.contains("})()(1, 2)"),
        "must not double-parenthesise, got:\n{out}"
    );
}
