//! Regression test pin for the `{#each}` cluster (issue #459, H-135..H-138,
//! M-086, M-087).
//!
//! Most items in this cluster are either fixed (PR #520 for the
//! object-rest H-137), already documented as won't-fix (M-086), or share
//! the foundational scope-aware refactor tracked at #444 (H-138 ⊆ H-004).
//! Pin the H-135 / H-136 cases that have working code paths so future drift
//! in the each-block destructuring lowering surfaces.

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

#[test]
fn h135_alias_in_key_uses_alias() {
    let out =
        client(r#"<script>let items = [{id:1}];</script>{#each items as { id: a } (a)}{a}{/each}"#);
    assert!(out.contains("({ id: a }) => a"), "got:\n{out}");
}

#[test]
fn h135_rest_in_body_destructures_via_exclude_from_object() {
    let out = client(
        r#"<script>let items = [{id:1,n:"x"}];</script>{#each items as { id, ...rest }}{id}-{rest.n}{/each}"#,
    );
    assert!(out.contains("$.exclude_from_object"), "got:\n{out}");
    assert!(out.contains("['id']"), "got:\n{out}");
}

#[test]
fn h136_nested_default_uses_fallback() {
    let out = client(
        r#"<script>let items = [{inner:{}}];</script>{#each items as { inner: { x = 5 } } }{x}{/each}"#,
    );
    assert!(
        out.contains("$.fallback($.get($$item).inner.x, 5)"),
        "got:\n{out}"
    );
}

#[test]
fn h136_default_in_keyed_each() {
    let out =
        client(r#"<script>let items = [{ }];</script>{#each items as { id = 1 } (id)}{id}{/each}"#);
    // Default is applied in the body (via $.fallback) even though the key
    // function only reads `id` directly.
    assert!(
        out.contains("$.fallback($.get($$item).id, 1)"),
        "got:\n{out}"
    );
    assert!(out.contains("({ id }) => id"), "got:\n{out}");
}
