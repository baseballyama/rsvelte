//! Utility functions for the transform phase.
//!
//! Corresponds to utilities in:
//! - `svelte/packages/svelte/src/compiler/phases/3-transform/utils.js`

use crate::ast::template::{Fragment, TemplateNode};
use crate::compiler::phases::phase2_analyze::scope::Scope;
use crate::compiler::phases::phase2_analyze::types::ComponentAnalysis;

/// Result of cleaning nodes.
#[derive(Debug, Clone)]
pub struct CleanedNodes {
    /// Nodes that should be hoisted (ConstTag, DebugTag, etc.)
    pub hoisted: Vec<TemplateNode>,

    /// Trimmed nodes with whitespace handled
    pub trimmed: Vec<TemplateNode>,

    /// Whether this is a standalone component/render tag
    pub is_standalone: bool,

    /// Whether the first node is text or an expression tag
    pub is_text_first: bool,
}

/// Clean and organize template nodes.
///
/// Extracts nodes that are hoisted and trims whitespace according to the following rules:
/// - trim leading and trailing whitespace, regardless of surroundings
/// - keep leading / trailing whitespace of in-between text nodes,
///   unless it's whitespace-only, in which case collapse to a single whitespace
///
/// Corresponds to `clean_nodes` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/utils.js`.
///
/// # Arguments
///
/// * `parent` - The parent node
/// * `nodes` - The nodes to clean
/// * `path` - The path of parent nodes
/// * `namespace` - The namespace (html, svg, mathml)
/// * `scope` - The current scope
/// * `analysis` - The component analysis
/// * `preserve_whitespace` - Whether to preserve whitespace
/// * `preserve_comments` - Whether to preserve comments
///
/// # Returns
///
/// Returns a `CleanedNodes` struct containing hoisted and trimmed nodes.
pub fn clean_nodes(
    parent: Option<&TemplateNode>,
    nodes: &[TemplateNode],
    _path: &[&TemplateNode],
    _namespace: &str,
    _scope: &Scope,
    _analysis: &ComponentAnalysis,
    _preserve_whitespace: bool,
    preserve_comments: bool,
) -> CleanedNodes {
    let mut hoisted = Vec::new();
    let mut regular = Vec::new();

    // Separate hoisted nodes from regular nodes
    for node in nodes {
        // Skip comments unless preserveComments is true
        if matches!(node, TemplateNode::Comment(_)) && !preserve_comments {
            continue;
        }

        match node {
            TemplateNode::ConstTag(_)
            | TemplateNode::DebugTag(_)
            | TemplateNode::SvelteBody(_)
            | TemplateNode::SvelteWindow(_)
            | TemplateNode::SvelteDocument(_)
            | TemplateNode::SvelteHead(_)
            | TemplateNode::TitleElement(_)
            | TemplateNode::SnippetBlock(_) => {
                hoisted.push(node.clone());
            }
            _ => {
                regular.push(node.clone());
            }
        }
    }

    // For now, simple implementation without whitespace trimming
    // TODO: Implement full whitespace trimming logic
    let trimmed = regular;

    // Determine is_standalone
    let is_standalone = trimmed.len() == 1
        && match &trimmed[0] {
            TemplateNode::RenderTag(_) => true, // TODO: Check !metadata.dynamic
            TemplateNode::Component(_) => true, // TODO: Check conditions
            _ => false,
        };

    // Determine is_text_first
    let is_text_first = match parent {
        Some(TemplateNode::SnippetBlock(_))
        | Some(TemplateNode::EachBlock(_))
        | Some(TemplateNode::SvelteComponent(_))
        | Some(TemplateNode::Component(_))
        | None => {
            if let Some(first) = trimmed.first() {
                matches!(
                    first,
                    TemplateNode::Text(_) | TemplateNode::ExpressionTag(_)
                )
            } else {
                false
            }
        }
        _ => false,
    };

    CleanedNodes {
        hoisted,
        trimmed,
        is_standalone,
        is_text_first,
    }
}

/// Infer the namespace for the children of a node.
///
/// Corresponds to `infer_namespace` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/utils.js`.
///
/// # Arguments
///
/// * `namespace` - The current namespace
/// * `parent` - The parent node
/// * `nodes` - The child nodes
/// * `analysis` - The component analysis
///
/// # Returns
///
/// Returns the inferred namespace string ("html", "svg", or "mathml").
pub fn infer_namespace(
    namespace: &str,
    parent: Option<&TemplateNode>,
    _nodes: &[TemplateNode],
    _analysis: &ComponentAnalysis,
) -> String {
    // Check for foreignObject which resets to html
    if let Some(TemplateNode::RegularElement(elem)) = parent {
        if elem.name == "foreignObject" {
            return "html".to_string();
        }

        // TODO: Check for SVG/MathML elements via metadata when metadata field is added to RegularElement
        // For now, always return "html"
        // if elem.metadata.as_ref().map(|m| m.svg).unwrap_or(false) {
        //     return "svg".to_string();
        // }
        // if elem.metadata.as_ref().map(|m| m.mathml).unwrap_or(false) {
        //     return "mathml".to_string();
        // }

        return "html".to_string();
    }

    // For other parent types, keep the current namespace
    // TODO: Implement full namespace inference logic
    namespace.to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_clean_nodes_empty() {
        use crate::compiler::phases::phase2_analyze::scope::{Scope, ScopeRoot};
        use crate::compiler::phases::phase2_analyze::types::ComponentAnalysis;

        let scope_root = ScopeRoot::new();
        let scope = Scope::new_component(&scope_root, None);
        let analysis = ComponentAnalysis::new();

        let cleaned = clean_nodes(None, &[], &[], "html", &scope, &analysis, false, false);

        assert!(cleaned.hoisted.is_empty());
        assert!(cleaned.trimmed.is_empty());
        assert!(!cleaned.is_standalone);
        assert!(!cleaned.is_text_first);
    }

    #[test]
    fn test_infer_namespace_default() {
        use crate::compiler::phases::phase2_analyze::types::ComponentAnalysis;

        let analysis = ComponentAnalysis::new();
        let namespace = infer_namespace("html", None, &[], &analysis);

        assert_eq!(namespace, "html");
    }
}
