//! `@eslint-community/eslint-utils`' `ReferenceTracker`: where a global variable or an import
//! flows through variables, members, calls and `new`.

use rsvelte_kernel::source::interning::Atom;
use rsvelte_typescript::scope::{BindingIdentifier, Semantic};
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};
use rustc_hash::FxHashMap;

/// What to report under a name: its reads, calls or constructions, and its properties.
#[derive(Clone, Copy, Debug)]
pub(super) struct Trace<'t> {
    pub read: bool,
    pub call: bool,
    pub construct: bool,
    pub properties: Properties<'t>,
}

#[derive(Clone, Copy, Debug)]
pub(super) enum Properties<'t> {
    List(&'t [(&'t str, Trace<'t>)]),
    /// A map too large to list, such as every browser global.
    Lookup(fn(&str) -> Option<&'t Trace<'t>>),
}

impl<'t> Trace<'t> {
    pub(super) const READ: Self = Self {
        read: true,
        ..Self::NONE
    };
    pub(super) const CALL: Self = Self {
        call: true,
        ..Self::NONE
    };
    pub(super) const CONSTRUCT: Self = Self {
        construct: true,
        ..Self::NONE
    };
    pub(super) const NONE: Self = Self {
        read: false,
        call: false,
        construct: false,
        properties: Properties::List(&[]),
    };

    pub(super) const fn properties(properties: &'t [(&'t str, Self)]) -> Self {
        Self {
            properties: Properties::List(properties),
            ..Self::NONE
        }
    }

    fn property(&self, key: &str) -> Option<&'t Self> {
        match self.properties {
            Properties::List(list) => list.iter().find(|(name, _)| *name == key).map(|(_, t)| t),
            Properties::Lookup(lookup) => lookup(key),
        }
    }
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub(super) enum Access {
    Read,
    Call,
    Construct,
}

#[derive(Clone, Debug)]
pub(super) struct Found<'a> {
    /// The read expression, the call, the `new` expression, or the import specifier or pattern
    /// property a read is named by.
    pub node: NodeIdentifier,
    pub path: Vec<&'a str>,
    pub access: Access,
}

#[derive(Debug)]
pub(super) struct ReferenceTracker<'a> {
    tree: &'a SyntaxTree,
    sem: &'a Semantic,
    parents: &'a [NodeIdentifier],
    source: &'a str,
    /// The variables being followed, so that `a = a` does not loop.
    stack: Vec<BindingIdentifier>,
}

impl<'a> ReferenceTracker<'a> {
    pub(super) const fn new(
        tree: &'a SyntaxTree,
        sem: &'a Semantic,
        parents: &'a [NodeIdentifier],
        source: &'a str,
    ) -> Self {
        Self {
            tree,
            sem,
            parents,
            source,
            stack: Vec::new(),
        }
    }

    /// `iterateGlobalReferences`: references to the declared, never assigned globals `trace`
    /// names, directly or as properties of `global_objects` (`window.Map`).
    pub(super) fn global_references(
        &mut self,
        trace: &Trace<'a>,
        global_objects: &[&str],
        declared: impl Fn(&str) -> bool,
        out: &mut Vec<Found<'a>>,
    ) {
        let mut globals: FxHashMap<Atom, (bool, Vec<NodeIdentifier>)> = FxHashMap::default();
        for reference in &self.sem.references {
            if reference.binding.is_some() {
                continue;
            }
            let Some(atom) = self.tree.atom(reference.node) else {
                continue;
            };
            let (written, nodes) = globals.entry(atom).or_default();
            *written |= reference.write;
            if reference.read {
                nodes.push(reference.node);
            }
        }
        let mut names: Vec<(&'a str, &Vec<NodeIdentifier>)> = globals
            .iter()
            .filter(|(_, (written, _))| !written)
            .map(|(&atom, (_, nodes))| (self.tree.atoms.get(atom), nodes))
            .filter(|(name, _)| declared(name))
            .collect();
        names.sort_by_key(|&(_, nodes)| nodes.first().map(|n| n.0));
        for &(name, nodes) in &names {
            if let Some(next) = trace.property(name) {
                for &node in nodes {
                    if next.read {
                        out.push(Found {
                            node,
                            path: vec![name],
                            access: Access::Read,
                        });
                    }
                    self.property_references(node, &[name], next, out);
                }
            }
        }
        for &(name, nodes) in &names {
            if global_objects.contains(&name) {
                for &node in nodes {
                    self.property_references(node, &[], trace, out);
                }
            }
        }
    }

    /// `iterateEsmReferences` over the imports of `module` among `statements`. Re-exports are not
    /// followed: no rule here traces a name through them.
    pub(super) fn esm_references(
        &mut self,
        statements: &[NodeIdentifier],
        module: &'a str,
        trace: &Trace<'a>,
        out: &mut Vec<Found<'a>>,
    ) {
        for &statement in statements {
            let Kind::Import {
                specifiers, source, ..
            } = self.tree.kind(statement)
            else {
                continue;
            };
            if self.tree.str_value(source, self.source) != module {
                continue;
            }
            for &specifier in specifiers {
                let (key, local) = match self.tree.kind(specifier) {
                    Kind::ImportNamed { imported, local } => (self.key(imported), local),
                    Kind::ImportDefault(local) => (Some("default"), local),
                    Kind::ImportNamespace(local) => {
                        self.variable_references(local, &[module], trace, out);
                        continue;
                    }
                    _ => continue,
                };
                let Some((key, next)) = key.and_then(|key| Some((key, trace.property(key)?)))
                else {
                    continue;
                };
                if next.read {
                    out.push(Found {
                        node: specifier,
                        path: vec![module, key],
                        access: Access::Read,
                    });
                }
                self.variable_references(local, &[module, key], next, out);
            }
        }
    }

    /// `iteratePropertyReferences`: what `node`'s value flows into.
    pub(super) fn property_references(
        &mut self,
        node: NodeIdentifier,
        path: &[&'a str],
        trace: &Trace<'a>,
        out: &mut Vec<Found<'a>>,
    ) {
        let node = self.pass_through(node);
        let Some(parent) = self.parent(node) else {
            return;
        };
        match self.tree.kind(parent) {
            Kind::Member {
                object,
                property,
                computed,
                ..
            } if object == node => {
                let key = if computed {
                    self.static_string(property)
                } else {
                    self.tree
                        .atom(property)
                        .map(|atom| self.tree.atoms.get(atom))
                };
                let Some((key, next)) = key.and_then(|key| Some((key, trace.property(key)?)))
                else {
                    return;
                };
                let path = [path, &[key]].concat();
                if next.read {
                    out.push(Found {
                        node: parent,
                        path: path.clone(),
                        access: Access::Read,
                    });
                }
                self.property_references(parent, &path, next, out);
            }
            Kind::Call { callee, .. } if callee == node && trace.call => out.push(Found {
                node: parent,
                path: path.to_vec(),
                access: Access::Call,
            }),
            Kind::New { callee, .. } if callee == node && trace.construct => out.push(Found {
                node: parent,
                path: path.to_vec(),
                access: Access::Construct,
            }),
            Kind::Assign(_, left, right) if right == node => {
                self.pattern_references(left, path, trace, out);
                self.property_references(parent, path, trace, out);
            }
            Kind::AssignPattern(left, right) if right == node => {
                self.pattern_references(left, path, trace, out);
            }
            Kind::Declarator {
                identifier,
                initializer,
            } if initializer == Some(node) => {
                self.pattern_references(identifier, path, trace, out);
            }
            _ => {}
        }
    }

    /// `_iterateLhsReferences`: the variables a pattern assigns `path`'s value to.
    fn pattern_references(
        &mut self,
        pattern: NodeIdentifier,
        path: &[&'a str],
        trace: &Trace<'a>,
        out: &mut Vec<Found<'a>>,
    ) {
        match self.tree.kind(pattern) {
            Kind::Identifier(_) => self.variable_references(pattern, path, trace, out),
            Kind::ObjectPattern(properties) => {
                for &property in properties {
                    let Kind::Property {
                        key,
                        value,
                        computed,
                        ..
                    } = self.tree.kind(property)
                    else {
                        continue;
                    };
                    let key = if computed {
                        self.static_string(key)
                    } else {
                        self.key(key)
                    };
                    let Some((key, next)) = key.and_then(|key| Some((key, trace.property(key)?)))
                    else {
                        continue;
                    };
                    let path = [path, &[key]].concat();
                    if next.read {
                        out.push(Found {
                            node: property,
                            path: path.clone(),
                            access: Access::Read,
                        });
                    }
                    self.pattern_references(value, &path, next, out);
                }
            }
            Kind::AssignPattern(left, _) => self.pattern_references(left, path, trace, out),
            _ => {}
        }
    }

    /// `_iterateVariableReferences` without reporting the reads themselves.
    fn variable_references(
        &mut self,
        identifier: NodeIdentifier,
        path: &[&'a str],
        trace: &Trace<'a>,
        out: &mut Vec<Found<'a>>,
    ) {
        let Some(binding) = self.sem.binding_of(identifier) else {
            return;
        };
        if self.stack.contains(&binding) {
            return;
        }
        self.stack.push(binding);
        let sem = self.sem;
        for reference in sem.references_to(binding) {
            if reference.read {
                self.property_references(reference.node, path, trace, out);
            }
        }
        self.stack.pop();
    }

    /// The node whose parent receives `node`'s value as is (`a` in `a || b`).
    fn pass_through(&self, mut node: NodeIdentifier) -> NodeIdentifier {
        while let Some(parent) = self.parent(node) {
            let passes = match self.tree.kind(parent) {
                Kind::Conditional {
                    consequent,
                    alternate,
                    ..
                } => node == consequent || node == alternate,
                Kind::Logical(..) => true,
                Kind::Sequence(items) => items.last() == Some(&node),
                _ => false,
            };
            if !passes {
                break;
            }
            node = parent;
        }
        node
    }

    pub(super) fn parent(&self, node: NodeIdentifier) -> Option<NodeIdentifier> {
        self.parents[node.index()].opt()
    }

    /// An identifier's name or a string literal's value: a key as written.
    fn key(&self, node: NodeIdentifier) -> Option<&'a str> {
        match self.tree.kind(node) {
            Kind::Identifier(atom) => Some(self.tree.atoms.get(atom)),
            _ => self.static_string(node),
        }
    }

    /// The value of a string literal or of a template literal without substitutions.
    fn static_string(&self, node: NodeIdentifier) -> Option<&'a str> {
        match self.tree.kind(node) {
            Kind::String => Some(self.tree.str_value(node, self.source)),
            Kind::Template {
                quasis: &[quasi],
                expressions: [],
            } => Some(self.tree.str_value(quasi, self.source)),
            _ => None,
        }
    }
}
