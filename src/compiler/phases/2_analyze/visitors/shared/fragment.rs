//! Fragment utilities.
//!
//! Functions for working with template fragments.
//!
//! Corresponds to Svelte's `2-analyze/visitors/shared/fragment.js`.

use super::super::super::AnalysisError;
use super::super::VisitorContext;
use crate::ast::template::{Fragment, TemplateNode};

/// Analyze a fragment.
pub fn analyze(fragment: &Fragment, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    for node in &fragment.nodes {
        super::super::visit_node(node, context)?;
    }
    Ok(())
}

/// Mark a subtree as dynamic.
///
/// This is used when an element has attributes that require runtime evaluation,
/// such as custom element attributes or spreads.
pub fn mark_subtree_dynamic(path: &[&TemplateNode]) {
    // In a full implementation, this would mark nodes in the path
    // as requiring dynamic handling during code generation
    for _node in path {
        // Mark each node as dynamic
        // This information is used during the transform phase
    }
}

/// Check if a fragment contains only static content.
pub fn is_static_fragment(fragment: &Fragment) -> bool {
    fragment.nodes.iter().all(is_static_node)
}

/// Check if a node is static (doesn't require runtime evaluation).
pub fn is_static_node(node: &TemplateNode) -> bool {
    match node {
        TemplateNode::Text(_) => true,
        TemplateNode::Comment(_) => true,
        TemplateNode::RegularElement(element) => {
            // Element is static if all attributes are static and children are static
            let attrs_static = element.attributes.iter().all(|attr| {
                matches!(attr, crate::ast::template::Attribute::Attribute(a)
                    if matches!(&a.value, crate::ast::template::AttributeValue::True(_)
                        | crate::ast::template::AttributeValue::Sequence(_)))
            });

            attrs_static && is_static_fragment(&element.fragment)
        }
        // All other nodes require runtime evaluation
        _ => false,
    }
}

/// Get the first non-whitespace node in a fragment.
pub fn first_significant_node(fragment: &Fragment) -> Option<&TemplateNode> {
    fragment.nodes.iter().find(|node| match node {
        TemplateNode::Text(text) => !text.data.trim().is_empty(),
        TemplateNode::Comment(_) => false,
        _ => true,
    })
}

/// Get the last non-whitespace node in a fragment.
pub fn last_significant_node(fragment: &Fragment) -> Option<&TemplateNode> {
    fragment.nodes.iter().rev().find(|node| match node {
        TemplateNode::Text(text) => !text.data.trim().is_empty(),
        TemplateNode::Comment(_) => false,
        _ => true,
    })
}
