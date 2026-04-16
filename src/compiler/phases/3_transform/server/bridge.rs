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
//! - Complex parts (Component, AwaitBlock, SvelteBoundary, etc.) are individually
//!   delegated to `build_parts_with_store_subs` via `delegate_single_part()`, wrapping
//!   the result in `TemplateItem::Statement(Raw(...))`. This allows block markers and
//!   expressions around them to be properly coalesced by `build_template()`.

use super::ServerCodeGenerator;
use super::types::{OutputPart, TemplateItem};
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
/// - Complex parts (Component, AwaitBlock, SvelteBoundary, etc.) are individually
///   delegated to `build_parts_with_store_subs` via `delegate_single_part()`, wrapping
///   the result in `TemplateItem::Statement(Raw(...))`.
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
        // SvelteBoundary: handle directly so the opening/closing markers
        // can coalesce with adjacent HTML through build_template().
        OutputPart::SvelteBoundary { body, is_pending } => {
            // Opening marker as Expression (coalesces with preceding HTML)
            let open_marker = if *is_pending { "<!--[!-->" } else { "<!--[-->" };
            items.push(TemplateItem::Expression(JsExpr::Literal(
                JsLiteral::String(open_marker.into()),
            )));

            // Body in a JavaScript block
            let body_code = generate_inner_body_code(body, _arena, store_subs, each_counter, 1);
            let block_code = format!("{{\n{}}}", body_code);
            let trimmed = block_code.trim();
            if !trimmed.is_empty() {
                items.push(TemplateItem::Statement(JsStatement::Raw(
                    CompactString::new(trimmed),
                )));
            }

            // Closing marker as Expression (coalesces with following HTML)
            items.push(TemplateItem::Expression(JsExpr::Literal(
                JsLiteral::String("<!--]-->".into()),
            )));
        }

        // All other complex parts: delegate individually to build_parts_with_store_subs.
        OutputPart::Component { .. }
        | OutputPart::ComponentWithBindings { .. }
        | OutputPart::AwaitBlock { .. }
        | OutputPart::AsyncBlock { .. }
        | OutputPart::AsyncBlockCustom { .. }
        | OutputPart::AsyncWrappedExpression { .. }
        | OutputPart::AsyncWrappedExpressionCustom { .. }
        | OutputPart::AsyncWrappedHtml { .. }
        | OutputPart::AsyncChild { .. }
        | OutputPart::AsyncChildBlock { .. }
        | OutputPart::SvelteElement { .. }
        | OutputPart::SelectElement { .. }
        | OutputPart::OptionElement { .. }
        | OutputPart::SvelteBoundaryWithPending { .. }
        | OutputPart::SvelteHead { .. }
        | OutputPart::TitleElement { .. }
        | OutputPart::Slot { .. }
        | OutputPart::RenderCall { .. }
        | OutputPart::SnippetFunction { .. }
        | OutputPart::BlockScope { .. } => {
            delegate_single_part(part, remaining_parts, items, each_counter, store_subs);
        }
    }
}

/// Delegate a single OutputPart to `build_parts_with_store_subs` and push
/// the result as `TemplateItem`s.
///
/// Used for complex parts (Component, AwaitBlock, SvelteBoundary, etc.) that
/// need the full code generation logic from `build_parts_with_store_subs`.
/// Each part is processed individually so that block markers and expressions
/// around it can be properly coalesced by `build_template()`.
///
/// If the delegated code ends with a simple `$$renderer.push(\`...\`);` or
/// `$$renderer.push('...');` call, the trailing push content is extracted and
/// emitted as a `TemplateItem::Expression` so it can coalesce with subsequent
/// expression items in `build_template()`.
///
/// For Component/ComponentWithBindings parts, the `has_more_content` look-ahead
/// is compensated: when `has_prior_content` is false and the single-part delegation
/// would have omitted the `<!---->` marker, we check `remaining_parts` and add it.
fn delegate_single_part(
    part: &OutputPart,
    remaining_parts: &[OutputPart],
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

    // Compensate for the lost `has_more_content` look-ahead in Component parts.
    //
    // When build_parts_with_store_subs processes a Component inside a full parts
    // slice, it checks `has_more_content = parts[i+1..].any(...)`. When delegated
    // alone, this look-ahead is empty, so the `<!---->` marker may be missing.
    //
    // Detect when a Component with `has_prior_content=false` (and not `in_async_block`)
    // was delegated without producing a marker, and add one if remaining_parts has content.
    if needs_component_marker_compensation(part) {
        let has_more = remaining_parts.iter().any(|p| {
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
    arena: &JsArena,
    store_subs: &[(&str, &str)],
    each_counter: &mut usize,
    indent_level: usize,
) -> String {
    use super::visitors::shared::utils::build_template;
    use crate::compiler::phases::phase3_transform::js_ast::codegen::generate_stmts;

    let hoisted = ServerCodeGenerator::hoist_const_declarations_and_strip_ws(body);
    let inner_items = output_parts_to_template_items(&hoisted, arena, store_subs, each_counter);
    let inner_stmts = build_template(&inner_items, arena);
    generate_stmts(&inner_stmts, arena, indent_level)
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

    // Opening marker for consequent branch
    code.push_str(&format!("{}\t$$renderer.push('<!--[-->');\n", indent));

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
                code.push_str(&format!("{}\t$$renderer.push('<!--[!-->');\n", indent));
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
                    code.push_str(&format!("{}\t$$renderer.push('<!--[!-->');\n", indent));

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
