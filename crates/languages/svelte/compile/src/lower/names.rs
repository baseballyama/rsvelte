//! Fresh identifiers for generated code, with upstream's numbering (`p`, `p_1`, …) so that output
//! matches name for name.

use rustc_hash::{FxHashMap, FxHashSet};

#[derive(Debug)]
pub(super) struct Names {
    counters: FxHashMap<Box<str>, u32>,
    /// Upstream `root.conflicts`: every declared name, plus every generated one.
    conflicts: FxHashSet<Box<str>>,
    /// Source references are separate because hoisted names only check conflicts.
    references: FxHashSet<Box<str>>,
}

impl Names {
    pub(super) fn new<'a>(
        declared: impl Iterator<Item = &'a str>,
        source_reads: impl Iterator<Item = &'a str>,
    ) -> Self {
        let conflicts: FxHashSet<Box<str>> = declared.map(Box::from).collect();
        let references: FxHashSet<Box<str>> = source_reads.map(Box::from).collect();
        Self {
            counters: FxHashMap::default(),
            conflicts,
            references,
        }
    }

    /// Upstream `Scope.generate`.
    pub(super) fn generate(&mut self, preferred: &str) -> String {
        let preferred = crate::identity::sanitize_identifier(preferred);
        self.allocate(preferred, true)
    }

    /// Upstream `ScopeRoot.unique`, used for hoisted names: no leading-digit or keyword check.
    pub(super) fn unique(&mut self, preferred: &str) -> String {
        let preferred: String = preferred
            .chars()
            .map(|c| {
                if c.is_ascii_alphanumeric() || c == '_' || c == '$' {
                    c
                } else {
                    '_'
                }
            })
            .collect();
        self.allocate(preferred, false)
    }

    fn allocate(&mut self, preferred: String, check_references: bool) -> String {
        let entry = self.counters.entry(preferred.into_boxed_str());
        let mut n = match &entry {
            std::collections::hash_map::Entry::Occupied(entry) => *entry.get(),
            std::collections::hash_map::Entry::Vacant(_) => 0,
        };
        let preferred = entry.key();
        let mut name = if n == 0 {
            n = 1;
            preferred.to_string()
        } else {
            n += 1;
            format!("{preferred}_{}", n - 1)
        };
        while self.conflicts.contains(name.as_str())
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
        entry.insert_entry(n);
        self.conflicts.insert(name.as_str().into());
        name
    }
}
