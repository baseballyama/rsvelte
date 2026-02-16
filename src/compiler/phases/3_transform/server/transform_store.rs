//! Store transformation functions for server-side rendering.
//!
//! This module contains functions that handle store subscriptions and assignments
//! for server-side code generation, including `$store` -> `$.store_get()` transforms
//! and store assignment transforms.

/// Replace store identifier in an expression with $.store_get() call.
pub(crate) fn replace_store_identifier(expr: &str, store_ref: &str, store_name: &str) -> String {
    let mut result = String::with_capacity(expr.len() * 2);
    let chars: Vec<char> = expr.chars().collect();
    let store_ref_chars: Vec<char> = store_ref.chars().collect();
    let store_ref_len = store_ref_chars.len();
    let mut i = 0;

    while i < chars.len() {
        if i + store_ref_len <= chars.len() {
            let mut matches = true;
            for (j, ref_char) in store_ref_chars.iter().enumerate() {
                if chars[i + j] != *ref_char {
                    matches = false;
                    break;
                }
            }

            if matches {
                let prev_is_ident = if i > 0 {
                    is_js_identifier_char(chars[i - 1])
                } else {
                    false
                };
                let next_is_ident = if i + store_ref_len < chars.len() {
                    is_js_identifier_char(chars[i + store_ref_len])
                } else {
                    false
                };

                if !prev_is_ident && !next_is_ident {
                    result.push_str(&format!(
                        "$.store_get($$store_subs ??= {{}}, '{}', {})",
                        store_ref, store_name
                    ));
                    i += store_ref_len;
                    continue;
                }
            }
        }

        result.push(chars[i]);
        i += 1;
    }

    result
}

/// Replace store identifier in script content with $.store_get() call.
pub(crate) fn replace_store_identifier_in_script(
    script: &str,
    store_ref: &str,
    store_name: &str,
) -> String {
    let mut result = String::with_capacity(script.len() * 2);
    let chars: Vec<char> = script.chars().collect();
    let store_ref_chars: Vec<char> = store_ref.chars().collect();
    let store_ref_len = store_ref_chars.len();
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
            result.push(c);
            i += 1;
            continue;
        }

        if in_string {
            result.push(c);
            i += 1;
            continue;
        }

        if i + store_ref_len <= chars.len() {
            let mut matches = true;
            for (j, ref_char) in store_ref_chars.iter().enumerate() {
                if chars[i + j] != *ref_char {
                    matches = false;
                    break;
                }
            }

            if matches {
                let prev_is_ident = if i > 0 {
                    is_js_identifier_char(chars[i - 1])
                } else {
                    false
                };
                let next_is_ident = if i + store_ref_len < chars.len() {
                    is_js_identifier_char(chars[i + store_ref_len])
                } else {
                    false
                };

                let mut j = i + store_ref_len;
                while j < chars.len() && chars[j].is_whitespace() {
                    j += 1;
                }
                let is_assignment = j < chars.len()
                    && (chars[j] == '='
                        || (j + 1 < chars.len()
                            && chars[j + 1] == '='
                            && (chars[j] == '+'
                                || chars[j] == '-'
                                || chars[j] == '*'
                                || chars[j] == '/'
                                || chars[j] == '%'))
                        || (chars[j] == '+' && j + 1 < chars.len() && chars[j + 1] == '+')
                        || (chars[j] == '-' && j + 1 < chars.len() && chars[j + 1] == '-'));

                let is_comparison = j < chars.len()
                    && chars[j] == '='
                    && ((j + 1 < chars.len() && chars[j + 1] == '=')
                        || (i > 0
                            && (chars[i - 1] == '!'
                                || chars[i - 1] == '='
                                || chars[i - 1] == '<'
                                || chars[i - 1] == '>')));

                if !prev_is_ident && !next_is_ident && (!is_assignment || is_comparison) {
                    let preceding: String = result.chars().collect();
                    let is_in_store_call =
                        preceding.ends_with("$.store_set(") || preceding.ends_with("$.store_get(");

                    if !is_in_store_call {
                        result.push_str(&format!(
                            "$.store_get($$store_subs ??= {{}}, '{}', {})",
                            store_ref, store_name
                        ));
                        i += store_ref_len;
                        continue;
                    }
                }
            }
        }

        result.push(chars[i]);
        i += 1;
    }

    result
}

/// Check if a character is a valid JavaScript identifier character.
fn is_js_identifier_char(c: char) -> bool {
    c.is_alphanumeric() || c == '_' || c == '$'
}

/// Transform store assignments in script content for server-side rendering.
pub(crate) fn transform_store_assignments(script: &str) -> String {
    use regex::Regex;
    use std::sync::LazyLock;

    static STORE_ASSIGN_RE: LazyLock<Regex> = LazyLock::new(|| {
        Regex::new(r"\$([a-zA-Z_][a-zA-Z0-9_]*)\s*(\+\+|--|\+=|-=|\*=|/=|%=|&=|\|=|\^=|<<=|>>=|>>>=|\?\?=|&&=|\|\|=|=)\s*").unwrap()
    });

    static PREFIX_OP_RE: LazyLock<Regex> =
        LazyLock::new(|| Regex::new(r"(\+\+|--)\$([a-zA-Z_][a-zA-Z0-9_]*)").unwrap());

    let mut result = script.to_string();

    result = PREFIX_OP_RE
        .replace_all(&result, |caps: &regex::Captures| {
            let op = &caps[1];
            let store_name = &caps[2];
            if op == "++" {
                format!(
                    "$.update_store_pre($$store_subs ??= {{}}, '${0}', {0})",
                    store_name
                )
            } else {
                format!(
                    "$.update_store_pre($$store_subs ??= {{}}, '${0}', {0}, -1)",
                    store_name
                )
            }
        })
        .to_string();

    let mut new_result = String::new();
    let mut last_end = 0;

    for cap in STORE_ASSIGN_RE.captures_iter(&result) {
        let full_match = cap.get(0).unwrap();
        let start = full_match.start();
        let end = full_match.end();

        if start < last_end {
            continue;
        }

        let preceding = &result[..start];
        if preceding.ends_with("$.store_set(") || preceding.ends_with("$.store_get(") {
            continue;
        }

        if preceding.ends_with('$') {
            continue;
        }

        new_result.push_str(&result[last_end..start]);

        let store_name = &cap[1];
        let operator = &cap[2];

        match operator {
            "++" | "--" => {
                if operator == "++" {
                    new_result.push_str(&format!(
                        "$.update_store($$store_subs ??= {{}}, '${0}', {0})",
                        store_name
                    ));
                } else {
                    new_result.push_str(&format!(
                        "$.update_store($$store_subs ??= {{}}, '${0}', {0}, -1)",
                        store_name
                    ));
                }
            }
            "=" => {
                let rest = &result[end..];
                let value_end = find_statement_end(rest);
                let value = rest[..value_end].trim();
                new_result.push_str(&format!("$.store_set({}, {})", store_name, value));
                last_end = end + value_end;
                continue;
            }
            _ => {
                let base_op = &operator[..operator.len() - 1];
                let rest = &result[end..];
                let value_end = find_statement_end(rest);
                let value = rest[..value_end].trim();
                new_result.push_str(&format!(
                    "$.store_set({}, $.store_get($$store_subs ??= {{}}, '${0}', {0}) {} {})",
                    store_name, base_op, value
                ));
                last_end = end + value_end;
                continue;
            }
        }

        last_end = end;
    }

    new_result.push_str(&result[last_end..]);

    new_result
}

fn find_statement_end(s: &str) -> usize {
    let mut depth = 0;
    let chars: Vec<char> = s.chars().collect();
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
            ')' | ']' | '}' => {
                if depth > 0 {
                    depth -= 1;
                }
            }
            ';' | '\n' if depth == 0 => return i,
            _ => {}
        }
    }

    s.len()
}
