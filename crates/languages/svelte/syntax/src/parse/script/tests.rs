use crate::parse::parse;

fn reads_typescript(source: &str) -> bool {
    let component = parse(source).expect(source);
    let instance = component.instance.as_ref().expect(source);
    instance.typescript
}

#[test]
fn the_first_script_with_a_lang_decides() {
    assert!(reads_typescript(r#"<script lang="ts"></script>"#));
    assert!(reads_typescript("<script lang=ts></script>"));
    assert!(reads_typescript(
        r#"<script module></script><script lang="ts"></script>"#
    ));
    assert!(!reads_typescript(
        r#"<script module lang="js"></script><script lang="ts"></script>"#
    ));
    assert!(!reads_typescript(r#"<script lang="typescript"></script>"#));
    assert!(!reads_typescript(
        r#"<!-- <script lang="ts"> --><script></script>"#
    ));
    assert!(reads_typescript(
        r#"<script generics="T extends Record<string, unknown>" lang="ts"></script>"#
    ));
}

#[test]
fn text_that_looks_like_a_lang_attribute_does_not() {
    assert!(!reads_typescript(
        r#"<script>let s = '<script lang="ts">';</script>"#
    ));
    let source = r#"<p>{'<script lang="ts">'}</p><p>{1 as number}</p>"#;
    let error = parse(source).expect_err(source);
    assert_eq!(error.code, "expected_token");
    let at = source.find("as number").expect("the `as`") as u32;
    assert_eq!(error.span.start_offset, at);
}

#[test]
fn an_expression_before_the_script_reads_in_its_language() {
    let source = r#"<p>{1 as number}</p><script lang="ts"></script>"#;
    parse(source).expect(source);
}

/// typescript-eslint parses a `declare` field with an initializer, which oxc reports and
/// recovers from, so the script keeps its statements beside the error.
#[test]
fn a_script_read_as_typescript_keeps_what_oxc_recovered() {
    let source = "<script>\nclass K {\n\tdeclare a = 1;\n}\n</script>";
    let component =
        crate::parse::parse_reading_scripts_as_typescript(source).expect("the markup parses");
    assert!(!component.script_typescript_errors.is_empty());
    let instance = component.instance.as_ref().expect("an instance script");
    let program = component.javascript.get_program(instance.program);
    assert_eq!(program.body.len(), 1);
}

#[test]
fn a_script_attribute_svelte_keeps_or_refuses_fails() {
    // Each source's error from svelte 5.59.1, with its byte range.
    for (source, code, start, end) in [
        (
            "<script server>let a = 1;</script>",
            "script_reserved_attribute",
            8,
            14,
        ),
        (
            r#"<script lang="ts" test>let a = 1;</script>"#,
            "script_reserved_attribute",
            18,
            22,
        ),
        (
            r#"<script module="server">let a = 1;</script>"#,
            "script_invalid_attribute_value",
            8,
            23,
        ),
        (
            "<script module=x>let a = 1;</script>",
            "script_invalid_attribute_value",
            8,
            16,
        ),
        (
            r#"<script module="">let a = 1;</script>"#,
            "script_invalid_attribute_value",
            8,
            17,
        ),
        (
            "<script context>let a = 1;</script>",
            "script_invalid_context",
            8,
            15,
        ),
        (
            r#"<script context="foo">let a = 1;</script>"#,
            "script_invalid_context",
            8,
            21,
        ),
        (
            "<script default>let a = </script>",
            "js_parse_error",
            24,
            24,
        ),
    ] {
        let error = parse(source).expect_err(source);
        assert_eq!(
            (
                error.code.as_ref(),
                error.span.start_offset,
                error.span.end_offset
            ),
            (code, start, end),
            "{source}"
        );
    }
    parse(r#"<script context="module">let a = 1;</script>"#).expect("a module script");
}
