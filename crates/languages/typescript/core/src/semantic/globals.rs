//! The global variables `ESLint` declares: the language's builtins and the browser's.

/// Where a global variable comes from.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Global {
    /// An ECMAScript builtin (`Math`, `Promise`), present in every environment.
    Builtin,
    /// A browser global that is not a builtin (`window`, `console`, `setTimeout`).
    Browser,
}

static GLOBALS: &[(&str, Global)] = &include!("vendor/globals.rs");

/// The global variable called `name`, if `ESLint` declares one for `ecmaVersion: "latest"` with
/// `globals.browser`.
#[must_use]
pub fn global(name: &str) -> Option<Global> {
    GLOBALS
        .binary_search_by(|(row, _)| row.cmp(&name))
        .ok()
        .map(|at| GLOBALS[at].1)
}

#[cfg(test)]
mod tests;
