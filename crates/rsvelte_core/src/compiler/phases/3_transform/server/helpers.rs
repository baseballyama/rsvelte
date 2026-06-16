//! Helper functions for server-side code generation.
//!
//! This module contains standalone utility functions used by the server-side
//! visitor implementations. These were extracted from `transform_server.rs`
//! to keep the visitor files focused on their specific AST node handling.

use super::types::{ConstantFoldResult, OutputPart};
use crate::ast::template::{Attribute, AttributeValue, AttributeValuePart, Script, TemplateNode};
use memchr::memmem;
use rustc_hash::FxHashMap;
use std::fmt::Write as _;

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
        if ch == b'f' && i + 8 <= len && &bytes[i..i + 8] == b"function" {
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
        if ch == b'a' && i + 5 <= len && &bytes[i..i + 5] == b"await" {
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
pub(crate) fn skip_string_literal(bytes: &[u8], start: usize) -> usize {
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
///
/// Prefers the AST-based rewrite (`await_save_ast`), which reads each
/// operand's extent from its parsed span and therefore can't mis-bound the
/// operand the way a hand-rolled scanner does (e.g. swallowing a ternary's
/// `: alternate` — issue #1036 bug 2). Falls back to the legacy byte scanner
/// only when the expression doesn't parse cleanly as a standalone expression.
pub(crate) fn transform_await_to_save(expr: &str) -> String {
    if let Some(out) = super::await_save_ast::transform_await_to_save_ast(expr) {
        return out;
    }
    transform_await_to_save_textual(expr)
}

/// Legacy byte-scanning implementation of [`transform_await_to_save`], kept as
/// a fallback for inputs that don't parse as a standalone expression.
fn transform_await_to_save_textual(expr: &str) -> String {
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
        if ch == b'a' && i + 5 <= len && &bytes[i..i + 5] == b"await" {
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
                let arg = expr[arg_start..arg_end].trim_end();
                // Recursively transform any nested await expressions within the argument
                let transformed_arg = if expr_contains_await(arg) {
                    transform_await_to_save(arg)
                } else {
                    arg.to_string()
                };
                let _ = write!(result, "(await $.save({}))()", transformed_arg);
                // If the next character is a binary operator (not whitespace/end),
                // add a space to maintain readable formatting.
                if arg_end < len
                    && !matches!(
                        bytes[arg_end],
                        b' ' | b'\t' | b'\n' | b'\r' | b')' | b']' | b',' | b';'
                    )
                {
                    result.push(' ');
                }
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
///
/// `await` has unary-expression precedence, so it only binds to the
/// immediate operand — **not** to binary/comparison operators beyond it.
/// For example, `await foo > 10` is parsed as `(await foo) > 10`, so
/// the argument to `await` is just `foo`.
///
/// This function scans forward from `start` collecting the operand of
/// `await`.  It stops when it hits a binary operator (`>`, `+`, `&&`,
/// `||`, `??`, etc.) at depth 0, a comma, or end-of-string.
fn find_await_arg_end(bytes: &[u8], start: usize, len: usize) -> usize {
    let mut i = start;
    let mut paren_depth: i32 = 0; // tracks () and []
    let mut brace_depth: i32 = 0; // tracks {}
    // Track whether we've seen a primary expression (identifier, call, etc.)
    // to distinguish unary prefix `-`/`+` from binary `-`/`+`.
    let mut seen_primary = false;

    while i < len {
        let ch = bytes[i];

        // Skip whitespace - don't change seen_primary
        if matches!(ch, b' ' | b'\t' | b'\n' | b'\r') {
            i += 1;
            continue;
        }

        if matches!(ch, b'\'' | b'"' | b'`') {
            i = skip_string_literal(bytes, i);
            seen_primary = true;
            continue;
        }

        match ch {
            b'(' | b'[' => {
                paren_depth += 1;
                // If at depth 0, this starts a grouped expression or call
            }
            b')' | b']' => {
                if paren_depth == 0 && brace_depth == 0 {
                    return i;
                }
                if paren_depth > 0 {
                    paren_depth -= 1;
                }
                if paren_depth == 0 && brace_depth == 0 {
                    seen_primary = true;
                }
            }
            b'{' => brace_depth += 1,
            b'}' => {
                if brace_depth > 0 {
                    brace_depth -= 1;
                    if brace_depth == 0 && paren_depth == 0 {
                        return i + 1; // include the closing }
                    }
                } else if paren_depth == 0 {
                    return i;
                }
            }
            b',' if paren_depth == 0 && brace_depth == 0 => return i,
            // Binary/comparison operators at the top level end the await arg,
            // but only if we've already seen a primary expression (to distinguish
            // unary prefix operators from binary operators).
            b'>' if paren_depth == 0 && brace_depth == 0 && seen_primary => {
                // Don't treat `=>` as a binary operator
                if i > 0 && bytes[i - 1] == b'=' {
                    i += 1;
                    continue;
                }
                return i;
            }
            b'<' if paren_depth == 0 && brace_depth == 0 && seen_primary => {
                return i;
            }
            b'+' | b'-' if paren_depth == 0 && brace_depth == 0 && seen_primary => {
                // Binary + or - (we've already seen a primary expression)
                return i;
            }
            b'*' | b'/' | b'%' | b'^' | b'~'
                if paren_depth == 0 && brace_depth == 0 && seen_primary =>
            {
                // `**` (exponentiation) or single `*`, `/`, `%`, etc.
                return i;
            }
            b'&' if paren_depth == 0 && brace_depth == 0 && seen_primary => {
                return i;
            }
            b'|' if paren_depth == 0 && brace_depth == 0 && seen_primary => {
                return i;
            }
            b'?' if paren_depth == 0 && brace_depth == 0 && seen_primary => {
                // Optional chaining `?.` should NOT end the arg
                if i + 1 < len && bytes[i + 1] == b'.' {
                    i += 2;
                    continue;
                }
                return i;
            }
            b'=' if paren_depth == 0 && brace_depth == 0 && seen_primary => {
                if i + 1 < len && bytes[i + 1] == b'=' {
                    return i;
                }
                if i + 1 < len && bytes[i + 1] == b'>' {
                    i += 2;
                    continue;
                }
                return i;
            }
            b'!' if paren_depth == 0 && brace_depth == 0 => {
                if i + 1 < len && bytes[i + 1] == b'=' && seen_primary {
                    return i;
                }
                // Prefix `!` is fine
            }
            _ => {
                // Identifiers, digits, dots, etc. are part of the primary expression
                if paren_depth == 0 && brace_depth == 0 {
                    // Mark as having seen primary when we see an identifier char
                    // followed by something that's NOT an identifier char (end of token)
                    // For simplicity, just mark after any non-whitespace, non-operator char
                    if ch.is_ascii_alphanumeric() || ch == b'_' || ch == b'$' || ch == b'.' {
                        // Part of identifier or member access
                        // We'll set seen_primary after we finish the identifier
                        // For now, advance through the whole identifier
                        while i < len
                            && (bytes[i].is_ascii_alphanumeric()
                                || bytes[i] == b'_'
                                || bytes[i] == b'$'
                                || bytes[i] == b'.')
                        {
                            i += 1;
                        }
                        seen_primary = true;
                        continue;
                    }
                }
            }
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
/// Extract the default-value expression from the text following a destructured
/// snippet parameter pattern, i.e. the `…` in `: Type = …` or `= …`. Returns
/// `None` when there's no default. Tracks bracket / angle depth so a `=` inside
/// a generic type argument (`Map<K = string>`) isn't mistaken for the default
/// separator, and ignores `==` / `=>` / `>=` / `<=` / `!=`.
fn extract_param_default(rest: &str) -> Option<String> {
    let bytes = rest.as_bytes();
    let mut depth = 0i32;
    let mut i = 0;
    while i < bytes.len() {
        match bytes[i] {
            b'(' | b'[' | b'{' | b'<' => depth += 1,
            b')' | b']' | b'}' | b'>' => depth -= 1,
            b'=' if depth == 0 => {
                let prev = if i > 0 { bytes[i - 1] } else { 0 };
                let next = bytes.get(i + 1).copied().unwrap_or(0);
                if !matches!(prev, b'=' | b'!' | b'<' | b'>') && !matches!(next, b'=' | b'>') {
                    let default = rest[i + 1..].trim();
                    return (!default.is_empty()).then(|| default.to_string());
                }
            }
            _ => {}
        }
        i += 1;
    }
    None
}

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
            let pattern = &trimmed[..=pos];
            // After the destructured pattern there may be `: Type`, `= default`,
            // or `: Type = default`. Preserve the default value (M-024) — only
            // the type annotation should be stripped.
            let rest = trimmed[pos + 1..].trim_start();
            if let Some(default) = extract_param_default(rest) {
                return format!("{pattern} = {default}");
            }
            return pattern.to_string();
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
    let (ident_end, type_start) =
        if let Some(qc_pos) = memchr::memmem::find(trimmed.as_bytes(), b"?:") {
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
        // The `=` might be after a type expression like `number = 4`.
        // We need to skip `=>` (arrow function types) and `==`/`===` operators.
        // Also need to handle balanced parens/brackets in the type expression.
        let mut paren_depth = 0i32;
        let mut bracket_depth = 0i32;
        let mut angle_depth = 0i32;
        let bytes = after_type.as_bytes();
        let mut i = 0;
        let mut default_start = None;
        while i < bytes.len() {
            match bytes[i] {
                b'(' => paren_depth += 1,
                b')' => paren_depth -= 1,
                b'[' => bracket_depth += 1,
                b']' => bracket_depth -= 1,
                b'<' => angle_depth += 1,
                b'>' if angle_depth > 0 => angle_depth -= 1,
                b'=' if paren_depth == 0 && bracket_depth == 0 && angle_depth == 0 => {
                    // Check it's not `=>`, `==`, or `===`
                    let next = if i + 1 < bytes.len() { bytes[i + 1] } else { 0 };
                    if next != b'>' && next != b'=' {
                        default_start = Some(i);
                        break;
                    }
                }
                b'\'' | b'"' | b'`' => {
                    let quote = bytes[i];
                    i += 1;
                    while i < bytes.len() && bytes[i] != quote {
                        if bytes[i] == b'\\' {
                            i += 1;
                        }
                        i += 1;
                    }
                }
                _ => {}
            }
            i += 1;
        }
        if let Some(eq_pos) = default_start {
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
        // Upstream's `needs_clsx` requires `!Array.isArray(node.value)`
        // (2-analyze/visitors/Attribute.js): clsx is only applied to the bare
        // single-expression form `class={x}`. A quoted `class="{x}"` parses to
        // an array (our `Sequence`) and coerces to a string, so it must NOT be
        // wrapped in `$.clsx(...)`, even when it has a single expression part.
        AttributeValue::Sequence(_) | AttributeValue::True(_) => false,
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

/// Build a property string with shorthand support.
/// If key (after quoting) equals the value, emit just `key` (shorthand).
/// Otherwise emit `key: value`.
pub(crate) fn prop_string(key: &str, value: &str) -> String {
    let quoted_key = quote_prop_name(key);
    if quoted_key == value && is_valid_js_identifier(key) {
        quoted_key
    } else {
        format!("{}: {}", quoted_key, value)
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
        TemplateNode::SlotElement(slot) => {
            extract_slot_from_attributes(&slot.attributes).unwrap_or_else(|| "default".to_string())
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
///
/// Mirrors upstream `clean_nodes` (3-transform/utils.js): ALL leading /
/// trailing whitespace-only text nodes are removed (not just one), and the
/// remaining first / last text gets its edge whitespace trimmed using the
/// Svelte whitespace set (` \t\r\n` — NOT `\u{00A0}` from `&nbsp;`, which
/// upstream's `regex_not_whitespace = /[^ \t\r\n]/` treats as content).
pub(crate) fn trim_output_parts(parts: &mut Vec<OutputPart>) {
    use crate::compiler::phases::phase3_transform::utils::{
        is_svelte_whitespace_only, svelte_trim_end, svelte_trim_start,
    };

    // Remove leading whitespace-only Html parts (upstream pops every
    // whitespace-only leading text node), then trim the first remaining one.
    while matches!(parts.first(), Some(OutputPart::Html(html)) if is_svelte_whitespace_only(html)) {
        parts.remove(0);
    }
    if let Some(OutputPart::Html(html)) = parts.first_mut() {
        *html = svelte_trim_start(html).to_string();
    }

    // Same for the tail.
    while matches!(parts.last(), Some(OutputPart::Html(html)) if is_svelte_whitespace_only(html)) {
        parts.pop();
    }
    if let Some(OutputPart::Html(html)) = parts.last_mut() {
        *html = svelte_trim_end(html).to_string();
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

    // Template literals without interpolations: `text` -> constant "text"
    if trimmed.len() >= 2 && trimmed.starts_with('`') && trimmed.ends_with('`') {
        let inner = &trimmed[1..trimmed.len() - 1];
        // Only fold if there are no ${...} interpolations
        if !inner.contains("${") {
            return ConstantFoldResult::Constant(inner.to_string());
        }
    }

    // Handle && operator: if left is known and falsy, result is left's value
    if let Some(idx) = memchr::memmem::find(trimmed.as_bytes(), b"&&") {
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
    if let Some(idx) = memchr::memmem::find(trimmed.as_bytes(), b"||") {
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

    if let Some(idx) = memchr::memmem::find(trimmed.as_bytes(), b"??") {
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
            && memmem::find(trimmed.as_bytes(), b"= $props()").is_some()
            && let Some(props_idx) = memmem::find(trimmed.as_bytes(), b"= $props()")
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

    // Multi-line check: collapse newlines and check again
    let script_bytes = script.as_bytes();
    if memmem::find(script_bytes, b"$props()").is_some()
        && memmem::find(script_bytes, b"...").is_some()
    {
        let collapsed: String = script
            .chars()
            .map(|c| if c == '\n' || c == '\r' { ' ' } else { c })
            .collect();
        let collapsed = if memchr::memmem::find(collapsed.as_bytes(), b"  ").is_some() {
            collapsed.replace("  ", " ")
        } else {
            collapsed
        };
        let collapsed_bytes = collapsed.as_bytes();
        if (memmem::find(collapsed_bytes, b"let {").is_some()
            || memmem::find(collapsed_bytes, b"const {").is_some())
            && memmem::find(collapsed_bytes, b"} = $props()").is_some()
            && memmem::find(collapsed_bytes, b"...").is_some()
        {
            return true;
        }
    }

    false
}

/// Collapse multi-line `let/const { ... } = $$props` destructurings into single lines.
fn collapse_multiline_destructuring(script: &str) -> String {
    let mut result = String::new();
    let mut in_destructure = false;
    let mut accum = String::new();

    for line in script.lines() {
        let trimmed = line.trim();

        if !in_destructure {
            // Check if this line starts a multi-line destructure
            if (trimmed.starts_with("let {") || trimmed.starts_with("const {"))
                && !trimmed.contains('}')
            {
                in_destructure = true;
                accum.clear();
                accum.push_str(trimmed);
                accum.push(' ');
                continue;
            }
            result.push_str(line);
            result.push('\n');
        } else {
            // Skip pure comment lines when collapsing (they can't be on one line with code after them)
            if trimmed.starts_with("//") {
                // Don't include line comments in the collapsed output
            } else {
                accum.push_str(trimmed);
                accum.push(' ');
            }
            if trimmed.contains('}') {
                in_destructure = false;
                // Clean up extra whitespace
                let collapsed = accum.trim().to_string();
                result.push_str("\t\t");
                result.push_str(&collapsed);
                result.push('\n');
            }
        }
    }

    result
}

/// Transform script code to use proper destructuring for props spread pattern.
/// Transform props spread destructuring in script code.
/// `extra_tabs` controls how many extra tabs to add:
///   * 2 for inside $$renderer.component() wrapper (3 total from 1 base)
///   * 0 for direct function body (1 total from 1 base)
///
/// `rename_slots` - if true, rename `$$slots` to `$$slots_` in destructuring
/// (used when `$$slots` is already declared via `$.sanitize_slots`)
pub(crate) fn transform_props_spread_ex(
    script: &str,
    extra_tabs: usize,
    rename_slots: bool,
) -> String {
    // Detect space indentation unit from the script to convert spaces to tabs.
    // This handles source code that uses e.g. 2-space or 4-space indentation.
    let space_indent_unit = detect_space_indent_unit(script);

    // First, collapse multi-line destructurings into single lines
    let script = collapse_multiline_destructuring(script);
    let mut result = String::new();
    let mut in_template_literal = false;
    let mut template_brace_depth: i32 = 0;
    let target_indent = "\t".repeat(1 + extra_tabs); // base 1 tab + extra
    let slots_part = if rename_slots {
        "$$slots: $$slots_"
    } else {
        "$$slots"
    };

    for line in script.lines() {
        let trimmed = line.trim();

        let tb = trimmed.as_bytes();
        if (trimmed.starts_with("let ") || trimmed.starts_with("const "))
            && (trimmed.ends_with("= $$props")
                || trimmed.ends_with("= $$props;")
                || memmem::find(tb, b"= $$props ").is_some())
            && let Some(props_idx) = memmem::find(tb, b"= $$props")
        {
            let left = trimmed[..props_idx].trim();
            let (decl_keyword, pattern) = if let Some(stripped) = left.strip_prefix("let ") {
                ("let", stripped.trim())
            } else if let Some(stripped) = left.strip_prefix("const ") {
                ("const", stripped.trim())
            } else {
                ("let", left)
            };

            // Case 1: Simple identifier (let props = $$props)
            if !pattern.starts_with('{') {
                let _ = writeln!(
                    result,
                    "{}{} {{ {}, $$events, ...{} }} = $$props;",
                    target_indent, decl_keyword, slots_part, pattern
                );
                continue;
            }

            // Case 2 & 3: ObjectPattern with RestElement
            if pattern.starts_with('{') && pattern.ends_with('}') {
                let inner = &pattern[1..pattern.len() - 1].trim();

                // Find `...` rest element, but skip `...` inside string literals
                if let Some(rest_idx) = find_rest_element_index(inner) {
                    let rest_part = &inner[rest_idx..];
                    let rest_name = rest_part.trim_start_matches("...").trim();
                    let other_props = inner[..rest_idx].trim().trim_end_matches(',').trim();

                    if other_props.is_empty() {
                        let _ = writeln!(
                            result,
                            "{}{} {{ {}, $$events, ...{} }} = $$props;",
                            target_indent, decl_keyword, slots_part, rest_name
                        );
                    } else {
                        let _ = writeln!(
                            result,
                            "{}{} {{ {}, {}, $$events, ...{} }} = $$props;",
                            target_indent, decl_keyword, other_props, slots_part, rest_name
                        );
                    }
                    continue;
                }
            }

            // Fallback: keep original line
            let _ = writeln!(result, "{}{}", target_indent, trimmed);
            continue;
        }

        if trimmed.is_empty() {
            result.push('\n');
        } else if in_template_literal || template_brace_depth > 0 {
            // Inside template literal or ${...} expression - preserve content exactly
            let (new_in_template, new_brace_depth) =
                update_template_literal_state_full(line, in_template_literal, template_brace_depth);
            in_template_literal = new_in_template;
            template_brace_depth = new_brace_depth;
            result.push_str(line);
            result.push('\n');
        } else {
            // Preserve relative indentation: detect leading tabs/spaces and add extra tabs.
            // If the script uses space indentation, convert spaces to tabs proportionally.
            let leading_tabs = if line.starts_with('\t') {
                line.chars().take_while(|c| *c == '\t').count()
            } else if space_indent_unit > 0 && line.starts_with(' ') {
                let leading_spaces = line.len() - line.trim_start_matches(' ').len();
                leading_spaces / space_indent_unit
            } else {
                0
            };
            let indent = "\t".repeat(leading_tabs + extra_tabs);
            let (new_in_template, new_brace_depth) =
                update_template_literal_state_full(line, in_template_literal, template_brace_depth);
            in_template_literal = new_in_template;
            template_brace_depth = new_brace_depth;
            let _ = writeln!(result, "{}{}", indent, trimmed);
        }
    }

    if result.ends_with('\n') {
        result.pop();
    }

    result
}

/// Collapse multi-line declarations / function calls into single logical lines.
///
/// `extract_constant_vars` walks the script line by line, but
/// `let url =\n   "https://..."` is one logical statement split across two
/// physical lines. We scan the script while tracking bracket / paren / brace
/// / string depth — when a newline appears at depth > 0 (or directly after
/// an open-paren / `=` with no value yet) we replace it with a single space
/// so the next pass sees a complete declaration. Lines inside strings /
/// template literals are left untouched.
fn join_continuation_lines(script: &str) -> String {
    let bytes = script.as_bytes();
    let mut out = String::with_capacity(script.len());
    let mut depth_paren: i32 = 0;
    let mut depth_brace: i32 = 0;
    let mut depth_bracket: i32 = 0;
    let mut i = 0;
    while i < bytes.len() {
        let b = bytes[i];
        // Line / block comments — copy as-is.
        if b == b'/' && i + 1 < bytes.len() && bytes[i + 1] == b'/' {
            let s = i;
            while i < bytes.len() && bytes[i] != b'\n' {
                i += 1;
            }
            out.push_str(&script[s..i]);
            continue;
        }
        if b == b'/' && i + 1 < bytes.len() && bytes[i + 1] == b'*' {
            let s = i;
            i += 2;
            while i + 1 < bytes.len() && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                i += 1;
            }
            if i + 1 < bytes.len() {
                i += 2;
            }
            out.push_str(&script[s..i]);
            continue;
        }
        // String / template literals — copy verbatim. Newlines inside
        // template literals are legal and must not be collapsed.
        if b == b'"' || b == b'\'' || b == b'`' {
            let quote = b;
            let s = i;
            i += 1;
            while i < bytes.len() {
                if bytes[i] == b'\\' && i + 1 < bytes.len() {
                    i += 2;
                    continue;
                }
                if bytes[i] == quote {
                    i += 1;
                    break;
                }
                i += 1;
            }
            out.push_str(&script[s..i]);
            continue;
        }
        if b == b'(' {
            depth_paren += 1;
        } else if b == b')' {
            depth_paren -= 1;
        } else if b == b'{' {
            depth_brace += 1;
        } else if b == b'}' {
            depth_brace -= 1;
        } else if b == b'[' {
            depth_bracket += 1;
        } else if b == b']' {
            depth_bracket -= 1;
        }
        if b == b'\n' {
            // Look back over already-emitted output (skipping trailing
            // spaces / tabs) to see if the previous non-whitespace character
            // is one that suggests the statement continues onto the next
            // line — `=`, `+`, `-`, `,`, `(`, `[`, `{`, `?`, `:`, `&`, `|`,
            // `!` (only as part of `!=`), `<`, `>`, `*`, `/`, `%`, `^`, `~`,
            // a backtick, etc. The most common case we care about is `=`,
            // but covering operators avoids surprises with hand-formatted
            // declarations like `const x = a +\n  b`.
            let prev = out
                .as_bytes()
                .iter()
                .rposition(|c| !c.is_ascii_whitespace())
                .map(|p| out.as_bytes()[p]);
            let in_expr = depth_paren > 0 || depth_bracket > 0 || depth_brace > 0;
            let after_continuation_op = matches!(
                prev,
                Some(
                    b'=' | b'+'
                        | b'-'
                        | b','
                        | b'?'
                        | b':'
                        | b'&'
                        | b'|'
                        | b'<'
                        | b'>'
                        | b'*'
                        | b'/'
                        | b'%'
                        | b'^'
                        | b'~'
                        | b'('
                        | b'['
                        | b'{'
                )
            );
            if in_expr || after_continuation_op {
                out.push(' ');
                i += 1;
                continue;
            }
        }
        let mut next = i + 1;
        while next < bytes.len() && !script.is_char_boundary(next) {
            next += 1;
        }
        out.push_str(&script[i..next]);
        i = next;
    }
    out
}

/// Extract constant variable bindings from script content.
/// Try to parse a value as a constant literal and insert into the constants map.
/// Returns true if the value was successfully inserted.
fn try_insert_constant_value(
    value: &str,
    name: &str,
    constants: &mut FxHashMap<String, String>,
) -> bool {
    if value.len() >= 2
        && ((value.starts_with('\'') && value.ends_with('\''))
            || (value.starts_with('"') && value.ends_with('"'))
            || (value.starts_with('`') && value.ends_with('`') && !value.contains("${")))
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
    if let Some(idx) = memchr::memmem::find(trimmed.as_bytes(), b" * ") {
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

    // Join physical lines into "logical lines" (statements). A declaration
    // like `let url =\n  "https://..."` spans two physical lines but is one
    // statement — collapsing it lets the rest of this function recognise it
    // as `let url = "https://..."`.
    let logical_script = join_continuation_lines(script);

    // First pass: extract constants from non-rune declarations
    for line in logical_script.lines() {
        let trimmed = line.trim();

        // Skip lines with $state, $derived, or $props - these are reactive and
        // require proper scope analysis to constant-fold safely
        let tb = trimmed.as_bytes();
        if memmem::find(tb, b"$state").is_some()
            || memmem::find(tb, b"$derived").is_some()
            || memmem::find(tb, b"$props").is_some()
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
/// Handles multi-line imports properly.
fn extract_imports_with_options(script: &str, strip_exports: bool) -> (Vec<String>, String) {
    let mut imports = Vec::new();
    let mut rest = String::new();
    let mut current_import: Option<Vec<String>> = None;

    for line in script.lines() {
        if let Some(ref mut import_lines) = current_import {
            // We're inside a multi-line import. The closing line may carry
            // trailing statements after the import terminator; split them off.
            let trimmed = line.trim();
            let closes = trimmed.contains(';')
                || trimmed.ends_with('\'')
                || trimmed.ends_with('"')
                || trimmed.ends_with('`');
            if closes {
                if let Some((import_part, remainder)) = split_leading_import(trimmed) {
                    import_lines.push(import_part.to_string());
                    imports.push(import_lines.join("\n"));
                    current_import = None;
                    // The remainder may itself begin with further imports packed
                    // on the same line; peel them all before routing the rest.
                    let remainder = peel_leading_imports(remainder, &mut imports);
                    if !remainder.trim().is_empty() {
                        rest.push_str(&remainder);
                        rest.push('\n');
                    }
                } else {
                    import_lines.push(line.to_string());
                    imports.push(import_lines.join("\n"));
                    current_import = None;
                }
            } else {
                import_lines.push(line.to_string());
            }
        } else {
            let trimmed = line.trim();
            if trimmed.starts_with("import ") || trimmed.starts_with("import{") {
                if trimmed.contains(';')
                    || is_complete_side_effect_import(trimmed)
                    || (memmem::find(trimmed.as_bytes(), b" from ").is_some()
                        && (trimmed.ends_with('\'')
                            || trimmed.ends_with('"')
                            || trimmed.ends_with('`')))
                {
                    // The line begins with a *complete* import statement. It may,
                    // however, carry additional imports and/or statements on the
                    // same physical line (e.g. `import a from 'x';import b from
                    // 'y';` or `import x from 'm'; const a = 1;`). Peel every
                    // packed import so each is hoisted, then route any trailing
                    // non-import code through `rest` so it is transformed normally
                    // instead of being swallowed into the import string.
                    let remainder = peel_leading_imports(trimmed, &mut imports);
                    if !remainder.trim().is_empty() {
                        rest.push_str(&remainder);
                        rest.push('\n');
                    }
                } else {
                    current_import = Some(vec![line.to_string()]);
                }
            } else {
                rest.push_str(line);
                rest.push('\n');
            }
        }
    }

    if let Some(import_lines) = current_import {
        imports.push(import_lines.join("\n"));
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

/// Split a `trimmed` line containing a leading/just-completed import statement
/// into `(import_statement, remainder)` when the line carries additional code
/// after the import terminator on the same physical line — e.g.
/// `import x from 'm'; const a = 1;` → `("import x from 'm';", " const a = 1;")`.
///
/// Returns `None` when the whole line is just the import (nothing meaningful
/// follows), so callers can keep their existing behaviour for that case.
fn split_leading_import(trimmed: &str) -> Option<(&str, &str)> {
    let end = import_statement_end(trimmed)?;
    if end >= trimmed.len() {
        return None;
    }
    let (import_part, remainder) = trimmed.split_at(end);
    if remainder.trim().is_empty() {
        None
    } else {
        Some((import_part, remainder))
    }
}

/// Peel every complete leading `import` statement off `s`, pushing each onto
/// `imports`, and return the remaining tail (front-trimmed).
///
/// Handles several imports packed onto one physical line, e.g.
/// `import a from 'x';import b from 'y';` → both hoisted, empty tail. Stops at
/// the first non-import token or an *incomplete* import (one that continues on a
/// following line) and returns it so the caller can route it.
fn peel_leading_imports(s: &str, imports: &mut Vec<String>) -> String {
    let mut cur = s.trim_start();
    while cur.starts_with("import ") || cur.starts_with("import{") {
        let Some(end) = import_statement_end(cur) else {
            break;
        };
        let (import_part, remainder) = cur.split_at(end);
        imports.push(import_part.trim().to_string());
        cur = remainder.trim_start();
    }
    cur.to_string()
}

/// Find the byte index at which the leading import statement in `s` ends.
///
/// String literals (single/double quotes and template backticks) are skipped
/// honouring backslash escapes, so a `;` inside a module specifier is ignored.
/// If a top-level `;` is found it terminates the statement (index just past it).
/// Otherwise — ASI — the statement ends just past the last completed top-level
/// string literal (the module specifier). Returns `None` if neither is present
/// (incomplete import; let the caller fall back to its default handling).
fn import_statement_end(s: &str) -> Option<usize> {
    let bytes = s.as_bytes();
    let mut i = 0usize;
    let mut last_string_end: Option<usize> = None;
    while i < bytes.len() {
        match bytes[i] {
            b';' => return Some(i + 1),
            q @ (b'\'' | b'"' | b'`') => {
                i += 1;
                while i < bytes.len() {
                    if bytes[i] == b'\\' && i + 1 < bytes.len() {
                        i += 2;
                        continue;
                    }
                    if bytes[i] == q {
                        i += 1;
                        break;
                    }
                    i += 1;
                }
                last_string_end = Some(i);
            }
            _ => i += 1,
        }
    }
    last_string_end
}

/// Check whether `trimmed` is a complete *side-effect* import statement —
/// `import "module"` or `import 'module'` with no `from` clause and no
/// terminating semicolon. Mirrors the helper in `transform/client/mod.rs`.
fn is_complete_side_effect_import(trimmed: &str) -> bool {
    let after_import = if let Some(rest) = trimmed.strip_prefix("import ") {
        rest.trim_start()
    } else {
        return false;
    };

    let bytes = after_import.as_bytes();
    let quote = match bytes.first() {
        Some(&b'"') => b'"',
        Some(&b'\'') => b'\'',
        _ => return false,
    };

    let mut i = 1;
    let mut closed = false;
    while i < bytes.len() {
        match bytes[i] {
            b'\\' if i + 1 < bytes.len() => i += 2,
            c if c == quote => {
                closed = true;
                i += 1;
                break;
            }
            _ => i += 1,
        }
    }
    if !closed {
        return false;
    }

    after_import[i..].trim().is_empty()
}

/// Strip `export { ... }` statements from script content.
fn strip_export_specifiers(script: &str) -> String {
    // The previous implementation collected `script.chars()` into a `Vec<char>`
    // AND, more wastefully, allocated a fresh `String` per byte position by
    // doing `chars[i..i+6].iter().collect()` just to compare against "export".
    // Switch to byte-indexing + a segment-flush emit pattern. All tokens we
    // look at (`export`, space/tab/newline, `{}`, `;`) are pure ASCII, so
    // byte indexing is UTF-8 safe (continuation bytes 0x80-0xFF never collide
    // with ASCII).
    let bytes = script.as_bytes();
    let len = bytes.len();
    let mut result = String::with_capacity(len);
    let mut segment_start = 0;
    let mut i = 0;

    while i < len {
        if i + 6 <= len && &bytes[i..i + 6] == b"export" {
            let mut j = i + 6;

            while j < len && matches!(bytes[j], b' ' | b'\t' | b'\n') {
                j += 1;
            }

            if j < len && bytes[j] == b'{' {
                let mut depth = 1;
                let start = j + 1;
                let mut end = start;

                while end < len && depth > 0 {
                    match bytes[end] {
                        b'{' => depth += 1,
                        b'}' => depth -= 1,
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
                while end < len && matches!(bytes[end], b' ' | b'\t') {
                    end += 1;
                }
                if end < len && bytes[end] == b';' {
                    end += 1; // skip trailing semicolon
                }
                while end < len && matches!(bytes[end], b' ' | b'\t') {
                    end += 1;
                }
                if end < len && bytes[end] == b'\n' {
                    end += 1;
                }

                // Flush the bytes before the `export` and skip to `end`. Both
                // segment_start and i / end point at ASCII or UTF-8 char
                // boundaries (we only advance through ASCII control tokens
                // or stay at the original position), so the slice is valid.
                result.push_str(&script[segment_start..i]);
                segment_start = end;
                i = end;
                continue;
            }
        }

        i += 1;
    }

    result.push_str(&script[segment_start..]);
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
    blocker_map: &rustc_hash::FxHashMap<String, usize>,
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

/// Check if an HTML template string contains `await` inside `${...}` expressions.
/// Only checks expression interpolations, not static text.
pub(crate) fn html_template_contains_await(html: &str) -> bool {
    let bytes = html.as_bytes();
    let len = bytes.len();
    let mut i = 0;

    while i < len {
        // Look for `${` which starts a template expression
        if bytes[i] == b'$' && i + 1 < len && bytes[i + 1] == b'{' {
            i += 2;
            let start = i;
            let mut depth = 1;
            while i < len && depth > 0 {
                let ch = bytes[i];
                if ch == b'{' {
                    depth += 1;
                } else if ch == b'}' {
                    depth -= 1;
                } else if matches!(ch, b'\'' | b'"' | b'`') {
                    i = skip_string_literal(bytes, i);
                    continue;
                }
                if depth > 0 {
                    i += 1;
                }
            }
            let expr = &html[start..i];
            if expr_contains_await(expr) {
                return true;
            }
            if i < len {
                i += 1; // skip closing }
            }
        } else {
            i += 1;
        }
    }
    false
}

/// Extract `await` expressions from an HTML template string's `${...}` interpolations.
/// Returns a tuple of:
/// - The modified HTML with `await expr` replaced by `$$N` variables
/// - A vector of (var_name, save_declaration) pairs for the extracted expressions
///
/// For example, given `<p${$.attributes({ ...await { class: 'cool'} })}>cool</p>`:
/// - Returns modified HTML: `<p${$.attributes({ ...$$0 })}>cool</p>`
/// - Returns declarations: [("$$0", "(await $.save({ class: 'cool' }))()")]
pub(crate) fn extract_await_from_html_template(html: &str) -> (String, Vec<(String, String)>) {
    let bytes = html.as_bytes();
    let len = bytes.len();
    let mut result = String::with_capacity(len);
    let mut declarations: Vec<(String, String)> = Vec::new();
    let mut var_counter = 0;
    let mut i = 0;

    while i < len {
        // Look for `${` which starts a template expression
        if bytes[i] == b'$' && i + 1 < len && bytes[i + 1] == b'{' {
            result.push_str("${");
            i += 2;
            let expr_start = i;
            let mut depth = 1;
            while i < len && depth > 0 {
                let ch = bytes[i];
                if ch == b'{' {
                    depth += 1;
                } else if ch == b'}' {
                    depth -= 1;
                } else if matches!(ch, b'\'' | b'"' | b'`') {
                    i = skip_string_literal(bytes, i);
                    continue;
                }
                if depth > 0 {
                    i += 1;
                }
            }
            let expr = &html[expr_start..i];

            if expr_contains_await(expr) {
                // Transform the expression to extract await and replace with $$N
                let (new_expr, new_decls) = extract_await_from_expression(expr, &mut var_counter);
                result.push_str(&new_expr);
                declarations.extend(new_decls);
            } else {
                result.push_str(expr);
            }

            result.push('}');
            if i < len {
                i += 1; // skip closing }
            }
        } else {
            result.push(bytes[i] as char);
            i += 1;
        }
    }

    (result, declarations)
}

/// Extract `await expr` from a single expression, replacing with `$$N` variables.
///
/// This handles patterns like:
/// - `$.attributes({ ...await { class: 'cool'} })` → `$.attributes({ ...$$0 })`
///   with decl: `$$0 = (await $.save({ class: 'cool' }))()`
/// - `$.attr_class($.clsx(await 'awesome'))` → `$.attr_class($$0)`
///   with decl: `$$0 = $.clsx((await $.save('awesome'))())`
/// - `$.attributes({ ...{}, class: $.clsx(await 'neato') })` → `$.attributes({ ...{}, class: $$0 })`
///   with decl: `$$0 = $.clsx((await $.save('neato'))())`
fn extract_await_from_expression(
    expr: &str,
    var_counter: &mut usize,
) -> (String, Vec<(String, String)>) {
    let mut decls: Vec<(String, String)> = Vec::new();

    // Strategy: Find the outermost expression that contains `await` and extract it.
    // The PromiseOptimiser extracts the whole expression passed to `transform()`,
    // which is usually the attribute value expression.

    // Check for pattern: $.clsx(await expr) or $.clsx(...await expr...)
    // In this case, the whole $.clsx() call should be extracted as $$N
    if let Some(new_expr) = try_extract_clsx_with_await(expr, var_counter, &mut decls) {
        return (new_expr, decls);
    }

    // Check for pattern: ...await expr (spread with await)
    // In this case, extract just the `await expr` part
    if let Some(new_expr) = try_extract_spread_await(expr, var_counter, &mut decls) {
        return (new_expr, decls);
    }

    // Fallback: extract each `await expr` individually
    let transformed = extract_all_awaits(expr, var_counter, &mut decls);
    (transformed, decls)
}

/// Try to extract `$.clsx(await expr)` pattern - the whole clsx call becomes $$N
fn try_extract_clsx_with_await(
    expr: &str,
    var_counter: &mut usize,
    decls: &mut Vec<(String, String)>,
) -> Option<String> {
    // Look for $.clsx( pattern
    if let Some(clsx_pos) = memmem::find(expr.as_bytes(), b"$.clsx(") {
        let inner_start = clsx_pos + 7; // after "$.clsx("
        let bytes = expr.as_bytes();
        let mut depth = 1;
        let mut j = inner_start;
        while j < bytes.len() && depth > 0 {
            match bytes[j] {
                b'(' => depth += 1,
                b')' => depth -= 1,
                b'\'' | b'"' | b'`' => {
                    j = skip_string_literal(bytes, j);
                    continue;
                }
                _ => {}
            }
            if depth > 0 {
                j += 1;
            }
        }
        let clsx_end = j + 1; // include closing )
        let clsx_inner = &expr[inner_start..j];

        if expr_contains_await(clsx_inner) {
            // Transform the inner await: await X → (await $.save(X))()
            let transformed_inner = transform_await_to_save(clsx_inner);
            let var_name = format!("$${}", *var_counter);
            *var_counter += 1;
            let decl_value = format!("$.clsx({})", transformed_inner);
            decls.push((var_name.clone(), decl_value));

            // Replace the $.clsx(...) with $$N
            let mut result = String::new();
            result.push_str(&expr[..clsx_pos]);
            result.push_str(&var_name);
            result.push_str(&expr[clsx_end..]);
            return Some(result);
        }
    }
    None
}

/// Try to extract `...await expr` pattern - `await expr` becomes $$N
fn try_extract_spread_await(
    expr: &str,
    var_counter: &mut usize,
    decls: &mut Vec<(String, String)>,
) -> Option<String> {
    // Look for ...await pattern
    let bytes = expr.as_bytes();
    let len = bytes.len();
    let mut i = 0;
    let mut result = String::with_capacity(len);

    while i < len {
        // Skip string literals
        if matches!(bytes[i], b'\'' | b'"' | b'`') {
            let end = skip_string_literal(bytes, i);
            result.push_str(&expr[i..end]);
            i = end;
            continue;
        }

        // Look for ...await
        if i + 8 <= len && &bytes[i..i + 3] == b"..." {
            let after_dots = i + 3;
            // Skip whitespace
            let mut k = after_dots;
            while k < len && matches!(bytes[k], b' ' | b'\t' | b'\n' | b'\r') {
                k += 1;
            }
            if k + 5 <= len && &expr[k..k + 5] == "await" {
                let after_await = k + 5;
                let next = if after_await < len {
                    bytes[after_await]
                } else {
                    0
                };
                if !next.is_ascii_alphanumeric() && next != b'_' && next != b'$' {
                    // Found ...await - extract the await argument
                    let mut arg_start = after_await;
                    while arg_start < len
                        && matches!(bytes[arg_start], b' ' | b'\t' | b'\n' | b'\r')
                    {
                        arg_start += 1;
                    }
                    let arg_end = find_await_arg_end(bytes, arg_start, len);
                    let arg = &expr[arg_start..arg_end];

                    let var_name = format!("$${}", *var_counter);
                    *var_counter += 1;
                    let decl_value = format!("(await $.save({}))()", arg);
                    decls.push((var_name.clone(), decl_value));

                    result.push_str("...");
                    result.push_str(&var_name);
                    i = arg_end;
                    continue;
                }
            }
        }

        result.push(bytes[i] as char);
        i += 1;
    }

    if decls.is_empty() { None } else { Some(result) }
}

/// Fallback: extract all `await expr` occurrences and replace with $$N
fn extract_all_awaits(
    expr: &str,
    var_counter: &mut usize,
    decls: &mut Vec<(String, String)>,
) -> String {
    let bytes = expr.as_bytes();
    let len = bytes.len();
    let mut result = String::with_capacity(len);
    let mut i = 0;

    while i < len {
        // Skip string literals
        if matches!(bytes[i], b'\'' | b'"' | b'`') {
            let end = skip_string_literal(bytes, i);
            result.push_str(&expr[i..end]);
            i = end;
            continue;
        }

        // Check for `await` keyword
        if bytes[i] == b'a' && i + 5 <= len && &bytes[i..i + 5] == b"await" {
            let before_ok = i == 0
                || !bytes[i - 1].is_ascii_alphanumeric()
                    && bytes[i - 1] != b'_'
                    && bytes[i - 1] != b'$';
            let after = if i + 5 < len { bytes[i + 5] } else { 0 };
            let after_ok = !after.is_ascii_alphanumeric() && after != b'_' && after != b'$';
            if before_ok && after_ok {
                // Found `await` - extract argument
                let mut arg_start = i + 5;
                while arg_start < len && matches!(bytes[arg_start], b' ' | b'\t' | b'\n' | b'\r') {
                    arg_start += 1;
                }
                let arg_end = find_await_arg_end(bytes, arg_start, len);
                let arg = &expr[arg_start..arg_end];

                let var_name = format!("$${}", *var_counter);
                *var_counter += 1;
                let decl_value = format!("(await $.save({}))()", arg);
                decls.push((var_name.clone(), decl_value));

                result.push_str(&var_name);
                i = arg_end;
                continue;
            }
        }

        result.push(bytes[i] as char);
        i += 1;
    }

    result
}

/// Find const-tag-level blocker expressions for identifiers referenced in a JS expression string.
/// Returns a list of unique blocker expressions (e.g., "promises_2[1]") for variables
/// referenced in the expression that have entries in the const_blocker_map.
pub(crate) fn find_const_expression_blockers(
    expr: &str,
    const_blocker_map: &rustc_hash::FxHashMap<String, String>,
) -> Vec<String> {
    let mut blockers = Vec::new();
    let idents = extract_identifiers_from_js(expr);
    for ident in &idents {
        if let Some(blocker) = const_blocker_map.get(ident)
            && !blockers.contains(blocker)
        {
            blockers.push(blocker.clone());
        }
    }
    blockers
}

/// Find const-tag-level blocker expressions for identifiers referenced in an HTML template string.
/// Only checks ${...} expression interpolations within the HTML.
pub(crate) fn find_const_html_blockers(
    html: &str,
    const_blocker_map: &rustc_hash::FxHashMap<String, String>,
) -> Vec<String> {
    let mut blockers = Vec::new();
    // Find ${...} expressions in the HTML
    let bytes = html.as_bytes();
    let len = bytes.len();
    let mut i = 0;
    while i < len {
        if i + 1 < len && bytes[i] == b'$' && bytes[i + 1] == b'{' {
            // Find the matching closing brace
            let start = i + 2;
            let mut depth = 1;
            let mut j = start;
            while j < len && depth > 0 {
                match bytes[j] {
                    b'{' => depth += 1,
                    b'}' => depth -= 1,
                    _ => {}
                }
                j += 1;
            }
            if depth == 0 {
                let expr = &html[start..j - 1];
                let expr_blockers = find_const_expression_blockers(expr, const_blocker_map);
                for b in expr_blockers {
                    if !blockers.contains(&b) {
                        blockers.push(b);
                    }
                }
            }
            i = j;
        } else {
            i += 1;
        }
    }
    blockers
}

/// Split an HTML string at the first ${...} expression that references a blocked variable.
/// Returns (prefix, expression_content, suffix) if an expression is found.
pub(crate) fn split_html_expression(html: &str) -> Option<(String, String, String)> {
    let bytes = html.as_bytes();
    let len = bytes.len();
    let mut i = 0;
    while i < len {
        if i + 1 < len && bytes[i] == b'$' && bytes[i + 1] == b'{' {
            let expr_start = i;
            let start = i + 2;
            let mut depth = 1;
            let mut j = start;
            while j < len && depth > 0 {
                match bytes[j] {
                    b'{' => depth += 1,
                    b'}' => depth -= 1,
                    _ => {}
                }
                j += 1;
            }
            if depth == 0 {
                let prefix = html[..expr_start].to_string();
                // Extract just the expression (without ${ and })
                let expr = html[start..j - 1].to_string();
                let suffix = html[j..].to_string();
                return Some((prefix, expr, suffix));
            }
            i = j;
        } else {
            i += 1;
        }
    }
    None
}

/// Extract all identifier names from a JavaScript expression string.
/// Simple lexer that finds word-boundary identifiers, skipping strings and keywords.
fn extract_identifiers_from_js(expr: &str) -> Vec<String> {
    let mut idents = Vec::new();
    let chars: Vec<char> = expr.chars().collect();
    let len = chars.len();
    let mut i = 0;
    let mut in_string = false;
    let mut string_char = ' ';

    while i < len {
        let c = chars[i];

        // String tracking
        if c == '\'' || c == '"' || c == '`' {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char && (i == 0 || chars[i - 1] != '\\') {
                in_string = false;
            }
            i += 1;
            continue;
        }
        if in_string {
            i += 1;
            continue;
        }

        // Check for identifier start
        if c.is_alphabetic() || c == '_' || c == '$' {
            let start = i;
            while i < len && (chars[i].is_alphanumeric() || chars[i] == '_' || chars[i] == '$') {
                i += 1;
            }
            let ident: String = chars[start..i].iter().collect();
            // Skip keywords and common builtins
            if !is_js_keyword_or_builtin(&ident) && !idents.contains(&ident) {
                idents.push(ident);
            }
        } else {
            i += 1;
        }
    }

    idents
}

fn is_js_keyword_or_builtin(s: &str) -> bool {
    matches!(
        s,
        "true"
            | "false"
            | "null"
            | "undefined"
            | "this"
            | "new"
            | "typeof"
            | "instanceof"
            | "void"
            | "delete"
            | "in"
            | "of"
            | "let"
            | "const"
            | "var"
            | "function"
            | "class"
            | "return"
            | "if"
            | "else"
            | "for"
            | "while"
            | "do"
            | "switch"
            | "case"
            | "break"
            | "continue"
            | "throw"
            | "try"
            | "catch"
            | "finally"
            | "import"
            | "export"
            | "default"
            | "async"
            | "await"
            | "yield"
            | "from"
            | "as"
            | "escape"
    )
}

/// Track whether we're inside a template literal by counting unescaped backticks on a line.
///
/// Used to avoid adding indentation to content inside template literals.
/// Track template literal state across lines.
/// `state` is (in_template, brace_depth) where brace_depth > 0 means inside ${...}.
pub fn update_template_literal_state_for_indent(line: &str, currently_in_template: bool) -> bool {
    let (result, _) = update_template_literal_state_full(line, currently_in_template, 0);
    result
}

/// Full template literal state tracking with brace depth for ${...} expressions.
/// Returns (in_template, brace_depth).
pub fn update_template_literal_state_full(
    line: &str,
    currently_in_template: bool,
    current_brace_depth: i32,
) -> (bool, i32) {
    // All tokens we test (`'`, `"`, `` ` ``, `\`, `{`, `}`, `$`, `/`) are
    // ASCII, so byte indexing is UTF-8 safe.
    let mut in_template = currently_in_template;
    let mut brace_depth = current_brace_depth;
    let bytes = line.as_bytes();
    let mut i = 0;
    while i < bytes.len() {
        let c = bytes[i];

        // If we're inside a ${...} expression (brace_depth > 0)
        if brace_depth > 0 {
            if c == b'\'' || c == b'"' {
                // Skip string literals inside the expression
                let quote = c;
                i += 1;
                while i < bytes.len() {
                    if bytes[i] == b'\\' {
                        i += 2;
                        continue;
                    }
                    if bytes[i] == quote {
                        break;
                    }
                    i += 1;
                }
            } else if c == b'`' {
                // Nested template literal inside ${...}
                // For simplicity, skip it by counting backticks
                // (nested template literals are rare in practice)
                i += 1;
                continue;
            } else if c == b'{' {
                brace_depth += 1;
            } else if c == b'}' {
                brace_depth -= 1;
                if brace_depth == 0 {
                    // Closed the ${...} expression, back to template literal text
                    // in_template remains true
                }
            }
            i += 1;
            continue;
        }

        if in_template {
            if c == b'\\' {
                i += 2;
                continue;
            } else if c == b'`' {
                in_template = false;
            } else if c == b'$' && i + 1 < bytes.len() && bytes[i + 1] == b'{' {
                brace_depth = 1;
                i += 2;
                continue;
            }
        } else if c == b'\'' || c == b'"' {
            let quote = c;
            i += 1;
            while i < bytes.len() {
                if bytes[i] == b'\\' {
                    i += 2;
                    continue;
                }
                if bytes[i] == quote {
                    break;
                }
                i += 1;
            }
        } else if c == b'/' && i + 1 < bytes.len() && bytes[i + 1] == b'/' {
            break;
        } else if c == b'`' {
            in_template = true;
        }
        i += 1;
    }
    (in_template, brace_depth)
}

/// Normalize an import statement to match esrap formatting:
/// - If the single-line version is ≤ 83 chars, use single-line format
/// - If > 83 chars, break into multi-line with tab indentation per specifier
/// - No trailing commas on the last specifier
/// - Single quotes for module path
/// - Multi-line format: `import {\n\tspec1,\n\tspec2\n} from 'module';`
pub(crate) fn normalize_import(import_str: &str) -> String {
    let s = import_str.trim();

    // Only normalize named imports: `import { ... } from '...'`
    // Skip: `import * as`, `import '...'`, `import Foo from`
    let Some(brace_start) = s.find('{') else {
        return s.to_string();
    };
    let Some(brace_end) = s.rfind('}') else {
        return s.to_string();
    };

    // Extract the part before `{`, the specifiers, and the part after `}`
    let prefix = s[..brace_start].trim(); // "import" or "import type"
    let specifiers_str = &s[brace_start + 1..brace_end];
    let after_brace = s[brace_end + 1..].trim(); // "from '...'"  or "from '...';

    // Parse specifiers: split by commas, trim each, remove empty ones
    let specifiers: Vec<&str> = specifiers_str
        .split(',')
        .map(|s| s.trim())
        .filter(|s| !s.is_empty())
        .collect();

    if specifiers.is_empty() {
        return s.to_string();
    }

    let after_brace = after_brace.trim();

    // Build single-line version
    let single_line = format!("{} {{ {} }} {}", prefix, specifiers.join(", "), after_brace);

    // esrap threshold: the `sequence()` function in esrap uses `length > 60` to decide
    // multiline. The total length includes the `{ }` braces, specifier names, commas,
    // and spaces. We measure just the specifier part: `{ spec1, spec2 }` portion.
    let specifier_part_len = 2
        + specifiers.iter().map(|s| s.len()).sum::<usize>()
        + (specifiers.len().saturating_sub(1)) * 2; // ", " between specs
    if specifier_part_len <= 60 {
        // Ensure trailing semicolon
        if single_line.ends_with(';') {
            single_line
        } else {
            format!("{};", single_line)
        }
    } else {
        // Multi-line format
        let mut result = format!("{} {{\n", prefix);
        for (i, spec) in specifiers.iter().enumerate() {
            if i < specifiers.len() - 1 {
                let _ = writeln!(result, "\t{},", spec);
            } else {
                // Last specifier: no trailing comma
                let _ = writeln!(result, "\t{}", spec);
            }
        }
        let _ = write!(result, "}} {}", after_brace);
        if !result.ends_with(';') {
            result.push(';');
        }
        result
    }
}

/// Detect the space indentation unit of a script.
/// Returns the smallest non-zero leading-space count, or 0 if the script uses tabs.
fn detect_space_indent_unit(script: &str) -> usize {
    // If any line starts with a tab, assume tab-based indentation
    if script.lines().any(|l| l.starts_with('\t')) {
        return 0;
    }
    let mut min_spaces: Option<usize> = None;
    for line in script.lines() {
        if line.trim().is_empty() {
            continue;
        }
        let leading = line.len() - line.trim_start_matches(' ').len();
        if leading > 0 {
            min_spaces = Some(match min_spaces {
                Some(m) => m.min(leading),
                None => leading,
            });
        }
    }
    min_spaces.unwrap_or(0)
}

/// Find the byte index of `...` rest element in a destructuring pattern,
/// skipping `...` that appears inside string literals.
fn find_rest_element_index(inner: &str) -> Option<usize> {
    let bytes = inner.as_bytes();
    let len = bytes.len();
    let mut i = 0;
    let mut in_string = false;
    let mut string_char = 0u8;

    while i < len {
        if in_string {
            if bytes[i] == string_char && (i == 0 || bytes[i - 1] != b'\\') {
                in_string = false;
            }
            i += 1;
            continue;
        }
        if bytes[i] == b'\'' || bytes[i] == b'"' || bytes[i] == b'`' {
            in_string = true;
            string_char = bytes[i];
            i += 1;
            continue;
        }
        if i + 2 < len && bytes[i] == b'.' && bytes[i + 1] == b'.' && bytes[i + 2] == b'.' {
            return Some(i);
        }
        i += 1;
    }
    None
}

#[cfg(test)]
mod ts_strip_tests {
    use super::strip_ts_type_annotation;

    #[test]
    fn destructured_param_default_is_preserved() {
        // M-024: the trailing `= default` after a destructured TS snippet param
        // must survive type stripping.
        assert_eq!(strip_ts_type_annotation("{ a, b }: Props"), "{ a, b }");
        assert_eq!(
            strip_ts_type_annotation("{ a, b }: Props = {}"),
            "{ a, b } = {}"
        );
        assert_eq!(strip_ts_type_annotation("{ a, b } = {}"), "{ a, b } = {}");
        assert_eq!(
            strip_ts_type_annotation("{ a, b }: Map<string, number> = new Map()"),
            "{ a, b } = new Map()"
        );
        // A `=` inside a generic type arg is not the default separator.
        assert_eq!(strip_ts_type_annotation("{ a }: Foo<T = string>"), "{ a }");
        // Array pattern with default.
        assert_eq!(
            strip_ts_type_annotation("[a, b]: number[] = []"),
            "[a, b] = []"
        );
    }
}
