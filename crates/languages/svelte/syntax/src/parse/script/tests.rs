use super::script_is_typescript;

#[test]
fn the_first_lang_attribute_decides() {
    assert!(script_is_typescript(r#"<script lang="ts"></script>"#));
    assert!(script_is_typescript("<script lang=ts></script>"));
    assert!(!script_is_typescript(
        r#"<script lang="js"></script><script lang="ts"></script>"#
    ));
    assert!(!script_is_typescript(
        r#"<script lang="typescript"></script>"#
    ));
    assert!(!script_is_typescript(
        r#"<!-- <script lang="ts"> --><script></script>"#
    ));
}

#[test]
fn a_quoted_value_may_hold_a_closing_bracket() {
    assert!(script_is_typescript(
        r#"<script generics="T extends Record<string, unknown>" lang="ts"></script>"#
    ));
    assert!(script_is_typescript(
        r#"<script module generics='T extends A<B>' lang="ts"></script>"#
    ));
}

#[test]
fn an_unclosed_comment_does_not_hide_a_later_script() {
    assert!(script_is_typescript(
        r#"<p><!-- </p><script lang="ts"></script>"#
    ));
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
