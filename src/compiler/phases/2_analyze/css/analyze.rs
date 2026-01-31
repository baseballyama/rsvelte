//! CSS semantic analysis.
//!
//! Analyzes CSS for keyframes, :global selectors, and other metadata.
//!
//! Corresponds to Svelte's `2-analyze/css/css-analyze.js`.

use super::super::types::ComponentAnalysis;
use super::super::{AnalysisError, errors};
use crate::ast::css::StyleSheet;

/// Analyze a CSS stylesheet.
pub fn analyze_css(
    stylesheet: &StyleSheet,
    analysis: &mut ComponentAnalysis,
) -> Result<(), AnalysisError> {
    // Parse the CSS children (which are JSON values)
    for child in &stylesheet.children {
        analyze_css_node(child, analysis, false)?;
    }
    Ok(())
}

fn analyze_css_node(
    node: &serde_json::Value,
    analysis: &mut ComponentAnalysis,
    is_nested: bool,
) -> Result<(), AnalysisError> {
    if let Some(node_type) = node.get("type").and_then(|t| t.as_str()) {
        match node_type {
            "Atrule" => {
                analyze_atrule(node, analysis, is_nested)?;
            }
            "Rule" => {
                analyze_rule(node, analysis, is_nested)?;
            }
            _ => {}
        }
    }
    Ok(())
}

fn analyze_atrule(
    node: &serde_json::Value,
    analysis: &mut ComponentAnalysis,
    is_nested: bool,
) -> Result<(), AnalysisError> {
    let is_keyframes = if let Some(name) = node.get("name").and_then(|n| n.as_str()) {
        matches!(
            name,
            "keyframes" | "-webkit-keyframes" | "-moz-keyframes" | "-o-keyframes"
        )
    } else {
        false
    };

    if is_keyframes
        && let Some(prelude) = node.get("prelude").and_then(|p| p.as_str())
        && !prelude.starts_with("-global-")
    {
        analysis.css.keyframes.push(prelude.to_string());
    } else if is_keyframes
        && let Some(prelude) = node.get("prelude").and_then(|p| p.as_str())
        && prelude.starts_with("-global-")
    {
        analysis.css.has_global = true;
    }

    // Analyze children (skip validation for keyframes rules)
    if let Some(block) = node.get("block")
        && let Some(children) = block.get("children").and_then(|c| c.as_array())
    {
        for child in children {
            // Don't validate rules inside @keyframes blocks
            if is_keyframes {
                // Just check for global in nested rules but don't validate selectors
                if child.get("type").and_then(|t| t.as_str()) == Some("Rule") {
                    if let Some(prelude) = child.get("prelude")
                        && has_global_selector(prelude)
                    {
                        analysis.css.has_global = true;
                    }
                    // Recursively process nested rules within keyframe rules
                    if let Some(block) = child.get("block")
                        && let Some(nested_children) =
                            block.get("children").and_then(|c| c.as_array())
                    {
                        for nested_child in nested_children {
                            analyze_css_node(nested_child, analysis, is_nested)?;
                        }
                    }
                } else {
                    analyze_css_node(child, analysis, is_nested)?;
                }
            } else {
                analyze_css_node(child, analysis, is_nested)?;
            }
        }
    }
    Ok(())
}

fn analyze_rule(
    node: &serde_json::Value,
    analysis: &mut ComponentAnalysis,
    is_nested: bool,
) -> Result<(), AnalysisError> {
    // Check if this rule has global selectors
    if let Some(prelude) = node.get("prelude")
        && has_global_selector(prelude)
    {
        analysis.css.has_global = true;
    }

    // Validate :global() selectors
    if let Some(prelude) = node.get("prelude") {
        validate_selectors(prelude, is_nested)?;
    }

    // Analyze children (nested rules)
    if let Some(block) = node.get("block")
        && let Some(children) = block.get("children").and_then(|c| c.as_array())
    {
        for child in children {
            // Children of a rule are nested rules
            analyze_css_node(child, analysis, true)?;
        }
    }
    Ok(())
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

/// Validate :global() selectors in a prelude (SelectorList).
fn validate_selectors(prelude: &serde_json::Value, is_nested: bool) -> Result<(), AnalysisError> {
    // prelude is a SelectorList with children (ComplexSelectors)
    if let Some(complex_selectors) = prelude.get("children").and_then(|c| c.as_array()) {
        for complex_selector in complex_selectors {
            validate_complex_selector(complex_selector, is_nested)?;
        }
    }
    Ok(())
}

/// Validate a ComplexSelector for :global() usage.
fn validate_complex_selector(
    complex_selector: &serde_json::Value,
    is_nested: bool,
) -> Result<(), AnalysisError> {
    // ComplexSelector has children (RelativeSelectors)
    let children = match complex_selector.get("children").and_then(|c| c.as_array()) {
        Some(c) => c,
        None => return Ok(()),
    };

    // Find if there's a :global in this complex selector
    let global_idx = children.iter().position(|relative_selector| {
        if let Some(selectors) = relative_selector
            .get("selectors")
            .and_then(|s| s.as_array())
        {
            selectors.iter().any(|sel| {
                sel.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                    && sel.get("name").and_then(|n| n.as_str()) == Some("global")
            })
        } else {
            false
        }
    });

    if let Some(idx) = global_idx {
        // Check if :global() is in the middle of the selector sequence
        let global_relative = &children[idx];
        if let Some(selectors) = global_relative.get("selectors").and_then(|s| s.as_array()) {
            for selector in selectors {
                if let Some(sel_type) = selector.get("type").and_then(|t| t.as_str())
                    && sel_type == "PseudoClassSelector"
                    && let Some(name) = selector.get("name").and_then(|n| n.as_str())
                    && name == "global"
                {
                    // Check if :global has args (i.e., :global(...) not just :global)
                    let has_args = selector.get("args").is_some();

                    if has_args && idx != 0 && idx != children.len() - 1 {
                        // :global(...) is in the middle - check if all following are also :global
                        for child in children.iter().skip(idx + 1) {
                            if !is_global_relative(child) {
                                return Err(errors::css_global_invalid_placement());
                            }
                        }
                    }

                    // Validate :global(...) selector contents
                    if let Some(args) = selector.get("args") {
                        validate_global_args(args, children.len(), selectors.len())?;
                    }

                    // Check for type selector position
                    validate_global_type_selector_position(selector, selectors)?;
                }
            }
        }
    }

    // Validate each RelativeSelector
    for (i, relative_selector) in children.iter().enumerate() {
        // Check for combinator at the start (first RelativeSelector)
        // Starting with a combinator is only valid in nested rules (e.g., .foo { > .bar {} })
        if i == 0
            && !is_nested
            && let Some(combinator) = relative_selector.get("combinator")
            && combinator.get("type").and_then(|t| t.as_str()) == Some("Combinator")
        {
            // Starting with a combinator is invalid at top-level
            return Err(errors::css_selector_invalid());
        }

        validate_relative_selector(relative_selector)?;
    }

    // Check for combinator at the end (last RelativeSelector with no selectors)
    if let Some(last) = children.last()
        && let Some(selectors) = last.get("selectors").and_then(|s| s.as_array())
        && selectors.is_empty()
        && last.get("combinator").is_some()
    {
        // Ends with a combinator (no selector after it)
        return Err(errors::css_selector_invalid());
    }

    Ok(())
}

/// Check if a RelativeSelector is :global.
fn is_global_relative(relative_selector: &serde_json::Value) -> bool {
    if let Some(selectors) = relative_selector
        .get("selectors")
        .and_then(|s| s.as_array())
    {
        selectors.iter().any(|sel| {
            sel.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                && sel.get("name").and_then(|n| n.as_str()) == Some("global")
        })
    } else {
        false
    }
}

/// Validate the arguments of :global(...).
fn validate_global_args(
    args: &serde_json::Value,
    num_children: usize,
    num_selectors: usize,
) -> Result<(), AnalysisError> {
    // args should have children (SelectorList)
    if let Some(arg_children) = args.get("children").and_then(|c| c.as_array()) {
        // Ensure :global(...) contains exactly one selector
        // (standalone :global() with multiple selectors is OK)
        if arg_children.len() > 1 && (num_children > 1 || num_selectors > 1) {
            return Err(errors::css_global_invalid_selector());
        }
    }
    Ok(())
}

/// Validate type selector position in :global(...).
fn validate_global_type_selector_position(
    global_selector: &serde_json::Value,
    all_selectors: &[serde_json::Value],
) -> Result<(), AnalysisError> {
    // Find position of global_selector in all_selectors
    let global_idx = all_selectors
        .iter()
        .position(|s| std::ptr::eq(s, global_selector))
        .unwrap_or(0);

    // Check if :global(...) contains a type selector and is not at the first position
    if let Some(args) = global_selector.get("args")
        && let Some(arg_children) = args.get("children").and_then(|c| c.as_array())
        && let Some(first_complex) = arg_children.first()
        && let Some(first_relative_children) =
            first_complex.get("children").and_then(|c| c.as_array())
        && let Some(first_relative) = first_relative_children.first()
        && let Some(first_relative_selectors) =
            first_relative.get("selectors").and_then(|s| s.as_array())
        && let Some(first_sel) = first_relative_selectors.first()
        && first_sel.get("type").and_then(|t| t.as_str()) == Some("TypeSelector")
        && global_idx != 0
    {
        return Err(errors::css_global_invalid_selector_list());
    }

    // Check if :global(...) is followed by a type selector
    if let Some(next_sel) = all_selectors.get(global_idx + 1)
        && next_sel.get("type").and_then(|t| t.as_str()) == Some("TypeSelector")
    {
        return Err(errors::css_type_selector_invalid_placement());
    }

    Ok(())
}

/// Validate a RelativeSelector.
fn validate_relative_selector(relative_selector: &serde_json::Value) -> Result<(), AnalysisError> {
    // Check for combinator at the start (invalid unless nested or inside :has())
    if let Some(combinator) = relative_selector.get("combinator")
        && combinator.get("type").and_then(|t| t.as_str()) == Some("Combinator")
    {
        // This would need parent context to determine if it's the first in sequence
        // For now, we'll skip this check as it requires path information
    }
    Ok(())
}
