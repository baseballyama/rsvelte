//! The values of string and template literals.

/// Decodes a quoted JS string literal's escapes; `None` when the body contains no backslash
/// (the value is then the source bytes between the quotes).
pub fn decode_string(raw_body: &str) -> Option<String> {
    if !raw_body.contains('\\') {
        return None;
    }
    let mut out = String::with_capacity(raw_body.len());
    let mut chars = raw_body.chars().peekable();
    while let Some(c) = chars.next() {
        if c != '\\' {
            out.push(c);
            continue;
        }
        match chars.next() {
            Some('n') => out.push('\n'),
            Some('t') => out.push('\t'),
            Some('r') => out.push('\r'),
            Some('b') => out.push('\u{8}'),
            Some('f') => out.push('\u{c}'),
            Some('v') => out.push('\u{b}'),
            Some('0') if !chars.peek().is_some_and(char::is_ascii_digit) => out.push('\0'),
            Some('x') => {
                let h: String = chars.by_ref().take(2).collect();
                out.push(
                    u32::from_str_radix(&h, 16)
                        .ok()
                        .and_then(char::from_u32)
                        .unwrap_or('\u{fffd}'),
                );
            }
            Some('u') => {
                let code = if chars.peek() == Some(&'{') {
                    chars.next();
                    let h: String = chars.by_ref().take_while(|&c| c != '}').collect();
                    u32::from_str_radix(&h, 16).ok()
                } else {
                    let h: String = chars.by_ref().take(4).collect();
                    u32::from_str_radix(&h, 16).ok()
                };
                out.push(code.and_then(char::from_u32).unwrap_or('\u{fffd}'));
            }
            Some('\r') => {
                if chars.peek() == Some(&'\n') {
                    chars.next();
                }
            }
            Some('\n' | '\u{2028}' | '\u{2029}') | None => {}
            Some(other) => out.push(other),
        }
    }
    Some(out)
}

/// A template element's cooked value from its raw text.
#[must_use]
pub fn cook_template(raw: &str) -> std::borrow::Cow<'_, str> {
    if !raw.contains(['\\', '\r']) {
        return std::borrow::Cow::Borrowed(raw);
    }
    // A template reads a CRLF as LF, escaped or not.
    let raw = raw.replace("\r\n", "\n").replace('\r', "\n");
    std::borrow::Cow::Owned(decode_string(&raw).unwrap_or(raw))
}
