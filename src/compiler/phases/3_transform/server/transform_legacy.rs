//! Legacy transformation functions for server-side rendering.
//!
//! This module contains functions that handle legacy (non-runes) mode transformations
//! for server-side code generation, including `export let` declarations, reactive
//! `$:` statements, and related helper utilities.

/// Check if the declaration string contains a semicolon at depth 0 (not inside braces/parens/brackets).
/// This is used to determine if an export let declaration is complete.
fn has_top_level_semicolon(s: &str) -> bool {
    let chars: Vec<char> = s.chars().collect();
    let mut i = 0;
    let mut paren_depth: i32 = 0;
    let mut bracket_depth: i32 = 0;
    let mut brace_depth: i32 = 0;
    let mut in_string = false;
    let mut string_char = ' ';

    while i < chars.len() {
        let c = chars[i];
        if in_string {
            if c == '\\' {
                // Skip the escaped character
                i += 2;
                continue;
            } else if c == string_char {
                in_string = false;
            }
        } else if c == '"' || c == '\'' || c == '`' {
            in_string = true;
            string_char = c;
        } else {
            match c {
                '(' => paren_depth += 1,
                ')' => paren_depth -= 1,
                '[' => bracket_depth += 1,
                ']' => bracket_depth -= 1,
                '{' => brace_depth += 1,
                '}' => brace_depth -= 1,
                ';' if paren_depth == 0 && bracket_depth == 0 && brace_depth == 0 => {
                    return true;
                }
                _ => {}
            }
        }
        i += 1;
    }
    false
}

/// Check if an export let declaration value appears to be syntactically complete.
/// Returns true if the expression doesn't need a continuation line.
fn export_let_declaration_seems_complete(decl: &str) -> bool {
    // The `decl` is the entire declarator text after `export let `, e.g. `x = 42` or `x = [1, 2`.
    // First, check if brackets/parens/braces are balanced - if unbalanced, definitely incomplete.
    let chars: Vec<char> = decl.chars().collect();
    let mut i = 0;
    let mut paren_depth: i32 = 0;
    let mut bracket_depth: i32 = 0;
    let mut brace_depth: i32 = 0;
    let mut in_string = false;
    let mut string_char = ' ';

    while i < chars.len() {
        let c = chars[i];
        if in_string {
            if c == '\\' {
                // Skip the escaped character
                i += 2;
                continue;
            } else if c == string_char {
                in_string = false;
            }
        } else if c == '"' || c == '\'' || c == '`' {
            in_string = true;
            string_char = c;
        } else {
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
        i += 1;
    }

    // If any depth is non-zero, definitely incomplete
    if paren_depth != 0 || bracket_depth != 0 || brace_depth != 0 || in_string {
        return false;
    }

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

    // If balanced and doesn't end with an operator, it seems complete.
    // This is true for any declarator like `x = 42`, `x = 'hello'`, `x = [1,2,3]`, etc.
    // The bracket balance check above already covers the main case where we'd need to continue.
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
            while !has_top_level_semicolon(&full_declaration) && lines.peek().is_some() {
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

            // Check if the default value is a store accessor (starts with $ and is a simple identifier)
            // Store accessors need lazy evaluation since they call $.store_get() which is side-effectful
            let is_store_accessor = default_value.starts_with('$')
                && is_simple_identifier(default_value)
                && default_value.len() > 1; // Not just "$"

            let transformed_default = if is_store_accessor {
                // Store accessor: wrap as lazy thunk, will be converted to $.store_get(...) by transform_store_refs_in_script
                format!(
                    "let {} = $.fallback($$props['{}'], () => {}, true);",
                    name, name, default_value
                )
            } else if is_simple_default_value(default_value) {
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
                // Wrap object literals with () to disambiguate from block statements
                // Arrays, template literals, function calls etc. don't need wrapping
                let wrapped_value = if default_value.trim_start().starts_with('{') {
                    format!("({})", default_value)
                } else {
                    default_value.to_string()
                };
                format!(
                    "let {} = $.fallback($$props['{}'], () => {}, true);",
                    name, name, wrapped_value
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

    // Note: backtick template literals are TemplateLiteral AST nodes (not Literal), so they
    // are NOT simple by the official Svelte compiler's definition.
    for quote in &['"', '\''] {
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
/// Returns a `let` declaration with variables in topological dependency order
/// (dependencies before dependents), matching the official Svelte compiler output.
pub(crate) fn extract_legacy_reactive_var_declaration(script: &str) -> String {
    let mut declared_vars: std::collections::HashSet<String> = std::collections::HashSet::new();

    for line in script.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with("$:") {
            continue;
        }
        collect_declared_vars(trimmed, &mut declared_vars);
    }

    // Collect reactive statements (each as a single string for now; multi-line not supported here)
    let mut reactive_stmts: Vec<String> = Vec::new();

    for line in script.lines() {
        let trimmed = line.trim();
        if !trimmed.starts_with("$:") {
            continue;
        }
        reactive_stmts.push(trimmed.to_string());
    }

    if reactive_stmts.is_empty() {
        return String::new();
    }

    // Determine which vars each reactive stmt declares and which it uses.
    // Build a dependency graph and topologically sort the stmts.
    let n = reactive_stmts.len();
    let mut stmt_declared: Vec<Vec<String>> = Vec::new();
    let mut stmt_used: Vec<Vec<String>> = Vec::new();

    for stmt in &reactive_stmts {
        let mut vars = Vec::new();
        let after_label = stmt[2..].trim();
        let after_label = after_label.trim_end_matches(';').trim();
        let unwrapped = if after_label.starts_with('(') && after_label.ends_with(')') {
            after_label[1..after_label.len() - 1].trim()
        } else {
            after_label
        };
        if let Some(eq_pos) = find_assignment_eq(unwrapped) {
            let lhs = unwrapped[..eq_pos].trim();
            extract_identifiers_from_pattern(lhs, &mut vars, &declared_vars);
        }
        stmt_declared.push(vars);

        // Collect identifiers used on the RHS
        stmt_used.push(extract_reactive_rhs_identifiers(stmt));
    }

    // Build var -> stmt index map
    let mut var_to_stmt: std::collections::HashMap<String, usize> =
        std::collections::HashMap::new();
    for (i, decls) in stmt_declared.iter().enumerate() {
        for decl in decls {
            var_to_stmt.insert(decl.clone(), i);
        }
    }

    // Build deps: stmt i depends on stmt j if i uses a var declared by j
    let mut deps: Vec<Vec<usize>> = vec![Vec::new(); n];
    for (i, uses) in stmt_used.iter().enumerate() {
        for var in uses {
            if let Some(&j) = var_to_stmt.get(var)
                && j != i
            {
                deps[i].push(j);
            }
        }
    }

    // Topological sort (DFS post-order = dependencies first)
    fn topo_visit_decl(
        idx: usize,
        deps: &[Vec<usize>],
        visited: &mut Vec<bool>,
        in_progress: &mut Vec<bool>,
        sorted: &mut Vec<usize>,
    ) {
        if visited[idx] || in_progress[idx] {
            return;
        }
        in_progress[idx] = true;
        for &dep in &deps[idx] {
            topo_visit_decl(dep, deps, visited, in_progress, sorted);
        }
        in_progress[idx] = false;
        visited[idx] = true;
        sorted.push(idx);
    }

    let mut sorted_indices: Vec<usize> = Vec::new();
    let mut visited = vec![false; n];
    let mut in_progress = vec![false; n];
    for i in 0..n {
        topo_visit_decl(
            i,
            &deps,
            &mut visited,
            &mut in_progress,
            &mut sorted_indices,
        );
    }

    // Collect declared vars in topological order (deduplicating)
    let mut seen: std::collections::HashSet<String> = std::collections::HashSet::new();
    let mut reactive_vars: Vec<String> = Vec::new();
    for &idx in &sorted_indices {
        for var in &stmt_declared[idx] {
            if seen.insert(var.clone()) {
                reactive_vars.push(var.clone());
            }
        }
    }

    if reactive_vars.is_empty() {
        return String::new();
    }

    format!(
        "\tlet {};",
        reactive_vars
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
        // Skip store subscriptions (identifiers starting with $) - they're handled separately
        if !declared.contains(trimmed) && !trimmed.starts_with('$') {
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

    // Check if there are any $: statements
    let has_reactive = lines.iter().any(|l| l.trim().starts_with("$:"));

    if !has_reactive {
        return script.to_string();
    }

    // Check if reordering is actually needed:
    // Reordering is needed if there are any non-reactive statements or declarations
    // that come AFTER a $: reactive statement in the source.
    // In SSR, all reactive statements should be placed at the end so non-reactive
    // code (like `foo = 1`) runs before reactive computations.
    let needs_reorder = {
        let mut saw_reactive = false;
        let mut needs = false;
        let mut in_reactive_multiline = false;
        let mut reactive_depth: i32 = 0;
        let mut i = 0;
        while i < lines.len() {
            let trimmed = lines[i].trim();
            if in_reactive_multiline {
                // Count braces to find the end of the reactive statement
                for c in trimmed.chars() {
                    match c {
                        '{' | '(' | '[' => reactive_depth += 1,
                        '}' | ')' | ']' => reactive_depth -= 1,
                        _ => {}
                    }
                }
                if reactive_depth <= 0 {
                    in_reactive_multiline = false;
                }
                i += 1;
                continue;
            }
            if trimmed.starts_with("$:") {
                saw_reactive = true;
                // Count braces in the reactive statement line to detect multiline
                let mut depth: i32 = 0;
                for c in trimmed.chars() {
                    match c {
                        '{' | '(' | '[' => depth += 1,
                        '}' | ')' | ']' => depth -= 1,
                        _ => {}
                    }
                }
                if depth > 0 {
                    // This is a multi-line reactive statement; skip until balanced
                    in_reactive_multiline = true;
                    reactive_depth = depth;
                }
                // Single-line reactive statement (depth <= 0), stays as saw_reactive
            } else if saw_reactive && !trimmed.is_empty() {
                // There is some non-reactive content after a reactive statement
                needs = true;
                break;
            }
            i += 1;
        }
        // Also need to reorder if there are function declarations that should come after reactive
        if !needs {
            // Check if any reactive line comes before a function declaration
            needs = lines.iter().any(|l| l.trim().starts_with("function "))
                && lines.iter().any(|l| l.trim().starts_with("$:"))
        }
        needs
    };

    if !needs_reorder {
        // Even when no reordering of reactive vs non-reactive is needed,
        // we still need to topologically sort the reactive statements among themselves.
        // Do an in-place sort of reactive statements only.
        return sort_reactive_in_place(script);
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
            let mut stmt_lines = vec![line];

            // Count brace depth in the reactive statement line to detect multi-line blocks
            let mut depth: i32 = 0;
            for c in trimmed.chars() {
                match c {
                    '{' | '(' | '[' => depth += 1,
                    '}' | ')' | ']' => depth -= 1,
                    _ => {}
                }
            }

            if depth > 0 {
                // Multi-line reactive statement - collect until depth returns to 0
                i += 1;
                while i < lines.len() && depth > 0 {
                    let next = lines[i];
                    stmt_lines.push(next);
                    for c in next.chars() {
                        match c {
                            '{' | '(' | '[' => depth += 1,
                            '}' | ')' | ']' => depth -= 1,
                            _ => {}
                        }
                    }
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

    // Topologically sort reactive statements based on their dependencies.
    // A reactive statement `$: a = expr_using_b` depends on `$: b = ...`
    // so `b` must come before `a`.
    let reactive_lines = sort_reactive_statements_topologically(reactive_lines);

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

/// Sort reactive statements in place (without moving them after non-reactive code).
/// This topologically sorts reactive statements relative to each other while keeping
/// non-reactive statements in their original positions.
fn sort_reactive_in_place(script: &str) -> String {
    let lines: Vec<&str> = script.lines().collect();
    let n = lines.len();

    // Collect groups: each group is either a set of reactive stmt lines or non-reactive lines
    // between/before/after reactive stmts
    #[derive(Debug)]
    enum Group<'a> {
        NonReactive(Vec<&'a str>),
        Reactive(Vec<&'a str>),
    }

    let mut groups: Vec<Group> = Vec::new();
    let mut i = 0;

    while i < n {
        let trimmed = lines[i].trim();
        if trimmed.starts_with("$:") {
            // Collect this reactive statement (possibly multi-line)
            let mut stmt_lines = vec![lines[i]];
            let mut depth: i32 = 0;
            for c in trimmed.chars() {
                match c {
                    '{' | '(' | '[' => depth += 1,
                    '}' | ')' | ']' => depth -= 1,
                    _ => {}
                }
            }
            i += 1;
            while i < n && depth > 0 {
                let next = lines[i];
                stmt_lines.push(next);
                for c in next.chars() {
                    match c {
                        '{' | '(' | '[' => depth += 1,
                        '}' | ')' | ']' => depth -= 1,
                        _ => {}
                    }
                }
                i += 1;
            }
            groups.push(Group::Reactive(stmt_lines));
        } else {
            // Non-reactive line - merge into or start a NonReactive group
            match groups.last_mut() {
                Some(Group::NonReactive(v)) => {
                    v.push(lines[i]);
                }
                _ => {
                    groups.push(Group::NonReactive(vec![lines[i]]));
                }
            }
            i += 1;
        }
    }

    // Collect all reactive groups and their positions
    let reactive_groups: Vec<Vec<&str>> = groups
        .iter()
        .filter_map(|g| {
            if let Group::Reactive(lines) = g {
                Some(lines.clone())
            } else {
                None
            }
        })
        .collect();

    if reactive_groups.len() <= 1 {
        // Nothing to sort
        return script.to_string();
    }

    // Sort reactive statements topologically
    let sorted_reactives = sort_reactive_statements_topologically(reactive_groups);

    // Now rebuild the script, replacing reactive groups with sorted ones
    let mut result = String::new();
    let mut reactive_iter = sorted_reactives.into_iter();

    for group in &groups {
        match group {
            Group::NonReactive(lines) => {
                for line in lines {
                    result.push_str(line);
                    result.push('\n');
                }
            }
            Group::Reactive(_) => {
                if let Some(sorted_stmt) = reactive_iter.next() {
                    for line in &sorted_stmt {
                        result.push_str(line);
                        result.push('\n');
                    }
                }
            }
        }
    }

    // Remove trailing newline
    if result.ends_with('\n') {
        result.pop();
    }

    result
}

/// Extract the LHS assigned variable(s) from a reactive statement (joined text).
/// Returns set of variable names that this statement assigns to.
fn extract_reactive_lhs_vars(stmt: &str) -> Vec<String> {
    // Find `$:` prefix and then look for assignment: `$: varname = ...` or `$: { varname = ...; }`
    let content = stmt.trim_start();
    let after_dollar = if let Some(rest) = content.strip_prefix("$:") {
        rest.trim()
    } else {
        return Vec::new();
    };

    // Check for `$: varname = expr` (expression statement with assignment)
    // Or `$: { ... }` (block statement - harder to analyze)
    if after_dollar.starts_with('{') {
        // Block statement - try to find assignments inside
        // Simple heuristic: find all `var = ` patterns
        extract_simple_assignments(after_dollar)
    } else {
        // Expression or declaration: `varname = expr` or `varname += expr` etc.
        // Find the first identifier before `=`
        extract_simple_assignments(after_dollar)
    }
}

/// Extract identifiers assigned to on the LHS of simple assignment statements.
fn extract_simple_assignments(code: &str) -> Vec<String> {
    let mut vars = Vec::new();
    // Find patterns like `identifier =` (not `==`)
    let chars: Vec<char> = code.chars().collect();
    let len = chars.len();
    let mut i = 0;
    let mut depth = 0i32;

    while i < len {
        let c = chars[i];
        match c {
            '{' | '[' | '(' => {
                depth += 1;
                i += 1;
            }
            '}' | ']' | ')' => {
                depth -= 1;
                i += 1;
            }
            _ if (c.is_alphabetic() || c == '_' || c == '$') && depth == 0 => {
                // Read identifier
                let start = i;
                while i < len && (chars[i].is_alphanumeric() || chars[i] == '_' || chars[i] == '$')
                {
                    i += 1;
                }
                let ident: String = chars[start..i].iter().collect();

                // Skip whitespace
                let mut j = i;
                while j < len && chars[j] == ' ' {
                    j += 1;
                }

                // Check for `=` (not `==` or `=>`)
                if j < len && chars[j] == '=' {
                    let next = chars.get(j + 1).copied().unwrap_or('\0');
                    if next != '=' && next != '>' {
                        let prev = if j > 0 { chars[j - 1] } else { '\0' };
                        if prev != '!'
                            && prev != '<'
                            && prev != '>'
                            && prev != '+'
                            && prev != '-'
                            && prev != '*'
                            && prev != '/'
                            && prev != '?'
                            && prev != '&'
                            && prev != '|'
                            && prev != '^'
                        {
                            // This is an assignment to `ident`
                            if !is_reactive_keyword(&ident) {
                                vars.push(ident);
                            }
                        }
                    }
                }
            }
            _ => {
                i += 1;
            }
        }
    }
    vars
}

/// Check if a string is a JS keyword that can't be a variable name.
fn is_reactive_keyword(s: &str) -> bool {
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
    )
}

/// Extract all identifiers referenced in an expression (to find dependencies).
fn extract_reactive_rhs_identifiers(stmt: &str) -> Vec<String> {
    // Skip the `$:` prefix and the LHS assignment part
    let content = stmt.trim_start();
    let after_dollar = if let Some(rest) = content.strip_prefix("$:") {
        rest.trim()
    } else {
        return Vec::new();
    };

    // Extract all identifiers from the content, skipping object property keys.
    // An identifier is an object property key if it is immediately followed by `:` (after
    // optional whitespace), as in `{ details: null }`. We must NOT treat it as a dependency.
    // Exception: `? x : y` (ternary colon) should still be treated as a reference.
    let mut idents = Vec::new();
    let chars: Vec<char> = after_dollar.chars().collect();
    let len = chars.len();
    let mut i = 0;
    let mut in_string = false;
    let mut string_char = ' ';
    // Track brace depth to know when we are inside an object literal `{...}`.
    // Property keys only appear at the top level of `{...}` blocks.
    let mut brace_depth: i32 = 0;

    while i < len {
        let c = chars[i];
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

        match c {
            '{' => {
                brace_depth += 1;
                i += 1;
            }
            '}' => {
                brace_depth -= 1;
                i += 1;
            }
            _ if c.is_alphabetic() || c == '_' || c == '$' => {
                let start = i;
                while i < len && (chars[i].is_alphanumeric() || chars[i] == '_' || chars[i] == '$')
                {
                    i += 1;
                }
                let ident: String = chars[start..i].iter().collect();

                if !is_reactive_keyword(&ident) {
                    // Check if this identifier is an object property key.
                    // A property key is an identifier directly followed (after optional whitespace)
                    // by `:` that is NOT part of `::` (optional chaining is `?.`) and NOT a
                    // ternary colon (those appear after `?`). The simplest heuristic:
                    // if we are inside a `{...}` block (brace_depth > 0), and the next
                    // non-whitespace character after the identifier is `:` (not `:`+`:`),
                    // then it is a property key.
                    let mut j = i;
                    while j < len && (chars[j] == ' ' || chars[j] == '\t') {
                        j += 1;
                    }
                    let is_prop_key = brace_depth > 0
                        && j < len
                        && chars[j] == ':'
                        && chars.get(j + 1).copied().unwrap_or('\0') != ':';

                    if !is_prop_key {
                        idents.push(ident);
                    }
                }
            }
            _ => {
                i += 1;
            }
        }
    }
    idents
}

/// Topologically sort reactive statements based on their variable dependencies.
fn sort_reactive_statements_topologically(stmts: Vec<Vec<&str>>) -> Vec<Vec<&str>> {
    let n = stmts.len();
    if n <= 1 {
        return stmts;
    }

    // Extract declared variables and dependencies for each statement
    let mut declared: Vec<Vec<String>> = Vec::new();
    let mut used: Vec<Vec<String>> = Vec::new();

    for stmt in &stmts {
        let joined = stmt.join("\n");
        declared.push(extract_reactive_lhs_vars(&joined));
        used.push(extract_reactive_rhs_identifiers(&joined));
    }

    // Build a map from variable name to statement index
    let mut var_to_stmt: std::collections::HashMap<String, usize> =
        std::collections::HashMap::new();
    for (i, decls) in declared.iter().enumerate() {
        for decl in decls {
            var_to_stmt.insert(decl.clone(), i);
        }
    }

    // Build dependency edges: stmt i depends on stmt j if i uses a variable declared by j
    let mut deps: Vec<Vec<usize>> = vec![Vec::new(); n];
    for (i, uses) in used.iter().enumerate() {
        for var in uses {
            if let Some(&j) = var_to_stmt.get(var)
                && j != i
            {
                deps[i].push(j);
            }
        }
    }

    // Topological sort using DFS
    let mut sorted_indices: Vec<usize> = Vec::new();
    let mut visited = vec![false; n];
    let mut in_progress = vec![false; n];

    fn topo_visit(
        idx: usize,
        deps: &[Vec<usize>],
        visited: &mut Vec<bool>,
        in_progress: &mut Vec<bool>,
        sorted: &mut Vec<usize>,
    ) {
        if visited[idx] || in_progress[idx] {
            return;
        }
        in_progress[idx] = true;
        for &dep in &deps[idx] {
            topo_visit(dep, deps, visited, in_progress, sorted);
        }
        in_progress[idx] = false;
        visited[idx] = true;
        sorted.push(idx);
    }

    for i in 0..n {
        topo_visit(
            i,
            &deps,
            &mut visited,
            &mut in_progress,
            &mut sorted_indices,
        );
    }

    // Return statements in sorted order
    sorted_indices
        .into_iter()
        .map(|i| stmts[i].clone())
        .collect()
}
