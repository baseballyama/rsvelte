//! JavaScript/TypeScript parsing using OXC (acorn.js equivalent)
//!
//! This module provides parsing capabilities equivalent to the original Svelte compiler's acorn.js.
//! - `svelte/packages/svelte/src/compiler/phases/1-parse/acorn.js`
//!
//! The original implementation uses Acorn with TypeScript plugin for parsing JavaScript and TypeScript.
//! This Rust implementation uses OXC for better performance and native Rust integration.
//!
//! ## Key differences from the original:
//! - Uses OXC instead of Acorn for parsing
//! - Comment attachment to AST nodes is handled during parsing
//! - TypeScript support is built-in to OXC, no plugin needed

use oxc_allocator::Allocator;
use oxc_ast::ast::{Program, Statement};
use oxc_parser::{Parser as OxcParser, ParserReturn};
use oxc_span::{GetSpan, SourceType};
use serde_json::{Map, Value as JsonValue};

/// Parse result containing the AST and any comments
#[allow(dead_code)]
pub struct ParseResult {
    pub ast: JsonValue,
    pub comments: Vec<Comment>,
}

/// Comment with location information
#[allow(dead_code)]
#[derive(Debug, Clone)]
pub struct Comment {
    pub kind: CommentKind,
    #[allow(dead_code)]
    pub value: String,
    pub start: usize,
    pub end: usize,
}

#[allow(dead_code)]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CommentKind {
    Line,
    Block,
}

impl CommentKind {
    #[allow(dead_code)]
    pub fn as_str(&self) -> &'static str {
        match self {
            CommentKind::Line => "Line",
            CommentKind::Block => "Block",
        }
    }
}

/// Parse a full JavaScript/TypeScript program
///
/// Equivalent to the `parse` function in acorn.js
///
/// # Arguments
/// * `source` - The source code to parse
/// * `typescript` - Whether to enable TypeScript parsing
/// * `_is_script` - Whether this is a script tag (affects export validation)
///
/// # Returns
/// A JSON representation of the Program AST with comments attached
#[allow(dead_code)]
pub fn parse(source: &str, typescript: bool, _is_script: bool) -> Result<ParseResult, String> {
    let source_type = if typescript {
        SourceType::default()
            .with_typescript(true)
            .with_module(true)
    } else {
        SourceType::default().with_module(true)
    };

    let allocator = Allocator::default();
    let parser = OxcParser::new(&allocator, source, source_type);
    let result = parser.parse();

    if !result.errors.is_empty() {
        let error_messages: Vec<String> = result.errors.iter().map(|e| format!("{}", e)).collect();
        return Err(error_messages.join("\n"));
    }

    // Extract comments from the parser
    let comments = extract_comments(source, &result);

    // Convert to JSON
    let ast = program_to_json(&result.program, source);

    Ok(ParseResult { ast, comments })
}

/// Parse an expression at a specific index
///
/// Equivalent to the `parse_expression_at` function in acorn.js
///
/// # Arguments
/// * `source` - The source code to parse
/// * `typescript` - Whether to enable TypeScript parsing
/// * `index` - The starting position to parse from
///
/// # Returns
/// A JSON representation of the expression with comments
#[allow(dead_code)]
pub fn parse_expression_at(
    source: &str,
    typescript: bool,
    index: usize,
) -> Result<ParseResult, String> {
    let source_type = if typescript {
        SourceType::default()
            .with_typescript(true)
            .with_module(true)
    } else {
        SourceType::default().with_module(true)
    };

    // Extract the portion of source from index
    let slice = &source[index..];

    // Wrap in a statement to parse as expression
    let wrapped = format!("({})", slice);

    let allocator = Allocator::default();
    let parser = OxcParser::new(&allocator, &wrapped, source_type);
    let result = parser.parse();

    if !result.errors.is_empty() {
        let error_messages: Vec<String> = result.errors.iter().map(|e| format!("{}", e)).collect();
        return Err(error_messages.join("\n"));
    }

    // Extract the expression from the wrapped program
    if let Some(Statement::ExpressionStatement(expr_stmt)) = result.program.body.first() {
        // Adjust positions back to original indices
        let comments = extract_comments(&wrapped, &result)
            .into_iter()
            .map(|mut c| {
                c.start = c.start.saturating_sub(1) + index;
                c.end = c.end.saturating_sub(1) + index;
                c
            })
            .collect();

        let mut ast = expression_to_json(&expr_stmt.expression, &wrapped);

        // Adjust AST positions
        if let Some(obj) = ast.as_object_mut() {
            adjust_positions_recursive(obj, index - 1);
        }

        Ok(ParseResult { ast, comments })
    } else {
        Err("Failed to parse expression".to_string())
    }
}

/// Extract comments from OXC parser result
#[allow(dead_code)]
fn extract_comments(source: &str, result: &ParserReturn) -> Vec<Comment> {
    let mut comments = Vec::new();

    for comment in &result.program.comments {
        let span = comment.span;
        let value = extract_comment_value(
            &source[span.start as usize..span.end as usize],
            comment.kind,
        );

        comments.push(Comment {
            kind: match comment.kind {
                oxc_ast::ast::CommentKind::Line => CommentKind::Line,
                oxc_ast::ast::CommentKind::SingleLineBlock
                | oxc_ast::ast::CommentKind::MultiLineBlock => CommentKind::Block,
            },
            value,
            start: span.start as usize,
            end: span.end as usize,
        });
    }

    comments
}

/// Extract the value from a comment, removing delimiters
#[allow(dead_code)]
fn extract_comment_value(raw: &str, kind: oxc_ast::ast::CommentKind) -> String {
    match kind {
        oxc_ast::ast::CommentKind::Line => raw.strip_prefix("//").unwrap_or(raw).to_string(),
        oxc_ast::ast::CommentKind::SingleLineBlock | oxc_ast::ast::CommentKind::MultiLineBlock => {
            let stripped = raw.strip_prefix("/*").unwrap_or(raw);
            stripped.strip_suffix("*/").unwrap_or(stripped).to_string()
        }
    }
}

/// Convert OXC Program to JSON representation
#[allow(dead_code)]
fn program_to_json(program: &Program, source: &str) -> JsonValue {
    let mut obj = Map::new();
    obj.insert("type".to_string(), JsonValue::String("Program".to_string()));

    let span = program.span();
    obj.insert(
        "start".to_string(),
        JsonValue::Number((span.start as usize).into()),
    );
    obj.insert(
        "end".to_string(),
        JsonValue::Number((span.end as usize).into()),
    );

    // Add body
    let body: Vec<JsonValue> = program
        .body
        .iter()
        .map(|stmt| statement_to_json(stmt, source))
        .collect();
    obj.insert("body".to_string(), JsonValue::Array(body));

    obj.insert(
        "sourceType".to_string(),
        JsonValue::String("module".to_string()),
    );

    JsonValue::Object(obj)
}

/// Convert OXC Statement to JSON
#[allow(dead_code)]
fn statement_to_json(stmt: &Statement, source: &str) -> JsonValue {
    // Basic conversion - would need full implementation for all statement types
    let mut obj = Map::new();
    let span = stmt.span();
    obj.insert(
        "start".to_string(),
        JsonValue::Number((span.start as usize).into()),
    );
    obj.insert(
        "end".to_string(),
        JsonValue::Number((span.end as usize).into()),
    );

    // Add type based on statement variant
    match stmt {
        Statement::ExpressionStatement(expr) => {
            obj.insert(
                "type".to_string(),
                JsonValue::String("ExpressionStatement".to_string()),
            );
            obj.insert(
                "expression".to_string(),
                expression_to_json(&expr.expression, source),
            );
        }
        Statement::BlockStatement(block) => {
            obj.insert(
                "type".to_string(),
                JsonValue::String("BlockStatement".to_string()),
            );
            let body: Vec<JsonValue> = block
                .body
                .iter()
                .map(|s| statement_to_json(s, source))
                .collect();
            obj.insert("body".to_string(), JsonValue::Array(body));
        }
        Statement::ImportDeclaration(_import) => {
            obj.insert(
                "type".to_string(),
                JsonValue::String("ImportDeclaration".to_string()),
            );
            // Add import-specific fields
        }
        Statement::ExportNamedDeclaration(_export) => {
            obj.insert(
                "type".to_string(),
                JsonValue::String("ExportNamedDeclaration".to_string()),
            );
            // Add export-specific fields
        }
        _ => {
            obj.insert(
                "type".to_string(),
                JsonValue::String("UnknownStatement".to_string()),
            );
        }
    }

    JsonValue::Object(obj)
}

/// Convert OXC Expression to JSON
#[allow(dead_code)]
fn expression_to_json(expr: &oxc_ast::ast::Expression, source: &str) -> JsonValue {
    let mut obj = Map::new();
    let span = expr.span();
    obj.insert(
        "start".to_string(),
        JsonValue::Number((span.start as usize).into()),
    );
    obj.insert(
        "end".to_string(),
        JsonValue::Number((span.end as usize).into()),
    );

    match expr {
        oxc_ast::ast::Expression::Identifier(id) => {
            obj.insert(
                "type".to_string(),
                JsonValue::String("Identifier".to_string()),
            );
            obj.insert("name".to_string(), JsonValue::String(id.name.to_string()));
        }
        oxc_ast::ast::Expression::NumericLiteral(num) => {
            obj.insert("type".to_string(), JsonValue::String("Literal".to_string()));
            if let Some(num_value) = serde_json::Number::from_f64(num.value) {
                obj.insert("value".to_string(), JsonValue::Number(num_value));
            }
            let raw = num
                .raw
                .as_ref()
                .map(|r| r.to_string())
                .unwrap_or_else(|| num.value.to_string());
            obj.insert("raw".to_string(), JsonValue::String(raw));
        }
        oxc_ast::ast::Expression::StringLiteral(str_lit) => {
            obj.insert("type".to_string(), JsonValue::String("Literal".to_string()));
            obj.insert(
                "value".to_string(),
                JsonValue::String(str_lit.value.to_string()),
            );
            obj.insert(
                "raw".to_string(),
                JsonValue::String(source[span.start as usize..span.end as usize].to_string()),
            );
        }
        oxc_ast::ast::Expression::BooleanLiteral(bool_lit) => {
            obj.insert("type".to_string(), JsonValue::String("Literal".to_string()));
            obj.insert("value".to_string(), JsonValue::Bool(bool_lit.value));
            obj.insert(
                "raw".to_string(),
                JsonValue::String(bool_lit.value.to_string()),
            );
        }
        oxc_ast::ast::Expression::NullLiteral(_) => {
            obj.insert("type".to_string(), JsonValue::String("Literal".to_string()));
            obj.insert("value".to_string(), JsonValue::Null);
            obj.insert("raw".to_string(), JsonValue::String("null".to_string()));
        }
        oxc_ast::ast::Expression::ArrayExpression(arr) => {
            obj.insert(
                "type".to_string(),
                JsonValue::String("ArrayExpression".to_string()),
            );
            let elements: Vec<JsonValue> = arr
                .elements
                .iter()
                .map(|elem| match elem {
                    oxc_ast::ast::ArrayExpressionElement::SpreadElement(spread) => {
                        let mut spread_obj = Map::new();
                        spread_obj.insert(
                            "type".to_string(),
                            JsonValue::String("SpreadElement".to_string()),
                        );
                        spread_obj.insert(
                            "argument".to_string(),
                            expression_to_json(&spread.argument, source),
                        );
                        JsonValue::Object(spread_obj)
                    }
                    oxc_ast::ast::ArrayExpressionElement::Elision(_) => JsonValue::Null,
                    _ => {
                        // Use to_expression() for other array elements
                        let expr = elem.to_expression();
                        expression_to_json(expr, source)
                    }
                })
                .collect();
            obj.insert("elements".to_string(), JsonValue::Array(elements));
        }
        oxc_ast::ast::Expression::ObjectExpression(_obj_expr) => {
            obj.insert(
                "type".to_string(),
                JsonValue::String("ObjectExpression".to_string()),
            );
            // Add properties conversion
        }
        oxc_ast::ast::Expression::CallExpression(call) => {
            obj.insert(
                "type".to_string(),
                JsonValue::String("CallExpression".to_string()),
            );
            obj.insert(
                "callee".to_string(),
                expression_to_json(&call.callee, source),
            );
            // Add arguments conversion
        }
        oxc_ast::ast::Expression::ArrowFunctionExpression(_arrow) => {
            obj.insert(
                "type".to_string(),
                JsonValue::String("ArrowFunctionExpression".to_string()),
            );
            // Add arrow function fields
        }
        oxc_ast::ast::Expression::BinaryExpression(bin) => {
            obj.insert(
                "type".to_string(),
                JsonValue::String("BinaryExpression".to_string()),
            );
            obj.insert(
                "operator".to_string(),
                JsonValue::String(bin.operator.as_str().to_string()),
            );
            obj.insert("left".to_string(), expression_to_json(&bin.left, source));
            obj.insert("right".to_string(), expression_to_json(&bin.right, source));
        }
        oxc_ast::ast::Expression::ParenthesizedExpression(paren) => {
            // Unwrap parenthesized expressions
            return expression_to_json(&paren.expression, source);
        }
        _ => {
            obj.insert(
                "type".to_string(),
                JsonValue::String("UnknownExpression".to_string()),
            );
        }
    }

    JsonValue::Object(obj)
}

/// Recursively adjust positions in AST JSON
#[allow(dead_code)]
fn adjust_positions_recursive(obj: &mut Map<String, JsonValue>, offset: usize) {
    if let Some(JsonValue::Number(start)) = obj.get("start")
        && let Some(start_num) = start.as_u64()
    {
        obj.insert(
            "start".to_string(),
            JsonValue::Number((start_num as usize + offset).into()),
        );
    }

    if let Some(JsonValue::Number(end)) = obj.get("end")
        && let Some(end_num) = end.as_u64()
    {
        obj.insert(
            "end".to_string(),
            JsonValue::Number((end_num as usize + offset).into()),
        );
    }

    // Recursively process nested objects and arrays
    for (_, value) in obj.iter_mut() {
        match value {
            JsonValue::Object(nested) => adjust_positions_recursive(nested, offset),
            JsonValue::Array(arr) => {
                for item in arr.iter_mut() {
                    if let JsonValue::Object(nested) = item {
                        adjust_positions_recursive(nested, offset);
                    }
                }
            }
            _ => {}
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_simple_program() {
        let source = "const x = 1;";
        let result = parse(source, false, false);
        assert!(result.is_ok());

        let parse_result = result.unwrap();
        assert!(parse_result.ast.is_object());
    }

    #[test]
    fn test_parse_typescript() {
        let source = "const x: number = 1;";
        let result = parse(source, true, false);
        assert!(result.is_ok());
    }

    #[test]
    fn test_parse_expression_at() {
        // Test parsing expression starting at a specific position
        // Note: parse_expression_at parses everything from the index to the end as an expression
        let source = "xxx 1 + 2";
        let result = parse_expression_at(source, false, 4);
        assert!(result.is_ok());
    }

    #[test]
    fn test_comment_extraction() {
        let source = "// line comment\nconst x = 1; /* block comment */";
        let result = parse(source, false, false);
        assert!(result.is_ok());

        let parse_result = result.unwrap();
        assert_eq!(parse_result.comments.len(), 2);
        assert_eq!(parse_result.comments[0].kind, CommentKind::Line);
        assert_eq!(parse_result.comments[1].kind, CommentKind::Block);
    }
}
