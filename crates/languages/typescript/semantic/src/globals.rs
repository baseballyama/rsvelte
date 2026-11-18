//! The global variables `ESLint` declares: the language's builtins and the browser's.

use rustc_hash::FxHashSet;

/// Where a global variable comes from.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Global {
    /// An ECMAScript builtin (`Math`, `Promise`), present in every environment.
    Builtin,
    /// A browser global that is not a builtin (`window`, `console`, `setTimeout`).
    Browser {
        /// Node.js declares it too (`globals.node`): `console`, `fetch`, but not `window`.
        node: bool,
    },
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

/// The global variables a configuration declares: the builtins, which `ecmaVersion: "latest"`
/// declares, and the names of `languageOptions.globals`.
#[derive(Clone, Debug, Default)]
pub struct Declared {
    names: FxHashSet<Box<str>>,
}

impl Declared {
    /// The builtins and `names`.
    #[must_use]
    pub fn new<N: Into<Box<str>>>(names: impl IntoIterator<Item = N>) -> Self {
        Self {
            names: names.into_iter().map(Into::into).collect(),
        }
    }

    /// The builtins and `globals.browser`.
    #[must_use]
    pub fn browser() -> Self {
        Self::new(
            GLOBALS
                .iter()
                .filter(|(_, global)| matches!(global, Global::Browser { .. }))
                .map(|&(name, _)| name),
        )
    }

    /// Whether a global variable called `name` exists.
    #[must_use]
    pub fn declares(&self, name: &str) -> bool {
        global(name) == Some(Global::Builtin) || self.names.contains(name)
    }
}

#[cfg(test)]
mod tests;
