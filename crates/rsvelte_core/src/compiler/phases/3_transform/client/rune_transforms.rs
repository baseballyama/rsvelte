//! Rune detection and transformation for $state, $derived, and $effect.

use memchr::memmem;
use std::borrow::Cow;

use super::destructure_transforms::{build_fallback_string, literal_key_value};
use super::{
    ARRAY_LOOKUP_COUNTER, SCRIPT_ARRAY_COUNTER, find_matching_paren,
    is_function_parameter_in_statement,
};
use crate::compiler::phases::phase2_analyze::ComponentAnalysis;
use crate::compiler::phases::phase3_transform::shared::js_scan::skip_opaque;
use crate::compiler::phases::phase3_transform::shared::template::escape_js_string;

/// Transform runes for client-side usage with skip and state variable handling.
pub(super) fn transform_client_runes_with_skip_and_state<'a>(
    line: &'a str,
    _skip_state_vars: &[String],
    _state_vars: &[String],
    _non_reactive_vars: &[String],
    _prop_source_vars: &[String],
    _exported_names: &[String],
    _proxy_vars: &[String],
    dev: bool,
    _analysis: &ComponentAnalysis,
    store_sub_vars: &[String],
    _read_only_props: &[(String, String)],
    pre_class_script: &str,
) -> Cow<'a, str> {
    // Quick pre-check: if no rune-like pattern (`$` followed by letter) appears, skip
    if !line.contains('$') {
        return Cow::Borrowed(line);
    }

    let mut result = Cow::Borrowed(line);

    // Check which rune names are actually store subscriptions.
    // When $state or $effect is imported from a store (not a real rune),
    // we must NOT transform $state(x) to $.state(x) or $effect(x) to $.user_effect(x).
    let state_is_store_sub = store_sub_vars.iter().any(|s| s == "$state");
    let effect_is_store_sub = store_sub_vars.iter().any(|s| s == "$effect");
    let derived_is_store_sub = store_sub_vars.iter().any(|s| s == "$derived");
    let inspect_is_store_sub = store_sub_vars.iter().any(|s| s == "$inspect");

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
        // Destructured `$state(...)` / `$state.raw(...)` declarators are now
        // rewritten in the AST pass (`ast_state_transform::try_rewrite_state_destructuring_declarator`).
        // The AST visit handles the same shapes the text helper did
        // (object pattern with shorthand / renamed / rest, array pattern with
        // optional rest), emits the same `tmp = wrapped_source, name = $.state(...)`
        // form, and threads `maybe_tag_declarator` for dev-mode `$.tag(...)`
        // wrapping. The `wrap_state_value` text helper is shared.

        // `$state.snapshot(x)` -> `$.snapshot(x)` is now done by the AST pass
        // in `ast_state_transform::visit_call_expression`. The dev-mode
        // `svelte-ignore state_snapshot_uncloneable` handler in
        // `mod.rs::transform_client`'s `process_accumulated`
        // closure still runs *before* that AST rewrite; it now matches the
        // un-renamed `$state.snapshot(` shape and emits
        // `$state.snapshot(x, true)`, which the AST then renames to
        // `$.snapshot(x, true)` at the callee site.

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
        // Simple `let x = $derived.by(fn)` declarators are now rewritten in
        // `ast_state_transform::transform_state_vars_ast` via
        // `try_rewrite_derived_by_declarator` (precise lexical scope checks
        // for `$derived`, walks the callback so inner state-var refs still
        // get `$.get(...)` wrapping, emits the same `$.derived(fn)` text).
        //
        // The "inner `const x = $state(...)` is non-reactive inside the
        // callback" behaviour that the old text path implemented via an
        // explicit `effective_non_reactive.push(var)` is preserved
        // structurally: those inner const $state vars are added to
        // `non_reactive_state_vars` upstream in
        // `transform_instance_script_for_visitors`, so the AST visitor
        // already treats their declarations and references as non-reactive
        // without a $derived.by-specific carve-out here.
        //
        // Destructured `$derived.by({ ... })` / `[...]` patterns are now
        // rewritten in the AST pass
        // (`ast_state_transform::try_rewrite_derived_by_destructuring_declarator`).
        // The shared `process_derived_destructuring_pattern` text helper is
        // reused for the recursive pattern walk; only the per-statement
        // byte scan that used to detect the shape is removed here.

        // Transform $derived(x) to $.derived(() => x) or $.async_derived() for async
        // Handle destructuring patterns specially
        // Loop to handle multiple $derived() calls in a single statement
        // (e.g., inside a function body with multiple derived declarations)
        // Simple `let x = $derived(expr)` declarators are now rewritten in
        // `ast_state_transform::transform_state_vars_ast` via
        // `try_rewrite_derived_call_declarator`. The AST visit handles the
        // same five cases the old text loop did (already-a-function thunk
        // wrap, top-level `await` → `await $.async_derived(...)`, object
        // literal paren wrap, bare store-sub / prop-source pass-through,
        // and default `unthunk_string` thunk wrap) and reuses the same
        // text helpers (`contains_direct_await_in_expression`,
        // `strip_top_level_await_from_expr`, `unthunk_string`) on the
        // walked argument text.
        //
        // *Destructured* `$derived({...})` / `$derived([...])` patterns are
        // still handled by the text helper `transform_derived_destructuring`,
        // which produces a complete IIFE/`$$d`-temp form and returns the
        // rewritten script.
        // Destructured `$derived(...)` declarators are now rewritten in the
        // AST pass (`ast_state_transform::try_rewrite_derived_destructuring_declarator`).
        // The recursive pattern processor `process_derived_destructuring_pattern`
        // is shared with the AST handler — only the per-statement byte
        // scan that used to detect the shape is removed here.
    } // end if !derived_is_store_sub

    // `$state.eager(x)` -> `$.eager(() => x)` is now handled by the AST
    // pass in `ast_state_transform::visit_call_expression` (precise
    // lexical-scope shadowing check for `$state`, walks the argument for
    // inner state-var refs and bakes those `$.get(...)` rewrites into
    // the outer thunk-wrap span).

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

    // `$props.id()` -> `$.props_id()` is now handled by the AST pass in
    // `ast_state_transform::visit_call_expression` (precise lexical-scope
    // shadowing check for `$props`).

    // `$inspect.trace(...)` *dev mode* is now handled by the AST pass in
    // `ast_state_transform::visit_function_body` (whole-body rewrite to
    // `{ return $.trace(thunk, () => { …remaining… }); }`).
    //
    // The non-dev branch — strip the `$inspect.trace(arg);` statement and
    // its surrounding whitespace/semicolons — stays here. It does fine
    // text trimming around the call site (leading tabs/spaces on the
    // same line, trailing `;`/newlines) that's statement-shaped rather
    // than expression-shaped and is awkward to express at the AST level.
    if !dev && !inspect_is_store_sub {
        while let Some(pos) = memmem::find(result.as_bytes(), b"$inspect.trace(") {
            let trace_start = pos + 15; // after "$inspect.trace("
            if let Some(content_end) = find_matching_paren(&result[trace_start..]) {
                let mut end = trace_start + content_end + 1;
                while end < result.len()
                    && (result.as_bytes()[end] == b';'
                        || result.as_bytes()[end] == b' '
                        || result.as_bytes()[end] == b'\t'
                        || result.as_bytes()[end] == b'\n'
                        || result.as_bytes()[end] == b'\r')
                {
                    end += 1;
                }
                let mut start = pos;
                while start > 0
                    && (result.as_bytes()[start - 1] == b' '
                        || result.as_bytes()[start - 1] == b'\t')
                {
                    start -= 1;
                }
                result = Cow::Owned(format!("{}{}", &result[..start], &result[end..]));
            } else {
                break;
            }
        }
    }

    // `$inspect(args)` and `$inspect(args).with(cb)` in *dev mode* are now
    // handled by the AST pass in
    // `ast_state_transform::visit_call_expression`. The non-dev branch
    // below stays here because the standalone-statement detection (which
    // emits the `/* $$async_hole:... */` async-mode marker or just
    // strips the call) is statement-shaped rather than expression-shaped
    // and is awkward to do at the AST level.
    if !dev
        && !inspect_is_store_sub
        && let Some(pos) = memmem::find(result.as_bytes(), b"$inspect(")
    {
        {
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
                    return Cow::Owned(format!("/* $$async_hole:{} */", args));
                } else {
                    let trailing_comment = after.strip_prefix(';').unwrap_or(after).trim_start();
                    let marker = if before.is_empty() && trailing_comment.starts_with("/*") {
                        // The trailing `;` of the removed call is one of the
                        // `;;` upstream prints for the empty-as-expression.
                        "/* $$inspect_removed$$ */;"
                    } else {
                        ""
                    };
                    // Remove just the $inspect(...) part but keep other code on the line
                    result = Cow::Owned(format!(
                        "{}{}{}",
                        &result[..pos],
                        marker,
                        &result[pos + total_end..]
                    ));
                }
            }
        }
    }

    // Destructured / identifier `$props()` declarators are now rewritten
    // in the AST pass
    // (`ast_state_transform::try_rewrite_props_destructuring_declaration`).
    // The recursive flag/binding-kind heavy lifting in
    // `transform_props_destructuring` is reused; only the per-statement
    // byte scan that used to detect the shape is removed here.

    // Dev-mode `===` / `!==` → `$.strict_equals(...)` rewrite now lives in
    // the AST pass (`ast_state_transform::try_rewrite_strict_equals_binary`)
    // for component-instance scripts, and in `strict_equals_ast` for
    // module scripts. The text-based predecessor was removed in the
    // Phase A cleanup once both paths landed.

    // In dev mode, wrap $.state() and $.derived() declarations with $.tag() for debugging
    // This allows $inspect.trace() to show variable names in the output.
    // Pattern: `let name = $.state(...)` -> `let name = $.tag($.state(...), 'name')`
    // Also handles $.derived(), $.state($.proxy(...)).
    //
    // The declarator shape (`let/const/var X = $.X(...)`) goes through the
    // AST helper (`tag_declarator_ast`); class fields, `this.field` shapes,
    // and the assignment form are still picked up by the text scanner that
    // follows. Both passes emit byte-identical output, so the text
    // version's "already wrapped" guard skips the AST's emissions cleanly.
    // Idempotent chain.
    if dev {
        if let Some(rewritten) =
            super::tag_declarator_ast::wrap_state_derived_with_tag_declarators_ast(&result, false)
        {
            result = Cow::Owned(rewritten);
        }
        if let Some(rewritten) =
            super::tag_class_field_ast::wrap_state_derived_with_tag_class_fields_ast_from(
                &result,
                pre_class_script,
            )
        {
            result = Cow::Owned(rewritten);
        }
        result = Cow::Owned(wrap_state_derived_with_tag(&result));
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

            // `$$`-prefixed names are the compiler's own temps (`$$d`,
            // `$$array`); upstream labels a binding the user wrote, never one it
            // generated.
            if var_name.is_empty() || var_name.starts_with("$$") {
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

            if var_name.is_empty() || var_name.starts_with("$$") {
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
                search_from = crate::compiler::utils::next_char_boundary(&result, abs_hash_pos);
                continue;
            }

            // Extract field name after #
            let after_hash = &result[abs_hash_pos + 1..];
            let field_name: String = after_hash
                .chars()
                .take_while(|c| c.is_alphanumeric() || *c == '_' || *c == '$')
                .collect();

            if field_name.is_empty() {
                search_from = crate::compiler::utils::next_char_boundary(&result, abs_hash_pos);
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
                    // Upstream: `declaration.id?.name ?? '[class]'`.
                    let class_name = extract_enclosing_class_name(before_text).unwrap_or("[class]");

                    let label = if lowered_from_public(&result, &field_name, &field_name) {
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
                    // Upstream: `declaration.id?.name ?? '[class]'`.
                    let class_name = extract_enclosing_class_name(before_text).unwrap_or("[class]");

                    let label = match field_name.strip_prefix('#') {
                        Some(base) if lowered_from_public(&result, base, base) => {
                            format!("{}.{}", class_name, base)
                        }
                        _ => format!("{}.{}", class_name, field_name),
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

/// Whether `#backing` is the lowering of a public `base = $state()` field, in
/// which case the dev label keeps the public name (`get_name` runs on the
/// *original* key). The tell is the setter the lowering generates, whose body
/// is exactly `$.set(this.#backing, value[, true])` — a hand-written accessor
/// over a genuinely private field does not have that shape.
fn lowered_from_public(source: &str, base: &str, backing: &str) -> bool {
    let signature = format!("set {}(value)", base);
    let mut from = 0;
    while let Some(rel) = source[from..].find(&signature) {
        let after = from + rel + signature.len();
        from = after;
        let Some(open) = source[after..].find('{') else {
            break;
        };
        let open = after + open;
        let mut depth = 0usize;
        let mut close = None;
        for (i, c) in source[open..].char_indices() {
            match c {
                '{' => depth += 1,
                '}' => {
                    depth -= 1;
                    if depth == 0 {
                        close = Some(open + i + 1);
                        break;
                    }
                }
                _ => {}
            }
        }
        let Some(close) = close else { break };
        let compact: String = source[open..close]
            .split_whitespace()
            .collect::<Vec<_>>()
            .join(" ");
        if compact == format!("{{ $.set(this.#{}, value); }}", backing)
            || compact == format!("{{ $.set(this.#{}, value, true); }}", backing)
        {
            return true;
        }
    }
    false
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

/// Dev-mode `$.tag(<derived>, '<label>')` label for a destructured `$derived`
/// declarator. `label` is `None` outside dev; the `$$array` temps carry the
/// declarator-wide `[$derived iterable|object]` kind (they have no name of their
/// own) while every leaf carries its own binding name.
fn tag_derived(init: String, label: Option<&str>) -> String {
    match label {
        Some(label) => format!("$.tag({}, '{}')", init, label),
        None => init,
    }
}

/// `member_base` is the base expression used for **member reads** (`base.key`),
/// while `base_expr` is used for the top-level rest's `$.exclude_from_object`.
/// They differ only when destructuring `$derived(<rest-prop-binding>)`: a
/// `let { ssr, …, ...restProps } = $derived(props)` where `props` is
/// `$.rest_props($$props, …)` reads named members straight from `$$props`
/// (`member_base = "$$props"`) — mirroring upstream's rest-prop member rewrite —
/// but keeps `props` for `$.exclude_from_object(props, …)` (the rest must
/// subtract the already-excluded keys held by `props`). Every other caller and
/// all nested recursion pass `member_base == base_expr`.
pub(super) fn process_derived_destructuring_pattern(
    pattern: &str,
    base_expr: &str,
    member_base: &str,
    declarations: &mut Vec<String>,
    array_counter: &mut usize,
    insert_label: Option<&str>,
    array_temp_prefix: &str,
) -> Option<()> {
    let pattern = pattern.trim();
    if pattern.starts_with('{') && pattern.ends_with('}') {
        let inner = &pattern[1..pattern.len() - 1];
        process_derived_object_pattern(
            inner,
            base_expr,
            member_base,
            declarations,
            array_counter,
            insert_label,
            array_temp_prefix,
        )
    } else if pattern.starts_with('[') && pattern.ends_with(']') {
        let inner = &pattern[1..pattern.len() - 1];
        process_derived_array_pattern(
            inner,
            base_expr,
            member_base,
            declarations,
            array_counter,
            insert_label,
            array_temp_prefix,
        )
    } else {
        None
    }
}

/// The expression inside a computed destructuring key (`[k]` → `k`).
fn computed_key_expr(key: &str) -> Option<&str> {
    let key = key.trim();
    Some(key.strip_prefix('[')?.strip_suffix(']')?.trim())
}

/// Whether `key` is a single complete string literal (`'a-b'` / `"a-b"`).
fn is_string_literal_key(key: &str) -> bool {
    let bytes = key.as_bytes();
    if bytes.len() < 2 {
        return false;
    }
    let quote = bytes[0];
    if quote != b'\'' && quote != b'"' {
        return false;
    }
    let mut i = 1;
    while i < bytes.len() {
        if bytes[i] == b'\\' {
            i += 2;
            continue;
        }
        if bytes[i] == quote {
            return i == bytes.len() - 1;
        }
        i += 1;
    }
    false
}

/// Whether `key` is a numeric literal (`0`, `1.5`) — `base.0` is not valid JS.
fn is_numeric_literal_key(key: &str) -> bool {
    !key.is_empty()
        && key.as_bytes()[0].is_ascii_digit()
        && key.bytes().all(|b| b.is_ascii_digit() || b == b'.')
}

/// Member access for a destructured property key, mirroring upstream's
/// `b.member(expression, prop.key, prop.computed || prop.key.type !== 'Identifier')`.
///
/// Computed / literal keys need bracket notation, and they read from
/// `base_expr` rather than `member_base`: upstream's rest-prop rewrite only
/// retargets *static* member reads (`props.a` → `$$props.a`), so `props[k]`
/// keeps the binding itself as its object.
pub(super) fn derived_prop_access(base_expr: &str, member_base: &str, key: &str) -> String {
    if let Some(expr) = computed_key_expr(key) {
        format!("{}[{}]", base_expr, expr)
    } else if is_string_literal_key(key) || is_numeric_literal_key(key) {
        format!("{}[{}]", base_expr, key)
    } else {
        format!("{}.{}", member_base, key)
    }
}

/// The `$.exclude_from_object(base, [...])` entry for a non-rest property key.
/// Upstream turns identifier and `Literal` keys into string literals and every
/// other computed key into `String(<expr>)`, so the rest subtracts it at runtime.
///
/// Unlike the member access, the key list is *not* source-verbatim: upstream
/// builds it with `b.literal(...)`, a fresh node with no `raw`, so the printer
/// always emits the decoded value single-quoted.
pub(super) fn exclude_key_literal(key: &str) -> String {
    if let Some(expr) = computed_key_expr(key) {
        return match literal_key_value(expr) {
            Some(value) => quote_exclude_key(&value),
            None => format!("String({})", expr),
        };
    }
    // A non-computed key is either a literal or an identifier, whose name is
    // already its own value — only a literal needs the re-parse.
    if !is_string_literal_key(key) && !is_numeric_literal_key(key) {
        return quote_exclude_key(key);
    }
    match literal_key_value(key) {
        Some(value) => quote_exclude_key(&value),
        None => quote_exclude_key(key),
    }
}

fn quote_exclude_key(value: &str) -> String {
    format!("'{}'", escape_js_string(value))
}

/// The `$.exclude_from_object(base, [<keys>])` key list of an object pattern's
/// non-rest properties, shared by the legacy declaration and assignment
/// destructuring expansions so both subtract exactly the keys upstream does.
pub(super) fn exclude_from_object_keys<S: AsRef<str>>(props: &[S]) -> Vec<String> {
    props
        .iter()
        .filter_map(|prop| {
            let prop = prop.as_ref().trim();
            if prop.is_empty() || prop.starts_with("...") {
                return None;
            }
            let key = if let Some(colon_pos) = find_derived_property_colon(prop) {
                prop[..colon_pos].trim()
            } else if let Some(eq_pos) = find_default_equals(prop) {
                prop[..eq_pos].trim()
            } else {
                prop
            };
            Some(exclude_key_literal(key))
        })
        .collect()
}

pub(super) fn process_derived_object_pattern(
    inner: &str,
    base_expr: &str,
    member_base: &str,
    declarations: &mut Vec<String>,
    array_counter: &mut usize,
    insert_label: Option<&str>,
    array_temp_prefix: &str,
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
            let prop_access = derived_prop_access(base_expr, member_base, key);
            if value_pattern.starts_with('[') || value_pattern.starts_with('{') {
                // The pattern's default must survive into the helper's base
                // (`sizes: [x] = []` → `$.to_array($.fallback(o.sizes, () => [],
                // true))`) — the second pass builds the same effective access for
                // the element declarations.
                let (nested_pattern, default_val) = split_nested_pattern_default(value_pattern);
                let effective_access = if let Some(dv) = default_val {
                    build_fallback_string(&prop_access, dv)
                } else {
                    prop_access
                };
                collect_array_helpers_only(
                    nested_pattern,
                    &effective_access,
                    declarations,
                    insert_label,
                    array_temp_prefix,
                )?;
            }
        }
    }

    // Collect all non-rest property keys for $.exclude_from_object
    let has_rest = properties.iter().any(|prop| prop.trim().starts_with("..."));
    let excluded_keys: Vec<String> = properties
        .iter()
        .filter(|_| has_rest)
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
            Some(exclude_key_literal(key))
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
            let prop_access = derived_prop_access(base_expr, member_base, key);
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
                    array_temp_prefix,
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
                let member_access = format!("{}.{}", member_base, name);
                let fallback = build_fallback_string(&member_access, default_val);
                declarations.push(format!("{} = $.derived(() => {})", name, fallback));
            } else {
                declarations.push(format!(
                    "{} = $.derived(() => {}.{})",
                    prop, member_base, prop
                ));
            }
        }
    }
    Some(())
}

/// The `$.to_array(...)` call for an array pattern. Upstream passes a length only
/// when the pattern has no rest element — with one the iterable must be drained
/// completely, and a fixed length would truncate it.
fn to_array_call(base_expr: &str, elements: &[String]) -> String {
    let has_rest = elements
        .last()
        .is_some_and(|element| element.trim().starts_with("..."));
    if has_rest {
        format!("$.to_array({})", base_expr)
    } else {
        format!("$.to_array({}, {})", base_expr, elements.len())
    }
}

/// Collect ONLY $$array helper declarations from nested patterns.
/// This is used in the first pass to ensure $$array declarations come before
/// the variable declarations that depend on them.
///
/// Only ever reached below the top level, so `base_expr` is already a resolved
/// member/element access and the `member_base` distinction does not apply.
pub(super) fn collect_array_helpers_only(
    pattern: &str,
    base_expr: &str,
    declarations: &mut Vec<String>,
    insert_label: Option<&str>,
    array_temp_prefix: &str,
) -> Option<()> {
    let pattern = pattern.trim();
    if pattern.starts_with('[') && pattern.ends_with(']') {
        let inner = &pattern[1..pattern.len() - 1];
        let elements = split_derived_array_elements(inner);

        // Generate the $$array helper
        let global_counter = SCRIPT_ARRAY_COUNTER.with(|c| {
            let current = c.get();
            c.set(current + 1);
            current
        });

        let array_var = if global_counter == 0 {
            array_temp_prefix.to_string()
        } else {
            format!("{}_{}", array_temp_prefix, global_counter)
        };

        declarations.push(format!(
            "{} = {}",
            array_var,
            tag_derived(
                format!("$.derived(() => {})", to_array_call(base_expr, &elements)),
                insert_label
            )
        ));

        // Recursively collect array helpers from nested patterns
        for (index, element) in elements.iter().enumerate() {
            let element = element.trim();
            if element.is_empty() || element.starts_with("...") {
                continue;
            }
            let element_access = format!("$.get({})[{}]", array_var, index);
            if element.starts_with('[') || element.starts_with('{') {
                collect_array_helpers_only(
                    element,
                    &element_access,
                    declarations,
                    insert_label,
                    array_temp_prefix,
                )?;
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
                let prop_access = derived_prop_access(base_expr, base_expr, key);
                if value_pattern.starts_with('[') || value_pattern.starts_with('{') {
                    collect_array_helpers_only(
                        value_pattern,
                        &prop_access,
                        declarations,
                        insert_label,
                        array_temp_prefix,
                    )?;
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
    array_temp_prefix: &str,
) -> Option<()> {
    let pattern = pattern.trim();
    if pattern.starts_with('[') && pattern.ends_with(']') {
        let inner = &pattern[1..pattern.len() - 1];
        let elements = split_derived_array_elements(inner);

        // Get the array variable that was already created by collect_array_helpers_only
        // We need to track which $$array we're using - use a separate counter for lookups
        let array_var = get_current_array_var_for_base(base_expr, array_temp_prefix);

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
                    array_temp_prefix,
                )?;
            } else if let Some(eq_pos) = find_default_equals(element) {
                let name = element[..eq_pos].trim();
                let fallback = build_fallback_string(&element_access, element[eq_pos + 1..].trim());
                declarations.push(format!("{} = $.derived(() => {})", name, fallback));
            } else {
                declarations.push(format!("{} = $.derived(() => {})", element, element_access));
            }
        }
    } else if pattern.starts_with('{') && pattern.ends_with('}') {
        let inner = &pattern[1..pattern.len() - 1];
        let properties = split_derived_object_properties(inner);

        // Collect all non-rest property keys for $.exclude_from_object
        let has_rest = properties.iter().any(|prop| prop.trim().starts_with("..."));
        let excluded_keys: Vec<String> = properties
            .iter()
            .filter(|_| has_rest)
            .filter_map(|prop| {
                let prop = prop.trim();
                if prop.is_empty() || prop.starts_with("...") {
                    return None;
                }
                let key = if let Some(colon_pos) = find_derived_property_colon(prop) {
                    prop[..colon_pos].trim()
                } else if let Some(eq_pos) = find_default_equals(prop) {
                    prop[..eq_pos].trim()
                } else {
                    prop
                };
                Some(exclude_key_literal(key))
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
                let prop_access = derived_prop_access(base_expr, base_expr, key);
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
                        array_temp_prefix,
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
            } else if let Some(eq_pos) = find_default_equals(prop) {
                let name = prop[..eq_pos].trim();
                let member_access = format!("{}.{}", base_expr, name);
                let fallback = build_fallback_string(&member_access, prop[eq_pos + 1..].trim());
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
pub(super) fn get_current_array_var_for_base(_base_expr: &str, array_temp_prefix: &str) -> String {
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
        array_temp_prefix.to_string()
    } else {
        format!("{}_{}", array_temp_prefix, counter)
    }
}

pub(super) fn process_derived_array_pattern(
    inner: &str,
    // An array pattern consumes the *value*, not a named member of it, so
    // `$.to_array` takes `base_expr`; `member_base` (upstream's rest-prop member
    // rewrite target) never applies here.
    base_expr: &str,
    _member_base: &str,
    declarations: &mut Vec<String>,
    _array_counter: &mut usize,
    insert_label: Option<&str>,
    array_temp_prefix: &str,
) -> Option<()> {
    let elements = split_derived_array_elements(inner);

    // Use the global counter to generate a unique $$array variable name
    // This ensures unique names across multiple $derived destructuring patterns
    let global_counter = SCRIPT_ARRAY_COUNTER.with(|c| {
        let current = c.get();
        c.set(current + 1);
        current
    });

    let array_var = if global_counter == 0 {
        array_temp_prefix.to_string()
    } else {
        format!("{}_{}", array_temp_prefix, global_counter)
    };

    declarations.push(format!(
        "{} = {}",
        array_var,
        tag_derived(
            format!("$.derived(() => {})", to_array_call(base_expr, &elements)),
            insert_label
        )
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
                &element_access,
                declarations,
                &mut nested_counter,
                insert_label,
                array_temp_prefix,
            )?;
        } else if let Some(eq_pos) = find_default_equals(element) {
            let name = element[..eq_pos].trim();
            let fallback = build_fallback_string(&element_access, element[eq_pos + 1..].trim());
            declarations.push(format!("{} = $.derived(() => {})", name, fallback));
        } else {
            declarations.push(format!("{} = $.derived(() => {})", element, element_access));
        }
    }
    Some(())
}

/// Split a destructuring pattern body on its top-level `,` separators, skipping
/// nested patterns, string/template literals and comments — a comma inside a
/// default value (`b = 'x,y'`) is not a separator.
fn split_top_level_commas(inner: &str) -> Vec<&str> {
    let bytes = inner.as_bytes();
    let mut segments = Vec::new();
    let mut depth = 0i32;
    let mut start = 0usize;
    let mut i = 0usize;
    while i < bytes.len() {
        if let Some(end) = skip_literal_or_comment(bytes, i) {
            i = end + 1;
            continue;
        }
        match bytes[i] {
            b'{' | b'[' | b'(' => depth += 1,
            b'}' | b']' | b')' => depth -= 1,
            b',' if depth == 0 => {
                segments.push(&inner[start..i]);
                start = i + 1;
            }
            _ => {}
        }
        i += 1;
    }
    segments.push(&inner[start..]);
    segments
}

/// Drop comments from one destructuring-pattern segment.
///
/// `split_top_level_commas` skips comments when locating the separators, but the
/// segment it returns still contains them and every consumer reads a segment as
/// pattern text — so a `//` comment became a binding name and commented out the
/// rest of the emitted line, `;` included.
fn strip_pattern_comments(segment: &str) -> String {
    let bytes = segment.as_bytes();
    if !bytes.contains(&b'/') {
        return segment.to_string();
    }

    let mut out = String::with_capacity(segment.len());
    let mut kept_from = 0usize;
    let mut prev: Option<u8> = None;
    let mut i = 0usize;
    while i < bytes.len() {
        match skip_opaque(bytes, i, prev) {
            // `skip_opaque`'s end is exclusive, so a `//` comment's newline is
            // not part of it and survives — the next line still starts on its own.
            Some((end, true)) => {
                out.push_str(&segment[kept_from..i]);
                // A separator, so stripping cannot glue two tokens together.
                out.push(' ');
                kept_from = end;
                i = end;
            }
            // A string, template or regex literal is skipped over, not removed.
            Some((end, false)) => {
                prev = Some(bytes[end - 1]);
                i = end;
            }
            None => {
                if !bytes[i].is_ascii_whitespace() {
                    prev = Some(bytes[i]);
                }
                i += 1;
            }
        }
    }
    out.push_str(&segment[kept_from..]);
    out
}

pub(super) fn split_derived_object_properties(inner: &str) -> Vec<String> {
    split_top_level_commas(inner)
        .into_iter()
        .map(strip_pattern_comments)
        .map(|segment| segment.trim().to_string())
        .filter(|segment| !segment.is_empty())
        .collect()
}

pub(super) fn split_derived_array_elements(inner: &str) -> Vec<String> {
    // Not trimmed or filtered: an empty element is an elision and is positional.
    split_top_level_commas(inner)
        .into_iter()
        .map(strip_pattern_comments)
        .collect()
}

pub(super) fn find_derived_property_colon(prop: &str) -> Option<usize> {
    scan_property_separators(prop).0
}

/// Find the position of `=` in a shorthand destructuring property with a default value.
/// e.g., `animated = false` → Some(9), `animated` → None
/// Respects nesting so `data = { x: 1 }` finds the top-level `=`.
pub(super) fn find_default_equals(prop: &str) -> Option<usize> {
    scan_property_separators(prop).1
}

/// Byte offsets of a destructuring property's key separator `:` and default-value
/// `=`, skipping nested patterns, string/template literals and comments.
///
/// A property is always `key: value = default`, so the key separator can only
/// precede the default `=` — scanning the whole property would otherwise mistake a
/// `:` from the default (a ternary, a string literal) for the key separator.
fn scan_property_separators(prop: &str) -> (Option<usize>, Option<usize>) {
    let bytes = prop.as_bytes();
    let mut depth = 0i32;
    let mut colon = None;
    let mut i = 0;
    while i < bytes.len() {
        if let Some(end) = skip_literal_or_comment(bytes, i) {
            i = end + 1;
            continue;
        }
        match bytes[i] {
            b'{' | b'[' | b'(' => depth += 1,
            b'}' | b']' | b')' => depth -= 1,
            b':' if depth == 0 && colon.is_none() => colon = Some(i),
            b'=' if depth == 0 => {
                let prev = if i > 0 { bytes[i - 1] } else { 0 };
                let is_operator = matches!(bytes.get(i + 1), Some(b'=' | b'>'))
                    || matches!(prev, b'!' | b'<' | b'>' | b'=');
                if !is_operator {
                    return (colon, Some(i));
                }
            }
            _ => {}
        }
        i += 1;
    }
    (colon, None)
}

/// Index of the last byte of the comment or string/template literal starting at
/// `i`, or `None` when `i` does not start one. Callers resume at `end + 1`.
fn skip_literal_or_comment(bytes: &[u8], i: usize) -> Option<usize> {
    match bytes[i] {
        b'/' if bytes.get(i + 1) == Some(&b'/') => {
            let mut j = i;
            while j < bytes.len() && bytes[j] != b'\n' {
                j += 1;
            }
            Some(j)
        }
        b'/' if bytes.get(i + 1) == Some(&b'*') => {
            let mut j = i + 2;
            while j < bytes.len() && !(bytes[j] == b'*' && bytes.get(j + 1) == Some(&b'/')) {
                j += 1;
            }
            Some(j + 1)
        }
        quote @ (b'\'' | b'"' | b'`') => {
            let mut j = i + 1;
            while j < bytes.len() && bytes[j] != quote {
                j += if bytes[j] == b'\\' { 2 } else { 1 };
            }
            Some(j)
        }
        _ => None,
    }
}
