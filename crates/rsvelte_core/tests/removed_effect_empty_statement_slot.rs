//! Upstream's server `ExpressionStatement` visitor returns `b.empty` for a
//! statement-position `$effect` / `$effect.pre` / `$effect.root` /
//! `$inspect.trace`, and esrap drops an `EmptyStatement` **only** from a `body`
//! sequence — `Program`, `BlockStatement`, `ClassBody`, `StaticBlock`,
//! `TSModuleBlock`. Every other statement slot prints it: a switch case
//! consequent (`SwitchStatement` visits `block.consequent` directly), and the
//! unbraced body of `if` / `else` / `while` / `do` / `for` or of a label.
//!
//! rsvelte deleted the statement in every slot, so `case 'post': $effect(…);
//! break;` lost the `;`. The corpus output gate cannot see it — oxfmt drops a
//! lone empty statement from both sides — which is why it surfaced only as a
//! mutation-ratchet entry.
//!
//! Both directions are asserted in one file: an assertion that only checks the
//! `;` is satisfied by emitting one everywhere, which would break every block.

use rsvelte_core::{CompileOptions, GenerateMode, ModuleCompileOptions, compile, compile_module};

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

#[test]
fn a_removed_effect_prints_its_semicolon_outside_a_body_sequence() {
    for (label, src, needle) in [
        (
            "switch case",
            "export function f(flush) {\n\tswitch (flush) {\n\t\tcase 'post':\n\t\t\t$effect(() => {});\n\t\t\tbreak;\n\t}\n}\n",
            "\t\t\t;",
        ),
        (
            "unbraced while",
            "export function f(a) {\n\twhile (a) $effect(() => {});\n}\n",
            "while (a) ;",
        ),
        (
            "labelled statement",
            "export function f() {\n\tlab: $effect.pre(() => {});\n}\n",
            "lab: ;",
        ),
    ] {
        let out = server_module(src);
        assert!(!out.contains("COMPILE_ERROR"), "{label}: {out}");
        assert!(
            out.contains(needle),
            "{label}: expected {needle:?} to survive the removal:\n{out}"
        );
    }
}

#[test]
fn a_removed_effect_leaves_no_semicolon_inside_a_body_sequence() {
    for (label, src) in [
        (
            "block body",
            "export function f() {\n\t$effect(() => {});\n\tconsole.log(1);\n}\n",
        ),
        ("program body", "$effect(() => {});\nexport const a = 1;\n"),
        (
            "switch case block",
            "export function f(a) {\n\tswitch (a) {\n\t\tcase 1: {\n\t\t\t$effect(() => {});\n\t\t\tbreak;\n\t\t}\n\t}\n}\n",
        ),
    ] {
        let out = server_module(src);
        assert!(!out.contains("COMPILE_ERROR"), "{label}: {out}");
        // The header comment and the `svelte/internal/server` import are the only
        // `;`-free lines we do not own, so test the removed statement's own line.
        assert!(
            !out.lines().any(|l| l.trim() == ";"),
            "{label}: a body sequence elides the empty statement:\n{out}"
        );
    }
}

/// The component instance script reaches the removal through a different port —
/// `server/ast/script.rs`'s `visit_statements`, not the module text rewrite — so
/// the module assertions above say nothing about it.
#[test]
fn a_component_switch_case_keeps_the_semicolon_too() {
    let source = "<script>\n\
                  \tlet count = 0;\n\
                  \tfunction schedule(flush) {\n\
                  \t\tswitch (flush) {\n\
                  \t\t\tcase 'post':\n\
                  \t\t\t\t$effect(() => {\n\
                  \t\t\t\t\tcount;\n\
                  \t\t\t\t});\n\
                  \t\t\t\tbreak;\n\
                  \t\t}\n\
                  \t}\n\
                  \tschedule('post');\n\
                  </script>\n\n\
                  <p>{count}</p>\n";

    let code = compile(
        source,
        CompileOptions {
            generate: GenerateMode::Server,
            ..Default::default()
        },
    )
    .expect("compiles")
    .js
    .code;

    assert!(
        code.lines().any(|l| l.trim() == ";"),
        "the switch case lost its empty statement:\n{code}"
    );
    // The instance body itself is a body sequence and must stay `;`-free there:
    // `schedule('post');` is the statement that follows the removed one.
    assert!(
        code.contains("schedule('post');"),
        "expected the surviving call:\n{code}"
    );
}
