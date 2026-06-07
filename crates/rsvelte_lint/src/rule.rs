//! The rule contract: [`Rule`] + [`RuleMeta`].
//!
//! Ported from `vize_patina`'s rule model (`crates/vize_patina/src/rule.rs`):
//! one unit struct per rule, a `&'static RuleMeta` describing it, and a set of
//! hooks the shared visitor calls. Default hook impls are empty so each rule
//! only overrides what it cares about.

use rsvelte_core::ast::template::{
    AwaitBlock, Component, DebugTag, EachBlock, ExpressionTag, HtmlTag, IfBlock, RegularElement,
    Root, SnippetBlock,
};

use crate::context::LintContext;

/// Configured severity for a rule. `Off` disables it entirely (its hooks are
/// never invoked).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Severity {
    Off,
    Warn,
    Error,
}

impl Severity {
    /// Parse the ESLint-style severity vocabulary (`"off"`/`0`, `"warn"`/`1`,
    /// `"error"`/`2`).
    pub fn parse(s: &str) -> Option<Self> {
        Some(match s {
            "off" | "0" => Severity::Off,
            "warn" | "warning" | "1" => Severity::Warn,
            "error" | "2" => Severity::Error,
            _ => return None,
        })
    }
}

/// Whether a rule can autofix, and at which tier.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Fixable {
    /// No autofix.
    No,
    /// A safe, automatically-applied fix (`--fix`).
    Code,
    /// A suggestion surfaced as an editor code-action, never auto-applied.
    Suggestion,
}

/// Coarse grouping used by presets and docs.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RuleCategory {
    /// Likely a bug.
    Correctness,
    /// Accessibility (mirrors the compiler's `a11y_*` family).
    A11y,
    /// Best-practice / style.
    Style,
    /// Pure formatting — excluded from the recommended preset (owned by the
    /// formatter). See design doc §D course-correction 5.
    Formatting,
}

/// Gates that short-circuit a rule when the component doesn't match.
#[derive(Debug, Clone, Copy, Default)]
pub struct RuleConditions {
    /// Only run in runes mode.
    pub runes_only: bool,
    /// Only run in legacy (non-runes) mode.
    pub legacy_only: bool,
}

/// Static description of a rule. One `&'static` instance per rule.
#[derive(Debug)]
pub struct RuleMeta {
    /// Stable rule id, e.g. `"svelte/no-at-html-tags"`.
    pub name: &'static str,
    pub category: RuleCategory,
    pub fixable: Fixable,
    pub default_severity: Severity,
    pub conditions: RuleConditions,
    /// Whether the rule needs TypeScript type info (gated to Wave 3).
    pub type_aware: bool,
    /// One-line description for `--list` / docs.
    pub docs: &'static str,
}

/// A lint rule. Implemented by a zero-sized struct per rule.
///
/// The visitor performs a single shared DFS over the template AST and calls the
/// matching hook on every enabled rule per node — no per-node-type listener
/// registry (verbatim `vize_patina` structure).
#[allow(unused_variables)]
pub trait Rule: Send + Sync {
    fn meta(&self) -> &'static RuleMeta;

    /// Called once per component before the tree walk.
    fn check_root(&self, ctx: &mut LintContext, root: &Root) {}

    fn check_element(&self, ctx: &mut LintContext, el: &RegularElement) {}
    fn check_component(&self, ctx: &mut LintContext, c: &Component) {}
    fn check_html_tag(&self, ctx: &mut LintContext, tag: &HtmlTag) {}
    fn check_expression_tag(&self, ctx: &mut LintContext, tag: &ExpressionTag) {}
    fn check_each(&self, ctx: &mut LintContext, block: &EachBlock) {}
    fn check_if(&self, ctx: &mut LintContext, block: &IfBlock) {}
    fn check_await(&self, ctx: &mut LintContext, block: &AwaitBlock) {}
    fn check_snippet(&self, ctx: &mut LintContext, block: &SnippetBlock) {}
    fn check_debug_tag(&self, ctx: &mut LintContext, tag: &DebugTag) {}
}
