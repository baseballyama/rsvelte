//! CSS warnings for unused selectors.
//!
//! Generates warnings for CSS selectors that don't match any elements.
//!
//! Corresponds to Svelte's `2-analyze/css/css-warn.js`.

use crate::ast::css::StyleSheet;

/// Warning for an unused CSS selector.
#[derive(Debug, Clone)]
pub struct CssWarning {
    /// The selector text that is unused.
    pub selector: String,
    /// Start position in source.
    pub start: u32,
    /// End position in source.
    pub end: u32,
    /// Warning message.
    pub message: String,
}

/// Collect warnings for unused CSS selectors.
pub fn warn_unused(stylesheet: &StyleSheet) -> Vec<CssWarning> {
    let mut warnings = Vec::new();
    collect_warnings(stylesheet, &mut warnings);
    warnings
}

fn collect_warnings(stylesheet: &StyleSheet, warnings: &mut Vec<CssWarning>) {
    for child in &stylesheet.children {
        collect_node_warnings(child, warnings);
    }
}

fn collect_node_warnings(node: &serde_json::Value, warnings: &mut Vec<CssWarning>) {
    if let Some(node_type) = node.get("type").and_then(|t| t.as_str()) {
        match node_type {
            "Rule" => {
                collect_rule_warnings(node, warnings);
            }
            "Atrule" => {
                if let Some(block) = node.get("block") {
                    if let Some(children) = block.get("children").and_then(|c| c.as_array()) {
                        for child in children {
                            collect_node_warnings(child, warnings);
                        }
                    }
                }
            }
            _ => {}
        }
    }
}

fn collect_rule_warnings(rule: &serde_json::Value, warnings: &mut Vec<CssWarning>) {
    // Check if the rule has unused metadata
    if let Some(metadata) = rule.get("metadata") {
        if let Some(used) = metadata.get("used").and_then(|u| u.as_bool()) {
            if !used {
                let start = rule.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as u32;
                let end = rule.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as u32;

                warnings.push(CssWarning {
                    selector: format!("selector at {}:{}", start, end),
                    start,
                    end,
                    message: "Unused CSS selector".to_string(),
                });
            }
        }
    }

    // Recursively check nested rules
    if let Some(block) = rule.get("block") {
        if let Some(children) = block.get("children").and_then(|c| c.as_array()) {
            for child in children {
                collect_node_warnings(child, warnings);
            }
        }
    }
}

/// Check if a stylesheet has any unused selectors.
pub fn has_unused_selectors(stylesheet: &StyleSheet) -> bool {
    !warn_unused(stylesheet).is_empty()
}
