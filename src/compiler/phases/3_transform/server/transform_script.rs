//! Script content transformation functions for server-side rendering.
//!
//! This module contains functions that transform script content (instance and module scripts)
//! for server-side code generation, including rune transformations, class field transforms,
//! and effect block removal.

use super::helpers::sanitize_identifier;
use super::transform_legacy::transform_export_let_declarations;
use super::transform_store::{
    transform_store_assignments, transform_store_destructure_assignments,
};

/// Transform script content for server-side rendering.
pub(crate) fn transform_script_content(script: &str) -> String {
    transform_script_content_inner(script, false, &[])
}

/// Transform script content with additional bindable prop names from `export { x }` patterns.
pub(crate) fn transform_script_content_with_props(
    script: &str,
    reexported_props: &[(String, String)],
) -> String {
    transform_script_content_inner(script, false, reexported_props)
}

pub(crate) fn transform_script_content_module(script: &str) -> String {
    transform_script_content_inner(script, true, &[])
}

fn transform_script_content_inner(
    script: &str,
    is_module: bool,
    reexported_props: &[(String, String)],
) -> String {
    // Split comma-separated variable declarations into individual statements BEFORE
    // rune transforms. This ensures that `const a = 1, b = 2, c = 3;` is split into
    // individual statements, but rune-generated comma patterns (e.g., from
    // destructure-state transforms) are not broken.
    let script = split_comma_separated_declarations(script);

    let script = script.replace("$props()", "$$props");
    let script = transform_rune_call_multiline(&script, "$state.eager(");
    let script = script.replace("$effect.pending()", "0");
    let script = script.replace("$effect.tracking()", "false");
    let script = script.replace("$props.id()", "$.props_id($$renderer)");
    let script = transform_state_snapshot_server(&script);
    let script = transform_object_destructure_state(&script);
    let script = transform_rune_call_multiline(&script, "$state.raw(");
    let script = transform_array_destructure_state(&script);
    let script = transform_rune_call_multiline(&script, "$state(");
    let script = transform_rune_call_multiline(&script, "$derived.by(");
    let script = transform_rune_call_multiline(&script, "$derived(");
    let script = transform_rune_call_multiline(&script, "$bindable(");
    let script = transform_store_destructure_assignments(&script);
    let script = transform_store_assignments(&script);
    let script = if is_module {
        script
    } else {
        transform_export_let_declarations(&script)
    };
    let script = if is_module {
        script
    } else {
        strip_export_from_declarations(&script)
    };
    // Transform `let x = value` declarations for variables exported via `export { x }`
    let script = if !reexported_props.is_empty() {
        transform_reexported_prop_declarations(&script, reexported_props)
    } else {
        script
    };

    let mut result = String::new();
    let lines: Vec<&str> = script.lines().collect();

    for line in lines {
        let trimmed = line.trim();

        if result.is_empty() && trimmed.is_empty() {
            continue;
        }

        let line = format_js_line(line);
        let line = add_statement_semicolon(&line);

        if line.starts_with('\t') {
            result.push_str(&line);
        } else if trimmed.is_empty() {
            // Empty line
        } else {
            result.push('\t');
            result.push_str(trimmed);
        }
        result.push('\n');
    }

    if result.ends_with('\n') {
        result.pop();
    }

    // In legacy mode (non-module, non-runes), reorder $: reactive statements
    // to appear after function declarations (to match official Svelte SSR behavior)
    if !is_module {
        super::transform_legacy::reorder_reactive_statements_after_functions(&result)
    } else {
        result
    }
}

fn format_js_line(line: &str) -> String {
    let mut result = String::new();
    let chars: Vec<char> = line.chars().collect();
    let mut i = 0;
    let mut in_string = false;
    let mut string_char = ' ';

    while i < chars.len() {
        let c = chars[i];

        if (c == '"' || c == '\'' || c == '`') && (i == 0 || chars[i - 1] != '\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
        }

        if in_string {
            result.push(c);
            i += 1;
            continue;
        }

        if c == '=' {
            let next = chars.get(i + 1).copied();
            let prev = if !result.is_empty() {
                result.chars().last()
            } else {
                None
            };

            if next == Some('=')
                || next == Some('>')
                || prev == Some('=')
                || prev == Some('!')
                || prev == Some('<')
                || prev == Some('>')
                || prev == Some('+')
                || prev == Some('-')
                || prev == Some('*')
                || prev == Some('/')
                || prev == Some('%')
                || prev == Some('&')
                || prev == Some('|')
                || prev == Some('^')
                || prev == Some('?')
            {
                result.push(c);
            } else {
                if prev != Some(' ') {
                    result.push(' ');
                }
                result.push(c);
                if next != Some(' ') && next.is_some() {
                    result.push(' ');
                }
            }
            i += 1;
            continue;
        }

        if c == '{' {
            let prev = if !result.is_empty() {
                result.chars().last()
            } else {
                None
            };
            if prev == Some(')') {
                result.push(' ');
            }
            result.push(c);
            i += 1;
            continue;
        }

        result.push(c);
        i += 1;
    }

    result
}

/// Transform object destructuring for variables that are later reassigned (legacy mode).
/// When any variable in an object destructuring pattern is later reassigned,
/// the destructuring must be decomposed into individual assignments via a temp variable.
/// e.g., `let { foo, toggleFoo } = expr;` -> `let tmp = expr, foo = tmp.foo, toggleFoo = tmp.toggleFoo;`
/// This matches the official Svelte compiler's `create_state_declarators` behavior.
pub(crate) fn transform_reassigned_destructures(
    script: &str,
    reassigned_vars: &[String],
) -> String {
    if reassigned_vars.is_empty() {
        return script.to_string();
    }

    use regex::Regex;
    use std::sync::LazyLock;

    // Match patterns like: let { ... } = expr
    // But NOT: let { ... } = $state( or let { ... } = $state.raw( (already handled)
    static OBJ_DESTRUCT_RE: LazyLock<Regex> =
        LazyLock::new(|| Regex::new(r"(?m)^(\s*)(let|var)\s+\{([^}]+)\}\s*=\s*").unwrap());

    let mut result = script.to_string();
    let mut offset: i64 = 0;
    let mut tmp_counter: usize = 0;

    for cap in OBJ_DESTRUCT_RE.captures_iter(script) {
        let full_match = cap.get(0).unwrap();

        // Skip if this is a $state() or $state.raw() destructuring (already handled elsewhere)
        let after_eq = &script[full_match.end()..];
        if after_eq.starts_with("$state(") || after_eq.starts_with("$state.raw(") {
            continue;
        }

        let indent = cap.get(1).unwrap().as_str();
        let _keyword = cap.get(2).unwrap().as_str();
        let obj_pattern = cap.get(3).unwrap().as_str();

        // Parse properties and check if any are in the reassigned set
        let props = parse_object_pattern_properties(obj_pattern);
        let has_reassigned = props.iter().any(|p| {
            let name = match p {
                ObjectPatternProp::Simple(n) => n.as_str(),
                ObjectPatternProp::Renamed { value, .. } => value.as_str(),
                ObjectPatternProp::WithDefault { name, .. } => name.as_str(),
                ObjectPatternProp::RenamedWithDefault { value, .. } => value.as_str(),
                ObjectPatternProp::Rest(n) => n.as_str(),
            };
            reassigned_vars.iter().any(|rv| rv == name)
        });

        if !has_reassigned {
            continue;
        }

        // Find the end of the initializer expression (up to the semicolon or end of line)
        let init_start = full_match.end();
        let remaining = &script[init_start..];
        // Find the end of the expression - need to handle nested parens, brackets, braces
        let init_end = find_expression_end(remaining);
        let init_expr = remaining[..init_end].trim_end_matches(';').trim();

        // Generate tmp variable name
        let tmp_name = if tmp_counter == 0 {
            "tmp".to_string()
        } else {
            format!("tmp_{}", tmp_counter)
        };
        tmp_counter += 1;

        let mut transformed = format!("{}let {} = {}", indent, tmp_name, init_expr);

        for prop in &props {
            match prop {
                ObjectPatternProp::Simple(name) => {
                    transformed
                        .push_str(&format!(",\n{}\t{} = {}.{}", indent, name, tmp_name, name));
                }
                ObjectPatternProp::Renamed { key, value } => {
                    transformed
                        .push_str(&format!(",\n{}\t{} = {}.{}", indent, value, tmp_name, key));
                }
                ObjectPatternProp::WithDefault { name, default } => {
                    transformed.push_str(&format!(
                        ",\n{}\t{} = {}.{} ?? {}",
                        indent, name, tmp_name, name, default
                    ));
                }
                ObjectPatternProp::RenamedWithDefault {
                    key,
                    value,
                    default,
                } => {
                    transformed.push_str(&format!(
                        ",\n{}\t{} = {}.{} ?? {}",
                        indent, value, tmp_name, key, default
                    ));
                }
                ObjectPatternProp::Rest(name) => {
                    transformed
                        .push_str(&format!(",\n{}\t{} = {}.{}", indent, name, tmp_name, name));
                }
            }
        }

        transformed.push(';');

        let match_start = (full_match.start() as i64 + offset) as usize;
        let match_end = (init_start as i64 + init_end as i64 + offset) as usize;

        // If the match_end char is a semicolon, include it
        let match_end = if match_end < result.len() && result.as_bytes()[match_end] == b';' {
            match_end + 1
        } else {
            match_end
        };

        result = format!(
            "{}{}{}",
            &result[..match_start],
            transformed,
            &result[match_end..]
        );

        let old_len = match_end as i64 - match_start as i64;
        let new_len = transformed.len() as i64;
        offset += new_len - old_len;
    }

    result
}

/// Find the end of a JavaScript expression (handles nested parens, brackets, braces).
/// Returns the index after the expression (at the semicolon or newline).
fn find_expression_end(s: &str) -> usize {
    let mut depth_paren = 0i32;
    let mut depth_bracket = 0i32;
    let mut depth_brace = 0i32;
    let mut in_string = false;
    let mut string_char = ' ';
    let mut i = 0;
    let bytes = s.as_bytes();

    while i < bytes.len() {
        let c = bytes[i] as char;

        if in_string {
            if c == '\\' {
                i += 2;
                continue;
            }
            if c == string_char {
                in_string = false;
            }
            i += 1;
            continue;
        }

        match c {
            '\'' | '"' | '`' => {
                in_string = true;
                string_char = c;
            }
            '(' => depth_paren += 1,
            ')' => {
                depth_paren -= 1;
                if depth_paren < 0 {
                    return i;
                }
            }
            '[' => depth_bracket += 1,
            ']' => {
                depth_bracket -= 1;
                if depth_bracket < 0 {
                    return i;
                }
            }
            '{' => depth_brace += 1,
            '}' => {
                depth_brace -= 1;
                if depth_brace < 0 {
                    return i;
                }
            }
            ';' if depth_paren == 0 && depth_bracket == 0 && depth_brace == 0 => {
                return i;
            }
            '\n' if depth_paren == 0 && depth_bracket == 0 && depth_brace == 0 => {
                // Check if the next non-whitespace is not a continuation
                let rest = &s[i + 1..];
                let trimmed = rest.trim_start();
                if trimmed.is_empty()
                    || trimmed.starts_with("let ")
                    || trimmed.starts_with("const ")
                    || trimmed.starts_with("var ")
                    || trimmed.starts_with("export ")
                    || trimmed.starts_with("function ")
                    || trimmed.starts_with("class ")
                    || trimmed.starts_with("import ")
                    || trimmed.starts_with("//")
                    || trimmed.starts_with("/*")
                {
                    return i;
                }
            }
            _ => {}
        }

        i += 1;
    }

    s.len()
}

/// Transform object destructuring with $state() or $state.raw() in server-side rendering.
/// e.g., `let { num } = $state(setup())` -> `let tmp = setup(), num = tmp.num`
/// e.g., `let { num: x } = $state(setup())` -> `let tmp = setup(), x = tmp.num`
fn transform_object_destructure_state(script: &str) -> String {
    use regex::Regex;
    use std::sync::LazyLock;

    // Match patterns like: let { ... } = $state( or let { ... } = $state.raw(
    static OBJ_DESTRUCT_RE: LazyLock<Regex> = LazyLock::new(|| {
        Regex::new(r"(?m)^(\s*)(let|const)\s+\{([^}]+)\}\s*=\s*\$state(?:\.raw)?\(").unwrap()
    });

    let mut result = script.to_string();
    let mut offset: i64 = 0;
    let mut tmp_counter: usize = 0;

    for cap in OBJ_DESTRUCT_RE.captures_iter(script) {
        let full_match = cap.get(0).unwrap();
        let indent = cap.get(1).unwrap().as_str();
        let _keyword = cap.get(2).unwrap().as_str();
        let obj_pattern = cap.get(3).unwrap().as_str();

        let start_pos = full_match.end();
        let remaining = &script[start_pos..];
        if let Some(paren_end) = find_matching_paren_for_state(remaining) {
            let value = remaining[..paren_end].trim();

            // Generate tmp variable name
            let tmp_name = if tmp_counter == 0 {
                "tmp".to_string()
            } else {
                format!("tmp_{}", tmp_counter)
            };
            tmp_counter += 1;

            // Parse the object pattern properties
            let props = parse_object_pattern_properties(obj_pattern);

            let mut transformed = format!("{}let {} = {}", indent, tmp_name, value);

            for prop in &props {
                match prop {
                    ObjectPatternProp::Simple(name) => {
                        // { a } -> a = tmp.a
                        transformed.push_str(&format!(", {} = {}.{}", name, tmp_name, name));
                    }
                    ObjectPatternProp::Renamed { key, value } => {
                        // { a: x } -> x = tmp.a
                        transformed.push_str(&format!(", {} = {}.{}", value, tmp_name, key));
                    }
                    ObjectPatternProp::WithDefault { name, default } => {
                        // { a = 5 } -> a = tmp.a ?? 5
                        transformed.push_str(&format!(
                            ", {} = {}.{} ?? {}",
                            name, tmp_name, name, default
                        ));
                    }
                    ObjectPatternProp::RenamedWithDefault {
                        key,
                        value,
                        default,
                    } => {
                        // { a: x = 5 } -> x = tmp.a ?? 5
                        transformed.push_str(&format!(
                            ", {} = {}.{} ?? {}",
                            value, tmp_name, key, default
                        ));
                    }
                    ObjectPatternProp::Rest(name) => {
                        // TODO: Handle rest pattern if needed
                        transformed.push_str(&format!(", {} = {}.{}", name, tmp_name, name));
                    }
                }
            }

            let match_start = (full_match.start() as i64 + offset) as usize;
            // +1 to skip the closing paren of $state()
            let match_end = (start_pos as i64 + paren_end as i64 + offset + 1) as usize;

            result = format!(
                "{}{}{}",
                &result[..match_start],
                transformed,
                &result[match_end..]
            );

            let old_len = (full_match.len() + paren_end + 1) as i64;
            let new_len = transformed.len() as i64;
            offset += new_len - old_len;
        }
    }

    result
}

#[derive(Debug)]
enum ObjectPatternProp {
    Simple(String),
    Renamed {
        key: String,
        value: String,
    },
    WithDefault {
        name: String,
        default: String,
    },
    RenamedWithDefault {
        key: String,
        value: String,
        default: String,
    },
    Rest(String),
}

/// Parse object pattern properties from a string like "a, b: c, d = 5"
fn parse_object_pattern_properties(pattern: &str) -> Vec<ObjectPatternProp> {
    let mut props = Vec::new();
    let mut depth = 0;
    let mut start = 0;

    for (i, c) in pattern.char_indices() {
        match c {
            '[' | '(' | '{' => depth += 1,
            ']' | ')' | '}' => depth -= 1,
            ',' if depth == 0 => {
                let prop = pattern[start..i].trim();
                if !prop.is_empty() {
                    props.push(parse_single_object_prop(prop));
                }
                start = i + 1;
            }
            _ => {}
        }
    }

    let prop = pattern[start..].trim();
    if !prop.is_empty() {
        props.push(parse_single_object_prop(prop));
    }

    props
}

fn parse_single_object_prop(prop: &str) -> ObjectPatternProp {
    let prop = prop.trim();

    if prop.starts_with("...") {
        return ObjectPatternProp::Rest(prop.trim_start_matches("...").trim().to_string());
    }

    // Check for colon (rename pattern): "key: value" or "key: value = default"
    if let Some(colon_idx) = prop.find(':') {
        let key = prop[..colon_idx].trim().to_string();
        let rest = prop[colon_idx + 1..].trim();

        // Check for default value in the renamed part
        if let Some(eq_idx) = rest.find('=') {
            let value = rest[..eq_idx].trim().to_string();
            let default = rest[eq_idx + 1..].trim().to_string();
            return ObjectPatternProp::RenamedWithDefault {
                key,
                value,
                default,
            };
        }

        return ObjectPatternProp::Renamed {
            key,
            value: rest.to_string(),
        };
    }

    // Check for default value: "name = default"
    if let Some(eq_idx) = prop.find('=') {
        let name = prop[..eq_idx].trim().to_string();
        let default = prop[eq_idx + 1..].trim().to_string();
        return ObjectPatternProp::WithDefault { name, default };
    }

    // Simple property: "name"
    ObjectPatternProp::Simple(prop.to_string())
}

/// Transform array destructuring with $state() in server-side rendering.
fn transform_array_destructure_state(script: &str) -> String {
    use regex::Regex;
    use std::sync::LazyLock;

    static ARRAY_DESTRUCT_RE: LazyLock<Regex> = LazyLock::new(|| {
        Regex::new(r"(?m)^(\s*)(let|const)\s+\[([^\]]+)\]\s*=\s*\$state\(").unwrap()
    });

    let mut result = script.to_string();
    let mut offset = 0;

    for cap in ARRAY_DESTRUCT_RE.captures_iter(script) {
        let full_match = cap.get(0).unwrap();
        let indent = cap.get(1).unwrap().as_str();
        let _keyword = cap.get(2).unwrap().as_str();
        let array_pattern = cap.get(3).unwrap().as_str();

        let start_pos = full_match.end();
        let remaining = &script[start_pos..];
        if let Some(paren_end) = find_matching_paren_for_state(remaining) {
            let value = &remaining[..paren_end].trim();

            let (vars, has_rest) = parse_array_pattern(array_pattern);

            let mut transformed = format!("{}let tmp = {},\n", indent, value);

            if has_rest {
                transformed.push_str(&format!("{}\t$$array = $.to_array(tmp)", indent));
            } else {
                transformed.push_str(&format!(
                    "{}\t$$array = $.to_array(tmp, {})",
                    indent,
                    vars.len()
                ));
            }

            for (i, var) in vars.iter().enumerate() {
                let var = var.trim();
                if var.starts_with("...") {
                    let rest_name = var.trim_start_matches("...");
                    transformed.push_str(&format!(
                        ",\n{}\t{} = $$array.slice({})",
                        indent, rest_name, i
                    ));
                } else if var.contains('=') {
                    let parts: Vec<&str> = var.splitn(2, '=').collect();
                    let name = parts[0].trim();
                    let default = parts.get(1).map(|s| s.trim()).unwrap_or("void 0");
                    transformed.push_str(&format!(
                        ",\n{}\t{} = $$array[{}] ?? {}",
                        indent, name, i, default
                    ));
                } else {
                    transformed.push_str(&format!(",\n{}\t{} = $$array[{}]", indent, var, i));
                }
            }

            let match_start = full_match.start() + offset;
            let match_end = start_pos + paren_end + offset;
            result = format!(
                "{}{}{}",
                &result[..match_start],
                transformed,
                &result[match_end + 1..] // +1 to skip the closing paren
            );

            let old_len = full_match.len() + paren_end + 1;
            let new_len = transformed.len();
            offset = offset + new_len - old_len;
        }
    }

    result
}

fn parse_array_pattern(pattern: &str) -> (Vec<&str>, bool) {
    let mut vars = Vec::new();
    let mut has_rest = false;
    let mut depth = 0;
    let mut start = 0;

    for (i, c) in pattern.char_indices() {
        match c {
            '[' | '(' | '{' => depth += 1,
            ']' | ')' | '}' => depth -= 1,
            ',' if depth == 0 => {
                let var = pattern[start..i].trim();
                if !var.is_empty() {
                    if var.starts_with("...") {
                        has_rest = true;
                    }
                    vars.push(var);
                }
                start = i + 1;
            }
            _ => {}
        }
    }

    let var = pattern[start..].trim();
    if !var.is_empty() {
        if var.starts_with("...") {
            has_rest = true;
        }
        vars.push(var);
    }

    (vars, has_rest)
}

fn find_matching_paren_for_state(s: &str) -> Option<usize> {
    let mut depth = 1;
    let mut in_string = false;
    let mut string_char = ' ';

    for (i, c) in s.char_indices() {
        if (c == '"' || c == '\'' || c == '`') && (i == 0 || s.as_bytes()[i - 1] != b'\\') {
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
            '(' | '[' | '{' => depth += 1,
            ')' | ']' | '}' => {
                depth -= 1;
                if depth == 0 {
                    return Some(i);
                }
            }
            _ => {}
        }
    }

    None
}

/// Transform $state.snapshot() in server script content.
fn transform_state_snapshot_server(script: &str) -> String {
    let prefix = "$state.snapshot(";
    let mut result = script.to_string();
    let mut search_from = 0;

    while let Some(pos) = result[search_from..].find(prefix) {
        let abs_pos = search_from + pos;
        let after_prefix = abs_pos + prefix.len();

        if let Some(content_end) = find_matching_paren_for_state(&result[after_prefix..]) {
            let content = result[after_prefix..after_prefix + content_end].to_string();

            let before = result[..abs_pos].trim_end();
            let is_assignment = before.ends_with('=') && !before.ends_with("==");

            if is_assignment {
                let end = after_prefix + content_end + 1;
                result = format!("{}{}{}", &result[..abs_pos], content, &result[end..]);
                search_from = abs_pos + content.len();
            } else {
                result = format!(
                    "{}$.snapshot({}",
                    &result[..abs_pos],
                    &result[after_prefix..]
                );
                search_from = abs_pos + "$.snapshot(".len();
            }
        } else {
            search_from = abs_pos + prefix.len();
        }
    }

    result
}

/// Simple rune call transformation for template expressions.
pub(crate) fn transform_rune_call_simple(expr: &str, prefix: &str) -> String {
    let mut result = String::new();
    let mut i = 0;
    let bytes = expr.as_bytes();
    let prefix_bytes = prefix.as_bytes();
    let prefix_len = prefix_bytes.len();

    while i < bytes.len() {
        if i + prefix_len <= bytes.len() && &bytes[i..i + prefix_len] == prefix_bytes {
            let start = i + prefix_len;
            let mut depth = 1;
            let mut end = start;
            while end < bytes.len() && depth > 0 {
                match bytes[end] {
                    b'(' => depth += 1,
                    b')' => depth -= 1,
                    b'\'' | b'"' | b'`' => {
                        let quote = bytes[end];
                        end += 1;
                        while end < bytes.len() && bytes[end] != quote {
                            if bytes[end] == b'\\' {
                                end += 1;
                            }
                            end += 1;
                        }
                    }
                    _ => {}
                }
                if depth > 0 {
                    end += 1;
                }
            }
            result.push_str(&expr[start..end]);
            i = end + 1;
        } else {
            result.push(expr.as_bytes()[i] as char);
            i += 1;
        }
    }
    result
}

/// Flatten object destructure declarations with `$.store_get()` initializers.
///
/// Transforms:
///   `let { firstNonStore, secondNonStore, firstStore } = $.store_get(...)`
/// Into:
///   `let tmp = $.store_get(...), firstNonStore = tmp.firstNonStore, secondNonStore = tmp.secondNonStore, firstStore = tmp.firstStore`
///
/// This matches the official Svelte compiler's `create_state_declarators()` behavior.
pub(crate) fn flatten_store_get_destructures(script: &str) -> String {
    use regex::Regex;
    use std::sync::LazyLock;

    // Match: let { ... } = $.store_get(
    static STORE_GET_DESTRUCT_RE: LazyLock<Regex> = LazyLock::new(|| {
        Regex::new(r"(?m)^(\s*)(let|const)\s+\{([^}]+)\}\s*=\s*\$\.store_get\(").unwrap()
    });

    let mut result = script.to_string();
    let mut offset: i64 = 0;

    for cap in STORE_GET_DESTRUCT_RE.captures_iter(script) {
        let full_match = cap.get(0).unwrap();
        let indent = cap.get(1).unwrap().as_str();
        let _keyword = cap.get(2).unwrap().as_str();
        let obj_pattern = cap.get(3).unwrap().as_str();

        let start_pos = full_match.end();
        let remaining = &script[start_pos..];

        // Find the matching closing paren of $.store_get(...)
        if let Some(paren_end) = find_matching_paren_for_state(remaining) {
            let store_get_args = &remaining[..paren_end];

            // Parse the object pattern properties
            let props = parse_object_pattern_properties(obj_pattern);

            // Build: let tmp = $.store_get(...), prop1 = tmp.prop1, prop2 = tmp.prop2, ...
            let mut transformed = format!("{}let tmp = $.store_get({})", indent, store_get_args);

            for prop in &props {
                match prop {
                    ObjectPatternProp::Simple(name) => {
                        transformed.push_str(&format!(",\n{}\t{} = tmp.{}", indent, name, name));
                    }
                    ObjectPatternProp::Renamed { key, value } => {
                        transformed.push_str(&format!(",\n{}\t{} = tmp.{}", indent, value, key));
                    }
                    ObjectPatternProp::WithDefault { name, default } => {
                        transformed.push_str(&format!(
                            ",\n{}\t{} = tmp.{} ?? {}",
                            indent, name, name, default
                        ));
                    }
                    ObjectPatternProp::RenamedWithDefault {
                        key,
                        value,
                        default,
                    } => {
                        transformed.push_str(&format!(
                            ",\n{}\t{} = tmp.{} ?? {}",
                            indent, value, key, default
                        ));
                    }
                    ObjectPatternProp::Rest(name) => {
                        transformed.push_str(&format!(",\n{}\t{} = tmp.{}", indent, name, name));
                    }
                }
            }

            let match_start = (full_match.start() as i64 + offset) as usize;
            // +1 to skip the closing paren of $.store_get()
            let match_end = (start_pos as i64 + paren_end as i64 + offset + 1) as usize;

            result = format!(
                "{}{}{}",
                &result[..match_start],
                transformed,
                &result[match_end..]
            );

            let old_len = (full_match.len() + paren_end + 1) as i64;
            let new_len = transformed.len() as i64;
            offset += new_len - old_len;
        }
    }

    result
}

fn transform_rune_call_multiline(script: &str, prefix: &str) -> String {
    let mut result = String::new();
    let chars: Vec<char> = script.chars().collect();
    let prefix_chars: Vec<char> = prefix.chars().collect();
    let prefix_len = prefix_chars.len();
    let mut i = 0;

    let is_derived_by = prefix == "$derived.by(";

    while i < chars.len() {
        if i + prefix_len <= chars.len() {
            let potential: String = chars[i..i + prefix_len].iter().collect();
            if potential == prefix {
                let mut depth = 1;
                let start = i + prefix_len;
                let mut end = start;
                let mut in_string = false;
                let mut string_char = ' ';

                while end < chars.len() && depth > 0 {
                    let c = chars[end];

                    if (c == '"' || c == '\'' || c == '`') && (end == 0 || chars[end - 1] != '\\') {
                        if !in_string {
                            in_string = true;
                            string_char = c;
                        } else if c == string_char {
                            in_string = false;
                        }
                    }

                    if !in_string {
                        match c {
                            '(' => depth += 1,
                            ')' => depth -= 1,
                            _ => {}
                        }
                    }
                    if depth > 0 {
                        end += 1;
                    }
                }

                let inner: String = chars[start..end].iter().collect();
                let trimmed_inner = inner.trim();

                if trimmed_inner.is_empty() {
                    result.push_str("void 0");
                } else if is_derived_by {
                    result.push('(');
                    result.push_str(&inner);
                    result.push_str(")()");
                } else {
                    result.push_str(&inner);
                }

                i = end + 1;
                continue;
            }
        }

        result.push(chars[i]);
        i += 1;
    }

    result
}

fn add_statement_semicolon(line: &str) -> String {
    let trimmed = line.trim();

    if trimmed.is_empty() {
        return line.to_string();
    }

    // Lines that are already terminated or are block delimiters
    if trimmed.ends_with(';')
        || trimmed.ends_with('{')
        || trimmed.ends_with('}')
        || trimmed.ends_with(',')
    {
        return line.to_string();
    }

    // Skip comment lines
    if trimmed.starts_with("//") || trimmed.starts_with("/*") {
        return line.to_string();
    }

    // Skip labels like `$:`
    if trimmed.ends_with(':') {
        return line.to_string();
    }

    // Variable declarations ending with `)` or `]` need semicolons
    if (trimmed.starts_with("const ") || trimmed.starts_with("let ") || trimmed.starts_with("var "))
        && (trimmed.ends_with(')') || trimmed.ends_with(']'))
    {
        return format!("{};", line);
    }

    line.to_string()
}

/// Transform class fields with $derived runes for server-side.
pub(crate) fn transform_class_fields_server(script: &str) -> String {
    if !script.contains("class ")
        || (!script.contains("$derived(")
            && !script.contains("$derived.by(")
            && !script.contains("$state(")
            && !script.contains("$state.raw("))
    {
        return script.to_string();
    }

    let Some(class_pos) = script.find("class ") else {
        return script.to_string();
    };

    let after_class = &script[class_pos..];
    let Some(brace_pos) = after_class.find('{') else {
        return script.to_string();
    };

    let class_header = &after_class[..brace_pos + 1];

    let class_body_start = class_pos + brace_pos + 1;
    let mut brace_depth = 1;
    let mut class_body_end = class_body_start;

    for (i, c) in script[class_body_start..].char_indices() {
        match c {
            '{' => brace_depth += 1,
            '}' => {
                brace_depth -= 1;
                if brace_depth == 0 {
                    class_body_end = class_body_start + i;
                    break;
                }
            }
            _ => {}
        }
    }

    let class_body = &script[class_body_start..class_body_end];

    #[derive(Debug, Clone)]
    enum ClassMember {
        Field(String),
        Method(Vec<String>),
        ArrowFn(Vec<String>),
    }

    #[derive(Debug, Clone)]
    struct DerivedField {
        name: String,
        is_private: bool,
        constructor_declared: bool,
    }

    let mut members: Vec<ClassMember> = Vec::new();
    let mut derived_fields: Vec<DerivedField> = Vec::new();
    let mut has_state_fields = false;

    let mut in_block = false;
    let mut block_depth = 0;
    let mut block_lines: Vec<String> = Vec::new();
    let mut block_is_arrow_fn = false;

    // For multiline derived fields: accumulate text until parens balance
    let mut in_derived_field = false;
    let mut derived_accum = String::new();
    let mut derived_paren_depth: i32 = 0;
    let mut derived_field_name = String::new();
    let mut derived_field_is_private = false;
    let mut derived_field_is_by = false;

    let all_lines: Vec<&str> = class_body.lines().collect();
    let mut line_idx = 0;

    while line_idx < all_lines.len() {
        let line = all_lines[line_idx];
        let trimmed = line.trim();
        line_idx += 1;

        // Continue accumulating multiline derived field
        if in_derived_field {
            derived_accum.push('\n');
            derived_accum.push_str(trimmed);
            for c in trimmed.chars() {
                match c {
                    '(' | '{' | '[' => derived_paren_depth += 1,
                    ')' | '}' | ']' => derived_paren_depth -= 1,
                    _ => {}
                }
            }
            if derived_paren_depth <= 0 {
                in_derived_field = false;
                // Now process the complete multiline derived field
                let full_text = derived_accum.clone();
                let derived_pattern = if derived_field_is_by {
                    "$derived.by("
                } else {
                    "$derived("
                };
                if let Some(derived_pos) = full_text.find(derived_pattern) {
                    let value_start = derived_pos + derived_pattern.len();
                    let after_paren = &full_text[value_start..];
                    if let Some(value_end) = find_matching_paren_server(after_paren) {
                        let value = after_paren[..value_end].to_string();
                        let sanitized_name = sanitize_identifier(&derived_field_name);
                        let private_name = format!("#{}", sanitized_name);

                        let value_str = value.trim();
                        let wrapped_value = if value_str.starts_with('{') {
                            format!("({})", value_str)
                        } else {
                            value_str.to_string()
                        };

                        let transformed_line = if derived_field_is_by {
                            format!("{} = $.derived({})", private_name, wrapped_value)
                        } else {
                            format!("{} = $.derived(() => {})", private_name, wrapped_value)
                        };

                        members.push(ClassMember::Field(transformed_line));
                        derived_fields.push(DerivedField {
                            name: derived_field_name.clone(),
                            is_private: derived_field_is_private,
                            constructor_declared: false,
                        });
                    }
                }
            }
            continue;
        }

        if in_block {
            block_lines.push(trimmed.to_string());
            for c in trimmed.chars() {
                match c {
                    '{' => block_depth += 1,
                    '}' => {
                        block_depth -= 1;
                        if block_depth == 0 {
                            in_block = false;
                            if block_is_arrow_fn {
                                members.push(ClassMember::ArrowFn(block_lines.clone()));
                            } else {
                                members.push(ClassMember::Method(block_lines.clone()));
                            }
                            block_lines.clear();
                        }
                    }
                    _ => {}
                }
            }
            continue;
        }

        if trimmed.is_empty() {
            continue;
        }

        if trimmed.contains("constructor(") && !trimmed.contains('=') {
            in_block = true;
            block_is_arrow_fn = false;
            block_depth = 0;
            block_lines.clear();
            block_lines.push(trimmed.to_string());
            for c in trimmed.chars() {
                match c {
                    '{' => block_depth += 1,
                    '}' => {
                        block_depth -= 1;
                        if block_depth == 0 {
                            in_block = false;
                            members.push(ClassMember::Method(block_lines.clone()));
                            block_lines.clear();
                        }
                    }
                    _ => {}
                }
            }
            continue;
        }

        let is_arrow_fn_start = trimmed.contains('=')
            && trimmed.contains("=>")
            && trimmed.contains('{')
            && !trimmed.contains("$derived")
            && !trimmed.contains("$state");

        if is_arrow_fn_start {
            in_block = true;
            block_is_arrow_fn = true;
            block_depth = 0;
            block_lines.clear();
            block_lines.push(trimmed.to_string());
            for c in trimmed.chars() {
                match c {
                    '{' => block_depth += 1,
                    '}' => {
                        block_depth -= 1;
                        if block_depth == 0 {
                            in_block = false;
                            members.push(ClassMember::ArrowFn(block_lines.clone()));
                            block_lines.clear();
                        }
                    }
                    _ => {}
                }
            }
            continue;
        }

        let is_method_start = (trimmed.contains('(') && trimmed.contains('{'))
            && !trimmed.contains('=')
            && !trimmed.starts_with("//")
            && !trimmed.starts_with("/*");

        if is_method_start {
            in_block = true;
            block_is_arrow_fn = false;
            block_depth = 0;
            block_lines.clear();
            block_lines.push(trimmed.to_string());
            for c in trimmed.chars() {
                match c {
                    '{' => block_depth += 1,
                    '}' => {
                        block_depth -= 1;
                        if block_depth == 0 {
                            in_block = false;
                            members.push(ClassMember::Method(block_lines.clone()));
                            block_lines.clear();
                        }
                    }
                    _ => {}
                }
            }
            continue;
        }

        let is_derived_field = trimmed.contains("= $derived(")
            || trimmed.contains("=$derived(")
            || trimmed.contains("= $derived.by(")
            || trimmed.contains("=$derived.by(");
        if is_derived_field {
            let is_private = trimmed.starts_with('#');
            if let Some(eq_pos) = trimmed.find('=') {
                let name = trimmed[..eq_pos].trim().trim_start_matches('#').to_string();

                let (derived_pattern, is_derived_by) = if trimmed.contains("$derived.by(") {
                    ("$derived.by(", true)
                } else {
                    ("$derived(", false)
                };

                if let Some(derived_pos) = trimmed.find(derived_pattern) {
                    let value_start = derived_pos + derived_pattern.len();
                    let after_paren = &trimmed[value_start..];

                    if let Some(value_end) = find_matching_paren_server(after_paren) {
                        let value = after_paren[..value_end].to_string();
                        let sanitized_name = sanitize_identifier(&name);
                        let private_name = format!("#{}", sanitized_name);

                        let value_str = value.trim();
                        let wrapped_value = if value_str.starts_with('{') {
                            format!("({})", value_str)
                        } else {
                            value_str.to_string()
                        };

                        let transformed_line = if is_derived_by {
                            format!("{} = $.derived({})", private_name, wrapped_value)
                        } else {
                            format!("{} = $.derived(() => {})", private_name, wrapped_value)
                        };

                        members.push(ClassMember::Field(transformed_line));

                        derived_fields.push(DerivedField {
                            name,
                            is_private,
                            constructor_declared: false,
                        });
                        continue;
                    } else {
                        // Multiline derived field - accumulate until parens balance
                        in_derived_field = true;
                        derived_accum = trimmed.to_string();
                        derived_paren_depth = 0;
                        for c in trimmed.chars() {
                            match c {
                                '(' | '{' | '[' => derived_paren_depth += 1,
                                ')' | '}' | ']' => derived_paren_depth -= 1,
                                _ => {}
                            }
                        }
                        derived_field_name = name;
                        derived_field_is_private = is_private;
                        derived_field_is_by = is_derived_by;
                        continue;
                    }
                }
            }
        }

        let is_state_field = trimmed.contains("= $state(")
            || trimmed.contains("=$state(")
            || trimmed.contains("= $state.raw(")
            || trimmed.contains("=$state.raw(");
        if is_state_field && let Some(eq_pos) = trimmed.find('=') {
            let (state_pattern, state_pos) = if let Some(pos) = trimmed.find("$state.raw(") {
                ("$state.raw(", pos)
            } else if let Some(pos) = trimmed.find("$state(") {
                ("$state(", pos)
            } else {
                members.push(ClassMember::Field(trimmed.to_string()));
                continue;
            };
            let field_name = trimmed[..eq_pos].trim();
            let value_start = state_pos + state_pattern.len();
            let after_paren = &trimmed[value_start..];

            if let Some(value_end) = find_matching_paren_server(after_paren) {
                let value = after_paren[..value_end].trim();
                has_state_fields = true;
                if value.is_empty() {
                    members.push(ClassMember::Field(field_name.to_string()));
                } else {
                    members.push(ClassMember::Field(format!("{} = {}", field_name, value)));
                }
                continue;
            }
        }

        members.push(ClassMember::Field(trimmed.to_string()));
    }

    // Scan constructor members for $derived/$state assignments
    for member in &mut members {
        if let ClassMember::Method(lines) = member
            && lines
                .first()
                .is_some_and(|l| l.trim().contains("constructor("))
        {
            let mut new_lines: Vec<String> = Vec::new();
            for line in lines.iter() {
                let trimmed = line.trim();

                if trimmed.starts_with("this.")
                    && (trimmed.contains("= $derived(")
                        || trimmed.contains("=$derived(")
                        || trimmed.contains("= $derived.by(")
                        || trimmed.contains("=$derived.by("))
                    && let Some(eq_pos) = trimmed.find('=')
                {
                    let lhs = trimmed[5..eq_pos].trim();
                    let is_private = lhs.starts_with('#');
                    let name = lhs.trim_start_matches('#').to_string();

                    let (derived_pattern, is_derived_by) = if trimmed.contains("$derived.by(") {
                        ("$derived.by(", true)
                    } else {
                        ("$derived(", false)
                    };

                    if let Some(derived_pos) = trimmed.find(derived_pattern) {
                        let value_start = derived_pos + derived_pattern.len();
                        let after_paren = &trimmed[value_start..];

                        if let Some(value_end) = find_matching_paren_server(after_paren) {
                            let value = after_paren[..value_end].to_string();
                            let sanitized = sanitize_identifier(&name);
                            let private_ref = format!("#{}", sanitized);

                            let value_str = value.trim();
                            let wrapped_value = if value_str.starts_with('{') {
                                format!("({})", value_str)
                            } else {
                                value_str.to_string()
                            };

                            let rhs = if is_derived_by {
                                format!("$.derived({})", wrapped_value)
                            } else {
                                format!("$.derived(() => {})", wrapped_value)
                            };

                            new_lines.push(format!("this.{} = {};", private_ref, rhs));

                            derived_fields.push(DerivedField {
                                name,
                                is_private,
                                constructor_declared: true,
                            });
                            continue;
                        }
                    }
                }

                if trimmed.starts_with("this.")
                    && (trimmed.contains("= $state(")
                        || trimmed.contains("=$state(")
                        || trimmed.contains("= $state.raw(")
                        || trimmed.contains("=$state.raw("))
                    && let Some(eq_pos) = trimmed.find('=')
                {
                    let lhs = trimmed[5..eq_pos].trim();

                    let (state_pattern, state_pos) = if let Some(pos) = trimmed.find("$state.raw(")
                    {
                        ("$state.raw(", pos)
                    } else if let Some(pos) = trimmed.find("$state(") {
                        ("$state(", pos)
                    } else {
                        new_lines.push(trimmed.to_string());
                        continue;
                    };

                    let value_start = state_pos + state_pattern.len();
                    let after_paren = &trimmed[value_start..];

                    if let Some(value_end) = find_matching_paren_server(after_paren) {
                        let value = after_paren[..value_end].trim();
                        has_state_fields = true;

                        if value.is_empty() {
                            new_lines.push(format!("this.{} = void 0;", lhs));
                        } else {
                            new_lines.push(format!("this.{} = {};", lhs, value));
                        }
                        continue;
                    }
                }

                new_lines.push(trimmed.to_string());
            }
            *lines = new_lines;
        }
    }

    let derived_private_names: Vec<String> = derived_fields
        .iter()
        .map(|f| {
            let sanitized = sanitize_identifier(&f.name);
            format!("#{}", sanitized)
        })
        .collect();

    if derived_fields.is_empty() && !has_state_fields {
        return script.to_string();
    }

    let mut new_class_body = String::new();

    for field in derived_fields
        .iter()
        .filter(|f| f.constructor_declared && !f.is_private)
    {
        let sanitized_name = sanitize_identifier(&field.name);
        let private_name = format!("#{}", sanitized_name);

        new_class_body.push_str(&format!("\t\t{};\n", private_name));
        new_class_body.push('\n');
        new_class_body.push_str(&format!(
            "\t\tget {}() {{\n\t\t\treturn this.{}();\n\t\t}}\n",
            field.name, private_name
        ));
        new_class_body.push('\n');
        new_class_body.push_str(&format!(
            "\t\tset {}($$value) {{\n\t\t\treturn this.{}($$value);\n\t\t}}\n",
            field.name, private_name
        ));
    }

    for member in &members {
        match member {
            ClassMember::Field(line) => {
                // Skip fields that have been converted to constructor-declared derived fields
                // e.g., `product;` should be skipped when `this.product = $derived(...)` was found
                let field_name = line
                    .trim()
                    .trim_end_matches(';')
                    .trim_end_matches(':')
                    .split_whitespace()
                    .next()
                    .unwrap_or("");
                let is_constructor_declared = derived_fields
                    .iter()
                    .any(|f| f.constructor_declared && !f.is_private && f.name == field_name);
                if is_constructor_declared {
                    // This field is now represented by #name + getter + setter
                    // generated above, so skip the original field declaration
                    continue;
                }

                // Transform private derived accesses in field values
                // (e.g., this.#derived inside a $.derived() body should become this.#derived())
                let line = transform_private_derived_accesses_server(line, &derived_private_names);
                new_class_body.push_str(&format!("\t\t{}\n", line));
                for field in derived_fields
                    .iter()
                    .filter(|f| !f.constructor_declared && !f.is_private)
                {
                    let sanitized_name = sanitize_identifier(&field.name);
                    let private_name = format!("#{}", sanitized_name);
                    // Check exact match: the line starts with the private name and the
                    // next character is not an identifier char (prevents #on_class matching #on_class_private)
                    let is_exact_match = line.starts_with(&private_name)
                        && !line[private_name.len()..]
                            .chars()
                            .next()
                            .is_some_and(|c| c.is_alphanumeric() || c == '_');
                    if is_exact_match {
                        new_class_body.push('\n');
                        new_class_body.push_str(&format!(
                            "\t\tget {}() {{\n\t\t\treturn this.{}();\n\t\t}}\n",
                            field.name, private_name
                        ));
                        new_class_body.push('\n');
                        new_class_body.push_str(&format!(
                            "\t\tset {}($$value) {{\n\t\t\treturn this.{}($$value);\n\t\t}}\n",
                            field.name, private_name
                        ));
                    }
                }
            }
            ClassMember::Method(lines) => {
                let is_constructor = lines
                    .first()
                    .is_some_and(|l| l.trim().contains("constructor("));

                let method_text = lines
                    .iter()
                    .map(|l| format!("\t\t{}", l))
                    .collect::<Vec<_>>()
                    .join("\n");
                let mut transformed =
                    transform_private_derived_accesses_server(&method_text, &derived_private_names);

                // In constructors, convert assignments to derived private fields:
                // `this.#field = value` → `this.#field(value)`
                // This only applies when the value is NOT a $.derived() call
                // (those are already handled by the constructor scanning above)
                if is_constructor && !derived_private_names.is_empty() {
                    for private_name in &derived_private_names {
                        let assign_pattern = format!("this.{} = ", private_name);
                        let mut new_transformed = String::new();
                        let mut remaining = transformed.as_str();

                        while let Some(pos) = remaining.find(&assign_pattern) {
                            new_transformed.push_str(&remaining[..pos]);
                            let after_assign = &remaining[pos + assign_pattern.len()..];

                            // Check if the value is a $.derived() call - if so, leave as-is
                            let value_trimmed = after_assign.trim_start();
                            if value_trimmed.starts_with("$.derived(") {
                                new_transformed.push_str(&assign_pattern);
                                remaining = after_assign;
                                continue;
                            }

                            // Find the end of the value (semicolon at the same nesting level)
                            let mut depth = 0;
                            let mut value_end = None;
                            for (i, c) in after_assign.char_indices() {
                                match c {
                                    '(' | '{' | '[' => depth += 1,
                                    ')' | '}' | ']' => depth -= 1,
                                    ';' if depth == 0 => {
                                        value_end = Some(i);
                                        break;
                                    }
                                    _ => {}
                                }
                            }

                            if let Some(end) = value_end {
                                let value = after_assign[..end].trim();
                                new_transformed
                                    .push_str(&format!("this.{}({});", private_name, value));
                                remaining = &after_assign[end + 1..];
                            } else {
                                // No semicolon found, leave as-is
                                new_transformed.push_str(&assign_pattern);
                                remaining = after_assign;
                            }
                        }

                        new_transformed.push_str(remaining);
                        transformed = new_transformed;
                    }
                }

                new_class_body.push('\n');
                new_class_body.push_str(&transformed);
                new_class_body.push('\n');
            }
            ClassMember::ArrowFn(lines) => {
                new_class_body.push('\n');
                for line in lines {
                    new_class_body.push_str(&format!("\t\t{}\n", line));
                }
            }
        }
    }

    let before_class = &script[..class_pos];
    let after_class_body = &script[class_body_end + 1..];

    let after_class_transformed = transform_class_fields_server(after_class_body);

    let result = format!(
        "{}{}\n{}\t}}{}",
        before_class, class_header, new_class_body, after_class_transformed
    );

    result
}

fn transform_private_derived_accesses_server(
    code: &str,
    derived_private_names: &[String],
) -> String {
    if derived_private_names.is_empty() {
        return code.to_string();
    }

    // Sort by length descending to match longer names first (e.g., #derivedBy before #derived)
    let mut sorted_names: Vec<&String> = derived_private_names.iter().collect();
    sorted_names.sort_by_key(|b| std::cmp::Reverse(b.len()));

    let mut result = code.to_string();

    for private_name in &sorted_names {
        let search_pattern = format!(".{}", private_name);
        let mut new_result = String::new();
        let mut remaining = result.as_str();

        while let Some(pos) = remaining.find(&search_pattern) {
            new_result.push_str(&remaining[..pos]);

            let after_match = &remaining[pos + search_pattern.len()..];

            // Check if the next character is an identifier character - if so, this is
            // a longer name (e.g., #derivedBy when we're looking for #derived) and we
            // should NOT transform it
            let next_char = after_match.chars().next();
            let is_partial_match = next_char.is_some_and(|c| c.is_alphanumeric() || c == '_');

            if is_partial_match {
                // Not a complete match, skip
                new_result.push_str(&search_pattern);
                remaining = after_match;
                continue;
            }

            let next_non_ws = after_match.chars().find(|c| !c.is_whitespace());
            let is_already_call = next_non_ws == Some('(');

            let is_assignment = {
                let trimmed_after = after_match.trim_start();
                trimmed_after.starts_with('=') && !trimmed_after.starts_with("==")
            };

            if is_already_call || is_assignment {
                new_result.push_str(&search_pattern);
            } else {
                new_result.push_str(&search_pattern);
                new_result.push_str("()");
            }

            remaining = after_match;
        }

        new_result.push_str(remaining);
        result = new_result;
    }

    result
}

fn find_matching_paren_server(s: &str) -> Option<usize> {
    let mut depth = 1;
    for (i, c) in s.char_indices() {
        match c {
            '(' | '{' | '[' => depth += 1,
            ')' | '}' | ']' => {
                depth -= 1;
                if depth == 0 {
                    return Some(i);
                }
            }
            _ => {}
        }
    }
    None
}

/// Remove $effect, $effect.pre, $effect.root, $inspect, and $inspect.trace blocks from script.
pub(crate) fn remove_effect_blocks(script: &str) -> String {
    let mut result = script.to_string();

    let effect_runes = [
        "$effect.root(",
        "$effect.pre(",
        "$effect(",
        "$inspect.trace(",
        "$inspect(",
    ];

    for rune in effect_runes {
        result = remove_rune_statement(&result, rune);
    }

    result
}

fn remove_rune_statement(script: &str, rune_prefix: &str) -> String {
    let mut result = String::new();
    let chars: Vec<char> = script.chars().collect();
    let prefix_chars: Vec<char> = rune_prefix.chars().collect();
    let prefix_len = prefix_chars.len();
    let mut i = 0;

    while i < chars.len() {
        if i + prefix_len <= chars.len() {
            let potential: String = chars[i..i + prefix_len].iter().collect();
            if potential == rune_prefix {
                let is_statement = is_statement_start(&result);

                if !is_statement && rune_prefix == "$effect.root(" {
                    let start = i + prefix_len;
                    let mut depth = 1;
                    let mut end = start;
                    let mut in_string = false;
                    let mut string_char = ' ';

                    while end < chars.len() && depth > 0 {
                        let c = chars[end];
                        if (c == '"' || c == '\'' || c == '`')
                            && (end == 0 || chars[end - 1] != '\\')
                        {
                            if !in_string {
                                in_string = true;
                                string_char = c;
                            } else if c == string_char {
                                in_string = false;
                            }
                        }
                        if !in_string {
                            match c {
                                '(' => depth += 1,
                                ')' => depth -= 1,
                                _ => {}
                            }
                        }
                        if depth > 0 {
                            end += 1;
                        }
                    }
                    end += 1;

                    result.push_str("() => {}");
                    i = end;
                    continue;
                }

                if is_statement {
                    let start = i + prefix_len;
                    let mut depth = 1;
                    let mut end = start;
                    let mut in_string = false;
                    let mut string_char = ' ';

                    while end < chars.len() && depth > 0 {
                        let c = chars[end];

                        if (c == '"' || c == '\'' || c == '`')
                            && (end == 0 || chars[end - 1] != '\\')
                        {
                            if !in_string {
                                in_string = true;
                                string_char = c;
                            } else if c == string_char {
                                in_string = false;
                            }
                        }

                        if !in_string {
                            match c {
                                '(' => depth += 1,
                                ')' => depth -= 1,
                                _ => {}
                            }
                        }
                        if depth > 0 {
                            end += 1;
                        }
                    }

                    end += 1;

                    // Handle method chaining like $inspect(...).with(...)
                    if end + 5 <= chars.len() {
                        let potential_with: String = chars[end..end + 5].iter().collect();
                        if potential_with == ".with" {
                            end += 5;
                            while end < chars.len() && (chars[end] == ' ' || chars[end] == '\t') {
                                end += 1;
                            }
                            if end < chars.len() && chars[end] == '(' {
                                end += 1;
                                let mut with_depth = 1;
                                let mut with_in_string = false;
                                let mut with_string_char = ' ';

                                while end < chars.len() && with_depth > 0 {
                                    let c = chars[end];
                                    if (c == '"' || c == '\'' || c == '`')
                                        && (end == 0 || chars[end - 1] != '\\')
                                    {
                                        if !with_in_string {
                                            with_in_string = true;
                                            with_string_char = c;
                                        } else if c == with_string_char {
                                            with_in_string = false;
                                        }
                                    }
                                    if !with_in_string {
                                        match c {
                                            '(' => with_depth += 1,
                                            ')' => with_depth -= 1,
                                            _ => {}
                                        }
                                    }
                                    if with_depth > 0 {
                                        end += 1;
                                    }
                                }
                                end += 1;
                            }
                        }
                    }

                    while end < chars.len() && (chars[end] == ';' || chars[end] == ' ') {
                        end += 1;
                    }

                    if end < chars.len() && chars[end] == '\n' {
                        end += 1;
                    }

                    if rune_prefix.starts_with("$inspect")
                        && !rune_prefix.starts_with("$inspect.trace")
                    {
                        // $inspect() calls (not $inspect.trace()) should output ;; placeholder
                        result.push_str(";;\n");
                    } else if !rune_prefix.starts_with("$inspect") {
                        while result.ends_with(' ') || result.ends_with('\t') {
                            result.pop();
                        }
                    }
                    // $inspect.trace() calls are removed entirely (no output)

                    i = end;
                    continue;
                }
            }
        }

        result.push(chars[i]);
        i += 1;
    }

    result
}

fn is_statement_start(preceding: &str) -> bool {
    if let Some(last_newline) = preceding.rfind('\n') {
        let line_content = &preceding[last_newline + 1..];
        line_content.chars().all(|c| c.is_whitespace())
    } else {
        preceding.chars().all(|c| c.is_whitespace())
    }
}

/// Strip `export` keyword from function/const/class declarations.
fn strip_export_from_declarations(script: &str) -> String {
    let mut result = String::new();
    for line in script.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with("export function ")
            || trimmed.starts_with("export async function ")
            || trimmed.starts_with("export const ")
            || trimmed.starts_with("export class ")
        {
            let indent = &line[..line.len() - trimmed.len()];
            let rest = trimmed.strip_prefix("export ").unwrap_or(trimmed);
            result.push_str(indent);
            result.push_str(rest);
        } else {
            result.push_str(line);
        }
        result.push('\n');
    }
    if result.ends_with('\n') && !script.ends_with('\n') {
        result.pop();
    }
    result
}

/// Transform `let x = value` declarations where `x` is exported via `export { x }`.
/// Converts them to `let x = $.fallback($$props['x'], value)` for server-side rendering,
/// similar to how `export let x = value` is handled.
fn transform_reexported_prop_declarations(
    script: &str,
    reexported_props: &[(String, String)],
) -> String {
    use super::transform_legacy::{is_no_arg_function_call, is_simple_default_value};

    let mut result = String::new();

    for line in script.lines() {
        let trimmed = line.trim();

        // Check if this is a `let x = value;` or `let x;` declaration for a reexported prop
        if trimmed.starts_with("let ") || trimmed.starts_with("var ") {
            let rest = &trimmed[4..]; // skip "let " or "var "
            let rest_trimmed = rest.trim().trim_end_matches(';').trim();

            // Simple case: `let x = value` or `let x`
            if let Some(eq_pos) = find_simple_assignment(rest_trimmed) {
                let name = rest_trimmed[..eq_pos].trim();
                let value = rest_trimmed[eq_pos + 1..].trim();

                if let Some((_, prop_name)) =
                    reexported_props.iter().find(|(local, _)| local == name)
                {
                    let indent = &line[..line.len() - trimmed.len()];
                    let transformed = if is_simple_default_value(value) {
                        format!(
                            "{}let {} = $.fallback($$props['{}'], {});",
                            indent, name, prop_name, value
                        )
                    } else if let Some(fn_name) = is_no_arg_function_call(value) {
                        format!(
                            "{}let {} = $.fallback($$props['{}'], {}, true);",
                            indent, name, prop_name, fn_name
                        )
                    } else {
                        format!(
                            "{}let {} = $.fallback($$props['{}'], () => ({}), true);",
                            indent, name, prop_name, value
                        )
                    };
                    result.push_str(&transformed);
                    result.push('\n');
                    continue;
                }
            } else {
                // No assignment: `let x;` -> `let x = $$props['prop_name'];`
                // Also handle multi-declarator: `let a, b, c, d;`
                let name = rest_trimmed.trim();

                // Check if this is a multi-declarator (contains commas at depth 0)
                let has_commas = name.contains(',');
                if has_commas {
                    // Split multi-declarator into individual declarations
                    let parts: Vec<&str> = name.split(',').map(|s| s.trim()).collect();
                    let any_is_prop = parts.iter().any(|part| {
                        let part_name = part.trim_end_matches(';').trim();
                        reexported_props.iter().any(|(local, _)| local == part_name)
                    });

                    if any_is_prop {
                        let indent = &line[..line.len() - trimmed.len()];
                        for part in &parts {
                            let part_name = part.trim_end_matches(';').trim();
                            if let Some((_, prop_name)) = reexported_props
                                .iter()
                                .find(|(local, _)| local == part_name)
                            {
                                result.push_str(&format!(
                                    "{}let {} = $$props['{}'];",
                                    indent, part_name, prop_name
                                ));
                            } else {
                                result.push_str(&format!("{}let {};", indent, part_name));
                            }
                            result.push('\n');
                        }
                        continue;
                    }
                } else if let Some((_, prop_name)) =
                    reexported_props.iter().find(|(local, _)| local == name)
                {
                    let indent = &line[..line.len() - trimmed.len()];
                    result.push_str(&format!(
                        "{}let {} = $$props['{}'];",
                        indent, name, prop_name
                    ));
                    result.push('\n');
                    continue;
                }
            }
        }

        result.push_str(line);
        result.push('\n');
    }

    if result.ends_with('\n') && !script.ends_with('\n') {
        result.pop();
    }
    result
}

/// Find assignment `=` in a simple declarator (not inside parentheses, brackets, etc.)
fn find_simple_assignment(s: &str) -> Option<usize> {
    let chars: Vec<char> = s.chars().collect();
    let mut depth = 0;
    let mut in_string = false;
    let mut string_char = ' ';

    for (i, &c) in chars.iter().enumerate() {
        if (c == '"' || c == '\'' || c == '`') && (i == 0 || chars[i - 1] != '\\') {
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
            '(' | '[' | '{' => depth += 1,
            ')' | ']' | '}' => depth -= 1,
            '=' if depth == 0 => {
                let prev = if i > 0 { Some(chars[i - 1]) } else { None };
                let next = chars.get(i + 1).copied();
                if prev != Some('=')
                    && prev != Some('!')
                    && prev != Some('<')
                    && prev != Some('>')
                    && next != Some('=')
                    && next != Some('>')
                {
                    return Some(i);
                }
            }
            _ => {}
        }
    }

    None
}

/// Split comma-separated variable declarations into individual statements.
/// e.g., `const a = 1, b = 2, c = 3;` -> `const a = 1;\nconst b = 2;\nconst c = 3;`
///
/// This matches the official Svelte compiler's AST-based VariableDeclaration splitting
/// where each declarator becomes its own statement.
///
/// Handles both single-line and multi-line declarations:
/// ```js
/// let x = 'x',
///     y = 'y',
///     z = 'z';
/// ```
/// becomes:
/// ```js
/// let x = 'x';
/// let y = 'y';
/// let z = 'z';
/// ```
fn split_comma_separated_declarations(script: &str) -> String {
    let mut result = String::new();
    let lines: Vec<&str> = script.lines().collect();
    let mut i = 0;

    while i < lines.len() {
        let line = lines[i];
        let trimmed = line.trim();
        let indent = &line[..line.len() - line.trim_start().len()];

        // Check if this is a const/let/var declaration
        let is_export = trimmed.starts_with("export ");
        let decl_trimmed = if is_export {
            trimmed.strip_prefix("export ").unwrap().trim_start()
        } else {
            trimmed
        };

        let keyword = if decl_trimmed.starts_with("const ") {
            Some("const")
        } else if decl_trimmed.starts_with("let ") {
            Some("let")
        } else if decl_trimmed.starts_with("var ") {
            Some("var")
        } else {
            None
        };

        if let Some(kw) = keyword {
            // Accumulate multi-line declaration.
            // A declaration continues across lines if the line doesn't end with `;`
            // and we haven't reached a balanced state (all brackets closed + semicolon).
            let first_rest = decl_trimmed[kw.len()..].trim_start();
            let mut full_decl = first_rest.to_string();
            let mut line_idx = i;

            // Check if the declaration is complete (ends with `;` at balanced depth)
            while !is_declaration_complete(&full_decl) && line_idx + 1 < lines.len() {
                line_idx += 1;
                full_decl.push(' ');
                full_decl.push_str(lines[line_idx].trim());
            }

            let rest = full_decl.trim_end_matches(';');

            // Split by top-level commas
            let parts = split_top_level_commas(rest);

            if parts.len() > 1 {
                // Multiple declarators - split into individual statements
                let prefix = if is_export {
                    format!("export {} ", kw)
                } else {
                    format!("{} ", kw)
                };
                for (j, part) in parts.iter().enumerate() {
                    let part = part.trim();
                    if !part.is_empty() {
                        if j > 0 {
                            result.push('\n');
                        }
                        result.push_str(indent);
                        result.push_str(&prefix);
                        result.push_str(part);
                        result.push(';');
                    }
                }
                result.push('\n');
                i = line_idx + 1;
                continue;
            }
        }

        result.push_str(line);
        result.push('\n');
        i += 1;
    }

    // Remove trailing newline to match input behavior
    if result.ends_with('\n') {
        result.pop();
    }

    result
}

/// Check if a declaration string is complete.
/// A declaration is complete if all brackets are balanced AND either:
/// 1. It ends with `;`, OR
/// 2. It doesn't end with a continuation token (operator, comma, etc.)
fn is_declaration_complete(s: &str) -> bool {
    let trimmed = s.trim();
    if trimmed.is_empty() {
        return false;
    }

    // Check that all brackets/parens/braces are balanced
    let balanced = are_brackets_balanced(trimmed);

    // If brackets are not balanced, definitely not complete
    if !balanced {
        return false;
    }

    // If ends with semicolon and balanced, it's complete
    if trimmed.ends_with(';') {
        return true;
    }

    // If balanced but no semicolon, check if it ends with a continuation token
    // that would indicate the declaration continues on the next line
    let ends_with_continuation = trimmed.ends_with(',')
        || trimmed.ends_with('+')
        || trimmed.ends_with('-')
        || trimmed.ends_with('*')
        || trimmed.ends_with('/')
        || trimmed.ends_with('%')
        || trimmed.ends_with('&')
        || trimmed.ends_with('|')
        || trimmed.ends_with('^')
        || trimmed.ends_with('?')
        || trimmed.ends_with('=')
        || trimmed.ends_with("&&")
        || trimmed.ends_with("||")
        || trimmed.ends_with("=>");

    !ends_with_continuation
}

/// Check if all brackets/parens/braces are balanced in the string.
fn are_brackets_balanced(s: &str) -> bool {
    let mut depth = 0i32;
    let bytes = s.as_bytes();
    let mut i = 0;
    let len = bytes.len();
    while i < len {
        match bytes[i] {
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => depth -= 1,
            b'\'' | b'"' => {
                let quote = bytes[i];
                i += 1;
                while i < len && bytes[i] != quote {
                    if bytes[i] == b'\\' {
                        i += 1;
                    }
                    i += 1;
                }
            }
            b'`' => {
                i += 1;
                let mut tmpl_depth = 0i32;
                while i < len {
                    if bytes[i] == b'`' && tmpl_depth == 0 {
                        break;
                    }
                    if bytes[i] == b'\\' {
                        i += 1;
                    } else if bytes[i] == b'$' && i + 1 < len && bytes[i + 1] == b'{' {
                        tmpl_depth += 1;
                        i += 1;
                    } else if bytes[i] == b'}' && tmpl_depth > 0 {
                        tmpl_depth -= 1;
                    }
                    i += 1;
                }
            }
            _ => {}
        }
        i += 1;
    }
    depth == 0
}

/// Split a string by top-level commas, respecting nesting.
fn split_top_level_commas(s: &str) -> Vec<&str> {
    let mut parts = Vec::new();
    let mut depth = 0i32;
    let mut start = 0;
    let bytes = s.as_bytes();
    let mut i = 0;
    let len = bytes.len();

    while i < len {
        match bytes[i] {
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => depth -= 1,
            b'\'' | b'"' => {
                let quote = bytes[i];
                i += 1;
                while i < len && bytes[i] != quote {
                    if bytes[i] == b'\\' {
                        i += 1;
                    }
                    i += 1;
                }
            }
            b'`' => {
                i += 1;
                let mut tmpl_depth = 0i32;
                while i < len {
                    if bytes[i] == b'`' && tmpl_depth == 0 {
                        break;
                    }
                    if bytes[i] == b'\\' {
                        i += 1;
                    } else if bytes[i] == b'$' && i + 1 < len && bytes[i + 1] == b'{' {
                        tmpl_depth += 1;
                        i += 1;
                    } else if bytes[i] == b'}' && tmpl_depth > 0 {
                        tmpl_depth -= 1;
                    }
                    i += 1;
                }
            }
            b',' if depth == 0 => {
                parts.push(&s[start..i]);
                start = i + 1;
            }
            _ => {}
        }
        i += 1;
    }
    parts.push(&s[start..]);
    parts
}
