//! `svelte/no-dupe-style-properties` — flag a CSS property that is declared
//! more than once on the same element, across both the static `style="…"`
//! attribute and `style:` directives.
//!
//! Port of the eslint-plugin-svelte rule, on the shared
//! `parseStyleAttributeValue` model: declarations from one interpolation
//! (ternary/logical/template branches) form a single set and never conflict
//! with each other, mirroring upstream's `iterateStyleDeclSetFromStyleRoot`.

use std::collections::HashMap;
use std::collections::HashSet;

use rsvelte_core::ast::template::{
    Attribute, Component, RegularElement, SlotElement, SvelteComponentElement,
    SvelteDynamicElement, SvelteElement,
};

use super::shared::style_decls::style_decl_sets;
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

fn check_start_tag(ctx: &mut LintContext, attributes: &[Attribute]) {
    let source = ctx.source();
    let sets = style_decl_sets(attributes, source);

    let mut reported: HashSet<(u32, u32)> = HashSet::new();
    let mut before: HashMap<String, (u32, u32)> = HashMap::new();
    let mut reports: Vec<(u32, u32, String)> = Vec::new();

    for set in &sets {
        for decl in set {
            if let Some(&(ps, pe)) = before.get(&decl.prop) {
                if reported.insert((ps, pe)) {
                    reports.push((ps, pe, format!("Duplicate property '{}'.", decl.prop)));
                }
                if reported.insert((decl.start, decl.end)) {
                    reports.push((
                        decl.start,
                        decl.end,
                        format!("Duplicate property '{}'.", decl.prop),
                    ));
                }
            }
        }
        for decl in set {
            before.insert(decl.prop.clone(), (decl.start, decl.end));
        }
    }

    for (start, end, msg) in reports {
        ctx.report(start, end, msg);
    }
}

impl Rule for NoDupeStyleProperties {
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
