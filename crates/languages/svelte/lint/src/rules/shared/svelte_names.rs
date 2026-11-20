//! The names `svelte-eslint-parser` resolves that a component's JavaScript scopes leave unresolved:
//! its globals, store subscriptions, names `$:` declares, and top-level names, which it keeps in
//! one scope for both scripts and the template.

use oxc_ast::ast::Statement;
use oxc_semantic::{ScopeId, SymbolId};
use rsvelte_svelte_semantic::compiler_syntax_tree::NodeKind;
use rsvelte_svelte_semantic::resolve::{Resolution, TemplateScope};
use rustc_hash::FxHashMap;

use super::legacy_reactivity::legacy;
use crate::rule::File;

/// `svelte-eslint-parser`'s globals, which subscribe to nothing (`globalsForSvelte`).
const SVELTE_GLOBALS: [&str; 3] = ["$$slots", "$$props", "$$restProps"];
/// Its globals outside legacy mode (`globalsForRunes`).
const RUNE_GLOBALS: [&str; 7] = [
    "$state",
    "$derived",
    "$effect",
    "$props",
    "$bindable",
    "$inspect",
    "$host",
];

/// Whether `svelte-eslint-parser` declares `name` as a global; `runes` unless the component is
/// known to be in legacy mode.
pub(crate) fn is_svelte_global(name: &str, runes: bool) -> bool {
    SVELTE_GLOBALS.contains(&name) || (runes && RUNE_GLOBALS.contains(&name))
}

/// A component's top-level names, which `svelte-eslint-parser` keeps in one module scope.
pub(crate) struct TopLevelNames<'a> {
    resolution: &'a Resolution,
    /// The instance's scope, the module's and the root fragment's.
    scopes: [Option<ScopeId>; 3],
    snippets: FxHashMap<&'a str, SymbolId>,
}

impl<'a> TopLevelNames<'a> {
    /// `None` for a module.
    pub(crate) fn new(file: &File<'a>) -> Option<Self> {
        let resolution = file.resolution()?;
        let scoping = resolution.scoping();
        let tree = file.normalized();
        // The root fragment's names are top-level names to `svelte-eslint-parser`.
        let root =
            tree.and_then(|tree| resolution.template_scope(TemplateScope::Fragment(tree.root)));
        let mut snippets = FxHashMap::default();
        for (identifier, node) in tree.iter().flat_map(|tree| tree.nodes.iter_enumerated()) {
            if matches!(node.kind, NodeKind::Snippet(_))
                && node.parent.is_none()
                && let Some(symbol) = resolution.snippet(identifier)
            {
                snippets.insert(scoping.symbol_name(symbol), symbol);
            }
        }
        Some(Self {
            resolution,
            scopes: [
                Some(resolution.instance_scope()),
                Some(scoping.root_scope_id()),
                root,
            ],
            snippets,
        })
    }

    pub(crate) fn scoping(&self) -> &'a oxc_semantic::Scoping {
        self.resolution.scoping()
    }

    /// The top-level names the unresolved `name` subscribes to as a store (`analyzeStoreScope`).
    pub(crate) fn stores<'s>(
        &'s self,
        name: &'s str,
        runes: bool,
    ) -> impl Iterator<Item = SymbolId> + 's {
        let store = name
            .strip_prefix('$')
            .filter(|_| !is_svelte_global(name, runes));
        let scoping = self.resolution.scoping();
        (self.scopes.iter().flatten())
            .filter_map(move |&scope| scoping.get_binding(scope, store?.into()))
    }

    /// The top-level name an unresolved `name` refers to: one the other script or the root
    /// fragment declares.
    pub(crate) fn binding(&self, name: &str) -> Option<SymbolId> {
        let scoping = self.resolution.scoping();
        (self.scopes.iter().flatten()).find_map(|&scope| scoping.get_binding(scope, name.into()))
    }

    /// The top-level snippet the scripts' unresolved `name` refers to.
    pub(crate) fn snippet(&self, name: &str) -> Option<SymbolId> {
        self.snippets.get(name).copied()
    }

    /// Whether the template has top-level snippets.
    pub(crate) fn has_snippets(&self) -> bool {
        !self.snippets.is_empty()
    }
}

/// Whether a script has a top-level `$:` statement; most components have none, and then need no
/// legacy facts.
pub(crate) fn has_reactive_statement(file: &File<'_>) -> bool {
    let (Some(component), tree) = (file.component(), file.javascript()) else {
        return false;
    };
    (component.module.iter().chain(&component.instance)).any(|script| {
        tree.get_program(script.program).body.iter().any(|statement| {
            matches!(statement, Statement::LabeledStatement(labeled) if labeled.label.name == "$")
        })
    })
}

/// The names a top-level `$: name = …` declares (`analyzeReactiveScope`).
pub(crate) fn reactive_names<'a>(file: &File<'a>) -> impl Iterator<Item = &'a str> {
    let implicit = if has_reactive_statement(file) {
        legacy(file).implicit.as_slice()
    } else {
        &[]
    };
    implicit.iter().map(|implicit| &*implicit.name)
}
