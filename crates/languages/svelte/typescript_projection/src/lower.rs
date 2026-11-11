mod attribute;
mod binding;
mod call;
mod children;
mod contract;
mod directive;
mod generic;
mod tag;

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
        directives: directive::Directives::default(),
        root_snippets: None,
    };
    // svelte2tsx moves the root's snippets after the instance script's imports, or leaves them in
    // place without an instance script.
    let instance = component.instance.is_some();
    if instance {
        let start = builder.scratch.len();
        builder.append_matching(component.root, true)?;
        let snippets = builder.finish_list(start);
        if snippets.len != 0 {
            builder.root_snippets = Some(builder.tree.push(Node::Statements(snippets)));
        }
    }
    let (contract, generics) = builder.scripts()?;
    let start = builder.scratch.len();
    if instance {
        builder.append_matching(component.root, false)?;
    } else {
        for &identifier in component.children(component.root) {
            if let Some(node) = builder.node(identifier)? {
                builder.scratch.push(node);
            }
        }
    }
    let body = builder.finish_list(start);
    if !builder.tree.children(body).is_empty() {
        let value = builder.tree.push(Node::Template(body));
        builder
            .scratch
            .push(builder.tree.push(Node::Statement(value)));
    }
    match generics {
        Some(generics) => builder.render(contract, generics),
        None => builder.scratch.push(contract),
    }
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
    /// Reused for each element, as elements' directives are done before their children.
    directives: directive::Directives,
    /// The root's snippets, which the instance script holds after its imports.
    root_snippets: Option<NodeIdentifier>,
}

/// The source text at `at`, whose mapping ends at `end` when that is not its own end.
fn source_expression(at: oxc_span::Span, end: Option<u32>) -> SourceExpression {
    let span = span(at);
    SourceExpression {
        span,
        end: end.unwrap_or(span.end_offset),
    }
}

/// Whether svelte2tsx writes the tag as an element, which `svelteHTML` types.
fn is_element(tag: &str) -> bool {
    matches!(
        tag,
        "svelte:head"
            | "svelte:options"
            | "svelte:window"
            | "svelte:body"
            | "svelte:document"
            | "svelte:fragment"
            | "svelte:element"
            | "svelte:boundary"
    ) || (tag.starts_with(|c: char| c.is_ascii_lowercase()) && !tag.contains(':'))
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
        let expression = self.expression(identifier);
        let (at, sequence) = (
            expression.span(),
            matches!(expression, Expression::SequenceExpression(_)),
        );
        let source = self.source(at, end);
        // A sequence's span leaves out its parentheses, which a property's value needs.
        if sequence {
            self.tree.push(Node::Parenthesized(source))
        } else {
            source
        }
    }

    /// A property's value. svelte2tsx copies `a, b` without its parentheses, which makes `b` a
    /// shorthand property; other sequences keep them, since the copy would not parse.
    fn property_value(
        &mut self,
        identifier: ExpressionIdentifier,
        end: Option<u32>,
    ) -> NodeIdentifier {
        if let Expression::SequenceExpression(sequence) = self.expression(identifier)
            && sequence.expressions[1..]
                .iter()
                .all(|e| matches!(e, Expression::Identifier(_)))
        {
            let at = sequence.span;
            return self.source(at, end);
        }
        self.expression_source(identifier, end)
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

    /// The children with their snippets first, as svelte2tsx hoists them.
    fn append_children(&mut self, range: Range) -> Result<()> {
        self.append_matching(range, true)?;
        self.append_matching(range, false)
    }

    /// The children that are snippets, or those that are not.
    fn append_matching(&mut self, range: Range, snippets: bool) -> Result<()> {
        for &identifier in self.component.children(range) {
            let snippet = matches!(
                self.component.node(identifier),
                TemplateNode::Snippet { .. }
            );
            if snippet == snippets
                && let Some(node) = self.node(identifier)?
            {
                self.scratch.push(node);
            }
        }
        Ok(())
    }

    fn node(&mut self, identifier: u32) -> Result<Option<NodeIdentifier>> {
        let node = match *self.component.node(identifier) {
            TemplateNode::Text { .. } | TemplateNode::Comment { .. } => return Ok(None),
            TemplateNode::Expression { expression, span }
            | TemplateNode::Html { expression, span } => {
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
            TemplateNode::Key { .. }
            | TemplateNode::Render { .. }
            | TemplateNode::Debug { .. }
            | TemplateNode::Snippet { .. }
            | TemplateNode::Await { .. } => self.tag(identifier)?,
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
        let tag = name.text(self.source);
        // svelte2tsx passes `this` of these outside the props.
        let dynamic = matches!(tag, "svelte:component" | "svelte:element");
        let component = match component {
            None if tag == "svelte:component" => Some(self.dynamic_component(name, attributes)?),
            component => component,
        };
        let is_component = component.is_some();
        if !is_component && !is_element(tag) {
            return Err(Unsupported::at("svelte: elements", name));
        }
        let slot = !is_component && tag == "slot";
        // An element whose attributes svelte2tsx checks against the intrinsic element types.
        let intrinsic = !is_component && !slot;
        let custom_element = intrinsic && (tag.contains('-') || self.has_custom_is(attributes));
        let start = self.scratch.len();
        self.scratch.reserve(attributes.len as usize + 1);
        if is_component
            && let Some(at) = self.implicit_children(name, start_tag, attributes, children)
        {
            self.scratch
                .push(self.tree.push(Node::ImplicitChildren(at)));
        }
        let mut bindings = Vec::new();
        let mut directives = std::mem::take(&mut self.directives);
        directives.clear();
        for attribute in self.component.attributes(attributes) {
            match attribute.kind {
                AttributeKind::Bind => {
                    bindings.push(self.binding(attribute, tag, is_component, intrinsic)?);
                }
                AttributeKind::On if intrinsic => {
                    let property = self.event_property(attribute)?;
                    self.scratch.push(property);
                }
                AttributeKind::On if is_component => {
                    let event = self.component_event(attribute)?;
                    directives.events.push(event);
                }
                AttributeKind::Let if is_component && !self.has_slot(attributes) => {
                    let property = self.component_let(attribute)?;
                    directives.lets.push(property);
                }
                AttributeKind::Use
                | AttributeKind::Transition { .. }
                | AttributeKind::Animate
                | AttributeKind::Style
                    if intrinsic =>
                {
                    self.directive(attribute, name, &mut directives)?;
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
                // svelte2tsx passes a slot's name, and a dynamic component, outside the props.
                AttributeKind::Attribute
                    if (slot && attribute.name.text(self.source) == "name")
                        || (dynamic && attribute.name.text(self.source) == "this") => {}
                _ => {
                    let property = self.attribute(attribute, intrinsic, custom_element);
                    self.scratch.push(property);
                }
            }
        }
        // `<svelte:boundary>`'s snippets are its props, as a component's are.
        let snippet_props = is_component || tag == "svelte:boundary";
        let snippets = self.snippet_props(children, snippet_props)?;
        let properties = self.finish_list(start);
        let properties = self.tree.push(Node::Object { properties });
        let (call, named) = if let Some(component) = component {
            self.component_call(
                component,
                properties,
                snippets,
                !directives.events.is_empty() || !directives.lets.is_empty(),
            )
        } else if slot {
            (self.slot_call(attributes, properties)?, None)
        } else {
            (
                self.element_call(name, attributes, &directives.action_names, properties),
                None,
            )
        };
        let lets = self.after_call(call, named, bindings, snippets, &directives);
        self.directives = directives;
        self.class_expressions(attributes);
        self.element_children(children, snippet_props, lets)?;
        let body = self.finish_list(start);
        Ok(self.tree.push(Node::Block { body }))
    }

    /// The call with what svelte2tsx writes around it: actions before, then bindings, directive
    /// checks, a component's events, the names of its snippet props and its `let:` bindings.
    fn after_call(
        &mut self,
        call: NodeIdentifier,
        named: Option<NodeIdentifier>,
        bindings: Vec<binding::Binding>,
        snippets: Range,
        directives: &directive::Directives,
    ) -> Option<usize> {
        self.scratch.extend_from_slice(&directives.actions);
        self.bound_call(call, bindings);
        self.scratch.extend_from_slice(&directives.checks);
        let component = named?;
        self.component_events(component, &directives.events);
        if snippets.len != 0 {
            let declaration = self.tree.push(Node::SnippetNames {
                names: snippets,
                component,
            });
            self.scratch.push(declaration);
        }
        let lets = self.scratch.len();
        self.component_lets(component, &directives.lets);
        (self.scratch.len() > lets).then_some(lets)
    }

    /// The expressions of `class:` directives, which svelte2tsx checks after the call.
    fn class_expressions(&mut self, attributes: Range) {
        for attribute in self.component.attributes(attributes) {
            if attribute.kind == AttributeKind::Class
                && let AttributeValue::Parts(parts) = attribute.value
                && let [Part::Expression { expression, .. }] = self.component.parts(parts)
            {
                let value = source_expression(self.expression(*expression).span(), None);
                self.scratch.push(self.tree.push(Node::Expression(value)));
            }
        }
    }

    /// A component's snippets are its props; an element's come first.
    /// svelte2tsx's block of a component's `let:` bindings, from `lets`, holds its children.
    fn element_children(
        &mut self,
        children: Range,
        is_component: bool,
        lets: Option<usize>,
    ) -> Result<()> {
        if !is_component {
            self.append_matching(children, true)?;
        }
        self.append_matching(children, false)?;
        if let Some(lets) = lets {
            let body = self.finish_list(lets);
            self.scratch.push(self.tree.push(Node::Block { body }));
        }
        Ok(())
    }

    /// Whether the component binds `name`, a type included.
    fn declares(&self, name: &str) -> bool {
        (self.resolution)()
            .is_some_and(|resolution| resolution.scoping().symbol_names().any(|n| n == name))
    }

    /// A name for generated code that no binding or reference of the component uses.
    fn unused_name(&mut self, prefix: &'static str) -> NodeIdentifier {
        self.unused_name_from(prefix, 0)
    }

    /// [`Self::unused_name`] with an index of at least `from`, so names generated into one
    /// scope differ.
    fn unused_name_from(&mut self, prefix: &'static str, from: u32) -> NodeIdentifier {
        let taken = |name: &str| {
            (self.resolution)().is_some_and(|resolution| {
                let scoping = resolution.scoping();
                scoping.symbol_names().any(|n| n == name)
                    || resolution.unresolved_names().any(|n| n == name)
            })
        };
        let mut index = from;
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
