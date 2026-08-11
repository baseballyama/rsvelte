#[test]
fn dev_derived_field_rehomes_a_leading_line_comment_to_the_arrow_parameter_list() {
    let source = "<script>\nexport class C {\n// c\nx = $derived(1);\n}\n</script>";
    let result = rsvelte_core::compiler::compile(
        source,
        rsvelte_core::compiler::CompileOptions {
            dev: true,
            generate: rsvelte_core::compiler::GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compiles");

    assert!(
        result
            .js
            .code
            .contains("#x = $.tag(\n\t\t\t$.derived((// c\n\t\t\t) => 1),\n\t\t\t'C.x'\n\t\t);"),
        "{0}",
        result.js.code
    );
}
