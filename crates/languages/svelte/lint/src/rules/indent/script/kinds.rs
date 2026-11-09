//! What each kind of JavaScript node offsets.

use rsvelte_svelte::syntax::syntax_tree::TokenType;
use rsvelte_typescript::lexer::T;
use rsvelte_typescript::syntax_tree::Class;
use rsvelte_typescript::{Kind, NodeIdentifier};

use super::Script;
use crate::rules::indent::layout::Item;
use crate::rules::indent::tokens::Token;

impl Script<'_, '_> {
    #[expect(clippy::too_many_lines, reason = "one arm per construct")]
    pub(super) fn lay_out(&mut self, node: NodeIdentifier) {
        let js = self.javascript;
        let first = self.first(node);
        match js.kind(node) {
            Kind::Array(elements) | Kind::ArrayPattern(elements) => {
                let start = elements
                    .last()
                    .and_then(|&e| self.span(e))
                    .map(|s| s.end_offset)
                    .or_else(|| first.map(|f| self.layout.tokens.span(f).end_offset));
                let right = start.and_then(|s| {
                    let tokens = &self.layout.tokens;
                    tokens.after_matching(s, |t| tokens.is(t, T::RBracket))
                });
                self.list_from(first, &self.items(elements), right, 1);
            }
            Kind::Object(properties) | Kind::ObjectPattern(properties) => {
                let start = properties
                    .last()
                    .and_then(|&e| self.span(e))
                    .map(|s| s.end_offset)
                    .or_else(|| first.map(|f| self.layout.tokens.span(f).end_offset));
                let right = start.and_then(|s| {
                    let tokens = &self.layout.tokens;
                    tokens.after_matching(s, |t| tokens.is(t, T::RBrace))
                });
                self.list_from(first, &self.items(properties), right, 1);
            }
            Kind::Arrow {
                parameters,
                body,
                is_async,
                ..
            } => {
                let second = first.and_then(|f| self.layout.tokens.after(f));
                let left = if is_async { second } else { first };
                let arrow = self.before_node_matching(body, |t| self.layout.tokens.is(t, T::Arrow));
                if is_async {
                    self.layout.offset(second, 1, first);
                }
                if self.is(left, T::LParen) {
                    let right = self.closing(parameters.last().copied(), left, T::RParen);
                    self.list_from(left, &self.items(parameters), right, 1);
                }
                self.layout.offset(arrow, 1, first);
                self.body(body, first);
            }
            Kind::Assign(_, left, right)
            | Kind::AssignPattern(left, right)
            | Kind::Binary(_, left, right)
            | Kind::Logical(_, left, right) => {
                self.chain(node, left, right);
            }
            Kind::Await(_)
            | Kind::Rest(_)
            | Kind::Spread(_)
            | Kind::Unary(..)
            | Kind::Update { .. } => {
                let next = first.and_then(|f| self.layout.tokens.after(f));
                self.layout.offset(next, 1, first);
            }
            Kind::Block(statements) | Kind::Program(statements) => {
                if let Some(span) = self.span(node) {
                    self.layout.list(
                        &self.items(statements),
                        Item::Node(span),
                        self.last(node).map(Item::Token),
                        1,
                        false,
                    );
                }
            }
            Kind::Call {
                callee, arguments, ..
            } => {
                let tokens = &self.layout.tokens;
                let left = self.after_node_matching(callee, |t| tokens.is(t, T::LParen));
                let right = self.last(node);
                if let (Some(callee_last), Some(l)) = (self.last(callee), left) {
                    let optional: Vec<Token> = tokens
                        .between(callee_last, l)
                        .filter(|&t| tokens.is(t, T::QuestionDot))
                        .collect();
                    self.layout.offset_all(optional, 1, first);
                }
                self.layout.offset(left, 1, first);
                self.list_from(left, &self.items(arguments), right, 1);
            }
            Kind::Class(Class::Definition {
                name,
                superclass,
                members,
                ..
            }) => {
                if let Some(name) = name {
                    let id = self.first(name);
                    self.layout.offset(id, 1, first);
                }
                if let Some(superclass) = superclass {
                    let extends = self.before_node(superclass);
                    let super_token = extends.and_then(|e| self.layout.tokens.after(e));
                    self.layout.offset(extends, 1, first);
                    self.layout.offset(super_token, 1, extends);
                }
                let after = superclass.or(name);
                let tokens = &self.layout.tokens;
                let from = after
                    .and_then(|n| self.span(n))
                    .map(|s| s.end_offset)
                    .or_else(|| first.map(|f| tokens.span(f).end_offset));
                let open = from.and_then(|f| tokens.after_matching(f, |t| tokens.is(t, T::LBrace)));
                self.layout.offset(open, 0, first);
                let close = self.last(node);
                self.list_from(open, &self.items(members), close, 1);
            }
            Kind::Class(Class::Method {
                key,
                function,
                computed,
                ..
            }) => {
                self.member(node, key, Some(function), computed);
            }
            Kind::Class(Class::Field {
                key,
                value,
                computed,
                ..
            }) => self.member(node, key, value, computed),
            Kind::Property {
                key,
                value,
                computed,
                ..
            } => self.member(node, key, Some(value), computed),
            Kind::Class(Class::StaticBlock(body)) => {
                let mut next = first.and_then(|f| self.layout.tokens.after(f));
                while let Some(t) = next.filter(|&t| !self.layout.tokens.is(t, T::LBrace)) {
                    self.layout.offset(Some(t), 0, first);
                    next = self.layout.tokens.after(t);
                }
                self.layout.offset(next, 0, first);
                let statements = match js.kind(body) {
                    Kind::Block(statements) => statements,
                    _ => &[],
                };
                let close = self.last(node);
                self.list_from(next, &self.items(statements), close, 1);
            }
            Kind::Conditional {
                test, consequent, ..
            } => {
                let tokens = &self.layout.tokens;
                let question = self.after_node_matching(test, |t| !tokens.is(t, T::RParen));
                let consequent_token = question.and_then(|q| tokens.after(q));
                let colon = self.after_node_matching(consequent, |t| !tokens.is(t, T::RParen));
                let alternate_token = colon.and_then(|c| tokens.after(c));
                let mut base = node;
                while let Some(parent) = self.parent(base) {
                    match js.kind(parent) {
                        Kind::Conditional { alternate, .. } if alternate == base => base = parent,
                        _ => break,
                    }
                }
                let base = self.first(base);
                self.layout.offset(question, 1, base);
                self.layout.offset(colon, 1, base);
                self.layout.offset(consequent_token, 1, question);
                self.layout.offset(alternate_token, 1, colon);
            }
            Kind::Control(control) => self.control(node, control, first),
            Kind::ExportDefault(declaration) => {
                let declaration_token = self.outer(declaration).map(|(f, _)| f);
                if let (Some(f), Some(d)) = (first, declaration_token) {
                    let tokens: Vec<Token> = self.layout.tokens.between(f, d).collect();
                    self.layout.offset_all(tokens, 1, first);
                }
                self.layout.offset(declaration_token, 1, first);
            }
            Kind::ExportNamed(declaration) => {
                let declaration_token = self.first(declaration);
                self.layout.offset(declaration_token, 1, first);
            }
            Kind::For {
                initializer,
                test,
                update,
                body,
            } => {
                let tokens = &self.layout.tokens;
                let left = first.and_then(|f| tokens.after(f));
                let right = self.before_node_matching(body, |t| !tokens.is(t, T::LParen));
                self.layout.offset(left, 1, first);
                let items = [initializer, test, update].map(|n| n.and_then(|n| self.node(n)));
                self.list_from(left, &items, right, 1);
                self.body(body, first);
            }
            Kind::Function {
                name,
                parameters,
                body,
                ..
            } => self.function(node, name, parameters, body, first),
            Kind::If {
                consequent,
                alternate,
                ..
            } => {
                let tokens = &self.layout.tokens;
                let left = first.and_then(|f| tokens.after(f));
                let right = self.before_node_matching(consequent, |t| tokens.is(t, T::RParen));
                self.layout.offset(left, 1, first);
                self.layout.offset(right, 0, left);
                self.body(consequent, first);
                if let Some(alternate) = alternate {
                    let tokens = &self.layout.tokens;
                    let else_token =
                        self.after_node_matching(consequent, |t| !tokens.is(t, T::RParen));
                    self.layout.offset(else_token, 0, first);
                    self.body(alternate, else_token);
                }
            }
            Kind::Import {
                specifiers, source, ..
            } => self.import(node, specifiers, source, first),
            Kind::ImportNamed { .. } => self.specifier(node),
            Kind::ImportNamespace(_) => {
                if let Some(span) = self.span(node) {
                    let tokens: Vec<Token> = self.layout.tokens.within(span).skip(1).collect();
                    self.layout.offset_all(tokens, 1, first);
                }
            }
            Kind::ImportExpression { source, .. } => {
                let right = self.last(node);
                let tokens = &self.layout.tokens;
                let left = first.and_then(|f| {
                    tokens.after_matching(tokens.span(f).end_offset, |t| tokens.is(t, T::LParen))
                });
                self.layout.offset(left, 1, first);
                self.list_from(left, &[self.node(source)], right, 1);
            }
            Kind::Member {
                object,
                property,
                computed,
                ..
            } => {
                if computed {
                    let tokens = &self.layout.tokens;
                    let left = self.before_node_matching(property, |t| tokens.is(t, T::LBracket));
                    let right = self.after_node_matching(property, |t| tokens.is(t, T::RBracket));
                    if let (Some(object_last), Some(l)) = (self.last(object), left) {
                        let optional: Vec<Token> = tokens
                            .between(object_last, l)
                            .filter(|&t| tokens.is(t, T::QuestionDot))
                            .collect();
                        self.layout.offset_all(optional, 1, first);
                    }
                    self.layout.offset(left, 1, first);
                    self.list_from(left, &[self.node(property)], right, 1);
                } else {
                    self.dot(first, property);
                }
            }
            Kind::MetaProperty { property, .. } => self.dot(first, property),
            Kind::New { callee, arguments } => {
                let callee_tokens = self.outer(callee);
                let callee_first = callee_tokens.map(|(f, _)| f);
                self.layout.offset(callee_first, 1, first);
                let node_end = self.span(node).map(|s| s.end_offset);
                if let Some((_, callee_last)) = callee_tokens {
                    let tokens = &self.layout.tokens;
                    if !arguments.is_empty()
                        || node_end.is_some_and(|end| tokens.span(callee_last).end_offset < end)
                    {
                        let right = self.last(node);
                        let left = tokens.after(callee_last);
                        self.layout.offset(left, 1, callee_first);
                        self.list_from(left, &self.items(arguments), right, 1);
                    }
                }
            }
            Kind::Return(Some(_)) => {
                let next = first.and_then(|f| self.layout.tokens.after(f));
                self.layout.offset(next, 1, first);
            }
            Kind::Sequence(expressions) => {
                if let Some(f) = first {
                    self.layout
                        .list(&self.items(expressions), Item::Token(f), None, 0, false);
                }
            }
            Kind::Template { .. } => {
                let Some(span) = self.span(node) else {
                    return;
                };
                let tokens = &self.layout.tokens;
                let parts: Vec<Token> = tokens
                    .within(span)
                    .filter(|&t| {
                        matches!(tokens.kind(t), TokenType::JavaScript(T::Template { .. }))
                    })
                    .collect();
                // The expression after each part but the last.
                let expressions: Vec<Token> = parts[..parts.len().saturating_sub(1)]
                    .iter()
                    .filter_map(|&p| tokens.after(p))
                    .collect();
                self.layout
                    .offset_all(parts.iter().skip(1).copied(), 0, first);
                self.layout.offset_all(expressions, 1, first);
            }
            Kind::TaggedTemplate { tag, quasi } => {
                let tag = self.outer(tag).map(|(f, _)| f);
                let quasi = self.first(quasi);
                self.layout.offset(quasi, 1, tag);
            }
            Kind::VariableDeclaration { declarations, .. } => {
                if let Some(f) = first {
                    self.layout
                        .list(&self.items(declarations), Item::Token(f), None, 1, false);
                }
            }
            Kind::Declarator {
                identifier,
                initializer: Some(_),
            } => {
                let eq = self.after_node(identifier);
                let init = eq.and_then(|e| self.layout.tokens.after(e));
                self.layout.offset(eq, 1, first);
                self.layout.offset(init, 1, first);
            }
            Kind::Yield {
                argument: Some(_),
                delegate,
            } => {
                let second = first.and_then(|f| self.layout.tokens.after(f));
                self.layout.offset(second, 1, first);
                if delegate {
                    let third = second.and_then(|s| self.layout.tokens.after(s));
                    self.layout.offset(third, 1, first);
                }
            }
            _ => {}
        }
    }

    /// `setOffsetElementList` from a token.
    pub(super) fn list_from(
        &mut self,
        base: Option<Token>,
        items: &[Option<Item>],
        last: Option<Token>,
        offset: u32,
    ) {
        if let Some(base) = base {
            self.layout.list(
                items,
                Item::Token(base),
                last.map(Item::Token),
                offset,
                false,
            );
        }
    }

    /// The `kind` token after the last of `nodes`, or after `from` when there is none.
    pub(super) fn closing(
        &self,
        last: Option<NodeIdentifier>,
        from: Option<Token>,
        kind: T,
    ) -> Option<Token> {
        let tokens = &self.layout.tokens;
        let start = match last {
            Some(n) => self.span(n)?.end_offset,
            None => tokens.span(from?).end_offset,
        };
        tokens.after_matching(start, |t| tokens.is(t, kind))
    }

    pub(super) fn dot(&mut self, first: Option<Token>, property: NodeIdentifier) {
        let dot = self.before_node(property);
        let property_token = dot.and_then(|d| self.layout.tokens.after(d));
        self.layout.offset(dot, 1, first);
        self.layout.offset(property_token, 1, first);
    }

    /// Operators of a chain of binary, logical and assignment expressions: indented from the
    /// chain's first operand.
    pub(super) fn chain(
        &mut self,
        node: NodeIdentifier,
        left: NodeIdentifier,
        right: NodeIdentifier,
    ) {
        let js = self.javascript;
        let mut head = node;
        while let Some(parent) = self.parent(head) {
            if !matches!(
                js.kind(parent),
                Kind::Assign(..) | Kind::AssignPattern(..) | Kind::Binary(..) | Kind::Logical(..)
            ) {
                break;
            }
            let (before, after) = (self.before_node(head), self.after_node(head));
            if self.is(before, T::LParen) && self.is(after, T::RParen) {
                break;
            }
            head = parent;
        }
        let tokens = &self.layout.tokens;
        let operator = self.after_node_matching(left, |t| !tokens.is(t, T::RParen));
        let base = if matches!(js.kind(head), Kind::Assign(..) | Kind::AssignPattern(..)) {
            self.first(head)
        } else {
            self.outer(head).map(|(f, _)| f)
        };
        let left_token = self.outer(left).map(|(f, _)| f);
        let right_token = self.outer(right).map(|(f, _)| f);
        if left_token != base {
            self.layout.offset(left_token, 1, base);
        }
        self.layout.offset(operator, 1, base);
        self.layout.offset(right_token, 1, base);
    }

    /// A property, method or field: modifiers and key at the start, the value after the key.
    pub(super) fn member(
        &mut self,
        node: NodeIdentifier,
        key: NodeIdentifier,
        value: Option<NodeIdentifier>,
        computed: bool,
    ) {
        let first = self.first(node);
        let Some((key_first, key_last)) = self.outer(key) else {
            return;
        };
        let Some(f) = first else {
            return;
        };
        let mut prefix: Vec<Token> = self.layout.tokens.between(f, key_first).collect();
        if computed {
            prefix.pop();
        }
        self.layout.offset_all(prefix, 0, first);
        let last_key = if computed {
            let left = self.layout.tokens.before(key_first);
            let right = self.layout.tokens.after(key_last);
            self.layout.offset(left, 0, first);
            self.list_from(left, &[self.node(key)], right, 1);
            right
        } else {
            self.layout.offset(Some(key_first), 0, first);
            Some(key_last)
        };
        if let (Some(value), Some(last_key)) = (value, last_key) {
            let Some(init) = self.first(value) else {
                return;
            };
            let mut tokens: Vec<Token> = self.layout.tokens.between(last_key, init).collect();
            tokens.push(init);
            self.layout.offset_all(tokens, 1, Some(last_key));
        }
    }
}
