//! Regression tests for #3611 (and the module half of #3561's family): a
//! `.svelte.(js|ts)` module's `$inspect(…)` was handled by a raw text loop that
//! assumed the call WAS the statement.
//!
//! Upstream replaces the *expression* with `b.empty`, which esrap prints as
//! `;`. So the call's slot survives at every depth: a statement becomes `;;`,
//! `const t = $inspect(a)` becomes `const t = ;;`, and `[$inspect(a)]` becomes
//! `[;]`. rsvelte deleted the leading whitespace, the call, a trailing `;` and
//! the newline — which for anything but a statement spliced the FOLLOWING
//! statement onto the assignment. The result was text no JS parser accepts, so
//! the module printer fell back to raw source and everything after the splice
//! came out untransformed too.
//!
//! The second half is the server: `transform_server_module` runs the shared
//! module transform with `dev: false` unconditionally, so the dev lowering
//! (`console.log('$inspect(', args, ')')`, `(fn)('init', args)`) never ran for
//! a module and the logging the rune exists for was silently dropped.
//!
//! `$effect` / `$effect.pre` / `$effect.root` are the controls: they are removed
//! outright, leaving NO `;`, in every mode.
//!
//! Every expectation below is the byte-exact output of the official compiler
//! (Svelte v5.56.9).

use rsvelte_core::{GenerateMode, ModuleCompileOptions, compile_module};

fn compile_mod(body: &str, generate: GenerateMode, dev: bool) -> String {
    let src = format!(
        "let a = $state(1);\nlet d = $derived(a * 2);\n{body}\nexport const z = 1;\nexport function use() {{ return a + d; }}\n"
    );
    compile_module(
        &src,
        ModuleCompileOptions {
            filename: Some("m.svelte.js".to_string()),
            generate,
            dev,
            ..Default::default()
        },
    )
    .expect("compile_module")
    .js
    .code
}

/// The defect: the next statement was spliced onto the declarator, and with it
/// the rest of the module stopped being transformed at all.
#[test]
fn a_declarator_initializer_keeps_the_hole_and_the_next_statement() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let code = compile_mod("const t = $inspect(a);", generate, false);
        assert!(code.contains("const t = ;;"), "in:\n{code}");
        assert!(code.contains("export const z = 1;"), "in:\n{code}");
        // The tail is still transformed — the fallback used to emit it verbatim.
        assert!(!code.contains("return a + d;"), "in:\n{code}");
    }
}

/// Every operand slot upstream's expression replacement reaches.
#[test]
fn the_hole_survives_in_every_operand_slot() {
    for (body, expected) in [
        ("$inspect(a);", ";;"),
        ("const o = [$inspect(a)];", "const o = [;];"),
        ("const o = { k: $inspect(a) };", "const o = { k: ; };"),
        ("const b = 1 + $inspect(a);", "const b = 1 + ;;"),
        ("const c = a ? $inspect(a) : 0;", "const c = a ? ; : 0;"),
        ("function f() {\n\t$inspect(a);\n}", "\t;;"),
        ("class C {\n\tm() {\n\t\t$inspect(a);\n\t}\n}", "\t\t;;"),
    ] {
        for generate in [GenerateMode::Client, GenerateMode::Server] {
            let code = compile_mod(body, generate, false);
            assert!(code.contains(expected), "for {body:?} in:\n{code}");
        }
    }
}

/// The control for the hole: an `$effect` is removed with NO `;` left behind, so
/// a fix reading "keep a placeholder for every removed rune" fails here.
#[test]
fn an_effect_leaves_no_hole() {
    for body in [
        "$effect(() => a);",
        "$effect.pre(() => a);",
        "function f() {\n\t$effect(() => a);\n}",
    ] {
        for generate in [GenerateMode::Client, GenerateMode::Server] {
            let code = compile_mod(body, generate, false);
            assert!(!code.contains(";;"), "for {body:?} in:\n{code}");
        }
    }
}

/// The server half: dev lowers the call instead of dropping it, at every depth
/// and in every slot.
#[test]
fn the_server_lowers_a_module_inspect_in_dev() {
    for (body, expected) in [
        ("$inspect(a);", "console.log('$inspect(', a, ')');"),
        (
            "$inspect(a, a + 1);",
            "console.log('$inspect(', a, a + 1, ')');",
        ),
        (
            "const o = [$inspect(a)];",
            "const o = [console.log('$inspect(', a, ')')];",
        ),
        (
            "function f() {\n\t$inspect(a);\n}",
            "\tconsole.log('$inspect(', a, ')');",
        ),
        (
            "class C {\n\tm() {\n\t\t$inspect(a);\n\t}\n}",
            "\t\tconsole.log('$inspect(', a, ')');",
        ),
        ("$inspect(a).with(console.log);", "console.log('init', a);"),
    ] {
        let code = compile_mod(body, GenerateMode::Server, true);
        assert!(code.contains(expected), "for {body:?} in:\n{code}");
    }
}

/// A derived argument is read through its call, the same as any other server
/// read — the lowering happens before the read rewriting, not after it.
#[test]
fn a_derived_argument_is_read_in_the_lowered_call() {
    let code = compile_mod("$inspect(d);", GenerateMode::Server, true);
    assert!(
        code.contains("console.log('$inspect(', d(), ')');"),
        "in:\n{code}"
    );
}

/// The needle inside a string literal is not the rune. `find_code` already
/// skipped it; this pins that the new lowering does too.
#[test]
fn a_needle_in_a_string_is_not_the_rune() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        for dev in [false, true] {
            let code = compile_mod("export const s = \"$inspect(a)\";", generate, dev);
            assert!(
                code.contains("export const s = \"$inspect(a)\";"),
                "({generate:?} dev={dev}) in:\n{code}"
            );
        }
    }
}

/// `$effect.tracking()` / `$effect.pending()` keep their server lowerings — the
/// new dev pass runs on the same text and must not disturb them.
#[test]
fn the_other_server_rune_lowerings_are_unchanged() {
    let code = compile_mod(
        "export const tr = $effect.tracking();\nexport const pe = $effect.pending();",
        GenerateMode::Server,
        true,
    );
    assert!(code.contains("export const tr = false;"), "in:\n{code}");
    // `void 0` rather than `0`: a module has no renderer to read pending from.
    assert!(code.contains("export const pe = void 0;"), "in:\n{code}");
}
