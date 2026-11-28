//! Blocks and the nodes of a fragment.

use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{TemplateNode, decode_text};

use super::{Place, Printer};

impl Printer<'_> {
    /// A block: `{#if}`, `{#key}` or `{#await}`.
    pub(super) fn template_block(&mut self, node: &TemplateNode, place: Place) {
        match *node {
            TemplateNode::If {
                test,
                consequent,
                alternate,
                elseif,
                span,
            } => {
                // svelte starts an `{:else if}` block at its brace.
                let span = if elseif {
                    let brace = self.source[..span.start_offset as usize].rfind('{');
                    Span::new(
                        brace.map_or(span.start_offset, |at| at as u32),
                        span.end_offset,
                    )
                } else {
                    span
                };
                self.tag("IfBlock", span, |p| {
                    p.out.key("elseif").boolean(elseif);
                    p.out.key("test");
                    p.expression(test);
                    p.out.key("consequent");
                    p.range(consequent, place);
                    p.out.key("alternate");
                    match alternate {
                        Some(alternate) => p.range(alternate, place),
                        None => p.out.null(),
                    }
                });
            }
            TemplateNode::Key {
                expression,
                body,
                span,
            } => {
                self.tag("KeyBlock", span, |p| {
                    p.out.key("expression");
                    p.expression(expression);
                    p.out.key("fragment");
                    p.range(body, place);
                });
            }
            TemplateNode::Await {
                expression,
                value,
                error,
                pending,
                then,
                catch,
                span,
            } => {
                self.tag("AwaitBlock", span, |p| {
                    p.out.key("expression");
                    p.expression(expression);
                    for (key, pattern) in [("value", value), ("error", error)] {
                        p.out.key(key);
                        match pattern {
                            Some(pattern) => {
                                let pattern = p.component.javascript.get_pattern(pattern);
                                p.read_pattern(pattern);
                            }
                            None => p.out.null(),
                        }
                    }
                    for (key, range) in [("pending", pending), ("then", then), ("catch", catch)] {
                        p.out.key(key);
                        p.optional_range(range, place);
                    }
                });
            }
            _ => unreachable!("node() passes blocks only"),
        }
    }

    pub(super) fn snippet_block(&mut self, node: &TemplateNode, place: Place) {
        let TemplateNode::Snippet {
            name,
            type_parameters,
            parameters,
            body,
            span,
            ..
        } = *node
        else {
            unreachable!("node() passes snippets only");
        };
        self.tag("SnippetBlock", span, |p| {
            p.out.key("expression");
            let name = p.component.javascript.get_expression(name);
            let name = rsvelte_typescript_tree::node_span(name);
            p.identifier(name, None);
            p.out.key("parameters").array();
            let parameters = p.component.javascript.get_parameters(parameters);
            for parameter in &parameters.items {
                p.out.element();
                p.javascript(parameter);
            }
            if let Some(rest) = &parameters.rest {
                p.out.element();
                p.javascript(&**rest);
            }
            p.out.end_array();
            if let Some(type_parameters) = type_parameters {
                // svelte keeps the text between the angle brackets.
                let text = type_parameters.text(p.source);
                let inner = text.strip_prefix('<').and_then(|t| t.strip_suffix('>'));
                p.out.key("typeParams").string(inner.unwrap_or(text));
            }
            p.out.key("body");
            p.range(body, place);
        });
    }

    pub(super) fn each_block(&mut self, node: &TemplateNode, place: Place) {
        let TemplateNode::Each {
            expression,
            context,
            index,
            key,
            body,
            fallback,
            has_fallback,
            span,
        } = *node
        else {
            unreachable!("node() passes each blocks only");
        };
        self.tag("EachBlock", span, |p| {
            p.out.key("expression");
            p.expression(expression);
            p.out.key("body");
            p.range(body, place);
            p.out.key("context");
            match context {
                Some(context) => {
                    let pattern = p.component.javascript.get_pattern(context);
                    p.read_pattern(pattern);
                }
                None => p.out.null(),
            }
            if let Some(index) = index {
                let pattern = p.component.javascript.get_pattern(index);
                let name = Span::new(pattern.span.start, pattern.span.end);
                p.out.key("index").string(name.text(p.source));
            }
            if let Some(key) = key {
                p.out.key("key");
                p.expression(key);
            }
            if has_fallback {
                p.out.key("fallback");
                p.range(fallback, place);
            }
        });
    }

    pub(super) fn node(&mut self, node: u32, place: Place) {
        let component = self.component;
        match component.node(node) {
            &TemplateNode::Text { span } => {
                self.out.object();
                self.out.key("type").string("Text");
                self.span(span);
                let raw = self.text(span);
                self.out.key("raw").string(raw);
                self.out.key("data").string(&decode_text(raw));
                self.out.end();
            }
            &TemplateNode::Comment { span, data } => {
                self.out.object();
                self.out.key("type").string("Comment");
                self.span(span);
                self.out.key("data").string(data.text(self.source));
                self.out.end();
            }
            &TemplateNode::Expression { expression, span } => {
                self.tag("ExpressionTag", span, |p| {
                    p.out.key("expression");
                    p.expression(expression);
                });
            }
            &TemplateNode::Html { expression, span } => {
                self.tag("HtmlTag", span, |p| {
                    p.out.key("expression");
                    p.expression(expression);
                });
            }
            &TemplateNode::Render { expression, span } => {
                self.tag("RenderTag", span, |p| {
                    p.out.key("expression");
                    p.expression(expression);
                });
            }
            &TemplateNode::Const { declaration, span } => {
                self.tag("ConstTag", span, |p| {
                    p.out.key("declaration");
                    p.const_declaration(declaration, span);
                });
            }
            &TemplateNode::Declaration { declaration, span } => {
                self.tag("DeclarationTag", span, |p| {
                    p.out.key("declaration");
                    let declaration = p.component.javascript.get_declaration(declaration);
                    p.javascript(declaration);
                });
            }
            &TemplateNode::Debug { identifiers, span } => {
                self.tag("DebugTag", span, |p| {
                    p.out.key("identifiers").array();
                    for &identifier in p.component.debug_identifiers(identifiers) {
                        p.out.element();
                        p.expression(identifier);
                    }
                    p.out.end_array();
                });
            }
            node @ TemplateNode::Each { .. } => self.each_block(node, place),
            node @ (TemplateNode::If { .. }
            | TemplateNode::Key { .. }
            | TemplateNode::Await { .. }) => self.template_block(node, place),
            node @ TemplateNode::Snippet { .. } => self.snippet_block(node, place),
            &TemplateNode::Element {
                name,
                attributes,
                children,
                span,
                ..
            } => self.element(name, attributes, children, span, place),
        }
    }

    /// An identifier that svelte's parser reads itself, with a `loc` from its locator.
    pub(super) fn identifier(
        &mut self,
        span: Span,
        annotation: Option<&oxc_ast::ast::TSTypeAnnotation<'_>>,
    ) {
        self.out.object();
        self.out.key("type").string("Identifier");
        self.out.key("name").string(span.text(self.source));
        self.span(span);
        self.out.key("loc").object();
        for (key, byte) in [("start", span.start_offset), ("end", span.end_offset)] {
            let at = self.lines.line_column(byte);
            self.out.key(key).object();
            self.out.key("line").number(at.line);
            self.out.key("column").number(at.column);
            self.out.key("character").number(at.character);
            self.out.end();
        }
        self.out.end();
        if let Some(annotation) = annotation {
            self.out.key("typeAnnotation").object();
            self.out.key("type").string("TSTypeAnnotation");
            self.span(Span::new(span.end_offset, annotation.span.end));
            self.out.key("typeAnnotation");
            self.javascript(&annotation.type_annotation);
            self.out.end();
        }
        self.out.end();
    }

    /// A pattern as svelte's `read_pattern` reads it: an identifier itself, a destructuring
    /// pattern through acorn.
    pub(super) fn read_pattern(&mut self, parameter: &oxc_ast::ast::FormalParameter<'_>) {
        match &parameter.pattern {
            oxc_ast::ast::BindingPattern::BindingIdentifier(id)
                if parameter.initializer.is_none() =>
            {
                let span = Span::new(id.span.start, id.span.end);
                self.identifier(span, parameter.type_annotation.as_deref());
            }
            _ => self.javascript(parameter),
        }
    }

    /// `{@const id = init}`'s declaration, which svelte builds around the pattern and the
    /// expression it reads.
    pub(super) fn const_declaration(
        &mut self,
        declaration: rsvelte_typescript_tree::DeclarationIdentifier,
        tag: Span,
    ) {
        let declaration = self.component.javascript.get_declaration(declaration);
        let Some(declarator) = declaration.declarations.first() else {
            self.out.null();
            return;
        };
        // The tag's `}`, and the end of the expression before the space ahead of it.
        let close = tag.end_offset - 1;
        let inside = &self.source[..close as usize];
        let init_end = inside.trim_end().len() as u32;
        self.out.object();
        self.out.key("type").string("VariableDeclaration");
        self.out.key("kind").string("const");
        self.out.key("declarations").array().element().object();
        self.out.key("type").string("VariableDeclarator");
        self.out.key("id");
        match &declarator.id {
            oxc_ast::ast::BindingPattern::BindingIdentifier(id) => {
                let span = Span::new(id.span.start, id.span.end);
                self.identifier(span, declarator.type_annotation.as_deref());
            }
            pattern => self.javascript(pattern),
        }
        self.out.key("init");
        match &declarator.init {
            Some(init) => self.javascript(init),
            None => self.out.null(),
        }
        let id_start = declarator.span.start;
        self.span(Span::new(id_start, init_end));
        self.out.end().end_array();
        self.span(Span::new(tag.start_offset + 2, close));
        self.out.end();
    }
}
