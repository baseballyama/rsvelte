//! Code formatting and cleanup utilities for generated JavaScript.

use std::cell::RefCell;

use oxc_allocator::Allocator;

// Thread-local OXC allocator reused across normalize_js_with_oxc calls to avoid
// repeated allocator creation/destruction overhead. The allocator is reset
// before each use, which clears all allocations while keeping the underlying
// memory chunks for reuse.
thread_local! {
    static NORMALIZE_OXC_ALLOCATOR: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// Execute a closure with a freshly-reset thread-local OXC allocator.
fn with_normalize_allocator<F, R>(f: F) -> R
where
    F: FnOnce(&Allocator) -> R,
{
    NORMALIZE_OXC_ALLOCATOR.with(|cell| {
        let mut alloc = cell.borrow_mut();
        alloc.reset();
        f(&alloc)
    })
}

pub(super) fn replace_state_with_reactive_import(
    script: &str,
    name: &str,
    import_id: &str,
) -> String {
    let mut result = script.to_string();

    // 1. Replace $.get(name) -> import_id()
    let get_pattern = format!("$.get({})", name);
    let get_replacement = format!("{}()", import_id);
    result = result.replace(&get_pattern, &get_replacement);

    // 2. Replace $.mutate(name, EXPR) -> import_id(EXPR)
    // We need to find the matching closing paren for $.mutate(name, ...)
    let mutate_prefix = format!("$.mutate({}, ", name);
    while let Some(start) = result.find(&mutate_prefix) {
        let after_prefix = start + mutate_prefix.len();
        // Find the matching closing paren
        if let Some(end) = find_matching_close_paren(&result[after_prefix..]) {
            let inner = &result[after_prefix..after_prefix + end];
            let replacement = format!("{}({})", import_id, inner);
            result = format!(
                "{}{}{}",
                &result[..start],
                replacement,
                &result[after_prefix + end + 1..] // +1 to skip the closing ')'
            );
        } else {
            break;
        }
    }

    // 3. Replace $.set(name, EXPR) -> import_id(EXPR) (in case assignments are generated)
    let set_prefix = format!("$.set({}, ", name);
    while let Some(start) = result.find(&set_prefix) {
        let after_prefix = start + set_prefix.len();
        if let Some(end) = find_matching_close_paren(&result[after_prefix..]) {
            let inner = &result[after_prefix..after_prefix + end];
            let replacement = format!("{}({})", import_id, inner);
            result = format!(
                "{}{}{}",
                &result[..start],
                replacement,
                &result[after_prefix + end + 1..]
            );
        } else {
            break;
        }
    }

    // 4. Replace remaining bare identifier references.
    // After steps 1-3, any remaining bare `name` identifiers should become `import_id()`.
    // We need to be careful to only replace whole-word occurrences that aren't:
    // - Part of the import_id itself ($$_import_name)
    // - Part of another identifier
    // - On the LHS of a declaration
    let chars: Vec<char> = result.chars().collect();
    let name_chars: Vec<char> = name.chars().collect();
    let name_len = name_chars.len();
    let import_id_len = import_id.len();
    let mut new_result = String::with_capacity(result.len());
    let mut i = 0;

    while i < chars.len() {
        // Check if the next chars match the import_id (skip it to avoid infinite recursion)
        if i + import_id_len <= chars.len() {
            let candidate: String = chars[i..i + import_id_len].iter().collect();
            if candidate == import_id {
                new_result.push_str(import_id);
                i += import_id_len;
                continue;
            }
        }

        // Check if current position matches the bare name
        if i + name_len <= chars.len() {
            let candidate: String = chars[i..i + name_len].iter().collect();
            if candidate == name {
                // Check word boundary before
                let before_ok = if i == 0 {
                    true
                } else {
                    let prev = chars[i - 1];
                    !prev.is_alphanumeric() && prev != '_' && prev != '$'
                };
                // Check word boundary after
                let after_ok = if i + name_len >= chars.len() {
                    true
                } else {
                    let next = chars[i + name_len];
                    !next.is_alphanumeric() && next != '_' && next != '$'
                };

                if before_ok && after_ok {
                    // Replace with import_id()
                    new_result.push_str(&format!("{}()", import_id));
                    i += name_len;
                    continue;
                }
            }
        }

        new_result.push(chars[i]);
        i += 1;
    }

    new_result
}

/// Find the position of the matching close parenthesis in a string.
/// The string starts AFTER the opening context (e.g., after "$.mutate(name, ").
/// Returns the index of the closing ')' relative to the start of the string,
/// or None if not found.
pub(super) fn find_matching_close_paren(s: &str) -> Option<usize> {
    let mut depth = 1; // We're already inside one paren level
    let chars: Vec<char> = s.chars().collect();
    let mut i = 0;
    let mut in_string = false;
    let mut string_char = '"';

    while i < chars.len() {
        let c = chars[i];

        if in_string {
            if c == string_char && (i == 0 || chars[i - 1] != '\\') {
                in_string = false;
            }
            i += 1;
            continue;
        }

        match c {
            '"' | '\'' | '`' => {
                in_string = true;
                string_char = c;
            }
            '(' => depth += 1,
            ')' => {
                depth -= 1;
                if depth == 0 {
                    return Some(i);
                }
            }
            _ => {}
        }
        i += 1;
    }

    None
}

/// Strip single-line `//` comments from JavaScript source code.
///
/// This is needed because our text-based transforms (e.g., wrapping store assignments
/// in `$.store_set(...)`) can create invalid JS when comments containing braces
/// appear mid-expression. The official Svelte compiler avoids this because it uses
/// an AST-based approach where comments are naturally excluded from the output.
///
/// The function preserves:
/// - `//` inside string literals (`'`, `"`, `` ` ``)
/// - The line structure (newlines are preserved)
///
/// It also handles `/* ... */` block comments.
pub(super) fn strip_js_single_line_comments(source: &str) -> String {
    let mut result = String::with_capacity(source.len());
    let chars: Vec<char> = source.chars().collect();
    let len = chars.len();
    let mut i = 0;
    let mut in_string = false;
    let mut string_char = '"';

    while i < len {
        let c = chars[i];

        // Handle string literals
        if !in_string && (c == '\'' || c == '"' || c == '`') {
            in_string = true;
            string_char = c;
            result.push(c);
            i += 1;
            continue;
        }

        if in_string {
            result.push(c);
            if c == '\\' && i + 1 < len {
                // Push the escaped character too
                result.push(chars[i + 1]);
                i += 2;
                continue;
            }
            if c == string_char {
                in_string = false;
            }
            // Handle template literal expressions: `${...}`
            if string_char == '`' && c == '$' && i + 1 < len && chars[i + 1] == '{' {
                // Don't exit string mode for template expression - the backtick
                // string continues after the closing }
            }
            i += 1;
            continue;
        }

        // Detect // single-line comments
        if c == '/' && i + 1 < len && chars[i + 1] == '/' {
            // Collect the comment text to check if it's a svelte-ignore comment
            let comment_start = i;
            i += 2;
            while i < len && chars[i] != '\n' {
                i += 1;
            }
            // Preserve svelte-ignore comments as they affect subsequent code generation
            let comment_text: String = chars[comment_start..i].iter().collect();
            if comment_text.contains("svelte-ignore") {
                result.push_str(&comment_text);
            }
            // The newline will be pushed in the next iteration
            continue;
        }

        // Detect /* block comments */
        if c == '/' && i + 1 < len && chars[i + 1] == '*' {
            i += 2;
            while i + 1 < len && !(chars[i] == '*' && chars[i + 1] == '/') {
                // Preserve newlines inside block comments to maintain line structure
                if chars[i] == '\n' {
                    result.push('\n');
                }
                i += 1;
            }
            if i + 1 < len {
                i += 2; // Skip */
            }
            continue;
        }

        result.push(c);
        i += 1;
    }

    result
}

/// Strip `/* $$async_noop... */;` placeholders from script output.
/// Used when async body transform returns None (no top-level await).
pub(super) fn strip_async_noop_placeholders(s: &str) -> String {
    let lines: Vec<&str> = s.lines().collect();
    let mut result_lines: Vec<String> = Vec::new();

    for line in lines.iter() {
        let trimmed = line.trim();

        // Filter out $$async_noop lines
        if trimmed.contains("$$async_noop") {
            continue;
        }

        // When there's no top-level await, $$async_hole markers (from $inspect()
        // removed in non-dev mode) should become two empty statements (;;) to match
        // the official compiler behavior.
        if trimmed.contains("$$async_hole") {
            // Ensure the previous statement has a semicolon. Without it, ASI causes
            // the first `;` of `;;` to be consumed by the preceding statement's
            // termination, resulting in only 1 EmptyStatement instead of 2.
            if let Some(last) = result_lines.last_mut() {
                let last_trimmed = last.trim_end();
                if !last_trimmed.ends_with(';')
                    && !last_trimmed.ends_with('{')
                    && !last_trimmed.ends_with('}')
                    && !last_trimmed.ends_with(',')
                    && !last_trimmed.is_empty()
                {
                    last.push(';');
                }
            }
            result_lines.push(";;".to_string());
        } else {
            result_lines.push(line.to_string());
        }
    }

    result_lines.join("\n")
}

/// Extract variable names from a $props() destructuring pattern.
/// e.g., "const { name, age } = $props()" -> ["name", "age"]
/// e.g., "let { a: b, c = 1 } = $props()" -> ["b", "c"]
pub(super) fn extract_destructured_prop_names(statement: &str) -> Vec<String> {
    let trimmed = statement.trim();

    // Look for pattern: (const|let|var) { ... } = $props(...)
    let brace_start = match trimmed.find('{') {
        Some(pos) => pos,
        None => return vec![],
    };

    let brace_end = match trimmed.find('}') {
        Some(pos) => pos,
        None => return vec![],
    };

    if brace_start >= brace_end {
        return vec![];
    }

    let inner = &trimmed[brace_start + 1..brace_end];
    let mut names = Vec::new();

    for part in inner.split(',') {
        let part = part.trim();
        if part.is_empty() {
            continue;
        }

        // Handle "...rest" pattern
        if let Some(rest) = part.strip_prefix("...") {
            names.push(rest.trim().to_string());
            continue;
        }

        // Handle "key: alias" or "key: alias = default" pattern
        if let Some(colon_pos) = part.find(':') {
            let after_colon = part[colon_pos + 1..].trim();
            // May have default: "alias = default"
            let alias = if let Some(eq_pos) = after_colon.find('=') {
                after_colon[..eq_pos].trim()
            } else {
                after_colon
            };
            names.push(alias.to_string());
            continue;
        }

        // Handle "name = default" pattern
        if let Some(eq_pos) = part.find('=') {
            names.push(part[..eq_pos].trim().to_string());
            continue;
        }

        // Simple name
        names.push(part.to_string());
    }

    names
}

/// Normalize raw JavaScript formatting using OXC parser and codegen.
///
/// Parses the input as JavaScript, then reprints it with OXC's codegen to normalize:
/// - Spacing around operators (e.g., `let x=0` -> `let x = 0`)
/// - Spacing before braces (e.g., `function f(){` -> `function f() {`)
/// - Consistent semicolons and whitespace
///
/// If parsing fails, returns the original input unchanged.
/// The output uses single quotes, tab indentation, and strips comments
/// (matching esrap/Svelte compiler behavior).
pub(super) fn normalize_js_with_oxc(js: &str, indent_level: usize) -> String {
    // Fast path: skip OXC parse+codegen for scripts without JSDoc or await.
    // JSDoc comments need OXC to fix indentation (tab+space before *).
    // await scripts go through async_body transform which needs OXC formatting.
    let needs_oxc = js.contains("/**") || js.contains("*/") || js.contains("await ");

    if !needs_oxc {
        // Skip ALL OXC-specific post-processing since those fix OXC artifacts
        let code = js.trim_end();
        let code = rejoin_inspect_empty_stmts(code);
        let code = strip_empty_statements_from_js(&code);

        if indent_level == 0 {
            return code;
        }

        // Apply indentation for non-first lines
        let mut result_lines = Vec::new();
        let indent_str: String = "\t".repeat(indent_level);
        let mut in_template_literal = false;
        for (i, line) in code.lines().enumerate() {
            if i == 0 {
                in_template_literal = update_template_literal_state(line, in_template_literal);
                result_lines.push(line.to_string());
            } else if line.is_empty() {
                result_lines.push(String::new());
            } else if in_template_literal {
                in_template_literal = update_template_literal_state(line, in_template_literal);
                result_lines.push(line.to_string());
            } else {
                in_template_literal = update_template_literal_state(line, in_template_literal);
                result_lines.push(format!("{}{}", indent_str, line));
            }
        }
        return result_lines.join("\n");
    }

    // Slow path: full OXC parse+codegen+post-processing
    use oxc_codegen::{Codegen, CodegenOptions, CommentOptions, LegalComment};
    use oxc_parser::Parser;
    use oxc_span::SourceType;

    // Use thread-local allocator to avoid repeated allocation overhead
    let code = with_normalize_allocator(|allocator| {
        let source_type = SourceType::mjs();
        let parsed = Parser::new(allocator, js, source_type).parse();

        if !parsed.errors.is_empty() {
            return js.to_string();
        }

        let options = CodegenOptions {
            single_quote: true,
            comments: CommentOptions {
                normal: true,
                jsdoc: true,
                annotation: true,
                legal: LegalComment::Inline,
            },
            ..CodegenOptions::default()
        };

        let result = Codegen::new().with_options(options).build(&parsed.program);
        result.code.trim_end().to_string()
    });

    let code = &code;

    // Rejoin consecutive `;` lines (from $inspect() removal) BEFORE any other
    // processing. OXC splits `;;` into two separate `;` lines, and later
    // processing (like add_esrap_blank_lines) can insert blank lines between them,
    // making it impossible to rejoin them later.
    let code = rejoin_inspect_empty_stmts(code);

    // OXC breaks arrays with >2 elements into multiple lines. Join them back to
    // single lines to match esrap behavior (esrap keeps short arrays inline).
    let code_joined = join_oxc_multiline_arrays(&code);

    // Add blank lines between different statement types to match esrap behavior.
    let code = add_esrap_blank_lines(&code_joined);

    // Remove blank lines before closing braces that OXC adds (e.g., after return statements).
    // Esrap doesn't add these extra blank lines inside function bodies.
    let code = remove_blank_lines_before_closing_braces(&code);

    // Fix array holes: OXC normalizes `[a,,]` to `[a, ,]`. Convert back to match esrap output.
    let code = fix_array_holes(&code);

    // Re-join split tmp-based destructure declarations that OXC split into separate statements.
    // `transform_legacy_destructure_declarations` produces chained declarations like:
    //   `let tmp = expr, foo = $.mutable_source(tmp.foo), bar = tmp.bar;`
    // but OXC splits them into separate `let` statements. Re-join them.
    let code = rejoin_tmp_destructure_declarations(&code);

    // NOTE: Do NOT rejoin consecutive bare `let x;` declarations.
    // The official Svelte compiler keeps them separate (e.g., `let el;\nlet component;`)
    // rather than combining them into `let el, component;`.

    // Strip standalone empty statements (`;` on its own line), but preserve
    // double-semicolons (`;;` on one line) which come from $inspect() removal.
    // The rejoin was already done right after OXC output, before add_esrap_blank_lines.
    let code = strip_empty_statements_from_js(&code);

    if indent_level == 0 {
        return code;
    }

    // The raw statement goes inside a function body. The codegen's emit_statement
    // adds self.indent() before the FIRST line only. Subsequent lines in the Raw block
    // don't get automatic indentation. We need to re-add the original source-level
    // indentation to non-first lines so the output matches the expected format.
    //
    // IMPORTANT: We must NOT add indentation to lines inside template literals (backticks),
    // because that would modify the template content. Template literal content should
    // preserve its original indentation exactly as-is.
    let mut result_lines = Vec::new();
    let indent_str: String = "\t".repeat(indent_level);
    let mut in_template_literal = false;
    for (i, line) in code.lines().enumerate() {
        if i == 0 {
            // First line gets indent from emit_statement's self.indent()
            // Still need to track template literal state
            in_template_literal = update_template_literal_state(line, in_template_literal);
            result_lines.push(line.to_string());
        } else if line.is_empty() {
            result_lines.push(String::new());
        } else if in_template_literal {
            // Inside a template literal - preserve content exactly as-is
            in_template_literal = update_template_literal_state(line, in_template_literal);
            result_lines.push(line.to_string());
        } else {
            // Subsequent lines need the source-level indentation prefix
            in_template_literal = update_template_literal_state(line, in_template_literal);
            result_lines.push(format!("{}{}", indent_str, line));
        }
    }
    result_lines.join("\n")
}

/// Track whether we're inside a template literal by counting unescaped backticks on a line.
///
/// This is used by `normalize_js_with_oxc` to avoid adding indentation to content
/// inside template literals, which would modify the template content.
pub(super) fn update_template_literal_state(line: &str, currently_in_template: bool) -> bool {
    let mut in_template = currently_in_template;
    let chars: Vec<char> = line.chars().collect();
    let mut i = 0;
    while i < chars.len() {
        let c = chars[i];
        if in_template {
            // Inside template literal: look for closing backtick or ${
            if c == '\\' {
                // Skip escaped character
                i += 2;
                continue;
            } else if c == '`' {
                in_template = false;
            } else if c == '$' && i + 1 < chars.len() && chars[i + 1] == '{' {
                // ${...} expression - we need to skip to matching }, handling nesting
                // For simplicity in line-by-line processing, template expressions
                // on the same line as the backtick are handled, but multi-line
                // expressions just rely on the backtick counting on subsequent lines.
                i += 2;
                let mut brace_depth = 1;
                while i < chars.len() && brace_depth > 0 {
                    if chars[i] == '{' {
                        brace_depth += 1;
                    } else if chars[i] == '}' {
                        brace_depth -= 1;
                    } else if chars[i] == '`' && brace_depth == 0 {
                        break;
                    }
                    i += 1;
                }
                continue;
            }
        } else {
            // Outside template literal: look for opening backtick
            if c == '\'' || c == '"' {
                // Skip string literals
                let quote = c;
                i += 1;
                while i < chars.len() {
                    if chars[i] == '\\' {
                        i += 2;
                        continue;
                    }
                    if chars[i] == quote {
                        break;
                    }
                    i += 1;
                }
            } else if c == '/' && i + 1 < chars.len() && chars[i + 1] == '/' {
                // Line comment - rest of line is comment
                break;
            } else if c == '`' {
                in_template = true;
            }
        }
        i += 1;
    }
    in_template
}

/// Re-join tmp-based destructure declarations that OXC split into separate statements.
///
/// `transform_legacy_destructure_declarations` produces chained declarations like:
///   `let tmp = expr, foo = $.mutable_source(tmp.foo), bar = tmp.bar;`
/// OXC splits these into separate `let` statements. This function detects the pattern
/// and re-joins them into a single chained declaration.
pub(super) fn rejoin_tmp_destructure_declarations(code: &str) -> String {
    // Quick pre-check: if there's no `let tmp` pattern, there are no tmp declarations to rejoin
    if !code.contains("let tmp") {
        return code.to_string();
    }

    // Find lines that start a tmp declaration (possibly multi-line)
    let lines: Vec<&str> = code.lines().collect();
    let mut result: Vec<String> = Vec::with_capacity(lines.len());
    let mut i = 0;

    while i < lines.len() {
        let line = lines[i];
        let trimmed = line.trim();

        // Check if this line starts a `let tmp = ...` or `let tmp_N = ...` declaration
        let is_tmp_start = trimmed.starts_with("let tmp = ") || trimmed.starts_with("let tmp_");

        if is_tmp_start {
            // Extract the tmp variable name
            let tmp_name = if let Some(eq_pos) = trimmed.find(" = ") {
                trimmed[4..eq_pos].to_string() // "let ".len() = 4
            } else {
                result.push(line.to_string());
                i += 1;
                continue;
            };

            // Accumulate the full tmp declaration (may span multiple lines for IIFEs)
            let mut tmp_decl_lines = vec![line.to_string()];
            let mut j = i + 1;
            let mut depth: i32 = 0;
            let mut decl_complete = trimmed.ends_with(';');

            // Count braces/parens in first line
            for c in trimmed.chars() {
                match c {
                    '{' | '(' | '[' => depth += 1,
                    '}' | ')' | ']' => depth -= 1,
                    _ => {}
                }
            }

            // If the declaration is not complete (multi-line), accumulate more lines
            if !decl_complete {
                while j < lines.len() {
                    let next_line = lines[j];
                    let next_trimmed = next_line.trim();
                    tmp_decl_lines.push(next_line.to_string());

                    for c in next_trimmed.chars() {
                        match c {
                            '{' | '(' | '[' => depth += 1,
                            '}' | ')' | ']' => depth -= 1,
                            _ => {}
                        }
                    }

                    j += 1;

                    if depth <= 0 && next_trimmed.ends_with(';') {
                        decl_complete = true;
                        break;
                    }
                }
            } else {
                j = i + 1;
            }

            if !decl_complete {
                // Incomplete declaration, just push as-is
                for l in &tmp_decl_lines {
                    result.push(l.clone());
                }
                i = j;
                continue;
            }

            // Now look ahead for following lines that reference this tmp variable
            // Skip blank lines between tmp declaration and follow-up declarations
            let mut chain_declarators: Vec<String> = Vec::new();
            let mut k = j;

            // Skip blank lines
            while k < lines.len() && lines[k].trim().is_empty() {
                k += 1;
            }

            let chain_start = k;
            while k < lines.len() {
                let next_trimmed = lines[k].trim();
                if next_trimmed.is_empty() {
                    k += 1;
                    continue;
                }
                // Check if this line is `let xxx = ...tmp_name...;` where xxx references tmp
                if next_trimmed.starts_with("let ")
                    && next_trimmed.contains(&format!("{}.", tmp_name))
                    && next_trimmed.ends_with(';')
                {
                    // Extract the declarator part (after "let ", before ";")
                    let declarator = &next_trimmed[4..next_trimmed.len() - 1];
                    chain_declarators.push(declarator.to_string());
                    k += 1;
                } else {
                    break;
                }
            }
            let _ = chain_start;

            if !chain_declarators.is_empty() {
                // Re-join: remove the trailing ";" from the tmp decl and append chained declarators
                let last_idx = tmp_decl_lines.len() - 1;
                let last_line = tmp_decl_lines[last_idx].trim_end();
                let last_line = last_line.trim_end_matches(';');
                tmp_decl_lines[last_idx] =
                    format!("{}, {};", last_line, chain_declarators.join(", "));

                for l in &tmp_decl_lines {
                    result.push(l.clone());
                }
                i = k;
            } else {
                for l in &tmp_decl_lines {
                    result.push(l.clone());
                }
                i = j;
            }
        } else {
            result.push(line.to_string());
            i += 1;
        }
    }

    result.join("\n")
}

/// Re-join consecutive bare `let x;` declarations that OXC splits from `let x, y, z;`.
///
/// OXC's codegen splits `let x, y, z;` into `let x;\nlet y;\nlet z;`.
/// This function detects consecutive bare `let` declarations (no initializer) at the
/// same indent level and re-joins them into a single comma-separated declaration.
#[allow(dead_code)]
pub(super) fn rejoin_bare_let_declarations(code: &str) -> String {
    let lines: Vec<&str> = code.lines().collect();
    let mut result: Vec<String> = Vec::with_capacity(lines.len());
    let mut i = 0;

    while i < lines.len() {
        let line = lines[i];
        if let Some(name) = extract_bare_let_name(line) {
            let indent = &line[..line.len() - line.trim_start().len()];
            let mut names = vec![name];
            let mut j = i + 1;

            while j < lines.len() {
                let next = lines[j];
                let next_indent = &next[..next.len() - next.trim_start().len()];
                if next_indent == indent
                    && let Some(next_name) = extract_bare_let_name(next)
                {
                    names.push(next_name);
                    j += 1;
                    continue;
                }
                break;
            }

            if names.len() > 1 {
                result.push(format!("{}let {};", indent, names.join(", ")));
                i = j;
            } else {
                result.push(line.to_string());
                i += 1;
            }
        } else {
            result.push(line.to_string());
            i += 1;
        }
    }

    result.join("\n")
}

/// Extract the variable name from a bare `let x;` declaration (no initializer).
/// Returns None if the line is not a bare let declaration.
#[allow(dead_code)]
pub(super) fn extract_bare_let_name(line: &str) -> Option<String> {
    let trimmed = line.trim();
    if trimmed.starts_with("let ") && trimmed.ends_with(';') && !trimmed.contains('=') {
        let name = trimmed[4..trimmed.len() - 1].trim();
        if !name.is_empty() && !name.contains(',') && !name.contains(' ') {
            return Some(name.to_string());
        }
    }
    None
}

/// Strip standalone empty statements (`;` on its own line) from JavaScript code.
///
/// OXC sometimes emits standalone semicolons that the Svelte compiler doesn't produce.
/// This removes lines that consist only of whitespace followed by `;`.
/// Lines with `;;` (from $inspect() removal) are kept as-is.
pub(super) fn strip_empty_statements_from_js(code: &str) -> String {
    // Quick pre-check: if there's no standalone `;` possibility (no newline followed by
    // optional whitespace and `;`), skip the expensive line-by-line processing.
    // We check for `\n;` or a code that starts with `;` (first line could be bare `;`).
    if !code.starts_with(';') && !code.contains("\n;") && !code.contains("\n\t;") {
        return code.to_string();
    }

    let lines: Vec<&str> = code.lines().collect();
    let result: Vec<&str> = lines
        .into_iter()
        .filter(|line| {
            let trimmed = line.trim();
            // Keep lines that are not just a single `;`
            // Keep `;;` which comes from $inspect() removal
            trimmed != ";"
        })
        .collect();
    result.join("\n")
}

/// Rejoin consecutive `;` lines that OXC split from `;;` (from $inspect() removal).
///
/// When $inspect() is removed in non-dev mode, it produces `;;`. OXC then parses this
/// as two EmptyStatements and outputs them as two separate `;` lines. We rejoin them
/// back to `;;` so they survive the empty-statement stripping.
pub(super) fn rejoin_inspect_empty_stmts(code: &str) -> String {
    // Quick pre-check: if there's no `;\n` pattern, there can't be consecutive `;` lines
    if !code.contains(";\n") {
        return code.to_string();
    }

    let lines: Vec<&str> = code.lines().collect();
    let mut result: Vec<String> = Vec::with_capacity(lines.len());
    let mut i = 0;
    while i < lines.len() {
        if lines[i].trim() == ";" && i + 1 < lines.len() && lines[i + 1].trim() == ";" {
            // Rejoin consecutive `;` lines into `;;`
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

/// Join multi-line arrays that OXC broke into multiple lines back to single lines.
///
/// OXC's codegen breaks arrays with more than 2 elements into multiple lines,
/// but esrap keeps short arrays (like `['a', 'b', 'c']`) on a single line.
/// This function only joins arrays whose elements are simple (no nested brackets/braces).
pub(super) fn join_oxc_multiline_arrays(code: &str) -> String {
    // Quick pre-check: if there's no `[\n` pattern, there are no multi-line arrays to join
    if !code.contains("[\n") {
        return code.to_string();
    }

    let lines: Vec<&str> = code.lines().collect();
    let mut result: Vec<String> = Vec::with_capacity(lines.len());
    let mut i = 0;

    while i < lines.len() {
        let line = lines[i];

        // Check if a line ends with `[` (start of multi-line array)
        // but NOT lines that are just `[` (those are intentional block arrays)
        if line.trim_end().ends_with('[') && line.trim() != "[" {
            // Collect all lines until we find the closing `]`
            let mut array_lines: Vec<&str> = vec![line];
            let mut j = i + 1;
            let mut found_close = false;
            let mut has_nested = false;

            while j < lines.len() {
                let next = lines[j];
                let trimmed = next.trim();
                array_lines.push(next);

                // Check if this line starts with `]` (closing the array)
                if trimmed.starts_with(']') {
                    found_close = true;
                    j += 1;
                    break;
                }

                // Check for nested brackets/braces/parens that make joining unsafe
                if trimmed.contains('{')
                    || trimmed.contains('}')
                    || trimmed.contains('[')
                    || trimmed.contains(']')
                    || trimmed.contains('(')
                    || trimmed.contains(')')
                {
                    has_nested = true;
                    break;
                }

                j += 1;
            }

            if found_close && !has_nested && array_lines.len() <= 10 {
                // All elements are simple (no nested brackets/braces)
                let prefix_end = line.rfind('[').unwrap();
                let prefix = &line[..=prefix_end];

                // Collect simple element values from intermediate lines
                let mut elements: Vec<String> = Vec::new();
                let last_idx = array_lines.len() - 1;
                for array_line in &array_lines[1..last_idx] {
                    let elem = array_line.trim();
                    let elem = elem.strip_suffix(',').unwrap_or(elem).trim();
                    if !elem.is_empty() {
                        elements.push(elem.to_string());
                    }
                }

                // Get the suffix after `]` from the last array line
                let last_line = array_lines[last_idx].trim();
                let suffix = last_line.strip_prefix(']').unwrap_or("");

                let joined = format!("{}{}]{}", prefix, elements.join(", "), suffix);

                // Only join if the result is reasonably short
                if joined.len() <= 120 {
                    result.push(joined);
                    i = j;
                    continue;
                }
            }
        }

        result.push(line.to_string());
        i += 1;
    }

    result.join("\n")
}

/// Add blank lines between different statement types in OXC output to match esrap behavior.
///
/// Esrap inserts a blank line between consecutive statements/members when:
/// - The statement types differ (e.g., VariableDeclaration followed by FunctionDeclaration)
/// - Either statement is multiline
///
/// This applies at every nesting level (top-level, inside functions, inside classes).
pub(super) fn add_esrap_blank_lines(code: &str) -> String {
    let lines: Vec<&str> = code.lines().collect();
    if lines.is_empty() {
        return code.to_string();
    }

    // Track the previous statement type and multiline status at each indent level.
    let mut prev_type_at_indent: std::collections::HashMap<usize, &str> =
        std::collections::HashMap::new();
    let mut prev_multiline_at_indent: std::collections::HashMap<usize, bool> =
        std::collections::HashMap::new();
    // Track indent levels that have a pending leading comment for the next statement
    let mut comment_at_indent: std::collections::HashSet<usize> = std::collections::HashSet::new();

    let mut result: Vec<&str> = Vec::with_capacity(lines.len() + 20);

    // Track template literal state
    let mut in_template_literal = false;
    // Track bracket depth to avoid inserting blank lines inside arrays
    let mut bracket_depth: i32 = 0;

    let mut i = 0;
    while i < lines.len() {
        let line = lines[i];

        // Track template literal state using proper unescaped backtick counting.
        // Naive counting (all backticks) fails when template literals contain
        // escaped backticks (\`) or backticks inside string literals within
        // interpolations (e.g., `${$.html('`')}`).
        if in_template_literal {
            result.push(line);
            let unescaped = count_unescaped_backticks_in_template(line);
            if unescaped % 2 == 1 {
                in_template_literal = false;
            }
            i += 1;
            continue;
        }

        let unescaped = count_unescaped_backticks_outside_template(line);
        if unescaped % 2 == 1 {
            in_template_literal = true;
        }

        // Skip ALL existing blank lines - we add them ourselves based on esrap rules.
        // The source may have blank lines that don't match esrap's behavior.
        if line.trim().is_empty() {
            i += 1;
            continue;
        }

        // Save bracket depth before processing this line for blank line decisions
        let bracket_depth_before = bracket_depth;

        let indent_level = line.bytes().take_while(|&b| b == b'\t').count();
        let trimmed = line.trim_start_matches('\t');

        // Lines that are just closing braces/brackets end a multiline statement
        if trimmed.starts_with('}') || trimmed.starts_with(']') || trimmed.starts_with(')') {
            prev_multiline_at_indent.insert(indent_level, true);
            // Reset inner indent state when entering a new block (e.g. `} else {`)
            if trimmed.ends_with('{') {
                prev_type_at_indent.remove(&(indent_level + 1));
                prev_multiline_at_indent.remove(&(indent_level + 1));
            }
            // Update bracket depth for closing brackets
            if !in_template_literal {
                for ch in trimmed.chars() {
                    match ch {
                        '[' => bracket_depth += 1,
                        ']' => bracket_depth -= 1,
                        _ => {}
                    }
                }
            }
            result.push(line);
            i += 1;
            continue;
        }

        // Reset inner indent state when opening a new block
        if trimmed.ends_with('{') {
            prev_type_at_indent.remove(&(indent_level + 1));
            prev_multiline_at_indent.remove(&(indent_level + 1));
        }

        let stmt_type = classify_js_statement(trimmed);

        // Comments are "transparent" - they attach to the following node (as leading
        // comments in esrap). They don't trigger blank lines or update type tracking.
        // However, they make the following statement multiline (since comment + statement
        // spans multiple lines).
        if stmt_type == "Comment" {
            // Mark that the next statement at this indent level has a leading comment
            comment_at_indent.insert(indent_level);
            result.push(line);
            i += 1;
            continue;
        }

        // Check if this statement is multiline
        // A leading comment makes the statement multiline
        let has_leading_comment = comment_at_indent.remove(&indent_level);
        let is_multiline =
            has_leading_comment || is_stmt_multiline_at_indent(&lines, i, indent_level);

        // Add blank line if needed (only for statement context, not inside arrays)
        // Inside arrays (bracket_depth > 0), blank line rules are different:
        // esrap only adds blank lines between two multiline items (both must be multiline).
        if bracket_depth_before > 0 {
            // Array context: only add blank line when both previous and current are multiline
            if prev_type_at_indent.contains_key(&indent_level) {
                let prev_ml = prev_multiline_at_indent
                    .get(&indent_level)
                    .copied()
                    .unwrap_or(false);
                if is_multiline
                    && prev_ml
                    && !result.is_empty()
                    && !result.last().is_some_and(|l| l.trim().is_empty())
                {
                    result.push("");
                }
            }
        } else if let Some(prev_type) = prev_type_at_indent.get(&indent_level) {
            let prev_ml = prev_multiline_at_indent
                .get(&indent_level)
                .copied()
                .unwrap_or(false);
            if (stmt_type != *prev_type || is_multiline || prev_ml)
                && !result.is_empty()
                && !result.last().is_some_and(|l| l.trim().is_empty())
            {
                result.push("");
            }
        }

        prev_type_at_indent.insert(indent_level, stmt_type);
        prev_multiline_at_indent.insert(indent_level, is_multiline);
        result.push(line);

        // Track bracket depth AFTER processing blank line logic.
        // This ensures the line that opens/closes a bracket is evaluated
        // in the correct context (before entering/leaving the array).
        if !in_template_literal {
            for ch in line.trim().chars() {
                match ch {
                    '[' => bracket_depth += 1,
                    ']' => bracket_depth -= 1,
                    _ => {}
                }
            }
        }

        i += 1;
    }

    // Remove trailing empty lines
    while result.last().is_some_and(|l| l.trim().is_empty()) {
        result.pop();
    }

    result.join("\n")
}

/// Count unescaped backticks in a line when we are INSIDE a template literal.
/// Inside a template literal, we only need to find the closing backtick.
/// Escaped backticks (`\``) should not be counted.
pub(super) fn count_unescaped_backticks_in_template(line: &str) -> usize {
    let chars: Vec<char> = line.chars().collect();
    let mut count = 0;
    let mut i = 0;
    while i < chars.len() {
        if chars[i] == '\\' {
            i += 2; // skip escaped character
            continue;
        }
        if chars[i] == '`' {
            count += 1;
        }
        i += 1;
    }
    count
}

/// Count unescaped backticks in a line when we are OUTSIDE a template literal.
/// We need to skip backticks that appear inside single-quoted or double-quoted
/// string literals (e.g., `$.html('`')` has a backtick inside single quotes).
pub(super) fn count_unescaped_backticks_outside_template(line: &str) -> usize {
    let chars: Vec<char> = line.chars().collect();
    let mut count = 0;
    let mut i = 0;
    let mut in_string: Option<char> = None;
    while i < chars.len() {
        let c = chars[i];
        if let Some(quote) = in_string {
            if c == '\\' {
                i += 2; // skip escaped character inside string
                continue;
            }
            if c == quote {
                in_string = None;
            }
            i += 1;
            continue;
        }
        if c == '\\' {
            i += 2; // skip escaped character
            continue;
        }
        if c == '\'' || c == '"' {
            in_string = Some(c);
            i += 1;
            continue;
        }
        if c == '`' {
            count += 1;
        }
        i += 1;
    }
    count
}

/// Check if a statement starting at `start` spans multiple lines at the given indent level.
pub(super) fn is_stmt_multiline_at_indent(
    lines: &[&str],
    start: usize,
    indent_level: usize,
) -> bool {
    if start + 1 >= lines.len() {
        return false;
    }

    let trimmed = lines[start].trim_start_matches('\t');
    // Opening a block is always multiline
    if trimmed.ends_with('{') || trimmed.ends_with("=> {") {
        return true;
    }

    // Check if next non-empty line is at deeper indent (continuation)
    for next in &lines[(start + 1)..] {
        let next = *next;
        if next.trim().is_empty() {
            continue;
        }
        let next_indent = next.bytes().take_while(|&b| b == b'\t').count();
        if next_indent > indent_level {
            return true;
        }
        break;
    }

    false
}

/// Classify a JavaScript statement or class member for blank line logic (matching esrap's behavior).
pub(super) fn classify_js_statement(line: &str) -> &'static str {
    if line.starts_with("var ") || line.starts_with("let ") || line.starts_with("const ") {
        "VariableDeclaration"
    } else if line.starts_with("function ") || line.starts_with("async function ") {
        "FunctionDeclaration"
    } else if line.starts_with("class ") {
        "ClassDeclaration"
    } else if line.starts_with("if ") || line.starts_with("if(") {
        "IfStatement"
    } else if line.starts_with("for ") || line.starts_with("for(") {
        "ForStatement"
    } else if line.starts_with("while ") || line.starts_with("while(") {
        "WhileStatement"
    } else if line.starts_with("return ") || line.starts_with("return;") || line == "return" {
        "ReturnStatement"
    } else if line.starts_with("export ") {
        "ExportDeclaration"
    } else if line.starts_with("import ") {
        "ImportDeclaration"
    } else if line.starts_with("get ") {
        "MethodDefinition_get"
    } else if line.starts_with("set ") {
        "MethodDefinition_set"
    } else if line.starts_with("constructor(") || line.starts_with("constructor (") {
        "MethodDefinition_constructor"
    } else if line.starts_with('#') {
        "PropertyDefinition"
    } else if line.starts_with("//") || line.starts_with("/*") {
        "Comment"
    } else {
        "ExpressionStatement"
    }
}

/// Detect the common indentation level (in tabs) of the first non-empty line
/// in the original script content.
#[allow(dead_code)]
pub(super) fn detect_indent_level(js: &str) -> usize {
    for line in js.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }
        // Count leading tabs
        let tabs = line.chars().take_while(|c| *c == '\t').count();
        return tabs;
    }
    0
}

/// Fix array holes: OXC normalizes `[a,,]` to `[a, ,]`.
/// Convert `, ,]` patterns back to `,,]` to match esrap output.
pub(super) fn fix_array_holes(code: &str) -> String {
    if !code.contains(", ,]") {
        return code.to_string();
    }
    // Replace patterns like `, ,]` with `,,]`
    // Handle multiple consecutive holes: `, , ,]` -> `,,,]`
    let mut result = code.to_string();
    while result.contains(", ,") {
        result = result.replace(", ,", ",,");
    }
    result
}

/// Remove blank lines that appear immediately before a closing brace `}`.
///
/// OXC sometimes inserts blank lines before `}` in function bodies
/// (e.g., after return statements), but esrap does not.
pub(super) fn remove_blank_lines_before_closing_braces(code: &str) -> String {
    // Quick pre-check: if there's no blank line followed eventually by `}`,
    // there's nothing to remove. A blank line before `}` requires `\n\n` in the code.
    if !code.contains("\n\n") {
        return code.to_string();
    }

    let lines: Vec<&str> = code.lines().collect();
    let mut result: Vec<&str> = Vec::with_capacity(lines.len());

    for (i, line) in lines.iter().enumerate() {
        // Skip blank lines that are immediately followed by a line containing only `}`
        if line.trim().is_empty() {
            // Look ahead to find next non-empty line
            let next_non_empty = lines[(i + 1)..].iter().find(|l| !l.trim().is_empty());
            if let Some(next) = next_non_empty
                && next.trim() == "}"
            {
                continue; // Skip this blank line
            }
        }
        result.push(line);
    }

    result.join("\n")
}
