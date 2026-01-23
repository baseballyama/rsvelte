//! Common utilities for fixture-based testing.
//!
//! This module provides utilities for loading and comparing test fixtures
//! generated from the official Svelte compiler.

#![allow(dead_code)]

use regex::Regex;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::process::Command;

// ============================================================================
// Path utilities
// ============================================================================

/// Get the Svelte submodule commit hash.
pub fn get_svelte_commit_hash() -> String {
    let output = Command::new("git")
        .args(["rev-parse", "HEAD"])
        .current_dir(svelte_path())
        .output()
        .expect("Failed to get git commit hash");

    String::from_utf8_lossy(&output.stdout).trim().to_string()
}

/// Get path to the Svelte submodule.
pub fn svelte_path() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("svelte")
}

/// Get path to fixtures directory for current Svelte commit.
pub fn fixtures_path() -> PathBuf {
    let commit = get_svelte_commit_hash();
    let short_hash = &commit[..12];
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("fixtures")
        .join(short_hash)
}

/// Check if fixtures exist for current Svelte commit.
pub fn fixtures_exist() -> bool {
    fixtures_path().exists()
}

/// Ensure fixtures exist, panicking with helpful message if not.
pub fn ensure_fixtures_exist() {
    if !fixtures_exist() {
        let commit = get_svelte_commit_hash();
        let short_hash = &commit[..12];
        panic!(
            "\n\n\
            ╔══════════════════════════════════════════════════════════════════╗\n\
            ║  Fixtures not found for Svelte commit: {}                 ║\n\
            ║                                                                  ║\n\
            ║  Please run:  npm run generate-fixtures                          ║\n\
            ║                                                                  ║\n\
            ║  This will generate expected outputs from the official Svelte    ║\n\
            ║  compiler for comparison with the Rust implementation.           ║\n\
            ╚══════════════════════════════════════════════════════════════════╝\n\n",
            short_hash
        );
    }
}

// ============================================================================
// Fixture loading
// ============================================================================

/// Load expected output from fixture.
pub fn load_fixture_output(category: &str, sample: &str, file: &str) -> Option<String> {
    let path = fixtures_path().join(category).join(sample).join(file);

    fs::read_to_string(&path).ok()
}

/// Load metadata from fixture.
pub fn load_fixture_metadata(category: &str, sample: &str) -> Option<serde_json::Value> {
    let content = load_fixture_output(category, sample, "metadata.json")?;
    serde_json::from_str(&content).ok()
}

/// Get all sample directories for a category from fixtures.
pub fn get_fixture_samples(category: &str) -> Vec<PathBuf> {
    let category_dir = fixtures_path().join(category);

    if !category_dir.exists() {
        return Vec::new();
    }

    fs::read_dir(&category_dir)
        .ok()
        .map(|entries| {
            entries
                .filter_map(|e| e.ok())
                .filter(|e| e.file_type().map(|t| t.is_dir()).unwrap_or(false))
                .filter(|e| {
                    e.file_name()
                        .to_str()
                        .map(|s| !s.starts_with('_'))
                        .unwrap_or(false)
                })
                .map(|e| e.path())
                .collect()
        })
        .unwrap_or_default()
}

/// Get all sample directories for a category from Svelte test suite.
pub fn get_svelte_test_samples(category: &str) -> Vec<PathBuf> {
    let samples_dir = svelte_path()
        .join("packages/svelte/tests")
        .join(category)
        .join("samples");

    if !samples_dir.exists() {
        return Vec::new();
    }

    fs::read_dir(&samples_dir)
        .ok()
        .map(|entries| {
            entries
                .filter_map(|e| e.ok())
                .filter(|e| e.file_type().map(|t| t.is_dir()).unwrap_or(false))
                .filter(|e| {
                    e.file_name()
                        .to_str()
                        .map(|s| !s.starts_with('.'))
                        .unwrap_or(false)
                })
                .map(|e| e.path())
                .collect()
        })
        .unwrap_or_default()
}

// ============================================================================
// Normalization utilities
// ============================================================================

/// Format JavaScript code using oxfmt for comparison.
/// Falls back to basic normalization if oxfmt is not available or fails.
pub fn format_js_with_oxfmt(js: &str) -> String {
    use std::time::SystemTime;

    // Create a temporary file for oxfmt to process
    let temp_dir = std::env::temp_dir();
    let timestamp = SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    let temp_file = temp_dir.join(format!("svelte_test_{}.js", timestamp));

    // Write JS to temp file
    if fs::write(&temp_file, js).is_err() {
        // Fallback to basic normalization if file write fails
        return normalize_js(js);
    }

    // Try to format with oxfmt using npx
    let output = Command::new("npx")
        .args(["oxfmt", temp_file.to_str().unwrap(), "--write"])
        .output();

    let formatted = match output {
        Ok(result) if result.status.success() => {
            // Read the formatted output
            let formatted = fs::read_to_string(&temp_file).unwrap_or_else(|_| js.to_string());
            // Normalize blank lines after formatting
            // oxfmt preserves existing blank lines, so we need to remove them for consistent comparison
            normalize_blank_lines(&formatted)
        }
        _ => {
            // Fallback to basic normalization if oxfmt fails
            normalize_js(js)
        }
    };

    // Clean up temp file
    let _ = fs::remove_file(temp_file);

    formatted
}

/// Normalize blank lines in formatted code.
/// Removes all blank lines for consistent comparison.
/// oxfmt preserves existing blank lines but doesn't add them,
/// so we remove all blank lines to make tests pass regardless of
/// whether the code generator includes them or not.
fn normalize_blank_lines(code: &str) -> String {
    code.lines()
        .filter(|line| !line.trim().is_empty())
        .collect::<Vec<_>>()
        .join("\n")
}

/// Normalize JavaScript code for comparison (optimized for performance).
/// This function performs lightweight normalization to compare the essential structure
/// of JavaScript code, ignoring formatting differences like quotes, whitespace, and semicolons.
///
/// IMPORTANT: String literals (single/double quotes and template literals) are preserved
/// exactly as-is, except for quote style normalization to single quotes.
///
/// This function handles:
/// - Whitespace normalization (multiple spaces to single, trim lines)
/// - Empty line removal (consecutive blank lines collapsed)
/// - Quote normalization (double -> single quotes)
/// - Semicolon removal (trailing semicolons stripped)
/// - Scientific notation normalization (1e3 -> 1000)
/// - Brace/newline normalization ({ followed by newline -> { space)
/// - If/else brace normalization (single-statement braces removed for consistency)
pub fn normalize_js(js: &str) -> String {
    use regex::Regex;
    lazy_static::lazy_static! {
        // Normalize multiple spaces to single space
        static ref MULTI_SPACE: Regex = Regex::new(r"[ \t]+").unwrap();
        // Normalize space around operators and punctuation
        static ref SPACE_BEFORE_PUNC: Regex = Regex::new(r"\s+([,;:)\]}])").unwrap();
        static ref SPACE_AFTER_PUNC: Regex = Regex::new(r"([(\[{])\s+").unwrap();
        // Normalize "function ()" vs "function()" - remove space before opening paren after "function"
        static ref FUNCTION_SPACE_PAREN: Regex = Regex::new(r"function\s+\(").unwrap();
        // Normalize opening brace followed by newline to brace followed by space
        // This handles differences like "Counter($$anchor, {\n\tget foo()" vs "Counter($$anchor, { get foo()"
        static ref BRACE_NEWLINE: Regex = Regex::new(r"\{\s*\n\s*").unwrap();
        // Normalize closing braces across newlines: "}\n\t}" -> "}}"
        static ref CLOSE_BRACE_NEWLINE: Regex = Regex::new(r"\}\s*\n\s*\}").unwrap();
        // Normalize opening paren followed by newline to paren (handles multiline function call args)
        // This handles differences like "customElements.define(\n\t'value-builtin'," vs "customElements.define('value-builtin',"
        static ref PAREN_NEWLINE: Regex = Regex::new(r"\(\s*\n\s*").unwrap();
        // Normalize closing paren across newlines: ")\n\t)" -> "))"
        static ref CLOSE_PAREN_NEWLINE: Regex = Regex::new(r"\)\s*\n\s*\)").unwrap();
        // Normalize comma followed by newline to just comma (handles multiline function call arguments)
        // This handles differences like "'value-builtin',\n\t\tclass" vs "'value-builtin', class"
        static ref COMMA_NEWLINE: Regex = Regex::new(r",\s*\n\s*").unwrap();
        // Normalize closing brace/paren followed by newline and closing paren
        // This handles multiline function call endings like "}\n\t);" vs "});"
        static ref CLOSE_BRACE_PAREN: Regex = Regex::new(r"\}\s*\n\s*\)").unwrap();
        // Match scientific notation like 1e3, 2.5e4, 1e-2 (but not in string literals - handled separately)
        static ref SCIENTIFIC_NOTATION: Regex = Regex::new(r"\b(\d+(?:\.\d+)?)[eE]([+-]?\d+)\b").unwrap();
    }

    // First, normalize brace + newline patterns across the entire source
    let mut result = js.to_string();
    result = BRACE_NEWLINE.replace_all(&result, "{ ").to_string();
    result = CLOSE_BRACE_NEWLINE.replace_all(&result, "}}").to_string();
    // Normalize paren + newline patterns (multiline function args)
    result = PAREN_NEWLINE.replace_all(&result, "(").to_string();
    result = CLOSE_PAREN_NEWLINE.replace_all(&result, "))").to_string();
    // Normalize comma + newline patterns (multiline function args between parameters)
    result = COMMA_NEWLINE.replace_all(&result, ", ").to_string();
    // Normalize closing brace + newline + closing paren patterns
    result = CLOSE_BRACE_PAREN.replace_all(&result, "})").to_string();

    result
        .lines()
        .filter(|line| !line.trim().is_empty())
        .map(|line| {
            let trimmed = line.trim();

            // Extract string literals, normalize outside of strings, then restore
            let (normalized, _) = normalize_line_preserving_strings(
                trimmed,
                &MULTI_SPACE,
                &SPACE_BEFORE_PUNC,
                &SPACE_AFTER_PUNC,
                &FUNCTION_SPACE_PAREN,
                &SCIENTIFIC_NOTATION,
            );

            // Remove trailing semicolons for comparison (optional based on style)
            normalized.trim_end_matches(';').to_string()
        })
        .collect::<Vec<_>>()
        .join("\n")
        .trim()
        .to_string()
}

/// Normalize a line while preserving string literal contents.
/// Returns the normalized line and extracts string literals for protection.
fn normalize_line_preserving_strings(
    line: &str,
    multi_space: &Regex,
    space_before_punc: &Regex,
    space_after_punc: &Regex,
    function_space_paren: &Regex,
    scientific_notation: &Regex,
) -> (String, Vec<String>) {
    let mut strings: Vec<String> = Vec::new();
    let mut result = String::with_capacity(line.len());
    let mut chars = line.chars().peekable();
    let mut placeholder_idx = 0;

    while let Some(c) = chars.next() {
        match c {
            // Handle string literals
            '"' | '\'' => {
                let quote = c;
                let mut string_content = String::new();
                string_content.push(quote);

                while let Some(&next_c) = chars.peek() {
                    chars.next();
                    string_content.push(next_c);

                    if next_c == '\\' {
                        // Handle escape sequence - consume next char
                        if let Some(&escaped) = chars.peek() {
                            chars.next();
                            string_content.push(escaped);
                        }
                    } else if next_c == quote {
                        // End of string
                        break;
                    }
                }

                // Store string and add placeholder
                let placeholder = format!("__STR{}__", placeholder_idx);
                placeholder_idx += 1;
                strings.push(string_content);
                result.push_str(&placeholder);
            }
            // Handle template literals
            '`' => {
                let mut template_content = String::new();
                template_content.push('`');
                let mut brace_depth = 0;

                while let Some(&next_c) = chars.peek() {
                    chars.next();
                    template_content.push(next_c);

                    if next_c == '\\' {
                        // Handle escape sequence
                        if let Some(&escaped) = chars.peek() {
                            chars.next();
                            template_content.push(escaped);
                        }
                    } else if next_c == '$' {
                        // Check for ${
                        if let Some(&'{') = chars.peek() {
                            chars.next();
                            template_content.push('{');
                            brace_depth += 1;
                        }
                    } else if next_c == '{' && brace_depth > 0 {
                        brace_depth += 1;
                    } else if next_c == '}' && brace_depth > 0 {
                        brace_depth -= 1;
                    } else if next_c == '`' && brace_depth == 0 {
                        // End of template literal
                        break;
                    }
                }

                // Store template and add placeholder
                let placeholder = format!("__STR{}__", placeholder_idx);
                placeholder_idx += 1;
                strings.push(template_content);
                result.push_str(&placeholder);
            }
            // Handle line comments - skip rest of line
            '/' if chars.peek() == Some(&'/') => {
                // Skip to end of line
                break;
            }
            // Handle block comments
            '/' if chars.peek() == Some(&'*') => {
                chars.next(); // consume '*'
                // Skip until */
                while let Some(c) = chars.next() {
                    if c == '*' && chars.peek() == Some(&'/') {
                        chars.next(); // consume '/'
                        break;
                    }
                }
            }
            _ => {
                result.push(c);
            }
        }
    }

    // Now normalize the code (without string literals)
    let mut normalized = result;

    // Normalize tabs to spaces
    normalized = normalized.replace('\t', " ");

    // Normalize multiple spaces to single space
    normalized = multi_space.replace_all(&normalized, " ").to_string();

    // Remove spaces before punctuation
    normalized = space_before_punc.replace_all(&normalized, "$1").to_string();

    // Remove spaces after opening brackets
    normalized = space_after_punc.replace_all(&normalized, "$1").to_string();

    // Normalize "function ()" to "function()"
    normalized = function_space_paren
        .replace_all(&normalized, "function(")
        .to_string();

    // Normalize scientific notation to decimal (1e3 -> 1000, 2.5e2 -> 250)
    // This is done before restoring strings so we don't modify string contents
    normalized = scientific_notation
        .replace_all(&normalized, |caps: &regex::Captures| {
            convert_scientific_to_decimal(&caps[1], &caps[2])
        })
        .to_string();

    // Normalize if/else single-statement braces
    // Convert: if (cond) {stmt;} -> if (cond) stmt;
    // This handles differences between compilers that may or may not use braces for single statements
    normalized = normalize_if_else_braces(&normalized);

    // Restore string literals with normalized quotes (double -> single for outer quotes only)
    for (idx, string_content) in strings.iter().enumerate() {
        let placeholder = format!("__STR{}__", idx);
        let normalized_string = normalize_string_quotes(string_content);
        normalized = normalized.replace(&placeholder, &normalized_string);
    }

    (normalized, strings)
}

/// Normalize if/else single-statement braces.
/// Removes braces around single statements in if/else blocks for consistent comparison.
/// - `if (cond) {stmt;}` -> `if (cond) stmt;`
/// - `} else {stmt;}` -> `} else stmt;`
///
/// Preserves braces when:
/// - Multiple statements are present (contains `;` before the final one)
/// - Nested braces exist (for callbacks, objects, etc.)
fn normalize_if_else_braces(code: &str) -> String {
    let mut result = code.to_string();

    // Process if statements with braces: if (cond) {single_stmt;}
    // We need to be careful about:
    // 1. Nested parentheses in condition
    // 2. Nested braces in statement (callbacks, objects)
    // 3. Multiple statements

    loop {
        let before = result.clone();
        result = normalize_single_if_brace(&result);
        result = normalize_single_else_brace(&result);
        if result == before {
            break;
        }
    }

    result
}

/// Normalize a single if statement with braces around a single statement.
fn normalize_single_if_brace(code: &str) -> String {
    // Find "if (" pattern
    let mut result = String::new();
    let mut i = 0;
    let code_bytes = code.as_bytes();
    let code_len = code.len();

    while i < code_len {
        // Check for "if " or "if("
        if i + 3 <= code_len && (&code[i..i + 3] == "if " || &code[i..i + 3] == "if(") {
            // Check if preceded by word character (to avoid matching "else if" incorrectly)
            let is_word_boundary = i == 0 || !code_bytes[i - 1].is_ascii_alphanumeric();
            if !is_word_boundary {
                result.push(code_bytes[i] as char);
                i += 1;
                continue;
            }

            // Found "if"
            result.push_str("if");
            i += 2;

            // Skip whitespace
            while i < code_len && code_bytes[i].is_ascii_whitespace() {
                result.push(code_bytes[i] as char);
                i += 1;
            }

            // Must have opening paren
            if i >= code_len || code_bytes[i] != b'(' {
                continue;
            }

            // Find matching closing paren (handling nested parens)
            let cond_start = i;
            let mut paren_depth = 0;
            while i < code_len {
                match code_bytes[i] {
                    b'(' => paren_depth += 1,
                    b')' => {
                        paren_depth -= 1;
                        if paren_depth == 0 {
                            i += 1;
                            break;
                        }
                    }
                    _ => {}
                }
                i += 1;
            }
            let condition = &code[cond_start..i];
            result.push_str(condition);

            // Skip whitespace after condition (but remember if there was any)
            let whitespace_start = i;
            while i < code_len && code_bytes[i].is_ascii_whitespace() {
                i += 1;
            }

            // Check if followed by opening brace
            if i >= code_len || code_bytes[i] != b'{' {
                // Not followed by brace, restore the whitespace and continue
                result.push_str(&code[whitespace_start..i]);
                continue;
            }

            // Find the matching closing brace
            let brace_start = i;
            i += 1; // skip opening brace
            let mut brace_depth = 1;
            let mut inner_brace_count = 0;
            let mut semicolon_count = 0;

            while i < code_len && brace_depth > 0 {
                match code_bytes[i] {
                    b'{' => {
                        brace_depth += 1;
                        inner_brace_count += 1;
                    }
                    b'}' => {
                        brace_depth -= 1;
                    }
                    b';' if brace_depth == 1 => {
                        semicolon_count += 1;
                    }
                    _ => {}
                }
                i += 1;
            }

            let block_content = &code[brace_start + 1..i - 1]; // content between { and }

            // Only remove braces if:
            // 1. Single statement (one semicolon or none for expression statements)
            // 2. No nested braces (except for callbacks which we handle specially)
            let should_remove_braces =
                semicolon_count <= 1 && inner_brace_count == 0 && !block_content.trim().is_empty();

            if should_remove_braces {
                // Remove braces, output just the statement
                let stmt = block_content.trim();
                result.push(' ');
                result.push_str(stmt);
                if !stmt.ends_with(';') {
                    result.push(';');
                }
            } else {
                // Keep braces as-is
                result.push_str(&code[brace_start..i]);
            }
        } else {
            result.push(code_bytes[i] as char);
            i += 1;
        }
    }

    result
}

/// Normalize a single else statement with braces around a single statement.
fn normalize_single_else_brace(code: &str) -> String {
    let mut result = String::new();
    let code_bytes = code.as_bytes();
    let code_len = code.len();
    let mut i = 0;

    while i < code_len {
        // Check for "} else" or "; else" or just " else" patterns
        let is_else_pattern = i + 6 <= code_len
            && (code[i..].starts_with("} else") || code[i..].starts_with("; else"))
            || (i > 0
                && i + 5 <= code_len
                && code_bytes[i] == b' '
                && code[i + 1..].starts_with("else"));

        if is_else_pattern {
            // Output the prefix character (}, ;, or space)
            result.push(code_bytes[i] as char);
            i += 1;

            // Skip whitespace
            while i < code_len && code_bytes[i].is_ascii_whitespace() {
                result.push(code_bytes[i] as char);
                i += 1;
            }

            // Match "else"
            if i + 4 <= code_len && &code[i..i + 4] == "else" {
                result.push_str("else");
                i += 4;

                // Skip whitespace (but remember the position)
                let whitespace_start = i;
                while i < code_len && code_bytes[i].is_ascii_whitespace() {
                    i += 1;
                }

                // Check if followed by "if" (else if) - restore whitespace and don't process further
                if i + 2 <= code_len && &code[i..i + 2] == "if" {
                    result.push_str(&code[whitespace_start..i]);
                    continue;
                }

                // Check if followed by opening brace
                if i >= code_len || code_bytes[i] != b'{' {
                    // Not followed by brace, restore the whitespace and continue
                    result.push_str(&code[whitespace_start..i]);
                    continue;
                }

                // Find the matching closing brace
                let brace_start = i;
                i += 1;
                let mut brace_depth = 1;
                let mut inner_brace_count = 0;
                let mut semicolon_count = 0;

                while i < code_len && brace_depth > 0 {
                    match code_bytes[i] {
                        b'{' => {
                            brace_depth += 1;
                            inner_brace_count += 1;
                        }
                        b'}' => {
                            brace_depth -= 1;
                        }
                        b';' if brace_depth == 1 => {
                            semicolon_count += 1;
                        }
                        _ => {}
                    }
                    i += 1;
                }

                let block_content = &code[brace_start + 1..i - 1];

                let should_remove_braces = semicolon_count <= 1
                    && inner_brace_count == 0
                    && !block_content.trim().is_empty();

                if should_remove_braces {
                    let stmt = block_content.trim();
                    result.push(' ');
                    result.push_str(stmt);
                    if !stmt.ends_with(';') {
                        result.push(';');
                    }
                } else {
                    result.push_str(&code[brace_start..i]);
                }
            }
        } else {
            result.push(code_bytes[i] as char);
            i += 1;
        }
    }

    result
}

/// Convert scientific notation to decimal representation.
/// E.g., "1", "3" -> "1000", "2.5", "2" -> "250"
fn convert_scientific_to_decimal(mantissa: &str, exponent: &str) -> String {
    // Parse the exponent
    let exp: i32 = exponent.parse().unwrap_or(0);

    // Handle negative exponents - keep as scientific notation since they produce decimals
    if exp < 0 {
        return format!("{}e{}", mantissa, exponent);
    }

    // Parse the mantissa
    if let Ok(base) = mantissa.parse::<f64>() {
        let result = base * 10_f64.powi(exp);
        // Only convert if the result is a reasonable integer (no decimal precision loss)
        if result.fract() == 0.0 && result.abs() < 1e15 {
            return format!("{}", result as i64);
        }
        // For non-integers, format without trailing zeros
        let formatted = format!("{}", result);
        // Remove unnecessary trailing zeros after decimal point
        if formatted.contains('.') {
            formatted
                .trim_end_matches('0')
                .trim_end_matches('.')
                .to_string()
        } else {
            formatted
        }
    } else {
        // If parsing fails, return original
        format!("{}e{}", mantissa, exponent)
    }
}

/// Normalize string quotes: convert double-quoted strings to single-quoted,
/// but preserve the content exactly as-is.
fn normalize_string_quotes(s: &str) -> String {
    if s.is_empty() {
        return s.to_string();
    }

    let mut chars = s.chars();
    let first = chars.next().unwrap();

    if first == '"' {
        // Convert double-quoted string to single-quoted
        // The content stays the same, just change outer quotes
        let mut result = String::with_capacity(s.len());
        result.push('\'');

        let rest: String = chars.collect();
        if rest.ends_with('"') {
            result.push_str(&rest[..rest.len() - 1]);
            result.push('\'');
        } else {
            result.push_str(&rest);
        }
        result
    } else {
        // Single quote or template literal - keep as-is
        s.to_string()
    }
}

/// Normalize CSS for comparison (replace hashes with placeholder).
pub fn normalize_css(css: &str) -> String {
    let hash_re = Regex::new(r"svelte-[a-z0-9]+").unwrap();
    let normalized = hash_re.replace_all(css, "svelte-xyz");

    normalized
        .lines()
        .map(|line| line.trim())
        .filter(|line| !line.is_empty())
        .collect::<Vec<_>>()
        .join("\n")
}

/// Normalize JSON for AST comparison.
pub fn normalize_json(value: &mut serde_json::Value) {
    remove_internal_fields(value);
}

fn remove_internal_fields(value: &mut serde_json::Value) {
    match value {
        serde_json::Value::Object(map) => {
            // Remove internal fields
            map.remove("metadata");

            // Helper to remove 'character' from location objects
            fn remove_character_from_loc(loc: &mut serde_json::Value) {
                if let serde_json::Value::Object(loc_map) = loc {
                    if let Some(serde_json::Value::Object(start)) = loc_map.get_mut("start") {
                        start.remove("character");
                    }
                    if let Some(serde_json::Value::Object(end)) = loc_map.get_mut("end") {
                        end.remove("character");
                    }
                }
            }

            // Remove 'character' field from loc.start and loc.end
            if let Some(loc) = map.get_mut("loc") {
                remove_character_from_loc(loc);
            }

            // Also remove from name_loc
            if let Some(name_loc) = map.get_mut("name_loc") {
                remove_character_from_loc(name_loc);
            }

            // Recursively process all fields
            for (_, v) in map.iter_mut() {
                remove_internal_fields(v);
            }
        }
        serde_json::Value::Array(arr) => {
            for v in arr.iter_mut() {
                remove_internal_fields(v);
            }
        }
        _ => {}
    }
}

// ============================================================================
// Warning/Error structures
// ============================================================================

/// Warning structure for comparison.
#[derive(Debug, Clone, Deserialize, Serialize, PartialEq)]
pub struct FixtureWarning {
    pub code: String,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub start: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub end: Option<serde_json::Value>,
}

/// Error structure for comparison.
#[derive(Debug, Clone, Deserialize, Serialize, PartialEq)]
pub struct FixtureError {
    pub code: String,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub start: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub end: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub position: Option<serde_json::Value>,
}

/// Load warnings from fixture.
pub fn load_fixture_warnings(category: &str, sample: &str) -> Vec<FixtureWarning> {
    load_fixture_output(category, sample, "warnings.json")
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default()
}

/// Load errors from fixture.
pub fn load_fixture_errors(category: &str, sample: &str) -> Vec<FixtureError> {
    load_fixture_output(category, sample, "errors.json")
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default()
}

/// Load single error from fixture (for compiler-errors tests).
pub fn load_fixture_error(category: &str, sample: &str) -> Option<FixtureError> {
    load_fixture_output(category, sample, "error.json").and_then(|s| serde_json::from_str(&s).ok())
}

// ============================================================================
// Actual output writing
// ============================================================================

/// Get path to actual output directory for a sample.
pub fn actual_output_path(category: &str, sample: &str) -> PathBuf {
    fixtures_path().join(category).join(sample).join("_actual")
}

/// Write actual output to fixture directory for comparison.
pub fn write_actual_output(category: &str, sample: &str, file: &str, content: &str) {
    let actual_dir = actual_output_path(category, sample);
    let _ = fs::create_dir_all(&actual_dir);
    let _ = fs::write(actual_dir.join(file), content);
}

/// Write actual JSON output to fixture directory.
pub fn write_actual_json<T: Serialize>(category: &str, sample: &str, file: &str, value: &T) {
    if let Ok(json) = serde_json::to_string_pretty(value) {
        write_actual_output(category, sample, file, &json);
    }
}

// ============================================================================
// Compatibility Report Structures
// ============================================================================

/// Test result status.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum TestStatus {
    Passed,
    Failed,
    Skipped,
    Error,
}

/// Result for a single test sample.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SampleResult {
    pub name: String,
    pub status: TestStatus,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub skip_reason: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub details: Option<SampleDetails>,
}

/// Additional details for a test sample.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SampleDetails {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub client_passed: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub server_passed: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub css_passed: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub warnings_matched: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub errors_matched: Option<bool>,
}

/// Statistics for a test category.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct CategoryStats {
    pub total: usize,
    pub passed: usize,
    pub failed: usize,
    pub skipped: usize,
    pub errors: usize,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub client_passed: Option<usize>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub client_total: Option<usize>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub server_passed: Option<usize>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub server_total: Option<usize>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub css_passed: Option<usize>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub css_total: Option<usize>,
}

impl CategoryStats {
    /// Calculate pass percentage (excluding skipped tests).
    pub fn pass_percentage(&self) -> f64 {
        let run = self.total - self.skipped;
        if run == 0 {
            0.0
        } else {
            (self.passed as f64 / run as f64) * 100.0
        }
    }

    /// Get run count (total - skipped).
    pub fn run_count(&self) -> usize {
        self.total - self.skipped
    }
}

/// Results for a test category.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CategoryResult {
    pub category: String,
    pub stats: CategoryStats,
    pub samples: Vec<SampleResult>,
}

impl CategoryResult {
    pub fn new(category: &str) -> Self {
        Self {
            category: category.to_string(),
            stats: CategoryStats::default(),
            samples: Vec::new(),
        }
    }

    /// Add a sample result and update statistics.
    pub fn add_sample(&mut self, sample: SampleResult) {
        self.stats.total += 1;
        match sample.status {
            TestStatus::Passed => self.stats.passed += 1,
            TestStatus::Failed => self.stats.failed += 1,
            TestStatus::Skipped => self.stats.skipped += 1,
            TestStatus::Error => self.stats.errors += 1,
        }

        // Update detailed stats if available
        if let Some(details) = &sample.details {
            if let Some(passed) = details.client_passed {
                *self.stats.client_total.get_or_insert(0) += 1;
                if passed {
                    *self.stats.client_passed.get_or_insert(0) += 1;
                }
            }
            if let Some(passed) = details.server_passed {
                *self.stats.server_total.get_or_insert(0) += 1;
                if passed {
                    *self.stats.server_passed.get_or_insert(0) += 1;
                }
            }
            if let Some(passed) = details.css_passed {
                *self.stats.css_total.get_or_insert(0) += 1;
                if passed {
                    *self.stats.css_passed.get_or_insert(0) += 1;
                }
            }
        }

        self.samples.push(sample);
    }
}

/// Full compatibility report.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompatibilityReport {
    pub svelte_commit: String,
    pub svelte_short_hash: String,
    pub generated_at: String,
    pub categories: HashMap<String, CategoryResult>,
    pub summary: ReportSummary,
}

/// Summary statistics across all categories.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ReportSummary {
    pub total_tests: usize,
    pub total_passed: usize,
    pub total_failed: usize,
    pub total_skipped: usize,
    pub total_errors: usize,
    pub overall_percentage: f64,
    pub category_percentages: HashMap<String, f64>,
}

impl CompatibilityReport {
    /// Create a new report.
    pub fn new() -> Self {
        let commit = get_svelte_commit_hash();
        let short_hash = commit[..12].to_string();
        Self {
            svelte_commit: commit,
            svelte_short_hash: short_hash,
            generated_at: chrono::Utc::now().to_rfc3339(),
            categories: HashMap::new(),
            summary: ReportSummary::default(),
        }
    }

    /// Add a category result to the report.
    pub fn add_category(&mut self, result: CategoryResult) {
        let percentage = result.stats.pass_percentage();
        self.summary
            .category_percentages
            .insert(result.category.clone(), percentage);

        self.summary.total_tests += result.stats.total;
        self.summary.total_passed += result.stats.passed;
        self.summary.total_failed += result.stats.failed;
        self.summary.total_skipped += result.stats.skipped;
        self.summary.total_errors += result.stats.errors;

        self.categories.insert(result.category.clone(), result);
    }

    /// Finalize the report (calculate overall percentage).
    pub fn finalize(&mut self) {
        let run = self.summary.total_tests - self.summary.total_skipped;
        if run > 0 {
            self.summary.overall_percentage =
                (self.summary.total_passed as f64 / run as f64) * 100.0;
        }
    }

    /// Save the report to a JSON file.
    pub fn save_to_file(&self, path: &str) -> std::io::Result<()> {
        let json = serde_json::to_string_pretty(self)?;
        fs::write(path, json)
    }

    /// Get path to report file in fixtures directory.
    pub fn default_report_path() -> PathBuf {
        fixtures_path().join("compatibility-report.json")
    }
}

impl Default for CompatibilityReport {
    fn default() -> Self {
        Self::new()
    }
}

// ============================================================================
// Test category definitions
// ============================================================================

/// All supported test categories.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum TestCategory {
    ParserModern,
    ParserLegacy,
    Snapshot,
    Css,
    Validator,
    CompilerErrors,
    RuntimeRunes,
    RuntimeLegacy,
    RuntimeBrowser,
    Hydration,
    ServerSideRendering,
    Sourcemaps,
    Preprocess,
    Print,
    Migrate,
}

impl TestCategory {
    /// Get all test categories.
    pub fn all() -> &'static [TestCategory] {
        &[
            TestCategory::ParserModern,
            TestCategory::ParserLegacy,
            TestCategory::Snapshot,
            TestCategory::Css,
            TestCategory::Validator,
            TestCategory::CompilerErrors,
            TestCategory::RuntimeRunes,
            TestCategory::RuntimeLegacy,
            TestCategory::RuntimeBrowser,
            TestCategory::Hydration,
            TestCategory::ServerSideRendering,
            TestCategory::Sourcemaps,
            TestCategory::Preprocess,
            TestCategory::Print,
            TestCategory::Migrate,
        ]
    }

    /// Get the directory name for this category in Svelte tests.
    pub fn svelte_dir(&self) -> &'static str {
        match self {
            TestCategory::ParserModern => "parser-modern",
            TestCategory::ParserLegacy => "parser-legacy",
            TestCategory::Snapshot => "snapshot",
            TestCategory::Css => "css",
            TestCategory::Validator => "validator",
            TestCategory::CompilerErrors => "compiler-errors",
            TestCategory::RuntimeRunes => "runtime-runes",
            TestCategory::RuntimeLegacy => "runtime-legacy",
            TestCategory::RuntimeBrowser => "runtime-browser",
            TestCategory::Hydration => "hydration",
            TestCategory::ServerSideRendering => "server-side-rendering",
            TestCategory::Sourcemaps => "sourcemaps",
            TestCategory::Preprocess => "preprocess",
            TestCategory::Print => "print",
            TestCategory::Migrate => "migrate",
        }
    }

    /// Get the main input file name for this category.
    pub fn main_file(&self) -> &'static str {
        match self {
            TestCategory::ParserModern
            | TestCategory::ParserLegacy
            | TestCategory::Css
            | TestCategory::Validator
            | TestCategory::Sourcemaps
            | TestCategory::Preprocess
            | TestCategory::Print => "input.svelte",
            TestCategory::Snapshot => "index.svelte",
            TestCategory::CompilerErrors
            | TestCategory::RuntimeRunes
            | TestCategory::RuntimeLegacy
            | TestCategory::RuntimeBrowser
            | TestCategory::Hydration
            | TestCategory::ServerSideRendering => "main.svelte",
            TestCategory::Migrate => "input.svelte",
        }
    }

    /// Get human-readable display name.
    pub fn display_name(&self) -> &'static str {
        match self {
            TestCategory::ParserModern => "Parser (Modern)",
            TestCategory::ParserLegacy => "Parser (Legacy)",
            TestCategory::Snapshot => "Compiler Snapshot",
            TestCategory::Css => "CSS Scoping",
            TestCategory::Validator => "Validator",
            TestCategory::CompilerErrors => "Compiler Errors",
            TestCategory::RuntimeRunes => "Runtime (Runes)",
            TestCategory::RuntimeLegacy => "Runtime (Legacy)",
            TestCategory::RuntimeBrowser => "Runtime (Browser)",
            TestCategory::Hydration => "Hydration",
            TestCategory::ServerSideRendering => "Server-Side Rendering",
            TestCategory::Sourcemaps => "Sourcemaps",
            TestCategory::Preprocess => "Preprocess",
            TestCategory::Print => "Print",
            TestCategory::Migrate => "Migrate",
        }
    }

    /// Check if this category is currently implemented.
    pub fn is_implemented(&self) -> bool {
        matches!(
            self,
            TestCategory::ParserModern
                | TestCategory::ParserLegacy
                | TestCategory::Snapshot
                | TestCategory::Css
                | TestCategory::Validator
                | TestCategory::CompilerErrors
                | TestCategory::RuntimeRunes
                | TestCategory::RuntimeLegacy
                | TestCategory::RuntimeBrowser
                | TestCategory::Hydration
                | TestCategory::ServerSideRendering
                | TestCategory::Sourcemaps
        )
    }

    /// Get the number of test samples in this category.
    pub fn sample_count(&self) -> usize {
        get_svelte_test_samples(self.svelte_dir()).len()
    }
}

impl std::fmt::Display for TestCategory {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.svelte_dir())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_normalize_js_preserves_template_literal_spaces() {
        let input =
            r#"$.template_effect(() => $.set_text(text, `clicks: ${$.get(count) ?? ''}`));"#;
        let expected =
            r#"$.template_effect(() => $.set_text(text, `clicks: ${$.get(count) ?? ''}`))"#;
        assert_eq!(normalize_js(input), expected);
    }

    #[test]
    fn test_normalize_js_preserves_string_literal_spaces() {
        let input = r#"const msg = "hello   world";"#;
        let expected = r#"const msg = 'hello   world'"#;
        assert_eq!(normalize_js(input), expected);
    }

    #[test]
    fn test_normalize_js_removes_empty_lines() {
        let input = "const a = 1;\n\nconst b = 2;";
        let expected = "const a = 1\nconst b = 2";
        assert_eq!(normalize_js(input), expected);
    }

    #[test]
    fn test_normalize_js_normalizes_quotes() {
        let input = r#"const a = "test";"#;
        let expected = "const a = 'test'";
        assert_eq!(normalize_js(input), expected);
    }

    #[test]
    fn test_normalize_js_normalizes_spaces() {
        let input = "const   a  =   1;";
        let expected = "const a = 1";
        assert_eq!(normalize_js(input), expected);
    }

    #[test]
    fn test_normalize_js_preserves_escaped_quotes() {
        let input = r#"const a = "hello \"world\"";"#;
        let expected = r#"const a = 'hello \"world\"'"#;
        assert_eq!(normalize_js(input), expected);
    }

    #[test]
    fn test_normalize_js_handles_template_with_expression() {
        let input = r#"const msg = `Count: ${count + 1}`;"#;
        let expected = r#"const msg = `Count: ${count + 1}`"#;
        assert_eq!(normalize_js(input), expected);
    }

    #[test]
    fn test_normalize_js_scientific_notation_basic() {
        // Basic scientific notation conversions
        let input = "const x = 1e3;";
        let expected = "const x = 1000";
        assert_eq!(normalize_js(input), expected);
    }

    #[test]
    fn test_normalize_js_scientific_notation_decimal() {
        // Scientific notation with decimal mantissa
        let input = "const x = 2.5e2;";
        let expected = "const x = 250";
        assert_eq!(normalize_js(input), expected);
    }

    #[test]
    fn test_normalize_js_scientific_notation_large() {
        // Larger exponents
        let input = "const x = 1e6;";
        let expected = "const x = 1000000";
        assert_eq!(normalize_js(input), expected);
    }

    #[test]
    fn test_normalize_js_scientific_notation_in_expression() {
        // Scientific notation in expressions
        // Note: single-statement braces are removed by if/else brace normalization
        let input = "if (i < 1e3) { value = 1e4; }";
        let expected = "if (i < 1000) value = 10000";
        assert_eq!(normalize_js(input), expected);
    }

    #[test]
    fn test_normalize_js_scientific_notation_not_in_strings() {
        // Scientific notation in strings should NOT be converted
        let input = r#"const msg = "value is 1e3";"#;
        let expected = r#"const msg = 'value is 1e3'"#;
        assert_eq!(normalize_js(input), expected);
    }

    #[test]
    fn test_normalize_js_scientific_notation_not_in_template() {
        // Scientific notation in template literals should NOT be converted
        let input = r#"const msg = `value is 1e3`;"#;
        let expected = r#"const msg = `value is 1e3`"#;
        assert_eq!(normalize_js(input), expected);
    }

    #[test]
    fn test_normalize_js_multiple_empty_lines() {
        // Multiple consecutive empty lines should be collapsed
        let input = "const a = 1;\n\n\n\nconst b = 2;";
        let expected = "const a = 1\nconst b = 2";
        assert_eq!(normalize_js(input), expected);
    }

    #[test]
    fn test_normalize_js_trailing_whitespace() {
        // Trailing whitespace and newlines should be trimmed
        let input = "const a = 1;  \n\n";
        let expected = "const a = 1";
        assert_eq!(normalize_js(input), expected);
    }

    #[test]
    fn test_normalize_js_leading_empty_lines() {
        // Leading empty lines should be removed
        let input = "\n\nconst a = 1;";
        let expected = "const a = 1";
        assert_eq!(normalize_js(input), expected);
    }

    #[test]
    fn test_normalize_js_import_blank_line() {
        // Blank line after imports should be removed
        let input = "import * as $ from 'svelte';\n\nfunction foo() {}";
        let expected = "import * as $ from 'svelte'\nfunction foo() {}";
        assert_eq!(normalize_js(input), expected);
    }

    #[test]
    fn test_normalize_js_multiline_function_args() {
        // Multiline function call arguments should be normalized
        let input = "customElements.define(\n\t\t'value-builtin',\n\t\tclass extends Foo {})";
        let expected = "customElements.define('value-builtin', class extends Foo {})";
        assert_eq!(normalize_js(input), expected);
    }

    #[test]
    fn test_normalize_js_if_brace_single_stmt() {
        // if (cond) {stmt;} should normalize to if (cond) stmt;
        let input1 = "if (show) $$render(callback);";
        let input2 = "if (show) {$$render(callback);}";
        let normalized1 = normalize_js(input1);
        let normalized2 = normalize_js(input2);
        // Both should normalize to the same output (without braces)
        assert_eq!(normalized1, normalized2);
        assert!(!normalized1.contains('{'));
    }

    #[test]
    fn test_normalize_js_if_brace_with_function_call() {
        // Test the exact case from user report
        // Expected: if (show) $$render_X(consequent_X);
        // Actual:   if (show) {$$render_X(consequent_X);}
        let input1 = "if (show) $$render_X(consequent_X);";
        let input2 = "if (show) {$$render_X(consequent_X);}";
        let normalized1 = normalize_js(input1);
        let normalized2 = normalize_js(input2);
        assert_eq!(
            normalized1, normalized2,
            "Both forms should normalize to the same output"
        );
    }

    #[test]
    fn test_normalize_js_if_brace_preserves_multiple_stmts() {
        // Multiple statements should keep braces
        let input = "if (cond) {a(); b();}";
        let normalized = normalize_js(input);
        // Should preserve braces since there are multiple statements
        assert!(normalized.contains('{'));
    }

    #[test]
    fn test_normalize_js_if_brace_preserves_nested_braces() {
        // Nested braces (callbacks) should keep outer braces
        let input = "if (cond) {fn(() => {});}";
        let normalized = normalize_js(input);
        // Should preserve braces since there are nested braces
        // Note: spacing around braces may be normalized, but braces should remain
        assert!(
            normalized.contains("if (cond){") || normalized.contains("if (cond) {"),
            "Expected braces to be preserved, got: {}",
            normalized
        );
        // The block content should still have the nested function
        assert!(normalized.contains("fn(() => {})"));
    }

    #[test]
    fn test_normalize_js_else_brace_single_stmt() {
        // } else {stmt;} should normalize to } else stmt;
        let input1 = "if (a) b(); else c();";
        let input2 = "if (a) {b();} else {c();}";
        let normalized1 = normalize_js(input1);
        let normalized2 = normalize_js(input2);
        assert_eq!(normalized1, normalized2);
    }

    #[test]
    fn test_normalize_js_else_if_preserved() {
        // else if should be handled correctly
        let input = "if (a) {b();} else if (c) {d();}";
        let normalized = normalize_js(input);
        // Should have "else if" preserved
        assert!(normalized.contains("else if"));
    }
}
