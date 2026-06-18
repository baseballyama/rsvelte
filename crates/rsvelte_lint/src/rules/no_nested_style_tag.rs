//! `svelte/no-nested-style-tag` — disallow a `<style>` element nested inside
//! another element or block. Only the component's top-level `<style>` is the
//! scoped stylesheet (the parser lifts it into `Root.css`); a `<style>` that
//! remains in the template fragment is nested and unscoped. Port of the
//! eslint-plugin-svelte rule.

use rsvelte_core::ast::template::RegularElement;

use crate::context::LintContext;
use crate::rule::{
    Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity, SpecialElement,
};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-nested-style-tag",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow `<style>` elements nested inside other elements or blocks",
    options_schema: None,
};

const MESSAGE: &str =
    "Nested `<style>` elements are not scoped and may lead to unintended styles being applied.";

#[derive(Default)]
pub struct NoNestedStyleTag;

impl Rule for NoNestedStyleTag {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_element(&self, ctx: &mut LintContext, el: &RegularElement) {
        if el.name.eq_ignore_ascii_case("style") {
            ctx.report(el.start, el.end, MESSAGE);
        }
    }

    fn check_special_element(&self, ctx: &mut LintContext, el: &SpecialElement<'_>) {
        if el.name != "style" {
            return;
        }
        // A self-closing <style /> is not a valid scoped stylesheet.
        let src = ctx.source().as_bytes();
        let mut i = el.start as usize;
        while i < src.len() {
            if src[i] == b'>' {
                if i > 0 && src[i - 1] == b'/' {
                    ctx.report(el.start, el.end, MESSAGE);
                }
                break;
            }
            i += 1;
        }
    }
}
