//! `svelte/require-event-prefix` — require that all function-typed component
//! props whose name does not start with `on` are reported as violating the
//! convention. Port of the eslint-plugin-svelte rule.
//!
//! Works as a source-scan meta-rule in [`crate::runner::lint_source`]:
//! 1. Gate on TS component.
//! 2. Find `$props()` with a type annotation (`let {…}: <TYPE> = $props()`).
//! 3. Resolve `<TYPE>` — either an inline type literal or a named interface/type alias.
//! 4. For each member in the type body, classify it as function-typed.
//! 5. If the name doesn't start with `on`, it's a function, and every signature
//!    of that name returns no value (`void` / `undefined` / `null`, or — only
//!    with `checkAsyncFunctions`, unless a sibling signature returns no value
//!    synchronously — a `Promise` / `PromiseLike` of one), report at the first
//!    signature's name.
//!
//! Upstream classifies the checker's return types. Here the return type is the
//! annotation text, which is upstream's own rule in components with
//! `generics="…"`; elsewhere only same-script non-generic `type` aliases are
//! followed, so a no-value return reached through an indexed access, a generic
//! instantiation or a thenable interface is not reported.

use std::path::Path;

use rsvelte_diagnostics::Diagnostic;

use crate::config::LintConfig;
use crate::line_index::LineIndex;
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::svelte_scan::{
    blank_comments, has_attr, ident_continues_at, ident_continues_before, ident_run_end,
    script_blocks, script_is_ts,
};
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
            .and_then(serde_json::Value::as_bool)
            .unwrap_or(false);
        Self {
            check_async_functions,
        }
    }
}

/// Return diagnostics for event names in TypeScript scripts.
///
/// # Panics
///
/// Panics when a source offset cannot be represented as `u32`.
#[must_use]
pub fn diagnostics(source: &str, file: &Path, config: &LintConfig) -> Vec<Diagnostic> {
    let severity = config.resolve_code(META.name, META.default_severity);
    if severity == Severity::Off || !script_is_ts(source) {
        return Vec::new();
    }
    let opts = Options::from_config(config);
    let li = LineIndex::new(source);
    let mut out = Vec::new();
    let blocks = script_blocks(source);
    // The parser substitutes component generics with aliases, losing their
    // provenance, so upstream reads only explicit annotations there.
    let has_component_generics = blocks
        .iter()
        .any(|b| has_attr(&b.open_tag_attrs, "generics"));

    for block in blocks {
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
            let name = name.split('<').next().unwrap_or(name).trim_end();
            find_named_type_body(content, &blanked, name, block.content_start)
        };

        let Some((body_text, body_abs_offset)) = resolved else {
            continue;
        };

        let aliases = if has_component_generics {
            Vec::new()
        } else {
            type_aliases(content, &blanked)
        };
        // Overloads are one property: group the signatures by name, keeping the
        // first declaration's position.
        let mut properties: Vec<(TypeMember, Vec<ReturnKind>)> = Vec::new();
        for member in parse_type_members(&body_text, body_abs_offset) {
            let kind = member
                .return_type
                .as_deref()
                .map_or(ReturnKind::Other, |t| return_kind(t, &aliases, 0));
            if let Some((_, kinds)) = properties.iter_mut().find(|(m, _)| m.name == member.name) {
                kinds.push(kind);
            } else {
                properties.push((member, vec![kind]));
            }
        }
        for (member, kinds) in properties {
            if member.name.starts_with("on") || !member.is_function {
                continue;
            }
            if kinds.contains(&ReturnKind::Other)
                || !(kinds.contains(&ReturnKind::Void) || opts.check_async_functions)
            {
                continue;
            }
            let abs = u32::try_from(member.name_abs_offset)
                .expect("source offsets are represented as u32");
            out.push(Diagnostic {
                file: file.to_path_buf(),
                severity: to_dsev(severity),
                range: Some(range_from_byte(&li, abs, abs)),
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
    /// The annotated return type text of a function member.
    return_type: Option<String>,
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
enum ReturnKind {
    Void,
    Async,
    Other,
}

/// Same-script `type Name = …;` aliases without type parameters.
fn type_aliases(content: &str, blanked: &str) -> Vec<(String, String)> {
    let bytes = blanked.as_bytes();
    let mut out = Vec::new();
    let mut from = 0;
    while let Some(rel) = blanked[from..].find("type") {
        let kw = from + rel;
        from = kw + 4;
        if ident_continues_before(blanked, kw) || ident_continues_at(blanked, kw + 4) {
            continue;
        }
        let name_start = kw + 4 + (blanked[kw + 4..].len() - blanked[kw + 4..].trim_start().len());
        let name_end = ident_run_end(blanked, name_start);
        if name_end == name_start {
            continue;
        }
        let after = blanked[name_end..].trim_start();
        let Some(rest) = after.strip_prefix('=') else {
            continue;
        };
        let value_start = blanked.len() - rest.len();
        let mut depth = 0i32;
        let mut end = blanked.len();
        for (i, &b) in bytes.iter().enumerate().skip(value_start) {
            match b {
                b'(' | b'{' | b'[' | b'<' => depth += 1,
                b')' | b'}' | b']' => depth -= 1,
                b'>' if i > 0 && bytes[i - 1] != b'=' => depth -= 1,
                b';' if depth == 0 => {
                    end = i;
                    break;
                }
                _ => {}
            }
        }
        out.push((
            blanked[name_start..name_end].to_string(),
            content[value_start..end].trim().to_string(),
        ));
    }
    out
}

/// Split `text` at top-level `|`.
fn split_union(text: &str) -> Vec<&str> {
    let mut parts = Vec::new();
    let mut depth = 0i32;
    let mut start = 0;
    let bytes = text.as_bytes();
    for (i, &b) in bytes.iter().enumerate() {
        match b {
            b'(' | b'{' | b'[' | b'<' => depth += 1,
            b')' | b'}' | b']' => depth -= 1,
            b'>' if i > 0 && bytes[i - 1] != b'=' => depth -= 1,
            b'|' if depth == 0 => {
                parts.push(&text[start..i]);
                start = i + 1;
            }
            _ => {}
        }
    }
    parts.push(&text[start..]);
    parts
        .into_iter()
        .map(str::trim)
        .filter(|p| !p.is_empty())
        .collect()
}

/// Whether `text` is wholly wrapped in one pair of parentheses.
fn strip_outer_parens(text: &str) -> Option<&str> {
    let inner = text.strip_prefix('(')?.strip_suffix(')')?;
    let mut depth = 0i32;
    for b in inner.bytes() {
        match b {
            b'(' => depth += 1,
            b')' => {
                depth -= 1;
                if depth < 0 {
                    return None;
                }
            }
            _ => {}
        }
    }
    (depth == 0).then_some(inner)
}

/// Upstream's `getReturnKind`, over an annotation's text.
fn return_kind(text: &str, aliases: &[(String, String)], depth: u32) -> ReturnKind {
    let t = text.trim().trim_end_matches([';', ',']).trim_end();
    if depth > 16 {
        return ReturnKind::Other;
    }
    if let Some(inner) = strip_outer_parens(t) {
        return return_kind(inner, aliases, depth + 1);
    }
    let parts = split_union(t);
    if parts.len() > 1 {
        let kinds: Vec<ReturnKind> = parts
            .iter()
            .map(|p| return_kind(p, aliases, depth + 1))
            .collect();
        if kinds.contains(&ReturnKind::Other) {
            return ReturnKind::Other;
        }
        return if kinds.contains(&ReturnKind::Void) {
            ReturnKind::Void
        } else {
            ReturnKind::Async
        };
    }
    if matches!(t, "void" | "undefined" | "null") {
        return ReturnKind::Void;
    }
    for wrapper in ["Promise", "PromiseLike"] {
        if let Some(arg) = t
            .strip_prefix(wrapper)
            .map(str::trim_start)
            .and_then(|r| r.strip_prefix('<'))
            .and_then(|r| r.strip_suffix('>'))
        {
            if split_type_args(arg) != 1 {
                return ReturnKind::Other;
            }
            return match return_kind(arg, aliases, depth + 1) {
                ReturnKind::Other => ReturnKind::Other,
                _ => ReturnKind::Async,
            };
        }
    }
    if let Some((_, value)) = aliases.iter().find(|(name, _)| name == t) {
        return return_kind(value, aliases, depth + 1);
    }
    ReturnKind::Other
}

/// Number of top-level comma-separated type arguments in `args`.
fn split_type_args(args: &str) -> usize {
    let mut depth = 0i32;
    let mut count = 1;
    let bytes = args.as_bytes();
    for (i, &b) in bytes.iter().enumerate() {
        match b {
            b'(' | b'{' | b'[' | b'<' => depth += 1,
            b')' | b'}' | b']' => depth -= 1,
            b'>' if i > 0 && bytes[i - 1] != b'=' => depth -= 1,
            b',' if depth == 0 => count += 1,
            _ => {}
        }
    }
    count
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
        .map_or(type_start, |(i, _)| type_start + i);
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

    // Try `interface <name>` first.
    for kw in ["interface", "type"] {
        let mut search_from = 0;
        while let Some(rel) = blanked[search_from..].find(kw) {
            let kw_start = search_from + rel;
            let kw_end = kw_start + kw.len();
            let before_ok = !ident_continues_before(blanked, kw_start);
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
            if ident_continues_at(blanked, after_name) {
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
                b';' | b'\n' | b',' => top_level_position(bytes, i),
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
                    .map_or(member_start, |(off, _)| member_start + off);
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
    for (j, &b) in bytes[..i].iter().enumerate() {
        match b {
            b'{' => depth_brace += 1,
            b'}' => depth_brace -= 1,
            b'(' => depth_paren += 1,
            b')' => depth_paren -= 1,
            b'<' => depth_angle += 1,
            // The `>` of an arrow `=>` closes nothing.
            b'>' if j == 0 || bytes[j - 1] != b'=' => depth_angle -= 1,
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
    // Extract the leading name (identifier chars, then optionally `?`).
    let name_end = ident_run_end(segment, 0);
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
    let rest = rest.strip_prefix('?').map_or(rest, str::trim_start);

    // Method signature: `name(…)` — next char is `(`
    if rest.starts_with('(') {
        // Find the return type (after the closing `)` and `:`)
        let return_type = extract_return_type_after_params(rest).map(str::to_string);
        return Some(TypeMember {
            name: name.to_string(),
            name_abs_offset,
            is_function: true,
            return_type,
        });
    }

    // Property: `name: <type>` or `name?: <type>` — next is `:`
    if let Some(value_type) = rest.strip_prefix(':').map(str::trim_start) {
        // Check if the value type is a function type (arrow function).
        let return_type = arrow_return_type(value_type);
        return Some(TypeMember {
            name: name.to_string(),
            name_abs_offset,
            is_function: return_type.is_some(),
            return_type: return_type.map(str::to_string),
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

/// The return type text of a function type value (the RHS of `name: <type>`),
/// or `None` when it is not a function type.
fn arrow_return_type(type_str: &str) -> Option<&str> {
    let t = type_str.trim();
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
                return Some(t[i + 2..].trim());
            }
            _ => {}
        }
        i += 1;
    }
    None
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn classify_method_signature() {
        let m = classify_member("custom(): void", 0).unwrap();
        assert_eq!(m.name, "custom");
        assert!(m.is_function);
        assert_eq!(m.return_type.as_deref(), Some("void"));
    }

    #[test]
    fn classify_arrow_function_property() {
        let m = classify_member("custom: () => Promise<void>", 0).unwrap();
        assert!(m.is_function);
        assert_eq!(m.return_type.as_deref(), Some("Promise<void>"));
    }

    #[test]
    fn classify_method_without_return_type() {
        let m = classify_member("custom()", 0).unwrap();
        assert!(m.is_function);
        assert_eq!(m.return_type, None);
    }

    #[test]
    fn classify_non_function_types() {
        assert!(!classify_member("custom: any", 0).unwrap().is_function);
        assert!(!classify_member("custom: number", 0).unwrap().is_function);
    }

    // Kinds from eslint-plugin-svelte 3.24.1 `require-event-prefix` fixtures.
    #[test]
    fn return_kinds_of_annotations() {
        let none: &[(String, String)] = &[];
        for (text, kind) in [
            ("void", ReturnKind::Void),
            ("null", ReturnKind::Void),
            ("void | null", ReturnKind::Void),
            ("(void | undefined | null)", ReturnKind::Void),
            ("void | Promise<void>", ReturnKind::Void),
            ("Promise<void> | undefined", ReturnKind::Void),
            ("void | PromiseLike<void>", ReturnKind::Void),
            ("Promise<void>", ReturnKind::Async),
            ("PromiseLike<undefined>", ReturnKind::Async),
            ("Promise<Promise<void>>", ReturnKind::Async),
            ("never", ReturnKind::Other),
            ("unknown | void", ReturnKind::Other),
            ("(unknown)", ReturnKind::Other),
            ("Promise<unknown>", ReturnKind::Other),
            ("Promise<string[]>", ReturnKind::Other),
            ("Promise<never>", ReturnKind::Other),
            ("boolean | void", ReturnKind::Other),
            ("T | void", ReturnKind::Other),
            ("string", ReturnKind::Other),
        ] {
            assert_eq!(return_kind(text, none, 0), kind, "{text}");
        }
    }

    #[test]
    fn aliases_are_followed() {
        let content = "type Empty = void;\n  type Async = Promise<void>;\n  type Unknown = unknown;\n  type Result<E, R> = Promise<R>;";
        let aliases = type_aliases(content, &blank_comments(content));
        assert_eq!(return_kind("Empty", &aliases, 0), ReturnKind::Void);
        assert_eq!(return_kind("Async", &aliases, 0), ReturnKind::Async);
        assert_eq!(
            return_kind("void | Promise<Unknown>", &aliases, 0),
            ReturnKind::Other
        );
        assert_eq!(
            return_kind("Result<string, any>", &aliases, 0),
            ReturnKind::Other
        );
    }

    fn findings(source: &str, check_async: bool) -> Vec<(u32, u32)> {
        let options = if check_async {
            serde_json::json!([{ "checkAsyncFunctions": true }])
        } else {
            serde_json::json!([])
        };
        let config = LintConfig::empty()
            .with_override(META.name, Severity::Error)
            .with_options(META.name, options);
        let mut out: Vec<(u32, u32)> = diagnostics(source, Path::new("Comp.svelte"), &config)
            .into_iter()
            .filter_map(|d| d.range.map(|r| (r.start.line, r.start.column)))
            .collect();
        out.sort_unstable();
        out
    }

    #[test]
    fn overloads_and_aliases_in_a_plain_component() {
        // invalid/overload-maybe-async01: reported at 4:5, 6:5, 8:5 either way.
        let src = "<script lang=\"ts\">\n  type Async = Promise<void>;\n  interface Props {\n    click(): void;\n    click(value: string): Async;\n    save(value: string): Promise<void>;\n    save(): void;\n    clear(): Promise<void>;\n    clear(value: string): undefined;\n  }\n  let { click, save, clear }: Props = $props();\n</script>\n";
        let expected = findings(src, false);
        assert_eq!(expected.len(), 3);
        assert_eq!(findings(src, true), expected);
        // valid/overload01: a value-returning overload clears the property.
        let src = "<script lang=\"ts\">\n  interface Props {\n    select(): void;\n    select(value: string): string;\n  }\n\n  let { select }: Props = $props();\n</script>\n";
        assert!(findings(src, false).is_empty());
    }

    #[test]
    fn async_only_with_the_option() {
        let src = "<script lang=\"ts\">\n  interface Props {\n    custom: () => Promise<void>;\n  }\n\n  let { custom }: Props = $props();\n</script>\n";
        assert!(findings(src, false).is_empty());
        assert_eq!(findings(src, true).len(), 1);
    }

    #[test]
    fn generic_components_do_not_follow_aliases() {
        // valid/conservative-generic-no-value01 shape.
        let src = "<script lang=\"ts\" generics=\"T\">\n  type Empty = void;\n  interface Props {\n    click: () => Empty;\n    select: (item: T) => void;\n  }\n  let { click, select }: Props = $props();\n</script>\n";
        assert_eq!(findings(src, false).len(), 1);
    }
}
