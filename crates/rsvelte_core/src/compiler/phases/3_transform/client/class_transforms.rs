//! Class field transformations for $state and $derived runes.

use memchr::memmem;
use std::fmt::Write as _;

use super::REGEX_INVALID_IDENTIFIER_CHARS;
use super::expression_needs_proxy;
use crate::compiler::phases::phase1_parse::utils::find_matching_bracket;

/// JS-lexical-aware replacement for `find_matching_paren`: given `s` positioned
/// just after an opening `(`, return the byte offset of the matching `)`,
/// skipping `)` inside strings / template literals / regex / comments (H-058).
fn find_matching_paren_lexical(s: &str) -> Option<usize> {
    find_matching_bracket(s, 0, '(')
}

/// Given `s` positioned just after an opening `<` in a TypeScript generic type
/// parameter list, return the byte offset of the matching `>`, respecting nested
/// angle-bracket pairs and string literals.  Used to skip past `$state<T>(`
/// to the actual call-argument `(`.
fn find_matching_bracket_angle(s: &str) -> Option<usize> {
    let bytes = s.as_bytes();
    let mut depth: i32 = 1;
    let mut i = 0;
    while i < bytes.len() {
        match bytes[i] {
            b'\'' | b'"' | b'`' => {
                let quote = bytes[i];
                i += 1;
                while i < bytes.len() {
                    match bytes[i] {
                        b'\\' => i += 2,
                        b if b == quote => {
                            i += 1;
                            break;
                        }
                        _ => i += 1,
                    }
                }
                continue;
            }
            b'<' => depth += 1,
            b'>' => {
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

/// Replace every occurrence of `needle` in `haystack` with `replacement`, but
/// only when `needle` is not immediately followed by a JS identifier character.
///
/// The class transforms wrap private-field reads by string-replacing
/// `this.#name` with `$.get(this.#name)`. A bare `str::replace` matches a
/// field name that is a *prefix* of a longer sibling — e.g. wrapping `#fps`
/// corrupts `this.#fpsLimitOption` into `$.get(this.#fps)LimitOption` (issue
/// #907). Anchoring on a trailing word boundary fixes that; `this.` already
/// anchors the left edge, so only the right edge needs checking.
fn replace_field_ref_word_boundary(haystack: &str, needle: &str, replacement: &str) -> String {
    if needle.is_empty() || !haystack.contains(needle) {
        return haystack.to_string();
    }
    let bytes = haystack.as_bytes();
    let mut out = String::with_capacity(haystack.len());
    let mut i = 0;
    while i < haystack.len() {
        if haystack[i..].starts_with(needle) {
            let after = i + needle.len();
            let next_is_ident = bytes
                .get(after)
                .is_some_and(|&b| b.is_ascii_alphanumeric() || b == b'_' || b == b'$');
            if !next_is_ident {
                out.push_str(replacement);
                i = after;
                continue;
            }
        }
        let ch_len = haystack[i..].chars().next().unwrap().len_utf8();
        out.push_str(&haystack[i..i + ch_len]);
        i += ch_len;
    }
    out
}

/// Net change in bracket nesting (`()`, `[]`, `{}`) contributed by one source
/// line, skipping brackets inside string / template literals and `//` / `/*`
/// comments. Used to group physical lines into complete statements before the
/// line-based constructor transform runs, so a multi-line RHS such as
/// `this.#rect = {\n  x: 0,\n  …\n}` is transformed as one unit instead of the
/// broken first-line fragment `this.#rect = {` (issue #907).
fn net_bracket_depth(line: &str) -> i32 {
    let bytes = line.as_bytes();
    let mut depth = 0i32;
    let mut i = 0;
    while i < bytes.len() {
        match bytes[i] {
            b'\'' | b'"' | b'`' => {
                let quote = bytes[i];
                i += 1;
                while i < bytes.len() {
                    match bytes[i] {
                        b'\\' => i += 2,
                        b if b == quote => {
                            i += 1;
                            break;
                        }
                        _ => i += 1,
                    }
                }
                continue;
            }
            b'/' if bytes.get(i + 1) == Some(&b'/') => break, // rest of line is a comment
            b'/' if bytes.get(i + 1) == Some(&b'*') => {
                i += 2;
                while i + 1 < bytes.len() && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                    i += 1;
                }
                i = (i + 2).min(bytes.len());
                continue;
            }
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => depth -= 1,
            _ => {}
        }
        i += 1;
    }
    depth
}

/// Does `line` start a multi-line *assignment* — an assignment operator at
/// bracket depth 0 followed by a right-hand side whose brackets are left open,
/// e.g. `this.#rect = {`? Only such lines should absorb the following lines in
/// the constructor transform.
///
/// A `$effect(() => {` / `if (cond) {` block must NOT be grouped: it has no
/// top-level `=` (the `=>` lives inside `(...)`), so it stays line-by-line and
/// the `this.#x = …` statements *inside* the block are still rewritten. Grouping
/// them was the #907 regression on `class-state-constructor-closure`.
fn is_multiline_assignment_start(line: &str) -> bool {
    if net_bracket_depth(line) <= 0 {
        return false;
    }
    let bytes = line.as_bytes();
    let mut depth = 0i32;
    let mut i = 0;
    while i < bytes.len() {
        match bytes[i] {
            b'\'' | b'"' | b'`' => {
                let quote = bytes[i];
                i += 1;
                while i < bytes.len() {
                    match bytes[i] {
                        b'\\' => i += 2,
                        b if b == quote => {
                            i += 1;
                            break;
                        }
                        _ => i += 1,
                    }
                }
                continue;
            }
            b'/' if bytes.get(i + 1) == Some(&b'/') => break,
            b'/' if bytes.get(i + 1) == Some(&b'*') => {
                i += 2;
                while i + 1 < bytes.len() && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                    i += 1;
                }
                i = (i + 2).min(bytes.len());
                continue;
            }
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => depth -= 1,
            b'=' if depth == 0 => {
                let next = bytes.get(i + 1).copied();
                let prev = if i > 0 {
                    bytes.get(i - 1).copied()
                } else {
                    None
                };
                // A plain or compound (`+=`, `-=`, …) assignment `=`, not the
                // `==`/`===`/`=>` operators nor the tail of `==`/`!=`/`<=`/`>=`.
                if next != Some(b'=')
                    && next != Some(b'>')
                    && !matches!(prev, Some(b'=') | Some(b'!') | Some(b'<') | Some(b'>'))
                {
                    return true;
                }
            }
            _ => {}
        }
        i += 1;
    }
    false
}

/// Split a right-hand-side fragment at its first top-level `;`, returning
/// `(value, trailing)` where `value` is the assignment expression (trimmed)
/// and `trailing` is the remainder starting at the `;` (the statement
/// terminator plus any trailing comment).
///
/// The line-based class transforms receive a single physical source line,
/// which can carry a statement terminator and a trailing comment after the
/// expression — e.g. `getter(); // set the initial value`. Naively trimming a
/// trailing `;` (`.trim_end_matches(';')`) leaves the inner `;` and the
/// comment glued onto the value, so `$.set(this.#x, <value>, true)` becomes the
/// syntactically-broken `$.set(this.#x, getter(); // comment, true)` (issue
/// #907). Scanning for the first top-level `;` — skipping brackets, strings,
/// template literals and comments — extracts just `getter()` and preserves the
/// `; // comment` tail so it can be re-appended after the rewritten statement.
fn split_rhs_at_top_level_semi(s: &str) -> (&str, &str) {
    let bytes = s.as_bytes();
    let mut depth = 0i32;
    let mut i = 0;
    while i < bytes.len() {
        match bytes[i] {
            b'\'' | b'"' | b'`' => {
                // Skip the string/template literal body (handles escapes).
                let quote = bytes[i];
                i += 1;
                while i < bytes.len() {
                    match bytes[i] {
                        b'\\' => i += 2,
                        b if b == quote => {
                            i += 1;
                            break;
                        }
                        _ => i += 1,
                    }
                }
                continue;
            }
            b'/' if bytes.get(i + 1) == Some(&b'/') => break, // line comment → tail
            b'/' if bytes.get(i + 1) == Some(&b'*') => {
                i += 2;
                while i + 1 < bytes.len() && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                    i += 1;
                }
                i = (i + 2).min(bytes.len());
                continue;
            }
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => depth -= 1,
            b';' if depth == 0 => return (s[..i].trim(), &s[i..]),
            _ => {}
        }
        i += 1;
    }
    // No top-level `;` (and no preceding line comment) — the whole fragment is
    // the value. If we stopped at a line comment, split there so the comment
    // stays in the trailing slice.
    if i < bytes.len() && bytes[i] == b'/' {
        (s[..i].trim_end().trim_end_matches(';').trim(), &s[i..])
    } else {
        (s.trim().trim_end_matches(';').trim(), "")
    }
}

/// Represents a class field with $state or $derived rune.
#[derive(Debug, Clone)]
pub(super) struct ClassStateField {
    /// Field name (without # prefix)
    pub(super) name: String,
    /// Whether this is a private field (starts with #)
    pub(super) is_private: bool,
    /// The rune type: "$state" or "$derived"
    pub(super) rune_type: String,
    /// The initial value/expression
    pub(super) value: String,
    /// The deconflicted private backing field name (without # prefix)
    /// For private fields, this is the same as name.
    /// For public fields, this may have _ prefix if it conflicts with existing private fields.
    pub(super) private_backing_name: String,
    /// Whether this field was declared in the constructor
    pub(super) constructor_declared: bool,
    /// A constructor-assigned (`constructor_declared`) field that ALSO has a
    /// plain class-body declaration (`#x;` written out as a member). Upstream
    /// keeps that declaration at its source position; we therefore must NOT
    /// relocate it to a synthesized backing field emitted just before the
    /// constructor. Only meaningful for PRIVATE fields (a private backing is
    /// just the bare `#x;` declaration — identical to the kept member — with no
    /// accessor). Defaults to `false`.
    pub(super) had_class_body_decl: bool,
    /// An inline trailing comment (e.g. `// TODO …`) that preceded this field
    /// on its own line in the source.  When present, it is appended after the
    /// private backing field declaration instead of being emitted as a
    /// separate comment member — matching the official Svelte compiler's
    /// behaviour of attaching leading comments to the field line.
    pub(super) trailing_comment: Option<String>,
}

/// Emit a transformed class field definition with optional getter/setter.
pub(super) fn emit_class_field(field: &ClassStateField, all_fields: &[ClassStateField]) -> String {
    let mut output = String::new();
    let private_name = format!("#{}", field.private_backing_name);

    // When a `//` comment preceded this field on its own line in the source,
    // mirror the official Svelte compiler's esrap-based output: the comment is
    // emitted as a leading comment on the value node, so it appears between
    // the `=` and the RHS on a line of its own, e.g.:
    //   #creating = // TODO this stuff should all be readonly
    //   $.state(null);
    // We implement this by inserting the comment text followed by a newline
    // and the field-body indentation before the value expression.
    let comment_infix: String = field
        .trailing_comment
        .as_deref()
        .map(|c| format!("{}\n\t", c))
        .unwrap_or_default();

    if field.constructor_declared {
        let _ = writeln!(output, "\t\t{};", private_name);
        if !field.is_private {
            let is_derived = field.rune_type == "$derived" || field.rune_type == "$derived.by";
            let is_raw = field.rune_type == "$state.raw" || field.rune_type == "$state.frozen";
            output.push('\n');
            let _ = writeln!(
                output,
                "\t\tget {}() {{\n\t\t\treturn $.get(this.{});\n\t\t}}",
                field.name, private_name
            );
            output.push('\n');
            if is_derived || is_raw {
                let _ = writeln!(
                    output,
                    "\t\tset {}(value) {{\n\t\t\t$.set(this.{}, value);\n\t\t}}",
                    field.name, private_name
                );
            } else {
                let _ = writeln!(
                    output,
                    "\t\tset {}(value) {{\n\t\t\t$.set(this.{}, value, true);\n\t\t}}",
                    field.name, private_name
                );
            }
        }
    } else if field.rune_type == "$state" {
        let value_trimmed = field.value.trim();
        let needs_proxy = !value_trimmed.is_empty() && expression_needs_proxy(value_trimmed);
        let wrapped_value = if needs_proxy {
            format!("$.proxy({})", field.value)
        } else {
            field.value.clone()
        };
        let _ = writeln!(
            output,
            "\t\t{} = {}$.state({});",
            private_name, comment_infix, wrapped_value
        );
        if !field.is_private {
            let getter_name = format_getter_name(&field.name);
            output.push('\n');
            let _ = writeln!(
                output,
                "\t\tget {}() {{\n\t\t\treturn $.get(this.{});\n\t\t}}",
                getter_name, private_name
            );
            output.push('\n');
            let _ = writeln!(
                output,
                "\t\tset {}(value) {{\n\t\t\t$.set(this.{}, value, true);\n\t\t}}",
                getter_name, private_name
            );
        }
    } else if field.rune_type == "$state.raw" || field.rune_type == "$state.frozen" {
        let _ = writeln!(
            output,
            "\t\t{} = {}$.state({});",
            private_name, comment_infix, field.value
        );
        if !field.is_private {
            let getter_name = format_getter_name(&field.name);
            output.push('\n');
            let _ = writeln!(
                output,
                "\t\tget {}() {{\n\t\t\treturn $.get(this.{});\n\t\t}}",
                getter_name, private_name
            );
            output.push('\n');
            let _ = writeln!(
                output,
                "\t\tset {}(value) {{\n\t\t\t$.set(this.{}, value);\n\t\t}}",
                getter_name, private_name
            );
        }
    } else if field.rune_type == "$derived" {
        // Transform private field accesses inside the derived expression
        let mut derived_expr = field.value.clone();
        for f in all_fields {
            if f.is_private {
                let private_ref = format!("this.#{}", f.private_backing_name);
                let getter = format!("$.get(this.#{})", f.private_backing_name);
                derived_expr =
                    replace_field_ref_word_boundary(&derived_expr, &private_ref, &getter);
            }
        }
        let wrapped_value = if derived_expr.trim_start().starts_with('{') {
            format!("() => ({})", derived_expr)
        } else {
            format!("() => {}", derived_expr)
        };
        let _ = writeln!(
            output,
            "\t\t{} = {}$.derived({});",
            private_name, comment_infix, wrapped_value
        );
        if !field.is_private {
            let getter_name = format_getter_name(&field.name);
            output.push('\n');
            let _ = writeln!(
                output,
                "\t\tget {}() {{\n\t\t\treturn $.get(this.{});\n\t\t}}",
                getter_name, private_name
            );
            output.push('\n');
            let _ = writeln!(
                output,
                "\t\tset {}(value) {{\n\t\t\t$.set(this.{}, value);\n\t\t}}",
                getter_name, private_name
            );
        }
    } else if field.rune_type == "$derived.by" {
        // Use the assignment-aware method transformer (not a blind read-replace):
        // a `$derived.by(() => …)` body can contain nested WRITES to private state
        // fields (`() => { … this.#x = v … }`), which must lower to
        // `$.set(this.#x, v)`, not the invalid `$.get(this.#x) = v`. It also wraps
        // the remaining reads in `$.get(...)` with correct LHS/update guards.
        let derived_expr = transform_class_methods(&field.value, all_fields);
        let _ = writeln!(
            output,
            "\t\t{} = {}$.derived({});",
            private_name, comment_infix, derived_expr
        );
        if !field.is_private {
            let getter_name = format_getter_name(&field.name);
            output.push('\n');
            let _ = writeln!(
                output,
                "\t\tget {}() {{\n\t\t\treturn $.get(this.{});\n\t\t}}",
                getter_name, private_name
            );
            output.push('\n');
            let _ = writeln!(
                output,
                "\t\tset {}(value) {{\n\t\t\t$.set(this.{}, value);\n\t\t}}",
                getter_name, private_name
            );
        }
    }

    output
}

/// Extract a private identifier name from a line that may have a keyword prefix.
pub(super) fn extract_private_id_from_line(trimmed: &str) -> Option<String> {
    if let Some(rest) = trimmed.strip_prefix('#') {
        if let Some(end) = rest.find(['=', ';', '(', ' ']) {
            let name = rest[..end].trim();
            if !name.is_empty() {
                return Some(name.to_string());
            }
        }
        return None;
    }
    let prefixes = ["async ", "get ", "set ", "static ", "* "];
    for prefix in &prefixes {
        if let Some(rest) = trimmed.strip_prefix(prefix) {
            let rest = rest.trim_start();
            if let Some(rest) = rest.strip_prefix('#')
                && let Some(end) = rest.find(['=', ';', '(', ' '])
            {
                let name = rest[..end].trim();
                if !name.is_empty() {
                    return Some(name.to_string());
                }
            }
        }
    }
    if let Some(rest) = trimmed.strip_prefix("async") {
        let rest = rest.trim_start();
        if let Some(rest) = rest.strip_prefix('*') {
            let rest = rest.trim_start();
            if let Some(rest) = rest.strip_prefix('#')
                && let Some(end) = rest.find(['=', ';', '(', ' '])
            {
                let name = rest[..end].trim();
                if !name.is_empty() {
                    return Some(name.to_string());
                }
            }
        }
    }
    None
}

/// Transform private field reads in constructor body.
pub(super) fn transform_constructor_private_reads(
    content: &str,
    fields: &[ClassStateField],
) -> String {
    // AST-based fast path: split eligibility by rune type since the
    // output shape differs.
    //   - $state / $state.raw / $state.frozen → append `.v`
    //     (private_v_suffix_ast)
    //   - $derived / $derived.by → wrap with `$.get(...)`
    //     (private_read_wrap_ast, shared with PR #206)
    {
        let mut state_qualified: Vec<String> = Vec::new();
        let mut derived_qualified: Vec<String> = Vec::new();
        for field in fields {
            if !field.is_private {
                continue;
            }
            let qualified = format!("this.#{}", field.private_backing_name);
            match field.rune_type.as_str() {
                "$state" | "$state.raw" | "$state.frozen" => state_qualified.push(qualified),
                "$derived" | "$derived.by" => derived_qualified.push(qualified),
                _ => {}
            }
        }

        let mut current = content.to_string();
        let mut any_changed = false;

        if !state_qualified.is_empty()
            && let Some(out) = super::private_v_suffix_ast::transform_private_v_suffix_ast(
                &current,
                &state_qualified,
            )
        {
            current = out;
            any_changed = true;
        }

        for qualified in &derived_qualified {
            if let Some(out) =
                super::private_read_wrap_ast::transform_private_read_wrap_ast(&current, qualified)
            {
                current = out;
                any_changed = true;
            }
        }

        if any_changed {
            return current;
        }
    }

    let mut result = content.to_string();

    for field in fields {
        if !field.is_private {
            continue;
        }

        let private_ref = format!("this.#{}", field.private_backing_name);

        if field.rune_type == "$state"
            || field.rune_type == "$state.raw"
            || field.rune_type == "$state.frozen"
        {
            let mut search_from = 0;
            let mut new_result = String::new();
            let mut last_end = 0;

            while let Some(pos) = result[search_from..].find(&private_ref) {
                let abs_pos = search_from + pos;
                let after_pos = abs_pos + private_ref.len();

                let before = &result[..abs_pos];
                if before.ends_with("$.set(")
                    || before.ends_with("$.get(")
                    || before.ends_with("$.state(")
                    || before.ends_with("$.update(")
                    || before.ends_with("$.update_pre(")
                {
                    search_from = after_pos;
                    continue;
                }

                let next_char = if after_pos < result.len() {
                    Some(result.as_bytes()[after_pos] as char)
                } else {
                    None
                };

                match next_char {
                    Some(' ')
                        if after_pos + 1 < result.len()
                            && result.as_bytes()[after_pos + 1] == b'=' =>
                    {
                        if after_pos + 2 < result.len() && result.as_bytes()[after_pos + 2] == b'='
                        {
                            // == comparison -> use .v
                        } else {
                            search_from = after_pos;
                            continue;
                        }
                    }
                    Some('=') => {
                        if after_pos + 1 < result.len() && result.as_bytes()[after_pos + 1] == b'='
                        {
                            // == comparison -> use .v
                        } else {
                            search_from = after_pos;
                            continue;
                        }
                    }
                    Some('.') => {
                        search_from = after_pos;
                        continue;
                    }
                    Some(c) if c.is_alphanumeric() || c == '_' => {
                        search_from = after_pos;
                        continue;
                    }
                    _ => {}
                }

                new_result.push_str(&result[last_end..after_pos]);
                new_result.push_str(".v");
                last_end = after_pos;
                search_from = after_pos;
            }

            if last_end > 0 {
                new_result.push_str(&result[last_end..]);
                result = new_result;
            }
        } else if field.rune_type == "$derived" || field.rune_type == "$derived.by" {
            let mut search_from = 0;
            let mut new_result = String::new();
            let mut last_end = 0;

            while let Some(pos) = result[search_from..].find(&private_ref) {
                let abs_pos = search_from + pos;
                let after_pos = abs_pos + private_ref.len();

                let before = &result[..abs_pos];
                if before.ends_with("$.set(")
                    || before.ends_with("$.get(")
                    || before.ends_with("$.state(")
                    || before.ends_with("$.derived(")
                    || before.ends_with("$.update(")
                    || before.ends_with("$.update_pre(")
                {
                    search_from = after_pos;
                    continue;
                }

                let next_char = if after_pos < result.len() {
                    Some(result.as_bytes()[after_pos] as char)
                } else {
                    None
                };

                match next_char {
                    Some(' ')
                        if after_pos + 1 < result.len()
                            && result.as_bytes()[after_pos + 1] == b'=' =>
                    {
                        if after_pos + 2 < result.len() && result.as_bytes()[after_pos + 2] == b'='
                        {
                            // comparison
                        } else {
                            search_from = after_pos;
                            continue;
                        }
                    }
                    Some('=') => {
                        if after_pos + 1 < result.len() && result.as_bytes()[after_pos + 1] == b'='
                        {
                            // comparison
                        } else {
                            search_from = after_pos;
                            continue;
                        }
                    }
                    Some(c) if c.is_alphanumeric() || c == '_' => {
                        search_from = after_pos;
                        continue;
                    }
                    _ => {}
                }

                new_result.push_str(&result[last_end..abs_pos]);
                let _ = write!(new_result, "$.get({})", private_ref);
                last_end = after_pos;
                search_from = after_pos;
            }

            if last_end > 0 {
                new_result.push_str(&result[last_end..]);
                result = new_result;
            }
        }
    }

    result
}

/// Transform class fields with $state and $derived runes for client-side.
pub(crate) fn transform_class_fields_client(script: &str) -> String {
    // Check if script contains a class with $state or $derived fields
    if memmem::find(script.as_bytes(), b"class ").is_none()
        || (memmem::find(script.as_bytes(), b"$state").is_none()
            && memmem::find(script.as_bytes(), b"$derived").is_none())
    {
        return script.to_string();
    }

    // Find the class body
    let Some(class_pos) = memmem::find(script.as_bytes(), b"class ") else {
        return script.to_string();
    };

    // Find the opening brace of the class
    let after_class = &script[class_pos..];
    let Some(brace_pos) = after_class.find('{') else {
        return script.to_string();
    };

    let class_header = &after_class[..brace_pos + 1];

    // Find the matching closing brace with JS-lexical awareness so a `}` inside
    // a string / template / regex / comment (e.g. `return "}"`) doesn't truncate
    // the class body (H-057).
    let class_body_start = class_pos + brace_pos + 1;
    let class_body_end =
        find_matching_bracket(script, class_body_start, '{').unwrap_or(class_body_start);

    let class_body = &script[class_body_start..class_body_end];

    // Parse constructor info
    let mut constructor_content = String::new();
    let mut constructor_params = String::new();
    let mut constructor_start: Option<usize> = None;
    let mut constructor_end: Option<usize> = None;

    // Find constructor first
    if let Some(ctor_pos) = memmem::find(class_body.as_bytes(), b"constructor(") {
        let after_ctor = &class_body[ctor_pos..];
        // Extract constructor parameters
        let mut params_end_in_after: Option<usize> = None;
        if let Some(paren_start) = after_ctor.find('(') {
            let params_start = paren_start + 1;
            let params_end = find_matching_paren_lexical(&after_ctor[params_start..])
                .map(|rel| params_start + rel)
                .unwrap_or(params_start);
            constructor_params = after_ctor[params_start..params_end].to_string();
            params_end_in_after = Some(params_end);
        }

        // Scan for the body's `{` *after* the closing `)` of the param list,
        // not from the start of the signature. Otherwise a default-object
        // parameter like `constructor(options = {}) {` makes the scan latch
        // onto the `{` inside the default value, treating that empty `{}`
        // as the entire constructor body and mis-slicing the rest of the
        // class. Surfaced by layerchart's `states/settings.svelte.js` →
        // SSR output had an orphaned `) {` and rolldown rejected the file.
        let brace_search_start = params_end_in_after.map(|e| e + 1).unwrap_or(0);
        if let Some(brace_rel) = after_ctor[brace_search_start..].find('{') {
            let brace_pos_inner = brace_search_start + brace_rel;
            let ctor_body_start = ctor_pos + brace_pos_inner + 1;
            // JS-lexical-aware matching brace (H-057).
            let ctor_body_end =
                find_matching_bracket(class_body, ctor_body_start, '{').unwrap_or(ctor_body_start);

            constructor_start = Some(ctor_pos);
            constructor_content = class_body[ctor_body_start..ctor_body_end].to_string();
            constructor_end = Some(ctor_body_end + 1);
        }
    }

    // Collect existing private identifiers to avoid conflicts
    let mut existing_private_ids: Vec<String> = Vec::new();
    for line in class_body.lines() {
        let trimmed = line.trim();
        if let Some(name) = extract_private_id_from_line(trimmed)
            && !existing_private_ids.contains(&name)
        {
            existing_private_ids.push(name);
        }
    }

    // Parse the entire class body into ordered members.
    // Each member is either a rune field, a non-rune member block, or the constructor.
    #[derive(Debug)]
    enum ClassMember {
        RuneField(usize), // index into fields vec
        NonRune(String),  // raw text of the non-rune member(s)
        Constructor,      // placeholder for the constructor position
    }

    let mut fields: Vec<ClassStateField> = Vec::new();
    let mut members: Vec<ClassMember> = Vec::new();
    // Track non-rune lines that might be plain field declarations for constructor fields
    let mut non_rune_plain_field_names: Vec<(usize, String)> = Vec::new(); // (member_idx, field_name)

    // Split class body into before-constructor and after-constructor sections
    let before_ctor_section = if let Some(ctor_start) = constructor_start {
        &class_body[..ctor_start]
    } else {
        class_body
    };
    let after_ctor_section = if let Some(ctor_end) = constructor_end {
        &class_body[ctor_end..]
    } else {
        ""
    };

    // Parse members from a section of the class body (before or after constructor)
    // Returns ordered list of members and appends fields to the fields vec
    let parse_section_members =
        |section: &str,
         fields: &mut Vec<ClassStateField>,
         members: &mut Vec<ClassMember>,
         non_rune_plain_field_names: &mut Vec<(usize, String)>| {
            let section_lines: Vec<&str> = section.lines().collect();
            let mut si = 0;
            let mut pending_non_rune: Vec<String> = Vec::new();
            // Track brace depth so that lines inside method bodies (depth > 0)
            // are never mis-classified as standalone "plain field declarations".
            // Depth increases on `{` and decreases on `}` in the PENDING accumulator.
            let mut brace_depth: i32 = 0;

            while si < section_lines.len() {
                let line = section_lines[si];
                let trimmed = line.trim();
                if trimmed.is_empty() {
                    si += 1;
                    continue;
                }

                // Try to parse as a rune field
                let rune_types_list = [
                    ("$state.raw", true),
                    ("$state.frozen", true),
                    ("$state", false),
                    ("$derived.by", true),
                    ("$derived", false),
                ];

                let mut parsed_as_rune = false;
                for &(rune_type, _) in &rune_types_list {
                    let pattern_eq = format!("= {}(", rune_type);
                    let pattern_nospace = format!("={}(", rune_type);
                    // Also match TypeScript generic forms: `= $state<T>(` / `= $state.raw<T>(`
                    let pattern_eq_generic = format!("= {}<", rune_type);
                    let pattern_nospace_generic = format!("={}<", rune_type);
                    let has_pattern = trimmed.contains(&pattern_eq)
                        || trimmed.contains(&pattern_nospace)
                        || trimmed.contains(&pattern_eq_generic)
                        || trimmed.contains(&pattern_nospace_generic);
                    if !has_pattern {
                        continue;
                    }
                    if rune_type == "$state"
                        && (memmem::find(trimmed.as_bytes(), b"$state.raw(").is_some()
                            || memmem::find(trimmed.as_bytes(), b"$state.raw<").is_some()
                            || memmem::find(trimmed.as_bytes(), b"$state.frozen(").is_some()
                            || memmem::find(trimmed.as_bytes(), b"$state.frozen<").is_some())
                    {
                        continue;
                    }
                    if rune_type == "$derived"
                        && (memmem::find(trimmed.as_bytes(), b"$derived.by(").is_some()
                            || memmem::find(trimmed.as_bytes(), b"$derived.by<").is_some())
                    {
                        continue;
                    }

                    // Helper: extract a leading `//` comment from pending_non_rune
                    // and return it so it can be attached inline to the rune field,
                    // matching the official Svelte compiler's behaviour.
                    let take_leading_comment = |pending: &mut Vec<String>| -> Option<String> {
                        // If the last pending line is a `//` comment AND there are
                        // no non-comment lines after it, pop it and return it.
                        pending.pop_if(|last| last.trim().starts_with("//"))
                    };

                    // Try single-line parse
                    if let Some(mut field) = parse_state_field(trimmed, rune_type) {
                        let leading_comment = take_leading_comment(&mut pending_non_rune);
                        // Flush remaining pending non-rune lines
                        if !pending_non_rune.is_empty() {
                            let content = pending_non_rune.join("\n");
                            members.push(ClassMember::NonRune(content));
                            pending_non_rune.clear();
                        }
                        if let Some(comment) = leading_comment {
                            field.trailing_comment = Some(comment.trim().to_string());
                        }
                        let field_idx = fields.len();
                        fields.push(field);
                        members.push(ClassMember::RuneField(field_idx));
                        parsed_as_rune = true;
                        break;
                    }

                    // Multi-line parse
                    let mut accumulated = trimmed.to_string();
                    let mut j = si + 1;
                    while j < section_lines.len() {
                        accumulated.push('\n');
                        accumulated.push_str(section_lines[j].trim());
                        if let Some(mut field) = parse_state_field(&accumulated, rune_type) {
                            let leading_comment = take_leading_comment(&mut pending_non_rune);
                            // Flush remaining pending non-rune lines
                            if !pending_non_rune.is_empty() {
                                let content = pending_non_rune.join("\n");
                                members.push(ClassMember::NonRune(content));
                                pending_non_rune.clear();
                            }
                            if let Some(comment) = leading_comment {
                                field.trailing_comment = Some(comment.trim().to_string());
                            }
                            let field_idx = fields.len();
                            fields.push(field);
                            members.push(ClassMember::RuneField(field_idx));
                            parsed_as_rune = true;
                            si = j; // Skip accumulated lines
                            break;
                        }
                        j += 1;
                    }
                    if parsed_as_rune {
                        break;
                    }
                }

                if !parsed_as_rune {
                    // Track plain field declarations for later removal by constructor fields.
                    // Only treat as a plain field when we are at the top class-body depth
                    // (brace_depth == 0).  Lines inside method bodies / block statements
                    // (depth > 0) are never standalone declarations — they must stay
                    // in pending_non_rune to keep method bodies intact.
                    let field_trimmed = trimmed.trim_end_matches(';').trim();
                    let is_plain_field = brace_depth == 0
                        && !field_trimmed.contains('(')
                        && !field_trimmed.contains('{')
                        && !field_trimmed.starts_with("//")
                        && !field_trimmed.starts_with("/*");
                    if is_plain_field {
                        // Flush current pending + this line, remember its member index
                        if !pending_non_rune.is_empty() {
                            let content = pending_non_rune.join("\n");
                            members.push(ClassMember::NonRune(content));
                            pending_non_rune.clear();
                        }
                        let member_idx = members.len();
                        let name = field_trimmed.trim_start_matches('#').trim().to_string();
                        if !name.is_empty()
                            && name
                                .chars()
                                .next()
                                .is_some_and(|c| c.is_alphabetic() || c == '_' || c == '$')
                        {
                            non_rune_plain_field_names.push((member_idx, name));
                        }
                        members.push(ClassMember::NonRune(line.to_string()));
                    } else {
                        // Update brace depth for lines going into pending_non_rune.
                        for ch in trimmed.chars() {
                            match ch {
                                '{' => brace_depth += 1,
                                '}' => brace_depth = (brace_depth - 1).max(0),
                                _ => {}
                            }
                        }
                        pending_non_rune.push(line.to_string());
                    }
                }
                si += 1;
            }

            // Flush any remaining non-rune lines
            if !pending_non_rune.is_empty() {
                let content = pending_non_rune.join("\n");
                members.push(ClassMember::NonRune(content));
            }
        };

    // Parse before-constructor members
    parse_section_members(
        before_ctor_section,
        &mut fields,
        &mut members,
        &mut non_rune_plain_field_names,
    );

    // Add constructor marker
    if constructor_start.is_some() {
        members.push(ClassMember::Constructor);
    }

    // Parse after-constructor members
    parse_section_members(
        after_ctor_section,
        &mut fields,
        &mut members,
        &mut non_rune_plain_field_names,
    );

    // Scan constructor body for constructor-declared state/derived assignments
    if !constructor_content.is_empty() {
        for line in constructor_content.lines() {
            let trimmed = line.trim();
            if trimmed.is_empty() {
                continue;
            }
            if let Some(mut field) = parse_constructor_state_assignment(trimmed, &fields) {
                let field_name = field.name.clone();
                // Remove plain field declarations from members that match this constructor field
                let mut indices_to_remove: Vec<usize> = Vec::new();
                for &(member_idx, ref name) in &non_rune_plain_field_names {
                    if *name == field_name {
                        indices_to_remove.push(member_idx);
                    }
                }
                // Also check for # prefixed plain declarations
                for (mi, m) in members.iter().enumerate() {
                    if let ClassMember::NonRune(text) = m {
                        let t = text.trim().trim_end_matches(';').trim();
                        let t_no_hash = t.trim_start_matches('#').trim();
                        if t_no_hash == field_name && !indices_to_remove.contains(&mi) {
                            indices_to_remove.push(mi);
                        }
                    }
                }
                // Remove matching plain declarations (replace with empty NonRune)
                // Also remove preceding JSDoc/comment blocks.
                //
                // EXCEPTION: a PRIVATE field whose `#x;` declaration is already
                // written in the class body keeps that declaration at its source
                // position (upstream does not relocate it). A private backing IS
                // just the bare `#x;`, so removing it here and re-emitting it
                // before the constructor would both reorder and (re)synthesize it.
                // Mark the field and leave the member in place.
                for idx in &indices_to_remove {
                    if *idx < members.len() {
                        if field.is_private
                            && let ClassMember::NonRune(text) = &members[*idx]
                            && text.trim().trim_end_matches(';').trim().starts_with('#')
                        {
                            field.had_class_body_decl = true;
                            continue;
                        }
                        members[*idx] = ClassMember::NonRune(String::new());
                        // Remove preceding comment/JSDoc member if it exists
                        if *idx > 0
                            && let ClassMember::NonRune(prev_text) = &members[*idx - 1]
                        {
                            let prev_trimmed = prev_text.trim();
                            if prev_trimmed.starts_with("/*")
                                || prev_trimmed.starts_with("//")
                                || prev_trimmed.starts_with("/**")
                            {
                                members[*idx - 1] = ClassMember::NonRune(String::new());
                            }
                        }
                    }
                }
                fields.push(field);
            }
        }
    }

    if fields.is_empty() {
        // This class declares no `$state` / `$derived` fields. Preserve it
        // verbatim and keep scanning the rest of the script for rune classes
        // that follow it. Returning the whole script here would skip lowering
        // for every later class — e.g. a plain `Helper` before an
        // `export class Counter { count = $state(0) }`.
        let before_and_current = &script[..class_body_end + 1];
        let after_class_body = &script[class_body_end + 1..];
        return format!(
            "{}{}",
            before_and_current,
            transform_class_fields_client(after_class_body)
        );
    }

    // Deconflict private backing names for public fields
    for field in &mut fields {
        if !field.is_private {
            let mut deconflicted = field.private_backing_name.clone();
            while existing_private_ids.contains(&deconflicted) {
                deconflicted = format!("_{}", deconflicted);
            }
            existing_private_ids.push(deconflicted.clone());
            field.private_backing_name = deconflicted;
        }
    }

    // Wrap the ROOT of every private-`$state` member MUTATION in the constructor
    // (`this.#x.prop = v` → `$.get(this.#x).prop = v`) BEFORE the per-line text
    // transform runs. A mutation writes through the reactive proxy, so its base
    // must read the proxy via `$.get`, not the raw `.v` source the text member
    // branch would otherwise apply. This AST pass is precise (only real
    // assignment / update targets), and once a root is `$.get(this.#x)` the text
    // branch's `this.#x.` → `this.#x.v.` substitution no longer matches it.
    if !constructor_content.is_empty() {
        let state_qualified: Vec<String> = fields
            .iter()
            .filter(|f| f.is_private && f.rune_type == "$state")
            .map(|f| format!("this.#{}", f.private_backing_name))
            .collect();
        if let Some(rewritten) =
            super::private_member_mutate_root_ast::transform_private_member_mutate_root_ast(
                &constructor_content,
                &state_qualified,
            )
        {
            constructor_content = rewritten;
        }
    }

    // Build transformed class body preserving original member order
    let mut new_class_body = String::new();

    // 1. Emit constructor-declared PUBLIC fields at the top of the class
    // (with getter/setter). Private backing fields come later, just before the constructor.
    // This matches the official Svelte compiler output order.
    for field in &fields {
        if field.constructor_declared && !field.is_private {
            new_class_body.push_str(&emit_class_field(field, &fields));
        }
    }

    // 2. Emit members in original order
    for member in &members {
        match member {
            ClassMember::RuneField(field_idx) => {
                let field = &fields[*field_idx];
                new_class_body.push_str(&emit_class_field(field, &fields));
            }
            ClassMember::NonRune(text) => {
                if text.trim().is_empty() {
                    continue;
                }
                let transformed = transform_class_methods(text, &fields);
                for line in transformed.lines() {
                    new_class_body.push_str(line);
                    new_class_body.push('\n');
                }
            }
            ClassMember::Constructor => {
                // Emit constructor-declared private fields just before the constructor —
                // EXCEPT those that already have a class-body `#x;` declaration kept in
                // place (`had_class_body_decl`), which upstream leaves at its source
                // position rather than relocating here.
                for field in &fields {
                    if field.constructor_declared && field.is_private && !field.had_class_body_decl
                    {
                        new_class_body.push_str(&emit_class_field(field, &fields));
                    }
                }
                new_class_body.push('\n');
                let _ = writeln!(new_class_body, "\t\tconstructor({}) {{", constructor_params);

                let mut ctor_body = String::new();
                // Group physical lines into a single statement only when a line
                // opens a multi-line assignment RHS (e.g. `this.#rect = {\n…\n}`),
                // so it is rewritten as one unit instead of the broken fragment
                // `this.#rect = {` (issue #907). Every other line — including
                // block openers like `$effect(() => {` — is transformed
                // individually so the `this.#x = …` statements inside the block
                // are still rewritten.
                let mut pending = String::new();
                let mut depth: i32 = 0;
                for line in constructor_content.lines() {
                    let trimmed = line.trim();
                    if pending.is_empty() {
                        if trimmed.is_empty() {
                            continue;
                        }
                        if is_multiline_assignment_start(trimmed) {
                            pending.push_str(trimmed);
                            depth = net_bracket_depth(trimmed);
                        } else {
                            let transformed_line =
                                transform_constructor_assignment(trimmed, &fields);
                            let _ = writeln!(ctor_body, "\t\t\t{}", transformed_line);
                        }
                    } else {
                        pending.push('\n');
                        pending.push_str(trimmed);
                        depth += net_bracket_depth(trimmed);
                        if depth <= 0 {
                            let transformed_line =
                                transform_constructor_assignment(&pending, &fields);
                            let _ = writeln!(ctor_body, "\t\t\t{}", transformed_line);
                            pending.clear();
                            depth = 0;
                        }
                    }
                }
                if !pending.is_empty() {
                    let transformed_line = transform_constructor_assignment(&pending, &fields);
                    let _ = writeln!(ctor_body, "\t\t\t{}", transformed_line);
                }

                // AST-based pass for `this.#field = …` assignments NESTED inside a
                // grouped statement (e.g. `const rAF = requestAnimationFrame(() => {
                // this.#x = false; })`): the per-line `transform_constructor_assignment`
                // only rewrites a `this.#x = …` at the START of a (possibly grouped)
                // line, so a field write buried inside a callback body was left as a
                // raw assignment instead of `$.set(this.#x, …)`. The pass is idempotent
                // (a wrapped `$.set(…)` is a CallExpression, not an AssignmentExpression),
                // so the already-rewritten top-level writes are not touched.
                {
                    let mut state_qualified: Vec<String> = Vec::new();
                    let mut other_qualified: Vec<String> = Vec::new();
                    for field in &fields {
                        // Constructor-declared fields keep a `this.#x = $.state(…)`
                        // INITIALIZER in the body (handled above); AST-wrapping that
                        // assignment would wrongly produce `$.set(this.#x, $.state(…))`.
                        // Only class-body-declared fields have plain writes here.
                        if field.constructor_declared {
                            continue;
                        }
                        let qualified = format!("this.#{}", field.private_backing_name);
                        if field.rune_type == "$state" {
                            state_qualified.push(qualified);
                        } else if field.rune_type == "$state.raw"
                            || field.rune_type == "$state.frozen"
                        {
                            other_qualified.push(qualified);
                        }
                    }
                    if (!state_qualified.is_empty() || !other_qualified.is_empty())
                        && let Some(rewritten) =
                            super::private_class_assign_ast::transform_private_class_assign_ast(
                                &ctor_body,
                                &state_qualified,
                                &other_qualified,
                            )
                    {
                        ctor_body = rewritten;
                    }
                }

                let ctor_transformed = transform_class_methods_non_this(&ctor_body, &fields);
                let ctor_transformed =
                    transform_constructor_private_reads(&ctor_transformed, &fields);
                new_class_body.push_str(&ctor_transformed);

                new_class_body.push_str("\t\t}\n");
            }
        }
    }

    // Build the final result
    let before_class = &script[..class_pos];
    let after_class_body = &script[class_body_end + 1..]; // Skip closing brace

    // Recursively process remaining classes in the script
    let after_class_transformed = transform_class_fields_client(after_class_body);

    // Check if this is a `new class ...` expression that needs wrapping
    // `new class Foo { ... }` -> `new (class Foo { ... })()`
    let before_trimmed = before_class.trim_end();
    let is_new_class = before_trimmed.ends_with("new");

    if is_new_class {
        // Trim "new" from before_class and wrap the class in (...).
        let new_pos = memmem::rfind(before_class.as_bytes(), b"new").unwrap();
        let before_new = &before_class[..new_pos];
        // If the source already has a `(args)` after the class body, those are
        // the constructor arguments — keep them rather than injecting an extra
        // `()`, which would turn `new class {}(args)` into the (wrong)
        // `new (class {})()(args)` (H-059).
        if after_class_transformed.trim_start().starts_with('(') {
            format!(
                "{}new ({}\n{}\t}}){}",
                before_new, class_header, new_class_body, after_class_transformed
            )
        } else {
            format!(
                "{}new ({}\n{}\t}})(){}",
                before_new, class_header, new_class_body, after_class_transformed
            )
        }
    } else {
        format!(
            "{}{}\n{}\t}}{}",
            before_class, class_header, new_class_body, after_class_transformed
        )
    }
}

/// Sanitize a name to be a valid JavaScript identifier.
/// Replaces invalid identifier characters with underscores.
/// For example, "0" becomes "_", "1foo" becomes "_foo".
pub(super) fn sanitize_identifier(name: &str) -> String {
    REGEX_INVALID_IDENTIFIER_CHARS
        .replace_all(name, "_")
        .to_string()
}

/// Format a getter/setter name for class fields.
/// For names that are valid JS identifiers, returns the name as-is.
/// For names that need quoting (contain special chars like hyphens, or are string literals),
/// returns them in quotes. For numeric names, returns them unquoted.
pub(super) fn format_getter_name(name: &str) -> String {
    // If the name is already quoted (starts and ends with quotes), return as-is
    if (name.starts_with('"') && name.ends_with('"'))
        || (name.starts_with('\'') && name.ends_with('\''))
    {
        return name.to_string();
    }
    // If it's a valid identifier as-is, return it
    // Valid identifiers start with a letter, underscore, or $, followed by alphanumerics, _, or $
    if !name.is_empty() {
        let first = name.chars().next().unwrap();
        if (first.is_alphabetic() || first == '_' || first == '$')
            && name
                .chars()
                .all(|c| c.is_alphanumeric() || c == '_' || c == '$')
        {
            return name.to_string();
        }
    }
    // Numeric names are valid property names in JS without quoting
    if name.chars().all(|c| c.is_ascii_digit()) {
        return name.to_string();
    }
    // Otherwise, quote the name
    format!("\"{}\"", name)
}

/// Strip surrounding quotes from a field name if present.
/// For example, `"aria-pressed"` becomes `aria-pressed`.
pub(super) fn strip_field_quotes(name: &str) -> String {
    if (name.starts_with('"') && name.ends_with('"'))
        || (name.starts_with('\'') && name.ends_with('\''))
    {
        name[1..name.len() - 1].to_string()
    } else {
        name.to_string()
    }
}

/// Parse a state field definition.
/// `true` when `name` (the text we extracted as the left-hand side of `= $state(...)`)
/// is actually a valid class-field name shape: a plain identifier, a quoted
/// string key (`"foo-bar"` / `'foo-bar'`), or a computed key (`[expr]`).
/// Anything else — text carrying parens, braces, or whitespace, like the start
/// of a method body — is rejected. (issue #452, H-057)
fn is_valid_class_field_name(name: &str) -> bool {
    if name.is_empty() {
        return false;
    }
    let bytes = name.as_bytes();
    let first = bytes[0];
    let last = bytes[bytes.len() - 1];
    if (first == b'"' && last == b'"') || (first == b'\'' && last == b'\'') {
        return true;
    }
    if first == b'[' && last == b']' {
        return true;
    }
    !name
        .chars()
        .any(|c| c.is_whitespace() || matches!(c, '(' | ')' | '{' | '}' | ';' | ','))
}

pub(super) fn parse_state_field(line: &str, rune_type: &str) -> Option<ClassStateField> {
    let trimmed = line.trim().trim_end_matches(';');

    // Check if starts with # (private field)
    let is_private = trimmed.starts_with('#');

    // Find the field name
    let name_end = trimmed.find('=').or_else(|| trimmed.find(" ="))?;
    let name = trimmed[..name_end]
        .trim()
        .trim_start_matches('#')
        .to_string();

    // Reject text that is clearly not a class-field name. Without this guard a
    // method body like `m(){ let x = $state(0); return "}"; }` matches the rune
    // pattern and gets parsed as a field named `m(){ let x` — the sanitiser
    // would then emit `#m____let_x = $.state(0)` and a quoted accessor with the
    // same shape, corrupting the class. (issue #452, H-057)
    if !is_valid_class_field_name(&name) {
        return None;
    }

    // Find the rune call — handles both plain `$state(` and TypeScript-generic
    // forms `$state<T>(` / `$state.raw<A | B>(`.
    let rune_pattern = format!("{}(", rune_type);
    let rune_pattern_generic = format!("{}<", rune_type);
    let rune_start = trimmed
        .find(&rune_pattern)
        .or_else(|| trimmed.find(&rune_pattern_generic))?;
    // Skip past an optional `<…>` type-parameter list to reach the `(`.
    let after_rune = &trimmed[rune_start + rune_type.len()..];
    let value_start = if after_rune.starts_with('(') {
        // Plain form: `$state(`
        rune_start + rune_type.len() + 1
    } else if let Some(angle_inner) = after_rune.strip_prefix('<') {
        // Generic form: `$state<T>(` — find the matching `>` then expect `(`
        let angle_end = find_matching_bracket_angle(angle_inner)?;
        let after_angle = &after_rune[1 + angle_end + 1..]; // skip `<`, inner, `>`
        if !after_angle.starts_with('(') {
            return None;
        }
        rune_start + rune_type.len() + 1 + angle_end + 1 + 1 // `<` + inner + `>` + `(`
    } else {
        return None;
    };

    // Find matching closing paren
    let after_paren = &trimmed[value_start..];
    let value_end = find_matching_paren_lexical(after_paren)?;
    let value = after_paren[..value_end].to_string();

    // Strip quotes from name for private backing name generation
    // e.g., "aria-pressed" -> aria-pressed -> aria_pressed
    let unquoted_name = strip_field_quotes(&name);
    let private_backing_name = sanitize_identifier(&unquoted_name);

    Some(ClassStateField {
        name: name.clone(),
        is_private,
        rune_type: rune_type.to_string(),
        value,
        private_backing_name, // Sanitized to be a valid identifier
        constructor_declared: false,
        had_class_body_decl: false,
        trailing_comment: None,
    })
}

/// Parse a constructor state assignment like `this.name = $state(...)` or `this[n] = $state(...)`.
pub(super) fn parse_constructor_state_assignment(
    line: &str,
    existing_fields: &[ClassStateField],
) -> Option<ClassStateField> {
    let trimmed = line.trim().trim_end_matches(';');

    let (is_private, name) = if trimmed.starts_with("this.") {
        // Handle `this.name = $state(...)` or `this.#name = $state(...)`
        let eq_pos = memmem::find(trimmed.as_bytes(), b" = ")?;
        let field_part = &trimmed[5..eq_pos];
        let is_priv = field_part.starts_with('#');
        let n = field_part.trim_start_matches('#').to_string();
        (is_priv, n)
    } else if trimmed.starts_with("this[") {
        // Handle `this[n] = $state(...)` (bracket notation)
        let bracket_end = trimmed.find(']')?;
        let key = trimmed[5..bracket_end].trim();
        // For bracket notation, the key becomes a quoted property name in getter/setter
        // e.g., this[1] -> get '1'() { ... }
        let unquoted_key = if (key.starts_with('\'') && key.ends_with('\''))
            || (key.starts_with('"') && key.ends_with('"'))
        {
            key[1..key.len() - 1].to_string()
        } else {
            key.to_string()
        };
        // For getter/setter, wrap numeric keys in quotes
        let name = if unquoted_key.chars().all(|c| c.is_ascii_digit()) {
            format!("'{}'", unquoted_key)
        } else {
            unquoted_key
        };
        (false, name)
    } else {
        return None;
    };

    let eq_pos = memmem::find(trimmed.as_bytes(), b" = ")?;
    let rhs = trimmed[eq_pos + 3..].trim();

    let already_exists = existing_fields.iter().any(|f| f.name == name);
    if already_exists {
        return None;
    }
    let (rune_type, value) = if let Some(rest) = rhs.strip_prefix("$state.raw(") {
        let end = find_matching_paren_lexical(rest)?;
        ("$state.raw", rest[..end].to_string())
    } else if let Some(rest) = rhs.strip_prefix("$state.frozen(") {
        let end = find_matching_paren_lexical(rest)?;
        ("$state.frozen", rest[..end].to_string())
    } else if let Some(rest) = rhs.strip_prefix("$state(") {
        let end = find_matching_paren_lexical(rest)?;
        ("$state", rest[..end].to_string())
    } else if let Some(rest) = rhs.strip_prefix("$derived.by(") {
        let end = find_matching_paren_lexical(rest)?;
        ("$derived.by", rest[..end].to_string())
    } else {
        let rest = rhs.strip_prefix("$derived(")?;
        let end = find_matching_paren_lexical(rest)?;
        ("$derived", rest[..end].to_string())
    };
    // Strip quotes from name for private backing name generation
    // e.g., "'1'" -> "1" -> "_" (sanitized)
    let unquoted_name = strip_field_quotes(&name);
    let private_backing_name = sanitize_identifier(&unquoted_name);
    Some(ClassStateField {
        name,
        is_private,
        rune_type: rune_type.to_string(),
        value,
        private_backing_name,
        constructor_declared: true,
        had_class_body_decl: false,
        trailing_comment: None,
    })
}

/// Find all variable prefixes used with a private field in content.
/// For example, for field name "count", finds "this", "self", "instance" etc.
/// from patterns like `this.#count`, `self.#count`, `instance.#count`.
pub(super) fn find_private_field_prefixes(content: &str, field_name: &str) -> Vec<String> {
    let mut prefixes = Vec::new();
    let hash_pattern = format!(".#{}", field_name);

    let mut search_from = 0;
    while let Some(pos) = content[search_from..].find(&hash_pattern) {
        let abs_pos = search_from + pos;
        // Check the character after the field name to ensure it's a word boundary
        let after_pos = abs_pos + hash_pattern.len();
        if after_pos < content.len() {
            let next_char = content.as_bytes()[after_pos] as char;
            if next_char.is_alphanumeric() || next_char == '_' {
                search_from = abs_pos + 1;
                continue;
            }
        }

        // Walk backwards to find the identifier prefix
        if abs_pos > 0 {
            let before = &content[..abs_pos];
            let prefix_end = before.len();
            let mut prefix_start = prefix_end;
            for (i, c) in before.char_indices().rev() {
                if c.is_alphanumeric() || c == '_' || c == '$' {
                    prefix_start = i;
                } else {
                    break;
                }
            }
            if prefix_start < prefix_end {
                let prefix = &before[prefix_start..prefix_end];
                if !prefix.is_empty() && !prefixes.contains(&prefix.to_string()) {
                    prefixes.push(prefix.to_string());
                }
            }
        }
        search_from = abs_pos + 1;
    }

    // Always include "this" if not already present
    if !prefixes.contains(&"this".to_string()) {
        prefixes.push("this".to_string());
    }

    prefixes
}

/// Transform class methods to use $.get() for state field accesses.
///
/// For private state fields (those initialized with $state or $derived),
/// we need to wrap accesses with $.get() and mutations with $.set().
/// Handles any variable prefix (this, self, instance, etc.) not just `this`.
pub(super) fn transform_class_methods(content: &str, fields: &[ClassStateField]) -> String {
    if content.trim().is_empty() || fields.is_empty() {
        return content.to_string();
    }

    let mut result = content.to_string();

    // AST-based pre-pass: assignments + updates for ALL private-field
    // prefixes, with $state proxy-detection.
    {
        let mut state_qualified: Vec<String> = Vec::new();
        let mut other_qualified: Vec<String> = Vec::new();
        for field in fields {
            let prefixes = find_private_field_prefixes(&result, &field.private_backing_name);
            for prefix in &prefixes {
                let qualified = format!("{}.#{}", prefix, field.private_backing_name);
                if field.rune_type == "$state" {
                    state_qualified.push(qualified);
                } else {
                    other_qualified.push(qualified);
                }
            }
        }
        if let Some(rewritten) = super::private_class_assign_ast::transform_private_class_assign_ast(
            &result,
            &state_qualified,
            &other_qualified,
        ) {
            result = rewritten;
        }
    }

    // For each private field, find all prefixes and apply transforms
    for field in fields {
        let prefixes = find_private_field_prefixes(&result, &field.private_backing_name);

        for prefix in &prefixes {
            let qualified = format!("{}.#{}", prefix, field.private_backing_name);

            // First handle assignments (must be done before reads to avoid conflicts)

            // Handle compound assignment operators: +=, -=, *=, /=, %=, **=
            let compound_ops: &[(&str, &str)] = &[
                ("**=", "**"),
                ("+=", "+"),
                ("-=", "-"),
                ("*=", "*"),
                ("/=", "/"),
                ("%=", "%"),
            ];
            for (assign_op, binary_op) in compound_ops {
                let pattern = format!("{} {} ", qualified, assign_op);
                while let Some(pos) = result.find(&pattern) {
                    let value_start = pos + pattern.len();
                    let rest = &result[value_start..];
                    let value_end = rest.find(';').unwrap_or(rest.len());
                    let value = rest[..value_end].trim();
                    let needs_proxy = field.rune_type == "$state" && expression_needs_proxy(value);
                    let replacement = if needs_proxy {
                        format!(
                            "$.set({}, $.get({}) {} {}, true)",
                            qualified, qualified, binary_op, value
                        )
                    } else {
                        format!(
                            "$.set({}, $.get({}) {} {})",
                            qualified, qualified, binary_op, value
                        )
                    };
                    result = format!(
                        "{}{}{}",
                        &result[..pos],
                        replacement,
                        &result[value_start + value_end..]
                    );
                }
            }

            // Handle direct assignment: prefix.#name = value -> $.set(prefix.#name, value)
            let assign_pattern = format!("{} = ", qualified);
            while let Some(pos) = result.find(&assign_pattern) {
                // Check if already inside a $.set() or $.get() call
                let before = &result[..pos];
                if before.ends_with("$.set(") || before.ends_with("$.get(") {
                    break;
                }
                let value_start = pos + assign_pattern.len();
                let rest = &result[value_start..];
                let value_end = rest.find(';').unwrap_or(rest.len());
                let value = rest[..value_end].trim();
                let needs_proxy = field.rune_type == "$state" && expression_needs_proxy(value);
                let replacement = if needs_proxy {
                    format!("$.set({}, {}, true)", qualified, value)
                } else {
                    format!("$.set({}, {})", qualified, value)
                };
                result = format!(
                    "{}{}{}",
                    &result[..pos],
                    replacement,
                    &result[value_start + value_end..]
                );
            }

            // Handle increment: prefix.#name++ or ++prefix.#name
            let post_inc = format!("{}++", qualified);
            while result.contains(&post_inc) {
                let replacement = format!("$.update({})", qualified);
                result = result.replacen(&post_inc, &replacement, 1);
            }
            let pre_inc = format!("++{}", qualified);
            while result.contains(&pre_inc) {
                let replacement = format!("$.update_pre({})", qualified);
                result = result.replacen(&pre_inc, &replacement, 1);
            }

            // Handle decrement: prefix.#name-- or --prefix.#name
            let post_dec = format!("{}--", qualified);
            while result.contains(&post_dec) {
                let replacement = format!("$.update({}, -1)", qualified);
                result = result.replacen(&post_dec, &replacement, 1);
            }
            let pre_dec = format!("--{}", qualified);
            while result.contains(&pre_dec) {
                let replacement = format!("$.update_pre({}, -1)", qualified);
                result = result.replacen(&pre_dec, &replacement, 1);
            }

            // Now handle reads: property access, optional chaining, standalone reads

            // AST-based pre-pass for member-chain reads (`q.foo`, `q[i]`,
            // `q?.foo`). Idempotent vs the text replaces below: after
            // wrap, the `q.` bytes are `$.get(q).` so the text-replace
            // patterns find nothing new.
            if let Some(rewritten) =
                super::private_member_read_wrap_ast::transform_private_member_read_wrap_ast(
                    &result,
                    std::slice::from_ref(&qualified),
                )
            {
                result = rewritten;
            }

            // Replace property access patterns: prefix.#name. -> $.get(prefix.#name).
            let property_access_pattern = format!("{}.", qualified);
            let getter_wrapped = format!("$.get({}).", qualified);
            result = result.replace(&property_access_pattern, &getter_wrapped);

            // Replace optional chaining patterns: prefix.#name?. -> $.get(prefix.#name)?.
            let optional_access_pattern = format!("{}?.", qualified);
            let optional_getter_wrapped = format!("$.get({})?.?.", qualified);
            result = result.replace(&optional_access_pattern, &optional_getter_wrapped);

            // Wrap standalone reads of prefix.#name that aren't already wrapped
            // This handles: return prefix.#name; and other standalone uses
            result = wrap_standalone_private_reads(&result, &qualified);
        }
    }

    // Clean up any double wrapping that might have occurred
    if memmem::find(result.as_bytes(), b"$.get($.get(").is_some() {
        result = result.replace("$.get($.get(", "$.get(");
    }
    // Fix optional chaining that got double-wrapped
    if memmem::find(result.as_bytes(), b"?.?.").is_some() {
        result = result.replace("?.?.", "?.");
    }

    result
}

/// Wrap standalone reads of a qualified private field (e.g., `this.#count`)
/// with `$.get()`. Handles patterns like:
/// - `return this.#count;`
/// - `return this.#count`  (without semicolon)
/// - `... this.#count)` (in expressions)
/// - `this.#count,` (in argument lists)
/// - arrow function bodies: `() => this.#count + 1`
pub(super) fn wrap_standalone_private_reads(content: &str, qualified: &str) -> String {
    // AST-based fast path: walks PrivateFieldExpression nodes and
    // skips assignment LHS / update target / member-chain object /
    // $.get-family arg positions automatically. Falls back to the
    // text loop on parse failure.
    if let Some(out) =
        super::private_read_wrap_ast::transform_private_read_wrap_ast(content, qualified)
    {
        return out;
    }

    let mut result = content.to_string();

    // Find all occurrences of the qualified name that aren't already wrapped
    let mut search_from = 0;
    while let Some(pos) = result[search_from..].find(qualified) {
        let abs_pos = search_from + pos;
        let after_pos = abs_pos + qualified.len();

        // Check what comes after - if it's already handled (assignment, increment, property access)
        // or already inside $.get(), $.set(), $.update(), $.update_pre(), skip it
        let before = &result[..abs_pos];
        if before.ends_with("$.get(")
            || before.ends_with("$.set(")
            || before.ends_with("$.update(")
            || before.ends_with("$.update_pre(")
        {
            search_from = after_pos;
            continue;
        }

        // Check character after
        let next_char = if after_pos < result.len() {
            Some(result.as_bytes()[after_pos] as char)
        } else {
            None
        };

        // If followed by = (assignment), ++ or -- (increment/decrement), . (property access),
        // ? (optional chain), or alphanumeric (part of longer name), skip
        match next_char {
            Some('.') | Some('?') | Some('+') | Some('-') => {
                search_from = after_pos;
                continue;
            }
            Some('=') => {
                // Check if it's == (comparison) vs = (assignment)
                if after_pos + 1 < result.len() && result.as_bytes()[after_pos + 1] == b'=' {
                    // It's == or ===, this is a read - wrap it
                } else {
                    // It's an assignment, skip
                    search_from = after_pos;
                    continue;
                }
            }
            Some(c) if c.is_alphanumeric() || c == '_' => {
                search_from = after_pos;
                continue;
            }
            _ => {}
        }

        // This is a standalone read - wrap with $.get()
        let wrapped = format!("$.get({})", qualified);
        result = format!("{}{}{}", &result[..abs_pos], wrapped, &result[after_pos..]);
        search_from = abs_pos + wrapped.len();
    }

    result
}

/// Like `transform_class_methods` but only transforms non-`this` prefixes.
/// Used for constructor bodies where `this.#name` is already handled by
/// `transform_constructor_assignment`, but other prefixes like `instance.#name`
/// or `self.#name` still need to be wrapped with $.get()/$.set().
pub(super) fn transform_class_methods_non_this(
    content: &str,
    fields: &[ClassStateField],
) -> String {
    if content.trim().is_empty() || fields.is_empty() {
        return content.to_string();
    }

    let mut result = content.to_string();

    // AST-based pre-pass for simple `q = expr` and compound `q OP= expr`
    // (where OP ∈ +, -, *, /, %, **). Collects all non-`this` qualified
    // names across all fields once. Idempotent: after wrap the
    // AssignmentExpression becomes a CallExpression so the visitor
    // doesn't re-fire.
    {
        let mut all_qualified = Vec::new();
        for field in fields {
            let prefixes = find_private_field_prefixes(&result, &field.private_backing_name);
            for prefix in &prefixes {
                if prefix == "this" {
                    continue;
                }
                all_qualified.push(format!("{}.#{}", prefix, field.private_backing_name));
            }
        }
        if let Some(rewritten) = super::private_field_assign_ast::transform_private_field_assign_ast(
            &result,
            &all_qualified,
        ) {
            result = rewritten;
        }
    }

    for field in fields {
        let prefixes = find_private_field_prefixes(&result, &field.private_backing_name);

        for prefix in &prefixes {
            // Skip "this" - it's already handled by transform_constructor_assignment
            if prefix == "this" {
                continue;
            }

            let qualified = format!("{}.#{}", prefix, field.private_backing_name);

            // Handle compound assignments
            let compound_ops: &[(&str, &str)] = &[
                ("**=", "**"),
                ("+=", "+"),
                ("-=", "-"),
                ("*=", "*"),
                ("/=", "/"),
                ("%=", "%"),
            ];
            for (assign_op, binary_op) in compound_ops {
                let pattern = format!("{} {} ", qualified, assign_op);
                while let Some(pos) = result.find(&pattern) {
                    let value_start = pos + pattern.len();
                    let rest = &result[value_start..];
                    let value_end = rest.find(';').unwrap_or(rest.len());
                    let value = rest[..value_end].trim();
                    let replacement = format!(
                        "$.set({}, $.get({}) {} {})",
                        qualified, qualified, binary_op, value
                    );
                    result = format!(
                        "{}{}{}",
                        &result[..pos],
                        replacement,
                        &result[value_start + value_end..]
                    );
                }
            }

            // Handle direct assignment
            let assign_pattern = format!("{} = ", qualified);
            while let Some(pos) = result.find(&assign_pattern) {
                let before = &result[..pos];
                if before.ends_with("$.set(") || before.ends_with("$.get(") {
                    break;
                }
                let value_start = pos + assign_pattern.len();
                let rest = &result[value_start..];
                let value_end = rest.find(';').unwrap_or(rest.len());
                let value = rest[..value_end].trim();
                let replacement = format!("$.set({}, {})", qualified, value);
                result = format!(
                    "{}{}{}",
                    &result[..pos],
                    replacement,
                    &result[value_start + value_end..]
                );
            }

            // Handle increment/decrement
            let post_inc = format!("{}++", qualified);
            while result.contains(&post_inc) {
                result = result.replacen(&post_inc, &format!("$.update({})", qualified), 1);
            }
            let pre_inc = format!("++{}", qualified);
            while result.contains(&pre_inc) {
                result = result.replacen(&pre_inc, &format!("$.update_pre({})", qualified), 1);
            }
            let post_dec = format!("{}--", qualified);
            while result.contains(&post_dec) {
                result = result.replacen(&post_dec, &format!("$.update({}, -1)", qualified), 1);
            }
            let pre_dec = format!("--{}", qualified);
            while result.contains(&pre_dec) {
                result = result.replacen(&pre_dec, &format!("$.update_pre({}, -1)", qualified), 1);
            }

            // AST-based pre-pass for member-chain reads (`q.foo`, `q[i]`,
            // `q?.foo`). Mirrors the pre-pass already used in
            // `transform_class_methods` (with-this) — see PR #210. The
            // helper rewrites just the `q` span so the surrounding member
            // chain is preserved; idempotent vs the text replaces below
            // because after wrap the bytes between `q` and the next `.`
            // are `)`, not `.`/`?.`.
            if let Some(rewritten) =
                super::private_member_read_wrap_ast::transform_private_member_read_wrap_ast(
                    &result,
                    std::slice::from_ref(&qualified),
                )
            {
                result = rewritten;
            }

            // Handle reads
            let property_access_pattern = format!("{}.", qualified);
            let getter_wrapped = format!("$.get({}).", qualified);
            result = result.replace(&property_access_pattern, &getter_wrapped);

            let optional_access_pattern = format!("{}?.", qualified);
            let optional_getter_wrapped = format!("$.get({})?.?.", qualified);
            result = result.replace(&optional_access_pattern, &optional_getter_wrapped);

            result = wrap_standalone_private_reads(&result, &qualified);
        }
    }

    // Clean up
    if memmem::find(result.as_bytes(), b"$.get($.get(").is_some() {
        result = result.replace("$.get($.get(", "$.get(");
    }
    if memmem::find(result.as_bytes(), b"?.?.").is_some() {
        result = result.replace("?.?.", "?.");
    }

    result
}

/// Transform constructor assignments for private state fields and rune calls.
pub(super) fn transform_constructor_assignment(line: &str, fields: &[ClassStateField]) -> String {
    let mut result = line.trim().to_string();

    // Handle constructor-declared rune calls
    for field in fields {
        if !field.constructor_declared {
            continue;
        }
        // Build possible this-prefix patterns
        // For regular names: this.name or this.#name
        // For bracket notation (quoted numeric names): this[n]
        let unquoted_name = strip_field_quotes(&field.name);
        let this_prefixes: Vec<String> = if field.is_private {
            vec![format!("this.#{}", field.name)]
        } else if field.name.starts_with('\'') || field.name.starts_with('"') {
            // Quoted name from bracket notation
            vec![
                format!("this[{}]", unquoted_name),
                format!("this['{}']", unquoted_name),
                format!("this[{}]", &field.name),
            ]
        } else {
            vec![format!("this.{}", field.name)]
        };
        let rune_patterns: &[(&str, &str)] = &[
            ("$state.raw(", "$state.raw"),
            ("$state.frozen(", "$state.frozen"),
            ("$state(", "$state"),
            ("$derived.by(", "$derived.by"),
            ("$derived(", "$derived"),
        ];
        for (pattern, rune_type) in rune_patterns {
            let mut matched = false;
            for this_prefix in &this_prefixes {
                let assign_pattern = format!("{} = {}", this_prefix, pattern);
                if result.starts_with(&assign_pattern)
                    || result.trim_end_matches(';').starts_with(&assign_pattern)
                {
                    matched = true;
                    break;
                }
            }
            if matched && let Some(rune_call_start) = result.find(pattern) {
                let value_start = rune_call_start + pattern.len();
                let after_paren = &result[value_start..];
                if let Some(value_end) = find_matching_paren_lexical(after_paren) {
                    let value = after_paren[..value_end].to_string();
                    let private_name = format!("this.#{}", field.private_backing_name);
                    let transformed_rhs = match *rune_type {
                        "$state" => {
                            let needs_proxy =
                                !value.trim().is_empty() && expression_needs_proxy(value.trim());
                            if needs_proxy {
                                format!("$.state($.proxy({}))", value)
                            } else {
                                format!("$.state({})", value)
                            }
                        }
                        "$state.raw" | "$state.frozen" => format!("$.state({})", value),
                        "$derived" => {
                            let mut tv = value.clone();
                            for of in fields {
                                let tp = format!("this.#{}", of.private_backing_name);
                                if tv.contains(&tp) {
                                    let getter =
                                        format!("$.get(this.#{})", of.private_backing_name);
                                    tv = tv.replace(&tp, &getter);
                                }
                            }
                            if tv.trim_start().starts_with('{') {
                                format!("$.derived(() => ({}))", tv)
                            } else {
                                format!("$.derived(() => {})", tv)
                            }
                        }
                        "$derived.by" => format!("$.derived({})", value),
                        _ => format!("$.state({})", value),
                    };
                    return format!("{} = {};", private_name, transformed_rhs);
                }
            }
        }
    }

    // Transform `$effect.pre(...)` / `$effect(...)` (and the other
    // members of the `$effect` family — `.root`, `.tracking`,
    // `.pending`). Bare `String::replace` was the predecessor; it
    // rewrites byte patterns regardless of lexical context, so
    // string literals containing `$effect(` would be mangled. The
    // AST helper (shared with the module-script path) only touches
    // expression positions. Fall back to the legacy text scanner
    // for the rare case where this constructor-line fragment fails
    // to parse standalone (e.g. an incomplete partial statement
    // produced by an earlier text pass).
    if memmem::find(result.as_bytes(), b"$effect").is_some() {
        result = super::effect_rune_ast::apply_effect_rune_transforms_ast(&result, false)
            .unwrap_or_else(|| {
                let mut r = result.clone();
                if memmem::find(r.as_bytes(), b"$effect.pre(").is_some() {
                    r = r.replace("$effect.pre(", "$.user_pre_effect(");
                }
                if memmem::find(r.as_bytes(), b"$effect(").is_some() {
                    r = r.replace("$effect(", "$.user_effect(");
                }
                r
            });
    }

    // Check for private field assignment: this.#name = value
    if result.starts_with("this.#") && result.contains('=') {
        for field in fields {
            if field.is_private {
                // Handle logical assignment operators: ||=, &&=, ??=
                // this.#a ||= {val: 0} -> $.set(this.#a, this.#a.v || { val: 0 }, true);
                let logical_ops = [("||=", "||"), ("&&=", "&&"), ("??=", "??")];
                for (assign_op, binary_op) in logical_ops {
                    let pattern = format!("this.#{} {}", field.name, assign_op);
                    let pattern_nospace = format!("this.#{}{}", field.name, assign_op);

                    if result.starts_with(&pattern) || result.starts_with(&pattern_nospace) {
                        let op_pos = result.find(assign_op).unwrap();
                        let (value, trailing) =
                            split_rhs_at_top_level_semi(&result[op_pos + assign_op.len()..]);
                        let tail = if trailing.is_empty() { ";" } else { trailing };
                        // Use .v to access the value directly for logical operators
                        return format!(
                            "$.set(this.#{}, this.#{}.v {} {}, true){}",
                            field.private_backing_name,
                            field.private_backing_name,
                            binary_op,
                            value,
                            tail
                        );
                    }
                }

                // Handle compound assignment operators: +=, -=, *=, /=, %=, **=
                // this.#count *= 2 -> $.set(this.#count, $.get(this.#count) * 2);
                let compound_ops: &[(&str, &str)] = &[
                    ("**=", "**"),
                    ("+=", "+"),
                    ("-=", "-"),
                    ("*=", "*"),
                    ("/=", "/"),
                    ("%=", "%"),
                ];
                for (assign_op, binary_op) in compound_ops {
                    let pattern = format!("this.#{} {} ", field.name, assign_op);
                    let pattern_nospace = format!("this.#{}{}", field.name, assign_op);

                    if result.starts_with(&pattern) || result.starts_with(&pattern_nospace) {
                        let op_pos = result.find(assign_op).unwrap();
                        let (value, trailing) =
                            split_rhs_at_top_level_semi(&result[op_pos + assign_op.len()..]);
                        let tail = if trailing.is_empty() { ";" } else { trailing };
                        return format!(
                            "$.set(this.#{}, $.get(this.#{}) {} {}){}",
                            field.private_backing_name,
                            field.private_backing_name,
                            binary_op,
                            value,
                            tail
                        );
                    }
                }

                // Handle increment/decrement with $.update()
                let post_inc = format!("this.#{}++", field.name);
                if result.starts_with(&post_inc) {
                    return format!("$.update(this.#{});", field.private_backing_name);
                }
                let pre_inc = format!("++this.#{}", field.name);
                if result.starts_with(&pre_inc) {
                    return format!("$.update_pre(this.#{});", field.private_backing_name);
                }
                let post_dec = format!("this.#{}--", field.name);
                if result.starts_with(&post_dec) {
                    return format!("$.update(this.#{}, -1);", field.private_backing_name);
                }
                let pre_dec = format!("--this.#{}", field.name);
                if result.starts_with(&pre_dec) {
                    return format!("$.update_pre(this.#{}, -1);", field.private_backing_name);
                }

                // Handle regular assignment: this.#name = value
                let pattern = format!("this.#{} =", field.name);
                let pattern_nospace = format!("this.#{}=", field.name);

                if result.starts_with(&pattern) || result.starts_with(&pattern_nospace) {
                    let eq_pos = result.find('=').unwrap();
                    // Extract only the RHS expression (stop at the top-level `;`),
                    // keeping any trailing `; // comment` so it survives after the
                    // rewritten `$.set(...)` instead of being glued inside the call
                    // (issue #907).
                    let (value, trailing) = split_rhs_at_top_level_semi(&result[eq_pos + 1..]);
                    let tail = if trailing.is_empty() { ";" } else { trailing };
                    // Use private_backing_name for the output
                    // Add proxy flag (true) for $state fields when value could be an object
                    // This matches the official compiler's should_proxy() logic
                    let needs_proxy = field.rune_type == "$state" && expression_needs_proxy(value);
                    if needs_proxy {
                        return format!(
                            "$.set(this.#{}, {}, true){}",
                            field.private_backing_name, value, tail
                        );
                    } else {
                        return format!(
                            "$.set(this.#{}, {}){}",
                            field.private_backing_name, value, tail
                        );
                    }
                }

                // Handle member access on private state field: this.#name.prop = value
                // -> this.#name.v.prop = value (in constructor, we use .v for direct access)
                // Reference: MemberExpression.js - in constructor for $state fields, use .v
                let member_pattern = format!("this.#{}.", field.name);
                if result.contains(&member_pattern)
                    && (field.rune_type == "$state" || field.rune_type == "$state.raw")
                {
                    let with_v = format!("this.#{}.v.", field.private_backing_name);
                    result = result.replace(&member_pattern, &with_v);
                    return result;
                }
            }
        }
    }

    result
}

#[cfg(test)]
mod tests {
    use super::transform_class_fields_client;

    #[test]
    fn is_multiline_assignment_start_classifies_constructor_lines() {
        // A field assignment with an open RHS bracket — group it (#907).
        assert!(super::is_multiline_assignment_start("this.#rect = {"));
        // A block opener with no top-level `=` — keep it line-by-line so the
        // `this.#x = …` statements inside the block are still rewritten (the
        // #907 regression on class-state-constructor-closure).
        assert!(!super::is_multiline_assignment_start("$effect(() => {"));
        assert!(!super::is_multiline_assignment_start("if (cond) {"));
        // A complete single-line assignment is not a multiline start.
        assert!(!super::is_multiline_assignment_start("this.#count = 10;"));
    }

    const COUNTER: &str = "\
export class Counter {
\tcount = $state(0);
\tinc() {
\t\tthis.count += 1;
\t}
}
";

    #[test]
    fn non_rune_class_before_rune_class_is_lowered() {
        // Regression for C-007: a non-rune class (`Helper`) preceding a rune
        // class (`Counter`) must not suppress lowering of the rune class.
        let script = format!("class Helper {{\n\tvalue = 1;\n}}\n\n{COUNTER}");
        let out = transform_class_fields_client(&script);

        // The non-rune class is preserved verbatim.
        assert!(
            out.contains("class Helper") && out.contains("value = 1;"),
            "Helper class should be preserved unchanged:\n{out}"
        );

        // The rune class is lowered: `count` becomes `$.state(0)` backing state
        // with a getter/setter whose setter calls `$.set`.
        assert!(
            out.contains("$.state(0)"),
            "count should be lowered to `$.state(0)`:\n{out}"
        );
        assert!(
            out.contains("get count()") && out.contains("set count("),
            "count should gain a getter/setter:\n{out}"
        );
        assert!(
            out.contains("$.set(this.#count"),
            "the generated setter should call `$.set`:\n{out}"
        );
        // The raw rune field text must not survive untransformed.
        assert!(
            !out.contains("count = $state(0)"),
            "raw `count = $state(0)` field should not remain:\n{out}"
        );

        // The `Counter` class must be lowered exactly as if it stood alone —
        // the preceding non-rune class must not change its output.
        let standalone = transform_class_fields_client(COUNTER);
        assert!(
            out.ends_with(standalone.trim_end()) || out.contains(standalone.trim_end()),
            "Counter lowering should match the standalone case.\nwith Helper:\n{out}\nstandalone:\n{standalone}"
        );
    }

    #[test]
    fn standalone_rune_class_still_lowers() {
        // Existing behavior: a single rune class lowers as before.
        let out = transform_class_fields_client(COUNTER);
        assert!(out.contains("$.state(0)"), "expected lowering:\n{out}");
        assert!(
            !out.contains("count = $state(0)"),
            "raw field remained:\n{out}"
        );
    }

    #[test]
    fn script_without_runes_is_unchanged() {
        let script = "class Helper {\n\tvalue = 1;\n}\n";
        assert_eq!(transform_class_fields_client(script), script);
    }

    #[test]
    fn public_state_field_with_nested_backtick_in_derived() {
        // Regression: when $derived.by() body contains a multiline template literal
        // with nested backtick regex `/`(.+?)`/g`, the multi-line accumulation for
        // the derived field fails to complete, causing the entire class transform
        // to fall back to verbatim output. All public $state fields in the class
        // then miss their #private backing field + getter/setter.
        let script = r#"export class Workspace {
  creating = $state.raw(null);
  modified = $state({});
  diagnostics = $derived.by(() => {
    x = `${a.replace(
          /`(.+?)`/g,
          `<code>$1</code>`
        )}`;
  });
  constructor() {}
}"#;
        let out = transform_class_fields_client(script);
        assert!(
            out.contains("#creating"),
            "creating should be transformed to private backing field:\n{out}"
        );
        assert!(
            out.contains("get creating()"),
            "creating should have a getter:\n{out}"
        );
        assert!(
            out.contains("#modified"),
            "modified should be transformed to private backing field:\n{out}"
        );
    }
}
