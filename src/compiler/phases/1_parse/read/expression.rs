//! JavaScript expression parsing using OXC.
//!
//! # Svelte Compiler Correspondence
//!
//! This module corresponds to:
//! - `svelte/packages/svelte/src/compiler/phases/1-parse/read/expression.js`
//! - `svelte/packages/svelte/src/compiler/phases/1-parse/acorn.js` (comment handling)
//!
//! ## Differences from Svelte
//!
//! - **Parser backend**: Svelte uses [Acorn](https://github.com/acornjs/acorn) for JavaScript
//!   parsing, while this implementation uses [OXC](https://oxc.rs/) for better performance.
//! - **AST conversion**: This module converts OXC's AST to a `serde_json::Value` format
//!   compatible with Svelte's ESTree-based AST output.
//! - **TypeScript support**: OXC provides native TypeScript support, which is used here
//!   to parse TypeScript expressions without additional configuration.
//! - **Line/column tracking**: This implementation computes ESTree-style `loc` fields
//!   (with `line` and `column`) from OXC's byte offsets using pre-computed line offsets.
//! - **Comment handling**: Comments are attached as `leadingComments` and `trailingComments`
//!   following the ESTree convention. Block comments have their indentation normalized.

use oxc_allocator::Allocator;
use oxc_ast::ast::Expression as OxcExpression;
use oxc_parser::Parser as OxcParser;
use oxc_span::{GetSpan, SourceType};
use serde_json::{Map, Value};

use crate::ast::js::Expression;

// ============================================================================
// Comment handling utilities
// ============================================================================

/// Normalize block comment indentation.
///
/// When a block comment spans multiple lines, this function removes the common
/// leading indentation from each line. This matches Svelte's behavior for
/// preserving comment formatting while removing artificial indentation.
///
/// # Arguments
/// * `value` - The comment text (without /* and */)
/// * `source` - The full source text
/// * `comment_start` - The start position of the comment in the source
fn normalize_block_comment_indentation(value: &str, source: &str, comment_start: usize) -> String {
    // Only normalize if comment contains newlines
    if !value.contains('\n') {
        return value.to_string();
    }

    // Find the indentation at the start of the line where the comment begins
    let mut line_start = comment_start;
    while line_start > 0 && source.as_bytes().get(line_start - 1) != Some(&b'\n') {
        line_start -= 1;
    }

    // Collect whitespace at the start of the line
    let mut indent_end = line_start;
    while indent_end < source.len() {
        match source.as_bytes().get(indent_end) {
            Some(b' ') | Some(b'\t') => indent_end += 1,
            _ => break,
        }
    }

    let indentation = &source[line_start..indent_end];
    if indentation.is_empty() {
        return value.to_string();
    }

    // Remove this indentation from the start of each line in the comment
    let pattern = format!("\n{}", indentation);
    value.replace(&pattern, "\n")
}

/// Create a comment object in ESTree format.
///
/// # Arguments
/// * `kind` - The comment kind (Line or Block)
/// * `value` - The comment text (without // or /* */)
/// * `start` - Start position in the source
/// * `end` - End position in the source
/// * `line_offsets` - Line offset table for location calculation
fn create_comment_object(
    kind: oxc_ast::ast::CommentKind,
    value: String,
    start: usize,
    end: usize,
    _line_offsets: &[usize],
) -> Value {
    let mut obj = Map::new();

    let comment_type = match kind {
        oxc_ast::ast::CommentKind::Line => "Line",
        oxc_ast::ast::CommentKind::Block => "Block",
    };

    obj.insert("type".to_string(), Value::String(comment_type.to_string()));
    obj.insert("value".to_string(), Value::String(value));
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));

    // Note: Svelte's AST does not include 'loc' for comment objects

    Value::Object(obj)
}

/// Extract comment value from raw comment text.
///
/// Strips the comment delimiters (// or /* */) from the raw comment text.
fn extract_comment_value(raw: &str, kind: oxc_ast::ast::CommentKind) -> String {
    match kind {
        oxc_ast::ast::CommentKind::Line => raw.strip_prefix("//").unwrap_or(raw).to_string(),
        oxc_ast::ast::CommentKind::Block => raw
            .strip_prefix("/*")
            .and_then(|s| s.strip_suffix("*/"))
            .unwrap_or(raw)
            .to_string(),
    }
}

/// Parse a JavaScript expression and return it as an Expression.
pub fn parse_expression(content: &str, offset: usize, line_offsets: &[usize]) -> Expression {
    // Try TypeScript first, then fall back to JavaScript
    parse_expression_with_typescript(content, offset, line_offsets, true).unwrap_or_else(|| {
        parse_expression_with_typescript(content, offset, line_offsets, false)
            .unwrap_or_else(|| create_invalid_identifier(offset, offset + content.len()))
    })
}

/// Check if JavaScript expression has parse errors. Returns Some(error_message) if there is an error.
pub fn check_js_parse_error(content: &str) -> Option<String> {
    let allocator = Allocator::default();

    // Try TypeScript first
    let source_type = SourceType::ts();
    let wrapped = format!("({})", content);
    let parser = OxcParser::new(&allocator, &wrapped, source_type);
    let result = parser.parse();

    if result.errors.is_empty() {
        return None;
    }

    // Try JavaScript
    let allocator2 = Allocator::default();
    let source_type2 = SourceType::mjs();
    let parser2 = OxcParser::new(&allocator2, &wrapped, source_type2);
    let result2 = parser2.parse();

    if result2.errors.is_empty() {
        return None;
    }

    // Return the error message
    result2
        .errors
        .first()
        .map(|e| e.message.to_string())
        .or_else(|| result.errors.first().map(|e| e.message.to_string()))
}

/// Create an identifier for invalid expressions (no name, no loc)
fn create_invalid_identifier(start: usize, end: usize) -> Expression {
    let mut obj = Map::new();
    obj.insert("type".to_string(), Value::String("Identifier".to_string()));
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("name".to_string(), Value::String("".to_string()));
    Expression::Value(Value::Object(obj))
}

fn parse_expression_with_typescript(
    content: &str,
    offset: usize,
    line_offsets: &[usize],
    use_typescript: bool,
) -> Option<Expression> {
    let allocator = Allocator::default();
    let source_type = if use_typescript {
        SourceType::ts()
    } else {
        SourceType::mjs()
    };

    // Try to parse as an expression by wrapping it
    let wrapped = format!("({})", content);
    let parser = OxcParser::new(&allocator, &wrapped, source_type);
    let result = parser.parse();

    if result.errors.is_empty() {
        if let Some(oxc_ast::ast::Statement::ExpressionStatement(expr_stmt)) =
            result.program.body.first()
        {
            // Adjust positions: subtract 1 for the opening paren we added
            let mut expr = convert_expression(&expr_stmt.expression, offset, line_offsets);

            // Attach comments to the expression
            if !result.program.comments.is_empty() {
                // Get the actual expression's start and end positions
                let inner_expr = unwrap_parenthesized(&expr_stmt.expression);
                let expr_start = inner_expr.span().start;
                let expr_end = inner_expr.span().end;

                // Collect leading comments (before the expression)
                let leading_comments: Vec<Value> = result
                    .program
                    .comments
                    .iter()
                    .filter(|comment| comment.span.end <= expr_start)
                    .map(|comment| {
                        // Adjust positions: -1 for the paren, then add offset
                        let comment_start = offset + comment.span.start as usize - 1;
                        let comment_end = offset + comment.span.end as usize - 1;

                        // Get raw comment text
                        let raw = &wrapped[comment.span.start as usize..comment.span.end as usize];
                        let mut value = extract_comment_value(raw, comment.kind);

                        // Normalize block comment indentation
                        if comment.kind == oxc_ast::ast::CommentKind::Block {
                            value = normalize_block_comment_indentation(
                                &value,
                                content,
                                comment.span.start as usize - 1,
                            );
                        }

                        create_comment_object(
                            comment.kind,
                            value,
                            comment_start,
                            comment_end,
                            line_offsets,
                        )
                    })
                    .collect();

                // Collect trailing comments (after the expression)
                let trailing_comments: Vec<Value> = result
                    .program
                    .comments
                    .iter()
                    .filter(|comment| comment.span.start >= expr_end)
                    .map(|comment| {
                        // Adjust positions: -1 for the paren, then add offset
                        let comment_start = offset + comment.span.start as usize - 1;
                        let comment_end = offset + comment.span.end as usize - 1;

                        // Get raw comment text
                        let raw = &wrapped[comment.span.start as usize..comment.span.end as usize];
                        let mut value = extract_comment_value(raw, comment.kind);

                        // Normalize block comment indentation
                        if comment.kind == oxc_ast::ast::CommentKind::Block {
                            value = normalize_block_comment_indentation(
                                &value,
                                content,
                                comment.span.start as usize - 1,
                            );
                        }

                        create_comment_object(
                            comment.kind,
                            value,
                            comment_start,
                            comment_end,
                            line_offsets,
                        )
                    })
                    .collect();

                // Attach comments to the expression
                if let Expression::Value(Value::Object(ref mut obj)) = expr {
                    if !leading_comments.is_empty() {
                        obj.insert(
                            "leadingComments".to_string(),
                            Value::Array(leading_comments),
                        );
                    }
                    if !trailing_comments.is_empty() {
                        obj.insert(
                            "trailingComments".to_string(),
                            Value::Array(trailing_comments),
                        );
                    }
                }
            }

            return Some(expr);
        }
    }

    None
}

/// Unwrap ParenthesizedExpression to get the inner expression.
/// This is needed because we wrap expressions in parentheses for parsing.
fn unwrap_parenthesized<'a>(expr: &'a OxcExpression<'a>) -> &'a OxcExpression<'a> {
    match expr {
        OxcExpression::ParenthesizedExpression(paren) => unwrap_parenthesized(&paren.expression),
        _ => expr,
    }
}

/// Parse TypeScript function parameters and return them as Expressions.
/// Input is the content inside parentheses, e.g., "msg: string, count: number"
pub fn parse_typescript_params(
    content: &str,
    offset: usize,
    line_offsets: &[usize],
) -> Vec<Expression> {
    let allocator = Allocator::default();
    // Use TypeScript source type to parse type annotations
    let source_type = SourceType::ts();

    // Wrap as arrow function to parse parameters: "(msg: string) => {}"
    let wrapped = format!("({}) => {{}}", content);
    let parser = OxcParser::new(&allocator, &wrapped, source_type);
    let result = parser.parse();

    let mut params = Vec::new();

    if result.errors.is_empty() {
        if let Some(oxc_ast::ast::Statement::ExpressionStatement(expr_stmt)) =
            result.program.body.first()
        {
            if let OxcExpression::ArrowFunctionExpression(arrow) = &expr_stmt.expression {
                for param in &arrow.params.items {
                    // Adjust offset: -1 for the opening paren we added
                    let param_expr = convert_formal_parameter(param, offset - 1, line_offsets);
                    params.push(param_expr);
                }
            }
        }
    }

    // Fallback: parse as comma-separated simple identifiers
    if params.is_empty() && !content.trim().is_empty() {
        for part in content.split(',') {
            let part = part.trim();
            if !part.is_empty() {
                // Extract just the name (before colon for typed params)
                let name = part.split(':').next().unwrap_or(part).trim();
                let part_offset = offset + content.find(part).unwrap_or(0);
                let expr =
                    create_identifier(name, part_offset, part_offset + name.len(), line_offsets);
                params.push(expr);
            }
        }
    }

    params
}

/// Convert oxc FormalParameter to our Expression format with type annotations.
/// Caller should pass pre-adjusted offset if needed (e.g., offset - 1 for paren-wrapped content).
fn convert_formal_parameter(
    param: &oxc_ast::ast::FormalParameter,
    adjusted_offset: usize,
    line_offsets: &[usize],
) -> Expression {
    use oxc_ast::ast::BindingPatternKind;

    match &param.pattern.kind {
        BindingPatternKind::BindingIdentifier(id) => {
            let start = adjusted_offset + id.span.start as usize;
            let name = id.name.as_str();

            // Check if there's a type annotation
            if let Some(type_ann) = &param.pattern.type_annotation {
                let end = adjusted_offset + type_ann.span.end as usize;

                let mut obj = Map::new();
                obj.insert("type".to_string(), Value::String("Identifier".to_string()));
                obj.insert("start".to_string(), Value::Number((start as i64).into()));
                obj.insert("end".to_string(), Value::Number((end as i64).into()));
                obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
                obj.insert("name".to_string(), Value::String(name.to_string()));

                // Add type annotation
                let type_ann_obj =
                    convert_type_annotation_adjusted(type_ann, adjusted_offset, line_offsets);
                obj.insert("typeAnnotation".to_string(), type_ann_obj);

                Expression::Value(Value::Object(obj))
            } else {
                let end = adjusted_offset + id.span.end as usize;
                create_identifier(name, start, end, line_offsets)
            }
        }
        BindingPatternKind::ObjectPattern(obj_pat) => {
            let start = adjusted_offset + obj_pat.span.start as usize;
            let end = adjusted_offset + obj_pat.span.end as usize;
            // For now, create a placeholder - this needs more work for full destructuring support
            create_identifier("{...}", start, end, line_offsets)
        }
        BindingPatternKind::ArrayPattern(arr_pat) => {
            let start = adjusted_offset + arr_pat.span.start as usize;
            let end = adjusted_offset + arr_pat.span.end as usize;
            create_identifier("[...]", start, end, line_offsets)
        }
        BindingPatternKind::AssignmentPattern(assign_pat) => {
            let start = adjusted_offset + assign_pat.span.start as usize;
            let end = adjusted_offset + assign_pat.span.end as usize;
            create_identifier("=...", start, end, line_offsets)
        }
    }
}

/// Convert type annotation with pre-adjusted offset.
fn convert_type_annotation_adjusted(
    type_ann: &oxc_ast::ast::TSTypeAnnotation,
    adjusted_offset: usize,
    line_offsets: &[usize],
) -> Value {
    let start = adjusted_offset + type_ann.span.start as usize;
    let end = adjusted_offset + type_ann.span.end as usize;

    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("TSTypeAnnotation".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    // Convert the inner type
    let inner_type =
        convert_ts_type_adjusted(&type_ann.type_annotation, adjusted_offset, line_offsets);
    obj.insert("typeAnnotation".to_string(), inner_type);

    Value::Object(obj)
}

/// Convert TSType with pre-adjusted offset.
fn convert_ts_type_adjusted(
    ts_type: &oxc_ast::ast::TSType,
    adjusted_offset: usize,
    line_offsets: &[usize],
) -> Value {
    use oxc_ast::ast::TSType;

    let span = ts_type.span();
    let start = adjusted_offset + span.start as usize;
    let end = adjusted_offset + span.end as usize;

    match ts_type {
        TSType::TSStringKeyword(_) => {
            create_ts_keyword("TSStringKeyword", start, end, line_offsets)
        }
        TSType::TSNumberKeyword(_) => {
            create_ts_keyword("TSNumberKeyword", start, end, line_offsets)
        }
        TSType::TSBooleanKeyword(_) => {
            create_ts_keyword("TSBooleanKeyword", start, end, line_offsets)
        }
        TSType::TSAnyKeyword(_) => create_ts_keyword("TSAnyKeyword", start, end, line_offsets),
        TSType::TSVoidKeyword(_) => create_ts_keyword("TSVoidKeyword", start, end, line_offsets),
        TSType::TSNullKeyword(_) => create_ts_keyword("TSNullKeyword", start, end, line_offsets),
        TSType::TSUndefinedKeyword(_) => {
            create_ts_keyword("TSUndefinedKeyword", start, end, line_offsets)
        }
        TSType::TSTypeReference(type_ref) => {
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("TSTypeReference".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

            // Convert typeName
            let type_name =
                convert_ts_type_name_adjusted(&type_ref.type_name, adjusted_offset, line_offsets);
            obj.insert("typeName".to_string(), type_name);

            Value::Object(obj)
        }
        _ => {
            // Fallback for unsupported types
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("TSUnknownKeyword".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
            Value::Object(obj)
        }
    }
}

/// Convert TSTypeName with pre-adjusted offset.
fn convert_ts_type_name_adjusted(
    type_name: &oxc_ast::ast::TSTypeName,
    adjusted_offset: usize,
    line_offsets: &[usize],
) -> Value {
    match type_name {
        oxc_ast::ast::TSTypeName::IdentifierReference(id) => {
            let start = adjusted_offset + id.span.start as usize;
            let end = adjusted_offset + id.span.end as usize;

            let mut obj = Map::new();
            obj.insert("type".to_string(), Value::String("Identifier".to_string()));
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
            obj.insert("name".to_string(), Value::String(id.name.to_string()));

            Value::Object(obj)
        }
        oxc_ast::ast::TSTypeName::QualifiedName(qualified) => {
            // Handle qualified names like Foo.Bar
            let span = qualified.span;
            let start = adjusted_offset + span.start as usize;
            let end = adjusted_offset + span.end as usize;

            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("TSQualifiedName".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

            Value::Object(obj)
        }
    }
}

/// Convert oxc TSTypeAnnotation to a serde_json::Value.
fn convert_type_annotation(
    type_ann: &oxc_ast::ast::TSTypeAnnotation,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    let start = offset + type_ann.span.start as usize;
    let end = offset + type_ann.span.end as usize;

    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("TSTypeAnnotation".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    // Convert the inner type
    let inner_type = convert_ts_type(&type_ann.type_annotation, offset, line_offsets);
    obj.insert("typeAnnotation".to_string(), inner_type);

    Value::Object(obj)
}

/// Convert oxc TSType to a serde_json::Value.
fn convert_ts_type(ts_type: &oxc_ast::ast::TSType, offset: usize, line_offsets: &[usize]) -> Value {
    use oxc_ast::ast::TSType;

    match ts_type {
        TSType::TSStringKeyword(kw) => {
            let start = offset + kw.span.start as usize;
            let end = offset + kw.span.end as usize;
            create_ts_keyword("TSStringKeyword", start, end, line_offsets)
        }
        TSType::TSNumberKeyword(kw) => {
            let start = offset + kw.span.start as usize;
            let end = offset + kw.span.end as usize;
            create_ts_keyword("TSNumberKeyword", start, end, line_offsets)
        }
        TSType::TSBooleanKeyword(kw) => {
            let start = offset + kw.span.start as usize;
            let end = offset + kw.span.end as usize;
            create_ts_keyword("TSBooleanKeyword", start, end, line_offsets)
        }
        TSType::TSAnyKeyword(kw) => {
            let start = offset + kw.span.start as usize;
            let end = offset + kw.span.end as usize;
            create_ts_keyword("TSAnyKeyword", start, end, line_offsets)
        }
        TSType::TSVoidKeyword(kw) => {
            let start = offset + kw.span.start as usize;
            let end = offset + kw.span.end as usize;
            create_ts_keyword("TSVoidKeyword", start, end, line_offsets)
        }
        TSType::TSNullKeyword(kw) => {
            let start = offset + kw.span.start as usize;
            let end = offset + kw.span.end as usize;
            create_ts_keyword("TSNullKeyword", start, end, line_offsets)
        }
        TSType::TSUndefinedKeyword(kw) => {
            let start = offset + kw.span.start as usize;
            let end = offset + kw.span.end as usize;
            create_ts_keyword("TSUndefinedKeyword", start, end, line_offsets)
        }
        _ => {
            // Fallback for unsupported types
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("TSUnknownKeyword".to_string()),
            );
            Value::Object(obj)
        }
    }
}

/// Create a TypeScript keyword type node.
fn create_ts_keyword(type_name: &str, start: usize, end: usize, line_offsets: &[usize]) -> Value {
    let mut obj = Map::new();
    obj.insert("type".to_string(), Value::String(type_name.to_string()));
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
    Value::Object(obj)
}

/// Convert an oxc Expression to our JSON-based Expression format.
fn convert_expression(expr: &OxcExpression, offset: usize, line_offsets: &[usize]) -> Expression {
    match expr {
        OxcExpression::Identifier(id) => {
            let start = offset + id.span.start as usize - 1; // -1 for the paren we added
            let end = offset + id.span.end as usize - 1;
            create_identifier(&id.name, start, end, line_offsets)
        }
        OxcExpression::BinaryExpression(bin) => {
            let start = offset + bin.span.start as usize - 1;
            let end = offset + bin.span.end as usize - 1;
            create_binary_expression(
                &bin.left,
                &bin.operator,
                &bin.right,
                start,
                end,
                offset,
                line_offsets,
            )
        }
        OxcExpression::NumericLiteral(num) => {
            let start = offset + num.span.start as usize - 1;
            let end = offset + num.span.end as usize - 1;
            let raw = num.raw.as_ref().map(|a| a.as_str()).unwrap_or("");
            create_numeric_literal(num.value, raw, start, end, line_offsets)
        }
        OxcExpression::StringLiteral(str_lit) => {
            let start = offset + str_lit.span.start as usize - 1;
            let end = offset + str_lit.span.end as usize - 1;
            let raw = str_lit.raw.as_ref().map(|a| a.as_str()).unwrap_or("");
            create_string_literal(&str_lit.value, raw, start, end, line_offsets)
        }
        OxcExpression::BooleanLiteral(bool_lit) => {
            let start = offset + bool_lit.span.start as usize - 1;
            let end = offset + bool_lit.span.end as usize - 1;
            let raw = if bool_lit.value { "true" } else { "false" };
            create_literal(Value::Bool(bool_lit.value), raw, start, end, line_offsets)
        }
        OxcExpression::NullLiteral(null_lit) => {
            let start = offset + null_lit.span.start as usize - 1;
            let end = offset + null_lit.span.end as usize - 1;
            create_literal(Value::Null, "null", start, end, line_offsets)
        }
        OxcExpression::CallExpression(call) => {
            let start = offset + call.span.start as usize - 1;
            let end = offset + call.span.end as usize - 1;
            create_call_expression(call, start, end, offset, line_offsets)
        }
        OxcExpression::StaticMemberExpression(member) => {
            let start = offset + member.span.start as usize - 1;
            let end = offset + member.span.end as usize - 1;
            create_static_member_expression(member, start, end, offset, line_offsets)
        }
        OxcExpression::ComputedMemberExpression(member) => {
            let start = offset + member.span.start as usize - 1;
            let end = offset + member.span.end as usize - 1;
            create_computed_member_expression(member, start, end, offset, line_offsets)
        }
        OxcExpression::ParenthesizedExpression(paren) => {
            // For parenthesized expressions, just return the inner expression
            convert_expression(&paren.expression, offset, line_offsets)
        }
        OxcExpression::LogicalExpression(logical) => {
            let start = offset + logical.span.start as usize - 1;
            let end = offset + logical.span.end as usize - 1;
            create_logical_expression(logical, start, end, offset, line_offsets)
        }
        OxcExpression::UnaryExpression(unary) => {
            let start = offset + unary.span.start as usize - 1;
            let end = offset + unary.span.end as usize - 1;
            create_unary_expression(unary, start, end, offset, line_offsets)
        }
        OxcExpression::ConditionalExpression(cond) => {
            let start = offset + cond.span.start as usize - 1;
            let end = offset + cond.span.end as usize - 1;
            create_conditional_expression(cond, start, end, offset, line_offsets)
        }
        OxcExpression::ArrayExpression(arr) => {
            let start = offset + arr.span.start as usize - 1;
            let end = offset + arr.span.end as usize - 1;
            create_array_expression(arr, start, end, offset, line_offsets)
        }
        OxcExpression::ObjectExpression(obj) => {
            let start = offset + obj.span.start as usize - 1;
            let end = offset + obj.span.end as usize - 1;
            create_object_expression(obj, start, end, offset, line_offsets)
        }
        OxcExpression::ArrowFunctionExpression(arrow) => {
            let start = offset + arrow.span.start as usize - 1;
            let end = offset + arrow.span.end as usize - 1;
            create_arrow_function(arrow, start, end, offset, line_offsets)
        }
        OxcExpression::TemplateLiteral(template) => {
            let start = offset + template.span.start as usize - 1;
            let end = offset + template.span.end as usize - 1;
            create_template_literal(template, start, end, offset, line_offsets)
        }
        OxcExpression::AssignmentExpression(assign) => {
            let start = offset + assign.span.start as usize - 1;
            let end = offset + assign.span.end as usize - 1;
            create_assignment_expression(assign, start, end, offset, line_offsets)
        }
        OxcExpression::UpdateExpression(update) => {
            let start = offset + update.span.start as usize - 1;
            let end = offset + update.span.end as usize - 1;
            create_update_expression(update, start, end, offset, line_offsets)
        }
        OxcExpression::SequenceExpression(seq) => {
            let start = offset + seq.span.start as usize - 1;
            let end = offset + seq.span.end as usize - 1;
            create_sequence_expression(seq, start, end, offset, line_offsets)
        }
        // TypeScript expression wrappers - unwrap and return the inner expression
        // This matches Svelte's behavior of removing TypeScript syntax
        OxcExpression::TSAsExpression(ts_as) => {
            convert_expression(&ts_as.expression, offset, line_offsets)
        }
        OxcExpression::TSSatisfiesExpression(ts_satisfies) => {
            convert_expression(&ts_satisfies.expression, offset, line_offsets)
        }
        OxcExpression::TSNonNullExpression(ts_non_null) => {
            convert_expression(&ts_non_null.expression, offset, line_offsets)
        }
        OxcExpression::TSTypeAssertion(ts_assertion) => {
            convert_expression(&ts_assertion.expression, offset, line_offsets)
        }
        OxcExpression::TSInstantiationExpression(ts_inst) => {
            convert_expression(&ts_inst.expression, offset, line_offsets)
        }
        // Add more expression types as needed
        _ => {
            // Fallback for unsupported expression types
            let span = expr.span();
            let start = offset + span.start as usize - 1;
            let end = offset + span.end as usize - 1;
            create_identifier("unknown", start, end, line_offsets)
        }
    }
}

fn create_identifier(name: &str, start: usize, end: usize, line_offsets: &[usize]) -> Expression {
    let mut obj = Map::new();
    obj.insert("type".to_string(), Value::String("Identifier".to_string()));
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
    obj.insert("name".to_string(), Value::String(name.to_string()));
    Expression::Value(Value::Object(obj))
}

/// Create an identifier for binding patterns (uses adjusted column calculation).
fn create_identifier_for_binding(
    name: &str,
    start: usize,
    end: usize,
    line_offsets: &[usize],
) -> Value {
    let mut obj = Map::new();
    obj.insert("type".to_string(), Value::String("Identifier".to_string()));
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert(
        "loc".to_string(),
        create_loc_for_binding(start, end, line_offsets),
    );
    obj.insert("name".to_string(), Value::String(name.to_string()));
    Value::Object(obj)
}

/// Create an identifier for top-level binding pattern (e.g., simple "item" in each block).
/// Uses character field in loc and puts name before loc for correct field ordering.
fn create_identifier_for_binding_toplevel(
    name: &str,
    start: usize,
    end: usize,
    line_offsets: &[usize],
) -> Value {
    let mut obj = Map::new();
    obj.insert("type".to_string(), Value::String("Identifier".to_string()));
    obj.insert("name".to_string(), Value::String(name.to_string()));
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert(
        "loc".to_string(),
        create_loc_for_binding_identifier(start, end, line_offsets),
    );
    Value::Object(obj)
}

/// Create a literal for binding patterns (uses adjusted column calculation).
fn create_literal_for_binding(
    value: Value,
    raw: &str,
    start: usize,
    end: usize,
    line_offsets: &[usize],
) -> Value {
    let mut obj = Map::new();
    obj.insert("type".to_string(), Value::String("Literal".to_string()));
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert(
        "loc".to_string(),
        create_loc_for_binding(start, end, line_offsets),
    );
    obj.insert("value".to_string(), value);
    obj.insert("raw".to_string(), Value::String(raw.to_string()));
    Value::Object(obj)
}

/// Create a numeric literal for binding patterns.
fn create_numeric_literal_for_binding(
    value: f64,
    raw: &str,
    start: usize,
    end: usize,
    line_offsets: &[usize],
) -> Value {
    let mut obj = Map::new();
    obj.insert("type".to_string(), Value::String("Literal".to_string()));
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert(
        "loc".to_string(),
        create_loc_for_binding(start, end, line_offsets),
    );
    obj.insert(
        "value".to_string(),
        Value::Number(serde_json::Number::from_f64(value).unwrap_or_else(|| (value as i64).into())),
    );
    obj.insert("raw".to_string(), Value::String(raw.to_string()));
    Value::Object(obj)
}

/// Create a string literal for binding patterns.
fn create_string_literal_for_binding(
    value: &str,
    raw: &str,
    start: usize,
    end: usize,
    line_offsets: &[usize],
) -> Value {
    let mut obj = Map::new();
    obj.insert("type".to_string(), Value::String("Literal".to_string()));
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert(
        "loc".to_string(),
        create_loc_for_binding(start, end, line_offsets),
    );
    obj.insert("value".to_string(), Value::String(value.to_string()));
    obj.insert("raw".to_string(), Value::String(raw.to_string()));
    Value::Object(obj)
}

/// Create an identifier with character field in loc.
/// Used for Svelte-level identifiers like snippet names.
pub fn create_identifier_with_character(
    name: &str,
    start: usize,
    end: usize,
    line_offsets: &[usize],
) -> Expression {
    let mut obj = Map::new();
    obj.insert("type".to_string(), Value::String("Identifier".to_string()));
    obj.insert("name".to_string(), Value::String(name.to_string()));
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert(
        "loc".to_string(),
        create_loc_with_character(start, end, line_offsets),
    );
    Expression::Value(Value::Object(obj))
}

fn create_literal(
    value: Value,
    raw: &str,
    start: usize,
    end: usize,
    line_offsets: &[usize],
) -> Expression {
    let mut obj = Map::new();
    obj.insert("type".to_string(), Value::String("Literal".to_string()));
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
    obj.insert("value".to_string(), value);
    obj.insert("raw".to_string(), Value::String(raw.to_string()));
    Expression::Value(Value::Object(obj))
}

fn create_numeric_literal(
    value: f64,
    raw: &str,
    start: usize,
    end: usize,
    line_offsets: &[usize],
) -> Expression {
    let mut obj = Map::new();
    obj.insert("type".to_string(), Value::String("Literal".to_string()));
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
    // Use integer if it's a whole number
    if value.fract() == 0.0 && value.abs() < i64::MAX as f64 {
        obj.insert("value".to_string(), Value::Number((value as i64).into()));
    } else {
        obj.insert(
            "value".to_string(),
            serde_json::Number::from_f64(value)
                .map(Value::Number)
                .unwrap_or(Value::Null),
        );
    }
    obj.insert("raw".to_string(), Value::String(raw.to_string()));
    Expression::Value(Value::Object(obj))
}

fn create_string_literal(
    value: &str,
    raw: &str,
    start: usize,
    end: usize,
    line_offsets: &[usize],
) -> Expression {
    let mut obj = Map::new();
    obj.insert("type".to_string(), Value::String("Literal".to_string()));
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
    obj.insert("value".to_string(), Value::String(value.to_string()));
    obj.insert("raw".to_string(), Value::String(raw.to_string()));
    Expression::Value(Value::Object(obj))
}

fn create_binary_expression(
    left: &OxcExpression,
    operator: &oxc_ast::ast::BinaryOperator,
    right: &OxcExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("BinaryExpression".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    let left_expr = convert_expression(left, offset, line_offsets);
    let right_expr = convert_expression(right, offset, line_offsets);

    obj.insert("left".to_string(), left_expr.as_json().clone());
    obj.insert(
        "operator".to_string(),
        Value::String(binary_operator_to_string(operator)),
    );
    obj.insert("right".to_string(), right_expr.as_json().clone());

    Expression::Value(Value::Object(obj))
}

fn create_logical_expression(
    logical: &oxc_ast::ast::LogicalExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("LogicalExpression".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    let left_expr = convert_expression(&logical.left, offset, line_offsets);
    let right_expr = convert_expression(&logical.right, offset, line_offsets);

    obj.insert("left".to_string(), left_expr.as_json().clone());
    obj.insert(
        "operator".to_string(),
        Value::String(logical_operator_to_string(&logical.operator)),
    );
    obj.insert("right".to_string(), right_expr.as_json().clone());

    Expression::Value(Value::Object(obj))
}

fn create_unary_expression(
    unary: &oxc_ast::ast::UnaryExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("UnaryExpression".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
    obj.insert(
        "operator".to_string(),
        Value::String(unary_operator_to_string(&unary.operator)),
    );
    obj.insert("prefix".to_string(), Value::Bool(true));

    let argument = convert_expression(&unary.argument, offset, line_offsets);
    obj.insert("argument".to_string(), argument.as_json().clone());

    Expression::Value(Value::Object(obj))
}

fn create_conditional_expression(
    cond: &oxc_ast::ast::ConditionalExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("ConditionalExpression".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    let test = convert_expression(&cond.test, offset, line_offsets);
    let consequent = convert_expression(&cond.consequent, offset, line_offsets);
    let alternate = convert_expression(&cond.alternate, offset, line_offsets);

    obj.insert("test".to_string(), test.as_json().clone());
    obj.insert("consequent".to_string(), consequent.as_json().clone());
    obj.insert("alternate".to_string(), alternate.as_json().clone());

    Expression::Value(Value::Object(obj))
}

fn create_call_expression(
    call: &oxc_ast::ast::CallExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("CallExpression".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    let callee = convert_expression(&call.callee, offset, line_offsets);
    obj.insert("callee".to_string(), callee.as_json().clone());

    let args: Vec<Value> = call
        .arguments
        .iter()
        .filter_map(|arg| {
            match arg {
                oxc_ast::ast::Argument::SpreadElement(_) => None, // Simplified
                _ => {
                    let expr = arg.to_expression();
                    Some(
                        convert_expression(expr, offset, line_offsets)
                            .as_json()
                            .clone(),
                    )
                }
            }
        })
        .collect();
    obj.insert("arguments".to_string(), Value::Array(args));
    obj.insert("optional".to_string(), Value::Bool(call.optional));

    Expression::Value(Value::Object(obj))
}

fn create_static_member_expression(
    member: &oxc_ast::ast::StaticMemberExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("MemberExpression".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    let object = convert_expression(&member.object, offset, line_offsets);
    obj.insert("object".to_string(), object.as_json().clone());

    let prop_start = offset + member.property.span.start as usize - 1;
    let prop_end = offset + member.property.span.end as usize - 1;
    let property = create_identifier(&member.property.name, prop_start, prop_end, line_offsets);
    obj.insert("property".to_string(), property.as_json().clone());
    obj.insert("computed".to_string(), Value::Bool(false));
    obj.insert("optional".to_string(), Value::Bool(member.optional));

    Expression::Value(Value::Object(obj))
}

fn create_computed_member_expression(
    member: &oxc_ast::ast::ComputedMemberExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("MemberExpression".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    let object = convert_expression(&member.object, offset, line_offsets);
    obj.insert("object".to_string(), object.as_json().clone());

    let property = convert_expression(&member.expression, offset, line_offsets);
    obj.insert("property".to_string(), property.as_json().clone());
    obj.insert("computed".to_string(), Value::Bool(true));
    obj.insert("optional".to_string(), Value::Bool(member.optional));

    Expression::Value(Value::Object(obj))
}

fn create_array_expression(
    arr: &oxc_ast::ast::ArrayExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("ArrayExpression".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    let elements: Vec<Value> = arr
        .elements
        .iter()
        .map(|elem| match elem {
            oxc_ast::ast::ArrayExpressionElement::SpreadElement(_) => Value::Null,
            oxc_ast::ast::ArrayExpressionElement::Elision(_) => Value::Null,
            _ => {
                let expr = elem.to_expression();
                convert_expression(expr, offset, line_offsets)
                    .as_json()
                    .clone()
            }
        })
        .collect();
    obj.insert("elements".to_string(), Value::Array(elements));

    Expression::Value(Value::Object(obj))
}

fn create_object_expression(
    obj_expr: &oxc_ast::ast::ObjectExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("ObjectExpression".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    // Convert properties
    let properties: Vec<Value> = obj_expr
        .properties
        .iter()
        .map(|prop| match prop {
            oxc_ast::ast::ObjectPropertyKind::ObjectProperty(p) => {
                let prop_start = offset + p.span.start as usize - 1;
                let prop_end = offset + p.span.end as usize - 1;

                let mut prop_obj = Map::new();
                prop_obj.insert("type".to_string(), Value::String("Property".to_string()));
                prop_obj.insert(
                    "start".to_string(),
                    Value::Number((prop_start as i64).into()),
                );
                prop_obj.insert("end".to_string(), Value::Number((prop_end as i64).into()));
                prop_obj.insert(
                    "loc".to_string(),
                    create_loc(prop_start, prop_end, line_offsets),
                );
                prop_obj.insert("method".to_string(), Value::Bool(p.method));
                prop_obj.insert("shorthand".to_string(), Value::Bool(p.shorthand));
                prop_obj.insert("computed".to_string(), Value::Bool(p.computed));

                // Convert key
                let key = convert_property_key_for_expr(&p.key, offset, line_offsets);
                prop_obj.insert("key".to_string(), key);

                // Convert value
                let value = convert_expression(&p.value, offset, line_offsets);
                prop_obj.insert("value".to_string(), value.as_json().clone());

                // Kind
                let kind = match p.kind {
                    oxc_ast::ast::PropertyKind::Init => "init",
                    oxc_ast::ast::PropertyKind::Get => "get",
                    oxc_ast::ast::PropertyKind::Set => "set",
                };
                prop_obj.insert("kind".to_string(), Value::String(kind.to_string()));

                Value::Object(prop_obj)
            }
            oxc_ast::ast::ObjectPropertyKind::SpreadProperty(spread) => {
                let spread_start = offset + spread.span.start as usize - 1;
                let spread_end = offset + spread.span.end as usize - 1;

                let mut spread_obj = Map::new();
                spread_obj.insert(
                    "type".to_string(),
                    Value::String("SpreadElement".to_string()),
                );
                spread_obj.insert(
                    "start".to_string(),
                    Value::Number((spread_start as i64).into()),
                );
                spread_obj.insert("end".to_string(), Value::Number((spread_end as i64).into()));
                spread_obj.insert(
                    "loc".to_string(),
                    create_loc(spread_start, spread_end, line_offsets),
                );

                let argument = convert_expression(&spread.argument, offset, line_offsets);
                spread_obj.insert("argument".to_string(), argument.as_json().clone());

                Value::Object(spread_obj)
            }
        })
        .collect();

    obj.insert("properties".to_string(), Value::Array(properties));

    Expression::Value(Value::Object(obj))
}

/// Convert property key with -1 adjustment for expression parsing context
fn convert_property_key_for_expr(
    key: &oxc_ast::ast::PropertyKey,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    match key {
        oxc_ast::ast::PropertyKey::StaticIdentifier(id) => {
            let start = offset + id.span.start as usize - 1;
            let end = offset + id.span.end as usize - 1;
            create_identifier(&id.name, start, end, line_offsets)
                .as_json()
                .clone()
        }
        oxc_ast::ast::PropertyKey::PrivateIdentifier(id) => {
            let start = offset + id.span.start as usize - 1;
            let end = offset + id.span.end as usize - 1;
            create_identifier(&id.name, start, end, line_offsets)
                .as_json()
                .clone()
        }
        _ => {
            // For computed keys and other expressions
            let expr = key.as_expression();
            if let Some(expr) = expr {
                convert_expression(expr, offset, line_offsets)
                    .as_json()
                    .clone()
            } else {
                Value::Null
            }
        }
    }
}

fn create_assignment_expression(
    assign: &oxc_ast::ast::AssignmentExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("AssignmentExpression".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    // Convert operator
    let operator = assignment_operator_to_string(&assign.operator);
    obj.insert("operator".to_string(), Value::String(operator));

    // Convert left side (AssignmentTarget)
    let left = convert_assignment_target(&assign.left, offset, line_offsets);
    obj.insert("left".to_string(), left);

    // Convert right side
    let right = convert_expression(&assign.right, offset, line_offsets);
    obj.insert("right".to_string(), right.as_json().clone());

    Expression::Value(Value::Object(obj))
}

fn assignment_operator_to_string(op: &oxc_ast::ast::AssignmentOperator) -> String {
    use oxc_ast::ast::AssignmentOperator::*;
    match op {
        Assign => "=",
        Addition => "+=",
        Subtraction => "-=",
        Multiplication => "*=",
        Division => "/=",
        Remainder => "%=",
        Exponential => "**=",
        BitwiseAnd => "&=",
        BitwiseOR => "|=",
        BitwiseXOR => "^=",
        ShiftLeft => "<<=",
        ShiftRight => ">>=",
        ShiftRightZeroFill => ">>>=",
        LogicalAnd => "&&=",
        LogicalOr => "||=",
        LogicalNullish => "??=",
    }
    .to_string()
}

fn convert_assignment_target(
    target: &oxc_ast::ast::AssignmentTarget,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    use oxc_ast::ast::AssignmentTarget;

    match target {
        AssignmentTarget::AssignmentTargetIdentifier(id) => {
            let start = offset + id.span.start as usize - 1;
            let end = offset + id.span.end as usize - 1;
            create_identifier(&id.name, start, end, line_offsets)
                .as_json()
                .clone()
        }
        AssignmentTarget::StaticMemberExpression(member) => {
            let start = offset + member.span.start as usize - 1;
            let end = offset + member.span.end as usize - 1;
            create_static_member_expression(member, start, end, offset, line_offsets)
                .as_json()
                .clone()
        }
        AssignmentTarget::ComputedMemberExpression(member) => {
            let start = offset + member.span.start as usize - 1;
            let end = offset + member.span.end as usize - 1;
            create_computed_member_expression(member, start, end, offset, line_offsets)
                .as_json()
                .clone()
        }
        _ => {
            // Fallback for complex patterns
            Value::Null
        }
    }
}

fn create_update_expression(
    update: &oxc_ast::ast::UpdateExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("UpdateExpression".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    let operator = match update.operator {
        oxc_ast::ast::UpdateOperator::Increment => "++",
        oxc_ast::ast::UpdateOperator::Decrement => "--",
    };
    obj.insert("operator".to_string(), Value::String(operator.to_string()));
    obj.insert("prefix".to_string(), Value::Bool(update.prefix));

    // Convert argument (SimpleAssignmentTarget)
    let argument = convert_simple_assignment_target(&update.argument, offset, line_offsets);
    obj.insert("argument".to_string(), argument);

    Expression::Value(Value::Object(obj))
}

fn create_sequence_expression(
    seq: &oxc_ast::ast::SequenceExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("SequenceExpression".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    // Convert expressions
    let expressions: Vec<Value> = seq
        .expressions
        .iter()
        .map(|expr| {
            convert_expression(expr, offset, line_offsets)
                .as_json()
                .clone()
        })
        .collect();
    obj.insert("expressions".to_string(), Value::Array(expressions));

    Expression::Value(Value::Object(obj))
}

fn convert_simple_assignment_target(
    target: &oxc_ast::ast::SimpleAssignmentTarget,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    use oxc_ast::ast::SimpleAssignmentTarget;

    match target {
        SimpleAssignmentTarget::AssignmentTargetIdentifier(id) => {
            let start = offset + id.span.start as usize - 1;
            let end = offset + id.span.end as usize - 1;
            create_identifier(&id.name, start, end, line_offsets)
                .as_json()
                .clone()
        }
        SimpleAssignmentTarget::StaticMemberExpression(member) => {
            let start = offset + member.span.start as usize - 1;
            let end = offset + member.span.end as usize - 1;
            create_static_member_expression(member, start, end, offset, line_offsets)
                .as_json()
                .clone()
        }
        SimpleAssignmentTarget::ComputedMemberExpression(member) => {
            let start = offset + member.span.start as usize - 1;
            let end = offset + member.span.end as usize - 1;
            create_computed_member_expression(member, start, end, offset, line_offsets)
                .as_json()
                .clone()
        }
        _ => Value::Null,
    }
}

fn create_arrow_function(
    arrow: &oxc_ast::ast::ArrowFunctionExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("ArrowFunctionExpression".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
    obj.insert("id".to_string(), Value::Null);
    obj.insert("expression".to_string(), Value::Bool(arrow.expression));
    obj.insert("generator".to_string(), Value::Bool(false));
    obj.insert("async".to_string(), Value::Bool(arrow.r#async));

    // Convert params - pass offset - 1 because we wrapped content in parens for parsing
    let params: Vec<Value> = arrow
        .params
        .items
        .iter()
        .map(|param| {
            convert_formal_parameter(param, offset - 1, line_offsets)
                .as_json()
                .clone()
        })
        .collect();
    obj.insert("params".to_string(), Value::Array(params));

    // Convert body - check if this is an expression body or block body
    let body = if arrow.expression {
        // Expression body: () => expr - extract the expression from the body
        if let Some(oxc_ast::ast::Statement::ExpressionStatement(expr_stmt)) =
            arrow.body.statements.first()
        {
            convert_expression(&expr_stmt.expression, offset, line_offsets)
                .as_json()
                .clone()
        } else {
            convert_arrow_body(&arrow.body, offset, line_offsets)
        }
    } else {
        // Block body: () => { ... }
        convert_arrow_body(&arrow.body, offset, line_offsets)
    };
    obj.insert("body".to_string(), body);

    Expression::Value(Value::Object(obj))
}

/// Convert arrow function body to JSON Value (for block bodies).
fn convert_arrow_body(
    body: &oxc_ast::ast::FunctionBody,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    let start = offset + body.span.start as usize - 1;
    let end = offset + body.span.end as usize - 1;

    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("BlockStatement".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    // Convert statements in the body
    let body_stmts: Vec<Value> = body
        .statements
        .iter()
        .filter_map(|stmt| convert_statement(stmt, offset, line_offsets))
        .collect();
    obj.insert("body".to_string(), Value::Array(body_stmts));

    Value::Object(obj)
}

/// Convert a statement to JSON Value.
fn convert_statement(
    stmt: &oxc_ast::ast::Statement,
    offset: usize,
    line_offsets: &[usize],
) -> Option<Value> {
    match stmt {
        oxc_ast::ast::Statement::VariableDeclaration(decl) => {
            Some(convert_variable_declaration(decl, offset, line_offsets))
        }
        oxc_ast::ast::Statement::ExpressionStatement(expr_stmt) => {
            let start = offset + expr_stmt.span.start as usize - 1;
            let end = offset + expr_stmt.span.end as usize - 1;

            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("ExpressionStatement".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
            obj.insert(
                "expression".to_string(),
                convert_expression(&expr_stmt.expression, offset, line_offsets)
                    .as_json()
                    .clone(),
            );

            Some(Value::Object(obj))
        }
        _ => None, // Skip other statement types for now
    }
}

/// Convert a variable declaration to JSON Value.
fn convert_variable_declaration(
    decl: &oxc_ast::ast::VariableDeclaration,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    let start = offset + decl.span.start as usize - 1;
    let end = offset + decl.span.end as usize - 1;

    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("VariableDeclaration".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
    obj.insert(
        "kind".to_string(),
        Value::String(
            match decl.kind {
                oxc_ast::ast::VariableDeclarationKind::Var => "var",
                oxc_ast::ast::VariableDeclarationKind::Const => "const",
                oxc_ast::ast::VariableDeclarationKind::Let => "let",
                oxc_ast::ast::VariableDeclarationKind::Using => "using",
                oxc_ast::ast::VariableDeclarationKind::AwaitUsing => "await using",
            }
            .to_string(),
        ),
    );

    // Convert declarations
    let declarations: Vec<Value> = decl
        .declarations
        .iter()
        .map(|d| convert_variable_declarator(d, offset, line_offsets))
        .collect();
    obj.insert("declarations".to_string(), Value::Array(declarations));

    Value::Object(obj)
}

/// Convert a variable declarator to JSON Value.
fn convert_variable_declarator(
    decl: &oxc_ast::ast::VariableDeclarator,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    let start = offset + decl.span.start as usize - 1;
    let end = offset + decl.span.end as usize - 1;

    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("VariableDeclarator".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    // Convert id (pattern)
    let id = convert_binding_pattern_for_decl(&decl.id, offset, line_offsets);
    obj.insert("id".to_string(), id);

    // Convert init
    let init = decl
        .init
        .as_ref()
        .map(|expr| {
            convert_expression(expr, offset, line_offsets)
                .as_json()
                .clone()
        })
        .unwrap_or(Value::Null);
    obj.insert("init".to_string(), init);

    Value::Object(obj)
}

/// Convert a binding pattern for variable declarations.
fn convert_binding_pattern_for_decl(
    pattern: &oxc_ast::ast::BindingPattern,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    match &pattern.kind {
        oxc_ast::ast::BindingPatternKind::BindingIdentifier(id) => {
            let start = offset + id.span.start as usize - 1;
            let end = offset + id.span.end as usize - 1;
            let mut obj = Map::new();
            obj.insert("type".to_string(), Value::String("Identifier".to_string()));
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
            obj.insert("name".to_string(), Value::String(id.name.to_string()));

            // Add type annotation if present
            if let Some(type_ann) = &pattern.type_annotation {
                let ann_start = offset + type_ann.span.start as usize - 1;
                let ann_end = offset + type_ann.span.end as usize - 1;
                obj.insert(
                    "typeAnnotation".to_string(),
                    convert_type_annotation_basic(
                        type_ann,
                        ann_start,
                        ann_end,
                        offset,
                        line_offsets,
                    ),
                );
            }

            Value::Object(obj)
        }
        _ => Value::Null, // Simplified for now
    }
}

/// Convert a type annotation for declarations.
/// Note: offset should be the raw document offset. This function applies -1 adjustment
/// for the inner type because we're in paren-wrapped expression context.
fn convert_type_annotation_basic(
    type_ann: &oxc_ast::ast::TSTypeAnnotation,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("TSTypeAnnotation".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    // Convert the inner type annotation with -1 adjustment for paren-wrapped context
    let inner = convert_ts_type_adjusted(&type_ann.type_annotation, offset - 1, line_offsets);
    obj.insert("typeAnnotation".to_string(), inner);

    Value::Object(obj)
}

fn create_template_literal(
    template: &oxc_ast::ast::TemplateLiteral,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("TemplateLiteral".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    // Convert quasis
    let quasis: Vec<Value> = template
        .quasis
        .iter()
        .map(|quasi| {
            let q_start = offset + quasi.span.start as usize - 1;
            let q_end = offset + quasi.span.end as usize - 1;

            let mut q_obj = Map::new();
            q_obj.insert(
                "type".to_string(),
                Value::String("TemplateElement".to_string()),
            );
            q_obj.insert("start".to_string(), Value::Number((q_start as i64).into()));
            q_obj.insert("end".to_string(), Value::Number((q_end as i64).into()));
            q_obj.insert("loc".to_string(), create_loc(q_start, q_end, line_offsets));
            q_obj.insert("tail".to_string(), Value::Bool(quasi.tail));

            let mut value_obj = Map::new();
            value_obj.insert(
                "raw".to_string(),
                Value::String(quasi.value.raw.to_string()),
            );
            value_obj.insert(
                "cooked".to_string(),
                quasi
                    .value
                    .cooked
                    .as_ref()
                    .map(|s| Value::String(s.to_string()))
                    .unwrap_or(Value::Null),
            );
            q_obj.insert("value".to_string(), Value::Object(value_obj));

            Value::Object(q_obj)
        })
        .collect();
    obj.insert("quasis".to_string(), Value::Array(quasis));

    // Convert expressions
    let expressions: Vec<Value> = template
        .expressions
        .iter()
        .map(|expr| {
            convert_expression(expr, offset, line_offsets)
                .as_json()
                .clone()
        })
        .collect();
    obj.insert("expressions".to_string(), Value::Array(expressions));

    Expression::Value(Value::Object(obj))
}

fn binary_operator_to_string(op: &oxc_ast::ast::BinaryOperator) -> String {
    use oxc_ast::ast::BinaryOperator::*;
    match op {
        Equality => "==",
        Inequality => "!=",
        StrictEquality => "===",
        StrictInequality => "!==",
        LessThan => "<",
        LessEqualThan => "<=",
        GreaterThan => ">",
        GreaterEqualThan => ">=",
        Addition => "+",
        Subtraction => "-",
        Multiplication => "*",
        Division => "/",
        Remainder => "%",
        Exponential => "**",
        BitwiseAnd => "&",
        BitwiseOR => "|",
        BitwiseXOR => "^",
        ShiftLeft => "<<",
        ShiftRight => ">>",
        ShiftRightZeroFill => ">>>",
        In => "in",
        Instanceof => "instanceof",
    }
    .to_string()
}

fn logical_operator_to_string(op: &oxc_ast::ast::LogicalOperator) -> String {
    use oxc_ast::ast::LogicalOperator::*;
    match op {
        And => "&&",
        Or => "||",
        Coalesce => "??",
    }
    .to_string()
}

fn unary_operator_to_string(op: &oxc_ast::ast::UnaryOperator) -> String {
    use oxc_ast::ast::UnaryOperator::*;
    match op {
        UnaryNegation => "-",
        UnaryPlus => "+",
        LogicalNot => "!",
        BitwiseNot => "~",
        Typeof => "typeof",
        Void => "void",
        Delete => "delete",
    }
    .to_string()
}

fn create_loc(start: usize, end: usize, line_offsets: &[usize]) -> Value {
    let start_loc = get_line_column(start, line_offsets);
    let end_loc = get_line_column(end, line_offsets);

    let mut loc = Map::new();

    let mut start_obj = Map::new();
    start_obj.insert(
        "line".to_string(),
        Value::Number((start_loc.0 as i64).into()),
    );
    start_obj.insert(
        "column".to_string(),
        Value::Number((start_loc.1 as i64).into()),
    );

    let mut end_obj = Map::new();
    end_obj.insert("line".to_string(), Value::Number((end_loc.0 as i64).into()));
    end_obj.insert(
        "column".to_string(),
        Value::Number((end_loc.1 as i64).into()),
    );

    loc.insert("start".to_string(), Value::Object(start_obj));
    loc.insert("end".to_string(), Value::Object(end_obj));

    Value::Object(loc)
}

/// Create a loc object with character field included.
/// Used for Svelte-level identifiers like snippet names.
fn create_loc_with_character(start: usize, end: usize, line_offsets: &[usize]) -> Value {
    let start_loc = get_line_column(start, line_offsets);
    let end_loc = get_line_column(end, line_offsets);

    let mut loc = Map::new();

    let mut start_obj = Map::new();
    start_obj.insert(
        "line".to_string(),
        Value::Number((start_loc.0 as i64).into()),
    );
    start_obj.insert(
        "column".to_string(),
        Value::Number((start_loc.1 as i64).into()),
    );
    start_obj.insert(
        "character".to_string(),
        Value::Number((start as i64).into()),
    );

    let mut end_obj = Map::new();
    end_obj.insert("line".to_string(), Value::Number((end_loc.0 as i64).into()));
    end_obj.insert(
        "column".to_string(),
        Value::Number((end_loc.1 as i64).into()),
    );
    end_obj.insert("character".to_string(), Value::Number((end as i64).into()));

    loc.insert("start".to_string(), Value::Object(start_obj));
    loc.insert("end".to_string(), Value::Object(end_obj));

    Value::Object(loc)
}

fn get_line_column(pos: usize, line_offsets: &[usize]) -> (u32, u32) {
    let line = line_offsets
        .partition_point(|&offset| offset <= pos)
        .saturating_sub(1);
    let line_start = line_offsets.get(line).copied().unwrap_or(0);
    let column = pos - line_start;
    ((line + 1) as u32, column as u32)
}

/// Get line and column for binding patterns.
/// Svelte has a quirk where binding patterns on lines after empty lines
/// use the empty line's offset for column calculation.
fn get_line_column_for_binding(pos: usize, line_offsets: &[usize]) -> (u32, u32) {
    let line = line_offsets
        .partition_point(|&offset| offset <= pos)
        .saturating_sub(1);

    // Check if this line immediately follows an empty line
    // An empty line has length 1 (just the newline character)
    let adjusted_line_start = if line > 0 {
        let current_line_start = line_offsets.get(line).copied().unwrap_or(0);
        let prev_line_start = line_offsets.get(line - 1).copied().unwrap_or(0);
        // If the previous line was empty (current - prev == 1), use prev as line_start
        if current_line_start - prev_line_start == 1 {
            prev_line_start
        } else {
            current_line_start
        }
    } else {
        line_offsets.get(line).copied().unwrap_or(0)
    };

    let column = pos - adjusted_line_start;
    ((line + 1) as u32, column as u32)
}

/// Create loc for binding patterns (complex patterns like ObjectPattern, ArrayPattern).
/// Uses adjusted column calculation for empty lines, no character field.
fn create_loc_for_binding(start: usize, end: usize, line_offsets: &[usize]) -> Value {
    let start_loc = get_line_column_for_binding(start, line_offsets);
    let end_loc = get_line_column_for_binding(end, line_offsets);

    let mut loc = Map::new();

    let mut start_obj = Map::new();
    start_obj.insert(
        "line".to_string(),
        Value::Number((start_loc.0 as i64).into()),
    );
    start_obj.insert(
        "column".to_string(),
        Value::Number((start_loc.1 as i64).into()),
    );

    let mut end_obj = Map::new();
    end_obj.insert("line".to_string(), Value::Number((end_loc.0 as i64).into()));
    end_obj.insert(
        "column".to_string(),
        Value::Number((end_loc.1 as i64).into()),
    );

    loc.insert("start".to_string(), Value::Object(start_obj));
    loc.insert("end".to_string(), Value::Object(end_obj));

    Value::Object(loc)
}

/// Create loc for simple Identifier binding patterns with character field.
/// Uses standard column calculation (0-indexed from line start).
fn create_loc_for_binding_identifier(start: usize, end: usize, line_offsets: &[usize]) -> Value {
    let start_line = line_offsets
        .partition_point(|&offset| offset <= start)
        .saturating_sub(1);
    let end_line = line_offsets
        .partition_point(|&offset| offset <= end)
        .saturating_sub(1);

    let start_line_offset = line_offsets.get(start_line).copied().unwrap_or(0);
    let end_line_offset = line_offsets.get(end_line).copied().unwrap_or(0);

    let start_col = start - start_line_offset;
    let end_col = end - end_line_offset;

    let mut loc = Map::new();

    let mut start_obj = Map::new();
    start_obj.insert(
        "line".to_string(),
        Value::Number(((start_line + 1) as i64).into()),
    );
    start_obj.insert(
        "column".to_string(),
        Value::Number((start_col as i64).into()),
    );
    start_obj.insert(
        "character".to_string(),
        Value::Number((start as i64).into()),
    );

    let mut end_obj = Map::new();
    end_obj.insert(
        "line".to_string(),
        Value::Number(((end_line + 1) as i64).into()),
    );
    end_obj.insert("column".to_string(), Value::Number((end_col as i64).into()));
    end_obj.insert("character".to_string(), Value::Number((end as i64).into()));

    loc.insert("start".to_string(), Value::Object(start_obj));
    loc.insert("end".to_string(), Value::Object(end_obj));

    Value::Object(loc)
}

/// Calculate line offsets for a string.
fn calculate_line_offsets(content: &str) -> Vec<usize> {
    let mut offsets = vec![0];
    for (i, c) in content.char_indices() {
        if c == '\n' {
            offsets.push(i + 1);
        }
    }
    offsets
}

/// Create loc for script content using script-relative coordinates.
/// Svelte uses the script content's line numbers but starting from line 1 of the document.
fn create_loc_for_script(
    _start: usize,
    end: usize,
    _script_line_offsets: &[usize],
    doc_offset: usize,
    doc_line_offsets: &[usize],
) -> Value {
    // Svelte uses a hybrid approach for Program.loc:
    // - start: always line 1, column 0 (script-relative)
    // - end: document line and column position
    let doc_end = doc_offset + end;
    let end_loc = get_line_column(doc_end, doc_line_offsets);

    let mut loc = Map::new();

    // Start is always line 1, column 0 (script-relative)
    let mut start_obj = Map::new();
    start_obj.insert("line".to_string(), Value::Number(1.into()));
    start_obj.insert("column".to_string(), Value::Number(0.into()));

    // End uses document coordinates
    let mut end_obj = Map::new();
    end_obj.insert("line".to_string(), Value::Number((end_loc.0 as i64).into()));
    end_obj.insert(
        "column".to_string(),
        Value::Number((end_loc.1 as i64).into()),
    );

    loc.insert("start".to_string(), Value::Object(start_obj));
    loc.insert("end".to_string(), Value::Object(end_obj));

    Value::Object(loc)
}

/// Parse a JavaScript program (script content) and return it as an Expression.
/// This is used for script tags.
/// Set `is_typescript` to true if the script contains TypeScript.
/// `leading_comments` are HTML comments that appeared before the script tag.
pub fn parse_program(
    content: &str,
    offset: usize,
    line_offsets: &[usize],
    is_typescript: bool,
    leading_comments: &[String],
) -> Expression {
    let allocator = Allocator::default();
    let source_type = if is_typescript {
        SourceType::ts()
    } else {
        SourceType::mjs()
    };
    let parser = OxcParser::new(&allocator, content, source_type);
    let result = parser.parse();

    let program = &result.program;

    let mut obj = Map::new();
    obj.insert("type".to_string(), Value::String("Program".to_string()));

    // Calculate actual positions within the document
    let start = offset + program.span.start as usize;
    let end = offset + program.span.end as usize;

    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));

    // For Program loc, Svelte uses the script content's own coordinate system
    // This means column 0 at the start of the script content
    let script_line_offsets = calculate_line_offsets(content);
    obj.insert(
        "loc".to_string(),
        create_loc_for_script(
            program.span.start as usize,
            program.span.end as usize,
            &script_line_offsets,
            offset,
            line_offsets,
        ),
    );

    // Convert body statements
    let body: Vec<Value> = program
        .body
        .iter()
        .filter_map(|stmt| convert_statement_for_program(stmt, offset, line_offsets))
        .collect();
    obj.insert("body".to_string(), Value::Array(body));

    obj.insert(
        "sourceType".to_string(),
        Value::String("module".to_string()),
    );

    // Handle comments if present
    if !result.program.comments.is_empty() {
        let comments: Vec<Value> = result
            .program
            .comments
            .iter()
            .map(|comment| {
                let mut comment_obj = Map::new();
                let comment_type = match comment.kind {
                    oxc_ast::ast::CommentKind::Line => "Line",
                    oxc_ast::ast::CommentKind::Block => "Block",
                };
                comment_obj.insert("type".to_string(), Value::String(comment_type.to_string()));

                // Extract comment value (the text without // or /* */)
                let comment_start = offset + comment.span.start as usize;
                let comment_end = offset + comment.span.end as usize;
                let comment_text = if comment_end <= offset + content.len() {
                    let raw = &content[comment.span.start as usize..comment.span.end as usize];
                    match comment.kind {
                        oxc_ast::ast::CommentKind::Line => {
                            raw.strip_prefix("//").unwrap_or(raw).to_string()
                        }
                        oxc_ast::ast::CommentKind::Block => raw
                            .strip_prefix("/*")
                            .and_then(|s| s.strip_suffix("*/"))
                            .unwrap_or(raw)
                            .to_string(),
                    }
                } else {
                    String::new()
                };

                comment_obj.insert("value".to_string(), Value::String(comment_text));
                comment_obj.insert(
                    "start".to_string(),
                    Value::Number((comment_start as i64).into()),
                );
                comment_obj.insert(
                    "end".to_string(),
                    Value::Number((comment_end as i64).into()),
                );
                Value::Object(comment_obj)
            })
            .collect();
        obj.insert("trailingComments".to_string(), Value::Array(comments));
    }

    // Add leading comments if there are any (from HTML comments before script tag)
    if !leading_comments.is_empty() {
        let leading_comments_value: Vec<Value> = leading_comments
            .iter()
            .map(|comment| {
                let mut comment_obj = Map::new();
                // HTML comments are treated as "Line" type
                comment_obj.insert("type".to_string(), Value::String("Line".to_string()));
                comment_obj.insert("value".to_string(), Value::String(comment.clone()));
                Value::Object(comment_obj)
            })
            .collect();
        obj.insert(
            "leadingComments".to_string(),
            Value::Array(leading_comments_value),
        );
    }

    Expression::Value(Value::Object(obj))
}

/// Convert a statement to JSON value (for program context, no -1 offset adjustment).
fn convert_statement_for_program(
    stmt: &oxc_ast::ast::Statement,
    offset: usize,
    line_offsets: &[usize],
) -> Option<Value> {
    match stmt {
        oxc_ast::ast::Statement::ExpressionStatement(expr_stmt) => {
            let expr = convert_expression_for_program(&expr_stmt.expression, offset, line_offsets);
            // Wrap in ExpressionStatement
            let start = offset + expr_stmt.span.start as usize;
            let end = offset + expr_stmt.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("ExpressionStatement".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
            obj.insert("expression".to_string(), expr.as_json().clone());
            Some(Value::Object(obj))
        }
        oxc_ast::ast::Statement::VariableDeclaration(var_decl) => {
            let start = offset + var_decl.span.start as usize;
            let end = offset + var_decl.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("VariableDeclaration".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

            let kind = match var_decl.kind {
                oxc_ast::ast::VariableDeclarationKind::Var => "var",
                oxc_ast::ast::VariableDeclarationKind::Let => "let",
                oxc_ast::ast::VariableDeclarationKind::Const => "const",
                oxc_ast::ast::VariableDeclarationKind::Using => "using",
                oxc_ast::ast::VariableDeclarationKind::AwaitUsing => "await using",
            };
            obj.insert("kind".to_string(), Value::String(kind.to_string()));

            let declarations: Vec<Value> = var_decl
                .declarations
                .iter()
                .filter_map(|decl| {
                    convert_variable_declarator_for_program(decl, offset, line_offsets)
                })
                .collect();
            obj.insert("declarations".to_string(), Value::Array(declarations));

            Some(Value::Object(obj))
        }
        oxc_ast::ast::Statement::FunctionDeclaration(func_decl) => {
            let start = offset + func_decl.span.start as usize;
            let end = offset + func_decl.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("FunctionDeclaration".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

            if let Some(id) = &func_decl.id {
                let id_start = offset + id.span.start as usize;
                let id_end = offset + id.span.end as usize;
                let id_expr = create_identifier(&id.name, id_start, id_end, line_offsets);
                obj.insert("id".to_string(), id_expr.as_json().clone());
            } else {
                obj.insert("id".to_string(), Value::Null);
            }

            // Simplified - just return the basic structure
            obj.insert("params".to_string(), Value::Array(vec![]));
            obj.insert("body".to_string(), Value::Null);

            Some(Value::Object(obj))
        }
        oxc_ast::ast::Statement::ExportNamedDeclaration(export_decl) => {
            let start = offset + export_decl.span.start as usize;
            let end = offset + export_decl.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("ExportNamedDeclaration".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

            // Handle declaration if present (e.g., export let x;)
            if let Some(decl) = &export_decl.declaration {
                let decl_value = convert_declaration_for_program(decl, offset, line_offsets);
                obj.insert("declaration".to_string(), decl_value);
            } else {
                obj.insert("declaration".to_string(), Value::Null);
            }

            // Handle specifiers
            let specifiers: Vec<Value> = export_decl
                .specifiers
                .iter()
                .map(|spec| {
                    let spec_start = offset + spec.span.start as usize;
                    let spec_end = offset + spec.span.end as usize;
                    let mut spec_obj = Map::new();
                    spec_obj.insert(
                        "type".to_string(),
                        Value::String("ExportSpecifier".to_string()),
                    );
                    spec_obj.insert(
                        "start".to_string(),
                        Value::Number((spec_start as i64).into()),
                    );
                    spec_obj.insert("end".to_string(), Value::Number((spec_end as i64).into()));
                    spec_obj.insert(
                        "loc".to_string(),
                        create_loc(spec_start, spec_end, line_offsets),
                    );

                    // local
                    let local_start = offset + spec.local.span().start as usize;
                    let local_end = offset + spec.local.span().end as usize;
                    let local_name = spec.local.name().as_str();
                    spec_obj.insert(
                        "local".to_string(),
                        create_identifier(local_name, local_start, local_end, line_offsets)
                            .as_json()
                            .clone(),
                    );

                    // exported
                    let exported_start = offset + spec.exported.span().start as usize;
                    let exported_end = offset + spec.exported.span().end as usize;
                    let exported_name = spec.exported.name().as_str();
                    spec_obj.insert(
                        "exported".to_string(),
                        create_identifier(
                            exported_name,
                            exported_start,
                            exported_end,
                            line_offsets,
                        )
                        .as_json()
                        .clone(),
                    );

                    Value::Object(spec_obj)
                })
                .collect();
            obj.insert("specifiers".to_string(), Value::Array(specifiers));

            // Handle source
            if let Some(source) = &export_decl.source {
                let source_start = offset + source.span.start as usize;
                let source_end = offset + source.span.end as usize;
                let raw = source.raw.as_ref().map(|a| a.as_str()).unwrap_or("");
                obj.insert(
                    "source".to_string(),
                    create_string_literal(
                        &source.value,
                        raw,
                        source_start,
                        source_end,
                        line_offsets,
                    )
                    .as_json()
                    .clone(),
                );
            } else {
                obj.insert("source".to_string(), Value::Null);
            }

            // attributes (for import attributes)
            obj.insert("attributes".to_string(), Value::Array(vec![]));

            Some(Value::Object(obj))
        }
        oxc_ast::ast::Statement::ImportDeclaration(import_decl) => {
            let start = offset + import_decl.span.start as usize;
            let end = offset + import_decl.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("ImportDeclaration".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

            // Handle specifiers
            let specifiers: Vec<Value> = import_decl
                .specifiers
                .as_ref()
                .map(|specs| {
                    specs
                        .iter()
                        .map(|spec| convert_import_specifier(spec, offset, line_offsets))
                        .collect()
                })
                .unwrap_or_default();
            obj.insert("specifiers".to_string(), Value::Array(specifiers));

            // Source
            let source = &import_decl.source;
            let source_start = offset + source.span.start as usize;
            let source_end = offset + source.span.end as usize;
            let raw = source.raw.as_ref().map(|a| a.as_str()).unwrap_or("");
            obj.insert(
                "source".to_string(),
                create_string_literal(&source.value, raw, source_start, source_end, line_offsets)
                    .as_json()
                    .clone(),
            );

            // attributes (for import attributes)
            obj.insert("attributes".to_string(), Value::Array(vec![]));

            Some(Value::Object(obj))
        }
        // Add more statement types as needed
        _ => None,
    }
}

/// Convert a Declaration to JSON value (for program context).
fn convert_declaration_for_program(
    decl: &oxc_ast::ast::Declaration,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    match decl {
        oxc_ast::ast::Declaration::VariableDeclaration(var_decl) => {
            let start = offset + var_decl.span.start as usize;
            let end = offset + var_decl.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("VariableDeclaration".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

            let kind = match var_decl.kind {
                oxc_ast::ast::VariableDeclarationKind::Var => "var",
                oxc_ast::ast::VariableDeclarationKind::Let => "let",
                oxc_ast::ast::VariableDeclarationKind::Const => "const",
                oxc_ast::ast::VariableDeclarationKind::Using => "using",
                oxc_ast::ast::VariableDeclarationKind::AwaitUsing => "await using",
            };
            obj.insert("kind".to_string(), Value::String(kind.to_string()));

            let declarations: Vec<Value> = var_decl
                .declarations
                .iter()
                .filter_map(|d| convert_variable_declarator_for_program(d, offset, line_offsets))
                .collect();
            obj.insert("declarations".to_string(), Value::Array(declarations));

            Value::Object(obj)
        }
        oxc_ast::ast::Declaration::FunctionDeclaration(func_decl) => {
            let start = offset + func_decl.span.start as usize;
            let end = offset + func_decl.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("FunctionDeclaration".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

            if let Some(id) = &func_decl.id {
                let id_start = offset + id.span.start as usize;
                let id_end = offset + id.span.end as usize;
                let id_expr = create_identifier(&id.name, id_start, id_end, line_offsets);
                obj.insert("id".to_string(), id_expr.as_json().clone());
            } else {
                obj.insert("id".to_string(), Value::Null);
            }

            obj.insert("params".to_string(), Value::Array(vec![]));
            obj.insert("body".to_string(), Value::Null);

            Value::Object(obj)
        }
        oxc_ast::ast::Declaration::ClassDeclaration(class_decl) => {
            let start = offset + class_decl.span.start as usize;
            let end = offset + class_decl.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("ClassDeclaration".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

            if let Some(id) = &class_decl.id {
                let id_start = offset + id.span.start as usize;
                let id_end = offset + id.span.end as usize;
                let id_expr = create_identifier(&id.name, id_start, id_end, line_offsets);
                obj.insert("id".to_string(), id_expr.as_json().clone());
            } else {
                obj.insert("id".to_string(), Value::Null);
            }

            Value::Object(obj)
        }
        _ => Value::Null,
    }
}

/// Convert an import specifier to JSON value.
fn convert_import_specifier(
    spec: &oxc_ast::ast::ImportDeclarationSpecifier,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    match spec {
        oxc_ast::ast::ImportDeclarationSpecifier::ImportSpecifier(import_spec) => {
            let start = offset + import_spec.span.start as usize;
            let end = offset + import_spec.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("ImportSpecifier".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

            // imported
            let imported_start = offset + import_spec.imported.span().start as usize;
            let imported_end = offset + import_spec.imported.span().end as usize;
            let imported_name = import_spec.imported.name().as_str();
            obj.insert(
                "imported".to_string(),
                create_identifier(imported_name, imported_start, imported_end, line_offsets)
                    .as_json()
                    .clone(),
            );

            // local
            let local_start = offset + import_spec.local.span.start as usize;
            let local_end = offset + import_spec.local.span.end as usize;
            obj.insert(
                "local".to_string(),
                create_identifier(
                    &import_spec.local.name,
                    local_start,
                    local_end,
                    line_offsets,
                )
                .as_json()
                .clone(),
            );

            Value::Object(obj)
        }
        oxc_ast::ast::ImportDeclarationSpecifier::ImportDefaultSpecifier(default_spec) => {
            let start = offset + default_spec.span.start as usize;
            let end = offset + default_spec.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("ImportDefaultSpecifier".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

            let local_start = offset + default_spec.local.span.start as usize;
            let local_end = offset + default_spec.local.span.end as usize;
            obj.insert(
                "local".to_string(),
                create_identifier(
                    &default_spec.local.name,
                    local_start,
                    local_end,
                    line_offsets,
                )
                .as_json()
                .clone(),
            );

            Value::Object(obj)
        }
        oxc_ast::ast::ImportDeclarationSpecifier::ImportNamespaceSpecifier(ns_spec) => {
            let start = offset + ns_spec.span.start as usize;
            let end = offset + ns_spec.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("ImportNamespaceSpecifier".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

            let local_start = offset + ns_spec.local.span.start as usize;
            let local_end = offset + ns_spec.local.span.end as usize;
            obj.insert(
                "local".to_string(),
                create_identifier(&ns_spec.local.name, local_start, local_end, line_offsets)
                    .as_json()
                    .clone(),
            );

            Value::Object(obj)
        }
    }
}

/// Convert a variable declarator to JSON value (for program context, no -1 offset adjustment).
fn convert_variable_declarator_for_program(
    decl: &oxc_ast::ast::VariableDeclarator,
    offset: usize,
    line_offsets: &[usize],
) -> Option<Value> {
    let start = offset + decl.span.start as usize;
    let end = offset + decl.span.end as usize;
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("VariableDeclarator".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    // Convert the id (pattern)
    let id_value = convert_binding_pattern(&decl.id, offset, line_offsets);
    obj.insert("id".to_string(), id_value);

    // Convert init if present
    if let Some(init) = &decl.init {
        let init_expr = convert_expression_for_program(init, offset, line_offsets);
        obj.insert("init".to_string(), init_expr.as_json().clone());
    } else {
        obj.insert("init".to_string(), Value::Null);
    }

    Some(Value::Object(obj))
}

/// Convert an expression for program context (no -1 offset adjustment).
fn convert_expression_for_program(
    expr: &OxcExpression,
    offset: usize,
    line_offsets: &[usize],
) -> Expression {
    // For program context, we use the raw offset without -1 adjustment
    match expr {
        OxcExpression::Identifier(id) => {
            let start = offset + id.span.start as usize;
            let end = offset + id.span.end as usize;
            create_identifier(&id.name, start, end, line_offsets)
        }
        OxcExpression::NumericLiteral(num) => {
            let start = offset + num.span.start as usize;
            let end = offset + num.span.end as usize;
            let raw = num.raw.as_ref().map(|a| a.as_str()).unwrap_or("");
            create_numeric_literal(num.value, raw, start, end, line_offsets)
        }
        OxcExpression::StringLiteral(str_lit) => {
            let start = offset + str_lit.span.start as usize;
            let end = offset + str_lit.span.end as usize;
            let raw = str_lit.raw.as_ref().map(|a| a.as_str()).unwrap_or("");
            create_string_literal(&str_lit.value, raw, start, end, line_offsets)
        }
        OxcExpression::BooleanLiteral(bool_lit) => {
            let start = offset + bool_lit.span.start as usize;
            let end = offset + bool_lit.span.end as usize;
            let raw = if bool_lit.value { "true" } else { "false" };
            create_literal(Value::Bool(bool_lit.value), raw, start, end, line_offsets)
        }
        OxcExpression::NullLiteral(null_lit) => {
            let start = offset + null_lit.span.start as usize;
            let end = offset + null_lit.span.end as usize;
            create_literal(Value::Null, "null", start, end, line_offsets)
        }
        OxcExpression::CallExpression(call) => {
            let start = offset + call.span.start as usize;
            let end = offset + call.span.end as usize;
            let callee = convert_expression_for_program(&call.callee, offset, line_offsets);

            let args: Vec<Value> = call
                .arguments
                .iter()
                .map(|arg| match arg {
                    oxc_ast::ast::Argument::SpreadElement(_) => Value::Null,
                    _ => {
                        let expr = arg.to_expression();
                        convert_expression_for_program(expr, offset, line_offsets)
                            .as_json()
                            .clone()
                    }
                })
                .collect();

            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("CallExpression".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
            obj.insert("callee".to_string(), callee.as_json().clone());
            obj.insert("arguments".to_string(), Value::Array(args));
            obj.insert("optional".to_string(), Value::Bool(false));

            Expression::Value(Value::Object(obj))
        }
        OxcExpression::ArrayExpression(arr) => {
            let start = offset + arr.span.start as usize;
            let end = offset + arr.span.end as usize;

            let elements: Vec<Value> = arr
                .elements
                .iter()
                .map(|elem| match elem {
                    oxc_ast::ast::ArrayExpressionElement::SpreadElement(spread) => {
                        let spread_start = offset + spread.span.start as usize;
                        let spread_end = offset + spread.span.end as usize;
                        let arg =
                            convert_expression_for_program(&spread.argument, offset, line_offsets);
                        let mut obj = Map::new();
                        obj.insert(
                            "type".to_string(),
                            Value::String("SpreadElement".to_string()),
                        );
                        obj.insert(
                            "start".to_string(),
                            Value::Number((spread_start as i64).into()),
                        );
                        obj.insert("end".to_string(), Value::Number((spread_end as i64).into()));
                        obj.insert(
                            "loc".to_string(),
                            create_loc(spread_start, spread_end, line_offsets),
                        );
                        obj.insert("argument".to_string(), arg.as_json().clone());
                        Value::Object(obj)
                    }
                    oxc_ast::ast::ArrayExpressionElement::Elision(_elision) => Value::Null,
                    _ => {
                        let expr = elem.to_expression();
                        convert_expression_for_program(expr, offset, line_offsets)
                            .as_json()
                            .clone()
                    }
                })
                .collect();

            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("ArrayExpression".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
            obj.insert("elements".to_string(), Value::Array(elements));

            Expression::Value(Value::Object(obj))
        }
        OxcExpression::ArrowFunctionExpression(arrow) => {
            let start = offset + arrow.span.start as usize;
            let end = offset + arrow.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("ArrowFunctionExpression".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
            obj.insert("id".to_string(), Value::Null);
            obj.insert("expression".to_string(), Value::Bool(arrow.expression));
            obj.insert("generator".to_string(), Value::Bool(false));
            obj.insert("async".to_string(), Value::Bool(arrow.r#async));

            // Convert params
            let params: Vec<Value> = arrow
                .params
                .items
                .iter()
                .map(|param| convert_binding_pattern(&param.pattern, offset, line_offsets))
                .collect();
            obj.insert("params".to_string(), Value::Array(params));

            // Convert body
            let body_value = convert_function_body_for_program(&arrow.body, offset, line_offsets);
            obj.insert("body".to_string(), body_value);

            Expression::Value(Value::Object(obj))
        }
        OxcExpression::StaticMemberExpression(member) => {
            let start = offset + member.span.start as usize;
            let end = offset + member.span.end as usize;
            let object = convert_expression_for_program(&member.object, offset, line_offsets);
            let property_start = offset + member.property.span.start as usize;
            let property_end = offset + member.property.span.end as usize;
            let property = create_identifier(
                &member.property.name,
                property_start,
                property_end,
                line_offsets,
            );

            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("MemberExpression".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
            obj.insert("object".to_string(), object.as_json().clone());
            obj.insert("property".to_string(), property.as_json().clone());
            obj.insert("computed".to_string(), Value::Bool(false));
            obj.insert("optional".to_string(), Value::Bool(member.optional));

            Expression::Value(Value::Object(obj))
        }
        OxcExpression::ComputedMemberExpression(member) => {
            let start = offset + member.span.start as usize;
            let end = offset + member.span.end as usize;
            let object = convert_expression_for_program(&member.object, offset, line_offsets);
            let property = convert_expression_for_program(&member.expression, offset, line_offsets);

            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("MemberExpression".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
            obj.insert("object".to_string(), object.as_json().clone());
            obj.insert("property".to_string(), property.as_json().clone());
            obj.insert("computed".to_string(), Value::Bool(true));
            obj.insert("optional".to_string(), Value::Bool(member.optional));

            Expression::Value(Value::Object(obj))
        }
        OxcExpression::ImportExpression(import_expr) => {
            let start = offset + import_expr.span.start as usize;
            let end = offset + import_expr.span.end as usize;
            let source = convert_expression_for_program(&import_expr.source, offset, line_offsets);

            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("ImportExpression".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
            obj.insert("source".to_string(), source.as_json().clone());
            obj.insert("options".to_string(), Value::Null);

            Expression::Value(Value::Object(obj))
        }
        _ => {
            // Fallback: use convert_expression with offset (which internally does -1, so we need to compensate)
            // For simplicity, just create an identifier placeholder
            let span = expr.span();
            let start = offset + span.start as usize;
            let end = offset + span.end as usize;
            let mut obj = Map::new();
            obj.insert("type".to_string(), Value::String("Expression".to_string()));
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
            Expression::Value(Value::Object(obj))
        }
    }
}

/// Convert a function body (statement or expression) to JSON value.
fn convert_function_body_for_program(
    body: &oxc_ast::ast::FunctionBody,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    let start = offset + body.span.start as usize;
    let end = offset + body.span.end as usize;

    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("BlockStatement".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    let statements: Vec<Value> = body
        .statements
        .iter()
        .filter_map(|stmt| convert_statement_for_program(stmt, offset, line_offsets))
        .collect();
    obj.insert("body".to_string(), Value::Array(statements));

    Value::Object(obj)
}

/// Convert a binding pattern to JSON value.
fn convert_binding_pattern(
    pattern: &oxc_ast::ast::BindingPattern,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    match &pattern.kind {
        oxc_ast::ast::BindingPatternKind::BindingIdentifier(id) => {
            let start = offset + id.span.start as usize;

            // Check if there's a type annotation
            if let Some(type_ann) = &pattern.type_annotation {
                let end = offset + type_ann.span.end as usize;

                let mut obj = Map::new();
                obj.insert("type".to_string(), Value::String("Identifier".to_string()));
                obj.insert("start".to_string(), Value::Number((start as i64).into()));
                obj.insert("end".to_string(), Value::Number((end as i64).into()));
                obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
                obj.insert("name".to_string(), Value::String(id.name.to_string()));

                // Add type annotation
                let type_ann_obj = convert_type_annotation(type_ann, offset, line_offsets);
                obj.insert("typeAnnotation".to_string(), type_ann_obj);

                Value::Object(obj)
            } else {
                let end = offset + id.span.end as usize;
                let expr = create_identifier(&id.name, start, end, line_offsets);
                expr.as_json().clone()
            }
        }
        oxc_ast::ast::BindingPatternKind::ObjectPattern(obj_pat) => {
            convert_object_pattern(obj_pat, offset, line_offsets)
        }
        oxc_ast::ast::BindingPatternKind::ArrayPattern(arr_pat) => {
            convert_array_pattern(arr_pat, offset, line_offsets)
        }
        oxc_ast::ast::BindingPatternKind::AssignmentPattern(assign_pat) => {
            convert_assignment_pattern(assign_pat, offset, line_offsets)
        }
    }
}

/// Convert an ObjectPattern binding to JSON.
fn convert_object_pattern(
    obj_pat: &oxc_ast::ast::ObjectPattern,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    let start = offset + obj_pat.span.start as usize;
    let end = offset + obj_pat.span.end as usize;

    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("ObjectPattern".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    let properties: Vec<Value> = obj_pat
        .properties
        .iter()
        .map(|prop| convert_binding_property(prop, offset, line_offsets))
        .collect();
    obj.insert("properties".to_string(), Value::Array(properties));

    Value::Object(obj)
}

/// Convert an ArrayPattern binding to JSON.
fn convert_array_pattern(
    arr_pat: &oxc_ast::ast::ArrayPattern,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    let start = offset + arr_pat.span.start as usize;
    let end = offset + arr_pat.span.end as usize;

    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("ArrayPattern".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    let mut elements: Vec<Value> = arr_pat
        .elements
        .iter()
        .map(|elem| match elem {
            Some(pat) => convert_binding_pattern(pat, offset, line_offsets),
            None => Value::Null,
        })
        .collect();

    // Add rest element if present
    if let Some(rest) = &arr_pat.rest {
        let rest_start = offset + rest.span.start as usize;
        let rest_end = offset + rest.span.end as usize;

        let mut rest_obj = Map::new();
        rest_obj.insert("type".to_string(), Value::String("RestElement".to_string()));
        rest_obj.insert(
            "start".to_string(),
            Value::Number((rest_start as i64).into()),
        );
        rest_obj.insert("end".to_string(), Value::Number((rest_end as i64).into()));
        rest_obj.insert(
            "loc".to_string(),
            create_loc(rest_start, rest_end, line_offsets),
        );
        rest_obj.insert(
            "argument".to_string(),
            convert_binding_pattern(&rest.argument, offset, line_offsets),
        );
        elements.push(Value::Object(rest_obj));
    }

    obj.insert("elements".to_string(), Value::Array(elements));

    Value::Object(obj)
}

/// Convert an AssignmentPattern binding to JSON.
fn convert_assignment_pattern(
    assign_pat: &oxc_ast::ast::AssignmentPattern,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    let start = offset + assign_pat.span.start as usize;
    let end = offset + assign_pat.span.end as usize;

    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("AssignmentPattern".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    obj.insert(
        "left".to_string(),
        convert_binding_pattern(&assign_pat.left, offset, line_offsets),
    );
    obj.insert(
        "right".to_string(),
        convert_expression(&assign_pat.right, offset, line_offsets)
            .as_json()
            .clone(),
    );

    Value::Object(obj)
}

/// Convert a binding property to JSON.
fn convert_binding_property(
    prop: &oxc_ast::ast::BindingProperty,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    let start = offset + prop.span.start as usize;
    let end = offset + prop.span.end as usize;

    let mut obj = Map::new();
    obj.insert("type".to_string(), Value::String("Property".to_string()));
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
    obj.insert("method".to_string(), Value::Bool(false));
    obj.insert("shorthand".to_string(), Value::Bool(prop.shorthand));
    obj.insert("computed".to_string(), Value::Bool(prop.computed));
    obj.insert("kind".to_string(), Value::String("init".to_string()));

    // Convert key
    let key = convert_property_key(&prop.key, offset, line_offsets);
    obj.insert("key".to_string(), key);

    // Convert value
    let value = convert_binding_pattern(&prop.value, offset, line_offsets);
    obj.insert("value".to_string(), value);

    Value::Object(obj)
}

/// Convert a property key to JSON.
fn convert_property_key(
    key: &oxc_ast::ast::PropertyKey,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    match key {
        oxc_ast::ast::PropertyKey::StaticIdentifier(id) => {
            let start = offset + id.span.start as usize;
            let end = offset + id.span.end as usize;
            create_identifier(&id.name, start, end, line_offsets)
                .as_json()
                .clone()
        }
        oxc_ast::ast::PropertyKey::PrivateIdentifier(id) => {
            let start = offset + id.span.start as usize;
            let end = offset + id.span.end as usize;
            create_identifier(&id.name, start, end, line_offsets)
                .as_json()
                .clone()
        }
        _ => {
            // For computed keys, try to get the expression
            if let Some(expr) = key.as_expression() {
                convert_expression(expr, offset, line_offsets)
                    .as_json()
                    .clone()
            } else {
                Value::Null
            }
        }
    }
}

/// Parse a binding pattern (for {#each} context).
/// This parses patterns like `item`, `{ name }`, `[a, b]`, etc.
pub fn parse_binding_pattern(content: &str, offset: usize, line_offsets: &[usize]) -> Expression {
    let allocator = Allocator::default();
    let source_type = SourceType::mjs();

    // Parse as a variable declaration to get the binding pattern
    // We prefix with "let " (4 chars) and suffix with " = null"
    let wrapped = format!("let {} = null", content);
    let parser = OxcParser::new(&allocator, &wrapped, source_type);
    let result = parser.parse();

    if result.errors.is_empty() {
        if let Some(oxc_ast::ast::Statement::VariableDeclaration(var_decl)) =
            result.program.body.first()
        {
            if let Some(decl) = var_decl.declarations.first() {
                // The pattern in wrapped string starts at position 4 (after "let ")
                // We need to map positions: wrapped_pos - 4 + offset = document_pos
                // So we pass offset - 4 to make the formula work: (offset - 4) + span.start = offset + (span.start - 4)

                // For top-level simple identifier, use special format with character field
                // and name before loc
                if let oxc_ast::ast::BindingPatternKind::BindingIdentifier(id) = &decl.id.kind {
                    let start = offset + id.span.start as usize - 4;
                    let end = offset + id.span.end as usize - 4;
                    return Expression::Value(create_identifier_for_binding_toplevel(
                        &id.name,
                        start,
                        end,
                        line_offsets,
                    ));
                }

                return Expression::Value(convert_binding_pattern_with_adjustment(
                    &decl.id,
                    offset,
                    4,
                    line_offsets,
                ));
            }
        }
    }

    // Fallback: return as simple identifier
    create_identifier(content.trim(), offset, offset + content.len(), line_offsets)
}

/// Convert a binding pattern with position adjustment.
/// The adjustment is needed when parsing patterns from wrapped expressions.
fn convert_binding_pattern_with_adjustment(
    pattern: &oxc_ast::ast::BindingPattern,
    doc_offset: usize,
    prefix_len: usize,
    line_offsets: &[usize],
) -> Value {
    match &pattern.kind {
        oxc_ast::ast::BindingPatternKind::BindingIdentifier(id) => {
            // Position in document = doc_offset + (span_pos - prefix_len)
            let start = doc_offset + id.span.start as usize - prefix_len;
            let end = doc_offset + id.span.end as usize - prefix_len;
            create_identifier_for_binding(&id.name, start, end, line_offsets)
        }
        oxc_ast::ast::BindingPatternKind::ObjectPattern(obj_pat) => {
            convert_object_pattern_with_adjustment(obj_pat, doc_offset, prefix_len, line_offsets)
        }
        oxc_ast::ast::BindingPatternKind::ArrayPattern(arr_pat) => {
            convert_array_pattern_with_adjustment(arr_pat, doc_offset, prefix_len, line_offsets)
        }
        oxc_ast::ast::BindingPatternKind::AssignmentPattern(assign_pat) => {
            convert_assignment_pattern_with_adjustment(
                assign_pat,
                doc_offset,
                prefix_len,
                line_offsets,
            )
        }
    }
}

fn convert_object_pattern_with_adjustment(
    obj_pat: &oxc_ast::ast::ObjectPattern,
    doc_offset: usize,
    prefix_len: usize,
    line_offsets: &[usize],
) -> Value {
    let start = doc_offset + obj_pat.span.start as usize - prefix_len;
    let end = doc_offset + obj_pat.span.end as usize - prefix_len;

    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("ObjectPattern".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert(
        "loc".to_string(),
        create_loc_for_binding(start, end, line_offsets),
    );

    let properties: Vec<Value> = obj_pat
        .properties
        .iter()
        .map(|prop| {
            convert_binding_property_with_adjustment(prop, doc_offset, prefix_len, line_offsets)
        })
        .collect();
    obj.insert("properties".to_string(), Value::Array(properties));

    Value::Object(obj)
}

fn convert_array_pattern_with_adjustment(
    arr_pat: &oxc_ast::ast::ArrayPattern,
    doc_offset: usize,
    prefix_len: usize,
    line_offsets: &[usize],
) -> Value {
    let start = doc_offset + arr_pat.span.start as usize - prefix_len;
    let end = doc_offset + arr_pat.span.end as usize - prefix_len;

    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("ArrayPattern".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert(
        "loc".to_string(),
        create_loc_for_binding(start, end, line_offsets),
    );

    let mut elements: Vec<Value> = arr_pat
        .elements
        .iter()
        .map(|elem| match elem {
            Some(pat) => {
                convert_binding_pattern_with_adjustment(pat, doc_offset, prefix_len, line_offsets)
            }
            None => Value::Null,
        })
        .collect();

    // Add rest element if present
    if let Some(rest) = &arr_pat.rest {
        let rest_start = doc_offset + rest.span.start as usize - prefix_len;
        let rest_end = doc_offset + rest.span.end as usize - prefix_len;

        let mut rest_obj = Map::new();
        rest_obj.insert("type".to_string(), Value::String("RestElement".to_string()));
        rest_obj.insert(
            "start".to_string(),
            Value::Number((rest_start as i64).into()),
        );
        rest_obj.insert("end".to_string(), Value::Number((rest_end as i64).into()));
        rest_obj.insert(
            "loc".to_string(),
            create_loc_for_binding(rest_start, rest_end, line_offsets),
        );
        rest_obj.insert(
            "argument".to_string(),
            convert_binding_pattern_with_adjustment(
                &rest.argument,
                doc_offset,
                prefix_len,
                line_offsets,
            ),
        );
        elements.push(Value::Object(rest_obj));
    }

    obj.insert("elements".to_string(), Value::Array(elements));

    Value::Object(obj)
}

fn convert_assignment_pattern_with_adjustment(
    assign_pat: &oxc_ast::ast::AssignmentPattern,
    doc_offset: usize,
    prefix_len: usize,
    line_offsets: &[usize],
) -> Value {
    let start = doc_offset + assign_pat.span.start as usize - prefix_len;
    let end = doc_offset + assign_pat.span.end as usize - prefix_len;

    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("AssignmentPattern".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert(
        "loc".to_string(),
        create_loc_for_binding(start, end, line_offsets),
    );

    obj.insert(
        "left".to_string(),
        convert_binding_pattern_with_adjustment(
            &assign_pat.left,
            doc_offset,
            prefix_len,
            line_offsets,
        ),
    );

    // For the right side (expression), we need to adjust positions too
    // Using the expression converter with adjusted offset
    let right =
        convert_expression_with_adjustment(&assign_pat.right, doc_offset, prefix_len, line_offsets);
    obj.insert("right".to_string(), right);

    Value::Object(obj)
}

fn convert_binding_property_with_adjustment(
    prop: &oxc_ast::ast::BindingProperty,
    doc_offset: usize,
    prefix_len: usize,
    line_offsets: &[usize],
) -> Value {
    let start = doc_offset + prop.span.start as usize - prefix_len;
    let end = doc_offset + prop.span.end as usize - prefix_len;

    let mut obj = Map::new();
    obj.insert("type".to_string(), Value::String("Property".to_string()));
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert(
        "loc".to_string(),
        create_loc_for_binding(start, end, line_offsets),
    );
    obj.insert("method".to_string(), Value::Bool(false));
    obj.insert("shorthand".to_string(), Value::Bool(prop.shorthand));
    obj.insert("computed".to_string(), Value::Bool(prop.computed));
    obj.insert("kind".to_string(), Value::String("init".to_string()));

    // Convert key
    let key = convert_property_key_with_adjustment(&prop.key, doc_offset, prefix_len, line_offsets);
    obj.insert("key".to_string(), key);

    // Convert value
    let value =
        convert_binding_pattern_with_adjustment(&prop.value, doc_offset, prefix_len, line_offsets);
    obj.insert("value".to_string(), value);

    Value::Object(obj)
}

fn convert_property_key_with_adjustment(
    key: &oxc_ast::ast::PropertyKey,
    doc_offset: usize,
    prefix_len: usize,
    line_offsets: &[usize],
) -> Value {
    match key {
        oxc_ast::ast::PropertyKey::StaticIdentifier(id) => {
            let start = doc_offset + id.span.start as usize - prefix_len;
            let end = doc_offset + id.span.end as usize - prefix_len;
            create_identifier_for_binding(&id.name, start, end, line_offsets)
        }
        oxc_ast::ast::PropertyKey::PrivateIdentifier(id) => {
            let start = doc_offset + id.span.start as usize - prefix_len;
            let end = doc_offset + id.span.end as usize - prefix_len;
            create_identifier_for_binding(&id.name, start, end, line_offsets)
        }
        _ => {
            if let Some(expr) = key.as_expression() {
                convert_expression_with_adjustment(expr, doc_offset, prefix_len, line_offsets)
            } else {
                Value::Null
            }
        }
    }
}

/// Convert expression with position adjustment for wrapped patterns.
fn convert_expression_with_adjustment(
    expr: &OxcExpression,
    doc_offset: usize,
    prefix_len: usize,
    line_offsets: &[usize],
) -> Value {
    // We'll handle the most common expression types for pattern defaults
    match expr {
        OxcExpression::Identifier(id) => {
            let start = doc_offset + id.span.start as usize - prefix_len;
            let end = doc_offset + id.span.end as usize - prefix_len;
            create_identifier_for_binding(&id.name, start, end, line_offsets)
        }
        OxcExpression::BooleanLiteral(lit) => {
            let start = doc_offset + lit.span.start as usize - prefix_len;
            let end = doc_offset + lit.span.end as usize - prefix_len;
            let raw = if lit.value { "true" } else { "false" };
            create_literal_for_binding(Value::Bool(lit.value), raw, start, end, line_offsets)
        }
        OxcExpression::NumericLiteral(lit) => {
            let start = doc_offset + lit.span.start as usize - prefix_len;
            let end = doc_offset + lit.span.end as usize - prefix_len;
            let raw = lit.raw.as_ref().map(|a| a.as_str()).unwrap_or("");
            create_numeric_literal_for_binding(lit.value, raw, start, end, line_offsets)
        }
        OxcExpression::StringLiteral(lit) => {
            let start = doc_offset + lit.span.start as usize - prefix_len;
            let end = doc_offset + lit.span.end as usize - prefix_len;
            let raw = lit.raw.as_ref().map(|a| a.as_str()).unwrap_or("");
            create_string_literal_for_binding(&lit.value, raw, start, end, line_offsets)
        }
        OxcExpression::TemplateLiteral(template) => {
            let start = doc_offset + template.span.start as usize - prefix_len;
            let end = doc_offset + template.span.end as usize - prefix_len;
            create_template_literal_with_adjustment(
                template,
                start,
                end,
                doc_offset,
                prefix_len,
                line_offsets,
            )
        }
        OxcExpression::CallExpression(call) => {
            let start = doc_offset + call.span.start as usize - prefix_len;
            let end = doc_offset + call.span.end as usize - prefix_len;
            create_call_expression_with_adjustment(
                call,
                start,
                end,
                doc_offset,
                prefix_len,
                line_offsets,
            )
        }
        OxcExpression::ArrowFunctionExpression(arrow) => {
            let start = doc_offset + arrow.span.start as usize - prefix_len;
            let end = doc_offset + arrow.span.end as usize - prefix_len;
            create_arrow_function_with_adjustment(
                arrow,
                start,
                end,
                doc_offset,
                prefix_len,
                line_offsets,
            )
        }
        OxcExpression::ParenthesizedExpression(paren) => {
            // Unwrap the parenthesized expression and convert the inner expression
            convert_expression_with_adjustment(
                &paren.expression,
                doc_offset,
                prefix_len,
                line_offsets,
            )
        }
        // TypeScript expression wrappers - unwrap and return the inner expression
        OxcExpression::TSAsExpression(ts_as) => convert_expression_with_adjustment(
            &ts_as.expression,
            doc_offset,
            prefix_len,
            line_offsets,
        ),
        OxcExpression::TSSatisfiesExpression(ts_satisfies) => convert_expression_with_adjustment(
            &ts_satisfies.expression,
            doc_offset,
            prefix_len,
            line_offsets,
        ),
        OxcExpression::TSNonNullExpression(ts_non_null) => convert_expression_with_adjustment(
            &ts_non_null.expression,
            doc_offset,
            prefix_len,
            line_offsets,
        ),
        OxcExpression::TSTypeAssertion(ts_assertion) => convert_expression_with_adjustment(
            &ts_assertion.expression,
            doc_offset,
            prefix_len,
            line_offsets,
        ),
        OxcExpression::TSInstantiationExpression(ts_inst) => convert_expression_with_adjustment(
            &ts_inst.expression,
            doc_offset,
            prefix_len,
            line_offsets,
        ),
        _ => {
            // Fallback for other expressions
            let span = expr.span();
            let start = doc_offset + span.start as usize - prefix_len;
            let end = doc_offset + span.end as usize - prefix_len;
            create_identifier_for_binding("unknown", start, end, line_offsets)
        }
    }
}

fn create_template_literal_with_adjustment(
    template: &oxc_ast::ast::TemplateLiteral,
    start: usize,
    end: usize,
    doc_offset: usize,
    prefix_len: usize,
    line_offsets: &[usize],
) -> Value {
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("TemplateLiteral".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert(
        "loc".to_string(),
        create_loc_for_binding(start, end, line_offsets),
    );

    // Convert quasis
    let quasis: Vec<Value> = template
        .quasis
        .iter()
        .map(|quasi| {
            let q_start = doc_offset + quasi.span.start as usize - prefix_len;
            let q_end = doc_offset + quasi.span.end as usize - prefix_len;

            let mut q_obj = Map::new();
            q_obj.insert(
                "type".to_string(),
                Value::String("TemplateElement".to_string()),
            );
            q_obj.insert("start".to_string(), Value::Number((q_start as i64).into()));
            q_obj.insert("end".to_string(), Value::Number((q_end as i64).into()));
            q_obj.insert(
                "loc".to_string(),
                create_loc_for_binding(q_start, q_end, line_offsets),
            );
            q_obj.insert("tail".to_string(), Value::Bool(quasi.tail));

            let mut value_obj = Map::new();
            value_obj.insert(
                "raw".to_string(),
                Value::String(quasi.value.raw.to_string()),
            );
            value_obj.insert(
                "cooked".to_string(),
                quasi
                    .value
                    .cooked
                    .as_ref()
                    .map(|s| Value::String(s.to_string()))
                    .unwrap_or(Value::Null),
            );
            q_obj.insert("value".to_string(), Value::Object(value_obj));

            Value::Object(q_obj)
        })
        .collect();
    obj.insert("quasis".to_string(), Value::Array(quasis));

    // Convert expressions
    let expressions: Vec<Value> = template
        .expressions
        .iter()
        .map(|expr| convert_expression_with_adjustment(expr, doc_offset, prefix_len, line_offsets))
        .collect();
    obj.insert("expressions".to_string(), Value::Array(expressions));

    Value::Object(obj)
}

fn create_call_expression_with_adjustment(
    call: &oxc_ast::ast::CallExpression,
    start: usize,
    end: usize,
    doc_offset: usize,
    prefix_len: usize,
    line_offsets: &[usize],
) -> Value {
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("CallExpression".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert(
        "loc".to_string(),
        create_loc_for_binding(start, end, line_offsets),
    );

    let callee =
        convert_expression_with_adjustment(&call.callee, doc_offset, prefix_len, line_offsets);
    obj.insert("callee".to_string(), callee);

    let args: Vec<Value> = call
        .arguments
        .iter()
        .filter_map(|arg| match arg {
            oxc_ast::ast::Argument::SpreadElement(_) => None,
            _ => {
                let expr = arg.to_expression();
                Some(convert_expression_with_adjustment(
                    expr,
                    doc_offset,
                    prefix_len,
                    line_offsets,
                ))
            }
        })
        .collect();
    obj.insert("arguments".to_string(), Value::Array(args));
    obj.insert("optional".to_string(), Value::Bool(call.optional));

    Value::Object(obj)
}

fn create_arrow_function_with_adjustment(
    arrow: &oxc_ast::ast::ArrowFunctionExpression,
    start: usize,
    end: usize,
    doc_offset: usize,
    prefix_len: usize,
    line_offsets: &[usize],
) -> Value {
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("ArrowFunctionExpression".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert(
        "loc".to_string(),
        create_loc_for_binding(start, end, line_offsets),
    );
    obj.insert("id".to_string(), Value::Null);
    obj.insert("expression".to_string(), Value::Bool(arrow.expression));
    obj.insert("generator".to_string(), Value::Bool(false));
    obj.insert("async".to_string(), Value::Bool(arrow.r#async));
    obj.insert("params".to_string(), Value::Array(Vec::new())); // Simplified

    // Convert body - arrow.expression indicates if body is expression or block statement
    let body =
        convert_function_body_with_adjustment(&arrow.body, doc_offset, prefix_len, line_offsets);
    obj.insert("body".to_string(), body);

    Value::Object(obj)
}

fn convert_function_body_with_adjustment(
    body: &oxc_ast::ast::FunctionBody,
    doc_offset: usize,
    prefix_len: usize,
    line_offsets: &[usize],
) -> Value {
    let start = doc_offset + body.span.start as usize - prefix_len;
    let end = doc_offset + body.span.end as usize - prefix_len;

    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("BlockStatement".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert(
        "loc".to_string(),
        create_loc_for_binding(start, end, line_offsets),
    );

    let statements: Vec<Value> = body
        .statements
        .iter()
        .filter_map(|stmt| {
            convert_statement_with_adjustment(stmt, doc_offset, prefix_len, line_offsets)
        })
        .collect();
    obj.insert("body".to_string(), Value::Array(statements));

    Value::Object(obj)
}

fn convert_statement_with_adjustment(
    stmt: &oxc_ast::ast::Statement,
    doc_offset: usize,
    prefix_len: usize,
    line_offsets: &[usize],
) -> Option<Value> {
    match stmt {
        oxc_ast::ast::Statement::ReturnStatement(ret) => {
            let start = doc_offset + ret.span.start as usize - prefix_len;
            let end = doc_offset + ret.span.end as usize - prefix_len;

            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("ReturnStatement".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert(
                "loc".to_string(),
                create_loc_for_binding(start, end, line_offsets),
            );

            if let Some(arg) = &ret.argument {
                obj.insert(
                    "argument".to_string(),
                    convert_expression_with_adjustment(arg, doc_offset, prefix_len, line_offsets),
                );
            } else {
                obj.insert("argument".to_string(), Value::Null);
            }

            Some(Value::Object(obj))
        }
        oxc_ast::ast::Statement::ExpressionStatement(expr_stmt) => {
            let start = doc_offset + expr_stmt.span.start as usize - prefix_len;
            let end = doc_offset + expr_stmt.span.end as usize - prefix_len;

            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("ExpressionStatement".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert(
                "loc".to_string(),
                create_loc_for_binding(start, end, line_offsets),
            );
            obj.insert(
                "expression".to_string(),
                convert_expression_with_adjustment(
                    &expr_stmt.expression,
                    doc_offset,
                    prefix_len,
                    line_offsets,
                ),
            );

            Some(Value::Object(obj))
        }
        _ => None,
    }
}
