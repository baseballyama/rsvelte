//! The language a component's script element names, which Svelte and Vue also read its template
//! expressions in.

/// A guess at whether a component is TypeScript, for the parse that reads its script element:
/// that element's `lang` decides, and the parser reads the component again when this was wrong.
fn guess_typescript(source_text: &str) -> bool {
    // The whole document is scanned, so the search is memchr's vectorized one.
    memchr::memmem::find_iter(source_text.as_bytes(), b"lang=").any(|at| {
        let value = &source_text.as_bytes()[at + b"lang=".len()..];
        [&b"\"ts\""[..], b"'ts'", b"ts"]
            .iter()
            .any(|typescript| value.starts_with(typescript))
    })
}

/// What `parse_as` reads of `source_text` as TypeScript or not, given what its script element's
/// `lang` says once read: the guess first, and the other language when the guess was wrong.
///
/// # Errors
///
/// The error of the parse in the language the component turns out to be in.
pub fn parse_guessing_typescript<T, E>(
    source_text: &str,
    mut parse_as: impl FnMut(bool) -> (Result<T, E>, Option<bool>),
) -> Result<T, E> {
    let guess = guess_typescript(source_text);
    let (parsed, lang_read) = parse_as(guess);
    // Without a script's `lang` the component is JavaScript, unless the parse stopped before one
    // could be read.
    let typescript = lang_read.unwrap_or_else(|| guess && parsed.is_err());
    if typescript == guess {
        return parsed;
    }
    parse_as(typescript).0
}

/// Whether a `lang` attribute's value names TypeScript.
#[must_use]
pub fn is_typescript(lang: &str) -> bool {
    lang == "ts"
}

#[cfg(test)]
mod tests;
