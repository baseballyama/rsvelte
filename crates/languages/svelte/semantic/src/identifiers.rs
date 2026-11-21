//! JavaScript identifiers derived from Svelte names: the component's own name and sanitised
//! output identifiers.

use std::borrow::Cow;

#[cfg(test)]
mod tests;

/// Upstream `get_component_name` followed by `scope.generate`'s sanitising.
#[must_use]
pub fn component_name(filename: &str) -> String {
    let mut parts = filename.rsplit(['/', '\\']);
    let basename = parts.next().unwrap_or("");
    let last_dir = parts.next();
    let mut name = basename
        .strip_suffix(".svelte")
        .filter(|stem| !stem.contains(".svelte"))
        .map_or_else(
            || {
                if basename.contains(".svelte") {
                    Cow::Owned(basename.replacen(".svelte", "", 1))
                } else {
                    Cow::Borrowed(basename)
                }
            },
            Cow::Borrowed,
        );
    if name == "index"
        && let Some(dir) = last_dir
        && !dir.is_empty()
        && dir != "src"
    {
        name = Cow::Borrowed(dir);
    }
    let mut chars = name.chars();
    let Some(first) = chars.next() else {
        return String::new();
    };
    sanitize_chars(first.to_uppercase().chain(chars), name.len())
}

/// `[^a-zA-Z0-9_$]` → `_`, and a leading digit → `_` (upstream `scope.generate`, and the same
/// as its `regex_invalid_identifier_chars` replacement).
#[must_use]
pub fn sanitize_identifier(name: &str) -> Cow<'_, str> {
    let valid = |c: char| c.is_ascii_alphanumeric() || c == '_' || c == '$';
    if name.chars().all(valid) && !name.starts_with(|c: char| c.is_ascii_digit()) {
        Cow::Borrowed(name)
    } else {
        Cow::Owned(sanitize_chars(name.chars(), name.len()))
    }
}

fn sanitize_chars(chars: impl Iterator<Item = char>, capacity: usize) -> String {
    let mut out = String::with_capacity(capacity);
    for c in chars {
        if c.is_ascii_alphanumeric() || c == '_' || c == '$' {
            out.push(c);
        } else {
            // Upstream's regular expression replaces each UTF-16 unit.
            out.extend(std::iter::repeat_n('_', c.len_utf16()));
        }
    }
    if out.starts_with(|c: char| c.is_ascii_digit()) {
        out.replace_range(0..1, "_");
    }
    out
}
