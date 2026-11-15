use crate::warnings::tests::compiled_with_errors;

#[test]
fn an_unused_export_spans_the_type_annotation() {
    let source = concat!(
        "<script lang=\"ts\">\n",
        "  export let a: string;\n  let b: number;\n  export { b };\n",
        "</script>\n",
    );
    let warnings = compiled_with_errors(source, None).0;
    let texts: Vec<_> = warnings
        .into_iter()
        .filter(|(c, ..)| c == "export_let_unused")
        .map(|(_, text, _)| text)
        .collect();
    assert_eq!(texts, ["a: string", "b: number"]);
}

#[test]
fn a_reassigned_export_const_the_template_reads_is_state_in_legacy_mode() {
    let errors = |code: &str| compiled_with_errors(code, None).1;
    let script = "<script>\n  export const a = 1;\n  function f() { a = 2; }\n</script>\n";
    assert_eq!(
        errors(&format!("{script}<button onclick={{f}}>{{a}}</button>\n")),
        ["state_invalid_export"]
    );
    assert_eq!(
        errors(&format!("{script}<button onclick={{f}}>x</button>\n")),
        Vec::<String>::new()
    );
    assert_eq!(
        errors("<script>\n  export const a = 1;\n</script>\n<input bind:value={a} />\n"),
        ["state_invalid_export"]
    );
}

#[test]
fn an_exported_class_nothing_uses_is_an_unused_export_in_legacy_mode() {
    let codes = |code: &str| -> Vec<String> {
        compiled_with_errors(code, None)
            .0
            .into_iter()
            .map(|(code, ..)| code)
            .collect()
    };
    assert_eq!(
        codes("<script>class K {} export { K as C };</script>\n"),
        ["export_let_unused"]
    );
    assert_eq!(
        codes("<script>function f() {} export { f };</script>\n"),
        Vec::<String>::new()
    );
}

#[test]
fn a_local_let_a_re_export_names_is_an_unused_export_in_legacy_mode() {
    let codes = |code: &str| -> Vec<String> {
        compiled_with_errors(code, None)
            .0
            .into_iter()
            .map(|(code, ..)| code)
            .collect()
    };
    assert_eq!(
        codes("<script>let x = 1; export { x as y } from './mod';</script>\n"),
        ["export_let_unused"]
    );
    assert_eq!(
        codes("<script>export { x as y } from './mod';</script>\n"),
        Vec::<String>::new()
    );
}
