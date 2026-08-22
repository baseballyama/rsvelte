//! Regression tests for #3577 — a comment between `=` and `$derived(` left the
//! declarator out of the server module's derived set, so its READS were not
//! called.
//!
//! `post_process_for_server` decides which `$.get(x)` becomes `x()` from a set
//! collected by scanning the lowered text for `$.derived(` and walking LEFT to
//! a `let|const|var <name> =` shape. The walk skipped whitespace only, so a
//! comment sitting anywhere in that shape — after the `=`, before it, after the
//! keyword, or before the identifier in a comma list — made the walk fail and
//! the name never entered the set.
//!
//! What makes it silent is the shape of the miss: a name that is not in the
//! derived set is treated as **state**, whose read is the bare identifier. So
//! the declaration lowers correctly, the output parses, and the template
//! interpolates the derived thunk — printing `function () { … }` at runtime.
//!
//! `client` matches on every cell, and `$state` is unaffected in both, because
//! only the server treats a derived as callable. The comment ranges now come
//! from one forward pass (`js_scan::comment_ranges`): a backwards scan cannot
//! tell a real `*/` from one inside a string.
//!
//! Every expectation below is the byte-exact output of the official compiler
//! (Svelte v5.56.9).

use rsvelte_core::compiler::ModuleCompileOptions;
use rsvelte_core::{GenerateMode, compile_module};

fn module(src: &str, generate: GenerateMode) -> String {
    compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("m.svelte.js".to_string()),
            generate,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// The read line, for a module declaring `v` with `decl`.
fn read_line(decl: &str, generate: GenerateMode) -> String {
    let src = format!(
        "let a = $state(1);\n{decl}\n\nexport function read() {{\n\treturn `${{v}}`;\n}}\n"
    );
    let code = module(&src, generate);
    code.lines()
        .find(|l| l.trim_start().starts_with("return `"))
        .unwrap_or_else(|| panic!("no read in:\n{code}"))
        .trim()
        .to_string()
}

/// Wherever the comment sits in the declarator, the read is a call.
#[test]
fn a_comment_in_the_declarator_does_not_hide_the_derived() {
    for comment in [
        "/* k */",
        "// k\n\t",
        "/* a */ /* b */",
        "/**/",
        "/* $derived( */",
    ] {
        for decl in [
            format!("const v = {comment} $derived(a + 9);"),
            format!("const v {comment} = $derived(a + 9);"),
            format!("const {comment} v = $derived(a + 9);"),
            format!("const w = 1, v = {comment} $derived(a + 9);"),
            format!("let v = {comment} $derived.by(() => a + 9);"),
        ] {
            assert_eq!(
                read_line(&decl, GenerateMode::Server),
                "return `${v()}`;",
                "for {decl}"
            );
        }
    }
}

/// The control the fix must not disturb: no comment at all, and a plain
/// newline separator — which never broke, because the walk already skipped
/// whitespace.
#[test]
fn the_comment_free_declarators_are_unchanged() {
    for decl in [
        "const v = $derived(a + 9);",
        "const v =\n\t$derived(a + 9);",
        "const v\t\t= $derived(a + 9);",
        "var v = $derived(a + 9);",
    ] {
        assert_eq!(
            read_line(decl, GenerateMode::Server),
            "return `${v()}`;",
            "for {decl}"
        );
    }
}

/// The other direction: a `$state` read is the bare name whatever the comment,
/// so the fix cannot be "call everything". This is the row that shares the
/// wrong answer with the defect — an unrecognised derived was emitted exactly
/// like state, which is why nothing downstream looked broken.
#[test]
fn a_state_read_stays_bare() {
    for comment in ["", "/* k */", "// k\n\t"] {
        assert_eq!(
            read_line(
                &format!("const v = {comment} $state(9);"),
                GenerateMode::Server
            ),
            "return `${v}`;",
            "for {comment}"
        );
    }
}

/// The client never calls a derived read, comment or not — the positive
/// control that says this is a server-side decision rather than a difference in
/// how the declarator is parsed.
#[test]
fn the_client_is_unaffected() {
    for comment in ["", "/* k */", "// k\n\t"] {
        assert_eq!(
            read_line(
                &format!("const v = {comment} $derived(a + 9);"),
                GenerateMode::Client
            ),
            "return `${$.get(v)}`;",
            "for {comment}"
        );
    }
}
