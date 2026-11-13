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
