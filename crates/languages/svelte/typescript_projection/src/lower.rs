mod attribute;
mod children;
mod contract;

use oxc_ast::ast::Expression;
use oxc_span::GetSpan;
use rsvelte_kernel::diagnostics::Unsupported;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_semantic::resolve::Resolution;
use rsvelte_svelte_syntax::syntax_tree::{
    AttributeKind, AttributeValue, Component, Part, Range, TemplateNode,
};
use rsvelte_typescript_tree::ExpressionIdentifier;

use crate::buffers::Buffer;
use crate::syntax_tree::{Node, NodeIdentifier, SourceExpression, SyntaxTree};

type Result<T> = std::result::Result<T, Unsupported>;

/// The component's analysis, which `lower` asks for only when a call may be a rune.
pub type Resolve<'a> = dyn Fn() -> Option<&'a Resolution> + 'a;

/// # Errors
///
/// Returns the source range of a construct whose type semantics are not supported yet.
pub fn lower<'a>(
    component: &'a Component,
    source: &'a str,
    resolution: &'a Resolve<'a>,
) -> Result<SyntaxTree> {
    let mut builder = Builder {
        component,
        resolution,
        source,
        scratch: Buffer::new(2),
        tree: SyntaxTree::default(),
        element_callee: None,
        attachment_key: None,
        component_name: None,
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

/// [`lower`] outside the artifact database: it analyzes the component itself, when it must.
///
/// # Errors
///
/// As [`lower`].
pub fn lower_alone(component: &Component, source: &str) -> Result<SyntaxTree> {
    let resolution = std::cell::OnceCell::new();
    let resolve = || {
        Some(resolution.get_or_init(|| {
            let lowered = rsvelte_svelte_semantic::compiler_syntax_tree::lower(component, source);
            rsvelte_svelte_semantic::resolve::resolve(
                &component.javascript,
                component.instance.as_ref().map(|s| s.program),
                component.module.as_ref().map(|s| s.program),
                &lowered,
            )
        }))
    };
    lower(component, source, &resolve)
}

struct Builder<'a> {
    component: &'a Component,
    resolution: &'a Resolve<'a>,
    source: &'a str,
    scratch: Buffer<NodeIdentifier>,
    tree: SyntaxTree,
    element_callee: Option<NodeIdentifier>,
    attachment_key: Option<NodeIdentifier>,
    component_name: Option<NodeIdentifier>,
}

/// The source text at `at`, whose mapping ends at `end` when that is not its own end.
fn source_expression(at: oxc_span::Span, end: Option<u32>) -> SourceExpression {
    let span = span(at);
    SourceExpression {
        span,
        end: end.unwrap_or(span.end_offset),
    }
}

/// The document position of an oxc node.
const fn span(span: oxc_span::Span) -> Span {
    Span::new(span.start, span.end)
}

impl Builder<'_> {
    fn expression(&self, identifier: ExpressionIdentifier) -> &Expression<'_> {
        self.component.javascript.get_expression(identifier)
    }

    fn source(&mut self, at: oxc_span::Span, end: Option<u32>) -> NodeIdentifier {
        let expression = source_expression(at, end);
        self.tree.push(Node::Source(expression))
    }

    fn expression_source(
        &mut self,
        identifier: ExpressionIdentifier,
        end: Option<u32>,
    ) -> NodeIdentifier {
        let at = self.expression(identifier).span();
        self.source(at, end)
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
                let at = self.expression(expression).span();
                Node::Expression(source_expression(at, Some(span.end_offset - 1)))
            }
            TemplateNode::Element {
                name,
                component,
                attributes,
                children,
                start_tag,
                ..
            } => {
                return self
                    .element(name, start_tag, component, attributes, children)
                    .map(Some);
            }
            TemplateNode::If {
                test,
                consequent,
                alternate,
                ..
            } => {
                let test = self.expression_source(test, None);
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
                let expression = self.expression_source(expression, None);
                let callee = self.tree.push(Node::Identifier("__rsvelte_each"));
                let arguments = self.tree.list(&[expression]);
                let iterable = self.tree.push(Node::Call { callee, arguments });
                let javascript = &self.component.javascript;
                let index = index.map(|index| javascript.get_pattern(index).span);
                let index = index.map(|at| self.source(at, None));
                // svelte2tsx drops a context's type annotation, and `for…of` takes none.
                let value = context.map(|context| javascript.get_pattern(context).pattern.span());
                let value = value.map(|at| self.source(at, None));
                let binding = self.tree.push(Node::ArrayPattern { index, value });
                if let Some(key) = key {
                    let value = source_expression(self.expression(key).span(), None);
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
                let at = self.component.javascript.get_declaration(declaration).span;
                let declaration = self.source(at, None);
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
        start_tag: Span,
        component: Option<ExpressionIdentifier>,
        attributes: Range,
        children: Range,
    ) -> Result<NodeIdentifier> {
        let is_component = component.is_some();
        let tag = name.text(self.source);
        if !is_component
            && (!tag.starts_with(|c: char| c.is_ascii_lowercase()) || tag.contains(['-', ':']))
        {
            return Err(Unsupported::at(
                "custom elements and svelte: elements",
                name,
            ));
        }
        let start = self.scratch.len();
        self.scratch.reserve(attributes.len as usize + 1);
        if is_component
            && let Some(at) = self.implicit_children(name, start_tag, attributes, children)
        {
            self.scratch
                .push(self.tree.push(Node::ImplicitChildren(at)));
        }
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
                    let property = self.attribute(attribute, is_component);
                    self.scratch.push(property);
                }
            }
        }
        let snippets = if is_component {
            self.snippet_props(children)?
        } else {
            Range::default()
        };
        let properties = self.finish_list(start);
        let properties = self.tree.push(Node::Object { properties });
        let (mut call, named) = if let Some(component) = component {
            self.component_call(component, properties, snippets)
        } else {
            (self.element_call(name, properties), None)
        };
        for attribute in self.component.attributes(attributes) {
            if attribute.kind == AttributeKind::Bind
                && let AttributeValue::Parts(parts) = attribute.value
                && let [Part::Expression { expression, .. }] = self.component.parts(parts)
            {
                if matches!(
                    self.expression(*expression),
                    Expression::SequenceExpression(_)
                ) {
                    return Err(Unsupported::at("function bindings", attribute.span));
                }
                let target = self.expression_source(*expression, None);
                call = self.tree.push(Node::Assignment {
                    target,
                    value: call,
                });
            }
        }
        self.scratch.push(self.tree.push(Node::Statement(call)));
        if let Some(component) = named {
            let declaration = self.tree.push(Node::SnippetNames {
                names: snippets,
                component,
            });
            self.scratch.push(declaration);
        }
        for attribute in self.component.attributes(attributes) {
            if attribute.kind == AttributeKind::Class
                && let AttributeValue::Parts(parts) = attribute.value
                && let [Part::Expression { expression, .. }] = self.component.parts(parts)
            {
                let value = source_expression(self.expression(*expression).span(), None);
                self.scratch.push(self.tree.push(Node::Expression(value)));
            }
        }
        self.element_children(children, is_component)?;
        let body = self.finish_list(start);
        Ok(self.tree.push(Node::Block { body }))
    }

    /// An element's children; a component's snippets are already its props.
    fn element_children(&mut self, children: Range, is_component: bool) -> Result<()> {
        for &child in self.component.children(children) {
            let snippet = matches!(self.component.node(child), TemplateNode::Snippet { .. });
            if !(is_component && snippet)
                && let Some(node) = self.node(child)?
            {
                self.scratch.push(node);
            }
        }
        Ok(())
    }

    /// `__rsvelte_component(C)(internals, properties)`, with the name it gives the component when
    /// the snippets' names are declared from its props.
    fn component_call(
        &mut self,
        component: ExpressionIdentifier,
        properties: NodeIdentifier,
        snippets: Range,
    ) -> (NodeIdentifier, Option<NodeIdentifier>) {
        let component = self.expression_source(component, None);
        let callee = self.tree.push(Node::Identifier("__rsvelte_component"));
        let arguments = self.tree.list(&[component]);
        let mut callee = self.tree.push(Node::Call { callee, arguments });
        let named = (snippets.len != 0).then(|| {
            let name = self.component_name();
            let value = callee;
            self.scratch
                .push(self.tree.push(Node::Const { name, value }));
            name
        });
        if let Some(name) = named {
            callee = name;
        }
        let internals = self.tree.push(Node::Identifier("__rsvelte_internals"));
        let internals = self.tree.push(Node::Call {
            callee: internals,
            arguments: Range::default(),
        });
        let arguments = self.tree.list(&[internals, properties]);
        (self.tree.push(Node::Call { callee, arguments }), named)
    }

    /// `svelteHTML.createElement("name", properties)`.
    fn element_call(&mut self, name: Span, properties: NodeIdentifier) -> NodeIdentifier {
        let name = self.tree.push(Node::Text(name));
        let parts = self.tree.list(&[name]);
        let name = self.tree.push(Node::String {
            parts,
            template: false,
        });
        let arguments = self.tree.list(&[name, properties]);
        let callee = self.element_callee();
        self.tree.push(Node::Call { callee, arguments })
    }

    /// A name for generated code that no binding or reference of the component uses.
    fn unused_name(&mut self, prefix: &'static str) -> NodeIdentifier {
        let taken = |name: &str| {
            (self.resolution)().is_some_and(|resolution| {
                let scoping = resolution.scoping();
                scoping.symbol_names().any(|n| n == name)
                    || resolution.unresolved_names().any(|n| n == name)
            })
        };
        let mut index = 0;
        while taken(&format!("{prefix}{index}")) {
            index += 1;
        }
        let prefix = self.tree.push(Node::Identifier(prefix));
        self.tree.push(Node::GeneratedIdentifier { prefix, index })
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
