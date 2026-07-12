//! `svelte/no-dupe-style-properties` — flag a CSS property that is declared
//! more than once on the same element, across both the static `style="…"`
//! attribute and `style:` directives. Port of the eslint-plugin-svelte rule.
//!
//! The static value is parsed by splitting on `;` and reading the name before
//! each `:`; interpolation segments (`{expr}`) are handled by extracting CSS
//! property names from string/template literals within conditional/logical
//! expressions inside the mustache, mirroring the upstream `getAllInlineStyles`
//! behaviour.

use rsvelte_core::ast::template::{Attribute, AttributeValue, AttributeValuePart, RegularElement};

use super::shared::style_decls::{extract_inline_style_decls, parse_style_decls};
use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-dupe-style-properties",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Error,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow duplicate style properties on an element",
    options_schema: None,
};

#[derive(Default)]
pub struct NoDupeStyleProperties;

impl Rule for NoDupeStyleProperties {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_element(&self, ctx: &mut LintContext, el: &RegularElement) {
        // Collect every property declaration occurrence: (name, start, end).
        // For expression tags (mustache), property declarations from all
        // string/template literal branches are grouped into one "set" so that
        // duplicates between branches of a ternary are reported together —
        // matching the oracle's `iterateStyleDeclSetFromStyleRoot` / `inline`
        // handling.
        //
        // Each element of `sets` is a Vec of declarations from one logical
        // "source" (one Text chunk or one ExpressionTag inline group).
        let mut sets: Vec<Vec<(String, u32, u32)>> = Vec::new();
        for attr in &el.attributes {
            match attr {
                Attribute::Attribute(node) if node.name.eq_ignore_ascii_case("style") => {
                    if let AttributeValue::Sequence(parts) = &node.value {
                        for part in parts {
                            match part {
                                AttributeValuePart::Text(t) => {
                                    let decls = parse_style_decls(&t.raw, t.start);
                                    for d in decls {
                                        sets.push(vec![d]);
                                    }
                                }
                                AttributeValuePart::ExpressionTag(tag) => {
                                    // The expression tag source is `{expr}`.
                                    // Extract CSS declarations from string/template
                                    // literals in the expression.
                                    let src = ctx.slice(tag.start, tag.end);
                                    let inline = extract_inline_style_decls(src, tag.start);
                                    if !inline.is_empty() {
                                        sets.push(inline);
                                    }
                                }
                            }
                        }
                    }
                }
                Attribute::StyleDirective(d) => {
                    let name_start = d.start + "style:".len() as u32;
                    sets.push(vec![(
                        d.name.to_string(),
                        name_start,
                        name_start + d.name.len() as u32,
                    )]);
                }
                _ => {}
            }
        }

        // Walk the sets in order, keeping track of which property names were
        // seen in earlier sets.  When a set introduces a name that was already
        // seen, report ALL occurrences of that name (both the earlier one(s)
        // and the current set's declaration), but report each occurrence at
        // most once.
        let mut before: Vec<(String, u32, u32)> = Vec::new();
        let mut reported: std::collections::HashSet<u32> = std::collections::HashSet::new();

        for set in &sets {
            for (name, start, end) in set {
                // Look for a prior occurrence.
                let dup_before = before.iter().find(|(n, ..)| n == name);
                if let Some((_, ps, pe)) = dup_before {
                    // Report the first (prior) occurrence if not yet reported.
                    if reported.insert(*ps) {
                        ctx.report(*ps, *pe, format!("Duplicate property '{name}'."));
                    }
                    // Report this occurrence if not yet reported.
                    if reported.insert(*start) {
                        ctx.report(*start, *end, format!("Duplicate property '{name}'."));
                    }
                }
            }
            // Add current set to the "before" list.
            before.extend(set.iter().cloned());
        }
    }
}
