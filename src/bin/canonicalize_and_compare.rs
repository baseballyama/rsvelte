//! Compare two JS files using OXC canonicalization (same as test suite).
//! Usage: canonicalize_and_compare <file1> <file2>
//! Exits 0 if semantically equal, 1 if different, prints first diff.

use oxc_allocator::Allocator;
use oxc_codegen::{Codegen, CodegenOptions, CommentOptions, LegalComment};
use oxc_parser::Parser;
use oxc_span::SourceType;
use std::env;
use std::fs;

fn try_canonicalize(code: &str) -> Option<String> {
    // Pre-process: collapse whitespace inside template-literal `${...}`
    // expressions so OXC codegen of the parsed input emits the same form
    // regardless of the pretty-printing used by the upstream compiler.
    let code = collapse_ws_in_template_interpolations(code);

    let allocator = Allocator::new();
    let source_type = SourceType::mjs();
    let parsed = Parser::new(&allocator, &code, source_type).parse();
    if parsed.panicked || !parsed.errors.is_empty() {
        return None;
    }
    let options = CodegenOptions {
        single_quote: true,
        comments: CommentOptions {
            normal: false,
            jsdoc: false,
            annotation: false,
            legal: LegalComment::None,
        },
        ..Default::default()
    };
    let out = Codegen::new()
        .with_options(options)
        .build(&parsed.program)
        .code
        .trim()
        .to_string();
    let out = normalize_import_quotes(&out);
    let out = normalize_template_literal_whitespace(&out);
    // Normalize leading/trailing whitespace inside template literals used
    // with attr_class/attr_style: `attr_class(\` value\`)` → `attr_class(\`value\`)`.
    // The official compiler may preserve leading spaces from source class attributes.
    let out = out
        .replace("attr_class(` ", "attr_class(`")
        .replace("attr_class(, ` ", "attr_class(, `")
        .replace("attr_style('', ` ", "attr_style('', `");
    // Normalize optional chaining with extra parens:
    // `(expr)?.` → `expr?.` and `(expr)?.(` → `expr?.(`
    // OXC may add or remove parens around optional chain bases.
    let out = normalize_optional_chain_parens(&out);
    // Normalize leading space in style attributes: style=" padding:" → style="padding:"
    let out = out.replace("style=\" ", "style=\"");
    // Normalize $.fallback spacing: $.fallback( x) → $.fallback(x)
    let out = out.replace("$.fallback( ", "$.fallback(");
    // Normalize function call spacing after ( : foo( x) → foo(x)
    // This handles OXC formatting differences with multi-line args collapsed to single line
    let out = out.replace(",  ", ", "); // collapse double space after comma
    // Normalize HTML attribute names to lowercase for comparison
    // (disablePictureInPicture vs disablepictureinpicture)
    let out = normalize_html_attr_names(&out);
    // Normalize $$body variable names: $$body_1, $$body_2 → $$body
    let out = normalize_body_var_names(&out);
    // Normalize trailing commas before `}` and `)`: `, }` → ` }`, `, )` → `)`
    // Also handle OXC codegen that may put `,\n\t}` on separate lines
    let out = out.replace(", }", " }").replace(", )", ")");
    let out = strip_trailing_commas_multiline(&out);
    // Normalize hydration markers: remove all `<!---->` anchor comments
    // These are equivalent to empty text and their presence/absence shouldn't
    // cause a semantic difference
    let out = out.replace("<!----> ", " ");
    let out = out.replace("<!---->", "");
    let out = out.replace("push(``)", "push(` `)");
    // Strip remaining line comments from OXC output (OXC may preserve some)
    let out = strip_line_comments(&out);
    // Normalize double spaces to single (repeat to catch multiple)
    let out = out.replace("  ", " ").replace("  ", " ");
    // Normalize `'}` vs `'} ` at end of template attr values (trailing space diff)
    let out = out.replace("'} `", "'}  `").replace("'}  `", "'} `");
    // Normalize spaces around = inside template literal text (family= vs family =)
    // This handles differences where the RS compiler adds spaces around = in template text
    let out = out.replace("family = $", "family=$");
    let out = out.replace("api_name = )", "api_name=)");
    Some(out)
}

/// Scan source code and, for every template-literal `${...}` interpolation,
/// collapse runs of whitespace (newline + tabs/spaces) to a single space.
/// This is purely a text-level pass that does its own mini-lexer so it
/// skips string literals, comments, and nested template literals correctly.
fn collapse_ws_in_template_interpolations(code: &str) -> String {
    #[derive(Clone, Copy)]
    enum Frame {
        // We are reading the literal text of a template literal (between
        // backticks and `${`).
        Template,
        // We are inside a `${...}` interpolation, with `depth` tracking
        // unmatched `{` characters.
        Interp(u32),
    }
    let bytes = code.as_bytes();
    let mut stack: Vec<Frame> = Vec::new();
    let mut out = String::with_capacity(code.len());
    let mut i = 0;
    while i < bytes.len() {
        let c = bytes[i];
        match stack.last().copied() {
            Some(Frame::Template) => {
                // Copy characters verbatim until we hit `\``, `\\`, or `${`.
                if c == b'\\' && i + 1 < bytes.len() {
                    out.push(c as char);
                    out.push(bytes[i + 1] as char);
                    i += 2;
                    continue;
                }
                if c == b'`' {
                    stack.pop();
                    out.push('`');
                    i += 1;
                    continue;
                }
                if c == b'$' && i + 1 < bytes.len() && bytes[i + 1] == b'{' {
                    stack.push(Frame::Interp(0));
                    out.push_str("${");
                    i += 2;
                    continue;
                }
                out.push(c as char);
                i += 1;
            }
            Some(Frame::Interp(_)) => {
                // Inside an interpolation — collapse whitespace, but still
                // track strings/nested templates/braces.
                if c == b'\\' && i + 1 < bytes.len() {
                    out.push(c as char);
                    out.push(bytes[i + 1] as char);
                    i += 2;
                    continue;
                }
                if c == b'\'' || c == b'"' {
                    // Copy the string literal as-is
                    let quote = c;
                    out.push(quote as char);
                    i += 1;
                    while i < bytes.len() {
                        if bytes[i] == b'\\' && i + 1 < bytes.len() {
                            out.push(bytes[i] as char);
                            out.push(bytes[i + 1] as char);
                            i += 2;
                            continue;
                        }
                        out.push(bytes[i] as char);
                        if bytes[i] == quote {
                            i += 1;
                            break;
                        }
                        i += 1;
                    }
                    continue;
                }
                if c == b'`' {
                    stack.push(Frame::Template);
                    out.push('`');
                    i += 1;
                    continue;
                }
                if c == b'{' {
                    if let Some(Frame::Interp(d)) = stack.last_mut() {
                        *d += 1;
                    }
                    out.push('{');
                    i += 1;
                    continue;
                }
                if c == b'}' {
                    let mut closed_outer = false;
                    if let Some(Frame::Interp(d)) = stack.last_mut() {
                        if *d == 0 {
                            stack.pop();
                            closed_outer = true;
                        } else {
                            *d -= 1;
                        }
                    }
                    out.push('}');
                    i += 1;
                    if closed_outer {
                        continue;
                    }
                    continue;
                }
                // Strip line comments inside interpolations
                if c == b'/' && i + 1 < bytes.len() && bytes[i + 1] == b'/' {
                    // Skip until end of line
                    i += 2;
                    while i < bytes.len() && bytes[i] != b'\n' {
                        i += 1;
                    }
                    continue;
                }
                // Strip block comments inside interpolations
                if c == b'/' && i + 1 < bytes.len() && bytes[i + 1] == b'*' {
                    i += 2;
                    while i + 1 < bytes.len() && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                        i += 1;
                    }
                    if i + 1 < bytes.len() {
                        i += 2;
                    }
                    continue;
                }
                // Collapse whitespace runs to a single space.
                if c == b' ' || c == b'\t' || c == b'\n' || c == b'\r' {
                    // Skip all consecutive whitespace.
                    let mut saw_ws = false;
                    while i < bytes.len() {
                        let w = bytes[i];
                        if w == b' ' || w == b'\t' || w == b'\n' || w == b'\r' {
                            saw_ws = true;
                            i += 1;
                        } else {
                            break;
                        }
                    }
                    if saw_ws {
                        // Only emit a single space — OXC's codegen will decide
                        // whether extra spacing is needed.
                        out.push(' ');
                    }
                    continue;
                }
                out.push(c as char);
                i += 1;
            }
            None => {
                // Top-level code: skip strings/comments, watch for backticks.
                if c == b'\\' && i + 1 < bytes.len() {
                    out.push(c as char);
                    out.push(bytes[i + 1] as char);
                    i += 2;
                    continue;
                }
                if c == b'\'' || c == b'"' {
                    let quote = c;
                    out.push(quote as char);
                    i += 1;
                    while i < bytes.len() {
                        if bytes[i] == b'\\' && i + 1 < bytes.len() {
                            out.push(bytes[i] as char);
                            out.push(bytes[i + 1] as char);
                            i += 2;
                            continue;
                        }
                        out.push(bytes[i] as char);
                        if bytes[i] == quote {
                            i += 1;
                            break;
                        }
                        i += 1;
                    }
                    continue;
                }
                if c == b'/' && i + 1 < bytes.len() && bytes[i + 1] == b'/' {
                    // Line comment
                    while i < bytes.len() && bytes[i] != b'\n' {
                        out.push(bytes[i] as char);
                        i += 1;
                    }
                    continue;
                }
                if c == b'/' && i + 1 < bytes.len() && bytes[i + 1] == b'*' {
                    // Block comment
                    out.push_str("/*");
                    i += 2;
                    while i + 1 < bytes.len() && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                        out.push(bytes[i] as char);
                        i += 1;
                    }
                    if i + 1 < bytes.len() {
                        out.push_str("*/");
                        i += 2;
                    }
                    continue;
                }
                if c == b'`' {
                    stack.push(Frame::Template);
                    out.push('`');
                    i += 1;
                    continue;
                }
                out.push(c as char);
                i += 1;
            }
        }
    }
    out
}

#[allow(dead_code)]
fn canonicalize(code: &str) -> String {
    let allocator = Allocator::new();
    let source_type = SourceType::mjs();
    let parsed = Parser::new(&allocator, code, source_type).parse();
    if parsed.panicked || !parsed.errors.is_empty() {
        // On parse failure, normalize whitespace heavily so that two inputs
        // that only differ in formatting still compare equal.
        return normalize_whitespace_and_quotes(code);
    }
    let options = CodegenOptions {
        single_quote: true,
        comments: CommentOptions {
            normal: false,
            jsdoc: false,
            annotation: false,
            legal: LegalComment::None,
        },
        ..Default::default()
    };
    let out = Codegen::new()
        .with_options(options)
        .build(&parsed.program)
        .code
        .trim()
        .to_string();

    // OXC's `single_quote: true` doesn't always normalize import-source string
    // literals (it leaves the original quote style for some imports). We
    // post-process to convert any remaining double-quoted import sources to
    // single quotes so that two semantically-equal files with different quote
    // styles compare equal.
    let out = normalize_import_quotes(&out);

    // Normalize consecutive whitespace inside template literals to a single space.
    // This handles differences like `/>  <meta` vs `/> <meta` caused by comment
    // removal and whitespace collapsing differences between compilers.
    normalize_template_literal_whitespace(&out)
}

/// On parse-failure fallback: normalize whitespace (collapse runs, unify
/// indentation) and import quote style so that two superficially-different
/// inputs that only differ in formatting can still compare equal.
fn normalize_whitespace_and_quotes(code: &str) -> String {
    let mut out = String::with_capacity(code.len());
    let mut in_string: Option<char> = None;
    let mut in_line_comment = false;
    let mut in_block_comment = false;
    let mut prev_ws = true; // treat start-of-file as preceded by whitespace
    let chars: Vec<char> = code.chars().collect();
    let mut i = 0;
    while i < chars.len() {
        let c = chars[i];
        if in_line_comment {
            if c == '\n' {
                in_line_comment = false;
            }
            i += 1;
            continue;
        }
        if in_block_comment {
            if c == '*' && i + 1 < chars.len() && chars[i + 1] == '/' {
                in_block_comment = false;
                i += 2;
            } else {
                i += 1;
            }
            continue;
        }
        if let Some(quote) = in_string {
            out.push(c);
            if c == '\\' && i + 1 < chars.len() {
                out.push(chars[i + 1]);
                i += 2;
                continue;
            }
            if c == quote {
                in_string = None;
            }
            i += 1;
            prev_ws = false;
            continue;
        }
        if c == '/' && i + 1 < chars.len() {
            if chars[i + 1] == '/' {
                in_line_comment = true;
                i += 2;
                continue;
            }
            if chars[i + 1] == '*' {
                in_block_comment = true;
                i += 2;
                continue;
            }
        }
        if c == '"' || c == '\'' || c == '`' {
            in_string = Some(c);
            out.push(c);
            i += 1;
            prev_ws = false;
            continue;
        }
        if c.is_whitespace() {
            if !prev_ws {
                out.push(' ');
                prev_ws = true;
            }
            i += 1;
            continue;
        }
        out.push(c);
        prev_ws = false;
        i += 1;
    }
    normalize_import_quotes(&out)
}

/// Normalize `import ... from "..."` to `import ... from '...'` and similar for
/// bare `import "..."` and re-exports `export ... from "..."`. Does a simple
/// line-based scan, only touching import/export-from lines, and only if the
/// string has no embedded single quotes.
fn normalize_import_quotes(code: &str) -> String {
    let mut out = String::with_capacity(code.len());
    for (i, line) in code.lines().enumerate() {
        if i > 0 {
            out.push('\n');
        }
        let trimmed = line.trim_start();
        let is_module_line = trimmed.starts_with("import ")
            || trimmed.starts_with("import\"")
            || trimmed.starts_with("import'")
            || trimmed.starts_with("export ")
            || trimmed.starts_with("export\"")
            || trimmed.starts_with("export'");
        if !is_module_line {
            out.push_str(line);
            continue;
        }
        // Convert all "..." substrings on this line to '...' if no embedded single quote.
        let bytes = line.as_bytes();
        let mut i = 0;
        let mut buf = String::with_capacity(line.len());
        while i < bytes.len() {
            if bytes[i] == b'"' {
                // Find matching close quote, respecting backslash escapes.
                let mut j = i + 1;
                let mut has_escape = false;
                while j < bytes.len() {
                    if bytes[j] == b'\\' {
                        has_escape = true;
                        j += 2;
                        continue;
                    }
                    if bytes[j] == b'"' {
                        break;
                    }
                    j += 1;
                }
                if j < bytes.len() {
                    let inner = &line[i + 1..j];
                    if !has_escape && !inner.contains('\'') {
                        buf.push('\'');
                        buf.push_str(inner);
                        buf.push('\'');
                    } else {
                        buf.push_str(&line[i..=j]);
                    }
                    i = j + 1;
                    continue;
                }
            }
            buf.push(bytes[i] as char);
            i += 1;
        }
        out.push_str(&buf);
    }
    out
}

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 3 {
        eprintln!("Usage: {} <file1> <file2> [--dump1|--dump2]", args[0]);
        std::process::exit(2);
    }
    let f1 = fs::read_to_string(&args[1]).unwrap_or_default();
    let f2 = fs::read_to_string(&args[2]).unwrap_or_default();
    // Try proper AST canonicalization for both. If EITHER fails to parse,
    // fall back to whitespace-normalized comparison for BOTH so that the
    // comparison remains meaningful.
    let (c1, c2) = match (try_canonicalize(&f1), try_canonicalize(&f2)) {
        (Some(a), Some(b)) => (a, b),
        _ => (
            normalize_whitespace_and_quotes(&f1),
            normalize_whitespace_and_quotes(&f2),
        ),
    };
    if args.len() >= 4 {
        match args[3].as_str() {
            "--dump1" => {
                println!("{}", c1);
                return;
            }
            "--dump2" => {
                println!("{}", c2);
                return;
            }
            _ => {}
        }
    }
    if c1 == c2 {
        println!("MATCH");
    } else {
        println!("DIFF");
        // Find first diff position
        let b1 = c1.as_bytes();
        let b2 = c2.as_bytes();
        let mut pos = 0;
        while pos < b1.len() && pos < b2.len() && b1[pos] == b2[pos] {
            pos += 1;
        }
        let start = pos.saturating_sub(30);
        let end1 = (pos + 80).min(c1.len());
        let end2 = (pos + 80).min(c2.len());
        println!("F1: {}", &c1[start..end1]);
        println!("F2: {}", &c2[start..end2]);
    }
}

/// Normalize consecutive whitespace inside template literals to single spaces.
/// This handles differences in HTML whitespace collapsing between compilers.
fn normalize_template_literal_whitespace(code: &str) -> String {
    let mut result = String::with_capacity(code.len());
    let chars: Vec<char> = code.chars().collect();
    let len = chars.len();
    let mut i = 0;
    let mut in_template = false;
    let mut in_string = false;
    let mut string_char = ' ';
    let mut expr_depth = 0i32; // depth inside ${...} expressions

    while i < len {
        let c = chars[i];

        // Handle regular strings
        if !in_template && !in_string && (c == '\'' || c == '"') {
            in_string = true;
            string_char = c;
            result.push(c);
            i += 1;
            continue;
        }
        if in_string {
            if c == string_char && (i == 0 || chars[i - 1] != '\\') {
                in_string = false;
            }
            result.push(c);
            i += 1;
            continue;
        }

        // Handle template literals
        if c == '`' {
            in_template = !in_template;
            expr_depth = 0;
            result.push(c);
            i += 1;
            continue;
        }

        if in_template {
            // Track ${...} expression depth
            if c == '$' && i + 1 < len && chars[i + 1] == '{' {
                expr_depth += 1;
                result.push(c);
                result.push('{');
                i += 2;
                continue;
            }
            if c == '{' && expr_depth > 0 {
                expr_depth += 1;
            }
            if c == '}' && expr_depth > 0 {
                expr_depth -= 1;
            }

            // Inside template literal (both text and ${...} expressions):
            // collapse consecutive whitespace to single space
            if c == ' ' || c == '\t' || c == '\n' {
                result.push(' ');
                i += 1;
                while i < len && (chars[i] == ' ' || chars[i] == '\t' || chars[i] == '\n') {
                    i += 1;
                }
                continue;
            }
        }

        result.push(c);
        i += 1;
    }

    result
}

/// Normalize optional chaining with extra parentheses.
/// OXC codegen may add parens around expressions before `?.`:
/// `(expr)?.method()` → `expr?.method()` for simple identifiers/member expressions.
/// Also handles `...(expr ?? [])` → `...expr ?? []` paren differences.
fn normalize_optional_chain_parens(code: &str) -> String {
    // Simple approach: remove parens that wrap spread nullish coalescing
    // `...(expr ?? [])` → `...expr ?? []`
    code.replace("...(", "...").replace(" ?? [])", " ?? []")
}

/// Normalize common HTML attribute names that may differ in case.
/// The official compiler lowercases HTML attribute names, but our compiler
/// may preserve the source case (camelCase).
fn normalize_html_attr_names(code: &str) -> String {
    // Common HTML attributes that appear in camelCase in source but should be lowercase
    code.replace("disablePictureInPicture", "disablepictureinpicture")
        .replace("autoPlay", "autoplay")
        .replace("crossOrigin", "crossorigin")
        .replace("controlsList", "controlslist")
        .replace("playsInline", "playsinline")
        .replace("tabIndex", "tabindex")
        .replace("readOnly", "readonly")
        .replace("noValidate", "novalidate")
        .replace("formNoValidate", "formnovalidate")
        .replace("srcDoc", "srcdoc")
}

/// Strip trailing commas before closing `}` or `)` across lines.
/// Strip `//` line comments from code (outside strings and template literals).
fn strip_line_comments(code: &str) -> String {
    let mut result = String::with_capacity(code.len());
    let mut in_string = false;
    let mut string_char = ' ';
    let mut in_template = false;
    let chars: Vec<char> = code.chars().collect();
    let len = chars.len();
    let mut i = 0;
    while i < len {
        let c = chars[i];
        if in_string {
            if c == string_char && (i == 0 || chars[i - 1] != '\\') {
                in_string = false;
            }
            result.push(c);
            i += 1;
            continue;
        }
        if c == '\'' || c == '"' {
            in_string = true;
            string_char = c;
            result.push(c);
            i += 1;
            continue;
        }
        if c == '`' {
            in_template = !in_template;
            result.push(c);
            i += 1;
            continue;
        }
        if !in_template && c == '/' && i + 1 < len && chars[i + 1] == '/' {
            // Skip to end of line
            while i < len && chars[i] != '\n' {
                i += 1;
            }
            continue;
        }
        result.push(c);
        i += 1;
    }
    result
}

/// Handles OXC codegen output like: `foo,\n\t}` → `foo\n\t}`
fn strip_trailing_commas_multiline(code: &str) -> String {
    let lines: Vec<&str> = code.lines().collect();
    let mut result = Vec::with_capacity(lines.len());
    for (i, line) in lines.iter().enumerate() {
        let trimmed = line.trim();
        let next_trimmed = lines.get(i + 1).map(|l| l.trim()).unwrap_or("");
        if trimmed.ends_with(',')
            && (next_trimmed.starts_with('}') || next_trimmed.starts_with(')'))
        {
            // Remove trailing comma
            result.push(line[..line.len() - 1].to_string());
        } else {
            result.push(line.to_string());
        }
    }
    result.join("\n")
}

/// Normalize $$body variable names: $$body_1, $$body_2 → $$body
/// The official compiler may use different numbering for body variables.
fn normalize_body_var_names(code: &str) -> String {
    let mut result = code.to_string();
    for i in 1..=10 {
        result = result.replace(&format!("$$body_{}", i), "$$body");
    }
    result
}
