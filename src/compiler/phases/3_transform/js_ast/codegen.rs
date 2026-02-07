//! JavaScript code generation from AST nodes.
//!
//! This module converts our AST representation to JavaScript source code,
//! then normalizes it using oxc.

use super::nodes::*;
use std::fmt::Write;

/// Generate JavaScript source code from a program AST.
pub fn generate(program: &JsProgram) -> Result<String, String> {
    let mut codegen = JsCodegen::new();
    codegen.emit_program(program);
    let raw = codegen.output;

    // Normalize through oxc parser/codegen
    normalize_js(&raw)
}

/// Generate JavaScript source code without OXC normalization.
/// This is faster but may produce less well-formatted output.
pub fn generate_fast(program: &JsProgram) -> String {
    let mut codegen = JsCodegen::new();
    codegen.emit_program(program);
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
    use oxc_allocator::Allocator;
    use oxc_codegen::{Codegen, CodegenOptions};
    use oxc_parser::Parser;
    use oxc_span::SourceType;

    // Collect original import lines with double quotes to preserve quote styles.
    // The official Svelte compiler (esrap) preserves the original quote style
    // from the user's source code, but OXC normalizes all quotes to single quotes.
    // We save the originals and restore them after OXC processing.
    // Note: Generated code now uses single quotes (via emit_literal), so only
    // user source code (via Raw() statements) will have double quotes.
    let original_imports = collect_import_lines(source);
    let original_lines = collect_source_lines_for_quote_restore(source);

    let allocator = Allocator::default();
    let source_type = SourceType::mjs();
    let parser = Parser::new(&allocator, source, source_type);
    let result = parser.parse();

    if !result.errors.is_empty() {
        // Print raw source for debugging (only when DEBUG_CODEGEN is set)
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
    let code = Codegen::new()
        .with_options(options)
        .build(&result.program)
        .code;
    let code = collapse_short_arrays(code);
    let code = collapse_short_objects(code);
    // Expand objects with getters/setters to multi-line format.
    // OXC formats `{ get prop() {` on one line, but Svelte's esrap uses multi-line:
    //   {\n\tget prop() {\n\t\t...\n\t}\n}
    let code = expand_getter_objects(code);
    // Collapse single-statement if blocks to inline form BEFORE adding blank lines,
    // since the blank line rules depend on the line structure (e.g. `}` → statement)
    let code = collapse_single_statement_ifs(code);
    let code = add_blank_lines_for_formatting(code);
    // Note: oxc codegen escapes </script> to <\/script> in template literals for HTML safety,
    // and Svelte's output does the same, so we keep this escaping.
    // oxc codegen outputs numbers like .5 instead of 0.5 - add leading zeros
    let code = add_leading_zeros(code);
    // OXC formats `catch (e)` with a space, but Svelte uses `catch(e)` without space
    let code = code.replace("} catch (", "} catch(");
    // OXC splits `;;` (inspect placeholder) into two separate lines. Rejoin them.
    let code = rejoin_double_semicolons(code);
    // OXC has a bug where it doesn't escape tabs in string literals
    // (it escapes newlines but not tabs). Fix this by post-processing.
    let code = escape_tabs_in_strings(code);
    // Restore original quote styles for import statements
    // that were changed by OXC normalization
    let code = restore_original_quotes(code, &original_imports);
    // Restore original quote styles for non-import lines (user source code)
    let code = restore_line_quotes(code, &original_lines);
    // Remove trailing newline to match Svelte compiler output
    let code = code.trim_end_matches('\n').to_string();
    Ok(code)
}

/// Collect source lines that contain double-quoted strings.
/// Returns a map from (quote-normalized line) -> original line.
/// Since generated code now uses single quotes, only user source code
/// (via Raw() statements) will have double quotes, making this safe.
fn collect_source_lines_for_quote_restore(
    source: &str,
) -> std::collections::HashMap<String, String> {
    let mut lines_map = std::collections::HashMap::new();

    for line in source.lines() {
        let trimmed = line.trim();
        // Skip import lines (handled separately) and empty lines
        if trimmed.is_empty() || trimmed.starts_with("import ") {
            continue;
        }
        // Only collect lines that have double quotes
        if !trimmed.contains('"') {
            continue;
        }
        // Normalize: replace double quotes with single quotes for lookup
        let normalized = trimmed.replace('"', "'");
        lines_map.insert(normalized.clone(), trimmed.to_string());
        // Also store with semicolon appended (OXC may add semicolons)
        if !normalized.ends_with(';') {
            lines_map.insert(format!("{};", normalized), trimmed.to_string());
        }
    }

    lines_map
}

/// Restore double quotes for non-import lines using the original source.
///
/// For each line in the OXC output, if the same line existed in the source
/// with double quotes (differing only in quote style), swap the quote characters
/// in-place in the OXC output line rather than replacing the entire line.
/// This preserves OXC's formatting additions (semicolons, spacing, etc.)
/// while restoring the original quote style.
fn restore_line_quotes(
    code: String,
    original_lines: &std::collections::HashMap<String, String>,
) -> String {
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

/// Collect import lines from source code that use double quotes.
/// Returns a map from the normalized form to the original line text.
fn collect_import_lines(source: &str) -> std::collections::HashMap<String, String> {
    let mut import_lines = std::collections::HashMap::new();
    for line in source.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with("import ") {
            // Only collect if the line has double quotes (needs restoration)
            if trimmed.contains('"') {
                let normalized = normalize_import_line(trimmed);
                import_lines.insert(normalized.clone(), trimmed.to_string());
                // Also store with semicolon if the original doesn't have one
                // (OXC adds semicolons)
                if !normalized.ends_with(';') {
                    import_lines.insert(format!("{};", normalized), trimmed.to_string());
                }
                // Also store without semicolon if the original has one
                if normalized.ends_with(';') {
                    import_lines.insert(
                        normalized[..normalized.len() - 1].to_string(),
                        trimmed.to_string(),
                    );
                }
            }
        }
    }
    import_lines
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
fn restore_original_quotes(
    code: String,
    import_lines: &std::collections::HashMap<String, String>,
) -> String {
    if import_lines.is_empty() {
        return code;
    }

    let mut result = String::with_capacity(code.len());
    for line in code.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with("import ") {
            let normalized = normalize_import_line(trimmed);
            if let Some(original) = import_lines.get(&normalized) {
                // Instead of replacing the whole line, just restore the quote style
                // for the import source string. Keep OXC's formatting (spacing).
                let restored = restore_import_quotes(trimmed, original);
                let indent = &line[..line.len() - line.trim_start().len()];
                result.push_str(indent);
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
    let lines: Vec<&str> = code.lines().collect();
    let mut result = Vec::new();
    let mut i = 0;

    while i < lines.len() {
        if i + 1 < lines.len() && lines[i].trim() == ";" && lines[i + 1].trim() == ";" {
            // Get the indentation from the first line
            let indent = &lines[i][..lines[i].len() - lines[i].trim_start().len()];
            result.push(format!("{};;", indent));
            i += 2;
        } else {
            result.push(lines[i].to_string());
            i += 1;
        }
    }

    result.join("\n")
}

/// Escape tab characters inside single/double-quoted string literals.
///
/// OXC has a bug where it doesn't escape tabs in string literals
/// (it escapes newlines with \n but leaves tabs as literal characters).
/// This function post-processes the output to escape tabs to \t.
///
/// Note: Template literals (backtick strings) preserve whitespace,
/// so we don't escape tabs inside them.
fn escape_tabs_in_strings(code: String) -> String {
    let mut result = String::with_capacity(code.len());
    let chars: Vec<char> = code.chars().collect();
    let mut i = 0;
    let mut in_string = false;
    let mut string_char = ' ';
    let mut in_template_literal = false;
    let mut template_depth = 0; // Track nested ${...} in template literals

    while i < chars.len() {
        let c = chars[i];

        // Check if this character is escaped (preceded by odd number of backslashes)
        let is_escaped = if i > 0 {
            let mut bs_count = 0;
            let mut j = i;
            while j > 0 && chars[j - 1] == '\\' {
                bs_count += 1;
                j -= 1;
            }
            bs_count % 2 == 1
        } else {
            false
        };

        // Handle template literal tracking
        if !in_string {
            if c == '`' && !is_escaped {
                if !in_template_literal {
                    in_template_literal = true;
                    template_depth = 0;
                } else if template_depth == 0 {
                    in_template_literal = false;
                }
            } else if in_template_literal {
                // Track ${...} nesting in template literals
                if c == '$' && i + 1 < chars.len() && chars[i + 1] == '{' && !is_escaped {
                    template_depth += 1;
                } else if c == '}' && template_depth > 0 {
                    template_depth -= 1;
                }
            }
        }

        // Check for string start/end (only single and double quotes, not backticks)
        // Only check when NOT inside a template literal (or when inside ${...} within template)
        if (!in_template_literal || template_depth > 0) && (c == '"' || c == '\'') && !is_escaped {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
        }

        // Escape tab characters inside single/double-quoted strings
        if in_string && c == '\t' {
            result.push_str("\\t");
        } else {
            result.push(c);
        }

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
        && current == "}"
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

            // Rule 16: Before `return $.pop(` statements after expression statements
            // This matches Svelte's pattern for component return values
            if !is_var_declaration(current)
                && !is_closing_brace(current)
                && current.ends_with(';')
                && next.starts_with("return $.pop(")
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

/// Add leading zeros to decimal numbers that start with a dot.
///
/// oxc's codegen outputs numbers like `.5` instead of `0.5`.
/// This function adds leading zeros to match Svelte's esrap output.
fn add_leading_zeros(code: String) -> String {
    let mut result = String::with_capacity(code.len() + 100);
    let chars: Vec<char> = code.chars().collect();
    let len = chars.len();
    let mut i = 0;

    while i < len {
        let c = chars[i];

        if c == '.' && i + 1 < len && chars[i + 1].is_ascii_digit() {
            let prev_char = if i > 0 { chars[i - 1] } else { ' ' };

            if !prev_char.is_ascii_digit()
                && (prev_char == ' '
                    || prev_char == '\t'
                    || prev_char == '\n'
                    || prev_char == '('
                    || prev_char == '['
                    || prev_char == '{'
                    || prev_char == ','
                    || prev_char == ':'
                    || prev_char == '='
                    || prev_char == '+'
                    || prev_char == '-'
                    || prev_char == '*'
                    || prev_char == '/'
                    || prev_char == '%'
                    || prev_char == '<'
                    || prev_char == '>'
                    || prev_char == '!'
                    || prev_char == '&'
                    || prev_char == '|'
                    || prev_char == '?'
                    || prev_char == ';')
            {
                result.push('0');
            }
        }
        result.push(c);
        i += 1;
    }
    result
}

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
    use regex::Regex;

    // Match arrays that span multiple lines with only simple literals
    // Pattern: [ followed by newline+indent+items, ending with newline+indent+]
    // Supports:
    // - Single-quoted strings: 'foo'
    // - Numeric literals: 123, -45.67, .5, 1e10
    // - BigInt literals: 123n
    let literal_pattern = r"(?:'[^']*'|-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?n?)";
    let pattern = format!(
        r"(?s)\[(\s*\n\t*{literal}(?:,\s*\n\t*{literal})*)\s*\n\t*\]",
        literal = literal_pattern
    );
    let re = Regex::new(&pattern).unwrap();

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
            output: String::new(),
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
                // Wrap object literals in parentheses
                if matches!(expr.as_ref(), JsExpr::Object(_)) {
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
        let needs_parens = matches!(
            call.callee.as_ref(),
            JsExpr::Arrow(_) | JsExpr::Function(_) | JsExpr::Await(_)
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
        let needs_parens = matches!(
            member.object.as_ref(),
            JsExpr::Literal(JsLiteral::Number(_))
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
fn escape_string_single(s: &str) -> String {
    let mut result = String::with_capacity(s.len());
    for c in s.chars() {
        match c {
            '\'' => result.push_str("\\'"),
            '\\' => result.push_str("\\\\"),
            '\n' => result.push_str("\\n"),
            '\r' => result.push_str("\\r"),
            '\t' => result.push_str("\\t"),
            _ => result.push(c),
        }
    }
    result
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
