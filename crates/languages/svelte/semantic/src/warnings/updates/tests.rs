use crate::warnings::tests::texts;

#[test]
fn an_update_warning_spans_the_type_annotation() {
    let source = "<script lang=\"ts\">\n  let a: string = '';\n  a = 'b';\n</script>\n{a}\n";
    assert_eq!(texts("non_reactive_update", source), ["a: string"]);
}

#[test]
fn an_export_specifier_reassigns_its_binding() {
    let source = "<script>\n  let a = 1;\n  export { a };\n</script>\n{a}\n";
    assert_eq!(texts("non_reactive_update", source), ["a"]);
}
