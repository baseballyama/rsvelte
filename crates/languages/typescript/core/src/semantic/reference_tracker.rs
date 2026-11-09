//! Where a program uses what it imports from a module or a global variable: eslint-utils'
//! `ReferenceTracker` (`iterateEsmReferences`, `iterateGlobalReferences`) for names one level
//! deep.

use rustc_hash::FxHashSet;

use super::globals::global;
use crate::scope::{BindingIdentifier, Semantic};
use crate::{Kind, NodeIdentifier, SyntaxTree};

/// A use of a tracked name.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct TrackedReference<'a> {
    /// The expression whose value is the name's: an identifier, a member (`ns.name`,
    /// `window.name`) or an assignment passing it on.
    pub node: NodeIdentifier,
    /// The tracked name, one of those asked for (`default` for a default import).
    pub name: &'a str,
    /// The call or `new` whose callee is [`TrackedReference::node`], through `a || b`,
    /// `c ? a : b`, `(x, a)` and TypeScript casts.
    pub call: Option<NodeIdentifier>,
}

/// The programs' uses of `exports` of module `specifier`, in no particular order.
#[must_use]
pub fn import_references<'a>(
    syntax_tree: &SyntaxTree,
    sem: &Semantic,
    parents: &[NodeIdentifier],
    source_text: &str,
    programs: &[NodeIdentifier],
    specifier: &str,
    exports: &[&'a str],
) -> Vec<TrackedReference<'a>> {
    let mut tracker = Tracker::new(syntax_tree, sem, parents, source_text, exports);
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
                        if let Some(export) = tracker.key(imported, false) {
                            tracker.lhs(local, Value::Name(export));
                        }
                    }
                    Kind::ImportDefault(local) => {
                        if let Some(export) = tracker.find("default") {
                            tracker.lhs(local, Value::Name(export));
                        }
                    }
                    Kind::ImportNamespace(local) => tracker.lhs(local, Value::Object),
                    _ => {}
                }
            }
        }
    }
    tracker.run()
}

/// `ESLint`'s default `globalObjectNames`, whose members are the globals.
const GLOBAL_OBJECTS: &[&str] = &["global", "globalThis", "self", "window"];

/// The uses of the global variables `names`, directly or as members of `window`, `globalThis`
/// and `self`, in no particular order.
///
/// As in `ESLint`, a global counts only when it is declared (see [`global`]) and nothing
/// assigns it.
#[must_use]
pub fn global_references<'a>(
    syntax_tree: &SyntaxTree,
    sem: &Semantic,
    parents: &[NodeIdentifier],
    source_text: &str,
    names: &[&'a str],
) -> Vec<TrackedReference<'a>> {
    let mut tracker = Tracker::new(syntax_tree, sem, parents, source_text, names);
    let unresolved = || {
        sem.references
            .iter()
            .filter(|reference| reference.binding.is_none())
    };
    let modified: FxHashSet<&str> = unresolved()
        .filter(|reference| reference.write)
        .map(|reference| syntax_tree.name(reference.node))
        .collect();
    let usable = |name: &str| global(name).is_some() && !modified.contains(name);
    for reference in unresolved().filter(|reference| reference.read) {
        let name = syntax_tree.name(reference.node);
        if !usable(name) {
            continue;
        }
        if let Some(name) = tracker.find(name) {
            tracker
                .pending
                .push((reference.node, Value::Name(name), true));
        } else if GLOBAL_OBJECTS.contains(&name) {
            tracker.pending.push((reference.node, Value::Object, false));
        }
    }
    tracker.run()
}

/// What an expression evaluates to.
#[derive(Clone, Copy, PartialEq, Eq, Hash)]
enum Value<'a> {
    /// A tracked name's value.
    Name(&'a str),
    /// A namespace or global object, whose members are the tracked names.
    Object,
}

struct Tracker<'t, 'a> {
    syntax_tree: &'t SyntaxTree,
    sem: &'t Semantic,
    parents: &'t [NodeIdentifier],
    source_text: &'t str,
    names: &'t [&'a str],
    /// Expressions still to follow, with their value and whether to report them.
    pending: Vec<(NodeIdentifier, Value<'a>, bool)>,
    /// Bindings already followed with a value, so that aliases of each other end.
    visited: FxHashSet<(BindingIdentifier, Value<'a>)>,
    out: Vec<TrackedReference<'a>>,
}

impl<'t, 'a> Tracker<'t, 'a> {
    fn new(
        syntax_tree: &'t SyntaxTree,
        sem: &'t Semantic,
        parents: &'t [NodeIdentifier],
        source_text: &'t str,
        names: &'t [&'a str],
    ) -> Self {
        Self {
            syntax_tree,
            sem,
            parents,
            source_text,
            names,
            pending: Vec::new(),
            visited: FxHashSet::default(),
            out: Vec::new(),
        }
    }

    fn find(&self, name: &str) -> Option<&'a str> {
        self.names.iter().copied().find(|tracked| *tracked == name)
    }

    fn parent(&self, node: NodeIdentifier) -> Option<NodeIdentifier> {
        self.parents[node.index()].opt()
    }

    /// The tracked name a key asks for (`getPropertyName`): `a` in `x.a`, `{ a }` or
    /// `{ "a": b }`, or a constant string in brackets.
    fn key(&self, key: NodeIdentifier, computed: bool) -> Option<&'a str> {
        let tree = self.syntax_tree;
        match tree.kind(key) {
            Kind::Identifier(_) if !computed => self.find(tree.name(key)),
            Kind::String => self.find(tree.str_value(key, self.source_text)),
            Kind::Template {
                quasis: [quasi],
                expressions: [],
            } if computed => self.find(tree.str_value(*quasi, self.source_text)),
            _ => None,
        }
    }

    /// Follows what a pattern assigned `value` declares (`_iterateLhsReferences`).
    fn lhs(&mut self, mut pattern: NodeIdentifier, value: Value<'a>) {
        let tree = self.syntax_tree;
        while let Kind::AssignPattern(left, _) = tree.kind(pattern) {
            pattern = left;
        }
        match tree.kind(pattern) {
            Kind::Identifier(_) => {
                let Some(binding) = self.sem.binding_of(pattern) else {
                    return;
                };
                if !self.visited.insert((binding, value)) {
                    return;
                }
                for reference in self.sem.references_to(binding) {
                    if reference.read {
                        self.pending.push((reference.node, value, true));
                    }
                }
            }
            Kind::ObjectPattern(properties) if value == Value::Object => {
                for &property in properties {
                    if let Kind::Property {
                        key,
                        value: target,
                        computed,
                        ..
                    } = tree.kind(property)
                        && let Some(name) = self.key(key, computed)
                    {
                        self.lhs(target, Value::Name(name));
                    }
                }
            }
            _ => {}
        }
    }

    /// Follows every pending expression (`_iteratePropertyReferences`).
    fn run(mut self) -> Vec<TrackedReference<'a>> {
        let tree = self.syntax_tree;
        while let Some((node, value, report)) = self.pending.pop() {
            // The node the value reaches unchanged.
            let mut top = node;
            while let Some(parent) = self.parent(top) {
                let passes = match tree.kind(parent) {
                    Kind::Conditional {
                        consequent,
                        alternate,
                        ..
                    } => top == consequent || top == alternate,
                    Kind::Logical(..) => true,
                    Kind::Sequence(expressions) => expressions.last() == Some(&top),
                    _ => false,
                };
                if !passes {
                    break;
                }
                top = parent;
            }
            let parent = self.parent(top);
            let call = parent.filter(|&parent| match tree.kind(parent) {
                Kind::Call { callee, .. } | Kind::New { callee, .. } => callee == top,
                _ => false,
            });
            if let Value::Name(name) = value
                && (report || call.is_some())
            {
                self.out.push(TrackedReference { node, name, call });
            }
            let Some(parent) = parent else { continue };
            match tree.kind(parent) {
                Kind::Member {
                    object,
                    property,
                    computed,
                    ..
                } if object == top && value == Value::Object => {
                    if let Some(name) = self.key(property, computed) {
                        self.pending.push((parent, Value::Name(name), true));
                    }
                }
                Kind::Assign(_, left, right) if right == top => {
                    self.lhs(left, value);
                    self.pending.push((parent, value, false));
                }
                Kind::AssignPattern(left, right) if right == top => self.lhs(left, value),
                Kind::Declarator {
                    identifier,
                    initializer: Some(initializer),
                } if initializer == top => self.lhs(identifier, value),
                _ => {}
            }
        }
        self.out
    }
}

#[cfg(test)]
mod tests;
