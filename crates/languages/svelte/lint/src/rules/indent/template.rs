//! How the markup lays out its tokens: elements, attributes, blocks and tags.

use oxc_ast_visit::Visit;
use oxc_parser::Kind;
use oxc_span::{GetSpan, Span as OxcSpan};
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{
    Component, Range, Script as ScriptElement, TemplateNode, TemplateNodeIdentifier, TokenType,
};
use rsvelte_typescript_tree::{ExpressionIdentifier, PatternIdentifier, Tree};

use super::layout::Item;
use super::script::{self, Script};
use super::tokens::{Token, Tokens};

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
    const fn tokens(&self) -> &Tokens<'_> {
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

    const fn tree(&self) -> &'a Tree {
        &self.component.javascript
    }

    fn expression_span(&self, expression: ExpressionIdentifier) -> OxcSpan {
        self.tree().get_expression(expression).span()
    }

    fn pattern_span(&self, pattern: PatternIdentifier) -> OxcSpan {
        self.tree().get_pattern(pattern).span
    }

    fn javascript_first(&self, node: Option<OxcSpan>) -> Option<Token> {
        self.first(script::span(node?))
    }

    fn javascript_outer(&self, node: Option<OxcSpan>) -> Option<(Token, Token)> {
        self.tokens().outer(script::span(node?), 0)
    }

    /// The token after the node's last token.
    fn javascript_after(&self, node: Option<OxcSpan>) -> Option<Token> {
        self.tokens().after_offset(node?.end)
    }

    fn visit_expression(&mut self, expression: ExpressionIdentifier) {
        self.script
            .visit_expression(self.tree().get_expression(expression));
    }

    fn visit_pattern(&mut self, pattern: Option<PatternIdentifier>) {
        if let Some(pattern) = pattern {
            self.script
                .visit_formal_parameter(self.tree().get_pattern(pattern));
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
                Top::Style(style.span, style.content),
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
        let program = self.tree().get_program(script.program);
        let directives = program.directives.iter().map(|d| d.span);
        let items = Script::items(directives.chain(program.body.iter().map(GetSpan::span)));
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
        for directive in &program.directives {
            self.script.visit_directive(directive);
        }
        for statement in &program.body {
            self.script.visit_statement(statement);
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
        if matches!(
            tokens.kind(next),
            TokenType::DoubleQuote | TokenType::SingleQuote
        ) {
            let close = (next + 1..tokens.count())
                .take_while(|&t| {
                    tokens.kind(t) == TokenType::AttributeText
                        || matches!(
                            tokens.kind(t),
                            TokenType::DoubleQuote | TokenType::SingleQuote
                        )
                })
                .find(|&t| {
                    matches!(
                        tokens.kind(t),
                        TokenType::DoubleQuote | TokenType::SingleQuote
                    )
                });
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
        let quoted = matches!(start_kind, TokenType::DoubleQuote | TokenType::SingleQuote);
        let mustache = start_kind == TokenType::MustacheOpen;
        if quoted || mustache {
            let last = tokens.last(span);
            let closes = last.is_some_and(|l| {
                let kind = tokens.kind(l);
                l != value_start
                    && ((quoted
                        && matches!(kind, TokenType::DoubleQuote | TokenType::SingleQuote)
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
                let item = Some(Script::item(self.expression_span(expression)));
                if let Some(o) = open {
                    self.script.layout.list(
                        &[item],
                        Item::Token(o),
                        close.map(Item::Token),
                        1,
                        false,
                    );
                }
                self.visit_expression(expression);
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
                let expression_span = Some(self.expression_span(expression));
                let context_span = context.map(|p| self.pattern_span(p));
                let index_span = index.map(|p| self.pattern_span(p));
                let items =
                    [expression_span, context_span, index_span].map(|n| n.map(Script::item));
                if let Some(k) = keyword {
                    self.script
                        .layout
                        .list(&items, Item::Token(k), None, 1, false);
                }
                let tag_close = if let Some(key) = key {
                    let key_tokens = self.javascript_outer(Some(self.expression_span(key)));
                    self.offset(key_tokens.map(|(f, _)| f), 1, keyword);
                    let close = self.after(key_tokens.map(|(_, l)| l));
                    self.offset(close, 0, open);
                    close
                } else {
                    let last = index_span.or(context_span).or(expression_span);
                    let close = self.javascript_after(last);
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
                self.visit_expression(expression);
                self.visit_pattern(context);
                self.visit_pattern(index);
                if let Some(key) = key {
                    self.visit_expression(key);
                }
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
                let expression_tokens =
                    self.javascript_outer(Some(self.expression_span(expression)));
                self.offset(expression_tokens.map(|(f, _)| f), 1, keyword);
                let close = self.after(expression_tokens.map(|(_, l)| l));
                self.offset(close, 0, open);
                self.block_children(body, open);
                self.closing(span, open);
                self.visit_expression(expression);
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
                let parameters = parameters.map(|p| self.tree().get_parameters(p));
                let spans = parameters.map_or_else(Vec::new, |p| script::parameter_spans(None, p));
                let tokens = self.tokens();
                let is_left = |t: Token| tokens.is(t, Kind::LParen);
                // Upstream searches back from the block's end and can take a `(` in the body.
                let left = spans.first().map_or_else(
                    || {
                        snippet_name
                            .and_then(|n| tokens.after_matching(tokens.span(n).end_offset, is_left))
                    },
                    |p| tokens.before_matching(p.start, is_left),
                );
                let from = spans
                    .last()
                    .map(|s| s.end)
                    .or_else(|| left.map(|l| tokens.span(l).end_offset));
                let right =
                    from.and_then(|f| tokens.after_matching(f, |t| tokens.is(t, Kind::RParen)));
                self.offset(left, 1, snippet_name);
                let items = Script::items(spans);
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
                self.visit_expression(name);
                if let Some(parameters) = parameters {
                    self.script.visit_formal_parameters(parameters);
                }
                self.visit_children(body);
            }
            TemplateNode::Render { expression, .. } => {
                let (open, keyword) = self.head(open);
                self.offset(keyword, 1, open);
                let first = self.javascript_first(Some(self.expression_span(expression)));
                self.offset(first, 1, keyword);
                self.visit_expression(expression);
            }
            TemplateNode::Const { declaration, .. } => {
                let (open, keyword) = self.head(open);
                self.offset(keyword, 1, open);
                let declarators = &self.tree().get_declaration(declaration).declarations;
                let first = declarators
                    .first()
                    .and_then(|d| self.javascript_first(Some(d.span)));
                self.offset(first, 1, open);
                let close = self.tokens().last(span);
                self.offset(close, 0, open);
                for d in declarators {
                    self.script.visit_variable_declarator(d);
                }
            }
            TemplateNode::Declaration { declaration, .. } => {
                let declaration = self.tree().get_declaration(declaration);
                let first = self.javascript_first(Some(declaration.span));
                self.offset(first, 1, open);
                let close = self.tokens().last(span);
                self.offset(close, 0, open);
                self.script.visit_variable_declaration(declaration);
            }
            TemplateNode::Debug { identifiers, .. } => {
                let identifiers = component.debug_identifiers(identifiers);
                let items = Script::items(identifiers.iter().map(|&i| self.expression_span(i)));
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
                    self.visit_expression(i);
                }
            }
        }
    }
}

mod blocks;
mod elements;
