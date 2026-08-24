//! A `$`-prefixed name in a slot that only BINDS or LABELS it is not a rune use
//! (#3238).
//!
//! The runes-mode detector and the store-subscription collector read one set of
//! `$name` occurrences, so a slot the collector mis-reads changes the compiler's
//! MODE, not just one expression. `$state:` as a statement label and
//! `catch ($state)` both declare rather than read, and counting them turned a
//! working Svelte 4 component into `legacy_export_invalid`.
//!
//! The flag is the cheap half. The expensive half is that the same file has to
//! still compile — which is why every row here carries `export let`, a `$:`
//! statement and a template read, i.e. things that only work in legacy mode.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn server(src: &str) -> Result<String, String> {
    compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Server,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .map_err(|e| format!("{e:?}"))
}

fn client(src: &str) -> Result<String, String> {
    compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .map_err(|e| format!("{e:?}"))
}

/// Each of these is a `$`-name that binds or labels. None is a rune use, and
/// official compiles every one of them in legacy mode.
const BINDING_SLOTS: &[&str] = &[
    "$state: for (;;) { break $state; }",
    "$derived: for (;;) { break $derived; }",
    "$effect: for (;;) { continue $effect; }",
    "$props: while (0) { break $props; }",
    "try { n = 1; } catch ($state) { n = 2; }",
    "try { n = 1; } catch ($derived) { n = 2; }",
    "try { n = 1; } catch ($effect) { n = 2; }",
    // The catch parameter shadows for its own block, so a read inside it is the
    // parameter and not a store.
    "try { n = 1; } catch ($state) { n = $state ? 1 : 2; }",
];

fn legacy_component(body: &str) -> String {
    format!(
        "<script>\n\texport let p = 1;\n\tlet n = 0;\n\t$: doubled = n * 2;\n\tfunction f() {{\n\t\t{body}\n\t}}\n</script>\n\n<div>{{p}} {{doubled}} {{f}}</div>\n"
    )
}

/// The loud half: a legacy component must not become a compile error.
#[test]
fn a_binding_slot_does_not_turn_a_legacy_component_into_an_error() {
    for body in BINDING_SLOTS {
        let src = legacy_component(body);
        let err = match server(&src) {
            Ok(_) => continue,
            Err(err) => err,
        };
        panic!("{body:?} must not stop a legacy component compiling; got: {err}");
    }
}

/// The quiet half, and the one an "it compiles" test cannot see: the component
/// has to be in LEGACY mode, not merely accepted. Upstream marks that with the
/// `svelte/internal/flags/legacy` import on the client.
#[test]
fn a_binding_slot_does_not_flip_the_mode() {
    let baseline_src = legacy_component("n = 1;");
    let baseline = client(&baseline_src).expect("the control compiles");
    assert!(
        baseline.contains("svelte/internal/flags/legacy"),
        "the control must itself be in legacy mode, or this test measures nothing:\n{baseline}"
    );

    for body in BINDING_SLOTS {
        let code = client(&legacy_component(body)).expect("compiles");
        assert!(
            code.contains("svelte/internal/flags/legacy"),
            "{body:?} must stay in legacy mode; got:\n{code}"
        );
    }
}

/// The other direction. A real rune use still reaches the detector, and a
/// `$store` read next to the same names is still a subscription — an exclusion
/// that swallowed either of those would pass both tests above.
#[test]
fn a_real_rune_and_a_real_store_are_still_seen() {
    let runes = "<script>\n\tlet n = $state(0);\n</script>\n\n<div>{n}</div>\n";
    let code = client(runes).expect("compiles");
    assert!(
        !code.contains("svelte/internal/flags/legacy"),
        "an actual rune must still select runes mode:\n{code}"
    );

    let store = "<script>\n\timport { writable } from 'svelte/store';\n\tconst state = writable(0);\n\tfunction f() {\n\t\t$state: for (;;) { break $state; }\n\t}\n</script>\n\n<div>{$state} {f}</div>\n";
    let code = server(store).expect("compiles");
    assert!(
        code.contains("store_get"),
        "a template `$state` read next to a `$state:` label is still a subscription:\n{code}"
    );
}

/// The same two slots decide STORE subscriptions, from a different scan —
/// `2_analyze/store_subscriptions.rs` reads characters where the mode detector
/// reads the AST. Both had the same gap, and only measuring the emitted
/// `store_get` calls separates them: a mode test cannot see a wrong
/// subscription and a subscription test cannot see a wrong mode.
#[test]
fn a_binding_slot_is_not_a_store_subscription_either() {
    let head = "<script>\n\timport { writable } from 'svelte/store';\n\tconst count = writable(0);\n\tlet n = 0;\n";

    // The catch parameter shadows the store for its own block.
    let shadowed = format!(
        "{head}\tfunction f() {{ try {{ n = 1; }} catch ($count) {{ n = $count; }} }}\n</script>\n\n<div>{{n}} {{f}}</div>\n"
    );
    let code = server(&shadowed).expect("compiles");
    assert!(
        !code.contains("store_get"),
        "a catch parameter shadows the store inside its block:\n{code}"
    );

    // Positive control on the same file: outside the block it is still a store.
    let outside = format!(
        "{head}\tfunction f() {{ try {{ n = 1; }} catch ($count) {{ n = 2; }} }}\n</script>\n\n<div>{{$count}} {{n}} {{f}}</div>\n"
    );
    let code = server(&outside).expect("compiles");
    assert!(
        code.contains("store_get"),
        "the same name outside the catch block is still a subscription:\n{code}"
    );

    // A label and its `break` target name no binding at all.
    let labelled = format!(
        "{head}\tfunction f() {{ $count: for (;;) {{ break $count; }} }}\n</script>\n\n<div>{{n}} {{f}}</div>\n"
    );
    let code = server(&labelled).expect("compiles");
    assert!(
        !code.contains("store_get"),
        "a label is not a store read:\n{code}"
    );
}
