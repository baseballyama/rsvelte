//! SpreadAttribute visitor.
//!
//! Analyzes spread attributes {...obj}.
//!
//! Corresponds to Svelte's `2-analyze/visitors/SpreadAttribute.js`.

use super::VisitorContext;
use crate::ast::template::SpreadAttribute;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit a spread attribute.
pub fn visit(
    attribute: &mut SpreadAttribute,
    context: &mut VisitorContext,
    can_set_dom_attributes: bool,
) -> Result<(), AnalysisError> {
    // A spread on a DOM element can contain class/style/id, so we can't safely
    // prune CSS. Component and slot spreads pass props instead and must not
    // affect selector matching.
    if can_set_dom_attributes {
        context.analysis.css.has_dynamic_classes = true;
        context.analysis.css.has_dynamic_ids = true;
    }

    // Check if this is a $$restProps or $$props spread (for legacy mode)
    if !context.analysis.runes
        && let Some(name) = attribute.expression.identifier_name()
    {
        if name == "$$restProps" {
            context.analysis.uses_rest_props = true;
        }
        if name == "$$props" {
            context.analysis.uses_props = true;
        }
    }

    // Walk the spread expression to populate its Phase 2 metadata and trigger
    // needs_context detection.
    // In the official Svelte compiler, SpreadAttribute.js uses `context.next()` which
    // recursively visits the expression with `node.metadata.expression` installed.
    // Corresponds to SpreadAttribute.js: `context.next({ ...context.state, expression: node.metadata.expression })`
    // Mark the reactive expression context so the AwaitExpression visitor applies
    // the `suspend` gate (`experimental_async` / `legacy_await_invalid`), mirroring
    // upstream's `expression: node.metadata.expression`.
    let saved_in_expression_tag = context.in_expression_tag;
    context.in_expression_tag = true;
    let node = attribute.expression.as_node();
    let result = super::shared::utils::walk_js_expression_node(
        &node,
        context,
        &mut attribute.metadata.expression,
    );
    context.in_expression_tag = saved_in_expression_tag;
    result?;
    super::await_block::collect_pickled_awaits_node(
        &node,
        &mut context.analysis.pickled_awaits,
        context.parse_arena,
    );

    Ok(())
}
