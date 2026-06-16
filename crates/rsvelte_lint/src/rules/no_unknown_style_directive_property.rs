//! `svelte/no-unknown-style-directive-property` — flag a `style:property`
//! directive whose property is not a known CSS property. Port of the
//! eslint-plugin-svelte rule.
//!
//! A name is valid when it: is a CSS custom property (`--x`), is in the
//! `known-css-properties` set, matches one of the `ignoreProperties` patterns,
//! or (when `ignorePrefixed`, default `true`) carries a vendor prefix.

use std::sync::LazyLock;

use rsvelte_core::ast::template::Attribute;
use serde_json::Value;

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::rules::known_css_properties::KNOWN_CSS_PROPERTIES;

static META: RuleMeta = RuleMeta {
    name: "svelte/no-unknown-style-directive-property",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow unknown `style:property` directives",
    options_schema: Some(
        r#"{ "type": "object", "properties": {
            "ignoreProperties": { "type": "array", "items": { "type": "string" }, "uniqueItems": true, "minItems": 1 },
            "ignorePrefixed": { "type": "boolean" }
        }, "additionalProperties": false }"#,
    ),
};

static KNOWN: LazyLock<std::collections::HashSet<&'static str>> =
    LazyLock::new(|| KNOWN_CSS_PROPERTIES.iter().copied().collect());

/// Whether `prop` carries a vendor prefix (`/^-\w+-/`).
fn has_vendor_prefix(prop: &str) -> bool {
    let b = prop.as_bytes();
    if b.first() != Some(&b'-') {
        return false;
    }
    let mut i = 1;
    while i < b.len() && (b[i].is_ascii_alphanumeric() || b[i] == b'_') {
        i += 1;
    }
    i > 1 && i < b.len() && b[i] == b'-'
}

/// An `ignoreProperties` matcher: a `/pattern/flags` string compiles to a regex;
/// any other string matches exactly. Mirrors upstream `toRegExp`.
enum Matcher {
    Exact(String),
    Re(regex::Regex),
}

impl Matcher {
    fn from_option(s: &str) -> Matcher {
        if let Some(rest) = s.strip_prefix('/')
            && let Some(slash) = rest.rfind('/')
        {
            let pat = &rest[..slash];
            let flags = &rest[slash + 1..];
            let mut builder = regex::RegexBuilder::new(pat);
            if flags.contains('i') {
                builder.case_insensitive(true);
            }
            if flags.contains('s') {
                builder.dot_matches_new_line(true);
            }
            if flags.contains('m') {
                builder.multi_line(true);
            }
            if let Ok(re) = builder.build() {
                return Matcher::Re(re);
            }
        }
        Matcher::Exact(s.to_string())
    }

    fn test(&self, name: &str) -> bool {
        match self {
            Matcher::Exact(e) => e == name,
            Matcher::Re(re) => re.is_match(name),
        }
    }
}

#[derive(Default)]
pub struct NoUnknownStyleDirectiveProperty;

impl Rule for NoUnknownStyleDirectiveProperty {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_attribute(&self, ctx: &mut LintContext, attr: &Attribute) {
        let Attribute::StyleDirective(d) = attr else {
            return;
        };
        let prop = d.name.as_str();

        let opt = ctx.option0();
        let ignore_prefixed = opt
            .and_then(|o| o.get("ignorePrefixed"))
            .and_then(Value::as_bool)
            .unwrap_or(true);
        let ignore_matchers: Vec<Matcher> = opt
            .and_then(|o| o.get("ignoreProperties"))
            .and_then(Value::as_array)
            .map(|a| {
                a.iter()
                    .filter_map(Value::as_str)
                    .map(Matcher::from_option)
                    .collect()
            })
            .unwrap_or_default();

        let valid = prop.starts_with("--")
            || KNOWN.contains(prop)
            || ignore_matchers.iter().any(|m| m.test(prop))
            || (ignore_prefixed && has_vendor_prefix(prop));
        if valid {
            return;
        }
        // Report at the property name (after the `style:` prefix).
        let name_start = d.start + "style:".len() as u32;
        ctx.report(
            name_start,
            name_start + prop.len() as u32,
            format!("Unexpected unknown style directive property '{prop}'."),
        );
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn known_and_custom_and_prefixed() {
        assert!(KNOWN.contains("color"));
        assert!(!KNOWN.contains("unknown-color"));
        assert!(has_vendor_prefix("-webkit-transform"));
        assert!(!has_vendor_prefix("transform"));
    }

    #[test]
    fn matcher_exact_and_regex() {
        assert!(Matcher::from_option("foo").test("foo"));
        assert!(!Matcher::from_option("foo").test("foo-bar"));
        let re = Matcher::from_option("/^bar/");
        assert!(re.test("bar"));
        assert!(re.test("bar-foo"));
        assert!(!re.test("foo-bar"));
    }
}
