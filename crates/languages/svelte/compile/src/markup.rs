use std::borrow::Cow;

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
