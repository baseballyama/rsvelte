//! TitleElement visitor.
//!
//! Analyzes `<title>` elements inside `<svelte:head>`.
//!
//! Corresponds to Svelte's `2-analyze/visitors/TitleElement.js`.

use super::super::errors;
use super::VisitorContext;
use super::shared::fragment;
use crate::ast::template::{TemplateNode, TitleElement};
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit a title element.
pub fn visit<'a, 'b: 'a>(
    title: &mut TitleElement<'b>,
    context: &mut VisitorContext<'a>,
) -> Result<(), AnalysisError> {
    // Check for illegal attributes - title cannot have any attributes or directives
    if !title.attributes.is_empty() {
        return Err(errors::title_illegal_attribute());
    }

    // Check that all children are Text or ExpressionTag
    for child in &title.fragment.nodes {
        match child {
            TemplateNode::Text(_) | TemplateNode::ExpressionTag(_) => {
                // These are allowed
            }
            _ => {
                return Err(errors::title_invalid_content());
            }
        }
    }

    // Analyze children
    fragment::analyze(&mut title.fragment, context)?;

    Ok(())
}
