//! State and prop assignment transformations, identifier analysis, and legacy transforms.

use memchr::memmem;
use rustc_hash::FxHashSet;

use super::expression_utils::{
    byte_pos_to_char_index, find_statement_end_client, is_shadowed_by_for_loop_var,
};
use super::rune_transforms::{
    find_derived_property_colon, split_derived_array_elements, split_derived_object_properties,
};
use super::{SCRIPT_ARRAY_COUNTER, STATE_TMP_COUNTER, get_or_compile_regex};
use crate::compiler::phases::phase2_analyze::scope::DeclarationKind;

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
pub(super) fn body_references_identifier(body: &str, identifier: &str) -> bool {
    // The Rust regex crate does NOT support lookbehind assertions.
    // We use alternation-based boundary matching instead:
    //   (^|[^a-zA-Z0-9_$])identifier([^a-zA-Z0-9_$]|$)
    //
    // This handles two important cases:
    // 1. `$foo` (store subscriptions) - `\b` doesn't work because `$` is not a word char.
    //    e.g., "bar = $foo" must match `$foo` but NOT "bar = $foobar"
    // 2. For plain identifiers like `count`, we must NOT match `count` inside `$count`.
    //    e.g., `$count * 2` - `count` should NOT be considered a dependency here
    //    because `$count` already tracks the store subscription.
    let escaped = regex::escape(identifier);
    // Use alternation boundary for ALL identifiers (both `$foo` and `count`)
    // to correctly handle the `$`-prefixed store subscription case.
    // Also exclude `.` from valid preceding characters to avoid matching property
    // accesses like `obj.prop` when checking for standalone `prop` references.
    //
    // EXCEPTION: the `$$`-prefixed compiler specials (`$$props` / `$$restProps` /
    // `$$slots`) are never member-access targets, but they DO appear after a `.`
    // in a spread — `{ ...$$restProps }`. Excluding `.` there made
    // `body_references_identifier(body, "$$restProps")` miss the spread, so a
    // `$: x = { ...$$restProps }` reactive statement dropped its
    // `$.deep_read_state($$restProps)` dependency (emitting `() => {}`). Allow a
    // leading `.` for `$$`-names so the spread form is detected.
    let preceding = if identifier.starts_with("$$") {
        r"[^a-zA-Z0-9_$]"
    } else {
        // Exclude `.` so member access (`obj.prop`) does not match a standalone
        // `prop`, but DO allow a spread prefix (`...prop`): three dots before the
        // name are a read, not a member access (`$: x = f(...prop)` reads `prop`).
        // The regex crate has no lookbehind, so add `...` as an explicit
        // alternative in the leading-boundary group.
        r"[^a-zA-Z0-9_$\.]|\.\.\."
    };
    let pattern = format!(r"(^|{}){}([^a-zA-Z0-9_$]|$)", preceding, escaped);
    let re = match get_or_compile_regex(&pattern) {
        Some(re) => re,
        None => return false,
    };

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
    if !re.is_match(&stripped_body) {
        return false;
    }

    // Use the recursive check that handles if/else, blocks, and compound statements
    body_references_identifier_recursive(stripped_body.trim(), identifier, &re)
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
pub(super) fn strip_string_literal_text(code: &str) -> String {
    // Fast path: if no string delimiters exist, return as-is
    // Uses memchr3 for SIMD-accelerated search of all three delimiters at once
    if memchr::memchr3(b'\'', b'"', b'`', code.as_bytes()).is_none() {
        return code.to_string();
    }

    // Work with bytes for performance (string literal delimiters are all ASCII)
    let bytes = code.as_bytes();
    let mut result: Vec<u8> = bytes.to_vec();
    let len = bytes.len();
    let mut i = 0;

    while i < len {
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
                        while i < len && depth > 0 {
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

    String::from_utf8(result).unwrap_or_else(|_| code.to_string())
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
pub(super) fn strip_object_property_keys(code: &str) -> String {
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

    result.into_iter().collect()
}

/// Strip out function/arrow expression bodies where the identifier is declared as a parameter.
/// This replaces the function body (including the function itself) with empty space,
/// leaving only the parts of the code that don't shadow the identifier.
///
/// Handles patterns like:
/// - `function (a) { ... }` -> `                   `
/// - `(a) => { ... }` -> `              `
/// - `(a) => expr` -> `            `
pub(super) fn strip_function_scopes_that_shadow(body: &str, identifier: &str) -> String {
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
            if after_ident < result.len() {
                let next_char = result.as_bytes()[after_ident] as char;
                if next_char != ',' && next_char != ')' && next_char != ' ' && next_char != ':' {
                    // Not a word boundary - the pattern is a prefix of a longer name
                    // Replace just this occurrence to prevent infinite loop
                    result.replace_range(pos..pos + 1, " ");
                    continue;
                }
            }

            // Find the opening brace of the function body
            let after_pat = &result[after_ident..];
            let mut found_paren_close = false;
            let mut brace_start = None;
            let mut depth = 1; // We're inside the opening (
            for (i, ch) in after_pat.char_indices() {
                if !found_paren_close {
                    match ch {
                        '(' => depth += 1,
                        ')' => {
                            depth -= 1;
                            if depth == 0 {
                                found_paren_close = true;
                            }
                        }
                        _ => {}
                    }
                } else if ch == '{' {
                    brace_start = Some(after_ident + i);
                    break;
                } else if !ch.is_whitespace() {
                    break;
                }
            }

            if let Some(brace_pos) = brace_start {
                // Find matching closing brace
                let mut brace_depth = 1;
                let mut in_string = false;
                let mut string_char = ' ';
                let mut end_pos = brace_pos + 1;
                for (i, ch) in result[brace_pos + 1..].char_indices() {
                    if in_string {
                        if ch == '\\' {
                            // Skip next char
                            continue;
                        }
                        if ch == string_char {
                            in_string = false;
                        }
                    } else {
                        match ch {
                            '"' | '\'' | '`' => {
                                in_string = true;
                                string_char = ch;
                            }
                            '{' => brace_depth += 1,
                            '}' => {
                                brace_depth -= 1;
                                if brace_depth == 0 {
                                    end_pos = brace_pos + 1 + i + 1;
                                    break;
                                }
                            }
                            _ => {}
                        }
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
            let next_char = result.as_bytes()[after_ident] as char;
            if next_char != ',' && next_char != ')' && next_char != ' ' && next_char != ':' {
                search_from = pos + 1;
                continue;
            }

            // Check if preceded by `function` keyword - already handled above
            let before = result[..pos].trim_end();
            if before.ends_with("function") {
                search_from = pos + 1;
                continue;
            }

            // Find `) =>`  after the params
            let after_params = &result[after_ident..];
            let mut paren_depth = 1;
            let mut paren_close_idx = None;
            for (i, ch) in after_params.char_indices() {
                match ch {
                    '(' => paren_depth += 1,
                    ')' => {
                        paren_depth -= 1;
                        if paren_depth == 0 {
                            paren_close_idx = Some(after_ident + i);
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
                        let mut in_string = false;
                        let mut string_char = ' ';
                        let mut end_pos = body_offset + 1;
                        for (i, ch) in result[body_offset + 1..].char_indices() {
                            if in_string {
                                if ch == '\\' {
                                    continue;
                                }
                                if ch == string_char {
                                    in_string = false;
                                }
                            } else {
                                match ch {
                                    '"' | '\'' | '`' => {
                                        in_string = true;
                                        string_char = ch;
                                    }
                                    '{' => brace_depth += 1,
                                    '}' => {
                                        brace_depth -= 1;
                                        if brace_depth == 0 {
                                            end_pos = body_offset + 1 + i + 1;
                                            break;
                                        }
                                    }
                                    _ => {}
                                }
                            }
                        }
                        let spaces = " ".repeat(end_pos - pos);
                        result.replace_range(pos..end_pos, &spaces);
                    } else {
                        // Expression body arrow: scan forward from body_offset to find the
                        // end of the expression (top-level `,` `)` `]` `;` or end of string).
                        let bytes = result.as_bytes();
                        let mut p = body_offset;
                        let mut pdepth = 0i32;
                        let mut bdepth = 0i32;
                        let mut brdepth = 0i32;
                        let mut in_s: Option<u8> = None;
                        while p < bytes.len() {
                            let c = bytes[p];
                            if let Some(q) = in_s {
                                if c == b'\\' && p + 1 < bytes.len() {
                                    p += 2;
                                    continue;
                                }
                                if c == q {
                                    in_s = None;
                                }
                                p += 1;
                                continue;
                            }
                            match c {
                                b'\'' | b'"' | b'`' => in_s = Some(c),
                                b'(' => pdepth += 1,
                                b')' => {
                                    if pdepth == 0 && bdepth == 0 && brdepth == 0 {
                                        break;
                                    }
                                    pdepth -= 1;
                                }
                                b'{' => bdepth += 1,
                                b'}' => {
                                    if bdepth == 0 && pdepth == 0 && brdepth == 0 {
                                        break;
                                    }
                                    bdepth -= 1;
                                }
                                b'[' => brdepth += 1,
                                b']' => {
                                    if brdepth == 0 && pdepth == 0 && bdepth == 0 {
                                        break;
                                    }
                                    brdepth -= 1;
                                }
                                b',' | b';' if pdepth == 0 && bdepth == 0 && brdepth == 0 => {
                                    break;
                                }
                                _ => {}
                            }
                            p += 1;
                        }
                        let end_pos = p;
                        let spaces = " ".repeat(end_pos - pos);
                        result.replace_range(pos..end_pos, &spaces);
                    }
                } else {
                    search_from = paren_close + 1;
                }
            } else {
                search_from = pos + 1;
            }
        }
    }

    result
}

/// Recursively check if an identifier is read (not just assigned to) in a body of code.
/// Handles block statements, if/else blocks, and compound statements.
pub(super) fn body_references_identifier_recursive(
    body: &str,
    identifier: &str,
    re: &regex::Regex,
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
            for (i, ch) in after_if.char_indices() {
                match ch {
                    '(' => depth += 1,
                    ')' => {
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
                    for (i, ch) in after_cond.char_indices() {
                        match ch {
                            '{' => brace_depth += 1,
                            '}' => {
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
pub(super) fn body_references_identifier_in_statements(
    content: &str,
    identifier: &str,
    re: &regex::Regex,
) -> bool {
    // Split by semicolons and newlines, but be careful with nested blocks
    // Simple approach: scan for statements at depth 0
    let mut depth = 0;
    let mut start = 0;
    let chars: Vec<char> = content.chars().collect();

    for i in 0..chars.len() {
        match chars[i] {
            '(' | '[' | '{' => depth += 1,
            ')' | ']' | '}' if depth > 0 => {
                depth -= 1;
            }
            ';' | '\n' if depth == 0 => {
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
pub(super) fn check_identifier_in_statement(
    stmt: &str,
    identifier: &str,
    re: &regex::Regex,
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
    let chars: Vec<char> = expr.chars().collect();
    let mut i = 0;
    let mut depth = 0;

    while i < chars.len() {
        let c = chars[i];
        match c {
            '(' | '[' | '{' => depth += 1,
            ')' | ']' | '}' => depth -= 1,
            '=' if depth == 0 => {
                // Check it's not ==, ===, !=, !==, <=, >=, =>,
                // or compound assignment operators: +=, -=, *=, /=, %=, **=,
                // <<=, >>=, >>>=, &=, |=, ^=, &&=, ||=, ??=
                let prev = if i > 0 { Some(chars[i - 1]) } else { None };
                let next = chars.get(i + 1).copied();

                if prev != Some('=')
                    && prev != Some('!')
                    && prev != Some('<')
                    && prev != Some('>')
                    && prev != Some('+')
                    && prev != Some('-')
                    && prev != Some('*')
                    && prev != Some('/')
                    && prev != Some('%')
                    && prev != Some('&')
                    && prev != Some('|')
                    && prev != Some('^')
                    && prev != Some('?')
                    && next != Some('=')
                    && next != Some('>')
                {
                    return Some(i);
                }
            }
            _ => {}
        }
        i += 1;
    }
    None
}

/// Find the position of a `:` at depth 0 in an expression.
/// This is used to split ternary expressions like `true_rhs : false_branch`.
pub(super) fn find_colon_at_depth0(expr: &str) -> Option<usize> {
    let chars: Vec<char> = expr.chars().collect();
    let mut depth = 0;
    let mut i = 0;

    while i < chars.len() {
        match chars[i] {
            '(' | '[' | '{' => depth += 1,
            ')' | ']' | '}' => depth -= 1,
            ':' if depth == 0 => return Some(i),
            '\'' | '"' => {
                // Skip string literals
                let quote = chars[i];
                i += 1;
                while i < chars.len() && chars[i] != quote {
                    if chars[i] == '\\' && i + 1 < chars.len() {
                        i += 1;
                    }
                    i += 1;
                }
            }
            '`' => {
                // Skip template literals
                i += 1;
                while i < chars.len() && chars[i] != '`' {
                    if chars[i] == '$' && i + 1 < chars.len() && chars[i + 1] == '{' {
                        depth += 1;
                        i += 1;
                    } else if chars[i] == '}' && depth > 0 {
                        depth -= 1;
                    } else if chars[i] == '\\' && i + 1 < chars.len() {
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
        } else if !template_interp_depth.is_empty() {
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
pub(super) fn wrap_store_unsub_for_state_sets(
    line: &str,
    state_vars: &[String],
    store_sub_vars: &[String],
) -> String {
    if state_vars.is_empty() || store_sub_vars.is_empty() {
        return line.to_string();
    }
    if memmem::find(line.as_bytes(), b"$.set(").is_none() {
        return line.to_string();
    }
    super::store_unsub_wrap_ast::transform_store_unsub_wrap_ast(line, state_vars, store_sub_vars)
        .unwrap_or_else(|| line.to_string())
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
pub(super) fn transform_prop_assignments(
    line: &str,
    prop_vars: &[String],
    non_bindable_prop_vars: &[String],
) -> String {
    if prop_vars.is_empty() {
        return line.to_string();
    }

    // Skip lines that are prop declarations (contain $.prop() or $.rest_props())
    // These are generated by transform_props_destructuring and should not be modified.
    // In multi-declarator statements like `let foo = $.prop(...),\n\tbar = $.prop(...)`,
    // the subsequent declarators don't have `let` before them, so the simple assignment
    // transform would incorrectly convert `bar = $.prop(...)` to `bar($.prop(...))`.
    if memmem::find(line.as_bytes(), b"$.prop(").is_some()
        || memmem::find(line.as_bytes(), b"$.rest_props(").is_some()
    {
        return line.to_string();
    }

    // Quick pre-check: if none of the prop vars appear as identifiers, skip expensive transforms
    let var_set: FxHashSet<&str> = prop_vars.iter().map(|v| v.as_str()).collect();
    if !super::utils::text_contains_any_identifier(line, &var_set) {
        return line.to_string();
    }

    // Two AST passes — both cover every shape the text loops
    // (just deleted) used to handle:
    // 1. `name = expr` / `name <op>= expr` (bare LHS) →
    //    `name(expr)` / `name(name() <op> (expr))`
    // 2. `name.foo = expr` / `name().foo = expr` (bindable prop
    //    member mutations) → `name(name().foo = expr, true)`
    let after_assigns = super::prop_assign_ast::transform_prop_assign_ast(line, prop_vars);
    let stage1: &str = after_assigns.as_deref().unwrap_or(line);
    super::prop_member_mutate_ast::transform_prop_member_mutate_ast(
        stage1,
        prop_vars,
        non_bindable_prop_vars,
    )
    .unwrap_or_else(|| stage1.to_string())
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

    // Check if there's a comma at depth 0 (indicating multiple declarators)
    let mut depth = 0;
    let mut in_string = false;
    let mut string_char = ' ';
    let mut has_top_level_comma = false;
    let chars: Vec<char> = rest.chars().collect();

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
            ')' | ']' | '}' if depth > 0 => {
                depth -= 1;
            }
            ',' if depth == 0 => {
                has_top_level_comma = true;
                break;
            }
            _ => {}
        }
    }

    if !has_top_level_comma {
        return None;
    }

    // Split into declarators at top-level commas
    let mut declarators: Vec<String> = Vec::new();
    let mut current = String::new();
    depth = 0;
    in_string = false;
    string_char = ' ';

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
                if depth > 0 {
                    depth -= 1;
                }
                current.push(c);
            }
            ',' if depth == 0 => {
                // End of current declarator
                declarators.push(current.trim().trim_end_matches(';').trim().to_string());
                current = String::new();
            }
            ';' if depth == 0 => {
                // End of statement
                if !current.trim().is_empty() {
                    declarators.push(current.trim().to_string());
                }
                current = String::new();
                break;
            }
            _ => {
                current.push(c);
            }
        }
    }
    if !current.trim().is_empty() {
        declarators.push(current.trim().trim_end_matches(';').trim().to_string());
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
pub(super) fn transform_legacy_destructure_declarations(
    statement: &str,
    legacy_state_var_names: &[String],
    immutable: bool,
) -> String {
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
        return statement.to_string();
    };

    let rest_start = rest_start.trim();

    // Check if this is a destructuring pattern (starts with { or [)
    if !rest_start.starts_with('{') && !rest_start.starts_with('[') {
        return statement.to_string();
    }

    // For the full pattern matching, we need the complete statement (multi-line)
    let full_trimmed = statement.trim();
    let keyword_len = keyword.len() + 1; // +1 for space
    let rest = full_trimmed[keyword_len..].trim();

    let is_object = rest.starts_with('{');
    let close_bracket = if is_object { '}' } else { ']' };

    // Find the matching close bracket in the PATTERN (not the expression)
    let mut depth = 0i32;
    let mut pattern_end = None;
    let mut in_string: Option<char> = None;
    for (i, c) in rest.chars().enumerate() {
        if let Some(quote) = in_string {
            if c == quote && (i == 0 || rest.as_bytes().get(i - 1) != Some(&b'\\')) {
                in_string = None;
            }
            continue;
        }
        if c == '\'' || c == '"' || c == '`' {
            in_string = Some(c);
            continue;
        }
        if c == '{' || c == '[' || c == '(' {
            depth += 1;
        } else if c == '}' || c == ']' || c == ')' {
            depth -= 1;
            if depth == 0 && c == close_bracket {
                pattern_end = Some(i);
                break;
            }
        }
    }

    let pattern_end = match pattern_end {
        Some(e) => e,
        None => return statement.to_string(),
    };

    let pattern_str = &rest[..=pattern_end];
    let after_pattern = rest[pattern_end + 1..].trim();

    // Must have `= expr` after the pattern
    if !after_pattern.starts_with('=') {
        return statement.to_string();
    }

    let expr = after_pattern[1..].trim().trim_end_matches(';').trim();

    // Extract variable names from the pattern
    let var_names = extract_legacy_destructure_var_names(pattern_str);

    // Check if any destructured variable is a state variable
    let has_state = var_names
        .iter()
        .any(|name| legacy_state_var_names.contains(name));

    if !has_state {
        return statement.to_string();
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

    if is_object {
        // Object destructuring: { a, b: c, d = default, ...rest }
        let inner = &pattern_str[1..pattern_str.len() - 1];
        let props = split_derived_object_properties(inner);
        let mut parts = vec![format!("{} = {}", tmp_name, expr)];

        for prop in &props {
            let prop = prop.trim();
            if prop.is_empty() {
                continue;
            }

            if let Some(rest_name) = prop.strip_prefix("...") {
                let rest_name = rest_name.trim();
                parts.push(format!("{} = {}.{}", rest_name, tmp_name, rest_name));
                continue;
            }

            if let Some(colon_pos) = find_derived_property_colon(prop) {
                let key = prop[..colon_pos].trim();
                let value_part = prop[colon_pos + 1..].trim();
                let var_name = if let Some(eq_pos) = value_part.find('=') {
                    value_part[..eq_pos].trim()
                } else {
                    value_part
                };

                let is_state = legacy_state_var_names.contains(&var_name.to_string());
                let member = format!("{}.{}", tmp_name, key);
                if is_state {
                    parts.push(format!(
                        "{} = $.mutable_source({}{})",
                        var_name, member, immutable_arg
                    ));
                } else {
                    parts.push(format!("{} = {}", var_name, member));
                }
            } else {
                let var_name = if let Some(eq_pos) = prop.find('=') {
                    prop[..eq_pos].trim()
                } else {
                    prop
                };

                let is_state = legacy_state_var_names.contains(&var_name.to_string());
                let member = format!("{}.{}", tmp_name, var_name);
                if is_state {
                    parts.push(format!(
                        "{} = $.mutable_source({}{})",
                        var_name, member, immutable_arg
                    ));
                } else {
                    parts.push(format!("{} = {}", var_name, member));
                }
            }
        }

        let trailing = if full_trimmed.ends_with(';') { ";" } else { "" };
        format!("{} {}{}", keyword, parts.join(", "), trailing)
    } else {
        // Array destructuring: [a, b, ...rest]
        let inner = &pattern_str[1..pattern_str.len() - 1];
        let elements = split_derived_array_elements(inner);

        let has_rest = elements.iter().any(|e| e.trim().starts_with("..."));
        let element_count = elements.len();

        let global_counter = SCRIPT_ARRAY_COUNTER.with(|c| {
            let current = c.get();
            c.set(current + 1);
            current
        });

        let array_var = if global_counter == 0 {
            "$$array".to_string()
        } else {
            format!("$$array_{}", global_counter)
        };

        let to_array_args = if has_rest {
            format!("$.to_array({})", tmp_name)
        } else {
            format!("$.to_array({}, {})", tmp_name, element_count)
        };

        let mut parts = vec![
            format!("{} = {}", tmp_name, expr),
            format!("{} = $.derived(() => {})", array_var, to_array_args),
        ];

        for (i, element) in elements.iter().enumerate() {
            let element = element.trim();
            if element.is_empty() {
                continue;
            }

            if let Some(rest_name) = element.strip_prefix("...") {
                let rest_name = rest_name.trim();
                let access = format!("$.get({}).slice({})", array_var, i);
                let is_state = legacy_state_var_names.contains(&rest_name.to_string());
                if is_state {
                    parts.push(format!(
                        "{} = $.mutable_source({}{})",
                        rest_name, access, immutable_arg
                    ));
                } else {
                    parts.push(format!("{} = {}", rest_name, access));
                }
                continue;
            }

            let access = format!("$.get({})[{}]", array_var, i);
            let is_state = legacy_state_var_names.contains(&element.to_string());
            if is_state {
                parts.push(format!(
                    "{} = $.mutable_source({}{})",
                    element, access, immutable_arg
                ));
            } else {
                parts.push(format!("{} = {}", element, access));
            }
        }

        let trailing = if full_trimmed.ends_with(';') { ";" } else { "" };
        format!("{} {}{}", keyword, parts.join(", "), trailing)
    }
}

/// Extract variable names from a destructuring pattern.
pub(super) fn extract_legacy_destructure_var_names(pattern: &str) -> Vec<String> {
    let mut names = Vec::new();
    let pattern = pattern.trim();

    if pattern.starts_with('{') && pattern.ends_with('}') {
        let inner = &pattern[1..pattern.len() - 1];
        let props = split_derived_object_properties(inner);
        for prop in &props {
            let prop = prop.trim();
            if prop.is_empty() {
                continue;
            }
            if let Some(rest_name) = prop.strip_prefix("...") {
                names.push(rest_name.trim().to_string());
            } else if let Some(colon_pos) = find_derived_property_colon(prop) {
                let value_part = prop[colon_pos + 1..].trim();
                let var_name = if let Some(eq_pos) = value_part.find('=') {
                    value_part[..eq_pos].trim()
                } else {
                    value_part
                };
                names.push(var_name.to_string());
            } else {
                let var_name = if let Some(eq_pos) = prop.find('=') {
                    prop[..eq_pos].trim()
                } else {
                    prop
                };
                names.push(var_name.to_string());
            }
        }
    } else if pattern.starts_with('[') && pattern.ends_with(']') {
        let inner = &pattern[1..pattern.len() - 1];
        let elements = split_derived_array_elements(inner);
        for el in &elements {
            let el = el.trim();
            if el.is_empty() {
                continue;
            }
            if let Some(rest_name) = el.strip_prefix("...") {
                names.push(rest_name.trim().to_string());
            } else {
                names.push(el.to_string());
            }
        }
    }

    names
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
pub(super) fn transform_legacy_state_declarations(
    line: &str,
    legacy_state_vars: &[(String, Option<String>, DeclarationKind)],
    immutable: bool,
) -> String {
    if legacy_state_vars.is_empty() {
        return line.to_string();
    }

    // Handle multi-declarator statements like `let a = 1, b = 2, c = 3;`
    // Split into individual declarations first to handle each one separately.
    // BUT skip declarations produced by transform_legacy_destructure_declarations
    // (which chain `tmp = expr, foo = $.mutable_source(tmp.foo), ...` and must stay chained).
    let is_destructure_expansion = memmem::find(line.as_bytes(), b"$.mutable_source(tmp").is_some()
        || memmem::find(line.as_bytes(), b"$.mutable_source(tmp_").is_some();
    if !is_destructure_expansion && let Some(split_lines) = split_multi_declarator(line) {
        let transformed_lines: Vec<String> = split_lines
            .iter()
            .map(|l| transform_legacy_state_declarations(l, legacy_state_vars, immutable))
            .collect();
        return transformed_lines.join("\n");
    }

    let mut result = line.to_string();

    for (var, _initial, decl_kind) in legacy_state_vars {
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

            // First, try to match `keyword varname = value` pattern
            let pattern_with_init = format!("{} {} = ", keyword, var);
            // Use a loop to find the first match that is NOT inside a for-loop header.
            // For example, in `function foo() { for (let x = 0; ...) {} }`, the `let x = 0`
            // inside the for-loop should be skipped - it's a loop variable, not a state variable.
            {
                let mut search_offset = 0;
                while let Some(rel_pos) = result[search_offset..].find(&pattern_with_init) {
                    let pos = search_offset + rel_pos;

                    // Check if already wrapped
                    if result[pos + pattern_with_init.len()..].starts_with("$.mutable_source(")
                        || result[pos + pattern_with_init.len()..].starts_with("$.prop(")
                    {
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
                    let after = &result[pos + pattern_with_init.len()..];
                    let expr_end = find_statement_end_client(after);
                    let expr = after[..expr_end].trim();

                    // Remove trailing semicolon from expr
                    let expr = expr.trim_end_matches(';').trim();

                    // Build the replacement
                    let replacement = if immutable {
                        format!("{} {} = $.mutable_source({}, true)", keyword, var, expr)
                    } else {
                        format!("{} {} = $.mutable_source({})", keyword, var, expr)
                    };

                    // Replace the declaration
                    result = format!(
                        "{}{}{}",
                        &result[..pos],
                        replacement,
                        &result[pos + pattern_with_init.len() + expr_end..]
                    );
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
                    let chars: Vec<char> = result[type_start..].chars().collect();
                    let mut depth = 0i32;
                    let mut eq_pos: Option<usize> = None;
                    let mut j = 0;
                    while j < chars.len() {
                        let c = chars[j];
                        match c {
                            '{' | '[' | '(' | '<' => depth += 1,
                            '}' | ']' | ')' | '>' => depth -= 1,
                            '=' if depth == 0 => {
                                // Make sure it's not `==` or `=>`
                                let next = chars.get(j + 1).copied();
                                if !matches!(next, Some('=') | Some('>')) {
                                    eq_pos = Some(j);
                                    break;
                                }
                            }
                            ';' | '\n' if depth == 0 => break,
                            _ => {}
                        }
                        j += 1;
                    }
                    if let Some(eq) = eq_pos {
                        let after_eq = type_start + eq + 1;
                        let after = &result[after_eq..];
                        let expr_end = find_statement_end_client(after);
                        let expr = after[..expr_end].trim().trim_end_matches(';').trim();
                        let replacement = if immutable {
                            format!("{} {} = $.mutable_source({}, true)", keyword, var, expr)
                        } else {
                            format!("{} {} = $.mutable_source({})", keyword, var, expr)
                        };
                        result = format!(
                            "{}{}{}",
                            &result[..pos],
                            replacement,
                            &result[after_eq + expr_end..]
                        );
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
                    let replacement = if immutable {
                        format!("{} {} = $.mutable_source(void 0, true);", keyword, var)
                    } else {
                        format!("{} {} = $.mutable_source();", keyword, var)
                    };

                    // Replace the declaration
                    result = format!(
                        "{}{}{}",
                        &result[..pos],
                        replacement,
                        &result[pos + pattern_no_init.len()..]
                    );
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
                        let replacement = if immutable {
                            format!("{} {} = $.mutable_source({}, true)", keyword, var, expr)
                        } else {
                            format!("{} {} = $.mutable_source({})", keyword, var, expr)
                        };
                        result = format!(
                            "{}{}{}",
                            &result[..pos],
                            replacement,
                            &result[after_eq + expr_end..]
                        );
                        matched = true;
                        break;
                    }
                    let replacement = if immutable {
                        format!("{} {} = $.mutable_source(void 0, true)", keyword, var)
                    } else {
                        format!("{} {} = $.mutable_source()", keyword, var)
                    };
                    result = format!("{}{}{}", &result[..pos], replacement, &result[after_pos..]);
                    matched = true;
                    break;
                }
            }
        }
    }

    result
}
