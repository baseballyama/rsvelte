//! CSS utility functions.
//!
//! Provides helper functions for CSS analysis.
//!
//! Corresponds to Svelte's `2-analyze/css/utils.js`.

/// Sentinel value for unknown CSS values.
#[derive(Debug, Clone, PartialEq)]
pub struct Unknown;

/// Returns all parent rules from a rule path; root is last.
pub fn get_parent_rules<'a>(path: &[&'a serde_json::Value]) -> Vec<&'a serde_json::Value> {
    path.iter()
        .filter(|node| {
            node.get("type")
                .and_then(|t| t.as_str())
                .map(|t| t == "Rule")
                .unwrap_or(false)
        })
        .copied()
        .collect()
}

/// True if a relative selector is `:global(...)` or `:global`.
pub fn is_global(selector: &serde_json::Value) -> bool {
    if let Some(selectors) = selector.get("selectors").and_then(|s| s.as_array()) {
        if let Some(first) = selectors.first() {
            if let Some(sel_type) = first.get("type").and_then(|t| t.as_str()) {
                if sel_type == "PseudoClassSelector" {
                    if let Some(name) = first.get("name").and_then(|n| n.as_str()) {
                        return name == "global";
                    }
                }
            }
        }
    }
    false
}

/// `true` if is a pseudo class that cannot be or is not scoped.
pub fn is_unscoped_pseudo_class(selector: &serde_json::Value) -> bool {
    if let Some(sel_type) = selector.get("type").and_then(|t| t.as_str()) {
        if sel_type == "PseudoClassSelector" {
            if let Some(name) = selector.get("name").and_then(|n| n.as_str()) {
                // These pseudo-classes can contain scoped selectors
                let scoping_pseudo = matches!(name, "has" | "is" | "where" | "not");
                if !scoping_pseudo {
                    return true;
                }

                // Check if args is null (no children to scope)
                if selector.get("args").is_none() {
                    return true;
                }
            }
        }
    }
    false
}

/// True if is `:global(...)` or `:global`, irrespective of scoped pseudo classes.
pub fn is_outer_global(selector: &serde_json::Value) -> bool {
    if let Some(selectors) = selector.get("selectors").and_then(|s| s.as_array()) {
        if let Some(first) = selectors.first() {
            if let Some(sel_type) = first.get("type").and_then(|t| t.as_str()) {
                if sel_type == "PseudoClassSelector" {
                    if let Some(name) = first.get("name").and_then(|n| n.as_str()) {
                        if name == "global" {
                            // Check if all selectors are pseudo classes/elements
                            return selectors.iter().all(|s| {
                                matches!(
                                    s.get("type").and_then(|t| t.as_str()),
                                    Some("PseudoClassSelector") | Some("PseudoElementSelector")
                                )
                            });
                        }
                    }
                }
            }
        }
    }
    false
}

/// Get possible values from a text or expression chunk.
/// Returns `None` if any value is unknown.
pub fn get_possible_values(text: &str) -> Option<Vec<String>> {
    Some(text.split_whitespace().map(String::from).collect())
}

/// True if is `:global` (without arguments).
pub fn is_global_block_selector(selector: &serde_json::Value) -> bool {
    if let Some(sel_type) = selector.get("type").and_then(|t| t.as_str()) {
        if sel_type == "PseudoClassSelector" {
            if let Some(name) = selector.get("name").and_then(|n| n.as_str()) {
                return name == "global" && selector.get("args").is_none();
            }
        }
    }
    false
}
