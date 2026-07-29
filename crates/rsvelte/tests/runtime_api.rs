use std::collections::HashSet;

use rsvelte::{ComponentOptions, CssMode, DiagnosticSeverity, Engine, RuntimeTarget, ScriptKind};
use static_assertions::{assert_impl_all, assert_not_impl_any};

assert_impl_all!(Engine: Send, Sync);
assert_not_impl_any!(Engine: Copy);
assert_impl_all!(rsvelte::PreparedComponent<'static>: Send);
assert_not_impl_any!(rsvelte::PreparedComponent<'static>: Sync);

#[test]
fn prepares_once_and_emits_neutral_client_and_server_artifacts() {
    let source = r#"<script context="module">export const answer = 42;</script>
<script lang="ts">let { label = "count" }: { label?: string } = $props();</script>
<h1>{label}</h1>
<style>h1 { color: rebeccapurple }</style>"#;
    let engine = Engine::new();
    let mut prepared = engine
        .prepare(
            source,
            ComponentOptions::new()
                .filename("/workspace/src/Counter.svelte")
                .source_maps(true)
                .css_mode(CssMode::External),
        )
        .expect("prepare component");

    let facts = prepared.facts();
    assert!(facts.runes);
    assert_eq!(facts.scripts.len(), 2);
    assert_eq!(facts.scripts[0].kind, ScriptKind::Module);
    assert_eq!(facts.scripts[1].kind, ScriptKind::Instance);
    assert!(facts.scripts[1].typescript);
    assert_eq!(
        &source[facts.scripts[1].content.as_usize_range()],
        r#"let { label = "count" }: { label?: string } = $props();"#
    );
    assert_eq!(
        &source[facts.style.as_ref().unwrap().content.as_usize_range()],
        "h1 { color: rebeccapurple }"
    );

    let client = prepared
        .compile(RuntimeTarget::Client)
        .expect("client compile");
    let server = prepared
        .compile(RuntimeTarget::Server)
        .expect("server compile");

    assert!(client.javascript.code.contains("svelte/internal/client"));
    assert!(server.javascript.code.contains("svelte/internal/server"));
    assert!(client.javascript.source_map.is_some());
    assert!(server.javascript.source_map.is_some());
    assert_eq!(
        client.css.as_ref().and_then(|css| css.scope.as_deref()),
        prepared.facts().css_scope.as_deref()
    );
}

#[test]
fn fixed_css_scope_is_frozen_in_facts_and_runtime_output() {
    let engine = Engine::new();
    let mut prepared = engine
        .prepare(
            "<style>.card { color: blue }</style><div class=\"card\">ok</div>",
            ComponentOptions::new()
                .filename("Card.svelte")
                .fixed_css_scope("scope-from-embedder"),
        )
        .expect("prepare component");

    assert_eq!(
        prepared.facts().css_scope.as_deref(),
        Some("scope-from-embedder")
    );
    let artifact = prepared
        .compile(RuntimeTarget::Client)
        .expect("client compile");
    let css = artifact.css.expect("external CSS");
    assert_eq!(css.scope.as_deref(), Some("scope-from-embedder"));
    assert!(css.code.contains("scope-from-embedder"));
    assert!(artifact.javascript.code.contains("scope-from-embedder"));
}

#[test]
fn warnings_are_normalized_to_utf8_byte_ranges() {
    let source = r#"<img src="é">"#;
    let engine = Engine::new();
    let mut prepared = engine
        .prepare(source, ComponentOptions::new().filename("Image.svelte"))
        .expect("prepare component");
    let artifact = prepared
        .compile(RuntimeTarget::Client)
        .expect("client compile");
    let warning = artifact
        .diagnostics
        .iter()
        .find(|diagnostic| diagnostic.code == "a11y_missing_attribute")
        .expect("missing-alt warning");

    assert_eq!(warning.severity, DiagnosticSeverity::Warning);
    assert_eq!(warning.filename.as_deref(), Some("Image.svelte"));
    let span = warning.span.expect("warning span");
    assert!(source.is_char_boundary(span.start() as usize));
    assert!(source.is_char_boundary(span.end() as usize));
    assert!(span.end() <= source.len() as u32);
}

#[test]
fn failures_do_not_expose_compiler_phase_errors() {
    let source = "<div>";
    let failure = Engine::new()
        .prepare(source, ComponentOptions::new().filename("Broken.svelte"))
        .expect_err("unclosed element must fail");

    assert_eq!(failure.diagnostic.code, "element_unclosed");
    assert_eq!(failure.diagnostic.severity, DiagnosticSeverity::Error);
    assert_eq!(
        failure.diagnostic.filename.as_deref(),
        Some("Broken.svelte")
    );
    let span = failure.diagnostic.span.expect("parse failure span");
    assert!(span.end() <= source.len() as u32);
    assert!(source.is_char_boundary(span.start() as usize));
    assert!(source.is_char_boundary(span.end() as usize));
}

#[test]
fn fingerprint_uses_facade_schema_names_and_compiler_versions() {
    let fingerprint = Engine::new().fingerprint();
    assert_eq!(fingerprint.facade_version, env!("CARGO_PKG_VERSION"));
    assert!(!fingerprint.compiler_version.is_empty());
    assert!(!fingerprint.svelte_version.is_empty());
    assert!(fingerprint.api_schema > 0);
    assert!(fingerprint.runtime_schema > 0);
    assert!(fingerprint.facts_schema > 0);
    assert!(fingerprint.projection_schema > 0);
}

#[test]
fn component_option_cache_keys_are_stable_and_cover_every_option() {
    let default = ComponentOptions::new().cache_key();
    assert_eq!(default, ComponentOptions::new().cache_key());
    assert!(
        default
            .as_str()
            .starts_with("rsvelte-component-options:v1|")
    );

    let changed = [
        ComponentOptions::new().development(true).cache_key(),
        ComponentOptions::new().filename("App.svelte").cache_key(),
        ComponentOptions::new()
            .output_filename("App.js")
            .cache_key(),
        ComponentOptions::new()
            .css_output_filename("App.css")
            .cache_key(),
        ComponentOptions::new().custom_element(true).cache_key(),
        ComponentOptions::new()
            .css_mode(CssMode::Injected)
            .cache_key(),
        ComponentOptions::new().fixed_css_scope("scope").cache_key(),
        ComponentOptions::new().preserve_comments(true).cache_key(),
        ComponentOptions::new()
            .preserve_whitespace(true)
            .cache_key(),
        ComponentOptions::new().runes(Some(false)).cache_key(),
        ComponentOptions::new().runes(Some(true)).cache_key(),
        ComponentOptions::new().disclose_version(false).cache_key(),
        ComponentOptions::new().source_maps(false).cache_key(),
    ];

    assert!(changed.iter().all(|key| key != &default));
    assert_eq!(
        changed.iter().collect::<HashSet<_>>().len(),
        changed.len(),
        "each option must contribute independently to the persistent cache identity"
    );
}
