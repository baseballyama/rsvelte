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

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::Expression as OxcExpression;
use oxc_parser::Parser as OxcParser;
use oxc_span::{GetSpan, SourceType};
use serde_json::{Map, Value};

use crate::ast::js::Expression;
use crate::ast::typed_expr::{
    JsNode, LiteralValue, Loc, RegexValue, SourcePosition, TemplateElementValue,
};
use crate::compiler::phases::phase1_parse::utils::find_matching_bracket;
use compact_str::CompactString;

// Thread-local OXC allocator reused across all expression parses to avoid
// repeated allocator creation/destruction overhead. The allocator is reset
// before each use, which clears all allocations while keeping the underlying
// memory chunks for reuse.
thread_local! {
    static OXC_ALLOCATOR: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// Execute a closure with a freshly-reset thread-local OXC allocator.
/// The allocator is reset before the closure runs, ensuring no stale data.
fn with_oxc_allocator<F, R>(f: F) -> R
where
    F: FnOnce(&Allocator) -> R,
{
    OXC_ALLOCATOR.with(|cell| {
        let mut alloc = cell.borrow_mut();
        alloc.reset();
        f(&alloc)
    })
}

/// Extract a JsNode from an Expression, avoiding clone/conversion overhead.
/// For Typed variant: returns the inner JsNode directly (zero cost).
/// For Value variant: wraps the Value in JsNode::Raw (no clone).
#[inline]
fn expr_to_node(expr: Expression) -> JsNode {
    match expr {
        Expression::Typed(te) => te.node,
        Expression::Value(v) => JsNode::Raw(v),
    }
}

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
) -> JsNode {
    let comment_type = match kind {
        oxc_ast::ast::CommentKind::Line => "Line",
        oxc_ast::ast::CommentKind::SingleLineBlock | oxc_ast::ast::CommentKind::MultiLineBlock => {
            "Block"
        }
    };

    JsNode::Comment {
        start: start as u32,
        end: end as u32,
        comment_type: CompactString::from(comment_type),
        value: CompactString::from(value),
    }
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
        // Note: loc field is NOT added here. It should be added by the caller
        // for shorthand attributes (e.g., <div {}>), but not for regular attributes
        // (e.g., <div foo={}>).
        return Some(Expression::from_node(JsNode::Identifier {
            start: start as u32,
            end: end as u32,
            loc: None,
            name: CompactString::from(""),
        }));
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
/// Returns an error message if parsing fails and loose mode is disabled.
pub fn parse_expression(
    content: &str,
    offset: usize,
    line_offsets: &[usize],
    template: &str,
    loose: bool,
    disallow_loose: bool,
    opening_token: char,
) -> Result<Expression, (String, usize)> {
    // Try TypeScript first, then fall back to JavaScript
    let result = parse_expression_with_typescript(content, offset, line_offsets, true)
        .or_else(|| parse_expression_with_typescript(content, offset, line_offsets, false));

    if let Some(expr) = result {
        return Ok(expr);
    }

    // If parsing failed and we're in loose mode (and not disallowed), try loose identifier
    if loose
        && !disallow_loose
        && let Some(loose_expr) =
            get_loose_identifier(template, offset, opening_token, line_offsets)
    {
        return Ok(loose_expr);
    }

    // Check for parse errors and return them when not in loose mode
    if (!loose || disallow_loose)
        && let Some(error_msg) = check_js_parse_error(content)
    {
        return Err((error_msg, offset));
    }

    // Fall back to invalid identifier
    Ok(create_invalid_identifier(
        offset,
        offset + content.len(),
        line_offsets,
    ))
}

/// Parse a destructuring pattern (for `{@const}` tags).
///
/// Destructuring patterns like `{x = 1, y}` or `[a, b, ...rest]` cannot be parsed
/// as standalone expressions because `{x = 1}` is not valid in expression context.
/// Instead, we wrap them as `let <pattern> = null` and extract the binding pattern
/// from the resulting variable declaration.
///
/// This correctly handles:
/// - Default values: `{x = 1, y}`
/// - Computed keys: `{[\`key${expr}\`]: val}`
/// - Nested patterns: `{a: {b, c}}`
/// - Array patterns: `[a, b, ...rest]`
/// - Rest elements: `{a, ...rest}`
pub fn parse_destructuring_pattern(
    content: &str,
    offset: usize,
    line_offsets: &[usize],
) -> Option<Expression> {
    // Try TypeScript first, then JavaScript
    for use_typescript in [true, false] {
        let result = with_oxc_allocator(|allocator| {
            let source_type = if use_typescript {
                SourceType::ts()
            } else {
                SourceType::mjs()
            };

            let mut wrapped = String::with_capacity(content.len() + 12);
            wrapped.push_str("let ");
            wrapped.push_str(content);
            wrapped.push_str(" = null");
            let parser = OxcParser::new(allocator, &wrapped, source_type);
            let result = parser.parse();

            if !result.errors.is_empty() {
                return None;
            }

            if let Some(oxc_ast::ast::Statement::VariableDeclaration(var_decl)) =
                result.program.body.first()
                && let Some(declarator) = var_decl.declarations.first()
            {
                let adjusted_offset = offset.wrapping_sub(4);
                let pattern_json = convert_binding_pattern_for_param(
                    &declarator.id,
                    adjusted_offset,
                    line_offsets,
                );
                return Some(Expression::Value(pattern_json));
            }

            None
        });
        if result.is_some() {
            return result;
        }
    }

    None
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
/// Returns an error message if parsing fails and loose mode is disabled.
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
) -> Result<Expression, (String, usize)> {
    // Try TypeScript first, then fall back to JavaScript
    let result = parse_expression_with_typescript(content, offset, line_offsets, true)
        .or_else(|| parse_expression_with_typescript(content, offset, line_offsets, false));

    if let Some(expr) = result {
        return Ok(expr);
    }

    // If parsing failed and we're in loose mode (and not disallowed), create invalid identifier
    // with the known end position
    if loose && !disallow_loose {
        return Ok(create_invalid_identifier(offset, end, line_offsets));
    }

    // Check for parse errors and return them when not in loose mode
    if (!loose || disallow_loose)
        && let Some(error_msg) = check_js_parse_error(content)
    {
        return Err((error_msg, offset));
    }

    // Fall back to invalid identifier
    Ok(create_invalid_identifier(offset, end, line_offsets))
}

/// Check if JavaScript expression has parse errors. Returns Some(error_message) if there is an error.
pub fn check_js_parse_error(content: &str) -> Option<String> {
    let mut wrapped = String::with_capacity(content.len() + 2);
    wrapped.push('(');
    wrapped.push_str(content);
    wrapped.push(')');

    // Try TypeScript first
    let ts_error = with_oxc_allocator(|allocator| {
        let parser = OxcParser::new(allocator, &wrapped, SourceType::ts());
        let result = parser.parse();
        if result.errors.is_empty() {
            return None;
        }
        result.errors.first().map(|e| e.message.to_string())
    });

    // No TS errors means valid
    ts_error.as_ref()?;

    // Try JavaScript
    let js_error = with_oxc_allocator(|allocator| {
        let parser = OxcParser::new(allocator, &wrapped, SourceType::mjs());
        let result = parser.parse();
        if result.errors.is_empty() {
            return None;
        }
        result.errors.first().map(|e| e.message.to_string())
    });

    // No JS errors means valid
    js_error.as_ref()?;

    js_error.or(ts_error)
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
    with_oxc_allocator(|allocator| {
        let source_type = if use_typescript {
            SourceType::ts()
        } else {
            SourceType::mjs()
        };

        // Try to parse as an expression by wrapping it in parens.
        // Use pre-allocated String with exact capacity to avoid realloc.
        let mut wrapped = String::with_capacity(content.len() + 2);
        wrapped.push('(');
        wrapped.push_str(content);
        wrapped.push(')');
        let parser = OxcParser::new(allocator, &wrapped, source_type);
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
                        .to_value()
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
                        .to_value()
                    })
                    .collect();

                // Attach comments to the expression
                if !leading_comments.is_empty() || !trailing_comments.is_empty() {
                    let mut json_val = expr.as_json().clone();
                    if let Value::Object(ref mut obj) = json_val {
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
                    expr = Expression::Value(json_val);
                }
            }

            return Some(expr);
        }

        None
    })
}

/// Unwrap ParenthesizedExpression to get the inner expression.
/// This is needed because we wrap expressions in parentheses for parsing.
fn unwrap_parenthesized<'a>(expr: &'a OxcExpression<'a>) -> &'a OxcExpression<'a> {
    match expr {
        OxcExpression::ParenthesizedExpression(paren) => unwrap_parenthesized(&paren.expression),
        _ => expr,
    }
}

/// Strip optional markers (`?`) from TypeScript parameter names.
///
/// Converts patterns like:
///   `c?: number = 5` -> `c: number = 5`
///   `c?: number` -> `c: number`
///   `c?, d?` -> `c, d`
///
/// This is needed because OXC's TS parser may reject `c?: number = 5` as invalid
/// (optional with default), but Svelte's snippet syntax allows it.
/// Result of stripping optional markers, including position mapping info.
struct StrippedOptionalMarkers {
    /// The cleaned string with `?` markers removed.
    content: String,
    /// Byte positions (in the original content) where characters were removed.
    /// Used to map positions in the cleaned string back to the original string.
    removed_positions: Vec<usize>,
}

impl StrippedOptionalMarkers {
    /// Map a byte position in the cleaned string back to the original string position.
    fn map_to_original(&self, cleaned_pos: usize) -> usize {
        let mut original_pos = cleaned_pos;
        for &removed in &self.removed_positions {
            if removed <= original_pos {
                original_pos += 1;
            } else {
                break;
            }
        }
        original_pos
    }
}

fn strip_optional_markers(content: &str) -> StrippedOptionalMarkers {
    let mut result = String::with_capacity(content.len());
    let chars: Vec<char> = content.chars().collect();
    let mut i = 0;
    let mut removed_positions = Vec::new();

    while i < chars.len() {
        if chars[i] == '?' {
            // Check if this `?` is after an identifier (part of `name?:` or `name? =` or `name?,` or `name?)`)
            // and not inside a string
            let before_is_ident = i > 0
                && (chars[i - 1].is_alphanumeric() || chars[i - 1] == '_' || chars[i - 1] == '$');
            let after_is_valid = if i + 1 < chars.len() {
                let next = chars[i + 1];
                next == ':'
                    || next == ','
                    || next == ')'
                    || next == ' '
                    || next == '\t'
                    || next == '\n'
            } else {
                true // at end of string
            };

            if before_is_ident && after_is_valid {
                // Skip the `?` - it's an optional marker
                removed_positions.push(i);
                i += 1;
                continue;
            }
        }
        result.push(chars[i]);
        i += 1;
    }

    StrippedOptionalMarkers {
        content: result,
        removed_positions,
    }
}

/// Split a parameter list at top-level commas (not inside braces, brackets, parens, or strings).
fn split_top_level_params(content: &str) -> Vec<String> {
    let mut parts = Vec::new();
    let mut current = String::new();
    let mut depth = 0i32;
    let mut in_string: Option<char> = None;

    for c in content.chars() {
        if let Some(quote) = in_string {
            current.push(c);
            if c == quote {
                in_string = None;
            }
            continue;
        }

        match c {
            '\'' | '"' | '`' => {
                in_string = Some(c);
                current.push(c);
            }
            '(' | '[' | '{' | '<' => {
                depth += 1;
                current.push(c);
            }
            ')' | ']' | '}' | '>' => {
                depth -= 1;
                current.push(c);
            }
            ',' if depth == 0 => {
                parts.push(current.clone());
                current.clear();
            }
            _ => {
                current.push(c);
            }
        }
    }

    if !current.trim().is_empty() {
        parts.push(current);
    }

    parts
}

/// Parse TypeScript function parameters and return them as Expressions.
/// Input is the content inside parentheses, e.g., "msg: string, count: number"
pub fn parse_typescript_params(
    content: &str,
    offset: usize,
    line_offsets: &[usize],
) -> Vec<Expression> {
    // Use TypeScript source type to parse type annotations
    let source_type = SourceType::ts();

    // Wrap as arrow function to parse parameters: "(msg: string) => {}"
    let mut wrapped = String::with_capacity(content.len() + 9);
    wrapped.push('(');
    wrapped.push_str(content);
    wrapped.push_str(") => {}");
    let mut params = Vec::new();

    enum ParseOutcome {
        Ok(Vec<Expression>),
        HasErrors,
    }

    let outcome = with_oxc_allocator(|allocator| {
        let parser = OxcParser::new(allocator, &wrapped, source_type);
        let result = parser.parse();

        if result.errors.is_empty()
            && let Some(oxc_ast::ast::Statement::ExpressionStatement(expr_stmt)) =
                result.program.body.first()
            && let OxcExpression::ArrowFunctionExpression(arrow) = &expr_stmt.expression
        {
            let mut p = Vec::new();
            for param in &arrow.params.items {
                let param_expr = convert_formal_parameter(param, offset - 1, line_offsets);
                p.push(param_expr);
            }
            ParseOutcome::Ok(p)
        } else {
            ParseOutcome::HasErrors
        }
    });

    match outcome {
        ParseOutcome::Ok(p) => return p,
        ParseOutcome::HasErrors => {}
    }

    // OXC TS parser failed - try stripping optional markers and re-parsing
    let stripped = strip_optional_markers(content);
    let mut cleaned_wrapped = String::with_capacity(stripped.content.len() + 9);
    cleaned_wrapped.push('(');
    cleaned_wrapped.push_str(&stripped.content);
    cleaned_wrapped.push_str(") => {}");

    let cleaned_ok = with_oxc_allocator(|allocator| {
        let cleaned_parser = OxcParser::new(allocator, &cleaned_wrapped, source_type);
        let cleaned_result = cleaned_parser.parse();

        if cleaned_result.errors.is_empty()
            && let Some(oxc_ast::ast::Statement::ExpressionStatement(expr_stmt)) =
                cleaned_result.program.body.first()
            && let OxcExpression::ArrowFunctionExpression(arrow) = &expr_stmt.expression
        {
            let mut p = Vec::new();
            for param in &arrow.params.items {
                let param_expr = if stripped.removed_positions.is_empty() {
                    convert_formal_parameter(param, offset - 1, line_offsets)
                } else {
                    convert_formal_parameter_with_remap(param, offset, line_offsets, &stripped)
                };
                p.push(param_expr);
            }
            Some(p)
        } else {
            None
        }
    });

    if let Some(p) = cleaned_ok {
        return p;
    }

    // Still failed - try parsing each parameter individually
    {
        let parts = split_top_level_params(content);
        for part in &parts {
            let part = part.trim();
            if part.is_empty() {
                continue;
            }
            let stripped_part = strip_optional_markers(part);
            let mut single_wrapped = String::with_capacity(stripped_part.content.len() + 9);
            single_wrapped.push('(');
            single_wrapped.push_str(&stripped_part.content);
            single_wrapped.push_str(") => {}");
            let single_result_expr = with_oxc_allocator(|allocator| {
                let single_parser = OxcParser::new(allocator, &single_wrapped, source_type);
                let single_result = single_parser.parse();
                if single_result.errors.is_empty()
                    && let Some(oxc_ast::ast::Statement::ExpressionStatement(expr_stmt)) =
                        single_result.program.body.first()
                    && let OxcExpression::ArrowFunctionExpression(arrow) = &expr_stmt.expression
                    && let Some(param) = arrow.params.items.first()
                {
                    let part_offset_in_content = content.find(part).unwrap_or(0);
                    let param_expr = if stripped_part.removed_positions.is_empty() {
                        convert_formal_parameter(param, offset - 1, line_offsets)
                    } else {
                        convert_formal_parameter_with_remap(
                            param,
                            offset + part_offset_in_content,
                            line_offsets,
                            &stripped_part,
                        )
                    };
                    Some(param_expr)
                } else {
                    None
                }
            });
            if let Some(expr) = single_result_expr {
                params.push(expr);
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
                // Strip optional marker '?' from the end (e.g., "c?" -> "c")
                let name = name.strip_suffix('?').unwrap_or(name);
                let part_offset = offset + content.find(part).unwrap_or(0);
                let expr =
                    create_identifier(name, part_offset, part_offset + name.len(), line_offsets);
                params.push(expr);
            }
        }
    }

    params
}

/// Convert an OXC FormalParameter to our Expression format, remapping span positions
/// to account for characters (optional markers `?`) that were removed before parsing.
///
/// The `base_offset` is the position in the original source where the parameter content starts
/// (i.e., `params_start`). The `stripped` info tells us where `?` characters were removed
/// so we can map OXC positions (relative to cleaned content) back to original positions.
fn convert_formal_parameter_with_remap(
    param: &oxc_ast::ast::FormalParameter,
    base_offset: usize,
    line_offsets: &[usize],
    stripped: &StrippedOptionalMarkers,
) -> Expression {
    // OXC positions are relative to the wrapped string "(cleaned_content) => {}"
    // So position 1 in OXC = position 0 in cleaned content.
    // We need: original_source_pos = base_offset + stripped.map_to_original(oxc_pos - 1)
    //
    // convert_formal_parameter uses adjusted_offset + oxc_pos for all positions,
    // where adjusted_offset = offset - 1. So adjusted_offset + oxc_pos = offset - 1 + oxc_pos.
    // This correctly handles the paren offset: offset - 1 + 1 = offset for position 0 in content.
    //
    // For the remapped case, we need: base_offset + stripped.map_to_original(oxc_pos - 1)
    // = base_offset + (oxc_pos - 1) + num_removed_before(oxc_pos - 1)
    //
    // We can't easily pass a mapping function through convert_formal_parameter and all its
    // sub-calls. Instead, we'll call convert_formal_parameter with adjusted_offset = base_offset - 1
    // (which gives base_offset - 1 + oxc_pos = base_offset + cleaned_pos, which is WRONG for
    // positions after removed chars). Then we'll fix up the top-level start/end spans.
    //
    // This is a pragmatic fix: the inner spans (like type annotations) may still be slightly off,
    // but for snippet parameters, only the top-level span is used to extract source text.

    let expr = convert_formal_parameter(param, base_offset - 1, line_offsets);

    // Fix up the top-level span: remap start and end from cleaned positions to original
    let mut val = expr.as_json().clone();

    if let Some(obj) = val.as_object_mut() {
        // Fix start position
        if let Some(start_val) = obj.get("start").and_then(|s| s.as_u64()) {
            // start_val = base_offset - 1 + oxc_start = base_offset + (oxc_start - 1)
            // = base_offset + cleaned_pos
            let cleaned_pos = start_val as usize - base_offset;
            let original_pos = base_offset + stripped.map_to_original(cleaned_pos);
            obj.insert(
                "start".to_string(),
                serde_json::Value::Number((original_pos as i64).into()),
            );
        }

        // Fix end position
        if let Some(end_val) = obj.get("end").and_then(|e| e.as_u64()) {
            let cleaned_pos = end_val as usize - base_offset;
            let original_pos = base_offset + stripped.map_to_original(cleaned_pos);
            obj.insert(
                "end".to_string(),
                serde_json::Value::Number((original_pos as i64).into()),
            );
        }

        // Also fix the "right" field's span if this is an AssignmentPattern
        // (the default value expression span)
        if obj.get("type").and_then(|t| t.as_str()) == Some("AssignmentPattern")
            && let Some(right) = obj.get_mut("right")
            && let Some(right_obj) = right.as_object_mut()
        {
            if let Some(start_val) = right_obj.get("start").and_then(|s| s.as_u64()) {
                let cleaned_pos = start_val as usize - base_offset;
                let original_pos = base_offset + stripped.map_to_original(cleaned_pos);
                right_obj.insert(
                    "start".to_string(),
                    serde_json::Value::Number((original_pos as i64).into()),
                );
            }
            if let Some(end_val) = right_obj.get("end").and_then(|e| e.as_u64()) {
                let cleaned_pos = end_val as usize - base_offset;
                let original_pos = base_offset + stripped.map_to_original(cleaned_pos);
                right_obj.insert(
                    "end".to_string(),
                    serde_json::Value::Number((original_pos as i64).into()),
                );
            }
        }
    }

    Expression::Value(val)
}

/// Convert oxc FormalParameter to our Expression format with type annotations.
/// Caller should pass pre-adjusted offset if needed (e.g., offset - 1 for paren-wrapped content).
fn convert_formal_parameter(
    param: &oxc_ast::ast::FormalParameter,
    adjusted_offset: usize,
    line_offsets: &[usize],
) -> Expression {
    // Check for TypeScript parameter properties (e.g., `constructor(private x: number)`)
    // These need to be emitted as TSParameterProperty nodes so that
    // remove_typescript_nodes can detect and report them.
    if param.accessibility.is_some() || param.readonly {
        let start = adjusted_offset + param.span.start as usize;
        let end = adjusted_offset + param.span.end as usize;
        let mut obj = Map::new();
        obj.insert(
            "type".to_string(),
            Value::String("TSParameterProperty".to_string()),
        );
        obj.insert("start".to_string(), Value::Number((start as i64).into()));
        obj.insert("end".to_string(), Value::Number((end as i64).into()));
        if let Some(loc) = create_loc(start, end, line_offsets) {
            obj.insert("loc".to_string(), loc);
        }
        if param.readonly {
            obj.insert("readonly".to_string(), Value::Bool(true));
        }
        if let Some(ref accessibility) = param.accessibility {
            let acc_str = match accessibility {
                oxc_ast::ast::TSAccessibility::Private => "private",
                oxc_ast::ast::TSAccessibility::Protected => "protected",
                oxc_ast::ast::TSAccessibility::Public => "public",
            };
            obj.insert(
                "accessibility".to_string(),
                Value::String(acc_str.to_string()),
            );
        }
        // Include the parameter itself so remove_typescript_nodes can extract it
        let inner = convert_formal_parameter_inner(param, adjusted_offset, line_offsets);
        obj.insert("parameter".to_string(), inner.as_json().clone());
        return Expression::Value(Value::Object(obj));
    }

    convert_formal_parameter_inner(param, adjusted_offset, line_offsets)
}

/// Inner implementation of convert_formal_parameter (without TSParameterProperty wrapping).
fn convert_formal_parameter_inner(
    param: &oxc_ast::ast::FormalParameter,
    adjusted_offset: usize,
    line_offsets: &[usize],
) -> Expression {
    use oxc_ast::ast::BindingPattern;

    // First, convert the pattern (left side)
    let pattern_expr = match &param.pattern {
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
                if let Some(loc) = create_loc(start, end, line_offsets) {
                    obj.insert("loc".to_string(), loc);
                }
                obj.insert("name".to_string(), Value::String(name.to_string()));

                // Convert type annotation
                let type_ann_obj =
                    convert_type_annotation_adjusted(type_ann, adjusted_offset, line_offsets);
                obj.insert("typeAnnotation".to_string(), type_ann_obj);

                Expression::Value(Value::Object(obj))
            } else {
                let end = adjusted_offset + id.span.end as usize;
                create_identifier(name, start, end, line_offsets)
            }
        }
        BindingPattern::ObjectPattern(obj_pat) => {
            convert_object_pattern_to_expr(obj_pat, adjusted_offset, line_offsets)
        }
        BindingPattern::ArrayPattern(arr_pat) => {
            convert_array_pattern_to_expr(arr_pat, adjusted_offset, line_offsets)
        }
        BindingPattern::AssignmentPattern(assign_pat) => {
            convert_assignment_pattern_to_expr(assign_pat, adjusted_offset, line_offsets)
        }
    };

    if let Some(initializer) = &param.initializer {
        let pattern_start = adjusted_offset + param.span.start as usize;
        let pattern_end = adjusted_offset + param.span.end as usize;

        let right = convert_expression(initializer, adjusted_offset + 1, line_offsets);

        return Expression::from_node(JsNode::AssignmentPattern {
            start: pattern_start as u32,
            end: pattern_end as u32,
            loc: create_typed_loc(pattern_start, pattern_end, line_offsets),
            left: Box::new(expr_to_node(pattern_expr)),
            right: Box::new(expr_to_node(right)),
        });
    }

    pattern_expr
}

/// Convert oxc ObjectPattern to our Expression format (for function parameters).
fn convert_object_pattern_to_expr(
    obj_pat: &oxc_ast::ast::ObjectPattern,
    adjusted_offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let start = adjusted_offset + obj_pat.span.start as usize;
    let end = adjusted_offset + obj_pat.span.end as usize;

    let mut properties: Vec<JsNode> = obj_pat
        .properties
        .iter()
        .map(|prop| {
            let prop_start = adjusted_offset + prop.span.start as usize;
            let prop_end = adjusted_offset + prop.span.end as usize;
            let key_value =
                convert_property_key_for_param(&prop.key, adjusted_offset, line_offsets);
            let value_value =
                convert_binding_pattern_for_param(&prop.value, adjusted_offset, line_offsets);
            JsNode::Property {
                start: prop_start as u32,
                end: prop_end as u32,
                loc: create_typed_loc(prop_start, prop_end, line_offsets),
                method: false,
                shorthand: prop.shorthand,
                computed: prop.computed,
                key: Box::new(JsNode::Raw(key_value)),
                value: Box::new(JsNode::Raw(value_value)),
                kind: CompactString::from("init"),
            }
        })
        .collect();

    if let Some(rest) = &obj_pat.rest {
        let rest_start = adjusted_offset + rest.span.start as usize;
        let rest_end = adjusted_offset + rest.span.end as usize;
        let argument =
            convert_binding_pattern_for_param(&rest.argument, adjusted_offset, line_offsets);
        properties.push(JsNode::RestElement {
            start: rest_start as u32,
            end: rest_end as u32,
            loc: create_typed_loc(rest_start, rest_end, line_offsets),
            argument: Box::new(JsNode::Raw(argument)),
        });
    }

    Expression::from_node(JsNode::ObjectPattern {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        properties,
    })
}

/// Convert oxc ArrayPattern to our Expression format (for function parameters).
fn convert_array_pattern_to_expr(
    arr_pat: &oxc_ast::ast::ArrayPattern,
    adjusted_offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let start = adjusted_offset + arr_pat.span.start as usize;
    let end = adjusted_offset + arr_pat.span.end as usize;

    let mut elements: Vec<Option<JsNode>> = arr_pat
        .elements
        .iter()
        .map(|elem| {
            elem.as_ref().map(|pattern| {
                JsNode::Raw(convert_binding_pattern_for_param(
                    pattern,
                    adjusted_offset,
                    line_offsets,
                ))
            })
        })
        .collect();

    if let Some(rest) = &arr_pat.rest {
        let rest_start = adjusted_offset + rest.span.start as usize;
        let rest_end = adjusted_offset + rest.span.end as usize;
        let argument =
            convert_binding_pattern_for_param(&rest.argument, adjusted_offset, line_offsets);
        elements.push(Some(JsNode::RestElement {
            start: rest_start as u32,
            end: rest_end as u32,
            loc: create_typed_loc(rest_start, rest_end, line_offsets),
            argument: Box::new(JsNode::Raw(argument)),
        }));
    }

    Expression::from_node(JsNode::ArrayPattern {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        elements,
    })
}

/// Convert oxc AssignmentPattern to our Expression format (for function parameters).
fn convert_assignment_pattern_to_expr(
    assign_pat: &oxc_ast::ast::AssignmentPattern,
    adjusted_offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let start = adjusted_offset + assign_pat.span.start as usize;
    let end = adjusted_offset + assign_pat.span.end as usize;

    let left = convert_binding_pattern_for_param(&assign_pat.left, adjusted_offset, line_offsets);

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

    Expression::from_node(JsNode::AssignmentPattern {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        left: Box::new(JsNode::Raw(left)),
        right: Box::new(JsNode::Raw(Value::Object(right_obj))),
    })
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
            if let Some(loc) = create_loc(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }
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
            if let Some(loc) = create_loc(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }
            Value::Object(obj)
        }
        _ => {
            // For computed keys, convert the expression properly
            if let Some(expr) = key.as_expression() {
                convert_expression(expr, adjusted_offset, line_offsets)
                    .as_json()
                    .clone()
            } else {
                // Fallback placeholder for truly unhandled cases
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
            if let Some(loc) = create_loc(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }
            Value::Object(obj)
        }
        BindingPattern::ObjectPattern(obj_pat) => {
            // Recursive call for nested object patterns
            convert_object_pattern_to_expr(obj_pat, adjusted_offset, line_offsets)
                .as_json()
                .clone()
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
            if let Some(loc) = create_loc(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }

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

            // Handle rest element if present (e.g., [a, ...[b, ...[c]]])
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
                if let Some(loc) = create_loc(rest_start, rest_end, line_offsets) {
                    rest_obj.insert("loc".to_string(), loc);
                }

                let argument = convert_binding_pattern_for_param(
                    &rest.argument,
                    adjusted_offset,
                    line_offsets,
                );
                rest_obj.insert("argument".to_string(), argument);

                elements.push(Value::Object(rest_obj));
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
            if let Some(loc) = create_loc(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }

            // Convert left (the pattern)
            let left =
                convert_binding_pattern_for_param(&assign_pat.left, adjusted_offset, line_offsets);
            obj.insert("left".to_string(), left);

            // Convert right (the default value) using the full expression converter
            let right_val = convert_expression(&assign_pat.right, adjusted_offset, line_offsets)
                .as_json()
                .clone();
            obj.insert("right".to_string(), right_val);

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
    if let Some(loc) = create_loc(start, end, line_offsets) {
        obj.insert("loc".to_string(), loc);
    }

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
            if let Some(loc) = create_loc(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }

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
            if let Some(loc) = create_loc(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }
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
            if let Some(loc) = create_loc(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }
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
            if let Some(loc) = create_loc(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }

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
            if let Some(loc) = create_loc(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }

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
    if let Some(loc) = create_loc(start, end, line_offsets) {
        obj.insert("loc".to_string(), loc);
    }

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
    if let Some(loc) = create_loc(start, end, line_offsets) {
        obj.insert("loc".to_string(), loc);
    }
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
            create_literal(
                LiteralValue::Bool(bool_lit.value),
                raw,
                start,
                end,
                line_offsets,
            )
        }
        OxcExpression::NullLiteral(null_lit) => {
            let start = offset + null_lit.span.start as usize - 1;
            let end = offset + null_lit.span.end as usize - 1;
            create_literal(LiteralValue::Null, "null", start, end, line_offsets)
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
            Expression::from_node(JsNode::ThisExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
            })
        }
        OxcExpression::Super(super_expr) => {
            let start = offset + super_expr.span.start as usize - 1;
            let end = offset + super_expr.span.end as usize - 1;
            Expression::from_node(JsNode::Super {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
            })
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
            let source = convert_expression(&import_expr.source, offset, line_offsets);
            Expression::from_node(JsNode::ImportExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                source: Box::new(expr_to_node(source)),
            })
        }
        OxcExpression::AwaitExpression(await_expr) => {
            let start = offset + await_expr.span.start as usize - 1;
            let end = offset + await_expr.span.end as usize - 1;
            let argument = convert_expression(&await_expr.argument, offset, line_offsets);
            Expression::from_node(JsNode::AwaitExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                argument: Box::new(expr_to_node(argument)),
            })
        }
        OxcExpression::YieldExpression(yield_expr) => {
            let start = offset + yield_expr.span.start as usize - 1;
            let end = offset + yield_expr.span.end as usize - 1;
            Expression::from_node(JsNode::YieldExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                delegate: yield_expr.delegate,
                argument: yield_expr.argument.as_ref().map(|arg| {
                    Box::new(expr_to_node(convert_expression(arg, offset, line_offsets)))
                }),
            })
        }
        OxcExpression::ChainExpression(chain_expr) => {
            let start = offset + chain_expr.span.start as usize - 1;
            let end = offset + chain_expr.span.end as usize - 1;
            let chain_inner = match &chain_expr.expression {
                oxc_ast::ast::ChainElement::CallExpression(call) => {
                    let inner_start = offset + call.span.start as usize - 1;
                    let inner_end = offset + call.span.end as usize - 1;
                    expr_to_node(create_call_expression(
                        call,
                        inner_start,
                        inner_end,
                        offset,
                        line_offsets,
                    ))
                }
                oxc_ast::ast::ChainElement::TSNonNullExpression(ts_non_null) => expr_to_node(
                    convert_expression(&ts_non_null.expression, offset, line_offsets),
                ),
                oxc_ast::ast::ChainElement::StaticMemberExpression(member) => {
                    let inner_start = offset + member.span.start as usize - 1;
                    let inner_end = offset + member.span.end as usize - 1;
                    expr_to_node(create_static_member_expression(
                        member,
                        inner_start,
                        inner_end,
                        offset,
                        line_offsets,
                    ))
                }
                oxc_ast::ast::ChainElement::ComputedMemberExpression(member) => {
                    let inner_start = offset + member.span.start as usize - 1;
                    let inner_end = offset + member.span.end as usize - 1;
                    expr_to_node(create_computed_member_expression(
                        member,
                        inner_start,
                        inner_end,
                        offset,
                        line_offsets,
                    ))
                }
                oxc_ast::ast::ChainElement::PrivateFieldExpression(private_member) => {
                    let inner_start = offset + private_member.span.start as usize - 1;
                    let inner_end = offset + private_member.span.end as usize - 1;
                    expr_to_node(create_private_member_expression(
                        private_member,
                        inner_start,
                        inner_end,
                        offset,
                        line_offsets,
                    ))
                }
            };
            Expression::from_node(JsNode::ChainExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                expression: Box::new(chain_inner),
            })
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
            let meta_start = offset + meta.meta.span.start as usize - 1;
            let meta_end = offset + meta.meta.span.end as usize - 1;
            let prop_start = offset + meta.property.span.start as usize - 1;
            let prop_end = offset + meta.property.span.end as usize - 1;
            Expression::from_node(JsNode::MetaProperty {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                meta: Box::new(expr_to_node(create_identifier(
                    &meta.meta.name,
                    meta_start,
                    meta_end,
                    line_offsets,
                ))),
                property: Box::new(expr_to_node(create_identifier(
                    &meta.property.name,
                    prop_start,
                    prop_end,
                    line_offsets,
                ))),
            })
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
    Expression::from_node(JsNode::Identifier {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        name: CompactString::from(name),
    })
}

/// Create a PrivateIdentifier node (for class private fields like #count).
fn create_private_identifier(
    name: &str,
    start: usize,
    end: usize,
    line_offsets: &[usize],
) -> Expression {
    Expression::from_node(JsNode::PrivateIdentifier {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        name: CompactString::from(name),
    })
}

/// Create an identifier for binding patterns (uses adjusted column calculation).
fn create_identifier_for_binding(
    name: &str,
    start: usize,
    end: usize,
    line_offsets: &[usize],
) -> JsNode {
    JsNode::Identifier {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc_for_binding(start, end, line_offsets),
        name: CompactString::from(name),
    }
}

/// Create a PrivateIdentifier for binding patterns.
fn create_private_identifier_for_binding(
    name: &str,
    start: usize,
    end: usize,
    line_offsets: &[usize],
) -> JsNode {
    JsNode::PrivateIdentifier {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc_for_binding(start, end, line_offsets),
        name: CompactString::from(name),
    }
}

/// Create an identifier for top-level binding pattern (e.g., simple "item" in each block).
/// Uses character field in loc and puts name before loc for correct field ordering.
fn create_identifier_for_binding_toplevel(
    name: &str,
    start: usize,
    end: usize,
    line_offsets: &[usize],
) -> JsNode {
    JsNode::Identifier {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc_for_binding_identifier(start, end, line_offsets),
        name: CompactString::from(name),
    }
}

/// Create a literal for binding patterns (uses adjusted column calculation).
fn create_literal_for_binding(
    value: LiteralValue,
    raw: &str,
    start: usize,
    end: usize,
    line_offsets: &[usize],
) -> JsNode {
    JsNode::Literal {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc_for_binding(start, end, line_offsets),
        value,
        raw: CompactString::from(raw),
        regex: None,
    }
}

/// Create a numeric literal for binding patterns.
fn create_numeric_literal_for_binding(
    value: f64,
    raw: &str,
    start: usize,
    end: usize,
    line_offsets: &[usize],
) -> JsNode {
    JsNode::Literal {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc_for_binding(start, end, line_offsets),
        value: LiteralValue::Number(value),
        raw: CompactString::from(raw),
        regex: None,
    }
}

/// Create a string literal for binding patterns.
fn create_string_literal_for_binding(
    value: &str,
    raw: &str,
    start: usize,
    end: usize,
    line_offsets: &[usize],
) -> JsNode {
    JsNode::Literal {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc_for_binding(start, end, line_offsets),
        value: LiteralValue::String(CompactString::from(value)),
        raw: CompactString::from(raw),
        regex: None,
    }
}

/// Create an identifier with character field in loc.
/// Used for Svelte-level identifiers like snippet names.
pub fn create_identifier_with_character(
    name: &str,
    start: usize,
    end: usize,
    line_offsets: &[usize],
) -> Expression {
    Expression::from_node(JsNode::Identifier {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc_with_character(start, end, line_offsets),
        name: CompactString::from(name),
    })
}

/// Create an identifier WITHOUT a loc field.
/// Used for error recovery when parsing invalid expressions in loose mode.
pub fn create_empty_identifier(name: &str, start: usize, end: usize) -> Expression {
    Expression::from_node(JsNode::Identifier {
        start: start as u32,
        end: end as u32,
        loc: None,
        name: CompactString::from(name),
    })
}

fn create_literal(
    value: LiteralValue,
    raw: &str,
    start: usize,
    end: usize,
    line_offsets: &[usize],
) -> Expression {
    Expression::from_node(JsNode::Literal {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        value,
        raw: CompactString::from(raw),
        regex: None,
    })
}

fn create_numeric_literal(
    value: f64,
    raw: &str,
    start: usize,
    end: usize,
    line_offsets: &[usize],
) -> Expression {
    Expression::from_node(JsNode::Literal {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        value: LiteralValue::Number(value),
        raw: CompactString::from(raw),
        regex: None,
    })
}

fn create_string_literal(
    value: &str,
    raw: &str,
    start: usize,
    end: usize,
    line_offsets: &[usize],
) -> Expression {
    Expression::from_node(JsNode::Literal {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        value: LiteralValue::String(CompactString::from(value)),
        raw: CompactString::from(raw),
        regex: None,
    })
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
    let left_expr = convert_expression(left, offset, line_offsets);
    let right_expr = convert_expression(right, offset, line_offsets);

    Expression::from_node(JsNode::BinaryExpression {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        left: Box::new(expr_to_node(left_expr)),
        operator: CompactString::from(binary_operator_to_string(operator)),
        right: Box::new(expr_to_node(right_expr)),
    })
}

fn create_logical_expression(
    logical: &oxc_ast::ast::LogicalExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let left_expr = convert_expression(&logical.left, offset, line_offsets);
    let right_expr = convert_expression(&logical.right, offset, line_offsets);

    Expression::from_node(JsNode::LogicalExpression {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        left: Box::new(expr_to_node(left_expr)),
        operator: CompactString::from(logical_operator_to_string(&logical.operator)),
        right: Box::new(expr_to_node(right_expr)),
    })
}

fn create_unary_expression(
    unary: &oxc_ast::ast::UnaryExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let argument = convert_expression(&unary.argument, offset, line_offsets);

    Expression::from_node(JsNode::UnaryExpression {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        operator: CompactString::from(unary_operator_to_string(&unary.operator)),
        prefix: true,
        argument: Box::new(expr_to_node(argument)),
    })
}

fn create_conditional_expression(
    cond: &oxc_ast::ast::ConditionalExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let test = convert_expression(&cond.test, offset, line_offsets);
    let consequent = convert_expression(&cond.consequent, offset, line_offsets);
    let alternate = convert_expression(&cond.alternate, offset, line_offsets);

    Expression::from_node(JsNode::ConditionalExpression {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        test: Box::new(expr_to_node(test)),
        consequent: Box::new(expr_to_node(consequent)),
        alternate: Box::new(expr_to_node(alternate)),
    })
}

fn create_call_expression(
    call: &oxc_ast::ast::CallExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let callee = convert_expression(&call.callee, offset, line_offsets);

    let args: Vec<JsNode> = call
        .arguments
        .iter()
        .filter_map(|arg| {
            match arg {
                oxc_ast::ast::Argument::SpreadElement(_) => None, // Simplified
                _ => {
                    let expr = arg.to_expression();
                    Some(expr_to_node(convert_expression(expr, offset, line_offsets)))
                }
            }
        })
        .collect();

    Expression::from_node(JsNode::CallExpression {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        callee: Box::new(expr_to_node(callee)),
        arguments: args,
        optional: call.optional,
    })
}

fn create_static_member_expression(
    member: &oxc_ast::ast::StaticMemberExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let object = convert_expression(&member.object, offset, line_offsets);

    let prop_start = offset + member.property.span.start as usize - 1;
    let prop_end = offset + member.property.span.end as usize - 1;

    Expression::from_node(JsNode::MemberExpression {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        object: Box::new(expr_to_node(object)),
        property: Box::new(JsNode::Identifier {
            start: prop_start as u32,
            end: prop_end as u32,
            loc: create_typed_loc(prop_start, prop_end, line_offsets),
            name: CompactString::from(member.property.name.as_str()),
        }),
        computed: false,
        optional: member.optional,
    })
}

fn create_computed_member_expression(
    member: &oxc_ast::ast::ComputedMemberExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let object = convert_expression(&member.object, offset, line_offsets);
    let property = convert_expression(&member.expression, offset, line_offsets);

    Expression::from_node(JsNode::MemberExpression {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        object: Box::new(expr_to_node(object)),
        property: Box::new(expr_to_node(property)),
        computed: true,
        optional: member.optional,
    })
}

fn create_private_member_expression(
    member: &oxc_ast::ast::PrivateFieldExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let object = convert_expression(&member.object, offset, line_offsets);

    let prop_start = offset + member.field.span.start as usize - 1;
    let prop_end = offset + member.field.span.end as usize - 1;

    Expression::from_node(JsNode::MemberExpression {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        object: Box::new(expr_to_node(object)),
        property: Box::new(JsNode::PrivateIdentifier {
            start: prop_start as u32,
            end: prop_end as u32,
            loc: create_typed_loc(prop_start, prop_end, line_offsets),
            name: CompactString::from(member.field.name.as_str()),
        }),
        computed: false,
        optional: member.optional,
    })
}

fn create_new_expression(
    new_expr: &oxc_ast::ast::NewExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let callee = convert_expression(&new_expr.callee, offset, line_offsets);

    let args: Vec<JsNode> = new_expr
        .arguments
        .iter()
        .map(|arg| match arg {
            oxc_ast::ast::Argument::SpreadElement(spread) => {
                let spread_start = offset + spread.span.start as usize - 1;
                let spread_end = offset + spread.span.end as usize - 1;
                let spread_arg = convert_expression(&spread.argument, offset, line_offsets);
                JsNode::SpreadElement {
                    start: spread_start as u32,
                    end: spread_end as u32,
                    loc: create_typed_loc(spread_start, spread_end, line_offsets),
                    argument: Box::new(expr_to_node(spread_arg)),
                }
            }
            _ => {
                let expr = arg.to_expression();
                expr_to_node(convert_expression(expr, offset, line_offsets))
            }
        })
        .collect();

    Expression::from_node(JsNode::NewExpression {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        callee: Box::new(expr_to_node(callee)),
        arguments: args,
    })
}

fn create_function_expression(
    func: &oxc_ast::ast::Function,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression {
    // id
    let id = func.id.as_ref().map(|id| {
        let id_start = offset + id.span.start as usize - 1;
        let id_end = offset + id.span.end as usize - 1;
        Box::new(expr_to_node(create_identifier(
            &id.name,
            id_start,
            id_end,
            line_offsets,
        )))
    });

    // params
    let params: Vec<JsNode> = func
        .params
        .items
        .iter()
        .map(|param| {
            JsNode::Raw(convert_binding_pattern(
                &param.pattern,
                offset,
                line_offsets,
            ))
        })
        .collect();

    // body
    let body = func.body.as_ref().map(|body| {
        let body_start = offset + body.span.start as usize - 1;
        let body_end = offset + body.span.end as usize - 1;
        let statements: Vec<JsNode> = body
            .statements
            .iter()
            .filter_map(|stmt| convert_statement(stmt, offset, line_offsets).map(JsNode::Raw))
            .collect();
        Box::new(JsNode::BlockStatement {
            start: body_start as u32,
            end: body_end as u32,
            loc: create_typed_loc(body_start, body_end, line_offsets),
            body: statements,
        })
    });

    Expression::from_node(JsNode::FunctionExpression {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        id,
        params,
        body,
        generator: func.generator,
        r#async: func.r#async,
        expression: false,
    })
}

fn create_class_expression(
    class_expr: &oxc_ast::ast::Class,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression {
    // id
    let id = class_expr.id.as_ref().map(|id| {
        let id_start = offset + id.span.start as usize - 1;
        let id_end = offset + id.span.end as usize - 1;
        Box::new(expr_to_node(create_identifier(
            &id.name,
            id_start,
            id_end,
            line_offsets,
        )))
    });

    // superClass
    let super_class = class_expr.super_class.as_ref().map(|sc| {
        let super_expr = convert_expression(sc, offset, line_offsets);
        Box::new(expr_to_node(super_expr))
    });

    // body
    let body = convert_class_body_for_expr(&class_expr.body, offset, line_offsets);

    Expression::from_node(JsNode::ClassExpression {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        id,
        super_class,
        body: Box::new(JsNode::Raw(body)),
    })
}

fn create_tagged_template_expression(
    tagged: &oxc_ast::ast::TaggedTemplateExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let tag = convert_expression(&tagged.tag, offset, line_offsets);

    let quasi_start = offset + tagged.quasi.span.start as usize - 1;
    let quasi_end = offset + tagged.quasi.span.end as usize - 1;
    let quasi =
        create_template_literal(&tagged.quasi, quasi_start, quasi_end, offset, line_offsets);

    Expression::from_node(JsNode::TaggedTemplateExpression {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        tag: Box::new(expr_to_node(tag)),
        quasi: Box::new(expr_to_node(quasi)),
    })
}

fn create_regex_literal(
    regex: &oxc_ast::ast::RegExpLiteral,
    start: usize,
    end: usize,
    line_offsets: &[usize],
) -> Expression {
    let pattern_str = regex.regex.pattern.text.to_string();
    let flags_str = regex.regex.flags.to_string();

    let raw = if let Some(ref raw_str) = regex.raw {
        raw_str.to_string()
    } else {
        format!("/{}/{}", pattern_str, flags_str)
    };

    Expression::from_node(JsNode::Literal {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        value: LiteralValue::Regex(RegexValue {
            pattern: CompactString::from(pattern_str),
            flags: CompactString::from(flags_str),
        }),
        raw: CompactString::from(raw),
        regex: Some(RegexValue {
            pattern: CompactString::from(regex.regex.pattern.text.as_ref()),
            flags: CompactString::from(regex.regex.flags.to_string()),
        }),
    })
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
    if let Some(loc) = create_loc(start, end, line_offsets) {
        obj.insert("loc".to_string(), loc);
    }

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
            if let Some(loc) = create_loc(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }
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
            obj.insert("key".to_string(), key.to_value());

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
            if let Some(loc) = create_loc(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }
            obj.insert("static".to_string(), Value::Bool(prop.r#static));
            obj.insert("computed".to_string(), Value::Bool(prop.computed));

            // key
            let key = convert_property_key_for_expr(&prop.key, offset, line_offsets);
            obj.insert("key".to_string(), key.to_value());

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
            if let Some(loc) = create_loc(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }

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
    let elements: Vec<Option<JsNode>> = arr
        .elements
        .iter()
        .map(|elem| match elem {
            oxc_ast::ast::ArrayExpressionElement::SpreadElement(spread) => {
                let spread_start = offset + spread.span.start as usize - 1;
                let spread_end = offset + spread.span.end as usize - 1;
                let spread_arg = convert_expression(&spread.argument, offset, line_offsets);
                Some(JsNode::SpreadElement {
                    start: spread_start as u32,
                    end: spread_end as u32,
                    loc: create_typed_loc(spread_start, spread_end, line_offsets),
                    argument: Box::new(expr_to_node(spread_arg)),
                })
            }
            oxc_ast::ast::ArrayExpressionElement::Elision(_) => None,
            _ => {
                let expr = elem.to_expression();
                Some(expr_to_node(convert_expression(expr, offset, line_offsets)))
            }
        })
        .collect();

    Expression::from_node(JsNode::ArrayExpression {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        elements,
    })
}

fn create_object_expression(
    obj_expr: &oxc_ast::ast::ObjectExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let properties: Vec<JsNode> = obj_expr
        .properties
        .iter()
        .map(|prop| match prop {
            oxc_ast::ast::ObjectPropertyKind::ObjectProperty(p) => {
                let prop_start = offset + p.span.start as usize - 1;
                let prop_end = offset + p.span.end as usize - 1;

                let key = convert_property_key_for_expr(&p.key, offset, line_offsets);
                let value = convert_expression(&p.value, offset, line_offsets);

                let kind = match p.kind {
                    oxc_ast::ast::PropertyKind::Init => "init",
                    oxc_ast::ast::PropertyKind::Get => "get",
                    oxc_ast::ast::PropertyKind::Set => "set",
                };

                JsNode::Property {
                    start: prop_start as u32,
                    end: prop_end as u32,
                    loc: create_typed_loc(prop_start, prop_end, line_offsets),
                    key: Box::new(key),
                    value: Box::new(expr_to_node(value)),
                    kind: CompactString::from(kind),
                    method: p.method,
                    shorthand: p.shorthand,
                    computed: p.computed,
                }
            }
            oxc_ast::ast::ObjectPropertyKind::SpreadProperty(spread) => {
                let spread_start = offset + spread.span.start as usize - 1;
                let spread_end = offset + spread.span.end as usize - 1;
                let argument = convert_expression(&spread.argument, offset, line_offsets);

                JsNode::SpreadElement {
                    start: spread_start as u32,
                    end: spread_end as u32,
                    loc: create_typed_loc(spread_start, spread_end, line_offsets),
                    argument: Box::new(expr_to_node(argument)),
                }
            }
        })
        .collect();

    Expression::from_node(JsNode::ObjectExpression {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        properties,
    })
}

/// Convert property key with -1 adjustment for expression parsing context
fn convert_property_key_for_expr(
    key: &oxc_ast::ast::PropertyKey,
    offset: usize,
    line_offsets: &[usize],
) -> JsNode {
    match key {
        oxc_ast::ast::PropertyKey::StaticIdentifier(id) => {
            let start = offset + id.span.start as usize - 1;
            let end = offset + id.span.end as usize - 1;
            expr_to_node(create_identifier(&id.name, start, end, line_offsets))
        }
        oxc_ast::ast::PropertyKey::PrivateIdentifier(id) => {
            let start = offset + id.span.start as usize - 1;
            let end = offset + id.span.end as usize - 1;
            expr_to_node(create_private_identifier(
                &id.name,
                start,
                end,
                line_offsets,
            ))
        }
        _ => {
            // For computed keys and other expressions
            let expr = key.as_expression();
            if let Some(expr) = expr {
                expr_to_node(convert_expression(expr, offset, line_offsets))
            } else {
                JsNode::Null
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
    let operator = assignment_operator_to_string(&assign.operator);
    let left = convert_assignment_target(&assign.left, offset, line_offsets);
    let right = convert_expression(&assign.right, offset, line_offsets);

    Expression::from_node(JsNode::AssignmentExpression {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        operator: CompactString::from(operator),
        left: Box::new(left),
        right: Box::new(expr_to_node(right)),
    })
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
    if let Some(loc) = create_loc(start, end, line_offsets) {
        obj.insert("loc".to_string(), loc);
    }

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
        if let Some(loc) = create_loc(rest_start, rest_end, line_offsets) {
            rest_obj.insert("loc".to_string(), loc);
        }
        rest_obj.insert(
            "argument".to_string(),
            convert_assignment_target(&rest.target, offset, line_offsets).to_value(),
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
    if let Some(loc) = create_loc(start, end, line_offsets) {
        obj.insert("loc".to_string(), loc);
    }

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
        if let Some(loc) = create_loc(rest_start, rest_end, line_offsets) {
            rest_obj.insert("loc".to_string(), loc);
        }
        rest_obj.insert(
            "argument".to_string(),
            convert_assignment_target(&rest.target, offset, line_offsets).to_value(),
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
            if let Some(loc) = create_loc(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }
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
                if let Some(loc) = create_loc(id_start, init_end, line_offsets) {
                    assign_pat.insert("loc".to_string(), loc);
                }
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
            if let Some(loc) = create_loc(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }
            obj.insert("method".to_string(), Value::Bool(false));
            obj.insert("shorthand".to_string(), Value::Bool(false));
            obj.insert("computed".to_string(), Value::Bool(prop_prop.computed));
            obj.insert("kind".to_string(), Value::String("init".to_string()));

            // Convert key
            let key = convert_property_key_with_offset(&prop_prop.name, offset, line_offsets);
            obj.insert("key".to_string(), key.to_value());

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
            if let Some(loc) = create_loc(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }
            obj.insert(
                "left".to_string(),
                convert_assignment_target(&with_default.binding, offset, line_offsets).to_value(),
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
                convert_assignment_target(inner, offset, line_offsets).to_value()
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
) -> JsNode {
    match key {
        oxc_ast::ast::PropertyKey::StaticIdentifier(id) => {
            let start = offset + id.span.start as usize - 1;
            let end = offset + id.span.end as usize - 1;
            expr_to_node(create_identifier(&id.name, start, end, line_offsets))
        }
        oxc_ast::ast::PropertyKey::PrivateIdentifier(id) => {
            let start = offset + id.span.start as usize - 1;
            let end = offset + id.span.end as usize - 1;
            expr_to_node(create_private_identifier(
                &id.name,
                start,
                end,
                line_offsets,
            ))
        }
        _ => {
            // For computed keys, try to get the expression
            if let Some(expr) = key.as_expression() {
                expr_to_node(convert_expression(expr, offset, line_offsets))
            } else {
                JsNode::Null
            }
        }
    }
}

fn convert_assignment_target(
    target: &oxc_ast::ast::AssignmentTarget,
    offset: usize,
    line_offsets: &[usize],
) -> JsNode {
    use oxc_ast::ast::AssignmentTarget;

    match target {
        AssignmentTarget::AssignmentTargetIdentifier(id) => {
            let start = offset + id.span.start as usize - 1;
            let end = offset + id.span.end as usize - 1;
            expr_to_node(create_identifier(&id.name, start, end, line_offsets))
        }
        AssignmentTarget::StaticMemberExpression(member) => {
            let start = offset + member.span.start as usize - 1;
            let end = offset + member.span.end as usize - 1;
            expr_to_node(create_static_member_expression(
                member,
                start,
                end,
                offset,
                line_offsets,
            ))
        }
        AssignmentTarget::ComputedMemberExpression(member) => {
            let start = offset + member.span.start as usize - 1;
            let end = offset + member.span.end as usize - 1;
            expr_to_node(create_computed_member_expression(
                member,
                start,
                end,
                offset,
                line_offsets,
            ))
        }
        AssignmentTarget::ObjectAssignmentTarget(obj_target) => JsNode::Raw(
            convert_object_assignment_target(obj_target, offset, line_offsets),
        ),
        AssignmentTarget::ArrayAssignmentTarget(arr_target) => JsNode::Raw(
            convert_array_assignment_target(arr_target, offset, line_offsets),
        ),
        _ => {
            // Fallback for other complex patterns (e.g., TSAsExpression, TSNonNullExpression)
            JsNode::Null
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
    let operator = match update.operator {
        oxc_ast::ast::UpdateOperator::Increment => "++",
        oxc_ast::ast::UpdateOperator::Decrement => "--",
    };

    let argument = convert_simple_assignment_target(&update.argument, offset, line_offsets);

    Expression::from_node(JsNode::UpdateExpression {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        operator: CompactString::from(operator),
        prefix: update.prefix,
        argument: Box::new(argument),
    })
}

fn create_sequence_expression(
    seq: &oxc_ast::ast::SequenceExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression {
    let expressions: Vec<JsNode> = seq
        .expressions
        .iter()
        .map(|expr| expr_to_node(convert_expression(expr, offset, line_offsets)))
        .collect();

    Expression::from_node(JsNode::SequenceExpression {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        expressions,
    })
}

fn convert_simple_assignment_target(
    target: &oxc_ast::ast::SimpleAssignmentTarget,
    offset: usize,
    line_offsets: &[usize],
) -> JsNode {
    use oxc_ast::ast::SimpleAssignmentTarget;

    match target {
        SimpleAssignmentTarget::AssignmentTargetIdentifier(id) => {
            let start = offset + id.span.start as usize - 1;
            let end = offset + id.span.end as usize - 1;
            expr_to_node(create_identifier(&id.name, start, end, line_offsets))
        }
        SimpleAssignmentTarget::StaticMemberExpression(member) => {
            let start = offset + member.span.start as usize - 1;
            let end = offset + member.span.end as usize - 1;
            expr_to_node(create_static_member_expression(
                member,
                start,
                end,
                offset,
                line_offsets,
            ))
        }
        SimpleAssignmentTarget::ComputedMemberExpression(member) => {
            let start = offset + member.span.start as usize - 1;
            let end = offset + member.span.end as usize - 1;
            expr_to_node(create_computed_member_expression(
                member,
                start,
                end,
                offset,
                line_offsets,
            ))
        }
        _ => JsNode::Null,
    }
}

fn create_arrow_function(
    arrow: &oxc_ast::ast::ArrowFunctionExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression {
    // Convert params - pass offset - 1 because we wrapped content in parens for parsing
    let params: Vec<JsNode> = arrow
        .params
        .items
        .iter()
        .map(|param| expr_to_node(convert_formal_parameter(param, offset - 1, line_offsets)))
        .collect();

    // Convert body - check if this is an expression body or block body
    let body_node = if arrow.expression {
        if let Some(oxc_ast::ast::Statement::ExpressionStatement(expr_stmt)) =
            arrow.body.statements.first()
        {
            expr_to_node(convert_expression(
                &expr_stmt.expression,
                offset,
                line_offsets,
            ))
        } else {
            JsNode::Raw(convert_arrow_body(&arrow.body, offset, line_offsets))
        }
    } else {
        JsNode::Raw(convert_arrow_body(&arrow.body, offset, line_offsets))
    };

    Expression::from_node(JsNode::ArrowFunctionExpression {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        id: None,
        params,
        body: Box::new(body_node),
        expression: arrow.expression,
        generator: false,
        r#async: arrow.r#async,
    })
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
    if let Some(loc) = create_loc(start, end, line_offsets) {
        obj.insert("loc".to_string(), loc);
    }

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
            if let Some(loc) = create_loc(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }
            obj.insert(
                "expression".to_string(),
                convert_expression(&expr_stmt.expression, offset, line_offsets)
                    .as_json()
                    .clone(),
            );

            Some(Value::Object(obj))
        }
        oxc_ast::ast::Statement::ReturnStatement(ret_stmt) => {
            let start = offset + ret_stmt.span.start as usize - 1;
            let end = offset + ret_stmt.span.end as usize - 1;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("ReturnStatement".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            if let Some(loc) = create_loc(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }
            if let Some(arg) = &ret_stmt.argument {
                obj.insert(
                    "argument".to_string(),
                    convert_expression(arg, offset, line_offsets)
                        .as_json()
                        .clone(),
                );
            } else {
                obj.insert("argument".to_string(), Value::Null);
            }
            Some(Value::Object(obj))
        }
        oxc_ast::ast::Statement::ThrowStatement(throw_stmt) => {
            let start = offset + throw_stmt.span.start as usize - 1;
            let end = offset + throw_stmt.span.end as usize - 1;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("ThrowStatement".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            if let Some(loc) = create_loc(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }
            obj.insert(
                "argument".to_string(),
                convert_expression(&throw_stmt.argument, offset, line_offsets)
                    .as_json()
                    .clone(),
            );
            Some(Value::Object(obj))
        }
        oxc_ast::ast::Statement::IfStatement(if_stmt) => {
            let start = offset + if_stmt.span.start as usize - 1;
            let end = offset + if_stmt.span.end as usize - 1;
            let mut obj = Map::new();
            obj.insert("type".to_string(), Value::String("IfStatement".to_string()));
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            if let Some(loc) = create_loc(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }
            obj.insert(
                "test".to_string(),
                convert_expression(&if_stmt.test, offset, line_offsets)
                    .as_json()
                    .clone(),
            );
            if let Some(consequent_val) =
                convert_statement(&if_stmt.consequent, offset, line_offsets)
            {
                obj.insert("consequent".to_string(), consequent_val);
            }
            if let Some(alternate) = &if_stmt.alternate
                && let Some(alternate_val) = convert_statement(alternate, offset, line_offsets)
            {
                obj.insert("alternate".to_string(), alternate_val);
            }
            Some(Value::Object(obj))
        }
        oxc_ast::ast::Statement::BlockStatement(block) => {
            let start = offset + block.span.start as usize - 1;
            let end = offset + block.span.end as usize - 1;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("BlockStatement".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            if let Some(loc) = create_loc(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }
            let body_stmts: Vec<Value> = block
                .body
                .iter()
                .filter_map(|s| convert_statement(s, offset, line_offsets))
                .collect();
            obj.insert("body".to_string(), Value::Array(body_stmts));
            Some(Value::Object(obj))
        }
        oxc_ast::ast::Statement::ForStatement(for_stmt) => {
            let start = offset + for_stmt.span.start as usize - 1;
            let end = offset + for_stmt.span.end as usize - 1;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("ForStatement".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            if let Some(loc) = create_loc(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }
            // init
            if let Some(init) = &for_stmt.init {
                let init_value = match init {
                    oxc_ast::ast::ForStatementInit::VariableDeclaration(vd) => {
                        convert_variable_declaration(vd, offset, line_offsets)
                    }
                    _ => {
                        if let Some(expr) = init.as_expression() {
                            convert_expression(expr, offset, line_offsets)
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
            if let Some(body_val) = convert_statement(&for_stmt.body, offset, line_offsets) {
                obj.insert("body".to_string(), body_val);
            }
            if let Some(test) = &for_stmt.test {
                obj.insert(
                    "test".to_string(),
                    convert_expression(test, offset, line_offsets)
                        .as_json()
                        .clone(),
                );
            }
            if let Some(update) = &for_stmt.update {
                obj.insert(
                    "update".to_string(),
                    convert_expression(update, offset, line_offsets)
                        .as_json()
                        .clone(),
                );
            }
            Some(Value::Object(obj))
        }
        oxc_ast::ast::Statement::TryStatement(try_stmt) => {
            let start = offset + try_stmt.span.start as usize - 1;
            let end = offset + try_stmt.span.end as usize - 1;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("TryStatement".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            if let Some(loc) = create_loc(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }
            // Convert block
            let block_start = offset + try_stmt.block.span.start as usize - 1;
            let block_end = offset + try_stmt.block.span.end as usize - 1;
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
            let block_body: Vec<Value> = try_stmt
                .block
                .body
                .iter()
                .filter_map(|s| convert_statement(s, offset, line_offsets))
                .collect();
            block_obj.insert("body".to_string(), Value::Array(block_body));
            obj.insert("block".to_string(), Value::Object(block_obj));
            // Convert handler (catch clause)
            if let Some(handler) = &try_stmt.handler {
                let h_start = offset + handler.span.start as usize - 1;
                let h_end = offset + handler.span.end as usize - 1;
                let mut h_obj = Map::new();
                h_obj.insert("type".to_string(), Value::String("CatchClause".to_string()));
                h_obj.insert("start".to_string(), Value::Number((h_start as i64).into()));
                h_obj.insert("end".to_string(), Value::Number((h_end as i64).into()));
                if let Some(param) = &handler.param {
                    let param_val =
                        convert_binding_pattern_for_param(&param.pattern, offset - 1, line_offsets);
                    h_obj.insert("param".to_string(), param_val);
                }
                let h_body_start = offset + handler.body.span.start as usize - 1;
                let h_body_end = offset + handler.body.span.end as usize - 1;
                let mut h_body_obj = Map::new();
                h_body_obj.insert(
                    "type".to_string(),
                    Value::String("BlockStatement".to_string()),
                );
                h_body_obj.insert(
                    "start".to_string(),
                    Value::Number((h_body_start as i64).into()),
                );
                h_body_obj.insert("end".to_string(), Value::Number((h_body_end as i64).into()));
                let h_body_stmts: Vec<Value> = handler
                    .body
                    .body
                    .iter()
                    .filter_map(|s| convert_statement(s, offset, line_offsets))
                    .collect();
                h_body_obj.insert("body".to_string(), Value::Array(h_body_stmts));
                h_obj.insert("body".to_string(), Value::Object(h_body_obj));
                obj.insert("handler".to_string(), Value::Object(h_obj));
            }
            // Convert finalizer (finally)
            if let Some(finalizer) = &try_stmt.finalizer {
                let f_start = offset + finalizer.span.start as usize - 1;
                let f_end = offset + finalizer.span.end as usize - 1;
                let mut f_obj = Map::new();
                f_obj.insert(
                    "type".to_string(),
                    Value::String("BlockStatement".to_string()),
                );
                f_obj.insert("start".to_string(), Value::Number((f_start as i64).into()));
                f_obj.insert("end".to_string(), Value::Number((f_end as i64).into()));
                let f_body: Vec<Value> = finalizer
                    .body
                    .iter()
                    .filter_map(|s| convert_statement(s, offset, line_offsets))
                    .collect();
                f_obj.insert("body".to_string(), Value::Array(f_body));
                obj.insert("finalizer".to_string(), Value::Object(f_obj));
            }
            Some(Value::Object(obj))
        }
        oxc_ast::ast::Statement::FunctionDeclaration(func_decl) => {
            // Filter out TypeScript declare functions and function overload signatures (no body)
            if func_decl.r#type == oxc_ast::ast::FunctionType::TSDeclareFunction
                || func_decl.body.is_none()
            {
                return None;
            }
            let start = offset + func_decl.span.start as usize - 1;
            let end = offset + func_decl.span.end as usize - 1;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("FunctionDeclaration".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            if let Some(loc) = create_loc(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }

            if let Some(id) = &func_decl.id {
                let id_start = offset + id.span.start as usize - 1;
                let id_end = offset + id.span.end as usize - 1;
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
                    convert_formal_parameter(param, offset - 1, line_offsets)
                        .as_json()
                        .clone()
                })
                .collect();
            obj.insert("params".to_string(), Value::Array(params));

            // Convert body - reuse convert_arrow_body which handles the -1 offset adjustment
            if let Some(body) = &func_decl.body {
                let body_value = convert_arrow_body(body, offset, line_offsets);
                obj.insert("body".to_string(), body_value);
            } else {
                obj.insert("body".to_string(), Value::Null);
            }

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
    if let Some(loc) = create_loc(start, end, line_offsets) {
        obj.insert("loc".to_string(), loc);
    }

    // Convert declarations (before kind to match acorn field order)
    let declarations: Vec<Value> = decl
        .declarations
        .iter()
        .map(|d| convert_variable_declarator(d, offset, line_offsets))
        .collect();
    obj.insert("declarations".to_string(), Value::Array(declarations));

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
    if let Some(loc) = create_loc(start, end, line_offsets) {
        obj.insert("loc".to_string(), loc);
    }

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
            if let Some(loc) = create_loc(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }
            obj.insert("name".to_string(), Value::String(id.name.to_string()));

            // OXC v0.107: type annotations are on VariableDeclarator, not BindingIdentifier
            if let Some(type_ann) = type_annotation {
                let type_ann_value =
                    convert_type_annotation_adjusted(type_ann, offset - 1, line_offsets);
                obj.insert("typeAnnotation".to_string(), type_ann_value);
            }

            Value::Object(obj)
        }
        oxc_ast::ast::BindingPattern::ObjectPattern(obj_pat) => {
            convert_object_pattern(obj_pat, offset - 1, line_offsets)
        }
        oxc_ast::ast::BindingPattern::ArrayPattern(arr_pat) => {
            convert_array_pattern(arr_pat, offset - 1, line_offsets)
        }
        oxc_ast::ast::BindingPattern::AssignmentPattern(assign_pat) => {
            convert_assignment_pattern(assign_pat, offset - 1, line_offsets)
        }
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
    if let Some(loc) = create_loc(start, end, line_offsets) {
        obj.insert("loc".to_string(), loc);
    }

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
    let quasis: Vec<JsNode> = template
        .quasis
        .iter()
        .map(|quasi| {
            let q_start = offset + quasi.span.start as usize - 1;
            let q_end = offset + quasi.span.end as usize - 1;

            JsNode::TemplateElement {
                start: q_start as u32,
                end: q_end as u32,
                loc: create_typed_loc(q_start, q_end, line_offsets),
                tail: quasi.tail,
                value: TemplateElementValue {
                    raw: CompactString::from(quasi.value.raw.as_str()),
                    cooked: quasi
                        .value
                        .cooked
                        .as_ref()
                        .map(|s| CompactString::from(s.as_str())),
                },
            }
        })
        .collect();

    let expressions: Vec<JsNode> = template
        .expressions
        .iter()
        .map(|expr| expr_to_node(convert_expression(expr, offset, line_offsets)))
        .collect();

    Expression::from_node(JsNode::TemplateLiteral {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        quasis,
        expressions,
    })
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

fn update_operator_to_string(op: &oxc_ast::ast::UpdateOperator) -> String {
    use oxc_ast::ast::UpdateOperator::*;
    match op {
        Increment => "++",
        Decrement => "--",
    }
    .to_string()
}

fn create_loc(start: usize, end: usize, line_offsets: &[usize]) -> Option<Value> {
    if line_offsets.is_empty() {
        return None;
    }
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

    Some(Value::Object(loc))
}

/// Create a loc object with character field included.
/// Used for Svelte-level identifiers like snippet names.
#[allow(dead_code)]
fn create_loc_with_character(start: usize, end: usize, line_offsets: &[usize]) -> Option<Value> {
    if line_offsets.is_empty() {
        return None;
    }
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

    Some(Value::Object(loc))
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
fn create_loc_for_binding(start: usize, end: usize, line_offsets: &[usize]) -> Option<Value> {
    if line_offsets.is_empty() {
        return None;
    }
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

    Some(Value::Object(loc))
}

/// Create loc for simple Identifier binding patterns with character field.
/// Uses standard column calculation (0-indexed from line start).
#[allow(dead_code)]
fn create_loc_for_binding_identifier(
    start: usize,
    end: usize,
    line_offsets: &[usize],
) -> Option<Value> {
    if line_offsets.is_empty() {
        return None;
    }
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

    Some(Value::Object(loc))
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
) -> Option<Value> {
    if doc_line_offsets.is_empty() {
        return None;
    }
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

    Some(Value::Object(loc))
}

// ============================================================================
// Typed loc helper functions (return typed_expr::Loc instead of serde_json::Value)
// ============================================================================

fn create_typed_loc(start: usize, end: usize, line_offsets: &[usize]) -> Option<Loc> {
    if line_offsets.is_empty() {
        return None;
    }
    let start_lc = get_line_column(start, line_offsets);
    let end_lc = get_line_column(end, line_offsets);
    Some(Loc {
        start: SourcePosition {
            line: start_lc.0,
            column: start_lc.1,
            character: None,
        },
        end: SourcePosition {
            line: end_lc.0,
            column: end_lc.1,
            character: None,
        },
    })
}

fn create_typed_loc_with_character(
    start: usize,
    end: usize,
    line_offsets: &[usize],
) -> Option<Loc> {
    if line_offsets.is_empty() {
        return None;
    }
    let start_lc = get_line_column(start, line_offsets);
    let end_lc = get_line_column(end, line_offsets);
    Some(Loc {
        start: SourcePosition {
            line: start_lc.0,
            column: start_lc.1,
            character: Some(start as u32),
        },
        end: SourcePosition {
            line: end_lc.0,
            column: end_lc.1,
            character: Some(end as u32),
        },
    })
}

fn create_typed_loc_for_binding(start: usize, end: usize, line_offsets: &[usize]) -> Option<Loc> {
    if line_offsets.is_empty() {
        return None;
    }
    let start_lc = get_line_column_for_binding(start, line_offsets);
    let end_lc = get_line_column_for_binding(end, line_offsets);
    Some(Loc {
        start: SourcePosition {
            line: start_lc.0,
            column: start_lc.1,
            character: None,
        },
        end: SourcePosition {
            line: end_lc.0,
            column: end_lc.1,
            character: None,
        },
    })
}

fn create_typed_loc_for_binding_identifier(
    start: usize,
    end: usize,
    line_offsets: &[usize],
) -> Option<Loc> {
    if line_offsets.is_empty() {
        return None;
    }
    let start_line = line_offsets
        .partition_point(|&offset| offset <= start)
        .saturating_sub(1);
    let end_line = line_offsets
        .partition_point(|&offset| offset <= end)
        .saturating_sub(1);
    let start_line_offset = line_offsets.get(start_line).copied().unwrap_or(0);
    let end_line_offset = line_offsets.get(end_line).copied().unwrap_or(0);
    Some(Loc {
        start: SourcePosition {
            line: (start_line + 1) as u32,
            column: (start - start_line_offset) as u32,
            character: Some(start as u32),
        },
        end: SourcePosition {
            line: (end_line + 1) as u32,
            column: (end - end_line_offset) as u32,
            character: Some(end as u32),
        },
    })
}

#[allow(dead_code)]
fn create_typed_loc_for_script(
    script_tag_start: usize,
    script_tag_end: usize,
    doc_line_offsets: &[usize],
) -> Option<Loc> {
    if doc_line_offsets.is_empty() {
        return None;
    }
    let start_lc = get_line_column(script_tag_start, doc_line_offsets);
    let end_lc = get_line_column(script_tag_end, doc_line_offsets);
    Some(Loc {
        start: SourcePosition {
            line: start_lc.0,
            column: start_lc.1,
            character: None,
        },
        end: SourcePosition {
            line: end_lc.0,
            column: end_lc.1,
            character: None,
        },
    })
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
    with_oxc_allocator(|allocator| {
        let source_type = if is_typescript {
            SourceType::ts()
        } else {
            SourceType::mjs()
        };
        let parser = OxcParser::new(allocator, content, source_type);
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
        if let Some(loc) = create_loc_for_script(script_tag_start, script_tag_end, line_offsets) {
            obj.insert("loc".to_string(), loc);
        }

        // Convert body statements and attach leading comments to each statement.
        // The official Svelte compiler (via acorn) attaches leadingComments to AST nodes.
        // OXC stores all comments at the program level, so we distribute them here.
        let all_comments: Vec<_> = result.program.comments.iter().collect();
        let mut comment_idx = 0;
        let has_comments = !all_comments.is_empty();

        let mut body: Vec<Value> = Vec::with_capacity(program.body.len());
        for stmt in program.body.iter() {
            if let Some(stmt_node) = convert_statement_for_program(stmt, offset, line_offsets) {
                if has_comments {
                    let stmt_start = stmt.span().start;

                    // Collect comments that appear before this statement
                    let mut leading = Vec::new();
                    while comment_idx < all_comments.len()
                        && all_comments[comment_idx].span.end <= stmt_start
                    {
                        let comment = all_comments[comment_idx];
                        leading.push(build_comment_value(comment, content, offset));
                        comment_idx += 1;
                    }

                    // Skip comments that are inside the statement
                    while comment_idx < all_comments.len()
                        && all_comments[comment_idx].span.start < stmt.span().end
                    {
                        comment_idx += 1;
                    }

                    if !leading.is_empty() {
                        // Only convert to Value when we need to attach comments
                        let mut stmt_value = stmt_node.to_value();
                        if let Value::Object(ref mut obj) = stmt_value {
                            obj.insert("leadingComments".to_string(), Value::Array(leading));
                        }
                        body.push(stmt_value);
                    } else {
                        // No comments - still need Value for the body array
                        body.push(stmt_node.to_value());
                    }
                } else {
                    // No comments at all in the program - fast path
                    body.push(stmt_node.to_value());
                }
            }
        }
        obj.insert("body".to_string(), Value::Array(body));

        obj.insert(
            "sourceType".to_string(),
            Value::String("module".to_string()),
        );

        // Store all comments on the Program as trailingComments (for backward compat)
        if has_comments {
            let comments: Vec<Value> = all_comments
                .iter()
                .map(|comment| build_comment_value(comment, content, offset))
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

        // Post-process: distribute comments to nested statement bodies.
        // The top-level comment distribution only handles Program.body.
        // Comments inside function bodies, if-blocks, etc. are skipped.
        // This step recursively walks the AST and attaches comments to nested statements.
        distribute_comments_to_nested_bodies(&mut obj, &all_comments, content, offset);

        let program_value = Value::Object(obj);

        Expression::Value(program_value)
    })
}

/// Build a comment JSON value from an OXC comment.
fn build_comment_value(comment: &oxc_ast::ast::Comment, content: &str, offset: usize) -> Value {
    let comment_start = offset + comment.span.start as usize;
    let comment_end = offset + comment.span.end as usize;
    let comment_type = match comment.kind {
        oxc_ast::ast::CommentKind::Line => "Line",
        oxc_ast::ast::CommentKind::SingleLineBlock | oxc_ast::ast::CommentKind::MultiLineBlock => {
            "Block"
        }
    };
    let comment_text = if comment_end <= offset + content.len() {
        let raw = &content[comment.span.start as usize..comment.span.end as usize];
        match comment.kind {
            oxc_ast::ast::CommentKind::Line => raw.strip_prefix("//").unwrap_or(raw).to_string(),
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

    let mut comment_obj = Map::new();
    comment_obj.insert("type".to_string(), Value::String(comment_type.to_string()));
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
}

/// Recursively distribute comments to nested statement bodies.
///
/// OXC stores all comments at the program level. The main distribution loop
/// only attaches comments to top-level Program.body statements. This function
/// walks the entire AST and attaches leading comments to statements inside
/// function bodies, if-blocks, loops, etc.
fn distribute_comments_to_nested_bodies(
    program_obj: &mut Map<String, Value>,
    all_comments: &[&oxc_ast::ast::Comment],
    content: &str,
    offset: usize,
) {
    // Build a list of pre-computed comment entries with positions extracted upfront.
    // Comments from OXC are already sorted by position, which enables binary search.
    let comment_entries: Vec<CommentEntry> = all_comments
        .iter()
        .map(|comment| {
            let comment_start = offset + comment.span.start as usize;
            let comment_end = offset + comment.span.end as usize;
            CommentEntry {
                start: comment_start as u32,
                end: comment_end as u32,
                value: build_comment_value(comment, content, offset),
            }
        })
        .collect();

    // Recursively walk the AST and distribute comments in-place
    if let Some(body) = program_obj.get_mut("body") {
        distribute_comments_to_body(body, &comment_entries);
    }
}

/// A pre-computed comment entry with positions extracted to avoid repeated Value lookups.
struct CommentEntry {
    start: u32,
    end: u32,
    value: Value,
}

/// Distribute comments to statements in a body array, then recurse into nested bodies.
fn distribute_comments_to_body(body: &mut Value, comments: &[CommentEntry]) {
    if let Some(stmts) = body.as_array_mut() {
        for stmt in stmts.iter_mut() {
            // Recurse into nested bodies of this statement
            distribute_comments_to_node(stmt, comments);
        }
    }
}

/// Recursively walk a node and distribute comments to any nested statement bodies.
///
/// This function operates entirely in-place: it never clones statement Values.
/// Comments are attached by inserting `leadingComments` directly into existing
/// statement Map objects via mutable references.
fn distribute_comments_to_node(node: &mut Value, comments: &[CommentEntry]) {
    let Some(obj) = node.as_object_mut() else {
        return;
    };

    let node_type = obj
        .get("type")
        .and_then(|t| t.as_str())
        .unwrap_or("")
        .to_string();

    // For nodes that contain statement bodies, distribute comments to those bodies.
    // These are the fields that contain arrays of statements.
    let body_fields: &[&str] = match node_type.as_str() {
        "BlockStatement" | "Program" => &["body"],
        "SwitchCase" => &["consequent"],
        "SwitchStatement" => &["cases"],
        "TryStatement" => &["block", "handler", "finalizer"],
        _ => &[],
    };

    for &field in body_fields {
        if let Some(stmts) = obj.get_mut(field).and_then(|v| v.as_array_mut()) {
            let mut prev_end: u32 = 0;
            for stmt in stmts.iter_mut() {
                if let Some(stmt_obj) = stmt.as_object_mut() {
                    // Check if this statement doesn't already have leadingComments
                    if !stmt_obj.contains_key("leadingComments") {
                        let stmt_start =
                            stmt_obj.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as u32;

                        // Use binary search to find the first comment that could be relevant
                        // (comment.end > prev_end). Comments are sorted by position.
                        let search_start = comments.partition_point(|c| c.end <= prev_end);

                        let mut leading = Vec::new();
                        for comment in &comments[search_start..] {
                            // Once comment end exceeds statement start, no more matches
                            if comment.end > stmt_start {
                                break;
                            }
                            // Comment must start after previous statement end
                            if comment.start >= prev_end {
                                leading.push(comment.value.clone());
                            }
                        }

                        if !leading.is_empty() {
                            stmt_obj.insert("leadingComments".to_string(), Value::Array(leading));
                        }
                    }

                    // Track prev_end for the next iteration
                    prev_end = stmt_obj.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as u32;
                }
            }
        }
    }

    // Recurse into child nodes that might contain nested bodies.
    // We use &str slices to avoid String allocations.
    let child_fields: &[&str] = match node_type.as_str() {
        "FunctionDeclaration" | "FunctionExpression" | "ArrowFunctionExpression" => &["body"],
        "IfStatement" => &["consequent", "alternate"],
        "ForStatement" | "ForInStatement" | "ForOfStatement" | "WhileStatement"
        | "DoWhileStatement" => &["body"],
        "TryStatement" => &["block", "handler", "finalizer"],
        "CatchClause" => &["body"],
        "WithStatement" => &["body"],
        "LabeledStatement" => &["body"],
        "SwitchStatement" => &["cases"],
        "SwitchCase" => &["consequent"],
        "BlockStatement" | "Program" => &["body"],
        "ExportNamedDeclaration" | "ExportDefaultDeclaration" => &["declaration"],
        "VariableDeclaration" => &["declarations"],
        "ClassDeclaration" | "ClassExpression" => &["body"],
        "ClassBody" => &["body"],
        "MethodDefinition" | "PropertyDefinition" => &["value"],
        _ => &[],
    };

    for &field in child_fields {
        if let Some(child) = obj.get_mut(field) {
            if child.is_array() {
                if let Some(items) = child.as_array_mut() {
                    for item in items {
                        distribute_comments_to_node(item, comments);
                    }
                }
            } else if child.is_object() {
                distribute_comments_to_node(child, comments);
            }
        }
    }
}

/// Convert a statement to JSON value (for program context, no -1 offset adjustment).
fn convert_statement_for_program(
    stmt: &oxc_ast::ast::Statement,
    offset: usize,
    line_offsets: &[usize],
) -> Option<JsNode> {
    match stmt {
        oxc_ast::ast::Statement::ExpressionStatement(expr_stmt) => {
            let expr = convert_expression_for_program(&expr_stmt.expression, offset, line_offsets);
            let start = offset + expr_stmt.span.start as usize;
            let end = offset + expr_stmt.span.end as usize;
            let loc = create_typed_loc(start, end, line_offsets);
            Some(JsNode::ExpressionStatement {
                start: start as u32,
                end: end as u32,
                loc,
                expression: Box::new(expr_to_node(expr)),
            })
        }
        oxc_ast::ast::Statement::VariableDeclaration(var_decl) => {
            let start = offset + var_decl.span.start as usize;
            let end = offset + var_decl.span.end as usize;
            let loc = create_typed_loc(start, end, line_offsets);

            let declarations: Vec<JsNode> = var_decl
                .declarations
                .iter()
                .filter_map(|decl| {
                    convert_variable_declarator_for_program(decl, offset, line_offsets)
                })
                .collect();

            let kind = match var_decl.kind {
                oxc_ast::ast::VariableDeclarationKind::Var => "var",
                oxc_ast::ast::VariableDeclarationKind::Let => "let",
                oxc_ast::ast::VariableDeclarationKind::Const => "const",
                oxc_ast::ast::VariableDeclarationKind::Using => "using",
                oxc_ast::ast::VariableDeclarationKind::AwaitUsing => "await using",
            };

            Some(JsNode::VariableDeclaration {
                start: start as u32,
                end: end as u32,
                loc,
                declarations,
                kind: CompactString::from(kind),
                declare: var_decl.declare,
            })
        }
        oxc_ast::ast::Statement::FunctionDeclaration(func_decl) => {
            // Filter out TypeScript declare functions and function overload signatures (no body)
            if func_decl.r#type == oxc_ast::ast::FunctionType::TSDeclareFunction
                || func_decl.body.is_none()
            {
                return None;
            }
            let start = offset + func_decl.span.start as usize;
            let end = offset + func_decl.span.end as usize;
            let loc = create_typed_loc(start, end, line_offsets);

            let id_node = func_decl.id.as_ref().map(|id| {
                let id_start = offset + id.span.start as usize;
                let id_end = offset + id.span.end as usize;
                let id_expr = create_identifier(&id.name, id_start, id_end, line_offsets);
                Box::new(expr_to_node(id_expr))
            });

            // Convert params
            let params: Vec<JsNode> = func_decl
                .params
                .items
                .iter()
                .map(|param| expr_to_node(convert_formal_parameter(param, offset, line_offsets)))
                .collect();

            // Convert body
            let body_node = func_decl.body.as_ref().map(|body| {
                Box::new(convert_function_body_for_program_as_node(
                    body,
                    offset,
                    line_offsets,
                ))
            });

            Some(JsNode::FunctionDeclaration {
                start: start as u32,
                end: end as u32,
                loc,
                id: id_node,
                params,
                body: body_node,
                generator: func_decl.generator,
                r#async: func_decl.r#async,
            })
        }
        oxc_ast::ast::Statement::ExportNamedDeclaration(export_decl) => {
            let start = offset + export_decl.span.start as usize;
            let end = offset + export_decl.span.end as usize;
            let loc = create_typed_loc(start, end, line_offsets);

            // Handle declaration if present (e.g., export let x;)
            let declaration = export_decl.declaration.as_ref().map(|decl| {
                let decl_value = convert_declaration_for_program(decl, offset, line_offsets);
                Box::new(JsNode::Raw(decl_value))
            });

            // Handle specifiers
            let specifiers: Vec<JsNode> = export_decl
                .specifiers
                .iter()
                .map(|spec| {
                    let spec_start = offset + spec.span.start as usize;
                    let spec_end = offset + spec.span.end as usize;
                    let spec_loc = create_typed_loc(spec_start, spec_end, line_offsets);

                    let local_start = offset + spec.local.span().start as usize;
                    let local_end = offset + spec.local.span().end as usize;
                    let local_name = spec.local.name().as_str();
                    let local = expr_to_node(create_identifier(
                        local_name,
                        local_start,
                        local_end,
                        line_offsets,
                    ));

                    let exported_start = offset + spec.exported.span().start as usize;
                    let exported_end = offset + spec.exported.span().end as usize;
                    let exported_name = spec.exported.name().as_str();
                    let exported = expr_to_node(create_identifier(
                        exported_name,
                        exported_start,
                        exported_end,
                        line_offsets,
                    ));

                    let export_kind = if spec.export_kind == oxc_ast::ast::ImportOrExportKind::Type
                    {
                        Some(CompactString::from("type"))
                    } else {
                        None
                    };

                    JsNode::ExportSpecifier {
                        start: spec_start as u32,
                        end: spec_end as u32,
                        loc: spec_loc,
                        local: Box::new(local),
                        exported: Box::new(exported),
                        export_kind,
                    }
                })
                .collect();

            let export_kind = if export_decl.export_kind == oxc_ast::ast::ImportOrExportKind::Type {
                Some(CompactString::from("type"))
            } else {
                None
            };

            let source = export_decl.source.as_ref().map(|source| {
                let source_start = offset + source.span.start as usize;
                let source_end = offset + source.span.end as usize;
                let raw = source.raw.as_ref().map(|a| a.as_str()).unwrap_or("");
                Box::new(expr_to_node(create_string_literal(
                    &source.value,
                    raw,
                    source_start,
                    source_end,
                    line_offsets,
                )))
            });

            Some(JsNode::ExportNamedDeclaration {
                start: start as u32,
                end: end as u32,
                loc,
                declaration,
                specifiers,
                source,
                export_kind,
                attributes: vec![],
            })
        }
        oxc_ast::ast::Statement::ExportDefaultDeclaration(export_decl) => {
            let start = offset + export_decl.span.start as usize;
            let end = offset + export_decl.span.end as usize;
            let loc = create_typed_loc(start, end, line_offsets);

            // Handle declaration (the exported value)
            let declaration = match &export_decl.declaration {
                oxc_ast::ast::ExportDefaultDeclarationKind::FunctionDeclaration(func_decl) => {
                    let func_start = offset + func_decl.span.start as usize;
                    let func_end = offset + func_decl.span.end as usize;
                    let func_loc = create_typed_loc(func_start, func_end, line_offsets);

                    let id_node = func_decl.id.as_ref().map(|id| {
                        let id_start = offset + id.span.start as usize;
                        let id_end = offset + id.span.end as usize;
                        Box::new(expr_to_node(create_identifier(
                            &id.name,
                            id_start,
                            id_end,
                            line_offsets,
                        )))
                    });

                    let params: Vec<JsNode> = func_decl
                        .params
                        .items
                        .iter()
                        .map(|param| {
                            expr_to_node(convert_formal_parameter(param, offset, line_offsets))
                        })
                        .collect();

                    let body_node = func_decl.body.as_ref().map(|body| {
                        Box::new(convert_function_body_for_program_as_node(
                            body,
                            offset,
                            line_offsets,
                        ))
                    });

                    JsNode::FunctionDeclaration {
                        start: func_start as u32,
                        end: func_end as u32,
                        loc: func_loc,
                        id: id_node,
                        params,
                        body: body_node,
                        generator: func_decl.generator,
                        r#async: func_decl.r#async,
                    }
                }
                oxc_ast::ast::ExportDefaultDeclarationKind::ClassDeclaration(class_decl) => {
                    // Class declarations in export default are complex, use Raw fallback
                    let class_start = offset + class_decl.span.start as usize;
                    let class_end = offset + class_decl.span.end as usize;
                    let mut class_obj = Map::new();
                    class_obj.insert(
                        "type".to_string(),
                        Value::String("ClassDeclaration".to_string()),
                    );
                    class_obj.insert(
                        "start".to_string(),
                        Value::Number((class_start as i64).into()),
                    );
                    class_obj.insert("end".to_string(), Value::Number((class_end as i64).into()));
                    if let Some(loc) = create_loc(class_start, class_end, line_offsets) {
                        class_obj.insert("loc".to_string(), loc);
                    }

                    if let Some(id) = &class_decl.id {
                        let id_start = offset + id.span.start as usize;
                        let id_end = offset + id.span.end as usize;
                        let id_expr = create_identifier(&id.name, id_start, id_end, line_offsets);
                        class_obj.insert("id".to_string(), id_expr.as_json().clone());
                    } else {
                        class_obj.insert("id".to_string(), Value::Null);
                    }

                    if let Some(super_class) = &class_decl.super_class {
                        let super_expr =
                            convert_expression_for_program(super_class, offset, line_offsets);
                        class_obj.insert("superClass".to_string(), super_expr.as_json().clone());
                    } else {
                        class_obj.insert("superClass".to_string(), Value::Null);
                    }

                    let body =
                        convert_class_body_for_program(&class_decl.body, offset, line_offsets);
                    class_obj.insert("body".to_string(), body);

                    JsNode::Raw(Value::Object(class_obj))
                }
                oxc_ast::ast::ExportDefaultDeclarationKind::TSInterfaceDeclaration(_) => {
                    JsNode::Null
                }
                _ => {
                    if let Some(expr) = export_decl.declaration.as_expression() {
                        expr_to_node(convert_expression_for_program(expr, offset, line_offsets))
                    } else {
                        JsNode::Null
                    }
                }
            };

            Some(JsNode::ExportDefaultDeclaration {
                start: start as u32,
                end: end as u32,
                loc,
                declaration: Box::new(declaration),
            })
        }
        oxc_ast::ast::Statement::ImportDeclaration(import_decl) => {
            let start = offset + import_decl.span.start as usize;
            let end = offset + import_decl.span.end as usize;
            let loc = create_typed_loc(start, end, line_offsets);

            let specifiers: Vec<JsNode> = import_decl
                .specifiers
                .as_ref()
                .map(|specs| {
                    specs
                        .iter()
                        .map(|spec| convert_import_specifier(spec, offset, line_offsets))
                        .collect()
                })
                .unwrap_or_default();

            let source_lit = &import_decl.source;
            let source_start = offset + source_lit.span.start as usize;
            let source_end = offset + source_lit.span.end as usize;
            let raw = source_lit.raw.as_ref().map(|a| a.as_str()).unwrap_or("");
            let source = expr_to_node(create_string_literal(
                &source_lit.value,
                raw,
                source_start,
                source_end,
                line_offsets,
            ));

            let import_kind = if import_decl.import_kind == oxc_ast::ast::ImportOrExportKind::Type {
                Some(CompactString::from("type"))
            } else {
                None
            };

            Some(JsNode::ImportDeclaration {
                start: start as u32,
                end: end as u32,
                loc,
                specifiers,
                source: Box::new(source),
                import_kind,
                attributes: vec![],
            })
        }
        oxc_ast::ast::Statement::IfStatement(if_stmt) => {
            let start = offset + if_stmt.span.start as usize;
            let end = offset + if_stmt.span.end as usize;
            let loc = create_typed_loc(start, end, line_offsets);

            let test = convert_expression_for_program(&if_stmt.test, offset, line_offsets);
            let consequent =
                convert_statement_for_program(&if_stmt.consequent, offset, line_offsets);
            let alternate = if_stmt
                .alternate
                .as_ref()
                .and_then(|alt| convert_statement_for_program(alt, offset, line_offsets));

            Some(JsNode::IfStatement {
                start: start as u32,
                end: end as u32,
                loc,
                test: Box::new(expr_to_node(test)),
                consequent: Box::new(consequent.unwrap_or(JsNode::Null)),
                alternate: alternate.map(Box::new),
            })
        }
        oxc_ast::ast::Statement::BlockStatement(block_stmt) => {
            let start = offset + block_stmt.span.start as usize;
            let end = offset + block_stmt.span.end as usize;
            let loc = create_typed_loc(start, end, line_offsets);

            let body: Vec<JsNode> = block_stmt
                .body
                .iter()
                .filter_map(|stmt| convert_statement_for_program(stmt, offset, line_offsets))
                .collect();

            Some(JsNode::BlockStatement {
                start: start as u32,
                end: end as u32,
                loc,
                body,
            })
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
            if let Some(loc) = create_loc(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }

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

            // TypeScript: declare field
            if class_decl.declare {
                obj.insert("declare".to_string(), Value::Bool(true));
            }

            // TypeScript: abstract field
            if class_decl.r#abstract {
                obj.insert("abstract".to_string(), Value::Bool(true));
            }

            // TypeScript: implements (presence indicates it should be removed by remove_typescript_nodes)
            if !class_decl.implements.is_empty() {
                obj.insert("implements".to_string(), Value::Bool(true));
            }

            // Decorators: include so remove_typescript_nodes can detect them
            if !class_decl.decorators.is_empty() {
                let decorators: Vec<Value> = class_decl
                    .decorators
                    .iter()
                    .map(|dec| {
                        let dec_start = offset + dec.span.start as usize;
                        let dec_end = offset + dec.span.end as usize;
                        let mut dec_obj = Map::new();
                        dec_obj.insert("type".to_string(), Value::String("Decorator".to_string()));
                        dec_obj.insert(
                            "start".to_string(),
                            Value::Number((dec_start as i64).into()),
                        );
                        dec_obj.insert("end".to_string(), Value::Number((dec_end as i64).into()));
                        Value::Object(dec_obj)
                    })
                    .collect();
                obj.insert("decorators".to_string(), Value::Array(decorators));
            }

            Some(JsNode::Raw(Value::Object(obj)))
        }
        oxc_ast::ast::Statement::ReturnStatement(ret_stmt) => {
            let start = offset + ret_stmt.span.start as usize;
            let end = offset + ret_stmt.span.end as usize;
            let loc = create_typed_loc(start, end, line_offsets);

            let argument = ret_stmt.argument.as_ref().map(|arg| {
                Box::new(expr_to_node(convert_expression_for_program(
                    arg,
                    offset,
                    line_offsets,
                )))
            });

            Some(JsNode::ReturnStatement {
                start: start as u32,
                end: end as u32,
                loc,
                argument,
            })
        }
        oxc_ast::ast::Statement::ForStatement(for_stmt) => {
            let start = offset + for_stmt.span.start as usize;
            let end = offset + for_stmt.span.end as usize;
            let loc = create_typed_loc(start, end, line_offsets);

            let init = for_stmt.init.as_ref().map(|init| match init {
                oxc_ast::ast::ForStatementInit::VariableDeclaration(vd) => Box::new(
                    convert_variable_declaration_as_node(vd, offset, line_offsets),
                ),
                _ => {
                    if let Some(expr) = init.as_expression() {
                        Box::new(expr_to_node(convert_expression_for_program(
                            expr,
                            offset,
                            line_offsets,
                        )))
                    } else {
                        Box::new(JsNode::Null)
                    }
                }
            });

            let test = for_stmt.test.as_ref().map(|test| {
                Box::new(expr_to_node(convert_expression_for_program(
                    test,
                    offset,
                    line_offsets,
                )))
            });

            let update = for_stmt.update.as_ref().map(|update| {
                Box::new(expr_to_node(convert_expression_for_program(
                    update,
                    offset,
                    line_offsets,
                )))
            });

            let body = convert_statement_for_program(&for_stmt.body, offset, line_offsets)
                .unwrap_or(JsNode::Null);

            Some(JsNode::ForStatement {
                start: start as u32,
                end: end as u32,
                loc,
                init,
                test,
                update,
                body: Box::new(body),
            })
        }
        oxc_ast::ast::Statement::ForOfStatement(for_of_stmt) => {
            let start = offset + for_of_stmt.span.start as usize;
            let end = offset + for_of_stmt.span.end as usize;
            let loc = create_typed_loc(start, end, line_offsets);

            let left = match &for_of_stmt.left {
                oxc_ast::ast::ForStatementLeft::VariableDeclaration(vd) => {
                    convert_variable_declaration_as_node(vd, offset, line_offsets)
                }
                _ => JsNode::Null,
            };

            let right = expr_to_node(convert_expression_for_program(
                &for_of_stmt.right,
                offset,
                line_offsets,
            ));

            let body = convert_statement_for_program(&for_of_stmt.body, offset, line_offsets)
                .unwrap_or(JsNode::Null);

            Some(JsNode::ForOfStatement {
                start: start as u32,
                end: end as u32,
                loc,
                r#await: for_of_stmt.r#await,
                left: Box::new(left),
                right: Box::new(right),
                body: Box::new(body),
            })
        }
        oxc_ast::ast::Statement::ForInStatement(for_in_stmt) => {
            let start = offset + for_in_stmt.span.start as usize;
            let end = offset + for_in_stmt.span.end as usize;
            let loc = create_typed_loc(start, end, line_offsets);

            let left = match &for_in_stmt.left {
                oxc_ast::ast::ForStatementLeft::VariableDeclaration(vd) => {
                    convert_variable_declaration_as_node(vd, offset, line_offsets)
                }
                _ => JsNode::Null,
            };

            let right = expr_to_node(convert_expression_for_program(
                &for_in_stmt.right,
                offset,
                line_offsets,
            ));

            let body = convert_statement_for_program(&for_in_stmt.body, offset, line_offsets)
                .unwrap_or(JsNode::Null);

            Some(JsNode::ForInStatement {
                start: start as u32,
                end: end as u32,
                loc,
                left: Box::new(left),
                right: Box::new(right),
                body: Box::new(body),
            })
        }
        oxc_ast::ast::Statement::WhileStatement(while_stmt) => {
            let start = offset + while_stmt.span.start as usize;
            let end = offset + while_stmt.span.end as usize;
            let loc = create_typed_loc(start, end, line_offsets);

            let test = expr_to_node(convert_expression_for_program(
                &while_stmt.test,
                offset,
                line_offsets,
            ));

            let body = convert_statement_for_program(&while_stmt.body, offset, line_offsets)
                .unwrap_or(JsNode::Null);

            Some(JsNode::WhileStatement {
                start: start as u32,
                end: end as u32,
                loc,
                test: Box::new(test),
                body: Box::new(body),
            })
        }
        oxc_ast::ast::Statement::TryStatement(try_stmt) => {
            let start = offset + try_stmt.span.start as usize;
            let end = offset + try_stmt.span.end as usize;
            let loc = create_typed_loc(start, end, line_offsets);

            // block
            let block_start = offset + try_stmt.block.span.start as usize;
            let block_end = offset + try_stmt.block.span.end as usize;
            let block_loc = create_typed_loc(block_start, block_end, line_offsets);
            let block_body: Vec<JsNode> = try_stmt
                .block
                .body
                .iter()
                .filter_map(|stmt| convert_statement_for_program(stmt, offset, line_offsets))
                .collect();
            let block = JsNode::BlockStatement {
                start: block_start as u32,
                end: block_end as u32,
                loc: block_loc,
                body: block_body,
            };

            // handler
            let handler = try_stmt.handler.as_ref().map(|handler| {
                let handler_start = offset + handler.span.start as usize;
                let handler_end = offset + handler.span.end as usize;
                let handler_loc = create_typed_loc(handler_start, handler_end, line_offsets);

                let param = handler.param.as_ref().map(|param| {
                    let param_value = convert_binding_pattern(&param.pattern, offset, line_offsets);
                    Box::new(JsNode::Raw(param_value))
                });

                let body_start = offset + handler.body.span.start as usize;
                let body_end = offset + handler.body.span.end as usize;
                let body_loc = create_typed_loc(body_start, body_end, line_offsets);
                let body_stmts: Vec<JsNode> = handler
                    .body
                    .body
                    .iter()
                    .filter_map(|stmt| convert_statement_for_program(stmt, offset, line_offsets))
                    .collect();
                let body = JsNode::BlockStatement {
                    start: body_start as u32,
                    end: body_end as u32,
                    loc: body_loc,
                    body: body_stmts,
                };

                Box::new(JsNode::CatchClause {
                    start: handler_start as u32,
                    end: handler_end as u32,
                    loc: handler_loc,
                    param,
                    body: Box::new(body),
                })
            });

            // finalizer
            let finalizer = try_stmt.finalizer.as_ref().map(|finalizer| {
                let finalizer_start = offset + finalizer.span.start as usize;
                let finalizer_end = offset + finalizer.span.end as usize;
                let finalizer_loc = create_typed_loc(finalizer_start, finalizer_end, line_offsets);
                let body_stmts: Vec<JsNode> = finalizer
                    .body
                    .iter()
                    .filter_map(|stmt| convert_statement_for_program(stmt, offset, line_offsets))
                    .collect();
                Box::new(JsNode::BlockStatement {
                    start: finalizer_start as u32,
                    end: finalizer_end as u32,
                    loc: finalizer_loc,
                    body: body_stmts,
                })
            });

            Some(JsNode::TryStatement {
                start: start as u32,
                end: end as u32,
                loc,
                block: Box::new(block),
                handler,
                finalizer,
            })
        }
        oxc_ast::ast::Statement::ThrowStatement(throw_stmt) => {
            let start = offset + throw_stmt.span.start as usize;
            let end = offset + throw_stmt.span.end as usize;
            let loc = create_typed_loc(start, end, line_offsets);

            let argument = expr_to_node(convert_expression_for_program(
                &throw_stmt.argument,
                offset,
                line_offsets,
            ));

            Some(JsNode::ThrowStatement {
                start: start as u32,
                end: end as u32,
                loc,
                argument: Box::new(argument),
            })
        }
        oxc_ast::ast::Statement::BreakStatement(break_stmt) => {
            let start = offset + break_stmt.span.start as usize;
            let end = offset + break_stmt.span.end as usize;
            let loc = create_typed_loc(start, end, line_offsets);

            let label = break_stmt.label.as_ref().map(|label| {
                let label_start = offset + label.span.start as usize;
                let label_end = offset + label.span.end as usize;
                Box::new(expr_to_node(create_identifier(
                    &label.name,
                    label_start,
                    label_end,
                    line_offsets,
                )))
            });

            Some(JsNode::BreakStatement {
                start: start as u32,
                end: end as u32,
                loc,
                label,
            })
        }
        oxc_ast::ast::Statement::ContinueStatement(continue_stmt) => {
            let start = offset + continue_stmt.span.start as usize;
            let end = offset + continue_stmt.span.end as usize;
            let loc = create_typed_loc(start, end, line_offsets);

            let label = continue_stmt.label.as_ref().map(|label| {
                let label_start = offset + label.span.start as usize;
                let label_end = offset + label.span.end as usize;
                Box::new(expr_to_node(create_identifier(
                    &label.name,
                    label_start,
                    label_end,
                    line_offsets,
                )))
            });

            Some(JsNode::ContinueStatement {
                start: start as u32,
                end: end as u32,
                loc,
                label,
            })
        }
        oxc_ast::ast::Statement::SwitchStatement(switch_stmt) => {
            let start = offset + switch_stmt.span.start as usize;
            let end = offset + switch_stmt.span.end as usize;
            let loc = create_typed_loc(start, end, line_offsets);

            let discriminant = expr_to_node(convert_expression(
                &switch_stmt.discriminant,
                offset,
                line_offsets,
            ));

            let cases: Vec<JsNode> = switch_stmt
                .cases
                .iter()
                .map(|case| {
                    let case_start = offset + case.span.start as usize;
                    let case_end = offset + case.span.end as usize;
                    let case_loc = create_typed_loc(case_start, case_end, line_offsets);

                    let test = case.test.as_ref().map(|test| {
                        Box::new(expr_to_node(convert_expression(test, offset, line_offsets)))
                    });

                    let consequent: Vec<JsNode> = case
                        .consequent
                        .iter()
                        .filter_map(|stmt| {
                            convert_statement_for_program(stmt, offset, line_offsets)
                        })
                        .collect();

                    JsNode::SwitchCase {
                        start: case_start as u32,
                        end: case_end as u32,
                        loc: case_loc,
                        test,
                        consequent,
                    }
                })
                .collect();

            Some(JsNode::SwitchStatement {
                start: start as u32,
                end: end as u32,
                loc,
                discriminant: Box::new(discriminant),
                cases,
            })
        }
        oxc_ast::ast::Statement::DoWhileStatement(do_while_stmt) => {
            let start = offset + do_while_stmt.span.start as usize;
            let end = offset + do_while_stmt.span.end as usize;
            let loc = create_typed_loc(start, end, line_offsets);

            let test = expr_to_node(convert_expression(
                &do_while_stmt.test,
                offset,
                line_offsets,
            ));

            let body = convert_statement_for_program(&do_while_stmt.body, offset, line_offsets)
                .unwrap_or(JsNode::Null);

            Some(JsNode::DoWhileStatement {
                start: start as u32,
                end: end as u32,
                loc,
                test: Box::new(test),
                body: Box::new(body),
            })
        }
        oxc_ast::ast::Statement::LabeledStatement(labeled_stmt) => {
            let start = offset + labeled_stmt.span.start as usize;
            let end = offset + labeled_stmt.span.end as usize;
            let loc = create_typed_loc(start, end, line_offsets);

            let label_start = offset + labeled_stmt.label.span.start as usize;
            let label_end = offset + labeled_stmt.label.span.end as usize;
            let label = expr_to_node(create_identifier(
                &labeled_stmt.label.name,
                label_start,
                label_end,
                line_offsets,
            ));

            let body = convert_statement_for_program(&labeled_stmt.body, offset, line_offsets)
                .unwrap_or(JsNode::Null);

            Some(JsNode::LabeledStatement {
                start: start as u32,
                end: end as u32,
                loc,
                label: Box::new(label),
                body: Box::new(body),
            })
        }
        oxc_ast::ast::Statement::EmptyStatement(empty_stmt) => {
            let start = offset + empty_stmt.span.start as usize;
            let end = offset + empty_stmt.span.end as usize;
            let loc = create_typed_loc(start, end, line_offsets);

            Some(JsNode::EmptyStatement {
                start: start as u32,
                end: end as u32,
                loc,
            })
        }
        oxc_ast::ast::Statement::DebuggerStatement(debugger_stmt) => {
            let start = offset + debugger_stmt.span.start as usize;
            let end = offset + debugger_stmt.span.end as usize;
            let loc = create_typed_loc(start, end, line_offsets);

            Some(JsNode::DebuggerStatement {
                start: start as u32,
                end: end as u32,
                loc,
            })
        }
        // TypeScript enum declarations - emit as TSEnumDeclaration so remove_typescript_nodes can detect them
        oxc_ast::ast::Statement::TSEnumDeclaration(enum_decl) => {
            let start = offset + enum_decl.span.start as usize;
            let end = offset + enum_decl.span.end as usize;
            let loc = create_typed_loc(start, end, line_offsets);
            Some(JsNode::TSEnumDeclaration {
                start: start as u32,
                end: end as u32,
                loc,
            })
        }

        // TypeScript module/namespace declarations - emit so remove_typescript_nodes can detect them
        oxc_ast::ast::Statement::TSModuleDeclaration(module_decl) => {
            let start = offset + module_decl.span.start as usize;
            let end = offset + module_decl.span.end as usize;
            let loc = create_typed_loc(start, end, line_offsets);

            // Include body so remove_typescript_nodes can check for non-type nodes
            let body = module_decl.body.as_ref().and_then(|body| {
                match body {
                    oxc_ast::ast::TSModuleDeclarationBody::TSModuleBlock(block) => {
                        let block_body: Vec<JsNode> = block
                            .body
                            .iter()
                            .filter_map(|stmt| {
                                convert_statement_for_program(stmt, offset, line_offsets)
                            })
                            .collect();
                        // Structure: node.body = { body: [...statements...] }
                        // TSModuleDeclaration body is a wrapper with inner body
                        Some(Box::new(JsNode::BlockStatement {
                            start: start as u32,
                            end: end as u32,
                            loc: loc.clone(),
                            body: block_body,
                        }))
                    }
                    oxc_ast::ast::TSModuleDeclarationBody::TSModuleDeclaration(_inner) => {
                        // Nested module declaration - just include empty body
                        None
                    }
                }
            });

            Some(JsNode::TSModuleDeclaration {
                start: start as u32,
                end: end as u32,
                loc,
                body,
            })
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
            if let Some(loc) = create_loc(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }

            let declarations: Vec<Value> = var_decl
                .declarations
                .iter()
                .filter_map(|d| convert_variable_declarator_for_program(d, offset, line_offsets))
                .map(|n| n.to_value())
                .collect();
            obj.insert("declarations".to_string(), Value::Array(declarations));

            let kind = match var_decl.kind {
                oxc_ast::ast::VariableDeclarationKind::Var => "var",
                oxc_ast::ast::VariableDeclarationKind::Let => "let",
                oxc_ast::ast::VariableDeclarationKind::Const => "const",
                oxc_ast::ast::VariableDeclarationKind::Using => "using",
                oxc_ast::ast::VariableDeclarationKind::AwaitUsing => "await using",
            };
            obj.insert("kind".to_string(), Value::String(kind.to_string()));

            // declare field for TypeScript `declare const/let/var`
            if var_decl.declare {
                obj.insert("declare".to_string(), Value::Bool(true));
            }

            Value::Object(obj)
        }
        oxc_ast::ast::Declaration::FunctionDeclaration(func_decl) => {
            // Filter out TypeScript declare functions (TSDeclareFunction)
            if func_decl.r#type == oxc_ast::ast::FunctionType::TSDeclareFunction {
                // Return an EmptyStatement so remove_typescript_nodes can handle it
                let mut empty_obj = Map::new();
                empty_obj.insert(
                    "type".to_string(),
                    Value::String("EmptyStatement".to_string()),
                );
                return Value::Object(empty_obj);
            }
            // Filter out function overload signatures (no body)
            if func_decl.body.is_none() {
                let mut empty_obj = Map::new();
                empty_obj.insert(
                    "type".to_string(),
                    Value::String("EmptyStatement".to_string()),
                );
                return Value::Object(empty_obj);
            }
            let start = offset + func_decl.span.start as usize;
            let end = offset + func_decl.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("FunctionDeclaration".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            if let Some(loc) = create_loc(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }

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
            if let Some(loc) = create_loc(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }

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

            Value::Object(obj)
        }
        // TypeScript enum declarations
        oxc_ast::ast::Declaration::TSEnumDeclaration(enum_decl) => {
            let start = offset + enum_decl.span.start as usize;
            let end = offset + enum_decl.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("TSEnumDeclaration".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            if let Some(loc) = create_loc(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }
            Value::Object(obj)
        }
        // TypeScript module/namespace declarations
        oxc_ast::ast::Declaration::TSModuleDeclaration(module_decl) => {
            let start = offset + module_decl.span.start as usize;
            let end = offset + module_decl.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("TSModuleDeclaration".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            if let Some(loc) = create_loc(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }

            // Include body for non-type node detection
            if let Some(ref body) = module_decl.body {
                match body {
                    oxc_ast::ast::TSModuleDeclarationBody::TSModuleBlock(block) => {
                        let block_body: Vec<Value> = block
                            .body
                            .iter()
                            .filter_map(|stmt| {
                                convert_statement_for_program(stmt, offset, line_offsets)
                            })
                            .map(|n| n.to_value())
                            .collect();
                        let mut block_obj = Map::new();
                        block_obj.insert("body".to_string(), Value::Array(block_body));
                        obj.insert("body".to_string(), Value::Object(block_obj));
                    }
                    oxc_ast::ast::TSModuleDeclarationBody::TSModuleDeclaration(_inner) => {}
                }
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
) -> JsNode {
    match spec {
        oxc_ast::ast::ImportDeclarationSpecifier::ImportSpecifier(import_spec) => {
            let start = offset + import_spec.span.start as usize;
            let end = offset + import_spec.span.end as usize;
            let loc = create_typed_loc(start, end, line_offsets);

            let imported_start = offset + import_spec.imported.span().start as usize;
            let imported_end = offset + import_spec.imported.span().end as usize;
            let imported_name = import_spec.imported.name().as_str();
            let imported = expr_to_node(create_identifier(
                imported_name,
                imported_start,
                imported_end,
                line_offsets,
            ));

            let local_start = offset + import_spec.local.span.start as usize;
            let local_end = offset + import_spec.local.span.end as usize;
            let local = expr_to_node(create_identifier(
                &import_spec.local.name,
                local_start,
                local_end,
                line_offsets,
            ));

            let import_kind = if import_spec.import_kind == oxc_ast::ast::ImportOrExportKind::Type {
                Some(CompactString::from("type"))
            } else {
                None
            };

            JsNode::ImportSpecifier {
                start: start as u32,
                end: end as u32,
                loc,
                imported: Box::new(imported),
                local: Box::new(local),
                import_kind,
            }
        }
        oxc_ast::ast::ImportDeclarationSpecifier::ImportDefaultSpecifier(default_spec) => {
            let start = offset + default_spec.span.start as usize;
            let end = offset + default_spec.span.end as usize;
            let loc = create_typed_loc(start, end, line_offsets);

            let local_start = offset + default_spec.local.span.start as usize;
            let local_end = offset + default_spec.local.span.end as usize;
            let local = expr_to_node(create_identifier(
                &default_spec.local.name,
                local_start,
                local_end,
                line_offsets,
            ));

            JsNode::ImportDefaultSpecifier {
                start: start as u32,
                end: end as u32,
                loc,
                local: Box::new(local),
            }
        }
        oxc_ast::ast::ImportDeclarationSpecifier::ImportNamespaceSpecifier(ns_spec) => {
            let start = offset + ns_spec.span.start as usize;
            let end = offset + ns_spec.span.end as usize;
            let loc = create_typed_loc(start, end, line_offsets);

            let local_start = offset + ns_spec.local.span.start as usize;
            let local_end = offset + ns_spec.local.span.end as usize;
            let local = expr_to_node(create_identifier(
                &ns_spec.local.name,
                local_start,
                local_end,
                line_offsets,
            ));

            JsNode::ImportNamespaceSpecifier {
                start: start as u32,
                end: end as u32,
                loc,
                local: Box::new(local),
            }
        }
    }
}

/// Convert a VariableDeclaration to JsNode directly (for ForStatement/ForOfStatement/ForInStatement).
fn convert_variable_declaration_as_node(
    vd: &oxc_ast::ast::VariableDeclaration,
    offset: usize,
    line_offsets: &[usize],
) -> JsNode {
    let var_start = offset + vd.span.start as usize;
    let var_end = offset + vd.span.end as usize;
    let loc = create_typed_loc(var_start, var_end, line_offsets);

    let declarations: Vec<JsNode> = vd
        .declarations
        .iter()
        .filter_map(|d| convert_variable_declarator_for_program(d, offset, line_offsets))
        .collect();

    let kind = match vd.kind {
        oxc_ast::ast::VariableDeclarationKind::Var => "var",
        oxc_ast::ast::VariableDeclarationKind::Let => "let",
        oxc_ast::ast::VariableDeclarationKind::Const => "const",
        oxc_ast::ast::VariableDeclarationKind::Using => "using",
        oxc_ast::ast::VariableDeclarationKind::AwaitUsing => "using",
    };

    JsNode::VariableDeclaration {
        start: var_start as u32,
        end: var_end as u32,
        loc,
        declarations,
        kind: CompactString::from(kind),
        declare: vd.declare,
    }
}

/// Convert a variable declarator to JsNode (for program context, no -1 offset adjustment).
fn convert_variable_declarator_for_program(
    decl: &oxc_ast::ast::VariableDeclarator,
    offset: usize,
    line_offsets: &[usize],
) -> Option<JsNode> {
    let start = offset + decl.span.start as usize;
    let end = offset + decl.span.end as usize;
    let loc = create_typed_loc(start, end, line_offsets);

    // Convert the id (pattern) - still returns Value, wrap in JsNode::Raw
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
        if let Some(loc) = create_loc(ts_start, ts_end, line_offsets) {
            ts_obj.insert("loc".to_string(), loc);
        }

        // Convert the actual TypeScript type
        let type_value = convert_ts_type(&type_annotation.type_annotation, offset, line_offsets);
        ts_obj.insert("typeAnnotation".to_string(), type_value);

        id_obj.insert("typeAnnotation".to_string(), Value::Object(ts_obj));

        // Update end position to include type annotation
        id_obj.insert("end".to_string(), Value::Number((ts_end as i64).into()));
        if let Some(loc) = create_loc(
            id_obj.get("start").and_then(|v| v.as_i64()).unwrap_or(0) as usize,
            ts_end,
            line_offsets,
        ) {
            id_obj.insert("loc".to_string(), loc);
        }
    }

    // Use JsNode::Raw for the id to preserve all fields (including typeAnnotation)
    let id_node = Box::new(JsNode::Raw(id_value));

    // Convert init if present
    let init_node = decl.init.as_ref().map(|init| {
        let init_expr = convert_expression_for_program(init, offset, line_offsets);
        Box::new(expr_to_node(init_expr))
    });

    Some(JsNode::VariableDeclarator {
        start: start as u32,
        end: end as u32,
        loc,
        id: id_node,
        init: init_node,
    })
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
            create_literal(
                LiteralValue::Bool(bool_lit.value),
                raw,
                start,
                end,
                line_offsets,
            )
        }
        OxcExpression::NullLiteral(null_lit) => {
            let start = offset + null_lit.span.start as usize;
            let end = offset + null_lit.span.end as usize;
            create_literal(LiteralValue::Null, "null", start, end, line_offsets)
        }
        OxcExpression::CallExpression(call) => {
            let start = offset + call.span.start as usize;
            let end = offset + call.span.end as usize;
            let callee = convert_expression_for_program(&call.callee, offset, line_offsets);

            let args: Vec<JsNode> = call
                .arguments
                .iter()
                .map(|arg| match arg {
                    oxc_ast::ast::Argument::SpreadElement(spread) => {
                        let spread_start = offset + spread.span.start as usize;
                        let spread_end = offset + spread.span.end as usize;
                        JsNode::SpreadElement {
                            start: spread_start as u32,
                            end: spread_end as u32,
                            loc: create_typed_loc(spread_start, spread_end, line_offsets),
                            argument: Box::new(expr_to_node(convert_expression_for_program(
                                &spread.argument,
                                offset,
                                line_offsets,
                            ))),
                        }
                    }
                    _ => {
                        let expr = arg.to_expression();
                        expr_to_node(convert_expression_for_program(expr, offset, line_offsets))
                    }
                })
                .collect();

            Expression::from_node(JsNode::CallExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                callee: Box::new(expr_to_node(callee)),
                arguments: args,
                optional: false,
            })
        }
        OxcExpression::ArrayExpression(arr) => {
            let start = offset + arr.span.start as usize;
            let end = offset + arr.span.end as usize;

            let elements: Vec<Option<JsNode>> = arr
                .elements
                .iter()
                .map(|elem| match elem {
                    oxc_ast::ast::ArrayExpressionElement::SpreadElement(spread) => {
                        let spread_start = offset + spread.span.start as usize;
                        let spread_end = offset + spread.span.end as usize;
                        Some(JsNode::SpreadElement {
                            start: spread_start as u32,
                            end: spread_end as u32,
                            loc: create_typed_loc(spread_start, spread_end, line_offsets),
                            argument: Box::new(expr_to_node(convert_expression_for_program(
                                &spread.argument,
                                offset,
                                line_offsets,
                            ))),
                        })
                    }
                    oxc_ast::ast::ArrayExpressionElement::Elision(_elision) => None,
                    _ => {
                        let expr = elem.to_expression();
                        Some(expr_to_node(convert_expression_for_program(
                            expr,
                            offset,
                            line_offsets,
                        )))
                    }
                })
                .collect();

            Expression::from_node(JsNode::ArrayExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                elements,
            })
        }
        OxcExpression::ObjectExpression(obj_expr) => {
            let start = offset + obj_expr.span.start as usize;
            let end = offset + obj_expr.span.end as usize;

            let properties: Vec<JsNode> = obj_expr
                .properties
                .iter()
                .map(|prop| match prop {
                    oxc_ast::ast::ObjectPropertyKind::ObjectProperty(p) => {
                        let prop_start = offset + p.span.start as usize;
                        let prop_end = offset + p.span.end as usize;
                        let key = convert_property_key(&p.key, offset, line_offsets);
                        let value = convert_expression_for_program(&p.value, offset, line_offsets);
                        let kind = match p.kind {
                            oxc_ast::ast::PropertyKind::Init => "init",
                            oxc_ast::ast::PropertyKind::Get => "get",
                            oxc_ast::ast::PropertyKind::Set => "set",
                        };
                        JsNode::Property {
                            start: prop_start as u32,
                            end: prop_end as u32,
                            loc: create_typed_loc(prop_start, prop_end, line_offsets),
                            method: p.method,
                            shorthand: p.shorthand,
                            computed: p.computed,
                            key: Box::new(key),
                            value: Box::new(expr_to_node(value)),
                            kind: CompactString::from(kind),
                        }
                    }
                    oxc_ast::ast::ObjectPropertyKind::SpreadProperty(spread) => {
                        let spread_start = offset + spread.span.start as usize;
                        let spread_end = offset + spread.span.end as usize;
                        JsNode::SpreadElement {
                            start: spread_start as u32,
                            end: spread_end as u32,
                            loc: create_typed_loc(spread_start, spread_end, line_offsets),
                            argument: Box::new(expr_to_node(convert_expression_for_program(
                                &spread.argument,
                                offset,
                                line_offsets,
                            ))),
                        }
                    }
                })
                .collect();

            Expression::from_node(JsNode::ObjectExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                properties,
            })
        }
        OxcExpression::ArrowFunctionExpression(arrow) => {
            let start = offset + arrow.span.start as usize;
            let end = offset + arrow.span.end as usize;

            let params: Vec<JsNode> = arrow
                .params
                .items
                .iter()
                .map(|param| {
                    JsNode::Raw(convert_binding_pattern(
                        &param.pattern,
                        offset,
                        line_offsets,
                    ))
                })
                .collect();

            let body_value = convert_function_body_for_program(&arrow.body, offset, line_offsets);

            Expression::from_node(JsNode::ArrowFunctionExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                id: None,
                expression: arrow.expression,
                generator: false,
                r#async: arrow.r#async,
                params,
                body: Box::new(JsNode::Raw(body_value)),
            })
        }
        OxcExpression::FunctionExpression(func) => Expression::from_node(JsNode::Raw(
            convert_function_expression_for_program(func, offset, line_offsets),
        )),
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

            Expression::from_node(JsNode::MemberExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                object: Box::new(expr_to_node(object)),
                property: Box::new(expr_to_node(property)),
                computed: false,
                optional: member.optional,
            })
        }
        OxcExpression::ComputedMemberExpression(member) => {
            let start = offset + member.span.start as usize;
            let end = offset + member.span.end as usize;
            let object = convert_expression_for_program(&member.object, offset, line_offsets);
            let property = convert_expression_for_program(&member.expression, offset, line_offsets);

            Expression::from_node(JsNode::MemberExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                object: Box::new(expr_to_node(object)),
                property: Box::new(expr_to_node(property)),
                computed: true,
                optional: member.optional,
            })
        }
        OxcExpression::ImportExpression(import_expr) => {
            let start = offset + import_expr.span.start as usize;
            let end = offset + import_expr.span.end as usize;
            let source = convert_expression_for_program(&import_expr.source, offset, line_offsets);

            Expression::from_node(JsNode::ImportExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                source: Box::new(expr_to_node(source)),
            })
        }
        OxcExpression::AssignmentExpression(assign) => {
            let start = offset + assign.span.start as usize;
            let end = offset + assign.span.end as usize;

            let left = convert_assignment_target_for_program(&assign.left, offset, line_offsets);
            let right = convert_expression_for_program(&assign.right, offset, line_offsets);
            let operator = assignment_operator_to_string(&assign.operator);

            Expression::from_node(JsNode::AssignmentExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                operator: CompactString::from(operator),
                left: Box::new(left),
                right: Box::new(expr_to_node(right)),
            })
        }
        OxcExpression::UnaryExpression(unary) => {
            let start = offset + unary.span.start as usize;
            let end = offset + unary.span.end as usize;
            let argument = convert_expression_for_program(&unary.argument, offset, line_offsets);
            Expression::from_node(JsNode::UnaryExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                operator: CompactString::from(unary.operator.as_str()),
                prefix: true,
                argument: Box::new(expr_to_node(argument)),
            })
        }
        OxcExpression::NewExpression(new_expr) => {
            let start = offset + new_expr.span.start as usize;
            let end = offset + new_expr.span.end as usize;
            let callee = convert_expression_for_program(&new_expr.callee, offset, line_offsets);
            let args: Vec<JsNode> = new_expr
                .arguments
                .iter()
                .map(|arg| match arg {
                    oxc_ast::ast::Argument::SpreadElement(spread) => {
                        let spread_start = offset + spread.span.start as usize;
                        let spread_end = offset + spread.span.end as usize;
                        JsNode::SpreadElement {
                            start: spread_start as u32,
                            end: spread_end as u32,
                            loc: create_typed_loc(spread_start, spread_end, line_offsets),
                            argument: Box::new(expr_to_node(convert_expression_for_program(
                                &spread.argument,
                                offset,
                                line_offsets,
                            ))),
                        }
                    }
                    _ => {
                        let expr = arg.to_expression();
                        expr_to_node(convert_expression_for_program(expr, offset, line_offsets))
                    }
                })
                .collect();

            Expression::from_node(JsNode::NewExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                callee: Box::new(expr_to_node(callee)),
                arguments: args,
            })
        }
        OxcExpression::ClassExpression(class_expr) => {
            let start = offset + class_expr.span.start as usize;
            let end = offset + class_expr.span.end as usize;

            let id = class_expr.id.as_ref().map(|id| {
                let id_start = offset + id.span.start as usize;
                let id_end = offset + id.span.end as usize;
                Box::new(expr_to_node(create_identifier(
                    &id.name,
                    id_start,
                    id_end,
                    line_offsets,
                )))
            });

            let super_class = class_expr.super_class.as_ref().map(|sc| {
                Box::new(expr_to_node(convert_expression_for_program(
                    sc,
                    offset,
                    line_offsets,
                )))
            });

            let body = convert_class_body_for_program(&class_expr.body, offset, line_offsets);

            Expression::from_node(JsNode::ClassExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                id,
                super_class,
                body: Box::new(JsNode::Raw(body)),
            })
        }
        OxcExpression::Super(super_expr) => {
            let start = offset + super_expr.span.start as usize;
            let end = offset + super_expr.span.end as usize;
            Expression::from_node(JsNode::Super {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
            })
        }
        OxcExpression::ThisExpression(this_expr) => {
            let start = offset + this_expr.span.start as usize;
            let end = offset + this_expr.span.end as usize;
            Expression::from_node(JsNode::ThisExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
            })
        }
        OxcExpression::TemplateLiteral(template) => {
            let start = offset + template.span.start as usize;
            let end = offset + template.span.end as usize;

            let quasis: Vec<JsNode> = template
                .quasis
                .iter()
                .map(|quasi| {
                    let q_start = offset + quasi.span.start as usize;
                    let q_end = offset + quasi.span.end as usize;
                    JsNode::TemplateElement {
                        start: q_start as u32,
                        end: q_end as u32,
                        loc: create_typed_loc(q_start, q_end, line_offsets),
                        tail: quasi.tail,
                        value: TemplateElementValue {
                            raw: CompactString::from(quasi.value.raw.as_str()),
                            cooked: quasi
                                .value
                                .cooked
                                .as_ref()
                                .map(|s| CompactString::from(s.as_str())),
                        },
                    }
                })
                .collect();

            let expressions: Vec<JsNode> = template
                .expressions
                .iter()
                .map(|expr| {
                    expr_to_node(convert_expression_for_program(expr, offset, line_offsets))
                })
                .collect();

            Expression::from_node(JsNode::TemplateLiteral {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                quasis,
                expressions,
            })
        }
        OxcExpression::BinaryExpression(bin) => {
            let start = offset + bin.span.start as usize;
            let end = offset + bin.span.end as usize;
            let left = convert_expression_for_program(&bin.left, offset, line_offsets);
            let right = convert_expression_for_program(&bin.right, offset, line_offsets);

            Expression::from_node(JsNode::BinaryExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                left: Box::new(expr_to_node(left)),
                operator: CompactString::from(binary_operator_to_string(&bin.operator)),
                right: Box::new(expr_to_node(right)),
            })
        }
        OxcExpression::LogicalExpression(logical) => {
            let start = offset + logical.span.start as usize;
            let end = offset + logical.span.end as usize;
            let left = convert_expression_for_program(&logical.left, offset, line_offsets);
            let right = convert_expression_for_program(&logical.right, offset, line_offsets);

            Expression::from_node(JsNode::LogicalExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                left: Box::new(expr_to_node(left)),
                operator: CompactString::from(logical_operator_to_string(&logical.operator)),
                right: Box::new(expr_to_node(right)),
            })
        }
        OxcExpression::UpdateExpression(update) => {
            let start = offset + update.span.start as usize;
            let end = offset + update.span.end as usize;
            let operator = match update.operator {
                oxc_ast::ast::UpdateOperator::Increment => "++",
                oxc_ast::ast::UpdateOperator::Decrement => "--",
            };
            let argument = convert_simple_assignment_target_for_program(
                &update.argument,
                offset,
                line_offsets,
            );

            Expression::from_node(JsNode::UpdateExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                operator: CompactString::from(operator),
                prefix: update.prefix,
                argument: Box::new(argument),
            })
        }
        OxcExpression::AwaitExpression(await_expr) => {
            let start = offset + await_expr.span.start as usize;
            let end = offset + await_expr.span.end as usize;
            let argument =
                convert_expression_for_program(&await_expr.argument, offset, line_offsets);
            Expression::from_node(JsNode::AwaitExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                argument: Box::new(expr_to_node(argument)),
            })
        }
        OxcExpression::ConditionalExpression(cond) => {
            let start = offset + cond.span.start as usize;
            let end = offset + cond.span.end as usize;
            let test = convert_expression_for_program(&cond.test, offset, line_offsets);
            let consequent = convert_expression_for_program(&cond.consequent, offset, line_offsets);
            let alternate = convert_expression_for_program(&cond.alternate, offset, line_offsets);

            Expression::from_node(JsNode::ConditionalExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                test: Box::new(expr_to_node(test)),
                consequent: Box::new(expr_to_node(consequent)),
                alternate: Box::new(expr_to_node(alternate)),
            })
        }
        OxcExpression::SequenceExpression(seq) => {
            let start = offset + seq.span.start as usize;
            let end = offset + seq.span.end as usize;

            let expressions: Vec<JsNode> = seq
                .expressions
                .iter()
                .map(|expr| {
                    expr_to_node(convert_expression_for_program(expr, offset, line_offsets))
                })
                .collect();

            Expression::from_node(JsNode::SequenceExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                expressions,
            })
        }
        OxcExpression::YieldExpression(yield_expr) => {
            let start = offset + yield_expr.span.start as usize;
            let end = offset + yield_expr.span.end as usize;
            Expression::from_node(JsNode::YieldExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                delegate: yield_expr.delegate,
                argument: yield_expr.argument.as_ref().map(|arg| {
                    Box::new(expr_to_node(convert_expression_for_program(
                        arg,
                        offset,
                        line_offsets,
                    )))
                }),
            })
        }
        OxcExpression::ChainExpression(chain_expr) => {
            let start = offset + chain_expr.span.start as usize;
            let end = offset + chain_expr.span.end as usize;
            let chain_inner = match &chain_expr.expression {
                oxc_ast::ast::ChainElement::CallExpression(call) => {
                    let inner_start = offset + call.span.start as usize;
                    let inner_end = offset + call.span.end as usize;
                    let callee = convert_expression_for_program(&call.callee, offset, line_offsets);
                    let args: Vec<JsNode> = call
                        .arguments
                        .iter()
                        .map(|arg| match arg {
                            oxc_ast::ast::Argument::SpreadElement(spread) => {
                                let spread_start = offset + spread.span.start as usize;
                                let spread_end = offset + spread.span.end as usize;
                                JsNode::SpreadElement {
                                    start: spread_start as u32,
                                    end: spread_end as u32,
                                    loc: create_typed_loc(spread_start, spread_end, line_offsets),
                                    argument: Box::new(expr_to_node(
                                        convert_expression_for_program(
                                            &spread.argument,
                                            offset,
                                            line_offsets,
                                        ),
                                    )),
                                }
                            }
                            _ => {
                                let expr = arg.to_expression();
                                expr_to_node(convert_expression_for_program(
                                    expr,
                                    offset,
                                    line_offsets,
                                ))
                            }
                        })
                        .collect();
                    JsNode::CallExpression {
                        start: inner_start as u32,
                        end: inner_end as u32,
                        loc: create_typed_loc(inner_start, inner_end, line_offsets),
                        callee: Box::new(expr_to_node(callee)),
                        arguments: args,
                        optional: call.optional,
                    }
                }
                oxc_ast::ast::ChainElement::TSNonNullExpression(ts_non_null) => expr_to_node(
                    convert_expression_for_program(&ts_non_null.expression, offset, line_offsets),
                ),
                oxc_ast::ast::ChainElement::StaticMemberExpression(member) => {
                    let inner_start = offset + member.span.start as usize;
                    let inner_end = offset + member.span.end as usize;
                    let object =
                        convert_expression_for_program(&member.object, offset, line_offsets);
                    let prop_start = offset + member.property.span.start as usize;
                    let prop_end = offset + member.property.span.end as usize;
                    let property = create_identifier(
                        &member.property.name,
                        prop_start,
                        prop_end,
                        line_offsets,
                    );
                    JsNode::MemberExpression {
                        start: inner_start as u32,
                        end: inner_end as u32,
                        loc: create_typed_loc(inner_start, inner_end, line_offsets),
                        object: Box::new(expr_to_node(object)),
                        property: Box::new(expr_to_node(property)),
                        computed: false,
                        optional: member.optional,
                    }
                }
                oxc_ast::ast::ChainElement::ComputedMemberExpression(member) => {
                    let inner_start = offset + member.span.start as usize;
                    let inner_end = offset + member.span.end as usize;
                    let object =
                        convert_expression_for_program(&member.object, offset, line_offsets);
                    let property =
                        convert_expression_for_program(&member.expression, offset, line_offsets);
                    JsNode::MemberExpression {
                        start: inner_start as u32,
                        end: inner_end as u32,
                        loc: create_typed_loc(inner_start, inner_end, line_offsets),
                        object: Box::new(expr_to_node(object)),
                        property: Box::new(expr_to_node(property)),
                        computed: true,
                        optional: member.optional,
                    }
                }
                oxc_ast::ast::ChainElement::PrivateFieldExpression(private_member) => {
                    let inner_start = offset + private_member.span.start as usize;
                    let inner_end = offset + private_member.span.end as usize;
                    let object = convert_expression_for_program(
                        &private_member.object,
                        offset,
                        line_offsets,
                    );
                    let prop_start = offset + private_member.field.span.start as usize;
                    let prop_end = offset + private_member.field.span.end as usize;
                    let property = create_private_identifier(
                        &private_member.field.name,
                        prop_start,
                        prop_end,
                        line_offsets,
                    );
                    JsNode::MemberExpression {
                        start: inner_start as u32,
                        end: inner_end as u32,
                        loc: create_typed_loc(inner_start, inner_end, line_offsets),
                        object: Box::new(expr_to_node(object)),
                        property: Box::new(expr_to_node(property)),
                        computed: false,
                        optional: private_member.optional,
                    }
                }
            };
            Expression::from_node(JsNode::ChainExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                expression: Box::new(chain_inner),
            })
        }
        OxcExpression::TaggedTemplateExpression(tagged) => {
            let start = offset + tagged.span.start as usize;
            let end = offset + tagged.span.end as usize;
            let tag = convert_expression_for_program(&tagged.tag, offset, line_offsets);

            let quasi_start = offset + tagged.quasi.span.start as usize;
            let quasi_end = offset + tagged.quasi.span.end as usize;

            let quasis: Vec<JsNode> = tagged
                .quasi
                .quasis
                .iter()
                .map(|quasi| {
                    let q_start = offset + quasi.span.start as usize;
                    let q_end = offset + quasi.span.end as usize;
                    JsNode::TemplateElement {
                        start: q_start as u32,
                        end: q_end as u32,
                        loc: create_typed_loc(q_start, q_end, line_offsets),
                        tail: quasi.tail,
                        value: TemplateElementValue {
                            raw: CompactString::from(quasi.value.raw.as_str()),
                            cooked: quasi
                                .value
                                .cooked
                                .as_ref()
                                .map(|s| CompactString::from(s.as_str())),
                        },
                    }
                })
                .collect();

            let quasi_expressions: Vec<JsNode> = tagged
                .quasi
                .expressions
                .iter()
                .map(|expr| {
                    expr_to_node(convert_expression_for_program(expr, offset, line_offsets))
                })
                .collect();

            let quasi = JsNode::TemplateLiteral {
                start: quasi_start as u32,
                end: quasi_end as u32,
                loc: create_typed_loc(quasi_start, quasi_end, line_offsets),
                quasis,
                expressions: quasi_expressions,
            };

            Expression::from_node(JsNode::TaggedTemplateExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                tag: Box::new(expr_to_node(tag)),
                quasi: Box::new(quasi),
            })
        }
        OxcExpression::RegExpLiteral(regex) => {
            let start = offset + regex.span.start as usize;
            let end = offset + regex.span.end as usize;
            create_regex_literal(regex, start, end, line_offsets)
        }
        // Parenthesized expressions - unwrap and return the inner expression
        OxcExpression::ParenthesizedExpression(paren) => {
            convert_expression_for_program(&paren.expression, offset, line_offsets)
        }
        // TypeScript expression wrappers - unwrap and return the inner expression
        OxcExpression::TSAsExpression(ts_as) => {
            convert_expression_for_program(&ts_as.expression, offset, line_offsets)
        }
        OxcExpression::TSSatisfiesExpression(ts_satisfies) => {
            convert_expression_for_program(&ts_satisfies.expression, offset, line_offsets)
        }
        OxcExpression::TSNonNullExpression(ts_non_null) => {
            convert_expression_for_program(&ts_non_null.expression, offset, line_offsets)
        }
        OxcExpression::TSTypeAssertion(ts_assertion) => {
            convert_expression_for_program(&ts_assertion.expression, offset, line_offsets)
        }
        OxcExpression::TSInstantiationExpression(ts_inst) => {
            convert_expression_for_program(&ts_inst.expression, offset, line_offsets)
        }
        _ => {
            // Fallback for unsupported expression types
            let span = expr.span();
            let start = offset + span.start as usize;
            let end = offset + span.end as usize;
            create_identifier("unknown", start, end, line_offsets)
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
    if let Some(loc) = create_loc(start, end, line_offsets) {
        obj.insert("loc".to_string(), loc);
    }

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
            // Filter out abstract methods (TSAbstractMethodDefinition)
            if method.r#type == oxc_ast::ast::MethodDefinitionType::TSAbstractMethodDefinition {
                return None;
            }
            let start = offset + method.span.start as usize;
            let end = offset + method.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("MethodDefinition".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            if let Some(loc) = create_loc(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }
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
            obj.insert("key".to_string(), key.to_value());

            // value (function expression)
            let value =
                convert_function_expression_for_program(&method.value, offset, line_offsets);
            obj.insert("value".to_string(), value);

            Some(Value::Object(obj))
        }
        oxc_ast::ast::ClassElement::PropertyDefinition(prop) => {
            // Filter out abstract property definitions (TSAbstractPropertyDefinition)
            if prop.r#type == oxc_ast::ast::PropertyDefinitionType::TSAbstractPropertyDefinition {
                return None;
            }
            let start = offset + prop.span.start as usize;
            let end = offset + prop.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("PropertyDefinition".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            if let Some(loc) = create_loc(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }
            obj.insert("static".to_string(), Value::Bool(prop.r#static));
            obj.insert("computed".to_string(), Value::Bool(prop.computed));

            // key
            let key = convert_property_key(&prop.key, offset, line_offsets);
            obj.insert("key".to_string(), key.to_value());

            // value
            if let Some(ref value) = prop.value {
                let val = convert_expression_for_program(value, offset, line_offsets);
                obj.insert("value".to_string(), val.as_json().clone());
            } else {
                obj.insert("value".to_string(), Value::Null);
            }

            // TypeScript: declare field (for `declare bar: string;` in class)
            if prop.declare {
                obj.insert("declare".to_string(), Value::Bool(true));
            }

            Some(Value::Object(obj))
        }
        oxc_ast::ast::ClassElement::AccessorProperty(prop) => {
            // TC39 accessor keyword property (not yet stage 4)
            // Emit as PropertyDefinition with accessor: true so remove_typescript_nodes can detect it
            let start = offset + prop.span.start as usize;
            let end = offset + prop.span.end as usize;
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("PropertyDefinition".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            if let Some(loc) = create_loc(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }
            obj.insert("accessor".to_string(), Value::Bool(true));
            obj.insert("static".to_string(), Value::Bool(prop.r#static));
            obj.insert("computed".to_string(), Value::Bool(prop.computed));

            let key = convert_property_key(&prop.key, offset, line_offsets);
            obj.insert("key".to_string(), key.to_value());

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
    if let Some(loc) = create_loc(start, end, line_offsets) {
        obj.insert("loc".to_string(), loc);
    }
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
    if let Some(loc) = create_loc(start, end, line_offsets) {
        obj.insert("loc".to_string(), loc);
    }

    let statements: Vec<Value> = body
        .statements
        .iter()
        .filter_map(|stmt| convert_statement_for_program(stmt, offset, line_offsets))
        .map(|n| n.to_value())
        .collect();
    obj.insert("body".to_string(), Value::Array(statements));

    Value::Object(obj)
}

/// Convert a function body to JsNode (for FunctionDeclaration in JsNode path).
fn convert_function_body_for_program_as_node(
    body: &oxc_ast::ast::FunctionBody,
    offset: usize,
    line_offsets: &[usize],
) -> JsNode {
    let start = offset + body.span.start as usize;
    let end = offset + body.span.end as usize;
    let loc = create_typed_loc(start, end, line_offsets);

    let statements: Vec<JsNode> = body
        .statements
        .iter()
        .filter_map(|stmt| convert_statement_for_program(stmt, offset, line_offsets))
        .collect();

    JsNode::BlockStatement {
        start: start as u32,
        end: end as u32,
        loc,
        body: statements,
    }
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
    if let Some(loc) = create_loc(start, end, line_offsets) {
        obj.insert("loc".to_string(), loc);
    }

    let mut properties: Vec<Value> = obj_pat
        .properties
        .iter()
        .map(|prop| convert_binding_property(prop, offset, line_offsets))
        .collect();

    // Handle rest element if present (e.g., `...others` in `{ foo, ...others }`)
    if let Some(rest) = &obj_pat.rest {
        let rest_start = offset + rest.span.start as usize;
        let rest_end = offset + rest.span.end as usize;

        let mut rest_obj = Map::new();
        rest_obj.insert("type".to_string(), Value::String("RestElement".to_string()));
        rest_obj.insert(
            "start".to_string(),
            Value::Number((rest_start as i64).into()),
        );
        rest_obj.insert("end".to_string(), Value::Number((rest_end as i64).into()));
        if let Some(loc) = create_loc(rest_start, rest_end, line_offsets) {
            rest_obj.insert("loc".to_string(), loc);
        }
        rest_obj.insert(
            "argument".to_string(),
            convert_binding_pattern(&rest.argument, offset, line_offsets),
        );
        properties.push(Value::Object(rest_obj));
    }

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
    if let Some(loc) = create_loc(start, end, line_offsets) {
        obj.insert("loc".to_string(), loc);
    }

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
        if let Some(loc) = create_loc(rest_start, rest_end, line_offsets) {
            rest_obj.insert("loc".to_string(), loc);
        }
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
    if let Some(loc) = create_loc(start, end, line_offsets) {
        obj.insert("loc".to_string(), loc);
    }

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
) -> JsNode {
    use oxc_ast::ast::AssignmentTarget;

    match target {
        AssignmentTarget::AssignmentTargetIdentifier(id) => {
            let start = offset + id.span.start as usize;
            let end = offset + id.span.end as usize;
            expr_to_node(create_identifier(&id.name, start, end, line_offsets))
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

            JsNode::MemberExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                object: Box::new(expr_to_node(object)),
                property: Box::new(expr_to_node(property)),
                computed: false,
                optional: member.optional,
            }
        }
        AssignmentTarget::ComputedMemberExpression(member) => {
            let start = offset + member.span.start as usize;
            let end = offset + member.span.end as usize;

            let object = convert_expression_for_program(&member.object, offset, line_offsets);
            let property = convert_expression_for_program(&member.expression, offset, line_offsets);

            JsNode::MemberExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                object: Box::new(expr_to_node(object)),
                property: Box::new(expr_to_node(property)),
                computed: true,
                optional: member.optional,
            }
        }
        AssignmentTarget::ObjectAssignmentTarget(obj_target) => JsNode::Raw(
            convert_object_assignment_target_for_program(obj_target, offset, line_offsets),
        ),
        AssignmentTarget::ArrayAssignmentTarget(arr_target) => JsNode::Raw(
            convert_array_assignment_target_for_program(arr_target, offset, line_offsets),
        ),
        _ => {
            // For other complex patterns (e.g., TSAsExpression, TSNonNullExpression)
            JsNode::Null
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
    if let Some(loc) = create_loc(start, end, line_offsets) {
        obj.insert("loc".to_string(), loc);
    }

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
        if let Some(loc) = create_loc(rest_start, rest_end, line_offsets) {
            rest_obj.insert("loc".to_string(), loc);
        }
        rest_obj.insert(
            "argument".to_string(),
            convert_assignment_target_for_program(&rest.target, offset, line_offsets).to_value(),
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
    if let Some(loc) = create_loc(start, end, line_offsets) {
        obj.insert("loc".to_string(), loc);
    }

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
        if let Some(loc) = create_loc(rest_start, rest_end, line_offsets) {
            rest_obj.insert("loc".to_string(), loc);
        }
        rest_obj.insert(
            "argument".to_string(),
            convert_assignment_target_for_program(&rest.target, offset, line_offsets).to_value(),
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
            if let Some(loc) = create_loc(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }
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
                if let Some(loc) = create_loc(id_start, init_end, line_offsets) {
                    assign_pat.insert("loc".to_string(), loc);
                }
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
            if let Some(loc) = create_loc(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }
            obj.insert("method".to_string(), Value::Bool(false));
            obj.insert("shorthand".to_string(), Value::Bool(false));
            obj.insert("computed".to_string(), Value::Bool(prop_prop.computed));
            obj.insert("kind".to_string(), Value::String("init".to_string()));

            let key = convert_property_key(&prop_prop.name, offset, line_offsets);
            obj.insert("key".to_string(), key.to_value());

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

/// Convert a SimpleAssignmentTarget to JsNode (no -1 offset adjustment).
#[allow(dead_code)]
fn convert_simple_assignment_target_for_program(
    target: &oxc_ast::ast::SimpleAssignmentTarget,
    offset: usize,
    line_offsets: &[usize],
) -> JsNode {
    use oxc_ast::ast::SimpleAssignmentTarget;

    match target {
        SimpleAssignmentTarget::AssignmentTargetIdentifier(id) => {
            let start = offset + id.span.start as usize;
            let end = offset + id.span.end as usize;
            expr_to_node(create_identifier(&id.name, start, end, line_offsets))
        }
        SimpleAssignmentTarget::StaticMemberExpression(member) => {
            let start = offset + member.span.start as usize;
            let end = offset + member.span.end as usize;

            let object = convert_expression_for_program(&member.object, offset, line_offsets);
            let property = create_identifier(
                &member.property.name,
                offset + member.property.span.start as usize,
                offset + member.property.span.end as usize,
                line_offsets,
            );

            JsNode::MemberExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                object: Box::new(expr_to_node(object)),
                property: Box::new(expr_to_node(property)),
                computed: false,
                optional: member.optional,
            }
        }
        SimpleAssignmentTarget::ComputedMemberExpression(member) => {
            let start = offset + member.span.start as usize;
            let end = offset + member.span.end as usize;

            let object = convert_expression_for_program(&member.object, offset, line_offsets);
            let property = convert_expression_for_program(&member.expression, offset, line_offsets);

            JsNode::MemberExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                object: Box::new(expr_to_node(object)),
                property: Box::new(expr_to_node(property)),
                computed: true,
                optional: member.optional,
            }
        }
        _ => JsNode::Null,
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
            if let Some(loc) = create_loc(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }
            obj.insert(
                "left".to_string(),
                convert_assignment_target_for_program(&with_default.binding, offset, line_offsets)
                    .to_value(),
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
                convert_assignment_target_for_program(inner, offset, line_offsets).to_value()
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
    if let Some(loc) = create_loc(start, end, line_offsets) {
        obj.insert("loc".to_string(), loc);
    }
    obj.insert("method".to_string(), Value::Bool(false));
    obj.insert("shorthand".to_string(), Value::Bool(prop.shorthand));
    obj.insert("computed".to_string(), Value::Bool(prop.computed));
    obj.insert("kind".to_string(), Value::String("init".to_string()));

    // Convert key
    let key = convert_property_key(&prop.key, offset, line_offsets);
    obj.insert("key".to_string(), key.to_value());

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
) -> JsNode {
    match key {
        oxc_ast::ast::PropertyKey::StaticIdentifier(id) => {
            let start = offset + id.span.start as usize;
            let end = offset + id.span.end as usize;
            expr_to_node(create_identifier(&id.name, start, end, line_offsets))
        }
        oxc_ast::ast::PropertyKey::PrivateIdentifier(id) => {
            let start = offset + id.span.start as usize;
            let end = offset + id.span.end as usize;
            expr_to_node(create_private_identifier(
                &id.name,
                start,
                end,
                line_offsets,
            ))
        }
        _ => {
            // For computed keys, try to get the expression
            if let Some(expr) = key.as_expression() {
                expr_to_node(convert_expression(expr, offset, line_offsets))
            } else {
                JsNode::Null
            }
        }
    }
}

/// Parse a binding pattern (for {#each} context).
/// This parses patterns like `item`, `{ name }`, `[a, b]`, etc.
pub fn parse_binding_pattern(
    content: &str,
    offset: usize,
    line_offsets: &[usize],
) -> Result<Expression, crate::error::ParseError> {
    with_oxc_allocator(|allocator| {
        let source_type = SourceType::mjs();

        let wrapped = format!("let {} = null", content);
        let parser = OxcParser::new(allocator, &wrapped, source_type);
        let result = parser.parse();

        if !result.errors.is_empty() {
            let trimmed = content.trim();
            if trimmed.starts_with('{') || trimmed.starts_with('[') {
                let err = &result.errors[0];
                let msg = format!("{}", err);
                let clean_msg = msg.split('\n').next().unwrap_or(&msg).trim().to_string();
                let err_pos = offset;
                return Err(crate::error::ParseError::svelte(
                    "js_parse_error",
                    &clean_msg,
                    (err_pos, err_pos),
                ));
            }
        }

        if let Some(oxc_ast::ast::Statement::VariableDeclaration(var_decl)) =
            result.program.body.first()
            && let Some(decl) = var_decl.declarations.first()
        {
            if let oxc_ast::ast::BindingPattern::BindingIdentifier(id) = &decl.id {
                let start = offset + id.span.start as usize - 4;
                let end = offset + id.span.end as usize - 4;
                return Ok(Expression::from_node(
                    create_identifier_for_binding_toplevel(&id.name, start, end, line_offsets),
                ));
            }

            return Ok(Expression::Value(convert_binding_pattern_with_adjustment(
                &decl.id,
                offset,
                4,
                line_offsets,
            )));
        }

        // Fallback: return as simple identifier
        let trimmed = content.trim();
        let name = if let Some(colon_pos) = trimmed.find(':') {
            if !trimmed.starts_with('{') && !trimmed.starts_with('[') {
                trimmed[..colon_pos].trim()
            } else {
                trimmed
            }
        } else {
            trimmed
        };
        Ok(create_identifier(
            name,
            offset,
            offset + name.len(),
            line_offsets,
        ))
    })
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
            create_identifier_for_binding(&id.name, start, end, line_offsets).to_value()
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
    if let Some(loc) = create_loc_for_binding(start, end, line_offsets) {
        obj.insert("loc".to_string(), loc);
    }

    let mut properties: Vec<Value> = obj_pat
        .properties
        .iter()
        .map(|prop| {
            convert_binding_property_with_adjustment(prop, doc_offset, prefix_len, line_offsets)
        })
        .collect();

    // Handle rest element if present (e.g., `...others` in `{ foo, ...others }`)
    if let Some(rest) = &obj_pat.rest {
        let rest_start = doc_offset + rest.span.start as usize - prefix_len;
        let rest_end = doc_offset + rest.span.end as usize - prefix_len;

        let mut rest_obj = Map::new();
        rest_obj.insert("type".to_string(), Value::String("RestElement".to_string()));
        rest_obj.insert(
            "start".to_string(),
            Value::Number((rest_start as i64).into()),
        );
        rest_obj.insert("end".to_string(), Value::Number((rest_end as i64).into()));
        if let Some(loc) = create_loc_for_binding(rest_start, rest_end, line_offsets) {
            rest_obj.insert("loc".to_string(), loc);
        }
        rest_obj.insert(
            "argument".to_string(),
            convert_binding_pattern_with_adjustment(
                &rest.argument,
                doc_offset,
                prefix_len,
                line_offsets,
            ),
        );
        properties.push(Value::Object(rest_obj));
    }

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
    if let Some(loc) = create_loc_for_binding(start, end, line_offsets) {
        obj.insert("loc".to_string(), loc);
    }

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
        if let Some(loc) = create_loc_for_binding(rest_start, rest_end, line_offsets) {
            rest_obj.insert("loc".to_string(), loc);
        }
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
    if let Some(loc) = create_loc_for_binding(start, end, line_offsets) {
        obj.insert("loc".to_string(), loc);
    }

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
    if let Some(loc) = create_loc_for_binding(start, end, line_offsets) {
        obj.insert("loc".to_string(), loc);
    }
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
            create_identifier_for_binding(&id.name, start, end, line_offsets).to_value()
        }
        oxc_ast::ast::PropertyKey::PrivateIdentifier(id) => {
            let start = doc_offset + id.span.start as usize - prefix_len;
            let end = doc_offset + id.span.end as usize - prefix_len;
            create_private_identifier_for_binding(&id.name, start, end, line_offsets).to_value()
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
            create_identifier_for_binding(&id.name, start, end, line_offsets).to_value()
        }
        OxcExpression::BooleanLiteral(lit) => {
            let start = doc_offset + lit.span.start as usize - prefix_len;
            let end = doc_offset + lit.span.end as usize - prefix_len;
            let raw = if lit.value { "true" } else { "false" };
            create_literal_for_binding(LiteralValue::Bool(lit.value), raw, start, end, line_offsets)
                .to_value()
        }
        OxcExpression::NumericLiteral(lit) => {
            let start = doc_offset + lit.span.start as usize - prefix_len;
            let end = doc_offset + lit.span.end as usize - prefix_len;
            let raw = lit.raw.as_ref().map(|a| a.as_str()).unwrap_or("");
            create_numeric_literal_for_binding(lit.value, raw, start, end, line_offsets).to_value()
        }
        OxcExpression::StringLiteral(lit) => {
            let start = doc_offset + lit.span.start as usize - prefix_len;
            let end = doc_offset + lit.span.end as usize - prefix_len;
            let raw = lit.raw.as_ref().map(|a| a.as_str()).unwrap_or("");
            create_string_literal_for_binding(&lit.value, raw, start, end, line_offsets).to_value()
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
        OxcExpression::BinaryExpression(bin) => {
            let start = doc_offset + bin.span.start as usize - prefix_len;
            let end = doc_offset + bin.span.end as usize - prefix_len;
            let left =
                convert_expression_with_adjustment(&bin.left, doc_offset, prefix_len, line_offsets);
            let right = convert_expression_with_adjustment(
                &bin.right,
                doc_offset,
                prefix_len,
                line_offsets,
            );
            let operator = binary_operator_to_string(&bin.operator);
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("BinaryExpression".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            if let Some(loc) = create_loc_for_binding(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }
            obj.insert("left".to_string(), left);
            obj.insert("operator".to_string(), Value::String(operator));
            obj.insert("right".to_string(), right);
            Value::Object(obj)
        }
        OxcExpression::UnaryExpression(unary) => {
            let start = doc_offset + unary.span.start as usize - prefix_len;
            let end = doc_offset + unary.span.end as usize - prefix_len;
            let argument = convert_expression_with_adjustment(
                &unary.argument,
                doc_offset,
                prefix_len,
                line_offsets,
            );
            let operator = unary_operator_to_string(&unary.operator);
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("UnaryExpression".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            if let Some(loc) = create_loc_for_binding(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }
            obj.insert("operator".to_string(), Value::String(operator));
            obj.insert("prefix".to_string(), Value::Bool(true));
            obj.insert("argument".to_string(), argument);
            Value::Object(obj)
        }
        OxcExpression::LogicalExpression(log) => {
            let start = doc_offset + log.span.start as usize - prefix_len;
            let end = doc_offset + log.span.end as usize - prefix_len;
            let left =
                convert_expression_with_adjustment(&log.left, doc_offset, prefix_len, line_offsets);
            let right = convert_expression_with_adjustment(
                &log.right,
                doc_offset,
                prefix_len,
                line_offsets,
            );
            let operator = logical_operator_to_string(&log.operator);
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("LogicalExpression".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            if let Some(loc) = create_loc_for_binding(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }
            obj.insert("left".to_string(), left);
            obj.insert("operator".to_string(), Value::String(operator));
            obj.insert("right".to_string(), right);
            Value::Object(obj)
        }
        OxcExpression::ConditionalExpression(cond) => {
            let start = doc_offset + cond.span.start as usize - prefix_len;
            let end = doc_offset + cond.span.end as usize - prefix_len;
            let test = convert_expression_with_adjustment(
                &cond.test,
                doc_offset,
                prefix_len,
                line_offsets,
            );
            let consequent = convert_expression_with_adjustment(
                &cond.consequent,
                doc_offset,
                prefix_len,
                line_offsets,
            );
            let alternate = convert_expression_with_adjustment(
                &cond.alternate,
                doc_offset,
                prefix_len,
                line_offsets,
            );
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("ConditionalExpression".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            if let Some(loc) = create_loc_for_binding(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }
            obj.insert("test".to_string(), test);
            obj.insert("consequent".to_string(), consequent);
            obj.insert("alternate".to_string(), alternate);
            Value::Object(obj)
        }
        OxcExpression::StaticMemberExpression(member) => {
            let start = doc_offset + member.span.start as usize - prefix_len;
            let end = doc_offset + member.span.end as usize - prefix_len;
            let object = convert_expression_with_adjustment(
                &member.object,
                doc_offset,
                prefix_len,
                line_offsets,
            );
            let prop_start = doc_offset + member.property.span.start as usize - prefix_len;
            let prop_end = doc_offset + member.property.span.end as usize - prefix_len;
            let property = create_identifier_for_binding(
                &member.property.name,
                prop_start,
                prop_end,
                line_offsets,
            )
            .to_value();
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("MemberExpression".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            if let Some(loc) = create_loc_for_binding(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }
            obj.insert("object".to_string(), object);
            obj.insert("property".to_string(), property);
            obj.insert("computed".to_string(), Value::Bool(false));
            obj.insert("optional".to_string(), Value::Bool(member.optional));
            Value::Object(obj)
        }
        OxcExpression::ComputedMemberExpression(member) => {
            let start = doc_offset + member.span.start as usize - prefix_len;
            let end = doc_offset + member.span.end as usize - prefix_len;
            let object = convert_expression_with_adjustment(
                &member.object,
                doc_offset,
                prefix_len,
                line_offsets,
            );
            let property = convert_expression_with_adjustment(
                &member.expression,
                doc_offset,
                prefix_len,
                line_offsets,
            );
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("MemberExpression".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            if let Some(loc) = create_loc_for_binding(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }
            obj.insert("object".to_string(), object);
            obj.insert("property".to_string(), property);
            obj.insert("computed".to_string(), Value::Bool(true));
            obj.insert("optional".to_string(), Value::Bool(member.optional));
            Value::Object(obj)
        }
        OxcExpression::ObjectExpression(_obj_expr) => {
            // Use the full convert_expression for complex objects
            let adjusted_offset = doc_offset.wrapping_sub(prefix_len).wrapping_add(1);
            convert_expression(expr, adjusted_offset, line_offsets)
                .as_json()
                .clone()
        }
        OxcExpression::ArrayExpression(_arr_expr) => {
            // Use the full convert_expression for arrays
            let adjusted_offset = doc_offset.wrapping_sub(prefix_len).wrapping_add(1);
            convert_expression(expr, adjusted_offset, line_offsets)
                .as_json()
                .clone()
        }
        OxcExpression::UpdateExpression(update) => {
            let start = doc_offset + update.span.start as usize - prefix_len;
            let end = doc_offset + update.span.end as usize - prefix_len;
            // Convert SimpleAssignmentTarget to expression representation
            let argument = match &update.argument {
                oxc_ast::ast::SimpleAssignmentTarget::AssignmentTargetIdentifier(id) => {
                    let id_start = doc_offset + id.span.start as usize - prefix_len;
                    let id_end = doc_offset + id.span.end as usize - prefix_len;
                    create_identifier_for_binding(&id.name, id_start, id_end, line_offsets)
                        .to_value()
                }
                _ => {
                    let arg_span = update.argument.span();
                    let arg_start = doc_offset + arg_span.start as usize - prefix_len;
                    let arg_end = doc_offset + arg_span.end as usize - prefix_len;
                    create_identifier_for_binding("unknown", arg_start, arg_end, line_offsets)
                        .to_value()
                }
            };
            let operator = update_operator_to_string(&update.operator);
            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("UpdateExpression".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            if let Some(loc) = create_loc_for_binding(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }
            obj.insert("operator".to_string(), Value::String(operator));
            obj.insert("prefix".to_string(), Value::Bool(update.prefix));
            obj.insert("argument".to_string(), argument);
            Value::Object(obj)
        }
        OxcExpression::NullLiteral(lit) => {
            let start = doc_offset + lit.span.start as usize - prefix_len;
            let end = doc_offset + lit.span.end as usize - prefix_len;
            create_literal_for_binding(LiteralValue::Null, "null", start, end, line_offsets)
                .to_value()
        }
        OxcExpression::NewExpression(_) | OxcExpression::FunctionExpression(_) => {
            // Delegate to full convert_expression
            let adjusted_offset = doc_offset.wrapping_sub(prefix_len).wrapping_add(1);
            convert_expression(expr, adjusted_offset, line_offsets)
                .as_json()
                .clone()
        }
        _ => {
            // Fallback for other expressions - delegate to the full convert_expression
            // with proper offset adjustment
            let adjusted_offset = doc_offset.wrapping_sub(prefix_len).wrapping_add(1);
            convert_expression(expr, adjusted_offset, line_offsets)
                .as_json()
                .clone()
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
    if let Some(loc) = create_loc_for_binding(start, end, line_offsets) {
        obj.insert("loc".to_string(), loc);
    }

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
            if let Some(loc) = create_loc_for_binding(q_start, q_end, line_offsets) {
                q_obj.insert("loc".to_string(), loc);
            }
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
    if let Some(loc) = create_loc_for_binding(start, end, line_offsets) {
        obj.insert("loc".to_string(), loc);
    }

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
    if let Some(loc) = create_loc_for_binding(start, end, line_offsets) {
        obj.insert("loc".to_string(), loc);
    }
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
    if let Some(loc) = create_loc_for_binding(start, end, line_offsets) {
        obj.insert("loc".to_string(), loc);
    }

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
            if let Some(loc) = create_loc_for_binding(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }

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
            if let Some(loc) = create_loc_for_binding(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }
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
