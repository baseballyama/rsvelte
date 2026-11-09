//! Character classes that several languages share.

/// ECMAScript's `WhiteSpace` and `LineTerminator`, what `\s` and `String.prototype.trim` match.
/// Unlike [`char::is_whitespace`], U+FEFF is one and U+0085 is not.
#[must_use]
pub const fn is_ecmascript_whitespace(c: char) -> bool {
    matches!(
        c,
        '\t' | '\n' | '\u{0B}' | '\u{0C}' | '\r' | ' ' | '\u{A0}' | '\u{1680}' | '\u{2000}'
            ..='\u{200A}'
                | '\u{2028}'
                | '\u{2029}'
                | '\u{202F}'
                | '\u{205F}'
                | '\u{3000}'
                | '\u{FEFF}'
    )
}

/// `String.prototype.trim`.
#[must_use]
pub fn trim_ecmascript(text: &str) -> &str {
    text.trim_matches(is_ecmascript_whitespace)
}

#[cfg(test)]
mod tests;
