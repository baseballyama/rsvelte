use super::{
    Analyzer, AssignmentOperator, Atom, BindingIdentifier, HostRoot, Kind, NodeIdentifier,
    Reference, ReferenceContext, ScopeIdentifier, Span, TypedIndex,
};

impl Analyzer<'_> {
    // ---- pass 2 --------------------------------------------------------------------------------

    pub(super) fn lookup(&self, name: Atom) -> Option<BindingIdentifier> {
        self.lookup_from(self.cur(), name)
    }

    pub(super) fn lookup_from(
        &self,
        scope: ScopeIdentifier,
        name: Atom,
    ) -> Option<BindingIdentifier> {
        self.s.lookup(scope, name)
    }

    /// Looks each type-syntax identifier up from the innermost scope whose node contains it; one
    /// outside every scope node (a template expression's cast) is looked up from the root.
    pub(super) fn resolve_type_references(&mut self) {
        let ranges: Vec<(ScopeIdentifier, Span)> = self
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
        let mut used = vec![false; self.s.bindings.len()];
        for r in &self.syntax_tree.type_references {
            let scope = ranges
                .iter()
                .filter(|(_, sp)| {
                    sp.start_offset <= r.span.start_offset && r.span.end_offset <= sp.end_offset
                })
                .min_by_key(|(_, sp)| sp.end_offset - sp.start_offset)
                .map_or(ScopeIdentifier::ROOT, |&(identifier, _)| identifier);
            if let Some(b) = self.lookup_from(scope, r.name) {
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

    pub(super) fn resolve_host(&mut self, roots: &[HostRoot]) {
        for r in roots {
            match r {
                HostRoot::Expression(e) => self.resolve(*e, ReferenceContext::Expression),
                HostRoot::Bound(e) => self.resolve(*e, ReferenceContext::Target { read: true }),
                HostRoot::Name(..) => {}
                HostRoot::Scope(h) => {
                    let identifier = self.s.host_scopes[self.next_host_scope];
                    self.next_host_scope += 1;
                    self.stack.push(identifier);
                    for &p in &h.parameters {
                        self.resolve(p, ReferenceContext::Pattern { initializer: false });
                    }
                    self.resolve_host(&h.body);
                    self.stack.pop();
                }
            }
        }
    }

    pub(super) fn resolve_children(&mut self, identifier: NodeIdentifier) {
        let tree = self.syntax_tree;
        tree.for_each_child(identifier, |child| {
            self.resolve(child, ReferenceContext::Expression);
        });
    }

    pub(super) fn enter(&mut self, identifier: NodeIdentifier) -> bool {
        match self.s.node_scope.get(&identifier) {
            Some(&s) if s != self.cur() => {
                self.stack.push(s);
                true
            }
            _ => false,
        }
    }

    #[expect(clippy::too_many_lines, reason = "one arm per node kind and context")]
    pub(super) fn resolve(&mut self, identifier: NodeIdentifier, context: ReferenceContext) {
        match (self.syntax_tree.kind(identifier), context) {
            (
                Kind::Class(crate::syntax_tree::Class::Definition {
                    superclass,
                    members,
                    ..
                }),
                _,
            ) => {
                let entered = self.enter(identifier);
                if let Some(parent) = superclass {
                    self.resolve(parent, ReferenceContext::Expression);
                }
                for &member in members {
                    self.resolve(member, ReferenceContext::Expression);
                }
                if entered {
                    self.stack.pop();
                }
            }
            (Kind::Control(crate::syntax_tree::Control::Catch { parameter, body }), _) => {
                let entered = self.enter(identifier);
                if let Some(p) = parameter {
                    self.resolve(p, ReferenceContext::Pattern { initializer: false });
                }
                self.resolve_children(body);
                if entered {
                    self.stack.pop();
                }
            }
            (
                Kind::Control(crate::syntax_tree::Control::ForEach {
                    left, right, body, ..
                }),
                _,
            ) => {
                let entered = self.enter(identifier);
                self.resolve(left, ReferenceContext::Target { read: false });
                self.resolve(right, ReferenceContext::Expression);
                self.resolve(body, ReferenceContext::Expression);
                if entered {
                    self.stack.pop();
                }
            }
            (Kind::Block(_) | Kind::For { .. }, _) => {
                let entered = self.enter(identifier);
                self.resolve_children(identifier);
                if entered {
                    self.stack.pop();
                }
            }
            (
                Kind::Control(crate::syntax_tree::Control::Switch {
                    discriminant,
                    cases,
                }),
                _,
            ) => {
                self.resolve(discriminant, ReferenceContext::Expression);
                let entered = self.enter(identifier);
                for &case in cases {
                    self.resolve(case, ReferenceContext::Expression);
                }
                if entered {
                    self.stack.pop();
                }
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
                                self.resolve(key, ReferenceContext::Expression);
                            }
                            self.resolve(value, context);
                        }
                        Kind::Rest(a) => self.resolve(a, context),
                        _ => {}
                    }
                }
            }
            (Kind::ArrayPattern(items), _) => {
                for &it in items {
                    self.resolve(it, context);
                }
            }
            (Kind::AssignPattern(l, r), _) => {
                let left = match context {
                    ReferenceContext::Pattern { .. } => {
                        ReferenceContext::Pattern { initializer: true }
                    }
                    other => other,
                };
                self.resolve(l, left);
                self.resolve(r, ReferenceContext::Expression);
            }
            (Kind::Rest(a), _) => self.resolve(a, context),
            (
                Kind::Declarator {
                    identifier: target,
                    initializer,
                },
                _,
            ) => {
                self.resolve(
                    target,
                    ReferenceContext::Pattern {
                        initializer: initializer.is_some(),
                    },
                );
                if let Some(i) = initializer {
                    self.resolve(i, ReferenceContext::Expression);
                }
            }
            (
                Kind::Function {
                    parameters, body, ..
                },
                _,
            ) => {
                let entered = self.enter(identifier);
                for &p in parameters {
                    self.resolve(p, ReferenceContext::Pattern { initializer: false });
                }
                self.resolve_children(body);
                if entered {
                    self.stack.pop();
                }
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
                let entered = self.enter(identifier);
                for &p in parameters {
                    self.resolve(p, ReferenceContext::Pattern { initializer: false });
                }
                if expression_body {
                    self.resolve(body, ReferenceContext::Expression);
                } else {
                    self.resolve_children(body);
                }
                if entered {
                    self.stack.pop();
                }
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
                self.resolve(object, ReferenceContext::Expression);
                if computed {
                    self.resolve(property, ReferenceContext::Expression);
                }
                if let ReferenceContext::Target { .. } = context {
                    let mut root = object;
                    while let Kind::Member { object, .. } = self.syntax_tree.kind(root) {
                        root = object;
                    }
                    if let Some(b) = self.s.binding_of(root) {
                        self.s.bindings[b].mutations += 1;
                    }
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
                    self.resolve(key, ReferenceContext::Expression);
                }
                self.resolve(value, ReferenceContext::Expression);
            }
            (Kind::Assign(op, target, value), _) => {
                self.resolve(
                    target,
                    ReferenceContext::Target {
                        read: op != AssignmentOperator::Assign,
                    },
                );
                self.resolve(value, ReferenceContext::Expression);
            }
            (Kind::Update { arg, .. }, _) => {
                self.resolve(arg, ReferenceContext::Target { read: true });
            }
            _ => {
                self.resolve_children(identifier);
            }
        }
    }
}
