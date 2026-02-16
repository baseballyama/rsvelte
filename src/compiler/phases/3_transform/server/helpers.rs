//! Helper functions for server-side code generation.
//!
//! This module contains standalone utility functions used by the server-side
//! visitor implementations. These were extracted from `transform_server.rs`
//! to keep the visitor files focused on their specific AST node handling.

use super::types::{ConstantFoldResult, OutputPart};
use crate::ast::template::{Attribute, AttributeValue, AttributeValuePart, Script, TemplateNode};
use crate::compiler::phases::phase2_analyze::types::strip_typescript;
use rustc_hash::FxHashMap;

/// Check if a property name is a valid JavaScript identifier.
/// If not, it needs to be quoted in object literals.
pub(crate) fn is_valid_js_identifier(name: &str) -> bool {
    if name.is_empty() {
        return false;
    }

    let mut chars = name.chars();

    // First character must be a letter, underscore, or dollar sign
    let first = chars.next().unwrap();
    if !first.is_alphabetic() && first != '_' && first != '$' {
        return false;
    }

    // Subsequent characters can also include digits
    for c in chars {
        if !c.is_alphanumeric() && c != '_' && c != '$' {
            return false;
        }
    }

    true
}

/// Strip TypeScript type annotations from snippet parameters.
///
/// Handles cases like:
/// - `n: number` -> `n`
/// - `n` -> `n` (no change)
/// - `{ a, b }: Props` -> `{ a, b }` (destructured with type annotation)
///
/// This is needed because snippet parameters in `.svelte` files with `lang="ts"`
/// may include TypeScript type annotations that must not appear in the generated JavaScript.
pub(crate) fn strip_ts_type_annotation(param: &str) -> String {
    let trimmed = param.trim();

    // Handle destructured parameters: { ... }: Type or [ ... ]: Type
    if trimmed.starts_with('{') || trimmed.starts_with('[') {
        let close_char = if trimmed.starts_with('{') { '}' } else { ']' };
        // Find the matching closing bracket
        let mut depth = 0;
        let mut close_pos = None;
        for (i, c) in trimmed.char_indices() {
            match c {
                '{' | '[' => depth += 1,
                '}' | ']' if c == close_char => {
                    depth -= 1;
                    if depth == 0 {
                        close_pos = Some(i);
                        break;
                    }
                }
                _ => {}
            }
        }
        if let Some(pos) = close_pos {
            // Return everything up to and including the closing bracket
            return trimmed[..=pos].to_string();
        }
    }

    // Handle simple identifier with type annotation: `name: Type`
    // Be careful not to strip object destructuring rename syntax
    if let Some(colon_pos) = trimmed.find(':') {
        let before = trimmed[..colon_pos].trim();
        // Only strip if the part before `:` is a valid identifier
        // (not a destructuring pattern)
        if is_valid_js_identifier(before) {
            return before.to_string();
        }
    }

    trimmed.to_string()
}

/// Check if a class attribute value needs to be wrapped in $.clsx().
///
/// Corresponds to the condition in Attribute.js for setting needs_clsx:
/// - The value is a single Expression (not a Sequence or True)
/// - The expression type is NOT Literal, TemplateLiteral, or BinaryExpression
///
/// This is needed for class={x} where x is a variable, array, or object,
/// because Svelte's clsx function normalizes these to proper class strings.
pub(crate) fn needs_clsx(attr_value: &AttributeValue) -> bool {
    // Helper to check if an expression type needs clsx
    let expr_needs_clsx = |expr_type: &str| -> bool {
        // Needs clsx if NOT a simple literal, template literal, or binary expression
        !matches!(
            expr_type,
            "Literal" | "TemplateLiteral" | "BinaryExpression"
        )
    };

    match attr_value {
        AttributeValue::Expression(expr_tag) => {
            // Get expression type
            let expr_type = expr_tag.expression.node_type().unwrap_or("");
            expr_needs_clsx(expr_type)
        }
        // Also check for Sequence with single ExpressionTag (for quoted expressions like class="{x}")
        AttributeValue::Sequence(parts) if parts.len() == 1 => {
            if let AttributeValuePart::ExpressionTag(expr_tag) = &parts[0] {
                let expr_type = expr_tag.expression.node_type().unwrap_or("");
                expr_needs_clsx(expr_type)
            } else {
                // Single text part doesn't need clsx
                false
            }
        }
        // Multiple parts (mixed text and expressions) or True don't need clsx
        _ => false,
    }
}

/// Quote a property name if needed for JavaScript object literal syntax.
/// Returns the name as-is if it's a valid identifier, or quoted if it contains special characters.
pub(crate) fn quote_prop_name(name: &str) -> String {
    if is_valid_js_identifier(name) {
        name.to_string()
    } else {
        format!("'{}'", name)
    }
}

/// Extract slot name from a template node's attributes.
///
/// If the node has a `slot="..."` attribute, returns that slot name.
/// Otherwise returns "default".
pub(crate) fn get_slot_name(node: &TemplateNode) -> String {
    // Helper to extract slot name from element attributes
    fn extract_slot_from_attributes(attrs: &[Attribute]) -> Option<String> {
        for attr in attrs {
            if let Attribute::Attribute(attr_node) = attr
                && attr_node.name.as_str() == "slot"
            {
                // Extract the slot name value
                match &attr_node.value {
                    AttributeValue::True(_) => {
                        // slot (boolean) - unlikely but handle it
                        return Some("default".to_string());
                    }
                    AttributeValue::Sequence(parts) => {
                        // slot="name" - text value
                        if let Some(AttributeValuePart::Text(text)) = parts.first() {
                            return Some(text.data.to_string());
                        }
                    }
                    AttributeValue::Expression(_) => {
                        // slot={expr} - dynamic slot names not supported, use default
                        return None;
                    }
                }
            }
        }
        None
    }

    match node {
        TemplateNode::RegularElement(elem) => {
            extract_slot_from_attributes(&elem.attributes).unwrap_or_else(|| "default".to_string())
        }
        TemplateNode::Component(comp) => {
            extract_slot_from_attributes(&comp.attributes).unwrap_or_else(|| "default".to_string())
        }
        TemplateNode::SvelteElement(elem) => {
            extract_slot_from_attributes(&elem.attributes).unwrap_or_else(|| "default".to_string())
        }
        TemplateNode::SvelteSelf(elem) => {
            extract_slot_from_attributes(&elem.attributes).unwrap_or_else(|| "default".to_string())
        }
        TemplateNode::SvelteComponent(elem) => {
            extract_slot_from_attributes(&elem.attributes).unwrap_or_else(|| "default".to_string())
        }
        TemplateNode::SvelteFragment(frag) => {
            extract_slot_from_attributes(&frag.attributes).unwrap_or_else(|| "default".to_string())
        }
        _ => "default".to_string(),
    }
}

/// Extract let directive names from a node's attributes.
/// Returns a list of let directive names (e.g., `let:thing` -> "thing").
pub(crate) fn get_let_directives(node: &TemplateNode) -> Vec<String> {
    fn extract_let_from_attributes(attrs: &[Attribute]) -> Vec<String> {
        attrs
            .iter()
            .filter_map(|attr| {
                if let Attribute::LetDirective(let_dir) = attr {
                    Some(let_dir.name.to_string())
                } else {
                    None
                }
            })
            .collect()
    }

    match node {
        TemplateNode::RegularElement(elem) => extract_let_from_attributes(&elem.attributes),
        TemplateNode::Component(comp) => extract_let_from_attributes(&comp.attributes),
        TemplateNode::SvelteElement(elem) => extract_let_from_attributes(&elem.attributes),
        TemplateNode::SvelteSelf(elem) => extract_let_from_attributes(&elem.attributes),
        TemplateNode::SvelteComponent(elem) => extract_let_from_attributes(&elem.attributes),
        TemplateNode::SvelteFragment(frag) => extract_let_from_attributes(&frag.attributes),
        _ => Vec::new(),
    }
}

/// Collapse whitespace sequences (including newlines) to single spaces.
/// This matches the behavior of clean_nodes in the official compiler.
pub(crate) fn collapse_whitespace(s: &str) -> String {
    let trimmed = s.trim();
    let has_leading_ws = s.chars().next().is_some_and(|c| c.is_whitespace());
    let has_trailing_ws = s.chars().last().is_some_and(|c| c.is_whitespace());

    // Collapse internal whitespace sequences to single spaces
    let mut result = String::new();
    let mut in_whitespace = false;

    if has_leading_ws {
        result.push(' ');
    }

    for c in trimmed.chars() {
        if c.is_whitespace() {
            if !in_whitespace {
                result.push(' ');
                in_whitespace = true;
            }
        } else {
            result.push(c);
            in_whitespace = false;
        }
    }

    // Remove trailing space that was added if content ended with whitespace
    if in_whitespace && !has_trailing_ws {
        result.pop();
    } else if has_trailing_ws && !result.ends_with(' ') {
        result.push(' ');
    }

    result
}

/// Trim leading and trailing whitespace from output parts.
/// This trims whitespace from the first and last Html parts if they exist.
pub(crate) fn trim_output_parts(parts: &mut Vec<OutputPart>) {
    // Trim leading whitespace from first Html part
    if let Some(OutputPart::Html(html)) = parts.first_mut() {
        *html = html.trim_start().to_string();
        if html.is_empty() {
            parts.remove(0);
        }
    }

    // Trim trailing whitespace from last Html part
    if let Some(OutputPart::Html(html)) = parts.last_mut() {
        *html = html.trim_end().to_string();
        if html.is_empty() {
            parts.pop();
        }
    }
}

/// Try to constant-fold a simple expression.
///
/// Returns:
/// - `Null` if the expression is `null` or `undefined`
/// - `Constant(value)` if the expression is a numeric or string literal
/// - `Dynamic` if the expression cannot be folded at compile time
pub(crate) fn try_constant_fold_full(expr: &str) -> ConstantFoldResult {
    let trimmed = expr.trim();

    if trimmed == "null" || trimmed == "undefined" {
        return ConstantFoldResult::Null;
    }

    if let Ok(n) = trimmed.parse::<i64>() {
        return ConstantFoldResult::Constant(n.to_string());
    }
    if let Ok(n) = trimmed.parse::<f64>() {
        // Don't fold NaN or Infinity - they're global variables, not constants
        if n.is_finite() {
            return ConstantFoldResult::Constant(n.to_string());
        }
    }

    if (trimmed.starts_with('\'') && trimmed.ends_with('\''))
        || (trimmed.starts_with('"') && trimmed.ends_with('"'))
    {
        let content = &trimmed[1..trimmed.len() - 1];
        return ConstantFoldResult::Constant(content.to_string());
    }

    if let Some(idx) = trimmed.find("??") {
        let left = trimmed[..idx].trim();
        let right = trimmed[idx + 2..].trim();

        match try_constant_fold_full(left) {
            ConstantFoldResult::Null => {
                return try_constant_fold_full(right);
            }
            ConstantFoldResult::Constant(val) => {
                return ConstantFoldResult::Constant(val);
            }
            ConstantFoldResult::Dynamic => {}
        }
    }

    if trimmed.starts_with("Math.")
        && let Some(result) = eval_math_expr(trimmed)
    {
        return ConstantFoldResult::Constant(result);
    }

    ConstantFoldResult::Dynamic
}

fn eval_math_expr(expr: &str) -> Option<String> {
    if expr.starts_with("Math.max(") && expr.ends_with(')') {
        let inner = &expr[9..expr.len() - 1];
        return eval_math_max_min(inner);
    }
    if expr.starts_with("Math.min(") && expr.ends_with(')') {
        let inner = &expr[9..expr.len() - 1];
        return eval_math_max_min_op(inner, false);
    }
    None
}

fn eval_math_max_min(args: &str) -> Option<String> {
    let parts = split_args(args);
    if parts.len() != 2 {
        return None;
    }

    let a = parse_numeric_expr(&parts[0])?;
    let b = parse_numeric_expr(&parts[1])?;

    Some(a.max(b).to_string())
}

fn eval_math_max_min_op(args: &str, is_max: bool) -> Option<String> {
    let parts = split_args(args);
    if parts.len() != 2 {
        return None;
    }

    let a = parse_numeric_expr(&parts[0])?;
    let b = parse_numeric_expr(&parts[1])?;

    let result = if is_max { a.max(b) } else { a.min(b) };
    Some(result.to_string())
}

fn split_args(s: &str) -> Vec<String> {
    let mut parts = Vec::new();
    let mut current = String::new();
    let mut depth = 0;

    for c in s.chars() {
        match c {
            '(' => {
                depth += 1;
                current.push(c);
            }
            ')' => {
                depth -= 1;
                current.push(c);
            }
            ',' if depth == 0 => {
                parts.push(current.trim().to_string());
                current = String::new();
            }
            _ => current.push(c),
        }
    }
    if !current.is_empty() {
        parts.push(current.trim().to_string());
    }
    parts
}

fn parse_numeric_expr(s: &str) -> Option<i64> {
    let trimmed = s.trim();

    if let Ok(n) = trimmed.parse::<i64>() {
        return Some(n);
    }

    if trimmed.starts_with("Math.min(") && trimmed.ends_with(')') {
        let inner = &trimmed[9..trimmed.len() - 1];
        let parts = split_args(inner);
        if parts.len() == 2 {
            let a = parse_numeric_expr(&parts[0])?;
            let b = parse_numeric_expr(&parts[1])?;
            return Some(a.min(b));
        }
    }
    if trimmed.starts_with("Math.max(") && trimmed.ends_with(')') {
        let inner = &trimmed[9..trimmed.len() - 1];
        let parts = split_args(inner);
        if parts.len() == 2 {
            let a = parse_numeric_expr(&parts[0])?;
            let b = parse_numeric_expr(&parts[1])?;
            return Some(a.max(b));
        }
    }

    None
}

// ============================================================================
// Functions extracted from transform_server.rs
// ============================================================================

/// Check if a Script node has `lang="ts"` or `lang="typescript"` attribute.
pub(crate) fn script_is_typescript(script: &Script) -> bool {
    script.attributes.iter().any(|attr| {
        if attr.name == "lang"
            && let crate::ast::template::AttributeValue::Sequence(parts) = &attr.value
            && let Some(crate::ast::template::AttributeValuePart::Text(text)) = parts.first()
        {
            return text.data == "ts" || text.data == "typescript";
        }
        false
    })
}

/// Strip TypeScript from raw script content if the script is TypeScript.
pub(crate) fn maybe_strip_typescript(raw_script: String, script: &Script) -> String {
    if script_is_typescript(script) && !raw_script.is_empty() {
        strip_typescript(&raw_script)
    } else {
        raw_script
    }
}

/// Sanitize a name to be a valid JavaScript identifier.
/// Replaces invalid identifier characters with underscores.
/// For example, "0" becomes "_", "1foo" becomes "_foo".
pub(crate) fn sanitize_identifier(name: &str) -> String {
    if name.is_empty() {
        return "_".to_string();
    }

    let mut result = String::new();
    let mut chars = name.chars().peekable();

    // First character must be a letter, underscore, or dollar sign
    if let Some(first) = chars.next() {
        if first.is_alphabetic() || first == '_' || first == '$' {
            result.push(first);
        } else {
            result.push('_');
        }
    }

    // Subsequent characters can also include digits
    for c in chars {
        if c.is_alphanumeric() || c == '_' || c == '$' {
            result.push(c);
        } else {
            result.push('_');
        }
    }

    result
}

/// Detect if script uses patterns that require $$renderer.component() wrapper with $$slots/$$events exclusion.
pub(crate) fn detect_props_spread_pattern(script: &str) -> bool {
    for line in script.lines() {
        let trimmed = line.trim();
        if (trimmed.starts_with("let ") || trimmed.starts_with("const "))
            && trimmed.contains("= $props()")
            && let Some(props_idx) = trimmed.find("= $props()")
        {
            let left = &trimmed[..props_idx].trim();
            let pattern = left
                .strip_prefix("let ")
                .or_else(|| left.strip_prefix("const "))
                .map(|s| s.trim())
                .unwrap_or(left);

            // Case 1: Simple identifier (let props = $props())
            if !pattern.contains('{') && !pattern.contains('[') {
                return true;
            }

            // Case 2: ObjectPattern with RestElement (let { ...rest } = $props())
            if pattern.starts_with('{') && pattern.contains("...") {
                return true;
            }
        }
    }
    false
}

/// Transform script code to use proper destructuring for props spread pattern.
pub(crate) fn transform_props_spread(script: &str) -> String {
    let mut result = String::new();

    for line in script.lines() {
        let trimmed = line.trim();

        if (trimmed.starts_with("let ") || trimmed.starts_with("const "))
            && (trimmed.ends_with("= $$props")
                || trimmed.ends_with("= $$props;")
                || trimmed.contains("= $$props "))
            && let Some(props_idx) = trimmed.find("= $$props")
        {
            let left = trimmed[..props_idx].trim();
            let pattern = if let Some(stripped) = left.strip_prefix("let ") {
                stripped.trim()
            } else if let Some(stripped) = left.strip_prefix("const ") {
                stripped.trim()
            } else {
                left
            };

            // Case 1: Simple identifier (let props = $$props)
            if !pattern.starts_with('{') {
                result.push_str(&format!(
                    "\t\tlet {{ $$slots, $$events, ...{} }} = $$props;\n",
                    pattern
                ));
                continue;
            }

            // Case 2 & 3: ObjectPattern with RestElement
            if pattern.starts_with('{') && pattern.ends_with('}') {
                let inner = &pattern[1..pattern.len() - 1].trim();

                if let Some(rest_idx) = inner.find("...") {
                    let rest_part = &inner[rest_idx..];
                    let rest_name = rest_part.trim_start_matches("...").trim();
                    let other_props = inner[..rest_idx].trim().trim_end_matches(',').trim();

                    let decl_keyword = if trimmed.starts_with("const ") {
                        "const"
                    } else {
                        "let"
                    };

                    if other_props.is_empty() {
                        result.push_str(&format!(
                            "\t\t{} {{ $$slots, $$events, ...{} }} = $$props;\n",
                            decl_keyword, rest_name
                        ));
                    } else {
                        result.push_str(&format!(
                            "\t\t{} {{ {}, $$slots, $$events, ...{} }} = $$props;\n",
                            decl_keyword, other_props, rest_name
                        ));
                    }
                    continue;
                }
            }

            // Fallback: keep original line
            result.push_str(&format!("\t\t{}\n", trimmed));
            continue;
        }

        if !trimmed.is_empty() {
            result.push_str(&format!("\t\t{}\n", trimmed));
        }
    }

    if result.ends_with('\n') {
        result.pop();
    }

    result
}

/// Extract constant variable bindings from script content.
pub(crate) fn extract_constant_vars(script: &str, full_source: &str) -> FxHashMap<String, String> {
    let mut constants = FxHashMap::default();
    let mut let_vars: Vec<String> = Vec::new();

    for line in script.lines() {
        let trimmed = line.trim();

        if trimmed.contains("$state") || trimmed.contains("$derived") || trimmed.contains("$props")
        {
            continue;
        }

        let is_export = trimmed.starts_with("export ");
        let trimmed = if let Some(rest) = trimmed.strip_prefix("export ") {
            rest.trim_start()
        } else {
            trimmed
        };

        let (decl_start, is_const) = if trimmed.starts_with("const ") {
            (Some(6), true)
        } else if !is_export && trimmed.starts_with("let ") {
            (Some(4), false)
        } else {
            (None, false)
        };

        if let Some(start) = decl_start {
            let rest = &trimmed[start..];
            if let Some(eq_idx) = rest.find('=') {
                let name = rest[..eq_idx].trim();
                let value = rest[eq_idx + 1..].trim().trim_end_matches(';');

                if (value.starts_with('\'') && value.ends_with('\''))
                    || (value.starts_with('"') && value.ends_with('"'))
                    || (value.starts_with('`') && value.ends_with('`') && !value.contains("${"))
                {
                    let content = &value[1..value.len() - 1];
                    constants.insert(name.to_string(), content.to_string());
                    if !is_const {
                        let_vars.push(name.to_string());
                    }
                } else if let Ok(n) = value.parse::<i64>() {
                    constants.insert(name.to_string(), n.to_string());
                    if !is_const {
                        let_vars.push(name.to_string());
                    }
                } else if let Ok(n) = value.parse::<f64>()
                    && n.is_finite()
                {
                    constants.insert(name.to_string(), n.to_string());
                    if !is_const {
                        let_vars.push(name.to_string());
                    }
                }
            }
        }
    }

    for var_name in &let_vars {
        let bind_pattern = format!("bind:{}", var_name);
        if full_source.contains(&bind_pattern) {
            constants.remove(var_name);
            continue;
        }

        let is_reassigned = full_source.lines().any(|line| {
            let trimmed = line.trim();
            if trimmed.starts_with("let ")
                || trimmed.starts_with("const ")
                || trimmed.starts_with("export let ")
                || trimmed.starts_with("export const ")
            {
                return false;
            }
            let mut search_start = 0;
            while let Some(pos) = trimmed[search_start..].find(var_name.as_str()) {
                let abs_pos = search_start + pos;
                let after_pos = abs_pos + var_name.len();

                let before_ok = abs_pos == 0 || {
                    let c = trimmed.as_bytes()[abs_pos - 1];
                    !c.is_ascii_alphanumeric() && c != b'_' && c != b'$'
                };

                let after_char_ok = after_pos >= trimmed.len() || {
                    let c = trimmed.as_bytes()[after_pos];
                    !c.is_ascii_alphanumeric() && c != b'_' && c != b'$'
                };

                if before_ok && after_char_ok && after_pos < trimmed.len() {
                    let rest = trimmed[after_pos..].trim_start();
                    if (rest.starts_with('=') && !rest.starts_with("==") && !rest.starts_with("=>"))
                        || rest.starts_with("+=")
                        || rest.starts_with("-=")
                        || rest.starts_with("*=")
                        || rest.starts_with("/=")
                    {
                        return true;
                    }
                    if rest.starts_with("++") || rest.starts_with("--") {
                        return true;
                    }
                }

                search_start = abs_pos + 1;
                if search_start >= trimmed.len() {
                    break;
                }
            }
            false
        });

        if is_reassigned {
            constants.remove(var_name);
        }
    }

    constants
}

/// Extract import statements from script content (instance script version).
/// Strips `export { ... }` statements as they're handled via $.bind_props.
pub(crate) fn extract_imports(script: &str) -> (Vec<String>, String) {
    extract_imports_with_options(script, true)
}

/// Extract import statements from module script content.
/// Keeps `export { ... }` statements as they should be emitted directly.
pub(crate) fn extract_imports_module(script: &str) -> (Vec<String>, String) {
    extract_imports_with_options(script, false)
}

/// Extract import statements from script content.
fn extract_imports_with_options(script: &str, strip_exports: bool) -> (Vec<String>, String) {
    let mut imports = Vec::new();
    let mut rest = String::new();

    for line in script.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with("import ") || trimmed.starts_with("import{") {
            imports.push(trimmed.to_string());
        } else {
            rest.push_str(line);
            rest.push('\n');
        }
    }

    if rest.ends_with('\n') {
        rest.pop();
    }

    if strip_exports {
        let rest = strip_export_specifiers(&rest);
        (imports, rest)
    } else {
        (imports, rest)
    }
}

/// Strip `export { ... }` statements from script content.
fn strip_export_specifiers(script: &str) -> String {
    let mut result = String::new();
    let chars: Vec<char> = script.chars().collect();
    let len = chars.len();
    let mut i = 0;

    while i < len {
        if i + 6 <= len {
            let potential: String = chars[i..i + 6].iter().collect();
            if potential == "export" {
                let mut j = i + 6;

                while j < len && (chars[j] == ' ' || chars[j] == '\t' || chars[j] == '\n') {
                    j += 1;
                }

                if j < len && chars[j] == '{' {
                    let mut depth = 1;
                    let start = j + 1;
                    let mut end = start;

                    while end < len && depth > 0 {
                        match chars[end] {
                            '{' => depth += 1,
                            '}' => depth -= 1,
                            _ => {}
                        }
                        if depth > 0 {
                            end += 1;
                        }
                    }

                    if end < len {
                        end += 1; // skip '}'
                    }

                    while end < len && (chars[end] == ' ' || chars[end] == '\t') {
                        end += 1;
                    }
                    if end < len && chars[end] == '\n' {
                        end += 1;
                    }

                    i = end;
                    continue;
                }
            }
        }

        result.push(chars[i]);
        i += 1;
    }

    result
}

/// Strip `export` keyword from function/const/class declarations.
fn strip_export_from_declarations(script: &str) -> String {
    let mut result = String::new();
    for line in script.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with("export function ")
            || trimmed.starts_with("export async function ")
            || trimmed.starts_with("export const ")
            || trimmed.starts_with("export class ")
        {
            let indent = &line[..line.len() - trimmed.len()];
            let rest = trimmed.strip_prefix("export ").unwrap_or(trimmed);
            result.push_str(indent);
            result.push_str(rest);
        } else {
            result.push_str(line);
        }
        result.push('\n');
    }
    if result.ends_with('\n') && !script.ends_with('\n') {
        result.pop();
    }
    result
}

/// Transform script content for server-side rendering.
pub(crate) fn transform_script_content(script: &str) -> String {
    transform_script_content_inner(script, false)
}

pub(crate) fn transform_script_content_module(script: &str) -> String {
    transform_script_content_inner(script, true)
}

fn transform_script_content_inner(script: &str, is_module: bool) -> String {
    let script = script.replace("$props()", "$$props");
    let script = transform_rune_call_multiline(&script, "$state.eager(");
    let script = script.replace("$effect.pending()", "false");
    let script = script.replace("$effect.tracking()", "false");
    let script = script.replace("$props.id()", "$.props_id($$renderer)");
    let script = transform_state_snapshot_server(&script);
    let script = transform_rune_call_multiline(&script, "$state.raw(");
    let script = transform_array_destructure_state(&script);
    let script = transform_rune_call_multiline(&script, "$state(");
    let script = transform_rune_call_multiline(&script, "$derived.by(");
    let script = transform_rune_call_multiline(&script, "$derived(");
    let script = transform_store_assignments(&script);
    let script = if is_module {
        script
    } else {
        transform_export_let_declarations(&script)
    };
    let script = if is_module {
        script
    } else {
        strip_export_from_declarations(&script)
    };

    let mut result = String::new();
    let lines: Vec<&str> = script.lines().collect();

    for line in lines {
        let trimmed = line.trim();

        if result.is_empty() && trimmed.is_empty() {
            continue;
        }

        let line = format_js_line(line);
        let line = add_statement_semicolon(&line);

        if line.starts_with('\t') {
            result.push_str(&line);
        } else if trimmed.is_empty() {
            // Empty line
        } else {
            result.push('\t');
            result.push_str(trimmed);
        }
        result.push('\n');
    }

    if result.ends_with('\n') {
        result.pop();
    }

    result
}

fn format_js_line(line: &str) -> String {
    let mut result = String::new();
    let chars: Vec<char> = line.chars().collect();
    let mut i = 0;
    let mut in_string = false;
    let mut string_char = ' ';

    while i < chars.len() {
        let c = chars[i];

        if (c == '"' || c == '\'' || c == '`') && (i == 0 || chars[i - 1] != '\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
        }

        if in_string {
            result.push(c);
            i += 1;
            continue;
        }

        if c == '=' {
            let next = chars.get(i + 1).copied();
            let prev = if !result.is_empty() {
                result.chars().last()
            } else {
                None
            };

            if next == Some('=')
                || next == Some('>')
                || prev == Some('=')
                || prev == Some('!')
                || prev == Some('<')
                || prev == Some('>')
                || prev == Some('+')
                || prev == Some('-')
                || prev == Some('*')
                || prev == Some('/')
                || prev == Some('%')
                || prev == Some('&')
                || prev == Some('|')
                || prev == Some('^')
                || prev == Some('?')
            {
                result.push(c);
            } else {
                if prev != Some(' ') {
                    result.push(' ');
                }
                result.push(c);
                if next != Some(' ') && next.is_some() {
                    result.push(' ');
                }
            }
            i += 1;
            continue;
        }

        if c == '{' {
            let prev = if !result.is_empty() {
                result.chars().last()
            } else {
                None
            };
            if prev == Some(')') {
                result.push(' ');
            }
            result.push(c);
            i += 1;
            continue;
        }

        result.push(c);
        i += 1;
    }

    result
}

/// Transform array destructuring with $state() in server-side rendering.
fn transform_array_destructure_state(script: &str) -> String {
    use regex::Regex;
    use std::sync::LazyLock;

    static ARRAY_DESTRUCT_RE: LazyLock<Regex> = LazyLock::new(|| {
        Regex::new(r"(?m)^(\s*)(let|const)\s+\[([^\]]+)\]\s*=\s*\$state\(").unwrap()
    });

    let mut result = script.to_string();
    let mut offset = 0;

    for cap in ARRAY_DESTRUCT_RE.captures_iter(script) {
        let full_match = cap.get(0).unwrap();
        let indent = cap.get(1).unwrap().as_str();
        let _keyword = cap.get(2).unwrap().as_str();
        let array_pattern = cap.get(3).unwrap().as_str();

        let start_pos = full_match.end();
        let remaining = &script[start_pos..];
        if let Some(paren_end) = find_matching_paren_for_state(remaining) {
            let value = &remaining[..paren_end].trim();

            let (vars, has_rest) = parse_array_pattern(array_pattern);

            let mut transformed = format!("{}let tmp = {},\n", indent, value);

            if has_rest {
                transformed.push_str(&format!("{}\t$$array = $.to_array(tmp)", indent));
            } else {
                transformed.push_str(&format!(
                    "{}\t$$array = $.to_array(tmp, {})",
                    indent,
                    vars.len()
                ));
            }

            for (i, var) in vars.iter().enumerate() {
                let var = var.trim();
                if var.starts_with("...") {
                    let rest_name = var.trim_start_matches("...");
                    transformed.push_str(&format!(
                        ",\n{}\t{} = $$array.slice({})",
                        indent, rest_name, i
                    ));
                } else if var.contains('=') {
                    let parts: Vec<&str> = var.splitn(2, '=').collect();
                    let name = parts[0].trim();
                    let default = parts.get(1).map(|s| s.trim()).unwrap_or("void 0");
                    transformed.push_str(&format!(
                        ",\n{}\t{} = $$array[{}] ?? {}",
                        indent, name, i, default
                    ));
                } else {
                    transformed.push_str(&format!(",\n{}\t{} = $$array[{}]", indent, var, i));
                }
            }

            let match_start = full_match.start() + offset;
            let match_end = start_pos + paren_end + offset;
            result = format!(
                "{}{}{}",
                &result[..match_start],
                transformed,
                &result[match_end + 1..] // +1 to skip the closing paren
            );

            let old_len = full_match.len() + paren_end + 1;
            let new_len = transformed.len();
            offset = offset + new_len - old_len;
        }
    }

    result
}

fn parse_array_pattern(pattern: &str) -> (Vec<&str>, bool) {
    let mut vars = Vec::new();
    let mut has_rest = false;
    let mut depth = 0;
    let mut start = 0;

    for (i, c) in pattern.char_indices() {
        match c {
            '[' | '(' | '{' => depth += 1,
            ']' | ')' | '}' => depth -= 1,
            ',' if depth == 0 => {
                let var = pattern[start..i].trim();
                if !var.is_empty() {
                    if var.starts_with("...") {
                        has_rest = true;
                    }
                    vars.push(var);
                }
                start = i + 1;
            }
            _ => {}
        }
    }

    let var = pattern[start..].trim();
    if !var.is_empty() {
        if var.starts_with("...") {
            has_rest = true;
        }
        vars.push(var);
    }

    (vars, has_rest)
}

fn find_matching_paren_for_state(s: &str) -> Option<usize> {
    let mut depth = 1;
    let mut in_string = false;
    let mut string_char = ' ';

    for (i, c) in s.char_indices() {
        if (c == '"' || c == '\'' || c == '`') && (i == 0 || s.as_bytes()[i - 1] != b'\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
            continue;
        }

        if in_string {
            continue;
        }

        match c {
            '(' | '[' | '{' => depth += 1,
            ')' | ']' | '}' => {
                depth -= 1;
                if depth == 0 {
                    return Some(i);
                }
            }
            _ => {}
        }
    }

    None
}

/// Transform $state.snapshot() in server script content.
fn transform_state_snapshot_server(script: &str) -> String {
    let prefix = "$state.snapshot(";
    let mut result = script.to_string();
    let mut search_from = 0;

    while let Some(pos) = result[search_from..].find(prefix) {
        let abs_pos = search_from + pos;
        let after_prefix = abs_pos + prefix.len();

        if let Some(content_end) = find_matching_paren_for_state(&result[after_prefix..]) {
            let content = result[after_prefix..after_prefix + content_end].to_string();

            let before = result[..abs_pos].trim_end();
            let is_assignment = before.ends_with('=') && !before.ends_with("==");

            if is_assignment {
                let end = after_prefix + content_end + 1;
                result = format!("{}{}{}", &result[..abs_pos], content, &result[end..]);
                search_from = abs_pos + content.len();
            } else {
                result = format!(
                    "{}$.snapshot({}",
                    &result[..abs_pos],
                    &result[after_prefix..]
                );
                search_from = abs_pos + "$.snapshot(".len();
            }
        } else {
            search_from = abs_pos + prefix.len();
        }
    }

    result
}

/// Simple rune call transformation for template expressions.
pub(crate) fn transform_rune_call_simple(expr: &str, prefix: &str) -> String {
    let mut result = String::new();
    let mut i = 0;
    let bytes = expr.as_bytes();
    let prefix_bytes = prefix.as_bytes();
    let prefix_len = prefix_bytes.len();

    while i < bytes.len() {
        if i + prefix_len <= bytes.len() && &bytes[i..i + prefix_len] == prefix_bytes {
            let start = i + prefix_len;
            let mut depth = 1;
            let mut end = start;
            while end < bytes.len() && depth > 0 {
                match bytes[end] {
                    b'(' => depth += 1,
                    b')' => depth -= 1,
                    b'\'' | b'"' | b'`' => {
                        let quote = bytes[end];
                        end += 1;
                        while end < bytes.len() && bytes[end] != quote {
                            if bytes[end] == b'\\' {
                                end += 1;
                            }
                            end += 1;
                        }
                    }
                    _ => {}
                }
                if depth > 0 {
                    end += 1;
                }
            }
            result.push_str(&expr[start..end]);
            i = end + 1;
        } else {
            result.push(expr.as_bytes()[i] as char);
            i += 1;
        }
    }
    result
}

fn transform_rune_call_multiline(script: &str, prefix: &str) -> String {
    let mut result = String::new();
    let chars: Vec<char> = script.chars().collect();
    let prefix_chars: Vec<char> = prefix.chars().collect();
    let prefix_len = prefix_chars.len();
    let mut i = 0;

    let is_derived_by = prefix == "$derived.by(";

    while i < chars.len() {
        if i + prefix_len <= chars.len() {
            let potential: String = chars[i..i + prefix_len].iter().collect();
            if potential == prefix {
                let mut depth = 1;
                let start = i + prefix_len;
                let mut end = start;
                let mut in_string = false;
                let mut string_char = ' ';

                while end < chars.len() && depth > 0 {
                    let c = chars[end];

                    if (c == '"' || c == '\'' || c == '`') && (end == 0 || chars[end - 1] != '\\') {
                        if !in_string {
                            in_string = true;
                            string_char = c;
                        } else if c == string_char {
                            in_string = false;
                        }
                    }

                    if !in_string {
                        match c {
                            '(' => depth += 1,
                            ')' => depth -= 1,
                            _ => {}
                        }
                    }
                    if depth > 0 {
                        end += 1;
                    }
                }

                let inner: String = chars[start..end].iter().collect();
                let trimmed_inner = inner.trim();

                if trimmed_inner.is_empty() {
                    result.push_str("void 0");
                } else if is_derived_by {
                    result.push('(');
                    result.push_str(&inner);
                    result.push_str(")()");
                } else {
                    result.push_str(&inner);
                }

                i = end + 1;
                continue;
            }
        }

        result.push(chars[i]);
        i += 1;
    }

    result
}

fn add_statement_semicolon(line: &str) -> String {
    let trimmed = line.trim();

    if trimmed.is_empty() {
        return line.to_string();
    }

    if trimmed.ends_with(';')
        || trimmed.ends_with('{')
        || trimmed.ends_with('}')
        || trimmed.ends_with(',')
    {
        return line.to_string();
    }

    if (trimmed.starts_with("const ") || trimmed.starts_with("let ") || trimmed.starts_with("var "))
        && trimmed.ends_with(')')
    {
        return format!("{};", line);
    }

    line.to_string()
}

/// Transform class fields with $derived runes for server-side.
pub(crate) fn transform_class_fields_server(script: &str) -> String {
    if !script.contains("class ")
        || (!script.contains("$derived(")
            && !script.contains("$derived.by(")
            && !script.contains("$state(")
            && !script.contains("$state.raw("))
    {
        return script.to_string();
    }

    let Some(class_pos) = script.find("class ") else {
        return script.to_string();
    };

    let after_class = &script[class_pos..];
    let Some(brace_pos) = after_class.find('{') else {
        return script.to_string();
    };

    let class_header = &after_class[..brace_pos + 1];

    let class_body_start = class_pos + brace_pos + 1;
    let mut brace_depth = 1;
    let mut class_body_end = class_body_start;

    for (i, c) in script[class_body_start..].char_indices() {
        match c {
            '{' => brace_depth += 1,
            '}' => {
                brace_depth -= 1;
                if brace_depth == 0 {
                    class_body_end = class_body_start + i;
                    break;
                }
            }
            _ => {}
        }
    }

    let class_body = &script[class_body_start..class_body_end];

    #[derive(Debug, Clone)]
    enum ClassMember {
        Field(String),
        Method(Vec<String>),
        ArrowFn(Vec<String>),
    }

    #[derive(Debug, Clone)]
    struct DerivedField {
        name: String,
        is_private: bool,
        constructor_declared: bool,
    }

    let mut members: Vec<ClassMember> = Vec::new();
    let mut derived_fields: Vec<DerivedField> = Vec::new();
    let mut has_state_fields = false;

    let mut in_block = false;
    let mut block_depth = 0;
    let mut block_lines: Vec<String> = Vec::new();
    let mut block_is_arrow_fn = false;

    for line in class_body.lines() {
        let trimmed = line.trim();

        if in_block {
            block_lines.push(trimmed.to_string());
            for c in trimmed.chars() {
                match c {
                    '{' => block_depth += 1,
                    '}' => {
                        block_depth -= 1;
                        if block_depth == 0 {
                            in_block = false;
                            if block_is_arrow_fn {
                                members.push(ClassMember::ArrowFn(block_lines.clone()));
                            } else {
                                members.push(ClassMember::Method(block_lines.clone()));
                            }
                            block_lines.clear();
                        }
                    }
                    _ => {}
                }
            }
            continue;
        }

        if trimmed.is_empty() {
            continue;
        }

        if trimmed.contains("constructor(") && !trimmed.contains('=') {
            in_block = true;
            block_is_arrow_fn = false;
            block_depth = 0;
            block_lines.clear();
            block_lines.push(trimmed.to_string());
            for c in trimmed.chars() {
                match c {
                    '{' => block_depth += 1,
                    '}' => {
                        block_depth -= 1;
                        if block_depth == 0 {
                            in_block = false;
                            members.push(ClassMember::Method(block_lines.clone()));
                            block_lines.clear();
                        }
                    }
                    _ => {}
                }
            }
            continue;
        }

        let is_arrow_fn_start = trimmed.contains('=')
            && trimmed.contains("=>")
            && trimmed.contains('{')
            && !trimmed.contains("$derived")
            && !trimmed.contains("$state");

        if is_arrow_fn_start {
            in_block = true;
            block_is_arrow_fn = true;
            block_depth = 0;
            block_lines.clear();
            block_lines.push(trimmed.to_string());
            for c in trimmed.chars() {
                match c {
                    '{' => block_depth += 1,
                    '}' => {
                        block_depth -= 1;
                        if block_depth == 0 {
                            in_block = false;
                            members.push(ClassMember::ArrowFn(block_lines.clone()));
                            block_lines.clear();
                        }
                    }
                    _ => {}
                }
            }
            continue;
        }

        let is_method_start = (trimmed.contains('(') && trimmed.contains('{'))
            && !trimmed.contains('=')
            && !trimmed.starts_with("//")
            && !trimmed.starts_with("/*");

        if is_method_start {
            in_block = true;
            block_is_arrow_fn = false;
            block_depth = 0;
            block_lines.clear();
            block_lines.push(trimmed.to_string());
            for c in trimmed.chars() {
                match c {
                    '{' => block_depth += 1,
                    '}' => {
                        block_depth -= 1;
                        if block_depth == 0 {
                            in_block = false;
                            members.push(ClassMember::Method(block_lines.clone()));
                            block_lines.clear();
                        }
                    }
                    _ => {}
                }
            }
            continue;
        }

        let is_derived_field = trimmed.contains("= $derived(")
            || trimmed.contains("=$derived(")
            || trimmed.contains("= $derived.by(")
            || trimmed.contains("=$derived.by(");
        if is_derived_field {
            let is_private = trimmed.starts_with('#');
            if let Some(eq_pos) = trimmed.find('=') {
                let name = trimmed[..eq_pos].trim().trim_start_matches('#').to_string();

                let (derived_pattern, is_derived_by) = if trimmed.contains("$derived.by(") {
                    ("$derived.by(", true)
                } else {
                    ("$derived(", false)
                };

                if let Some(derived_pos) = trimmed.find(derived_pattern) {
                    let value_start = derived_pos + derived_pattern.len();
                    let after_paren = &trimmed[value_start..];

                    if let Some(value_end) = find_matching_paren_server(after_paren) {
                        let value = after_paren[..value_end].to_string();
                        let sanitized_name = sanitize_identifier(&name);
                        let private_name = format!("#{}", sanitized_name);

                        let value_str = value.trim();
                        let wrapped_value = if value_str.starts_with('{') {
                            format!("({})", value_str)
                        } else {
                            value_str.to_string()
                        };

                        let transformed_line = if is_derived_by {
                            format!("{} = $.derived({})", private_name, wrapped_value)
                        } else {
                            format!("{} = $.derived(() => {})", private_name, wrapped_value)
                        };

                        members.push(ClassMember::Field(transformed_line));

                        derived_fields.push(DerivedField {
                            name,
                            is_private,
                            constructor_declared: false,
                        });
                        continue;
                    }
                }
            }
        }

        let is_state_field = trimmed.contains("= $state(")
            || trimmed.contains("=$state(")
            || trimmed.contains("= $state.raw(")
            || trimmed.contains("=$state.raw(");
        if is_state_field && let Some(eq_pos) = trimmed.find('=') {
            let (state_pattern, state_pos) = if let Some(pos) = trimmed.find("$state.raw(") {
                ("$state.raw(", pos)
            } else if let Some(pos) = trimmed.find("$state(") {
                ("$state(", pos)
            } else {
                members.push(ClassMember::Field(trimmed.to_string()));
                continue;
            };
            let field_name = trimmed[..eq_pos].trim();
            let value_start = state_pos + state_pattern.len();
            let after_paren = &trimmed[value_start..];

            if let Some(value_end) = find_matching_paren_server(after_paren) {
                let value = after_paren[..value_end].trim();
                has_state_fields = true;
                if value.is_empty() {
                    members.push(ClassMember::Field(field_name.to_string()));
                } else {
                    members.push(ClassMember::Field(format!("{} = {}", field_name, value)));
                }
                continue;
            }
        }

        members.push(ClassMember::Field(trimmed.to_string()));
    }

    // Scan constructor members for $derived/$state assignments
    for member in &mut members {
        if let ClassMember::Method(lines) = member
            && lines
                .first()
                .is_some_and(|l| l.trim().contains("constructor("))
        {
            let mut new_lines: Vec<String> = Vec::new();
            for line in lines.iter() {
                let trimmed = line.trim();

                if trimmed.starts_with("this.")
                    && (trimmed.contains("= $derived(")
                        || trimmed.contains("=$derived(")
                        || trimmed.contains("= $derived.by(")
                        || trimmed.contains("=$derived.by("))
                    && let Some(eq_pos) = trimmed.find('=')
                {
                    let lhs = trimmed[5..eq_pos].trim();
                    let is_private = lhs.starts_with('#');
                    let name = lhs.trim_start_matches('#').to_string();

                    let (derived_pattern, is_derived_by) = if trimmed.contains("$derived.by(") {
                        ("$derived.by(", true)
                    } else {
                        ("$derived(", false)
                    };

                    if let Some(derived_pos) = trimmed.find(derived_pattern) {
                        let value_start = derived_pos + derived_pattern.len();
                        let after_paren = &trimmed[value_start..];

                        if let Some(value_end) = find_matching_paren_server(after_paren) {
                            let value = after_paren[..value_end].to_string();
                            let sanitized = sanitize_identifier(&name);
                            let private_ref = format!("#{}", sanitized);

                            let value_str = value.trim();
                            let wrapped_value = if value_str.starts_with('{') {
                                format!("({})", value_str)
                            } else {
                                value_str.to_string()
                            };

                            let rhs = if is_derived_by {
                                format!("$.derived({})", wrapped_value)
                            } else {
                                format!("$.derived(() => {})", wrapped_value)
                            };

                            new_lines.push(format!("this.{} = {};", private_ref, rhs));

                            derived_fields.push(DerivedField {
                                name,
                                is_private,
                                constructor_declared: true,
                            });
                            continue;
                        }
                    }
                }

                if trimmed.starts_with("this.")
                    && (trimmed.contains("= $state(")
                        || trimmed.contains("=$state(")
                        || trimmed.contains("= $state.raw(")
                        || trimmed.contains("=$state.raw("))
                    && let Some(eq_pos) = trimmed.find('=')
                {
                    let lhs = trimmed[5..eq_pos].trim();

                    let (state_pattern, state_pos) = if let Some(pos) = trimmed.find("$state.raw(")
                    {
                        ("$state.raw(", pos)
                    } else if let Some(pos) = trimmed.find("$state(") {
                        ("$state(", pos)
                    } else {
                        new_lines.push(trimmed.to_string());
                        continue;
                    };

                    let value_start = state_pos + state_pattern.len();
                    let after_paren = &trimmed[value_start..];

                    if let Some(value_end) = find_matching_paren_server(after_paren) {
                        let value = after_paren[..value_end].trim();
                        has_state_fields = true;

                        if value.is_empty() {
                            new_lines.push(format!("this.{} = void 0;", lhs));
                        } else {
                            new_lines.push(format!("this.{} = {};", lhs, value));
                        }
                        continue;
                    }
                }

                new_lines.push(trimmed.to_string());
            }
            *lines = new_lines;
        }
    }

    let derived_private_names: Vec<String> = derived_fields
        .iter()
        .map(|f| {
            let sanitized = sanitize_identifier(&f.name);
            format!("#{}", sanitized)
        })
        .collect();

    if derived_fields.is_empty() && !has_state_fields {
        return script.to_string();
    }

    let mut new_class_body = String::new();

    for field in derived_fields
        .iter()
        .filter(|f| f.constructor_declared && !f.is_private)
    {
        let sanitized_name = sanitize_identifier(&field.name);
        let private_name = format!("#{}", sanitized_name);

        new_class_body.push_str(&format!("\t\t{};\n", private_name));
        new_class_body.push('\n');
        new_class_body.push_str(&format!(
            "\t\tget {}() {{\n\t\t\treturn this.{}();\n\t\t}}\n",
            field.name, private_name
        ));
        new_class_body.push('\n');
        new_class_body.push_str(&format!(
            "\t\tset {}($$value) {{\n\t\t\treturn this.{}($$value);\n\t\t}}\n",
            field.name, private_name
        ));
    }

    for member in &members {
        match member {
            ClassMember::Field(line) => {
                new_class_body.push_str(&format!("\t\t{}\n", line));
                for field in derived_fields
                    .iter()
                    .filter(|f| !f.constructor_declared && !f.is_private)
                {
                    let sanitized_name = sanitize_identifier(&field.name);
                    let private_name = format!("#{}", sanitized_name);
                    if line.starts_with(&private_name) {
                        new_class_body.push('\n');
                        new_class_body.push_str(&format!(
                            "\t\tget {}() {{\n\t\t\treturn this.{}();\n\t\t}}\n",
                            field.name, private_name
                        ));
                        new_class_body.push('\n');
                        new_class_body.push_str(&format!(
                            "\t\tset {}($$value) {{\n\t\t\treturn this.{}($$value);\n\t\t}}\n",
                            field.name, private_name
                        ));
                    }
                }
            }
            ClassMember::Method(lines) => {
                let method_text = lines
                    .iter()
                    .map(|l| format!("\t\t{}", l))
                    .collect::<Vec<_>>()
                    .join("\n");
                let transformed =
                    transform_private_derived_accesses_server(&method_text, &derived_private_names);
                new_class_body.push('\n');
                new_class_body.push_str(&transformed);
                new_class_body.push('\n');
            }
            ClassMember::ArrowFn(lines) => {
                new_class_body.push('\n');
                for line in lines {
                    new_class_body.push_str(&format!("\t\t{}\n", line));
                }
            }
        }
    }

    let before_class = &script[..class_pos];
    let after_class_body = &script[class_body_end + 1..];

    let after_class_transformed = transform_class_fields_server(after_class_body);

    let result = format!(
        "{}{}\n{}\t}}{}",
        before_class, class_header, new_class_body, after_class_transformed
    );

    result
}

fn transform_private_derived_accesses_server(
    code: &str,
    derived_private_names: &[String],
) -> String {
    if derived_private_names.is_empty() {
        return code.to_string();
    }

    let mut result = code.to_string();

    for private_name in derived_private_names {
        let search_pattern = format!(".{}", private_name);
        let mut new_result = String::new();
        let mut remaining = result.as_str();

        while let Some(pos) = remaining.find(&search_pattern) {
            new_result.push_str(&remaining[..pos]);

            let after_match = &remaining[pos + search_pattern.len()..];

            let next_non_ws = after_match.chars().find(|c| !c.is_whitespace());
            let is_already_call = next_non_ws == Some('(');

            let is_assignment = if let Some(eq_offset) = after_match.find('=') {
                let before_eq = &after_match[..eq_offset];
                before_eq.chars().all(|c| c.is_whitespace())
                    && after_match.chars().nth(eq_offset + 1) != Some('=')
            } else {
                false
            };

            if is_already_call || is_assignment {
                new_result.push_str(&search_pattern);
            } else {
                new_result.push_str(&search_pattern);
                new_result.push_str("()");
            }

            remaining = after_match;
        }

        new_result.push_str(remaining);
        result = new_result;
    }

    result
}

fn find_matching_paren_server(s: &str) -> Option<usize> {
    let mut depth = 1;
    for (i, c) in s.char_indices() {
        match c {
            '(' | '{' | '[' => depth += 1,
            ')' | '}' | ']' => {
                depth -= 1;
                if depth == 0 {
                    return Some(i);
                }
            }
            _ => {}
        }
    }
    None
}

/// Remove $effect, $effect.pre, $effect.root, $inspect, and $inspect.trace blocks from script.
pub(crate) fn remove_effect_blocks(script: &str) -> String {
    let mut result = script.to_string();

    let effect_runes = [
        "$effect.root(",
        "$effect.pre(",
        "$effect(",
        "$inspect.trace(",
        "$inspect(",
    ];

    for rune in effect_runes {
        result = remove_rune_statement(&result, rune);
    }

    result
}

fn remove_rune_statement(script: &str, rune_prefix: &str) -> String {
    let mut result = String::new();
    let chars: Vec<char> = script.chars().collect();
    let prefix_chars: Vec<char> = rune_prefix.chars().collect();
    let prefix_len = prefix_chars.len();
    let mut i = 0;

    while i < chars.len() {
        if i + prefix_len <= chars.len() {
            let potential: String = chars[i..i + prefix_len].iter().collect();
            if potential == rune_prefix {
                let is_statement = is_statement_start(&result);

                if !is_statement && rune_prefix == "$effect.root(" {
                    let start = i + prefix_len;
                    let mut depth = 1;
                    let mut end = start;
                    let mut in_string = false;
                    let mut string_char = ' ';

                    while end < chars.len() && depth > 0 {
                        let c = chars[end];
                        if (c == '"' || c == '\'' || c == '`')
                            && (end == 0 || chars[end - 1] != '\\')
                        {
                            if !in_string {
                                in_string = true;
                                string_char = c;
                            } else if c == string_char {
                                in_string = false;
                            }
                        }
                        if !in_string {
                            match c {
                                '(' => depth += 1,
                                ')' => depth -= 1,
                                _ => {}
                            }
                        }
                        if depth > 0 {
                            end += 1;
                        }
                    }
                    end += 1;

                    result.push_str("() => {}");
                    i = end;
                    continue;
                }

                if is_statement {
                    let start = i + prefix_len;
                    let mut depth = 1;
                    let mut end = start;
                    let mut in_string = false;
                    let mut string_char = ' ';

                    while end < chars.len() && depth > 0 {
                        let c = chars[end];

                        if (c == '"' || c == '\'' || c == '`')
                            && (end == 0 || chars[end - 1] != '\\')
                        {
                            if !in_string {
                                in_string = true;
                                string_char = c;
                            } else if c == string_char {
                                in_string = false;
                            }
                        }

                        if !in_string {
                            match c {
                                '(' => depth += 1,
                                ')' => depth -= 1,
                                _ => {}
                            }
                        }
                        if depth > 0 {
                            end += 1;
                        }
                    }

                    end += 1;

                    // Handle method chaining like $inspect(...).with(...)
                    if end + 5 <= chars.len() {
                        let potential_with: String = chars[end..end + 5].iter().collect();
                        if potential_with == ".with" {
                            end += 5;
                            while end < chars.len() && (chars[end] == ' ' || chars[end] == '\t') {
                                end += 1;
                            }
                            if end < chars.len() && chars[end] == '(' {
                                end += 1;
                                let mut with_depth = 1;
                                let mut with_in_string = false;
                                let mut with_string_char = ' ';

                                while end < chars.len() && with_depth > 0 {
                                    let c = chars[end];
                                    if (c == '"' || c == '\'' || c == '`')
                                        && (end == 0 || chars[end - 1] != '\\')
                                    {
                                        if !with_in_string {
                                            with_in_string = true;
                                            with_string_char = c;
                                        } else if c == with_string_char {
                                            with_in_string = false;
                                        }
                                    }
                                    if !with_in_string {
                                        match c {
                                            '(' => with_depth += 1,
                                            ')' => with_depth -= 1,
                                            _ => {}
                                        }
                                    }
                                    if with_depth > 0 {
                                        end += 1;
                                    }
                                }
                                end += 1;
                            }
                        }
                    }

                    while end < chars.len() && (chars[end] == ';' || chars[end] == ' ') {
                        end += 1;
                    }

                    if end < chars.len() && chars[end] == '\n' {
                        end += 1;
                    }

                    if rune_prefix.starts_with("$inspect") {
                        result.push_str(";;\n");
                    }
                    if !rune_prefix.starts_with("$inspect") {
                        while result.ends_with(' ') || result.ends_with('\t') {
                            result.pop();
                        }
                    }

                    i = end;
                    continue;
                }
            }
        }

        result.push(chars[i]);
        i += 1;
    }

    result
}

fn is_statement_start(preceding: &str) -> bool {
    if let Some(last_newline) = preceding.rfind('\n') {
        let line_content = &preceding[last_newline + 1..];
        line_content.chars().all(|c| c.is_whitespace())
    } else {
        preceding.chars().all(|c| c.is_whitespace())
    }
}

/// Replace store identifier in an expression with $.store_get() call.
pub(crate) fn replace_store_identifier(expr: &str, store_ref: &str, store_name: &str) -> String {
    let mut result = String::with_capacity(expr.len() * 2);
    let chars: Vec<char> = expr.chars().collect();
    let store_ref_chars: Vec<char> = store_ref.chars().collect();
    let store_ref_len = store_ref_chars.len();
    let mut i = 0;

    while i < chars.len() {
        if i + store_ref_len <= chars.len() {
            let mut matches = true;
            for (j, ref_char) in store_ref_chars.iter().enumerate() {
                if chars[i + j] != *ref_char {
                    matches = false;
                    break;
                }
            }

            if matches {
                let prev_is_ident = if i > 0 {
                    is_js_identifier_char(chars[i - 1])
                } else {
                    false
                };
                let next_is_ident = if i + store_ref_len < chars.len() {
                    is_js_identifier_char(chars[i + store_ref_len])
                } else {
                    false
                };

                if !prev_is_ident && !next_is_ident {
                    result.push_str(&format!(
                        "$.store_get($$store_subs ??= {{}}, '{}', {})",
                        store_ref, store_name
                    ));
                    i += store_ref_len;
                    continue;
                }
            }
        }

        result.push(chars[i]);
        i += 1;
    }

    result
}

/// Replace store identifier in script content with $.store_get() call.
pub(crate) fn replace_store_identifier_in_script(
    script: &str,
    store_ref: &str,
    store_name: &str,
) -> String {
    let mut result = String::with_capacity(script.len() * 2);
    let chars: Vec<char> = script.chars().collect();
    let store_ref_chars: Vec<char> = store_ref.chars().collect();
    let store_ref_len = store_ref_chars.len();
    let mut i = 0;

    let mut in_string = false;
    let mut string_char = ' ';

    while i < chars.len() {
        let c = chars[i];

        if (c == '"' || c == '\'' || c == '`') && (i == 0 || chars[i - 1] != '\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
            result.push(c);
            i += 1;
            continue;
        }

        if in_string {
            result.push(c);
            i += 1;
            continue;
        }

        if i + store_ref_len <= chars.len() {
            let mut matches = true;
            for (j, ref_char) in store_ref_chars.iter().enumerate() {
                if chars[i + j] != *ref_char {
                    matches = false;
                    break;
                }
            }

            if matches {
                let prev_is_ident = if i > 0 {
                    is_js_identifier_char(chars[i - 1])
                } else {
                    false
                };
                let next_is_ident = if i + store_ref_len < chars.len() {
                    is_js_identifier_char(chars[i + store_ref_len])
                } else {
                    false
                };

                let mut j = i + store_ref_len;
                while j < chars.len() && chars[j].is_whitespace() {
                    j += 1;
                }
                let is_assignment = j < chars.len()
                    && (chars[j] == '='
                        || (j + 1 < chars.len()
                            && chars[j + 1] == '='
                            && (chars[j] == '+'
                                || chars[j] == '-'
                                || chars[j] == '*'
                                || chars[j] == '/'
                                || chars[j] == '%'))
                        || (chars[j] == '+' && j + 1 < chars.len() && chars[j + 1] == '+')
                        || (chars[j] == '-' && j + 1 < chars.len() && chars[j + 1] == '-'));

                let is_comparison = j < chars.len()
                    && chars[j] == '='
                    && ((j + 1 < chars.len() && chars[j + 1] == '=')
                        || (i > 0
                            && (chars[i - 1] == '!'
                                || chars[i - 1] == '='
                                || chars[i - 1] == '<'
                                || chars[i - 1] == '>')));

                if !prev_is_ident && !next_is_ident && (!is_assignment || is_comparison) {
                    let preceding: String = result.chars().collect();
                    let is_in_store_call =
                        preceding.ends_with("$.store_set(") || preceding.ends_with("$.store_get(");

                    if !is_in_store_call {
                        result.push_str(&format!(
                            "$.store_get($$store_subs ??= {{}}, '{}', {})",
                            store_ref, store_name
                        ));
                        i += store_ref_len;
                        continue;
                    }
                }
            }
        }

        result.push(chars[i]);
        i += 1;
    }

    result
}

/// Check if a character is a valid JavaScript identifier character.
fn is_js_identifier_char(c: char) -> bool {
    c.is_alphanumeric() || c == '_' || c == '$'
}

/// Transform store assignments in script content for server-side rendering.
fn transform_store_assignments(script: &str) -> String {
    use regex::Regex;
    use std::sync::LazyLock;

    static STORE_ASSIGN_RE: LazyLock<Regex> = LazyLock::new(|| {
        Regex::new(r"\$([a-zA-Z_][a-zA-Z0-9_]*)\s*(\+\+|--|\+=|-=|\*=|/=|%=|&=|\|=|\^=|<<=|>>=|>>>=|\?\?=|&&=|\|\|=|=)\s*").unwrap()
    });

    static PREFIX_OP_RE: LazyLock<Regex> =
        LazyLock::new(|| Regex::new(r"(\+\+|--)\$([a-zA-Z_][a-zA-Z0-9_]*)").unwrap());

    let mut result = script.to_string();

    result = PREFIX_OP_RE
        .replace_all(&result, |caps: &regex::Captures| {
            let op = &caps[1];
            let store_name = &caps[2];
            if op == "++" {
                format!(
                    "$.update_store_pre($$store_subs ??= {{}}, '${0}', {0})",
                    store_name
                )
            } else {
                format!(
                    "$.update_store_pre($$store_subs ??= {{}}, '${0}', {0}, -1)",
                    store_name
                )
            }
        })
        .to_string();

    let mut new_result = String::new();
    let mut last_end = 0;

    for cap in STORE_ASSIGN_RE.captures_iter(&result) {
        let full_match = cap.get(0).unwrap();
        let start = full_match.start();
        let end = full_match.end();

        if start < last_end {
            continue;
        }

        let preceding = &result[..start];
        if preceding.ends_with("$.store_set(") || preceding.ends_with("$.store_get(") {
            continue;
        }

        if preceding.ends_with('$') {
            continue;
        }

        new_result.push_str(&result[last_end..start]);

        let store_name = &cap[1];
        let operator = &cap[2];

        match operator {
            "++" | "--" => {
                if operator == "++" {
                    new_result.push_str(&format!(
                        "$.update_store($$store_subs ??= {{}}, '${0}', {0})",
                        store_name
                    ));
                } else {
                    new_result.push_str(&format!(
                        "$.update_store($$store_subs ??= {{}}, '${0}', {0}, -1)",
                        store_name
                    ));
                }
            }
            "=" => {
                let rest = &result[end..];
                let value_end = find_statement_end(rest);
                let value = rest[..value_end].trim();
                new_result.push_str(&format!("$.store_set({}, {})", store_name, value));
                last_end = end + value_end;
                continue;
            }
            _ => {
                let base_op = &operator[..operator.len() - 1];
                let rest = &result[end..];
                let value_end = find_statement_end(rest);
                let value = rest[..value_end].trim();
                new_result.push_str(&format!(
                    "$.store_set({}, $.store_get($$store_subs ??= {{}}, '${0}', {0}) {} {})",
                    store_name, base_op, value
                ));
                last_end = end + value_end;
                continue;
            }
        }

        last_end = end;
    }

    new_result.push_str(&result[last_end..]);

    new_result
}

fn find_statement_end(s: &str) -> usize {
    let mut depth = 0;
    let chars: Vec<char> = s.chars().collect();
    let mut in_string = false;
    let mut string_char = ' ';

    for (i, &c) in chars.iter().enumerate() {
        if (c == '"' || c == '\'' || c == '`') && (i == 0 || chars[i - 1] != '\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
            continue;
        }

        if in_string {
            continue;
        }

        match c {
            '(' | '[' | '{' => depth += 1,
            ')' | ']' | '}' => {
                if depth > 0 {
                    depth -= 1;
                }
            }
            ';' | '\n' if depth == 0 => return i,
            _ => {}
        }
    }

    s.len()
}

/// Transform `export let` declarations for server-side rendering (legacy/non-runes mode).
fn transform_export_let_declarations(script: &str) -> String {
    let mut result = String::new();
    let mut lines = script.lines().peekable();

    while let Some(line) = lines.next() {
        let trimmed = line.trim();

        if trimmed.starts_with("export let ") || trimmed.starts_with("export var ") {
            let rest = &trimmed[11..];

            let mut full_declaration = rest.to_string();
            while !full_declaration.contains(';') && lines.peek().is_some() {
                if let Some(next_line) = lines.next() {
                    full_declaration.push(' ');
                    full_declaration.push_str(next_line.trim());
                }
            }

            let declaration = full_declaration.trim_end_matches(';').trim();

            let transformed = transform_single_export_let(declaration);
            result.push_str(&transformed);
            result.push('\n');
        } else {
            result.push_str(line);
            result.push('\n');
        }
    }

    if result.ends_with('\n') {
        result.pop();
    }

    result
}

fn transform_single_export_let(declaration: &str) -> String {
    let mut result = String::new();

    let declarators = split_declarators(declaration);

    for declarator in declarators {
        let declarator = declarator.trim();
        if declarator.is_empty() {
            continue;
        }

        if let Some(eq_pos) = find_assignment_in_declarator(declarator) {
            let name = declarator[..eq_pos].trim();
            let default_value = declarator[eq_pos + 1..].trim();

            let transformed_default = if is_simple_default_value(default_value) {
                format!(
                    "let {} = $.fallback($$props['{}'], {});",
                    name, name, default_value
                )
            } else if let Some(fn_name) = is_no_arg_function_call(default_value) {
                format!(
                    "let {} = $.fallback($$props['{}'], {}, true);",
                    name, name, fn_name
                )
            } else {
                format!(
                    "let {} = $.fallback($$props['{}'], () => ({}), true);",
                    name, name, default_value
                )
            };
            result.push_str(&transformed_default);
        } else {
            let name = declarator.trim();
            result.push_str(&format!("let {} = $$props['{}'];", name, name));
        }
        result.push('\n');
    }

    if result.ends_with('\n') {
        result.pop();
    }

    result
}

fn split_declarators(declaration: &str) -> Vec<String> {
    let mut result = Vec::new();
    let mut current = String::new();
    let mut depth = 0;
    let chars: Vec<char> = declaration.chars().collect();
    let mut in_string = false;
    let mut string_char = ' ';

    for (i, &c) in chars.iter().enumerate() {
        if (c == '"' || c == '\'' || c == '`') && (i == 0 || chars[i - 1] != '\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
            current.push(c);
            continue;
        }

        if in_string {
            current.push(c);
            continue;
        }

        match c {
            '(' | '[' | '{' => {
                depth += 1;
                current.push(c);
            }
            ')' | ']' | '}' => {
                depth -= 1;
                current.push(c);
            }
            ',' if depth == 0 => {
                result.push(current.trim().to_string());
                current = String::new();
            }
            _ => current.push(c),
        }
    }

    if !current.trim().is_empty() {
        result.push(current.trim().to_string());
    }

    result
}

fn find_assignment_in_declarator(declarator: &str) -> Option<usize> {
    let mut depth = 0;
    let chars: Vec<char> = declarator.chars().collect();
    let mut in_string = false;
    let mut string_char = ' ';

    for (i, &c) in chars.iter().enumerate() {
        if (c == '"' || c == '\'' || c == '`') && (i == 0 || chars[i - 1] != '\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
            continue;
        }

        if in_string {
            continue;
        }

        match c {
            '(' | '[' | '{' => depth += 1,
            ')' | ']' | '}' => depth -= 1,
            '=' if depth == 0 => {
                let prev = if i > 0 {
                    chars.get(i - 1).copied()
                } else {
                    None
                };
                let next = chars.get(i + 1).copied();
                if prev != Some('=')
                    && prev != Some('!')
                    && prev != Some('<')
                    && prev != Some('>')
                    && next != Some('=')
                    && next != Some('>')
                {
                    return Some(i);
                }
            }
            _ => {}
        }
    }

    None
}

fn is_no_arg_function_call(value: &str) -> Option<&str> {
    let trimmed = value.trim();
    if let Some(fn_name) = trimmed.strip_suffix("()")
        && is_simple_identifier(fn_name)
    {
        return Some(fn_name);
    }
    None
}

fn is_simple_default_value(value: &str) -> bool {
    is_simple_expression_string(value.trim())
}

fn is_simple_expression_string(trimmed: &str) -> bool {
    if trimmed.parse::<f64>().is_ok() {
        return true;
    }

    if matches!(trimmed, "true" | "false" | "null" | "undefined" | "void 0") {
        return true;
    }

    if is_simple_identifier(trimmed) {
        return true;
    }

    if is_string_literal(trimmed) {
        return true;
    }

    if is_arrow_function(trimmed) {
        return true;
    }

    if let Some((left, right)) = split_binary_expression(trimmed) {
        return is_simple_expression_string(left.trim())
            && is_simple_expression_string(right.trim());
    }

    if let Some((left, right)) = split_logical_expression(trimmed) {
        return is_simple_expression_string(left.trim())
            && is_simple_expression_string(right.trim());
    }

    if let Some((test, cons, alt)) = split_conditional_expression(trimmed) {
        return is_simple_expression_string(test.trim())
            && is_simple_expression_string(cons.trim())
            && is_simple_expression_string(alt.trim());
    }

    false
}

fn is_simple_identifier(s: &str) -> bool {
    if s.is_empty() {
        return false;
    }
    let mut chars = s.chars();
    let first = chars.next().unwrap();
    if !first.is_ascii_alphabetic() && first != '_' && first != '$' {
        return false;
    }
    chars.all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '$')
}

fn is_arrow_function(s: &str) -> bool {
    let s = s.trim();

    let s = s.strip_prefix("async").map(|s| s.trim_start()).unwrap_or(s);

    if let Some(arrow_pos) = find_arrow_at_depth_zero(s) {
        let before_arrow = s[..arrow_pos].trim();
        if is_simple_identifier(before_arrow) {
            return true;
        }
        if before_arrow.starts_with('(') && before_arrow.ends_with(')') {
            return true;
        }
    }
    false
}

fn find_arrow_at_depth_zero(s: &str) -> Option<usize> {
    let chars: Vec<char> = s.chars().collect();
    let mut depth = 0;
    let mut in_string = false;
    let mut string_char = ' ';

    for i in 0..chars.len().saturating_sub(1) {
        let c = chars[i];

        if (c == '"' || c == '\'' || c == '`') && (i == 0 || chars[i - 1] != '\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
            continue;
        }

        if in_string {
            continue;
        }

        match c {
            '(' | '[' | '{' => depth += 1,
            ')' | ']' | '}' => depth -= 1,
            '=' if depth == 0 && chars.get(i + 1) == Some(&'>') => {
                return Some(i);
            }
            _ => {}
        }
    }
    None
}

fn is_string_literal(s: &str) -> bool {
    let trimmed = s.trim();
    if trimmed.len() < 2 {
        return false;
    }

    for quote in &['"', '\'', '`'] {
        if trimmed.starts_with(*quote) && trimmed.ends_with(*quote) {
            let inner = &trimmed[1..trimmed.len() - 1];
            let chars: Vec<char> = inner.chars().collect();
            let mut i = 0;
            while i < chars.len() {
                if chars[i] == '\\' && i + 1 < chars.len() {
                    i += 2;
                } else if chars[i] == *quote {
                    return false;
                } else {
                    i += 1;
                }
            }
            return true;
        }
    }
    false
}

fn split_binary_expression(s: &str) -> Option<(&str, &str)> {
    let chars: Vec<char> = s.chars().collect();
    let mut depth = 0;
    let mut in_string = false;
    let mut string_char = ' ';

    for i in (0..chars.len()).rev() {
        let c = chars[i];

        if (c == '"' || c == '\'' || c == '`') && (i == 0 || chars[i - 1] != '\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
            continue;
        }

        if in_string {
            continue;
        }

        match c {
            ')' | ']' | '}' => depth += 1,
            '(' | '[' | '{' => depth -= 1,
            '+' if depth == 0 => {
                let prev = if i > 0 { Some(chars[i - 1]) } else { None };
                let next = chars.get(i + 1).copied();
                if prev != Some('+') && next != Some('+') && next != Some('=') {
                    return Some((&s[..i], &s[i + 1..]));
                }
            }
            _ => {}
        }
    }
    None
}

fn split_logical_expression(s: &str) -> Option<(&str, &str)> {
    let chars: Vec<char> = s.chars().collect();
    let mut depth = 0;
    let mut in_string = false;
    let mut string_char = ' ';

    for i in (0..chars.len().saturating_sub(1)).rev() {
        let c = chars[i];
        let next = chars[i + 1];

        if (c == '"' || c == '\'' || c == '`') && (i == 0 || chars[i - 1] != '\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
            continue;
        }

        if in_string {
            continue;
        }

        match c {
            ')' | ']' | '}' => depth += 1,
            '(' | '[' | '{' => depth -= 1,
            '&' if next == '&' && depth == 0 => {
                return Some((&s[..i], &s[i + 2..]));
            }
            '|' if next == '|' && depth == 0 => {
                return Some((&s[..i], &s[i + 2..]));
            }
            '?' if next == '?' && depth == 0 => {
                return Some((&s[..i], &s[i + 2..]));
            }
            _ => {}
        }
    }
    None
}

fn split_conditional_expression(s: &str) -> Option<(&str, &str, &str)> {
    let chars: Vec<char> = s.chars().collect();
    let mut depth = 0;
    let mut in_string = false;
    let mut string_char = ' ';
    let mut question_pos = None;

    for i in 0..chars.len() {
        let c = chars[i];

        if (c == '"' || c == '\'' || c == '`') && (i == 0 || chars[i - 1] != '\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
            continue;
        }

        if in_string {
            continue;
        }

        match c {
            '(' | '[' | '{' => depth += 1,
            ')' | ']' | '}' => depth -= 1,
            '?' if depth == 0 && chars.get(i + 1) != Some(&'?') => {
                if question_pos.is_none() {
                    question_pos = Some(i);
                }
            }
            ':' if depth == 0 && question_pos.is_some() => {
                let q = question_pos.unwrap();
                return Some((&s[..q], &s[q + 1..i], &s[i + 1..]));
            }
            _ => {}
        }
    }
    None
}

/// Extract variable names from legacy reactive `$:` statements.
pub(crate) fn extract_legacy_reactive_var_declaration(script: &str) -> String {
    let mut reactive_vars: Vec<String> = Vec::new();
    let mut declared_vars: std::collections::HashSet<String> = std::collections::HashSet::new();

    for line in script.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with("$:") {
            continue;
        }
        collect_declared_vars(trimmed, &mut declared_vars);
    }

    for line in script.lines() {
        let trimmed = line.trim();
        if !trimmed.starts_with("$:") {
            continue;
        }
        let after_label = trimmed[2..].trim();

        let after_label = after_label.trim_end_matches(';').trim();
        let unwrapped = if after_label.starts_with('(') && after_label.ends_with(')') {
            after_label[1..after_label.len() - 1].trim()
        } else {
            after_label
        };

        if let Some(eq_pos) = find_assignment_eq(unwrapped) {
            let lhs = unwrapped[..eq_pos].trim();
            extract_identifiers_from_pattern(lhs, &mut reactive_vars, &declared_vars);
        }
    }

    if reactive_vars.is_empty() {
        return String::new();
    }

    let mut seen = std::collections::HashSet::new();
    let unique_vars: Vec<&String> = reactive_vars
        .iter()
        .filter(|v| seen.insert(v.as_str().to_string()))
        .collect();

    format!(
        "\tlet {};",
        unique_vars
            .iter()
            .map(|s| s.as_str())
            .collect::<Vec<_>>()
            .join(", ")
    )
}

fn collect_declared_vars(trimmed: &str, declared: &mut std::collections::HashSet<String>) {
    let decl_rest = trimmed
        .strip_prefix("export let ")
        .or_else(|| trimmed.strip_prefix("export var "))
        .or_else(|| trimmed.strip_prefix("export const "))
        .or_else(|| trimmed.strip_prefix("let "))
        .or_else(|| trimmed.strip_prefix("var "))
        .or_else(|| trimmed.strip_prefix("const "));

    if let Some(rest) = decl_rest {
        let mut depth = 0;
        let mut current = String::new();
        for c in rest.chars() {
            match c {
                '(' | '[' | '{' => {
                    depth += 1;
                    current.push(c);
                }
                ')' | ']' | '}' => {
                    depth -= 1;
                    current.push(c);
                }
                ',' if depth == 0 => {
                    extract_var_name_from_declarator(current.trim(), declared);
                    current.clear();
                }
                ';' if depth == 0 => {
                    extract_var_name_from_declarator(current.trim(), declared);
                    current.clear();
                    break;
                }
                _ => current.push(c),
            }
        }
        let remaining = current.trim().trim_end_matches(';');
        if !remaining.is_empty() {
            extract_var_name_from_declarator(remaining, declared);
        }
    }
}

fn extract_var_name_from_declarator(
    declarator: &str,
    declared: &mut std::collections::HashSet<String>,
) {
    let trimmed = declarator.trim();
    if trimmed.is_empty() {
        return;
    }
    let name_part = if let Some(eq) = trimmed.find('=') {
        trimmed[..eq].trim()
    } else {
        trimmed
    };
    if is_simple_identifier(name_part) {
        declared.insert(name_part.to_string());
    }
}

fn find_assignment_eq(s: &str) -> Option<usize> {
    let chars: Vec<char> = s.chars().collect();
    let mut i = 0;
    let mut depth = 0;

    while i < chars.len() {
        match chars[i] {
            '(' | '[' | '{' => depth += 1,
            ')' | ']' | '}' => depth -= 1,
            '=' if depth == 0 => {
                let next = chars.get(i + 1).copied();
                let prev = if i > 0 { Some(chars[i - 1]) } else { None };
                if next == Some('=') || next == Some('>') {
                    i += 2;
                    continue;
                }
                if let Some(p) = prev
                    && matches!(
                        p,
                        '!' | '<' | '>' | '+' | '-' | '*' | '/' | '%' | '&' | '|' | '^' | '?'
                    )
                {
                    i += 1;
                    continue;
                }
                return Some(i);
            }
            _ => {}
        }
        i += 1;
    }
    None
}

fn extract_identifiers_from_pattern(
    pattern: &str,
    vars: &mut Vec<String>,
    declared: &std::collections::HashSet<String>,
) {
    let trimmed = pattern.trim();

    if trimmed.is_empty() {
        return;
    }

    if is_simple_identifier(trimmed) {
        if !declared.contains(trimmed) {
            vars.push(trimmed.to_string());
        }
        return;
    }

    if trimmed.starts_with('[') && trimmed.ends_with(']') {
        let inner = &trimmed[1..trimmed.len() - 1];
        extract_destructured_names(inner, vars, declared);
        return;
    }

    if trimmed.starts_with('(') && trimmed.ends_with(')') {
        let inner = trimmed[1..trimmed.len() - 1].trim();
        if inner.starts_with('{') && inner.ends_with('}') {
            let obj_inner = &inner[1..inner.len() - 1];
            extract_destructured_names(obj_inner, vars, declared);
        }
        return;
    }

    if trimmed.starts_with('{') && trimmed.ends_with('}') {
        let inner = &trimmed[1..trimmed.len() - 1];
        extract_destructured_names(inner, vars, declared);
    }
}

fn extract_destructured_names(
    inner: &str,
    vars: &mut Vec<String>,
    declared: &std::collections::HashSet<String>,
) {
    let mut depth = 0;
    let mut current = String::new();

    for c in inner.chars() {
        match c {
            '(' | '[' | '{' => {
                depth += 1;
                current.push(c);
            }
            ')' | ']' | '}' => {
                depth -= 1;
                current.push(c);
            }
            ',' if depth == 0 => {
                process_destructured_element(current.trim(), vars, declared);
                current.clear();
            }
            _ => current.push(c),
        }
    }
    let remaining = current.trim().to_string();
    if !remaining.is_empty() {
        process_destructured_element(&remaining, vars, declared);
    }
}

fn process_destructured_element(
    element: &str,
    vars: &mut Vec<String>,
    declared: &std::collections::HashSet<String>,
) {
    let trimmed = element.trim();
    if trimmed.is_empty() {
        return;
    }

    let name = if let Some(rest) = trimmed.strip_prefix("...") {
        rest.trim()
    } else if trimmed.contains(':') {
        let parts: Vec<&str> = trimmed.splitn(2, ':').collect();
        parts[1].trim()
    } else {
        trimmed
    };

    let name = if let Some(eq) = name.find('=') {
        name[..eq].trim()
    } else {
        name
    };

    if is_simple_identifier(name) && !declared.contains(name) {
        vars.push(name.to_string());
    }
}
