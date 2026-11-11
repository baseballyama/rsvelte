//! Fresh identifiers for generated code, with upstream's numbering (`p`, `p_1`, …) so that output
//! matches name for name.

use std::borrow::Cow;
use std::cell::RefCell;

use rustc_hash::{FxHashMap, FxHashSet};

/// Shared by every rewrite of one compile, as upstream's one `ScopeRoot` is: a name is taken
/// inside a single call, so a rewrite that nests another never holds it.
#[derive(Debug)]
pub(super) struct Names<'r> {
    /// With the generated names, upstream `root.conflicts`.
    declared: FxHashSet<&'r str>,
    /// Source references are separate because hoisted names only check conflicts.
    references: FxHashSet<&'r str>,
    taken: RefCell<Taken>,
}

#[derive(Debug, Default)]
struct Taken {
    counters: FxHashMap<Box<str>, u32>,
    generated: FxHashSet<Box<str>>,
}

impl<'r> Names<'r> {
    pub(super) fn new(
        declared: impl Iterator<Item = &'r str>,
        source_reads: impl Iterator<Item = &'r str>,
    ) -> Self {
        Self {
            declared: declared.collect(),
            references: source_reads.collect(),
            taken: RefCell::default(),
        }
    }

    /// Upstream `Scope.generate`.
    pub(super) fn generate(&self, preferred: &str) -> String {
        let preferred = crate::identity::sanitize_identifier(preferred);
        self.allocate(&preferred, true)
    }

    /// Upstream `ScopeRoot.unique`, used for hoisted names: no leading-digit or keyword check.
    pub(super) fn unique(&self, preferred: &str) -> String {
        let valid = |c: char| c.is_ascii_alphanumeric() || c == '_' || c == '$';
        let preferred: Cow<'_, str> = if preferred.chars().all(valid) {
            Cow::Borrowed(preferred)
        } else {
            Cow::Owned(
                preferred
                    .chars()
                    .map(|c| if valid(c) { c } else { '_' })
                    .collect(),
            )
        };
        self.allocate(&preferred, false)
    }

    fn allocate(&self, preferred: &str, check_references: bool) -> String {
        let mut taken = self.taken.borrow_mut();
        let mut n = taken.counters.get(preferred).copied().unwrap_or(0);
        let mut name = if n == 0 {
            n = 1;
            preferred.to_owned()
        } else {
            n += 1;
            format!("{preferred}_{}", n - 1)
        };
        while self.declared.contains(name.as_str())
            || taken.generated.contains(name.as_str())
            || (check_references
                && (self.references.contains(name.as_str())
                    || matches!(
                        name.as_str(),
                        "arguments"
                            | "await"
                            | "break"
                            | "case"
                            | "catch"
                            | "class"
                            | "const"
                            | "continue"
                            | "debugger"
                            | "default"
                            | "delete"
                            | "do"
                            | "else"
                            | "enum"
                            | "eval"
                            | "export"
                            | "extends"
                            | "false"
                            | "finally"
                            | "for"
                            | "function"
                            | "if"
                            | "implements"
                            | "import"
                            | "in"
                            | "instanceof"
                            | "interface"
                            | "let"
                            | "new"
                            | "null"
                            | "package"
                            | "private"
                            | "protected"
                            | "public"
                            | "return"
                            | "static"
                            | "super"
                            | "switch"
                            | "this"
                            | "throw"
                            | "true"
                            | "try"
                            | "typeof"
                            | "var"
                            | "void"
                            | "while"
                            | "with"
                            | "yield"
                    )))
        {
            name = format!("{preferred}_{n}");
            n += 1;
        }
        // Boxes the key only the first time a name is preferred.
        match taken.counters.get_mut(preferred) {
            Some(counter) => *counter = n,
            None => _ = taken.counters.insert(preferred.into(), n),
        }
        taken.generated.insert(name.as_str().into());
        name
    }
}
