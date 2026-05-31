//! CSS pruning for unused selectors.
//!
//! Marks CSS selectors as used or unused based on template analysis.
//!
//! Corresponds to Svelte's `2-analyze/css/css-prune.js`.

use super::super::types::ComponentAnalysis;
use crate::ast::css::StyleSheet;

/// Prune unused CSS selectors based on template elements.
pub fn prune_css(stylesheet: &StyleSheet, analysis: &ComponentAnalysis) {
    for child in &stylesheet.children {
        prune_css_node(child, analysis);
    }
}

fn prune_css_node(node: &serde_json::Value, analysis: &ComponentAnalysis) {
    if let Some(node_type) = node.get("type").and_then(|t| t.as_str()) {
        match node_type {
            "Rule" => {
                prune_rule(node, analysis);
            }
            "Atrule" => {
                if let Some(block) = node.get("block")
                    && let Some(children) = block.get("children").and_then(|c| c.as_array())
                {
                    for child in children {
                        prune_css_node(child, analysis);
                    }
                }
            }
            _ => {}
        }
    }
}

fn prune_rule(node: &serde_json::Value, analysis: &ComponentAnalysis) {
    // Check each selector against template elements
    if let Some(prelude) = node.get("prelude") {
        let _used = check_selector_usage(prelude, analysis);
        // In a full implementation, we would mark the selector metadata
    }

    // Recursively prune nested rules
    if let Some(block) = node.get("block")
        && let Some(children) = block.get("children").and_then(|c| c.as_array())
    {
        for child in children {
            prune_css_node(child, analysis);
        }
    }
}

fn check_selector_usage(prelude: &serde_json::Value, analysis: &ComponentAnalysis) -> bool {
    // Check if any selector matches template elements
    if let Some(children) = prelude.get("children").and_then(|c| c.as_array()) {
        for child in children {
            if check_complex_selector_usage(child, analysis) {
                return true;
            }
        }
    }
    false
}

fn check_complex_selector_usage(
    selector: &serde_json::Value,
    analysis: &ComponentAnalysis,
) -> bool {
    // Check each relative selector
    if let Some(children) = selector.get("children").and_then(|c| c.as_array()) {
        for child in children {
            if check_relative_selector_usage(child, analysis) {
                return true;
            }
        }
    }
    false
}

fn check_relative_selector_usage(
    selector: &serde_json::Value,
    analysis: &ComponentAnalysis,
) -> bool {
    // Check each simple selector
    if let Some(selectors) = selector.get("selectors").and_then(|s| s.as_array()) {
        for sel in selectors {
            if check_simple_selector_usage(sel, analysis) {
                return true;
            }
        }
    }
    false
}

fn check_simple_selector_usage(selector: &serde_json::Value, analysis: &ComponentAnalysis) -> bool {
    if let Some(sel_type) = selector.get("type").and_then(|t| t.as_str()) {
        match sel_type {
            "TypeSelector" => {
                if let Some(name) = selector.get("name").and_then(|n| n.as_str()) {
                    return analysis.css.used_elements.contains(name)
                        || analysis.css.has_dynamic_elements;
                }
            }
            "ClassSelector" => {
                if let Some(name) = selector.get("name").and_then(|n| n.as_str()) {
                    return analysis.css.used_classes.contains(name)
                        || analysis.css.has_dynamic_classes;
                }
            }
            "IdSelector" => {
                if let Some(name) = selector.get("name").and_then(|n| n.as_str()) {
                    return analysis.css.used_ids.contains(name);
                }
            }
            "PseudoClassSelector" | "PseudoElementSelector" | "AttributeSelector" => {
                // These are potentially used
                return true;
            }
            _ => {}
        }
    }
    false
}
