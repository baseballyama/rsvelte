//! Regression pin for the `$effect` rune cluster (issue #462).
//!
//! Most items in this cluster have been addressed by earlier work or do not
//! reproduce under current rsvelte rules. The remaining items (H-123
//! overlapping replacements, M-079 arity, M-080 class-constructor fallback
//! coverage) share the AST-driven `$effect` rewrite the issue itself
//! suggests, deferred to a coordinated change.
//!
//! - **H-121** `$effect.pending(...)` lowering — already merged (PR #523).
//! - **H-122** shadowed local `$effect` — does not reproduce because rsvelte
//!   rejects user variables that start with `$` (the `dollar_prefix_invalid`
//!   diagnostic fires before any rewrite can run).

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            runes: Some(true),
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

fn try_compile(src: &str) -> Result<(), String> {
    match compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
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
            let code = s
                .split("code: \"")
                .nth(1)
                .and_then(|t| t.split('"').next())
                .unwrap_or("")
                .to_string();
            Err(code)
        }
    }
}

#[test]
fn h121_effect_pending_lowers_in_component_scope() {
    let out = client(r#"<script>let p = $effect.pending(); $effect(() => { p; });</script>"#);
    // The lowered call surfaces in some form (the PR-#523 rewrite); pin the
    // helper name so we notice if the lowering name drifts.
    assert!(out.contains("$.pending"), "got:\n{out}");
}

#[test]
fn h122_user_dollar_prefix_var_is_rejected() {
    // rsvelte rejects user variables that start with `$` — so a shadowed local
    // `$effect` never gets emitted in the first place.
    let err = try_compile(r#"<script>function f($effect){ $effect("x"); }</script>"#)
        .expect_err("should error");
    assert_eq!(err, "dollar_prefix_invalid", "got `{err}`");
}

#[test]
fn effect_call_in_component_scope_is_lowered() {
    let out = client(r#"<script>$effect(() => { console.log("x"); });</script>"#);
    assert!(out.contains("$.user_effect"), "got:\n{out}");
}
