//! Regression tests for #2495 — the dev `$.tag(...)` wrap of a class state
//! field whose *value* carries a leading comment.
//!
//! esrap cannot keep such a call on one line: a `//` comment would swallow the
//! rest of it, so upstream breaks `$.tag(value, name)` across lines with the
//! comment as the first line inside the call. rsvelte applied the wrap after the
//! comment had already been placed, so the comment stayed before the `$.tag(`.
//!
//! Every expectation below is the byte-exact output of the official compiler
//! (`compileModule(src, { generate: 'client', dev: true })`, Svelte v5.56.8).

use rsvelte_core::compiler::ModuleCompileOptions;
use rsvelte_core::{GenerateMode, compile_module};

fn compile_dev(src: &str) -> String {
    compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("m.svelte.js".to_string()),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// Repro A — public field, comment on the line above it. The public field is
/// lowered to a private backing key, which is why the comment ends up between
/// the `=` and the value in the first place.
#[test]
fn public_field_with_a_comment_above_it_reflows() {
    let out = compile_dev("export class C {\n\t// c\n\tn = $state(0);\n}\n");
    assert!(
        out.contains("\t#n = $.tag(\n\t\t// c\n\t\t$.state(0),\n\t\t'C.n'\n\t);"),
        "in:\n{out}"
    );
}

/// Repro B — private field, comment after the `=`. This shape never reaches the
/// class-field emitter (the rune-field scanner tests a single line, so
/// `#n = // c` matches no `= $state(` pattern), so it is a separate test rather
/// than a second assertion on repro A.
#[test]
fn private_field_with_a_comment_after_the_equals_reflows() {
    let out = compile_dev("export class C {\n\t#n = // c\n\t\t$state(0);\n}\n");
    assert!(
        out.contains("\t#n = $.tag(\n\t\t// c\n\t\t$.state(0),\n\t\t'C.#n'\n\t);"),
        "in:\n{out}"
    );
}

/// The control the two repros need: with no comment the call stays on one line.
/// Without it a fix that reflowed unconditionally would pass both repros.
#[test]
fn a_field_without_a_comment_stays_on_one_line() {
    let out = compile_dev("export class C {\n\tn = $state(0);\n}\n");
    assert!(
        out.contains("\t#n = $.tag($.state(0), 'C.n');"),
        "in:\n{out}"
    );
    assert!(!out.contains("$.tag(\n"), "in:\n{out}");
}

/// A comment above a *private* field is not in the value's leading position —
/// upstream keeps it on its own line and the call on one line. The negative
/// control for "any comment near the field reflows".
#[test]
fn a_comment_above_a_private_field_does_not_reflow() {
    let out = compile_dev("export class C {\n\t// c\n\t#p = $state(0);\n}\n");
    assert!(
        out.contains("\t// c\n\t#p = $.tag($.state(0), 'C.#p');"),
        "in:\n{out}"
    );
}

/// The same reflow applies to a constructor assignment, which reaches a
/// different handler than the class-field one.
#[test]
fn a_this_assignment_with_a_comment_after_the_equals_reflows() {
    let out = compile_dev(
        "export class C {\n\t#n;\n\tconstructor() {\n\t\tthis.#n = // c\n\t\t\t$state(0);\n\t}\n}\n",
    );
    assert!(
        out.contains("\t\tthis.#n = $.tag(\n\t\t\t// c\n\t\t\t$.state(0),\n\t\t\t'C.#n'\n\t\t);"),
        "in:\n{out}"
    );
}

/// `$state.raw` reaches the same emitter through a different branch, and a
/// proxied `$state` object nests `$.proxy(...)` inside the tagged value — both
/// must reflow identically.
#[test]
fn raw_and_proxied_values_reflow_too() {
    let raw = compile_dev("export class C {\n\t// c\n\tn = $state.raw(0);\n}\n");
    assert!(
        raw.contains("\t#n = $.tag(\n\t\t// c\n\t\t$.state(0),\n\t\t'C.n'\n\t);"),
        "in:\n{raw}"
    );

    let proxied = compile_dev("export class C {\n\t// c\n\to = $state({ a: 1 });\n}\n");
    assert!(
        proxied
            .contains("\t#o = $.tag(\n\t\t// c\n\t\t$.state($.proxy({ a: 1 })),\n\t\t'C.o'\n\t);"),
        "in:\n{proxied}"
    );
}

/// Non-dev output has no `$.tag` at all, so the comment stays where it was and
/// nothing reflows — the axis the issue reports as already matching.
#[test]
fn non_dev_output_is_unchanged() {
    let out = compile_module(
        "export class C {\n\t// c\n\tn = $state(0);\n}\n",
        ModuleCompileOptions {
            filename: Some("m.svelte.js".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    assert!(!out.contains("$.tag"), "in:\n{out}");
    assert!(out.contains("// c"), "in:\n{out}");
}
