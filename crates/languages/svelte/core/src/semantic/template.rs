use std::borrow::Cow;

use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};

/// Upstream `escape_html`.
#[must_use]
pub fn escape_markup(s: &str, is_attribute: bool) -> Cow<'_, str> {
    let needs = |c: char| c == '&' || c == '<' || (is_attribute && c == '"');
    if !s.contains(needs) {
        return Cow::Borrowed(s);
    }
    let mut out = String::with_capacity(s.len() + 8);
    for ch in s.chars() {
        match ch {
            '&' => out.push_str("&amp;"),
            '<' => out.push_str("&lt;"),
            '"' if is_attribute => out.push_str("&quot;"),
            _ => out.push(ch),
        }
    }
    Cow::Owned(out)
}

#[must_use]
pub fn cannot_be_set_statically(name: &str) -> bool {
    matches!(
        name,
        "autofocus" | "muted" | "defaultValue" | "defaultChecked"
    )
}

#[must_use]
pub fn needs_clsx(javascript: &SyntaxTree, e: NodeIdentifier) -> bool {
    !matches!(
        javascript.kind(e),
        Kind::String
            | Kind::Number(_)
            | Kind::Boolean(_)
            | Kind::Null
            | Kind::Template { .. }
            | Kind::Binary(..)
    )
}
