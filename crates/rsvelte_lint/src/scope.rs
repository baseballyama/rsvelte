//! Wave-2 scope/binding access (design doc §E, Risk R9).
//!
//! Scope-based plugin rules (`prefer-const`-style, unused-binding, store/reactive
//! rules) need the component's lexical scope, not just the template tree. This
//! module threads `analyze_component`'s `ScopeRoot` into the linter and
//! defines the [`ScopeRule`] contract for rules that visit bindings.
//!
//! **R9 audit (gating step, see the unit tests below).** Before committing to
//! the ~19-rule estimate the design demands verifying the compiler scope retains
//! the references those rules need. The tests here pin the actual behaviour
//! against real components. Findings:
//!
//! - **Reads are retained with spans**, and template reads carry
//!   `is_template_reference = true` — so "unused in template" / store-access
//!   rules can rely on that flag.
//! - **`reassigned` / `mutated` are reliable**; `prefer-const`-style rules can
//!   use them directly. But `Mutation.start/end` spans are stubbed to `0`
//!   upstream, so rules must report at the binding, not the mutation site.
//! - **Gap (budget for the next increment):** the declarator identifier is
//!   itself recorded as a reference with `is_self_declaration = false`. So a
//!   plain "no non-self references ⇒ unused" check over-counts — an unused
//!   binding still shows one reference (its own declaration). A faithful
//!   unused-binding rule must exclude the reference at `declaration_start`
//!   (or special-case `scope_builder.rs` to set the self flag). This is the
//!   concrete `scope_builder.rs` work the design's R9 flagged.
//!
//! No scope rules ship yet: [`scope_rules`] is empty, so [`scope_diagnostics`]
//! short-circuits before paying for analysis. The plumbing + audit are the
//! deliverable; porting the plugin's scope rules onto this is the validated next
//! increment.

use std::collections::HashSet;

use rsvelte_core::ParseOptions;
use rsvelte_core::compiler::CompileOptions;
use rsvelte_core::compiler::ComponentAnalysis;
use rsvelte_core::compiler::phases::analyze_component;
use rsvelte_core::compiler::phases::phase2_analyze::Binding;

use crate::config::LintConfig;
use crate::context::LintContext;
use crate::diagnostic::LintDiagnostic;
use crate::rule::{RuleMeta, Severity};

/// Script-scope resolver for the native linter.
///
/// A name-based rule (`no-top-level-browser-globals`) cannot, on its own, tell
/// a real browser global (`window`) from a local binding — a prop, import, or
/// `let` named `open` / `top` / `name` / `status` — that merely shares a
/// global's name. This resolver answers that by running oxc semantic analysis
/// over the file's `<script>`(s) (via
/// [`rsvelte_core::lint_scope::resolve_script_scope`]) and recording:
///
/// - the absolute byte spans of identifiers that are **not global references**
///   (declarations + reads that resolve to a local) — for the script rule
///   ([`is_script_local`](Self::is_script_local)); and
/// - the set of **top-level binding names** (props / imports / top-level
///   declarations) visible to the template — for the template rule
///   ([`is_component_binding`](Self::is_component_binding)).
///
/// A rule then treats a matching browser-global name as a shadowed local and
/// skips it — exactly what upstream's scope-based `ReferenceTracker` does by
/// only iterating unresolved (global) references.
///
/// Both records are fail-safe: if a script can't be resolved they are empty,
/// nothing is treated as a local, and the rule degrades to its old name-based
/// behaviour rather than dropping real findings.
///
/// It is built once per file at the engine's shared-parse point and attached to
/// the [`LintContext`], so every rule pass shares the single semantic build.
#[derive(Default)]
pub struct ScopeResolver {
    /// Absolute byte spans of identifiers that are not global references
    /// (declarations + resolved reads), across the file's script(s).
    local_spans: HashSet<(u32, u32)>,
    /// Names declared at the top level of the file's script(s) — the bindings a
    /// template `{expr}` can read.
    binding_names: HashSet<String>,
}

impl ScopeResolver {
    /// Fold one script's scope facts into the resolver. `src` is the isolated
    /// script body, `base` its absolute start offset in the file, and `is_ts`
    /// its language (so TS scripts parse as TS).
    pub fn add_script(&mut self, src: &str, base: u32, is_ts: bool) {
        let scope = rsvelte_core::lint_scope::resolve_script_scope(src, is_ts);
        for (s, e) in scope.non_global_spans {
            self.local_spans.insert((s + base, e + base));
        }
        self.binding_names.extend(scope.root_binding_names);
    }

    /// Whether the identifier reference at absolute `[start, end)` is *not* a
    /// global (a declaration or a read resolving to a local binding). `false`
    /// for an unresolved global reference — and also `false` when the resolver
    /// has no record of it, so a caller that skips only on `true` degrades
    /// safely to name-based behaviour.
    pub fn is_script_local(&self, start: u32, end: u32) -> bool {
        self.local_spans.contains(&(start, end))
    }

    /// Whether `name` is declared at the top level of the component's
    /// script(s) — i.e. a template `{name}` reads that binding rather than a
    /// global of the same name.
    pub fn is_component_binding(&self, name: &str) -> bool {
        self.binding_names.contains(name)
    }
}

/// A rule that inspects the component's bindings rather than the template tree.
#[allow(unused_variables)]
pub trait ScopeRule: Send + Sync {
    fn meta(&self) -> &'static RuleMeta;

    /// Called once per binding in the component's scope tree.
    fn check_binding(&self, ctx: &mut LintContext, binding: &Binding) {}
}

/// The built-in scope rule set. Empty until the gated Wave-2 port lands.
pub fn scope_rules() -> Vec<Box<dyn ScopeRule>> {
    Vec::new()
}

/// Parse + analyze a component, returning its full [`ComponentAnalysis`]
/// (which owns the `ScopeRoot`). Returns `None` on parse/analysis failure.
pub fn analyze_scope(source: &str) -> Option<ComponentAnalysis> {
    let mut root = rsvelte_core::parse(source, ParseOptions::default()).ok()?;
    analyze_component(&mut root, source, &CompileOptions::default()).ok()
}

/// Run the enabled scope rules over a component's bindings.
pub fn scope_diagnostics(source: &str, config: &LintConfig) -> Vec<LintDiagnostic> {
    let rules = scope_rules();
    let enabled: Vec<(&dyn ScopeRule, &'static RuleMeta, Severity)> = rules
        .iter()
        .filter_map(|r| {
            let meta = r.meta();
            let severity = config.severity_for(meta);
            (severity != Severity::Off).then_some((r.as_ref(), meta, severity))
        })
        .collect();
    if enabled.is_empty() {
        // No scope rules → skip the (more expensive) analysis pass entirely.
        return Vec::new();
    }

    let Some(analysis) = analyze_scope(source) else {
        return Vec::new();
    };
    let mut ctx = LintContext::new(config, source, "");
    for binding in &analysis.root.bindings {
        for (rule, meta, severity) in &enabled {
            ctx.enter_rule(meta, *severity);
            rule.check_binding(&mut ctx, binding);
        }
    }
    ctx.into_diagnostics()
}

#[cfg(test)]
mod tests {
    use super::*;
    use rsvelte_core::compiler::phases::phase2_analyze::DeclarationKind;

    fn binding<'a>(analysis: &'a ComponentAnalysis, name: &str) -> &'a Binding {
        analysis
            .root
            .bindings
            .iter()
            .find(|b| b.name == name)
            .unwrap_or_else(|| panic!("binding `{name}` not found"))
    }

    #[test]
    fn analyze_scope_runs_standalone_from_the_lint_crate() {
        // The critical feasibility gate: analyze_component must work when called
        // directly (not via compile()), with its own arena handling.
        let a = analyze_scope("<script>let x = 1;</script>{x}");
        assert!(a.is_some(), "analyze_scope returned None");
    }

    #[test]
    fn r9_audit_template_reads_reassignment_and_kind_are_retained() {
        let src = "<script>\n\
                   let used = 1;\n\
                   let unused = 2;\n\
                   let reassigned = 3;\n\
                   reassigned = 4;\n\
                   </script>\n\
                   {used}";
        let a = analyze_scope(src).expect("analysis");

        // Template reads ARE reliably flagged: `used` is read in the template,
        // `unused` is not.
        let used = binding(&a, "used");
        let unused = binding(&a, "unused");
        assert!(
            used.references.iter().any(|r| r.is_template_reference),
            "expected a template reference for `used`"
        );
        assert!(
            !unused.references.iter().any(|r| r.is_template_reference),
            "expected no template reference for `unused`"
        );

        // R9 GAP: the declarator identifier is itself recorded as a reference
        // and is NOT flagged `is_self_declaration`, so `unused` still shows one
        // reference. An unused-binding rule must exclude `declaration_start`.
        assert_eq!(unused.references.len(), 1, "only the declaration ref");
        assert!(
            unused.references.iter().all(|r| !r.is_self_declaration),
            "declarator ref is unexpectedly self-flagged — gap may be fixed"
        );

        // Write flags are reliable even though Mutation spans are stubbed.
        assert!(binding(&a, "reassigned").reassigned, "reassigned flag");
        assert!(!used.reassigned, "`used` should not be reassigned");

        // Binding kind is available for `prefer-const`-style decisions.
        assert_eq!(used.declaration_kind, DeclarationKind::Let);
    }
}
