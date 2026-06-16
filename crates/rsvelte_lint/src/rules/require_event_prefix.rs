//! `svelte/require-event-prefix` — require that all function-typed component
//! props whose name does not start with `on` are reported as violating the
//! convention. Port of the eslint-plugin-svelte rule.
//!
//! Works as a source-scan meta-rule in [`crate::runner::lint_source`]:
//! 1. Gate on TS component.
//! 2. Find `$props()` with a type annotation (`let {…}: <TYPE> = $props()`).
//! 3. Resolve `<TYPE>` — either an inline type literal or a named interface/type alias.
//! 4. For each member in the type body, classify it as function-typed.
//! 5. If the name doesn't start with `on` and it's a function (and not async
//!    unless `checkAsyncFunctions` is true), report at the member's name position.
//!
//! "Async" means the return type is `Promise<…>`.

use std::path::Path;

use rsvelte_core::svelte_check::diagnostic::Diagnostic;

use crate::config::LintConfig;
use crate::line_index::LineIndex;
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::svelte_scan::{blank_comments, is_ident_byte, script_blocks, script_is_ts};
use crate::validator::{range_from_byte, to_dsev};

pub static META: RuleMeta = RuleMeta {
    name: "svelte/require-event-prefix",
    category: RuleCategory::Style,
    fixable: Fixable::No,
    // upstream `recommended: false` → opt-in only
    default_severity: Severity::Off,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "require component event prop names to start with \"on\"",
    options_schema: None,
};

/// Options parsed from the rule config.
struct Options {
    check_async_functions: bool,
}

impl Options {
    fn from_config(config: &LintConfig) -> Self {
        let check_async_functions = config
            .options_for(META.name)
            .and_then(|v| v.get(0))
            .and_then(|v| v.get("checkAsyncFunctions"))
            .and_then(|v| v.as_bool())
            .unwrap_or(false);
        Options {
            check_async_functions,
        }
    }
}

pub fn diagnostics(source: &str, file: &Path, config: &LintConfig) -> Vec<Diagnostic> {
    let severity = config.resolve_code(META.name, META.default_severity);
    if severity == Severity::Off || !script_is_ts(source) {
        return Vec::new();
    }
    let opts = Options::from_config(config);
    let li = LineIndex::new(source);
    let mut out = Vec::new();

    for block in script_blocks(source) {
        let content = &source[block.content_start..block.content_end];
        let blanked = blank_comments(content);

        // Find `$props()` call with type annotation.
        // Patterns: `let {…}: <TYPE> = $props()` or `let x: <TYPE> = $props()`.
        // We look for `: <TYPE> = $props()` where TYPE ends just before `=`.
        let Some((type_text, type_abs_offset)) =
            find_props_type(content, &blanked, block.content_start)
        else {
            continue;
        };

        // Resolve the type body: either inline `{ … }` or named type reference.
        let resolved: Option<(String, usize)> = if type_text.trim_start().starts_with('{') {
            // Inline type literal — extract the balanced `{ … }` block from content.
            // `type_abs_offset` is the absolute offset of the `{`.
            let pos_in_content = type_abs_offset - block.content_start;
            extract_balanced_braces(content, pos_in_content).map(|body| (body, type_abs_offset))
        } else {
            // Named reference — find `interface <name> { … }` or `type <name> = { … }`
            // in the script content.
            let name = type_text.trim();
            find_named_type_body(content, &blanked, name, block.content_start)
        };

        let Some((body_text, body_abs_offset)) = resolved else {
            continue;
        };

        // Parse members from the type body.
        for member in parse_type_members(&body_text, body_abs_offset) {
            if member.name.starts_with("on") {
                continue;
            }
            if !member.is_function {
                continue;
            }
            if member.is_async && !opts.check_async_functions {
                continue;
            }
            let abs = member.name_abs_offset as u32;
            out.push(Diagnostic {
                file: file.to_path_buf(),
                severity: to_dsev(severity),
                range: range_from_byte(&li, abs, abs),
                message: "Component event name must start with \"on\".".to_string(),
                code: Some(META.name.to_string()),
                source: "svelte",
            });
        }
    }

    out
}

/// A classified member extracted from a type body.
struct TypeMember {
    /// The member's name (unquoted).
    name: String,
    /// Absolute byte offset of the member's name in the full source.
    name_abs_offset: usize,
    /// Whether this member is function-typed.
    is_function: bool,
    /// Whether the function's return type is `Promise<…>`.
    is_async: bool,
}

/// Find the type annotation for `$props()` in the script content.
/// Returns `(type_text, absolute_byte_offset_of_type_text_start)`.
///
/// Scans for `$props()` and walks backward to find `: <TYPE> =`.
fn find_props_type<'a>(
    content: &'a str,
    blanked: &str,
    content_start: usize,
) -> Option<(&'a str, usize)> {
    // Find `$props()` in the blanked content (ignores comments).
    let props_rel = blanked.find("$props()")?;
    // Walk backwards from `$props()` to find the `: <TYPE> =` pattern.
    // We need to find the `=` just before `$props()`, then the `:` before that.
    let before_props = &blanked[..props_rel];
    // Find the `=` preceding `$props()`.
    let eq_rel = before_props.rfind('=')?;
    let before_eq = &blanked[..eq_rel];
    // Find the `:` that starts the type annotation — scan backwards from `=`.
    let colon_rel = find_type_colon_before(before_eq)?;
    // The type text is between `:` and `=`.
    let type_start = colon_rel + 1; // after the `:`
    let type_end = eq_rel;
    if type_start > type_end {
        return None;
    }
    if content[type_start..type_end].trim().is_empty() {
        return None;
    }
    // Find first non-whitespace after the colon.
    let type_text_start = content[type_start..type_end]
        .char_indices()
        .find(|(_, c)| !c.is_whitespace())
        .map(|(i, _)| type_start + i)
        .unwrap_or(type_start);
    let type_text = &content[type_text_start..type_end];
    Some((type_text, content_start + type_text_start))
}

/// Find the byte offset of `:` (in a type annotation context) before `eq_end`
/// in `blanked`. Handles nested `<>`, `{}`, `()` correctly by scanning
/// right-to-left.
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
            b'{' => {
                if depth_brace > 0 {
                    depth_brace -= 1;
                } else {
                    // The `{` in destructuring `let { x }: ...` — stop here
                    // because this is the props destructuring, not part of the type.
                    break;
                }
            }
            b'>' => depth_angle += 1,
            b'<' if depth_angle > 0 => {
                depth_angle -= 1;
            }
            b')' => depth_paren += 1,
            b'(' if depth_paren > 0 => {
                depth_paren -= 1;
            }
            b':' if depth_brace == 0 && depth_angle == 0 && depth_paren == 0 => {
                return Some(i);
            }
            _ => {}
        }
    }
    None
}

/// Find the body of a named type (`interface Name { … }` or `type Name = { … }`)
/// in the script content. Returns `(body_including_braces, abs_offset_of_open_brace)`.
fn find_named_type_body(
    content: &str,
    blanked: &str,
    name: &str,
    content_start: usize,
) -> Option<(String, usize)> {
    let nb = name.as_bytes();
    let bytes = blanked.as_bytes();

    // Try `interface <name>` first.
    for kw in ["interface", "type"] {
        let mut search_from = 0;
        while let Some(rel) = blanked[search_from..].find(kw) {
            let kw_start = search_from + rel;
            let kw_end = kw_start + kw.len();
            let before_ok = kw_start == 0 || !is_ident_byte(bytes[kw_start - 1]);
            if !before_ok {
                search_from = kw_end;
                continue;
            }
            // After keyword, skip whitespace, then match name.
            let rest = blanked[kw_end..].trim_start();
            let rest_start = kw_end + (blanked[kw_end..].len() - rest.len());
            if !rest.as_bytes().starts_with(nb) {
                search_from = kw_end;
                continue;
            }
            let after_name = rest_start + nb.len();
            // Name must end at a non-ident boundary.
            let after_char = bytes.get(after_name).copied();
            if after_char.is_some_and(is_ident_byte) {
                search_from = kw_end;
                continue;
            }
            // For `interface`, find `{` directly after name (possibly with extends clause).
            // For `type`, find `=` then `{`.
            let search_brace_from = if kw == "type" {
                // Skip `= ` or `extends … {`
                blanked[after_name..]
                    .find('=')
                    .map(|r| after_name + r + 1)?
            } else {
                after_name
            };
            // Find the opening `{`.
            let brace_start = blanked[search_brace_from..].find('{')?;
            let open_brace = search_brace_from + brace_start;
            // Extract the balanced `{ … }` body from the ORIGINAL (un-blanked) content.
            let body = extract_balanced_braces(content, open_brace)?;
            return Some((body, content_start + open_brace));
        }
    }
    None
}

/// Extract a balanced `{…}` block from `content` starting at byte `start`
/// (which must be the `{`). Returns the full `{…}` text including braces.
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

/// Parse members from a type body `{ … }`, returning classified `TypeMember`s.
/// `body_abs_offset` is the absolute offset of the leading `{` in the full source.
fn parse_type_members(body: &str, body_abs_offset: usize) -> Vec<TypeMember> {
    // The body includes the outer `{` and `}`.
    // Strip them.
    let inner = if body.starts_with('{') && body.ends_with('}') {
        &body[1..body.len() - 1]
    } else {
        body
    };
    // The inner starts at body_abs_offset + 1.
    let inner_abs = body_abs_offset + 1;

    split_type_members(inner, inner_abs)
}

/// Split the inner content of a type body into members at top-level `;` or newlines.
/// Returns classified `TypeMember`s.
fn split_type_members(inner: &str, inner_abs: usize) -> Vec<TypeMember> {
    let mut members = Vec::new();
    let bytes = inner.as_bytes();
    let mut i = 0;
    let mut member_start = 0;

    while i <= bytes.len() {
        let at_boundary = if i == bytes.len() {
            true
        } else {
            match bytes[i] {
                b';' | b'\n' => top_level_position(bytes, i),
                b',' => top_level_position(bytes, i),
                _ => false,
            }
        };

        if at_boundary {
            let segment = inner[member_start..i].trim();
            if !segment.is_empty() {
                // Find the offset of the segment within `inner`.
                let seg_start_in_inner = inner[member_start..i]
                    .char_indices()
                    .find(|(_, c)| !c.is_whitespace())
                    .map(|(off, _)| member_start + off)
                    .unwrap_or(member_start);
                if let Some(m) = classify_member(segment, inner_abs + seg_start_in_inner) {
                    members.push(m);
                }
            }
            member_start = i + 1;
        }
        i += 1;
    }
    members
}

/// Check if position `i` in `bytes` is at the top level (depth 0 for `{}`, `()`, `<>`).
fn top_level_position(bytes: &[u8], i: usize) -> bool {
    let mut depth_brace = 0i32;
    let mut depth_paren = 0i32;
    let mut depth_angle = 0i32;
    for &b in &bytes[..i] {
        match b {
            b'{' => depth_brace += 1,
            b'}' => depth_brace -= 1,
            b'(' => depth_paren += 1,
            b')' => depth_paren -= 1,
            b'<' => depth_angle += 1,
            b'>' => depth_angle -= 1,
            _ => {}
        }
    }
    depth_brace == 0 && depth_paren == 0 && depth_angle == 0
}

/// Classify a type member segment, returning a `TypeMember` if it has a name.
///
/// Handles:
/// - Method signature: `name(…): RetType` or `name?(…): RetType`
/// - Property with function type: `name: (…) => RetType` or `name?: (…) => RetType`
/// - NOT function: `name: any`, `name: number`, `name: string`, etc.
fn classify_member(segment: &str, name_abs_offset: usize) -> Option<TypeMember> {
    let bytes = segment.as_bytes();

    // Extract the leading name (identifier chars, then optionally `?`).
    let name_end = bytes
        .iter()
        .position(|&c| !is_ident_byte(c))
        .unwrap_or(bytes.len());
    if name_end == 0 {
        return None;
    }
    let name = &segment[..name_end];
    // Skip `[` — computed property names not supported.
    if name.starts_with('[') {
        return None;
    }
    let rest = segment[name_end..].trim_start();

    // Skip `?` if present.
    let rest = rest.strip_prefix('?').map(str::trim_start).unwrap_or(rest);

    // Method signature: `name(…)` — next char is `(`
    if rest.starts_with('(') {
        // Find the return type (after the closing `)` and `:`)
        let ret_type = extract_return_type_after_params(rest);
        let is_async = ret_type.map(is_promise_type).unwrap_or(false);
        return Some(TypeMember {
            name: name.to_string(),
            name_abs_offset,
            is_function: true,
            is_async,
        });
    }

    // Property: `name: <type>` or `name?: <type>` — next is `:`
    if let Some(value_type) = rest.strip_prefix(':').map(str::trim_start) {
        // Check if the value type is a function type (arrow function).
        let (is_fn, is_async) = classify_type_value(value_type);
        return Some(TypeMember {
            name: name.to_string(),
            name_abs_offset,
            is_function: is_fn,
            is_async,
        });
    }

    None
}

/// Extract the return type from after the parameter list in a method signature.
/// `rest` starts with `(`. Returns the return type text after `) :`.
fn extract_return_type_after_params(rest: &str) -> Option<&str> {
    let bytes = rest.as_bytes();
    // Find the matching `)`.
    let mut depth = 0i32;
    let mut i = 0;
    while i < bytes.len() {
        match bytes[i] {
            b'(' => depth += 1,
            b')' => {
                depth -= 1;
                if depth == 0 {
                    // After `)`, look for `: <RetType>`
                    let after_paren = rest[i + 1..].trim_start();
                    return after_paren.strip_prefix(':').map(str::trim_start);
                }
            }
            _ => {}
        }
        i += 1;
    }
    None
}

/// Classify a type value (the RHS of `name: <type>`).
/// Returns `(is_function, is_async)`.
fn classify_type_value(type_str: &str) -> (bool, bool) {
    let t = type_str.trim();
    // `any` — not a function type.
    if t == "any" {
        return (false, false);
    }
    // Arrow function type: starts with `(` or a type parameter `<`.
    // Pattern: `(…) => RetType` or `<T>(…) => RetType`.
    // We look for `=>` at the top level.
    let bytes = t.as_bytes();
    let mut depth_paren = 0i32;
    let mut depth_angle = 0i32;
    let mut depth_brace = 0i32;
    let mut i = 0;
    while i + 1 < bytes.len() {
        match bytes[i] {
            b'(' => depth_paren += 1,
            b')' => depth_paren -= 1,
            b'<' => depth_angle += 1,
            b'>' if depth_angle > 0 => depth_angle -= 1,
            b'{' => depth_brace += 1,
            b'}' => depth_brace -= 1,
            b'=' if depth_paren == 0
                && depth_angle == 0
                && depth_brace == 0
                && bytes[i + 1] == b'>' =>
            {
                // Found `=>` at top level — this is an arrow function type.
                let ret = t[i + 2..].trim();
                let is_async = is_promise_type(ret);
                return (true, is_async);
            }
            _ => {}
        }
        i += 1;
    }
    // No `=>` found — not a function type.
    (false, false)
}

/// Whether a type string represents `Promise<…>`.
fn is_promise_type(type_str: &str) -> bool {
    let t = type_str.trim();
    t.starts_with("Promise<") || t.starts_with("Promise <")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn classify_method_signature() {
        // `custom(): void` → function, not async
        let m = classify_member("custom(): void", 0).unwrap();
        assert_eq!(m.name, "custom");
        assert!(m.is_function);
        assert!(!m.is_async);
    }

    #[test]
    fn classify_arrow_function_property() {
        // `custom: () => void` → function, not async
        let m = classify_member("custom: () => void", 0).unwrap();
        assert_eq!(m.name, "custom");
        assert!(m.is_function);
        assert!(!m.is_async);
    }

    #[test]
    fn classify_async_method() {
        // `custom(): Promise<void>` → function, async
        let m = classify_member("custom(): Promise<void>", 0).unwrap();
        assert_eq!(m.name, "custom");
        assert!(m.is_function);
        assert!(m.is_async);
    }

    #[test]
    fn classify_async_arrow() {
        // `custom: () => Promise<void>` → function, async
        let m = classify_member("custom: () => Promise<void>", 0).unwrap();
        assert_eq!(m.name, "custom");
        assert!(m.is_function);
        assert!(m.is_async);
    }

    #[test]
    fn classify_any_type() {
        // `custom: any` → not a function
        let m = classify_member("custom: any", 0).unwrap();
        assert_eq!(m.name, "custom");
        assert!(!m.is_function);
    }

    #[test]
    fn classify_number_type() {
        // `custom: number` → not a function
        let m = classify_member("custom: number", 0).unwrap();
        assert_eq!(m.name, "custom");
        assert!(!m.is_function);
    }

    #[test]
    fn classify_prefixed_name() {
        // `oncustom(): void` → function but starts with `on`
        let m = classify_member("oncustom(): void", 0).unwrap();
        assert_eq!(m.name, "oncustom");
        assert!(m.is_function);
        assert!(!m.is_async);
    }

    #[test]
    fn promise_detection() {
        assert!(is_promise_type("Promise<void>"));
        assert!(is_promise_type("  Promise<string>  "));
        assert!(!is_promise_type("void"));
        assert!(!is_promise_type("number"));
    }
}
