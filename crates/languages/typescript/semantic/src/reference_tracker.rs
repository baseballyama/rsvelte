//! Where a program uses an import, a global variable or a member of a value.
//!
//! This is eslint-utils' `ReferenceTracker` (`iterateEsmReferences`, `iterateGlobalReferences`,
//! `iteratePropertyReferences`) for names one level deep.

use oxc_ast::AstKind;
use oxc_ast::ast::{
    AssignmentTarget, AssignmentTargetMaybeDefault, AssignmentTargetProperty, BindingPattern,
    Expression, ImportDeclarationSpecifier, ModuleExportName, PropertyKey, Statement,
    TemplateLiteral,
};
use oxc_semantic::{AstNodes, NodeId, Scoping, SymbolId};
use rsvelte_typescript_tree::ProgramIdentifier;
use rustc_hash::FxHashSet;

use super::globals::global;
use crate::semantic::Semantic;

/// A use of a tracked name.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct TrackedReference<'a> {
    /// The expression whose value is the name's: an identifier, a member (`ns.name`,
    /// `window.name`), a destructured property or an assignment passing it on.
    pub node: NodeId,
    /// The tracked name, one of those asked for (`default` for a default import).
    pub name: &'a str,
    /// The call or `new` whose callee is [`TrackedReference::node`], through what upstream's
    /// `isPassThrough` passes through.
    pub call: Option<NodeId>,
}

/// The programs' uses of `exports` of module `specifier`, in no particular order.
#[must_use]
pub fn import_references<'a>(
    semantic: &Semantic,
    programs: &[ProgramIdentifier],
    specifier: &str,
    exports: &[&'a str],
) -> Vec<TrackedReference<'a>> {
    let mut tracker = Tracker::new(semantic, exports);
    for &program in programs {
        for statement in &semantic.tree().get_program(program).body {
            let Statement::ImportDeclaration(import) = statement else {
                continue;
            };
            if import.import_kind.is_type() || import.source.value != specifier {
                continue;
            }
            for imported in import.specifiers.iter().flatten() {
                match imported {
                    ImportDeclarationSpecifier::ImportSpecifier(s) if !s.import_kind.is_type() => {
                        let name = match &s.imported {
                            ModuleExportName::IdentifierName(n) => Some(n.name.as_str()),
                            ModuleExportName::IdentifierReference(n) => Some(n.name.as_str()),
                            ModuleExportName::StringLiteral(n) => n.value.as_str(),
                        };
                        if let Some(export) = name.and_then(|name| tracker.names.find(name)) {
                            tracker.follow(s.local.symbol_id.get(), Value::Name(export), true);
                        }
                    }
                    ImportDeclarationSpecifier::ImportDefaultSpecifier(s) => {
                        if let Some(export) = tracker.names.find("default") {
                            tracker.follow(s.local.symbol_id.get(), Value::Name(export), true);
                        }
                    }
                    ImportDeclarationSpecifier::ImportNamespaceSpecifier(s) => {
                        tracker.follow(s.local.symbol_id.get(), Value::Object, false);
                    }
                    ImportDeclarationSpecifier::ImportSpecifier(_) => {}
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
pub fn global_references<'a>(semantic: &Semantic, names: &[&'a str]) -> Vec<TrackedReference<'a>> {
    globals(Tracker::new(semantic, names), GLOBAL_OBJECTS)
}

/// [`global_references`] for every global that `tracked` accepts, with `global_objects` in place
/// of `ESLint`'s default `globalObjectNames`.
#[must_use]
pub fn global_references_matching<'s>(
    semantic: &'s Semantic,
    tracked: impl Fn(&str) -> bool,
    global_objects: &[&str],
) -> Vec<TrackedReference<'s>> {
    let tracked = Matching(tracked);
    globals(Tracker::new(semantic, &tracked), global_objects)
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
    semantic: &Semantic,
    node: NodeId,
    prefix: &[&str],
    names: &[&'a str],
) -> Vec<TrackedReference<'a>> {
    let mut tracker = Tracker::new(semantic, names);
    tracker.prefix = prefix;
    let value = tracker.member_of(None);
    tracker.pending.push((node, value, false));
    tracker.run()
}

fn globals<'s, 'a, N: Names<'s, 'a> + ?Sized>(
    mut tracker: Tracker<'s, 'a, '_, N>,
    global_objects: &[&str],
) -> Vec<TrackedReference<'a>> {
    let scoping = tracker.scoping;
    let unresolved = scoping.root_unresolved_references();
    let modified: FxHashSet<&str> = unresolved
        .iter()
        .filter(|(_, ids)| ids.iter().any(|&id| scoping.get_reference(id).is_write()))
        .map(|(name, _)| name.as_str())
        .collect();
    for (name, ids) in unresolved {
        let name: &'s str = name.as_str();
        if global(name).is_none() || modified.contains(name) {
            continue;
        }
        let (value, report) = if let Some(name) = tracker.names.find(name) {
            (Value::Name(name), true)
        } else if global_objects.contains(&name) {
            (Value::Object, false)
        } else {
            continue;
        };
        for &id in ids {
            let reference = scoping.get_reference(id);
            if reference.is_read() {
                tracker.pending.push((reference.node_id(), value, report));
            }
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
trait Names<'s, 'a> {
    fn find(&self, name: &'s str) -> Option<&'a str>;
}

impl<'s, 'a> Names<'s, 'a> for [&'a str] {
    fn find(&self, name: &'s str) -> Option<&'a str> {
        self.iter().copied().find(|tracked| *tracked == name)
    }
}

struct Matching<F>(F);

impl<'s, F: Fn(&str) -> bool> Names<'s, 's> for Matching<F> {
    fn find(&self, name: &'s str) -> Option<&'s str> {
        (self.0)(name).then_some(name)
    }
}

/// What a destructured property assigns to.
#[derive(Clone, Copy)]
enum Target<'s> {
    Binding(&'s BindingPattern<'s>),
    Assignment(&'s AssignmentTarget<'s>),
    Symbol(Option<SymbolId>),
}

/// The name a property key asks for (`getPropertyName`): `a` in `{ a }` or `{ "a": b }`, or a
/// constant string in brackets.
fn property_key<'s>(key: &'s PropertyKey<'s>, computed: bool) -> Option<&'s str> {
    match key {
        PropertyKey::StaticIdentifier(id) if !computed => Some(id.name.as_str()),
        PropertyKey::StringLiteral(s) => s.value.as_str(),
        PropertyKey::TemplateLiteral(t) if computed => template_text(t),
        _ => None,
    }
}

/// The name a computed member asks for: a constant string in brackets.
fn computed_key<'s>(key: &'s Expression<'s>) -> Option<&'s str> {
    match key {
        Expression::StringLiteral(s) => s.value.as_str(),
        Expression::TemplateLiteral(t) => template_text(t),
        _ => None,
    }
}

fn template_text<'s>(t: &'s TemplateLiteral<'s>) -> Option<&'s str> {
    match (t.quasis.as_slice(), t.expressions.is_empty()) {
        ([quasi], true) => quasi.value.cooked.as_ref().and_then(|c| c.as_str()),
        _ => None,
    }
}

struct Tracker<'s, 'a, 'n, N: Names<'s, 'a> + ?Sized> {
    scoping: &'s Scoping,
    nodes: &'s AstNodes<'s>,
    names: &'n N,
    /// The member path from the starting value to the object whose members are tracked.
    prefix: &'n [&'n str],
    /// Expressions still to follow, with their value and whether to report them.
    pending: Vec<(NodeId, Value<'a>, bool)>,
    /// Symbols already followed with a value, so that aliases of each other end.
    visited: FxHashSet<(SymbolId, Value<'a>)>,
    out: Vec<TrackedReference<'a>>,
}

impl<'s, 'a, 'n, N: Names<'s, 'a> + ?Sized> Tracker<'s, 'a, 'n, N> {
    fn new(semantic: &'s Semantic, names: &'n N) -> Self {
        Self {
            scoping: semantic.scoping(),
            nodes: semantic.nodes(),
            names,
            prefix: &[],
            pending: Vec::new(),
            visited: FxHashSet::default(),
            out: Vec::new(),
        }
    }

    /// The value of the member of a value on the prefix path at `depth`, or the starting value
    /// for `None`.
    fn member_of(&self, depth: Option<usize>) -> Value<'a> {
        let next = depth.map_or(0, |depth| depth + 1);
        if next == self.prefix.len() {
            Value::Object
        } else {
            Value::Prefix(next)
        }
    }

    /// The value of the member `key` of a `value`, and whether it is a use to report, when
    /// anything is tracked through it.
    fn member(&self, value: Value<'a>, key: Option<&'s str>) -> Option<(Value<'a>, bool)> {
        let key = key?;
        match value {
            Value::Object => self.names.find(key).map(|name| (Value::Name(name), true)),
            Value::Prefix(depth) if self.prefix[depth] == key => {
                Some((self.member_of(Some(depth)), false))
            }
            _ => None,
        }
    }

    /// Follows the reads of `symbol`. Its references are themselves uses of the name only for an
    /// import (`shouldReport`); an alias reports only what is done with it.
    fn follow(&mut self, symbol: Option<SymbolId>, value: Value<'a>, report: bool) {
        let Some(symbol) = symbol else { return };
        if !self.visited.insert((symbol, value)) {
            return;
        }
        for reference in self.scoping.get_resolved_references(symbol) {
            if reference.is_read() {
                self.pending.push((reference.node_id(), value, report));
            }
        }
    }

    /// Follows what a destructured property `node` with `key` assigns (`_iterateLhsReferences`).
    fn property(
        &mut self,
        node: NodeId,
        key: Option<&'s str>,
        target: Target<'s>,
        value: Value<'a>,
    ) {
        let Some((next, reported)) = self.member(value, key) else {
            return;
        };
        if let (true, Value::Name(name)) = (reported, next) {
            // Destructuring reads the member, as `x.name` does.
            self.out.push(TrackedReference {
                node,
                name,
                call: None,
            });
        }
        match target {
            Target::Binding(pattern) => self.binding(pattern, next),
            Target::Assignment(target) => self.assignment(target, next),
            Target::Symbol(symbol) => self.follow(symbol, next, false),
        }
    }

    /// Follows what a declared pattern assigned `value` declares.
    fn binding(&mut self, mut pattern: &'s BindingPattern<'s>, value: Value<'a>) {
        while let BindingPattern::AssignmentPattern(p) = pattern {
            pattern = &p.left;
        }
        match pattern {
            BindingPattern::BindingIdentifier(id) => self.follow(id.symbol_id.get(), value, false),
            BindingPattern::ObjectPattern(object) if !matches!(value, Value::Name(_)) => {
                for p in &object.properties {
                    let key = property_key(&p.key, p.computed);
                    self.property(p.node_id(), key, Target::Binding(&p.value), value);
                }
            }
            _ => {}
        }
    }

    /// Follows what an assignment target assigned `value` assigns.
    fn assignment(&mut self, target: &'s AssignmentTarget<'s>, value: Value<'a>) {
        match target {
            AssignmentTarget::AssignmentTargetIdentifier(id) => {
                let symbol = self.scoping.get_reference(id.reference_id()).symbol_id();
                self.follow(symbol, value, false);
            }
            AssignmentTarget::ObjectAssignmentTarget(object)
                if !matches!(value, Value::Name(_)) =>
            {
                for p in &object.properties {
                    match p {
                        AssignmentTargetProperty::AssignmentTargetPropertyIdentifier(p) => {
                            let reference = self.scoping.get_reference(p.binding.reference_id());
                            let key = Some(p.binding.name.as_str());
                            let target = Target::Symbol(reference.symbol_id());
                            self.property(p.node_id(), key, target, value);
                        }
                        AssignmentTargetProperty::AssignmentTargetPropertyProperty(p) => {
                            let key = property_key(&p.name, p.computed);
                            let target = match &p.binding {
                                AssignmentTargetMaybeDefault::AssignmentTargetWithDefault(d) => {
                                    &d.binding
                                }
                                target => target.to_assignment_target(),
                            };
                            self.property(p.node_id(), key, Target::Assignment(target), value);
                        }
                    }
                }
            }
            _ => {}
        }
    }

    /// The node `node`'s value reaches unchanged (`isPassThrough`).
    fn top(&self, mut node: NodeId) -> NodeId {
        loop {
            let parent = self.nodes.parent_id(node);
            if parent == node {
                return node;
            }
            let passes = match self.nodes.kind(parent) {
                AstKind::ConditionalExpression(c) => {
                    c.consequent.node_id() == node || c.alternate.node_id() == node
                }
                AstKind::SequenceExpression(s) => {
                    s.expressions.last().map(Expression::node_id) == Some(node)
                }
                AstKind::LogicalExpression(_)
                | AstKind::ChainExpression(_)
                | AstKind::TSAsExpression(_)
                | AstKind::TSSatisfiesExpression(_)
                | AstKind::TSTypeAssertion(_)
                | AstKind::TSNonNullExpression(_)
                | AstKind::TSInstantiationExpression(_) => true,
                _ => false,
            };
            if !passes {
                return node;
            }
            node = parent;
        }
    }

    /// Follows every pending expression (`_iteratePropertyReferences`).
    fn run(mut self) -> Vec<TrackedReference<'a>> {
        let nodes = self.nodes;
        while let Some((node, value, report)) = self.pending.pop() {
            let top = self.top(node);
            let parent = nodes.parent_id(top);
            let parent = (parent != top).then_some(parent);
            let call = parent.filter(|&parent| match nodes.kind(parent) {
                AstKind::CallExpression(c) => c.callee.node_id() == top,
                AstKind::NewExpression(n) => n.callee.node_id() == top,
                _ => false,
            });
            if let Value::Name(name) = value
                && (report || call.is_some())
            {
                self.out.push(TrackedReference { node, name, call });
            }
            let Some(parent) = parent else { continue };
            match nodes.kind(parent) {
                AstKind::StaticMemberExpression(m) if m.object.node_id() == top => {
                    if let Some((next, report)) = self.member(value, Some(m.property.name.as_str()))
                    {
                        self.pending.push((parent, next, report));
                    }
                }
                AstKind::ComputedMemberExpression(m) if m.object.node_id() == top => {
                    if let Some((next, report)) = self.member(value, computed_key(&m.expression)) {
                        self.pending.push((parent, next, report));
                    }
                }
                AstKind::AssignmentExpression(a) if a.right.node_id() == top => {
                    self.assignment(&a.left, value);
                    self.pending.push((parent, value, false));
                }
                AstKind::AssignmentPattern(p) if p.right.node_id() == top => {
                    self.binding(&p.left, value);
                }
                AstKind::AssignmentTargetWithDefault(d) if d.init.node_id() == top => {
                    self.assignment(&d.binding, value);
                }
                AstKind::FormalParameter(p)
                    if p.initializer.as_deref().map(Expression::node_id) == Some(top) =>
                {
                    self.binding(&p.pattern, value);
                }
                AstKind::VariableDeclarator(d)
                    if d.init.as_ref().map(Expression::node_id) == Some(top) =>
                {
                    self.binding(&d.id, value);
                }
                _ => {}
            }
        }
        self.out
    }
}

#[cfg(test)]
mod tests;
