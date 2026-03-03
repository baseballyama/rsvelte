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

/// Check if a JavaScript expression string contains `await` at the expression level
/// (not inside nested function expressions or arrow functions).
/// This is used to detect async expression tags that need special handling.
pub(crate) fn expr_contains_await(expr: &str) -> bool {
    let bytes = expr.as_bytes();
    let len = bytes.len();
    let mut i = 0;

    while i < len {
        let ch = bytes[i];

        // Skip string literals
        if ch == b'\'' || ch == b'"' || ch == b'`' {
            i = skip_string_literal(bytes, i);
            continue;
        }

        // Skip single-line comments
        if ch == b'/' && i + 1 < len && bytes[i + 1] == b'/' {
            while i < len && bytes[i] != b'\n' {
                i += 1;
            }
            continue;
        }

        // Skip multi-line comments
        if ch == b'/' && i + 1 < len && bytes[i + 1] == b'*' {
            i += 2;
            while i + 1 < len && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                i += 1;
            }
            i += 2;
            continue;
        }

        // Check for `function` keyword - skip function body
        if ch == b'f' && i + 8 <= len && &expr[i..i + 8] == "function" {
            let next = if i + 8 < len { bytes[i + 8] } else { 0 };
            if next == b' ' || next == b'(' || next == b'*' {
                i += 8;
                // Find the opening brace and skip the body
                while i < len && bytes[i] != b'{' {
                    if bytes[i] == b'\'' || bytes[i] == b'"' || bytes[i] == b'`' {
                        i = skip_string_literal(bytes, i);
                        continue;
                    }
                    i += 1;
                }
                if i < len {
                    i = skip_braces(bytes, i);
                }
                continue;
            }
        }

        // Check for arrow function `=> {` - skip the block body
        if ch == b'=' && i + 1 < len && bytes[i + 1] == b'>' {
            i += 2;
            // Skip whitespace
            while i < len && matches!(bytes[i], b' ' | b'\n' | b'\t' | b'\r') {
                i += 1;
            }
            if i < len && bytes[i] == b'{' {
                i = skip_braces(bytes, i);
                continue;
            }
            continue;
        }

        // Check for `await` keyword
        if ch == b'a' && i + 5 <= len && &expr[i..i + 5] == "await" {
            let before_ok = i == 0
                || !bytes[i - 1].is_ascii_alphanumeric()
                    && bytes[i - 1] != b'_'
                    && bytes[i - 1] != b'$';
            let after = if i + 5 < len { bytes[i + 5] } else { 0 };
            let after_ok = !after.is_ascii_alphanumeric() && after != b'_' && after != b'$';
            if before_ok && after_ok {
                return true;
            }
        }

        i += 1;
    }

    false
}

/// Skip a string literal starting at `start` (handling ', ", and ` with interpolation).
fn skip_string_literal(bytes: &[u8], start: usize) -> usize {
    let quote = bytes[start];
    let mut i = start + 1;
    let len = bytes.len();

    if quote == b'`' {
        while i < len {
            if bytes[i] == b'\\' {
                i += 2;
                continue;
            }
            if bytes[i] == b'`' {
                return i + 1;
            }
            if bytes[i] == b'$' && i + 1 < len && bytes[i + 1] == b'{' {
                i += 2;
                let mut depth = 1i32;
                while i < len && depth > 0 {
                    if bytes[i] == b'{' {
                        depth += 1;
                    } else if bytes[i] == b'}' {
                        depth -= 1;
                    } else if matches!(bytes[i], b'\'' | b'"' | b'`') {
                        i = skip_string_literal(bytes, i);
                        continue;
                    }
                    i += 1;
                }
                continue;
            }
            i += 1;
        }
    } else {
        while i < len {
            if bytes[i] == b'\\' {
                i += 2;
                continue;
            }
            if bytes[i] == quote {
                return i + 1;
            }
            i += 1;
        }
    }

    i
}

/// Skip a matched brace pair `{...}` starting at position of `{`.
fn skip_braces(bytes: &[u8], start: usize) -> usize {
    let mut depth = 1i32;
    let mut i = start + 1;
    let len = bytes.len();

    while i < len && depth > 0 {
        let c = bytes[i];
        if matches!(c, b'\'' | b'"' | b'`') {
            i = skip_string_literal(bytes, i);
            continue;
        }
        if c == b'{' {
            depth += 1;
        } else if c == b'}' {
            depth -= 1;
        }
        i += 1;
    }

    i
}

/// Transform `await expr` patterns inside an expression to use `$.save()`.
/// Converts: `await expr` -> `(await $.save(expr))()`
/// This handles multiple await expressions within the same expression.
pub(crate) fn transform_await_to_save(expr: &str) -> String {
    let bytes = expr.as_bytes();
    let len = bytes.len();
    let mut result = String::with_capacity(len + 20);
    let mut i = 0;

    while i < len {
        let ch = bytes[i];

        // Skip string literals
        if ch == b'\'' || ch == b'"' || ch == b'`' {
            let end = skip_string_literal(bytes, i);
            result.push_str(&expr[i..end]);
            i = end;
            continue;
        }

        // Check for `await` keyword
        if ch == b'a' && i + 5 <= len && &expr[i..i + 5] == "await" {
            let before_ok = i == 0
                || !bytes[i - 1].is_ascii_alphanumeric()
                    && bytes[i - 1] != b'_'
                    && bytes[i - 1] != b'$';
            let after = if i + 5 < len { bytes[i + 5] } else { 0 };
            let after_ok = !after.is_ascii_alphanumeric() && after != b'_' && after != b'$';
            if before_ok && after_ok {
                // Found `await` - extract the argument expression
                i += 5;
                // Skip whitespace after `await`
                while i < len && matches!(bytes[i], b' ' | b'\n' | b'\t' | b'\r') {
                    i += 1;
                }
                // Extract the await argument (everything until end of expression,
                // respecting parentheses and operator precedence)
                let arg_start = i;
                let arg_end = find_await_arg_end(bytes, i, len);
                let arg = &expr[arg_start..arg_end];
                result.push_str(&format!("(await $.save({}))()", arg));
                i = arg_end;
                continue;
            }
        }

        result.push(ch as char);
        i += 1;
    }

    result
}

/// Find the end of an `await` argument expression.
/// The argument includes everything up to the next operator at the same depth level,
/// or the end of the expression.
fn find_await_arg_end(bytes: &[u8], start: usize, len: usize) -> usize {
    let mut i = start;
    let mut depth: i32 = 0;

    while i < len {
        let ch = bytes[i];

        if matches!(ch, b'\'' | b'"' | b'`') {
            i = skip_string_literal(bytes, i);
            continue;
        }

        match ch {
            b'(' | b'[' => depth += 1,
            b')' | b']' => {
                if depth == 0 {
                    return i;
                }
                depth -= 1;
            }
            b',' if depth == 0 => return i,
            _ => {}
        }

        i += 1;
    }

    len
}

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

/// Replace an identifier in an expression with a replacement, being careful
/// to only replace whole-word occurrences (not substrings of other identifiers).
pub(crate) fn replace_identifier_in_expr(expr: &str, from: &str, to: &str) -> String {
    if !expr.contains(from) {
        return expr.to_string();
    }

    let chars: Vec<char> = expr.chars().collect();
    let from_chars: Vec<char> = from.chars().collect();
    let from_len = from_chars.len();
    let mut result = String::with_capacity(expr.len() + to.len());
    let mut i = 0;

    while i < chars.len() {
        // Check if we have a match at position i
        if i + from_len <= chars.len() && chars[i..i + from_len] == from_chars[..] {
            // Check that the character before is not an identifier char
            let before_ok = if i == 0 {
                true
            } else {
                let c = chars[i - 1];
                !c.is_alphanumeric() && c != '_' && c != '$'
            };

            // Check that the character after is not an identifier char
            let after_ok = if i + from_len >= chars.len() {
                true
            } else {
                let c = chars[i + from_len];
                !c.is_alphanumeric() && c != '_' && c != '$'
            };

            if before_ok && after_ok {
                result.push_str(to);
                i += from_len;
                continue;
            }
        }
        result.push(chars[i]);
        i += 1;
    }

    result
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

/// Extract let directive parameter patterns including aliases.
/// Returns strings like "thing" or "thing: x" (for let:thing={x}).
/// These are used as object destructuring property patterns.
pub(crate) fn get_let_directive_params(
    attrs: &[crate::ast::template::Attribute],
    source: &str,
) -> Vec<String> {
    attrs
        .iter()
        .filter_map(|attr| {
            if let crate::ast::template::Attribute::LetDirective(let_dir) = attr {
                let name = let_dir.name.as_str();
                if let Some(ref expr) = let_dir.expression {
                    // Get the expression source text
                    let expr_start = expr.start().unwrap_or(0) as usize;
                    let expr_end = expr.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= source.len() {
                        let expr_src = source[expr_start..expr_end].trim();
                        // Check if expression is the same as name (no alias needed)
                        if expr_src != name {
                            // It's an alias: generate "name: alias"
                            return Some(format!("{}: {}", name, expr_src));
                        }
                    }
                }
                Some(name.to_string())
            } else {
                None
            }
        })
        .collect()
}

/// Collapse whitespace sequences (including newlines) to single spaces.
/// This matches the behavior of clean_nodes in the official compiler.
/// Check if a character is "collapsible" whitespace (NOT non-breaking space).
/// Non-breaking space (U+00A0) must be preserved as-is, not collapsed.
fn is_collapsible_whitespace(c: char) -> bool {
    c != '\u{00A0}' && c.is_whitespace()
}

pub(crate) fn collapse_whitespace(s: &str) -> String {
    let trimmed: String = s
        .chars()
        .skip_while(|c| is_collapsible_whitespace(*c))
        .collect::<String>()
        .chars()
        .rev()
        .skip_while(|c| is_collapsible_whitespace(*c))
        .collect::<String>()
        .chars()
        .rev()
        .collect();
    let has_leading_ws = s.chars().next().is_some_and(is_collapsible_whitespace);
    let has_trailing_ws = s.chars().last().is_some_and(is_collapsible_whitespace);

    // Collapse internal whitespace sequences to single spaces
    let mut result = String::new();
    let mut in_whitespace = false;

    if has_leading_ws {
        result.push(' ');
    }

    for c in trimmed.chars() {
        if is_collapsible_whitespace(c) {
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

    if trimmed.len() >= 2
        && ((trimmed.starts_with('\'') && trimmed.ends_with('\''))
            || (trimmed.starts_with('"') && trimmed.ends_with('"')))
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

    // Handle comparison operators: ===, !==, ==, !=, <, >, <=, >=
    // and arithmetic operators: +, -, *, /, %
    for &op in &[
        "===", "!==", "==", "!=", "<=", ">=", "<", ">", "+", "-", "*", "/", "%",
    ] {
        if let Some(idx) = trimmed.find(op) {
            // Avoid false matches (e.g., '===' in '!==')
            let left = trimmed[..idx].trim();
            let right = trimmed[idx + op.len()..].trim();

            let left_result = try_constant_fold_full(left);
            let right_result = try_constant_fold_full(right);

            if let (ConstantFoldResult::Constant(l), ConstantFoldResult::Constant(r)) =
                (&left_result, &right_result)
            {
                let l_num = l.parse::<f64>().ok();
                let r_num = r.parse::<f64>().ok();

                if let (Some(ln), Some(rn)) = (l_num, r_num) {
                    let result = match op {
                        "===" | "==" => Some(format!("{}", (ln - rn).abs() < f64::EPSILON)),
                        "!==" | "!=" => Some(format!("{}", (ln - rn).abs() >= f64::EPSILON)),
                        "<" => Some(format!("{}", ln < rn)),
                        ">" => Some(format!("{}", ln > rn)),
                        "<=" => Some(format!("{}", ln <= rn)),
                        ">=" => Some(format!("{}", ln >= rn)),
                        "+" => {
                            let res = ln + rn;
                            if res.fract() == 0.0 {
                                Some(format!("{}", res as i64))
                            } else {
                                Some(res.to_string())
                            }
                        }
                        "-" => {
                            let res = ln - rn;
                            if res.fract() == 0.0 {
                                Some(format!("{}", res as i64))
                            } else {
                                Some(res.to_string())
                            }
                        }
                        "*" => {
                            let res = ln * rn;
                            if res.fract() == 0.0 {
                                Some(format!("{}", res as i64))
                            } else {
                                Some(res.to_string())
                            }
                        }
                        "/" if rn != 0.0 => {
                            let res = ln / rn;
                            if res.fract() == 0.0 {
                                Some(format!("{}", res as i64))
                            } else {
                                Some(res.to_string())
                            }
                        }
                        "%" if rn != 0.0 => {
                            let res = ln % rn;
                            if res.fract() == 0.0 {
                                Some(format!("{}", res as i64))
                            } else {
                                Some(res.to_string())
                            }
                        }
                        _ => None,
                    };
                    if let Some(r) = result {
                        return ConstantFoldResult::Constant(r);
                    }
                }

                // String comparison for === and !==
                match op {
                    "===" => {
                        return ConstantFoldResult::Constant(format!("{}", l == r));
                    }
                    "!==" => {
                        return ConstantFoldResult::Constant(format!("{}", l != r));
                    }
                    _ => {}
                }
            }
        }
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

            // Handle comma-separated declarations like `const a = 1, b = 2, c = 3;`
            // Split at top-level commas (not inside brackets/parens)
            let declarators = split_declarators(rest);

            for declarator in &declarators {
                let decl = declarator.trim().trim_end_matches(';');
                if let Some(eq_idx) = decl.find('=') {
                    let name = decl[..eq_idx].trim();
                    let value = decl[eq_idx + 1..].trim();

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

                    // Check if this is a reassignment (not a declaration)
                    // A declaration would be preceded by `let ` or `var ` or `const `
                    let is_decl = abs_pos > 0 && {
                        let before = &trimmed[..abs_pos];
                        let before_trimmed = before.trim();
                        before_trimmed == "let"
                            || before_trimmed == "var"
                            || before_trimmed == "const"
                            || before_trimmed.ends_with(" let")
                            || before_trimmed.ends_with(" var")
                            || before_trimmed.ends_with(" const")
                    };

                    if !is_decl {
                        if (rest.starts_with('=')
                            && !rest.starts_with("==")
                            && !rest.starts_with("=>"))
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

                    // Skip trailing semicolons, whitespace, and newline
                    while end < len && (chars[end] == ' ' || chars[end] == '\t') {
                        end += 1;
                    }
                    if end < len && chars[end] == ';' {
                        end += 1; // skip trailing semicolon
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

/// Split a variable declaration's declarator list by top-level commas.
/// Handles `a = 1, b = 2, c = 3` -> ["a = 1", "b = 2", "c = 3"]
/// Respects nesting: commas inside parens, brackets, braces, strings, and template literals
/// are not treated as separators.
fn split_declarators(s: &str) -> Vec<&str> {
    let mut parts = Vec::new();
    let mut depth = 0i32;
    let mut start = 0;
    let bytes = s.as_bytes();
    let mut i = 0;
    let len = bytes.len();

    while i < len {
        match bytes[i] {
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => depth -= 1,
            b'\'' | b'"' => {
                let quote = bytes[i];
                i += 1;
                while i < len && bytes[i] != quote {
                    if bytes[i] == b'\\' {
                        i += 1; // skip escaped char
                    }
                    i += 1;
                }
            }
            b'`' => {
                // Template literal - skip to matching backtick
                i += 1;
                let mut tmpl_depth = 0i32;
                while i < len {
                    if bytes[i] == b'`' && tmpl_depth == 0 {
                        break;
                    }
                    if bytes[i] == b'\\' {
                        i += 1;
                    } else if bytes[i] == b'$' && i + 1 < len && bytes[i + 1] == b'{' {
                        tmpl_depth += 1;
                        i += 1;
                    } else if bytes[i] == b'}' && tmpl_depth > 0 {
                        tmpl_depth -= 1;
                    }
                    i += 1;
                }
            }
            b',' if depth == 0 => {
                parts.push(&s[start..i]);
                start = i + 1;
            }
            _ => {}
        }
        i += 1;
    }
    parts.push(&s[start..]);
    parts
}

/// Find all blocker indices referenced by an expression.
///
/// Scans an expression string for identifiers that appear in the blocker_map
/// and returns a deduplicated, sorted list of blocker indices (for $$promises[N]).
///
/// This is used to determine if an expression tag or if-block test needs to be
/// wrapped in `$$renderer.async()` or `$$renderer.async_block()`.
pub(crate) fn find_expression_blockers(
    expr: &str,
    blocker_map: &std::collections::HashMap<String, usize>,
) -> Vec<usize> {
    if blocker_map.is_empty() {
        return Vec::new();
    }

    let mut blockers = std::collections::BTreeSet::new();
    let bytes = expr.as_bytes();
    let len = bytes.len();
    let mut i = 0;

    while i < len {
        let ch = bytes[i];

        // Skip string literals
        if ch == b'\'' || ch == b'"' || ch == b'`' {
            i = skip_string_literal(bytes, i);
            continue;
        }

        // Skip comments
        if ch == b'/' && i + 1 < len {
            if bytes[i + 1] == b'/' {
                while i < len && bytes[i] != b'\n' {
                    i += 1;
                }
                continue;
            }
            if bytes[i + 1] == b'*' {
                i += 2;
                while i + 1 < len && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                    i += 1;
                }
                i += 2;
                continue;
            }
        }

        // Check for identifier start
        if ch.is_ascii_alphabetic() || ch == b'_' || ch == b'$' {
            let start = i;
            while i < len
                && (bytes[i].is_ascii_alphanumeric() || bytes[i] == b'_' || bytes[i] == b'$')
            {
                i += 1;
            }
            let ident = &expr[start..i];

            // Check if preceded by a dot (member expression like obj.prop - skip)
            if start > 0 && bytes[start - 1] == b'.' {
                continue;
            }

            if let Some(&blocker_idx) = blocker_map.get(ident) {
                blockers.insert(blocker_idx);
            }
            continue;
        }

        i += 1;
    }

    blockers.into_iter().collect()
}
