//! The official `parse(source, { modern: true })`: the component's modern AST, as JSON.

mod comments;
mod estree;
mod options;
mod parentheses;
mod shape;
mod stylesheet;

use comments::Comment;
use estree::Writer;
use oxc_estree::ESTree;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::{LineBreaks, LineColumn, LineIndex, Span};
use rsvelte_svelte_syntax::syntax_tree::{
    Attribute, AttributeKind, AttributeValue, Component, Part, Range, Script, TemplateNode,
    decode_attribute, decode_text,
};

/// The modern AST of `source`, as JSON.
///
/// # Errors
///
/// What the official parser rejects.
pub fn parse(source: &str) -> Result<String, Diagnostic> {
    let component = rsvelte_svelte_syntax::parse::parse(source).map_err(Diagnostic::from)?;
    Ok(print(source, &component))
}

/// The modern AST of `component`, parsed from `source`, as JSON.
pub(crate) fn print(source: &str, component: &Component) -> String {
    let svelte_lines = Lines::new(source, LineBreaks::Newline);
    let acorn_lines = Lines::new(source, LineBreaks::Ecmascript);
    let comments = javascript_comments(source, component);
    let typescript = component.checked_as_typescript(source);
    let mut printer = Printer {
        source,
        component,
        lines: &svelte_lines,
        comments: &comments,
        out: Writer::new(source, &comments, &acorn_lines, &svelte_lines, typescript),
    };
    printer.root();
    printer.out.finish()
}

/// The lines of a component, counted after its byte order mark, which svelte removes before it
/// parses.
struct Lines {
    index: LineIndex,
    /// Where the text svelte reads starts, in bytes.
    start: u32,
}

impl Lines {
    fn new(source: &str, breaks: LineBreaks) -> Self {
        let text = source.strip_prefix('\u{feff}').unwrap_or(source);
        Self {
            index: LineIndex::with_breaks(text, breaks),
            start: (source.len() - text.len()) as u32,
        }
    }

    fn line_column(&self, byte: u32) -> LineColumn {
        self.index.line_column(byte.saturating_sub(self.start))
    }
}

/// Every JavaScript comment of the component, in document order.
fn javascript_comments(source: &str, component: &Component) -> Vec<Comment> {
    let mut comments = Vec::new();
    for script in [&component.instance, &component.module]
        .into_iter()
        .flatten()
    {
        let program = component.javascript.get_program(script.program);
        let padded = script.content.start_offset;
        comments.extend(program.comments.iter().map(|comment| {
            let span = Span::new(comment.span.start, comment.span.end);
            Comment::new(source, span, comment.is_block(), padded)
        }));
    }
    comments.extend(component.javascript.comments().iter().map(|comment| {
        let span = Span::new(comment.span.start, comment.span.end);
        Comment::new(source, span, comment.is_block(), 0)
    }));
    let in_tags = component.tag_comments.iter();
    comments.extend(in_tags.map(|&span| Comment::in_tag(source, span)));
    comments.sort_by_key(|comment| comment.span.start_offset);
    comments
}

struct Printer<'a> {
    source: &'a str,
    component: &'a Component,
    comments: &'a [Comment],
    /// Lines as svelte's locator counts them, at `\n` only.
    lines: &'a Lines,
    out: Writer<'a>,
}

/// Where an element is, for the type its name gives it.
#[derive(Clone, Copy, Default)]
struct Place {
    in_head: bool,
    in_shadow_root: bool,
}

impl<'a> Printer<'a> {
    fn text(&self, span: Span) -> &'a str {
        span.text(self.source)
    }

    fn character(&self, byte: u32) -> u32 {
        self.lines.line_column(byte).character
    }

    fn span(&mut self, span: Span) {
        let (start, end) = (
            self.character(span.start_offset),
            self.character(span.end_offset),
        );
        self.out.key("start").number(start);
        self.out.key("end").number(end);
    }

    fn root(&mut self) {
        let component = self.component;
        let nodes: Vec<_> = component
            .children(component.root)
            .iter()
            .copied()
            .filter(|&node| !self.is_options(node))
            .collect();
        self.out.object();
        self.out.key("css");
        match &component.style {
            Some(style) => self.stylesheet(style),
            None => self.out.null(),
        }
        self.out.key("js").raw("[]");
        // The official parser places the root over the whole source.
        self.out.key("start").number(0);
        let end = self.character(self.source.len() as u32);
        self.out.key("end").number(end);
        self.out.key("type").string("Root");
        self.out.key("fragment");
        self.fragment(&nodes, Place::default());
        self.out.key("options");
        self.options();
        self.out.key("comments");
        self.out.comments();
        if let Some(script) = &component.instance {
            self.out.key("instance");
            self.script(script, "default");
        }
        if let Some(script) = &component.module {
            self.out.key("module");
            self.script(script, "module");
        }
        self.out.end();
    }

    fn is_options(&self, node: u32) -> bool {
        matches!(
            self.component.node(node),
            TemplateNode::Element { name, .. } if self.text(*name) == "svelte:options"
        )
    }

    fn script(&mut self, script: &Script, context: &str) {
        self.out.object();
        self.out.key("type").string("Script");
        self.span(script.span);
        self.out.key("context").string(context);
        self.out.key("content");
        let program = self.component.javascript.get_program(script.program);
        let content_end = script.content.end_offset;
        // svelte attaches every comment read so far, the earlier parts' too.
        let candidates = 0..self
            .comments
            .partition_point(|comment| comment.span.start_offset < content_end);
        let html_comment = self
            .comment_before(script.span.start_offset)
            .map(|(_, data)| data.text(self.source));
        self.out.program(
            program,
            script.typescript,
            self.character(script.content.start_offset),
            self.character(content_end),
            script.span,
            content_end,
            candidates,
            html_comment,
            self.component.javascript.get_program_tokens(script.program),
        );
        self.out.key("attributes");
        self.tag_attributes(&script.attributes);
        self.out.end();
    }

    /// The attributes of a `<script>` or `<style>` tag, each a name and its text.
    fn tag_attributes(&mut self, attributes: &[(Span, Option<Span>)]) {
        self.out.array();
        for &(name, value) in attributes {
            self.out.element().object();
            self.out.key("type").string("Attribute");
            let end = value.map_or(name.end_offset, |value| {
                let after = value.end_offset as usize;
                let quoted = matches!(self.source.as_bytes().get(after), Some(b'"' | b'\''));
                value.end_offset + u32::from(quoted)
            });
            self.span(Span::new(name.start_offset, end));
            self.out.key("name").string(name.text(self.source));
            self.name_loc(name);
            self.out.key("value");
            match value {
                None => self.out.boolean(true),
                Some(value) => {
                    self.out.array().element().object();
                    self.span(value);
                    self.out.key("type").string("Text");
                    let raw = self.text(value);
                    self.out.key("raw").string(raw);
                    self.out.key("data").string(&decode_attribute(raw));
                    self.out.end().end_array();
                }
            }
            self.out.end();
        }
        self.out.end_array();
    }

    fn name_loc(&mut self, name: Span) {
        self.out.key("name_loc").object();
        for (key, byte) in [("start", name.start_offset), ("end", name.end_offset)] {
            let at = self.lines.line_column(byte);
            self.out.key(key).object();
            self.out.key("line").number(at.line);
            self.out.key("column").number(at.column);
            self.out.key("character").number(at.character);
            self.out.end();
        }
        self.out.end();
    }

    fn fragment(&mut self, nodes: &[u32], place: Place) {
        self.out.object();
        self.out.key("type").string("Fragment");
        self.out.key("nodes").array();
        for &node in nodes {
            self.out.element();
            self.node(node, place);
        }
        self.out.end_array().end();
    }

    fn range(&mut self, range: Range, place: Place) {
        let nodes = self.component.children(range).to_vec();
        self.fragment(&nodes, place);
    }

    fn optional_range(&mut self, range: Range, place: Place) {
        match range.present() {
            Some(range) => self.range(range, place),
            None => self.out.null(),
        }
    }

    fn expression(&mut self, expression: rsvelte_typescript_tree::ExpressionIdentifier) {
        let expression = self.component.javascript.get_expression(expression);
        self.javascript(expression);
    }

    /// A JavaScript part of the template, with the comments acorn reads around it: those
    /// inside it and those only whitespace apart from it.
    fn javascript(&mut self, node: &(impl ESTree + oxc_span::GetSpan)) {
        let span = node.span();
        let comments = self.comments;
        let blank = |text: &str| text.chars().all(char::is_whitespace);
        let mut start = comments.partition_point(|comment| comment.span.start_offset < span.start);
        let mut edge = span.start;
        while start > 0
            && blank(&self.source[comments[start - 1].span.end_offset as usize..edge as usize])
        {
            start -= 1;
            edge = comments[start].span.start_offset;
        }
        let mut end = comments.partition_point(|comment| comment.span.start_offset < span.end);
        let mut edge = span.end;
        while end < comments.len()
            && blank(&self.source[edge as usize..comments[end].span.start_offset as usize])
        {
            edge = comments[end].span.end_offset;
            end += 1;
        }
        self.out.javascript(node, start..end);
    }

    /// The HTML comment just before the `<script>` or `<style>` at `start`, with only
    /// whitespace between: its span and its text.
    fn comment_before(&self, start: u32) -> Option<(Span, Span)> {
        let component = self.component;
        let before = component
            .children(component.root)
            .iter()
            .map(|&node| component.node(node))
            .filter(|node| node.span().end_offset <= start);
        for (at, node) in before.rev().enumerate() {
            if at == 0 && node.span().end_offset != start {
                return None;
            }
            match *node {
                TemplateNode::Comment { span, data } => return Some((span, data)),
                TemplateNode::Text { span } if self.text(span).trim().is_empty() => {}
                _ => return None,
            }
        }
        None
    }

    /// A block: `{#if}`, `{#key}` or `{#await}`.
    fn template_block(&mut self, node: &TemplateNode, place: Place) {
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

    fn snippet_block(&mut self, node: &TemplateNode, place: Place) {
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

    fn each_block(&mut self, node: &TemplateNode, place: Place) {
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

    fn node(&mut self, node: u32, place: Place) {
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
    fn identifier(&mut self, span: Span, annotation: Option<&oxc_ast::ast::TSTypeAnnotation<'_>>) {
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
    fn read_pattern(&mut self, parameter: &oxc_ast::ast::FormalParameter<'_>) {
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
    fn const_declaration(
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

    fn tag(&mut self, kind: &str, span: Span, fields: impl FnOnce(&mut Self)) {
        self.out.object();
        self.out.key("type").string(kind);
        self.span(span);
        fields(self);
        self.out.end();
    }

    fn element(
        &mut self,
        name: Span,
        attributes: Range,
        children: Range,
        span: Span,
        place: Place,
    ) {
        let name_text = self.text(name);
        let kind = match name_text {
            "svelte:head" => "SvelteHead",
            "svelte:options" => "SvelteOptions",
            "svelte:window" => "SvelteWindow",
            "svelte:document" => "SvelteDocument",
            "svelte:body" => "SvelteBody",
            "svelte:element" => "SvelteElement",
            "svelte:component" => "SvelteComponent",
            "svelte:self" => "SvelteSelf",
            "svelte:fragment" => "SvelteFragment",
            "svelte:boundary" => "SvelteBoundary",
            _ if rsvelte_svelte_syntax::names::is_component_name(name_text) => "Component",
            "title" if place.in_head => "TitleElement",
            "slot" if !place.in_shadow_root => "SlotElement",
            _ => "RegularElement",
        };
        let mut inner = place;
        match kind {
            "SvelteHead" => inner.in_head = true,
            "RegularElement" | "Component" => inner.in_head = false,
            _ => {}
        }
        if kind == "RegularElement"
            && self.component.attributes(attributes).iter().any(|a| {
                a.kind == AttributeKind::Attribute && self.text(a.name) == "shadowrootmode"
            })
        {
            inner.in_shadow_root = true;
        }
        let this = matches!(kind, "SvelteElement" | "SvelteComponent")
            .then(|| {
                self.component
                    .attributes(attributes)
                    .iter()
                    .position(|a| a.kind == AttributeKind::Attribute && self.text(a.name) == "this")
            })
            .flatten();
        self.out.object();
        self.out.key("type").string(kind);
        self.span(span);
        self.out.key("name").string(name_text);
        self.name_loc(name);
        self.out.key("attributes");
        self.attributes_except(attributes, this);
        self.out.key("fragment");
        let text = self.text(span);
        let raw_text = matches!(name_text, "script" | "style") && !text.ends_with("/>");
        match text.rfind("</") {
            // svelte reads a nested script or style as one text, empty or not.
            Some(close) if raw_text && self.component.children(children).is_empty() => {
                let at = span.start_offset + close as u32;
                self.out.object();
                self.out.key("type").string("Fragment");
                self.out.key("nodes").array().element().object();
                self.out.key("type").string("Text");
                self.span(Span::new(at, at));
                self.out.key("raw").string("");
                self.out.key("data").string("");
                self.out.end().end_array().end();
            }
            _ => self.range(children, inner),
        }
        if let Some(this) = this {
            let attribute = &self.component.attributes(attributes)[this];
            self.out.key(if kind == "SvelteElement" {
                "tag"
            } else {
                "expression"
            });
            self.this_value(attribute);
        }
        self.out.end();
    }

    fn this_value(&mut self, attribute: &Attribute) {
        let AttributeValue::Parts(parts) = attribute.value else {
            self.out.null();
            return;
        };
        match self.component.parts(parts).first() {
            Some(&Part::Expression { expression, .. }) => self.expression(expression),
            Some(&Part::Text(span)) => {
                self.out.object();
                self.out.key("type").string("Literal");
                let raw = self.text(span);
                self.out.key("value").string(&decode_attribute(raw));
                self.out.key("raw").string(&format!("'{raw}'"));
                self.span(span);
                self.out.end();
            }
            None => self.out.null(),
        }
    }

    fn attributes(&mut self, attributes: Range, _element: &str) {
        self.attributes_except(attributes, None);
    }

    fn attributes_except(&mut self, attributes: Range, except: Option<usize>) {
        self.out.array();
        let list = self.component.attributes(attributes);
        for (index, attribute) in list.iter().enumerate() {
            if Some(index) == except {
                continue;
            }
            self.out.element();
            self.attribute(attribute);
        }
        self.out.end_array();
    }

    fn attribute(&mut self, attribute: &Attribute) {
        match attribute.kind {
            AttributeKind::Spread | AttributeKind::Attach => {
                let kind = if attribute.kind == AttributeKind::Spread {
                    "SpreadAttribute"
                } else {
                    "AttachTag"
                };
                self.out.object();
                self.out.key("type").string(kind);
                self.span(attribute.span);
                self.out.key("expression");
                match self.value_expression(attribute) {
                    Some(expression) => self.expression(expression),
                    None => self.out.null(),
                }
                self.out.end();
            }
            AttributeKind::Attribute if attribute.shorthand => {
                // `{name}`: svelte reads the name itself, so the tag is just the identifier.
                let name = attribute.name;
                self.out.object();
                self.out.key("type").string("Attribute");
                self.span(attribute.span);
                self.out.key("name").string(name.text(self.source));
                self.name_loc(name);
                self.out.key("value").object();
                self.out.key("type").string("ExpressionTag");
                self.span(name);
                self.out.key("expression");
                self.identifier(name, None);
                self.out.end();
                self.out.end();
            }
            AttributeKind::Attribute => {
                self.out.object();
                self.out.key("type").string("Attribute");
                self.span(attribute.span);
                self.out
                    .key("name")
                    .string(attribute.name.text(self.source));
                self.name_loc(attribute.name);
                self.out.key("value");
                self.attribute_value(attribute);
                self.out.end();
            }
            kind => self.directive(attribute, kind),
        }
    }

    /// A directive: `bind:`, `class:`, `on:`, `use:`, a transition, `animate:`, `style:` or `let:`.
    fn directive(&mut self, attribute: &Attribute, kind: AttributeKind) {
        let component = self.component;
        let directive = match kind {
            AttributeKind::Bind => "BindDirective",
            AttributeKind::Class => "ClassDirective",
            AttributeKind::On => "OnDirective",
            AttributeKind::Use => "UseDirective",
            AttributeKind::Transition { .. } => "TransitionDirective",
            AttributeKind::Animate => "AnimateDirective",
            AttributeKind::Style => "StyleDirective",
            AttributeKind::Let => "LetDirective",
            _ => unreachable!("matched above"),
        };
        self.out.object();
        self.span(attribute.span);
        self.out.key("type").string(directive);
        let name = attribute
            .directive_name(&component.modifiers)
            .map_or("", |name| self.text(name));
        self.out.key("name").string(name);
        self.name_loc(attribute.name);
        if kind == AttributeKind::Style {
            self.modifiers(attribute);
            self.out.key("value");
            if attribute.shorthand {
                // `style:color` has no value of its own.
                self.out.boolean(true);
            } else {
                self.attribute_value(attribute);
            }
        } else {
            self.out.key("expression");
            // `bind:value` and `class:active` name their expression.
            let named =
                attribute.shorthand && matches!(kind, AttributeKind::Bind | AttributeKind::Class);
            if named {
                let name = attribute
                    .directive_name(&component.modifiers)
                    .unwrap_or(attribute.name);
                self.out.object();
                self.span(Span::new(name.start_offset, attribute.span.end_offset));
                self.out.key("type").string("Identifier");
                self.out.key("name").string(name.text(self.source));
                self.out.end();
            } else {
                match self.value_expression(attribute) {
                    Some(expression) => self.expression(expression),
                    None => self.out.null(),
                }
            }
            self.modifiers(attribute);
            if let AttributeKind::Transition { intro, outro } = kind {
                self.out.key("intro").boolean(intro);
                self.out.key("outro").boolean(outro);
            }
        }
        self.out.end();
    }

    /// The one expression of a directive's or a spread's value.
    fn value_expression(
        &self,
        attribute: &Attribute,
    ) -> Option<rsvelte_typescript_tree::ExpressionIdentifier> {
        let AttributeValue::Parts(parts) = attribute.value else {
            return None;
        };
        match self.component.parts(parts).first() {
            Some(&Part::Expression { expression, .. }) => Some(expression),
            _ => None,
        }
    }

    fn modifiers(&mut self, attribute: &Attribute) {
        self.out.key("modifiers").array();
        for &modifier in self.component.modifiers(attribute.modifiers) {
            self.out.element().string(modifier.text(self.source));
        }
        self.out.end_array();
    }

    fn attribute_value(&mut self, attribute: &Attribute) {
        let AttributeValue::Parts(range) = attribute.value else {
            self.out.boolean(true);
            return;
        };
        let parts = self.component.parts(range);
        let single_expression = !attribute.quoted && matches!(parts, [Part::Expression { .. }]);
        if single_expression {
            self.part(parts[0]);
            return;
        }
        self.out.array();
        if parts.is_empty() {
            // `a=""`: one empty text, at the closing quote.
            let at = attribute.span.end_offset - 1;
            self.out.element().object();
            self.span(Span::new(at, at));
            self.out.key("type").string("Text");
            self.out.key("raw").string("");
            self.out.key("data").string("");
            self.out.end();
        }
        for &part in parts {
            self.out.element();
            self.part(part);
        }
        self.out.end_array();
    }

    fn part(&mut self, part: Part) {
        match part {
            Part::Text(span) => {
                self.out.object();
                self.span(span);
                self.out.key("type").string("Text");
                let raw = self.text(span);
                self.out.key("raw").string(raw);
                self.out.key("data").string(&decode_attribute(raw));
                self.out.end();
            }
            Part::Expression { expression, span } => {
                self.out.object();
                self.out.key("type").string("ExpressionTag");
                self.span(span);
                self.out.key("expression");
                self.expression(expression);
                self.out.end();
            }
        }
    }

    fn stylesheet(&mut self, style: &rsvelte_svelte_syntax::syntax_tree::Style) {
        self.out.object();
        self.out.key("type").string("StyleSheet");
        self.span(style.span);
        self.out.key("attributes");
        self.tag_attributes(&style.attributes);
        self.out.key("children");
        match &style.sheet {
            Ok(sheet) => self.rules(sheet, &sheet.rules),
            Err(_) => self.out.raw("[]"),
        }
        self.out.key("comments").array();
        if let Ok(sheet) = &style.sheet {
            for &comment in &sheet.comments {
                self.out.element().object();
                self.out.key("type").string("CSSComment");
                let text = comment.text(self.source);
                let inner = text.strip_prefix("/*").unwrap_or(text);
                let inner = inner.strip_suffix("*/").unwrap_or(inner);
                self.out.key("value").string(inner);
                self.span(comment);
                self.out.end();
            }
        }
        self.out.end_array();
        self.out.key("content").object();
        self.span(style.content);
        self.out
            .key("styles")
            .string(style.content.text(self.source));
        self.out.key("comment");
        match self.comment_before(style.span.start_offset) {
            Some((span, data)) => {
                self.out.object();
                self.out.key("type").string("Comment");
                self.span(span);
                self.out.key("data").string(data.text(self.source));
                self.out.end();
            }
            None => self.out.null(),
        }
        self.out.end();
        self.out.end();
    }
}

#[cfg(test)]
mod tests;
