//! Issue #3343: `strip_effects_from_source` decided whether a `$effect.root(…)`
//! stands in statement position by asking whether it starts its own physical
//! line, so `let m = 1; $effect.root(…);` — a statement that shares a line —
//! was lowered as an *expression* and left a `() => {};` behind.
//!
//! Upstream reads it off the AST (an `ExpressionStatement` whose expression is
//! the call is removed; anywhere else becomes the no-op cleanup function). The
//! previous significant code character is what settles it here.

use rsvelte_core::{GenerateMode, ModuleCompileOptions, compile_module};

fn server_module(src: &str) -> String {
    compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("m.svelte.js".into()),
            generate: GenerateMode::Server,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

/// The reported shape, plus the same statement one function deeper.
#[test]
fn a_same_line_effect_root_statement_is_removed() {
    for body in [
        "export function go() { let mark = 1; $effect.root(() => { console.log(base); }); return mark; }",
        "export function go() { function inner() { let mark = 1; $effect.root(() => { console.log(base); }); return mark; } return inner; }",
    ] {
        let out = server_module(&format!("let base = $state(1);\n{body}\n"));
        assert!(!out.contains("COMPILE_ERROR"), "{out}");
        assert!(
            !out.contains("() => {};"),
            "the statement was lowered as an expression:\n{out}"
        );
        assert!(out.contains("let mark = 1;"), "{out}");
    }
}

/// The control the issue names: on its own line both compilers already agreed,
/// and they still must.
#[test]
fn an_own_line_effect_root_statement_is_still_removed() {
    let out = server_module(
        "let base = $state(1);\nexport function go() {\n\t$effect.root(() => { console.log(base); });\n}\n",
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(!out.contains("() => {};"), "{out}");
    assert!(!out.contains("$effect.root"), "{out}");
}

/// Semicolon-free source ends its previous statement by ASI, so the previous
/// significant character is an ordinary token — the line test has to stay as
/// the second sufficient condition or this regresses.
#[test]
fn an_asi_terminated_previous_statement_still_reads_as_a_statement() {
    let out = server_module(
        "let base = $state(1)\nexport function go() {\n\tlet mark = 1\n\t$effect.root(() => { console.log(base) })\n\treturn mark\n}\n",
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        !out.contains("() => {}"),
        "an ASI-terminated statement was read as an expression:\n{out}"
    );
}

/// Over-removal guard: a `$effect.root(…)` that really is an expression keeps
/// its no-op cleanup function.
#[test]
fn an_expression_position_effect_root_keeps_the_noop() {
    for body in [
        "export function go() { const stop = $effect.root(() => { console.log(base); }); return stop; }",
        "export function go() { return $effect.root(() => { console.log(base); }); }",
    ] {
        let out = server_module(&format!("let base = $state(1);\n{body}\n"));
        assert!(!out.contains("COMPILE_ERROR"), "{out}");
        assert!(
            out.contains("() => {}"),
            "an expression-position call lost its no-op:\n{out}"
        );
    }
}
