//! Upstream parses with acorn, which builds no `ParenthesizedExpression` at all,
//! so `let v = ($state(1))` reaches `get_rune` as the bare call and the parens
//! never survive into esrap's output. rsvelte's declarator lowerings matched the
//! `CallExpression` directly, so a single `(` left the rune unlowered and the
//! rune name reached the generated module, where nothing declares it (#3248).
//!
//! The bad output PARSES, so only output equality can see this class.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_to(src: &str, generate: GenerateMode) -> String {
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

/// Every declaration whose initializer is a rune call, wrapped in parentheses.
const WRAPPED: &[(&str, &str)] = &[
    ("state", "let v = ($state(1));"),
    ("state spaced", "let v = ( $state(1) );"),
    ("state doubled", "let v = (($state(1)));"),
    ("state newline", "let v = (\n\t\t$state(1)\n\t);"),
    ("state raw", "let v = ($state.raw([1]));"),
    ("derived", "let v = ($derived(base * 2));"),
    ("derived by", "let v = ($derived.by(() => base * 2));"),
    ("state destructured", "let { v } = ($state({ v: 1 }));"),
    (
        "derived destructured",
        "let { v } = ($derived({ v: base }));",
    ),
];

fn component(decl: &str) -> String {
    format!("<script>\n\tlet base = $state(1);\n\t{decl}\n</script>\n<div>{{base}}{{v}}</div>\n")
}

#[test]
fn a_parenthesised_rune_initializer_is_lowered() {
    for (name, decl) in WRAPPED {
        for generate in [GenerateMode::Client, GenerateMode::Server] {
            let out = compile_to(&component(decl), generate);
            assert!(!out.contains("COMPILE_ERROR"), "{name}: {out}");
            for rune in ["$state(", "$state.raw(", "$derived(", "$derived.by("] {
                assert!(
                    !out.contains(rune),
                    "{name} ({generate:?}) leaked {rune} into the output: {out}"
                );
            }
        }
    }
}

/// `$props()` goes through a different declarator handler, and its shared text
/// helper matches `= $props()`, so the parens have to be gone by the time it runs.
#[test]
fn a_parenthesised_props_declaration_is_lowered() {
    let src = "<script>\n\tlet { a } = ($props());\n</script>\n<div>{a}</div>\n";
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let out = compile_to(src, generate);
        assert!(!out.contains("COMPILE_ERROR"), "{out}");
        assert!(!out.contains("$props()"), "{generate:?}: {out}");
    }
}

/// The server removes a top-level `$effect(…)` statement; the parens must not
/// hide the call from that removal either.
#[test]
fn a_parenthesised_effect_statement_is_removed_on_the_server() {
    let out = compile_to(
        "<script>\n\tlet base = $state(1);\n\t($effect(() => { void base; }));\n</script>\n<div>{base}</div>\n",
        GenerateMode::Server,
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(!out.contains("$effect("), "{out}");
}

/// The parens are the only thing that changes: each wrapped spelling must
/// produce exactly the output its unwrapped twin does.
#[test]
fn parens_do_not_change_the_generated_output() {
    const PAIRS: &[(&str, &str)] = &[
        ("let v = ($state(1));", "let v = $state(1);"),
        ("let v = ( $state(1) );", "let v = $state(1);"),
        ("let v = (($state(1)));", "let v = $state(1);"),
        ("let v = ($state.raw([1]));", "let v = $state.raw([1]);"),
        (
            "let v = ($derived(base * 2));",
            "let v = $derived(base * 2);",
        ),
        (
            "let v = ($derived.by(() => base * 2));",
            "let v = $derived.by(() => base * 2);",
        ),
        (
            "let { v } = ($state({ v: 1 }));",
            "let { v } = $state({ v: 1 });",
        ),
    ];
    for (wrapped, bare) in PAIRS {
        for generate in [GenerateMode::Client, GenerateMode::Server] {
            assert_eq!(
                compile_to(&component(wrapped), generate),
                compile_to(&component(bare), generate),
                "`{wrapped}` ({generate:?}) diverges from `{bare}`"
            );
        }
    }
}
