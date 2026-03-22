//! Reactive statement handling and state mutation transformations.

use crate::compiler::phases::phase2_analyze::ComponentAnalysis;

use super::{
    body_references_identifier, extract_destructure_targets, extract_member_expression_base,
    find_assignment_position, get_or_compile_regex, is_identifier_char, is_only_assignment_target,
    is_simple_identifier, lhs_starts_with_keyword, replace_with_word_boundary,
    transform_destructure_assignments_with_props, transform_prop_assignments,
    transform_prop_reads_in_expr, transform_store_reads_client, wrap_state_vars_in_expr,
};

/// Extract assigned variable names and dependency variable names from a raw `$:` reactive statement.
///
/// This is used for topological sorting of reactive statements.
/// Returns (assigned_vars, dependency_vars).
///
/// For `$: c = a + b;`, returns (["c"], ["a", "b"])
/// For `$: console.log(x);`, returns ([], ["console", "x"])
pub(super) fn extract_reactive_statement_deps(
    statement: &str,
    state_vars: &[String],
    prop_vars: &[String],
    store_sub_vars: &[String],
) -> (Vec<String>, Vec<String>) {
    let trimmed = statement.trim();

    // Extract the body after `$:`
    let body = if let Some(stripped) = trimmed.strip_prefix("$:") {
        stripped.trim()
    } else {
        return (vec![], vec![]);
    };

    let body = body.trim_end_matches(';').trim();
    if body.is_empty() {
        return (vec![], vec![]);
    }

    // All known reactive variable names (state vars + prop vars + store subs)
    // These are the variables that participate in the reactive dependency graph
    let all_reactive_vars: Vec<&str> = state_vars
        .iter()
        .chain(prop_vars.iter())
        .chain(store_sub_vars.iter())
        .map(|s| s.as_str())
        .collect();

    let mut assigned_vars = Vec::new();
    let mut dep_vars = Vec::new();

    // Check if this is an assignment statement
    if let Some(eq_pos) = find_assignment_position(body) {
        let lhs = body[..eq_pos].trim();
        let rhs = body[eq_pos + 1..].trim();

        // Extract assigned variable from LHS
        // Simple identifier: `c = ...`
        if is_simple_identifier(lhs) {
            assigned_vars.push(lhs.to_string());
        } else {
            // Could be a member expression like `obj.prop = ...`
            // Extract the base identifier
            if let Some(base) = extract_member_expression_base(lhs) {
                assigned_vars.push(base.to_string());
            }
        }

        // Extract dependencies from RHS
        for var_name in &all_reactive_vars {
            if body_references_identifier(rhs, var_name) {
                // Only add as dependency if it's not also being assigned
                if !assigned_vars.contains(&var_name.to_string()) {
                    dep_vars.push(var_name.to_string());
                }
            }
        }
    } else {
        // Not a simple assignment - expression statement like `console.log(x)` or `if (...) { x++ }`
        // All referenced reactive vars are dependencies
        for var_name in &all_reactive_vars {
            if body_references_identifier(body, var_name) {
                dep_vars.push(var_name.to_string());
            }
        }
    }

    // Also scan the entire body for assignments to reactive vars inside nested blocks.
    // This catches patterns like `$: if (cond) { count++ }` where `count` is assigned
    // inside an if block but the top-level is not an assignment expression.
    // We look for `var =`, `var++`, `var--`, `++var`, `--var` patterns.
    for var_name in &all_reactive_vars {
        if assigned_vars.contains(&var_name.to_string()) {
            continue; // Already detected as assigned
        }
        if is_assigned_anywhere_in_body(body, var_name)
            && !assigned_vars.contains(&var_name.to_string())
        {
            assigned_vars.push(var_name.to_string());
        }
    }

    (assigned_vars, dep_vars)
}

/// Check if a variable is assigned anywhere in a code body (including nested blocks).
/// Detects `var = ...`, `var += ...`, `var++`, `var--`, `++var`, `--var` patterns.
pub(super) fn is_assigned_anywhere_in_body(body: &str, var_name: &str) -> bool {
    // Check for update expressions: `var++`, `var--`, `++var`, `--var`
    let pp = format!("{}++", var_name);
    let mm = format!("{}--", var_name);
    let pp2 = format!("++{}", var_name);
    let mm2 = format!("--{}", var_name);

    for pattern in &[&pp, &mm, &pp2, &mm2] {
        if let Some(pos) = body.find(pattern.as_str()) {
            // Verify it's at a word boundary
            let before = if pos > 0 {
                body.as_bytes()[pos - 1]
            } else {
                b' '
            };
            let after_pos = pos + pattern.len();
            let after = if after_pos < body.len() {
                body.as_bytes()[after_pos]
            } else {
                b' '
            };
            let before_ok = !before.is_ascii_alphanumeric() && before != b'_' && before != b'$';
            let after_ok = !after.is_ascii_alphanumeric() && after != b'_' && after != b'$';
            if before_ok && after_ok {
                return true;
            }
        }
    }

    // Check for assignment operators: `var = ...`, `var += ...`, `var -= ...`, etc.
    let assign_patterns = [
        " = ", " += ", " -= ", " *= ", " /= ", " %= ", " **= ", " &= ", " |= ", " ^= ", " <<= ",
        " >>= ", " >>>= ", " ??= ", " &&= ", " ||= ",
    ];
    for assign_op in &assign_patterns {
        let pattern = format!("{}{}", var_name, assign_op);
        if let Some(pos) = body.find(&pattern) {
            // Verify the variable name is at a word boundary (not part of a longer name)
            let before = if pos > 0 {
                body.as_bytes()[pos - 1]
            } else {
                b' '
            };
            let before_ok = !before.is_ascii_alphanumeric() && before != b'_' && before != b'$';
            if before_ok {
                // Also make sure it's not `==` or `=>`
                let after_eq = pos + var_name.len() + assign_op.len();
                if assign_op == &" = " && after_eq < body.len() {
                    let next = body.as_bytes()[after_eq - 1]; // the char after '='
                    if next == b'=' || next == b'>' {
                        continue;
                    }
                }
                return true;
            }
        }
    }

    false
}

/// Topologically sort reactive statements based on their dependencies.
///
/// Corresponds to `order_reactive_statements()` in Svelte's `2-analyze/index.js`.
///
/// Each entry is (assigned_vars, dependency_vars, transformed_code).
/// Returns the same entries in topologically sorted order.
pub(super) fn sort_reactive_statements(
    statements: Vec<(Vec<String>, Vec<String>, String)>,
) -> Vec<(Vec<String>, Vec<String>, String)> {
    if statements.len() <= 1 {
        return statements;
    }

    let n = statements.len();

    // Build a lookup: variable name -> indices of statements that assign to it
    let mut assign_lookup: std::collections::HashMap<&str, Vec<usize>> =
        std::collections::HashMap::new();
    for (i, (assigned, _, _)) in statements.iter().enumerate() {
        for var_name in assigned {
            assign_lookup.entry(var_name.as_str()).or_default().push(i);
        }
    }

    // For each statement, find which other statements it depends on
    let mut dep_indices: Vec<Vec<usize>> = vec![Vec::new(); n];
    for (i, (assigned, deps, _)) in statements.iter().enumerate() {
        for dep_name in deps {
            // Skip self-dependencies (assigned vars that are also deps)
            if assigned.contains(dep_name) {
                continue;
            }
            if let Some(assigner_indices) = assign_lookup.get(dep_name.as_str()) {
                for &j in assigner_indices {
                    if j != i {
                        dep_indices[i].push(j);
                    }
                }
            }
        }
    }

    // Topological sort (DFS-based, matching the official implementation's add_declaration function)
    let mut sorted_indices: Vec<usize> = Vec::with_capacity(n);
    let mut visited = vec![false; n];

    fn visit(
        idx: usize,
        dep_indices: &[Vec<usize>],
        visited: &mut Vec<bool>,
        sorted: &mut Vec<usize>,
    ) {
        if visited[idx] {
            return;
        }
        visited[idx] = true;

        // Visit dependencies first
        for &dep in &dep_indices[idx] {
            visit(dep, dep_indices, visited, sorted);
        }

        sorted.push(idx);
    }

    for i in 0..n {
        visit(i, &dep_indices, &mut visited, &mut sorted_indices);
    }

    // Reconstruct the result in sorted order
    #[allow(clippy::type_complexity)]
    let mut statements_opt: Vec<Option<(Vec<String>, Vec<String>, String)>> =
        statements.into_iter().map(Some).collect();
    let mut result = Vec::with_capacity(n);

    for &idx in &sorted_indices {
        if let Some(entry) = statements_opt[idx].take() {
            result.push(entry);
        }
    }

    result
}

/// Transform a `$:` reactive statement to `$.legacy_pre_effect()` call.
///
/// In legacy mode (Svelte 4), reactive statements like `$: c = a + b;` are transformed to:
/// ```javascript
/// $.legacy_pre_effect(() => ($.deep_read_state(a()), $.deep_read_state(b())), () => {
///     c(a() + b());
/// });
/// ```
///
/// The first thunk contains the dependencies (for tracking), wrapped in `$.deep_read_state()`.
/// The second thunk contains the body of the reactive statement.
///
/// Reference: `LabeledStatement.js` in `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/`
#[allow(clippy::too_many_arguments)]
pub(super) fn transform_reactive_statement(
    statement: &str,
    state_vars: &[String],
    non_reactive_state_vars: &[String],
    proxy_vars: &[String],
    prop_assignment_transform_vars: &[String],
    store_sub_vars: &[String],
    import_names: &[String],
    _analysis: &ComponentAnalysis,
) -> String {
    let trimmed = statement.trim();

    // Extract the body after `$:`
    // Handle both `$: body` and `$:\n body` formats
    let body = if let Some(stripped) = trimmed.strip_prefix("$:") {
        stripped.trim()
    } else {
        return statement.to_string();
    };

    // Remove trailing semicolon if present
    let body = body.trim_end_matches(';').trim();

    if body.is_empty() {
        return String::new();
    }

    // Extract locally-declared variables from the body (e.g., `for (let i = 0; ...)`)
    // and treat them as non-reactive so they won't be wrapped in $.get()/$.update() etc.
    let local_vars = extract_locally_declared_vars(body);
    let mut augmented_non_reactive: Vec<String> = non_reactive_state_vars.to_vec();
    for lv in &local_vars {
        if state_vars.contains(lv) && !augmented_non_reactive.contains(lv) {
            augmented_non_reactive.push(lv.clone());
        }
    }
    let non_reactive_state_vars = &augmented_non_reactive;

    // Collapse method chain continuations into a single line.
    // For multi-line reactive statements like:
    //   $: ids = new Array(count)
    //       .fill(null)
    //       .map((_, i) => 'id-' + i)
    // Join continuation lines (starting with '.') onto the previous line to ensure
    // the entire expression is treated as a single unit during assignment detection.
    let body_owned = {
        let mut collapsed = String::new();
        for line in body.lines() {
            let t = line.trim();
            if t.starts_with('.') && !collapsed.is_empty() {
                // Append chain continuation without newline
                collapsed.push_str(t);
            } else {
                if !collapsed.is_empty() {
                    collapsed.push('\n');
                }
                collapsed.push_str(line);
            }
        }
        collapsed
    };
    let body = body_owned.trim_end_matches(';').trim();

    // Collect dependencies from the body
    // Dependencies are variables that need tracking in the dependency thunk.
    // We track whether each dependency is a prop or a state var, because they
    // are serialized differently:
    // - Props (bindable_prop): $.deep_read_state(name()) - deep read with function call
    // - State vars (mutable_source): $.get(name) - simple get without function call
    let mut prop_dependencies: Vec<String> = Vec::new();
    let mut state_dependencies: Vec<String> = Vec::new();

    // Props are dependencies that need tracking
    for prop_name in prop_assignment_transform_vars {
        // Check if this prop is referenced in the body (but not on the left side of assignment)
        if body_references_identifier(body, prop_name) {
            prop_dependencies.push(prop_name.clone());
        }
    }

    // $$props and $$restProps are also treated as prop dependencies in the official compiler.
    // They are wrapped in $.deep_read_state() just like regular props, BUT without the ()
    // function call (they are accessed directly, not via getter functions).
    // Reference: LabeledStatement.js line 44: `if (name === '$$props' || name === '$$restProps' ...)`
    // Note: In our code, $$props is later replaced by $$sanitized_props in post-processing.
    let mut special_prop_dependencies: Vec<String> = Vec::new();
    for special_prop in &["$$props", "$$restProps"] {
        if body_references_identifier(body, special_prop) {
            special_prop_dependencies.push(special_prop.to_string());
        }
    }

    // State vars are also dependencies, but only if they are READ in the body
    // (not just assigned). In the official compiler, reactive_statement.dependencies
    // only includes bindings that are read, not those that are only assigned.
    for state_var in state_vars {
        if !non_reactive_state_vars.contains(state_var)
            && body_references_identifier(body, state_var)
            && !is_only_assignment_target(body, state_var)
        {
            state_dependencies.push(state_var.clone());
        }
    }

    // Store subscription vars are also dependencies
    // e.g., `$: bar = $foo` - `$foo` is a store subscription and should be tracked as a dep.
    // Store subs appear as `$foo()` calls in the dependency thunk.
    let mut store_sub_dependencies: Vec<String> = Vec::new();
    for store_sub in store_sub_vars {
        // Check if the store subscription is referenced on the RHS of the assignment
        // (not as the LHS itself, since `$: $foo = ...` would be a store assignment, not a dep)
        if body_references_identifier(body, store_sub) {
            // Only add as dependency if it appears on the RHS (not as the target of assignment)
            // Check if the body is an assignment and `store_sub` is NOT the LHS
            let is_assignment_target = if let Some(eq_pos) = find_assignment_position(body) {
                let lhs = body[..eq_pos].trim();
                lhs == store_sub.as_str()
            } else {
                false
            };
            if !is_assignment_target {
                store_sub_dependencies.push(store_sub.clone());
            }
        }
    }

    // Import identifiers referenced in the body are also dependencies.
    // In the official compiler, import bindings with `declaration_kind === 'import'`
    // are included as bare identifiers in the dependency list.
    // This handles cases like `$: selected() ? component = Sub : component = banana`
    // where `Sub` is an imported component that should appear in the deps.
    let mut import_dependencies: Vec<String> = Vec::new();
    for import_name in import_names {
        if body_references_identifier(body, import_name) {
            // Don't add if it's already a state var or prop (would be double-counted)
            if !state_vars.contains(import_name)
                && !prop_assignment_transform_vars.contains(import_name)
                && !store_sub_vars.contains(import_name)
            {
                import_dependencies.push(import_name.clone());
            }
        }
    }

    // Transform the body - apply prop transformations
    // For `$: c = a + b;`, the body should become `c(a() + b());`
    // This involves:
    // 1. Transform prop reads to prop() calls
    // 2. Transform prop assignments to prop(value) calls
    let transformed_body;

    // First, check if this is an assignment statement: `c = expr`
    // We must guard against ternary expressions like `a ? b = x : b = y` where
    // find_assignment_position returns a position inside the ternary branch. In that
    // case the LHS would contain `?` which is not a valid assignment target.
    if let Some(eq_pos) = find_assignment_position(body) {
        let lhs = body[..eq_pos].trim();
        let rhs = body[eq_pos + 1..].trim();
        // If the LHS contains `?` it means the `=` was found inside a ternary branch;
        // fall through to the non-assignment (else) path instead.
        // Also check if the LHS starts with a control-flow keyword like `if`, `for`,
        // `while`, etc. -- these indicate the `=` is inside a nested statement, not
        // a top-level assignment.
        if lhs.contains('?') || lhs_starts_with_keyword(lhs) {
            // Treat as non-assignment expression
            let temp = transform_prop_assignments(body, prop_assignment_transform_vars, &[]);
            let temp = transform_prop_update_expressions(&temp, prop_assignment_transform_vars);
            let temp =
                transform_state_update_expressions(&temp, state_vars, non_reactive_state_vars);
            let temp = transform_prop_reads_in_expr(&temp, prop_assignment_transform_vars);
            let temp = transform_state_set_in_reactive(&temp, state_vars, non_reactive_state_vars);
            transformed_body =
                wrap_state_vars_in_expr(&temp, state_vars, non_reactive_state_vars, proxy_vars);
        } else if (lhs.starts_with('[') || lhs.starts_with('{')) && {
            // Check if the LHS contains reactive targets that need destructure expansion
            let targets = extract_destructure_targets(lhs);
            targets
                .iter()
                .any(|t| state_vars.contains(t) || store_sub_vars.contains(t))
        } {
            // Destructure assignment with reactive targets - expand to IIFE
            // Pass prop_assignment_transform_vars so that if the RHS is a prop variable
            // (will be transformed to a function call), the IIFE form is used instead
            // of the comma form. This matches the official compiler's behavior where
            // context.visit(node.right) transforms the RHS before checking should_cache.
            let body = &transform_destructure_assignments_with_props(
                body,
                state_vars,
                store_sub_vars,
                prop_assignment_transform_vars,
            );
            let body = body.as_str();
            let temp = transform_prop_update_expressions(body, prop_assignment_transform_vars);
            let temp =
                transform_state_update_expressions(&temp, state_vars, non_reactive_state_vars);
            let temp = transform_prop_reads_in_expr(&temp, prop_assignment_transform_vars);
            let temp = transform_prop_assignments(&temp, prop_assignment_transform_vars, &[]);
            let temp = transform_state_member_mutations(&temp, state_vars, non_reactive_state_vars);
            let temp = transform_state_set_in_reactive(&temp, state_vars, non_reactive_state_vars);
            transformed_body =
                wrap_state_vars_in_expr(&temp, state_vars, non_reactive_state_vars, proxy_vars);
        } else {
            // If the LHS is a prop variable, transform to prop(value) call
            if prop_assignment_transform_vars.contains(&lhs.to_string()) {
                // Transform the RHS - wrap prop references in prop() calls
                let transformed_rhs =
                    transform_prop_reads_in_expr(rhs, prop_assignment_transform_vars);
                // Also wrap state vars in $.get() calls
                let transformed_rhs = wrap_state_vars_in_expr(
                    &transformed_rhs,
                    state_vars,
                    non_reactive_state_vars,
                    proxy_vars,
                );

                transformed_body = format!("{}({})", lhs, transformed_rhs);
            } else if state_vars.contains(&lhs.to_string())
                && !non_reactive_state_vars.contains(&lhs.to_string())
            {
                // State var assignment → $.set(lhs, rhs)
                let transformed_rhs =
                    transform_prop_reads_in_expr(rhs, prop_assignment_transform_vars);
                let transformed_rhs = wrap_state_vars_in_expr(
                    &transformed_rhs,
                    state_vars,
                    non_reactive_state_vars,
                    proxy_vars,
                );
                // Normalize IIFE parens: (function(a){...}(args)) → (function(a){...})(args)
                let transformed_rhs = crate::compiler::phases::phase3_transform::server::transform_script::normalize_iife_parens(&transformed_rhs);
                let set_expr = format!("$.set({}, {})", lhs, transformed_rhs);
                // If the LHS has a store subscription, wrap in $.store_unsub()
                // to clean up the old subscription when the variable is reassigned.
                // e.g., `$: z = u.id` where $z is a store subscription →
                // `$.store_unsub($.set(z, ...), '$z', $$stores)`
                let store_sub_name = format!("${}", lhs);
                if store_sub_vars.contains(&store_sub_name) {
                    transformed_body = format!(
                        "$.store_unsub({}, '{}', $$stores)",
                        set_expr, store_sub_name
                    );
                } else {
                    transformed_body = set_expr;
                }
            } else {
                // Check if LHS is a member expression with a state var base
                // e.g., `b.foo = a.foo` → `$.mutate(b, $.get(b).foo = $.get(a).foo)`
                let base = extract_member_expression_base(lhs);
                if let Some(base) = base
                    && state_vars.contains(&base.to_string())
                    && !non_reactive_state_vars.contains(&base.to_string())
                {
                    // Mutation of state var member
                    let member_part = &lhs[base.len()..]; // ".foo" or "[idx]"
                    let transformed_rhs =
                        transform_prop_reads_in_expr(rhs, prop_assignment_transform_vars);
                    let transformed_rhs = wrap_state_vars_in_expr(
                        &transformed_rhs,
                        state_vars,
                        non_reactive_state_vars,
                        proxy_vars,
                    );
                    // Build $.mutate(base, $.get(base).member = rhs)
                    // The first arg of $.mutate() is protected by in_mutate_first_arg check
                    // in wrap_state_vars_in_expr, so `base` won't be double-wrapped.
                    transformed_body = format!(
                        "$.mutate({}, $.get({}){} = {})",
                        base, base, member_part, transformed_rhs
                    );
                } else if store_sub_vars.contains(&lhs.to_string()) {
                    // Store subscription assignment → $.store_set(store_name, rhs)
                    // e.g., `$: $a = $b` → body becomes `$.store_set(a, $b())`
                    let store_name = lhs.strip_prefix('$').unwrap_or(lhs);

                    // Check if the underlying store variable needs special access:
                    // - prop vars: use store_name() (getter function call)
                    // - state vars: use $.get(store_name)
                    // - regular: use store_name directly
                    let store_access =
                        if prop_assignment_transform_vars.contains(&store_name.to_string()) {
                            format!("{}()", store_name)
                        } else if state_vars.contains(&store_name.to_string())
                            && !non_reactive_state_vars.contains(&store_name.to_string())
                        {
                            format!("$.get({})", store_name)
                        } else {
                            store_name.to_string()
                        };

                    let transformed_rhs =
                        transform_prop_reads_in_expr(rhs, prop_assignment_transform_vars);
                    let transformed_rhs = wrap_state_vars_in_expr(
                        &transformed_rhs,
                        state_vars,
                        non_reactive_state_vars,
                        proxy_vars,
                    );
                    transformed_body =
                        format!("$.store_set({}, {})", store_access, transformed_rhs);
                } else {
                    // Regular assignment - still transform prop reads on RHS
                    let transformed_rhs =
                        transform_prop_reads_in_expr(rhs, prop_assignment_transform_vars);
                    let transformed_rhs = wrap_state_vars_in_expr(
                        &transformed_rhs,
                        state_vars,
                        non_reactive_state_vars,
                        proxy_vars,
                    );
                    transformed_body = format!("{} = {}", lhs, transformed_rhs);
                }
            }
        } // close the `else` branch of `if lhs.contains('?')`
    } else {
        // Not a simple assignment - handle compound assignments (+=, -=, etc.),
        // update expressions (++/--), and reads.
        // First, expand destructure assignments (e.g., `({foo1} = $store)` or `[foo2] = $store`)
        // into IIFE patterns before other transforms run. This ensures that state var targets
        // get proper `$.set()` treatment inside the IIFE body.
        let body = &transform_destructure_assignments_with_props(
            body,
            state_vars,
            store_sub_vars,
            prop_assignment_transform_vars,
        );
        let body = body.as_str();
        // Transform prop update expressions like `x++` to `$.update_prop(x)` FIRST,
        // before transform_prop_assignments runs (which would incorrectly turn `x++` into `x(x() + 1)`)
        let temp = transform_prop_update_expressions(body, prop_assignment_transform_vars);
        // Also transform state update expressions before compound assignments
        let temp = transform_state_update_expressions(&temp, state_vars, non_reactive_state_vars);
        // Transform prop reads BEFORE prop assignments, so that function calls like
        // `callback(args)` become `callback()(args)` (double-invoke for prop getters).
        // This must happen before transform_prop_assignments to avoid double-wrapping
        // assignment-generated calls like `callback = value` → `callback(value)`.
        let temp = transform_prop_reads_in_expr(&temp, prop_assignment_transform_vars);
        // Then transform prop compound assignments (e.g., `count += 1` → `count(count() + 1)`)
        let temp = transform_prop_assignments(&temp, prop_assignment_transform_vars, &[]);
        // Transform state member-expression mutations (e.g., `object[key] = []`)
        // to `$.mutate(object, $.get(object)[key] = [])`. Must run before wrap_state_vars_in_expr
        // so identifiers are still in their original form.
        let temp = transform_state_member_mutations(&temp, state_vars, non_reactive_state_vars);
        // Transform state var assignments to $.set() before wrapping reads in $.get()
        let temp = transform_state_set_in_reactive(&temp, state_vars, non_reactive_state_vars);
        transformed_body =
            wrap_state_vars_in_expr(&temp, state_vars, non_reactive_state_vars, proxy_vars);
    }

    // Apply store subscription reads transformation to body.
    // This converts `$foo` to `$foo()` in the reactive statement body,
    // so `$.set(bar, $foo)` becomes `$.set(bar, $foo())`.
    let transformed_body = if !store_sub_vars.is_empty() {
        transform_store_reads_client(&transformed_body, store_sub_vars)
    } else {
        transformed_body
    };

    // Build the dependency thunk
    // Props become $.deep_read_state(prop()) - deep read because props could be fine-grained
    // $state from a runes-component, where mutations don't trigger an update on the prop as a whole.
    // State vars become $.get(var) - simple get since they are mutable_source variables.
    // Reference: LabeledStatement.js in the official compiler
    //
    // Dependencies are sorted by their first occurrence in the body (left-to-right order),
    // matching the official Svelte compiler's Phase 2 dependency ordering.
    let has_deps = !prop_dependencies.is_empty()
        || !state_dependencies.is_empty()
        || !store_sub_dependencies.is_empty()
        || !import_dependencies.is_empty()
        || !special_prop_dependencies.is_empty();
    let deps_expr = if !has_deps {
        "".to_string()
    } else {
        // Find the first occurrence position of an identifier in the body text.
        let find_pos = |name: &str| -> usize {
            let escaped = regex::escape(name);
            let pattern = if name.starts_with('$') {
                // `$` is not a word char; use alternation to simulate word boundary
                format!(r"(^|[^a-zA-Z0-9_$]){}([^a-zA-Z0-9_$]|$)", escaped)
            } else {
                format!(r"\b{}\b", escaped)
            };
            if let Some(re) = get_or_compile_regex(&pattern) {
                if let Some(m) = re.find(body) {
                    // If name starts with `$`, the match may include one leading non-ident char;
                    // return the position where the identifier actually starts.
                    let start = m.start();
                    if name.starts_with('$') && start < body.len() {
                        let first_char = body[start..].chars().next().unwrap_or('$');
                        if first_char != '$' {
                            start + first_char.len_utf8()
                        } else {
                            start
                        }
                    } else {
                        start
                    }
                } else {
                    usize::MAX
                }
            } else {
                usize::MAX
            }
        };
        // Build unified dep list: (position, expression_string)
        let mut unified_deps: Vec<(usize, String)> = Vec::new();
        for dep in &prop_dependencies {
            let pos = find_pos(dep);
            unified_deps.push((pos, format!("$.deep_read_state({}())", dep)));
        }
        for dep in &state_dependencies {
            let pos = find_pos(dep);
            unified_deps.push((pos, format!("$.get({})", dep)));
        }
        // Store subscription vars: `$foo()` - call the getter to track dependency
        for dep in &store_sub_dependencies {
            let pos = find_pos(dep);
            unified_deps.push((pos, format!("{}()", dep)));
        }
        // Import identifiers: appear as bare identifiers in the dependency list.
        // In the official compiler, import bindings pass through build_getter()
        // which returns them unchanged (no transform registered).
        for dep in &import_dependencies {
            let pos = find_pos(dep);
            unified_deps.push((pos, dep.clone()));
        }
        // $$props and $$restProps: wrapped in $.deep_read_state() without function call.
        // Unlike regular props which are accessed via getter functions (prop_name()),
        // $$props/$$restProps are accessed directly.
        for dep in &special_prop_dependencies {
            let pos = find_pos(dep);
            unified_deps.push((pos, format!("$.deep_read_state({})", dep)));
        }
        // Sort by first occurrence in body so deps match official compiler output order
        unified_deps.sort_by_key(|&(pos, _)| pos);
        unified_deps
            .into_iter()
            .map(|(_, expr)| expr)
            .collect::<Vec<_>>()
            .join(", ")
    };

    // Replace `break $;` with `return;` since the reactive block becomes a function callback.
    // Also transform labeled break in the form `break $` (without semicolon at the end of block).
    let transformed_body = transformed_body
        .replace("break $;", "return;")
        .replace("break $\n", "return;\n");

    // Unwrap block statements: if the body is `{ ... }`, extract the inner content
    // to put it directly in the callback (avoiding double-block wrapping).
    let (inner_body, is_block) = unwrap_block_statement_owned(&transformed_body);

    // Build the $.legacy_pre_effect() call
    // The dependency expression is always wrapped in parentheses to support:
    // 1. Multiple deps: () => (dep1, dep2) - sequence expression
    // 2. Single dep: () => (dep) - keeps consistent formatting with expected output
    let deps_thunk = if deps_expr.is_empty() {
        "() => {}".to_string()
    } else {
        format!("() => ({})", deps_expr)
    };

    if is_block {
        // Body was a block statement; inner_body has dedented content
        // The inner content lines should be indented one level for the callback body
        let indented = inner_body
            .lines()
            .map(|line| {
                if line.trim().is_empty() {
                    String::new()
                } else {
                    format!("\t{}", line)
                }
            })
            .collect::<Vec<_>>()
            .join("\n");
        format!(
            "$.legacy_pre_effect({}, () => {{\n{}\n}});",
            deps_thunk, indented
        )
    } else {
        // Don't add trailing semicolon if the body already ends with '}' (block/if statement)
        // or if the body is a block statement itself
        let body_needs_semicolon = !inner_body.trim_end().ends_with('}');
        let semi = if body_needs_semicolon { ";" } else { "" };
        format!(
            "$.legacy_pre_effect({}, () => {{\n\t{}{}\n}});",
            deps_thunk, inner_body, semi
        )
    }
}

/// Unwrap a block statement `{ ... }` and return (inner_content, is_block).
/// If the body is a block statement, returns the dedented inner content with is_block=true.
/// Otherwise returns (body, false).
pub(super) fn unwrap_block_statement_owned(body: &str) -> (String, bool) {
    let trimmed = body.trim();
    if !trimmed.starts_with('{') || !trimmed.ends_with('}') {
        return (body.to_string(), false);
    }

    // Find the matching closing brace of the outermost block
    let mut depth = 0;
    let mut in_string = false;
    let mut string_char = ' ';
    let mut in_line_comment = false;
    let mut in_block_comment = false;
    let chars_vec: Vec<(usize, char)> = trimmed.char_indices().collect();
    let len = chars_vec.len();
    let mut idx = 0;

    while idx < len {
        let (i, c) = chars_vec[idx];

        // Handle line comments: skip until newline
        if in_line_comment {
            if c == '\n' {
                in_line_comment = false;
            }
            idx += 1;
            continue;
        }

        // Handle block comments: skip until */
        if in_block_comment {
            if c == '*' && idx + 1 < len && chars_vec[idx + 1].1 == '/' {
                in_block_comment = false;
                idx += 2;
            } else {
                idx += 1;
            }
            continue;
        }

        if in_string {
            if c == '\\' {
                idx += 2; // Skip escaped char
                continue;
            } else if c == string_char {
                in_string = false;
            }
        } else {
            // Detect comment start (before checking string/brace chars)
            if c == '/' && idx + 1 < len {
                if chars_vec[idx + 1].1 == '/' {
                    in_line_comment = true;
                    idx += 2;
                    continue;
                } else if chars_vec[idx + 1].1 == '*' {
                    in_block_comment = true;
                    idx += 2;
                    continue;
                }
            }

            match c {
                '"' | '\'' | '`' => {
                    in_string = true;
                    string_char = c;
                }
                '{' => depth += 1,
                '}' => {
                    depth -= 1;
                    if depth == 0 {
                        if i == trimmed.len() - 1 {
                            // This is the outermost block - extract inner content
                            let inner = &trimmed[1..i];
                            // Trim the leading newline if present
                            let inner = inner.strip_prefix('\n').unwrap_or(inner);
                            let inner = inner.strip_suffix('\n').unwrap_or(inner);
                            // Remove one level of tab indentation from all non-empty lines
                            let dedented = inner
                                .lines()
                                .map(|line| line.strip_prefix('\t').unwrap_or(line).to_string())
                                .collect::<Vec<_>>()
                                .join("\n");
                            return (dedented, true);
                        } else {
                            // There's more content after the }, not a simple block
                            return (body.to_string(), false);
                        }
                    }
                }
                _ => {}
            }
        }
        idx += 1;
    }

    (body.to_string(), false)
}

/// Transform update expressions (++ / --) for prop variables.
///
/// Converts `x++` to `$.update_prop(x)`, `++x` to `$.update_pre_prop(x)`,
/// `x--` to `$.update_prop(x, -1)`, and `--x` to `$.update_pre_prop(x, -1)`.
pub(super) fn transform_prop_update_expressions(expr: &str, prop_vars: &[String]) -> String {
    if prop_vars.is_empty() {
        return expr.to_string();
    }

    // Quick pre-check: if none of the prop vars appear in the expression, skip expensive transforms
    if !prop_vars.iter().any(|v| expr.contains(v.as_str())) {
        return expr.to_string();
    }

    let mut result = expr.to_string();
    for var in prop_vars {
        // Transform postfix x++ to $.update_prop(x)
        let post_inc = format!("{}++", var);
        result = replace_with_word_boundary(
            &result,
            &post_inc,
            &format!("$.update_prop({})", var),
            false,
        );
        // Transform postfix x-- to $.update_prop(x, -1)
        let post_dec = format!("{}--", var);
        result = replace_with_word_boundary(
            &result,
            &post_dec,
            &format!("$.update_prop({}, -1)", var),
            false,
        );
        // Transform prefix ++x to $.update_pre_prop(x)
        let pre_inc = format!("++{}", var);
        result = replace_with_word_boundary(
            &result,
            &pre_inc,
            &format!("$.update_pre_prop({})", var),
            true,
        );
        // Transform prefix --x to $.update_pre_prop(x, -1)
        let pre_dec = format!("--{}", var);
        result = replace_with_word_boundary(
            &result,
            &pre_dec,
            &format!("$.update_pre_prop({}, -1)", var),
            true,
        );
    }
    result
}

/// Transform update expressions (++ / --) for state variables.
///
/// Converts `x++` to `$.update(x)`, `++x` to `$.update_pre(x)`,
/// `x--` to `$.update(x, -1)`, and `--x` to `$.update_pre(x, -1)`.
///
/// Note: This is similar to the logic in `transform_state_assignments` but
/// specifically for use in reactive statement bodies before other transformations.
pub(super) fn transform_state_update_expressions(
    expr: &str,
    state_vars: &[String],
    non_reactive_vars: &[String],
) -> String {
    let mut result = expr.to_string();
    for var in state_vars {
        if non_reactive_vars.contains(var) {
            continue;
        }
        // Transform postfix x++ to $.update(x)
        let post_inc = format!("{}++", var);
        result =
            replace_with_word_boundary(&result, &post_inc, &format!("$.update({})", var), false);
        // Transform postfix x-- to $.update(x, -1)
        let post_dec = format!("{}--", var);
        result = replace_with_word_boundary(
            &result,
            &post_dec,
            &format!("$.update({}, -1)", var),
            false,
        );
        // Transform prefix ++x to $.update_pre(x)
        let pre_inc = format!("++{}", var);
        result =
            replace_with_word_boundary(&result, &pre_inc, &format!("$.update_pre({})", var), true);
        // Transform prefix --x to $.update_pre(x, -1)
        let pre_dec = format!("--{}", var);
        result = replace_with_word_boundary(
            &result,
            &pre_dec,
            &format!("$.update_pre({}, -1)", var),
            true,
        );
    }
    result
}

/// Extract variable names declared locally within a reactive statement body.
///
/// This catches `let`/`const`/`var` declarations including those in `for` loop
/// init clauses (e.g., `for (let i = 0; ...)`). These locally-declared variables
/// should NOT be treated as reactive state variables even if they share a name
/// with a component-level state variable.
pub(super) fn extract_locally_declared_vars(body: &str) -> Vec<String> {
    let mut vars = Vec::new();
    // Match patterns like: `let x`, `const x`, `var x`, including inside `for (let x`
    // We scan for declaration keywords followed by an identifier.
    let re = match get_or_compile_regex(
        r"(?:^|[^a-zA-Z0-9_$])(let|const|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)",
    ) {
        Some(re) => re,
        None => return vars,
    };
    for cap in re.captures_iter(body) {
        if let Some(m) = cap.get(2) {
            vars.push(m.as_str().to_string());
        }
    }
    vars
}

/// Transform simple assignments to state variables into $.set() calls within reactive statements.
/// `x = expr` -> `$.set(x, expr)` for state variables.
/// This handles assignments inside compound statements (if blocks, etc.).
/// Does NOT transform compound assignments (+=, -=, etc.) or declarations.
pub(super) fn transform_state_set_in_reactive(
    expr: &str,
    state_vars: &[String],
    non_reactive_vars: &[String],
) -> String {
    let mut result = expr.to_string();
    for var in state_vars {
        if non_reactive_vars.contains(var) {
            continue;
        }
        // Transform `var = expr` into `$.set(var, expr)`
        // Search for `var` followed by optional whitespace and `=`
        // Manual scanning approach (Rust regex doesn't support lookbehind)
        let assignment_pattern = format!("{} = ", var);
        let mut new_result = String::new();
        let mut last_end = 0;
        let mut search_start = 0;

        while let Some(relative_pos) = result[search_start..].find(&assignment_pattern) {
            let pos = search_start + relative_pos;
            let eq_pos = pos + var.len() + 1; // position of '='

            // Check word boundary before var name
            if pos > 0 {
                let prev_char = result.as_bytes()[pos - 1] as char;
                if prev_char.is_alphanumeric()
                    || prev_char == '_'
                    || prev_char == '$'
                    || prev_char == '.'
                {
                    search_start = pos + assignment_pattern.len();
                    continue;
                }
            }

            // Check it's not ==, ===
            let after_eq = &result[eq_pos + 1..];
            if after_eq.starts_with('=') {
                search_start = pos + assignment_pattern.len();
                continue;
            }

            // Check it's not a declaration (let, const, var)
            let before = result[..pos].trim_end();
            if before.ends_with("let") || before.ends_with("const") || before.ends_with("var") {
                search_start = pos + assignment_pattern.len();
                continue;
            }

            // Check if already wrapped in $.set()
            if before.ends_with("$.set(") {
                search_start = pos + assignment_pattern.len();
                continue;
            }

            // Find the extent of the RHS expression
            let rhs_start = pos + assignment_pattern.len();
            let remaining = &result[rhs_start..];
            // Find the end of the RHS - look for `;`, `}`, or `:` (ternary separator) at depth 0
            // Use char_indices() to get BYTE positions, not char positions, to handle UTF-8 correctly.
            let mut depth = 0;
            let mut rhs_end = result.len();
            let mut in_string: Option<char> = None;
            let mut prev_ch = '\0';
            let remaining_chars: Vec<(usize, char)> = remaining.char_indices().collect();
            let len = remaining_chars.len();
            for (idx, (byte_off, ch)) in remaining_chars.iter().enumerate() {
                let ci = *byte_off; // byte offset into `remaining`
                if in_string.is_some() {
                    if Some(*ch) == in_string && prev_ch != '\\' {
                        in_string = None;
                    }
                    prev_ch = *ch;
                    continue;
                }
                match ch {
                    '\'' | '"' | '`' => in_string = Some(*ch),
                    '(' | '[' | '{' => depth += 1,
                    ')' | ']' | '}' => {
                        if depth == 0 {
                            rhs_end = rhs_start + ci;
                            break;
                        }
                        depth -= 1;
                    }
                    ';' if depth == 0 => {
                        rhs_end = rhs_start + ci;
                        break;
                    }
                    // Newline at depth 0 acts as implicit semicolon (JavaScript ASI)
                    // e.g., `array = []\narray[0] = ...` - the `[]` ends at `\n`
                    '\n' if depth == 0 => {
                        rhs_end = rhs_start + ci;
                        break;
                    }
                    // `:` at depth 0 that is NOT `::` is a ternary separator - stop the RHS here
                    ':' if depth == 0 => {
                        let next = if idx + 1 < len {
                            remaining_chars[idx + 1].1
                        } else {
                            '\0'
                        };
                        if next != ':' {
                            rhs_end = rhs_start + ci;
                            break;
                        }
                    }
                    _ => {}
                }
                prev_ch = *ch;
            }

            let rhs = result[rhs_start..rhs_end].trim();
            if rhs.is_empty() {
                search_start = pos + assignment_pattern.len();
                continue;
            }

            new_result.push_str(&result[last_end..pos]);
            new_result.push_str(&format!("$.set({}, {})", var, rhs));
            last_end = rhs_end;
            search_start = rhs_end;
        }

        if last_end > 0 {
            new_result.push_str(&result[last_end..]);
            result = new_result;
        }
    }
    result
}

/// Transform member-expression assignments of state variables to `$.mutate()` calls.
///
/// Converts patterns like:
///   `state_var[expr] = rhs` → `$.mutate(state_var, $.get(state_var)[expr] = rhs)`
///   `state_var.prop = rhs` → `$.mutate(state_var, $.get(state_var).prop = rhs)`
///
/// This handles nested cases (inside callbacks, if blocks, etc.) where the assignment
/// is not at the top level of the reactive statement.
///
/// This must run BEFORE `wrap_state_vars_in_expr` to operate on the original
/// identifier names before they are rewritten to `$.get(state_var)`.
pub(super) fn transform_state_member_mutations(
    expr: &str,
    state_vars: &[String],
    non_reactive_vars: &[String],
) -> String {
    let mut result = expr.to_string();

    for var in state_vars {
        if non_reactive_vars.contains(var) {
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
                    // Also check it's not already after `$.get(` or `$.mutate(` or $.set(
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

                    if before_ok && after_ok && !already_wrapped {
                        // Scan forward to find the full member expression LHS and the `=` sign
                        // The LHS is `var` followed by member accesses (`.prop` or `[expr]`)
                        // We need to find the position of `=` (but not `==`, `!=`, `<=`, `>=`)
                        let member_start = i + var_len; // position of `[` or `.`
                        let mut j = member_start;
                        let mut depth = 0i32; // bracket/paren depth
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
                                        break; // Left the outer bracket context
                                    }
                                    depth -= 1;
                                    j += 1;
                                }
                                '{' => {
                                    // Object literal or block inside member expr - stop here
                                    // unless we're already inside brackets
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
                                '=' if depth == 0 => {
                                    // Check it's not `==`, `!=`, `<=`, `>=`
                                    let is_double_eq = j + 1 < chars.len() && chars[j + 1] == '=';
                                    let is_comparison =
                                        j > 0 && matches!(chars[j - 1], '!' | '<' | '>' | '=');
                                    if !is_double_eq && !is_comparison {
                                        // Accept both simple = and compound +=, -=, etc.
                                        eq_pos = Some(j);
                                    }
                                    break;
                                }
                                // Semicolons at depth 0 are statement boundaries
                                // - stop scanning for `=` signs.
                                // Without this, `items.slice();\nclone[0].value += "x"`
                                // would incorrectly match `+=` from a different statement.
                                ';' if depth == 0 => {
                                    break;
                                }
                                _ => {
                                    j += 1;
                                }
                            }
                        }

                        if let Some(eq_idx) = eq_pos {
                            // Determine the full assignment operator
                            // eq_idx points to '=' in chars; check chars before it for compound
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

                            // Extract member part (between var and the operator start)
                            let member_part: String =
                                chars[member_start..op_start].iter().collect();
                            let member_part = member_part.trim_end();

                            // Skip whitespace after `=`
                            let rhs_start = eq_idx + 1;
                            // Find end of RHS (until `;` or `}` or `,` at depth 0)
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
                                // Generate: $.mutate(var, $.get(var)<member_part> OP rhs)
                                let mutate_expr = format!(
                                    "$.mutate({}, $.get({}){} {} {})",
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

            new_result.push(chars[i]);
            i += 1;
        }

        result = new_result;
    }

    result
}
