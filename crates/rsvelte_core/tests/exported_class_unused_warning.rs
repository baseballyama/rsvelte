use rsvelte_core::{CompileOptions, compile};

fn unused_exports(source: &str) -> Vec<String> {
    compile(
        source,
        CompileOptions {
            filename: Some("ExportedClass.svelte".to_string()),
            ..Default::default()
        },
    )
    .expect("component should compile")
    .warnings
    .into_iter()
    .filter(|warning| warning.code == "export_let_unused")
    .map(|warning| warning.message)
    .collect()
}

#[test]
fn one_markup_reference_clears_an_exported_class_warning() {
    let warnings = unused_exports("<script>class K {} export { K };</script>\n<b>{typeof K}</b>");
    assert!(warnings.is_empty(), "unexpected warnings: {warnings:?}");
}

#[test]
fn one_script_reference_clears_an_exported_class_warning() {
    let warnings = unused_exports("<script>class K {} export { K }; void K;</script>");
    assert!(warnings.is_empty(), "unexpected warnings: {warnings:?}");
}

#[test]
fn an_export_specifier_alone_does_not_count_as_a_use() {
    let warnings = unused_exports("<script>class K {} export { K as C };</script>");
    assert_eq!(warnings.len(), 1);
    assert!(warnings[0].contains("K"));
}

#[test]
fn a_variable_declaration_still_does_not_count_as_a_use() {
    let warnings = unused_exports("<script>export let value = 1;</script>");
    assert_eq!(warnings.len(), 1);
    assert!(warnings[0].contains("value"));
}

#[test]
fn other_exported_declaration_shapes_keep_their_existing_answer() {
    let warnings = unused_exports(
        "<script>\nfunction F() {}\nconst C = class {};\nexport { F, C };\n</script>\n{typeof F}{typeof C}",
    );
    assert!(warnings.is_empty(), "unexpected warnings: {warnings:?}");
}
