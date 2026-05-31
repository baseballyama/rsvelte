//! Regression test: malformed block / directive head expressions must surface a
//! parse error instead of being silently swallowed (issue #445, H-002).
//!
//! Bug: control-flow block heads (`{#if}`, `{#each}`, `{#key}`, `{@html}`) and
//! directive value expressions routed their JS through `parse_js_expression`,
//! whose `unwrap_or_else` returned an empty identifier on failure — so
//! `{#if a b c}` compiled to broken output rather than erroring. Upstream Svelte
//! parses one expression and then `eat(close, true)`: trailing tokens after a
//! complete expression surface as `expected_token`, an incomplete expression as
//! `js_parse_error`.

use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn try_compile(src: &str) -> Result<(), (String, usize, usize)> {
    match compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            runes: Some(true),
            ..Default::default()
        },
    ) {
        Ok(_) => Ok(()),
        Err(e) => {
            let s = format!("{e:?}");
            // Extract the svelte error code from the Debug repr.
            let code = s
                .split("code: \"")
                .nth(1)
                .and_then(|t| t.split('"').next())
                .unwrap_or("")
                .to_string();
            Err((code, 0, 0))
        }
    }
}

#[track_caller]
fn assert_expected_token(src: &str) {
    match try_compile(src) {
        Ok(()) => panic!("expected a parse error for {src:?}, but it compiled"),
        Err((code, _, _)) => assert_eq!(
            code, "expected_token",
            "for {src:?} expected `expected_token`, got `{code}`"
        ),
    }
}

#[track_caller]
fn assert_compiles(src: &str) {
    if let Err((code, _, _)) = try_compile(src) {
        panic!("expected {src:?} to compile, got error `{code}`");
    }
}

#[test]
fn block_heads_reject_trailing_tokens() {
    assert_expected_token(r#"{#if a b c}x{/if}"#);
    assert_expected_token(r#"{#if x}a{:else if a b c}b{/if}"#);
    assert_expected_token(r#"{#each a b c as x}y{/each}"#);
    assert_expected_token(r#"{#each items as item (a b)}x{/each}"#);
    assert_expected_token(r#"{#key a b c}x{/key}"#);
    assert_expected_token(r#"{@html a b c}"#);
}

#[test]
fn block_heads_report_js_parse_error_for_incomplete() {
    // An incomplete expression (no trailing token) is a `js_parse_error`, not
    // `expected_token`.
    match try_compile(r#"{#if a +}x{/if}"#) {
        Ok(()) => panic!("expected a parse error"),
        Err((code, _, _)) => assert_eq!(code, "js_parse_error"),
    }
}

#[test]
fn directive_heads_reject_trailing_tokens() {
    assert_expected_token(r#"<input bind:value={a b c}>"#);
    assert_expected_token(r#"<div use:foo={a b c}>x</div>"#);
    assert_expected_token(r#"<div class:x={a b c}>y</div>"#);
    assert_expected_token(r#"<div transition:fade={a b c}>y</div>"#);
    assert_expected_token(r#"<div {...a b c}>x</div>"#);
}

#[test]
fn valid_heads_still_compile() {
    assert_compiles(r#"{#if a && b}x{/if}"#);
    assert_compiles(r#"{#each items as x}y{/each}"#);
    assert_compiles(r#"{#each items as item (item.id)}x{/each}"#);
    assert_compiles(r#"{#key a}x{/key}"#);
    assert_compiles(r#"{@html foo}"#);
    assert_compiles(r#"<div {...obj}>x</div>"#);
}

#[test]
fn script_raw_attributes_are_not_interpolated() {
    // `<script>` attributes (generics/lang/...) are raw strings — a `{...}`
    // inside must NOT be parsed as an expression interpolation.
    assert_compiles(r#"<script generics="T extends { yes: boolean }">let x=1</script>{x}"#);
}
