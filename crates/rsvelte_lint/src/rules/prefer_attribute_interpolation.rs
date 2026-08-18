//! `svelte/prefer-attribute-interpolation`.
//!
//! Port of eslint-plugin-svelte's rule: a whole attribute value that is an
//! interpolated template literal is clearer as attribute interpolation.

use serde_json::Value;

use rsvelte_core::ast::template::{Attribute, AttributeValue, AttributeValuePart, ExpressionTag};

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::rules::js_tokens;

static META: RuleMeta = RuleMeta {
    name: "svelte/prefer-attribute-interpolation",
    category: RuleCategory::Style,
    fixable: Fixable::No,
    default_severity: Severity::Off,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "require attribute interpolation instead of template literals",
    options_schema: Some("[]"),
};

const MESSAGE: &str = "Prefer attribute interpolation over a template literal.";

fn has_useful_string_escape(raw: &str, cooked: &str) -> bool {
    if raw == cooked {
        return false;
    }
    let mut chars = raw.chars();
    while let Some(c) = chars.next() {
        if c == '\\' {
            match chars.next() {
                None => return true,
                Some(next) if "nrvtbfux".contains(next) => return true,
                Some(_) => {}
            }
        }
    }
    false
}

fn has_disallowed_quasi(quasi: &Value) -> bool {
    let value = quasi.get("value");
    let Some(raw) = value.and_then(|v| v.get("raw")).and_then(Value::as_str) else {
        return true;
    };
    let cooked = value
        .and_then(|v| v.get("cooked"))
        .and_then(Value::as_str)
        .unwrap_or(raw);
    raw.contains(['\n', '\r', '{']) || has_useful_string_escape(raw, cooked)
}

fn should_report(ctx: &LintContext, tag: &ExpressionTag) -> bool {
    let expression = tag.expression.as_json();
    if expression.get("type").and_then(Value::as_str) != Some("TemplateLiteral") {
        return false;
    }
    if expression
        .get("expressions")
        .and_then(Value::as_array)
        .is_none_or(Vec::is_empty)
    {
        return false;
    }
    if expression
        .get("quasis")
        .and_then(Value::as_array)
        .is_none_or(|quasis| quasis.iter().any(has_disallowed_quasi))
    {
        return false;
    }
    // Upstream tokenizes the whole mustache, so a comment anywhere between the
    // braces — not only inside a `${…}` — exempts it.
    !js_tokens::has_comment(ctx.slice(tag.start, tag.end))
}

#[derive(Default)]
pub struct PreferAttributeInterpolation;

impl Rule for PreferAttributeInterpolation {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_attribute(&self, ctx: &mut LintContext, attr: &Attribute) {
        let Attribute::Attribute(node) = attr else {
            return;
        };
        let tag = match &node.value {
            AttributeValue::Expression(tag) => tag,
            // Quoted `attr="{`...`}"` is represented as a sequence even when
            // its sole value is the mustache tag.
            AttributeValue::Sequence(parts) => match parts.as_slice() {
                [AttributeValuePart::ExpressionTag(tag)] => tag,
                _ => return,
            },
            AttributeValue::True(_) => return,
        };
        if should_report(ctx, tag) {
            ctx.report(tag.start, tag.end, MESSAGE);
        }
    }
}

#[cfg(test)]
mod tests {
    use std::path::Path;

    use super::*;
    use crate::{LintConfig, Severity, lint_source_raw};

    fn findings(source: &str) -> Vec<crate::LintDiagnostic> {
        let config = LintConfig::empty()
            .with_override("svelte/prefer-attribute-interpolation", Severity::Error);
        lint_source_raw(source, Path::new("App.svelte"), &config)
            .into_iter()
            .filter(|d| d.rule == "svelte/prefer-attribute-interpolation")
            .collect()
    }

    #[test]
    fn useful_escapes_follow_upstream_semantics() {
        assert!(has_useful_string_escape("\\n", "\n"));
        assert!(!has_useful_string_escape("\\\\", "\\"));
        assert!(!has_useful_string_escape("plain", "plain"));
    }

    #[test]
    fn comments_in_the_mustache_are_distinguished_from_template_text() {
        assert!(js_tokens::has_comment("{`prefix${/* comment */ foo}`}"));
        assert!(js_tokens::has_comment("{/* comment */ `prefix${foo}`}"));
        assert!(js_tokens::has_comment("{`prefix${foo}` /* comment */}"));
        assert!(!js_tokens::has_comment("{`prefix /* text */ ${foo}`}"));
        // A `//` inside a regex literal is not a comment.
        assert!(!js_tokens::has_comment("{`v${s.split(/\\/\\//)[0]}`}"));
    }

    #[test]
    fn reports_only_safe_whole_attribute_template_literals() {
        let reports = findings(
            r#"<Foo attr={`prefix${foo}`} />
<div data-text={`prefix${foo}${bar}`} />
<div data-text="prefix {`foo${foo}`} suffix" />
<div data-text={`prefix${/* comment */ foo}`} />
<div data-text={/* comment */ `prefix${foo}`} />
<div data-text={`line\n${foo}`} />
<div data-text={`prefix{${foo}`} />
<div style:color={`rgb(${foo})`} />
<div data-text={'prefix' + foo} />
<div data-text={`static`} />"#,
        );
        assert_eq!(reports.len(), 2, "{reports:?}");
        assert_eq!(reports[0].message, MESSAGE);
    }
}
