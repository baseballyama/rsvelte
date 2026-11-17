//! The language a component's script element names, which Svelte and Vue also read its template
//! expressions in.

/// A guess at whether a component is TypeScript, for the parse that reads its script element:
/// that element's `lang` decides, and the parser reads the component again when this was wrong.
#[must_use]
pub fn guess_typescript(source_text: &str) -> bool {
    // The whole document is scanned, so the search is memchr's vectorized one.
    memchr::memmem::find_iter(source_text.as_bytes(), b"lang=").any(|at| {
        let value = &source_text.as_bytes()[at + b"lang=".len()..];
        [&b"\"ts\""[..], b"'ts'", b"ts"]
            .iter()
            .any(|typescript| value.starts_with(typescript))
    })
}

/// Whether a `lang` attribute's value names TypeScript.
#[must_use]
pub fn is_typescript(lang: &str) -> bool {
    lang == "ts"
}

#[cfg(test)]
mod tests;
