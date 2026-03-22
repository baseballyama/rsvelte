//! State and prop assignment transformations, identifier analysis, and legacy transforms.

use super::expression_utils::{
    byte_pos_to_char_index, find_assignment_expr_end, find_statement_end_client,
    is_identifier_char, is_incomplete_expression, is_inside_ternary_expression,
    is_shadowed_by_for_loop_var, is_variable_declaration, needs_compound_assignment_parens,
    replace_with_word_boundary_scoped,
};
use super::rune_transforms::{
    find_derived_property_colon, split_derived_array_elements, split_derived_object_properties,
};
use super::{
    SCRIPT_ARRAY_COUNTER, STATE_TMP_COUNTER, expression_needs_proxy_with_scope,
    get_or_compile_regex,
};
use crate::compiler::phases::phase2_analyze::scope::DeclarationKind;

// ---------------------------------------------------------------------------
// Identifier reference detection (lines 7653-8602 of mod.rs)
// ---------------------------------------------------------------------------

/// Check if an identifier is ONLY used as an assignment target (not read).
///
/// # Examples
///
/// - `component = Sub` → `component` is only assigned, returns true
/// - `count = count + 1` → `count` is read on RHS, returns false
/// - `if (x) component = Sub; else component = Banana` → returns true (only assignments)
pub(super) fn is_only_assignment_target(body: &str, identifier: &str) -> bool {
    let escaped = regex::escape(identifier);
    let pattern = format!(r"(^|[^a-zA-Z0-9_$\.]){}([^a-zA-Z0-9_$]|$)", escaped);
    let re = match get_or_compile_regex(&pattern) {
        Some(re) => re,
        None => return false,
    };

    let stripped_body = strip_string_literal_text(body);

    // Find all occurrences of the identifier
    let mut search_start = 0;
    let mut found_any = false;
    while search_start < stripped_body.len() {
        let search_slice = &stripped_body[search_start..];
        if let Some(m) = re.find(search_slice) {
            found_any = true;
            // Determine the actual start of the identifier within the match
            let abs_start = search_start + m.start();
            let match_str = &stripped_body[abs_start..search_start + m.end()];
            // The identifier may be preceded by a non-ident char
            let ident_start = if match_str.starts_with(identifier) {
                abs_start
            } else {
                abs_start + match_str.find(identifier).unwrap_or(0)
            };
            let ident_end = ident_start + identifier.len();

            // Check what follows the identifier (skipping whitespace)
            let after = stripped_body[ident_end..].trim_start();
            // Check if followed by assignment operator
            let is_assignment = after.starts_with("= ")
                || after.starts_with("=\t")
                || after.starts_with("=\n")
                || after.starts_with("=;")
                || after.starts_with(";\n")
                || after.starts_with("+=")
                || after.starts_with("-=")
                || after.starts_with("*=")
                || after.starts_with("/=")
                || after.starts_with("%=")
                || after.starts_with("**=")
                || after.starts_with("<<=")
                || after.starts_with(">>=")
                || after.starts_with(">>>=")
                || after.starts_with("&=")
                || after.starts_with("|=")
                || after.starts_with("^=")
                || after.starts_with("&&=")
                || after.starts_with("||=")
                || after.starts_with("??=");
            // Also handle end-of-line assignment: `identifier =\n`
            let is_assignment = is_assignment
                || (!after.is_empty() && after.starts_with('=') && !after.starts_with("=="));

            if !is_assignment {
                // This occurrence is a read, not an assignment target
                return false;
            }

            // Move past this match to find more occurrences
            search_start += m.end();
            // The regex match might end with a boundary char; back up one
            // so the next match can use it as a preceding boundary
            search_start = search_start.saturating_sub(1);
        } else {
            break;
        }
    }

    // If we found the identifier and all occurrences were assignments, return true
    found_any
}

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
    let pattern = format!(r"(^|[^a-zA-Z0-9_$\.]){}([^a-zA-Z0-9_$]|$)", escaped);
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
    let chars: Vec<char> = code.chars().collect();
    let mut result = chars.clone();
    let len = chars.len();
    let mut i = 0;

    while i < len {
        match chars[i] {
            // Handle single/double-quoted strings
            '\'' | '"' => {
                let quote = chars[i];
                i += 1; // skip opening quote
                while i < len && chars[i] != quote {
                    if chars[i] == '\\' && i + 1 < len {
                        result[i] = ' ';
                        result[i + 1] = ' ';
                        i += 2;
                    } else {
                        result[i] = ' ';
                        i += 1;
                    }
                }
                if i < len {
                    i += 1; // skip closing quote
                }
            }
            // Handle template literals
            '`' => {
                i += 1; // skip opening backtick
                while i < len && chars[i] != '`' {
                    if chars[i] == '\\' && i + 1 < len {
                        result[i] = ' ';
                        result[i + 1] = ' ';
                        i += 2;
                    } else if chars[i] == '$' && i + 1 < len && chars[i + 1] == '{' {
                        // Keep `${` and skip to the expression inside
                        i += 2; // skip `${`
                        // Find matching `}` - track depth
                        let mut depth = 1;
                        while i < len && depth > 0 {
                            match chars[i] {
                                '{' => depth += 1,
                                '}' => {
                                    depth -= 1;
                                    if depth == 0 {
                                        i += 1; // skip closing `}`
                                        break;
                                    }
                                }
                                // Handle nested template literals
                                '`' => {
                                    i += 1;
                                    // Skip nested template literal
                                    let mut nested_depth = 0;
                                    while i < len && (chars[i] != '`' || nested_depth > 0) {
                                        if chars[i] == '$' && i + 1 < len && chars[i + 1] == '{' {
                                            nested_depth += 1;
                                            i += 2;
                                        } else if chars[i] == '}' && nested_depth > 0 {
                                            nested_depth -= 1;
                                            i += 1;
                                        } else if chars[i] == '\\' && i + 1 < len {
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
                                '\'' | '"' => {
                                    // Strip string content inside expression
                                    let quote = chars[i];
                                    i += 1;
                                    while i < len && chars[i] != quote {
                                        if chars[i] == '\\' && i + 1 < len {
                                            result[i] = ' ';
                                            result[i + 1] = ' ';
                                            i += 2;
                                        } else {
                                            result[i] = ' ';
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
                        result[i] = ' ';
                        i += 1;
                    }
                }
                if i < len {
                    i += 1; // skip closing backtick
                }
            }
            // Skip escaped characters outside strings
            '\\' if i + 1 < len => {
                i += 2;
            }
            _ => {
                i += 1;
            }
        }
    }

    result.into_iter().collect()
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
                if next_char != ',' && next_char != ')' && next_char != ' ' {
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
            if next_char != ',' && next_char != ')' && next_char != ' ' {
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
                    let arrow_pos = result[paren_close + 1..].find("=>").unwrap() + paren_close + 1;
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
                        // Expression body arrow - harder to determine end
                        // Just skip for now, expression arrows are less common in $: statements
                        search_from = body_offset;
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
            ')' | ']' | '}' => {
                if depth > 0 {
                    depth -= 1;
                }
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
    let sep_pos = lhs.find('.').or_else(|| lhs.find('['));
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

/// Find the nearest unmatched opening delimiter (`{`, `(`, or `[`) scanning backward from `pos`.
/// This helps distinguish object literal context (`{`) from function call (`(`) or array (`[`).
pub(super) fn find_nearest_unmatched_open_delimiter(code: &str, pos: usize) -> Option<char> {
    let bytes = code.as_bytes();
    let mut depth_paren: i32 = 0;
    let mut depth_bracket: i32 = 0;
    let mut depth_brace: i32 = 0;

    let mut i = pos;
    while i > 0 {
        i -= 1;
        match bytes[i] {
            b')' => depth_paren += 1,
            b'(' => {
                if depth_paren > 0 {
                    depth_paren -= 1;
                } else {
                    return Some('(');
                }
            }
            b']' => depth_bracket += 1,
            b'[' => {
                if depth_bracket > 0 {
                    depth_bracket -= 1;
                } else {
                    return Some('[');
                }
            }
            b'}' => depth_brace += 1,
            b'{' => {
                if depth_brace > 0 {
                    depth_brace -= 1;
                } else {
                    return Some('{');
                }
            }
            _ => {}
        }
    }
    None
}

pub(super) fn is_in_variable_declaration_list(before_comma: &str) -> bool {
    // Simple heuristic: scan backwards past identifiers, assignments, and values
    // to find if there's a let/const/var keyword at the top level (not inside parens/brackets).
    // We need to handle: `let a = 1, b` -> before_comma for b is `let a = 1`
    // But NOT: `console.log('str'` -> not a declaration
    let trimmed = before_comma.trim();

    // Quick checks for common declaration patterns
    if trimmed.starts_with("let ") || trimmed.starts_with("const ") || trimmed.starts_with("var ") {
        // Make sure we're at the top level (not inside nested parens/braces)
        // Count unmatched parens and braces
        let mut paren_depth: i32 = 0;
        let mut brace_depth: i32 = 0;
        let mut bracket_depth: i32 = 0;
        let mut in_string = false;
        let mut string_char = ' ';

        for c in trimmed.chars() {
            if in_string {
                if c == '\\' {
                    continue;
                }
                if c == string_char {
                    in_string = false;
                }
                continue;
            }
            match c {
                '"' | '\'' | '`' => {
                    in_string = true;
                    string_char = c;
                }
                '(' => paren_depth += 1,
                ')' => paren_depth -= 1,
                '{' => brace_depth += 1,
                '}' => brace_depth -= 1,
                '[' => bracket_depth += 1,
                ']' => bracket_depth -= 1,
                _ => {}
            }
        }

        // If we're at the top level (all brackets balanced), this is a declaration list
        paren_depth == 0 && brace_depth == 0 && bracket_depth == 0
    } else {
        false
    }
}

/// Check if a position is inside a function parameter list, or inside a function body
/// where a parameter with the given `name` shadows the identifier.
pub(super) fn is_in_function_param_or_shadowed(code: &str, pos: usize, name: Option<&str>) -> bool {
    let bytes = code.as_bytes();

    // Track brace depth to determine function scope boundaries.
    // We scan backwards from pos to find enclosing function scopes.
    // For each enclosing function scope, check if the parameter list
    // contains the identifier name.

    let mut brace_depth: i32 = 0;

    let mut i = pos;
    while i > 0 {
        i -= 1;
        match bytes[i] {
            b'}' => brace_depth += 1,
            b'{' => {
                if brace_depth == 0 {
                    // We've found an enclosing `{` at the same level.
                    // Check if this is a function body by looking for `)` before `{`.
                    let before_brace = code[..i].trim_end();
                    if before_brace.ends_with(')') {
                        // Find the matching `(`
                        let close_paren = before_brace.len() - 1;
                        let mut pd: i32 = 0;
                        let mut open_paren = None;
                        let bb = before_brace.as_bytes();
                        let mut j = close_paren + 1;
                        while j > 0 {
                            j -= 1;
                            match bb[j] {
                                b')' => pd += 1,
                                b'(' => {
                                    pd -= 1;
                                    if pd == 0 {
                                        open_paren = Some(j);
                                        break;
                                    }
                                }
                                _ => {}
                            }
                        }
                        if let Some(op) = open_paren {
                            let before_paren = before_brace[..op].trim_end();
                            // Check if preceded by function keyword
                            let is_func = before_paren.ends_with("function")
                                || before_paren.ends_with("function*")
                                || {
                                    // function name(...)
                                    let stripped = before_paren.trim_end_matches(|c: char| {
                                        c.is_alphanumeric() || c == '_' || c == '$'
                                    });
                                    let stripped = stripped.trim_end();
                                    stripped.ends_with("function")
                                        || stripped.ends_with("function*")
                                        || stripped.ends_with("async function")
                                };
                            let is_arrow = {
                                // Check after `)` for `=>`
                                let after_close = before_brace[close_paren + 1..].trim_start();
                                after_close.starts_with("=>")
                            };
                            if is_func || is_arrow {
                                // Extract param list text
                                let param_text = &before_brace[op + 1..close_paren];
                                if let Some(name) = name {
                                    // Check if the param list contains this identifier
                                    let pattern = format!(r"\b{}\b", regex::escape(name));
                                    if let Some(re) = get_or_compile_regex(&pattern)
                                        && re.is_match(param_text)
                                    {
                                        return true;
                                    }
                                } else {
                                    // No name specified - we're checking if pos is IN the param list
                                    // This is the case when pos is between op and close_paren
                                    if pos > op && pos < close_paren + i + 1 {
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                    // Also check for `=>` after `{` (already inside arrow body)
                    // Continue scanning upward for more enclosing scopes
                } else {
                    brace_depth -= 1;
                }
            }
            _ => {}
        }
    }

    // Also check direct parameter list containment (pos is inside `(...)`)
    let before = &code[..pos];
    let mut paren_depth: i32 = 0;
    let mut last_open_paren = None;
    let mut k = before.len();
    while k > 0 {
        k -= 1;
        match bytes[k] {
            b')' => paren_depth += 1,
            b'(' => {
                if paren_depth == 0 {
                    last_open_paren = Some(k);
                    break;
                }
                paren_depth -= 1;
            }
            _ => {}
        }
    }

    if let Some(open_idx) = last_open_paren {
        let before_paren = code[..open_idx].trim_end();
        let is_func_param =
            before_paren.ends_with("function") || before_paren.ends_with("function*") || {
                let stripped = before_paren
                    .trim_end_matches(|c: char| c.is_alphanumeric() || c == '_' || c == '$');
                let stripped = stripped.trim_end();
                stripped.ends_with("function")
                    || stripped.ends_with("function*")
                    || stripped.ends_with("async function")
            };

        if is_func_param {
            return true;
        }

        // Check if closing `)` is followed by `=>` or `{`
        let mut paren_depth2: i32 = 0;
        let mut close_idx = None;
        for (j, &b) in code.as_bytes()[open_idx..].iter().enumerate() {
            match b {
                b'(' => paren_depth2 += 1,
                b')' => {
                    paren_depth2 -= 1;
                    if paren_depth2 == 0 {
                        close_idx = Some(open_idx + j);
                        break;
                    }
                }
                _ => {}
            }
        }
        if let Some(ci) = close_idx {
            let after_close = code[ci + 1..].trim_start();
            if after_close.starts_with("=>") {
                return true;
            }
        }
    }

    false
}

/// Check if a position is inside a destructuring pattern.
/// Destructuring patterns appear on the LEFT side of an assignment,
/// not the right side (which would be an object literal).
pub(super) fn is_in_destructuring_pattern(code: &str, pos: usize) -> bool {
    let before = &code[..pos];

    // Count unmatched braces to see if we're inside { }
    let mut brace_depth = 0;
    let mut last_open_brace = None;

    for (byte_idx, c) in before.char_indices() {
        match c {
            '{' => {
                brace_depth += 1;
                last_open_brace = Some(byte_idx);
            }
            '}' => brace_depth -= 1,
            _ => {}
        }
    }

    if brace_depth <= 0 {
        return false;
    }

    // If we're inside braces, check if they're part of a destructuring
    if let Some(open_idx) = last_open_brace {
        let before_brace = code[..open_idx].trim_end();

        // Destructuring patterns are on the LEFT side of assignment
        // So `= {` followed by content is NOT destructuring (it's an object literal on the right)
        // But `let {` or `const {` directly (no identifier between) IS destructuring

        // If it ends with `=`, check if there's an identifier before the `=`
        // `const foo = { ... }` is NOT destructuring
        // `const { ... } = foo` IS destructuring (but the `{` would be before `=`)
        if before_brace.ends_with('=') {
            // This is the right side of an assignment - NOT a destructuring pattern
            return false;
        }

        // Check for destructuring patterns: `let {`, `const {`, `var {`
        // These are cases where the brace immediately follows the keyword
        if before_brace.ends_with("let")
            || before_brace.ends_with("const")
            || before_brace.ends_with("var")
        {
            return true;
        }

        // Function parameter destructuring: `function({ prop })` or `({ prop }) =>`
        // But NOT function call arguments: `resolve({ prop })`, `foo({ prop })`
        // And NOT arrow function object returns: `() => ({ prop })` where `({` is an object literal
        if let Some(stripped) = before_brace.strip_suffix('(') {
            let before_paren = stripped.trim_end();
            // Arrow function returning parenthesized object: `=> ({...})`
            // This is NOT destructuring.
            let is_arrow_return = before_paren.ends_with("=>");
            let is_function_call = before_paren
                .chars()
                .last()
                .map(|c| c.is_alphanumeric() || c == '_' || c == '$' || c == '.')
                .unwrap_or(false);
            if !is_function_call && !is_arrow_return {
                return true;
            }
        }

        // Nested destructuring: `{ outer: { inner } }`
        if before_brace.ends_with(':') || before_brace.ends_with(',') {
            // Check if we're in the left side of an assignment
            // by looking for `= ` after the last `{` at our current depth
            let after_brace = &code[open_idx..];
            if !after_brace.contains('=') || after_brace.find('=').map(|i| open_idx + i) > Some(pos)
            {
                // The `=` is after our position, so we're on the left side
                return true;
            }
        }
    }

    false
}

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

/// Transform state variable assignments to $.set() calls.
pub(super) fn transform_state_assignments(
    line: &str,
    state_vars: &[String],
    _non_reactive_vars: &[String],
    _proxy_vars: &[String],
    raw_state_vars: &[String],
    is_runes: bool,
    non_proxy_vars: &[String],
) -> String {
    if state_vars.is_empty() || !state_vars.iter().any(|v| line.contains(v.as_str())) {
        return line.to_string();
    }

    let mut result = line.to_string();

    // Pre-check: does the line contain any update operators at all?
    let has_inc_dec = result.contains("++") || result.contains("--");
    let has_compound_assign = result.contains("+=")
        || result.contains("-=")
        || result.contains("*=")
        || result.contains("/=")
        || result.contains("%=")
        || result.contains("**=")
        || result.contains("??=")
        || result.contains("&&=")
        || result.contains("||=");
    let has_simple_assign = result.contains(" = ");

    for var in state_vars {
        // Skip variables that don't appear in this line at all
        if !result.contains(var.as_str()) {
            continue;
        }

        // Transform ++/-- operators only if the line contains them
        if has_inc_dec {
            // Transform ++varname to $.update_pre(varname)
            let pre_inc_pattern = format!("++{}", var);
            if result.contains(&pre_inc_pattern) {
                result = replace_with_word_boundary_scoped(
                    &result,
                    &pre_inc_pattern,
                    &format!("$.update_pre({})", var),
                    true,
                    Some(var),
                );
            }

            // Transform --varname to $.update_pre(varname, -1)
            let pre_dec_pattern = format!("--{}", var);
            if result.contains(&pre_dec_pattern) {
                result = replace_with_word_boundary_scoped(
                    &result,
                    &pre_dec_pattern,
                    &format!("$.update_pre({}, -1)", var),
                    true,
                    Some(var),
                );
            }

            // Transform varname++ to $.update(varname)
            let post_inc_pattern = format!("{}++", var);
            if result.contains(&post_inc_pattern) {
                result = replace_with_word_boundary_scoped(
                    &result,
                    &post_inc_pattern,
                    &format!("$.update({})", var),
                    false,
                    Some(var),
                );
            }

            // Transform varname-- to $.update(varname, -1)
            let post_dec_pattern = format!("{}--", var);
            if result.contains(&post_dec_pattern) {
                result = replace_with_word_boundary_scoped(
                    &result,
                    &post_dec_pattern,
                    &format!("$.update({}, -1)", var),
                    false,
                    Some(var),
                );
            }
        }

        // Transform compound assignments: varname += expr to $.set(varname, $.get(varname) + (expr))
        if has_compound_assign {
            for op in &["+=", "-=", "*=", "/=", "%=", "**="] {
                let pattern = format!("{} {}", var, op);
                if result.contains(&pattern) {
                    let op_char = &op[..op.len() - 1]; // Remove the '='
                    if let Some(pos) = result.find(&pattern) {
                        // Skip if this is a member expression (e.g., this.count +=, obj.prop +=)
                        let before = &result[..pos];
                        if before.ends_with('.') {
                            continue;
                        }

                        // Skip if preceded by an identifier character or '#' (private field)
                        if !before.is_empty()
                            && (is_identifier_char(before.chars().last().unwrap())
                                || before.ends_with('#'))
                        {
                            continue;
                        }

                        // Skip if inside a for-loop scope with the same variable
                        {
                            let chars: Vec<char> = result.chars().collect();
                            let char_pos = byte_pos_to_char_index(&result, pos);
                            if is_shadowed_by_for_loop_var(&chars, char_pos, var) {
                                continue;
                            }
                        }

                        let after = &result[pos + pattern.len()..];
                        // Find the expression (until ; or end, respecting nested braces)
                        let expr_end = find_statement_end_client(after);
                        let expr = after[..expr_end].trim();
                        // Don't wrap here - let the later wrap_state_vars_in_expr call handle it
                        // so it can properly detect function parameter shadowing
                        //
                        // Only add parens around expr when needed for precedence.
                        // Simple expressions (literals, identifiers, function calls) don't
                        // need parens since they have higher precedence than any binary op.
                        let expr_str = if needs_compound_assignment_parens(expr, op_char) {
                            format!("({})", expr)
                        } else {
                            expr.to_string()
                        };
                        let replacement =
                            format!("$.set({}, $.get({}) {} {})", var, var, op_char, expr_str);
                        result = format!(
                            "{}{}{}",
                            &result[..pos],
                            replacement,
                            &result[pos + pattern.len() + expr_end..]
                        );
                    }
                }
            }
        } // end if has_compound_assign

        // Transform logical assignment operators: varname ??= expr to $.set(varname, $.get(varname) ?? (expr))
        // These operators have two-character prefixes before the '='
        if has_compound_assign {
            for (op, op_without_eq) in &[("??=", "??"), ("&&=", "&&"), ("||=", "||")] {
                let pattern = format!("{} {}", var, op);
                if let Some(pos) = result.find(&pattern) {
                    // Skip if this is a member expression (e.g., this.count ??=, obj.prop ??=)
                    let before = &result[..pos];
                    if before.ends_with('.') {
                        continue;
                    }

                    // Skip if preceded by an identifier character or '#' (private field)
                    if !before.is_empty()
                        && (is_identifier_char(before.chars().last().unwrap())
                            || before.ends_with('#'))
                    {
                        continue;
                    }

                    // Skip if inside a for-loop scope with the same variable
                    {
                        let chars: Vec<char> = result.chars().collect();
                        let char_pos = byte_pos_to_char_index(&result, pos);
                        if is_shadowed_by_for_loop_var(&chars, char_pos, var) {
                            continue;
                        }
                    }

                    let after = &result[pos + pattern.len()..];
                    // Find the expression (until ; or end, respecting nested braces)
                    let expr_end = find_statement_end_client(after);
                    let expr = after[..expr_end].trim();
                    // Don't wrap here - let the later wrap_state_vars_in_expr call handle it
                    // so it can properly detect function parameter shadowing
                    let expr_str = if needs_compound_assignment_parens(expr, op_without_eq) {
                        format!("({})", expr)
                    } else {
                        expr.to_string()
                    };
                    let replacement = format!(
                        "$.set({}, $.get({}) {} {})",
                        var, var, op_without_eq, expr_str
                    );
                    result = format!(
                        "{}{}{}",
                        &result[..pos],
                        replacement,
                        &result[pos + pattern.len() + expr_end..]
                    );
                }
            }
        } // end if has_compound_assign (logical)

        // Transform simple assignment: varname = expr to $.set(varname, expr)
        // But not if it's a declaration (let/const/var varname = ...)
        if !has_simple_assign {
            continue; // No " = " in the line, skip simple assignment transforms for this var
        }
        // Use a loop to handle multiple assignments of the same variable in one statement
        let assignment_pattern = format!("{} = ", var);
        let mut search_start = 0;
        // Check if a declaration of this variable exists in the statement.
        // If yes, we need per-occurrence checks (not a blanket skip) because
        // the declaration and reassignment may be on different lines within the same
        // multi-line statement (e.g., inside a derived callback).
        let has_declaration = is_variable_declaration(&result, var);
        while let Some(relative_pos) = result[search_start..].find(&assignment_pattern) {
            let pos = search_start + relative_pos;

            // Check that it's not part of a comparison (==, ===)
            let before = &result[..pos];
            // Skip if preceded by dot (property access like foo.count = ...)
            // Also skip if already wrapped with $.set
            if before.ends_with('=') || before.ends_with('!') || before.ends_with('.') {
                search_start = pos + assignment_pattern.len();
                continue;
            }

            // Skip if preceded by an identifier character (not a word boundary)
            // This prevents matching "reactive" inside "nonreactive"
            // Also skip if preceded by '#' (private class field like #y)
            if !before.is_empty()
                && (is_identifier_char(before.chars().last().unwrap()) || before.ends_with('#'))
            {
                search_start = pos + assignment_pattern.len();
                continue;
            }

            // Skip if this is already wrapped with $.set
            if before.ends_with(&format!("$.set({}, ", var))
                || before.ends_with(&format!("$.set({},", var))
            {
                search_start = pos + assignment_pattern.len();
                continue;
            }

            // Skip if the variable is shadowed by a for-loop's let/const declaration
            {
                let chars: Vec<char> = result.chars().collect();
                let char_pos = byte_pos_to_char_index(&result, pos);
                if is_shadowed_by_for_loop_var(&chars, char_pos, var) {
                    search_start = pos + assignment_pattern.len();
                    continue;
                }
            }

            // If a declaration of this variable exists in the statement, check
            // whether THIS specific occurrence is part of a declaration by examining
            // the text on the same line (or immediately preceding this position).
            if has_declaration {
                let last_newline = before.rfind('\n').map(|p| p + 1).unwrap_or(0);
                let line_text = result[last_newline..pos].trim_start();
                // Check if this line starts with a declaration keyword
                if line_text.starts_with("let ")
                    || line_text.starts_with("const ")
                    || line_text.starts_with("var ")
                {
                    search_start = pos + assignment_pattern.len();
                    continue;
                }
                // Also check for multi-declarator pattern (comma-separated in a declaration)
                let before_trimmed = before.trim_end();
                if before_trimmed.ends_with(',')
                    && (result.trim().starts_with("let ")
                        || result.trim().starts_with("const ")
                        || result.trim().starts_with("var "))
                {
                    search_start = pos + assignment_pattern.len();
                    continue;
                }
            }

            let after = &result[pos + assignment_pattern.len()..];
            // Find the expression (until ; or end of line, respecting nested braces)
            // If this assignment is inside a ternary expression, also stop at `:`
            let before_for_ternary = &result[..pos];
            let in_ternary = is_inside_ternary_expression(before_for_ternary);
            let expr_end = find_assignment_expr_end(after, in_ternary);
            let expr = after[..expr_end].trim();

            // Skip incomplete expressions (e.g., multi-line arrow functions
            // where only the first line is processed)
            if is_incomplete_expression(expr) {
                search_start = pos + assignment_pattern.len();
                continue;
            }

            // Check it's not already wrapped in a $.set() call
            // Note: We must NOT skip expressions that start with $.
            // because legitimate RHS values like $.effect_tracking(), $.get(x),
            // $.proxy(x) etc. should still be wrapped in $.set().
            // The "already wrapped" check ($.set(var, ...)) is done above at the
            // `before` prefix check.
            if !expr.starts_with("$.set(") {
                // DON'T wrap state variables here - let the later wrap_state_vars_in_expr
                // call handle it, since that call has the full statement context and can
                // properly detect function parameter shadowing.
                // The later call in process_accumulated will handle $.get() wrapping
                // after we've created the $.set() call.

                // Check if the value needs proxying (could be an object/array)
                // $state.raw() variables never need proxy wrapping
                // Proxy flag is only added in runes mode
                let is_raw_state = raw_state_vars.contains(var);
                let needs_proxy = is_runes
                    && !is_raw_state
                    && expression_needs_proxy_with_scope(expr.trim(), non_proxy_vars);

                let replacement = if needs_proxy {
                    format!("$.set({}, {}, true)", var, expr)
                } else {
                    format!("$.set({}, {})", var, expr)
                };

                let new_result = format!(
                    "{}{}{}",
                    &result[..pos],
                    replacement,
                    &result[pos + assignment_pattern.len() + expr_end..]
                );
                // Update search_start to continue after this replacement
                search_start = pos + replacement.len();
                result = new_result;
            } else {
                search_start = pos + assignment_pattern.len();
            }
        }
    }

    result
}

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

    // Quick pre-check: if `$.set(` doesn't appear in the line, there are no state sets to wrap
    if !line.contains("$.set(") {
        return line.to_string();
    }

    let mut result = line.to_string();

    for state_var in state_vars {
        // Check if this state variable has a corresponding store subscription
        let store_sub_name = format!("${}", state_var);
        if !store_sub_vars.contains(&store_sub_name) {
            continue;
        }

        // Find `$.set(var, ...)` patterns and wrap with $.store_unsub()
        // We need to handle patterns like:
        //   $.set(foo, writable(42))
        //   $.set(foo, writable(42), true)
        let set_pattern = format!("$.set({}, ", state_var);
        let mut search_start = 0;

        while let Some(relative_pos) = result[search_start..].find(&set_pattern) {
            let pos = search_start + relative_pos;

            // Check we're not already wrapped in $.store_unsub
            let before = &result[..pos];
            if before.ends_with("$.store_unsub(") {
                search_start = pos + set_pattern.len();
                continue;
            }

            // Find the matching closing paren for $.set(...)
            let set_start = pos;
            let args_start = pos + set_pattern.len();
            let mut paren_depth = 1i32;
            let mut i = args_start;
            let chars: Vec<char> = result.chars().collect();
            let mut in_string: Option<char> = None;
            let mut in_template = false;
            let mut template_depth = 0i32;

            while i < chars.len() && paren_depth > 0 {
                let c = chars[i];

                // Handle string context
                if let Some(quote) = in_string {
                    if c == '\\' {
                        i += 1; // skip escaped char
                    } else if c == quote && !in_template {
                        in_string = None;
                    }
                    i += 1;
                    continue;
                }

                if in_template {
                    if c == '`' {
                        in_template = false;
                    } else if c == '\\' {
                        i += 1; // skip escaped char
                    } else if c == '$' && i + 1 < chars.len() && chars[i + 1] == '{' {
                        template_depth += 1;
                        i += 1;
                    } else if c == '}' && template_depth > 0 {
                        template_depth -= 1;
                    }
                    i += 1;
                    continue;
                }

                match c {
                    '\'' | '"' => {
                        in_string = Some(c);
                    }
                    '`' => {
                        in_template = true;
                    }
                    '(' => paren_depth += 1,
                    ')' => {
                        paren_depth -= 1;
                        if paren_depth == 0 {
                            // Found the closing paren
                            let set_end = i + 1;
                            let set_call: String = chars[set_start..set_end].iter().collect();

                            // Wrap in $.store_unsub(set_call, '$var', $$stores)
                            let wrapped = format!(
                                "$.store_unsub({}, '{}', $$stores)",
                                set_call, store_sub_name
                            );

                            let before_str: String = chars[..set_start].iter().collect();
                            let after_str: String = chars[set_end..].iter().collect();
                            result = format!("{}{}{}", before_str, wrapped, after_str);
                            // Move past the wrapped content
                            search_start = before_str.len() + wrapped.len();
                            break;
                        }
                    }
                    _ => {}
                }
                i += 1;
            }

            if paren_depth > 0 {
                // Didn't find matching paren, move past
                search_start = pos + set_pattern.len();
            }
        }
    }

    result
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
    if line.contains("$.prop(") || line.contains("$.rest_props(") {
        return line.to_string();
    }

    // Quick pre-check: if none of the prop vars appear in the line, skip expensive transforms
    if !prop_vars.iter().any(|v| line.contains(v.as_str())) {
        return line.to_string();
    }

    let mut result = line.to_string();

    for var in prop_vars {
        // Note: x++ / x-- / ++x / --x are handled by transform_prop_update_expressions
        // which runs BEFORE this function. By the time we get here, update expressions
        // have already been converted to $.update_prop(x) / $.update_pre_prop(x).

        // Transform compound assignments: varname += expr to varname(varname() + (expr))
        for op in &["+=", "-=", "*=", "/=", "%=", "**="] {
            let pattern = format!("{} {}", var, op);
            if result.contains(&pattern) {
                let op_char = &op[..op.len() - 1]; // Remove the '='
                if let Some(pos) = result.find(&pattern) {
                    // Skip if this is a member expression (e.g., this.x +=, obj.x +=)
                    let before = &result[..pos];
                    if before.ends_with('.') {
                        continue;
                    }

                    // Skip if preceded by an identifier character (not a word boundary)
                    if !before.is_empty() && is_identifier_char(before.chars().last().unwrap()) {
                        continue;
                    }

                    let after = &result[pos + pattern.len()..];
                    // Find the expression (until ; or end, respecting nested braces)
                    let expr_end = find_statement_end_client(after);
                    let expr = after[..expr_end].trim();
                    let replacement = format!("{}({}() {} ({}))", var, var, op_char, expr);
                    result = format!(
                        "{}{}{}",
                        &result[..pos],
                        replacement,
                        &result[pos + pattern.len() + expr_end..]
                    );
                }
            }
        }

        // Transform logical assignment operators: varname ??= expr to varname(varname() ?? (expr))
        for (op, op_without_eq) in &[("??=", "??"), ("&&=", "&&"), ("||=", "||")] {
            let pattern = format!("{} {}", var, op);
            if let Some(pos) = result.find(&pattern) {
                let before = &result[..pos];
                if before.ends_with('.') {
                    continue;
                }

                if !before.is_empty() && is_identifier_char(before.chars().last().unwrap()) {
                    continue;
                }

                let after = &result[pos + pattern.len()..];
                let expr_end = find_statement_end_client(after);
                let expr = after[..expr_end].trim();
                let replacement = format!("{}({}() {} ({}))", var, var, op_without_eq, expr);
                result = format!(
                    "{}{}{}",
                    &result[..pos],
                    replacement,
                    &result[pos + pattern.len() + expr_end..]
                );
            }
        }

        // Transform simple assignment: varname = expr to varname(expr)
        // But not if it's a declaration (let/const/var varname = ...)
        let assignment_pattern = format!("{} = ", var);
        let mut search_start = 0;
        while !result.contains(&format!("let {} = ", var))
            && !result.contains(&format!("const {} = ", var))
            && !result.contains(&format!("var {} = ", var))
        {
            if let Some(relative_pos) = result[search_start..].find(&assignment_pattern) {
                let pos = search_start + relative_pos;

                // Check that it's not part of a comparison (==, ===)
                let before = &result[..pos];
                if before.ends_with('=') || before.ends_with('!') || before.ends_with('.') {
                    search_start = pos + assignment_pattern.len();
                    continue;
                }

                // Skip if preceded by an identifier character
                if !before.is_empty() && is_identifier_char(before.chars().last().unwrap()) {
                    search_start = pos + assignment_pattern.len();
                    continue;
                }

                let after = &result[pos + assignment_pattern.len()..];
                let expr_end = find_statement_end_client(after);
                let expr = &after[..expr_end];
                let replacement = format!("{}({})", var, expr.trim());

                let new_result = format!(
                    "{}{}{}",
                    &result[..pos],
                    replacement,
                    &result[pos + assignment_pattern.len() + expr_end..]
                );
                search_start = pos + replacement.len();
                result = new_result;
            } else {
                break;
            }
        }

        // Transform member mutations: varname.prop = value to varname(varname().prop = value, true)
        // This is needed for bindable props in legacy mode only.
        // In runes mode, non-bindable props (kind === 'prop') should NOT have member mutations
        // wrapped with the prop setter - they should just have read transforms applied.
        // Bindable props (kind === 'bindable_prop') DO need the wrapping because the parent
        // could be a legacy component which needs coarse-grained reactivity.
        // Reference: In the official compiler, prop's mutate transform returns the value as-is,
        // while bindable_prop's mutate transform wraps with prop(mutation, true).
        if !non_bindable_prop_vars.contains(var) {
            for dot_suffix in &["().", "."] {
                let member_pattern = format!("{}{}", var, dot_suffix);
                let mut member_search_start = 0;

                while let Some(relative_pos) = result[member_search_start..].find(&member_pattern) {
                    let pos = member_search_start + relative_pos;

                    // Check that this is a word boundary (not part of another identifier)
                    let before = &result[..pos];
                    if !before.is_empty() && is_identifier_char(before.chars().last().unwrap()) {
                        member_search_start = pos + member_pattern.len();
                        continue;
                    }

                    // Find the assignment in this member expression
                    let after_member = &result[pos + member_pattern.len()..];

                    // Find the property name and equals sign
                    // Example: "parentElement = node.parentElement"
                    // We need to find where the property ends and where = is
                    let mut eq_pos = None;
                    let after_member_chars: Vec<char> = after_member.chars().collect();
                    let mut scan_depth = 0i32;
                    for (i, c) in after_member.char_indices() {
                        // Track nesting depth to avoid matching = inside parens/brackets
                        match c {
                            '(' | '[' | '{' => {
                                scan_depth += 1;
                                continue;
                            }
                            ')' | ']' | '}' => {
                                scan_depth -= 1;
                                continue;
                            }
                            ';' | '\n' if scan_depth == 0 => {
                                // Reached end of statement without finding assignment
                                break;
                            }
                            _ => {}
                        }
                        // Only look for assignment at depth 0
                        if c == '=' && scan_depth == 0 {
                            let char_idx = after_member[..i].chars().count();
                            let prev = if char_idx > 0 {
                                after_member_chars.get(char_idx - 1).copied()
                            } else {
                                None
                            };
                            let next = after_member_chars.get(char_idx + 1).copied();
                            // Skip ==, ===
                            if prev == Some('=') || next == Some('=') {
                                continue;
                            }
                            // Skip => (arrow function)
                            if next == Some('>') {
                                continue;
                            }
                            // Skip !=, !==, <=, >=
                            if matches!(prev, Some('!') | Some('<') | Some('>')) {
                                continue;
                            }
                            // For compound assignments (+=, -=, etc.), we still want to
                            // capture the position so we can generate the wrapped mutation.
                            eq_pos = Some(i);
                            break;
                        }
                    }

                    // If we found an assignment (including compound operators)
                    if let Some(eq_idx) = eq_pos {
                        // Check if this is already wrapped
                        if before.ends_with(&format!("{}({}().", var, var)) {
                            member_search_start = pos + member_pattern.len();
                            continue;
                        }

                        // Detect the full assignment operator (=, +=, -=, *=, etc.)
                        // eq_idx points to '=' in after_member, but we need to check the
                        // character before '=' for compound operators
                        let char_before_eq = if eq_idx > 0 {
                            after_member.as_bytes().get(eq_idx - 1).map(|&b| b as char)
                        } else {
                            None
                        };
                        let (assign_op, op_start_offset) = match char_before_eq {
                            Some('+') => ("+=", 1),
                            Some('-') => ("-=", 1),
                            Some('*') => {
                                // Check for **=
                                if eq_idx >= 2
                                    && after_member.as_bytes().get(eq_idx - 2).map(|&b| b as char)
                                        == Some('*')
                                {
                                    ("**=", 2)
                                } else {
                                    ("*=", 1)
                                }
                            }
                            Some('/') => ("/=", 1),
                            Some('%') => ("%=", 1),
                            Some('&') => {
                                if eq_idx >= 2
                                    && after_member.as_bytes().get(eq_idx - 2).map(|&b| b as char)
                                        == Some('&')
                                {
                                    ("&&=", 2)
                                } else {
                                    ("&=", 1)
                                }
                            }
                            Some('|') => {
                                if eq_idx >= 2
                                    && after_member.as_bytes().get(eq_idx - 2).map(|&b| b as char)
                                        == Some('|')
                                {
                                    ("||=", 2)
                                } else {
                                    ("|=", 1)
                                }
                            }
                            Some('^') => ("^=", 1),
                            Some('?') => {
                                if eq_idx >= 2
                                    && after_member.as_bytes().get(eq_idx - 2).map(|&b| b as char)
                                        == Some('?')
                                {
                                    ("??=", 2)
                                } else {
                                    ("=", 0) // single ? before = is unexpected, treat as =
                                }
                            }
                            _ => ("=", 0),
                        };

                        let prop_name = after_member[..eq_idx - op_start_offset].trim_end();
                        let after_eq_raw = &after_member[eq_idx + 1..];
                        let leading_whitespace =
                            after_eq_raw.len() - after_eq_raw.trim_start().len();
                        let after_eq = after_eq_raw.trim_start();

                        // Find the value expression end
                        let value_end = find_statement_end_client(after_eq);
                        let value = after_eq[..value_end].trim();

                        // Wrap with prop(prop().prop OP value, true)
                        let replacement = format!(
                            "{}({}().{} {} {}, true)",
                            var, var, prop_name, assign_op, value
                        );

                        // Calculate the original content length:
                        // member_pattern.len() + eq_idx + 1 (for '=') + leading_whitespace + value_end
                        let original_len =
                            member_pattern.len() + eq_idx + 1 + leading_whitespace + value_end;

                        let new_result = format!(
                            "{}{}{}",
                            &result[..pos],
                            replacement,
                            &result[pos + original_len..]
                        );
                        member_search_start = pos + replacement.len();
                        result = new_result;
                    } else {
                        member_search_start = pos + member_pattern.len();
                    }
                }
            } // end for dot_suffix

            // Transform bracket-notation member mutations: varname[expr] = value to varname(varname()[expr] = value, true)
            // This is needed for bindable props when the member access uses bracket notation
            // e.g., `rows[row] = ''` -> `rows(rows()[row] = '', true)`
            //
            // Also handle the case where prop reads have already been transformed:
            // e.g., `foo()[bar()] = true` -> `foo(foo()[bar()] = true, true)`
            // The pattern `{var}()[` matches when transform_prop_reads_in_expr has already
            // converted `foo` to `foo()` before this function runs.
            //
            // We try both patterns: `{var}()[` first (already read-transformed), then `{var}[` (original).
            for bracket_suffix in &["()[", "["] {
                let bracket_pattern = format!("{}{}", var, bracket_suffix);
                let mut bracket_search_start = 0;

                while let Some(relative_pos) = result[bracket_search_start..].find(&bracket_pattern)
                {
                    let pos = bracket_search_start + relative_pos;

                    // Check that this is a word boundary (not part of another identifier)
                    let before = &result[..pos];
                    if !before.is_empty() && is_identifier_char(before.chars().last().unwrap()) {
                        bracket_search_start = pos + bracket_pattern.len();
                        continue;
                    }

                    // Check if this is already wrapped (e.g., varname(varname()[...)
                    // This catches both the full pattern `var(var()[` and the case where
                    // we're inside an already-generated mutation wrapper `var(var()[...]...)`
                    // where `before` is just `var(`.
                    let already_wrapped_pattern = format!("{}({}()", var, var);
                    let short_wrapped_pattern = format!("{}(", var);
                    if before.ends_with(&already_wrapped_pattern) {
                        bracket_search_start = pos + bracket_pattern.len();
                        continue;
                    }
                    // Also check the shorter pattern: if `before` ends with `var(` at a word boundary,
                    // then the current `var()[` is inside an existing mutation wrapper.
                    // For example: `items(items()[2] = ...)` - inner `items()` at position 6
                    // has before = `items(`. Verify it's at a word boundary by checking the
                    // character before `var(`.
                    if before.ends_with(&short_wrapped_pattern) {
                        let prefix_before = &before[..before.len() - short_wrapped_pattern.len()];
                        if prefix_before.is_empty()
                            || !is_identifier_char(prefix_before.chars().last().unwrap())
                        {
                            bracket_search_start = pos + bracket_pattern.len();
                            continue;
                        }
                    }

                    // Find the matching closing bracket
                    let after_bracket = &result[pos + bracket_pattern.len()..];
                    let mut bracket_depth = 1i32;
                    let mut close_bracket_pos = None;
                    for (i, c) in after_bracket.char_indices() {
                        match c {
                            '[' => bracket_depth += 1,
                            ']' => {
                                bracket_depth -= 1;
                                if bracket_depth == 0 {
                                    close_bracket_pos = Some(i);
                                    break;
                                }
                            }
                            _ => {}
                        }
                    }

                    let Some(close_pos) = close_bracket_pos else {
                        bracket_search_start = pos + bracket_pattern.len();
                        continue;
                    };

                    // After the closing bracket, look for an assignment operator
                    let after_close = &after_bracket[close_pos + 1..];
                    let trimmed_after = after_close.trim_start();
                    let whitespace_len = after_close.len() - trimmed_after.len();

                    // Check for assignment operator (simple `=` or compound `+=`, `-=`, `*=`, etc.)
                    // but not ==, ===, =>, etc.
                    let (assign_op, assign_op_len) = detect_assignment_operator(trimmed_after);

                    if let Some(op) = assign_op {
                        let op_len = assign_op_len;
                        let after_eq = &trimmed_after[op_len..];
                        let after_eq_trimmed = after_eq.trim_start();
                        let eq_whitespace = after_eq.len() - after_eq_trimmed.len();

                        // Find the value expression end
                        let value_end = find_statement_end_client(after_eq_trimmed);
                        let value = after_eq_trimmed[..value_end].trim();

                        let bracket_content = &after_bracket[..close_pos];

                        // Build: varname(varname()[bracket_content] OP value, true)
                        // The inner varname() is always with () for the read getter.
                        let replacement = format!(
                            "{}({}()[{}] {} {}, true)",
                            var, var, bracket_content, op, value
                        );

                        // Calculate original length from the start of varname to end of value
                        let original_len = bracket_pattern.len()
                            + close_pos
                            + 1
                            + whitespace_len
                            + op_len
                            + eq_whitespace
                            + value_end;

                        let new_result = format!(
                            "{}{}{}",
                            &result[..pos],
                            replacement,
                            &result[pos + original_len..]
                        );
                        bracket_search_start = pos + replacement.len();
                        result = new_result;
                    } else {
                        bracket_search_start = pos + bracket_pattern.len();
                    }
                }
            }
        } // end if !non_bindable_prop (skip member mutation wrapping for non-bindable props)
    }

    result
}

/// Detect an assignment operator at the start of a string.
///
/// Returns `(Some(operator_str), operator_byte_len)` if an assignment operator is found,
/// or `(None, 0)` if no assignment operator is at the start.
///
/// Handles: `=`, `+=`, `-=`, `*=`, `/=`, `%=`, `**=`, `&=`, `|=`, `^=`, `&&=`, `||=`, `??=`,
/// `<<=`, `>>=`, `>>>=`.
/// Excludes: `==`, `===`, `=>`.
pub(super) fn detect_assignment_operator(s: &str) -> (Option<&'static str>, usize) {
    let bytes = s.as_bytes();
    if bytes.is_empty() {
        return (None, 0);
    }

    // Check for 4-char operators first
    if bytes.len() >= 4 {
        let four = &s[..4];
        if four == ">>>=" {
            return (Some(">>>="), 4);
        }
    }

    // Check for 3-char operators
    if bytes.len() >= 3 {
        let three = &s[..3];
        match three {
            "**=" => return (Some("**="), 3),
            "&&=" => return (Some("&&="), 3),
            "||=" => return (Some("||="), 3),
            "??=" => return (Some("??="), 3),
            "<<=" => return (Some("<<="), 3),
            ">>=" => {
                // Make sure it's not >>>=
                if bytes.len() < 4 || bytes[3] != b'=' {
                    return (Some(">>="), 3);
                }
            }
            _ => {}
        }
    }

    // Check for 2-char operators
    if bytes.len() >= 2 {
        let two = &s[..2];
        match two {
            "+=" => return (Some("+="), 2),
            "-=" => return (Some("-="), 2),
            "*=" => return (Some("*="), 2),
            "/=" => return (Some("/="), 2),
            "%=" => return (Some("%="), 2),
            "&=" => return (Some("&="), 2),
            "|=" => return (Some("|="), 2),
            "^=" => return (Some("^="), 2),
            // Exclude ==, =>
            "==" | "=>" => return (None, 0),
            _ => {}
        }
    }

    // Check for simple = (but not ==, =>)
    if bytes[0] == b'=' {
        if bytes.len() >= 2 && (bytes[1] == b'=' || bytes[1] == b'>') {
            return (None, 0);
        }
        return (Some("="), 1);
    }

    (None, 0)
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
    } else if let Some(r) = trimmed.strip_prefix("var ") {
        ("var", r)
    } else {
        return None;
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
            ')' | ']' | '}' => {
                if depth > 0 {
                    depth -= 1;
                }
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
    let is_destructure_expansion =
        line.contains("$.mutable_source(tmp") || line.contains("$.mutable_source(tmp_");
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
                    let replacement = if immutable {
                        format!("{} {} = $.mutable_source(undefined, true);", keyword, var)
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
                    let replacement = if immutable {
                        format!("{} {} = $.mutable_source(undefined, true)", keyword, var)
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
