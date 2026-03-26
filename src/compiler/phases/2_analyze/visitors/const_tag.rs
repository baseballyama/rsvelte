//! ConstTag visitor.
//!
//! Analyzes {@const} tags.
//!
//! Corresponds to Svelte's `2-analyze/visitors/ConstTag.js`.

use super::super::AnalysisError;
use super::super::errors;
use super::shared::utils::{validate_opening_tag, walk_js_expression, walk_js_expression_node};
use super::{FragmentOwnerType, VisitorContext};
use crate::ast::template::ConstTag;
use crate::ast::typed_expr::JsNode;

/// Visit a const tag.
///
/// The {@const} tag creates a local binding within a control flow block.
/// It can only be used in specific contexts (as a direct child of certain blocks).
///
/// Corresponds to `ConstTag(node, context)` in ConstTag.js.
pub fn visit(tag: &mut ConstTag, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // In runes mode, validate that the tag starts with '{@' (no whitespace)
    if context.analysis.runes {
        validate_opening_tag(tag.start as usize, &context.analysis.source, '@')?;
    }

    // Validate placement: {@const} must be a direct child of specific block types
    // Get the current fragment owner from the stack
    let fragment_owner = context.fragment_owner_stack.last().cloned();

    let is_valid_placement = match fragment_owner {
        Some(FragmentOwnerType::IfBlock) => true,
        Some(FragmentOwnerType::EachBlock) => true,
        Some(FragmentOwnerType::AwaitBlock) => true,
        Some(FragmentOwnerType::KeyBlock) => true,
        Some(FragmentOwnerType::SnippetBlock(_, _)) => true,
        Some(FragmentOwnerType::SvelteFragment) => true,
        Some(FragmentOwnerType::SvelteBoundary) => true,
        Some(FragmentOwnerType::Component) => true,
        // RegularElement and SvelteElement with a slot attribute are valid placements.
        // In legacy Svelte, `<div slot="name">` creates a slot boundary context,
        // so {@const} can be used inside slotted elements.
        Some(FragmentOwnerType::RegularElementWithSlot) => true,
        Some(FragmentOwnerType::SvelteElementWithSlot) => true,
        _ => false,
    };

    if !is_valid_placement {
        return Err(errors::const_tag_invalid_placement());
    }

    // Visit the declaration expression with in_const_tag flag set
    context.in_const_tag = true;

    let decl_node = tag.declaration.as_node();
    let arena = context.parse_arena;

    // Handle proper VariableDeclaration format (from official Svelte parser)
    match &*decl_node {
        JsNode::VariableDeclaration { declarations, .. } => {
            let decls = arena.get_js_children(*declarations);
            if let Some(JsNode::VariableDeclarator {
                init: Some(init), ..
            }) = decls.first()
            {
                let init_node = arena.get_js_node(*init);
                walk_js_expression_node(init_node, context, &mut tag.metadata.expression)?;
                // Detect pickled awaits in const tag init expressions.
                super::await_block::collect_pickled_awaits_node(
                    init_node,
                    &mut context.analysis.pickled_awaits,
                    arena,
                );
            }
        }
        // Handle AssignmentExpression format (from our current parser)
        // TODO: Fix the parser to emit VariableDeclaration instead
        JsNode::AssignmentExpression { right, .. } => {
            let right_node = arena.get_js_node(*right);
            walk_js_expression_node(right_node, context, &mut tag.metadata.expression)?;
            // Detect pickled awaits in const tag expressions.
            super::await_block::collect_pickled_awaits_node(
                right_node,
                &mut context.analysis.pickled_awaits,
                arena,
            );
        }
        // Fallback for Raw or unknown variants
        _ => {
            let value = tag.declaration.as_json();
            let decl_type = value.get("type").and_then(|t| t.as_str());
            if decl_type == Some("VariableDeclaration")
                && let Some(declarations) = value.get("declarations").and_then(|d| d.as_array())
                && let Some(declaration) = declarations.first()
                && let Some(init) = declaration.get("init")
            {
                walk_js_expression(init, context, &mut tag.metadata.expression)?;
                super::await_block::collect_pickled_awaits(
                    init,
                    &mut context.analysis.pickled_awaits,
                );
            } else if decl_type == Some("AssignmentExpression")
                && let Some(right) = value.get("right")
            {
                walk_js_expression(right, context, &mut tag.metadata.expression)?;
                super::await_block::collect_pickled_awaits(
                    right,
                    &mut context.analysis.pickled_awaits,
                );
            }
        }
    }

    context.in_const_tag = false;
    Ok(())
}
