//! `svelte/no-dynamic-slot-name` — a `<slot name=…>` must have a static name.
//! Port of the (upstream-deprecated) eslint-plugin-svelte rule: a `name`
//! attribute with a mustache value is "cannot be dynamic"; a valueless `name`
//! attribute is "requires a value".
//!
//! Detection-parity port: the findings (messages + positions) match upstream;
//! the autofix (resolving a const-foldable name to a static string) is not yet
//! ported, so the rule advertises `Fixable::No`.

use rsvelte_core::ast::template::{Attribute, AttributeValue, AttributeValuePart, SlotElement};

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-dynamic-slot-name",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow a dynamic `<slot name>` value",
    options_schema: None,
};

const DYNAMIC: &str = "`<slot>` name cannot be dynamic.";
const REQUIRE_VALUE: &str = "`<slot>` name requires a value.";

#[derive(Default)]
pub struct NoDynamicSlotName;

impl Rule for NoDynamicSlotName {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_slot(&self, ctx: &mut LintContext, el: &SlotElement) {
        for attr in &el.attributes {
            let Attribute::Attribute(node) = attr else {
                continue;
            };
            if !node.name.eq_ignore_ascii_case("name") {
                continue;
            }
            match &node.value {
                // `<slot name />` — boolean attribute, no value.
                AttributeValue::True(_) => {
                    ctx.report(
                        node.start,
                        node.start + node.name.len() as u32,
                        REQUIRE_VALUE,
                    );
                }
                // `<slot name={expr} />` — single mustache.
                AttributeValue::Expression(tag) => {
                    ctx.report(tag.start, tag.end, DYNAMIC);
                }
                AttributeValue::Sequence(parts) => {
                    if parts.is_empty() {
                        ctx.report(
                            node.start,
                            node.start + node.name.len() as u32,
                            REQUIRE_VALUE,
                        );
                    }
                    for part in parts {
                        if let AttributeValuePart::ExpressionTag(tag) = part {
                            ctx.report(tag.start, tag.end, DYNAMIC);
                        }
                    }
                }
            }
        }
    }
}
