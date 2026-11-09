//! Where a program uses what it imports: `ESLint`'s `ReferenceTracker.iterateEsmReferences`.

use rustc_hash::FxHashSet;

use crate::scope::{BindingIdentifier, Semantic};
use crate::{Kind, NodeIdentifier, SyntaxTree};

/// A use of an imported export.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct ImportReference<'a> {
    /// The expression whose value is the export: an identifier, or `ns.name` for a namespace.
    pub node: NodeIdentifier,
    /// The export's name, one of those asked for (`default` for a default import).
    pub export: &'a str,
    /// The call or `new` whose callee is [`ImportReference::node`].
    pub call: Option<NodeIdentifier>,
}

/// The programs' uses of `exports` of module `specifier`, in no particular order: through named,
/// default and namespace imports, and through `const alias = name` and `const { name } = ns`.
#[must_use]
pub fn import_references<'a>(
    syntax_tree: &SyntaxTree,
    sem: &Semantic,
    parents: &[NodeIdentifier],
    source_text: &str,
    programs: &[NodeIdentifier],
    specifier: &str,
    exports: &[&'a str],
) -> Vec<ImportReference<'a>> {
    let mut tracker = Tracker {
        syntax_tree,
        sem,
        parents,
        source_text,
        exports,
        visited: FxHashSet::default(),
        out: Vec::new(),
    };
    for &program in programs {
        let Kind::Program(body) = syntax_tree.kind(program) else {
            continue;
        };
        for &statement in body {
            let Kind::Import {
                specifiers,
                source,
                type_only: false,
                ..
            } = syntax_tree.kind(statement)
            else {
                continue;
            };
            if syntax_tree.str_value(source, source_text) != specifier {
                continue;
            }
            for &imported in specifiers {
                match syntax_tree.kind(imported) {
                    Kind::ImportNamed { imported, local } => {
                        if let Some(export) = tracker.export(imported) {
                            tracker.binding(local, Some(export));
                        }
                    }
                    Kind::ImportDefault(local) => {
                        if let Some(export) = tracker.find("default") {
                            tracker.binding(local, Some(export));
                        }
                    }
                    Kind::ImportNamespace(local) => tracker.binding(local, None),
                    _ => {}
                }
            }
        }
    }
    tracker.out
}

struct Tracker<'t, 'a> {
    syntax_tree: &'t SyntaxTree,
    sem: &'t Semantic,
    parents: &'t [NodeIdentifier],
    source_text: &'t str,
    exports: &'t [&'a str],
    /// Bindings already followed, so that aliases of each other end.
    visited: FxHashSet<BindingIdentifier>,
    out: Vec<ImportReference<'a>>,
}

impl<'a> Tracker<'_, 'a> {
    fn find(&self, name: &str) -> Option<&'a str> {
        self.exports.iter().copied().find(|export| *export == name)
    }

    /// The export a name node (`a` in `{ a }` or `x.a`, or `"a"`) asks for.
    fn export(&self, name: NodeIdentifier) -> Option<&'a str> {
        match self.syntax_tree.kind(name) {
            Kind::Identifier(_) => self.find(self.syntax_tree.name(name)),
            Kind::String => self.find(self.syntax_tree.str_value(name, self.source_text)),
            _ => None,
        }
    }

    /// Follows the reads of the binding `identifier` declares: an export, or a namespace (`None`).
    fn binding(&mut self, identifier: NodeIdentifier, export: Option<&'a str>) {
        let Some(binding) = self.sem.binding_of(identifier) else {
            return;
        };
        if !self.visited.insert(binding) {
            return;
        }
        let reads: Vec<NodeIdentifier> = self
            .sem
            .references_to(binding)
            .filter(|reference| reference.read)
            .map(|reference| reference.node)
            .collect();
        for node in reads {
            match export {
                Some(export) => self.value(node, export),
                None => self.namespace(node),
            }
        }
    }

    /// `node` reads a namespace: its members are the exports.
    fn namespace(&mut self, node: NodeIdentifier) {
        let parent = self.parents[node.index()];
        if parent.is_none() {
            return;
        }
        match self.syntax_tree.kind(parent) {
            Kind::Member {
                object,
                property,
                computed,
                ..
            } if object == node => {
                let name = if computed {
                    matches!(self.syntax_tree.kind(property), Kind::String).then_some(property)
                } else {
                    Some(property)
                };
                if let Some(export) = name.and_then(|name| self.export(name)) {
                    self.value(parent, export);
                }
            }
            Kind::Declarator {
                identifier,
                initializer: Some(initializer),
            } if initializer == node => match self.syntax_tree.kind(identifier) {
                Kind::Identifier(_) => self.binding(identifier, None),
                Kind::ObjectPattern(properties) => {
                    for &property in properties {
                        if let Kind::Property {
                            key,
                            value,
                            computed,
                            ..
                        } = self.syntax_tree.kind(property)
                            && (!computed || matches!(self.syntax_tree.kind(key), Kind::String))
                            && let Some(export) = self.export(key)
                            && matches!(self.syntax_tree.kind(value), Kind::Identifier(_))
                        {
                            self.binding(value, Some(export));
                        }
                    }
                }
                _ => {}
            },
            _ => {}
        }
    }

    /// `node` evaluates to `export`.
    fn value(&mut self, node: NodeIdentifier, export: &'a str) {
        let parent = self.parents[node.index()];
        let call = parent
            .opt()
            .filter(|&parent| match self.syntax_tree.kind(parent) {
                Kind::Call { callee, .. } | Kind::New { callee, .. } => callee == node,
                _ => false,
            });
        self.out.push(ImportReference { node, export, call });
        if let Some(parent) = parent.opt()
            && let Kind::Declarator {
                identifier,
                initializer: Some(initializer),
            } = self.syntax_tree.kind(parent)
            && initializer == node
            && matches!(self.syntax_tree.kind(identifier), Kind::Identifier(_))
        {
            self.binding(identifier, Some(export));
        }
    }
}

#[cfg(test)]
mod tests;
