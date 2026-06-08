//! `svelte/no-dupe-style-properties` — flag a CSS property that is declared
//! more than once on the same element, across both the static `style="…"`
//! attribute and `style:` directives. Port of the eslint-plugin-svelte rule.
//!
//! The static value is parsed by splitting on `;` and reading the name before
//! each `:`; interpolation segments (`{expr}`) are treated as opaque values, so
//! `style="background: green; background: {x}"` still sees two `background`
//! declarations. (The plugin additionally collapses ternary branches *inside*
//! an interpolation — not yet ported; such cases are skipped by the oracle.)

use rsvelte_core::ast::template::{Attribute, AttributeValue, AttributeValuePart, RegularElement};

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
        let mut occ: Vec<(String, u32, u32)> = Vec::new();
        for attr in &el.attributes {
            match attr {
                Attribute::Attribute(node) if node.name.eq_ignore_ascii_case("style") => {
                    if let AttributeValue::Sequence(parts) = &node.value {
                        for part in parts {
                            if let AttributeValuePart::Text(t) = part {
                                occ.extend(parse_style_decls(&t.raw, t.start));
                            }
                        }
                    }
                }
                Attribute::StyleDirective(d) => {
                    occ.push((d.name.to_string(), d.start, d.end));
                }
                _ => {}
            }
        }

        // Report every occurrence of a name that appears more than once.
        for (i, (name, start, end)) in occ.iter().enumerate() {
            let dup = occ
                .iter()
                .enumerate()
                .any(|(j, (other, ..))| j != i && other == name);
            if dup {
                ctx.report(*start, *end, format!("Duplicate property '{name}'."));
            }
        }
    }
}

/// Parse `prop: value; prop2: value2` declarations from a raw style string,
/// returning each property name with its absolute byte span.
fn parse_style_decls(raw: &str, base: u32) -> Vec<(String, u32, u32)> {
    let mut out = Vec::new();
    let mut decl_begin = 0usize;
    let bytes = raw.as_bytes();
    for i in 0..=bytes.len() {
        let at_end = i == bytes.len();
        if at_end || bytes[i] == b';' {
            if decl_begin < i {
                push_decl(&raw[decl_begin..i], base + decl_begin as u32, &mut out);
            }
            decl_begin = i + 1;
        }
    }
    out
}

fn push_decl(seg: &str, seg_base: u32, out: &mut Vec<(String, u32, u32)>) {
    let Some(colon) = seg.find(':') else {
        return;
    };
    let name_raw = &seg[..colon];
    let trimmed = name_raw.trim();
    if trimmed.is_empty() {
        return;
    }
    let lead = name_raw.len() - name_raw.trim_start().len();
    let start = seg_base + lead as u32;
    let end = start + trimmed.len() as u32;
    out.push((trimmed.to_string(), start, end));
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_declaration_names_and_spans() {
        // "background: green; color: red" → background@0, color@19
        let decls = parse_style_decls("background: green; color: red", 100);
        assert_eq!(decls[0].0, "background");
        assert_eq!(decls[0].1, 100);
        assert_eq!(decls[1].0, "color");
    }

    #[test]
    fn dangling_declaration_before_mustache_counts() {
        // "background: green; background: " (value would be an interpolation)
        let decls = parse_style_decls("background: green; background: ", 0);
        assert_eq!(decls.len(), 2);
        assert!(decls.iter().all(|d| d.0 == "background"));
    }
}
