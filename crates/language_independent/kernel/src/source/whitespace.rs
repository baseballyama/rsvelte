//! JavaScript's whitespace (`WhiteSpace` and `LineTerminator`), which `String#trim` and the regular
//! expression `\s` match. It differs from Rust's: U+0085 is not in it, U+FEFF is.

#[must_use]
pub const fn is_javascript_whitespace(c: char) -> bool {
    matches!(
        c,
        '\t' | '\n' | '\u{b}' | '\u{c}' | '\r' | ' ' | '\u{a0}' | '\u{1680}' | '\u{2000}'
            ..='\u{200a}'
                | '\u{2028}'
                | '\u{2029}'
                | '\u{202f}'
                | '\u{205f}'
                | '\u{3000}'
                | '\u{feff}'
    )
}

/// `String#trim`.
#[must_use]
pub fn trim_javascript(text: &str) -> &str {
    text.trim_matches(is_javascript_whitespace)
}

/// The words of `text` split on JavaScript's whitespace: `text.trim().split(/\s+/u)` without the
/// empty word a blank text gives.
pub fn split_javascript_whitespace(text: &str) -> impl Iterator<Item = &str> {
    text.split(is_javascript_whitespace)
        .filter(|word| !word.is_empty())
}

#[cfg(test)]
mod tests;
