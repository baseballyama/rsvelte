//! Template building utilities.
//!
//! Common functions for building HTML templates, escaping content,
//! and handling void elements.

/// Escape HTML special characters for safe insertion into HTML content.
pub fn escape_html(s: &str) -> String {
    // Only escape & and < for HTML content (not >)
    // This matches the official Svelte compiler's CONTENT_REGEX = /[&<]/g
    s.replace('&', "&amp;").replace('<', "&lt;")
}

/// Escape attribute value special characters.
pub fn escape_attr(s: &str) -> String {
    // Only escape &, ", and < for attributes (not >)
    // This matches the official Svelte compiler's ATTR_REGEX = /[&"<]/g
    s.replace('&', "&amp;")
        .replace('"', "&quot;")
        .replace('<', "&lt;")
}

/// Check if an element is a void element (self-closing, no end tag).
pub fn is_void_element(name: &str) -> bool {
    matches!(
        name,
        "area"
            | "base"
            | "br"
            | "col"
            | "embed"
            | "hr"
            | "img"
            | "input"
            | "link"
            | "meta"
            | "param"
            | "source"
            | "track"
            | "wbr"
    )
}

/// Check if an element preserves whitespace.
pub fn preserves_whitespace(name: &str) -> bool {
    matches!(name, "pre" | "textarea" | "script" | "style")
}

/// Normalize whitespace in text content.
/// Collapses multiple whitespace characters into single spaces.
pub fn normalize_whitespace(s: &str) -> String {
    let mut result = String::with_capacity(s.len());
    let mut prev_was_ws = false;

    for c in s.chars() {
        if c.is_whitespace() {
            if !prev_was_ws {
                result.push(' ');
                prev_was_ws = true;
            }
        } else {
            result.push(c);
            prev_was_ws = false;
        }
    }

    result
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
/// Escapes: backslashes, single quotes, newlines, carriage returns, tabs.
pub fn escape_js_string(s: &str) -> String {
    let mut result = String::with_capacity(s.len());
    for c in s.chars() {
        match c {
            '\'' => result.push_str("\\'"),
            '\\' => result.push_str("\\\\"),
            '\n' => result.push_str("\\n"),
            '\r' => result.push_str("\\r"),
            '\t' => result.push_str("\\t"),
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

/// Check if a name is a custom element (has hyphen or is attribute).
pub fn is_custom_element_node(name: &str) -> bool {
    name.contains('-')
}

/// Check if a node is an element node (for template processing).
pub fn is_element_node(node: &crate::ast::template::TemplateNode) -> bool {
    use crate::ast::template::TemplateNode;
    matches!(
        node,
        TemplateNode::RegularElement(_)
            | TemplateNode::Component(_)
            | TemplateNode::SvelteElement(_)
            | TemplateNode::SlotElement(_)
            | TemplateNode::TitleElement(_)
            | TemplateNode::SvelteFragment(_)
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
    }

    #[test]
    fn test_escape_attr() {
        assert_eq!(escape_attr("\"quoted\""), "&quot;quoted&quot;");
        // Official Svelte ATTR_REGEX = /[&"<]/g - does NOT escape >
        assert_eq!(escape_attr("<tag>"), "&lt;tag>");
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
    fn test_normalize_whitespace() {
        assert_eq!(normalize_whitespace("a  b"), "a b");
        assert_eq!(normalize_whitespace("a\n\nb"), "a b");
        assert_eq!(normalize_whitespace("  a  "), " a ");
    }

    #[test]
    fn test_escape_js_string() {
        assert_eq!(escape_js_string("hello"), "hello");
        assert_eq!(escape_js_string("don't"), "don\\'t");
        assert_eq!(escape_js_string("it's"), "it\\'s");
        assert_eq!(escape_js_string("a\\b"), "a\\\\b");
        assert_eq!(escape_js_string("a\nb"), "a\\nb");
        assert_eq!(escape_js_string("a\tb"), "a\\tb");
        assert_eq!(
            escape_js_string("I don't need to use the argument if I don't want to"),
            "I don\\'t need to use the argument if I don\\'t want to"
        );
    }
}
