//! Legacy transformation functions for server-side rendering.
//!
//! This module contains functions that handle legacy (non-runes) mode transformations
//! for server-side code generation, including `export let` declarations, reactive
//! `$:` statements, and related helper utilities.

use memchr::memmem;
use std::fmt::Write as _;

/// Check if the declaration string contains a semicolon at depth 0 (not inside braces/parens/brackets).
/// This is used to determine if an export let declaration is complete.
fn has_top_level_semicolon(s: &str) -> bool {
    // Byte-indexing is safe here: every character we test (`'`, `"`, `` ` ``,
    // `\\`, brackets, `;`) is ASCII, and UTF-8 continuation/leading bytes
    // (0x80-0xFF) never collide with ASCII bytes (0x00-0x7F).
    let bytes = s.as_bytes();
    let mut i = 0;
    let mut paren_depth: i32 = 0;
    let mut bracket_depth: i32 = 0;
    let mut brace_depth: i32 = 0;
    let mut in_string = false;
    let mut string_char = 0u8;

    while i < bytes.len() {
        let c = bytes[i];
        if in_string {
            if c == b'\\' {
                // Skip the escaped character (always ASCII in valid JS escapes:
                // \n, \t, \\, \", \u{..}, \x.., …).
                i += 2;
                continue;
            } else if c == string_char {
                in_string = false;
            }
        } else if c == b'"' || c == b'\'' || c == b'`' {
            in_string = true;
            string_char = c;
        } else {
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
        i += 1;
    }
    false
}

/// Truncate a declaration string at the first top-level semicolon and trim the result.
/// For example: `bg = "gre"; // comment` -> `bg = "gre"`.
/// If there is no top-level semicolon the string is returned trimmed as-is.
fn strip_at_top_level_semicolon(s: &str) -> String {
    let bytes = s.as_bytes();
    let mut i = 0;
    let mut paren_depth: i32 = 0;
    let mut bracket_depth: i32 = 0;
    let mut brace_depth: i32 = 0;
    let mut in_string = false;
    let mut string_char = 0u8;

    while i < bytes.len() {
        let c = bytes[i];
        if in_string {
            if c == b'\\' {
                i += 2;
                continue;
            } else if c == string_char {
                in_string = false;
            }
        } else if c == b'"' || c == b'\'' || c == b'`' {
            in_string = true;
            string_char = c;
        } else {
            match c {
                b'(' => paren_depth += 1,
                b')' => paren_depth -= 1,
                b'[' => bracket_depth += 1,
                b']' => bracket_depth -= 1,
                b'{' => brace_depth += 1,
                b'}' => brace_depth -= 1,
                b';' if paren_depth == 0 && bracket_depth == 0 && brace_depth == 0 => {
                    // Truncate at this semicolon. `i` points at an ASCII `;`,
                    // so `s[..i]` is always on a char boundary.
                    return s[..i].trim().to_string();
                }
                _ => {}
            }
        }
        i += 1;
    }
    // No top-level semicolon found - return as-is, stripping trailing semicolons
    s.trim_end_matches(';').trim().to_string()
}

/// Check if an export let declaration value appears to be syntactically complete.
/// Returns true if the expression doesn't need a continuation line.
fn export_let_declaration_seems_complete(decl: &str) -> bool {
    // The `decl` is the entire declarator text after `export let `, e.g. `x = 42` or `x = [1, 2`.
    // First, check if brackets/parens/braces are balanced - if unbalanced, definitely incomplete.
    let bytes = decl.as_bytes();
    let mut i = 0;
    let mut paren_depth: i32 = 0;
    let mut bracket_depth: i32 = 0;
    let mut brace_depth: i32 = 0;
    let mut in_string = false;
    let mut string_char = 0u8;

    while i < bytes.len() {
        let c = bytes[i];
        if in_string {
            if c == b'\\' {
                // Skip the escaped character
                i += 2;
                continue;
            } else if c == string_char {
                in_string = false;
            }
        } else if c == b'"' || c == b'\'' || c == b'`' {
            in_string = true;
            string_char = c;
        } else {
            match c {
                b'(' => paren_depth += 1,
                b')' => paren_depth -= 1,
                b'[' => bracket_depth += 1,
                b']' => bracket_depth -= 1,
                b'{' => brace_depth += 1,
                b'}' => brace_depth -= 1,
                _ => {}
            }
        }
        i += 1;
    }

    // If any depth is non-zero, definitely incomplete
    if paren_depth != 0 || bracket_depth != 0 || brace_depth != 0 || in_string {
        return false;
    }

    // Check for trailing operators that would require continuation
    let trimmed = decl.trim();
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

/// Return `s` truncated at the start of a trailing `//` or `/*` comment
/// (string-aware). Used by the line-based `export let` lowering so trailing
/// comments don't confuse declaration parsing.
pub(crate) fn strip_trailing_comment_for_decl(s: &str) -> &str {
    match find_trailing_comment_start(s) {
        Some(i) => s[..i].trim_end(),
        None => s,
    }
}

/// Byte offset of the last `,` at paren/bracket/brace depth 0 (string-aware).
fn find_last_top_level_comma(s: &str) -> Option<usize> {
    let bytes = s.as_bytes();
    let mut depth = 0i32;
    let mut in_string = false;
    let mut q = 0u8;
    let mut last = None;
    let mut i = 0;
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
        } else {
            match c {
                b'"' | b'\'' | b'`' => {
                    in_string = true;
                    q = c;
                }
                b'(' | b'[' | b'{' => depth += 1,
                b')' | b']' | b'}' => depth -= 1,
                b',' if depth == 0 => last = Some(i),
                _ => {}
            }
        }
        i += 1;
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
    let bytes = declaration.as_bytes();
    let mut depth = 0;
    let mut in_string = false;
    let mut string_char = 0u8;
    let mut segment_start = 0;

    for i in 0..bytes.len() {
        let c = bytes[i];
        if (c == b'"' || c == b'\'' || c == b'`') && (i == 0 || bytes[i - 1] != b'\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
            continue;
        }

        if in_string {
            continue;
        }

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
    let mut in_string = false;
    let mut string_char = 0u8;

    for i in 0..bytes.len() {
        let c = bytes[i];
        if (c == b'"' || c == b'\'' || c == b'`') && (i == 0 || bytes[i - 1] != b'\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
            continue;
        }

        if in_string {
            continue;
        }

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
    let mut in_string = false;
    let mut string_char = 0u8;

    for i in 0..bytes.len().saturating_sub(1) {
        let c = bytes[i];

        if (c == b'"' || c == b'\'' || c == b'`') && (i == 0 || bytes[i - 1] != b'\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
            continue;
        }

        if in_string {
            continue;
        }

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
    let mut in_string = false;
    let mut string_char = 0u8;

    for i in (0..bytes.len()).rev() {
        let c = bytes[i];

        if (c == b'"' || c == b'\'' || c == b'`') && (i == 0 || bytes[i - 1] != b'\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
            continue;
        }

        if in_string {
            continue;
        }

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
    let mut in_string = false;
    let mut string_char = 0u8;

    for i in (0..bytes.len().saturating_sub(1)).rev() {
        let c = bytes[i];
        let next = bytes[i + 1];

        if (c == b'"' || c == b'\'' || c == b'`') && (i == 0 || bytes[i - 1] != b'\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
            continue;
        }

        if in_string {
            continue;
        }

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
    let mut in_string = false;
    let mut string_char = 0u8;
    let mut question_pos = None;

    for i in 0..bytes.len() {
        let c = bytes[i];

        if (c == b'"' || c == b'\'' || c == b'`') && (i == 0 || bytes[i - 1] != b'\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
            continue;
        }

        if in_string {
            continue;
        }

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

/// Sentinel label used to hide nested (non-top-level) `$:` labels from the
/// line-based legacy reactive-statement transforms. Upstream only treats
/// `$:` LabeledStatements at the TOP level of the instance script as
/// reactive; a `$:` inside a function body is a plain JS label and must stay
/// in place untouched.
pub(crate) const NESTED_REACTIVE_LABEL: &str = "$_rsvelte_nested_label";

/// Replace nested (brace/paren/bracket depth > 0) `$:` labels with the
/// `NESTED_REACTIVE_LABEL` sentinel so the legacy transforms (which scan
/// line-by-line for `$:`) skip them. Returns `(masked, changed)`.
pub(crate) fn mask_nested_reactive_labels(script: &str) -> (String, bool) {
    if !script.contains("$:") {
        return (script.to_string(), false);
    }
    let bytes = script.as_bytes();
    let len = bytes.len();
    let mut out: Vec<u8> = Vec::with_capacity(script.len() + 32);
    let mut depth = 0i32;
    let mut i = 0usize;
    let mut changed = false;
    while i < len {
        let c = bytes[i];
        match c {
            b'"' | b'\'' | b'`' => {
                let q = c;
                let start = i;
                i += 1;
                while i < len {
                    if bytes[i] == b'\\' {
                        i += 2;
                        continue;
                    }
                    if bytes[i] == q {
                        i += 1;
                        break;
                    }
                    i += 1;
                }
                out.extend_from_slice(&bytes[start..i.min(len)]);
            }
            b'/' if i + 1 < len && bytes[i + 1] == b'/' => {
                let eol = memchr::memchr(b'\n', &bytes[i..])
                    .map(|p| i + p)
                    .unwrap_or(len);
                out.extend_from_slice(&bytes[i..eol]);
                i = eol;
            }
            b'/' if i + 1 < len && bytes[i + 1] == b'*' => {
                let close = memchr::memmem::find(&bytes[i + 2..], b"*/")
                    .map(|p| i + 2 + p + 2)
                    .unwrap_or(len);
                out.extend_from_slice(&bytes[i..close.min(len)]);
                i = close;
            }
            b'{' | b'(' | b'[' => {
                depth += 1;
                out.push(c);
                i += 1;
            }
            b'}' | b')' | b']' => {
                depth -= 1;
                out.push(c);
                i += 1;
            }
            b'$' if depth > 0
                && i + 1 < len
                && bytes[i + 1] == b':'
                && (i == 0 || {
                    let p = bytes[i - 1];
                    !(p.is_ascii_alphanumeric() || p == b'_' || p == b'$' || p == b'.')
                }) =>
            {
                out.extend_from_slice(NESTED_REACTIVE_LABEL.as_bytes());
                i += 1; // keep the `:`
                changed = true;
            }
            _ => {
                out.push(c);
                i += 1;
            }
        }
    }
    (
        String::from_utf8(out).unwrap_or_else(|_| script.to_string()),
        changed,
    )
}

/// Restore nested `$:` labels masked by `mask_nested_reactive_labels`.
pub(crate) fn unmask_nested_reactive_labels(script: &str) -> String {
    script.replace(NESTED_REACTIVE_LABEL, "$")
}

/// Extract variable names from legacy reactive `$:` statements.
/// Returns a `let` declaration with variables in topological dependency order
/// (dependencies before dependents), matching the official Svelte compiler output.
pub(crate) fn extract_legacy_reactive_var_declaration(script: &str) -> String {
    let mut declared_vars: rustc_hash::FxHashSet<String> = rustc_hash::FxHashSet::default();

    for line in script.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with("$:") {
            continue;
        }
        collect_declared_vars(trimmed, &mut declared_vars);
    }

    // Collect reactive statements (each as a single string for now; multi-line not supported here)
    let mut reactive_stmts: Vec<String> = Vec::new();

    for line in script.lines() {
        let trimmed = line.trim();
        if !trimmed.starts_with("$:") {
            continue;
        }
        reactive_stmts.push(trimmed.to_string());
    }

    if reactive_stmts.is_empty() {
        return String::new();
    }

    // Determine which vars each reactive stmt declares and which it uses.
    // Build a dependency graph and topologically sort the stmts.
    let n = reactive_stmts.len();
    let mut stmt_declared: Vec<Vec<String>> = Vec::new();
    let mut stmt_used: Vec<Vec<String>> = Vec::new();

    for stmt in &reactive_stmts {
        let mut vars = Vec::new();
        let after_label = stmt[2..].trim();
        let after_label = after_label.trim_end_matches(';').trim();
        let unwrapped = if after_label.starts_with('(') && after_label.ends_with(')') {
            after_label[1..after_label.len() - 1].trim()
        } else {
            after_label
        };
        if let Some(eq_pos) = find_assignment_eq(unwrapped) {
            let lhs = unwrapped[..eq_pos].trim();
            extract_identifiers_from_pattern(lhs, &mut vars, &declared_vars);
        }
        stmt_declared.push(vars);

        // Collect identifiers used on the RHS
        stmt_used.push(extract_reactive_rhs_identifiers(stmt));
    }

    // Build var -> stmt index map
    let mut var_to_stmt: rustc_hash::FxHashMap<String, usize> = rustc_hash::FxHashMap::default();
    for (i, decls) in stmt_declared.iter().enumerate() {
        for decl in decls {
            var_to_stmt.insert(decl.clone(), i);
        }
    }

    // Build deps: stmt i depends on stmt j if i uses a var declared by j
    let mut deps: Vec<Vec<usize>> = vec![Vec::new(); n];
    for (i, uses) in stmt_used.iter().enumerate() {
        for var in uses {
            if let Some(&j) = var_to_stmt.get(var)
                && j != i
            {
                deps[i].push(j);
            }
        }
    }

    // Topological sort (DFS post-order = dependencies first)
    fn topo_visit_decl(
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
            topo_visit_decl(dep, deps, visited, in_progress, sorted);
        }
        in_progress[idx] = false;
        visited[idx] = true;
        sorted.push(idx);
    }

    let mut sorted_indices: Vec<usize> = Vec::new();
    let mut visited = vec![false; n];
    let mut in_progress = vec![false; n];
    for i in 0..n {
        topo_visit_decl(
            i,
            &deps,
            &mut visited,
            &mut in_progress,
            &mut sorted_indices,
        );
    }

    // Collect declared vars in topological order (deduplicating)
    let mut seen: rustc_hash::FxHashSet<String> = rustc_hash::FxHashSet::default();
    let mut reactive_vars: Vec<String> = Vec::new();
    for &idx in &sorted_indices {
        for var in &stmt_declared[idx] {
            if seen.insert(var.clone()) {
                reactive_vars.push(var.clone());
            }
        }
    }

    if reactive_vars.is_empty() {
        return String::new();
    }

    format!(
        "\tlet {};",
        reactive_vars
            .iter()
            .map(|s| s.as_str())
            .collect::<Vec<_>>()
            .join(", ")
    )
}

fn collect_declared_vars(trimmed: &str, declared: &mut rustc_hash::FxHashSet<String>) {
    let decl_rest = trimmed
        .strip_prefix("export let ")
        .or_else(|| trimmed.strip_prefix("export var "))
        .or_else(|| trimmed.strip_prefix("export const "))
        .or_else(|| trimmed.strip_prefix("let "))
        .or_else(|| trimmed.strip_prefix("var "))
        .or_else(|| trimmed.strip_prefix("const "));

    if let Some(rest) = decl_rest {
        let mut depth = 0;
        let mut current = String::new();
        for c in rest.chars() {
            match c {
                '(' | '[' | '{' => {
                    depth += 1;
                    current.push(c);
                }
                ')' | ']' | '}' => {
                    depth -= 1;
                    current.push(c);
                }
                ',' if depth == 0 => {
                    extract_var_name_from_declarator(current.trim(), declared);
                    current.clear();
                }
                ';' if depth == 0 => {
                    extract_var_name_from_declarator(current.trim(), declared);
                    current.clear();
                    break;
                }
                _ => current.push(c),
            }
        }
        let remaining = current.trim().trim_end_matches(';');
        if !remaining.is_empty() {
            extract_var_name_from_declarator(remaining, declared);
        }
    }
}

fn extract_var_name_from_declarator(
    declarator: &str,
    declared: &mut rustc_hash::FxHashSet<String>,
) {
    let trimmed = declarator.trim();
    if trimmed.is_empty() {
        return;
    }
    let name_part = if let Some(eq) = trimmed.find('=') {
        trimmed[..eq].trim()
    } else {
        trimmed
    };
    if is_simple_identifier(name_part) {
        declared.insert(name_part.to_string());
    }
}

fn find_assignment_eq(s: &str) -> Option<usize> {
    let bytes = s.as_bytes();
    let mut i = 0;
    let mut depth = 0;

    while i < bytes.len() {
        match bytes[i] {
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => depth -= 1,
            b'=' if depth == 0 => {
                let next = bytes.get(i + 1).copied();
                let prev = if i > 0 { Some(bytes[i - 1]) } else { None };
                if next == Some(b'=') || next == Some(b'>') {
                    i += 2;
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
                    i += 1;
                    continue;
                }
                return Some(i);
            }
            _ => {}
        }
        i += 1;
    }
    None
}

fn extract_identifiers_from_pattern(
    pattern: &str,
    vars: &mut Vec<String>,
    declared: &rustc_hash::FxHashSet<String>,
) {
    let trimmed = pattern.trim();

    if trimmed.is_empty() {
        return;
    }

    if is_simple_identifier(trimmed) {
        // Skip store subscriptions (identifiers starting with $) - they're handled separately
        if !declared.contains(trimmed) && !trimmed.starts_with('$') {
            vars.push(trimmed.to_string());
        }
        return;
    }

    if trimmed.starts_with('[') && trimmed.ends_with(']') {
        let inner = &trimmed[1..trimmed.len() - 1];
        extract_destructured_names(inner, vars, declared);
        return;
    }

    if trimmed.starts_with('(') && trimmed.ends_with(')') {
        let inner = trimmed[1..trimmed.len() - 1].trim();
        if inner.starts_with('{') && inner.ends_with('}') {
            let obj_inner = &inner[1..inner.len() - 1];
            extract_destructured_names(obj_inner, vars, declared);
        }
        return;
    }

    if trimmed.starts_with('{') && trimmed.ends_with('}') {
        let inner = &trimmed[1..trimmed.len() - 1];
        extract_destructured_names(inner, vars, declared);
    }
}

fn extract_destructured_names(
    inner: &str,
    vars: &mut Vec<String>,
    declared: &rustc_hash::FxHashSet<String>,
) {
    let mut depth = 0;
    let mut current = String::new();

    for c in inner.chars() {
        match c {
            '(' | '[' | '{' => {
                depth += 1;
                current.push(c);
            }
            ')' | ']' | '}' => {
                depth -= 1;
                current.push(c);
            }
            ',' if depth == 0 => {
                process_destructured_element(current.trim(), vars, declared);
                current.clear();
            }
            _ => current.push(c),
        }
    }
    let remaining = current.trim().to_string();
    if !remaining.is_empty() {
        process_destructured_element(&remaining, vars, declared);
    }
}

fn process_destructured_element(
    element: &str,
    vars: &mut Vec<String>,
    declared: &rustc_hash::FxHashSet<String>,
) {
    let trimmed = element.trim();
    if trimmed.is_empty() {
        return;
    }

    let name = if let Some(rest) = trimmed.strip_prefix("...") {
        rest.trim()
    } else if trimmed.contains(':') {
        let parts: Vec<&str> = trimmed.splitn(2, ':').collect();
        parts[1].trim()
    } else {
        trimmed
    };

    let name = if let Some(eq) = name.find('=') {
        name[..eq].trim()
    } else {
        name
    };

    if is_simple_identifier(name) && !declared.contains(name) {
        vars.push(name.to_string());
    }
}

/// Reorder legacy reactive `$:` statements in SSR script to appear after all other
/// script declarations (function declarations, variable declarations, function calls).
///
/// In the official Svelte compiler, reactive `$:` statements in SSR mode are placed
/// AFTER all other script content because reactive computed values should run after
/// all initialization code.
///
/// This function moves `$:` statement lines/blocks to the end of the script content.
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
        let mut i = 0;
        while i < lines.len() {
            let trimmed = lines[i].trim();
            if in_reactive_multiline {
                // Count braces to find the end of the reactive statement
                for c in trimmed.chars() {
                    match c {
                        '{' | '(' | '[' => reactive_depth += 1,
                        '}' | ')' | ']' => reactive_depth -= 1,
                        _ => {}
                    }
                }
                if reactive_depth <= 0 {
                    in_reactive_multiline = false;
                }
                i += 1;
                continue;
            }
            if trimmed.starts_with("$:") {
                saw_reactive = true;
                // Count braces in the reactive statement line to detect multiline
                let mut depth: i32 = 0;
                for c in trimmed.chars() {
                    match c {
                        '{' | '(' | '[' => depth += 1,
                        '}' | ')' | ']' => depth -= 1,
                        _ => {}
                    }
                }
                if depth > 0 {
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
                        i += 1;
                        while i < lines.len() {
                            let nt = lines[i].trim();
                            if nt.is_empty() || nt.starts_with("$:") || nt.starts_with("function ")
                            {
                                break;
                            }
                            for c in nt.chars() {
                                match c {
                                    '{' | '(' | '[' => acc_depth += 1,
                                    '}' | ')' | ']' => acc_depth -= 1,
                                    _ => {}
                                }
                            }
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
                            if !is_cont && !following_starts && acc_depth <= 0 {
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
            {
                let bytes = trimmed.as_bytes();
                let mut ci = 0;
                while ci < bytes.len() {
                    if bytes[ci] == b'\\' && ci + 1 < bytes.len() {
                        ci += 2; // skip escaped char
                        continue;
                    }
                    if bytes[ci] == b'`' {
                        in_template_literal = !in_template_literal;
                    } else if !in_template_literal {
                        match bytes[ci] {
                            b'{' | b'(' | b'[' => depth += 1,
                            b'}' | b')' | b']' => depth -= 1,
                            _ => {}
                        }
                    }
                    ci += 1;
                }
            }

            if depth > 0 || in_template_literal {
                // Multi-line reactive statement (or template literal) - collect until balanced
                i += 1;
                while i < lines.len() && (depth > 0 || in_template_literal) {
                    let next = lines[i];
                    stmt_lines.push(next);
                    let bytes = next.as_bytes();
                    let mut ci = 0;
                    while ci < bytes.len() {
                        if bytes[ci] == b'\\' && ci + 1 < bytes.len() {
                            ci += 2;
                            continue;
                        }
                        if bytes[ci] == b'`' {
                            in_template_literal = !in_template_literal;
                        } else if !in_template_literal {
                            match bytes[ci] {
                                b'{' | b'(' | b'[' => depth += 1,
                                b'}' | b')' | b']' => depth -= 1,
                                _ => {}
                            }
                        }
                        ci += 1;
                    }
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
                    let mut accumulated_depth: i32 = 0;
                    // Count depth from the initial $: line too
                    for c in trimmed.chars() {
                        match c {
                            '{' | '(' | '[' => accumulated_depth += 1,
                            '}' | ')' | ']' => accumulated_depth -= 1,
                            _ => {}
                        }
                    }
                    while i < lines.len() {
                        let next = lines[i];
                        let next_trimmed = next.trim();
                        if next_trimmed.is_empty()
                            || next_trimmed.starts_with("$:")
                            || next_trimmed.starts_with("function ")
                            || next_trimmed.starts_with("//")
                        {
                            break;
                        }
                        stmt_lines.push(next);
                        // Update accumulated depth
                        for c in next_trimmed.chars() {
                            match c {
                                '{' | '(' | '[' => accumulated_depth += 1,
                                '}' | ')' | ']' => accumulated_depth -= 1,
                                _ => {}
                            }
                        }
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
                        if !next_is_continuation && !following_starts_cont && accumulated_depth <= 0
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
            for c in trimmed.chars() {
                match c {
                    '{' | '(' | '[' => depth += 1,
                    '}' | ')' | ']' => depth -= 1,
                    _ => {}
                }
            }
            i += 1;
            if depth > 0 {
                while i < n && depth > 0 {
                    let next = lines[i];
                    stmt_lines.push(next);
                    for c in next.chars() {
                        match c {
                            '{' | '(' | '[' => depth += 1,
                            '}' | ')' | ']' => depth -= 1,
                            _ => {}
                        }
                    }
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
        let after_call = abs_pos + 12; // "$.store_set(".len()
        // Read the first argument (store name)
        let mut j = after_call;
        let chars: Vec<char> = code.chars().collect();
        while j < chars.len() && (chars[j] == ' ' || chars[j] == '\t') {
            j += 1;
        }
        let name_start = j;
        while j < chars.len() && (chars[j].is_alphanumeric() || chars[j] == '_' || chars[j] == '$')
        {
            j += 1;
        }
        if j > name_start {
            let store_name: String = chars[name_start..j].iter().collect();
            let store_sub = format!("${}", store_name);
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
    // Find patterns like `identifier =` (not `==`), `identifier++`, `identifier--`,
    // `++identifier`, `--identifier`
    let chars: Vec<char> = code.chars().collect();
    let len = chars.len();
    let mut i = 0;
    let mut in_string = false;
    let mut string_char = ' ';

    while i < len {
        let c = chars[i];

        // Track string literals to avoid matching inside them
        if (c == '\'' || c == '"' || c == '`') && !in_string {
            in_string = true;
            string_char = c;
            i += 1;
            continue;
        }
        if in_string {
            if c == string_char && (i == 0 || chars[i - 1] != '\\') {
                in_string = false;
            }
            i += 1;
            continue;
        }

        // Check for `++identifier` and `--identifier` prefix operators
        if i + 2 < len
            && ((chars[i] == '+' && chars[i + 1] == '+')
                || (chars[i] == '-' && chars[i + 1] == '-'))
        {
            let op_end = i + 2;
            // Skip whitespace after operator
            let mut j = op_end;
            while j < len && chars[j] == ' ' {
                j += 1;
            }
            // Read identifier
            if j < len && (chars[j].is_alphabetic() || chars[j] == '_' || chars[j] == '$') {
                let start = j;
                while j < len && (chars[j].is_alphanumeric() || chars[j] == '_' || chars[j] == '$')
                {
                    j += 1;
                }
                let ident: String = chars[start..j].iter().collect();
                if !is_reactive_keyword(&ident) && !vars.contains(&ident) {
                    vars.push(ident);
                }
                i = j;
                continue;
            }
        }

        if c.is_alphabetic() || c == '_' || c == '$' {
            // Read identifier
            let start = i;
            while i < len && (chars[i].is_alphanumeric() || chars[i] == '_' || chars[i] == '$') {
                i += 1;
            }
            let ident: String = chars[start..i].iter().collect();

            // Check for postfix `++` or `--`
            if i + 1 < len
                && ((chars[i] == '+' && chars[i + 1] == '+')
                    || (chars[i] == '-' && chars[i + 1] == '-'))
            {
                if !is_reactive_keyword(&ident) && !vars.contains(&ident) {
                    vars.push(ident.clone());
                }
                i += 2;
                continue;
            }

            // Skip whitespace
            let mut j = i;
            while j < len && chars[j] == ' ' {
                j += 1;
            }

            // Check for `=` (not `==` or `=>`)
            if j < len && chars[j] == '=' {
                let next = chars.get(j + 1).copied().unwrap_or('\0');
                if next != '=' && next != '>' {
                    let prev = if j > 0 { chars[j - 1] } else { '\0' };
                    if prev != '!'
                        && prev != '<'
                        && prev != '>'
                        && prev != '+'
                        && prev != '-'
                        && prev != '*'
                        && prev != '/'
                        && prev != '?'
                        && prev != '&'
                        && prev != '|'
                        && prev != '^'
                    {
                        // This is an assignment to `ident`
                        if !is_reactive_keyword(&ident) && !vars.contains(&ident) {
                            vars.push(ident.clone());
                        }
                    }
                }
            }

            // Check for compound assignment operators: +=, -=, *=, /=, etc.
            if j + 1 < len && chars[j + 1] == '=' {
                let op = chars[j];
                if matches!(op, '+' | '-' | '*' | '/' | '%' | '&' | '|' | '^') {
                    // Check it's not `==` following
                    let after_eq = chars.get(j + 2).copied().unwrap_or('\0');
                    if after_eq != '=' && !is_reactive_keyword(&ident) && !vars.contains(&ident) {
                        vars.push(ident.clone());
                    }
                }
            }
        } else {
            i += 1;
        }
    }
    vars
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
    let mut idents = Vec::new();
    let chars: Vec<char> = after_dollar.chars().collect();
    let len = chars.len();
    let mut i = 0;
    let mut in_string = false;
    let mut string_char = ' ';
    // Track brace depth to know when we are inside an object literal `{...}`.
    // Property keys only appear at the top level of `{...}` blocks.
    let mut brace_depth: i32 = 0;

    while i < len {
        let c = chars[i];
        if c == '\'' || c == '"' || c == '`' {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char && (i == 0 || chars[i - 1] != '\\') {
                in_string = false;
            }
            i += 1;
            continue;
        }
        if in_string {
            i += 1;
            continue;
        }

        match c {
            '{' => {
                brace_depth += 1;
                i += 1;
            }
            '}' => {
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
    let mut i = 0;
    let mut in_string = false;
    let mut string_char = 0u8;

    while i < bytes.len() {
        if in_string {
            if bytes[i] == b'\\' {
                i += 2;
                continue;
            }
            if bytes[i] == string_char {
                in_string = false;
            }
            i += 1;
            continue;
        }

        if bytes[i] == b'\'' || bytes[i] == b'"' || bytes[i] == b'`' {
            in_string = true;
            string_char = bytes[i];
            i += 1;
            continue;
        }

        if bytes[i] == b'{' || bytes[i] == b'[' {
            depth += 1;
        } else if bytes[i] == b'}' || bytes[i] == b']' {
            depth -= 1;
            if depth == 0 {
                return Some(i + 1);
            }
        }

        i += 1;
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
    let bytes = prop.as_bytes();
    let mut depth = 0;
    for i in 0..bytes.len() {
        let ch = bytes[i];
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
    let bytes = s.as_bytes();
    let mut result = Vec::new();
    let mut depth = 0;
    let mut start = 0;
    let mut in_string = false;
    let mut string_char = 0u8;

    for i in 0..bytes.len() {
        let ch = bytes[i];
        if in_string {
            if ch == b'\\' {
                continue;
            }
            if ch == string_char {
                in_string = false;
            }
            continue;
        }
        if ch == b'\'' || ch == b'"' || ch == b'`' {
            in_string = true;
            string_char = ch;
            continue;
        }
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
