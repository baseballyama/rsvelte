//! Fresh identifiers for generated code, with upstream's numbering (`p`, `p_1`, …) so that output
//! matches name for name.

use rustc_hash::{FxHashMap, FxHashSet};

const RESERVED: &[&str] = &[
    "arguments",
    "await",
    "break",
    "case",
    "catch",
    "class",
    "const",
    "continue",
    "debugger",
    "default",
    "delete",
    "do",
    "else",
    "enum",
    "eval",
    "export",
    "extends",
    "false",
    "finally",
    "for",
    "function",
    "if",
    "implements",
    "import",
    "in",
    "instanceof",
    "interface",
    "let",
    "new",
    "null",
    "package",
    "private",
    "protected",
    "public",
    "return",
    "static",
    "super",
    "switch",
    "this",
    "throw",
    "true",
    "try",
    "typeof",
    "var",
    "void",
    "while",
    "with",
    "yield",
];

#[derive(Debug)]
pub struct Names {
    counters: FxHashMap<String, u32>,
    /// Upstream `root.conflicts`: every declared name, plus every generated one.
    conflicts: FxHashSet<String>,
    /// Names the component scope references or declares (upstream checks the current scope too).
    scope: FxHashSet<String>,
}

impl Names {
    pub fn new<'a>(
        declared: impl Iterator<Item = &'a str>,
        referenced: impl Iterator<Item = &'a str>,
    ) -> Self {
        let conflicts: FxHashSet<String> = declared.map(str::to_owned).collect();
        let mut scope: FxHashSet<String> = referenced.map(str::to_owned).collect();
        scope.extend(conflicts.iter().cloned());
        Self {
            counters: FxHashMap::default(),
            conflicts,
            scope,
        }
    }

    /// Upstream `Scope.generate`.
    pub fn generate(&mut self, preferred: &str) -> String {
        let preferred = rsvelte_svelte::semantic::analyze::sanitize_identifier(preferred);
        self.allocate(preferred, |n, name| {
            n.scope.contains(name) || n.conflicts.contains(name) || RESERVED.contains(&name)
        })
    }

    /// Upstream `ScopeRoot.unique`, used for hoisted names: no leading-digit or keyword check.
    pub fn unique(&mut self, preferred: &str) -> String {
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
        self.allocate(preferred, |n, name| n.conflicts.contains(name))
    }

    fn allocate(&mut self, preferred: String, taken: fn(&Self, &str) -> bool) -> String {
        let mut n = self.counters.get(&preferred).copied().unwrap_or(0);
        let mut name = if n == 0 {
            n = 1;
            preferred.clone()
        } else {
            n += 1;
            format!("{preferred}_{}", n - 1)
        };
        while taken(self, &name) {
            name = format!("{preferred}_{n}");
            n += 1;
        }
        self.counters.insert(preferred, n);
        self.scope.insert(name.clone());
        self.conflicts.insert(name.clone());
        name
    }
}
