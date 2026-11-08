use super::*;

#[test]
fn renders_the_playground_layout_expression_with_the_kernel_printer() {
    let json = render_document(
        concat!(
            r#"group("f(", indent([softline, "#,
            r#"join([",", line], ["aaaa", "bbbb"])]), softline, ")")"#
        ),
        10,
        false,
    );
    assert!(
        json.contains(r#""output":"f(\n  aaaa,\n  bbbb\n)""#),
        "{json}"
    );
    assert!(json.contains(r#""why":"does-not-fit""#), "{json}");
}

#[test]
fn reports_layout_expression_errors_in_utf16_offsets() {
    let json = render_document("[\"日\", @]", 80, false);
    assert!(json.contains(r#""at":6"#), "{json}");
}
