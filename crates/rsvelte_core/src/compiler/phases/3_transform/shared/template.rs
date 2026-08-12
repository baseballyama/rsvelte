//! Template building utilities.
//!
//! Common functions for building HTML templates, escaping content,
//! and handling void elements.

use std::borrow::Cow;

use memchr::{memchr2, memchr3};

/// Escape HTML special characters for safe insertion into HTML content.
pub fn escape_html(s: &str) -> Cow<'_, str> {
    escape(s, false)
}

/// Escape attribute value special characters.
pub fn escape_attr(s: &str) -> Cow<'_, str> {
    escape(s, true)
}

fn escape(s: &str, attribute: bool) -> Cow<'_, str> {
    let bytes = s.as_bytes();
    let find = |haystack: &[u8]| {
        if attribute {
            memchr3(b'&', b'<', b'"', haystack)
        } else {
            memchr2(b'&', b'<', haystack)
        }
    };
    let Some(first) = find(bytes) else {
        return Cow::Borrowed(s);
    };

    let mut escaped = String::with_capacity(s.len() + 8);
    escaped.push_str(&s[..first]);
    let mut start = first;
    while let Some(offset) = find(&bytes[start..]) {
        let position = start + offset;
        escaped.push_str(&s[start..position]);
        escaped.push_str(match bytes[position] {
            b'&' => "&amp;",
            b'<' => "&lt;",
            _ => "&quot;",
        });
        start = position + 1;
    }
    escaped.push_str(&s[start..]);
    Cow::Owned(escaped)
}

/// Check if an element is a void element (self-closing, no end tag).
///
/// Mirrors upstream `is_void` (svelte/src/utils.js): the `VOID_ELEMENT_NAMES`
/// list (which includes `command` and `keygen`) plus a case-insensitive
/// `!doctype`. Used by both the client template printer and the server, so they
/// agree on self-closing output (`<!doctype html=""/>`).
pub fn is_void_element(name: &str) -> bool {
    matches!(
        name,
        "area"
            | "base"
            | "br"
            | "col"
            | "command"
            | "embed"
            | "hr"
            | "img"
            | "input"
            | "keygen"
            | "link"
            | "meta"
            | "param"
            | "source"
            | "track"
            | "wbr"
    ) || name.eq_ignore_ascii_case("!doctype")
}

/// Sanitize a template string by escaping special characters.
pub fn sanitize_template_string(s: &str) -> String {
    // Fast path: if no special chars, avoid allocation
    if !s.contains('\\') && !s.contains('`') && memchr::memmem::find(s.as_bytes(), b"${").is_none()
    {
        return s.to_string();
    }
    let result = s.replace('\\', "\\\\").replace('`', "\\`");
    if memchr::memmem::find(result.as_bytes(), b"${").is_some() {
        result.replace("${", "\\${")
    } else {
        result
    }
}

/// Escape a string for use in a single-quoted JavaScript string literal.
///
/// Mirrors esrap's `quote()` (esrap `src/languages/ts/index.js`) and the
/// codegen-side `escape_string_single`: only the backslash, the quote
/// character, `\n` and `\r` are escaped. A tab (and other control characters)
/// is emitted **literally** — escaping it as `\t` diverges from the official
/// compiler's output (e.g. multi-line `class="…"` values keep their source
/// tabs verbatim).
pub fn escape_js_string(s: &str) -> String {
    let mut result = String::with_capacity(s.len());
    for c in s.chars() {
        match c {
            '\'' => result.push_str("\\'"),
            '\\' => result.push_str("\\\\"),
            '\n' => result.push_str("\\n"),
            '\r' => result.push_str("\\r"),
            _ => result.push(c),
        }
    }
    result
}

/// Check if an attribute is a boolean attribute.
/// Must match the official Svelte compiler's DOM_BOOLEAN_ATTRIBUTES list exactly.
/// Reference: svelte/packages/svelte/src/utils.js
pub fn is_boolean_attribute(name: &str) -> bool {
    matches!(
        name,
        "allowfullscreen"
            | "async"
            | "autofocus"
            | "autoplay"
            | "checked"
            | "controls"
            | "default"
            | "defer"
            | "disabled"
            | "disablepictureinpicture"
            | "disableremoteplayback"
            | "formnovalidate"
            | "indeterminate"
            | "inert"
            | "ismap"
            | "loop"
            | "multiple"
            | "muted"
            | "nomodule"
            | "novalidate"
            | "open"
            | "playsinline"
            | "readonly"
            | "required"
            | "reversed"
            | "seamless"
            | "selected"
            | "webkitdirectory"
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_escape_html() {
        // Official Svelte CONTENT_REGEX = /[&<]/g - does NOT escape >
        assert_eq!(escape_html("<div>"), "&lt;div>");
        assert_eq!(escape_html("a & b"), "a &amp; b");
        assert_eq!(escape_html("hello"), "hello");
        assert!(matches!(escape_html("hello"), Cow::Borrowed(_)));
    }

    #[test]
    fn test_escape_attr() {
        assert_eq!(escape_attr("\"quoted\""), "&quot;quoted&quot;");
        // Official Svelte ATTR_REGEX = /[&"<]/g - does NOT escape >
        assert_eq!(escape_attr("<tag>"), "&lt;tag>");
        assert!(matches!(escape_attr("plain"), Cow::Borrowed(_)));
    }

    #[test]
    fn test_is_void_element() {
        assert!(is_void_element("br"));
        assert!(is_void_element("img"));
        assert!(is_void_element("input"));
        assert!(!is_void_element("div"));
        assert!(!is_void_element("span"));
    }

    #[test]
    fn test_escape_js_string() {
        assert_eq!(escape_js_string("hello"), "hello");
        assert_eq!(escape_js_string("don't"), "don\\'t");
        assert_eq!(escape_js_string("it's"), "it\\'s");
        assert_eq!(escape_js_string("a\\b"), "a\\\\b");
        assert_eq!(escape_js_string("a\nb"), "a\\nb");
        // Tabs are emitted literally (esrap parity), not escaped as `\t`.
        assert_eq!(escape_js_string("a\tb"), "a\tb");
        assert_eq!(
            escape_js_string("I don't need to use the argument if I don't want to"),
            "I don\\'t need to use the argument if I don\\'t want to"
        );
    }
}
