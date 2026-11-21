use super::*;

#[test]
fn the_defaults_are_prettiers() {
    let options = Options::default().formatter().expect("the defaults print");
    assert_eq!(u16::from(options.line_width), 80);
    assert_eq!(options.quote_style, QuoteStyle::Double);
    assert_eq!(options.semicolons, Semicolons::Always);
}

#[test]
fn prettier_names_set_the_formatter() {
    let options: Options = serde_json::from_str(
        r#"{"printWidth":100,"useTabs":true,"singleQuote":true,"semi":false,
            "trailingComma":"es5","arrowParens":"avoid"}"#,
    )
    .expect("options");
    let formatter = options.formatter().expect("prints");
    assert_eq!(u16::from(formatter.line_width), 100);
    assert_eq!(formatter.indent_style, IndentStyle::Tab);
    assert_eq!(formatter.quote_style, QuoteStyle::Single);
    assert_eq!(formatter.semicolons, Semicolons::AsNeeded);
    assert_eq!(formatter.trailing_commas, TrailingCommas::Es5);
    assert_eq!(formatter.arrow_parentheses, ArrowParentheses::AsNeeded);
}

#[test]
fn a_value_the_formatter_cannot_print_is_named() {
    let options: Options = serde_json::from_str(r#"{"endOfLine":"auto"}"#).expect("options");
    assert_eq!(options.formatter().err(), Some("endOfLine"));
    serde_json::from_str::<Options>(r#"{"svelteSortOrder":"none"}"#)
        .expect_err("not a TypeScript option");
}

#[test]
fn names_lists_every_option() {
    let error = serde_json::from_str::<Options>(r#"{"x": 1}"#).expect_err("unknown");
    let error = error.to_string();
    let (_, expected) = error.split_once("expected one of ").expect("the fields");
    let fields: Vec<&str> = expected.split('`').skip(1).step_by(2).collect();
    assert_eq!(fields, NAMES);
}
