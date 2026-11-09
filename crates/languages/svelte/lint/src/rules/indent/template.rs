//! How the markup lays out its tokens: elements, attributes, blocks and tags.

use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte::syntax::syntax_tree::{
    Attribute, AttributeKind, AttributeValue, Component, Part, Range, Script as ScriptElement,
    TemplateNode, TemplateNodeIdentifier, TokenType,
};
use rsvelte_typescript::lexer::T;
use rsvelte_typescript::{Kind, NodeIdentifier};

use super::layout::{Item, Token};
use super::script::Script;

const PREFORMATTED: [&str; 3] = ["pre", "textarea", "template"];

pub(super) struct Template<'s, 'a> {
    pub script: Script<'s, 'a>,
    pub component: &'a Component,
}

/// A top-level part of the component in document order.
enum Top<'a> {
    Script(&'a ScriptElement),
    Style(Span, Span),
    Node(TemplateNodeIdentifier),
}

impl<'a> Template<'_, 'a> {
    const fn tokens(&self) -> &super::layout::Tokens<'_> {
        &self.script.layout.tokens
    }

    fn offset(&mut self, token: Option<Token>, offset: u32, base: Option<Token>) {
        self.script.layout.offset(token, offset, base);
    }

    fn first(&self, span: Span) -> Option<Token> {
        self.tokens().first(span)
    }

    fn after(&self, token: Option<Token>) -> Option<Token> {
        self.tokens().after(token?)
    }

    fn js_span(&self, node: NodeIdentifier) -> Option<Span> {
        if node.is_none() {
            return None;
        }
        self.script.span(node)
    }

    fn js_first(&self, node: NodeIdentifier) -> Option<Token> {
        self.first(self.js_span(node)?)
    }

    fn js_outer(&self, node: NodeIdentifier) -> Option<(Token, Token)> {
        self.tokens().outer(self.js_span(node)?, 0)
    }

    /// The token after the node's last token.
    fn js_after(&self, node: NodeIdentifier) -> Option<Token> {
        self.tokens().after_offset(self.js_span(node)?.end_offset)
    }

    fn visit_js(&mut self, node: NodeIdentifier) {
        if !node.is_none() {
            self.script.visit(node);
        }
    }

    /// Lays out the whole component.
    pub(super) fn visit(&mut self) {
        let component = self.component;
        let mut tops: Vec<(u32, Top<'_>)> = [&component.module, &component.instance]
            .into_iter()
            .flatten()
            .map(|s| (s.span.start_offset, Top::Script(s)))
            .collect();
        if let Some(style) = &component.style {
            tops.push((
                style.span.start_offset,
                Top::Style(style.span, style.sheet.content),
            ));
        }
        let root = component.children(component.root);
        for &n in root {
            tops.push((component.node(n).span().start_offset, Top::Node(n)));
        }
        tops.sort_by_key(|(start, _)| *start);
        // `Program`: each top-level part starts at column zero.
        for (_, top) in &tops {
            let span = match *top {
                Top::Script(s) => s.span,
                Top::Style(span, _) => span,
                Top::Node(n) => component.node(n).span(),
            };
            let first = self.first(span);
            self.script.layout.start(first, 0);
        }
        let first_body = tops.first().and_then(|(_, top)| match top {
            Top::Node(n) => Some(*n),
            _ => None,
        });
        for (_, top) in tops {
            match top {
                Top::Script(script) => self.script_element(script),
                Top::Style(span, content) => {
                    self.start_tag(Span::new(span.start_offset, content.start_offset), &[]);
                    self.script.layout.ignore(content);
                    self.end_tag(Span::new(content.end_offset, span.end_offset));
                }
                Top::Node(n) => self.node(n, first_body == Some(n)),
            }
        }
    }

    fn script_element(&mut self, script: &ScriptElement) {
        let start_tag = Span::new(script.span.start_offset, script.content.start_offset);
        let end_tag = Span::new(script.content.end_offset, script.span.end_offset);
        let statements: &[NodeIdentifier] = match self.script.javascript.kind(script.program) {
            Kind::Program(statements) => statements,
            _ => &[],
        };
        let items: Vec<Option<Item>> = statements
            .iter()
            .map(|&s| self.js_span(s).map(Item::Node))
            .collect();
        let offset = u32::from(self.script.layout.options.indent_script);
        self.script.layout.list(
            &items,
            Item::Node(start_tag),
            Some(Item::Node(end_tag)),
            offset,
            false,
        );
        let attributes: Vec<(Span, Span, Option<Span>)> = script
            .attributes
            .iter()
            .map(|&(name, value)| (self.tag_attribute_span(name, value), name, value))
            .collect();
        self.start_tag(start_tag, &attributes);
        for (span, name, _) in &attributes {
            self.attribute(*span, *name, &[], true);
        }
        for &statement in statements {
            self.script.visit(statement);
        }
        // TypeScript syntax the script's tree does not hold is not checked.
        for typescript in &self.script.javascript.typescript {
            if typescript.span.start_offset >= script.content.start_offset
                && typescript.span.end_offset <= script.content.end_offset
            {
                self.script.layout.ignore(typescript.span);
            }
        }
        self.end_tag(end_tag);
    }

    /// A `<script>` attribute from its name to its closing quote.
    fn tag_attribute_span(&self, name: Span, value: Option<Span>) -> Span {
        let tokens = self.tokens();
        let Some(name_token) = tokens.first(name) else {
            return name;
        };
        let Some(eq) = tokens
            .after(name_token)
            .filter(|&t| tokens.kind(t) == TokenType::Eq)
        else {
            return name;
        };
        let Some(next) = tokens.after(eq) else {
            return name;
        };
        if tokens.kind(next) == TokenType::Quote {
            let close = (next + 1..tokens.count())
                .take_while(|&t| {
                    tokens.kind(t) == TokenType::AttributeText || tokens.kind(t) == TokenType::Quote
                })
                .find(|&t| tokens.kind(t) == TokenType::Quote);
            if let Some(close) = close {
                return Span::new(name.start_offset, tokens.span(close).end_offset);
            }
        }
        Span::new(
            name.start_offset,
            value.map_or(name.end_offset, |v| v.end_offset),
        )
    }

    /// `SvelteStartTag`: attributes indented from `<`, the closing `>` at it.
    fn start_tag(&mut self, span: Span, attributes: &[(Span, Span, Option<Span>)]) {
        let tokens = self.tokens();
        let (Some(open), Some(close)) = (tokens.first(span), tokens.last(span)) else {
            return;
        };
        let items: Vec<Option<Item>> = attributes.iter().map(|a| Some(Item::Node(a.0))).collect();
        let align = self.script.layout.options.align_attributes_vertically;
        self.script.layout.list(
            &items,
            Item::Token(open),
            Some(Item::Token(close)),
            1,
            align,
        );
    }

    /// `SvelteEndTag`.
    fn end_tag(&mut self, span: Span) {
        let tokens = self.tokens();
        if let (Some(open), Some(close)) = (tokens.first(span), tokens.last(span)) {
            self.script
                .layout
                .list(&[], Item::Token(open), Some(Item::Token(close)), 1, false);
        }
    }

    /// `SvelteAttribute` and the directives: `=` and the value indented from the name.
    fn attribute(&mut self, span: Span, name: Span, values: &[Option<Item>], quoted_values: bool) {
        let tokens = self.tokens();
        let Some(key) = tokens.first(span) else {
            return;
        };
        let Some(key_last) = tokens.last(name) else {
            return;
        };
        let Some(eq) = tokens
            .after(key_last)
            .filter(|&t| tokens.span(t).end_offset <= span.end_offset)
        else {
            return;
        };
        self.offset(Some(eq), 1, Some(key));
        let tokens = self.tokens();
        let Some(value_start) = tokens
            .after(eq)
            .filter(|&t| tokens.span(t).end_offset <= span.end_offset)
        else {
            return;
        };
        self.offset(Some(value_start), 1, Some(key));
        let tokens = self.tokens();
        let start_kind = tokens.kind(value_start);
        let quoted = start_kind == TokenType::Quote;
        let mustache = start_kind == TokenType::MustacheOpen;
        if quoted || mustache {
            let last = tokens.last(span);
            let closes = last.is_some_and(|l| {
                let kind = tokens.kind(l);
                l != value_start
                    && ((quoted
                        && kind == TokenType::Quote
                        && tokens.text(l) == tokens.text(value_start))
                        || (mustache && kind == TokenType::MustacheClose))
            });
            if closes {
                self.offset(last, 0, Some(value_start));
                let values = if quoted_values { values } else { &[] };
                self.script.layout.list(
                    values,
                    Item::Token(value_start),
                    last.map(Item::Token),
                    1,
                    false,
                );
                return;
            }
        }
        if quoted_values {
            for value in values.iter().flatten() {
                let first = match *value {
                    Item::Node(span) => self.first(span),
                    Item::Token(t) => Some(t),
                };
                self.offset(first, 0, Some(value_start));
            }
        }
    }

    /// `SvelteText` and `SvelteLiteral`: later words of the text from its first.
    fn text(&mut self, span: Span, first_of_parent: Option<bool>) {
        let tokens = self.tokens();
        let words: Vec<Token> = tokens.within(span).collect();
        let Some((&first, rest)) = words.split_first() else {
            return;
        };
        let offset = if tokens.begins_line(tokens.span(first).start_offset) {
            0
        } else {
            u32::from(first_of_parent.unwrap_or(true))
        };
        self.script
            .layout
            .offset_all(rest.to_vec(), offset, Some(first));
    }

    fn children(&self, range: Range) -> &'a [TemplateNodeIdentifier] {
        self.component.children(range)
    }

    const fn source(&self) -> &'a str {
        self.script.layout.tokens.source
    }

    /// Each child's first token indented from `open`.
    fn block_children(&mut self, range: Range, open: Option<Token>) {
        for &child in self.children(range) {
            let first = self.first(self.component.node(child).span());
            self.offset(first, 1, open);
        }
    }

    fn visit_children(&mut self, range: Range) {
        for (i, &child) in self.children(range).iter().enumerate() {
            self.node(child, i == 0);
        }
    }

    /// The opening token of a tag and its keyword: `{#if` is both, `{ #if` is two.
    fn head(&self, open: Option<Token>) -> (Option<Token>, Option<Token>) {
        let tokens = self.tokens();
        match open {
            Some(o) if tokens.kind(o) == TokenType::MustacheOpen => (open, tokens.after(o)),
            _ => (open, open),
        }
    }

    /// `{/if}` as its opening token, keyword and `}`.
    fn closing(&mut self, span: Span, open: Option<Token>) {
        let tokens = self.tokens();
        let close = tokens.last(span);
        let keyword = close.and_then(|c| tokens.before(c));
        let start = keyword.and_then(|k| {
            let before = tokens.before(k)?;
            Some(
                if tokens.kind(before) == TokenType::MustacheOpen
                    && tokens.kind(k) == TokenType::BlockOpen
                    && !tokens.text(k).starts_with('{')
                {
                    before
                } else {
                    k
                },
            )
        });
        self.offset(start, 0, open);
        self.offset(keyword, 1, start);
        self.offset(close, 0, start);
    }

    /// Where a branch's content ends: its last child, or the `}` of its tag.
    fn region_end(&self, range: Range, tag_close: Option<Token>) -> Option<u32> {
        self.children(range)
            .last()
            .map(|&c| self.component.node(c).span().end_offset)
            .or_else(|| tag_close.map(|t| self.tokens().span(t).end_offset))
    }

    #[expect(clippy::too_many_lines, reason = "one arm per template node")]
    fn node(&mut self, id: TemplateNodeIdentifier, first_of_parent: bool) {
        let component = self.component;
        let node = component.node(id);
        let span = node.span();
        let open = self.first(span);
        match *node {
            TemplateNode::Text { span } => self.text(span, Some(first_of_parent)),
            TemplateNode::Comment { .. } => {}
            TemplateNode::Expression { expression, .. } | TemplateNode::Html { expression, .. } => {
                let close = self.tokens().last(span);
                let item = self.js_span(expression).map(Item::Node);
                if let Some(o) = open {
                    self.script.layout.list(
                        &[item],
                        Item::Token(o),
                        close.map(Item::Token),
                        1,
                        false,
                    );
                }
                self.visit_js(expression);
            }
            TemplateNode::Element {
                name,
                attributes,
                children,
                start_tag,
                end_tag,
                ..
            } => self.element(span, name, attributes, children, start_tag, end_tag),
            TemplateNode::If { .. } => self.if_block(id),
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
                let (open, keyword) = self.head(open);
                self.offset(keyword, 1, open);
                let items = [expression, context, index].map(|n| self.js_span(n).map(Item::Node));
                if let Some(k) = keyword {
                    self.script
                        .layout
                        .list(&items, Item::Token(k), None, 1, false);
                }
                let tag_close = if key.is_none() {
                    let last = [index, context, expression]
                        .into_iter()
                        .find(|n| !n.is_none());
                    let close = last.and_then(|n| self.js_after(n));
                    self.offset(close, 0, open);
                    close
                } else {
                    let key_tokens = self.js_outer(key);
                    self.offset(key_tokens.map(|(f, _)| f), 1, keyword);
                    let close = self.after(key_tokens.map(|(_, l)| l));
                    self.offset(close, 0, open);
                    close
                };
                self.block_children(body, open);
                let else_open = if has_fallback {
                    let end = self.region_end(body, tag_close);
                    let else_open = end.and_then(|e| self.tokens().after_offset(e));
                    self.offset(else_open, 0, open);
                    else_open
                } else {
                    None
                };
                self.closing(span, open);
                self.visit_js(expression);
                self.visit_js(context);
                self.visit_js(index);
                self.visit_js(key);
                self.visit_children(body);
                if has_fallback {
                    self.else_block(else_open, fallback);
                }
            }
            TemplateNode::Key {
                expression, body, ..
            } => {
                let (open, keyword) = self.head(open);
                self.offset(keyword, 1, open);
                let expression_tokens = self.js_outer(expression);
                self.offset(expression_tokens.map(|(f, _)| f), 1, keyword);
                let close = self.after(expression_tokens.map(|(_, l)| l));
                self.offset(close, 0, open);
                self.block_children(body, open);
                self.closing(span, open);
                self.visit_js(expression);
                self.visit_children(body);
            }
            TemplateNode::Await {
                expression,
                value,
                error,
                pending,
                then,
                catch,
                ..
            } => self.await_block(span, expression, value, error, pending, then, catch),
            TemplateNode::Snippet {
                name,
                parameters,
                body,
                ..
            } => {
                let (open, keyword) = self.head(open);
                self.offset(keyword, 1, open);
                let snippet_name = self.after(keyword);
                self.offset(snippet_name, 1, keyword);
                let parameters = component.javascript_list(parameters);
                let tokens = self.tokens();
                let is_left = |t: Token| tokens.is(t, T::LParen);
                let left = match parameters.first() {
                    Some(&p) => self
                        .js_span(p)
                        .and_then(|s| tokens.before_matching(s.start_offset, is_left)),
                    // Upstream searches back from the block's end and can take a `(` in the body.
                    None => snippet_name
                        .and_then(|n| tokens.after_matching(tokens.span(n).end_offset, is_left)),
                };
                let from = parameters
                    .last()
                    .and_then(|&p| self.js_span(p))
                    .map(|s| s.end_offset)
                    .or_else(|| left.map(|l| tokens.span(l).end_offset));
                let right =
                    from.and_then(|f| tokens.after_matching(f, |t| tokens.is(t, T::RParen)));
                self.offset(left, 1, snippet_name);
                let items: Vec<Option<Item>> = parameters
                    .iter()
                    .map(|&p| self.js_span(p).map(Item::Node))
                    .collect();
                if let Some(l) = left {
                    self.script.layout.list(
                        &items,
                        Item::Token(l),
                        right.map(Item::Token),
                        1,
                        false,
                    );
                }
                let close = self.after(right);
                self.offset(close, 0, open);
                self.block_children(body, open);
                self.closing(span, open);
                self.visit_js(name);
                for &p in parameters {
                    self.visit_js(p);
                }
                self.visit_children(body);
            }
            TemplateNode::Render { expression, .. } => {
                let (open, keyword) = self.head(open);
                self.offset(keyword, 1, open);
                let first = self.js_first(expression);
                self.offset(first, 1, keyword);
                self.visit_js(expression);
            }
            TemplateNode::Const { declaration, .. } => {
                let (open, keyword) = self.head(open);
                self.offset(keyword, 1, open);
                let declarators: &[NodeIdentifier] = match self.script.javascript.kind(declaration)
                {
                    Kind::VariableDeclaration { declarations, .. } => declarations,
                    _ => &[],
                };
                let first = declarators.first().and_then(|&d| self.js_first(d));
                self.offset(first, 1, open);
                let close = self.tokens().last(span);
                self.offset(close, 0, open);
                for &d in declarators {
                    self.visit_js(d);
                }
            }
            TemplateNode::Declaration { declaration, .. } => {
                let first = self.js_first(declaration);
                self.offset(first, 1, open);
                let close = self.tokens().last(span);
                self.offset(close, 0, open);
                self.visit_js(declaration);
            }
            TemplateNode::Debug { identifiers, .. } => {
                let identifiers = component.javascript_list(identifiers);
                let items: Vec<Option<Item>> = identifiers
                    .iter()
                    .map(|&p| self.js_span(p).map(Item::Node))
                    .collect();
                let close = self.tokens().last(span);
                if let Some(o) = open {
                    self.script.layout.list(
                        &items,
                        Item::Token(o),
                        close.map(Item::Token),
                        1,
                        false,
                    );
                }
                for &i in identifiers {
                    self.visit_js(i);
                }
            }
        }
    }

    fn element(
        &mut self,
        span: Span,
        name: Span,
        attributes: Range,
        children: Range,
        start_tag: Span,
        has_end_tag: bool,
    ) {
        let component = self.component;
        let source = self.source();
        let name_text = name.text(source);
        let open = self.first(span);
        let end_tag = has_end_tag.then(|| self.end_tag_span(span)).flatten();
        if PREFORMATTED.contains(&name_text) || name_text == "style" {
            if name_text != "style" {
                let end_open = end_tag.and_then(|s| self.first(s));
                self.offset(end_open, 0, open);
            }
            for &child in self.children(children) {
                self.script.layout.ignore(component.node(child).span());
            }
        } else if let Some(end_tag) = end_tag {
            let items: Vec<Option<Item>> = self
                .children(children)
                .iter()
                .map(|&c| component.node(c))
                .filter(|n| !matches!(n, TemplateNode::Text { span } if span.text(source).trim().is_empty()))
                .map(|n| Some(Item::Node(n.span())))
                .collect();
            self.script.layout.list(
                &items,
                Item::Node(start_tag),
                Some(Item::Node(end_tag)),
                1,
                false,
            );
        }
        let attributes = component.attributes(attributes);
        let spans: Vec<(Span, Span, Option<Span>)> =
            attributes.iter().map(|a| (a.span, a.name, None)).collect();
        self.start_tag(start_tag, &spans);
        for attribute in attributes {
            self.element_attribute(attribute);
        }
        let skip_children = PREFORMATTED.contains(&name_text) || name_text == "style";
        if !skip_children {
            self.visit_children(children);
        }
        if let Some(end_tag) = end_tag {
            self.end_tag(end_tag);
        }
    }

    /// `</name>`, the last tokens of an element that has its own end tag.
    fn end_tag_span(&self, span: Span) -> Option<Span> {
        let tokens = self.tokens();
        let t = tokens.last_matching(span, |t| tokens.kind(t) == TokenType::EndTagOpen)?;
        Some(Span::new(tokens.span(t).start_offset, span.end_offset))
    }

    fn element_attribute(&mut self, attribute: &Attribute) {
        let component = self.component;
        let parts: &[Part] = match attribute.value {
            AttributeValue::Parts(range) => component.parts(range),
            AttributeValue::True => &[],
        };
        match attribute.kind {
            AttributeKind::Attach => {
                self.script.layout.ignore(attribute.span);
                return;
            }
            AttributeKind::Spread => {
                self.shorthand(attribute.span);
            }
            AttributeKind::Attribute if attribute.shorthand => self.shorthand(attribute.span),
            AttributeKind::Attribute | AttributeKind::Style => {
                let values: Vec<Option<Item>> = parts
                    .iter()
                    .map(|p| {
                        Some(Item::Node(match *p {
                            Part::Text(span) | Part::Expression { span, .. } => span,
                        }))
                    })
                    .collect();
                self.attribute(attribute.span, attribute.name, &values, true);
            }
            _ => self.attribute(attribute.span, attribute.name, &[], false),
        }
        for part in parts {
            match *part {
                Part::Text(span) => self.text(span, None),
                Part::Expression { expression, span } => {
                    if matches!(
                        attribute.kind,
                        AttributeKind::Attribute | AttributeKind::Style
                    ) && !attribute.shorthand
                    {
                        let tokens = self.tokens();
                        let (open, close) = (tokens.first(span), tokens.last(span));
                        let item = self.js_span(expression).map(Item::Node);
                        if let Some(o) = open {
                            self.script.layout.list(
                                &[item],
                                Item::Token(o),
                                close.map(Item::Token),
                                1,
                                false,
                            );
                        }
                    }
                    self.visit_js(expression);
                }
            }
        }
    }

    /// `{name}` and `{...spread}`.
    fn shorthand(&mut self, span: Span) {
        let tokens = self.tokens();
        if let (Some(open), Some(close)) = (tokens.first(span), tokens.last(span)) {
            self.script
                .layout
                .list(&[], Item::Token(open), Some(Item::Token(close)), 1, false);
        }
    }

    fn else_block(&mut self, else_open: Option<Token>, range: Range) {
        let (open, keyword) = self.head(else_open);
        self.offset(keyword, 1, open);
        let close = self.after(keyword);
        self.offset(close, 0, open);
        self.block_children(range, open);
        self.visit_children(range);
    }

    fn if_block(&mut self, root: TemplateNodeIdentifier) {
        let component = self.component;
        let span = component.node(root).span();
        let mut open = self.first(span);
        let branches = component.if_branches(root);
        let mut tag_open = open;
        for (i, &branch) in branches.iter().enumerate() {
            let TemplateNode::If {
                test,
                consequent,
                alternate,
                ..
            } = *component.node(branch)
            else {
                continue;
            };
            let (head_open, keyword) = self.head(tag_open);
            open = head_open;
            let mut if_tokens = vec![keyword];
            if i > 0 {
                let if_keyword = self.after(keyword);
                if_tokens.push(if_keyword);
            }
            for t in &if_tokens {
                self.offset(*t, 1, open);
            }
            let test_tokens = self.js_outer(test);
            self.offset(test_tokens.map(|(f, _)| f), 1, if_tokens[0]);
            let close = self.after(test_tokens.map(|(_, l)| l));
            self.offset(close, 0, open);
            self.block_children(consequent, open);
            let next_open = alternate.and_then(|_| {
                let end = self.region_end(consequent, close)?;
                self.tokens().after_offset(end)
            });
            if alternate.is_some() {
                self.offset(next_open, 0, open);
            }
            let is_elseif = i + 1 < branches.len();
            if !is_elseif {
                self.closing(span, open);
            }
            self.visit_js(test);
            self.visit_children(consequent);
            if let Some(alternate) = alternate {
                if is_elseif {
                    tag_open = next_open;
                } else {
                    self.else_block(next_open, alternate);
                }
            }
        }
    }

    #[expect(clippy::too_many_arguments, reason = "the parts of an await block")]
    fn await_block(
        &mut self,
        span: Span,
        expression: NodeIdentifier,
        value: NodeIdentifier,
        error: NodeIdentifier,
        pending: Range,
        then: Range,
        catch: Range,
    ) {
        let (open, keyword) = self.head(self.first(span));
        self.offset(keyword, 1, open);
        let expression_tokens = self.js_outer(expression);
        self.offset(expression_tokens.map(|(f, _)| f), 1, keyword);
        let after_expression = self.after(expression_tokens.map(|(_, l)| l));
        let tokens = self.tokens();
        let inline = after_expression.filter(|&t| tokens.kind(t) == TokenType::BlockKeyword);
        let mut region = None;
        let mut then_open = None;
        let mut catch_open = None;
        if let Some(pending) = pending.present() {
            let close = after_expression;
            self.offset(close, 0, open);
            let first_child = self
                .children(pending)
                .iter()
                .find_map(|&c| self.first(self.component.node(c).span()));
            self.offset(first_child, 1, open);
            region = self.region_end(pending, close);
        }
        let inline_then = inline.filter(|&t| self.tokens().text(t) == "then");
        let inline_catch = inline.filter(|&t| self.tokens().text(t) == "catch");
        if then.present().is_some() {
            if let Some(then_token) = inline_then {
                self.offset(Some(then_token), 1, open);
                let value_first = self.js_first(value);
                self.offset(value_first, 1, Some(then_token));
                let close = if value.is_none() {
                    self.after(Some(then_token))
                } else {
                    self.js_after(value)
                };
                self.offset(close, 0, open);
                region = self.region_end(then, close);
            } else {
                then_open = region.and_then(|r| self.tokens().after_offset(r));
                self.offset(then_open, 0, open);
            }
        }
        if catch.present().is_some() {
            if let Some(catch_token) = inline_catch {
                self.offset(Some(catch_token), 1, open);
                let error_first = self.js_first(error);
                self.offset(error_first, 1, Some(catch_token));
                let close = if error.is_none() {
                    self.after(Some(catch_token))
                } else {
                    self.js_after(error)
                };
                self.offset(close, 0, open);
            } else {
                let from = if then.present().is_some() && then_open.is_some() {
                    let close = self.branch_close(then_open, value);
                    self.region_end(then, close)
                } else {
                    region
                };
                catch_open = from.and_then(|r| self.tokens().after_offset(r));
                self.offset(catch_open, 0, open);
            }
        }
        self.closing(span, open);
        self.visit_js(expression);
        if let Some(pending) = pending.present() {
            self.block_children(pending, open);
            self.visit_children(pending);
        }
        if let Some(then) = then.present() {
            if inline_then.is_some() {
                self.block_children(then, open);
                self.visit_js(value);
            } else {
                self.branch(then_open, value, then);
            }
            self.visit_children(then);
        }
        if let Some(catch) = catch.present() {
            if inline_catch.is_some() {
                self.block_children(catch, open);
                self.visit_js(error);
            } else {
                self.branch(catch_open, error, catch);
            }
            self.visit_children(catch);
        }
    }

    /// The `}` that ends `{:then value}` or `{:catch error}`.
    fn branch_close(&self, branch_open: Option<Token>, binding: NodeIdentifier) -> Option<Token> {
        let (_, keyword) = self.head(branch_open);
        if binding.is_none() {
            self.after(keyword)
        } else {
            self.js_after(binding)
        }
    }

    /// `{:then value}` and `{:catch error}` with their children.
    fn branch(&mut self, branch_open: Option<Token>, binding: NodeIdentifier, range: Range) {
        let (open, keyword) = self.head(branch_open);
        self.offset(keyword, 1, open);
        let binding_first = self.js_first(binding);
        self.offset(binding_first, 1, keyword);
        let close = self.branch_close(branch_open, binding);
        self.offset(close, 0, open);
        self.block_children(range, open);
        self.visit_js(binding);
    }
}
