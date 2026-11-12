//! Element facts the HTML standard fixes, read the same way by every HTML-based language.

/// The HTML standard's void elements, as `@vue/shared` `VOID_TAGS` and prettier-plugin-svelte
/// `selfClosingTags` list them. Svelte's compiler and eslint-plugin-svelte each add obsolete ones.
pub const VOID_ELEMENTS: &[&str] = &[
    "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source",
    "track", "wbr",
];

/// `name` is one of [`VOID_ELEMENTS`], compared case-sensitively as the upstream lists do.
#[must_use]
pub fn is_void(name: &str) -> bool {
    VOID_ELEMENTS.contains(&name)
}

#[cfg(test)]
mod tests;
