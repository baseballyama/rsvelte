//! Where a program uses an import, a global variable or a member of a value.
//!
//! This is eslint-utils' `ReferenceTracker` (`iterateEsmReferences`, `iterateGlobalReferences`,
//! `iteratePropertyReferences`) for names one level deep.

use rustc_hash::FxHashSet;

use super::globals::global;
use crate::scope::{BindingIdentifier, Semantic};
use rsvelte_typescript_syntax::{Kind, NodeIdentifier, SyntaxTree};

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
                            tracker.lhs(local, Value::Name(export), true);
                        }
                    }
                    Kind::ImportDefault(local) => {
                        if let Some(export) = tracker.names.find("default") {
                            tracker.lhs(local, Value::Name(export), true);
                        }
                    }
                    Kind::ImportNamespace(local) => tracker.lhs(local, Value::Object, false),
                    _ => {}
                }
            }
        }
    }
    tracker.run()
}

/// `ESLint`'s default `globalObjectNames`, whose members are the globals.
pub const GLOBAL_OBJECTS: &[&str] = &["global", "globalThis", "self", "window"];

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
    globals(
        Tracker::new(syntax_tree, sem, parents, source_text, names),
        GLOBAL_OBJECTS,
    )
}

/// [`global_references`] for every global that `tracked` accepts, with `global_objects` in place
/// of `ESLint`'s default `globalObjectNames`.
#[must_use]
pub fn global_references_matching<'t>(
    syntax_tree: &'t SyntaxTree,
    sem: &'t Semantic,
    parents: &'t [NodeIdentifier],
    source_text: &'t str,
    tracked: impl Fn(&str) -> bool,
    global_objects: &[&str],
) -> Vec<TrackedReference<'t>> {
    let tracked = Matching(tracked);
    globals(
        Tracker::new(syntax_tree, sem, parents, source_text, &tracked),
        global_objects,
    )
}

/// The uses of the members `names` of `node`'s value, or of its member `prefix` path
/// (`iteratePropertyReferences`).
///
/// They are found through the variables and expressions that pass the value on, in no
/// particular order: `node.name`, `x.name` after `const x = node`, or `name` after
/// `const { name } = node`; with `prefix` `["env"]`, `node.env.name` or `env.name` after
/// `const { env } = node`.
#[must_use]
pub fn property_references<'a>(
    syntax_tree: &SyntaxTree,
    sem: &Semantic,
    parents: &[NodeIdentifier],
    source_text: &str,
    node: NodeIdentifier,
    prefix: &[&str],
    names: &[&'a str],
) -> Vec<TrackedReference<'a>> {
    let mut tracker = Tracker::new(syntax_tree, sem, parents, source_text, names);
    tracker.prefix = prefix;
    let value = tracker.member_of(None);
    tracker.pending.push((node, value, false));
    tracker.run()
}

fn globals<'t, 'a, N: Names<'t, 'a> + ?Sized>(
    mut tracker: Tracker<'t, 'a, '_, N>,
    global_objects: &[&str],
) -> Vec<TrackedReference<'a>> {
    let (syntax_tree, sem) = (tracker.syntax_tree, tracker.sem);
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
        if let Some(name) = tracker.names.find(name) {
            tracker
                .pending
                .push((reference.node, Value::Name(name), true));
        } else if global_objects.contains(&name) {
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
    /// A value whose member path `prefix[depth..]` leads to such an object.
    Prefix(usize),
}

/// How a tracker tells a tracked name: from a list, or by a predicate.
trait Names<'t, 'a> {
    fn find(&self, name: &'t str) -> Option<&'a str>;
}

impl<'t, 'a> Names<'t, 'a> for [&'a str] {
    fn find(&self, name: &'t str) -> Option<&'a str> {
        self.iter().copied().find(|tracked| *tracked == name)
    }
}

struct Matching<F>(F);

impl<'t, F: Fn(&str) -> bool> Names<'t, 't> for Matching<F> {
    fn find(&self, name: &'t str) -> Option<&'t str> {
        (self.0)(name).then_some(name)
    }
}

struct Tracker<'t, 'a, 'n, N: Names<'t, 'a> + ?Sized> {
    syntax_tree: &'t SyntaxTree,
    sem: &'t Semantic,
    parents: &'t [NodeIdentifier],
    source_text: &'t str,
    names: &'n N,
    /// The member path from the starting value to the object whose members are tracked.
    prefix: &'n [&'n str],
    /// Expressions still to follow, with their value and whether to report them.
    pending: Vec<(NodeIdentifier, Value<'a>, bool)>,
    /// Bindings already followed with a value, so that aliases of each other end.
    visited: FxHashSet<(BindingIdentifier, Value<'a>)>,
    out: Vec<TrackedReference<'a>>,
}

impl<'t, 'a, 'n, N: Names<'t, 'a> + ?Sized> Tracker<'t, 'a, 'n, N> {
    fn new(
        syntax_tree: &'t SyntaxTree,
        sem: &'t Semantic,
        parents: &'t [NodeIdentifier],
        source_text: &'t str,
        names: &'n N,
    ) -> Self {
        Self {
            syntax_tree,
            sem,
            parents,
            source_text,
            names,
            prefix: &[],
            pending: Vec::new(),
            visited: FxHashSet::default(),
            out: Vec::new(),
        }
    }

    fn parent(&self, node: NodeIdentifier) -> Option<NodeIdentifier> {
        self.parents[node.index()].opt()
    }

    /// The tracked name a key asks for (`getPropertyName`): `a` in `x.a`, `{ a }` or
    /// `{ "a": b }`, or a constant string in brackets.
    fn key(&self, key: NodeIdentifier, computed: bool) -> Option<&'a str> {
        self.names.find(self.key_text(key, computed)?)
    }

    fn key_text(&self, key: NodeIdentifier, computed: bool) -> Option<&'t str> {
        let tree = self.syntax_tree;
        match tree.kind(key) {
            Kind::Identifier(_) if !computed => Some(tree.name(key)),
            Kind::String => Some(tree.str_value(key, self.source_text)),
            Kind::Template {
                quasis: [quasi],
                expressions: [],
            } if computed => Some(tree.str_value(*quasi, self.source_text)),
            _ => None,
        }
    }

    /// The value of the member `key` of a value on the prefix path at `depth`, or the starting
    /// value for `None`.
    fn member_of(&self, depth: Option<usize>) -> Value<'a> {
        let next = depth.map_or(0, |depth| depth + 1);
        if next == self.prefix.len() {
            Value::Object
        } else {
            Value::Prefix(next)
        }
    }

    /// Whether `key` is the next member on the prefix path at `depth`.
    fn on_prefix(&self, depth: usize, key: NodeIdentifier, computed: bool) -> bool {
        self.key_text(key, computed) == Some(self.prefix[depth])
    }

    /// Follows what a pattern assigned `value` declares (`_iterateLhsReferences`). Its
    /// references are themselves uses of the name only for an import (`shouldReport`); an alias
    /// reports only what is done with it.
    fn lhs(&mut self, mut pattern: NodeIdentifier, value: Value<'a>, report: bool) {
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
                        self.pending.push((reference.node, value, report));
                    }
                }
            }
            Kind::ObjectPattern(properties) if !matches!(value, Value::Name(_)) => {
                for &property in properties {
                    let Kind::Property {
                        key,
                        value: target,
                        computed,
                        ..
                    } = tree.kind(property)
                    else {
                        continue;
                    };
                    match value {
                        Value::Object => {
                            if let Some(name) = self.key(key, computed) {
                                // Destructuring reads the member, as `x.name` does.
                                self.out.push(TrackedReference {
                                    node: property,
                                    name,
                                    call: None,
                                });
                                self.lhs(target, Value::Name(name), false);
                            }
                        }
                        Value::Prefix(depth) if self.on_prefix(depth, key, computed) => {
                            self.lhs(target, self.member_of(Some(depth)), false);
                        }
                        _ => {}
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
                } if object == top => match value {
                    Value::Object => {
                        if let Some(name) = self.key(property, computed) {
                            self.pending.push((parent, Value::Name(name), true));
                        }
                    }
                    Value::Prefix(depth) if self.on_prefix(depth, property, computed) => {
                        let next = self.member_of(Some(depth));
                        self.pending.push((parent, next, false));
                    }
                    _ => {}
                },
                Kind::Assign(_, left, right) if right == top => {
                    self.lhs(left, value, false);
                    self.pending.push((parent, value, false));
                }
                Kind::AssignPattern(left, right) if right == top => self.lhs(left, value, false),
                Kind::Declarator {
                    identifier,
                    initializer: Some(initializer),
                } if initializer == top => self.lhs(identifier, value, false),
                _ => {}
            }
        }
        self.out
    }
}

#[cfg(test)]
mod tests;
