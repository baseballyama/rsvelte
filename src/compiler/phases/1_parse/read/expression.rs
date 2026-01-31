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
use crate::compiler::phases::phase1_parse::utils::find_matching_bracket;

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
        oxc_ast::ast::CommentKind::SingleLineBlock | oxc_ast::ast::CommentKind::MultiLineBlock => {
            "Block"
        }
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
        oxc_ast::ast::CommentKind::SingleLineBlock | oxc_ast::ast::CommentKind::MultiLineBlock => {
            raw.strip_prefix("/*")
                .and_then(|s| s.strip_suffix("*/"))
                .unwrap_or(raw)
                .to_string()
        }
    }
}

/// Get a loose identifier when expression parsing fails.
///
/// This corresponds to `get_loose_identifier` in Svelte's `read/expression.js`.
/// Finds the next closing bracket and returns an empty identifier spanning that range.
///
/// # Arguments
/// * `template` - The full template string
/// * `start` - Start position (after the opening bracket)
/// * `opening_token` - The opening token (e.g., '{')
/// * `line_offsets` - Line offsets for location calculation
///
/// # Returns
/// An empty `Identifier` node if a matching bracket is found, otherwise `None`.
fn get_loose_identifier(
    template: &str,
    start: usize,
    opening_token: char,
    _line_offsets: &[usize],
) -> Option<Expression> {
    // Find the next closing bracket and treat it as the end of the expression
    if let Some(end) = find_matching_bracket(template, start, opening_token) {
        // We don't know what the expression is and signal this by returning an empty identifier
        let mut obj = Map::new();
        obj.insert("type".to_string(), Value::String("Identifier".to_string()));
        obj.insert("start".to_string(), Value::Number((start as i64).into()));
        obj.insert("end".to_string(), Value::Number((end as i64).into()));
        obj.insert("name".to_string(), Value::String("".to_string()));

        // Note: loc field is NOT added here. It should be added by the caller
        // for shorthand attributes (e.g., <div {}>), but not for regular attributes
        // (e.g., <div foo={}>).

        return Some(Expression::Value(Value::Object(obj)));
    }
    None
}

/// Parse a JavaScript expression and return it as an Expression.
///
/// This corresponds to `read_expression` (default export) in Svelte's `read/expression.js`.
///
/// # Arguments
/// * `content` - The expression string to parse
/// * `offset` - Byte offset in the source
/// * `line_offsets` - Line offsets for location calculation
/// * `template` - The full template string (for loose mode bracket matching)
/// * `loose` - Whether to use loose mode (allow invalid expressions)
/// * `disallow_loose` - Whether to disallow loose mode even if `loose` is true
/// * `opening_token` - The opening bracket token (default: '{')
///
/// # Returns
/// A parsed `Expression` or an empty identifier in loose mode.
pub fn parse_expression(
    content: &str,
    offset: usize,
    line_offsets: &[usize],
    template: &str,
    loose: bool,
    disallow_loose: bool,
    opening_token: char,
) -> Expression {
    // Try TypeScript first, then fall back to JavaScript
    let result = parse_expression_with_typescript(content, offset, line_offsets, true)
        .or_else(|| parse_expression_with_typescript(content, offset, line_offsets, false));

    if let Some(expr) = result {
        return expr;
    }

    // If parsing failed and we're in loose mode (and not disallowed), try loose identifier
    if loose
        && !disallow_loose
        && let Some(loose_expr) =
            get_loose_identifier(template, offset, opening_token, line_offsets)
    {
        return loose_expr;
    }

    // Fall back to invalid identifier
    create_invalid_identifier(offset, offset + content.len(), line_offsets)
}

/// Parse a JavaScript expression with a known end position.
///
/// This is used when the expression's end position is already known (e.g., in await blocks
/// where the expression ends at 'then' or 'catch'), to avoid find_matching_bracket finding
/// the wrong closing bracket.
///
/// # Arguments
/// * `content` - The expression content to parse
/// * `offset` - Start position in the template
/// * `end` - End position in the template
/// * `line_offsets` - Line offsets for location calculation
/// * `_template` - The full template string (unused in this version)
/// * `loose` - Whether loose mode is enabled
/// * `disallow_loose` - Whether to disallow loose identifiers
/// * `_opening_token` - The opening token (usually '{')
///
/// # Returns
/// A parsed `Expression` or an empty identifier in loose mode.
#[allow(clippy::too_many_arguments)]
pub fn parse_expression_with_end(
    content: &str,
    offset: usize,
    end: usize,
    line_offsets: &[usize],
    _template: &str,
    loose: bool,
    disallow_loose: bool,
    _opening_token: char,
) -> Expression {
    // Try TypeScript first, then fall back to JavaScript
    let result = parse_expression_with_typescript(content, offset, line_offsets, true)
        .or_else(|| parse_expression_with_typescript(content, offset, line_offsets, false));

    if let Some(expr) = result {
        return expr;
    }

    // If parsing failed and we're in loose mode (and not disallowed), create invalid identifier
    // with the known end position
    if loose && !disallow_loose {
        return create_invalid_identifier(offset, end, line_offsets);
    }

    // Fall back to invalid identifier
    create_invalid_identifier(offset, end, line_offsets)
}

/// Check if JavaScript expression has parse errors. Returns Some(error_message) if there is an error.
#[allow(dead_code)]
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

/// Create an identifier for invalid expressions
fn create_invalid_identifier(start: usize, end: usize, _line_offsets: &[usize]) -> Expression {
    let mut obj = Map::new();
    obj.insert("type".to_string(), Value::String("Identifier".to_string()));
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("name".to_string(), Value::String("".to_string()));

    // Note: Similar to get_loose_identifier, invalid identifiers don't include 'loc'

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

    if result.errors.is_empty()
        && let Some(oxc_ast::ast::Statement::ExpressionStatement(expr_stmt)) =
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
                    if matches!(
                        comment.kind,
                        oxc_ast::ast::CommentKind::SingleLineBlock
                            | oxc_ast::ast::CommentKind::MultiLineBlock
                    ) {
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
                    if matches!(
                        comment.kind,
                        oxc_ast::ast::CommentKind::SingleLineBlock
                            | oxc_ast::ast::CommentKind::MultiLineBlock
                    ) {
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

    if result.errors.is_empty()
        && let Some(oxc_ast::ast::Statement::ExpressionStatement(expr_stmt)) =
            result.program.body.first()
        && let OxcExpression::ArrowFunctionExpression(arrow) = &expr_stmt.expression
    {
        for param in &arrow.params.items {
            // Adjust offset: -1 for the opening paren we added
            let param_expr = convert_formal_parameter(param, offset - 1, line_offsets);
            params.push(param_expr);
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
    use oxc_ast::ast::BindingPattern;

    match &param.pattern {
        BindingPattern::BindingIdentifier(id) => {
            let start = adjusted_offset + id.span.start as usize;
            let name = id.name.as_str();

            // In OXC v0.107, type annotations are stored in FormalParameter, not BindingIdentifier
            if let Some(type_ann) = &param.type_annotation {
                let end = adjusted_offset + type_ann.span.end as usize;

                let mut obj = Map::new();
                obj.insert("type".to_string(), Value::String("Identifier".to_string()));
                obj.insert("start".to_string(), Value::Number((start as i64).into()));
                obj.insert("end".to_string(), Value::Number((end as i64).into()));
                obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
                obj.insert("name".to_string(), Value::String(name.to_string()));

                // Convert type annotation
                let type_ann_obj =
                    convert_type_annotation_adjusted(type_ann, adjusted_offset, line_offsets);
                obj.insert("typeAnnotation".to_string(), type_ann_obj);

                return Expression::Value(Value::Object(obj));
            }

            let end = adjusted_offset + id.span.end as usize;
            create_identifier(name, start, end, line_offsets)
        }
        BindingPattern::ObjectPattern(obj_pat) => {
            // Convert to proper ObjectPattern JSON
            convert_object_pattern_to_expr(obj_pat, adjusted_offset, line_offsets)
        }
        BindingPattern::ArrayPattern(arr_pat) => {
            // Convert to proper ArrayPattern JSON
            convert_array_pattern_to_expr(arr_pat, adjusted_offset, line_offsets)
        }
        BindingPattern::AssignmentPattern(assign_pat) => {
            // Convert to proper AssignmentPattern JSON
            convert_assignment_pattern_to_expr(assign_pat, adjusted_offset, line_offsets)
        }
    }
}

/// Convert oxc ObjectPattern to our Expression format (for function parameters).
fn convert_object_pattern_to_expr(
    obj_pat: &oxc_ast::ast::ObjectPattern,
    adjusted_offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let start = adjusted_offset + obj_pat.span.start as usize;
    let end = adjusted_offset + obj_pat.span.end as usize;

    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("ObjectPattern".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    // Convert properties
    let mut properties = Vec::new();
    for prop in &obj_pat.properties {
        let prop_start = adjusted_offset + prop.span.start as usize;
        let prop_end = adjusted_offset + prop.span.end as usize;

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
        prop_obj.insert("computed".to_string(), Value::Bool(prop.computed));
        prop_obj.insert("method".to_string(), Value::Bool(false));
        prop_obj.insert("kind".to_string(), Value::String("init".to_string()));

        // Convert key
        let key_value = convert_property_key_for_param(&prop.key, adjusted_offset, line_offsets);
        prop_obj.insert("key".to_string(), key_value.clone());

        // Convert value (the pattern being bound to)
        let value_value =
            convert_binding_pattern_for_param(&prop.value, adjusted_offset, line_offsets);
        prop_obj.insert("value".to_string(), value_value.clone());

        // Check if shorthand (key name equals value name for simple identifiers)
        let shorthand = prop.shorthand;
        prop_obj.insert("shorthand".to_string(), Value::Bool(shorthand));

        properties.push(Value::Object(prop_obj));
    }

    // Handle rest element if present
    if let Some(rest) = &obj_pat.rest {
        let rest_start = adjusted_offset + rest.span.start as usize;
        let rest_end = adjusted_offset + rest.span.end as usize;

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

        let argument =
            convert_binding_pattern_for_param(&rest.argument, adjusted_offset, line_offsets);
        rest_obj.insert("argument".to_string(), argument);

        properties.push(Value::Object(rest_obj));
    }

    obj.insert("properties".to_string(), Value::Array(properties));

    Expression::Value(Value::Object(obj))
}

/// Convert oxc ArrayPattern to our Expression format (for function parameters).
fn convert_array_pattern_to_expr(
    arr_pat: &oxc_ast::ast::ArrayPattern,
    adjusted_offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let start = adjusted_offset + arr_pat.span.start as usize;
    let end = adjusted_offset + arr_pat.span.end as usize;

    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("ArrayPattern".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    // Convert elements
    let mut elements = Vec::new();
    for elem in &arr_pat.elements {
        if let Some(pattern) = elem {
            elements.push(convert_binding_pattern_for_param(
                pattern,
                adjusted_offset,
                line_offsets,
            ));
        } else {
            elements.push(Value::Null);
        }
    }

    // Handle rest element if present
    if let Some(rest) = &arr_pat.rest {
        let rest_start = adjusted_offset + rest.span.start as usize;
        let rest_end = adjusted_offset + rest.span.end as usize;

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

        let argument =
            convert_binding_pattern_for_param(&rest.argument, adjusted_offset, line_offsets);
        rest_obj.insert("argument".to_string(), argument);

        elements.push(Value::Object(rest_obj));
    }

    obj.insert("elements".to_string(), Value::Array(elements));

    Expression::Value(Value::Object(obj))
}

/// Convert oxc AssignmentPattern to our Expression format (for function parameters).
fn convert_assignment_pattern_to_expr(
    assign_pat: &oxc_ast::ast::AssignmentPattern,
    adjusted_offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let start = adjusted_offset + assign_pat.span.start as usize;
    let end = adjusted_offset + assign_pat.span.end as usize;

    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("AssignmentPattern".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    // Convert left (the pattern)
    let left = convert_binding_pattern_for_param(&assign_pat.left, adjusted_offset, line_offsets);
    obj.insert("left".to_string(), left);

    // Convert right (the default value) - simplified for now
    let right_start = adjusted_offset + assign_pat.right.span().start as usize;
    let right_end = adjusted_offset + assign_pat.right.span().end as usize;
    let mut right_obj = Map::new();
    right_obj.insert("type".to_string(), Value::String("Expression".to_string()));
    right_obj.insert(
        "start".to_string(),
        Value::Number((right_start as i64).into()),
    );
    right_obj.insert("end".to_string(), Value::Number((right_end as i64).into()));
    obj.insert("right".to_string(), Value::Object(right_obj));

    Expression::Value(Value::Object(obj))
}

/// Convert oxc PropertyKey to our JSON format (for function parameters).
fn convert_property_key_for_param(
    key: &oxc_ast::ast::PropertyKey,
    adjusted_offset: usize,
    line_offsets: &[usize],
) -> Value {
    use oxc_ast::ast::PropertyKey;

    match key {
        PropertyKey::StaticIdentifier(id) => {
            let start = adjusted_offset + id.span.start as usize;
            let end = adjusted_offset + id.span.end as usize;
            let mut obj = Map::new();
            obj.insert("type".to_string(), Value::String("Identifier".to_string()));
            obj.insert("name".to_string(), Value::String(id.name.to_string()));
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
            Value::Object(obj)
        }
        PropertyKey::PrivateIdentifier(id) => {
            let start = adjusted_offset + id.span.start as usize;
            let end = adjusted_offset + id.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("PrivateIdentifier".to_string()),
            );
            obj.insert("name".to_string(), Value::String(id.name.to_string()));
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
            Value::Object(obj)
        }
        _ => {
            // For computed keys or other cases, create a placeholder
            let mut obj = Map::new();
            obj.insert("type".to_string(), Value::String("Identifier".to_string()));
            obj.insert(
                "name".to_string(),
                Value::String("__computed__".to_string()),
            );
            Value::Object(obj)
        }
    }
}

/// Convert oxc BindingPattern to our JSON format (for function parameters).
fn convert_binding_pattern_for_param(
    pattern: &oxc_ast::ast::BindingPattern,
    adjusted_offset: usize,
    line_offsets: &[usize],
) -> Value {
    use oxc_ast::ast::BindingPattern;

    match pattern {
        BindingPattern::BindingIdentifier(id) => {
            let start = adjusted_offset + id.span.start as usize;
            let end = adjusted_offset + id.span.end as usize;
            let mut obj = Map::new();
            obj.insert("type".to_string(), Value::String("Identifier".to_string()));
            obj.insert("name".to_string(), Value::String(id.name.to_string()));
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
            Value::Object(obj)
        }
        BindingPattern::ObjectPattern(obj_pat) => {
            // Recursive call for nested object patterns
            let Expression::Value(val) =
                convert_object_pattern_to_expr(obj_pat, adjusted_offset, line_offsets);
            val
        }
        BindingPattern::ArrayPattern(arr_pat) => {
            let start = adjusted_offset + arr_pat.span.start as usize;
            let end = adjusted_offset + arr_pat.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("ArrayPattern".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

            // Convert elements
            let mut elements = Vec::new();
            for elem in &arr_pat.elements {
                if let Some(pattern) = elem {
                    elements.push(convert_binding_pattern_for_param(
                        pattern,
                        adjusted_offset,
                        line_offsets,
                    ));
                } else {
                    elements.push(Value::Null);
                }
            }
            obj.insert("elements".to_string(), Value::Array(elements));

            Value::Object(obj)
        }
        BindingPattern::AssignmentPattern(assign_pat) => {
            let start = adjusted_offset + assign_pat.span.start as usize;
            let end = adjusted_offset + assign_pat.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("AssignmentPattern".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

            // Convert left (the pattern)
            let left =
                convert_binding_pattern_for_param(&assign_pat.left, adjusted_offset, line_offsets);
            obj.insert("left".to_string(), left);

            // Convert right (the default value) - simplified for now
            let right_start = adjusted_offset + assign_pat.right.span().start as usize;
            let right_end = adjusted_offset + assign_pat.right.span().end as usize;
            let mut right_obj = Map::new();
            right_obj.insert("type".to_string(), Value::String("Expression".to_string()));
            right_obj.insert(
                "start".to_string(),
                Value::Number((right_start as i64).into()),
            );
            right_obj.insert("end".to_string(), Value::Number((right_end as i64).into()));
            obj.insert("right".to_string(), Value::Object(right_obj));

            Value::Object(obj)
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
        oxc_ast::ast::TSTypeName::ThisExpression(this) => {
            // Handle this type (e.g., this.foo)
            let start = adjusted_offset + this.span.start as usize;
            let end = adjusted_offset + this.span.end as usize;

            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("ThisExpression".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

            Value::Object(obj)
        }
    }
}

/// Convert oxc TSTypeAnnotation to a serde_json::Value.
#[allow(dead_code)]
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
#[allow(dead_code)]
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
        OxcExpression::NewExpression(new_expr) => {
            let start = offset + new_expr.span.start as usize - 1;
            let end = offset + new_expr.span.end as usize - 1;
            create_new_expression(new_expr, start, end, offset, line_offsets)
        }
        OxcExpression::ThisExpression(this_expr) => {
            let start = offset + this_expr.span.start as usize - 1;
            let end = offset + this_expr.span.end as usize - 1;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("ThisExpression".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
            Expression::Value(Value::Object(obj))
        }
        OxcExpression::Super(super_expr) => {
            let start = offset + super_expr.span.start as usize - 1;
            let end = offset + super_expr.span.end as usize - 1;
            let mut obj = Map::new();
            obj.insert("type".to_string(), Value::String("Super".to_string()));
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
            Expression::Value(Value::Object(obj))
        }
        OxcExpression::FunctionExpression(func) => {
            let start = offset + func.span.start as usize - 1;
            let end = offset + func.span.end as usize - 1;
            create_function_expression(func, start, end, offset, line_offsets)
        }
        OxcExpression::ClassExpression(class_expr) => {
            let start = offset + class_expr.span.start as usize - 1;
            let end = offset + class_expr.span.end as usize - 1;
            create_class_expression(class_expr, start, end, offset, line_offsets)
        }
        OxcExpression::ImportExpression(import_expr) => {
            let start = offset + import_expr.span.start as usize - 1;
            let end = offset + import_expr.span.end as usize - 1;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("ImportExpression".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
            obj.insert(
                "source".to_string(),
                convert_expression(&import_expr.source, offset, line_offsets)
                    .as_json()
                    .clone(),
            );
            Expression::Value(Value::Object(obj))
        }
        OxcExpression::AwaitExpression(await_expr) => {
            let start = offset + await_expr.span.start as usize - 1;
            let end = offset + await_expr.span.end as usize - 1;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("AwaitExpression".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
            obj.insert(
                "argument".to_string(),
                convert_expression(&await_expr.argument, offset, line_offsets)
                    .as_json()
                    .clone(),
            );
            Expression::Value(Value::Object(obj))
        }
        OxcExpression::YieldExpression(yield_expr) => {
            let start = offset + yield_expr.span.start as usize - 1;
            let end = offset + yield_expr.span.end as usize - 1;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("YieldExpression".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
            obj.insert("delegate".to_string(), Value::Bool(yield_expr.delegate));
            if let Some(ref arg) = yield_expr.argument {
                obj.insert(
                    "argument".to_string(),
                    convert_expression(arg, offset, line_offsets)
                        .as_json()
                        .clone(),
                );
            } else {
                obj.insert("argument".to_string(), Value::Null);
            }
            Expression::Value(Value::Object(obj))
        }
        OxcExpression::ChainExpression(chain_expr) => {
            let start = offset + chain_expr.span.start as usize - 1;
            let end = offset + chain_expr.span.end as usize - 1;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("ChainExpression".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
            // Convert the chain expression's expression
            let chain_inner = match &chain_expr.expression {
                oxc_ast::ast::ChainElement::CallExpression(call) => {
                    let inner_start = offset + call.span.start as usize - 1;
                    let inner_end = offset + call.span.end as usize - 1;
                    create_call_expression(call, inner_start, inner_end, offset, line_offsets)
                        .as_json()
                        .clone()
                }
                oxc_ast::ast::ChainElement::TSNonNullExpression(ts_non_null) => {
                    convert_expression(&ts_non_null.expression, offset, line_offsets)
                        .as_json()
                        .clone()
                }
                oxc_ast::ast::ChainElement::StaticMemberExpression(member) => {
                    let inner_start = offset + member.span.start as usize - 1;
                    let inner_end = offset + member.span.end as usize - 1;
                    create_static_member_expression(
                        member,
                        inner_start,
                        inner_end,
                        offset,
                        line_offsets,
                    )
                    .as_json()
                    .clone()
                }
                oxc_ast::ast::ChainElement::ComputedMemberExpression(member) => {
                    let inner_start = offset + member.span.start as usize - 1;
                    let inner_end = offset + member.span.end as usize - 1;
                    create_computed_member_expression(
                        member,
                        inner_start,
                        inner_end,
                        offset,
                        line_offsets,
                    )
                    .as_json()
                    .clone()
                }
                oxc_ast::ast::ChainElement::PrivateFieldExpression(private_member) => {
                    let inner_start = offset + private_member.span.start as usize - 1;
                    let inner_end = offset + private_member.span.end as usize - 1;
                    create_private_member_expression(
                        private_member,
                        inner_start,
                        inner_end,
                        offset,
                        line_offsets,
                    )
                    .as_json()
                    .clone()
                }
            };
            obj.insert("expression".to_string(), chain_inner);
            Expression::Value(Value::Object(obj))
        }
        OxcExpression::PrivateFieldExpression(private_member) => {
            let start = offset + private_member.span.start as usize - 1;
            let end = offset + private_member.span.end as usize - 1;
            create_private_member_expression(private_member, start, end, offset, line_offsets)
        }
        OxcExpression::TaggedTemplateExpression(tagged) => {
            let start = offset + tagged.span.start as usize - 1;
            let end = offset + tagged.span.end as usize - 1;
            create_tagged_template_expression(tagged, start, end, offset, line_offsets)
        }
        OxcExpression::MetaProperty(meta) => {
            let start = offset + meta.span.start as usize - 1;
            let end = offset + meta.span.end as usize - 1;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("MetaProperty".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
            // meta
            let meta_start = offset + meta.meta.span.start as usize - 1;
            let meta_end = offset + meta.meta.span.end as usize - 1;
            obj.insert(
                "meta".to_string(),
                create_identifier(&meta.meta.name, meta_start, meta_end, line_offsets)
                    .as_json()
                    .clone(),
            );
            // property
            let prop_start = offset + meta.property.span.start as usize - 1;
            let prop_end = offset + meta.property.span.end as usize - 1;
            obj.insert(
                "property".to_string(),
                create_identifier(&meta.property.name, prop_start, prop_end, line_offsets)
                    .as_json()
                    .clone(),
            );
            Expression::Value(Value::Object(obj))
        }
        OxcExpression::RegExpLiteral(regex) => {
            let start = offset + regex.span.start as usize - 1;
            let end = offset + regex.span.end as usize - 1;
            create_regex_literal(regex, start, end, line_offsets)
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

/// Create a PrivateIdentifier node (for class private fields like #count).
fn create_private_identifier(
    name: &str,
    start: usize,
    end: usize,
    line_offsets: &[usize],
) -> Expression {
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("PrivateIdentifier".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
    // Note: name should NOT include the # prefix, just the identifier name
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

/// Create a PrivateIdentifier for binding patterns.
fn create_private_identifier_for_binding(
    name: &str,
    start: usize,
    end: usize,
    line_offsets: &[usize],
) -> Value {
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("PrivateIdentifier".to_string()),
    );
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

fn create_private_member_expression(
    member: &oxc_ast::ast::PrivateFieldExpression,
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

    // Create PrivateIdentifier for the property
    let prop_start = offset + member.field.span.start as usize - 1;
    let prop_end = offset + member.field.span.end as usize - 1;
    let property =
        create_private_identifier(&member.field.name, prop_start, prop_end, line_offsets);
    obj.insert("property".to_string(), property.as_json().clone());
    obj.insert("computed".to_string(), Value::Bool(false));
    obj.insert("optional".to_string(), Value::Bool(member.optional));

    Expression::Value(Value::Object(obj))
}

fn create_new_expression(
    new_expr: &oxc_ast::ast::NewExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("NewExpression".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    let callee = convert_expression(&new_expr.callee, offset, line_offsets);
    obj.insert("callee".to_string(), callee.as_json().clone());

    let args: Vec<Value> = new_expr
        .arguments
        .iter()
        .map(|arg| match arg {
            oxc_ast::ast::Argument::SpreadElement(spread) => {
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
                spread_obj.insert(
                    "argument".to_string(),
                    convert_expression(&spread.argument, offset, line_offsets)
                        .as_json()
                        .clone(),
                );
                Value::Object(spread_obj)
            }
            _ => {
                let expr = arg.to_expression();
                convert_expression(expr, offset, line_offsets)
                    .as_json()
                    .clone()
            }
        })
        .collect();
    obj.insert("arguments".to_string(), Value::Array(args));

    Expression::Value(Value::Object(obj))
}

fn create_function_expression(
    func: &oxc_ast::ast::Function,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("FunctionExpression".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    // id
    if let Some(ref id) = func.id {
        let id_start = offset + id.span.start as usize - 1;
        let id_end = offset + id.span.end as usize - 1;
        obj.insert(
            "id".to_string(),
            create_identifier(&id.name, id_start, id_end, line_offsets)
                .as_json()
                .clone(),
        );
    } else {
        obj.insert("id".to_string(), Value::Null);
    }

    obj.insert("generator".to_string(), Value::Bool(func.generator));
    obj.insert("async".to_string(), Value::Bool(func.r#async));
    obj.insert("expression".to_string(), Value::Bool(false));

    // params
    let params: Vec<Value> = func
        .params
        .items
        .iter()
        .map(|param| convert_binding_pattern(&param.pattern, offset, line_offsets))
        .collect();
    obj.insert("params".to_string(), Value::Array(params));

    // body
    if let Some(ref body) = func.body {
        let body_start = offset + body.span.start as usize - 1;
        let body_end = offset + body.span.end as usize - 1;
        let mut body_obj = Map::new();
        body_obj.insert(
            "type".to_string(),
            Value::String("BlockStatement".to_string()),
        );
        body_obj.insert(
            "start".to_string(),
            Value::Number((body_start as i64).into()),
        );
        body_obj.insert("end".to_string(), Value::Number((body_end as i64).into()));
        body_obj.insert(
            "loc".to_string(),
            create_loc(body_start, body_end, line_offsets),
        );

        let statements: Vec<Value> = body
            .statements
            .iter()
            .filter_map(|stmt| convert_statement(stmt, offset, line_offsets))
            .collect();
        body_obj.insert("body".to_string(), Value::Array(statements));

        obj.insert("body".to_string(), Value::Object(body_obj));
    } else {
        obj.insert("body".to_string(), Value::Null);
    }

    Expression::Value(Value::Object(obj))
}

fn create_class_expression(
    class_expr: &oxc_ast::ast::Class,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("ClassExpression".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    // id
    if let Some(ref id) = class_expr.id {
        let id_start = offset + id.span.start as usize - 1;
        let id_end = offset + id.span.end as usize - 1;
        obj.insert(
            "id".to_string(),
            create_identifier(&id.name, id_start, id_end, line_offsets)
                .as_json()
                .clone(),
        );
    } else {
        obj.insert("id".to_string(), Value::Null);
    }

    // superClass
    if let Some(ref super_class) = class_expr.super_class {
        let super_expr = convert_expression(super_class, offset, line_offsets);
        obj.insert("superClass".to_string(), super_expr.as_json().clone());
    } else {
        obj.insert("superClass".to_string(), Value::Null);
    }

    // body - use convert_class_body_for_expr
    let body = convert_class_body_for_expr(&class_expr.body, offset, line_offsets);
    obj.insert("body".to_string(), body);

    Expression::Value(Value::Object(obj))
}

fn create_tagged_template_expression(
    tagged: &oxc_ast::ast::TaggedTemplateExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("TaggedTemplateExpression".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    // tag
    let tag = convert_expression(&tagged.tag, offset, line_offsets);
    obj.insert("tag".to_string(), tag.as_json().clone());

    // quasi
    let quasi_start = offset + tagged.quasi.span.start as usize - 1;
    let quasi_end = offset + tagged.quasi.span.end as usize - 1;
    let quasi =
        create_template_literal(&tagged.quasi, quasi_start, quasi_end, offset, line_offsets);
    obj.insert("quasi".to_string(), quasi.as_json().clone());

    Expression::Value(Value::Object(obj))
}

fn create_regex_literal(
    regex: &oxc_ast::ast::RegExpLiteral,
    start: usize,
    end: usize,
    line_offsets: &[usize],
) -> Expression {
    let mut obj = Map::new();
    obj.insert("type".to_string(), Value::String("Literal".to_string()));
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    // regex property
    let mut regex_obj = Map::new();
    let pattern_str = regex.regex.pattern.text.to_string();
    let flags_str = regex.regex.flags.to_string();
    regex_obj.insert("pattern".to_string(), Value::String(pattern_str.clone()));
    regex_obj.insert("flags".to_string(), Value::String(flags_str.clone()));
    obj.insert("regex".to_string(), Value::Object(regex_obj));

    // raw
    let raw = if let Some(ref raw_str) = regex.raw {
        raw_str.to_string()
    } else {
        format!("/{}/{}", pattern_str, flags_str)
    };
    obj.insert("raw".to_string(), Value::String(raw));
    obj.insert("value".to_string(), Value::Object(Map::new())); // Regex value is stored in regex property

    Expression::Value(Value::Object(obj))
}

/// Convert a class body to JSON value (for expression context, with -1 offset adjustment).
fn convert_class_body_for_expr(
    body: &oxc_ast::ast::ClassBody,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    let start = offset + body.span.start as usize - 1;
    let end = offset + body.span.end as usize - 1;

    let mut obj = Map::new();
    obj.insert("type".to_string(), Value::String("ClassBody".to_string()));
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    let body_elements: Vec<Value> = body
        .body
        .iter()
        .filter_map(|element| convert_class_element_for_expr(element, offset, line_offsets))
        .collect();
    obj.insert("body".to_string(), Value::Array(body_elements));

    Value::Object(obj)
}

/// Convert a class element to JSON value (for expression context, with -1 offset adjustment).
fn convert_class_element_for_expr(
    element: &oxc_ast::ast::ClassElement,
    offset: usize,
    line_offsets: &[usize],
) -> Option<Value> {
    match element {
        oxc_ast::ast::ClassElement::MethodDefinition(method) => {
            let start = offset + method.span.start as usize - 1;
            let end = offset + method.span.end as usize - 1;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("MethodDefinition".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
            obj.insert("static".to_string(), Value::Bool(method.r#static));
            obj.insert("computed".to_string(), Value::Bool(method.computed));

            // kind
            let kind = match method.kind {
                oxc_ast::ast::MethodDefinitionKind::Constructor => "constructor",
                oxc_ast::ast::MethodDefinitionKind::Method => "method",
                oxc_ast::ast::MethodDefinitionKind::Get => "get",
                oxc_ast::ast::MethodDefinitionKind::Set => "set",
            };
            obj.insert("kind".to_string(), Value::String(kind.to_string()));

            // key
            let key = convert_property_key_for_expr(&method.key, offset, line_offsets);
            obj.insert("key".to_string(), key);

            // value (function expression)
            let value_start = offset + method.value.span.start as usize - 1;
            let value_end = offset + method.value.span.end as usize - 1;
            let value = create_function_expression(
                &method.value,
                value_start,
                value_end,
                offset,
                line_offsets,
            );
            obj.insert("value".to_string(), value.as_json().clone());

            Some(Value::Object(obj))
        }
        oxc_ast::ast::ClassElement::PropertyDefinition(prop) => {
            let start = offset + prop.span.start as usize - 1;
            let end = offset + prop.span.end as usize - 1;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("PropertyDefinition".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
            obj.insert("static".to_string(), Value::Bool(prop.r#static));
            obj.insert("computed".to_string(), Value::Bool(prop.computed));

            // key
            let key = convert_property_key_for_expr(&prop.key, offset, line_offsets);
            obj.insert("key".to_string(), key);

            // value
            if let Some(ref value) = prop.value {
                let val = convert_expression(value, offset, line_offsets);
                obj.insert("value".to_string(), val.as_json().clone());
            } else {
                obj.insert("value".to_string(), Value::Null);
            }

            Some(Value::Object(obj))
        }
        oxc_ast::ast::ClassElement::StaticBlock(static_block) => {
            let start = offset + static_block.span.start as usize - 1;
            let end = offset + static_block.span.end as usize - 1;
            let mut obj = Map::new();
            obj.insert("type".to_string(), Value::String("StaticBlock".to_string()));
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

            let body_statements: Vec<Value> = static_block
                .body
                .iter()
                .filter_map(|stmt| convert_statement(stmt, offset, line_offsets))
                .collect();
            obj.insert("body".to_string(), Value::Array(body_statements));

            Some(Value::Object(obj))
        }
        _ => None,
    }
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
            create_private_identifier(&id.name, start, end, line_offsets)
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

/// Convert an ObjectAssignmentTarget to ObjectPattern JSON.
/// ObjectAssignmentTarget is `{ foo }` in `({ foo } = obj);`
fn convert_object_assignment_target(
    obj_target: &oxc_ast::ast::ObjectAssignmentTarget,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    // Note: -1 adjustment for the paren we added when parsing
    let start = offset + obj_target.span.start as usize - 1;
    let end = offset + obj_target.span.end as usize - 1;

    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("ObjectPattern".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    let mut properties: Vec<Value> = obj_target
        .properties
        .iter()
        .map(|prop| convert_assignment_target_property(prop, offset, line_offsets))
        .collect();

    // Add rest element if present
    if let Some(rest) = &obj_target.rest {
        let rest_start = offset + rest.span.start as usize - 1;
        let rest_end = offset + rest.span.end as usize - 1;

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
            convert_assignment_target(&rest.target, offset, line_offsets),
        );
        properties.push(Value::Object(rest_obj));
    }

    obj.insert("properties".to_string(), Value::Array(properties));

    Value::Object(obj)
}

/// Convert an ArrayAssignmentTarget to ArrayPattern JSON.
/// ArrayAssignmentTarget is `[a, b]` in `([a, b] = arr);`
fn convert_array_assignment_target(
    arr_target: &oxc_ast::ast::ArrayAssignmentTarget,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    // Note: -1 adjustment for the paren we added when parsing
    let start = offset + arr_target.span.start as usize - 1;
    let end = offset + arr_target.span.end as usize - 1;

    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("ArrayPattern".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    let mut elements: Vec<Value> = arr_target
        .elements
        .iter()
        .map(|elem| match elem {
            Some(target) => convert_assignment_target_maybe_default(target, offset, line_offsets),
            None => Value::Null,
        })
        .collect();

    // Add rest element if present
    if let Some(rest) = &arr_target.rest {
        let rest_start = offset + rest.span.start as usize - 1;
        let rest_end = offset + rest.span.end as usize - 1;

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
            convert_assignment_target(&rest.target, offset, line_offsets),
        );
        elements.push(Value::Object(rest_obj));
    }

    obj.insert("elements".to_string(), Value::Array(elements));

    Value::Object(obj)
}

/// Convert an AssignmentTargetProperty to Property JSON.
fn convert_assignment_target_property(
    prop: &oxc_ast::ast::AssignmentTargetProperty,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    use oxc_ast::ast::AssignmentTargetProperty;

    match prop {
        AssignmentTargetProperty::AssignmentTargetPropertyIdentifier(id_prop) => {
            // Shorthand property like `{ foo }` in `({ foo } = obj);`
            let start = offset + id_prop.span.start as usize - 1;
            let end = offset + id_prop.span.end as usize - 1;

            let mut obj = Map::new();
            obj.insert("type".to_string(), Value::String("Property".to_string()));
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
            obj.insert("method".to_string(), Value::Bool(false));
            obj.insert("shorthand".to_string(), Value::Bool(true));
            obj.insert("computed".to_string(), Value::Bool(false));
            obj.insert("kind".to_string(), Value::String("init".to_string()));

            // For shorthand, key and value are the same identifier
            let id_start = offset + id_prop.binding.span.start as usize - 1;
            let id_end = offset + id_prop.binding.span.end as usize - 1;
            let identifier =
                create_identifier(&id_prop.binding.name, id_start, id_end, line_offsets)
                    .as_json()
                    .clone();

            obj.insert("key".to_string(), identifier.clone());

            // Value is the identifier, possibly with a default value
            if let Some(init) = &id_prop.init {
                // Has default: `{ foo = default }` -> AssignmentPattern
                let mut assign_pat = Map::new();
                assign_pat.insert(
                    "type".to_string(),
                    Value::String("AssignmentPattern".to_string()),
                );
                assign_pat.insert("start".to_string(), Value::Number((id_start as i64).into()));
                let init_end = offset + init.span().end as usize - 1;
                assign_pat.insert("end".to_string(), Value::Number((init_end as i64).into()));
                assign_pat.insert(
                    "loc".to_string(),
                    create_loc(id_start, init_end, line_offsets),
                );
                assign_pat.insert("left".to_string(), identifier);
                assign_pat.insert(
                    "right".to_string(),
                    convert_expression(init, offset, line_offsets)
                        .as_json()
                        .clone(),
                );
                obj.insert("value".to_string(), Value::Object(assign_pat));
            } else {
                obj.insert("value".to_string(), identifier);
            }

            Value::Object(obj)
        }
        AssignmentTargetProperty::AssignmentTargetPropertyProperty(prop_prop) => {
            // Non-shorthand property like `{ foo: bar }` in `({ foo: bar } = obj);`
            let start = offset + prop_prop.span.start as usize - 1;
            let end = offset + prop_prop.span.end as usize - 1;

            let mut obj = Map::new();
            obj.insert("type".to_string(), Value::String("Property".to_string()));
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
            obj.insert("method".to_string(), Value::Bool(false));
            obj.insert("shorthand".to_string(), Value::Bool(false));
            obj.insert("computed".to_string(), Value::Bool(prop_prop.computed));
            obj.insert("kind".to_string(), Value::String("init".to_string()));

            // Convert key
            let key = convert_property_key_with_offset(&prop_prop.name, offset, line_offsets);
            obj.insert("key".to_string(), key);

            // Convert value
            let value =
                convert_assignment_target_maybe_default(&prop_prop.binding, offset, line_offsets);
            obj.insert("value".to_string(), value);

            Value::Object(obj)
        }
    }
}

/// Convert an AssignmentTargetMaybeDefault to JSON.
fn convert_assignment_target_maybe_default(
    target: &oxc_ast::ast::AssignmentTargetMaybeDefault,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    use oxc_ast::ast::AssignmentTargetMaybeDefault;

    match target {
        AssignmentTargetMaybeDefault::AssignmentTargetWithDefault(with_default) => {
            // Has default value: `foo = default`
            let start = offset + with_default.span.start as usize - 1;
            let end = offset + with_default.span.end as usize - 1;

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
                convert_assignment_target(&with_default.binding, offset, line_offsets),
            );
            obj.insert(
                "right".to_string(),
                convert_expression(&with_default.init, offset, line_offsets)
                    .as_json()
                    .clone(),
            );

            Value::Object(obj)
        }
        // All other variants are AssignmentTarget variants
        _ => {
            // Convert to AssignmentTarget - need to extract the inner target
            if let Some(inner) = target.as_assignment_target() {
                convert_assignment_target(inner, offset, line_offsets)
            } else {
                Value::Null
            }
        }
    }
}

/// Convert a PropertyKey with -1 offset adjustment (for expression context).
fn convert_property_key_with_offset(
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
            create_private_identifier(&id.name, start, end, line_offsets)
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
        AssignmentTarget::ObjectAssignmentTarget(obj_target) => {
            convert_object_assignment_target(obj_target, offset, line_offsets)
        }
        AssignmentTarget::ArrayAssignmentTarget(arr_target) => {
            convert_array_assignment_target(arr_target, offset, line_offsets)
        }
        _ => {
            // Fallback for other complex patterns (e.g., TSAsExpression, TSNonNullExpression)
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

    // Convert id (pattern) with type annotation
    let id = convert_binding_pattern_for_decl(
        &decl.id,
        offset,
        line_offsets,
        decl.type_annotation.as_deref(),
    );
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
    type_annotation: Option<&oxc_ast::ast::TSTypeAnnotation>,
) -> Value {
    match pattern {
        oxc_ast::ast::BindingPattern::BindingIdentifier(id) => {
            let start = offset + id.span.start as usize - 1;
            // If there's a type annotation, extend the end to include it
            let end = if let Some(type_ann) = type_annotation {
                offset + type_ann.span.end as usize - 1
            } else {
                offset + id.span.end as usize - 1
            };

            let mut obj = Map::new();
            obj.insert("type".to_string(), Value::String("Identifier".to_string()));
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
            obj.insert("name".to_string(), Value::String(id.name.to_string()));

            // OXC v0.107: type annotations are on VariableDeclarator, not BindingIdentifier
            if let Some(type_ann) = type_annotation {
                let type_ann_value =
                    convert_type_annotation_adjusted(type_ann, offset - 1, line_offsets);
                obj.insert("typeAnnotation".to_string(), type_ann_value);
            }

            Value::Object(obj)
        }
        _ => Value::Null, // Simplified for now
    }
}

/// Convert a type annotation for declarations.
/// Note: offset should be the raw document offset. This function applies -1 adjustment
/// for the inner type because we're in paren-wrapped expression context.
#[allow(dead_code)]
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
#[allow(dead_code)]
fn calculate_line_offsets(content: &str) -> Vec<usize> {
    let mut offsets = vec![0];
    for (i, c) in content.char_indices() {
        if c == '\n' {
            offsets.push(i + 1);
        }
    }
    offsets
}

/// Create loc for script Program node using document coordinates.
/// Svelte uses locator(script_tag_start) for start and locator(script_tag_end) for end.
fn create_loc_for_script(
    script_tag_start: usize,
    script_tag_end: usize,
    doc_line_offsets: &[usize],
) -> Value {
    // Svelte uses document coordinates for Program.loc:
    // - loc.start: locator(script_tag_start) - position of <script>
    // - loc.end: locator(script_tag_end) - position after </script>
    let start_loc = get_line_column(script_tag_start, doc_line_offsets);
    let end_loc = get_line_column(script_tag_end, doc_line_offsets);

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

/// Parse a JavaScript program (script content) and return it as an Expression.
/// This is used for script tags.
/// Set `is_typescript` to true if the script contains TypeScript.
/// `leading_comments` are HTML comments that appeared before the script tag.
/// `script_tag_start` and `script_tag_end` are positions for loc calculation
/// (Svelte uses locator(start) for loc.start and locator(parser.index) for loc.end).
pub fn parse_program(
    content: &str,
    offset: usize,
    line_offsets: &[usize],
    is_typescript: bool,
    leading_comments: &[String],
    script_tag_start: usize,
    script_tag_end: usize,
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

    // For Program loc, Svelte uses document coordinates:
    // - loc.start: locator(script_tag_start) - position of <script>
    // - loc.end: locator(script_tag_end) - position after </script>
    obj.insert(
        "loc".to_string(),
        create_loc_for_script(script_tag_start, script_tag_end, line_offsets),
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
                    oxc_ast::ast::CommentKind::SingleLineBlock
                    | oxc_ast::ast::CommentKind::MultiLineBlock => "Block",
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
                        oxc_ast::ast::CommentKind::SingleLineBlock
                        | oxc_ast::ast::CommentKind::MultiLineBlock => raw
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

            obj.insert("generator".to_string(), Value::Bool(func_decl.generator));
            obj.insert("async".to_string(), Value::Bool(func_decl.r#async));

            // Convert params
            let params: Vec<Value> = func_decl
                .params
                .items
                .iter()
                .map(|param| {
                    convert_formal_parameter(param, offset, line_offsets)
                        .as_json()
                        .clone()
                })
                .collect();
            obj.insert("params".to_string(), Value::Array(params));

            // Convert body
            if let Some(body) = &func_decl.body {
                let body_value = convert_function_body_for_program(body, offset, line_offsets);
                obj.insert("body".to_string(), body_value);
            } else {
                obj.insert("body".to_string(), Value::Null);
            }

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
        oxc_ast::ast::Statement::IfStatement(if_stmt) => {
            let start = offset + if_stmt.span.start as usize;
            let end = offset + if_stmt.span.end as usize;
            let mut obj = Map::new();
            obj.insert("type".to_string(), Value::String("IfStatement".to_string()));
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

            // test
            let test = convert_expression_for_program(&if_stmt.test, offset, line_offsets);
            obj.insert("test".to_string(), test.as_json().clone());

            // consequent
            let consequent =
                convert_statement_for_program(&if_stmt.consequent, offset, line_offsets);
            obj.insert("consequent".to_string(), consequent.unwrap_or(Value::Null));

            // alternate
            if let Some(ref alternate) = if_stmt.alternate {
                let alt = convert_statement_for_program(alternate, offset, line_offsets);
                obj.insert("alternate".to_string(), alt.unwrap_or(Value::Null));
            } else {
                obj.insert("alternate".to_string(), Value::Null);
            }

            Some(Value::Object(obj))
        }
        oxc_ast::ast::Statement::BlockStatement(block_stmt) => {
            let start = offset + block_stmt.span.start as usize;
            let end = offset + block_stmt.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("BlockStatement".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

            // body
            let body: Vec<Value> = block_stmt
                .body
                .iter()
                .filter_map(|stmt| convert_statement_for_program(stmt, offset, line_offsets))
                .collect();
            obj.insert("body".to_string(), Value::Array(body));

            Some(Value::Object(obj))
        }
        oxc_ast::ast::Statement::ClassDeclaration(class_decl) => {
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

            // id
            if let Some(id) = &class_decl.id {
                let id_start = offset + id.span.start as usize;
                let id_end = offset + id.span.end as usize;
                let id_expr = create_identifier(&id.name, id_start, id_end, line_offsets);
                obj.insert("id".to_string(), id_expr.as_json().clone());
            } else {
                obj.insert("id".to_string(), Value::Null);
            }

            // superClass
            if let Some(super_class) = &class_decl.super_class {
                let super_class_value =
                    convert_expression_for_program(super_class, offset, line_offsets);
                obj.insert(
                    "superClass".to_string(),
                    super_class_value.as_json().clone(),
                );
            } else {
                obj.insert("superClass".to_string(), Value::Null);
            }

            // body (ClassBody)
            let body_value = convert_class_body_for_program(&class_decl.body, offset, line_offsets);
            obj.insert("body".to_string(), body_value);

            Some(Value::Object(obj))
        }
        oxc_ast::ast::Statement::ReturnStatement(ret_stmt) => {
            let start = offset + ret_stmt.span.start as usize;
            let end = offset + ret_stmt.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("ReturnStatement".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

            // argument
            if let Some(arg) = &ret_stmt.argument {
                let arg_value = convert_expression_for_program(arg, offset, line_offsets);
                obj.insert("argument".to_string(), arg_value.as_json().clone());
            } else {
                obj.insert("argument".to_string(), Value::Null);
            }

            Some(Value::Object(obj))
        }
        oxc_ast::ast::Statement::ForStatement(for_stmt) => {
            let start = offset + for_stmt.span.start as usize;
            let end = offset + for_stmt.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("ForStatement".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

            // init
            if let Some(init) = &for_stmt.init {
                let init_value = match init {
                    oxc_ast::ast::ForStatementInit::VariableDeclaration(vd) => {
                        convert_variable_declaration_directly(vd, offset, line_offsets)
                    }
                    _ => {
                        if let Some(expr) = init.as_expression() {
                            convert_expression_for_program(expr, offset, line_offsets)
                                .as_json()
                                .clone()
                        } else {
                            Value::Null
                        }
                    }
                };
                obj.insert("init".to_string(), init_value);
            } else {
                obj.insert("init".to_string(), Value::Null);
            }

            // test
            if let Some(test) = &for_stmt.test {
                let test_value = convert_expression_for_program(test, offset, line_offsets);
                obj.insert("test".to_string(), test_value.as_json().clone());
            } else {
                obj.insert("test".to_string(), Value::Null);
            }

            // update
            if let Some(update) = &for_stmt.update {
                let update_value = convert_expression_for_program(update, offset, line_offsets);
                obj.insert("update".to_string(), update_value.as_json().clone());
            } else {
                obj.insert("update".to_string(), Value::Null);
            }

            // body
            if let Some(body_stmt) =
                convert_statement_for_program(&for_stmt.body, offset, line_offsets)
            {
                obj.insert("body".to_string(), body_stmt);
            } else {
                obj.insert("body".to_string(), Value::Null);
            }

            Some(Value::Object(obj))
        }
        oxc_ast::ast::Statement::ForOfStatement(for_of_stmt) => {
            let start = offset + for_of_stmt.span.start as usize;
            let end = offset + for_of_stmt.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("ForOfStatement".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
            obj.insert("await".to_string(), Value::Bool(for_of_stmt.r#await));

            // left
            let left_value = match &for_of_stmt.left {
                oxc_ast::ast::ForStatementLeft::VariableDeclaration(vd) => {
                    convert_variable_declaration_directly(vd, offset, line_offsets)
                }
                _ => Value::Null,
            };
            obj.insert("left".to_string(), left_value);

            // right
            let right_value =
                convert_expression_for_program(&for_of_stmt.right, offset, line_offsets);
            obj.insert("right".to_string(), right_value.as_json().clone());

            // body
            if let Some(body_stmt) =
                convert_statement_for_program(&for_of_stmt.body, offset, line_offsets)
            {
                obj.insert("body".to_string(), body_stmt);
            } else {
                obj.insert("body".to_string(), Value::Null);
            }

            Some(Value::Object(obj))
        }
        oxc_ast::ast::Statement::ForInStatement(for_in_stmt) => {
            let start = offset + for_in_stmt.span.start as usize;
            let end = offset + for_in_stmt.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("ForInStatement".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

            // left
            let left_value = match &for_in_stmt.left {
                oxc_ast::ast::ForStatementLeft::VariableDeclaration(vd) => {
                    convert_variable_declaration_directly(vd, offset, line_offsets)
                }
                _ => Value::Null,
            };
            obj.insert("left".to_string(), left_value);

            // right
            let right_value =
                convert_expression_for_program(&for_in_stmt.right, offset, line_offsets);
            obj.insert("right".to_string(), right_value.as_json().clone());

            // body
            if let Some(body_stmt) =
                convert_statement_for_program(&for_in_stmt.body, offset, line_offsets)
            {
                obj.insert("body".to_string(), body_stmt);
            } else {
                obj.insert("body".to_string(), Value::Null);
            }

            Some(Value::Object(obj))
        }
        oxc_ast::ast::Statement::WhileStatement(while_stmt) => {
            let start = offset + while_stmt.span.start as usize;
            let end = offset + while_stmt.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("WhileStatement".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

            // test
            let test_value = convert_expression_for_program(&while_stmt.test, offset, line_offsets);
            obj.insert("test".to_string(), test_value.as_json().clone());

            // body
            if let Some(body_stmt) =
                convert_statement_for_program(&while_stmt.body, offset, line_offsets)
            {
                obj.insert("body".to_string(), body_stmt);
            } else {
                obj.insert("body".to_string(), Value::Null);
            }

            Some(Value::Object(obj))
        }
        oxc_ast::ast::Statement::TryStatement(try_stmt) => {
            let start = offset + try_stmt.span.start as usize;
            let end = offset + try_stmt.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("TryStatement".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

            // block
            let block_start = offset + try_stmt.block.span.start as usize;
            let block_end = offset + try_stmt.block.span.end as usize;
            let mut block_obj = Map::new();
            block_obj.insert(
                "type".to_string(),
                Value::String("BlockStatement".to_string()),
            );
            block_obj.insert(
                "start".to_string(),
                Value::Number((block_start as i64).into()),
            );
            block_obj.insert("end".to_string(), Value::Number((block_end as i64).into()));
            block_obj.insert(
                "loc".to_string(),
                create_loc(block_start, block_end, line_offsets),
            );
            let body: Vec<Value> = try_stmt
                .block
                .body
                .iter()
                .filter_map(|stmt| convert_statement_for_program(stmt, offset, line_offsets))
                .collect();
            block_obj.insert("body".to_string(), Value::Array(body));
            obj.insert("block".to_string(), Value::Object(block_obj));

            // handler
            if let Some(handler) = &try_stmt.handler {
                let handler_start = offset + handler.span.start as usize;
                let handler_end = offset + handler.span.end as usize;
                let mut handler_obj = Map::new();
                handler_obj.insert("type".to_string(), Value::String("CatchClause".to_string()));
                handler_obj.insert(
                    "start".to_string(),
                    Value::Number((handler_start as i64).into()),
                );
                handler_obj.insert(
                    "end".to_string(),
                    Value::Number((handler_end as i64).into()),
                );
                handler_obj.insert(
                    "loc".to_string(),
                    create_loc(handler_start, handler_end, line_offsets),
                );

                // param
                if let Some(param) = &handler.param {
                    let param_value = convert_binding_pattern(&param.pattern, offset, line_offsets);
                    handler_obj.insert("param".to_string(), param_value);
                } else {
                    handler_obj.insert("param".to_string(), Value::Null);
                }

                // body
                let body_start = offset + handler.body.span.start as usize;
                let body_end = offset + handler.body.span.end as usize;
                let mut body_obj = Map::new();
                body_obj.insert(
                    "type".to_string(),
                    Value::String("BlockStatement".to_string()),
                );
                body_obj.insert(
                    "start".to_string(),
                    Value::Number((body_start as i64).into()),
                );
                body_obj.insert("end".to_string(), Value::Number((body_end as i64).into()));
                body_obj.insert(
                    "loc".to_string(),
                    create_loc(body_start, body_end, line_offsets),
                );
                let body: Vec<Value> = handler
                    .body
                    .body
                    .iter()
                    .filter_map(|stmt| convert_statement_for_program(stmt, offset, line_offsets))
                    .collect();
                body_obj.insert("body".to_string(), Value::Array(body));
                handler_obj.insert("body".to_string(), Value::Object(body_obj));

                obj.insert("handler".to_string(), Value::Object(handler_obj));
            } else {
                obj.insert("handler".to_string(), Value::Null);
            }

            // finalizer
            if let Some(finalizer) = &try_stmt.finalizer {
                let finalizer_start = offset + finalizer.span.start as usize;
                let finalizer_end = offset + finalizer.span.end as usize;
                let mut finalizer_obj = Map::new();
                finalizer_obj.insert(
                    "type".to_string(),
                    Value::String("BlockStatement".to_string()),
                );
                finalizer_obj.insert(
                    "start".to_string(),
                    Value::Number((finalizer_start as i64).into()),
                );
                finalizer_obj.insert(
                    "end".to_string(),
                    Value::Number((finalizer_end as i64).into()),
                );
                finalizer_obj.insert(
                    "loc".to_string(),
                    create_loc(finalizer_start, finalizer_end, line_offsets),
                );
                let body: Vec<Value> = finalizer
                    .body
                    .iter()
                    .filter_map(|stmt| convert_statement_for_program(stmt, offset, line_offsets))
                    .collect();
                finalizer_obj.insert("body".to_string(), Value::Array(body));
                obj.insert("finalizer".to_string(), Value::Object(finalizer_obj));
            } else {
                obj.insert("finalizer".to_string(), Value::Null);
            }

            Some(Value::Object(obj))
        }
        oxc_ast::ast::Statement::ThrowStatement(throw_stmt) => {
            let start = offset + throw_stmt.span.start as usize;
            let end = offset + throw_stmt.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("ThrowStatement".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

            let argument_value =
                convert_expression_for_program(&throw_stmt.argument, offset, line_offsets);
            obj.insert("argument".to_string(), argument_value.as_json().clone());

            Some(Value::Object(obj))
        }
        oxc_ast::ast::Statement::BreakStatement(break_stmt) => {
            let start = offset + break_stmt.span.start as usize;
            let end = offset + break_stmt.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("BreakStatement".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

            if let Some(label) = &break_stmt.label {
                let label_start = offset + label.span.start as usize;
                let label_end = offset + label.span.end as usize;
                let label_expr =
                    create_identifier(&label.name, label_start, label_end, line_offsets);
                obj.insert("label".to_string(), label_expr.as_json().clone());
            } else {
                obj.insert("label".to_string(), Value::Null);
            }

            Some(Value::Object(obj))
        }
        oxc_ast::ast::Statement::ContinueStatement(continue_stmt) => {
            let start = offset + continue_stmt.span.start as usize;
            let end = offset + continue_stmt.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("ContinueStatement".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

            if let Some(label) = &continue_stmt.label {
                let label_start = offset + label.span.start as usize;
                let label_end = offset + label.span.end as usize;
                let label_expr =
                    create_identifier(&label.name, label_start, label_end, line_offsets);
                obj.insert("label".to_string(), label_expr.as_json().clone());
            } else {
                obj.insert("label".to_string(), Value::Null);
            }

            Some(Value::Object(obj))
        }
        oxc_ast::ast::Statement::SwitchStatement(switch_stmt) => {
            let start = offset + switch_stmt.span.start as usize;
            let end = offset + switch_stmt.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("SwitchStatement".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

            // Convert discriminant
            let discriminant_value =
                convert_expression(&switch_stmt.discriminant, offset, line_offsets);
            obj.insert(
                "discriminant".to_string(),
                discriminant_value.as_json().clone(),
            );

            // Convert cases
            let cases: Vec<Value> = switch_stmt
                .cases
                .iter()
                .map(|case| {
                    let case_start = offset + case.span.start as usize;
                    let case_end = offset + case.span.end as usize;
                    let mut case_obj = Map::new();
                    case_obj.insert("type".to_string(), Value::String("SwitchCase".to_string()));
                    case_obj.insert(
                        "start".to_string(),
                        Value::Number((case_start as i64).into()),
                    );
                    case_obj.insert("end".to_string(), Value::Number((case_end as i64).into()));
                    case_obj.insert(
                        "loc".to_string(),
                        create_loc(case_start, case_end, line_offsets),
                    );

                    // test is null for default case
                    if let Some(test) = &case.test {
                        let test_value = convert_expression(test, offset, line_offsets);
                        case_obj.insert("test".to_string(), test_value.as_json().clone());
                    } else {
                        case_obj.insert("test".to_string(), Value::Null);
                    }

                    // Convert consequent statements
                    let consequent: Vec<Value> = case
                        .consequent
                        .iter()
                        .filter_map(|stmt| {
                            convert_statement_for_program(stmt, offset, line_offsets)
                        })
                        .collect();
                    case_obj.insert("consequent".to_string(), Value::Array(consequent));

                    Value::Object(case_obj)
                })
                .collect();
            obj.insert("cases".to_string(), Value::Array(cases));

            Some(Value::Object(obj))
        }
        oxc_ast::ast::Statement::DoWhileStatement(do_while_stmt) => {
            let start = offset + do_while_stmt.span.start as usize;
            let end = offset + do_while_stmt.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("DoWhileStatement".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

            // Convert test
            let test_value = convert_expression(&do_while_stmt.test, offset, line_offsets);
            obj.insert("test".to_string(), test_value.as_json().clone());

            // Convert body
            if let Some(body_value) =
                convert_statement_for_program(&do_while_stmt.body, offset, line_offsets)
            {
                obj.insert("body".to_string(), body_value);
            }

            Some(Value::Object(obj))
        }
        oxc_ast::ast::Statement::LabeledStatement(labeled_stmt) => {
            let start = offset + labeled_stmt.span.start as usize;
            let end = offset + labeled_stmt.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("LabeledStatement".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

            // Convert label
            let label_start = offset + labeled_stmt.label.span.start as usize;
            let label_end = offset + labeled_stmt.label.span.end as usize;
            let label_expr = create_identifier(
                &labeled_stmt.label.name,
                label_start,
                label_end,
                line_offsets,
            );
            obj.insert("label".to_string(), label_expr.as_json().clone());

            // Convert body
            if let Some(body_value) =
                convert_statement_for_program(&labeled_stmt.body, offset, line_offsets)
            {
                obj.insert("body".to_string(), body_value);
            }

            Some(Value::Object(obj))
        }
        oxc_ast::ast::Statement::EmptyStatement(empty_stmt) => {
            let start = offset + empty_stmt.span.start as usize;
            let end = offset + empty_stmt.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("EmptyStatement".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

            Some(Value::Object(obj))
        }
        oxc_ast::ast::Statement::DebuggerStatement(debugger_stmt) => {
            let start = offset + debugger_stmt.span.start as usize;
            let end = offset + debugger_stmt.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("DebuggerStatement".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

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

            obj.insert("generator".to_string(), Value::Bool(func_decl.generator));
            obj.insert("async".to_string(), Value::Bool(func_decl.r#async));

            // Convert params
            let params: Vec<Value> = func_decl
                .params
                .items
                .iter()
                .map(|param| {
                    convert_formal_parameter(param, offset, line_offsets)
                        .as_json()
                        .clone()
                })
                .collect();
            obj.insert("params".to_string(), Value::Array(params));

            // Convert body
            if let Some(body) = &func_decl.body {
                let body_value = convert_function_body_for_program(body, offset, line_offsets);
                obj.insert("body".to_string(), body_value);
            } else {
                obj.insert("body".to_string(), Value::Null);
            }

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

/// Helper function to convert a VariableDeclaration directly from OXC type.
/// Used by ForStatement, ForOfStatement, ForInStatement.
fn convert_variable_declaration_directly(
    vd: &oxc_ast::ast::VariableDeclaration,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    let var_start = offset + vd.span.start as usize;
    let var_end = offset + vd.span.end as usize;
    let mut var_obj = Map::new();
    var_obj.insert(
        "type".to_string(),
        Value::String("VariableDeclaration".to_string()),
    );
    var_obj.insert(
        "start".to_string(),
        Value::Number((var_start as i64).into()),
    );
    var_obj.insert("end".to_string(), Value::Number((var_end as i64).into()));
    var_obj.insert(
        "loc".to_string(),
        create_loc(var_start, var_end, line_offsets),
    );
    let kind = match vd.kind {
        oxc_ast::ast::VariableDeclarationKind::Var => "var",
        oxc_ast::ast::VariableDeclarationKind::Let => "let",
        oxc_ast::ast::VariableDeclarationKind::Const => "const",
        oxc_ast::ast::VariableDeclarationKind::Using => "using",
        oxc_ast::ast::VariableDeclarationKind::AwaitUsing => "using",
    };
    var_obj.insert("kind".to_string(), Value::String(kind.to_string()));
    let declarations: Vec<Value> = vd
        .declarations
        .iter()
        .filter_map(|d| convert_variable_declarator_for_program(d, offset, line_offsets))
        .collect();
    var_obj.insert("declarations".to_string(), Value::Array(declarations));
    Value::Object(var_obj)
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
    let mut id_value = convert_binding_pattern(&decl.id, offset, line_offsets);

    // Add TypeScript type annotation if present on the declarator
    if let Some(type_annotation) = &decl.type_annotation
        && let Value::Object(ref mut id_obj) = id_value
    {
        let ts_start = type_annotation.span.start as usize + offset;
        let ts_end = type_annotation.span.end as usize + offset;

        // Create TSTypeAnnotation object
        let mut ts_obj = Map::new();
        ts_obj.insert(
            "type".to_string(),
            Value::String("TSTypeAnnotation".to_string()),
        );
        ts_obj.insert("start".to_string(), Value::Number((ts_start as i64).into()));
        ts_obj.insert("end".to_string(), Value::Number((ts_end as i64).into()));
        ts_obj.insert(
            "loc".to_string(),
            create_loc(ts_start, ts_end, line_offsets),
        );

        // Convert the actual TypeScript type
        let type_value = convert_ts_type(&type_annotation.type_annotation, offset, line_offsets);
        ts_obj.insert("typeAnnotation".to_string(), type_value);

        id_obj.insert("typeAnnotation".to_string(), Value::Object(ts_obj));

        // Update end position to include type annotation
        id_obj.insert("end".to_string(), Value::Number((ts_end as i64).into()));
        id_obj.insert(
            "loc".to_string(),
            create_loc(
                id_obj.get("start").and_then(|v| v.as_i64()).unwrap_or(0) as usize,
                ts_end,
                line_offsets,
            ),
        );
    }

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
        OxcExpression::ObjectExpression(obj_expr) => {
            let start = offset + obj_expr.span.start as usize;
            let end = offset + obj_expr.span.end as usize;
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
                        let prop_start = offset + p.span.start as usize;
                        let prop_end = offset + p.span.end as usize;

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
                        let key = convert_property_key(&p.key, offset, line_offsets);
                        prop_obj.insert("key".to_string(), key);

                        // Convert value
                        let value = convert_expression_for_program(&p.value, offset, line_offsets);
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
                        let spread_start = offset + spread.span.start as usize;
                        let spread_end = offset + spread.span.end as usize;

                        let mut spread_obj = Map::new();
                        spread_obj.insert(
                            "type".to_string(),
                            Value::String("SpreadElement".to_string()),
                        );
                        spread_obj.insert(
                            "start".to_string(),
                            Value::Number((spread_start as i64).into()),
                        );
                        spread_obj
                            .insert("end".to_string(), Value::Number((spread_end as i64).into()));
                        spread_obj.insert(
                            "loc".to_string(),
                            create_loc(spread_start, spread_end, line_offsets),
                        );

                        let argument =
                            convert_expression_for_program(&spread.argument, offset, line_offsets);
                        spread_obj.insert("argument".to_string(), argument.as_json().clone());

                        Value::Object(spread_obj)
                    }
                })
                .collect();
            obj.insert("properties".to_string(), Value::Array(properties));

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
        OxcExpression::FunctionExpression(func) => Expression::Value(
            convert_function_expression_for_program(func, offset, line_offsets),
        ),
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
        OxcExpression::AssignmentExpression(assign) => {
            let start = offset + assign.span.start as usize;
            let end = offset + assign.span.end as usize;

            // Convert left (target)
            let left = convert_assignment_target_for_program(&assign.left, offset, line_offsets);

            // Convert right (value)
            let right = convert_expression_for_program(&assign.right, offset, line_offsets);

            // Get operator string
            let operator = assignment_operator_to_string(&assign.operator);

            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("AssignmentExpression".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
            obj.insert("operator".to_string(), Value::String(operator));
            obj.insert("left".to_string(), left);
            obj.insert("right".to_string(), right.as_json().clone());

            Expression::Value(Value::Object(obj))
        }
        OxcExpression::UnaryExpression(unary) => {
            let start = offset + unary.span.start as usize;
            let end = offset + unary.span.end as usize;
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
                Value::String(unary.operator.as_str().to_string()),
            );
            obj.insert("prefix".to_string(), Value::Bool(true));
            let argument = convert_expression_for_program(&unary.argument, offset, line_offsets);
            obj.insert("argument".to_string(), argument.as_json().clone());
            Expression::Value(Value::Object(obj))
        }
        OxcExpression::NewExpression(new_expr) => {
            let start = offset + new_expr.span.start as usize;
            let end = offset + new_expr.span.end as usize;
            let callee = convert_expression_for_program(&new_expr.callee, offset, line_offsets);
            let args: Vec<Value> = new_expr
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
                Value::String("NewExpression".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
            obj.insert("callee".to_string(), callee.as_json().clone());
            obj.insert("arguments".to_string(), Value::Array(args));
            Expression::Value(Value::Object(obj))
        }
        OxcExpression::ClassExpression(class_expr) => {
            let start = offset + class_expr.span.start as usize;
            let end = offset + class_expr.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("ClassExpression".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

            // id
            if let Some(ref id) = class_expr.id {
                let id_start = offset + id.span.start as usize;
                let id_end = offset + id.span.end as usize;
                obj.insert(
                    "id".to_string(),
                    create_identifier(&id.name, id_start, id_end, line_offsets)
                        .as_json()
                        .clone(),
                );
            } else {
                obj.insert("id".to_string(), Value::Null);
            }

            // superClass
            if let Some(ref super_class) = class_expr.super_class {
                let super_expr = convert_expression_for_program(super_class, offset, line_offsets);
                obj.insert("superClass".to_string(), super_expr.as_json().clone());
            } else {
                obj.insert("superClass".to_string(), Value::Null);
            }

            // body
            let body = convert_class_body_for_program(&class_expr.body, offset, line_offsets);
            obj.insert("body".to_string(), body);

            Expression::Value(Value::Object(obj))
        }
        OxcExpression::Super(super_expr) => {
            let start = offset + super_expr.span.start as usize;
            let end = offset + super_expr.span.end as usize;
            let mut obj = Map::new();
            obj.insert("type".to_string(), Value::String("Super".to_string()));
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
            Expression::Value(Value::Object(obj))
        }
        OxcExpression::ThisExpression(this_expr) => {
            let start = offset + this_expr.span.start as usize;
            let end = offset + this_expr.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("ThisExpression".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
            Expression::Value(Value::Object(obj))
        }
        OxcExpression::TemplateLiteral(template) => {
            let start = offset + template.span.start as usize;
            let end = offset + template.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("TemplateLiteral".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

            // quasis
            let quasis: Vec<Value> = template
                .quasis
                .iter()
                .map(|quasi| {
                    let q_start = offset + quasi.span.start as usize;
                    let q_end = offset + quasi.span.end as usize;
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

            // expressions
            let expressions: Vec<Value> = template
                .expressions
                .iter()
                .map(|expr| {
                    convert_expression_for_program(expr, offset, line_offsets)
                        .as_json()
                        .clone()
                })
                .collect();
            obj.insert("expressions".to_string(), Value::Array(expressions));

            Expression::Value(Value::Object(obj))
        }
        OxcExpression::BinaryExpression(bin) => {
            let start = offset + bin.span.start as usize;
            let end = offset + bin.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("BinaryExpression".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

            let left = convert_expression_for_program(&bin.left, offset, line_offsets);
            let right = convert_expression_for_program(&bin.right, offset, line_offsets);

            obj.insert("left".to_string(), left.as_json().clone());
            obj.insert(
                "operator".to_string(),
                Value::String(binary_operator_to_string(&bin.operator)),
            );
            obj.insert("right".to_string(), right.as_json().clone());

            Expression::Value(Value::Object(obj))
        }
        OxcExpression::LogicalExpression(logical) => {
            let start = offset + logical.span.start as usize;
            let end = offset + logical.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("LogicalExpression".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

            let left = convert_expression_for_program(&logical.left, offset, line_offsets);
            let right = convert_expression_for_program(&logical.right, offset, line_offsets);

            obj.insert("left".to_string(), left.as_json().clone());
            obj.insert(
                "operator".to_string(),
                Value::String(logical_operator_to_string(&logical.operator)),
            );
            obj.insert("right".to_string(), right.as_json().clone());

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

/// Convert a class body to JSON value (for program context).
fn convert_class_body_for_program(
    body: &oxc_ast::ast::ClassBody,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    let start = offset + body.span.start as usize;
    let end = offset + body.span.end as usize;

    let mut obj = Map::new();
    obj.insert("type".to_string(), Value::String("ClassBody".to_string()));
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    let body_elements: Vec<Value> = body
        .body
        .iter()
        .filter_map(|element| convert_class_element_for_program(element, offset, line_offsets))
        .collect();
    obj.insert("body".to_string(), Value::Array(body_elements));

    Value::Object(obj)
}

/// Convert a class element to JSON value (for program context).
fn convert_class_element_for_program(
    element: &oxc_ast::ast::ClassElement,
    offset: usize,
    line_offsets: &[usize],
) -> Option<Value> {
    match element {
        oxc_ast::ast::ClassElement::MethodDefinition(method) => {
            let start = offset + method.span.start as usize;
            let end = offset + method.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("MethodDefinition".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
            obj.insert("static".to_string(), Value::Bool(method.r#static));
            obj.insert("computed".to_string(), Value::Bool(method.computed));

            // kind
            let kind = match method.kind {
                oxc_ast::ast::MethodDefinitionKind::Constructor => "constructor",
                oxc_ast::ast::MethodDefinitionKind::Method => "method",
                oxc_ast::ast::MethodDefinitionKind::Get => "get",
                oxc_ast::ast::MethodDefinitionKind::Set => "set",
            };
            obj.insert("kind".to_string(), Value::String(kind.to_string()));

            // key
            let key = convert_property_key(&method.key, offset, line_offsets);
            obj.insert("key".to_string(), key);

            // value (function expression)
            let value =
                convert_function_expression_for_program(&method.value, offset, line_offsets);
            obj.insert("value".to_string(), value);

            Some(Value::Object(obj))
        }
        oxc_ast::ast::ClassElement::PropertyDefinition(prop) => {
            let start = offset + prop.span.start as usize;
            let end = offset + prop.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("PropertyDefinition".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
            obj.insert("static".to_string(), Value::Bool(prop.r#static));
            obj.insert("computed".to_string(), Value::Bool(prop.computed));

            // key
            let key = convert_property_key(&prop.key, offset, line_offsets);
            obj.insert("key".to_string(), key);

            // value
            if let Some(ref value) = prop.value {
                let val = convert_expression_for_program(value, offset, line_offsets);
                obj.insert("value".to_string(), val.as_json().clone());
            } else {
                obj.insert("value".to_string(), Value::Null);
            }

            Some(Value::Object(obj))
        }
        _ => None,
    }
}

/// Convert a function expression to JSON value (for program context).
fn convert_function_expression_for_program(
    func: &oxc_ast::ast::Function,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    let start = offset + func.span.start as usize;
    let end = offset + func.span.end as usize;
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("FunctionExpression".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
    obj.insert("id".to_string(), Value::Null);
    obj.insert("generator".to_string(), Value::Bool(func.generator));
    obj.insert("async".to_string(), Value::Bool(func.r#async));

    // params
    let params: Vec<Value> = func
        .params
        .items
        .iter()
        .map(|param| {
            convert_formal_parameter(param, offset, line_offsets)
                .as_json()
                .clone()
        })
        .collect();
    obj.insert("params".to_string(), Value::Array(params));

    // body
    if let Some(ref body) = func.body {
        let body_value = convert_function_body_for_program(body, offset, line_offsets);
        obj.insert("body".to_string(), body_value);
    } else {
        obj.insert("body".to_string(), Value::Null);
    }

    Value::Object(obj)
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
    match pattern {
        oxc_ast::ast::BindingPattern::BindingIdentifier(id) => {
            let start = offset + id.span.start as usize;
            let end = offset + id.span.end as usize;

            // TODO: TypeScript type annotations need to be supported
            // OXC v0.107 - type annotations are available but structure needs investigation
            let expr = create_identifier(&id.name, start, end, line_offsets);
            expr.as_json().clone()
        }
        oxc_ast::ast::BindingPattern::ObjectPattern(obj_pat) => {
            convert_object_pattern(obj_pat, offset, line_offsets)
        }
        oxc_ast::ast::BindingPattern::ArrayPattern(arr_pat) => {
            convert_array_pattern(arr_pat, offset, line_offsets)
        }
        oxc_ast::ast::BindingPattern::AssignmentPattern(assign_pat) => {
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

/// Convert an assignment target for program context (no -1 offset adjustment).
fn convert_assignment_target_for_program(
    target: &oxc_ast::ast::AssignmentTarget,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    use oxc_ast::ast::AssignmentTarget;

    match target {
        AssignmentTarget::AssignmentTargetIdentifier(id) => {
            let start = offset + id.span.start as usize;
            let end = offset + id.span.end as usize;
            create_identifier(&id.name, start, end, line_offsets)
                .as_json()
                .clone()
        }
        AssignmentTarget::StaticMemberExpression(member) => {
            let start = offset + member.span.start as usize;
            let end = offset + member.span.end as usize;

            let object = convert_expression_for_program(&member.object, offset, line_offsets);
            let property = create_identifier(
                &member.property.name,
                offset + member.property.span.start as usize,
                offset + member.property.span.end as usize,
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

            Value::Object(obj)
        }
        AssignmentTarget::ComputedMemberExpression(member) => {
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

            Value::Object(obj)
        }
        AssignmentTarget::ObjectAssignmentTarget(obj_target) => {
            convert_object_assignment_target_for_program(obj_target, offset, line_offsets)
        }
        AssignmentTarget::ArrayAssignmentTarget(arr_target) => {
            convert_array_assignment_target_for_program(arr_target, offset, line_offsets)
        }
        _ => {
            // For other complex patterns (e.g., TSAsExpression, TSNonNullExpression)
            Value::Null
        }
    }
}

/// Convert an ObjectAssignmentTarget to ObjectPattern JSON (no -1 offset adjustment).
fn convert_object_assignment_target_for_program(
    obj_target: &oxc_ast::ast::ObjectAssignmentTarget,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    let start = offset + obj_target.span.start as usize;
    let end = offset + obj_target.span.end as usize;

    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("ObjectPattern".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    let mut properties: Vec<Value> = obj_target
        .properties
        .iter()
        .map(|prop| convert_assignment_target_property_for_program(prop, offset, line_offsets))
        .collect();

    // Add rest element if present
    if let Some(rest) = &obj_target.rest {
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
            convert_assignment_target_for_program(&rest.target, offset, line_offsets),
        );
        properties.push(Value::Object(rest_obj));
    }

    obj.insert("properties".to_string(), Value::Array(properties));

    Value::Object(obj)
}

/// Convert an ArrayAssignmentTarget to ArrayPattern JSON (no -1 offset adjustment).
fn convert_array_assignment_target_for_program(
    arr_target: &oxc_ast::ast::ArrayAssignmentTarget,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    let start = offset + arr_target.span.start as usize;
    let end = offset + arr_target.span.end as usize;

    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("ArrayPattern".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    obj.insert("loc".to_string(), create_loc(start, end, line_offsets));

    let mut elements: Vec<Value> = arr_target
        .elements
        .iter()
        .map(|elem| match elem {
            Some(target) => {
                convert_assignment_target_maybe_default_for_program(target, offset, line_offsets)
            }
            None => Value::Null,
        })
        .collect();

    // Add rest element if present
    if let Some(rest) = &arr_target.rest {
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
            convert_assignment_target_for_program(&rest.target, offset, line_offsets),
        );
        elements.push(Value::Object(rest_obj));
    }

    obj.insert("elements".to_string(), Value::Array(elements));

    Value::Object(obj)
}

/// Convert an AssignmentTargetProperty to Property JSON (no -1 offset adjustment).
fn convert_assignment_target_property_for_program(
    prop: &oxc_ast::ast::AssignmentTargetProperty,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    use oxc_ast::ast::AssignmentTargetProperty;

    match prop {
        AssignmentTargetProperty::AssignmentTargetPropertyIdentifier(id_prop) => {
            let start = offset + id_prop.span.start as usize;
            let end = offset + id_prop.span.end as usize;

            let mut obj = Map::new();
            obj.insert("type".to_string(), Value::String("Property".to_string()));
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
            obj.insert("method".to_string(), Value::Bool(false));
            obj.insert("shorthand".to_string(), Value::Bool(true));
            obj.insert("computed".to_string(), Value::Bool(false));
            obj.insert("kind".to_string(), Value::String("init".to_string()));

            let id_start = offset + id_prop.binding.span.start as usize;
            let id_end = offset + id_prop.binding.span.end as usize;
            let identifier =
                create_identifier(&id_prop.binding.name, id_start, id_end, line_offsets)
                    .as_json()
                    .clone();

            obj.insert("key".to_string(), identifier.clone());

            if let Some(init) = &id_prop.init {
                let mut assign_pat = Map::new();
                assign_pat.insert(
                    "type".to_string(),
                    Value::String("AssignmentPattern".to_string()),
                );
                assign_pat.insert("start".to_string(), Value::Number((id_start as i64).into()));
                let init_end = offset + init.span().end as usize;
                assign_pat.insert("end".to_string(), Value::Number((init_end as i64).into()));
                assign_pat.insert(
                    "loc".to_string(),
                    create_loc(id_start, init_end, line_offsets),
                );
                assign_pat.insert("left".to_string(), identifier);
                assign_pat.insert(
                    "right".to_string(),
                    convert_expression_for_program(init, offset, line_offsets)
                        .as_json()
                        .clone(),
                );
                obj.insert("value".to_string(), Value::Object(assign_pat));
            } else {
                obj.insert("value".to_string(), identifier);
            }

            Value::Object(obj)
        }
        AssignmentTargetProperty::AssignmentTargetPropertyProperty(prop_prop) => {
            let start = offset + prop_prop.span.start as usize;
            let end = offset + prop_prop.span.end as usize;

            let mut obj = Map::new();
            obj.insert("type".to_string(), Value::String("Property".to_string()));
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
            obj.insert("method".to_string(), Value::Bool(false));
            obj.insert("shorthand".to_string(), Value::Bool(false));
            obj.insert("computed".to_string(), Value::Bool(prop_prop.computed));
            obj.insert("kind".to_string(), Value::String("init".to_string()));

            let key = convert_property_key(&prop_prop.name, offset, line_offsets);
            obj.insert("key".to_string(), key);

            let value = convert_assignment_target_maybe_default_for_program(
                &prop_prop.binding,
                offset,
                line_offsets,
            );
            obj.insert("value".to_string(), value);

            Value::Object(obj)
        }
    }
}

/// Convert an AssignmentTargetMaybeDefault to JSON (no -1 offset adjustment).
fn convert_assignment_target_maybe_default_for_program(
    target: &oxc_ast::ast::AssignmentTargetMaybeDefault,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    use oxc_ast::ast::AssignmentTargetMaybeDefault;

    match target {
        AssignmentTargetMaybeDefault::AssignmentTargetWithDefault(with_default) => {
            let start = offset + with_default.span.start as usize;
            let end = offset + with_default.span.end as usize;

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
                convert_assignment_target_for_program(&with_default.binding, offset, line_offsets),
            );
            obj.insert(
                "right".to_string(),
                convert_expression_for_program(&with_default.init, offset, line_offsets)
                    .as_json()
                    .clone(),
            );

            Value::Object(obj)
        }
        _ => {
            if let Some(inner) = target.as_assignment_target() {
                convert_assignment_target_for_program(inner, offset, line_offsets)
            } else {
                Value::Null
            }
        }
    }
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
            create_private_identifier(&id.name, start, end, line_offsets)
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

    if result.errors.is_empty()
        && let Some(oxc_ast::ast::Statement::VariableDeclaration(var_decl)) =
            result.program.body.first()
        && let Some(decl) = var_decl.declarations.first()
    {
        // The pattern in wrapped string starts at position 4 (after "let ")
        // We need to map positions: wrapped_pos - 4 + offset = document_pos
        // So we pass offset - 4 to make the formula work: (offset - 4) + span.start = offset + (span.start - 4)

        // For top-level simple identifier, use special format with character field
        // and name before loc
        if let oxc_ast::ast::BindingPattern::BindingIdentifier(id) = &decl.id {
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

    // Fallback: return as simple identifier
    // Strip type annotation if present (e.g., "letter: string" -> "letter")
    let trimmed = content.trim();
    let name = if let Some(colon_pos) = trimmed.find(':') {
        // Only strip if it looks like a simple identifier with type annotation
        // (not a destructuring pattern with default values)
        if !trimmed.starts_with('{') && !trimmed.starts_with('[') {
            trimmed[..colon_pos].trim()
        } else {
            trimmed
        }
    } else {
        trimmed
    };
    create_identifier(name, offset, offset + name.len(), line_offsets)
}

/// Convert a binding pattern with position adjustment.
/// The adjustment is needed when parsing patterns from wrapped expressions.
fn convert_binding_pattern_with_adjustment(
    pattern: &oxc_ast::ast::BindingPattern,
    doc_offset: usize,
    prefix_len: usize,
    line_offsets: &[usize],
) -> Value {
    match pattern {
        oxc_ast::ast::BindingPattern::BindingIdentifier(id) => {
            // Position in document = doc_offset + (span_pos - prefix_len)
            let start = doc_offset + id.span.start as usize - prefix_len;
            let end = doc_offset + id.span.end as usize - prefix_len;
            create_identifier_for_binding(&id.name, start, end, line_offsets)
        }
        oxc_ast::ast::BindingPattern::ObjectPattern(obj_pat) => {
            convert_object_pattern_with_adjustment(obj_pat, doc_offset, prefix_len, line_offsets)
        }
        oxc_ast::ast::BindingPattern::ArrayPattern(arr_pat) => {
            convert_array_pattern_with_adjustment(arr_pat, doc_offset, prefix_len, line_offsets)
        }
        oxc_ast::ast::BindingPattern::AssignmentPattern(assign_pat) => {
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
            create_private_identifier_for_binding(&id.name, start, end, line_offsets)
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_destructuring_assignment() {
        let content = "{ handler } = structured";
        let offset = 10; // arbitrary offset
        let line_offsets = vec![0, 50, 100]; // dummy line offsets

        let expr = parse_expression_with_typescript(content, offset, &line_offsets, false);

        println!("Expression: {:?}", expr);

        if let Some(e) = &expr {
            println!("Type: {:?}", e.node_type());
            println!("Start: {:?}", e.start());
            println!("End: {:?}", e.end());
        }

        assert!(
            expr.is_some(),
            "Should successfully parse destructuring assignment"
        );
        let e = expr.unwrap();
        assert_eq!(
            e.node_type(),
            Some("AssignmentExpression"),
            "Should be AssignmentExpression"
        );
    }
}
