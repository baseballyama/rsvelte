//! `svelte/no-shorthand-style-property-overrides`.
//!
//! `svelte/no-shorthand-style-property-overrides` — flag a CSS shorthand
//! property that overrides a related longhand declared earlier on the same
//! element (across the static `style="…"` attribute and `style:` directives, in
//! source order). Port of the eslint-plugin-svelte rule.
//!
//! The static `style="…"` value is parsed by splitting on `;` and reading the
//! property name before each `:` (interpolation `{expr}` segments are handled
//! by extracting CSS property names from string/template literals within
//! conditional/logical expressions, mirroring upstream's `getAllInlineStyles`).

use std::collections::HashSet;

use rsvelte_core::ast::template::{
    Attribute, Component, RegularElement, SlotElement, SvelteComponentElement,
    SvelteDynamicElement, SvelteElement,
};

use super::shared::style_decls::style_decl_sets;
use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-shorthand-style-property-overrides",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Error,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow shorthand style properties that override related longhand properties",
    options_schema: None,
};

/// shorthand → related longhand properties. Mirrors upstream `SHORTHAND_PROPERTIES`.
#[rustfmt::skip]
const SHORTHAND_PROPERTIES: &[(&str, &[&str])] = &[
    ("margin", &["margin-top", "margin-bottom", "margin-left", "margin-right"]),
    ("padding", &["padding-top", "padding-bottom", "padding-left", "padding-right"]),
    ("background", &["background-image", "background-size", "background-position", "background-repeat", "background-origin", "background-clip", "background-attachment", "background-color"]),
    ("font", &["font-style", "font-variant", "font-weight", "font-stretch", "font-size", "font-family", "line-height"]),
    ("border", &["border-top-width", "border-bottom-width", "border-left-width", "border-right-width", "border-top-style", "border-bottom-style", "border-left-style", "border-right-style", "border-top-color", "border-bottom-color", "border-left-color", "border-right-color"]),
    ("border-top", &["border-top-width", "border-top-style", "border-top-color"]),
    ("border-bottom", &["border-bottom-width", "border-bottom-style", "border-bottom-color"]),
    ("border-left", &["border-left-width", "border-left-style", "border-left-color"]),
    ("border-right", &["border-right-width", "border-right-style", "border-right-color"]),
    ("border-width", &["border-top-width", "border-bottom-width", "border-left-width", "border-right-width"]),
    ("border-style", &["border-top-style", "border-bottom-style", "border-left-style", "border-right-style"]),
    ("border-color", &["border-top-color", "border-bottom-color", "border-left-color", "border-right-color"]),
    ("list-style", &["list-style-type", "list-style-position", "list-style-image"]),
    ("border-radius", &["border-top-right-radius", "border-top-left-radius", "border-bottom-right-radius", "border-bottom-left-radius"]),
    ("transition", &["transition-delay", "transition-duration", "transition-property", "transition-timing-function"]),
    ("animation", &["animation-name", "animation-duration", "animation-timing-function", "animation-delay", "animation-iteration-count", "animation-direction", "animation-fill-mode", "animation-play-state"]),
    ("border-block-end", &["border-block-end-width", "border-block-end-style", "border-block-end-color"]),
    ("border-block-start", &["border-block-start-width", "border-block-start-style", "border-block-start-color"]),
    ("border-image", &["border-image-source", "border-image-slice", "border-image-width", "border-image-outset", "border-image-repeat"]),
    ("border-inline-end", &["border-inline-end-width", "border-inline-end-style", "border-inline-end-color"]),
    ("border-inline-start", &["border-inline-start-width", "border-inline-start-style", "border-inline-start-color"]),
    ("column-rule", &["column-rule-width", "column-rule-style", "column-rule-color"]),
    ("columns", &["column-width", "column-count"]),
    ("flex", &["flex-grow", "flex-shrink", "flex-basis"]),
    ("flex-flow", &["flex-direction", "flex-wrap"]),
    ("grid", &["grid-template-rows", "grid-template-columns", "grid-template-areas", "grid-auto-rows", "grid-auto-columns", "grid-auto-flow", "grid-column-gap", "grid-row-gap"]),
    ("grid-area", &["grid-row-start", "grid-column-start", "grid-row-end", "grid-column-end"]),
    ("grid-column", &["grid-column-start", "grid-column-end"]),
    ("grid-gap", &["grid-row-gap", "grid-column-gap"]),
    ("grid-row", &["grid-row-start", "grid-row-end"]),
    ("grid-template", &["grid-template-columns", "grid-template-rows", "grid-template-areas"]),
    ("outline", &["outline-color", "outline-style", "outline-width"]),
    ("text-decoration", &["text-decoration-color", "text-decoration-style", "text-decoration-line"]),
    ("text-emphasis", &["text-emphasis-style", "text-emphasis-color"]),
    ("mask", &["mask-image", "mask-mode", "mask-position", "mask-size", "mask-repeat", "mask-origin", "mask-clip", "mask-composite"]),
];

fn longhands_of(normalized: &str) -> Option<&'static [&'static str]> {
    SHORTHAND_PROPERTIES
        .iter()
        .find(|(k, _)| *k == normalized)
        .map(|(_, v)| *v)
}

/// The `-vendor-` prefix of `prop` (matching `/^-\w+-/`), or "".
fn vendor_prefix(prop: &str) -> &str {
    let b = prop.as_bytes();
    if b.first() != Some(&b'-') {
        return "";
    }
    let mut i = 1;
    while i < b.len() && (b[i].is_ascii_alphanumeric() || b[i] == b'_') {
        i += 1;
    }
    if i < b.len() && i > 1 && b[i] == b'-' {
        &prop[..=i]
    } else {
        ""
    }
}

#[derive(Default)]
pub struct NoShorthandStylePropertyOverrides;

fn check_start_tag(ctx: &mut LintContext, attributes: &[Attribute]) {
    let source = ctx.source();
    let sets = style_decl_sets(attributes, source);

    let mut before: HashSet<String> = HashSet::new();
    let mut reports: Vec<(u32, u32, String)> = Vec::new();

    for set in &sets {
        for decl in set {
            let prefix = vendor_prefix(&decl.prop);
            let normalized = &decl.prop[prefix.len()..];
            if let Some(longhands) = longhands_of(normalized) {
                for lh in longhands {
                    let with_prefix = format!("{prefix}{lh}");
                    if before.contains(&with_prefix) {
                        reports.push((
                            decl.start,
                            decl.end,
                            format!(
                                "Unexpected shorthand '{}' after '{with_prefix}'.",
                                decl.prop
                            ),
                        ));
                    }
                }
            }
        }
        for decl in set {
            before.insert(decl.prop.clone());
        }
    }

    for (start, end, msg) in reports {
        ctx.report(start, end, msg);
    }
}

impl Rule for NoShorthandStylePropertyOverrides {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_element(&self, ctx: &mut LintContext, el: &RegularElement) {
        check_start_tag(ctx, &el.attributes);
    }

    fn check_component(&self, ctx: &mut LintContext, c: &Component) {
        check_start_tag(ctx, &c.attributes);
    }

    fn check_svelte_component(&self, ctx: &mut LintContext, el: &SvelteComponentElement) {
        check_start_tag(ctx, &el.attributes);
    }

    fn check_svelte_dynamic_element(&self, ctx: &mut LintContext, el: &SvelteDynamicElement) {
        check_start_tag(ctx, &el.attributes);
    }

    fn check_svelte_element(&self, ctx: &mut LintContext, el: &SvelteElement) {
        check_start_tag(ctx, &el.attributes);
    }

    fn check_slot(&self, ctx: &mut LintContext, el: &SlotElement) {
        check_start_tag(ctx, &el.attributes);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn vendor_prefix_detection() {
        assert_eq!(vendor_prefix("-webkit-mask"), "-webkit-");
        assert_eq!(vendor_prefix("background"), "");
        assert_eq!(vendor_prefix("-x"), "");
    }

    #[test]
    fn longhand_lookup() {
        assert!(
            longhands_of("background")
                .unwrap()
                .contains(&"background-repeat")
        );
        assert!(longhands_of("color").is_none());
    }
}
