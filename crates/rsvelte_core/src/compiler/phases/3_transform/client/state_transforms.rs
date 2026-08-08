//! State and prop assignment transformations, identifier analysis, and legacy transforms.

use memchr::memmem;
use rustc_hash::FxHashSet;
use std::borrow::Cow;

use super::STATE_TMP_COUNTER;
use super::destructure_transforms::{ArrayHelperRead, extract_destructure_paths};
use super::expression_utils::{
    byte_pos_to_char_index, find_statement_end_client, is_shadowed_by_for_loop_var,
};
use super::rune_transforms::{
    find_default_equals, find_derived_property_colon, split_derived_array_elements,
    split_derived_object_properties,
};
use crate::compiler::phases::phase2_analyze::scope::DeclarationKind;
use crate::compiler::phases::phase3_transform::shared::js_scan::{code_bytes, skip_opaque};

/// Check if a string starts with a JavaScript control-flow keyword.
///
/// When `find_assignment_position` returns a position, the text to the left is
/// the "LHS". If that LHS begins with a keyword such as `if`, `for`, `while`,
/// `do`, `switch`, or `try`, then the `=` is actually inside a nested
/// statement and not a top-level assignment.
pub(super) fn lhs_starts_with_keyword(lhs: &str) -> bool {
    let lhs = lhs.trim();
    for keyword in &[
        "if ", "if(", "for ", "for(", "while ", "while(", "do ", "do{", "switch ", "switch(",
        "try ", "try{",
    ] {
        if lhs.starts_with(keyword) {
            return true;
        }
    }
    false
}

/// Find the position of the assignment operator (=) that's not part of ==, ===, !=, !==
pub(super) fn find_assignment_position(expr: &str) -> Option<usize> {
    let bytes = expr.as_bytes();
    let mut i = 0;
    let mut depth = 0i32;
    // Last significant code byte, both for the operator lookbehind and to tell a
    // regex literal from a division.
    let mut prev: Option<u8> = None;

    while i < bytes.len() {
        if let Some((next, is_comment)) = skip_opaque(bytes, i, prev) {
            if !is_comment {
                prev = Some(b'x');
            }
            i = next;
            continue;
        }
        let c = bytes[i];
        match c {
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => depth -= 1,
            b'=' if depth == 0 => {
                // Check it's not ==, ===, !=, !==, <=, >=, =>,
                // or compound assignment operators: +=, -=, *=, /=, %=, **=,
                // <<=, >>=, >>>=, &=, |=, ^=, &&=, ||=, ??=
                let next = bytes.get(i + 1).copied();

                if !matches!(
                    prev,
                    Some(
                        b'=' | b'!'
                            | b'<'
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
                ) && next != Some(b'=')
                    && next != Some(b'>')
                {
                    return Some(i);
                }
            }
            _ => {}
        }
        if !c.is_ascii_whitespace() {
            prev = Some(c);
        }
        i += 1;
    }
    None
}

/// Extract the base identifier from a member expression like `obj.foo` or `arr[idx]`.
///
/// Returns the base identifier name if the input starts with a valid identifier followed
/// by `.` or `[`. Returns `None` if the input is not a simple member expression.
///
/// # Examples
///
/// - `"obj.foo"` → `Some("obj")`
/// - `"arr[idx]"` → `Some("arr")`
/// - `"obj"` → `None` (no member separator)
/// - `".foo"` → `None` (empty base)
pub(super) fn extract_member_expression_base(lhs: &str) -> Option<&str> {
    let lhs = lhs.trim();
    let dot_pos = lhs.find('.');
    let bracket_pos = lhs.find('[');
    let sep_pos = match (dot_pos, bracket_pos) {
        (Some(d), Some(b)) => Some(d.min(b)),
        (Some(d), None) => Some(d),
        (None, Some(b)) => Some(b),
        (None, None) => None,
    };
    if let Some(pos) = sep_pos {
        let base = &lhs[..pos];
        // Must be a valid identifier (alphanumeric, underscore, dollar sign)
        // and non-empty
        if !base.is_empty()
            && base
                .chars()
                .all(|c| c.is_alphanumeric() || c == '_' || c == '$')
            && base
                .chars()
                .next()
                .map(|c| !c.is_ascii_digit())
                .unwrap_or(false)
        {
            Some(base)
        } else {
            None
        }
    } else {
        None
    }
}

// ---------------------------------------------------------------------------
// Context detection utilities (lines 11537-11931 of mod.rs)
// ---------------------------------------------------------------------------

/// Check if a position is inside a string literal.
/// This prevents transforming identifiers inside quoted strings.
/// Handles template literal interpolations: `foo ${bar} baz` - bar is NOT inside a string.
pub(super) fn is_inside_string_literal(code: &str, pos: usize) -> bool {
    let before = &code[..pos];
    let mut in_string = false;
    let mut string_char = ' ';
    // Track template literal interpolation depth.
    // When inside a backtick string and we see `${`, we push to this stack.
    // The value represents the brace depth within the interpolation.
    let mut template_interp_depth: Vec<usize> = Vec::new();
    let mut chars = before.chars().peekable();

    while let Some(c) = chars.next() {
        if in_string {
            if c == '\\' {
                // Skip escaped character
                chars.next();
                continue;
            }
            // Inside a template literal, handle `${` as interpolation start
            if string_char == '`' && c == '$' && chars.peek() == Some(&'{') {
                chars.next(); // consume '{'
                in_string = false;
                template_interp_depth.push(0);
                continue;
            }
            if c == string_char {
                in_string = false;
            }
            continue;
        }

        // A quote inside a comment is text: `// it doesn't matter` would
        // otherwise open a string that nothing closes, so every position after
        // it reads as "inside a string" and its rewrite is skipped.
        if c == '/' {
            match chars.peek() {
                Some('/') => {
                    chars.next();
                    for ch in chars.by_ref() {
                        if ch == '\n' {
                            break;
                        }
                    }
                    continue;
                }
                Some('*') => {
                    chars.next();
                    let mut prev = '\0';
                    for ch in chars.by_ref() {
                        if prev == '*' && ch == '/' {
                            break;
                        }
                        prev = ch;
                    }
                    continue;
                }
                _ => {}
            }
        }

        if !template_interp_depth.is_empty() {
            // Inside a template literal interpolation - track braces
            if c == '{' {
                if let Some(depth) = template_interp_depth.last_mut() {
                    *depth += 1;
                }
            } else if c == '}' {
                let should_pop = template_interp_depth
                    .last()
                    .is_some_and(|depth| *depth == 0);
                if should_pop {
                    template_interp_depth.pop();
                    // We're back inside the template literal string
                    in_string = true;
                    string_char = '`';
                } else if let Some(depth) = template_interp_depth.last_mut() {
                    *depth -= 1;
                }
            } else if c == '"' || c == '\'' || c == '`' {
                in_string = true;
                string_char = c;
            }
        } else if c == '"' || c == '\'' || c == '`' {
            in_string = true;
            string_char = c;
        }
    }

    in_string
}

// ---------------------------------------------------------------------------
// State/prop assignments and legacy transforms (lines 11933-13491 of mod.rs)
// ---------------------------------------------------------------------------

/// Wrap `$.set(var, ...)` calls with `$.store_unsub()` when the state variable has
/// a corresponding store subscription (`$var`).
///
/// This is needed because when a store variable like `foo = writable(42)` is reassigned,
/// the store subscription needs to be unsubscribed and resubscribed.
///
/// Transforms:
/// - `$.set(foo, writable(42))` → `$.store_unsub($.set(foo, writable(42)), '$foo', $$stores)`
///
/// Reference: declarations.js `add_state_transformers` → `assign_value_with_store`
pub(super) fn wrap_store_unsub_for_state_sets<'a>(
    line: &'a str,
    state_vars: &[String],
    store_sub_vars: &[String],
) -> Cow<'a, str> {
    if state_vars.is_empty() || store_sub_vars.is_empty() {
        return Cow::Borrowed(line);
    }
    if memmem::find(line.as_bytes(), b"$.set(").is_none() {
        return Cow::Borrowed(line);
    }
    super::store_unsub_wrap_ast::transform_store_unsub_wrap_ast(line, state_vars, store_sub_vars)
        .map_or(Cow::Borrowed(line), Cow::Owned)
}

/// Transform prop assignments to getter/setter function call syntax.
///
/// Props in legacy mode are declared with $.prop() which returns a getter/setter function.
/// So `x = value` becomes `x(value)`, and `x += 1` becomes `x(x() + 1)`.
///
/// This handles:
/// - Simple assignment: `x = value` → `x(value)`
/// - Compound assignment: `x += value` → `x(x() + value)`
///
/// Note: Update expressions (x++, --x, etc.) are handled by transform_prop_update_expressions
/// which must be called BEFORE this function.
pub(super) fn transform_prop_assignments<'a>(
    line: &'a str,
    prop_vars: &[String],
    non_bindable_prop_vars: &[String],
    prop_invalidate_bodies: &rustc_hash::FxHashMap<String, String>,
) -> Cow<'a, str> {
    if prop_vars.is_empty() {
        return Cow::Borrowed(line);
    }

    // Skip lines that are prop declarations (contain $.prop() or $.rest_props())
    // These are generated by transform_props_destructuring and should not be modified.
    // In multi-declarator statements like `let foo = $.prop(...),\n\tbar = $.prop(...)`,
    // the subsequent declarators don't have `let` before them, so the simple assignment
    // transform would incorrectly convert `bar = $.prop(...)` to `bar($.prop(...))`.
    if memmem::find(line.as_bytes(), b"$.prop(").is_some()
        || memmem::find(line.as_bytes(), b"$.rest_props(").is_some()
    {
        return Cow::Borrowed(line);
    }

    // Quick pre-check: if none of the prop vars appear as identifiers, skip expensive transforms
    let var_set: FxHashSet<&str> = prop_vars.iter().map(|v| v.as_str()).collect();
    if !super::utils::text_contains_any_identifier(line, &var_set) {
        return Cow::Borrowed(line);
    }

    // Two AST passes — both cover every shape the text loops
    // (just deleted) used to handle:
    // 1. `name = expr` / `name <op>= expr` (bare LHS) →
    //    `name(expr)` / `name(name() <op> (expr))`
    // 2. `name.foo = expr` / `name().foo = expr` (bindable prop
    //    member mutations) → `name(name().foo = expr, true)`
    let after_assigns = super::prop_assign_ast::transform_prop_assign_ast(line, prop_vars);
    let stage1: &str = after_assigns.as_deref().unwrap_or(line);
    let mutated = super::prop_member_mutate_ast::transform_prop_member_mutate_ast(
        stage1,
        prop_vars,
        non_bindable_prop_vars,
        prop_invalidate_bodies,
    );
    mutated
        .or(after_assigns)
        .map_or(Cow::Borrowed(line), Cow::Owned)
}

/// Split a multi-declarator variable statement into individual declarations.
///
/// Converts `let a = 1, b = 2, c = 3;` into `["let a = 1;", "let b = 2;", "let c = 3;"]`
/// while handling nested structures like arrays and objects correctly.
///
/// If the line is not a multi-declarator statement, returns None.
pub(super) fn split_multi_declarator(line: &str) -> Option<Vec<String>> {
    // Check if this is a variable declaration
    let trimmed = line.trim();
    let (keyword, rest) = if let Some(r) = trimmed.strip_prefix("let ") {
        ("let", r)
    } else if let Some(r) = trimmed.strip_prefix("const ") {
        ("const", r)
    } else {
        let r = trimmed.strip_prefix("var ")?;
        ("var", r)
    };

    // Split at every top-level `,`, stopping at a top-level `;`. `code_bytes`
    // yields only the delimiters that are code, so the text between two cut
    // points — comments and literals included — is copied verbatim.
    let mut depth = 0;
    let mut cuts: Vec<(usize, u8)> = Vec::new();
    for (i, c) in code_bytes(rest.as_bytes()) {
        match c {
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' if depth > 0 => {
                depth -= 1;
            }
            b',' if depth == 0 => cuts.push((i, c)),
            b';' if depth == 0 => {
                cuts.push((i, c));
                break;
            }
            _ => {}
        }
    }

    if !cuts.iter().any(|&(_, c)| c == b',') {
        return None;
    }

    let mut declarators: Vec<String> = Vec::new();
    let mut start = 0usize;
    let mut ended_at_semicolon = false;
    for &(i, c) in &cuts {
        let piece = &rest[start..i];
        if c == b';' {
            if !piece.trim().is_empty() {
                declarators.push(piece.trim().to_string());
            }
            ended_at_semicolon = true;
        } else {
            declarators.push(piece.trim().trim_end_matches(';').trim().to_string());
        }
        start = i + 1;
        if ended_at_semicolon {
            break;
        }
    }
    if !ended_at_semicolon {
        let piece = &rest[start..];
        if !piece.trim().is_empty() {
            declarators.push(piece.trim().trim_end_matches(';').trim().to_string());
        }
    }

    if declarators.len() <= 1 {
        return None;
    }

    // Get leading whitespace from original line
    let leading_ws: String = line.chars().take_while(|c| c.is_whitespace()).collect();

    // Convert to individual declarations
    let result: Vec<String> = declarators
        .iter()
        .map(|d| format!("{}{} {};", leading_ws, keyword, d))
        .collect();

    Some(result)
}

/// Transform legacy destructuring declarations into tmp-based individual declarations.
///
/// In legacy mode, when a destructuring declaration contains state variables,
/// the official Svelte compiler expands it using `extract_paths` (in `create_state_declarators`).
///
/// Transforms:
///   `let { foo, bar } = expr` (where foo is state) ->
///   `let tmp = expr, foo = $.mutable_source(tmp.foo), bar = tmp.bar;`
///
/// Reference: `create_state_declarators` in VariableDeclaration.js
pub(super) fn transform_legacy_destructure_declarations<'a>(
    statement: &'a str,
    legacy_state_var_names: &[String],
    immutable: bool,
    dev: bool,
) -> Cow<'a, str> {
    // Only look at the first line to determine if this is a destructuring declaration
    let first_line = statement.lines().next().unwrap_or("");
    let trimmed = first_line.trim();

    // Determine declaration keyword
    let (keyword, rest_start) = if let Some(r) = trimmed.strip_prefix("let ") {
        ("let", r)
    } else if let Some(r) = trimmed.strip_prefix("const ") {
        ("const", r)
    } else if let Some(r) = trimmed.strip_prefix("var ") {
        ("var", r)
    } else {
        return Cow::Borrowed(statement);
    };

    let rest_start = rest_start.trim();

    // Check if this is a destructuring pattern (starts with { or [)
    if !rest_start.starts_with('{') && !rest_start.starts_with('[') {
        return Cow::Borrowed(statement);
    }

    // For the full pattern matching, we need the complete statement (multi-line)
    let full_trimmed = statement.trim();
    let keyword_len = keyword.len() + 1; // +1 for space
    let rest = full_trimmed[keyword_len..].trim();

    let is_object = rest.starts_with('{');
    let close_bracket = if is_object { b'}' } else { b']' };

    // Find the matching close bracket in the PATTERN (not the expression)
    let mut depth = 0i32;
    let mut pattern_end = None;
    for (i, c) in code_bytes(rest.as_bytes()) {
        if c == b'{' || c == b'[' || c == b'(' {
            depth += 1;
        } else if c == b'}' || c == b']' || c == b')' {
            depth -= 1;
            if depth == 0 && c == close_bracket {
                pattern_end = Some(i);
                break;
            }
        }
    }

    let pattern_end = match pattern_end {
        Some(e) => e,
        None => return Cow::Borrowed(statement),
    };

    let pattern_str = &rest[..=pattern_end];
    let after_pattern = rest[pattern_end + 1..].trim();

    // Must have `= expr` after the pattern
    if !after_pattern.starts_with('=') {
        return Cow::Borrowed(statement);
    }

    let expr = after_pattern[1..].trim().trim_end_matches(';').trim();

    // Extract variable names from the pattern
    let var_names = extract_legacy_destructure_var_names(pattern_str);

    // Check if any destructured variable is a state variable
    let has_state = var_names
        .iter()
        .any(|name| legacy_state_var_names.contains(name));

    if !has_state {
        return Cow::Borrowed(statement);
    }

    // Generate tmp variable name
    let tmp_idx = STATE_TMP_COUNTER.with(|c| {
        let current = c.get();
        c.set(current + 1);
        current
    });
    let tmp_name = if tmp_idx == 0 {
        "tmp".to_string()
    } else {
        format!("tmp_{}", tmp_idx)
    };

    let immutable_arg = if immutable { ", true" } else { "" };

    let mut paths = Vec::new();
    let mut inserts = Vec::new();
    extract_destructure_paths(
        pattern_str,
        &tmp_name,
        ArrayHelperRead::Signal,
        &mut paths,
        &mut inserts,
    );

    // Upstream emits `tmp`, then every `$$array` insert, then every path.
    let mut parts = vec![format!("{} = {}", tmp_name, expr)];
    parts.extend(
        inserts
            .into_iter()
            .map(|(name, value)| format!("{} = $.derived(() => {})", name, value)),
    );
    for (name, access) in paths {
        if legacy_state_var_names.contains(&name) {
            let source = format!("$.mutable_source({}{})", access, immutable_arg);
            parts.push(format!(
                "{} = {}",
                name,
                tag_legacy_source(source, &name, dev)
            ));
        } else {
            parts.push(format!("{} = {}", name, access));
        }
    }

    let trailing = if full_trimmed.ends_with(';') { ";" } else { "" };
    Cow::Owned(format!("{} {}{}", keyword, parts.join(", "), trailing))
}

/// Every name bound by a destructuring pattern, nested leaves included.
pub(super) fn extract_legacy_destructure_var_names(pattern: &str) -> Vec<String> {
    let mut names = Vec::new();
    collect_legacy_destructure_var_names(pattern, &mut names);
    names
}

fn collect_legacy_destructure_var_names(pattern: &str, names: &mut Vec<String>) {
    let pattern = pattern.trim();
    if pattern.is_empty() {
        return;
    }

    if let Some(rest_target) = pattern.strip_prefix("...") {
        collect_legacy_destructure_var_names(rest_target, names);
        return;
    }
    if let Some(eq_pos) = find_default_equals(pattern) {
        collect_legacy_destructure_var_names(&pattern[..eq_pos], names);
        return;
    }

    if pattern.starts_with('{') && pattern.ends_with('}') {
        for prop in split_derived_object_properties(&pattern[1..pattern.len() - 1]) {
            let value = match find_derived_property_colon(&prop) {
                Some(colon_pos) => &prop[colon_pos + 1..],
                None => prop.as_str(),
            };
            collect_legacy_destructure_var_names(value, names);
        }
    } else if pattern.starts_with('[') && pattern.ends_with(']') {
        for element in split_derived_array_elements(&pattern[1..pattern.len() - 1]) {
            collect_legacy_destructure_var_names(&element, names);
        }
    } else {
        names.push(pattern.to_string());
    }
}

/// Whether a statement is the chained `<keyword> tmp = expr, … ` expansion built
/// by `transform_legacy_destructure_declarations`; those must not be split into
/// one declaration per declarator, because the later ones read the `tmp` /
/// `$$array` helpers declared alongside them.
fn is_legacy_destructure_expansion(line: &str) -> bool {
    if memmem::find(line.as_bytes(), b"$.mutable_source(").is_none() {
        return false;
    }
    let trimmed = line.trim_start();
    let after_keyword = ["let ", "const ", "var "]
        .iter()
        .find_map(|kw| trimmed.strip_prefix(kw));
    let Some(rest) = after_keyword.and_then(|rest| rest.trim_start().strip_prefix("tmp")) else {
        return false;
    };
    let rest = rest.trim_start_matches(|c: char| c == '_' || c.is_ascii_digit());
    rest.trim_start().starts_with('=')
}

/// Dev-mode `$.tag(<source>, '<name>')` label for a legacy state source.
///
/// Only declarations reaching this emitter are tagged: `legacy_reactive`
/// sources (`$: x = …`) are built as AST elsewhere and upstream leaves those
/// untagged even though they print the same `$.mutable_source()` call.
/// A line comment swallows the rest of its line, so when an initializer ends
/// inside one the generated `)` has to start on the next line — upstream breaks
/// the line for the same reason.
fn break_after_line_comment(expr: &str) -> &'static str {
    let last_line = expr.rsplit('\n').next().unwrap_or(expr);
    if super::props_transforms::find_line_comment_position(last_line).is_some() {
        "\n"
    } else {
        ""
    }
}

fn tag_legacy_source(call: String, name: &str, dev: bool) -> String {
    if dev {
        format!("$.tag({}, '{}')", call, name)
    } else {
        call
    }
}

/// Transform legacy state declarations to $.mutable_source() calls.
///
/// In legacy (non-runes) mode, variables that are promoted to State kind
/// (updated and referenced in template/$:/StyleDirective) need to be wrapped
/// in $.mutable_source() for reactivity.
///
/// Transforms:
/// - `let state = 'foo'` → `let state = $.mutable_source('foo')`
/// - `let count = 0` → `let count = $.mutable_source(0)`
/// - `const arr = [1, 2]` → `const arr = $.mutable_source([1, 2])`
pub(super) fn transform_legacy_state_declarations<'a>(
    line: &'a str,
    legacy_state_vars: &[(String, Option<String>, DeclarationKind)],
    immutable: bool,
    dev: bool,
) -> Cow<'a, str> {
    if legacy_state_vars.is_empty() {
        return Cow::Borrowed(line);
    }

    // Handle multi-declarator statements like `let a = 1, b = 2, c = 3;`
    // Split into individual declarations first to handle each one separately.
    // BUT skip declarations produced by transform_legacy_destructure_declarations
    // (which chain `tmp = expr, foo = $.mutable_source(tmp.foo), ...` and must stay chained).
    if !is_legacy_destructure_expansion(line)
        && let Some(split_lines) = split_multi_declarator(line)
    {
        // The split itself re-renders the statement, so this branch answers with
        // its own text even when no declarator was rewritten.
        let transformed_lines: Vec<Cow<'_, str>> = split_lines
            .iter()
            .map(|l| transform_legacy_state_declarations(l, legacy_state_vars, immutable, dev))
            .collect();
        return Cow::Owned(transformed_lines.join("\n"));
    }

    let mut result = Cow::Borrowed(line);

    for (var, _initial, decl_kind) in legacy_state_vars {
        // Every pattern below is `"<keyword> <var>…"`, so one scan rules the whole
        // variable out instead of formatting and searching four needles per keyword.
        if memmem::find(result.as_bytes(), var.as_bytes()).is_none() {
            continue;
        }

        // Determine the keyword(s) to look for based on declaration kind
        let keywords: Vec<&str> = match decl_kind {
            DeclarationKind::Let => vec!["let"],
            DeclarationKind::Const => vec!["const"],
            DeclarationKind::Var => vec!["var"],
            _ => vec!["let", "const", "var"],
        };

        let mut matched = false;

        for keyword in &keywords {
            if matched {
                break;
            }

            // First, try to match `keyword varname = value` pattern. The `=` is
            // matched WITHOUT a trailing space so an init that begins on the next
            // line (`let x =\n  init`) is still caught — leading whitespace after
            // `=` is skipped below before the init is read.
            let pattern_with_init = format!("{} {} =", keyword, var);
            // Use a loop to find the first match that is NOT inside a for-loop header.
            // For example, in `function foo() { for (let x = 0; ...) {} }`, the `let x = 0`
            // inside the for-loop should be skipped - it's a loop variable, not a state variable.
            {
                let mut search_offset = 0;
                while let Some(rel_pos) = result[search_offset..].find(&pattern_with_init) {
                    let pos = search_offset + rel_pos;
                    let after_raw = &result[pos + pattern_with_init.len()..];

                    // Skip `==` / `=>` — those aren't an assignment `=`.
                    if after_raw.starts_with('=') || after_raw.starts_with('>') {
                        search_offset = pos + pattern_with_init.len();
                        continue;
                    }

                    // Skip whitespace (incl. newlines) between `=` and the init.
                    let ws = after_raw.len() - after_raw.trim_start().len();
                    let after = &after_raw[ws..];

                    // Check if already wrapped
                    if after.starts_with("$.mutable_source(") || after.starts_with("$.prop(") {
                        matched = true;
                        break;
                    }

                    // Check if this declaration is inside a for-loop header.
                    // Scan backwards from `pos` to see if we find `for (` with unmatched parens.
                    let chars: Vec<char> = result.chars().collect();
                    let char_pos = byte_pos_to_char_index(&result, pos + keyword.len() + 1);
                    if is_shadowed_by_for_loop_var(&chars, char_pos, var) {
                        // This `let x = ...` is inside a for-loop header, skip it
                        search_offset = pos + pattern_with_init.len();
                        continue;
                    }

                    // Find the value expression
                    let expr_end = find_statement_end_client(after);
                    let expr = after[..expr_end].trim().trim_end_matches(';').trim();

                    // Build the replacement
                    let call = if immutable {
                        format!(
                            "$.mutable_source({}{}, true)",
                            expr,
                            break_after_line_comment(expr)
                        )
                    } else {
                        format!(
                            "$.mutable_source({}{})",
                            expr,
                            break_after_line_comment(expr)
                        )
                    };
                    let replacement = format!(
                        "{} {} = {}",
                        keyword,
                        var,
                        tag_legacy_source(call, var, dev)
                    );

                    // Replace the declaration
                    result = Cow::Owned(format!(
                        "{}{}{}",
                        &result[..pos],
                        replacement,
                        &result[pos + pattern_with_init.len() + ws + expr_end..]
                    ));
                    matched = true;
                    break;
                }
                if matched {
                    continue;
                }
            }

            // Try to match `keyword varname: TYPE = value` pattern (with TS type annotation).
            // Strip the TypeScript type annotation and treat as `keyword varname = value`.
            let pattern_with_type = format!("{} {} : ", keyword, var);
            let pattern_with_type_no_space = format!("{} {}: ", keyword, var);
            for pat in [&pattern_with_type, &pattern_with_type_no_space] {
                if matched {
                    break;
                }
                if let Some(pos) = result.find(pat.as_str()) {
                    // Find the `=` that ends the type annotation, respecting nested braces/brackets.
                    let type_start = pos + pat.len();
                    let mut depth = 0i32;
                    let mut eq_pos: Option<usize> = None;
                    let mut iter = result[type_start..].char_indices().peekable();
                    while let Some((j, c)) = iter.next() {
                        match c {
                            '{' | '[' | '(' | '<' => depth += 1,
                            '}' | ']' | ')' | '>' => depth -= 1,
                            '=' if depth == 0 => {
                                // Make sure it's not `==` or `=>`
                                let next = iter.peek().map(|&(_, ch)| ch);
                                if !matches!(next, Some('=') | Some('>')) {
                                    eq_pos = Some(j);
                                    break;
                                }
                            }
                            ';' | '\n' if depth == 0 => break,
                            _ => {}
                        }
                    }
                    if let Some(eq) = eq_pos {
                        let after_eq = type_start + eq + 1;
                        // Skip whitespace (incl. newlines) between `=` and the
                        // initializer. `find_statement_end_client` treats a
                        // leading newline as an ASI statement end, so a declaration
                        // whose init starts on the NEXT line (`let x: T =\n  init`)
                        // would otherwise extract an empty expr and orphan the init
                        // as a dangling statement.
                        let after_raw = &result[after_eq..];
                        let ws = after_raw.len() - after_raw.trim_start().len();
                        let after = &after_raw[ws..];
                        let expr_end = find_statement_end_client(after);
                        let expr = after[..expr_end].trim().trim_end_matches(';').trim();
                        let call = if immutable {
                            format!(
                                "$.mutable_source({}{}, true)",
                                expr,
                                break_after_line_comment(expr)
                            )
                        } else {
                            format!(
                                "$.mutable_source({}{})",
                                expr,
                                break_after_line_comment(expr)
                            )
                        };
                        let replacement = format!(
                            "{} {} = {}",
                            keyword,
                            var,
                            tag_legacy_source(call, var, dev)
                        );
                        result = Cow::Owned(format!(
                            "{}{}{}",
                            &result[..pos],
                            replacement,
                            &result[after_eq + ws + expr_end..]
                        ));
                        matched = true;
                        break;
                    }
                }
            }
            if matched {
                continue;
            }

            // Then, try to match `keyword varname;` pattern (declaration without initializer)
            let pattern_no_init = format!("{} {};", keyword, var);
            {
                let mut search_offset = 0;
                while let Some(rel_pos) = result[search_offset..].find(&pattern_no_init) {
                    let pos = search_offset + rel_pos;

                    // Check if this declaration is inside a for-loop header
                    let chars: Vec<char> = result.chars().collect();
                    let char_pos = byte_pos_to_char_index(&result, pos + keyword.len() + 1);
                    if is_shadowed_by_for_loop_var(&chars, char_pos, var) {
                        search_offset = pos + pattern_no_init.len();
                        continue;
                    }

                    // Build the replacement - no initial value, so pass nothing to $.mutable_source()
                    // (upstream emits `void 0`, not the `undefined` identifier).
                    let call = if immutable {
                        "$.mutable_source(void 0, true)".to_string()
                    } else {
                        "$.mutable_source()".to_string()
                    };
                    let replacement = format!(
                        "{} {} = {};",
                        keyword,
                        var,
                        tag_legacy_source(call, var, dev)
                    );

                    // Replace the declaration
                    result = Cow::Owned(format!(
                        "{}{}{}",
                        &result[..pos],
                        replacement,
                        &result[pos + pattern_no_init.len()..]
                    ));
                    matched = true;
                    break;
                }
                if matched {
                    continue;
                }
            }

            // Also try to match `keyword varname` without semicolon
            let pattern_no_semi = format!("{} {}", keyword, var);
            {
                let mut search_offset = 0;
                while let Some(rel_pos) = result[search_offset..].find(&pattern_no_semi) {
                    let pos = search_offset + rel_pos;
                    let after_pos = pos + pattern_no_semi.len();
                    let is_end = after_pos >= result.len()
                        || result[after_pos..]
                            .starts_with(|c: char| c.is_whitespace() || c == '\n' || c == '\r');
                    if !is_end {
                        search_offset = pos + pattern_no_semi.len();
                        continue;
                    }

                    // Check if this declaration is inside a for-loop header
                    let chars: Vec<char> = result.chars().collect();
                    let char_pos = byte_pos_to_char_index(&result, pos + keyword.len() + 1);
                    if is_shadowed_by_for_loop_var(&chars, char_pos, var) {
                        search_offset = pos + pattern_no_semi.len();
                        continue;
                    }

                    if after_pos < result.len()
                        && result[after_pos..]
                            .trim_start()
                            .starts_with("= $.mutable_source(")
                    {
                        matched = true;
                        break;
                    }
                    // Check if there's an `=` after whitespace (initializer present
                    // but pattern_with_init didn't match, e.g. due to extra spaces
                    // left by TypeScript annotation stripping: `var x  = value`).
                    // Handle this as an initializer case rather than producing the
                    // invalid `var x = $.mutable_source() = value`.
                    let rest_after = &result[after_pos..];
                    let trimmed_rest = rest_after.trim_start();
                    if trimmed_rest.starts_with('=')
                        && !trimmed_rest.starts_with("==")
                        && !trimmed_rest.starts_with("=>")
                    {
                        // Find where the `=` character is in `rest_after`
                        let eq_offset = rest_after.len() - trimmed_rest.len();
                        let after_eq = after_pos + eq_offset + 1;
                        let after = &result[after_eq..];
                        let expr_end = find_statement_end_client(after);
                        let expr = after[..expr_end].trim().trim_end_matches(';').trim();
                        let call = if immutable {
                            format!(
                                "$.mutable_source({}{}, true)",
                                expr,
                                break_after_line_comment(expr)
                            )
                        } else {
                            format!(
                                "$.mutable_source({}{})",
                                expr,
                                break_after_line_comment(expr)
                            )
                        };
                        let replacement = format!(
                            "{} {} = {}",
                            keyword,
                            var,
                            tag_legacy_source(call, var, dev)
                        );
                        result = Cow::Owned(format!(
                            "{}{}{}",
                            &result[..pos],
                            replacement,
                            &result[after_eq + expr_end..]
                        ));
                        matched = true;
                        break;
                    }
                    let call = if immutable {
                        "$.mutable_source(void 0, true)".to_string()
                    } else {
                        "$.mutable_source()".to_string()
                    };
                    let replacement = format!(
                        "{} {} = {}",
                        keyword,
                        var,
                        tag_legacy_source(call, var, dev)
                    );
                    result = Cow::Owned(format!(
                        "{}{}{}",
                        &result[..pos],
                        replacement,
                        &result[after_pos..]
                    ));
                    matched = true;
                    break;
                }
            }
        }
    }

    result
}

#[cfg(test)]
mod scan_lexing_tests {
    use super::{split_multi_declarator, transform_legacy_destructure_declarations};

    #[test]
    fn comma_in_a_comment_does_not_split_declarators() {
        assert_eq!(split_multi_declarator("let a = 1 /* , */ + 2;"), None);
    }

    #[test]
    fn non_ascii_identifier_in_a_destructure_pattern_does_not_panic() {
        // The pattern scan enumerated chars but sliced by bytes.
        let out = transform_legacy_destructure_declarations(
            "let { ああ } = obj;",
            &["ああ".to_string()],
            false,
            false,
        );
        assert!(out.contains("ああ"), "got: {out}");
    }

    #[test]
    fn brace_in_a_comment_does_not_end_a_destructure_pattern() {
        let out = transform_legacy_destructure_declarations(
            "let { a = 1 /* } */ } = obj;",
            &["a".to_string()],
            false,
            false,
        );
        assert!(out.contains("$.mutable_source("), "got: {out}");
    }
}

#[cfg(test)]
mod non_ascii_tests {
    use super::transform_legacy_state_declarations;
    use crate::compiler::phases::phase2_analyze::scope::DeclarationKind;

    #[test]
    fn transform_legacy_state_declarations_handles_non_ascii_type() {
        // `let x: Café = 0` — the `=` sits past a multi-byte char in the type
        // annotation; slicing must use byte offsets (no panic).
        let vars = vec![("x".to_string(), None, DeclarationKind::Let)];
        let out = transform_legacy_state_declarations("let x: Café = 0", &vars, false, false);
        assert!(out.contains("$.mutable_source(0)"), "got: {out}");
    }
}

#[cfg(test)]
mod prefilter_tests {
    use super::*;

    #[test]
    fn transform_legacy_state_declarations_leaves_an_absent_name_alone() {
        // The scan that rules a variable out has to agree with the four
        // `"<keyword> <var>…"` patterns it stands in for.
        let vars = vec![
            ("absent".to_string(), None, DeclarationKind::Let),
            ("x".to_string(), None, DeclarationKind::Let),
        ];
        let out = transform_legacy_state_declarations("let x = 1;", &vars, false, false);
        assert_eq!(out, "let x = $.mutable_source(1);");
        let untouched = transform_legacy_state_declarations("foo();", &vars, false, false);
        assert_eq!(untouched, "foo();");
    }
}
