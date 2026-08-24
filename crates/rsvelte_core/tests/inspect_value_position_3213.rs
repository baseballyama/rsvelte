//! Issue #3213 item 3: a production-mode `$inspect(…)` in a VALUE position.
//!
//! Upstream returns `b.empty` — an `EmptyStatement` — as the expression, so its
//! output is a bare `;` in an operand slot and no JS parser accepts it (client
//! and server alike). Byte equality is this project's goal, but reproducing
//! output that does not parse is not; rsvelte fills the slot with the value
//! `$inspect` evaluates to. See
//! `upstream_issues/3213-svelte-inspect-in-a-value-position.md`.

use rsvelte_core::{CompileOptions, GenerateMode, ModuleCompileOptions, compile, compile_module};

fn component(src: &str, generate: GenerateMode) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate,
            dev: false,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

fn module(src: &str, generate: GenerateMode) -> String {
    compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("T.svelte.js".into()),
            generate,
            dev: false,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

#[test]
fn an_instance_script_declarator_keeps_its_initializer() {
    let out = component(
        "<script>\n\tlet v = $inspect(1);\n</script>\n<b>{typeof v}</b>\n",
        GenerateMode::Client,
    );
    assert!(out.contains("let v = undefined;"), "{out}");
    assert!(!out.contains("let v = ;"), "{out}");
}

#[test]
fn an_instance_script_argument_slot_keeps_an_operand() {
    let out = component(
        "<script>\n\tconst o = [$inspect(1)];\n</script>\n<b>{o.length}</b>\n",
        GenerateMode::Client,
    );
    assert!(out.contains("const o = [undefined];"), "{out}");
}

/// A statement of its own is unchanged: upstream prints the empty-as-expression
/// plus the statement's own `;`, and rsvelte still matches that byte for byte.
#[test]
fn a_statement_position_inspect_still_prints_two_empties() {
    let out = component(
        "<script>\n\t$inspect(1);\n\tlet a = 1;\n</script>\n<b>{a}</b>\n",
        GenerateMode::Client,
    );
    assert!(out.contains(";;"), "{out}");
    assert!(!out.contains("undefined"), "{out}");
}

/// The module path is shared by both targets, so the declarator survives on the
/// client and the server alike.
#[test]
fn a_module_declarator_keeps_its_initializer_on_both_targets() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let out = module("export const v = $inspect(1);\n", generate);
        assert!(out.contains("export const v = undefined;"), "{out}");
    }
}

#[test]
fn a_module_statement_position_inspect_is_still_removed() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let out = module("$inspect(1);\nexport const a = 1;\n", generate);
        assert!(out.contains("export const a = 1;"), "{out}");
        assert!(!out.contains("$inspect"), "{out}");
        assert!(!out.contains("undefined"), "{out}");
    }
}
