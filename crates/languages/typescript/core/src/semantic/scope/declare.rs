use super::{
    Analyzer, Binding, DeclarationKind, HostRoot, Kind, NodeIdentifier, Scope, ScopeIdentifier,
    TypedIndex, flag,
};

impl Analyzer<'_> {
    pub(super) fn cur(&self) -> ScopeIdentifier {
        *self
            .stack
            .last()
            .expect("the scope stack always holds the root")
    }

    pub(super) fn function_scope(&self) -> ScopeIdentifier {
        self.s.variable_scope(self.cur())
    }

    pub(super) fn push_scope(&mut self, node: NodeIdentifier, function: bool) -> ScopeIdentifier {
        let identifier = self.s.scopes.push(Scope {
            parent: Some(self.cur()),
            function,
            node,
        });
        self.s.node_scope.insert(node, identifier);
        self.stack.push(identifier);
        identifier
    }

    pub(super) fn add_binding(
        &mut self,
        ident: NodeIdentifier,
        kind: DeclarationKind,
        scope: ScopeIdentifier,
    ) {
        let Some(name) = self.syntax_tree.atom(ident) else {
            return;
        };
        let identifier = *self.s.names.entry((scope, name)).or_insert_with(|| {
            self.s.bindings.push(Binding {
                name,
                kind,
                node: ident,
                scope,
                declaration: self.current_declaration,
                reads: 0,
                writes: 0,
                mutations: 0,
            })
        });
        self.s.node_binding[ident.index()] = identifier.index() as u32;
    }

    // ---- pass 1 --------------------------------------------------------------------------------

    pub(super) fn declare_host(&mut self, roots: &[HostRoot]) {
        for r in roots {
            match r {
                HostRoot::Expression(e) | HostRoot::Bound(e) => self.declare(*e),
                HostRoot::Scope(h) => {
                    let identifier = self.push_scope(h.node, false);
                    self.host_scopes.push(identifier);
                    for &p in &h.parameters {
                        self.declare_pattern(p, DeclarationKind::Host);
                    }
                    self.declare_host(&h.body);
                    self.stack.pop();
                }
            }
        }
    }

    pub(super) fn declare_children(&mut self, identifier: NodeIdentifier) {
        let mut children = Vec::new();
        self.syntax_tree
            .for_each_child(identifier, |c| children.push(c));
        for c in children {
            self.declare(c);
        }
    }

    pub(super) fn declare(&mut self, identifier: NodeIdentifier) {
        match self.syntax_tree.kind(identifier) {
            Kind::VariableDeclaration { kind, declarations } => {
                let dk = match kind {
                    flag::LET => DeclarationKind::Let,
                    flag::CONST => DeclarationKind::Const,
                    _ => DeclarationKind::Variable,
                };
                for &d in declarations {
                    if let Kind::Declarator {
                        identifier: target,
                        initializer,
                    } = self.syntax_tree.kind(d)
                    {
                        self.current_declaration = Some(d);
                        self.declare_pattern(target, dk);
                        self.current_declaration = None;
                        if let Some(i) = initializer {
                            self.declare(i);
                        }
                    }
                }
            }
            Kind::Function {
                name,
                parameters,
                body,
                declaration,
                ..
            } => {
                if let (Some(n), true) = (name, declaration) {
                    let s = self.cur();
                    self.add_binding(n, DeclarationKind::Function, s);
                }
                self.push_scope(identifier, true);
                if let (Some(n), false) = (name, declaration) {
                    let s = self.cur();
                    self.add_binding(n, DeclarationKind::Function, s);
                }
                for &p in parameters {
                    self.declare_pattern(p, DeclarationKind::Param);
                }
                self.declare_body(body);
                self.stack.pop();
            }
            Kind::Arrow {
                parameters,
                body,
                expression_body,
                ..
            } => {
                self.push_scope(identifier, true);
                for &p in parameters {
                    self.declare_pattern(p, DeclarationKind::Param);
                }
                if expression_body {
                    self.declare(body);
                } else {
                    self.declare_body(body);
                }
                self.stack.pop();
            }
            Kind::Block(_) => {
                self.push_scope(identifier, false);
                self.declare_children(identifier);
                self.stack.pop();
            }
            Kind::Import { specifiers, .. } => {
                for &sp in specifiers {
                    self.current_declaration = Some(sp);
                    let local = match self.syntax_tree.kind(sp) {
                        Kind::ImportDefault(l) | Kind::ImportNamespace(l) => l,
                        Kind::ImportNamed { local, .. } => local,
                        _ => continue,
                    };
                    self.add_binding(local, DeclarationKind::Import, ScopeIdentifier::ROOT);
                }
                self.current_declaration = None;
            }
            _ => self.declare_children(identifier),
        }
    }

    /// A function body block shares the function's scope.
    pub(super) fn declare_body(&mut self, body: NodeIdentifier) {
        self.s.node_scope.insert(body, self.cur());
        self.declare_children(body);
    }

    pub(super) fn declare_pattern(&mut self, p: NodeIdentifier, kind: DeclarationKind) {
        match self.syntax_tree.kind(p) {
            Kind::Identifier(_) => {
                let scope = if kind == DeclarationKind::Variable {
                    self.function_scope()
                } else {
                    self.cur()
                };
                self.add_binding(p, kind, scope);
            }
            Kind::ObjectPattern(props) => {
                for &pr in props {
                    match self.syntax_tree.kind(pr) {
                        Kind::Property {
                            key,
                            value,
                            computed,
                            ..
                        } => {
                            if computed {
                                self.declare(key);
                            }
                            self.declare_pattern(value, kind);
                        }
                        Kind::Rest(a) => self.declare_pattern(a, kind),
                        _ => {}
                    }
                }
            }
            Kind::ArrayPattern(items) => {
                for &it in items {
                    self.declare_pattern(it, kind);
                }
            }
            Kind::AssignPattern(l, r) => {
                self.declare_pattern(l, kind);
                self.declare(r);
            }
            Kind::Rest(a) => self.declare_pattern(a, kind),
            _ => {}
        }
    }
}
