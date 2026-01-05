//! CSS code generation.
//!
//! Generates scoped CSS stylesheets with selector scoping.

use super::{CssOutput, TransformError};
use crate::compiler::CompileOptions;
use crate::compiler::phases::phase2_analyze::ComponentAnalysis;
use serde_json::Value;

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

    // Get the CSS AST from the source
    // The CSS content is in the StyleSheet's content.styles
    let hash = &analysis.css.hash;
    let selector = format!(".{}", hash);

    // We need to parse the CSS from the analysis
    // For now, let's try to transform the CSS from the source
    if let Some(css_children) = extract_css_children(source) {
        let code = transform_css(&css_children, &selector, hash);
        Ok(CssOutput { code, map: None })
    } else {
        Ok(CssOutput {
            code: String::new(),
            map: None,
        })
    }
}

/// Extract CSS children from source (finds the <style> block and parses it)
fn extract_css_children(source: &str) -> Option<Vec<Value>> {
    // Find <style> block
    let style_start = source.find("<style")?;
    let content_start = source[style_start..].find('>')? + style_start + 1;
    let style_end = source.find("</style>")?;

    if content_start >= style_end {
        return None;
    }

    let css_content = &source[content_start..style_end];

    // Parse the CSS - returns Vec<Value> (the children array)
    Some(crate::parser::css::parse_css(css_content, content_start))
}

/// Transform CSS by adding scoping to selectors
fn transform_css(children: &[Value], selector: &str, hash: &str) -> String {
    let mut output = String::new();
    let mut specificity_bumped = false;

    for child in children {
        transform_node(child, selector, hash, &mut output, &mut specificity_bumped);
    }

    output
}

/// Transform a CSS node
fn transform_node(
    node: &Value,
    selector: &str,
    hash: &str,
    output: &mut String,
    specificity_bumped: &mut bool,
) {
    match node.get("type").and_then(|t| t.as_str()) {
        Some("Rule") => {
            transform_rule(node, selector, hash, output, specificity_bumped);
        }
        Some("Atrule") => {
            transform_atrule(node, selector, hash, output, specificity_bumped);
        }
        _ => {}
    }
}

/// Transform a CSS rule
fn transform_rule(
    node: &Value,
    selector: &str,
    hash: &str,
    output: &mut String,
    specificity_bumped: &mut bool,
) {
    // Get the prelude (selector list)
    if let Some(prelude) = node.get("prelude") {
        // Transform selectors
        let transformed_selector =
            transform_selector_list(prelude, selector, hash, specificity_bumped);
        output.push_str(&transformed_selector);
    }

    // Get the block
    if let Some(block) = node.get("block") {
        output.push_str(" {\n");

        // Process block children
        if let Some(children) = block.get("children").and_then(|c| c.as_array()) {
            for child in children {
                match child.get("type").and_then(|t| t.as_str()) {
                    Some("Declaration") => {
                        if let (Some(property), Some(value)) = (
                            child.get("property").and_then(|p| p.as_str()),
                            child.get("value").and_then(|v| v.as_str()),
                        ) {
                            // Handle animation/animation-name with keyframe scoping
                            let scoped_value =
                                scope_animation_value(property, value, hash, specificity_bumped);
                            output.push_str(&format!("\t{}: {};\n", property, scoped_value));
                        }
                    }
                    Some("Rule") => {
                        // Nested rule
                        output.push('\t');
                        transform_rule(child, selector, hash, output, specificity_bumped);
                    }
                    _ => {}
                }
            }
        }

        output.push_str("}\n");
    }
}

/// Transform an at-rule
fn transform_atrule(
    node: &Value,
    selector: &str,
    hash: &str,
    output: &mut String,
    specificity_bumped: &mut bool,
) {
    let name = node.get("name").and_then(|n| n.as_str()).unwrap_or("");

    // Handle keyframes
    if name == "keyframes" || name == "-webkit-keyframes" {
        let prelude = node.get("prelude").and_then(|p| p.as_str()).unwrap_or("");

        // Check if it's a global keyframe
        if let Some(keyframe_name) = prelude.strip_prefix("-global-") {
            // Remove -global- prefix
            output.push_str(&format!("@{} {} ", name, keyframe_name));
        } else {
            // Add hash prefix to keyframe name
            output.push_str(&format!("@{} {}-{} ", name, hash, prelude));
        }

        // Process block
        if let Some(block) = node.get("block") {
            output.push_str("{\n");
            if let Some(children) = block.get("children").and_then(|c| c.as_array()) {
                for child in children {
                    transform_keyframe_block(child, output);
                }
            }
            output.push_str("}\n");
        }
        return;
    }

    // Handle other at-rules (media, supports, etc.)
    output.push('@');
    output.push_str(name);

    if let Some(prelude) = node.get("prelude").and_then(|p| p.as_str()) {
        output.push(' ');
        output.push_str(prelude);
    }

    if let Some(block) = node.get("block") {
        output.push_str(" {\n");
        if let Some(children) = block.get("children").and_then(|c| c.as_array()) {
            for child in children {
                transform_node(child, selector, hash, output, specificity_bumped);
            }
        }
        output.push_str("}\n");
    } else {
        output.push_str(";\n");
    }
}

/// Transform keyframe block content
fn transform_keyframe_block(node: &Value, output: &mut String) {
    if node.get("type").and_then(|t| t.as_str()) == Some("Rule") {
        if let Some(prelude) = node.get("prelude") {
            let prelude_str = get_selector_text(prelude);
            output.push_str(&format!("\t{} ", prelude_str));
        }

        if let Some(block) = node.get("block") {
            output.push_str("{\n");
            if let Some(children) = block.get("children").and_then(|c| c.as_array()) {
                for child in children {
                    if child.get("type").and_then(|t| t.as_str()) == Some("Declaration") {
                        if let (Some(property), Some(value)) = (
                            child.get("property").and_then(|p| p.as_str()),
                            child.get("value").and_then(|v| v.as_str()),
                        ) {
                            output.push_str(&format!("\t\t{}: {};\n", property, value));
                        }
                    }
                }
            }
            output.push_str("\t}\n");
        }
    }
}

/// Transform a selector list
fn transform_selector_list(
    prelude: &Value,
    selector: &str,
    _hash: &str,
    specificity_bumped: &mut bool,
) -> String {
    let mut result = String::new();

    if let Some(children) = prelude.get("children").and_then(|c| c.as_array()) {
        for (i, complex_selector) in children.iter().enumerate() {
            if i > 0 {
                result.push_str(", ");
            }
            result.push_str(&transform_complex_selector(
                complex_selector,
                selector,
                specificity_bumped,
            ));
        }
    } else {
        // Fallback: just get the raw selector text
        result = get_selector_text(prelude);
    }

    result
}

/// Transform a complex selector (sequence of relative selectors)
fn transform_complex_selector(
    node: &Value,
    selector: &str,
    specificity_bumped: &mut bool,
) -> String {
    let mut result = String::new();

    if let Some(children) = node.get("children").and_then(|c| c.as_array()) {
        for relative_selector in children {
            // Get combinator
            if let Some(combinator) = relative_selector.get("combinator") {
                if let Some(name) = combinator.get("name").and_then(|n| n.as_str()) {
                    if name != " " || !result.is_empty() {
                        if name == " " {
                            result.push(' ');
                        } else {
                            result.push_str(&format!(" {} ", name));
                        }
                    }
                }
            }

            // Get selectors
            if let Some(selectors) = relative_selector
                .get("selectors")
                .and_then(|s| s.as_array())
            {
                // Check if this is a :global selector
                let is_global = selectors.iter().any(|s| {
                    s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                        && s.get("name").and_then(|n| n.as_str()) == Some("global")
                });

                if is_global {
                    // Handle :global selector
                    for sel in selectors {
                        if sel.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                            && sel.get("name").and_then(|n| n.as_str()) == Some("global")
                        {
                            // Extract the content inside :global()
                            if let Some(args) = sel.get("args") {
                                result.push_str(&get_selector_text(args));
                            }
                        } else {
                            result.push_str(&format_simple_selector(sel));
                        }
                    }
                } else {
                    // Regular scoped selector
                    let needs_scoping = relative_selector
                        .get("metadata")
                        .and_then(|m| m.get("scoped"))
                        .and_then(|s| s.as_bool())
                        .unwrap_or(true); // Default to scoping

                    // Build the selector parts
                    let mut selector_parts = String::new();
                    let mut last_non_pseudo_idx = None;

                    for (idx, sel) in selectors.iter().enumerate() {
                        let sel_type = sel.get("type").and_then(|t| t.as_str()).unwrap_or("");
                        if sel_type != "PseudoElementSelector" && sel_type != "PseudoClassSelector"
                        {
                            last_non_pseudo_idx = Some(idx);
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
                                let modifier = get_modifier(selector, specificity_bumped);
                                selector_parts.push_str(&modifier);
                                *specificity_bumped = true;
                            } else {
                                selector_parts.push('*');
                            }
                            continue;
                        }

                        selector_parts.push_str(&format_simple_selector(sel));

                        // Add scoping after the last non-pseudo selector
                        if needs_scoping && Some(idx) == last_non_pseudo_idx {
                            let modifier = get_modifier(selector, specificity_bumped);
                            selector_parts.push_str(&modifier);
                            *specificity_bumped = true;
                        }
                    }

                    result.push_str(&selector_parts);
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
    let sel_type = sel.get("type").and_then(|t| t.as_str()).unwrap_or("");

    match sel_type {
        "TypeSelector" => sel
            .get("name")
            .and_then(|n| n.as_str())
            .unwrap_or("")
            .to_string(),
        "ClassSelector" => {
            format!(
                ".{}",
                sel.get("name").and_then(|n| n.as_str()).unwrap_or("")
            )
        }
        "IdSelector" => {
            format!(
                "#{}",
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
            if let Some(args) = sel.get("args") {
                format!(":{}({})", name, get_selector_text(args))
            } else {
                format!(":{}", name)
            }
        }
        "PseudoElementSelector" => {
            let name = sel.get("name").and_then(|n| n.as_str()).unwrap_or("");
            format!("::{}", name)
        }
        "NestingSelector" => "&".to_string(),
        _ => String::new(),
    }
}

/// Get raw selector text from a node
fn get_selector_text(node: &Value) -> String {
    if let Some(children) = node.get("children").and_then(|c| c.as_array()) {
        let mut result = String::new();
        for child in children {
            result.push_str(&get_selector_text(child));
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

/// Scope animation values (animation-name references)
fn scope_animation_value(
    property: &str,
    value: &str,
    hash: &str,
    _specificity_bumped: &mut bool,
) -> String {
    let prop_lower = property.to_lowercase();
    let prop_clean = prop_lower
        .strip_prefix("-webkit-")
        .or_else(|| prop_lower.strip_prefix("-moz-"))
        .or_else(|| prop_lower.strip_prefix("-ms-"))
        .or_else(|| prop_lower.strip_prefix("-o-"))
        .unwrap_or(&prop_lower);

    if prop_clean == "animation" || prop_clean == "animation-name" {
        // For animation or animation-name, we need to scope the keyframe names
        // This is a simplified version - proper implementation would parse the animation shorthand
        let parts: Vec<&str> = value.split_whitespace().collect();
        let scoped_parts: Vec<String> = parts
            .iter()
            .map(|part| {
                // Skip CSS keywords
                if is_animation_keyword(part) {
                    part.to_string()
                } else if let Some(stripped) = part.strip_prefix("-global-") {
                    // Remove -global- prefix
                    stripped.to_string()
                } else if is_valid_keyframe_name(part) {
                    // Scope the keyframe name
                    format!("{}-{}", hash, part)
                } else {
                    part.to_string()
                }
            })
            .collect();
        scoped_parts.join(" ")
    } else {
        value.to_string()
    }
}

/// Check if a string is a CSS animation keyword
fn is_animation_keyword(s: &str) -> bool {
    matches!(
        s.to_lowercase().as_str(),
        "none"
            | "infinite"
            | "normal"
            | "reverse"
            | "alternate"
            | "alternate-reverse"
            | "forwards"
            | "backwards"
            | "both"
            | "running"
            | "paused"
            | "ease"
            | "ease-in"
            | "ease-out"
            | "ease-in-out"
            | "linear"
            | "step-start"
            | "step-end"
            | "initial"
            | "inherit"
            | "unset"
    ) || s.ends_with('s')
        || s.ends_with("ms")
        || s.parse::<f64>().is_ok()
        || s.starts_with("cubic-bezier")
        || s.starts_with("steps(")
}

/// Check if a string could be a valid keyframe name
fn is_valid_keyframe_name(s: &str) -> bool {
    !s.is_empty()
        && !s.starts_with('-')
        && s.chars()
            .all(|c| c.is_alphanumeric() || c == '-' || c == '_')
}

/// Generate a hash for CSS scoping (matches Svelte's algorithm).
pub fn generate_css_hash(source: &str) -> String {
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
    format!("svelte-{}", to_base36(hash_unsigned))
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
