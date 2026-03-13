//! CSS semantic analysis.
//!
//! Analyzes CSS for keyframes, :global selectors, and other metadata.
//!
//! Corresponds to Svelte's `2-analyze/css/css-analyze.js`.
#![allow(clippy::collapsible_if)]

use super::super::types::ComponentAnalysis;
use super::super::{AnalysisError, errors};
use crate::ast::css::StyleSheet;

/// Context passed through CSS analysis, tracking parent rule information.
struct CssAnalysisState<'a> {
    /// The current parent Rule node (if inside a rule).
    parent_rule: Option<&'a serde_json::Value>,
    /// Whether the parent rule itself has a parent rule.
    parent_rule_has_parent: bool,
    /// Whether we're inside a pseudoclass selector context.
    in_pseudoclass: bool,
}

/// Analyze a CSS stylesheet.
pub fn analyze_css(
    stylesheet: &StyleSheet,
    analysis: &mut ComponentAnalysis,
) -> Result<(), AnalysisError> {
    let state = CssAnalysisState {
        parent_rule: None,
        parent_rule_has_parent: false,
        in_pseudoclass: false,
    };
    for child in &stylesheet.children {
        analyze_css_node(child, analysis, &state)?;
    }
    Ok(())
}

fn analyze_css_node(
    node: &serde_json::Value,
    analysis: &mut ComponentAnalysis,
    state: &CssAnalysisState,
) -> Result<(), AnalysisError> {
    if let Some(node_type) = node.get("type").and_then(|t| t.as_str()) {
        match node_type {
            "Atrule" => {
                analyze_atrule(node, analysis, state)?;
            }
            "Rule" => {
                analyze_rule(node, analysis, state)?;
            }
            _ => {}
        }
    }
    Ok(())
}

fn analyze_atrule(
    node: &serde_json::Value,
    analysis: &mut ComponentAnalysis,
    state: &CssAnalysisState,
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
            if is_keyframes {
                if child.get("type").and_then(|t| t.as_str()) == Some("Rule") {
                    if let Some(prelude) = child.get("prelude")
                        && has_global_selector(prelude)
                    {
                        analysis.css.has_global = true;
                    }
                    if let Some(block) = child.get("block")
                        && let Some(nested_children) =
                            block.get("children").and_then(|c| c.as_array())
                    {
                        for nested_child in nested_children {
                            analyze_css_node(nested_child, analysis, state)?;
                        }
                    }
                } else {
                    analyze_css_node(child, analysis, state)?;
                }
            } else {
                analyze_css_node(child, analysis, state)?;
            }
        }
    }
    Ok(())
}

/// Check if a simple selector is a `:global` block selector (without args).
fn is_global_block_selector(simple_selector: &serde_json::Value) -> bool {
    simple_selector.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
        && simple_selector.get("name").and_then(|n| n.as_str()) == Some("global")
        && !simple_selector
            .as_object()
            .is_some_and(|obj| obj.contains_key("args"))
}

fn analyze_rule(
    node: &serde_json::Value,
    analysis: &mut ComponentAnalysis,
    state: &CssAnalysisState,
) -> Result<(), AnalysisError> {
    // Check if this rule should set has_global on the analysis.
    // This mirrors the official Svelte's Rule visitor logic:
    //   analysis.css.has_global ||=
    //     has_global_selectors &&
    //     block has declarations &&
    //     is_unscoped(path) (all ancestor Rules also have global selectors)
    if let Some(prelude) = node.get("prelude") {
        let all_selectors_global = is_prelude_fully_global(prelude);
        if all_selectors_global {
            // Check if block has at least one Declaration
            let has_declarations = node
                .get("block")
                .and_then(|b| b.get("children"))
                .and_then(|c| c.as_array())
                .map(|children| {
                    children
                        .iter()
                        .any(|c| c.get("type").and_then(|t| t.as_str()) == Some("Declaration"))
                })
                .unwrap_or(false);

            // Check if the path is unscoped (all parent Rules also have global selectors).
            // If there's no parent rule, the path is trivially unscoped.
            // If there is a parent rule, we need its prelude to also be fully global.
            let parent_is_unscoped = state
                .parent_rule
                .map(|parent| {
                    parent
                        .get("prelude")
                        .map(is_prelude_fully_global)
                        .unwrap_or(false)
                })
                .unwrap_or(true);

            if has_declarations && parent_is_unscoped {
                analysis.css.has_global = true;
            }
        }
    }

    // Track whether this rule is a :global block
    let mut is_global_block = false;

    // === Rule visitor: :global block validation ===
    // This mirrors the official Svelte's Rule visitor in css-analyze.js
    if let Some(prelude) = node.get("prelude") {
        if let Some(complex_selectors) = prelude.get("children").and_then(|c| c.as_array()) {
            for complex_selector in complex_selectors {
                let children = match complex_selector.get("children").and_then(|c| c.as_array()) {
                    Some(c) => c,
                    None => continue,
                };

                let mut local_is_global_block = false;

                for (selector_idx, child) in children.iter().enumerate() {
                    let selectors = match child.get("selectors").and_then(|s| s.as_array()) {
                        Some(s) => s,
                        None => continue,
                    };

                    // Find index of :global block selector (without args) in this RelativeSelector
                    let idx = selectors.iter().position(is_global_block_selector);

                    if let Some(idx) = idx {
                        if idx == 0 {
                            // :global is the first selector in this RelativeSelector
                            if selectors.len() > 1
                                && selector_idx == 0
                                && state.parent_rule.is_none()
                            {
                                // e.g. `:global.x { ... }` at root level
                                return Err(errors::css_global_block_invalid_modifier_start());
                            } else {
                                // Mark as global block
                                is_global_block = true;
                                local_is_global_block = true;

                                // Check combinator: :global cannot follow a non-space combinator
                                if let Some(combinator) = child.get("combinator") {
                                    let comb_name = combinator
                                        .get("name")
                                        .and_then(|n| n.as_str())
                                        .unwrap_or(" ");
                                    if comb_name != " " {
                                        return Err(errors::css_global_block_invalid_combinator(
                                            comb_name,
                                        ));
                                    }
                                }

                                // Check for declarations in lone top-level :global
                                let is_lone_global = children.len() == 1 && selectors.len() == 1;

                                if is_lone_global && complex_selectors.len() > 1 {
                                    // `:global, :global x { ... }` is invalid
                                    return Err(errors::css_global_block_invalid_list());
                                }

                                if is_lone_global {
                                    // Check if the block contains declarations (not just nested rules)
                                    if let Some(block) = node.get("block")
                                        && let Some(block_children) =
                                            block.get("children").and_then(|c| c.as_array())
                                    {
                                        let has_declaration = block_children.iter().any(|c| {
                                            c.get("type").and_then(|t| t.as_str())
                                                == Some("Declaration")
                                        });

                                        // :global { color: red; } is invalid but
                                        // foo :global { color: red; } is valid
                                        if has_declaration && complex_selectors.len() == 1 {
                                            return Err(
                                                errors::css_global_block_invalid_declaration(),
                                            );
                                        }
                                    }
                                }
                            }
                        } else {
                            // :global at non-zero position -> modifier
                            return Err(errors::css_global_block_invalid_modifier());
                        }
                    }
                }

                // If this rule was marked as global block from a previous ComplexSelector
                // but this ComplexSelector doesn't have :global, that's invalid
                if is_global_block && !local_is_global_block {
                    return Err(errors::css_global_block_invalid_list());
                }
            }
        }
    }

    // === Validate :global(...) selectors (with args) and other selector validations ===
    if let Some(prelude) = node.get("prelude") {
        validate_selectors(prelude, state)?;
    }

    // === Validate NestingSelector (&) usage ===
    if let Some(prelude) = node.get("prelude") {
        validate_nesting_selectors(prelude, state, node, is_global_block)?;
    }

    // Analyze children (nested rules and declarations)
    let child_state = CssAnalysisState {
        parent_rule: Some(node),
        parent_rule_has_parent: state.parent_rule.is_some(),
        in_pseudoclass: false,
    };
    if let Some(block) = node.get("block")
        && let Some(children) = block.get("children").and_then(|c| c.as_array())
    {
        for child in children {
            if let Some(child_type) = child.get("type").and_then(|t| t.as_str())
                && child_type == "Declaration"
            {
                let property = child.get("property").and_then(|p| p.as_str()).unwrap_or("");
                let is_custom_property = property.starts_with("--");

                let value = child.get("value");
                let is_empty = match value {
                    None => true,
                    Some(v) if v.is_null() => true,
                    Some(v) if v.as_str() == Some("") => true,
                    _ => false,
                };

                if is_empty && !is_custom_property {
                    return Err(errors::css_empty_declaration());
                }
            }
            analyze_css_node(child, analysis, &child_state)?;
        }
    }
    Ok(())
}

/// Validate NestingSelector (&) usage in a prelude.
fn validate_nesting_selectors(
    prelude: &serde_json::Value,
    state: &CssAnalysisState,
    rule: &serde_json::Value,
    is_global_block: bool,
) -> Result<(), AnalysisError> {
    let complex_selectors = match prelude.get("children").and_then(|c| c.as_array()) {
        Some(c) => c,
        None => return Ok(()),
    };

    for complex_selector in complex_selectors {
        let children = match complex_selector.get("children").and_then(|c| c.as_array()) {
            Some(c) => c,
            None => continue,
        };

        for relative_selector in children {
            let selectors = match relative_selector
                .get("selectors")
                .and_then(|s| s.as_array())
            {
                Some(s) => s,
                None => continue,
            };

            for selector in selectors {
                if selector.get("type").and_then(|t| t.as_str()) == Some("NestingSelector") {
                    validate_single_nesting_selector(
                        selector,
                        state,
                        rule,
                        prelude,
                        complex_selectors,
                        children,
                        relative_selector,
                        selectors,
                        is_global_block,
                    )?;
                }

                // Also check inside pseudo-class args for NestingSelector
                if selector.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector") {
                    if let Some(args) = selector.get("args") {
                        validate_nesting_in_pseudo_args(args, state, rule)?;
                    }
                }
            }
        }
    }

    Ok(())
}

/// Validate a single NestingSelector node.
#[allow(clippy::too_many_arguments)]
fn validate_single_nesting_selector(
    _nesting_node: &serde_json::Value,
    state: &CssAnalysisState,
    _rule: &serde_json::Value,
    prelude: &serde_json::Value,
    _complex_selectors: &[serde_json::Value],
    _children: &[serde_json::Value],
    _relative_selector: &serde_json::Value,
    _selectors: &[serde_json::Value],
    is_global_block: bool,
) -> Result<(), AnalysisError> {
    if state.parent_rule.is_none() {
        // & at root level - only valid as the first selector inside a lone :global(...)
        // Check: is this rule's prelude a single :global(&) or :global(& ...) ?
        let complex_selectors = match prelude.get("children").and_then(|c| c.as_array()) {
            Some(c) => c,
            None => return Err(errors::css_nesting_selector_invalid_placement()),
        };

        // Must be a single complex selector
        if complex_selectors.len() > 1 {
            return Err(errors::css_nesting_selector_invalid_placement());
        }

        let children = match complex_selectors[0]
            .get("children")
            .and_then(|c| c.as_array())
        {
            Some(c) => c,
            None => return Err(errors::css_nesting_selector_invalid_placement()),
        };

        // Must be a single relative selector
        if children.len() > 1 {
            // This is OK if it's like `:global(&) div` - the & is inside :global(...) args
            // We need to check if the nesting selector is inside :global(...) args
            // For the root-level check, we just need to verify the first relative selector
            // has :global(...) with & as its first arg selector
        }

        let first_child = &children[0];
        let selectors = match first_child.get("selectors").and_then(|s| s.as_array()) {
            Some(s) => s,
            None => return Err(errors::css_nesting_selector_invalid_placement()),
        };

        if selectors.len() != 1 {
            return Err(errors::css_nesting_selector_invalid_placement());
        }

        let first_sel = &selectors[0];
        if first_sel.get("type").and_then(|t| t.as_str()) != Some("PseudoClassSelector")
            || first_sel.get("name").and_then(|n| n.as_str()) != Some("global")
        {
            return Err(errors::css_nesting_selector_invalid_placement());
        }

        // Check that & is the first selector inside :global(...)
        if let Some(args) = first_sel.get("args") {
            if let Some(args_children) = args.get("children").and_then(|c| c.as_array()) {
                if let Some(first_complex) = args_children.first() {
                    if let Some(first_complex_children) =
                        first_complex.get("children").and_then(|c| c.as_array())
                    {
                        if let Some(first_rel) = first_complex_children.first() {
                            if let Some(rel_sels) =
                                first_rel.get("selectors").and_then(|s| s.as_array())
                            {
                                if let Some(first_inner) = rel_sels.first() {
                                    if first_inner.get("type").and_then(|t| t.as_str())
                                        != Some("NestingSelector")
                                    {
                                        return Err(
                                            errors::css_nesting_selector_invalid_placement(),
                                        );
                                    }
                                    // & is the first selector inside :global(...) - valid
                                    return Ok(());
                                }
                            }
                        }
                    }
                }
            }
        }

        return Err(errors::css_nesting_selector_invalid_placement());
    }

    // Check: parent rule is a :global block without a grandparent rule,
    // and the parent has a lone :global selector
    if let Some(parent_rule) = state.parent_rule {
        if is_parent_lone_global_block(parent_rule) && !state.parent_rule_has_parent {
            return Err(errors::css_global_block_invalid_modifier_start());
        }
    }

    // Check if the direct parent rule is a global block with is_global_block flag
    // (This is for the case where we're inside a nested rule of a :global block)
    if is_global_block {
        // We're in a rule that IS a global block - that's fine, the & is used normally
    }

    Ok(())
}

/// Check if a rule is a lone :global block (single :global selector without extra selectors).
fn is_parent_lone_global_block(rule: &serde_json::Value) -> bool {
    if let Some(prelude) = rule.get("prelude") {
        if let Some(complex_selectors) = prelude.get("children").and_then(|c| c.as_array()) {
            if complex_selectors.len() != 1 {
                return false;
            }
            if let Some(children) = complex_selectors[0]
                .get("children")
                .and_then(|c| c.as_array())
            {
                if children.len() != 1 {
                    return false;
                }
                if let Some(selectors) = children[0].get("selectors").and_then(|s| s.as_array()) {
                    if selectors.len() != 1 {
                        return false;
                    }
                    return is_global_block_selector(&selectors[0]);
                }
            }
        }
    }
    false
}

/// Validate NestingSelector inside pseudo-class args (e.g., :global(& div)).
fn validate_nesting_in_pseudo_args(
    args: &serde_json::Value,
    state: &CssAnalysisState,
    _rule: &serde_json::Value,
) -> Result<(), AnalysisError> {
    // Walk through args looking for NestingSelector
    if let Some(children) = args.get("children").and_then(|c| c.as_array()) {
        for complex in children {
            if let Some(complex_children) = complex.get("children").and_then(|c| c.as_array()) {
                for relative in complex_children {
                    if let Some(selectors) = relative.get("selectors").and_then(|s| s.as_array()) {
                        for sel in selectors {
                            if sel.get("type").and_then(|t| t.as_str()) == Some("NestingSelector") {
                                // & inside :global(...) args at root level is OK
                                // only if it's the FIRST selector
                                // The css-nesting-selector-root test expects error for :global(div &)
                                // but NOT for :global(&) or :global(& div)
                                if state.parent_rule.is_none() {
                                    // Check if this & is the first selector in the first relative selector
                                    // of the first complex selector
                                    let is_first = children.first() == Some(complex)
                                        && complex_children.first() == Some(relative)
                                        && selectors.first() == Some(sel);

                                    if !is_first {
                                        return Err(
                                            errors::css_nesting_selector_invalid_placement(),
                                        );
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    Ok(())
}

/// Validate :global(...) selectors (with args) in a prelude, and :global block placement
/// inside pseudo-classes.
fn validate_selectors(
    prelude: &serde_json::Value,
    state: &CssAnalysisState,
) -> Result<(), AnalysisError> {
    if let Some(complex_selectors) = prelude.get("children").and_then(|c| c.as_array()) {
        for complex_selector in complex_selectors {
            validate_complex_selector(complex_selector, state)?;
        }
    }
    Ok(())
}

/// Validate a ComplexSelector for :global() usage.
fn validate_complex_selector(
    complex_selector: &serde_json::Value,
    state: &CssAnalysisState,
) -> Result<(), AnalysisError> {
    let children = match complex_selector.get("children").and_then(|c| c.as_array()) {
        Some(c) => c,
        None => return Ok(()),
    };

    // Find the first RelativeSelector that is :global
    let global_idx = children.iter().position(is_global_relative);

    if let Some(idx) = global_idx {
        let global_relative = &children[idx];

        // Check :global block invalid placement (inside a pseudoclass)
        if let Some(selectors) = global_relative.get("selectors").and_then(|s| s.as_array()) {
            if let Some(first_sel) = selectors.first() {
                // :global without args inside a pseudoclass is invalid
                if state.in_pseudoclass
                    && !first_sel
                        .as_object()
                        .is_some_and(|obj| obj.contains_key("args"))
                {
                    return Err(errors::css_global_block_invalid_placement());
                }
            }
        }

        // Check if :global(...) with args is in the middle of the selector
        if let Some(selectors) = global_relative.get("selectors").and_then(|s| s.as_array())
            && let Some(first_sel) = selectors.first()
            && first_sel
                .as_object()
                .is_some_and(|obj| obj.contains_key("args"))
        {
            let is_at_start = children[..idx].iter().all(|child| {
                child
                    .get("selectors")
                    .and_then(|s| s.as_array())
                    .is_none_or(|s| s.is_empty())
            });
            let is_at_end = idx == children.len() - 1;

            if !is_at_start && !is_at_end {
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
                    if selector
                        .as_object()
                        .is_some_and(|obj| obj.contains_key("args"))
                        && let Some(args) = selector.get("args")
                        && let Some(args_children) = args.get("children").and_then(|c| c.as_array())
                        && args_children.len() > 1
                        && (children.len() > 1 || selectors.len() > 1)
                    {
                        return Err(errors::css_global_invalid_selector());
                    }

                    // Check for type selector position
                    validate_global_type_selector_position(selector, selectors)?;

                    // Check for :global block inside pseudo-class args
                    if let Some(args) = selector.get("args") {
                        validate_global_block_in_pseudo_args(args)?;
                    }
                }

                // For other pseudo-classes (:is, :not, :has, :where), validate their args
                if let Some(sel_type) = selector.get("type").and_then(|t| t.as_str())
                    && sel_type == "PseudoClassSelector"
                    && let Some(name) = selector.get("name").and_then(|n| n.as_str())
                    && matches!(name, "is" | "not" | "has" | "where")
                {
                    if let Some(args) = selector.get("args") {
                        let pseudo_state = CssAnalysisState {
                            parent_rule: state.parent_rule,
                            parent_rule_has_parent: state.parent_rule_has_parent,
                            in_pseudoclass: true,
                        };
                        validate_selectors(args, &pseudo_state)?;
                    }
                }
            }
        }
    }

    // Validate each RelativeSelector
    let is_nested = state.parent_rule.is_some();
    for (i, relative_selector) in children.iter().enumerate() {
        if i == 0
            && !is_nested
            && !state.in_pseudoclass
            && let Some(combinator) = relative_selector.get("combinator")
            && combinator.get("type").and_then(|t| t.as_str()) == Some("Combinator")
        {
            return Err(errors::css_selector_invalid());
        }
    }

    // Check for combinator at the end
    if let Some(last) = children.last()
        && let Some(selectors) = last.get("selectors").and_then(|s| s.as_array())
        && selectors.is_empty()
        && last.get("combinator").is_some()
    {
        return Err(errors::css_selector_invalid());
    }

    Ok(())
}

/// Check if :global block (without args) appears inside pseudo-class args.
fn validate_global_block_in_pseudo_args(args: &serde_json::Value) -> Result<(), AnalysisError> {
    if let Some(children) = args.get("children").and_then(|c| c.as_array()) {
        for complex in children {
            if let Some(complex_children) = complex.get("children").and_then(|c| c.as_array()) {
                for relative in complex_children {
                    if let Some(selectors) = relative.get("selectors").and_then(|s| s.as_array()) {
                        for sel in selectors {
                            if is_global_block_selector(sel) {
                                return Err(errors::css_global_block_invalid_placement());
                            }
                        }
                    }
                }
            }
        }
    }
    Ok(())
}

/// Check if a prelude (SelectorList) has all its complex selectors fully global.
/// This mirrors checking `node.metadata.has_global_selectors` in the official compiler,
/// which is true when ALL complex selectors have `is_global`.
fn is_prelude_fully_global(prelude: &serde_json::Value) -> bool {
    if let Some(children) = prelude.get("children").and_then(|c| c.as_array()) {
        !children.is_empty() && children.iter().all(is_complex_selector_global)
    } else {
        false
    }
}

/// Check if a ComplexSelector is fully global.
/// A ComplexSelector is global when ALL its children (RelativeSelectors) are global or global-like.
fn is_complex_selector_global(complex_selector: &serde_json::Value) -> bool {
    if let Some(children) = complex_selector.get("children").and_then(|c| c.as_array()) {
        !children.is_empty()
            && children.iter().all(|rel| {
                is_relative_selector_global_strict(rel) || is_relative_selector_global_like(rel)
            })
    } else {
        false
    }
}

/// Check if a RelativeSelector is "global" in the strict sense used for has_global computation.
/// Mirrors the official `is_global()` from css/utils.js:
///   - First selector is :global
///   - AND either has no args (bare :global) OR all selectors in the RelativeSelector
///     are unscoped pseudo-classes or pseudo-elements
fn is_relative_selector_global_strict(relative_selector: &serde_json::Value) -> bool {
    let selectors = match relative_selector
        .get("selectors")
        .and_then(|s| s.as_array())
    {
        Some(s) if !s.is_empty() => s,
        _ => return false,
    };
    let first = &selectors[0];
    if first.get("type").and_then(|t| t.as_str()) != Some("PseudoClassSelector")
        || first.get("name").and_then(|n| n.as_str()) != Some("global")
    {
        return false;
    }
    // If no args (bare :global), it's global
    if !first
        .as_object()
        .is_some_and(|obj| obj.contains_key("args"))
        || first
            .get("args")
            .and_then(|a| if a.is_null() { None } else { Some(a) })
            .is_none()
    {
        return true;
    }
    // Has args: all selectors in this RelativeSelector must be unscoped pseudo-classes or pseudo-elements
    selectors.iter().all(|sel| {
        let sel_type = sel.get("type").and_then(|t| t.as_str()).unwrap_or("");
        if sel_type == "PseudoElementSelector" {
            return true;
        }
        if sel_type == "PseudoClassSelector" {
            return is_unscoped_pseudo_class_selector(sel);
        }
        false
    })
}

/// Check if a RelativeSelector is "global-like" (e.g., :host, :root, ::view-transition-*).
fn is_relative_selector_global_like(relative_selector: &serde_json::Value) -> bool {
    let selectors = match relative_selector
        .get("selectors")
        .and_then(|s| s.as_array())
    {
        Some(s) if !s.is_empty() => s,
        _ => return false,
    };

    let first = &selectors[0];
    let first_type = first.get("type").and_then(|t| t.as_str()).unwrap_or("");
    let first_name = first.get("name").and_then(|n| n.as_str()).unwrap_or("");

    // :host
    if first_type == "PseudoClassSelector" && first_name == "host" {
        return true;
    }

    // ::view-transition-*
    if first_type == "PseudoElementSelector"
        && matches!(
            first_name,
            "view-transition"
                | "view-transition-group"
                | "view-transition-old"
                | "view-transition-new"
                | "view-transition-image-pair"
        )
    {
        return true;
    }

    // :root (but not if it also has :has)
    let has_root = selectors.iter().any(|s| {
        s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
            && s.get("name").and_then(|n| n.as_str()) == Some("root")
    });
    let has_has = selectors.iter().any(|s| {
        s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
            && s.get("name").and_then(|n| n.as_str()) == Some("has")
    });
    if has_root && !has_has {
        return true;
    }

    false
}

/// Check if a PseudoClassSelector is "unscoped" - meaning it doesn't scope its contents.
/// Mirrors the official `is_unscoped_pseudo_class` from css/utils.js.
fn is_unscoped_pseudo_class_selector(selector: &serde_json::Value) -> bool {
    if selector.get("type").and_then(|t| t.as_str()) != Some("PseudoClassSelector") {
        return false;
    }
    let name = selector.get("name").and_then(|n| n.as_str()).unwrap_or("");

    // These pseudo-classes scope their contents: :has, :is, :where, :not (with complex args)
    if name == "has" || name == "is" || name == "where" {
        // They can still be unscoped if args is null or all children are global
        let args = selector.get("args").filter(|a| !a.is_null());
        return match args {
            None => true,
            Some(args) => {
                // All children of args must be global
                args.get("children")
                    .and_then(|c| c.as_array())
                    .map(|children| {
                        children.iter().all(|complex| {
                            complex
                                .get("children")
                                .and_then(|c| c.as_array())
                                .map(|rels| rels.iter().all(is_relative_selector_global_strict))
                                .unwrap_or(false)
                        })
                    })
                    .unwrap_or(false)
            }
        };
    }
    if name == "not" {
        let args = selector.get("args").filter(|a| !a.is_null());
        return match args {
            None => true,
            Some(args) => {
                let all_simple = args
                    .get("children")
                    .and_then(|c| c.as_array())
                    .map(|children| {
                        children.iter().all(|c| {
                            c.get("children")
                                .and_then(|cc| cc.as_array())
                                .map(|rels| rels.len() == 1)
                                .unwrap_or(false)
                        })
                    })
                    .unwrap_or(false);
                if all_simple {
                    return true;
                }
                // Check if all children are global
                args.get("children")
                    .and_then(|c| c.as_array())
                    .map(|children| {
                        children.iter().all(|complex| {
                            complex
                                .get("children")
                                .and_then(|c| c.as_array())
                                .map(|rels| rels.iter().all(is_relative_selector_global_strict))
                                .unwrap_or(false)
                        })
                    })
                    .unwrap_or(false)
            }
        };
    }

    // All other pseudo-classes are unscoped
    true
}

/// Check if a RelativeSelector is :global (or :global(...)).
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

fn has_global_selector(prelude: &serde_json::Value) -> bool {
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

/// Validate the arguments of :global(...).
fn validate_global_args(
    args: &serde_json::Value,
    num_children: usize,
    num_selectors: usize,
) -> Result<(), AnalysisError> {
    if let Some(arg_children) = args.get("children").and_then(|c| c.as_array()) {
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
    let global_idx = all_selectors
        .iter()
        .position(|s| std::ptr::eq(s, global_selector))
        .unwrap_or(0);

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

    if let Some(next_sel) = all_selectors.get(global_idx + 1)
        && next_sel.get("type").and_then(|t| t.as_str()) == Some("TypeSelector")
    {
        return Err(errors::css_type_selector_invalid_placement());
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
