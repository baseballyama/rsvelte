//! Legacy transformation functions for server-side rendering.
//!
//! This module contains functions that handle legacy (non-runes) mode transformations
//! for server-side code generation, including `export let` declarations, reactive
//! `$:` statements, and related helper utilities.

use crate::compiler::phases::phase3_transform::shared::js_scan::{code_bytes, skip_opaque};
use std::fmt::Write as _;

/// Check if the declaration string contains a semicolon at depth 0 (not inside braces/parens/brackets).
/// This is used to determine if an export let declaration is complete.
fn has_top_level_semicolon(s: &str) -> bool {
    let mut paren_depth: i32 = 0;
    let mut bracket_depth: i32 = 0;
    let mut brace_depth: i32 = 0;

    for (_, c) in code_bytes(s.as_bytes()) {
        match c {
            b'(' => paren_depth += 1,
            b')' => paren_depth -= 1,
            b'[' => bracket_depth += 1,
            b']' => bracket_depth -= 1,
            b'{' => brace_depth += 1,
            b'}' => brace_depth -= 1,
            b';' if paren_depth == 0 && bracket_depth == 0 && brace_depth == 0 => {
                return true;
            }
            _ => {}
        }
    }
    false
}

/// Truncate a declaration string at the first top-level semicolon and trim the result.
/// For example: `bg = "gre"; // comment` -> `bg = "gre"`.
/// If there is no top-level semicolon the string is returned trimmed as-is.
fn strip_at_top_level_semicolon(s: &str) -> String {
    let mut paren_depth: i32 = 0;
    let mut bracket_depth: i32 = 0;
    let mut brace_depth: i32 = 0;

    for (i, c) in code_bytes(s.as_bytes()) {
        match c {
            b'(' => paren_depth += 1,
            b')' => paren_depth -= 1,
            b'[' => bracket_depth += 1,
            b']' => bracket_depth -= 1,
            b'{' => brace_depth += 1,
            b'}' => brace_depth -= 1,
            b';' if paren_depth == 0 && bracket_depth == 0 && brace_depth == 0 => {
                // `i` points at an ASCII `;`, so `s[..i]` is on a char boundary.
                return s[..i].trim().to_string();
            }
            _ => {}
        }
    }
    // No top-level semicolon found - return as-is, stripping trailing semicolons
    s.trim_end_matches(';').trim().to_string()
}

/// Does the string / template / block comment opening at `i` run off the end of
/// `bytes` without its closing delimiter?
fn opaque_run_is_unterminated(bytes: &[u8], i: usize) -> bool {
    match bytes[i] {
        quote @ (b'\'' | b'"' | b'`') => {
            let mut j = i + 1;
            while j < bytes.len() {
                match bytes[j] {
                    b'\\' => j += 2,
                    b if b == quote => return false,
                    _ => j += 1,
                }
            }
            true
        }
        b'/' if bytes.get(i + 1) == Some(&b'*') => !bytes[i + 2..].windows(2).any(|w| w == b"*/"),
        _ => false,
    }
}

/// Check if an export let declaration value appears to be syntactically complete.
/// Returns true if the expression doesn't need a continuation line.
fn export_let_declaration_seems_complete(decl: &str) -> bool {
    // The `decl` is the entire declarator text after `export let `, e.g. `x = 42` or `x = [1, 2`.
    // First, check if brackets/parens/braces are balanced - if unbalanced, definitely incomplete.
    let bytes = decl.as_bytes();
    let mut i = 0;
    let mut prev: Option<u8> = None;
    let mut paren_depth: i32 = 0;
    let mut bracket_depth: i32 = 0;
    let mut brace_depth: i32 = 0;
    // An unclosed template literal or block comment means the next line continues it.
    let mut unterminated = false;
    let mut last_code_end = 0;

    while i < bytes.len() {
        if let Some((next, is_comment)) = skip_opaque(bytes, i, prev) {
            if next == bytes.len() && opaque_run_is_unterminated(bytes, i) {
                unterminated = true;
            }
            if !is_comment {
                prev = Some(b'x');
                last_code_end = next;
            }
            i = next;
            continue;
        }
        let c = bytes[i];
        match c {
            b'(' => paren_depth += 1,
            b')' => paren_depth -= 1,
            b'[' => bracket_depth += 1,
            b']' => bracket_depth -= 1,
            b'{' => brace_depth += 1,
            b'}' => brace_depth -= 1,
            _ => {}
        }
        if !c.is_ascii_whitespace() {
            prev = Some(c);
            last_code_end = i + 1;
        }
        i += 1;
    }

    // If any depth is non-zero, definitely incomplete
    if paren_depth != 0 || bracket_depth != 0 || brace_depth != 0 || unterminated {
        return false;
    }

    // Check for trailing operators that would require continuation, past any
    // trailing comment — `= [1] /* ] */` ends in code, not in a `/`.
    let trimmed = if last_code_end > 0 {
        decl[..last_code_end].trim()
    } else {
        decl.trim()
    };
    if trimmed.ends_with('+')
        || trimmed.ends_with('-')
        || trimmed.ends_with('*')
        || trimmed.ends_with('/')
        || trimmed.ends_with('%')
        || trimmed.ends_with('&')
        || trimmed.ends_with('|')
        || trimmed.ends_with('^')
        || trimmed.ends_with('?')
        || trimmed.ends_with("&&")
        || trimmed.ends_with("||")
        || trimmed.ends_with("=>")
        || trimmed.ends_with('=')
        || trimmed.ends_with(',')
    {
        return false;
    }

    // If balanced and doesn't end with an operator, it seems complete.
    // This is true for any declarator like `x = 42`, `x = 'hello'`, `x = [1,2,3]`, etc.
    // The bracket balance check above already covers the main case where we'd need to continue.
    true
}

/// Transform `export let` declarations for server-side rendering (legacy/non-runes mode).
/// Split `/* ... */ export let` onto two lines so the line-based scanner
/// recognizes the declaration; the comment stays as a leading comment.
fn split_same_line_leading_comments(script: &str) -> std::borrow::Cow<'_, str> {
    if !script.contains("*/") {
        return std::borrow::Cow::Borrowed(script);
    }
    let mut out = String::with_capacity(script.len() + 8);
    let mut changed = false;
    for line in script.lines() {
        if let Some(close) = line.find("*/") {
            let after = &line[close + 2..];
            let after_trimmed = after.trim_start();
            if after_trimmed.starts_with("export let ") || after_trimmed.starts_with("export var ")
            {
                let indent: String = line
                    .chars()
                    .take_while(|c| *c == ' ' || *c == '\t')
                    .collect();
                out.push_str(&line[..close + 2]);
                out.push('\n');
                out.push_str(&indent);
                out.push_str(after_trimmed);
                out.push('\n');
                changed = true;
                continue;
            }
        }
        out.push_str(line);
        out.push('\n');
    }
    if !changed {
        return std::borrow::Cow::Borrowed(script);
    }
    if out.ends_with('\n') && !script.ends_with('\n') {
        out.pop();
    }
    std::borrow::Cow::Owned(out)
}

/// Byte offset of the last `,` at paren/bracket/brace depth 0 (code only).
fn find_last_top_level_comma(s: &str) -> Option<usize> {
    let mut depth = 0i32;
    let mut last = None;
    for (i, c) in code_bytes(s.as_bytes()) {
        match c {
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => depth -= 1,
            b',' if depth == 0 => last = Some(i),
            _ => {}
        }
    }
    last
}

/// Byte offset of the first `//` or `/*` outside string literals, or `None`.
fn find_trailing_comment_start(s: &str) -> Option<usize> {
    let bytes = s.as_bytes();
    let mut i = 0;
    let mut in_string = false;
    let mut q = 0u8;
    while i < bytes.len() {
        let c = bytes[i];
        if in_string {
            if c == b'\\' {
                i += 2;
                continue;
            }
            if c == q {
                in_string = false;
            }
        } else if c == b'"' || c == b'\'' || c == b'`' {
            in_string = true;
            q = c;
        } else if c == b'/' && i + 1 < bytes.len() && (bytes[i + 1] == b'/' || bytes[i + 1] == b'*')
        {
            return Some(i);
        }
        i += 1;
    }
    None
}

pub(crate) fn transform_export_let_declarations(script: &str) -> String {
    // Pre-pass: a leading block comment that ENDS on the same line as the
    // declaration (`/* ... */ export let x = 'y';`) hides the `export let`
    // prefix from the line scanner. Upstream keeps the comment as a leading
    // comment of the lowered statement, so split it onto its own line.
    let script = split_same_line_leading_comments(script);
    let script = script.as_ref();

    let mut result = String::new();
    let mut lines = script.lines().peekable();

    while let Some(line) = lines.next() {
        let trimmed = line.trim();

        if trimmed.starts_with("export let ") || trimmed.starts_with("export var ") {
            // Preserve the source declaration keyword (`export var x` stays a
            // `var` binding; only the initializer is rewritten).
            let kw = if trimmed.starts_with("export var ") {
                "var"
            } else {
                "let"
            };
            let rest = &trimmed[11..];

            // Split off a trailing comment so it doesn't leak into the
            // parsed declaration. An unclosed `/*` consumes the following
            // lines up to `*/`.
            let (rest, mut trailing_comment) = match find_trailing_comment_start(rest) {
                Some(i) => (rest[..i].trim_end(), Some(rest[i..].trim_end().to_string())),
                None => (rest, None),
            };
            if let Some(tc) = trailing_comment.as_mut()
                && tc.starts_with("/*")
                && !tc.contains("*/")
            {
                for next in lines.by_ref() {
                    tc.push('\n');
                    tc.push_str(next);
                    if next.contains("*/") {
                        break;
                    }
                }
            }

            let mut full_declaration = rest.to_string();
            // Only continue reading if the expression appears incomplete (unbalanced braces/parens)
            // AND doesn't look like a valid complete statement.
            // This handles `export let x = 'value'` (no semicolon) correctly - it's complete
            // on its own and shouldn't consume the next line.
            while !has_top_level_semicolon(&full_declaration) && lines.peek().is_some() {
                // Check if the current line looks like a complete expression
                // A simple expression (identifier, string, number, etc.) is complete
                if export_let_declaration_seems_complete(&full_declaration) {
                    // Also peek to see if the next line would be a continuation
                    // (e.g., starts with '.' for method chains, or '&&', '||', etc.)
                    //
                    // Check for two-character operators before the corresponding
                    // single-character ones so that `**`/`||`/`&&`/`>>`/`<<` are
                    // not first matched against `*`/`|`/`&`/`>`/`<`.
                    let next_continues = lines.peek().is_some_and(|next| {
                        let next_trimmed = next.trim();
                        next_trimmed.starts_with("&&")
                            || next_trimmed.starts_with("||")
                            || next_trimmed.starts_with("**")
                            || next_trimmed.starts_with(">>")
                            || next_trimmed.starts_with("<<")
                            || next_trimmed.starts_with('.')
                            || next_trimmed.starts_with('?')
                            || next_trimmed.starts_with(':')
                            || next_trimmed.starts_with('+')
                            || next_trimmed.starts_with('-')
                    });
                    if !next_continues {
                        break;
                    }
                }
                if let Some(next_line) = lines.next() {
                    full_declaration.push(' ');
                    full_declaration.push_str(next_line.trim());
                }
            }

            // Truncate at the first top-level semicolon to strip trailing
            // comments like `"gre"; // dynamic value`.  This prevents inline
            // comments from leaking into generated $.fallback() calls.
            let declaration = strip_at_top_level_semicolon(&full_declaration);

            let had_default = find_assignment_eq(&declaration).is_some();
            let mut transformed = transform_single_export_let(&declaration, kw);
            // Re-attach the trailing comment. esrap attaches it to the last
            // node of the statement: with a default value that's the value
            // inside the `$.fallback(...)` call (the comment prints before
            // the closing paren), without one it trails the statement.
            if let Some(tc) = trailing_comment {
                if had_default && transformed.ends_with(");") && !transformed.contains('\n') {
                    // Attach the comment to the default value INSIDE the
                    // `$.fallback(...)` call (esrap prints it before the
                    // closing paren). OXC's codegen would drop a bare
                    // comment there, so smuggle it through normalization as
                    // a hex-encoded sequence-expression placeholder:
                    // `VALUE /* c */` → `(VALUE, void '$$C$$<hex>')`,
                    // decoded back in `normalize_script_with_oxc`.
                    if let Some(open) = transformed.find("$.fallback(") {
                        let args_start = open + "$.fallback(".len();
                        // Find the last top-level comma inside the call to
                        // isolate the default-value argument.
                        let inner = &transformed[args_start..transformed.len() - 2];
                        if let Some(comma) = find_last_top_level_comma(inner) {
                            let value = inner[comma + 1..].trim().to_string();
                            let prefix = transformed[..args_start + comma + 1].to_string();
                            let hex: String = tc.bytes().map(|b| format!("{:02x}", b)).collect();
                            transformed = format!("{} ({}, void '$$C$${}'));", prefix, value, hex);
                        } else {
                            transformed.push(' ');
                            transformed.push_str(&tc);
                        }
                    } else {
                        transformed.push(' ');
                        transformed.push_str(&tc);
                    }
                } else {
                    transformed.push(' ');
                    transformed.push_str(&tc);
                }
            }
            result.push_str(&transformed);
            result.push('\n');
        } else {
            result.push_str(line);
            result.push('\n');
        }
    }

    if result.ends_with('\n') {
        result.pop();
    }

    result
}

fn transform_single_export_let(declaration: &str, kw: &str) -> String {
    let mut result = String::new();

    // Check if this is a destructured export let pattern
    let trimmed = declaration.trim();
    if (trimmed.starts_with('{') || trimmed.starts_with('['))
        && let Some(flattened) = transform_destructured_export_let_ssr(trimmed)
    {
        return flattened;
    }

    let declarators = split_declarators(declaration);

    for declarator in declarators {
        let declarator = declarator.trim();
        if declarator.is_empty() {
            continue;
        }

        if let Some(eq_pos) = find_assignment_in_declarator(declarator) {
            let name = declarator[..eq_pos].trim();
            let default_value = declarator[eq_pos + 1..].trim();

            // Check if the default value is a store accessor (starts with $ and is a simple identifier)
            // Store accessors need lazy evaluation since they call $.store_get() which is side-effectful
            let is_store_accessor = default_value.starts_with('$')
                && is_simple_identifier(default_value)
                && default_value.len() > 1; // Not just "$"

            let transformed_default = if is_store_accessor {
                // Store accessor: wrap as lazy thunk, will be converted to $.store_get(...) by transform_store_refs_in_script
                format!(
                    "{} {} = $.fallback($$props['{}'], () => {}, true);",
                    kw, name, name, default_value
                )
            } else if is_simple_default_value(default_value) {
                format!(
                    "{} {} = $.fallback($$props['{}'], {});",
                    kw, name, name, default_value
                )
            } else if let Some(fn_name) = is_no_arg_function_call(default_value) {
                format!(
                    "{} {} = $.fallback($$props['{}'], {}, true);",
                    kw, name, name, fn_name
                )
            } else {
                // Wrap object literals with () to disambiguate from block statements
                // Arrays, template literals, function calls etc. don't need wrapping
                let wrapped_value = if default_value.trim_start().starts_with('{') {
                    format!("({})", default_value)
                } else {
                    default_value.to_string()
                };
                format!(
                    "{} {} = $.fallback($$props['{}'], () => {}, true);",
                    kw, name, name, wrapped_value
                )
            };
            result.push_str(&transformed_default);
        } else {
            let name = declarator.trim();
            let _ = write!(result, "{} {} = $$props['{}'];", kw, name, name);
        }
        result.push('\n');
    }

    if result.ends_with('\n') {
        result.pop();
    }

    result
}

fn split_declarators(declaration: &str) -> Vec<String> {
    let mut result = Vec::new();
    let mut depth = 0;
    let mut segment_start = 0;

    for (i, c) in code_bytes(declaration.as_bytes()) {
        match c {
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => depth -= 1,
            b',' if depth == 0 => {
                // `i` points at an ASCII `,`, so `declaration[segment_start..i]`
                // is on a char boundary.
                result.push(declaration[segment_start..i].trim().to_string());
                segment_start = i + 1;
            }
            _ => {}
        }
    }

    let last = declaration[segment_start..].trim();
    if !last.is_empty() {
        result.push(last.to_string());
    }

    result
}

fn find_assignment_in_declarator(declarator: &str) -> Option<usize> {
    let bytes = declarator.as_bytes();
    let mut depth = 0;

    for (i, c) in code_bytes(bytes) {
        match c {
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => depth -= 1,
            b'=' if depth == 0 => {
                let prev = if i > 0 { Some(bytes[i - 1]) } else { None };
                let next = bytes.get(i + 1).copied();
                if prev != Some(b'=')
                    && prev != Some(b'!')
                    && prev != Some(b'<')
                    && prev != Some(b'>')
                    && next != Some(b'=')
                    && next != Some(b'>')
                {
                    return Some(i);
                }
            }
            _ => {}
        }
    }

    None
}

pub(crate) fn is_no_arg_function_call(value: &str) -> Option<&str> {
    let trimmed = value.trim();
    if let Some(fn_name) = trimmed.strip_suffix("()")
        && is_simple_identifier(fn_name)
    {
        return Some(fn_name);
    }
    None
}

pub(crate) fn is_simple_default_value(value: &str) -> bool {
    is_simple_expression_string(value.trim())
}

fn is_simple_expression_string(trimmed: &str) -> bool {
    if trimmed.parse::<f64>().is_ok() {
        return true;
    }

    if matches!(trimmed, "true" | "false" | "null" | "undefined" | "void 0") {
        return true;
    }

    if is_simple_identifier(trimmed) {
        return true;
    }

    if is_string_literal(trimmed) {
        return true;
    }

    if is_arrow_function(trimmed) {
        return true;
    }

    if let Some((left, right)) = split_binary_expression(trimmed) {
        return is_simple_expression_string(left.trim())
            && is_simple_expression_string(right.trim());
    }

    if let Some((left, right)) = split_logical_expression(trimmed) {
        return is_simple_expression_string(left.trim())
            && is_simple_expression_string(right.trim());
    }

    if let Some((test, cons, alt)) = split_conditional_expression(trimmed) {
        return is_simple_expression_string(test.trim())
            && is_simple_expression_string(cons.trim())
            && is_simple_expression_string(alt.trim());
    }

    false
}

fn is_simple_identifier(s: &str) -> bool {
    if s.is_empty() {
        return false;
    }
    let mut chars = s.chars();
    let first = chars.next().unwrap();
    if !first.is_ascii_alphabetic() && first != '_' && first != '$' {
        return false;
    }
    chars.all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '$')
}

fn is_arrow_function(s: &str) -> bool {
    let s = s.trim();

    let s = s.strip_prefix("async").map(|s| s.trim_start()).unwrap_or(s);

    if let Some(arrow_pos) = find_arrow_at_depth_zero(s) {
        let before_arrow = s[..arrow_pos].trim();
        if is_simple_identifier(before_arrow) {
            return true;
        }
        if before_arrow.starts_with('(') && before_arrow.ends_with(')') {
            return true;
        }
    }
    false
}

fn find_arrow_at_depth_zero(s: &str) -> Option<usize> {
    let bytes = s.as_bytes();
    let mut depth = 0;

    for (i, c) in code_bytes(bytes) {
        match c {
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => depth -= 1,
            b'=' if depth == 0 && bytes.get(i + 1) == Some(&b'>') => {
                return Some(i);
            }
            _ => {}
        }
    }
    None
}

fn is_string_literal(s: &str) -> bool {
    let trimmed = s.trim();
    if trimmed.len() < 2 {
        return false;
    }

    // Note: backtick template literals are TemplateLiteral AST nodes (not Literal), so they
    // are NOT simple by the official Svelte compiler's definition.
    for &quote in b"\"'".iter() {
        if trimmed.as_bytes()[0] == quote && trimmed.as_bytes()[trimmed.len() - 1] == quote {
            let inner = &trimmed[1..trimmed.len() - 1];
            let bytes = inner.as_bytes();
            let mut i = 0;
            while i < bytes.len() {
                if bytes[i] == b'\\' && i + 1 < bytes.len() {
                    i += 2;
                } else if bytes[i] == quote {
                    return false;
                } else {
                    i += 1;
                }
            }
            return true;
        }
    }
    false
}

fn split_binary_expression(s: &str) -> Option<(&str, &str)> {
    let bytes = s.as_bytes();
    let mut depth = 0;

    // Right-to-left over the code bytes: collect forward, then walk back.
    let code: Vec<(usize, u8)> = code_bytes(bytes).collect();
    for &(i, c) in code.iter().rev() {
        match c {
            b')' | b']' | b'}' => depth += 1,
            b'(' | b'[' | b'{' => depth -= 1,
            b'+' if depth == 0 => {
                let prev = if i > 0 { Some(bytes[i - 1]) } else { None };
                let next = bytes.get(i + 1).copied();
                if prev != Some(b'+') && next != Some(b'+') && next != Some(b'=') {
                    return Some((&s[..i], &s[i + 1..]));
                }
            }
            _ => {}
        }
    }
    None
}

fn split_logical_expression(s: &str) -> Option<(&str, &str)> {
    let bytes = s.as_bytes();
    let mut depth = 0;

    // Right-to-left over the code bytes: collect forward, then walk back.
    let code: Vec<(usize, u8)> = code_bytes(bytes).collect();
    for &(i, c) in code.iter().rev() {
        let Some(&next) = bytes.get(i + 1) else {
            continue;
        };

        match c {
            b')' | b']' | b'}' => depth += 1,
            b'(' | b'[' | b'{' => depth -= 1,
            b'&' if next == b'&' && depth == 0 => {
                return Some((&s[..i], &s[i + 2..]));
            }
            b'|' if next == b'|' && depth == 0 => {
                return Some((&s[..i], &s[i + 2..]));
            }
            b'?' if next == b'?' && depth == 0 => {
                return Some((&s[..i], &s[i + 2..]));
            }
            _ => {}
        }
    }
    None
}

fn split_conditional_expression(s: &str) -> Option<(&str, &str, &str)> {
    let bytes = s.as_bytes();
    let mut depth = 0;
    let mut question_pos = None;

    for (i, c) in code_bytes(bytes) {
        match c {
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => depth -= 1,
            b'?' if depth == 0 && bytes.get(i + 1) != Some(&b'?') && question_pos.is_none() => {
                question_pos = Some(i);
            }
            b':' if depth == 0 && question_pos.is_some() => {
                let q = question_pos.unwrap();
                return Some((&s[..q], &s[q + 1..i], &s[i + 1..]));
            }
            _ => {}
        }
    }
    None
}

fn find_assignment_eq(s: &str) -> Option<usize> {
    let bytes = s.as_bytes();
    let mut depth = 0;
    let mut skip_until = 0;

    for (i, c) in code_bytes(bytes) {
        if i < skip_until {
            continue;
        }
        match c {
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => depth -= 1,
            b'=' if depth == 0 => {
                let next = bytes.get(i + 1).copied();
                let prev = if i > 0 { Some(bytes[i - 1]) } else { None };
                if next == Some(b'=') || next == Some(b'>') {
                    skip_until = i + 2;
                    continue;
                }
                if let Some(p) = prev
                    && matches!(
                        p,
                        b'!' | b'<'
                            | b'>'
                            | b'+'
                            | b'-'
                            | b'*'
                            | b'/'
                            | b'%'
                            | b'&'
                            | b'|'
                            | b'^'
                            | b'?'
                    )
                {
                    continue;
                }
                return Some(i);
            }
            _ => {}
        }
    }
    None
}

/// Transform destructured `export let { ... } = expr` into flattened
/// `$.fallback()` calls for SSR.
///
/// Example:
///   `{ a, b: { c }, e: [e_one], g = default_g } = THING`
/// becomes:
///   `let tmp = THING,
///       $$array = $.to_array(tmp.e, 1),
///       a = $.fallback($$props['a'], () => tmp.a, true),
///       c = $.fallback($$props['c'], () => tmp.b.c, true),
///       e_one = $.fallback($$props['e_one'], () => $$array[0], true),
///       g = $.fallback($$props['g'], () => $.fallback(tmp.g, default_g), true);`
fn transform_destructured_export_let_ssr(declaration: &str) -> Option<String> {
    let trimmed = declaration.trim();

    // Find the `= RHS` assignment
    let pattern_end = find_destructuring_pattern_end_ssr(trimmed)?;
    let pattern = trimmed[..pattern_end].trim();
    let rhs_part = trimmed[pattern_end..].trim();
    let rhs = rhs_part.strip_prefix('=')?.trim();
    let rhs = rhs.trim_end_matches(';').trim();

    let mut declarations = Vec::new();
    let mut array_counter = 0;

    declarations.push(format!("tmp = {}", rhs));

    extract_destructured_export_paths_ssr(pattern, "tmp", &mut declarations, &mut array_counter)?;

    // Upstream emits the generated `$$array`/`$$array_N` `$.to_array(...)`
    // declarations together right after `tmp`, before the prop getters that
    // reference them. Reorder to match (same as the client transform).
    let ordered = if let Some((tmp_decl, rest_decls)) = declarations.split_first() {
        let (array_decls, prop_decls): (Vec<String>, Vec<String>) = rest_decls
            .iter()
            .cloned()
            .partition(|d| d.trim_start().starts_with("$$array"));
        let mut ordered = Vec::with_capacity(declarations.len());
        ordered.push(tmp_decl.clone());
        ordered.extend(array_decls);
        ordered.extend(prop_decls);
        ordered
    } else {
        declarations
    };

    Some(format!("let {};", ordered.join(",\n\t")))
}

fn find_destructuring_pattern_end_ssr(s: &str) -> Option<usize> {
    let bytes = s.as_bytes();
    let first = *bytes.first()?;
    if first != b'{' && first != b'[' {
        return None;
    }

    let mut depth = 0;

    for (i, c) in code_bytes(bytes) {
        if c == b'{' || c == b'[' {
            depth += 1;
        } else if c == b'}' || c == b']' {
            depth -= 1;
            if depth == 0 {
                return Some(i + 1);
            }
        }
    }
    None
}

fn extract_destructured_export_paths_ssr(
    pattern: &str,
    base_path: &str,
    declarations: &mut Vec<String>,
    array_counter: &mut usize,
) -> Option<()> {
    let pattern = pattern.trim();

    if pattern.starts_with('{') && pattern.ends_with('}') {
        let inner = &pattern[1..pattern.len() - 1];
        let properties = split_destructuring_properties_ssr(inner);

        for prop in properties {
            let prop = prop.trim();
            if prop.is_empty() {
                continue;
            }

            if prop.starts_with("...") {
                // Rest element - skip for now
                continue;
            }

            if let Some((key, value_pattern)) = split_property_key_value_ssr(prop) {
                let new_path = format!("{}.{}", base_path, key);

                if value_pattern.starts_with('{') || value_pattern.starts_with('[') {
                    extract_destructured_export_paths_ssr(
                        value_pattern,
                        &new_path,
                        declarations,
                        array_counter,
                    )?;
                } else {
                    let (binding_name, default_value) =
                        split_binding_name_default_ssr(value_pattern);
                    if let Some(default_val) = default_value {
                        declarations.push(format!(
                            "{} = $.fallback($$props['{}'], () => $.fallback({}, {}), true)",
                            binding_name, binding_name, new_path, default_val
                        ));
                    } else {
                        declarations.push(format!(
                            "{} = $.fallback($$props['{}'], () => {}, true)",
                            binding_name, binding_name, new_path
                        ));
                    }
                }
            } else {
                let (binding_name, default_value) = split_binding_name_default_ssr(prop);
                let new_path = format!("{}.{}", base_path, binding_name);
                if let Some(default_val) = default_value {
                    declarations.push(format!(
                        "{} = $.fallback($$props['{}'], () => $.fallback({}, {}), true)",
                        binding_name, binding_name, new_path, default_val
                    ));
                } else {
                    declarations.push(format!(
                        "{} = $.fallback($$props['{}'], () => {}, true)",
                        binding_name, binding_name, new_path
                    ));
                }
            }
        }
    } else if pattern.starts_with('[') && pattern.ends_with(']') {
        let inner = &pattern[1..pattern.len() - 1];
        let elements = split_destructuring_properties_ssr(inner);
        let total_count = elements.len();

        let array_var = if *array_counter == 0 {
            "$$array".to_string()
        } else {
            format!("$$array_{}", array_counter)
        };
        *array_counter += 1;

        // SSR: use $.to_array() directly (no $.derived wrapper). A rest element
        // makes the destructure unbounded, so the element-count argument is
        // omitted (upstream omits it when the pattern has a `...rest`).
        let has_rest = elements.iter().any(|e| e.trim().starts_with("..."));
        declarations.push(if has_rest {
            format!("{} = $.to_array({})", array_var, base_path)
        } else {
            format!("{} = $.to_array({}, {})", array_var, base_path, total_count)
        });

        for (idx, elem) in elements.iter().enumerate() {
            let elem = elem.trim();
            if elem.is_empty() {
                continue;
            }

            if let Some(rest_pattern) = elem.strip_prefix("...") {
                let rest_pattern = rest_pattern.trim();
                if rest_pattern.starts_with('{') || rest_pattern.starts_with('[') {
                    let slice_path = format!("{}.slice({})", array_var, idx);
                    extract_destructured_export_paths_ssr(
                        rest_pattern,
                        &slice_path,
                        declarations,
                        array_counter,
                    )?;
                } else {
                    declarations.push(format!(
                        "{} = $.fallback($$props['{}'], () => {}.slice({}), true)",
                        rest_pattern, rest_pattern, array_var, idx
                    ));
                }
                continue;
            }

            // SSR: direct array access (no $.get() wrapper)
            let element_path = format!("{}[{}]", array_var, idx);

            if elem.starts_with('{') || elem.starts_with('[') {
                extract_destructured_export_paths_ssr(
                    elem,
                    &element_path,
                    declarations,
                    array_counter,
                )?;
            } else {
                let (binding_name, default_value) = split_binding_name_default_ssr(elem);
                if let Some(default_val) = default_value {
                    declarations.push(format!(
                        "{} = $.fallback($$props['{}'], () => $.fallback({}, {}), true)",
                        binding_name, binding_name, element_path, default_val
                    ));
                } else {
                    declarations.push(format!(
                        "{} = $.fallback($$props['{}'], () => {}, true)",
                        binding_name, binding_name, element_path
                    ));
                }
            }
        }
    } else {
        return None;
    }

    Some(())
}

fn split_property_key_value_ssr(prop: &str) -> Option<(&str, &str)> {
    let mut depth = 0;
    for (i, ch) in code_bytes(prop.as_bytes()) {
        match ch {
            b'{' | b'[' | b'(' => depth += 1,
            b'}' | b']' | b')' => depth -= 1,
            b':' if depth == 0 => {
                return Some((prop[..i].trim(), prop[i + 1..].trim()));
            }
            _ => {}
        }
    }
    None
}

fn split_binding_name_default_ssr(s: &str) -> (&str, Option<&str>) {
    let s = s.trim();
    if let Some(eq_pos) = s.find('=') {
        let after = s.get(eq_pos + 1..eq_pos + 2).unwrap_or("");
        if after == "=" || after == ">" {
            return (s, None);
        }
        (s[..eq_pos].trim(), Some(s[eq_pos + 1..].trim()))
    } else {
        (s, None)
    }
}

fn split_destructuring_properties_ssr(s: &str) -> Vec<&str> {
    let mut result = Vec::new();
    let mut depth = 0;
    let mut start = 0;

    for (i, ch) in code_bytes(s.as_bytes()) {
        match ch {
            b'{' | b'[' | b'(' => depth += 1,
            b'}' | b']' | b')' => depth -= 1,
            b',' if depth == 0 => {
                result.push(&s[start..i]);
                start = i + 1;
            }
            _ => {}
        }
    }
    result.push(&s[start..]);
    result
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn top_level_semicolon_ignores_comments_and_strings() {
        assert!(!has_top_level_semicolon("x = 1 // done;"));
        assert!(!has_top_level_semicolon("x = 1 /* a; b */"));
        assert!(!has_top_level_semicolon("x = 'a;b'"));
        assert!(has_top_level_semicolon("x = 1; y"));
    }

    #[test]
    fn strip_at_semicolon_ignores_comments() {
        assert_eq!(
            strip_at_top_level_semicolon("x = 1 // a; b"),
            "x = 1 // a; b"
        );
        assert_eq!(
            strip_at_top_level_semicolon("x = 1 /* ; */ + 2"),
            "x = 1 /* ; */ + 2"
        );
        assert_eq!(strip_at_top_level_semicolon("x = 1; // c"), "x = 1");
    }

    #[test]
    fn declaration_completeness_ignores_comment_brackets() {
        assert!(export_let_declaration_seems_complete("x = [1 /* ] */ ]"));
        assert!(!export_let_declaration_seems_complete("x = [1 // ]"));
        assert!(export_let_declaration_seems_complete("x = [1] /* ] */"));
        assert!(!export_let_declaration_seems_complete("x = `abc"));
        assert!(!export_let_declaration_seems_complete("x = 1 /* open"));
    }

    #[test]
    fn last_top_level_comma_ignores_comments() {
        assert_eq!(find_last_top_level_comma("a, b /* , */"), Some(1));
        assert_eq!(find_last_top_level_comma("a // , b"), None);
    }

    #[test]
    fn split_declarators_ignores_comments() {
        assert_eq!(
            split_declarators("a = 1 /* , */ , b = 2"),
            vec!["a = 1 /* , */", "b = 2"]
        );
        assert_eq!(split_declarators("a = 1 // , b"), vec!["a = 1 // , b"]);
    }

    #[test]
    fn assignment_in_declarator_ignores_comments() {
        assert_eq!(find_assignment_in_declarator("x /* = */ = 1"), Some(10));
        assert_eq!(find_assignment_in_declarator("x // = 1"), None);
    }

    #[test]
    fn arrow_at_depth_zero_ignores_comments() {
        assert_eq!(find_arrow_at_depth_zero("x /* => */ + 1"), None);
        assert_eq!(find_arrow_at_depth_zero("// =>"), None);
    }

    #[test]
    fn split_binary_ignores_comments() {
        assert_eq!(split_binary_expression("a /* + */ b"), None);
        assert_eq!(split_binary_expression("a // + b"), None);
    }

    #[test]
    fn split_logical_ignores_comments() {
        assert_eq!(split_logical_expression("a /* && */ b"), None);
        assert_eq!(split_logical_expression("a // || b"), None);
    }

    #[test]
    fn split_conditional_ignores_comments() {
        assert_eq!(split_conditional_expression("cond // ? x : y"), None);
        assert_eq!(split_conditional_expression("cond /* ? x : y */"), None);
    }

    #[test]
    fn assignment_eq_ignores_comments_and_strings() {
        assert_eq!(find_assignment_eq("a /* = */ b"), None);
        assert_eq!(find_assignment_eq("a // = b"), None);
        assert_eq!(find_assignment_eq("'=' + x"), None);
    }

    #[test]
    fn destructuring_pattern_end_ignores_comments() {
        assert_eq!(
            find_destructuring_pattern_end_ssr("{ a /* } */, b }"),
            Some(16)
        );
        assert_eq!(
            find_destructuring_pattern_end_ssr("{ a // }\n, b }"),
            Some(14)
        );
    }

    #[test]
    fn property_key_value_ignores_comments_and_strings() {
        assert_eq!(
            split_property_key_value_ssr("a /* : */ : b"),
            Some(("a /* : */", "b"))
        );
        assert_eq!(split_property_key_value_ssr("'a:b'"), None);
    }

    #[test]
    fn destructuring_properties_ignore_comments() {
        assert_eq!(
            split_destructuring_properties_ssr("a /* , */ , b"),
            vec!["a /* , */ ", " b"]
        );
        assert_eq!(
            split_destructuring_properties_ssr("a // , b"),
            vec!["a // , b"]
        );
    }
}
