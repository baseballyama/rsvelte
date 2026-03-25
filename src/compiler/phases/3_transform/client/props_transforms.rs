//! Props, exports, and component property transformations.

use memchr::memmem;
use rustc_hash::FxHashSet;

use crate::compiler::phases::phase2_analyze::ComponentAnalysis;
use crate::compiler::phases::phase2_analyze::scope::BindingKind;

use super::{
    extract_destructured_prop_names, find_matching_paren, find_nearest_unmatched_open_delimiter,
    get_or_compile_regex, is_base_of_assigned_member, is_identifier_char,
    is_in_destructuring_pattern, is_in_function_param_or_shadowed, is_in_function_param_position,
    is_in_variable_declaration_list, is_inside_string_literal, is_on_left_side_of_assignment,
    is_shadowed_by_function_param, is_shadowed_by_local_var_decl, is_shorthand_object_property,
};

/// Transform prop reads in an expression to prop() calls.
///
/// For example, `a + b` where `a` and `b` are props becomes `a() + b()`.
pub(super) fn transform_prop_reads_in_expr(expr: &str, prop_vars: &[String]) -> String {
    if prop_vars.is_empty() {
        return expr.to_string();
    }

    // Quick pre-check: if none of the prop vars appear as identifiers, skip expensive transforms
    let var_set: FxHashSet<&str> = prop_vars.iter().map(|v| v.as_str()).collect();
    if !super::utils::text_contains_any_identifier(expr, &var_set) {
        return expr.to_string();
    }

    let mut result = expr.to_string();

    for prop_name in prop_vars {
        // Use word boundary matching to replace identifier references
        // But avoid replacing function calls that already have ()
        // Note: Rust's regex crate doesn't support lookahead, so we use a different approach:
        // Match the identifier and check the context manually

        let mut new_result = String::with_capacity(result.len() * 2);
        let chars: Vec<char> = result.chars().collect();
        let mut i = 0;

        // Track whether we're inside a string literal to avoid transforming
        // identifiers that happen to appear inside strings (e.g., 'paths updated')
        let mut in_string: Option<char> = None; // None or Some('\'') or Some('"') or Some('`')
        let mut template_brace_depth: Vec<i32> = Vec::new();

        while i < chars.len() {
            let c = chars[i];

            // Track string literal state
            if let Some(quote) = in_string {
                new_result.push(c);
                if c == '\\' && i + 1 < chars.len() {
                    // Skip escaped character
                    i += 1;
                    new_result.push(chars[i]);
                    i += 1;
                    continue;
                }
                if quote == '`' && c == '$' && i + 1 < chars.len() && chars[i + 1] == '{' {
                    // Enter template literal interpolation
                    new_result.push(chars[i + 1]);
                    template_brace_depth.push(0);
                    in_string = None;
                    i += 2;
                    continue;
                }
                if c == quote {
                    in_string = None;
                }
                i += 1;
                continue;
            }

            // Track template literal brace depth
            if !template_brace_depth.is_empty() {
                if c == '{' {
                    if let Some(depth) = template_brace_depth.last_mut() {
                        *depth += 1;
                    }
                } else if c == '}' {
                    let should_pop = template_brace_depth
                        .last()
                        .map(|d| *d == 0)
                        .unwrap_or(false);
                    if should_pop {
                        template_brace_depth.pop();
                        in_string = Some('`');
                        new_result.push(c);
                        i += 1;
                        continue;
                    } else if let Some(depth) = template_brace_depth.last_mut() {
                        *depth -= 1;
                    }
                }
            }

            // Check for string literal start
            if c == '\'' || c == '"' || c == '`' {
                in_string = Some(c);
                new_result.push(c);
                i += 1;
                continue;
            }

            // Check if we're at the start of the identifier
            let remaining = &result[result
                .char_indices()
                .nth(i)
                .map(|(idx, _)| idx)
                .unwrap_or(i)..];
            if remaining.starts_with(prop_name) {
                // Check character before (must be non-identifier char or start of string)
                let before_ok = if i == 0 {
                    true
                } else {
                    let prev_char = chars[i - 1];
                    // Dot means property access (e.g., items.filter) - don't transform
                    // But allow spread operator (...filter)
                    if prev_char == '.' {
                        // Check if it's a spread operator (...)
                        i >= 3 && chars[i - 3..i].iter().collect::<String>() == "..."
                    } else {
                        !prev_char.is_alphanumeric() && prev_char != '_' && prev_char != '$'
                    }
                };

                // Check character after (must be non-identifier char)
                let after_idx = i + prop_name.len();
                let after_ok = if after_idx >= chars.len() {
                    true
                } else {
                    let next_char = chars[after_idx];
                    !next_char.is_alphanumeric() && next_char != '_' && next_char != '$'
                };

                // Check if this is a target of an update expression (++ or --)
                // e.g., x++ or ++x - these should not be wrapped with ()
                // as they need special $.update_prop() handling
                let is_update_target = {
                    // Check for postfix ++ or --
                    let has_postfix = after_idx + 1 < chars.len()
                        && ((chars[after_idx] == '+' && chars[after_idx + 1] == '+')
                            || (chars[after_idx] == '-' && chars[after_idx + 1] == '-'));
                    // Check for prefix ++ or --
                    let has_prefix = i >= 2
                        && ((chars[i - 2] == '+' && chars[i - 1] == '+')
                            || (chars[i - 2] == '-' && chars[i - 1] == '-'));
                    has_postfix || has_prefix
                };

                // Check if this is on the left side of an assignment
                let is_assignment_target = {
                    let mut k = after_idx;
                    while k < chars.len() && chars[k].is_whitespace() {
                        k += 1;
                    }
                    if k < chars.len() && chars[k] == '=' {
                        // Make sure it's not == or ===
                        !(k + 1 < chars.len() && chars[k + 1] == '=')
                    } else {
                        k + 1 < chars.len()
                            && chars[k + 1] == '='
                            && (chars[k] == '+'
                                || chars[k] == '-'
                                || chars[k] == '*'
                                || chars[k] == '/')
                    }
                };

                // Check if this identifier is inside a $.update_prop() or similar call
                // After transform_prop_update_expressions runs, we get $.update_prop(x)
                // and we must not convert x to x() inside that call
                let is_inside_update_call = {
                    let prefix_str = &result[..result
                        .char_indices()
                        .nth(i)
                        .map(|(idx, _)| idx)
                        .unwrap_or(i)];
                    prefix_str.ends_with("$.update_prop(")
                        || prefix_str.ends_with("$.update_pre_prop(")
                        || prefix_str.ends_with("$.update_prop(")
                        || prefix_str.ends_with("$.update_pre_prop(")
                };

                // Check if this identifier is shadowed by a function parameter
                let is_shadowed = is_shadowed_by_function_param(&chars, i, prop_name);

                if before_ok
                    && after_ok
                    && !is_update_target
                    && !is_assignment_target
                    && !is_inside_update_call
                    && !is_shadowed
                {
                    // Check if this is a shorthand property in an object literal.
                    // e.g., `{ value }` should become `{ value: value() }` not `{ value() }`
                    // because `{ value() }` is a method definition, not a property.
                    let is_shorthand = is_shorthand_object_property(&chars, i, prop_name.len());

                    if is_shorthand {
                        // Expand shorthand: { foo } -> { foo: foo() }
                        new_result.push_str(prop_name);
                        new_result.push_str(": ");
                        new_result.push_str(prop_name);
                        new_result.push_str("()");
                    } else {
                        // Replace with prop_name()
                        new_result.push_str(prop_name);
                        new_result.push_str("()");
                    }
                    i += prop_name.len();
                    continue;
                }
            }

            // No match, just copy the character
            new_result.push(chars[i]);
            i += 1;
        }

        result = new_result;
    }

    result
}

/// Wrap prop source variable reads with `()` calls in a multi-line statement.
///
/// This uses the same sophisticated logic as `transform_state_in_expr` to correctly
/// handle string literals, comments, assignment targets, function parameters, etc.
/// but wraps with `var()` instead of `$.get(var)`.
///
/// For example:
/// - `console.log(n)` becomes `console.log(n())` where `n` is a prop source
/// - `let n = $.prop(...)` is NOT modified (declaration line)
/// - `n = 5` is NOT modified (already handled by transform_prop_assignments)
pub(super) fn wrap_prop_source_reads(
    expr: &str,
    prop_vars: &[String],
    non_bindable_prop_vars: &[String],
) -> String {
    // Skip lines that are prop declarations (contain $.prop() or $.rest_props())
    // These are generated by transform_props_destructuring and should not be modified
    if memmem::find(expr.as_bytes(), b"$.prop(").is_some()
        || memmem::find(expr.as_bytes(), b"$.prop_source(").is_some()
        || memmem::find(expr.as_bytes(), b"$.rest_props(").is_some()
    {
        return expr.to_string();
    }

    // Quick pre-check: if none of the prop vars appear as identifiers, skip expensive transforms
    let var_set: FxHashSet<&str> = prop_vars.iter().map(|v| v.as_str()).collect();
    if !super::utils::text_contains_any_identifier(expr, &var_set) {
        return expr.to_string();
    }

    let mut result = expr.to_string();

    for var in prop_vars {
        let mut new_result = String::new();
        let chars: Vec<char> = result.chars().collect();
        let var_chars: Vec<char> = var.chars().collect();
        let mut i = 0;

        // Track whether we're inside a string literal
        let mut in_string: Option<char> = None;
        let mut in_line_comment = false;
        let mut in_block_comment = false;
        // Track template literal nesting for ${} expressions
        let mut template_depth: Vec<usize> = Vec::new(); // stack of brace depths

        while i < chars.len() {
            let c = chars[i];

            // Handle line comment end
            if in_line_comment {
                new_result.push(c);
                if c == '\n' {
                    in_line_comment = false;
                }
                i += 1;
                continue;
            }

            // Handle block comment end
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

            // Handle template literal ${} expressions
            if in_string == Some('`') {
                if c == '\\' && i + 1 < chars.len() {
                    new_result.push(c);
                    new_result.push(chars[i + 1]);
                    i += 2;
                    continue;
                }
                if c == '$' && i + 1 < chars.len() && chars[i + 1] == '{' {
                    // Enter template expression - code context
                    new_result.push('$');
                    new_result.push('{');
                    template_depth.push(1);
                    in_string = None; // temporarily exit string mode
                    i += 2;
                    continue;
                }
                if c == '`' {
                    in_string = None;
                    new_result.push(c);
                    i += 1;
                    continue;
                }
                // Inside template literal string part - copy as-is
                new_result.push(c);
                i += 1;
                continue;
            }

            // Track braces inside template expressions
            if !template_depth.is_empty() && in_string.is_none() {
                if c == '{' {
                    if let Some(depth) = template_depth.last_mut() {
                        *depth += 1;
                    }
                } else if c == '}'
                    && let Some(depth) = template_depth.last_mut()
                {
                    *depth -= 1;
                    if *depth == 0 {
                        // Exit template expression - back to template literal string
                        template_depth.pop();
                        in_string = Some('`');
                        new_result.push('}');
                        i += 1;
                        continue;
                    }
                }
            }

            // Handle string literal boundaries (non-template)
            if in_string.is_none() {
                // Check for comment start
                if c == '/' && i + 1 < chars.len() {
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

                if c == '\'' || c == '"' {
                    in_string = Some(c);
                    new_result.push(c);
                    i += 1;
                    continue;
                }
                if c == '`' {
                    in_string = Some('`');
                    new_result.push(c);
                    i += 1;
                    continue;
                }
            } else {
                // Inside single/double quote string
                if Some(c) == in_string {
                    let escaped = if i > 0 && chars[i - 1] == '\\' {
                        let mut backslash_count = 0;
                        let mut j = i - 1;
                        loop {
                            if chars[j] == '\\' {
                                backslash_count += 1;
                            } else {
                                break;
                            }
                            if j == 0 {
                                break;
                            }
                            j -= 1;
                        }
                        backslash_count % 2 == 1
                    } else {
                        false
                    };
                    if !escaped {
                        in_string = None;
                    }
                }
                new_result.push(c);
                i += 1;
                continue;
            }

            // Skip replacements inside string literals
            if in_string.is_some() {
                new_result.push(c);
                i += 1;
                continue;
            }

            // Check for variable match
            if i + var_chars.len() <= chars.len() {
                let potential_match: String = chars[i..i + var_chars.len()].iter().collect();
                if potential_match == *var {
                    let before_ok = i == 0 || !is_identifier_char(chars[i - 1]);
                    let after_ok = i + var_chars.len() >= chars.len()
                        || !is_identifier_char(chars[i + var_chars.len()]);

                    if before_ok && after_ok {
                        // Check if preceded by dot (member access - skip)
                        let preceded_by_dot = i > 0
                            && chars[i - 1] == '.'
                            && !(i >= 3 && chars[i - 3..i].iter().collect::<String>() == "...");

                        // Check if in function parameter position
                        let in_param_position =
                            is_in_function_param_position(&chars, i, i + var_chars.len());

                        // Check if on left side of assignment
                        let is_assignment_target =
                            is_on_left_side_of_assignment(&chars, i, var_chars.len());

                        // Check if is getter/setter name
                        let is_getter_setter_name = {
                            let after_idx2 = i + var_chars.len();
                            let mut k = after_idx2;
                            while k < chars.len() && chars[k].is_whitespace() {
                                k += 1;
                            }
                            let has_paren_after = k < chars.len() && chars[k] == '(';
                            let has_get_before = i >= 4 && {
                                let prefix: String = chars[i - 4..i].iter().collect();
                                prefix == "get "
                            };
                            let has_set_before = i >= 4 && {
                                let prefix: String = chars[i - 4..i].iter().collect();
                                prefix == "set "
                            };
                            has_paren_after && (has_get_before || has_set_before)
                        };

                        // Check if object property key (not ternary operator)
                        // A property key follows `{`, `,`, or starts a line.
                        // The ternary colon `:` should not be confused with property colon.
                        let is_property_key = {
                            let after_idx2 = i + var_chars.len();
                            let mut k = after_idx2;
                            while k < chars.len() && chars[k].is_whitespace() {
                                k += 1;
                            }
                            let has_colon_after = k < chars.len() && chars[k] == ':';
                            if has_colon_after {
                                // Check if this is in an object literal context by looking
                                // at what precedes the identifier (skip whitespace AND comments).
                                let mut j = i;
                                loop {
                                    while j > 0 && chars[j - 1].is_whitespace() {
                                        j -= 1;
                                    }
                                    // Skip block comments: if we see `*/`, walk back to `/*`
                                    if j >= 2 && chars[j - 2] == '*' && chars[j - 1] == '/' {
                                        j -= 2;
                                        while j >= 2 {
                                            if chars[j - 2] == '/' && chars[j - 1] == '*' {
                                                j -= 2;
                                                break;
                                            }
                                            j -= 1;
                                        }
                                        continue;
                                    }
                                    break;
                                }
                                let prev_char = if j > 0 { Some(chars[j - 1]) } else { None };
                                // Property keys follow `{`, `,`, or `\n` (for multi-line objects)
                                matches!(prev_char, Some('{') | Some(','))
                            } else {
                                false
                            }
                        };

                        // Check if shorthand property
                        let is_shorthand_property =
                            is_shorthand_object_property(&chars, i, var_chars.len());

                        // Check if shadowed (by function param, for loop var, or local var decl)
                        let is_shadowed = is_shadowed_by_function_param(&chars, i, var)
                            || is_shadowed_by_local_var_decl(&chars, i, var);

                        // Check if this identifier is the argument to $.update_prop() or
                        // $.update_pre_prop(). After transform_prop_update_expressions runs,
                        // `count++` becomes `$.update_prop(count)` and we must NOT convert
                        // the `count` argument to `count()` here.
                        let is_inside_update_call = new_result.ends_with("$.update_prop(")
                            || new_result.ends_with("$.update_pre_prop(");

                        // Check if this variable is the base of a member expression being
                        // assigned to, e.g., `foo[bar] = 1` or `foo.prop = value`.
                        // In legacy mode, skip the read transform here and let
                        // transform_prop_assignments handle the full mutation wrapping
                        // (e.g., `foo(foo()[bar] = 1, true)`).
                        // For non-bindable props in runes mode, the read transform IS needed
                        // even on the LHS because member mutations are not wrapped.
                        // For bindable props (not in non_bindable_prop_vars), keep the old behavior.
                        let is_member_mutation = !non_bindable_prop_vars.contains(var)
                            && is_base_of_assigned_member(&chars, i, var_chars.len());

                        if !preceded_by_dot
                            && !in_param_position
                            && !is_assignment_target
                            && !is_getter_setter_name
                            && !is_property_key
                            && !is_shadowed
                            && !is_inside_update_call
                            && !is_member_mutation
                        {
                            if is_shorthand_property {
                                // Expand shorthand property: { answer } -> { answer: answer() }
                                new_result.push_str(var);
                                new_result.push_str(": ");
                                new_result.push_str(var);
                                new_result.push_str("()");
                            } else {
                                new_result.push_str(var);
                                new_result.push_str("()");
                            }
                            i += var_chars.len();
                            continue;
                        }
                    }
                }
            }
            new_result.push(chars[i]);
            i += 1;
        }

        result = new_result;
    }

    result
}

/// Transform a `let` declaration that contains variables re-exported via `export { ... }`.
///
/// For example: `let a, b, c, d;` with `export { a, c }` becomes:
/// ```
/// let a = $.prop($$props, 'a', 8);
/// let b;
/// let c = $.prop($$props, 'c', 8);
/// let d;
/// ```
///
/// Returns `Some(transformed)` if the declaration contains any BindableProp vars,
/// or `None` if no transformation is needed.
pub(super) fn transform_let_with_reexported_props(
    line: &str,
    analysis: &ComponentAnalysis,
) -> Option<String> {
    use crate::compiler::phases::phase2_analyze::scope::BindingKind;

    let trimmed = line.trim();

    // Only handle `let` declarations (not `const`, `var`, etc.)
    if !trimmed.starts_with("let ") {
        return None;
    }

    let rest = trimmed[4..].trim();
    let rest = rest.trim_end_matches(';').trim();

    // Split by commas (respecting nesting)
    let declarators = split_declarators(rest);

    // Check if any declarator is a BindableProp (including destructured patterns)
    let has_any_prop = declarators.iter().any(|decl| {
        let decl = decl.trim();
        if decl.starts_with('{') || decl.starts_with('[') {
            // Destructured pattern - check if any extracted name is a BindableProp
            let names = extract_destructured_prop_names(decl);
            names.iter().any(|name| {
                analysis
                    .root
                    .find_binding_any_scope(name)
                    .and_then(|idx| analysis.root.bindings.get(idx))
                    .is_some_and(|b| b.kind == BindingKind::BindableProp)
            })
        } else {
            let name = if let Some(eq_pos) = decl.find('=') {
                decl[..eq_pos].trim()
            } else {
                decl
            };
            analysis
                .root
                .find_binding_any_scope(name)
                .and_then(|idx| analysis.root.bindings.get(idx))
                .is_some_and(|b| b.kind == BindingKind::BindableProp)
        }
    });

    if !has_any_prop {
        return None;
    }

    let mut results = Vec::new();

    for decl in declarators {
        let decl = decl.trim();
        if decl.is_empty() {
            continue;
        }

        // Handle destructured patterns: let { a, b, c } = { ... }
        if decl.starts_with('{') || decl.starts_with('[') {
            if let Some(pattern_end) = find_destructuring_pattern_end(decl) {
                let pattern = decl[..pattern_end].trim();
                let rhs_part = decl[pattern_end..].trim();
                if let Some(rhs) = rhs_part.strip_prefix('=') {
                    let rhs = rhs.trim().trim_end_matches(';').trim();
                    // Create a tmp variable and flatten the destructuring
                    results.push(format!("let tmp = {};", rhs));
                    if let Some(flattened) =
                        flatten_destructured_let_with_reexported_props(pattern, "tmp", analysis)
                    {
                        results.push(flattened);
                    } else {
                        // Fallback: keep original
                        results.push(format!("let {} = {};", pattern, rhs));
                    }
                    continue;
                }
            }
            // Fallback
            results.push(format!("let {};", decl));
            continue;
        }

        // Parse: name = value or just name
        let (name, value) = if let Some(eq_pos) = decl.find('=') {
            let n = decl[..eq_pos].trim();
            let v = decl[eq_pos + 1..].trim();
            // Remove trailing line comment if present
            let v = if let Some(comment_pos) = find_line_comment_position(v) {
                v[..comment_pos].trim()
            } else {
                v
            };
            let v = v.trim_end_matches(';').trim();
            (n, Some(v))
        } else {
            (decl, None)
        };

        // Check if this variable is a BindableProp
        let is_prop = analysis
            .root
            .find_binding_any_scope(name)
            .and_then(|idx| analysis.root.bindings.get(idx))
            .is_some_and(|b| b.kind == BindingKind::BindableProp);

        if is_prop {
            // Get the prop alias if any
            let prop_alias = analysis
                .root
                .find_binding_any_scope(name)
                .and_then(|idx| analysis.root.bindings.get(idx))
                .and_then(|b| b.prop_alias.as_deref());
            let prop_name = prop_alias.unwrap_or(name);

            if let Some(val) = value {
                // Check if the value is simple.
                // An identifier is NOT simple if it refers to another prop/state variable
                // because after transforms it would become a function call (e.g., v2 -> v2()).
                // The official compiler checks is_simple_expression on the VISITED (transformed)
                // expression, where prop identifiers become CallExpressions.
                let mut is_simple = is_simple_expression_str(val);
                // Track if the identifier refers to a prop (it will be a no-arg call after transform,
                // and the official compiler unwraps no-arg calls to just the callee)
                let mut is_prop_ref = false;
                if is_simple
                    && is_identifier_str(val)
                    && analysis
                        .root
                        .find_binding_any_scope(val)
                        .and_then(|idx| analysis.root.bindings.get(idx))
                        .is_some_and(|b| {
                            matches!(
                                b.kind,
                                BindingKind::BindableProp
                                    | BindingKind::Prop
                                    | BindingKind::State
                                    | BindingKind::RawState
                                    | BindingKind::Derived
                            )
                        })
                {
                    is_simple = false;
                    is_prop_ref = true;
                }
                let flags = calculate_prop_flags(name, analysis, !is_simple);
                if is_simple {
                    results.push(format!(
                        "let {} = $.prop($$props, '{}', {}, {});",
                        name, prop_name, flags, val
                    ));
                } else if is_prop_ref {
                    // Prop/state identifier: after transform it becomes val() (no-arg call).
                    // The official compiler unwraps no-arg calls to just the callee,
                    // so we pass the identifier directly.
                    results.push(format!(
                        "let {} = $.prop($$props, '{}', {}, {});",
                        name, prop_name, flags, val
                    ));
                } else {
                    let lazy_arg = make_lazy_prop_arg(val);
                    results.push(format!(
                        "let {} = $.prop($$props, '{}', {}, {});",
                        name, prop_name, flags, lazy_arg
                    ));
                }
            } else {
                let flags = calculate_prop_flags(name, analysis, false);
                results.push(format!(
                    "let {} = $.prop($$props, '{}', {});",
                    name, prop_name, flags
                ));
            }
        } else {
            // Non-exported variable, keep as-is
            if let Some(val) = value {
                results.push(format!("let {} = {};", name, val));
            } else {
                results.push(format!("let {};", name));
            }
        }
    }

    Some(results.join("\n"))
}

/// Apply prop source read transformations inside the default value of $.prop() calls.
///
/// `wrap_prop_source_reads` skips lines containing `$.prop(`, so this function specifically
/// handles the default value expressions inside `$.prop($$props, 'name', flags, DEFAULT)`.
/// This is needed when export-let default values contain references to other props,
/// e.g.: `export let click_1 = () => { logs.push('click_1'); }`
/// where `logs` is a prop and should become `logs()` inside the default value.
pub(super) fn apply_prop_reads_in_prop_default_values(line: &str, prop_vars: &[String]) -> String {
    // Split $.prop() calls into prefix + default-value + suffix, transform the default value only.
    // The pattern is: $.prop($$props, 'name', N, DEFAULT)
    // We find each $.prop( and extract the 4th argument.
    let mut result = String::new();
    let mut search_from = 0;

    while let Some(prop_pos) = memmem::find(&line.as_bytes()[search_from..], b"$.prop(") {
        let abs_pos = search_from + prop_pos;

        // Copy everything before this $.prop( unchanged
        result.push_str(&line[search_from..abs_pos]);

        // Parse the $.prop(...) call to find the 4th argument
        let after_prop = &line[abs_pos + 7..]; // after "$.prop("
        let chars: Vec<char> = after_prop.chars().collect();
        let mut i = 0;
        let mut depth = 1i32;
        let mut arg_count = 0;
        let mut fourth_arg_start: Option<usize> = None;
        let mut fourth_arg_end: Option<usize> = None;
        let mut in_string: Option<char> = None;
        let mut char_byte_positions: Vec<usize> = Vec::new();

        // Build char->byte mapping
        {
            let mut byte_pos = 0;
            for ch in after_prop.chars() {
                char_byte_positions.push(byte_pos);
                byte_pos += ch.len_utf8();
            }
            char_byte_positions.push(byte_pos);
        }

        while i < chars.len() {
            let c = chars[i];

            // Handle strings
            if let Some(quote) = in_string {
                if c == '\\' && i + 1 < chars.len() {
                    i += 2;
                    continue;
                }
                if c == quote {
                    in_string = None;
                }
                i += 1;
                continue;
            }

            match c {
                '"' | '\'' | '`' => {
                    in_string = Some(c);
                }
                '(' | '[' | '{' => depth += 1,
                ')' | ']' | '}' => {
                    depth -= 1;
                    if depth == 0 {
                        // End of $.prop() call
                        if fourth_arg_start.is_some() {
                            fourth_arg_end = Some(i);
                        }
                        break;
                    }
                }
                ',' if depth == 1 => {
                    arg_count += 1;
                    if arg_count == 3 {
                        // The 4th argument starts after this comma
                        // Skip any whitespace
                        let mut j = i + 1;
                        while j < chars.len() && chars[j].is_whitespace() {
                            j += 1;
                        }
                        fourth_arg_start = Some(j);
                    }
                }
                _ => {}
            }
            i += 1;
        }

        // Now reconstruct the $.prop() call with transformed 4th arg
        if let (Some(start_char), Some(end_char)) = (fourth_arg_start, fourth_arg_end) {
            let start_byte = char_byte_positions[start_char];
            let end_byte = char_byte_positions[end_char];
            let before_default = &after_prop[..start_byte];
            let default_val = &after_prop[start_byte..end_byte];
            let _after_default = &after_prop[end_byte..];

            let transformed_default = wrap_prop_source_reads(default_val, prop_vars, &[]);
            result.push_str("$.prop(");
            result.push_str(before_default);
            result.push_str(&transformed_default);
            // Continue parsing from after the closing paren
            let close_byte = char_byte_positions[end_char + 1];
            result.push_str(&after_prop[end_byte..close_byte]);
            search_from = abs_pos + 7 + close_byte;
        } else {
            // No 4th arg found, copy $.prop(...) as-is
            result.push_str("$.prop(");
            // Find where the $.prop() call ends
            if let Some(end_char) = {
                let mut ec = None;
                let mut d = 1i32;
                let mut s: Option<char> = None;
                for (ci, ch) in chars.iter().enumerate() {
                    if let Some(q) = s {
                        if *ch == q {
                            s = None;
                        }
                        continue;
                    }
                    match ch {
                        '"' | '\'' | '`' => s = Some(*ch),
                        '(' | '[' | '{' => d += 1,
                        ')' | ']' | '}' => {
                            d -= 1;
                            if d == 0 {
                                ec = Some(ci);
                                break;
                            }
                        }
                        _ => {}
                    }
                }
                ec
            } {
                let end_byte = char_byte_positions[end_char + 1];
                result.push_str(&after_prop[..end_byte]);
                search_from = abs_pos + 7 + end_byte;
            } else {
                result.push_str(after_prop);
                search_from = line.len();
            }
        }
    }

    // Copy remaining
    result.push_str(&line[search_from..]);
    result
}

pub(super) fn transform_export_let(line: &str, analysis: &ComponentAnalysis) -> String {
    let trimmed = line.trim();

    // Pattern: export let name = value; or export let name;
    if !trimmed.starts_with("export let ") {
        return line.to_string();
    }

    let rest = trimmed[11..].trim(); // After "export let "
    let rest = rest.trim_end_matches(';').trim();

    // Handle multiple declarators: export let a, b, c;
    // Split by comma, but be careful of commas inside default values
    let declarators = split_declarators(rest);

    let mut results = Vec::new();

    for decl in declarators {
        let decl = decl.trim();
        if decl.is_empty() {
            continue;
        }

        // Parse: name = value or just name
        if let Some(eq_pos) = decl.find('=') {
            let name = decl[..eq_pos].trim();
            let mut value = decl[eq_pos + 1..].trim();

            // Remove trailing line comment if present
            // Need to handle strings correctly - don't strip // inside strings
            if let Some(comment_pos) = find_line_comment_position(value) {
                value = value[..comment_pos].trim();
            }

            // Remove trailing semicolon from value (after comment removal)
            let value = value.trim_end_matches(';').trim();

            // Check if the value is a store accessor (e.g., $foo)
            // Store accessors like $foo become $foo() calls after transformation.
            // The official compiler handles this by passing the store getter function
            // directly with PROPS_IS_LAZY_INITIAL set (same as no-arg call expressions).
            let is_store_accessor = value.starts_with('$')
                && value.len() > 1
                && value[1..].chars().all(|c| c.is_alphanumeric() || c == '_')
                && analysis
                    .root
                    .bindings
                    .iter()
                    .any(|b| b.name == value && matches!(b.kind, BindingKind::StoreSub));

            if is_store_accessor {
                // Store accessor: pass the getter function directly with PROPS_IS_LAZY_INITIAL
                let flags = calculate_prop_flags(name, analysis, true);
                results.push(format!(
                    "let {} = $.prop($$props, '{}', {}, {});",
                    name, name, flags, value
                ));
            } else {
                // Check if the value is a "simple expression" that can be passed directly
                // Non-simple expressions need to be wrapped in a thunk and use PROPS_IS_LAZY_INITIAL
                let mut is_simple = is_simple_expression_str(value);
                // An identifier is NOT simple if it refers to another prop/state variable
                // because after transforms it would become a function call (e.g., v2 -> v2()).
                let mut is_prop_ref = false;
                if is_simple
                    && is_identifier_str(value)
                    && analysis
                        .root
                        .find_binding_any_scope(value)
                        .and_then(|idx| analysis.root.bindings.get(idx))
                        .is_some_and(|b| {
                            matches!(
                                b.kind,
                                BindingKind::BindableProp
                                    | BindingKind::Prop
                                    | BindingKind::State
                                    | BindingKind::RawState
                                    | BindingKind::Derived
                            )
                        })
                {
                    is_simple = false;
                    is_prop_ref = true;
                }

                // Calculate flags: PROPS_IS_BINDABLE + PROPS_IS_UPDATED + PROPS_IS_LAZY_INITIAL
                let flags = calculate_prop_flags(name, analysis, !is_simple);

                if is_simple {
                    results.push(format!(
                        "let {} = $.prop($$props, '{}', {}, {});",
                        name, name, flags, value
                    ));
                } else if is_prop_ref {
                    // Prop/state identifier: pass directly (official compiler unwraps no-arg calls)
                    results.push(format!(
                        "let {} = $.prop($$props, '{}', {}, {});",
                        name, name, flags, value
                    ));
                } else {
                    // Wrap non-simple values in a thunk: () => value
                    // When value starts with '{', wrap in parens to prevent
                    // OXC from parsing `() => {...}` as arrow with block body
                    // instead of arrow returning object literal
                    let lazy_arg = make_lazy_prop_arg(value);
                    results.push(format!(
                        "let {} = $.prop($$props, '{}', {}, {});",
                        name, name, flags, lazy_arg
                    ));
                }
            }
        } else {
            let name = decl;
            // Calculate flags: PROPS_IS_BINDABLE + PROPS_IS_UPDATED if the binding is updated
            let flags = calculate_prop_flags(name, analysis, false);

            results.push(format!(
                "let {} = $.prop($$props, '{}', {});",
                name, name, flags
            ));
        }
    }

    results.join("\n")
}

/// Transform destructured `export let { ... } = expr` patterns into flattened
/// `$.prop()` calls with path-based accessors.
///
/// Corresponds to the official Svelte compiler's `extract_paths` pattern used in
/// `VariableDeclaration.js` to flatten destructuring.
///
/// Example:
///   `export let { a, b: { c }, e: [e_one], g = default_g } = THING`
/// becomes:
///   `let tmp = THING,
///       $$array = $.derived(() => $.to_array(tmp.e, 1)),
///       a = $.prop($$props, 'a', 24, () => tmp.a),
///       c = $.prop($$props, 'c', 24, () => tmp.b.c),
///       e_one = $.prop($$props, 'e_one', 24, () => $.get($$array)[0]),
///       g = $.prop($$props, 'g', 24, () => $.fallback(tmp.g, default_g));`
pub(super) fn transform_destructured_export_let(
    statement: &str,
    analysis: &ComponentAnalysis,
) -> Option<String> {
    let trimmed = statement.trim();
    let rest = trimmed.strip_prefix("export let ")?.trim();

    // Find the `= RHS` assignment
    // We need to find the `=` that separates the pattern from the RHS value
    // The pattern can contain `=` for default values, so we need to find the
    // `=` that is at the top level outside the pattern
    let pattern_end = find_destructuring_pattern_end(rest)?;
    let pattern = rest[..pattern_end].trim();
    let rhs_part = rest[pattern_end..].trim();
    let rhs = rhs_part.strip_prefix('=')?.trim();
    let rhs = rhs.trim_end_matches(';').trim();

    let mut declarations = Vec::new();
    let mut array_counter = 0;

    // First declaration: tmp = RHS
    declarations.push(format!("tmp = {}", rhs));

    // Process the destructuring pattern
    extract_destructured_export_paths(
        pattern,
        "tmp",
        &mut declarations,
        &mut array_counter,
        analysis,
    )?;

    Some(format!("let {};", declarations.join(",\n\t")))
}

/// Find the end position of a destructuring pattern in `{ ... } = RHS` or `[ ... ] = RHS`.
/// Returns the position after the closing `}` or `]`.
pub(super) fn find_destructuring_pattern_end(s: &str) -> Option<usize> {
    let s = s.trim();
    let first = s.chars().next()?;
    if first != '{' && first != '[' {
        return None;
    }

    let chars: Vec<char> = s.chars().collect();
    let mut depth = 0;
    let mut i = 0;
    let mut in_string = false;
    let mut string_char = ' ';

    while i < chars.len() {
        if in_string {
            if chars[i] == '\\' {
                i += 2;
                continue;
            }
            if chars[i] == string_char {
                in_string = false;
            }
            i += 1;
            continue;
        }

        if chars[i] == '\'' || chars[i] == '"' || chars[i] == '`' {
            in_string = true;
            string_char = chars[i];
            i += 1;
            continue;
        }

        if chars[i] == '{' || chars[i] == '[' {
            depth += 1;
        } else if chars[i] == '}' || chars[i] == ']' {
            depth -= 1;
            if depth == 0 {
                return Some(i + 1);
            }
        }

        i += 1;
    }
    None
}

/// Recursively extract paths from a destructuring pattern for `export let` props.
pub(super) fn extract_destructured_export_paths(
    pattern: &str,
    base_path: &str,
    declarations: &mut Vec<String>,
    array_counter: &mut usize,
    analysis: &ComponentAnalysis,
) -> Option<()> {
    let pattern = pattern.trim();

    if pattern.starts_with('{') && pattern.ends_with('}') {
        // Object destructuring
        let inner = &pattern[1..pattern.len() - 1];
        let properties = split_destructuring_properties(inner);

        for prop in properties {
            let prop = prop.trim();
            if prop.is_empty() {
                continue;
            }

            // Handle rest element: ...rest
            if let Some(rest_name) = prop.strip_prefix("...") {
                let rest_name = rest_name.trim();
                let flags = calculate_prop_flags(rest_name, analysis, true);
                // Rest elements need special handling
                let body = format!(
                    "const {{ {} }} = {}; return {};",
                    rest_name, base_path, rest_name
                );
                declarations.push(format!(
                    "{} = $.prop($$props, '{}', {}, () => {{ {} }})",
                    rest_name, rest_name, flags, body
                ));
                continue;
            }

            // Check for default value: name = default
            // Check for rename: key: value
            if let Some((key, value_pattern)) = split_property_key_value(prop) {
                // Renamed property: key: value_pattern
                let new_path = format!("{}.{}", base_path, key);

                if value_pattern.starts_with('{') || value_pattern.starts_with('[') {
                    // Nested destructuring: b: { c, d: [...] }
                    extract_destructured_export_paths(
                        value_pattern,
                        &new_path,
                        declarations,
                        array_counter,
                        analysis,
                    )?;
                } else {
                    // Simple rename: b: c  or  b: c = default
                    let (binding_name, default_value) = split_binding_name_default(value_pattern);
                    let flags = calculate_prop_flags(binding_name, analysis, true);
                    if let Some(default_val) = default_value {
                        declarations.push(format!(
                            "{} = $.prop($$props, '{}', {}, () => $.fallback({}, {}))",
                            binding_name, binding_name, flags, new_path, default_val
                        ));
                    } else {
                        declarations.push(format!(
                            "{} = $.prop($$props, '{}', {}, () => {})",
                            binding_name, binding_name, flags, new_path
                        ));
                    }
                }
            } else {
                // Simple property: a  or  a = default
                let (binding_name, default_value) = split_binding_name_default(prop);
                let new_path = format!("{}.{}", base_path, binding_name);
                let flags = calculate_prop_flags(binding_name, analysis, true);
                if let Some(default_val) = default_value {
                    declarations.push(format!(
                        "{} = $.prop($$props, '{}', {}, () => $.fallback({}, {}))",
                        binding_name, binding_name, flags, new_path, default_val
                    ));
                } else {
                    declarations.push(format!(
                        "{} = $.prop($$props, '{}', {}, () => {})",
                        binding_name, binding_name, flags, new_path
                    ));
                }
            }
        }
    } else if pattern.starts_with('[') && pattern.ends_with(']') {
        // Array destructuring
        let inner = &pattern[1..pattern.len() - 1];
        let elements = split_destructuring_properties(inner);
        let _non_empty_count = elements.iter().filter(|e| !e.trim().is_empty()).count();
        let total_count = elements.len(); // include holes for array length

        // Create an $$array derived for array conversion
        let array_var = if *array_counter == 0 {
            "$$array".to_string()
        } else {
            format!("$$array_{}", array_counter)
        };
        *array_counter += 1;

        declarations.push(format!(
            "{} = $.derived(() => $.to_array({}, {}))",
            array_var, base_path, total_count
        ));

        for (idx, elem) in elements.iter().enumerate() {
            let elem = elem.trim();
            if elem.is_empty() {
                continue; // Skip holes
            }

            // Handle rest element: ...rest
            if let Some(rest_pattern) = elem.strip_prefix("...") {
                let rest_pattern = rest_pattern.trim();
                if rest_pattern.starts_with('{') || rest_pattern.starts_with('[') {
                    // Rest with nested destructuring
                    let slice_path = format!("$.get({}).slice({})", array_var, idx);
                    extract_destructured_export_paths(
                        rest_pattern,
                        &slice_path,
                        declarations,
                        array_counter,
                        analysis,
                    )?;
                } else {
                    let flags = calculate_prop_flags(rest_pattern, analysis, true);
                    declarations.push(format!(
                        "{} = $.prop($$props, '{}', {}, () => $.get({}).slice({}))",
                        rest_pattern, rest_pattern, flags, array_var, idx
                    ));
                }
                continue;
            }

            let element_path = format!("$.get({})[{}]", array_var, idx);

            if elem.starts_with('{') || elem.starts_with('[') {
                // Nested destructuring in array
                extract_destructured_export_paths(
                    elem,
                    &element_path,
                    declarations,
                    array_counter,
                    analysis,
                )?;
            } else {
                // Simple element or with default
                let (binding_name, default_value) = split_binding_name_default(elem);
                let flags = calculate_prop_flags(binding_name, analysis, true);
                if let Some(default_val) = default_value {
                    declarations.push(format!(
                        "{} = $.prop($$props, '{}', {}, () => $.fallback({}, {}))",
                        binding_name, binding_name, flags, element_path, default_val
                    ));
                } else {
                    declarations.push(format!(
                        "{} = $.prop($$props, '{}', {}, () => {})",
                        binding_name, binding_name, flags, element_path
                    ));
                }
            }
        }
    } else {
        return None;
    }

    Some(())
}

/// Flatten a destructured `let { ... }` pattern where some bindings are re-exported.
/// Non-exported bindings become `name = tmp.prop`, exported bindings become `$.prop()` calls.
pub(super) fn flatten_destructured_let_with_reexported_props(
    pattern: &str,
    base_path: &str,
    analysis: &ComponentAnalysis,
) -> Option<String> {
    use crate::compiler::phases::phase2_analyze::scope::BindingKind;

    let pattern = pattern.trim();
    let mut declarations = Vec::new();

    if pattern.starts_with('{') && pattern.ends_with('}') {
        let inner = &pattern[1..pattern.len() - 1];
        let properties = split_destructuring_properties(inner);

        for prop in properties {
            let prop = prop.trim();
            if prop.is_empty() {
                continue;
            }

            if let Some((key, value_pattern)) = split_property_key_value(prop) {
                let new_path = format!("{}.{}", base_path, key);

                if value_pattern.starts_with('{') || value_pattern.starts_with('[') {
                    // Nested destructuring - recurse
                    if let Some(nested) = flatten_destructured_let_with_reexported_props(
                        value_pattern,
                        &new_path,
                        analysis,
                    ) {
                        declarations.push(nested);
                    }
                } else {
                    let (binding_name, default_value) = split_binding_name_default(value_pattern);
                    let is_prop = analysis
                        .root
                        .find_binding_any_scope(binding_name)
                        .and_then(|idx| analysis.root.bindings.get(idx))
                        .is_some_and(|b| b.kind == BindingKind::BindableProp);

                    if is_prop {
                        let flags = calculate_prop_flags(binding_name, analysis, true);
                        if let Some(default_val) = default_value {
                            declarations.push(format!(
                                "let {} = $.prop($$props, '{}', {}, () => $.fallback({}, {}));",
                                binding_name, binding_name, flags, new_path, default_val
                            ));
                        } else {
                            declarations.push(format!(
                                "let {} = $.prop($$props, '{}', {}, () => {});",
                                binding_name, binding_name, flags, new_path
                            ));
                        }
                    } else if let Some(default_val) = default_value {
                        declarations.push(format!(
                            "let {} = {} !== undefined ? {} : {};",
                            binding_name, new_path, new_path, default_val
                        ));
                    } else {
                        declarations.push(format!("let {} = {};", binding_name, new_path));
                    }
                }
            } else {
                let (binding_name, default_value) = split_binding_name_default(prop);
                let new_path = format!("{}.{}", base_path, binding_name);
                let is_prop = analysis
                    .root
                    .find_binding_any_scope(binding_name)
                    .and_then(|idx| analysis.root.bindings.get(idx))
                    .is_some_and(|b| b.kind == BindingKind::BindableProp);

                if is_prop {
                    let flags = calculate_prop_flags(binding_name, analysis, true);
                    if let Some(default_val) = default_value {
                        declarations.push(format!(
                            "let {} = $.prop($$props, '{}', {}, () => $.fallback({}, {}));",
                            binding_name, binding_name, flags, new_path, default_val
                        ));
                    } else {
                        declarations.push(format!(
                            "let {} = $.prop($$props, '{}', {}, () => {});",
                            binding_name, binding_name, flags, new_path
                        ));
                    }
                } else if let Some(default_val) = default_value {
                    declarations.push(format!(
                        "let {} = {} !== undefined ? {} : {};",
                        binding_name, new_path, new_path, default_val
                    ));
                } else {
                    declarations.push(format!("let {} = {};", binding_name, new_path));
                }
            }
        }
    } else {
        return None;
    }

    Some(declarations.join("\n"))
}

/// Split a property pattern into key and value parts around `:`.
/// Returns None if there's no `:` (simple property like `a` or `a = default`).
/// Handles nested patterns so `b: { c }` splits into `("b", "{ c }")`.
pub(super) fn split_property_key_value(prop: &str) -> Option<(&str, &str)> {
    let chars: Vec<char> = prop.chars().collect();
    let mut depth = 0;
    for (i, &ch) in chars.iter().enumerate() {
        match ch {
            '{' | '[' | '(' => depth += 1,
            '}' | ']' | ')' => depth -= 1,
            ':' if depth == 0 => {
                return Some((prop[..i].trim(), prop[i + 1..].trim()));
            }
            _ => {}
        }
    }
    None
}

/// Split a binding name from its default value.
/// `name = default` -> `("name", Some("default"))`
/// `name` -> `("name", None)`
pub(super) fn split_binding_name_default(s: &str) -> (&str, Option<&str>) {
    let s = s.trim();
    if let Some(eq_pos) = s.find('=') {
        // Make sure this isn't == or =>
        let after = s.get(eq_pos + 1..eq_pos + 2).unwrap_or("");
        if after == "=" || after == ">" {
            return (s, None);
        }
        (s[..eq_pos].trim(), Some(s[eq_pos + 1..].trim()))
    } else {
        (s, None)
    }
}

/// Split destructuring properties/elements by comma, respecting nesting depth.
pub(super) fn split_destructuring_properties(s: &str) -> Vec<&str> {
    let chars: Vec<char> = s.chars().collect();
    let mut result = Vec::new();
    let mut depth = 0;
    let mut start = 0;
    let mut in_string = false;
    let mut string_char = ' ';

    for (i, &ch) in chars.iter().enumerate() {
        if in_string {
            if ch == '\\' {
                continue;
            }
            if ch == string_char {
                in_string = false;
            }
            continue;
        }
        if ch == '\'' || ch == '"' || ch == '`' {
            in_string = true;
            string_char = ch;
            continue;
        }
        match ch {
            '{' | '[' | '(' => depth += 1,
            '}' | ']' | ')' => depth -= 1,
            ',' if depth == 0 => {
                result.push(&s[start..i]);
                start = i + 1;
            }
            _ => {}
        }
    }
    result.push(&s[start..]);
    result
}

/// Calculate the prop flags for a given prop name.
///
/// Matches the official Svelte compiler's `get_prop_source()` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/utils.js`
///
/// Flags start at 0 and are built up based on binding and analysis state:
/// - PROPS_IS_IMMUTABLE (1): if analysis.immutable
/// - PROPS_IS_RUNES (2): if analysis.runes
/// - PROPS_IS_UPDATED (4): if accessors, or binding is updated (with immutable-aware logic)
/// - PROPS_IS_BINDABLE (8): only if binding.kind == BindableProp
/// - PROPS_IS_LAZY_INITIAL (16): if default value is non-simple
pub(super) fn calculate_prop_flags(
    name: &str,
    analysis: &ComponentAnalysis,
    is_lazy_initial: bool,
) -> i32 {
    use crate::compiler::constants::{
        PROPS_IS_BINDABLE, PROPS_IS_IMMUTABLE, PROPS_IS_LAZY_INITIAL, PROPS_IS_RUNES,
        PROPS_IS_UPDATED,
    };
    use crate::compiler::phases::phase2_analyze::scope::BindingKind;

    let mut flags = 0;

    // Look up the binding to check its kind and update status
    let binding = analysis
        .root
        .find_binding_any_scope(name)
        .and_then(|idx| analysis.root.bindings.get(idx));

    // PROPS_IS_BINDABLE: only if binding.kind == BindableProp
    if let Some(b) = binding
        && b.kind == BindingKind::BindableProp
    {
        flags |= PROPS_IS_BINDABLE;
    }

    // PROPS_IS_IMMUTABLE: if analysis.immutable
    if analysis.immutable {
        flags |= PROPS_IS_IMMUTABLE;
    }

    // PROPS_IS_RUNES: if analysis.runes
    if analysis.runes {
        flags |= PROPS_IS_RUNES;
    }

    // PROPS_IS_UPDATED: matches official logic:
    // if (accessors || (immutable ? (reassigned || (runes && mutated)) : updated))
    if analysis.accessors {
        flags |= PROPS_IS_UPDATED;
    } else if let Some(b) = binding {
        let is_updated = if analysis.immutable {
            b.reassigned || (analysis.runes && b.mutated)
        } else {
            b.is_updated()
        };
        if is_updated {
            flags |= PROPS_IS_UPDATED;
        }
    }

    // PROPS_IS_LAZY_INITIAL: if the default value needs to be wrapped in a thunk
    if is_lazy_initial {
        flags |= PROPS_IS_LAZY_INITIAL;
    }

    flags
}

/// Check if a string is a valid JavaScript identifier.
pub(super) fn is_identifier_str(s: &str) -> bool {
    let trimmed = s.trim();
    let mut chars = trimmed.chars();
    match chars.next() {
        Some(first) if first.is_ascii_alphabetic() || first == '_' || first == '$' => {
            chars.all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '$')
        }
        _ => false,
    }
}

/// Check if a value string represents a "simple expression" that can be passed directly.
///
/// Simple expressions don't need to be wrapped in a thunk (factory function).
/// This matches the official Svelte compiler's `is_simple_expression()` function.
///
/// Simple expressions include:
/// - Literals (numbers, strings, booleans, null, undefined)
/// - Identifiers (variable references)
/// - Arrow function expressions
/// - Function expressions
/// - Binary and logical expressions where both sides are simple
/// - Conditional expressions where all parts are simple
///
/// Non-simple expressions include:
/// - Array literals: [1, 2, 3]
/// - Object literals: { a: 1 }
/// - Call expressions: foo()
/// - Template literals: `hello`, `${x}` (TemplateLiteral != Literal in AST)
pub(super) fn is_simple_expression_str(value: &str) -> bool {
    let trimmed = value.trim();

    // Empty is not simple
    if trimmed.is_empty() {
        return false;
    }

    // Array literals are NOT simple
    if trimmed.starts_with('[') {
        return false;
    }

    // Object literals are NOT simple
    if trimmed.starts_with('{') {
        return false;
    }

    // Call expressions are NOT simple (unless it's a no-arg function reference)
    // e.g., foo() is not simple, but foo is simple
    if trimmed.ends_with(')')
        && !trimmed.starts_with("function")
        && memchr::memmem::find(trimmed.as_bytes(), b"=>").is_none()
    {
        // Check if it looks like a call expression
        // Find matching parens
        let mut depth = 0;
        for (i, c) in trimmed.char_indices().rev() {
            match c {
                ')' => depth += 1,
                '(' => {
                    depth -= 1;
                    if depth == 0 {
                        // Check if this is a call expression or a function definition
                        let before = &trimmed[..i];
                        // If there's a valid identifier before the paren, it's a call
                        if !before.is_empty()
                            && !before.ends_with("function")
                            && memchr::memmem::find(before.as_bytes(), b"=>").is_none()
                        {
                            return false;
                        }
                        break;
                    }
                }
                _ => {}
            }
        }
    }

    // Template literals are NOT simple (even without expressions like `red`)
    // The official Svelte compiler only considers Literal, Identifier,
    // ArrowFunctionExpression, and FunctionExpression as simple.
    // TemplateLiteral is a different AST node type from Literal.
    if trimmed.starts_with('`') {
        return false;
    }

    // new expressions are NOT simple
    if trimmed.starts_with("new ") {
        return false;
    }

    // typeof expressions are NOT simple
    if trimmed.starts_with("typeof ") {
        return false;
    }

    // Member expressions (containing dots) are NOT simple
    if !trimmed.starts_with("function")
        && memchr::memmem::find(trimmed.as_bytes(), b"=>").is_none()
        && !trimmed.starts_with('"')
        && !trimmed.starts_with('\'')
        && !trimmed.starts_with('`')
        && trimmed.contains('.')
        && trimmed.parse::<f64>().is_err()
    {
        return false;
    }

    // Everything else is considered simple:
    // - Numeric literals: 42, 3.14, -1
    // - String literals: "hello", 'world'
    // - Boolean literals: true, false
    // - null, undefined
    // - Identifiers: foo, bar
    // - Arrow functions: () => {}, x => x
    // - Function expressions: function() {}
    // - Binary/logical expressions: a + b, a && b
    // - Conditional expressions: a ? b : c
    true
}

/// Create the argument for a lazy prop initializer.
pub(super) fn make_lazy_prop_arg(value: &str) -> String {
    let trimmed = value.trim();
    if let Some(callee) = trimmed.strip_suffix("()") {
        let callee = callee.trim();
        if !callee.is_empty()
            && callee
                .chars()
                .next()
                .map(|c| c.is_alphabetic() || c == '_' || c == '$')
                .unwrap_or(false)
            && callee
                .chars()
                .all(|c| c.is_alphanumeric() || c == '_' || c == '$')
        {
            return callee.to_string();
        }
    }
    if trimmed.starts_with('{') {
        format!("() => ({})", trimmed)
    } else {
        format!("() => {}", trimmed)
    }
}

/// Split declarators by comma, handling nested braces, brackets, and parens.
///
/// For example: "a, b = {x: 1}, c" -> ["a", "b = {x: 1}", "c"]
pub(super) fn split_declarators(s: &str) -> Vec<&str> {
    let mut result = Vec::new();
    let mut depth: usize = 0;
    let mut start = 0;

    for (i, c) in s.char_indices() {
        match c {
            '{' | '[' | '(' => depth += 1,
            '}' | ']' | ')' => depth = depth.saturating_sub(1),
            ',' if depth == 0 => {
                result.push(&s[start..i]);
                start = i + 1;
            }
            _ => {}
        }
    }

    // Don't forget the last segment
    if start < s.len() {
        result.push(&s[start..]);
    }

    result
}

/// Find the position of a line comment (//) that is not inside a string.
pub(super) fn find_line_comment_position(code: &str) -> Option<usize> {
    let mut in_string = false;
    let mut string_char = ' ';
    let mut chars = code.chars().peekable();
    let mut pos = 0;

    while let Some(c) = chars.next() {
        if in_string {
            if c == '\\' {
                // Skip escaped character
                chars.next();
                pos += 2;
                continue;
            }
            if c == string_char {
                in_string = false;
            }
        } else if c == '"' || c == '\'' || c == '`' {
            in_string = true;
            string_char = c;
        } else if c == '/' && chars.peek() == Some(&'/') {
            return Some(pos);
        }
        pos += c.len_utf8();
    }
    None
}

/// Transform $props() usage.
///
/// Only generates `$.prop()` declarations for props that are "sources" (reassigned or mutated)
/// or props that have default values or are exported.
/// Read-only props are accessed directly via `$$props.propName` without declarations.
///
/// Uses the same flag calculation as `get_prop_source()` from the official Svelte compiler:
/// - PROPS_IS_IMMUTABLE (1): if analysis.immutable
/// - PROPS_IS_RUNES (2): if analysis.runes
/// - PROPS_IS_UPDATED (4): if accessors, or binding is updated
/// - PROPS_IS_BINDABLE (8): only if binding.kind == BindableProp ($bindable() props)
/// - PROPS_IS_LAZY_INITIAL (16): if default value is non-simple
///
/// Multiple prop declarations are combined into a single `let` statement with
/// comma-separated declarators, matching the official compiler output format.
pub(super) fn transform_props_destructuring(
    line: &str,
    prop_source_vars: &[String],
    exported_names: &[String],
    analysis: &ComponentAnalysis,
    read_only_props: &[(String, String)],
    dev: bool,
) -> Option<String> {
    let trimmed = line.trim();

    // Determine the original declaration keyword (let or const) to preserve it
    let decl_keyword = if trimmed.starts_with("let ") {
        "let"
    } else if trimmed.starts_with("const ") {
        "const"
    } else if trimmed.starts_with("var ") {
        "var"
    } else {
        return None;
    };

    // Check for identifier pattern: let/const/var props = $props()
    // Reference: VariableDeclaration.js lines 51-60
    // When $props() is assigned to a plain identifier (not destructured),
    // it always generates $.rest_props() with the standard exclusion list.
    if !trimmed.contains('{') && memmem::find(trimmed.as_bytes(), b"= $props()").is_some() {
        // Pattern: let props = $props()
        let decl_start = decl_keyword.len() + 1;
        let eq_pos = trimmed.find('=')?;
        let var_name = trimmed[decl_start..eq_pos].trim();

        let mut seen = vec!["'$$slots'", "'$$events'", "'$$legacy'"];
        if analysis.custom_element.is_some() {
            seen.push("'$$host'");
        }

        // Always generate $.rest_props() for identifier pattern (no is_prop_source check)
        return Some(format!(
            "{} {} = $.rest_props($$props, [{}]);\n",
            decl_keyword,
            var_name,
            seen.join(", ")
        ));
    }

    // Check for destructuring pattern: let { ... } = $props()
    if !trimmed.contains('{') || memmem::find(trimmed.as_bytes(), b"= $props()").is_none() {
        return None;
    }

    // Extract the part between { and }
    let open_brace = trimmed.find('{')?;
    let close_brace = trimmed.rfind('}')?;
    let props_str = &trimmed[open_brace + 1..close_brace];

    // Parse each prop - collect declarators for combining into a single `let` statement
    let mut declarators: Vec<String> = Vec::new();

    // Track "seen" prop names for $.rest_props() exclusion list.
    // Reference: VariableDeclaration.js lines 45-46
    // Starts with internal prop names that should always be excluded.
    let mut seen: Vec<String> = vec![
        "$$slots".to_string(),
        "$$events".to_string(),
        "$$legacy".to_string(),
    ];
    if analysis.custom_element.is_some() {
        seen.push("$$host".to_string());
    }

    for prop_part in split_declarators(props_str) {
        let prop_part = prop_part.trim();
        if prop_part.is_empty() {
            continue;
        }

        // Handle rest element: ...rest
        // Reference: VariableDeclaration.js lines 96-107
        if let Some(rest_name) = prop_part.strip_prefix("...") {
            let rest_name = rest_name.trim();
            // Generate: rest_name = $.rest_props($$props, ['$$slots', '$$events', '$$legacy', ...seen_props])
            let seen_literals: Vec<String> = seen.iter().map(|s| format!("'{}'", s)).collect();
            declarators.push(format!(
                "{} = $.rest_props($$props, [{}])",
                rest_name,
                seen_literals.join(", ")
            ));
            continue;
        }

        // Handle: name = default_value (always generate for props with defaults)
        if let Some(eq_pos) = prop_part.find('=') {
            let name_part = prop_part[..eq_pos].trim();
            let raw_default_value = prop_part[eq_pos + 1..].trim();

            // Handle rename pattern: `originalProp: localVar = default`
            // In destructuring, `disabled: disabledProp = false` means:
            //   prop_name = "disabled" (the actual prop)
            //   local_name = "disabledProp" (the local variable)
            let (prop_name, local_name) = if let Some(colon_pos) = name_part.find(':') {
                let pn = name_part[..colon_pos].trim();
                // Strip surrounding quotes from prop name (e.g., 'weird-name': localVar)
                let pn = pn
                    .strip_prefix('\'')
                    .and_then(|s| s.strip_suffix('\''))
                    .or_else(|| pn.strip_prefix('"').and_then(|s| s.strip_suffix('"')))
                    .unwrap_or(pn);
                let ln = name_part[colon_pos + 1..].trim();
                (pn, ln)
            } else {
                (name_part, name_part)
            };

            // Strip $bindable() wrapper: $bindable(value) -> value
            // Reference: VariableDeclaration.js - unwrap_bindable()
            let was_bindable =
                raw_default_value.starts_with("$bindable(") && raw_default_value.ends_with(')');
            let default_value = if was_bindable {
                let inner = &raw_default_value[10..raw_default_value.len() - 1];
                if inner.is_empty() {
                    // $bindable() with no args - no default value
                    // Check if this binding is actually a prop source.
                    // In runes mode without accessors (accessors is forced false in runes mode),
                    // a $bindable() prop with no default value, no reassignment, and no mutation
                    // is NOT a prop source and should NOT get a $.prop() declaration.
                    // Reference: is_prop_source() in utils.js
                    let is_source = if analysis.runes {
                        // In runes mode, check binding properties
                        let binding = analysis.root.bindings.iter().find(|b| b.name == local_name);
                        if let Some(b) = binding {
                            analysis.accessors || b.reassigned || b.initial.is_some() || b.mutated
                        } else {
                            // Binding not found - be conservative, emit it
                            true
                        }
                    } else {
                        // In legacy mode, all props are sources
                        true
                    };
                    seen.push(prop_name.to_string());
                    if is_source {
                        let flags = calculate_prop_flags(local_name, analysis, false);
                        declarators.push(format!(
                            "{} = $.prop($$props, '{}', {})",
                            local_name, prop_name, flags
                        ));
                    }
                    continue;
                }
                inner
            } else {
                raw_default_value
            };

            // Add this prop name to the "seen" list for rest_props exclusion
            seen.push(prop_name.to_string());

            // Transform default value: apply read-only prop substitutions
            let default_value = {
                let mut dv = default_value.to_string();
                if !read_only_props.is_empty() {
                    dv = transform_read_only_props(&dv, read_only_props);
                }
                if !prop_source_vars.is_empty() {
                    dv = wrap_prop_source_reads(&dv, prop_source_vars, &[]);
                }
                dv
            };
            let default_value = default_value.as_str();

            // Check if the TRANSFORMED default value is a simple expression
            let is_simple = is_simple_expression_str(default_value);

            // Calculate flags using the official logic
            let flags = calculate_prop_flags(local_name, analysis, !is_simple);

            // Check if the value needs $.proxy() wrapping.
            // Only $bindable() defaults get proxy-wrapped (similar to $state).
            // Regular prop defaults are not proxied.
            let needs_proxy = was_bindable
                && (default_value.trim().starts_with('[')
                    || default_value.trim().starts_with('{')
                    || default_value.trim().starts_with("new "));
            let proxy_wrapped = if needs_proxy {
                if dev {
                    format!("$.tag_proxy($.proxy({}), '{}')", default_value, local_name)
                } else {
                    format!("$.proxy({})", default_value)
                }
            } else {
                default_value.to_string()
            };

            if is_simple {
                declarators.push(format!(
                    "{} = $.prop($$props, '{}', {}, {})",
                    local_name, prop_name, flags, proxy_wrapped
                ));
            } else {
                // Wrap non-simple values in a thunk: () => value
                // When value starts with '{', wrap in parens to prevent
                // OXC from parsing `() => {...}` as arrow with block body
                let lazy_arg = make_lazy_prop_arg(&proxy_wrapped);
                declarators.push(format!(
                    "{} = $.prop($$props, '{}', {}, {})",
                    local_name, prop_name, flags, lazy_arg
                ));
            }
        } else {
            // No default value - handle rename pattern: `originalProp: localVar`
            let (prop_name, local_name) = if let Some(colon_pos) = prop_part.find(':') {
                let pn = prop_part[..colon_pos].trim();
                // Strip surrounding quotes from prop name
                let pn = pn
                    .strip_prefix('\'')
                    .and_then(|s| s.strip_suffix('\''))
                    .or_else(|| pn.strip_prefix('"').and_then(|s| s.strip_suffix('"')))
                    .unwrap_or(pn);
                let ln = prop_part[colon_pos + 1..].trim();
                (pn, ln)
            } else {
                (prop_part, prop_part)
            };

            // Add to seen list for rest_props exclusion
            seen.push(prop_name.to_string());

            // Only generate $.prop() if this is a source prop or exported
            let is_exported = exported_names.contains(&local_name.to_string());
            if prop_source_vars.contains(&local_name.to_string()) || is_exported {
                // Calculate flags using the official logic (no lazy initial for props without defaults)
                let flags = calculate_prop_flags(local_name, analysis, false);

                declarators.push(format!(
                    "{} = $.prop($$props, '{}', {})",
                    local_name, prop_name, flags
                ));
            }
            // Read-only props without defaults are accessed directly via $$props.propName
        }
    }

    // Combine all declarators into a single `let` statement with comma separators
    if declarators.is_empty() {
        Some(String::new())
    } else if declarators.len() == 1 {
        Some(format!("{} {};\n", decl_keyword, declarators[0]))
    } else {
        // Multi-prop: combine with comma + newline + tab indent, matching official compiler
        let mut result = format!("{} {}", decl_keyword, declarators[0]);
        for decl in &declarators[1..] {
            result.push_str(",\n\t");
            result.push_str(decl);
        }
        result.push_str(";\n");
        Some(result)
    }
}

/// Transform rest_prop member access to $$props.
pub(super) fn transform_rest_prop_member_access(line: &str, rest_prop_vars: &[String]) -> String {
    let mut result = line.to_string();

    for var_name in rest_prop_vars {
        let pattern = format!(r"\b{}\.", var_name);
        let re = match get_or_compile_regex(&pattern) {
            Some(r) => r,
            None => continue,
        };

        let mut offset = 0;
        let mut new_result = String::new();

        for mat in re.find_iter(&result.clone()) {
            new_result.push_str(&result[offset..mat.start()]);
            let after_match = &result[mat.end()..];

            // Check if next char is [ (computed property access)
            if after_match.starts_with('[') {
                new_result.push_str(mat.as_str());
            } else {
                // Find the end of the property name
                let mut prop_end = 0;
                for (i, c) in after_match.chars().enumerate() {
                    if c.is_alphanumeric() || c == '_' || c == '$' {
                        prop_end = i + 1;
                    } else {
                        break;
                    }
                }

                let after_prop = &after_match[prop_end..].trim_start();
                let is_direct_assignment =
                    after_prop.starts_with('=') && !after_prop.starts_with("==");
                let has_deeper_access = after_prop.starts_with('.');

                if is_direct_assignment && !has_deeper_access {
                    new_result.push_str(mat.as_str());
                } else {
                    new_result.push_str("$$props.");
                }
            }

            offset = mat.end();
        }

        new_result.push_str(&result[offset..]);
        result = new_result;
    }

    result
}

/// Transform read-only props to $$props.propName.
pub(super) fn is_valid_js_identifier(s: &str) -> bool {
    if s.is_empty() {
        return false;
    }
    let mut chars = s.chars();
    let first = chars.next().unwrap();
    if !first.is_alphabetic() && first != '_' && first != '$' {
        return false;
    }
    chars.all(|c| c.is_alphanumeric() || c == '_' || c == '$')
}

/// Wrap prop member expression mutations with `$$ownership_validator.mutation()`.
///
/// In legacy mode (after `transform_prop_assignments` has already converted):
///   `item.name = value` -> `item(item().name = value, true)`
/// This function detects that pattern and replaces it with:
///   `$$ownership_validator.mutation('item', ['item', 'name'], item(item().name = value, true), line, col)`
///
/// In runes mode (where member mutation wrapping is skipped):
///   `item().name = value` remains as-is from prop read transform
/// This function detects `prop().member = value` and wraps it with:
///   `$$ownership_validator.mutation('item', ['item', 'name'], item().name = value, line, col)`
///
/// Reference: validate_mutation() in shared/utils.js
pub(super) fn wrap_prop_mutation_validation(
    stmt: &str,
    prop_vars: &[(String, String)], // (var_name, prop_alias)
    source: &str,
) -> String {
    let _trimmed = stmt.trim();

    let mut result = stmt.to_string();

    for (var_name, prop_alias) in prop_vars {
        // First, try the runes-mode pattern: `prop().member = value` (not wrapped in prop(..., true))
        // This handles the case where transform_prop_assignments skips member mutation wrapping in runes mode.
        let runes_prefix = format!("{}().", var_name);
        let mut runes_search_from = 0;

        while runes_search_from < result.len() {
            let Some(prefix_rel) = result[runes_search_from..].find(&runes_prefix) else {
                break;
            };
            let abs_start = runes_search_from + prefix_rel;

            // Check this is a standalone identifier (not part of a longer name)
            if abs_start > 0 {
                let prev_char = result.as_bytes()[abs_start - 1] as char;
                if prev_char.is_alphanumeric() || prev_char == '_' || prev_char == '$' {
                    runes_search_from = abs_start + runes_prefix.len();
                    continue;
                }
            }

            // Check it's not already inside a prop(prop()...) wrapper
            let before = &result[..abs_start];
            if before.ends_with(&format!("{}(", var_name)) {
                runes_search_from = abs_start + runes_prefix.len();
                continue;
            }
            // Skip if already inside $$ownership_validator.mutation
            if before.ends_with("mutation(")
                || before.contains(&format!("$$ownership_validator.mutation('{}',", prop_alias))
            {
                runes_search_from = abs_start + runes_prefix.len();
                continue;
            }

            // Find the assignment expression
            let after_prefix = &result[abs_start + runes_prefix.len()..];

            // Parse member chain to find assignment operator
            let mut path_parts: Vec<String> = vec![format!("'{}'", prop_alias)];
            let chars: Vec<char> = after_prefix.chars().collect();
            let mut pos = 0;

            // Read the first dot member identifier
            let ident_start = pos;
            while pos < chars.len()
                && (chars[pos].is_alphanumeric() || chars[pos] == '_' || chars[pos] == '$')
            {
                pos += 1;
            }
            if pos > ident_start {
                let ident: String = chars[ident_start..pos].iter().collect();
                path_parts.push(format!("'{}'", ident));
            }

            // Read additional dot-members or bracket accesses
            while pos < chars.len() && (chars[pos] == '.' || chars[pos] == '[') {
                if chars[pos] == '.' {
                    pos += 1;
                    let ident_start = pos;
                    while pos < chars.len()
                        && (chars[pos].is_alphanumeric() || chars[pos] == '_' || chars[pos] == '$')
                    {
                        pos += 1;
                    }
                    if pos > ident_start {
                        let ident: String = chars[ident_start..pos].iter().collect();
                        path_parts.push(format!("'{}'", ident));
                    }
                } else {
                    // bracket access
                    pos += 1; // skip [
                    let mut bracket_depth = 1;
                    let bracket_start = pos;
                    while pos < chars.len() && bracket_depth > 0 {
                        match chars[pos] {
                            '[' => bracket_depth += 1,
                            ']' => bracket_depth -= 1,
                            _ => {}
                        }
                        if bracket_depth > 0 {
                            pos += 1;
                        }
                    }
                    if bracket_depth == 0 {
                        let bracket_expr: String = chars[bracket_start..pos].iter().collect();
                        path_parts.push(bracket_expr);
                        pos += 1; // skip ]
                    }
                }
            }

            if path_parts.len() < 2 {
                runes_search_from = abs_start + runes_prefix.len();
                continue;
            }

            // Check for assignment operator (=, +=, ++, etc.)
            // Skip whitespace
            while pos < chars.len() && chars[pos].is_whitespace() {
                pos += 1;
            }

            // Check for = (but not ==, ===, =>) or ++ or --
            let has_assignment = if pos < chars.len() {
                if chars[pos] == '='
                    && (pos + 1 >= chars.len() || (chars[pos + 1] != '=' && chars[pos + 1] != '>'))
                {
                    true
                } else if pos + 1 < chars.len()
                    && chars[pos + 1] == '='
                    && (pos + 2 >= chars.len() || chars[pos + 2] != '=')
                {
                    // compound assignment +=, -=, etc. (but not !== etc.)
                    matches!(chars[pos], '+' | '-' | '*' | '/' | '%' | '&' | '|' | '^')
                } else if pos + 1 < chars.len()
                    && ((chars[pos] == '+' && chars[pos + 1] == '+')
                        || (chars[pos] == '-' && chars[pos + 1] == '-'))
                {
                    true // ++ or --
                } else {
                    false
                }
            } else {
                false
            };

            if !has_assignment {
                runes_search_from = abs_start + runes_prefix.len();
                continue;
            }

            // Find the end of the full expression/statement
            // We need to find where this expression ends (at ; or end of line or , at depth 0)
            let expr_start = abs_start;
            let after_expr_start = &result[expr_start..];
            let mut depth = 0i32;
            let mut expr_end_pos = after_expr_start.len();
            let mut in_str: Option<char> = None;
            for (ci, c) in after_expr_start.char_indices() {
                if let Some(quote) = in_str {
                    if c == quote && (ci == 0 || after_expr_start.as_bytes()[ci - 1] != b'\\') {
                        in_str = None;
                    }
                } else {
                    match c {
                        '\'' | '"' | '`' => in_str = Some(c),
                        '(' | '[' | '{' => depth += 1,
                        ')' | ']' | '}' => {
                            if depth == 0 {
                                expr_end_pos = ci;
                                break;
                            }
                            depth -= 1;
                        }
                        ';' | '\n' if depth == 0 => {
                            expr_end_pos = ci;
                            break;
                        }
                        _ => {}
                    }
                }
            }

            let full_expr = result[expr_start..expr_start + expr_end_pos]
                .trim_end()
                .to_string();

            // Find source location
            let (line_num, col_num) = find_prop_mutation_location(source, var_name);

            // Build the path array
            let path_array = format!("[{}]", path_parts.join(", "));

            // Build the replacement
            let mut replacement = format!(
                "$$ownership_validator.mutation('{}', {}, {}",
                prop_alias, path_array, full_expr,
            );
            if line_num > 0 {
                replacement.push_str(&format!(", {}, {}", line_num, col_num));
            }
            replacement.push(')');
            result = format!(
                "{}{}{}",
                &result[..expr_start],
                replacement,
                &result[expr_start + expr_end_pos..]
            );
            runes_search_from = expr_start + replacement.len();
        }

        // Pattern: `prop(prop().member_chain = value, true)` or `prop(prop()[expr] = value, true)`
        // We search for `prop(prop()` followed by either `.` or `[`
        let wrapper_prefix = format!("{}({}()", var_name, var_name);
        let mut search_from = 0;

        while search_from < result.len() {
            let Some(prefix_rel) = result[search_from..].find(&wrapper_prefix) else {
                break;
            };
            let abs_start = search_from + prefix_rel;
            let after_prefix = abs_start + wrapper_prefix.len();
            // Check that the next character is `.` or `[` (member access)
            if after_prefix >= result.len() {
                search_from = after_prefix;
                continue;
            }
            let next_char = result.as_bytes()[after_prefix] as char;
            if next_char != '.' && next_char != '[' {
                search_from = after_prefix;
                continue;
            }
            let wrapper_start_len = wrapper_prefix.len() + 1; // includes the `.` or `[`

            // Check this is a standalone identifier (not part of a longer name)
            if abs_start > 0 {
                let prev_char = result.as_bytes()[abs_start - 1] as char;
                if prev_char.is_alphanumeric() || prev_char == '_' || prev_char == '$' {
                    search_from = abs_start + wrapper_start_len;
                    continue;
                }
            }

            // Find the inner assignment: after `prop(` find the matching `, true)`
            let inner_start = abs_start + var_name.len() + 1; // skip `prop(`

            // Find `, true)` that closes this specific prop() call
            // We need to find the matching closing paren, accounting for nesting
            let rest = &result[inner_start..];
            let mut depth = 1i32; // we're inside prop(
            let mut close_pos = None;
            let rest_chars: Vec<char> = rest.chars().collect();
            let mut in_str: Option<char> = None;
            let mut ci = 0;
            let mut byte_i = 0;
            while ci < rest_chars.len() {
                let c = rest_chars[ci];
                if let Some(quote) = in_str {
                    if c == quote && (ci == 0 || rest_chars[ci - 1] != '\\') {
                        in_str = None;
                    }
                    if c == '`'
                        && quote == '`'
                        && ci + 1 < rest_chars.len()
                        && rest_chars[ci + 1] == '{'
                    {
                        // Template literal interpolation - not handling deeply, just skip
                    }
                } else {
                    match c {
                        '\'' | '"' | '`' => in_str = Some(c),
                        '(' | '[' | '{' => depth += 1,
                        ')' | ']' | '}' => {
                            depth -= 1;
                            if depth == 0 {
                                close_pos = Some(byte_i);
                                break;
                            }
                        }
                        _ => {}
                    }
                }
                byte_i += c.len_utf8();
                ci += 1;
            }

            let Some(close_byte_pos) = close_pos else {
                search_from = abs_start + wrapper_start_len;
                continue;
            };

            // The content inside prop(...) is rest[..close_byte_pos]
            let inner_content = &rest[..close_byte_pos];

            // Check if it ends with `, true`
            let inner_trimmed = inner_content.trim_end();
            if !inner_trimmed.ends_with(", true") {
                search_from = abs_start + wrapper_start_len;
                continue;
            }

            // Extract the assignment expression (without `, true`)
            let assignment_expr = inner_trimmed[..inner_trimmed.len() - ", true".len()].trim();

            // Parse the member chain from `prop().member_chain`
            // Parse the member chain from `prop().member_chain` or `prop()[expr]`
            let prop_call_dot = format!("{}().", var_name);
            let prop_call_bracket = format!("{}()[", var_name);
            let (after_prop_call, starts_with_bracket) =
                if assignment_expr.starts_with(&prop_call_dot) {
                    (&assignment_expr[prop_call_dot.len()..], false)
                } else if assignment_expr.starts_with(&prop_call_bracket) {
                    (&assignment_expr[prop_call_bracket.len()..], true)
                } else {
                    search_from = abs_start + wrapper_start_len;
                    continue;
                };

            // Parse member identifiers/bracket accesses until we hit an assignment operator
            let mut path_parts: Vec<String> = vec![format!("'{}'", prop_alias)];
            let chars: Vec<char> = after_prop_call.chars().collect();
            let mut pos = 0;

            if starts_with_bracket {
                // Read bracket expression: find matching ]
                let mut bracket_depth = 1;
                let bracket_start = pos;
                while pos < chars.len() && bracket_depth > 0 {
                    match chars[pos] {
                        '[' => bracket_depth += 1,
                        ']' => bracket_depth -= 1,
                        _ => {}
                    }
                    if bracket_depth > 0 {
                        pos += 1;
                    }
                }
                if bracket_depth == 0 {
                    let bracket_expr: String = chars[bracket_start..pos].iter().collect();
                    // Use the expression directly (not quoted) for computed access
                    path_parts.push(bracket_expr);
                    pos += 1; // skip ]
                }
            } else {
                // Read the first dot member identifier
                let ident_start = pos;
                while pos < chars.len()
                    && (chars[pos].is_alphanumeric() || chars[pos] == '_' || chars[pos] == '$')
                {
                    pos += 1;
                }
                if pos > ident_start {
                    let ident: String = chars[ident_start..pos].iter().collect();
                    path_parts.push(format!("'{}'", ident));
                }
            }

            // Read additional dot-members or bracket accesses
            while pos < chars.len() && (chars[pos] == '.' || chars[pos] == '[') {
                if chars[pos] == '.' {
                    pos += 1;
                    let ident_start = pos;
                    while pos < chars.len()
                        && (chars[pos].is_alphanumeric() || chars[pos] == '_' || chars[pos] == '$')
                    {
                        pos += 1;
                    }
                    if pos > ident_start {
                        let ident: String = chars[ident_start..pos].iter().collect();
                        path_parts.push(format!("'{}'", ident));
                    }
                } else {
                    // bracket access
                    pos += 1; // skip [
                    let mut bracket_depth = 1;
                    let bracket_start = pos;
                    while pos < chars.len() && bracket_depth > 0 {
                        match chars[pos] {
                            '[' => bracket_depth += 1,
                            ']' => bracket_depth -= 1,
                            _ => {}
                        }
                        if bracket_depth > 0 {
                            pos += 1;
                        }
                    }
                    if bracket_depth == 0 {
                        let bracket_expr: String = chars[bracket_start..pos].iter().collect();
                        path_parts.push(bracket_expr);
                        pos += 1; // skip ]
                    }
                }
            }

            if path_parts.len() < 2 {
                search_from = abs_start + wrapper_start_len;
                continue;
            }

            // Find the original source location
            let (line_num, col_num) = find_prop_mutation_location(source, var_name);

            // Build the path array
            let path_array = format!("[{}]", path_parts.join(", "));

            // The full original expression is the entire prop(prop().member = value, true) call
            let end_pos = inner_start + close_byte_pos + 1; // +1 for closing paren
            let full_original_expr = result[abs_start..end_pos].to_string();

            // Build the replacement
            let mut replacement = format!(
                "$$ownership_validator.mutation('{}', {}, {}",
                prop_alias, path_array, full_original_expr,
            );
            if line_num > 0 {
                replacement.push_str(&format!(", {}, {}", line_num, col_num));
            }
            replacement.push(')');
            result = format!(
                "{}{}{}",
                &result[..abs_start],
                replacement,
                &result[end_pos..]
            );
            search_from = abs_start + replacement.len();
        }
    }

    result
}

/// Find the line/column in the original source for a prop mutation.
/// Searches for the original assignment pattern like `item.name =` or `item[expr] =` in the source.
pub(super) fn find_prop_mutation_location(source: &str, var_name: &str) -> (usize, usize) {
    // Look for `var_name.` or `var_name[` in the source (before text transforms added `()`)
    let pattern_dot = format!("{}.", var_name);
    let pattern_bracket = format!("{}[", var_name);
    // Search for the pattern after the script tag
    let search_source =
        if let Some(script_idx) = memchr::memmem::find(source.as_bytes(), b"<script") {
            &source[script_idx..]
        } else {
            source
        };

    let relative_offset = match (
        memchr::memmem::find(search_source.as_bytes(), pattern_dot.as_bytes()),
        memchr::memmem::find(search_source.as_bytes(), pattern_bracket.as_bytes()),
    ) {
        (Some(d), Some(b)) => Some(d.min(b)),
        (Some(d), None) => Some(d),
        (None, Some(b)) => Some(b),
        (None, None) => None,
    };

    if let Some(relative_offset) = relative_offset {
        let offset = if let Some(script_idx) = memchr::memmem::find(source.as_bytes(), b"<script") {
            script_idx + relative_offset
        } else {
            relative_offset
        };
        // Compute line/column from byte offset
        let mut line = 1usize;
        let mut col = 0usize;
        for (i, ch) in source.char_indices() {
            if i >= offset {
                break;
            }
            if ch == '\n' {
                line += 1;
                col = 0;
            } else {
                col += 1;
            }
        }
        (line, col)
    } else {
        (0, 0)
    }
}

/// Transform console.METHOD() calls in dev mode to wrap arguments with
/// `$.log_if_contains_state()` so the runtime can detect when state proxies
/// are logged directly.
///
/// The transformation is:
///   `console.log(x, y)` -> `console.log(...$.log_if_contains_state("log", x, y))`
///
/// This is only applied when at least one argument could potentially reference
/// reactive state (i.e., not all arguments are simple literals).
///
/// Console calls inside `$.inspect()` callbacks are excluded, as those are
/// already handled by the inspect infrastructure.
///
/// Reference: CallExpression.js in the official Svelte compiler
pub(super) fn transform_console_calls_dev(stmt: &str) -> String {
    const CONSOLE_METHODS: &[&str] = &[
        "debug",
        "dir",
        "error",
        "group",
        "groupCollapsed",
        "info",
        "log",
        "trace",
        "warn",
    ];

    let mut result = stmt.to_string();

    for method in CONSOLE_METHODS {
        let pattern = format!("console.{}(", method);
        // Process all occurrences of this console method
        let mut search_from = 0;
        while let Some(rel_pos) = result[search_from..].find(&pattern) {
            let pos = search_from + rel_pos;

            // Skip if inside a string literal
            if is_inside_string_literal(&result, pos) {
                search_from = pos + pattern.len();
                continue;
            }

            // Skip wrapping for the default $inspect callback pattern:
            //   console.log(...$$args) - this is the generated default inspector
            // User-provided inspectors (e.g., .with((t, c) => console.log(t, c))) are wrapped.
            let args_start_check = pos + pattern.len();
            if let Some(args_end_check) = find_matching_paren(&result[args_start_check..]) {
                let args_text = result[args_start_check..args_start_check + args_end_check].trim();
                if args_text == "...$$args" {
                    search_from = args_start_check + args_end_check + 1;
                    continue;
                }
            }

            let args_start = pos + pattern.len();
            if let Some(args_end) = find_matching_paren(&result[args_start..]) {
                let args_content = &result[args_start..args_start + args_end];

                // Only wrap if arguments could contain reactive state.
                // Skip if all arguments are simple literals (strings, numbers, booleans).
                if !args_content.is_empty() && !all_args_are_literals(args_content) {
                    // Transform: console.METHOD(args) -> console.METHOD(...$.log_if_contains_state("METHOD", args))
                    let new_call = format!(
                        "console.{}(...$.log_if_contains_state(\"{}\", {}))",
                        method, method, args_content
                    );
                    let call_end = args_start + args_end + 1; // +1 for closing paren
                    result = format!("{}{}{}", &result[..pos], new_call, &result[call_end..]);
                    search_from = pos + new_call.len();
                } else {
                    search_from = args_start + args_end + 1;
                }
            } else {
                search_from = pos + pattern.len();
            }
        }
    }

    result
}

/// Check if a position in the code is inside a `$.inspect()` callback.
///
/// The `$.inspect()` call has the form:
///   `$.inspect(() => [...], (...$$args) => console.log(...$$args), true)`
///
/// The second argument is the callback function. Console calls inside this
/// callback should NOT be wrapped with `$.log_if_contains_state`.
#[allow(dead_code)]
pub(super) fn is_inside_inspect_callback(code: &str, pos: usize) -> bool {
    // Look backwards from pos for `$.inspect(` to see if we're inside it
    let before = &code[..pos];

    // Find the nearest unmatched `$.inspect(` before our position
    let mut search_pos = 0;
    while let Some(rel_idx) = memmem::find(&before.as_bytes()[search_pos..], b"$.inspect(") {
        let inspect_pos = search_pos + rel_idx;
        let args_start = inspect_pos + 10; // after "$.inspect("

        // Check if our position is within the $.inspect(...) call
        if let Some(args_end) = find_matching_paren(&code[args_start..]) {
            let call_end = args_start + args_end;
            if pos > args_start && pos < call_end {
                return true;
            }
        }

        search_pos = inspect_pos + 10;
    }

    false
}

/// Check if all arguments in a comma-separated argument list are simple literals.
///
/// Simple literals are: string literals, numeric literals, boolean literals,
/// null, undefined.
pub(super) fn all_args_are_literals(args: &str) -> bool {
    let trimmed = args.trim();
    if trimmed.is_empty() {
        return true;
    }

    // Split on top-level commas (not inside nested parens/brackets/strings)
    let parts = split_top_level_args(trimmed);

    for part in &parts {
        let p = part.trim();
        if p.is_empty() {
            continue;
        }
        // Check if it's a spread element (always wrap)
        if p.starts_with("...") {
            return false;
        }
        // Check if it's a simple literal
        if !is_simple_literal(p) {
            return false;
        }
    }

    true
}

/// Check if a string is a simple literal value.
pub(super) fn is_simple_literal(s: &str) -> bool {
    let s = s.trim();

    // Numeric literals (including negative)
    if s.parse::<f64>().is_ok() {
        return true;
    }

    // String literals
    if (s.starts_with('"') && s.ends_with('"'))
        || (s.starts_with('\'') && s.ends_with('\''))
        || (s.starts_with('`') && s.ends_with('`'))
    {
        return true;
    }

    // Boolean and null/undefined literals
    matches!(s, "true" | "false" | "null" | "undefined")
}

/// Split an argument string on top-level commas (not inside nested constructs).
pub(super) fn split_top_level_args(s: &str) -> Vec<String> {
    let mut parts = Vec::new();
    let mut current = String::new();
    let mut depth = 0i32;
    let mut in_string = None::<char>;
    let mut prev_char = None::<char>;

    for c in s.chars() {
        if let Some(quote) = in_string {
            current.push(c);
            if c == quote && prev_char != Some('\\') {
                in_string = None;
            }
        } else {
            match c {
                '"' | '\'' | '`' => {
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
        prev_char = Some(c);
    }

    if !current.is_empty() {
        parts.push(current);
    }

    parts
}

pub(super) fn transform_read_only_props(
    line: &str,
    read_only_props: &[(String, String)],
) -> String {
    let mut result = line.to_string();

    for (local_name, prop_name) in read_only_props {
        // Create a regex pattern that matches the prop name as a complete identifier
        // Rust regex doesn't support lookbehind, so we match with word boundaries
        // and handle the prefix check manually
        let pattern = format!(r"\b{}\b", regex::escape(local_name));
        let re = match get_or_compile_regex(&pattern) {
            Some(r) => r,
            None => continue,
        };

        let mut new_result = String::new();
        let mut last_end = 0;

        for mat in re.find_iter(&result.clone()) {
            // Check if preceded by . (property access) or $ (dollar identifier)
            if mat.start() > 0 {
                let prev_byte = result.as_bytes().get(mat.start() - 1).copied();
                if prev_byte == Some(b'.') || prev_byte == Some(b'$') {
                    new_result.push_str(&result[last_end..mat.end()]);
                    last_end = mat.end();
                    continue;
                }
            }

            // Check if the match is inside a string literal (skip if so)
            // This prevents transforming 'prop' -> '$$props.prop' inside strings like $.prop($$props, 'prop', ...)
            if is_inside_string_literal(&result, mat.start()) {
                new_result.push_str(&result[last_end..mat.end()]);
                last_end = mat.end();
                continue;
            }

            // Check if this is a getter/setter property name (skip if so)
            // e.g., `get initialViewId()` - the name is a property definition, not a reference
            {
                let before_trimmed = result[..mat.start()].trim_end();
                if before_trimmed.ends_with("get") || before_trimmed.ends_with("set") {
                    let keyword_len = 3; // "get" or "set"
                    let before_keyword =
                        before_trimmed[..before_trimmed.len() - keyword_len].trim_end();
                    let prev = before_keyword.chars().last();
                    // `get`/`set` is a getter/setter keyword if preceded by `{`, `,`, or start of context
                    if matches!(prev, None | Some('{') | Some(',') | Some('(') | Some(';')) {
                        new_result.push_str(&result[last_end..mat.end()]);
                        last_end = mat.end();
                        continue;
                    }
                }
            }

            // Check if this is a declaration (skip if so)
            let before = &result[..mat.start()];
            let trimmed_before = before.trim_end();

            // Skip if this is part of a let/const/var declaration or destructuring pattern.
            // Note: We check for `{` only when it follows a declaration keyword (e.g., `let {`).
            // A bare `{` could be a function body (e.g., `() => { prop(...)`) which should
            // NOT be skipped.
            let is_destructuring_brace = trimmed_before.ends_with('{') && {
                let before_brace = trimmed_before[..trimmed_before.len() - 1].trim_end();
                before_brace.ends_with("let")
                    || before_brace.ends_with("const")
                    || before_brace.ends_with("var")
                    || before_brace.ends_with(',')
                    || before_brace.ends_with(':')
                    || before_brace.strip_suffix('(').is_some_and(|stripped| {
                        // Only treat as destructuring if this is a function definition
                        // parameter, NOT a function call argument.
                        // e.g., `function({` is destructuring, `resolve({` is NOT
                        let before_paren = stripped.trim_end();
                        !before_paren
                            .chars()
                            .last()
                            .map(|c| c.is_alphanumeric() || c == '_' || c == '$' || c == '.')
                            .unwrap_or(false)
                    })
            };
            // Check if comma is in a variable declaration context (e.g., `let a, b`)
            // but NOT in a function call argument (e.g., `foo(a, b)`)
            let is_declaration_comma = trimmed_before.ends_with(',') && {
                // Walk back past any previous declarators to find if there's a let/const/var
                // This handles: `let a, b` where trimmed_before for `b` is `let a,`
                let before_comma = trimmed_before[..trimmed_before.len() - 1].trim_end();
                // Find the start of this statement by looking for the declaration keyword
                // We need to check if this comma is part of a `let/const/var` multi-declarator
                // or a destructuring pattern, not a function call argument
                is_in_variable_declaration_list(before_comma)
            };
            if trimmed_before.ends_with("let")
                || trimmed_before.ends_with("const")
                || trimmed_before.ends_with("var")
                || is_declaration_comma
                || is_destructuring_brace
            {
                new_result.push_str(&result[last_end..mat.end()]);
                last_end = mat.end();
                continue;
            }

            // Check if this is a destructuring pattern
            // Look for patterns like `{ prop }` or `{ prop, ... }`
            if is_in_destructuring_pattern(&result, mat.start()) {
                new_result.push_str(&result[last_end..mat.end()]);
                last_end = mat.end();
                continue;
            }

            // Check if this is a function parameter or inside a function body where
            // a parameter shadows this prop name (e.g., `function render(state) { return state }`)
            if is_in_function_param_or_shadowed(&result, mat.start(), Some(local_name)) {
                new_result.push_str(&result[last_end..mat.end()]);
                last_end = mat.end();
                continue;
            }

            // Check if this identifier is a non-shorthand object property key
            // e.g., `{ children: queryChildren }` - `children` is just a key, don't replace
            // Also handles cases where comments appear between `,` and the key
            {
                let after_trimmed = result[mat.end()..].trim_start();
                let next_after = after_trimmed.chars().next();
                if next_after == Some(':') && after_trimmed.chars().nth(1) != Some(':') {
                    // Use delimiter tracking to check if we're inside an object literal
                    if find_nearest_unmatched_open_delimiter(&result, mat.start()) == Some('{') {
                        new_result.push_str(&result[last_end..mat.end()]);
                        last_end = mat.end();
                        continue;
                    }
                }
            }

            // Check if this is a shorthand property in an object literal
            // e.g., `{ environment }` should become `{ environment: $$props.environment }`
            // not `{ $$props.environment }` (which would be invalid)
            // Must be inside `{ }` (object literal), NOT `( )` (function call) or `[ ]` (array)
            let is_shorthand = {
                let before = result[..mat.start()].trim_end();
                let after = result[mat.end()..].trim_start();
                let prev_char = before.chars().last();
                let next_char = after.chars().next();
                // Check that `{` is not preceded by `$` (template literal `${...}`)
                let is_template_literal = prev_char == Some('{') && {
                    let before_trimmed = before.trim_end();
                    before_trimmed.len() >= 2
                        && before_trimmed.as_bytes()[before_trimmed.len() - 2] == b'$'
                };
                matches!(prev_char, Some('{') | Some(','))
                    && matches!(next_char, Some('}') | Some(','))
                    && !is_template_literal
                    && find_nearest_unmatched_open_delimiter(&result, mat.start()) == Some('{')
            };

            // Replace with $$props.propName or $$props['propName']
            new_result.push_str(&result[last_end..mat.start()]);
            let use_bracket = !is_valid_js_identifier(prop_name);
            if is_shorthand {
                new_result.push_str(local_name);
                if use_bracket {
                    new_result.push_str(": $$props['");
                    new_result.push_str(prop_name);
                    new_result.push_str("']");
                } else {
                    new_result.push_str(": $$props.");
                    new_result.push_str(prop_name);
                }
            } else if use_bracket {
                new_result.push_str("$$props['");
                new_result.push_str(prop_name);
                new_result.push_str("']");
            } else {
                new_result.push_str("$$props.");
                new_result.push_str(prop_name);
            }
            last_end = mat.end();
        }

        new_result.push_str(&result[last_end..]);
        result = new_result;
    }

    result
}
