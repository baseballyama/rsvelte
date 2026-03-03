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

    // DEBUG: Show scope info for this const tag
    eprintln!(
        "[DEBUG phase2 const_tag] start={}, scope={}, fragment_owner={:?}",
        tag.start, context.scope, fragment_owner
    );
    // Show bindings in current scope and parents
    {
        let mut cur = Some(context.scope);
        while let Some(idx) = cur {
            if let Some(scope) = context.analysis.root.all_scopes.get(idx) {
                for (name, &binding_idx) in &scope.declarations {
                    let b = &context.analysis.root.bindings[binding_idx];
                    eprintln!(
                        "[DEBUG phase2 const_tag]   scope[{}] has '{}' binding_idx={} kind={:?}",
                        idx, name, binding_idx, b.kind
                    );
                }
                cur = scope.parent;
            } else {
                break;
            }
        }
    }

    let crate::ast::js::Expression::Value(value) = &tag.declaration;

    let decl_type = value.get("type").and_then(|t| t.as_str());

    // Handle proper VariableDeclaration format (from official Svelte parser)
    if decl_type == Some("VariableDeclaration") {
        if let Some(declarations) = value.get("declarations").and_then(|d| d.as_array())
            && let Some(declaration) = declarations.first()
        {
            // Visit the init expression if present
            if let Some(init) = declaration.get("init") {
                walk_js_expression(init, context, &mut tag.metadata.expression)?;
            }
        }
    }
    // Handle AssignmentExpression format (from our current parser)
    // TODO: Fix the parser to emit VariableDeclaration instead
    else if decl_type == Some("AssignmentExpression")
        && let Some(right) = value.get("right")
    {
        walk_js_expression(right, context, &mut tag.metadata.expression)?;
    }

    context.in_const_tag = false;
    Ok(())
}
