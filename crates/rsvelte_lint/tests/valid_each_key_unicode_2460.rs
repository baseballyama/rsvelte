use std::path::PathBuf;

use rsvelte_core::CompileOptions;
use rsvelte_lint::{LintConfig, Severity, lint_source};

#[test]
fn unicode_each_context_is_a_valid_key_reference() {
    let config = LintConfig::empty().with_override("svelte/valid-each-key", Severity::Error);
    let diagnostics = lint_source(
        "{#each [{ id: 1 }] as 名前 (名前.id)}{名前.id}{/each}",
        &PathBuf::from("Test.svelte"),
        &CompileOptions::default(),
        &config,
    );
    assert!(
        diagnostics
            .iter()
            .all(|diagnostic| diagnostic.code.as_deref() != Some("svelte/valid-each-key")),
        "{diagnostics:#?}"
    );
}
