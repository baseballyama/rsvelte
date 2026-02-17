//! Helper functions for server-side code generation.
//!
//! This module contains standalone utility functions used by the server-side
//! visitor implementations. These were extracted from `transform_server.rs`
//! to keep the visitor files focused on their specific AST node handling.

use super::types::{ConstantFoldResult, OutputPart};
use crate::ast::template::{Attribute, AttributeValue, AttributeValuePart, Script, TemplateNode};
use rustc_hash::FxHashMap;

// Re-export from sibling modules for backward compatibility
pub(crate) use super::transform_legacy::*;
pub(crate) use super::transform_script::*;
pub(crate) use super::transform_store::*;

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
/// - `c?: number` -> `c` (optional parameter)
/// - `c: number = 4` -> `c = 4` (with default value)
/// - `c?: number = 5` -> `c = 5` (optional with default)
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

    // Handle simple identifier with optional marker and type annotation:
    // - `name: Type`
    // - `name?: Type`
    // - `name: Type = default`
    // - `name?: Type = default`
    // - `name = default` (no type annotation, just default)
    //
    // Strategy: extract the identifier name, then check for `= default` after type

    // Check for `?:` (optional typed) or `:` (typed)
    let (ident_end, type_start) = if let Some(qc_pos) = trimmed.find("?:") {
        // `name?: Type`
        (qc_pos, Some(qc_pos + 2))
    } else if let Some(colon_pos) = trimmed.find(':') {
        let before = trimmed[..colon_pos].trim();
        if is_valid_js_identifier(before) {
            (colon_pos, Some(colon_pos + 1))
        } else {
            // Not a simple identifier before colon (e.g., destructuring rename)
            return trimmed.to_string();
        }
    } else if let Some(q_pos) = trimmed.find('?') {
        // `name?` (optional without type) - strip the `?`
        let before = trimmed[..q_pos].trim();
        if is_valid_js_identifier(before) {
            // Check for `= default` after `?`
            let after = trimmed[q_pos + 1..].trim();
            if let Some(stripped) = after.strip_prefix('=') {
                return format!("{} = {}", before, stripped.trim());
            }
            return before.to_string();
        }
        return trimmed.to_string();
    } else {
        // No type annotation at all
        return trimmed.to_string();
    };

    let ident = trimmed[..ident_end].trim();

    // Now look for `= default` after the type annotation
    if let Some(ts) = type_start {
        let after_type = trimmed[ts..].trim();
        // Find the `=` that represents the default value.
        // The `=` might be after a type expression like `number = 4`
        if let Some(eq_pos) = after_type.find('=') {
            let default_val = after_type[eq_pos + 1..].trim();
            if !default_val.is_empty() {
                return format!("{} = {}", ident, default_val);
            }
        }
    }

    ident.to_string()
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

    // Handle && operator: if left is known and falsy, result is left's value
    if let Some(idx) = trimmed.find("&&") {
        let left = trimmed[..idx].trim();
        let right = trimmed[idx + 2..].trim();

        match try_constant_fold_full(left) {
            ConstantFoldResult::Null => {
                // null && anything => null
                return ConstantFoldResult::Null;
            }
            ConstantFoldResult::Constant(val) => {
                // Check if the constant value is falsy
                if is_constant_falsy(&val) {
                    // false && anything => false, 0 && anything => 0, '' && anything => ''
                    return ConstantFoldResult::Constant(val);
                }
                // Truthy left side, result is right side
                return try_constant_fold_full(right);
            }
            ConstantFoldResult::Dynamic => {}
        }
    }

    // Handle || operator: if left is known and truthy, result is left's value
    if let Some(idx) = trimmed.find("||") {
        // Make sure it's not inside ?? (e.g., a ?? b || c)
        let left = trimmed[..idx].trim();
        let right = trimmed[idx + 2..].trim();

        match try_constant_fold_full(left) {
            ConstantFoldResult::Null => {
                // null || anything => anything
                return try_constant_fold_full(right);
            }
            ConstantFoldResult::Constant(val) => {
                if is_constant_falsy(&val) {
                    // falsy || anything => anything
                    return try_constant_fold_full(right);
                }
                // Truthy left side, result is left
                return ConstantFoldResult::Constant(val);
            }
            ConstantFoldResult::Dynamic => {}
        }
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

/// Check if a constant folded value is falsy in JavaScript.
/// This is for string representations of constant values.
fn is_constant_falsy(val: &str) -> bool {
    val.is_empty() || val == "0" || val == "false" || val == "NaN"
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
/// Try to parse a value as a constant literal and insert into the constants map.
/// Returns true if the value was successfully inserted.
fn try_insert_constant_value(
    value: &str,
    name: &str,
    constants: &mut FxHashMap<String, String>,
) -> bool {
    if (value.starts_with('\'') && value.ends_with('\''))
        || (value.starts_with('"') && value.ends_with('"'))
        || (value.starts_with('`') && value.ends_with('`') && !value.contains("${"))
    {
        let content = &value[1..value.len() - 1];
        constants.insert(name.to_string(), content.to_string());
        true
    } else if value == "true" || value == "false" || value == "null" || value == "undefined" {
        constants.insert(name.to_string(), value.to_string());
        true
    } else if let Ok(n) = value.parse::<i64>() {
        constants.insert(name.to_string(), n.to_string());
        true
    } else if let Ok(n) = value.parse::<f64>() {
        if n.is_finite() {
            constants.insert(name.to_string(), n.to_string());
            true
        } else {
            false
        }
    } else {
        false
    }
}

/// Try to evaluate an expression using known constants.
/// Returns Some(value) if the expression can be fully evaluated.
pub(crate) fn try_evaluate_with_constants(
    expr: &str,
    constants: &FxHashMap<String, String>,
) -> Option<String> {
    let trimmed = expr.trim();

    // Simple variable lookup
    if let Some(value) = constants.get(trimmed) {
        return Some(value.clone());
    }

    // Literal values
    if let Ok(n) = trimmed.parse::<i64>() {
        return Some(n.to_string());
    }
    if let Ok(n) = trimmed.parse::<f64>()
        && n.is_finite()
    {
        return Some(n.to_string());
    }
    if (trimmed.starts_with('\'') && trimmed.ends_with('\''))
        || (trimmed.starts_with('"') && trimmed.ends_with('"'))
    {
        return Some(trimmed[1..trimmed.len() - 1].to_string());
    }

    // Handle binary operators: *, +, -
    // Try * first (higher precedence)
    if let Some(idx) = trimmed.find(" * ") {
        let left = trimmed[..idx].trim();
        let right = trimmed[idx + 3..].trim();
        if let (Some(l), Some(r)) = (
            try_evaluate_with_constants(left, constants),
            try_evaluate_with_constants(right, constants),
        ) {
            if let (Ok(ln), Ok(rn)) = (l.parse::<i64>(), r.parse::<i64>()) {
                return Some((ln * rn).to_string());
            }
            if let (Ok(ln), Ok(rn)) = (l.parse::<f64>(), r.parse::<f64>())
                && (ln * rn).is_finite()
            {
                let result = ln * rn;
                if result == (result as i64) as f64 {
                    return Some((result as i64).to_string());
                }
                return Some(result.to_string());
            }
        }
    }

    // Handle + (addition or string concatenation)
    // Find the + that's not inside quotes
    if let Some(idx) = find_binary_plus(trimmed) {
        let left = trimmed[..idx].trim();
        let right = trimmed[idx + 1..].trim();
        if let (Some(l), Some(r)) = (
            try_evaluate_with_constants(left, constants),
            try_evaluate_with_constants(right, constants),
        ) {
            // Try numeric addition first
            if let (Ok(ln), Ok(rn)) = (l.parse::<i64>(), r.parse::<i64>()) {
                return Some((ln + rn).to_string());
            }
            if let (Ok(ln), Ok(rn)) = (l.parse::<f64>(), r.parse::<f64>())
                && (ln + rn).is_finite()
            {
                let result = ln + rn;
                if result == (result as i64) as f64 {
                    return Some((result as i64).to_string());
                }
                return Some(result.to_string());
            }
            // String concatenation
            return Some(format!("{}{}", l, r));
        }
    }

    // Handle - (subtraction)
    // Find - that's a binary operator (not unary minus)
    if let Some(idx) = find_binary_minus(trimmed) {
        let left = trimmed[..idx].trim();
        let right = trimmed[idx + 1..].trim();
        if let (Some(l), Some(r)) = (
            try_evaluate_with_constants(left, constants),
            try_evaluate_with_constants(right, constants),
        ) && let (Ok(ln), Ok(rn)) = (l.parse::<i64>(), r.parse::<i64>())
        {
            return Some((ln - rn).to_string());
        }
    }

    None
}

/// Find the index of a binary + operator (not inside quotes or after another operator).
fn find_binary_plus(expr: &str) -> Option<usize> {
    let bytes = expr.as_bytes();
    let mut in_single_quote = false;
    let mut in_double_quote = false;
    let mut paren_depth = 0;

    for i in 0..bytes.len() {
        match bytes[i] {
            b'\'' if !in_double_quote => in_single_quote = !in_single_quote,
            b'"' if !in_single_quote => in_double_quote = !in_double_quote,
            b'(' if !in_single_quote && !in_double_quote => paren_depth += 1,
            b')' if !in_single_quote && !in_double_quote => paren_depth -= 1,
            b'+' if !in_single_quote && !in_double_quote && paren_depth == 0 => {
                // Make sure it's a binary +, not unary
                // Check that there's a non-whitespace token before it
                let before = expr[..i].trim_end();
                if !before.is_empty()
                    && !before.ends_with('+')
                    && !before.ends_with('-')
                    && !before.ends_with('*')
                    && !before.ends_with('/')
                    && !before.ends_with('=')
                    && !before.ends_with('(')
                {
                    // Make sure it's not ++ or +=
                    if i + 1 < bytes.len() && (bytes[i + 1] == b'+' || bytes[i + 1] == b'=') {
                        continue;
                    }
                    return Some(i);
                }
            }
            _ => {}
        }
    }
    None
}

/// Find the index of a binary - operator (not unary minus).
fn find_binary_minus(expr: &str) -> Option<usize> {
    let bytes = expr.as_bytes();
    let mut in_single_quote = false;
    let mut in_double_quote = false;
    let mut paren_depth = 0;

    for i in 0..bytes.len() {
        match bytes[i] {
            b'\'' if !in_double_quote => in_single_quote = !in_single_quote,
            b'"' if !in_single_quote => in_double_quote = !in_double_quote,
            b'(' if !in_single_quote && !in_double_quote => paren_depth += 1,
            b')' if !in_single_quote && !in_double_quote => paren_depth -= 1,
            b'-' if !in_single_quote && !in_double_quote && paren_depth == 0 => {
                let before = expr[..i].trim_end();
                if !before.is_empty()
                    && !before.ends_with('+')
                    && !before.ends_with('-')
                    && !before.ends_with('*')
                    && !before.ends_with('/')
                    && !before.ends_with('=')
                    && !before.ends_with('(')
                {
                    if i + 1 < bytes.len() && (bytes[i + 1] == b'-' || bytes[i + 1] == b'=') {
                        continue;
                    }
                    return Some(i);
                }
            }
            _ => {}
        }
    }
    None
}

/// Strip TypeScript syntax from a $derived inner expression for constant folding.
/// Uses the full TypeScript parser for accurate stripping.
pub(crate) fn strip_ts_from_derived_inner(expr: &str, is_typescript: bool) -> String {
    if !is_typescript {
        return expr.to_string();
    }
    // Wrap as a variable declaration for the TS parser
    let wrapped = format!("var _ = {};", expr);
    let stripped = crate::compiler::phases::phase2_analyze::types::strip_typescript(&wrapped);
    // Unwrap back: remove "var _ = " prefix and ";" suffix
    let stripped = stripped.trim();
    if let Some(rest) = stripped.strip_prefix("var _ = ") {
        rest.trim_end_matches(';').trim().to_string()
    } else {
        expr.to_string()
    }
}

/// Extract the inner expression from a rune call like `$state(expr)` or `$derived(expr)`.
/// Returns the inner expression string if the pattern matches.
pub(crate) fn extract_rune_inner(value: &str, prefix: &str) -> Option<String> {
    let trimmed = value.trim();
    if !trimmed.starts_with(prefix) {
        return None;
    }
    let after_prefix = &trimmed[prefix.len()..];
    // Find matching closing paren
    let mut depth = 1i32;
    let mut in_string = false;
    let mut string_char = ' ';
    for (i, c) in after_prefix.char_indices() {
        if (c == '"' || c == '\'' || c == '`')
            && (i == 0 || after_prefix.as_bytes()[i - 1] != b'\\')
        {
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
                    let inner = after_prefix[..i].trim().to_string();
                    if inner.is_empty() {
                        return Some("void 0".to_string());
                    }
                    return Some(inner);
                }
            }
            _ => {}
        }
    }
    None
}

pub(crate) fn extract_constant_vars(script: &str, full_source: &str) -> FxHashMap<String, String> {
    let mut constants = FxHashMap::default();
    let mut let_vars: Vec<String> = Vec::new();
    // Collect unresolved expressions for a second pass
    let mut unresolved: Vec<(String, String, bool)> = Vec::new(); // (name, expr, is_const)

    // First pass: extract constants from non-rune declarations
    for line in script.lines() {
        let trimmed = line.trim();

        // Skip lines with $state, $derived, or $props - these are reactive and
        // require proper scope analysis to constant-fold safely
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

                if try_insert_constant_value(value, name, &mut constants) {
                    if !is_const {
                        let_vars.push(name.to_string());
                    }
                } else {
                    // Save for second pass - might be evaluable once we know more constants
                    unresolved.push((name.to_string(), value.to_string(), is_const));
                }
            }
        }
    }

    // Second pass: try to evaluate expressions using the constants we've gathered
    for (name, expr, is_const) in &unresolved {
        if let Some(value) = try_evaluate_with_constants(expr, &constants) {
            constants.insert(name.clone(), value);
            if !is_const {
                let_vars.push(name.clone());
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
