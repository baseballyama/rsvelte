//! Svelte-4 compiler options that upstream accepts only in order to diagnose
//! them. The oracle for every expectation here is the official compiler run
//! over the same source and options (`validate-options.js`).

use rsvelte_core::compiler::{
    CompileOptions, GenerateMode, ModuleCompileOptions, compile, compile_module,
};

const SOURCE: &str = "<script>let a = 1;</script><p>{a}</p>";

fn codes(options: CompileOptions) -> Vec<String> {
    compile(SOURCE, options)
        .expect("compile should succeed")
        .warnings
        .into_iter()
        .map(|w| w.code)
        .collect()
}

fn base() -> CompileOptions {
    CompileOptions {
        filename: Some("Foo.svelte".to_string()),
        generate: GenerateMode::Client,
        ..Default::default()
    }
}

#[test]
fn enable_sourcemap_is_reported_as_removed() {
    let mut options = base();
    options.legacy_options.enable_sourcemap = true;
    assert_eq!(codes(options), vec!["options_removed_enable_sourcemap"]);
}

#[test]
fn enable_sourcemap_message_matches_upstream() {
    let mut options = base();
    options.legacy_options.enable_sourcemap = true;
    let warnings = compile(SOURCE, options)
        .expect("compile should succeed")
        .warnings;
    assert_eq!(
        warnings[0].message,
        "The `enableSourcemap` option has been removed. Source maps are always generated now, and tooling can choose to ignore them\nhttps://svelte.dev/e/options_removed_enable_sourcemap"
    );
    // Upstream raises these from `validate-options.js` with a `null` node, so
    // they carry no position and no frame.
    assert!(warnings[0].start.is_none());
    assert!(warnings[0].frame.is_none());
}

#[test]
fn hydratable_is_reported_as_removed() {
    let mut options = base();
    options.legacy_options.hydratable = true;
    assert_eq!(codes(options), vec!["options_removed_hydratable"]);
}

#[test]
fn deprecated_options_are_reported_when_present_even_if_false() {
    let mut options = base();
    options.legacy_options.accessors = true;
    options.legacy_options.immutable = true;
    assert_eq!(
        codes(options),
        vec![
            "options_deprecated_accessors",
            "options_deprecated_immutable"
        ]
    );
}

/// Upstream's `deprecate()` fires on the option being **supplied** — `accessors:
/// false` warns too — and exactly once per process. Both facts belong to the
/// entry point that parsed the option (`rsvelte_napi` / `rsvelte_capi` hold the
/// `warn_once` flags), so the behavioural field alone must not re-derive the
/// diagnostic: doing so warned on every compile of a `{ accessors: true }` build
/// (#3380), and no `legacy_options` flag could have suppressed it.
#[test]
fn the_behavioural_field_alone_does_not_report_the_deprecation() {
    let mut options = base();
    options.accessors = true;
    options.immutable = true;
    assert_eq!(codes(options), Vec::<String>::new());
}

#[test]
fn hydratable_message_matches_upstream() {
    let mut options = base();
    options.legacy_options.hydratable = true;
    let warnings = compile(SOURCE, options)
        .expect("compile should succeed")
        .warnings;
    assert_eq!(
        warnings[0].message,
        "The `hydratable` option has been removed. Svelte components are always hydratable now\nhttps://svelte.dev/e/options_removed_hydratable"
    );
}

#[test]
fn loop_guard_timeout_is_reported_as_removed() {
    let mut options = base();
    options.legacy_options.loop_guard_timeout = true;
    assert_eq!(codes(options), vec!["options_removed_loop_guard_timeout"]);
}

#[test]
fn loop_guard_timeout_message_matches_upstream() {
    let mut options = base();
    options.legacy_options.loop_guard_timeout = true;
    let warnings = compile(SOURCE, options)
        .expect("compile should succeed")
        .warnings;
    assert_eq!(
        warnings[0].message,
        "The `loopGuardTimeout` option has been removed\nhttps://svelte.dev/e/options_removed_loop_guard_timeout"
    );
}

#[test]
fn renamed_generate_spelling_is_reported() {
    let mut options = base();
    options.legacy_options.generate_dom_ssr = true;
    let warnings = compile(SOURCE, options)
        .expect("compile should succeed")
        .warnings;
    assert_eq!(
        warnings.iter().map(|w| w.code.as_str()).collect::<Vec<_>>(),
        vec!["options_renamed_ssr_dom"]
    );
    assert_eq!(
        warnings[0].message,
        "`generate: \"dom\"` and `generate: \"ssr\"` options have been renamed to \"client\" and \"server\" respectively\nhttps://svelte.dev/e/options_renamed_ssr_dom"
    );
}

/// `generate` lives in upstream's `common_options`, so `compileModule` reports
/// the renamed spelling as well.
#[test]
fn renamed_generate_spelling_is_reported_for_modules() {
    let options = ModuleCompileOptions {
        filename: Some("Foo.svelte.js".to_string()),
        legacy_options: rsvelte_core::compiler::LegacyOptions {
            generate_dom_ssr: true,
            ..Default::default()
        },
        ..Default::default()
    };
    let codes: Vec<String> = compile_module("export let a = 1;", options)
        .expect("compile_module should succeed")
        .warnings
        .into_iter()
        .map(|w| w.code)
        .collect();
    assert_eq!(codes, vec!["options_renamed_ssr_dom"]);
}

/// Negative control: the component-only removed options are stubbed out by
/// upstream's `validate_module_options`, so a module never reports them.
#[test]
fn removed_component_options_are_not_reported_for_modules() {
    let options = ModuleCompileOptions {
        filename: Some("Foo.svelte.js".to_string()),
        ..Default::default()
    };
    assert!(
        compile_module("export let a = 1;", options)
            .expect("compile_module should succeed")
            .warnings
            .is_empty()
    );
}

/// Upstream walks its validator key table in declaration order, and
/// `loopGuardTimeout` is declared ahead of `enableSourcemap`, which is ahead of
/// `hydratable`.
#[test]
fn removed_options_are_reported_in_upstream_key_order() {
    let mut options = base();
    options.legacy_options.enable_sourcemap = true;
    options.legacy_options.hydratable = true;
    options.legacy_options.loop_guard_timeout = true;
    options.legacy_options.generate_dom_ssr = true;
    assert_eq!(
        codes(options),
        vec![
            "options_renamed_ssr_dom",
            "options_removed_loop_guard_timeout",
            "options_removed_enable_sourcemap",
            "options_removed_hydratable"
        ]
    );
}

/// Negative control: the option is absent, which is the only state the corpus
/// and every other gate ever compiles in — nothing may be reported.
#[test]
fn no_legacy_option_reports_nothing() {
    assert!(codes(base()).is_empty());
}

/// Negative control against over-firing: rsvelte's own internal
/// `enable_sourcemap` switch shares the name but is not the Svelte-4 option.
#[test]
fn internal_enable_sourcemap_switch_is_not_the_removed_option() {
    let mut options = base();
    options.enable_sourcemap = false;
    assert!(codes(options).is_empty());
}
