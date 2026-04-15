//! Bridge module: converts OutputPart → TemplateItem for AST-based code generation.
//!
//! This module provides a conversion layer between the visitor-produced `OutputPart`
//! list and the AST-based `TemplateItem` representation used by `build_template()`.
//!
//! Currently, the bridge delegates to `build_parts_with_store_subs` for all parts,
//! wrapping the result in a `JsStatement::Raw`. Individual simple-part conversion
//! functions are provided for future use when the bridge handles more variants
//! natively (bypassing the text-based path).

use super::ServerCodeGenerator;
use super::types::{OutputPart, TemplateItem};
use crate::compiler::phases::phase3_transform::js_ast::arena::JsArena;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;
use compact_str::CompactString;

/// Returns true if the part is "simple" — can in principle be converted to a TemplateItem
/// individually without needing cross-part context from `build_parts_with_store_subs`.
///
/// This classification is used for future incremental migration. Parts that may
/// contain `await` expressions trigger special handling in `build_parts_with_store_subs`
/// (e.g., child_block wrapping) and are NOT simple.
#[allow(dead_code)]
fn is_simple_part(part: &OutputPart) -> bool {
    match part {
        // For now, only purely static Html (no interpolations, no await) and
        // metadata-only parts are converted to proper AST. Everything else
        // goes through build_parts_with_store_subs for compatibility.
        OutputPart::Html(html) | OutputPart::HtmlWithExclusions { html, .. } => {
            !html.contains("${") && !super::helpers::html_template_contains_await(html)
        }
        OutputPart::Comment | OutputPart::HydrationAnchor => true,
        OutputPart::ConstDeclaration(_)
        | OutputPart::VarDeclaration(_)
        | OutputPart::RawStatement(_) => true,
        OutputPart::ConstBlockerMetadata { .. } => true,
        // Everything else goes through build_parts_with_store_subs
        _ => false,
    }
}

/// Convert an `OutputPart` list to a `TemplateItem` list for AST-based code generation.
///
/// This is the central bridge function. Currently, it delegates the entire parts
/// list to `build_parts_with_store_subs` and wraps the result in `JsStatement::Raw`.
/// This maintains exact output compatibility with the old text-based path while
/// providing the `TemplateItem` interface that `build_template()` expects.
///
/// In the future, simple parts will be converted to proper AST nodes, and only
/// complex parts will need the `build_parts_with_store_subs` fallback.
///
/// # Arguments
///
/// * `parts` - The output parts produced by SSR visitors
/// * `_arena` - The JS AST arena for allocating expression nodes (unused for now)
/// * `store_subs` - Store subscription name pairs for the component
/// * `each_counter` - Mutable counter for generating unique each-block variable names
pub(crate) fn output_parts_to_template_items(
    parts: &[OutputPart],
    _arena: &JsArena,
    store_subs: &[(&str, &str)],
    each_counter: &mut usize,
) -> Vec<TemplateItem> {
    if parts.is_empty() {
        return Vec::new();
    }

    // Delegate the entire parts list to build_parts_with_store_subs.
    //
    // NOTE: We cannot split individual parts for AST conversion because
    // build_parts_with_store_subs has cross-part state: it coalesces adjacent
    // Html/Expression/RawExpression parts into single $$renderer.push() template
    // literals. Splitting parts would break this coalescing.
    //
    // To properly convert to AST, the visitors themselves need to produce
    // TemplateItem directly (Phase 3), bypassing OutputPart entirely.
    //
    // indent_level = 0 because the codegen's emit_body handles indentation.
    let raw_code =
        ServerCodeGenerator::build_parts_with_store_subs(parts, 0, each_counter, store_subs);
    let trimmed = raw_code.trim();
    if trimmed.is_empty() {
        return Vec::new();
    }

    vec![TemplateItem::Statement(JsStatement::Raw(
        CompactString::new(trimmed),
    ))]
}

/// Convert a single simple OutputPart to a TemplateItem.
///
/// This is provided for future use when the bridge incrementally migrates
/// simple parts to proper AST nodes. Currently not called from the main
/// conversion path (which uses `build_parts_with_store_subs` for all parts).
///
/// # Panics
///
/// Panics if called with a complex (non-simple) part.
#[allow(dead_code)]
fn convert_simple_part(part: &OutputPart, arena: &JsArena) -> Option<TemplateItem> {
    match part {
        OutputPart::Html(html) | OutputPart::HtmlWithExclusions { html, .. } => {
            if html.contains("${") {
                // Html with interpolations needs splitting into string/expression segments.
                // For now, return None to signal "use fallback".
                None
            } else {
                Some(TemplateItem::Expression(JsExpr::Literal(
                    JsLiteral::String(CompactString::new(html)),
                )))
            }
        }

        OutputPart::Expression(expr) => {
            Some(TemplateItem::Expression(JsExpr::Call(JsCallExpression {
                callee: arena.alloc_expr(JsExpr::Member(JsMemberExpression {
                    object: arena.alloc_expr(JsExpr::Identifier("$".into())),
                    property: JsMemberProperty::Identifier("escape".into()),
                    computed: false,
                    optional: false,
                })),
                arguments: vec![JsExpr::Raw(CompactString::new(expr))],
                optional: false,
            })))
        }

        OutputPart::RawExpression(expr) => Some(TemplateItem::Expression(JsExpr::Raw(
            CompactString::new(expr),
        ))),

        OutputPart::HtmlExpression(expr) => {
            Some(TemplateItem::Expression(JsExpr::Call(JsCallExpression {
                callee: arena.alloc_expr(JsExpr::Member(JsMemberExpression {
                    object: arena.alloc_expr(JsExpr::Identifier("$".into())),
                    property: JsMemberProperty::Identifier("html".into()),
                    computed: false,
                    optional: false,
                })),
                arguments: vec![JsExpr::Raw(CompactString::new(expr))],
                optional: false,
            })))
        }

        OutputPart::Comment => Some(TemplateItem::Expression(JsExpr::Literal(
            JsLiteral::String("<!---->".into()),
        ))),

        OutputPart::HydrationAnchor => Some(TemplateItem::Expression(JsExpr::Literal(
            JsLiteral::String("<!>".into()),
        ))),

        OutputPart::ConstDeclaration(decl) => Some(TemplateItem::Statement(JsStatement::Raw(
            CompactString::new(format!("const {};", decl)),
        ))),

        OutputPart::VarDeclaration(decl) => Some(TemplateItem::Statement(JsStatement::Raw(
            CompactString::new(format!("var {};", decl)),
        ))),

        OutputPart::RawStatement(stmt) => Some(TemplateItem::Statement(JsStatement::Raw(
            CompactString::new(stmt),
        ))),

        OutputPart::ConstBlockerMetadata { .. } => None, // metadata-only, not rendered

        _ => panic!("convert_simple_part called with complex part"),
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
    fn test_is_simple_part() {
        // Simple parts
        assert!(is_simple_part(&OutputPart::Html("hello".to_string())));
        assert!(is_simple_part(&OutputPart::Expression("x".to_string())));
        assert!(is_simple_part(&OutputPart::Comment));
        assert!(is_simple_part(&OutputPart::HydrationAnchor));
        assert!(is_simple_part(&OutputPart::ConstDeclaration(
            "x = 1".to_string()
        )));
        assert!(is_simple_part(&OutputPart::VarDeclaration("x".to_string())));
        assert!(is_simple_part(&OutputPart::RawStatement(
            "foo();".to_string()
        )));
        assert!(is_simple_part(&OutputPart::Flush));
        assert!(is_simple_part(&OutputPart::ConstBlockerMetadata {
            blocker_entries: vec![]
        }));

        // Parts with await become complex
        assert!(!is_simple_part(&OutputPart::Html(
            "<div class=\"${await foo()}\">".to_string()
        )));
        assert!(!is_simple_part(&OutputPart::HtmlExpression(
            "await foo()".to_string()
        )));
        assert!(!is_simple_part(&OutputPart::RawExpression(
            "await bar()".to_string()
        )));

        // Parts without await are simple
        assert!(is_simple_part(&OutputPart::HtmlExpression(
            "foo()".to_string()
        )));
        assert!(is_simple_part(&OutputPart::RawExpression(
            "bar()".to_string()
        )));

        // Complex parts (always)
        assert!(!is_simple_part(&OutputPart::IfBlock {
            test_expr: "true".to_string(),
            consequent_body: vec![],
            alternate_body: None,
            is_elseif: false,
        }));
        assert!(!is_simple_part(&OutputPart::EachBlock {
            iterable: "items".to_string(),
            context_name: None,
            index_name: None,
            index_alias: None,
            body: vec![],
            fallback: None,
        }));
    }

    #[test]
    fn test_convert_simple_part() {
        let arena = JsArena::new();

        // Comment -> Expression(Literal("<!---->"))
        let item = convert_simple_part(&OutputPart::Comment, &arena).unwrap();
        match &item {
            TemplateItem::Expression(JsExpr::Literal(JsLiteral::String(s))) => {
                assert_eq!(s.as_str(), "<!---->");
            }
            _ => panic!("Expected string literal for Comment"),
        }

        // HydrationAnchor -> Expression(Literal("<!>"))
        let item = convert_simple_part(&OutputPart::HydrationAnchor, &arena).unwrap();
        match &item {
            TemplateItem::Expression(JsExpr::Literal(JsLiteral::String(s))) => {
                assert_eq!(s.as_str(), "<!>");
            }
            _ => panic!("Expected string literal for HydrationAnchor"),
        }

        // ConstDeclaration -> Statement(Raw("const x = 1;"))
        let item = convert_simple_part(&OutputPart::ConstDeclaration("x = 1".to_string()), &arena)
            .unwrap();
        match &item {
            TemplateItem::Statement(JsStatement::Raw(s)) => {
                assert_eq!(s.as_str(), "const x = 1;");
            }
            _ => panic!("Expected raw statement for ConstDeclaration"),
        }

        // VarDeclaration -> Statement(Raw("var x;"))
        let item =
            convert_simple_part(&OutputPart::VarDeclaration("x".to_string()), &arena).unwrap();
        match &item {
            TemplateItem::Statement(JsStatement::Raw(s)) => {
                assert_eq!(s.as_str(), "var x;");
            }
            _ => panic!("Expected raw statement for VarDeclaration"),
        }

        // Expression -> $.escape(expr)
        let item = convert_simple_part(&OutputPart::Expression("x".to_string()), &arena).unwrap();
        match &item {
            TemplateItem::Expression(JsExpr::Call(call)) => {
                assert_eq!(call.arguments.len(), 1);
                match &call.arguments[0] {
                    JsExpr::Raw(s) => assert_eq!(s.as_str(), "x"),
                    _ => panic!("Expected raw argument"),
                }
            }
            _ => panic!("Expected call expression for Expression"),
        }
    }

    #[test]
    fn test_output_parts_to_template_items_empty() {
        let arena = JsArena::new();
        let items = output_parts_to_template_items(&[], &arena, &[], &mut 0);
        assert!(items.is_empty());
    }

    #[test]
    fn test_output_parts_to_template_items_simple() {
        let arena = JsArena::new();
        let parts = vec![
            OutputPart::Html("<div>".to_string()),
            OutputPart::Expression("name".to_string()),
            OutputPart::Html("</div>".to_string()),
        ];
        let items = output_parts_to_template_items(&parts, &arena, &[], &mut 0);
        // With full delegation, we get a single Raw statement
        assert_eq!(items.len(), 1);
        match &items[0] {
            TemplateItem::Statement(JsStatement::Raw(s)) => {
                assert!(s.contains("$$renderer.push"));
            }
            _ => panic!("Expected raw statement"),
        }
    }
}
