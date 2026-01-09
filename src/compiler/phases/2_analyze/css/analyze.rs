//! CSS semantic analysis.
//!
//! Analyzes CSS for keyframes, :global selectors, and other metadata.
//!
//! Corresponds to Svelte's `2-analyze/css/css-analyze.js`.

use super::super::types::ComponentAnalysis;
use crate::ast::css::StyleSheet;

/// Analyze a CSS stylesheet.
pub fn analyze_css(stylesheet: &StyleSheet, analysis: &mut ComponentAnalysis) {
    // Parse the CSS children (which are JSON values)
    for child in &stylesheet.children {
        analyze_css_node(child, analysis);
    }
}

fn analyze_css_node(node: &serde_json::Value, analysis: &mut ComponentAnalysis) {
    if let Some(node_type) = node.get("type").and_then(|t| t.as_str()) {
        match node_type {
            "Atrule" => {
                analyze_atrule(node, analysis);
            }
            "Rule" => {
                analyze_rule(node, analysis);
            }
            _ => {}
        }
    }
}

fn analyze_atrule(node: &serde_json::Value, analysis: &mut ComponentAnalysis) {
    if let Some(name) = node.get("name").and_then(|n| n.as_str())
        && (name == "keyframes" || name == "-webkit-keyframes")
        && let Some(prelude) = node.get("prelude").and_then(|p| p.as_str())
        && !prelude.starts_with("-global-")
    {
        analysis.css.keyframes.push(prelude.to_string());
    } else if let Some(name) = node.get("name").and_then(|n| n.as_str())
        && (name == "keyframes" || name == "-webkit-keyframes")
        && let Some(prelude) = node.get("prelude").and_then(|p| p.as_str())
        && prelude.starts_with("-global-")
    {
        analysis.css.has_global = true;
    }

    // Analyze children
    if let Some(block) = node.get("block")
        && let Some(children) = block.get("children").and_then(|c| c.as_array())
    {
        for child in children {
            analyze_css_node(child, analysis);
        }
    }
}

fn analyze_rule(node: &serde_json::Value, analysis: &mut ComponentAnalysis) {
    // Check if this rule has global selectors
    if let Some(prelude) = node.get("prelude")
        && has_global_selector(prelude)
    {
        analysis.css.has_global = true;
    }

    // Analyze children (nested rules)
    if let Some(block) = node.get("block")
        && let Some(children) = block.get("children").and_then(|c| c.as_array())
    {
        for child in children {
            analyze_css_node(child, analysis);
        }
    }
}

fn has_global_selector(prelude: &serde_json::Value) -> bool {
    // Check if any selector in the prelude is :global
    if let Some(children) = prelude.get("children").and_then(|c| c.as_array()) {
        for child in children {
            if check_selector_for_global(child) {
                return true;
            }
        }
    }
    false
}

fn check_selector_for_global(selector: &serde_json::Value) -> bool {
    // Check if this selector or any of its children is :global
    if let Some(children) = selector.get("children").and_then(|c| c.as_array()) {
        for child in children {
            if let Some(selectors) = child.get("selectors").and_then(|s| s.as_array()) {
                for sel in selectors {
                    if let Some(sel_type) = sel.get("type").and_then(|t| t.as_str())
                        && sel_type == "PseudoClassSelector"
                        && let Some(name) = sel.get("name").and_then(|n| n.as_str())
                        && name == "global"
                    {
                        return true;
                    }
                }
            }
        }
    }
    false
}
