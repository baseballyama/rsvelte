//! Store transformation functions for server-side rendering.
//!
//! This module contains functions that handle store subscriptions and assignments
//! for server-side code generation, including `$store` -> `$.store_get()` transforms
//! and store assignment transforms.

/// Replace store identifier in an expression with $.store_get() call.
pub(crate) fn replace_store_identifier(expr: &str, store_ref: &str, store_name: &str) -> String {
    // Fast path: if `store_ref` doesn't appear in `expr` at all, there is
    // nothing to replace. Skips the `Vec<char>` allocation and the full
    // state-machine walk for the (very common) case where most expressions
    // don't reference a given store.
    if !expr.contains(store_ref) {
        return expr.to_string();
    }
    let mut result = String::with_capacity(expr.len() * 2);
    let chars: Vec<char> = expr.chars().collect();
    let store_ref_chars: Vec<char> = store_ref.chars().collect();
    let store_ref_len = store_ref_chars.len();
    let mut i = 0;
    let mut in_single_quote = false;
    let mut in_double_quote = false;

    while i < chars.len() {
        let c = chars[i];

        // Track single/double-quoted string literals to avoid replacing inside them.
        // Template literals (backtick) are NOT tracked because they may contain
        // interpolations like `${$store}` which need replacement.
        if c == '\'' && !in_double_quote && (i == 0 || chars[i - 1] != '\\') {
            in_single_quote = !in_single_quote;
            result.push(c);
            i += 1;
            continue;
        }
        if c == '"' && !in_single_quote && (i == 0 || chars[i - 1] != '\\') {
            in_double_quote = !in_double_quote;
            result.push(c);
            i += 1;
            continue;
        }
        if in_single_quote || in_double_quote {
            result.push(c);
            i += 1;
            continue;
        }

        if i + store_ref_len <= chars.len() {
            let mut matches = true;
            for (j, ref_char) in store_ref_chars.iter().enumerate() {
                if chars[i + j] != *ref_char {
                    matches = false;
                    break;
                }
            }

            if matches {
                let prev_is_ident = if i > 0 {
                    is_js_identifier_char(chars[i - 1])
                } else {
                    false
                };
                let next_is_ident = if i + store_ref_len < chars.len() {
                    is_js_identifier_char(chars[i + store_ref_len])
                } else {
                    false
                };

                if !prev_is_ident && !next_is_ident {
                    result.push_str(&format!(
                        "$.store_get($$store_subs ??= {{}}, '{}', {})",
                        store_ref, store_name
                    ));
                    i += store_ref_len;
                    continue;
                }
            }
        }

        result.push(chars[i]);
        i += 1;
    }

    result
}

/// Replace store identifier in script content with $.store_get() call.
pub(crate) fn replace_store_identifier_in_script(
    script: &str,
    store_ref: &str,
    store_name: &str,
) -> String {
    // Fast path: skip the full lexer if the store ref doesn't appear at all.
    if !script.contains(store_ref) {
        return script.to_string();
    }
    let mut result = String::with_capacity(script.len() * 2);
    let chars: Vec<char> = script.chars().collect();
    let store_ref_chars: Vec<char> = store_ref.chars().collect();
    let store_ref_len = store_ref_chars.len();
    let mut i = 0;

    let mut in_string = false;
    let mut string_char = ' ';
    let mut in_single_line_comment = false;
    let mut in_multi_line_comment = false;
    // Track template literal interpolation depth.
    // When inside a template literal and we see `${`, we push the current
    // brace depth. When we see `}` that pops back to template literal mode.
    let mut template_literal_stack: Vec<i32> = Vec::new();
    // Track function parameters that shadow the store ref.
    // Each entry is (min_brace_depth, min_paren_depth): shadow is active while
    // brace_depth >= min_brace_depth AND paren_depth >= min_paren_depth.
    let mut shadowed_params: Vec<(i32, i32)> = Vec::new();
    let mut brace_depth: i32 = 0;
    let mut paren_depth: i32 = 0;

    while i < chars.len() {
        let c = chars[i];

        // Handle single-line comment end (newline)
        if in_single_line_comment {
            result.push(c);
            if c == '\n' {
                in_single_line_comment = false;
            }
            i += 1;
            continue;
        }

        // Handle multi-line comment end (*/)
        if in_multi_line_comment {
            result.push(c);
            if c == '*' && i + 1 < chars.len() && chars[i + 1] == '/' {
                result.push('/');
                i += 2;
                in_multi_line_comment = false;
            } else {
                i += 1;
            }
            continue;
        }

        // Detect comment starts (only when not in string)
        if !in_string && c == '/' && i + 1 < chars.len() {
            if chars[i + 1] == '/' {
                // Single-line comment
                in_single_line_comment = true;
                result.push(c);
                i += 1;
                continue;
            } else if chars[i + 1] == '*' {
                // Multi-line comment
                in_multi_line_comment = true;
                result.push(c);
                i += 1;
                continue;
            }
        }

        // Handle template literal interpolation: when inside a template literal
        // and we encounter `${`, enter expression mode (in_string = false)
        if in_string && string_char == '`' {
            if c == '$' && i + 1 < chars.len() && chars[i + 1] == '{' {
                // Enter template interpolation - push current brace depth
                result.push('$');
                result.push('{');
                i += 2;
                template_literal_stack.push(brace_depth);
                brace_depth += 1;
                in_string = false;
                continue;
            }
            if c == '\\' && i + 1 < chars.len() {
                // Skip escaped character in template literal
                result.push(c);
                result.push(chars[i + 1]);
                i += 2;
                continue;
            }
            if c == '`' {
                // End of template literal
                in_string = false;
                result.push(c);
                i += 1;
                continue;
            }
            result.push(c);
            i += 1;
            continue;
        }

        if (c == '"' || c == '\'' || c == '`') && (i == 0 || chars[i - 1] != '\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
            result.push(c);
            i += 1;
            continue;
        }

        if in_string {
            result.push(c);
            i += 1;
            continue;
        }

        // Track brace and paren depth for parameter shadowing
        if c == '{' {
            brace_depth += 1;
        } else if c == '}' {
            brace_depth -= 1;
            // Check if we're closing a template literal interpolation
            if let Some(&template_depth) = template_literal_stack.last()
                && brace_depth == template_depth
            {
                // Return to template literal mode
                template_literal_stack.pop();
                in_string = true;
                string_char = '`';
                result.push(c);
                i += 1;
                continue;
            }
            // Pop any parameter shadows that ended at this depth
            shadowed_params.retain(|&(b, _)| b <= brace_depth);
        } else if c == '(' {
            paren_depth += 1;
        } else if c == ')' {
            paren_depth -= 1;
            // Pop any parameter shadows that ended at this paren depth
            shadowed_params.retain(|&(_, p)| p <= paren_depth);
        }

        if i + store_ref_len <= chars.len() {
            let mut matches = true;
            for (j, ref_char) in store_ref_chars.iter().enumerate() {
                if chars[i + j] != *ref_char {
                    matches = false;
                    break;
                }
            }

            if matches {
                let prev_is_ident = if i > 0 {
                    is_js_identifier_char(chars[i - 1])
                } else {
                    false
                };
                // Check if preceded by `.` - this is a property access like `obj.$store`
                // BUT NOT `...$store` which is a spread operator
                let prev_is_member_dot = i > 0
                    && chars[i - 1] == '.'
                    && !(i >= 3 && chars[i - 2] == '.' && chars[i - 3] == '.');
                let next_is_ident = if i + store_ref_len < chars.len() {
                    is_js_identifier_char(chars[i + store_ref_len])
                } else {
                    false
                };

                // Skip if this is a property access (obj.$store)
                if prev_is_member_dot {
                    result.push_str(store_ref);
                    i += store_ref_len;
                    continue;
                }

                let mut j = i + store_ref_len;
                while j < chars.len() && chars[j].is_whitespace() {
                    j += 1;
                }

                // Detect fat arrow `=>` first - this is an arrow function parameter, not an assignment
                let is_fat_arrow = j + 1 < chars.len() && chars[j] == '=' && chars[j + 1] == '>';

                // If this is `$store =>`, register it as a shadowed parameter and skip
                if !prev_is_ident && !next_is_ident && is_fat_arrow {
                    // This is an arrow function parameter: `$store => ...`
                    // Record that this store ref is shadowed in the arrow function body
                    shadowed_params.push((brace_depth, paren_depth));
                    // Output the store ref as-is (it's a parameter name)
                    result.push_str(store_ref);
                    i += store_ref_len;
                    continue;
                }

                let is_assignment = j < chars.len()
                    && (chars[j] == '='
                        || (j + 1 < chars.len()
                            && chars[j + 1] == '='
                            && (chars[j] == '+'
                                || chars[j] == '-'
                                || chars[j] == '*'
                                || chars[j] == '/'
                                || chars[j] == '%'))
                        || (chars[j] == '+' && j + 1 < chars.len() && chars[j + 1] == '+')
                        || (chars[j] == '-' && j + 1 < chars.len() && chars[j + 1] == '-'));

                let is_comparison = j < chars.len()
                    && chars[j] == '='
                    && ((j + 1 < chars.len() && chars[j + 1] == '=')
                        || (i > 0
                            && (chars[i - 1] == '!'
                                || chars[i - 1] == '='
                                || chars[i - 1] == '<'
                                || chars[i - 1] == '>')));

                // Check if this is an object property key: `$store:` (followed by `:` but not `::`)
                // When inside a brace context, `$store:` is a property key, not a store reference.
                let is_object_prop_key = if brace_depth > 0 && j < chars.len() && chars[j] == ':' {
                    // Make sure it's not `::` or a ternary colon
                    let after_colon = chars.get(j + 1).copied().unwrap_or('\0');
                    after_colon != ':'
                } else {
                    false
                };

                if !prev_is_ident
                    && !next_is_ident
                    && (!is_assignment || is_comparison)
                    && !is_object_prop_key
                {
                    let preceding: String = result.chars().collect();
                    let is_in_store_call =
                        preceding.ends_with("$.store_set(") || preceding.ends_with("$.store_get(");

                    // Check if the store ref is currently shadowed by a function parameter
                    let is_shadowed = shadowed_params
                        .iter()
                        .any(|&(b, p)| b <= brace_depth && p <= paren_depth);

                    // Check if this is a function parameter usage: `$store =>` or `($store)`
                    // If `$store` is followed by `=>`, this is a parameter declaration
                    let is_param_decl = {
                        let mut k = j;
                        while k < chars.len()
                            && (chars[k] == ' ' || chars[k] == '\t' || chars[k] == '\n')
                        {
                            k += 1;
                        }
                        if k + 1 < chars.len() && chars[k] == '=' && chars[k + 1] == '>' {
                            // This is `$store =>` - parameter declaration
                            // Record that this store ref is shadowed until the arrow function ends
                            // Find where the arrow function body starts (after =>)
                            let body_start = k + 2;
                            // Skip whitespace after =>
                            let mut m = body_start;
                            while m < chars.len()
                                && (chars[m] == ' ' || chars[m] == '\t' || chars[m] == '\n')
                            {
                                m += 1;
                            }
                            // If body starts with {, record current brace_depth
                            // Body will end when brace_depth returns to current value
                            // Actually we pre-record the CURRENT brace depth + 1 (after entering the body)
                            // The shadow is active while brace_depth >= recorded value
                            shadowed_params.push((brace_depth, paren_depth));
                            true
                        } else {
                            false
                        }
                    };

                    // Check if `$store` appears inside a function parameter list like `($store) => ...`
                    // or `function foo($store) { ... }`.
                    // This happens when preceding char is `(` or `,` (inside param list)
                    // and following char after the store ref (and any `,`/whitespace) is `)`,
                    // and that `)` is followed by `=>` (arrow) or `{` (regular function).
                    let is_in_paren_fn_param = if !is_param_decl {
                        // Check if the char immediately before $store (skipping whitespace back) is `(` or `,`
                        let prev_char = result.chars().rev().find(|c| !c.is_whitespace());
                        let preceded_by_paren_or_comma = matches!(prev_char, Some('(') | Some(','));
                        // Check if the opening `(` is preceded by a control flow keyword
                        // like `if`, `while`, `for`, `switch` - if so, this is NOT a function param list
                        let is_control_flow = if preceded_by_paren_or_comma {
                            // Find the position of the `(` in result
                            let result_bytes = result.as_bytes();
                            let mut p = result_bytes.len();
                            // Go back to find the `(` that contains our store ref
                            let mut depth = 0i32;
                            while p > 0 {
                                p -= 1;
                                match result_bytes[p] {
                                    b')' => depth += 1,
                                    b'(' => {
                                        if depth == 0 {
                                            // Found the opening paren
                                            break;
                                        }
                                        depth -= 1;
                                    }
                                    _ => {}
                                }
                            }
                            // Now check what's before the `(`
                            let before_paren = result[..p].trim_end();
                            before_paren.ends_with("if")
                                || before_paren.ends_with("while")
                                || before_paren.ends_with("for")
                                || before_paren.ends_with("switch")
                                || before_paren.ends_with("catch")
                        } else {
                            false
                        };
                        if preceded_by_paren_or_comma && !is_control_flow {
                            // Look for `)` after $store, then `=>` or `{`
                            let mut k = j; // j is already at first non-whitespace after store_ref
                            // Skip past `)`, `,`, or whitespace to find the closing paren of param list
                            let mut paren_balance: i32 = 0;
                            // We are inside parens right now (after `(`), look for matching `)`
                            // that closes the current paren group
                            // First, scan forward from j to find the close of the parameter list
                            let mut found_close = false;
                            while k < chars.len() {
                                match chars[k] {
                                    '(' => {
                                        paren_balance += 1;
                                        k += 1;
                                    }
                                    ')' => {
                                        if paren_balance == 0 {
                                            // This is the closing paren of the param list
                                            // Check if followed by `=>` (arrow) or `{` (regular function)
                                            let mut m = k + 1;
                                            while m < chars.len() && chars[m].is_whitespace() {
                                                m += 1;
                                            }
                                            let is_arrow = m + 1 < chars.len()
                                                && chars[m] == '='
                                                && chars[m + 1] == '>';
                                            let is_func_body = m < chars.len() && chars[m] == '{';
                                            if is_arrow || is_func_body {
                                                found_close = true;
                                                // Register shadow: $store is a parameter,
                                                // it shadows in the function body.
                                                if is_arrow {
                                                    // For arrow functions, check if body is a block or expression.
                                                    // Skip past `=>` and whitespace to check.
                                                    let mut body_pos = m + 2;
                                                    while body_pos < chars.len()
                                                        && chars[body_pos].is_whitespace()
                                                    {
                                                        body_pos += 1;
                                                    }
                                                    if body_pos < chars.len()
                                                        && chars[body_pos] == '{'
                                                    {
                                                        // Block body: shadow active inside braces
                                                        shadowed_params.push((
                                                            brace_depth + 1,
                                                            paren_depth - 1,
                                                        ));
                                                    } else {
                                                        // Expression body: shadow active at same
                                                        // brace depth (until paren depth decreases)
                                                        shadowed_params
                                                            .push((brace_depth, paren_depth - 1));
                                                    }
                                                } else {
                                                    // Regular function: shadow active inside braces
                                                    shadowed_params
                                                        .push((brace_depth + 1, paren_depth - 1));
                                                }
                                            }
                                            break;
                                        } else {
                                            paren_balance -= 1;
                                            k += 1;
                                        }
                                    }
                                    _ => {
                                        k += 1;
                                    }
                                }
                            }
                            found_close
                        } else {
                            false
                        }
                    } else {
                        false
                    };

                    if !is_in_store_call && !is_shadowed && !is_param_decl && !is_in_paren_fn_param
                    {
                        result.push_str(&format!(
                            "$.store_get($$store_subs ??= {{}}, '{}', {})",
                            store_ref, store_name
                        ));
                        i += store_ref_len;
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

/// Check if a character is a valid JavaScript identifier character.
fn is_js_identifier_char(c: char) -> bool {
    c.is_alphanumeric() || c == '_' || c == '$'
}

/// Transform a binding var_name for getter context.
/// If `var_name` starts with a store subscription prefix (e.g., `$a.value`),
/// transforms it to use `$.store_get()`.
///
/// Examples:
/// - `$a.value` -> `$.store_get($$store_subs ??= {}, '$a', a).value`
/// - `$form` -> `$.store_get($$store_subs ??= {}, '$form', form)`
/// - `count` -> `count` (unchanged, not a store ref)
pub(crate) fn transform_binding_getter(var_name: &str, store_subs: &[(&str, &str)]) -> String {
    if store_subs.is_empty() {
        return var_name.to_string();
    }

    for &(store_ref, store_name) in store_subs {
        // Check if var_name starts with the store ref (e.g., "$a" in "$a.value")
        if let Some(after) = var_name.strip_prefix(store_ref) {
            // After the store ref, must be end-of-string, '.', '[', or '(' (not an ident char)
            if after.is_empty()
                || after.starts_with('.')
                || after.starts_with('[')
                || after.starts_with('(')
            {
                return format!(
                    "$.store_get($$store_subs ??= {{}}, '{}', {}){}",
                    store_ref, store_name, after
                );
            }
        }
    }

    var_name.to_string()
}

/// Transform a binding var_name for setter context.
/// If `var_name` starts with a store subscription prefix, transforms it to
/// use `$.store_mutate()` or `$.store_set()`.
///
/// Examples:
/// - `$a.value` -> `$.store_mutate($$store_subs ??= {}, '$a', a, $.store_get($$store_subs ??= {}, '$a', a).value = $$value)`
/// - `$form` -> `$.store_set(form, $$value)`
/// - `count` -> `count = $$value` (unchanged, not a store ref)
pub(crate) fn transform_binding_setter(var_name: &str, store_subs: &[(&str, &str)]) -> String {
    if store_subs.is_empty() {
        return format!("{} = $$value", var_name);
    }

    for &(store_ref, store_name) in store_subs {
        // Check if var_name starts with the store ref (e.g., "$a" in "$a.value")
        if let Some(after) = var_name.strip_prefix(store_ref) {
            // After the store ref, must be end-of-string, '.', '[', or '(' (not an ident char)
            if after.is_empty() {
                // Direct store set: $form = $$value -> $.store_set(form, $$value)
                return format!("$.store_set({}, $$value)", store_name);
            } else if after.starts_with('.') || after.starts_with('[') || after.starts_with('(') {
                // Property access: $a.value = $$value -> $.store_mutate(...)
                return format!(
                    "$.store_mutate($$store_subs ??= {{}}, '{}', {}, $.store_get($$store_subs ??= {{}}, '{}', {}){} = $$value)",
                    store_ref, store_name, store_ref, store_name, after
                );
            }
        }
    }

    format!("{} = $$value", var_name)
}

/// Resolve getter/setter expressions for a binding.
/// For Simple bindings, uses transform_binding_getter/setter.
/// For SequenceExpression bindings, uses bind_get()/bind_set($$value) variables.
pub(crate) fn resolve_binding_exprs<'a>(
    binding: &'a super::types::ComponentBinding,
    store_subs: &[(&str, &str)],
) -> (&'a str, String, String) {
    match binding {
        super::types::ComponentBinding::Simple {
            prop_name,
            var_name,
        } => (
            prop_name.as_str(),
            transform_binding_getter(var_name, store_subs),
            transform_binding_setter(var_name, store_subs),
        ),
        super::types::ComponentBinding::SequenceExpression {
            prop_name,
            getter_expr: _,
            setter_expr: _,
        } => (
            prop_name.as_str(),
            "bind_get()".to_string(),
            "bind_set($$value)".to_string(),
        ),
    }
}

/// Transform `$store.prop = value` and `$store.prop op= value` into `$.store_mutate(...)` calls.
///
/// This handles member expression mutations on store subscriptions.
/// Examples:
/// - `$a.foo = 3` -> `$.store_mutate($$store_subs ??= {}, '$a', a, $.store_get($$store_subs ??= {}, '$a', a).foo = 3)`
/// - `$a.foo += 1` -> `$.store_mutate($$store_subs ??= {}, '$a', a, $.store_get($$store_subs ??= {}, '$a', a).foo += 1)`
fn transform_store_property_mutations(script: &str) -> String {
    let chars: Vec<char> = script.chars().collect();
    let len = chars.len();
    let mut result = String::with_capacity(len * 2);
    let mut i = 0;

    let mut in_string = false;
    let mut string_char = ' ';
    let mut in_single_line_comment = false;
    let mut in_multi_line_comment = false;

    while i < len {
        let c = chars[i];

        // Handle comments
        if in_single_line_comment {
            result.push(c);
            if c == '\n' {
                in_single_line_comment = false;
            }
            i += 1;
            continue;
        }
        if in_multi_line_comment {
            result.push(c);
            if c == '*' && i + 1 < len && chars[i + 1] == '/' {
                result.push('/');
                i += 2;
                in_multi_line_comment = false;
            } else {
                i += 1;
            }
            continue;
        }
        if !in_string && c == '/' && i + 1 < len {
            if chars[i + 1] == '/' {
                in_single_line_comment = true;
                result.push(c);
                i += 1;
                continue;
            } else if chars[i + 1] == '*' {
                in_multi_line_comment = true;
                result.push(c);
                i += 1;
                continue;
            }
        }

        // Handle strings
        if c == '\'' || c == '"' || c == '`' {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char && (i == 0 || chars[i - 1] != '\\') {
                in_string = false;
            }
            result.push(c);
            i += 1;
            continue;
        }
        if in_string {
            result.push(c);
            i += 1;
            continue;
        }

        // Look for `$store_name` followed by `.` or `[`
        if c == '$' {
            // Check it's not preceded by identifier char
            let prev_is_ident = if i > 0 {
                is_js_identifier_char(chars[i - 1])
            } else {
                false
            };

            if !prev_is_ident {
                // Read store name: must start with letter or underscore
                let start = i + 1; // skip '$'
                if start < len && (chars[start].is_alphabetic() || chars[start] == '_') {
                    let mut name_end = start;
                    while name_end < len && is_js_identifier_char(chars[name_end]) {
                        name_end += 1;
                    }
                    let store_name: String = chars[start..name_end].iter().collect();
                    let store_ref = format!("${}", store_name);

                    // After store name, look for member access chain (.prop or [expr])
                    // but NOT if followed immediately by `=` (that's handled by existing code)
                    // and NOT if followed by ident char (which would extend the store name)
                    if name_end < len && !is_js_identifier_char(chars[name_end]) {
                        // Check if what follows is a member chain (.prop, [expr])
                        let j = name_end;
                        let has_member_chain = chars[j] == '.' || chars[j] == '[';

                        if has_member_chain {
                            // Read the full member chain until we hit an assignment operator
                            // We need to track bracket depth for `[expr]` access
                            let mut depth = 0i32;
                            let mut chain_end = j;
                            let mut found_assign = false;
                            let mut assign_op_start = 0usize;
                            let mut assign_op_end = 0usize;
                            let mut inner_in_string = false;
                            let mut inner_string_char = ' ';

                            while chain_end < len {
                                let ch = chars[chain_end];

                                // String tracking inside chain
                                if ch == '\'' || ch == '"' || ch == '`' {
                                    if !inner_in_string {
                                        inner_in_string = true;
                                        inner_string_char = ch;
                                    } else if ch == inner_string_char
                                        && (chain_end == 0 || chars[chain_end - 1] != '\\')
                                    {
                                        inner_in_string = false;
                                    }
                                    chain_end += 1;
                                    continue;
                                }
                                if inner_in_string {
                                    chain_end += 1;
                                    continue;
                                }

                                if ch == '[' || ch == '(' {
                                    depth += 1;
                                    chain_end += 1;
                                } else if ch == ']' || ch == ')' {
                                    depth -= 1;
                                    chain_end += 1;
                                } else if depth == 0 {
                                    // Check for assignment operator at depth 0
                                    // Operators: =, +=, -=, *=, /=, %=, &=, |=, ^=, <<=, >>=, >>>=
                                    // But NOT ==, ===, !=, !==, <=, >=, =>
                                    if ch == '=' {
                                        // Check for ==, ===, or =>
                                        let next = if chain_end + 1 < len {
                                            chars[chain_end + 1]
                                        } else {
                                            '\0'
                                        };
                                        if next != '=' && next != '>' {
                                            // Check previous char is not !, =, <, >
                                            let prev = if chain_end > 0 {
                                                chars[chain_end - 1]
                                            } else {
                                                '\0'
                                            };
                                            if prev != '!'
                                                && prev != '='
                                                && prev != '<'
                                                && prev != '>'
                                            {
                                                // This is an assignment
                                                assign_op_start = chain_end;
                                                assign_op_end = chain_end + 1;
                                                found_assign = true;
                                                break;
                                            }
                                        }
                                        chain_end += 1;
                                    } else if (ch == '+'
                                        || ch == '-'
                                        || ch == '*'
                                        || ch == '/'
                                        || ch == '%'
                                        || ch == '&'
                                        || ch == '|'
                                        || ch == '^'
                                        || ch == '?'
                                        || ch == '!')
                                        && chain_end + 1 < len
                                        && chars[chain_end + 1] == '='
                                    {
                                        // Check for compound assignment like +=, -=, etc.
                                        // But NOT != (inequality), !==
                                        if ch == '!' {
                                            chain_end += 1;
                                            continue;
                                        }
                                        // Also exclude `!=` and `!==`
                                        // Check for `<<= >>= >>>=`
                                        if (ch == '<' || ch == '>')
                                            && chain_end + 1 < len
                                            && chars[chain_end + 1] == ch
                                        {
                                            // could be <<= or >>=
                                            if chain_end + 2 < len && chars[chain_end + 2] == '=' {
                                                assign_op_start = chain_end;
                                                assign_op_end = chain_end + 3;
                                                found_assign = true;
                                                break;
                                            }
                                        }
                                        // &&=, ||=, ??= need special handling
                                        if (ch == '&' || ch == '|' || ch == '?')
                                            && chain_end + 1 < len
                                            && chars[chain_end + 1] == ch
                                            && chain_end + 2 < len
                                            && chars[chain_end + 2] == '='
                                        {
                                            assign_op_start = chain_end;
                                            assign_op_end = chain_end + 3;
                                            found_assign = true;
                                            break;
                                        }
                                        assign_op_start = chain_end;
                                        assign_op_end = chain_end + 2;
                                        found_assign = true;
                                        break;
                                    } else if ch == '.'
                                        || is_js_identifier_char(ch)
                                        || ch == ' '
                                        || ch == '\t'
                                    {
                                        // Continue reading member chain (whitespace is ok between chain and =)
                                        chain_end += 1;
                                    } else {
                                        // Non-member, non-assignment char at depth 0 -> stop
                                        break;
                                    }
                                } else {
                                    chain_end += 1;
                                }
                            }

                            if found_assign {
                                // Extract member chain (between name_end and assign_op_start), trimmed
                                let member_chain: String = chars[name_end..assign_op_start]
                                    .iter()
                                    .collect::<String>()
                                    .trim()
                                    .to_string();

                                // Only generate store_mutate if there IS a member chain
                                // (otherwise this is a direct assignment handled by existing code)
                                if member_chain.is_empty() {
                                    // No member chain - this is $a = value, fall through to existing handler
                                    result.push(c);
                                    i += 1;
                                    continue;
                                }
                                let assign_op: String =
                                    chars[assign_op_start..assign_op_end].iter().collect();

                                // Skip whitespace (including newlines) after operator
                                let mut val_start = assign_op_end;
                                while val_start < len
                                    && (chars[val_start] == ' '
                                        || chars[val_start] == '\t'
                                        || chars[val_start] == '\n'
                                        || chars[val_start] == '\r')
                                {
                                    val_start += 1;
                                }

                                // Find value end (to end of statement)
                                let rest: String = chars[val_start..].iter().collect();
                                let val_len = find_statement_end(&rest);
                                let value = rest[..val_len].trim();

                                // Generate $.store_mutate(...)
                                let transformed = format!(
                                    "$.store_mutate($$store_subs ??= {{}}, '{}', {}, $.store_get($$store_subs ??= {{}}, '{}', {}){} {} {})",
                                    store_ref,
                                    store_name,
                                    store_ref,
                                    store_name,
                                    member_chain,
                                    assign_op,
                                    value
                                );
                                result.push_str(&transformed);
                                i = val_start + val_len;
                                continue;
                            }
                        }
                    }
                }
            }
        }

        result.push(c);
        i += 1;
    }

    result
}

/// Public wrapper for `transform_store_property_mutations` for use in template expressions.
pub(crate) fn transform_store_property_mutations_public(script: &str) -> String {
    transform_store_property_mutations(script)
}

/// Transform store destructure assignments in server-side rendering.
///
/// Expands patterns like:
/// - `({$userName3} = obj)` → `($.store_set(userName3, obj.$userName3))`
/// - `({userName1: $userName1, $userName2} = obj)` → `($.store_set(userName1, obj.userName1), $.store_set(userName2, obj.$userName2))`
/// - `[$u, $v, $w] = rhs` → IIFE with `$.to_array()` and `$.store_set()` calls
///
/// This must run BEFORE `replace_store_identifier_in_script` to prevent
/// `$.store_get()` from appearing on the LHS of destructure assignments.
pub(crate) fn transform_store_destructure_assignments(script: &str) -> String {
    let mut result = script.to_string();
    let mut array_counter = 0usize;

    // Keep transforming until no more changes (handles multiple destructures)
    loop {
        let new = transform_one_store_destructure(&result, &mut array_counter);
        if new == result {
            break;
        }
        result = new;
    }

    result
}

/// Find and transform one store destructure assignment.
fn transform_one_store_destructure(script: &str, array_counter: &mut usize) -> String {
    let chars: Vec<char> = script.chars().collect();
    let len = chars.len();
    // Build byte offset mapping: char index -> byte index
    let byte_offsets: Vec<usize> = script.char_indices().map(|(b, _)| b).collect();
    let byte_len = script.len();
    let b = |char_idx: usize| -> usize {
        if char_idx >= byte_offsets.len() {
            byte_len
        } else {
            byte_offsets[char_idx]
        }
    };
    let mut i = 0;
    let mut in_string: Option<char> = None;
    let mut in_line_comment = false;
    let mut in_block_comment = false;

    while i < len {
        let c = chars[i];

        // Handle comments
        if in_line_comment {
            if c == '\n' {
                in_line_comment = false;
            }
            i += 1;
            continue;
        }
        if in_block_comment {
            if c == '*' && i + 1 < len && chars[i + 1] == '/' {
                in_block_comment = false;
                i += 2;
            } else {
                i += 1;
            }
            continue;
        }
        if in_string.is_none() && c == '/' && i + 1 < len {
            if chars[i + 1] == '/' {
                in_line_comment = true;
                i += 2;
                continue;
            } else if chars[i + 1] == '*' {
                in_block_comment = true;
                i += 2;
                continue;
            }
        }

        // Handle strings
        if let Some(q) = in_string {
            if c == '\\' {
                i += 2;
                continue;
            }
            if c == q {
                in_string = None;
            }
            i += 1;
            continue;
        }
        if c == '\'' || c == '"' || c == '`' {
            in_string = Some(c);
            i += 1;
            continue;
        }

        // Look for `] =` or `} =` patterns (destructure assignments)
        if (c == ']' || c == '}') && i + 1 < len {
            let close_bracket = c;
            let open_bracket = if c == ']' { '[' } else { '{' };

            // Find `=` after the bracket
            let mut j = i + 1;
            while j < len && (chars[j] == ' ' || chars[j] == '\t' || chars[j] == '\n') {
                j += 1;
            }

            if j < len
                && chars[j] == '='
                && (j + 1 >= len || chars[j + 1] != '=' && chars[j + 1] != '>')
            {
                // Find the matching opening bracket
                if let Some(pattern_start) =
                    find_matching_open(script, i, open_bracket, close_bracket)
                {
                    let pattern_str = &script[b(pattern_start)..b(i + 1)];

                    // For array patterns, check if `[` is actually member access
                    if open_bracket == '[' && pattern_start > 0 {
                        let before = chars[pattern_start - 1];
                        if before.is_ascii_alphanumeric()
                            || before == '_'
                            || before == '$'
                            || before == ')'
                            || before == ']'
                        {
                            i = j + 1;
                            continue;
                        }
                    }

                    // Skip declaration destructures (let/const/var)
                    let before_pattern = script[..b(pattern_start)].trim_end();
                    if before_pattern.ends_with("let")
                        || before_pattern.ends_with("const")
                        || before_pattern.ends_with("var")
                    {
                        i = j + 1;
                        continue;
                    }

                    // Check if pattern contains any $store targets
                    if !has_store_targets(pattern_str) {
                        // Even though we're not transforming this destructure,
                        // we need to increment the array counter for array
                        // patterns to match the official Svelte compiler's
                        // scope.generate('$$array') behavior, which assigns
                        // names to ALL array destructures (not just store ones).
                        if close_bracket == ']' {
                            *array_counter += 1;
                        }
                        i = j + 1;
                        continue;
                    }

                    // Find RHS
                    let rhs_start = j + 1;
                    let rhs_end = find_expression_end(script, rhs_start);
                    let rhs_str = script[b(rhs_start)..b(rhs_end)].trim();

                    if rhs_str.is_empty() {
                        i = j + 1;
                        continue;
                    }

                    // Check for surrounding parens
                    // Note: actual_start/actual_end are now BYTE indices
                    let mut actual_start_byte = b(pattern_start);
                    let mut actual_end_byte = b(rhs_end);
                    let before = script[..b(pattern_start)].trim_end();
                    if before.ends_with('(') {
                        let paren_pos = script[..b(pattern_start)].rfind('(').unwrap();
                        let after_rhs = &script[b(rhs_end)..];
                        if let Some(close_paren_offset) = after_rhs.find(')') {
                            actual_start_byte = paren_pos;
                            actual_end_byte = b(rhs_end) + close_paren_offset + 1;
                        }
                    }

                    // Determine if the destructure result value is consumed
                    // (i.e., it's in expression position, like inside $.store_set()).
                    // If it's a standalone expression statement, we don't need `return $$value;`.
                    let needs_return = {
                        let before_context = script[..actual_start_byte].trim_end();
                        // It's in expression position if preceded by something that consumes the value:
                        // e.g., `= `, `(`, `,`, `? `, `: `, operator, etc.
                        // It's a statement if preceded by start of string, `;`, `{`, or newline boundary.
                        if before_context.is_empty() {
                            false
                        } else {
                            let last_char = before_context.chars().last().unwrap();
                            // Statement boundaries: `;`, `{`, or newline at statement level
                            !matches!(last_char, ';' | '{' | '\n')
                        }
                    };

                    // Generate the expansion
                    let expansion = if close_bracket == '}' {
                        expand_object_store_destructure(pattern_str, rhs_str, needs_return)
                    } else {
                        expand_array_store_destructure(
                            pattern_str,
                            rhs_str,
                            needs_return,
                            array_counter,
                        )
                    };

                    let mut new_script = String::new();
                    new_script.push_str(&script[..actual_start_byte]);
                    new_script.push_str(&expansion);
                    new_script.push_str(&script[actual_end_byte..]);
                    return new_script;
                }
            }
        }

        i += 1;
    }

    script.to_string()
}

/// Check if a destructure pattern contains any $store targets.
fn has_store_targets(pattern: &str) -> bool {
    let chars: Vec<char> = pattern.chars().collect();
    let len = chars.len();
    let mut i = 0;
    let mut in_string: Option<char> = None;

    while i < len {
        let c = chars[i];
        if let Some(q) = in_string {
            if c == q && (i == 0 || chars[i - 1] != '\\') {
                in_string = None;
            }
            i += 1;
            continue;
        }
        if c == '\'' || c == '"' || c == '`' {
            in_string = Some(c);
            i += 1;
            continue;
        }

        if c == '$' && i + 1 < len && (chars[i + 1].is_alphabetic() || chars[i + 1] == '_') {
            // Check it's not preceded by an ident char (would be part of a larger identifier)
            let prev_is_ident = i > 0 && is_js_identifier_char(chars[i - 1]);
            if !prev_is_ident {
                return true;
            }
        }
        i += 1;
    }
    false
}

/// Expand an object destructure `{key: $store, $store2, ...}` into `$.store_set()` calls.
/// When `needs_return` is true, the IIFE returns `$$value` (expression position).
fn expand_object_store_destructure(pattern: &str, rhs: &str, needs_return: bool) -> String {
    // Pattern is like: `{userName1: $userName1, $userName2}`
    let inner = pattern.trim();
    let inner = &inner[1..inner.len() - 1]; // strip { }

    let parts = split_top_level_commas(inner);

    // Check if the RHS is a simple identifier (no function calls, object literals, etc.)
    let rhs_is_simple = rhs
        .trim()
        .chars()
        .all(|c| c.is_alphanumeric() || c == '_' || c == '$');

    if rhs_is_simple {
        // Simple RHS: use comma-expression form for efficiency
        let mut set_calls = Vec::new();

        for part in &parts {
            let part = part.trim();
            if part.is_empty() {
                continue;
            }

            // Check for `key: $target` or just `$target` (shorthand)
            if let Some(colon_pos) = find_top_level_colon_pos(part) {
                let key = part[..colon_pos].trim();
                let target = part[colon_pos + 1..].trim();

                if target.starts_with('$')
                    && target.len() > 1
                    && (target.as_bytes()[1] as char).is_alphabetic()
                {
                    let store_name = &target[1..];
                    set_calls.push(format!("$.store_set({}, {}.{})", store_name, rhs, key));
                } else {
                    // Non-store target, keep the property extraction as regular assignment
                    set_calls.push(format!("{} = {}.{}", target, rhs, key));
                }
            } else {
                // Shorthand: `$userName2` means `$userName2: $userName2`
                if part.starts_with('$')
                    && part.len() > 1
                    && (part.as_bytes()[1] as char).is_alphabetic()
                {
                    let store_name = &part[1..];
                    // The property key is the full name with $
                    set_calls.push(format!("$.store_set({}, {}.{})", store_name, rhs, part));
                } else {
                    set_calls.push(format!("{} = {}.{}", part, rhs, part));
                }
            }
        }

        if set_calls.len() == 1 {
            format!("({})", set_calls[0])
        } else {
            format!("(\n\t\t\t{}\n\t\t)", set_calls.join(",\n\t\t\t"))
        }
    } else {
        // Complex RHS: use IIFE to evaluate it only once
        let mut body_lines = Vec::new();

        for part in &parts {
            let part = part.trim();
            if part.is_empty() {
                continue;
            }

            if let Some(colon_pos) = find_top_level_colon_pos(part) {
                let key = part[..colon_pos].trim();
                let target = part[colon_pos + 1..].trim();

                if target.starts_with('$')
                    && target.len() > 1
                    && (target.as_bytes()[1] as char).is_alphabetic()
                {
                    let store_name = &target[1..];
                    body_lines.push(format!("$.store_set({}, $$value.{});", store_name, key));
                } else {
                    body_lines.push(format!("{} = $$value.{};", target, key));
                }
            } else if part.starts_with('$')
                && part.len() > 1
                && (part.as_bytes()[1] as char).is_alphabetic()
            {
                let store_name = &part[1..];
                body_lines.push(format!("$.store_set({}, $$value.{});", store_name, part));
            } else {
                body_lines.push(format!("{} = $$value.{};", part, part));
            }
        }

        if needs_return {
            body_lines.push("return $$value;".to_string());
        }
        let body = body_lines.join("\n\t\t\t");
        format!("(($$value) => {{\n\t\t\t{}\n\t\t}})({})", body, rhs)
    }
}

/// Expand an array destructure `[$u, $v, $w]` into an IIFE with `$.to_array()` and `$.store_set()`.
/// When `needs_return` is true, the IIFE returns `$$value` (expression position).
fn expand_array_store_destructure(
    pattern: &str,
    rhs: &str,
    needs_return: bool,
    array_counter: &mut usize,
) -> String {
    let inner = pattern.trim();
    let inner = &inner[1..inner.len() - 1]; // strip [ ]

    let parts = split_top_level_commas(inner);
    let n = parts.len();

    let array_name = if *array_counter == 0 {
        "$$array".to_string()
    } else {
        format!("$$array_{}", array_counter)
    };
    *array_counter += 1;

    let mut body_lines = Vec::new();
    body_lines.push(format!("var {} = $.to_array($$value, {});", array_name, n));

    for (idx, part) in parts.iter().enumerate() {
        let part = part.trim();
        if part.is_empty() {
            continue;
        }

        if part.starts_with('$') && part.len() > 1 && (part.as_bytes()[1] as char).is_alphabetic() {
            let store_name = &part[1..];
            body_lines.push(format!(
                "$.store_set({}, {}[{}]);",
                store_name, array_name, idx
            ));
        } else {
            body_lines.push(format!("{} = {}[{}];", part, array_name, idx));
        }
    }

    if needs_return {
        body_lines.push("return $$value;".to_string());
    }
    let body = body_lines.join("\n\t\t\t");
    format!("(($$value) => {{\n\t\t\t{}\n\t\t}})({})", body, rhs)
}

/// Find matching opening bracket by walking backwards.
fn find_matching_open(s: &str, close_pos: usize, open: char, close: char) -> Option<usize> {
    let chars: Vec<char> = s.chars().collect();
    let mut depth = 1i32;
    let mut i = close_pos;
    while i > 0 {
        i -= 1;
        if chars[i] == close {
            depth += 1;
        } else if chars[i] == open {
            depth -= 1;
            if depth == 0 {
                return Some(i);
            }
        }
    }
    None
}

/// Find the end of an expression at the given start position.
fn find_expression_end(s: &str, start: usize) -> usize {
    let chars: Vec<char> = s.chars().collect();
    let len = chars.len();
    let mut depth = 0i32;
    let mut i = start;
    let mut in_string: Option<char> = None;

    while i < len {
        let c = chars[i];
        if let Some(q) = in_string {
            if c == '\\' {
                i += 2;
                continue;
            }
            if c == q {
                in_string = None;
            }
            i += 1;
            continue;
        }
        if c == '\'' || c == '"' || c == '`' {
            in_string = Some(c);
            i += 1;
            continue;
        }
        match c {
            '(' | '[' | '{' => {
                depth += 1;
                i += 1;
            }
            ')' | ']' | '}' => {
                if depth > 0 {
                    depth -= 1;
                    i += 1;
                } else {
                    return i;
                }
            }
            ';' | '\n' if depth == 0 => return i,
            _ => {
                i += 1;
            }
        }
    }
    len
}

/// Split a string on top-level commas (not inside brackets, parens, or strings).
fn split_top_level_commas(s: &str) -> Vec<String> {
    let mut parts = Vec::new();
    let mut current = String::new();
    let mut depth = 0i32;
    let mut in_string: Option<char> = None;

    for c in s.chars() {
        if let Some(q) = in_string {
            current.push(c);
            if c == q {
                in_string = None;
            }
            continue;
        }
        if c == '\'' || c == '"' || c == '`' {
            in_string = Some(c);
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

/// Find the position of a top-level colon in a string (not inside brackets/parens/strings).
fn find_top_level_colon_pos(s: &str) -> Option<usize> {
    let chars: Vec<char> = s.chars().collect();
    let mut depth = 0i32;
    let mut in_string: Option<char> = None;

    for (i, &c) in chars.iter().enumerate() {
        if let Some(q) = in_string {
            if c == q {
                in_string = None;
            }
            continue;
        }
        if c == '\'' || c == '"' || c == '`' {
            in_string = Some(c);
            continue;
        }
        match c {
            '(' | '[' | '{' => depth += 1,
            ')' | ']' | '}' => depth -= 1,
            ':' if depth == 0 => return Some(i),
            _ => {}
        }
    }
    None
}

/// Transform store assignments in script content for server-side rendering.
pub(crate) fn transform_store_assignments(script: &str) -> String {
    // Apply transformations repeatedly until convergence to handle nested store assignments
    // like `$value = { one: writable($value = { two: ... }) }`
    let mut result = transform_store_assignments_once(script);
    let mut iterations = 0;
    loop {
        let next = transform_store_assignments_once(&result);
        if next == result || iterations > 10 {
            break;
        }
        result = next;
        iterations += 1;
    }
    result
}

/// Single pass of store assignment transformation.
fn transform_store_assignments_once(script: &str) -> String {
    use regex::Regex;
    use std::sync::LazyLock;

    static STORE_ASSIGN_RE: LazyLock<Regex> = LazyLock::new(|| {
        Regex::new(r"\$([a-zA-Z_][a-zA-Z0-9_]*)\s*(\+\+|--|\+=|-=|\*=|/=|%=|&=|\|=|\^=|<<=|>>=|>>>=|\?\?=|&&=|\|\|=|=)\s*").unwrap()
    });

    static PREFIX_OP_RE: LazyLock<Regex> =
        LazyLock::new(|| Regex::new(r"(\+\+|--)\$([a-zA-Z_][a-zA-Z0-9_]*)").unwrap());

    let mut result = script.to_string();

    // First, transform $store.prop = value -> $.store_mutate(...)
    result = transform_store_property_mutations(&result);

    result = PREFIX_OP_RE
        .replace_all(&result, |caps: &regex::Captures| {
            let op = &caps[1];
            let store_name = &caps[2];
            if op == "++" {
                format!(
                    "$.update_store_pre($$store_subs ??= {{}}, '${0}', {0})",
                    store_name
                )
            } else {
                format!(
                    "$.update_store_pre($$store_subs ??= {{}}, '${0}', {0}, -1)",
                    store_name
                )
            }
        })
        .to_string();

    let mut new_result = String::new();
    let mut last_end = 0;

    for cap in STORE_ASSIGN_RE.captures_iter(&result) {
        let full_match = cap.get(0).unwrap();
        let start = full_match.start();
        let end = full_match.end();
        if start < last_end {
            continue;
        }

        let preceding = &result[..start];
        if preceding.ends_with("$.store_set(") || preceding.ends_with("$.store_get(") {
            continue;
        }

        if preceding.ends_with('$') {
            continue;
        }

        new_result.push_str(&result[last_end..start]);

        let store_name = &cap[1];
        let operator = &cap[2];

        match operator {
            "++" | "--" => {
                if operator == "++" {
                    new_result.push_str(&format!(
                        "$.update_store($$store_subs ??= {{}}, '${0}', {0})",
                        store_name
                    ));
                } else {
                    new_result.push_str(&format!(
                        "$.update_store($$store_subs ??= {{}}, '${0}', {0}, -1)",
                        store_name
                    ));
                }
            }
            "=" => {
                let rest = &result[end..];
                // Skip if this is a comparison operator (== or ===), not an assignment
                if rest.starts_with('=') {
                    // Push the matched text as-is and update last_end to skip past it
                    new_result.push_str(&result[start..end]);
                    last_end = end;
                    continue;
                }
                // Skip if this is an arrow function parameter: `$name =>`
                if rest.trim_start().starts_with('>') {
                    // The prefix result[last_end..start] was already pushed above.
                    // Push just the matched portion result[start..end] to keep $name = unchanged.
                    new_result.push_str(&result[start..end]);
                    last_end = end;
                    continue;
                }
                let value_end = find_statement_end(rest);
                let value = rest[..value_end].trim();
                // Strip trailing `//` comments from the value to prevent them from
                // ending up inside the $.store_set() call, where they would break
                // the code structure when comments are stripped by the test normalizer.
                let value = strip_trailing_line_comments(value);
                let value = value.trim();
                new_result.push_str(&format!("$.store_set({}, {})", store_name, value));
                last_end = end + value_end;
                continue;
            }
            _ => {
                let base_op = &operator[..operator.len() - 1];
                let rest = &result[end..];
                let value_end = find_statement_end(rest);
                let value = rest[..value_end].trim();
                new_result.push_str(&format!(
                    "$.store_set({}, $.store_get($$store_subs ??= {{}}, '${0}', {0}) {} {})",
                    store_name, base_op, value
                ));
                last_end = end + value_end;
                continue;
            }
        }

        last_end = end;
    }

    new_result.push_str(&result[last_end..]);

    new_result
}

/// Strip trailing `//` comments from each line of a multi-line value string,
/// being careful not to strip `//` inside string literals.
fn strip_trailing_line_comments(value: &str) -> String {
    value
        .lines()
        .map(|line| {
            let chars: Vec<char> = line.chars().collect();
            let len = chars.len();
            let mut i = 0;
            let mut in_str: Option<char> = None;

            while i < len {
                let ch = chars[i];

                // Handle string literals
                if let Some(q) = in_str {
                    if ch == '\\' && i + 1 < len {
                        i += 2;
                        continue;
                    }
                    if ch == q {
                        in_str = None;
                    }
                    i += 1;
                    continue;
                }

                if ch == '\'' || ch == '"' || ch == '`' {
                    in_str = Some(ch);
                    i += 1;
                    continue;
                }

                // Found `//` outside a string - this starts a comment
                if ch == '/' && i + 1 < len && chars[i + 1] == '/' {
                    // Return line up to the comment, trimming trailing whitespace
                    let before_comment: String = chars[..i].iter().collect();
                    return before_comment.trim_end().to_string();
                }

                i += 1;
            }

            line.to_string()
        })
        .collect::<Vec<_>>()
        .join("\n")
}

fn find_statement_end(s: &str) -> usize {
    let mut depth = 0;
    let chars: Vec<char> = s.chars().collect();
    let mut in_string = false;
    let mut string_char = ' ';
    let len = chars.len();
    let mut i = 0;

    while i < len {
        let c = chars[i];

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

        // Skip single-line comments: `//` to end of line
        if c == '/' && i + 1 < len && chars[i + 1] == '/' {
            // Advance past the comment to the newline (or end of string)
            while i < len && chars[i] != '\n' {
                i += 1;
            }
            // Now i is at the '\n' or past the end; the loop will handle it
            continue;
        }

        // Skip multi-line comments: `/* ... */`
        if c == '/' && i + 1 < len && chars[i + 1] == '*' {
            i += 2;
            while i + 1 < len && !(chars[i] == '*' && chars[i + 1] == '/') {
                i += 1;
            }
            if i + 1 < len {
                i += 2; // skip past `*/`
            }
            continue;
        }

        match c {
            '(' | '[' | '{' => depth += 1,
            ')' | ']' | '}' if depth > 0 => {
                depth -= 1;
            }
            ';' if depth == 0 => return i,
            '\n' if depth == 0 => {
                // Newline at depth 0 ends the statement ONLY if the previous
                // non-whitespace char is not a continuation operator (=, +, -, etc.)
                // This handles multi-line assignments like:
                //   $store.prop =\n    value;
                let prev_nonws = s[..i].chars().rev().find(|c| !c.is_whitespace());
                match prev_nonws {
                    Some(
                        '=' | '+' | '-' | '*' | '/' | '%' | '&' | '|' | '^' | '~' | '?' | ':' | ','
                        | '(' | '[' | '{',
                    ) => {
                        // Continuation - don't end statement
                    }
                    _ => return i,
                }
            }
            _ => {}
        }

        i += 1;
    }

    s.len()
}
