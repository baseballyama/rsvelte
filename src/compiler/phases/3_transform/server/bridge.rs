//! Bridge module: converts OutputPart → TemplateItem for AST-based code generation.
//!
//! This module provides a conversion layer between the visitor-produced `OutputPart`
//! list and the AST-based `TemplateItem` representation used by `build_template()`.
//!
//! The conversion uses a two-phase approach:
//!
//! 1. **Simple parts** (Html, Expression, Comment, etc.) before any complex part are
//!    converted directly to `TemplateItem::Expression` or `TemplateItem::Statement`,
//!    which `build_template()` coalesces into `$$renderer.push(\`...\`)` template literals.
//!
//! 2. **Complex parts** (Component, IfBlock, EachBlock, AwaitBlock, etc.) and all parts
//!    after the first complex part are delegated to `build_parts_with_store_subs`, which
//!    preserves cross-part context (current_html coalescing, has_prior_content checks, etc.).

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
/// - Remaining complex parts (Component, AwaitBlock, etc.) delegate to
///   `build_parts_with_store_subs` for single-part code generation.
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

    // Find the first "complex" part that requires cross-part context from
    // build_parts_with_store_subs (Component, AwaitBlock, SvelteBoundary, etc.).
    // Also treat Html/RawExpression with await as complex since they need look-ahead.
    let first_complex_idx = parts.iter().position(is_complex_part);

    // Determine where to stop converting parts to TemplateItems.
    //
    // Expression-like parts right before a complex part must be included in the
    // delegation because they need to be coalesced (via current_html) with the
    // complex part's markers (e.g., <!--[--> from an IfBlock inside SvelteBoundary).
    //
    // We find the last "statement boundary" before the first complex part.
    // Expression-like parts after this boundary are included in the delegation.
    let convertible_end = if let Some(complex_idx) = first_complex_idx {
        // Find the last statement-level part before the complex part.
        // Everything after this is expression-like and should be delegated.
        let mut last_stmt_boundary = 0;
        for (j, part) in parts.iter().enumerate().take(complex_idx) {
            if is_statement_boundary(part) {
                last_stmt_boundary = j + 1;
            }
        }
        last_stmt_boundary
    } else {
        parts.len()
    };

    let mut i = 0;
    while i < convertible_end {
        let part = &parts[i];
        convert_simple_part_to_item(part, &mut items, arena, store_subs, each_counter);
        i += 1;
    }

    // If there are parts remaining (complex + expression parts before it),
    // delegate them all to build_parts_with_store_subs.
    if convertible_end < parts.len() {
        delegate_remaining_parts(
            &parts[convertible_end..],
            &mut items,
            each_counter,
            store_subs,
        );
    }

    items
}

/// Check if a part is "complex" — requires cross-part context from
/// `build_parts_with_store_subs` and cannot be independently converted.
fn is_complex_part(part: &OutputPart) -> bool {
    match part {
        // Expression-like parts: can be converted independently
        OutputPart::Html(html) | OutputPart::HtmlWithExclusions { html, .. } => {
            // Html with await in interpolations needs look-ahead (complex)
            if super::helpers::html_template_contains_await(html)
                && html.starts_with('<')
                && !html.starts_with("</")
                && !html.starts_with("<!")
            {
                return true;
            }
            // Html with backslashes needs to go through build_parts_with_store_subs
            // to avoid double-escaping by sanitize_template_string in build_template.
            html.contains('\\')
        }
        OutputPart::Expression(_) => false,
        OutputPart::AsyncExpression { .. } => false,
        OutputPart::RawExpression(expr) => {
            // RawExpression with await needs look-ahead (complex)
            super::helpers::expr_contains_await(expr)
        }
        OutputPart::HtmlExpression(expr) => {
            // HtmlExpression with await needs child_block wrapping
            super::helpers::expr_contains_await(expr)
        }
        OutputPart::Comment | OutputPart::HydrationAnchor | OutputPart::Flush => false,

        // Statement-like parts without cross-part dependencies
        OutputPart::ConstDeclaration(_)
        | OutputPart::VarDeclaration(_)
        | OutputPart::RawStatement(_)
        | OutputPart::ConstBlockerMetadata { .. } => false,

        // IfBlock and EachBlock: treated as complex because their closing markers
        // (<!--]-->) need to coalesce with adjacent content via current_html in
        // build_parts_with_store_subs.
        OutputPart::IfBlock { .. } | OutputPart::EachBlock { .. } => true,

        // Everything else is complex (Component, AwaitBlock, SvelteBoundary, etc.)
        _ => true,
    }
}

/// Check if a part acts as a "statement boundary" — a point where expression-like
/// parts before it would be flushed by `build_parts_with_store_subs`.
///
/// These include statement-level parts (ConstDeclaration, etc.), control flow parts
/// (IfBlock, EachBlock), and parts that produce their own `$$renderer.push` calls
/// (AsyncExpression, Flush).
fn is_statement_boundary(part: &OutputPart) -> bool {
    matches!(
        part,
        OutputPart::ConstDeclaration(_)
            | OutputPart::VarDeclaration(_)
            | OutputPart::RawStatement(_)
            | OutputPart::IfBlock { .. }
            | OutputPart::EachBlock { .. }
            | OutputPart::AsyncExpression { .. }
            | OutputPart::Flush
            | OutputPart::ConstBlockerMetadata { .. }
    )
}

/// Convert a non-complex OutputPart to TemplateItem(s).
fn convert_simple_part_to_item(
    part: &OutputPart,
    items: &mut Vec<TemplateItem>,
    _arena: &JsArena,
    store_subs: &[(&str, &str)],
    each_counter: &mut usize,
) {
    match part {
        OutputPart::Html(html) | OutputPart::HtmlWithExclusions { html, .. } => {
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
            items.push(TemplateItem::Expression(JsExpr::Raw(CompactString::new(
                expr,
            ))));
        }

        OutputPart::HtmlExpression(expr) => {
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

        // IfBlock, EachBlock, and all other complex parts should never reach here
        // (is_complex_part returns true for them). Fallback to delegation for safety.
        _ => {
            delegate_single_part(part, items, each_counter, store_subs);
        }
    }
}

/// Delegate a single OutputPart to `build_parts_with_store_subs` and push
/// the result as a `TemplateItem::Statement(Raw(...))`.
///
/// Used for self-contained complex parts (IfBlock/EachBlock with await,
/// HtmlExpression with await) that don't depend on cross-part context.
fn delegate_single_part(
    part: &OutputPart,
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
    if !trimmed.is_empty() {
        items.push(TemplateItem::Statement(JsStatement::Raw(
            CompactString::new(trimmed),
        )));
    }
}

/// Delegate all parts in a slice to `build_parts_with_store_subs` and push
/// the result as a `TemplateItem::Statement(Raw(...))`.
///
/// This preserves cross-part context needed by complex parts (Component markers,
/// has_prior_content/has_content_after checks, etc.).
fn delegate_remaining_parts(
    parts: &[OutputPart],
    items: &mut Vec<TemplateItem>,
    each_counter: &mut usize,
    store_subs: &[(&str, &str)],
) {
    let code = ServerCodeGenerator::build_parts_with_store_subs(parts, 0, each_counter, store_subs);
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
/// NOTE: This function is provided for future use. Currently Html parts with
/// interpolations are handled by the `build_parts_with_store_subs` fallback.
#[allow(dead_code)]
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
