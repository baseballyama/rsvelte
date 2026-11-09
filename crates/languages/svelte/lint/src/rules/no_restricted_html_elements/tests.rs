use rsvelte_kernel::diagnostics::Severity;
use serde_json::value::RawValue;

use crate::{Configuration, LintSettings};

const RULE: &str = "svelte/no-restricted-html-elements";

/// Whether `options` configure the rule, or why not.
fn configure(options: &str) -> Result<(), String> {
    let options: Vec<Box<RawValue>> = serde_json::from_str(options).map_err(|e| e.to_string())?;
    Configuration::new(LintSettings::default())
        .rule(RULE, Severity::Error, &options, &[])
        .map(|_| ())
}

// Upstream's schema: `uniqueItems` on the options and on `elements`, `minLength: 1` on `message`.
#[test]
fn options_the_schema_rejects_are_configuration_errors() {
    for options in [
        r#"["div", "div"]"#,
        r#"[{"elements": ["a"]}, {"elements": ["a"]}]"#,
        r#"[{"elements": ["a", "a"]}]"#,
        r#"[{"elements": ["a"], "message": ""}]"#,
    ] {
        assert!(configure(options).is_err(), "{options}");
    }
}

#[test]
fn distinct_options_configure_the_rule() {
    for options in [
        r#"["div", "span"]"#,
        r#"["a", {"elements": ["a"]}]"#,
        r#"[{"elements": ["a"]}, {"elements": ["a"], "message": "m"}]"#,
    ] {
        assert_eq!(configure(options), Ok(()), "{options}");
    }
}
