//! Regression pin for the `svelte-ignore` scope cluster (issue #463).
//!
//! - **H-118** direct `analysis.warnings.push(...)` calls bypassing the
//!   ignore stack — already merged (PR #524) which routes them through
//!   `emit_warning(...)`.
//! - **M-058 / M-077** legacy `module-script-reactive-declaration` mapping —
//!   won't-fix per the prior triage (matches upstream).
//! - **H-117** HTML `svelte-ignore` before `<script>`, **H-119** script
//!   `svelte-ignore` dropping `legacy_code` / `unknown_code`, **H-120**
//!   stale HTML comments suppressing unrelated CSS warnings, **M-059**
//!   invalid `svelte-ignore` diagnostics dropped when next is text, and
//!   **M-078** `<svelte:self>` ignore lists not persisted — all live on the
//!   same warning-suppression path. The H-120 "stale comment suppresses
//!   unrelated CSS warnings" symptom does not reproduce against the current
//!   `pending_leading_comments` plumbing. The others would each need
//!   targeted scope-tracking changes; deferred.

use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn warnings(src: &str) -> Vec<String> {
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
    .warnings
    .iter()
    .map(|w| w.code.clone())
    .collect()
}

#[test]
fn h120_stale_ignore_does_not_suppress_unrelated_a11y_warning() {
    // `<!-- svelte-ignore css_unused_selector -->` then an unrelated a11y
    // problem must still emit the a11y warning.
    let w = warnings(
        r#"<!-- svelte-ignore css_unused_selector --><p>ok</p><div role="invalid_role">x</div><style>.unused{color:red}</style>"#,
    );
    assert!(w.contains(&"a11y_unknown_role".to_string()), "got: {w:?}");
}

#[test]
fn ignore_suppresses_targeted_a11y_warning() {
    // Inline `<!-- svelte-ignore a11y_unknown_role -->` suppresses the next
    // node's matching warning (the H-118 plumbing).
    let w = warnings(r#"<!-- svelte-ignore a11y_unknown_role --><div role="invalid_role">x</div>"#);
    assert!(!w.contains(&"a11y_unknown_role".to_string()), "got: {w:?}");
}

#[test]
fn warnings_without_ignore_still_fire() {
    let w = warnings(r#"<div role="invalid_role">x</div>"#);
    assert!(w.contains(&"a11y_unknown_role".to_string()), "got: {w:?}");
}
