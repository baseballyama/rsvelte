//! Component visitor.
//!
//! Analyzes component usage.
//!
//! Corresponds to Svelte's `2-analyze/visitors/Component.js`.

use super::super::AnalysisError;
use super::VisitorContext;
use super::shared::component::{validate_component, visit_component};
use crate::ast::template::Component;

/// Visit a component node.
///
/// This is the entry point visitor for Component nodes, which determines
/// whether a component is "dynamic" (can change at runtime) and then
/// delegates to the shared visit_component function for full analysis.
///
/// Corresponds to `Component(node, context)` in Component.js.
pub fn visit(component: &mut Component, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Extract the base name from the component name
    // If the name contains a dot (e.g., Foo.Bar), use the part before the dot
    let base_name = if let Some(dot_pos) = component.name.find('.') {
        &component.name[..dot_pos]
    } else {
        component.name.as_str()
    };

    // Look up the binding for the component name by walking up the scope chain from the
    // current scope (context.scope). This mirrors the official compiler's
    // `context.state.scope.get(name)` which traverses parent links, so that loop
    // variables declared in an each-block scope (EachItem bindings) are found even
    // when the component is referenced inside the loop body.
    // Previously this only checked the root scope, causing each-item components such as
    // `{#each [] as Component}<Component />` to be treated as non-dynamic.
    let binding_idx_opt = context.analysis.root.get_binding(base_name, context.scope);

    // Determine if this component is dynamic
    // A component is dynamic if:
    // 1. We're in runes mode (Svelte 5)
    // 2. The component name has a binding
    // 3. The binding is not a normal variable OR the name contains a dot
    //
    // In Svelte 4, you had to use <svelte:component> to switch components dynamically.
    // In Svelte 5 with runes, regular components can be dynamic if the above conditions are met.
    let is_dynamic = context.analysis.runes && binding_idx_opt.is_some() && {
        let binding_idx = binding_idx_opt.unwrap();
        let binding = &context.analysis.root.bindings[binding_idx];
        binding.kind != super::super::BindingKind::Normal || component.name.contains('.')
    };

    // Set metadata.dynamic
    component.metadata.dynamic = is_dynamic;

    if let Some(binding_idx) = binding_idx_opt {
        let binding = &context.analysis.root.bindings[binding_idx];

        // Update expression metadata
        component.metadata.expression.set_has_state(is_dynamic);
        component
            .metadata
            .expression
            .dependencies
            .insert(binding_idx);
        component.metadata.expression.references.insert(binding_idx);

        // Check if the binding contains state
        if matches!(
            binding.kind,
            super::super::BindingKind::State
                | super::super::BindingKind::RawState
                | super::super::BindingKind::Derived
        ) {
            component.metadata.expression.set_has_state(true);
        }
    }

    // Delegate to shared validate_component for attribute validation
    validate_component(component, context)?;

    // Delegate to shared visit_component for full analysis (includes directive validation)
    visit_component(component, context)?;

    Ok(())
}
