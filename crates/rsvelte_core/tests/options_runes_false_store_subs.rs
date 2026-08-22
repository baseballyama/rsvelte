//! Upstream's store-subscription loop opens with `runes_option === false ||`
//! (`2-analyze/index.js`), so under an explicit legacy mode — from the compile
//! option or from `<svelte:options runes={false} />`, which `compile()` merges
//! into the options before analysing — every `$rune` reference is a store
//! subscription and the synthetic binding is declared whether or not the
//! unprefixed name resolves. rsvelte was passing `options.runes` alone and
//! rejecting `let a = $state(1)` with `rune_invalid_usage`.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_with(src: &str, generate: GenerateMode, runes: Option<bool>) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate,
            dev: false,
            runes,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

const RUNE_NAMED: &str = "<svelte:options runes={false} />\n<script>\n\tlet a = $state(1);\n\tlet v = $derived.by(() => a + 1);\n</script>\n\n{v}\n";

#[test]
fn svelte_options_runes_false_makes_a_rune_name_a_store_subscription() {
    let out = compile_with(RUNE_NAMED, GenerateMode::Client, None);
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("const $state = () => $.store_get(state, '$state', $$stores);"),
        "{out}"
    );
    assert!(out.contains("let a = $state()(1);"), "{out}");
    assert!(out.contains("let v = $derived().by(() => a + 1);"), "{out}");
    // A store-subscribed `$state` never declares state, so nothing is promoted.
    assert!(!out.contains("$.mutable_source"), "{out}");
}

#[test]
fn the_compile_option_alone_reaches_the_same_branch() {
    let src = "<script>\n\tlet a = $state(1);\n</script>\n\n{a}\n";
    let out = compile_with(src, GenerateMode::Client, Some(false));
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("let a = $state()(1);"), "{out}");
}

/// The negative control: with runes left to auto-detection the same source is
/// a rune declaration, so the fix cannot be a blanket "never a rune".
/// `a` has to be reassigned — upstream folds a never-reassigned `$state(1)`
/// away, so a read-only source emits `let a = 1` and asserts nothing here.
#[test]
fn without_the_option_a_rune_is_still_a_rune() {
    let src = "<script>\n\tlet a = $state(1);\n\tfunction f() { a++; }\n</script>\n\n<button onclick={f}>{a}</button>\n";
    let out = compile_with(src, GenerateMode::Client, None);
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("let a = $.state(1);"), "{out}");
    assert!(!out.contains("store_get"), "{out}");
}

/// Upstream declares the synthetic binding at the end of the block regardless of
/// whether the unprefixed name resolves, so an undeclared `$foo` is a store in
/// legacy mode and `global_reference_invalid` outside it.
#[test]
fn an_undeclared_dollar_name_is_a_store_in_legacy_mode() {
    let legacy = "<svelte:options runes={false} />\n<p>{$foo}</p>\n";
    let out = compile_with(legacy, GenerateMode::Client, None);
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("const $foo = () => $.store_get(foo, '$foo', $$stores);"),
        "{out}"
    );

    let runic = "<p>{$foo}</p>\n";
    assert!(
        compile_with(runic, GenerateMode::Client, None).contains("global_reference_invalid"),
        "an undeclared `$foo` must still be rejected outside legacy mode"
    );
}

/// The server's `ExpressionStatement` removal and the client's `$inspect` strip
/// are name checks; upstream's `get_rune` returns null once the name resolves to
/// a binding, so a store-subscribed `$effect` / `$inspect` call must survive.
#[test]
fn rune_named_store_calls_are_not_removed() {
    let src = "<svelte:options runes={false} />\n<script>\n\tlet a = $state(1);\n\t$effect(() => { console.log(a); });\n\t$inspect(a);\n</script>\n<p>{a}</p>\n";

    let server = compile_with(src, GenerateMode::Server, None);
    assert!(!server.contains("COMPILE_ERROR"), "{server}");
    assert!(
        server.contains("$.store_get($$store_subs ??= {}, '$effect', effect)(() => {"),
        "{server}"
    );

    let client = compile_with(src, GenerateMode::Client, None);
    assert!(!client.contains("COMPILE_ERROR"), "{client}");
    assert!(client.contains("$effect()(() => {"), "{client}");
    assert!(client.contains("$inspect()(a);"), "{client}");
}
