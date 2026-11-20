//! The global variables `ESLint` declares: the language's builtins and the browser's.

use oxc_semantic::ReferenceFlags;
use rustc_hash::FxHashMap;

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

/// The TypeScript library's names, each with whether it is a value as well as a type.
static LIBRARY: &[(&str, bool)] = &include!("vendor/typescript_library.rs");

/// The global variable called `name`, if `ESLint` declares one for `ecmaVersion: "latest"` with
/// `globals.browser`.
#[must_use]
pub fn global(name: &str) -> Option<Global> {
    GLOBALS
        .binary_search_by(|(row, _)| row.cmp(&name))
        .ok()
        .map(|at| GLOBALS[at].1)
}

/// Whether typescript-eslint declares `name` from the TypeScript library a parse without a
/// program reads (`lib: ['esnext']`): `Some(true)` for a value and a type, `Some(false)` for a
/// type only.
fn library(name: &str) -> Option<bool> {
    LIBRARY
        .binary_search_by(|(row, _)| row.cmp(&name))
        .ok()
        .map(|at| LIBRARY[at].1)
}

/// What a configuration or a `/* global */` comment sets a global variable to
/// (`normalizeConfigGlobal`).
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Setting {
    Readonly,
    Writable,
    /// Not a global variable, even a builtin one.
    Off,
}

impl Setting {
    /// The setting a string names, as a configuration or a comment writes it.
    #[must_use]
    pub fn named(value: &str) -> Option<Self> {
        Some(match value {
            "off" => Self::Off,
            "true" | "writeable" | "writable" => Self::Writable,
            "false" | "readable" | "readonly" => Self::Readonly,
            _ => return None,
        })
    }

    /// `true` is writable and `false` read-only.
    #[must_use]
    pub const fn flag(writable: bool) -> Self {
        if writable {
            Self::Writable
        } else {
            Self::Readonly
        }
    }
}

/// The global variables of a document: the builtins, which `ecmaVersion: "latest"` declares, as
/// `languageOptions.globals` and then the document's `/* global */` comments set them.
#[derive(Clone, Debug, Default)]
pub struct Declared {
    settings: FxHashMap<Box<str>, Setting>,
}

impl Declared {
    /// The builtins and `names`, read-only.
    #[must_use]
    pub fn new<N: Into<Box<str>>>(names: impl IntoIterator<Item = N>) -> Self {
        Self::with_settings(names.into_iter().map(|name| (name, Setting::Readonly)))
    }

    /// The builtins as `settings` set them.
    #[must_use]
    pub fn with_settings<N: Into<Box<str>>>(
        settings: impl IntoIterator<Item = (N, Setting)>,
    ) -> Self {
        Self {
            settings: settings
                .into_iter()
                .map(|(name, setting)| (name.into(), setting))
                .collect(),
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

    /// These globals, with `overrides` set after them, as a document's comments set them over the
    /// configuration's.
    #[must_use]
    pub fn overridden<N: Into<Box<str>>>(
        &self,
        overrides: impl IntoIterator<Item = (N, Setting)>,
    ) -> Self {
        let mut settings = self.settings.clone();
        settings.extend(
            overrides
                .into_iter()
                .map(|(name, setting)| (name.into(), setting)),
        );
        Self { settings }
    }

    /// Whether a global variable called `name` exists: a configured or commented name that is not
    /// `off`, a builtin nothing turns off, or a value of the TypeScript library, which
    /// typescript-eslint declares whatever `ESLint`'s settings say.
    #[must_use]
    pub fn declares(&self, name: &str) -> bool {
        let set = match self.settings.get(name) {
            Some(Setting::Readonly | Setting::Writable) => return true,
            Some(Setting::Off) => false,
            None => global(name) == Some(Global::Builtin),
        };
        set || library(name) == Some(true)
    }

    /// Whether a reference with `flags` to a `name` no scope declares resolves: to a global
    /// variable, or for a type reference, also to any type of the TypeScript library.
    #[must_use]
    pub fn resolves(&self, name: &str, flags: ReferenceFlags) -> bool {
        let type_only = !flags.is_value() && !flags.is_value_as_type();
        self.declares(name) || type_only && library(name).is_some()
    }
}

#[cfg(test)]
mod tests;
