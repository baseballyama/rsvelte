mod contract;

use rsvelte_kernel::diagnostics::diagnostic::Unsupported;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{
    Attribute, AttributeKind, AttributeValue, Component, Part, Range, TemplateNode,
};
use rsvelte_typescript::NodeIdentifier as SourceNode;
use rsvelte_typescript::syntax_tree::TypeScriptKind;

use crate::buffers::Buffer;
use crate::syntax_tree::{Node, NodeIdentifier, SourceExpression, SyntaxTree};

type Result<T> = std::result::Result<T, Unsupported>;

/// # Errors
///
/// Returns the source range of a construct whose type semantics are not supported yet.
pub fn lower(component: &Component, source: &str) -> Result<SyntaxTree> {
    let mut builder = Builder {
        component,
        source,
        suffixes: Buffer::new(0),
        type_arguments: Buffer::new(0),
        scratch: Buffer::new(2),
        tree: SyntaxTree::default(),
        element_callee: None,
        attachment_key: None,
    };
    let contract = builder.scripts()?;
    let body = builder.children(component.root)?;
    if !builder.tree.children(body).is_empty() {
        let value = builder.tree.push(Node::Arrow { body });
        builder
            .scratch
            .push(builder.tree.push(Node::Statement(value)));
    }
    builder.scratch.push(contract);
    builder.tree.root = builder.finish_list(0);
    Ok(builder.tree)
}

struct Builder<'a> {
    component: &'a Component,
    source: &'a str,
    suffixes: Buffer<Option<Span>>,
    type_arguments: Buffer<SourceNode>,
    scratch: Buffer<NodeIdentifier>,
    tree: SyntaxTree,
    element_callee: Option<NodeIdentifier>,
    attachment_key: Option<NodeIdentifier>,
}

impl Builder<'_> {
    fn source_expression(&mut self, identifier: SourceNode, end: Option<u32>) -> SourceExpression {
        let span = self
            .component
            .javascript
            .source_location(identifier)
            .span()
            .expect("a parsed source node has a range");
        let suffix = self.suffix(identifier);
        let span = suffix.map_or(span, |suffix| {
            Span::new(
                span.start_offset.min(suffix.start_offset),
                span.end_offset.max(suffix.end_offset),
            )
        });
        SourceExpression {
            identifier,
            span,
            end: end.unwrap_or(span.end_offset),
        }
    }

    fn suffix(&mut self, identifier: SourceNode) -> Option<Span> {
        if self.suffixes.is_empty() && !self.component.javascript.typescript.is_empty() {
            self.suffixes.resize(self.component.javascript.len(), None);
            for syntax in &self.component.javascript.typescript {
                if matches!(
                    syntax.kind,
                    TypeScriptKind::As
                        | TypeScriptKind::Satisfies
                        | TypeScriptKind::NonNull
                        | TypeScriptKind::Assertion
                ) {
                    let entry = &mut self.suffixes[syntax.node.index()];
                    *entry = Some(entry.map_or(syntax.span, |span| {
                        Span::new(
                            span.start_offset.min(syntax.span.start_offset),
                            span.end_offset.max(syntax.span.end_offset),
                        )
                    }));
                }
                if syntax.kind == TypeScriptKind::TypeArgs {
                    self.type_arguments.push(syntax.node);
                }
            }
            self.type_arguments
                .sort_unstable_by_key(|node| node.index());
        }
        if self.suffixes.is_empty() {
            None
        } else {
            self.suffixes[identifier.index()]
        }
    }

    fn source(&mut self, identifier: SourceNode, end: Option<u32>) -> NodeIdentifier {
        let expression = self.source_expression(identifier, end);
        self.tree.push(Node::Source(expression))
    }

    fn finish_list(&mut self, start: usize) -> Range {
        let range = self.tree.list(&self.scratch[start..]);
        self.scratch.truncate(start);
        range
    }

    fn children(&mut self, range: Range) -> Result<Range> {
        let start = self.scratch.len();
        self.append_children(range)?;
        Ok(self.finish_list(start))
    }

    fn append_children(&mut self, range: Range) -> Result<()> {
        for &identifier in self.component.children(range) {
            if let Some(node) = self.node(identifier)? {
                self.scratch.push(node);
            }
        }
        Ok(())
    }

    fn node(&mut self, identifier: u32) -> Result<Option<NodeIdentifier>> {
        let node = match *self.component.node(identifier) {
            TemplateNode::Text { .. } | TemplateNode::Comment { .. } => return Ok(None),
            TemplateNode::Expression { expression, span } => {
                let value = self.source_expression(expression, Some(span.end_offset - 1));
                Node::Expression(value)
            }
            TemplateNode::Element {
                name,
                component,
                attributes,
                children,
                ..
            } => {
                return self
                    .element(name, component, attributes, children)
                    .map(Some);
            }
            TemplateNode::If {
                test,
                consequent,
                alternate,
                ..
            } => {
                let test = self.source(test, None);
                let consequent = self.children(consequent)?;
                let alternate = alternate.map(|range| self.children(range)).transpose()?;
                Node::If {
                    test,
                    consequent,
                    alternate,
                }
            }
            TemplateNode::Each {
                expression,
                context,
                index,
                key,
                body,
                fallback,
                has_fallback,
                ..
            } => {
                let start = self.scratch.len();
                let expression = self.source(expression, None);
                let callee = self.tree.push(Node::Identifier("__rsvelte_each"));
                let arguments = self.tree.list(&[expression]);
                let iterable = self.tree.push(Node::Call { callee, arguments });
                let index = (index != SourceNode::NONE).then(|| self.source(index, None));
                let value = (context != SourceNode::NONE).then(|| self.source(context, None));
                let binding = self.tree.push(Node::ArrayPattern { index, value });
                if key != SourceNode::NONE {
                    let value = self.source_expression(key, None);
                    self.scratch.push(self.tree.push(Node::Expression(value)));
                }
                self.append_children(body)?;
                let body = self.finish_list(start);
                let loop_node = self.tree.push(Node::ForOf {
                    binding,
                    iterable,
                    body,
                });
                self.scratch.push(loop_node);
                if has_fallback {
                    let body = self.children(fallback)?;
                    self.scratch.push(self.tree.push(Node::Block { body }));
                }
                let body = self.finish_list(start);
                Node::Block { body }
            }
            TemplateNode::Const { declaration, .. }
            | TemplateNode::Declaration { declaration, .. } => {
                let declaration = self.source(declaration, None);
                Node::Statement(declaration)
            }
            TemplateNode::Key { span, .. }
            | TemplateNode::Await { span, .. }
            | TemplateNode::Snippet { span, .. } => return Err(Unsupported::at("blocks", span)),
            TemplateNode::Render { span, .. }
            | TemplateNode::Html { span, .. }
            | TemplateNode::Debug { span, .. } => {
                return Err(Unsupported::at("special tags", span));
            }
        };
        Ok(Some(self.tree.push(node)))
    }

    fn element(
        &mut self,
        name: Span,
        component: SourceNode,
        attributes: Range,
        children: Range,
    ) -> Result<NodeIdentifier> {
        let is_component = component != SourceNode::NONE;
        let tag = name.text(self.source);
        if !is_component
            && (!tag.starts_with(|c: char| c.is_ascii_lowercase()) || tag.contains(['-', ':']))
        {
            return Err(Unsupported::at(
                "custom elements and svelte: elements",
                name,
            ));
        }
        if is_component && children.len != 0 {
            return Err(Unsupported::at("component children", name));
        }
        let start = self.scratch.len();
        self.scratch.reserve(attributes.len as usize);
        for attribute in self.component.attributes(attributes) {
            match attribute.kind {
                AttributeKind::Bind
                    if !is_component && attribute.name.text(self.source) == "bind:this" => {}
                AttributeKind::Bind => {
                    return Err(Unsupported::at("bind: directives", attribute.span));
                }
                AttributeKind::On
                | AttributeKind::Use
                | AttributeKind::Transition { .. }
                | AttributeKind::Animate
                | AttributeKind::Style
                | AttributeKind::Let => {
                    return Err(Unsupported::at("directives", attribute.span));
                }
                AttributeKind::Class if !is_component => {}
                AttributeKind::Class | AttributeKind::Attach if is_component => {
                    return Err(Unsupported::at("component directives", attribute.span));
                }
                _ => {
                    let property = self.attribute(attribute);
                    self.scratch.push(property);
                }
            }
        }
        let properties = self.finish_list(start);
        let properties = self.tree.push(Node::Object { properties });
        let call = if is_component {
            let component = self.source(component, None);
            let callee = self.tree.push(Node::Identifier("__rsvelte_component"));
            let arguments = self.tree.list(&[component]);
            let callee = self.tree.push(Node::Call { callee, arguments });
            let internals = self.tree.push(Node::Identifier("__rsvelte_internals"));
            let internals = self.tree.push(Node::Call {
                callee: internals,
                arguments: Range::default(),
            });
            let arguments = self.tree.list(&[internals, properties]);
            self.tree.push(Node::Call { callee, arguments })
        } else {
            let name = self.tree.push(Node::Text(name));
            let parts = self.tree.list(&[name]);
            let name = self.tree.push(Node::String {
                parts,
                template: false,
            });
            let arguments = self.tree.list(&[name, properties]);
            let callee = self.element_callee();
            self.tree.push(Node::Call { callee, arguments })
        };
        let mut call = call;
        for attribute in self.component.attributes(attributes) {
            if attribute.kind == AttributeKind::Bind
                && let AttributeValue::Parts(parts) = attribute.value
                && let [Part::Expression { expression, .. }] = self.component.parts(parts)
            {
                if matches!(
                    self.component.javascript.kind(*expression),
                    rsvelte_typescript::syntax_tree::Kind::Sequence(_)
                ) {
                    return Err(Unsupported::at("function bindings", attribute.span));
                }
                let target = self.source(*expression, None);
                call = self.tree.push(Node::Assignment {
                    target,
                    value: call,
                });
            }
        }
        self.scratch.push(self.tree.push(Node::Statement(call)));
        for attribute in self.component.attributes(attributes) {
            if attribute.kind == AttributeKind::Class
                && let AttributeValue::Parts(parts) = attribute.value
                && let [Part::Expression { expression, .. }] = self.component.parts(parts)
            {
                let value = self.source_expression(*expression, None);
                self.scratch.push(self.tree.push(Node::Expression(value)));
            }
        }
        self.append_children(children)?;
        let body = self.finish_list(start);
        Ok(self.tree.push(Node::Block { body }))
    }

    fn attribute(&mut self, attribute: &Attribute) -> NodeIdentifier {
        let parts = match attribute.value {
            AttributeValue::True => &[][..],
            AttributeValue::Parts(range) => self.component.parts(range),
        };
        let value = match (attribute.value, parts) {
            (AttributeValue::True, _) => self.tree.push(Node::Boolean),
            (_, [Part::Expression { expression, span }]) => {
                self.source(*expression, Some(span.end_offset - 1))
            }
            _ => {
                let template = parts
                    .iter()
                    .any(|part| matches!(part, Part::Expression { .. }));
                let start = self.scratch.len();
                self.scratch.reserve(parts.len());
                for part in parts {
                    let value = match *part {
                        Part::Text(span) => self.tree.push(Node::Text(span)),
                        Part::Expression { expression, span } => {
                            self.source(expression, Some(span.end_offset - 1))
                        }
                    };
                    self.scratch.push(value);
                }
                let parts = self.finish_list(start);
                self.tree.push(Node::String { parts, template })
            }
        };
        let node = match attribute.kind {
            AttributeKind::Spread => Node::Spread(value),
            AttributeKind::Attach => Node::ComputedProperty {
                key: self.attachment_key(),
                value,
            },
            _ if attribute.shorthand => Node::Shorthand(value),
            _ => Node::Property {
                name: attribute.name,
                value,
                end: (!matches!(attribute.value, AttributeValue::True))
                    .then_some(attribute.name.end_offset),
            },
        };
        self.tree.push(node)
    }

    fn element_callee(&mut self) -> NodeIdentifier {
        if let Some(callee) = self.element_callee {
            return callee;
        }
        let object = self.tree.push(Node::Identifier("svelteHTML"));
        let property = self.tree.push(Node::Identifier("createElement"));
        let callee = self.tree.push(Node::Member { object, property });
        self.element_callee = Some(callee);
        callee
    }

    fn attachment_key(&mut self) -> NodeIdentifier {
        if let Some(key) = self.attachment_key {
            return key;
        }
        let callee = self.tree.push(Node::Identifier("Symbol"));
        let value = self.tree.push(Node::StringLiteral("@attach"));
        let arguments = self.tree.list(&[value]);
        let key = self.tree.push(Node::Call { callee, arguments });
        self.attachment_key = Some(key);
        key
    }
}
