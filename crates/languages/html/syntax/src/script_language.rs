//! The language a component's script element names, which Svelte and Vue also read its template
//! expressions in.

/// A guess at whether a component is TypeScript, for the parse that reads its script element:
/// that element's `lang` decides, and the parser reads the component again when this was wrong.
#[must_use]
pub fn guess_typescript(source_text: &str) -> bool {
    source_text.match_indices("lang=").any(|(at, _)| {
        let value = &source_text[at + "lang=".len()..];
        ["\"ts\"", "'ts'", "ts"]
            .iter()
            .any(|ts| value.starts_with(ts))
    })
}

/// Whether a `lang` attribute's value names TypeScript.
#[must_use]
pub fn is_typescript(lang: &str) -> bool {
    lang == "ts"
}

#[cfg(test)]
mod tests;
