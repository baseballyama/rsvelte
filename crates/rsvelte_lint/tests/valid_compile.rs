//! Behavioural tests for `svelte/valid-compile` that the upstream-fixture oracle
//! (which always runs the rule at `error`) doesn't cover: it being off by
//! default, the `ignoreWarnings` option, and the `<style global>` filter.

use std::path::PathBuf;

use rsvelte_core::CompileOptions;
use rsvelte_lint::{LintConfig, Severity, lint_source};

fn lint(src: &str, cfg: &LintConfig) -> Vec<(String, String)> {
    lint_source(
        src,
        &PathBuf::from("Test.svelte"),
        &CompileOptions::default(),
        cfg,
    )
    .into_iter()
    .filter_map(|d| Some((d.code?, d.message)))
    .collect()
}

const IMG: &str = "<script>\n\tlet src = 'x.gif';\n</script>\n\n<img {src} />";

#[test]
fn off_by_default_emits_no_valid_compile_findings() {
    // Recommended preset: the a11y warning is surfaced by the validator wrap
    // under its own code, but `svelte/valid-compile` itself stays silent.
    let codes = lint(IMG, &LintConfig::recommended());
    assert!(
        codes.iter().all(|(c, _)| c != "svelte/valid-compile"),
        "valid-compile should be off by default, got {codes:?}"
    );
    assert!(
        codes.iter().any(|(c, _)| c == "a11y_missing_attribute"),
        "validator wrap should still surface the a11y warning"
    );
}

#[test]
fn enabled_surfaces_warning_with_code_suffix() {
    let cfg = LintConfig::empty().with_override("svelte/valid-compile", Severity::Error);
    let found: Vec<_> = lint(IMG, &cfg)
        .into_iter()
        .filter(|(c, _)| c == "svelte/valid-compile")
        .collect();
    assert_eq!(
        found,
        vec![(
            "svelte/valid-compile".to_string(),
            "`<img>` element should have an alt attribute\nhttps://svelte.dev/e/a11y_missing_attribute(a11y_missing_attribute)".to_string()
        )]
    );
}

#[test]
fn ignore_warnings_suppresses_everything() {
    let cfg = LintConfig::from_json_str(
        r#"{ "extends": ["none"], "rules": {
            "svelte/valid-compile": ["error", { "ignoreWarnings": true }]
        } }"#,
    )
    .unwrap();
    let found: Vec<_> = lint(IMG, &cfg)
        .into_iter()
        .filter(|(c, _)| c == "svelte/valid-compile")
        .collect();
    assert!(
        found.is_empty(),
        "ignoreWarnings should suppress all, got {found:?}"
    );
}

#[test]
fn global_style_suppresses_unused_selector() {
    // `<style global>` → `css_unused_selector` is filtered (isGlobalStyleNode);
    // a plain `<style>` with an unused selector still reports.
    let cfg = LintConfig::empty().with_override("svelte/valid-compile", Severity::Error);

    let global = "<div></div>\n<style global>\n\t.unused { color: red; }\n</style>";
    let found_global: Vec<_> = lint(global, &cfg)
        .into_iter()
        .filter(|(c, _)| c == "svelte/valid-compile")
        .collect();
    assert!(
        found_global.is_empty(),
        "global style unused selector should be ignored, got {found_global:?}"
    );

    let scoped = "<div></div>\n<style>\n\t.unused { color: red; }\n</style>";
    let found_scoped: Vec<_> = lint(scoped, &cfg)
        .into_iter()
        .filter(|(c, _)| c == "svelte/valid-compile")
        .collect();
    assert!(
        found_scoped
            .iter()
            .any(|(_, m)| m.contains("css_unused_selector")),
        "scoped unused selector should report, got {found_scoped:?}"
    );

    // `<style lang=global>` is NOT a global style — `global` is an attribute
    // *value* here, not the `global` attribute name; still reported.
    let lang_global = "<div></div>\n<style lang=global>\n\t.unused { color: red; }\n</style>";
    let found_lang_global: Vec<_> = lint(lang_global, &cfg)
        .into_iter()
        .filter(|(c, _)| c == "svelte/valid-compile")
        .collect();
    assert!(
        found_lang_global
            .iter()
            .any(|(_, m)| m.contains("css_unused_selector")),
        "lang=global is not a global style, got {found_lang_global:?}"
    );
}
