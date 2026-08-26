//! Regression tests for #3597 — a local binding that shadows a rune's name.
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
//! Scope construction is deliberately legacy-neutral while runes mode is being
//! auto-detected. Store-subscription names are then excluded from the reference
//! set that decides the mode, and the later VariableDeclarator visitor assigns
//! rune binding kinds only if the component actually entered runes mode. This
//! mirrors upstream's ordering and avoids the kind -> mode -> kind cycle.
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

/// A rune-shaped call whose unprefixed name is locally bound is a store
/// subscription. In particular, its initializer must not make the component a
/// runes component before the synthetic `$name` binding can be excluded from
/// mode detection. Declaration order is intentionally adversarial: upstream's
/// completed scope sees declarations that occur after the call too.
#[test]
fn conflicted_rune_initializers_do_not_enable_runes_mode() {
    for (case, rune, store, init, warning) in [
        ("$state", "$state", "state", "$state(1)", true),
        ("$state.raw", "$state", "state", "$state.raw(1)", false),
        ("$derived", "$derived", "derived", "$derived(1)", true),
        (
            "$derived.by",
            "$derived",
            "derived",
            "$derived.by(() => 1)",
            false,
        ),
    ] {
        for declaration in ["const", "let"] {
            let src = format!(
                "<script>\n\tlet v = {init};\n\t{declaration} {store} = {{ x: 1 }};\n</script>\n\n<b>{{typeof v}}{{typeof {store}}}</b>\n"
            );

            let (client, warnings) = compile_it(&src, GenerateMode::Client);
            assert!(
                client.contains("import 'svelte/internal/flags/legacy';"),
                "for {case}/{declaration}\nin:\n{client}"
            );
            assert!(
                client.contains(&format!("store_get({store}, '{rune}'")),
                "for {case}/{declaration}\nin:\n{client}"
            );
            let expected_warnings = if warning {
                vec!["store_rune_conflict"]
            } else {
                Vec::new()
            };
            assert_eq!(
                warnings.iter().map(|w| w.code.as_str()).collect::<Vec<_>>(),
                expected_warnings,
                "for {case}/{declaration}"
            );

            let (server, _) = compile_it(&src, GenerateMode::Server);
            assert!(
                server.contains(&format!(
                    "store_get($$store_subs ??= {{}}, '{rune}', {store})"
                )),
                "for {case}/{declaration}\nin:\n{server}"
            );
        }
    }
}

/// Upstream warns when the rune-shaped reference's immediate parent is a call,
/// including when the reference is a direct argument rather than the callee.
/// Wrappers around the reference change that parent and must remain quiet.
#[test]
fn conflict_warning_uses_the_immediate_call_parent() {
    for (expression, warning) in [
        ("consume($state)", true),
        ("consume(0, $state)", true),
        ("consume(!$state)", false),
        ("consume([$state])", false),
        ("consume({ value: $state })", false),
        ("consume($state.value)", false),
        ("consume($state?.value)", false),
        ("$state.raw(1)", false),
    ] {
        let src = format!(
            "<script>\n\tconst state = {{ subscribe() {{}} }};\n\tconst consume = (...args) => args;\n\t{expression};\n</script>\n"
        );
        let (_, warnings) = compile_it(&src, GenerateMode::Client);
        let expected = if warning {
            vec!["store_rune_conflict"]
        } else {
            Vec::new()
        };
        assert_eq!(
            warnings.iter().map(|w| w.code.as_str()).collect::<Vec<_>>(),
            expected,
            "for {expression}"
        );
    }
}

/// A module rune can also contribute synthetic store metadata for an instance
/// reference. The module binding must nevertheless keep its rune kind: that is
/// what makes `$state` proxy-only while making the `$derived` getter reactive.
/// This is the discriminating shape from upstream's `inspect-derived-2` fixture.
#[test]
fn module_state_keeps_module_proxy_lowering() {
    let src = "<script module>\n\tconst data = $state({ list: [] });\n\tconst derived = $derived(data.list.filter(() => true));\n\tconst state = { data, get derived() { return derived } };\n</script>\n<script>\n\tdata.list.length = 0;\n\t$inspect(state);\n</script>\n";
    let (client, warnings) = compile_it(src, GenerateMode::Client);

    assert!(
        client.contains("const data = $.proxy({"),
        "module state should use proxy lowering:\n{client}"
    );
    assert!(
        !client.contains("const data = $.state("),
        "module state must not become an instance state source:\n{client}"
    );
    assert!(
        client.contains("const derived = $.derived(() => data.list.filter(() => true));"),
        "module derived must retain its reactive source:\n{client}"
    );
    assert!(
        client.contains("return $.get(derived);"),
        "the module getter must read the derived value:\n{client}"
    );
    assert!(
        client.contains("store_get(state, '$state'"),
        "the synthetic store metadata must remain:\n{client}"
    );
    assert_eq!(
        warnings.iter().map(|w| w.code.as_str()).collect::<Vec<_>>(),
        ["store_rune_conflict"]
    );
}

/// Excluding one conflicted rune name must not hide a different, unresolved
/// rune reference. This is the positive control for the set-difference step.
#[test]
fn another_rune_reference_still_enables_runes_mode() {
    let src = "<script>\n\tlet v = $state(1);\n\tconst state = { x: 1 };\n\tlet d = $derived(v);\n</script>\n\n<b>{typeof v}{typeof d}</b>\n";
    let (client, warnings) = compile_it(src, GenerateMode::Client);

    assert!(
        !client.contains("import 'svelte/internal/flags/legacy';"),
        "in:\n{client}"
    );
    assert!(
        client.contains("store_get(state, '$state'"),
        "in:\n{client}"
    );
    assert!(client.contains("$.derived"), "in:\n{client}");
    assert_eq!(
        warnings.iter().map(|w| w.code.as_str()).collect::<Vec<_>>(),
        ["store_rune_conflict"]
    );

    // Template-function declarators are absent from the later script visitor.
    // Their initializer metadata must therefore be promoted after the same set
    // difference, including when a different rune name is a store subscription.
    let src = "<script>\n\tlet v = $state(1);\n\tconst state = { x: 1 };\n</script>\n\n<b onclick={() => { let d = $derived(v); v = d; }}>{typeof v}</b>\n";
    let (client, warnings) = compile_it(src, GenerateMode::Client);
    assert!(
        client.contains("store_get(state, '$state'"),
        "in:\n{client}"
    );
    assert!(client.contains("let d = $.derived("), "in:\n{client}");
    assert!(client.contains("$.get(d)"), "in:\n{client}");
    assert_eq!(
        warnings.iter().map(|w| w.code.as_str()).collect::<Vec<_>>(),
        [
            "store_rune_conflict",
            "a11y_click_events_have_key_events",
            "a11y_no_static_element_interactions",
            "non_reactive_update"
        ]
    );
}
