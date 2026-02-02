//! Utility functions for the transform phase.
//!
//! Corresponds to utilities in:
//! - `svelte/packages/svelte/src/compiler/phases/3-transform/utils.js`

use crate::ast::template::TemplateNode;
use crate::compiler::phases::phase2_analyze::scope::Scope;
use crate::compiler::phases::phase2_analyze::types::ComponentAnalysis;
use compact_str::CompactString;
use regex::Regex;
use std::sync::LazyLock;

/// Regex for text that is only whitespace
static REGEX_NOT_WHITESPACE: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"\S").unwrap());

/// Regex for leading whitespace
static REGEX_STARTS_WITH_WHITESPACES: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^\s+").unwrap());

/// Regex for trailing whitespace
static REGEX_ENDS_WITH_WHITESPACES: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"\s+$").unwrap());

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
#[allow(clippy::too_many_arguments)]
pub fn clean_nodes(
    parent: Option<&TemplateNode>,
    nodes: &[TemplateNode],
    _path: &[&TemplateNode],
    namespace: &str,
    _scope: &Scope,
    _analysis: &ComponentAnalysis,
    preserve_whitespace: bool,
    preserve_comments: bool,
) -> CleanedNodes {
    // Pre-allocate based on input size
    let mut hoisted = Vec::with_capacity(nodes.len().min(8));
    let mut regular = Vec::with_capacity(nodes.len());

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

    // Whitespace trimming (unless preserve_whitespace is set)
    let trimmed = if preserve_whitespace {
        regular
    } else {
        trim_whitespace(parent, &regular, namespace)
    };

    // Determine is_standalone
    let is_standalone = trimmed.len() == 1
        && match &trimmed[0] {
            TemplateNode::RenderTag(_) => true, // TODO: Check !metadata.dynamic
            TemplateNode::Component(_) => true, // TODO: Check conditions
            _ => false,
        };

    // Determine is_text_first
    // This is true when the first child is a text or expression tag, for certain parent types.
    // The Fragment visitor will use this in conjunction with is_root_fragment to determine
    // whether to generate $.next() to skip over inserted comment markers.
    let is_text_first = match parent {
        // Root fragment (None parent) or specific parent types that need $.next()
        None
        | Some(TemplateNode::SnippetBlock(_))
        | Some(TemplateNode::EachBlock(_))
        | Some(TemplateNode::SvelteComponent(_))
        | Some(TemplateNode::SvelteBoundary(_))
        | Some(TemplateNode::Component(_))
        | Some(TemplateNode::SvelteSelf(_)) => {
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

/// Trim whitespace from template nodes.
///
/// Implements the whitespace trimming logic from the official Svelte compiler:
/// - Remove leading and trailing whitespace-only text nodes
/// - Trim leading whitespace from first text node
/// - Trim trailing whitespace from last text node
/// - Collapse internal whitespace-only text nodes to a single space
///   (or remove entirely for certain elements like select, table, etc.)
fn trim_whitespace(
    parent: Option<&TemplateNode>,
    nodes: &[TemplateNode],
    namespace: &str,
) -> Vec<TemplateNode> {
    if nodes.is_empty() {
        return Vec::new();
    }

    // Find start index (skip leading whitespace-only text nodes)
    let start_idx = nodes
        .iter()
        .position(|node| {
            if let TemplateNode::Text(text) = node {
                REGEX_NOT_WHITESPACE.is_match(&text.data)
            } else {
                true
            }
        })
        .unwrap_or(nodes.len());

    // Find end index (skip trailing whitespace-only text nodes)
    let end_idx = nodes
        .iter()
        .rposition(|node| {
            if let TemplateNode::Text(text) = node {
                REGEX_NOT_WHITESPACE.is_match(&text.data)
            } else {
                true
            }
        })
        .map(|i| i + 1)
        .unwrap_or(0);

    // If nothing remains, return empty
    if start_idx >= end_idx {
        return Vec::new();
    }

    // Work with the trimmed slice
    let trimmed_slice = &nodes[start_idx..end_idx];

    // Pre-allocate result vector
    let mut regular: Vec<TemplateNode> = Vec::with_capacity(trimmed_slice.len());

    // Clone the nodes in range
    for node in trimmed_slice {
        regular.push(node.clone());
    }

    // Trim leading whitespace from first text node
    if let Some(TemplateNode::Text(first)) = regular.first_mut() {
        let new_raw = REGEX_STARTS_WITH_WHITESPACES.replace(&first.raw, "");
        let new_data = REGEX_STARTS_WITH_WHITESPACES.replace(&first.data, "");
        first.raw = CompactString::new(&new_raw);
        first.data = CompactString::new(&new_data);
    }

    // Trim trailing whitespace from last text node
    if let Some(TemplateNode::Text(last)) = regular.last_mut() {
        let new_raw = REGEX_ENDS_WITH_WHITESPACES.replace(&last.raw, "");
        let new_data = REGEX_ENDS_WITH_WHITESPACES.replace(&last.data, "");
        last.raw = CompactString::new(&new_raw);
        last.data = CompactString::new(&new_data);
    }

    // Determine if whitespace-only text nodes can be removed entirely
    // This applies to svg (except text elements) and certain HTML elements
    let can_remove_entirely = (namespace == "svg"
        && !matches!(parent, Some(TemplateNode::RegularElement(elem)) if elem.name == "text"))
        || matches!(parent, Some(TemplateNode::RegularElement(elem)) if matches!(
            elem.name.as_str(),
            "select" | "tr" | "table" | "tbody" | "thead" | "tfoot" | "colgroup" | "datalist"
        ));

    // Process internal text nodes - collapse whitespace
    let mut trimmed = Vec::new();
    for (i, node) in regular.iter().enumerate() {
        if let TemplateNode::Text(text) = node {
            let mut new_text = text.clone();
            let prev = if i > 0 { regular.get(i - 1) } else { None };
            let next = regular.get(i + 1);

            // Collapse leading whitespace unless previous node is an ExpressionTag
            if !matches!(prev, Some(TemplateNode::ExpressionTag(_))) {
                let prev_is_text_ending_with_whitespace = matches!(
                    prev,
                    Some(TemplateNode::Text(t)) if REGEX_ENDS_WITH_WHITESPACES.is_match(&t.data)
                );
                let replacement = if prev_is_text_ending_with_whitespace {
                    ""
                } else {
                    " "
                };
                new_text.data = CompactString::new(
                    REGEX_STARTS_WITH_WHITESPACES.replace(&new_text.data, replacement),
                );
                new_text.raw = CompactString::new(
                    REGEX_STARTS_WITH_WHITESPACES.replace(&new_text.raw, replacement),
                );
            }

            // Collapse trailing whitespace unless next node is an ExpressionTag
            if !matches!(next, Some(TemplateNode::ExpressionTag(_))) {
                new_text.data =
                    CompactString::new(REGEX_ENDS_WITH_WHITESPACES.replace(&new_text.data, " "));
                new_text.raw =
                    CompactString::new(REGEX_ENDS_WITH_WHITESPACES.replace(&new_text.raw, " "));
            }

            // Only add if there's content or it's a meaningful space
            if !new_text.data.is_empty() && (new_text.data != " " || !can_remove_entirely) {
                trimmed.push(TemplateNode::Text(new_text));
            }
        } else {
            trimmed.push(node.clone());
        }
    }

    trimmed
}

/// Infer the namespace for the children of a node.
///
/// Corresponds to `infer_namespace` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/utils.js`.
///
/// This function uses the metadata.svg and metadata.mathml fields set during
/// Phase 2 analysis to determine the namespace. These fields correctly handle
/// ambiguous elements like 'title' and 'a' which can be either HTML or SVG
/// depending on their ancestor context.
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
    nodes: &[TemplateNode],
    _analysis: &ComponentAnalysis,
) -> String {
    // Check for foreignObject which resets to html
    if let Some(TemplateNode::RegularElement(elem)) = parent {
        if elem.name == "foreignObject" {
            return "html".to_string();
        }

        // Use metadata set during analysis phase to determine namespace
        // This correctly handles ambiguous elements like 'title' and 'a'
        if elem.metadata.svg {
            return "svg".to_string();
        }
        if elem.metadata.mathml {
            return "mathml".to_string();
        }
        // If parent is a regular element without svg/mathml metadata, it's html
        return "html".to_string();
    }

    // Re-evaluate namespace for fragments/snippets based on child content
    // This matches the JS behavior at lines 326-339 of utils.js:
    // For SnippetBlock, Component, SvelteComponent, etc., the namespace is
    // re-evaluated based on what elements are in the children
    let should_reevaluate = match parent {
        Some(TemplateNode::SnippetBlock(_)) => true,
        Some(TemplateNode::Component(_)) => true,
        Some(TemplateNode::SvelteComponent(_)) => true,
        None => true, // Fragment/Root case
        _ => false,
    };

    if should_reevaluate {
        // Check child elements to determine namespace
        for node in nodes {
            if let TemplateNode::RegularElement(elem) = node {
                // Use the metadata to determine namespace
                if elem.metadata.svg {
                    return "svg".to_string();
                }
                if elem.metadata.mathml {
                    return "mathml".to_string();
                }
                // If first element is plain HTML, use html namespace
                return "html".to_string();
            }
        }
    }

    // For other parent types or no elements found, keep the current namespace
    namespace.to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_clean_nodes_empty() {
        use crate::compiler::CompileOptions;
        use crate::compiler::phases::phase2_analyze::scope::Scope;
        use crate::compiler::phases::phase2_analyze::types::ComponentAnalysis;

        let options = CompileOptions::default();
        let scope = Scope::new(None);
        let analysis = ComponentAnalysis::new("", &options);

        let cleaned = clean_nodes(None, &[], &[], "html", &scope, &analysis, false, false);

        assert!(cleaned.hoisted.is_empty());
        assert!(cleaned.trimmed.is_empty());
        assert!(!cleaned.is_standalone);
        assert!(!cleaned.is_text_first);
    }

    #[test]
    fn test_infer_namespace_default() {
        use crate::compiler::CompileOptions;
        use crate::compiler::phases::phase2_analyze::types::ComponentAnalysis;

        let options = CompileOptions::default();
        let analysis = ComponentAnalysis::new("", &options);
        let namespace = infer_namespace("html", None, &[], &analysis);

        assert_eq!(namespace, "html");
    }

    #[test]
    fn test_clean_nodes_whitespace_only() {
        use crate::ast::template::Text;
        use crate::compiler::CompileOptions;
        use crate::compiler::phases::phase2_analyze::scope::Scope;
        use crate::compiler::phases::phase2_analyze::types::ComponentAnalysis;
        use compact_str::CompactString;

        let options = CompileOptions::default();
        let scope = Scope::new(None);
        let analysis = ComponentAnalysis::new("", &options);

        // Create a whitespace-only text node
        let nodes = vec![TemplateNode::Text(Text {
            start: 0,
            end: 5,
            raw: CompactString::new("  \n  "),
            data: CompactString::new("  \n  "),
        })];

        let cleaned = clean_nodes(None, &nodes, &[], "html", &scope, &analysis, false, false);

        // Whitespace-only text node should be removed
        assert!(
            cleaned.trimmed.is_empty(),
            "Whitespace-only text should be trimmed: {:?}",
            cleaned.trimmed
        );
    }

    #[test]
    fn test_clean_nodes_trim_leading_whitespace() {
        use crate::ast::template::Text;
        use crate::compiler::CompileOptions;
        use crate::compiler::phases::phase2_analyze::scope::Scope;
        use crate::compiler::phases::phase2_analyze::types::ComponentAnalysis;
        use compact_str::CompactString;

        let options = CompileOptions::default();
        let scope = Scope::new(None);
        let analysis = ComponentAnalysis::new("", &options);

        // Create a text node with leading whitespace
        let nodes = vec![TemplateNode::Text(Text {
            start: 0,
            end: 10,
            raw: CompactString::new("  hello"),
            data: CompactString::new("  hello"),
        })];

        let cleaned = clean_nodes(None, &nodes, &[], "html", &scope, &analysis, false, false);

        assert_eq!(cleaned.trimmed.len(), 1);
        if let TemplateNode::Text(t) = &cleaned.trimmed[0] {
            assert_eq!(
                t.data.as_str(),
                "hello",
                "Leading whitespace should be trimmed"
            );
        } else {
            panic!("Expected Text node");
        }
    }

    #[test]
    fn test_clean_nodes_normalize_text_with_newlines_and_indentation() {
        use crate::ast::template::Text;
        use crate::compiler::CompileOptions;
        use crate::compiler::phases::phase2_analyze::scope::Scope;
        use crate::compiler::phases::phase2_analyze::types::ComponentAnalysis;
        use compact_str::CompactString;

        let options = CompileOptions::default();
        let scope = Scope::new(None);
        let analysis = ComponentAnalysis::new("", &options);

        // Create a text node like "\n\t\tButton\n\t" (typical in formatted HTML)
        let nodes = vec![TemplateNode::Text(Text {
            start: 0,
            end: 12,
            raw: CompactString::new("\n\t\tButton\n\t"),
            data: CompactString::new("\n\t\tButton\n\t"),
        })];

        let cleaned = clean_nodes(None, &nodes, &[], "html", &scope, &analysis, false, false);

        assert_eq!(cleaned.trimmed.len(), 1);
        if let TemplateNode::Text(t) = &cleaned.trimmed[0] {
            assert_eq!(
                t.data.as_str(),
                "Button",
                "Whitespace around text should be trimmed: got {:?}",
                t.data.as_str()
            );
            assert_eq!(
                t.raw.as_str(),
                "Button",
                "Raw whitespace should also be trimmed: got {:?}",
                t.raw.as_str()
            );
        } else {
            panic!("Expected Text node");
        }
    }
}
