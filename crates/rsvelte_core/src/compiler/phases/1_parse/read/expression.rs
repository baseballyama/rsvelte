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
//! - **AST conversion**: This module converts OXC's AST into this crate's typed,
//!   arena-allocated `JsNode`/`Expression` representation (ESTree-shaped), not a
//!   `serde_json::Value`.
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

use crate::ast::arena::{IdRange, ParseArena};
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
    /// Per-thread sink for JS comments discovered by OXC during the current
    /// expression / script parse. Each `Parser::root_comments` push from
    /// expression code routes through this and is then drained by the
    /// `Parser` after the parse_* call returns. Mirrors upstream's
    /// `parser.root.comments` which is shared between the Svelte parser
    /// and acorn's `onComment` handler.
    static EXPR_COMMENT_SINK: RefCell<Vec<crate::ast::template::JsComment>> = const { RefCell::new(Vec::new()) };
}

/// Push a comment to the per-thread expression-comment sink. Called from
/// the OXC expression / script parse pathways so the Parser can later move
/// the comments into `Root.comments`.
pub(crate) fn push_expr_comment(comment: crate::ast::template::JsComment) {
    EXPR_COMMENT_SINK.with(|sink| sink.borrow_mut().push(comment));
}

/// Drain the per-thread expression-comment sink. Returns all comments
/// collected since the last drain.
pub(crate) fn take_expr_comments() -> Vec<crate::ast::template::JsComment> {
    EXPR_COMMENT_SINK.with(|sink| std::mem::take(&mut *sink.borrow_mut()))
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
fn expr_to_node<'a>(expr: Expression<'a>) -> JsNode {
    match expr {
        Expression::Typed(te) => te.node,
        Expression::Lazy { .. } => {
            panic!("Expression::Lazy must be resolved before converting to JsNode")
        }
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

/// Compute `{line, column, character}` from a byte offset using line offsets.
fn line_column_for(offset: usize, line_offsets: &[usize]) -> crate::ast::span::LineColumn {
    if line_offsets.is_empty() {
        return crate::ast::span::LineColumn {
            line: 1,
            column: 0,
            character: offset as u32,
        };
    }
    let line = line_offsets
        .partition_point(|&o| o <= offset)
        .saturating_sub(1);
    let line_start = line_offsets.get(line).copied().unwrap_or(0);
    crate::ast::span::LineColumn {
        line: (line + 1) as u32,
        column: (offset - line_start) as u32,
        character: offset as u32,
    }
}

/// Push a JS comment captured by OXC onto the per-thread expression-comment
/// sink. The caller has already converted positions to document-absolute and
/// stripped delimiters from the value.
fn record_oxc_comment(
    kind: oxc_ast::ast::CommentKind,
    value: String,
    start: usize,
    end: usize,
    line_offsets: &[usize],
) {
    let comment_kind = match kind {
        oxc_ast::ast::CommentKind::Line => crate::ast::template::JsCommentKind::Line,
        oxc_ast::ast::CommentKind::SingleLineBlock | oxc_ast::ast::CommentKind::MultiLineBlock => {
            crate::ast::template::JsCommentKind::Block
        }
    };
    let loc = crate::ast::span::SourceLocation {
        start: line_column_for(start, line_offsets),
        end: line_column_for(end, line_offsets),
    };
    push_expr_comment(crate::ast::template::JsComment {
        kind: comment_kind,
        start: start as u32,
        end: end as u32,
        value: compact_str::CompactString::from(value),
        loc,
    });
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
fn get_loose_identifier<'a>(
    template: &str,
    start: usize,
    opening_token: char,
    _line_offsets: &[usize],
) -> Option<Expression<'a>> {
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
            optional: false,
            type_annotation: None,
        }));
    }
    None
}

/// Parse a JavaScript expression and return it as an Expression.
///
/// This corresponds to `read_expression` (default export) in Svelte's `read/expression.js`.
///
/// Fast path: try to parse a simple expression without invoking OXC.
///
/// Handles:
/// - Simple identifiers: `count`, `$state`, `$$props`, `_foo`
/// - Dotted member expressions: `counter.count`, `Math.PI`, `a.b.c`
/// - Optional chaining member expressions: `a?.b`, `a?.b?.c`
/// - Boolean literals: `true`, `false`
/// - Null literal: `null`
/// - Numeric literals: `0`, `42`, `3.14`
/// - `undefined` identifier
///
/// Returns `None` if the expression is too complex for the fast path.
#[inline]
fn try_parse_simple_expression<'a>(
    arena: &ParseArena,
    content: &str,
    offset: usize,
    line_offsets: &[usize],
) -> Option<Expression<'a>> {
    let bytes = content.as_bytes();
    if bytes.is_empty() {
        return None;
    }

    let first = bytes[0];

    // Fast path for identifiers and member expressions (most common case)
    if is_ident_start_byte(first) {
        // Try simple ident/member first
        if let Some(expr) = try_parse_ident_or_member(arena, content, bytes, offset, line_offsets) {
            return Some(expr);
        }
        // Try call expression: `fn(arg)`, `obj.method(args)`
        if let Some(expr) = try_parse_call_expression(arena, content, bytes, offset, line_offsets) {
            return Some(expr);
        }
        // Try update expression: `count++`, `count--`
        if let Some(expr) = try_parse_update_expression(arena, content, bytes, offset, line_offsets)
        {
            return Some(expr);
        }
        // Might be `ident op expr` - try binary/logical/ternary
        if let Some(expr) =
            try_parse_compound_expression(arena, content, bytes, offset, line_offsets)
        {
            return Some(expr);
        }
        // Try ternary: `cond ? a : b`
        if let Some(expr) = try_parse_ternary(arena, content, bytes, offset, line_offsets) {
            return Some(expr);
        }
        return None;
    }

    // Fast path for numeric literals
    if first.is_ascii_digit() {
        if let Some(expr) = try_parse_numeric_literal(content, bytes, offset, line_offsets) {
            return Some(expr);
        }
        // Might be `123 === x` etc
        return try_parse_compound_expression(arena, content, bytes, offset, line_offsets);
    }

    // Fast path for string literals
    if first == b'\'' || first == b'"' {
        return try_parse_string_literal(content, bytes, offset, line_offsets);
    }

    // Fast path for negative numeric literals: -1, -3.14
    if first == b'-' && bytes.len() >= 2 && bytes[1].is_ascii_digit() {
        return try_parse_negative_numeric(arena, content, bytes, offset, line_offsets);
    }

    // Fast path for !expr (logical not)
    if first == b'!' && bytes.len() >= 2 {
        return try_parse_unary_not(arena, content, bytes, offset, line_offsets);
    }

    // Fast path for parenthesized expressions: `(expr)`
    if first == b'(' {
        return try_parse_parenthesized(arena, content, bytes, offset, line_offsets);
    }

    None
}

/// Try to parse a unary `!expr` where expr is a simple expression.
#[inline]
fn try_parse_unary_not<'a>(
    arena: &ParseArena,
    content: &str,
    bytes: &[u8],
    offset: usize,
    line_offsets: &[usize],
) -> Option<Expression<'a>> {
    let inner = &content[1..];
    let inner_bytes = &bytes[1..];
    if inner_bytes.is_empty() {
        return None;
    }

    // Try to parse the argument as a simple atom
    let arg = try_parse_atom(arena, inner, inner_bytes, offset + 1, line_offsets)?;

    Some(Expression::from_node(JsNode::UnaryExpression {
        start: offset as u32,
        end: (offset + content.len()) as u32,
        loc: create_typed_loc(offset, offset + content.len(), line_offsets),
        operator: CompactString::from("!"),
        prefix: true,
        argument: arena.alloc_js_node(expr_to_node(arg)),
    }))
}

/// Try to parse a "simple atom" - identifier, member expr, numeric, string, bool, null.
/// This is used as a building block for compound expressions.
#[inline]
fn try_parse_atom<'a>(
    arena: &ParseArena,
    content: &str,
    bytes: &[u8],
    offset: usize,
    line_offsets: &[usize],
) -> Option<Expression<'a>> {
    if bytes.is_empty() {
        return None;
    }
    let first = bytes[0];
    if is_ident_start_byte(first) {
        return try_parse_ident_or_member(arena, content, bytes, offset, line_offsets);
    }
    if first.is_ascii_digit() {
        return try_parse_numeric_literal(content, bytes, offset, line_offsets);
    }
    if first == b'\'' || first == b'"' {
        return try_parse_string_literal(content, bytes, offset, line_offsets);
    }
    if first == b'-' && bytes.len() >= 2 && bytes[1].is_ascii_digit() {
        return try_parse_negative_numeric(arena, content, bytes, offset, line_offsets);
    }
    None
}

/// Try to parse call expressions: `fn(arg)`, `obj.method(a, b)`
/// Handles simple call expressions where callee is an ident/member and args are atoms.
#[inline]
fn try_parse_call_expression<'a>(
    arena: &ParseArena,
    content: &str,
    bytes: &[u8],
    offset: usize,
    line_offsets: &[usize],
) -> Option<Expression<'a>> {
    // Find the opening '(' - callee must be ident/member
    let paren_pos = memchr::memchr(b'(', bytes)?;
    if paren_pos == 0 {
        return None;
    }

    // Everything after ')' must be empty (no chaining for now)
    let last = *bytes.last()?;
    if last != b')' {
        return None;
    }

    // Parse callee as ident/member
    let callee_str = &content[..paren_pos];
    let callee_bytes = &bytes[..paren_pos];
    if !is_ident_start_byte(callee_bytes[0]) {
        return None;
    }
    let callee = try_parse_ident_or_member(arena, callee_str, callee_bytes, offset, line_offsets)?;

    // Parse arguments between parens.
    //
    // `args_region` is the raw byte slice between `(` and `)`. `args_str` is
    // its trimmed form, used for the comma-split scan. We must add the byte
    // count of the *leading* whitespace that `.trim()` stripped back into
    // every per-argument offset — otherwise multi-line argument lists like
    //
    //     {@render fn(
    //           a,
    //           b,
    //         )}
    //
    // record each argument's source offset 7 bytes (`\n` + 6 spaces) earlier
    // than its real position, and the SSR render-tag visitor slices the
    // *wrong* bytes out of source when it re-emits the call.
    // (baseballyama/rsvelte#159)
    let args_start = paren_pos + 1;
    let args_end = bytes.len() - 1;
    let args_region = &content[args_start..args_end];
    let args_str = args_region.trim();
    let args_leading_ws = args_region.len() - args_region.trim_start().len();

    let arguments = if args_str.is_empty() {
        Vec::new()
    } else {
        // Split by top-level commas (no nested parens/brackets)
        let mut args = Vec::new();
        let args_bytes = args_str.as_bytes();
        let mut depth = 0u32;
        let mut start = 0usize;
        let mut in_string = 0u8;

        for (i, &b) in args_bytes.iter().enumerate() {
            if in_string != 0 {
                if b == in_string && (i == 0 || args_bytes[i - 1] != b'\\') {
                    in_string = 0;
                }
                continue;
            }
            match b {
                b'\'' | b'"' | b'`' => in_string = b,
                b'(' | b'[' | b'{' => depth += 1,
                b')' | b']' | b'}' => {
                    if depth == 0 {
                        return None;
                    } // Unbalanced
                    depth -= 1;
                }
                b',' if depth == 0 => {
                    let arg_str = args_str[start..i].trim();
                    let arg_bytes = arg_str.as_bytes();
                    let arg_offset = offset
                        + args_start
                        + args_leading_ws
                        + start
                        + (args_str[start..i].len() - args_str[start..i].trim_start().len());
                    let arg = try_parse_atom(arena, arg_str, arg_bytes, arg_offset, line_offsets)?;
                    args.push(expr_to_node(arg));
                    start = i + 1;
                }
                _ => {}
            }
        }
        if depth != 0 {
            return None;
        }
        // Last argument
        let arg_str = args_str[start..].trim();
        if !arg_str.is_empty() {
            let arg_bytes = arg_str.as_bytes();
            let arg_offset = offset
                + args_start
                + args_leading_ws
                + start
                + (args_str[start..].len() - args_str[start..].trim_start().len());
            let arg = try_parse_atom(arena, arg_str, arg_bytes, arg_offset, line_offsets)?;
            args.push(expr_to_node(arg));
        }
        args
    };

    let total_end = offset + content.len();
    Some(Expression::from_node(JsNode::CallExpression {
        start: offset as u32,
        end: total_end as u32,
        loc: create_typed_loc(offset, total_end, line_offsets),
        callee: arena.alloc_js_node(expr_to_node(callee)),
        arguments: arena.alloc_js_children(arguments),
        optional: false,
    }))
}

/// Try to parse update expressions: `count++`, `count--`, `++count`, `--count`
#[inline]
fn try_parse_update_expression<'a>(
    arena: &ParseArena,
    content: &str,
    bytes: &[u8],
    offset: usize,
    line_offsets: &[usize],
) -> Option<Expression<'a>> {
    let len = bytes.len();
    if len < 3 {
        return None;
    }

    // Postfix: `ident++` or `ident--`
    if bytes[len - 2] == bytes[len - 1] && (bytes[len - 1] == b'+' || bytes[len - 1] == b'-') {
        let arg_str = &content[..len - 2];
        let arg_bytes = &bytes[..len - 2];
        if !arg_str.is_empty() && is_ident_start_byte(arg_bytes[0]) {
            let arg = try_parse_ident_or_member(arena, arg_str, arg_bytes, offset, line_offsets)?;
            let op = if bytes[len - 1] == b'+' { "++" } else { "--" };
            return Some(Expression::from_node(JsNode::UpdateExpression {
                start: offset as u32,
                end: (offset + len) as u32,
                loc: create_typed_loc(offset, offset + len, line_offsets),
                operator: CompactString::from(op),
                argument: arena.alloc_js_node(expr_to_node(arg)),
                prefix: false,
            }));
        }
    }

    // Prefix: `++ident` or `--ident`
    if bytes[0] == bytes[1] && (bytes[0] == b'+' || bytes[0] == b'-') {
        let arg_str = &content[2..];
        let arg_bytes = &bytes[2..];
        if !arg_str.is_empty() && is_ident_start_byte(arg_bytes[0]) {
            let arg =
                try_parse_ident_or_member(arena, arg_str, arg_bytes, offset + 2, line_offsets)?;
            let op = if bytes[0] == b'+' { "++" } else { "--" };
            return Some(Expression::from_node(JsNode::UpdateExpression {
                start: offset as u32,
                end: (offset + len) as u32,
                loc: create_typed_loc(offset, offset + len, line_offsets),
                operator: CompactString::from(op),
                argument: arena.alloc_js_node(expr_to_node(arg)),
                prefix: true,
            }));
        }
    }

    None
}

/// Try to parse ternary expressions: `cond ? consequent : alternate`
#[inline]
fn try_parse_ternary<'a>(
    arena: &ParseArena,
    content: &str,
    bytes: &[u8],
    offset: usize,
    line_offsets: &[usize],
) -> Option<Expression<'a>> {
    // Find '?' at top level (not inside strings/parens)
    let mut depth = 0u32;
    let mut in_string = 0u8;
    let mut q_pos = None;

    for (i, &b) in bytes.iter().enumerate() {
        if in_string != 0 {
            if b == in_string && (i == 0 || bytes[i - 1] != b'\\') {
                in_string = 0;
            }
            continue;
        }
        match b {
            b'\'' | b'"' | b'`' => in_string = b,
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => depth = depth.saturating_sub(1),
            b'?' if depth == 0 => {
                // Ensure it's not `?.` (optional chaining)
                if i + 1 < bytes.len() && bytes[i + 1] == b'.' {
                    continue;
                }
                q_pos = Some(i);
                break;
            }
            _ => {}
        }
    }

    let q_pos = q_pos?;

    // Find ':' after '?' at top level
    let mut depth = 0u32;
    let mut in_string = 0u8;
    let mut colon_pos = None;

    for (i, &b) in bytes[q_pos + 1..].iter().enumerate() {
        let abs_i = q_pos + 1 + i;
        if in_string != 0 {
            if b == in_string && (i == 0 || bytes[abs_i - 1] != b'\\') {
                in_string = 0;
            }
            continue;
        }
        match b {
            b'\'' | b'"' | b'`' => in_string = b,
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => depth = depth.saturating_sub(1),
            b':' if depth == 0 => {
                colon_pos = Some(abs_i);
                break;
            }
            _ => {}
        }
    }

    let colon_pos = colon_pos?;

    let test_raw = &content[..q_pos];
    let cons_raw = &content[q_pos + 1..colon_pos];
    let alt_raw = &content[colon_pos + 1..];

    let test_str = test_raw.trim();
    let cons_str = cons_raw.trim();
    let alt_str = alt_raw.trim();

    if test_str.is_empty() || cons_str.is_empty() || alt_str.is_empty() {
        return None;
    }

    // Calculate precise offsets accounting for leading whitespace
    let test_offset = offset + (test_raw.len() - test_raw.trim_start().len());
    let cons_offset = offset + q_pos + 1 + (cons_raw.len() - cons_raw.trim_start().len());
    let alt_offset = offset + colon_pos + 1 + (alt_raw.len() - alt_raw.trim_start().len());

    let test = try_parse_atom(
        arena,
        test_str,
        test_str.as_bytes(),
        test_offset,
        line_offsets,
    )
    .or_else(|| {
        try_parse_compound_expression(
            arena,
            test_str,
            test_str.as_bytes(),
            test_offset,
            line_offsets,
        )
    })?;
    let cons = try_parse_atom(
        arena,
        cons_str,
        cons_str.as_bytes(),
        cons_offset,
        line_offsets,
    )?;
    let alt = try_parse_atom(arena, alt_str, alt_str.as_bytes(), alt_offset, line_offsets)?;

    let total_end = offset + content.len();
    Some(Expression::from_node(JsNode::ConditionalExpression {
        start: offset as u32,
        end: total_end as u32,
        loc: create_typed_loc(offset, total_end, line_offsets),
        test: arena.alloc_js_node(expr_to_node(test)),
        consequent: arena.alloc_js_node(expr_to_node(cons)),
        alternate: arena.alloc_js_node(expr_to_node(alt)),
    }))
}

/// Try to parse parenthesized expressions: `(expr)`
#[inline]
fn try_parse_parenthesized<'a>(
    arena: &ParseArena,
    content: &str,
    bytes: &[u8],
    offset: usize,
    line_offsets: &[usize],
) -> Option<Expression<'a>> {
    // Find the matching ')' for the opening '('
    let mut depth = 1u32;
    let mut in_string = 0u8;
    let mut close = None;
    for (i, &b) in bytes[1..].iter().enumerate() {
        if in_string != 0 {
            if b == in_string && (i == 0 || bytes[i] != b'\\') {
                in_string = 0;
            }
            continue;
        }
        match b {
            b'\'' | b'"' | b'`' => in_string = b,
            b'(' => depth += 1,
            b')' => {
                depth -= 1;
                if depth == 0 {
                    close = Some(i + 1);
                    break;
                }
            }
            _ => {}
        }
    }
    let close = close?;

    // Check what follows the closing paren
    let after_close = &bytes[close + 1..];

    // Skip whitespace after ')'
    let ws_skip = after_close
        .iter()
        .position(|&b| b != b' ' && b != b'\t' && b != b'\n' && b != b'\r')
        .unwrap_or(after_close.len());

    // Check for arrow function: (...) => body
    if after_close.len() >= ws_skip + 2
        && after_close[ws_skip] == b'='
        && after_close[ws_skip + 1] == b'>'
    {
        return try_parse_arrow_function(
            arena,
            content,
            bytes,
            offset,
            line_offsets,
            close,
            ws_skip,
        );
    }

    // Simple parenthesized: (expr) with nothing after
    if close + 1 == bytes.len() {
        let inner = content[1..close].trim();
        if inner.is_empty() {
            return None;
        }
        return try_parse_atom(arena, inner, inner.as_bytes(), offset + 1, line_offsets);
    }

    None
}

/// Try to parse arrow functions: `() => expr`, `(x) => expr`, `(a, b) => expr`
/// Also handles expression body only (not block body `() => { ... }`).
#[inline]
fn try_parse_arrow_function<'a>(
    arena: &ParseArena,
    content: &str,
    _bytes: &[u8],
    offset: usize,
    line_offsets: &[usize],
    close_paren: usize,
    ws_after_paren: usize,
) -> Option<Expression<'a>> {
    let arrow_start = close_paren + 1 + ws_after_paren + 2; // past "=>"
    let body_str = content[arrow_start..].trim();

    if body_str.is_empty() {
        return None;
    }

    // Block body `() => { ... }` — too complex for fast path
    if body_str.as_bytes()[0] == b'{' {
        return None;
    }

    let body_bytes = body_str.as_bytes();
    let body_offset = offset
        + arrow_start
        + (content[arrow_start..].len() - content[arrow_start..].trim_start().len());

    // Parse body as expression
    let body = try_parse_atom(arena, body_str, body_bytes, body_offset, line_offsets)
        .or_else(|| {
            try_parse_compound_expression(arena, body_str, body_bytes, body_offset, line_offsets)
        })
        .or_else(|| {
            try_parse_call_expression(arena, body_str, body_bytes, body_offset, line_offsets)
        })
        .or_else(|| {
            try_parse_update_expression(arena, body_str, body_bytes, body_offset, line_offsets)
        })?;

    // Parse params between ( and ). Walk the raw `(...)` region (rather than the
    // trimmed string) so each identifier keeps its real source span — the public
    // `parse()` AST must match svelte/compiler, which assigns real param spans.
    let region = &content[1..close_paren];
    let region_base = offset + 1; // absolute position of `content[1]`
    let mut params_nodes = Vec::new();

    if !region.trim().is_empty() {
        let mut cursor = 0usize; // byte index within `region`
        for chunk in region.split(',') {
            let lead_ws = chunk.len() - chunk.trim_start().len();
            let p = chunk.trim();
            if p.is_empty() {
                return None;
            }
            let p_bytes = p.as_bytes();
            if !is_ident_start_byte(p_bytes[0]) {
                return None; // Destructuring params — too complex
            }
            if !p_bytes.iter().all(|&b| is_ident_continue_byte(b)) {
                return None; // Has type annotations or defaults — too complex
            }
            let p_start = region_base + cursor + lead_ws;
            let p_end = p_start + p.len();
            params_nodes.push(JsNode::Identifier {
                start: p_start as u32,
                end: p_end as u32,
                loc: create_typed_loc(p_start, p_end, line_offsets),
                name: CompactString::from(p),
                optional: false,
                type_annotation: None,
            });
            cursor += chunk.len() + 1; // +1 for the consumed comma
        }
    }
    let params = arena.alloc_js_children(params_nodes);

    let total_end = offset + content.len();
    Some(Expression::from_node(JsNode::ArrowFunctionExpression {
        start: offset as u32,
        end: total_end as u32,
        loc: create_typed_loc(offset, total_end, line_offsets),
        id: None,
        params,
        body: arena.alloc_js_node(expr_to_node(body)),
        expression: true,
        generator: false,
        r#async: false,
        // This fast path bails out on any TS syntax, so never generic.
        type_parameters: None,
    }))
}

/// Try to parse compound expressions: binary ops, logical ops, ternary.
/// Examples: `count > 5`, `a === b`, `a && b`, `x > 0 ? 'yes' : 'no'`
#[inline]
fn try_parse_compound_expression<'a>(
    arena: &ParseArena,
    content: &str,
    bytes: &[u8],
    offset: usize,
    line_offsets: &[usize],
) -> Option<Expression<'a>> {
    let len = bytes.len();

    // Scan for a binary/logical operator at the top level.
    // We need to find an operator surrounded by whitespace.
    // Strategy: scan forward to find an operator, split into left/right, parse each as atom.
    let mut i = 0;

    // Skip the first token (left operand)
    i = skip_simple_token(bytes, i);
    if i >= len {
        return None;
    }

    // There must be whitespace before the operator
    if bytes[i] != b' ' && bytes[i] != b'\t' {
        return None;
    }
    while i < len && (bytes[i] == b' ' || bytes[i] == b'\t') {
        i += 1;
    }
    if i >= len {
        return None;
    }

    // Try to match an operator
    let (op_str, op_len) = match_operator(bytes, i)?;

    let op_end = i + op_len;
    if op_end >= len {
        return None;
    }

    // There must be whitespace after the operator
    if bytes[op_end] != b' ' && bytes[op_end] != b'\t' {
        return None;
    }
    let mut right_start = op_end;
    while right_start < len && (bytes[right_start] == b' ' || bytes[right_start] == b'\t') {
        right_start += 1;
    }
    if right_start >= len {
        return None;
    }

    let left_content = content[..i].trim_end();
    let right_content = content[right_start..].trim_end();

    let left_bytes = left_content.as_bytes();
    let right_bytes = right_content.as_bytes();

    // Parse left side as atom
    let left = try_parse_atom(arena, left_content, left_bytes, offset, line_offsets)?;

    // Check if this is a ternary: `left op right ? consequent : alternate`
    // For now, only handle simple binary/logical
    let right = try_parse_atom(
        arena,
        right_content,
        right_bytes,
        offset + right_start,
        line_offsets,
    )?;

    let total_end = offset + content.len();

    // Determine if it's binary or logical
    match op_str {
        "&&" | "||" | "??" => Some(Expression::from_node(JsNode::LogicalExpression {
            start: offset as u32,
            end: total_end as u32,
            loc: create_typed_loc(offset, total_end, line_offsets),
            left: arena.alloc_js_node(expr_to_node(left)),
            operator: CompactString::from(op_str),
            right: arena.alloc_js_node(expr_to_node(right)),
        })),
        _ => Some(Expression::from_node(JsNode::BinaryExpression {
            start: offset as u32,
            end: total_end as u32,
            loc: create_typed_loc(offset, total_end, line_offsets),
            left: arena.alloc_js_node(expr_to_node(left)),
            operator: CompactString::from(op_str),
            right: arena.alloc_js_node(expr_to_node(right)),
        })),
    }
}

/// Skip a simple token (identifier, number, string, member expression) and return the position after it.
#[inline]
fn skip_simple_token(bytes: &[u8], start: usize) -> usize {
    let len = bytes.len();
    let mut pos = start;
    if pos >= len {
        return pos;
    }

    let first = bytes[pos];

    // String literal
    if first == b'\'' || first == b'"' {
        pos += 1;
        while pos < len && bytes[pos] != first {
            if bytes[pos] == b'\\' {
                pos += 1; // skip escape
            }
            pos += 1;
        }
        if pos < len {
            pos += 1; // closing quote
        }
        return pos;
    }

    // Negative number
    if first == b'-' && pos + 1 < len && bytes[pos + 1].is_ascii_digit() {
        pos += 1;
    }

    // Identifier or number with possible dots (member expressions)
    if is_ident_start_byte(bytes[pos]) || bytes[pos].is_ascii_digit() {
        while pos < len {
            let b = bytes[pos];
            if is_ident_continue_byte(b) || b == b'.' {
                pos += 1;
            } else {
                break;
            }
        }
        return pos;
    }

    pos
}

/// Try to match a binary or logical operator at position `i` in bytes.
/// Returns (operator_str, operator_byte_len) or None.
#[inline]
fn match_operator(bytes: &[u8], i: usize) -> Option<(&'static str, usize)> {
    let remaining = bytes.len() - i;

    // 3-char operators first
    if remaining >= 3 {
        match (bytes[i], bytes[i + 1], bytes[i + 2]) {
            (b'=', b'=', b'=') => return Some(("===", 3)),
            (b'!', b'=', b'=') => return Some(("!==", 3)),
            (b'>', b'>', b'>') => return Some((">>>", 3)),
            _ => {}
        }
    }

    // 2-char operators
    if remaining >= 2 {
        match (bytes[i], bytes[i + 1]) {
            (b'=', b'=') => return Some(("==", 2)),
            (b'!', b'=') => return Some(("!=", 2)),
            (b'<', b'=') => return Some(("<=", 2)),
            (b'>', b'=') => return Some((">=", 2)),
            (b'&', b'&') => return Some(("&&", 2)),
            (b'|', b'|') => return Some(("||", 2)),
            (b'?', b'?') => return Some(("??", 2)),
            (b'*', b'*') => return Some(("**", 2)),
            (b'<', b'<') => return Some(("<<", 2)),
            (b'>', b'>') => return Some((">>", 2)),
            _ => {}
        }
    }

    // 1-char operators
    if remaining >= 1 {
        match bytes[i] {
            b'+' => return Some(("+", 1)),
            b'-' => return Some(("-", 1)),
            b'*' => return Some(("*", 1)),
            b'/' => return Some(("/", 1)),
            b'%' => return Some(("%", 1)),
            b'<' => return Some(("<", 1)),
            b'>' => return Some((">", 1)),
            b'&' => return Some(("&", 1)),
            b'|' => return Some(("|", 1)),
            b'^' => return Some(("^", 1)),
            _ => {}
        }
    }

    None
}

/// Try to parse a negative numeric literal (-1, -3.14).
#[inline]
fn try_parse_negative_numeric<'a>(
    arena: &ParseArena,
    content: &str,
    bytes: &[u8],
    offset: usize,
    line_offsets: &[usize],
) -> Option<Expression<'a>> {
    // Parse the numeric part (after the minus sign)
    let num_content = &content[1..];
    let num_bytes = &bytes[1..];
    let len = num_bytes.len();
    let mut pos = 0;
    let mut has_dot = false;

    // Quick reject for non-decimal prefixes
    if len >= 2 && num_bytes[0] == b'0' {
        let second = num_bytes[1];
        if second == b'x'
            || second == b'X'
            || second == b'o'
            || second == b'O'
            || second == b'b'
            || second == b'B'
        {
            return None;
        }
    }

    while pos < len {
        let b = num_bytes[pos];
        if b.is_ascii_digit() {
            pos += 1;
        } else if b == b'.' && !has_dot && pos + 1 < len && num_bytes[pos + 1].is_ascii_digit() {
            has_dot = true;
            pos += 1;
        } else {
            return None;
        }
    }

    if pos != len {
        return None;
    }

    // This is a UnaryExpression(-numeric)
    let value: f64 = num_content.parse().ok()?;
    let total_len = content.len();

    // Create the inner numeric literal
    let argument = create_numeric_literal(
        value,
        num_content,
        offset + 1,
        offset + total_len,
        line_offsets,
    );

    Some(Expression::from_node(JsNode::UnaryExpression {
        start: offset as u32,
        end: (offset + total_len) as u32,
        loc: create_typed_loc(offset, offset + total_len, line_offsets),
        operator: CompactString::from("-"),
        prefix: true,
        argument: arena.alloc_js_node(expr_to_node(argument)),
    }))
}

/// Try to parse a simple string literal ('...' or "...").
///
/// Handles simple strings without escape sequences that span to the end of content.
/// Does NOT handle: template literals, strings with escape sequences, or
/// strings that don't consume the entire content.
#[inline]
fn try_parse_string_literal<'a>(
    content: &str,
    bytes: &[u8],
    offset: usize,
    line_offsets: &[usize],
) -> Option<Expression<'a>> {
    let len = bytes.len();
    if len < 2 {
        return None;
    }

    let quote = bytes[0];
    let mut pos = 1;
    let mut has_escape = false;

    while pos < len {
        let b = bytes[pos];
        if b == b'\\' {
            // Has escape sequences - bail to OXC for correct handling
            has_escape = true;
            pos += 2; // skip escape
            if pos > len {
                return None;
            }
            continue;
        }
        if b == quote {
            // Found closing quote - check if it's at the end
            if pos + 1 == len {
                // Simple string literal consuming entire content
                if has_escape {
                    // Has escapes - let OXC handle the value decoding
                    return None;
                }
                let value = &content[1..pos]; // without quotes
                return Some(create_string_literal(
                    value,
                    content,
                    offset,
                    offset + len,
                    line_offsets,
                ));
            }
            // Closing quote not at end - not a simple string
            return None;
        }
        pos += 1;
    }

    // No closing quote found
    None
}

/// Check if a byte can start a JS identifier (ASCII subset).
#[inline(always)]
fn is_ident_start_byte(b: u8) -> bool {
    b.is_ascii_alphabetic() || b == b'_' || b == b'$'
}

/// Check if a byte can continue a JS identifier (ASCII subset).
#[inline(always)]
fn is_ident_continue_byte(b: u8) -> bool {
    b.is_ascii_alphanumeric() || b == b'_' || b == b'$'
}

/// Try to parse an identifier, dotted member expression, or keyword literal.
///
/// Scans the content and validates it matches: `ident(.ident)*` or `ident(?.ident)*`
/// Returns None if it contains anything else.
#[inline]
fn try_parse_ident_or_member<'a>(
    arena: &ParseArena,
    content: &str,
    bytes: &[u8],
    offset: usize,
    line_offsets: &[usize],
) -> Option<Expression<'a>> {
    let len = bytes.len();

    // Scan the first identifier segment
    let mut pos = 0;
    while pos < len && is_ident_continue_byte(bytes[pos]) {
        pos += 1;
    }

    let first_ident_end = pos;
    if first_ident_end == 0 {
        return None;
    }

    // If we consumed everything, it's a simple identifier or keyword literal
    if pos == len {
        let name = content;
        // Check for keyword literals
        match name {
            "true" => {
                return Some(create_literal(
                    LiteralValue::Bool(true),
                    "true",
                    offset,
                    offset + 4,
                    line_offsets,
                ));
            }
            "false" => {
                return Some(create_literal(
                    LiteralValue::Bool(false),
                    "false",
                    offset,
                    offset + 5,
                    line_offsets,
                ));
            }
            "null" => {
                return Some(create_literal(
                    LiteralValue::Null,
                    "null",
                    offset,
                    offset + 4,
                    line_offsets,
                ));
            }
            _ => {
                // Simple identifier
                return Some(create_identifier(name, offset, offset + len, line_offsets));
            }
        }
    }

    // Check for dotted member expression: ident.ident.ident or ident?.ident
    // Build segments: (name, start_in_content, end_in_content)
    let mut segments: Vec<(&str, usize, usize)> = Vec::new();
    segments.push((&content[..first_ident_end], 0, first_ident_end));

    while pos < len {
        // Check for optional chaining `?.` or regular `.`
        if bytes[pos] == b'?' && pos + 1 < len && bytes[pos + 1] == b'.' {
            // Optional chaining - we bail to OXC for now because the AST
            // structure for optional chaining is more complex (ChainExpression).
            // TODO: support optional chaining in the fast path
            return None;
        } else if bytes[pos] == b'.' {
            pos += 1; // consume '.'
        } else {
            // Not a dot - this isn't a simple member expression
            return None;
        }

        // Scan next identifier segment
        let seg_start = pos;
        if pos >= len || !is_ident_start_byte(bytes[pos]) {
            return None; // e.g., `foo.123` or `foo.`
        }
        while pos < len && is_ident_continue_byte(bytes[pos]) {
            pos += 1;
        }
        segments.push((&content[seg_start..pos], seg_start, pos));
    }

    // If we didn't consume everything, it's not a simple expression
    if pos != len {
        return None;
    }

    // Build the AST: nested MemberExpression nodes
    // Start with the leftmost identifier
    let (name, seg_start, seg_end) = segments[0];
    let mut result = create_identifier(name, offset + seg_start, offset + seg_end, line_offsets);

    for &(prop_name, seg_start, seg_end) in &segments[1..] {
        let prop_node = JsNode::Identifier {
            start: (offset + seg_start) as u32,
            end: (offset + seg_end) as u32,
            loc: create_typed_loc(offset + seg_start, offset + seg_end, line_offsets),
            name: CompactString::from(prop_name),
            optional: false,
            type_annotation: None,
        };

        result = Expression::from_node(JsNode::MemberExpression {
            start: offset as u32,
            end: (offset + seg_end) as u32,
            loc: create_typed_loc(offset, offset + seg_end, line_offsets),
            object: arena.alloc_js_node(expr_to_node(result)),
            property: arena.alloc_js_node(prop_node),
            computed: false,
            optional: false,
        });
    }

    Some(result)
}

/// Try to parse a simple numeric literal (integer or decimal).
///
/// Handles: `0`, `42`, `3.14`, `0.5`
/// Does NOT handle: hex, octal, binary, exponential, bigint, separators.
#[inline]
fn try_parse_numeric_literal<'a>(
    content: &str,
    bytes: &[u8],
    offset: usize,
    line_offsets: &[usize],
) -> Option<Expression<'a>> {
    let len = bytes.len();
    let mut pos = 0;
    let mut has_dot = false;

    // Quick reject for non-decimal prefixes (0x, 0o, 0b, 0X, etc.)
    if len >= 2 && bytes[0] == b'0' {
        let second = bytes[1];
        if second == b'x'
            || second == b'X'
            || second == b'o'
            || second == b'O'
            || second == b'b'
            || second == b'B'
        {
            return None;
        }
    }

    while pos < len {
        let b = bytes[pos];
        if b.is_ascii_digit() {
            pos += 1;
        } else if b == b'.' && !has_dot && pos + 1 < len && bytes[pos + 1].is_ascii_digit() {
            has_dot = true;
            pos += 1;
        } else {
            // Contains non-numeric character (e, n, _, etc.)
            return None;
        }
    }

    if pos != len {
        return None;
    }

    // Parse the value
    let value: f64 = content.parse().ok()?;

    Some(create_numeric_literal(
        value,
        content,
        offset,
        offset + len,
        line_offsets,
    ))
}

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
pub fn parse_expression<'a>(
    arena: &ParseArena,
    content: &str,
    offset: usize,
    line_offsets: &[usize],
    template: &str,
    loose: bool,
    disallow_loose: bool,
    opening_token: char,
    ts: bool,
) -> Result<Expression<'a>, (String, usize)> {
    // Fast path: handle simple expressions (identifiers, member expressions,
    // boolean/null literals) without invoking OXC.
    if let Some(expr) = try_parse_simple_expression(arena, content, offset, line_offsets) {
        return Ok(expr);
    }

    // Use known TS mode: parse with TS only if the file uses TypeScript,
    // otherwise parse as JS directly. Fall back to the other mode only on failure.
    let result = parse_expression_with_typescript(arena, content, offset, line_offsets, ts)
        .or_else(|| parse_expression_with_typescript(arena, content, offset, line_offsets, !ts));

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
        && let Some((error_msg, _)) = check_js_parse_error_with_pos(content)
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
pub fn parse_destructuring_pattern<'a>(
    arena: &ParseArena,
    content: &str,
    offset: usize,
    line_offsets: &[usize],
) -> Option<Expression<'a>> {
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

            if !result.diagnostics.is_empty() {
                return None;
            }

            if let Some(oxc_ast::ast::Statement::VariableDeclaration(var_decl)) =
                result.program.body.first()
                && let Some(declarator) = var_decl.declarations.first()
            {
                let adjusted_offset = offset.wrapping_sub(4);
                let pattern_json = convert_binding_pattern_for_param(
                    arena,
                    &declarator.id,
                    adjusted_offset,
                    line_offsets,
                );
                return Some(Expression::from_json(pattern_json));
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
pub fn parse_expression_with_end<'a>(
    arena: &ParseArena,
    content: &str,
    offset: usize,
    end: usize,
    line_offsets: &[usize],
    _template: &str,
    loose: bool,
    disallow_loose: bool,
    _opening_token: char,
    ts: bool,
) -> Result<Expression<'a>, (String, usize)> {
    // Fast path: handle simple expressions without OXC
    if let Some(expr) = try_parse_simple_expression(arena, content, offset, line_offsets) {
        return Ok(expr);
    }

    // Use known TS mode, fall back to other mode on failure
    let result = parse_expression_with_typescript(arena, content, offset, line_offsets, ts)
        .or_else(|| parse_expression_with_typescript(arena, content, offset, line_offsets, !ts));

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
        && let Some((error_msg, _)) = check_js_parse_error_with_pos(content)
    {
        return Err((error_msg, offset));
    }

    // Fall back to invalid identifier
    Ok(create_invalid_identifier(offset, end, line_offsets))
}

/// Check if a JavaScript expression has parse errors, returning the failure
/// position alongside the message.
///
/// Returns `Some((message, pos_in_content))` on parse failure. `pos_in_content`
/// is the 0-based byte offset *within `content`* where the failure occurs (so
/// callers can add their own absolute-offset base) — mirroring upstream
/// Svelte's `js_parse_error(err.pos, ...)` semantics where `err.pos` is the
/// acorn-reported position. When OXC doesn't surface a position (e.g. the
/// synthetic "Assigning to rvalue" case) this falls back to 0 so the caller
/// still gets a deterministic span.
///
/// `content` is wrapped in `(...)` before being handed to OXC, so we subtract
/// one from OXC's reported `offset + len` (the right-edge of the labeled span)
/// to land back in the unwrapped expression's coordinate space — and clamp
/// the result to `[0, content.len()]`. Acorn reports `err.pos` at the point
/// where it stopped consuming tokens, which corresponds to the *end* of the
/// problematic region, not its start.
pub fn check_js_parse_error_with_pos(content: &str) -> Option<(String, usize)> {
    let mut wrapped = String::with_capacity(content.len() + 2);
    wrapped.push('(');
    wrapped.push_str(content);
    wrapped.push(')');

    let probe = |source_type: SourceType| -> Option<(String, usize)> {
        with_oxc_allocator(|allocator| {
            let parser = OxcParser::new(allocator, &wrapped, source_type);
            let result = parser.parse();
            if let Some(first_error) = result.diagnostics.first() {
                let pos = first_error
                    .labels
                    .first()
                    .map(|label| label.offset() as usize + label.len() as usize)
                    .map(|wrapped_end| {
                        // Strip the leading `(` we added and clamp.
                        wrapped_end.saturating_sub(1).min(content.len())
                    })
                    .unwrap_or(0);
                return Some((first_error.message.to_string(), pos));
            }
            // Check for invalid assignment targets that OXC doesn't report as errors
            if let Some(oxc_ast::ast::Statement::ExpressionStatement(expr_stmt)) =
                result.program.body.first()
                && is_invalid_assignment_expression(&expr_stmt.expression)
            {
                return Some(("Assigning to rvalue".to_string(), 0));
            }
            None
        })
    };

    // Try TypeScript first
    let ts_result = probe(SourceType::ts());

    // No TS errors means valid
    ts_result.as_ref()?;

    // Try JavaScript
    let js_result = probe(SourceType::mjs());

    // No JS errors means valid
    js_result.as_ref()?;

    js_result.or(ts_result)
}

/// Check whether a parameter list (e.g. snippet params) parses as valid
/// function parameters in the given language mode.
///
/// Mirrors upstream's snippet handling (1-parse/state/tag.js), which builds
/// `${params} => {}` and parses it with `parse_expression_at` using the
/// file's `parser.ts` mode — so TypeScript annotations in a snippet's
/// parameters are a `js_parse_error` unless the component uses `lang="ts"`.
///
/// Returns `Some((message, pos_in_params))` when parsing fails.
pub fn check_params_parse_error(params: &str, ts: bool) -> Option<(String, usize)> {
    let mut wrapped = String::with_capacity(params.len() + 9);
    wrapped.push('(');
    wrapped.push_str(params);
    wrapped.push_str(") => {}");

    with_oxc_allocator(|allocator| {
        let source_type = if ts {
            SourceType::ts()
        } else {
            SourceType::mjs()
        };
        let result = OxcParser::new(allocator, &wrapped, source_type).parse();
        result.diagnostics.first().map(|first_error| {
            let pos = first_error
                .labels
                .first()
                .map(|label| {
                    (label.offset() as usize)
                        .saturating_sub(1)
                        .min(params.len())
                })
                .unwrap_or(0);
            (first_error.message.to_string(), pos)
        })
    })
}

/// Check whether `content` parses as a JS/TS *statement* (program), returning
/// the first parse error as `Some((message, pos_in_content))`.
///
/// Mirrors upstream's `parse_statement_at` (acorn) used by
/// `read_declaration()` in `1-parse/state/tag.js`: a declaration-tag body that
/// does not parse as a statement is rethrown in strict mode and surfaces as
/// `js_parse_error` (e.g. `{let }` → "The keyword 'let' is reserved").
pub fn check_js_statement_parse_error(content: &str, ts: bool) -> Option<(String, usize)> {
    with_oxc_allocator(|allocator| {
        let source_type = if ts {
            SourceType::ts()
        } else {
            SourceType::mjs()
        };
        let result = OxcParser::new(allocator, content, source_type).parse();
        result.diagnostics.first().map(|first_error| {
            let pos = first_error
                .labels
                .first()
                .map(|label| (label.offset() as usize).min(content.len()))
                .unwrap_or(0);
            (first_error.message.to_string(), pos)
        })
    })
}

/// For an *invalid* expression string, determine whether the failure is caused
/// by **trailing tokens after an otherwise-complete expression** (e.g. `a b c`)
/// rather than an incomplete / malformed expression (e.g. `a +`).
///
/// Returns `Some(offset)` — the byte offset (within `content`) of the first
/// trailing non-whitespace character — when a complete leading expression is
/// followed by more input. Returns `None` when the expression itself is
/// incomplete or otherwise invalid.
///
/// This mirrors upstream Svelte's `read_expression` + `eat(close, true)` flow:
/// acorn parses one maximal expression, and any leftover surfaces as
/// `expected_token` while a broken expression surfaces as `js_parse_error`.
pub fn trailing_token_offset(content: &str) -> Option<usize> {
    // Wrap in parens so a *complete* leading expression is consumed greedily and
    // the first error label lands on the first leftover token. (Parsing the bare
    // string as a program is unreliable: OXC's statement-level error recovery
    // folds trailing tokens into one recovered node, hiding the boundary.)
    let mut wrapped = String::with_capacity(content.len() + 2);
    wrapped.push('(');
    wrapped.push_str(content);
    wrapped.push(')');

    let probe = |source_type: SourceType| -> Option<usize> {
        with_oxc_allocator(|allocator| {
            let result = OxcParser::new(allocator, &wrapped, source_type).parse();
            let first_error = result.diagnostics.first()?;
            let label = first_error.labels.first()?;
            // Map the label's *start* back into `content` (strip the leading `(`).
            let start = label.offset() as usize;
            if start == 0 {
                return None;
            }
            let content_pos = start - 1;
            // A trailing-token error has leftover input *before* the synthetic
            // closing `)`; an incomplete expression errors at/after the end.
            if content_pos >= content.len() {
                return None;
            }
            Some(content_pos)
        })
    };
    probe(SourceType::ts()).or_else(|| probe(SourceType::mjs()))
}

/// Create an identifier for invalid expressions
fn create_invalid_identifier<'a>(
    start: usize,
    end: usize,
    _line_offsets: &[usize],
) -> Expression<'a> {
    // Note: Similar to get_loose_identifier, invalid identifiers don't include 'loc'
    Expression::from_node(JsNode::Identifier {
        start: start as u32,
        end: end as u32,
        loc: None,
        name: CompactString::from(""),
        optional: false,
        type_annotation: None,
    })
}

/// Check if an expression is an assignment to an invalid target (e.g., `42 = nope`).
/// OXC may parse these without errors, but they should be treated as parse errors.
fn is_invalid_assignment_expression<'a>(expr: &oxc_ast::ast::Expression<'a>) -> bool {
    // Unwrap parenthesized expressions
    let inner = match expr {
        oxc_ast::ast::Expression::ParenthesizedExpression(paren) => &paren.expression,
        _ => expr,
    };

    if let oxc_ast::ast::Expression::AssignmentExpression(assign) = inner {
        return !is_valid_assignment_target(&assign.left);
    }
    false
}

/// Check if an assignment target is valid (identifier, member expression, etc.)
fn is_valid_assignment_target(target: &oxc_ast::ast::AssignmentTarget) -> bool {
    match target {
        oxc_ast::ast::AssignmentTarget::AssignmentTargetIdentifier(_) => true,
        oxc_ast::ast::AssignmentTarget::StaticMemberExpression(_) => true,
        oxc_ast::ast::AssignmentTarget::ComputedMemberExpression(_) => true,
        oxc_ast::ast::AssignmentTarget::PrivateFieldExpression(_) => true,
        // Destructuring patterns are valid
        oxc_ast::ast::AssignmentTarget::ArrayAssignmentTarget(_) => true,
        oxc_ast::ast::AssignmentTarget::ObjectAssignmentTarget(_) => true,
        // TSAs and other targets
        _ => false,
    }
}

fn parse_expression_with_typescript<'a>(
    arena: &ParseArena,
    content: &str,
    offset: usize,
    line_offsets: &[usize],
    use_typescript: bool,
) -> Option<Expression<'a>> {
    with_oxc_allocator(|allocator| {
        let source_type = if use_typescript {
            SourceType::ts()
        } else {
            SourceType::mjs()
        };

        // Wrap content in parens to parse as expression
        let mut wrapped = String::with_capacity(content.len() + 2);
        wrapped.push('(');
        wrapped.push_str(content);
        wrapped.push(')');
        let parser = OxcParser::new(allocator, &wrapped, source_type);
        let result = parser.parse();

        if result.diagnostics.is_empty()
            && let Some(oxc_ast::ast::Statement::ExpressionStatement(expr_stmt)) =
                result.program.body.first()
        {
            // Check for invalid assignment targets (e.g., `42 = nope`).
            // OXC may parse these without errors, but acorn/the Svelte compiler
            // treats them as parse errors ("Assigning to rvalue").
            if is_invalid_assignment_expression(&expr_stmt.expression) {
                return None;
            }

            // Adjust positions: subtract 1 for the opening paren we added
            let mut expr = convert_expression(arena, &expr_stmt.expression, offset, line_offsets);

            // Attach comments to the expression
            if !result.program.comments.is_empty() {
                // Get the actual expression's start and end positions
                let inner_expr = unwrap_parenthesized(&expr_stmt.expression);
                let expr_start = inner_expr.span().start;
                let expr_end = inner_expr.span().end;

                // Mirror upstream `parser.root.comments`: every comment seen
                // by acorn is pushed there in source order, *in addition* to
                // being attached as leading/trailing on the inner node.
                for comment in result.program.comments.iter() {
                    let comment_start = offset + comment.span.start as usize - 1;
                    let comment_end = offset + comment.span.end as usize - 1;
                    let raw = &wrapped[comment.span.start as usize..comment.span.end as usize];
                    let mut value = extract_comment_value(raw, comment.kind);
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
                    record_oxc_comment(
                        comment.kind,
                        value,
                        comment_start,
                        comment_end,
                        line_offsets,
                    );
                }

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

                // Interior comments: a comment that sits *inside* the
                // expression (after its start, before its end) is attached as a
                // `leadingComments` entry on the sub-node it immediately
                // precedes — mirroring acorn (e.g. `a instanceof /* c */ B`
                // attaches `/* c */` to `B`). Svelte 5.56.1 #18330.
                let interior_comments: Vec<(usize, Value)> = result
                    .program
                    .comments
                    .iter()
                    .filter(|c| c.span.end > expr_start && c.span.start < expr_end)
                    .map(|c| {
                        let comment_start = offset + c.span.start as usize - 1;
                        let comment_end = offset + c.span.end as usize - 1;
                        let raw = &wrapped[c.span.start as usize..c.span.end as usize];
                        let mut value = extract_comment_value(raw, c.kind);
                        if matches!(
                            c.kind,
                            oxc_ast::ast::CommentKind::SingleLineBlock
                                | oxc_ast::ast::CommentKind::MultiLineBlock
                        ) {
                            value = normalize_block_comment_indentation(
                                &value,
                                content,
                                c.span.start as usize - 1,
                            );
                        }
                        (
                            comment_end,
                            create_comment_object(
                                c.kind,
                                value,
                                comment_start,
                                comment_end,
                                line_offsets,
                            )
                            .to_value(),
                        )
                    })
                    .collect();

                // Attach comments to the expression
                if !leading_comments.is_empty()
                    || !trailing_comments.is_empty()
                    || !interior_comments.is_empty()
                {
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
                    // Attach each interior comment to the node it precedes.
                    for (comment_end, comment_obj) in interior_comments {
                        if let Some(target) =
                            json_min_node_start_at_or_after(&json_val, comment_end)
                        {
                            json_attach_leading_comment_at_start(
                                &mut json_val,
                                target,
                                &comment_obj,
                            );
                        }
                    }
                    expr = Expression::from_json(json_val);
                }
            }

            return Some(expr);
        }

        None
    })
}

/// Smallest `start` among AST nodes (objects carrying a non-comment `type`)
/// whose `start >= threshold`. Used to find the node an interior comment
/// immediately precedes.
fn json_min_node_start_at_or_after(node: &Value, threshold: usize) -> Option<usize> {
    fn walk(node: &Value, threshold: usize, best: &mut Option<usize>) {
        match node {
            Value::Object(map) => {
                let is_ast_node = map
                    .get("type")
                    .and_then(|t| t.as_str())
                    .is_some_and(|t| t != "Block" && t != "Line");
                if is_ast_node
                    && let Some(s) = map
                        .get("start")
                        .and_then(|v| v.as_u64())
                        .map(|v| v as usize)
                    && s >= threshold
                    && best.is_none_or(|b| s < b)
                {
                    *best = Some(s);
                }
                for v in map.values() {
                    walk(v, threshold, best);
                }
            }
            Value::Array(arr) => {
                for v in arr {
                    walk(v, threshold, best);
                }
            }
            _ => {}
        }
    }
    let mut best = None;
    walk(node, threshold, &mut best);
    best
}

/// Attach `comment` to the `leadingComments` of the first (pre-order /
/// outermost) AST node whose `start == target_start`.
fn json_attach_leading_comment_at_start(
    node: &mut Value,
    target_start: usize,
    comment: &Value,
) -> bool {
    match node {
        Value::Object(map) => {
            let is_ast_node = map
                .get("type")
                .and_then(|t| t.as_str())
                .is_some_and(|t| t != "Block" && t != "Line");
            let start = map
                .get("start")
                .and_then(|v| v.as_u64())
                .map(|v| v as usize);
            if is_ast_node && start == Some(target_start) {
                let entry = map
                    .entry("leadingComments".to_string())
                    .or_insert_with(|| Value::Array(Vec::new()));
                if let Value::Array(arr) = entry {
                    arr.push(comment.clone());
                }
                return true;
            }
            for v in map.values_mut() {
                if json_attach_leading_comment_at_start(v, target_start, comment) {
                    return true;
                }
            }
            false
        }
        Value::Array(arr) => {
            for v in arr.iter_mut() {
                if json_attach_leading_comment_at_start(v, target_start, comment) {
                    return true;
                }
            }
            false
        }
        _ => false,
    }
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
pub fn parse_typescript_params<'a>(
    arena: &ParseArena,
    content: &str,
    offset: usize,
    line_offsets: &[usize],
) -> Vec<Expression<'a>> {
    // Use TypeScript source type to parse type annotations
    let source_type = SourceType::ts();

    // Wrap as arrow function to parse parameters: "(msg: string) => {}"
    let mut wrapped = String::with_capacity(content.len() + 9);
    wrapped.push('(');
    wrapped.push_str(content);
    wrapped.push_str(") => {}");
    let mut params = Vec::new();

    enum ParseOutcome<'a> {
        Ok(Vec<Expression<'a>>),
        HasErrors,
    }

    let outcome = with_oxc_allocator(|allocator| {
        let parser = OxcParser::new(allocator, &wrapped, source_type);
        let result = parser.parse();

        if result.diagnostics.is_empty()
            && let Some(oxc_ast::ast::Statement::ExpressionStatement(expr_stmt)) =
                result.program.body.first()
            && let OxcExpression::ArrowFunctionExpression(arrow) = &expr_stmt.expression
        {
            let mut p = Vec::new();
            for param in &arrow.params.items {
                let param_expr = convert_formal_parameter(arena, param, offset - 1, line_offsets);
                p.push(param_expr);
            }
            // A rest parameter (`...args`) lives in `params.rest`, not `items`.
            // Without this it was silently dropped (a snippet `(...args)`
            // emitted `()` in svelte2tsx). Mirror the function-param rest handling.
            if let Some(rest) = &arrow.params.rest {
                let rest_start = (offset - 1) + rest.span.start as usize;
                let rest_end = (offset - 1) + rest.span.end as usize;
                let argument =
                    convert_binding_pattern(arena, &rest.rest.argument, offset - 1, line_offsets);
                p.push(Expression::from_node(JsNode::RestElement {
                    start: rest_start as u32,
                    end: rest_end as u32,
                    loc: create_typed_loc(rest_start, rest_end, line_offsets),
                    argument: arena.alloc_js_node(argument),
                }));
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

        if cleaned_result.diagnostics.is_empty()
            && let Some(oxc_ast::ast::Statement::ExpressionStatement(expr_stmt)) =
                cleaned_result.program.body.first()
            && let OxcExpression::ArrowFunctionExpression(arrow) = &expr_stmt.expression
        {
            let mut p = Vec::new();
            for param in &arrow.params.items {
                let param_expr = if stripped.removed_positions.is_empty() {
                    convert_formal_parameter(arena, param, offset - 1, line_offsets)
                } else {
                    convert_formal_parameter_with_remap(
                        arena,
                        param,
                        offset,
                        line_offsets,
                        &stripped,
                    )
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
        let mut search_from = 0usize;
        for part in &parts {
            let part = part.trim();
            if part.is_empty() {
                continue;
            }
            let stripped_part = strip_optional_markers(part);
            let part_offset_in_content = content[search_from..]
                .find(part)
                .map(|p| search_from + p)
                .unwrap_or(search_from);
            search_from = part_offset_in_content + part.len();
            let mut single_wrapped = String::with_capacity(stripped_part.content.len() + 9);
            single_wrapped.push('(');
            single_wrapped.push_str(&stripped_part.content);
            single_wrapped.push_str(") => {}");
            let single_result_expr = with_oxc_allocator(|allocator| {
                let single_parser = OxcParser::new(allocator, &single_wrapped, source_type);
                let single_result = single_parser.parse();
                if single_result.diagnostics.is_empty()
                    && let Some(oxc_ast::ast::Statement::ExpressionStatement(expr_stmt)) =
                        single_result.program.body.first()
                    && let OxcExpression::ArrowFunctionExpression(arrow) = &expr_stmt.expression
                    && let Some(param) = arrow.params.items.first()
                {
                    let param_expr = if stripped_part.removed_positions.is_empty() {
                        convert_formal_parameter(arena, param, offset - 1, line_offsets)
                    } else {
                        convert_formal_parameter_with_remap(
                            arena,
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
        let mut search_from = 0usize;
        for part in content.split(',') {
            let part = part.trim();
            if !part.is_empty() {
                let part_pos = content[search_from..]
                    .find(part)
                    .map(|p| search_from + p)
                    .unwrap_or(search_from);
                search_from = part_pos + part.len();
                // Extract just the name (before colon for typed params)
                let name = part.split(':').next().unwrap_or(part).trim();
                // Strip optional marker '?' from the end (e.g., "c?" -> "c")
                let name = name.strip_suffix('?').unwrap_or(name);
                let part_offset = offset + part_pos;
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
fn convert_formal_parameter_with_remap<'a>(
    arena: &ParseArena,
    param: &oxc_ast::ast::FormalParameter,
    base_offset: usize,
    line_offsets: &[usize],
    stripped: &StrippedOptionalMarkers,
) -> Expression<'a> {
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

    let expr = convert_formal_parameter(arena, param, base_offset - 1, line_offsets);

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

    Expression::from_json(val)
}

/// Convert oxc FormalParameter to our Expression format with type annotations.
/// Caller should pass pre-adjusted offset if needed (e.g., offset - 1 for paren-wrapped content).
fn convert_formal_parameter<'a>(
    arena: &ParseArena,
    param: &oxc_ast::ast::FormalParameter,
    adjusted_offset: usize,
    line_offsets: &[usize],
) -> Expression<'a> {
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
        let inner = convert_formal_parameter_inner(arena, param, adjusted_offset, line_offsets);
        obj.insert("parameter".to_string(), inner.as_json().clone());
        return Expression::from_json(Value::Object(obj));
    }

    convert_formal_parameter_inner(arena, param, adjusted_offset, line_offsets)
}

/// Inner implementation of convert_formal_parameter (without TSParameterProperty wrapping).
fn convert_formal_parameter_inner<'a>(
    arena: &ParseArena,
    param: &oxc_ast::ast::FormalParameter,
    adjusted_offset: usize,
    line_offsets: &[usize],
) -> Expression<'a> {
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

                // TS optional marker (`b?: T`); acorn emits it after `name`.
                if param.optional {
                    obj.insert("optional".to_string(), Value::Bool(true));
                }

                // Convert type annotation
                let type_ann_obj = convert_type_annotation_adjusted(
                    arena,
                    type_ann,
                    adjusted_offset,
                    line_offsets,
                );
                obj.insert("typeAnnotation".to_string(), type_ann_obj);

                Expression::from_json(Value::Object(obj))
            } else if param.optional {
                // Optional parameter without a type annotation (`b?`). acorn
                // extends the identifier span to include the `?`.
                let end = adjusted_offset + id.span.end as usize + 1;
                Expression::from_node(JsNode::Identifier {
                    start: start as u32,
                    end: end as u32,
                    loc: create_typed_loc(start, end, line_offsets),
                    name: CompactString::from(name),
                    optional: true,
                    type_annotation: None,
                })
            } else {
                let end = adjusted_offset + id.span.end as usize;
                create_identifier(name, start, end, line_offsets)
            }
        }
        BindingPattern::ObjectPattern(obj_pat) => {
            let expr =
                convert_object_pattern_to_expr(arena, obj_pat, adjusted_offset, line_offsets);
            // A destructuring param can carry a type annotation on the
            // FormalParameter (`{ a }: { a?: string }`), but the pattern's own
            // span stops at the closing `}`. The BindingIdentifier branch above
            // already folds the annotation into its span + attaches
            // `typeAnnotation`; mirror that for object patterns so the param's
            // `end` covers the annotation. svelte2tsx slices the snippet
            // parameter's source by this span — without it the explicit type and
            // its optionality are lost and the member is inferred as `any` /
            // required (#912).
            attach_param_type_annotation(arena, expr, param, adjusted_offset, line_offsets)
        }
        BindingPattern::ArrayPattern(arr_pat) => {
            let expr = convert_array_pattern_to_expr(arena, arr_pat, adjusted_offset, line_offsets);
            attach_param_type_annotation(arena, expr, param, adjusted_offset, line_offsets)
        }
        BindingPattern::AssignmentPattern(assign_pat) => {
            convert_assignment_pattern_to_expr(arena, assign_pat, adjusted_offset, line_offsets)
        }
    };

    if let Some(initializer) = &param.initializer {
        let pattern_start = adjusted_offset + param.span.start as usize;
        let pattern_end = adjusted_offset + param.span.end as usize;

        let right = convert_expression(arena, initializer, adjusted_offset + 1, line_offsets);

        return Expression::from_node(JsNode::AssignmentPattern {
            start: pattern_start as u32,
            end: pattern_end as u32,
            loc: create_typed_loc(pattern_start, pattern_end, line_offsets),
            left: arena.alloc_js_node(expr_to_node(pattern_expr)),
            right: arena.alloc_js_node(expr_to_node(right)),
        });
    }

    pattern_expr
}

/// Fold a FormalParameter's type annotation into a destructuring-pattern
/// expression: extend the node's `end` to cover the annotation and attach a
/// `typeAnnotation` field (mirroring the `BindingIdentifier` branch of
/// `convert_formal_parameter_inner`). No-op when the parameter is untyped.
///
/// `adjusted_offset` is the offset already applied to the pattern's own spans
/// (the OXC span is relative to the parser's wrapped source); the annotation's
/// spans use the same base, so callers needing original-source positions
/// (e.g. the optional-marker remap path) still remap the top-level `end`.
fn attach_param_type_annotation<'a>(
    arena: &ParseArena,
    expr: Expression<'a>,
    param: &oxc_ast::ast::FormalParameter,
    adjusted_offset: usize,
    line_offsets: &[usize],
) -> Expression<'a> {
    let Some(type_ann) = &param.type_annotation else {
        return expr;
    };
    let mut json = expr.as_json().clone();
    if let Some(obj) = json.as_object_mut() {
        let start = obj.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as usize;
        let end = adjusted_offset + type_ann.span.end as usize;
        obj.insert("end".to_string(), Value::Number((end as i64).into()));
        if let Some(loc) = create_loc(start, end, line_offsets) {
            obj.insert("loc".to_string(), loc);
        }
        let type_ann_obj =
            convert_type_annotation_adjusted(arena, type_ann, adjusted_offset, line_offsets);
        obj.insert("typeAnnotation".to_string(), type_ann_obj);
    }
    Expression::from_json(json)
}

/// Convert oxc ObjectPattern to our Expression format (for function parameters).
fn convert_object_pattern_to_expr<'a>(
    arena: &ParseArena,
    obj_pat: &oxc_ast::ast::ObjectPattern,
    adjusted_offset: usize,
    line_offsets: &[usize],
) -> Expression<'a> {
    let start = adjusted_offset + obj_pat.span.start as usize;
    let end = adjusted_offset + obj_pat.span.end as usize;

    let mut properties: Vec<JsNode> = obj_pat
        .properties
        .iter()
        .map(|prop| {
            let prop_start = adjusted_offset + prop.span.start as usize;
            let prop_end = adjusted_offset + prop.span.end as usize;
            let key_node = convert_property_key_for_param_as_node(
                arena,
                &prop.key,
                adjusted_offset,
                line_offsets,
            );
            let value_node = convert_binding_pattern_for_param_as_node(
                arena,
                &prop.value,
                adjusted_offset,
                line_offsets,
            );
            JsNode::Property {
                start: prop_start as u32,
                end: prop_end as u32,
                loc: create_typed_loc(prop_start, prop_end, line_offsets),
                method: false,
                shorthand: prop.shorthand,
                computed: prop.computed,
                key: arena.alloc_js_node(key_node),
                value: arena.alloc_js_node(value_node),
                kind: CompactString::from("init"),
            }
        })
        .collect();

    if let Some(rest) = &obj_pat.rest {
        let rest_start = adjusted_offset + rest.span.start as usize;
        let rest_end = adjusted_offset + rest.span.end as usize;
        let argument = convert_binding_pattern_for_param_as_node(
            arena,
            &rest.argument,
            adjusted_offset,
            line_offsets,
        );
        properties.push(JsNode::RestElement {
            start: rest_start as u32,
            end: rest_end as u32,
            loc: create_typed_loc(rest_start, rest_end, line_offsets),
            argument: arena.alloc_js_node(argument),
        });
    }

    Expression::from_node(JsNode::ObjectPattern {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        properties: arena.alloc_js_children(properties),
        type_annotation: None,
    })
}

/// Convert oxc ArrayPattern to our Expression format (for function parameters).
fn convert_array_pattern_to_expr<'a>(
    arena: &ParseArena,
    arr_pat: &oxc_ast::ast::ArrayPattern,
    adjusted_offset: usize,
    line_offsets: &[usize],
) -> Expression<'a> {
    let start = adjusted_offset + arr_pat.span.start as usize;
    let end = adjusted_offset + arr_pat.span.end as usize;

    let mut elements: Vec<Option<JsNode>> = arr_pat
        .elements
        .iter()
        .map(|elem| {
            elem.as_ref().map(|pattern| {
                convert_binding_pattern_for_param_as_node(
                    arena,
                    pattern,
                    adjusted_offset,
                    line_offsets,
                )
            })
        })
        .collect();

    if let Some(rest) = &arr_pat.rest {
        let rest_start = adjusted_offset + rest.span.start as usize;
        let rest_end = adjusted_offset + rest.span.end as usize;
        let argument = convert_binding_pattern_for_param_as_node(
            arena,
            &rest.argument,
            adjusted_offset,
            line_offsets,
        );
        elements.push(Some(JsNode::RestElement {
            start: rest_start as u32,
            end: rest_end as u32,
            loc: create_typed_loc(rest_start, rest_end, line_offsets),
            argument: arena.alloc_js_node(argument),
        }));
    }

    Expression::from_node(JsNode::ArrayPattern {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        elements,
        type_annotation: None,
    })
}

/// Convert oxc AssignmentPattern to our Expression format (for function parameters).
fn convert_assignment_pattern_to_expr<'a>(
    arena: &ParseArena,
    assign_pat: &oxc_ast::ast::AssignmentPattern,
    adjusted_offset: usize,
    line_offsets: &[usize],
) -> Expression<'a> {
    let start = adjusted_offset + assign_pat.span.start as usize;
    let end = adjusted_offset + assign_pat.span.end as usize;

    let left = convert_binding_pattern_for_param_as_node(
        arena,
        &assign_pat.left,
        adjusted_offset,
        line_offsets,
    );

    // Convert right (the default value) - simplified for now. This top-level
    // param assignment-pattern path emits a bare `{ type: "Expression" }`
    // placeholder (no real expression conversion); keep it as `JsNode::Raw`
    // since it is not a well-formed typed node. (The recursive
    // `convert_binding_pattern_for_param_as_node` AssignmentPattern arm DOES
    // produce a real typed default value.)
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
        left: arena.alloc_js_node(left),
        right: arena.alloc_js_node(JsNode::from_value(Value::Object(right_obj))),
    })
}

/// Convert oxc BindingPattern to our JSON format (for function parameters).
fn convert_binding_pattern_for_param(
    arena: &ParseArena,
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
            // Recursive call for nested object patterns.
            // Must use with_serialize_arena to resolve IdRange children
            // allocated in the parse arena during serialization.
            let expr =
                convert_object_pattern_to_expr(arena, obj_pat, adjusted_offset, line_offsets);
            crate::ast::arena::with_serialize_arena(arena, || expr.as_json().clone())
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
                        arena,
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
                    arena,
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
            let left = convert_binding_pattern_for_param(
                arena,
                &assign_pat.left,
                adjusted_offset,
                line_offsets,
            );
            obj.insert("left".to_string(), left);

            // Convert right (the default value) using the full expression converter.
            // Must use with_serialize_arena to resolve IdRange children
            // allocated in the parse arena during serialization.
            let right_expr =
                convert_expression(arena, &assign_pat.right, adjusted_offset, line_offsets);
            let right_val =
                crate::ast::arena::with_serialize_arena(arena, || right_expr.as_json().clone());
            obj.insert("right".to_string(), right_val);

            Value::Object(obj)
        }
    }
}

/// Typed object-pattern property-key converter (param path).
///
/// Produces a typed `JsNode` (Identifier / PrivateIdentifier / converted
/// expression) that serializes identically to the Value form, so object-pattern
/// keys route through the typed analyze walker instead of `JsNode::Raw`. Falls
/// back to `JsNode::Raw` only for the truly-unhandled placeholder
/// (`{ type: "Identifier", name: "__computed__" }`), which carries no span and
/// is therefore not representable as a well-formed typed `Identifier`.
fn convert_property_key_for_param_as_node(
    arena: &ParseArena,
    key: &oxc_ast::ast::PropertyKey,
    adjusted_offset: usize,
    line_offsets: &[usize],
) -> JsNode {
    use oxc_ast::ast::PropertyKey;

    match key {
        PropertyKey::StaticIdentifier(id) => {
            let start = adjusted_offset + id.span.start as usize;
            let end = adjusted_offset + id.span.end as usize;
            expr_to_node(create_identifier(&id.name, start, end, line_offsets))
        }
        PropertyKey::PrivateIdentifier(id) => {
            let start = adjusted_offset + id.span.start as usize;
            let end = adjusted_offset + id.span.end as usize;
            expr_to_node(create_private_identifier(
                &id.name,
                start,
                end,
                line_offsets,
            ))
        }
        _ => {
            if let Some(expr) = key.as_expression() {
                expr_to_node(convert_expression(
                    arena,
                    expr,
                    adjusted_offset,
                    line_offsets,
                ))
            } else {
                // Fallback placeholder for truly unhandled cases (no span).
                let mut obj = Map::new();
                obj.insert("type".to_string(), Value::String("Identifier".to_string()));
                obj.insert(
                    "name".to_string(),
                    Value::String("__computed__".to_string()),
                );
                JsNode::from_value(Value::Object(obj))
            }
        }
    }
}

/// Typed sibling of [`convert_binding_pattern_for_param`].
///
/// Produces typed `JsNode` pattern subtrees (Identifier / ObjectPattern /
/// ArrayPattern / AssignmentPattern) that serialize byte-identically to the
/// Value form, so pattern interiors route through the typed analyze walker
/// instead of `JsNode::Raw`. The ObjectPattern / ArrayPattern arms delegate to
/// the now-fully-typed `convert_object_pattern_to_expr` /
/// `convert_array_pattern_to_expr`; the AssignmentPattern arm mirrors the Value
/// arm exactly — the default value uses `convert_expression` (the param-path
/// converter, with its synthetic-paren offset semantics), NOT the program-path
/// `convert_expression_for_program`.
fn convert_binding_pattern_for_param_as_node(
    arena: &ParseArena,
    pattern: &oxc_ast::ast::BindingPattern,
    adjusted_offset: usize,
    line_offsets: &[usize],
) -> JsNode {
    use oxc_ast::ast::BindingPattern;

    match pattern {
        BindingPattern::BindingIdentifier(id) => {
            let start = adjusted_offset + id.span.start as usize;
            let end = adjusted_offset + id.span.end as usize;
            expr_to_node(create_identifier(&id.name, start, end, line_offsets))
        }
        BindingPattern::ObjectPattern(obj_pat) => expr_to_node(convert_object_pattern_to_expr(
            arena,
            obj_pat,
            adjusted_offset,
            line_offsets,
        )),
        BindingPattern::ArrayPattern(arr_pat) => expr_to_node(convert_array_pattern_to_expr(
            arena,
            arr_pat,
            adjusted_offset,
            line_offsets,
        )),
        BindingPattern::AssignmentPattern(assign_pat) => {
            let start = adjusted_offset + assign_pat.span.start as usize;
            let end = adjusted_offset + assign_pat.span.end as usize;
            let left = convert_binding_pattern_for_param_as_node(
                arena,
                &assign_pat.left,
                adjusted_offset,
                line_offsets,
            );
            let right = convert_expression(arena, &assign_pat.right, adjusted_offset, line_offsets);
            JsNode::AssignmentPattern {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                left: arena.alloc_js_node(left),
                right: arena.alloc_js_node(expr_to_node(right)),
            }
        }
    }
}

/// Convert type annotation with pre-adjusted offset.
fn convert_type_annotation_adjusted(
    arena: &ParseArena,
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
    let inner_type = convert_ts_type_adjusted(
        arena,
        &type_ann.type_annotation,
        adjusted_offset,
        line_offsets,
    );
    obj.insert("typeAnnotation".to_string(), inner_type);

    Value::Object(obj)
}

/// Build a TS assertion wrapper (`TSAsExpression` / `TSSatisfiesExpression` /
/// `TSNonNullExpression`) as a serde_json `Value` in svelte/compiler's shape.
/// `type_annotation` is `None` for `TSNonNullExpression` (which has no type).
fn ts_assertion_value(
    type_name: &str,
    start: usize,
    end: usize,
    expression: Value,
    type_annotation: Option<Value>,
    line_offsets: &[usize],
) -> Value {
    let mut obj = Map::new();
    obj.insert("type".to_string(), Value::String(type_name.to_string()));
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    if let Some(loc) = create_loc(start, end, line_offsets) {
        obj.insert("loc".to_string(), loc);
    }
    obj.insert("expression".to_string(), expression);
    if let Some(ta) = type_annotation {
        obj.insert("typeAnnotation".to_string(), ta);
    }
    Value::Object(obj)
}

/// Convert TSType with pre-adjusted offset.
///
/// This is a thin alias for [`convert_ts_type`]: both take an absolute base
/// offset and add the node span (`base + span.start/end`). Keeping the alias
/// avoids churning the FunctionParameter / declarator call sites that already
/// pass an `adjusted_offset`.
fn convert_ts_type_adjusted(
    arena: &ParseArena,
    ts_type: &oxc_ast::ast::TSType,
    adjusted_offset: usize,
    line_offsets: &[usize],
) -> Value {
    convert_ts_type(arena, ts_type, adjusted_offset, line_offsets)
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

            // `left` recurses (it may itself be a qualified name); `right` is a
            // plain Identifier. Matches svelte/compiler's TSQualifiedName shape.
            obj.insert(
                "left".to_string(),
                convert_ts_type_name_adjusted(&qualified.left, adjusted_offset, line_offsets),
            );
            let r_start = adjusted_offset + qualified.right.span.start as usize;
            let r_end = adjusted_offset + qualified.right.span.end as usize;
            obj.insert(
                "right".to_string(),
                ts_identifier_value(&qualified.right.name, r_start, r_end, line_offsets),
            );

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

/// Convert an oxc `TSType` to a serde_json `Value` matching svelte/compiler's
/// (acorn-typescript) ESTree shape.
///
/// `offset` is an absolute base such that `offset + span.{start,end}` is the
/// node's absolute position in the original source. Both the program path
/// (`$props()` destructuring annotations) and the FunctionParameter / pattern
/// path route through here so inline annotations no longer collapse to a
/// members-less `TSUnknownKeyword` stub (#791).
fn convert_ts_type(
    arena: &ParseArena,
    ts_type: &oxc_ast::ast::TSType,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    use oxc_ast::ast::TSType;

    let span = ts_type.span();
    let start = offset + span.start as usize;
    let end = offset + span.end as usize;

    // Build a `{ type, start, end, loc }` object the rest of the arms extend.
    let base = |type_name: &str| -> Map<String, Value> {
        let mut obj = Map::new();
        obj.insert("type".to_string(), Value::String(type_name.to_string()));
        obj.insert("start".to_string(), Value::Number((start as i64).into()));
        obj.insert("end".to_string(), Value::Number((end as i64).into()));
        if let Some(loc) = create_loc(start, end, line_offsets) {
            obj.insert("loc".to_string(), loc);
        }
        obj
    };

    match ts_type {
        // ---- keyword / leaf types -------------------------------------------
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
        TSType::TSObjectKeyword(_) => {
            create_ts_keyword("TSObjectKeyword", start, end, line_offsets)
        }
        TSType::TSSymbolKeyword(_) => {
            create_ts_keyword("TSSymbolKeyword", start, end, line_offsets)
        }
        TSType::TSUnknownKeyword(_) => {
            create_ts_keyword("TSUnknownKeyword", start, end, line_offsets)
        }
        TSType::TSNeverKeyword(_) => create_ts_keyword("TSNeverKeyword", start, end, line_offsets),
        TSType::TSBigIntKeyword(_) => {
            create_ts_keyword("TSBigIntKeyword", start, end, line_offsets)
        }
        TSType::TSIntrinsicKeyword(_) => {
            create_ts_keyword("TSIntrinsicKeyword", start, end, line_offsets)
        }
        TSType::TSThisType(_) => create_ts_keyword("TSThisType", start, end, line_offsets),

        // ---- references -----------------------------------------------------
        TSType::TSTypeReference(type_ref) => {
            let mut obj = base("TSTypeReference");
            obj.insert(
                "typeName".to_string(),
                convert_ts_type_name_adjusted(&type_ref.type_name, offset, line_offsets),
            );
            if let Some(args) = &type_ref.type_arguments {
                obj.insert(
                    "typeArguments".to_string(),
                    convert_ts_type_param_instantiation(arena, args, offset, line_offsets),
                );
            }
            Value::Object(obj)
        }

        // ---- object type literal: `{ a: T; b: U }` --------------------------
        TSType::TSTypeLiteral(lit) => {
            let mut obj = base("TSTypeLiteral");
            let members: Vec<Value> = lit
                .members
                .iter()
                .map(|m| convert_ts_signature(arena, m, offset, line_offsets))
                .collect();
            obj.insert("members".to_string(), Value::Array(members));
            Value::Object(obj)
        }

        // ---- unions / intersections ----------------------------------------
        TSType::TSUnionType(u) => {
            let mut obj = base("TSUnionType");
            let types: Vec<Value> = u
                .types
                .iter()
                .map(|t| convert_ts_type(arena, t, offset, line_offsets))
                .collect();
            obj.insert("types".to_string(), Value::Array(types));
            Value::Object(obj)
        }
        TSType::TSIntersectionType(i) => {
            let mut obj = base("TSIntersectionType");
            let types: Vec<Value> = i
                .types
                .iter()
                .map(|t| convert_ts_type(arena, t, offset, line_offsets))
                .collect();
            obj.insert("types".to_string(), Value::Array(types));
            Value::Object(obj)
        }

        // ---- arrays / tuples ------------------------------------------------
        TSType::TSArrayType(a) => {
            let mut obj = base("TSArrayType");
            obj.insert(
                "elementType".to_string(),
                convert_ts_type(arena, &a.element_type, offset, line_offsets),
            );
            Value::Object(obj)
        }
        // ---- literal types: `'a'`, `403`, `true` ----------------------------
        TSType::TSLiteralType(l) => {
            let mut obj = base("TSLiteralType");
            obj.insert(
                "literal".to_string(),
                convert_ts_literal(&l.literal, offset, line_offsets),
            );
            Value::Object(obj)
        }

        // ---- wrappers / operators ------------------------------------------
        TSType::TSParenthesizedType(p) => {
            let mut obj = base("TSParenthesizedType");
            obj.insert(
                "typeAnnotation".to_string(),
                convert_ts_type(arena, &p.type_annotation, offset, line_offsets),
            );
            Value::Object(obj)
        }
        TSType::TSTypeOperatorType(op) => {
            use oxc_ast::ast::TSTypeOperatorOperator;
            // svelte/compiler emits the node as `TSTypeOperator` (no `Type` suffix).
            let mut obj = base("TSTypeOperator");
            let operator = match op.operator {
                TSTypeOperatorOperator::Keyof => "keyof",
                TSTypeOperatorOperator::Unique => "unique",
                TSTypeOperatorOperator::Readonly => "readonly",
            };
            obj.insert("operator".to_string(), Value::String(operator.to_string()));
            obj.insert(
                "typeAnnotation".to_string(),
                convert_ts_type(arena, &op.type_annotation, offset, line_offsets),
            );
            Value::Object(obj)
        }
        TSType::TSIndexedAccessType(ia) => {
            let mut obj = base("TSIndexedAccessType");
            obj.insert(
                "objectType".to_string(),
                convert_ts_type(arena, &ia.object_type, offset, line_offsets),
            );
            obj.insert(
                "indexType".to_string(),
                convert_ts_type(arena, &ia.index_type, offset, line_offsets),
            );
            Value::Object(obj)
        }

        // ---- function / constructor signature types -------------------------
        // `(a: string) => void` / `new (a: string) => Foo`. Both share the same
        // shape (generic type parameters, a flat `parameters` array with any
        // `this` parameter prepended as a plain Identifier, and a `typeAnnotation`
        // wrapping the return type) — svelte/compiler (acorn-typescript) keeps
        // these as real nodes rather than collapsing them to `TSUnknownKeyword` (#1660).
        TSType::TSFunctionType(f) => {
            let mut obj = base("TSFunctionType");
            if let Some(type_parameters) = &f.type_parameters {
                obj.insert(
                    "typeParameters".to_string(),
                    convert_ts_type_parameter_declaration(
                        arena,
                        type_parameters,
                        offset,
                        line_offsets,
                    ),
                );
            }
            obj.insert(
                "parameters".to_string(),
                Value::Array(convert_ts_function_like_params(
                    arena,
                    f.this_param.as_deref(),
                    &f.params,
                    offset,
                    line_offsets,
                )),
            );
            obj.insert(
                "typeAnnotation".to_string(),
                convert_type_annotation_adjusted(arena, &f.return_type, offset, line_offsets),
            );
            Value::Object(obj)
        }
        TSType::TSConstructorType(c) => {
            let mut obj = base("TSConstructorType");
            // svelte/compiler always emits `abstract` (unlike `optional` / `readonly`
            // elsewhere, which are omitted when false).
            obj.insert("abstract".to_string(), Value::Bool(c.r#abstract));
            if let Some(type_parameters) = &c.type_parameters {
                obj.insert(
                    "typeParameters".to_string(),
                    convert_ts_type_parameter_declaration(
                        arena,
                        type_parameters,
                        offset,
                        line_offsets,
                    ),
                );
            }
            obj.insert(
                "parameters".to_string(),
                Value::Array(convert_ts_function_like_params(
                    arena,
                    None,
                    &c.params,
                    offset,
                    line_offsets,
                )),
            );
            obj.insert(
                "typeAnnotation".to_string(),
                convert_type_annotation_adjusted(arena, &c.return_type, offset, line_offsets),
            );
            Value::Object(obj)
        }

        // ---- span-bearing fallback for still-unhandled exotic types ---------
        // Never the old span-less stub: keep offsets so downstream tooling can
        // still address the node even when its inner shape isn't modelled yet.
        _ => Value::Object(base("TSUnknownKeyword")),
    }
}

/// Convert a `TSTypeParameterDeclaration` (`<T, U extends V = W>`) into
/// svelte/compiler's shape: `{ type: 'TSTypeParameterDeclaration', params }`,
/// each param `{ type: 'TSTypeParameter', name: <string>, constraint?, default? }`.
/// acorn-typescript stores `name` as a plain string (not an `Identifier` node)
/// and omits `constraint`/`default` when absent.
fn convert_ts_type_parameter_declaration(
    arena: &ParseArena,
    decl: &oxc_ast::ast::TSTypeParameterDeclaration,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    let start = offset + decl.span.start as usize;
    let end = offset + decl.span.end as usize;
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("TSTypeParameterDeclaration".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    if let Some(loc) = create_loc(start, end, line_offsets) {
        obj.insert("loc".to_string(), loc);
    }
    let params: Vec<Value> = decl
        .params
        .iter()
        .map(|p| convert_ts_type_parameter(arena, p, offset, line_offsets))
        .collect();
    obj.insert("params".to_string(), Value::Array(params));
    Value::Object(obj)
}

/// Convert a single `TSTypeParameter` (`T extends U = V`).
fn convert_ts_type_parameter(
    arena: &ParseArena,
    param: &oxc_ast::ast::TSTypeParameter,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    let start = offset + param.span.start as usize;
    let end = offset + param.span.end as usize;
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("TSTypeParameter".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    if let Some(loc) = create_loc(start, end, line_offsets) {
        obj.insert("loc".to_string(), loc);
    }
    obj.insert(
        "name".to_string(),
        Value::String(param.name.name.to_string()),
    );
    if let Some(constraint) = &param.constraint {
        obj.insert(
            "constraint".to_string(),
            convert_ts_type(arena, constraint, offset, line_offsets),
        );
    }
    if let Some(default) = &param.default {
        obj.insert(
            "default".to_string(),
            convert_ts_type(arena, default, offset, line_offsets),
        );
    }
    Value::Object(obj)
}

/// Convert a `TSFunctionType` / `TSConstructorType` parameter list into
/// svelte/compiler's flat `parameters` array. acorn-typescript parses `this: T`
/// as an ordinary parameter pattern (not a distinct node), so a `this` param is
/// prepended as a plain `Identifier` named `"this"`.
fn convert_ts_function_like_params(
    arena: &ParseArena,
    this_param: Option<&oxc_ast::ast::TSThisParameter>,
    params: &oxc_ast::ast::FormalParameters,
    offset: usize,
    line_offsets: &[usize],
) -> Vec<Value> {
    let mut out = Vec::with_capacity(
        this_param.is_some() as usize + params.items.len() + params.rest.is_some() as usize,
    );

    if let Some(this_param) = this_param {
        let start = offset + this_param.span.start as usize;
        let end = offset + this_param.span.end as usize;
        let mut obj = Map::new();
        obj.insert("type".to_string(), Value::String("Identifier".to_string()));
        obj.insert("start".to_string(), Value::Number((start as i64).into()));
        obj.insert("end".to_string(), Value::Number((end as i64).into()));
        if let Some(loc) = create_loc(start, end, line_offsets) {
            obj.insert("loc".to_string(), loc);
        }
        obj.insert("name".to_string(), Value::String("this".to_string()));
        if let Some(type_ann) = &this_param.type_annotation {
            obj.insert(
                "typeAnnotation".to_string(),
                convert_type_annotation_adjusted(arena, type_ann, offset, line_offsets),
            );
        }
        out.push(Value::Object(obj));
    }

    for param in &params.items {
        out.push(
            convert_formal_parameter(arena, param, offset, line_offsets)
                .as_json()
                .clone(),
        );
    }

    if let Some(rest) = &params.rest {
        let start = offset + rest.span.start as usize;
        let end = offset + rest.span.end as usize;
        let argument =
            convert_binding_pattern_for_param(arena, &rest.rest.argument, offset, line_offsets);
        let mut obj = Map::new();
        obj.insert("type".to_string(), Value::String("RestElement".to_string()));
        obj.insert("start".to_string(), Value::Number((start as i64).into()));
        obj.insert("end".to_string(), Value::Number((end as i64).into()));
        if let Some(loc) = create_loc(start, end, line_offsets) {
            obj.insert("loc".to_string(), loc);
        }
        obj.insert("argument".to_string(), argument);
        if let Some(type_ann) = &rest.type_annotation {
            obj.insert(
                "typeAnnotation".to_string(),
                convert_type_annotation_adjusted(arena, type_ann, offset, line_offsets),
            );
        }
        out.push(Value::Object(obj));
    }

    out
}

/// Convert a member of a `TSTypeLiteral` / interface body. Currently models
/// `TSPropertySignature` exactly (the common inline-props case); other
/// signature kinds degrade to a span-bearing node.
fn convert_ts_signature(
    arena: &ParseArena,
    sig: &oxc_ast::ast::TSSignature,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    use oxc_ast::ast::TSSignature;

    match sig {
        TSSignature::TSPropertySignature(prop) => {
            let start = offset + prop.span.start as usize;
            let end = offset + prop.span.end as usize;

            let mut obj = Map::new();
            obj.insert(
                "type".to_string(),
                Value::String("TSPropertySignature".to_string()),
            );
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            if let Some(loc) = create_loc(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }
            obj.insert("computed".to_string(), Value::Bool(prop.computed));
            // svelte/compiler omits `optional` / `readonly` when false.
            if prop.optional {
                obj.insert("optional".to_string(), Value::Bool(true));
            }
            if prop.readonly {
                obj.insert("readonly".to_string(), Value::Bool(true));
            }
            obj.insert(
                "key".to_string(),
                convert_ts_property_key(&prop.key, offset, line_offsets),
            );
            if let Some(type_ann) = &prop.type_annotation {
                obj.insert(
                    "typeAnnotation".to_string(),
                    convert_type_annotation_adjusted(arena, type_ann, offset, line_offsets),
                );
            }
            Value::Object(obj)
        }
        // Index / method / call / construct signatures: span-bearing node so
        // the member is still addressable even though it isn't fully modelled.
        _ => {
            let span = sig.span();
            let start = offset + span.start as usize;
            let end = offset + span.end as usize;
            let type_name = match sig {
                TSSignature::TSIndexSignature(_) => "TSIndexSignature",
                TSSignature::TSCallSignatureDeclaration(_) => "TSCallSignatureDeclaration",
                TSSignature::TSConstructSignatureDeclaration(_) => {
                    "TSConstructSignatureDeclaration"
                }
                TSSignature::TSMethodSignature(_) => "TSMethodSignature",
                TSSignature::TSPropertySignature(_) => "TSPropertySignature",
            };
            let mut obj = Map::new();
            obj.insert("type".to_string(), Value::String(type_name.to_string()));
            obj.insert("start".to_string(), Value::Number((start as i64).into()));
            obj.insert("end".to_string(), Value::Number((end as i64).into()));
            if let Some(loc) = create_loc(start, end, line_offsets) {
                obj.insert("loc".to_string(), loc);
            }
            Value::Object(obj)
        }
    }
}

/// Convert a `TSPropertySignature` key (Identifier / string / numeric).
fn convert_ts_property_key(
    key: &oxc_ast::ast::PropertyKey,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    use oxc_ast::ast::PropertyKey;

    match key {
        PropertyKey::StaticIdentifier(id) => {
            let start = offset + id.span.start as usize;
            let end = offset + id.span.end as usize;
            ts_identifier_value(&id.name, start, end, line_offsets)
        }
        PropertyKey::StringLiteral(s) => {
            let start = offset + s.span.start as usize;
            let end = offset + s.span.end as usize;
            ts_literal_value(
                start,
                end,
                Value::String(s.value.to_string()),
                s.raw.as_ref().map(|r| r.to_string()),
                line_offsets,
            )
        }
        PropertyKey::NumericLiteral(n) => {
            let start = offset + n.span.start as usize;
            let end = offset + n.span.end as usize;
            ts_literal_value(
                start,
                end,
                number_value(n.value),
                n.raw.as_ref().map(|r| r.to_string()),
                line_offsets,
            )
        }
        _ => {
            let span = key.span();
            let start = offset + span.start as usize;
            let end = offset + span.end as usize;
            ts_identifier_value("", start, end, line_offsets)
        }
    }
}

/// Convert a `TSLiteralType` literal into an ESTree `Literal` node.
fn convert_ts_literal(
    literal: &oxc_ast::ast::TSLiteral,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    use oxc_ast::ast::TSLiteral;

    match literal {
        TSLiteral::StringLiteral(s) => {
            let start = offset + s.span.start as usize;
            let end = offset + s.span.end as usize;
            ts_literal_value(
                start,
                end,
                Value::String(s.value.to_string()),
                s.raw.as_ref().map(|r| r.to_string()),
                line_offsets,
            )
        }
        TSLiteral::NumericLiteral(n) => {
            let start = offset + n.span.start as usize;
            let end = offset + n.span.end as usize;
            ts_literal_value(
                start,
                end,
                number_value(n.value),
                n.raw.as_ref().map(|r| r.to_string()),
                line_offsets,
            )
        }
        TSLiteral::BooleanLiteral(b) => {
            let start = offset + b.span.start as usize;
            let end = offset + b.span.end as usize;
            ts_literal_value(
                start,
                end,
                Value::Bool(b.value),
                Some(b.value.to_string()),
                line_offsets,
            )
        }
        _ => {
            let span = literal.span();
            let start = offset + span.start as usize;
            let end = offset + span.end as usize;
            ts_literal_value(start, end, Value::Null, None, line_offsets)
        }
    }
}

/// Build an ESTree `Identifier` node `{ type, start, end, loc, name }` as a
/// `serde_json::Value` (the `create_identifier` helper returns an `Expression`,
/// which the TS-type converters can't use directly).
fn ts_identifier_value(name: &str, start: usize, end: usize, line_offsets: &[usize]) -> Value {
    let mut obj = Map::new();
    obj.insert("type".to_string(), Value::String("Identifier".to_string()));
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    if let Some(loc) = create_loc(start, end, line_offsets) {
        obj.insert("loc".to_string(), loc);
    }
    obj.insert("name".to_string(), Value::String(name.to_string()));
    Value::Object(obj)
}

/// Build an ESTree `Literal` node `{ type, start, end, loc, value, raw }`.
fn ts_literal_value(
    start: usize,
    end: usize,
    value: Value,
    raw: Option<String>,
    line_offsets: &[usize],
) -> Value {
    let mut obj = Map::new();
    obj.insert("type".to_string(), Value::String("Literal".to_string()));
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    if let Some(loc) = create_loc(start, end, line_offsets) {
        obj.insert("loc".to_string(), loc);
    }
    obj.insert("value".to_string(), value);
    if let Some(raw) = raw {
        obj.insert("raw".to_string(), Value::String(raw));
    }
    Value::Object(obj)
}

/// Encode an f64 literal value as an integer JSON number when it is integral
/// (so `403` serializes as `403`, not `403.0`), else as a float.
fn number_value(v: f64) -> Value {
    if v.fract() == 0.0 && v.is_finite() && v.abs() < 9.007_199_254_740_992e15 {
        Value::Number((v as i64).into())
    } else {
        serde_json::Number::from_f64(v)
            .map(Value::Number)
            .unwrap_or(Value::Null)
    }
}

/// Convert a `TSTypeParameterInstantiation` (`<A, B>`) into svelte/compiler's
/// shape: `{ type: 'TSTypeParameterInstantiation', start, end, loc, params }`.
fn convert_ts_type_param_instantiation(
    arena: &ParseArena,
    args: &oxc_ast::ast::TSTypeParameterInstantiation,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    let start = offset + args.span.start as usize;
    let end = offset + args.span.end as usize;
    let mut obj = Map::new();
    obj.insert(
        "type".to_string(),
        Value::String("TSTypeParameterInstantiation".to_string()),
    );
    obj.insert("start".to_string(), Value::Number((start as i64).into()));
    obj.insert("end".to_string(), Value::Number((end as i64).into()));
    if let Some(loc) = create_loc(start, end, line_offsets) {
        obj.insert("loc".to_string(), loc);
    }
    let params: Vec<Value> = args
        .params
        .iter()
        .map(|t| convert_ts_type(arena, t, offset, line_offsets))
        .collect();
    obj.insert("params".to_string(), Value::Array(params));
    Value::Object(obj)
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
fn convert_expression<'a>(
    arena: &ParseArena,
    expr: &OxcExpression,
    offset: usize,
    line_offsets: &[usize],
) -> Expression<'a> {
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
                arena,
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
            create_call_expression(arena, call, start, end, offset, line_offsets)
        }
        OxcExpression::StaticMemberExpression(member) => {
            let start = offset + member.span.start as usize - 1;
            let end = offset + member.span.end as usize - 1;
            create_static_member_expression(arena, member, start, end, offset, line_offsets)
        }
        OxcExpression::ComputedMemberExpression(member) => {
            let start = offset + member.span.start as usize - 1;
            let end = offset + member.span.end as usize - 1;
            create_computed_member_expression(arena, member, start, end, offset, line_offsets)
        }
        OxcExpression::ParenthesizedExpression(paren) => {
            // For parenthesized expressions, just return the inner expression
            convert_expression(arena, &paren.expression, offset, line_offsets)
        }
        OxcExpression::LogicalExpression(logical) => {
            let start = offset + logical.span.start as usize - 1;
            let end = offset + logical.span.end as usize - 1;
            create_logical_expression(arena, logical, start, end, offset, line_offsets)
        }
        OxcExpression::UnaryExpression(unary) => {
            let start = offset + unary.span.start as usize - 1;
            let end = offset + unary.span.end as usize - 1;
            create_unary_expression(arena, unary, start, end, offset, line_offsets)
        }
        OxcExpression::ConditionalExpression(cond) => {
            let start = offset + cond.span.start as usize - 1;
            let end = offset + cond.span.end as usize - 1;
            create_conditional_expression(arena, cond, start, end, offset, line_offsets)
        }
        OxcExpression::ArrayExpression(arr) => {
            let start = offset + arr.span.start as usize - 1;
            let end = offset + arr.span.end as usize - 1;
            create_array_expression(arena, arr, start, end, offset, line_offsets)
        }
        OxcExpression::ObjectExpression(obj) => {
            let start = offset + obj.span.start as usize - 1;
            let end = offset + obj.span.end as usize - 1;
            create_object_expression(arena, obj, start, end, offset, line_offsets)
        }
        OxcExpression::ArrowFunctionExpression(arrow) => {
            let start = offset + arrow.span.start as usize - 1;
            let end = offset + arrow.span.end as usize - 1;
            create_arrow_function(arena, arrow, start, end, offset, line_offsets)
        }
        OxcExpression::TemplateLiteral(template) => {
            let start = offset + template.span.start as usize - 1;
            let end = offset + template.span.end as usize - 1;
            create_template_literal(arena, template, start, end, offset, line_offsets)
        }
        OxcExpression::AssignmentExpression(assign) => {
            let start = offset + assign.span.start as usize - 1;
            let end = offset + assign.span.end as usize - 1;
            create_assignment_expression(arena, assign, start, end, offset, line_offsets)
        }
        OxcExpression::UpdateExpression(update) => {
            let start = offset + update.span.start as usize - 1;
            let end = offset + update.span.end as usize - 1;
            create_update_expression(arena, update, start, end, offset, line_offsets)
        }
        OxcExpression::SequenceExpression(seq) => {
            let start = offset + seq.span.start as usize - 1;
            let end = offset + seq.span.end as usize - 1;
            create_sequence_expression(arena, seq, start, end, offset, line_offsets)
        }
        // TypeScript assertion wrappers - preserve the wrapper node so the public
        // `parse()` AST mirrors svelte/compiler (which keeps them); the TS stripper
        // erases them at compile time. Template-path spans carry the `-1` synthetic
        // paren adjustment, so the type-annotation blob uses base `offset - 1`.
        OxcExpression::TSAsExpression(ts_as) => {
            let start = offset + ts_as.span.start as usize - 1;
            let end = offset + ts_as.span.end as usize - 1;
            let inner = convert_expression(arena, &ts_as.expression, offset, line_offsets);
            let type_annotation =
                convert_ts_type(arena, &ts_as.type_annotation, offset - 1, line_offsets);
            Expression::from_node(JsNode::TSAsExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                expression: arena.alloc_js_node(expr_to_node(inner)),
                type_annotation: Box::new(type_annotation),
            })
        }
        OxcExpression::TSSatisfiesExpression(ts_satisfies) => {
            let start = offset + ts_satisfies.span.start as usize - 1;
            let end = offset + ts_satisfies.span.end as usize - 1;
            let inner = convert_expression(arena, &ts_satisfies.expression, offset, line_offsets);
            let type_annotation = convert_ts_type(
                arena,
                &ts_satisfies.type_annotation,
                offset - 1,
                line_offsets,
            );
            Expression::from_node(JsNode::TSSatisfiesExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                expression: arena.alloc_js_node(expr_to_node(inner)),
                type_annotation: Box::new(type_annotation),
            })
        }
        OxcExpression::TSNonNullExpression(ts_non_null) => {
            let start = offset + ts_non_null.span.start as usize - 1;
            let end = offset + ts_non_null.span.end as usize - 1;
            let inner = convert_expression(arena, &ts_non_null.expression, offset, line_offsets);
            Expression::from_node(JsNode::TSNonNullExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                expression: arena.alloc_js_node(expr_to_node(inner)),
            })
        }
        OxcExpression::TSTypeAssertion(ts_assertion) => {
            let start = offset + ts_assertion.span.start as usize - 1;
            let end = offset + ts_assertion.span.end as usize - 1;
            let inner = convert_expression(arena, &ts_assertion.expression, offset, line_offsets);
            let type_annotation = convert_ts_type(
                arena,
                &ts_assertion.type_annotation,
                offset - 1,
                line_offsets,
            );
            Expression::from_node(JsNode::TSTypeAssertion {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                expression: arena.alloc_js_node(expr_to_node(inner)),
                type_annotation: Box::new(type_annotation),
            })
        }
        OxcExpression::TSInstantiationExpression(ts_inst) => {
            let start = offset + ts_inst.span.start as usize - 1;
            let end = offset + ts_inst.span.end as usize - 1;
            let inner = convert_expression(arena, &ts_inst.expression, offset, line_offsets);
            let type_arguments = convert_ts_type_param_instantiation(
                arena,
                &ts_inst.type_arguments,
                offset - 1,
                line_offsets,
            );
            Expression::from_node(JsNode::TSInstantiationExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                expression: arena.alloc_js_node(expr_to_node(inner)),
                type_arguments: Box::new(type_arguments),
            })
        }
        OxcExpression::NewExpression(new_expr) => {
            let start = offset + new_expr.span.start as usize - 1;
            let end = offset + new_expr.span.end as usize - 1;
            create_new_expression(arena, new_expr, start, end, offset, line_offsets)
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
            let type_parameters =
                function_expression_type_parameters(arena, func, offset, line_offsets);
            create_function_expression(
                arena,
                func,
                start,
                end,
                offset,
                line_offsets,
                type_parameters,
                false,
            )
        }
        OxcExpression::ClassExpression(class_expr) => {
            let start = offset + class_expr.span.start as usize - 1;
            let end = offset + class_expr.span.end as usize - 1;
            create_class_expression(arena, class_expr, start, end, offset, line_offsets)
        }
        OxcExpression::ImportExpression(import_expr) => {
            let start = offset + import_expr.span.start as usize - 1;
            let end = offset + import_expr.span.end as usize - 1;
            let source = convert_expression(arena, &import_expr.source, offset, line_offsets);
            Expression::from_node(JsNode::ImportExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                source: arena.alloc_js_node(expr_to_node(source)),
            })
        }
        OxcExpression::AwaitExpression(await_expr) => {
            let start = offset + await_expr.span.start as usize - 1;
            let end = offset + await_expr.span.end as usize - 1;
            let argument = convert_expression(arena, &await_expr.argument, offset, line_offsets);
            Expression::from_node(JsNode::AwaitExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                argument: arena.alloc_js_node(expr_to_node(argument)),
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
                    arena.alloc_js_node(expr_to_node(convert_expression(
                        arena,
                        arg,
                        offset,
                        line_offsets,
                    )))
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
                        arena,
                        call,
                        inner_start,
                        inner_end,
                        offset,
                        line_offsets,
                    ))
                }
                oxc_ast::ast::ChainElement::TSNonNullExpression(ts_non_null) => {
                    let inner_start = offset + ts_non_null.span.start as usize - 1;
                    let inner_end = offset + ts_non_null.span.end as usize - 1;
                    let inner =
                        convert_expression(arena, &ts_non_null.expression, offset, line_offsets);
                    JsNode::TSNonNullExpression {
                        start: inner_start as u32,
                        end: inner_end as u32,
                        loc: create_typed_loc(inner_start, inner_end, line_offsets),
                        expression: arena.alloc_js_node(expr_to_node(inner)),
                    }
                }
                oxc_ast::ast::ChainElement::StaticMemberExpression(member) => {
                    let inner_start = offset + member.span.start as usize - 1;
                    let inner_end = offset + member.span.end as usize - 1;
                    expr_to_node(create_static_member_expression(
                        arena,
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
                        arena,
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
                        arena,
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
                expression: arena.alloc_js_node(chain_inner),
            })
        }
        OxcExpression::PrivateFieldExpression(private_member) => {
            let start = offset + private_member.span.start as usize - 1;
            let end = offset + private_member.span.end as usize - 1;
            create_private_member_expression(
                arena,
                private_member,
                start,
                end,
                offset,
                line_offsets,
            )
        }
        OxcExpression::TaggedTemplateExpression(tagged) => {
            let start = offset + tagged.span.start as usize - 1;
            let end = offset + tagged.span.end as usize - 1;
            create_tagged_template_expression(arena, tagged, start, end, offset, line_offsets)
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
                meta: arena.alloc_js_node(expr_to_node(create_identifier(
                    &meta.meta.name,
                    meta_start,
                    meta_end,
                    line_offsets,
                ))),
                property: arena.alloc_js_node(expr_to_node(create_identifier(
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

fn create_identifier<'a>(
    name: &str,
    start: usize,
    end: usize,
    line_offsets: &[usize],
) -> Expression<'a> {
    Expression::from_node(JsNode::Identifier {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        name: CompactString::from(name),
        optional: false,
        type_annotation: None,
    })
}

/// Create a PrivateIdentifier node (for class private fields like #count).
fn create_private_identifier<'a>(
    name: &str,
    start: usize,
    end: usize,
    line_offsets: &[usize],
) -> Expression<'a> {
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
        optional: false,
        type_annotation: None,
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
        optional: false,
        type_annotation: None,
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
pub fn create_identifier_with_character<'a>(
    name: &str,
    start: usize,
    end: usize,
    line_offsets: &[usize],
) -> Expression<'a> {
    Expression::from_node(JsNode::Identifier {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc_with_character(start, end, line_offsets),
        name: CompactString::from(name),
        optional: false,
        type_annotation: None,
    })
}

/// Create an identifier WITHOUT a loc field.
/// Used for error recovery when parsing invalid expressions in loose mode.
pub fn create_empty_identifier<'a>(name: &str, start: usize, end: usize) -> Expression<'a> {
    Expression::from_node(JsNode::Identifier {
        start: start as u32,
        end: end as u32,
        loc: None,
        name: CompactString::from(name),
        optional: false,
        type_annotation: None,
    })
}

fn create_literal<'a>(
    value: LiteralValue,
    raw: &str,
    start: usize,
    end: usize,
    line_offsets: &[usize],
) -> Expression<'a> {
    Expression::from_node(JsNode::Literal {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        value,
        raw: CompactString::from(raw),
        regex: None,
    })
}

fn create_numeric_literal<'a>(
    value: f64,
    raw: &str,
    start: usize,
    end: usize,
    line_offsets: &[usize],
) -> Expression<'a> {
    Expression::from_node(JsNode::Literal {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        value: LiteralValue::Number(value),
        raw: CompactString::from(raw),
        regex: None,
    })
}

fn create_string_literal<'a>(
    value: &str,
    raw: &str,
    start: usize,
    end: usize,
    line_offsets: &[usize],
) -> Expression<'a> {
    Expression::from_node(JsNode::Literal {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        value: LiteralValue::String(CompactString::from(value)),
        raw: CompactString::from(raw),
        regex: None,
    })
}

fn create_binary_expression<'a>(
    arena: &ParseArena,
    left: &OxcExpression,
    operator: &oxc_ast::ast::BinaryOperator,
    right: &OxcExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression<'a> {
    let left_expr = convert_expression(arena, left, offset, line_offsets);
    let right_expr = convert_expression(arena, right, offset, line_offsets);

    Expression::from_node(JsNode::BinaryExpression {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        left: arena.alloc_js_node(expr_to_node(left_expr)),
        operator: CompactString::from(binary_operator_to_str(operator)),
        right: arena.alloc_js_node(expr_to_node(right_expr)),
    })
}

fn create_logical_expression<'a>(
    arena: &ParseArena,
    logical: &oxc_ast::ast::LogicalExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression<'a> {
    let left_expr = convert_expression(arena, &logical.left, offset, line_offsets);
    let right_expr = convert_expression(arena, &logical.right, offset, line_offsets);

    Expression::from_node(JsNode::LogicalExpression {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        left: arena.alloc_js_node(expr_to_node(left_expr)),
        operator: CompactString::from(logical_operator_to_str(&logical.operator)),
        right: arena.alloc_js_node(expr_to_node(right_expr)),
    })
}

fn create_unary_expression<'a>(
    arena: &ParseArena,
    unary: &oxc_ast::ast::UnaryExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression<'a> {
    let argument = convert_expression(arena, &unary.argument, offset, line_offsets);

    Expression::from_node(JsNode::UnaryExpression {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        operator: CompactString::from(unary_operator_to_str(&unary.operator)),
        prefix: true,
        argument: arena.alloc_js_node(expr_to_node(argument)),
    })
}

fn create_conditional_expression<'a>(
    arena: &ParseArena,
    cond: &oxc_ast::ast::ConditionalExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression<'a> {
    let test = convert_expression(arena, &cond.test, offset, line_offsets);
    let consequent = convert_expression(arena, &cond.consequent, offset, line_offsets);
    let alternate = convert_expression(arena, &cond.alternate, offset, line_offsets);

    Expression::from_node(JsNode::ConditionalExpression {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        test: arena.alloc_js_node(expr_to_node(test)),
        consequent: arena.alloc_js_node(expr_to_node(consequent)),
        alternate: arena.alloc_js_node(expr_to_node(alternate)),
    })
}

fn create_call_expression<'a>(
    arena: &ParseArena,
    call: &oxc_ast::ast::CallExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression<'a> {
    let callee = convert_expression(arena, &call.callee, offset, line_offsets);

    let args: Vec<JsNode> = call
        .arguments
        .iter()
        .map(|arg| match arg {
            oxc_ast::ast::Argument::SpreadElement(spread) => {
                let spread_start = offset + spread.span.start as usize - 1;
                let spread_end = offset + spread.span.end as usize - 1;
                let inner = convert_expression(arena, &spread.argument, offset, line_offsets);
                JsNode::SpreadElement {
                    start: spread_start as u32,
                    end: spread_end as u32,
                    loc: create_typed_loc(spread_start, spread_end, line_offsets),
                    argument: arena.alloc_js_node(expr_to_node(inner)),
                }
            }
            _ => {
                let expr = arg.to_expression();
                expr_to_node(convert_expression(arena, expr, offset, line_offsets))
            }
        })
        .collect();

    Expression::from_node(JsNode::CallExpression {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        callee: arena.alloc_js_node(expr_to_node(callee)),
        arguments: arena.alloc_js_children(args),
        optional: call.optional,
    })
}

fn create_static_member_expression<'a>(
    arena: &ParseArena,
    member: &oxc_ast::ast::StaticMemberExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression<'a> {
    let object = convert_expression(arena, &member.object, offset, line_offsets);

    let prop_start = offset + member.property.span.start as usize - 1;
    let prop_end = offset + member.property.span.end as usize - 1;

    Expression::from_node(JsNode::MemberExpression {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        object: arena.alloc_js_node(expr_to_node(object)),
        property: arena.alloc_js_node(JsNode::Identifier {
            start: prop_start as u32,
            end: prop_end as u32,
            loc: create_typed_loc(prop_start, prop_end, line_offsets),
            name: CompactString::from(member.property.name.as_str()),
            optional: false,
            type_annotation: None,
        }),
        computed: false,
        optional: member.optional,
    })
}

fn create_computed_member_expression<'a>(
    arena: &ParseArena,
    member: &oxc_ast::ast::ComputedMemberExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression<'a> {
    let object = convert_expression(arena, &member.object, offset, line_offsets);
    let property = convert_expression(arena, &member.expression, offset, line_offsets);

    Expression::from_node(JsNode::MemberExpression {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        object: arena.alloc_js_node(expr_to_node(object)),
        property: arena.alloc_js_node(expr_to_node(property)),
        computed: true,
        optional: member.optional,
    })
}

fn create_private_member_expression<'a>(
    arena: &ParseArena,
    member: &oxc_ast::ast::PrivateFieldExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression<'a> {
    let object = convert_expression(arena, &member.object, offset, line_offsets);

    let prop_start = offset + member.field.span.start as usize - 1;
    let prop_end = offset + member.field.span.end as usize - 1;

    Expression::from_node(JsNode::MemberExpression {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        object: arena.alloc_js_node(expr_to_node(object)),
        property: arena.alloc_js_node(JsNode::PrivateIdentifier {
            start: prop_start as u32,
            end: prop_end as u32,
            loc: create_typed_loc(prop_start, prop_end, line_offsets),
            name: CompactString::from(member.field.name.as_str()),
        }),
        computed: false,
        optional: member.optional,
    })
}

fn create_new_expression<'a>(
    arena: &ParseArena,
    new_expr: &oxc_ast::ast::NewExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression<'a> {
    let callee = convert_expression(arena, &new_expr.callee, offset, line_offsets);

    let args: Vec<JsNode> = new_expr
        .arguments
        .iter()
        .map(|arg| match arg {
            oxc_ast::ast::Argument::SpreadElement(spread) => {
                let spread_start = offset + spread.span.start as usize - 1;
                let spread_end = offset + spread.span.end as usize - 1;
                let spread_arg = convert_expression(arena, &spread.argument, offset, line_offsets);
                JsNode::SpreadElement {
                    start: spread_start as u32,
                    end: spread_end as u32,
                    loc: create_typed_loc(spread_start, spread_end, line_offsets),
                    argument: arena.alloc_js_node(expr_to_node(spread_arg)),
                }
            }
            _ => {
                let expr = arg.to_expression();
                expr_to_node(convert_expression(arena, expr, offset, line_offsets))
            }
        })
        .collect();

    Expression::from_node(JsNode::NewExpression {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        callee: arena.alloc_js_node(expr_to_node(callee)),
        arguments: arena.alloc_js_children(args),
    })
}

fn create_function_expression<'a>(
    arena: &ParseArena,
    func: &oxc_ast::ast::Function,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
    // Method values carry their generics on the wrapping MethodDefinition, not
    // the inner function (acorn-typescript), so callers pass `None` there.
    type_parameters: Option<Box<serde_json::Value>>,
    // Object-method values keep their generics on the inner function but emit
    // them after `body` (acorn-typescript), unlike declarations/expressions.
    type_parameters_after_body: bool,
) -> Expression<'a> {
    // id
    let id = func.id.as_ref().map(|id| {
        let id_start = offset + id.span.start as usize - 1;
        let id_end = offset + id.span.end as usize - 1;
        arena.alloc_js_node(expr_to_node(create_identifier(
            &id.name,
            id_start,
            id_end,
            line_offsets,
        )))
    });

    // params
    let mut params: Vec<JsNode> = func
        .params
        .items
        .iter()
        .map(|param| convert_binding_pattern(arena, &param.pattern, offset, line_offsets))
        .collect();
    // Handle rest parameter (`...args`).
    if let Some(rest) = &func.params.rest {
        let rest_start = offset + rest.span.start as usize - 1;
        let rest_end = offset + rest.span.end as usize - 1;
        let argument = convert_binding_pattern(arena, &rest.rest.argument, offset, line_offsets);
        params.push(JsNode::RestElement {
            start: rest_start as u32,
            end: rest_end as u32,
            loc: create_typed_loc(rest_start, rest_end, line_offsets),
            argument: arena.alloc_js_node(argument),
        });
    }

    // body
    let body = func.body.as_ref().map(|body| {
        let body_start = offset + body.span.start as usize - 1;
        let body_end = offset + body.span.end as usize - 1;
        let statements: Vec<JsNode> = body
            .statements
            .iter()
            .filter_map(|stmt| convert_statement(arena, stmt, offset, line_offsets))
            .collect();
        arena.alloc_js_node(JsNode::BlockStatement {
            start: body_start as u32,
            end: body_end as u32,
            loc: create_typed_loc(body_start, body_end, line_offsets),
            body: arena.alloc_js_children(statements),
        })
    });

    Expression::from_node(JsNode::FunctionExpression {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        id,
        params: arena.alloc_js_children(params),
        body,
        generator: func.generator,
        r#async: func.r#async,
        expression: false,
        type_parameters,
        type_parameters_after_body,
    })
}

/// Convert an oxc `Function`'s generic type parameters into the opaque
/// `TSTypeParameterDeclaration` blob, using the expression-context (`offset - 1`)
/// span base. `None` when the function is non-generic.
fn function_expression_type_parameters(
    arena: &ParseArena,
    func: &oxc_ast::ast::Function,
    offset: usize,
    line_offsets: &[usize],
) -> Option<Box<serde_json::Value>> {
    func.type_parameters.as_ref().map(|tp| {
        Box::new(convert_ts_type_parameter_declaration(
            arena,
            tp,
            offset - 1,
            line_offsets,
        ))
    })
}

fn create_class_expression<'a>(
    arena: &ParseArena,
    class_expr: &oxc_ast::ast::Class,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression<'a> {
    // id
    let id = class_expr.id.as_ref().map(|id| {
        let id_start = offset + id.span.start as usize - 1;
        let id_end = offset + id.span.end as usize - 1;
        arena.alloc_js_node(expr_to_node(create_identifier(
            &id.name,
            id_start,
            id_end,
            line_offsets,
        )))
    });

    // superClass
    let super_class = class_expr.super_class.as_ref().map(|sc| {
        let super_expr = convert_expression(arena, sc, offset, line_offsets);
        arena.alloc_js_node(expr_to_node(super_expr))
    });

    // body
    let body = convert_class_body_for_expr(arena, &class_expr.body, offset, line_offsets);

    Expression::from_node(JsNode::ClassExpression {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        id,
        super_class,
        body: arena.alloc_js_node(JsNode::from_value(body)),
    })
}

fn create_tagged_template_expression<'a>(
    arena: &ParseArena,
    tagged: &oxc_ast::ast::TaggedTemplateExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression<'a> {
    let tag = convert_expression(arena, &tagged.tag, offset, line_offsets);

    let quasi_start = offset + tagged.quasi.span.start as usize - 1;
    let quasi_end = offset + tagged.quasi.span.end as usize - 1;
    let quasi = create_template_literal(
        arena,
        &tagged.quasi,
        quasi_start,
        quasi_end,
        offset,
        line_offsets,
    );

    Expression::from_node(JsNode::TaggedTemplateExpression {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        tag: arena.alloc_js_node(expr_to_node(tag)),
        quasi: arena.alloc_js_node(expr_to_node(quasi)),
    })
}

fn create_regex_literal<'a>(
    regex: &oxc_ast::ast::RegExpLiteral,
    start: usize,
    end: usize,
    line_offsets: &[usize],
) -> Expression<'a> {
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
    arena: &ParseArena,
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
        .filter_map(|element| convert_class_element_for_expr(arena, element, offset, line_offsets))
        .collect();
    obj.insert("body".to_string(), Value::Array(body_elements));

    Value::Object(obj)
}

/// Convert a class element to JSON value (for expression context, with -1 offset adjustment).
fn convert_class_element_for_expr(
    arena: &ParseArena,
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
            let key = convert_property_key_for_expr(arena, &method.key, offset, line_offsets);
            obj.insert("key".to_string(), key.to_value());

            // value (function expression). A method's generics live on the
            // MethodDefinition (acorn-typescript), not the inner function.
            let value_start = offset + method.value.span.start as usize - 1;
            let value_end = offset + method.value.span.end as usize - 1;
            let value = create_function_expression(
                arena,
                &method.value,
                value_start,
                value_end,
                offset,
                line_offsets,
                None,
                false,
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
            let key = convert_property_key_for_expr(arena, &prop.key, offset, line_offsets);
            obj.insert("key".to_string(), key.to_value());

            // value
            if let Some(ref value) = prop.value {
                let val = convert_expression(arena, value, offset, line_offsets);
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
                .filter_map(|stmt| convert_statement(arena, stmt, offset, line_offsets))
                .map(|node| node.to_value())
                .collect();
            obj.insert("body".to_string(), Value::Array(body_statements));

            Some(Value::Object(obj))
        }
        _ => None,
    }
}

fn create_array_expression<'a>(
    arena: &ParseArena,
    arr: &oxc_ast::ast::ArrayExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression<'a> {
    let elements: Vec<Option<JsNode>> = arr
        .elements
        .iter()
        .map(|elem| match elem {
            oxc_ast::ast::ArrayExpressionElement::SpreadElement(spread) => {
                let spread_start = offset + spread.span.start as usize - 1;
                let spread_end = offset + spread.span.end as usize - 1;
                let spread_arg = convert_expression(arena, &spread.argument, offset, line_offsets);
                Some(JsNode::SpreadElement {
                    start: spread_start as u32,
                    end: spread_end as u32,
                    loc: create_typed_loc(spread_start, spread_end, line_offsets),
                    argument: arena.alloc_js_node(expr_to_node(spread_arg)),
                })
            }
            oxc_ast::ast::ArrayExpressionElement::Elision(_) => None,
            _ => {
                let expr = elem.to_expression();
                Some(expr_to_node(convert_expression(
                    arena,
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

/// Object-method values keep their generics on the inner `FunctionExpression`,
/// but acorn-typescript serializes them *after* `body` (like arrows), not in the
/// declaration/expression slot before `params`.
fn mark_object_method_generics(node: &mut JsNode, is_method: bool) {
    if is_method
        && let JsNode::FunctionExpression {
            type_parameters_after_body,
            ..
        } = node
    {
        *type_parameters_after_body = true;
    }
}

fn create_object_expression<'a>(
    arena: &ParseArena,
    obj_expr: &oxc_ast::ast::ObjectExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression<'a> {
    let properties: Vec<JsNode> = obj_expr
        .properties
        .iter()
        .map(|prop| match prop {
            oxc_ast::ast::ObjectPropertyKind::ObjectProperty(p) => {
                let prop_start = offset + p.span.start as usize - 1;
                let prop_end = offset + p.span.end as usize - 1;

                let key = convert_property_key_for_expr(arena, &p.key, offset, line_offsets);
                let value = convert_expression(arena, &p.value, offset, line_offsets);
                let mut value_node = expr_to_node(value);
                mark_object_method_generics(&mut value_node, p.method);

                let kind = match p.kind {
                    oxc_ast::ast::PropertyKind::Init => "init",
                    oxc_ast::ast::PropertyKind::Get => "get",
                    oxc_ast::ast::PropertyKind::Set => "set",
                };

                JsNode::Property {
                    start: prop_start as u32,
                    end: prop_end as u32,
                    loc: create_typed_loc(prop_start, prop_end, line_offsets),
                    key: arena.alloc_js_node(key),
                    value: arena.alloc_js_node(value_node),
                    kind: CompactString::from(kind),
                    method: p.method,
                    shorthand: p.shorthand,
                    computed: p.computed,
                }
            }
            oxc_ast::ast::ObjectPropertyKind::SpreadProperty(spread) => {
                let spread_start = offset + spread.span.start as usize - 1;
                let spread_end = offset + spread.span.end as usize - 1;
                let argument = convert_expression(arena, &spread.argument, offset, line_offsets);

                JsNode::SpreadElement {
                    start: spread_start as u32,
                    end: spread_end as u32,
                    loc: create_typed_loc(spread_start, spread_end, line_offsets),
                    argument: arena.alloc_js_node(expr_to_node(argument)),
                }
            }
        })
        .collect();

    Expression::from_node(JsNode::ObjectExpression {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        properties: arena.alloc_js_children(properties),
    })
}

/// Convert property key with -1 adjustment for expression parsing context
fn convert_property_key_for_expr(
    arena: &ParseArena,
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
                expr_to_node(convert_expression(arena, expr, offset, line_offsets))
            } else {
                JsNode::Null
            }
        }
    }
}

fn create_assignment_expression<'a>(
    arena: &ParseArena,
    assign: &oxc_ast::ast::AssignmentExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression<'a> {
    let operator = assignment_operator_to_str(&assign.operator);
    let left = convert_assignment_target(arena, &assign.left, offset, line_offsets);
    let right = convert_expression(arena, &assign.right, offset, line_offsets);

    Expression::from_node(JsNode::AssignmentExpression {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        operator: CompactString::from(operator),
        left: arena.alloc_js_node(left),
        right: arena.alloc_js_node(expr_to_node(right)),
    })
}

fn assignment_operator_to_str(op: &oxc_ast::ast::AssignmentOperator) -> &'static str {
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
}

/// Convert an ObjectAssignmentTarget to ObjectPattern JsNode.
/// ObjectAssignmentTarget is `{ foo }` in `({ foo } = obj);`
fn convert_object_assignment_target(
    arena: &ParseArena,
    obj_target: &oxc_ast::ast::ObjectAssignmentTarget,
    offset: usize,
    line_offsets: &[usize],
) -> JsNode {
    // Note: -1 adjustment for the paren we added when parsing
    let start = offset + obj_target.span.start as usize - 1;
    let end = offset + obj_target.span.end as usize - 1;

    let mut properties: Vec<JsNode> = obj_target
        .properties
        .iter()
        .map(|prop| convert_assignment_target_property(arena, prop, offset, line_offsets))
        .collect();

    // Add rest element if present
    if let Some(rest) = &obj_target.rest {
        let rest_start = offset + rest.span.start as usize - 1;
        let rest_end = offset + rest.span.end as usize - 1;
        properties.push(JsNode::RestElement {
            start: rest_start as u32,
            end: rest_end as u32,
            loc: create_typed_loc(rest_start, rest_end, line_offsets),
            argument: arena.alloc_js_node(convert_assignment_target(
                arena,
                &rest.target,
                offset,
                line_offsets,
            )),
        });
    }

    JsNode::ObjectPattern {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        properties: arena.alloc_js_children(properties),
        type_annotation: None,
    }
}

/// Convert an ArrayAssignmentTarget to ArrayPattern JsNode.
/// ArrayAssignmentTarget is `[a, b]` in `([a, b] = arr);`
fn convert_array_assignment_target(
    arena: &ParseArena,
    arr_target: &oxc_ast::ast::ArrayAssignmentTarget,
    offset: usize,
    line_offsets: &[usize],
) -> JsNode {
    // Note: -1 adjustment for the paren we added when parsing
    let start = offset + arr_target.span.start as usize - 1;
    let end = offset + arr_target.span.end as usize - 1;

    let mut elements: Vec<Option<JsNode>> = arr_target
        .elements
        .iter()
        .map(|elem| {
            elem.as_ref().map(|target| {
                convert_assignment_target_maybe_default(arena, target, offset, line_offsets)
            })
        })
        .collect();

    // Add rest element if present
    if let Some(rest) = &arr_target.rest {
        let rest_start = offset + rest.span.start as usize - 1;
        let rest_end = offset + rest.span.end as usize - 1;
        elements.push(Some(JsNode::RestElement {
            start: rest_start as u32,
            end: rest_end as u32,
            loc: create_typed_loc(rest_start, rest_end, line_offsets),
            argument: arena.alloc_js_node(convert_assignment_target(
                arena,
                &rest.target,
                offset,
                line_offsets,
            )),
        }));
    }

    JsNode::ArrayPattern {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        elements,
        type_annotation: None,
    }
}

/// Convert an AssignmentTargetProperty to Property JsNode.
fn convert_assignment_target_property(
    arena: &ParseArena,
    prop: &oxc_ast::ast::AssignmentTargetProperty,
    offset: usize,
    line_offsets: &[usize],
) -> JsNode {
    use oxc_ast::ast::AssignmentTargetProperty;

    match prop {
        AssignmentTargetProperty::AssignmentTargetPropertyIdentifier(id_prop) => {
            // Shorthand property like `{ foo }` in `({ foo } = obj);`
            let start = offset + id_prop.span.start as usize - 1;
            let end = offset + id_prop.span.end as usize - 1;

            // For shorthand, key and value are the same identifier
            let id_start = offset + id_prop.binding.span.start as usize - 1;
            let id_end = offset + id_prop.binding.span.end as usize - 1;
            let id_node = expr_to_node(create_identifier(
                &id_prop.binding.name,
                id_start,
                id_end,
                line_offsets,
            ));

            // Value is the identifier, possibly with a default value
            let value = if let Some(init) = &id_prop.init {
                // Has default: `{ foo = default }` -> AssignmentPattern
                let init_end = offset + init.span().end as usize - 1;
                JsNode::AssignmentPattern {
                    start: id_start as u32,
                    end: init_end as u32,
                    loc: create_typed_loc(id_start, init_end, line_offsets),
                    left: arena.alloc_js_node(id_node.clone()),
                    right: arena.alloc_js_node(expr_to_node(convert_expression(
                        arena,
                        init,
                        offset,
                        line_offsets,
                    ))),
                }
            } else {
                id_node.clone()
            };

            JsNode::Property {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                key: arena.alloc_js_node(id_node),
                value: arena.alloc_js_node(value),
                kind: CompactString::from("init"),
                method: false,
                shorthand: true,
                computed: false,
            }
        }
        AssignmentTargetProperty::AssignmentTargetPropertyProperty(prop_prop) => {
            // Non-shorthand property like `{ foo: bar }` in `({ foo: bar } = obj);`
            let start = offset + prop_prop.span.start as usize - 1;
            let end = offset + prop_prop.span.end as usize - 1;

            let key =
                convert_property_key_with_offset(arena, &prop_prop.name, offset, line_offsets);
            let value = convert_assignment_target_maybe_default(
                arena,
                &prop_prop.binding,
                offset,
                line_offsets,
            );

            JsNode::Property {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                key: arena.alloc_js_node(key),
                value: arena.alloc_js_node(value),
                kind: CompactString::from("init"),
                method: false,
                shorthand: false,
                computed: prop_prop.computed,
            }
        }
    }
}

/// Convert an AssignmentTargetMaybeDefault to JsNode.
fn convert_assignment_target_maybe_default(
    arena: &ParseArena,
    target: &oxc_ast::ast::AssignmentTargetMaybeDefault,
    offset: usize,
    line_offsets: &[usize],
) -> JsNode {
    use oxc_ast::ast::AssignmentTargetMaybeDefault;

    match target {
        AssignmentTargetMaybeDefault::AssignmentTargetWithDefault(with_default) => {
            // Has default value: `foo = default`
            let start = offset + with_default.span.start as usize - 1;
            let end = offset + with_default.span.end as usize - 1;

            JsNode::AssignmentPattern {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                left: arena.alloc_js_node(convert_assignment_target(
                    arena,
                    &with_default.binding,
                    offset,
                    line_offsets,
                )),
                right: arena.alloc_js_node(expr_to_node(convert_expression(
                    arena,
                    &with_default.init,
                    offset,
                    line_offsets,
                ))),
            }
        }
        // All other variants are AssignmentTarget variants
        _ => {
            // Convert to AssignmentTarget - need to extract the inner target
            if let Some(inner) = target.as_assignment_target() {
                convert_assignment_target(arena, inner, offset, line_offsets)
            } else {
                JsNode::Null
            }
        }
    }
}

/// Convert a PropertyKey with -1 offset adjustment (for expression context).
fn convert_property_key_with_offset(
    arena: &ParseArena,
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
                expr_to_node(convert_expression(arena, expr, offset, line_offsets))
            } else {
                JsNode::Null
            }
        }
    }
}

fn convert_assignment_target(
    arena: &ParseArena,
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
                arena,
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
                arena,
                member,
                start,
                end,
                offset,
                line_offsets,
            ))
        }
        AssignmentTarget::ObjectAssignmentTarget(obj_target) => {
            convert_object_assignment_target(arena, obj_target, offset, line_offsets)
        }
        AssignmentTarget::ArrayAssignmentTarget(arr_target) => {
            convert_array_assignment_target(arena, arr_target, offset, line_offsets)
        }
        AssignmentTarget::PrivateFieldExpression(member) => {
            // `this.#field = …` LHS — mirror the simple-target arm so the
            // `this.#field` MemberExpression is visited in 2-analyze.
            let start = offset + member.span.start as usize - 1;
            let end = offset + member.span.end as usize - 1;
            expr_to_node(create_private_member_expression(
                arena,
                member,
                start,
                end,
                offset,
                line_offsets,
            ))
        }
        _ => {
            // Fallback for other complex patterns (e.g., TSAsExpression, TSNonNullExpression)
            JsNode::Null
        }
    }
}

fn create_update_expression<'a>(
    arena: &ParseArena,
    update: &oxc_ast::ast::UpdateExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression<'a> {
    let operator = match update.operator {
        oxc_ast::ast::UpdateOperator::Increment => "++",
        oxc_ast::ast::UpdateOperator::Decrement => "--",
    };

    let argument = convert_simple_assignment_target(arena, &update.argument, offset, line_offsets);

    Expression::from_node(JsNode::UpdateExpression {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        operator: CompactString::from(operator),
        prefix: update.prefix,
        argument: arena.alloc_js_node(argument),
    })
}

fn create_sequence_expression<'a>(
    arena: &ParseArena,
    seq: &oxc_ast::ast::SequenceExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression<'a> {
    let expressions: Vec<JsNode> = seq
        .expressions
        .iter()
        .map(|expr| expr_to_node(convert_expression(arena, expr, offset, line_offsets)))
        .collect();

    Expression::from_node(JsNode::SequenceExpression {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        expressions: arena.alloc_js_children(expressions),
    })
}

fn convert_simple_assignment_target(
    arena: &ParseArena,
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
                arena,
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
                arena,
                member,
                start,
                end,
                offset,
                line_offsets,
            ))
        }
        SimpleAssignmentTarget::PrivateFieldExpression(member) => {
            // `this.#field = …` LHS — without this arm it falls to `JsNode::Null`,
            // so 2-analyze never visits the `this.#field` MemberExpression and
            // `is_safe_identifier` can't flag it, leaving `needs_context` unset
            // (no `$.push`/`$.pop`). Mirror the program-path arm.
            let start = offset + member.span.start as usize - 1;
            let end = offset + member.span.end as usize - 1;
            expr_to_node(create_private_member_expression(
                arena,
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

fn create_arrow_function<'a>(
    arena: &ParseArena,
    arrow: &oxc_ast::ast::ArrowFunctionExpression,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression<'a> {
    // Convert params - pass offset - 1 because we wrapped content in parens for parsing
    let mut params: Vec<JsNode> = arrow
        .params
        .items
        .iter()
        .map(|param| {
            expr_to_node(convert_formal_parameter(
                arena,
                param,
                offset - 1,
                line_offsets,
            ))
        })
        .collect();
    // Handle rest parameter (`...args`) which is stored separately in OXC.
    if let Some(rest) = &arrow.params.rest {
        let rest_start = offset + rest.span.start as usize - 1;
        let rest_end = offset + rest.span.end as usize - 1;
        let argument = convert_binding_pattern_for_param_as_node(
            arena,
            &rest.rest.argument,
            offset - 1,
            line_offsets,
        );
        params.push(JsNode::RestElement {
            start: rest_start as u32,
            end: rest_end as u32,
            loc: create_typed_loc(rest_start, rest_end, line_offsets),
            argument: arena.alloc_js_node(argument),
        });
    }

    // Convert body - check if this is an expression body or block body
    let body_node = if arrow.expression {
        if let Some(oxc_ast::ast::Statement::ExpressionStatement(expr_stmt)) =
            arrow.body.statements.first()
        {
            expr_to_node(convert_expression(
                arena,
                &expr_stmt.expression,
                offset,
                line_offsets,
            ))
        } else {
            convert_arrow_body(arena, &arrow.body, offset, line_offsets)
        }
    } else {
        convert_arrow_body(arena, &arrow.body, offset, line_offsets)
    };

    Expression::from_node(JsNode::ArrowFunctionExpression {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        id: None,
        params: arena.alloc_js_children(params),
        body: arena.alloc_js_node(body_node),
        expression: arrow.expression,
        generator: false,
        r#async: arrow.r#async,
        type_parameters: arrow.type_parameters.as_ref().map(|tp| {
            Box::new(convert_ts_type_parameter_declaration(
                arena,
                tp,
                offset - 1,
                line_offsets,
            ))
        }),
    })
}

/// Convert arrow function body to JsNode (for block bodies).
fn convert_arrow_body(
    arena: &ParseArena,
    body: &oxc_ast::ast::FunctionBody,
    offset: usize,
    line_offsets: &[usize],
) -> JsNode {
    let start = offset + body.span.start as usize - 1;
    let end = offset + body.span.end as usize - 1;

    let body_stmts: Vec<JsNode> = body
        .statements
        .iter()
        .filter_map(|stmt| convert_statement(arena, stmt, offset, line_offsets))
        .collect();

    JsNode::BlockStatement {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        body: arena.alloc_js_children(body_stmts),
    }
}

/// Convert a statement to JsNode.
fn convert_statement(
    arena: &ParseArena,
    stmt: &oxc_ast::ast::Statement,
    offset: usize,
    line_offsets: &[usize],
) -> Option<JsNode> {
    match stmt {
        oxc_ast::ast::Statement::VariableDeclaration(decl) => Some(convert_variable_declaration(
            arena,
            decl,
            offset,
            line_offsets,
        )),
        oxc_ast::ast::Statement::ExpressionStatement(expr_stmt) => {
            let start = offset + expr_stmt.span.start as usize - 1;
            let end = offset + expr_stmt.span.end as usize - 1;

            Some(JsNode::ExpressionStatement {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                expression: arena.alloc_js_node(expr_to_node(convert_expression(
                    arena,
                    &expr_stmt.expression,
                    offset,
                    line_offsets,
                ))),
            })
        }
        oxc_ast::ast::Statement::ReturnStatement(ret_stmt) => {
            let start = offset + ret_stmt.span.start as usize - 1;
            let end = offset + ret_stmt.span.end as usize - 1;

            Some(JsNode::ReturnStatement {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                argument: ret_stmt.argument.as_ref().map(|arg| {
                    arena.alloc_js_node(expr_to_node(convert_expression(
                        arena,
                        arg,
                        offset,
                        line_offsets,
                    )))
                }),
            })
        }
        oxc_ast::ast::Statement::ThrowStatement(throw_stmt) => {
            let start = offset + throw_stmt.span.start as usize - 1;
            let end = offset + throw_stmt.span.end as usize - 1;

            Some(JsNode::ThrowStatement {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                argument: arena.alloc_js_node(expr_to_node(convert_expression(
                    arena,
                    &throw_stmt.argument,
                    offset,
                    line_offsets,
                ))),
            })
        }
        oxc_ast::ast::Statement::IfStatement(if_stmt) => {
            let start = offset + if_stmt.span.start as usize - 1;
            let end = offset + if_stmt.span.end as usize - 1;

            let consequent = convert_statement(arena, &if_stmt.consequent, offset, line_offsets)
                .unwrap_or(JsNode::Null);
            let alternate = if_stmt
                .alternate
                .as_ref()
                .and_then(|alt| convert_statement(arena, alt, offset, line_offsets));

            Some(JsNode::IfStatement {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                test: arena.alloc_js_node(expr_to_node(convert_expression(
                    arena,
                    &if_stmt.test,
                    offset,
                    line_offsets,
                ))),
                consequent: arena.alloc_js_node(consequent),
                alternate: alternate.map(|n| arena.alloc_js_node(n)),
            })
        }
        oxc_ast::ast::Statement::BlockStatement(block) => {
            let start = offset + block.span.start as usize - 1;
            let end = offset + block.span.end as usize - 1;

            let body_stmts: Vec<JsNode> = block
                .body
                .iter()
                .filter_map(|s| convert_statement(arena, s, offset, line_offsets))
                .collect();

            Some(JsNode::BlockStatement {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                body: arena.alloc_js_children(body_stmts),
            })
        }
        oxc_ast::ast::Statement::ForStatement(for_stmt) => {
            let start = offset + for_stmt.span.start as usize - 1;
            let end = offset + for_stmt.span.end as usize - 1;

            let init = for_stmt.init.as_ref().map(|init| match init {
                oxc_ast::ast::ForStatementInit::VariableDeclaration(vd) => arena.alloc_js_node(
                    convert_variable_declaration(arena, vd, offset, line_offsets),
                ),
                _ => {
                    if let Some(expr) = init.as_expression() {
                        arena.alloc_js_node(expr_to_node(convert_expression(
                            arena,
                            expr,
                            offset,
                            line_offsets,
                        )))
                    } else {
                        arena.alloc_js_node(JsNode::Null)
                    }
                }
            });

            let body = convert_statement(arena, &for_stmt.body, offset, line_offsets)
                .unwrap_or(JsNode::Null);
            let test = for_stmt.test.as_ref().map(|t| {
                arena.alloc_js_node(expr_to_node(convert_expression(
                    arena,
                    t,
                    offset,
                    line_offsets,
                )))
            });
            let update = for_stmt.update.as_ref().map(|u| {
                arena.alloc_js_node(expr_to_node(convert_expression(
                    arena,
                    u,
                    offset,
                    line_offsets,
                )))
            });

            Some(JsNode::ForStatement {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                init,
                test,
                update,
                body: arena.alloc_js_node(body),
            })
        }
        oxc_ast::ast::Statement::TryStatement(try_stmt) => {
            let start = offset + try_stmt.span.start as usize - 1;
            let end = offset + try_stmt.span.end as usize - 1;

            // Convert block
            let block_start = offset + try_stmt.block.span.start as usize - 1;
            let block_end = offset + try_stmt.block.span.end as usize - 1;
            let block_body: Vec<JsNode> = try_stmt
                .block
                .body
                .iter()
                .filter_map(|s| convert_statement(arena, s, offset, line_offsets))
                .collect();
            let block = JsNode::BlockStatement {
                start: block_start as u32,
                end: block_end as u32,
                loc: create_typed_loc(block_start, block_end, line_offsets),
                body: arena.alloc_js_children(block_body),
            };

            // Convert handler (catch clause)
            let handler = try_stmt.handler.as_ref().map(|handler| {
                let h_start = offset + handler.span.start as usize - 1;
                let h_end = offset + handler.span.end as usize - 1;
                let param = handler.param.as_ref().map(|param| {
                    arena.alloc_js_node(convert_binding_pattern_for_param_as_node(
                        arena,
                        &param.pattern,
                        offset - 1,
                        line_offsets,
                    ))
                });
                let h_body_start = offset + handler.body.span.start as usize - 1;
                let h_body_end = offset + handler.body.span.end as usize - 1;
                let h_body_stmts: Vec<JsNode> = handler
                    .body
                    .body
                    .iter()
                    .filter_map(|s| convert_statement(arena, s, offset, line_offsets))
                    .collect();
                arena.alloc_js_node(JsNode::CatchClause {
                    start: h_start as u32,
                    end: h_end as u32,
                    loc: create_typed_loc(h_start, h_end, line_offsets),
                    param,
                    body: arena.alloc_js_node(JsNode::BlockStatement {
                        start: h_body_start as u32,
                        end: h_body_end as u32,
                        loc: create_typed_loc(h_body_start, h_body_end, line_offsets),
                        body: arena.alloc_js_children(h_body_stmts),
                    }),
                })
            });

            // Convert finalizer (finally)
            let finalizer = try_stmt.finalizer.as_ref().map(|finalizer| {
                let f_start = offset + finalizer.span.start as usize - 1;
                let f_end = offset + finalizer.span.end as usize - 1;
                let f_body: Vec<JsNode> = finalizer
                    .body
                    .iter()
                    .filter_map(|s| convert_statement(arena, s, offset, line_offsets))
                    .collect();
                arena.alloc_js_node(JsNode::BlockStatement {
                    start: f_start as u32,
                    end: f_end as u32,
                    loc: create_typed_loc(f_start, f_end, line_offsets),
                    body: arena.alloc_js_children(f_body),
                })
            });

            Some(JsNode::TryStatement {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                block: arena.alloc_js_node(block),
                handler,
                finalizer,
            })
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

            let id = func_decl.id.as_ref().map(|id| {
                let id_start = offset + id.span.start as usize - 1;
                let id_end = offset + id.span.end as usize - 1;
                arena.alloc_js_node(expr_to_node(create_identifier(
                    &id.name,
                    id_start,
                    id_end,
                    line_offsets,
                )))
            });

            let mut params: Vec<JsNode> = func_decl
                .params
                .items
                .iter()
                .map(|param| {
                    expr_to_node(convert_formal_parameter(
                        arena,
                        param,
                        offset - 1,
                        line_offsets,
                    ))
                })
                .collect();
            if let Some(rest) = &func_decl.params.rest {
                let rest_start = offset + rest.span.start as usize - 1;
                let rest_end = offset + rest.span.end as usize - 1;
                let argument = convert_binding_pattern_for_param_as_node(
                    arena,
                    &rest.rest.argument,
                    offset - 1,
                    line_offsets,
                );
                params.push(JsNode::RestElement {
                    start: rest_start as u32,
                    end: rest_end as u32,
                    loc: create_typed_loc(rest_start, rest_end, line_offsets),
                    argument: arena.alloc_js_node(argument),
                });
            }

            let body = func_decl.body.as_ref().map(|body| {
                arena.alloc_js_node(convert_arrow_body(arena, body, offset, line_offsets))
            });

            Some(JsNode::FunctionDeclaration {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                id,
                params: arena.alloc_js_children(params),
                body,
                generator: func_decl.generator,
                r#async: func_decl.r#async,
                expression: false,
                type_parameters: func_decl.type_parameters.as_ref().map(|tp| {
                    Box::new(convert_ts_type_parameter_declaration(
                        arena,
                        tp,
                        offset - 1,
                        line_offsets,
                    ))
                }),
            })
        }
        // Fallback to the program-context converter for other statement types
        // (ForOfStatement, ForInStatement, WhileStatement, DoWhileStatement,
        // SwitchStatement, BreakStatement, ContinueStatement, LabeledStatement,
        // etc.). The program converter uses raw offsets; the template converter
        // wraps content in parens so we pass `offset - 1` to compensate.
        _ => convert_statement_for_program(arena, stmt, offset.saturating_sub(1), line_offsets),
    }
}

/// Convert a variable declaration to JsNode.
fn convert_variable_declaration(
    arena: &ParseArena,
    decl: &oxc_ast::ast::VariableDeclaration,
    offset: usize,
    line_offsets: &[usize],
) -> JsNode {
    let start = offset + decl.span.start as usize - 1;
    let end = offset + decl.span.end as usize - 1;

    let declarations: Vec<JsNode> = decl
        .declarations
        .iter()
        .map(|d| convert_variable_declarator(arena, d, offset, line_offsets))
        .collect();

    let kind = match decl.kind {
        oxc_ast::ast::VariableDeclarationKind::Var => "var",
        oxc_ast::ast::VariableDeclarationKind::Const => "const",
        oxc_ast::ast::VariableDeclarationKind::Let => "let",
        oxc_ast::ast::VariableDeclarationKind::Using => "using",
        oxc_ast::ast::VariableDeclarationKind::AwaitUsing => "await using",
    };

    JsNode::VariableDeclaration {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        declarations: arena.alloc_js_children(declarations),
        kind: CompactString::from(kind),
        declare: false,
    }
}

/// Convert a variable declarator to JsNode.
fn convert_variable_declarator(
    arena: &ParseArena,
    decl: &oxc_ast::ast::VariableDeclarator,
    offset: usize,
    line_offsets: &[usize],
) -> JsNode {
    let start = offset + decl.span.start as usize - 1;
    let end = offset + decl.span.end as usize - 1;

    // Convert id (pattern) with type annotation
    let id = convert_binding_pattern_for_decl_as_node(
        arena,
        &decl.id,
        offset,
        line_offsets,
        decl.type_annotation.as_deref(),
    );

    // Convert init
    let init = decl.init.as_ref().map(|expr| {
        arena.alloc_js_node(expr_to_node(convert_expression(
            arena,
            expr,
            offset,
            line_offsets,
        )))
    });

    JsNode::VariableDeclarator {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        id: arena.alloc_js_node(id),
        init,
    }
}

/// Convert a binding pattern for a variable declarator id, returning a typed
/// `JsNode` directly so the id routes through the typed analyze walker instead
/// of `JsNode::Raw`. The Object / Array / Assignment pattern arms reuse the
/// already-typed program-path converters (`offset - 1`). A bare
/// `BindingIdentifier` produces a typed `Identifier`.
///
/// A TS-type-annotated `BindingIdentifier` carries its `typeAnnotation` as an
/// opaque, output-only boundary blob on the typed `Identifier` node (analyze
/// never walks into it), with the extended `end`, recomputed `loc`, and the
/// `convert_type_annotation_adjusted` blob.
fn convert_binding_pattern_for_decl_as_node(
    arena: &ParseArena,
    pattern: &oxc_ast::ast::BindingPattern,
    offset: usize,
    line_offsets: &[usize],
    type_annotation: Option<&oxc_ast::ast::TSTypeAnnotation>,
) -> JsNode {
    match pattern {
        oxc_ast::ast::BindingPattern::BindingIdentifier(id) => {
            let start = offset + id.span.start as usize - 1;
            if let Some(type_ann) = type_annotation {
                // TS-annotated: extend `end` over the annotation and carry the
                // annotation blob verbatim (same as the Value form at
                // `convert_binding_pattern_for_decl`).
                let end = offset + type_ann.span.end as usize - 1;
                let ta_value =
                    convert_type_annotation_adjusted(arena, type_ann, offset - 1, line_offsets);
                JsNode::Identifier {
                    start: start as u32,
                    end: end as u32,
                    loc: create_typed_loc(start, end, line_offsets),
                    name: CompactString::from(id.name.as_str()),
                    optional: false,
                    type_annotation: Some(Box::new(ta_value)),
                }
            } else {
                let end = offset + id.span.end as usize - 1;
                expr_to_node(create_identifier(&id.name, start, end, line_offsets))
            }
        }
        oxc_ast::ast::BindingPattern::ObjectPattern(obj_pat) => {
            convert_object_pattern(arena, obj_pat, offset - 1, line_offsets)
        }
        oxc_ast::ast::BindingPattern::ArrayPattern(arr_pat) => {
            convert_array_pattern(arena, arr_pat, offset - 1, line_offsets)
        }
        oxc_ast::ast::BindingPattern::AssignmentPattern(assign_pat) => {
            convert_assignment_pattern(arena, assign_pat, offset - 1, line_offsets)
        }
    }
}

fn create_template_literal<'a>(
    arena: &ParseArena,
    template: &oxc_ast::ast::TemplateLiteral,
    start: usize,
    end: usize,
    offset: usize,
    line_offsets: &[usize],
) -> Expression<'a> {
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
        .map(|expr| expr_to_node(convert_expression(arena, expr, offset, line_offsets)))
        .collect();

    Expression::from_node(JsNode::TemplateLiteral {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        quasis: arena.alloc_js_children(quasis),
        expressions: arena.alloc_js_children(expressions),
    })
}

fn binary_operator_to_str(op: &oxc_ast::ast::BinaryOperator) -> &'static str {
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
}

fn logical_operator_to_str(op: &oxc_ast::ast::LogicalOperator) -> &'static str {
    use oxc_ast::ast::LogicalOperator::*;
    match op {
        And => "&&",
        Or => "||",
        Coalesce => "??",
    }
}

fn unary_operator_to_str(op: &oxc_ast::ast::UnaryOperator) -> &'static str {
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
}

fn update_operator_to_str(op: &oxc_ast::ast::UpdateOperator) -> &'static str {
    use oxc_ast::ast::UpdateOperator::*;
    match op {
        Increment => "++",
        Decrement => "--",
    }
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

// ============================================================================
// Typed loc helper functions (return typed_expr::Loc instead of serde_json::Value)
// ============================================================================

fn create_typed_loc(start: usize, end: usize, line_offsets: &[usize]) -> Option<Box<Loc>> {
    if line_offsets.is_empty() {
        return None;
    }
    let start_lc = get_line_column(start, line_offsets);
    let end_lc = get_line_column(end, line_offsets);
    Some(Box::new(Loc {
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
    }))
}

fn create_typed_loc_with_character(
    start: usize,
    end: usize,
    line_offsets: &[usize],
) -> Option<Box<Loc>> {
    if line_offsets.is_empty() {
        return None;
    }
    let start_lc = get_line_column(start, line_offsets);
    let end_lc = get_line_column(end, line_offsets);
    Some(Box::new(Loc {
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
    }))
}

fn create_typed_loc_for_binding(
    start: usize,
    end: usize,
    line_offsets: &[usize],
) -> Option<Box<Loc>> {
    if line_offsets.is_empty() {
        return None;
    }
    let start_lc = get_line_column_for_binding(start, line_offsets);
    let end_lc = get_line_column_for_binding(end, line_offsets);
    Some(Box::new(Loc {
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
    }))
}

fn create_typed_loc_for_binding_identifier(
    start: usize,
    end: usize,
    line_offsets: &[usize],
) -> Option<Box<Loc>> {
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
    Some(Box::new(Loc {
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
    }))
}

fn create_typed_loc_for_script(
    script_tag_start: usize,
    script_tag_end: usize,
    doc_line_offsets: &[usize],
) -> Option<Box<Loc>> {
    if doc_line_offsets.is_empty() {
        return None;
    }
    let start_lc = get_line_column(script_tag_start, doc_line_offsets);
    let end_lc = get_line_column(script_tag_end, doc_line_offsets);
    Some(Box::new(Loc {
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
    }))
}

/// Parameters for [`parse_program_with_error`], grouped into a struct to keep
/// the function signature under clippy's argument-count lint.
pub struct ProgramParseParams<'a> {
    pub content: &'a str,
    pub offset: usize,
    pub line_offsets: &'a [usize],
    /// Set to true if the script contains TypeScript.
    pub is_typescript: bool,
    /// HTML comments that appeared before the script tag.
    pub leading_comments: &'a [String],
    /// Positions for loc calculation (Svelte uses locator(start) for
    /// loc.start and locator(parser.index) for loc.end).
    pub script_tag_start: usize,
    pub script_tag_end: usize,
}

/// Parse a JavaScript program (script content) and return it as an Expression,
/// surfacing the first JS parse error as a `js_parse_error` `ParseError`
/// (mirroring upstream `acorn.parse`, which throws `e.js_parse_error` via
/// `handle_parse_error` for any script that acorn rejects — read/script.js →
/// acorn.js). The recovered partial program is still returned so lenient
/// callers (e.g. the profiling binary) can keep operating on a best-effort
/// AST.
pub fn parse_program_with_error<'a>(
    arena: &ParseArena,
    params: ProgramParseParams,
) -> (Expression<'a>, Option<crate::error::ParseError>) {
    let ProgramParseParams {
        content,
        offset,
        line_offsets,
        is_typescript,
        leading_comments,
        script_tag_start,
        script_tag_end,
    } = params;
    with_oxc_allocator(|allocator| {
        let source_type = if is_typescript {
            SourceType::ts()
        } else {
            SourceType::mjs()
        };
        let parser = OxcParser::new(allocator, content, source_type);
        let result = parser.parse();

        // Mirror upstream acorn's throw-on-error behaviour: capture the first
        // parse error (acorn reports `err.pos` where it stopped consuming
        // input; OXC's first label is the closest equivalent).
        let mut parse_error = result.diagnostics.first().map(|first_error| {
            let pos = first_error
                .labels
                .first()
                .map(|label| (label.offset() as usize).min(content.len()))
                .unwrap_or(0)
                + offset;
            crate::error::ParseError::svelte(
                "js_parse_error",
                first_error.message.to_string(),
                (pos, pos),
            )
        });

        // OXC accepts Stage-3 `@decorator` syntax even in plain JS; upstream's
        // acorn (no decorator plugin) raises js_parse_error at the `@` token.
        // A bare `@` is never legal JS outside decorators, so flag the first
        // decorator's position. Gated on a cheap byte scan first.
        if parse_error.is_none() && !is_typescript && content.contains('@') {
            use oxc_ast_visit::Visit;
            struct FindDecorator(Option<u32>);
            impl<'a> Visit<'a> for FindDecorator {
                fn visit_decorator(&mut self, dec: &oxc_ast::ast::Decorator<'a>) {
                    if self.0.is_none() {
                        self.0 = Some(dec.span.start);
                    }
                }
            }
            let mut finder = FindDecorator(None);
            finder.visit_program(&result.program);
            if let Some(at) = finder.0 {
                let pos = at as usize + offset;
                parse_error = Some(crate::error::ParseError::svelte(
                    "js_parse_error",
                    "Unexpected character '@'".to_string(),
                    (pos, pos),
                ));
            }
        }

        let program = &result.program;

        // Calculate actual positions within the document
        let start = offset + program.span.start as usize;
        let end = offset + program.span.end as usize;

        // For Program loc, Svelte uses document coordinates:
        // - loc.start: locator(script_tag_start) - position of <script>
        // - loc.end: locator(script_tag_end) - position after </script>
        let loc = create_typed_loc_for_script(script_tag_start, script_tag_end, line_offsets);

        // Convert body statements and attach leading comments to each statement.
        // The official Svelte compiler (via acorn) attaches leadingComments to AST nodes.
        // OXC stores all comments at the program level, so we distribute them here.
        let all_comments: Vec<_> = result.program.comments.iter().collect();
        let has_comments = !all_comments.is_empty();

        // The per-statement `to_value()` + comment-distribution + harvest pass
        // below exists solely to populate `ignore_comment_map` from
        // `svelte-ignore` leading comments. A comment that never contains the
        // literal `svelte-ignore` can never match, so gate the whole (expensive,
        // full-tree) slow path on the presence of at least one such comment and
        // keep every other comment-bearing script on the typed fast path.
        let has_ignore = all_comments.iter().any(|comment| {
            let end = (comment.span.end as usize).min(content.len());
            let start = comment.span.start as usize;
            start <= end && content[start..end].contains("svelte-ignore")
        });

        // Mirror upstream `parser.root.comments`: forward every comment seen
        // by the script parser so it lands in `Root.comments`.
        for comment in all_comments.iter() {
            let comment_start = offset + comment.span.start as usize;
            let comment_end = offset + comment.span.end as usize;
            let raw_text = if comment.span.end as usize <= content.len() {
                &content[comment.span.start as usize..comment.span.end as usize]
            } else {
                ""
            };
            let mut value = extract_comment_value(raw_text, comment.kind);
            if matches!(
                comment.kind,
                oxc_ast::ast::CommentKind::SingleLineBlock
                    | oxc_ast::ast::CommentKind::MultiLineBlock
            ) {
                value = normalize_block_comment_indentation(
                    &value,
                    content,
                    comment.span.start as usize,
                );
            }
            record_oxc_comment(
                comment.kind,
                value,
                comment_start,
                comment_end,
                line_offsets,
            );
        }

        // Build body as Vec<JsNode> (typed, no Value conversion needed for common case).
        //
        // `ignore_comment_map` accumulates `node_start -> [svelte-ignore comment text]`
        // for every node that carries a `svelte-ignore` leading comment (at any depth).
        // It replaces the former `JsNode::Raw(value_with_leadingComments)` wrapping: the
        // only Phase-2 consumer of those statement-level `leadingComments` is svelte-ignore
        // warning suppression, so we keep the statement TYPED and surface just the ignore
        // texts. Comments still reach `Root.comments` independently via `record_oxc_comment`
        // above, and codegen re-parses script text, so dropping the Raw wrapping changes no
        // output.
        let mut ignore_comment_map: Vec<(u32, Vec<CompactString>)> = Vec::new();
        let body: Vec<JsNode> = if has_comments && has_ignore {
            let mut comment_idx = 0;
            let mut body_nodes: Vec<JsNode> = Vec::with_capacity(program.body.len());

            // Pre-compute comment entries (absolute positions + Value) once, used for
            // distributing comments onto nested statement bodies.
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

            for stmt in program.body.iter() {
                if let Some(stmt_node) =
                    convert_statement_for_program(arena, stmt, offset, line_offsets)
                {
                    let stmt_start = stmt.span().start;

                    // Collect comments that appear before this statement (its own leading
                    // comments).
                    let mut stmt_leading = Vec::new();
                    while comment_idx < all_comments.len()
                        && all_comments[comment_idx].span.end <= stmt_start
                    {
                        let comment = all_comments[comment_idx];
                        stmt_leading.push(build_comment_value(comment, content, offset));
                        comment_idx += 1;
                    }

                    // Skip comments that are inside the statement
                    while comment_idx < all_comments.len()
                        && all_comments[comment_idx].span.start < stmt.span().end
                    {
                        comment_idx += 1;
                    }

                    // Reproduce the exact comment-attachment the old code used (own leading
                    // comments + nested distribution) on a throwaway Value, then harvest
                    // svelte-ignore texts into the map. The statement itself stays TYPED.
                    if !stmt_leading.is_empty() || !comment_entries.is_empty() {
                        let mut val = stmt_node.to_value();
                        if !stmt_leading.is_empty()
                            && let Value::Object(ref mut obj) = val
                        {
                            obj.insert("leadingComments".to_string(), Value::Array(stmt_leading));
                        }
                        distribute_comments_to_node(&mut val, &comment_entries);
                        harvest_ignore_comments(&val, &mut ignore_comment_map);
                    }

                    body_nodes.push(stmt_node);
                }
            }

            body_nodes
        } else {
            // No comments, or comments but no `svelte-ignore` — fast path: keep
            // everything as typed JsNode (the harvest pass would find nothing).
            program
                .body
                .iter()
                .filter_map(|stmt| convert_statement_for_program(arena, stmt, offset, line_offsets))
                .collect()
        };

        // Build trailing comments (all JS comments stored on Program for backward compat)
        let trailing_comments_val = if has_comments {
            Some(
                all_comments
                    .iter()
                    .map(|comment| build_comment_value(comment, content, offset))
                    .collect(),
            )
        } else {
            None
        };

        // Build leading comments from HTML comments before script tag
        let leading_comments_val = if !leading_comments.is_empty() {
            Some(
                leading_comments
                    .iter()
                    .map(|comment| {
                        let mut comment_obj = Map::new();
                        comment_obj.insert("type".to_string(), Value::String("Line".to_string()));
                        comment_obj.insert("value".to_string(), Value::String(comment.clone()));
                        Value::Object(comment_obj)
                    })
                    .collect(),
            )
        } else {
            None
        };

        (
            Expression::from_node(JsNode::Program {
                start: start as u32,
                end: end as u32,
                loc,
                body: arena.alloc_js_children(body),
                source_type: CompactString::from("module"),
                leading_comments: leading_comments_val,
                trailing_comments: trailing_comments_val,
                ignore_comment_map,
            }),
            parse_error,
        )
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

/// Walk a comment-annotated statement `Value` (after `distribute_comments_to_node`)
/// and harvest every `svelte-ignore` leading-comment text into `map`, keyed by the
/// owning node's absolute `start` offset.
///
/// Only `svelte-ignore` comments are kept (the sole Phase-2 consumer of statement-level
/// `leadingComments`); a comment is a candidate when its value text — after leading
/// whitespace — begins with `svelte-ignore` (a strict superset of the analyze-side
/// `^\s*svelte-ignore\s` match, so nothing relevant is dropped and non-matching texts
/// that survive simply extract to zero codes downstream).
fn harvest_ignore_comments(node: &Value, map: &mut Vec<(u32, Vec<CompactString>)>) {
    let Value::Object(obj) = node else {
        return;
    };

    if let Some(Value::Array(comments)) = obj.get("leadingComments")
        && let Some(start) = obj.get("start").and_then(|s| s.as_u64())
    {
        let kept: Vec<CompactString> = comments
            .iter()
            .filter_map(|c| c.get("value").and_then(|v| v.as_str()))
            .filter(|v| v.trim_start().starts_with("svelte-ignore"))
            .map(CompactString::from)
            .collect();
        if !kept.is_empty() {
            map.push((start as u32, kept));
        }
    }

    // Recurse into every nested object / array so nested `svelte-ignore` comments
    // (attached by `distribute_comments_to_node`) are harvested too.
    for value in obj.values() {
        match value {
            Value::Object(_) => harvest_ignore_comments(value, map),
            Value::Array(items) => {
                for item in items {
                    harvest_ignore_comments(item, map);
                }
            }
            _ => {}
        }
    }
}

/// A pre-computed comment entry with positions extracted to avoid repeated Value lookups.
struct CommentEntry {
    start: u32,
    end: u32,
    value: Value,
}

/// Recursively walk a node and distribute comments to any nested statement bodies.
///
/// This function operates entirely in-place: it never clones statement Values.
/// Comments are attached by inserting `leadingComments` directly into existing
/// statement Map objects via mutable references.
/// Distribute comments to nested statement bodies. Returns `true` if any
/// `leadingComments` field was actually inserted (i.e. the node was mutated).
fn distribute_comments_to_node(node: &mut Value, comments: &[CommentEntry]) -> bool {
    let Some(obj) = node.as_object_mut() else {
        return false;
    };
    let mut modified = false;

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
                            modified = true;
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
                        modified |= distribute_comments_to_node(item, comments);
                    }
                }
            } else if child.is_object() {
                modified |= distribute_comments_to_node(child, comments);
            }
        }
    }

    modified
}

/// Convert a statement to JSON value (for program context, no -1 offset adjustment).
fn convert_statement_for_program(
    arena: &ParseArena,
    stmt: &oxc_ast::ast::Statement,
    offset: usize,
    line_offsets: &[usize],
) -> Option<JsNode> {
    match stmt {
        oxc_ast::ast::Statement::ExpressionStatement(expr_stmt) => {
            let expr =
                convert_expression_for_program(arena, &expr_stmt.expression, offset, line_offsets);
            let start = offset + expr_stmt.span.start as usize;
            let end = offset + expr_stmt.span.end as usize;
            let loc = create_typed_loc(start, end, line_offsets);
            Some(JsNode::ExpressionStatement {
                start: start as u32,
                end: end as u32,
                loc,
                expression: arena.alloc_js_node(expr_to_node(expr)),
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
                    convert_variable_declarator_for_program(arena, decl, offset, line_offsets)
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
                declarations: arena.alloc_js_children(declarations),
                kind: CompactString::from(kind),
                declare: var_decl.declare,
            })
        }
        oxc_ast::ast::Statement::FunctionDeclaration(func_decl) => {
            convert_function_declaration_as_node(arena, func_decl, offset, line_offsets)
        }
        oxc_ast::ast::Statement::ExportNamedDeclaration(export_decl) => {
            let start = offset + export_decl.span.start as usize;
            let end = offset + export_decl.span.end as usize;
            let loc = create_typed_loc(start, end, line_offsets);

            // Handle declaration if present (e.g., export let x;)
            let declaration = export_decl.declaration.as_ref().map(|decl| {
                arena.alloc_js_node(convert_declaration_for_program_as_node(
                    arena,
                    decl,
                    offset,
                    line_offsets,
                ))
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
                        local: arena.alloc_js_node(local),
                        exported: arena.alloc_js_node(exported),
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
                arena.alloc_js_node(expr_to_node(create_string_literal(
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
                specifiers: arena.alloc_js_children(specifiers),
                source,
                export_kind,
                attributes: IdRange::empty(),
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
                        arena.alloc_js_node(expr_to_node(create_identifier(
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
                            expr_to_node(convert_formal_parameter(
                                arena,
                                param,
                                offset,
                                line_offsets,
                            ))
                        })
                        .collect();

                    let body_node = func_decl.body.as_ref().map(|body| {
                        arena.alloc_js_node(convert_function_body_for_program_as_node(
                            arena,
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
                        params: arena.alloc_js_children(params),
                        body: body_node,
                        generator: func_decl.generator,
                        r#async: func_decl.r#async,
                        expression: false,
                        type_parameters: func_decl.type_parameters.as_ref().map(|tp| {
                            Box::new(convert_ts_type_parameter_declaration(
                                arena,
                                tp,
                                offset,
                                line_offsets,
                            ))
                        }),
                    }
                }
                oxc_ast::ast::ExportDefaultDeclarationKind::ClassDeclaration(class_decl)
                    if !class_decl.declare
                        && !class_decl.r#abstract
                        && class_decl.implements.is_empty()
                        && class_decl.decorators.is_empty() =>
                {
                    // Plain-JS class: the typed `ClassDeclaration` node omits the
                    // TS-only `abstract`/`declare`/`implements`/`decorators`
                    // fields, so it serializes byte-identical to the former Value
                    // blob while routing the class body through the typed walker.
                    convert_class_declaration_as_node(arena, class_decl, offset, line_offsets)
                }
                oxc_ast::ast::ExportDefaultDeclarationKind::ClassDeclaration(class_decl) => {
                    // Class declarations with TS modifiers / decorators are not
                    // representable in the byte-identical typed shape; use Raw.
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
                        let super_expr = convert_expression_for_program(
                            arena,
                            super_class,
                            offset,
                            line_offsets,
                        );
                        class_obj.insert("superClass".to_string(), super_expr.as_json().clone());
                    } else {
                        class_obj.insert("superClass".to_string(), Value::Null);
                    }

                    let body = convert_class_body_for_program(
                        arena,
                        &class_decl.body,
                        offset,
                        line_offsets,
                    );
                    class_obj.insert("body".to_string(), body);

                    JsNode::from_value(Value::Object(class_obj))
                }
                oxc_ast::ast::ExportDefaultDeclarationKind::TSInterfaceDeclaration(_) => {
                    JsNode::Null
                }
                _ => {
                    if let Some(expr) = export_decl.declaration.as_expression() {
                        expr_to_node(convert_expression_for_program(
                            arena,
                            expr,
                            offset,
                            line_offsets,
                        ))
                    } else {
                        JsNode::Null
                    }
                }
            };

            Some(JsNode::ExportDefaultDeclaration {
                start: start as u32,
                end: end as u32,
                loc,
                declaration: arena.alloc_js_node(declaration),
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
                        .map(|spec| convert_import_specifier(arena, spec, offset, line_offsets))
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
                specifiers: arena.alloc_js_children(specifiers),
                source: arena.alloc_js_node(source),
                import_kind,
                attributes: IdRange::empty(),
            })
        }
        oxc_ast::ast::Statement::IfStatement(if_stmt) => {
            let start = offset + if_stmt.span.start as usize;
            let end = offset + if_stmt.span.end as usize;
            let loc = create_typed_loc(start, end, line_offsets);

            let test = convert_expression_for_program(arena, &if_stmt.test, offset, line_offsets);
            let consequent =
                convert_statement_for_program(arena, &if_stmt.consequent, offset, line_offsets);
            let alternate = if_stmt
                .alternate
                .as_ref()
                .and_then(|alt| convert_statement_for_program(arena, alt, offset, line_offsets));

            Some(JsNode::IfStatement {
                start: start as u32,
                end: end as u32,
                loc,
                test: arena.alloc_js_node(expr_to_node(test)),
                consequent: arena.alloc_js_node(consequent.unwrap_or(JsNode::Null)),
                alternate: alternate.map(|n| arena.alloc_js_node(n)),
            })
        }
        oxc_ast::ast::Statement::BlockStatement(block_stmt) => {
            let start = offset + block_stmt.span.start as usize;
            let end = offset + block_stmt.span.end as usize;
            let loc = create_typed_loc(start, end, line_offsets);

            let body: Vec<JsNode> = block_stmt
                .body
                .iter()
                .filter_map(|stmt| convert_statement_for_program(arena, stmt, offset, line_offsets))
                .collect();

            Some(JsNode::BlockStatement {
                start: start as u32,
                end: end as u32,
                loc,
                body: arena.alloc_js_children(body),
            })
        }
        oxc_ast::ast::Statement::ClassDeclaration(class_decl) => Some(
            convert_class_declaration_as_node(arena, class_decl, offset, line_offsets),
        ),
        oxc_ast::ast::Statement::ReturnStatement(ret_stmt) => {
            let start = offset + ret_stmt.span.start as usize;
            let end = offset + ret_stmt.span.end as usize;
            let loc = create_typed_loc(start, end, line_offsets);

            let argument = ret_stmt.argument.as_ref().map(|arg| {
                arena.alloc_js_node(expr_to_node(convert_expression_for_program(
                    arena,
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
                oxc_ast::ast::ForStatementInit::VariableDeclaration(vd) => arena.alloc_js_node(
                    convert_variable_declaration_as_node(arena, vd, offset, line_offsets),
                ),
                _ => {
                    if let Some(expr) = init.as_expression() {
                        arena.alloc_js_node(expr_to_node(convert_expression_for_program(
                            arena,
                            expr,
                            offset,
                            line_offsets,
                        )))
                    } else {
                        arena.alloc_js_node(JsNode::Null)
                    }
                }
            });

            let test = for_stmt.test.as_ref().map(|test| {
                arena.alloc_js_node(expr_to_node(convert_expression_for_program(
                    arena,
                    test,
                    offset,
                    line_offsets,
                )))
            });

            let update = for_stmt.update.as_ref().map(|update| {
                arena.alloc_js_node(expr_to_node(convert_expression_for_program(
                    arena,
                    update,
                    offset,
                    line_offsets,
                )))
            });

            let body = convert_statement_for_program(arena, &for_stmt.body, offset, line_offsets)
                .unwrap_or(JsNode::Null);

            Some(JsNode::ForStatement {
                start: start as u32,
                end: end as u32,
                loc,
                init,
                test,
                update,
                body: arena.alloc_js_node(body),
            })
        }
        oxc_ast::ast::Statement::ForOfStatement(for_of_stmt) => {
            let start = offset + for_of_stmt.span.start as usize;
            let end = offset + for_of_stmt.span.end as usize;
            let loc = create_typed_loc(start, end, line_offsets);

            let left = match &for_of_stmt.left {
                oxc_ast::ast::ForStatementLeft::VariableDeclaration(vd) => {
                    convert_variable_declaration_as_node(arena, vd, offset, line_offsets)
                }
                // Assignment-target left (`for (x of arr)`, `for ([a,b] of arr)`,
                // `for (obj.p of arr)`): preserve it instead of dropping it to
                // `Null` (which made the whole loop vanish downstream). H-127.
                other => other
                    .as_assignment_target()
                    .map(|t| convert_assignment_target_for_program(arena, t, offset, line_offsets))
                    .unwrap_or(JsNode::Null),
            };

            let right = expr_to_node(convert_expression_for_program(
                arena,
                &for_of_stmt.right,
                offset,
                line_offsets,
            ));

            let body =
                convert_statement_for_program(arena, &for_of_stmt.body, offset, line_offsets)
                    .unwrap_or(JsNode::Null);

            Some(JsNode::ForOfStatement {
                start: start as u32,
                end: end as u32,
                loc,
                r#await: for_of_stmt.r#await,
                left: arena.alloc_js_node(left),
                right: arena.alloc_js_node(right),
                body: arena.alloc_js_node(body),
            })
        }
        oxc_ast::ast::Statement::ForInStatement(for_in_stmt) => {
            let start = offset + for_in_stmt.span.start as usize;
            let end = offset + for_in_stmt.span.end as usize;
            let loc = create_typed_loc(start, end, line_offsets);

            let left = match &for_in_stmt.left {
                oxc_ast::ast::ForStatementLeft::VariableDeclaration(vd) => {
                    convert_variable_declaration_as_node(arena, vd, offset, line_offsets)
                }
                // Assignment-target left (`for (x in obj)`, `for (a.b in obj)`):
                // preserve it instead of dropping it to `Null`. H-127.
                other => other
                    .as_assignment_target()
                    .map(|t| convert_assignment_target_for_program(arena, t, offset, line_offsets))
                    .unwrap_or(JsNode::Null),
            };

            let right = expr_to_node(convert_expression_for_program(
                arena,
                &for_in_stmt.right,
                offset,
                line_offsets,
            ));

            let body =
                convert_statement_for_program(arena, &for_in_stmt.body, offset, line_offsets)
                    .unwrap_or(JsNode::Null);

            Some(JsNode::ForInStatement {
                start: start as u32,
                end: end as u32,
                loc,
                left: arena.alloc_js_node(left),
                right: arena.alloc_js_node(right),
                body: arena.alloc_js_node(body),
            })
        }
        oxc_ast::ast::Statement::WhileStatement(while_stmt) => {
            let start = offset + while_stmt.span.start as usize;
            let end = offset + while_stmt.span.end as usize;
            let loc = create_typed_loc(start, end, line_offsets);

            let test = expr_to_node(convert_expression_for_program(
                arena,
                &while_stmt.test,
                offset,
                line_offsets,
            ));

            let body = convert_statement_for_program(arena, &while_stmt.body, offset, line_offsets)
                .unwrap_or(JsNode::Null);

            Some(JsNode::WhileStatement {
                start: start as u32,
                end: end as u32,
                loc,
                test: arena.alloc_js_node(test),
                body: arena.alloc_js_node(body),
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
                .filter_map(|stmt| convert_statement_for_program(arena, stmt, offset, line_offsets))
                .collect();
            let block = JsNode::BlockStatement {
                start: block_start as u32,
                end: block_end as u32,
                loc: block_loc,
                body: arena.alloc_js_children(block_body),
            };

            // handler
            let handler = try_stmt.handler.as_ref().map(|handler| {
                let handler_start = offset + handler.span.start as usize;
                let handler_end = offset + handler.span.end as usize;
                let handler_loc = create_typed_loc(handler_start, handler_end, line_offsets);

                let param = handler.param.as_ref().map(|param| {
                    arena.alloc_js_node(convert_binding_pattern(
                        arena,
                        &param.pattern,
                        offset,
                        line_offsets,
                    ))
                });

                let body_start = offset + handler.body.span.start as usize;
                let body_end = offset + handler.body.span.end as usize;
                let body_loc = create_typed_loc(body_start, body_end, line_offsets);
                let body_stmts: Vec<JsNode> = handler
                    .body
                    .body
                    .iter()
                    .filter_map(|stmt| {
                        convert_statement_for_program(arena, stmt, offset, line_offsets)
                    })
                    .collect();
                let body = JsNode::BlockStatement {
                    start: body_start as u32,
                    end: body_end as u32,
                    loc: body_loc,
                    body: arena.alloc_js_children(body_stmts),
                };

                arena.alloc_js_node(JsNode::CatchClause {
                    start: handler_start as u32,
                    end: handler_end as u32,
                    loc: handler_loc,
                    param,
                    body: arena.alloc_js_node(body),
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
                    .filter_map(|stmt| {
                        convert_statement_for_program(arena, stmt, offset, line_offsets)
                    })
                    .collect();
                arena.alloc_js_node(JsNode::BlockStatement {
                    start: finalizer_start as u32,
                    end: finalizer_end as u32,
                    loc: finalizer_loc,
                    body: arena.alloc_js_children(body_stmts),
                })
            });

            Some(JsNode::TryStatement {
                start: start as u32,
                end: end as u32,
                loc,
                block: arena.alloc_js_node(block),
                handler,
                finalizer,
            })
        }
        oxc_ast::ast::Statement::ThrowStatement(throw_stmt) => {
            let start = offset + throw_stmt.span.start as usize;
            let end = offset + throw_stmt.span.end as usize;
            let loc = create_typed_loc(start, end, line_offsets);

            let argument = expr_to_node(convert_expression_for_program(
                arena,
                &throw_stmt.argument,
                offset,
                line_offsets,
            ));

            Some(JsNode::ThrowStatement {
                start: start as u32,
                end: end as u32,
                loc,
                argument: arena.alloc_js_node(argument),
            })
        }
        oxc_ast::ast::Statement::BreakStatement(break_stmt) => {
            let start = offset + break_stmt.span.start as usize;
            let end = offset + break_stmt.span.end as usize;
            let loc = create_typed_loc(start, end, line_offsets);

            let label = break_stmt.label.as_ref().map(|label| {
                let label_start = offset + label.span.start as usize;
                let label_end = offset + label.span.end as usize;
                arena.alloc_js_node(expr_to_node(create_identifier(
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
                arena.alloc_js_node(expr_to_node(create_identifier(
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

            // Program context: the offset is already program-adjusted, so use
            // `convert_expression_for_program` (no `-1` paren shift) like every
            // other statement here. Using `convert_expression` double-counts the
            // paren and shifts the discriminant span one unit left onto the `(`
            // (#916).
            let discriminant = expr_to_node(convert_expression_for_program(
                arena,
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
                        arena.alloc_js_node(expr_to_node(convert_expression_for_program(
                            arena,
                            test,
                            offset,
                            line_offsets,
                        )))
                    });

                    let consequent: Vec<JsNode> = case
                        .consequent
                        .iter()
                        .filter_map(|stmt| {
                            convert_statement_for_program(arena, stmt, offset, line_offsets)
                        })
                        .collect();

                    JsNode::SwitchCase {
                        start: case_start as u32,
                        end: case_end as u32,
                        loc: case_loc,
                        test,
                        consequent: arena.alloc_js_children(consequent),
                    }
                })
                .collect();

            Some(JsNode::SwitchStatement {
                start: start as u32,
                end: end as u32,
                loc,
                discriminant: arena.alloc_js_node(discriminant),
                cases: arena.alloc_js_children(cases),
            })
        }
        oxc_ast::ast::Statement::DoWhileStatement(do_while_stmt) => {
            let start = offset + do_while_stmt.span.start as usize;
            let end = offset + do_while_stmt.span.end as usize;
            let loc = create_typed_loc(start, end, line_offsets);

            let test = expr_to_node(convert_expression_for_program(
                arena,
                &do_while_stmt.test,
                offset,
                line_offsets,
            ));

            let body =
                convert_statement_for_program(arena, &do_while_stmt.body, offset, line_offsets)
                    .unwrap_or(JsNode::Null);

            Some(JsNode::DoWhileStatement {
                start: start as u32,
                end: end as u32,
                loc,
                test: arena.alloc_js_node(test),
                body: arena.alloc_js_node(body),
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

            let body =
                convert_statement_for_program(arena, &labeled_stmt.body, offset, line_offsets)
                    .unwrap_or(JsNode::Null);

            Some(JsNode::LabeledStatement {
                start: start as u32,
                end: end as u32,
                loc,
                label: arena.alloc_js_node(label),
                body: arena.alloc_js_node(body),
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
            // `declare module`, `declare global`, `declare namespace` etc. are
            // type-only and must be stripped.
            if module_decl.declare {
                let start = offset + module_decl.span.start as usize;
                let end = offset + module_decl.span.end as usize;
                return Some(JsNode::EmptyStatement {
                    start: start as u32,
                    end: end as u32,
                    loc: create_typed_loc(start, end, line_offsets),
                });
            }
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
                                convert_statement_for_program(arena, stmt, offset, line_offsets)
                            })
                            .collect();
                        // Structure: node.body = { body: [...statements...] }
                        // TSModuleDeclaration body is a wrapper with inner body
                        Some(arena.alloc_js_node(JsNode::BlockStatement {
                            start: start as u32,
                            end: end as u32,
                            loc: loc.clone(),
                            body: arena.alloc_js_children(block_body),
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
/// Convert a `FunctionDeclaration` to a typed `JsNode` (program context, no -1
/// offset adjustment). Returns `None` for TypeScript `declare function` and
/// overload signatures (no body) so the caller can drop them, mirroring the
/// `remove_typescript_nodes` filter. Note: rest parameters are not emitted (only
/// `params.items`); callers that need rest-param fidelity must route through the
/// `JsNode::Raw` Value form (`convert_declaration_for_program`).
fn convert_function_declaration_as_node(
    arena: &ParseArena,
    func_decl: &oxc_ast::ast::Function,
    offset: usize,
    line_offsets: &[usize],
) -> Option<JsNode> {
    // Filter out TypeScript declare functions and function overload signatures (no body)
    if func_decl.r#type == oxc_ast::ast::FunctionType::TSDeclareFunction || func_decl.body.is_none()
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
        arena.alloc_js_node(expr_to_node(id_expr))
    });

    // Convert params
    let params: Vec<JsNode> = func_decl
        .params
        .items
        .iter()
        .map(|param| expr_to_node(convert_formal_parameter(arena, param, offset, line_offsets)))
        .collect();

    // Convert body
    let body_node = func_decl.body.as_ref().map(|body| {
        arena.alloc_js_node(convert_function_body_for_program_as_node(
            arena,
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
        params: arena.alloc_js_children(params),
        body: body_node,
        generator: func_decl.generator,
        r#async: func_decl.r#async,
        expression: false,
        type_parameters: func_decl.type_parameters.as_ref().map(|tp| {
            Box::new(convert_ts_type_parameter_declaration(
                arena,
                tp,
                offset,
                line_offsets,
            ))
        }),
    })
}

/// Convert a `ClassDeclaration` to a typed `JsNode` (program context, no -1
/// offset adjustment). The body is typed when every member is plain JS,
/// otherwise it falls back to a `JsNode::Raw` blob (TS modifiers / decorators /
/// declare / accessor).
fn convert_class_declaration_as_node(
    arena: &ParseArena,
    class_decl: &oxc_ast::ast::Class,
    offset: usize,
    line_offsets: &[usize],
) -> JsNode {
    let start = offset + class_decl.span.start as usize;
    let end = offset + class_decl.span.end as usize;
    let loc = create_typed_loc(start, end, line_offsets);

    // id
    let id = class_decl.id.as_ref().map(|id| {
        let id_start = offset + id.span.start as usize;
        let id_end = offset + id.span.end as usize;
        let id_expr = create_identifier(&id.name, id_start, id_end, line_offsets);
        arena.alloc_js_node(expr_to_node(id_expr))
    });

    // superClass
    let super_class = class_decl.super_class.as_ref().map(|super_class| {
        let super_class_value =
            convert_expression_for_program(arena, super_class, offset, line_offsets);
        arena.alloc_js_node(expr_to_node(super_class_value))
    });

    // body (ClassBody) — typed when every member is plain JS; otherwise a
    // Raw blob fallback (TS modifiers / decorators / declare / accessor).
    let body =
        match convert_class_body_for_program_as_node(arena, &class_decl.body, offset, line_offsets)
        {
            Some(node) => arena.alloc_js_node(node),
            None => {
                let body_value =
                    convert_class_body_for_program(arena, &class_decl.body, offset, line_offsets);
                arena.alloc_js_node(JsNode::from_value(body_value))
            }
        };

    // Decorators: include so remove_typescript_nodes can detect them.
    let decorators = if class_decl.decorators.is_empty() {
        IdRange::empty()
    } else {
        let decorator_nodes: Vec<JsNode> = class_decl
            .decorators
            .iter()
            .map(|dec| {
                let dec_start = offset + dec.span.start as usize;
                let dec_end = offset + dec.span.end as usize;
                JsNode::Decorator {
                    start: dec_start as u32,
                    end: dec_end as u32,
                    loc: None,
                }
            })
            .collect();
        arena.alloc_js_children(decorator_nodes)
    };

    JsNode::ClassDeclaration {
        start: start as u32,
        end: end as u32,
        loc,
        id,
        super_class,
        body,
        declare: class_decl.declare,
        r#abstract: class_decl.r#abstract,
        implements: !class_decl.implements.is_empty(),
        decorators,
    }
}

/// Typed sibling of `convert_declaration_for_program`: returns a typed `JsNode`
/// for the plain-JS `VariableDeclaration` / `FunctionDeclaration` /
/// `ClassDeclaration` cases (so an `export <decl>` declaration routes through the
/// typed analyze walker instead of `JsNode::Raw`). Cases whose byte-identical
/// serialization needs the Value form — TS `declare`/overload functions, rest
/// parameters (the typed function path drops `params.rest`), abstract / declare
/// / implements / decorated classes, and all TS-only declarations — fall back to
/// `JsNode::from_value(convert_declaration_for_program(...))`.
fn convert_declaration_for_program_as_node(
    arena: &ParseArena,
    decl: &oxc_ast::ast::Declaration,
    offset: usize,
    line_offsets: &[usize],
) -> JsNode {
    use oxc_ast::ast::Declaration;
    match decl {
        Declaration::VariableDeclaration(var_decl) => {
            convert_variable_declaration_as_node(arena, var_decl, offset, line_offsets)
        }
        // The typed function path emits only `params.items`, so a rest parameter
        // would be dropped relative to the Value form — keep Raw in that case.
        Declaration::FunctionDeclaration(func_decl)
            if func_decl.r#type != oxc_ast::ast::FunctionType::TSDeclareFunction
                && func_decl.body.is_some()
                && func_decl.params.rest.is_none() =>
        {
            convert_function_declaration_as_node(arena, func_decl, offset, line_offsets)
                .unwrap_or_else(|| {
                    JsNode::from_value(convert_declaration_for_program(
                        arena,
                        decl,
                        offset,
                        line_offsets,
                    ))
                })
        }
        // The typed class node adds `abstract` / `declare` / `implements` /
        // `decorators` fields that the Value form omits, so only the plain-JS
        // shape is byte-identical.
        Declaration::ClassDeclaration(class_decl)
            if !class_decl.declare
                && !class_decl.r#abstract
                && class_decl.implements.is_empty()
                && class_decl.decorators.is_empty() =>
        {
            convert_class_declaration_as_node(arena, class_decl, offset, line_offsets)
        }
        _ => JsNode::from_value(convert_declaration_for_program(
            arena,
            decl,
            offset,
            line_offsets,
        )),
    }
}

fn convert_declaration_for_program(
    arena: &ParseArena,
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
                .filter_map(|d| {
                    convert_variable_declarator_for_program(arena, d, offset, line_offsets)
                })
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
            let mut params: Vec<Value> = func_decl
                .params
                .items
                .iter()
                .map(|param| {
                    convert_formal_parameter(arena, param, offset, line_offsets)
                        .as_json()
                        .clone()
                })
                .collect();
            if let Some(rest) = &func_decl.params.rest {
                let rest_start = offset + rest.span.start as usize;
                let rest_end = offset + rest.span.end as usize;
                let argument = convert_binding_pattern_for_param(
                    arena,
                    &rest.rest.argument,
                    offset,
                    line_offsets,
                );
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
                rest_obj.insert("argument".to_string(), argument);
                params.push(Value::Object(rest_obj));
            }
            obj.insert("params".to_string(), Value::Array(params));

            // Convert body
            if let Some(body) = &func_decl.body {
                let body_value =
                    convert_function_body_for_program(arena, body, offset, line_offsets);
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
                    convert_expression_for_program(arena, super_class, offset, line_offsets);
                obj.insert(
                    "superClass".to_string(),
                    super_class_value.as_json().clone(),
                );
            } else {
                obj.insert("superClass".to_string(), Value::Null);
            }

            // body (ClassBody)
            let body_value =
                convert_class_body_for_program(arena, &class_decl.body, offset, line_offsets);
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
            // `declare module`, `declare global`, `declare namespace` etc. are
            // type-only and must be stripped from output. Emit an EmptyStatement
            // so remove_typescript_nodes can filter it out.
            if module_decl.declare {
                let mut empty_obj = Map::new();
                empty_obj.insert(
                    "type".to_string(),
                    Value::String("EmptyStatement".to_string()),
                );
                return Value::Object(empty_obj);
            }
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
                                convert_statement_for_program(arena, stmt, offset, line_offsets)
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
    arena: &ParseArena,
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
                imported: arena.alloc_js_node(imported),
                local: arena.alloc_js_node(local),
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
                local: arena.alloc_js_node(local),
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
                local: arena.alloc_js_node(local),
            }
        }
    }
}

/// Convert a VariableDeclaration to JsNode directly (for ForStatement/ForOfStatement/ForInStatement).
fn convert_variable_declaration_as_node(
    arena: &ParseArena,
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
        .filter_map(|d| convert_variable_declarator_for_program(arena, d, offset, line_offsets))
        .collect();

    let kind = match vd.kind {
        oxc_ast::ast::VariableDeclarationKind::Var => "var",
        oxc_ast::ast::VariableDeclarationKind::Let => "let",
        oxc_ast::ast::VariableDeclarationKind::Const => "const",
        oxc_ast::ast::VariableDeclarationKind::Using => "using",
        oxc_ast::ast::VariableDeclarationKind::AwaitUsing => "await using",
    };

    JsNode::VariableDeclaration {
        start: var_start as u32,
        end: var_end as u32,
        loc,
        declarations: arena.alloc_js_children(declarations),
        kind: CompactString::from(kind),
        declare: vd.declare,
    }
}

/// Convert a variable declarator to JsNode (for program context, no -1 offset adjustment).
fn convert_variable_declarator_for_program(
    arena: &ParseArena,
    decl: &oxc_ast::ast::VariableDeclarator,
    offset: usize,
    line_offsets: &[usize],
) -> Option<JsNode> {
    let start = offset + decl.span.start as usize;
    let end = offset + decl.span.end as usize;
    let loc = create_typed_loc(start, end, line_offsets);

    // Convert the id (pattern). When a TS type annotation is present, a plain
    // annotated identifier (`let x: T = …`) routes through the typed walker
    // carrying the annotation as an opaque boundary blob; an annotated
    // destructuring pattern (`let { a }: T = …`) keeps the Value (Raw) form
    // since the annotation hangs off a pattern node.
    let id_pattern = convert_binding_pattern(arena, &decl.id, offset, line_offsets);
    let id_node = if let Some(type_annotation) = &decl.type_annotation {
        let ts_start = type_annotation.span.start as usize + offset;
        let ts_end = type_annotation.span.end as usize + offset;

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
        let type_value = convert_ts_type(
            arena,
            &type_annotation.type_annotation,
            offset,
            line_offsets,
        );
        ts_obj.insert("typeAnnotation".to_string(), type_value);
        let ts_value = Value::Object(ts_obj);

        match id_pattern {
            JsNode::Identifier {
                start: id_start,
                name,
                ..
            } => arena.alloc_js_node(JsNode::Identifier {
                start: id_start,
                end: ts_end as u32,
                loc: create_typed_loc(id_start as usize, ts_end, line_offsets),
                name,
                optional: false,
                type_annotation: Some(Box::new(ts_value)),
            }),
            // Annotated destructuring declarator id (`let { a }: T` / `let [ a ]: T`):
            // keep the pattern typed and carry the TS annotation as an opaque
            // boundary blob (mirrors the Identifier branch above). The outer
            // `end`/`loc` extend to cover the annotation; the pattern's own
            // children keep their original spans — byte-identical to the former
            // `JsNode::Raw(to_value + typeAnnotation/end/loc override)` shape.
            JsNode::ObjectPattern {
                start: p_start,
                properties,
                ..
            } => arena.alloc_js_node(JsNode::ObjectPattern {
                start: p_start,
                end: ts_end as u32,
                loc: create_typed_loc(p_start as usize, ts_end, line_offsets),
                properties,
                type_annotation: Some(Box::new(ts_value)),
            }),
            JsNode::ArrayPattern {
                start: p_start,
                elements,
                ..
            } => arena.alloc_js_node(JsNode::ArrayPattern {
                start: p_start,
                end: ts_end as u32,
                loc: create_typed_loc(p_start as usize, ts_end, line_offsets),
                elements,
                type_annotation: Some(Box::new(ts_value)),
            }),
            other => {
                let mut id_value = other.to_value();
                if let Value::Object(ref mut id_obj) = id_value {
                    id_obj.insert("typeAnnotation".to_string(), ts_value);
                    id_obj.insert("end".to_string(), Value::Number((ts_end as i64).into()));
                    if let Some(loc) = create_loc(
                        id_obj.get("start").and_then(|v| v.as_i64()).unwrap_or(0) as usize,
                        ts_end,
                        line_offsets,
                    ) {
                        id_obj.insert("loc".to_string(), loc);
                    }
                }
                arena.alloc_js_node(JsNode::from_value(id_value))
            }
        }
    } else {
        arena.alloc_js_node(id_pattern)
    };

    // Convert init if present
    let init_node = decl.init.as_ref().map(|init| {
        let init_expr = convert_expression_for_program(arena, init, offset, line_offsets);
        arena.alloc_js_node(expr_to_node(init_expr))
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
fn convert_expression_for_program<'a>(
    arena: &ParseArena,
    expr: &OxcExpression,
    offset: usize,
    line_offsets: &[usize],
) -> Expression<'a> {
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
            let callee = convert_expression_for_program(arena, &call.callee, offset, line_offsets);

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
                            argument: arena.alloc_js_node(expr_to_node(
                                convert_expression_for_program(
                                    arena,
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
                            arena,
                            expr,
                            offset,
                            line_offsets,
                        ))
                    }
                })
                .collect();

            Expression::from_node(JsNode::CallExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                callee: arena.alloc_js_node(expr_to_node(callee)),
                arguments: arena.alloc_js_children(args),
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
                            argument: arena.alloc_js_node(expr_to_node(
                                convert_expression_for_program(
                                    arena,
                                    &spread.argument,
                                    offset,
                                    line_offsets,
                                ),
                            )),
                        })
                    }
                    oxc_ast::ast::ArrayExpressionElement::Elision(_elision) => None,
                    _ => {
                        let expr = elem.to_expression();
                        Some(expr_to_node(convert_expression_for_program(
                            arena,
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
                        let key = convert_property_key(arena, &p.key, offset, line_offsets);
                        let value =
                            convert_expression_for_program(arena, &p.value, offset, line_offsets);
                        let mut value_node = expr_to_node(value);
                        mark_object_method_generics(&mut value_node, p.method);
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
                            key: arena.alloc_js_node(key),
                            value: arena.alloc_js_node(value_node),
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
                            argument: arena.alloc_js_node(expr_to_node(
                                convert_expression_for_program(
                                    arena,
                                    &spread.argument,
                                    offset,
                                    line_offsets,
                                ),
                            )),
                        }
                    }
                })
                .collect();

            Expression::from_node(JsNode::ObjectExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                properties: arena.alloc_js_children(properties),
            })
        }
        OxcExpression::ArrowFunctionExpression(arrow) => {
            let start = offset + arrow.span.start as usize;
            let end = offset + arrow.span.end as usize;

            let mut params: Vec<JsNode> = arrow
                .params
                .items
                .iter()
                .map(|param| {
                    expr_to_node(convert_formal_parameter(arena, param, offset, line_offsets))
                })
                .collect();
            if let Some(rest) = &arrow.params.rest {
                let rest_start = offset + rest.span.start as usize;
                let rest_end = offset + rest.span.end as usize;
                let argument =
                    convert_binding_pattern(arena, &rest.rest.argument, offset, line_offsets);
                params.push(JsNode::RestElement {
                    start: rest_start as u32,
                    end: rest_end as u32,
                    loc: create_typed_loc(rest_start, rest_end, line_offsets),
                    argument: arena.alloc_js_node(argument),
                });
            }

            // For expression-body arrows (`(x) => x + 1`), emit the inner expression
            // directly as the body (without a BlockStatement wrapper). Otherwise emit
            // the full BlockStatement body.
            let body_node = if arrow.expression
                && let Some(oxc_ast::ast::Statement::ExpressionStatement(es)) =
                    arrow.body.statements.first()
            {
                expr_to_node(convert_expression_for_program(
                    arena,
                    &es.expression,
                    offset,
                    line_offsets,
                ))
            } else {
                convert_function_body_for_program_as_node(arena, &arrow.body, offset, line_offsets)
            };

            Expression::from_node(JsNode::ArrowFunctionExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                id: None,
                expression: arrow.expression,
                generator: false,
                r#async: arrow.r#async,
                params: arena.alloc_js_children(params),
                body: arena.alloc_js_node(body_node),
                type_parameters: arrow.type_parameters.as_ref().map(|tp| {
                    Box::new(convert_ts_type_parameter_declaration(
                        arena,
                        tp,
                        offset,
                        line_offsets,
                    ))
                }),
            })
        }
        OxcExpression::FunctionExpression(func) => {
            let type_parameters =
                program_function_expression_type_parameters(arena, func, offset, line_offsets);
            Expression::from_node(convert_function_expression_for_program_as_node(
                arena,
                func,
                offset,
                line_offsets,
                type_parameters,
                false,
            ))
        }
        OxcExpression::StaticMemberExpression(member) => {
            let start = offset + member.span.start as usize;
            let end = offset + member.span.end as usize;
            let object =
                convert_expression_for_program(arena, &member.object, offset, line_offsets);
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
                object: arena.alloc_js_node(expr_to_node(object)),
                property: arena.alloc_js_node(expr_to_node(property)),
                computed: false,
                optional: member.optional,
            })
        }
        OxcExpression::ComputedMemberExpression(member) => {
            let start = offset + member.span.start as usize;
            let end = offset + member.span.end as usize;
            let object =
                convert_expression_for_program(arena, &member.object, offset, line_offsets);
            let property =
                convert_expression_for_program(arena, &member.expression, offset, line_offsets);

            Expression::from_node(JsNode::MemberExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                object: arena.alloc_js_node(expr_to_node(object)),
                property: arena.alloc_js_node(expr_to_node(property)),
                computed: true,
                optional: member.optional,
            })
        }
        OxcExpression::PrivateFieldExpression(member) => {
            // `this.#field` — without this arm the object falls through to the
            // `unknown` identifier fallback, which defeats `is_safe_identifier`
            // in 2-analyze (so `needs_context` is never set). Mirror
            // `create_private_member_expression` with the program-offset
            // convention (`offset + span.start`, no `-1`).
            let start = offset + member.span.start as usize;
            let end = offset + member.span.end as usize;
            let object =
                convert_expression_for_program(arena, &member.object, offset, line_offsets);
            let prop_start = offset + member.field.span.start as usize;
            let prop_end = offset + member.field.span.end as usize;
            Expression::from_node(JsNode::MemberExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                object: arena.alloc_js_node(expr_to_node(object)),
                property: arena.alloc_js_node(JsNode::PrivateIdentifier {
                    start: prop_start as u32,
                    end: prop_end as u32,
                    loc: create_typed_loc(prop_start, prop_end, line_offsets),
                    name: CompactString::from(member.field.name.as_str()),
                }),
                computed: false,
                optional: member.optional,
            })
        }
        OxcExpression::ImportExpression(import_expr) => {
            let start = offset + import_expr.span.start as usize;
            let end = offset + import_expr.span.end as usize;
            let source =
                convert_expression_for_program(arena, &import_expr.source, offset, line_offsets);

            Expression::from_node(JsNode::ImportExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                source: arena.alloc_js_node(expr_to_node(source)),
            })
        }
        OxcExpression::AssignmentExpression(assign) => {
            let start = offset + assign.span.start as usize;
            let end = offset + assign.span.end as usize;

            let left =
                convert_assignment_target_for_program(arena, &assign.left, offset, line_offsets);
            let right = convert_expression_for_program(arena, &assign.right, offset, line_offsets);
            let operator = assignment_operator_to_str(&assign.operator);

            Expression::from_node(JsNode::AssignmentExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                operator: CompactString::from(operator),
                left: arena.alloc_js_node(left),
                right: arena.alloc_js_node(expr_to_node(right)),
            })
        }
        OxcExpression::UnaryExpression(unary) => {
            let start = offset + unary.span.start as usize;
            let end = offset + unary.span.end as usize;
            let argument =
                convert_expression_for_program(arena, &unary.argument, offset, line_offsets);
            Expression::from_node(JsNode::UnaryExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                operator: CompactString::from(unary.operator.as_str()),
                prefix: true,
                argument: arena.alloc_js_node(expr_to_node(argument)),
            })
        }
        OxcExpression::NewExpression(new_expr) => {
            let start = offset + new_expr.span.start as usize;
            let end = offset + new_expr.span.end as usize;
            let callee =
                convert_expression_for_program(arena, &new_expr.callee, offset, line_offsets);
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
                            argument: arena.alloc_js_node(expr_to_node(
                                convert_expression_for_program(
                                    arena,
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
                            arena,
                            expr,
                            offset,
                            line_offsets,
                        ))
                    }
                })
                .collect();

            Expression::from_node(JsNode::NewExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                callee: arena.alloc_js_node(expr_to_node(callee)),
                arguments: arena.alloc_js_children(args),
            })
        }
        OxcExpression::ClassExpression(class_expr) => {
            let start = offset + class_expr.span.start as usize;
            let end = offset + class_expr.span.end as usize;

            let id = class_expr.id.as_ref().map(|id| {
                let id_start = offset + id.span.start as usize;
                let id_end = offset + id.span.end as usize;
                arena.alloc_js_node(expr_to_node(create_identifier(
                    &id.name,
                    id_start,
                    id_end,
                    line_offsets,
                )))
            });

            let super_class = class_expr.super_class.as_ref().map(|sc| {
                arena.alloc_js_node(expr_to_node(convert_expression_for_program(
                    arena,
                    sc,
                    offset,
                    line_offsets,
                )))
            });

            let body = match convert_class_body_for_program_as_node(
                arena,
                &class_expr.body,
                offset,
                line_offsets,
            ) {
                Some(node) => arena.alloc_js_node(node),
                None => arena.alloc_js_node(JsNode::from_value(convert_class_body_for_program(
                    arena,
                    &class_expr.body,
                    offset,
                    line_offsets,
                ))),
            };

            Expression::from_node(JsNode::ClassExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                id,
                super_class,
                body,
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
                    expr_to_node(convert_expression_for_program(
                        arena,
                        expr,
                        offset,
                        line_offsets,
                    ))
                })
                .collect();

            Expression::from_node(JsNode::TemplateLiteral {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                quasis: arena.alloc_js_children(quasis),
                expressions: arena.alloc_js_children(expressions),
            })
        }
        OxcExpression::BinaryExpression(bin) => {
            let start = offset + bin.span.start as usize;
            let end = offset + bin.span.end as usize;
            let left = convert_expression_for_program(arena, &bin.left, offset, line_offsets);
            let right = convert_expression_for_program(arena, &bin.right, offset, line_offsets);

            Expression::from_node(JsNode::BinaryExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                left: arena.alloc_js_node(expr_to_node(left)),
                operator: CompactString::from(binary_operator_to_str(&bin.operator)),
                right: arena.alloc_js_node(expr_to_node(right)),
            })
        }
        OxcExpression::LogicalExpression(logical) => {
            let start = offset + logical.span.start as usize;
            let end = offset + logical.span.end as usize;
            let left = convert_expression_for_program(arena, &logical.left, offset, line_offsets);
            let right = convert_expression_for_program(arena, &logical.right, offset, line_offsets);

            Expression::from_node(JsNode::LogicalExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                left: arena.alloc_js_node(expr_to_node(left)),
                operator: CompactString::from(logical_operator_to_str(&logical.operator)),
                right: arena.alloc_js_node(expr_to_node(right)),
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
                arena,
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
                argument: arena.alloc_js_node(argument),
            })
        }
        OxcExpression::AwaitExpression(await_expr) => {
            let start = offset + await_expr.span.start as usize;
            let end = offset + await_expr.span.end as usize;
            let argument =
                convert_expression_for_program(arena, &await_expr.argument, offset, line_offsets);
            Expression::from_node(JsNode::AwaitExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                argument: arena.alloc_js_node(expr_to_node(argument)),
            })
        }
        OxcExpression::ConditionalExpression(cond) => {
            let start = offset + cond.span.start as usize;
            let end = offset + cond.span.end as usize;
            let test = convert_expression_for_program(arena, &cond.test, offset, line_offsets);
            let consequent =
                convert_expression_for_program(arena, &cond.consequent, offset, line_offsets);
            let alternate =
                convert_expression_for_program(arena, &cond.alternate, offset, line_offsets);

            Expression::from_node(JsNode::ConditionalExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                test: arena.alloc_js_node(expr_to_node(test)),
                consequent: arena.alloc_js_node(expr_to_node(consequent)),
                alternate: arena.alloc_js_node(expr_to_node(alternate)),
            })
        }
        OxcExpression::SequenceExpression(seq) => {
            let start = offset + seq.span.start as usize;
            let end = offset + seq.span.end as usize;

            let expressions: Vec<JsNode> = seq
                .expressions
                .iter()
                .map(|expr| {
                    expr_to_node(convert_expression_for_program(
                        arena,
                        expr,
                        offset,
                        line_offsets,
                    ))
                })
                .collect();

            Expression::from_node(JsNode::SequenceExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                expressions: arena.alloc_js_children(expressions),
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
                    arena.alloc_js_node(expr_to_node(convert_expression_for_program(
                        arena,
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
                    let callee =
                        convert_expression_for_program(arena, &call.callee, offset, line_offsets);
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
                                    argument: arena.alloc_js_node(expr_to_node(
                                        convert_expression_for_program(
                                            arena,
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
                                    arena,
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
                        callee: arena.alloc_js_node(expr_to_node(callee)),
                        arguments: arena.alloc_js_children(args),
                        optional: call.optional,
                    }
                }
                oxc_ast::ast::ChainElement::TSNonNullExpression(ts_non_null) => {
                    let inner_start = offset + ts_non_null.span.start as usize;
                    let inner_end = offset + ts_non_null.span.end as usize;
                    let inner = convert_expression_for_program(
                        arena,
                        &ts_non_null.expression,
                        offset,
                        line_offsets,
                    );
                    JsNode::TSNonNullExpression {
                        start: inner_start as u32,
                        end: inner_end as u32,
                        loc: create_typed_loc(inner_start, inner_end, line_offsets),
                        expression: arena.alloc_js_node(expr_to_node(inner)),
                    }
                }
                oxc_ast::ast::ChainElement::StaticMemberExpression(member) => {
                    let inner_start = offset + member.span.start as usize;
                    let inner_end = offset + member.span.end as usize;
                    let object =
                        convert_expression_for_program(arena, &member.object, offset, line_offsets);
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
                        object: arena.alloc_js_node(expr_to_node(object)),
                        property: arena.alloc_js_node(expr_to_node(property)),
                        computed: false,
                        optional: member.optional,
                    }
                }
                oxc_ast::ast::ChainElement::ComputedMemberExpression(member) => {
                    let inner_start = offset + member.span.start as usize;
                    let inner_end = offset + member.span.end as usize;
                    let object =
                        convert_expression_for_program(arena, &member.object, offset, line_offsets);
                    let property = convert_expression_for_program(
                        arena,
                        &member.expression,
                        offset,
                        line_offsets,
                    );
                    JsNode::MemberExpression {
                        start: inner_start as u32,
                        end: inner_end as u32,
                        loc: create_typed_loc(inner_start, inner_end, line_offsets),
                        object: arena.alloc_js_node(expr_to_node(object)),
                        property: arena.alloc_js_node(expr_to_node(property)),
                        computed: true,
                        optional: member.optional,
                    }
                }
                oxc_ast::ast::ChainElement::PrivateFieldExpression(private_member) => {
                    let inner_start = offset + private_member.span.start as usize;
                    let inner_end = offset + private_member.span.end as usize;
                    let object = convert_expression_for_program(
                        arena,
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
                        object: arena.alloc_js_node(expr_to_node(object)),
                        property: arena.alloc_js_node(expr_to_node(property)),
                        computed: false,
                        optional: private_member.optional,
                    }
                }
            };
            Expression::from_node(JsNode::ChainExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                expression: arena.alloc_js_node(chain_inner),
            })
        }
        OxcExpression::TaggedTemplateExpression(tagged) => {
            let start = offset + tagged.span.start as usize;
            let end = offset + tagged.span.end as usize;
            let tag = convert_expression_for_program(arena, &tagged.tag, offset, line_offsets);

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
                    expr_to_node(convert_expression_for_program(
                        arena,
                        expr,
                        offset,
                        line_offsets,
                    ))
                })
                .collect();

            let quasi = JsNode::TemplateLiteral {
                start: quasi_start as u32,
                end: quasi_end as u32,
                loc: create_typed_loc(quasi_start, quasi_end, line_offsets),
                quasis: arena.alloc_js_children(quasis),
                expressions: arena.alloc_js_children(quasi_expressions),
            };

            Expression::from_node(JsNode::TaggedTemplateExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                tag: arena.alloc_js_node(expr_to_node(tag)),
                quasi: arena.alloc_js_node(quasi),
            })
        }
        OxcExpression::RegExpLiteral(regex) => {
            let start = offset + regex.span.start as usize;
            let end = offset + regex.span.end as usize;
            create_regex_literal(regex, start, end, line_offsets)
        }
        // Parenthesized expressions - unwrap and return the inner expression
        OxcExpression::ParenthesizedExpression(paren) => {
            convert_expression_for_program(arena, &paren.expression, offset, line_offsets)
        }
        // TypeScript assertion wrappers - preserve the wrapper node so the public
        // `parse()` AST mirrors svelte/compiler; the TS stripper erases them at
        // compile time. Program-path spans use the raw `offset` (no paren shift).
        OxcExpression::TSAsExpression(ts_as) => {
            let start = offset + ts_as.span.start as usize;
            let end = offset + ts_as.span.end as usize;
            let inner =
                convert_expression_for_program(arena, &ts_as.expression, offset, line_offsets);
            let type_annotation =
                convert_ts_type(arena, &ts_as.type_annotation, offset, line_offsets);
            Expression::from_node(JsNode::TSAsExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                expression: arena.alloc_js_node(expr_to_node(inner)),
                type_annotation: Box::new(type_annotation),
            })
        }
        OxcExpression::TSSatisfiesExpression(ts_satisfies) => {
            let start = offset + ts_satisfies.span.start as usize;
            let end = offset + ts_satisfies.span.end as usize;
            let inner = convert_expression_for_program(
                arena,
                &ts_satisfies.expression,
                offset,
                line_offsets,
            );
            let type_annotation =
                convert_ts_type(arena, &ts_satisfies.type_annotation, offset, line_offsets);
            Expression::from_node(JsNode::TSSatisfiesExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                expression: arena.alloc_js_node(expr_to_node(inner)),
                type_annotation: Box::new(type_annotation),
            })
        }
        OxcExpression::TSNonNullExpression(ts_non_null) => {
            let start = offset + ts_non_null.span.start as usize;
            let end = offset + ts_non_null.span.end as usize;
            let inner = convert_expression_for_program(
                arena,
                &ts_non_null.expression,
                offset,
                line_offsets,
            );
            Expression::from_node(JsNode::TSNonNullExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                expression: arena.alloc_js_node(expr_to_node(inner)),
            })
        }
        OxcExpression::TSTypeAssertion(ts_assertion) => {
            let start = offset + ts_assertion.span.start as usize;
            let end = offset + ts_assertion.span.end as usize;
            let inner = convert_expression_for_program(
                arena,
                &ts_assertion.expression,
                offset,
                line_offsets,
            );
            let type_annotation =
                convert_ts_type(arena, &ts_assertion.type_annotation, offset, line_offsets);
            Expression::from_node(JsNode::TSTypeAssertion {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                expression: arena.alloc_js_node(expr_to_node(inner)),
                type_annotation: Box::new(type_annotation),
            })
        }
        OxcExpression::TSInstantiationExpression(ts_inst) => {
            let start = offset + ts_inst.span.start as usize;
            let end = offset + ts_inst.span.end as usize;
            let inner =
                convert_expression_for_program(arena, &ts_inst.expression, offset, line_offsets);
            let type_arguments = convert_ts_type_param_instantiation(
                arena,
                &ts_inst.type_arguments,
                offset,
                line_offsets,
            );
            Expression::from_node(JsNode::TSInstantiationExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                expression: arena.alloc_js_node(expr_to_node(inner)),
                type_arguments: Box::new(type_arguments),
            })
        }
        OxcExpression::MetaProperty(meta) => {
            // `import.meta` / `new.target`. Without this arm the fallback
            // below turns the node into a placeholder `Identifier("unknown")`,
            // which Phase 2's `is_safe_identifier` then misclassifies as a
            // safe global — `import.meta.glob(...)` must set `needs_context`
            // (upstream: a non-Identifier base is never "safe").
            let start = offset + meta.span.start as usize;
            let end = offset + meta.span.end as usize;
            let meta_start = offset + meta.meta.span.start as usize;
            let meta_end = offset + meta.meta.span.end as usize;
            let prop_start = offset + meta.property.span.start as usize;
            let prop_end = offset + meta.property.span.end as usize;
            Expression::from_node(JsNode::MetaProperty {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                meta: arena.alloc_js_node(expr_to_node(create_identifier(
                    &meta.meta.name,
                    meta_start,
                    meta_end,
                    line_offsets,
                ))),
                property: arena.alloc_js_node(expr_to_node(create_identifier(
                    &meta.property.name,
                    prop_start,
                    prop_end,
                    line_offsets,
                ))),
            })
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
    arena: &ParseArena,
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
        .filter_map(|element| {
            convert_class_element_for_program(arena, element, offset, line_offsets)
        })
        .collect();
    obj.insert("body".to_string(), Value::Array(body_elements));

    Value::Object(obj)
}

/// Outcome of attempting to build a typed program-path class member.
enum TypedClassElem {
    /// A fully typed member node.
    Node(JsNode),
    /// Element intentionally dropped (mirrors the Value path's `None`).
    Skip,
    /// Member carries data the typed variants can't represent byte-identically
    /// (TS modifiers / decorators / `declare` / accessor); the whole class body
    /// must fall back to a `JsNode::Raw(Value)` blob.
    Bail,
}

/// Typed twin of [`convert_class_body_for_program`]. Returns `Some(ClassBody)`
/// when every member can be represented byte-identically by the typed
/// `MethodDefinition` / `PropertyDefinition` variants; returns `None` when any
/// member carries TS modifiers / decorators / `declare` / accessor (the caller
/// then falls back to the `Raw(Value)` blob via `convert_class_body_for_program`).
///
/// Serializes byte-identically to the Value blob (modulo the method value's
/// `expression: false` field, which the official ESTree output also emits and
/// the `convert_function_expression_for_program` Value blob was missing — same
/// improvement landed in D2 for top-level `FunctionExpression`s).
fn convert_class_body_for_program_as_node(
    arena: &ParseArena,
    body: &oxc_ast::ast::ClassBody,
    offset: usize,
    line_offsets: &[usize],
) -> Option<JsNode> {
    let start = offset + body.span.start as usize;
    let end = offset + body.span.end as usize;

    let mut members: Vec<JsNode> = Vec::with_capacity(body.body.len());
    for element in &body.body {
        match convert_class_element_for_program_as_node(arena, element, offset, line_offsets) {
            TypedClassElem::Node(node) => members.push(node),
            TypedClassElem::Skip => {}
            TypedClassElem::Bail => return None,
        }
    }

    Some(JsNode::ClassBody {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        body: arena.alloc_js_children(members),
    })
}

/// Typed twin of [`convert_class_element_for_program`]. Bails (to a `Raw` class
/// body) on any member that carries TS modifiers / decorators / `declare` /
/// accessor, so the typed path is only taken for plain-JS class members whose
/// shape matches the Value blob exactly.
fn convert_class_element_for_program_as_node(
    arena: &ParseArena,
    element: &oxc_ast::ast::ClassElement,
    offset: usize,
    line_offsets: &[usize],
) -> TypedClassElem {
    match element {
        oxc_ast::ast::ClassElement::MethodDefinition(method) => {
            // Abstract methods are dropped by the Value path (`return None`).
            if method.r#type == oxc_ast::ast::MethodDefinitionType::TSAbstractMethodDefinition {
                return TypedClassElem::Skip;
            }
            // TS modifiers / decorators have no typed representation here.
            if !method.decorators.is_empty()
                || method.r#override
                || method.optional
                || method.accessibility.is_some()
            {
                return TypedClassElem::Bail;
            }
            let start = offset + method.span.start as usize;
            let end = offset + method.span.end as usize;
            let kind = match method.kind {
                oxc_ast::ast::MethodDefinitionKind::Constructor => "constructor",
                oxc_ast::ast::MethodDefinitionKind::Method => "method",
                oxc_ast::ast::MethodDefinitionKind::Get => "get",
                oxc_ast::ast::MethodDefinitionKind::Set => "set",
            };
            let key = convert_property_key(arena, &method.key, offset, line_offsets);
            // A method's generics live on the MethodDefinition, not the inner
            // function (acorn-typescript), so the inner function gets `None`.
            let value = convert_function_expression_for_program_as_node(
                arena,
                &method.value,
                offset,
                line_offsets,
                None,
                false,
            );
            TypedClassElem::Node(JsNode::MethodDefinition {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                key: arena.alloc_js_node(key),
                value: arena.alloc_js_node(value),
                kind: CompactString::from(kind),
                r#static: method.r#static,
                computed: method.computed,
            })
        }
        oxc_ast::ast::ClassElement::PropertyDefinition(prop) => {
            if prop.r#type == oxc_ast::ast::PropertyDefinitionType::TSAbstractPropertyDefinition {
                return TypedClassElem::Skip;
            }
            // The Value path emits a conditional `declare` field and never the
            // other TS modifiers / decorators — bail so those still route through
            // the Raw blob unchanged.
            if !prop.decorators.is_empty()
                || prop.declare
                || prop.r#override
                || prop.optional
                || prop.definite
                || prop.readonly
                || prop.accessibility.is_some()
                || prop.type_annotation.is_some()
            {
                return TypedClassElem::Bail;
            }
            let start = offset + prop.span.start as usize;
            let end = offset + prop.span.end as usize;
            let key = convert_property_key(arena, &prop.key, offset, line_offsets);
            let value = prop.value.as_ref().map(|value| {
                arena.alloc_js_node(expr_to_node(convert_expression_for_program(
                    arena,
                    value,
                    offset,
                    line_offsets,
                )))
            });
            TypedClassElem::Node(JsNode::PropertyDefinition {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                key: arena.alloc_js_node(key),
                value,
                r#static: prop.r#static,
                computed: prop.computed,
                // AccessorProperty bails above, so a typed PropertyDefinition is
                // never an `accessor` field.
                accessor: false,
            })
        }
        // AccessorProperty: the Value path emits a `PropertyDefinition` with an
        // `accessor: true` field that the typed variant can't carry.
        oxc_ast::ast::ClassElement::AccessorProperty(_) => TypedClassElem::Bail,
        // StaticBlock and TS-only members are dropped by the Value path (`_ => None`).
        _ => TypedClassElem::Skip,
    }
}

/// Convert a class element to JSON value (for program context).
fn convert_class_element_for_program(
    arena: &ParseArena,
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
            let key = convert_property_key(arena, &method.key, offset, line_offsets);
            obj.insert("key".to_string(), key.to_value());

            // value (function expression)
            let value =
                convert_function_expression_for_program(arena, &method.value, offset, line_offsets);
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
            let key = convert_property_key(arena, &prop.key, offset, line_offsets);
            obj.insert("key".to_string(), key.to_value());

            // value
            if let Some(ref value) = prop.value {
                let val = convert_expression_for_program(arena, value, offset, line_offsets);
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

            let key = convert_property_key(arena, &prop.key, offset, line_offsets);
            obj.insert("key".to_string(), key.to_value());

            if let Some(ref value) = prop.value {
                let val = convert_expression_for_program(arena, value, offset, line_offsets);
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
    arena: &ParseArena,
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
    let mut params: Vec<Value> = func
        .params
        .items
        .iter()
        .map(|param| {
            convert_formal_parameter(arena, param, offset, line_offsets)
                .as_json()
                .clone()
        })
        .collect();
    if let Some(rest) = &func.params.rest {
        let rest_start = offset + rest.span.start as usize;
        let rest_end = offset + rest.span.end as usize;
        let argument =
            convert_binding_pattern_for_param(arena, &rest.rest.argument, offset, line_offsets);
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
        rest_obj.insert("argument".to_string(), argument);
        params.push(Value::Object(rest_obj));
    }
    obj.insert("params".to_string(), Value::Array(params));

    // body
    if let Some(ref body) = func.body {
        let body_value = convert_function_body_for_program(arena, body, offset, line_offsets);
        obj.insert("body".to_string(), body_value);
    } else {
        obj.insert("body".to_string(), Value::Null);
    }

    Value::Object(obj)
}

/// Typed twin of `convert_function_expression_for_program`: builds a typed
/// `JsNode::FunctionExpression` (program-offset convention) instead of a
/// `JsNode::Raw(Value)` blob, so the function body subtree routes through the
/// typed analyze walker. Serializes byte-identically to the Value blob (modulo
/// the `expression: false` field, which the official ESTree output also emits
/// and the Value blob was missing). `id` is always `null` to match the Value
/// blob, and params keep the TS-aware `convert_formal_parameter` shape (TS bits
/// fall through to `JsNode::Raw` via `expr_to_node`).
fn convert_function_expression_for_program_as_node(
    arena: &ParseArena,
    func: &oxc_ast::ast::Function,
    offset: usize,
    line_offsets: &[usize],
    // `None` for method values (their generics live on the wrapper node).
    type_parameters: Option<Box<serde_json::Value>>,
    // Object-method values keep their generics on the inner function but emit
    // them after `body` (acorn-typescript), unlike declarations/expressions.
    type_parameters_after_body: bool,
) -> JsNode {
    let start = offset + func.span.start as usize;
    let end = offset + func.span.end as usize;

    // params
    let mut params: Vec<JsNode> = func
        .params
        .items
        .iter()
        .map(|param| expr_to_node(convert_formal_parameter(arena, param, offset, line_offsets)))
        .collect();
    if let Some(rest) = &func.params.rest {
        let rest_start = offset + rest.span.start as usize;
        let rest_end = offset + rest.span.end as usize;
        let argument = convert_binding_pattern_for_param_as_node(
            arena,
            &rest.rest.argument,
            offset,
            line_offsets,
        );
        params.push(JsNode::RestElement {
            start: rest_start as u32,
            end: rest_end as u32,
            loc: create_typed_loc(rest_start, rest_end, line_offsets),
            argument: arena.alloc_js_node(argument),
        });
    }

    // body
    let body = func.body.as_ref().map(|body| {
        arena.alloc_js_node(convert_function_body_for_program_as_node(
            arena,
            body,
            offset,
            line_offsets,
        ))
    });

    JsNode::FunctionExpression {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        id: None,
        params: arena.alloc_js_children(params),
        body,
        generator: func.generator,
        r#async: func.r#async,
        expression: false,
        type_parameters,
        type_parameters_after_body,
    }
}

/// Convert an oxc `Function`'s generic type parameters into the opaque
/// `TSTypeParameterDeclaration` blob, using the program-context (`offset`) span
/// base. `None` when the function is non-generic.
fn program_function_expression_type_parameters(
    arena: &ParseArena,
    func: &oxc_ast::ast::Function,
    offset: usize,
    line_offsets: &[usize],
) -> Option<Box<serde_json::Value>> {
    func.type_parameters.as_ref().map(|tp| {
        Box::new(convert_ts_type_parameter_declaration(
            arena,
            tp,
            offset,
            line_offsets,
        ))
    })
}

/// Convert a function body (statement or expression) to JSON value.
fn convert_function_body_for_program(
    arena: &ParseArena,
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
        .filter_map(|stmt| convert_statement_for_program(arena, stmt, offset, line_offsets))
        .map(|n| n.to_value())
        .collect();
    obj.insert("body".to_string(), Value::Array(statements));

    Value::Object(obj)
}

/// Convert a function body to JsNode (for FunctionDeclaration in JsNode path).
fn convert_function_body_for_program_as_node(
    arena: &ParseArena,
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
        .filter_map(|stmt| convert_statement_for_program(arena, stmt, offset, line_offsets))
        .collect();

    JsNode::BlockStatement {
        start: start as u32,
        end: end as u32,
        loc,
        body: arena.alloc_js_children(statements),
    }
}

/// Convert a binding pattern to JSON value.
fn convert_binding_pattern(
    arena: &ParseArena,
    pattern: &oxc_ast::ast::BindingPattern,
    offset: usize,
    line_offsets: &[usize],
) -> JsNode {
    match pattern {
        oxc_ast::ast::BindingPattern::BindingIdentifier(id) => {
            let start = offset + id.span.start as usize;
            let end = offset + id.span.end as usize;
            expr_to_node(create_identifier(&id.name, start, end, line_offsets))
        }
        oxc_ast::ast::BindingPattern::ObjectPattern(obj_pat) => {
            convert_object_pattern(arena, obj_pat, offset, line_offsets)
        }
        oxc_ast::ast::BindingPattern::ArrayPattern(arr_pat) => {
            convert_array_pattern(arena, arr_pat, offset, line_offsets)
        }
        oxc_ast::ast::BindingPattern::AssignmentPattern(assign_pat) => {
            convert_assignment_pattern(arena, assign_pat, offset, line_offsets)
        }
    }
}

/// Convert an ObjectPattern binding to JsNode.
fn convert_object_pattern(
    arena: &ParseArena,
    obj_pat: &oxc_ast::ast::ObjectPattern,
    offset: usize,
    line_offsets: &[usize],
) -> JsNode {
    let start = offset + obj_pat.span.start as usize;
    let end = offset + obj_pat.span.end as usize;

    let mut properties: Vec<JsNode> = obj_pat
        .properties
        .iter()
        .map(|prop| convert_binding_property(arena, prop, offset, line_offsets))
        .collect();

    // Handle rest element if present (e.g., `...others` in `{ foo, ...others }`)
    if let Some(rest) = &obj_pat.rest {
        let rest_start = offset + rest.span.start as usize;
        let rest_end = offset + rest.span.end as usize;
        properties.push(JsNode::RestElement {
            start: rest_start as u32,
            end: rest_end as u32,
            loc: create_typed_loc(rest_start, rest_end, line_offsets),
            argument: arena.alloc_js_node(convert_binding_pattern(
                arena,
                &rest.argument,
                offset,
                line_offsets,
            )),
        });
    }

    JsNode::ObjectPattern {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        properties: arena.alloc_js_children(properties),
        type_annotation: None,
    }
}

/// Convert an ArrayPattern binding to JsNode.
fn convert_array_pattern(
    arena: &ParseArena,
    arr_pat: &oxc_ast::ast::ArrayPattern,
    offset: usize,
    line_offsets: &[usize],
) -> JsNode {
    let start = offset + arr_pat.span.start as usize;
    let end = offset + arr_pat.span.end as usize;

    let mut elements: Vec<Option<JsNode>> = arr_pat
        .elements
        .iter()
        .map(|elem| {
            elem.as_ref()
                .map(|pat| convert_binding_pattern(arena, pat, offset, line_offsets))
        })
        .collect();

    // Add rest element if present
    if let Some(rest) = &arr_pat.rest {
        let rest_start = offset + rest.span.start as usize;
        let rest_end = offset + rest.span.end as usize;
        elements.push(Some(JsNode::RestElement {
            start: rest_start as u32,
            end: rest_end as u32,
            loc: create_typed_loc(rest_start, rest_end, line_offsets),
            argument: arena.alloc_js_node(convert_binding_pattern(
                arena,
                &rest.argument,
                offset,
                line_offsets,
            )),
        }));
    }

    JsNode::ArrayPattern {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        elements,
        type_annotation: None,
    }
}

/// Convert an AssignmentPattern binding to JsNode.
fn convert_assignment_pattern(
    arena: &ParseArena,
    assign_pat: &oxc_ast::ast::AssignmentPattern,
    offset: usize,
    line_offsets: &[usize],
) -> JsNode {
    let start = offset + assign_pat.span.start as usize;
    let end = offset + assign_pat.span.end as usize;

    JsNode::AssignmentPattern {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        left: arena.alloc_js_node(convert_binding_pattern(
            arena,
            &assign_pat.left,
            offset,
            line_offsets,
        )),
        // Program context: `offset` is already program-adjusted (the pattern's
        // own `start`/`end` and `left` use it raw), so the default value must
        // also use `convert_expression_for_program`. `convert_expression` would
        // re-apply the synthetic-paren `-1`, shifting the default expression one
        // unit left — e.g. the `$bindable` callee in `let { open = $bindable() }`
        // spanned ` $bindabl` (#916).
        right: arena.alloc_js_node(expr_to_node(convert_expression_for_program(
            arena,
            &assign_pat.right,
            offset,
            line_offsets,
        ))),
    }
}

/// Convert an assignment target for program context (no -1 offset adjustment).
fn convert_assignment_target_for_program(
    arena: &ParseArena,
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

            let object =
                convert_expression_for_program(arena, &member.object, offset, line_offsets);
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
                object: arena.alloc_js_node(expr_to_node(object)),
                property: arena.alloc_js_node(expr_to_node(property)),
                computed: false,
                optional: member.optional,
            }
        }
        AssignmentTarget::ComputedMemberExpression(member) => {
            let start = offset + member.span.start as usize;
            let end = offset + member.span.end as usize;

            let object =
                convert_expression_for_program(arena, &member.object, offset, line_offsets);
            let property =
                convert_expression_for_program(arena, &member.expression, offset, line_offsets);

            JsNode::MemberExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                object: arena.alloc_js_node(expr_to_node(object)),
                property: arena.alloc_js_node(expr_to_node(property)),
                computed: true,
                optional: member.optional,
            }
        }
        AssignmentTarget::ObjectAssignmentTarget(obj_target) => {
            convert_object_assignment_target_for_program(arena, obj_target, offset, line_offsets)
        }
        AssignmentTarget::ArrayAssignmentTarget(arr_target) => {
            convert_array_assignment_target_for_program(arena, arr_target, offset, line_offsets)
        }
        AssignmentTarget::PrivateFieldExpression(member) => {
            // `this.#field = …` LHS in a function-body statement (program
            // context). Without this arm it falls to `JsNode::Null`, so the
            // `this.#field` MemberExpression is never visited in 2-analyze and
            // `needs_context` stays unset (no `$.push`/`$.pop`) — e.g. a class
            // constructor reassigning a private field.
            let start = offset + member.span.start as usize;
            let end = offset + member.span.end as usize;
            let object =
                convert_expression_for_program(arena, &member.object, offset, line_offsets);
            let prop_start = offset + member.field.span.start as usize;
            let prop_end = offset + member.field.span.end as usize;
            JsNode::MemberExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                object: arena.alloc_js_node(expr_to_node(object)),
                property: arena.alloc_js_node(JsNode::PrivateIdentifier {
                    start: prop_start as u32,
                    end: prop_end as u32,
                    loc: create_typed_loc(prop_start, prop_end, line_offsets),
                    name: CompactString::from(member.field.name.as_str()),
                }),
                computed: false,
                optional: member.optional,
            }
        }
        _ => {
            // For other complex patterns (e.g., TSAsExpression, TSNonNullExpression)
            JsNode::Null
        }
    }
}

/// Convert an ObjectAssignmentTarget to a typed `ObjectPattern` `JsNode`
/// (no -1 offset adjustment).
fn convert_object_assignment_target_for_program(
    arena: &ParseArena,
    obj_target: &oxc_ast::ast::ObjectAssignmentTarget,
    offset: usize,
    line_offsets: &[usize],
) -> JsNode {
    let start = offset + obj_target.span.start as usize;
    let end = offset + obj_target.span.end as usize;

    let mut properties: Vec<JsNode> = obj_target
        .properties
        .iter()
        .map(|prop| {
            convert_assignment_target_property_for_program(arena, prop, offset, line_offsets)
        })
        .collect();

    // Add rest element if present
    if let Some(rest) = &obj_target.rest {
        let rest_start = offset + rest.span.start as usize;
        let rest_end = offset + rest.span.end as usize;
        properties.push(JsNode::RestElement {
            start: rest_start as u32,
            end: rest_end as u32,
            loc: create_typed_loc(rest_start, rest_end, line_offsets),
            argument: arena.alloc_js_node(convert_assignment_target_for_program(
                arena,
                &rest.target,
                offset,
                line_offsets,
            )),
        });
    }

    JsNode::ObjectPattern {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        properties: arena.alloc_js_children(properties),
        type_annotation: None,
    }
}

/// Convert an ArrayAssignmentTarget to a typed `ArrayPattern` `JsNode`
/// (no -1 offset adjustment).
fn convert_array_assignment_target_for_program(
    arena: &ParseArena,
    arr_target: &oxc_ast::ast::ArrayAssignmentTarget,
    offset: usize,
    line_offsets: &[usize],
) -> JsNode {
    let start = offset + arr_target.span.start as usize;
    let end = offset + arr_target.span.end as usize;

    let mut elements: Vec<Option<JsNode>> = arr_target
        .elements
        .iter()
        .map(|elem| {
            elem.as_ref().map(|target| {
                convert_assignment_target_maybe_default_for_program(
                    arena,
                    target,
                    offset,
                    line_offsets,
                )
            })
        })
        .collect();

    // Add rest element if present
    if let Some(rest) = &arr_target.rest {
        let rest_start = offset + rest.span.start as usize;
        let rest_end = offset + rest.span.end as usize;
        elements.push(Some(JsNode::RestElement {
            start: rest_start as u32,
            end: rest_end as u32,
            loc: create_typed_loc(rest_start, rest_end, line_offsets),
            argument: arena.alloc_js_node(convert_assignment_target_for_program(
                arena,
                &rest.target,
                offset,
                line_offsets,
            )),
        }));
    }

    JsNode::ArrayPattern {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        elements,
        type_annotation: None,
    }
}

/// Convert an AssignmentTargetProperty to a typed `Property` `JsNode`
/// (no -1 offset adjustment).
fn convert_assignment_target_property_for_program(
    arena: &ParseArena,
    prop: &oxc_ast::ast::AssignmentTargetProperty,
    offset: usize,
    line_offsets: &[usize],
) -> JsNode {
    use oxc_ast::ast::AssignmentTargetProperty;

    match prop {
        AssignmentTargetProperty::AssignmentTargetPropertyIdentifier(id_prop) => {
            let start = offset + id_prop.span.start as usize;
            let end = offset + id_prop.span.end as usize;

            let id_start = offset + id_prop.binding.span.start as usize;
            let id_end = offset + id_prop.binding.span.end as usize;
            let make_identifier = || {
                expr_to_node(create_identifier(
                    &id_prop.binding.name,
                    id_start,
                    id_end,
                    line_offsets,
                ))
            };

            let key = arena.alloc_js_node(make_identifier());

            let value = if let Some(init) = &id_prop.init {
                let init_end = offset + init.span().end as usize;
                arena.alloc_js_node(JsNode::AssignmentPattern {
                    start: id_start as u32,
                    end: init_end as u32,
                    loc: create_typed_loc(id_start, init_end, line_offsets),
                    left: arena.alloc_js_node(make_identifier()),
                    right: arena.alloc_js_node(expr_to_node(convert_expression_for_program(
                        arena,
                        init,
                        offset,
                        line_offsets,
                    ))),
                })
            } else {
                arena.alloc_js_node(make_identifier())
            };

            JsNode::Property {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                key,
                value,
                kind: CompactString::from("init"),
                method: false,
                shorthand: true,
                computed: false,
            }
        }
        AssignmentTargetProperty::AssignmentTargetPropertyProperty(prop_prop) => {
            let start = offset + prop_prop.span.start as usize;
            let end = offset + prop_prop.span.end as usize;

            let key = convert_property_key(arena, &prop_prop.name, offset, line_offsets);
            let value = convert_assignment_target_maybe_default_for_program(
                arena,
                &prop_prop.binding,
                offset,
                line_offsets,
            );

            JsNode::Property {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                key: arena.alloc_js_node(key),
                value: arena.alloc_js_node(value),
                kind: CompactString::from("init"),
                method: false,
                shorthand: false,
                computed: prop_prop.computed,
            }
        }
    }
}

/// Convert a SimpleAssignmentTarget to JsNode (no -1 offset adjustment).
fn convert_simple_assignment_target_for_program(
    arena: &ParseArena,
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

            let object =
                convert_expression_for_program(arena, &member.object, offset, line_offsets);
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
                object: arena.alloc_js_node(expr_to_node(object)),
                property: arena.alloc_js_node(expr_to_node(property)),
                computed: false,
                optional: member.optional,
            }
        }
        SimpleAssignmentTarget::ComputedMemberExpression(member) => {
            let start = offset + member.span.start as usize;
            let end = offset + member.span.end as usize;

            let object =
                convert_expression_for_program(arena, &member.object, offset, line_offsets);
            let property =
                convert_expression_for_program(arena, &member.expression, offset, line_offsets);

            JsNode::MemberExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                object: arena.alloc_js_node(expr_to_node(object)),
                property: arena.alloc_js_node(expr_to_node(property)),
                computed: true,
                optional: member.optional,
            }
        }
        SimpleAssignmentTarget::PrivateFieldExpression(member) => {
            // `this.#field = …` LHS — without this arm it becomes `JsNode::Null`,
            // which breaks constructor state-field dedup and `is_safe_identifier`.
            let start = offset + member.span.start as usize;
            let end = offset + member.span.end as usize;
            let object =
                convert_expression_for_program(arena, &member.object, offset, line_offsets);
            let prop_start = offset + member.field.span.start as usize;
            let prop_end = offset + member.field.span.end as usize;
            JsNode::MemberExpression {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                object: arena.alloc_js_node(expr_to_node(object)),
                property: arena.alloc_js_node(JsNode::PrivateIdentifier {
                    start: prop_start as u32,
                    end: prop_end as u32,
                    loc: create_typed_loc(prop_start, prop_end, line_offsets),
                    name: CompactString::from(member.field.name.as_str()),
                }),
                computed: false,
                optional: member.optional,
            }
        }
        _ => JsNode::Null,
    }
}

/// Convert an AssignmentTargetMaybeDefault to a typed `JsNode` (no -1 offset
/// adjustment). A `WithDefault` becomes an `AssignmentPattern`; a bare target
/// delegates to `convert_assignment_target_for_program`.
fn convert_assignment_target_maybe_default_for_program(
    arena: &ParseArena,
    target: &oxc_ast::ast::AssignmentTargetMaybeDefault,
    offset: usize,
    line_offsets: &[usize],
) -> JsNode {
    use oxc_ast::ast::AssignmentTargetMaybeDefault;

    match target {
        AssignmentTargetMaybeDefault::AssignmentTargetWithDefault(with_default) => {
            let start = offset + with_default.span.start as usize;
            let end = offset + with_default.span.end as usize;

            JsNode::AssignmentPattern {
                start: start as u32,
                end: end as u32,
                loc: create_typed_loc(start, end, line_offsets),
                left: arena.alloc_js_node(convert_assignment_target_for_program(
                    arena,
                    &with_default.binding,
                    offset,
                    line_offsets,
                )),
                right: arena.alloc_js_node(expr_to_node(convert_expression_for_program(
                    arena,
                    &with_default.init,
                    offset,
                    line_offsets,
                ))),
            }
        }
        _ => {
            if let Some(inner) = target.as_assignment_target() {
                convert_assignment_target_for_program(arena, inner, offset, line_offsets)
            } else {
                JsNode::Null
            }
        }
    }
}

/// Convert a binding property to JSON.
fn convert_binding_property(
    arena: &ParseArena,
    prop: &oxc_ast::ast::BindingProperty,
    offset: usize,
    line_offsets: &[usize],
) -> JsNode {
    let start = offset + prop.span.start as usize;
    let end = offset + prop.span.end as usize;

    let key = convert_property_key(arena, &prop.key, offset, line_offsets);
    let value = convert_binding_pattern(arena, &prop.value, offset, line_offsets);

    JsNode::Property {
        start: start as u32,
        end: end as u32,
        loc: create_typed_loc(start, end, line_offsets),
        key: arena.alloc_js_node(key),
        value: arena.alloc_js_node(value),
        kind: CompactString::from("init"),
        method: false,
        shorthand: prop.shorthand,
        computed: prop.computed,
    }
}

/// Convert a property key to JSON.
fn convert_property_key(
    arena: &ParseArena,
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
                expr_to_node(convert_expression(arena, expr, offset, line_offsets))
            } else {
                JsNode::Null
            }
        }
    }
}

/// Parse a binding pattern (for {#each} context).
/// This parses patterns like `item`, `{ name }`, `[a, b]`, etc.
pub fn parse_binding_pattern<'a>(
    arena: &ParseArena,
    content: &str,
    offset: usize,
    line_offsets: &[usize],
) -> Result<Expression<'a>, crate::error::ParseError> {
    // Check for reserved words in simple identifier contexts
    // (e.g., {#each cases as case} where "case" is a reserved word)
    let trimmed = content.trim();
    if !trimmed.is_empty()
        && !trimmed.starts_with('{')
        && !trimmed.starts_with('[')
        && super::super::utils::is_reserved(trimmed)
    {
        return Err(crate::error::ParseError::svelte(
            "unexpected_reserved_word",
            format!(
                "'{}' is a reserved word in JavaScript and cannot be used here",
                trimmed
            ),
            (offset, offset),
        ));
    }

    with_oxc_allocator(|allocator| {
        let source_type = SourceType::mjs();

        let wrapped = format!("let {} = null", content);
        let parser = OxcParser::new(allocator, &wrapped, source_type);
        let result = parser.parse();

        if !result.diagnostics.is_empty() {
            let trimmed = content.trim();
            if trimmed.starts_with('{') || trimmed.starts_with('[') {
                let err = &result.diagnostics[0];
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

            return Ok(Expression::from_json(
                convert_binding_pattern_with_adjustment(arena, &decl.id, offset, 4, line_offsets),
            ));
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
    arena: &ParseArena,
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
            convert_object_pattern_with_adjustment(
                arena,
                obj_pat,
                doc_offset,
                prefix_len,
                line_offsets,
            )
        }
        oxc_ast::ast::BindingPattern::ArrayPattern(arr_pat) => {
            convert_array_pattern_with_adjustment(
                arena,
                arr_pat,
                doc_offset,
                prefix_len,
                line_offsets,
            )
        }
        oxc_ast::ast::BindingPattern::AssignmentPattern(assign_pat) => {
            convert_assignment_pattern_with_adjustment(
                arena,
                assign_pat,
                doc_offset,
                prefix_len,
                line_offsets,
            )
        }
    }
}

fn convert_object_pattern_with_adjustment(
    arena: &ParseArena,
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
            convert_binding_property_with_adjustment(
                arena,
                prop,
                doc_offset,
                prefix_len,
                line_offsets,
            )
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
                arena,
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
    arena: &ParseArena,
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
            Some(pat) => convert_binding_pattern_with_adjustment(
                arena,
                pat,
                doc_offset,
                prefix_len,
                line_offsets,
            ),
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
                arena,
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
    arena: &ParseArena,
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
            arena,
            &assign_pat.left,
            doc_offset,
            prefix_len,
            line_offsets,
        ),
    );

    // For the right side (expression), we need to adjust positions too
    // Using the expression converter with adjusted offset
    let right = convert_expression_with_adjustment(
        arena,
        &assign_pat.right,
        doc_offset,
        prefix_len,
        line_offsets,
    );
    obj.insert("right".to_string(), right);

    Value::Object(obj)
}

fn convert_binding_property_with_adjustment(
    arena: &ParseArena,
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
    let key = convert_property_key_with_adjustment(
        arena,
        &prop.key,
        doc_offset,
        prefix_len,
        line_offsets,
    );
    obj.insert("key".to_string(), key);

    // Convert value
    let value = convert_binding_pattern_with_adjustment(
        arena,
        &prop.value,
        doc_offset,
        prefix_len,
        line_offsets,
    );
    obj.insert("value".to_string(), value);

    Value::Object(obj)
}

fn convert_property_key_with_adjustment(
    arena: &ParseArena,
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
                convert_expression_with_adjustment(
                    arena,
                    expr,
                    doc_offset,
                    prefix_len,
                    line_offsets,
                )
            } else {
                Value::Null
            }
        }
    }
}

/// Convert expression with position adjustment for wrapped patterns.
fn convert_expression_with_adjustment(
    arena: &ParseArena,
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
                arena,
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
                arena,
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
                arena,
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
                arena,
                &paren.expression,
                doc_offset,
                prefix_len,
                line_offsets,
            )
        }
        // TypeScript assertion wrappers - preserve the wrapper (Value shape) so
        // binding-pattern defaults (`let { x = y as const } = …`) mirror
        // svelte/compiler; the TS stripper erases them at compile time. The
        // type-annotation base is `doc_offset - prefix_len` (same as the span math
        // below), so `base + type_span = doc_offset + type_span - prefix_len`.
        OxcExpression::TSAsExpression(ts_as) => {
            let start = doc_offset + ts_as.span.start as usize - prefix_len;
            let end = doc_offset + ts_as.span.end as usize - prefix_len;
            let inner = convert_expression_with_adjustment(
                arena,
                &ts_as.expression,
                doc_offset,
                prefix_len,
                line_offsets,
            );
            let type_annotation = convert_ts_type(
                arena,
                &ts_as.type_annotation,
                doc_offset - prefix_len,
                line_offsets,
            );
            ts_assertion_value(
                "TSAsExpression",
                start,
                end,
                inner,
                Some(type_annotation),
                line_offsets,
            )
        }
        OxcExpression::TSSatisfiesExpression(ts_satisfies) => {
            let start = doc_offset + ts_satisfies.span.start as usize - prefix_len;
            let end = doc_offset + ts_satisfies.span.end as usize - prefix_len;
            let inner = convert_expression_with_adjustment(
                arena,
                &ts_satisfies.expression,
                doc_offset,
                prefix_len,
                line_offsets,
            );
            let type_annotation = convert_ts_type(
                arena,
                &ts_satisfies.type_annotation,
                doc_offset - prefix_len,
                line_offsets,
            );
            ts_assertion_value(
                "TSSatisfiesExpression",
                start,
                end,
                inner,
                Some(type_annotation),
                line_offsets,
            )
        }
        OxcExpression::TSNonNullExpression(ts_non_null) => {
            let start = doc_offset + ts_non_null.span.start as usize - prefix_len;
            let end = doc_offset + ts_non_null.span.end as usize - prefix_len;
            let inner = convert_expression_with_adjustment(
                arena,
                &ts_non_null.expression,
                doc_offset,
                prefix_len,
                line_offsets,
            );
            ts_assertion_value("TSNonNullExpression", start, end, inner, None, line_offsets)
        }
        OxcExpression::TSTypeAssertion(ts_assertion) => convert_expression_with_adjustment(
            arena,
            &ts_assertion.expression,
            doc_offset,
            prefix_len,
            line_offsets,
        ),
        OxcExpression::TSInstantiationExpression(ts_inst) => convert_expression_with_adjustment(
            arena,
            &ts_inst.expression,
            doc_offset,
            prefix_len,
            line_offsets,
        ),
        OxcExpression::BinaryExpression(bin) => {
            let start = doc_offset + bin.span.start as usize - prefix_len;
            let end = doc_offset + bin.span.end as usize - prefix_len;
            let left = convert_expression_with_adjustment(
                arena,
                &bin.left,
                doc_offset,
                prefix_len,
                line_offsets,
            );
            let right = convert_expression_with_adjustment(
                arena,
                &bin.right,
                doc_offset,
                prefix_len,
                line_offsets,
            );
            let operator = binary_operator_to_str(&bin.operator);
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
            obj.insert("operator".to_string(), Value::String(operator.to_string()));
            obj.insert("right".to_string(), right);
            Value::Object(obj)
        }
        OxcExpression::UnaryExpression(unary) => {
            let start = doc_offset + unary.span.start as usize - prefix_len;
            let end = doc_offset + unary.span.end as usize - prefix_len;
            let argument = convert_expression_with_adjustment(
                arena,
                &unary.argument,
                doc_offset,
                prefix_len,
                line_offsets,
            );
            let operator = unary_operator_to_str(&unary.operator);
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
            obj.insert("operator".to_string(), Value::String(operator.to_string()));
            obj.insert("prefix".to_string(), Value::Bool(true));
            obj.insert("argument".to_string(), argument);
            Value::Object(obj)
        }
        OxcExpression::LogicalExpression(log) => {
            let start = doc_offset + log.span.start as usize - prefix_len;
            let end = doc_offset + log.span.end as usize - prefix_len;
            let left = convert_expression_with_adjustment(
                arena,
                &log.left,
                doc_offset,
                prefix_len,
                line_offsets,
            );
            let right = convert_expression_with_adjustment(
                arena,
                &log.right,
                doc_offset,
                prefix_len,
                line_offsets,
            );
            let operator = logical_operator_to_str(&log.operator);
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
            obj.insert("operator".to_string(), Value::String(operator.to_string()));
            obj.insert("right".to_string(), right);
            Value::Object(obj)
        }
        OxcExpression::ConditionalExpression(cond) => {
            let start = doc_offset + cond.span.start as usize - prefix_len;
            let end = doc_offset + cond.span.end as usize - prefix_len;
            let test = convert_expression_with_adjustment(
                arena,
                &cond.test,
                doc_offset,
                prefix_len,
                line_offsets,
            );
            let consequent = convert_expression_with_adjustment(
                arena,
                &cond.consequent,
                doc_offset,
                prefix_len,
                line_offsets,
            );
            let alternate = convert_expression_with_adjustment(
                arena,
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
                arena,
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
                arena,
                &member.object,
                doc_offset,
                prefix_len,
                line_offsets,
            );
            let property = convert_expression_with_adjustment(
                arena,
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
        OxcExpression::PrivateFieldExpression(member) => {
            // `this.#field` — without this arm the object falls through to the
            // `unknown` identifier fallback, defeating `is_safe_identifier` in
            // 2-analyze. Build a MemberExpression with a PrivateIdentifier
            // property (binding-offset convention: `doc_offset + span - prefix_len`).
            let start = doc_offset + member.span.start as usize - prefix_len;
            let end = doc_offset + member.span.end as usize - prefix_len;
            let object = convert_expression_with_adjustment(
                arena,
                &member.object,
                doc_offset,
                prefix_len,
                line_offsets,
            );
            let prop_start = doc_offset + member.field.span.start as usize - prefix_len;
            let prop_end = doc_offset + member.field.span.end as usize - prefix_len;
            let mut prop = Map::new();
            prop.insert(
                "type".to_string(),
                Value::String("PrivateIdentifier".to_string()),
            );
            prop.insert(
                "start".to_string(),
                Value::Number((prop_start as i64).into()),
            );
            prop.insert("end".to_string(), Value::Number((prop_end as i64).into()));
            if let Some(loc) = create_loc_for_binding(prop_start, prop_end, line_offsets) {
                prop.insert("loc".to_string(), loc);
            }
            prop.insert(
                "name".to_string(),
                Value::String(member.field.name.as_str().to_string()),
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
            obj.insert("property".to_string(), Value::Object(prop));
            obj.insert("computed".to_string(), Value::Bool(false));
            obj.insert("optional".to_string(), Value::Bool(member.optional));
            Value::Object(obj)
        }
        OxcExpression::ObjectExpression(_obj_expr) => {
            // Use the full convert_expression for complex objects
            let adjusted_offset = doc_offset.wrapping_sub(prefix_len).wrapping_add(1);
            convert_expression(arena, expr, adjusted_offset, line_offsets)
                .as_json()
                .clone()
        }
        OxcExpression::ArrayExpression(_arr_expr) => {
            // Use the full convert_expression for arrays
            let adjusted_offset = doc_offset.wrapping_sub(prefix_len).wrapping_add(1);
            convert_expression(arena, expr, adjusted_offset, line_offsets)
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
            let operator = update_operator_to_str(&update.operator);
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
            obj.insert("operator".to_string(), Value::String(operator.to_string()));
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
            convert_expression(arena, expr, adjusted_offset, line_offsets)
                .as_json()
                .clone()
        }
        _ => {
            // Fallback for other expressions - delegate to the full convert_expression
            // with proper offset adjustment
            let adjusted_offset = doc_offset.wrapping_sub(prefix_len).wrapping_add(1);
            convert_expression(arena, expr, adjusted_offset, line_offsets)
                .as_json()
                .clone()
        }
    }
}

fn create_template_literal_with_adjustment(
    arena: &ParseArena,
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
        .map(|expr| {
            convert_expression_with_adjustment(arena, expr, doc_offset, prefix_len, line_offsets)
        })
        .collect();
    obj.insert("expressions".to_string(), Value::Array(expressions));

    Value::Object(obj)
}

fn create_call_expression_with_adjustment(
    arena: &ParseArena,
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

    let callee = convert_expression_with_adjustment(
        arena,
        &call.callee,
        doc_offset,
        prefix_len,
        line_offsets,
    );
    obj.insert("callee".to_string(), callee);

    let args: Vec<Value> = call
        .arguments
        .iter()
        .map(|arg| match arg {
            oxc_ast::ast::Argument::SpreadElement(spread) => {
                let spread_start = doc_offset + spread.span.start as usize - prefix_len;
                let spread_end = doc_offset + spread.span.end as usize - prefix_len;
                let inner = convert_expression_with_adjustment(
                    arena,
                    &spread.argument,
                    doc_offset,
                    prefix_len,
                    line_offsets,
                );
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
                if let Some(loc) = create_loc_for_binding(spread_start, spread_end, line_offsets) {
                    spread_obj.insert("loc".to_string(), loc);
                }
                spread_obj.insert("argument".to_string(), inner);
                Value::Object(spread_obj)
            }
            _ => {
                let expr = arg.to_expression();
                convert_expression_with_adjustment(
                    arena,
                    expr,
                    doc_offset,
                    prefix_len,
                    line_offsets,
                )
            }
        })
        .collect();
    obj.insert("arguments".to_string(), Value::Array(args));
    obj.insert("optional".to_string(), Value::Bool(call.optional));

    Value::Object(obj)
}

fn create_arrow_function_with_adjustment(
    arena: &ParseArena,
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

    // Convert params: iterate items and handle rest separately.
    // `with_adjustment` callers operate on the doc_offset/prefix_len coordinate
    // system; use convert_binding_pattern_for_param with (doc_offset - prefix_len)
    // so that span positions map back to document coordinates.
    let mut params: Vec<Value> = Vec::with_capacity(arrow.params.items.len() + 1);
    let adjusted_offset = doc_offset.saturating_sub(prefix_len);
    for param in &arrow.params.items {
        params.push(convert_binding_pattern_for_param(
            arena,
            &param.pattern,
            adjusted_offset,
            line_offsets,
        ));
    }
    if let Some(rest) = &arrow.params.rest {
        let rest_start = doc_offset + rest.span.start as usize - prefix_len;
        let rest_end = doc_offset + rest.span.end as usize - prefix_len;
        let argument = convert_binding_pattern_for_param(
            arena,
            &rest.rest.argument,
            adjusted_offset,
            line_offsets,
        );
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
        rest_obj.insert("argument".to_string(), argument);
        params.push(Value::Object(rest_obj));
    }
    obj.insert("params".to_string(), Value::Array(params));

    // Convert body - arrow.expression indicates if body is expression or block statement
    let body = convert_function_body_with_adjustment(
        arena,
        &arrow.body,
        doc_offset,
        prefix_len,
        line_offsets,
    );
    obj.insert("body".to_string(), body);

    Value::Object(obj)
}

fn convert_function_body_with_adjustment(
    arena: &ParseArena,
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
            convert_statement_with_adjustment(arena, stmt, doc_offset, prefix_len, line_offsets)
        })
        .collect();
    obj.insert("body".to_string(), Value::Array(statements));

    Value::Object(obj)
}

fn convert_statement_with_adjustment(
    arena: &ParseArena,
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
                    convert_expression_with_adjustment(
                        arena,
                        arg,
                        doc_offset,
                        prefix_len,
                        line_offsets,
                    ),
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
                    arena,
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
        let arena = ParseArena::new();
        let content = "{ handler } = structured";
        let offset = 10; // arbitrary offset
        let line_offsets = vec![0, 50, 100]; // dummy line offsets

        let expr = parse_expression_with_typescript(&arena, content, offset, &line_offsets, false);

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
