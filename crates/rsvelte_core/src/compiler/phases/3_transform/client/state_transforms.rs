//! State and prop assignment transformations, identifier analysis, and legacy transforms.

use memchr::memmem;
use rustc_hash::FxHashSet;
use std::borrow::Cow;

use super::STATE_TMP_COUNTER;
use super::destructure_transforms::{ArrayHelperRead, extract_destructure_paths};
use super::expression_utils::{
    byte_pos_to_char_index, find_statement_end_client, is_shadowed_by_for_loop_var,
};
use super::rune_transforms::{
    find_default_equals, find_derived_property_colon, split_derived_array_elements,
    split_derived_object_properties,
};
use crate::compiler::phases::phase2_analyze::scope::DeclarationKind;
#[cfg(test)]
use crate::compiler::phases::phase3_transform::shared::js_scan::code_bytes_from;
use crate::compiler::phases::phase3_transform::shared::js_scan::{code_bytes, skip_opaque};

// ---------------------------------------------------------------------------
// Identifier reference detection (lines 7653-8602 of mod.rs)
// ---------------------------------------------------------------------------

/// Check if a body references an identifier as a read (not only as an assignment target).
///
/// This is used to determine dependencies for `$.legacy_pre_effect()` calls.
/// A variable is a dependency if it's READ in the body, not if it's only written to.
///
/// For simple assignments like `c = a + b`, `c` is not a dependency, but `a` and `b` are.
/// For self-referential assignments like `count = count + 1`, `count` IS a dependency
/// because it appears on the RHS.
/// For block bodies like `{ c = a + b; count = count + 1; }`, we check each statement
/// within the block.
#[cfg(test)]
pub(super) fn body_references_identifier(body: &str, identifier: &str) -> bool {
    // Every strip below only blanks or deletes characters, so a name absent from
    // the raw body is absent from all of them. Callers ask this once per
    // (statement, reactive variable) pair, and almost every pair is a miss.
    if memmem::find(body.as_bytes(), identifier.as_bytes()).is_none() {
        return false;
    }

    let matcher = IdentifierMatcher::new(identifier);

    // Before checking, strip out function/arrow bodies that shadow the identifier
    // as a parameter. This prevents false positives where a function parameter
    // with the same name as an outer variable causes incorrect dependency tracking.
    // e.g., `(function (a) { return a; })(x)` - `a` is a parameter, not an outer var.
    let stripped_body = strip_function_scopes_that_shadow(body, identifier);

    // Strip string and template literal TEXT content to avoid false positives.
    // Template literals like `<circle cx="${width}">` contain text that might match
    // identifier names (e.g., `circle` in the HTML tag name). We keep the `${...}`
    // expression parts but blank out the literal text.
    let stripped_body = strip_string_literal_text(&stripped_body);

    // Strip non-shorthand, non-computed object property keys to avoid false positives.
    // In `{ details: null }`, `details` is a property key, NOT a variable reference.
    // But in `{ details }` (shorthand), `details` IS a variable reference.
    let stripped_body = strip_object_property_keys(&stripped_body);

    // Check if identifier appears in the stripped body at all
    if !matcher.is_match(&stripped_body) {
        return false;
    }

    // Use the recursive check that handles if/else, blocks, and compound statements
    body_references_identifier_recursive(stripped_body.trim(), identifier, &matcher)
}

/// Whether an identifier occurs in a body as a standalone reference.
///
/// This used to be a regex, rebuilt from a formatted pattern for every
/// (statement, variable) pair the dependency scan asks about; escaping the name,
/// formatting the pattern and hashing it to reach the cache was 70% of that
/// scan's cost. The rule it encodes needs no engine:
///
/// - `(^|[^a-zA-Z0-9_$])name([^a-zA-Z0-9_$]|$)` for the `$$`-prefixed compiler
///   specials, which are never member-access targets but do appear after a `.`
///   in a spread (`{ ...$$restProps }`)
/// - the same with `.` also excluded before the name for every other identifier,
///   so `obj.prop` does not match a standalone `prop` — except for a spread
///   prefix (`f(...prop)`), which reads it
#[cfg(test)]
pub(super) struct IdentifierMatcher<'a> {
    identifier: &'a str,
    /// `$$`-names accept a `.` immediately before them; the rest do not.
    allows_leading_dot: bool,
}

#[cfg(test)]
impl<'a> IdentifierMatcher<'a> {
    pub(super) fn new(identifier: &'a str) -> Self {
        Self {
            identifier,
            allows_leading_dot: identifier.starts_with("$$"),
        }
    }

    pub(super) fn is_match(&self, text: &str) -> bool {
        let needle = self.identifier.as_bytes();
        if needle.is_empty() {
            return false;
        }
        let bytes = text.as_bytes();
        let mut from = 0;
        // Advancing by one keeps overlapping occurrences reachable, which a
        // non-overlapping iterator would skip.
        while let Some(offset) = memmem::find(&bytes[from..], needle) {
            let start = from + offset;
            let end = start + needle.len();
            if self.boundaries_hold(bytes, start, end) {
                return true;
            }
            from = start + 1;
        }
        false
    }

    fn boundaries_hold(&self, bytes: &[u8], start: usize, end: usize) -> bool {
        // A UTF-8 continuation byte is never one of the ASCII characters the
        // classes below list, so comparing bytes answers the same question the
        // char classes did.
        if end < bytes.len() && continues_identifier(bytes[end]) {
            return false;
        }
        if start == 0 {
            return true;
        }
        let before = bytes[start - 1];
        if !continues_identifier(before) && (self.allows_leading_dot || before != b'.') {
            return true;
        }
        // `...name` is a spread, which reads the name rather than accessing it
        // as a member.
        !self.allows_leading_dot && start >= 3 && &bytes[start - 3..start] == b"..."
    }
}

#[cfg(test)]
fn continues_identifier(byte: u8) -> bool {
    byte.is_ascii_alphanumeric() || byte == b'_' || byte == b'$'
}

/// Byte just past the comment or regex literal starting at `i`, plus whether it
/// was a comment. Restricted to `/`-led runs on purpose: this scanner's whole job
/// is to descend into string and template literals, which `skip_opaque` — the
/// same lexer this delegates to — treats as opaque.
#[cfg(test)]
fn skip_slash_run(bytes: &[u8], i: usize, prev: Option<u8>) -> Option<(usize, bool)> {
    if bytes[i] != b'/' {
        return None;
    }
    skip_opaque(bytes, i, prev)
}

/// Strip text content from string literals and template literals, keeping expression parts.
///
/// Replaces:
/// - Single-quoted strings: `'text'` -> `'    '`
/// - Double-quoted strings: `"text"` -> `"    "`
/// - Template literal text: `` `text ${expr} text` `` -> `` `     ${expr}     ` ``
///
/// This prevents false identifier matches inside literal text, e.g., `<circle>` in
/// a template literal won't match the variable name `circle`.
#[cfg(test)]
pub(super) fn strip_string_literal_text(code: &str) -> std::borrow::Cow<'_, str> {
    // Fast path: if no string delimiters exist, return as-is
    // Uses memchr3 for SIMD-accelerated search of all three delimiters at once
    if memchr::memchr3(b'\'', b'"', b'`', code.as_bytes()).is_none() {
        return std::borrow::Cow::Borrowed(code);
    }

    // Work with bytes for performance (string literal delimiters are all ASCII)
    let bytes = code.as_bytes();
    let mut result: Vec<u8> = bytes.to_vec();
    let len = bytes.len();
    let mut i = 0;
    // Last significant code byte, to tell a regex literal from a division.
    let mut prev: Option<u8> = None;

    while i < len {
        // A quote inside a comment (`// don't`) or a regex literal (`/'/g`) must
        // not open a string and blank out every live read that follows it.
        if let Some((next, is_comment)) = skip_slash_run(bytes, i, prev) {
            if !is_comment {
                prev = Some(b'x');
            }
            i = next;
            continue;
        }
        if !bytes[i].is_ascii_whitespace() {
            prev = Some(bytes[i]);
        }
        match bytes[i] {
            // Handle single/double-quoted strings
            b'\'' | b'"' => {
                let quote = bytes[i];
                i += 1; // skip opening quote
                while i < len && bytes[i] != quote {
                    if bytes[i] == b'\\' && i + 1 < len {
                        result[i] = b' ';
                        result[i + 1] = b' ';
                        i += 2;
                    } else {
                        result[i] = b' ';
                        i += 1;
                    }
                }
                if i < len {
                    i += 1; // skip closing quote
                }
            }
            // Handle template literals
            b'`' => {
                i += 1; // skip opening backtick
                while i < len && bytes[i] != b'`' {
                    if bytes[i] == b'\\' && i + 1 < len {
                        result[i] = b' ';
                        result[i + 1] = b' ';
                        i += 2;
                    } else if bytes[i] == b'$' && i + 1 < len && bytes[i + 1] == b'{' {
                        // Keep `${` and skip to the expression inside
                        i += 2; // skip `${`
                        // Find matching `}` - track depth
                        let mut depth = 1;
                        let mut inner_prev: Option<u8> = None;
                        while i < len && depth > 0 {
                            if let Some((next, is_comment)) = skip_slash_run(bytes, i, inner_prev) {
                                if !is_comment {
                                    inner_prev = Some(b'x');
                                }
                                i = next;
                                continue;
                            }
                            if !bytes[i].is_ascii_whitespace() {
                                inner_prev = Some(bytes[i]);
                            }
                            match bytes[i] {
                                b'{' => depth += 1,
                                b'}' => {
                                    depth -= 1;
                                    if depth == 0 {
                                        i += 1; // skip closing `}`
                                        break;
                                    }
                                }
                                // Handle nested template literals
                                b'`' => {
                                    i += 1;
                                    // Skip nested template literal
                                    let mut nested_depth = 0;
                                    while i < len && (bytes[i] != b'`' || nested_depth > 0) {
                                        if bytes[i] == b'$' && i + 1 < len && bytes[i + 1] == b'{' {
                                            nested_depth += 1;
                                            i += 2;
                                        } else if bytes[i] == b'}' && nested_depth > 0 {
                                            nested_depth -= 1;
                                            i += 1;
                                        } else if bytes[i] == b'\\' && i + 1 < len {
                                            i += 2;
                                        } else {
                                            i += 1;
                                        }
                                    }
                                    if i < len {
                                        i += 1; // skip closing backtick
                                    }
                                    continue;
                                }
                                b'\'' | b'"' => {
                                    // Strip string content inside expression
                                    let quote = bytes[i];
                                    i += 1;
                                    while i < len && bytes[i] != quote {
                                        if bytes[i] == b'\\' && i + 1 < len {
                                            result[i] = b' ';
                                            result[i + 1] = b' ';
                                            i += 2;
                                        } else {
                                            result[i] = b' ';
                                            i += 1;
                                        }
                                    }
                                    if i < len {
                                        i += 1;
                                    }
                                    continue;
                                }
                                _ => {}
                            }
                            i += 1;
                        }
                    } else {
                        // Regular text in template literal - blank it out
                        result[i] = b' ';
                        i += 1;
                    }
                }
                if i < len {
                    i += 1; // skip closing backtick
                }
            }
            // Skip escaped characters outside strings
            b'\\' if i + 1 < len => {
                i += 2;
            }
            _ => {
                i += 1;
            }
        }
    }

    String::from_utf8(result)
        .map(std::borrow::Cow::Owned)
        .unwrap_or(std::borrow::Cow::Borrowed(code))
}

/// Strip non-shorthand, non-computed object property keys from code.
///
/// In `{ details: null }`, `details` is a property key and not a variable reference.
/// In `{ details }` (shorthand), `details` IS a variable reference.
///
/// This function replaces property key identifiers with spaces to avoid false positive
/// dependency detection. It handles:
/// - `{ key: value }` -> `{     value }` (non-shorthand key blanked)
/// - `{ key }` -> `{ key }` (shorthand preserved)
/// - `{ [expr]: value }` -> `{ [expr]: value }` (computed preserved)
#[cfg(test)]
pub(super) fn strip_object_property_keys(code: &str) -> std::borrow::Cow<'_, str> {
    // A key can only be blanked at a `:`, and the two `Vec<char>` below cost four
    // bytes per source byte, so the absence of one is worth checking for.
    if memchr::memchr(b':', code.as_bytes()).is_none() {
        return std::borrow::Cow::Borrowed(code);
    }
    let chars: Vec<char> = code.chars().collect();
    let len = chars.len();
    let mut result: Vec<char> = chars.clone();
    let mut i = 0;
    let mut in_string = false;
    let mut string_char = '"';

    while i < len {
        let c = chars[i];

        // Handle string literals
        if !in_string && (c == '\'' || c == '"' || c == '`') {
            in_string = true;
            string_char = c;
            i += 1;
            continue;
        }
        if in_string {
            if c == '\\' {
                i += 2;
                continue;
            }
            if c == string_char {
                in_string = false;
            }
            i += 1;
            continue;
        }

        // Look for patterns like: identifier followed by `:` followed by non-`:` (not shorthand)
        // This matches `key: value` in object literals but NOT `key` in shorthand properties.
        // We need to be careful not to match ternary operators or labels.
        if c.is_alphabetic() || c == '_' || c == '$' {
            let id_start = i;
            // Read the identifier
            while i < len && (chars[i].is_alphanumeric() || chars[i] == '_' || chars[i] == '$') {
                i += 1;
            }
            let id_end = i;

            // Skip whitespace
            let mut j = i;
            while j < len && chars[j].is_whitespace() {
                j += 1;
            }

            // Check if followed by `:` but NOT `::` (not a label in a switch, not ternary)
            if j < len && chars[j] == ':' && (j + 1 >= len || chars[j + 1] != ':') {
                // Check what comes BEFORE the identifier to see if this is in an object context.
                // We look for `{`, `,`, or newline before the identifier (skipping whitespace).
                let mut k = id_start;
                while k > 0 && chars[k - 1].is_whitespace() {
                    k -= 1;
                }
                let in_object_context = k == 0
                    || (k > 0
                        && (chars[k - 1] == '{' || chars[k - 1] == ',' || chars[k - 1] == '\n'));

                if in_object_context {
                    // This looks like a property key - blank it out
                    for ch in result.iter_mut().take(id_end).skip(id_start) {
                        *ch = ' ';
                    }
                }
            }
            continue;
        }

        i += 1;
    }

    std::borrow::Cow::Owned(result.into_iter().collect())
}

/// Whether `c` can follow the last character of a parameter name. Spelled over
/// characters rather than the single space the ASCII whitelist accepted, because
/// `U+3000` and NBSP separate a parameter exactly as a space does.
#[cfg(test)]
fn ends_a_parameter_name(c: char) -> bool {
    c == ',' || c == ')' || c == ':' || c.is_whitespace()
}

/// Strip out function/arrow expression bodies where the identifier is declared as a parameter.
/// This replaces the function body (including the function itself) with empty space,
/// leaving only the parts of the code that don't shadow the identifier.
///
/// Handles patterns like:
/// - `function (a) { ... }` -> `                   `
/// - `(a) => { ... }` -> `              `
/// - `(a) => expr` -> `            `
#[cfg(test)]
pub(super) fn strip_function_scopes_that_shadow<'a>(
    body: &'a str,
    identifier: &str,
) -> std::borrow::Cow<'a, str> {
    // Only a `function` keyword or an arrow can introduce a shadowing parameter,
    // and the common reactive body has neither.
    if memmem::find(body.as_bytes(), b"function").is_none()
        && memmem::find(body.as_bytes(), b"=>").is_none()
    {
        return std::borrow::Cow::Borrowed(body);
    }
    let mut result = body.to_string();

    // Pattern: `function identifier(params) { body }` or `function (params) { body }`
    // where params contain our identifier
    let fn_patterns = [
        format!("function ({}", identifier),
        format!("function({}", identifier),
    ];

    for pat in &fn_patterns {
        while let Some(pos) = result.find(pat.as_str()) {
            // Verify the identifier is actually a parameter (followed by `,` or `)`)
            let after_ident = pos + pat.len();
            if crate::compiler::utils::char_at(&result, after_ident)
                .is_some_and(|next_char| !ends_a_parameter_name(next_char))
            {
                // Not a word boundary - the pattern is a prefix of a longer name
                // Replace just this occurrence to prevent infinite loop
                result.replace_range(pos..pos + 1, " ");
                continue;
            }

            // Find the opening brace of the function body
            let mut found_paren_close = false;
            let mut brace_start = None;
            let mut depth = 1; // We're inside the opening (
            for (i, ch) in code_bytes_from(result.as_bytes(), after_ident) {
                if !found_paren_close {
                    match ch {
                        b'(' => depth += 1,
                        b')' => {
                            depth -= 1;
                            if depth == 0 {
                                found_paren_close = true;
                            }
                        }
                        _ => {}
                    }
                } else if ch == b'{' {
                    brace_start = Some(i);
                    break;
                } else if !ch.is_ascii_whitespace() {
                    break;
                }
            }

            if let Some(brace_pos) = brace_start {
                // Find matching closing brace
                let mut brace_depth = 1;
                let mut end_pos = brace_pos + 1;
                for (i, ch) in code_bytes_from(result.as_bytes(), brace_pos + 1) {
                    match ch {
                        b'{' => brace_depth += 1,
                        b'}' => {
                            brace_depth -= 1;
                            if brace_depth == 0 {
                                end_pos = i + 1;
                                break;
                            }
                        }
                        _ => {}
                    }
                }

                // Replace the entire function (from `function` keyword to closing brace) with spaces
                let spaces = " ".repeat(end_pos - pos);
                result.replace_range(pos..end_pos, &spaces);
            } else {
                // No brace found - just break to prevent infinite loop
                break;
            }
        }
    }

    // Also handle arrow functions: `(identifier) => { ... }` or `(identifier, ...) => { ... }`
    // and `identifier => { ... }` or `identifier => expr`
    // This is more complex, so we handle the common patterns
    let arrow_param_patterns = [
        format!("({}", identifier),
        // Simple single-param arrow: `identifier =>`
    ];

    for pat in &arrow_param_patterns {
        let mut search_from = 0;
        while let Some(p) = result[search_from..].find(pat.as_str()) {
            let pos = search_from + p;

            // For `(identifier` pattern, verify it's a parameter
            let after_ident = pos + pat.len();
            if after_ident >= result.len() {
                break;
            }
            if !crate::compiler::utils::char_at(&result, after_ident)
                .is_some_and(ends_a_parameter_name)
            {
                search_from = crate::compiler::utils::next_char_boundary(&result, pos);
                continue;
            }

            // Check if preceded by `function` keyword - already handled above
            let before = result[..pos].trim_end();
            if before.ends_with("function") {
                search_from = crate::compiler::utils::next_char_boundary(&result, pos);
                continue;
            }

            // Find `) =>`  after the params
            let mut paren_depth = 1;
            let mut paren_close_idx = None;
            for (i, ch) in code_bytes_from(result.as_bytes(), after_ident) {
                match ch {
                    b'(' => paren_depth += 1,
                    b')' => {
                        paren_depth -= 1;
                        if paren_depth == 0 {
                            paren_close_idx = Some(i);
                            break;
                        }
                    }
                    _ => {}
                }
            }

            if let Some(paren_close) = paren_close_idx {
                // Look for `=>` after `)`
                let after_paren = result[paren_close + 1..].trim_start();
                if after_paren.starts_with("=>") {
                    let arrow_pos =
                        memchr::memmem::find(&result.as_bytes()[paren_close + 1..], b"=>").unwrap()
                            + paren_close
                            + 1;
                    let body_start = arrow_pos + 2;
                    let body_text = result[body_start..].trim_start();
                    let body_offset = body_start + (result[body_start..].len() - body_text.len());

                    if body_text.starts_with('{') {
                        // Block body arrow - find matching brace
                        let mut brace_depth = 1;
                        let mut end_pos = body_offset + 1;
                        for (i, ch) in code_bytes_from(result.as_bytes(), body_offset + 1) {
                            match ch {
                                b'{' => brace_depth += 1,
                                b'}' => {
                                    brace_depth -= 1;
                                    if brace_depth == 0 {
                                        end_pos = i + 1;
                                        break;
                                    }
                                }
                                _ => {}
                            }
                        }
                        let spaces = " ".repeat(end_pos - pos);
                        result.replace_range(pos..end_pos, &spaces);
                    } else {
                        // Expression body arrow: scan forward from body_offset to find the
                        // end of the expression (top-level `,` `)` `]` `;` or end of string).
                        let mut end_pos = result.len();
                        let mut pdepth = 0i32;
                        let mut bdepth = 0i32;
                        let mut brdepth = 0i32;
                        for (p, c) in code_bytes_from(result.as_bytes(), body_offset) {
                            let at_top = pdepth == 0 && bdepth == 0 && brdepth == 0;
                            match c {
                                b'(' => pdepth += 1,
                                b')' if at_top => {
                                    end_pos = p;
                                    break;
                                }
                                b')' => pdepth -= 1,
                                b'{' => bdepth += 1,
                                b'}' if at_top => {
                                    end_pos = p;
                                    break;
                                }
                                b'}' => bdepth -= 1,
                                b'[' => brdepth += 1,
                                b']' if at_top => {
                                    end_pos = p;
                                    break;
                                }
                                b']' => brdepth -= 1,
                                b',' | b';' if at_top => {
                                    end_pos = p;
                                    break;
                                }
                                _ => {}
                            }
                        }
                        let spaces = " ".repeat(end_pos - pos);
                        result.replace_range(pos..end_pos, &spaces);
                    }
                } else {
                    search_from = paren_close + 1;
                }
            } else {
                search_from = crate::compiler::utils::next_char_boundary(&result, pos);
            }
        }
    }

    std::borrow::Cow::Owned(result)
}

/// Recursively check if an identifier is read (not just assigned to) in a body of code.
/// Handles block statements, if/else blocks, and compound statements.
#[cfg(test)]
pub(super) fn body_references_identifier_recursive(
    body: &str,
    identifier: &str,
    re: &IdentifierMatcher<'_>,
) -> bool {
    let trimmed = body.trim();

    if !re.is_match(trimmed) {
        return false;
    }

    // Handle block statements: strip outer braces and process inner content
    if trimmed.starts_with('{') && trimmed.ends_with('}') {
        let inner = &trimmed[1..trimmed.len() - 1];
        return body_references_identifier_in_statements(inner, identifier, re);
    }

    // Handle if/else statements: check the condition AND body blocks recursively
    if let Some(stripped) = trimmed.strip_prefix("if") {
        let after_if = stripped.trim();
        if after_if.starts_with('(') {
            // Find matching closing paren for the condition
            let mut depth = 0i32;
            let mut cond_end = None;
            for (i, ch) in code_bytes(after_if.as_bytes()) {
                match ch {
                    b'(' => depth += 1,
                    b')' => {
                        depth -= 1;
                        if depth == 0 {
                            cond_end = Some(i);
                            break;
                        }
                    }
                    _ => {}
                }
            }
            if let Some(cond_end_idx) = cond_end {
                let condition = &after_if[1..cond_end_idx];
                let after_cond = after_if[cond_end_idx + 1..].trim();

                // Check if identifier is in the condition (always a read)
                if re.is_match(condition) {
                    return true;
                }

                // Extract the if-block body and check recursively
                if after_cond.starts_with('{') {
                    // Block body
                    let mut brace_depth = 0i32;
                    let mut block_end = None;
                    for (i, ch) in code_bytes(after_cond.as_bytes()) {
                        match ch {
                            b'{' => brace_depth += 1,
                            b'}' => {
                                brace_depth -= 1;
                                if brace_depth == 0 {
                                    block_end = Some(i);
                                    break;
                                }
                            }
                            _ => {}
                        }
                    }
                    if let Some(block_end_idx) = block_end {
                        let if_body = &after_cond[..block_end_idx + 1];
                        if body_references_identifier_recursive(if_body, identifier, re) {
                            return true;
                        }
                        // Check else branch if present
                        let remainder = after_cond[block_end_idx + 1..].trim();
                        if let Some(else_part) = remainder.strip_prefix("else") {
                            return body_references_identifier_recursive(
                                else_part.trim(),
                                identifier,
                                re,
                            );
                        }
                    }
                } else {
                    // Single-statement if body (no braces)
                    // In this case, just check the statement
                    return check_identifier_in_statement(after_cond, identifier, re);
                }

                return false;
            }
        }
    }

    // For simple (non-block, non-if) bodies, check for assignment pattern
    check_identifier_in_statement(trimmed, identifier, re)
}

/// Check if an identifier is referenced as a read across multiple statements.
#[cfg(test)]
pub(super) fn body_references_identifier_in_statements(
    content: &str,
    identifier: &str,
    re: &IdentifierMatcher<'_>,
) -> bool {
    // Split by semicolons and newlines, but be careful with nested blocks
    // Simple approach: scan for statements at depth 0
    let mut depth = 0;
    let mut start = 0;

    for (i, c) in code_bytes(content.as_bytes()) {
        match c {
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' if depth > 0 => {
                depth -= 1;
            }
            b';' | b'\n' if depth == 0 => {
                let stmt = content[start..i].trim();
                if !stmt.is_empty() && check_identifier_in_statement(stmt, identifier, re) {
                    return true;
                }
                start = i + 1;
            }
            _ => {}
        }
    }

    // Check the last statement
    let stmt = content[start..].trim();
    if !stmt.is_empty() && check_identifier_in_statement(stmt, identifier, re) {
        return true;
    }

    false
}

/// Check if an identifier appears as a read (not just assignment target) in a single statement.
#[cfg(test)]
pub(super) fn check_identifier_in_statement(
    stmt: &str,
    identifier: &str,
    re: &IdentifierMatcher<'_>,
) -> bool {
    if !re.is_match(stmt) {
        return false;
    }

    // Check for simple assignment pattern: `identifier = expr`
    if let Some(eq_pos) = find_assignment_position(stmt) {
        let lhs = &stmt[..eq_pos];
        let rhs = &stmt[eq_pos + 1..];

        // If the LHS contains `?`, this is likely a ternary expression where the
        // first `=` was found inside a ternary branch (e.g., `cond ? x = a : x = b`).
        // In this case, don't treat it as a simple assignment. Instead, analyze the
        // ternary condition and branches separately.
        if lhs.contains('?') {
            // Find the `?` position to extract the condition
            if let Some(q_pos) = lhs.find('?') {
                let condition = lhs[..q_pos].trim();
                // Check if identifier is read in the condition
                if re.is_match(condition) {
                    return true;
                }
                // The rest is the true-branch assignment and the false-branch (in rhs after `:`)
                let true_branch_lhs = lhs[q_pos + 1..].trim();
                // `rhs` is something like `Sub : component = banana`
                // Check if identifier is the assignment target in both branches
                // True branch: `true_branch_lhs = <rhs_before_colon>`
                // False branch: `<rhs_after_colon_lhs> = <rhs_after_colon_rhs>`
                if let Some(colon_pos) = find_colon_at_depth0(rhs) {
                    let true_rhs = rhs[..colon_pos].trim();
                    let false_branch = rhs[colon_pos + 1..].trim();

                    // Check if identifier appears in true branch RHS (a read)
                    if re.is_match(true_rhs) {
                        return true;
                    }

                    // Parse false branch as an assignment
                    if let Some(false_eq_pos) = find_assignment_position(false_branch) {
                        let false_lhs = false_branch[..false_eq_pos].trim();
                        let false_rhs = false_branch[false_eq_pos + 1..].trim();

                        // Check if identifier appears in false branch RHS (a read)
                        if re.is_match(false_rhs) {
                            return true;
                        }

                        // If identifier is the assignment target in both branches, it's not a read
                        if true_branch_lhs == identifier && false_lhs == identifier {
                            return false;
                        }
                    }
                }

                // Fall through to default: treat as read
                return true;
            }
        }

        // If identifier appears on the RHS, it's definitely a read/dependency
        if re.is_match(rhs) {
            return true;
        }

        // Also check for spread syntax: `...identifier` in the RHS.
        // The regex excludes `.` as a valid preceding character (to avoid matching
        // property accesses like `obj.prop`), but `...` is a spread operator, not
        // a property access. Check for `...identifier` patterns explicitly.
        {
            let spread_pattern = format!("...{}", identifier);
            if rhs.contains(&spread_pattern) {
                // Verify the char after identifier is a word boundary
                let after_pos = rhs.find(&spread_pattern).unwrap() + spread_pattern.len();
                if after_pos >= rhs.len()
                    || !rhs[after_pos..]
                        .starts_with(|c: char| c.is_alphanumeric() || c == '_' || c == '$')
                {
                    return true;
                }
            }
        }

        // If identifier is the entire LHS (sole assignment target), it's NOT a read
        if lhs.trim() == identifier {
            return false;
        }

        // If identifier appears on the LHS but is not the whole LHS (e.g., `foo.bar = x`
        // and identifier is `foo`), check whether it's ONLY being mutated (base of member
        // expression) or also read somewhere.
        // A mutation target like `foo` in `foo.bar = x` is NOT a dependency UNLESS
        // `foo` also appears on the RHS.
        if re.is_match(lhs) {
            // Check if the identifier is the base of a member expression on the LHS.
            // i.e., lhs starts with `identifier.` or `identifier[`
            let lhs_trimmed = lhs.trim();
            let is_mutation_base = lhs_trimmed.starts_with(&format!("{}.", identifier))
                || lhs_trimmed.starts_with(&format!("{}[", identifier));
            if is_mutation_base {
                // Only a mutation - not a dependency unless also used on RHS
                // (RHS check was done above and returned false if found there)
                return false;
            }
            // Otherwise (e.g., nested member expression like `obj.foo.bar = x` and identifier
            // is `foo`), treat as a read
            return true;
        }

        return false;
    }

    // No simple assignment found - the identifier is used in some other context
    // (function call, condition, etc.) - treat as a read
    true
}

/// Check if a string starts with a JavaScript control-flow keyword.
///
/// When `find_assignment_position` returns a position, the text to the left is
/// the "LHS". If that LHS begins with a keyword such as `if`, `for`, `while`,
/// `do`, `switch`, or `try`, then the `=` is actually inside a nested
/// statement and not a top-level assignment.
pub(super) fn lhs_starts_with_keyword(lhs: &str) -> bool {
    let lhs = lhs.trim();
    for keyword in &[
        "if ", "if(", "for ", "for(", "while ", "while(", "do ", "do{", "switch ", "switch(",
        "try ", "try{",
    ] {
        if lhs.starts_with(keyword) {
            return true;
        }
    }
    false
}

/// Find the position of the assignment operator (=) that's not part of ==, ===, !=, !==
pub(super) fn find_assignment_position(expr: &str) -> Option<usize> {
    let bytes = expr.as_bytes();
    let mut i = 0;
    let mut depth = 0i32;
    // Last significant code byte, both for the operator lookbehind and to tell a
    // regex literal from a division.
    let mut prev: Option<u8> = None;

    while i < bytes.len() {
        if let Some((next, is_comment)) = skip_opaque(bytes, i, prev) {
            if !is_comment {
                prev = Some(b'x');
            }
            i = next;
            continue;
        }
        let c = bytes[i];
        match c {
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => depth -= 1,
            b'=' if depth == 0 => {
                // Check it's not ==, ===, !=, !==, <=, >=, =>,
                // or compound assignment operators: +=, -=, *=, /=, %=, **=,
                // <<=, >>=, >>>=, &=, |=, ^=, &&=, ||=, ??=
                let next = bytes.get(i + 1).copied();

                if !matches!(
                    prev,
                    Some(
                        b'=' | b'!'
                            | b'<'
                            | b'>'
                            | b'+'
                            | b'-'
                            | b'*'
                            | b'/'
                            | b'%'
                            | b'&'
                            | b'|'
                            | b'^'
                            | b'?'
                    )
                ) && next != Some(b'=')
                    && next != Some(b'>')
                {
                    return Some(i);
                }
            }
            _ => {}
        }
        if !c.is_ascii_whitespace() {
            prev = Some(c);
        }
        i += 1;
    }
    None
}

/// Find the position of a `:` at depth 0 in an expression.
/// This is used to split ternary expressions like `true_rhs : false_branch`.
/// The returned position is a **byte** offset: the caller slices `expr` with it.
#[cfg(test)]
pub(super) fn find_colon_at_depth0(expr: &str) -> Option<usize> {
    // Not `code_bytes`: `${`/`}` move the outer depth here and the bookkeeping is
    // preserved exactly rather than re-derived. UTF-8 continuation bytes are all
    // >= 0x80, so they never match an ASCII arm.
    let bytes = expr.as_bytes();
    let mut depth = 0;
    let mut i = 0;

    while i < bytes.len() {
        match bytes[i] {
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => depth -= 1,
            b':' if depth == 0 => return Some(i),
            b'/' if bytes.get(i + 1) == Some(&b'/') => {
                i += 2;
                while i < bytes.len() && bytes[i] != b'\n' {
                    i += 1;
                }
                continue;
            }
            b'/' if bytes.get(i + 1) == Some(&b'*') => {
                i += 2;
                while i < bytes.len() && !(bytes[i] == b'*' && bytes.get(i + 1) == Some(&b'/')) {
                    i += 1;
                }
                i += 1;
            }
            quote @ (b'\'' | b'"') => {
                // Skip string literals
                i += 1;
                while i < bytes.len() && bytes[i] != quote {
                    if bytes[i] == b'\\' && i + 1 < bytes.len() {
                        i += 1;
                    }
                    i += 1;
                }
            }
            b'`' => {
                // Skip template literals
                i += 1;
                while i < bytes.len() && bytes[i] != b'`' {
                    if bytes[i] == b'$' && bytes.get(i + 1) == Some(&b'{') {
                        depth += 1;
                        i += 1;
                    } else if bytes[i] == b'}' && depth > 0 {
                        depth -= 1;
                    } else if bytes[i] == b'\\' && i + 1 < bytes.len() {
                        i += 1;
                    }
                    i += 1;
                }
            }
            _ => {}
        }
        i += 1;
    }
    None
}

/// Extract the base identifier from a member expression like `obj.foo` or `arr[idx]`.
///
/// Returns the base identifier name if the input starts with a valid identifier followed
/// by `.` or `[`. Returns `None` if the input is not a simple member expression.
///
/// # Examples
///
/// - `"obj.foo"` → `Some("obj")`
/// - `"arr[idx]"` → `Some("arr")`
/// - `"obj"` → `None` (no member separator)
/// - `".foo"` → `None` (empty base)
pub(super) fn extract_member_expression_base(lhs: &str) -> Option<&str> {
    let lhs = lhs.trim();
    let dot_pos = lhs.find('.');
    let bracket_pos = lhs.find('[');
    let sep_pos = match (dot_pos, bracket_pos) {
        (Some(d), Some(b)) => Some(d.min(b)),
        (Some(d), None) => Some(d),
        (None, Some(b)) => Some(b),
        (None, None) => None,
    };
    if let Some(pos) = sep_pos {
        let base = &lhs[..pos];
        // Must be a valid identifier (alphanumeric, underscore, dollar sign)
        // and non-empty
        if !base.is_empty()
            && base
                .chars()
                .all(|c| c.is_alphanumeric() || c == '_' || c == '$')
            && base
                .chars()
                .next()
                .map(|c| !c.is_ascii_digit())
                .unwrap_or(false)
        {
            Some(base)
        } else {
            None
        }
    } else {
        None
    }
}

// ---------------------------------------------------------------------------
// Context detection utilities (lines 11537-11931 of mod.rs)
// ---------------------------------------------------------------------------

/// Check if a position is inside a string literal.
/// This prevents transforming identifiers inside quoted strings.
/// Handles template literal interpolations: `foo ${bar} baz` - bar is NOT inside a string.
pub(super) fn is_inside_string_literal(code: &str, pos: usize) -> bool {
    let before = &code[..pos];
    let mut in_string = false;
    let mut string_char = ' ';
    // Track template literal interpolation depth.
    // When inside a backtick string and we see `${`, we push to this stack.
    // The value represents the brace depth within the interpolation.
    let mut template_interp_depth: Vec<usize> = Vec::new();
    let mut chars = before.chars().peekable();

    while let Some(c) = chars.next() {
        if in_string {
            if c == '\\' {
                // Skip escaped character
                chars.next();
                continue;
            }
            // Inside a template literal, handle `${` as interpolation start
            if string_char == '`' && c == '$' && chars.peek() == Some(&'{') {
                chars.next(); // consume '{'
                in_string = false;
                template_interp_depth.push(0);
                continue;
            }
            if c == string_char {
                in_string = false;
            }
            continue;
        }

        // A quote inside a comment is text: `// it doesn't matter` would
        // otherwise open a string that nothing closes, so every position after
        // it reads as "inside a string" and its rewrite is skipped.
        if c == '/' {
            match chars.peek() {
                Some('/') => {
                    chars.next();
                    for ch in chars.by_ref() {
                        if ch == '\n' {
                            break;
                        }
                    }
                    continue;
                }
                Some('*') => {
                    chars.next();
                    let mut prev = '\0';
                    for ch in chars.by_ref() {
                        if prev == '*' && ch == '/' {
                            break;
                        }
                        prev = ch;
                    }
                    continue;
                }
                _ => {}
            }
        }

        if !template_interp_depth.is_empty() {
            // Inside a template literal interpolation - track braces
            if c == '{' {
                if let Some(depth) = template_interp_depth.last_mut() {
                    *depth += 1;
                }
            } else if c == '}' {
                let should_pop = template_interp_depth
                    .last()
                    .is_some_and(|depth| *depth == 0);
                if should_pop {
                    template_interp_depth.pop();
                    // We're back inside the template literal string
                    in_string = true;
                    string_char = '`';
                } else if let Some(depth) = template_interp_depth.last_mut() {
                    *depth -= 1;
                }
            } else if c == '"' || c == '\'' || c == '`' {
                in_string = true;
                string_char = c;
            }
        } else if c == '"' || c == '\'' || c == '`' {
            in_string = true;
            string_char = c;
        }
    }

    in_string
}

// ---------------------------------------------------------------------------
// State/prop assignments and legacy transforms (lines 11933-13491 of mod.rs)
// ---------------------------------------------------------------------------

/// Wrap `$.set(var, ...)` calls with `$.store_unsub()` when the state variable has
/// a corresponding store subscription (`$var`).
///
/// This is needed because when a store variable like `foo = writable(42)` is reassigned,
/// the store subscription needs to be unsubscribed and resubscribed.
///
/// Transforms:
/// - `$.set(foo, writable(42))` → `$.store_unsub($.set(foo, writable(42)), '$foo', $$stores)`
///
/// Reference: declarations.js `add_state_transformers` → `assign_value_with_store`
pub(super) fn wrap_store_unsub_for_state_sets<'a>(
    line: &'a str,
    state_vars: &[String],
    store_sub_vars: &[String],
) -> Cow<'a, str> {
    if state_vars.is_empty() || store_sub_vars.is_empty() {
        return Cow::Borrowed(line);
    }
    if memmem::find(line.as_bytes(), b"$.set(").is_none() {
        return Cow::Borrowed(line);
    }
    super::store_unsub_wrap_ast::transform_store_unsub_wrap_ast(line, state_vars, store_sub_vars)
        .map_or(Cow::Borrowed(line), Cow::Owned)
}

/// Transform prop assignments to getter/setter function call syntax.
///
/// Props in legacy mode are declared with $.prop() which returns a getter/setter function.
/// So `x = value` becomes `x(value)`, and `x += 1` becomes `x(x() + 1)`.
///
/// This handles:
/// - Simple assignment: `x = value` → `x(value)`
/// - Compound assignment: `x += value` → `x(x() + value)`
///
/// Note: Update expressions (x++, --x, etc.) are handled by transform_prop_update_expressions
/// which must be called BEFORE this function.
pub(super) fn transform_prop_assignments<'a>(
    line: &'a str,
    prop_vars: &[String],
    non_bindable_prop_vars: &[String],
    prop_invalidate_bodies: &rustc_hash::FxHashMap<String, String>,
) -> Cow<'a, str> {
    if prop_vars.is_empty() {
        return Cow::Borrowed(line);
    }

    // Skip lines that are prop declarations (contain $.prop() or $.rest_props())
    // These are generated by transform_props_destructuring and should not be modified.
    // In multi-declarator statements like `let foo = $.prop(...),\n\tbar = $.prop(...)`,
    // the subsequent declarators don't have `let` before them, so the simple assignment
    // transform would incorrectly convert `bar = $.prop(...)` to `bar($.prop(...))`.
    if memmem::find(line.as_bytes(), b"$.prop(").is_some()
        || memmem::find(line.as_bytes(), b"$.rest_props(").is_some()
    {
        return Cow::Borrowed(line);
    }

    // Quick pre-check: if none of the prop vars appear as identifiers, skip expensive transforms
    let var_set: FxHashSet<&str> = prop_vars.iter().map(|v| v.as_str()).collect();
    if !super::utils::text_contains_any_identifier(line, &var_set) {
        return Cow::Borrowed(line);
    }

    // Two AST passes — both cover every shape the text loops
    // (just deleted) used to handle:
    // 1. `name = expr` / `name <op>= expr` (bare LHS) →
    //    `name(expr)` / `name(name() <op> (expr))`
    // 2. `name.foo = expr` / `name().foo = expr` (bindable prop
    //    member mutations) → `name(name().foo = expr, true)`
    let after_assigns = super::prop_assign_ast::transform_prop_assign_ast(line, prop_vars);
    let stage1: &str = after_assigns.as_deref().unwrap_or(line);
    let mutated = super::prop_member_mutate_ast::transform_prop_member_mutate_ast(
        stage1,
        prop_vars,
        non_bindable_prop_vars,
        prop_invalidate_bodies,
    );
    mutated
        .or(after_assigns)
        .map_or(Cow::Borrowed(line), Cow::Owned)
}

/// Split a multi-declarator variable statement into individual declarations.
///
/// Converts `let a = 1, b = 2, c = 3;` into `["let a = 1;", "let b = 2;", "let c = 3;"]`
/// while handling nested structures like arrays and objects correctly.
///
/// If the line is not a multi-declarator statement, returns None.
pub(super) fn split_multi_declarator(line: &str) -> Option<Vec<String>> {
    // Check if this is a variable declaration
    let trimmed = line.trim();
    let (keyword, rest) = if let Some(r) = trimmed.strip_prefix("let ") {
        ("let", r)
    } else if let Some(r) = trimmed.strip_prefix("const ") {
        ("const", r)
    } else {
        let r = trimmed.strip_prefix("var ")?;
        ("var", r)
    };

    // Split at every top-level `,`, stopping at a top-level `;`. `code_bytes`
    // yields only the delimiters that are code, so the text between two cut
    // points — comments and literals included — is copied verbatim.
    let mut depth = 0;
    let mut cuts: Vec<(usize, u8)> = Vec::new();
    for (i, c) in code_bytes(rest.as_bytes()) {
        match c {
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' if depth > 0 => {
                depth -= 1;
            }
            b',' if depth == 0 => cuts.push((i, c)),
            b';' if depth == 0 => {
                cuts.push((i, c));
                break;
            }
            _ => {}
        }
    }

    if !cuts.iter().any(|&(_, c)| c == b',') {
        return None;
    }

    let mut declarators: Vec<String> = Vec::new();
    let mut start = 0usize;
    let mut ended_at_semicolon = false;
    for &(i, c) in &cuts {
        let piece = &rest[start..i];
        if c == b';' {
            if !piece.trim().is_empty() {
                declarators.push(piece.trim().to_string());
            }
            ended_at_semicolon = true;
        } else {
            declarators.push(piece.trim().trim_end_matches(';').trim().to_string());
        }
        start = i + 1;
        if ended_at_semicolon {
            break;
        }
    }
    if !ended_at_semicolon {
        let piece = &rest[start..];
        if !piece.trim().is_empty() {
            declarators.push(piece.trim().trim_end_matches(';').trim().to_string());
        }
    }

    if declarators.len() <= 1 {
        return None;
    }

    // Get leading whitespace from original line
    let leading_ws: String = line.chars().take_while(|c| c.is_whitespace()).collect();

    // Convert to individual declarations
    let result: Vec<String> = declarators
        .iter()
        .map(|d| format!("{}{} {};", leading_ws, keyword, d))
        .collect();

    Some(result)
}

/// Transform legacy destructuring declarations into tmp-based individual declarations.
///
/// In legacy mode, when a destructuring declaration contains state variables,
/// the official Svelte compiler expands it using `extract_paths` (in `create_state_declarators`).
///
/// Transforms:
///   `let { foo, bar } = expr` (where foo is state) ->
///   `let tmp = expr, foo = $.mutable_source(tmp.foo), bar = tmp.bar;`
///
/// Reference: `create_state_declarators` in VariableDeclaration.js
pub(super) fn transform_legacy_destructure_declarations<'a>(
    statement: &'a str,
    legacy_state_var_names: &[String],
    immutable: bool,
    dev: bool,
) -> Cow<'a, str> {
    // Only look at the first line to determine if this is a destructuring declaration
    let first_line = statement.lines().next().unwrap_or("");
    let trimmed = first_line.trim();

    // Determine declaration keyword
    let (keyword, rest_start) = if let Some(r) = trimmed.strip_prefix("let ") {
        ("let", r)
    } else if let Some(r) = trimmed.strip_prefix("const ") {
        ("const", r)
    } else if let Some(r) = trimmed.strip_prefix("var ") {
        ("var", r)
    } else {
        return Cow::Borrowed(statement);
    };

    let rest_start = rest_start.trim();

    // Check if this is a destructuring pattern (starts with { or [)
    if !rest_start.starts_with('{') && !rest_start.starts_with('[') {
        return Cow::Borrowed(statement);
    }

    // For the full pattern matching, we need the complete statement (multi-line)
    let full_trimmed = statement.trim();
    let keyword_len = keyword.len() + 1; // +1 for space
    let rest = full_trimmed[keyword_len..].trim();

    let is_object = rest.starts_with('{');
    let close_bracket = if is_object { b'}' } else { b']' };

    // Find the matching close bracket in the PATTERN (not the expression)
    let mut depth = 0i32;
    let mut pattern_end = None;
    for (i, c) in code_bytes(rest.as_bytes()) {
        if c == b'{' || c == b'[' || c == b'(' {
            depth += 1;
        } else if c == b'}' || c == b']' || c == b')' {
            depth -= 1;
            if depth == 0 && c == close_bracket {
                pattern_end = Some(i);
                break;
            }
        }
    }

    let pattern_end = match pattern_end {
        Some(e) => e,
        None => return Cow::Borrowed(statement),
    };

    let pattern_str = &rest[..=pattern_end];
    let after_pattern = rest[pattern_end + 1..].trim();

    // Must have `= expr` after the pattern
    if !after_pattern.starts_with('=') {
        return Cow::Borrowed(statement);
    }

    let expr = after_pattern[1..].trim().trim_end_matches(';').trim();

    // Extract variable names from the pattern
    let var_names = extract_legacy_destructure_var_names(pattern_str);

    // Check if any destructured variable is a state variable
    let has_state = var_names
        .iter()
        .any(|name| legacy_state_var_names.contains(name));

    if !has_state {
        return Cow::Borrowed(statement);
    }

    // Generate tmp variable name
    let tmp_idx = STATE_TMP_COUNTER.with(|c| {
        let current = c.get();
        c.set(current + 1);
        current
    });
    let tmp_name = if tmp_idx == 0 {
        "tmp".to_string()
    } else {
        format!("tmp_{}", tmp_idx)
    };

    let immutable_arg = if immutable { ", true" } else { "" };

    let mut paths = Vec::new();
    let mut inserts = Vec::new();
    extract_destructure_paths(
        pattern_str,
        &tmp_name,
        ArrayHelperRead::Signal,
        &mut paths,
        &mut inserts,
    );

    // Upstream emits `tmp`, then every `$$array` insert, then every path.
    let mut parts = vec![format!("{} = {}", tmp_name, expr)];
    parts.extend(
        inserts
            .into_iter()
            .map(|(name, value)| format!("{} = $.derived(() => {})", name, value)),
    );
    for (name, access) in paths {
        if legacy_state_var_names.contains(&name) {
            let source = format!("$.mutable_source({}{})", access, immutable_arg);
            parts.push(format!(
                "{} = {}",
                name,
                tag_legacy_source(source, &name, dev)
            ));
        } else {
            parts.push(format!("{} = {}", name, access));
        }
    }

    let trailing = if full_trimmed.ends_with(';') { ";" } else { "" };
    Cow::Owned(format!("{} {}{}", keyword, parts.join(", "), trailing))
}

/// Every name bound by a destructuring pattern, nested leaves included.
pub(super) fn extract_legacy_destructure_var_names(pattern: &str) -> Vec<String> {
    let mut names = Vec::new();
    collect_legacy_destructure_var_names(pattern, &mut names);
    names
}

fn collect_legacy_destructure_var_names(pattern: &str, names: &mut Vec<String>) {
    let pattern = pattern.trim();
    if pattern.is_empty() {
        return;
    }

    if let Some(rest_target) = pattern.strip_prefix("...") {
        collect_legacy_destructure_var_names(rest_target, names);
        return;
    }
    if let Some(eq_pos) = find_default_equals(pattern) {
        collect_legacy_destructure_var_names(&pattern[..eq_pos], names);
        return;
    }

    if pattern.starts_with('{') && pattern.ends_with('}') {
        for prop in split_derived_object_properties(&pattern[1..pattern.len() - 1]) {
            let value = match find_derived_property_colon(&prop) {
                Some(colon_pos) => &prop[colon_pos + 1..],
                None => prop.as_str(),
            };
            collect_legacy_destructure_var_names(value, names);
        }
    } else if pattern.starts_with('[') && pattern.ends_with(']') {
        for element in split_derived_array_elements(&pattern[1..pattern.len() - 1]) {
            collect_legacy_destructure_var_names(&element, names);
        }
    } else {
        names.push(pattern.to_string());
    }
}

/// Whether a statement is the chained `<keyword> tmp = expr, … ` expansion built
/// by `transform_legacy_destructure_declarations`; those must not be split into
/// one declaration per declarator, because the later ones read the `tmp` /
/// `$$array` helpers declared alongside them.
fn is_legacy_destructure_expansion(line: &str) -> bool {
    if memmem::find(line.as_bytes(), b"$.mutable_source(").is_none() {
        return false;
    }
    let trimmed = line.trim_start();
    let after_keyword = ["let ", "const ", "var "]
        .iter()
        .find_map(|kw| trimmed.strip_prefix(kw));
    let Some(rest) = after_keyword.and_then(|rest| rest.trim_start().strip_prefix("tmp")) else {
        return false;
    };
    let rest = rest.trim_start_matches(|c: char| c == '_' || c.is_ascii_digit());
    rest.trim_start().starts_with('=')
}

/// Dev-mode `$.tag(<source>, '<name>')` label for a legacy state source.
///
/// Only declarations reaching this emitter are tagged: `legacy_reactive`
/// sources (`$: x = …`) are built as AST elsewhere and upstream leaves those
/// untagged even though they print the same `$.mutable_source()` call.
/// A line comment swallows the rest of its line, so when an initializer ends
/// inside one the generated `)` has to start on the next line — upstream breaks
/// the line for the same reason.
fn break_after_line_comment(expr: &str) -> &'static str {
    let last_line = expr.rsplit('\n').next().unwrap_or(expr);
    if super::props_transforms::find_line_comment_position(last_line).is_some() {
        "\n"
    } else {
        ""
    }
}

fn tag_legacy_source(call: String, name: &str, dev: bool) -> String {
    if dev {
        format!("$.tag({}, '{}')", call, name)
    } else {
        call
    }
}

/// Transform legacy state declarations to $.mutable_source() calls.
///
/// In legacy (non-runes) mode, variables that are promoted to State kind
/// (updated and referenced in template/$:/StyleDirective) need to be wrapped
/// in $.mutable_source() for reactivity.
///
/// Transforms:
/// - `let state = 'foo'` → `let state = $.mutable_source('foo')`
/// - `let count = 0` → `let count = $.mutable_source(0)`
/// - `const arr = [1, 2]` → `const arr = $.mutable_source([1, 2])`
pub(super) fn transform_legacy_state_declarations<'a>(
    line: &'a str,
    legacy_state_vars: &[(String, Option<String>, DeclarationKind)],
    immutable: bool,
    dev: bool,
) -> Cow<'a, str> {
    if legacy_state_vars.is_empty() {
        return Cow::Borrowed(line);
    }

    // Handle multi-declarator statements like `let a = 1, b = 2, c = 3;`
    // Split into individual declarations first to handle each one separately.
    // BUT skip declarations produced by transform_legacy_destructure_declarations
    // (which chain `tmp = expr, foo = $.mutable_source(tmp.foo), ...` and must stay chained).
    if !is_legacy_destructure_expansion(line)
        && let Some(split_lines) = split_multi_declarator(line)
    {
        // The split itself re-renders the statement, so this branch answers with
        // its own text even when no declarator was rewritten.
        let transformed_lines: Vec<Cow<'_, str>> = split_lines
            .iter()
            .map(|l| transform_legacy_state_declarations(l, legacy_state_vars, immutable, dev))
            .collect();
        return Cow::Owned(transformed_lines.join("\n"));
    }

    let mut result = Cow::Borrowed(line);

    for (var, _initial, decl_kind) in legacy_state_vars {
        // Every pattern below is `"<keyword> <var>…"`, so one scan rules the whole
        // variable out instead of formatting and searching four needles per keyword.
        if memmem::find(result.as_bytes(), var.as_bytes()).is_none() {
            continue;
        }

        // Determine the keyword(s) to look for based on declaration kind
        let keywords: Vec<&str> = match decl_kind {
            DeclarationKind::Let => vec!["let"],
            DeclarationKind::Const => vec!["const"],
            DeclarationKind::Var => vec!["var"],
            _ => vec!["let", "const", "var"],
        };

        let mut matched = false;

        for keyword in &keywords {
            if matched {
                break;
            }

            // First, try to match `keyword varname = value` pattern. The `=` is
            // matched WITHOUT a trailing space so an init that begins on the next
            // line (`let x =\n  init`) is still caught — leading whitespace after
            // `=` is skipped below before the init is read.
            let pattern_with_init = format!("{} {} =", keyword, var);
            // Use a loop to find the first match that is NOT inside a for-loop header.
            // For example, in `function foo() { for (let x = 0; ...) {} }`, the `let x = 0`
            // inside the for-loop should be skipped - it's a loop variable, not a state variable.
            {
                let mut search_offset = 0;
                while let Some(rel_pos) = result[search_offset..].find(&pattern_with_init) {
                    let pos = search_offset + rel_pos;
                    let after_raw = &result[pos + pattern_with_init.len()..];

                    // Skip `==` / `=>` — those aren't an assignment `=`.
                    if after_raw.starts_with('=') || after_raw.starts_with('>') {
                        search_offset = pos + pattern_with_init.len();
                        continue;
                    }

                    // Skip whitespace (incl. newlines) between `=` and the init.
                    let ws = after_raw.len() - after_raw.trim_start().len();
                    let after = &after_raw[ws..];

                    // Check if already wrapped
                    if after.starts_with("$.mutable_source(") || after.starts_with("$.prop(") {
                        matched = true;
                        break;
                    }

                    // Check if this declaration is inside a for-loop header.
                    // Scan backwards from `pos` to see if we find `for (` with unmatched parens.
                    let chars: Vec<char> = result.chars().collect();
                    let char_pos = byte_pos_to_char_index(&result, pos + keyword.len() + 1);
                    if is_shadowed_by_for_loop_var(&chars, char_pos, var) {
                        // This `let x = ...` is inside a for-loop header, skip it
                        search_offset = pos + pattern_with_init.len();
                        continue;
                    }

                    // Find the value expression
                    let expr_end = find_statement_end_client(after);
                    let expr = after[..expr_end].trim().trim_end_matches(';').trim();

                    // Build the replacement
                    let call = if immutable {
                        format!(
                            "$.mutable_source({}{}, true)",
                            expr,
                            break_after_line_comment(expr)
                        )
                    } else {
                        format!(
                            "$.mutable_source({}{})",
                            expr,
                            break_after_line_comment(expr)
                        )
                    };
                    let replacement = format!(
                        "{} {} = {}",
                        keyword,
                        var,
                        tag_legacy_source(call, var, dev)
                    );

                    // Replace the declaration
                    result = Cow::Owned(format!(
                        "{}{}{}",
                        &result[..pos],
                        replacement,
                        &result[pos + pattern_with_init.len() + ws + expr_end..]
                    ));
                    matched = true;
                    break;
                }
                if matched {
                    continue;
                }
            }

            // Try to match `keyword varname: TYPE = value` pattern (with TS type annotation).
            // Strip the TypeScript type annotation and treat as `keyword varname = value`.
            let pattern_with_type = format!("{} {} : ", keyword, var);
            let pattern_with_type_no_space = format!("{} {}: ", keyword, var);
            for pat in [&pattern_with_type, &pattern_with_type_no_space] {
                if matched {
                    break;
                }
                if let Some(pos) = result.find(pat.as_str()) {
                    // Find the `=` that ends the type annotation, respecting nested braces/brackets.
                    let type_start = pos + pat.len();
                    let mut depth = 0i32;
                    let mut eq_pos: Option<usize> = None;
                    let mut iter = result[type_start..].char_indices().peekable();
                    while let Some((j, c)) = iter.next() {
                        match c {
                            '{' | '[' | '(' | '<' => depth += 1,
                            '}' | ']' | ')' | '>' => depth -= 1,
                            '=' if depth == 0 => {
                                // Make sure it's not `==` or `=>`
                                let next = iter.peek().map(|&(_, ch)| ch);
                                if !matches!(next, Some('=') | Some('>')) {
                                    eq_pos = Some(j);
                                    break;
                                }
                            }
                            ';' | '\n' if depth == 0 => break,
                            _ => {}
                        }
                    }
                    if let Some(eq) = eq_pos {
                        let after_eq = type_start + eq + 1;
                        // Skip whitespace (incl. newlines) between `=` and the
                        // initializer. `find_statement_end_client` treats a
                        // leading newline as an ASI statement end, so a declaration
                        // whose init starts on the NEXT line (`let x: T =\n  init`)
                        // would otherwise extract an empty expr and orphan the init
                        // as a dangling statement.
                        let after_raw = &result[after_eq..];
                        let ws = after_raw.len() - after_raw.trim_start().len();
                        let after = &after_raw[ws..];
                        let expr_end = find_statement_end_client(after);
                        let expr = after[..expr_end].trim().trim_end_matches(';').trim();
                        let call = if immutable {
                            format!(
                                "$.mutable_source({}{}, true)",
                                expr,
                                break_after_line_comment(expr)
                            )
                        } else {
                            format!(
                                "$.mutable_source({}{})",
                                expr,
                                break_after_line_comment(expr)
                            )
                        };
                        let replacement = format!(
                            "{} {} = {}",
                            keyword,
                            var,
                            tag_legacy_source(call, var, dev)
                        );
                        result = Cow::Owned(format!(
                            "{}{}{}",
                            &result[..pos],
                            replacement,
                            &result[after_eq + ws + expr_end..]
                        ));
                        matched = true;
                        break;
                    }
                }
            }
            if matched {
                continue;
            }

            // Then, try to match `keyword varname;` pattern (declaration without initializer)
            let pattern_no_init = format!("{} {};", keyword, var);
            {
                let mut search_offset = 0;
                while let Some(rel_pos) = result[search_offset..].find(&pattern_no_init) {
                    let pos = search_offset + rel_pos;

                    // Check if this declaration is inside a for-loop header
                    let chars: Vec<char> = result.chars().collect();
                    let char_pos = byte_pos_to_char_index(&result, pos + keyword.len() + 1);
                    if is_shadowed_by_for_loop_var(&chars, char_pos, var) {
                        search_offset = pos + pattern_no_init.len();
                        continue;
                    }

                    // Build the replacement - no initial value, so pass nothing to $.mutable_source()
                    // (upstream emits `void 0`, not the `undefined` identifier).
                    let call = if immutable {
                        "$.mutable_source(void 0, true)".to_string()
                    } else {
                        "$.mutable_source()".to_string()
                    };
                    let replacement = format!(
                        "{} {} = {};",
                        keyword,
                        var,
                        tag_legacy_source(call, var, dev)
                    );

                    // Replace the declaration
                    result = Cow::Owned(format!(
                        "{}{}{}",
                        &result[..pos],
                        replacement,
                        &result[pos + pattern_no_init.len()..]
                    ));
                    matched = true;
                    break;
                }
                if matched {
                    continue;
                }
            }

            // Also try to match `keyword varname` without semicolon
            let pattern_no_semi = format!("{} {}", keyword, var);
            {
                let mut search_offset = 0;
                while let Some(rel_pos) = result[search_offset..].find(&pattern_no_semi) {
                    let pos = search_offset + rel_pos;
                    let after_pos = pos + pattern_no_semi.len();
                    let is_end = after_pos >= result.len()
                        || result[after_pos..]
                            .starts_with(|c: char| c.is_whitespace() || c == '\n' || c == '\r');
                    if !is_end {
                        search_offset = pos + pattern_no_semi.len();
                        continue;
                    }

                    // Check if this declaration is inside a for-loop header
                    let chars: Vec<char> = result.chars().collect();
                    let char_pos = byte_pos_to_char_index(&result, pos + keyword.len() + 1);
                    if is_shadowed_by_for_loop_var(&chars, char_pos, var) {
                        search_offset = pos + pattern_no_semi.len();
                        continue;
                    }

                    if after_pos < result.len()
                        && result[after_pos..]
                            .trim_start()
                            .starts_with("= $.mutable_source(")
                    {
                        matched = true;
                        break;
                    }
                    // Check if there's an `=` after whitespace (initializer present
                    // but pattern_with_init didn't match, e.g. due to extra spaces
                    // left by TypeScript annotation stripping: `var x  = value`).
                    // Handle this as an initializer case rather than producing the
                    // invalid `var x = $.mutable_source() = value`.
                    let rest_after = &result[after_pos..];
                    let trimmed_rest = rest_after.trim_start();
                    if trimmed_rest.starts_with('=')
                        && !trimmed_rest.starts_with("==")
                        && !trimmed_rest.starts_with("=>")
                    {
                        // Find where the `=` character is in `rest_after`
                        let eq_offset = rest_after.len() - trimmed_rest.len();
                        let after_eq = after_pos + eq_offset + 1;
                        let after = &result[after_eq..];
                        let expr_end = find_statement_end_client(after);
                        let expr = after[..expr_end].trim().trim_end_matches(';').trim();
                        let call = if immutable {
                            format!(
                                "$.mutable_source({}{}, true)",
                                expr,
                                break_after_line_comment(expr)
                            )
                        } else {
                            format!(
                                "$.mutable_source({}{})",
                                expr,
                                break_after_line_comment(expr)
                            )
                        };
                        let replacement = format!(
                            "{} {} = {}",
                            keyword,
                            var,
                            tag_legacy_source(call, var, dev)
                        );
                        result = Cow::Owned(format!(
                            "{}{}{}",
                            &result[..pos],
                            replacement,
                            &result[after_eq + expr_end..]
                        ));
                        matched = true;
                        break;
                    }
                    let call = if immutable {
                        "$.mutable_source(void 0, true)".to_string()
                    } else {
                        "$.mutable_source()".to_string()
                    };
                    let replacement = format!(
                        "{} {} = {}",
                        keyword,
                        var,
                        tag_legacy_source(call, var, dev)
                    );
                    result = Cow::Owned(format!(
                        "{}{}{}",
                        &result[..pos],
                        replacement,
                        &result[after_pos..]
                    ));
                    matched = true;
                    break;
                }
            }
        }
    }

    result
}

#[cfg(test)]
mod scan_lexing_tests {
    use super::{
        body_references_identifier, split_multi_declarator,
        transform_legacy_destructure_declarations,
    };

    #[test]
    fn apostrophe_in_a_line_comment_does_not_blank_the_code_after_it() {
        // `don't` must not open a string literal and swallow the following read.
        assert!(body_references_identifier(
            "a = 1; // don't\nb = width",
            "width"
        ));
    }

    #[test]
    fn apostrophe_in_a_regex_literal_does_not_blank_the_code_after_it() {
        // `replace(/'/g, …)` — the quote is regex source, not a string opener.
        assert!(body_references_identifier(
            "a = raw.replace(/'/g, \"&#39;\");\nb = width",
            "width"
        ));
    }

    #[test]
    fn a_division_after_a_value_is_not_read_as_a_regex() {
        // Negative control for the regex arm: a `/` after a value divides, so the
        // bytes after it are still code.
        assert!(body_references_identifier("a = n / 2;\nb = width", "width"));
    }

    #[test]
    fn brace_in_a_block_comment_does_not_close_a_shadowing_function() {
        // `a` is a parameter of the arrow, so it is shadowed, not a dependency —
        // the `}` inside the comment must not end the body early.
        assert!(!body_references_identifier(
            "f((a) => { /* } */ return a; })",
            "a"
        ));
    }

    #[test]
    fn brace_in_a_line_comment_does_not_close_a_shadowing_function() {
        assert!(!body_references_identifier(
            "f(function (a) {\n\t// }\n\treturn a;\n})",
            "a"
        ));
    }

    #[test]
    fn brace_in_a_comment_does_not_merge_two_statements() {
        // Two statements; `x` is only ever assigned, so it is not a dependency.
        // A `{` inside the comment must not raise the depth and swallow the `;`,
        // which would fold both statements into one and read `x` off the RHS.
        assert!(!body_references_identifier("{ y = 1 /* { */; x = 2 }", "x"));
    }

    #[test]
    fn comma_in_a_comment_does_not_split_declarators() {
        assert_eq!(split_multi_declarator("let a = 1 /* , */ + 2;"), None);
    }

    #[test]
    fn non_ascii_identifier_in_a_destructure_pattern_does_not_panic() {
        // The pattern scan enumerated chars but sliced by bytes.
        let out = transform_legacy_destructure_declarations(
            "let { ああ } = obj;",
            &["ああ".to_string()],
            false,
            false,
        );
        assert!(out.contains("ああ"), "got: {out}");
    }

    #[test]
    fn brace_in_a_comment_does_not_end_a_destructure_pattern() {
        let out = transform_legacy_destructure_declarations(
            "let { a = 1 /* } */ } = obj;",
            &["a".to_string()],
            false,
            false,
        );
        assert!(out.contains("$.mutable_source("), "got: {out}");
    }
}

#[cfg(test)]
mod non_ascii_tests {
    use super::{body_references_identifier, transform_legacy_state_declarations};
    use crate::compiler::phases::phase2_analyze::scope::DeclarationKind;

    #[test]
    fn body_references_identifier_handles_non_ascii_statement() {
        // A non-ASCII token before a `;`/newline statement boundary must not panic
        // when scanning statements (byte vs char index).
        assert!(body_references_identifier("café; return count", "count"));
        assert!(!body_references_identifier("café; return other", "count"));
    }

    #[test]
    fn transform_legacy_state_declarations_handles_non_ascii_type() {
        // `let x: Café = 0` — the `=` sits past a multi-byte char in the type
        // annotation; slicing must use byte offsets (no panic).
        let vars = vec![("x".to_string(), None, DeclarationKind::Let)];
        let out = transform_legacy_state_declarations("let x: Café = 0", &vars, false, false);
        assert!(out.contains("$.mutable_source(0)"), "got: {out}");
    }
}

#[cfg(test)]
mod colon_depth0_tests {
    use super::*;

    #[test]
    fn colon_position_is_a_byte_offset() {
        // The caller slices `&str` with this, so it must be a byte offset.
        let expr = "\"ああa\" : x";
        let pos = find_colon_at_depth0(expr).unwrap();
        assert_eq!(pos, expr.find(':').unwrap());
    }

    #[test]
    fn colon_in_comment_is_not_depth0() {
        assert_eq!(find_colon_at_depth0("a /* : */ : b"), Some(10));
        assert_eq!(find_colon_at_depth0("a // : b"), None);
    }

    #[test]
    fn identifier_matcher_agrees_with_the_regex_it_replaced() {
        // The pattern this matcher encodes, kept here so the two can be
        // compared rather than the rule being restated in prose.
        fn reference_regex(identifier: &str) -> regex::Regex {
            let preceding = if identifier.starts_with("$$") {
                r"[^a-zA-Z0-9_$]"
            } else {
                r"[^a-zA-Z0-9_$\.]|\.\.\."
            };
            regex::Regex::new(&format!(
                r"(^|{}){}([^a-zA-Z0-9_$]|$)",
                preceding,
                regex::escape(identifier)
            ))
            .unwrap()
        }

        let cases = [
            ("count", "count + 1"),
            ("count", "$count * 2"),
            ("count", "counter + 1"),
            ("count", "obj.count"),
            ("count", "f(...count)"),
            ("count", "a.b.count"),
            ("count", "{ count }"),
            ("count", "count"),
            ("count", ""),
            ("count", "\u{3042}count\u{3042}"),
            ("count", "acount"),
            ("count", "count.value"),
            ("$foo", "bar = $foo"),
            ("$foo", "bar = $foobar"),
            ("$$restProps", "{ ...$$restProps }"),
            ("$$restProps", "$$restPropsX"),
            ("$$props", "a.$$props"),
            ("x", "xx x xx"),
            ("aa", "aaa"),
            ("aa", "aa"),
        ];
        for (identifier, text) in cases {
            assert_eq!(
                IdentifierMatcher::new(identifier).is_match(text),
                reference_regex(identifier).is_match(text),
                "identifier {identifier:?} in {text:?}"
            );
        }
    }

    #[test]
    fn ternary_branch_split_survives_non_ascii() {
        let re = IdentifierMatcher::new("component");
        // `cond ? component = "ああa" : component = other`
        let stmt = "cond ? component = \"ああa\" : component = other";
        let _ = check_identifier_in_statement(stmt, "component", &re);
    }
}

#[cfg(test)]
mod prefilter_tests {
    use super::*;

    #[test]
    fn transform_legacy_state_declarations_leaves_an_absent_name_alone() {
        // The scan that rules a variable out has to agree with the four
        // `"<keyword> <var>…"` patterns it stands in for.
        let vars = vec![
            ("absent".to_string(), None, DeclarationKind::Let),
            ("x".to_string(), None, DeclarationKind::Let),
        ];
        let out = transform_legacy_state_declarations("let x = 1;", &vars, false, false);
        assert_eq!(out, "let x = $.mutable_source(1);");
        let untouched = transform_legacy_state_declarations("foo();", &vars, false, false);
        assert_eq!(untouched, "foo();");
    }
}
