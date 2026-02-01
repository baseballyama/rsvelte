//! ConstTag visitor.
//!
//! Analyzes {@const} tags.
//!
//! Corresponds to Svelte's `2-analyze/visitors/ConstTag.js`.

use super::super::AnalysisError;
use super::super::errors;
use super::shared::utils::{validate_opening_tag, walk_js_expression};
use super::{FragmentOwnerType, VisitorContext};
use crate::ast::template::ConstTag;

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
    let fragment_owner = context.fragment_owner_stack.last().copied();

    let is_valid_placement = match fragment_owner {
        Some(FragmentOwnerType::IfBlock) => true,
        Some(FragmentOwnerType::EachBlock) => true,
        Some(FragmentOwnerType::AwaitBlock) => true,
        Some(FragmentOwnerType::KeyBlock) => true,
        Some(FragmentOwnerType::SnippetBlock) => true,
        Some(FragmentOwnerType::SvelteFragment) => true,
        Some(FragmentOwnerType::SvelteBoundary) => true,
        Some(FragmentOwnerType::Component) => true,
        // RegularElement and SvelteElement are allowed only if they have a slot attribute
        // But we can't easily check that here, so we disallow them
        // The official Svelte checks the path to see if the grandparent has a slot attribute
        _ => false,
    };

    if !is_valid_placement {
        return Err(errors::const_tag_invalid_placement());
    }

    // Visit the declaration expression
    let crate::ast::js::Expression::Value(value) = &tag.declaration;

    let value_type = value.get("type").and_then(|t| t.as_str());

    // The declaration can be either:
    // - AssignmentExpression: @const b = a + 1 (right side is the expression)
    // - VariableDeclaration: @const {x, y} = obj (declarations array with init)
    match value_type {
        Some("AssignmentExpression") => {
            // For AssignmentExpression, walk the right side
            if let Some(right) = value.get("right") {
                walk_js_expression(right, context, &mut tag.metadata.expression)?;
            }
        }
        Some("VariableDeclaration") => {
            // For VariableDeclaration, walk the init of each declarator
            if let Some(declarations) = value.get("declarations").and_then(|d| d.as_array())
                && let Some(declaration) = declarations.first()
                && let Some(init) = declaration.get("init")
            {
                walk_js_expression(init, context, &mut tag.metadata.expression)?;
            }
        }
        _ => {}
    }

    Ok(())
}
