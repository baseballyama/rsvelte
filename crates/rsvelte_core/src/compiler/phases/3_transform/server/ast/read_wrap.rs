//! Server READ-WRAPPING single pass (Phase-3 rewrite).
//!
//! After [`ServerTransformState::visit_expr`] produces an oxc [`Expression`],
//! this module performs ONE in-place structural walk that wraps every
//! identifier READ according to its Phase-2 binding kind. It is a faithful port
//! of upstream's server `Identifier.js` + `shared/utils.js::build_getter`
//! (`submodules/svelte/packages/svelte/src/compiler/phases/3-transform/server/`).
//!
//! ## Upstream semantics (写经)
//! `build_getter(node, state)` (`shared/utils.js:268`):
//! - binding is `null`, OR the identifier IS its own declaration node → return
//!   unchanged.
//! - `binding.kind == 'store_sub'` (name starts with `$`, e.g. `$count`):
//!   → `$.store_get($$store_subs ??= {}, "$count", count)` where the 3rd arg is
//!   `build_getter` of the store id (name without the leading `$`).
//! - `binding.kind == 'derived'`: → `name()` (a call of the binding identifier);
//!   if `declaration_kind == 'var'` use the OPTIONAL call `name?.()` instead
//!   (`b.maybe_call`).
//! - otherwise → unchanged (state / props / normal / each-item / … are NOT
//!   wrapped here).
//!
//! `Identifier.js`: a reference named `$$props` → `$$sanitized_props`; a
//! reference starting with `$$derived_array` → `name()`; else → `build_getter`.
//!
//! ## oxc simplification
//! In oxc, only `Expression::Identifier(IdentifierReference)` is a reference
//! READ. Static member properties are `IdentifierName`, object keys are
//! `PropertyKey`, declarations are `BindingIdentifier` — all DISTINCT types. So
//! the walk only needs to transform `Expression::Identifier(_)` nodes, each
//! exactly once (single-pass-by-construction → NO double-wrap, because a
//! replaced identifier's freshly-built children are not re-visited). The
//! [`VisitMut`] walk descends into every expression CHILD (binary / call /
//! member-object / computed-member-`[expr]` / conditional / array /
//! object-values / template-exprs / arrow-bodies / …) but, per the generated
//! `walk_static_member_expression`, does NOT visit a static `.property` (it's an
//! `IdentifierName`, not an `Expression`). So `a.b` where `a` is derived →
//! `a().b`, and a call `d(x)` where `d` is derived → `d()(x)`.

use crate::compiler::phases::phase2_analyze::ComponentAnalysis;
use crate::compiler::phases::phase2_analyze::scope::{BindingKind, DeclarationKind};
use crate::compiler::phases::phase3_transform::builders::B;
use oxc_ast::ast::Expression;
use oxc_ast_visit::VisitMut;

/// The in-place read-wrapping visitor. Holds the builder (for synthesizing the
/// getter expressions) and the analysis (for binding-kind lookup).
struct ReadWrap<'a, 'b> {
    b: B<'a>,
    analysis: &'b ComponentAnalysis,
    /// The scope index to resolve names against. For the first cut this is the
    /// component/instance scope (most derived / store / prop bindings live
    /// there). Each-item / snippet-param bindings resolve to non-derived /
    /// non-store kinds, so they are never wrongly wrapped.
    scope_idx: usize,
}

/// How a given name should be rewritten as a read.
enum ReadKind {
    /// Leave the identifier unchanged.
    Keep,
    /// `$$props` → `$$sanitized_props`.
    SanitizedProps,
    /// `derived` (non-`var`) → `name()`.
    DerivedCall,
    /// `derived` declared with `var` → `name?.()`.
    DerivedMaybeCall,
    /// `$count` (store_sub) → `$.store_get($$store_subs ??= {}, "$count", count)`.
    /// Carries the inner store-id read kind (the `count` arg is itself a getter).
    StoreSub,
}

impl<'a, 'b> ReadWrap<'a, 'b> {
    /// Classify how a referenced `name` should be read, mirroring upstream's
    /// `Identifier.js` → `build_getter` cascade.
    fn classify(&self, name: &str) -> ReadKind {
        // Identifier.js short-circuits.
        if name == "$$props" {
            return ReadKind::SanitizedProps;
        }
        if name.starts_with("$$derived_array") {
            // Terrible-but-faithful upstream hack: `$$derived_array…` → `name()`.
            return ReadKind::DerivedCall;
        }

        // build_getter: resolve the binding.
        let Some(idx) = self.analysis.root.get_binding(name, self.scope_idx) else {
            return ReadKind::Keep;
        };
        let binding = &self.analysis.root.bindings[idx];

        match binding.kind {
            BindingKind::StoreSub => ReadKind::StoreSub,
            BindingKind::Derived => {
                if binding.declaration_kind == DeclarationKind::Var {
                    ReadKind::DerivedMaybeCall
                } else {
                    ReadKind::DerivedCall
                }
            }
            _ => ReadKind::Keep,
        }
    }

    /// Build the replacement expression for a classified read of `name`.
    fn build_getter(&self, name: &str, kind: ReadKind) -> Option<Expression<'a>> {
        let b = self.b;
        match kind {
            ReadKind::Keep => None,
            ReadKind::SanitizedProps => Some(b.id("$$sanitized_props")),
            ReadKind::DerivedCall => Some(b.call(b.id(name), vec![])),
            ReadKind::DerivedMaybeCall => Some(b.optional_call(b.id(name), vec![])),
            ReadKind::StoreSub => {
                // `$.store_get($$store_subs ??= {}, "$count", <getter of count>)`.
                // The 3rd arg is `build_getter` of the store id (name w/o `$`).
                let store_name = &name[1..];
                let inner_kind = self.classify(store_name);
                let inner = self
                    .build_getter(store_name, inner_kind)
                    .unwrap_or_else(|| b.id(store_name));
                let subs = b.assignment(
                    oxc_ast::ast::AssignmentOperator::LogicalNullish,
                    b.id("$$store_subs"),
                    b.object(vec![]),
                );
                Some(b.call("$.store_get", vec![subs, b.string(name), inner]))
            }
        }
    }
}

impl<'a, 'b> VisitMut<'a> for ReadWrap<'a, 'b> {
    fn visit_expression(&mut self, expr: &mut Expression<'a>) {
        // Only an `Expression::Identifier` is a reference READ. Replace it in
        // place via the getter and do NOT recurse into the freshly-built node
        // (single-pass-by-construction → no double-wrap). Every other
        // expression kind recurses through the generated `walk_expression`,
        // which visits expression children but NOT static member `.property`
        // (an `IdentifierName`).
        if let Expression::Identifier(id) = expr {
            let name = id.name.as_str();
            let kind = self.classify(name);
            if let Some(replacement) = self.build_getter(name, kind) {
                *expr = replacement;
            }
            return;
        }
        oxc_ast_visit::walk_mut::walk_expression(self, expr);
    }
}

/// Apply the read-wrapping pass to `expr` in place. `scope_idx` is the scope to
/// resolve names against (component/instance scope for the first cut).
pub fn wrap_reads<'a>(
    expr: &mut Expression<'a>,
    b: B<'a>,
    analysis: &ComponentAnalysis,
    scope_idx: usize,
) {
    let mut visitor = ReadWrap {
        b,
        analysis,
        scope_idx,
    };
    visitor.visit_expression(expr);
}
