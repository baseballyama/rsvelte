/// Prettier's `getPreferredQuote`.
pub(super) fn preferred_quote(content: &str, single: bool) -> char {
    let (pref, alternate) = if single { ('\'', '"') } else { ('"', '\'') };
    if content.matches(pref).count() > content.matches(alternate).count() {
        alternate
    } else {
        pref
    }
}

/// Prettier's `makeString`: re-quotes raw string content, dropping escapes that are not needed.
pub(super) fn make_string(raw: &str, quote: char) -> String {
    let other = if quote == '"' { '\'' } else { '"' };
    let mut out = String::with_capacity(raw.len() + 2);
    out.push(quote);
    let mut chars = raw.chars();
    while let Some(c) = chars.next() {
        match c {
            '\\' => match chars.next() {
                Some(e) if e == other => out.push(e),
                Some(e) => {
                    let needed = matches!(
                        e,
                        '\n' | '\r' | '"' | '\'' | '0'
                            ..='7'
                                | '\\'
                                | 'b'
                                | 'f'
                                | 'n'
                                | 'r'
                                | 't'
                                | 'u'
                                | 'v'
                                | 'x'
                                | '\u{2028}'
                                | '\u{2029}'
                    );
                    if needed {
                        out.push('\\');
                    }
                    out.push(e);
                }
                None => out.push('\\'),
            },
            c if c == quote => {
                out.push('\\');
                out.push(c);
            }
            c => out.push(c),
        }
    }
    out.push(quote);
    out
}
