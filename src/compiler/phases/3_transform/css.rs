//! CSS code generation.
//!
//! Generates scoped CSS stylesheets with selector scoping.
//! Preserves original whitespace from source using AST positions.

use memchr::{memchr, memmem};

use super::super::phase1_parse::parse_css;
use super::{CssOutput, TransformError};
use crate::compiler::CompileOptions;
use crate::compiler::phases::phase2_analyze::ComponentAnalysis;
use crate::compiler::phases::phase2_analyze::types::DomStructure;
use rustc_hash::FxHashSet;
use serde_json::Value;

/// Context for CSS transformation containing analysis data and options
#[derive(Clone)]
#[allow(dead_code)] // used_elements reserved for future type selector detection
struct CssContext<'a> {
    /// Element names used in the template
    used_elements: &'a FxHashSet<String>,
    /// Class names used in the template
    used_classes: &'a FxHashSet<String>,
    /// IDs used in the template
    used_ids: &'a FxHashSet<String>,
    /// Whether there are dynamic elements (svelte:element)
    has_dynamic_elements: bool,
    /// Whether there are dynamic class expressions
    has_dynamic_classes: bool,
    /// Whether template has control flow (if/each/await/snippet/slot)
    has_control_flow: bool,
    /// DOM structure for advanced selector matching
    dom_structure: &'a DomStructure,
}

/// Render the stylesheet for a component.
pub fn render_stylesheet(
    analysis: &ComponentAnalysis,
    source: &str,
    _options: &CompileOptions,
) -> Result<CssOutput, TransformError> {
    if !analysis.css.has_css || analysis.css.hash.is_empty() {
        return Ok(CssOutput {
            code: String::new(),
            map: None,
        });
    }

    let hash = &analysis.css.hash;
    let selector = format!(".{}", hash);

    // Create context for unused selector detection
    let ctx = CssContext {
        used_elements: &analysis.css.used_elements,
        used_classes: &analysis.css.used_classes,
        used_ids: &analysis.css.used_ids,
        has_dynamic_elements: analysis.css.has_dynamic_elements,
        has_dynamic_classes: analysis.css.has_dynamic_classes,
        has_control_flow: analysis.css.has_control_flow,
        dom_structure: &analysis.css.dom_structure,
    };

    // Extract CSS content and its start position
    if let Some((css_content, css_start)) = extract_css_content(source) {
        // Parse the CSS with proper start offset
        let children = parse_css(&css_content, css_start);

        // Collect keyframe names for animation value replacement
        let keyframes = collect_keyframe_names(&children);

        // Transform the CSS
        let mut code = transform_css(&children, &selector, hash, &css_content, css_start, &ctx);

        // Post-process: replace animation keyframe references
        if !keyframes.is_empty() {
            code = replace_animation_keyframes(&code, hash, &keyframes);
        }

        Ok(CssOutput { code, map: None })
    } else {
        Ok(CssOutput {
            code: String::new(),
            map: None,
        })
    }
}

/// Collect all keyframe names defined in the stylesheet
fn collect_keyframe_names(children: &[Value]) -> FxHashSet<String> {
    let mut keyframes = FxHashSet::default();
    for child in children {
        collect_keyframe_names_from_node(child, &mut keyframes);
    }
    keyframes
}

/// Recursively collect keyframe names from a node
fn collect_keyframe_names_from_node(node: &Value, keyframes: &mut FxHashSet<String>) {
    let node_type = node.get("type").and_then(|t| t.as_str());
    match node_type {
        Some("Atrule") => {
            let name = node.get("name").and_then(|n| n.as_str()).unwrap_or("");
            if matches!(
                name,
                "keyframes" | "-webkit-keyframes" | "-moz-keyframes" | "-o-keyframes"
            ) && let Some(prelude) = node.get("prelude").and_then(|p| p.as_str())
            {
                let keyframe_name = prelude.trim();
                if !keyframe_name.starts_with("-global-") {
                    keyframes.insert(keyframe_name.to_string());
                }
            }
            if let Some(block) = node.get("block")
                && let Some(children) = block.get("children").and_then(|c| c.as_array())
            {
                for child in children {
                    collect_keyframe_names_from_node(child, keyframes);
                }
            }
        }
        Some("Rule") => {
            if let Some(block) = node.get("block")
                && let Some(children) = block.get("children").and_then(|c| c.as_array())
            {
                for child in children {
                    collect_keyframe_names_from_node(child, keyframes);
                }
            }
        }
        _ => {}
    }
}

/// Check if a character is a CSS name boundary (whitespace, comma, semicolon, or closing brace)
fn is_css_name_boundary(c: char) -> bool {
    c.is_whitespace() || c == ',' || c == ';' || c == '}'
}

/// Replace animation keyframe name references in the CSS output
/// This follows the official Svelte implementation approach: scan through animation property
/// values and prefix any tokens that match defined keyframe names.
fn replace_animation_keyframes(css: &str, hash: &str, keyframes: &FxHashSet<String>) -> String {
    let mut result = String::with_capacity(css.len() + keyframes.len() * hash.len() * 2);
    let chars: Vec<char> = css.chars().collect();
    let mut i = 0;

    while i < chars.len() {
        // Look for animation or animation-name property
        let remaining: String = chars[i..].iter().collect();
        let lower = remaining.to_lowercase();

        // Check for animation properties (including vendor prefixes)
        let property_match = if lower.starts_with("animation-name") {
            Some(("animation-name", 14))
        } else if lower.starts_with("animation") && !lower.starts_with("animation-") {
            Some(("animation", 9))
        } else if lower.starts_with("-webkit-animation-name") {
            Some(("-webkit-animation-name", 22))
        } else if lower.starts_with("-webkit-animation") && !lower.starts_with("-webkit-animation-")
        {
            Some(("-webkit-animation", 17))
        } else if lower.starts_with("-moz-animation-name") {
            Some(("-moz-animation-name", 19))
        } else if lower.starts_with("-moz-animation") && !lower.starts_with("-moz-animation-") {
            Some(("-moz-animation", 14))
        } else if lower.starts_with("-o-animation-name") {
            Some(("-o-animation-name", 17))
        } else if lower.starts_with("-o-animation") && !lower.starts_with("-o-animation-") {
            Some(("-o-animation", 12))
        } else {
            None
        };

        if let Some((_, prop_len)) = property_match {
            // Copy property name
            for j in 0..prop_len {
                result.push(chars[i + j]);
            }
            i += prop_len;

            // Skip whitespace and colon
            while i < chars.len() && (chars[i].is_whitespace() || chars[i] == ':') {
                result.push(chars[i]);
                i += 1;
            }

            // Now scan the value, looking for keyframe names
            let mut name = String::new();
            let mut name_start = result.len();

            while i < chars.len() {
                let c = chars[i];

                if is_css_name_boundary(c) {
                    // Check if the accumulated name is a keyframe
                    if !name.is_empty() && keyframes.contains(&name) {
                        // Insert prefix before the name
                        let prefix = format!("{}-", hash);
                        result.insert_str(name_start, &prefix);
                    }
                    name.clear();

                    result.push(c);
                    i += 1;

                    // Check for end of declaration
                    if c == ';' || c == '}' {
                        break;
                    }

                    // Update name_start for next potential name
                    name_start = result.len();
                } else {
                    name.push(c);
                    result.push(c);
                    i += 1;
                }
            }

            // Handle name at end of value (before EOF or without terminator)
            if !name.is_empty() && keyframes.contains(&name) {
                let prefix = format!("{}-", hash);
                result.insert_str(name_start, &prefix);
            }
        } else {
            result.push(chars[i]);
            i += 1;
        }
    }

    result
}

/// Extract CSS content from source (finds the <style> block)
/// Returns (css_content, start_position_in_source)
fn extract_css_content(source: &str) -> Option<(String, usize)> {
    let style_start = memmem::find(source.as_bytes(), b"<style")?;
    let content_start = memchr(b'>', &source.as_bytes()[style_start..])? + style_start + 1;
    let style_end = memmem::find(source.as_bytes(), b"</style>")?;

    if content_start >= style_end {
        return None;
    }

    let css_content = source[content_start..style_end].to_string();
    Some((css_content, content_start))
}

/// Transform CSS by adding scoping to selectors while preserving whitespace
fn transform_css(
    children: &[Value],
    selector: &str,
    hash: &str,
    css_source: &str,
    css_start: usize,
    ctx: &CssContext,
) -> String {
    let mut output = String::new();
    let mut specificity_bumped = false;
    let mut last_end = css_start;

    for child in children {
        transform_node_preserving(
            child,
            selector,
            hash,
            css_source,
            css_start,
            &mut output,
            &mut specificity_bumped,
            &mut last_end,
            ctx,
            false, // top-level rules are not nested
        );
    }

    // Add any trailing content
    if last_end > css_start {
        let trailing_start = last_end - css_start;
        if trailing_start < css_source.len() {
            output.push_str(&css_source[trailing_start..]);
        }
    }

    output
}

/// Transform a CSS node while preserving whitespace
#[allow(clippy::too_many_arguments)]
fn transform_node_preserving(
    node: &Value,
    selector: &str,
    hash: &str,
    css_source: &str,
    css_start: usize,
    output: &mut String,
    specificity_bumped: &mut bool,
    last_end: &mut usize,
    ctx: &CssContext,
    is_nested: bool,
) {
    match node.get("type").and_then(|t| t.as_str()) {
        Some("Rule") => {
            transform_rule_preserving(
                node,
                selector,
                hash,
                css_source,
                css_start,
                output,
                specificity_bumped,
                last_end,
                ctx,
                is_nested,
                false, // not in a global block
            );
        }
        Some("Atrule") => {
            transform_atrule_preserving(
                node,
                selector,
                hash,
                css_source,
                css_start,
                output,
                specificity_bumped,
                last_end,
                ctx,
            );
        }
        _ => {}
    }
}

/// Check if a block has any actual declarations (not just comments)
fn has_declarations(block: &Value) -> bool {
    if let Some(children) = block.get("children").and_then(|c| c.as_array()) {
        children.iter().any(|child| {
            child
                .get("type")
                .and_then(|t| t.as_str())
                .map(|t| t == "Declaration" || t == "Atrule" || t == "Rule")
                .unwrap_or(false)
        })
    } else {
        false
    }
}

/// Check if a rule is a :global block (selector is just `:global` without arguments)
fn is_global_block(node: &Value) -> bool {
    if let Some(prelude) = node.get("prelude")
        && let Some(children) = prelude.get("children").and_then(|c| c.as_array())
        && children.len() == 1
        && let Some(complex) = children.first()
        && let Some(relative_selectors) = complex.get("children").and_then(|c| c.as_array())
        && relative_selectors.len() == 1
        && let Some(rel) = relative_selectors.first()
        && let Some(selectors) = rel.get("selectors").and_then(|s| s.as_array())
        && selectors.len() == 1
        && let Some(sel) = selectors.first()
    {
        return sel.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
            && sel.get("name").and_then(|n| n.as_str()) == Some("global")
            && sel.get("args").is_none();
    }
    false
}

/// Check if a rule starts with :global (with or without arguments)
/// This includes both `:global { ... }` and `:global(.x) { ... }`
#[allow(dead_code)]
fn is_global_selector_rule(node: &Value) -> bool {
    if let Some(prelude) = node.get("prelude")
        && let Some(children) = prelude.get("children").and_then(|c| c.as_array())
        && !children.is_empty()
    {
        // Check each complex selector - if ANY starts with :global, this is a global block
        for complex in children {
            if let Some(relative_selectors) = complex.get("children").and_then(|c| c.as_array())
                && !relative_selectors.is_empty()
                && let Some(rel) = relative_selectors.first()
                && let Some(selectors) = rel.get("selectors").and_then(|s| s.as_array())
                && !selectors.is_empty()
                && let Some(sel) = selectors.first()
                && sel.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                && sel.get("name").and_then(|n| n.as_str()) == Some("global")
            {
                return true;
            }
        }
    }
    false
}

/// Check if a block contains nested rules (not just declarations)
fn has_nested_rules(block: &Value) -> bool {
    if let Some(children) = block.get("children").and_then(|c| c.as_array()) {
        children
            .iter()
            .any(|child| child.get("type").and_then(|t| t.as_str()) == Some("Rule"))
    } else {
        false
    }
}

/// Result of checking if a selector is unused
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum UnusedStatus {
    /// Selector is used (matches elements)
    Used,
    /// Selector is unused (doesn't match any elements)
    Unused,
    /// Selector absolutely cannot match (e.g., sibling combinator with impossible relationship)
    NoMatch,
}

/// Check if a selector is unused (cannot match any element in the template)
/// Returns UnusedStatus to distinguish between unused and no-match cases
fn check_selector_unused(prelude: &Value, ctx: &CssContext) -> UnusedStatus {
    // Note: We no longer bail out early for has_dynamic_classes/has_dynamic_elements.
    // Instead, we check each selector individually. This allows us to prune selectors
    // that reference classes/elements that never appear in the template (static or dynamic),
    // while keeping selectors for classes that appear in dynamic expressions.

    // Check each complex selector in the selector list
    if let Some(children) = prelude.get("children").and_then(|c| c.as_array()) {
        let mut has_no_match = false;
        let mut all_unused = true;

        for complex in children {
            match check_complex_selector_unused(complex, ctx) {
                UnusedStatus::Used => {
                    all_unused = false;
                }
                UnusedStatus::NoMatch => {
                    has_no_match = true;
                }
                UnusedStatus::Unused => {
                    // Keep checking
                }
            }
        }

        // If all selectors are either unused or no-match, and at least one is no-match
        if all_unused && has_no_match {
            UnusedStatus::NoMatch
        } else if all_unused {
            UnusedStatus::Unused
        } else {
            UnusedStatus::Used
        }
    } else {
        UnusedStatus::Used
    }
}

/// Check if a complex selector is unused
/// Returns UnusedStatus to distinguish between unused and no-match cases
fn check_complex_selector_unused(complex: &Value, ctx: &CssContext) -> UnusedStatus {
    let unused = is_complex_selector_unused_impl(complex, ctx);
    if unused {
        // Check if it's a no-match case (sibling combinator that absolutely cannot match)
        let no_match = is_sibling_combinator_no_match(complex, ctx);
        if no_match {
            UnusedStatus::NoMatch
        } else {
            UnusedStatus::Unused
        }
    } else {
        UnusedStatus::Used
    }
}

/// Check if a complex selector is unused
/// A complex selector is unused if it doesn't match any element in the template.
fn is_complex_selector_unused(complex: &Value, ctx: &CssContext) -> bool {
    is_complex_selector_unused_impl(complex, ctx)
}

/// Implementation of complex selector unused check
fn is_complex_selector_unused_impl(complex: &Value, ctx: &CssContext) -> bool {
    // Get the relative selectors (like "div > span" has multiple relative selectors)
    if let Some(rel_selectors) = complex.get("children").and_then(|c| c.as_array()) {
        // Check for :host > element pattern FIRST (before the global-like check)
        // because :host > span can be unused if span is not a root child
        if is_host_child_selector_unused(rel_selectors, ctx) {
            return true;
        }

        // When a selector contains :global(), we still need to check the NON-global parts.
        // For example, `:global(.foo) :is(.unused)` should be marked as unused if `.unused`
        // doesn't exist in the template, even though `:global(.foo)` exists.
        // Skip checking relative selectors that ARE :global(), but DO check others.

        // Check if the first selector is :host without children (global-like)
        let first_is_host_only = rel_selectors.len() == 1
            && rel_selectors.first().is_some_and(|rel| {
                rel.get("selectors")
                    .and_then(|s| s.as_array())
                    .is_some_and(|arr| {
                        arr.len() == 1
                            && arr.first().is_some_and(|s| {
                                s.get("type").and_then(|t| t.as_str())
                                    == Some("PseudoClassSelector")
                                    && s.get("name").and_then(|n| n.as_str()) == Some("host")
                            })
                    })
            });

        if first_is_host_only {
            return false; // :host by itself is always used
        }

        // Check for sibling combinator patterns (+ and ~)
        if is_sibling_combinator_unused(rel_selectors, ctx) {
            return true;
        }

        // Check for descendant/child selectors that don't match the DOM structure
        // Only enabled when there's no control flow (to avoid false positives)
        if !ctx.has_control_flow && is_descendant_selector_unused(rel_selectors, ctx) {
            return true;
        }

        // Original simple check: if any simple selector refers to something that doesn't exist
        for rel in rel_selectors {
            // Check each simple selector in this relative selector
            if let Some(selectors) = rel.get("selectors").and_then(|s| s.as_array()) {
                // Skip :host pseudo-classes (they're global-like)
                let starts_with_host = selectors.first().is_some_and(|s| {
                    let sel_type = s.get("type").and_then(|t| t.as_str());
                    if sel_type == Some("PseudoClassSelector") {
                        let name = s.get("name").and_then(|n| n.as_str());
                        name == Some("host")
                    } else {
                        false
                    }
                });

                if starts_with_host {
                    continue;
                }

                // Skip relative selectors that are entirely :global() (but still check others)
                let is_entirely_global = selectors.len() == 1
                    && selectors.first().is_some_and(|s| {
                        s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                            && s.get("name").and_then(|n| n.as_str()) == Some("global")
                    });

                if is_entirely_global {
                    continue;
                }

                for sel in selectors {
                    // Skip :global() selectors themselves, but check other selectors
                    let is_global_selector = sel.get("type").and_then(|t| t.as_str())
                        == Some("PseudoClassSelector")
                        && sel.get("name").and_then(|n| n.as_str()) == Some("global");

                    if is_global_selector {
                        continue;
                    }

                    if is_simple_selector_unused(sel, ctx) {
                        return true;
                    }
                }
            }
        }
    }
    false
}

/// Check if a :host > element selector is unused
/// This is true when the element after :host > is not a direct child of the component root
fn is_host_child_selector_unused(rel_selectors: &[Value], ctx: &CssContext) -> bool {
    if rel_selectors.len() < 2 {
        return false;
    }

    // Check if first selector is :host
    let first = &rel_selectors[0];
    let first_is_host = first
        .get("selectors")
        .and_then(|s| s.as_array())
        .and_then(|arr| arr.first())
        .is_some_and(|s| {
            s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                && s.get("name").and_then(|n| n.as_str()) == Some("host")
        });

    if !first_is_host {
        return false;
    }

    // Check if second selector uses child combinator (>)
    let second = &rel_selectors[1];
    let combinator = second
        .get("combinator")
        .and_then(|c| c.get("name"))
        .and_then(|n| n.as_str())
        .unwrap_or(" ");

    if combinator != ">" {
        return false;
    }

    // Get the element type from the second selector
    if let Some(selectors) = second.get("selectors").and_then(|s| s.as_array()) {
        for sel in selectors {
            let sel_type = sel.get("type").and_then(|t| t.as_str());
            if sel_type == Some("TypeSelector") {
                if let Some(tag_name) = sel.get("name").and_then(|n| n.as_str()) {
                    // Universal selector might match
                    if tag_name == "*" {
                        return false;
                    }
                    // Check if this element is a root child in the DOM structure
                    let is_root_child = ctx
                        .dom_structure
                        .elements
                        .iter()
                        .any(|el| el.is_root_child && el.tag_name == tag_name);
                    if !is_root_child {
                        return true;
                    }
                }
            } else if sel_type == Some("ClassSelector")
                && let Some(class_name) = sel.get("name").and_then(|n| n.as_str())
            {
                // Check if any root child has this class
                let is_root_child_with_class = ctx
                    .dom_structure
                    .elements
                    .iter()
                    .any(|el| el.is_root_child && el.classes.contains(class_name));
                if !is_root_child_with_class {
                    return true;
                }
            }
        }
    }

    false
}

/// Check if a sibling combinator selector has no possible match
/// This is stricter than "unused" - it means the selector absolutely cannot match
/// due to mutually exclusive control flow branches
fn is_sibling_combinator_no_match(complex: &Value, ctx: &CssContext) -> bool {
    if let Some(rel_selectors) = complex.get("children").and_then(|c| c.as_array()) {
        is_sibling_combinator_no_match_impl(rel_selectors, ctx)
    } else {
        false
    }
}

/// Implementation of no-match check for sibling combinators
fn is_sibling_combinator_no_match_impl(rel_selectors: &[Value], ctx: &CssContext) -> bool {
    if rel_selectors.len() < 2 || ctx.dom_structure.elements.is_empty() {
        return false;
    }

    // Check if this uses sibling combinators
    let mut sibling_combinator_found = false;
    for rel in rel_selectors.iter().skip(1) {
        let combinator = rel
            .get("combinator")
            .and_then(|c| c.get("name"))
            .and_then(|n| n.as_str())
            .unwrap_or(" ");

        if combinator == "+" || combinator == "~" {
            sibling_combinator_found = true;
            break;
        }
    }

    if !sibling_combinator_found {
        return false;
    }

    // For simple sibling patterns like .a + .b, check if elements are in mutually exclusive branches
    if rel_selectors.len() == 2 {
        let before = &rel_selectors[0];
        let after = &rel_selectors[1];

        let combinator = after
            .get("combinator")
            .and_then(|c| c.get("name"))
            .and_then(|n| n.as_str())
            .unwrap_or(" ");

        if combinator != "+" && combinator != "~" {
            return false;
        }

        let before_info = extract_selector_info(before);
        let after_info = extract_selector_info(after);

        // Find all elements matching 'before' and check their possible siblings
        let mut found_before_element = false;
        let mut found_any_match = false;

        for el in ctx.dom_structure.elements.iter() {
            if selector_matches_element(&before_info, el) {
                found_before_element = true;

                // Check if any possible sibling matches 'after'
                let possible_siblings = if combinator == "+" {
                    &el.possible_next_adjacent
                } else {
                    &el.possible_next_general
                };

                for (sibling_idx, _certainty) in possible_siblings {
                    if let Some(sibling) = ctx.dom_structure.elements.get(*sibling_idx)
                        && selector_matches_element(&after_info, sibling)
                    {
                        // Found a possible match
                        found_any_match = true;
                        break;
                    }
                }

                if found_any_match {
                    break;
                }
            }
        }

        // Return true (no match) only if we found elements matching 'before' but none of their siblings match 'after'
        return found_before_element && !found_any_match;
    }

    false
}

/// Check if a sibling combinator selector is unused
/// A + B or A ~ B is unused if no parent element has children that satisfy the relationship
fn is_sibling_combinator_unused(rel_selectors: &[Value], ctx: &CssContext) -> bool {
    if rel_selectors.len() < 2 || ctx.dom_structure.elements.is_empty() {
        return false;
    }

    // Check if the first selector is :global() - this affects how we check siblings
    let first_is_global = rel_selectors.first().is_some_and(|rel| {
        rel.get("selectors")
            .and_then(|s| s.as_array())
            .and_then(|arr| arr.first())
            .is_some_and(|sel| {
                sel.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                    && sel.get("name").and_then(|n| n.as_str()) == Some("global")
            })
    });

    // For :global(X) + Y patterns, check if Y is a root-level element
    // External elements can only be siblings of root-level component elements
    if first_is_global && rel_selectors.len() == 2 {
        let second = &rel_selectors[1];
        let combinator = second
            .get("combinator")
            .and_then(|c| c.get("name"))
            .and_then(|n| n.as_str())
            .unwrap_or(" ");

        if combinator == "+" || combinator == "~" {
            // Check if the second selector matches any root-level element
            let second_info = extract_selector_info(second);

            // If it's a universal selector, it matches root elements
            if second_info.is_universal {
                return false;
            }

            // Check if any root-level element matches
            let matches_root = ctx
                .dom_structure
                .elements
                .iter()
                .any(|el| el.is_root_child && selector_matches_element(&second_info, el));

            return !matches_root; // Unused if no root element matches
        }
        return false;
    }

    // For other :global() patterns, skip the unused check (too complex)
    if first_is_global {
        return false;
    }

    // If there's control flow (if/each/await/snippet/slot), be conservative.
    // The control flow analysis in Phase 2 builds sibling relationships, but it
    // needs to correctly handle all edge cases (non-exhaustive if blocks, await
    // blocks without pending, each blocks that might be empty, etc.).
    // For now, we skip unused detection for control flow to avoid false positives.
    // TODO: Implement proper control flow analysis that handles all edge cases.
    if ctx.has_control_flow {
        return false;
    }

    // Check if this selector uses sibling combinators
    let mut sibling_combinator_found = false;
    let mut sibling_pairs: Vec<(usize, &str)> = Vec::new(); // (index, combinator)

    for (i, rel) in rel_selectors.iter().enumerate().skip(1) {
        let combinator = rel
            .get("combinator")
            .and_then(|c| c.get("name"))
            .and_then(|n| n.as_str())
            .unwrap_or(" ");

        if combinator == "+" || combinator == "~" {
            sibling_combinator_found = true;
            sibling_pairs.push((i, combinator));
        }
    }

    if !sibling_combinator_found {
        return false;
    }

    // For now, handle the simple case: .parent > A + B
    // where we need to check if .parent has children matching A followed by B

    // First, get all elements that could be the "context" (parent) for the sibling relationship
    // For simplicity, start with checking if ANY parent has 2+ children

    // Check for the specific pattern: .class > * + * (universal sibling inside a parent)
    if sibling_pairs.len() == 1 {
        let (sibling_idx, combinator) = sibling_pairs[0];

        // Get the selector before the sibling combinator
        let before = &rel_selectors[sibling_idx - 1];
        // Get the selector after the sibling combinator
        let after = &rel_selectors[sibling_idx];

        // Extract selector info for before and after
        let before_info = extract_selector_info(before);
        let after_info = extract_selector_info(after);

        // If we have a parent context (e.g., .foo > A + B)
        if sibling_idx >= 2 {
            // Check the combinator before the sibling pattern
            let parent_combinator = rel_selectors[sibling_idx - 1]
                .get("combinator")
                .and_then(|c| c.get("name"))
                .and_then(|n| n.as_str())
                .unwrap_or(" ");

            if parent_combinator == ">" {
                // Direct child context
                // Get the parent selector
                let parent_rel = &rel_selectors[sibling_idx - 2];
                let parent_info = extract_selector_info(parent_rel);

                // Find matching parent elements
                for el in &ctx.dom_structure.elements {
                    if selector_matches_element(&parent_info, el) {
                        // Check if this parent has children that satisfy the sibling relationship
                        if has_sibling_match(ctx, el, &before_info, &after_info, combinator) {
                            return false; // Found a match, not unused
                        }
                    }
                }
                // No parent found with matching sibling children
                return true;
            }
        }

        // Use the sibling relationship data from Phase 2 control flow analysis
        // This correctly handles if/each/await blocks

        // Find all elements that match 'before' selector
        for el in ctx.dom_structure.elements.iter() {
            if selector_matches_element(&before_info, el) {
                // Check possible siblings based on combinator type
                let possible_siblings = if combinator == "+" {
                    &el.possible_next_adjacent
                } else {
                    // ~ combinator
                    &el.possible_next_general
                };

                // Check if any possible sibling matches 'after' selector
                for (sibling_idx, _certainty) in possible_siblings {
                    if let Some(sibling) = ctx.dom_structure.elements.get(*sibling_idx)
                        && selector_matches_element(&after_info, sibling)
                    {
                        return false; // Found a match, not unused
                    }
                }
            }
        }

        // No matching sibling relationship found
        return true;
    }

    // For complex cases with multiple sibling combinators, be conservative
    false
}

/// Extract selector information from a relative selector
#[derive(Debug)]
struct SelectorInfo {
    tag_name: Option<String>,
    classes: Vec<String>,
    id: Option<String>,
    is_universal: bool,
}

fn extract_selector_info(rel_selector: &Value) -> SelectorInfo {
    let mut info = SelectorInfo {
        tag_name: None,
        classes: Vec::new(),
        id: None,
        is_universal: false,
    };

    if let Some(selectors) = rel_selector.get("selectors").and_then(|s| s.as_array()) {
        for sel in selectors {
            let sel_type = sel.get("type").and_then(|t| t.as_str());
            match sel_type {
                Some("TypeSelector") => {
                    if let Some(name) = sel.get("name").and_then(|n| n.as_str()) {
                        if name == "*" {
                            info.is_universal = true;
                        } else {
                            info.tag_name = Some(name.to_string());
                        }
                    }
                }
                Some("ClassSelector") => {
                    if let Some(name) = sel.get("name").and_then(|n| n.as_str()) {
                        info.classes.push(name.to_string());
                    }
                }
                Some("IdSelector") => {
                    if let Some(name) = sel.get("name").and_then(|n| n.as_str()) {
                        info.id = Some(name.to_string());
                    }
                }
                _ => {}
            }
        }
    }

    info
}

fn selector_matches_element(
    info: &SelectorInfo,
    el: &crate::compiler::phases::phase2_analyze::types::CssDomElement,
) -> bool {
    // Universal selector matches everything
    if info.is_universal {
        return true;
    }

    // Check tag name
    if let Some(ref tag) = info.tag_name
        && el.tag_name != *tag
    {
        return false;
    }

    // Check classes
    for class in &info.classes {
        if !el.classes.contains(class) {
            return false;
        }
    }

    // Check ID
    if let Some(ref id) = info.id
        && el.id.as_ref() != Some(id)
    {
        return false;
    }

    // If no selector specified, it matches nothing specific
    info.tag_name.is_some() || !info.classes.is_empty() || info.id.is_some() || info.is_universal
}

fn has_sibling_match(
    ctx: &CssContext,
    parent: &crate::compiler::phases::phase2_analyze::types::CssDomElement,
    before: &SelectorInfo,
    after: &SelectorInfo,
    combinator: &str,
) -> bool {
    // Get children elements
    let children: Vec<_> = parent
        .children_idx
        .iter()
        .filter_map(|&idx| ctx.dom_structure.elements.get(idx))
        .collect();

    has_sibling_match_in_list(ctx, &children, before, after, combinator)
}

fn has_sibling_match_in_list(
    _ctx: &CssContext,
    children: &[&crate::compiler::phases::phase2_analyze::types::CssDomElement],
    before: &SelectorInfo,
    after: &SelectorInfo,
    combinator: &str,
) -> bool {
    match combinator {
        "+" => {
            // Adjacent sibling: A immediately followed by B
            for i in 0..children.len().saturating_sub(1) {
                if selector_matches_element(before, children[i])
                    && selector_matches_element(after, children[i + 1])
                {
                    return true;
                }
            }
        }
        "~" => {
            // General sibling: A followed by B (not necessarily immediately)
            for (i, first) in children.iter().enumerate() {
                if selector_matches_element(before, first) {
                    for second in children.iter().skip(i + 1) {
                        if selector_matches_element(after, second) {
                            return true;
                        }
                    }
                }
            }
        }
        _ => {}
    }

    false
}

/// Check if a descendant selector is unused based on DOM structure.
fn is_descendant_selector_unused(rel_selectors: &[Value], ctx: &CssContext) -> bool {
    if rel_selectors.len() < 2 || ctx.dom_structure.elements.is_empty() {
        return false;
    }

    // Don't prune if there are dynamic elements - they could match any type selector
    if ctx.has_dynamic_elements {
        return false;
    }

    // Check if this uses only descendant/child combinators (not sibling combinators)
    // If any sibling combinator (~, +) is present, skip this check
    for rel in rel_selectors.iter().skip(1) {
        let combinator = rel
            .get("combinator")
            .and_then(|c| c.get("name"))
            .and_then(|n| n.as_str())
            .unwrap_or(" ");
        if combinator == "~" || combinator == "+" {
            return false; // Skip sibling combinators
        }
    }

    // Skip if first selector is :host, :global, etc.
    let first = &rel_selectors[0];
    let first_is_special = first
        .get("selectors")
        .and_then(|s| s.as_array())
        .and_then(|arr| arr.first())
        .is_some_and(|s| {
            let sel_type = s.get("type").and_then(|t| t.as_str());
            if sel_type == Some("PseudoClassSelector") {
                let name = s.get("name").and_then(|n| n.as_str());
                matches!(name, Some("host") | Some("global") | Some("root"))
            } else {
                false
            }
        });

    if first_is_special {
        return false;
    }

    // Only handle simple two-selector case for now (parent > child or parent child)
    if rel_selectors.len() != 2 {
        return false;
    }

    // Get the parent element type (first selector)
    let parent_tag = get_type_selector_name(&rel_selectors[0]);
    if parent_tag.is_none() {
        return false;
    }
    let parent_tag = parent_tag.unwrap();

    // Get the child element type (second selector)
    let child_tag = get_type_selector_name(&rel_selectors[1]);
    if child_tag.is_none() {
        return false;
    }
    let child_tag = child_tag.unwrap();

    // Get the combinator between parent and child
    let combinator = rel_selectors[1]
        .get("combinator")
        .and_then(|c| c.get("name"))
        .and_then(|n| n.as_str())
        .unwrap_or(" ");

    // Find all elements that match the parent
    let parent_indices: Vec<usize> = ctx
        .dom_structure
        .elements
        .iter()
        .enumerate()
        .filter(|(_, el)| el.tag_name == parent_tag)
        .map(|(i, _)| i)
        .collect();

    if parent_indices.is_empty() {
        // Parent element doesn't exist - will be caught by simple selector check
        return false;
    }

    // Check based on combinator type
    for parent_idx in &parent_indices {
        if combinator == ">" {
            // Child combinator: only direct children
            if has_direct_child_with_tag(ctx, *parent_idx, &child_tag) {
                return false; // Found a valid parent > child relationship
            }
        } else {
            // Descendant combinator: any descendant
            if has_descendant_with_tag(ctx, *parent_idx, &child_tag) {
                return false; // Found a valid parent child relationship
            }
        }
    }

    // No valid relationship found
    true
}

/// Get the type selector name from a relative selector
#[allow(dead_code)]
fn get_type_selector_name(rel_selector: &Value) -> Option<String> {
    rel_selector
        .get("selectors")
        .and_then(|s| s.as_array())
        .and_then(|arr| {
            arr.iter().find_map(|sel| {
                if sel.get("type").and_then(|t| t.as_str()) == Some("TypeSelector") {
                    sel.get("name").and_then(|n| n.as_str()).map(String::from)
                } else {
                    None
                }
            })
        })
}

/// Check if an element has a direct child with the given tag name
fn has_direct_child_with_tag(ctx: &CssContext, parent_idx: usize, tag_name: &str) -> bool {
    let element = &ctx.dom_structure.elements[parent_idx];

    for &child_idx in &element.children_idx {
        if child_idx < ctx.dom_structure.elements.len() {
            let child = &ctx.dom_structure.elements[child_idx];
            if child.tag_name == tag_name {
                return true;
            }
        }
    }

    false
}

/// Check if an element has a descendant with the given tag name
fn has_descendant_with_tag(ctx: &CssContext, parent_idx: usize, tag_name: &str) -> bool {
    let element = &ctx.dom_structure.elements[parent_idx];

    for &child_idx in &element.children_idx {
        if child_idx < ctx.dom_structure.elements.len() {
            let child = &ctx.dom_structure.elements[child_idx];
            if child.tag_name == tag_name {
                return true;
            }
            // Recursively check descendants
            if has_descendant_with_tag(ctx, child_idx, tag_name) {
                return true;
            }
        }
    }

    false
}

/// Decode CSS escape sequences in an identifier.
/// CSS escapes: \XX (1-6 hex digits, optionally followed by whitespace)
/// or \c (any character escaped)
fn decode_css_escape(name: &str) -> String {
    if !name.contains('\\') {
        return name.to_string();
    }

    let mut result = String::new();
    let mut chars = name.chars().peekable();

    while let Some(c) = chars.next() {
        if c == '\\' {
            // Check if next char is a hex digit
            if let Some(&next) = chars.peek() {
                if next.is_ascii_hexdigit() {
                    // Read up to 6 hex digits
                    let mut hex_str = String::new();
                    while hex_str.len() < 6 {
                        if let Some(&h) = chars.peek() {
                            if h.is_ascii_hexdigit() {
                                hex_str.push(chars.next().unwrap());
                            } else {
                                break;
                            }
                        } else {
                            break;
                        }
                    }

                    // Parse hex and convert to char
                    if let Ok(code) = u32::from_str_radix(&hex_str, 16)
                        && let Some(decoded) = char::from_u32(code)
                    {
                        result.push(decoded);
                    }

                    // Consume optional single whitespace after hex escape
                    if let Some(&ws) = chars.peek()
                        && (ws == ' ' || ws == '\t' || ws == '\n')
                    {
                        chars.next();
                    }
                } else if next == '\n' {
                    // \newline is a line continuation (skip it)
                    chars.next();
                } else {
                    // \c escapes the character c
                    result.push(chars.next().unwrap());
                }
            }
        } else {
            result.push(c);
        }
    }

    result
}

/// Check if a simple selector is unused
fn is_simple_selector_unused(sel: &Value, ctx: &CssContext) -> bool {
    let sel_type = sel.get("type").and_then(|t| t.as_str());
    match sel_type {
        Some("TypeSelector") => {
            if let Some(name) = sel.get("name").and_then(|n| n.as_str()) {
                // Don't prune if there are dynamic elements
                if ctx.has_dynamic_elements {
                    return false;
                }
                // Universal selector always matches
                if name == "*" {
                    return false;
                }
                // Decode CSS escape sequences for comparison
                let decoded = decode_css_escape(name);
                return !ctx.used_elements.contains(&decoded);
            }
        }
        Some("ClassSelector") => {
            if let Some(name) = sel.get("name").and_then(|n| n.as_str()) {
                // If there are dynamic classes that we can't statically analyze,
                // we must assume any class selector could potentially match
                if ctx.has_dynamic_classes {
                    return false;
                }
                // Check if this class appears in used_classes
                // If it does, it's potentially used (from static or dynamic expressions)
                // If it doesn't, it's unused (never referenced anywhere)
                let decoded = decode_css_escape(name);
                return !ctx.used_classes.contains(&decoded);
            }
        }
        Some("IdSelector") => {
            if let Some(name) = sel.get("name").and_then(|n| n.as_str()) {
                // Decode CSS escape sequences for comparison
                let decoded = decode_css_escape(name);
                return !ctx.used_ids.contains(&decoded);
            }
        }
        Some("PseudoClassSelector") => {
            // Check for :is()/:has() where ALL inner selectors are unused
            // Note: :not() is handled differently - even if the inner selector doesn't exist,
            // :not(X) matches "all elements that are NOT X", so it's always potentially used
            let name = sel.get("name").and_then(|n| n.as_str()).unwrap_or("");
            if (name == "is" || name == "has")
                && let Some(args) = sel.get("args")
                && let Some(children) = args.get("children").and_then(|c| c.as_array())
            {
                // Check if ALL selectors inside are definitely unused
                // Only mark as unused if ALL inner selectors are simple class/id
                // selectors that definitely don't exist in the template
                let all_unused = children
                    .iter()
                    .all(|child| is_is_inner_selector_unused(child, ctx));
                if all_unused && !children.is_empty() {
                    return true;
                }
            }
            // :not() is always potentially used (matches everything except the inner selector)
            // Other pseudo-classes need more complex analysis, consider them potentially used
            return false;
        }
        Some("PseudoElementSelector") | Some("AttributeSelector") => {
            // These need more complex analysis, consider them potentially used
            return false;
        }
        _ => {}
    }
    false
}

/// Check if a selector inside :is()/:not()/:has() is definitely unused.
/// This is more conservative than is_complex_selector_unused - we only
/// return true if the selector is a simple class/id selector that definitely
/// doesn't exist in the template.
fn is_is_inner_selector_unused(complex: &Value, ctx: &CssContext) -> bool {
    // Get the relative selectors
    if let Some(rel_selectors) = complex.get("children").and_then(|c| c.as_array()) {
        // Only check single relative selectors (simple selectors)
        // Complex selectors with combinators are harder to analyze
        if rel_selectors.len() != 1 {
            return false;
        }

        if let Some(rel) = rel_selectors.first()
            && let Some(selectors) = rel.get("selectors").and_then(|s| s.as_array())
        {
            // Check if all simple selectors in this relative selector are unused
            // Be conservative - only mark as unused if we're sure
            for sel in selectors {
                let sel_type = sel.get("type").and_then(|t| t.as_str());
                match sel_type {
                    Some("ClassSelector") => {
                        if ctx.has_dynamic_classes {
                            return false;
                        }
                        if let Some(name) = sel.get("name").and_then(|n| n.as_str()) {
                            let decoded = decode_css_escape(name);
                            if !ctx.used_classes.contains(&decoded) {
                                return true;
                            }
                        }
                    }
                    Some("IdSelector") => {
                        if let Some(name) = sel.get("name").and_then(|n| n.as_str()) {
                            let decoded = decode_css_escape(name);
                            if !ctx.used_ids.contains(&decoded) {
                                return true;
                            }
                        }
                    }
                    // Type selectors, pseudo selectors, etc. - be conservative
                    _ => {
                        return false;
                    }
                }
            }
        }
    }
    false
}

/// Transform a CSS rule while preserving whitespace from source
#[allow(clippy::too_many_arguments)]
fn transform_rule_preserving(
    node: &Value,
    selector: &str,
    hash: &str,
    css_source: &str,
    css_start: usize,
    output: &mut String,
    specificity_bumped: &mut bool,
    last_end: &mut usize,
    ctx: &CssContext,
    is_nested: bool,
    is_in_global_block: bool,
) {
    let node_start = node.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as usize;
    let node_end = node.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as usize;

    // Copy leading whitespace from source
    if node_start > *last_end {
        let ws_start = (*last_end).saturating_sub(css_start);
        let ws_end = node_start.saturating_sub(css_start);
        if ws_end <= css_source.len() && ws_start < ws_end {
            output.push_str(&css_source[ws_start..ws_end]);
        }
    }

    // Check if this is a top-level :global {} block
    // This is special - we comment out the :global wrapper but keep content unscoped
    if is_global_block(node) {
        transform_global_block(
            node,
            selector,
            hash,
            css_source,
            css_start,
            output,
            specificity_bumped,
            ctx,
        );
        *last_end = node_end;
        return;
    }

    // Check if the rule is empty (no declarations)
    let is_empty = node
        .get("block")
        .map(|block| !has_declarations(block))
        .unwrap_or(false);

    if is_empty {
        // Comment out empty rules
        output.push_str("/* (empty) ");

        // Get the original rule text
        let rule_start = node_start.saturating_sub(css_start);
        let rule_end = node_end.saturating_sub(css_start);
        if rule_end <= css_source.len() && rule_start < rule_end {
            let original = &css_source[rule_start..rule_end];
            // Escape any */ in the content
            let escaped = original.replace("*/", "*\\/");
            output.push_str(&escaped);
        }

        output.push_str("*/");
        *last_end = node_end;
        return;
    }

    // Check if the rule is unused (selector doesn't match any template elements)
    if let Some(prelude) = node.get("prelude") {
        let unused_status = check_selector_unused(prelude, ctx);
        if unused_status != UnusedStatus::Used {
            // Both Unused and NoMatch use the same comment format: /* (unused) ... */
            output.push_str("/* (unused) ");

            // Get the original rule text
            let rule_start = node_start.saturating_sub(css_start);
            let rule_end = node_end.saturating_sub(css_start);
            if rule_end <= css_source.len() && rule_start < rule_end {
                let original = &css_source[rule_start..rule_end];
                // Escape any */ in the content
                let escaped = original.replace("*/", "*\\/");
                output.push_str(&escaped);
            }

            output.push_str("*/");

            *last_end = node_end;
            return;
        }
    }

    // Get the prelude (selector list)
    if let Some(prelude) = node.get("prelude") {
        // Transform selectors
        let transformed_selector = transform_selector_list(
            prelude,
            selector,
            hash,
            specificity_bumped,
            css_source,
            css_start,
            ctx,
            is_nested,
            is_in_global_block,
        );
        output.push_str(&transformed_selector);

        // Get the block and process it
        if let Some(block) = node.get("block") {
            let prelude_end = prelude.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as usize;
            let block_start = block.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as usize;
            let block_end = block.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as usize;

            // Preserve original whitespace between selector and block brace
            let ws_start = prelude_end.saturating_sub(css_start);
            let ws_end = block_start.saturating_sub(css_start);
            if ws_end <= css_source.len() && ws_start < ws_end {
                output.push_str(&css_source[ws_start..ws_end]);
            }

            // Check if block contains nested rules that need special handling
            if has_nested_rules(block) {
                // Check if this rule starts with :global(.x) - if so, nested rules are in a global block context
                let rule_starts_with_global = is_global_selector_rule(node);
                let nested_in_global_block = is_in_global_block || rule_starts_with_global;

                // Process the block recursively
                transform_block_with_nested_rules(
                    block,
                    selector,
                    hash,
                    css_source,
                    css_start,
                    output,
                    specificity_bumped,
                    ctx,
                    nested_in_global_block,
                );
            } else {
                // Copy the entire block from source (including braces and content)
                let blk_start = block_start.saturating_sub(css_start);
                let blk_end = block_end.saturating_sub(css_start);
                if blk_end <= css_source.len() && blk_start < blk_end {
                    output.push_str(&css_source[blk_start..blk_end]);
                }
            }
        }
    }

    *last_end = node_end;
}

/// Transform a block that contains nested rules
#[allow(clippy::too_many_arguments)]
fn transform_block_with_nested_rules(
    block: &Value,
    selector: &str,
    hash: &str,
    css_source: &str,
    css_start: usize,
    output: &mut String,
    specificity_bumped: &mut bool,
    ctx: &CssContext,
    is_in_global_block: bool,
) {
    let block_start = block.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as usize;
    let block_end = block.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as usize;

    // Output the opening brace
    output.push('{');

    let mut last_end = block_start + 1; // After the '{'

    if let Some(children) = block.get("children").and_then(|c| c.as_array()) {
        for child in children {
            let child_type = child.get("type").and_then(|t| t.as_str());
            let child_start = child.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as usize;
            let child_end = child.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as usize;

            // Copy whitespace before this child
            if child_start > last_end {
                let ws_start = last_end.saturating_sub(css_start);
                let ws_end = child_start.saturating_sub(css_start);
                if ws_end <= css_source.len() && ws_start < ws_end {
                    output.push_str(&css_source[ws_start..ws_end]);
                }
            }

            match child_type {
                Some("Rule") => {
                    if is_global_block(child) {
                        // This is a :global { ... } block
                        // Comment out the :global { and } but keep inner content
                        transform_global_block(
                            child,
                            selector,
                            hash,
                            css_source,
                            css_start,
                            output,
                            specificity_bumped,
                            ctx,
                        );
                    } else {
                        // Regular nested rule
                        let mut local_last_end = child_start;
                        transform_rule_preserving(
                            child,
                            selector,
                            hash,
                            css_source,
                            css_start,
                            output,
                            specificity_bumped,
                            &mut local_last_end,
                            ctx,
                            true, // nested rules use :where() for specificity preservation
                            is_in_global_block, // pass through global block context
                        );
                    }
                }
                Some("Declaration") | Some("Atrule") => {
                    // Copy the declaration/atrule from source
                    let decl_start = child_start.saturating_sub(css_start);
                    let decl_end = child_end.saturating_sub(css_start);
                    if decl_end <= css_source.len() && decl_start < decl_end {
                        output.push_str(&css_source[decl_start..decl_end]);
                    }
                }
                _ => {}
            }

            last_end = child_end;
        }
    }

    // Copy whitespace/content before closing brace
    if block_end > last_end {
        let ws_start = last_end.saturating_sub(css_start);
        let ws_end = (block_end - 1).saturating_sub(css_start); // -1 to exclude the '}'
        if ws_end <= css_source.len() && ws_start < ws_end {
            output.push_str(&css_source[ws_start..ws_end]);
        }
    }

    output.push('}');
}

/// Transform a :global { ... } block by commenting out the :global wrapper
#[allow(clippy::too_many_arguments)]
fn transform_global_block(
    node: &Value,
    _selector: &str,
    _hash: &str,
    css_source: &str,
    css_start: usize,
    output: &mut String,
    _specificity_bumped: &mut bool,
    _ctx: &CssContext,
) {
    // Get positions
    let prelude = node.get("prelude");
    let block = node.get("block");

    if let (Some(prelude), Some(block)) = (prelude, block) {
        let prelude_start = prelude.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as usize;
        let block_start = block.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as usize;
        let block_end = block.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as usize;

        // Comment out `:global {`
        output.push_str("/* ");
        let selector_start = prelude_start.saturating_sub(css_start);
        let open_brace_end = (block_start + 1).saturating_sub(css_start); // Include the '{'
        if open_brace_end <= css_source.len() && selector_start < open_brace_end {
            output.push_str(&css_source[selector_start..open_brace_end]);
        }
        output.push_str("*/");

        // Process inner content
        if let Some(children) = block.get("children").and_then(|c| c.as_array()) {
            let mut last_end = block_start + 1;

            for child in children {
                let child_start = child.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as usize;
                let child_end = child.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as usize;

                // Copy whitespace before child
                if child_start > last_end {
                    let ws_start = last_end.saturating_sub(css_start);
                    let ws_end = child_start.saturating_sub(css_start);
                    if ws_end <= css_source.len() && ws_start < ws_end {
                        output.push_str(&css_source[ws_start..ws_end]);
                    }
                }

                // Copy the child from source (don't scope - it's inside :global)
                let child_start_idx = child_start.saturating_sub(css_start);
                let child_end_idx = child_end.saturating_sub(css_start);
                if child_end_idx <= css_source.len() && child_start_idx < child_end_idx {
                    output.push_str(&css_source[child_start_idx..child_end_idx]);
                }

                last_end = child_end;
            }

            // Copy whitespace before closing brace
            if block_end > last_end {
                let ws_start = last_end.saturating_sub(css_start);
                let ws_end = (block_end - 1).saturating_sub(css_start);
                if ws_end <= css_source.len() && ws_start < ws_end {
                    output.push_str(&css_source[ws_start..ws_end]);
                }
            }
        }

        // Comment out `}`
        output.push_str("/*}*/");
    }
}

/// Transform an at-rule while preserving whitespace
#[allow(clippy::too_many_arguments)]
fn transform_atrule_preserving(
    node: &Value,
    selector: &str,
    hash: &str,
    css_source: &str,
    css_start: usize,
    output: &mut String,
    specificity_bumped: &mut bool,
    last_end: &mut usize,
    ctx: &CssContext,
) {
    let node_start = node.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as usize;
    let node_end = node.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as usize;

    // Copy leading whitespace from source
    if node_start > *last_end {
        let ws_start = (*last_end).saturating_sub(css_start);
        let ws_end = node_start.saturating_sub(css_start);
        if ws_end <= css_source.len() && ws_start < ws_end {
            output.push_str(&css_source[ws_start..ws_end]);
        }
    }

    let name = node.get("name").and_then(|n| n.as_str()).unwrap_or("");

    // Handle keyframes - need special handling for name prefixing
    if name == "keyframes"
        || name == "-webkit-keyframes"
        || name == "-moz-keyframes"
        || name == "-o-keyframes"
    {
        let prelude = node.get("prelude").and_then(|p| p.as_str()).unwrap_or("");

        // Check if it's a global keyframe
        if let Some(keyframe_name) = prelude.strip_prefix("-global-") {
            output.push_str(&format!("@{} {}", name, keyframe_name));
        } else {
            output.push_str(&format!("@{} {}-{}", name, hash, prelude));
        }

        // Copy block from source
        if let Some(block) = node.get("block") {
            let block_start = block.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as usize;
            let block_end = block.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as usize;

            // Add space before block
            output.push(' ');

            let blk_start = block_start.saturating_sub(css_start);
            let blk_end = block_end.saturating_sub(css_start);
            if blk_end <= css_source.len() && blk_start < blk_end {
                output.push_str(&css_source[blk_start..blk_end]);
            }
        }

        *last_end = node_end;
        return;
    }

    // Check if block exists and is not null
    let block = node.get("block").filter(|b| !b.is_null());

    // For at-rules without nested selectors (font-face, charset, import, page, namespace),
    // copy the entire rule from source
    let is_passthrough = matches!(
        name,
        "font-face" | "charset" | "import" | "page" | "namespace"
    );

    if is_passthrough {
        // Copy the entire at-rule from source
        let src_start = node_start.saturating_sub(css_start);
        let src_end = node_end.saturating_sub(css_start);
        if src_end <= css_source.len() && src_start < src_end {
            output.push_str(&css_source[src_start..src_end]);
        }
        *last_end = node_end;
        return;
    }

    // Handle media, supports, layer, etc. - need to transform nested rules
    output.push('@');
    output.push_str(name);

    if let Some(prelude) = node.get("prelude").and_then(|p| p.as_str())
        && !prelude.is_empty()
    {
        output.push(' ');
        output.push_str(prelude);
    }

    if let Some(block) = block {
        let block_start = block.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as usize;

        output.push_str(" {\n");

        if let Some(children) = block.get("children").and_then(|c| c.as_array()) {
            let mut inner_last_end = block_start + 1; // after '{'
            for child in children {
                transform_node_preserving(
                    child,
                    selector,
                    hash,
                    css_source,
                    css_start,
                    output,
                    specificity_bumped,
                    &mut inner_last_end,
                    ctx,
                    false, // rules inside at-rules are not nested (they start fresh)
                );
            }
            // Copy trailing content in block
            let block_end = block.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as usize;
            if inner_last_end < block_end {
                let trail_start = inner_last_end.saturating_sub(css_start);
                let trail_end = (block_end - 1).saturating_sub(css_start); // -1 to exclude closing brace
                if trail_end <= css_source.len() && trail_start < trail_end {
                    output.push_str(&css_source[trail_start..trail_end]);
                }
            }
        }

        output.push_str("}\n");
    } else {
        output.push_str(";\n");
    }

    *last_end = node_end;
}

/// Transform a selector list
/// Marks unused selectors inline with /* (unused) SELECTOR*/ comments.
#[allow(clippy::too_many_arguments)]
fn transform_selector_list(
    prelude: &Value,
    selector: &str,
    _hash: &str,
    specificity_bumped: &mut bool,
    css_source: &str,
    css_start: usize,
    ctx: &CssContext,
    is_nested: bool,
    is_in_global_block: bool,
) -> String {
    let mut result = String::new();

    if let Some(children) = prelude.get("children").and_then(|c| c.as_array()) {
        // Determine the separator style based on the original source
        // If the prelude spans multiple lines, use newline-based separators
        let prelude_start = prelude.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as usize;
        let prelude_end = prelude.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as usize;

        let sep_start = prelude_start.saturating_sub(css_start);
        let sep_end = prelude_end.saturating_sub(css_start);
        let use_newlines = if sep_end <= css_source.len() && sep_start < sep_end {
            css_source[sep_start..sep_end].contains('\n')
        } else {
            false
        };

        let separator = if use_newlines { ",\n" } else { ", " };

        let mut all_unused = true;
        let mut unused_buffer = String::new();
        let mut has_output = false;

        for complex_selector in children.iter() {
            // Check if this individual selector is unused
            let is_unused = is_complex_selector_unused(complex_selector, ctx);

            if !is_unused {
                all_unused = false;
            }

            if is_unused {
                // Buffer unused selector
                let selector_text = get_selector_text(complex_selector);
                if !unused_buffer.is_empty() {
                    unused_buffer.push_str(", ");
                }
                unused_buffer.push_str(&selector_text);
            } else {
                // This selector is used
                // First, flush any buffered unused selectors
                if !unused_buffer.is_empty() {
                    result.push_str(" /* (unused) ");
                    result.push_str(&unused_buffer);
                    result.push_str("*/");
                    unused_buffer.clear();
                }
                // Output separator if not first
                if has_output {
                    result.push_str(separator);
                }
                // Output the transformed selector
                result.push_str(&transform_complex_selector(
                    complex_selector,
                    selector,
                    specificity_bumped,
                    css_source,
                    css_start,
                    is_nested,
                    is_in_global_block,
                    Some(ctx),
                ));
                has_output = true;
            }
        }

        // Flush any remaining buffered unused selectors at the end
        if !unused_buffer.is_empty() {
            if all_unused {
                // All selectors are unused - wrap entire thing
                result.push_str("/* (unused) ");
                result.push_str(&unused_buffer);
                result.push_str("*/");
            } else {
                // Some trailing unused selectors
                result.push_str(" /* (unused) ");
                result.push_str(&unused_buffer);
                result.push_str("*/");
            }
        }
    } else {
        // Fallback: just get the raw selector text
        result = get_selector_text(prelude);
    }

    result
}

/// Check if a relative selector is "global-like" (should not be scoped)
/// This includes :host, :root (without :has), and ::view-transition* pseudo elements
fn is_global_like(relative_selector: &Value) -> bool {
    if let Some(selectors) = relative_selector
        .get("selectors")
        .and_then(|s| s.as_array())
    {
        if selectors.is_empty() {
            return false;
        }

        let first = &selectors[0];
        let first_type = first.get("type").and_then(|t| t.as_str()).unwrap_or("");
        let first_name = first.get("name").and_then(|n| n.as_str()).unwrap_or("");

        // :host is global-like (regardless of other selectors in the same relative selector)
        if first_type == "PseudoClassSelector" && first_name == "host" {
            return true;
        }

        // Check if all selectors are pseudo-classes or pseudo-elements
        let all_pseudo = selectors.iter().all(|s| {
            let sel_type = s.get("type").and_then(|t| t.as_str()).unwrap_or("");
            sel_type == "PseudoClassSelector" || sel_type == "PseudoElementSelector"
        });

        if all_pseudo {
            // ::view-transition* pseudo elements are global-like
            if first_type == "PseudoElementSelector" {
                let view_transition_names = [
                    "view-transition",
                    "view-transition-group",
                    "view-transition-old",
                    "view-transition-new",
                    "view-transition-image-pair",
                ];
                if view_transition_names.contains(&first_name) {
                    return true;
                }
            }
        }

        // :root is global-like (unless it contains :has)
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
    }
    false
}

/// Transform a complex selector (sequence of relative selectors)
#[allow(clippy::too_many_arguments)]
fn transform_complex_selector(
    node: &Value,
    selector: &str,
    _specificity_bumped: &mut bool,
    css_source: &str,
    css_start: usize,
    is_nested: bool,
    is_in_global_block: bool,
    ctx: Option<&CssContext>,
) -> String {
    let mut result = String::new();
    // Each complex selector resets specificity bumping - first element gets direct class
    // For nested rules, start with bumped=true to use :where() for specificity preservation
    // EXCEPT when we're inside a :global() block - then start fresh (bumped=false)
    let mut local_specificity_bumped = is_nested && !is_in_global_block;
    // Track if we've seen a :global() selector - elements AFTER :global() should use direct class
    let mut seen_global = false;
    // Track if the previous selector was scoped - for specificity bumping decisions
    let mut _previous_was_scoped = false;
    // Track if the previous selector was global-like - determines if we bump specificity after combinator
    let mut previous_was_global_like = false;

    if let Some(children) = node.get("children").and_then(|c| c.as_array()) {
        // Pre-scan: check if ANY RelativeSelector in this ComplexSelector has :global()
        // If so, we use direct class (not :where()) for :is()/:not()/:has() content
        // Also use direct class if we're inside a :global() block
        let has_global_anywhere = is_in_global_block
            || children.iter().any(|rs| {
                if let Some(selectors) = rs.get("selectors").and_then(|s| s.as_array()) {
                    selectors.iter().any(|s| {
                        s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                            && s.get("name").and_then(|n| n.as_str()) == Some("global")
                    })
                } else {
                    false
                }
            });

        for relative_selector in children {
            // Get combinator
            if let Some(combinator) = relative_selector.get("combinator")
                && let Some(name) = combinator.get("name").and_then(|n| n.as_str())
                && (name != " " || !result.is_empty())
            {
                if name == " " {
                    result.push(' ');
                } else {
                    result.push_str(&format!(" {} ", name));
                }
                // After any combinator, subsequent selectors should use :where() for specificity preservation
                // UNLESS the previous selector was global-like (like :host), in which case the first
                // real scoped selector should get the direct class for the specificity bump
                if !previous_was_global_like {
                    local_specificity_bumped = true;
                }
                // Reset the global-like flag since we've now passed the combinator
                previous_was_global_like = false;
            }

            // Get selectors
            if let Some(selectors) = relative_selector
                .get("selectors")
                .and_then(|s| s.as_array())
            {
                // Check if the entire relative selector is :global (i.e., starts with :global)
                let is_entirely_global = selectors.first().is_some_and(|s| {
                    s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                        && s.get("name").and_then(|n| n.as_str()) == Some("global")
                });

                // Check if any selector contains :global() - for partial global handling
                let has_partial_global = !is_entirely_global
                    && selectors.iter().any(|s| {
                        s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                            && s.get("name").and_then(|n| n.as_str()) == Some("global")
                    });

                // Check if this is a global-like selector (:host, :root, ::view-transition*)
                let is_selector_global_like = is_global_like(relative_selector);

                if is_selector_global_like {
                    // Global-like selectors are output as-is, no scoping
                    for sel in selectors {
                        result.push_str(&format_simple_selector_with_scope(
                            sel,
                            "", // empty selector means no scoping
                            css_source,
                            Some(css_start),
                            0,
                            ctx,
                            false,
                        ));
                    }
                    // Global-like selectors don't count as scoped and don't bump specificity
                    // The next scoped selector should get the direct class
                    _previous_was_scoped = false;
                    previous_was_global_like = true;
                } else if is_entirely_global {
                    // Handle :global selector - extract :global() content without scoping,
                    // but scope subsequent selectors like :is() with direct class
                    for sel in selectors {
                        if sel.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                            && sel.get("name").and_then(|n| n.as_str()) == Some("global")
                        {
                            // Extract the content inside :global() from source
                            if let Some(args) = sel.get("args") {
                                let args_start =
                                    args.get("start").and_then(|s| s.as_u64()).unwrap_or(0)
                                        as usize;
                                let args_end =
                                    args.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as usize;
                                let src_start = args_start.saturating_sub(css_start);
                                let src_end = args_end.saturating_sub(css_start);
                                if src_end <= css_source.len() && src_start < src_end {
                                    result.push_str(&css_source[src_start..src_end]);
                                } else {
                                    // Fallback to reconstructed text
                                    result.push_str(&get_selector_text(args));
                                }
                            }
                        } else {
                            // For non-:global() selectors like :is(x) following :global(.foo),
                            // pass the scoping class with use_direct_class=true
                            result.push_str(&format_simple_selector_with_scope(
                                sel,
                                selector,
                                css_source,
                                Some(css_start),
                                0,
                                ctx,
                                true, // Use direct class, not :where()
                            ));
                        }
                    }
                    // Mark that we've passed a :global() selector
                    seen_global = true;
                    // :global() selectors don't count as scoped
                    _previous_was_scoped = false;
                } else if has_partial_global {
                    // Handle partial :global() - scope non-global parts, unwrap :global() parts
                    let needs_scoping = relative_selector
                        .get("metadata")
                        .and_then(|m| m.get("scoped"))
                        .and_then(|s| s.as_bool())
                        .unwrap_or(true);

                    // Find the last non-pseudo, non-global selector for scoping
                    let mut last_non_pseudo_idx = None;
                    for (idx, sel) in selectors.iter().enumerate() {
                        let sel_type = sel.get("type").and_then(|t| t.as_str()).unwrap_or("");
                        let is_global_pseudo = sel_type == "PseudoClassSelector"
                            && sel.get("name").and_then(|n| n.as_str()) == Some("global");
                        if sel_type != "PseudoElementSelector"
                            && sel_type != "PseudoClassSelector"
                            && !is_global_pseudo
                        {
                            last_non_pseudo_idx = Some(idx);
                        }
                    }

                    let mut selector_parts = String::new();
                    for (idx, sel) in selectors.iter().enumerate() {
                        let sel_type = sel.get("type").and_then(|t| t.as_str()).unwrap_or("");

                        if sel_type == "PseudoClassSelector"
                            && sel.get("name").and_then(|n| n.as_str()) == Some("global")
                        {
                            // Extract the content inside :global() from source
                            if let Some(args) = sel.get("args") {
                                let args_start =
                                    args.get("start").and_then(|s| s.as_u64()).unwrap_or(0)
                                        as usize;
                                let args_end =
                                    args.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as usize;
                                let src_start = args_start.saturating_sub(css_start);
                                let src_end = args_end.saturating_sub(css_start);
                                if src_end <= css_source.len() && src_start < src_end {
                                    selector_parts.push_str(&css_source[src_start..src_end]);
                                } else {
                                    selector_parts.push_str(&get_selector_text(args));
                                }
                            }
                        } else {
                            selector_parts.push_str(&format_simple_selector_with_scope(
                                sel,
                                selector,
                                css_source,
                                Some(css_start),
                                0,
                                ctx,
                                has_global_anywhere, // Use direct class if any part has :global()
                            ));

                            // Add scoping after the last non-pseudo selector
                            if needs_scoping && Some(idx) == last_non_pseudo_idx {
                                let modifier = get_modifier(selector, &local_specificity_bumped);
                                selector_parts.push_str(&modifier);
                                local_specificity_bumped = true;
                            }
                        }
                    }

                    result.push_str(&selector_parts);
                    // Mark that this selector was scoped (if scoping was applied)
                    _previous_was_scoped = needs_scoping;
                } else {
                    // Regular scoped selector
                    let needs_scoping = relative_selector
                        .get("metadata")
                        .and_then(|m| m.get("scoped"))
                        .and_then(|s| s.as_bool())
                        .unwrap_or(true); // Default to scoping

                    // Check if this relative selector contains a NestingSelector (&)
                    // If so, skip adding scoping - the & refers to the parent rule which already has scoping
                    let has_nesting_selector = selectors
                        .iter()
                        .any(|s| s.get("type").and_then(|t| t.as_str()) == Some("NestingSelector"));

                    // Build the selector parts
                    let mut selector_parts = String::new();
                    let mut last_non_pseudo_idx = None;

                    for (idx, sel) in selectors.iter().enumerate() {
                        let sel_type = sel.get("type").and_then(|t| t.as_str()).unwrap_or("");
                        // NestingSelector also counts as non-pseudo for determining where to add scoping
                        if sel_type != "PseudoElementSelector"
                            && sel_type != "PseudoClassSelector"
                            && sel_type != "NestingSelector"
                        {
                            last_non_pseudo_idx = Some(idx);
                        }
                    }

                    // If all selectors are pseudo-classes/elements (or nesting selectors), add scoping class first
                    // But NOT for :is(), :has(), :host, :root which handle scoping internally or should not be scoped
                    // Also skip if we have a NestingSelector - it inherits scoping from parent
                    if needs_scoping && last_non_pseudo_idx.is_none() && !has_nesting_selector {
                        // Check if first selector is one that should not have scoping added before it
                        let first_is_internal_scoping = selectors.first().is_some_and(|s| {
                            if s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                            {
                                let name = s.get("name").and_then(|n| n.as_str()).unwrap_or("");
                                // These pseudo-classes handle scoping internally or should not be scoped
                                name == "is" || name == "has" || name == "host" || name == "root"
                            } else {
                                false
                            }
                        });

                        if !first_is_internal_scoping {
                            let modifier = get_modifier(selector, &local_specificity_bumped);
                            selector_parts.push_str(&modifier);
                            local_specificity_bumped = true;
                        }
                    }

                    for (idx, sel) in selectors.iter().enumerate() {
                        let sel_type = sel.get("type").and_then(|t| t.as_str()).unwrap_or("");

                        // Handle universal selector
                        if sel_type == "TypeSelector"
                            && sel.get("name").and_then(|n| n.as_str()) == Some("*")
                        {
                            if needs_scoping {
                                // Replace * with the scoping selector
                                let modifier = get_modifier(selector, &local_specificity_bumped);
                                selector_parts.push_str(&modifier);
                                local_specificity_bumped = true;
                            } else {
                                selector_parts.push('*');
                            }
                            continue;
                        }

                        selector_parts.push_str(&format_simple_selector_with_scope(
                            sel,
                            selector,
                            css_source,
                            Some(css_start),
                            0,
                            ctx,
                            has_global_anywhere, // Use direct class if any part has :global()
                        ));

                        // Add scoping after the last non-pseudo selector
                        // If we're after a :global(), use direct class (not :where()) for the first scoped selector
                        // Skip if this relative selector contains a NestingSelector - it inherits scoping from parent
                        if needs_scoping
                            && Some(idx) == last_non_pseudo_idx
                            && !has_nesting_selector
                        {
                            let should_use_where = local_specificity_bumped && !seen_global;
                            let modifier = get_modifier(selector, &should_use_where);
                            selector_parts.push_str(&modifier);
                            local_specificity_bumped = true;
                            // After using direct class following :global(), subsequent selectors should use :where()
                            seen_global = false;
                        }
                    }

                    result.push_str(&selector_parts);
                    // Mark that this selector was scoped (unless it's a nesting selector)
                    _previous_was_scoped = needs_scoping && !has_nesting_selector;
                }
            }
        }
    }

    result
}

/// Get the modifier for specificity bumping
fn get_modifier(selector: &str, specificity_bumped: &bool) -> String {
    if *specificity_bumped {
        format!(":where({})", selector)
    } else {
        selector.to_string()
    }
}

/// Format a simple selector
fn format_simple_selector(sel: &Value) -> String {
    format_simple_selector_with_scope(sel, "", "", None, 0, None, false)
}

/// Format a simple selector with optional scoping for inner selectors
/// `use_direct_class` - When true, use direct class (e.g., .svelte-xyz) instead of :where() inside :is()/:not()/:has()
fn format_simple_selector_with_scope(
    sel: &Value,
    selector: &str,
    css_source: &str,
    css_start: Option<usize>,
    _depth: usize,
    ctx: Option<&CssContext>,
    use_direct_class: bool,
) -> String {
    let sel_type = sel.get("type").and_then(|t| t.as_str()).unwrap_or("");

    match sel_type {
        "TypeSelector" => sel
            .get("name")
            .and_then(|n| n.as_str())
            .unwrap_or("")
            .to_string(),
        "ClassSelector" | "IdSelector" => {
            // For class and ID selectors, use the original source to preserve
            // Unicode escape sequences and their terminating whitespace
            let prefix = if sel_type == "ClassSelector" {
                "."
            } else {
                "#"
            };

            // Try to extract from original source first (preserves escape sequences)
            if let (Some(start), Some(end), Some(css_start)) = (
                sel.get("start").and_then(|s| s.as_u64()),
                sel.get("end").and_then(|e| e.as_u64()),
                css_start,
            ) {
                let start = start as usize;
                let end = end as usize;
                let src_start = start.saturating_sub(css_start);
                let src_end = end.saturating_sub(css_start);

                if src_end <= css_source.len() && src_start < src_end {
                    return css_source[src_start..src_end].to_string();
                }
            }

            // Fallback: reconstruct from name (may lose escape sequence whitespace)
            format!(
                "{}{}",
                prefix,
                sel.get("name").and_then(|n| n.as_str()).unwrap_or("")
            )
        }
        "AttributeSelector" => {
            let name = sel.get("name").and_then(|n| n.as_str()).unwrap_or("");
            let matcher = sel.get("matcher").and_then(|m| m.as_str());
            let value = sel.get("value").and_then(|v| v.as_str());
            let flags = sel.get("flags").and_then(|f| f.as_str());

            let mut result = format!("[{}", name);
            if let (Some(m), Some(v)) = (matcher, value) {
                result.push_str(m);
                result.push_str(v);
            }
            if let Some(f) = flags {
                result.push(' ');
                result.push_str(f);
            }
            result.push(']');
            result
        }
        "PseudoClassSelector" => {
            let name = sel.get("name").and_then(|n| n.as_str()).unwrap_or("");

            // Handle :is(), :not(), :has() - these take selector lists as arguments
            // and need to scope their inner selectors
            if let Some(args) = sel.get("args") {
                if (name == "is" || name == "not" || name == "has") && !selector.is_empty() {
                    // Transform the inner selector list with appropriate scoping
                    let inner = transform_is_not_args(
                        args,
                        selector,
                        css_source,
                        name,
                        ctx,
                        use_direct_class,
                    );
                    format!(":{}({})", name, inner)
                } else {
                    format!(":{}({})", name, get_selector_text(args))
                }
            } else {
                format!(":{}", name)
            }
        }
        "PseudoElementSelector" => {
            // For pseudo elements, use source preservation to extract the original text
            // including any arguments like ::view-transition-group(foo)
            // The parser sets end position to after the name, so we need to scan for arguments
            if let (Some(start), Some(end), Some(css_start)) = (
                sel.get("start").and_then(|s| s.as_u64()),
                sel.get("end").and_then(|e| e.as_u64()),
                css_start,
            ) {
                let start = start as usize;
                let mut end = end as usize;
                let src_start = start.saturating_sub(css_start);

                // Check if there are arguments in parentheses after the name
                let mut src_end = end.saturating_sub(css_start);
                if src_end < css_source.len() {
                    let remaining = &css_source[src_end..];
                    if remaining.starts_with('(') {
                        // Find the matching closing parenthesis
                        let mut depth = 0;
                        for (i, c) in remaining.chars().enumerate() {
                            if c == '(' {
                                depth += 1;
                            } else if c == ')' {
                                depth -= 1;
                                if depth == 0 {
                                    end = end + i + 1; // Include the closing paren
                                    src_end = end.saturating_sub(css_start);
                                    break;
                                }
                            }
                        }
                    }
                }

                if src_end <= css_source.len() && src_start < src_end {
                    return css_source[src_start..src_end].to_string();
                }
            }

            // Fallback: reconstruct from name only (may lose arguments)
            let name = sel.get("name").and_then(|n| n.as_str()).unwrap_or("");
            format!("::{}", name)
        }
        "NestingSelector" => "&".to_string(),
        _ => String::new(),
    }
}

/// Transform the arguments of :is(), :not(), or :has() with optional :where() scoping
/// Also handles partial unused marking - individual selectors that don't match
/// any elements are commented out as /* (unused) selector*/
/// When `use_direct_class` is true, use direct class (e.g., .svelte-xyz) instead of :where()
///
/// Note: For :not(), we never mark inner selectors as unused because :not(X) means
/// "everything that is NOT X", which is always potentially matching something.
fn transform_is_not_args(
    args: &Value,
    selector: &str,
    css_source: &str,
    pseudo_name: &str,
    ctx: Option<&CssContext>,
    use_direct_class: bool,
) -> String {
    let mut result = String::new();

    // args should be a SelectorList
    if let Some(children) = args.get("children").and_then(|c| c.as_array()) {
        let mut used_selectors = Vec::new();
        let mut unused_selectors = Vec::new();

        for complex_selector in children.iter() {
            // For :not(), never mark inner selectors as unused
            // :not(X) means "everything except X", so even if X doesn't exist,
            // the selector still matches all elements
            let is_unused = if pseudo_name == "not" {
                false
            } else {
                // Check if this selector is unused (only if we have context)
                // Use the conservative check for inner selectors - only mark as unused
                // if it's a simple class/id that definitely doesn't exist
                ctx.map(|c| is_is_inner_selector_unused(complex_selector, c))
                    .unwrap_or(false)
            };

            if is_unused {
                // Collect the raw selector text for unused selectors
                unused_selectors.push(get_selector_text(complex_selector));
            } else {
                // Transform and collect used selectors
                used_selectors.push(transform_is_not_complex_selector(
                    complex_selector,
                    selector,
                    css_source,
                    pseudo_name,
                    ctx,
                    use_direct_class,
                ));
            }
        }

        // Build the result: used selectors first, then unused comment
        for (i, sel) in used_selectors.iter().enumerate() {
            if i > 0 {
                result.push_str(", ");
            }
            result.push_str(sel);
        }

        // Add unused selectors as a comment if any
        if !unused_selectors.is_empty() {
            if !used_selectors.is_empty() {
                result.push_str(" /* (unused) ");
            } else {
                // All selectors are unused - this case should be handled by the caller
                // by marking the entire rule as unused
                result.push_str("/* (unused) ");
            }
            result.push_str(&unused_selectors.join(", "));
            result.push_str("*/");
        }
    } else {
        // Fallback to raw text
        result = get_selector_text(args);
    }

    result
}

/// Transform a complex selector inside :is()/:not()/:has() with optional :where() scoping
/// When `use_direct_class` is true, use direct class (e.g., .svelte-xyz) instead of :where()
fn transform_is_not_complex_selector(
    node: &Value,
    selector: &str,
    css_source: &str,
    pseudo_name: &str,
    ctx: Option<&CssContext>,
    use_direct_class: bool,
) -> String {
    let mut result = String::new();

    if let Some(children) = node.get("children").and_then(|c| c.as_array()) {
        // For :not(), only scope if there are multiple relative selectors (complex selector with combinators)
        // For :is() and :has(), always scope
        let is_simple_selector = children.len() == 1;
        let should_scope = if pseudo_name == "not" {
            // :not() with simple selector: don't scope the inside
            // :not() with complex selector: scope with :where()
            !is_simple_selector
        } else {
            // :is() and :has() always scope their content
            true
        };

        for relative_selector in children {
            // Get combinator
            if let Some(combinator) = relative_selector.get("combinator")
                && let Some(name) = combinator.get("name").and_then(|n| n.as_str())
                && (name != " " || !result.is_empty())
            {
                if name == " " {
                    result.push(' ');
                } else if result.is_empty() {
                    // First combinator - no leading space, no trailing space
                    // This handles :has(~span) where ~span has no spaces
                    result.push_str(name);
                } else {
                    result.push_str(&format!(" {} ", name));
                }
            }

            // Get selectors in this relative selector
            if let Some(selectors) = relative_selector
                .get("selectors")
                .and_then(|s| s.as_array())
            {
                // Check if this is a :global() selector
                let is_global = selectors.first().is_some_and(|s| {
                    s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                        && s.get("name").and_then(|n| n.as_str()) == Some("global")
                });

                if is_global {
                    // Handle :global() - extract inner content without scoping
                    for sel in selectors {
                        if sel.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                            && sel.get("name").and_then(|n| n.as_str()) == Some("global")
                        {
                            if let Some(global_args) = sel.get("args") {
                                result.push_str(&get_selector_text(global_args));
                            }
                        } else {
                            result.push_str(&format_simple_selector(sel));
                        }
                    }
                } else if should_scope {
                    // Add :where() scoping for complex selectors
                    let mut selector_parts = String::new();
                    let mut last_non_pseudo_idx = None;

                    // Find the last non-pseudo selector
                    for (idx, sel) in selectors.iter().enumerate() {
                        let sel_type = sel.get("type").and_then(|t| t.as_str()).unwrap_or("");
                        if sel_type != "PseudoElementSelector" && sel_type != "PseudoClassSelector"
                        {
                            last_non_pseudo_idx = Some(idx);
                        }
                    }

                    for (idx, sel) in selectors.iter().enumerate() {
                        let sel_type = sel.get("type").and_then(|t| t.as_str()).unwrap_or("");
                        let is_universal = sel_type == "TypeSelector"
                            && sel.get("name").and_then(|n| n.as_str()) == Some("*");

                        // If this is a universal selector (*) that will be replaced by :where(),
                        // don't output the * - just output the :where() directly
                        if is_universal && Some(idx) == last_non_pseudo_idx && !selector.is_empty()
                        {
                            // Replace * with just :where(selector)
                            if use_direct_class {
                                selector_parts.push_str(selector);
                            } else {
                                selector_parts.push_str(&format!(":where({})", selector));
                            }
                            continue;
                        }

                        selector_parts.push_str(&format_simple_selector_with_scope(
                            sel,
                            selector,
                            css_source,
                            None,
                            1,
                            ctx,
                            use_direct_class,
                        ));

                        // Add scoping after the last non-pseudo selector
                        // Use :where() to preserve specificity, unless use_direct_class is true
                        if Some(idx) == last_non_pseudo_idx && !selector.is_empty() {
                            if use_direct_class {
                                selector_parts.push_str(selector);
                            } else {
                                selector_parts.push_str(&format!(":where({})", selector));
                            }
                        }
                    }

                    result.push_str(&selector_parts);
                } else {
                    // For :not() with simple selector, just output without scoping
                    for sel in selectors {
                        result.push_str(&format_simple_selector(sel));
                    }
                }
            }
        }
    }

    result
}

/// Get raw selector text from a node
fn get_selector_text(node: &Value) -> String {
    // Handle Raw type (used for pseudo element arguments like ::view-transition-group(foo))
    if node.get("type").and_then(|t| t.as_str()) == Some("Raw") {
        return node
            .get("value")
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string();
    }

    if let Some(children) = node.get("children").and_then(|c| c.as_array()) {
        let mut result = String::new();
        for child in children {
            // Check if this is a RelativeSelector with a combinator
            if let Some(combinator) = child.get("combinator")
                && let Some(name) = combinator.get("name").and_then(|n| n.as_str())
                && !result.is_empty()
            {
                // Add combinator (space for descendant, or the actual combinator)
                if name == " " {
                    result.push(' ');
                } else {
                    result.push_str(&format!(" {} ", name));
                }
            }

            // Add the selectors from this relative selector or child
            if let Some(selectors) = child.get("selectors").and_then(|s| s.as_array()) {
                for sel in selectors {
                    result.push_str(&format_simple_selector(sel));
                }
            } else {
                result.push_str(&get_selector_text(child));
            }
        }
        result
    } else if let Some(selectors) = node.get("selectors").and_then(|s| s.as_array()) {
        let mut result = String::new();
        for sel in selectors {
            result.push_str(&format_simple_selector(sel));
        }
        result
    } else {
        format_simple_selector(node)
    }
}

/// Generate a raw hash string (matches Svelte's hash() function in utils.js).
/// This is the base hash without the "svelte-" prefix.
pub fn generate_raw_hash(source: &str) -> String {
    // Remove carriage returns like Svelte does
    let source = source.replace('\r', "");

    let mut hash: i32 = 5381;
    let bytes: Vec<char> = source.chars().collect();

    // Iterate backwards like Svelte does
    for i in (0..bytes.len()).rev() {
        hash = ((hash << 5).wrapping_sub(hash)) ^ (bytes[i] as i32);
    }

    // Convert to unsigned and then to base-36
    let hash_unsigned = hash as u32;
    to_base36(hash_unsigned)
}

/// Generate a hash for CSS scoping (matches Svelte's algorithm).
pub fn generate_css_hash(source: &str) -> String {
    format!("svelte-{}", generate_raw_hash(source))
}

/// Convert a number to base-36 string
fn to_base36(mut n: u32) -> String {
    if n == 0 {
        return "0".to_string();
    }

    const DIGITS: &[u8] = b"0123456789abcdefghijklmnopqrstuvwxyz";
    let mut result = Vec::new();

    while n > 0 {
        result.push(DIGITS[(n % 36) as usize]);
        n /= 36;
    }

    result.reverse();
    String::from_utf8(result).unwrap()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_css_transformation() {
        let input = r#"<div>red</div>

<style>
	div {
		color: red;
	}
</style>"#;

        if let Some((css_content, css_start)) = extract_css_content(input) {
            let children = parse_css(&css_content, css_start);
            println!("CSS Children: {:?}", children);

            let hash = "svelte-test";
            let selector = ".svelte-test";
            let used_elements = FxHashSet::default();
            let used_classes = FxHashSet::default();
            let used_ids = FxHashSet::default();
            let dom_structure = DomStructure::default();
            let ctx = CssContext {
                used_elements: &used_elements,
                used_classes: &used_classes,
                used_ids: &used_ids,
                has_dynamic_elements: false,
                has_dynamic_classes: false,
                has_control_flow: false,
                dom_structure: &dom_structure,
            };
            let output = transform_css(&children, selector, hash, &css_content, css_start, &ctx);
            println!("CSS Output:\n{}", output);
        }
    }

    #[test]
    fn test_combinator_handling() {
        let input = r#"<main><div><button>Blue</button></div></main>

<style>
  main button {
    background-color: red;
  }

  main div > button {
    background-color: blue;
  }
</style>"#;

        if let Some((css_content, css_start)) = extract_css_content(input) {
            let children = parse_css(&css_content, css_start);
            println!("CSS AST: {:#?}", children);

            let hash = "svelte-test";
            let selector = ".svelte-test";
            let used_elements = FxHashSet::default();
            let used_classes = FxHashSet::default();
            let used_ids = FxHashSet::default();
            let dom_structure = DomStructure::default();
            let ctx = CssContext {
                used_elements: &used_elements,
                used_classes: &used_classes,
                used_ids: &used_ids,
                has_dynamic_elements: false,
                has_dynamic_classes: false,
                has_control_flow: false,
                dom_structure: &dom_structure,
            };
            let output = transform_css(&children, selector, hash, &css_content, css_start, &ctx);
            println!("CSS Output:\n{}", output);
        }
    }
}
