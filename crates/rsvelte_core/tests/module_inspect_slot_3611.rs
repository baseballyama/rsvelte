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
//! The two halves are matched separately, because only one of them can be.
//! Measured over the eight slots below × 2 targets with an acorn oracle: in the
//! three **statement** slots both compilers print `;;` and both parse, and
//! rsvelte matches official byte for byte. In the five **value** slots official
//! produces text no JS parser accepts — 10 of 10 cells — so there is nothing to
//! match; rsvelte fills the slot with `undefined`, the value `$inspect` returns
//! (`upstream_issues/3213-svelte-inspect-in-a-value-position.md`). That
//! deviation is deliberate and is asserted here so it cannot drift silently.
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
fn a_declarator_initializer_keeps_its_slot_and_the_next_statement() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let code = compile_mod("const t = $inspect(a);", generate, false);
        assert!(code.contains("const t = undefined;"), "in:\n{code}");
        assert!(code.contains("export const z = 1;"), "in:\n{code}");
        // The tail is still transformed — the fallback used to emit it verbatim.
        assert!(!code.contains("return a + d;"), "in:\n{code}");
    }
}

/// A statement slot is matched byte for byte; a value slot is where official's
/// own output does not parse, so it is filled instead. Both are asserted from
/// one table so neither can be changed without the other being read.
#[test]
fn the_slot_survives_wherever_the_call_stood() {
    for (body, expected) in [
        ("$inspect(a);", ";;"),
        ("function f() {\n\t$inspect(a);\n}", "\t;;"),
        ("class C {\n\tm() {\n\t\t$inspect(a);\n\t}\n}", "\t\t;;"),
        ("const t = $inspect(a);", "const t = undefined;"),
        ("const o = [$inspect(a)];", "const o = [undefined];"),
        (
            "const o = { k: $inspect(a) };",
            "const o = { k: undefined };",
        ),
        ("const b = 1 + $inspect(a);", "const b = 1 + undefined;"),
        (
            "const c = a ? $inspect(a) : 0;",
            "const c = a ? undefined : 0;",
        ),
    ] {
        for generate in [GenerateMode::Client, GenerateMode::Server] {
            let code = compile_mod(body, generate, false);
            assert!(code.contains(expected), "for {body:?} in:\n{code}");
            // The sentinel is internal; every printer path must expand it.
            assert!(
                !code.contains("$$inspect_empty"),
                "for {body:?} in:\n{code}"
            );
        }
    }
}

/// The hole must survive a `compileModule` re-parse, which drops an
/// `EmptyStatement` — so it travels as a sentinel and is expanded when printed.
/// Five holes in one module is the discriminating count: the sentinel carries no
/// `;` of its own, and without one the *next* call's position test reads the
/// identifier before it as an operand slot and fills that hole with `undefined`.
#[test]
fn consecutive_holes_all_survive_the_module_reprint() {
    let body = "$inspect(a);\n$inspect(a, a + 1);\n$inspect(a).with(console.log);\nfunction f() {\n\t$inspect(a);\n}\nclass C {\n\tm() {\n\t\t$inspect(d);\n\t}\n}";
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let code = compile_mod(body, generate, false);
        let holes = code.lines().filter(|l| l.trim() == ";;").count();
        assert_eq!(holes, 5, "({generate:?}) in:\n{code}");
        assert!(!code.contains("undefined"), "({generate:?}) in:\n{code}");
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

/// The sentinel is expanded only by the `compileModule` printer, and a
/// component's `<script module>` goes through the SAME shared transform while
/// being printed by the component pipeline — which emits this text as written.
/// The first version of this fix left `$$inspect_empty;` in 12 cells of real
/// output, so the sentinel is `compileModule`-only and the component path writes
/// the `;;` directly. (The server still leaks the rune itself in a value slot,
/// from either script kind; that predates this test and is tracked as #3726.)
#[test]
fn a_component_script_module_never_sees_the_placeholder() {
    let src = "<script module>\n\tlet a = $state(1);\n\t$inspect(a);\n\tconst t = $inspect(a);\n\texport const z = 1;\n</script>\n<b>ok</b>\n";
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        for dev in [false, true] {
            let code = rsvelte_core::compile(
                src,
                rsvelte_core::CompileOptions {
                    filename: Some("X.svelte".to_string()),
                    generate,
                    dev,
                    ..Default::default()
                },
            )
            .expect("compile")
            .js
            .code;
            assert!(
                !code.contains("$$inspect_empty"),
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
