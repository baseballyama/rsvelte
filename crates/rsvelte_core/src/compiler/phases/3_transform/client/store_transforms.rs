//! Store subscription, assignment, and mutation transformations.

use memchr::memmem;
use rustc_hash::FxHashSet;

use super::find_matching_paren;

/// Transform store assignments in client-side code.
///
/// Handles patterns like:
/// - `++$count` -> `$.update_pre_store(count, $count())`
/// - `$count++` -> `$.update_store(count, $count())`
/// - `$count += expr` -> `$.store_set(count, $count() + expr)`
/// - `$count = expr` -> `$.store_set(count, expr)`
/// - `$store.prop++` -> `$.store_mutate(store, ...)`
pub(super) fn transform_store_assignments_client(
    line: &str,
    store_sub_vars: &[String],
    prop_vars: &[String],
    state_vars: &[String],
    non_reactive_state_vars: &[String],
) -> String {
    if store_sub_vars.is_empty() {
        return line.to_string();
    }

    // Quick pre-check: if none of the store sub vars appear as identifiers, skip expensive transforms
    let var_set: FxHashSet<&str> = store_sub_vars.iter().map(|v| v.as_str()).collect();
    if !super::utils::text_contains_any_identifier(line, &var_set) {
        return line.to_string();
    }

    // AST-based pre-passes — both target store-subscription names
    // but cover disjoint syntactic forms:
    //
    // 1. UpdateExpressions (`++$x` / `--$x` / `$x++` / `$x--`)
    // 2. AssignmentExpressions (`$x = expr` / `$x <op>= expr`)
    //
    // Both replace the same fragility class as the text loops below
    // (string / template / regex contents wrongly rewritten) and are
    // idempotent vs them: once a span has been rewritten the literal
    // byte pattern (`++$x`, `$x +=`) is gone and the text loop's
    // `result.contains(...)` / `result.find(...)` guard skips it.
    let after_updates = super::store_update_ast::transform_store_update_ast(
        line,
        store_sub_vars,
        prop_vars,
        state_vars,
        non_reactive_state_vars,
    );
    let stage1: &str = after_updates.as_deref().unwrap_or(line);
    let after_assigns = super::store_assign_ast::transform_store_assign_ast(
        stage1,
        store_sub_vars,
        prop_vars,
        state_vars,
        non_reactive_state_vars,
    );
    let mut result = after_assigns.unwrap_or_else(|| stage1.to_string());

    // Member-expression mutations (`$store.prop = …`, `$store[0]++`, etc.)
    // are handled per-store via the dedicated AST helper. The first
    // `$.store_mutate(...)` argument is the store *source* read the same way
    // any reference to its binding would be: a prop binding reads as the getter
    // call `store()`, so prop-backed stores need that form rather than the bare
    // name (other binding kinds keep the bare name).
    for store_sub in store_sub_vars {
        let store_name = store_sub[1..].to_string();
        let prop_store_names: Vec<String> = if prop_vars.contains(&store_name) {
            vec![store_name]
        } else {
            Vec::new()
        };
        result = transform_store_member_mutations(&result, store_sub, &prop_store_names);
    }

    result
}

/// Check if a store subscription name appears as a function parameter in a statement.
/// This detects patterns like `function bar($derived, $effect)` where the store sub name
/// is actually a function parameter, not a store reference.
pub(super) fn is_function_parameter_in_statement(statement: &str, store_sub: &str) -> bool {
    // Look for function declarations or arrow functions with the store sub as a parameter
    // Patterns: `function name($store` or `($store` in arrow functions
    // We search for the pattern: `(` ... store_sub ... `,` or `)` without intervening `(`
    let mut search_from = 0;
    while let Some(func_pos) = memmem::find(&statement.as_bytes()[search_from..], b"function ") {
        let abs_func_pos = search_from + func_pos;
        // Find the opening paren of the function params
        if let Some(paren_pos) = statement[abs_func_pos..].find('(') {
            let abs_paren_pos = abs_func_pos + paren_pos;
            // Find the closing paren
            if let Some(close_paren_pos) = find_matching_paren(&statement[abs_paren_pos + 1..]) {
                let params = &statement[abs_paren_pos + 1..abs_paren_pos + 1 + close_paren_pos];
                // Check if the store_sub appears as a parameter (word boundary)
                for param in params.split(',') {
                    let trimmed = param.trim();
                    // Handle destructuring and default values
                    let param_name = trimmed.split('=').next().unwrap_or(trimmed).trim();
                    if param_name == store_sub {
                        return true;
                    }
                }
            }
        }
        search_from = abs_func_pos + 9;
    }

    // Also check for arrow function parameters.
    // Pattern 1: `$store =>` (unparenthesized single arrow param)
    //   e.g., `derived(count, $count => $count * 2)`
    let store_sub_len = store_sub.len();
    let mut pos = 0;
    while pos + store_sub_len <= statement.len() {
        if let Some(found) = statement[pos..].find(store_sub) {
            let abs_found = pos + found;
            // Check word boundary before
            let before_ok = if abs_found == 0 {
                true
            } else {
                let prev = statement.as_bytes()[abs_found - 1] as char;
                !prev.is_alphanumeric() && prev != '_' && prev != '$'
            };
            // Check word boundary after
            let after_pos = abs_found + store_sub_len;
            let after_ok = if after_pos >= statement.len() {
                true
            } else {
                let next = statement.as_bytes()[after_pos] as char;
                !next.is_alphanumeric() && next != '_' && next != '$'
            };

            if before_ok && after_ok {
                // Check if followed by `=>` (with optional whitespace) = simple arrow param
                let rest = statement[after_pos..].trim_start();
                if rest.starts_with("=>") {
                    return true;
                }

                // Check if preceded by `(` (possibly with other params) and the paren
                // group is followed by `=>` = parenthesized arrow param
                // Look backwards for an opening paren that contains this store_sub as a param
                if abs_found > 0 {
                    // Check if we're inside a parenthesized arrow param list
                    // by looking back for `(` and checking if the `)` after is followed by `=>`
                    let prefix = &statement[..abs_found];
                    if let Some(open_paren) = prefix.rfind('(') {
                        let _params_str = &statement[open_paren + 1..abs_found];
                        // Check that params_str doesn't contain a sub-expression that would
                        // indicate this is NOT a simple param list (e.g., no `=>` before ours)
                        // Find the matching close paren
                        let from_open = &statement[open_paren + 1..];
                        if let Some(close_offset) = find_matching_paren(from_open) {
                            let close_paren = open_paren + 1 + close_offset;
                            // Check that the close paren is followed by `=>` (arrow function)
                            // close_paren points to `)`, so skip past it to check what follows
                            let after_close = statement[close_paren + 1..].trim_start();
                            if after_close.starts_with("=>") {
                                // Verify store_sub is indeed a parameter in this list
                                let params_content = &statement[open_paren + 1..close_paren];
                                for param in params_content.split(',') {
                                    let trimmed = param.trim();
                                    let param_name =
                                        trimmed.split('=').next().unwrap_or(trimmed).trim();
                                    if param_name == store_sub {
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            pos = abs_found + store_sub_len;
        } else {
            break;
        }
    }

    false
}

/// Pre-transform store sub names that are used as function calls with arguments.
///
/// Handles cases like:
/// - `$state(0)` -> `$state()(0)` where `$state` is a store sub, not a rune
/// - `$effect(() => {...})` -> `$effect()(() => {...})` where `$effect` is a store sub
///
/// This inserts the getter call `()` between the store sub name and the argument parens.
/// It's called BEFORE `transform_store_reads_client` so that the `is_already_call` check
/// in that function will see `$state()` and correctly skip adding another `()`.
pub(super) fn transform_store_sub_calls(line: &str, store_sub_vars: &[String]) -> String {
    if store_sub_vars.is_empty() {
        return line.to_string();
    }

    // Quick pre-check: if none of the store sub vars appear as identifiers, skip expensive transforms
    let var_set: FxHashSet<&str> = store_sub_vars.iter().map(|v| v.as_str()).collect();
    if !super::utils::text_contains_any_identifier(line, &var_set) {
        return line.to_string();
    }

    let mut result = line.to_string();

    for store_sub in store_sub_vars {
        // Find pattern: $name( where $name is a store sub and is followed by `(`
        // but NOT by `()` (which would be the getter call itself, already inserted).
        // Also skip when preceded by `const $name = ` (store getter declaration).
        // Also skip when $name appears as a function parameter.
        let pattern = format!("{}(", store_sub);
        let mut new_result = String::new();
        let mut search_start = 0;

        while let Some(pos) = result[search_start..].find(&pattern) {
            let abs_pos = search_start + pos;

            // Check if this is a word boundary (not part of a larger identifier)
            let before_ok = if abs_pos == 0 {
                true
            } else {
                let prev_byte = result.as_bytes()[abs_pos - 1];
                let prev_char = prev_byte as char;
                !prev_char.is_alphanumeric() && prev_char != '_' && prev_char != '$'
            };

            if !before_ok {
                // Not a word boundary, skip
                new_result.push_str(&result[search_start..abs_pos + store_sub.len()]);
                search_start = abs_pos + store_sub.len();
                continue;
            }

            let paren_pos = abs_pos + store_sub.len(); // position of `(`

            // Check if this is inside a function parameter declaration
            // e.g., `function bar($state, $effect)` - skip these.
            // Only applies to the IMMEDIATELY enclosing unmatched `(`; a nested
            // call like `function go() { handleError($t(...)) }` must NOT be
            // treated as being in function params.
            let before_text = &result[..abs_pos];
            let is_in_func_params = {
                // Find the nearest unmatched `(` before our position.
                let bytes = before_text.as_bytes();
                let mut depth: i32 = 0;
                let mut open_paren_pos: Option<usize> = None;
                let mut i = bytes.len();
                while i > 0 {
                    i -= 1;
                    let ch = bytes[i] as char;
                    if ch == ')' {
                        depth += 1;
                    } else if ch == '(' {
                        if depth == 0 {
                            open_paren_pos = Some(i);
                            break;
                        }
                        depth -= 1;
                    }
                }
                if let Some(p) = open_paren_pos {
                    // Check what is immediately before the `(`, skipping whitespace
                    // and an optional identifier (the function name).
                    let mut k = p;
                    while k > 0 && (bytes[k - 1] as char).is_whitespace() {
                        k -= 1;
                    }
                    // Skip an optional identifier (function name) before `(`
                    while k > 0 && {
                        let ch = bytes[k - 1] as char;
                        ch.is_alphanumeric() || ch == '_' || ch == '$'
                    } {
                        k -= 1;
                    }
                    // Skip whitespace before identifier
                    while k > 0 && (bytes[k - 1] as char).is_whitespace() {
                        k -= 1;
                    }
                    // Now check if preceded by `function` keyword
                    if k >= 8 {
                        let prefix =
                            crate::compiler::utils::char_boundary_lookback(before_text, k, 8);
                        prefix == "function"
                            && (k == 8
                                || !{
                                    let c = bytes[k - 9] as char;
                                    c.is_alphanumeric() || c == '_' || c == '$'
                                })
                    } else {
                        false
                    }
                } else {
                    false
                }
            };

            if is_in_func_params {
                // Inside function parameters, skip
                new_result.push_str(&result[search_start..paren_pos]);
                search_start = paren_pos;
                continue;
            }

            // Check if this is a store getter declaration: `const $name = () => $.store_get(...)`
            // We should skip this
            let trimmed_before = before_text.trim();
            if trimmed_before.ends_with(&format!("const {} =", store_sub))
                || trimmed_before.ends_with(&format!("let {} =", store_sub))
                || trimmed_before.ends_with(&format!("var {} =", store_sub))
            {
                // This is the getter declaration, skip
                new_result.push_str(&result[search_start..paren_pos]);
                search_start = paren_pos;
                continue;
            }

            // This is a store sub being called with arguments - insert `()` before the `(`
            // e.g., `$state(0)` -> `$state()(0)`
            new_result.push_str(&result[search_start..abs_pos]);
            new_result.push_str(store_sub);
            new_result.push_str("()");
            search_start = paren_pos; // continue from the `(` which will be kept
        }

        // Append remaining
        new_result.push_str(&result[search_start..]);
        result = new_result;
    }

    result
}

/// Transform store subscription reads to $store() calls.
///
/// In the client runtime, store subscriptions like $count are getter functions.
/// So `const answer = $foo` must become `const answer = $foo()`.
///
/// This is similar to `transform_prop_reads_in_expr` but for store subscriptions.
pub(super) fn transform_store_reads_client(line: &str, store_sub_vars: &[String]) -> String {
    if store_sub_vars.is_empty() {
        return line.to_string();
    }

    // Quick pre-check: if none of the store sub vars appear as identifiers, skip expensive transforms
    let var_set: FxHashSet<&str> = store_sub_vars.iter().map(|v| v.as_str()).collect();
    if !super::utils::text_contains_any_identifier(line, &var_set) {
        return line.to_string();
    }

    let mut result = line.to_string();

    for store_sub in store_sub_vars {
        // Use word boundary matching to replace identifier references
        // But avoid replacing function calls that already have ()
        let mut new_result = String::with_capacity(result.len() * 2);
        let chars: Vec<char> = result.chars().collect();
        let mut i = 0;

        while i < chars.len() {
            // Check if we're at the start of the identifier
            let remaining = &result[result
                .char_indices()
                .nth(i)
                .map(|(idx, _)| idx)
                .unwrap_or(i)..];
            if remaining.starts_with(store_sub) {
                // Check character before (must be non-identifier char or start of string)
                // Also exclude `.` - a dot before means this is a property access like `obj.$value`
                let before_ok = if i == 0 {
                    true
                } else {
                    let prev_char = chars[i - 1];
                    !prev_char.is_alphanumeric()
                        && prev_char != '_'
                        && prev_char != '$'
                        && prev_char != '.'
                };

                // Check character after (must be non-identifier char)
                let after_idx = i + store_sub.len();
                let after_ok = if after_idx >= chars.len() {
                    true
                } else {
                    let next_char = chars[after_idx];
                    !next_char.is_alphanumeric() && next_char != '_' && next_char != '$'
                };

                // Check if this reference is already followed by `()` (getter call)
                // If so, skip adding () to avoid double-calling: $x() is already correct
                let is_already_call = after_idx < chars.len() && chars[after_idx] == '(';

                // Check if this is inside $.untrack() or $.derived() - don't transform there
                // $.untrack expects a getter function, so $store should remain $store
                // $.derived($store) passes the store getter directly as the derivation function
                let is_inside_getter_context = {
                    // Look back for patterns that expect a getter function reference
                    let prefix = &new_result;
                    let trimmed_prefix = prefix.trim_end();
                    trimmed_prefix.ends_with("$.untrack(") || trimmed_prefix.ends_with("$.derived(")
                };

                // Check if this is an object property key (e.g., `{ $userName4: 'user4' }`)
                // In that case, `$userName4:` - the `:` following is a property separator, not a getter
                // We must distinguish from ternary operator `:` (e.g., `cond ? $store : 0`)
                // by checking if we're inside an unmatched `{` (object literal context).
                let is_property_key = {
                    let after_idx2 = i + store_sub.len();
                    let mut k = after_idx2;
                    // Skip whitespace
                    while k < chars.len() && chars[k].is_whitespace() {
                        k += 1;
                    }
                    let has_colon = k < chars.len()
                        && chars[k] == ':'
                        && (k + 1 >= chars.len() || chars[k + 1] != ':');

                    // Only treat as property key if followed by `:` AND we're inside an object literal
                    // (i.e., there is an unmatched `{` before this position in `new_result`)
                    has_colon && {
                        let mut brace_depth: i32 = 0;
                        for ch in new_result.chars() {
                            match ch {
                                '{' => brace_depth += 1,
                                '}' => brace_depth -= 1,
                                _ => {}
                            }
                        }
                        brace_depth > 0
                    }
                };

                // Check if this is inside a string literal (e.g., '$foo' in $.store_unsub(..., '$foo', ...))
                let is_inside_string = if i > 0 {
                    let prev_char = chars[i - 1];
                    prev_char == '\'' || prev_char == '"'
                } else {
                    false
                };

                if before_ok && after_ok {
                    if is_inside_string {
                        // Inside a string literal - don't transform
                        new_result.push_str(store_sub);
                        i += store_sub.len();
                        continue;
                    } else if is_property_key {
                        // Don't transform property keys like `{ $userName4: value }`
                        new_result.push_str(store_sub);
                        i += store_sub.len();
                        continue;
                    } else if is_inside_getter_context {
                        // Inside $.untrack() or $.derived(), keep as $store (don't add parentheses)
                        new_result.push_str(store_sub);
                        i += store_sub.len();
                        continue;
                    } else if is_already_call {
                        // Already followed by `(` - don't add another `()`
                        // This handles cases like `$x()` or `$.update_store(x, $x())`
                        // where the `()` was already generated by store assignment transforms
                        new_result.push_str(store_sub);
                        i += store_sub.len();
                        continue;
                    } else {
                        // Bare store reference - add () to call the getter
                        new_result.push_str(store_sub);
                        new_result.push_str("()");
                        i += store_sub.len();
                        continue;
                    }
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

/// Transform store member expression mutations.
///
/// Handles patterns like:
/// - `$store.prop++` -> `$.store_mutate(store, $.untrack($store).prop++, $.untrack($store))`
/// - `$store[0].value++` -> `$.store_mutate(store, $.untrack($store)[0].value++, $.untrack($store))`
/// - `$store.items[0] = x` -> `$.store_mutate(store, $.untrack($store).items[0] = x, $.untrack($store))`
pub(super) fn transform_store_member_mutations(
    line: &str,
    store_sub: &str,
    prop_store_names: &[String],
) -> String {
    super::store_member_mutate_ast::transform_store_member_mutate_ast_with_props(
        line,
        std::slice::from_ref(&store_sub.to_string()),
        prop_store_names,
    )
    .unwrap_or_else(|| line.to_string())
}
