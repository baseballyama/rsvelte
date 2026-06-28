//! Reactive statement handling and state mutation transformations.

use crate::compiler::phases::phase2_analyze::ComponentAnalysis;

use super::{
    body_references_identifier, extract_destructure_targets, extract_member_expression_base,
    find_assignment_position, get_or_compile_regex, is_simple_identifier, lhs_starts_with_keyword,
    transform_destructure_assignments_with_props, transform_prop_assignments,
    transform_prop_reads_in_expr, transform_store_assignments_client, transform_store_reads_client,
    transform_store_sub_calls, wrap_state_vars_in_expr,
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
            let before_ok = !before.is_ascii_alphanumeric()
                && before != b'_'
                && before != b'$'
                && before != b'.';
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
            let before_ok = !before.is_ascii_alphanumeric()
                && before != b'_'
                && before != b'$'
                && before != b'.';
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
    let mut assign_lookup: rustc_hash::FxHashMap<&str, Vec<usize>> =
        rustc_hash::FxHashMap::default();
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
pub(super) fn transform_reactive_statement(
    statement: &str,
    state_vars: &[String],
    non_reactive_state_vars: &[String],
    proxy_vars: &[String],
    prop_assignment_transform_vars: &[String],
    store_sub_vars: &[String],
    import_names: &[String],
    var_state_vars: &[String],
    // Ordered dependency names from Phase 2
    // (`analysis.reactive_statement_dependencies[ordinal]`): the AST-faithful
    // dependency set (order + membership) the deps thunk is built from; the legacy
    // text scan is no longer consulted.
    dep_names: &[String],
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
    //
    // IMPORTANT: we must not collapse `.` lines that live inside string/template
    // literals (e.g., a Markdown `...` on its own line within a backtick template).
    // Track string/template-literal state while scanning characters.
    let body_owned = {
        let mut collapsed = String::new();
        let mut in_single = false;
        let mut in_double = false;
        let mut in_template = 0u32; // depth of backtick template literals
        let mut template_expr_depth = 0i32; // depth of ${...} inside templates
        // Helper to update string state for a given line's characters
        let update_state = |line: &str,
                            in_single: &mut bool,
                            in_double: &mut bool,
                            in_template: &mut u32,
                            template_expr_depth: &mut i32| {
            let bytes = line.as_bytes();
            let mut i = 0;
            while i < bytes.len() {
                let c = bytes[i];
                if c == b'\\' {
                    i += 2;
                    continue;
                }
                if *in_template > 0 && *template_expr_depth == 0 {
                    if c == b'`' {
                        *in_template -= 1;
                    } else if c == b'$' && i + 1 < bytes.len() && bytes[i + 1] == b'{' {
                        *template_expr_depth += 1;
                        i += 2;
                        continue;
                    }
                } else if *in_single {
                    if c == b'\'' {
                        *in_single = false;
                    }
                } else if *in_double {
                    if c == b'"' {
                        *in_double = false;
                    }
                } else {
                    // not in any string or inside template expr
                    match c {
                        b'\'' => *in_single = true,
                        b'"' => *in_double = true,
                        b'`' => *in_template += 1,
                        b'{' if *in_template > 0 && *template_expr_depth > 0 => {
                            *template_expr_depth += 1
                        }
                        b'}' if *in_template > 0 && *template_expr_depth > 0 => {
                            *template_expr_depth -= 1
                        }
                        _ => {}
                    }
                }
                i += 1;
            }
        };
        for line in body.lines() {
            let t = line.trim();
            // Only collapse a leading-dot line if we're not currently inside a
            // string/template literal at the start of this line.
            let in_string_like =
                in_single || in_double || (in_template > 0 && template_expr_depth == 0);
            if t.starts_with('.') && !collapsed.is_empty() && !in_string_like {
                // Append chain continuation without newline
                collapsed.push_str(t);
            } else {
                if !collapsed.is_empty() {
                    collapsed.push('\n');
                }
                collapsed.push_str(line);
            }
            update_state(
                line,
                &mut in_single,
                &mut in_double,
                &mut in_template,
                &mut template_expr_depth,
            );
            // Newline terminates single/double-quoted strings in JS source
            in_single = false;
            in_double = false;
        }
        collapsed
    };
    let body = body_owned.trim_end_matches(';').trim();

    // Dependency membership + ORDER come from the Phase-2 AST reference set
    // (`dep_names`), mirroring `2-analyze/visitors/LabeledStatement.js`. The
    // legacy text-scan membership loops were removed: they mis-handled chained
    // member-property keys (`.add(add)` matched `add` from the `.add(` key),
    // string-literal text, block mutations, etc. The body-transform code below
    // re-derives its rewrites from the `*_vars` lists, not from the dep set, so
    // only the deps-thunk build (further down) consumes `dep_names`.

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
            // Treat as non-assignment expression.
            // Transform order mirrors the non-reactive body flow in client/mod.rs:
            //   update_expressions → prop_reads → prop_assignments → state transforms
            // This ensures that a bare `value = null` is not first converted to
            // `value(null)` and then mistakenly re-wrapped by the read pass as
            // `value()(null)`.
            let temp = transform_prop_update_expressions(body, prop_assignment_transform_vars);
            let temp =
                transform_state_update_expressions(&temp, state_vars, non_reactive_state_vars);
            // Route prop reads through the scope-aware AST wrapper so a prop name
            // used as a local binding inside the keyword body — e.g.
            // `$: if (cond) { const [x, y] = f(); … }` where `x`/`y` shadow props —
            // is neither wrapped in the destructuring binding position
            // (`[x(), y()]`, invalid) nor in the shadowed reads. Falls back to the
            // scope-unaware text path on any parse failure / no-match.
            let temp = super::prop_source_reads_ast::wrap_prop_source_reads_ast(
                &temp,
                prop_assignment_transform_vars,
                &[],
            )
            .unwrap_or_else(|| transform_prop_reads_in_expr(&temp, prop_assignment_transform_vars));
            let temp = transform_prop_assignments(
                &temp,
                prop_assignment_transform_vars,
                &[],
                &rustc_hash::FxHashMap::default(),
            );
            // Wrap state-var member mutations (`obj.a.b = x`) in `$.mutate(obj, …)`.
            // The keyword branch (a `$: if (cond) X = rhs` reactive statement) was
            // missing this pass that both sibling branches have, so a state-var
            // member mutation inside an `if`-guarded reactive statement was emitted
            // without the `$.mutate` wrap. Must run before `wrap_state_vars_in_expr`
            // (which rewrites the LHS root to `$.get(obj)`, after which the
            // member-mutate detector bails).
            let temp = transform_state_member_mutations(&temp, state_vars, non_reactive_state_vars);
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
            let temp = transform_prop_assignments(
                &temp,
                prop_assignment_transform_vars,
                &[],
                &rustc_hash::FxHashMap::default(),
            );
            let temp = transform_state_member_mutations(&temp, state_vars, non_reactive_state_vars);
            let temp = transform_state_set_in_reactive(&temp, state_vars, non_reactive_state_vars);
            let temp =
                wrap_state_vars_in_expr(&temp, state_vars, non_reactive_state_vars, proxy_vars);
            // Reassigning a store-holding variable via destructuring
            // (`$: ({ store } = store_container)`) must unsubscribe the old store
            // so subsequent `$store` reads re-subscribe: wrap the inner
            // `$.set(store, …)` in `$.store_unsub(…, '$store', $$stores)`. The
            // non-destructured `$: z = …` branch below already does this inline.
            transformed_body = super::state_transforms::wrap_store_unsub_for_state_sets(
                &temp,
                state_vars,
                store_sub_vars,
            );
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
                // A nested prop assignment in the RHS (e.g. an arrow default
                // `() => (isOpen = !isOpen)`) must become a setter call
                // `isOpen(!isOpen())`. The ternary / destructure branches already
                // run this pass; the state-var-assignment branch was missing it.
                let transformed_rhs = transform_prop_assignments(
                    &transformed_rhs,
                    prop_assignment_transform_vars,
                    &[],
                    &rustc_hash::FxHashMap::default(),
                );
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
                } else if let Some(base) = extract_member_expression_base(lhs)
                    && prop_assignment_transform_vars.contains(&base.to_string())
                {
                    // Mutation of a prop member: `foo[key] = rhs` or `foo.x = rhs`.
                    // Transform to `foo(foo()[key] = <rhs_with_prop_reads>, true)`.
                    // Transform prop reads inside the LHS member part (e.g. `dependency.api_name`
                    // → `dependency().api_name`), and transform the root prop to `foo()`.
                    let member_part = &lhs[base.len()..];
                    let transformed_member_part =
                        transform_prop_reads_in_expr(member_part, prop_assignment_transform_vars);
                    let transformed_rhs =
                        transform_prop_reads_in_expr(rhs, prop_assignment_transform_vars);
                    let transformed_rhs = wrap_state_vars_in_expr(
                        &transformed_rhs,
                        state_vars,
                        non_reactive_state_vars,
                        proxy_vars,
                    );
                    transformed_body = format!(
                        "{}({}(){} = {}, true)",
                        base, base, transformed_member_part, transformed_rhs
                    );
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
        let temp = transform_prop_assignments(
            &temp,
            prop_assignment_transform_vars,
            &[],
            &rustc_hash::FxHashMap::default(),
        );
        // Transform state member-expression mutations (e.g., `object[key] = []`)
        // to `$.mutate(object, $.get(object)[key] = [])`. Must run before wrap_state_vars_in_expr
        // so identifiers are still in their original form.
        let temp = transform_state_member_mutations(&temp, state_vars, non_reactive_state_vars);
        // Transform state var assignments to $.set() before wrapping reads in $.get()
        let temp = transform_state_set_in_reactive(&temp, state_vars, non_reactive_state_vars);
        let temp = wrap_state_vars_in_expr(&temp, state_vars, non_reactive_state_vars, proxy_vars);
        // Reassigning a store-holding variable inside a destructuring IIFE
        // (`$: ({ store } = store_container)`) must unsubscribe the old store so
        // later `$store` reads re-subscribe: wrap `$.set(store, …)` in
        // `$.store_unsub(…, '$store', $$stores)`. (The simple-assignment branch
        // above does this inline.)
        transformed_body = super::state_transforms::wrap_store_unsub_for_state_sets(
            &temp,
            state_vars,
            store_sub_vars,
        );
    }

    // Apply store subscription transformations to body.
    // First, transform store sub calls: `$t('key')` -> `$t()('key')` (double-call for store getters).
    // Then, transform store reads: `$foo` -> `$foo()` in the reactive statement body.
    let transformed_body = if !store_sub_vars.is_empty() {
        let transformed_body = transform_store_sub_calls(&transformed_body, store_sub_vars);
        // Lower store WRITES nested in a reactive block body (`$: { … $store = x }`)
        // to `$.store_set(store, x)` BEFORE wrapping reads. Without this the read
        // wrap mangles the assignment LHS into `$store() = x` (invalid JS).
        let transformed_body = transform_store_assignments_client(
            &transformed_body,
            store_sub_vars,
            prop_assignment_transform_vars,
            state_vars,
            non_reactive_state_vars,
        );
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
    // Build the dependency thunk from the AST-derived ordered dependency list
    // (`dep_names`, from Phase 2). Order = upstream traversal order; membership =
    // upstream scope-reference set (member-property keys are never present, so a
    // chained `.add(add)` resolves to the `add` argument, not the method key).
    // Each name is classified to its serialized getter form, mirroring
    // `3-transform/client/visitors/LabeledStatement.js`'s build_getter +
    // deep_read_state. A name that matches no `*_vars` list is a plain local /
    // non-reactive `normal` binding and is skipped (upstream `continue`).
    let deps_expr = {
        let mut parts: Vec<String> = Vec::with_capacity(dep_names.len());
        for name in dep_names {
            if name == "$$props" || name == "$$restProps" {
                parts.push(format!("$.deep_read_state({})", name));
            } else if prop_assignment_transform_vars.iter().any(|p| p == name) {
                parts.push(format!("$.deep_read_state({}())", name));
            } else if store_sub_vars.iter().any(|s| s == name) {
                parts.push(format!("{}()", name));
            } else if state_vars.iter().any(|s| s == name)
                && !non_reactive_state_vars.iter().any(|s| s == name)
            {
                let getter = if var_state_vars.iter().any(|v| v == name) {
                    "$.safe_get"
                } else {
                    "$.get"
                };
                parts.push(format!("{}({})", getter, name));
            } else if import_names.iter().any(|i| i == name)
                && !state_vars.iter().any(|s| s == name)
                && !prop_assignment_transform_vars.iter().any(|p| p == name)
                && !store_sub_vars.iter().any(|s| s == name)
            {
                parts.push(name.clone());
            }
        }
        parts.join(", ")
    };

    // Replace `break $;` with `return;` since the reactive block becomes a function callback.
    // Also transform labeled break in the form `break $` (without semicolon at the end of block).
    let transformed_body =
        if memchr::memmem::find(transformed_body.as_bytes(), b"break $").is_some() {
            transformed_body
                .replace("break $;", "return;")
                .replace("break $\n", "return;\n")
        } else {
            transformed_body
        };

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
        // The inner content lines should be indented one level for the callback body.
        // IMPORTANT: lines that fall INSIDE a multi-line template literal must NOT be
        // re-indented — template-literal content is part of the string value and must
        // be preserved byte-for-byte. We use a running in-template state so that only
        // lines outside of any `...` block get an extra tab.
        use crate::compiler::phases::phase3_transform::client::formatting::update_template_literal_state;
        let mut indented = String::with_capacity(inner_body.len() + inner_body.lines().count());
        let mut in_template_literal = false;
        for (i, line) in inner_body.lines().enumerate() {
            if i > 0 {
                indented.push('\n');
            }
            if in_template_literal {
                // Inside a template literal: preserve the line exactly as-is
                // (including empty lines).
                indented.push_str(line);
            } else if !line.trim().is_empty() {
                indented.push('\t');
                indented.push_str(line);
            }
            in_template_literal = update_template_literal_state(line, in_template_literal);
        }
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
                            let mut dedented = String::with_capacity(inner.len());
                            for (i, line) in inner.lines().enumerate() {
                                if i > 0 {
                                    dedented.push('\n');
                                }
                                dedented.push_str(line.strip_prefix('\t').unwrap_or(line));
                            }
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
    super::reactive_update_ast::transform_reactive_update_ast(expr, prop_vars, &[], &[])
        .unwrap_or_else(|| expr.to_string())
}

/// Transform update expressions (++ / --) for state variables.
///
/// Converts `x++` to `$.update(x)`, `++x` to `$.update_pre(x)`,
/// `x--` to `$.update(x, -1)`, and `--x` to `$.update_pre(x, -1)`.
pub(super) fn transform_state_update_expressions(
    expr: &str,
    state_vars: &[String],
    non_reactive_vars: &[String],
) -> String {
    super::reactive_update_ast::transform_reactive_update_ast(
        expr,
        &[],
        state_vars,
        non_reactive_vars,
    )
    .unwrap_or_else(|| expr.to_string())
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
    super::state_set_reactive_ast::transform_state_set_reactive_ast(
        expr,
        state_vars,
        non_reactive_vars,
    )
    .unwrap_or_else(|| expr.to_string())
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
    super::state_member_mutate_ast::transform_state_member_mutate_ast(
        expr,
        state_vars,
        non_reactive_vars,
    )
    .unwrap_or_else(|| expr.to_string())
}
