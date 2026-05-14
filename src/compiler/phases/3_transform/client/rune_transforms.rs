//! Rune detection and transformation for $state, $derived, and $effect.

use memchr::memmem;

use super::destructure_transforms::build_fallback_string;
use super::{
    ARRAY_LOOKUP_COUNTER, DERIVED_TMP_COUNTER, SCRIPT_ARRAY_COUNTER, STATE_TMP_COUNTER,
    contains_direct_await_in_expression, extract_enclosing_function_name,
    extract_local_reactive_vars, extract_trace_call_label, find_matching_brace,
    find_matching_paren, find_trace_source_location, is_function_parameter_in_statement,
    strip_top_level_await_from_expr, transform_props_destructuring, unthunk_string,
    wrap_await_with_save_in_async_derived, wrap_state_vars_in_expr,
};
use crate::compiler::phases::phase2_analyze::ComponentAnalysis;

/// Find the position of `$derived.by(` in the string, skipping already-transformed occurrences.
pub(super) fn find_unescaped_derived_by_call(s: &str) -> Option<usize> {
    let mut search_from = 0;
    while let Some(pos) = memmem::find(&s.as_bytes()[search_from..], b"$derived.by(") {
        let abs_pos = search_from + pos;
        if abs_pos > 0 && s.as_bytes()[abs_pos - 1] == b'.' {
            search_from = abs_pos + 12;
            continue;
        }
        return Some(abs_pos);
    }
    None
}

/// Find the position of `$derived(` in the string, skipping already-transformed occurrences.
pub(super) fn find_unescaped_derived_call(s: &str) -> Option<usize> {
    let mut search_from = 0;
    while let Some(pos) = memmem::find(&s.as_bytes()[search_from..], b"$derived(") {
        let abs_pos = search_from + pos;
        if abs_pos > 0 && s.as_bytes()[abs_pos - 1] == b'.' {
            search_from = abs_pos + 9;
            continue;
        }
        if s[abs_pos..].starts_with("$derived.by(") {
            search_from = abs_pos + 12;
            continue;
        }
        return Some(abs_pos);
    }
    None
}

/// Transform runes for client-side usage with skip and state variable handling.
#[allow(clippy::too_many_arguments)]
pub(super) fn transform_client_runes_with_skip_and_state(
    line: &str,
    skip_state_vars: &[String],
    state_vars: &[String],
    non_reactive_vars: &[String],
    prop_source_vars: &[String],
    exported_names: &[String],
    proxy_vars: &[String],
    dev: bool,
    analysis: &ComponentAnalysis,
    store_sub_vars: &[String],
    read_only_props: &[(String, String)],
) -> String {
    // Quick pre-check: if no rune-like pattern (`$` followed by letter) appears, skip
    if !line.contains('$') {
        return line.to_string();
    }

    let mut result = line.to_string();

    // Check which rune names are actually store subscriptions.
    // When $state or $effect is imported from a store (not a real rune),
    // we must NOT transform $state(x) to $.state(x) or $effect(x) to $.user_effect(x).
    let state_is_store_sub = store_sub_vars.iter().any(|s| s == "$state");
    let effect_is_store_sub = store_sub_vars.iter().any(|s| s == "$effect");
    let derived_is_store_sub = store_sub_vars.iter().any(|s| s == "$derived");

    // Lazily check if rune names appear as function parameters in this statement.
    // is_function_parameter_in_statement is expensive (scans the entire line), so
    // only call it when we actually need it (i.e., the rune is not a store sub).
    // When a function declares `function bar($derived, $effect)`, those names shadow
    // the runes within the function body, so rune transforms should be skipped.
    let state_is_func_param = !state_is_store_sub
        && memmem::find(line.as_bytes(), b"$state").is_some()
        && is_function_parameter_in_statement(line, "$state");
    let effect_is_func_param = !effect_is_store_sub
        && memmem::find(line.as_bytes(), b"$effect").is_some()
        && is_function_parameter_in_statement(line, "$effect");
    let derived_is_func_param = !derived_is_store_sub
        && memmem::find(line.as_bytes(), b"$derived").is_some()
        && is_function_parameter_in_statement(line, "$derived");

    // Skip all $state rune transforms if $state is actually a store subscription or function param
    if !state_is_store_sub && !state_is_func_param {
        // Handle destructuring patterns with $state/$state.raw BEFORE other $state transforms.
        // e.g. `let { num } = $state(setup())` -> `let tmp = setup(), num = $.state($.proxy(tmp.num))`
        if let Some(state_pos) = memmem::find(result.as_bytes(), b"$state(")
            .or_else(|| memmem::find(result.as_bytes(), b"$state.raw("))
        {
            let before_state = &result[..state_pos];
            if (memmem::find(before_state.as_bytes(), b"let ").is_some()
                || memmem::find(before_state.as_bytes(), b"const ").is_some()
                || memmem::find(before_state.as_bytes(), b"var ").is_some())
                && (before_state.contains('{') || before_state.contains('['))
            {
                let is_raw = result[state_pos..].starts_with("$state.raw(");
                if let Some(transformed) = transform_state_destructuring(
                    &result,
                    is_raw,
                    skip_state_vars,
                    state_vars,
                    non_reactive_vars,
                    proxy_vars,
                ) {
                    let mut transformed = apply_effect_rune_transforms(transformed);

                    // In dev mode, wrap $.state() and $.derived() declarations with $.tag()
                    if dev {
                        transformed = wrap_state_derived_with_tag(&transformed);
                    }

                    return transformed;
                }
            }
        }

        // Transform $state.snapshot(x) to $.snapshot(x)
        // In dev mode, if preceded by svelte-ignore state_snapshot_uncloneable comment,
        // add `true` as second argument to suppress runtime warning
        if memmem::find(result.as_bytes(), b"$state.snapshot(").is_some() {
            result = result.replace("$state.snapshot(", "$.snapshot(");
        }

        // `$state.raw(x)` / `$state.frozen(x)` rune declarators — formerly
        // rewritten here via a per-rune text loop — are now rewritten in
        // `ast_state_transform::transform_state_vars_ast` via
        // `try_rewrite_state_raw_or_frozen_declarator`. The AST visit gets
        // precise lexical scope checks for `$state` (matching `is_shadowed`),
        // produces the same `$.state(arg)` / bare-`arg` / `void 0` outputs,
        // and lets the dev-mode `wrap_state_derived_with_tag` pass (now run a
        // second time after `transform_state_vars_ast`) tag the resulting
        // declarations.
        //
        // Destructured `$state.raw` / `$state.frozen` patterns are still
        // handled by the upstream `transform_state_destructuring` call above
        // (which emits `$.state(...)` directly).

        // Plain `$state(...)` rune declarators — formerly rewritten here by a
        // per-statement byte-level loop — are now rewritten in
        // `ast_state_transform::transform_state_vars_ast` via
        // `try_rewrite_state_call_declarator`. The AST visit gets precise
        // lexical scope checks for `$state` (matching `is_shadowed`),
        // uses `should_proxy_ast` for the proxy decision, and produces the
        // same `$.state(...)` / `$.state($.proxy(...))` / `$.proxy(...)` /
        // bare-`arg` / `void 0` outputs.
        //
        // Destructured `$state(...)` patterns are still handled by the
        // upstream `transform_state_destructuring` call further above (which
        // emits `$.state(...)` directly).
    } // end if !state_is_store_sub

    // Skip all $derived rune transforms if $derived is actually a store subscription or function param
    if !derived_is_store_sub && !derived_is_func_param {
        // Transform $derived.by() to $.derived() - must be processed BEFORE $derived()
        // $derived.by() already has a callback, so pass it directly
        // But we need to wrap state variable references inside the callback with $.get()
        // Loop to handle multiple $derived.by() calls in a single statement
        while let Some(pos) = find_unescaped_derived_by_call(&result) {
            // Check if this is a destructuring pattern: let { a, b } = $derived.by(expr)
            let before_derived_by = result[..pos].trim();
            let has_destructuring_by = (memmem::find(before_derived_by.as_bytes(), b"let ")
                .is_some()
                || memmem::find(before_derived_by.as_bytes(), b"const ").is_some()
                || memmem::find(before_derived_by.as_bytes(), b"var ").is_some())
                && (before_derived_by.contains('{') || before_derived_by.contains('['));

            if has_destructuring_by {
                // Handle destructuring pattern for $derived.by()
                // $derived.by() always creates a $$d temp (unlike $derived(identifier) which skips it)
                if let Some(transformed) = transform_derived_by_destructuring(
                    &result,
                    state_vars,
                    non_reactive_vars,
                    proxy_vars,
                ) {
                    return apply_effect_rune_transforms(transformed);
                }
            }

            let derived_start = pos + 12; // after "$derived.by("
            if let Some(content_end) = find_matching_paren(&result[derived_start..]) {
                let content = &result[derived_start..derived_start + content_end];

                // Extract local const $state() declarations from the callback body.
                // In runes mode, const $state() vars are non-reactive (never reassigned),
                // so they should not be wrapped with $.get() inside the callback.
                let local_callback_vars = extract_local_reactive_vars(content);
                let mut effective_non_reactive = non_reactive_vars.to_vec();
                if analysis.runes {
                    for (var, is_const, is_state) in &local_callback_vars {
                        // Only $state vars can be non-reactive; $derived always needs $.get()
                        if *is_const && *is_state {
                            let state_check = format!("const {} = $state(", var);
                            let raw_check = format!("const {} = $state.raw(", var);
                            if (content.contains(&state_check) || content.contains(&raw_check))
                                && !effective_non_reactive.contains(var)
                            {
                                effective_non_reactive.push(var.clone());
                            }
                        }
                    }
                }

                // Wrap state variables inside the callback with $.get()
                let wrapped_content = wrap_state_vars_in_expr(
                    content,
                    state_vars,
                    &effective_non_reactive,
                    proxy_vars,
                );
                let new_derived = format!("$.derived({})", wrapped_content);
                result = format!(
                    "{}{}{}",
                    &result[..pos],
                    new_derived,
                    &result[derived_start + content_end + 1..]
                );
            } else {
                result = format!("{}$.derived({}", &result[..pos], &result[pos + 12..]);
                break;
            }
        }

        // Transform $derived(x) to $.derived(() => x) or $.async_derived() for async
        // Handle destructuring patterns specially
        // Loop to handle multiple $derived() calls in a single statement
        // (e.g., inside a function body with multiple derived declarations)
        while let Some(pos) = find_unescaped_derived_call(&result) {
            let before_pos_bytes = &result.as_bytes()[..pos];
            if !(memmem::find(before_pos_bytes, b"let ").is_some()
                || memmem::find(before_pos_bytes, b"const ").is_some()
                || memmem::find(before_pos_bytes, b"var ").is_some())
            {
                break;
            }

            // Check if this is a destructuring pattern
            let before_derived = result[..pos].trim();
            let has_destructuring = before_derived.contains('{') || before_derived.contains('[');

            if has_destructuring {
                // Handle destructuring pattern for $derived
                if let Some(transformed) = transform_derived_destructuring(
                    &result,
                    state_vars,
                    non_reactive_vars,
                    proxy_vars,
                ) {
                    return apply_effect_rune_transforms(transformed);
                }
            }

            // Find the content inside $derived(...)
            let derived_start = pos + 9; // after "$derived("
            if let Some(content_end) = find_matching_paren(&result[derived_start..]) {
                let content = &result[derived_start..derived_start + content_end];
                // Strip trailing comma from $derived(expr,) - the trailing comma is valid
                // in function call syntax but NOT in arrow function body grouping: () => (expr,) is a SyntaxError
                let content = content
                    .trim_end()
                    .strip_suffix(',')
                    .map_or(content, |stripped| stripped);
                // Wrap in arrow function if not already a function
                let trimmed_content = content.trim();
                if !trimmed_content.starts_with("()") && !trimmed_content.starts_with("function") {
                    // Check if the derived expression contains await (async derived)
                    // Note: We need to check for await NOT inside an inner async function
                    let contains_direct_await =
                        contains_direct_await_in_expression(trimmed_content);

                    // Wrap state variables inside the derived expression with $.get()
                    let wrapped_content =
                        wrap_state_vars_in_expr(content, state_vars, non_reactive_vars, proxy_vars);

                    // Check if the content is an object literal - if so, wrap in parentheses
                    // to disambiguate from a block statement
                    let wrapped_trimmed = wrapped_content.trim();
                    let is_object_literal = wrapped_trimmed.starts_with('{');

                    let new_derived = if contains_direct_await {
                        // For async derived in instance script:
                        // Strip the top-level `await` and check if there are remaining awaits.
                        // No $.save wrapping (that's only for nested contexts).
                        let inner_expr = strip_top_level_await_from_expr(wrapped_trimmed);
                        let inner_has_nested_await =
                            contains_direct_await_in_expression(&inner_expr);

                        if inner_has_nested_await {
                            // Still has await after stripping → use async thunk
                            let is_obj = wrapped_trimmed.starts_with('{');
                            if is_obj {
                                format!("await $.async_derived(async () => ({}))", wrapped_trimmed)
                            } else {
                                format!("await $.async_derived(async () => {})", wrapped_trimmed)
                            }
                        } else {
                            // No more await → use sync thunk
                            let inner_trimmed = inner_expr.trim();
                            let inner_is_object = inner_trimmed.starts_with('{');
                            if inner_is_object {
                                format!("await $.async_derived(() => ({}))", inner_expr)
                            } else {
                                let thunk_arg = unthunk_string(&inner_expr);
                                format!("await $.async_derived({})", thunk_arg)
                            }
                        }
                    } else if is_object_literal {
                        format!("$.derived(() => ({}))", wrapped_content)
                    } else {
                        // Check if the content is a store subscription variable (e.g., $store1).
                        // Store subs are already getter functions, so they can be passed directly
                        // to $.derived() without wrapping: $.derived($store1) instead of
                        // $.derived(() => $store1())
                        let trimmed_wrapped = wrapped_content.trim();
                        if store_sub_vars.contains(&trimmed_wrapped.to_string()) {
                            format!("$.derived({})", trimmed_wrapped)
                        } else if prop_source_vars.iter().any(|p| p == trimmed_wrapped) {
                            // Prop source: $.derived(propName) - the prop getter IS the derived fn
                            format!("$.derived({})", trimmed_wrapped)
                        } else {
                            // Apply unthunk optimization: $.derived(() => name()) -> $.derived(name)
                            // This matches the official compiler's b.thunk() + unthunk() behavior
                            let derived_arg = unthunk_string(&wrapped_content);
                            format!("$.derived({})", derived_arg)
                        }
                    };

                    result = format!(
                        "{}{}{}",
                        &result[..pos],
                        new_derived,
                        &result[derived_start + content_end + 1..]
                    );
                } else {
                    // The content is already a function - check if it's async
                    // $derived(async () => { ... }) should become $.derived(() => async () => { ... })
                    // Note: returns the async function, NOT invokes it
                    if trimmed_content.starts_with("async ") {
                        // Wrap: $.derived(() => async () => {...})
                        let wrapped_content = wrap_state_vars_in_expr(
                            content,
                            state_vars,
                            non_reactive_vars,
                            proxy_vars,
                        );
                        let new_derived = format!("$.derived(() => {})", wrapped_content);
                        result = format!(
                            "{}{}{}",
                            &result[..pos],
                            new_derived,
                            &result[derived_start + content_end + 1..]
                        );
                    } else {
                        // Sync arrow function inside $derived():
                        // $derived(() => { ... }) should become $.derived(() => () => { ... })
                        // The official compiler wraps ALL $derived() args in b.thunk(), which
                        // wraps the arrow function: () => (() => { ... })
                        let wrapped_content = wrap_state_vars_in_expr(
                            content,
                            state_vars,
                            non_reactive_vars,
                            proxy_vars,
                        );
                        let new_derived = format!("$.derived(() => {})", wrapped_content);
                        result = format!(
                            "{}{}{}",
                            &result[..pos],
                            new_derived,
                            &result[derived_start + content_end + 1..]
                        );
                    }
                }
            } else {
                result = format!("{}$.derived({}", &result[..pos], &result[pos + 9..]);
                break;
            }
        }
    } // end if !derived_is_store_sub

    // Transform $state.eager(x) to $.eager(() => x) - thunk wrapping
    if !state_is_store_sub
        && !state_is_func_param
        && let Some(pos) = memmem::find(result.as_bytes(), b"$state.eager(")
    {
        let eager_start = pos + 13; // after "$state.eager("
        if let Some(content_end) = find_matching_paren(&result[eager_start..]) {
            let content = &result[eager_start..eager_start + content_end];
            let wrapped_content =
                wrap_state_vars_in_expr(content, state_vars, non_reactive_vars, proxy_vars);
            result = format!(
                "{}$.eager(() => {}){}",
                &result[..pos],
                wrapped_content,
                &result[eager_start + content_end + 1..]
            );
        }
    } // end state.eager guard

    // `$effect` rune family — formerly `replace_effect_patterns(&result)` —
    // is now handled by the AST pass in
    // `phase3_transform::client::ast_state_transform::transform_state_vars_ast`.
    // The AST pass runs once per component after this per-statement loop and
    // performs the same five rewrites (`$effect`, `$effect.pre`, `$effect.root`,
    // `$effect.tracking()`, `$effect.pending()`) with precise scope-aware
    // shadowing checks. `effect_is_store_sub` / `effect_is_func_param` no
    // longer have a consumer in this branch; the AST visitor consults the
    // same `store_sub_vars` set and uses true lexical scope tracking instead
    // of the statement-wide `is_function_parameter_in_statement` heuristic.
    let _ = (effect_is_store_sub, effect_is_func_param);

    // Transform $props.id() to $.props_id()
    if memmem::find(result.as_bytes(), b"$props.id()").is_some() {
        result = result.replace("$props.id()", "$.props_id()");
    }

    // Transform $inspect.trace(...) - in non-dev mode, remove the entire statement
    // In dev mode, transform the enclosing block body to wrap remaining statements in $.trace()
    while let Some(pos) = memmem::find(result.as_bytes(), b"$inspect.trace(") {
        let trace_start = pos + 15; // after "$inspect.trace("
        if let Some(content_end) = find_matching_paren(&result[trace_start..]) {
            let trace_arg = result[trace_start..trace_start + content_end]
                .trim()
                .to_string();
            let mut end = trace_start + content_end + 1;
            // Also consume trailing semicolons and whitespace/newline
            while end < result.len()
                && (result.as_bytes()[end] == b';'
                    || result.as_bytes()[end] == b' '
                    || result.as_bytes()[end] == b'\t'
                    || result.as_bytes()[end] == b'\n'
                    || result.as_bytes()[end] == b'\r')
            {
                end += 1;
            }
            // Remove leading whitespace/tabs on the same line as $inspect.trace
            let mut start = pos;
            while start > 0
                && (result.as_bytes()[start - 1] == b' ' || result.as_bytes()[start - 1] == b'\t')
            {
                start -= 1;
            }

            if !dev {
                // In non-dev mode, just remove the $inspect.trace() statement
                result = format!("{}{}", &result[..start], &result[end..]);
            } else {
                // In dev mode, transform the enclosing function body:
                // Remove $inspect.trace(...); and wrap remaining body in:
                //   return $.trace(() => arg, () => { ...remaining... });
                //
                // The $inspect.trace() is always the first statement in a block body.
                // We need to find the enclosing block's closing brace to wrap everything.

                // Remove the $inspect.trace line first
                let before_trace = &result[..start];
                let after_trace = &result[end..];

                // Find the opening brace of the enclosing block before $inspect.trace
                // This is the `{` after the arrow/function that contains $inspect.trace
                let mut brace_pos = None;
                let before_bytes = before_trace.as_bytes();
                let mut i = before_bytes.len();
                while i > 0 {
                    i -= 1;
                    if before_bytes[i] == b'{' {
                        brace_pos = Some(i);
                        break;
                    }
                    // Skip whitespace and newlines
                    if before_bytes[i] != b' '
                        && before_bytes[i] != b'\t'
                        && before_bytes[i] != b'\n'
                        && before_bytes[i] != b'\r'
                    {
                        break;
                    }
                }

                if let Some(brace_idx) = brace_pos {
                    // Find the matching closing brace for this block
                    let body_start = brace_idx + 1;
                    let combined = format!("{}{}", before_trace, after_trace);
                    let body_content = &combined[body_start..];

                    if let Some(close_brace) = find_matching_brace(body_content) {
                        // Extract the remaining body (everything between { and } after removing $inspect.trace)
                        let remaining_body = combined[body_start..body_start + close_brace].trim();
                        // Skip past the closing brace itself
                        let after_block = &combined[body_start + close_brace + 1..];

                        // Build the trace argument thunk
                        let trace_thunk = if trace_arg.is_empty() {
                            // No argument - extract the label from context
                            // Uses the same logic as the official compiler's get_function_label():
                            // 1. Named function -> function name
                            // 2. Call expression parent (e.g. $effect(() => ...)) -> "$effect(...)"
                            // 3. Fallback -> "trace"
                            let before_block = &combined[..brace_idx];
                            let default_label = extract_enclosing_function_name(before_block)
                                .unwrap_or_else(|| {
                                    // Check if the enclosing context is a call expression
                                    // e.g., $effect(() => { ... }) or $.user_effect(() => { ... })
                                    extract_trace_call_label(before_block, &analysis.source)
                                        .unwrap_or("trace")
                                });

                            // Find source location of the enclosing function/arrow
                            let trace_source_pos = find_trace_source_location(
                                before_block,
                                &analysis.source,
                                default_label,
                            );
                            if let Some((line, col)) = trace_source_pos {
                                format!(
                                    "() => '{} ({}:{}:{})'",
                                    default_label, analysis.filename, line, col
                                )
                            } else {
                                format!("() => '{}'", default_label)
                            }
                        } else {
                            format!("() => {}", trace_arg)
                        };

                        // Build: { return $.trace(thunk, () => { remaining_body }); }
                        result = format!(
                            "{}{{return $.trace({}, () => {{\n{}\n}});\n}}{}",
                            &combined[..brace_idx],
                            trace_thunk,
                            remaining_body,
                            after_block
                        );
                    } else {
                        // Couldn't find matching brace, just remove the trace call
                        result = format!("{}{}", before_trace, after_trace);
                    }
                } else {
                    // No enclosing brace found, just remove the trace call
                    result = format!("{}{}", before_trace, after_trace);
                }
            }
        } else {
            break;
        }
    }

    // Transform $inspect(...) - in non-dev mode, remove the entire call
    // In dev mode, transform to $.inspect(() => [args], (...$$args) => console.log(...$$args), true)
    if let Some(pos) = memmem::find(result.as_bytes(), b"$inspect(") {
        if dev {
            // Find the matching closing paren to get the arguments
            let inspect_start = pos + 9; // after "$inspect("
            if let Some(content_end) = find_matching_paren(&result[inspect_start..]) {
                let args_content = &result[inspect_start..inspect_start + content_end];

                // Check if this is $inspect().with() pattern
                let after_inspect = &result[inspect_start + content_end + 1..];
                if after_inspect.trim_start().starts_with(".with(") {
                    // $inspect(...).with(callback) pattern
                    let with_start_offset =
                        memmem::find(after_inspect.as_bytes(), b".with(").unwrap();
                    let with_content_start =
                        inspect_start + content_end + 1 + with_start_offset + 6;
                    if let Some(with_end) = find_matching_paren(&result[with_content_start..]) {
                        let callback = &result[with_content_start..with_content_start + with_end];
                        let rest = &result[with_content_start + with_end + 1..];

                        // Build: $.inspect(() => [args], (...$$args) => (callback)(...$$args))
                        // Note: No third argument for $inspect().with
                        // The callback must be wrapped in parens so arrow functions are valid call targets
                        result = format!(
                            "{}$.inspect(() => [{}], (...$$args) => ({})(...$$args)){}",
                            &result[..pos],
                            args_content,
                            callback,
                            rest
                        );
                    }
                } else {
                    // Simple $inspect(...) pattern
                    // Build: $.inspect(() => [args], (...$$args) => console.log(...$$args), true)
                    result = format!(
                        "{}$.inspect(() => [{}], (...$$args) => console.log(...$$args), true){}",
                        &result[..pos],
                        args_content,
                        &result[inspect_start + content_end + 1..]
                    );
                }
            }
        } else {
            // In non-dev mode, remove the entire $inspect(...) call
            // Find matching closing paren
            let inspect_start = pos + 9; // after "$inspect("
            if let Some(content_end) = find_matching_paren(&result[inspect_start..]) {
                // Check for .with() chaining
                let after_inspect = &result[inspect_start + content_end + 1..];
                let total_end = if after_inspect.trim_start().starts_with(".with(") {
                    let with_start_offset =
                        memmem::find(after_inspect.as_bytes(), b".with(").unwrap();
                    let with_content_start =
                        inspect_start + content_end + 1 + with_start_offset + 6;
                    if let Some(with_end) = find_matching_paren(&result[with_content_start..]) {
                        with_content_start + with_end + 1 - pos
                    } else {
                        inspect_start + content_end + 1 - pos
                    }
                } else {
                    inspect_start + content_end + 1 - pos
                };

                // Check if the $inspect call is a statement on its own
                let before = result[..pos].trim();
                let after = result[pos + total_end..].trim();

                // If the line is just the $inspect call, output:
                // - In async mode: a `/* $$async_hole:... */` marker that the async
                //   body transform uses for position tracking
                // - Otherwise: `;;` (two empty statements) matching the official compiler
                if before.is_empty() && (after.is_empty() || after == ";") {
                    let args = &result[inspect_start..inspect_start + content_end];
                    // Use $$INSPECT_EMPTY$$ marker that survives wrap_state_vars_in_expr
                    // and later transforms, then gets converted to ;; before OXC processing
                    return format!("/* $$async_hole:{} */", args);
                } else {
                    // Remove just the $inspect(...) part but keep other code on the line
                    result = format!("{}{}", &result[..pos], &result[pos + total_end..]);
                }
            }
        }
    }

    // Transform $props() destructuring to $.prop() calls (only for source props)
    if memmem::find(result.as_bytes(), b"$props()").is_some()
        && let Some(transformed) = transform_props_destructuring(
            &result,
            prop_source_vars,
            exported_names,
            analysis,
            read_only_props,
            dev,
        )
    {
        return transformed;
    }

    // In dev mode, transform === to $.strict_equals() and !== to !$.strict_equals()
    // This is the BinaryExpression visitor from the official Svelte compiler
    if dev {
        result = transform_strict_equals(&result);
    }

    // In dev mode, wrap $.state() and $.derived() declarations with $.tag() for debugging
    // This allows $inspect.trace() to show variable names in the output.
    // Pattern: `let name = $.state(...)` -> `let name = $.tag($.state(...), 'name')`
    // Also handles $.derived(), $.state($.proxy(...))
    if dev {
        result = wrap_state_derived_with_tag(&result);
    }

    result
}

/// Wrap `$.state(...)`, `$.derived(...)`, and `$.proxy(...)` declarations with `$.tag()`/`$.tag_proxy()` in dev mode.
/// This tags signals with their variable names for better debugging with `$inspect.trace()`.
///
/// Transforms:
/// - `let name = $.state(...)` -> `let name = $.tag($.state(...), 'name')`
/// - `let name = $.derived(...)` -> `let name = $.tag($.derived(...), 'name')`
/// - `let name = $.state($.proxy(...))` -> `let name = $.tag($.state($.proxy(...)), 'name')`
/// - `let name = $.proxy(...)` -> `let name = $.tag_proxy($.proxy(...), 'name')`
pub(super) fn wrap_state_derived_with_tag(input: &str) -> String {
    let mut result = input.to_string();

    // Patterns to check and their prefix lengths
    // (pattern, prefix_len, tag_fn)
    let patterns: &[(&str, usize, &str)] = &[
        ("$.state(", 8, "$.tag"),
        ("$.derived(", 10, "$.tag"),
        ("$.proxy(", 8, "$.tag_proxy"),
    ];

    // Process each declaration keyword
    for keyword in &["let ", "const ", "var "] {
        let mut search_from = 0;
        loop {
            let rest = &result[search_from..];
            let Some(kw_pos) = rest.find(keyword) else {
                break;
            };
            let abs_kw_pos = search_from + kw_pos;
            let after_kw = &result[abs_kw_pos + keyword.len()..];

            // Extract variable name (simple identifier before `=`)
            let var_name: String = after_kw
                .chars()
                .take_while(|c| c.is_alphanumeric() || *c == '_' || *c == '$')
                .collect();

            if var_name.is_empty() {
                search_from = abs_kw_pos + keyword.len();
                continue;
            }

            // Find ` = ` after variable name
            let after_name = &after_kw[var_name.len()..];
            let trimmed = after_name.trim_start();
            if !trimmed.starts_with('=') {
                search_from = abs_kw_pos + keyword.len();
                continue;
            }
            let eq_offset = after_name.len() - trimmed.len();
            let rhs_start_in_result = abs_kw_pos + keyword.len() + var_name.len() + eq_offset + 1;
            let rhs = result[rhs_start_in_result..].trim_start();
            let rhs_trim_offset = result[rhs_start_in_result..].len() - rhs.len();
            let rhs_abs_start = rhs_start_in_result + rhs_trim_offset;

            // Check which pattern matches
            let mut matched = false;
            for &(pattern, prefix_len, tag_fn) in patterns {
                if !rhs.starts_with(pattern) {
                    continue;
                }

                // Skip $.proxy if it's already inside $.state (e.g., $.state($.proxy(...)))
                // Those are handled by the $.state match
                if pattern == "$.proxy(" {
                    // Check if this $.proxy is already tagged (inside $.tag or $.tag_proxy)
                    let before = &result[..rhs_abs_start];
                    if before.ends_with("$.tag(") || before.ends_with("$.tag_proxy(") {
                        break;
                    }
                }

                let inner_start = rhs_abs_start + prefix_len;
                if let Some(close_paren) = find_matching_paren(&result[inner_start..]) {
                    let call_end = inner_start + close_paren + 1;
                    let call_expr = &result[rhs_abs_start..call_end];

                    let tagged = format!("{}({}, '{}')", tag_fn, call_expr, var_name);
                    result = format!(
                        "{}{}{}",
                        &result[..rhs_abs_start],
                        tagged,
                        &result[call_end..]
                    );
                    search_from = rhs_abs_start + tagged.len();
                    matched = true;
                }
                break;
            }

            if !matched {
                search_from = abs_kw_pos + keyword.len();
            }
        }
    }

    // Handle any remaining `name = $.state(...)` patterns that weren't caught by
    // the let/const/var scan. This catches comma-separated declarators like:
    //   `let tmp = setup(), num = $.state($.proxy(tmp.num))`
    // where `num` wasn't processed because it doesn't have its own let/const/var keyword.
    for &(pattern, prefix_len, tag_fn) in patterns {
        let mut search_from = 0;
        loop {
            let rest = &result[search_from..];
            let Some(pat_pos) = rest.find(pattern) else {
                break;
            };
            let abs_pat_pos = search_from + pat_pos;

            // Already tagged?
            let before = &result[..abs_pat_pos];
            if before.ends_with("$.tag(") || before.ends_with("$.tag_proxy(") {
                search_from = abs_pat_pos + pattern.len();
                continue;
            }

            // Look backwards: expect `name = ` before the pattern
            let before_trimmed = before.trim_end();
            if !before_trimmed.ends_with('=') {
                search_from = abs_pat_pos + pattern.len();
                continue;
            }
            let before_eq = before_trimmed[..before_trimmed.len() - 1].trim_end();

            // Extract the variable name going backwards
            let name_end = before_eq.len();
            let name_start = before_eq
                .rfind(|c: char| !c.is_alphanumeric() && c != '_' && c != '$')
                .map(|p| p + 1)
                .unwrap_or(0);
            let var_name = &before_eq[name_start..name_end];

            if var_name.is_empty() {
                search_from = abs_pat_pos + pattern.len();
                continue;
            }

            // Skip `this.field` and `this.#field` patterns - handled by dedicated section below
            let before_name_trimmed = before_eq[..name_start].trim_end();
            if before_name_trimmed.ends_with("this.") || before_name_trimmed.ends_with("this.#") {
                search_from = abs_pat_pos + pattern.len();
                continue;
            }

            // Skip `#field` patterns (class field declarations) - handled by dedicated section below
            if var_name.starts_with('#') {
                search_from = abs_pat_pos + pattern.len();
                continue;
            }

            // Also skip if the character before the extracted name is `#` (e.g., `#count = $.state()`)
            // In that case, rfind stops at `#` so var_name is just `count`, but it's actually a private field
            if name_start > 0 && before_eq.as_bytes().get(name_start - 1) == Some(&b'#') {
                search_from = abs_pat_pos + pattern.len();
                continue;
            }

            let inner_start = abs_pat_pos + prefix_len;
            if let Some(close_paren) = find_matching_paren(&result[inner_start..]) {
                let call_end = inner_start + close_paren + 1;
                let call_expr = result[abs_pat_pos..call_end].to_string();
                let tagged = format!("{}({}, '{}')", tag_fn, call_expr, var_name);
                result = format!(
                    "{}{}{}",
                    &result[..abs_pat_pos],
                    tagged,
                    &result[call_end..]
                );
                search_from = abs_pat_pos + tagged.len();
            } else {
                search_from = abs_pat_pos + pattern.len();
            }
        }
    }

    // Handle class field declarations: `#field = $.state(...)` (not `this.#field`)
    // Transform to `#field = $.tag($.state(...), 'ClassName.#field')` or similar
    {
        let mut search_from = 0;
        loop {
            let rest = &result[search_from..];
            // Look for `#identifier` that's NOT preceded by `this.`
            let Some(hash_pos) = rest.find('#') else {
                break;
            };
            let abs_hash_pos = search_from + hash_pos;

            // Check it's not preceded by `this.`
            let before = &result[..abs_hash_pos];
            if before.trim_end().ends_with("this.") || before.ends_with("$.") {
                search_from = abs_hash_pos + 1;
                continue;
            }

            // Extract field name after #
            let after_hash = &result[abs_hash_pos + 1..];
            let field_name: String = after_hash
                .chars()
                .take_while(|c| c.is_alphanumeric() || *c == '_' || *c == '$')
                .collect();

            if field_name.is_empty() {
                search_from = abs_hash_pos + 1;
                continue;
            }

            // Find ` = ` after field name
            let after_name = &after_hash[field_name.len()..];
            let trimmed = after_name.trim_start();
            if !trimmed.starts_with('=') || trimmed.starts_with("==") {
                search_from = abs_hash_pos + 1 + field_name.len();
                continue;
            }
            let eq_offset = after_name.len() - trimmed.len();
            let rhs_start = abs_hash_pos + 1 + field_name.len() + eq_offset + 1;
            let rhs = result[rhs_start..].trim_start();
            let rhs_trim_offset = result[rhs_start..].len() - rhs.len();
            let rhs_abs_start = rhs_start + rhs_trim_offset;

            let mut matched = false;
            for &(pattern, prefix_len, tag_fn) in patterns {
                if !rhs.starts_with(pattern) {
                    continue;
                }

                // Already tagged?
                let before_rhs = &result[..rhs_abs_start];
                if before_rhs.ends_with("$.tag(") || before_rhs.ends_with("$.tag_proxy(") {
                    break;
                }

                let inner_start = rhs_abs_start + prefix_len;
                if let Some(close_paren) = find_matching_paren(&result[inner_start..]) {
                    let call_end = inner_start + close_paren + 1;
                    let call_expr = &result[rhs_abs_start..call_end];

                    // Extract class name from context
                    let before_text = &result[..abs_hash_pos];
                    let class_name = extract_enclosing_class_name(before_text).unwrap_or("Unknown");

                    // Determine if this was originally a private field or a public field
                    // that was converted to private by the compiler.
                    // For compiler-converted public fields: a public field `fieldname = $state()`
                    // gets converted to `#fieldname = $.state()` with getter/setter pair.
                    // For originally private fields: `#fieldname = $state()` stays as
                    // `#fieldname = $.state()` WITHOUT compiler-generated getter/setter.
                    //
                    // We distinguish by checking if the class has a PUBLIC field with the
                    // same name that was converted. A getter pattern like `get fieldname()`
                    // with `$.get(this.#fieldname)` exists for BOTH cases (user-written
                    // or compiler-generated), so we need another approach:
                    // Check if the class body contains a SETTER `set fieldname(value)` with
                    // `$.set(this.#fieldname, ...)` - this is only generated for converted public fields.
                    let setter_sig = format!("set {}(", field_name);
                    let setter_body = format!("$.set(this.#{})", field_name);
                    // Also check for a simpler setter pattern
                    let setter_body2 = format!("$.set(this.#{},", field_name);
                    let was_originally_public = result.contains(&setter_sig)
                        && (result.contains(&setter_body) || result.contains(&setter_body2));
                    let label = if was_originally_public {
                        format!("{}.{}", class_name, field_name)
                    } else {
                        format!("{}.#{}", class_name, field_name)
                    };
                    let tagged = format!("{}({}, '{}')", tag_fn, call_expr, label);
                    result = format!(
                        "{}{}{}",
                        &result[..rhs_abs_start],
                        tagged,
                        &result[call_end..]
                    );
                    search_from = rhs_abs_start + tagged.len();
                    matched = true;
                }
                break;
            }

            if !matched {
                search_from = abs_hash_pos + 1 + field_name.len();
            }
        }
    }

    // Also handle `this.#field = $.state(...)` or `this.field = $.state(...)` in class constructors
    // Transform to `this.#field = $.tag($.state(...), 'ClassName.#field')` or similar
    {
        let mut search_from = 0;
        loop {
            let rest = &result[search_from..];
            let Some(this_pos) = memmem::find(rest.as_bytes(), b"this.") else {
                break;
            };
            let abs_this_pos = search_from + this_pos;
            let after_this = &result[abs_this_pos + 5..]; // after "this."

            // Extract field name (possibly starting with #)
            let field_name: String = after_this
                .chars()
                .take_while(|c| c.is_alphanumeric() || *c == '_' || *c == '$' || *c == '#')
                .collect();

            if field_name.is_empty() {
                search_from = abs_this_pos + 5;
                continue;
            }

            // Find ` = ` after field name
            let after_name = &after_this[field_name.len()..];
            let trimmed = after_name.trim_start();
            if !trimmed.starts_with('=') || trimmed.starts_with("==") {
                search_from = abs_this_pos + 5;
                continue;
            }
            let eq_offset = after_name.len() - trimmed.len();
            let rhs_start = abs_this_pos + 5 + field_name.len() + eq_offset + 1;
            let rhs = result[rhs_start..].trim_start();
            let rhs_trim_offset = result[rhs_start..].len() - rhs.len();
            let rhs_abs_start = rhs_start + rhs_trim_offset;

            // Check if the RHS is $.state( or $.derived( (already transformed from class field)
            let mut matched = false;
            for &(pattern, prefix_len, tag_fn) in patterns {
                if !rhs.starts_with(pattern) {
                    continue;
                }

                // Already tagged?
                let before = &result[..rhs_abs_start];
                if before.ends_with("$.tag(") || before.ends_with("$.tag_proxy(") {
                    break;
                }

                let inner_start = rhs_abs_start + prefix_len;
                if let Some(close_paren) = find_matching_paren(&result[inner_start..]) {
                    let call_end = inner_start + close_paren + 1;
                    let call_expr = &result[rhs_abs_start..call_end];

                    // Extract class name from context (look for `class NAME {` before this position)
                    let before_text = &result[..abs_this_pos];
                    let class_name = extract_enclosing_class_name(before_text).unwrap_or("Unknown");

                    // Build tag label: ClassName.#field or ClassName.field
                    // If the field starts with # but has a compiler-generated getter, it was
                    // originally a public field converted to private by the compiler.
                    let label = if let Some(base_name) = field_name.strip_prefix('#') {
                        let compiler_getter_pattern = format!(
                            "get {}() {{ return $.get(this.{}); }}",
                            base_name, field_name
                        );
                        let was_originally_public = result.contains(&compiler_getter_pattern);
                        if was_originally_public {
                            format!("{}.{}", class_name, base_name)
                        } else {
                            format!("{}.{}", class_name, field_name)
                        }
                    } else {
                        format!("{}.{}", class_name, field_name)
                    };
                    let tagged = format!("{}({}, '{}')", tag_fn, call_expr, label);
                    result = format!(
                        "{}{}{}",
                        &result[..rhs_abs_start],
                        tagged,
                        &result[call_end..]
                    );
                    search_from = rhs_abs_start + tagged.len();
                    matched = true;
                }
                break;
            }

            if !matched {
                search_from = abs_this_pos + 5;
            }
        }
    }

    result
}

/// Extract the enclosing class name from the text before a given position.
/// Looks for `class NAME` pattern.
pub(super) fn extract_enclosing_class_name(before: &str) -> Option<&str> {
    // Find the last `class ` before the position
    let class_pos = memmem::rfind(before.as_bytes(), b"class ")?;
    let after_class = &before[class_pos + 6..];
    // Extract the class name
    let name_end = after_class.find(|c: char| !c.is_alphanumeric() && c != '_' && c != '$')?;
    if name_end == 0 {
        return None;
    }
    Some(&after_class[..name_end])
}

/// Transform `===` to `$.strict_equals()` and `!==` to `!$.strict_equals()` in dev mode.
/// Only transforms outside of string literals and template literals.
///
/// Note: `==` and `!=` are handled by the AST-based expression converter, not here,
/// because text-based operand extraction cannot reliably handle operator precedence
/// for loose equality (e.g., `++i % 2 == 0` would incorrectly extract `2` as left operand).
///
/// Transforms:
/// - `a === b` -> `$.strict_equals(a, b)`
/// - `a !== b` -> `!$.strict_equals(a, b)`
#[allow(dead_code)]
pub(super) fn transform_strict_equals(input: &str) -> String {
    // Quick check: if no === or !== present, return as-is
    if memmem::find(input.as_bytes(), b"===").is_none()
        && memmem::find(input.as_bytes(), b"!==").is_none()
    {
        return input.to_string();
    }

    transform_equality_operators(input, true)
}

/// Transform a specific set of equality operators.
/// If `strict` is true, transforms === and !==.
/// If `strict` is false, transforms == and != (only standalone, not part of ===).
#[allow(dead_code)]
pub(super) fn transform_equality_operators(input: &str, strict: bool) -> String {
    let op_eq = if strict { "===" } else { "==" };
    let op_neq = if strict { "!==" } else { "!=" };
    let fn_name = if strict { "strict_equals" } else { "equals" };

    if !input.contains(op_eq) && !input.contains(op_neq) {
        return input.to_string();
    }

    let mut result = input.to_string();
    let mut search_from = 0;
    let op_len = op_eq.len();

    loop {
        let rest = &result[search_from..];

        // Find the next equality or inequality operator
        let eq_pos = rest.find(op_eq);
        let neq_pos = rest.find(op_neq);

        let (abs_pos, is_neq) = match (eq_pos, neq_pos) {
            (Some(e), Some(n)) => {
                if n < e {
                    (search_from + n, true)
                } else {
                    (search_from + e, false)
                }
            }
            (Some(e), None) => (search_from + e, false),
            (None, Some(n)) => (search_from + n, true),
            (None, None) => break,
        };

        // For loose operators (== / !=), skip if this is actually === or !==
        if !strict {
            let after_pos = abs_pos + op_len;
            if after_pos < result.len() && result.as_bytes()[after_pos] == b'=' {
                search_from = abs_pos + op_len;
                continue;
            }
            // Also skip != if it's part of !==
            if is_neq {
                let after_pos = abs_pos + op_len;
                if after_pos < result.len() && result.as_bytes()[after_pos] == b'=' {
                    search_from = abs_pos + op_len;
                    continue;
                }
            }
        }

        // Skip if inside a string literal or comment (rough heuristic)
        let before = &result[..abs_pos];
        let single_quotes = before.matches('\'').count();
        let double_quotes = before.matches('"').count();
        let backtick_quotes = before.matches('`').count();
        if !single_quotes.is_multiple_of(2)
            || !double_quotes.is_multiple_of(2)
            || !backtick_quotes.is_multiple_of(2)
        {
            search_from = abs_pos + op_len;
            continue;
        }

        // Extract left operand: scan backwards from the operator
        let left_end = abs_pos;
        let left_str = result[..left_end].trim_end();
        let (left_expr, left_start) = extract_operand_backward(left_str);

        // Extract right operand: scan forward from after the operator
        let right_start_raw = abs_pos + op_len;
        let right_str = result[right_start_raw..].trim_start();
        let right_offset = result[right_start_raw..].len() - right_str.len();
        let right_abs_start = right_start_raw + right_offset;
        let (right_expr, right_len) = extract_operand_forward(right_str);

        if left_expr.is_empty() || right_expr.is_empty() {
            search_from = abs_pos + op_len;
            continue;
        }

        let right_abs_end = right_abs_start + right_len;

        // Build replacement
        let replacement = if is_neq {
            format!("!$.{}({}, {})", fn_name, left_expr, right_expr)
        } else {
            format!("$.{}({}, {})", fn_name, left_expr, right_expr)
        };

        result = format!(
            "{}{}{}",
            &result[..left_start],
            replacement,
            &result[right_abs_end..]
        );
        search_from = left_start + replacement.len();
    }

    result
}

/// Extract an operand expression scanning backward from the end of a string.
/// Returns (expression, start_position_in_original).
#[allow(dead_code)]
pub(super) fn extract_operand_backward(s: &str) -> (String, usize) {
    let trimmed = s.trim_end();
    if trimmed.is_empty() {
        return (String::new(), 0);
    }

    let last_char = trimmed.chars().last().unwrap();

    // Handle parenthesized expressions: scan backward to find matching open paren
    if last_char == ')' {
        let mut depth = 0;
        let mut start = trimmed.len();
        for (i, c) in trimmed.char_indices().rev() {
            match c {
                ')' => depth += 1,
                '(' => {
                    depth -= 1;
                    if depth == 0 {
                        start = i;
                        break;
                    }
                }
                _ => {}
            }
        }
        // Include function name/method call before the paren
        // Include `?` to handle optional chaining (`?.`)
        let before_paren = &trimmed[..start];
        let func_start = before_paren
            .rfind(|c: char| {
                !c.is_alphanumeric() && c != '_' && c != '$' && c != '.' && c != '#' && c != '?'
            })
            .map(|p| p + 1)
            .unwrap_or(0);
        let expr = trimmed[func_start..].to_string();
        // Find where this starts in the original (untrimmed) string
        let original_start = s.len() - trimmed.len() + func_start;
        return (expr, original_start);
    }

    // Handle string/number/boolean literals and identifiers
    // Find the start of the identifier/literal
    // Include `?` to handle optional chaining (`?.`)
    let expr_start = trimmed
        .rfind(|c: char| {
            !c.is_alphanumeric() && c != '_' && c != '$' && c != '.' && c != '#' && c != '?'
        })
        .map(|p| p + 1)
        .unwrap_or(0);

    let expr = trimmed[expr_start..].to_string();
    let original_start = s.len() - trimmed.len() + expr_start;
    (expr, original_start)
}

/// Extract an operand expression scanning forward from the beginning of a string.
/// Returns (expression, length_consumed_from_input).
#[allow(dead_code)]
pub(super) fn extract_operand_forward(s: &str) -> (String, usize) {
    if s.is_empty() {
        return (String::new(), 0);
    }

    let first_char = s.chars().next().unwrap();

    // Handle parenthesized expressions
    if first_char == '(' {
        let mut depth = 0;
        let mut end = 0;
        for (i, c) in s.char_indices() {
            match c {
                '(' => depth += 1,
                ')' => {
                    depth -= 1;
                    if depth == 0 {
                        end = i + 1;
                        break;
                    }
                }
                _ => {}
            }
        }
        return (s[..end].to_string(), end);
    }

    // Handle negation/not: !expr
    if first_char == '!' {
        let inner = &s[1..].trim_start();
        let offset = s.len() - 1 - inner.len() + 1;
        let (inner_expr, inner_len) = extract_operand_forward(inner);
        let total_len = offset + inner_len;
        return (format!("!{}", inner_expr), total_len);
    }

    // Handle string literals
    if (first_char == '\'' || first_char == '"')
        && let Some(end) = s[1..].find(first_char)
    {
        let total = end + 2;
        return (s[..total].to_string(), total);
    }

    // Handle template literals
    if first_char == '`' {
        // Find matching backtick (simplified - doesn't handle nested ${})
        if let Some(end) = s[1..].find('`') {
            let total = end + 2;
            return (s[..total].to_string(), total);
        }
    }

    // Identifier, number, or member expression (foo.bar, foo?.bar)
    let mut end = 0;
    let mut chars = s.char_indices().peekable();
    while let Some(&(i, c)) = chars.peek() {
        if c.is_alphanumeric() || c == '_' || c == '$' || c == '.' || c == '#' {
            end = i + c.len_utf8();
            chars.next();
        } else if c == '?' {
            // Optional chaining ?.
            chars.next();
            if let Some(&(_, '.')) = chars.peek() {
                end = i + 2;
                chars.next();
            } else {
                break;
            }
        } else if c == '(' {
            // Function call - include parenthesized argument
            let mut depth = 0;
            for (j, c2) in s[i..].char_indices() {
                match c2 {
                    '(' => depth += 1,
                    ')' => {
                        depth -= 1;
                        if depth == 0 {
                            end = i + j + 1;
                            break;
                        }
                    }
                    _ => {}
                }
            }
            break;
        } else if c == '[' {
            // Array access
            let mut depth = 0;
            for (j, c2) in s[i..].char_indices() {
                match c2 {
                    '[' => depth += 1,
                    ']' => {
                        depth -= 1;
                        if depth == 0 {
                            end = i + j + 1;
                            break;
                        }
                    }
                    _ => {}
                }
            }
            // After bracket, check for further chaining
            let remaining = &s[end..];
            if remaining.starts_with('.') || remaining.starts_with("?.") {
                continue;
            }
            break;
        } else {
            break;
        }
    }

    (s[..end].to_string(), end)
}

/// Apply $effect-related rune transforms to a string.
/// This is used to ensure that early returns from `transform_client_runes_with_skip_and_state`
/// still get $effect transforms applied.
pub(super) fn apply_effect_rune_transforms(result: String) -> String {
    // Single-pass scan for all $effect patterns.
    // This replaces 5 separate contains()+replace() calls (10 scans) with one pass.
    // Patterns are checked longest-first to avoid partial matches:
    //   $effect.pending() -> $.eager($.pending)
    //   $effect.tracking() -> $.effect_tracking()
    //   $effect.root( -> $.effect_root(
    //   $effect.pre( -> $.user_pre_effect(
    //   $effect( -> $.user_effect(
    replace_effect_patterns(&result)
}

/// Single-pass replacement of all $effect rune patterns in a string.
/// Scans the string once looking for '$effect' and then determines which
/// specific pattern matched, building the output in one allocation.
fn replace_effect_patterns(input: &str) -> String {
    let bytes = input.as_bytes();
    let len = bytes.len();
    // Quick check: if no '$' present, return early
    if memchr::memchr(b'$', bytes).is_none() {
        return input.to_string();
    }
    // Quick check: if "$effect" doesn't appear, return early
    if memmem::find(input.as_bytes(), b"$effect").is_none() {
        return input.to_string();
    }

    let mut out = String::with_capacity(input.len() + 32);
    let mut last_copied = 0; // byte index of start of not-yet-copied region

    let mut i = 0;
    while i < len {
        if bytes[i] == b'$' && i + 7 <= len && &bytes[i..i + 7] == b"$effect" {
            let after = i + 7;
            if after < len && bytes[after] == b'.' {
                // $effect.XXX patterns
                if input[after..].starts_with(".pending()") {
                    out.push_str(&input[last_copied..i]);
                    out.push_str("$.eager($.pending)");
                    i = after + 10; // skip ".pending()"
                    last_copied = i;
                    continue;
                } else if input[after..].starts_with(".tracking()") {
                    out.push_str(&input[last_copied..i]);
                    out.push_str("$.effect_tracking()");
                    i = after + 11; // skip ".tracking()"
                    last_copied = i;
                    continue;
                } else if input[after..].starts_with(".root(") {
                    out.push_str(&input[last_copied..i]);
                    out.push_str("$.effect_root(");
                    i = after + 6; // skip ".root("
                    last_copied = i;
                    continue;
                } else if input[after..].starts_with(".pre(") {
                    out.push_str(&input[last_copied..i]);
                    out.push_str("$.user_pre_effect(");
                    i = after + 5; // skip ".pre("
                    last_copied = i;
                    continue;
                }
            } else if after < len && bytes[after] == b'(' {
                // $effect( -> $.user_effect(
                out.push_str(&input[last_copied..i]);
                out.push_str("$.user_effect(");
                i = after + 1; // skip "("
                last_copied = i;
                continue;
            }
        }
        i += 1;
    }

    // If no replacements were made, return original
    if last_copied == 0 {
        return input.to_string();
    }
    // Append remaining tail
    out.push_str(&input[last_copied..]);
    out
}

/// Transform `export let x = value` to `let x = $.prop($$props, 'x', 12, value)`.
/// Transform `$derived()` with destructuring patterns.
pub(super) fn transform_derived_destructuring(
    line: &str,
    state_vars: &[String],
    non_reactive_vars: &[String],
    proxy_vars: &[String],
) -> Option<String> {
    let trimmed = line.trim();
    let decl_keyword = if trimmed.starts_with("let ") {
        "let"
    } else if trimmed.starts_with("const ") {
        "const"
    } else if trimmed.starts_with("var ") {
        "var"
    } else {
        return None;
    };
    let derived_pos = memmem::find(trimmed.as_bytes(), b"$derived(")?;
    let pattern_start = decl_keyword.len() + 1;
    let eq_pos = trimmed[..derived_pos].rfind('=')?;
    let pattern = trimmed[pattern_start..eq_pos].trim();
    let source_start = derived_pos + 9;
    let source_end = find_matching_paren(&trimmed[source_start..])?;
    let source = trimmed[source_start..source_start + source_end].trim();
    let source_is_identifier = source
        .chars()
        .all(|c| c.is_alphanumeric() || c == '_' || c == '$');
    let mut declarations = Vec::new();
    let mut array_counter = 0;
    let wrapped_source = wrap_state_vars_in_expr(source, state_vars, non_reactive_vars, proxy_vars);
    let contains_await = contains_direct_await_in_expression(source);
    // Only allocate a unique $$d name if we actually need a temp (i.e., source is not a plain identifier)
    let d_name = if source_is_identifier {
        String::new()
    } else {
        DERIVED_TMP_COUNTER.with(|c| {
            let n = c.get();
            c.set(n + 1);
            if n == 0 {
                "$$d".to_string()
            } else {
                format!("$$d_{}", n)
            }
        })
    };
    let base_expr = if source_is_identifier {
        wrapped_source.clone()
    } else if contains_await {
        // Async derived destructuring: use $.async_derived()
        // Apply $.save() wrapping for non-final await expressions
        let saved_content = wrap_await_with_save_in_async_derived(wrapped_source.trim());
        let inner_expr = strip_top_level_await_from_expr(&saved_content);
        let inner_has_nested_await = contains_direct_await_in_expression(&inner_expr);

        if inner_has_nested_await {
            let is_object = saved_content.trim().starts_with('{');
            if is_object {
                declarations.push(format!(
                    "{} = await $.async_derived(async () => ({}))",
                    d_name, saved_content
                ));
            } else {
                declarations.push(format!(
                    "{} = await $.async_derived(async () => {})",
                    d_name, saved_content
                ));
            }
        } else {
            let inner_trimmed = inner_expr.trim();
            let inner_is_object = inner_trimmed.starts_with('{');
            if inner_is_object {
                declarations.push(format!(
                    "{} = await $.async_derived(() => ({}))",
                    d_name, inner_expr
                ));
            } else {
                let thunk_arg = unthunk_string(&inner_expr);
                declarations.push(format!("{} = await $.async_derived({})", d_name, thunk_arg));
            }
        }
        format!("$.get({})", d_name)
    } else {
        // When the source is an object literal (starts with {), we must wrap it in
        // parentheses to avoid the arrow function body being parsed as a block:
        // () => ({a, b}) instead of () => {a, b}
        if wrapped_source.trim_start().starts_with('{') {
            declarations.push(format!(
                "{} = $.derived(() => ({}))",
                d_name, wrapped_source
            ));
        } else {
            // Apply unthunk optimization: $.derived(() => name()) -> $.derived(name)
            let derived_arg = unthunk_string(&wrapped_source);
            declarations.push(format!("{} = $.derived({})", d_name, derived_arg));
        }
        format!("$.get({})", d_name)
    };
    process_derived_destructuring_pattern(
        pattern,
        &base_expr,
        &mut declarations,
        &mut array_counter,
    )?;
    if declarations.is_empty() {
        return None;
    }
    Some(format!("{} {};", decl_keyword, declarations.join(",\n\t")))
}

/// Transform `$derived.by()` with destructuring patterns.
///
/// Unlike `$derived(identifier)` which can skip the temp variable,
/// `$derived.by()` always creates a `$$d` temp variable because the
/// callback is already provided and needs to be called through `$.derived()`.
///
/// Transforms:
///   `let { a, b } = $derived.by(fn)` -> `let $$d = $.derived(fn), a = $.derived(() => $.get($$d).a), b = $.derived(() => $.get($$d).b)`
pub(super) fn transform_derived_by_destructuring(
    line: &str,
    state_vars: &[String],
    non_reactive_vars: &[String],
    proxy_vars: &[String],
) -> Option<String> {
    let trimmed = line.trim();
    let decl_keyword = if trimmed.starts_with("let ") {
        "let"
    } else if trimmed.starts_with("const ") {
        "const"
    } else if trimmed.starts_with("var ") {
        "var"
    } else {
        return None;
    };
    let derived_pos = memmem::find(trimmed.as_bytes(), b"$derived.by(")?;
    let pattern_start = decl_keyword.len() + 1;
    let eq_pos = trimmed[..derived_pos].rfind('=')?;
    let pattern = trimmed[pattern_start..eq_pos].trim();
    let source_start = derived_pos + 12; // after "$derived.by("
    let source_end = find_matching_paren(&trimmed[source_start..])?;
    let source = trimmed[source_start..source_start + source_end].trim();
    let mut declarations = Vec::new();
    let mut array_counter = 0;
    let wrapped_source = wrap_state_vars_in_expr(source, state_vars, non_reactive_vars, proxy_vars);
    // $derived.by() always creates a $$d temp - the callback is passed directly to $.derived()
    let d_name = DERIVED_TMP_COUNTER.with(|c| {
        let n = c.get();
        c.set(n + 1);
        if n == 0 {
            "$$d".to_string()
        } else {
            format!("$$d_{}", n)
        }
    });
    declarations.push(format!("{} = $.derived({})", d_name, wrapped_source));
    let base_expr = format!("$.get({})", d_name);
    process_derived_destructuring_pattern(
        pattern,
        &base_expr,
        &mut declarations,
        &mut array_counter,
    )?;
    if declarations.is_empty() {
        return None;
    }
    Some(format!("{} {};", decl_keyword, declarations.join(",\n\t")))
}

/// Transform `$state()` or `$state.raw()` with destructuring patterns.
///
/// Transforms:
///   `let { a, b } = $state(expr)` -> `let tmp = expr, a = $.state($.proxy(tmp.a)), b = $.state($.proxy(tmp.b))`
///   `let { a, b } = $state.raw(expr)` -> `let tmp = expr, a = $.state(tmp.a), b = $.state(tmp.b)`
///
/// When a variable is not reassigned (in skip_state_vars), the $.state() wrapper is omitted:
///   `let { foo } = $state(data)` -> `let tmp = data, foo = $.proxy(tmp.foo)`
///
/// Corresponds to the official Svelte compiler's VariableDeclaration.js handling of
/// ObjectPattern/ArrayPattern with $state/$state.raw init.
pub(super) fn transform_state_destructuring(
    line: &str,
    is_raw: bool,
    skip_state_vars: &[String],
    state_vars: &[String],
    non_reactive_vars: &[String],
    proxy_vars: &[String],
) -> Option<String> {
    let trimmed = line.trim();

    // Determine declaration keyword
    let decl_keyword = if trimmed.starts_with("let ") {
        "let"
    } else if trimmed.starts_with("const ") {
        "const"
    } else if trimmed.starts_with("var ") {
        "var"
    } else {
        return None;
    };

    // Find the $state( or $state.raw( position
    let rune_str = if is_raw { "$state.raw(" } else { "$state(" };
    let rune_pos = trimmed.find(rune_str)?;
    let rune_len = rune_str.len();

    // Extract the destructuring pattern between the keyword and the = sign
    let eq_pos = trimmed[..rune_pos].rfind('=')?;
    let pattern_start = decl_keyword.len() + 1; // skip "let "/"const "/"var "
    let pattern = trimmed[pattern_start..eq_pos].trim();

    // Must be a destructuring pattern
    if !pattern.starts_with('{') && !pattern.starts_with('[') {
        return None;
    }

    // Extract the source expression inside $state(...) or $state.raw(...)
    let source_start = rune_pos + rune_len;
    let source_end = find_matching_paren(&trimmed[source_start..])?;
    let source = trimmed[source_start..source_start + source_end].trim();

    // Wrap state variables in the source expression with $.get()
    let wrapped_source = wrap_state_vars_in_expr(source, state_vars, non_reactive_vars, proxy_vars);

    // Generate a unique tmp variable name: tmp, tmp_1, tmp_2, ...
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

    // Build declarations
    let mut declarations = Vec::new();

    // First declaration: tmp = <source expression>
    declarations.push(format!("{} = {}", tmp_name, wrapped_source));

    // Process the destructuring pattern
    if pattern.starts_with('{') && pattern.ends_with('}') {
        let inner = &pattern[1..pattern.len() - 1];
        process_state_object_pattern(inner, &tmp_name, is_raw, skip_state_vars, &mut declarations)?;
    } else if pattern.starts_with('[') && pattern.ends_with(']') {
        let inner = &pattern[1..pattern.len() - 1];
        process_state_array_pattern(
            inner,
            &tmp_name,
            is_raw,
            skip_state_vars,
            state_vars,
            non_reactive_vars,
            proxy_vars,
            &mut declarations,
        )?;
    } else {
        return None;
    }

    if declarations.len() <= 1 {
        // Only the tmp declaration, no actual properties
        return None;
    }

    // Check for trailing semicolon
    let trailing = if trimmed.ends_with(';') { "" } else { ";" };

    Some(format!(
        "{} {}{}",
        decl_keyword,
        declarations.join(", "),
        trailing
    ))
}

/// Process object destructuring pattern for $state()/$state.raw().
///
/// For `{ a, b: c, d = defaultVal }`, generates:
///   `a = $.state($.proxy(tmp.a)), c = $.state($.proxy(tmp.b)), d = $.state($.proxy(tmp.d))`
pub(super) fn process_state_object_pattern(
    inner: &str,
    tmp_name: &str,
    is_raw: bool,
    skip_state_vars: &[String],
    declarations: &mut Vec<String>,
) -> Option<()> {
    let properties = split_derived_object_properties(inner);

    for prop in &properties {
        let prop = prop.trim();
        if prop.is_empty() {
            continue;
        }

        if let Some(rest_name) = prop.strip_prefix("...") {
            // Rest element: ...rest
            let rest_name = rest_name.trim();
            // Rest elements get the remaining properties
            // For now, generate a simple spread
            let is_skip = skip_state_vars.contains(&rest_name.to_string());
            let value = if is_raw {
                format!("{}.{}", tmp_name, rest_name)
            } else if is_skip {
                format!("$.proxy({}.{})", tmp_name, rest_name)
            } else {
                format!("$.state($.proxy({}.{}))", tmp_name, rest_name)
            };
            declarations.push(format!("{} = {}", rest_name, value));
            continue;
        }

        if let Some(colon_pos) = find_derived_property_colon(prop) {
            // Renamed property: key: value or key: value = default
            let key = prop[..colon_pos].trim();
            let value_part = prop[colon_pos + 1..].trim();

            // Check for default value: key: varname = defaultVal
            let (var_name, _default_expr) = if let Some(eq_pos) = value_part.find('=') {
                let vn = value_part[..eq_pos].trim();
                let de = value_part[eq_pos + 1..].trim();
                (vn, Some(de))
            } else {
                (value_part, None)
            };

            let is_skip = skip_state_vars.contains(&var_name.to_string());
            let member_access = format!("{}.{}", tmp_name, key);
            let wrapped = wrap_state_value(&member_access, is_raw, is_skip);
            declarations.push(format!("{} = {}", var_name, wrapped));
        } else {
            // Shorthand property: name or name = defaultVal
            let (var_name, _default_expr) = if let Some(eq_pos) = prop.find('=') {
                let vn = prop[..eq_pos].trim();
                let de = prop[eq_pos + 1..].trim();
                (vn, Some(de))
            } else {
                (prop, None)
            };

            let is_skip = skip_state_vars.contains(&var_name.to_string());
            let member_access = format!("{}.{}", tmp_name, var_name);
            let wrapped = wrap_state_value(&member_access, is_raw, is_skip);
            declarations.push(format!("{} = {}", var_name, wrapped));
        }
    }

    Some(())
}

/// Process array destructuring pattern for $state()/$state.raw().
///
/// For `[a, b]`, generates:
///   `$$array = $.derived(() => $.to_array(tmp, 2))`
///   `a = $.state($.proxy($.get($$array)[0]))`
///   `b = $.state($.proxy($.get($$array)[1]))`
#[allow(clippy::too_many_arguments)]
pub(super) fn process_state_array_pattern(
    inner: &str,
    tmp_name: &str,
    is_raw: bool,
    skip_state_vars: &[String],
    state_vars: &[String],
    non_reactive_vars: &[String],
    proxy_vars: &[String],
    declarations: &mut Vec<String>,
) -> Option<()> {
    let elements = split_derived_array_elements(inner);

    // For array destructuring, we need an intermediate $$array derived
    // to handle iterables (like the official compiler's extract_paths does)
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

    // Create the $$array derived declaration
    let to_array_args = if has_rest {
        format!("$.to_array({})", tmp_name)
    } else {
        format!("$.to_array({}, {})", tmp_name, element_count)
    };

    let wrapped_to_array =
        wrap_state_vars_in_expr(&to_array_args, state_vars, non_reactive_vars, proxy_vars);
    declarations.push(format!(
        "{} = $.derived(() => {})",
        array_var, wrapped_to_array
    ));

    for (index, element) in elements.iter().enumerate() {
        let element = element.trim();
        if element.is_empty() {
            continue;
        }

        if let Some(rest_name) = element.strip_prefix("...") {
            let rest_name = rest_name.trim();
            let is_skip = skip_state_vars.contains(&rest_name.to_string());
            let access = format!("$.get({}).slice({})", array_var, index);
            let wrapped = wrap_state_value(&access, is_raw, is_skip);
            declarations.push(format!("{} = {}", rest_name, wrapped));
            continue;
        }

        let is_skip = skip_state_vars.contains(&element.to_string());
        let element_access = format!("$.get({})[{}]", array_var, index);
        let wrapped = wrap_state_value(&element_access, is_raw, is_skip);
        declarations.push(format!("{} = {}", element, wrapped));
    }

    Some(())
}

/// Wrap a member access expression for $state destructuring.
///
/// - `$state` (not raw) + is_state_source (not in skip_state_vars) -> `$.state($.proxy(expr))`
/// - `$state` (not raw) + not is_state_source (in skip_state_vars) -> `$.proxy(expr)`
/// - `$state.raw` + is_state_source -> `$.state(expr)`
/// - `$state.raw` + not is_state_source -> just `expr`
pub(super) fn wrap_state_value(member_access: &str, is_raw: bool, is_skip: bool) -> String {
    if is_raw {
        if is_skip {
            member_access.to_string()
        } else {
            format!("$.state({})", member_access)
        }
    } else if is_skip {
        format!("$.proxy({})", member_access)
    } else {
        format!("$.state($.proxy({}))", member_access)
    }
}

pub(super) fn process_derived_destructuring_pattern(
    pattern: &str,
    base_expr: &str,
    declarations: &mut Vec<String>,
    array_counter: &mut usize,
) -> Option<()> {
    let pattern = pattern.trim();
    if pattern.starts_with('{') && pattern.ends_with('}') {
        let inner = &pattern[1..pattern.len() - 1];
        process_derived_object_pattern(inner, base_expr, declarations, array_counter)
    } else if pattern.starts_with('[') && pattern.ends_with(']') {
        let inner = &pattern[1..pattern.len() - 1];
        process_derived_array_pattern(inner, base_expr, declarations, array_counter)
    } else {
        None
    }
}

pub(super) fn process_derived_object_pattern(
    inner: &str,
    base_expr: &str,
    declarations: &mut Vec<String>,
    array_counter: &mut usize,
) -> Option<()> {
    let properties = split_derived_object_properties(inner);

    // First pass: collect ONLY $$array helper declarations for nested array patterns
    // These must come first because other declarations depend on them
    for prop in &properties {
        let prop = prop.trim();
        if prop.is_empty() || prop.starts_with("...") {
            continue;
        }
        if let Some(colon_pos) = find_derived_property_colon(prop) {
            let key = prop[..colon_pos].trim();
            let value_pattern = prop[colon_pos + 1..].trim();
            let prop_access = format!("{}.{}", base_expr, key);
            if value_pattern.starts_with('[') || value_pattern.starts_with('{') {
                let (nested_pattern, _default_val) = split_nested_pattern_default(value_pattern);
                collect_array_helpers_only(nested_pattern, &prop_access, declarations)?;
            }
        }
    }

    // Collect all non-rest property keys for $.exclude_from_object
    let excluded_keys: Vec<String> = properties
        .iter()
        .filter_map(|prop| {
            let prop = prop.trim();
            if prop.is_empty() || prop.starts_with("...") {
                return None;
            }
            // Extract the key name (before colon if present, otherwise the whole thing)
            let key = if let Some(colon_pos) = find_derived_property_colon(prop) {
                prop[..colon_pos].trim()
            } else {
                // Strip default value: `animated = false` → `animated`
                let key = prop.trim();
                if let Some(eq_pos) = find_default_equals(key) {
                    key[..eq_pos].trim()
                } else {
                    key
                }
            };
            // Handle computed keys and quoted keys
            if key.starts_with('[') {
                None // computed keys can't be excluded statically
            } else {
                Some(format!("\"{}\"", key))
            }
        })
        .collect();

    // Second pass: process all properties in source order
    for prop in &properties {
        let prop = prop.trim();
        if prop.is_empty() {
            continue;
        }
        if let Some(rest_name) = prop.strip_prefix("...") {
            let rest_name = rest_name.trim();
            let keys_str = excluded_keys.join(", ");
            declarations.push(format!(
                "{} = $.derived(() => $.exclude_from_object({}, [{}]))",
                rest_name, base_expr, keys_str
            ));
            continue;
        }
        if let Some(colon_pos) = find_derived_property_colon(prop) {
            let key = prop[..colon_pos].trim();
            let value_pattern = prop[colon_pos + 1..].trim();
            let prop_access = format!("{}.{}", base_expr, key);
            if value_pattern.starts_with('[') || value_pattern.starts_with('{') {
                // Handle nested destructuring patterns, possibly with default values
                // e.g., `measured: { width: w, height: h } = { width: 0, height: 0 }`
                let (nested_pattern, default_val) = split_nested_pattern_default(value_pattern);
                let effective_access = if let Some(dv) = default_val {
                    build_fallback_string(&prop_access, dv)
                } else {
                    prop_access
                };
                // Process nested pattern elements (not the $$array helpers, already added)
                process_nested_pattern_elements(
                    nested_pattern,
                    &effective_access,
                    declarations,
                    array_counter,
                )?;
            } else {
                // Handle renamed properties with default values
                // e.g., `selectable: _selectable = true` → value_pattern="_selectable = true"
                if let Some(eq_pos) = find_default_equals(value_pattern) {
                    let name = value_pattern[..eq_pos].trim();
                    let default_val = value_pattern[eq_pos + 1..].trim();
                    let fallback = build_fallback_string(&prop_access, default_val);
                    declarations.push(format!("{} = $.derived(() => {})", name, fallback));
                } else {
                    declarations.push(format!(
                        "{} = $.derived(() => {})",
                        value_pattern, prop_access
                    ));
                }
            }
        } else {
            // Handle shorthand properties, possibly with default values
            // e.g., `animated = false` → name="animated", default="false"
            if let Some(eq_pos) = find_default_equals(prop) {
                let name = prop[..eq_pos].trim();
                let default_val = prop[eq_pos + 1..].trim();
                let member_access = format!("{}.{}", base_expr, name);
                let fallback = build_fallback_string(&member_access, default_val);
                declarations.push(format!("{} = $.derived(() => {})", name, fallback));
            } else {
                declarations.push(format!(
                    "{} = $.derived(() => {}.{})",
                    prop, base_expr, prop
                ));
            }
        }
    }
    Some(())
}

/// Collect ONLY $$array helper declarations from nested patterns.
/// This is used in the first pass to ensure $$array declarations come before
/// the variable declarations that depend on them.
pub(super) fn collect_array_helpers_only(
    pattern: &str,
    base_expr: &str,
    declarations: &mut Vec<String>,
) -> Option<()> {
    let pattern = pattern.trim();
    if pattern.starts_with('[') && pattern.ends_with(']') {
        let inner = &pattern[1..pattern.len() - 1];
        let elements = split_derived_array_elements(inner);
        let element_count = elements.len();

        // Generate the $$array helper
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

        declarations.push(format!(
            "{} = $.derived(() => $.to_array({}, {}))",
            array_var, base_expr, element_count
        ));

        // Recursively collect array helpers from nested patterns
        for (index, element) in elements.iter().enumerate() {
            let element = element.trim();
            if element.is_empty() || element.starts_with("...") {
                continue;
            }
            let element_access = format!("$.get({})[{}]", array_var, index);
            if element.starts_with('[') || element.starts_with('{') {
                collect_array_helpers_only(element, &element_access, declarations)?;
            }
        }
    } else if pattern.starts_with('{') && pattern.ends_with('}') {
        let inner = &pattern[1..pattern.len() - 1];
        let properties = split_derived_object_properties(inner);

        // Recursively collect array helpers from nested patterns in object properties
        for prop in &properties {
            let prop = prop.trim();
            if prop.is_empty() || prop.starts_with("...") {
                continue;
            }
            if let Some(colon_pos) = find_derived_property_colon(prop) {
                let key = prop[..colon_pos].trim();
                let value_pattern = prop[colon_pos + 1..].trim();
                let prop_access = format!("{}.{}", base_expr, key);
                if value_pattern.starts_with('[') || value_pattern.starts_with('{') {
                    collect_array_helpers_only(value_pattern, &prop_access, declarations)?;
                }
            }
        }
    }
    Some(())
}

/// Process nested pattern elements (variables), assuming $$array helpers are already declared.
/// This handles the actual variable declarations in source order.
pub(super) fn process_nested_pattern_elements(
    pattern: &str,
    base_expr: &str,
    declarations: &mut Vec<String>,
    _array_counter: &mut usize,
) -> Option<()> {
    let pattern = pattern.trim();
    if pattern.starts_with('[') && pattern.ends_with(']') {
        let inner = &pattern[1..pattern.len() - 1];
        let elements = split_derived_array_elements(inner);

        // Get the array variable that was already created by collect_array_helpers_only
        // We need to track which $$array we're using - use a separate counter for lookups
        let array_var = get_current_array_var_for_base(base_expr);

        for (index, element) in elements.iter().enumerate() {
            let element = element.trim();
            if element.is_empty() {
                continue;
            }
            if let Some(rest_name) = element.strip_prefix("...") {
                let rest_name = rest_name.trim();
                declarations.push(format!(
                    "{} = $.derived(() => $.get({}).slice({}))",
                    rest_name, array_var, index
                ));
                continue;
            }
            let element_access = format!("$.get({})[{}]", array_var, index);
            if element.starts_with('[') || element.starts_with('{') {
                process_nested_pattern_elements(
                    element,
                    &element_access,
                    declarations,
                    _array_counter,
                )?;
            } else {
                declarations.push(format!("{} = $.derived(() => {})", element, element_access));
            }
        }
    } else if pattern.starts_with('{') && pattern.ends_with('}') {
        let inner = &pattern[1..pattern.len() - 1];
        let properties = split_derived_object_properties(inner);

        // Collect all non-rest property keys for $.exclude_from_object
        let excluded_keys: Vec<String> = properties
            .iter()
            .filter_map(|prop| {
                let prop = prop.trim();
                if prop.is_empty() || prop.starts_with("...") {
                    return None;
                }
                let key = if let Some(colon_pos) = find_derived_property_colon(prop) {
                    prop[..colon_pos].trim()
                } else {
                    prop.trim()
                };
                if key.starts_with('[') {
                    None
                } else {
                    Some(format!("\"{}\"", key))
                }
            })
            .collect();

        for prop in &properties {
            let prop = prop.trim();
            if prop.is_empty() {
                continue;
            }
            if let Some(rest_name) = prop.strip_prefix("...") {
                let rest_name = rest_name.trim();
                let keys_str = excluded_keys.join(", ");
                declarations.push(format!(
                    "{} = $.derived(() => $.exclude_from_object({}, [{}]))",
                    rest_name, base_expr, keys_str
                ));
                continue;
            }
            if let Some(colon_pos) = find_derived_property_colon(prop) {
                let key = prop[..colon_pos].trim();
                let value_pattern = prop[colon_pos + 1..].trim();
                let prop_access = format!("{}.{}", base_expr, key);
                if value_pattern.starts_with('[') || value_pattern.starts_with('{') {
                    let (nested_pattern, default_val) = split_nested_pattern_default(value_pattern);
                    let effective_access = if let Some(dv) = default_val {
                        build_fallback_string(&prop_access, dv)
                    } else {
                        prop_access
                    };
                    process_nested_pattern_elements(
                        nested_pattern,
                        &effective_access,
                        declarations,
                        _array_counter,
                    )?;
                } else {
                    // Handle default values for renamed properties
                    if let Some(eq_pos) = find_default_equals(value_pattern) {
                        let name = value_pattern[..eq_pos].trim();
                        let default_val = value_pattern[eq_pos + 1..].trim();
                        let fallback = build_fallback_string(&prop_access, default_val);
                        declarations.push(format!("{} = $.derived(() => {})", name, fallback));
                    } else {
                        declarations.push(format!(
                            "{} = $.derived(() => {})",
                            value_pattern, prop_access
                        ));
                    }
                }
            } else {
                declarations.push(format!(
                    "{} = $.derived(() => {}.{})",
                    prop, base_expr, prop
                ));
            }
        }
    }
    Some(())
}

/// Split a nested destructuring pattern from its default value.
///
/// For example: `{ width: measuredWidth, height: measuredHeight } = { width: 0, height: 0 }`
/// Returns: `("{ width: measuredWidth, height: measuredHeight }", Some("{ width: 0, height: 0 }"))`.
///
/// If there's no default value, returns `(pattern, None)`.
pub(super) fn split_nested_pattern_default(pattern: &str) -> (&str, Option<&str>) {
    let pattern = pattern.trim();
    let open = pattern.as_bytes()[0];
    let close = match open {
        b'{' => b'}',
        b'[' => b']',
        _ => return (pattern, None),
    };
    // Find the matching closing delimiter
    let mut depth = 0i32;
    let bytes = pattern.as_bytes();
    for i in 0..bytes.len() {
        match bytes[i] {
            c if c == open => depth += 1,
            c if c == close => {
                depth -= 1;
                if depth == 0 {
                    // Found the matching close
                    let after = pattern[i + 1..].trim();
                    if let Some(rest) = after.strip_prefix('=') {
                        return (&pattern[..=i], Some(rest.trim()));
                    }
                    return (pattern, None);
                }
            }
            _ => {}
        }
    }
    (pattern, None)
}

/// Helper to determine which $$array variable corresponds to a given base expression.
/// This is needed because we pre-generate $$array helpers in the first pass,
/// and need to reference the correct one in the second pass.
pub(super) fn get_current_array_var_for_base(_base_expr: &str) -> String {
    // The $$array variables are generated in order during collect_array_helpers_only.
    // We use the module-level ARRAY_LOOKUP_COUNTER to track which $$array we're on.
    // This counter is reset at the start of each component transformation along with
    // SCRIPT_ARRAY_COUNTER to ensure they stay in sync.
    let counter = ARRAY_LOOKUP_COUNTER.with(|c| {
        let current = c.get();
        c.set(current + 1);
        current
    });

    if counter == 0 {
        "$$array".to_string()
    } else {
        format!("$$array_{}", counter)
    }
}

pub(super) fn process_derived_array_pattern(
    inner: &str,
    base_expr: &str,
    declarations: &mut Vec<String>,
    _array_counter: &mut usize,
) -> Option<()> {
    let elements = split_derived_array_elements(inner);
    let element_count = elements.len();

    // Use the global counter to generate a unique $$array variable name
    // This ensures unique names across multiple $derived destructuring patterns
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

    declarations.push(format!(
        "{} = $.derived(() => $.to_array({}, {}))",
        array_var, base_expr, element_count
    ));
    for (index, element) in elements.iter().enumerate() {
        let element = element.trim();
        if element.is_empty() {
            continue;
        }
        if let Some(rest_name) = element.strip_prefix("...") {
            let rest_name = rest_name.trim();
            declarations.push(format!(
                "{} = $.derived(() => $.get({}).slice({}))",
                rest_name, array_var, index
            ));
            continue;
        }
        let element_access = format!("$.get({})[{}]", array_var, index);
        if element.starts_with('[') || element.starts_with('{') {
            // Pass a dummy counter for nested patterns - the global counter is used instead
            let mut nested_counter = 0;
            process_derived_destructuring_pattern(
                element,
                &element_access,
                declarations,
                &mut nested_counter,
            )?;
        } else {
            declarations.push(format!("{} = $.derived(() => {})", element, element_access));
        }
    }
    Some(())
}

pub(super) fn split_derived_object_properties(inner: &str) -> Vec<String> {
    let mut properties = Vec::new();
    let mut current = String::new();
    let mut depth = 0;
    for c in inner.chars() {
        match c {
            '{' | '[' | '(' => {
                depth += 1;
                current.push(c);
            }
            '}' | ']' | ')' => {
                depth -= 1;
                current.push(c);
            }
            ',' if depth == 0 => {
                if !current.trim().is_empty() {
                    properties.push(current.trim().to_string());
                }
                current = String::new();
            }
            _ => current.push(c),
        }
    }
    if !current.trim().is_empty() {
        properties.push(current.trim().to_string());
    }
    properties
}

pub(super) fn split_derived_array_elements(inner: &str) -> Vec<String> {
    let mut elements = Vec::new();
    let mut current = String::new();
    let mut depth = 0;
    for c in inner.chars() {
        match c {
            '{' | '[' | '(' => {
                depth += 1;
                current.push(c);
            }
            '}' | ']' | ')' => {
                depth -= 1;
                current.push(c);
            }
            ',' if depth == 0 => {
                elements.push(current.clone());
                current = String::new();
            }
            _ => current.push(c),
        }
    }
    elements.push(current);
    elements
}

pub(super) fn find_derived_property_colon(prop: &str) -> Option<usize> {
    let mut depth = 0;
    for (i, c) in prop.char_indices() {
        match c {
            '{' | '[' | '(' => depth += 1,
            '}' | ']' | ')' => depth -= 1,
            ':' if depth == 0 => return Some(i),
            _ => {}
        }
    }
    None
}

/// Find the position of `=` in a shorthand destructuring property with a default value.
/// e.g., `animated = false` → Some(9), `animated` → None
/// Respects nesting so `data = { x: 1 }` finds the top-level `=`.
pub(super) fn find_default_equals(prop: &str) -> Option<usize> {
    let mut depth = 0;
    let bytes = prop.as_bytes();
    let mut i = 0;
    while i < bytes.len() {
        match bytes[i] {
            b'{' | b'[' | b'(' => depth += 1,
            b'}' | b']' | b')' => depth -= 1,
            b'=' if depth == 0 => {
                // Make sure it's not `==` or `=>`
                if i + 1 < bytes.len() && (bytes[i + 1] == b'=' || bytes[i + 1] == b'>') {
                    i += 2;
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
