//! TitleElement visitor for client-side transformation.
//!
//! Handles `<title>` elements within `<svelte:head>`.
//!
//! Corresponds to `TitleElement.js` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/TitleElement.js`.

use crate::ast::template::{TemplateNode, TitleElement};
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression;
use crate::compiler::phases::phase3_transform::client::visitors::fragment::collect_ids_from_expr;
use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::{
    apply_transforms_to_expression, expression_has_await, expression_has_reactive_state,
};
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;
use crate::compiler::phases::phase3_transform::shared::template::sanitize_template_string;

/// An entry in the memoizer - represents either a sync or async memoized value.
struct MemoEntry {
    /// The converted expression (with transforms applied)
    expression: JsExpr,
    /// Whether this is an async expression (contains await)
    is_async: bool,
}

/// Visit a TitleElement node and generate client-side code.
///
/// When the content contains reactive expressions, generates:
/// ```js
/// $.deferred_template_effect(
///     ($0) => { $.document.title = $0 ?? '' },
///     sync_values,    // [() => expr1, () => expr2] or void 0
///     async_values,   // [async_thunk1, async_thunk2] or undefined
///     blockers        // blocker array or undefined
/// );
/// ```
///
/// For static content:
/// ```js
/// $.effect(() => { $.document.title = 'woo!!!' });
/// ```
pub fn title_element(node: &TitleElement, context: &mut ComponentContext) {
    // Build the value expression from the fragment content, using the memoizer pattern
    let (value, has_state, memo_entries) = build_title_content(&node.fragment.nodes, context);

    // Scan the value expression up front for identifiers used in blocker detection.
    // Identifiers like `$.get(value)` may come from the value expression itself
    // (when the template tag is a bare reactive read with no call/await) rather
    // than the memo_entries list. We collect both below.
    let mut value_ids: Vec<compact_str::CompactString> = Vec::new();
    collect_ids_from_expr(&value, &context.arena, &mut value_ids);

    // Create the assignment: $.document.title = value
    let document_title = b::member(
        &context.arena,
        b::member_path(&context.arena, "$.document"),
        "title",
    );
    let assignment = b::stmt(
        &context.arena,
        b::assign(&context.arena, document_title, value),
    );

    if has_state {
        // Separate memo entries into sync and async
        let sync_entries: Vec<&MemoEntry> = memo_entries.iter().filter(|e| !e.is_async).collect();
        let async_entries: Vec<&MemoEntry> = memo_entries.iter().filter(|e| e.is_async).collect();

        // Build parameter list: $0, $1, $2, ...
        let params: Vec<JsPattern> = (0..memo_entries.len())
            .map(|i| JsPattern::Identifier(format!("${i}").into()))
            .collect();

        // Build callback with parameters
        let callback = if params.is_empty() {
            b::thunk_block(vec![assignment])
        } else {
            b::arrow_block(params, vec![assignment])
        };

        // Build sync_values: [() => expr1, () => expr2] or void 0
        let sync_values = if sync_entries.is_empty() {
            b::undefined(&context.arena)
        } else {
            b::array(
                sync_entries
                    .iter()
                    .map(|e| b::thunk(&context.arena, e.expression.clone()))
                    .collect(),
            )
        };

        // Build async_values: [thunk1, thunk2] or undefined
        let async_values_opt = if async_entries.is_empty() {
            None
        } else {
            Some(b::array(
                async_entries
                    .iter()
                    .map(|e| build_async_thunk(&context.arena, &e.expression))
                    .collect(),
            ))
        };

        // Compute blockers from the memoized expressions by scanning identifiers
        // against the inherited blocker_map / const_blocker_map. This mirrors
        // upstream Memoizer.blockers() which threads `$$promises[N]` through
        // `$.deferred_template_effect(...)` so async-derived values inside
        // `<svelte:head><title>` block on the right promises.
        let blockers_expr: Option<JsExpr> = {
            let map = context.state.blocker_map.borrow();
            let const_map = context.state.const_blocker_map.borrow();
            if map.is_empty() && const_map.is_empty() {
                None
            } else {
                let mut all_names = value_ids;
                for entry in &memo_entries {
                    collect_ids_from_expr(&entry.expression, &context.arena, &mut all_names);
                }

                let mut indices: Vec<usize> = Vec::new();
                for name in &all_names {
                    if let Some(&idx) = map.get(name.as_str())
                        && !indices.contains(&idx)
                    {
                        indices.push(idx);
                    }
                }
                indices.sort();

                let mut const_blocker_exprs: Vec<JsExpr> = Vec::new();
                let mut seen_ptrs: Vec<*const JsExpr> = Vec::new();
                for name in &all_names {
                    if let Some(blocker_expr) = const_map.get(name.as_str()) {
                        let ptr = blocker_expr as *const JsExpr;
                        if !seen_ptrs.contains(&ptr) {
                            seen_ptrs.push(ptr);
                            const_blocker_exprs.push(blocker_expr.clone());
                        }
                    }
                }

                let mut all_blocker_exprs: Vec<JsExpr> = indices
                    .into_iter()
                    .map(|idx| {
                        b::member_computed(
                            &context.arena,
                            b::id("$$promises"),
                            b::number(idx as f64),
                        )
                    })
                    .collect();
                all_blocker_exprs.extend(const_blocker_exprs);

                if all_blocker_exprs.is_empty() {
                    None
                } else {
                    Some(b::array(all_blocker_exprs))
                }
            }
        };

        // Build the deferred_template_effect call.
        //
        // The argument list is:
        //   ($0, $1, ...) => { ... },   // callback (required)
        //   sync_values,                // [() => expr, ...] or void 0
        //   async_values,               // [thunk, ...] or void 0
        //   blockers                    // [$$promises[N], ...] or void 0
        //
        // Trailing void 0 slots are emitted only when later positions are used.
        let mut args = vec![callback];
        let has_sync = !sync_entries.is_empty();
        let has_async = async_values_opt.is_some();
        let has_blockers = blockers_expr.is_some();
        if has_sync || has_async || has_blockers {
            args.push(sync_values);
        }
        if has_async || has_blockers {
            args.push(async_values_opt.unwrap_or_else(|| b::undefined(&context.arena)));
        }
        if has_blockers && let Some(blockers) = blockers_expr {
            args.push(blockers);
        }

        let effect_call = b::stmt(
            &context.arena,
            b::call(
                &context.arena,
                b::member_path(&context.arena, "$.deferred_template_effect"),
                args,
            ),
        );
        context.state.after_update.push(effect_call);
    } else {
        let effect_call = b::stmt(
            &context.arena,
            b::call(
                &context.arena,
                b::member_path(&context.arena, "$.effect"),
                vec![b::thunk_block(vec![assignment])],
            ),
        );
        context.state.after_update.push(effect_call);
    }
}

/// Build an async thunk for a memoized expression.
///
/// For an await expression like `await push()`, this creates the optimized form:
/// - `async () => await push()` → optimized to `push` (if push is a simple call)
/// - `async () => await complex_expr` → stays as `async () => complex_expr`
fn build_async_thunk(
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    expression: &JsExpr,
) -> JsExpr {
    // If the expression is `await X`, we want to create `async () => await X`
    // then optimize: `async () => await call()` → `call` (if call has no nested awaits)
    match expression {
        JsExpr::Await(inner) => {
            let inner_expr = arena.get_expr(*inner);
            // Check if the argument is a simple expression (no nested awaits)
            if !b::js_expr_has_await(arena, inner_expr) {
                // Optimize: just use the argument directly
                // `async () => await push()` → `push`
                // But we need to check if it's a call or identifier
                match inner_expr {
                    JsExpr::Call(call) => {
                        if call.arguments.is_empty()
                            && let JsExpr::Identifier(_) = arena.get_expr(call.callee)
                        {
                            // `async () => await func()` → `func`
                            return arena.get_expr(call.callee).clone();
                        }
                        // Default: wrap in arrow
                        inner_expr.clone()
                    }
                    JsExpr::Identifier(_) => inner_expr.clone(),
                    _ => {
                        // Wrap: `() => expr`
                        b::thunk(arena, inner_expr.clone())
                    }
                }
            } else {
                // Has nested awaits, must keep as async arrow
                b::async_thunk(arena, expression.clone())
            }
        }
        _ => {
            // Not an await expression, wrap as async thunk
            b::async_thunk(arena, expression.clone())
        }
    }
}

/// Build the title content from fragment nodes using memoizer pattern.
///
/// Handles text nodes and expression tags to build a single value expression.
/// For expressions with `await`, extracts them into the memo_entries for
/// separate handling as async values in deferred_template_effect.
///
/// Returns (value_expression, has_state, memo_entries).
fn build_title_content(
    nodes: &[TemplateNode],
    context: &mut ComponentContext,
) -> (JsExpr, bool, Vec<MemoEntry>) {
    let mut memo_entries: Vec<MemoEntry> = Vec::new();

    if nodes.is_empty() {
        return (b::string(""), false, memo_entries);
    }

    // If single text node, return literal string (no reactive state)
    if nodes.len() == 1
        && let TemplateNode::Text(text) = &nodes[0]
    {
        return (b::string(text.data.to_string()), false, memo_entries);
    }

    // If single expression tag, return the expression with optional ?? ''
    if is_single_expression_tag(nodes) {
        let mut has_state = false;
        for node in nodes {
            if let TemplateNode::ExpressionTag(expr) = node {
                if expression_has_reactive_state(&expr.expression, context) {
                    has_state = true;
                }
                let has_await = expression_has_await(&expr.expression);
                let raw_value = convert_expression(&expr.expression, context);
                let value = apply_transforms_to_expression(&raw_value, context);

                // If expression has call or await, memoize it.
                // Phase 2 already cached has_call on the tag metadata.
                let has_call = expr.metadata.expression.has_call();
                if has_call || has_await {
                    let param_name = format!("${}", memo_entries.len());
                    memo_entries.push(MemoEntry {
                        expression: value,
                        is_async: has_await,
                    });
                    let param_ref = b::id(&param_name);
                    if !is_known_defined_expr(&expr.expression) {
                        return (
                            b::nullish(&context.arena, param_ref, b::string("")),
                            has_state,
                            memo_entries,
                        );
                    } else {
                        return (param_ref, has_state, memo_entries);
                    }
                }

                if !is_known_defined_expr(&expr.expression) {
                    return (
                        b::nullish(&context.arena, value, b::string("")),
                        has_state,
                        memo_entries,
                    );
                } else {
                    return (value, has_state, memo_entries);
                }
            }
        }
    }

    // Multiple nodes: build a template literal
    let mut quasis: Vec<String> = Vec::new();
    let mut expressions: Vec<JsExpr> = Vec::new();
    let mut has_state = false;
    let mut current_text = String::new();

    for node in nodes {
        match node {
            TemplateNode::Text(text) => {
                current_text.push_str(&text.data);
            }
            TemplateNode::ExpressionTag(expr) => {
                if expression_has_reactive_state(&expr.expression, context) {
                    has_state = true;
                }

                // Flush accumulated text as a quasi
                quasis.push(std::mem::take(&mut current_text));

                let has_await = expression_has_await(&expr.expression);
                // Phase 2 already cached has_call on the tag metadata.
                let has_call = expr.metadata.expression.has_call();
                let raw_value = convert_expression(&expr.expression, context);
                let value = apply_transforms_to_expression(&raw_value, context);

                // If expression has call or await, memoize it
                if has_call || has_await {
                    let param_name = format!("${}", memo_entries.len());
                    memo_entries.push(MemoEntry {
                        expression: value,
                        is_async: has_await,
                    });
                    let param_ref = b::id(&param_name);
                    if !is_known_defined_expr(&expr.expression) {
                        expressions.push(b::nullish(&context.arena, param_ref, b::string("")));
                    } else {
                        expressions.push(param_ref);
                    }
                } else if !is_known_defined_expr(&expr.expression) {
                    expressions.push(b::nullish(&context.arena, value, b::string("")));
                } else {
                    expressions.push(value);
                }
            }
            _ => {}
        }
    }

    // Add trailing text
    quasis.push(current_text);

    // Build the template literal
    let template_quasis: Vec<_> = quasis
        .iter()
        .enumerate()
        .map(|(i, text)| {
            b::quasi(
                sanitize_template_string(text.as_str()),
                i == quasis.len() - 1,
            )
        })
        .collect();
    let value = b::template(template_quasis, expressions);
    (value, has_state, memo_entries)
}

/// Check if nodes contain a single expression tag (possibly with whitespace text nodes)
fn is_single_expression_tag(nodes: &[TemplateNode]) -> bool {
    let expr_count = nodes
        .iter()
        .filter(|n| matches!(n, TemplateNode::ExpressionTag(_)))
        .count();
    let non_text_non_expr = nodes
        .iter()
        .any(|n| !matches!(n, TemplateNode::Text(_) | TemplateNode::ExpressionTag(_)));

    expr_count == 1 && !non_text_non_expr && nodes.len() == 1
}

/// Check if an expression is known to be defined (not null/undefined).
fn is_known_defined_expr(expr: &crate::ast::js::Expression) -> bool {
    match expr.node_type() {
        Some("Literal") => {
            // Check if literal value is not null
            let node = expr.as_node();
            match &*node {
                crate::ast::typed_expr::JsNode::Literal { value, .. } => {
                    !matches!(value, crate::ast::typed_expr::LiteralValue::Null)
                }
                crate::ast::typed_expr::JsNode::Raw(val) => {
                    let value = val.get("value");
                    !matches!(value, Some(serde_json::Value::Null) | None)
                }
                _ => false,
            }
        }
        Some("TemplateLiteral") => true,
        _ => false,
    }
}
