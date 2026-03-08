//! SpreadAttribute visitor.
//!
//! Analyzes spread attributes {...obj}.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SpreadAttribute.js`.

use super::VisitorContext;
use crate::ast::js::Expression;
use crate::ast::template::SpreadAttribute;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit a spread attribute.
pub fn visit(
    attribute: &SpreadAttribute,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // Spreads can contain class/style, so we can't safely prune CSS
    context.analysis.css.has_dynamic_classes = true;

    // Check if this is a $$restProps or $$props spread (for legacy mode)
    if !context.analysis.runes
        && let Some(name) = get_identifier_name(&attribute.expression)
    {
        if name == "$$restProps" {
            context.analysis.uses_rest_props = true;
        }
        if name == "$$props" {
            context.analysis.uses_props = true;
        }
    }

    // Walk the spread expression to trigger needs_context detection.
    // In the official Svelte compiler, SpreadAttribute.js uses `context.next()` which
    // recursively visits the expression, calling CallExpression visitor which sets
    // `needs_context = true` for calls to imported or prop functions.
    // Corresponds to SpreadAttribute.js: `context.next({ ...context.state, expression: node.metadata.expression })`
    super::script::walk_expression(&attribute.expression, context)?;

    Ok(())
}

/// Extract identifier name from an expression.
fn get_identifier_name(expr: &Expression) -> Option<String> {
    let val = expr.as_json();
    if let Some(obj) = val.as_object()
        && let Some("Identifier") = obj.get("type").and_then(|t| t.as_str())
    {
        return obj
            .get("name")
            .and_then(|n| n.as_str())
            .map(|s| s.to_string());
    }
    None
}
