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

    // Analyze children (nested rules and declarations)
    if let Some(block) = node.get("block")
        && let Some(children) = block.get("children").and_then(|c| c.as_array())
    {
        for child in children {
            // Check for empty declarations
            // Note: CSS custom properties (--foo: ;) are allowed to have empty values
            // Only report error for non-custom properties with empty values
            if let Some(child_type) = child.get("type").and_then(|t| t.as_str())
                && child_type == "Declaration"
            {
                let property = child.get("property").and_then(|p| p.as_str()).unwrap_or("");
                let is_custom_property = property.starts_with("--");

                // Check if the declaration value is empty (null or empty string)
                let value = child.get("value");
                let is_empty = match value {
                    None => true,
                    Some(v) if v.is_null() => true,
                    Some(v) if v.as_str() == Some("") => true,
                    _ => false,
                };

                // Only error for empty values on non-custom properties
                if is_empty && !is_custom_property {
                    return Err(errors::css_empty_declaration());
                }
            }
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

    // Find if there's a :global(...) or :global in this complex selector.
    // Match the official Svelte's is_global() which checks if the FIRST selector
    // in a RelativeSelector is :global.
    let global_idx = children.iter().position(is_global_relative);

    if let Some(idx) = global_idx {
        let global_relative = &children[idx];

        // Check :global block invalid placement (nested context with :global without args)
        if let Some(selectors) = global_relative.get("selectors").and_then(|s| s.as_array())
            && let Some(first_sel) = selectors.first()
        {
            let is_pseudo_class_nested =
                is_nested && first_sel.get("args").and_then(|a| a.as_null()).is_some();
            let _ = is_pseudo_class_nested; // Used for css_global_block_invalid_placement (TODO)
        }

        // Check if :global(...) with args is in the middle of the selector
        if let Some(selectors) = global_relative.get("selectors").and_then(|s| s.as_array())
            && let Some(first_sel) = selectors.first()
            && first_sel.get("args").is_some()
        {
            // Determine if :global is effectively at the start or end of the selector.
            // Skip empty RelativeSelectors (parser artifacts) when checking position.
            let is_at_start = children[..idx].iter().all(|child| {
                child
                    .get("selectors")
                    .and_then(|s| s.as_array())
                    .is_none_or(|s| s.is_empty())
            });
            let is_at_end = idx == children.len() - 1;

            if !is_at_start && !is_at_end {
                // :global(...) is in the middle - check if all following are also :global
                // (multiple :global(...) in sequence are OK)
                for child in children.iter().skip(idx + 1) {
                    if !is_global_relative(child) {
                        return Err(errors::css_global_invalid_placement());
                    }
                }
            }
        }
    }

    // Validate :global(...) selector contents and positioning within each RelativeSelector
    for relative_selector in children.iter() {
        if let Some(selectors) = relative_selector
            .get("selectors")
            .and_then(|s| s.as_array())
        {
            for (i, selector) in selectors.iter().enumerate() {
                if let Some(sel_type) = selector.get("type").and_then(|t| t.as_str())
                    && sel_type == "PseudoClassSelector"
                    && let Some(name) = selector.get("name").and_then(|n| n.as_str())
                    && name == "global"
                {
                    // Validate :global(...) selector contents
                    if let Some(args) = selector.get("args") {
                        validate_global_args(args, children.len(), selectors.len())?;
                    }

                    // Ensure :global(element) is at first position in compound selector
                    if let Some(args) = selector.get("args")
                        && let Some(args_children) = args.get("children").and_then(|c| c.as_array())
                        && let Some(first_complex) = args_children.first()
                        && let Some(complex_children) =
                            first_complex.get("children").and_then(|c| c.as_array())
                        && let Some(first_rel) = complex_children.first()
                        && let Some(rel_sels) =
                            first_rel.get("selectors").and_then(|s| s.as_array())
                        && let Some(first_inner) = rel_sels.first()
                        && first_inner.get("type").and_then(|t| t.as_str()) == Some("TypeSelector")
                        && i != 0
                    {
                        return Err(errors::css_global_invalid_selector_list());
                    }

                    // Ensure :global(.class) is not followed by a type selector
                    if let Some(next_sel) = selectors.get(i + 1)
                        && next_sel.get("type").and_then(|t| t.as_str()) == Some("TypeSelector")
                    {
                        return Err(errors::css_type_selector_invalid_placement());
                    }

                    // Ensure :global(...) contains a single selector
                    // (standalone :global() with multiple selectors is OK)
                    if selector.get("args").is_some()
                        && let Some(args) = selector.get("args")
                        && args.as_null().is_none()
                        && let Some(args_children) = args.get("children").and_then(|c| c.as_array())
                        && args_children.len() > 1
                        && (children.len() > 1 || selectors.len() > 1)
                    {
                        return Err(errors::css_global_invalid_selector());
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

/// Check if a RelativeSelector is :global (or :global(...)).
/// Matches the official Svelte's is_global() which checks the FIRST selector.
fn is_global_relative(relative_selector: &serde_json::Value) -> bool {
    if let Some(selectors) = relative_selector
        .get("selectors")
        .and_then(|s| s.as_array())
    {
        if let Some(first) = selectors.first() {
            first.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                && first.get("name").and_then(|n| n.as_str()) == Some("global")
        } else {
            false
        }
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

/// Extract CSS selector components from the stylesheet.
/// This populates selector_tag_names, selector_class_names, selector_id_names,
/// and has_universal_selector in the CssAnalysis.
pub fn extract_css_selector_info(stylesheet: &StyleSheet, analysis: &mut ComponentAnalysis) {
    for child in &stylesheet.children {
        extract_selectors_from_node(child, analysis);
    }
}

fn extract_selectors_from_node(node: &serde_json::Value, analysis: &mut ComponentAnalysis) {
    if let Some(node_type) = node.get("type").and_then(|t| t.as_str()) {
        match node_type {
            "Rule" => {
                // Extract selectors from the rule's prelude
                if let Some(prelude) = node.get("prelude") {
                    extract_selectors_from_prelude(prelude, analysis);
                }
                // Recursively process nested rules
                if let Some(block) = node.get("block")
                    && let Some(children) = block.get("children").and_then(|c| c.as_array())
                {
                    for child in children {
                        extract_selectors_from_node(child, analysis);
                    }
                }
            }
            "Atrule" => {
                if let Some(block) = node.get("block")
                    && let Some(children) = block.get("children").and_then(|c| c.as_array())
                {
                    for child in children {
                        extract_selectors_from_node(child, analysis);
                    }
                }
            }
            _ => {}
        }
    }
}

fn extract_selectors_from_prelude(prelude: &serde_json::Value, analysis: &mut ComponentAnalysis) {
    // prelude is a SelectorList with children (ComplexSelectors)
    if let Some(complex_selectors) = prelude.get("children").and_then(|c| c.as_array()) {
        for complex_selector in complex_selectors {
            extract_selectors_from_complex(complex_selector, analysis);
        }
    }
}

fn extract_selectors_from_complex(
    complex_selector: &serde_json::Value,
    analysis: &mut ComponentAnalysis,
) {
    // ComplexSelector has children (RelativeSelectors)
    if let Some(relative_selectors) = complex_selector.get("children").and_then(|c| c.as_array()) {
        for relative_selector in relative_selectors {
            if let Some(selectors) = relative_selector
                .get("selectors")
                .and_then(|s| s.as_array())
            {
                for sel in selectors {
                    extract_simple_selector(sel, analysis);
                }
            }
        }
    }
}

fn extract_simple_selector(selector: &serde_json::Value, analysis: &mut ComponentAnalysis) {
    if let Some(sel_type) = selector.get("type").and_then(|t| t.as_str()) {
        match sel_type {
            "TypeSelector" => {
                if let Some(name) = selector.get("name").and_then(|n| n.as_str()) {
                    if name == "*" {
                        analysis.css.has_universal_selector = true;
                    } else {
                        analysis.css.selector_tag_names.insert(name.to_string());
                    }
                }
            }
            "ClassSelector" => {
                if let Some(name) = selector.get("name").and_then(|n| n.as_str()) {
                    analysis.css.selector_class_names.insert(name.to_string());
                }
            }
            "IdSelector" => {
                if let Some(name) = selector.get("name").and_then(|n| n.as_str()) {
                    analysis.css.selector_id_names.insert(name.to_string());
                }
            }
            "PseudoClassSelector" => {
                // Process :global() args and other pseudo-classes
                if let Some(name) = selector.get("name").and_then(|n| n.as_str()) {
                    if name == "global" {
                        // Extract selectors from :global() args
                        if let Some(args) = selector.get("args") {
                            extract_selectors_from_prelude(args, analysis);
                        }
                    } else if name == "is" || name == "where" || name == "not" || name == "has" {
                        // Extract selectors from pseudo-class args
                        if let Some(args) = selector.get("args") {
                            extract_selectors_from_prelude(args, analysis);
                        }
                    }
                }
            }
            "NestingSelector" => {
                // `&` selector - doesn't add any specific match info
            }
            "AttributeSelector" => {
                // Attribute selectors could match any element
                // We don't need to mark as universal since we check attributes per-element
            }
            _ => {}
        }
    }
}
