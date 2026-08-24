//! Regression tests for the `$props` half of #3597 — a local binding that
//! shadows a rune's name.
//!
//! Upstream keys the decision off ONE binding: `instance.scope.get(store_name)`
//! and `get_rune(that binding's own initial)`. rsvelte instead scanned the whole
//! instance script for the text `$props(`, so any component that destructures
//! props at all — i.e. nearly all of them — declared `$props` a rune no matter
//! what the `props` binding it actually looked up was initialised with. A
//! `const props = { x: 1 }` beside a `let { v } = $props()` therefore compiled
//! as a rune where official makes it a store subscription and warns.
//!
//! The scan existed because `Prop` binding kinds are assigned by a visitor that
//! runs after this pass; `init_rune` is now set on destructured bindings too, so
//! the per-binding test is available at the point it is needed.
//!
//! The rest of #3597 is open: for the other runes the store subscription IS
//! created and the remaining divergence is that `analysis.runes` stays true,
//! which is a different decision (upstream deletes the name from
//! `module.scope.references` and re-reads that set).
//!
//! Every expectation below is the byte-exact output of the official compiler
//! (Svelte v5.56.9).

use rsvelte_core::{CompileOptions, GenerateMode, Warning, compile};

fn compile_it(src: &str, generate: GenerateMode) -> (String, Vec<Warning>) {
    let r = compile(
        src,
        CompileOptions {
            filename: Some("X.svelte".to_string()),
            generate,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile");
    (r.js.code, r.warnings)
}

fn component(decl: &str) -> String {
    format!(
        "<script>\n\tlet {{ v = 1 }} = $props();\n\t{decl}\n</script>\n\n<b>{{typeof v}}{{typeof props}}</b>\n"
    )
}

/// `const props` / `let props` beside a `$props()` destructuring: official makes
/// `$props` a store subscription, warns, and compiles the component in legacy
/// mode.
#[test]
fn a_local_props_binding_makes_the_rune_a_store_subscription() {
    for decl in ["const props = { x: 1 };", "let props = { x: 1 };"] {
        let src = component(decl);

        let (client, warnings) = compile_it(&src, GenerateMode::Client);
        assert!(
            client.contains("import 'svelte/internal/flags/legacy';"),
            "for {decl}\nin:\n{client}"
        );
        assert!(
            client.contains("const $props = () => $.store_get(props, '$props', $$stores);"),
            "for {decl}\nin:\n{client}"
        );
        assert!(
            client.contains("let { v = 1 } = $props()();"),
            "for {decl}\nin:\n{client}"
        );
        assert_eq!(
            warnings.iter().map(|w| w.code.as_str()).collect::<Vec<_>>(),
            ["store_rune_conflict"],
            "for {decl}"
        );

        let (server, _) = compile_it(&src, GenerateMode::Server);
        assert!(
            server.contains("$.store_get($$store_subs ??= {}, '$props', props)"),
            "for {decl}\nin:\n{server}"
        );
    }
}

/// The control that the removed source scan was protecting: with no shadowing
/// binding, `$props` is the rune and nothing is subscribed. The destructured
/// `props` NAME is the discriminating one — its binding now carries
/// `init_rune = "$props"`, which is what keeps it a rune.
#[test]
fn a_props_destructuring_is_still_a_rune() {
    for src in [
        "<script>\n\tlet { v = 1 } = $props();\n</script>\n\n<b>{typeof v}</b>\n",
        "<script>\n\tlet { props = 1 } = $props();\n</script>\n\n<b>{typeof props}</b>\n",
        "<script>\n\tlet { v = 1, ...props } = $props();\n</script>\n\n<b>{typeof v}{typeof props}</b>\n",
    ] {
        let (client, warnings) = compile_it(src, GenerateMode::Client);
        assert!(!client.contains("store_get"), "for {src}\nin:\n{client}");
        assert!(
            !client.contains("import 'svelte/internal/flags/legacy';"),
            "for {src}\nin:\n{client}"
        );
        assert!(warnings.is_empty(), "for {src}: {warnings:?}");
    }
}

/// The opposite direction of the same rule: `let state = $props()` names a prop
/// `state`, so `$state` IS a store subscription even though the initializer is a
/// rune. `store_name != "props"` is the clause that decides it.
#[test]
fn a_prop_named_after_another_rune_is_still_a_store_subscription() {
    let (client, warnings) = compile_it(
        "<script>\n\tlet { state = 1 } = $props();\n\tlet v = $state(1);\n</script>\n\n<b>{typeof v}{typeof state}</b>\n",
        GenerateMode::Client,
    );
    assert!(client.contains("store_get"), "in:\n{client}");
    assert_eq!(
        warnings.iter().map(|w| w.code.as_str()).collect::<Vec<_>>(),
        ["store_rune_conflict"]
    );
}
