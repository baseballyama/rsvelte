//! `svelte/button-has-type` — require an explicit `type` on `<button>`.
//! Without it the browser defaults to `type="submit"`, a common footgun inside
//! forms. Port of the eslint-plugin-svelte rule (attribute inspection).

use rsvelte_core::ast::template::{Attribute, RegularElement};

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/button-has-type",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Require an explicit `type` attribute on `<button>` elements",
};

#[derive(Default)]
pub struct ButtonHasType;

impl Rule for ButtonHasType {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_element(&self, ctx: &mut LintContext, el: &RegularElement) {
        if !el.name.eq_ignore_ascii_case("button") {
            return;
        }
        let mut has_type = false;
        for attr in &el.attributes {
            match attr {
                // A static or dynamic `type=...` satisfies the rule.
                Attribute::Attribute(node) if node.name.eq_ignore_ascii_case("type") => {
                    has_type = true;
                }
                // A spread (`{...props}`) may carry `type` at runtime — don't
                // flag, to avoid false positives.
                Attribute::SpreadAttribute(_) => return,
                _ => {}
            }
        }
        if !has_type {
            // Point at the `<button` opener.
            let end = el.start + 1 + el.name.len() as u32;
            ctx.report(
                el.start,
                end,
                "`<button>` should have an explicit `type` attribute",
            );
        }
    }
}
