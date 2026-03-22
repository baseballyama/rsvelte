//! Expression parsing, shadowing detection, and identifier analysis utilities.

use rustc_hash::FxHashSet;

use super::VAR_STATE_VARS;

/// Find the end of an expression (until ; or newline at depth 0).
pub(super) fn find_expression_end(s: &str) -> usize {
    let mut depth = 0;
    let chars: Vec<char> = s.chars().collect();
    let mut in_string = false;
    let mut string_char = ' ';

    for (i, &c) in chars.iter().enumerate() {
        // Handle string literals
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
                } else {
                    return i;
                }
            }
            ';' | '\n' if depth == 0 => return i,
            _ => {}
        }
    }

    s.len()
}

/// Collapse a multi-line expression to a single line, matching esrap's behavior.
/// Strip TypeScript generic type parameters from rune calls.
/// Converts `$state<SomeType>(...)` → `$state(...)` and `$derived<T>(...)` → `$derived(...)`.
/// Handles nested angle brackets like `$state<ReturnType<typeof autoUpdate>>()`.
/// Extract the variable name from text preceding a rune call like `$state(` or `$state.raw(`.
/// Given `"let foo = "` or `"const bar: SomeType = "`, returns the variable name.
/// Works by scanning backwards from the end to find `varname =` pattern,
/// skipping optional TypeScript type annotations.
pub(super) fn extract_var_name_before_rune(before_rune: &str) -> String {
    let trimmed = before_rune.trim_end();
    if !trimmed.ends_with('=') {
        return String::new();
    }

    // Check it's not `==` or `=>`
    let eq_pos = trimmed.len() - 1;
    if eq_pos > 0 {
        let prev = trimmed.as_bytes()[eq_pos - 1];
        if prev == b'=' || prev == b'!' || prev == b'<' || prev == b'>' {
            return String::new();
        }
    }

    let before_eq = trimmed[..eq_pos].trim_end();
    // Skip optional TypeScript type annotation (: Type)
    // Only look for `:` on the same line as the `=`, to avoid matching `:` inside
    // object literals from previously transformed code.
    let current_line_start = before_eq.rfind('\n').map_or(0, |p| p + 1);
    let current_line = &before_eq[current_line_start..];
    let before_type = if let Some(colon_offset) = current_line.rfind(':') {
        let colon_pos = current_line_start + colon_offset;
        let candidate = before_eq[..colon_pos].trim_end();
        if candidate
            .chars()
            .last()
            .is_some_and(|c| c.is_alphanumeric() || c == '_' || c == '$')
        {
            candidate
        } else {
            before_eq
        }
    } else {
        before_eq
    };

    // Extract identifier (variable name) from the end
    let chars: Vec<char> = before_type.chars().collect();
    let mut end = chars.len();
    while end > 0 && chars[end - 1].is_whitespace() {
        end -= 1;
    }
    let mut start = end;
    while start > 0
        && (chars[start - 1].is_alphanumeric()
            || chars[start - 1] == '_'
            || chars[start - 1] == '$')
    {
        start -= 1;
    }
    if start < end {
        chars[start..end].iter().collect()
    } else {
        String::new()
    }
}

pub(super) fn strip_rune_generic_params(input: &str) -> String {
    let chars: Vec<char> = input.chars().collect();
    let len = chars.len();
    let mut result = String::with_capacity(input.len());
    let mut i = 0;

    while i < len {
        // Look for $state< or $derived< patterns
        let remaining: String = chars[i..].iter().collect();
        let is_state = remaining.starts_with("$state<");
        let is_derived = remaining.starts_with("$derived<");

        if is_state || is_derived {
            let rune_name_len = if is_state { 6 } else { 8 }; // "$state" or "$derived"
            // Make sure it's not preceded by an identifier char (e.g., not part of "$.state<")
            let preceded_by_id =
                i > 0 && (chars[i - 1].is_ascii_alphanumeric() || chars[i - 1] == '_');
            // Also check it's not preceded by `$.` (already transformed)
            let preceded_by_dollar_dot = i >= 2 && chars[i - 2] == '$' && chars[i - 1] == '.';
            if !preceded_by_id && !preceded_by_dollar_dot {
                // Found a rune with generic params. Track angle bracket depth to find the
                // closing `>`, then check if `(` follows.
                let angle_start = i + rune_name_len; // position of `<`
                let mut j = angle_start + 1;
                let mut angle_depth = 1i32;
                let mut in_str: Option<char> = None;
                while j < len && angle_depth > 0 {
                    let c = chars[j];
                    if let Some(q) = in_str {
                        if c == q
                            && (j == 0 || chars[j - 1] != '\\' || (j >= 2 && chars[j - 2] == '\\'))
                        {
                            in_str = None;
                        }
                    } else {
                        match c {
                            '\'' | '"' | '`' => in_str = Some(c),
                            '<' => angle_depth += 1,
                            '>' => {
                                // Skip `=>` (arrow operator) — it's not a closing angle bracket
                                if j > 0 && chars[j - 1] == '=' {
                                    // This is `=>`, not a closing `>`
                                } else {
                                    angle_depth -= 1;
                                }
                            }
                            _ => {}
                        }
                    }
                    j += 1;
                }
                if angle_depth == 0 {
                    // `j` is now past the closing `>`. Check if `(` follows (possibly
                    // with whitespace).
                    let mut k = j;
                    while k < len && chars[k].is_whitespace() {
                        k += 1;
                    }
                    if k < len && chars[k] == '(' {
                        // Strip the generic params AND any whitespace between > and (
                        let rune_name: String = chars[i..i + rune_name_len].iter().collect();
                        result.push_str(&rune_name);
                        i = k; // skip past the `>` and whitespace; next iteration picks up `(`
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

///
/// For object/array literals that span multiple lines but would fit on one line
/// (with padding spaces for objects), this collapses them. Respects the 60-char
/// threshold: if the collapsed form exceeds 60 chars, keeps the original multi-line.
pub(super) fn collapse_to_single_line(content: &str) -> String {
    // Only attempt to collapse if multi-line
    if !content.contains('\n') {
        return content.to_string();
    }

    let trimmed = content.trim();
    // Check if this is an object or array literal
    let (is_object, open, close) = if trimmed.starts_with('{') && trimmed.ends_with('}') {
        (true, '{', '}')
    } else if trimmed.starts_with('[') && trimmed.ends_with(']') {
        (false, '[', ']')
    } else {
        return content.to_string();
    };

    // Extract inner content (between braces/brackets)
    let inner = &trimmed[1..trimmed.len() - 1];

    // Collapse whitespace: replace newlines and leading whitespace with single space
    let collapsed_inner: String = inner
        .split('\n')
        .map(|line| line.trim())
        .filter(|line| !line.is_empty())
        .collect::<Vec<_>>()
        .join(" ");

    // Build the collapsed form
    let collapsed = if is_object {
        format!("{} {} {}", open, collapsed_inner, close)
    } else {
        format!("{}{}{}", open, collapsed_inner, close)
    };

    // Only use collapsed form if it fits within the 60-char threshold
    if collapsed.len() <= 60 {
        collapsed
    } else {
        content.to_string()
    }
}

/// Determine if an expression needs parentheses when used on the right side
/// of a compound assignment expansion (e.g., `count += expr` -> `$.get(count) + expr`).
///
/// Parens are needed when the expression contains top-level operators that would
/// change semantics without grouping. Simple expressions like literals, identifiers,
/// function calls, member accesses, and template literals don't need parens.
///
/// This matches the behavior of the official Svelte compiler, which uses AST-based
/// code generation where esrap handles precedence naturally.
pub(super) fn needs_compound_assignment_parens(expr: &str, _op: &str) -> bool {
    // Track nesting depth for parens/brackets/braces
    let mut depth = 0i32;
    let chars: Vec<char> = expr.chars().collect();
    let len = chars.len();
    let mut i = 0;
    let mut has_top_level_operator = false;

    while i < len {
        let c = chars[i];
        match c {
            // Skip string/template literals
            '\'' | '"' | '`' => {
                let quote = c;
                i += 1;
                while i < len {
                    if chars[i] == '\\' {
                        i += 2;
                        continue;
                    }
                    if chars[i] == quote {
                        break;
                    }
                    i += 1;
                }
                i += 1;
                continue;
            }
            '(' | '[' | '{' => {
                depth += 1;
            }
            ')' | ']' | '}' => {
                depth -= 1;
            }
            _ => {
                if depth == 0 {
                    // Check for top-level binary/ternary/comma operators
                    // These indicate the expression needs grouping
                    match c {
                        '+' | '-' => {
                            // Check it's not a unary operator (at start or after operator)
                            if i > 0 {
                                // Look back to see if this is binary (preceded by value)
                                let prev = chars[i - 1];
                                if prev != '('
                                    && prev != ','
                                    && prev != '['
                                    && prev != '{'
                                    && prev != '?'
                                    && prev != ':'
                                    && prev != '='
                                    && prev != '<'
                                    && prev != '>'
                                    && prev != '!'
                                    && prev != '~'
                                    && prev != '+'
                                    && prev != '-'
                                    && prev != '*'
                                    && prev != '/'
                                    && prev != '%'
                                    && prev != '&'
                                    && prev != '|'
                                    && prev != '^'
                                    && !prev.is_whitespace()
                                {
                                    has_top_level_operator = true;
                                }
                            }
                        }
                        '*' | '/' | '%' | '&' | '|' | '^' => {
                            // These are always binary operators at top level
                            // (unary * doesn't exist in JS, and & | ^ as unary are very rare)
                            if i > 0 {
                                has_top_level_operator = true;
                            }
                        }
                        '?' | ',' => {
                            has_top_level_operator = true;
                        }
                        '<' | '>' => {
                            // Could be comparison or shift operator
                            if i > 0 {
                                has_top_level_operator = true;
                            }
                        }
                        _ => {}
                    }
                }
            }
        }
        i += 1;
    }

    has_top_level_operator
}

/// Find the end of a statement value for client-side transformations.
pub(super) fn find_statement_end_client(s: &str) -> usize {
    let mut depth = 0;
    let mut in_string = false;
    let mut string_char = ' ';
    let mut prev_char = '\0';

    // Use char_indices() to get BYTE positions (not char positions),
    // so the returned index can be used directly for byte-level string slicing.
    // Using char-position indices with multibyte UTF-8 strings causes off-by-one bugs
    // for strings containing characters like 'é', '中', etc.
    for (byte_pos, c) in s.char_indices() {
        // Handle string literals
        if (c == '"' || c == '\'' || c == '`') && prev_char != '\\' {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
            prev_char = c;
            continue;
        }

        if in_string {
            prev_char = c;
            continue;
        }

        match c {
            '(' | '[' | '{' => depth += 1,
            ')' | ']' | '}' => {
                if depth > 0 {
                    depth -= 1;
                } else {
                    // At depth 0, a closing brace/bracket/paren ends the statement
                    // (it belongs to the enclosing function/block, not our expression)
                    return byte_pos;
                }
            }
            ';' if depth == 0 => return byte_pos,
            // Newline at depth 0 ends the statement (JavaScript ASI)
            '\n' if depth == 0 => return byte_pos,
            _ => {}
        }
        prev_char = c;
    }

    s.len()
}

/// Check if a position is inside a ternary expression by looking at the "before" string.
/// Returns true if there's an unmatched `?` that would indicate we're in a ternary branch.
/// This function looks at the current block context (since the last `{`) to properly handle
/// ternaries inside arrow function bodies.
pub(super) fn is_inside_ternary_expression(before: &str) -> bool {
    // Find the start of the current block context by looking for the last unmatched `{`
    // We need to track depth to find where the current block starts
    let char_indices: Vec<(usize, char)> = before.char_indices().collect();

    // First, find the position of the last block start (unmatched `{`)
    let mut block_start_byte = 0;
    let mut temp_depth = 0;
    let mut temp_in_string = false;
    let mut temp_string_char = ' ';

    for (i, &(byte_off, c)) in char_indices.iter().enumerate() {
        if (c == '"' || c == '\'' || c == '`') && (i == 0 || char_indices[i - 1].1 != '\\') {
            if !temp_in_string {
                temp_in_string = true;
                temp_string_char = c;
            } else if c == temp_string_char {
                temp_in_string = false;
            }
            continue;
        }

        if temp_in_string {
            continue;
        }

        match c {
            '{' => {
                temp_depth += 1;
                // Remember the byte position after this `{`
                block_start_byte = byte_off + 1;
            }
            '}' => {
                if temp_depth > 0 {
                    temp_depth -= 1;
                }
            }
            _ => {}
        }
    }

    // Now analyze the portion from block_start to the end
    let context = if block_start_byte > 0 && block_start_byte < before.len() {
        &before[block_start_byte..]
    } else {
        before
    };

    // Check for unmatched ternary `?` in the context
    let context_chars: Vec<char> = context.chars().collect();
    let mut paren_depth = 0;
    let mut ternary_depth = 0;
    let mut in_string = false;
    let mut string_char = ' ';

    for (i, &c) in context_chars.iter().enumerate() {
        if (c == '"' || c == '\'' || c == '`') && (i == 0 || context_chars[i - 1] != '\\') {
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
            '(' | '[' => paren_depth += 1,
            ')' | ']' => {
                if paren_depth > 0 {
                    paren_depth -= 1;
                }
            }
            // Only count ? as ternary when at paren depth 0
            '?' if paren_depth == 0 => {
                // Check it's not optional chaining (?.)
                if i + 1 < context_chars.len() && context_chars[i + 1] != '.' {
                    ternary_depth += 1;
                }
            }
            ':' if paren_depth == 0 && ternary_depth > 0 => {
                ternary_depth -= 1;
            }
            _ => {}
        }
    }

    ternary_depth > 0
}

/// Find the end of an assignment expression.
/// This is similar to find_statement_end_client but also stops at `:` when inside a ternary expression.
pub(super) fn find_assignment_expr_end(s: &str, in_ternary: bool) -> usize {
    let mut depth = 0;
    let mut in_string = false;
    let mut string_char = ' ';
    let mut nested_ternary_depth = 0;
    let mut prev_char = None;

    for (byte_idx, c) in s.char_indices() {
        // Handle string literals
        if (c == '"' || c == '\'' || c == '`') && prev_char != Some('\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
            prev_char = Some(c);
            continue;
        }

        if in_string {
            prev_char = Some(c);
            continue;
        }

        match c {
            '(' | '[' | '{' => depth += 1,
            ')' | ']' | '}' => {
                if depth > 0 {
                    depth -= 1;
                } else {
                    // At depth 0, a closing brace/bracket/paren ends the expression
                    return byte_idx;
                }
            }
            ';' if depth == 0 => return byte_idx,
            '\n' if depth == 0 => return byte_idx,
            // Stop at ',' at depth 0 (e.g., inside object literal: {id: eid = expr, name: ...})
            ',' if depth == 0 => return byte_idx,
            // Track nested ternaries
            '?' if depth == 0 => {
                // Check it's not optional chaining (?.)
                let next_byte = byte_idx + c.len_utf8();
                if next_byte < s.len() && s.as_bytes()[next_byte] != b'.' {
                    nested_ternary_depth += 1;
                }
            }
            // Stop at `:` when in a ternary and not in a nested ternary
            ':' if depth == 0 && in_ternary && nested_ternary_depth == 0 => {
                return byte_idx;
            }
            ':' if depth == 0 && nested_ternary_depth > 0 => {
                nested_ternary_depth -= 1;
            }
            _ => {}
        }
        prev_char = Some(c);
    }

    s.len()
}

/// Check if an expression is incomplete (e.g., unbalanced brackets).
/// This is used to skip transformations on multi-line statements that are
/// processed line by line.
pub(super) fn is_incomplete_expression(expr: &str) -> bool {
    let mut paren_depth = 0;
    let mut bracket_depth = 0;
    let mut brace_depth = 0;
    let mut in_string = false;
    let mut string_char = ' ';
    let mut in_block_comment = false;
    let chars: Vec<char> = expr.chars().collect();

    let mut i = 0;
    while i < chars.len() {
        let c = chars[i];

        // Handle block comment start/end
        if !in_string {
            if !in_block_comment && c == '/' && i + 1 < chars.len() && chars[i + 1] == '*' {
                in_block_comment = true;
                i += 2;
                continue;
            }
            if in_block_comment && c == '*' && i + 1 < chars.len() && chars[i + 1] == '/' {
                in_block_comment = false;
                i += 2;
                continue;
            }
        }

        if in_block_comment {
            i += 1;
            continue;
        }

        // Handle string literals
        if (c == '"' || c == '\'' || c == '`') && (i == 0 || chars[i - 1] != '\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
            i += 1;
            continue;
        }

        if in_string {
            i += 1;
            continue;
        }

        match c {
            '(' => paren_depth += 1,
            ')' => paren_depth -= 1,
            '[' => bracket_depth += 1,
            ']' => bracket_depth -= 1,
            '{' => brace_depth += 1,
            '}' => brace_depth -= 1,
            _ => {}
        }
        i += 1;
    }

    // If any depth is non-zero, or we're still inside a block comment, the expression is incomplete
    if paren_depth != 0 || bracket_depth != 0 || brace_depth != 0 || in_block_comment {
        return true;
    }

    // Check for trailing comma in variable declarations (multi-declarator continuation)
    // e.g., `let x = 'x',` should be considered incomplete because more declarators follow
    let trimmed = expr.trim();
    if trimmed.ends_with(',') {
        // Check if this looks like a variable declaration
        let first_line = trimmed.lines().next().unwrap_or("");
        let first_trimmed = first_line.trim();
        if first_trimmed.starts_with("let ")
            || first_trimmed.starts_with("const ")
            || first_trimmed.starts_with("var ")
        {
            return true;
        }
    }

    false
}

/// Wrap state variable references with $.get() in an expression.
pub(super) fn wrap_state_vars_in_expr(
    expr: &str,
    state_vars: &[String],
    non_reactive_vars: &[String],
    proxy_vars: &[String],
) -> String {
    transform_state_in_expr(expr, state_vars, non_reactive_vars, proxy_vars)
}

/// Check if a variable at position `var_end_idx` is in a function parameter position.
/// This detects patterns like:
/// - `name(param)` - method shorthand
/// - `function name(param)` - function declaration
/// - `(param) =>` - arrow function
/// - `(param1, param2)` - multiple parameters
pub(super) fn is_in_function_param_position(
    chars: &[char],
    var_start_idx: usize,
    var_end_idx: usize,
) -> bool {
    // Find the opening parenthesis before this variable
    let mut paren_depth = 0;
    let mut found_open_paren = false;
    let mut open_paren_idx = 0;

    // Scan backwards to find the opening paren
    let mut j = var_start_idx;
    while j > 0 {
        j -= 1;
        let c = chars[j];
        if c == ')' {
            paren_depth += 1;
        } else if c == '(' {
            if paren_depth == 0 {
                found_open_paren = true;
                open_paren_idx = j;
                break;
            }
            paren_depth -= 1;
        }
    }

    if !found_open_paren {
        return false;
    }

    // Check what's before the opening paren - should be an identifier (function/method name)
    // or nothing (for arrow functions)
    let mut before_paren_idx = open_paren_idx;
    while before_paren_idx > 0 && chars[before_paren_idx - 1].is_whitespace() {
        before_paren_idx -= 1;
    }

    // Check if it's preceded by a control flow keyword (if, while, for, switch, with, catch)
    // These are NOT function parameter positions, even though they have (...) { pattern
    let control_flow_keywords = ["if", "while", "for", "switch", "with", "catch"];
    for keyword in control_flow_keywords {
        let kw_len = keyword.len();
        if before_paren_idx >= kw_len {
            let prefix: String = chars[before_paren_idx - kw_len..before_paren_idx]
                .iter()
                .collect();
            if prefix == keyword {
                // Make sure it's a standalone keyword (not part of a larger identifier)
                let is_standalone = before_paren_idx == kw_len
                    || !is_identifier_char(chars[before_paren_idx - kw_len - 1]);
                if is_standalone {
                    return false;
                }
            }
        }
    }

    // Check if it's preceded by "function " keyword
    if before_paren_idx >= 8 {
        let prefix: String = chars[before_paren_idx - 8..before_paren_idx]
            .iter()
            .collect();
        if prefix == "function" {
            return true;
        }
    }

    // Check what comes after the closing paren
    // For function params, it should be `) {` or `) =>` or `, param` pattern
    let mut k = var_end_idx;

    // Skip whitespace
    while k < chars.len() && chars[k].is_whitespace() {
        k += 1;
    }

    if k >= chars.len() {
        return false;
    }

    // Check if next char is `)` followed by ` {` or ` =>`
    // Or if it's `,` (part of parameter list)
    // Or if it's `=` (default parameter value)
    let next_char = chars[k];

    if next_char == '=' {
        // Default parameter like `param = default`
        // But not for arrow function body `param => body`
        // Check if it's `=>` vs just `=`
        if k + 1 < chars.len() && chars[k + 1] == '>' {
            // It's `param =>` - this is the whole param for arrow function
            // But we need to check if we're at the param, not the body
            return true;
        }
        // It's `==` or `===` (comparison operator, not assignment)
        // e.g., `b = c === 'a'` - `c` is NOT a function parameter here
        if k + 1 < chars.len() && chars[k + 1] == '=' {
            // It's `==` or `===` comparison - this variable is not a parameter
            // Fall through to return false
        } else {
            // It's `param = default`, likely a default parameter
            // Need to check if we're inside param parens
            // For now, trust context
            return true;
        }
    }

    if next_char == ')' {
        // Skip the closing paren and whitespace
        k += 1;
        while k < chars.len() && chars[k].is_whitespace() {
            k += 1;
        }

        if k >= chars.len() {
            return false;
        }

        // Check for `{` (function body) or `=>` (arrow function)
        if chars[k] == '{' {
            return true;
        }
        if k + 1 < chars.len() && chars[k] == '=' && chars[k + 1] == '>' {
            return true;
        }
    }

    if next_char == ',' {
        // This could be a parameter in a list
        // Need to verify there's a closing `) {` or `) =>` eventually
        let mut depth = 1;
        let mut m = k + 1;
        while m < chars.len() && depth > 0 {
            if chars[m] == '(' {
                depth += 1;
            } else if chars[m] == ')' {
                depth -= 1;
                if depth == 0 {
                    // Found closing paren, check what follows
                    m += 1;
                    while m < chars.len() && chars[m].is_whitespace() {
                        m += 1;
                    }
                    if m < chars.len() && chars[m] == '{' {
                        return true;
                    }
                    if m + 1 < chars.len() && chars[m] == '=' && chars[m + 1] == '>' {
                        return true;
                    }
                }
            }
            m += 1;
        }
    }

    // Handle `}` - the variable might be the last element in a destructuring parameter.
    // For example, `function foo(node, {tag, opt})` - when checking `opt`,
    // the next char after `opt` is `}` (closing the destructuring pattern).
    // We need to skip through `}`, then possibly `]`, then `)` and check if `) {` or `) =>` follows.
    if next_char == '}' || next_char == ']' {
        let mut m = k;
        // Skip closing braces/brackets to find the closing paren of the parameter list
        while m < chars.len() && (chars[m] == '}' || chars[m] == ']') {
            m += 1;
        }
        // Skip whitespace
        while m < chars.len() && chars[m].is_whitespace() {
            m += 1;
        }
        if m < chars.len() && chars[m] == ')' {
            // Found the closing paren, skip it and whitespace
            m += 1;
            while m < chars.len() && chars[m].is_whitespace() {
                m += 1;
            }
            if m < chars.len() && chars[m] == '{' {
                return true;
            }
            if m + 1 < chars.len() && chars[m] == '=' && chars[m + 1] == '>' {
                return true;
            }
        }
        // Also could be followed by `,` in a multi-param destructuring
        if m < chars.len() && chars[m] == ',' {
            // Same logic as the ',' case above
            let mut depth = 1;
            m += 1;
            while m < chars.len() && depth > 0 {
                if chars[m] == '(' {
                    depth += 1;
                } else if chars[m] == ')' {
                    depth -= 1;
                    if depth == 0 {
                        m += 1;
                        while m < chars.len() && chars[m].is_whitespace() {
                            m += 1;
                        }
                        if m < chars.len() && chars[m] == '{' {
                            return true;
                        }
                        if m + 1 < chars.len() && chars[m] == '=' && chars[m + 1] == '>' {
                            return true;
                        }
                    }
                }
                m += 1;
            }
        }
    }

    false
}

/// Check if a variable at the given position is shadowed by a function parameter.
/// This detects when an inner function/method has a parameter with the same name,
/// which shadows the outer variable within that function's scope.
///
/// For example, in:
/// ```js
/// let count = $state(0);
/// function action(_, count) {
///     update(count) {
///         console.log(count);  // <- this `count` refers to update's parameter
///     }
/// }
/// ```
/// The `count` inside `update` is shadowed by `update`'s parameter.
/// Check if a variable reference at `var_start` is inside a `for (let/const <same_var> ...)` scope.
///
/// In JavaScript, `for (let x = 0; x < 10; x++)` creates a block scope where `x` refers
/// to the loop variable, not any outer variable with the same name. This function detects
/// when a variable reference is inside such a for-loop scope and should NOT be transformed.
///
/// Strategy: scan backwards from var_start tracking brace depth. At each scope boundary
/// (opening `{`), look for a `for (let <var>` or `for (const <var>` pattern that would
/// indicate this scope is a for-loop body with the variable declared in the init.
/// Convert a byte position in a string to a character index.
/// Returns the character index for the given byte offset.
pub(super) fn byte_pos_to_char_index(s: &str, byte_pos: usize) -> usize {
    s[..byte_pos].chars().count()
}

/// Also check if we're directly inside the for-loop header (between the `for (` and `)`).
pub(super) fn is_shadowed_by_for_loop_var(
    chars: &[char],
    var_start: usize,
    var_name: &str,
) -> bool {
    // First, check if we're inside a for-loop HEADER (init, test, or update section)
    // where the variable is declared as `let`/`const` in the init.
    // Scan backwards to find an unmatched `(` that might be a for-loop's opening paren.
    let mut paren_depth: i32 = 0;
    let mut i = var_start;
    while i > 0 {
        i -= 1;
        let c = chars[i];
        if c == ')' {
            paren_depth += 1;
        } else if c == '(' {
            if paren_depth == 0 {
                // Found an unmatched opening paren at position `i`.
                // Check if it's preceded by `for` keyword.
                let mut j = i;
                while j > 0 && chars[j - 1].is_whitespace() {
                    j -= 1;
                }
                if j >= 3 {
                    let prefix: String = chars[j - 3..j].iter().collect();
                    if prefix == "for" && (j == 3 || !is_identifier_char(chars[j - 4])) {
                        // We're inside a `for (...)` header.
                        // Check if there's a `let <var>` or `const <var>` declaration inside.
                        // Scan forward from `(` to find `let <var>` or `const <var>`.
                        let header_start = i + 1;
                        let header: String = chars[header_start..var_start].iter().collect();
                        let let_pattern = format!("let {} ", var_name);
                        let const_pattern = format!("const {} ", var_name);
                        let let_pattern2 = format!("let {}=", var_name);
                        let const_pattern2 = format!("const {}=", var_name);
                        if header.contains(&let_pattern)
                            || header.contains(&const_pattern)
                            || header.contains(&let_pattern2)
                            || header.contains(&const_pattern2)
                        {
                            return true;
                        }
                        // Also check if var_start IS the declared variable itself:
                        // e.g., `for (let x = 0; ...)` where var_start points to `x` in `let x`.
                        // In this case, the header text before var_start ends with `let ` or `const `.
                        let header_trimmed = header.trim_end();
                        if header_trimmed == "let"
                            || header_trimmed == "const"
                            || header_trimmed == "var"
                        {
                            return true;
                        }
                    }
                }
                break; // Stop scanning - we've left the innermost paren group
            }
            paren_depth -= 1;
        }
    }

    // Second, check if we're inside a for-loop BODY where the variable is declared in the header.
    // Track brace depth as we scan backwards.
    let mut brace_depth: i32 = 0;
    let mut j = var_start;
    while j > 0 {
        j -= 1;
        let c = chars[j];

        if c == '}' {
            brace_depth += 1;
        } else if c == '{' {
            if brace_depth > 0 {
                brace_depth -= 1;
            } else {
                // Found an opening brace at our scope level.
                // Check if this is a for-loop body by looking backward for `for (...) {`
                let mut k = j;
                while k > 0 && chars[k - 1].is_whitespace() {
                    k -= 1;
                }
                // Should find `)` before the `{`
                if k > 0 && chars[k - 1] == ')' {
                    k -= 1;
                    // Find the matching `(`
                    let mut p_depth: i32 = 0;
                    let mut open_paren = None;
                    let mut m = k;
                    while m > 0 {
                        m -= 1;
                        if chars[m] == ')' {
                            p_depth += 1;
                        } else if chars[m] == '(' {
                            if p_depth == 0 {
                                open_paren = Some(m);
                                break;
                            }
                            p_depth -= 1;
                        }
                    }
                    if let Some(op) = open_paren {
                        // Check if preceded by `for` keyword
                        let mut n = op;
                        while n > 0 && chars[n - 1].is_whitespace() {
                            n -= 1;
                        }
                        if n >= 3 {
                            let prefix: String = chars[n - 3..n].iter().collect();
                            if prefix == "for" && (n == 3 || !is_identifier_char(chars[n - 4])) {
                                // Found `for (...)`. Check if the header contains `let <var>` or `const <var>`.
                                let header_start = op + 1;
                                let header_end = k; // the matching `)` position
                                if header_end > header_start {
                                    let header: String =
                                        chars[header_start..header_end].iter().collect();
                                    // Check for `let var` or `const var` as a word boundary match
                                    for keyword in &["let ", "const "] {
                                        let pattern = format!("{}{}", keyword, var_name);
                                        if let Some(pos) = header.find(&pattern) {
                                            let after = pos + pattern.len();
                                            // Ensure it's a word boundary (next char is not alphanumeric/underscore)
                                            if after >= header.len()
                                                || !is_identifier_char(
                                                    header[after..].chars().next().unwrap_or(' '),
                                                )
                                            {
                                                return true;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                // Whether or not it was a for-loop, we've left a scope boundary -
                // don't look further up since function scopes are handled elsewhere.
                // But we DO need to continue looking for outer for-loops, so don't break.
                // Actually, in JS, a for-loop's `let` only scopes to that for-loop.
                // If we've exited the for-loop body `{...}`, the var is no longer shadowed.
                // We should only look at the INNERMOST enclosing `{...}` scope for for-loops.
                // Actually, we need to check multiple levels for nested for-loops, BUT
                // each opening `{` at our level is a potential for-loop body.
                // For simplicity, just check each opening `{` at our brace level.
                // Continue scanning backwards to handle nested scoping.
            }
        }
    }

    false
}

/// Check if a variable at position `var_start` is shadowed by a local variable declaration
/// (`const`, `let`, or `var`) inside an enclosing function/arrow scope.
///
/// This handles cases like:
/// ```js
/// let foo = $.mutable_source(tmp.foo);  // outer `foo` is a state variable
/// let result = (() => {
///     const foo = writable(false);      // inner `foo` is a local const
///     return { foo };                    // this `foo` should NOT be $.get(foo)
/// })();
/// ```
pub(super) fn is_shadowed_by_local_var_decl(
    chars: &[char],
    var_start: usize,
    var_name: &str,
) -> bool {
    let var_len = var_name.len();
    let mut brace_depth: i32 = 0;
    let mut i = var_start;
    while i > 0 {
        i -= 1;
        let c = chars[i];

        if c == '}' {
            brace_depth += 1;
        } else if c == '{' {
            // Skip template literal interpolation `${`
            if i > 0 && chars[i - 1] == '$' {
                if brace_depth > 0 {
                    brace_depth -= 1;
                }
                continue;
            }
            if brace_depth > 0 {
                brace_depth -= 1;
            } else {
                // We've entered an enclosing scope. Check if this is a function/arrow body.
                let mut j = i;
                while j > 0 && chars[j - 1].is_whitespace() {
                    j -= 1;
                }

                // Check for arrow function body: `) => {` or `param => {`
                let is_arrow = j >= 2 && chars[j - 2] == '=' && chars[j - 1] == '>';

                // Check for function body: `) {` preceded by `function` or identifier
                let is_function_body = if j > 0 && chars[j - 1] == ')' {
                    // Find matching (
                    let mut pd = 0;
                    let mut k = j - 1;
                    let mut found_open = false;
                    while k > 0 {
                        k -= 1;
                        if chars[k] == ')' {
                            pd += 1;
                        } else if chars[k] == '(' {
                            if pd == 0 {
                                found_open = true;
                                break;
                            }
                            pd -= 1;
                        }
                    }
                    if found_open {
                        // Check for `function` keyword before (
                        let mut m = k;
                        while m > 0 && chars[m - 1].is_whitespace() {
                            m -= 1;
                        }
                        // Skip optional function name
                        while m > 0 && is_identifier_char(chars[m - 1]) {
                            m -= 1;
                        }
                        while m > 0 && chars[m - 1].is_whitespace() {
                            m -= 1;
                        }
                        if m >= 8 {
                            let prefix: String = chars[m - 8..m].iter().collect();
                            prefix == "function"
                        } else {
                            false
                        }
                    } else {
                        false
                    }
                } else {
                    false
                };

                if is_arrow || is_function_body {
                    // We're inside a function/arrow body. Now scan forward from `i+1`
                    // to find local `const/let/var varname` declarations at depth 0 within
                    // this function body, before our variable reference.
                    let mut scan = i + 1;
                    let mut inner_depth: i32 = 0;
                    let mut in_str: Option<char> = None;
                    let mut tmpl_stack: Vec<i32> = Vec::new();
                    let mut in_line_comment = false;
                    let mut in_block_comment = false;
                    let mut found_decl = false;
                    // Track how many nested function scopes we're inside.
                    // A "function scope" is a {} body that follows =>, function keyword,
                    // or a method/getter/setter definition.
                    let mut func_scope_depth: i32 = 0;
                    // Stack to track which brace depths correspond to function scopes
                    let mut func_scope_brace_depths: Vec<i32> = Vec::new();

                    while scan < var_start {
                        let sc = chars[scan];

                        // Handle comments
                        if in_line_comment {
                            if sc == '\n' {
                                in_line_comment = false;
                            }
                            scan += 1;
                            continue;
                        }
                        if in_block_comment {
                            if sc == '*' && scan + 1 < chars.len() && chars[scan + 1] == '/' {
                                in_block_comment = false;
                                scan += 2;
                                continue;
                            }
                            scan += 1;
                            continue;
                        }

                        // Handle template literal depth tracking
                        if !tmpl_stack.is_empty() && in_str.is_none() {
                            if sc == '{' {
                                if let Some(d) = tmpl_stack.last_mut() {
                                    *d += 1;
                                }
                            } else if sc == '}' {
                                let should_pop = if let Some(d) = tmpl_stack.last_mut() {
                                    *d -= 1;
                                    *d < 0
                                } else {
                                    false
                                };
                                if should_pop {
                                    tmpl_stack.pop();
                                    in_str = Some('`');
                                    scan += 1;
                                    continue;
                                }
                            }
                        }

                        // Handle string boundaries
                        if in_str.is_none() {
                            if sc == '/' && scan + 1 < chars.len() {
                                if chars[scan + 1] == '/' {
                                    in_line_comment = true;
                                    scan += 1;
                                    continue;
                                } else if chars[scan + 1] == '*' {
                                    in_block_comment = true;
                                    scan += 1;
                                    continue;
                                }
                            }
                            if sc == '\'' || sc == '"' || sc == '`' {
                                in_str = Some(sc);
                                scan += 1;
                                continue;
                            }
                        } else if in_str == Some('`')
                            && sc == '$'
                            && scan + 1 < chars.len()
                            && chars[scan + 1] == '{'
                        {
                            in_str = None;
                            tmpl_stack.push(0);
                            scan += 2;
                            continue;
                        } else if Some(sc) == in_str {
                            // Check for escape
                            let escaped = if scan > 0 && chars[scan - 1] == '\\' {
                                let mut bc = 0;
                                let mut bk = scan - 1;
                                while bk > 0 && chars[bk] == '\\' {
                                    bc += 1;
                                    bk -= 1;
                                }
                                bc % 2 == 1
                            } else {
                                false
                            };
                            if !escaped {
                                in_str = None;
                            }
                            scan += 1;
                            continue;
                        }

                        if in_str.is_some() {
                            scan += 1;
                            continue;
                        }

                        // Track brace depth within the function body
                        if sc == '{' {
                            inner_depth += 1;
                            // Check if this `{` opens a function scope by looking
                            // at what precedes it (arrow `=>`, function keyword,
                            // getter/setter/method pattern)
                            let mut bk = scan;
                            while bk > 0 && chars[bk - 1].is_whitespace() {
                                bk -= 1;
                            }
                            let opens_func_scope =
                                if bk >= 2 && chars[bk - 2] == '=' && chars[bk - 1] == '>' {
                                    true // arrow function
                                } else if bk > 0 && chars[bk - 1] == ')' {
                                    // Could be function/method/getter/setter: check for `)` pattern
                                    // Simple heuristic: any `) {` that isn't a control structure
                                    // (if/for/while/switch) is likely a function scope
                                    let mut pd = 0;
                                    let mut pk = bk - 1;
                                    let mut found_open = false;
                                    while pk > 0 {
                                        pk -= 1;
                                        if chars[pk] == ')' {
                                            pd += 1;
                                        } else if chars[pk] == '(' {
                                            if pd == 0 {
                                                found_open = true;
                                                break;
                                            }
                                            pd -= 1;
                                        }
                                    }
                                    if found_open {
                                        let mut mk = pk;
                                        while mk > 0 && chars[mk - 1].is_whitespace() {
                                            mk -= 1;
                                        }
                                        // Check for get/set/function/identifier before (
                                        let word_end = mk;
                                        while mk > 0 && is_identifier_char(chars[mk - 1]) {
                                            mk -= 1;
                                        }
                                        let word: String = chars[mk..word_end].iter().collect();
                                        // If it's a control structure keyword, it's NOT a function scope
                                        !matches!(
                                            word.as_str(),
                                            "if" | "for" | "while" | "switch" | "catch"
                                        )
                                    } else {
                                        false
                                    }
                                } else {
                                    false
                                };
                            if opens_func_scope {
                                func_scope_depth += 1;
                                func_scope_brace_depths.push(inner_depth);
                            }
                        } else if sc == '}' {
                            if func_scope_brace_depths.last() == Some(&inner_depth) {
                                func_scope_brace_depths.pop();
                                func_scope_depth -= 1;
                            }
                            inner_depth -= 1;
                        }

                        // Look at declarations at any depth within this function.
                        // `const`/`let` declarations are block-scoped: they shadow within their
                        // enclosing block and all nested blocks. Since we're scanning forward
                        // from the function body start to `var_start`, any declaration we find
                        // is in scope at `var_start` as long as we haven't exited the block.
                        if func_scope_depth == 0 {
                            // Check for `const varname` or `let varname` or `var varname`
                            for keyword in &["const ", "let ", "var "] {
                                let kw_len = keyword.len();
                                if scan + kw_len + var_len <= var_start {
                                    let potential_kw: String =
                                        chars[scan..scan + kw_len].iter().collect();
                                    if potential_kw == *keyword {
                                        // Make sure it's a standalone keyword
                                        let before_ok =
                                            scan == i + 1 || !is_identifier_char(chars[scan - 1]);
                                        if before_ok {
                                            // Now check if var_name follows (possibly after whitespace)
                                            let mut vp = scan + kw_len;
                                            // Skip optional destructuring or whitespace
                                            while vp < var_start && chars[vp].is_whitespace() {
                                                vp += 1;
                                            }
                                            if vp + var_len <= var_start {
                                                let potential_var: String =
                                                    chars[vp..vp + var_len].iter().collect();
                                                if potential_var == var_name {
                                                    let after_ok = vp + var_len >= chars.len()
                                                        || !is_identifier_char(chars[vp + var_len]);
                                                    if after_ok {
                                                        // Check if this declaration initializes a
                                                        // reactive signal ($.state/$.derived/$.proxy).
                                                        // Those are NOT local shadowing — they are
                                                        // reactive vars that still need $.get().
                                                        let mut eq_pos = vp + var_len;
                                                        while eq_pos < chars.len()
                                                            && chars[eq_pos].is_whitespace()
                                                        {
                                                            eq_pos += 1;
                                                        }
                                                        // Skip TypeScript type annotation (: Type)
                                                        if eq_pos < chars.len()
                                                            && chars[eq_pos] == ':'
                                                        {
                                                            // Skip past the type annotation to `=`
                                                            eq_pos += 1;
                                                            // Simple heuristic: scan forward to next
                                                            // `=` that's not part of `=>` or `==`
                                                            let mut angle_depth = 0i32;
                                                            while eq_pos < chars.len() {
                                                                match chars[eq_pos] {
                                                                    '<' => angle_depth += 1,
                                                                    '>' => {
                                                                        if angle_depth > 0 {
                                                                            angle_depth -= 1;
                                                                        }
                                                                    }
                                                                    '=' if angle_depth == 0 => {
                                                                        // Make sure it's not => or ==
                                                                        if eq_pos + 1 < chars.len()
                                                                            && (chars[eq_pos + 1]
                                                                                == '>'
                                                                                || chars
                                                                                    [eq_pos + 1]
                                                                                    == '=')
                                                                        {
                                                                            eq_pos += 2;
                                                                            continue;
                                                                        }
                                                                        break;
                                                                    }
                                                                    _ => {}
                                                                }
                                                                eq_pos += 1;
                                                            }
                                                        }
                                                        let is_reactive_decl = if eq_pos
                                                            < chars.len()
                                                            && chars[eq_pos] == '='
                                                            && (eq_pos + 1 >= chars.len()
                                                                || chars[eq_pos + 1] != '=')
                                                        {
                                                            let mut rp = eq_pos + 1;
                                                            while rp < chars.len()
                                                                && chars[rp].is_whitespace()
                                                            {
                                                                rp += 1;
                                                            }
                                                            let rest: String =
                                                                chars[rp..].iter().collect();
                                                            rest.starts_with("$.state(")
                                                                || rest.starts_with("$.derived(")
                                                                || rest
                                                                    .starts_with("$.state($.proxy(")
                                                        } else {
                                                            false
                                                        };
                                                        if !is_reactive_decl {
                                                            found_decl = true;
                                                        }
                                                    }
                                                }
                                            }
                                            // Check destructuring patterns: const { varname, ... } = ...
                                            // or const [ varname, ... ] = ...
                                            if !found_decl
                                                && vp < var_start
                                                && (chars[vp] == '{' || chars[vp] == '[')
                                            {
                                                let close_char =
                                                    if chars[vp] == '{' { '}' } else { ']' };
                                                // Find the closing brace/bracket
                                                let mut dp = vp + 1;
                                                let mut d_depth = 1i32;
                                                while dp < var_start && d_depth > 0 {
                                                    if chars[dp] == chars[vp] {
                                                        d_depth += 1;
                                                    } else if chars[dp] == close_char {
                                                        d_depth -= 1;
                                                    }
                                                    if d_depth > 0 {
                                                        dp += 1;
                                                    }
                                                }
                                                // Check if var_name appears in the destructuring pattern
                                                if d_depth == 0 {
                                                    let destr_text: String =
                                                        chars[vp + 1..dp].iter().collect();
                                                    // Check for the variable name as a standalone identifier
                                                    if let Some(name_pos) =
                                                        destr_text.find(var_name)
                                                    {
                                                        let before_ok2 = name_pos == 0
                                                            || !is_identifier_char(
                                                                destr_text.as_bytes()[name_pos - 1]
                                                                    as char,
                                                            );
                                                        let after_pos = name_pos + var_len;
                                                        let after_ok2 = after_pos
                                                            >= destr_text.len()
                                                            || !is_identifier_char(
                                                                destr_text.as_bytes()[after_pos]
                                                                    as char,
                                                            );
                                                        if before_ok2 && after_ok2 {
                                                            found_decl = true;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        scan += 1;
                    }

                    // Only report as shadowed if the declaration was found AND the
                    // variable reference is NOT inside a nested function scope
                    // (getter, method, inner function, arrow, etc.). If the reference
                    // is inside a nested function, it accesses the declaration via closure,
                    // not via shadowing.
                    if found_decl && func_scope_depth == 0 {
                        return true;
                    }
                    // If we found this is a function scope but didn't find the var declaration,
                    // or the reference is in a nested function scope, continue scanning backwards.
                }
            }
        }
    }

    false
}

pub(super) fn is_shadowed_by_function_param(
    chars: &[char],
    var_start: usize,
    var_name: &str,
) -> bool {
    // Strategy: scan backwards from var_start to find the nearest enclosing function scope.
    // If we find a function with this variable as a parameter, it's shadowed.
    // We need to track brace depth to understand scope nesting.

    let var_len = var_name.len();

    // Check for concise arrow functions: (a, b) => expr or (a, b) => (expr)
    // Scan backwards from var_start to find `=>`, tracking paren depth, then check params.
    {
        let mut paren_depth = 0i32;
        let mut j = var_start;
        let mut found_arrow_at: Option<usize> = None;
        while j > 0 {
            j -= 1;
            let c = chars[j];
            if c == ')' {
                paren_depth += 1;
            } else if c == '(' {
                if paren_depth == 0 {
                    // Before breaking, check if `=>` is just before this `(`
                    // This handles: (a, b) => (expr) where we're inside the parens of (expr)
                    let mut k2 = j;
                    while k2 > 0 && chars[k2 - 1].is_whitespace() {
                        k2 -= 1;
                    }
                    if k2 >= 2 && chars[k2 - 1] == '>' && chars[k2 - 2] == '=' {
                        // Found `=> (` - treat this as an arrow body in parens
                        found_arrow_at = Some(k2 - 1);
                        break;
                    }
                    // If this ( is a function call (preceded by an identifier or closing paren),
                    // skip it and continue scanning to look for an enclosing arrow function.
                    // e.g., in `(value) => JSON.stringify(value)`, the `(` of `stringify(`
                    // should be skipped so we can find `=>` further back.
                    if k2 > 0 && (is_identifier_char(chars[k2 - 1]) || chars[k2 - 1] == ')') {
                        continue;
                    }
                    break;
                }
                paren_depth -= 1;
            } else if c == '{' || c == '}' {
                break; // Hit a block boundary
            } else if c == '>' && j > 0 && chars[j - 1] == '=' && paren_depth == 0 {
                found_arrow_at = Some(j);
                break;
            }
        }

        if let Some(arrow_j) = found_arrow_at {
            // `arrow_j` points to the `>` of `=>`
            // Check if preceded by (params) containing our variable
            let mut k = arrow_j - 1; // at '='
            // Skip whitespace before =>
            while k > 0 && chars[k - 1].is_whitespace() {
                k -= 1;
            }
            if k > 0 && chars[k - 1] == ')' {
                // Find matching (
                let close_idx = k - 1;
                let mut pd = 0;
                let mut m = close_idx;
                let mut open_idx = None;
                while m > 0 {
                    m -= 1;
                    if chars[m] == ')' {
                        pd += 1;
                    } else if chars[m] == '(' {
                        if pd == 0 {
                            open_idx = Some(m);
                            break;
                        }
                        pd -= 1;
                    }
                }
                if let Some(open) = open_idx {
                    // Check if var_name is in the parameter list
                    let param_text: String = chars[open + 1..close_idx].iter().collect();
                    let param_chars: Vec<char> = param_text.chars().collect();
                    let mut pi = 0;
                    while pi < param_chars.len() {
                        while pi < param_chars.len() && param_chars[pi].is_whitespace() {
                            pi += 1;
                        }
                        if pi + var_len <= param_chars.len() {
                            let potential: String = param_chars[pi..pi + var_len].iter().collect();
                            if potential == var_name {
                                let before_ok = pi == 0 || !is_identifier_char(param_chars[pi - 1]);
                                let after_ok = pi + var_len >= param_chars.len()
                                    || !is_identifier_char(param_chars[pi + var_len]);
                                if before_ok && after_ok {
                                    return true;
                                }
                            }
                        }
                        pi += 1;
                    }
                }
            } else if k > 0 && is_identifier_char(chars[k - 1]) {
                // Single param arrow: `x => expr`
                let end = k;
                let mut start = k;
                while start > 0 && is_identifier_char(chars[start - 1]) {
                    start -= 1;
                }
                let param: String = chars[start..end].iter().collect();
                if param == var_name {
                    return true;
                }
            }
        }
    }

    // Track brace depth as we scan backwards
    let mut brace_depth = 0;
    let mut i = var_start;

    while i > 0 {
        i -= 1;
        let c = chars[i];

        if c == '}' {
            brace_depth += 1;
        } else if c == '{' {
            // Skip template literal interpolation `${` - not a scope boundary.
            // When scanning backwards, the `}` that closes this interpolation was already
            // encountered and incremented brace_depth. We need to undo that by decrementing
            // brace_depth here, and then skip this `{` entirely.
            if i > 0 && chars[i - 1] == '$' {
                if brace_depth > 0 {
                    brace_depth -= 1;
                }
                continue;
            }
            if brace_depth > 0 {
                brace_depth -= 1;
            } else {
                // Found an opening brace at our scope level
                // Check if this is a function body with our variable as a parameter
                // Look backwards to find the closing paren of the parameter list

                // Skip whitespace before the {
                let mut j = i;
                while j > 0 && chars[j - 1].is_whitespace() {
                    j -= 1;
                }

                // Handle arrow functions with parenthesized body: (params) => ({...})
                // In this case, the { is preceded by ( which is preceded by =>
                if j > 0 && chars[j - 1] == '(' {
                    let mut k = j - 1;
                    while k > 0 && chars[k - 1].is_whitespace() {
                        k -= 1;
                    }
                    if k >= 2 && chars[k - 2] == '=' && chars[k - 1] == '>' {
                        // This is `=> ({` pattern - treat as arrow function body
                        j = k - 2;
                        while j > 0 && chars[j - 1].is_whitespace() {
                            j -= 1;
                        }
                    }
                }

                // Also skip => for arrow functions: (params) => {
                if j >= 2 && chars[j - 2] == '=' && chars[j - 1] == '>' {
                    j -= 2;
                    // Skip whitespace after the )
                    while j > 0 && chars[j - 1].is_whitespace() {
                        j -= 1;
                    }
                }

                // Check for `)` which would indicate a function parameter list
                if j > 0 && chars[j - 1] == ')' {
                    let close_paren_idx = j - 1; // Save the `)` position
                    j -= 1; // Move past the )

                    // Now find the matching (
                    let mut paren_depth = 0;
                    let mut open_paren_idx = None;
                    while j > 0 {
                        j -= 1;
                        if chars[j] == ')' {
                            paren_depth += 1;
                        } else if chars[j] == '(' {
                            if paren_depth == 0 {
                                open_paren_idx = Some(j);
                                break;
                            }
                            paren_depth -= 1;
                        }
                    }

                    if let Some(open_idx) = open_paren_idx {
                        // Check if this is a function declaration/expression
                        // by looking for `function`, method shorthand, or arrow function pattern

                        // First, check if our variable is in the parameter list
                        // Extract text between ( and ) - not including the parens themselves
                        let param_text: String = chars[open_idx + 1..close_paren_idx]
                            .iter()
                            .collect::<String>();

                        // Check if var_name appears as a standalone identifier in the parameter list
                        // We need to handle patterns like: (_, count), (count), (count = default)
                        let param_chars: Vec<char> = param_text.chars().collect();
                        let mut k = 0;
                        while k < param_chars.len() {
                            // Skip whitespace
                            while k < param_chars.len() && param_chars[k].is_whitespace() {
                                k += 1;
                            }

                            if k + var_len <= param_chars.len() {
                                let potential_match: String =
                                    param_chars[k..k + var_len].iter().collect();
                                if potential_match == var_name {
                                    // Check boundaries
                                    let before_ok =
                                        k == 0 || !is_identifier_char(param_chars[k - 1]);
                                    let after_ok = k + var_len >= param_chars.len()
                                        || !is_identifier_char(param_chars[k + var_len]);

                                    if before_ok && after_ok {
                                        // Found the variable in the parameter list!
                                        // Now verify this is actually a function definition

                                        // Check what's before the opening paren
                                        let mut m = open_idx;
                                        while m > 0 && chars[m - 1].is_whitespace() {
                                            m -= 1;
                                        }

                                        // Check for control flow keywords (if, while, for, switch, with, catch)
                                        // These are NOT function definitions
                                        let control_flow_keywords =
                                            ["if", "while", "for", "switch", "with", "catch"];
                                        let mut is_control_flow = false;
                                        for keyword in control_flow_keywords {
                                            let kw_len = keyword.len();
                                            if m >= kw_len {
                                                let prefix: String =
                                                    chars[m - kw_len..m].iter().collect();
                                                if prefix == keyword {
                                                    // Make sure it's a standalone keyword
                                                    let is_standalone = m == kw_len
                                                        || !is_identifier_char(
                                                            chars[m - kw_len - 1],
                                                        );
                                                    if is_standalone {
                                                        is_control_flow = true;
                                                        break;
                                                    }
                                                }
                                            }
                                        }

                                        if is_control_flow {
                                            // This is a control flow statement, not a function
                                            // Continue scanning backwards for more scopes
                                            // Don't return true here
                                        } else {
                                            // Check for function keyword or identifier (method name)
                                            if m > 0 {
                                                // Check for "function" keyword
                                                if m >= 8 {
                                                    let prefix: String =
                                                        chars[m - 8..m].iter().collect();
                                                    if prefix == "function" {
                                                        return true;
                                                    }
                                                }

                                                // Check for identifier (method name or arrow function)
                                                // m is now pointing after the last non-whitespace char before (
                                                // For "update(foo)", m would be at 'e'+1, so chars[m-1] = 'e'
                                                if is_identifier_char(chars[m - 1]) {
                                                    // Could be a method definition like `update(count) {`
                                                    return true;
                                                }
                                            }

                                            // Check for arrow function pattern: (params) => {
                                            // If the ( is not preceded by any identifier or function keyword,
                                            // and there's => between ) and {, it could be an arrow function
                                            // However, we should only return true if we can confirm it's a function
                                            // Just having () doesn't make it a function - it could be grouping

                                            // Check if there's => between ) and {
                                            let between_paren_and_brace: String =
                                                chars[close_paren_idx + 1..i].iter().collect();
                                            if between_paren_and_brace.trim().starts_with("=>") {
                                                // It's an arrow function
                                                return true;
                                            }
                                        }
                                    }
                                }
                            }
                            k += 1;
                        }
                    }
                }
            }
        }
    }

    false
}

/// Check if chars at position `end` are preceded by the given pattern string.
/// Compares chars[end - pattern.len() .. end] against the ASCII pattern.
#[inline]
pub(super) fn chars_match(chars: &[char], end: usize, pattern: &str) -> bool {
    let pat_bytes = pattern.as_bytes();
    let pat_len = pat_bytes.len();
    if end < pat_len {
        return false;
    }
    let start = end - pat_len;
    for (j, &b) in pat_bytes.iter().enumerate() {
        if chars[start + j] != b as char {
            return false;
        }
    }
    true
}

/// Check if a character can start a JavaScript identifier (not a digit).
#[inline]
pub(super) fn is_identifier_start_char(c: char) -> bool {
    c.is_alphabetic() || c == '_' || c == '$'
}

/// Transform state variable references to $.get() calls.
/// All state variables (including those initialized with objects/arrays) need $.get() wrapping
/// when reading their values, including when accessing properties.
///
/// Optimized: single-pass multi-variable matching with FxHashSet lookup and
/// zero-allocation prefix checks via chars_match.
pub(super) fn transform_state_in_expr(
    expr: &str,
    state_vars: &[String],
    non_reactive_vars: &[String],
    _proxy_vars: &[String],
) -> String {
    // Filter out non-reactive state vars - they don't need $.get() wrapping
    let effective_state_vars: Vec<&String> = state_vars
        .iter()
        .filter(|v| !non_reactive_vars.contains(v))
        .collect();

    if effective_state_vars.is_empty() {
        return expr.to_string();
    }

    // Quick pre-check: if none of the state var names appear in the text at all,
    // skip the expensive char-by-char scan entirely
    if !effective_state_vars
        .iter()
        .any(|v| expr.contains(v.as_str()))
    {
        return expr.to_string();
    }

    // Build a HashSet for O(1) variable lookup
    let var_set: FxHashSet<&str> = effective_state_vars.iter().map(|v| v.as_str()).collect();

    // Build char vector and a parallel byte-offset vector so we can extract
    // identifiers as &str slices from `expr` without allocating a String.
    let chars: Vec<char> = expr.chars().collect();
    let is_ascii = expr.is_ascii();
    // For ASCII strings, char index == byte index, so no separate offset table needed.
    let byte_offsets: Vec<usize> = if is_ascii {
        Vec::new() // unused for ASCII
    } else {
        let mut offsets = Vec::with_capacity(chars.len() + 1);
        for (byte_idx, _) in expr.char_indices() {
            offsets.push(byte_idx);
        }
        offsets.push(expr.len());
        offsets
    };

    let mut new_result = String::with_capacity(expr.len() + expr.len() / 4);
    let mut i = 0;

    // Track whether we're inside a string literal
    let mut in_string: Option<char> = None; // None or Some('\'') or Some('"') or Some('`')
    // Stack for template literal nesting: tracks brace depth inside `${...}` interpolations.
    let mut template_literal_depth_stack: Vec<i32> = Vec::new();
    // Track whether we're inside a comment
    let mut in_line_comment = false;
    let mut in_block_comment = false;

    while i < chars.len() {
        let c = chars[i];

        // Handle line comment end (newline)
        if in_line_comment {
            new_result.push(c);
            if c == '\n' {
                in_line_comment = false;
            }
            i += 1;
            continue;
        }

        // Handle block comment end (*/)
        if in_block_comment {
            new_result.push(c);
            if c == '*' && i + 1 < chars.len() && chars[i + 1] == '/' {
                new_result.push('/');
                i += 2;
                in_block_comment = false;
                continue;
            }
            i += 1;
            continue;
        }

        // Handle template literal interpolation brace tracking
        if !template_literal_depth_stack.is_empty() && in_string.is_none() {
            if c == '{' {
                if let Some(depth) = template_literal_depth_stack.last_mut() {
                    *depth += 1;
                }
            } else if c == '}' {
                let should_pop = if let Some(depth) = template_literal_depth_stack.last_mut() {
                    *depth -= 1;
                    *depth < 0
                } else {
                    false
                };
                if should_pop {
                    template_literal_depth_stack.pop();
                    // Re-enter template literal string mode
                    in_string = Some('`');
                    new_result.push(c);
                    i += 1;
                    continue;
                }
            }
        }

        // Handle string literal boundaries
        if in_string.is_none() {
            // Check for comment start (only outside strings)
            if c == '/' && i + 1 < chars.len() {
                if chars[i + 1] == '/' {
                    // Line comment
                    in_line_comment = true;
                    new_result.push(c);
                    i += 1;
                    continue;
                } else if chars[i + 1] == '*' {
                    // Block comment (including JSDoc)
                    in_block_comment = true;
                    new_result.push(c);
                    i += 1;
                    continue;
                }
            }

            if c == '\'' || c == '"' || c == '`' {
                in_string = Some(c);
                new_result.push(c);
                i += 1;
                continue;
            }
        } else if in_string == Some('`') && c == '$' && i + 1 < chars.len() && chars[i + 1] == '{' {
            // Template literal interpolation: `...${expr}...`
            // Temporarily exit string mode to process the expression
            in_string = None;
            template_literal_depth_stack.push(0);
            new_result.push(c);
            new_result.push('{');
            i += 2;
            continue;
        } else if Some(c) == in_string {
            // Check for escape sequence
            let escaped = if i > 0 && chars[i - 1] == '\\' {
                // Count consecutive backslashes
                let mut backslash_count = 0;
                let mut j = i - 1;
                while j > 0 && chars[j] == '\\' {
                    backslash_count += 1;
                    if j == 0 {
                        break;
                    }
                    j -= 1;
                }
                // If odd number of backslashes, the quote is escaped
                backslash_count % 2 == 1
            } else {
                false
            };

            if !escaped {
                in_string = None;
            }
            new_result.push(c);
            i += 1;
            continue;
        }

        // Skip replacements inside string literals (but NOT template literal interpolations)
        if in_string.is_some() {
            new_result.push(c);
            i += 1;
            continue;
        }

        // At potential identifier start position
        if is_identifier_start_char(c) {
            // Extract full identifier
            let id_start = i;
            while i < chars.len() && is_identifier_char(chars[i]) {
                i += 1;
            }
            let id_end = i;
            let _var_len = id_end - id_start;

            // Check word boundary before (digits are handled by is_identifier_start_char)
            let before_ok = id_start == 0 || !is_identifier_char(chars[id_start - 1]);

            // Extract identifier as a zero-copy &str slice (no String allocation).
            // For ASCII strings, char index == byte index so we index directly.
            let identifier: &str = if is_ascii {
                &expr[id_start..id_end]
            } else {
                &expr[byte_offsets[id_start]..byte_offsets[id_end]]
            };

            if before_ok && var_set.contains(identifier) {
                // Apply all the same context checks, using id_start as position
                let pos = id_start;
                let var_len = id_end - id_start;

                // Check if preceded by dot, but NOT if it's a spread operator (...)
                let preceded_by_dot =
                    pos > 0 && chars[pos - 1] == '.' && !chars_match(&chars, pos, "...");
                // Check if preceded by `#` (private field access like this.#y)
                let preceded_by_hash = pos > 0 && chars[pos - 1] == '#';
                let already_wrapped =
                    chars_match(&chars, pos, "$.safe_get(") || chars_match(&chars, pos, "$.get(");
                let in_set_first_arg = chars_match(&chars, pos, "$.set(");
                let in_update_arg = chars_match(&chars, pos, "$.update(");
                let in_update_pre_arg = chars_match(&chars, pos, "$.update_pre(");
                let in_mutate_first_arg = chars_match(&chars, pos, "$.mutate(");

                // Check if this variable is in a function parameter position
                let in_param_position = is_in_function_param_position(&chars, pos, pos + var_len);

                // Check if this variable is on the left side of an assignment
                let is_assignment_target = is_on_left_side_of_assignment(&chars, pos, var_len);

                // Check if this is a getter/setter method name
                let is_getter_setter_name = {
                    let after_idx = pos + var_len;
                    let mut k = after_idx;
                    while k < chars.len() && chars[k].is_whitespace() {
                        k += 1;
                    }
                    let has_paren_after = k < chars.len() && chars[k] == '(';
                    let has_get_before = chars_match(&chars, pos, "get ");
                    let has_set_before = chars_match(&chars, pos, "set ");
                    has_paren_after && (has_get_before || has_set_before)
                };

                // Check if this is an object property key
                let is_property_key = {
                    let after_idx = pos + var_len;
                    let mut k = after_idx;
                    while k < chars.len() && chars[k].is_whitespace() {
                        k += 1;
                    }
                    let has_colon_after = k < chars.len() && chars[k] == ':';
                    if has_colon_after {
                        let mut is_ternary = false;
                        let mut depth_paren = 0i32;
                        let mut depth_brace = 0i32;
                        let mut depth_bracket = 0i32;
                        let mut scan = pos;
                        while scan > 0 {
                            scan -= 1;
                            let sc = chars[scan];
                            match sc {
                                ')' => depth_paren += 1,
                                '(' => {
                                    depth_paren -= 1;
                                    if depth_paren < 0 {
                                        break;
                                    }
                                }
                                '}' => depth_brace += 1,
                                '{' => {
                                    depth_brace -= 1;
                                    if depth_brace < 0 {
                                        break;
                                    }
                                }
                                ']' => depth_bracket += 1,
                                '[' => {
                                    depth_bracket -= 1;
                                    if depth_bracket < 0 {
                                        break;
                                    }
                                }
                                '?' if depth_paren == 0
                                    && depth_brace == 0
                                    && depth_bracket == 0 =>
                                {
                                    if scan + 1 < chars.len() && chars[scan + 1] == '.' {
                                        continue;
                                    }
                                    is_ternary = true;
                                    break;
                                }
                                ';' | ',' => {
                                    if depth_paren == 0 && depth_brace == 0 && depth_bracket == 0 {
                                        break;
                                    }
                                }
                                _ => {}
                            }
                        }
                        !is_ternary
                    } else {
                        false
                    }
                };

                // Check if this is a shorthand property in an object literal
                let is_shorthand_property = is_shorthand_object_property(&chars, pos, var_len);

                // Check if this variable is shadowed
                let is_shadowed = is_shadowed_by_function_param(&chars, pos, identifier)
                    || is_shadowed_by_for_loop_var(&chars, pos, identifier)
                    || is_shadowed_by_local_var_decl(&chars, pos, identifier);

                // Check if this variable is the target of an update expression
                let is_update_target = {
                    let after_idx = pos + var_len;
                    let has_postfix_update = after_idx + 1 < chars.len()
                        && ((chars[after_idx] == '+' && chars[after_idx + 1] == '+')
                            || (chars[after_idx] == '-' && chars[after_idx + 1] == '-'));
                    let has_prefix_update = pos >= 2
                        && ((chars[pos - 2] == '+' && chars[pos - 1] == '+')
                            || (chars[pos - 2] == '-' && chars[pos - 1] == '-'));
                    has_postfix_update || has_prefix_update
                };

                // Check if this is a method shorthand name in an object literal
                let is_method_shorthand_name = is_object_method_shorthand(&chars, pos, var_len);

                if !already_wrapped
                    && !preceded_by_dot
                    && !preceded_by_hash
                    && !in_set_first_arg
                    && !in_update_arg
                    && !in_update_pre_arg
                    && !in_mutate_first_arg
                    && !in_param_position
                    && !is_assignment_target
                    && !is_getter_setter_name
                    && !is_property_key
                    && !is_shadowed
                    && !is_update_target
                    && !is_method_shorthand_name
                {
                    // Check if this is a var-declared state variable that needs $.safe_get()
                    let use_safe_get = VAR_STATE_VARS
                        .with(|v| v.borrow().iter().any(|s| s.as_str() == identifier));
                    let getter = if use_safe_get { "$.safe_get" } else { "$.get" };
                    if is_shorthand_property {
                        // Expand shorthand property: { foo } -> { foo: $.get(foo) }
                        new_result.push_str(identifier);
                        new_result.push_str(": ");
                        new_result.push_str(getter);
                        new_result.push('(');
                        new_result.push_str(identifier);
                        new_result.push(')');
                    } else {
                        new_result.push_str(getter);
                        new_result.push('(');
                        new_result.push_str(identifier);
                        new_result.push(')');
                    }
                    continue;
                }

                // Not a state var match or excluded by checks - emit as-is
                new_result.push_str(identifier);
            } else {
                // Not a state variable - emit the identifier as-is
                new_result.push_str(identifier);
            }
            continue;
        }

        new_result.push(c);
        i += 1;
    }

    new_result
}

/// Check if a variable at the given position is a shorthand property in an object literal.
/// This detects patterns like:
/// - `{ foo, bar }` - shorthand properties
/// - `{ foo }` - single shorthand property
///
/// The variable should NOT be wrapped with $.get() if it's a shorthand property name,
/// because `{ $.get(foo) }` is invalid JavaScript.
pub(super) fn is_shorthand_object_property(
    chars: &[char],
    var_start: usize,
    var_len: usize,
) -> bool {
    let var_end = var_start + var_len;

    // Skip whitespace after the variable
    let mut k = var_end;
    while k < chars.len() && chars[k].is_whitespace() {
        k += 1;
    }

    if k >= chars.len() {
        return false;
    }

    // Check what comes after: `,` or `}` (and NOT `:`)
    let next_char = chars[k];
    if next_char != ',' && next_char != '}' {
        return false;
    }

    // Now we need to verify this is inside an object literal
    // by checking what's before the variable
    // We need to find a matching `{` that's not a block statement
    // This is tricky, but we can use a simple heuristic:
    // - Preceded by `{` or `,` (possibly with whitespace)
    // - And we should verify the context looks like an object literal

    let mut j = var_start;
    // Skip whitespace before the variable
    while j > 0 && chars[j - 1].is_whitespace() {
        j -= 1;
    }

    if j == 0 {
        return false;
    }

    let prev_char = chars[j - 1];

    // Check if preceded by `{` or `,` which suggests object literal context
    if prev_char == '{' || prev_char == ',' {
        // Further check: the `{` should be preceded by something that suggests
        // an object literal, not a block statement
        // Object literals are preceded by: = : ( [ , return ? : || && ?? !
        // Block statements are preceded by: ) else do etc.

        if prev_char == '{' {
            // Check what's before the `{`
            let mut m = j - 1;
            while m > 0 && chars[m - 1].is_whitespace() {
                m -= 1;
            }

            if m == 0 {
                // `{` at the very start of the expression string.
                // This could be an object literal (e.g., inside $derived() arguments)
                // or a block statement (e.g., `$: { tasks, tasks_touched++; }`).
                // Object literals don't contain semicolons at the top level (depth 1),
                // so check for semicolons to distinguish block statements.
                let brace_start = j - 1; // position of the `{`
                let mut depth_check = 0i32;
                let mut has_top_level_semicolon = false;
                for &ch in &chars[brace_start..] {
                    match ch {
                        '{' => depth_check += 1,
                        '}' => {
                            depth_check -= 1;
                            if depth_check == 0 {
                                break;
                            }
                        }
                        ';' if depth_check == 1 => {
                            has_top_level_semicolon = true;
                            break;
                        }
                        _ => {}
                    }
                }
                if has_top_level_semicolon {
                    return false;
                }
                return true;
            }

            let before_brace = chars[m - 1];

            // These suggest object literal context
            if before_brace == '='
                || before_brace == ':'
                || before_brace == '('
                || before_brace == '['
                || before_brace == ','
                || before_brace == '?'
                || before_brace == '|'
                || before_brace == '&'
                || before_brace == '!'
                || before_brace == 'n'
            {
                // 'n' could be the end of 'return'
                return true;
            }

            // Check for 'return ' before
            if m >= 6 {
                let prefix: String = chars[m - 6..m].iter().collect();
                if prefix == "return" {
                    return true;
                }
            }

            return false;
        }

        // If preceded by `,`, we need to distinguish array context from object context.
        // Scan backwards to find the enclosing unmatched `[` or `{`.
        // If the enclosing bracket is `[`, this is an array element, not a shorthand property.
        // If the enclosing bracket is `{`, this is likely a shorthand object property.
        let mut depth_brace = 0i32; // { }
        let mut depth_bracket = 0i32; // [ ]
        let mut depth_paren = 0i32; // ( )
        let mut scan = j - 1; // start from the `,` position
        loop {
            if scan == 0 {
                // Reached beginning without finding enclosing bracket - not an object
                return false;
            }
            scan -= 1;
            match chars[scan] {
                '}' => depth_brace += 1,
                '{' => {
                    if depth_brace == 0 {
                        // Found the enclosing `{` - this is an object context
                        return true;
                    }
                    depth_brace -= 1;
                }
                ']' => depth_bracket += 1,
                '[' => {
                    if depth_bracket == 0 {
                        // Found the enclosing `[` - this is an array context
                        return false;
                    }
                    depth_bracket -= 1;
                }
                ')' => depth_paren += 1,
                '(' => {
                    if depth_paren == 0 {
                        // Found the enclosing `(` - this is a function call/grouping, not object
                        return false;
                    }
                    depth_paren -= 1;
                }
                _ => {}
            }
        }
    }

    false
}

/// Check if a variable at the given position is a method shorthand name in an object literal.
/// This detects patterns like:
/// - `{ increment() { ... } }` - method shorthand
/// - `{ foo() { ... }, bar() { ... } }` - multiple method shorthands
///
/// A method shorthand has the identifier followed by `(` (with optional whitespace)
/// AND is preceded by `{` or `,` (with optional whitespace), indicating an object literal context.
pub(super) fn is_object_method_shorthand(chars: &[char], var_start: usize, var_len: usize) -> bool {
    let var_end = var_start + var_len;

    // Check what comes after the variable: should be `(` for method shorthand
    let mut k = var_end;
    while k < chars.len() && chars[k].is_whitespace() {
        k += 1;
    }

    if k >= chars.len() || chars[k] != '(' {
        return false;
    }

    // Now check what comes before: should be `{` or `,` (with optional whitespace)
    // indicating we're inside an object literal
    let mut j = var_start;
    while j > 0 && chars[j - 1].is_whitespace() {
        j -= 1;
    }

    if j == 0 {
        return false;
    }

    let prev_char = chars[j - 1];

    if prev_char == '{' || prev_char == ',' {
        // For `{`, verify it's an object literal context (not a block statement)
        if prev_char == '{' {
            let mut m = j - 1;
            while m > 0 && chars[m - 1].is_whitespace() {
                m -= 1;
            }

            if m == 0 {
                // `{` at start - in expression context, this is an object literal
                return true;
            }

            let before_brace = chars[m - 1];

            // These suggest object literal context
            if before_brace == '='
                || before_brace == ':'
                || before_brace == '('
                || before_brace == '['
                || before_brace == ','
                || before_brace == '?'
                || before_brace == '|'
                || before_brace == '&'
                || before_brace == '!'
                || before_brace == 'n'
            {
                return true;
            }

            // Check for 'return ' before
            if m >= 6 {
                let prefix: String = chars[m - 6..m].iter().collect();
                if prefix == "return" {
                    return true;
                }
            }

            return false;
        }

        // Preceded by `,` inside an object literal
        return true;
    }

    false
}

/// Check if a destructuring pattern starting at position `open_pos` (with the given
/// open/close bracket chars) is followed by an assignment operator `=`.
///
/// This handles patterns like:
/// - `({ x } = obj)` - object destructuring assignment
/// - `([x] = arr)` - array destructuring assignment
/// - `({ d, e, g: [f.w, f.v] } = ...)` - nested destructuring assignment
///
/// Starting from `open_pos` (the opening `{` or `[`), we scan forward to find the
/// matching closing bracket, then check if `=` follows (not `==` or `===`).
pub(super) fn is_destructuring_assignment_at(
    chars: &[char],
    open_pos: usize,
    open_char: char,
    close_char: char,
) -> bool {
    let mut depth = 1;
    let mut k = open_pos + 1;
    let mut in_string: Option<char> = None;

    // Find the matching closing bracket/brace
    while k < chars.len() && depth > 0 {
        let c = chars[k];

        // Handle string literals
        if in_string.is_none() && (c == '\'' || c == '"' || c == '`') {
            in_string = Some(c);
            k += 1;
            continue;
        }
        if let Some(quote) = in_string {
            if c == quote {
                // Check for escape
                let mut backslashes = 0;
                let mut m = k;
                while m > 0 && chars[m - 1] == '\\' {
                    backslashes += 1;
                    m -= 1;
                }
                if backslashes % 2 == 0 {
                    in_string = None;
                }
            }
            k += 1;
            continue;
        }

        if c == open_char {
            depth += 1;
        } else if c == close_char {
            depth -= 1;
        }
        k += 1;
    }

    if depth != 0 {
        return false; // Unmatched brackets
    }

    // k is now right after the closing bracket/brace
    // Skip whitespace
    while k < chars.len() && chars[k].is_whitespace() {
        k += 1;
    }

    if k >= chars.len() {
        return false;
    }

    // Check for `=` but not `==` or `===`
    if chars[k] == '=' {
        if k + 1 < chars.len() && chars[k + 1] == '=' {
            return false; // It's == or ===
        }
        return true;
    }

    false
}

/// Check if a variable at the given position is on the left side of an assignment
/// or is a variable declaration.
/// This detects patterns like:
/// - `varname = expr` - simple assignment
/// - `varname += expr` - compound assignment
/// - `let varname;` - declaration without initializer
/// - `let varname = expr` - declaration with initializer
/// - `({ varname } = obj)` - object destructuring assignment
/// - `([varname] = arr)` - array destructuring assignment
///
/// The variable should NOT be wrapped with $.get() if it's an assignment target
/// or a declaration.
pub(super) fn is_on_left_side_of_assignment(
    chars: &[char],
    var_start: usize,
    var_len: usize,
) -> bool {
    // Check if preceded by `let `, `const `, or `var ` (variable declaration)
    // This handles cases like `let container;` or `let container = expr`
    // The keyword includes the trailing space, so "let " has length 4.
    // For input like "let container;", var_start is at 'c' (position 4),
    // so we check chars[0..4] which should equal "let ".
    let is_declaration = {
        // Check for declaration keywords directly before the variable
        // No need to skip whitespace - the keyword pattern includes the space
        let check_keyword = |keyword: &str| -> bool {
            let kw_len = keyword.len();
            if var_start >= kw_len {
                let prefix: String = chars[var_start - kw_len..var_start].iter().collect();
                if prefix == keyword {
                    // Make sure it's a standalone keyword (not part of a larger identifier)
                    // i.e., either at start of string or preceded by non-identifier char
                    var_start == kw_len
                        || (var_start > kw_len
                            && !is_identifier_char(chars[var_start - kw_len - 1]))
                } else {
                    false
                }
            } else {
                false
            }
        };

        check_keyword("let ") || check_keyword("const ") || check_keyword("var ")
    };

    if is_declaration {
        return true;
    }

    // Check if the variable is inside a destructuring pattern in a declaration or assignment.
    // Declaration: `let { a } = ...` or `let [a, b] = ...` or `const { x: { y: a } } = ...`
    // Assignment: `({ x } = obj)` or `([x] = arr)` or `({ d, e } = expr)`
    // We walk backwards tracking brace/bracket depth to find the opening `{` or `[`,
    // then check if it's preceded by a declaration keyword (declaration case),
    // or if the matching closing bracket/brace is followed by `=` (assignment case).
    let is_in_destructuring_pattern = {
        let mut j = var_start;
        let mut brace_depth = 0;
        let mut bracket_depth = 0;
        let mut in_string: Option<char> = None;
        let mut found = false;

        // Walk backwards from the variable position
        while j > 0 {
            j -= 1;
            let c = chars[j];

            // Handle string boundaries (walking backwards)
            if in_string.is_none() && (c == '\'' || c == '"' || c == '`') {
                // Check if this quote is escaped
                let mut backslashes = 0;
                let mut k = j;
                while k > 0 && chars[k - 1] == '\\' {
                    backslashes += 1;
                    k -= 1;
                }
                if backslashes % 2 == 0 {
                    in_string = Some(c);
                }
                continue;
            } else if in_string == Some(c) {
                // Check if this quote is escaped
                let mut backslashes = 0;
                let mut k = j;
                while k > 0 && chars[k - 1] == '\\' {
                    backslashes += 1;
                    k -= 1;
                }
                if backslashes % 2 == 0 {
                    in_string = None;
                }
                continue;
            }

            // Skip if inside a string
            if in_string.is_some() {
                continue;
            }

            match c {
                '}' => brace_depth += 1,
                '{' => {
                    if brace_depth > 0 {
                        brace_depth -= 1;
                    } else {
                        // Found the opening brace at our depth level
                        // Check if it's preceded by a declaration keyword
                        let mut k = j;
                        // Skip whitespace before the brace
                        while k > 0 && chars[k - 1].is_whitespace() {
                            k -= 1;
                        }
                        // Check for declaration keywords (without trailing space since we've
                        // already skipped the whitespace between keyword and brace)
                        if k >= 3 {
                            let prefix: String = chars[k - 3..k].iter().collect();
                            if prefix == "let" || prefix == "var" {
                                // Make sure it's a standalone keyword
                                if k == 3 || !is_identifier_char(chars[k - 4]) {
                                    found = true;
                                    break;
                                }
                            }
                        }
                        if k >= 5 {
                            let prefix: String = chars[k - 5..k].iter().collect();
                            if prefix == "const" {
                                // Make sure it's a standalone keyword
                                if k == 5 || !is_identifier_char(chars[k - 6]) {
                                    found = true;
                                    break;
                                }
                            }
                        }
                        // Not a declaration - check if this is a destructuring assignment
                        // Find the matching closing `}` and check if `=` follows
                        if is_destructuring_assignment_at(chars, j, '{', '}') {
                            found = true;
                        }
                        break;
                    }
                }
                ']' => bracket_depth += 1,
                '[' => {
                    if bracket_depth > 0 {
                        bracket_depth -= 1;
                    } else {
                        // Found the opening bracket at our depth level
                        // Check if it's preceded by a declaration keyword
                        let mut k = j;
                        // Skip whitespace before the bracket
                        while k > 0 && chars[k - 1].is_whitespace() {
                            k -= 1;
                        }
                        // Check for declaration keywords (without trailing space since we've
                        // already skipped the whitespace between keyword and bracket)
                        if k >= 3 {
                            let prefix: String = chars[k - 3..k].iter().collect();
                            if prefix == "let" || prefix == "var" {
                                // Make sure it's a standalone keyword
                                if k == 3 || !is_identifier_char(chars[k - 4]) {
                                    found = true;
                                    break;
                                }
                            }
                        }
                        if k >= 5 {
                            let prefix: String = chars[k - 5..k].iter().collect();
                            if prefix == "const" {
                                // Make sure it's a standalone keyword
                                if k == 5 || !is_identifier_char(chars[k - 6]) {
                                    found = true;
                                    break;
                                }
                            }
                        }
                        // Not a declaration - check if this is a destructuring assignment
                        // BUT first check if the `[` is a computed property access (NOT destructuring).
                        // A computed property access is `obj[key]` where `[` is preceded by
                        // an identifier char, `)`, `]`, or `}` (expression-continuation tokens).
                        // In that case, the variable inside `[...]` is NOT a destructuring target.
                        let is_computed_property = if k > 0 {
                            let prev_char = chars[k - 1];
                            is_identifier_char(prev_char)
                                || prev_char == ')'
                                || prev_char == ']'
                                || prev_char == '}'
                        } else {
                            false
                        };

                        if !is_computed_property {
                            // Find the matching closing `]` and check if `=` follows
                            if is_destructuring_assignment_at(chars, j, '[', ']') {
                                found = true;
                            }
                        }
                        break;
                    }
                }
                // Stop at statement boundaries if we're not inside a destructuring
                ';' | '\n' if brace_depth == 0 && bracket_depth == 0 => break,
                _ => {}
            }
        }
        found
    };

    if is_in_destructuring_pattern {
        return true;
    }

    let var_end = var_start + var_len;

    // Skip whitespace after the variable
    let mut k = var_end;
    while k < chars.len() && chars[k].is_whitespace() {
        k += 1;
    }

    if k >= chars.len() {
        return false;
    }

    // Check for assignment operator: = += -= *= /= %= **= etc.
    let next_char = chars[k];

    if next_char == '=' {
        // Could be = or == or ===
        // For assignment, we only have = not followed by =
        if k + 1 < chars.len() && chars[k + 1] == '=' {
            // It's == or ===, not an assignment
            return false;
        }
        // It's a simple assignment
        return true;
    }

    // Check for compound assignments: += -= *= /= %= **=
    if k + 1 < chars.len()
        && chars[k + 1] == '='
        && (next_char == '+' || next_char == '-' || next_char == '*' || next_char == '/')
    {
        // Make sure it's not !== or similar
        if k + 2 < chars.len() && chars[k + 2] == '=' {
            return false;
        }
        return true;
    }

    // Check for **=
    if k + 2 < chars.len() && chars[k] == '*' && chars[k + 1] == '*' && chars[k + 2] == '=' {
        return true;
    }

    // Check for ||= &&= ??= (three-char compound assignments)
    if k + 2 < chars.len()
        && (next_char == '|' || next_char == '&' || next_char == '?')
        && chars[k] == chars[k + 1]
        && chars[k + 2] == '='
    {
        return true;
    }

    // Check for %= (two-char compound assignment)
    if k + 1 < chars.len() && next_char == '%' && chars[k + 1] == '=' {
        return true;
    }

    false
}

/// Check if a variable is the base of a member expression that is being assigned to.
///
/// For example, in `foo[bar] = 1` or `foo.prop = value`, `foo` is the base of the
/// member expression `foo[bar]` or `foo.prop`, and these are on the LHS of an assignment.
///
/// This is used by `wrap_prop_source_reads` to skip the read transform (`foo` -> `foo()`)
/// when the variable is a prop that's being mutated via a member expression.
/// In that case, `transform_prop_assignments` will handle the full mutation wrapping
/// (e.g., `foo(foo()[bar] = 1, true)`).
pub(super) fn is_base_of_assigned_member(chars: &[char], var_start: usize, var_len: usize) -> bool {
    let var_end = var_start + var_len;
    if var_end >= chars.len() {
        return false;
    }

    let next_char = chars[var_end];
    // Only applies when the variable is followed by `.` or `[` (member access)
    if next_char != '.' && next_char != '[' {
        return false;
    }

    // Scan forward past the member expression chain to find an assignment operator.
    // Handle chains like `foo.a.b[c].d = value` or `foo[bar] = 1`.
    let mut j = var_end;
    let mut depth = 0i32;

    while j < chars.len() {
        let c = chars[j];

        match c {
            // Handle bracket member access: skip to matching ]
            '[' => {
                depth += 1;
                j += 1;
            }
            ']' => {
                depth -= 1;
                j += 1;
            }
            '(' => {
                depth += 1;
                j += 1;
            }
            ')' => {
                depth -= 1;
                j += 1;
            }
            // Dot member access: continue scanning
            '.' if depth == 0 => {
                j += 1;
            }
            // Identifier characters: continue scanning (property names)
            c if depth == 0 && is_identifier_char(c) => {
                j += 1;
            }
            // Whitespace at depth 0: skip
            c if depth == 0 && c.is_whitespace() => {
                j += 1;
            }
            // At depth 0, check for assignment operators
            _ if depth == 0 => {
                // Check for assignment operators: = += -= *= /= %= **= ||= &&= ??= etc.
                if c == '=' {
                    // Check it's not == or ===
                    if j + 1 < chars.len() && chars[j + 1] == '=' {
                        return false;
                    }
                    // Check it's not => (arrow)
                    if j + 1 < chars.len() && chars[j + 1] == '>' {
                        return false;
                    }
                    // Check it's not != or <= or >=
                    if j > 0 && matches!(chars[j - 1], '!' | '<' | '>') {
                        return false;
                    }
                    return true;
                }
                // Compound assignments: +=, -=, *=, /=, %=
                if matches!(c, '+' | '-' | '*' | '/' | '%' | '^')
                    && j + 1 < chars.len()
                    && chars[j + 1] == '='
                {
                    // Make sure it's not **= for just * (check for **)
                    if c == '*' && j + 2 < chars.len() && chars[j + 2] == '=' {
                        // Could be **= - still an assignment
                        return true;
                    }
                    if j + 2 < chars.len() && chars[j + 2] == '=' {
                        return false; // e.g., !== - not an assignment
                    }
                    return true;
                }
                // ||= &&= ??=
                if matches!(c, '|' | '&' | '?')
                    && j + 2 < chars.len()
                    && chars[j + 1] == c
                    && chars[j + 2] == '='
                {
                    return true;
                }
                // Not an assignment - reached some other token
                return false;
            }
            _ => {
                j += 1;
            }
        }
    }

    false
}

/// Replace a pattern with a replacement, respecting word boundaries.
/// This function handles increment/decrement operators for state variables.
/// It avoids matching property accesses like `foo.count++` when `count` is a state var,
/// or `++foo.count` when `foo` is a state var.
pub(super) fn replace_with_word_boundary(
    input: &str,
    pattern: &str,
    replacement: &str,
    check_before: bool,
) -> String {
    replace_with_word_boundary_scoped(input, pattern, replacement, check_before, None)
}

pub(super) fn replace_with_word_boundary_scoped(
    input: &str,
    pattern: &str,
    replacement: &str,
    check_before: bool,
    var_name: Option<&str>,
) -> String {
    let mut result = String::new();
    let chars: Vec<char> = input.chars().collect();
    let pattern_chars: Vec<char> = pattern.chars().collect();
    let mut i = 0;

    while i < chars.len() {
        if i + pattern_chars.len() <= chars.len() {
            let potential_match: String = chars[i..i + pattern_chars.len()].iter().collect();
            if potential_match == pattern {
                // Always check that we're not preceded by a dot (property access)
                // e.g., don't match `count++` in `foo.count++` since `count` is a property, not the state variable
                let preceded_by_dot = i > 0 && chars[i - 1] == '.';

                // Also check that we're not followed by a dot (property access)
                // e.g., don't match `++foo` in `++foo.count` since we're incrementing foo.count, not foo
                let followed_by_dot =
                    i + pattern_chars.len() < chars.len() && chars[i + pattern_chars.len()] == '.';

                let before_ok = !preceded_by_dot
                    && (!check_before
                        || i == 0
                        || !is_identifier_char(chars[i - 1])
                        || chars[i] == '+');
                let after_ok = !followed_by_dot
                    && (i + pattern_chars.len() >= chars.len()
                        || !is_identifier_char(chars[i + pattern_chars.len()]));

                // Check if this variable is inside a for-loop scope with shadowing
                let is_for_shadowed = if let Some(vn) = var_name {
                    is_shadowed_by_for_loop_var(&chars, i, vn)
                } else {
                    false
                };

                if before_ok && after_ok && !is_for_shadowed {
                    result.push_str(replacement);
                    i += pattern_chars.len();
                    continue;
                }
            }
        }
        result.push(chars[i]);
        i += 1;
    }

    result
}

// ============================================================================
// Utility Functions
// ============================================================================

/// Check if a variable name appears as a declarator in the given statement text.
///
/// This detects:
/// - Direct declarations: `let foo = ...`, `const foo = ...`, `var foo = ...`
/// - Multi-declarator declarations: `let $$array = ..., foo = ...` where `foo` appears
///   after a comma in a `let`/`const`/`var` statement
///
/// This is needed because `transform_state_assignments` must not convert `foo = $.derived(...)`
/// to `$.set(foo, $.derived(...))` when it's part of a multi-declarator `let` statement.
pub(super) fn is_variable_declaration(result: &str, var: &str) -> bool {
    // Direct check: `let foo = `, `const foo = `, `var foo = `
    if result.contains(&format!("let {} = ", var))
        || result.contains(&format!("const {} = ", var))
        || result.contains(&format!("var {} = ", var))
    {
        return true;
    }

    // Multi-declarator check: The statement starts with let/const/var and the variable
    // appears as a comma-separated declarator (`, foo = ` or `,\n\tfoo = `, etc.)
    let trimmed = result.trim();
    if trimmed.starts_with("let ") || trimmed.starts_with("const ") || trimmed.starts_with("var ") {
        // Look for the pattern: comma, optional whitespace, var, space, equals
        // We need to check that `var` appears after a comma at the declarator level
        // (not inside a nested expression)
        let pattern = format!("{} = ", var);
        let mut search_from = 0;
        while let Some(pos) = result[search_from..].find(&pattern) {
            let abs_pos = search_from + pos;
            // Check that `var` is at a word boundary
            if abs_pos > 0 && is_identifier_char(result.as_bytes()[abs_pos - 1] as char) {
                search_from = abs_pos + pattern.len();
                continue;
            }
            // Check what precedes this occurrence (skip whitespace to find comma or keyword)
            let before = result[..abs_pos].trim_end();
            if before.ends_with(',') {
                return true;
            }
            search_from = abs_pos + pattern.len();
        }
    }

    false
}

/// Check if a character can be part of a JavaScript identifier.
pub(super) fn is_identifier_char(c: char) -> bool {
    c.is_alphanumeric() || c == '_' || c == '$'
}

/// Find the position of the matching closing parenthesis.
pub(crate) fn find_matching_paren(s: &str) -> Option<usize> {
    let mut depth = 1;
    for (i, c) in s.char_indices() {
        match c {
            '(' => depth += 1,
            ')' => {
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

/// Extract the name of the enclosing function from the text before a block opening.
/// Looks for patterns like `function NAME(` just before `{`.
/// Returns None if no named function is found.
pub(super) fn extract_enclosing_function_name(before_block: &str) -> Option<&str> {
    let trimmed = before_block.trim_end();
    // Look for `function NAME(...)` pattern
    // The pattern should end with `)` just before the `{`
    if let Some(paren_close) = trimmed.rfind(')') {
        let before_paren = &trimmed[..paren_close];
        if let Some(paren_open) = before_paren.rfind('(') {
            let before_params = trimmed[..paren_open].trim_end();
            // Check if this is `function NAME`
            if let Some(fn_pos) = before_params.rfind("function ") {
                let name_part = before_params[fn_pos + 9..].trim();
                if !name_part.is_empty()
                    && name_part
                        .chars()
                        .all(|c| c.is_alphanumeric() || c == '_' || c == '$')
                {
                    return Some(name_part);
                }
            }
        }
    }
    None
}

/// Extract the trace label from the enclosing call expression context.
/// For `$effect(() => { ... })`, returns `"$effect(...)"`.
/// For `$.user_effect(() => { ... })`, returns `"$effect(...)"` (maps internal names to user-facing).
/// Returns None if no call expression context is found.
pub(super) fn extract_trace_call_label<'a>(
    _before_block: &str,
    source: &'a str,
) -> Option<&'a str> {
    // Look for the $inspect.trace() call in the source to find its context
    if let Some(trace_pos) = source.find("$inspect.trace(") {
        // Walk backwards to find the enclosing call expression
        let before = &source[..trace_pos];
        // Look for `$effect(` or `$effect.pre(` pattern
        // The arrow function `() => {` immediately precedes the block containing $inspect.trace
        for rune in &["$effect.pre", "$effect"] {
            if before.contains(rune) {
                // Find the position to compute line/col
                return Some(if *rune == "$effect.pre" {
                    "$effect.pre(...)"
                } else {
                    "$effect(...)"
                });
            }
        }
    }
    None
}

/// Find source location for the function/arrow containing $inspect.trace().
pub(super) fn find_trace_source_location(
    _before_block: &str,
    source: &str,
    _label: &str,
) -> Option<(usize, usize)> {
    // Find $inspect.trace() in source and then find the enclosing function/arrow
    if let Some(trace_pos) = source.find("$inspect.trace(") {
        let before = &source[..trace_pos];

        // Walk backwards past whitespace and the opening { to find the arrow =>
        // or function keyword
        let trimmed = before.trim_end();
        // Skip `{` if present
        let trimmed = trimmed.strip_suffix('{').map_or(trimmed, |s| s.trim_end());

        // Look for `=>` (arrow function)
        if trimmed.ends_with("=>") {
            let arrow_pos = trimmed.len() - 2;
            // Go back further to find the start of the arrow function params
            let before_arrow = trimmed[..arrow_pos].trim_end();
            // Find the matching `(`
            if before_arrow.ends_with(')')
                && let Some(open_paren) = rfind_matching_paren(before_arrow, before_arrow.len() - 1)
            {
                // Now we're before the params, check if there's a call expression
                // e.g., `$effect((` -> the arrow starts at `(`
                let fn_start = open_paren;
                let before_fn = &source[..fn_start];
                let line = before_fn.matches('\n').count() + 1;
                let last_nl = before_fn.rfind('\n').map(|p| p + 1).unwrap_or(0);
                let col = fn_start - last_nl;
                return Some((line, col));
            }
        }

        // Look for `function` keyword
        if let Some(fn_pos) = trimmed.rfind("function ") {
            let before_pos = &source[..fn_pos];
            let line = before_pos.matches('\n').count() + 1;
            let last_nl = before_pos.rfind('\n').map(|p| p + 1).unwrap_or(0);
            let col = fn_pos - last_nl;
            return Some((line, col));
        }
    }
    None
}

/// Find the matching opening parenthesis for a closing `)` at the given position.
pub(super) fn rfind_matching_paren(s: &str, close_pos: usize) -> Option<usize> {
    let bytes = s.as_bytes();
    let mut depth = 1i32;
    let mut i = close_pos;
    while i > 0 {
        i -= 1;
        match bytes[i] {
            b')' => depth += 1,
            b'(' => {
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

/// Find the position of the matching closing brace `}` for a string that starts
/// right after the opening `{`. Returns the index of the `}` within the string.
/// Handles nested braces, strings, and comments.
pub(super) fn find_matching_brace(s: &str) -> Option<usize> {
    let mut depth = 1i32;
    let bytes = s.as_bytes();
    let mut i = 0;
    while i < bytes.len() {
        match bytes[i] {
            b'{' => depth += 1,
            b'}' => {
                depth -= 1;
                if depth == 0 {
                    return Some(i);
                }
            }
            // Skip string literals
            b'\'' | b'"' | b'`' => {
                let quote = bytes[i];
                i += 1;
                while i < bytes.len() {
                    if bytes[i] == b'\\' {
                        i += 1; // skip escaped char
                    } else if bytes[i] == quote {
                        break;
                    }
                    i += 1;
                }
            }
            // Skip single-line comments
            b'/' if i + 1 < bytes.len() && bytes[i + 1] == b'/' => {
                i += 2;
                while i < bytes.len() && bytes[i] != b'\n' {
                    i += 1;
                }
            }
            // Skip multi-line comments
            b'/' if i + 1 < bytes.len() && bytes[i + 1] == b'*' => {
                i += 2;
                while i + 1 < bytes.len() && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                    i += 1;
                }
                i += 1; // skip past */
            }
            _ => {}
        }
        i += 1;
    }
    None
}

/// Determine if an expression needs proxying (could return an object/array).
///
/// Returns `true` for:
/// - Object literals `{}`
/// - Array literals `[]`
/// - `new` expressions
/// - Top-level function calls (could return objects)
///
/// Returns `false` for:
/// - Primitives (numbers, strings, booleans, null, undefined)
/// - Arithmetic/binary operations
/// - Unary operations
/// - Identifier references
/// - Arrow functions and function expressions (even if they contain objects inside)
pub(super) fn expression_needs_proxy(expr: &str) -> bool {
    let trimmed = expr.trim();

    // `await expr` needs proxy because the resolved value could be an object/array.
    // In the official Svelte compiler, AwaitExpression is not in the list of types
    // that return false from should_proxy, so it always returns true.
    if trimmed.starts_with("await ") {
        return true;
    }

    // Arrow functions and function expressions don't need proxy wrapping
    // They're functions themselves, not objects/arrays
    // Check for patterns like:
    // - `(x) => ...` or `x => ...` (arrow function)
    // - `function(...)` (function expression)
    // - `async (x) => ...` or `async function(...)` (async variants)
    if is_function_expression(trimmed) {
        return false;
    }

    // Object literal
    if trimmed.starts_with('{') {
        return true;
    }

    // Array literal
    if trimmed.starts_with('[') {
        return true;
    }

    // new expression
    if trimmed.starts_with("new ") {
        return true;
    }

    // Check for top-level function call pattern: identifier followed by (
    // But not operators like !, -, etc.
    // Also check for method calls like foo.bar()
    // NOTE: Only check the TOP-LEVEL expression, not nested function calls
    if is_top_level_function_call(trimmed) {
        return true;
    }

    // Identifiers (except primitives like undefined, null, true, false)
    // could be objects/arrays passed as arguments, so they need proxy.
    // Note: NaN and Infinity are Identifiers in ESTree (not Literals), so the
    // official Svelte compiler's should_proxy() returns true for them. We must
    // NOT exclude them here.
    if is_simple_identifier(trimmed) && !matches!(trimmed, "undefined" | "null" | "true" | "false")
    {
        return true;
    }

    // Member expressions (foo.bar, foo.bar.baz, foo[key]) could return objects/arrays
    // They need proxy because the returned value type is unknown
    if is_member_expression(trimmed) {
        return true;
    }

    // Computed member expressions (obj[key], arr[0]) also need proxy
    // These are identifiers followed by bracket notation
    if is_computed_member_expression(trimmed) {
        return true;
    }

    // Ternary/conditional expressions (a ? b : c) need proxy if either branch
    // could produce a proxyable value. In the official Svelte compiler,
    // ConditionalExpression is not in the list of types that return false from
    // should_proxy, so it always returns true.
    // Check for ternary expressions by looking for '?' at the top level
    if contains_top_level_ternary(trimmed) {
        return true;
    }

    // Logical expressions with || or ?? always need proxy.
    // In the official Svelte compiler, LogicalExpression is not in the
    // should_proxy whitelist, so it always returns true regardless of operands.
    // e.g., `pData ?? defaultValue`, `expr || fallback`
    if contains_top_level_logical(trimmed) {
        return true;
    }

    false
}

/// Scope-aware proxy check: returns false for identifiers that are known to be
/// non-proxyable (e.g., `const min = 2` - `min` is a literal, doesn't need proxy).
/// Falls back to `expression_needs_proxy` for everything else.
pub(super) fn expression_needs_proxy_with_scope(expr: &str, non_proxy_vars: &[String]) -> bool {
    let trimmed = expr.trim();
    // If this is a simple identifier that we know resolves to a primitive/literal,
    // it doesn't need proxy wrapping.
    if is_simple_identifier(trimmed) && non_proxy_vars.iter().any(|v| v == trimmed) {
        return false;
    }
    expression_needs_proxy(trimmed)
}

/// Check if an expression is a simple identifier (not a complex expression)
pub(super) fn is_simple_identifier(expr: &str) -> bool {
    if expr.is_empty() {
        return false;
    }
    let first_char = expr.chars().next().unwrap();
    // Must start with letter, underscore, or $
    if !first_char.is_alphabetic() && first_char != '_' && first_char != '$' {
        return false;
    }
    // All chars must be alphanumeric, underscore, or $
    expr.chars()
        .all(|c| c.is_alphanumeric() || c == '_' || c == '$')
}

/// Check if an expression is a member expression (e.g., foo.bar, foo.bar.baz)
/// but not a function call (foo.bar()).
pub(super) fn is_member_expression(expr: &str) -> bool {
    let trimmed = expr.trim();
    if trimmed.is_empty() {
        return false;
    }

    // Must start with an identifier character
    let first_char = trimmed.chars().next().unwrap();
    if !first_char.is_alphabetic() && first_char != '_' && first_char != '$' {
        return false;
    }

    // Check if it contains at least one dot and all parts are valid identifiers
    // Also ensure it doesn't end with () which would make it a function call
    if !trimmed.contains('.') {
        return false;
    }

    // If it ends with ), it's likely a function call, not a pure member expression
    if trimmed.ends_with(')') {
        return false;
    }

    // Check that all parts separated by . are valid identifiers
    for part in trimmed.split('.') {
        let part = part.trim();
        if part.is_empty() {
            return false;
        }
        let first = part.chars().next().unwrap();
        if !first.is_alphabetic() && first != '_' && first != '$' {
            return false;
        }
        if !part
            .chars()
            .all(|c| c.is_alphanumeric() || c == '_' || c == '$')
        {
            return false;
        }
    }

    true
}

/// Check if an expression is a computed member expression (e.g., obj[key], arr[0]).
/// Matches identifier followed by `[...]` bracket notation.
pub(super) fn is_computed_member_expression(expr: &str) -> bool {
    let trimmed = expr.trim();
    if trimmed.is_empty() {
        return false;
    }

    // Must start with an identifier character
    let first_char = trimmed.chars().next().unwrap();
    if !first_char.is_alphabetic() && first_char != '_' && first_char != '$' {
        return false;
    }

    // Must NOT end with ')' (would be a function call)
    if trimmed.ends_with(')') {
        return false;
    }

    // Must end with ']' (bracket access)
    if !trimmed.ends_with(']') {
        return false;
    }

    // Find the opening bracket that matches the closing bracket
    // The identifier part before it must be a valid identifier or member expression
    let mut depth = 0;
    for (i, c) in trimmed.char_indices().rev() {
        match c {
            ']' => depth += 1,
            '[' => {
                depth -= 1;
                if depth == 0 {
                    // Everything before the bracket must be a valid identifier or member expression
                    let before = &trimmed[..i];
                    if before.is_empty() {
                        return false;
                    }
                    // Check it starts with an identifier character and contains only valid chars
                    let first = before.chars().next().unwrap();
                    if !first.is_alphabetic() && first != '_' && first != '$' {
                        return false;
                    }
                    return before
                        .chars()
                        .all(|c| c.is_alphanumeric() || c == '_' || c == '$' || c == '.');
                }
            }
            _ => {}
        }
    }

    false
}

/// Check if an expression contains a top-level ternary operator (? :).
/// This handles expressions like `$.get(post) ? null : { title: 'hello world' }`.
/// "Top-level" means not nested inside parentheses, brackets, or braces.
pub(super) fn contains_top_level_ternary(expr: &str) -> bool {
    let mut depth = 0;
    let bytes = expr.as_bytes();
    let mut in_string = false;
    let mut string_char = b'\0';

    let mut i = 0;
    while i < bytes.len() {
        let c = bytes[i];

        if in_string {
            if c == string_char && (i == 0 || bytes[i - 1] != b'\\') {
                in_string = false;
            }
            i += 1;
            continue;
        }

        match c {
            b'\'' | b'"' | b'`' => {
                in_string = true;
                string_char = c;
            }
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => {
                if depth > 0 {
                    depth -= 1;
                }
            }
            b'?' if depth == 0 => {
                // Make sure it's not ?. (optional chaining) or ?? (nullish coalescing)
                if i + 1 < bytes.len() && (bytes[i + 1] == b'.' || bytes[i + 1] == b'?') {
                    i += 2;
                    continue;
                }
                return true;
            }
            _ => {}
        }
        i += 1;
    }
    false
}

/// Check if an expression contains a top-level logical operator (|| or ??)
/// followed by a proxyable value (object literal, array literal, etc.).
/// For example: `expr || { default: true }` or `expr ?? [1, 2, 3]`.
pub(super) fn contains_top_level_logical(expr: &str) -> bool {
    let mut depth = 0;
    let bytes = expr.as_bytes();
    let mut in_string = false;
    let mut string_char = b'\0';

    let mut i = 0;
    while i < bytes.len() {
        let c = bytes[i];

        if in_string {
            if c == string_char && (i == 0 || bytes[i - 1] != b'\\') {
                in_string = false;
            }
            i += 1;
            continue;
        }

        match c {
            b'\'' | b'"' | b'`' => {
                in_string = true;
                string_char = c;
            }
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => {
                if depth > 0 {
                    depth -= 1;
                }
            }
            // Any top-level || or ?? means the expression is a LogicalExpression,
            // which always needs proxy in the official Svelte compiler.
            b'|' if depth == 0 && i + 1 < bytes.len() && bytes[i + 1] == b'|' => {
                return true;
            }
            b'?' if depth == 0 && i + 1 < bytes.len() && bytes[i + 1] == b'?' => {
                return true;
            }
            _ => {}
        }
        i += 1;
    }
    false
}

/// Check if an expression is a function expression (arrow function or function keyword).
pub(super) fn is_function_expression(expr: &str) -> bool {
    let trimmed = expr.trim();

    // Check for async prefix
    let without_async = trimmed
        .strip_prefix("async ")
        .map(|s| s.trim())
        .unwrap_or(trimmed);

    // Check for function keyword
    if let Some(after_fn) = without_async.strip_prefix("function") {
        // Could be `function(` or `function name(`
        if after_fn.starts_with('(') || after_fn.starts_with(' ') || after_fn.starts_with('*') {
            return true;
        }
    }

    // Check for arrow function patterns:
    // - `(x) => ...` - starts with (
    // - `x => ...` - starts with identifier followed by =>
    // - `() => ...` - empty params
    if let Some(inner) = without_async.strip_prefix('(') {
        // Could be `(x) => ...` or just a parenthesized expression
        // Look for `) =>` pattern
        if let Some(paren_end) = find_matching_paren(inner) {
            let after_paren = inner[paren_end + 1..].trim_start();
            if after_paren.starts_with("=>") {
                return true;
            }
        }
    }

    // Check for `identifier =>` pattern (single param arrow function without parens)
    // e.g., `name => {...}` or `x => x + 1`
    let mut chars = without_async.chars().peekable();
    let mut ident = String::new();

    // Collect identifier chars
    while let Some(&c) = chars.peek() {
        if c.is_alphanumeric() || c == '_' || c == '$' {
            ident.push(c);
            chars.next();
        } else {
            break;
        }
    }

    if !ident.is_empty() {
        // Skip whitespace after identifier
        while let Some(&c) = chars.peek() {
            if c.is_whitespace() {
                chars.next();
            } else {
                break;
            }
        }
        // Check for =>
        let remaining: String = chars.collect();
        if remaining.starts_with("=>") {
            return true;
        }
    }

    false
}

/// Check if an expression is a top-level function call.
/// This only checks if the expression starts with a function call pattern,
/// not if it contains function calls nested inside.
pub(super) fn is_top_level_function_call(expr: &str) -> bool {
    let trimmed = expr.trim();

    // Skip arrow functions and function expressions
    if is_function_expression(trimmed) {
        return false;
    }

    // Look for pattern: identifier(...) or identifier.method(...)
    let chars: Vec<char> = trimmed.chars().collect();
    let mut i = 0;

    // Must start with identifier or (
    if chars.is_empty() {
        return false;
    }

    let first = chars[0];

    // If starts with ( it could be an IIFE: (function(){})() or (() => {})()
    // For simplicity, skip these for now
    if first == '(' {
        return false;
    }

    // Skip if starts with operators or non-identifier chars
    if !first.is_alphabetic() && first != '_' && first != '$' {
        return false;
    }

    // Collect the identifier path (could include dots for method calls)
    while i < chars.len() {
        let c = chars[i];
        if c.is_alphanumeric() || c == '_' || c == '$' || c == '.' {
            i += 1;
        } else {
            break;
        }
    }

    // After identifier, should be (
    if i < chars.len() && chars[i] == '(' {
        // Check it's not a keyword
        let ident: String = chars[..i].iter().collect();
        let last_part = ident.split('.').next_back().unwrap_or(&ident);
        let keywords = [
            "if", "while", "for", "switch", "catch", "with", "function", "async",
        ];
        if keywords.contains(&last_part) {
            return false;
        }
        return true;
    }

    false
}

/// Check if an expression contains a function call.
#[allow(dead_code)]
pub(super) fn contains_function_call(expr: &str) -> bool {
    let chars: Vec<char> = expr.chars().collect();
    let mut i = 0;
    let mut in_string = false;
    let mut string_char = ' ';

    while i < chars.len() {
        let c = chars[i];

        // Track string literals
        if !in_string && (c == '"' || c == '\'' || c == '`') {
            in_string = true;
            string_char = c;
            i += 1;
            continue;
        }
        if in_string && c == string_char && (i == 0 || chars[i - 1] != '\\') {
            in_string = false;
            i += 1;
            continue;
        }
        if in_string {
            i += 1;
            continue;
        }

        // Look for identifier followed by (
        // Skip operators like !foo or ++foo
        if c == '(' && i > 0 {
            let prev = chars[i - 1];
            // Previous char should be an identifier char or )
            if prev.is_alphanumeric() || prev == '_' || prev == '$' || prev == ')' || prev == ']' {
                // Check it's not a keyword followed by (
                // like if(, while(, for(, etc.
                let mut start = i - 1;
                while start > 0
                    && (chars[start - 1].is_alphanumeric()
                        || chars[start - 1] == '_'
                        || chars[start - 1] == '$'
                        || chars[start - 1] == '.')
                {
                    start -= 1;
                }
                let ident: String = chars[start..i].iter().collect();
                let ident_last = ident.split('.').next_back().unwrap_or(&ident);

                // Keywords that are NOT function calls
                let keywords = ["if", "while", "for", "switch", "catch", "with"];
                if !keywords.contains(&ident_last) {
                    return true;
                }
            }
        }

        i += 1;
    }

    false
}

/// Check if an expression contains a direct `await` keyword (not inside a nested async function).
///
/// This is used to detect async derived patterns like `$derived(await expr)`.
/// We need to be careful not to match `await` that's inside a nested async function.
///
/// Examples:
/// - `await 1` -> true
/// - `foo(await 1)` -> true
/// - `async () => { return await 1; }` -> false (await is inside async function)
pub(super) fn contains_direct_await_in_expression(expr: &str) -> bool {
    let chars: Vec<char> = expr.chars().collect();
    let mut i = 0;
    let mut in_string = false;
    let mut string_char = ' ';

    // Track nested function depth (async functions)
    // We only count await at depth 0
    let mut async_fn_depth = 0;

    while i < chars.len() {
        let c = chars[i];

        // Handle string literals
        if !in_string && (c == '"' || c == '\'' || c == '`') {
            in_string = true;
            string_char = c;
            i += 1;
            continue;
        }
        if in_string && c == string_char && (i == 0 || chars[i - 1] != '\\') {
            in_string = false;
            i += 1;
            continue;
        }
        if in_string {
            i += 1;
            continue;
        }

        // Check for 'async' keyword followed by function definition
        if i + 5 <= chars.len() {
            let word: String = chars[i..i + 5].iter().collect();
            if word == "async" {
                // Check if this is followed by function or arrow syntax
                let rest: String = chars[i + 5..].iter().collect();
                let rest_trimmed = rest.trim_start();
                if rest_trimmed.starts_with("(")
                    || rest_trimmed.starts_with("function")
                    || chars[i + 5..]
                        .iter()
                        .collect::<String>()
                        .trim_start()
                        .starts_with("=>")
                {
                    // We found an async function, track depth when we see '{'
                    // For now, just note we're in async context
                }
            }
        }

        // Check for 'await' keyword at top level
        if i + 5 <= chars.len() && async_fn_depth == 0 {
            let word: String = chars[i..i + 5].iter().collect();
            if word == "await" {
                // Make sure it's a word boundary
                let before_ok = i == 0 || !is_identifier_char(chars[i - 1]);
                let after_ok = i + 5 >= chars.len() || !is_identifier_char(chars[i + 5]);
                if before_ok && after_ok {
                    return true;
                }
            }
        }

        // Track nested async arrow functions: async () => or async x =>
        // Simplified: just check for 'async' followed by ')' and then '=>'
        // This is a heuristic - we check for `async` followed by arrow function patterns

        // Track braces for nested scopes
        if c == '{' {
            // Check if this brace follows an arrow function context
            // Look back for '=>'
            let before: String = chars[..i].iter().collect();
            if before.trim_end().ends_with("=>") {
                // Check if async was before the params
                let before_trimmed = before.trim_end();
                // Find the '('
                if let Some(paren_pos) = before_trimmed.rfind('(') {
                    let before_paren = &before_trimmed[..paren_pos];
                    if before_paren.trim_end().ends_with("async") {
                        async_fn_depth += 1;
                    }
                } else {
                    // Single param arrow: async x =>
                    // Look for 'async' before the identifier
                    if let Some(async_pos) = before_trimmed.rfind("async") {
                        let between = &before_trimmed[async_pos + 5..];
                        // Should be: "async x =>" pattern
                        if between
                            .trim()
                            .chars()
                            .all(|c| is_identifier_char(c) || c == ' ')
                        {
                            async_fn_depth += 1;
                        }
                    }
                }
            }
        } else if c == '}' && async_fn_depth > 0 {
            async_fn_depth -= 1;
        }

        i += 1;
    }

    false
}

/// Strip the top-level `await` keyword from the beginning of an expression string.
///
/// For example:
///   "await Promise.resolve(5)" -> "Promise.resolve(5)"
///   "await fetch(url)" -> "fetch(url)"
///   "await (x + y)" -> "(x + y)"
///
/// If the expression does not start with `await`, returns the original string.
pub(super) fn strip_top_level_await_from_expr(expr: &str) -> String {
    let trimmed = expr.trim();
    if let Some(rest) = trimmed.strip_prefix("await ") {
        rest.trim_start().to_string()
    } else if let Some(rest) = trimmed.strip_prefix("await\n") {
        rest.trim_start().to_string()
    } else if let Some(rest) = trimmed.strip_prefix("await\t") {
        rest.trim_start().to_string()
    } else if let Some(rest) = trimmed.strip_prefix("await(") {
        // `await(expr)` - keep the opening paren
        format!("({}", rest)
    } else {
        trimmed.to_string()
    }
}

/// Wrap non-final `await expr` in async derived expressions with `$.save()`.
///
/// In the official Svelte compiler, `await` expressions that precede other reactive
/// reads inside `$derived` / async_derived are wrapped with `$.save()` to preserve
/// reactive context across the await boundary.
///
/// Example: `(await get_promise()) * get_num()`
///   becomes: `(await $.save(get_promise()))() * get_num()`
///
/// The rule: if the `await expr` is not the entirety of the expression (i.e., there's
/// more code after it), wrap with `$.save()` and add `()` invocation after the await.
pub(super) fn wrap_await_with_save_in_async_derived(expr: &str) -> String {
    let trimmed = expr.trim();
    let chars: Vec<char> = trimmed.chars().collect();
    let len = chars.len();
    let mut result = String::with_capacity(len + 20);
    let mut i = 0;

    while i < len {
        // Skip strings
        if chars[i] == '\'' || chars[i] == '"' || chars[i] == '`' {
            let quote = chars[i];
            result.push(chars[i]);
            i += 1;
            while i < len && chars[i] != quote {
                if chars[i] == '\\' {
                    result.push(chars[i]);
                    i += 1;
                    if i < len {
                        result.push(chars[i]);
                        i += 1;
                    }
                } else if quote == '`' && chars[i] == '$' && i + 1 < len && chars[i + 1] == '{' {
                    // Template literal interpolation - recurse
                    result.push(chars[i]);
                    result.push(chars[i + 1]);
                    i += 2;
                    let mut depth = 1;
                    let start = i;
                    while i < len && depth > 0 {
                        if chars[i] == '{' {
                            depth += 1;
                        } else if chars[i] == '}' {
                            depth -= 1;
                        }
                        if depth > 0 {
                            i += 1;
                        }
                    }
                    let inner: String = chars[start..i].iter().collect();
                    result.push_str(&wrap_await_with_save_in_async_derived(&inner));
                    if i < len {
                        result.push(chars[i]); // closing }
                        i += 1;
                    }
                } else {
                    result.push(chars[i]);
                    i += 1;
                }
            }
            if i < len {
                result.push(chars[i]); // closing quote
                i += 1;
            }
            continue;
        }

        // Skip async arrow functions - don't transform await inside them
        if i + 5 < len {
            let word: String = chars[i..i + 5].iter().collect();
            if word == "async" {
                // Check if followed by space/paren and then arrow function
                let rest: String = chars[i..].iter().collect();
                if rest.starts_with("async (") || rest.starts_with("async()") {
                    // This is an async arrow function or async function - skip to end
                    result.push_str(&rest);
                    return result;
                }
            }
        }

        // Check for 'await' keyword
        if i + 5 <= len {
            let word: String = chars[i..i + 5].iter().collect();
            if word == "await"
                && (i == 0 || !chars[i - 1].is_alphanumeric() && chars[i - 1] != '_')
                && (i + 5 >= len || !chars[i + 5].is_alphanumeric() && chars[i + 5] != '_')
            {
                // Found an `await` keyword.
                // Check if there's more expression content after the await + its argument.
                // We need to find the end of the await argument to check if there's more.
                let after_await = i + 5;
                let mut arg_start = after_await;
                // Skip whitespace after 'await'
                while arg_start < len && chars[arg_start].is_whitespace() {
                    arg_start += 1;
                }

                // Find the extent of the await argument
                // It goes until we hit a binary operator (+, *, -, /, %, etc.) at the same depth,
                // or end of expression
                let mut j = arg_start;
                let mut paren_depth = 0;
                let mut bracket_depth = 0;
                let mut brace_depth = 0;

                while j < len {
                    match chars[j] {
                        '(' => paren_depth += 1,
                        ')' => {
                            if paren_depth == 0 {
                                break;
                            }
                            paren_depth -= 1;
                        }
                        '[' => bracket_depth += 1,
                        ']' => {
                            if bracket_depth == 0 {
                                break;
                            }
                            bracket_depth -= 1;
                        }
                        '{' => brace_depth += 1,
                        '}' => {
                            if brace_depth == 0 {
                                break;
                            }
                            brace_depth -= 1;
                        }
                        '*' | '+' | '-' | '/' | '%' | '&' | '|' | '^' | '<' | '>'
                            if paren_depth == 0 && bracket_depth == 0 && brace_depth == 0 =>
                        {
                            // Binary operator at top level - this is where the await arg ends
                            break;
                        }
                        ',' if paren_depth == 0 && bracket_depth == 0 && brace_depth == 0 => break,
                        '?' if paren_depth == 0 && bracket_depth == 0 && brace_depth == 0 => break,
                        ':' if paren_depth == 0 && bracket_depth == 0 && brace_depth == 0 => break,
                        _ => {}
                    }
                    j += 1;
                }

                // The await argument is chars[arg_start..j]
                let await_arg: String = chars[arg_start..j].iter().collect();
                let await_arg_trimmed = await_arg.trim();

                // Check if there's more expression after this await+arg
                let remaining: String = chars[j..].iter().collect();
                let remaining_trimmed = remaining.trim();
                let has_more_after = !remaining_trimmed.is_empty()
                    && remaining_trimmed != ")"
                    && remaining_trimmed != "))"
                    && remaining_trimmed != ";";

                if has_more_after {
                    // Wrap with $.save: `await expr` -> `(await $.save(expr))()`
                    result.push_str(&format!("(await $.save({}))()", await_arg_trimmed));
                    i = j;
                } else {
                    // Last expression - keep as is
                    result.push_str("await ");
                    result.push_str(await_arg_trimmed);
                    i = j;
                }
                continue;
            }
        }

        result.push(chars[i]);
        i += 1;
    }

    result
}
