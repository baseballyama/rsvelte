//! Legacy transformation functions for server-side rendering.
//!
//! This module contains functions that handle legacy (non-runes) mode transformations
//! for server-side code generation, including `export let` declarations, reactive
//! `$:` statements, and related helper utilities.

/// Check if an export let declaration value appears to be syntactically complete.
/// Returns true if the expression doesn't need a continuation line.
fn export_let_declaration_seems_complete(decl: &str) -> bool {
    // Check for unbalanced braces/parens - if unbalanced, definitely incomplete
    let mut paren_depth: i32 = 0;
    let mut bracket_depth: i32 = 0;
    let mut brace_depth: i32 = 0;
    let mut in_string = false;
    let mut string_char = ' ';

    for c in decl.chars() {
        if (c == '"' || c == '\'' || c == '`') && !in_string {
            in_string = true;
            string_char = c;
        } else if in_string && c == string_char {
            in_string = false;
        } else if !in_string {
            match c {
                '(' => paren_depth += 1,
                ')' => paren_depth -= 1,
                '[' => bracket_depth += 1,
                ']' => bracket_depth -= 1,
                '{' => brace_depth += 1,
                '}' => brace_depth -= 1,
                _ => {}
            }
        }
    }

    // If any depth is non-zero, definitely incomplete
    if paren_depth != 0 || bracket_depth != 0 || brace_depth != 0 || in_string {
        return false;
    }

    // If there's an assignment, the right side should be complete
    // Check for trailing operators that would require continuation
    let trimmed = decl.trim();
    if trimmed.ends_with('+')
        || trimmed.ends_with('-')
        || trimmed.ends_with('*')
        || trimmed.ends_with('/')
        || trimmed.ends_with('%')
        || trimmed.ends_with('&')
        || trimmed.ends_with('|')
        || trimmed.ends_with('^')
        || trimmed.ends_with('?')
        || trimmed.ends_with("&&")
        || trimmed.ends_with("||")
        || trimmed.ends_with("=>")
        || trimmed.ends_with('=')
        || trimmed.ends_with(',')
    {
        return false;
    }

    // If balanced and doesn't end with an operator, it seems complete
    true
}

/// Transform `export let` declarations for server-side rendering (legacy/non-runes mode).
pub(crate) fn transform_export_let_declarations(script: &str) -> String {
    let mut result = String::new();
    let mut lines = script.lines().peekable();

    while let Some(line) = lines.next() {
        let trimmed = line.trim();

        if trimmed.starts_with("export let ") || trimmed.starts_with("export var ") {
            let rest = &trimmed[11..];

            let mut full_declaration = rest.to_string();
            // Only continue reading if the expression appears incomplete (unbalanced braces/parens)
            // AND doesn't look like a valid complete statement.
            // This handles `export let x = 'value'` (no semicolon) correctly - it's complete
            // on its own and shouldn't consume the next line.
            while !full_declaration.contains(';') && lines.peek().is_some() {
                // Check if the current line looks like a complete expression
                // A simple expression (identifier, string, number, etc.) is complete
                if export_let_declaration_seems_complete(&full_declaration) {
                    // Also peek to see if the next line would be a continuation
                    // (e.g., starts with '.' for method chains, or '&&', '||', etc.)
                    let next_continues = lines.peek().is_some_and(|next| {
                        let next_trimmed = next.trim();
                        next_trimmed.starts_with('.')
                            || next_trimmed.starts_with("&&")
                            || next_trimmed.starts_with("||")
                            || next_trimmed.starts_with('?')
                            || next_trimmed.starts_with(':')
                            || next_trimmed.starts_with('+')
                            || next_trimmed.starts_with('-')
                    });
                    if !next_continues {
                        break;
                    }
                }
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

pub(crate) fn is_no_arg_function_call(value: &str) -> Option<&str> {
    let trimmed = value.trim();
    if let Some(fn_name) = trimmed.strip_suffix("()")
        && is_simple_identifier(fn_name)
    {
        return Some(fn_name);
    }
    None
}

pub(crate) fn is_simple_default_value(value: &str) -> bool {
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

/// Reorder legacy reactive `$:` statements in SSR script to appear after all other
/// script declarations (function declarations, variable declarations, function calls).
///
/// In the official Svelte compiler, reactive `$:` statements in SSR mode are placed
/// AFTER all other script content because reactive computed values should run after
/// all initialization code.
///
/// This function moves `$:` statement lines/blocks to the end of the script content.
pub(crate) fn reorder_reactive_statements_after_functions(script: &str) -> String {
    let lines: Vec<&str> = script.lines().collect();

    // Check if there are any $: statements and any function declarations
    let has_reactive = lines.iter().any(|l| l.trim().starts_with("$:"));
    let has_functions = lines.iter().any(|l| l.trim().starts_with("function "));

    if !has_reactive || !has_functions {
        return script.to_string();
    }

    // Separate lines into: non-reactive (including functions) and reactive
    let mut non_reactive_lines: Vec<&str> = Vec::new();
    let mut reactive_lines: Vec<Vec<&str>> = Vec::new();

    let mut i = 0;
    while i < lines.len() {
        let line = lines[i];
        let trimmed = line.trim();

        if trimmed.starts_with("$:") {
            // Collect the full reactive statement (possibly multi-line block)
            let after = trimmed.strip_prefix("$:").unwrap_or("").trim();
            let mut stmt_lines = vec![line];

            if after.starts_with('{') && !after.ends_with('}') {
                // Multi-line block - collect until matching '}'
                i += 1;
                let mut depth = after.chars().filter(|&c| c == '{').count() as i32
                    - after.chars().filter(|&c| c == '}').count() as i32;
                while i < lines.len() && depth > 0 {
                    let next = lines[i];
                    stmt_lines.push(next);
                    depth += next.chars().filter(|&c| c == '{').count() as i32
                        - next.chars().filter(|&c| c == '}').count() as i32;
                    i += 1;
                }
            } else {
                i += 1;
            }

            reactive_lines.push(stmt_lines);
        } else {
            non_reactive_lines.push(line);
            i += 1;
        }
    }

    // Build result: all non-reactive lines first, then reactive statements at the end
    let mut result = String::new();

    for line in &non_reactive_lines {
        result.push_str(line);
        result.push('\n');
    }

    // Append reactive statements at the end
    result.push('\n');
    for stmt in &reactive_lines {
        for stmt_line in stmt {
            result.push_str(stmt_line);
            result.push('\n');
        }
    }

    // Remove trailing newline
    if result.ends_with('\n') {
        result.pop();
    }

    result
}
