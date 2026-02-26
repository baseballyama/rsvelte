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
    /// Whether template has opaque elements (slots/snippets/render tags) or
    /// non-exhaustive await blocks that prevent reliable sibling analysis
    has_opaque_sibling_boundaries: bool,
    /// DOM structure for advanced selector matching
    dom_structure: &'a DomStructure,
    /// Stack of parent rule preludes for resolving NestingSelector (&) in nested CSS rules.
    /// Each entry is a reference to the prelude Value of an ancestor rule.
    /// Used to determine unused status of compound selectors containing &.
    /// Uses RefCell for interior mutability so we can push/pop while passing &CssContext.
    parent_preludes: std::cell::RefCell<Vec<&'a Value>>,
}

/// Render the stylesheet for a component.
pub fn render_stylesheet(
    analysis: &ComponentAnalysis,
    source: &str,
    options: &CompileOptions,
) -> Result<CssOutput, TransformError> {
    render_stylesheet_internal(analysis, source, options, false)
}

/// Render the stylesheet for a component with optional minification.
/// Used for injected CSS in SSR which should be minified.
pub fn render_stylesheet_minified(
    analysis: &ComponentAnalysis,
    source: &str,
    options: &CompileOptions,
) -> Result<CssOutput, TransformError> {
    render_stylesheet_internal(analysis, source, options, true)
}

/// Internal implementation of render_stylesheet with minification option.
fn render_stylesheet_internal(
    analysis: &ComponentAnalysis,
    source: &str,
    _options: &CompileOptions,
    minify: bool,
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
        has_opaque_sibling_boundaries: analysis.css.has_opaque_elements,
        dom_structure: &analysis.css.dom_structure,
        parent_preludes: std::cell::RefCell::new(Vec::new()),
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

        // Minify if requested (for injected CSS in SSR)
        if minify {
            code = minify_css(&code);
        }

        Ok(CssOutput { code, map: None })
    } else {
        Ok(CssOutput {
            code: String::new(),
            map: None,
        })
    }
}

/// Minify CSS by removing unnecessary whitespace and comments.
/// This is a simple minification for injected CSS in SSR.
fn minify_css(css: &str) -> String {
    let mut result = String::with_capacity(css.len());
    let chars: Vec<char> = css.chars().collect();
    let mut i = 0;
    let mut in_string = false;
    let mut string_char = ' ';
    let mut last_was_space = true; // Start true to trim leading whitespace

    while i < chars.len() {
        let c = chars[i];

        // Track string literals
        if (c == '"' || c == '\'') && (i == 0 || chars[i - 1] != '\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
        }

        // In strings, preserve everything
        if in_string {
            result.push(c);
            last_was_space = false;
            i += 1;
            continue;
        }

        // Skip CSS comments
        if c == '/' && i + 1 < chars.len() && chars[i + 1] == '*' {
            // Find end of comment
            let mut j = i + 2;
            while j + 1 < chars.len() && !(chars[j] == '*' && chars[j + 1] == '/') {
                j += 1;
            }
            i = j + 2; // Skip past */
            continue;
        }

        // Collapse whitespace
        if c.is_whitespace() {
            if !last_was_space {
                // Only add a space if:
                // - Not after certain characters that don't need space
                // - Not at the start
                // But DO add space after '}' or ',' when followed by a selector (to match official Svelte behavior)
                // Skip over comments when looking for next meaningful character
                let last_char = result.chars().last();
                let next_nonws = {
                    let mut j = i + 1;
                    loop {
                        // Skip whitespace
                        while j < chars.len() && chars[j].is_whitespace() {
                            j += 1;
                        }
                        // Skip comments
                        if j + 1 < chars.len() && chars[j] == '/' && chars[j + 1] == '*' {
                            j += 2;
                            while j + 1 < chars.len() && !(chars[j] == '*' && chars[j + 1] == '/') {
                                j += 1;
                            }
                            if j + 1 < chars.len() {
                                j += 2; // skip */
                            }
                            continue;
                        }
                        break;
                    }
                    if j < chars.len() {
                        Some(&chars[j])
                    } else {
                        None
                    }
                };
                let keep_space = matches!(
                    (last_char, next_nonws),
                    (Some('}'), Some('.'))
                        | (Some('}'), Some('#'))
                        | (Some(','), Some('.'))
                        | (Some(','), Some('#'))
                );
                if keep_space
                    || !matches!(
                        last_char,
                        Some('{') | Some('}') | Some(';') | Some(':') | Some(',') | None
                    )
                {
                    result.push(' ');
                }
                last_was_space = true;
            }
            i += 1;
            continue;
        }

        // Remove space before certain characters (but preserve space before '{')
        if matches!(c, '}' | ':' | ';' | ',') {
            // Remove trailing space before these characters
            if result.ends_with(' ') {
                result.pop();
            }
        }

        result.push(c);
        last_was_space = false;
        i += 1;
    }

    // Trim trailing whitespace
    while result.ends_with(' ') || result.ends_with('\n') || result.ends_with('\t') {
        result.pop();
    }

    result
}

/// Collect all keyframe names defined in the stylesheet
fn collect_keyframe_names(children: &[Value]) -> FxHashSet<String> {
    let mut keyframes = FxHashSet::default();
    for child in children {
        collect_keyframe_names_from_node(child, &mut keyframes, false);
    }
    keyframes
}

/// Recursively collect keyframe names from a node.
/// Skips keyframes defined inside :global{} blocks since they are global and not scoped.
fn collect_keyframe_names_from_node(
    node: &Value,
    keyframes: &mut FxHashSet<String>,
    in_global_block: bool,
) {
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
                // Don't collect keyframes that start with -global- or are inside :global{} blocks
                if !keyframe_name.starts_with("-global-") && !in_global_block {
                    keyframes.insert(keyframe_name.to_string());
                }
            }
            if let Some(block) = node.get("block")
                && let Some(children) = block.get("children").and_then(|c| c.as_array())
            {
                for child in children {
                    collect_keyframe_names_from_node(child, keyframes, in_global_block);
                }
            }
        }
        Some("Rule") => {
            // Check if this rule is a :global {} block
            let is_global = is_global_block(node);
            let child_in_global = in_global_block || is_global;

            if let Some(block) = node.get("block")
                && let Some(children) = block.get("children").and_then(|c| c.as_array())
            {
                for child in children {
                    collect_keyframe_names_from_node(child, keyframes, child_in_global);
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
fn transform_css<'a>(
    children: &'a [Value],
    selector: &str,
    hash: &str,
    css_source: &str,
    css_start: usize,
    ctx: &CssContext<'a>,
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
fn transform_node_preserving<'a>(
    node: &'a Value,
    selector: &str,
    hash: &str,
    css_source: &str,
    css_start: usize,
    output: &mut String,
    specificity_bumped: &mut bool,
    last_end: &mut usize,
    ctx: &CssContext<'a>,
    parent_has_local_selectors: bool,
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
                parent_has_local_selectors,
                false, // not in a global block
                false, // not in a bare global block
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

/// Check if a rule is empty (no declarations, and any nested rules are either unused or empty).
/// This follows the official Svelte implementation's is_empty() function.
fn is_rule_empty<'a>(rule: &'a Value, ctx: &CssContext<'a>, is_in_global_block: bool) -> bool {
    let block = match rule.get("block") {
        Some(b) => b,
        None => return true,
    };

    let children = match block.get("children").and_then(|c| c.as_array()) {
        Some(c) => c,
        None => return true,
    };

    // Check if this rule contains :global (without arguments), which creates a global block context
    let this_is_global_block = is_in_global_block || selector_contains_global_block(rule);

    for child in children {
        let child_type = child.get("type").and_then(|t| t.as_str()).unwrap_or("");

        match child_type {
            "Declaration" => return false, // Has a declaration, not empty
            "Rule" => {
                // Push the PARENT rule's prelude for NestingSelector resolution
                // so that check_selector_unused on the child rule can resolve & correctly.
                // The parent rule is the current `rule` parameter.
                let rule_prelude = rule.get("prelude");
                if let Some(rp) = rule_prelude {
                    ctx.parent_preludes.borrow_mut().push(rp);
                }

                // Check if the nested rule is used
                let is_used = if let Some(prelude) = child.get("prelude") {
                    check_selector_unused(prelude, ctx) == UnusedStatus::Used
                } else {
                    true
                };

                // If it's used (or we're in a global block) AND not empty, then parent is not empty
                let is_empty = is_rule_empty(child, ctx, this_is_global_block);

                // Pop the parent rule's prelude
                if rule_prelude.is_some() {
                    ctx.parent_preludes.borrow_mut().pop();
                }

                if (is_used || this_is_global_block) && !is_empty {
                    return false;
                }
            }
            "Atrule" => {
                // At-rules with blocks that have children are not empty
                if let Some(atrule_block) = child.get("block") {
                    if atrule_block
                        .get("children")
                        .and_then(|c| c.as_array())
                        .is_some_and(|atrule_children| !atrule_children.is_empty())
                    {
                        return false;
                    }
                } else {
                    // At-rule without block (like @import) is not empty
                    return false;
                }
            }
            _ => {}
        }
    }

    true
}

/// Check if a block has any actual declarations (not just comments)
#[allow(dead_code)]
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

/// Check if a rule's selector contains `:global` without arguments anywhere
/// This handles cases like `p :global { ... }` where :global is not the first selector
fn selector_contains_global_block(node: &Value) -> bool {
    if let Some(prelude) = node.get("prelude")
        && let Some(children) = prelude.get("children").and_then(|c| c.as_array())
    {
        for complex in children {
            if let Some(relative_selectors) = complex.get("children").and_then(|c| c.as_array()) {
                for rel in relative_selectors {
                    if let Some(selectors) = rel.get("selectors").and_then(|s| s.as_array()) {
                        for sel in selectors {
                            if sel.get("type").and_then(|t| t.as_str())
                                == Some("PseudoClassSelector")
                                && sel.get("name").and_then(|n| n.as_str()) == Some("global")
                                && sel.get("args").is_none()
                            {
                                return true;
                            }
                        }
                    }
                }
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

/// Check if a rule has local selectors (i.e., selectors that need scoping)
/// A rule has local selectors if any of its complex selectors is NOT entirely global/global-like
fn rule_has_local_selectors(node: &Value) -> bool {
    if let Some(prelude) = node.get("prelude")
        && let Some(children) = prelude.get("children").and_then(|c| c.as_array())
    {
        for complex in children {
            if !is_complex_selector_global_like(complex) {
                return true;
            }
        }
    }
    false
}

/// Check if a complex selector is entirely global or global-like
/// This means all its relative selectors are either :global() or global-like (:root, :host, etc.)
fn is_complex_selector_global_like(complex: &Value) -> bool {
    if let Some(relative_selectors) = complex.get("children").and_then(|c| c.as_array()) {
        for rel in relative_selectors {
            if !is_relative_selector_global_like(rel) {
                return false;
            }
        }
        true
    } else {
        true // Empty selector list is considered global-like
    }
}

/// Check if a relative selector is global or global-like
fn is_relative_selector_global_like(rel: &Value) -> bool {
    if let Some(selectors) = rel.get("selectors").and_then(|s| s.as_array()) {
        if selectors.is_empty() {
            return true;
        }

        // Check if the first selector is :global
        let first = &selectors[0];
        let first_type = first.get("type").and_then(|t| t.as_str()).unwrap_or("");
        let first_name = first.get("name").and_then(|n| n.as_str()).unwrap_or("");

        // :global() is global
        if first_type == "PseudoClassSelector" && first_name == "global" {
            return true;
        }

        // :host is global-like
        if first_type == "PseudoClassSelector" && first_name == "host" {
            return true;
        }

        // Check for :root (without :has)
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

        // Check if all selectors are pseudo and first is view-transition*
        let all_pseudo = selectors.iter().all(|s| {
            let sel_type = s.get("type").and_then(|t| t.as_str()).unwrap_or("");
            sel_type == "PseudoClassSelector" || sel_type == "PseudoElementSelector"
        });
        if all_pseudo && first_type == "PseudoElementSelector" {
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

        false
    } else {
        true
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
        if is_descendant_selector_unused(rel_selectors, ctx) {
            return true;
        }

        // :has() unused detection - check if :has() arguments can match within the subject element's subtree
        // This is guarded inside is_has_selector_unused by has_opaque_sibling_boundaries check
        if is_has_selector_unused(rel_selectors, ctx) {
            return true;
        }

        // NestingSelector (&) compound check: When a relative selector contains & combined
        // with other simple selectors (e.g., &.b inside .a {}), the compound meaning is that
        // the element must satisfy BOTH the parent rule's constraints AND the current ones.
        // For example, &.b inside .a {} means .a.b - an element with both classes.
        if is_nesting_compound_unused(rel_selectors, ctx) {
            return true;
        }

        // Pure nesting selector check: When a selector consists entirely of NestingSelectors
        // with descendant combinators (e.g., `& &` or `& & &`), the resolved selector
        // requires the parent chain to appear multiple times in the ancestor chain.
        // For example, `& &` inside `.c` inside `& .b` inside `.a` resolves to
        // `.a .b .c .a .b .c` - which requires a nested `.a .b .c` structure.
        if is_pure_nesting_selector_unused(rel_selectors, ctx) {
            return true;
        }

        // Original simple check: if any simple selector refers to something that doesn't exist
        // Track whether we've seen a bare :global - all selectors after it are global-like
        let mut after_bare_global = false;
        for rel in rel_selectors {
            // Check each simple selector in this relative selector
            if let Some(selectors) = rel.get("selectors").and_then(|s| s.as_array()) {
                // Check if this relative selector starts with bare :global (no args)
                let starts_with_bare_global = selectors.first().is_some_and(|s| {
                    s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                        && s.get("name").and_then(|n| n.as_str()) == Some("global")
                        && s.get("args").is_none()
                });

                // If starts with bare :global, mark all subsequent selectors as global
                // and skip this selector entirely (including modifiers like :global.x)
                if starts_with_bare_global {
                    after_bare_global = true;
                    continue;
                }

                // Skip selectors that come after a bare :global - they're global-like
                if after_bare_global {
                    continue;
                }

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

                // Skip relative selectors containing :root (they're global-like)
                // :root.foo, .foo:root, :root.unknown should all be kept
                // unless :root is combined with :has (which needs to check inner selectors)
                let has_root = selectors.iter().any(|s| {
                    s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                        && s.get("name").and_then(|n| n.as_str()) == Some("root")
                });
                let has_has = selectors.iter().any(|s| {
                    s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                        && s.get("name").and_then(|n| n.as_str()) == Some("has")
                });

                if has_root && !has_has {
                    continue;
                }

                // Skip relative selectors that are entirely :global() (but still check others)
                // This handles :global(.foo) - with args
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
/// Check if a nested rule's selector with NestingSelector (&) compound is unused.
///
/// When a relative selector contains NestingSelector (&) combined with other simple selectors
/// (e.g., `&.b`), the compound meaning is that the element must satisfy BOTH the parent rule's
/// constraints AND the current ones. For example, `&.b` inside `.a {}` means `.a.b` - an element
/// with both classes `.a` and `.b`.
///
/// This function checks if the parent_preludes in the context, combined with the non-nesting
/// selectors, can match any DOM element.
fn is_nesting_compound_unused(rel_selectors: &[Value], ctx: &CssContext) -> bool {
    // Only applies when we have parent preludes (i.e., we're inside a nested rule)
    let parent_preludes = ctx.parent_preludes.borrow();
    if parent_preludes.is_empty() {
        return false;
    }

    // Look for relative selectors that contain NestingSelector combined with other selectors
    for rel in rel_selectors {
        if let Some(selectors) = rel.get("selectors").and_then(|s| s.as_array()) {
            let has_nesting = selectors
                .iter()
                .any(|s| s.get("type").and_then(|t| t.as_str()) == Some("NestingSelector"));

            if !has_nesting || selectors.len() < 2 {
                // No NestingSelector, or NestingSelector alone (no compound)
                continue;
            }

            // Collect class requirements from non-nesting selectors in this compound
            let mut required_classes: Vec<String> = Vec::new();
            let mut required_ids: Vec<String> = Vec::new();
            let mut required_elements: Vec<String> = Vec::new();

            for sel in selectors {
                let sel_type = sel.get("type").and_then(|t| t.as_str());
                match sel_type {
                    Some("ClassSelector") => {
                        if let Some(name) = sel.get("name").and_then(|n| n.as_str()) {
                            required_classes.push(decode_css_escape(name));
                        }
                    }
                    Some("IdSelector") => {
                        if let Some(name) = sel.get("name").and_then(|n| n.as_str()) {
                            required_ids.push(decode_css_escape(name));
                        }
                    }
                    Some("TypeSelector") => {
                        if let Some(name) = sel.get("name").and_then(|n| n.as_str())
                            && name != "*"
                        {
                            required_elements.push(decode_css_escape(name));
                        }
                    }
                    _ => {}
                }
            }

            // If we have no concrete requirements beyond &, can't determine unused
            if required_classes.is_empty()
                && required_ids.is_empty()
                && required_elements.is_empty()
            {
                continue;
            }

            // Collect class/id/element requirements from the IMMEDIATE parent prelude only.
            // The NestingSelector (&) refers to the immediate parent rule's selector.
            // The subject element of the parent rule is what the & expands to, and the
            // compound selector requires that SAME element to also match the current constraints.
            // We only check the immediate parent because constraints from higher-up ancestors
            // apply to different elements in the DOM chain, not the same element.
            let mut parent_classes: Vec<String> = Vec::new();
            let mut parent_ids: Vec<String> = Vec::new();
            let mut parent_elements: Vec<String> = Vec::new();

            if let Some(immediate_parent) = parent_preludes.last() {
                extract_selector_constraints(
                    immediate_parent,
                    &mut parent_classes,
                    &mut parent_ids,
                    &mut parent_elements,
                );
            }

            // Combined: the element must satisfy both parent constraints and current constraints
            let all_required_classes: Vec<&str> = parent_classes
                .iter()
                .chain(required_classes.iter())
                .map(|s| s.as_str())
                .collect();
            let all_required_ids: Vec<&str> = parent_ids
                .iter()
                .chain(required_ids.iter())
                .map(|s| s.as_str())
                .collect();
            let all_required_elements: Vec<&str> = parent_elements
                .iter()
                .chain(required_elements.iter())
                .map(|s| s.as_str())
                .collect();

            // If dynamic classes exist, we can't be sure about class constraints
            if ctx.has_dynamic_classes && !all_required_classes.is_empty() {
                continue;
            }

            // If dynamic elements exist, we can't be sure about element constraints
            if ctx.has_dynamic_elements && !all_required_elements.is_empty() {
                continue;
            }

            // Check if any DOM element satisfies ALL the combined constraints
            let any_element_matches = ctx.dom_structure.elements.iter().any(|elem| {
                // Check all required classes are present on the element
                let classes_match = all_required_classes
                    .iter()
                    .all(|c| elem.classes.contains(*c));

                // Check all required ids match
                let ids_match = all_required_ids
                    .iter()
                    .all(|id| elem.id.as_deref() == Some(*id));

                // Check all required element types match
                let elements_match = all_required_elements.iter().all(|tag| {
                    if elem.is_dynamic_tag {
                        true // Dynamic tag could be anything
                    } else {
                        elem.tag_name.eq_ignore_ascii_case(tag)
                    }
                });

                classes_match && ids_match && elements_match
            });

            if !any_element_matches {
                return true;
            }
        }
    }

    false
}

/// Check if a "pure nesting" selector (all relative selectors are NestingSelectors
/// with descendant combinators, like `& &`) is unused.
///
/// When `& &` appears inside a nesting context, it resolves to the full parent chain
/// repeated with a descendant combinator. For example, `& &` inside `.c` inside `& .b`
/// inside `.a` resolves to `.a .b .c .a .b .c`. This requires the parent chain to appear
/// as both the subject and an ancestor, which is often impossible in the actual DOM.
///
/// This function checks whether any DOM element matching the parent chain's subject
/// has ancestors that also match the full parent chain.
fn is_pure_nesting_selector_unused(rel_selectors: &[Value], ctx: &CssContext) -> bool {
    let parent_preludes = ctx.parent_preludes.borrow();
    if parent_preludes.is_empty() {
        return false;
    }

    // Check if this is a "pure nesting" selector: all relative selectors contain
    // only NestingSelector, with descendant combinators between them
    if rel_selectors.len() < 2 {
        return false;
    }

    let all_nesting = rel_selectors.iter().all(|rel| {
        if let Some(selectors) = rel.get("selectors").and_then(|s| s.as_array()) {
            selectors.len() == 1
                && selectors.first().is_some_and(|s| {
                    s.get("type").and_then(|t| t.as_str()) == Some("NestingSelector")
                })
        } else {
            false
        }
    });

    if !all_nesting {
        return false;
    }

    // All combinators must be descendant (space) combinators
    let all_descendant = rel_selectors.iter().skip(1).all(|rel| {
        let comb = rel.get("combinator");
        match comb {
            None => true, // No combinator = implicit descendant
            Some(c) => c.get("name").and_then(|n| n.as_str()).unwrap_or(" ") == " ",
        }
    });

    if !all_descendant {
        return false;
    }

    // Collect the full parent chain constraints: walk all parent preludes to build
    // the chain of class/id/element requirements at each level
    // For `.a { & .b { .c { & & {} } } }`, the chain is: [.a, .b, .c]
    // The `& &` means we need .a .b .c .a .b .c in the DOM

    // Collect subject constraints from each parent prelude level
    let mut chain_classes: Vec<Vec<String>> = Vec::new();

    for pp in parent_preludes.iter() {
        let mut classes = Vec::new();
        let mut ids = Vec::new();
        let mut elements = Vec::new();
        extract_selector_constraints(pp, &mut classes, &mut ids, &mut elements);
        chain_classes.push(classes);
    }

    // For the `& &` pattern, we need the full chain to appear twice in the DOM.
    // Check if any DOM element matching the deepest parent's constraints has an
    // ancestor chain that can accommodate the full chain repeated.

    // Simple heuristic: collect ALL unique class requirements from the chain
    // and check if there's a DOM element whose ancestor chain includes all
    // these classes at the required nesting depth.
    // For simplicity, check if the total chain depth * (number of & selectors)
    // exceeds the maximum DOM depth of matching elements.
    let chain_depth = parent_preludes.len();
    let nesting_count = rel_selectors.len(); // number of & selectors

    // Total required depth: chain_depth * nesting_count
    // (each & expands to the full parent chain)
    let required_depth = chain_depth * nesting_count;

    // Find the maximum depth any matching element can have
    // An element's depth is the number of ancestors it has
    for elem in &ctx.dom_structure.elements {
        // Check if this element could be the subject (matches the deepest constraint)
        let empty_vec = Vec::new();
        let deepest_classes = chain_classes.last().unwrap_or(&empty_vec);
        let matches_deepest = deepest_classes.is_empty()
            || deepest_classes
                .iter()
                .all(|c| elem.classes.contains(c.as_str()));

        if !matches_deepest {
            continue;
        }

        // Count ancestors
        let mut depth = 0;
        let mut current_idx = elem.parent_idx;
        while let Some(idx) = current_idx {
            if idx < ctx.dom_structure.elements.len() {
                depth += 1;
                current_idx = ctx.dom_structure.elements[idx].parent_idx;
            } else {
                break;
            }
        }

        // If the element's depth (plus 1 for the element itself) is enough
        // to accommodate the required chain, it's potentially used
        if depth + 1 >= required_depth {
            return false;
        }
    }

    // No element has enough depth to accommodate the repeated nesting chain
    true
}

/// Extract class, id, and element constraints from a CSS prelude (selector list).
/// This extracts the simple selector requirements from the LAST relative selector
/// of each complex selector in the prelude (the "subject" of the selector).
fn extract_selector_constraints(
    prelude: &Value,
    classes: &mut Vec<String>,
    ids: &mut Vec<String>,
    elements: &mut Vec<String>,
) {
    if let Some(children) = prelude.get("children").and_then(|c| c.as_array()) {
        for complex in children {
            if let Some(rel_selectors) = complex.get("children").and_then(|c| c.as_array()) {
                // The last relative selector is the "subject" - the element the rule applies to
                // For `.a .b .c`, the subject is `.c`
                // For a simple selector like `.a`, the subject is `.a`
                if let Some(last_rel) = rel_selectors.last()
                    && let Some(selectors) = last_rel.get("selectors").and_then(|s| s.as_array())
                {
                    for sel in selectors {
                        let sel_type = sel.get("type").and_then(|t| t.as_str());
                        match sel_type {
                            Some("ClassSelector") => {
                                if let Some(name) = sel.get("name").and_then(|n| n.as_str()) {
                                    classes.push(decode_css_escape(name));
                                }
                            }
                            Some("IdSelector") => {
                                if let Some(name) = sel.get("name").and_then(|n| n.as_str()) {
                                    ids.push(decode_css_escape(name));
                                }
                            }
                            Some("TypeSelector") => {
                                if let Some(name) = sel.get("name").and_then(|n| n.as_str())
                                    && name != "*"
                                {
                                    elements.push(decode_css_escape(name));
                                }
                            }
                            _ => {}
                        }
                    }
                }
            }
        }
    }
}

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

    // For :global(X) + Y patterns, check if Y exists in the template
    if first_is_global && rel_selectors.len() == 2 {
        let second = &rel_selectors[1];
        let combinator = second
            .get("combinator")
            .and_then(|c| c.get("name"))
            .and_then(|n| n.as_str())
            .unwrap_or(" ");

        if combinator == "+" || combinator == "~" {
            let second_info = extract_selector_info(second);

            // If it's a universal selector, it matches anything
            if second_info.is_universal {
                return false;
            }

            // When there are opaque boundaries (slots, components, render tags),
            // :global(X) could be from any slot/component. Check if Y matches
            // an element that is adjacent to (for +) or following (for ~) an opaque boundary.
            if ctx.has_opaque_sibling_boundaries {
                let matches = ctx.dom_structure.elements.iter().any(|el| {
                    if !selector_matches_element(&second_info, el) {
                        return false;
                    }
                    if combinator == "+" {
                        // For + combinator, Y must be immediately after an opaque boundary
                        el.prev_is_opaque_boundary
                    } else {
                        // For ~ combinator, Y must be somewhere after an opaque boundary
                        el.prev_has_opaque_boundary
                    }
                });
                return !matches;
            }

            // Without opaque boundaries, check if Y matches a root-level element
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

    // Handle single sibling combinator pair
    if sibling_pairs.len() == 1 {
        let (sibling_idx, combinator) = sibling_pairs[0];

        // Get the selector before the sibling combinator
        let before = &rel_selectors[sibling_idx - 1];
        // Get the selector after the sibling combinator
        let after = &rel_selectors[sibling_idx];

        // Extract selector info for before and after
        let before_info = extract_selector_info(before);
        let after_info = extract_selector_info(after);

        // If we have a parent context (e.g., .foo > A + B) and no control flow,
        // use the structural children_idx approach. When control flow is present,
        // children_idx may not include elements inside {#if}/{#each} blocks,
        // so we fall through to the Phase 2 sibling relationship data instead.
        if !ctx.has_control_flow && sibling_idx >= 2 {
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

        // Use the sibling relationship data from Phase 2 control flow analysis.
        // Check BACKWARD from 'after' elements, matching the official compiler's approach.
        // The official compiler's prune() checks each element with direction=BACKWARD,
        // so we check: does any element matching 'after' have 'before' as a prev sibling?

        // Find all elements that match 'after' selector
        let mut found_after_element = false;
        let mut any_after_has_incomplete_siblings = false;
        for el in ctx.dom_structure.elements.iter() {
            if selector_matches_element(&after_info, el) {
                found_after_element = true;
                // Check possible previous siblings based on combinator type
                let possible_siblings = if combinator == "+" {
                    &el.possible_prev_adjacent
                } else {
                    // ~ combinator
                    &el.possible_prev_general
                };

                // Check if any possible previous sibling matches 'before' selector
                for (sibling_idx, _certainty) in possible_siblings {
                    if let Some(sibling) = ctx.dom_structure.elements.get(*sibling_idx)
                        && selector_matches_element(&before_info, sibling)
                    {
                        return false; // Found a match, not unused
                    }
                }

                // If this element has empty sibling lists AND there are opaque boundaries,
                // Phase 2 may not have complete sibling data for this element
                // (e.g., it's inside a snippet that breaks sibling walking)
                if ctx.has_opaque_sibling_boundaries
                    && el.possible_prev_adjacent.is_empty()
                    && el.possible_prev_general.is_empty()
                    && el.possible_next_adjacent.is_empty()
                    && el.possible_next_general.is_empty()
                {
                    any_after_has_incomplete_siblings = true;
                }
            }
        }

        // If no elements match 'after', check 'before' direction too
        if !found_after_element {
            // Also check forward: do any 'before' elements have 'after' as next sibling?
            let mut found_before_element = false;
            for el in ctx.dom_structure.elements.iter() {
                if selector_matches_element(&before_info, el) {
                    found_before_element = true;
                    let possible_siblings = if combinator == "+" {
                        &el.possible_next_adjacent
                    } else {
                        &el.possible_next_general
                    };
                    for (sibling_idx, _certainty) in possible_siblings {
                        if let Some(sibling) = ctx.dom_structure.elements.get(*sibling_idx)
                            && selector_matches_element(&after_info, sibling)
                        {
                            return false; // Found a match
                        }
                    }
                    // Check for incomplete siblings
                    if ctx.has_opaque_sibling_boundaries
                        && el.possible_prev_adjacent.is_empty()
                        && el.possible_prev_general.is_empty()
                        && el.possible_next_adjacent.is_empty()
                        && el.possible_next_general.is_empty()
                    {
                        any_after_has_incomplete_siblings = true;
                    }
                }
            }
            if !found_before_element {
                // Neither element exists in template at all - can't be siblings
                // But be conservative with opaque boundaries
                if ctx.has_opaque_sibling_boundaries {
                    return false;
                }
                return true;
            }
        }

        // No matching sibling relationship found from Phase 2 data
        // If there are opaque boundaries and some elements have incomplete sibling data,
        // be conservative (the elements might be siblings across opaque content)
        if ctx.has_opaque_sibling_boundaries && any_after_has_incomplete_siblings {
            return false;
        }

        return true;
    }

    // If there are opaque sibling boundaries (slots, snippets, render tags),
    // be conservative with multi-sibling chains - the Phase 2 data may be incomplete.
    if ctx.has_opaque_sibling_boundaries {
        return false;
    }

    // For complex cases with multiple sibling combinators (e.g., .g + .h + .i + .j),
    // check each consecutive sibling pair. If ANY pair is impossible, the whole chain is unused.
    // Walk through pairs: for N relative selectors with sibling combinators between them,
    // check if each adjacent pair (A + B, B + C, C + D, ...) has valid sibling relationships.
    for pair in sibling_pairs.windows(2) {
        let (_idx_a, _comb_a) = pair[0];
        let (idx_b, comb_b) = pair[1];

        // Check the pair: the "before" element for this pair is the selector at idx_b - 1,
        // and the "after" element is at idx_b
        let before = &rel_selectors[idx_b - 1];
        let after = &rel_selectors[idx_b];
        let before_info = extract_selector_info(before);
        let after_info = extract_selector_info(after);

        // Check if any element matching 'after' has 'before' as a possible previous sibling
        let mut found_match = false;
        for el in ctx.dom_structure.elements.iter() {
            if selector_matches_element(&after_info, el) {
                let possible_siblings = if comb_b == "+" {
                    &el.possible_prev_adjacent
                } else {
                    &el.possible_prev_general
                };
                for (sibling_idx, _certainty) in possible_siblings {
                    if let Some(sibling) = ctx.dom_structure.elements.get(*sibling_idx)
                        && selector_matches_element(&before_info, sibling)
                    {
                        found_match = true;
                        break;
                    }
                }
                if found_match {
                    break;
                }
            }
        }

        if !found_match {
            return true; // This pair is impossible, so the whole chain is unused
        }
    }

    // Also check the first pair in the chain
    if !sibling_pairs.is_empty() {
        let (first_idx, first_comb) = sibling_pairs[0];
        let before = &rel_selectors[first_idx - 1];
        let after = &rel_selectors[first_idx];
        let before_info = extract_selector_info(before);
        let after_info = extract_selector_info(after);

        let mut found_match = false;
        for el in ctx.dom_structure.elements.iter() {
            if selector_matches_element(&after_info, el) {
                let possible_siblings = if first_comb == "+" {
                    &el.possible_prev_adjacent
                } else {
                    &el.possible_prev_general
                };
                for (sibling_idx, _certainty) in possible_siblings {
                    if let Some(sibling) = ctx.dom_structure.elements.get(*sibling_idx)
                        && selector_matches_element(&before_info, sibling)
                    {
                        found_match = true;
                        break;
                    }
                }
                if found_match {
                    break;
                }
            }
        }

        if !found_match {
            return true;
        }
    }

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

    // Check tag name (dynamic tags match any type selector)
    if let Some(ref tag) = info.tag_name
        && !el.is_dynamic_tag
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
    // If the child is just a pseudo-class like :not(.foo), it implicitly matches any element
    let child_tag = get_type_selector_name(&rel_selectors[1]);

    // Check if the second selector is a pure pseudo-class (like :not())
    // that matches any element type
    let is_universal_pseudo = if child_tag.is_none() {
        // Check if it's a :not() pseudo-class without a type selector
        is_universal_pseudo_selector(&rel_selectors[1])
    } else {
        false
    };

    // If no child type and not a universal pseudo, we can't determine usage
    if child_tag.is_none() && !is_universal_pseudo {
        return false;
    }

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
        let parent_el = &ctx.dom_structure.elements[*parent_idx];

        // If the parent has opaque content (render tags, slots, components),
        // it could have any element as a descendant at runtime - be conservative
        if parent_el.has_opaque_content {
            return false;
        }

        // Also check ancestors: if any ancestor has opaque content,
        // the parent itself could receive unknown descendants via render tags
        if has_opaque_ancestor(ctx, *parent_idx) {
            return false;
        }

        if is_universal_pseudo {
            // Universal pseudo (like :not()) matches any element
            // Check if parent has any children at all
            if combinator == ">" {
                // Child combinator: only direct children
                if has_any_direct_child(ctx, *parent_idx) {
                    return false; // Found a potential match
                }
            } else {
                // Descendant combinator: any descendant
                if has_any_descendant(ctx, *parent_idx) {
                    return false; // Found a potential match
                }
            }
        } else if let Some(ref child_tag) = child_tag {
            // Universal selector (*) matches any element
            let is_universal = child_tag == "*";

            if is_universal {
                // * matches any element
                if combinator == ">" {
                    if has_any_direct_child(ctx, *parent_idx) {
                        return false;
                    }
                } else if has_any_descendant(ctx, *parent_idx) {
                    return false;
                }
            } else if combinator == ">" {
                // Child combinator: only direct children
                if has_direct_child_with_tag(ctx, *parent_idx, child_tag) {
                    return false; // Found a valid parent > child relationship
                }
            } else {
                // Descendant combinator: any descendant
                if has_descendant_with_tag(ctx, *parent_idx, child_tag) {
                    return false; // Found a valid parent child relationship
                }
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

    // Special handling for <selectedcontent>: also check <option> descendants in parent <select>
    if element.tag_name == "selectedcontent" {
        for option_idx in find_option_elements_for_selectedcontent(ctx, parent_idx) {
            if has_direct_child_with_tag(ctx, option_idx, tag_name) {
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

    // Special handling for <selectedcontent>: also check <option> descendants in parent <select>
    if element.tag_name == "selectedcontent" {
        for option_idx in find_option_elements_for_selectedcontent(ctx, parent_idx) {
            if has_descendant_with_tag(ctx, option_idx, tag_name) {
                return true;
            }
        }
    }

    false
}

/// Check if an element has any direct children (elements, not text nodes)
fn has_any_direct_child(ctx: &CssContext, parent_idx: usize) -> bool {
    let element = &ctx.dom_structure.elements[parent_idx];
    if !element.children_idx.is_empty() {
        return true;
    }

    // Special handling for <selectedcontent>
    if element.tag_name == "selectedcontent" {
        for option_idx in find_option_elements_for_selectedcontent(ctx, parent_idx) {
            if has_any_direct_child(ctx, option_idx) {
                return true;
            }
        }
    }

    false
}

/// Check if an element has any descendants (elements, not text nodes)
fn has_any_descendant(ctx: &CssContext, parent_idx: usize) -> bool {
    let element = &ctx.dom_structure.elements[parent_idx];

    for &child_idx in &element.children_idx {
        if child_idx < ctx.dom_structure.elements.len() {
            return true;
        }
    }

    // Special handling for <selectedcontent>
    if element.tag_name == "selectedcontent" {
        for option_idx in find_option_elements_for_selectedcontent(ctx, parent_idx) {
            if has_any_descendant(ctx, option_idx) {
                return true;
            }
        }
    }

    false
}

/// Check if any ancestor of the given element has opaque content
/// (render tags, slots, components that can inject unknown children)
fn has_opaque_ancestor(ctx: &CssContext, element_idx: usize) -> bool {
    let mut current = element_idx;
    while let Some(parent) = ctx.dom_structure.elements[current].parent_idx {
        if ctx.dom_structure.elements[parent].has_opaque_content {
            return true;
        }
        current = parent;
    }
    false
}

/// For a <selectedcontent> element, find <option> elements in the ancestor <select>.
/// <selectedcontent> clones the content of the selected <option>, so descendants of
/// <option> elements should also be considered as potential descendants.
fn find_option_elements_for_selectedcontent(ctx: &CssContext, sc_idx: usize) -> Vec<usize> {
    let mut options = Vec::new();

    // Walk up to find the ancestor <select>
    let mut current = sc_idx;
    let mut select_idx = None;
    while let Some(parent) = ctx.dom_structure.elements[current].parent_idx {
        if ctx.dom_structure.elements[parent].tag_name == "select" {
            select_idx = Some(parent);
            break;
        }
        current = parent;
    }

    if let Some(select_idx) = select_idx {
        // Find all <option> descendants of <select>
        collect_option_descendants(ctx, select_idx, &mut options);
    }

    options
}

/// Recursively collect <option> element indices from descendants
fn collect_option_descendants(ctx: &CssContext, parent_idx: usize, options: &mut Vec<usize>) {
    let element = &ctx.dom_structure.elements[parent_idx];
    for &child_idx in &element.children_idx {
        if child_idx < ctx.dom_structure.elements.len() {
            let child = &ctx.dom_structure.elements[child_idx];
            if child.tag_name == "option" {
                options.push(child_idx);
            }
            collect_option_descendants(ctx, child_idx, options);
        }
    }
}

/// Check if a relative selector is a universal pseudo-class (like :not())
/// that implicitly matches any element type
fn is_universal_pseudo_selector(rel_selector: &Value) -> bool {
    if let Some(selectors) = rel_selector.get("selectors").and_then(|s| s.as_array()) {
        // Must have at least one selector
        if selectors.is_empty() {
            return false;
        }

        // Check if all selectors are pseudo-classes/elements (no type selector)
        let all_pseudo = selectors.iter().all(|s| {
            let sel_type = s.get("type").and_then(|t| t.as_str()).unwrap_or("");
            sel_type == "PseudoClassSelector" || sel_type == "PseudoElementSelector"
        });

        if all_pseudo {
            // Check if the first is :not, :is, :where (which match any element)
            let first = &selectors[0];
            if first.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector") {
                let name = first.get("name").and_then(|n| n.as_str()).unwrap_or("");
                return matches!(name, "not" | "is" | "where" | "has");
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

/// Check if a selector with :has() is unused by checking if the :has() argument
/// can match within the subject element's subtree.
/// For example, `x:has(> z)` is unused if no `x` element has a direct child `z`.
#[allow(dead_code)]
fn is_has_selector_unused(rel_selectors: &[Value], ctx: &CssContext) -> bool {
    if ctx.dom_structure.elements.is_empty() {
        return false;
    }

    // Note: We no longer bail out entirely for opaque boundaries.
    // Instead, individual checks below handle opaque boundaries appropriately.
    // For descendant/child :has() arguments with opaque boundaries, we're conservative.
    // For sibling :has() arguments, we use Phase 2 sibling data when available.

    // Find relative selectors that contain :has()
    for rel in rel_selectors.iter() {
        if let Some(selectors) = rel.get("selectors").and_then(|s| s.as_array()) {
            for sel in selectors {
                if sel.get("type").and_then(|t| t.as_str()) != Some("PseudoClassSelector") {
                    continue;
                }
                if sel.get("name").and_then(|n| n.as_str()) != Some("has") {
                    continue;
                }
                let Some(args) = sel.get("args") else {
                    continue;
                };
                let Some(has_children) = args.get("children").and_then(|c| c.as_array()) else {
                    continue;
                };

                // If any :has() argument contains a NestingSelector (&), we can't resolve it
                // through the DOM structure since & refers to the parent CSS rule, not an HTML element.
                // Be conservative and treat such selectors as potentially used.
                let has_nesting_in_args = has_children.iter().any(|complex| {
                    if let Some(rels) = complex.get("children").and_then(|c| c.as_array()) {
                        rels.iter().any(|rel| {
                            if let Some(sels) = rel.get("selectors").and_then(|s| s.as_array()) {
                                sels.iter().any(|s| {
                                    s.get("type").and_then(|t| t.as_str())
                                        == Some("NestingSelector")
                                })
                            } else {
                                false
                            }
                        })
                    } else {
                        false
                    }
                });
                if has_nesting_in_args {
                    continue; // Can't determine unused status, skip
                }

                // Get the subject element info (selectors in this relative selector EXCLUDING :has)
                let subject_info = extract_selector_info_from_selectors(selectors);

                // Check if the subject is :root or :global(.foo) (no tag/class/id from DOM elements)
                let subject_is_root = selectors.iter().any(|s| {
                    s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                        && s.get("name").and_then(|n| n.as_str()) == Some("root")
                });
                let subject_is_global = selectors.iter().any(|s| {
                    s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                        && s.get("name").and_then(|n| n.as_str()) == Some("global")
                        && s.get("args").is_some()
                });

                // For :root:has() or :global(.foo):has(), the subject is the document root
                // or an external element. Check if :has() arguments exist anywhere
                // in the template using simple element existence checks.
                if subject_is_root || subject_is_global {
                    let all_has_args_unused = has_children
                        .iter()
                        .all(|has_complex| is_has_argument_unused_globally(has_complex, ctx));
                    if all_has_args_unused && !has_children.is_empty() {
                        return true;
                    }
                    continue;
                }

                let subject_elements: Vec<usize> = ctx
                    .dom_structure
                    .elements
                    .iter()
                    .enumerate()
                    .filter(|(_, el)| {
                        // If no subject info (e.g., just :has()), match all elements
                        if subject_info.tag_name.is_none()
                            && subject_info.classes.is_empty()
                            && subject_info.id.is_none()
                            && !subject_info.is_universal
                        {
                            return false;
                        }
                        selector_matches_element(&subject_info, el)
                    })
                    .map(|(i, _)| i)
                    .collect();

                if subject_elements.is_empty()
                    && (subject_info.tag_name.is_some()
                        || !subject_info.classes.is_empty()
                        || subject_info.id.is_some())
                {
                    // Subject element doesn't exist at all - already handled by other checks
                    continue;
                }

                // When subject is empty (just pseudo-classes like standalone :has()),
                // use global check since any element could be the subject
                if subject_elements.is_empty()
                    && subject_info.tag_name.is_none()
                    && subject_info.classes.is_empty()
                    && subject_info.id.is_none()
                    && !subject_info.is_universal
                {
                    let all_has_args_unused = has_children
                        .iter()
                        .all(|has_complex| is_has_argument_unused_globally(has_complex, ctx));
                    if all_has_args_unused && !has_children.is_empty() {
                        return true;
                    }
                    continue;
                }

                // Check if ANY :has() argument can match within any subject element's subtree
                let all_has_args_unused = has_children
                    .iter()
                    .all(|has_complex| is_has_argument_unused(has_complex, &subject_elements, ctx));

                if all_has_args_unused && !has_children.is_empty() {
                    return true;
                }
            }
        }
    }

    false
}

/// Check if a :has() argument is unused when the subject is :root or :global
/// (i.e., the entire template is the scope).
/// For descendant/child :has() arguments, check if the element exists anywhere.
/// For sibling :has() arguments, check if sibling relationships exist.
fn is_has_argument_unused_globally(has_complex: &Value, ctx: &CssContext) -> bool {
    let Some(rel_selectors) = has_complex.get("children").and_then(|c| c.as_array()) else {
        return false;
    };

    if rel_selectors.is_empty() {
        return false;
    }

    // If any relative selector contains a NestingSelector (&), we can't resolve it
    // through the DOM structure. Be conservative and treat as potentially used.
    for rel in rel_selectors {
        if let Some(sels) = rel.get("selectors").and_then(|s| s.as_array())
            && sels
                .iter()
                .any(|s| s.get("type").and_then(|t| t.as_str()) == Some("NestingSelector"))
        {
            return false;
        }
    }

    let first = &rel_selectors[0];
    let combinator = first
        .get("combinator")
        .and_then(|c| c.get("name"))
        .and_then(|n| n.as_str())
        .unwrap_or(" ");

    let first_info = extract_selector_info(first);

    // Handle :global() arguments - always potentially used
    if let Some(selectors) = first.get("selectors").and_then(|s| s.as_array()) {
        let is_global = selectors.first().is_some_and(|s| {
            s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                && s.get("name").and_then(|n| n.as_str()) == Some("global")
        });
        if is_global {
            return false;
        }
    }

    // For descendant/child selectors from :root/:global context,
    // the element just needs to exist anywhere in the template
    match combinator {
        " " | ">" => {
            // Check if any element in the template matches
            let matches = ctx
                .dom_structure
                .elements
                .iter()
                .any(|el| selector_matches_element(&first_info, el));
            if !matches {
                return true;
            }
            // If there are more parts, we'd need to check them too,
            // but for simple single-selector :has(), this is enough
            false
        }
        "+" | "~" => {
            // For sibling selectors from :root/:global context,
            // check if any root-level element has matching siblings
            for el in ctx.dom_structure.elements.iter() {
                if !el.is_root_child {
                    continue;
                }
                let possible_siblings = if combinator == "+" {
                    &el.possible_next_adjacent
                } else {
                    &el.possible_next_general
                };
                for (sibling_idx, _) in possible_siblings {
                    if let Some(sibling) = ctx.dom_structure.elements.get(*sibling_idx)
                        && selector_matches_element(&first_info, sibling)
                    {
                        return false; // Found a match
                    }
                }
            }
            true
        }
        _ => false,
    }
}

/// Check if a :has() argument is unused relative to the subject elements.
/// Returns true if the argument cannot match within any subject element's context.
#[allow(dead_code)]
fn is_has_argument_unused(
    has_complex: &Value,
    subject_elements: &[usize],
    ctx: &CssContext,
) -> bool {
    let Some(rel_selectors) = has_complex.get("children").and_then(|c| c.as_array()) else {
        return false;
    };

    if rel_selectors.is_empty() {
        return false;
    }

    // Get the first relative selector and its combinator
    let first = &rel_selectors[0];
    let combinator = first
        .get("combinator")
        .and_then(|c| c.get("name"))
        .and_then(|n| n.as_str())
        .unwrap_or(" "); // default is descendant

    let first_info = extract_selector_info(first);

    // For simple single-selector :has() arguments (like :has(> z) or :has(+ c))
    // we can check against the DOM structure

    // Handle :global() arguments - these are always considered used
    if let Some(selectors) = first.get("selectors").and_then(|s| s.as_array()) {
        let is_global = selectors.first().is_some_and(|s| {
            s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                && s.get("name").and_then(|n| n.as_str()) == Some("global")
        });
        if is_global {
            return false; // :global() is always potentially used
        }
    }

    // If there are multiple relative selectors (like > h > i), handle that too
    if rel_selectors.len() > 1 {
        // For multi-part :has() like :has(> h > i), check the first part,
        // then recursively check remaining parts within matched elements
        return is_multi_part_has_unused(rel_selectors, subject_elements, ctx);
    }

    match combinator {
        ">" => {
            // :has(> z) - check if any subject element has a direct child matching z
            // With opaque boundaries, render tags/slots could inject children, so be conservative
            if ctx.has_opaque_sibling_boundaries {
                return false;
            }
            for &subject_idx in subject_elements {
                let subject = &ctx.dom_structure.elements[subject_idx];
                for &child_idx in &subject.children_idx {
                    if let Some(child) = ctx.dom_structure.elements.get(child_idx)
                        && selector_matches_element(&first_info, child)
                    {
                        return false; // Found a match
                    }
                }
            }
            true // No match found
        }
        "+" => {
            // :has(+ c) - CSS spec: x:has(+ c) matches x if x has a following adjacent sibling c
            // This checks siblings of x, not descendants, so opaque content inside x doesn't matter
            for &subject_idx in subject_elements {
                let subject = &ctx.dom_structure.elements[subject_idx];
                for &(sibling_idx, _) in &subject.possible_next_adjacent {
                    if let Some(sibling) = ctx.dom_structure.elements.get(sibling_idx)
                        && selector_matches_element(&first_info, sibling)
                    {
                        return false; // Found a match
                    }
                }
                // If opaque boundaries exist and this element has incomplete sibling data,
                // be conservative - elements from render tags/slots could be siblings
                if ctx.has_opaque_sibling_boundaries
                    && subject.possible_next_adjacent.is_empty()
                    && subject.possible_next_general.is_empty()
                    && subject.possible_prev_adjacent.is_empty()
                    && subject.possible_prev_general.is_empty()
                {
                    return false; // Conservative: sibling data may be incomplete
                }
            }
            true // No match found
        }
        "~" => {
            // :has(~ c) - check if any subject element has a following general sibling matching c
            for &subject_idx in subject_elements {
                let subject = &ctx.dom_structure.elements[subject_idx];
                for &(sibling_idx, _) in &subject.possible_next_general {
                    if let Some(sibling) = ctx.dom_structure.elements.get(sibling_idx)
                        && selector_matches_element(&first_info, sibling)
                    {
                        return false; // Found a match
                    }
                }
                // If opaque boundaries exist and this element has incomplete sibling data,
                // be conservative
                if ctx.has_opaque_sibling_boundaries
                    && subject.possible_next_adjacent.is_empty()
                    && subject.possible_next_general.is_empty()
                    && subject.possible_prev_adjacent.is_empty()
                    && subject.possible_prev_general.is_empty()
                {
                    return false; // Conservative: sibling data may be incomplete
                }
            }
            true // No match found
        }
        " " => {
            // :has(z) - descendant selector, check if any subject has z in subtree
            // With opaque boundaries, render tags/slots could inject descendants, so be conservative
            if ctx.has_opaque_sibling_boundaries {
                return false;
            }
            for &subject_idx in subject_elements {
                if has_matching_descendant(subject_idx, &first_info, ctx) {
                    return false; // Found a match
                }
            }
            true // No match found
        }
        _ => false, // Unknown combinator, be conservative
    }
}

/// Check if a multi-part :has() argument (like > h > i) is unused
#[allow(dead_code)]
fn is_multi_part_has_unused(
    rel_selectors: &[Value],
    subject_elements: &[usize],
    ctx: &CssContext,
) -> bool {
    if rel_selectors.is_empty() {
        return false;
    }

    let first = &rel_selectors[0];
    let combinator = first
        .get("combinator")
        .and_then(|c| c.get("name"))
        .and_then(|n| n.as_str())
        .unwrap_or(" ");

    let first_info = extract_selector_info(first);

    // Find elements that match the first part relative to the subject
    let mut matched_elements: Vec<usize> = Vec::new();

    match combinator {
        ">" => {
            // Direct child - opaque boundaries could inject children
            if ctx.has_opaque_sibling_boundaries {
                return false;
            }
            for &subject_idx in subject_elements {
                let subject = &ctx.dom_structure.elements[subject_idx];
                for &child_idx in &subject.children_idx {
                    if let Some(child) = ctx.dom_structure.elements.get(child_idx)
                        && selector_matches_element(&first_info, child)
                    {
                        matched_elements.push(child_idx);
                    }
                }
            }
        }
        "+" => {
            // Adjacent sibling of subject
            for &subject_idx in subject_elements {
                let subject = &ctx.dom_structure.elements[subject_idx];
                for &(sibling_idx, _) in &subject.possible_next_adjacent {
                    if let Some(sibling) = ctx.dom_structure.elements.get(sibling_idx)
                        && selector_matches_element(&first_info, sibling)
                    {
                        matched_elements.push(sibling_idx);
                    }
                }
            }
        }
        " " => {
            // Descendant - opaque boundaries could inject descendants
            if ctx.has_opaque_sibling_boundaries {
                return false;
            }
            for &subject_idx in subject_elements {
                collect_matching_descendants(subject_idx, &first_info, ctx, &mut matched_elements);
            }
        }
        _ => return false, // Be conservative
    }

    if matched_elements.is_empty() {
        return true;
    }

    // Recursively check remaining selectors with matched elements as new subjects
    if rel_selectors.len() > 1 {
        return is_multi_part_has_unused(&rel_selectors[1..], &matched_elements, ctx);
    }

    false
}

#[allow(dead_code)]
/// Check if an element has a matching descendant
fn has_matching_descendant(parent_idx: usize, info: &SelectorInfo, ctx: &CssContext) -> bool {
    let parent = &ctx.dom_structure.elements[parent_idx];
    for &child_idx in &parent.children_idx {
        if let Some(child) = ctx.dom_structure.elements.get(child_idx) {
            if selector_matches_element(info, child) {
                return true;
            }
            if has_matching_descendant(child_idx, info, ctx) {
                return true;
            }
        }
    }

    // Special handling for <selectedcontent>: also check <option> descendants in parent <select>
    if parent.tag_name == "selectedcontent" {
        for option_idx in find_option_elements_for_selectedcontent(ctx, parent_idx) {
            if has_matching_descendant(option_idx, info, ctx) {
                return true;
            }
        }
    }

    false
}

#[allow(dead_code)]
/// Collect all matching descendants
fn collect_matching_descendants(
    parent_idx: usize,
    info: &SelectorInfo,
    ctx: &CssContext,
    results: &mut Vec<usize>,
) {
    let parent = &ctx.dom_structure.elements[parent_idx];
    for &child_idx in &parent.children_idx {
        if let Some(child) = ctx.dom_structure.elements.get(child_idx) {
            if selector_matches_element(info, child) {
                results.push(child_idx);
            }
            collect_matching_descendants(child_idx, info, ctx, results);
        }
    }
}

/// Extract SelectorInfo from a set of simple selectors (not the relative selector)
#[allow(dead_code)]
fn extract_selector_info_from_selectors(selectors: &[Value]) -> SelectorInfo {
    let mut info = SelectorInfo {
        tag_name: None,
        classes: Vec::new(),
        id: None,
        is_universal: false,
    };

    for sel in selectors {
        let sel_type = sel.get("type").and_then(|t| t.as_str()).unwrap_or("");
        match sel_type {
            "TypeSelector" => {
                if let Some(name) = sel.get("name").and_then(|n| n.as_str()) {
                    if name == "*" {
                        info.is_universal = true;
                    } else {
                        info.tag_name = Some(name.to_string());
                    }
                }
            }
            "ClassSelector" => {
                if let Some(name) = sel.get("name").and_then(|n| n.as_str()) {
                    info.classes.push(decode_css_escape(name));
                }
            }
            "IdSelector" => {
                if let Some(name) = sel.get("name").and_then(|n| n.as_str()) {
                    info.id = Some(decode_css_escape(name));
                }
            }
            // Skip pseudo-classes like :has(), :not(), etc.
            _ => {}
        }
    }

    info
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
        Some("PseudoElementSelector") => {
            // Pseudo elements need more complex analysis, consider them potentially used
            return false;
        }
        Some("AttributeSelector") => {
            if let Some(raw) = sel.get("name").and_then(|n| n.as_str()) {
                return is_attribute_selector_unused(raw, ctx);
            }
            return false;
        }
        _ => {}
    }
    false
}

/// Whitelisted attribute selectors that should never be pruned for certain elements.
/// These are attributes that can be toggled by the browser/runtime.
/// Corresponds to `whitelist_attribute_selector` in css-prune.js.
fn is_whitelisted_attribute(element_tag: &str, attr_name: &str) -> bool {
    match element_tag.to_lowercase().as_str() {
        "details" => attr_name.eq_ignore_ascii_case("open"),
        "dialog" => attr_name.eq_ignore_ascii_case("open"),
        _ => false,
    }
}

/// HTML attributes whose enumerated values are case-insensitive per the HTML spec.
/// Corresponds to `case_insensitive_attributes` in css-prune.js.
fn is_html_case_insensitive_attribute(attr_name: &str) -> bool {
    matches!(
        attr_name.to_lowercase().as_str(),
        "accept-charset"
            | "autocapitalize"
            | "autocomplete"
            | "behavior"
            | "charset"
            | "crossorigin"
            | "decoding"
            | "dir"
            | "direction"
            | "draggable"
            | "enctype"
            | "enterkeyhint"
            | "fetchpriority"
            | "formenctype"
            | "formmethod"
            | "formtarget"
            | "hidden"
            | "http-equiv"
            | "inputmode"
            | "kind"
            | "loading"
            | "method"
            | "preload"
            | "referrerpolicy"
            | "rel"
            | "rev"
            | "role"
            | "rules"
            | "scope"
            | "shape"
            | "spellcheck"
            | "target"
            | "translate"
            | "type"
            | "valign"
            | "wrap"
    )
}

/// Check if a CSS attribute selector is unused by checking elements' static attributes.
/// The `raw` parameter is the content between `[` and `]` (e.g., `alt=""`, `data-active='true'`).
/// Returns true only when we can definitively determine no element matches.
fn is_attribute_selector_unused(raw: &str, ctx: &CssContext) -> bool {
    // Parse the raw attribute selector into name, operator, and value
    let (attr_name, operator, expected_value, has_explicit_case_flag) =
        parse_attribute_selector(raw);

    if attr_name.is_empty() {
        return false; // Can't parse, assume used
    }

    // If there are dynamic elements, any attribute could match
    if ctx.has_dynamic_elements {
        return false;
    }

    // If there's no operator, it's just `[attr]` - check if any element has the attribute
    // If there IS an operator, check if any element's attribute value matches
    for element in &ctx.dom_structure.elements {
        // If element has spread attributes, it could have any attribute
        if element.has_spread {
            return false;
        }

        // If element has dynamic tag, it could be any element with any attributes
        if element.is_dynamic_tag {
            return false;
        }

        // Check whitelisted attributes (like details[open], dialog[open])
        // These can be toggled by the browser, so should always be considered used
        if is_whitelisted_attribute(&element.tag_name, &attr_name) {
            return false;
        }

        // Check if this attribute has a dynamic value (expression, bind directive, etc.)
        if element
            .dynamic_attribute_names
            .iter()
            .any(|n| n.eq_ignore_ascii_case(&attr_name))
        {
            return false; // Dynamic value - could be anything
        }

        // Check class directives for [class] selector
        if attr_name.eq_ignore_ascii_case("class") && element.has_class_directive {
            return false;
        }

        // Check style directives for [style] selector
        if attr_name.eq_ignore_ascii_case("style") && element.has_style_directive {
            return false;
        }

        // Check static attributes
        for (name, value) in &element.static_attributes {
            if name.eq_ignore_ascii_case(&attr_name) {
                if operator.is_empty() {
                    // Just `[attr]` - attribute exists, so it matches
                    return false;
                }

                // Determine case sensitivity:
                // - If the selector has explicit `i` or `s` flag, use that
                // - Otherwise, check if this is an HTML case-insensitive attribute
                let case_insensitive = if has_explicit_case_flag != 0 {
                    has_explicit_case_flag == 1 // 1 = case-insensitive, -1 = case-sensitive
                } else {
                    is_html_case_insensitive_attribute(&attr_name)
                };

                // Attribute exists, check value
                if let Some(attr_value) = value {
                    if let Some(ref expected) = expected_value {
                        if test_attribute_value(&operator, expected, attr_value, case_insensitive) {
                            return false; // Found a match
                        }
                    } else {
                        // No expected value but has operator - shouldn't happen, be safe
                        return false;
                    }
                } else if let Some(ref expected) = expected_value {
                    // Boolean attribute (no value) - with operator, treat value as ""
                    if test_attribute_value(&operator, expected, "", case_insensitive) {
                        return false;
                    }
                }
            }
        }
    }

    // No element matched - the attribute selector is unused
    // But only if we actually have DOM structure data
    !ctx.dom_structure.elements.is_empty()
}

/// Parse a CSS attribute selector raw content like `alt=""` or `data-active='true'` or `alt i`.
/// Returns (name, operator, value, explicit_case_flag).
/// explicit_case_flag: 1 = explicit case-insensitive (i flag), -1 = explicit case-sensitive (s flag), 0 = no flag
fn parse_attribute_selector(raw: &str) -> (String, String, Option<String>, i8) {
    let raw = raw.trim();

    // Check for case-insensitive flag at end (e.g., `attr="value" i`)
    let (raw, explicit_case_flag) = if raw.ends_with(" i") || raw.ends_with(" I") {
        (&raw[..raw.len() - 2], 1i8)
    } else if raw.ends_with(" s") || raw.ends_with(" S") {
        (&raw[..raw.len() - 2], -1i8)
    } else {
        (raw, 0i8)
    };

    // Find operator position
    let operators = ["~=", "|=", "^=", "$=", "*=", "="];
    for op in &operators {
        if let Some(pos) = raw.find(op) {
            let attr_name = raw[..pos].trim().to_string();
            let value_str = raw[pos + op.len()..].trim();
            let value = unquote_css_value(value_str);
            return (attr_name, op.to_string(), Some(value), explicit_case_flag);
        }
    }

    // No operator - just `[attr]`
    (
        raw.trim().to_string(),
        String::new(),
        None,
        explicit_case_flag,
    )
}

/// Remove quotes from a CSS attribute value.
fn unquote_css_value(s: &str) -> String {
    let s = s.trim();
    if (s.starts_with('"') && s.ends_with('"')) || (s.starts_with('\'') && s.ends_with('\'')) {
        s[1..s.len() - 1].to_string()
    } else {
        s.to_string()
    }
}

/// Test if an attribute value matches the expected value with the given operator.
fn test_attribute_value(
    operator: &str,
    expected: &str,
    actual: &str,
    case_insensitive: bool,
) -> bool {
    let (expected, actual) = if case_insensitive {
        (expected.to_lowercase(), actual.to_lowercase())
    } else {
        (expected.to_string(), actual.to_string())
    };

    match operator {
        "=" => actual == expected,
        "~=" => actual.split_whitespace().any(|w| w == expected),
        "|=" => actual == expected || actual.starts_with(&format!("{}-", expected)),
        "^=" => actual.starts_with(&expected),
        "$=" => actual.ends_with(&expected),
        "*=" => actual.contains(&expected),
        _ => true, // Unknown operator, assume match
    }
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
fn transform_rule_preserving<'a>(
    node: &'a Value,
    selector: &str,
    hash: &str,
    css_source: &str,
    css_start: usize,
    output: &mut String,
    specificity_bumped: &mut bool,
    last_end: &mut usize,
    ctx: &CssContext<'a>,
    parent_has_local_selectors: bool,
    is_in_global_block: bool,
    is_in_bare_global_block: bool,
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

    // Check if the rule is unused (selector doesn't match any template elements)
    // NOTE: Must check unused BEFORE empty, because an unused selector with nested
    // content (like @media rules) should be marked (unused) not (empty)
    // Skip unused check when inside a bare :global {} block (all selectors are global)
    if !is_in_bare_global_block && let Some(prelude) = node.get("prelude") {
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

    // Check if the rule is empty (no declarations, or all nested rules are unused/empty)
    if is_rule_empty(node, ctx, is_in_global_block) {
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
        // Transform selectors
        let transformed_selector = transform_selector_list(
            prelude,
            selector,
            hash,
            specificity_bumped,
            css_source,
            css_start,
            ctx,
            parent_has_local_selectors,
            is_in_global_block,
            is_in_bare_global_block,
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
                // Check if this rule contains :global - if so, nested rules are in a global block context.
                // This affects specificity bumping (uses direct class instead of :where()).
                let rule_starts_with_global = is_global_selector_rule(node);
                let rule_contains_global_block = selector_contains_global_block(node);
                let nested_in_global_block =
                    is_in_global_block || rule_starts_with_global || rule_contains_global_block;

                // Track bare :global blocks separately for unused detection.
                // Only bare :global {} (without arguments) bypasses unused detection for nested rules.
                // :global(.foo) {} with arguments still checks unused for nested selectors.
                let rule_is_bare_global = is_global_block(node);
                let nested_in_bare_global_block =
                    is_in_bare_global_block || rule_is_bare_global || rule_contains_global_block;

                // Check if this rule has local selectors for specificity bumping in nested rules
                // If the current rule has local selectors, or any parent had local selectors,
                // then nested rules should use :where() for specificity preservation
                let current_has_local = rule_has_local_selectors(node);
                let nested_parent_has_local = parent_has_local_selectors || current_has_local;

                // Push this rule's prelude for NestingSelector resolution in nested rules
                ctx.parent_preludes.borrow_mut().push(prelude);

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
                    nested_parent_has_local,
                    nested_in_bare_global_block,
                );

                // Pop the prelude after processing
                ctx.parent_preludes.borrow_mut().pop();
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
fn transform_block_with_nested_rules<'a>(
    block: &'a Value,
    selector: &str,
    hash: &str,
    css_source: &str,
    css_start: usize,
    output: &mut String,
    specificity_bumped: &mut bool,
    ctx: &CssContext<'a>,
    is_in_global_block: bool,
    parent_has_local_selectors: bool,
    is_in_bare_global_block: bool,
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
                            parent_has_local_selectors, // use :where() only if parent has local selectors
                            is_in_global_block,         // pass through global block context
                            is_in_bare_global_block,    // pass through bare global block context
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
fn transform_atrule_preserving<'a>(
    node: &'a Value,
    selector: &str,
    hash: &str,
    css_source: &str,
    css_start: usize,
    output: &mut String,
    specificity_bumped: &mut bool,
    last_end: &mut usize,
    ctx: &CssContext<'a>,
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

        // Copy block from source, preserving original whitespace between prelude and block
        if let Some(block) = node.get("block") {
            let block_start = block.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as usize;
            let block_end = block.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as usize;

            // Check if there was whitespace between prelude and block in original source
            let blk_s = block_start.saturating_sub(css_start);
            if blk_s > 0 && blk_s <= css_source.len() {
                let byte_before = css_source.as_bytes().get(blk_s.saturating_sub(1));
                if byte_before.is_some_and(|&b| b == b' ' || b == b'\t' || b == b'\n') {
                    output.push(' ');
                }
            }

            let blk_start_off = blk_s;
            let blk_end_off = block_end.saturating_sub(css_start);
            if blk_end_off <= css_source.len() && blk_start_off < blk_end_off {
                output.push_str(&css_source[blk_start_off..blk_end_off]);
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
    parent_has_local_selectors: bool,
    is_in_global_block: bool,
    is_in_bare_global_block: bool,
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
        // Track the end position of the last processed selector for source preservation
        let mut last_selector_end: Option<usize> = None;

        for complex_selector in children.iter() {
            let sel_start = complex_selector
                .get("start")
                .and_then(|s| s.as_u64())
                .unwrap_or(0) as usize;
            let sel_end = complex_selector
                .get("end")
                .and_then(|e| e.as_u64())
                .unwrap_or(0) as usize;

            // Check if this individual selector is unused
            // Skip unused check when inside a bare :global {} block
            let is_unused =
                !is_in_bare_global_block && is_complex_selector_unused(complex_selector, ctx);

            if !is_unused {
                all_unused = false;
            }

            if is_unused {
                // Buffer unused selector, stripping bare :global modifiers
                let selector_text =
                    strip_bare_global_from_text(complex_selector, css_source, css_start);
                if !unused_buffer.is_empty() {
                    unused_buffer.push_str(", ");
                }
                unused_buffer.push_str(&selector_text);
            } else {
                // This selector is used
                // First, flush any buffered unused selectors
                if !unused_buffer.is_empty() {
                    if has_output {
                        // Between used selectors: <used> /* (unused) <selectors>*/, <next used>
                        result.push_str(" /* (unused) ");
                        result.push_str(&unused_buffer);
                        result.push_str("*/");
                        result.push_str(separator);
                    } else {
                        // Before first used selector: /* (unused) <selectors>,*/ <used>
                        result.push_str("/* (unused) ");
                        result.push_str(&unused_buffer);
                        result.push_str(",*/ ");
                    }
                    unused_buffer.clear();
                }
                // Output separator if not first (only when no unused prefix was flushed)
                else if has_output {
                    // Preserve the original text between selectors (including comments)
                    if let Some(prev_end) = last_selector_end {
                        let between_start = prev_end.saturating_sub(css_start);
                        let between_end = sel_start.saturating_sub(css_start);
                        if between_end <= css_source.len() && between_start < between_end {
                            let between = &css_source[between_start..between_end];
                            // The between text should contain a comma - preserve it with comments
                            result.push_str(between);
                        } else {
                            result.push_str(separator);
                        }
                    } else {
                        result.push_str(separator);
                    }
                }
                // Output the transformed selector
                result.push_str(&transform_complex_selector(
                    complex_selector,
                    selector,
                    specificity_bumped,
                    css_source,
                    css_start,
                    parent_has_local_selectors,
                    is_in_global_block,
                    is_in_bare_global_block,
                    Some(ctx),
                ));
                has_output = true;
                last_selector_end = Some(sel_end);
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

        // Preserve any trailing content after the last selector but within the prelude
        // (e.g., comments after the last selector like `.bar /* comment */ {`)
        if let Some(last_end) = last_selector_end {
            let trailing_start = last_end.saturating_sub(css_start);
            let trailing_end = prelude_end.saturating_sub(css_start);
            if trailing_end <= css_source.len() && trailing_start < trailing_end {
                let trailing = &css_source[trailing_start..trailing_end];
                // Only append if there's meaningful content (comments), not just whitespace
                if trailing.contains("/*") {
                    result.push_str(trailing);
                }
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
    parent_has_local_selectors: bool,
    is_in_global_block: bool,
    is_in_bare_global_block: bool,
    ctx: Option<&CssContext>,
) -> String {
    // If inside a bare :global {} block, output selectors without any scoping
    if is_in_bare_global_block {
        return get_complex_selector_text(node, css_source, css_start);
    }

    let mut result = String::new();
    // Each complex selector resets specificity bumping - first element gets direct class
    // For nested rules, start with bumped=true to use :where() for specificity preservation
    // EXCEPT when we're inside a :global() block - then start fresh (bumped=false)
    // Also, if parent rule doesn't have local selectors (like :root), don't bump
    let mut local_specificity_bumped = parent_has_local_selectors && !is_in_global_block;
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

        // Track if the next relative selector should be treated as global
        // (after a bare :global modifier)
        let mut next_is_global = false;

        for relative_selector in children {
            // Check if this relative selector starts with bare :global (no args)
            let starts_with_bare_global = relative_selector
                .get("selectors")
                .and_then(|s| s.as_array())
                .and_then(|arr| arr.first())
                .is_some_and(|s| {
                    s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                        && s.get("name").and_then(|n| n.as_str()) == Some("global")
                        && s.get("args").is_none()
                });

            let selectors_count = relative_selector
                .get("selectors")
                .and_then(|s| s.as_array())
                .map(|a| a.len())
                .unwrap_or(0);

            // Bare :global with no other selectors - skip entirely and mark next as global
            let is_bare_global_only = starts_with_bare_global && selectors_count == 1;

            // Bare :global with modifiers (e.g., :global.x, :global:is(...)) -
            // remove :global, eat space combinator, output the rest without scoping
            let is_global_modifier = starts_with_bare_global && selectors_count > 1;

            if is_bare_global_only {
                // Skip this selector entirely - mark that next selector is global
                next_is_global = true;
                continue;
            }

            // Handle :global modifier pattern: :global.x, :global:is(...)
            // These eat the space combinator and output modifiers without scoping
            if is_global_modifier {
                // Check if this is in a nested context (no combinator and first selector)
                let combinator_name = relative_selector
                    .get("combinator")
                    .and_then(|c| c.get("name"))
                    .and_then(|n| n.as_str());

                // In nested context (:global.x with no combinator), prepend &
                // This handles: div { :global.x { ... } } -> div { &.x { ... } }
                if combinator_name.is_none() && result.is_empty() {
                    result.push('&');
                }
                // Don't output the space combinator - the modifiers attach directly
                // to the previous selector (e.g., "div :global.x" -> "div.x")
                if let Some(selectors) = relative_selector
                    .get("selectors")
                    .and_then(|s| s.as_array())
                {
                    for sel in selectors {
                        // Skip the :global pseudo-class itself
                        if sel.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                            && sel.get("name").and_then(|n| n.as_str()) == Some("global")
                            && sel.get("args").is_none()
                        {
                            continue;
                        }
                        // Output the modifier without scoping (it's global)
                        result.push_str(&format_simple_selector_with_scope(
                            sel,
                            "", // empty = no scoping
                            css_source,
                            Some(css_start),
                            0,
                            ctx,
                            false,
                            false,
                        ));
                    }
                }
                // After a :global modifier, don't bump specificity
                _previous_was_scoped = false;
                next_is_global = false;
                continue;
            }

            // If this selector follows a bare :global, output it without scoping
            if next_is_global {
                // Output combinator - always output space even when result is empty,
                // because the space replaces where :global was removed
                if let Some(combinator) = relative_selector.get("combinator")
                    && let Some(name) = combinator.get("name").and_then(|n| n.as_str())
                {
                    if name == " " {
                        result.push(' ');
                    } else {
                        result.push_str(&format!(" {} ", name));
                    }
                }
                // Output selectors without scoping
                if let Some(selectors) = relative_selector
                    .get("selectors")
                    .and_then(|s| s.as_array())
                {
                    for sel in selectors {
                        result.push_str(&format_simple_selector_with_scope(
                            sel,
                            "", // empty = no scoping
                            css_source,
                            Some(css_start),
                            0,
                            ctx,
                            false,
                            false,
                        ));
                    }
                }
                _previous_was_scoped = false;
                next_is_global = false;
                continue;
            }

            next_is_global = false;

            // Get combinator
            if let Some(combinator) = relative_selector.get("combinator")
                && let Some(name) = combinator.get("name").and_then(|n| n.as_str())
                && (name != " " || !result.is_empty())
            {
                if name == " " {
                    result.push(' ');
                } else if result.is_empty() {
                    // First combinator at start (e.g., "> nav" as a nested selector)
                    // Don't add leading space
                    result.push_str(&format!("{} ", name));
                } else {
                    result.push_str(&format!(" {} ", name));
                }
                // After any combinator, subsequent selectors should use :where() for specificity preservation
                // UNLESS the previous selector was global-like (like :host) or a :global() selector,
                // in which case the first real scoped selector should get the direct class
                if !previous_was_global_like && !seen_global {
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
                                local_specificity_bumped,
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

                    // Check if this contains a NestingSelector - if so, skip scoping
                    // (the & inherits scoping from parent rule)
                    let has_nesting = selectors
                        .iter()
                        .any(|s| s.get("type").and_then(|t| t.as_str()) == Some("NestingSelector"));

                    // Find the last non-pseudo, non-global, non-nesting selector for scoping
                    let mut last_non_pseudo_idx = None;
                    for (idx, sel) in selectors.iter().enumerate() {
                        let sel_type = sel.get("type").and_then(|t| t.as_str()).unwrap_or("");
                        let is_global_pseudo = sel_type == "PseudoClassSelector"
                            && sel.get("name").and_then(|n| n.as_str()) == Some("global");
                        if sel_type != "PseudoElementSelector"
                            && sel_type != "PseudoClassSelector"
                            && sel_type != "NestingSelector"
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
                                local_specificity_bumped,
                            ));

                            // Add scoping after the last non-pseudo selector
                            // Skip if has nesting selector - it inherits scoping from parent
                            if needs_scoping && !has_nesting && Some(idx) == last_non_pseudo_idx {
                                let modifier = get_modifier(selector, &local_specificity_bumped);
                                append_modifier(&mut selector_parts, &modifier);
                                local_specificity_bumped = true;
                            }
                        }
                    }

                    result.push_str(&selector_parts);
                    // Mark that this selector was scoped (if scoping was applied)
                    _previous_was_scoped = needs_scoping && !has_nesting;
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
                    // Following the official Svelte implementation:
                    // - For :root and :host, do NOT add scoping (they are global-like)
                    // - For :is, the scoping is handled internally
                    // - For other pseudo-classes like :has, :not, :hover, etc., prepend the scoping class
                    // Also skip if we have a NestingSelector - it inherits scoping from parent
                    if needs_scoping && last_non_pseudo_idx.is_none() && !has_nesting_selector {
                        // Check if first selector is one that should not have scoping added before it
                        let first_is_global_like = selectors.first().is_some_and(|s| {
                            if s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                            {
                                let name = s.get("name").and_then(|n| n.as_str()).unwrap_or("");
                                // Only :root, :host should NOT have scoping added before them
                                // :is handles scoping internally via its arguments
                                name == "is" || name == "host" || name == "root"
                            } else {
                                false
                            }
                        });

                        if !first_is_global_like {
                            // After :global(), use direct class (not :where())
                            let should_use_where = local_specificity_bumped && !seen_global;
                            let modifier = get_modifier(selector, &should_use_where);
                            append_modifier(&mut selector_parts, &modifier);
                            local_specificity_bumped = true;
                            seen_global = false;
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
                                append_modifier(&mut selector_parts, &modifier);
                                local_specificity_bumped = true;
                            } else {
                                selector_parts.push('*');
                            }
                            continue;
                        }

                        // When a relative selector has a NestingSelector (&) and
                        // specificity hasn't been bumped yet, pseudo-class arguments
                        // like :has() should use direct class because the & inherits
                        // scoping from parent and doesn't add its own scope - so the
                        // :has() content is the first scoping point.
                        let effective_use_direct = has_global_anywhere
                            || (has_nesting_selector && !local_specificity_bumped);

                        selector_parts.push_str(&format_simple_selector_with_scope(
                            sel,
                            selector,
                            css_source,
                            Some(css_start),
                            0,
                            ctx,
                            effective_use_direct,
                            local_specificity_bumped,
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
                            append_modifier(&mut selector_parts, &modifier);
                            local_specificity_bumped = true;
                            // After using direct class following :global(), subsequent selectors should use :where()
                            seen_global = false;
                        }
                    }

                    result.push_str(&selector_parts);
                    // Mark that this selector was scoped (unless it's a nesting selector)
                    _previous_was_scoped = needs_scoping && !has_nesting_selector;
                    // When a nesting selector is inside a global block, subsequent selectors
                    // should use direct class (not :where()) because the & refers to a global parent
                    if has_nesting_selector && is_in_global_block {
                        previous_was_global_like = true;
                    }
                }
            }
        }
    }

    result
}

/// Check if a string ends with a CSS hex escape sequence that would require a space
/// separator before appending a class/id selector.
///
/// CSS escape sequences like `\31\32\33` (representing "123") consume up to 6 hex digits
/// after the backslash. If followed by another hex digit or a character that could be
/// confused as part of the escape (like `.` which starts a class), the browser may
/// misparse. The official Svelte compiler adds a space in this situation.
///
/// For example: `#\31\32\33` + `.svelte-hash` would be misread; it needs to be
/// `#\31\32\33 .svelte-hash`.
fn ends_with_css_hex_escape(text: &str) -> bool {
    // Walk FORWARD through the string, tracking escape sequences.
    // Return true if the string ends with hex digits that are part of a CSS escape
    // (i.e., \HH where HH are hex digits and the escape has consumed fewer than 6 digits
    // without a whitespace terminator).
    let chars: Vec<char> = text.chars().collect();
    let len = chars.len();
    if len < 2 {
        return false;
    }

    let mut i = 0;
    while i < len {
        if chars[i] == '\\' && i + 1 < len {
            i += 1; // skip backslash
            if chars[i].is_ascii_hexdigit() {
                // Hex escape: consume up to 6 hex digits
                let start = i;
                let mut hex_count = 0;
                while i < len && hex_count < 6 && chars[i].is_ascii_hexdigit() {
                    i += 1;
                    hex_count += 1;
                }
                // If we've reached the end of the string, the escape is unterminated
                if i == len {
                    return true;
                }
                // Consume optional single whitespace terminator
                if chars[i] == ' ' || chars[i] == '\t' || chars[i] == '\n' {
                    i += 1;
                }
                // Otherwise the escape is fully terminated, continue
                let _ = start; // suppress unused warning
            } else {
                // Single-char escape (e.g., \. or \@) - skip the escaped char
                i += 1;
            }
        } else {
            i += 1;
        }
    }
    false
}

/// Get the modifier for specificity bumping
fn get_modifier(selector: &str, specificity_bumped: &bool) -> String {
    if *specificity_bumped {
        format!(":where({})", selector)
    } else {
        selector.to_string()
    }
}

/// Append a CSS scope modifier to a selector string, adding a space separator
/// if needed to avoid CSS escape sequence ambiguity.
fn append_modifier(target: &mut String, modifier: &str) {
    // If the modifier starts with . or # (direct class/id, not :where()),
    // and the target ends with a CSS hex escape, we need a space separator.
    if !modifier.is_empty()
        && (modifier.starts_with('.') || modifier.starts_with('#'))
        && ends_with_css_hex_escape(target)
    {
        target.push(' ');
    }
    target.push_str(modifier);
}

/// Format a simple selector
fn format_simple_selector(sel: &Value) -> String {
    format_simple_selector_with_scope(sel, "", "", None, 0, None, false, false)
}

/// Format a simple selector with optional scoping for inner selectors
/// `use_direct_class` - When true, use direct class (e.g., .svelte-xyz) instead of :where() inside :is()/:not()/:has()
/// `outer_specificity_bumped` - When true, the outer selector has already been scoped (specificity bumped),
///   so inner :has()/:is()/:not() selectors should use :where() for scoping
#[allow(clippy::too_many_arguments)]
fn format_simple_selector_with_scope(
    sel: &Value,
    selector: &str,
    css_source: &str,
    css_start: Option<usize>,
    _depth: usize,
    ctx: Option<&CssContext>,
    use_direct_class: bool,
    outer_specificity_bumped: bool,
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
                    // Per the official Svelte compiler, inner selectors inherit the
                    // specificity state from the outer context. When the outer selector
                    // has already been scoped (specificity bumped), ALL inner selectors
                    // should use :where() for scoping.
                    let inner = transform_is_not_args(
                        args,
                        selector,
                        css_source,
                        name,
                        ctx,
                        use_direct_class,
                        outer_specificity_bumped,
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
/// When `outer_specificity_bumped` is true, the outer selector already has scoping applied,
/// so inner selectors should use :where() for scoping (overrides use_direct_class).
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
    outer_specificity_bumped: bool,
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
                    outer_specificity_bumped,
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
/// When `outer_specificity_bumped` is true, the outer selector already has scoping,
/// so inner selectors should use :where() (overrides use_direct_class).
fn transform_is_not_complex_selector(
    node: &Value,
    selector: &str,
    css_source: &str,
    pseudo_name: &str,
    ctx: Option<&CssContext>,
    use_direct_class: bool,
    outer_specificity_bumped: bool,
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

        // Per the official Svelte compiler, inner selectors inherit the specificity state
        // from the outer context. When the outer selector has already been scoped
        // (specificity bumped), ALL inner selectors should use :where() for scoping.
        // When not bumped, the first inner selector gets direct class.
        let mut inner_use_direct_class = if outer_specificity_bumped {
            false // outer already bumped, so inner always uses :where()
        } else {
            use_direct_class
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
                    // First combinator at start of :has() argument (e.g., :has(> y))
                    // Preserve original source whitespace between combinator and selector
                    if let Some(comb_end) = combinator.get("end").and_then(|e| e.as_u64()) {
                        let comb_end = comb_end as usize;
                        // Get the gap between combinator end and first selector start
                        if let Some(selectors) = relative_selector
                            .get("selectors")
                            .and_then(|s| s.as_array())
                        {
                            if let Some(first_sel) = selectors.first() {
                                if let Some(sel_start) =
                                    first_sel.get("start").and_then(|s| s.as_u64())
                                {
                                    let sel_start = sel_start as usize;
                                    result.push_str(name);
                                    // Add whitespace matching the original source
                                    if sel_start > comb_end {
                                        for _ in 0..(sel_start - comb_end) {
                                            result.push(' ');
                                        }
                                    }
                                } else {
                                    result.push_str(name);
                                }
                            } else {
                                result.push_str(name);
                            }
                        } else {
                            result.push_str(name);
                        }
                    } else {
                        result.push_str(name);
                    }
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

                // Check if any selector in this relative selector is a NestingSelector
                let has_nesting = selectors
                    .iter()
                    .any(|s| s.get("type").and_then(|t| t.as_str()) == Some("NestingSelector"));

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
                } else if has_nesting {
                    // NestingSelector (&) inherits scoping from the parent rule.
                    // Don't add any additional scoping - just output the selectors as-is.
                    for sel in selectors {
                        result.push_str(&format_simple_selector(sel));
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
                            if inner_use_direct_class {
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
                            inner_use_direct_class,
                            !inner_use_direct_class, // if inner_use_direct_class=false, specificity is already bumped
                        ));

                        // Add scoping after the last non-pseudo selector
                        // Use :where() to preserve specificity, unless inner_use_direct_class is true
                        if Some(idx) == last_non_pseudo_idx && !selector.is_empty() {
                            if inner_use_direct_class {
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
            // After the first scoped relative selector, switch to :where() for subsequent ones
            if should_scope {
                inner_use_direct_class = false;
            }
        }
    }

    result
}

/// Get raw selector text from a node
/// Get the original source text for a complex selector
/// Strip bare :global (no args) from a complex selector text for use in unused comments.
/// E.g., "unused :global" -> "unused", "div :global y" -> "div y"
fn strip_bare_global_from_text(
    complex_selector: &Value,
    css_source: &str,
    css_start: usize,
) -> String {
    // Get the raw text
    let raw = get_complex_selector_text(complex_selector, css_source, css_start);

    // Check if this complex selector has any bare :global relative selectors
    if let Some(children) = complex_selector.get("children").and_then(|c| c.as_array()) {
        let has_bare_global = children.iter().any(|rel| {
            rel.get("selectors")
                .and_then(|s| s.as_array())
                .is_some_and(|arr| {
                    arr.len() == 1
                        && arr.first().is_some_and(|s| {
                            s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                                && s.get("name").and_then(|n| n.as_str()) == Some("global")
                                && s.get("args").is_none()
                        })
                })
        });

        if has_bare_global {
            // Strip " :global" and ":global " patterns
            let mut result = raw.replace(" :global", "");
            result = result.replace(":global ", "");
            result = result.replace(":global", "");
            return result.trim().to_string();
        }
    }

    raw
}

fn get_complex_selector_text(node: &Value, css_source: &str, css_start: usize) -> String {
    let start = node.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as usize;
    let end = node.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as usize;
    let src_start = start.saturating_sub(css_start);
    let src_end = end.saturating_sub(css_start);
    if src_end <= css_source.len() && src_start < src_end {
        css_source[src_start..src_end].to_string()
    } else {
        get_selector_text(node)
    }
}

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
                has_opaque_sibling_boundaries: false,
                dom_structure: &dom_structure,
                parent_preludes: std::cell::RefCell::new(Vec::new()),
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
                has_opaque_sibling_boundaries: false,
                dom_structure: &dom_structure,
                parent_preludes: std::cell::RefCell::new(Vec::new()),
            };
            let output = transform_css(&children, selector, hash, &css_content, css_start, &ctx);
            println!("CSS Output:\n{}", output);
        }
    }
}
