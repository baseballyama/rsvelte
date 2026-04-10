//! Destructuring assignment transformations and IIFE generation.

use rustc_hash::FxHashSet;

use super::{SCRIPT_ARRAY_COUNTER, is_identifier_char};

pub(super) fn unthunk_string(expr: &str) -> String {
    let trimmed = expr.trim();

    // Check if the expression is a simple call: identifier() or $.method()
    // IMPORTANT: Only plain identifiers and `$.xxx` member expressions are unthunked.
    // This matches the official Svelte compiler's unthunk() which checks
    // `expression.body.callee.type === 'Identifier'` (not arbitrary MemberExpression).
    // The `$.xxx` exception is for Svelte runtime functions (e.g., `$.effect_tracking()`).
    // e.g., `() => foo()` -> `foo`, `() => $.get(x)` -> `$.get(x)` (kept as call)
    // but `() => value.toString()` stays as `() => value.toString()`
    if let Some(callee) = trimmed.strip_suffix("()") {
        let is_plain_identifier = !callee.is_empty()
            && callee
                .chars()
                .all(|c| c.is_alphanumeric() || c == '_' || c == '$');
        let is_dollar_member = callee.starts_with("$.")
            && callee[2..].chars().all(|c| c.is_alphanumeric() || c == '_');
        if is_plain_identifier || is_dollar_member {
            return callee.to_string();
        }
    }

    // No optimization possible, wrap in arrow
    format!("() => {}", expr)
}

/// Transform destructuring assignment expressions targeting reactive variables
/// into IIFE patterns.
///
/// Handles:
/// - Array destructure: `[a, b] = [expr1, expr2]` -> IIFE with `$.to_array()`
/// - Object destructure: `({a, b} = obj)` -> IIFE with individual assignments
///
/// The generated IIFE decomposes the destructure into individual assignments
/// which are then processed by `transform_state_assignments` (for `$.set()`)
/// and `transform_member_mutations` (for `$.mutate()`).
///
/// This runs BEFORE other assignment transforms in the pipeline.
///
/// Corresponds to `visit_assignment_expression` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/shared/assignments.js`.
pub(super) fn transform_destructure_assignments(
    statement: &str,
    state_vars: &[String],
    store_sub_vars: &[String],
) -> String {
    transform_destructure_assignments_with_props(statement, state_vars, store_sub_vars, &[])
}

/// Transform destructure assignments, with knowledge of prop variables.
///
/// `prop_vars` are variable names that will be transformed to function calls
/// (e.g., `numbers` → `numbers()` for prop getters). When the RHS of a
/// destructuring is a prop variable, we must use the IIFE form (with `$$value`
/// caching) because the official compiler visits the RHS first, transforming it
/// to a CallExpression, and then checks `should_cache = value.type !== 'Identifier'`.
pub(super) fn transform_destructure_assignments_with_props(
    statement: &str,
    state_vars: &[String],
    store_sub_vars: &[String],
    prop_vars: &[String],
) -> String {
    // Quick check: destructure assignments require `=` with `[` or `{` on the LHS
    if state_vars.is_empty() && store_sub_vars.is_empty() && prop_vars.is_empty() {
        return statement.to_string();
    }

    let mut result = statement.to_string();

    // Build HashSets once for O(1) lookups across all iterations
    let state_set: rustc_hash::FxHashSet<&str> = state_vars.iter().map(|s| s.as_str()).collect();
    let store_set: rustc_hash::FxHashSet<&str> =
        store_sub_vars.iter().map(|s| s.as_str()).collect();

    // Process the statement, looking for destructure assignments.
    // We scan for patterns and replace them with IIFEs.
    while let Some(transformed) = find_and_transform_one_destructure(
        &result,
        store_sub_vars,
        prop_vars,
        &state_set,
        &store_set,
    ) {
        result = transformed;
    }

    result
}

// Note: SCRIPT_ARRAY_COUNTER (declared at the top of this file) is used for all
// $$array name generation in the script processing pipeline.

/// Find and transform one destructure assignment in the statement.
/// Returns `Some(transformed)` if a destructure was found and transformed,
/// or `None` if no more destructures to transform.
///
/// To match the official Svelte compiler's depth-first AST traversal order,
/// we scan for ALL candidate destructures and pick the RIGHTMOST one.
/// This ensures inner/nested destructures (e.g., in the RHS of an outer
/// destructure) are processed before outer ones, so $$array counter
/// values match the official compiler output.
pub(super) fn find_and_transform_one_destructure(
    statement: &str,
    store_sub_vars: &[String],
    prop_vars: &[String],
    state_set: &rustc_hash::FxHashSet<&str>,
    store_set: &rustc_hash::FxHashSet<&str>,
) -> Option<String> {
    let chars: Vec<char> = statement.chars().collect();
    let len = chars.len();

    // Build char-index → byte-index mapping for safe string slicing with multi-byte chars
    let byte_offsets: Vec<usize> = statement.char_indices().map(|(b, _)| b).collect();
    let byte_len = statement.len();
    let b = |char_idx: usize| -> usize {
        if char_idx >= byte_offsets.len() {
            byte_len
        } else {
            byte_offsets[char_idx]
        }
    };

    // Scan for `] =` or `} =` patterns that indicate destructure assignments.
    // We need to be careful to avoid:
    // - Already-transformed IIFE patterns ($.to_array, $.set, etc.)
    // - Regular object/array literals on the RHS of assignments
    // - Patterns inside strings or comments

    // Collect all valid candidate destructures, then pick the rightmost one.
    // Each candidate stores (close_bracket_char_idx, pattern_start, close_bracket, rhs_start_after_eq)
    struct Candidate {
        close_pos: usize,     // char index of ] or }
        pattern_start: usize, // char index of [ or {
        close_bracket: char,  // ] or }
        eq_pos: usize,        // char index of =
    }
    let mut candidates: Vec<Candidate> = Vec::new();

    let mut i = 0;
    let mut in_string: Option<char> = None;

    while i < len {
        let c = chars[i];

        // Track string boundaries
        if in_string.is_none() {
            if c == '\'' || c == '"' || c == '`' {
                in_string = Some(c);
                i += 1;
                continue;
            }
        } else if Some(c) == in_string && (i == 0 || chars[i - 1] != '\\') {
            in_string = None;
            i += 1;
            continue;
        }

        if in_string.is_some() {
            i += 1;
            continue;
        }

        // Look for `] =` or `} =` (possibly with spaces)
        if (c == ']' || c == '}') && i + 1 < len {
            // Find the `=` after the bracket (skipping any whitespace including newlines)
            let mut j = i + 1;
            while j < len && chars[j].is_whitespace() {
                j += 1;
            }
            if j < len && chars[j] == '=' && (j + 1 >= len || chars[j + 1] != '=') {
                // Found a potential destructure assignment
                let close_bracket = c;
                let open_bracket = if c == ']' { '[' } else { '{' };

                // Walk backwards from position `i` to find the matching open bracket
                if let Some(pattern_start) =
                    find_matching_open_bracket(statement, i, open_bracket, close_bracket)
                {
                    let pattern_str = &statement[b(pattern_start)..b(i + 1)];
                    let rhs_start = j + 1;

                    // For array patterns, check if `[` is actually member access
                    if open_bracket == '[' && pattern_start > 0 {
                        let before_char = chars[pattern_start - 1];
                        if before_char.is_ascii_alphanumeric()
                            || before_char == '_'
                            || before_char == '$'
                            || before_char == ')'
                            || before_char == ']'
                        {
                            i = j + 1;
                            continue;
                        }
                    }

                    // Skip declaration destructures (let/const/var)
                    let before_pattern = statement[..b(pattern_start)].trim_end();
                    if before_pattern.ends_with("let")
                        || before_pattern.ends_with("const")
                        || before_pattern.ends_with("var")
                    {
                        i = j + 1;
                        continue;
                    }

                    // Skip already-transformed patterns
                    if before_pattern.ends_with("$.to_array(") {
                        i = j + 1;
                        continue;
                    }

                    // Extract target identifiers from the pattern
                    let targets = extract_destructure_targets(pattern_str);

                    // Check if any target is a reactive variable
                    let has_reactive_target = targets
                        .iter()
                        .any(|t| state_set.contains(t.as_str()) || store_set.contains(t.as_str()));

                    if !has_reactive_target {
                        i = j + 1;
                        continue;
                    }

                    // Find the end of the RHS expression
                    let rhs_end = find_destructure_rhs_end(statement, rhs_start);
                    let rhs_str = statement[b(rhs_start)..b(rhs_end)].trim();

                    if rhs_str.is_empty() {
                        i = j + 1;
                        continue;
                    }

                    // Valid candidate - store it
                    candidates.push(Candidate {
                        close_pos: i,
                        pattern_start,
                        close_bracket,
                        eq_pos: j,
                    });
                }
            }
        }

        i += 1;
    }

    if candidates.is_empty() {
        return None;
    }

    // Pick the first candidate whose RHS does NOT contain another candidate.
    // This ensures inner/nested destructures are processed before their
    // containing destructures (matching the official Svelte compiler's
    // depth-first AST traversal), while sequential destructures are
    // processed left-to-right (preserving $$array counter order).
    //
    // For each candidate, compute its RHS range. If another candidate's
    // closing bracket falls within this RHS range, the candidate "contains"
    // the other and should be deferred.
    let candidate_idx = {
        // Compute rhs_end for each candidate to determine containment
        let rhs_ends: Vec<usize> = candidates
            .iter()
            .map(|c| find_destructure_rhs_end(statement, c.eq_pos + 1))
            .collect();

        let mut selected = 0; // default to first
        'outer: for (ci, c) in candidates.iter().enumerate() {
            let rhs_start = c.eq_pos + 1;
            let rhs_end = rhs_ends[ci];
            // Check if any other candidate's close_pos is inside this candidate's RHS range
            let mut contains_other = false;
            for (oi, other) in candidates.iter().enumerate() {
                if oi == ci {
                    continue;
                }
                // Check if other's close bracket is within this candidate's RHS
                if other.close_pos > rhs_start && other.close_pos < rhs_end {
                    contains_other = true;
                    break;
                }
            }
            if !contains_other {
                selected = ci;
                break 'outer;
            }
        }
        selected
    };
    let candidate = &candidates[candidate_idx];
    let i = candidate.close_pos;
    let pattern_start = candidate.pattern_start;
    let close_bracket = candidate.close_bracket;
    let j = candidate.eq_pos;
    let rhs_start = j + 1;

    let pattern_str = &statement[b(pattern_start)..b(i + 1)];
    let rhs_end = find_destructure_rhs_end(statement, rhs_start);
    let rhs_str = statement[b(rhs_start)..b(rhs_end)].trim();

    // Check for surrounding parentheses
    let mut actual_start = b(pattern_start);
    let mut actual_end = b(rhs_end);

    let before = statement[..b(pattern_start)].trim_end();
    if before.ends_with('(') {
        let paren_pos = statement[..b(pattern_start)].rfind('(').unwrap();
        let after_rhs = &statement[b(rhs_end)..];
        if let Some(close_paren_offset) = after_rhs.find(')') {
            actual_start = paren_pos;
            actual_end = b(rhs_end) + close_paren_offset + 1;
        }
    }

    // Determine if standalone statement
    let before_text = statement[..actual_start].trim_end();
    let after_text = statement[actual_end..].trim_start();
    let is_standalone = (before_text.is_empty()
        || before_text.ends_with(';')
        || before_text.ends_with('{')
        || before_text.ends_with('\n'))
        && (after_text.is_empty() || after_text.starts_with(';') || after_text.starts_with('\n'));

    // Check if RHS will become a function call
    let rhs_trimmed = rhs_str.trim();
    let rhs_will_be_call = prop_vars.iter().any(|p| p == rhs_trimmed)
        || store_sub_vars.iter().any(|s| s == rhs_trimmed);

    // Generate the IIFE replacement
    let iife = generate_destructure_iife(
        close_bracket,
        pattern_str,
        rhs_str,
        is_standalone,
        store_sub_vars,
        rhs_will_be_call,
    );

    // Replace the destructure expression with the IIFE
    let mut new_statement = String::new();
    new_statement.push_str(&statement[..actual_start]);
    new_statement.push_str(&iife);
    new_statement.push_str(&statement[actual_end..]);

    Some(new_statement)
}

/// Find the matching opening bracket, respecting nesting and strings.
pub(super) fn find_matching_open_bracket(
    s: &str,
    close_pos: usize,
    open_bracket: char,
    close_bracket: char,
) -> Option<usize> {
    let chars: Vec<char> = s.chars().collect();
    let mut depth = 1;
    let mut i = close_pos;

    // Walk backwards
    while i > 0 {
        i -= 1;
        let c = chars[i];

        if c == close_bracket {
            depth += 1;
        } else if c == open_bracket {
            depth -= 1;
            if depth == 0 {
                return Some(i);
            }
        }
    }

    None
}

/// Extract root identifier names from a destructure pattern string.
/// For `[a, b[0], c.prop]`, returns `["a", "b", "c"]`.
/// For `{x, y: z, w}`, returns `["x", "z", "w"]`.
pub(super) fn extract_destructure_targets(pattern: &str) -> Vec<String> {
    let mut targets = Vec::new();
    let trimmed = pattern.trim();

    // Remove outer brackets
    let inner = if (trimmed.starts_with('[') && trimmed.ends_with(']'))
        || (trimmed.starts_with('{') && trimmed.ends_with('}'))
    {
        &trimmed[1..trimmed.len() - 1]
    } else {
        trimmed
    };

    // Split on commas (respecting nested brackets)
    let parts = split_on_commas(inner);

    for part in &parts {
        let part = part.trim();
        if part.is_empty() || part == "..." {
            continue;
        }

        // Handle rest element: ...rest
        let part = if let Some(rest) = part.strip_prefix("...") {
            rest.trim()
        } else {
            part
        };

        // Handle default value BEFORE colon check: target = default
        // This is critical because a default value may contain a ternary expression
        // with a colon (e.g., `j = "19" ? 10 : await Promise.resolve(11)`).
        // If we checked colon first, we'd mistake the ternary `:` for a key:value separator.
        // In valid destructuring syntax, `key: target = default` always has `:` before `=`,
        // so if `=` appears first, any `:` is part of the default expression.
        let part = if let Some(eq_pos) = find_top_level_equals(part) {
            part[..eq_pos].trim()
        } else {
            part
        };

        // Handle object property with rename: key: value
        let part = if let Some(colon_pos) = find_top_level_colon(part) {
            part[colon_pos + 1..].trim()
        } else {
            part
        };

        // Extract root identifier from the target
        // For `a`, returns `a`
        // For `a[0]`, returns `a`
        // For `a.prop`, returns `a`
        if let Some(root) = extract_root_identifier(part) {
            targets.push(root);
        }

        // Also recurse into nested patterns
        if part.starts_with('[') || part.starts_with('{') {
            let nested = extract_destructure_targets(part);
            targets.extend(nested);
        }
    }

    targets
}

/// Split a string on top-level commas (not inside brackets, parens, or strings).
pub(super) fn split_on_commas(s: &str) -> Vec<String> {
    let mut parts = Vec::new();
    let mut current = String::new();
    let mut depth = 0;
    let mut in_string: Option<char> = None;

    for c in s.chars() {
        if in_string.is_some() {
            current.push(c);
            if Some(c) == in_string {
                in_string = None;
            }
            continue;
        }

        match c {
            '\'' | '"' | '`' => {
                in_string = Some(c);
                current.push(c);
            }
            '(' | '[' | '{' => {
                depth += 1;
                current.push(c);
            }
            ')' | ']' | '}' => {
                depth -= 1;
                current.push(c);
            }
            ',' if depth == 0 => {
                parts.push(current.clone());
                current.clear();
            }
            _ => {
                current.push(c);
            }
        }
    }

    if !current.is_empty() {
        parts.push(current);
    }

    parts
}

/// Find the position of a top-level colon in a string (not inside brackets or strings).
pub(super) fn find_top_level_colon(s: &str) -> Option<usize> {
    let mut depth = 0;
    let mut in_string: Option<char> = None;

    for (i, c) in s.char_indices() {
        if in_string.is_some() {
            if Some(c) == in_string {
                in_string = None;
            }
            continue;
        }

        match c {
            '\'' | '"' | '`' => in_string = Some(c),
            '(' | '[' | '{' => depth += 1,
            ')' | ']' | '}' => depth -= 1,
            ':' if depth == 0 => return Some(i),
            _ => {}
        }
    }

    None
}

/// Find the position of a top-level `=` in a string (not `==` or `===`).
pub(super) fn find_top_level_equals(s: &str) -> Option<usize> {
    let chars: Vec<char> = s.chars().collect();
    let mut depth = 0;
    let mut in_string: Option<char> = None;

    for (i, &c) in chars.iter().enumerate() {
        if in_string.is_some() {
            if Some(c) == in_string {
                in_string = None;
            }
            continue;
        }

        match c {
            '\'' | '"' | '`' => in_string = Some(c),
            '(' | '[' | '{' => depth += 1,
            ')' | ']' | '}' => depth -= 1,
            '=' if depth == 0 => {
                // Make sure it's not == or ===
                if i + 1 < chars.len() && chars[i + 1] == '=' {
                    continue;
                }
                // Make sure it's not != or <=, >=
                if i > 0 && matches!(chars[i - 1], '!' | '<' | '>') {
                    continue;
                }
                return Some(i);
            }
            _ => {}
        }
    }

    None
}

/// Extract the root identifier from a string like `a`, `a[0]`, `a.prop`.
pub(super) fn extract_root_identifier(s: &str) -> Option<String> {
    let s = s.trim();
    if s.is_empty() {
        return None;
    }

    // Check if it starts with an identifier character
    let first = s.chars().next()?;
    if !first.is_ascii_alphabetic() && first != '_' && first != '$' {
        return None;
    }

    let mut end = 0;
    for c in s.chars() {
        if c.is_ascii_alphanumeric() || c == '_' || c == '$' {
            end += c.len_utf8();
        } else {
            break;
        }
    }

    if end > 0 {
        Some(s[..end].to_string())
    } else {
        None
    }
}

/// Find the end of the RHS expression in a destructure assignment.
/// Handles balanced brackets, parentheses, and semicolons.
pub(super) fn find_destructure_rhs_end(statement: &str, start: usize) -> usize {
    let chars: Vec<char> = statement.chars().collect();
    let len = chars.len();
    let mut i = start;
    let mut depth = 0;
    let mut in_string: Option<char> = None;

    // Skip leading whitespace
    while i < len && chars[i].is_whitespace() {
        i += 1;
    }

    let expr_start = i;

    while i < len {
        let c = chars[i];

        if in_string.is_some() {
            if Some(c) == in_string && (i == 0 || chars[i - 1] != '\\') {
                in_string = None;
            }
            i += 1;
            continue;
        }

        match c {
            '\'' | '"' | '`' => {
                in_string = Some(c);
                i += 1;
            }
            '(' | '[' | '{' => {
                depth += 1;
                i += 1;
            }
            ')' => {
                if depth == 0 {
                    // This closing paren belongs to an outer context
                    return i;
                }
                depth -= 1;
                i += 1;
                // After closing `)` at depth 0, check if followed by `(` (function call)
                // or `[` (member access). If so, continue parsing as the expression
                // is not finished yet. E.g., `(async (...) => {...})(args)`.
                if depth == 0 {
                    // Skip whitespace
                    let mut j = i;
                    while j < len && chars[j].is_whitespace() {
                        j += 1;
                    }
                    if j < len && (chars[j] == '(' || chars[j] == '[' || chars[j] == '.') {
                        // This is a function call, member access, or property access
                        // Continue parsing
                    } else {
                        // Expression ends here
                        // But don't return - let the next iteration handle it
                    }
                }
            }
            ']' | '}' => {
                if depth == 0 {
                    return i;
                }
                depth -= 1;
                i += 1;
            }
            ';' if depth == 0 => {
                return i;
            }
            ',' if depth == 0 => {
                // Could be end of expression in sequence
                return i;
            }
            _ => {
                i += 1;
            }
        }
    }

    // If we didn't find a terminator, include everything to the end
    // but trim trailing whitespace and newlines
    let mut end = len;
    while end > expr_start && chars[end - 1].is_whitespace() {
        end -= 1;
    }
    end
}

/// Generate a member access expression for a destructuring key.
/// For computed keys like `[expr]`, generates `obj[expr]` (bracket notation).
/// For static keys like `prop`, generates `obj.prop` (dot notation).
pub(super) fn member_access(obj: &str, key: &str) -> String {
    if key.starts_with('[') && key.ends_with(']') {
        // Computed property key: obj[expr]
        // Strip the outer brackets to get the expression
        let expr = &key[1..key.len() - 1];
        format!("{}[{}]", obj, expr)
    } else {
        // Static property key: obj.prop
        format!("{}.{}", obj, key)
    }
}

/// Check if a generated code string contains `await` as a keyword (not inside string literals).
///
/// This is used to determine if a destructuring IIFE needs to be async.
/// The check is simplified since the input is compiler-generated code where
/// `await` only appears as actual await expressions.
pub(super) fn code_contains_await(code: &str) -> bool {
    let bytes = code.as_bytes();
    let len = bytes.len();
    let await_bytes = b"await";
    let await_len = await_bytes.len();

    if len < await_len {
        return false;
    }

    let mut i = 0;
    // Track string context: None = not in string, Some(quote) = in string
    let mut in_string: Option<u8> = None;
    // Stack for template literal interpolation depth tracking.
    // When we encounter `${` inside a template literal, we push the brace depth.
    // When the matching `}` is found, we pop back into the template literal.
    let mut template_depth_stack: Vec<u32> = Vec::new();
    let mut brace_depth: u32 = 0;

    while i < len {
        let c = bytes[i];

        if let Some(quote) = in_string {
            if quote == b'`' {
                // Inside template literal - check for `${` interpolation
                if c == b'$' && i + 1 < len && bytes[i + 1] == b'{' {
                    // Enter interpolation expression - push current state
                    template_depth_stack.push(brace_depth);
                    brace_depth = 0;
                    in_string = None;
                    i += 2; // skip `${`
                    continue;
                }
                // Check for end of template literal
                if c == b'`' && (i == 0 || bytes[i - 1] != b'\\') {
                    in_string = None;
                    i += 1;
                    continue;
                }
            } else {
                // Inside single or double quoted string
                if c == quote && (i == 0 || bytes[i - 1] != b'\\') {
                    in_string = None;
                    i += 1;
                    continue;
                }
            }
            // Skip content inside strings
            i += 1;
            continue;
        }

        // Not inside a string - check for string openings
        if c == b'\'' || c == b'"' || c == b'`' {
            in_string = Some(c);
            i += 1;
            continue;
        }

        // Track brace depth for template literal interpolation
        if c == b'{' {
            brace_depth += 1;
        } else if c == b'}' {
            if brace_depth == 0 && !template_depth_stack.is_empty() {
                // Closing `}` of a template interpolation - back to template literal
                brace_depth = template_depth_stack.pop().unwrap();
                in_string = Some(b'`');
                i += 1;
                continue;
            }
            brace_depth = brace_depth.saturating_sub(1);
        }

        // Check for "await" keyword with word boundaries
        if i + await_len <= len && &bytes[i..i + await_len] == await_bytes {
            // Check that it's not part of a larger identifier
            let before_ok = i == 0 || !bytes[i - 1].is_ascii_alphanumeric() && bytes[i - 1] != b'_';
            let after_ok = i + await_len >= len
                || !bytes[i + await_len].is_ascii_alphanumeric() && bytes[i + await_len] != b'_';
            if before_ok && after_ok {
                return true;
            }
        }

        i += 1;
    }

    false
}

/// Check if a string expression contains `await` as a keyword (not inside strings).
/// This is a simplified check that looks for `await` preceded by a non-identifier char
/// and followed by a non-identifier char.
pub(super) fn string_expr_has_await(s: &str) -> bool {
    string_expr_has_toplevel_await(s)
}

/// Check if a string expression has a top-level `await` keyword.
///
/// This mirrors the official compiler's `is_expression_async` which does NOT
/// recurse into nested `async` function/arrow bodies. So `(async (x) => await x)(arg)`
/// returns `false` because the `await` is inside the async arrow, not at the top level.
pub(super) fn string_expr_has_toplevel_await(s: &str) -> bool {
    let bytes = s.as_bytes();
    let len = bytes.len();
    if len < 5 {
        return false;
    }

    // We track nested depth (parens, braces, brackets combined) and maintain
    // a "min safe depth" - the depth at/below which `await` counts as top-level.
    // When we encounter an `async` keyword, we record the current depth as an
    // "async scope entry" - any `await` found at a deeper depth within that
    // async's body should be ignored.
    //
    // Strategy: when we see `async`, skip ahead past the entire async
    // function/arrow body so we never even see its internal `await` keywords.
    let mut i = 0;
    while i < len {
        // Skip string literals
        if i < len && (bytes[i] == b'\'' || bytes[i] == b'"' || bytes[i] == b'`') {
            let quote = bytes[i];
            i += 1;
            while i < len {
                if bytes[i] == b'\\' {
                    i += 2;
                    continue;
                }
                if bytes[i] == quote {
                    i += 1;
                    break;
                }
                i += 1;
            }
            continue;
        }

        // Check for `async` keyword - if found, skip past the async body
        if i + 5 <= len && &bytes[i..i + 5] == b"async" {
            let before_ok = i == 0
                || !bytes[i - 1].is_ascii_alphanumeric()
                    && bytes[i - 1] != b'_'
                    && bytes[i - 1] != b'$';
            let after_ok = i + 5 >= len
                || !bytes[i + 5].is_ascii_alphanumeric()
                    && bytes[i + 5] != b'_'
                    && bytes[i + 5] != b'$';
            if before_ok && after_ok {
                // Skip past the entire async function/arrow body
                if let Some(end) = skip_async_body(bytes, i + 5) {
                    i = end;
                    continue;
                }
            }
        }

        // Check for `await` keyword (only reached if not inside an async body)
        if i + 5 <= len && &bytes[i..i + 5] == b"await" {
            let before_ok = i == 0
                || !bytes[i - 1].is_ascii_alphanumeric()
                    && bytes[i - 1] != b'_'
                    && bytes[i - 1] != b'$';
            let after_ok = i + 5 >= len
                || !bytes[i + 5].is_ascii_alphanumeric()
                    && bytes[i + 5] != b'_'
                    && bytes[i + 5] != b'$';
            if before_ok && after_ok {
                return true;
            }
        }

        i += 1;
    }
    false
}

/// Skip past an async function/arrow body starting from the position right after `async`.
/// Returns the position after the body ends, or None if this isn't a recognizable pattern.
pub(super) fn skip_async_body(bytes: &[u8], start: usize) -> Option<usize> {
    let len = bytes.len();
    let mut i = start;

    // Skip whitespace
    while i < len && bytes[i].is_ascii_whitespace() {
        i += 1;
    }

    if i >= len {
        return None;
    }

    // Case 1: `async function ...` - skip to end of function body
    if i + 8 <= len && &bytes[i..i + 8] == b"function" {
        // Skip to the function body `{...}`
        // Find the opening `{`
        while i < len && bytes[i] != b'{' {
            i += 1;
        }
        if i >= len {
            return None;
        }
        // Skip the `{...}` block
        return Some(skip_balanced_braces(bytes, i));
    }

    // Case 2: `async (params) => body` or `async name => body`
    if bytes[i] == b'(' {
        // Skip the params `(...)`
        i = skip_balanced(bytes, i, b'(', b')');
    } else if bytes[i].is_ascii_alphabetic() || bytes[i] == b'_' || bytes[i] == b'$' {
        // Single param: `async x => ...`
        while i < len && (bytes[i].is_ascii_alphanumeric() || bytes[i] == b'_' || bytes[i] == b'$')
        {
            i += 1;
        }
    } else {
        return None;
    }

    // Skip whitespace
    while i < len && bytes[i].is_ascii_whitespace() {
        i += 1;
    }

    // Expect `=>`
    if i + 2 <= len && &bytes[i..i + 2] == b"=>" {
        i += 2;
    } else {
        return None;
    }

    // Skip whitespace
    while i < len && bytes[i].is_ascii_whitespace() {
        i += 1;
    }

    if i >= len {
        return Some(i);
    }

    // Arrow body: either `{...}` block or expression
    if bytes[i] == b'{' {
        return Some(skip_balanced_braces(bytes, i));
    }

    // Expression body: skip to end of expression (up to a comma/paren/bracket at depth 0)
    Some(skip_expression(bytes, i))
}

/// Skip a balanced `{...}` block, returning position after closing `}`.
pub(super) fn skip_balanced_braces(bytes: &[u8], start: usize) -> usize {
    skip_balanced(bytes, start, b'{', b'}')
}

/// Skip balanced brackets from start (which should be the opening bracket).
/// Returns position after the closing bracket.
pub(super) fn skip_balanced(bytes: &[u8], start: usize, open: u8, close: u8) -> usize {
    let len = bytes.len();
    let mut depth = 0;
    let mut i = start;
    let mut in_string: Option<u8> = None;

    while i < len {
        if let Some(q) = in_string {
            if bytes[i] == b'\\' {
                i += 2;
                continue;
            }
            if bytes[i] == q {
                in_string = None;
            }
            i += 1;
            continue;
        }
        if bytes[i] == b'\'' || bytes[i] == b'"' || bytes[i] == b'`' {
            in_string = Some(bytes[i]);
            i += 1;
            continue;
        }
        if bytes[i] == open {
            depth += 1;
        } else if bytes[i] == close {
            depth -= 1;
            if depth == 0 {
                return i + 1;
            }
        }
        i += 1;
    }
    len
}

/// Skip an expression (arrow body without braces). Ends at a `,`, `)`, `]`, or `}`
/// at depth 0, or at end of input.
pub(super) fn skip_expression(bytes: &[u8], start: usize) -> usize {
    let len = bytes.len();
    let mut depth = 0usize;
    let mut i = start;
    let mut in_string: Option<u8> = None;

    while i < len {
        if let Some(q) = in_string {
            if bytes[i] == b'\\' {
                i += 2;
                continue;
            }
            if bytes[i] == q {
                in_string = None;
            }
            i += 1;
            continue;
        }
        if bytes[i] == b'\'' || bytes[i] == b'"' || bytes[i] == b'`' {
            in_string = Some(bytes[i]);
            i += 1;
            continue;
        }
        match bytes[i] {
            b'(' | b'[' | b'{' => {
                depth += 1;
            }
            b')' | b']' | b'}' => {
                if depth == 0 {
                    return i;
                }
                depth -= 1;
            }
            b',' if depth == 0 => {
                return i;
            }
            _ => {}
        }
        i += 1;
    }
    len
}

/// Check if a string expression is a "simple" expression that doesn't need thunk wrapping.
///
/// Simple expressions: identifiers, literals (numbers, strings, booleans),
/// arrow functions, function expressions. Does NOT include call expressions,
/// member expressions, etc.
pub(super) fn string_is_simple_expression(s: &str) -> bool {
    let trimmed = s.trim();
    if trimmed.is_empty() {
        return false;
    }

    // Identifiers: purely alphanumeric + _ + $
    if trimmed
        .chars()
        .all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '$')
    {
        return true;
    }

    // Numeric literals
    if trimmed.parse::<f64>().is_ok() {
        return true;
    }

    // String literals
    if (trimmed.starts_with('\'') && trimmed.ends_with('\''))
        || (trimmed.starts_with('"') && trimmed.ends_with('"'))
    {
        return true;
    }

    // Boolean/null literals
    if trimmed == "true" || trimmed == "false" || trimmed == "null" || trimmed == "undefined" {
        return true;
    }

    // Arrow functions and function expressions
    if trimmed.starts_with("() =>") || trimmed.starts_with("function") {
        return true;
    }

    false
}

/// Build a `$.fallback(expression, default)` string, applying async thunk wrapping
/// when the default value contains `await`.
///
/// Mirrors the official Svelte compiler's `build_fallback()` from `utils/ast.js`:
/// 1. Simple expression (no await): `$.fallback(access, default)`
/// 2. Simple `await simple_expr`: `await $.fallback(access, simple_expr)` (unwrap await)
/// 3. Non-simple with await: `await $.fallback(access, async () => default, true)`
/// 4. Non-simple, no await: `$.fallback(access, () => default, true)`
pub(super) fn build_fallback_string(access: &str, default_val: &str) -> String {
    let trimmed = default_val.trim();

    // Case 1: Simple expression without await
    if string_is_simple_expression(trimmed) {
        return format!("$.fallback({}, {})", access, default_val);
    }

    // Case 2: `await simple_expr` - unwrap await and pass inner directly
    if let Some(inner) = trimmed.strip_prefix("await ") {
        let inner = inner.trim();
        if string_is_simple_expression(inner) {
            return format!("await $.fallback({}, {})", access, inner);
        }
    }

    // Case 3: Expression contains await -> async thunk (with unthunk optimization)
    if string_expr_has_await(trimmed) {
        // Unthunk optimization: `async () => await expr` → `() => expr`
        // when expr itself has no nested await.
        // This mirrors the official compiler's `unthunk()` function.
        if let Some(inner) = trimmed.strip_prefix("await ") {
            let inner = inner.trim();
            if !string_expr_has_await(inner) {
                // Optimized: sync thunk wrapping the non-await inner expression
                return format!("await $.fallback({}, () => {}, true)", access, inner);
            }
        }
        return format!(
            "await $.fallback({}, async () => {}, true)",
            access, default_val
        );
    }

    // Case 4: Non-simple, no await -> sync thunk
    format!("$.fallback({}, () => {}, true)", access, default_val)
}

/// Generate an IIFE for a destructure assignment.
///
/// For array patterns: `(($$value) => { var $$array = $.to_array($$value, N); target1 = $$array[0]; ... })(rhs)`
/// For object patterns: `(($$value) => { target1 = $$value.key1; ... })(rhs)`
///
/// When `is_standalone` is false (the destructure is part of a larger expression),
/// `return $$value;` is appended so the IIFE returns the value.
pub(super) fn generate_destructure_iife(
    pattern_type: char, // ']' for array, '}' for object
    pattern_str: &str,
    rhs_str: &str,
    is_standalone: bool,
    store_sub_vars: &[String],
    force_cache_rhs: bool,
) -> String {
    let trimmed = pattern_str.trim();

    // Remove outer brackets (both array `[...]` and object `{...}`)
    let inner = &trimmed[1..trimmed.len() - 1];

    let parts = split_on_commas(inner);

    if pattern_type == ']' {
        // Array destructure
        let array_name = SCRIPT_ARRAY_COUNTER.with(|c| {
            let count = c.get();
            let name = if count == 0 {
                "$$array".to_string()
            } else {
                format!("$$array_{}", count)
            };
            c.set(count + 1);
            name
        });

        // Check if last element is a rest element
        let has_rest = parts
            .last()
            .map(|p| p.trim().starts_with("..."))
            .unwrap_or(false);

        let to_array_args = if has_rest {
            "$.to_array($$value)".to_string()
        } else {
            format!("$.to_array($$value, {})", parts.len())
        };

        let mut body_lines = Vec::new();
        body_lines.push(format!("\tvar {} = {};", array_name, to_array_args));
        body_lines.push(String::new()); // blank line

        for (idx, part) in parts.iter().enumerate() {
            let part = part.trim();
            if part.is_empty() {
                continue; // Skip holes
            }

            if let Some(rest_target) = part.strip_prefix("...") {
                let rest_target = rest_target.trim();
                if rest_target.starts_with('{') && rest_target.ends_with('}') {
                    // Rest with object destructure pattern: ...{ z = 26 }
                    // Generate inline property access from .slice() result
                    let slice_expr = format!("{}.slice({})", array_name, idx);
                    let obj_inner = &rest_target[1..rest_target.len() - 1];
                    let obj_parts = split_on_commas(obj_inner);
                    for obj_part in &obj_parts {
                        let obj_part = obj_part.trim();
                        if obj_part.is_empty() {
                            continue;
                        }
                        if let Some(eq_pos) = find_top_level_equals(obj_part) {
                            let prop_name = obj_part[..eq_pos].trim();
                            let default_val = obj_part[eq_pos + 1..].trim();
                            let access = format!("{}.{}", slice_expr, prop_name);
                            let fallback = build_fallback_string(&access, default_val);
                            body_lines.push(format!("\t{} = {};", prop_name, fallback));
                        } else {
                            body_lines
                                .push(format!("\t{} = {}.{};", obj_part, slice_expr, obj_part));
                        }
                    }
                } else {
                    body_lines.push(format!(
                        "\t{} = {}.slice({});",
                        rest_target, array_name, idx
                    ));
                }
            } else {
                // Handle default value: `target = default`
                let (target, default_val) = if let Some(eq_pos) = find_top_level_equals(part) {
                    let t = part[..eq_pos].trim();
                    let d = part[eq_pos + 1..].trim();
                    (t, Some(d))
                } else {
                    (part, None)
                };

                if let Some(default_val) = default_val {
                    let access = format!("{}[{}]", array_name, idx);
                    let fallback = build_fallback_string(&access, default_val);
                    body_lines.push(format!("\t{} = {};", target, fallback));
                } else {
                    body_lines.push(format!("\t{} = {}[{}];", target, array_name, idx));
                }
            }
        }

        if !is_standalone {
            body_lines.push(String::new()); // blank line before return
            body_lines.push("\treturn $$value;".to_string());
        }

        let body = body_lines.join("\n");
        // When the IIFE body or RHS contains `await`, the arrow must be async
        // and the whole call must be `await`ed. This matches the official Svelte
        // compiler which generates `await (async ($$value) => { ... })(rhs)`.
        if code_contains_await(&body) || code_contains_await(rhs_str) {
            format!("await (async ($$value) => {{\n{}\n}})({})", body, rhs_str)
        } else {
            format!("(($$value) => {{\n{}\n}})({})", body, rhs_str)
        }
    } else {
        // Object destructure
        //
        // Optimization: when the RHS is a simple identifier and the pattern has only
        // simple targets (no defaults, no nested patterns, no rest elements), we can
        // generate a comma/sequence expression instead of an IIFE.
        // This matches the official Svelte compiler output:
        //   `({$a, $b} = obj)` → `($.store_set(a, obj.$a), $.store_set(b, obj.$b));`
        // instead of:
        //   `(($$value) => { ... })(obj);`
        let rhs_is_simple_identifier = rhs_str
            .trim()
            .chars()
            .all(|c| c.is_alphanumeric() || c == '_' || c == '$');
        // Check if all parts are "simple enough" to use direct property access instead of IIFE.
        // Allow defaults (= sign) since we can use $.fallback() with direct access.
        let all_parts_simple = !parts.is_empty()
            && parts.iter().all(|p| {
                let p = p.trim();
                if p.is_empty() {
                    return true;
                }
                // No rest elements
                if p.starts_with("...") {
                    return false;
                }
                // If key-value, target must be simple identifier (no nested patterns)
                if let Some(colon_pos) = find_top_level_colon(p) {
                    let target = p[colon_pos + 1..].trim();
                    // Check for default value in key-value pair
                    let target_without_default = if let Some(eq_pos) = find_top_level_equals(target)
                    {
                        target[..eq_pos].trim()
                    } else {
                        target
                    };
                    // No nested array/object patterns
                    if target_without_default.starts_with('[')
                        || target_without_default.starts_with('{')
                    {
                        return false;
                    }
                } else {
                    // Shorthand with default: check the name part
                    if let Some(eq_pos) = find_top_level_equals(p) {
                        let name = p[..eq_pos].trim();
                        if name.starts_with('[') || name.starts_with('{') {
                            return false;
                        }
                    }
                }
                true
            });

        if rhs_is_simple_identifier && all_parts_simple && !force_cache_rhs {
            // Generate comma/sequence expression with individual assignments.
            // When the RHS is a simple identifier (and won't be transformed to a call),
            // there's no need for caching in $$value.
            // This matches the official Svelte compiler output:
            //   `({$a, $b} = obj)` -> `($.store_set(a, obj.$a), $.store_set(b, obj.$b));`
            //   `({store1, store2} = context)` -> `(store1 = context.store1, store2 = context.store2)`
            //
            // For store sub targets: generate $.store_set() directly
            // For state var targets: generate plain assignment (downstream transforms add $.set() etc.)
            //
            // Use a single line to avoid issues with downstream transforms that treat
            // newlines as statement boundaries (find_statement_end_client).
            let mut assignments: Vec<String> = Vec::new();
            for part in &parts {
                let part = part.trim();
                if part.is_empty() {
                    continue;
                }
                let (key, target_with_default) = if let Some(colon_pos) = find_top_level_colon(part)
                {
                    (
                        part[..colon_pos].trim().to_string(),
                        part[colon_pos + 1..].trim().to_string(),
                    )
                } else {
                    // Shorthand: {x} or {x = default} means key=x
                    let name = if let Some(eq_pos) = find_top_level_equals(part) {
                        part[..eq_pos].trim().to_string()
                    } else {
                        part.to_string()
                    };
                    (name.clone(), part.to_string())
                };

                // Split target from default value
                let (target, default_val) =
                    if let Some(eq_pos) = find_top_level_equals(&target_with_default) {
                        (
                            target_with_default[..eq_pos].trim().to_string(),
                            Some(target_with_default[eq_pos + 1..].trim().to_string()),
                        )
                    } else {
                        (target_with_default.clone(), None)
                    };

                let access = format!("{}.{}", rhs_str, key);

                // Check if the target is a store subscription variable ($storeName)
                if store_sub_vars.contains(&target) && target.starts_with('$') {
                    let store_name = &target[1..]; // Remove the $ prefix
                    if let Some(default_val) = &default_val {
                        let fallback = build_fallback_string(&access, default_val);
                        assignments.push(format!("$.store_set({}, {})", store_name, fallback));
                    } else {
                        assignments.push(format!("$.store_set({}, {})", store_name, access));
                    }
                } else if let Some(default_val) = &default_val {
                    let fallback = build_fallback_string(&access, default_val);
                    assignments.push(format!("{} = {}", target, fallback));
                } else {
                    assignments.push(format!("{} = {}", target, access));
                }
            }

            if !is_standalone {
                // Part of a larger expression - need the value at the end
                assignments.push(rhs_str.to_string());
            }

            if assignments.len() == 1 {
                return format!("({})", assignments[0]);
            } else {
                // Single-line comma expression format.
                // IMPORTANT: Must be single-line because downstream processing in
                // process_accumulated/find_statement_end_client treats newlines at depth 0
                // as statement boundaries, which would break multi-line expressions.
                return format!("({})", assignments.join(", "));
            }
        }

        let mut body_lines = Vec::new();
        let mut prepend_lines: Vec<String> = Vec::new();

        for part in &parts {
            let part = part.trim();
            if part.is_empty() {
                continue;
            }

            if let Some(rest_target) = part.strip_prefix("...") {
                // Rest element: ...rest = $.exclude_from_object($$value, [keys...])
                let rest_target = rest_target.trim();
                let keys: Vec<String> = parts
                    .iter()
                    .filter(|p| !p.trim().starts_with("..."))
                    .map(|p| {
                        let p = p.trim();
                        // Extract the key name
                        if let Some(colon_pos) = find_top_level_colon(p) {
                            let key = p[..colon_pos].trim();
                            format!("'{}'", key)
                        } else {
                            // Shorthand or just identifier with possible default
                            let name = if let Some(eq_pos) = find_top_level_equals(p) {
                                p[..eq_pos].trim()
                            } else {
                                p
                            };
                            format!("'{}'", name)
                        }
                    })
                    .collect();
                body_lines.push(format!(
                    "\t{} = $.exclude_from_object($$value, [{}]);",
                    rest_target,
                    keys.join(", ")
                ));
            } else if let Some(colon_pos) = find_top_level_colon(part) {
                // Key-value pair: key: target
                let key = part[..colon_pos].trim();
                let target = part[colon_pos + 1..].trim();

                // Handle default value
                // Use member_access to handle computed property keys like [expr]
                let value_access = member_access("$$value", key);
                if let Some(eq_pos) = find_top_level_equals(target) {
                    let actual_target = target[..eq_pos].trim();
                    let default_val = target[eq_pos + 1..].trim();
                    let fallback = build_fallback_string(&value_access, default_val);
                    body_lines.push(format!("\t{} = {};", actual_target, fallback));
                } else if target.starts_with('[') && target.ends_with(']') {
                    // Nested array pattern: key: [a, b, c]
                    // Inline the array destructuring instead of creating a nested IIFE
                    let inner_parts = split_on_commas(&target[1..target.len() - 1]);
                    let array_name = SCRIPT_ARRAY_COUNTER.with(|c| {
                        let count = c.get();
                        let name = if count == 0 {
                            "$$array".to_string()
                        } else {
                            format!("$$array_{}", count)
                        };
                        c.set(count + 1);
                        name
                    });
                    // Insert the to_array call at the beginning of body_lines
                    // We use a marker to insert it at the right place later
                    let has_rest = inner_parts
                        .last()
                        .map(|p| p.trim().starts_with("..."))
                        .unwrap_or(false);
                    let to_array_args = if has_rest {
                        format!("$.to_array({})", value_access)
                    } else {
                        format!("$.to_array({}, {})", value_access, inner_parts.len())
                    };
                    // We need to insert the var declaration before the assignments
                    // Store it as a "prepend" item
                    prepend_lines.push(format!("\tvar {} = {};", array_name, to_array_args));

                    for (idx, inner_part) in inner_parts.iter().enumerate() {
                        let inner_part = inner_part.trim();
                        if inner_part.is_empty() {
                            continue;
                        }
                        if let Some(rest_target) = inner_part.strip_prefix("...") {
                            body_lines.push(format!(
                                "\t{} = {}.slice({});",
                                rest_target.trim(),
                                array_name,
                                idx
                            ));
                        } else if let Some(eq_pos) = find_top_level_equals(inner_part) {
                            let actual_target = inner_part[..eq_pos].trim();
                            let default_val = inner_part[eq_pos + 1..].trim();
                            let access = format!("{}[{}]", array_name, idx);
                            let fallback = build_fallback_string(&access, default_val);
                            body_lines.push(format!("\t{} = {};", actual_target, fallback));
                        } else {
                            body_lines.push(format!("\t{} = {}[{}];", inner_part, array_name, idx));
                        }
                    }
                } else {
                    body_lines.push(format!("\t{} = {};", target, value_access));
                }
            } else {
                // Shorthand: {x} means key=x, target=x
                let name = if let Some(eq_pos) = find_top_level_equals(part) {
                    let actual_name = part[..eq_pos].trim();
                    let default_val = part[eq_pos + 1..].trim();
                    let access = format!("$$value.{}", actual_name);
                    let fallback = build_fallback_string(&access, default_val);
                    body_lines.push(format!("\t{} = {};", actual_name, fallback));
                    continue;
                } else {
                    part
                };

                body_lines.push(format!("\t{} = $$value.{};", name, name));
            }
        }

        // Prepend array destructure declarations before assignments
        if !prepend_lines.is_empty() {
            prepend_lines.push(String::new()); // blank line after declarations
            let mut all_lines = prepend_lines;
            all_lines.extend(body_lines);
            body_lines = all_lines;
        }

        if !is_standalone {
            body_lines.push(String::new()); // blank line before return
            body_lines.push("\treturn $$value;".to_string());
        }

        let body = body_lines.join("\n");
        // When the IIFE body or RHS contains `await`, the arrow must be async
        // and the whole call must be `await`ed.
        if code_contains_await(&body) || code_contains_await(rhs_str) {
            format!("await (async ($$value) => {{\n{}\n}})({})", body, rhs_str)
        } else {
            format!("(($$value) => {{\n{}\n}})({})", body, rhs_str)
        }
    }
}

/// Transform member expression assignments to `$.mutate()` calls in legacy mode.
///
/// Detects patterns at any nesting level (including inside function bodies) like:
/// - `var.prop = expr` -> `$.mutate(var, var.prop = expr)`
/// - `var[idx] = expr` -> `$.mutate(var, var[idx] = expr)`
///
/// Only applies when the base of the member expression is a state variable in
/// non-runes (legacy) mode.
///
/// The subsequent `wrap_state_vars_in_expr` call will handle `$.get()` wrapping
/// inside the mutation expression (the `in_mutate_first_arg` guard in that
/// function ensures the first argument of `$.mutate()` is NOT double-wrapped).
/// Walk backward from `pos` in `chars` to find any enclosing function or arrow
/// function parameter list. If any such enclosing function has a parameter whose
/// identifier matches `var`, return true (the identifier at `pos` is shadowed).
///
/// This is a best-effort text-level scope check for the legacy-mode member-mutation
/// transform. It does NOT try to understand full JS scoping — it only checks direct
/// function parameters of functions that currently wrap `pos`.
fn is_var_shadowed_by_enclosing_param(chars: &[char], pos: usize, var: &str) -> bool {
    // Walk backward from `pos` tracking brace/paren depth. Each time we cross an
    // unmatched `{` or `(` going backward, we've entered an outer scope. After
    // exiting a `{` (i.e. we're now just before it), peek backward to see if this
    // brace opens a function body, and if so inspect its parameter list.
    let mut i = pos;
    let mut brace_depth = 0i32; // `}` seen but not yet matched (positive => we're inside an outer block)
    let mut paren_depth = 0i32;
    let mut bracket_depth = 0i32;
    let mut in_string: Option<char> = None;

    while i > 0 {
        i -= 1;
        let c = chars[i];

        // Crude string handling (scanning backward is imprecise, but good enough for
        // well-formed code).
        if let Some(q) = in_string {
            if c == q {
                let escaped = {
                    let mut bs = 0;
                    let mut j = i;
                    while j > 0 && chars[j - 1] == '\\' {
                        bs += 1;
                        j -= 1;
                    }
                    bs % 2 == 1
                };
                if !escaped {
                    in_string = None;
                }
            }
            continue;
        }
        if c == '\'' || c == '"' || c == '`' {
            in_string = Some(c);
            continue;
        }

        match c {
            '}' => brace_depth += 1,
            '{' => {
                if brace_depth == 0 {
                    // We've found a `{` that opens an outer block containing `pos`.
                    // Check if this is a function body: look backward past whitespace
                    // and any `=>` for a `)` that closes a parameter list.
                    if let Some((params_start, params_end)) =
                        find_function_params_before_brace(chars, i)
                    {
                        let params_text: String =
                            chars[params_start + 1..params_end].iter().collect();
                        if param_list_contains(&params_text, var) {
                            return true;
                        }
                    }
                    // Continue walking outward past this brace.
                } else {
                    brace_depth -= 1;
                }
            }
            ')' => paren_depth += 1,
            '(' => {
                if paren_depth == 0 {
                    // We're inside an unmatched `(` going backward — this might be
                    // a function parameter list for an arrow expression like
                    // `(iframe) => iframe.style...`. Check the text between `(` and
                    // the matching `)` ahead for a parameter named `var`.
                    let params_start = i;
                    // Find matching `)` by scanning forward
                    let mut depth = 0i32;
                    let mut j = i + 1;
                    let mut in_s: Option<char> = None;
                    let mut params_end: Option<usize> = None;
                    while j < chars.len() {
                        let cj = chars[j];
                        if let Some(q) = in_s {
                            if cj == q {
                                in_s = None;
                            }
                            j += 1;
                            continue;
                        }
                        if cj == '\'' || cj == '"' || cj == '`' {
                            in_s = Some(cj);
                            j += 1;
                            continue;
                        }
                        match cj {
                            '(' | '[' | '{' => depth += 1,
                            ')' => {
                                if depth == 0 {
                                    params_end = Some(j);
                                    break;
                                }
                                depth -= 1;
                            }
                            ']' | '}' => depth -= 1,
                            _ => {}
                        }
                        j += 1;
                    }
                    if let Some(pe) = params_end {
                        // Check if this is followed (after whitespace) by `=>` — then
                        // it IS an arrow function param list.
                        let mut k = pe + 1;
                        while k < chars.len() && chars[k].is_whitespace() {
                            k += 1;
                        }
                        // Skip optional return type annotation `: Type` — scan until `=>`
                        // or end of statement.
                        let is_arrow =
                            k + 1 < chars.len() && chars[k] == '=' && chars[k + 1] == '>';
                        // Or `: ... =>` — look for `=>` before a statement terminator
                        let is_arrow_with_type = !is_arrow && {
                            let mut d = 0i32;
                            let mut found = false;
                            let mut kk = k;
                            while kk + 1 < chars.len() {
                                let ch = chars[kk];
                                match ch {
                                    '(' | '[' | '{' => d += 1,
                                    ')' | ']' | '}' => {
                                        if d == 0 {
                                            break;
                                        }
                                        d -= 1;
                                    }
                                    ';' | ',' if d == 0 => break,
                                    '=' if d == 0 && chars[kk + 1] == '>' => {
                                        found = true;
                                        break;
                                    }
                                    _ => {}
                                }
                                kk += 1;
                            }
                            found
                        };
                        if is_arrow || is_arrow_with_type {
                            let params_text: String = chars[params_start + 1..pe].iter().collect();
                            if param_list_contains(&params_text, var) {
                                return true;
                            }
                        }
                    }
                    // Don't stop — continue outward.
                } else {
                    paren_depth -= 1;
                }
            }
            ']' => bracket_depth += 1,
            '[' => {
                if bracket_depth > 0 {
                    bracket_depth -= 1;
                }
            }
            _ => {}
        }
    }

    false
}

/// Given the index of an opening brace `{`, look backward to see if it opens a
/// function body. A function body is recognized by the pattern `...)  => {`
/// (arrow with body) or `...)  {` (function declaration / method). Returns the
/// `(`..`)` range of the parameter list if found.
fn find_function_params_before_brace(chars: &[char], brace_idx: usize) -> Option<(usize, usize)> {
    // Walk backward skipping whitespace and an optional `=>`
    let mut i = brace_idx;
    while i > 0 {
        i -= 1;
        if chars[i].is_whitespace() {
            continue;
        }
        break;
    }
    // Optional `>` of `=>`
    if chars[i] == '>' && i > 0 && chars[i - 1] == '=' {
        i = i.saturating_sub(2);
        while i > 0 && chars[i].is_whitespace() {
            i -= 1;
        }
    }
    // Optional return type annotation: `: Type` — handle simple identifiers
    // (heuristic: skip back over identifier chars and a `:`).
    // Actually we may also have `...)  : Type  => {`. Already handled `=>` above,
    // so scan back skipping non-`)` characters until we hit `)` or give up.
    // To keep it simple and safe, we only skip if we're currently on `)`.
    if chars[i] != ')' {
        // Try to skip a type annotation: scan back over identifier/dot/angle/space/colon
        let mut j = i;
        let mut ok = false;
        while j > 0 {
            let c = chars[j];
            if c == ')' {
                ok = true;
                break;
            }
            if c.is_alphanumeric()
                || c == '_'
                || c == '$'
                || c == '.'
                || c == '<'
                || c == '>'
                || c == ','
                || c == ' '
                || c == '\t'
                || c == '|'
                || c == '&'
                || c == ':'
                || c == '['
                || c == ']'
                || c == '?'
            {
                j -= 1;
                continue;
            }
            break;
        }
        if ok {
            i = j;
        } else {
            return None;
        }
    }
    if chars[i] != ')' {
        return None;
    }
    let params_end = i;
    // Find matching `(` backward
    let mut depth = 0i32;
    let mut j = params_end;
    while j > 0 {
        j -= 1;
        let c = chars[j];
        match c {
            ')' | ']' | '}' => depth += 1,
            '(' => {
                if depth == 0 {
                    return Some((j, params_end));
                }
                depth -= 1;
            }
            '[' | '{' => {
                if depth > 0 {
                    depth -= 1;
                }
            }
            _ => {}
        }
    }
    None
}

/// Return true if `params_text` (the text inside the outer `(...)` of a parameter
/// list) declares a parameter whose identifier name is exactly `var`.
fn param_list_contains(params_text: &str, var: &str) -> bool {
    // Split on top-level commas
    let mut depth = 0i32;
    let mut in_string: Option<char> = None;
    let mut current = String::new();
    let mut parts: Vec<String> = Vec::new();
    for c in params_text.chars() {
        if let Some(q) = in_string {
            if c == q {
                in_string = None;
            }
            current.push(c);
            continue;
        }
        match c {
            '\'' | '"' | '`' => {
                in_string = Some(c);
                current.push(c);
            }
            '(' | '[' | '{' | '<' => {
                depth += 1;
                current.push(c);
            }
            ')' | ']' | '}' | '>' => {
                depth -= 1;
                current.push(c);
            }
            ',' if depth == 0 => {
                parts.push(std::mem::take(&mut current));
            }
            _ => current.push(c),
        }
    }
    if !current.trim().is_empty() {
        parts.push(current);
    }
    for part in parts {
        let p = part.trim();
        // Strip leading `...` rest parameter marker
        let p = p.strip_prefix("...").unwrap_or(p);
        // Extract leading identifier (up to `:`, `=`, whitespace, or punctuation).
        let mut name = String::new();
        for ch in p.chars() {
            if ch.is_alphanumeric() || ch == '_' || ch == '$' {
                name.push(ch);
            } else {
                break;
            }
        }
        if name == var {
            return true;
        }
    }
    false
}

pub(super) fn transform_member_mutations(
    line: &str,
    state_vars: &[String],
    non_reactive_state_vars: &[String],
    raw_state_vars: &[String],
) -> String {
    if state_vars.is_empty() {
        return line.to_string();
    }

    // Quick pre-check: if none of the reactive state variable names appear as identifiers
    // in the line, skip expensive transforms.
    // Uses O(text_len) identifier extraction instead of O(N*text_len) substring search.
    {
        let reactive_vars: FxHashSet<&str> = state_vars
            .iter()
            .filter(|v| !non_reactive_state_vars.contains(v) && !raw_state_vars.contains(v))
            .map(|v| v.as_str())
            .collect();
        if !super::utils::text_contains_any_identifier(line, &reactive_vars) {
            return line.to_string();
        }
    }

    // Use the character-scanning approach from transform_state_member_mutations
    // to find member mutations at any nesting level (including inside function bodies).
    let mut result = line.to_string();

    for var in state_vars {
        // Skip non-reactive and raw state vars
        if non_reactive_state_vars.contains(var) || raw_state_vars.contains(var) {
            continue;
        }

        let var_chars: Vec<char> = var.chars().collect();
        let var_len = var_chars.len();

        let mut new_result = String::new();
        let chars: Vec<char> = result.chars().collect();
        let mut i = 0;
        let mut in_string: Option<char> = None;
        let mut in_line_comment = false;
        let mut in_block_comment = false;

        while i < chars.len() {
            let c = chars[i];

            // Handle line comments
            if in_line_comment {
                new_result.push(c);
                if c == '\n' {
                    in_line_comment = false;
                }
                i += 1;
                continue;
            }
            // Handle block comments
            if in_block_comment {
                new_result.push(c);
                if c == '*' && i + 1 < chars.len() && chars[i + 1] == '/' {
                    new_result.push('/');
                    i += 2;
                    in_block_comment = false;
                } else {
                    i += 1;
                }
                continue;
            }
            // Detect comment start
            if in_string.is_none() && c == '/' && i + 1 < chars.len() {
                if chars[i + 1] == '/' {
                    in_line_comment = true;
                    new_result.push(c);
                    i += 1;
                    continue;
                } else if chars[i + 1] == '*' {
                    in_block_comment = true;
                    new_result.push(c);
                    i += 1;
                    continue;
                }
            }

            // Handle string boundaries
            if in_string.is_none() {
                if c == '\'' || c == '"' || c == '`' {
                    in_string = Some(c);
                    new_result.push(c);
                    i += 1;
                    continue;
                }
            } else if Some(c) == in_string {
                // Check for escape
                let escaped = i > 0 && {
                    let mut backslash_count = 0;
                    let mut j = i - 1;
                    while chars[j] == '\\' {
                        backslash_count += 1;
                        if j == 0 {
                            break;
                        }
                        j -= 1;
                    }
                    backslash_count % 2 == 1
                };
                if !escaped {
                    in_string = None;
                }
                new_result.push(c);
                i += 1;
                continue;
            }
            if in_string.is_some() {
                new_result.push(c);
                i += 1;
                continue;
            }

            // Try to match the state var at position i
            if i + var_len <= chars.len() {
                let potential: String = chars[i..i + var_len].iter().collect();
                if potential == *var {
                    let before_ok = i == 0 || !is_identifier_char(chars[i - 1]);
                    let after_ok = i + var_len < chars.len()
                        && (chars[i + var_len] == '[' || chars[i + var_len] == '.');
                    // Check it's not already after `$.get(` or `$.mutate(` or $.set(
                    let already_wrapped = {
                        let prefix_len = "$.get(".len();
                        i >= prefix_len && {
                            let prefix: String = chars[i - prefix_len..i].iter().collect();
                            prefix == "$.get("
                        }
                    } || {
                        let prefix_len = "$.mutate(".len();
                        i >= prefix_len && {
                            let prefix: String = chars[i - prefix_len..i].iter().collect();
                            prefix == "$.mutate("
                        }
                    } || {
                        // Check if preceded by dot (member access of something else)
                        i > 0 && chars[i - 1] == '.'
                    };

                    // Scope-awareness: skip this mutation if `var` is shadowed by a
                    // parameter of an enclosing function/arrow function. This handles
                    // e.g. `let iframe = $state(...)` being shadowed by a callback
                    // parameter `(iframe: HTMLIFrameElement) => { iframe.style... }`.
                    let shadowed_by_param = !already_wrapped
                        && before_ok
                        && after_ok
                        && is_var_shadowed_by_enclosing_param(&chars, i, var);

                    if before_ok && after_ok && !already_wrapped && !shadowed_by_param {
                        // Scan forward to find the full member expression LHS and the `=` sign
                        let member_start = i + var_len;
                        let mut j = member_start;
                        let mut depth = 0i32;
                        let mut eq_pos = None;
                        let mut scan_in_string: Option<char> = None;

                        while j < chars.len() {
                            let ch = chars[j];

                            // Handle strings inside the member expression
                            if let Some(s) = scan_in_string {
                                if ch == s {
                                    scan_in_string = None;
                                }
                                j += 1;
                                continue;
                            }
                            if ch == '\'' || ch == '"' || ch == '`' {
                                scan_in_string = Some(ch);
                                j += 1;
                                continue;
                            }

                            match ch {
                                '[' | '(' => {
                                    depth += 1;
                                    j += 1;
                                }
                                ']' | ')' => {
                                    if depth == 0 {
                                        break;
                                    }
                                    depth -= 1;
                                    j += 1;
                                }
                                '{' => {
                                    if depth == 0 {
                                        break;
                                    }
                                    depth += 1;
                                    j += 1;
                                }
                                '}' => {
                                    if depth == 0 {
                                        break;
                                    }
                                    depth -= 1;
                                    j += 1;
                                }
                                // Semicolons at depth 0 are statement boundaries
                                // - stop scanning for `=` signs.
                                ';' if depth == 0 => {
                                    break;
                                }
                                '=' if depth == 0 => {
                                    let is_double_eq = j + 1 < chars.len() && chars[j + 1] == '=';
                                    let is_comparison =
                                        j > 0 && matches!(chars[j - 1], '!' | '<' | '>' | '=');
                                    if !is_double_eq && !is_comparison {
                                        eq_pos = Some(j);
                                    }
                                    break;
                                }
                                _ => {
                                    j += 1;
                                }
                            }
                        }

                        if let Some(eq_idx) = eq_pos {
                            // Determine the full assignment operator
                            let prev_char = if eq_idx > member_start {
                                Some(chars[eq_idx - 1])
                            } else {
                                None
                            };
                            let (assign_op, op_start) = match prev_char {
                                Some('+') => ("+=", eq_idx - 1),
                                Some('-') => ("-=", eq_idx - 1),
                                Some('*') => {
                                    if eq_idx >= member_start + 2 && chars[eq_idx - 2] == '*' {
                                        ("**=", eq_idx - 2)
                                    } else {
                                        ("*=", eq_idx - 1)
                                    }
                                }
                                Some('/') => ("/=", eq_idx - 1),
                                Some('%') => ("%=", eq_idx - 1),
                                Some('&') => {
                                    if eq_idx >= member_start + 2 && chars[eq_idx - 2] == '&' {
                                        ("&&=", eq_idx - 2)
                                    } else {
                                        ("&=", eq_idx - 1)
                                    }
                                }
                                Some('|') => {
                                    if eq_idx >= member_start + 2 && chars[eq_idx - 2] == '|' {
                                        ("||=", eq_idx - 2)
                                    } else {
                                        ("|=", eq_idx - 1)
                                    }
                                }
                                Some('^') => ("^=", eq_idx - 1),
                                Some('?') => {
                                    if eq_idx >= member_start + 2 && chars[eq_idx - 2] == '?' {
                                        ("??=", eq_idx - 2)
                                    } else {
                                        ("=", eq_idx)
                                    }
                                }
                                _ => ("=", eq_idx),
                            };

                            let member_part: String =
                                chars[member_start..op_start].iter().collect();
                            let member_part = member_part.trim_end();

                            // Find end of RHS
                            let rhs_start = eq_idx + 1;
                            let mut rhs_end = chars.len();
                            let mut rhs_j = rhs_start;
                            let mut rhs_depth = 0i32;
                            let mut rhs_in_string: Option<char> = None;
                            while rhs_j < chars.len() {
                                let rc = chars[rhs_j];
                                if let Some(s) = rhs_in_string {
                                    if rc == s {
                                        rhs_in_string = None;
                                    }
                                    rhs_j += 1;
                                    continue;
                                }
                                match rc {
                                    '\'' | '"' | '`' => {
                                        rhs_in_string = Some(rc);
                                        rhs_j += 1;
                                    }
                                    '(' | '[' | '{' => {
                                        rhs_depth += 1;
                                        rhs_j += 1;
                                    }
                                    ')' | ']' | '}' => {
                                        if rhs_depth == 0 {
                                            rhs_end = rhs_j;
                                            break;
                                        }
                                        rhs_depth -= 1;
                                        rhs_j += 1;
                                    }
                                    ';' if rhs_depth == 0 => {
                                        rhs_end = rhs_j;
                                        break;
                                    }
                                    _ => {
                                        rhs_j += 1;
                                    }
                                }
                            }

                            let rhs: String = chars[rhs_start..rhs_end].iter().collect();
                            let rhs = rhs.trim();

                            if !rhs.is_empty() {
                                let mutate_expr = format!(
                                    "$.mutate({}, {}{} {} {})",
                                    var, var, member_part, assign_op, rhs
                                );
                                new_result.push_str(&mutate_expr);
                                i = rhs_end;
                                continue;
                            }
                        }
                    }
                }
            }

            new_result.push(c);
            i += 1;
        }

        result = new_result;
    }

    result
}
