//! `svelte/no-unused-props` — report Props members that are never read.
//!
//! **Scope (LOCAL-FLAT only):**
//! - Local `interface Props { … }` or `type Props = { … }` without `extends`,
//!   intersection (`&`), generics, or imported member types.
//! - Destructure form (`const { a, b }: Props = $props()`) and
//!   whole-object form (`const props: Props = $props()`).

use std::path::Path;

use rsvelte_core::svelte_check::diagnostic::Diagnostic;

use crate::config::LintConfig;
use crate::line_index::LineIndex;
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::svelte_scan::{blank_comments, is_ident_byte, script_blocks, script_is_ts};
use crate::validator::{range_from_byte, to_dsev};

pub static META: RuleMeta = RuleMeta {
    name: "svelte/no-unused-props",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Off,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "report Props properties that are never read",
    options_schema: Some(
        r#"[{"type":"object","properties":{"checkImportedTypes":{"type":"boolean"},"ignoreTypePatterns":{"type":"array","items":{"type":"string"}},"ignorePropertyPatterns":{"type":"array","items":{"type":"string"}},"allowUnusedNestedProperties":{"type":"boolean"}},"additionalProperties":false}]"#,
    ),
};

pub fn diagnostics(source: &str, file: &Path, config: &LintConfig) -> Vec<Diagnostic> {
    let severity = config.resolve_code(META.name, META.default_severity);
    if severity == Severity::Off || !script_is_ts(source) {
        return Vec::new();
    }

    let li = LineIndex::new(source);
    let mut out = Vec::new();

    for block in script_blocks(source) {
        // Skip <script module> — $props() is never in the module context.
        if block.open_tag_attrs.contains("module") {
            continue;
        }
        let content = &source[block.content_start..block.content_end];
        let blanked = blank_comments(content);

        // 1. Find $props() with type annotation.
        let Some(props_info) = find_props_info(content, &blanked, block.content_start) else {
            continue;
        };

        // 2. Skip if rest element in destructure.
        if matches!(
            &props_info.form,
            PropForm::Destructure { has_rest: true, .. }
        ) {
            continue;
        }

        // 3. Resolve Props type body.
        let resolved = if props_info.type_name.trim_start().starts_with('{') {
            // Inline type literal.
            let type_name_in_content = props_info
                .type_abs_offset
                .saturating_sub(block.content_start);
            let brace_offset = content[type_name_in_content..]
                .find('{')
                .map(|r| type_name_in_content + r);
            let Some(brace_offset) = brace_offset else {
                continue;
            };
            extract_balanced_braces(content, brace_offset)
                .map(|body| (body, block.content_start + brace_offset))
        } else {
            let name = props_info.type_name.trim();
            // Skip if type name contains angle brackets (generic).
            if name.contains('<') {
                continue;
            }
            // Skip if type annotation text contains intersection.
            if props_info.type_name.contains('&') {
                continue;
            }
            // Skip if type name is imported.
            if is_type_imported(&blanked, name) {
                continue;
            }
            find_named_type_body_no_extends(content, &blanked, name, block.content_start)
        };

        let Some((body_text, body_abs_offset)) = resolved else {
            continue;
        };

        // 4. Parse members; skip if index signature present.
        let Some(members) = parse_prop_members(&body_text, body_abs_offset) else {
            continue;
        };
        if members.is_empty() {
            continue;
        }

        // 5. Check usage.
        match &props_info.form {
            PropForm::Destructure {
                pattern_open_brace_abs,
                pattern_text,
                ..
            } => {
                let destructured = parse_destructure_props(pattern_text);
                for member_name in &members {
                    if !destructured.contains(member_name.as_str()) {
                        let abs = *pattern_open_brace_abs as u32;
                        out.push(Diagnostic {
                            file: file.to_path_buf(),
                            severity: to_dsev(severity),
                            range: range_from_byte(&li, abs, abs),
                            message: format!("'{}' is an unused Props property.", member_name),
                            code: Some(META.name.to_string()),
                            source: "svelte",
                        });
                    }
                }
            }
            PropForm::WholeObject {
                var_name,
                var_abs_offset,
            } => {
                // Skip if the var is spread (whole object), e.g. {...props} or ...props.
                if has_whole_object_spread(source, var_name) {
                    continue;
                }
                for member_name in &members {
                    let dot_pat = format!("{}.{}", var_name, member_name);
                    let sq_pat = format!("{}['{}']", var_name, member_name);
                    let dq_pat = format!("{}[\"{}\"]", var_name, member_name);
                    let used = source.contains(dot_pat.as_str())
                        || source.contains(sq_pat.as_str())
                        || source.contains(dq_pat.as_str());
                    if !used {
                        let abs = *var_abs_offset as u32;
                        out.push(Diagnostic {
                            file: file.to_path_buf(),
                            severity: to_dsev(severity),
                            range: range_from_byte(&li, abs, abs),
                            message: format!("'{}' is an unused Props property.", member_name),
                            code: Some(META.name.to_string()),
                            source: "svelte",
                        });
                    }
                }
            }
        }
    }

    out
}

/// Check if the variable `var_name` appears in a whole-object spread context in
/// source (e.g. `{...props}`, `...props)`) where the next char after
/// `...{var_name}` is NOT `.`, `[`, or an identifier char.
fn has_whole_object_spread(source: &str, var_name: &str) -> bool {
    let pat = format!("...{}", var_name);
    let bytes = source.as_bytes();
    let vb = pat.as_bytes();
    let mut i = 0;
    while i + vb.len() <= bytes.len() {
        if bytes[i..i + vb.len()] == *vb {
            // Check next char.
            let next = bytes.get(i + vb.len()).copied();
            let next_is_member = next.is_some_and(|c| c == b'.' || c == b'[' || is_ident_byte(c));
            if !next_is_member {
                return true;
            }
        }
        i += 1;
    }
    false
}

enum PropForm {
    Destructure {
        pattern_open_brace_abs: usize,
        pattern_text: String,
        has_rest: bool,
    },
    WholeObject {
        var_name: String,
        var_abs_offset: usize,
    },
}

struct PropsInfo {
    type_name: String,
    type_abs_offset: usize,
    form: PropForm,
}

/// Find $props() call and extract the type annotation + declaration form.
fn find_props_info(content: &str, blanked: &str, content_start: usize) -> Option<PropsInfo> {
    let props_rel = blanked.find("$props()")?;
    let before_props = &blanked[..props_rel];
    let eq_rel = before_props.rfind('=')?;
    let before_eq = &blanked[..eq_rel];
    let colon_rel = find_type_colon_before(before_eq)?;

    let type_start_in_content = colon_rel + 1;
    let type_end_in_content = eq_rel;
    if type_start_in_content >= type_end_in_content {
        return None;
    }
    let type_text = content[type_start_in_content..type_end_in_content].trim();
    if type_text.is_empty() {
        return None;
    }

    // Find start of type text in content (skip leading whitespace).
    let type_abs_start = content_start
        + type_start_in_content
        + content[type_start_in_content..type_end_in_content]
            .find(|c: char| !c.is_whitespace())
            .unwrap_or(0);

    let before_colon = blanked[..colon_rel].trim_end();

    let form = if before_colon.ends_with('}') {
        // Destructure form: `const { a, b }: Props = $props()`.
        let close_brace_rel = blanked[..colon_rel].rfind('}')?;
        let open_brace_rel = find_matching_open_brace(blanked, close_brace_rel)?;
        let pattern_text = content[open_brace_rel..=close_brace_rel].to_string();
        let has_rest = pattern_text.contains("...");
        PropForm::Destructure {
            pattern_open_brace_abs: content_start + open_brace_rel,
            pattern_text,
            has_rest,
        }
    } else {
        // Whole-object form: `const props: Props = $props()`.
        let var_end_rel = before_colon.len();
        // Find start of var name (walk back over identifier chars).
        let var_name_start = blanked[..var_end_rel]
            .rfind(|c: char| !is_ident_byte(c as u8))
            .map(|i| i + 1)
            .unwrap_or(0);
        let var_name = content[var_name_start..var_end_rel].trim().to_string();
        if var_name.is_empty()
            || !var_name
                .chars()
                .all(|c| c.is_alphanumeric() || c == '_' || c == '$')
        {
            return None;
        }
        PropForm::WholeObject {
            var_abs_offset: content_start + var_name_start,
            var_name,
        }
    };

    Some(PropsInfo {
        type_name: type_text.to_string(),
        type_abs_offset: type_abs_start,
        form,
    })
}

/// Find the `{` that matches the `}` at `close_pos` in `s` by scanning
/// right-to-left.
fn find_matching_open_brace(s: &str, close_pos: usize) -> Option<usize> {
    let bytes = s.as_bytes();
    let mut depth = 0i32;
    let mut i = close_pos;
    loop {
        match bytes[i] {
            b'}' => depth += 1,
            b'{' => {
                depth -= 1;
                if depth == 0 {
                    return Some(i);
                }
            }
            _ => {}
        }
        if i == 0 {
            break;
        }
        i -= 1;
    }
    None
}

/// Check if `name` appears in an import statement in the blanked script content.
fn is_type_imported(blanked: &str, name: &str) -> bool {
    let nb = name.as_bytes();
    let bytes = blanked.as_bytes();
    let mut i = 0;
    while i + 6 <= bytes.len() {
        if &bytes[i..i + 6] == b"import" {
            let before_ok = i == 0 || !is_ident_byte(bytes[i - 1]);
            if before_ok {
                let end = blanked[i..]
                    .find(';')
                    .map(|r| i + r + 1)
                    .or_else(|| blanked[i..].find('\n').map(|r| i + r + 1))
                    .unwrap_or(blanked.len());
                let import_stmt = &blanked[i..end];
                if let Some(name_pos) = import_stmt.find(name) {
                    let before_ok2 =
                        name_pos == 0 || !is_ident_byte(import_stmt.as_bytes()[name_pos - 1]);
                    let after_ok = name_pos + nb.len() >= import_stmt.len()
                        || !is_ident_byte(import_stmt.as_bytes()[name_pos + nb.len()]);
                    if before_ok2 && after_ok {
                        return true;
                    }
                }
                i = end;
                continue;
            }
        }
        i += 1;
    }
    false
}

/// Find the Props type body for a named type, skipping if it has `extends` or
/// `&` (intersection) between the name and the opening brace.
fn find_named_type_body_no_extends(
    content: &str,
    blanked: &str,
    name: &str,
    content_start: usize,
) -> Option<(String, usize)> {
    let nb = name.as_bytes();
    let bytes = blanked.as_bytes();

    for kw in ["interface", "type"] {
        let mut search_from = 0usize;
        while let Some(rel) = blanked[search_from..].find(kw) {
            let kw_start = search_from + rel;
            let kw_end = kw_start + kw.len();
            let before_ok = kw_start == 0 || !is_ident_byte(bytes[kw_start - 1]);
            if !before_ok {
                search_from = kw_end;
                continue;
            }
            // After keyword, skip whitespace, match name.
            let rest = blanked[kw_end..].trim_start();
            let rest_start = kw_end + (blanked[kw_end..].len() - rest.len());
            if !rest.as_bytes().starts_with(nb) {
                search_from = kw_end;
                continue;
            }
            let after_name = rest_start + nb.len();
            let after_char = bytes.get(after_name).copied();
            if after_char.is_some_and(is_ident_byte) {
                search_from = kw_end;
                continue;
            }
            // For `type`, find `=` first.
            let search_brace_from = if kw == "type" {
                blanked[after_name..]
                    .find('=')
                    .map(|r| after_name + r + 1)?
            } else {
                after_name
            };
            // Find the opening `{`.
            let open_brace_rel = blanked[search_brace_from..].find('{')?;
            let open_brace = search_brace_from + open_brace_rel;
            // Check for `extends` or `&` between name-end and `{`.
            let between = &blanked[after_name..open_brace];
            if between.contains("extends") || between.contains('&') {
                return None;
            }
            let body = extract_balanced_braces(content, open_brace)?;
            return Some((body, content_start + open_brace));
        }
    }
    None
}

/// Extract balanced `{…}` block from `content` at `start`.
fn extract_balanced_braces(content: &str, start: usize) -> Option<String> {
    let bytes = content.as_bytes();
    if bytes.get(start) != Some(&b'{') {
        return None;
    }
    let mut depth = 0i32;
    let mut i = start;
    while i < bytes.len() {
        match bytes[i] {
            b'{' => depth += 1,
            b'}' => {
                depth -= 1;
                if depth == 0 {
                    return Some(content[start..=i].to_string());
                }
            }
            _ => {}
        }
        i += 1;
    }
    None
}

/// Find the `:` before the type annotation by scanning right-to-left.
/// Handles nested `<>`, `{}`, `()`.
fn find_type_colon_before(s: &str) -> Option<usize> {
    let bytes = s.as_bytes();
    let mut depth_brace: i32 = 0;
    let mut depth_angle: i32 = 0;
    let mut depth_paren: i32 = 0;
    let mut i = bytes.len();
    while i > 0 {
        i -= 1;
        match bytes[i] {
            b'}' => depth_brace += 1,
            b'{' if depth_brace > 0 => depth_brace -= 1,
            b'{' => {
                // The `{` in destructuring `let { x }: ...` — stop here.
                break;
            }
            b'>' => depth_angle += 1,
            b'<' if depth_angle > 0 => depth_angle -= 1,
            b')' => depth_paren += 1,
            b'(' if depth_paren > 0 => depth_paren -= 1,
            b':' if depth_brace == 0 && depth_angle == 0 && depth_paren == 0 => {
                return Some(i);
            }
            _ => {}
        }
    }
    None
}

/// Parse member names from a type body `{ … }`.
/// Returns `None` if an index signature is present (skip the whole check).
fn parse_prop_members(body: &str, _body_abs_offset: usize) -> Option<Vec<String>> {
    let inner = if body.starts_with('{') && body.ends_with('}') {
        &body[1..body.len() - 1]
    } else {
        body
    };

    let mut members = Vec::new();
    let segments = split_top_level(inner, b";\n,");

    for seg in segments {
        let seg = seg.trim();
        if seg.is_empty() {
            continue;
        }
        // Index signature: starts with `[`
        if seg.starts_with('[') {
            // Index signature present — skip this entire type (return None).
            return None;
        }
        if let Some(name) = extract_member_name(seg) {
            members.push(name);
        }
    }

    Some(members)
}

/// Extract the property name from a type member segment.
fn extract_member_name(seg: &str) -> Option<String> {
    let seg = seg.trim();
    if seg.is_empty() {
        return None;
    }
    let bytes = seg.as_bytes();

    // Quoted name: 'foo' or "foo"
    if bytes[0] == b'\'' || bytes[0] == b'"' {
        let q = bytes[0];
        let end = bytes[1..].iter().position(|&c| c == q)?;
        return Some(seg[1..end + 1].to_string());
    }

    // Plain identifier (possibly followed by `?`, `:`, `(`)
    let name_end = bytes
        .iter()
        .position(|&c| !is_ident_byte(c))
        .unwrap_or(bytes.len());
    if name_end == 0 {
        return None;
    }
    Some(seg[..name_end].to_string())
}

/// Split at top-level occurrences of any delimiter byte, respecting nesting of
/// `{}`, `()`, `<>`, `[]`, and string literals.
fn split_top_level<'a>(s: &'a str, delimiters: &[u8]) -> Vec<&'a str> {
    let bytes = s.as_bytes();
    let mut parts = Vec::new();
    let mut depth_brace: i32 = 0;
    let mut depth_paren: i32 = 0;
    let mut depth_angle: i32 = 0;
    let mut depth_bracket: i32 = 0;
    let mut start = 0;
    let mut in_string: Option<u8> = None;

    for i in 0..bytes.len() {
        if let Some(q) = in_string {
            if bytes[i] == q {
                in_string = None;
            }
            continue;
        }
        match bytes[i] {
            b'\'' | b'"' | b'`' => in_string = Some(bytes[i]),
            b'{' => depth_brace += 1,
            b'}' if depth_brace > 0 => depth_brace -= 1,
            b'(' => depth_paren += 1,
            b')' if depth_paren > 0 => depth_paren -= 1,
            b'<' => depth_angle += 1,
            b'>' if depth_angle > 0 => depth_angle -= 1,
            b'[' => depth_bracket += 1,
            b']' if depth_bracket > 0 => depth_bracket -= 1,
            c if depth_brace == 0
                && depth_paren == 0
                && depth_angle == 0
                && depth_bracket == 0
                && delimiters.contains(&c) =>
            {
                parts.push(&s[start..i]);
                start = i + 1;
            }
            _ => {}
        }
    }
    if start <= s.len() {
        parts.push(&s[start..]);
    }
    parts
}

/// Parse the destructure pattern to get the set of original prop key names.
fn parse_destructure_props(pattern: &str) -> std::collections::HashSet<String> {
    let inner = if pattern.starts_with('{') && pattern.ends_with('}') {
        &pattern[1..pattern.len() - 1]
    } else {
        pattern
    };

    let mut props = std::collections::HashSet::new();
    let segments = split_top_level(inner, b",");
    for seg in segments {
        let seg = seg.trim();
        if seg.is_empty() || seg.starts_with("...") {
            continue;
        }
        if let Some(name) = extract_destructure_prop_name(seg) {
            props.insert(name);
        }
    }
    props
}

/// Extract the ORIGINAL key (not alias) from a destructure pattern segment.
fn extract_destructure_prop_name(seg: &str) -> Option<String> {
    let seg = seg.trim();
    if seg.is_empty() {
        return None;
    }
    let bytes = seg.as_bytes();

    // Quoted key: `'foo'` or `"foo"` (possibly aliased: `'foo': bar`)
    if bytes[0] == b'\'' || bytes[0] == b'"' {
        let q = bytes[0];
        let end = bytes[1..].iter().position(|&c| c == q)?;
        return Some(seg[1..end + 1].to_string());
    }

    // Plain identifier (take just the name, not `= default` or `: alias` or
    // nested `{ ... }`)
    let name_end = bytes
        .iter()
        .position(|&c| !is_ident_byte(c))
        .unwrap_or(bytes.len());
    if name_end == 0 {
        return None;
    }
    Some(seg[..name_end].to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn members_from_interface_body() {
        let m = parse_prop_members("{ test: string; 'aria-label'?: string }", 0).unwrap();
        assert!(m.contains(&"test".to_string()));
        assert!(m.contains(&"aria-label".to_string()));
    }

    #[test]
    fn index_signature_body_skips() {
        // An index signature means we can't enumerate members → skip (None).
        assert!(parse_prop_members("{ [key: string]: unknown }", 0).is_none());
    }

    #[test]
    fn destructure_props_handle_aliases_and_quotes() {
        let p = parse_destructure_props("{ a, b: alias, 'aria-label': foo, ...rest }");
        assert!(p.contains("a"));
        assert!(p.contains("b")); // original key, not the alias
        assert!(p.contains("aria-label"));
        assert!(!p.contains("alias"));
        assert!(!p.contains("rest"));
    }

    #[test]
    fn whole_object_spread_detected() {
        assert!(has_whole_object_spread("foo({ ...props })", "props"));
        assert!(has_whole_object_spread("bar(...props)", "props"));
        // `...props.foo` is a member spread, not a whole-object spread.
        assert!(!has_whole_object_spread("baz({ ...props.foo })", "props"));
    }
}
