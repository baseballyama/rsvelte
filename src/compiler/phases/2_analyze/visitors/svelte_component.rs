//! SvelteComponent visitor.
//!
//! Analyzes <svelte:component> elements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SvelteComponent.js`.

use super::super::{AnalysisError, warnings};
use super::VisitorContext;
use super::shared::fragment;
use super::shared::utils::validate_assignment;
use crate::ast::js::Expression;
use crate::ast::template::{Attribute, SvelteComponentElement};

/// Visit a svelte:component.
pub fn visit(
    component: &mut SvelteComponentElement,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // In runes mode, <svelte:component> is deprecated because components are dynamic by default
    if context.analysis.runes {
        context.emit_warning(warnings::svelte_component_deprecated());
    }

    // svelte:component requires a `this` expression
    // Analyze the expression to track template references
    // This is crucial for legacy state promotion to work correctly
    let Expression::Value(expr_value) = &component.expression;
    super::script::walk_js_node(expr_value, context)?;

    // Analyze attributes (mirrors visit_component logic from shared/component.rs)
    for attr in &component.attributes {
        if let Attribute::BindDirective(bind) = attr {
            // Track component bindings (skip bind:this)
            if bind.name != "this" {
                context.analysis.uses_component_bindings = true;
            }
            validate_assignment(bind.expression.as_json(), context, true)?;
        }
    }

    // Analyze children
    fragment::analyze(&mut component.fragment, context)?;

    Ok(())
}
