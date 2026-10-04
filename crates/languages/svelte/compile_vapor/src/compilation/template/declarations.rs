use super::{
    Builder, CompilerNodeIdentifier, DirectiveExpression, DirectiveName, Kind, LoopExpression,
    NodeKind, SourceLocation, Span, Verbatim, copy, directive, spelled, vue,
};

impl Builder<'_, '_> {
    fn declaration_cell(&mut self, value: super::NodeIdentifier) -> super::NodeIdentifier {
        let key = self.to.identifier("value");
        let field = self.to.property(key, value, 0, SourceLocation::SYNTHETIC);
        self.to.object(&[field], SourceLocation::SYNTHETIC)
    }

    fn rune_pattern(
        &mut self,
        identifier: super::NodeIdentifier,
        rune: &str,
        argument: Option<super::NodeIdentifier>,
    ) -> super::NodeIdentifier {
        let tracking = self.i.plan.auxiliary.contains_key("$effect.tracking") && !self.i.server;
        let mut rewrite = super::TemplateRewrite {
            resolution: self.i.resolution,
            snippet_names: &self.snippet_names,
            server: self.i.server,
        };
        let value = crate::script::rune_value(
            self.i.javascript,
            self.to,
            &mut rewrite,
            rune,
            argument,
            tracking,
        )
        .expect("a checked rune has a value");
        crate::script::pattern_declaration(
            self.i.javascript,
            self.to,
            &mut rewrite,
            identifier,
            value,
            rune,
            tracking,
        )
    }

    pub(super) fn declarations(
        &mut self,
        nodes: &[CompilerNodeIdentifier],
        parent: Option<vue::CompilerNodeIdentifier>,
        span: Span,
    ) -> Option<vue::CompilerNodeIdentifier> {
        let mut statements = Vec::new();
        let mut parameters = Vec::new();
        for &node in nodes {
            let NodeKind::Declaration { declaration } = self.i.compiler_syntax_tree.node(node).kind
            else {
                continue;
            };
            let Kind::VariableDeclaration { kind, declarations } =
                self.i.javascript.kind(declaration)
            else {
                unreachable!()
            };
            for &declaration in declarations {
                let Kind::Declarator {
                    identifier,
                    initializer,
                } = self.i.javascript.kind(declaration)
                else {
                    unreachable!()
                };
                let names = crate::compilation::patterns::names(self.i.javascript, identifier);
                parameters.extend(
                    names
                        .iter()
                        .map(|&name| copy(self.i.javascript, self.to, &mut Verbatim, name)),
                );
                let mut name = copy(self.i.javascript, self.to, &mut Verbatim, identifier);
                let rune = initializer.and_then(|value| {
                    rsvelte_svelte::semantic::resolve::rune_call(self.i.javascript, value)
                });
                if let Some((rune, argument)) = rune
                    && crate::script::runes::value(rune)
                    && !matches!(self.i.javascript.kind(identifier), Kind::Identifier(_))
                {
                    statements.push(self.rune_pattern(identifier, rune, argument));
                    continue;
                }
                let mut value = if let Some(value) = initializer {
                    self.template_expression(value)
                } else {
                    self.to.identifier("undefined")
                };
                if !rune.is_some_and(|(name, _)| crate::script::runes::value(name)) {
                    if matches!(self.i.javascript.kind(identifier), Kind::Identifier(_)) {
                        value = self.declaration_cell(value);
                    } else {
                        let binding = self.to.let_(kind, name, Some(value));
                        let cells: Vec<_> = names
                            .iter()
                            .map(|&name| {
                                let value = self.to.identifier(self.i.javascript.name(name));
                                self.declaration_cell(value)
                            })
                            .collect();
                        let cells = self.to.array(&cells, SourceLocation::SYNTHETIC);
                        let result = self.to.return_(Some(cells), SourceLocation::SYNTHETIC);
                        let body = self.to.block(&[binding, result], SourceLocation::SYNTHETIC);
                        let function =
                            self.to
                                .arrow(&[], body, false, false, SourceLocation::SYNTHETIC);
                        value = self.to.call0(function, &[]);
                        let names: Vec<_> = names
                            .iter()
                            .map(|&name| self.to.identifier(self.i.javascript.name(name)))
                            .collect();
                        name = self.to.array_pat(&names, SourceLocation::SYNTHETIC);
                    }
                }
                statements.push(self.to.let_(kind, name, Some(value)));
            }
        }
        if statements.is_empty() {
            return None;
        }
        let block = self.to.block(&statements, SourceLocation::SYNTHETIC);
        let source = self
            .to
            .arrow(&[], block, false, false, SourceLocation::SYNTHETIC);
        let props = self.vb.props([directive(
            DirectiveName::For,
            None,
            DirectiveExpression::For(LoopExpression { parameters, source }),
            span,
        )]);
        let element = vue::Element {
            tag: spelled("$$Scope", span),
            tag_type: vue::TagType::Template,
            props,
            children: vue::Children::default(),
        };
        let node = self
            .vb
            .node(vue::NodeKind::Element(element), span, parent, 0);
        self.scopes.insert(node, block);
        Some(node)
    }
}
