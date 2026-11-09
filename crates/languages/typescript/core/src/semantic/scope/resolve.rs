use std::cmp::Reverse;

use super::{
    Analyzer, AssignmentOperator, Atom, BindingIdentifier, HostRoot, Kind, NodeIdentifier,
    Reference, ScopeIdentifier, Span, TypedIndex,
};

#[derive(Clone, Copy)]
pub(super) enum ReferenceContext {
    Expression,
    /// A binding pattern: identifiers declare, defaults and computed keys are expressions.
    /// `initializer` when the identifiers are also written (an initialised declarator, a default
    /// value).
    Pattern {
        initializer: bool,
    },
    /// An assignment target; `read` for compound operators.
    Target {
        read: bool,
    },
}

/// Pass 2's pending steps, run in source order on an explicit stack as pass 1's are.
pub(super) enum Resolve {
    Node(NodeIdentifier, ReferenceContext),
    /// Each child, as an expression.
    Children(NodeIdentifier),
    /// The scope the node opens, if it is not the current one.
    Enter(NodeIdentifier),
    Leave,
    /// A member chain rooted at this node is assigned through.
    Mutation(NodeIdentifier),
}

/// How a scope on the stack was opened: whether [`Analyzer::visible`] gained its bindings or was
/// rebuilt for it.
#[derive(Clone, Copy, PartialEq, Eq)]
pub(super) enum Opened {
    NotEntered,
    Nested,
    Rebuilt,
}

impl Analyzer<'_> {
    // ---- pass 2 --------------------------------------------------------------------------------

    /// What `name` refers to in the current scope, in constant time: [`Analyzer::visible`] holds
    /// the bindings of exactly the current scope's chain.
    pub(super) fn lookup(&self, name: Atom) -> Option<BindingIdentifier> {
        self.visible
            .get(&name)
            .and_then(|bindings| bindings.last().copied())
    }

    /// Groups the bindings by scope, once pass 1 has declared them all.
    pub(super) fn index_scope_bindings(&mut self) {
        let mut start = vec![0u32; self.s.scopes.len() + 1];
        for binding in &self.s.bindings {
            start[binding.scope.index() + 1] += 1;
        }
        for i in 1..start.len() {
            start[i] += start[i - 1];
        }
        let mut fill = start.clone();
        let mut grouped = vec![BindingIdentifier::new(0); self.s.bindings.len()];
        for (identifier, binding) in self.s.bindings.iter_enumerated() {
            grouped[fill[binding.scope.index()] as usize] = identifier;
            fill[binding.scope.index()] += 1;
        }
        self.scope_bindings = grouped;
        self.scope_bindings_start = start;
    }

    fn bindings_of(&self, scope: ScopeIdentifier) -> std::ops::Range<usize> {
        self.scope_bindings_start[scope.index()] as usize
            ..self.scope_bindings_start[scope.index() + 1] as usize
    }

    /// Makes [`Analyzer::visible`] the bindings of the current scope's chain, outermost first.
    pub(super) fn rebuild_visible(&mut self) {
        self.visible.clear();
        let mut chain = Vec::new();
        let mut scope = Some(self.cur());
        while let Some(s) = scope {
            chain.push(s);
            scope = self.s.scopes[s].parent;
        }
        for &s in chain.iter().rev() {
            self.show(s);
        }
    }

    fn show(&mut self, scope: ScopeIdentifier) {
        for i in self.bindings_of(scope) {
            let binding = self.scope_bindings[i];
            let name = self.s.bindings[binding].name;
            self.visible.entry(name).or_default().push(binding);
        }
    }

    pub(super) fn open(&mut self, scope: ScopeIdentifier) {
        let nested = self.s.scopes[scope].parent == Some(self.cur());
        self.stack.push(scope);
        if nested {
            self.show(scope);
            self.opened.push(Opened::Nested);
        } else {
            self.rebuild_visible();
            self.opened.push(Opened::Rebuilt);
        }
    }

    pub(super) fn close(&mut self) {
        match self.opened.pop() {
            Some(Opened::Nested) => {
                let scope = self.stack.pop().expect("an opened scope");
                for i in self.bindings_of(scope) {
                    let name = self.s.bindings[self.scope_bindings[i]].name;
                    self.visible
                        .get_mut(&name)
                        .and_then(Vec::pop)
                        .expect("an opened scope's binding is visible");
                }
            }
            Some(Opened::Rebuilt) => {
                self.stack.pop();
                self.rebuild_visible();
            }
            Some(Opened::NotEntered) | None => {}
        }
    }

    /// Looks each type-syntax identifier up from the innermost scope whose node contains it; one
    /// outside every scope node (a template expression's cast) is looked up from the root.
    pub(super) fn resolve_type_references(&mut self) {
        let mut ranges: Vec<(ScopeIdentifier, Span)> = self
            .s
            .scopes
            .iter_enumerated()
            .filter_map(|(identifier, s)| {
                if s.node.is_none() {
                    return None;
                }
                self.syntax_tree
                    .source_location(s.node)
                    .span()
                    .map(|sp| (identifier, sp))
            })
            .collect();
        let references = &self.syntax_tree.type_references;
        let innermost = innermost_ranges(&mut ranges, references.iter().map(|r| r.span));
        let mut used = vec![false; self.s.bindings.len()];
        for (r, scope) in references.iter().zip(innermost) {
            if let Some(b) = self
                .s
                .lookup(scope.unwrap_or(ScopeIdentifier::ROOT), r.name)
            {
                used[b.index()] = true;
            }
        }
        self.s.type_referenced = used;
    }

    pub(super) fn reference(&mut self, ident: NodeIdentifier, read: bool, write: bool) {
        let Some(name) = self.syntax_tree.atom(ident) else {
            return;
        };
        let b = self.lookup(name);
        if let Some(b) = b {
            self.s.node_binding[ident.index()] = b.index() as u32;
            let binding = &mut self.s.bindings[b];
            binding.reads += u32::from(read);
            binding.writes += u32::from(write);
        }
        let scope = self.cur();
        self.s.references.push(Reference {
            node: ident,
            binding: b,
            read,
            write,
            initializer: false,
            scope,
        });
    }

    pub(super) fn initializer_reference(&mut self, ident: NodeIdentifier) {
        let b = self.s.binding_of(ident);
        let scope = self.cur();
        self.s.references.push(Reference {
            node: ident,
            binding: b,
            read: false,
            write: true,
            initializer: true,
            scope,
        });
    }

    /// Resolves the host roots in pass 1's order, walking their scopes on an explicit stack.
    pub(super) fn resolve_host(&mut self, roots: &[HostRoot]) {
        let mut bodies = vec![roots.iter()];
        while let Some(body) = bodies.last_mut() {
            let Some(r) = body.next() else {
                bodies.pop();
                if !bodies.is_empty() {
                    self.close();
                }
                continue;
            };
            match r {
                HostRoot::Expression(e) => {
                    self.resolve(Resolve::Node(*e, ReferenceContext::Expression));
                }
                HostRoot::Bound(e) => {
                    self.resolve(Resolve::Node(*e, ReferenceContext::Target { read: true }));
                }
                HostRoot::Name(..) => {}
                HostRoot::Scope(h) => {
                    let identifier = self.s.host_scopes[self.next_host_scope];
                    self.next_host_scope += 1;
                    self.open(identifier);
                    for &p in &h.parameters {
                        let context = ReferenceContext::Pattern { initializer: false };
                        self.resolve(Resolve::Node(p, context));
                    }
                    bodies.push(h.body.iter());
                }
            }
        }
    }

    pub(super) fn resolve(&mut self, step: Resolve) {
        let mut work = std::mem::take(&mut self.resolve_work);
        work.push(step);
        while let Some(step) = work.pop() {
            match step {
                Resolve::Node(identifier, context) => {
                    self.resolve_node(identifier, context, &mut work);
                }
                Resolve::Children(identifier) => self.children_to_resolve(identifier, &mut work),
                Resolve::Enter(identifier) => match self.s.node_scope.get(&identifier) {
                    Some(&s) if s != self.cur() => self.open(s),
                    _ => self.opened.push(Opened::NotEntered),
                },
                Resolve::Leave => self.close(),
                Resolve::Mutation(object) => {
                    let mut root = object;
                    while let Kind::Member { object, .. } = self.syntax_tree.kind(root) {
                        root = object;
                    }
                    if let Some(b) = self.s.binding_of(root) {
                        self.s.bindings[b].mutations += 1;
                    }
                }
            }
        }
        self.resolve_work = work;
    }

    fn children_to_resolve(&self, identifier: NodeIdentifier, work: &mut Vec<Resolve>) {
        let mark = work.len();
        self.syntax_tree.for_each_child(identifier, |child| {
            work.push(Resolve::Node(child, ReferenceContext::Expression));
        });
        work[mark..].reverse();
    }

    #[expect(clippy::too_many_lines, reason = "one arm per node kind and context")]
    fn resolve_node(
        &mut self,
        identifier: NodeIdentifier,
        context: ReferenceContext,
        work: &mut Vec<Resolve>,
    ) {
        let expression = |node| Resolve::Node(node, ReferenceContext::Expression);
        let mark = work.len();
        match (self.syntax_tree.kind(identifier), context) {
            (
                Kind::Class(crate::syntax_tree::Class::Definition {
                    superclass,
                    members,
                    ..
                }),
                _,
            ) => {
                work.push(Resolve::Enter(identifier));
                work.extend(superclass.map(expression));
                work.extend(members.iter().map(|&member| expression(member)));
                work.push(Resolve::Leave);
            }
            (Kind::Control(crate::syntax_tree::Control::Catch { parameter, body }), _) => {
                work.push(Resolve::Enter(identifier));
                work.extend(
                    parameter.map(|p| {
                        Resolve::Node(p, ReferenceContext::Pattern { initializer: false })
                    }),
                );
                work.push(Resolve::Children(body));
                work.push(Resolve::Leave);
            }
            (
                Kind::Control(crate::syntax_tree::Control::ForEach {
                    left, right, body, ..
                }),
                _,
            ) => {
                work.push(Resolve::Enter(identifier));
                work.push(Resolve::Node(
                    left,
                    ReferenceContext::Target { read: false },
                ));
                work.push(expression(right));
                work.push(expression(body));
                work.push(Resolve::Leave);
            }
            (Kind::Block(_) | Kind::For { .. }, _) => {
                work.push(Resolve::Enter(identifier));
                work.push(Resolve::Children(identifier));
                work.push(Resolve::Leave);
            }
            (
                Kind::Control(crate::syntax_tree::Control::Switch {
                    discriminant,
                    cases,
                }),
                _,
            ) => {
                work.push(expression(discriminant));
                work.push(Resolve::Enter(identifier));
                work.extend(cases.iter().map(|&case| expression(case)));
                work.push(Resolve::Leave);
            }
            (Kind::Identifier(_), ReferenceContext::Pattern { initializer }) => {
                if initializer {
                    self.initializer_reference(identifier);
                }
            }
            (Kind::Identifier(_), ReferenceContext::Target { read }) => {
                self.reference(identifier, read, true);
            }
            (Kind::Identifier(_), ReferenceContext::Expression) => {
                self.reference(identifier, true, false);
            }
            (Kind::ObjectPattern(props), _) => {
                for &pr in props {
                    match self.syntax_tree.kind(pr) {
                        Kind::Property {
                            key,
                            value,
                            computed,
                            ..
                        } => {
                            if computed {
                                work.push(expression(key));
                            }
                            work.push(Resolve::Node(value, context));
                        }
                        Kind::Rest(a) => work.push(Resolve::Node(a, context)),
                        _ => {}
                    }
                }
            }
            (Kind::ArrayPattern(items), _) => {
                work.extend(items.iter().map(|&it| Resolve::Node(it, context)));
            }
            (Kind::AssignPattern(l, r), _) => {
                let left = match context {
                    ReferenceContext::Pattern { .. } => {
                        ReferenceContext::Pattern { initializer: true }
                    }
                    other => other,
                };
                work.push(Resolve::Node(l, left));
                work.push(expression(r));
            }
            (Kind::Rest(a), _) => work.push(Resolve::Node(a, context)),
            (
                Kind::Declarator {
                    identifier: target,
                    initializer,
                },
                _,
            ) => {
                let initialized = initializer.is_some();
                work.push(Resolve::Node(
                    target,
                    ReferenceContext::Pattern {
                        initializer: initialized,
                    },
                ));
                work.extend(initializer.map(expression));
            }
            (
                Kind::Function {
                    parameters, body, ..
                },
                _,
            ) => {
                work.push(Resolve::Enter(identifier));
                work.extend(
                    parameters.iter().map(|&p| {
                        Resolve::Node(p, ReferenceContext::Pattern { initializer: false })
                    }),
                );
                work.push(Resolve::Children(body));
                work.push(Resolve::Leave);
            }
            (
                Kind::Arrow {
                    parameters,
                    body,
                    expression_body,
                    ..
                },
                _,
            ) => {
                work.push(Resolve::Enter(identifier));
                work.extend(
                    parameters.iter().map(|&p| {
                        Resolve::Node(p, ReferenceContext::Pattern { initializer: false })
                    }),
                );
                work.push(if expression_body {
                    expression(body)
                } else {
                    Resolve::Children(body)
                });
                work.push(Resolve::Leave);
            }
            (Kind::Import { .. }, _) => {}
            (
                Kind::Member {
                    object,
                    property,
                    computed,
                    ..
                },
                _,
            ) => {
                work.push(expression(object));
                if computed {
                    work.push(expression(property));
                }
                if let ReferenceContext::Target { .. } = context {
                    work.push(Resolve::Mutation(object));
                }
            }
            (
                Kind::Property {
                    key,
                    value,
                    computed,
                    shorthand,
                    ..
                },
                _,
            ) => {
                if computed && !shorthand {
                    work.push(expression(key));
                }
                work.push(expression(value));
            }
            (Kind::Assign(op, target, value), _) => {
                work.push(Resolve::Node(
                    target,
                    ReferenceContext::Target {
                        read: op != AssignmentOperator::Assign,
                    },
                ));
                work.push(expression(value));
            }
            (Kind::Update { arg, .. }, _) => {
                work.push(Resolve::Node(arg, ReferenceContext::Target { read: true }));
            }
            _ => work.push(Resolve::Children(identifier)),
        }
        work[mark..].reverse();
    }
}

/// For each of `targets`, the scope of the shortest range that contains it (the lowest scope on a
/// tie), as a scan of every range finds it.
fn innermost_ranges(
    ranges: &mut Vec<(ScopeIdentifier, Span)>,
    targets: impl Iterator<Item = Span>,
) -> Vec<Option<ScopeIdentifier>> {
    let targets: Vec<Span> = targets.collect();
    let contains = |range: Span, target: Span| {
        range.start_offset <= target.start_offset && target.end_offset <= range.end_offset
    };
    let scan = |target: Span, ranges: &[(ScopeIdentifier, Span)]| {
        ranges
            .iter()
            .filter(|&&(_, range)| contains(range, target))
            .min_by_key(|&&(identifier, range)| (range.end_offset - range.start_offset, identifier))
            .map(|&(identifier, _)| identifier)
    };
    // The sweep needs non-empty targets and ranges that nest or are disjoint, which the ranges of
    // one tree are; anything else takes the scan.
    if targets
        .iter()
        .any(|target| target.start_offset == target.end_offset)
    {
        return targets.iter().map(|&target| scan(target, ranges)).collect();
    }
    ranges.retain(|(_, range)| range.start_offset < range.end_offset);
    ranges.sort_unstable_by_key(|&(identifier, range)| {
        (
            range.start_offset,
            Reverse(range.end_offset),
            Reverse(identifier),
        )
    });
    let mut open: Vec<Span> = Vec::new();
    for &(_, range) in ranges.iter() {
        while open
            .last()
            .is_some_and(|o| o.end_offset <= range.start_offset)
        {
            open.pop();
        }
        if open.last().is_some_and(|o| range.end_offset > o.end_offset) {
            return targets.iter().map(|&target| scan(target, ranges)).collect();
        }
        open.push(range);
    }
    let mut order: Vec<usize> = (0..targets.len()).collect();
    order.sort_unstable_by_key(|&i| targets[i].start_offset);
    let mut out = vec![None; targets.len()];
    let mut open: Vec<(ScopeIdentifier, Span)> = Vec::new();
    let mut next = 0;
    for i in order {
        let target = targets[i];
        while let Some(&(identifier, range)) = ranges.get(next) {
            if range.start_offset > target.start_offset {
                break;
            }
            while open
                .last()
                .is_some_and(|o| o.1.end_offset <= range.start_offset)
            {
                open.pop();
            }
            open.push((identifier, range));
            next += 1;
        }
        while open
            .last()
            .is_some_and(|o| o.1.end_offset <= target.start_offset)
        {
            open.pop();
        }
        // Inner ranges are above outer ones; the first that reaches the target's end contains it.
        out[i] = open
            .iter()
            .rev()
            .find(|o| target.end_offset <= o.1.end_offset)
            .map(|&(identifier, _)| identifier);
    }
    out
}

#[cfg(test)]
mod tests;
