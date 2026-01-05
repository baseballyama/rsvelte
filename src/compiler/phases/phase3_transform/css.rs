//! CSS code generation.
//!
//! Generates scoped CSS stylesheets with selector scoping.
//! Preserves original whitespace from source using AST positions.

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

    let hash = &analysis.css.hash;
    let selector = format!(".{}", hash);

    // Extract CSS content and its start position
    if let Some((css_content, css_start)) = extract_css_content(source) {
        // Parse the CSS with proper start offset
        let children = crate::parser::css::parse_css(&css_content, css_start);
        let code = transform_css(&children, &selector, hash, &css_content, css_start);
        Ok(CssOutput { code, map: None })
    } else {
        Ok(CssOutput {
            code: String::new(),
            map: None,
        })
    }
}

/// Extract CSS content from source (finds the <style> block)
/// Returns (css_content, start_position_in_source)
fn extract_css_content(source: &str) -> Option<(String, usize)> {
    let style_start = source.find("<style")?;
    let content_start = source[style_start..].find('>')? + style_start + 1;
    let style_end = source.find("</style>")?;

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

    // Get the prelude (selector list)
    if let Some(prelude) = node.get("prelude") {
        let prelude_end = prelude.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as usize;

        // Transform selectors
        let transformed_selector = transform_selector_list(
            prelude,
            selector,
            hash,
            specificity_bumped,
            css_source,
            css_start,
        );
        output.push_str(&transformed_selector);

        // Get the block and copy its content from source
        if let Some(block) = node.get("block") {
            let block_start = block.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as usize;
            let block_end = block.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as usize;

            // Copy space between prelude and block
            if block_start > prelude_end {
                let gap_start = prelude_end.saturating_sub(css_start);
                let gap_end = block_start.saturating_sub(css_start);
                if gap_end <= css_source.len() && gap_start < gap_end {
                    output.push_str(&css_source[gap_start..gap_end]);
                }
            }

            // Copy the entire block from source (including braces and content)
            let blk_start = block_start.saturating_sub(css_start);
            let blk_end = block_end.saturating_sub(css_start);
            if blk_end <= css_source.len() && blk_start < blk_end {
                output.push_str(&css_source[blk_start..blk_end]);
            }
        }
    }

    *last_end = node_end;
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

    if let Some(prelude) = node.get("prelude").and_then(|p| p.as_str()) {
        if !prelude.is_empty() {
            output.push(' ');
            output.push_str(prelude);
        }
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
fn transform_selector_list(
    prelude: &Value,
    selector: &str,
    _hash: &str,
    specificity_bumped: &mut bool,
    css_source: &str,
    css_start: usize,
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
                css_source,
                css_start,
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
    _specificity_bumped: &mut bool,
    css_source: &str,
    css_start: usize,
) -> String {
    let mut result = String::new();
    // Each complex selector resets specificity bumping - first element gets direct class
    let mut local_specificity_bumped = false;

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

                if is_entirely_global {
                    // Handle :global selector - extract all content without scoping
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
                            result.push_str(&format_simple_selector(sel));
                        }
                    }
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
                            selector_parts.push_str(&format_simple_selector(sel));

                            // Add scoping after the last non-pseudo selector
                            if needs_scoping && Some(idx) == last_non_pseudo_idx {
                                let modifier = get_modifier(selector, &local_specificity_bumped);
                                selector_parts.push_str(&modifier);
                                local_specificity_bumped = true;
                            }
                        }
                    }

                    result.push_str(&selector_parts);
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
                                let modifier = get_modifier(selector, &local_specificity_bumped);
                                selector_parts.push_str(&modifier);
                                local_specificity_bumped = true;
                            } else {
                                selector_parts.push('*');
                            }
                            continue;
                        }

                        selector_parts.push_str(&format_simple_selector(sel));

                        // Add scoping after the last non-pseudo selector
                        if needs_scoping && Some(idx) == last_non_pseudo_idx {
                            let modifier = get_modifier(selector, &local_specificity_bumped);
                            selector_parts.push_str(&modifier);
                            local_specificity_bumped = true;
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
            let children = crate::parser::css::parse_css(&css_content, css_start);
            println!("CSS Children: {:?}", children);

            let hash = "svelte-test";
            let selector = ".svelte-test";
            let output = transform_css(&children, selector, hash, &css_content, css_start);
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
            let children = crate::parser::css::parse_css(&css_content, css_start);
            println!("CSS AST: {:#?}", children);

            let hash = "svelte-test";
            let selector = ".svelte-test";
            let output = transform_css(&children, selector, hash, &css_content, css_start);
            println!("CSS Output:\n{}", output);
        }
    }
}
