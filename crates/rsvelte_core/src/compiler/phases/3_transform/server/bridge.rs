//! Bridge module: converts OutputPart → TemplateItem for AST-based code generation.
//!
//! This module provides a conversion layer between the visitor-produced `OutputPart`
//! list and the AST-based `TemplateItem` representation used by `build_template()`.
//!
//! Each OutputPart is converted to one or more `TemplateItem`s:
//!
//! - Expression-like parts (Html, Expression, Comment, etc.) become
//!   `TemplateItem::Expression`, which `build_template()` coalesces into
//!   `$$renderer.push(\`...\`)` template literals.
//!
//! - Statement-like parts with recursive structure (IfBlock, EachBlock) have their
//!   markers emitted as `TemplateItem::Expression` and their bodies recursively
//!   converted, with the generated code wrapped in `TemplateItem::Statement(Raw(...))`.
//!
//! - Complex parts (Component, ComponentWithBindings, SelectElement, OptionElement)
//!   are converted directly using their respective `generate_*` functions from build.rs,
//!   with the results emitted as `TemplateItem::Statement(Raw(...))` and appropriate
//!   marker `TemplateItem::Expression`s for coalescing by `build_template()`.

use super::ServerCodeGenerator;
use super::types::{
    ComponentCodeResult, DynamicComponentWrap, OutputPart, TemplateItem, TrailingMarkerBehavior,
};
use crate::compiler::phases::phase3_transform::js_ast::arena::JsArena;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;
use compact_str::CompactString;

/// Convert an `OutputPart` list to a `TemplateItem` list for AST-based code generation.
///
/// This is the central bridge function. Each part is converted to one or more
/// `TemplateItem`s:
///
/// - Expression-like parts (Html, Expression, HtmlExpression, etc.) become
///   `TemplateItem::Expression`, which `build_template()` coalesces into
///   `$$renderer.push(\`...\`)` template literals.
///
/// - Statement-like parts with recursive structure (IfBlock, EachBlock) have their
///   markers emitted as `TemplateItem::Expression` and their bodies recursively
///   converted, with the generated code wrapped in `TemplateItem::Statement(Raw(...))`.
///
/// - Complex parts (Component, ComponentWithBindings, SelectElement, OptionElement)
///   are converted directly using their respective `generate_*` functions from build.rs,
///   with the results emitted as `TemplateItem::Statement(Raw(...))` and marker expressions.
///
/// # Arguments
///
/// * `parts` - The output parts produced by SSR visitors
/// * `arena` - The JS AST arena for allocating expression nodes
/// * `store_subs` - Store subscription name pairs for the component
/// * `each_counter` - Mutable counter for generating unique each-block variable names
pub(crate) fn output_parts_to_template_items(
    parts: &[OutputPart],
    arena: &JsArena,
    store_subs: &[(&str, &str)],
    each_counter: &mut usize,
) -> Vec<TemplateItem> {
    if parts.is_empty() {
        return Vec::new();
    }

    // Apply hoist_const_and_snippet_declarations (same as build_parts_with_store_subs does).
    let hoisted_parts = ServerCodeGenerator::hoist_const_and_snippet_declarations(parts);
    let parts = &hoisted_parts;

    let mut items: Vec<TemplateItem> = Vec::new();
    let mut textarea_body_counter: usize = 0;

    // Process parts, grouping those that need cross-part HTML coalescing.
    //
    // Parts that need `current_html` coalescing in build_parts_with_store_subs
    // (like AsyncChild, AsyncBlock, Html with backslash, etc.) must be delegated
    // together with their surrounding Expression-like parts. We detect groups
    // of consecutive parts that include such "coalescing-dependent" parts and
    // delegate the entire group at once.
    let mut i = 0;
    while i < parts.len() {
        if needs_coalescing_group(&parts[i]) {
            // Find the group boundaries: extend forward to include following
            // parts until we hit a clean break point.
            let group_end = find_coalescing_group_end(parts, i);
            // Also include preceding Expression-like items that were already
            // converted to TemplateItem::Expression - pull them back so they
            // can be coalesced with the group in build_parts_with_store_subs.
            //
            // We find Expression items at the tail of `items` and replace them
            // with the group delegation output.
            let preceding_expr_start = find_preceding_expression_start(&items);
            let pulled_back_items: Vec<TemplateItem> =
                items.drain(preceding_expr_start..).collect();
            delegate_group_with_preceding(
                &pulled_back_items,
                &parts[i..group_end],
                &parts[group_end..],
                &mut items,
                each_counter,
                store_subs,
            );
            i = group_end;
        } else {
            let remaining = &parts[i + 1..];
            convert_part_to_item(
                &parts[i],
                remaining,
                &mut items,
                arena,
                store_subs,
                each_counter,
                &mut textarea_body_counter,
            );
            i += 1;
        }
    }

    items
}

/// Check if a part needs to be in a "coalescing group" - i.e., it requires
/// cross-part `current_html` coalescing from `build_parts_with_store_subs`.
fn needs_coalescing_group(part: &OutputPart) -> bool {
    match part {
        // AsyncChild/AsyncChildBlock wrap surrounding HTML in async callbacks
        OutputPart::AsyncChild { .. } | OutputPart::AsyncChildBlock { .. } => true,
        // AsyncBlock/AsyncBlockCustom wrap content in async_block callbacks
        OutputPart::AsyncBlock { .. } | OutputPart::AsyncBlockCustom { .. } => true,
        // AsyncWrappedHtml wraps HTML in an async callback
        OutputPart::AsyncWrappedHtml { .. } => true,
        // AsyncWrappedExpression/Custom wrap expressions in async callbacks
        OutputPart::AsyncWrappedExpression { .. }
        | OutputPart::AsyncWrappedExpressionCustom { .. } => true,
        // Html with backslash needs coalescing to avoid double-escaping
        OutputPart::Html(html) | OutputPart::HtmlWithExclusions { html, .. } => {
            if html.contains('\\') {
                return true;
            }
            // Html with await in open tags needs look-ahead
            if super::helpers::html_template_contains_await(html)
                && html.starts_with('<')
                && !html.starts_with("</")
                && !html.starts_with("<!")
            {
                return true;
            }
            false
        }
        // RawExpression/HtmlExpression with await need child_block wrapping
        OutputPart::RawExpression(expr) => super::helpers::expr_contains_await(expr),
        OutputPart::HtmlExpression(expr) => super::helpers::expr_contains_await(expr),
        _ => false,
    }
}

/// Find the end of a coalescing group starting at `start`.
///
/// The group extends forward to include all consecutive parts that are either
/// coalescing-dependent or Expression-like (can be in the same push call).
/// It stops at a "clean break" - a statement-level part that produces its own
/// output or a part that handles its own coalescing (SvelteBoundary).
fn find_coalescing_group_end(parts: &[OutputPart], start: usize) -> usize {
    let mut end = start + 1;
    while end < parts.len() {
        let part = &parts[end];
        // Stop at statement-level parts that produce their own complete output
        if matches!(
            part,
            OutputPart::IfBlock { .. }
                | OutputPart::EachBlock { .. }
                | OutputPart::ConstDeclaration(_)
                | OutputPart::VarDeclaration(_)
                | OutputPart::RawStatement(_)
                | OutputPart::ConstBlockerMetadata { .. }
                | OutputPart::Flush
        ) {
            break;
        }
        // Stop at SvelteBoundary (handled directly in convert_part_to_item)
        if matches!(part, OutputPart::SvelteBoundary { .. }) {
            break;
        }
        end += 1;
    }
    end
}

/// Find the index of the first trailing Expression item in the items list
/// that should be pulled back for coalescing with a group.
///
/// Returns the index where Expression items start at the tail. If the last
/// item is not an Expression, returns `items.len()` (nothing to pull back).
fn find_preceding_expression_start(items: &[TemplateItem]) -> usize {
    let mut start = items.len();
    while start > 0 {
        match &items[start - 1] {
            TemplateItem::Expression(_) => {
                start -= 1;
            }
            _ => break,
        }
    }
    start
}

/// Delegate a group of parts to `build_parts_with_store_subs`, including
/// preceding Expression items that need to coalesce with the group.
fn delegate_group_with_preceding(
    preceding_exprs: &[TemplateItem],
    group: &[OutputPart],
    remaining_after_group: &[OutputPart],
    items: &mut Vec<TemplateItem>,
    each_counter: &mut usize,
    store_subs: &[(&str, &str)],
) {
    // Convert preceding Expression items back to OutputParts for co-delegation.
    let mut combined_parts: Vec<OutputPart> = Vec::new();
    for item in preceding_exprs {
        match item {
            TemplateItem::Expression(JsExpr::Literal(JsLiteral::String(s))) => {
                combined_parts.push(OutputPart::Html(s.to_string()));
            }
            TemplateItem::Expression(JsExpr::Raw(s)) => {
                combined_parts.push(OutputPart::RawExpression(s.to_string()));
            }
            _ => {
                // Non-convertible items: emit directly and don't include in group
                items.push(item.clone());
            }
        }
    }
    combined_parts.extend_from_slice(group);

    let code = ServerCodeGenerator::build_parts_with_store_subs(
        &combined_parts,
        0,
        each_counter,
        store_subs,
    );
    let trimmed = code.trim();
    if trimmed.is_empty() {
        return;
    }

    // Try to extract a trailing push for coalescing with subsequent parts
    if let Some((main_code, trailing_exprs)) = extract_trailing_push(trimmed) {
        let main_trimmed = main_code.trim();
        if !main_trimmed.is_empty() {
            items.push(TemplateItem::Statement(JsStatement::Raw(
                CompactString::new(main_trimmed),
            )));
        }
        for expr in trailing_exprs {
            items.push(expr);
        }
    } else {
        items.push(TemplateItem::Statement(JsStatement::Raw(
            CompactString::new(trimmed),
        )));
    }

    // Check if last part in group needs component marker compensation
    if let Some(last_part) = group.last()
        && needs_component_marker_compensation(last_part)
    {
        let has_more = remaining_after_group.iter().any(|p| {
            !matches!(
                p,
                OutputPart::Html(s) | OutputPart::HtmlWithExclusions { html: s, .. }
                if s.trim().is_empty()
            )
        });
        if has_more {
            items.push(TemplateItem::Expression(JsExpr::Literal(
                JsLiteral::String("<!---->".into()),
            )));
        }
    }
}

/// Convert a single OutputPart to one or more TemplateItem(s).
///
/// Simple parts (Html, Expression, Comment, etc.) are converted directly to
/// TemplateItem::Expression or TemplateItem::Statement. IfBlock and EachBlock are
/// handled with recursive body processing. All other complex parts (Component,
/// AwaitBlock, SvelteBoundary, etc.) are delegated to `build_parts_with_store_subs`
/// via `delegate_single_part()`.
///
/// The `remaining_parts` parameter provides the parts after the current one,
/// needed for look-ahead checks (e.g., `has_more_content` for Component markers).
fn convert_part_to_item(
    part: &OutputPart,
    remaining_parts: &[OutputPart],
    items: &mut Vec<TemplateItem>,
    _arena: &JsArena,
    store_subs: &[(&str, &str)],
    each_counter: &mut usize,
    textarea_body_counter: &mut usize,
) {
    match part {
        OutputPart::Html(html) | OutputPart::HtmlWithExclusions { html, .. } => {
            // NOTE: Html parts with backslashes and await-open-tags are handled
            // by the coalescing group logic in the main loop (needs_coalescing_group).
            // They should not reach here. If they do, fall through to the normal path.
            if html.contains("${") {
                split_html_interpolations(html, items);
            } else {
                // Guard against accidental `${` sequences formed by concatenation
                if html.starts_with('{')
                    && matches!(
                        items.last(),
                        Some(TemplateItem::Expression(JsExpr::Literal(
                            JsLiteral::String(s)
                        ))) if s.ends_with('$')
                    )
                    && let Some(TemplateItem::Expression(JsExpr::Literal(JsLiteral::String(prev)))) =
                        items.last_mut()
                {
                    let len = prev.len();
                    prev.insert(len - 1, '\\');
                }
                items.push(TemplateItem::Expression(JsExpr::Literal(
                    JsLiteral::String(CompactString::new(html)),
                )));
            }
        }

        OutputPart::Expression(expr) => {
            items.push(TemplateItem::Expression(JsExpr::Raw(CompactString::new(
                format!("$.escape({})", expr),
            ))));
        }

        OutputPart::AsyncExpression { expr, has_save } => {
            let transformed_expr = if *has_save {
                super::helpers::transform_await_to_save(expr)
            } else {
                expr.clone()
            };
            let async_kw = if super::helpers::expr_contains_await(&transformed_expr) {
                "async "
            } else {
                ""
            };
            items.push(TemplateItem::Statement(JsStatement::Raw(
                CompactString::new(format!(
                    "$$renderer.push({}() => $.escape({}));",
                    async_kw, transformed_expr
                )),
            )));
        }

        OutputPart::RawExpression(expr) => {
            // NOTE: RawExpression with await is handled by coalescing group logic.
            items.push(TemplateItem::Expression(JsExpr::Raw(CompactString::new(
                expr,
            ))));
        }

        OutputPart::HtmlExpression(expr) => {
            // NOTE: HtmlExpression with await is handled by coalescing group logic.
            items.push(TemplateItem::Expression(JsExpr::Raw(CompactString::new(
                format!("$.html({})", expr),
            ))));
        }

        OutputPart::Comment => {
            items.push(TemplateItem::Expression(JsExpr::Literal(
                JsLiteral::String("<!---->".into()),
            )));
        }

        OutputPart::HydrationAnchor => {
            items.push(TemplateItem::Expression(JsExpr::Literal(
                JsLiteral::String("<!>".into()),
            )));
        }

        OutputPart::Flush => {
            items.push(TemplateItem::Statement(JsStatement::Raw("".into())));
        }

        OutputPart::ConstDeclaration(decl) => {
            items.push(TemplateItem::Statement(JsStatement::Raw(
                CompactString::new(format!("const {};", decl)),
            )));
        }

        OutputPart::VarDeclaration(decl) => {
            items.push(TemplateItem::Statement(JsStatement::Raw(
                CompactString::new(format!("var {};", decl)),
            )));
        }

        OutputPart::RawStatement(stmt) => {
            items.push(TemplateItem::Statement(JsStatement::Raw(
                CompactString::new(stmt),
            )));
        }

        OutputPart::ConstBlockerMetadata { .. } => {
            // Metadata-only, not rendered
        }

        OutputPart::IfBlock {
            test_expr,
            consequent_body,
            alternate_body,
            is_elseif: _,
        } => {
            convert_if_block(
                test_expr,
                consequent_body,
                alternate_body,
                items,
                _arena,
                store_subs,
                each_counter,
            );
        }

        OutputPart::EachBlock {
            iterable,
            context_name,
            index_name,
            index_alias,
            body,
            fallback,
        } => {
            convert_each_block(
                iterable,
                context_name,
                index_name,
                index_alias,
                body,
                fallback,
                items,
                _arena,
                store_subs,
                each_counter,
            );
        }

        // TextareaBody: handle directly to maintain cross-part $$body counter.
        OutputPart::TextareaBody { value_expr } => {
            let var_name = if *textarea_body_counter == 0 {
                "$$body".to_string()
            } else {
                format!("$$body_{}", textarea_body_counter)
            };
            *textarea_body_counter += 1;

            items.push(TemplateItem::Statement(JsStatement::Raw(
                CompactString::new(format!(
                    "const {} = $.escape({});\n\nif ({}) {{\n\t$$renderer.push(`${{{}}}`);\n}} else {{}}",
                    var_name, value_expr, var_name, var_name
                )),
            )));
        }

        // ContentEditableBody: handle directly to maintain cross-part $$body counter.
        OutputPart::ContentEditableBody {
            value_expr,
            children_body,
        } => {
            convert_content_editable_body(
                value_expr,
                children_body,
                items,
                _arena,
                store_subs,
                each_counter,
                textarea_body_counter,
            );
        }

        // Complex parts: delegate each individually to build_parts_with_store_subs.
        // This allows block markers and expressions around them to be properly
        // coalesced by build_template().
        // SvelteBoundary: per upstream feat: allow error boundaries to work on the
        // server (5.53.0) the open/close markers are emitted as separate
        // $$renderer.push() statements rather than fusing with surrounding HTML.
        // When a failed snippet/attribute is present, the whole sequence is
        // wrapped in $$renderer.boundary({...}, ($$renderer) => { ... });
        OutputPart::SvelteBoundary {
            body,
            is_pending,
            failed_props,
        } => {
            let open_marker = if *is_pending { "<!--[!-->" } else { "<!--[-->" };
            let inner_body_code =
                generate_inner_body_code(body, _arena, store_subs, each_counter, 1);

            let inner = {
                let mut s = String::new();
                s.push_str(&format!("$$renderer.push(`{}`);\n\n", open_marker));
                s.push_str("{\n");
                s.push_str(&inner_body_code);
                s.push_str("}\n\n");
                s.push_str("$$renderer.push(`<!--]-->`);");
                s
            };

            if let Some(props) = failed_props {
                let mut code = String::new();
                code.push_str(&format!(
                    "$$renderer.boundary({}, ($$renderer) => {{\n",
                    props
                ));
                for line in inner.lines() {
                    if line.is_empty() {
                        code.push('\n');
                    } else {
                        code.push('\t');
                        code.push_str(line);
                        code.push('\n');
                    }
                }
                code.push_str("});");
                items.push(TemplateItem::Statement(JsStatement::Raw(
                    CompactString::new(code),
                )));
            } else {
                // Emit each marker as its own Statement so it doesn't fuse with
                // adjacent HTML via Expression coalescing.
                items.push(TemplateItem::Statement(JsStatement::Raw(
                    CompactString::new(format!("$$renderer.push(`{}`);", open_marker)),
                )));
                let block_code = format!("{{\n{}}}", inner_body_code);
                let trimmed = block_code.trim();
                if !trimmed.is_empty() {
                    items.push(TemplateItem::Statement(JsStatement::Raw(
                        CompactString::new(trimmed),
                    )));
                }
                items.push(TemplateItem::Statement(JsStatement::Raw(
                    CompactString::new("$$renderer.push(`<!--]-->`);"),
                )));
            }
        }

        // BlockScope: wrap body in { }
        OutputPart::BlockScope { body } => {
            convert_block_scope(body, items, store_subs, each_counter);
        }

        // RenderCall: emit call_str; + optional <!----> marker
        OutputPart::RenderCall {
            call_str,
            skip_boundary,
        } => {
            convert_render_call(call_str, *skip_boundary, items);
        }

        // SnippetFunction: function name($$renderer, params) { body }
        OutputPart::SnippetFunction {
            name,
            params,
            body,
            dev: snippet_dev,
        } => {
            convert_snippet_function(
                name,
                params,
                body,
                *snippet_dev,
                items,
                store_subs,
                each_counter,
            );
        }

        // SvelteHead: $.head('hash', $$renderer, ($$renderer) => { body });
        OutputPart::SvelteHead { hash, body } => {
            convert_svelte_head(hash, body, items, store_subs, each_counter);
        }

        // TitleElement: $$renderer.title(($$renderer) => { body });
        OutputPart::TitleElement { body } => {
            convert_title_element(body, items, store_subs, each_counter);
        }

        // Component: direct generation via generate_component_call_code
        OutputPart::Component {
            name,
            props_and_spreads,
            has_prior_content,
            children,
            snippets,
            slot_names,
            dynamic,
            let_directives,
            css_custom_props,
            css_props_is_html,
            in_async_block,
            attach_expressions: _,
            dev,
            hmr,
        } => {
            let result = ServerCodeGenerator::generate_component_call_code(
                name,
                props_and_spreads,
                *has_prior_content,
                children,
                snippets,
                slot_names,
                *dynamic,
                let_directives,
                css_custom_props,
                *css_props_is_html,
                *in_async_block,
                *dev,
                *hmr,
                each_counter,
                store_subs,
            );
            convert_component_result(result, remaining_parts, items, _arena);
        }

        // ComponentWithBindings: direct generation via generate_component_with_bindings_call_code
        OutputPart::ComponentWithBindings {
            name,
            props_and_spreads,
            bindings,
            has_prior_content,
            children,
            snippets,
            slot_names,
            dynamic,
            css_custom_props: _,
            css_props_is_html: _,
            seq_bindings_hoisted: _,
            dev,
        } => {
            let result = ServerCodeGenerator::generate_component_with_bindings_call_code(
                name,
                props_and_spreads,
                bindings,
                *has_prior_content,
                children,
                snippets,
                slot_names,
                *dynamic,
                *dev,
                each_counter,
                store_subs,
            );
            convert_component_result(result, remaining_parts, items, _arena);
        }

        // SelectElement: $$renderer.select() call
        OutputPart::SelectElement {
            attrs_obj,
            body,
            is_rich,
            css_hash,
            classes,
        } => {
            convert_select_element(
                attrs_obj,
                body,
                *is_rich,
                css_hash.as_deref(),
                classes.as_deref(),
                items,
                store_subs,
                each_counter,
            );
        }

        // OptionElement: $$renderer.option() call
        OutputPart::OptionElement {
            attr_entries,
            body,
            is_rich,
            direct_value,
            css_hash,
            classes,
            dev_location,
        } => {
            convert_option_element(
                attr_entries,
                body,
                *is_rich,
                direct_value.as_deref(),
                css_hash.as_deref(),
                classes.as_deref(),
                *dev_location,
                items,
                store_subs,
                each_counter,
            );
        }

        // AwaitBlock: $.await($$renderer, promise, pending_fn, then_fn)
        OutputPart::AwaitBlock {
            promise,
            then_param,
            pending_body,
            then_body,
            has_await,
            ..
        } => {
            convert_await_block(
                promise,
                then_param,
                pending_body,
                then_body,
                *has_await,
                items,
                store_subs,
                each_counter,
            );
        }

        // SvelteBoundaryWithPending: if/else with markers
        OutputPart::SvelteBoundaryWithPending {
            pending_expr,
            pending_body,
            main_body,
            failed_props,
        } => {
            convert_svelte_boundary_with_pending(
                pending_expr,
                pending_body,
                main_body,
                failed_props.as_deref(),
                items,
                store_subs,
                each_counter,
            );
        }

        // SvelteElement: $.element($$renderer, tag, attrs, children)
        OutputPart::SvelteElement {
            tag_expr,
            attrs_expr,
            body,
            dev,
        } => {
            convert_svelte_element(
                tag_expr,
                attrs_expr,
                body,
                *dev,
                items,
                store_subs,
                each_counter,
            );
        }

        // Slot: $.slot($$renderer, $$props, name, props, fallback)
        OutputPart::Slot {
            name,
            props_expr,
            fallback,
        } => {
            convert_slot(name, props_expr, fallback, items, store_subs, each_counter);
        }

        // Async variants: normally go through the coalescing group path
        // (needs_coalescing_group returns true). Keep delegation as safety net.
        OutputPart::AsyncBlock { .. }
        | OutputPart::AsyncBlockCustom { .. }
        | OutputPart::AsyncWrappedExpression { .. }
        | OutputPart::AsyncWrappedExpressionCustom { .. }
        | OutputPart::AsyncWrappedHtml { .. }
        | OutputPart::AsyncChild { .. }
        | OutputPart::AsyncChildBlock { .. } => {
            delegate_single_part(part, remaining_parts, items, each_counter, store_subs);
        }
    }
}

/// Convert a `ComponentCodeResult` to `TemplateItem`s.
///
/// Emits:
/// 1. A leading `<!---->` marker if `needs_leading_marker` is true (dynamic components).
/// 2. The component code as a `TemplateItem::Statement(Raw(...))`.
/// 3. A trailing `<!---->` marker based on the `trailing_marker` behavior:
///    - `None`: no marker
///    - `Always`: always add marker
///    - `Conditional { has_prior_content }`: add if `has_prior_content` OR there
///      is more content in `remaining_parts`.
fn convert_component_result(
    result: ComponentCodeResult,
    remaining_parts: &[OutputPart],
    items: &mut Vec<TemplateItem>,
    arena: &JsArena,
) {
    // Leading marker for dynamic components.
    // This must be a separate $$renderer.push('<!---->') statement, NOT an Expression
    // that coalesces with preceding HTML. The official compiler flushes current_html
    // first, then emits $$renderer.push('<!---->') as a separate push call.
    if result.needs_leading_marker {
        items.push(TemplateItem::Statement(JsStatement::Raw(
            CompactString::new("$$renderer.push('<!---->');"),
        )));
    }

    // The component call code
    let trimmed = result.code.trim();
    if !trimmed.is_empty() {
        if let Some(wrap) = result.dynamic_wrap {
            // Build a `JsStatement::If` so the codegen handles indentation
            // for the if/else blocks naturally (Svelte 5.52+ hydration
            // guard for dynamic components).
            push_dynamic_component_if_else(trimmed, &wrap, items, arena);
        } else {
            items.push(TemplateItem::Statement(JsStatement::Raw(
                CompactString::new(trimmed),
            )));
        }
    }

    // Trailing marker
    match result.trailing_marker {
        TrailingMarkerBehavior::None => {}
        TrailingMarkerBehavior::Always => {
            items.push(TemplateItem::Expression(JsExpr::Literal(
                JsLiteral::String("<!---->".into()),
            )));
        }
        TrailingMarkerBehavior::Conditional { has_prior_content } => {
            let has_more = remaining_parts.iter().any(|p| {
                !matches!(
                    p,
                    OutputPart::Html(s) | OutputPart::HtmlWithExclusions { html: s, .. }
                    if s.trim().is_empty()
                )
            });
            if has_prior_content || has_more {
                items.push(TemplateItem::Expression(JsExpr::Literal(
                    JsLiteral::String("<!---->".into()),
                )));
            }
        }
    }
}

/// Add `extra` to every non-empty line *after* the first of `code`.
///
/// Used to lift a multi-line `JsStatement::Raw` block down one indent level
/// when nesting it inside another structured statement (e.g. inside an
/// `if (test) { ... }` consequent). The first line gets its indent from the
/// surrounding codegen, but subsequent lines emit verbatim and need to
/// carry the relative indent themselves.
fn reindent_multiline_raw(code: &str, extra: &str) -> String {
    let mut out = String::with_capacity(code.len() + extra.len() * 8);
    let mut first = true;
    for line in code.split_inclusive('\n') {
        if first {
            first = false;
            out.push_str(line);
            continue;
        }
        // Don't prefix empty or whitespace-only lines.
        if line.trim_start_matches([' ', '\t']).is_empty() {
            out.push_str(line);
        } else {
            out.push_str(extra);
            out.push_str(line);
        }
    }
    out
}

/// Build a `JsStatement::If` wrapping the component call code in Svelte
/// 5.52's hydration guard:
///
/// ```text
/// if (test) {
///   $$renderer.push('<!--[-->');
///   <call_code>
///   $$renderer.push('<!--]-->');
/// } else {
///   $$renderer.push('<!--[!-->');
///   $$renderer.push('<!--]-->');
/// }
/// ```
///
/// For the `has_css_props` case the `call_code` looks like
/// `$.css_props($$renderer, ..., () => { <inner_call> }, true);` and we want
/// the guard to wrap just `<inner_call>` (so the markers live inside the
/// `$.css_props` callback). Rather than parse JS, we surgically substitute
/// the inner call portion of the raw string.
fn push_dynamic_component_if_else(
    call_code: &str,
    wrap: &DynamicComponentWrap,
    items: &mut Vec<TemplateItem>,
    arena: &JsArena,
) {
    if wrap.has_css_props {
        // Surgically wrap just the inner call. The `call_code` looks like:
        //     \n$.css_props($$renderer, ..., () => {\n\t<inner>\n}, true);\n
        // We split on `() => {` and the trailing `}, true);`.
        if let (Some(open_idx), Some(close_idx)) =
            (call_code.find("() => {\n"), call_code.rfind("\n}, true);"))
            && close_idx > open_idx
        {
            let body_start = open_idx + "() => {\n".len();
            let body_end = close_idx + 1; // include trailing `\n`
            let prefix = &call_code[..body_start];
            let body = &call_code[body_start..body_end];
            let suffix = &call_code[body_end..];

            // The body has a leading `\t` on each line. We need to:
            //   1. Emit the prefix verbatim (ends just past `() => {\n`).
            //   2. Build an `if (test) { ... } else { ... }` with the body
            //      raw-statement as the consequent body, and the markers.
            //   3. Emit the suffix verbatim (the closing `}, true);`).
            //
            // Concretely we just bake everything into a single Raw string —
            // this avoids changing the bridge's TemplateItem shape for the
            // css_props case. Indentation will be slightly off, but the
            // existing css_props fixtures already accept this style.
            let mut combined =
                String::with_capacity(prefix.len() + body.len() + suffix.len() + 256);
            combined.push_str(prefix);
            combined.push_str("\tif (");
            combined.push_str(&wrap.test);
            combined.push_str(") {\n");
            combined.push_str("\t\t$$renderer.push('<!--[-->');\n");
            // Re-indent each body line by one extra `\t`.
            for line in body.split_inclusive('\n') {
                if line.trim_start_matches([' ', '\t']).is_empty() {
                    combined.push_str(line);
                } else {
                    combined.push('\t');
                    combined.push_str(line);
                }
            }
            combined.push_str("\t\t$$renderer.push('<!--]-->');\n");
            combined.push_str("\t} else {\n");
            combined.push_str("\t\t$$renderer.push('<!--[!-->');\n");
            combined.push_str("\t\t$$renderer.push('<!--]-->');\n");
            combined.push_str("\t}\n");
            combined.push_str(suffix);
            items.push(TemplateItem::Statement(JsStatement::Raw(
                CompactString::new(combined.trim()),
            )));
            return;
        }
        // Fallback: just emit raw without the if/else.
        items.push(TemplateItem::Statement(JsStatement::Raw(
            CompactString::new(call_code),
        )));
        return;
    }

    // Non-css-props case: build a proper `JsStatement::If` so codegen
    // handles indentation for us.
    //
    // We re-indent the call code by one extra `\t` on each non-empty line so
    // that multi-line component calls (with `children:` props, nested
    // components, etc.) end up at the correct relative depth inside the
    // `if (test) { ... }` block: the codegen prepends the surrounding
    // indent to the first line of each Raw statement, but subsequent lines
    // of the Raw stay verbatim, so they need to carry the extra indent
    // themselves.
    let test_expr = arena.alloc_expr(JsExpr::Raw(CompactString::new(&wrap.test)));
    let reindented_call = reindent_multiline_raw(call_code, "\t");
    let consequent_block = JsBlockStatement {
        body: vec![
            JsStatement::Raw(CompactString::new("$$renderer.push('<!--[-->');")),
            JsStatement::Raw(CompactString::new(&reindented_call)),
            JsStatement::Raw(CompactString::new("$$renderer.push('<!--]-->');")),
        ],
    };
    let alternate_block = JsBlockStatement {
        body: vec![
            JsStatement::Raw(CompactString::new("$$renderer.push('<!--[!-->');")),
            JsStatement::Raw(CompactString::new("$$renderer.push('<!--]-->');")),
        ],
    };
    let consequent = arena.alloc_stmt(JsStatement::Block(consequent_block));
    let alternate = arena.alloc_stmt(JsStatement::Block(alternate_block));
    items.push(TemplateItem::Statement(JsStatement::If(JsIfStatement {
        test: test_expr,
        consequent,
        alternate: Some(alternate),
    })));
}

/// Check if a Component/ComponentWithBindings part needs marker compensation.
///
/// Returns true when the part is a Component or ComponentWithBindings with
/// `has_prior_content=false` and `in_async_block=false`, meaning the single-part
/// delegation would NOT have emitted a `<!---->` marker (because `has_more_content`
/// was false due to empty look-ahead), but it should have if there are more parts.
fn needs_component_marker_compensation(part: &OutputPart) -> bool {
    match part {
        OutputPart::Component {
            has_prior_content,
            in_async_block,
            ..
        } => !has_prior_content && !in_async_block,
        OutputPart::ComponentWithBindings {
            has_prior_content, ..
        } => !has_prior_content,
        _ => false,
    }
}

/// Build the trailing `$$renderer.select` / `$$renderer.option` arguments
/// (upstream: `b.call(..., attributes, fn, css_hash, classes, styles, flags)`
/// with `true` appended for customizable selects; upstream `b.call` drops
/// trailing `undefined` arguments and esrap prints interior ones as `void 0`).
pub(crate) fn select_rest_args(
    css_hash: Option<&str>,
    classes: Option<&str>,
    is_rich: bool,
) -> Vec<String> {
    let mut rest: Vec<Option<String>> = vec![
        css_hash.map(|h| format!("'{}'", h)),
        classes.map(|c| c.to_string()),
    ];
    if is_rich {
        // styles, flags, then the customizable-select `true`
        rest.push(None);
        rest.push(None);
        rest.push(Some("true".to_string()));
    }
    while rest.last().is_some_and(|o| o.is_none()) {
        rest.pop();
    }
    rest.into_iter()
        .map(|o| o.unwrap_or_else(|| "void 0".to_string()))
        .collect()
}

/// Append the closing of a `$$renderer.select` / `$$renderer.option` call:
/// `});` when there are no trailing args, otherwise the multiline
/// `\t},\n\targ,\n...\n);` form.
pub(crate) fn push_call_close(code: &mut String, rest: &[String]) {
    if rest.is_empty() {
        code.push_str("});");
    } else {
        code.push_str("\t},");
        for arg in rest {
            code.push_str(&format!("\n\t{},", arg));
        }
        code.pop(); // strip the trailing comma
        code.push_str("\n);");
    }
}

/// Convert a `SelectElement` to `TemplateItem`s.
///
/// Generates `$$renderer.select(attrs, ($$renderer) => { ... }, ...)` calls.
#[allow(clippy::too_many_arguments)]
fn convert_select_element(
    attrs_obj: &str,
    body: &[OutputPart],
    is_rich: bool,
    css_hash: Option<&str>,
    classes: Option<&str>,
    items: &mut Vec<TemplateItem>,
    store_subs: &[(&str, &str)],
    each_counter: &mut usize,
) {
    let mut code = String::new();
    let rest = select_rest_args(css_hash, classes, is_rich);

    // Generate $$renderer.select() call with multiline formatting when
    // trailing args are present
    if !rest.is_empty() {
        code.push_str(&format!(
            "$$renderer.select(\n\t{},\n\t($$renderer) => {{\n",
            attrs_obj
        ));
    } else {
        code.push_str(&format!(
            "$$renderer.select({}, ($$renderer) => {{\n",
            attrs_obj
        ));
    }

    // Body
    let body_code = generate_inner_body_code_direct(body, store_subs, each_counter, 2);
    code.push_str(&body_code);

    // Close callback with optional css_hash, classes, styles, flags and is_rich arguments
    push_call_close(&mut code, &rest);

    let trimmed = code.trim();
    if !trimmed.is_empty() {
        items.push(TemplateItem::Statement(JsStatement::Raw(
            CompactString::new(trimmed),
        )));
    }
}

/// Convert an `OptionElement` to `TemplateItem`s.
///
/// Generates `$$renderer.option(attrs, ...)` calls with various argument formats.
#[allow(clippy::too_many_arguments)]
fn convert_option_element(
    attr_entries: &[String],
    body: &[OutputPart],
    is_rich: bool,
    direct_value: Option<&str>,
    css_hash: Option<&str>,
    classes: Option<&str>,
    dev_location: Option<(usize, usize)>,
    items: &mut Vec<TemplateItem>,
    store_subs: &[(&str, &str)],
    each_counter: &mut usize,
) {
    let mut code = String::new();
    let rest = select_rest_args(css_hash, classes, is_rich);

    let attrs_str = attr_entries.join(", ");
    let attrs_obj = if attrs_str.is_empty() {
        "{}".to_string()
    } else {
        format!("{{ {} }}", attrs_str)
    };

    // Helper: dev mode push_element string
    let dev_push = if let Some((line, col)) = dev_location {
        format!("$.push_element($$renderer, 'option', {}, {});\n", line, col)
    } else {
        String::new()
    };

    if let Some(value_expr) = direct_value {
        // Direct value (from synthetic_value_node)
        if rest.is_empty() {
            code.push_str(&format!(
                "$$renderer.option({}, {});",
                attrs_obj, value_expr
            ));
        } else {
            code.push_str(&format!(
                "$$renderer.option(\n\t{},\n\t{},",
                attrs_obj, value_expr
            ));
            for arg in &rest {
                code.push_str(&format!("\n\t{},", arg));
            }
            code.pop(); // strip the trailing comma
            code.push_str("\n);");
        }
    } else if !rest.is_empty() {
        // Trailing args (css_hash / classes / customizable `true`):
        // multiline formatting
        code.push_str(&format!(
            "$$renderer.option(\n\t{},\n\t($$renderer) => {{\n",
            attrs_obj
        ));

        if !dev_push.is_empty() {
            code.push_str(&format!("\t\t{}", dev_push));
        }

        let body_code = generate_inner_body_code_direct(body, store_subs, each_counter, 2);
        code.push_str(&body_code);

        if !dev_push.is_empty() {
            code.push_str("\t\t$.pop_element();\n");
        }

        push_call_close(&mut code, &rest);
    } else {
        // Simple case
        code.push_str(&format!(
            "$$renderer.option({}, ($$renderer) => {{\n",
            attrs_obj
        ));

        if !dev_push.is_empty() {
            code.push_str(&format!("\t{}", dev_push));
        }

        let body_code = generate_inner_body_code_direct(body, store_subs, each_counter, 1);
        code.push_str(&body_code);

        if !dev_push.is_empty() {
            code.push_str("\t$.pop_element();\n");
        }

        code.push_str("});");
    }

    let trimmed = code.trim();
    if !trimmed.is_empty() {
        items.push(TemplateItem::Statement(JsStatement::Raw(
            CompactString::new(trimmed),
        )));
    }
}

/// Delegate a single OutputPart to `build_parts_with_store_subs` and push
/// the result as `TemplateItem`s.
///
/// Used as a safety net for async variants that should normally go through the
/// coalescing group path. If they reach convert_part_to_item, this fallback
/// ensures correct output.
///
/// If the delegated code ends with a simple `$$renderer.push(\`...\`);` or
/// `$$renderer.push('...');` call, the trailing push content is extracted and
/// emitted as a `TemplateItem::Expression` so it can coalesce with subsequent
/// expression items in `build_template()`.
fn delegate_single_part(
    part: &OutputPart,
    _remaining_parts: &[OutputPart],
    items: &mut Vec<TemplateItem>,
    each_counter: &mut usize,
    store_subs: &[(&str, &str)],
) {
    let code = ServerCodeGenerator::build_parts_with_store_subs(
        std::slice::from_ref(part),
        0,
        each_counter,
        store_subs,
    );
    let trimmed = code.trim();
    if trimmed.is_empty() {
        return;
    }

    // Try to extract a leading marker push (like $$renderer.push('<!--[-->');)
    // so that it can coalesce with preceding Expression items in build_template().
    let trimmed = if let Some((marker, rest)) = extract_leading_marker_push(trimmed) {
        items.push(TemplateItem::Expression(JsExpr::Literal(
            JsLiteral::String(CompactString::new(marker)),
        )));
        rest.trim()
    } else {
        trimmed
    };

    if trimmed.is_empty() {
        return;
    }

    // Try to extract a trailing $$renderer.push(`...`); or $$renderer.push('...');
    // so that it can coalesce with subsequent Expression items in build_template().
    if let Some((main_code, trailing_exprs)) = extract_trailing_push(trimmed) {
        let main_trimmed = main_code.trim();
        if !main_trimmed.is_empty() {
            items.push(TemplateItem::Statement(JsStatement::Raw(
                CompactString::new(main_trimmed),
            )));
        }
        for expr in trailing_exprs {
            items.push(expr);
        }
    } else {
        items.push(TemplateItem::Statement(JsStatement::Raw(
            CompactString::new(trimmed),
        )));
    }
}

/// Try to extract a trailing `$$renderer.push(\`...\`);` or `$$renderer.push('...');`
/// from delegated code. Returns `Some((remaining_code, extracted_expressions))` if found.
///
/// This handles template literals with `${...}` interpolations by splitting them into
/// literal and raw expression items, matching the `split_html_interpolations` logic.
fn extract_trailing_push(code: &str) -> Option<(&str, Vec<TemplateItem>)> {
    let prefix = "$$renderer.push(`";
    let prefix_sq = "$$renderer.push('";

    // Find the last occurrence of $$renderer.push(
    let last_push_start = code.rfind("$$renderer.push(")?;

    // Check that this push is at the start of a line (after a newline or at pos 0)
    // and nothing non-whitespace follows its closing ");
    let before = &code[..last_push_start];
    let before_trimmed = before.trim_end();

    // The push must be preceded by only whitespace on its line (or be at start)
    let line_start = before.rfind('\n').map(|p| p + 1).unwrap_or(0);
    let line_prefix = &code[line_start..last_push_start];
    if !line_prefix.chars().all(|c| c.is_whitespace()) {
        return None;
    }

    let push_content = &code[last_push_start..];

    if let Some(rest) = push_content.strip_prefix(prefix) {
        // Template literal: find matching backtick
        let end = find_template_literal_end(rest)?;
        let inner = &rest[..end];
        let after_backtick = &rest[end + 1..];
        let after_close = after_backtick.strip_prefix(");")?;

        // Nothing meaningful after the closing ");
        if !after_close.trim().is_empty() {
            return None;
        }

        // Skip extraction if the content contains backslashes, as re-inserting
        // it into a JsExpr::Literal would cause sanitize_template_string to
        // double-escape them.
        if inner.contains('\\') {
            return None;
        }

        let main_code = before_trimmed;
        let mut exprs = Vec::new();

        // Split the template literal content into expressions
        if inner.contains("${") {
            split_html_interpolations(inner, &mut exprs);
        } else {
            exprs.push(TemplateItem::Expression(JsExpr::Literal(
                JsLiteral::String(CompactString::new(inner)),
            )));
        }

        Some((main_code, exprs))
    } else if let Some(rest) = push_content.strip_prefix(prefix_sq) {
        // Single-quoted string: find closing '
        let end = rest.find("');")?;
        let inner = &rest[..end];
        let after = &rest[end + 3..];

        if !after.trim().is_empty() {
            return None;
        }

        let main_code = before_trimmed;
        let exprs = vec![TemplateItem::Expression(JsExpr::Literal(
            JsLiteral::String(CompactString::new(inner)),
        ))];

        Some((main_code, exprs))
    } else {
        None
    }
}

/// Try to extract a leading `$$renderer.push('...');` from delegated code,
/// but ONLY if the content is a simple HTML marker (like `<!--[-->`, `<!--]-->`,
/// `<!--[!-->`, `<!---->`). This allows the marker to coalesce with preceding
/// Expression items in `build_template()`.
///
/// Returns `Some((marker_content, remaining_code))` if a leading marker push was found.
/// Does NOT extract non-marker content (like `$$renderer.push('<!---->')` from
/// dynamic components) to avoid breaking intended separate push calls.
fn extract_leading_marker_push(code: &str) -> Option<(&str, &str)> {
    // Only extract single-quoted pushes with HTML comment markers
    let prefix_sq = "$$renderer.push('";
    if let Some(rest) = code.strip_prefix(prefix_sq) {
        let end = rest.find("');")?;
        let inner = &rest[..end];

        // Only extract block markers that should coalesce with adjacent HTML.
        // Do NOT extract "<!---->" (component/hydration marker) or "<!>" as
        // those are intentionally separate push calls.
        if matches!(inner, "<!--[-->" | "<!--]-->" | "<!--[!-->") {
            let after = &rest[end + 3..];
            let after_trimmed = after.trim_start_matches('\n');
            // There must be more code after
            if !after_trimmed.trim().is_empty() {
                return Some((inner, after_trimmed));
            }
        }
    }

    // Also extract backtick-quoted markers
    let prefix = "$$renderer.push(`";
    if let Some(rest) = code.strip_prefix(prefix) {
        // Find the closing backtick (simple case - no interpolations for markers)
        if let Some(end) = rest.find("`);\n").or_else(|| rest.find("`);")) {
            let inner = &rest[..end];
            if matches!(inner, "<!--[-->" | "<!--]-->" | "<!--[!-->") {
                let after = &rest[end + 3..]; // skip `);
                let after_trimmed = after.trim_start_matches('\n');
                if !after_trimmed.trim().is_empty() {
                    return Some((inner, after_trimmed));
                }
            }
        }
    }

    None
}

/// Find the end of a template literal (the index of the closing backtick),
/// respecting `${...}` interpolations and escaped backticks.
fn find_template_literal_end(s: &str) -> Option<usize> {
    let bytes = s.as_bytes();
    let len = bytes.len();
    let mut i = 0;

    while i < len {
        match bytes[i] {
            b'`' => return Some(i),
            b'\\' => {
                i += 2; // skip escaped char
            }
            b'$' if i + 1 < len && bytes[i + 1] == b'{' => {
                // Skip interpolation
                i += 2;
                let mut depth = 1u32;
                while i < len && depth > 0 {
                    match bytes[i] {
                        b'{' => depth += 1,
                        b'}' => depth -= 1,
                        b'\'' | b'"' | b'`' => {
                            i = super::helpers::skip_string_literal(bytes, i);
                            continue;
                        }
                        _ => {}
                    }
                    i += 1;
                }
            }
            _ => {
                i += 1;
            }
        }
    }

    None
}

/// Generate code for the inner body of a branch (consequent, else-if, or else).
///
/// Hoists @const declarations, recursively converts to TemplateItems, builds
/// the template, and generates code at the given indent level.
fn generate_inner_body_code(
    body: &[OutputPart],
    _arena: &JsArena,
    store_subs: &[(&str, &str)],
    each_counter: &mut usize,
    indent_level: usize,
) -> String {
    // Use the bridge pipeline for recursive body generation.
    let hoisted = ServerCodeGenerator::hoist_const_declarations_and_strip_ws(body);
    let arena = JsArena::new();
    let items = output_parts_to_template_items(&hoisted, &arena, store_subs, each_counter);
    let stmts =
        crate::compiler::phases::phase3_transform::server::visitors::shared::utils::build_template(
            &items, &arena,
        );
    crate::compiler::phases::phase3_transform::js_ast::codegen::generate_stmts(
        &stmts,
        &arena,
        indent_level,
    )
}

/// Convert an IfBlock OutputPart to TemplateItems.
///
/// Generates the if/else-if/else chain as a `TemplateItem::Statement(Raw)` with
/// properly numbered branch markers (`<!--[-->`, `<!--[1-->`, `<!--[!-->`), and
/// the closing `<!--]-->` as a `TemplateItem::Expression(Literal)` for coalescing.
fn convert_if_block(
    test_expr: &str,
    consequent_body: &[OutputPart],
    alternate_body: &Option<Vec<OutputPart>>,
    items: &mut Vec<TemplateItem>,
    arena: &JsArena,
    store_subs: &[(&str, &str)],
    each_counter: &mut usize,
) {
    let test_has_await = super::helpers::expr_contains_await(test_expr);

    // Determine effective test expression and indent
    let (effective_test, base_indent_level, needs_child_block) = if test_has_await {
        (
            super::helpers::transform_await_to_save(test_expr),
            1usize,
            true,
        )
    } else {
        (test_expr.to_string(), 0usize, false)
    };

    let indent = "\t".repeat(base_indent_level);
    let mut code = String::new();

    if needs_child_block {
        code.push_str("$$renderer.child_block(async ($$renderer) => {\n");
    }

    // Start the if statement
    code.push_str(&format!("{}if ({}) {{\n", indent, effective_test));

    // Opening marker for consequent branch. Upstream Svelte 5.53.7 commit
    // `86ec21086` "fix: correctly add `__svelte_meta` after else-if chains"
    // switched if-block hydration markers from `<!--[-->` / `<!--[!-->` to
    // numbered indices `<!--[0-->` / `<!--[1-->` ... / `<!--[-1-->` so the
    // client can distinguish which branch rendered. Other block kinds (each /
    // boundary / key / await) still use the legacy markers.
    code.push_str(&format!("{}\t$$renderer.push('<!--[0-->');\n", indent));

    // Consequent body
    let consequent_code = generate_inner_body_code(
        consequent_body,
        arena,
        store_subs,
        each_counter,
        base_indent_level + 1,
    );
    code.push_str(&consequent_code);

    // Close consequent
    code.push_str(&format!("{}}}", indent));

    // Flatten the else-if chain
    let mut elseif_index: usize = 1;
    let mut current_alt = alternate_body.as_deref();

    loop {
        match current_alt {
            None => {
                // No alternate: add empty else with BLOCK_OPEN_ELSE marker
                code.push_str(" else {\n");
                code.push_str(&format!("{}\t$$renderer.push('<!--[-1-->');\n", indent));
                code.push_str(&format!("{}}}", indent));
                break;
            }
            Some(alt_body) => {
                // Check if this alternate is a single else-if IfBlock
                if alt_body.len() == 1
                    && let OutputPart::IfBlock {
                        test_expr: nested_test,
                        consequent_body: nested_consequent,
                        alternate_body: nested_alternate,
                        is_elseif: true,
                    } = &alt_body[0]
                    && !super::helpers::expr_contains_await(nested_test)
                {
                    // else-if case
                    let marker = format!("<!--[{}-->", elseif_index);
                    elseif_index += 1;

                    code.push_str(&format!(" else if ({}) {{\n", nested_test));
                    code.push_str(&format!("{}\t$$renderer.push('{}');\n", indent, marker));

                    let branch_code = generate_inner_body_code(
                        nested_consequent,
                        arena,
                        store_subs,
                        each_counter,
                        base_indent_level + 1,
                    );
                    code.push_str(&branch_code);
                    code.push_str(&format!("{}}}", indent));

                    current_alt = nested_alternate.as_deref();
                } else {
                    // Regular else (final branch)
                    code.push_str(" else {\n");
                    code.push_str(&format!("{}\t$$renderer.push('<!--[-1-->');\n", indent));

                    let alt_code = generate_inner_body_code(
                        alt_body,
                        arena,
                        store_subs,
                        each_counter,
                        base_indent_level + 1,
                    );
                    code.push_str(&alt_code);
                    code.push_str(&format!("{}}}", indent));
                    break;
                }
            }
        }
    }

    if needs_child_block {
        code.push_str("\n});\n");
    }

    let trimmed = code.trim();
    if !trimmed.is_empty() {
        items.push(TemplateItem::Statement(JsStatement::Raw(
            CompactString::new(trimmed),
        )));
    }

    // Closing block marker - as Expression(Literal) for coalescing with adjacent HTML
    items.push(TemplateItem::Expression(JsExpr::Literal(
        JsLiteral::String("<!--]-->".into()),
    )));
}

/// Convert an EachBlock OutputPart to TemplateItems.
///
/// For no-fallback: emits `<!--[-->` as an expression literal (coalesces with prior content),
/// then the for loop as a statement, then `<!--]-->` as an expression literal.
///
/// For fallback: emits the if/else structure as a statement (with `<!--[-->` and `<!--[!-->`
/// inside branches), then `<!--]-->` as an expression literal.
#[allow(clippy::too_many_arguments)]
fn convert_each_block(
    iterable: &str,
    context_name: &Option<String>,
    index_name: &Option<String>,
    index_alias: &Option<String>,
    body: &[OutputPart],
    fallback: &Option<Vec<OutputPart>>,
    items: &mut Vec<TemplateItem>,
    arena: &JsArena,
    store_subs: &[(&str, &str)],
    each_counter: &mut usize,
) {
    let iterable_has_await = super::helpers::expr_contains_await(iterable);
    let needs_child_block = iterable_has_await;

    let base_indent_level = if needs_child_block { 1usize } else { 0usize };
    let effective_indent = "\t".repeat(base_indent_level);
    let transformed_iterable = if iterable_has_await {
        super::helpers::transform_await_to_save(iterable)
    } else {
        iterable.to_string()
    };

    // Generate unique array variable name
    let array_var = if *each_counter == 0 {
        "each_array".to_string()
    } else {
        format!("each_array_{}", each_counter)
    };

    // Generate unique index variable name
    let index_var = match index_name {
        Some(name) => name.clone(),
        None => {
            if *each_counter == 0 {
                "$$index".to_string()
            } else {
                format!("$$index_{}", each_counter)
            }
        }
    };

    *each_counter += 1;

    if fallback.is_some() {
        // With fallback: the opening marker is inside branches, so no expression literal before
        let mut code = String::new();

        if needs_child_block {
            code.push_str("$$renderer.child_block(async ($$renderer) => {\n");
        }

        code.push_str(&format!(
            "{}const {} = $.ensure_array_like({});\n\n",
            effective_indent, array_var, transformed_iterable
        ));

        code.push_str(&format!(
            "{}if ({}.length !== 0) {{\n",
            effective_indent, array_var
        ));
        code.push_str(&format!(
            "{}\t$$renderer.push('<!--[-->');\n\n",
            effective_indent
        ));

        // For loop inside if
        code.push_str(&format!(
            "{}\tfor (let {} = 0, $$length = {}.length; {} < $$length; {}++) {{\n",
            effective_indent, index_var, array_var, index_var, index_var
        ));

        if let Some(ctx_name) = context_name {
            code.push_str(&format!(
                "{}\t\tlet {} = {}[{}];\n",
                effective_indent, ctx_name, array_var, index_var
            ));
        }

        if let Some(alias) = index_alias {
            code.push_str(&format!(
                "{}\t\tlet {} = {};\n",
                effective_indent, alias, index_var
            ));
        }

        if context_name.is_some() || index_alias.is_some() {
            code.push('\n');
        }

        let body_code =
            generate_inner_body_code(body, arena, store_subs, each_counter, base_indent_level + 2);
        code.push_str(&body_code);

        code.push_str(&format!("{}\t}}\n", effective_indent));

        // Else branch with fallback
        code.push_str(&format!("{}}} else {{\n", effective_indent));
        code.push_str(&format!(
            "{}\t$$renderer.push('<!--[!-->');\n",
            effective_indent
        ));

        if let Some(fb) = fallback {
            let fallback_code = generate_inner_body_code(
                fb,
                arena,
                store_subs,
                each_counter,
                base_indent_level + 1,
            );
            code.push_str(&fallback_code);
        }

        code.push_str(&format!("{}}}\n", effective_indent));

        if needs_child_block {
            code.push_str("});\n");
        }

        let trimmed = code.trim();
        if !trimmed.is_empty() {
            items.push(TemplateItem::Statement(JsStatement::Raw(
                CompactString::new(trimmed),
            )));
        }
    } else {
        // No fallback: opening marker as expression literal for coalescing
        items.push(TemplateItem::Expression(JsExpr::Literal(
            JsLiteral::String("<!--[-->".into()),
        )));

        let mut code = String::new();

        if needs_child_block {
            code.push_str("$$renderer.child_block(async ($$renderer) => {\n");
        }

        code.push_str(&format!(
            "{}const {} = $.ensure_array_like({});\n\n",
            effective_indent, array_var, transformed_iterable
        ));

        code.push_str(&format!(
            "{}for (let {} = 0, $$length = {}.length; {} < $$length; {}++) {{\n",
            effective_indent, index_var, array_var, index_var, index_var
        ));

        if let Some(ctx_name) = context_name {
            code.push_str(&format!(
                "{}\tlet {} = {}[{}];\n",
                effective_indent, ctx_name, array_var, index_var
            ));
        }

        if let Some(alias) = index_alias {
            code.push_str(&format!(
                "{}\tlet {} = {};\n",
                effective_indent, alias, index_var
            ));
        }

        if context_name.is_some() || index_alias.is_some() {
            code.push('\n');
        }

        let body_code =
            generate_inner_body_code(body, arena, store_subs, each_counter, base_indent_level + 1);
        code.push_str(&body_code);

        code.push_str(&format!("{}}}\n", effective_indent));

        if needs_child_block {
            code.push_str("});\n");
        }

        let trimmed = code.trim();
        if !trimmed.is_empty() {
            items.push(TemplateItem::Statement(JsStatement::Raw(
                CompactString::new(trimmed),
            )));
        }
    }

    // Closing block marker - as Expression(Literal) for coalescing
    items.push(TemplateItem::Expression(JsExpr::Literal(
        JsLiteral::String("<!--]-->".into()),
    )));
}

/// Convert a ContentEditableBody OutputPart to TemplateItems.
///
/// Generates the if/else structure: if the value expression is truthy, push it;
/// otherwise push the children body.
#[allow(clippy::too_many_arguments)]
fn convert_content_editable_body(
    value_expr: &str,
    children_body: &[OutputPart],
    items: &mut Vec<TemplateItem>,
    arena: &JsArena,
    store_subs: &[(&str, &str)],
    each_counter: &mut usize,
    textarea_body_counter: &mut usize,
) {
    let is_simple_expr = value_expr
        .chars()
        .all(|c| c.is_alphanumeric() || c == '_' || c == '$' || c == '.');

    let mut code = String::new();

    let (condition_expr, push_expr) = if is_simple_expr {
        (value_expr.to_string(), value_expr.to_string())
    } else {
        let var_name = if *textarea_body_counter == 0 {
            "$$body".to_string()
        } else {
            format!("$$body_{}", textarea_body_counter)
        };
        *textarea_body_counter += 1;
        code.push_str(&format!("const {} = {};\n\n", var_name, value_expr));
        (var_name.clone(), var_name)
    };

    code.push_str(&format!("if ({}) {{\n", condition_expr));
    code.push_str(&format!("\t$$renderer.push(`${{{}}}`);\n", push_expr));

    // Generate children in the else branch
    let children_code = generate_inner_body_code(children_body, arena, store_subs, each_counter, 1);
    if children_code.trim().is_empty() {
        code.push_str("} else {}");
    } else {
        code.push_str("} else {\n");
        code.push_str(&children_code);
        code.push('}');
    }

    let trimmed = code.trim();
    if !trimmed.is_empty() {
        items.push(TemplateItem::Statement(JsStatement::Raw(
            CompactString::new(trimmed),
        )));
    }
}

/// Convert a BlockScope OutputPart to TemplateItems.
///
/// Generates `{ body }` wrapping the body in a JavaScript block scope.
fn convert_block_scope(
    body: &[OutputPart],
    items: &mut Vec<TemplateItem>,
    store_subs: &[(&str, &str)],
    each_counter: &mut usize,
) {
    let body_code = generate_inner_body_code_direct(body, store_subs, each_counter, 1);
    let code = format!("{{\n{}}}", body_code);
    let trimmed = code.trim();
    if !trimmed.is_empty() {
        items.push(TemplateItem::Statement(JsStatement::Raw(
            CompactString::new(trimmed),
        )));
    }
}

/// Convert a RenderCall OutputPart to TemplateItems.
///
/// Generates `call_str;` as a statement and optionally adds a `<!---->` marker
/// expression when `skip_boundary` is false.
fn convert_render_call(call_str: &str, skip_boundary: bool, items: &mut Vec<TemplateItem>) {
    items.push(TemplateItem::Statement(JsStatement::Raw(
        CompactString::new(format!("{};", call_str)),
    )));
    if !skip_boundary {
        items.push(TemplateItem::Expression(JsExpr::Literal(
            JsLiteral::String("<!---->".into()),
        )));
    }
}

/// Convert a SnippetFunction OutputPart to TemplateItems.
///
/// Generates a function declaration with optional dev mode wrappers.
#[allow(clippy::too_many_arguments)]
fn convert_snippet_function(
    name: &str,
    params: &[String],
    body: &[OutputPart],
    dev: bool,
    items: &mut Vec<TemplateItem>,
    store_subs: &[(&str, &str)],
    each_counter: &mut usize,
) {
    let mut code = String::new();

    if dev {
        code.push_str(&format!("$.prevent_snippet_stringification({});\n", name));
    }

    let param_str = if params.is_empty() {
        "$$renderer".to_string()
    } else {
        format!("$$renderer, {}", params.join(", "))
    };

    code.push_str(&format!("function {}({}) {{\n", name, param_str));

    if dev {
        code.push_str("\t$.validate_snippet_args($$renderer);\n");
    }

    if !body.is_empty() {
        let body_code = generate_inner_body_code_direct(body, store_subs, each_counter, 1);
        code.push_str(&body_code);
    }

    code.push_str("}\n");

    let trimmed = code.trim();
    if !trimmed.is_empty() {
        items.push(TemplateItem::Statement(JsStatement::Raw(
            CompactString::new(trimmed),
        )));
    }
}

/// Convert a SvelteHead OutputPart to TemplateItems.
///
/// Generates `$.head('hash', $$renderer, ($$renderer) => { body });`
fn convert_svelte_head(
    hash: &str,
    body: &[OutputPart],
    items: &mut Vec<TemplateItem>,
    store_subs: &[(&str, &str)],
    each_counter: &mut usize,
) {
    let mut code = String::new();
    code.push_str(&format!(
        "$.head('{}', $$renderer, ($$renderer) => {{\n",
        hash
    ));

    if !body.is_empty() {
        let body_code = generate_inner_body_code_direct(body, store_subs, each_counter, 1);
        code.push_str(&body_code);
    }

    code.push_str("});");

    items.push(TemplateItem::Statement(JsStatement::Raw(
        CompactString::new(code.trim()),
    )));
}

/// Convert a TitleElement OutputPart to TemplateItems.
///
/// Generates `$$renderer.title(($$renderer) => { body });`
fn convert_title_element(
    body: &[OutputPart],
    items: &mut Vec<TemplateItem>,
    store_subs: &[(&str, &str)],
    each_counter: &mut usize,
) {
    let mut code = String::new();
    code.push_str("$$renderer.title(($$renderer) => {\n");

    if !body.is_empty() {
        let body_code = generate_inner_body_code_direct(body, store_subs, each_counter, 1);
        code.push_str(&body_code);
    }

    code.push_str("});");

    items.push(TemplateItem::Statement(JsStatement::Raw(
        CompactString::new(code.trim()),
    )));
}

/// Convert a Slot OutputPart to TemplateItems.
///
/// Generates `<!--[--> + $.slot($$renderer, $$props, 'name', props, fallback) + <!--]-->`.
/// When props contain `await`, wraps in `$$renderer.child_block(async ...)`.
fn convert_slot(
    name: &str,
    props_expr: &str,
    fallback: &Option<Vec<OutputPart>>,
    items: &mut Vec<TemplateItem>,
    store_subs: &[(&str, &str)],
    each_counter: &mut usize,
) {
    // Opening marker as Expression (coalesces with preceding HTML)
    items.push(TemplateItem::Expression(JsExpr::Literal(
        JsLiteral::String("<!--[-->".into()),
    )));

    // Build fallback argument
    let fallback_arg = if let Some(fallback_parts) = fallback {
        if fallback_parts.is_empty() {
            "null".to_string()
        } else {
            let fallback_code =
                generate_inner_body_code_direct(fallback_parts, store_subs, each_counter, 1);
            format!("() => {{\n{}}}", fallback_code)
        }
    } else {
        "null".to_string()
    };

    // Check if slot props contain await expressions
    let has_await = memchr::memmem::find(props_expr.as_bytes(), b"await ").is_some();

    let mut code = String::new();
    if has_await {
        code.push_str("$$renderer.child_block(async ($$renderer) => {\n");

        let (extracted_consts, modified_props) = extract_await_from_slot_props(props_expr);
        for (i, await_expr) in extracted_consts.iter().enumerate() {
            code.push_str(&format!(
                "\tconst $${} = (await $.save({}))();\n",
                i, await_expr
            ));
        }

        code.push_str(&format!(
            "\t$.slot($$renderer, $$props, '{}', {}, {});\n",
            name, modified_props, fallback_arg
        ));
        code.push_str("});");
    } else {
        code.push_str(&format!(
            "$.slot($$renderer, $$props, '{}', {}, {});",
            name, props_expr, fallback_arg
        ));
    }

    items.push(TemplateItem::Statement(JsStatement::Raw(
        CompactString::new(code.trim()),
    )));

    // Closing marker as Expression (coalesces with following HTML)
    items.push(TemplateItem::Expression(JsExpr::Literal(
        JsLiteral::String("<!--]-->".into()),
    )));
}

/// Convert a SvelteBoundaryWithPending OutputPart to TemplateItems.
///
/// Generates: `if (pending_expr) { <!--[!--> pending_body <!--]--> } else { <!--[--> main_body <!--]--> }`
#[allow(clippy::too_many_arguments)]
fn convert_svelte_boundary_with_pending(
    pending_expr: &str,
    pending_body: &[OutputPart],
    main_body: &[OutputPart],
    failed_props: Option<&str>,
    items: &mut Vec<TemplateItem>,
    store_subs: &[(&str, &str)],
    each_counter: &mut usize,
) {
    // Build the if/else block body. When inside a boundary call, indent each
    // line by one extra tab.
    let mut inner = String::new();
    inner.push_str(&format!("if ({}) {{\n", pending_expr));
    inner.push_str("\t$$renderer.push(`<!--[!-->`);\n");
    if !pending_body.is_empty() {
        let pending_code =
            generate_inner_body_code_direct(pending_body, store_subs, each_counter, 1);
        inner.push_str(&pending_code);
    }
    inner.push_str("\t$$renderer.push(`<!--]-->`);\n");
    inner.push_str("} else {\n");
    inner.push_str("\t$$renderer.push(`<!--[-->`);\n");
    if !main_body.is_empty() {
        // Wrap the main body in a `{ ... }` block scope. The official
        // SvelteBoundary visitor scopes the else-branch's hoisted `let`
        // declarations (e.g. `let data; var promises = ...`) so they don't
        // leak into the surrounding function.
        inner.push_str("\n\t{\n");
        let main_code = generate_inner_body_code_direct(main_body, store_subs, each_counter, 2);
        inner.push_str(&main_code);
        inner.push_str("\t}\n\n");
    }
    inner.push_str("\t$$renderer.push(`<!--]-->`);\n");
    inner.push('}');

    let trimmed = if let Some(props) = failed_props {
        let mut wrapped = String::new();
        wrapped.push_str(&format!(
            "$$renderer.boundary({}, ($$renderer) => {{\n",
            props
        ));
        for line in inner.lines() {
            if line.is_empty() {
                wrapped.push('\n');
            } else {
                wrapped.push('\t');
                wrapped.push_str(line);
                wrapped.push('\n');
            }
        }
        wrapped.push_str("});");
        wrapped
    } else {
        inner.trim().to_string()
    };

    if !trimmed.is_empty() {
        items.push(TemplateItem::Statement(JsStatement::Raw(
            CompactString::new(trimmed),
        )));
    }
}

/// Convert an AwaitBlock OutputPart to TemplateItems.
///
/// Generates `$.await($$renderer, promise, pending_fn, then_fn);` followed
/// by `<!--]-->` as an expression for coalescing.
#[allow(clippy::too_many_arguments)]
fn convert_await_block(
    promise: &str,
    then_param: &str,
    pending_body: &[OutputPart],
    then_body: &[OutputPart],
    has_await: bool,
    items: &mut Vec<TemplateItem>,
    store_subs: &[(&str, &str)],
    each_counter: &mut usize,
) {
    let pending_is_empty = pending_body.is_empty();
    let then_is_empty = then_body.is_empty();

    let mut code = String::new();

    // Svelte 5.55.9 upstream `000c594e0` "fix: `{#await await ...}` and async
    // dependencies fixes": when the promise expression itself contains
    // `await` (`{#await await ...}`), wrap the entire `$.await(...)` call in
    // `$$renderer.child_block(async ($$renderer) => { ... })` so the SSR /
    // hydration markup matches the client `$.async(...)` wrapper. The
    // promise expression has already been wrapped in an IIFE in the visitor.
    let inner_indent = if has_await { "\t" } else { "" };

    if has_await {
        code.push_str("$$renderer.child_block(async ($$renderer) => {\n");
    }

    if pending_is_empty && then_is_empty {
        let then_fn = if then_param.is_empty() {
            "() => {}".to_string()
        } else {
            format!("({}) => {{}}", then_param)
        };
        code.push_str(&format!(
            "{}$.await($$renderer, {}, () => {{}}, {});",
            inner_indent, promise, then_fn
        ));
    } else {
        let nested_indent_level = if has_await { 3 } else { 2 };

        code.push_str(&format!("{}$.await(\n", inner_indent));
        code.push_str(&format!("{}\t$$renderer,\n", inner_indent));
        code.push_str(&format!("{}\t{},\n", inner_indent, promise));

        if pending_is_empty {
            code.push_str(&format!("{}\t() => {{}},\n", inner_indent));
        } else {
            code.push_str(&format!("{}\t() => {{\n", inner_indent));
            let pending_code = generate_inner_body_code_direct(
                pending_body,
                store_subs,
                each_counter,
                nested_indent_level,
            );
            code.push_str(&pending_code);
            code.push_str(&format!("{}\t}},\n", inner_indent));
        }

        if then_is_empty {
            if then_param.is_empty() {
                code.push_str(&format!("{}\t() => {{}}", inner_indent));
            } else {
                code.push_str(&format!("{}\t({}) => {{}}", inner_indent, then_param));
            }
        } else {
            if then_param.is_empty() {
                code.push_str(&format!("{}\t() => {{\n", inner_indent));
            } else {
                code.push_str(&format!("{}\t({}) => {{\n", inner_indent, then_param));
            }
            let then_code = generate_inner_body_code_direct(
                then_body,
                store_subs,
                each_counter,
                nested_indent_level,
            );
            code.push_str(&then_code);
            code.push_str(&format!("{}\t}}", inner_indent));
        }

        code.push('\n');
        code.push_str(&format!("{});", inner_indent));
    }

    if has_await {
        code.push_str("\n});");
    }

    let trimmed = code.trim();
    if !trimmed.is_empty() {
        items.push(TemplateItem::Statement(JsStatement::Raw(
            CompactString::new(trimmed),
        )));
    }

    // Closing marker as Expression for coalescing
    items.push(TemplateItem::Expression(JsExpr::Literal(
        JsLiteral::String("<!--]-->".into()),
    )));
}

/// Convert a SvelteElement OutputPart to TemplateItems.
///
/// Generates `$.element($$renderer, tag, attrs, () => { body })` with optional
/// dev validation via `$.validate_dynamic_element_tag`.
fn convert_svelte_element(
    tag_expr: &str,
    attrs_expr: &Option<String>,
    body: &[OutputPart],
    dev: bool,
    items: &mut Vec<TemplateItem>,
    store_subs: &[(&str, &str)],
    each_counter: &mut usize,
) {
    let mut code = String::new();

    if dev {
        code.push_str(&format!(
            "$.validate_dynamic_element_tag(() => {});\n",
            tag_expr
        ));
    }

    if body.is_empty() && attrs_expr.is_none() {
        code.push_str(&format!("$.element($$renderer, {});", tag_expr));
    } else {
        let attrs_arg = attrs_expr.as_deref().unwrap_or("void 0");

        if body.is_empty() {
            code.push_str(&format!(
                "$.element($$renderer, {}, {});",
                tag_expr, attrs_arg
            ));
        } else {
            code.push_str(&format!(
                "$.element($$renderer, {}, {}, () => {{\n",
                tag_expr, attrs_arg
            ));

            let body_code = generate_inner_body_code_direct(body, store_subs, each_counter, 1);
            code.push_str(&body_code);

            code.push_str("});");
        }
    }

    let trimmed = code.trim();
    if !trimmed.is_empty() {
        items.push(TemplateItem::Statement(JsStatement::Raw(
            CompactString::new(trimmed),
        )));
    }
}

/// Generate code for body parts using `build_parts_with_store_subs` directly.
///
/// This ensures correct absolute indentation for all part types, including
/// Component and ComponentWithBindings which need proper indent tracking.
pub(crate) fn generate_inner_body_code_direct(
    body: &[OutputPart],
    store_subs: &[(&str, &str)],
    each_counter: &mut usize,
    indent_level: usize,
) -> String {
    // Use the bridge pipeline for recursive body generation.
    let hoisted = ServerCodeGenerator::hoist_const_declarations_and_strip_ws(body);
    let arena = JsArena::new();
    let items = output_parts_to_template_items(&hoisted, &arena, store_subs, each_counter);
    let stmts =
        crate::compiler::phases::phase3_transform::server::visitors::shared::utils::build_template(
            &items, &arena,
        );
    crate::compiler::phases::phase3_transform::js_ast::codegen::generate_stmts(
        &stmts,
        &arena,
        indent_level,
    )
}

/// Extract await expressions from slot props expression, replacing them with `$$N` variables.
fn extract_await_from_slot_props(props_expr: &str) -> (Vec<String>, String) {
    let mut extracted = Vec::new();
    let mut modified = String::new();
    let bytes = props_expr.as_bytes();
    let len = bytes.len();
    let mut i = 0;

    while i < len {
        if bytes[i] == b'\'' || bytes[i] == b'"' || bytes[i] == b'`' {
            let quote = bytes[i];
            modified.push(bytes[i] as char);
            i += 1;
            while i < len && bytes[i] != quote {
                if bytes[i] == b'\\' {
                    modified.push(bytes[i] as char);
                    i += 1;
                    if i < len {
                        modified.push(bytes[i] as char);
                        i += 1;
                    }
                } else {
                    modified.push(bytes[i] as char);
                    i += 1;
                }
            }
            if i < len {
                modified.push(bytes[i] as char);
                i += 1;
            }
            continue;
        }

        if i + 5 <= len
            && &props_expr[i..i + 5] == "await"
            && (i == 0 || !bytes[i - 1].is_ascii_alphanumeric() && bytes[i - 1] != b'_')
            && (i + 5 >= len || !bytes[i + 5].is_ascii_alphanumeric() && bytes[i + 5] != b'_')
        {
            let mut j = i + 5;
            while j < len && (bytes[j] == b' ' || bytes[j] == b'\t' || bytes[j] == b'\n') {
                j += 1;
            }

            let arg_start = j;
            let mut paren_depth = 0i32;
            let mut bracket_depth = 0i32;
            let mut brace_depth = 0i32;

            while j < len {
                match bytes[j] {
                    b'(' => paren_depth += 1,
                    b')' => {
                        if paren_depth == 0 {
                            break;
                        }
                        paren_depth -= 1;
                    }
                    b'[' => bracket_depth += 1,
                    b']' => {
                        if bracket_depth == 0 {
                            break;
                        }
                        bracket_depth -= 1;
                    }
                    b'{' => brace_depth += 1,
                    b'}' => {
                        if brace_depth == 0 {
                            break;
                        }
                        brace_depth -= 1;
                    }
                    b',' if paren_depth == 0 && bracket_depth == 0 && brace_depth == 0 => break,
                    _ => {}
                }
                j += 1;
            }

            let await_arg = props_expr[arg_start..j].trim_end();
            let idx = extracted.len();
            extracted.push(await_arg.to_string());
            modified.push_str(&format!("$${}", idx));
            i = j;
        } else {
            modified.push(bytes[i] as char);
            i += 1;
        }
    }

    (extracted, modified)
}

/// Split an HTML string containing `${...}` interpolations into a sequence of
/// TemplateItems: string literals for static parts and raw expressions for
/// interpolated parts.
///
/// For example, `<div class="${$.attr('class', v)}">` becomes:
///   - Expression(Literal("<div class=\""))
///   - Expression(Raw("$.attr('class', v)"))
///   - Expression(Literal("\">"))
///
fn split_html_interpolations(html: &str, items: &mut Vec<TemplateItem>) {
    let bytes = html.as_bytes();
    let len = bytes.len();
    let mut pos = 0;
    let mut static_start = 0;

    while pos < len {
        if pos + 1 < len && bytes[pos] == b'$' && bytes[pos + 1] == b'{' {
            // Emit the static part before this interpolation
            if pos > static_start {
                let static_part = &html[static_start..pos];
                items.push(TemplateItem::Expression(JsExpr::Literal(
                    JsLiteral::String(CompactString::new(static_part)),
                )));
            }

            // Find the matching closing brace, respecting nesting
            let expr_start = pos + 2;
            let mut depth: usize = 1;
            let mut j = expr_start;
            while j < len && depth > 0 {
                match bytes[j] {
                    b'{' => depth += 1,
                    b'}' => depth -= 1,
                    b'\'' | b'"' | b'`' => {
                        // Skip string literals
                        j = super::helpers::skip_string_literal(bytes, j);
                        continue;
                    }
                    _ => {}
                }
                j += 1;
            }

            // j now points one past the closing '}'
            let expr_end = j - 1; // index of the closing '}'
            let expr = &html[expr_start..expr_end];
            items.push(TemplateItem::Expression(JsExpr::Raw(CompactString::new(
                expr,
            ))));

            pos = j;
            static_start = j;
        } else {
            pos += 1;
        }
    }

    // Emit any trailing static part
    if static_start < len {
        let static_part = &html[static_start..];
        items.push(TemplateItem::Expression(JsExpr::Literal(
            JsLiteral::String(CompactString::new(static_part)),
        )));
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_split_html_interpolations_no_interpolation() {
        let mut items = Vec::new();
        split_html_interpolations("<div>hello</div>", &mut items);
        assert_eq!(items.len(), 1);
        match &items[0] {
            TemplateItem::Expression(JsExpr::Literal(JsLiteral::String(s))) => {
                assert_eq!(s.as_str(), "<div>hello</div>");
            }
            _ => panic!("Expected string literal"),
        }
    }

    #[test]
    fn test_split_html_interpolations_single() {
        let mut items = Vec::new();
        split_html_interpolations("<div class=\"${$.attr('class', v)}\">", &mut items);
        assert_eq!(items.len(), 3);
        match &items[0] {
            TemplateItem::Expression(JsExpr::Literal(JsLiteral::String(s))) => {
                assert_eq!(s.as_str(), "<div class=\"");
            }
            _ => panic!("Expected string literal"),
        }
        match &items[1] {
            TemplateItem::Expression(JsExpr::Raw(s)) => {
                assert_eq!(s.as_str(), "$.attr('class', v)");
            }
            _ => panic!("Expected raw expression"),
        }
        match &items[2] {
            TemplateItem::Expression(JsExpr::Literal(JsLiteral::String(s))) => {
                assert_eq!(s.as_str(), "\">");
            }
            _ => panic!("Expected string literal"),
        }
    }

    #[test]
    fn test_split_html_interpolations_nested_braces() {
        let mut items = Vec::new();
        split_html_interpolations("${foo({a: 1})}", &mut items);
        assert_eq!(items.len(), 1);
        match &items[0] {
            TemplateItem::Expression(JsExpr::Raw(s)) => {
                assert_eq!(s.as_str(), "foo({a: 1})");
            }
            _ => panic!("Expected raw expression"),
        }
    }

    #[test]
    fn test_output_parts_to_template_items_empty() {
        let arena = JsArena::new();
        let items = output_parts_to_template_items(&[], &arena, &[], &mut 0);
        assert!(items.is_empty());
    }

    #[test]
    fn test_output_parts_to_template_items_simple_html() {
        let arena = JsArena::new();
        let parts = vec![
            OutputPart::Html("<div>".to_string()),
            OutputPart::Expression("name".to_string()),
            OutputPart::Html("</div>".to_string()),
        ];
        let items = output_parts_to_template_items(&parts, &arena, &[], &mut 0);
        // Now we get three Expression items that build_template will coalesce
        assert_eq!(items.len(), 3);
        match &items[0] {
            TemplateItem::Expression(JsExpr::Literal(JsLiteral::String(s))) => {
                assert_eq!(s.as_str(), "<div>");
            }
            _ => panic!("Expected string literal for Html"),
        }
        match &items[1] {
            TemplateItem::Expression(JsExpr::Raw(s)) => {
                assert_eq!(s.as_str(), "$.escape(name)");
            }
            _ => panic!("Expected raw expression for Expression"),
        }
        match &items[2] {
            TemplateItem::Expression(JsExpr::Literal(JsLiteral::String(s))) => {
                assert_eq!(s.as_str(), "</div>");
            }
            _ => panic!("Expected string literal for Html"),
        }
    }

    #[test]
    fn test_output_parts_to_template_items_comment() {
        let arena = JsArena::new();
        let parts = vec![OutputPart::Comment];
        let items = output_parts_to_template_items(&parts, &arena, &[], &mut 0);
        assert_eq!(items.len(), 1);
        match &items[0] {
            TemplateItem::Expression(JsExpr::Literal(JsLiteral::String(s))) => {
                assert_eq!(s.as_str(), "<!---->");
            }
            _ => panic!("Expected string literal for Comment"),
        }
    }

    #[test]
    fn test_output_parts_to_template_items_const_decl() {
        let arena = JsArena::new();
        let parts = vec![OutputPart::ConstDeclaration("x = 1".to_string())];
        let items = output_parts_to_template_items(&parts, &arena, &[], &mut 0);
        assert_eq!(items.len(), 1);
        match &items[0] {
            TemplateItem::Statement(JsStatement::Raw(s)) => {
                assert_eq!(s.as_str(), "const x = 1;");
            }
            _ => panic!("Expected raw statement for ConstDeclaration"),
        }
    }
}
