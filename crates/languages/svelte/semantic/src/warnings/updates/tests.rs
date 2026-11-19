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

#[test]
fn a_quoted_this_reads_no_name_after_its_first_chunk() {
    // Official: svelte_element_invalid_this only; `m` is never read.
    let source = concat!(
        "<script>\n  let m = 1;\n  function f() { m = 2; }\n</script>\n",
        "<svelte:element this=\"h{m}\" />\n<button onclick={f}>x</button>\n",
    );
    assert_eq!(texts("non_reactive_update", source), Vec::<&str>::new());
}
