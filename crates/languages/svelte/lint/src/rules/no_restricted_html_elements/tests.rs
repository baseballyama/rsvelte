use super::super::testing::configure;

const RULE: &str = "svelte/no-restricted-html-elements";

// Upstream's schema: `uniqueItems` on the options and on `elements`, `minLength: 1` on `message`.
#[test]
fn options_the_schema_rejects_are_configuration_errors() {
    for options in [
        r#"["div", "div"]"#,
        r#"[{"elements": ["a"]}, {"elements": ["a"]}]"#,
        r#"[{"elements": ["a", "a"]}]"#,
        r#"[{"elements": ["a"], "message": ""}]"#,
    ] {
        assert!(configure(RULE, options).is_err(), "{options}");
    }
}

#[test]
fn distinct_options_configure_the_rule() {
    for options in [
        r#"["div", "span"]"#,
        r#"["a", {"elements": ["a"]}]"#,
        r#"[{"elements": ["a"]}, {"elements": ["a"], "message": "m"}]"#,
    ] {
        assert_eq!(configure(RULE, options), Ok(()), "{options}");
    }
}
