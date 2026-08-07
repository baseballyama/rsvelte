//! Legacy transformation functions for server-side rendering.
//!
//! This module contains functions that handle legacy (non-runes) mode transformations
//! for server-side code generation, including `export let` declarations, reactive
//! `$:` statements, and related helper utilities.

use crate::compiler::phases::phase3_transform::shared::js_scan::{code_bytes, skip_opaque};
use memchr::memmem;
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

/// Reorder legacy reactive `$:` statements in SSR script to appear after all other
/// script declarations (function declarations, variable declarations, function calls).
///
/// In the official Svelte compiler, reactive `$:` statements in SSR mode are placed
/// AFTER all other script content because reactive computed values should run after
/// all initialization code.
///
/// This function moves `$:` statement lines/blocks to the end of the script content.
/// Byte just past the first unescaped backtick, closing an open template literal.
fn template_literal_close(bytes: &[u8]) -> Option<usize> {
    let mut j = 0;
    while j < bytes.len() {
        match bytes[j] {
            b'\\' => j += 2,
            b'`' => return Some(j + 1),
            _ => j += 1,
        }
    }
    None
}

/// Fold one line of a `$:` statement into the running bracket depth. A template
/// literal is opaque and spans lines, so its state is threaded across calls.
/// Returns the updated `(depth, in_template)` rather than writing through
/// `&mut`, so a caller that drops the template half fails to compile.
#[must_use]
fn scan_reactive_line(line: &str, mut depth: i32, in_template: bool) -> (i32, bool) {
    let bytes = line.as_bytes();
    let mut i = 0;
    let mut prev: Option<u8> = None;

    if in_template {
        match template_literal_close(bytes) {
            Some(j) => {
                i = j;
                prev = Some(b'x');
            }
            None => return (depth, true),
        }
    }

    while i < bytes.len() {
        if let Some((next, is_comment)) = skip_opaque(bytes, i, prev) {
            if bytes[i] == b'`' && opaque_run_is_unterminated(bytes, i) {
                return (depth, true);
            }
            if !is_comment {
                prev = Some(b'x');
            }
            i = next;
            continue;
        }
        let c = bytes[i];
        match c {
            b'{' | b'(' | b'[' => depth += 1,
            b'}' | b')' | b']' => depth -= 1,
            _ => {}
        }
        if !c.is_ascii_whitespace() {
            prev = Some(c);
        }
        i += 1;
    }
    (depth, false)
}

/// How one line is treated while accumulating the continuation lines of a `$:`
/// statement.
enum ContinuationLine {
    /// Ends the statement.
    Boundary,
    /// Part of the statement, but carries no continuation signal of its own, so
    /// whether the statement is complete is decided by the next code line.
    Comment,
    Code,
}

/// Both accumulation loops below must share this classification, or the decision
/// scan mis-routes a statement the collection scan then splits differently.
fn classify_continuation_line(trimmed: &str, in_template: bool) -> ContinuationLine {
    // Inside a template literal every line is literal text.
    if in_template {
        return ContinuationLine::Code;
    }
    if trimmed.is_empty() || trimmed.starts_with("$:") || trimmed.starts_with("function ") {
        ContinuationLine::Boundary
    } else if trimmed.starts_with("//") {
        ContinuationLine::Comment
    } else {
        ContinuationLine::Code
    }
}

// The only live caller is `{@const}` lowering, whose input is a declaration, so no `$:`
// reaches this in a shipping compile.
pub(crate) fn reorder_reactive_statements_after_functions(script: &str) -> String {
    let lines: Vec<&str> = script.lines().collect();

    // Check if there are any $: statements
    let has_reactive = lines.iter().any(|l| l.trim().starts_with("$:"));

    if !has_reactive {
        return script.to_string();
    }

    // Check if reordering is actually needed:
    // Reordering is needed if there are any non-reactive statements or declarations
    // that come AFTER a $: reactive statement in the source.
    // In SSR, all reactive statements should be placed at the end so non-reactive
    // code (like `foo = 1`) runs before reactive computations.
    let needs_reorder = {
        let mut saw_reactive = false;
        let mut needs = false;
        let mut in_reactive_multiline = false;
        let mut reactive_depth: i32 = 0;
        let mut in_template = false;
        let mut i = 0;
        while i < lines.len() {
            let trimmed = lines[i].trim();
            if in_reactive_multiline {
                // Count braces to find the end of the reactive statement
                (reactive_depth, in_template) =
                    scan_reactive_line(trimmed, reactive_depth, in_template);
                if reactive_depth <= 0 && !in_template {
                    in_reactive_multiline = false;
                }
                i += 1;
                continue;
            }
            if trimmed.starts_with("$:") {
                saw_reactive = true;
                // Count braces in the reactive statement line to detect multiline
                let depth: i32;
                (depth, in_template) = scan_reactive_line(trimmed, 0, false);
                if depth > 0 || in_template {
                    // This is a multi-line reactive statement; skip until balanced
                    in_reactive_multiline = true;
                    reactive_depth = depth;
                } else {
                    // Check if line ends with continuation char (e.g., `$: foo =\n\tbar();`)
                    let last_ch = trimmed.chars().last().unwrap_or(' ');
                    let ends_with_cont = matches!(
                        last_ch,
                        '=' | '+'
                            | '-'
                            | '*'
                            | '/'
                            | '?'
                            | ':'
                            | '&'
                            | '|'
                            | '>'
                            | '<'
                            | '^'
                            | '~'
                            | '!'
                            | '%'
                            | ','
                    );
                    // Also check if the next line starts with a continuation operator
                    let next_starts_cont = if !ends_with_cont && i + 1 < lines.len() {
                        let nt = lines[i + 1].trim();
                        let fc = nt.chars().next().unwrap_or(' ');
                        matches!(fc, '?' | ':' | '&' | '|' | '+' | '-' | '.')
                    } else {
                        false
                    };
                    if ends_with_cont || next_starts_cont {
                        // Skip continuation lines, tracking accumulated bracket depth
                        let mut acc_depth: i32 = depth; // depth from the $: line
                        let mut acc_template = in_template;
                        i += 1;
                        while i < lines.len() {
                            let nt = lines[i].trim();
                            let kind = classify_continuation_line(nt, acc_template);
                            if matches!(kind, ContinuationLine::Boundary) {
                                break;
                            }
                            (acc_depth, acc_template) =
                                scan_reactive_line(nt, acc_depth, acc_template);
                            i += 1;
                            let nl = nt.chars().last().unwrap_or(' ');
                            let is_cont = matches!(
                                nl,
                                '=' | '+'
                                    | '-'
                                    | '*'
                                    | '/'
                                    | '?'
                                    | ':'
                                    | '&'
                                    | '|'
                                    | '>'
                                    | '<'
                                    | '^'
                                    | '~'
                                    | '!'
                                    | '%'
                                    | ','
                            );
                            // Check if following line starts with continuation
                            let following_starts = if i < lines.len() {
                                let ft = lines[i].trim();
                                let fc = ft.chars().next().unwrap_or(' ');
                                matches!(fc, '?' | ':' | '&' | '|' | '+' | '-' | '.')
                            } else {
                                false
                            };
                            if !matches!(kind, ContinuationLine::Comment)
                                && !is_cont
                                && !following_starts
                                && acc_depth <= 0
                                && !acc_template
                            {
                                break;
                            }
                        }
                        continue;
                    }
                }
                // Skip continuation lines (method chaining starting with `.`)
                i += 1;
                while i < lines.len() && lines[i].trim().starts_with('.') {
                    i += 1;
                }
                continue;
            } else if saw_reactive && !trimmed.is_empty() {
                // There is some non-reactive content after a reactive statement
                needs = true;
                break;
            }
            i += 1;
        }
        // Also need to reorder if there are function declarations that should come after reactive
        if !needs {
            // Check if any reactive line comes before a function declaration
            needs = lines.iter().any(|l| l.trim().starts_with("function "))
                && lines.iter().any(|l| l.trim().starts_with("$:"))
        }
        needs
    };

    if !needs_reorder {
        // Even when no reordering of reactive vs non-reactive is needed,
        // we still need to topologically sort the reactive statements among themselves.
        // Do an in-place sort of reactive statements only.
        return sort_reactive_in_place(script);
    }

    // Separate lines into: non-reactive (including functions) and reactive
    let mut non_reactive_lines: Vec<&str> = Vec::new();
    let mut reactive_lines: Vec<Vec<&str>> = Vec::new();

    let mut i = 0;
    while i < lines.len() {
        let line = lines[i];
        let trimmed = line.trim();

        if trimmed.starts_with("$:") {
            // Collect the full reactive statement (possibly multi-line block)
            let mut stmt_lines = vec![line];

            // Count brace depth and backtick state to detect multi-line blocks
            let mut depth: i32 = 0;
            let mut in_template_literal = false;
            (depth, in_template_literal) = scan_reactive_line(trimmed, depth, in_template_literal);

            if depth > 0 || in_template_literal {
                // Multi-line reactive statement (or template literal) - collect until balanced
                i += 1;
                while i < lines.len() && (depth > 0 || in_template_literal) {
                    let next = lines[i];
                    stmt_lines.push(next);
                    (depth, in_template_literal) =
                        scan_reactive_line(next, depth, in_template_literal);
                    i += 1;
                }
            } else {
                // Check if the line ends with a continuation character (e.g., `=`, `?`, operator)
                // meaning the next line is part of the same statement.
                // For example: `$: foo =\n\t\tbar();`
                let last_char = trimmed.chars().last().unwrap_or(' ');
                let is_continuation = matches!(
                    last_char,
                    '=' | '+'
                        | '-'
                        | '*'
                        | '/'
                        | '?'
                        | ':'
                        | '&'
                        | '|'
                        | '>'
                        | '<'
                        | '^'
                        | '~'
                        | '!'
                        | '%'
                        | ','
                );
                i += 1;
                // Also check if the next line STARTS with a continuation operator
                // (e.g., `? value : other` or `&& expr` or `|| expr`)
                // This handles cases like `$: x = cond === "val"\n\t? a : b;`
                let next_starts_continuation = if !is_continuation && i < lines.len() {
                    let nt = lines[i].trim();
                    let first_ch = nt.chars().next().unwrap_or(' ');
                    matches!(first_ch, '?' | ':' | '&' | '|' | '+' | '-' | '.')
                } else {
                    false
                };
                if is_continuation || next_starts_continuation {
                    // Collect continuation lines until we hit a line that looks complete.
                    // Track accumulated bracket depth so multi-line bracket expressions
                    // like `$: x = arr[\n  expr\n];` are fully consumed.
                    // Count depth from the initial $: line too
                    let (mut accumulated_depth, mut acc_template) =
                        scan_reactive_line(trimmed, 0, false);
                    while i < lines.len() {
                        let next = lines[i];
                        let next_trimmed = next.trim();
                        let kind = classify_continuation_line(next_trimmed, acc_template);
                        if matches!(kind, ContinuationLine::Boundary) {
                            break;
                        }
                        stmt_lines.push(next);
                        // Update accumulated depth
                        (accumulated_depth, acc_template) =
                            scan_reactive_line(next_trimmed, accumulated_depth, acc_template);
                        let next_last = next_trimmed.chars().last().unwrap_or(' ');
                        let next_is_continuation = matches!(
                            next_last,
                            '=' | '+'
                                | '-'
                                | '*'
                                | '/'
                                | '?'
                                | ':'
                                | '&'
                                | '|'
                                | '>'
                                | '<'
                                | '^'
                                | '~'
                                | '!'
                                | '%'
                                | ','
                        );
                        // Also check if the NEXT line (after this one) starts with a continuation
                        let following_starts_cont = if i + 1 < lines.len() {
                            let ft = lines[i + 1].trim();
                            let fc = ft.chars().next().unwrap_or(' ');
                            matches!(fc, '?' | ':' | '&' | '|' | '+' | '-' | '.')
                        } else {
                            false
                        };
                        i += 1;
                        if !matches!(kind, ContinuationLine::Comment)
                            && !next_is_continuation
                            && !following_starts_cont
                            && accumulated_depth <= 0
                            && !acc_template
                        {
                            break;
                        }
                    }
                }
            }

            // Also collect continuation lines (method chaining that starts with `.`)
            // For example: `$: ids = new Array(count)\n\t.fill(null)\n\t.map(...);\n`
            // The `.fill()` and `.map()` lines are continuations of the $: statement.
            while i < lines.len() {
                let next_trimmed = lines[i].trim();
                if next_trimmed.starts_with('.') {
                    stmt_lines.push(lines[i]);
                    i += 1;
                } else {
                    break;
                }
            }

            reactive_lines.push(stmt_lines);
        } else {
            non_reactive_lines.push(line);
            i += 1;
        }
    }

    // Topologically sort reactive statements based on their dependencies.
    // A reactive statement `$: a = expr_using_b` depends on `$: b = ...`
    // so `b` must come before `a`.
    let reactive_lines = sort_reactive_statements_topologically(reactive_lines);

    // Build result: all non-reactive lines first, then reactive statements at the end
    let mut result = String::new();

    for line in &non_reactive_lines {
        result.push_str(line);
        result.push('\n');
    }

    // Append reactive statements at the end
    result.push('\n');
    for stmt in &reactive_lines {
        for stmt_line in stmt {
            result.push_str(stmt_line);
            result.push('\n');
        }
    }

    // Remove trailing newline
    if result.ends_with('\n') {
        result.pop();
    }

    result
}

/// Sort reactive statements in place (without moving them after non-reactive code).
/// This topologically sorts reactive statements relative to each other while keeping
/// non-reactive statements in their original positions.
fn sort_reactive_in_place(script: &str) -> String {
    let lines: Vec<&str> = script.lines().collect();
    let n = lines.len();

    // Collect groups: each group is either a set of reactive stmt lines or non-reactive lines
    // between/before/after reactive stmts
    #[derive(Debug)]
    enum Group<'a> {
        NonReactive(Vec<&'a str>),
        Reactive(Vec<&'a str>),
    }

    let mut groups: Vec<Group> = Vec::new();
    let mut i = 0;

    while i < n {
        let trimmed = lines[i].trim();
        if trimmed.starts_with("$:") {
            // Collect this reactive statement (possibly multi-line)
            let mut stmt_lines = vec![lines[i]];
            let mut depth: i32 = 0;
            let mut in_template = false;
            (depth, in_template) = scan_reactive_line(trimmed, depth, in_template);
            i += 1;
            if depth > 0 || in_template {
                while i < n && (depth > 0 || in_template) {
                    let next = lines[i];
                    stmt_lines.push(next);
                    (depth, in_template) = scan_reactive_line(next, depth, in_template);
                    i += 1;
                }
            } else {
                // Check if line ends with continuation char (e.g., `$: foo =\n\tbar();`)
                let last_ch = trimmed.chars().last().unwrap_or(' ');
                if matches!(
                    last_ch,
                    '=' | '+'
                        | '-'
                        | '*'
                        | '/'
                        | '?'
                        | ':'
                        | '&'
                        | '|'
                        | '>'
                        | '<'
                        | '^'
                        | '~'
                        | '!'
                        | '%'
                        | ','
                ) {
                    while i < n {
                        let nt = lines[i].trim();
                        if nt.is_empty() || nt.starts_with("$:") || nt.starts_with("function ") {
                            break;
                        }
                        stmt_lines.push(lines[i]);
                        i += 1;
                        let nl = nt.chars().last().unwrap_or(' ');
                        if !matches!(
                            nl,
                            '=' | '+'
                                | '-'
                                | '*'
                                | '/'
                                | '?'
                                | ':'
                                | '&'
                                | '|'
                                | '>'
                                | '<'
                                | '^'
                                | '~'
                                | '!'
                                | '%'
                                | ','
                        ) {
                            break;
                        }
                    }
                }
            }
            // Also collect continuation lines (method chaining starting with `.`)
            while i < n && lines[i].trim().starts_with('.') {
                stmt_lines.push(lines[i]);
                i += 1;
            }
            groups.push(Group::Reactive(stmt_lines));
        } else {
            // Non-reactive line - merge into or start a NonReactive group
            match groups.last_mut() {
                Some(Group::NonReactive(v)) => {
                    v.push(lines[i]);
                }
                _ => {
                    groups.push(Group::NonReactive(vec![lines[i]]));
                }
            }
            i += 1;
        }
    }

    // Collect all reactive groups and their positions
    let reactive_groups: Vec<Vec<&str>> = groups
        .iter()
        .filter_map(|g| {
            if let Group::Reactive(lines) = g {
                Some(lines.clone())
            } else {
                None
            }
        })
        .collect();

    if reactive_groups.len() <= 1 {
        // Nothing to sort
        return script.to_string();
    }

    // Sort reactive statements topologically
    let sorted_reactives = sort_reactive_statements_topologically(reactive_groups);

    // Now rebuild the script, replacing reactive groups with sorted ones
    let mut result = String::new();
    let mut reactive_iter = sorted_reactives.into_iter();

    for group in &groups {
        match group {
            Group::NonReactive(lines) => {
                for line in lines {
                    result.push_str(line);
                    result.push('\n');
                }
            }
            Group::Reactive(_) => {
                if let Some(sorted_stmt) = reactive_iter.next() {
                    for line in &sorted_stmt {
                        result.push_str(line);
                        result.push('\n');
                    }
                }
            }
        }
    }

    // Remove trailing newline
    if result.ends_with('\n') {
        result.pop();
    }

    result
}

/// Extract the LHS assigned variable(s) from a reactive statement (joined text).
/// Returns set of variable names that this statement assigns to.
fn extract_reactive_lhs_vars(stmt: &str) -> Vec<String> {
    // Find `$:` prefix and then look for assignment: `$: varname = ...` or `$: { varname = ...; }`
    let content = stmt.trim_start();
    let after_dollar = if let Some(rest) = content.strip_prefix("$:") {
        rest.trim()
    } else {
        return Vec::new();
    };

    let mut vars = extract_simple_assignments(after_dollar);

    // Also recognize `$.store_set(name, ...)` patterns as assigning to `$name`.
    // After store transforms, `$: $a = expr` becomes `$: $.store_set(a, ...)`.
    // We need to track that this assigns to `$a` (the store subscription variable).
    extract_store_set_targets(after_dollar, &mut vars);

    vars
}

/// Extract store subscription variable names from `$.store_set(name, ...)` patterns.
/// Adds `$name` to the vars list for each store_set call found.
fn extract_store_set_targets(code: &str, vars: &mut Vec<String>) {
    let finder = memmem::Finder::new(b"$.store_set(");
    let mut search_from = 0;
    while let Some(pos) = finder.find(&code.as_bytes()[search_from..]) {
        let abs_pos = search_from + pos;
        // `memmem` yields a byte offset; the old code fed it to a `Vec<char>`,
        // mis-slicing the name whenever non-ASCII preceded the call.
        let rest = code[abs_pos + 12..].trim_start_matches([' ', '\t']);
        let store_name: String = rest
            .chars()
            .take_while(|c| c.is_alphanumeric() || *c == '_' || *c == '$')
            .collect();
        if !store_name.is_empty() {
            let store_sub = format!("${store_name}");
            if !vars.contains(&store_sub) {
                vars.push(store_sub);
            }
        }
        search_from = abs_pos + 1;
    }
}

/// Extract identifiers assigned to on the LHS of simple assignment statements.
/// This scans at ALL depth levels (including inside if blocks, loops, etc.)
/// to find variable assignments that indicate the reactive statement modifies a variable.
fn extract_simple_assignments(code: &str) -> Vec<String> {
    let mut vars = Vec::new();
    let bytes = code.as_bytes();
    let mut i = 0;
    let mut prev: Option<u8> = None;

    while i < bytes.len() {
        if let Some((next, is_comment)) = skip_opaque(bytes, i, prev) {
            if !is_comment {
                prev = Some(b'x');
            }
            i = next;
            continue;
        }

        // Prefix `++x` / `--x`
        if (bytes[i] == b'+' && bytes.get(i + 1) == Some(&b'+'))
            || (bytes[i] == b'-' && bytes.get(i + 1) == Some(&b'-'))
        {
            let mut j = i + 2;
            while bytes.get(j) == Some(&b' ') {
                j += 1;
            }
            if let Some((ident, end)) = read_identifier(code, j) {
                if !is_reactive_keyword(&ident) && !vars.contains(&ident) {
                    vars.push(ident);
                }
                prev = Some(b'x');
                i = end;
                continue;
            }
        }

        if let Some((ident, end)) = read_identifier(code, i) {
            // A member property (`foo.x = …` / `foo.x += …` / `foo.x++`) is not
            // a declared variable: the assignment mutates the *base object*, not the
            // property. Recording the property would create a false reactive
            // dependency for any statement that reads an identifier of that
            // name (e.g. `$: { if (x) … }` spuriously depending on
            // `$: foo.x = count`), reordering otherwise-independent `$:`
            // statements away from source order.
            let is_member_prop = i > 0 && bytes[i - 1] == b'.';

            // Postfix `x++` / `x--`
            if (bytes.get(end) == Some(&b'+') && bytes.get(end + 1) == Some(&b'+'))
                || (bytes.get(end) == Some(&b'-') && bytes.get(end + 1) == Some(&b'-'))
            {
                if !is_member_prop && !is_reactive_keyword(&ident) && !vars.contains(&ident) {
                    vars.push(ident);
                }
                prev = Some(b'x');
                i = end + 2;
                continue;
            }

            let mut j = end;
            while bytes.get(j) == Some(&b' ') {
                j += 1;
            }

            // `=`, but not `==`, `=>`, or the tail of a compound operator
            if bytes.get(j) == Some(&b'=')
                && !matches!(bytes.get(j + 1), Some(b'=' | b'>'))
                && !matches!(
                    j.checked_sub(1).map(|k| bytes[k]),
                    Some(
                        b'!' | b'<' | b'>' | b'+' | b'-' | b'*' | b'/' | b'?' | b'&' | b'|' | b'^'
                    )
                )
                && !is_member_prop
                && !is_reactive_keyword(&ident)
                && !vars.contains(&ident)
            {
                vars.push(ident.clone());
            }

            // Compound assignment: `+=`, `-=`, `*=`, …
            if bytes.get(j + 1) == Some(&b'=')
                && matches!(
                    bytes.get(j),
                    Some(b'+' | b'-' | b'*' | b'/' | b'%' | b'&' | b'|' | b'^')
                )
                && bytes.get(j + 2) != Some(&b'=')
                && !is_member_prop
                && !is_reactive_keyword(&ident)
                && !vars.contains(&ident)
            {
                vars.push(ident);
            }

            prev = Some(b'x');
            i = end;
            continue;
        }

        let c = bytes[i];
        if !c.is_ascii_whitespace() {
            prev = Some(c);
        }
        i += 1;
    }
    vars
}

/// Identifier starting at byte `at`, with the byte offset just past it.
fn read_identifier(code: &str, at: usize) -> Option<(String, usize)> {
    let rest = code.get(at..)?;
    let first = rest.chars().next()?;
    if !(first.is_alphabetic() || first == '_' || first == '$') {
        return None;
    }
    let end = rest
        .char_indices()
        .find(|(_, c)| !(c.is_alphanumeric() || *c == '_' || *c == '$'))
        .map_or(rest.len(), |(k, _)| k);
    Some((rest[..end].to_string(), at + end))
}

/// Check if a string is a JS keyword that can't be a variable name.
fn is_reactive_keyword(s: &str) -> bool {
    matches!(
        s,
        "true"
            | "false"
            | "null"
            | "undefined"
            | "this"
            | "new"
            | "typeof"
            | "instanceof"
            | "void"
            | "delete"
            | "in"
            | "of"
            | "let"
            | "const"
            | "var"
            | "function"
            | "class"
            | "return"
            | "if"
            | "else"
            | "for"
            | "while"
            | "do"
            | "switch"
            | "case"
            | "break"
            | "continue"
            | "throw"
            | "try"
            | "catch"
            | "finally"
            | "import"
            | "export"
            | "default"
            | "async"
            | "await"
            | "yield"
    )
}

/// Extract all identifiers referenced in an expression (to find dependencies).
fn extract_reactive_rhs_identifiers(stmt: &str) -> Vec<String> {
    // Skip the `$:` prefix and the LHS assignment part
    let content = stmt.trim_start();
    let after_dollar = if let Some(rest) = content.strip_prefix("$:") {
        rest.trim()
    } else {
        return Vec::new();
    };

    // For transformed store expressions, also extract store subscription references.
    // `$.store_get($$store_subs ??= {}, '$b', b)` means this statement uses `$b`.
    let mut store_deps = Vec::new();
    {
        let finder_store_get = memmem::Finder::new(b"$.store_get(");
        let mut search_from = 0;
        while let Some(pos) = finder_store_get.find(&after_dollar.as_bytes()[search_from..]) {
            let abs_pos = search_from + pos;
            // Find the second argument (the '$name' string literal)
            let after_call = abs_pos + 12; // "$.store_get(".len()
            // Skip first arg ($$store_subs ??= {})
            if let Some(comma_pos) = after_dollar[after_call..].find(',') {
                let after_first_comma = after_call + comma_pos + 1;
                let rest = after_dollar[after_first_comma..].trim_start();
                // Look for '$name' pattern
                if let Some(rest_inner) = rest.strip_prefix('\'')
                    && let Some(end_quote) = rest_inner.find('\'')
                {
                    let store_sub = rest_inner[..end_quote].to_string();
                    if store_sub.starts_with('$') && !store_deps.contains(&store_sub) {
                        store_deps.push(store_sub);
                    }
                }
            }
            search_from = abs_pos + 1;
        }
    }

    // Extract all identifiers from the content, skipping object property keys.
    // An identifier is an object property key if it is immediately followed by `:` (after
    // optional whitespace), as in `{ details: null }`. We must NOT treat it as a dependency.
    // Exception: `? x : y` (ternary colon) should still be treated as a reference.
    //
    // Template literals (backtick strings) require special handling: `${expr}` interpolations
    // must be traversed so that identifiers inside them (e.g. `sum` in `` `${sum}` ``) are
    // correctly extracted as dependencies. Plain string content between interpolations is skipped.
    let mut idents = Vec::new();
    let chars: Vec<char> = after_dollar.chars().collect();
    let len = chars.len();
    let mut i = 0;

    // Scanning state machine. We use an explicit stack to handle nested template literals
    // and `${...}` expression blocks correctly.
    //
    // States:
    //  - in_plain_string: inside a `'...'` or `"..."` literal (skip until closing quote)
    //  - in_template: inside a `` `...` `` template literal but *outside* any `${...}` (skip text)
    //  - template_expr_depth: depth of `${...}` nesting inside template literals; > 0 means we
    //    are inside an expression interpolation and should extract identifiers normally
    //
    // To handle nested template literals (`` `outer ${`inner ${x}`}` ``), we push/pop a stack
    // that records whether we were in a template context when entering a `${...}` block.

    let mut in_plain_string = false;
    let mut plain_string_char = ' ';
    // Stack of brace-depths at which `${` was opened inside a template literal.
    // Each entry is the brace_depth value *before* the `{` of `${` was counted.
    // When `brace_depth` falls back to that value (i.e. we see the matching `}`),
    // we return to template-text scanning.
    let mut template_interp_stack: Vec<i32> = Vec::new();
    let mut in_template_text = false; // true when inside `` `...` `` outside `${...}`
    // Track brace depth to know when we are inside an object literal `{...}`.
    // Property keys only appear at the top level of `{...}` blocks.
    let mut brace_depth: i32 = 0;

    while i < len {
        let c = chars[i];

        // --- Plain string handling ('...' or "...") ---
        if in_plain_string {
            if c == '\\' {
                i += 2; // skip escaped character
                continue;
            }
            if c == plain_string_char {
                in_plain_string = false;
            }
            i += 1;
            continue;
        }

        // --- Template literal TEXT part (between `` ` `` and `${`, or between `}` and next `${` or `` ` ``) ---
        if in_template_text {
            if c == '\\' {
                i += 2;
                continue;
            }
            if c == '`' {
                // End of this template literal
                in_template_text = false;
                i += 1;
                continue;
            }
            if c == '$' && chars.get(i + 1).copied() == Some('{') {
                // Start of `${...}` expression — record current brace_depth before bumping
                template_interp_stack.push(brace_depth);
                in_template_text = false;
                i += 2; // skip `${`
                brace_depth += 1; // count the `{` so nested `{` objects are tracked
                continue;
            }
            // Regular template text — skip
            i += 1;
            continue;
        }

        // --- Normal expression scanning ---
        match c {
            '\'' | '"' => {
                in_plain_string = true;
                plain_string_char = c;
                i += 1;
            }
            '`' => {
                // Start of a template literal — switch to template-text mode
                in_template_text = true;
                i += 1;
            }
            '{' => {
                brace_depth += 1;
                i += 1;
            }
            '}' => {
                // If the current `}` closes the innermost template interpolation `${...}`,
                // pop the stack and return to template-text scanning.
                if template_interp_stack
                    .last()
                    .is_some_and(|&saved_depth| brace_depth == saved_depth + 1)
                {
                    template_interp_stack.pop();
                    in_template_text = true; // back to template text scanning
                    brace_depth -= 1;
                    i += 1;
                    continue;
                }
                brace_depth -= 1;
                i += 1;
            }
            _ if c.is_alphabetic() || c == '_' || c == '$' => {
                let start = i;
                while i < len && (chars[i].is_alphanumeric() || chars[i] == '_' || chars[i] == '$')
                {
                    i += 1;
                }
                let ident: String = chars[start..i].iter().collect();

                if !is_reactive_keyword(&ident) {
                    // Check if this identifier is an object property key.
                    // A property key is an identifier directly followed (after optional whitespace)
                    // by `:` that is NOT part of `::` (optional chaining is `?.`) and NOT a
                    // ternary colon (those appear after `?`). The simplest heuristic:
                    // if we are inside a `{...}` block (brace_depth > 0), and the next
                    // non-whitespace character after the identifier is `:` (not `:`+`:`),
                    // then it is a property key.
                    let mut j = i;
                    while j < len && (chars[j] == ' ' || chars[j] == '\t') {
                        j += 1;
                    }
                    let is_prop_key = brace_depth > 0
                        && j < len
                        && chars[j] == ':'
                        && chars.get(j + 1).copied().unwrap_or('\0') != ':';

                    if !is_prop_key {
                        idents.push(ident);
                    }
                }
            }
            _ => {
                i += 1;
            }
        }
    }
    // Add store subscription dependencies extracted from $.store_get() calls
    for dep in store_deps {
        if !idents.contains(&dep) {
            idents.push(dep);
        }
    }

    idents
}

/// Topologically sort reactive statements based on their variable dependencies.
fn sort_reactive_statements_topologically(stmts: Vec<Vec<&str>>) -> Vec<Vec<&str>> {
    let n = stmts.len();
    if n <= 1 {
        return stmts;
    }

    // Extract declared variables and dependencies for each statement
    let mut declared: Vec<Vec<String>> = Vec::new();
    let mut used: Vec<Vec<String>> = Vec::new();

    for stmt in &stmts {
        let joined = stmt.join("\n");
        declared.push(extract_reactive_lhs_vars(&joined));
        used.push(extract_reactive_rhs_identifiers(&joined));
    }

    // Build a map from variable name to all statement indices that declare it
    let mut var_to_stmts: rustc_hash::FxHashMap<String, Vec<usize>> =
        rustc_hash::FxHashMap::default();
    for (i, decls) in declared.iter().enumerate() {
        for decl in decls {
            var_to_stmts.entry(decl.clone()).or_default().push(i);
        }
    }

    // Build dependency edges: stmt i depends on stmt j if i uses a variable declared by j.
    // Skip if i itself also declares the same variable (no self-dependency through shared
    // variables - e.g. two reactive statements both assigning to `indirect_double`).
    let mut deps: Vec<Vec<usize>> = vec![Vec::new(); n];
    for (i, uses) in used.iter().enumerate() {
        for var in uses {
            if let Some(declaring_stmts) = var_to_stmts.get(var) {
                for &j in declaring_stmts {
                    if j != i && !declared[i].contains(var) && !deps[i].contains(&j) {
                        deps[i].push(j);
                    }
                }
            }
        }
    }

    // Topological sort using DFS
    let mut sorted_indices: Vec<usize> = Vec::new();
    let mut visited = vec![false; n];
    let mut in_progress = vec![false; n];

    fn topo_visit(
        idx: usize,
        deps: &[Vec<usize>],
        visited: &mut Vec<bool>,
        in_progress: &mut Vec<bool>,
        sorted: &mut Vec<usize>,
    ) {
        if visited[idx] || in_progress[idx] {
            return;
        }
        in_progress[idx] = true;
        for &dep in &deps[idx] {
            topo_visit(dep, deps, visited, in_progress, sorted);
        }
        in_progress[idx] = false;
        visited[idx] = true;
        sorted.push(idx);
    }

    for i in 0..n {
        topo_visit(
            i,
            &deps,
            &mut visited,
            &mut in_progress,
            &mut sorted_indices,
        );
    }

    // Return statements in sorted order
    sorted_indices
        .into_iter()
        .map(|i| stmts[i].clone())
        .collect()
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
    fn member_assignment_targets_are_not_recorded() {
        // Upstream's `AssignmentExpression` visitor takes the same branch for
        // every operator, and `extract_identifiers` yields nothing for a
        // member-expression target, so no operator records the property.
        assert!(extract_simple_assignments("obj.x = 1;").is_empty());
        assert!(extract_simple_assignments("obj.x += 1;").is_empty());
        assert!(extract_simple_assignments("a.b.c *= 2;").is_empty());
        assert!(extract_simple_assignments("obj.x++;").is_empty());
    }

    #[test]
    fn compound_member_assignment_does_not_reorder() {
        let out = reorder_reactive_statements_after_functions(
            "\tlet a = 1;\n\t$: a = x * 2;\n\t$: obj.x += 1;\n",
        );
        assert_eq!(out, "\tlet a = 1;\n\t$: a = x * 2;\n\t$: obj.x += 1;");
    }

    #[test]
    fn compound_identifier_assignment_still_reorders() {
        let out = reorder_reactive_statements_after_functions(
            "\tlet a = 1;\n\t$: a = x * 2;\n\t$: x += 1;\n",
        );
        assert_eq!(out, "\tlet a = 1;\n\t$: x += 1;\n\t$: a = x * 2;");
    }

    #[test]
    fn plain_identifier_assignment_targets_are_recorded() {
        assert_eq!(extract_simple_assignments("x = 1;"), vec!["x"]);
        assert_eq!(extract_simple_assignments("x += 1;"), vec!["x"]);
        assert_eq!(extract_simple_assignments("x++;"), vec!["x"]);
    }

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

    #[test]
    fn template_text_is_not_a_statement_boundary() {
        // A blank line, `$:`, `function ` or `//` inside a template literal is
        // literal text; the loops' first exit used to treat it as a boundary.
        for body in [
            "\n",
            "$: not a statement\n",
            "// not a comment\n",
            "function nope() {}\n",
        ] {
            let script =
                format!("let a = 1;\n$: msg =\n`hello\n{body}${{name}}`;\nlet after = 2;\n");
            let out = reorder_reactive_statements_after_functions(&script);
            assert!(
                out.contains(&format!("$: msg =\n`hello\n{body}${{name}}`;")),
                "statement split on {body:?}: {out}"
            );
        }
    }

    // Control is this change's own pre-fix state; the code it replaced passes too.
    #[test]
    fn continuation_interpolation_keeps_the_statement_whole() {
        // `$: msg =` continues onto a template whose `${` opens on the next line.
        let script = "let a = 1;\n$: msg =\n`hello ${\nname\n}`;\nlet after = 2;\n";
        let out = reorder_reactive_statements_after_functions(script);
        assert!(
            out.contains("$: msg =\n`hello ${\nname\n}`;"),
            "statement body split: {out}"
        );
    }

    // Control is this change's own pre-fix state; the code it replaced passes too.
    #[test]
    fn interpolation_brace_does_not_end_the_reactive_block_early() {
        let script = "let name = 'w';\n$: b = 1;\n$: { msg = `hello ${\nname\n}`;\n}\n";
        assert_eq!(
            reorder_reactive_statements_after_functions(script),
            script.trim_end()
        );
    }

    #[test]
    fn store_set_target_survives_non_ascii_before_the_call() {
        let mut vars = Vec::new();
        extract_store_set_targets(
            "{ const t = '\u{65e5}'; $.store_set(count, t); }",
            &mut vars,
        );
        assert_eq!(vars, vec!["$count".to_string()]);
    }

    #[test]
    fn simple_assignments_ignore_comments() {
        assert_eq!(extract_simple_assignments("// a = 1"), Vec::<String>::new());
        assert_eq!(
            extract_simple_assignments("/* a = 1 */ b = 2"),
            vec!["b".to_string()]
        );
    }

    #[test]
    fn simple_assignments_survive_non_ascii() {
        assert_eq!(
            extract_simple_assignments("const t = '\u{65e5}\u{672c}'; total = t.length;"),
            vec!["t".to_string(), "total".to_string()]
        );
    }

    #[test]
    fn line_comment_does_not_end_a_reactive_continuation() {
        // Official keeps `$: total = a + b` whole across an interleaved `// …` line.
        for (script, stmt) in [
            (
                "let foo = 1;\n$: total =\n// pick the sum\na + b;\nlet after = 2;\n",
                "$: total =\n// pick the sum\na + b;",
            ),
            (
                "let foo = 1;\n$: total =\na +\n// second operand\nb;\nlet after = 2;\n",
                "$: total =\na +\n// second operand\nb;",
            ),
        ] {
            let out = reorder_reactive_statements_after_functions(script);
            assert!(out.contains(stmt), "statement split at the comment: {out}");
        }
    }

    #[test]
    fn both_reactive_loops_share_one_line_classification() {
        // A comment is neither a boundary nor a line that can complete the
        // statement; the two accumulation loops used to disagree about the first
        // half of that.
        assert!(matches!(
            classify_continuation_line("// pick the sum", false),
            ContinuationLine::Comment
        ));
        for line in ["", "$: other = 1;", "function f() {}"] {
            assert!(matches!(
                classify_continuation_line(line, false),
                ContinuationLine::Boundary
            ));
        }
        for line in ["", "$: other = 1;", "function f() {}", "// c"] {
            assert!(matches!(
                classify_continuation_line(line, true),
                ContinuationLine::Code
            ));
        }
    }

    #[test]
    fn reactive_block_brace_in_comment_does_not_close_the_block() {
        let script = "let a = 1;\n$: {\n\tb = a; // }\n}\n$: c = b;\nlet d = 2;\n";
        let out = reorder_reactive_statements_after_functions(script);
        assert!(
            out.contains("$: {\n\tb = a; // }\n}"),
            "block split apart: {out}"
        );
    }
}
