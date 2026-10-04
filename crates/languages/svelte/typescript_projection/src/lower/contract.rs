use rsvelte_typescript::syntax_tree::{Kind, TypeScriptKind, flag};

use super::{Buffer, Builder, Node, NodeIdentifier, Range, Result, SourceNode, Span, Unsupported};

struct Edit {
    span: Span,
    replacement: Option<NodeIdentifier>,
}

impl Builder<'_> {
    pub(super) fn scripts(&mut self) -> Result<NodeIdentifier> {
        if let Some(script) = &self.component.module {
            self.scratch.push(self.tree.push(Node::Program {
                identifier: script.program,
                span: script.content,
            }));
        }
        let mut edits = Buffer::new(0);
        let mut bindings = Buffer::new(0);
        let mut exports = Buffer::new(0);
        let mut props = None;
        let generated_start = self.scratch.len();
        if let Some(script) = &self.component.instance {
            if let Some(&(name, _)) = script
                .attributes
                .iter()
                .find(|(name, _)| name.text(self.source) == "generics")
            {
                return Err(Unsupported::at("generic component contracts", name));
            }
            let Kind::Program(statements) = self.component.javascript.kind(script.program) else {
                unreachable!("a script has a program node");
            };
            for &statement in statements {
                let declaration = self.instance_export(statement, &mut exports, &mut edits)?;
                if let Kind::VariableDeclaration { declarations, .. } =
                    self.component.javascript.kind(declaration)
                {
                    for &declaration in declarations {
                        let Kind::Declarator {
                            identifier,
                            initializer: Some(initializer),
                        } = self.component.javascript.kind(declaration)
                        else {
                            continue;
                        };
                        if self.is_rune(initializer, "$props") {
                            if props.is_some() {
                                return Err(Unsupported::at(
                                    "multiple props declarations",
                                    self.span(identifier),
                                ));
                            }
                            props = Some(self.props(identifier, &mut bindings, &mut edits)?);
                        }
                    }
                }
            }
            edits.sort_unstable_by_key(|edit| edit.span.start_offset);
            self.script_parts(script.program, script.content, &edits);
            self.scratch[generated_start..].rotate_right(1);
        }
        let props = props.unwrap_or_else(|| {
            let callee = self.tree.push(Node::Identifier("Record"));
            let key = self.tree.push(Node::Identifier("string"));
            let value = self.tree.push(Node::Identifier("never"));
            let arguments = self.tree.list(&[key, value]);
            self.tree.push(Node::TypeArguments { callee, arguments })
        });
        let exports = self.tree.list(&exports);
        let exports = self.tree.push(Node::TypeLiteral(exports));
        let bindings = if bindings.is_empty() {
            self.tree.push(Node::StringLiteral(""))
        } else {
            let parts = self.tree.list(&bindings);
            self.tree.push(Node::TypeUnion(parts))
        };
        let helper = self
            .tree
            .push(Node::Identifier("__rsvelte_export_component"));
        let arguments = self.tree.list(&[props, exports, bindings]);
        let callee = self.tree.push(Node::TypeArguments {
            callee: helper,
            arguments,
        });
        let value = self.tree.push(Node::Call {
            callee,
            arguments: Range::default(),
        });
        Ok(self.tree.push(Node::ExportDefault(value)))
    }

    fn instance_export(
        &mut self,
        statement: SourceNode,
        exports: &mut Buffer<NodeIdentifier>,
        edits: &mut Buffer<Edit>,
    ) -> Result<SourceNode> {
        let tree = &self.component.javascript;
        let declaration = match tree.kind(statement) {
            Kind::ExportNamed(declaration) => declaration,
            Kind::ExportDefault(_) => {
                return Err(Unsupported::at(
                    "instance default exports",
                    self.span(statement),
                ));
            }
            _ => return Ok(statement),
        };
        match tree.kind(declaration) {
            Kind::Function {
                name: Some(name), ..
            } => self.export_property(name, exports),
            Kind::VariableDeclaration { kind, declarations } if kind == flag::CONST => {
                for &declaration in declarations {
                    let Kind::Declarator { identifier, .. } = tree.kind(declaration) else {
                        unreachable!("a variable declaration has declarators");
                    };
                    self.export_pattern(identifier, exports)?;
                }
            }
            Kind::TypeScriptDeclaration | Kind::TypeScriptInterface { .. } => {
                return Ok(declaration);
            }
            _ => {
                return Err(Unsupported::at(
                    "instance export contracts",
                    self.span(statement),
                ));
            }
        }
        edits.push(Edit {
            span: Span::new(
                self.span(statement).start_offset,
                self.span(declaration).start_offset,
            ),
            replacement: None,
        });
        Ok(declaration)
    }

    fn export_pattern(
        &mut self,
        pattern: SourceNode,
        exports: &mut Buffer<NodeIdentifier>,
    ) -> Result<()> {
        match self.component.javascript.kind(pattern) {
            Kind::Identifier(_) => self.export_property(pattern, exports),
            Kind::ObjectPattern(properties) => {
                for &property in properties {
                    match self.component.javascript.kind(property) {
                        Kind::Property { value, .. } | Kind::Rest(value) => {
                            self.export_pattern(value, exports)?;
                        }
                        _ => unreachable!("an object pattern has properties or a rest binding"),
                    }
                }
            }
            Kind::AssignPattern(value, _) | Kind::Rest(value) => {
                self.export_pattern(value, exports)?;
            }
            Kind::ArrayPattern(values) => {
                for &value in values {
                    if !matches!(self.component.javascript.kind(value), Kind::Hole) {
                        self.export_pattern(value, exports)?;
                    }
                }
            }
            _ => {
                return Err(Unsupported::at(
                    "instance export bindings",
                    self.span(pattern),
                ));
            }
        }
        Ok(())
    }

    fn export_property(&mut self, name: SourceNode, exports: &mut Buffer<NodeIdentifier>) {
        let name = self.source(name, None);
        let value = self.tree.push(Node::TypeQuery(name));
        exports.push(self.tree.push(Node::TypeProperty { name, value }));
    }

    fn props(
        &mut self,
        pattern: SourceNode,
        bindings: &mut Buffer<NodeIdentifier>,
        edits: &mut Buffer<Edit>,
    ) -> Result<NodeIdentifier> {
        let annotation = self
            .component
            .javascript
            .typescript
            .iter()
            .find(|syntax| syntax.node == pattern && syntax.kind == TypeScriptKind::Annotation)
            .map(|syntax| syntax.span);
        let Kind::ObjectPattern(properties) = self.component.javascript.kind(pattern) else {
            if let Some(span) = annotation {
                return Ok(self.tree.push(Node::SourceCopy {
                    identifier: pattern,
                    span,
                }));
            }
            return Err(Unsupported::at(
                "untyped props object contracts",
                self.span(pattern),
            ));
        };
        let mut required = Buffer::new(0);
        let mut optional = Buffer::new(0);
        let mut rest = false;
        for &property in properties {
            let (key, value) = match self.component.javascript.kind(property) {
                Kind::Property {
                    key,
                    value,
                    computed: false,
                    ..
                } => (key, value),
                Kind::Rest(_) => {
                    rest = true;
                    continue;
                }
                _ => {
                    return Err(Unsupported::at(
                        "computed props contracts",
                        self.span(property),
                    ));
                }
            };
            let default = match self.component.javascript.kind(value) {
                Kind::AssignPattern(_, default) => Some(default),
                _ => None,
            };
            if let Some(default) = default
                && self.is_rune(default, "$bindable")
            {
                bindings.push(self.property_string(key));
            }
            if annotation.is_none() {
                let name = self.source(key, None);
                let value = self.prop_default(default);
                let property = self.tree.push(Node::NamedProperty { name, value });
                if default.is_some() {
                    optional.push(property);
                } else {
                    required.push(property);
                }
            }
        }
        if let Some(span) = annotation {
            return Ok(self.tree.push(Node::SourceCopy {
                identifier: pattern,
                span,
            }));
        }
        let name = self.props_name();
        let required = self.tree.list(&required);
        let required = self.tree.push(Node::Object {
            properties: required,
        });
        let optional = self.tree.list(&optional);
        let optional = self.tree.push(Node::Object {
            properties: optional,
        });
        let rest = self
            .tree
            .push(Node::Identifier(if rest { "true" } else { "false" }));
        let arguments = self.tree.list(&[required, optional, rest]);
        let callee = self.tree.push(Node::Identifier("__rsvelte_props"));
        let value = self.tree.push(Node::Call { callee, arguments });
        self.scratch
            .push(self.tree.push(Node::Const { name, value }));
        let value = self.tree.push(Node::TypeQuery(name));
        let replacement = self.tree.push(Node::TypeAnnotation(value));
        let end = self.span(pattern).end_offset;
        edits.push(Edit {
            span: Span::new(end, end),
            replacement: Some(replacement),
        });
        Ok(value)
    }

    fn prop_default(&mut self, default: Option<SourceNode>) -> NodeIdentifier {
        let Some(mut default) = default else {
            return self.untyped_prop();
        };
        if self.is_rune(default, "$bindable") {
            let typed = self.suffix(default).is_some();
            let Kind::Call {
                callee, arguments, ..
            } = self.component.javascript.kind(default)
            else {
                unreachable!("a rune is a call");
            };
            if typed
                || self
                    .type_arguments
                    .binary_search_by_key(&callee.index(), |node| node.index())
                    .is_ok()
            {
                return self.source(default, None);
            }
            let Some(&fallback) = arguments.first() else {
                return self.untyped_prop();
            };
            default = fallback;
        }
        let value = self.source(default, None);
        let kind = self.component.javascript.kind(default);
        if matches!(kind, Kind::Array(values) if values.is_empty())
            && self.suffix(default).is_none()
        {
            let callee = self.tree.push(Node::Identifier("__rsvelte_empty_array"));
            let arguments = self.tree.list(&[value]);
            self.tree.push(Node::Call { callee, arguments })
        } else {
            value
        }
    }

    fn untyped_prop(&mut self) -> NodeIdentifier {
        let callee = self.tree.push(Node::Identifier("__rsvelte_untyped_prop"));
        self.tree.push(Node::Call {
            callee,
            arguments: Range::default(),
        })
    }

    fn property_string(&mut self, key: SourceNode) -> NodeIdentifier {
        if matches!(self.component.javascript.kind(key), Kind::String) {
            self.source(key, None)
        } else {
            let span = self.span(key);
            let text = self.tree.push(Node::Text(span));
            let parts = self.tree.list(&[text]);
            self.tree.push(Node::String {
                parts,
                template: false,
            })
        }
    }

    fn props_name(&mut self) -> NodeIdentifier {
        let prefix = "__rsvelte_public_props";
        let mut index = 0;
        while self
            .component
            .javascript
            .atoms
            .lookup(&format!("{prefix}{index}"))
            .is_some()
        {
            index += 1;
        }
        let prefix = self.tree.push(Node::Identifier(prefix));
        self.tree.push(Node::GeneratedIdentifier { prefix, index })
    }

    fn is_rune(&self, node: SourceNode, name: &str) -> bool {
        let tree = &self.component.javascript;
        matches!(tree.kind(node), Kind::Call { callee, .. }
            if matches!(tree.kind(callee), Kind::Identifier(_)) && tree.name(callee) == name)
    }

    fn span(&self, node: SourceNode) -> Span {
        self.component
            .javascript
            .source_location(node)
            .span()
            .expect("a source node has a span")
    }

    fn script_parts(&mut self, identifier: SourceNode, span: Span, edits: &[Edit]) {
        if edits.is_empty() {
            self.scratch
                .push(self.tree.push(Node::Program { identifier, span }));
            return;
        }
        let start = self.scratch.len();
        let mut cursor = span.start_offset;
        for edit in edits {
            if cursor < edit.span.start_offset {
                self.scratch.push(self.tree.push(Node::SourceCopy {
                    identifier,
                    span: Span::new(cursor, edit.span.start_offset),
                }));
            }
            if let Some(replacement) = edit.replacement {
                self.scratch.push(replacement);
            }
            cursor = edit.span.end_offset;
        }
        if cursor < span.end_offset {
            self.scratch.push(self.tree.push(Node::SourceCopy {
                identifier,
                span: Span::new(cursor, span.end_offset),
            }));
        }
        let parts = self.finish_list(start);
        self.scratch
            .push(self.tree.push(Node::ProgramParts { identifier, parts }));
    }
}
