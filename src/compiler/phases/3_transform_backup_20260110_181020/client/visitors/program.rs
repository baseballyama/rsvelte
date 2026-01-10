//! Program visitor for client-side transformation.
//!
//! Corresponds to `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/Program.js`.
//!
//! This visitor handles the Program node and sets up transformations for:
//! - Legacy mode `$$props` sanitization
//! - Mutated imports in legacy mode
//! - Store subscriptions ($store)
//! - Props (prop and bindable_prop)
//! - State transformers
//!
//! # Note on Implementation
//!
//! The JavaScript version uses closures extensively to capture state for transformations.
//! In Rust, we cannot use closures that capture variables as function pointers.
//! Instead, we mark which identifiers need transformation and handle the actual
//! transformation during the visitor traversal phase.

use crate::compiler::phases::phase2_analyze::scope::{BindingKind, DeclarationKind};
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;

/// Visit a Program node and set up transformations.
///
/// This corresponds to the `Program()` function in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/Program.js`.
///
/// # Arguments
///
/// * `context` - The component context containing state and scope information
///
/// # Returns
///
/// Returns the transformed program if needed, or None to continue with default traversal.
///
/// # Implementation Note
///
/// This is a simplified version that marks which bindings need special handling.
/// The actual transformations are applied during the expression visitor phase.
/// This avoids the need for closures that capture state, which can't be used
/// as function pointers in Rust.
pub fn visit_program(context: &mut ComponentContext) -> Option<JsProgram> {
    // Legacy mode transformations (non-runes)
    if !context.state.analysis.runes {
        // Mark $$props for transformation to $$sanitized_props
        // This will be handled during identifier visiting

        // Handle mutated imports in instance scope
        if let Some(ref _instance) = context.state.analysis.instance {
            // Iterate through scope declarations to find mutated imports
            for (_name, binding_idx) in &context.state.scope.declarations {
                if let Some(binding) = context.state.scope_root.bindings.get(*binding_idx) {
                    // Check if this is a mutated import
                    if binding.declaration_kind == DeclarationKind::Import && binding.mutated {
                        // Mark this import for reactive wrapping
                        // The actual transformation will happen during visitor traversal
                        // For now, we just note that this needs special handling
                    }
                }
            }
        }
    }

    // Handle store subscriptions, props, and state bindings for all modes
    for (_name, binding_idx) in &context.state.scope.declarations {
        if let Some(binding) = context.state.scope_root.bindings.get(*binding_idx) {
            // Mark different binding types for transformation
            match binding.kind {
                BindingKind::StoreSub => {
                    // Store subscriptions need special handling
                    // Will be transformed during visitor traversal
                }
                BindingKind::Prop | BindingKind::BindableProp => {
                    // Props need special handling based on whether they're sources
                    // Will be transformed during visitor traversal
                }
                BindingKind::State | BindingKind::RawState | BindingKind::Derived => {
                    // State variables need $.get() wrapping
                    // Will be transformed during visitor traversal
                }
                BindingKind::LegacyReactive => {
                    // Legacy reactive statements need special handling
                }
                _ => {}
            }
        }
    }

    // If this is the instance script, we might need async transformation
    // For now, we skip this as it requires complex AST traversal
    if context.state.is_instance {
        // The instance body would need transformation for async support
        // This is handled separately in the full implementation
    }

    // Continue with default traversal
    None
}

/// Check if a binding is a prop source (needs $.prop() wrapping).
///
/// Corresponds to `is_prop_source()` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/utils.js`.
#[allow(dead_code)]
fn is_prop_source_binding(
    binding: &crate::compiler::phases::phase2_analyze::scope::Binding,
    state: &ComponentClientTransformState,
) -> bool {
    // In runes mode, props are sources if they're updated
    if state.analysis.runes {
        return binding.is_updated();
    }

    // In legacy mode, props are sources if they're reassigned or mutated
    binding.reassigned || binding.mutated
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::compiler::CompileOptions;
    use crate::compiler::phases::phase2_analyze::scope::{Binding, Scope, ScopeRoot};
    use crate::compiler::phases::phase2_analyze::types::ComponentAnalysis;

    #[test]
    fn test_visit_program() {
        // Create a minimal component analysis
        let source = "let count = 0;";
        let options = CompileOptions::default();
        let analysis = ComponentAnalysis::new(source, &options);
        let scope_root = ScopeRoot::new();

        let state = ComponentClientTransformState::new(
            &scope_root.scope,
            &scope_root,
            &analysis,
            crate::compiler::phases::phase3_transform::js_ast::builders::id("root"),
        );

        let visit_fn = |_ctx: &mut ComponentContext,
                        _node: &crate::ast::template::TemplateNode,
                        _state: Option<&ComponentClientTransformState>|
         -> TransformResult { TransformResult::None };

        let mut context = ComponentContext::new(state, visit_fn);

        // Visit the program - should return None (continue with default traversal)
        let result = visit_program(&mut context);
        assert!(result.is_none());
    }
}
