//! Runes-mode auto-detection reads upstream's `module.scope.references`, which
//! holds only names a reference could not resolve. A slot that merely BINDS a
//! rune-spelled name — a statement label, a `catch` parameter, a block-scoped
//! `const` — never enters it, and a reference that resolves to such a binding
//! never reaches the module scope either.
//!
//! rsvelte counted identifier spellings instead, so one `$state:` label inside a
//! function body compiled a Svelte 4 component in runes mode and rejected its
//! `export let` (#3238) — and, in runes mode, `validate_identifier_name` then
//! rejected the very declaration that caused the flip (#3237).

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

/// A Svelte 4 component: `export let` + a legacy reactive statement. Compiling
/// it in runes mode is a hard error, so the mode is observable from the outside.
fn legacy_probe(body: &str) -> String {
    format!(
        "<script>\n\texport let p = 1;\n\tlet n = 0;\n\t$: doubled = n * 2;\n\t{body}\n</script>\n<div>{{p}} {{doubled}}</div>\n"
    )
}

const BINDING_SLOTS: &[(&str, &str)] = &[
    (
        "label",
        "function f() { $state: for (;;) { break $state; } }",
    ),
    (
        "label continue",
        "function f() { $derived: for (;;) { continue $derived; } }",
    ),
    (
        "catch parameter",
        "function f() { try {} catch ($state) { return $state; } }",
    ),
    (
        "block const",
        "function f() { const $props = 1; return $props; }",
    ),
    (
        "block let read before write",
        "function f() { let $effect = 1; $effect += 1; return $effect; }",
    ),
    (
        "nested function declaration",
        "function f() { function $inspect() { return 1; } return $inspect(); }",
    ),
    (
        "nested class declaration",
        "function f() { class $bindable {} return new $bindable(); }",
    ),
    (
        "destructured local",
        "function f() { const { $state, $derived: $host } = window; return [$state, $host]; }",
    ),
    (
        "for-loop binding",
        "function f() { for (const $state of []) { void $state; } }",
    ),
    (
        "switch-case binding",
        "function f(x) { switch (x) { case 1: { const $props = 1; return $props; } } }",
    ),
];

#[test]
fn a_rune_spelled_binding_leaves_a_legacy_component_in_legacy_mode() {
    for (name, body) in BINDING_SLOTS {
        let src = legacy_probe(body);
        for generate in [GenerateMode::Client, GenerateMode::Server] {
            let out = compile_to(&src, generate);
            assert!(
                !out.contains("COMPILE_ERROR"),
                "{name} ({generate:?}) was rejected: {out}"
            );
        }
        assert!(
            compile_to(&src, GenerateMode::Client).contains("svelte/internal/flags/legacy"),
            "{name} flipped the component into runes mode"
        );
    }
}

/// The negative control: an unresolved rune reference in the same slot still
/// turns runes mode on, so the test above cannot pass by never detecting a rune.
#[test]
fn an_unresolved_rune_reference_still_turns_runes_mode_on() {
    let out = compile_to(
        "<script>\n\tlet n = $state(0);\n</script>\n<div>{n}</div>\n",
        GenerateMode::Client,
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        !out.contains("svelte/internal/flags/legacy"),
        "a real rune call must still be detected: {out}"
    );
}

/// A default value, a computed key and an initializer inside a binding slot are
/// expressions, so a rune call there is still a rune reference.
#[test]
fn expressions_inside_a_binding_slot_are_still_references() {
    for body in [
        "function f($p = $state(0)) { return $p; }",
        "function f() { const { [$state(0)]: v } = {}; return v; }",
        "function f() { const v = $state(0); return v; }",
    ] {
        let out = compile_to(&legacy_probe(body), GenerateMode::Client);
        assert!(
            out.contains("COMPILE_ERROR") || !out.contains("svelte/internal/flags/legacy"),
            "a rune call in an expression slot did not turn runes mode on: {body}"
        );
    }
}

/// #3237: in legacy mode `validate_identifier_name` never runs, so a nested
/// `const $derived` compiles. It was rejected only because the same declaration
/// had flipped the component into runes mode.
#[test]
fn a_nested_rune_spelled_const_compiles_in_legacy_mode() {
    let src = "<script>\n\tfunction f() {\n\t\tconst $derived = (v) => v;\n\t\treturn $derived(1);\n\t}\n</script>\n<div>x</div>\n";
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let out = compile_to(src, generate);
        assert!(!out.contains("COMPILE_ERROR"), "{out}");
        assert!(
            out.contains("const $derived = (v) => v"),
            "the local binding was lowered as the rune: {out}"
        );
    }
}

/// The other direction of the same check: a top-level `$`-prefixed binding is
/// still rejected, in either mode, because upstream's `Scope.declare` validates
/// every declaration at function depth 0 or 1.
#[test]
fn a_top_level_rune_spelled_const_is_still_rejected() {
    let out = compile_to(
        "<script>\n\tconst $derived = (v) => v;\n\tconst y = $derived(1);\n</script>\n<div>{y}</div>\n",
        GenerateMode::Client,
    );
    assert!(out.contains("dollar_prefix_invalid"), "{out}");
}
