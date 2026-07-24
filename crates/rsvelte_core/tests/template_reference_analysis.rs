use rsvelte_core::{
    CompileOptions, ParseOptions, ast::arena::SerializeArenaGuard,
    compiler::phases::analyze_component, parse,
};

fn assert_template_reference(source: &str, binding_name: &str, reference_start: usize) {
    let mut root = parse(
        source,
        &oxc_allocator::Allocator::default(),
        ParseOptions::default(),
    )
    .expect("parse");
    // SAFETY: `root.arena` outlives the guard and the analysis below.
    let _arena_guard = unsafe { SerializeArenaGuard::new(&raw const root.arena) };
    let analysis =
        analyze_component(&mut root, source, &CompileOptions::default()).expect("analyze");
    let binding = analysis
        .root
        .bindings
        .iter()
        .find(|binding| binding.name == binding_name)
        .expect("binding");

    assert!(
        binding.references.iter().any(|reference| {
            reference.start == u32::try_from(reference_start).unwrap()
                && reference.is_template_reference
        }),
        "missing template reference for {binding_name}: {:?}",
        binding.references
    );
}

fn assert_has_template_reference(source: &str, binding_name: &str) {
    let mut root = parse(
        source,
        &oxc_allocator::Allocator::default(),
        ParseOptions::default(),
    )
    .expect("parse");
    // SAFETY: `root.arena` outlives the guard and the analysis below.
    let _arena_guard = unsafe { SerializeArenaGuard::new(&raw const root.arena) };
    let analysis =
        analyze_component(&mut root, source, &CompileOptions::default()).expect("analyze");
    let binding = analysis
        .root
        .bindings
        .iter()
        .find(|binding| binding.name == binding_name)
        .expect("binding");

    assert!(
        binding
            .references
            .iter()
            .any(|reference| reference.is_template_reference),
        "missing template reference for {binding_name}: {:?}",
        binding.references
    );
}

#[test]
fn boundary_handler_is_a_template_reference() {
    let source = r#"<svelte:boundary onerror={handle_error}>
  <p>content</p>
</svelte:boundary>
<script>
function handle_error(error) {
  console.error(error);
}
</script>"#;

    assert_template_reference(source, "handle_error", source.find("handle_error").unwrap());
}

#[test]
fn snippet_default_is_a_template_reference() {
    let source = r#"{#snippet card(value = file_id)}
  <p>{value}</p>
{/snippet}
<script>
let file_id = 1;
</script>"#;

    assert_template_reference(source, "file_id", source.find("file_id").unwrap());
}

#[test]
fn nested_snippet_defaults_are_template_references() {
    let source = r#"{#snippet card({ value = fallback } = source)}
  <p>{value}</p>
{/snippet}
<script>
let fallback = 1;
let source = {};
</script>"#;

    for name in ["fallback", "source"] {
        assert_has_template_reference(source, name);
    }
}
