use super::*;

fn parse(json: &str) -> Result<Options, String> {
    serde_json::from_str(json).map_err(|e| e.to_string())
}

#[test]
fn an_empty_object_is_the_defaults() {
    assert_eq!(parse("{}"), Ok(Options::default()));
}

#[test]
fn whitespace_sensitivity_by_display_is_prettiers_default() {
    let o = parse(r#"{"htmlWhitespaceSensitivity": "css"}"#).expect("valid");
    assert_eq!(
        o.markup_whitespace_sensitivity,
        WhitespaceSensitivity::Display
    );
    assert_eq!(o, Options::default());
}

#[test]
fn names_and_values_are_prettiers() {
    let o = parse(
        r#"{"printWidth": 100, "tabWidth": 4, "useTabs": true, "quoteProps": "as-needed",
            "trailingComma": "es5", "htmlWhitespaceSensitivity": "ignore", "endOfLine": "crlf",
            "svelteSortOrder": "markup-styles-scripts-options", "svelteAllowShorthand": false}"#,
    )
    .expect("valid");
    assert_eq!((o.print_width, o.tab_width, o.use_tabs), (100, 4, true));
    assert_eq!(o.trailing_comma, TrailingComma::Es5);
    assert_eq!(
        o.markup_whitespace_sensitivity,
        WhitespaceSensitivity::Ignore
    );
    assert_eq!(o.end_of_line, EndOfLine::Crlf);
    assert_eq!(
        o.svelte_sort_order,
        SortOrder(Some([
            Part::Markup,
            Part::Styles,
            Part::Scripts,
            Part::Options
        ]))
    );
    assert!(!o.svelte_allow_shorthand);
}

#[test]
fn a_sort_order_is_none_or_all_four_parts_once() {
    assert_eq!(
        parse(r#"{"svelteSortOrder": "none"}"#).map(|o| o.svelte_sort_order),
        Ok(SortOrder(None))
    );
    for bad in [
        "scripts-markup-styles",
        "options-scripts-markup-styles-options",
        "options-scripts-scripts-styles",
        "options-scripts-markup-css",
    ] {
        parse(&format!(r#"{{"svelteSortOrder": "{bad}"}}"#)).expect_err(bad);
    }
}

#[test]
fn an_unknown_option_is_refused() {
    parse(r#"{"printwidth": 80}"#).expect_err("a misspelled name");
    parse(r#"{"trailingComma": "always"}"#).expect_err("a value Prettier does not have");
}

#[test]
fn a_whole_number_may_be_written_with_a_fraction_of_zero() {
    assert_eq!(
        parse(r#"{"printWidth": 80.0}"#).map(|o| o.print_width),
        Ok(80)
    );
    assert_eq!(
        parse(r#"{"rangeEnd": null}"#).map(|o| o.range_end),
        Ok(None)
    );
    assert_eq!(
        parse(r#"{"rangeEnd": 5}"#).map(|o| o.range_end),
        Ok(Some(5))
    );
    parse(r#"{"tabWidth": 2.5}"#).expect_err("not whole");
    parse(r#"{"tabWidth": -1}"#).expect_err("negative");
}
