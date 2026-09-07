//! Server `SnippetBlock` visitor — the Rust port of
//! `3-transform/server/visitors/SnippetBlock.js`.
//!
//! Upstream (写经):
//! ```js
//! export function SnippetBlock(node, context) {
//!     let fn = b.function_declaration(
//!         node.expression,                          // the snippet name id
//!         [b.id('$$renderer'), ...node.parameters], // ($$renderer, ...params)
//!         context.visit(node.body)                  // a `b.block([...])`
//!     );
//!     const statements = node.metadata.can_hoist ? context.state.hoisted
//!                                                 : context.state.init;
//!     if (dev) {
//!         fn.body.body.unshift(b.stmt(b.call('$.validate_snippet_args', b.id('$$renderer'))));
//!         statements.push(b.stmt(b.call('$.prevent_snippet_stringification', fn.id)));
//!     }
//!     statements.push(fn);
//! }
//! ```
//!
//! A snippet lowers to a `function name($$renderer, ...params) { <body> }`
//! declaration. The `node.parameters` are emitted VERBATIM as formal parameters
//! — including destructuring patterns (`{ count }` / `[x]`) and default values
//! (`id = default_arg()`, `b = (1, 2)`) — because upstream spreads them directly
//! into the parameter list. When `node.metadata.can_hoist` is true the
//! declaration is lifted to module scope (`state.hoisted`); otherwise it goes into
//! the SHARED component-level `state.init` (here `state.snippet_inits`), which the
//! program assembly prepends to the component-function body ahead of the rendered
//! template.
//!
//! The dev-mode `$.validate_snippet_args` prologue and

use crate::ast::template::SnippetBlock;
use crate::compiler::phases::phase3_transform::server::ast::ServerTransformState;
use crate::compiler::phases::phase3_transform::shared::json_field::Field;
use serde_json::Value;

/// One declared snippet parameter as an oxc binding pattern.
///
/// The default value comes from the parsed node, not from its source span: the
/// span still covers the TypeScript the parse erased (`(t: T) => t` spans
/// `t: T`, and OXC reads `<string>() => 1` as a generic arrow), so a slice
/// re-parsed as plain JS is either wrong or rejected — and a rejection used to
/// discard the WHOLE parameter list.
fn snippet_param_pattern<'a>(
    param: &crate::ast::js::Expression,
    state: &ServerTransformState<'a>,
) -> oxc_ast::ast::BindingPattern<'a> {
    let b = state.b;
    let json = param.as_json();
    let node_type = json.field("type").and_then(Value::as_str).unwrap_or("");

    if node_type == "AssignmentPattern"
        && let Some(left) = json.field("left")
        && let Some(right) = json.field("right")
    {
        let left_expr = crate::ast::js::Expression::from_json(left.clone());
        let left_pat = pattern_from_span(&left_expr, state);
        let right_expr = crate::ast::js::Expression::from_json(right.clone());
        return oxc_ast::ast::BindingPattern::new_assignment_pattern(
            oxc_span::SPAN,
            left_pat,
            state.visit_expr_raw(&right_expr),
            &b.ab(),
        );
    }

    pattern_from_span(param, state)
}

/// A binding pattern re-parsed from its own source span with the TypeScript
/// annotation removed. A pattern has no expression to convert, so this half
/// stays textual.
fn pattern_from_span<'a>(
    expr: &crate::ast::js::Expression,
    state: &ServerTransformState<'a>,
) -> oxc_ast::ast::BindingPattern<'a> {
    let src = match (expr.start(), expr.end()) {
        (Some(start), Some(end))
            if (end as usize) > start as usize && (end as usize) <= state.source.len() =>
        {
            strip_ts_type_annotation(&state.source[start as usize..end as usize])
        }
        _ => String::new(),
    };
    state
        .reparse_pattern(&src)
        .unwrap_or_else(|| state.b.id_pat(&src))
}

/// Visit a `{#snippet name(params)}...{/snippet}` block.
pub fn visit_snippet_block<'a>(node: &SnippetBlock<'a>, state: &mut ServerTransformState<'a>) {
    let b = state.b;

    // Snippet name — `node.expression` is the name identifier.
    let name = node
        .expression
        .identifier_name()
        .map(|s| s.to_string())
        .unwrap_or_else(|| "snippet".to_string());

    let fn_decl = build_snippet_function(node, &name, state);

    // 写经 upstream `fn.___snippet = true`: record the snippet's function name so
    // the `uses_component_bindings` settle-loop assembly can hoist this
    // declaration ahead of `$$render_inner` (snippet functions render OUTSIDE the
    // re-render loop).
    state.snippet_names.insert(name.clone());

    // 写经 `node.metadata.can_hoist ? state.hoisted : state.init`: a hoistable
    // snippet (no instance-state reference) goes to module scope; otherwise it
    // is emitted into the enclosing fragment's template body. In dev mode the
    // guard and declaration share upstream's `state.init` placement.
    // Upstream `can_hoist = is_root_level && body_refs_only_own_params`. Our
    // analyze does NOT bump its depth counters for `<svelte:boundary>`, so a
    // snippet that sits directly inside a boundary's children fragment (e.g.
    // `{#snippet children()}` in `<svelte:boundary>`) wrongly reports
    // `can_hoist == true`. Re-impose the root-level gate with the server-side
    // `fragment_depth` (root fragment = 1; any nested block / boundary body ≥ 2)
    // so a boundary-nested snippet is emitted INLINE in the boundary block rather
    // than hoisted to module scope — mirroring the same gate the SvelteBoundary
    // visitor applies to the `failed` snippet.
    if node.metadata.can_hoist && state.fragment_depth <= 1 {
        if state.options.dev {
            state
                .hoisted
                .push(b.stmt(b.call("$.prevent_snippet_stringification", vec![b.id(&name)])));
        }
        state.hoisted.push(fn_decl);
    } else {
        if state.options.dev {
            state
                .template
                .push(super::shared::TemplateEntry::HoistableDecl(b.stmt(b.call(
                    "$.prevent_snippet_stringification",
                    vec![b.id(&name)],
                ))));
        }
        state
            .template
            .push(super::shared::TemplateEntry::HoistableDecl(fn_decl));
    }
}

/// Build `function <name>($$renderer, ...params) { <body> }` for a snippet.
///
/// All three server call sites go through this: the `SnippetBlock` visitor, a
/// component-child slot snippet and a `<svelte:boundary>` `failed` / `pending`
/// snippet. They must agree on both halves — a parameter reconstructed by name
/// alone drops a destructuring pattern, and a missing shadow frame lets a body
/// read of a parameter constant-fold to the same-named component binding.
pub(super) fn build_snippet_function<'a>(
    node: &SnippetBlock<'a>,
    name: &str,
    state: &mut ServerTransformState<'a>,
) -> oxc_ast::ast::Statement<'a> {
    let b = state.b;

    // -- parameters ---------------------------------------------------------
    // 写经 upstream: `[b.id('$$renderer'), ...node.parameters]` — the declared
    // parameters are spread VERBATIM into the formal-parameter list.
    let mut patterns = vec![b.id_pat("$$renderer")];
    for param in &node.parameters {
        patterns.push(snippet_param_pattern(param, state));
    }
    let mut params = b.params(patterns, None);
    let mut parameter_region_start = node.expression.end().unwrap_or(node.start + 9);
    for (param, formal) in node.parameters.iter().zip(params.items.iter_mut().skip(1)) {
        if let (Some(start), Some(end)) = (param.start(), param.end()) {
            state.place_template_pattern_comments(
                (parameter_region_start, end),
                (start, end),
                &mut formal.pattern,
            );
            parameter_region_start = end;
        }
    }

    // The snippet PARAMETERS shadow any same-named component-level `$derived` /
    // `$store` binding inside the body (upstream `context.state.scope` resolves a
    // body identifier to the snippet parameter, a normal binding, not the
    // component derived). Push the param names as a shadow frame around the body
    // build so e.g. `{#snippet foo(doubled)} {doubled} {/snippet}` does not
    // read-wrap `doubled` to `doubled()`.
    let mut shadow = rustc_hash::FxHashSet::default();
    for param in &node.parameters {
        collect_param_pattern_names(param, &mut shadow);
    }
    // Push to BOTH shadow sets (mirroring the each-block visitor): a snippet
    // parameter is a runtime value, so a body read of a param that shadows a
    // same-named component binding must NOT constant-fold to the outer
    // binding's value (`{#snippet row(count)}` + instance `count = $state('x')`
    // rendered `x` for every `{@render row(…)}`).
    state.slot_let_shadows.push(shadow.clone());
    state.shadowed_names.push(shadow);

    // Body: render the fragment as a `{ ... }` block, then reuse its statements
    // as the function body.
    // SnippetBlock body IS an `is_text_first` parent (upstream `clean_nodes`).
    let saved_scope = state.enter_template_scope(node.start);
    let mut body_block = super::shared::build_fragment_body(&node.body.nodes, true, true, state);
    state.restore_scope(saved_scope);
    if state.options.dev {
        body_block.insert(
            0,
            b.stmt(b.call("$.validate_snippet_args", vec![b.id("$$renderer")])),
        );
    }
    let fn_body = b.body(body_block);

    state.shadowed_names.pop();
    state.slot_let_shadows.pop();

    b.function_declaration(name, params, fn_body, false)
}

/// Collect every binding identifier name introduced by a snippet / slot
/// parameter pattern (`id`, `{ a, b: c }`, `[x, ...y]`, `id = default`). Walks the
/// JSON pattern shape since parameters are stored as `crate::ast::js::Expression`.
/// Used to populate the shadow frame so a parameter shadows a component-level
/// `$derived` / `$store` binding of the same name within the snippet body.
pub(super) fn collect_param_pattern_names(
    expr: &crate::ast::js::Expression,
    out: &mut rustc_hash::FxHashSet<String>,
) {
    collect_pattern_names_json(expr.as_json(), out);
}

fn collect_pattern_names_json(json: &Value, out: &mut rustc_hash::FxHashSet<String>) {
    let ty = json.field("type").and_then(Value::as_str).unwrap_or("");
    match ty {
        "Identifier" => {
            if let Some(name) = json.field("name").and_then(Value::as_str) {
                out.insert(name.to_string());
            }
        }
        "AssignmentPattern" => {
            if let Some(left) = json.field("left") {
                collect_pattern_names_json(left, out);
            }
        }
        "RestElement" => {
            if let Some(arg) = json.field("argument") {
                collect_pattern_names_json(arg, out);
            }
        }
        "ArrayPattern" => {
            if let Some(elems) = json.field("elements").and_then(Value::as_array) {
                for el in elems {
                    if !el.is_null() {
                        collect_pattern_names_json(el, out);
                    }
                }
            }
        }
        "ObjectPattern" => {
            if let Some(props) = json.field("properties").and_then(Value::as_array) {
                for prop in props {
                    let pty = prop.field("type").and_then(Value::as_str).unwrap_or("");
                    if pty == "RestElement" {
                        if let Some(arg) = prop.field("argument") {
                            collect_pattern_names_json(arg, out);
                        }
                    } else if let Some(value) = prop.field("value") {
                        collect_pattern_names_json(value, out);
                    }
                }
            }
        }
        _ => {}
    }
}

/// Strip a top-level TypeScript type annotation from a parameter source slice.
/// Delegates to the server helper used by the text oracle so the two pipelines
/// strip identically (handles `name: type`, destructure `: {…}` annotations, and
/// nested generics / object-type braces).
fn strip_ts_type_annotation(src: &str) -> String {
    crate::compiler::phases::phase3_transform::server::helpers::strip_ts_type_annotation(src)
}
