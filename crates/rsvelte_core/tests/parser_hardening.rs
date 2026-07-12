//! Parser hardening regressions: malformed / adversarial input must not panic
//! or spin forever, and must surface the same error the official Svelte
//! compiler raises.
//!
//! - `strip_type_annotation` sliced a declaration-tag pattern by character
//!   index instead of byte index, so a multi-byte identifier before the type
//!   colon (`{const café: T = e}`) panicked on a non-char-boundary slice.
//! - The `<style>` CSS parser had no progress guard, so an empty selector
//!   (`<style>{}</style>`) looped forever instead of raising
//!   `css_expected_identifier` like the official parser.
//! - A CSS type selector starting with a non-alphanumeric code point >= 160
//!   (`<style>× {}</style>`) read an empty identifier and spun forever; the
//!   official `read_identifier` treats every code point >= 160 as a valid
//!   identifier character, so `×` is a valid type-selector name.

use rsvelte_core::{CompileOptions, GenerateMode, ParseOptions, compile, parse};

fn compile_result(src: &str) -> Result<(), String> {
    match compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    ) {
        Ok(_) => Ok(()),
        Err(e) => {
            let s = format!("{e:?}");
            let code = s
                .split("code: \"")
                .nth(1)
                .and_then(|t| t.split('"').next())
                .unwrap_or(&s)
                .to_string();
            Err(code)
        }
    }
}

#[test]
fn declaration_tag_multibyte_type_annotation_does_not_panic() {
    // Reaches `strip_type_annotation` with a multi-byte char (`é`, 2 bytes)
    // sitting before the top-level type colon. A char-index slice would land
    // mid-`é` and panic; a byte-index slice must succeed.
    let root = parse(
        "{#if true}{@const café: T = e}{/if}",
        ParseOptions::default(),
    );
    assert!(
        root.is_ok(),
        "multi-byte @const type annotation panicked/failed"
    );
}

#[test]
fn empty_style_selector_reports_css_expected_identifier() {
    // Official Svelte raises `css_expected_identifier` at the `{`; rsvelte used
    // to loop forever on the empty selector.
    assert_eq!(
        compile_result("<style>{}</style>"),
        Err("css_expected_identifier".to_string()),
    );
}

#[test]
fn high_codepoint_type_selector_parses() {
    // `×` (U+00D7, code point 215 >= 160) is a valid CSS type-selector name.
    // rsvelte used to spin forever reading an empty identifier here.
    let root = parse("<style>× {}</style>", ParseOptions::default())
        .expect("high-codepoint type selector failed to parse");
    let css = serde_json::to_string(&root.css).expect("serialize css");
    assert!(
        css.contains("\"TypeSelector\"") && css.contains('×'),
        "expected a `×` TypeSelector, got: {css}"
    );
}
