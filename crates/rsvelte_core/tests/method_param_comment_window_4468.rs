//! A comment between a parameter list's `)` and the body belongs inside the
//! window esrap runs the parameter sequence over, so it is flushed between the
//! parens. Upstream reaches every bodied function through one expression;
//! rsvelte routed methods through the paren-ending default and dropped the
//! comment. Expected strings are the official compiler's own output.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn emit(script: &str, generate: GenerateMode) -> String {
    let source = format!(
        "<script>\n\t{}\n</script>\n\n<p>x</p>\n",
        script.replace('\n', "\n\t")
    );
    compile(
        &source,
        CompileOptions {
            generate,
            ..Default::default()
        },
    )
    .expect("compile failed")
    .js
    .code
}

#[track_caller]
fn both_targets(script: &str, client: &str, server: &str) {
    for (generate, needle) in [
        (GenerateMode::Client, client),
        (GenerateMode::Server, server),
    ] {
        let code = emit(script, generate);
        assert!(
            code.contains(needle),
            "expected\n  {needle:?}\nin {generate:?} output:\n{code}"
        );
    }
}

#[test]
fn a_class_method_keeps_a_comment_before_its_body() {
    both_targets(
        "class C { m() /*W*/ { return 1; } }\nexport const a = new C();",
        "\t\tm(/*W*/) {",
        "\t\t\tm(/*W*/) {",
    );
}

#[test]
fn a_class_getter_keeps_a_comment_before_its_body() {
    both_targets(
        "class C { get p() /*W*/ { return 1; } }\nexport const a = new C();",
        "\t\tget p(/*W*/) {",
        "\t\t\tget p(/*W*/) {",
    );
}

#[test]
fn a_class_setter_keeps_a_comment_before_its_body() {
    both_targets(
        "class C { set p(v) /*W*/ { globalThis.x = v; } }\nexport const a = new C();",
        "\t\tset p(v /*W*/) {",
        "\t\t\tset p(v /*W*/) {",
    );
}

#[test]
fn an_object_literal_method_keeps_a_comment_before_its_body() {
    both_targets(
        "const o = { m() /*W*/ { return 1; } };\nexport const a = o;",
        "\t\tm(/*W*/) {",
        "\t\tm(/*W*/) {",
    );
}

/// The host that already agreed with upstream. It shares the window expression
/// with the three above after this fix, so it would go red on a regression that
/// changed the expression rather than the routing.
#[test]
fn a_function_declaration_still_keeps_it() {
    both_targets(
        "function f() /*W*/ { return 1; }\nexport const a = f;",
        "\tfunction f(/*W*/) {",
        "\tfunction f(/*W*/) {",
    );
}

/// The near-miss slot, one position to the left. It is what separates "the
/// window starts at the `)`" from "the window starts after the last parameter";
/// a fix that widened the window by starting it earlier passes every test above
/// and changes this one, because a parameter would then be separated from its
/// own trailing comment.
#[test]
fn a_comment_inside_the_parens_is_unmoved() {
    both_targets(
        "class C { m(v /*W*/) { globalThis.x = v; } }\nexport const a = new C();",
        "\t\tm(v /*W*/) {",
        "\t\t\tm(v /*W*/) {",
    );
}
