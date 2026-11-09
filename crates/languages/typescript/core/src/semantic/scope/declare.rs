use super::{
    Analyzer, Binding, DeclarationKind, HostRoot, Kind, NodeIdentifier, Scope, ScopeIdentifier,
    TypedIndex, flag,
};

/// Pass 1's pending steps. A step that opens a node pushes the node's later steps in reverse, so
/// they run in source order on an explicit stack instead of the call stack.
pub(super) enum Declare {
    Node(NodeIdentifier),
    Pattern(NodeIdentifier, DeclarationKind),
    /// A function body block shares the function's scope.
    Body(NodeIdentifier),
    PushScope(NodeIdentifier),
    PopScope,
    /// The declarator or specifier the bindings declared next come from.
    Declaration(Option<NodeIdentifier>),
}

impl Analyzer<'_> {
    pub(super) fn cur(&self) -> ScopeIdentifier {
        *self
            .stack
            .last()
            .expect("the scope stack always holds the root")
    }

    pub(super) fn push_scope(&mut self, node: NodeIdentifier, function: bool) -> ScopeIdentifier {
        let parent = self.cur();
        let identifier = self.s.scopes.push(Scope {
            parent: Some(parent),
            function,
            node,
        });
        let variable_scope = if function {
            identifier
        } else {
            self.variable_scopes[parent.index()]
        };
        self.variable_scopes.push(variable_scope);
        if !node.is_none() {
            self.s.node_scope.insert(node, identifier);
        }
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
                HostRoot::Expression(e) | HostRoot::Bound(e) => self.declare(Declare::Node(*e)),
                &HostRoot::Name(node, kind) => {
                    let s = self.cur();
                    self.add_binding(node, kind, s);
                }
                HostRoot::Scope(h) => {
                    let identifier = self.push_scope(h.node.unwrap_or(NodeIdentifier::NONE), false);
                    self.s.host_scopes.push(identifier);
                    for &p in &h.parameters {
                        self.declare(Declare::Pattern(p, DeclarationKind::Host));
                    }
                    self.declare_host(&h.body);
                    self.stack.pop();
                }
            }
        }
    }

    pub(super) fn declare_children(&mut self, identifier: NodeIdentifier) {
        let mut work = std::mem::take(&mut self.declare_work);
        self.children_to_declare(identifier, &mut work);
        self.run_declare(&mut work);
        self.declare_work = work;
    }

    fn declare(&mut self, step: Declare) {
        let mut work = std::mem::take(&mut self.declare_work);
        work.push(step);
        self.run_declare(&mut work);
        self.declare_work = work;
    }

    fn run_declare(&mut self, work: &mut Vec<Declare>) {
        while let Some(step) = work.pop() {
            match step {
                Declare::Node(identifier) => self.declare_node(identifier, work),
                Declare::Pattern(p, kind) => self.declare_pattern(p, kind, work),
                Declare::Body(body) => {
                    self.s.node_scope.insert(body, self.cur());
                    self.children_to_declare(body, work);
                }
                Declare::PushScope(node) => {
                    self.push_scope(node, false);
                }
                Declare::PopScope => {
                    self.stack.pop();
                }
                Declare::Declaration(declaration) => self.current_declaration = declaration,
            }
        }
    }

    fn children_to_declare(&self, identifier: NodeIdentifier, work: &mut Vec<Declare>) {
        let mark = work.len();
        self.syntax_tree
            .for_each_child(identifier, |child| work.push(Declare::Node(child)));
        work[mark..].reverse();
    }

    #[expect(clippy::too_many_lines, reason = "one arm per declaration kind")]
    fn declare_node(&mut self, identifier: NodeIdentifier, work: &mut Vec<Declare>) {
        let mark = work.len();
        match self.syntax_tree.kind(identifier) {
            Kind::Class(crate::syntax_tree::Class::Definition {
                name,
                superclass,
                members,
                declaration,
            }) => {
                if let (Some(name), true) = (name, declaration) {
                    self.add_binding(name, DeclarationKind::Let, self.cur());
                }
                self.push_scope(identifier, false);
                if let (Some(name), false) = (name, declaration) {
                    self.add_binding(name, DeclarationKind::Let, self.cur());
                }
                work.extend(superclass.map(Declare::Node));
                work.extend(members.iter().map(|&member| Declare::Node(member)));
                work.push(Declare::PopScope);
            }
            Kind::Control(crate::syntax_tree::Control::Catch { parameter, body }) => {
                self.push_scope(identifier, false);
                work.extend(parameter.map(|p| Declare::Pattern(p, DeclarationKind::Let)));
                work.push(Declare::Body(body));
                work.push(Declare::PopScope);
            }
            Kind::Block(_)
            | Kind::For { .. }
            | Kind::Control(crate::syntax_tree::Control::ForEach { .. }) => {
                self.push_scope(identifier, false);
                self.syntax_tree
                    .for_each_child(identifier, |child| work.push(Declare::Node(child)));
                work.push(Declare::PopScope);
            }
            Kind::Control(crate::syntax_tree::Control::Switch {
                discriminant,
                cases,
            }) => {
                work.push(Declare::Node(discriminant));
                work.push(Declare::PushScope(identifier));
                work.extend(cases.iter().map(|&case| Declare::Node(case)));
                work.push(Declare::PopScope);
            }
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
                        work.push(Declare::Declaration(Some(d)));
                        work.push(Declare::Pattern(target, dk));
                        work.push(Declare::Declaration(None));
                        work.extend(initializer.map(Declare::Node));
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
                work.extend(
                    parameters
                        .iter()
                        .map(|&p| Declare::Pattern(p, DeclarationKind::Param)),
                );
                work.push(Declare::Body(body));
                work.push(Declare::PopScope);
            }
            Kind::Arrow {
                parameters,
                body,
                expression_body,
                ..
            } => {
                self.push_scope(identifier, true);
                work.extend(
                    parameters
                        .iter()
                        .map(|&p| Declare::Pattern(p, DeclarationKind::Param)),
                );
                work.push(if expression_body {
                    Declare::Node(body)
                } else {
                    Declare::Body(body)
                });
                work.push(Declare::PopScope);
            }
            Kind::Import { specifiers, .. } => {
                for &sp in specifiers {
                    self.current_declaration = Some(sp);
                    let local = match self.syntax_tree.kind(sp) {
                        Kind::ImportDefault(l) | Kind::ImportNamespace(l) => l,
                        Kind::ImportNamed { local, .. } => local,
                        _ => continue,
                    };
                    self.add_binding(local, DeclarationKind::Import, self.cur());
                }
                self.current_declaration = None;
            }
            Kind::TypeScriptDeclaration => {
                let declarations = &self.syntax_tree.type_declarations;
                if let Some(at) = self
                    .syntax_tree
                    .source_location(identifier)
                    .span()
                    .and_then(|span| {
                        declarations
                            .binary_search_by_key(&span.start_offset, |d| d.start_offset)
                            .ok()
                    })
                {
                    let scope = self.cur();
                    self.s.type_names.insert((scope, declarations[at].name));
                }
            }
            _ => return self.children_to_declare(identifier, work),
        }
        work[mark..].reverse();
    }

    fn declare_pattern(
        &mut self,
        p: NodeIdentifier,
        kind: DeclarationKind,
        work: &mut Vec<Declare>,
    ) {
        let mark = work.len();
        match self.syntax_tree.kind(p) {
            Kind::Identifier(_) => {
                let scope = if kind == DeclarationKind::Variable {
                    self.variable_scopes[self.cur().index()]
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
                                work.push(Declare::Node(key));
                            }
                            work.push(Declare::Pattern(value, kind));
                        }
                        Kind::Rest(a) => work.push(Declare::Pattern(a, kind)),
                        _ => {}
                    }
                }
            }
            Kind::ArrayPattern(items) => {
                work.extend(items.iter().map(|&it| Declare::Pattern(it, kind)));
            }
            Kind::AssignPattern(l, r) => {
                work.push(Declare::Pattern(l, kind));
                work.push(Declare::Node(r));
            }
            Kind::Rest(a) => work.push(Declare::Pattern(a, kind)),
            _ => {}
        }
        work[mark..].reverse();
    }
}
