//! JavaScript code generation from AST nodes.
//!
//! This module converts our AST representation to JavaScript source code,
//! then normalizes it using oxc.

use super::nodes::*;
use regex::Regex;
use rustc_hash::FxHashMap;
use std::fmt::Write;
use std::sync::LazyLock;

/// Generate JavaScript source code from a program AST.
pub fn generate(program: &JsProgram) -> Result<String, String> {
    let mut codegen = JsCodegen::new();
    codegen.emit_program(program);
    let raw = codegen.output;

    // Normalize through oxc parser/codegen
    normalize_js(&raw)
}

/// Generate JavaScript source code, returning both raw and normalized versions.
/// Used for debugging differences between JsCodegen and OXC normalization.
#[allow(dead_code)]
pub fn generate_debug(program: &JsProgram) -> (String, Result<String, String>) {
    let mut codegen = JsCodegen::new();
    codegen.emit_program(program);
    let raw = codegen.output.clone();
    let normalized = normalize_js(&codegen.output);
    (raw, normalized)
}

/// Generate JavaScript source code without OXC normalization.
/// This is faster but may produce less well-formatted output.
pub fn generate_fast(program: &JsProgram) -> String {
    let mut codegen = JsCodegen::new();
    codegen.emit_program(program);
    codegen.output
}

/// Generate JavaScript source code for a single expression.
pub fn generate_expr(expr: &super::nodes::JsExpr) -> String {
    let mut codegen = JsCodegen::new();
    codegen.emit_expression(expr);
    codegen.output
}

/// Generate raw JavaScript source code without normalization.
pub fn generate_raw(program: &JsProgram) -> String {
    let mut codegen = JsCodegen::new();
    codegen.emit_program(program);
    codegen.output
}

/// Normalize JavaScript code using oxc parser/codegen.
///
/// This is also aliased as `parse_and_generate` for backwards compatibility.
pub fn normalize_js(source: &str) -> Result<String, String> {
    normalize_js_inner(source, false)
}

fn normalize_js_inner(source: &str, profile: bool) -> Result<String, String> {
    use oxc_allocator::Allocator;
    use oxc_codegen::{Codegen, CodegenOptions};
    use oxc_parser::Parser;
    use oxc_span::SourceType;

    macro_rules! timed {
        ($name:expr, $expr:expr) => {{
            if profile {
                let _t = std::time::Instant::now();
                let _r = $expr;
                eprintln!("  {}: {:?}", $name, _t.elapsed());
                _r
            } else {
                $expr
            }
        }};
    }

    let (source_for_oxc, labeled_blocks) =
        timed!("extract_labeled_blocks", extract_labeled_blocks(source));
    let source = &source_for_oxc;
    // Fast path: skip collect_source_info if no double quotes or paren statements
    let has_double_quotes = memchr::memchr(b'"', source.as_bytes()).is_some();
    let has_paren_stmts = source.contains("\n(") || source.starts_with('(');
    let (original_imports, original_lines, paren_seq_stmts) =
        if has_double_quotes || has_paren_stmts {
            timed!("collect_source_info", collect_source_info(source))
        } else {
            (FxHashMap::default(), FxHashMap::default(), Vec::new())
        };

    let code = timed!("oxc_parse_codegen", {
        let allocator = Allocator::default();
        let source_type = SourceType::mjs();
        let parser = Parser::new(&allocator, source, source_type);
        let result = parser.parse();

        if !result.errors.is_empty() {
            if std::env::var("DEBUG_CODEGEN").is_ok() {
                eprintln!("=== RAW SOURCE (normalize_js error) ===");
                eprintln!("{}", source);
                eprintln!("=== END RAW SOURCE ===");
            }
            return Err(format!("Parse errors: {:?}", result.errors));
        }

        let options = CodegenOptions {
            single_quote: true,
            ..Default::default()
        };
        Codegen::new()
            .with_options(options)
            .build(&result.program)
            .code
    });
    let code = timed!("collapse_short_arrays", collapse_short_arrays(code));
    let code = timed!("collapse_short_objects", collapse_short_objects(code));
    let code = timed!("expand_getter_objects", expand_getter_objects(code));
    let code = timed!(
        "collapse_single_statement_ifs",
        collapse_single_statement_ifs(code)
    );
    let code = timed!(
        "add_blank_lines_for_formatting",
        add_blank_lines_for_formatting(code)
    );
    let code = timed!(
        "apply_simple_replacements_and_sci",
        apply_simple_replacements_leading_zeros_and_scientific(code)
    );
    let code = timed!("rejoin_double_semicolons", rejoin_double_semicolons(code));
    let code = timed!(
        "wrap_new_class_expressions",
        wrap_new_class_expressions(code)
    );
    let code = timed!(
        "restore_all_quotes",
        restore_all_quotes(code, &original_imports, &original_lines)
    );
    let code = timed!(
        "restore_legacy_pre_effect_thunk_parens",
        restore_legacy_pre_effect_thunk_parens(code)
    );
    let code = timed!("restore_iife_parens", restore_iife_parens(code));
    let code = timed!(
        "restore_paren_sequence_stmts",
        restore_paren_sequence_stmts(code, &paren_seq_stmts)
    );
    let code = timed!(
        "expand_labeled_block_statements",
        expand_labeled_block_statements(code)
    );
    let code = timed!(
        "restore_labeled_blocks",
        restore_labeled_blocks(code, &labeled_blocks)
    );
    // Trim trailing newlines in-place to avoid allocation
    let mut code = code;
    while code.ends_with('\n') {
        code.pop();
    }

    Ok(code)
}

/// Profile normalize_js, printing timing for each step to stderr.
#[allow(dead_code)]
pub fn normalize_js_profiled(source: &str) -> Result<String, String> {
    normalize_js_inner(source, true)
}

/// Apply simple string replacements, add leading zeros, AND expand scientific notation
/// in a single byte-level pass.
///
/// Combines three previously separate passes:
/// 1. Simple replacements: `<\/script>` → `</script>`, `} catch (` → `} catch(`,
///    `function(` → `function (`
/// 2. Leading zeros: `.5` → `0.5` (outside string literals)
/// 3. Scientific notation: `2e3` → `2000` (outside string literals)
fn apply_simple_replacements_leading_zeros_and_scientific(code: String) -> String {
    let bytes = code.as_bytes();
    let len = bytes.len();
    let mut result = Vec::with_capacity(len + 100);
    let mut i = 0;
    let mut in_string: Option<u8> = None;

    while i < len {
        let c = bytes[i];

        // Track string literal boundaries
        if let Some(q) = in_string {
            if c == b'\\' {
                result.push(c);
                i += 1;
                if i < len {
                    result.push(bytes[i]);
                    i += 1;
                }
                continue;
            }
            if c == q {
                in_string = None;
            }
            result.push(c);
            i += 1;
            continue;
        }

        if c == b'\'' || c == b'"' || c == b'`' {
            in_string = Some(c);
            result.push(c);
            i += 1;
            continue;
        }

        // Check for "<\/script>" (10 bytes) → "</script>"
        if c == b'<' && i + 10 <= len && &bytes[i..i + 10] == b"<\\/script>" {
            result.extend_from_slice(b"</script>");
            i += 10;
            continue;
        }

        // Check for "} catch (" (9 bytes) → "} catch("
        if c == b'}' && i + 9 <= len && &bytes[i..i + 9] == b"} catch (" {
            result.extend_from_slice(b"} catch(");
            i += 9;
            continue;
        }

        // Check for "function(" (9 bytes) → "function ("
        if c == b'f' && i + 9 <= len && &bytes[i..i + 9] == b"function(" {
            result.extend_from_slice(b"function (");
            i += 9;
            continue;
        }

        // Handle digits: leading zeros (.5 → 0.5) and scientific notation (2e3 → 2000)
        if c == b'.' && i + 1 < len && bytes[i + 1].is_ascii_digit() {
            let prev = if i > 0 { bytes[i - 1] } else { b' ' };
            if !prev.is_ascii_digit()
                && matches!(
                    prev,
                    b' ' | b'\t'
                        | b'\n'
                        | b'('
                        | b'['
                        | b'{'
                        | b','
                        | b':'
                        | b'='
                        | b'+'
                        | b'-'
                        | b'*'
                        | b'/'
                        | b'%'
                        | b'<'
                        | b'>'
                        | b'!'
                        | b'&'
                        | b'|'
                        | b'?'
                        | b';'
                )
            {
                result.push(b'0');
            }
            result.push(c);
            i += 1;
            continue;
        }

        // Scientific notation expansion: detect digit sequences with 'e'
        if c.is_ascii_digit() {
            // Check word boundary before
            if i > 0 {
                let prev = bytes[i - 1];
                if prev.is_ascii_alphanumeric() || prev == b'_' || prev == b'$' {
                    result.push(c);
                    i += 1;
                    continue;
                }
            }

            // Scan the full number
            let num_start = i;
            let mut j = i;
            while j < len && bytes[j].is_ascii_digit() {
                j += 1;
            }
            // Optional decimal part
            let mut has_dot = false;
            let mut dot_offset = 0;
            if j < len && bytes[j] == b'.' && j + 1 < len && bytes[j + 1].is_ascii_digit() {
                has_dot = true;
                dot_offset = j - num_start;
                j += 1;
                while j < len && bytes[j].is_ascii_digit() {
                    j += 1;
                }
            }
            // Check for 'e' + digits (positive exponent)
            if j < len && bytes[j] == b'e' && j + 1 < len && bytes[j + 1].is_ascii_digit() {
                let e_pos = j;
                j += 1;
                let exp_start = j;
                while j < len && bytes[j].is_ascii_digit() {
                    j += 1;
                }
                // Word boundary after
                if j >= len
                    || (!bytes[j].is_ascii_alphanumeric() && bytes[j] != b'_' && bytes[j] != b'$')
                {
                    let exp_str = std::str::from_utf8(&bytes[exp_start..j]).unwrap_or("0");
                    let exponent: usize = exp_str.parse().unwrap_or(0);

                    if has_dot {
                        let integer_part = &bytes[num_start..num_start + dot_offset];
                        let decimal_part = &bytes[num_start + dot_offset + 1..e_pos];
                        let decimal_len = decimal_part.len();
                        result.extend_from_slice(integer_part);
                        if exponent >= decimal_len {
                            result.extend_from_slice(decimal_part);
                            result.extend(std::iter::repeat_n(b'0', exponent - decimal_len));
                        } else {
                            result.extend_from_slice(&decimal_part[..exponent]);
                            result.push(b'.');
                            result.extend_from_slice(&decimal_part[exponent..]);
                        }
                    } else {
                        result.extend_from_slice(&bytes[num_start..e_pos]);
                        result.extend(std::iter::repeat_n(b'0', exponent));
                    }
                    i = j;
                    continue;
                }
            }
            // Not scientific notation - copy as-is
            result.extend_from_slice(&bytes[num_start..j]);
            i = j;
            continue;
        }

        result.push(c);
        i += 1;
    }

    // SAFETY: input was valid UTF-8 and all replacements/insertions are ASCII
    unsafe { String::from_utf8_unchecked(result) }
}

/// Expand `$: { ... }` labeled block statements that OXC collapsed to a single line.
///
/// OXC codegen collapses labeled block statement bodies to a single line and adds commas
/// between the statements (treating them like sequence expressions). For example:
///   `$: { // comment, foo = []; foo[0] = [false, false]; }`
///
/// This function expands them back to multi-line format:
///   `$: {\n\t// comment\n\tfoo = [];\n\tfoo[0] = [false, false];\n}`
///
/// This is critical for preserving `//` comments that would otherwise eat the rest of the line.
fn expand_labeled_block_statements(code: String) -> String {
    // Quick check: if no `$:` pattern exists, no labeled blocks to expand
    if !code.contains("$:") {
        return code;
    }
    let mut result = String::new();
    let lines: Vec<&str> = code.lines().collect();

    for line in &lines {
        let trimmed = line.trim();

        // Look for `$: { ... }` on a SINGLE line (OXC collapsed it)
        // The pattern is: optional indent + `$:` + whitespace + `{` + content + `}`
        // We need to make sure the `{` and `}` are balanced on this one line.
        if let Some(after_dollar) = trimmed
            .strip_prefix("$:")
            .map(|s| s.trim_start())
            .filter(|s| s.starts_with('{') && s.ends_with('}'))
        {
            // Check that the braces are balanced (the closing } matches the opening {)
            let mut depth = 0i32;
            let mut balanced_at_end = false;
            let chars: Vec<char> = after_dollar.chars().collect();
            let mut in_str: Option<char> = None;
            for (ci, &c) in chars.iter().enumerate() {
                if let Some(q) = in_str {
                    if c == '\\' {
                        continue; // next char is escaped
                    }
                    if c == q {
                        in_str = None;
                    }
                    continue;
                }
                if c == '\'' || c == '"' || c == '`' {
                    in_str = Some(c);
                    continue;
                }
                match c {
                    '{' => depth += 1,
                    '}' => {
                        depth -= 1;
                        if depth == 0 && ci == chars.len() - 1 {
                            balanced_at_end = true;
                        }
                    }
                    _ => {}
                }
            }

            if balanced_at_end {
                // Extract the block body (between the first `{` and last `}`)
                let body = &after_dollar[1..after_dollar.len() - 1].trim();

                // Only expand if there are multiple statements (contains `;`)
                // or has comments that would break if kept on one line
                if body.contains(';') || body.contains("//") {
                    // Determine the indent of the $: line
                    let indent = &line[..line.len() - line.trim_start().len()];
                    let inner_indent = format!("{}\t", indent);

                    // Split the body by `;` or `,` separators, but be smart about it.
                    // OXC uses `,` between statements in labeled blocks.
                    // We need to split on statement boundaries.
                    let stmts = split_labeled_block_body(body);

                    result.push_str(indent);
                    result.push_str("$: {\n");
                    for stmt in &stmts {
                        let stmt = stmt.trim();
                        if !stmt.is_empty() {
                            result.push_str(&inner_indent);
                            result.push_str(stmt);
                            // Add semicolon if the statement doesn't end with one
                            // and isn't a comment
                            if !stmt.ends_with(';')
                                && !stmt.ends_with('}')
                                && !stmt.starts_with("//")
                            {
                                result.push(';');
                            }
                            result.push('\n');
                        }
                    }
                    result.push_str(indent);
                    result.push_str("}\n");
                    continue;
                }
            }
        }

        // Also apply the old fix for any remaining `;,` patterns in labeled blocks
        // that we might not have caught
        let line_fixed = line.replace(";,", ";");
        result.push_str(&line_fixed);
        result.push('\n');
    }

    // Remove trailing newline
    if result.ends_with('\n') {
        result.pop();
    }

    result
}

/// Split the body of a labeled block statement (as collapsed by OXC) into individual statements.
/// OXC separates statements with `,` or `;,` patterns. Single-line comments starting with `//`
/// extend to the next real statement boundary.
fn split_labeled_block_body(body: &str) -> Vec<String> {
    let mut stmts = Vec::new();
    let chars: Vec<char> = body.chars().collect();
    let len = chars.len();
    let mut i = 0;
    let mut current = String::new();
    let mut depth = 0i32;
    let mut in_str: Option<char> = None;

    while i < len {
        let c = chars[i];

        // Handle string literals
        if let Some(q) = in_str {
            current.push(c);
            if c == '\\' && i + 1 < len {
                current.push(chars[i + 1]);
                i += 2;
                continue;
            }
            if c == q {
                in_str = None;
            }
            i += 1;
            continue;
        }
        if c == '\'' || c == '"' || c == '`' {
            in_str = Some(c);
            current.push(c);
            i += 1;
            continue;
        }

        // Handle single-line comments - collect until end or next `;,`/`,` boundary
        if c == '/' && i + 1 < len && chars[i + 1] == '/' {
            // Collect the entire comment text
            let mut comment = String::new();
            while i < len
                && chars[i] != ','
                && !(chars[i] == ';' && i + 1 < len && chars[i + 1] == ',')
            {
                // Also stop at semicolons that are statement boundaries
                if chars[i] == ';' {
                    // Check if this is a real statement end (not inside the comment text)
                    // For comments, the `;` is part of the comment text
                    comment.push(chars[i]);
                    i += 1;
                    continue;
                }
                comment.push(chars[i]);
                i += 1;
            }
            // Skip the `,` or `;,` separator
            if i < len && chars[i] == ',' {
                i += 1;
            } else if i < len && chars[i] == ';' && i + 1 < len && chars[i + 1] == ',' {
                i += 2;
            }
            // If current has content, push it first
            let current_trimmed = current.trim().to_string();
            if !current_trimmed.is_empty() {
                stmts.push(current_trimmed);
                current.clear();
            }
            stmts.push(comment.trim().to_string());
            continue;
        }

        // Track depth
        match c {
            '(' | '[' | '{' => depth += 1,
            ')' | ']' | '}' => depth -= 1,
            _ => {}
        }

        // Statement separator: `;,` at depth 0 (OXC pattern)
        if depth == 0 && c == ';' && i + 1 < len && chars[i + 1] == ',' {
            current.push(';');
            let s = current.trim().to_string();
            if !s.is_empty() {
                stmts.push(s);
            }
            current.clear();
            i += 2; // skip `;,`
            continue;
        }

        // Statement separator: `,` at depth 0 (OXC sometimes uses just `,`)
        if depth == 0 && c == ',' {
            // Check if the current content looks like a statement (not a comma expression)
            let trimmed = current.trim();
            if trimmed.ends_with(';') || trimmed.ends_with(']') {
                let s = current.trim().to_string();
                if !s.is_empty() {
                    stmts.push(s);
                }
                current.clear();
                i += 1;
                continue;
            }
        }

        current.push(c);
        i += 1;
    }

    let s = current.trim().to_string();
    if !s.is_empty() {
        stmts.push(s);
    }

    stmts
}

/// Restore parentheses around single-expression deps thunks in $.legacy_pre_effect() calls.
///
/// OXC normalizes `() => (expr)` to `() => expr`, but the official Svelte esrap formatter
/// preserves the parens (because the AST node is a SequenceExpression even with one element).
/// This function restores `$.legacy_pre_effect(() => expr, ...)` to
/// `$.legacy_pre_effect(() => (expr), ...)`.
fn restore_legacy_pre_effect_thunk_parens(code: String) -> String {
    let needle = "$.legacy_pre_effect(() => ";
    if !code.contains(needle) {
        return code;
    }
    let mut result = code;
    let mut search_from = 0;

    while let Some(pos) = result[search_from..].find(needle) {
        let abs_pos = search_from + pos + needle.len();

        // Check if the expression is already parenthesized
        if result[abs_pos..].starts_with('(') {
            // Already has parens, skip
            // Find the comma after this arg to advance search_from
            if let Some(comma) = find_next_comma_at_depth_zero(&result, abs_pos) {
                search_from = comma + 1;
            } else {
                break;
            }
            continue;
        }

        // Find the comma that separates the first arg (deps thunk) from the second arg
        // The first arg ends at depth-0 comma after the `() => expr` part
        // We need to wrap `expr` in parens: `() => expr,` → `() => (expr),`
        if let Some(comma_pos) = find_next_comma_at_depth_zero(&result, abs_pos) {
            let expr = result[abs_pos..comma_pos].trim_end().to_string();
            // Don't wrap empty block body `{}` - it's an arrow function with an empty body,
            // not an expression that needs parenthesizing. Wrapping it would produce `({})`
            // which is an arrow returning an empty object literal, changing the semantics.
            if expr == "{}" {
                search_from = comma_pos + 1;
                continue;
            }
            let replacement = format!("({})", expr);
            result.replace_range(abs_pos..comma_pos, &replacement);
            search_from = abs_pos + replacement.len() + 1;
        } else {
            break;
        }
    }

    result
}

/// Restore parentheses around IIFE function expressions.
///
/// OXC strips parentheses from IIFEs in expression context:
/// `(function (a) { return a; })(x())` becomes `function (a) { return a; }(x())`
///
/// This function finds patterns like `function (...) { ... }(` that are NOT at the
/// start of a statement and wraps the function expression in parentheses.
fn restore_iife_parens(code: String) -> String {
    let needle = "function (";
    let mut result = code;
    let mut search_from = 0;

    while let Some(rel_pos) = result[search_from..].find(needle) {
        let pos = search_from + rel_pos;

        // Check if this function expression is at statement level (shouldn't be wrapped)
        // vs inside an expression (should be wrapped for IIFE).
        // At statement level: preceded by start of line, or `\t`, or `\n`
        // In expression: preceded by `, `, `= `, `( `, etc.
        let is_statement_level = if pos == 0 {
            true
        } else {
            let before = result[..pos].trim_end();
            before.is_empty()
                || before.ends_with('\n')
                || before.ends_with('{')
                || before.ends_with(';')
                || before.ends_with("export default")
        };

        if is_statement_level {
            search_from = pos + needle.len();
            continue;
        }

        // Find the matching closing brace of the function body
        // First, find the opening brace after the params
        let after_fn = &result[pos + "function ".len()..];
        // Find the opening paren of params
        let Some(paren_open_rel) = after_fn.find('(') else {
            search_from = pos + needle.len();
            continue;
        };
        let paren_open = pos + "function ".len() + paren_open_rel;

        // Find matching closing paren
        let mut depth = 1i32;
        let mut i = paren_open + 1;
        let bytes = result.as_bytes();
        while i < bytes.len() && depth > 0 {
            match bytes[i] {
                b'(' => depth += 1,
                b')' => depth -= 1,
                b'\'' | b'"' | b'`' => {
                    let q = bytes[i];
                    i += 1;
                    while i < bytes.len() && bytes[i] != q {
                        if bytes[i] == b'\\' {
                            i += 1;
                        }
                        i += 1;
                    }
                }
                _ => {}
            }
            i += 1;
        }
        let paren_close = i - 1;

        // After closing paren, find opening brace (skip whitespace)
        let after_paren = result[paren_close + 1..].trim_start();
        if !after_paren.starts_with('{') {
            search_from = pos + needle.len();
            continue;
        }
        let brace_open = paren_close + 1 + (result[paren_close + 1..].len() - after_paren.len());

        // Find matching closing brace
        let mut brace_depth = 1i32;
        let mut j = brace_open + 1;
        let mut in_string = false;
        let mut string_char = b' ';
        while j < bytes.len() && brace_depth > 0 {
            if in_string {
                if bytes[j] == b'\\' {
                    j += 1;
                } else if bytes[j] == string_char {
                    in_string = false;
                }
            } else {
                match bytes[j] {
                    b'\'' | b'"' | b'`' => {
                        in_string = true;
                        string_char = bytes[j];
                    }
                    b'{' => brace_depth += 1,
                    b'}' => brace_depth -= 1,
                    _ => {}
                }
            }
            j += 1;
        }
        let brace_close = j - 1;

        // Check if immediately followed by `(` (IIFE call)
        let after_brace = result[brace_close + 1..].trim_start();
        if !after_brace.starts_with('(') {
            search_from = brace_close + 1;
            continue;
        }

        // Check if already wrapped in parens: look for `(` immediately before `function`
        let before_fn = result[..pos].trim_end();
        if before_fn.ends_with('(') {
            // Already wrapped or in a different context - need to check if matching `)` after `}`
            search_from = brace_close + 1;
            continue;
        }

        // Wrap the function expression in parens: insert `(` before `function` and `)` after `}`
        result.insert(brace_close + 1, ')');
        result.insert(pos, '(');
        search_from = brace_close + 3; // +2 for inserted chars, +1 to advance
    }

    result
}

/// Find the position of the next comma at depth-0 (not inside parens/brackets/braces).
fn find_next_comma_at_depth_zero(s: &str, start: usize) -> Option<usize> {
    let bytes = s.as_bytes();
    let mut depth = 0i32;
    let mut i = start;

    while i < bytes.len() {
        match bytes[i] {
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => {
                if depth == 0 {
                    return None; // Reached end of surrounding expression
                }
                depth -= 1;
            }
            b',' if depth == 0 => return Some(i),
            b'\'' | b'"' | b'`' => {
                // Skip string literal
                let quote = bytes[i];
                i += 1;
                while i < bytes.len() && bytes[i] != quote {
                    if bytes[i] == b'\\' {
                        i += 1; // Skip escaped char
                    }
                    i += 1;
                }
            }
            _ => {}
        }
        i += 1;
    }

    None
}

/// Restore parentheses around sequence expression statements that OXC stripped.
///
/// Finds lines in the OXC output that match collected sequence expressions
/// (after whitespace normalization) and wraps them back in parentheses.
fn restore_paren_sequence_stmts(code: String, paren_stmts: &[String]) -> String {
    if paren_stmts.is_empty() {
        return code;
    }

    let mut result_lines: Vec<String> = Vec::new();
    for line in code.lines() {
        let trimmed = line.trim();
        // Check if this line (without trailing semicolon) matches any collected sequence
        if let Some(without_semi) = trimmed.strip_suffix(';') {
            // Don't re-wrap if already wrapped in parens
            if !without_semi.starts_with('(') {
                let normalized: String = without_semi
                    .split_whitespace()
                    .collect::<Vec<_>>()
                    .join(" ");
                if paren_stmts.contains(&normalized) {
                    // Restore the parentheses
                    let indent = &line[..line.len() - trimmed.len()];
                    result_lines.push(format!("{}({});", indent, without_semi));
                    continue;
                }
            }
        }
        result_lines.push(line.to_string());
    }
    result_lines.join("\n")
}

/// Restore double quotes for non-import lines using the original source.
///
/// For each line in the OXC output, if the same line existed in the source
/// with double quotes (differing only in quote style), swap the quote characters
/// in-place in the OXC output line rather than replacing the entire line.
/// This preserves OXC's formatting additions (semicolons, spacing, etc.)
/// while restoring the original quote style.
#[allow(dead_code)]
fn restore_line_quotes(code: String, original_lines: &FxHashMap<String, String>) -> String {
    if original_lines.is_empty() {
        return code;
    }

    let mut result = String::with_capacity(code.len());
    for line in code.lines() {
        let trimmed = line.trim();
        // Skip import lines and empty lines
        if !trimmed.is_empty()
            && !trimmed.starts_with("import ")
            && let Some(original) = original_lines.get(trimmed)
        {
            // Found a matching line - swap quotes in-place on the OXC line
            // Extract double-quoted strings from the original
            let double_quoted_strings = extract_double_quoted_strings(original);
            if !double_quoted_strings.is_empty() {
                // Replace single-quoted occurrences with double-quoted ones
                let mut restored = line.to_string();
                for dq_str in &double_quoted_strings {
                    // The OXC output has this as single-quoted
                    let sq_version = format!("'{}'", dq_str);
                    let dq_version = format!("\"{}\"", dq_str);
                    restored = restored.replacen(&sq_version, &dq_version, 1);
                }
                result.push_str(&restored);
                result.push('\n');
                continue;
            }
        }
        result.push_str(line);
        result.push('\n');
    }

    if result.ends_with('\n') && !code.ends_with('\n') {
        result.pop();
    }
    result
}

/// Extract all double-quoted string values from a line.
/// Returns the content between each pair of double quotes (without the quotes).
fn extract_double_quoted_strings(line: &str) -> Vec<String> {
    let mut strings = Vec::new();
    let mut chars = line.chars().peekable();
    while let Some(c) = chars.next() {
        if c == '"' {
            let mut s = String::new();
            let mut escaped = false;
            for ch in chars.by_ref() {
                if escaped {
                    s.push(ch);
                    escaped = false;
                } else if ch == '\\' {
                    s.push(ch);
                    escaped = true;
                } else if ch == '"' {
                    break;
                } else {
                    s.push(ch);
                }
            }
            if !s.is_empty() {
                strings.push(s);
            }
        }
    }
    strings
}

/// Expand objects containing getter/setter methods to multi-line format.
///
/// OXC formats objects with getter/setter methods on the same line as the opening brace:
/// ```js
/// Task(node, { get prop() {
///     return val;
/// } });
/// ```
///
/// Svelte's esrap formats them on separate lines:
/// ```js
/// Task(node, {
///     get prop() {
///         return val;
///     }
/// });
/// ```
///
/// This function detects the OXC pattern and expands it to the Svelte format.
fn expand_getter_objects(code: String) -> String {
    // Quick check: if no getter/setter patterns exist, return early
    if !code.contains("{ get ") && !code.contains("{ set ") {
        return code;
    }
    let lines: Vec<&str> = code.lines().collect();
    let mut result = String::with_capacity(code.len() + 200);
    let mut i = 0;

    while i < lines.len() {
        let line = lines[i];
        let trimmed = line.trim();

        // Detect pattern: something followed by `{ get ` or `{ set ` before a method definition
        // e.g., `Task(node, { get prop() {`
        // or `Component($$anchor, { get count() {`
        // The key pattern is: `{ get identifier(` or `{ set identifier(`
        if let Some(pos) = find_inline_getter_start(trimmed) {
            let indent_level = line.len() - line.trim_start().len();
            let indent = &line[..indent_level];
            let inner_indent = format!("{}\t", indent);

            // Split the line at the `{ get` / `{ set` position
            let prefix = &trimmed[..pos]; // e.g., "Task(node, "
            let rest = &trimmed[pos + 2..]; // e.g., "get prop() {" (skipping "{ ")
            let rest = rest.trim();

            // Write the prefix with opening brace on its own line
            result.push_str(indent);
            result.push_str(prefix);
            result.push_str("{\n");

            // Write the getter/setter with increased indentation
            result.push_str(&inner_indent);
            result.push_str(rest);
            result.push('\n');
            i += 1;

            // Now process body lines - increase their indentation by one tab
            // Look for the closing `} });` or `} })` pattern at the original indent level
            while i < lines.len() {
                let body_line = lines[i];
                let body_trimmed = body_line.trim();

                // Check for closing pattern: `} });` or `} })` or `} }, get ` (multiple getters)
                // at the original indent level
                let body_indent = body_line.len() - body_line.trim_start().len();

                if body_indent == indent_level {
                    // This line is at the same indent level as the original
                    // It might be the closing `} });` or similar

                    if body_trimmed.starts_with("} }") {
                        // Closing pattern: `} });` -> split into `\t}` and `});`
                        let after_close = &body_trimmed[2..]; // `});` or `}, ...`
                        result.push_str(&inner_indent);
                        result.push_str("}\n");
                        result.push_str(indent);
                        result.push_str(after_close.trim());
                        result.push('\n');
                        i += 1;
                        break;
                    } else if body_trimmed.starts_with("}, ") {
                        // Multiple properties: `}, get prop2() {`
                        // Check if it's another getter/setter
                        let after_comma = &body_trimmed[2..].trim();
                        if after_comma.starts_with("get ") || after_comma.starts_with("set ") {
                            // New getter/setter member
                            result.push_str(&inner_indent);
                            result.push_str("},\n");
                            result.push('\n');
                            result.push_str(&inner_indent);
                            result.push_str(after_comma);
                            result.push('\n');
                            i += 1;
                            continue;
                        }
                    }
                }

                // Regular body line - add one extra tab of indentation
                // The body lines are inside the getter method, so they need
                // indent_level + 2 tabs (one for object, one for getter body)
                if body_trimmed.is_empty() {
                    result.push('\n');
                } else {
                    // Add one extra tab to the existing indentation
                    result.push('\t');
                    result.push_str(body_line);
                    result.push('\n');
                }
                i += 1;
            }
            continue;
        }

        result.push_str(line);
        result.push('\n');
        i += 1;
    }

    // Remove potential trailing newline
    if result.ends_with('\n') && !code.ends_with('\n') {
        result.pop();
    }
    result
}

/// Find the position of an inline getter/setter object start in a line.
/// Returns the position of the `{` that starts the object containing getters.
/// Pattern: `something { get identifier(` or `something { set identifier(`
/// Returns None if no such pattern is found.
fn find_inline_getter_start(line: &str) -> Option<usize> {
    // Look for `{ get ` or `{ set ` patterns that are part of an object literal
    // (not an `if {` or `function {` block)
    let patterns = ["{ get ", "{ set "];
    for pattern in &patterns {
        if let Some(pos) = line.find(pattern) {
            // Make sure the `{` is preceded by something that indicates an object literal
            // (comma, opening paren, equals, etc.)
            let before = line[..pos].trim_end();
            if before.is_empty() {
                continue;
            }
            let last_char = before.chars().last()?;
            // The object brace should follow: (, ,, =, :, [, or be the start of a statement
            if matches!(last_char, '(' | ',' | '=' | ':' | '[') || before.ends_with("return") {
                // Verify what follows is a method definition: `get identifier(...) {`
                let rest = &line[pos + pattern.len()..];
                if rest.contains("() {") || rest.contains("($$value) {") {
                    return Some(pos);
                }
            }
        }
    }
    None
}

/// Normalize an import line for matching: replace double quotes with single quotes,
/// and normalize whitespace around braces to match OXC output format.
fn normalize_import_line(line: &str) -> String {
    let mut result = line.replace('"', "'");
    // OXC normalizes `{SvelteSet}` to `{ SvelteSet }` etc.
    // Normalize brace spacing: ensure space after `{` and before `}`
    result = result.replace("{ ", "{").replace(" }", "}");
    result = result.replace('{', "{ ").replace('}', " }");
    // Clean up double spaces
    while result.contains("  ") {
        result = result.replace("  ", " ");
    }
    result
}

/// Count the net brace depth change ({/}) in a line, properly handling
/// string literals and comments. Returns the delta depth.
fn count_brace_depth_in_line(line: &str, in_str: &mut Option<char>) -> i32 {
    let chars: Vec<char> = line.chars().collect();
    let len = chars.len();
    let mut depth = 0i32;
    let mut i = 0;

    while i < len {
        let ch = chars[i];

        // Handle string tracking
        if let Some(q) = *in_str {
            if ch == '\\' && i + 1 < len {
                // Skip escaped character
                i += 2;
                continue;
            }
            if ch == q {
                *in_str = None;
            }
            i += 1;
            continue;
        }

        // Skip single-line comments
        if ch == '/' && i + 1 < len && chars[i + 1] == '/' {
            break; // Rest of line is comment
        }

        // Skip multi-line comment start (we handle only same-line for simplicity)
        if ch == '/' && i + 1 < len && chars[i + 1] == '*' {
            // Skip to end of comment or end of line
            i += 2;
            while i + 1 < len && !(chars[i] == '*' && chars[i + 1] == '/') {
                i += 1;
            }
            if i + 1 < len {
                i += 2; // Skip past `*/`
            }
            continue;
        }

        // Start string
        if ch == '\'' || ch == '"' || ch == '`' {
            *in_str = Some(ch);
            i += 1;
            continue;
        }

        match ch {
            '{' => depth += 1,
            '}' => depth -= 1,
            _ => {}
        }

        i += 1;
    }

    depth
}

/// Pre-extract `$: { ... }` labeled block statements from source code before OXC processing.
///
/// OXC collapses multi-line `$: { ... }` blocks to a single line, destroying `//` comments
/// and potentially breaking the code. We replace each block with a placeholder variable
/// declaration and restore it after OXC processing.
///
/// Returns the modified source and a vector of (placeholder, original_text) pairs.
fn extract_labeled_blocks(source: &str) -> (String, Vec<(String, String)>) {
    // Quick check: if no `$:` pattern exists, return source unchanged
    if !source.contains("$:") {
        return (source.to_string(), Vec::new());
    }
    let mut result = String::with_capacity(source.len());
    let mut blocks: Vec<(String, String)> = Vec::new();
    let lines: Vec<&str> = source.lines().collect();
    let num_lines = lines.len();
    let mut i = 0;

    while i < num_lines {
        let trimmed = lines[i].trim();

        // Look for `$: {` that starts a labeled block (possibly multi-line)
        if trimmed
            .strip_prefix("$:")
            .map(|s| s.trim_start())
            .is_some_and(|s| s.starts_with('{'))
        {
            // Check if block closes on same line using proper comment-aware counting
            let mut in_str_check: Option<char> = None;
            let line_depth = count_brace_depth_in_line(lines[i], &mut in_str_check);

            if line_depth <= 0 {
                // Already on one line (balanced or no braces) - pass through
                result.push_str(lines[i]);
                result.push('\n');
                i += 1;
                continue;
            }

            // Multi-line block: collect until closing brace at depth 0
            let indent = &lines[i][..lines[i].len() - lines[i].trim_start().len()];
            let mut block_lines = vec![lines[i].to_string()];
            let mut block_depth = line_depth;
            let mut in_str_ml: Option<char> = in_str_check;

            i += 1;
            let mut found_end = false;

            while i < num_lines && block_depth > 0 {
                block_lines.push(lines[i].to_string());
                block_depth += count_brace_depth_in_line(lines[i], &mut in_str_ml);
                i += 1;
                if block_depth == 0 {
                    found_end = true;
                }
            }

            if found_end {
                let block_id = blocks.len();
                let placeholder = format!("var $$_labeled_block_{} = 0;", block_id);
                let original = block_lines.join("\n");
                blocks.push((format!("$$_labeled_block_{}", block_id), original));
                result.push_str(indent);
                result.push_str(&placeholder);
                result.push('\n');
            } else {
                // Didn't find closing brace - just pass through original lines
                for bl in &block_lines {
                    result.push_str(bl);
                    result.push('\n');
                }
            }
            continue;
        }

        result.push_str(lines[i]);
        result.push('\n');
        i += 1;
    }

    // Remove trailing newline to match original if it didn't have one
    if !source.ends_with('\n') && result.ends_with('\n') {
        result.pop();
    }

    (result, blocks)
}

/// Restore pre-extracted `$: { ... }` labeled block statements after OXC processing.
///
/// Replaces placeholder variable declarations with the original block text.
fn restore_labeled_blocks(code: String, blocks: &[(String, String)]) -> String {
    if blocks.is_empty() {
        return code;
    }

    let mut result = String::with_capacity(code.len());
    let lines: Vec<&str> = code.lines().collect();

    for line in &lines {
        let trimmed = line.trim();
        let mut replaced = false;
        for (placeholder_name, original) in blocks {
            // Match: `var $$_labeled_block_N = 0;` or `let $$_labeled_block_N = 0;`
            let pattern_var = format!("var {} = 0;", placeholder_name);
            let pattern_let = format!("let {} = 0;", placeholder_name);
            if trimmed == pattern_var || trimmed == pattern_let {
                result.push_str(original);
                result.push('\n');
                replaced = true;
                break;
            }
        }
        if !replaced {
            result.push_str(line);
            result.push('\n');
        }
    }

    // Remove trailing newline
    if result.ends_with('\n') && !code.ends_with('\n') {
        result.pop();
    }

    result
}

/// Collect all source info needed by post-processing in a single pass over the source lines.
/// Returns (import_lines, quote_lines, paren_sequence_stmts).
fn collect_source_info(
    source: &str,
) -> (
    FxHashMap<String, String>,
    FxHashMap<String, String>,
    Vec<String>,
) {
    let mut import_lines = FxHashMap::default();
    let mut quote_lines = FxHashMap::default();
    let mut paren_stmts = Vec::new();

    for line in source.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }

        // Import lines with double quotes
        if trimmed.starts_with("import ") && trimmed.contains('"') {
            let normalized = normalize_import_line(trimmed);
            import_lines.insert(normalized.clone(), trimmed.to_string());
            if !normalized.ends_with(';') {
                import_lines.insert(format!("{};", normalized), trimmed.to_string());
            }
            if normalized.ends_with(';') {
                import_lines.insert(
                    normalized[..normalized.len() - 1].to_string(),
                    trimmed.to_string(),
                );
            }
            continue;
        }

        // Non-import lines with double quotes (for quote restoration)
        if trimmed.contains('"') {
            let normalized = trimmed.replace('"', "'");
            quote_lines.insert(normalized.clone(), trimmed.to_string());
            if !normalized.ends_with(';') {
                quote_lines.insert(format!("{};", normalized), trimmed.to_string());
            }
        }

        // Parenthesized expression statements
        if trimmed.starts_with('(') && trimmed.ends_with(");") {
            let inner = &trimmed[1..trimmed.len() - 2];
            let mut depth = 0i32;
            let mut balanced = true;
            for ch in inner.chars() {
                match ch {
                    '(' | '[' | '{' => depth += 1,
                    ')' | ']' | '}' => {
                        depth -= 1;
                        if depth < 0 {
                            balanced = false;
                            break;
                        }
                    }
                    _ => {}
                }
            }
            if balanced
                && depth == 0
                && !inner.starts_with("function ")
                && !inner.starts_with("function(")
            {
                let normalized: String = inner.split_whitespace().collect::<Vec<_>>().join(" ");
                paren_stmts.push(normalized);
            }
        }
    }

    (import_lines, quote_lines, paren_stmts)
}

/// Restore quote style in an OXC-formatted import line using the original's quote style.
/// Keeps OXC's spacing/formatting but replaces single quotes with double quotes
/// for the import source string.
fn restore_import_quotes(oxc_line: &str, original: &str) -> String {
    // Extract the source string from the original (between quotes)
    // The original has double quotes, find them
    if let (Some(orig_first), Some(orig_last)) = (original.find('"'), original.rfind('"'))
        && orig_first < orig_last
    {
        let orig_source = &original[orig_first + 1..orig_last];
        // In the OXC line, find the single-quoted source string and replace
        // Find the last single-quoted string (the import source is usually the last one)
        if let Some(oxc_last) = oxc_line.rfind('\'')
            && let Some(oxc_first) = oxc_line[..oxc_last].rfind('\'')
        {
            let oxc_source = &oxc_line[oxc_first + 1..oxc_last];
            // The sources should match after unquoting
            if oxc_source == orig_source {
                // Replace single quotes with double quotes for this string
                let mut result = String::with_capacity(oxc_line.len());
                result.push_str(&oxc_line[..oxc_first]);
                result.push('"');
                result.push_str(orig_source);
                result.push('"');
                result.push_str(&oxc_line[oxc_last + 1..]);
                return result;
            }
        }
    }
    // Fallback: return the OXC line unchanged
    oxc_line.to_string()
}

/// Restore original quote styles for import lines that were changed by OXC normalization.
///
/// OXC normalizes all string quotes to single quotes, but the official Svelte compiler
/// (esrap) preserves the original quote style from the user's source code. This function
/// restores double-quoted import statements where the original source used double quotes.
///
/// Also restores double quotes on non-import lines (merged from restore_line_quotes).
fn restore_all_quotes(
    code: String,
    import_lines: &FxHashMap<String, String>,
    original_lines: &FxHashMap<String, String>,
) -> String {
    if import_lines.is_empty() && original_lines.is_empty() {
        return code;
    }

    let mut result = String::with_capacity(code.len());
    for line in code.lines() {
        let trimmed = line.trim();

        // Restore import line quotes
        if !import_lines.is_empty() && trimmed.starts_with("import ") {
            let normalized = normalize_import_line(trimmed);
            if let Some(original) = import_lines.get(&normalized) {
                let restored = restore_import_quotes(trimmed, original);
                let indent = &line[..line.len() - line.trim_start().len()];
                result.push_str(indent);
                result.push_str(&restored);
                result.push('\n');
                continue;
            }
        }

        // Restore non-import line quotes (merged from restore_line_quotes)
        if !original_lines.is_empty()
            && !trimmed.is_empty()
            && !trimmed.starts_with("import ")
            && let Some(original) = original_lines.get(trimmed)
        {
            let double_quoted_strings = extract_double_quoted_strings(original);
            if !double_quoted_strings.is_empty() {
                let mut restored = line.to_string();
                for dq_str in &double_quoted_strings {
                    let sq_version = format!("'{}'", dq_str);
                    let dq_version = format!("\"{}\"", dq_str);
                    restored = restored.replacen(&sq_version, &dq_version, 1);
                }
                result.push_str(&restored);
                result.push('\n');
                continue;
            }
        }

        result.push_str(line);
        result.push('\n');
    }

    // Remove the extra trailing newline
    if result.ends_with('\n') && !code.ends_with('\n') {
        result.pop();
    }
    result
}

/// OXC splits `;;` (used as $inspect placeholder) into two separate empty statements
/// on different lines. This function rejoins them back to `;;` on a single line.
fn rejoin_double_semicolons(code: String) -> String {
    // Quick check: if no lone semicolons, nothing to rejoin
    if !code.contains("\n;\n") && !code.contains("\n\t;\n") {
        return code;
    }

    let lines: Vec<&str> = code.lines().collect();
    let mut result = String::with_capacity(code.len());
    let mut i = 0;

    while i < lines.len() {
        if i + 1 < lines.len() && lines[i].trim() == ";" && lines[i + 1].trim() == ";" {
            let indent = &lines[i][..lines[i].len() - lines[i].trim_start().len()];
            result.push_str(indent);
            result.push_str(";;");
            result.push('\n');
            i += 2;
        } else {
            result.push_str(lines[i]);
            result.push('\n');
            i += 1;
        }
    }

    if result.ends_with('\n') && !code.ends_with('\n') {
        result.pop();
    }
    result
}

/// Wrap `new class` expressions with parentheses to match Svelte's esrap output.
///
/// OXC's codegen strips "unnecessary" parentheses from `new (class Foo { ... })()`,
/// producing `new class Foo { ... }()`. While semantically equivalent, Svelte's
/// official compiler output includes the wrapping parens. This function restores them.
///
/// Transforms: `new class Foo { ... }(args)` -> `new (class Foo { ... })(args)`
fn wrap_new_class_expressions(code: String) -> String {
    if !code.contains("new class") {
        return code;
    }

    let mut result = String::with_capacity(code.len() + 16);
    let chars: Vec<char> = code.chars().collect();
    let len = chars.len();
    let mut i = 0;

    while i < len {
        // Look for "new class" pattern (not inside strings)
        if i + 9 < len
            && chars[i] == 'n'
            && chars[i + 1] == 'e'
            && chars[i + 2] == 'w'
            && chars[i + 3] == ' '
            && chars[i + 4] == 'c'
            && chars[i + 5] == 'l'
            && chars[i + 6] == 'a'
            && chars[i + 7] == 's'
            && chars[i + 8] == 's'
            && (chars[i + 9] == ' ' || chars[i + 9] == '{')
        {
            // Check that the char before 'new' is not alphanumeric (word boundary)
            if i > 0
                && (chars[i - 1].is_alphanumeric() || chars[i - 1] == '_' || chars[i - 1] == '$')
            {
                result.push(chars[i]);
                i += 1;
                continue;
            }

            // Find the opening brace of the class body
            let class_start = i + 4; // start of "class"
            let mut j = class_start;
            while j < len && chars[j] != '{' {
                j += 1;
            }
            if j >= len {
                // No opening brace found, just output as-is
                result.push(chars[i]);
                i += 1;
                continue;
            }

            // Find the matching closing brace
            let mut depth = 1;
            let mut k = j + 1;
            while k < len && depth > 0 {
                match chars[k] {
                    '{' => depth += 1,
                    '}' => depth -= 1,
                    '\'' | '"' => {
                        // Skip string literals
                        let quote = chars[k];
                        k += 1;
                        while k < len && chars[k] != quote {
                            if chars[k] == '\\' {
                                k += 1; // skip escaped char
                            }
                            k += 1;
                        }
                    }
                    '`' => {
                        // Skip template literals
                        k += 1;
                        let mut tmpl_depth = 0;
                        while k < len {
                            if chars[k] == '`' && tmpl_depth == 0 {
                                break;
                            }
                            if chars[k] == '$' && k + 1 < len && chars[k + 1] == '{' {
                                tmpl_depth += 1;
                                k += 1;
                            } else if chars[k] == '}' && tmpl_depth > 0 {
                                tmpl_depth -= 1;
                            } else if chars[k] == '\\' {
                                k += 1; // skip escaped char
                            }
                            k += 1;
                        }
                    }
                    _ => {}
                }
                k += 1;
            }

            if depth != 0 {
                // Unbalanced braces, output as-is
                result.push(chars[i]);
                i += 1;
                continue;
            }

            // k is now one past the closing brace
            let class_end = k - 1; // index of closing brace

            // Check if there's a `(` right after the closing brace (possibly with whitespace)
            // This indicates the class is being instantiated: `new class Foo { }()`
            let mut after = class_end + 1;
            while after < len && chars[after].is_whitespace() {
                after += 1;
            }
            if after < len && chars[after] == '(' {
                // This is `new class Foo { ... }(args)` - wrap it
                result.push_str("new (");
                // Copy the class expression (from "class" to closing brace)
                for c in &chars[class_start..=class_end] {
                    result.push(*c);
                }
                result.push(')');
                i = class_end + 1;
                continue;
            }

            // No `()` after class - just `new class Foo { ... }` without invocation
            // Still wrap for consistency with Svelte output
            result.push_str("new (");
            for c in &chars[class_start..=class_end] {
                result.push(*c);
            }
            result.push(')');
            i = class_end + 1;
            continue;
        }

        result.push(chars[i]);
        i += 1;
    }

    result
}

/// Add blank lines to match Svelte's esrap output formatting.
///
/// oxc's codegen doesn't add blank lines between statements.
/// This function adds blank lines in the following cases:
/// 1. After the last import statement (before non-import code)
/// 2. After top-level variable declarations (before export/function declarations)
/// 3. After variable declaration groups (before function declarations) inside functions
/// 4. After function declarations inside functions
/// 5. After variable declaration groups (before non-declaration statements) inside functions
fn add_blank_lines_for_formatting(code: String) -> String {
    let lines: Vec<&str> = code.lines().collect();
    if lines.is_empty() {
        return code;
    }

    let mut result = String::with_capacity(code.len() + 100);
    let mut i = 0;

    while i < lines.len() {
        let line = lines[i];
        let trimmed = line.trim();
        result.push_str(line);
        result.push('\n');

        // Check if we need to add a blank line after this line
        if i + 1 < lines.len() {
            let next_line = lines[i + 1].trim();

            // Skip if next line is already blank
            if !next_line.is_empty() {
                let should_add_blank = should_add_blank_line_after(trimmed, next_line, line);
                if should_add_blank {
                    result.push('\n');
                }
            }
        }

        i += 1;
    }

    result
}

/// Determine if a blank line should be added after the current line.
fn should_add_blank_line_after(current: &str, next: &str, raw_current: &str) -> bool {
    // Rule 1: After import statements (before non-import)
    if current.starts_with("import ") && !next.starts_with("import ") {
        return true;
    }

    // Rule 2: After top-level var/let/const declarations (before export or function)
    // Top-level means no leading whitespace
    if !raw_current.starts_with('\t')
        && !raw_current.starts_with(' ')
        && is_var_declaration(current)
        && (next.starts_with("export ")
            || next.starts_with("function ")
            || next.starts_with("async function "))
    {
        return true;
    }

    // Rule 2b: After top-level closing brace `}` (before any non-empty line)
    // This handles: closing function → $.delegate(), closing function → next statement
    if !raw_current.starts_with('\t')
        && !raw_current.starts_with(' ')
        && (current == "}" || current == "};")
        && !next.is_empty()
    {
        return true;
    }

    // Rule 3 & 4: Inside functions (indented code)
    if raw_current.starts_with('\t') || raw_current.starts_with("  ") {
        let current_indent = get_indent_level(raw_current);
        let next_raw = format!("{}{}", "\t".repeat(current_indent), next);
        let next_indent = get_indent_level(&next_raw);

        // Only apply rules at the same indent level
        if current_indent == next_indent
            || next.starts_with("function ")
            || next.starts_with("async function ")
        {
            // After variable declarations (before function declarations)
            if is_var_declaration(current)
                && (next.starts_with("function ") || next.starts_with("async function "))
            {
                return true;
            }

            // After closing brace of function (before next function or var or statement)
            // But NOT before other closing braces (};, });, etc.)
            if current == "}"
                && !is_closing_brace(next)
                && (next.starts_with("function ")
                    || next.starts_with("async function ")
                    || next.starts_with("export default function ")
                    || next.starts_with("export function ")
                    || is_var_declaration(next)
                    || is_statement(next))
            {
                return true;
            }

            // After variable declarations (before non-declaration statements)
            // But only if the current is a declaration and next is NOT a declaration
            // Skip if current line ends with `{` (multi-line expression like arrow function)
            if is_var_declaration(current)
                && !is_var_declaration(next)
                && is_statement(next)
                && !current.ends_with('{')
            {
                return true;
            }

            // Rule 5: After $.reset(...) calls (before var declarations)
            // This matches Svelte's esrap formatting for element traversal code
            if current.starts_with("$.reset(") && is_var_declaration(next) {
                return true;
            }

            // Rule 5b: After $.reset(...) calls (before multi-line template_effect)
            // Blank line only when template_effect uses block form: () => { ... }
            if current.starts_with("$.reset(")
                && next.starts_with("$.template_effect(")
                && !next.ends_with(");")
            {
                return true;
            }

            // Rule 5c: After do-while closing `} while (...);` (before statements)
            // This matches Svelte's formatting for $$settled loops
            if current.starts_with("} while (") && current.ends_with(");") {
                return true;
            }

            // Rule 6: After callback closures `});` (before statements/var decls)
            // This matches Svelte's esrap formatting for each blocks
            if current == "});"
                && (is_statement(next) || is_var_declaration(next))
                && !is_closing_brace(next)
            {
                return true;
            }

            // Rule 6b: After arrow/assignment closures `};`
            // Add blank line unless next is a closing brace pattern
            if current == "};" && !is_closing_brace(next) && !next.is_empty() {
                return true;
            }

            // Rule 6c: After nested callback closures `}));` (before next statement)
            if current == "}));"
                && (is_statement(next) || is_var_declaration(next))
                && !is_closing_brace(next)
            {
                return true;
            }

            // Rule 7: After $.next(); calls (before var declarations)
            // This matches Svelte's esrap formatting for text-first fragments
            if current.starts_with("$.next(") && is_var_declaration(next) {
                return true;
            }

            // Rule 8: After $.push(...); calls (before var/let/const, blocks, functions)
            // This matches Svelte's esrap formatting for component initialization
            // $.push() is always the first statement in a function, followed by user code
            // But NOT before simple expression statements like $.init(), $.pop(), set('hello')
            if current.starts_with("$.push(")
                && (is_var_declaration(next)
                    || next == "{"
                    || next.starts_with("function ")
                    || next.starts_with("async function ")
                    || next.starts_with("class ")
                    || next.starts_with("//")
                    || next.starts_with("/*"))
            {
                return true;
            }

            // Rule 9: After $.init(); calls (before var declarations, blocks, or component calls with multiline args)
            // $.init() gets a blank line before var/let/const, {, and multiline expressions,
            // but NOT before simple function calls like Component($$anchor, {}), $.next(), $.pop()
            if current.starts_with("$.init(")
                && (is_var_declaration(next)
                    || next == "{"
                    || next.starts_with("function ")
                    || next.starts_with("class ")
                    || next.starts_with("//")
                    || next.starts_with("/*"))
            {
                return true;
            }

            // Rule 10: After single-line event handler setups: `button.__click = ...;`
            // Only before var declarations, NOT before $.append or other statements
            if current.contains(".__")
                && current.ends_with(';')
                && !next.contains(".__")
                && is_var_declaration(next)
            {
                return true;
            }

            // Rule 11: General rule - after any expression statement ending with `;`,
            // add blank line before var/let/const declarations.
            // This covers $.action(), $.bind_this(), Component() calls, $.remove_input_defaults(),
            // $.set_attribute(), $.attribute_effect(), etc.
            // Exceptions: var declarations themselves, closing braces, function decls
            if !is_var_declaration(current)
                && !is_closing_brace(current)
                && !current.starts_with("function ")
                && !current.starts_with("async function ")
                && !current.starts_with("//")
                && !current.starts_with("/*")
                && current.ends_with(';')
                && is_var_declaration(next)
            {
                return true;
            }

            // Rule 11b: After expression statements (ending with `;`) before bare `{` blocks,
            // `if` statements, `for` statements, and multi-line function calls.
            // This matches esrap formatting where $$renderer.push() calls are
            // visually separated from control flow and significant code blocks.
            if !is_var_declaration(current)
                && !is_closing_brace(current)
                && !current.starts_with("function ")
                && !current.starts_with("async function ")
                && !current.starts_with("//")
                && !current.starts_with("/*")
                && current.ends_with(';')
                && (next == "{"
                    || next == "{}"
                    || next.starts_with("if (")
                    || next.starts_with("if(")
                    || next.starts_with("for (")
                    || next.starts_with("for("))
            {
                return true;
            }

            // Rule 11b2: After expression statements (ending with `;`) before
            // multi-line function/component calls (lines ending with `{`).
            // e.g., after `$$renderer.push(...)` before `Foo($$renderer, {`
            // or `$.await($$renderer, ...)` or `$$renderer.title(($$renderer) => {`
            if !is_var_declaration(current)
                && !is_closing_brace(current)
                && !current.starts_with("function ")
                && !current.starts_with("async function ")
                && current.ends_with(';')
                && next.ends_with(" {")
                && !next.starts_with("if ")
                && !next.starts_with("if(")
                && !next.starts_with("for ")
                && !next.starts_with("for(")
                && !next.starts_with("function ")
                && !next.starts_with("async function ")
                && !next.starts_with("} else")
            {
                return true;
            }

            // Rule 11c: After var declarations before expression statements that are
            // NOT simple function calls. This covers patterns like:
            // let x = ...; \n\n $$renderer.push(...);
            // const each_array = ...; \n\n for (...)
            if is_var_declaration(current)
                && !is_var_declaration(next)
                && (next.starts_with("$$renderer.push(")
                    || next.starts_with("$renderer.push(")
                    || next.starts_with("for (")
                    || next.starts_with("for("))
            {
                return true;
            }

            // Rule 11d: After `} else {}`, `{}`, or other closing-brace constructs before
            // $$renderer.push() or $renderer.push() calls. These need a blank line separator.
            if (current == "} else {}" || current == "{}")
                && (next.starts_with("$$renderer.push(") || next.starts_with("$renderer.push("))
            {
                return true;
            }

            // Rule 11e: After reactive labels `$: ...;` before $$renderer.push() or other statements
            // Svelte legacy mode generates `$: x *= 2;` followed by a blank line before $$renderer.push()
            if current.starts_with("$:")
                && current.ends_with(';')
                && (next.starts_with("$$renderer.push(") || next.starts_with("$renderer.push("))
            {
                return true;
            }

            // Rule 12: After `},` before next property/method definition in object/class
            // (get/set/constructor, $$slots, $$legacy, method names like increment(), etc.)
            if current == "},"
                && (next.starts_with("get ")
                    || next.starts_with("set ")
                    || next.starts_with("$$slots")
                    || next.starts_with("$$legacy")
                    || next.starts_with("constructor")
                    || is_method_definition(next))
            {
                return true;
            }

            // Rule 13: After class field declarations (like `#count = $.state(0);` or `count = 0;`),
            // blank line before methods (get/set/constructor)
            if (current.starts_with('#') || current.chars().next().is_some_and(|c| c.is_alphabetic() || c == '_' || c == '$'))
                && current.ends_with(';')
                && !is_var_declaration(current)
                && !current.starts_with("return ")
                && !current.starts_with("throw ")
                && !current.contains('(') // Not a function call, just a field declaration
                && (next.starts_with("get ")
                    || next.starts_with("set ")
                    || next.starts_with("constructor"))
            {
                return true;
            }

            // Rule 14: After `});` before `} else` - NO blank line
            // (handled by adding `} else` to closing_brace check above)

            // Rule 15: Reserved (covered by Rule 6 and 6b/6c for closing braces before $.append)

            // Rule 16: Before `return` statements after expression statements
            // This matches Svelte's esrap formatting where return is visually separated
            if !is_var_declaration(current)
                && !is_closing_brace(current)
                && !current.starts_with("//")
                && !current.starts_with("/*")
                && current.ends_with(';')
                && next.starts_with("return ")
            {
                return true;
            }

            // Rule 17: After `});` or `}` closures before `function` declarations
            // This matches Svelte's esrap formatting for functions after closures
            if (current == "});" || current == "}")
                && (next.starts_with("function ") || next.starts_with("async function "))
            {
                return true;
            }

            // Rule 18: After single-line function declarations `function foo() {}`
            // before var declarations
            if current.starts_with("function ")
                && current.ends_with('}')
                && is_var_declaration(next)
            {
                return true;
            }

            // Rule 19: After expression statements (;) before `throw` statements
            if !is_var_declaration(current)
                && !is_closing_brace(current)
                && current.ends_with(';')
                && next.starts_with("throw ")
            {
                return true;
            }

            // Rule 20: After object property with comma, before property starting with
            // tick/children/get/set (multi-line object members)
            if current.ends_with(',')
                && !is_closing_brace(current)
                && (next.starts_with("tick:")
                    || next.starts_with("children:")
                    || next.starts_with("title:")
                    || next.starts_with("reset:")
                    || (next.starts_with("children: (") && next.ends_with(" {"))
                    || (next.starts_with("tick: (") && next.ends_with(" {")))
            {
                return true;
            }

            // Rule 21: After expression statements (;) before comments (// or /*)
            if !is_var_declaration(current)
                && !is_closing_brace(current)
                && !current.starts_with("//")
                && !current.starts_with("/*")
                && current.ends_with(';')
                && (next.starts_with("//") || next.starts_with("/*") || next.starts_with("/**"))
            {
                return true;
            }
        }
    }

    false
}

/// Check if a line is a variable declaration
fn is_var_declaration(line: &str) -> bool {
    line.starts_with("var ") || line.starts_with("let ") || line.starts_with("const ")
}

/// Check if a line is a closing brace pattern (should not have blank line before it)
fn is_closing_brace(line: &str) -> bool {
    line == "}"
        || line == "};"
        || line == "});"
        || line == "},"
        || line == "}),"
        || line == "}));"
        || line == "}))"
        || line.starts_with("} else")
}

/// Check if a line is a statement (not a declaration)
fn is_statement(line: &str) -> bool {
    !line.starts_with("function ")
        && !line.starts_with("async function ")
        && !is_var_declaration(line)
        && !line.starts_with("import ")
        && !line.starts_with("export ")
        && !line.is_empty()
        && !line.starts_with("//")
        && !line.starts_with("/*")
        && line != "}"
        && line != "});"
        && !is_closing_brace(line)
}

/// Check if a line is a method definition in an object literal.
/// Matches patterns like `increment() {`, `foo_bar(arg) {`, `myMethod(a, b) {`
/// but NOT `$.foo(` or lines starting with keywords.
fn is_method_definition(line: &str) -> bool {
    // Must start with an identifier character (letter, _, $)
    let first = match line.chars().next() {
        Some(c) => c,
        None => return false,
    };
    if !first.is_alphabetic() && first != '_' && first != '$' {
        return false;
    }
    // Must contain `(` indicating a function call/definition
    if let Some(paren_pos) = line.find('(') {
        // The part before ( must be a valid identifier (no dots, no spaces before paren)
        let before_paren = &line[..paren_pos];
        // Must not be a known keyword/statement pattern
        if before_paren == "if"
            || before_paren == "for"
            || before_paren == "while"
            || before_paren == "switch"
            || before_paren == "return"
            || before_paren == "throw"
        {
            return false;
        }
        // All chars before paren should be identifier chars (alphanumeric, _, $)
        before_paren
            .chars()
            .all(|c| c.is_alphanumeric() || c == '_' || c == '$')
    } else {
        false
    }
}

/// Collapse single-statement if blocks to inline form.
///
/// OXC always adds braces around if bodies, but Svelte's esrap outputs
/// single-statement ifs without braces for `$$render` calls inside `$.if()` callbacks:
///   `if (condition) $$render(consequent);`
/// instead of:
///   `if (condition) {\n\t$$render(consequent);\n}`
///
/// This ONLY applies to `$$render()` calls, which is the pattern Svelte uses
/// inside `$.if()` callbacks. Other single-statement ifs keep their braces.
fn collapse_single_statement_ifs(code: String) -> String {
    // Quick check: this only collapses ifs with $$render calls
    if !code.contains("$$render(") {
        return code;
    }
    let lines: Vec<&str> = code.lines().collect();
    let mut result = String::with_capacity(code.len());
    let mut i = 0;

    while i < lines.len() {
        // First, try to match if/else pattern with $$render calls:
        // if (condition) {
        //     $$render(consequent);
        // } else {
        //     $$render(alternate, false);
        // }
        if i + 4 < lines.len() {
            let current = lines[i];
            let body1 = lines[i + 1];
            let else_line = lines[i + 2];
            let body2 = lines[i + 3];
            let closing = lines[i + 4];

            let current_trimmed = current.trim();
            let else_trimmed = else_line.trim();
            let closing_trimmed = closing.trim();
            let body1_trimmed = body1.trim();
            let body2_trimmed = body2.trim();

            if current_trimmed.starts_with("if (")
                && current_trimmed.ends_with(") {")
                && else_trimmed == "} else {"
                && closing_trimmed == "}"
                && body1_trimmed.starts_with("$$render(")
                && body2_trimmed.starts_with("$$render(")
            {
                let current_tabs = current.chars().take_while(|c| *c == '\t').count();
                let body1_tabs = body1.chars().take_while(|c| *c == '\t').count();
                let else_tabs = else_line.chars().take_while(|c| *c == '\t').count();
                let body2_tabs = body2.chars().take_while(|c| *c == '\t').count();
                let closing_tabs = closing.chars().take_while(|c| *c == '\t').count();

                if body1_tabs == current_tabs + 1
                    && else_tabs == current_tabs
                    && body2_tabs == current_tabs + 1
                    && closing_tabs == current_tabs
                {
                    let if_part = &current_trimmed[3..current_trimmed.len() - 2];

                    let indent_str: String = "\t".repeat(current_tabs);
                    result.push_str(&indent_str);
                    result.push_str("if ");
                    result.push_str(if_part);
                    result.push(' ');
                    result.push_str(body1_trimmed);
                    result.push_str(" else ");
                    result.push_str(body2_trimmed);
                    result.push('\n');
                    i += 5;
                    continue;
                }
            }
        }

        // Simple if pattern (no else) with $$render call:
        // if (condition) {
        //     $$render(consequent);
        // }
        if i + 2 < lines.len() {
            let current = lines[i];
            let body = lines[i + 1];
            let closing = lines[i + 2];

            let current_trimmed = current.trim();
            let closing_trimmed = closing.trim();
            let body_trimmed = body.trim();

            if current_trimmed.starts_with("if (")
                && current_trimmed.ends_with(") {")
                && closing_trimmed == "}"
                && body_trimmed.starts_with("$$render(")
            {
                let current_tabs = current.chars().take_while(|c| *c == '\t').count();
                let body_tabs = body.chars().take_while(|c| *c == '\t').count();
                let closing_tabs = closing.chars().take_while(|c| *c == '\t').count();

                if body_tabs == current_tabs + 1
                    && closing_tabs == current_tabs
                    // No else follows
                    && (i + 3 >= lines.len()
                        || (!lines[i + 3].trim().starts_with("else")
                            && !lines[i + 3].trim().starts_with("} else")))
                {
                    let if_part = &current_trimmed[3..current_trimmed.len() - 2];

                    let indent_str: String = "\t".repeat(current_tabs);
                    result.push_str(&indent_str);
                    result.push_str("if ");
                    result.push_str(if_part);
                    result.push(' ');
                    result.push_str(body_trimmed);
                    result.push('\n');
                    i += 3;
                    continue;
                }
            }
        }

        result.push_str(lines[i]);
        result.push('\n');
        i += 1;
    }

    result
}

/// Get the indentation level (number of tabs or equivalent spaces)
fn get_indent_level(line: &str) -> usize {
    let mut count = 0;
    for c in line.chars() {
        match c {
            '\t' => count += 1,
            ' ' => {
                // Count 2 spaces as 1 indent level
                count += 1;
                // Skip the potential second space
                break;
            }
            _ => break,
        }
    }
    count
}

/// Expand scientific notation in numeric literals back to decimal form.
///
/// OXC's codegen outputs numbers like `2e3` instead of `2000`.
/// This function expands them to match Svelte's esrap output.
///
/// Collapse short arrays from multi-line to single-line format.
///
/// oxc's codegen always formats arrays with multiple elements on separate lines.
/// This function collapses arrays that contain only simple literals (strings, numbers, BigInts)
/// to a single line format to match Svelte's esrap output.
///
/// Example:
/// ```js
/// // Input:
/// ['foo',
///     'bar',
///     'baz'
/// ]
/// // Output:
/// ['foo', 'bar', 'baz']
///
/// // Input:
/// [0,
///     1,
///     2
/// ]
/// // Output:
/// [0, 1, 2]
/// ```
fn collapse_short_arrays(code: String) -> String {
    static RE: LazyLock<Regex> = LazyLock::new(|| {
        let literal_pattern = r"(?:'[^']*'|-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?n?)";
        let pattern = format!(
            r"(?s)\[(\s*\n\t*{literal}(?:,\s*\n\t*{literal})*)\s*\n\t*\]",
            literal = literal_pattern
        );
        Regex::new(&pattern).unwrap()
    });

    let re = &*RE;

    let result = re.replace_all(&code, |caps: &regex::Captures| {
        // Extract the content between [ and ]
        let content = &caps[1];
        // Split by comma and newline, trim each element
        let elements: Vec<&str> = content
            .split(',')
            .map(|s| s.trim())
            .filter(|s| !s.is_empty())
            .collect();
        format!("[{}]", elements.join(", "))
    });

    result.into_owned()
}

/// Collapse short object literals from multi-line to single-line format.
///
/// OXC's codegen always formats objects with 2+ shorthand properties on separate lines.
/// This function collapses objects that contain only simple shorthand identifiers
/// to a single line format to match Svelte's esrap output.
///
/// Example:
/// ```js
/// // Input (OXC output):
/// var $$exports = {
///     one,
///     two
/// };
/// // Output (Svelte format):
/// var $$exports = { one, two };
///
/// // Also handles objects inside function calls:
/// // Input:
/// $.bind_props($$props, {
///     foo,
///     bar
/// });
/// // Output:
/// $.bind_props($$props, { foo, bar });
/// ```
///
/// Objects with getters, setters, or key-value pairs are NOT collapsed.
fn collapse_short_objects(code: String) -> String {
    let lines: Vec<&str> = code.lines().collect();
    let mut result = String::with_capacity(code.len());
    let mut i = 0;

    while i < lines.len() {
        let line = lines[i];
        let trimmed = line.trim();

        // Look for lines ending with `{` that start an object literal
        // Patterns: `var x = {`, `const x = {`, `let x = {`, `foo(bar, {`, etc.
        let is_object_start = trimmed.ends_with("= {")
            || trimmed.ends_with(": {")
            || trimmed.ends_with(", {")
            || trimmed.ends_with("({");

        if is_object_start {
            // Try to find matching closing brace
            let indent_level = line.len() - line.trim_start().len();
            let indent_str = &line[..indent_level];
            let inner_indent = if indent_level > 0 {
                format!("{}\t", indent_str)
            } else {
                "\t".to_string()
            };

            // Determine what closing brace patterns to look for based on opening context
            let is_fn_arg = trimmed.ends_with(", {") || trimmed.ends_with("({");

            // Collect all inner lines until we find the closing brace
            let mut properties: Vec<&str> = Vec::new();
            let mut j = i + 1;
            let mut all_simple = true;
            let mut found_close = false;

            while j < lines.len() {
                let inner_line = lines[j];
                let inner_trimmed = inner_line.trim();

                // Check if this is the closing brace at the correct indent level
                let is_close = if is_fn_arg {
                    // For function arguments: closing `});` or `}, ...)` or `}), true);` etc.
                    // at same indent level
                    (inner_trimmed == "});"
                        || inner_trimmed == "})"
                        || inner_trimmed == "}"
                        || inner_trimmed == "};"
                        || inner_trimmed == "},"
                        || inner_trimmed.starts_with("})")
                        || inner_trimmed.starts_with("},"))
                        && inner_line.starts_with(indent_str)
                        && (inner_line.len() - inner_line.trim_start().len()) == indent_level
                } else {
                    (inner_trimmed == "};" || inner_trimmed == "}" || inner_trimmed == "},")
                        && inner_line.starts_with(indent_str)
                        && (inner_line.len() - inner_line.trim_start().len()) == indent_level
                };

                if is_close {
                    found_close = true;
                    break;
                }

                // Check if this line is at the expected inner indent level
                if !inner_line.starts_with(&inner_indent) {
                    break;
                }

                // Check if property is simple enough to be collapsed to one line.
                // Allow:
                // - Shorthand identifiers: `foo,`
                // - Simple key-value pairs: `key: value,` (no nested objects/functions)
                // - Spread elements: `...obj,`
                // Disallow:
                // - Getters/setters: `get foo() {`
                // - Methods: `foo() {`
                // - Multi-line values (the value itself spans multiple lines)
                let prop = inner_trimmed.trim_end_matches(',');
                if prop.is_empty()
                    || prop.starts_with("get ")
                    || prop.starts_with("set ")
                    || prop.ends_with('{')
                    || prop.ends_with('}')
                {
                    all_simple = false;
                    break;
                }

                properties.push(prop);
                j += 1;
            }

            if found_close && all_simple && !properties.is_empty() {
                // Collapse to single line
                let closing_line = lines[j].trim();

                // Build the suffix from the closing line (everything after `}`)
                let suffix = closing_line.strip_prefix('}').unwrap_or("");

                // Get the opening part (everything before the `{`)
                let open_part = trimmed.trim_end_matches('{').trim_end();

                // Determine if the opening brace is directly preceded by `(`
                // e.g., `() => ({` should become `() => ({ ... })` not `() => ( { ... })`
                let brace_adjacent = trimmed.ends_with("({");

                // Calculate the resulting line length to avoid creating lines that are too long
                // esrap keeps objects multi-line when the single-line form would be too wide
                let collapsed = if brace_adjacent {
                    format!(
                        "{}{}{{ {} }}{}",
                        indent_str,
                        open_part,
                        properties.join(", "),
                        suffix
                    )
                } else {
                    format!(
                        "{}{} {{ {} }}{}",
                        indent_str,
                        open_part,
                        properties.join(", "),
                        suffix
                    )
                };

                // Only collapse if the result is reasonably short.
                // esrap uses a high threshold (~160 chars visual width) for deciding
                // whether to keep objects on one line.
                if collapsed.len() <= 160 {
                    result.push_str(&collapsed);
                    result.push('\n');
                    i = j + 1;
                    continue;
                }
            }
        }

        result.push_str(line);
        result.push('\n');
        i += 1;
    }

    // Remove potential trailing newline added by the loop
    if result.ends_with('\n') && !code.ends_with('\n') {
        result.pop();
    }

    result
}

/// JavaScript code generator.
struct JsCodegen {
    output: String,
    indent_level: usize,
    needs_semicolon: bool,
}

impl JsCodegen {
    fn new() -> Self {
        Self {
            output: String::with_capacity(8192),
            indent_level: 0,
            needs_semicolon: false,
        }
    }

    fn indent(&mut self) {
        for _ in 0..self.indent_level {
            self.output.push('\t');
        }
    }

    fn newline(&mut self) {
        self.output.push('\n');
    }

    fn emit_program(&mut self, program: &JsProgram) {
        for (i, stmt) in program.body.iter().enumerate() {
            if i > 0 {
                self.newline();
            }
            self.emit_statement(stmt);
        }
    }

    fn emit_statement(&mut self, stmt: &JsStatement) {
        self.indent();
        self.emit_statement_inner(stmt);
        if self.needs_semicolon {
            self.output.push(';');
            self.needs_semicolon = false;
        }
        self.newline();
    }

    fn emit_statement_inner(&mut self, stmt: &JsStatement) {
        match stmt {
            JsStatement::Import(import) => self.emit_import(import),
            JsStatement::ExportDefault(export) => self.emit_export_default(export),
            JsStatement::ExportNamed(export) => self.emit_export_named(export),
            JsStatement::VariableDeclaration(decl) => self.emit_variable_declaration(decl),
            JsStatement::FunctionDeclaration(decl) => self.emit_function_declaration(decl),
            JsStatement::Expression(expr_stmt) => {
                self.emit_expression(&expr_stmt.expression);
                self.needs_semicolon = true;
            }
            JsStatement::Return(ret) => {
                self.output.push_str("return");
                if let Some(ref arg) = ret.argument {
                    self.output.push(' ');
                    self.emit_expression(arg);
                }
                self.needs_semicolon = true;
            }
            JsStatement::If(if_stmt) => self.emit_if_statement(if_stmt),
            JsStatement::For(for_stmt) => self.emit_for_statement(for_stmt),
            JsStatement::ForOf(for_of) => self.emit_for_of_statement(for_of),
            JsStatement::While(while_stmt) => self.emit_while_statement(while_stmt),
            JsStatement::DoWhile(do_while) => self.emit_do_while_statement(do_while),
            JsStatement::Block(block) => self.emit_block_statement(block),
            JsStatement::Empty => self.needs_semicolon = true,
            JsStatement::Debugger => {
                self.output.push_str("debugger");
                self.needs_semicolon = true;
            }
            JsStatement::Labeled(labeled) => {
                self.output.push_str(&labeled.label);
                self.output.push_str(": ");
                self.emit_statement_inner(&labeled.body);
            }
            JsStatement::Break(label) => {
                self.output.push_str("break");
                if let Some(l) = label {
                    self.output.push(' ');
                    self.output.push_str(l);
                }
                self.needs_semicolon = true;
            }
            JsStatement::Continue(label) => {
                self.output.push_str("continue");
                if let Some(l) = label {
                    self.output.push(' ');
                    self.output.push_str(l);
                }
                self.needs_semicolon = true;
            }
            JsStatement::Throw(expr) => {
                self.output.push_str("throw ");
                self.emit_expression(expr);
                self.needs_semicolon = true;
            }
            JsStatement::Try(try_stmt) => self.emit_try_statement(try_stmt),
            JsStatement::Raw(code) => {
                // Output raw JavaScript code verbatim
                self.output.push_str(code);
                self.needs_semicolon = false; // Raw code handles its own semicolons
            }
        }
    }

    fn emit_import(&mut self, import: &JsImportDeclaration) {
        self.output.push_str("import ");

        let has_specifiers = !import.specifiers.is_empty()
            && !matches!(import.specifiers[0], JsImportSpecifier::SideEffect);

        if has_specifiers {
            let mut has_default = false;
            let mut named = Vec::new();
            let mut namespace = None;

            for spec in &import.specifiers {
                match spec {
                    JsImportSpecifier::Default(name) => {
                        has_default = true;
                        self.output.push_str(name);
                    }
                    JsImportSpecifier::Namespace(name) => {
                        namespace = Some(name.clone());
                    }
                    JsImportSpecifier::Named { imported, local } => {
                        named.push((imported.clone(), local.clone()));
                    }
                    JsImportSpecifier::SideEffect => {}
                }
            }

            if has_default && (namespace.is_some() || !named.is_empty()) {
                self.output.push_str(", ");
            }

            if let Some(ref ns) = namespace {
                self.output.push_str("* as ");
                self.output.push_str(ns);
            }

            if !named.is_empty() {
                if namespace.is_some() {
                    self.output.push_str(", ");
                }
                self.output.push_str("{ ");
                for (i, (imported, local)) in named.iter().enumerate() {
                    if i > 0 {
                        self.output.push_str(", ");
                    }
                    if imported == local {
                        self.output.push_str(local);
                    } else {
                        let _ = write!(self.output, "{} as {}", imported, local);
                    }
                }
                self.output.push_str(" }");
            }

            self.output.push_str(" from ");
        }

        self.output.push('\'');
        self.output.push_str(&import.source);
        self.output.push('\'');
        self.needs_semicolon = true;
    }

    fn emit_export_default(&mut self, export: &JsExportDefault) {
        self.output.push_str("export default ");
        match &export.declaration {
            JsExportDefaultDeclaration::Function(func) => {
                self.emit_function_declaration(func);
            }
            JsExportDefaultDeclaration::Expression(expr) => {
                self.emit_expression(expr);
                self.needs_semicolon = true;
            }
        }
    }

    fn emit_export_named(&mut self, export: &JsExportNamed) {
        self.output.push_str("export ");
        if let Some(ref decl) = export.declaration {
            self.emit_variable_declaration(decl);
        } else {
            self.output.push_str("{ ");
            for (i, spec) in export.specifiers.iter().enumerate() {
                if i > 0 {
                    self.output.push_str(", ");
                }
                if spec.local == spec.exported {
                    self.output.push_str(&spec.local);
                } else {
                    let _ = write!(self.output, "{} as {}", spec.local, spec.exported);
                }
            }
            self.output.push_str(" }");
            self.needs_semicolon = true;
        }
    }

    fn emit_variable_declaration(&mut self, decl: &JsVariableDeclaration) {
        self.output.push_str(&decl.kind.to_string());
        self.output.push(' ');

        for (i, declarator) in decl.declarations.iter().enumerate() {
            if i > 0 {
                self.output.push_str(", ");
            }
            self.emit_pattern(&declarator.id);
            if let Some(ref init) = declarator.init {
                self.output.push_str(" = ");
                self.emit_expression(init);
            }
        }
        self.needs_semicolon = true;
    }

    fn emit_function_declaration(&mut self, func: &JsFunctionDeclaration) {
        if func.is_async {
            self.output.push_str("async ");
        }
        self.output.push_str("function");
        if func.is_generator {
            self.output.push('*');
        }
        if let Some(ref id) = func.id {
            self.output.push(' ');
            self.output.push_str(id);
        }
        self.output.push('(');
        self.emit_params(&func.params);
        self.output.push_str(") ");
        self.emit_block_inline(&func.body);
    }

    fn emit_if_statement(&mut self, if_stmt: &JsIfStatement) {
        self.output.push_str("if (");
        self.emit_expression(&if_stmt.test);
        self.output.push_str(") ");
        self.emit_statement_as_block(&if_stmt.consequent);

        if let Some(ref alt) = if_stmt.alternate {
            self.output.push_str(" else ");
            if matches!(alt.as_ref(), JsStatement::If(_)) {
                self.emit_statement_inner(alt);
            } else {
                self.emit_statement_as_block(alt);
            }
        }
    }

    fn emit_for_statement(&mut self, for_stmt: &JsForStatement) {
        self.output.push_str("for (");
        if let Some(ref init) = for_stmt.init {
            match init {
                JsForInit::Variable(decl) => {
                    self.output.push_str(&decl.kind.to_string());
                    self.output.push(' ');
                    for (i, declarator) in decl.declarations.iter().enumerate() {
                        if i > 0 {
                            self.output.push_str(", ");
                        }
                        self.emit_pattern(&declarator.id);
                        if let Some(ref init_expr) = declarator.init {
                            self.output.push_str(" = ");
                            self.emit_expression(init_expr);
                        }
                    }
                }
                JsForInit::Expression(expr) => self.emit_expression(expr),
            }
        }
        self.output.push(';');
        if let Some(ref test) = for_stmt.test {
            self.output.push(' ');
            self.emit_expression(test);
        }
        self.output.push(';');
        if let Some(ref update) = for_stmt.update {
            self.output.push(' ');
            self.emit_expression(update);
        }
        self.output.push_str(") ");
        self.emit_statement_as_block(&for_stmt.body);
    }

    fn emit_for_of_statement(&mut self, for_of: &JsForOfStatement) {
        self.output.push_str("for ");
        if for_of.is_await {
            self.output.push_str("await ");
        }
        self.output.push('(');
        match &for_of.left {
            JsForOfLeft::Variable(decl) => {
                self.output.push_str(&decl.kind.to_string());
                self.output.push(' ');
                if let Some(declarator) = decl.declarations.first() {
                    self.emit_pattern(&declarator.id);
                }
            }
            JsForOfLeft::Pattern(pattern) => self.emit_pattern(pattern),
        }
        self.output.push_str(" of ");
        self.emit_expression(&for_of.right);
        self.output.push_str(") ");
        self.emit_statement_as_block(&for_of.body);
    }

    fn emit_while_statement(&mut self, while_stmt: &JsWhileStatement) {
        self.output.push_str("while (");
        self.emit_expression(&while_stmt.test);
        self.output.push_str(") ");
        self.emit_statement_as_block(&while_stmt.body);
    }

    fn emit_do_while_statement(&mut self, do_while: &JsDoWhileStatement) {
        self.output.push_str("do ");
        self.emit_statement_as_block(&do_while.body);
        self.output.push_str(" while (");
        self.emit_expression(&do_while.test);
        self.output.push(')');
        self.needs_semicolon = true;
    }

    fn emit_block_statement(&mut self, block: &JsBlockStatement) {
        self.output.push('{');
        self.newline();
        self.indent_level += 1;
        for stmt in &block.body {
            self.emit_statement(stmt);
        }
        self.indent_level -= 1;
        self.indent();
        self.output.push('}');
    }

    fn emit_block_inline(&mut self, block: &JsBlockStatement) {
        self.output.push('{');
        if !block.body.is_empty() {
            self.newline();
            self.indent_level += 1;
            for stmt in &block.body {
                self.emit_statement(stmt);
            }
            self.indent_level -= 1;
            self.indent();
        }
        self.output.push('}');
    }

    fn emit_statement_as_block(&mut self, stmt: &JsStatement) {
        match stmt {
            JsStatement::Block(block) => self.emit_block_inline(block),
            _ => {
                self.output.push('{');
                self.newline();
                self.indent_level += 1;
                self.emit_statement(stmt);
                self.indent_level -= 1;
                self.indent();
                self.output.push('}');
            }
        }
    }

    fn emit_try_statement(&mut self, try_stmt: &JsTryStatement) {
        self.output.push_str("try ");
        self.emit_block_inline(&try_stmt.block);

        if let Some(ref handler) = try_stmt.handler {
            self.output.push_str(" catch");
            if let Some(ref param) = handler.param {
                self.output.push_str(" (");
                self.emit_pattern(param);
                self.output.push(')');
            }
            self.output.push(' ');
            self.emit_block_inline(&handler.body);
        }

        if let Some(ref finalizer) = try_stmt.finalizer {
            self.output.push_str(" finally ");
            self.emit_block_inline(finalizer);
        }
    }

    fn emit_expression(&mut self, expr: &JsExpr) {
        match expr {
            JsExpr::Identifier(name) => self.output.push_str(name),
            JsExpr::Literal(lit) => self.emit_literal(lit),
            JsExpr::TemplateLiteral(template) => self.emit_template_literal(template),
            JsExpr::TaggedTemplate(tagged) => self.emit_tagged_template(tagged),
            JsExpr::Array(arr) => self.emit_array_expression(arr),
            JsExpr::Object(obj) => self.emit_object_expression(obj),
            JsExpr::Function(func) => self.emit_function_expression(func),
            JsExpr::Arrow(arrow) => self.emit_arrow_function(arrow),
            JsExpr::Call(call) => self.emit_call_expression(call),
            JsExpr::New(new_expr) => self.emit_new_expression(new_expr),
            JsExpr::Member(member) => self.emit_member_expression(member),
            JsExpr::Binary(binary) => self.emit_binary_expression(binary),
            JsExpr::Logical(logical) => self.emit_logical_expression(logical),
            JsExpr::Unary(unary) => self.emit_unary_expression(unary),
            JsExpr::Update(update) => self.emit_update_expression(update),
            JsExpr::Assignment(assignment) => self.emit_assignment_expression(assignment),
            JsExpr::Conditional(cond) => self.emit_conditional_expression(cond),
            JsExpr::Sequence(seq) => self.emit_sequence_expression(seq),
            JsExpr::Spread(inner) => {
                self.output.push_str("...");
                self.emit_expression(inner);
            }
            JsExpr::This => self.output.push_str("this"),
            JsExpr::Await(inner) => {
                self.output.push_str("await ");
                self.emit_expression(inner);
            }
            JsExpr::Yield(yield_expr) => {
                self.output.push_str("yield");
                if yield_expr.delegate {
                    self.output.push('*');
                }
                if let Some(ref arg) = yield_expr.argument {
                    self.output.push(' ');
                    self.emit_expression(arg);
                }
            }
            JsExpr::Class(class) => self.emit_class_expression(class),
            JsExpr::Chain(chain) => self.emit_expression(&chain.expression),
            JsExpr::Void(inner) => {
                self.output.push_str("void ");
                self.emit_expression(inner);
            }
            JsExpr::Raw(code) => {
                // Emit raw JavaScript code as-is
                self.output.push_str(code);
            }
        }
    }

    fn emit_literal(&mut self, lit: &JsLiteral) {
        match lit {
            JsLiteral::String(s) => {
                // Use single quotes for generated string literals.
                // This matches OXC's output format (single_quote: true) and
                // ensures that only user source code strings (which come through
                // Raw() statements with their original quotes) will have double quotes.
                self.output.push('\'');
                self.output.push_str(&escape_string_single(s));
                self.output.push('\'');
            }
            JsLiteral::Number(n) => {
                let _ = write!(self.output, "{}", n);
            }
            JsLiteral::Boolean(b) => {
                self.output.push_str(if *b { "true" } else { "false" });
            }
            JsLiteral::Null => self.output.push_str("null"),
            JsLiteral::Undefined => self.output.push_str("undefined"),
            JsLiteral::Regex { pattern, flags } => {
                let _ = write!(self.output, "/{}/{}", pattern, flags);
            }
        }
    }

    fn emit_template_literal(&mut self, template: &JsTemplateLiteral) {
        self.output.push('`');
        for (i, quasi) in template.quasis.iter().enumerate() {
            self.output.push_str(&quasi.raw);
            if i < template.expressions.len() {
                self.output.push_str("${");
                self.emit_expression(&template.expressions[i]);
                self.output.push('}');
            }
        }
        self.output.push('`');
    }

    fn emit_tagged_template(&mut self, tagged: &JsTaggedTemplate) {
        self.emit_expression(&tagged.tag);
        self.emit_template_literal(&tagged.quasi);
    }

    fn emit_array_expression(&mut self, arr: &JsArrayExpression) {
        self.output.push('[');
        for (i, elem) in arr.elements.iter().enumerate() {
            if i > 0 {
                self.output.push_str(", ");
            }
            if let Some(e) = elem {
                self.emit_expression(e);
            }
        }
        self.output.push(']');
    }

    fn emit_object_expression(&mut self, obj: &JsObjectExpression) {
        if obj.properties.is_empty() {
            self.output.push_str("{}");
            return;
        }

        self.output.push_str("{ ");
        for (i, member) in obj.properties.iter().enumerate() {
            if i > 0 {
                self.output.push_str(", ");
            }
            self.emit_object_member(member);
        }
        self.output.push_str(" }");
    }

    fn emit_object_member(&mut self, member: &JsObjectMember) {
        match member {
            JsObjectMember::Property(prop) => {
                // Auto-detect shorthand: Init property where key identifier
                // matches value identifier (mirrors esrap/astring behavior).
                let auto_shorthand = !prop.computed
                    && matches!(prop.kind, JsPropertyKind::Init)
                    && matches!(
                        (&prop.key, prop.value.as_ref()),
                        (JsPropertyKey::Identifier(k), JsExpr::Identifier(v)) if k == v
                    );

                if (prop.shorthand || auto_shorthand)
                    && let JsPropertyKey::Identifier(name) = &prop.key
                {
                    self.output.push_str(name);
                    return;
                }

                match prop.kind {
                    JsPropertyKind::Get => self.output.push_str("get "),
                    JsPropertyKind::Set => self.output.push_str("set "),
                    JsPropertyKind::Init => {}
                }

                if prop.computed {
                    self.output.push('[');
                }
                self.emit_property_key(&prop.key);
                if prop.computed {
                    self.output.push(']');
                }

                // Method shorthand: name(params) { body }
                if prop.method {
                    if let JsExpr::Function(func) = prop.value.as_ref() {
                        self.output.push('(');
                        self.emit_params(&func.params);
                        self.output.push_str(") ");
                        self.emit_block_inline(&func.body);
                    } else {
                        // Fallback: emit as normal property
                        self.output.push_str(": ");
                        self.emit_expression(&prop.value);
                    }
                } else {
                    match prop.kind {
                        JsPropertyKind::Get | JsPropertyKind::Set => {
                            if let JsExpr::Function(func) = prop.value.as_ref() {
                                self.output.push('(');
                                self.emit_params(&func.params);
                                self.output.push_str(") ");
                                self.emit_block_inline(&func.body);
                            }
                        }
                        JsPropertyKind::Init => {
                            self.output.push_str(": ");
                            self.emit_expression(&prop.value);
                        }
                    }
                }
            }
            JsObjectMember::SpreadElement(expr) => {
                self.output.push_str("...");
                self.emit_expression(expr);
            }
        }
    }

    fn emit_property_key(&mut self, key: &JsPropertyKey) {
        match key {
            JsPropertyKey::Identifier(name) => self.output.push_str(name),
            JsPropertyKey::Literal(lit) => self.emit_literal(lit),
            JsPropertyKey::Computed(expr) => self.emit_expression(expr),
        }
    }

    fn emit_function_expression(&mut self, func: &JsFunctionExpression) {
        if func.is_async {
            self.output.push_str("async ");
        }
        self.output.push_str("function");
        if func.is_generator {
            self.output.push('*');
        }
        if let Some(ref id) = func.id {
            self.output.push(' ');
            self.output.push_str(id);
        }
        // Add a space before '(' for anonymous function expressions to match
        // the official Svelte compiler output: `function (...$$args)` not `function(...$$args)`
        if func.id.is_none() && !func.is_generator {
            self.output.push(' ');
        }
        self.output.push('(');
        self.emit_params(&func.params);
        self.output.push_str(") ");
        self.emit_block_inline(&func.body);
    }

    fn emit_arrow_function(&mut self, arrow: &JsArrowFunction) {
        if arrow.is_async {
            self.output.push_str("async ");
        }

        if arrow.params.len() == 1 && matches!(&arrow.params[0], JsPattern::Identifier(_)) {
            self.emit_pattern(&arrow.params[0]);
        } else {
            self.output.push('(');
            self.emit_params(&arrow.params);
            self.output.push(')');
        }

        self.output.push_str(" => ");

        match &arrow.body {
            JsArrowBody::Expression(expr) => {
                // Wrap object literals in parentheses to avoid being parsed as block
                // statements. Also wrap assignment expressions to avoid ambiguity when
                // the LHS starts with `{` (object destructuring pattern).
                let needs_parens = matches!(expr.as_ref(), JsExpr::Object(_))
                    || matches!(expr.as_ref(), JsExpr::Assignment(a)
                        if matches!(a.left.as_ref(), JsExpr::Raw(s) if s.starts_with('{')));
                if needs_parens {
                    self.output.push('(');
                    self.emit_expression(expr);
                    self.output.push(')');
                } else {
                    self.emit_expression(expr);
                }
            }
            JsArrowBody::Block(block) => self.emit_block_inline(block),
        }
    }

    fn emit_call_expression(&mut self, call: &JsCallExpression) {
        // Need parentheses for callees that have lower precedence than function calls:
        // - Arrow functions: (() => x)()
        // - Function expressions: (function() {})()
        // - Await expressions: (await x)()
        // - Logical expressions: (a || b)()
        // - Binary expressions: (a + b)()
        // - Conditional expressions: (a ? b : c)()
        // - Assignment expressions: (a = b)()
        // - Sequence expressions: (a, b)()
        let needs_parens = matches!(
            call.callee.as_ref(),
            JsExpr::Arrow(_)
                | JsExpr::Function(_)
                | JsExpr::Await(_)
                | JsExpr::Logical(_)
                | JsExpr::Binary(_)
                | JsExpr::Conditional(_)
                | JsExpr::Assignment(_)
                | JsExpr::Sequence(_)
        );
        if needs_parens {
            self.output.push('(');
        }
        self.emit_expression(&call.callee);
        if needs_parens {
            self.output.push(')');
        }
        if call.optional {
            self.output.push_str("?.");
        }
        self.output.push('(');
        for (i, arg) in call.arguments.iter().enumerate() {
            if i > 0 {
                self.output.push_str(", ");
            }
            self.emit_expression(arg);
        }
        self.output.push(')');
    }

    fn emit_new_expression(&mut self, new_expr: &JsNewExpression) {
        self.output.push_str("new ");
        self.emit_expression(&new_expr.callee);
        self.output.push('(');
        for (i, arg) in new_expr.arguments.iter().enumerate() {
            if i > 0 {
                self.output.push_str(", ");
            }
            self.emit_expression(arg);
        }
        self.output.push(')');
    }

    fn emit_member_expression(&mut self, member: &JsMemberExpression) {
        // Add parentheses around the object when it has lower precedence than member access.
        // Member access (.) has very high precedence (18), so most expression types
        // with lower precedence need parentheses when used as the object.
        let needs_parens = matches!(
            member.object.as_ref(),
            JsExpr::Literal(JsLiteral::Number(_))
                | JsExpr::Literal(JsLiteral::String(_))
                | JsExpr::Binary(_)
                | JsExpr::Unary(_)
                | JsExpr::Conditional(_)
                | JsExpr::Assignment(_)
                | JsExpr::Sequence(_)
                | JsExpr::Logical(_)
        );
        if needs_parens {
            self.output.push('(');
        }
        self.emit_expression(&member.object);
        if needs_parens {
            self.output.push(')');
        }

        if member.optional {
            self.output.push_str("?.");
        }

        if member.computed {
            self.output.push('[');
            match &member.property {
                JsMemberProperty::Expression(expr) => self.emit_expression(expr),
                JsMemberProperty::Identifier(name) => {
                    self.output.push('\'');
                    self.output.push_str(name);
                    self.output.push('\'');
                }
                JsMemberProperty::PrivateIdentifier(name) => {
                    self.output.push('#');
                    self.output.push_str(name);
                }
            }
            self.output.push(']');
        } else {
            if !member.optional {
                self.output.push('.');
            }
            match &member.property {
                JsMemberProperty::Identifier(name) => self.output.push_str(name),
                JsMemberProperty::PrivateIdentifier(name) => {
                    self.output.push('#');
                    self.output.push_str(name);
                }
                JsMemberProperty::Expression(expr) => self.emit_expression(expr),
            }
        }
    }

    fn emit_binary_expression(&mut self, binary: &JsBinaryExpression) {
        self.emit_expression_with_parens(&binary.left, Some(&binary.operator));
        let _ = write!(self.output, " {} ", binary.operator);
        self.emit_expression_with_parens(&binary.right, Some(&binary.operator));
    }

    fn emit_logical_expression(&mut self, logical: &JsLogicalExpression) {
        // Check if the left operand needs parentheses
        let left_needs_parens = self.logical_operand_needs_parens(&logical.left, &logical.operator);
        if left_needs_parens {
            self.output.push('(');
        }
        self.emit_expression(&logical.left);
        if left_needs_parens {
            self.output.push(')');
        }
        let _ = write!(self.output, " {} ", logical.operator);
        // Check if the right operand needs parentheses
        let right_needs_parens =
            self.logical_operand_needs_parens(&logical.right, &logical.operator);
        if right_needs_parens {
            self.output.push('(');
        }
        self.emit_expression(&logical.right);
        if right_needs_parens {
            self.output.push(')');
        }
    }

    /// Check if an operand of a logical expression needs parentheses.
    /// JavaScript requires parentheses when mixing `??` with `||` or `&&`.
    /// It also requires them for assignment and conditional sub-expressions.
    fn logical_operand_needs_parens(&self, operand: &JsExpr, parent_op: &JsLogicalOp) -> bool {
        match operand {
            // Assignment and conditional expressions always need parens inside logical
            JsExpr::Assignment(_) | JsExpr::Conditional(_) => true,
            // Mixing ?? with || or && is a syntax error in JS; parentheses are required
            JsExpr::Logical(inner) => {
                let is_parent_nullish = matches!(parent_op, JsLogicalOp::NullishCoalescing);
                let is_inner_nullish = matches!(inner.operator, JsLogicalOp::NullishCoalescing);
                // If one is ?? and the other is ||/&&, they cannot be mixed
                is_parent_nullish != is_inner_nullish
            }
            _ => false,
        }
    }

    fn emit_unary_expression(&mut self, unary: &JsUnaryExpression) {
        let op_str = unary.operator.to_string();
        if unary.prefix {
            self.output.push_str(&op_str);
            if matches!(
                unary.operator,
                JsUnaryOp::TypeOf | JsUnaryOp::Void | JsUnaryOp::Delete
            ) {
                self.output.push(' ');
            }
            self.emit_expression(&unary.argument);
        } else {
            self.emit_expression(&unary.argument);
            self.output.push_str(&op_str);
        }
    }

    fn emit_update_expression(&mut self, update: &JsUpdateExpression) {
        if update.prefix {
            self.output.push_str(&update.operator.to_string());
            self.emit_expression(&update.argument);
        } else {
            self.emit_expression(&update.argument);
            self.output.push_str(&update.operator.to_string());
        }
    }

    fn emit_assignment_expression(&mut self, assignment: &JsAssignmentExpression) {
        self.emit_expression(&assignment.left);
        let _ = write!(self.output, " {} ", assignment.operator);
        self.emit_expression(&assignment.right);
    }

    fn emit_conditional_expression(&mut self, cond: &JsConditionalExpression) {
        self.emit_expression(&cond.test);
        self.output.push_str(" ? ");
        self.emit_expression(&cond.consequent);
        self.output.push_str(" : ");
        self.emit_expression(&cond.alternate);
    }

    fn emit_sequence_expression(&mut self, seq: &JsSequenceExpression) {
        self.output.push('(');
        for (i, expr) in seq.expressions.iter().enumerate() {
            if i > 0 {
                self.output.push_str(", ");
            }
            self.emit_expression(expr);
        }
        self.output.push(')');
    }

    fn emit_class_expression(&mut self, class: &JsClassExpression) {
        self.output.push_str("class");
        if let Some(ref id) = class.id {
            self.output.push(' ');
            self.output.push_str(id);
        }
        if let Some(ref super_class) = class.super_class {
            self.output.push_str(" extends ");
            self.emit_expression(super_class);
        }
        self.output.push_str(" {");
        // TODO: emit class body
        self.output.push('}');
    }

    fn emit_expression_with_parens(&mut self, expr: &JsExpr, _parent_op: Option<&JsBinaryOp>) {
        let needs_parens = matches!(
            expr,
            JsExpr::Binary(_) | JsExpr::Conditional(_) | JsExpr::Assignment(_)
        );
        if needs_parens {
            self.output.push('(');
        }
        self.emit_expression(expr);
        if needs_parens {
            self.output.push(')');
        }
    }

    fn emit_params(&mut self, params: &[JsPattern]) {
        for (i, param) in params.iter().enumerate() {
            if i > 0 {
                self.output.push_str(", ");
            }
            self.emit_pattern(param);
        }
    }

    fn emit_pattern(&mut self, pattern: &JsPattern) {
        match pattern {
            JsPattern::Identifier(name) => self.output.push_str(name),
            JsPattern::Array(arr) => {
                self.output.push('[');
                for (i, elem) in arr.elements.iter().enumerate() {
                    if i > 0 {
                        self.output.push_str(", ");
                    }
                    if let Some(p) = elem {
                        self.emit_pattern(p);
                    }
                }
                self.output.push(']');
            }
            JsPattern::Object(obj) => {
                self.output.push_str("{ ");
                for (i, prop) in obj.properties.iter().enumerate() {
                    if i > 0 {
                        self.output.push_str(", ");
                    }
                    match prop {
                        JsObjectPatternProperty::Property {
                            key,
                            value,
                            shorthand,
                            computed,
                        } => {
                            if *shorthand {
                                self.emit_pattern(value);
                            } else {
                                if *computed {
                                    self.output.push('[');
                                }
                                self.emit_property_key(key);
                                if *computed {
                                    self.output.push(']');
                                }
                                self.output.push_str(": ");
                                self.emit_pattern(value);
                            }
                        }
                        JsObjectPatternProperty::Rest(p) => {
                            self.output.push_str("...");
                            self.emit_pattern(p);
                        }
                    }
                }
                self.output.push_str(" }");
            }
            JsPattern::Rest(inner) => {
                self.output.push_str("...");
                self.emit_pattern(inner);
            }
            JsPattern::Assignment(assign) => {
                self.emit_pattern(&assign.left);
                self.output.push_str(" = ");
                self.emit_expression(&assign.right);
            }
        }
    }
}

/// Escape special characters in a single-quoted string literal.
fn escape_string_single(s: &str) -> std::borrow::Cow<'_, str> {
    // Fast path: check if any escaping is needed
    if !s
        .bytes()
        .any(|b| b == b'\'' || b == b'\\' || b == b'\n' || b == b'\r')
    {
        return std::borrow::Cow::Borrowed(s);
    }
    // Slow path: escape needed
    let mut result = String::with_capacity(s.len());
    for c in s.chars() {
        match c {
            '\'' => result.push_str("\\'"),
            '\\' => result.push_str("\\\\"),
            '\n' => result.push_str("\\n"),
            '\r' => result.push_str("\\r"),
            // Tab characters are kept as literal tabs to match the official
            // Svelte compiler's esrap codegen output.
            _ => result.push(c),
        }
    }
    std::borrow::Cow::Owned(result)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::compiler::phases::phase3_transform::js_ast::builders::*;

    #[test]
    fn test_simple_program() {
        let prog = program(vec![
            import_namespace("$", "svelte/internal/client"),
            var_decl("root", Some(svelte_from_html("<h1>Hello</h1>", None))),
            export_default_function(
                "Test",
                vec![id_pattern("$$anchor")],
                vec![
                    var_decl("h1", Some(call(id("root"), vec![]))),
                    stmt(svelte_append(id("$$anchor"), id("h1"))),
                ],
            ),
        ]);

        let code = generate(&prog).unwrap();
        println!("{}", code);
        assert!(code.contains("import * as $ from"));
        assert!(code.contains("$.from_html"));
        assert!(code.contains("export default function Test"));
    }

    #[test]
    fn test_arrow_function() {
        let prog = program(vec![const_decl(
            "add",
            arrow(
                vec![id_pattern("a"), id_pattern("b")],
                binary(JsBinaryOp::Add, id("a"), id("b")),
            ),
        )]);

        let code = generate(&prog).unwrap();
        println!("{}", code);
        assert!(code.contains("const add = (a, b) => a + b"));
    }

    #[test]
    fn test_template_literal() {
        let prog = program(vec![const_decl(
            "msg",
            template(
                vec![quasi("Hello, ", false), quasi("!", true)],
                vec![id("name")],
            ),
        )]);

        let code = generate(&prog).unwrap();
        println!("{}", code);
        assert!(code.contains("`Hello, ${name}!`"));
    }

    #[test]
    fn test_apostrophe_escaping() {
        // Test that apostrophes are properly escaped when using single quotes
        let prog = program(vec![const_decl("msg", string("I don't need this"))]);

        let code = generate(&prog).unwrap();
        println!("Generated code: {}", code);
        // oxc codegen with single_quote: true should escape apostrophes
        // Either it uses double quotes OR escapes the apostrophe
        assert!(
            code.contains(r#"'I don\'t need this'"#) || code.contains(r#""I don't need this""#),
            "Apostrophe should be escaped or double quotes should be used: {}",
            code
        );
    }

    #[test]
    fn test_collapse_short_arrays_strings() {
        // Test that string arrays are collapsed
        let input = "const arr = [\n\t'a',\n\t'b',\n\t'c'\n];".to_string();
        let result = collapse_short_arrays(input);
        assert_eq!(result, "const arr = ['a', 'b', 'c'];");
    }

    #[test]
    fn test_collapse_short_arrays_numbers() {
        // Test that numeric arrays are collapsed
        let input = "const arr = [\n\t0,\n\t1,\n\t2\n];".to_string();
        let result = collapse_short_arrays(input);
        assert_eq!(result, "const arr = [0, 1, 2];");
    }

    #[test]
    fn test_collapse_short_arrays_decimals() {
        // Test that decimal arrays are collapsed
        let input = "const arr = [\n\t1.5,\n\t2.7,\n\t3.14\n];".to_string();
        let result = collapse_short_arrays(input);
        assert_eq!(result, "const arr = [1.5, 2.7, 3.14];");
    }

    #[test]
    fn test_collapse_short_arrays_bigint() {
        // Test that BigInt arrays are collapsed
        let input = "const arr = [\n\t0n,\n\t1n,\n\t2n\n];".to_string();
        let result = collapse_short_arrays(input);
        assert_eq!(result, "const arr = [0n, 1n, 2n];");
    }

    #[test]
    fn test_collapse_short_arrays_negative_numbers() {
        // Test that negative number arrays are collapsed
        let input = "const arr = [\n\t-1,\n\t-2,\n\t-3\n];".to_string();
        let result = collapse_short_arrays(input);
        assert_eq!(result, "const arr = [-1, -2, -3];");
    }

    #[test]
    fn test_arrow_function_with_object_literal() {
        // Test that arrow functions with object literal bodies are wrapped in parentheses
        let obj = object(vec![prop("value", number(1.0))]);
        let arrow_fn = arrow(vec![], obj);
        let prog = program(vec![const_decl("fn", arrow_fn)]);

        let code = generate(&prog).unwrap();
        println!("Generated code: {}", code);
        assert!(
            code.contains("() => ({ value: 1 })") || code.contains("() => ({value: 1})"),
            "Object literal in arrow function should be wrapped in parentheses: {}",
            code
        );
    }

    #[test]
    fn test_arrow_function_with_getter_setter_object() {
        // Test that arrow functions returning objects with getters/setters work correctly
        // This mirrors the `derived-proxy` test case:
        // $derived({ get value() { return count * 2}, set value(c) { count = c / 2 } })

        let getter = JsObjectMember::Property(JsProperty {
            key: JsPropertyKey::Identifier("value".to_string()),
            value: Box::new(JsExpr::Function(JsFunctionExpression {
                id: None,
                params: vec![],
                body: JsBlockStatement::with_body(vec![JsStatement::Return(JsReturnStatement {
                    argument: Some(Box::new(binary(JsBinaryOp::Mul, id("count"), number(2.0)))),
                })]),
                is_async: false,
                is_generator: false,
            })),
            kind: JsPropertyKind::Get,
            computed: false,
            shorthand: false,
            method: false,
        });

        let setter = JsObjectMember::Property(JsProperty {
            key: JsPropertyKey::Identifier("value".to_string()),
            value: Box::new(JsExpr::Function(JsFunctionExpression {
                id: None,
                params: vec![id_pattern("c")],
                body: JsBlockStatement::with_body(vec![JsStatement::Expression(
                    JsExpressionStatement {
                        expression: Box::new(JsExpr::Assignment(JsAssignmentExpression {
                            operator: JsAssignmentOp::Assign,
                            left: Box::new(id("count")),
                            right: Box::new(binary(JsBinaryOp::Div, id("c"), number(2.0))),
                        })),
                    },
                )]),
                is_async: false,
                is_generator: false,
            })),
            kind: JsPropertyKind::Set,
            computed: false,
            shorthand: false,
            method: false,
        });

        let obj = JsExpr::Object(JsObjectExpression {
            properties: vec![getter, setter],
        });

        let arrow_fn = arrow(vec![], obj);
        let prog = program(vec![const_decl(
            "double",
            call(
                JsExpr::Member(JsMemberExpression {
                    object: Box::new(id("$")),
                    property: JsMemberProperty::Identifier("derived".to_string()),
                    computed: false,
                    optional: false,
                }),
                vec![arrow_fn],
            ),
        )]);

        let code = generate(&prog).unwrap();
        println!("Generated code: {}", code);

        // The arrow function body should be wrapped in parentheses
        assert!(
            code.contains("() => ({") || code.contains("()=>({"),
            "Object literal with getters in arrow function should be wrapped in parentheses: {}",
            code
        );
    }

    #[test]
    fn test_collapse_short_objects_full_program() {
        // Test with a realistic full program like export-function-hoisting
        let input = r#"import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/legacy';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor, $$props) {
	$.push($$props, false);

	function one() {
		two();
	}

	function two() {
		return one();
	}

	var $$exports = { one, two };

	$.next();

	var text = $.text('Compile plz');

	$.append($$anchor, text);
	$.bind_prop($$props, 'one', one);
	$.bind_prop($$props, 'two', two);

	return $.pop($$exports);
}"#;
        let result = normalize_js(input).unwrap();
        eprintln!("Full program result:\n{}", result);
        assert!(
            result.contains("var $$exports = { one, two };"),
            "Full program should have single-line $$exports: {:?}",
            result
        );
    }

    #[test]
    fn test_collapse_short_objects() {
        // Test that short object shorthand properties are collapsed to single line
        let result = normalize_js("var $$exports = { one, two };").unwrap();
        assert!(
            result.contains("var $$exports = { one, two };"),
            "Two shorthand props should stay on one line: {:?}",
            result
        );

        let result = normalize_js("var $$exports = { one };").unwrap();
        assert!(
            result.contains("var $$exports = { one };"),
            "Single shorthand prop should stay on one line: {:?}",
            result
        );

        let result = normalize_js("var $$exports = { one, two, three };").unwrap();
        assert!(
            result.contains("var $$exports = { one, two, three };"),
            "Three shorthand props should stay on one line: {:?}",
            result
        );

        let result = normalize_js("function f() {\n\tvar $$exports = { one, two };\n}").unwrap();
        assert!(
            result.contains("var $$exports = { one, two };"),
            "Shorthand props inside function should stay on one line: {:?}",
            result
        );
    }

    #[test]
    fn test_normalize_js_preserves_tabs() {
        // Test that normalize_js preserves actual tab characters for indentation
        let input = "function test() {\n\tvar x = 1;\n}";
        let result = normalize_js(input).unwrap();

        println!("Input: {:?}", input);
        println!("Output: {:?}", result);

        // Check that the output has a real tab character (0x09), not backslash-t
        let has_real_tab = result.chars().any(|c| c == '\t');
        let has_literal_backslash_t = result.contains(r"\t");

        println!("Has real tab: {}", has_real_tab);
        println!("Has literal backslash-t: {}", has_literal_backslash_t);

        assert!(has_real_tab, "Output should contain real tab characters");
        assert!(
            !has_literal_backslash_t,
            "Output should not contain literal \\t"
        );
    }

    #[test]
    fn test_oxc_scientific_notation_expanded() {
        // OXC converts round numbers to scientific notation, verify we expand them back
        let cases = vec![
            ("var x = 2000;", "2000"),
            ("var x = 1000;", "1000"),
            ("var x = 10000;", "10000"),
            ("var x = 100000;", "100000"),
            ("var x = 1000000;", "1000000"),
        ];
        for (input, expected_num) in cases {
            let result = normalize_js(input).unwrap();
            let expected = format!("var x = {};", expected_num);
            assert_eq!(
                result, expected,
                "Scientific notation should be expanded for: {}",
                input
            );
        }
    }

    #[test]
    fn test_expand_scientific_notation_function() {
        // Test scientific notation expansion via the combined pass
        let f = apply_simple_replacements_leading_zeros_and_scientific;
        assert_eq!(f("2e3".to_string()), "2000");
        assert_eq!(f("1e4".to_string()), "10000");
        assert_eq!(f("1e6".to_string()), "1000000");
        assert_eq!(f("x = 2e3;".to_string()), "x = 2000;");
        assert_eq!(f("2.5e3".to_string()), "2500");
        // Should not match inside identifiers
        assert_eq!(f("let e3 = 5;".to_string()), "let e3 = 5;");
        // Should preserve negative exponents (leave as-is, OXC doesn't produce these)
        assert_eq!(f("1e-3".to_string()), "1e-3");
    }

    #[test]
    fn test_getter_object_formatting() {
        // Test that objects with getter properties are formatted on multiple lines
        // (Svelte's esrap format), not collapsed to single line
        let input = "Task(node, { get prop() {\n\treturn val;\n} });";
        let result = normalize_js(input).unwrap();
        eprintln!("Getter object:\n{}", result);
        assert!(
            result.contains("Task(node, {\n\tget prop()"),
            "Object with getter should be formatted on multiple lines: {:?}",
            result
        );
        assert!(
            result.contains("\t\treturn val;"),
            "Body should be double-indented: {:?}",
            result
        );
    }

    #[test]
    fn test_getter_object_formatting_indented() {
        // Test getter expansion inside a function body (indented)
        let input = "function Main($$anchor) {\n\tTask(node, { get prop() {\n\t\treturn $.get(task);\n\t} });\n}";
        let result = normalize_js(input).unwrap();
        eprintln!("Indented getter:\n{}", result);
        assert!(
            result.contains("\tTask(node, {\n\t\tget prop()"),
            "Indented: Object with getter should be formatted on multiple lines: {:?}",
            result
        );
        assert!(
            result.contains("\t\t\treturn $.get(task);"),
            "Indented: Body should be triple-indented: {:?}",
            result
        );
    }
}
