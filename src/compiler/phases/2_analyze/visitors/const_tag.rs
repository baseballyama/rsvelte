//! ConstTag visitor.
//!
//! Analyzes {@const} tags.
//!
//! Corresponds to Svelte's `2-analyze/visitors/ConstTag.js`.

use super::super::AnalysisError;
use super::VisitorContext;
use super::shared::utils::validate_opening_tag;
use crate::ast::template::{ConstTag, TemplateNode};

/// Visit a const tag.
///
/// The {@const} tag creates a local binding within a control flow block.
/// It can only be used in specific contexts (as a direct child of certain blocks).
///
/// Corresponds to `ConstTag(node, context)` in ConstTag.js.
pub fn visit(tag: &ConstTag, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // In runes mode, validate that the tag starts with '{@' (no whitespace)
    if context.analysis.runes {
        validate_opening_tag(tag.start as usize, &context.analysis.source, '@')?;
    }

    // Validate placement: {@const} must be a direct child of Fragment,
    // and the Fragment must be a child of specific block types
    if context.path.len() >= 2 {
        let _parent = context.path.last();
        let _grand_parent = context.path.get(context.path.len() - 2);

        // TODO: Validate const tag placement
        // Parent must be a Fragment, but Fragment is not a TemplateNode variant
        // This needs to be implemented properly by checking the actual AST structure
        // For now, skip this validation
    }

    // TODO: Re-enable validation when we properly handle Fragment checks
    if false {
        // Grand parent must be one of the allowed types
        let valid_grand_parent = match None as Option<&TemplateNode> {
            Some(TemplateNode::IfBlock(_)) => true,
            Some(TemplateNode::SvelteFragment(_)) => true,
            Some(TemplateNode::Component(_)) => true,
            Some(TemplateNode::SvelteComponent(_)) => true,
            Some(TemplateNode::EachBlock(_)) => true,
            Some(TemplateNode::AwaitBlock(_)) => true,
            Some(TemplateNode::SnippetBlock(_)) => true,
            Some(TemplateNode::SvelteBoundary(_)) => true,
            Some(TemplateNode::KeyBlock(_)) => true,
            // RegularElement and SvelteElement are allowed only if they have a slot attribute
            Some(TemplateNode::RegularElement(element)) => {
                element.attributes.iter().any(|attr| {
                    matches!(attr, crate::ast::template::Attribute::Attribute(a) if a.name == "slot")
                })
            }
            Some(TemplateNode::SvelteElement(element)) => {
                element.attributes.iter().any(|attr| {
                    matches!(attr, crate::ast::template::Attribute::Attribute(a) if a.name == "slot")
                })
            }
            _ => false,
        };

        if !valid_grand_parent {
            // TODO: return Err(errors::const_tag_invalid_placement());
        }
    }

    // TODO: Extract and visit the declaration
    // The JavaScript code does:
    //   const declaration = node.declaration.declarations[0];
    //   context.visit(declaration.id);
    //   context.visit(declaration.init, {
    //       ...context.state,
    //       expression: node.metadata.expression,
    //       function_depth: context.state.function_depth + 1,
    //       derived_function_depth: context.state.function_depth + 1
    //   });
    //
    // This requires:
    // 1. Parsing the declaration expression to extract id and init
    // 2. Implementing context.visit() for JavaScript AST nodes
    // 3. Adding metadata.expression to ConstTag nodes
    //
    // For now, we acknowledge that the const tag is valid but don't visit its contents

    Ok(())
}
