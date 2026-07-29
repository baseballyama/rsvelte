#![cfg(feature = "projection")]

use std::collections::HashSet;

use rsvelte::{
    ByteRange, DiagnosticSeverity, Engine, MarkupNamespace, ProjectionMode, ProjectionOptions,
};

#[test]
fn projection_feature_returns_owned_neutral_artifacts() {
    let source = r#"<script lang="ts">export let greeting: string = "héllo";</script>
<h1>{greeting}</h1>"#;
    let artifact = Engine::new()
        .project(
            source,
            ProjectionOptions::new()
                .filename("Greeting.svelte")
                .typescript(true),
        )
        .expect("project component");

    assert!(artifact.code.contains("greeting"));
    assert!(artifact.facts.props.iter().any(|prop| {
        prop.name == "greeting" && prop.type_annotation.as_deref() == Some("string")
    }));
    let original = source.find("greeting: string").unwrap() as u32;
    let source_range = ByteRange::new(original, original + "greeting".len() as u32).unwrap();
    let generated = artifact
        .exact_mappings
        .as_ref()
        .expect("exact mappings")
        .source_range_to_generated(source_range);
    assert!(
        generated
            .iter()
            .any(|range| &artifact.code[range.as_usize_range()] == "greeting")
    );
    let generated_range = generated
        .iter()
        .copied()
        .find(|range| &artifact.code[range.as_usize_range()] == "greeting")
        .expect("mapped generated prop");
    assert_eq!(
        artifact
            .exact_mappings
            .as_ref()
            .expect("exact mappings")
            .generated_range_to_source(generated_range),
        Some(source_range)
    );
}

#[test]
fn projection_failure_does_not_expose_parser_types() {
    let source = "<div>";
    let failure = Engine::new()
        .project(source, ProjectionOptions::new().filename("Broken.svelte"))
        .expect_err("unclosed element must fail");

    assert_eq!(failure.diagnostic.code, "projection_parse_error");
    assert_eq!(failure.diagnostic.severity, DiagnosticSeverity::Error);
    assert_eq!(
        failure.diagnostic.filename.as_deref(),
        Some("Broken.svelte")
    );
    assert!(!failure.diagnostic.message.is_empty());
    let span = failure.diagnostic.span.expect("parse span");
    assert!(span.end() <= source.len() as u32);
}

#[test]
fn projection_option_cache_keys_are_stable_and_cover_every_option() {
    let default = ProjectionOptions::new().cache_key();
    assert_eq!(default, ProjectionOptions::new().cache_key());
    assert!(
        default
            .as_str()
            .starts_with("rsvelte-projection-options:v1|")
    );

    let changed = [
        ProjectionOptions::new()
            .filename("Other.svelte")
            .cache_key(),
        ProjectionOptions::new().typescript(true).cache_key(),
        ProjectionOptions::new()
            .mode(ProjectionMode::Declaration)
            .cache_key(),
        ProjectionOptions::new().accessors(true).cache_key(),
        ProjectionOptions::new()
            .namespace(MarkupNamespace::Svg)
            .cache_key(),
        ProjectionOptions::new()
            .namespace(MarkupNamespace::Mathml)
            .cache_key(),
        ProjectionOptions::new().runes(Some(false)).cache_key(),
        ProjectionOptions::new().runes(Some(true)).cache_key(),
        ProjectionOptions::new().emit_jsdoc(true).cache_key(),
        ProjectionOptions::new()
            .rewrite_external_imports(
                "/workspace/src/App.svelte",
                "/workspace/generated/App.svelte.tsx",
                "/workspace",
            )
            .cache_key(),
    ];

    assert!(changed.iter().all(|key| key != &default));
    assert_eq!(
        changed.iter().collect::<HashSet<_>>().len(),
        changed.len(),
        "each option must contribute independently to the persistent cache identity"
    );
}
