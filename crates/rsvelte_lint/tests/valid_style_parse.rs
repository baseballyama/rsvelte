//! Behavioural tests for `svelte/valid-style-parse` (unknown-lang detection).

use std::path::PathBuf;

use rsvelte_core::CompileOptions;
use rsvelte_lint::{LintConfig, Severity, lint_source};

fn findings(src: &str, cfg: &LintConfig) -> Vec<(u32, u32, String)> {
    lint_source(
        src,
        &PathBuf::from("Test.svelte"),
        &CompileOptions::default(),
        cfg,
    )
    .into_iter()
    .filter(|d| d.code.as_deref() == Some("svelte/valid-style-parse"))
    .filter_map(|d| {
        let r = d.range?;
        Some((r.start.line, r.start.column + 1, d.message))
    })
    .collect()
}

#[test]
fn reports_unsupported_lang() {
    // An unsupported `lang` is reported at the `<style>` tag, even though the
    // body is not valid CSS (so the main parse would otherwise abort).
    let src = "<script>\n\tlet x = 1;\n</script>\n\n<div>{x}</div>\n\n<style lang=\"invalid-lang\">\n\tclass .div-class/35\n</style>";
    assert_eq!(
        findings(src, &LintConfig::recommended()),
        vec![(
            7,
            1,
            "Found unsupported style element language \"invalid-lang\"".to_string()
        )]
    );
}

#[test]
fn known_langs_and_plain_css_are_ok() {
    for src in [
        "<div></div>",                                     // no style
        "<style>\n\t.a { color: red; }\n</style>",         // plain CSS
        "<style lang=\"scss\">\n\t.a { .b {} }\n</style>", // SCSS (known)
        "<style lang=\"less\">\n\t.a {}\n</style>",        // LESS (known)
    ] {
        assert!(
            findings(src, &LintConfig::recommended()).is_empty(),
            "expected no finding for {src:?}"
        );
    }
}

#[test]
fn respects_off() {
    let cfg = LintConfig::recommended().with_override("svelte/valid-style-parse", Severity::Off);
    let src = "<style lang=\"nope\">\n\tx\n</style>";
    assert!(findings(src, &cfg).is_empty());
}
