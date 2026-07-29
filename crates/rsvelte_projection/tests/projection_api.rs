use rsvelte_projection::{
    ByteRange, ProjectionEngine,
    svelte2tsx::{RewriteExternalImportsOptions, Svelte2TsxOptions},
};

#[test]
fn projection_has_bidirectional_exact_byte_mappings_and_frozen_facts() {
    let source = r#"<script lang="ts">
  export let greeting: string = "héllo";
  export const answer = 42;
</script>
<h1>{greeting}</h1>"#;
    let projection = ProjectionEngine::new()
        .project(
            source,
            Svelte2TsxOptions {
                filename: "Greeting.svelte".to_string(),
                is_ts_file: true,
                ..Default::default()
            },
        )
        .expect("project component");
    let mappings = projection.exact_mappings.as_ref().expect("exact mappings");

    let original = source.find("greeting: string").unwrap() as u32;
    let generated_candidates = mappings.source_to_generated(original);
    assert!(!generated_candidates.is_empty());
    for generated in generated_candidates {
        assert_eq!(
            &projection.code[generated as usize..generated as usize + "greeting".len()],
            "greeting"
        );
        assert_eq!(mappings.generated_to_source(generated), Some(original));
    }

    let original_range =
        ByteRange::new(original, original + "greeting".len() as u32).expect("valid range");
    let generated_ranges = mappings.source_range_to_generated(original_range);
    assert!(!generated_ranges.is_empty());
    assert!(generated_ranges.iter().all(|range| {
        &projection.code[range.as_usize_range()] == "greeting"
            && mappings.generated_range_to_source(*range) == Some(original_range)
    }));

    let synthetic = projection
        .code
        .find("__sveltets")
        .expect("synthesized helper") as u32;
    assert_eq!(mappings.generated_to_source(synthetic), None);

    let multibyte = source.find('é').expect("multibyte source character") as u32;
    let generated_multibyte = mappings.source_to_generated(multibyte);
    assert!(!generated_multibyte.is_empty());
    assert!(generated_multibyte.iter().all(|&generated| {
        &projection.code[generated as usize..generated as usize + "é".len()] == "é"
            && mappings.generated_to_source(generated) == Some(multibyte)
    }));

    assert!(!projection.facts.runes);
    assert!(projection.facts.props.iter().any(|prop| {
        prop.name == "greeting"
            && prop.local_name == "greeting"
            && prop.optional
            && prop.type_annotation.as_deref() == Some("string")
    }));
    assert!(
        projection
            .facts
            .exports
            .iter()
            .any(|export| export.name == "answer")
    );
}

#[test]
fn projection_preserves_mappings_across_external_import_rewrites() {
    let source = r#"<script>import x from "../../outside.js";</script><p>{x}</p>"#;
    let projection = ProjectionEngine::new()
        .project(
            source,
            Svelte2TsxOptions {
                rewrite_external_imports: Some(RewriteExternalImportsOptions {
                    source_path: "/workspace/src/App.svelte".to_string(),
                    generated_path: "/workspace/.generated/nested/App.svelte.tsx".to_string(),
                    workspace_path: "/workspace".to_string(),
                }),
                ..Default::default()
            },
        )
        .expect("project component");

    assert!(projection.code.contains("../../../outside.js"));
    let mappings = projection
        .exact_mappings
        .as_ref()
        .expect("rewrites retain exact mappings outside replaced text");
    let source_x = source.rfind("{x}").unwrap() as u32 + 1;
    let generated_x = mappings.source_to_generated(source_x);
    assert!(!generated_x.is_empty());
    assert!(generated_x.iter().all(|&offset| {
        &projection.code[offset as usize..offset as usize + 1] == "x"
            && mappings.generated_to_source(offset) == Some(source_x)
    }));
    let rewritten_specifier = projection.code.find("../../../outside.js").unwrap() as u32;
    assert_eq!(
        mappings.generated_to_source(rewritten_specifier),
        None,
        "replacement text is not byte-exact source"
    );
    assert!(
        projection.source_map.is_some(),
        "standard maps must describe post-rewrite coordinates"
    );

    let raw = rsvelte_projection::svelte2tsx::svelte2tsx(
        source,
        Svelte2TsxOptions {
            rewrite_external_imports: Some(RewriteExternalImportsOptions {
                source_path: "/workspace/src/App.svelte".to_string(),
                generated_path: "/workspace/.generated/nested/App.svelte.tsx".to_string(),
                workspace_path: "/workspace".to_string(),
            }),
            ..Default::default()
        },
    )
    .expect("raw projection");
    assert!(raw.map.is_some());
    assert!(!raw.forward_map.is_empty());
    assert!(raw.map_offset_forward(source_x).is_some());
}

#[test]
fn raw_projection_metadata_types_are_publicly_nameable() {
    let raw = rsvelte_projection::svelte2tsx::svelte2tsx(
        "<script>export let value = 1;</script>",
        Svelte2TsxOptions::default(),
    )
    .expect("raw projection");

    let _: &rsvelte_projection::svelte2tsx::ExportedNames = &raw.exported_names;
    let _: &rsvelte_projection::svelte2tsx::ComponentEvents = &raw.events;
}

#[test]
fn raw_projection_errors_have_stable_neutral_codes() {
    let error = rsvelte_projection::svelte2tsx::svelte2tsx("<div>", Svelte2TsxOptions::default())
        .expect_err("unclosed element must fail");

    assert_eq!(error.code(), "projection_parse_error");
    assert!(error.span().is_some());
}
