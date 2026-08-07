//! Svelte-4 compiler options that upstream accepts only in order to diagnose
//! them. The oracle for every expectation here is the official compiler run
//! over the same source and options (`validate-options.js`).

use rsvelte_core::compiler::{CompileOptions, GenerateMode, compile};

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

/// Upstream walks its validator key table in declaration order, and
/// `loopGuardTimeout` is declared ahead of `enableSourcemap`, which is ahead of
/// `hydratable`.
#[test]
fn removed_options_are_reported_in_upstream_key_order() {
    let mut options = base();
    options.legacy_options.enable_sourcemap = true;
    options.legacy_options.hydratable = true;
    options.legacy_options.loop_guard_timeout = true;
    assert_eq!(
        codes(options),
        vec![
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
