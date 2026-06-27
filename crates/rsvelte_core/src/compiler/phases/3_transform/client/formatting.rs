//! Code formatting and cleanup utilities for generated JavaScript.

use std::cell::RefCell;

use memchr::memmem;

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
    // Build patterns without intermediate format! allocations
    let mut get_pattern = String::with_capacity(6 + name.len());
    get_pattern.push_str("$.get(");
    get_pattern.push_str(name);
    get_pattern.push(')');
    let mut get_replacement = String::with_capacity(import_id.len() + 2);
    get_replacement.push_str(import_id);
    get_replacement.push_str("()");
    result = result.replace(&get_pattern, &get_replacement);

    // 2. Replace $.mutate(name, EXPR) -> import_id(EXPR)
    // We need to find the matching closing paren for $.mutate(name, ...)
    let mut mutate_prefix = String::with_capacity(10 + name.len());
    mutate_prefix.push_str("$.mutate(");
    mutate_prefix.push_str(name);
    mutate_prefix.push_str(", ");
    while let Some(start) = result.find(&mutate_prefix) {
        let after_prefix = start + mutate_prefix.len();
        // Find the matching closing paren
        if let Some(end) = find_matching_close_paren(&result[after_prefix..]) {
            let inner = &result[after_prefix..after_prefix + end];
            let mut replacement = String::with_capacity(import_id.len() + inner.len() + 2);
            replacement.push_str(import_id);
            replacement.push('(');
            replacement.push_str(inner);
            replacement.push(')');
            let mut new_result = String::with_capacity(result.len());
            new_result.push_str(&result[..start]);
            new_result.push_str(&replacement);
            new_result.push_str(&result[after_prefix + end + 1..]); // +1 to skip the closing ')'
            result = new_result;
        } else {
            break;
        }
    }

    // 3. Replace $.set(name, EXPR) -> import_id(EXPR) (in case assignments are generated)
    let mut set_prefix = String::with_capacity(7 + name.len());
    set_prefix.push_str("$.set(");
    set_prefix.push_str(name);
    set_prefix.push_str(", ");
    while let Some(start) = result.find(&set_prefix) {
        let after_prefix = start + set_prefix.len();
        if let Some(end) = find_matching_close_paren(&result[after_prefix..]) {
            let inner = &result[after_prefix..after_prefix + end];
            let mut replacement = String::with_capacity(import_id.len() + inner.len() + 2);
            replacement.push_str(import_id);
            replacement.push('(');
            replacement.push_str(inner);
            replacement.push(')');
            let mut new_result = String::with_capacity(result.len());
            new_result.push_str(&result[..start]);
            new_result.push_str(&replacement);
            new_result.push_str(&result[after_prefix + end + 1..]);
            result = new_result;
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
    //
    // Use byte-level scanning for ASCII delimiters, but copy UTF-8 segments to preserve encoding.
    let result_bytes = result.as_bytes();
    let name_bytes = name.as_bytes();
    let name_len = name_bytes.len();
    let import_id_bytes = import_id.as_bytes();
    let import_id_len = import_id_bytes.len();
    let mut new_result = String::with_capacity(result.len() + result.len() / 4);
    let mut i = 0;
    let mut copy_start = 0;

    while i < result_bytes.len() {
        // Check if the next bytes match the import_id (skip it to avoid infinite recursion)
        if i + import_id_len <= result_bytes.len()
            && &result_bytes[i..i + import_id_len] == import_id_bytes
        {
            new_result.push_str(&result[copy_start..i]);
            new_result.push_str(import_id);
            i += import_id_len;
            copy_start = i;
            continue;
        }

        // Check if current position matches the bare name
        if i + name_len <= result_bytes.len() && &result_bytes[i..i + name_len] == name_bytes {
            // Check word boundary before
            let before_ok = if i == 0 {
                true
            } else {
                let prev = result_bytes[i - 1];
                !prev.is_ascii_alphanumeric() && prev != b'_' && prev != b'$'
            };
            // Check word boundary after
            let after_ok = if i + name_len >= result_bytes.len() {
                true
            } else {
                let next = result_bytes[i + name_len];
                !next.is_ascii_alphanumeric() && next != b'_' && next != b'$'
            };

            if before_ok && after_ok {
                // Replace with import_id()
                new_result.push_str(&result[copy_start..i]);
                new_result.push_str(import_id);
                new_result.push_str("()");
                i += name_len;
                copy_start = i;
                continue;
            }
        }

        i += 1;
    }

    // Flush remaining content
    if copy_start < result_bytes.len() {
        new_result.push_str(&result[copy_start..]);
    }

    new_result
}

/// Find the position of the matching close parenthesis in a string.
/// The string starts AFTER the opening context (e.g., after "$.mutate(name, ").
/// Returns the index of the closing ')' relative to the start of the string,
/// or None if not found.
pub(super) fn find_matching_close_paren(s: &str) -> Option<usize> {
    let mut depth: u32 = 1; // We're already inside one paren level
    let bytes = s.as_bytes();
    let mut i = 0;
    let mut in_string = false;
    let mut string_char = b'"';

    while i < bytes.len() {
        let c = bytes[i];

        if in_string {
            if c == string_char && (i == 0 || bytes[i - 1] != b'\\') {
                in_string = false;
            }
            i += 1;
            continue;
        }

        match c {
            b'"' | b'\'' | b'`' => {
                in_string = true;
                string_char = c;
            }
            b'(' => depth += 1,
            b')' => {
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
    let bytes = source.as_bytes();
    let len = bytes.len();
    let mut i = 0;
    let mut copy_start = 0; // Start of current segment to bulk-copy (preserves UTF-8)
    let mut in_string = false;
    let mut string_char = b'"';
    // Stack of template-literal interpolation brace counts. Each entry is the
    // depth of `{}` inside the current `${...}`; when it reaches -1 the
    // interpolation closes and we return to the surrounding template literal.
    let mut template_interp_stack: Vec<i32> = Vec::new();

    while i < len {
        let c = bytes[i];

        // Inside a backtick template literal: detect `${` to enter interpolation
        if in_string && string_char == b'`' && c == b'$' && i + 1 < len && bytes[i + 1] == b'{' {
            template_interp_stack.push(0);
            in_string = false;
            i += 2;
            continue;
        }

        // Handle string literals
        if !in_string && (c == b'\'' || c == b'"' || c == b'`') {
            in_string = true;
            string_char = c;
            i += 1;
            continue;
        }

        if in_string {
            if c == b'\\' && i + 1 < len {
                // Skip escaped character
                i += 2;
                continue;
            }
            if c == string_char {
                in_string = false;
            }
            i += 1;
            continue;
        }

        // While inside a template-literal interpolation, track `{`/`}`.
        // The closing `}` of the `${` does not require a matching `{`.
        if let Some(top) = template_interp_stack.last_mut() {
            if c == b'{' {
                *top += 1;
                i += 1;
                continue;
            } else if c == b'}' {
                if *top == 0 {
                    template_interp_stack.pop();
                    in_string = true;
                    string_char = b'`';
                    i += 1;
                    continue;
                } else {
                    *top -= 1;
                    i += 1;
                    continue;
                }
            }
        }

        // Detect // single-line comments
        if c == b'/' && i + 1 < len && bytes[i + 1] == b'/' {
            // Flush everything before the comment
            result.push_str(&source[copy_start..i]);
            // Scan to end of line
            let comment_start = i;
            i += 2;
            while i < len && bytes[i] != b'\n' {
                i += 1;
            }
            // Preserve svelte-ignore comments as they affect subsequent code generation
            let comment_text = &source[comment_start..i];
            if memmem::find(comment_text.as_bytes(), b"svelte-ignore").is_some() {
                result.push_str(comment_text);
            }
            copy_start = i;
            // The newline will be copied in the next segment
            continue;
        }

        // Detect /* block comments */
        if c == b'/' && i + 1 < len && bytes[i + 1] == b'*' {
            // Flush everything before the comment
            result.push_str(&source[copy_start..i]);
            i += 2;
            while i + 1 < len && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                // Preserve newlines inside block comments to maintain line structure
                if bytes[i] == b'\n' {
                    result.push('\n');
                }
                i += 1;
            }
            if i + 1 < len {
                i += 2; // Skip */
            }
            copy_start = i;
            continue;
        }

        i += 1;
    }

    // Flush remaining content
    if copy_start < len {
        result.push_str(&source[copy_start..]);
    }

    result
}

/// Strip `/* $$async_noop... */;` placeholders from script output.
/// Used when async body transform returns None (no top-level await).
pub(super) fn strip_async_noop_placeholders(s: &str) -> String {
    // Fast path: if no $$async markers exist, return early
    if memmem::find(s.as_bytes(), b"$$async_noop").is_none()
        && memmem::find(s.as_bytes(), b"$$async_hole").is_none()
    {
        return s.to_string();
    }

    let mut result = String::with_capacity(s.len());
    let mut first = true;
    // Track whether previous line needs a semicolon appended
    let mut need_semicolon_on_prev = false;

    for line in s.lines() {
        let trimmed = line.trim();

        // Filter out $$async_noop lines
        if memmem::find(trimmed.as_bytes(), b"$$async_noop").is_some() {
            continue;
        }

        if need_semicolon_on_prev {
            // Insert semicolon before the newline of the previous content
            result.push(';');
            need_semicolon_on_prev = false;
        }

        if !first {
            result.push('\n');
        }
        first = false;

        // When there's no top-level await, $$async_hole markers (from $inspect()
        // removed in non-dev mode) should become two empty statements (;;) to match
        // the official compiler behavior.
        if memmem::find(trimmed.as_bytes(), b"$$async_hole").is_some() {
            // Check if prev content needs a semicolon
            let prev_trimmed = result.trim_end();
            if !prev_trimmed.ends_with(';')
                && !prev_trimmed.ends_with('{')
                && !prev_trimmed.ends_with('}')
                && !prev_trimmed.ends_with(',')
                && !prev_trimmed.is_empty()
            {
                result.push(';');
            }
            result.push_str(";;");
        } else {
            result.push_str(line);
        }
    }

    result
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
/// Detect the common base indentation shared by all non-empty, non-first lines.
/// Skips the first line because normalize_js_with_oxc doesn't add indent to it
/// (the codegen's emit_statement handles first-line indentation).
/// After trim(), the first line often has 0 indent which would defeat detection.
fn detect_base_indent(code: &str) -> usize {
    let mut min_indent: Option<usize> = None;
    for (i, line) in code.lines().enumerate() {
        if i == 0 || line.trim().is_empty() {
            continue;
        }
        let indent = line.len() - line.trim_start().len();
        min_indent = Some(min_indent.map_or(indent, |m: usize| m.min(indent)));
    }
    min_indent.unwrap_or(0)
}

/// Strip `base_indent` characters from the start of a line.
fn strip_indent(line: &str, base_indent: usize) -> &str {
    if base_indent == 0 || line.len() <= base_indent {
        return line;
    }
    // Only strip if the line has enough leading whitespace
    let leading = line.len() - line.trim_start().len();
    if leading >= base_indent {
        &line[base_indent..]
    } else {
        line.trim_start()
    }
}

/// Parses the input as JavaScript, then reprints it with OXC's codegen to normalize:
/// - Spacing around operators (e.g., `let x=0` -> `let x = 0`)
/// - Spacing before braces (e.g., `function f(){` -> `function f() {`)
/// - Consistent semicolons and whitespace
///
/// If parsing fails, returns the original input unchanged.
/// The output uses single quotes, tab indentation, and strips comments
/// (matching esrap/Svelte compiler behavior).
pub(crate) fn normalize_js_with_oxc(js: &str, indent_level: usize) -> String {
    // Fast path: skip OXC parse+codegen for scripts without JSDoc or await.
    // JSDoc comments need OXC to fix indentation (tab+space before *).
    // await scripts go through async_body transform which needs OXC formatting.
    let needs_oxc = memmem::find(js.as_bytes(), b"/**").is_some()
        || memmem::find(js.as_bytes(), b"*/").is_some()
        || memmem::find(js.as_bytes(), b"await ").is_some();

    if !needs_oxc {
        // Skip ALL OXC-specific post-processing since those fix OXC artifacts
        let code = js.trim_end();
        let code = rejoin_inspect_empty_stmts(code);
        let code = strip_empty_statements_from_js(&code);

        if indent_level == 0 {
            return code;
        }

        // Strip the common base indentation from the source before applying target indent.
        // Script content retains its original indentation (e.g., tabs from Svelte source).
        // We must remove that base indent first, then apply the target indent level.
        let base_indent = detect_base_indent(&code);

        // Apply indentation for non-first lines
        // Build directly into a single String to avoid Vec<String> + join overhead
        let indent_str: &str = match indent_level {
            1 => "\t",
            2 => "\t\t",
            3 => "\t\t\t",
            _ => &"\t".repeat(indent_level),
        };
        let mut result = String::with_capacity(code.len() + code.lines().count() * indent_level);
        // Use the full template/interpolation stack, not a `bool`: a multi-line
        // `${ … }` interpolation (the `[Template, Interp]` state) cannot be
        // represented by a single bool, which then desyncs and mis-indents the
        // continuation lines of a LATER template literal's string content. This
        // mirrors the slow path below.
        let mut stack: Vec<TemplateStateFrame> = Vec::new();
        for (i, line) in code.lines().enumerate() {
            if i > 0 {
                result.push('\n');
            }
            let in_template_literal = matches!(stack.last(), Some(TemplateStateFrame::Template));
            if i == 0 {
                let stripped = strip_indent(line, base_indent);
                update_template_literal_stack(stripped, &mut stack);
                result.push_str(stripped);
            } else if line.is_empty() {
                // empty line, nothing to push
            } else if in_template_literal {
                update_template_literal_stack(line, &mut stack);
                result.push_str(line);
            } else {
                let stripped = strip_indent(line, base_indent);
                update_template_literal_stack(stripped, &mut stack);
                result.push_str(indent_str);
                result.push_str(stripped);
            }
        }
        return result;
    }

    // Slow path: parse and re-print with the `rsvelte_esrap` printer — the
    // printer the official Svelte compiler uses (esrap). It preserves literal
    // raw spellings (quotes, numbers), threads comments positionally (with the
    // ` * ` block-comment dedent), keeps short arrays inline, applies esrap's
    // blank-line margins, and emits `[a,, b]` holes directly — so the entire
    // tail of oxc_codegen string fix-ups (`restore_original_quotes`,
    // `restore_number_literals`, `restore_block_comment_alignment`,
    // `join_oxc_multiline_arrays`, `add_esrap_blank_lines`,
    // `remove_blank_lines_before_closing_braces`, `fix_array_holes`,
    // `rejoin_tmp_destructure_declarations`) is no longer needed.
    use oxc_parser::Parser;
    use oxc_span::SourceType;

    // Preserve `;;` markers ($inspect-removal empty-statement pairs) across the
    // parse+print: both oxc and esrap drop empty statements, so smuggle them as
    // a void-expression pair and restore afterwards. Single-quoted to match
    // esrap's preserved quote style.
    const DOUBLE_SEMI_PLACEHOLDER: &str = "void '$$DOUBLE_SEMI$$';void '$$DOUBLE_SEMI$$'";
    let has_double_semi = memmem::find(js.as_bytes(), b";;").is_some();
    let protected = if has_double_semi {
        js.replace(";;", DOUBLE_SEMI_PLACEHOLDER)
    } else {
        js.to_string()
    };

    // Use thread-local allocator to avoid repeated allocation overhead
    let code = with_normalize_allocator(|allocator| {
        let parsed = Parser::new(allocator, &protected, SourceType::mjs()).parse();
        if !parsed.diagnostics.is_empty() {
            return js.to_string();
        }
        rsvelte_esrap::print(&parsed.program, &protected)
    });

    // Restore `;;`. esrap keeps the two void statements on separate lines.
    let code = if has_double_semi {
        code.replace("void '$$DOUBLE_SEMI$$';\nvoid '$$DOUBLE_SEMI$$';", ";;")
            .replace(DOUBLE_SEMI_PLACEHOLDER, ";;")
    } else {
        code
    };

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
    // Use a persistent stack so we correctly preserve state across lines,
    // including inside nested template literals (e.g. `${`...`}`). A simple
    // `bool` cannot represent whether we are in a nested Template vs an
    // outer Template, so we thread the full stack through.
    let mut stack: Vec<TemplateStateFrame> = Vec::new();
    for (i, line) in code.lines().enumerate() {
        let in_template_at_start = matches!(stack.last(), Some(TemplateStateFrame::Template));
        if i == 0 {
            // First line gets indent from emit_statement's self.indent()
            update_template_literal_stack(line, &mut stack);
            result_lines.push(line.to_string());
        } else if line.is_empty() {
            result_lines.push(String::new());
        } else if in_template_at_start {
            // Inside a template literal - preserve content exactly as-is
            update_template_literal_stack(line, &mut stack);
            result_lines.push(line.to_string());
        } else {
            // Subsequent lines need the source-level indentation prefix
            update_template_literal_stack(line, &mut stack);
            result_lines.push(format!("{}{}", indent_str, line));
        }
    }
    result_lines.join("\n")
}

/// Track whether we're inside a template literal by counting unescaped backticks on a line.
///
/// This is used by `normalize_js_with_oxc` to avoid adding indentation to content
/// inside template literals, which would modify the template content.
/// A single frame in the template-literal / interpolation parser stack.
#[derive(Clone, Copy)]
pub(super) enum TemplateStateFrame {
    /// We are inside the text portion of a template literal.
    Template,
    /// We are inside a `${...}` expression. The u32 counts `{`/`}` pairs
    /// (not counting the outer `${`'s matching `}`).
    Interp(u32),
}

/// Stack-based template/interpolation tracker. Mutates `stack` as the line
/// is scanned. This is the canonical implementation — the `bool`-based
/// `update_template_literal_state` wrapper exists for callers that only
/// care about the outer template state.
pub(super) fn update_template_literal_stack(line: &str, stack: &mut Vec<TemplateStateFrame>) {
    let bytes = line.as_bytes();
    let len = bytes.len();
    let mut i = 0;
    while i < len {
        let c = bytes[i];
        match stack.last().copied() {
            Some(TemplateStateFrame::Template) => {
                if c == b'\\' {
                    i += 2;
                    continue;
                } else if c == b'`' {
                    stack.pop();
                    i += 1;
                    continue;
                } else if c == b'$' && i + 1 < len && bytes[i + 1] == b'{' {
                    stack.push(TemplateStateFrame::Interp(0));
                    i += 2;
                    continue;
                }
                i += 1;
            }
            Some(TemplateStateFrame::Interp(_)) => {
                if c == b'\\' {
                    i += 1;
                    continue;
                } else if c == b'\'' || c == b'"' {
                    let quote = c;
                    i += 1;
                    while i < len {
                        if bytes[i] == b'\\' && i + 1 < len {
                            i += 2;
                            continue;
                        }
                        if bytes[i] == quote {
                            i += 1;
                            break;
                        }
                        i += 1;
                    }
                    continue;
                } else if c == b'`' {
                    stack.push(TemplateStateFrame::Template);
                    i += 1;
                    continue;
                } else if c == b'{' {
                    if let Some(TemplateStateFrame::Interp(d)) = stack.last_mut() {
                        *d += 1;
                    }
                    i += 1;
                    continue;
                } else if c == b'}' {
                    if let Some(TemplateStateFrame::Interp(d)) = stack.last_mut() {
                        if *d == 0 {
                            stack.pop();
                            i += 1;
                            continue;
                        }
                        *d -= 1;
                    }
                    i += 1;
                    continue;
                }
                i += 1;
            }
            None => {
                if c == b'\'' || c == b'"' {
                    let quote = c;
                    i += 1;
                    while i < len {
                        if bytes[i] == b'\\' && i + 1 < len {
                            i += 2;
                            continue;
                        }
                        if bytes[i] == quote {
                            i += 1;
                            break;
                        }
                        i += 1;
                    }
                    continue;
                } else if c == b'/' && i + 1 < len && bytes[i + 1] == b'/' {
                    break;
                } else if c == b'`' {
                    stack.push(TemplateStateFrame::Template);
                    i += 1;
                    continue;
                }
                i += 1;
            }
        }
    }
}

pub(super) fn update_template_literal_state(line: &str, currently_in_template: bool) -> bool {
    // Stack-based state machine that properly handles:
    //   * nested template literals inside interpolations (e.g. `` `a ${`b${c}`}` ``)
    //   * strings inside interpolations (which may contain `{`/`}`/`` ` ``)
    //   * escape sequences both inside templates and strings
    //   * line comments that start outside a template
    //
    // Stack entries:
    //   * State::Template — we are inside a template literal's text portion
    //   * State::Interp(depth) — we are inside a `${...}` expression; `depth`
    //     tracks `{`/`}` pairs (not counting the outer `${` or its matching `}`)
    //
    // When currently_in_template is true, we start with one Template on the stack.
    #[derive(Clone, Copy)]
    enum State {
        Template,
        Interp(u32),
    }
    let mut stack: Vec<State> = Vec::new();
    if currently_in_template {
        stack.push(State::Template);
    }
    let bytes = line.as_bytes();
    let len = bytes.len();
    let mut i = 0;
    while i < len {
        let c = bytes[i];
        match stack.last().copied() {
            Some(State::Template) => {
                if c == b'\\' {
                    // Skip escaped character
                    i += 2;
                    continue;
                } else if c == b'`' {
                    stack.pop(); // close template literal
                    i += 1;
                    continue;
                } else if c == b'$' && i + 1 < len && bytes[i + 1] == b'{' {
                    stack.push(State::Interp(0));
                    i += 2;
                    continue;
                }
                i += 1;
            }
            Some(State::Interp(_)) => {
                // Inside a `${...}` expression — treat it as JS code.
                // Track braces so we can detect the matching `}` that closes
                // the interpolation.
                if c == b'\\' {
                    // Escape only meaningful inside strings/templates, but harmless
                    // here — advance one char.
                    i += 1;
                    continue;
                } else if c == b'\'' || c == b'"' {
                    // Skip a string literal
                    let quote = c;
                    i += 1;
                    while i < len {
                        if bytes[i] == b'\\' && i + 1 < len {
                            i += 2;
                            continue;
                        }
                        if bytes[i] == quote {
                            i += 1;
                            break;
                        }
                        i += 1;
                    }
                    continue;
                } else if c == b'`' {
                    // Nested template literal begins
                    stack.push(State::Template);
                    i += 1;
                    continue;
                } else if c == b'{' {
                    if let Some(State::Interp(d)) = stack.last_mut() {
                        *d += 1;
                    }
                    i += 1;
                    continue;
                } else if c == b'}' {
                    if let Some(State::Interp(d)) = stack.last_mut() {
                        if *d == 0 {
                            // Matches the outer `${`
                            stack.pop();
                            i += 1;
                            continue;
                        }
                        *d -= 1;
                    }
                    i += 1;
                    continue;
                }
                i += 1;
            }
            None => {
                // Top-level JS code
                if c == b'\'' || c == b'"' {
                    // Skip string literals
                    let quote = c;
                    i += 1;
                    while i < len {
                        if bytes[i] == b'\\' && i + 1 < len {
                            i += 2;
                            continue;
                        }
                        if bytes[i] == quote {
                            i += 1;
                            break;
                        }
                        i += 1;
                    }
                    continue;
                } else if c == b'/' && i + 1 < len && bytes[i + 1] == b'/' {
                    // Line comment — rest of line is comment
                    break;
                } else if c == b'`' {
                    stack.push(State::Template);
                    i += 1;
                    continue;
                }
                i += 1;
            }
        }
    }
    matches!(stack.last(), Some(State::Template))
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
    if !code.starts_with(';')
        && memmem::find(code.as_bytes(), b"\n;").is_none()
        && memmem::find(code.as_bytes(), b"\n\t;").is_none()
    {
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
    if memmem::find(code.as_bytes(), b";\n").is_none() {
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
