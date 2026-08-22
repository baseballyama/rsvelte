//! `svelte/no-target-blank`.
//!
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
//!
//! The autofix is rsvelte-only — upstream reports without repairing — because
//! Svelte 5 dropped the `security-anchor-rel-noreferrer` compiler warning, so
//! this rule is now the only place the repair can live.

use rsvelte_core::ast::template::{
    Attribute, AttributeNode, AttributeValue, AttributeValuePart, Component, RegularElement,
    SlotElement, SvelteComponentElement, SvelteDynamicElement, SvelteElement, TitleElement,
};

use crate::context::LintContext;
use crate::diagnostic::{Fix, TextEdit};
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-target-blank",
    category: RuleCategory::Style,
    fixable: Fixable::Code,
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
        AttributeValue::True(_) | AttributeValue::Expression(_) => None,
        AttributeValue::Sequence(parts) => match parts.as_slice() {
            [AttributeValuePart::Text(text)] => Some(text.data.as_ref()),
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

/// The tokens a secure `rel` must carry, in the order the fix writes them.
const fn required_tags(allow_referrer: bool) -> &'static [&'static str] {
    if allow_referrer {
        &["noopener"]
    } else {
        &["noopener", "noreferrer"]
    }
}

/// The required tokens absent from `rel`. Splits exactly like [`is_secure_rel`]
/// so the fix always clears the condition that produced the report.
fn missing_tags(rel: &str, allow_referrer: bool) -> Vec<&'static str> {
    let present: Vec<String> = rel.to_lowercase().split(' ').map(str::to_string).collect();
    required_tags(allow_referrer)
        .iter()
        .copied()
        .filter(|tag| !present.iter().any(|p| p == tag))
        .collect()
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
        attrs: &'b [Attribute<'a>],
    ) -> Option<&'b rsvelte_core::ast::template::AttributeNode<'a>> {
        for attr in attrs {
            if let Attribute::Attribute(node) = attr
                && node.name == "target"
                && static_attribute_value(&node.value) == Some("_blank")
            {
                return Some(node);
            }
        }
        None
    }

    /// The element's first `rel` attribute — the one `has_secure_rel` judges.
    fn rel_attr<'b, 'a>(attrs: &'b [Attribute<'a>]) -> Option<&'b AttributeNode<'a>> {
        attrs.iter().find_map(|attr| match attr {
            Attribute::Attribute(node) if node.name == "rel" => Some(node),
            _ => None,
        })
    }

    /// True when the element has a secure `rel` attribute.
    fn has_secure_rel(attrs: &[Attribute], allow_referrer: bool) -> bool {
        let Some(node) = Self::rel_attr(attrs) else {
            return false;
        };
        // Upstream concatenates only the SvelteLiteral parts; a value with a
        // mustache contributes no tags.
        let AttributeValue::Sequence(parts) = &node.value else {
            return false;
        };
        let mut rel = String::new();
        for part in parts {
            if let AttributeValuePart::Text(text) = part {
                if !rel.is_empty() {
                    rel.push(' ');
                }
                rel.push_str(text.data.as_ref());
            }
        }
        is_secure_rel(&rel, allow_referrer)
    }

    /// True when any `href` attribute's first static text part is an external URL.
    fn has_external_link(attrs: &[Attribute]) -> bool {
        for attr in attrs {
            if let Attribute::Attribute(node) = attr
                && node.name == "href"
                && let AttributeValue::Sequence(parts) = &node.value
                && let Some(AttributeValuePart::Text(text)) = parts.first()
                && is_external_href(text.data.as_ref())
            {
                return true;
            }
        }
        false
    }

    /// True when the link's `href` is dynamic: a mustache in the value, a
    /// shorthand `href` (`{href}`), or `bind:href`.
    fn has_dynamic_link(attrs: &[Attribute]) -> bool {
        let mut href_attr: Option<&AttributeValue> = None;
        for attr in attrs {
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

    /// The repair: add the missing `rel` tokens. `None` when the existing `rel`
    /// is dynamic (or otherwise not a single literal), since rewriting a
    /// mustache would be a guess.
    fn build_fix(
        source: &str,
        attrs: &[Attribute],
        target: &AttributeNode,
        allow_referrer: bool,
    ) -> Option<Fix> {
        let Some(rel) = Self::rel_attr(attrs) else {
            let tags = required_tags(allow_referrer).join(" ");
            return Some(Fix {
                message: format!("Add rel=\"{tags}\""),
                edits: vec![TextEdit {
                    start: target.end,
                    end: target.end,
                    new_text: format!(" rel=\"{tags}\""),
                }],
            });
        };

        // A valueless `rel` carries no tokens, so the whole attribute is rewritten.
        let parts = match &rel.value {
            AttributeValue::True(_) => {
                let tags = required_tags(allow_referrer).join(" ");
                return Some(Fix {
                    message: format!("Add rel=\"{tags}\""),
                    edits: vec![TextEdit {
                        start: rel.start,
                        end: rel.end,
                        new_text: format!("rel=\"{tags}\""),
                    }],
                });
            }
            AttributeValue::Expression(_) => return None,
            AttributeValue::Sequence(parts) => parts,
        };

        let (value_start, value_end, existing) = match parts.as_slice() {
            // An empty `Sequence` is `rel=""`: with no text node to replace, the
            // tokens go in the empty slot just inside the closing quote.
            [] => {
                let slot = rel.end.checked_sub(1)?;
                if !matches!(source.as_bytes().get(slot as usize), Some(b'"' | b'\'')) {
                    return None;
                }
                (slot, slot, "")
            }
            [AttributeValuePart::Text(text)] => (
                text.start,
                text.end,
                source.get(text.start as usize..text.end as usize)?,
            ),
            _ => return None,
        };

        let missing = missing_tags(existing, allow_referrer);
        if missing.is_empty() {
            return None;
        }
        let added = missing.join(" ");
        let extended = if existing.is_empty() {
            added.clone()
        } else {
            format!("{existing} {added}")
        };
        // An unquoted value cannot hold a space, so extending it needs quotes.
        let quoted = matches!(
            value_start
                .checked_sub(1)
                .and_then(|i| source.as_bytes().get(i as usize)),
            Some(b'"' | b'\'')
        );
        let new_text = if quoted {
            extended
        } else {
            format!("\"{extended}\"")
        };

        Some(Fix {
            message: format!("Add {added} to rel"),
            edits: vec![TextEdit {
                start: value_start,
                end: value_end,
                new_text,
            }],
        })
    }
}

impl Rule for NoTargetBlank {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_element(&self, ctx: &mut LintContext, el: &RegularElement) {
        check_attributes(ctx, &el.attributes);
    }

    // Upstream listens on `SvelteAttribute`, so the check applies to every kind
    // of start tag, not just HTML elements.
    fn check_component(&self, ctx: &mut LintContext, c: &Component) {
        check_attributes(ctx, &c.attributes);
    }

    fn check_svelte_element(&self, ctx: &mut LintContext, el: &SvelteElement) {
        check_attributes(ctx, &el.attributes);
    }

    fn check_svelte_component(&self, ctx: &mut LintContext, el: &SvelteComponentElement) {
        check_attributes(ctx, &el.attributes);
    }

    fn check_svelte_dynamic_element(&self, ctx: &mut LintContext, el: &SvelteDynamicElement) {
        check_attributes(ctx, &el.attributes);
    }

    fn check_slot(&self, ctx: &mut LintContext, el: &SlotElement) {
        check_attributes(ctx, &el.attributes);
    }

    fn check_title(&self, ctx: &mut LintContext, el: &TitleElement) {
        check_attributes(ctx, &el.attributes);
    }
}

fn check_attributes(ctx: &mut LintContext, attrs: &[Attribute]) {
    let allow_referrer = ctx.option_bool("allowReferrer", false);
    let enforce_dynamic_links = ctx
        .option0()
        .and_then(|o| o.get("enforceDynamicLinks"))
        .and_then(|v| v.as_str())
        .unwrap_or("always");

    let Some(target) = NoTargetBlank::target_blank_attr(attrs) else {
        return;
    };
    if NoTargetBlank::has_secure_rel(attrs, allow_referrer) {
        return;
    }

    let has_danger_href = NoTargetBlank::has_external_link(attrs)
        || (enforce_dynamic_links == "always" && NoTargetBlank::has_dynamic_link(attrs));

    if !has_danger_href {
        return;
    }

    match NoTargetBlank::build_fix(ctx.source(), attrs, target, allow_referrer) {
        Some(fix) => ctx.report_with_fix(target.start, target.end, MESSAGE, fix),
        None => ctx.report(target.start, target.end, MESSAGE),
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

    #[test]
    fn missing_tags_reports_only_absent_tokens() {
        use super::missing_tags;
        assert_eq!(missing_tags("", false), ["noopener", "noreferrer"]);
        assert_eq!(missing_tags("noopener", false), ["noreferrer"]);
        assert_eq!(missing_tags("NOREFERRER", false), ["noopener"]);
        assert!(missing_tags("noopener noreferrer", false).is_empty());
        assert!(missing_tags("noopener", true).is_empty());
        assert_eq!(missing_tags("noreferrer", true), ["noopener"]);
        // Same splitting as `is_secure_rel`, so the fix always clears the report.
        assert_eq!(
            missing_tags("noopenernoreferrer", false),
            ["noopener", "noreferrer"]
        );
    }

    #[cfg(feature = "native")]
    mod fix {
        use serde_json::json;

        use crate::config::LintConfig;
        use crate::rule::Severity;
        use crate::runner::fix_source;

        fn config(allow_referrer: bool) -> LintConfig {
            let cfg = LintConfig::empty().with_override("svelte/no-target-blank", Severity::Error);
            if allow_referrer {
                cfg.with_options("svelte/no-target-blank", json!([{"allowReferrer": true}]))
            } else {
                cfg
            }
        }

        #[track_caller]
        fn fixed(src: &str) -> String {
            fix_source(src, &config(false)).output
        }

        #[track_caller]
        fn fixed_allow_referrer(src: &str) -> String {
            fix_source(src, &config(true)).output
        }

        #[test]
        fn adds_rel_when_absent() {
            assert_eq!(
                fixed(r#"<a href="https://svelte.dev/" target="_blank">x</a>"#),
                r#"<a href="https://svelte.dev/" target="_blank" rel="noopener noreferrer">x</a>"#
            );
        }

        #[test]
        fn inserts_after_target_not_at_tag_end() {
            assert_eq!(
                fixed(r#"<a target="_blank" href="https://svelte.dev/">x</a>"#),
                r#"<a target="_blank" rel="noopener noreferrer" href="https://svelte.dev/">x</a>"#
            );
        }

        #[test]
        fn extends_partial_rel_keeping_existing_tokens() {
            assert_eq!(
                fixed(r#"<a href="https://svelte.dev/" target="_blank" rel="noopener">x</a>"#),
                r#"<a href="https://svelte.dev/" target="_blank" rel="noopener noreferrer">x</a>"#
            );
            assert_eq!(
                fixed(r#"<a href="https://svelte.dev/" target="_blank" rel="noreferrer">x</a>"#),
                r#"<a href="https://svelte.dev/" target="_blank" rel="noreferrer noopener">x</a>"#
            );
            assert_eq!(
                fixed(r#"<a href="https://svelte.dev/" target="_blank" rel="nofollow">x</a>"#),
                r#"<a href="https://svelte.dev/" target="_blank" rel="nofollow noopener noreferrer">x</a>"#
            );
        }

        #[test]
        fn preserves_quoting_style() {
            assert_eq!(
                fixed("<a href=\"https://svelte.dev/\" target=\"_blank\" rel='noopener'>x</a>"),
                "<a href=\"https://svelte.dev/\" target=\"_blank\" rel='noopener noreferrer'>x</a>"
            );
            // An unquoted value cannot hold a space, so the fix adds quotes.
            assert_eq!(
                fixed(r#"<a href="https://svelte.dev/" target="_blank" rel=noopener>x</a>"#),
                r#"<a href="https://svelte.dev/" target="_blank" rel="noopener noreferrer">x</a>"#
            );
            assert_eq!(
                fixed(r#"<a href="https://svelte.dev/" target="_blank" rel="">x</a>"#),
                r#"<a href="https://svelte.dev/" target="_blank" rel="noopener noreferrer">x</a>"#
            );
        }

        #[test]
        fn rewrites_valueless_rel() {
            assert_eq!(
                fixed(r#"<a href="https://svelte.dev/" target="_blank" rel>x</a>"#),
                r#"<a href="https://svelte.dev/" target="_blank" rel="noopener noreferrer">x</a>"#
            );
        }

        #[test]
        fn leaves_dynamic_rel_alone() {
            for src in [
                r#"<a href="https://svelte.dev/" target="_blank" rel={rel}>x</a>"#,
                r#"<a href="https://svelte.dev/" target="_blank" rel="a {b}">x</a>"#,
                r#"<a href="https://svelte.dev/" target="_blank" {rel}>x</a>"#,
            ] {
                let res = fix_source(src, &config(false));
                assert_eq!(res.applied, 0, "unexpected fix for {src}");
                assert_eq!(res.output, src);
            }
        }

        #[test]
        fn allow_referrer_only_adds_noopener() {
            assert_eq!(
                fixed_allow_referrer(r#"<a href="https://svelte.dev/" target="_blank">x</a>"#),
                r#"<a href="https://svelte.dev/" target="_blank" rel="noopener">x</a>"#
            );
            assert_eq!(
                fixed_allow_referrer(
                    r#"<a href="https://svelte.dev/" target="_blank" rel="noreferrer">x</a>"#
                ),
                r#"<a href="https://svelte.dev/" target="_blank" rel="noreferrer noopener">x</a>"#
            );
        }

        #[test]
        fn secure_and_safe_links_are_untouched() {
            for src in [
                r#"<a href="https://svelte.dev/" target="_blank" rel="noopener noreferrer">x</a>"#,
                r#"<a href="/local" target="_blank">x</a>"#,
                r#"<a href="https://svelte.dev/">x</a>"#,
            ] {
                let res = fix_source(src, &config(false));
                assert_eq!(res.applied, 0, "unexpected fix for {src}");
                assert_eq!(res.output, src);
            }
        }

        #[test]
        fn fixes_the_whole_upstream_invalid_fixture() {
            let src = concat!(
                "<a href=\"https://svelte.dev/\" target=\"_blank\">link</a>\n",
                "<a href=\"https://svelte.dev/\" target=\"_blank\" rel=\"noopenernoreferrer\">link</a>\n",
                "<a href={link} target=\"_blank\" rel=\"3\">link</a>\n",
                "<a href={link} target=\"_blank\">link</a>\n",
                "<a href=\"https://svelte.dev/\" target=\"_blank\" rel=\"noopener\">link</a>\n",
            );
            let out = fix_source(src, &config(false)).output;
            assert_eq!(
                out,
                concat!(
                    "<a href=\"https://svelte.dev/\" target=\"_blank\" rel=\"noopener noreferrer\">link</a>\n",
                    "<a href=\"https://svelte.dev/\" target=\"_blank\" rel=\"noopenernoreferrer noopener noreferrer\">link</a>\n",
                    "<a href={link} target=\"_blank\" rel=\"3 noopener noreferrer\">link</a>\n",
                    "<a href={link} target=\"_blank\" rel=\"noopener noreferrer\">link</a>\n",
                    "<a href=\"https://svelte.dev/\" target=\"_blank\" rel=\"noopener noreferrer\">link</a>\n",
                )
            );
            // The fixed source no longer reports.
            assert_eq!(fix_source(&out, &config(false)).applied, 0);
        }
    }
}
