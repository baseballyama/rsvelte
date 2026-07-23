//! `svelte/no-target-blank` — disallow `target="_blank"` on links that point to
//! a "dangerous" (external or, when enforced, dynamic) destination without a
//! secure `rel="noopener noreferrer"`. Port of the eslint-plugin-svelte rule.
//!
//! For each element that carries a static `target="_blank"` attribute, the rule:
//!   1. skips the element when it has a *secure* `rel` (lowercased, space-split:
//!      contains `noopener` AND, unless `allowReferrer`, `noreferrer`);
//!   2. otherwise reports the `target` attribute when the link is *dangerous* —
//!      it has an external `href` (first static text part matching
//!      `/^(?:\w+:|\/\/)/`), or (with `enforceDynamicLinks === "always"`) a
//!      dynamic `href` (mustache value, shorthand `href`, or `bind:href`).
//!
//! Options (`options[0]`): `{ allowReferrer?: boolean = false,
//! enforceDynamicLinks?: "always" | "never" = "always" }`.

use rsvelte_core::ast::template::{Attribute, AttributeValue, AttributeValuePart, RegularElement};

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-target-blank",
    category: RuleCategory::Style,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "disallow `target=\"_blank\"` attribute without `rel=\"noopener noreferrer\"`",
    options_schema: Some(
        r#"{"type":"object","properties":{"allowReferrer":{"type":"boolean"},"enforceDynamicLinks":{"enum":["always","never"]}},"additionalProperties":false}"#,
    ),
};

const MESSAGE: &str =
    "Using target=\"_blank\" without rel=\"noopener noreferrer\" is a security risk.";

/// The static text value of an attribute value, if it is exactly one text part
/// (no mustaches). Mirrors upstream `getStaticAttributeValue`: a value made of a
/// single `SvelteLiteral` returns its text, anything else returns `None`.
fn static_attribute_value<'b>(value: &'b AttributeValue<'_>) -> Option<&'b str> {
    match value {
        AttributeValue::True(_) => None,
        AttributeValue::Expression(_) => None,
        AttributeValue::Sequence(parts) => match parts.as_slice() {
            [AttributeValuePart::Text(text)] => Some(text.data.as_str()),
            _ => None,
        },
    }
}

/// Whether the lowercased, space-split `rel` tag set is "secure": contains
/// `noopener` and (unless referrers are allowed) `noreferrer`.
fn is_secure_rel(rel: &str, allow_referrer: bool) -> bool {
    let tags: Vec<String> = rel.to_lowercase().split(' ').map(str::to_string).collect();
    tags.iter().any(|t| t == "noopener")
        && (allow_referrer || tags.iter().any(|t| t == "noreferrer"))
}

/// Whether a static `href` text value is an absolute/protocol URL,
/// matching `/^(?:\w+:|\/\/)/` (a `scheme:` prefix or a `//` prefix).
fn is_external_href(href: &str) -> bool {
    if href.starts_with("//") {
        return true;
    }
    // `\w+:` — one or more [A-Za-z0-9_] followed by `:`.
    let mut saw_word = false;
    for c in href.chars() {
        if c.is_ascii_alphanumeric() || c == '_' {
            saw_word = true;
            continue;
        }
        return saw_word && c == ':';
    }
    false
}

#[derive(Default)]
pub struct NoTargetBlank;

impl NoTargetBlank {
    /// `target="_blank"` (static literal exactly `_blank`).
    fn target_blank_attr<'b, 'a>(
        el: &'b RegularElement<'a>,
    ) -> Option<&'b rsvelte_core::ast::template::AttributeNode<'a>> {
        for attr in &el.attributes {
            if let Attribute::Attribute(node) = attr
                && node.name == "target"
                && static_attribute_value(&node.value) == Some("_blank")
            {
                return Some(node);
            }
        }
        None
    }

    /// True when the element has a secure `rel` attribute.
    fn has_secure_rel(el: &RegularElement, allow_referrer: bool) -> bool {
        for attr in &el.attributes {
            if let Attribute::Attribute(node) = attr
                && node.name == "rel"
            {
                // Upstream concatenates only the SvelteLiteral parts; a value
                // with a mustache contributes no tags.
                if let AttributeValue::Sequence(parts) = &node.value {
                    let mut rel = String::new();
                    for part in parts {
                        if let AttributeValuePart::Text(text) = part {
                            if !rel.is_empty() {
                                rel.push(' ');
                            }
                            rel.push_str(text.data.as_str());
                        }
                    }
                    return is_secure_rel(&rel, allow_referrer);
                }
                return false;
            }
        }
        false
    }

    /// True when any `href` attribute's first static text part is an external URL.
    fn has_external_link(el: &RegularElement) -> bool {
        for attr in &el.attributes {
            if let Attribute::Attribute(node) = attr
                && node.name == "href"
                && let AttributeValue::Sequence(parts) = &node.value
                && let Some(AttributeValuePart::Text(text)) = parts.first()
                && is_external_href(text.data.as_str())
            {
                return true;
            }
        }
        false
    }

    /// True when the link's `href` is dynamic: a mustache in the value, a
    /// shorthand `href` (`{href}`), or `bind:href`.
    fn has_dynamic_link(el: &RegularElement) -> bool {
        let mut href_attr: Option<&AttributeValue> = None;
        for attr in &el.attributes {
            match attr {
                Attribute::Attribute(node) if node.name == "href" => {
                    href_attr = Some(&node.value);
                }
                Attribute::BindDirective(bind) if bind.name == "href" => {
                    return true;
                }
                _ => {}
            }
        }
        match href_attr {
            // A normal `href` attribute: dynamic when any value part is a mustache.
            Some(AttributeValue::Sequence(parts)) => parts
                .iter()
                .any(|p| matches!(p, AttributeValuePart::ExpressionTag(_))),
            // `href={expr}` (single expression value) is also a mustache value.
            Some(AttributeValue::Expression(_)) => true,
            _ => false,
        }
    }
}

impl Rule for NoTargetBlank {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_element(&self, ctx: &mut LintContext, el: &RegularElement) {
        let allow_referrer = ctx.option_bool("allowReferrer", false);
        let enforce_dynamic_links = ctx
            .option0()
            .and_then(|o| o.get("enforceDynamicLinks"))
            .and_then(|v| v.as_str())
            .unwrap_or("always");

        let Some(target) = Self::target_blank_attr(el) else {
            return;
        };
        if Self::has_secure_rel(el, allow_referrer) {
            return;
        }

        let has_danger_href = Self::has_external_link(el)
            || (enforce_dynamic_links == "always" && Self::has_dynamic_link(el));

        if has_danger_href {
            ctx.report(target.start, target.end, MESSAGE);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::{is_external_href, is_secure_rel};

    #[test]
    fn external_href_matches_protocol_and_slashes() {
        assert!(is_external_href("https://svelte.dev/"));
        assert!(is_external_href("http://example.com"));
        assert!(is_external_href("mailto:a@b.com"));
        assert!(is_external_href("//cdn.example.com/x"));
        assert!(is_external_href("tel:123"));
    }

    #[test]
    fn external_href_rejects_relative() {
        assert!(!is_external_href("/foo"));
        assert!(!is_external_href("foo/bar"));
        assert!(!is_external_href("./a"));
        assert!(!is_external_href(""));
        assert!(!is_external_href("#anchor"));
    }

    #[test]
    fn secure_rel_requires_noopener() {
        assert!(is_secure_rel("noopener noreferrer", false));
        assert!(is_secure_rel("NoOpener NoReferrer", false));
        assert!(!is_secure_rel("noopener", false));
        assert!(!is_secure_rel("noreferrer", false));
        assert!(!is_secure_rel("noopenernoreferrer", false));
        assert!(!is_secure_rel("3", false));
    }

    #[test]
    fn secure_rel_allow_referrer_drops_noreferrer_requirement() {
        assert!(is_secure_rel("noopener", true));
        assert!(is_secure_rel("noopener noreferrer", true));
        assert!(!is_secure_rel("noreferrer", true));
    }
}
