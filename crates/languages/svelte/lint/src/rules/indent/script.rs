//! How JavaScript constructs lay out their tokens.

use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte::syntax::syntax_tree::TokenType;
use rsvelte_typescript::lexer::T;
use rsvelte_typescript::syntax_tree::{Class, Control, TypeScriptKind};
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};

use super::layout::{Item, Layout, Token};

pub(super) struct Script<'s, 'a> {
    pub layout: &'s mut Layout<'a>,
    pub javascript: &'a SyntaxTree,
    pub parents: &'a [NodeIdentifier],
    /// By node, where its type annotation (or `?`) ends, which `ESTree` puts inside the binding.
    pub annotations: Vec<(NodeIdentifier, u32)>,
}

/// [`Script::annotations`] of a tree.
pub(super) fn annotations(javascript: &SyntaxTree) -> Vec<(NodeIdentifier, u32)> {
    let mut out: Vec<(NodeIdentifier, u32)> = javascript
        .typescript
        .iter()
        .filter(|t| {
            matches!(
                t.kind,
                TypeScriptKind::Annotation | TypeScriptKind::Optional
            )
        })
        .map(|t| (t.node, t.span.end_offset))
        .collect();
    out.sort_unstable();
    out
}

fn opt(node: NodeIdentifier) -> Option<NodeIdentifier> {
    node.opt()
}

impl Script<'_, '_> {
    fn parent(&self, node: NodeIdentifier) -> Option<NodeIdentifier> {
        self.parents.get(node.index()).copied().and_then(opt)
    }

    /// The node's range as `ESTree` has it.
    pub(super) fn span(&self, node: NodeIdentifier) -> Option<Span> {
        let js = self.javascript;
        let span = js.source_location(node).span()?;
        if matches!(js.kind(node), Kind::Hole) {
            return None;
        }
        let tokens = &self.layout.tokens;
        match js.kind(node) {
            // A method's function starts at its parameters.
            Kind::Function {
                declaration: false, ..
            } if self.is_method_value(node) => {
                let key = self.method_key(node)?;
                let key_end = js.source_location(key).span()?.end_offset;
                let paren = tokens.after_matching(key_end, |t| tokens.is(t, T::LParen))?;
                Some(Span::new(tokens.span(paren).start_offset, span.end_offset))
            }
            // A declaration statement ends with its semicolon.
            Kind::VariableDeclaration { .. }
                if !self.parent(node).is_some_and(|p| {
                    matches!(
                        js.kind(p),
                        Kind::For { .. } | Kind::Control(Control::ForEach { .. })
                    )
                }) =>
            {
                let end = tokens
                    .after_offset(span.end_offset)
                    .filter(|&t| tokens.is(t, T::Semi))
                    .map_or(span.end_offset, |t| tokens.span(t).end_offset);
                Some(Span::new(span.start_offset, end))
            }
            _ => {
                let i = self.annotations.partition_point(|&(n, _)| n <= node);
                let end = match i.checked_sub(1).map(|i| self.annotations[i]) {
                    Some((n, end)) if n == node => end.max(span.end_offset),
                    _ => span.end_offset,
                };
                Some(Span::new(span.start_offset, end))
            }
        }
    }

    fn method_key(&self, function: NodeIdentifier) -> Option<NodeIdentifier> {
        match self.javascript.kind(self.parent(function)?) {
            Kind::Class(Class::Method { key, .. }) | Kind::Property { key, .. } => Some(key),
            _ => None,
        }
    }

    fn is_method_value(&self, function: NodeIdentifier) -> bool {
        self.parent(function)
            .is_some_and(|p| match self.javascript.kind(p) {
                Kind::Class(Class::Method { function: f, .. }) => f == function,
                Kind::Property {
                    value,
                    method,
                    getter,
                    setter,
                    ..
                } => value == function && (method || getter || setter),
                _ => false,
            })
    }

    fn node(&self, node: NodeIdentifier) -> Option<Item> {
        self.span(node).map(Item::Node)
    }

    fn first(&self, node: NodeIdentifier) -> Option<Token> {
        self.layout.tokens.first(self.span(node)?)
    }

    fn last(&self, node: NodeIdentifier) -> Option<Token> {
        self.layout.tokens.last(self.span(node)?)
    }

    /// `getFirstAndLastTokens(node)`.
    fn outer(&self, node: NodeIdentifier) -> Option<(Token, Token)> {
        self.layout.tokens.outer(self.span(node)?, 0)
    }

    fn before_node(&self, node: NodeIdentifier) -> Option<Token> {
        self.layout
            .tokens
            .before_offset(self.span(node)?.start_offset)
    }

    fn after_node(&self, node: NodeIdentifier) -> Option<Token> {
        self.layout.tokens.after_offset(self.span(node)?.end_offset)
    }

    fn after_node_matching(
        &self,
        node: NodeIdentifier,
        f: impl Fn(Token) -> bool,
    ) -> Option<Token> {
        let tokens = &self.layout.tokens;
        tokens.after_matching(self.span(node)?.end_offset, f)
    }

    fn before_node_matching(
        &self,
        node: NodeIdentifier,
        f: impl Fn(Token) -> bool,
    ) -> Option<Token> {
        let tokens = &self.layout.tokens;
        tokens.before_matching(self.span(node)?.start_offset, f)
    }

    fn is(&self, token: Option<Token>, kind: T) -> bool {
        token.is_some_and(|t| self.layout.tokens.is(t, kind))
    }

    fn text(&self, token: Token) -> &str {
        self.layout.tokens.text(token)
    }

    fn items(&self, nodes: &[NodeIdentifier]) -> Vec<Option<Item>> {
        nodes.iter().map(|&n| self.node(n)).collect()
    }

    /// Lays out `node` and everything below it, parents before children as `ESLint` visits them.
    pub(super) fn visit(&mut self, node: NodeIdentifier) {
        if node.is_none() || self.span(node).is_none() {
            return;
        }
        if matches!(
            self.javascript.kind(node),
            Kind::TypeScriptDeclaration
                | Kind::TypeScriptInterface { .. }
                | Kind::TypeScriptPropertySignature { .. }
        ) {
            if let Some(span) = self.span(node) {
                self.layout.ignore(span);
            }
            return;
        }
        if self.is_statement(node) {
            self.semicolon(node);
        }
        if self.is_expression(node) {
            self.parentheses(node);
        }
        self.lay_out(node);
        let mut children = Vec::new();
        self.children(node, &mut children);
        for child in children {
            self.visit(child);
        }
    }

    /// Children in visiting order; a static block's body is its statements.
    fn children(&self, node: NodeIdentifier, out: &mut Vec<NodeIdentifier>) {
        let js = self.javascript;
        match js.kind(node) {
            Kind::Class(Class::StaticBlock(body)) => {
                if let Kind::Block(statements) = js.kind(body) {
                    out.extend_from_slice(statements);
                }
            }
            Kind::Class(Class::Method { key, function, .. }) => {
                out.push(key);
                out.push(function);
            }
            Kind::Class(Class::Field { key, value, .. }) => {
                out.push(key);
                out.extend(value);
            }
            _ => js.for_each_child(node, |c| out.push(c)),
        }
    }

    fn is_statement(&self, node: NodeIdentifier) -> bool {
        match self.javascript.kind(node) {
            Kind::VariableDeclaration { .. } => self.parent(node).is_none_or(|p| {
                !matches!(
                    self.javascript.kind(p),
                    Kind::For { .. } | Kind::Control(Control::ForEach { .. })
                )
            }),
            Kind::Function { declaration, .. }
            | Kind::Class(Class::Definition { declaration, .. }) => declaration,
            Kind::Control(control) => !matches!(
                control,
                Control::Catch { .. } | Control::Case { .. } | Control::ExportSpecifier { .. }
            ),
            Kind::Class(Class::Field { .. })
            | Kind::ExpressionStatement(_)
            | Kind::Return(_)
            | Kind::If { .. }
            | Kind::For { .. }
            | Kind::Block(_)
            | Kind::Empty
            | Kind::Import { .. }
            | Kind::ExportNamed(_)
            | Kind::ExportDefault(_) => true,
            _ => false,
        }
    }

    fn is_expression(&self, node: NodeIdentifier) -> bool {
        match self.javascript.kind(node) {
            Kind::Identifier(_) => !self
                .parent(node)
                .is_some_and(|p| matches!(self.javascript.kind(p), Kind::MetaProperty { .. })),
            Kind::Function { declaration, .. }
            | Kind::Class(Class::Definition { declaration, .. }) => !declaration,
            Kind::Number(_)
            | Kind::String
            | Kind::Regex { .. }
            | Kind::Boolean(_)
            | Kind::Null
            | Kind::BigInt
            | Kind::This
            | Kind::Template { .. }
            | Kind::Array(_)
            | Kind::Object(_)
            | Kind::Member { .. }
            | Kind::Call { .. }
            | Kind::New { .. }
            | Kind::Arrow { .. }
            | Kind::Unary(..)
            | Kind::Update { .. }
            | Kind::Binary(..)
            | Kind::Logical(..)
            | Kind::Conditional { .. }
            | Kind::Assign(..)
            | Kind::Sequence(_)
            | Kind::Await(_)
            | Kind::Yield { .. }
            | Kind::ImportExpression { .. }
            | Kind::MetaProperty { .. } => true,
            _ => false,
        }
    }

    /// `:statement`: a semicolon that ends its line stays with the statement's first token.
    fn semicolon(&mut self, node: NodeIdentifier) {
        let (Some(first), Some(last)) = (self.first(node), self.last(node)) else {
            return;
        };
        let tokens = &self.layout.tokens;
        if tokens.is(last, T::Semi) && first != last {
            let line = |t: Token| tokens.line(tokens.span(t).start_offset);
            if tokens
                .after(last)
                .is_none_or(|next| line(last) < line(next))
            {
                self.layout.offset(Some(last), 0, Some(first));
            }
        }
    }

    /// `:expression`: parentheses around an expression.
    fn parentheses(&mut self, node: NodeIdentifier) {
        let (Some(mut first), Some(mut left), Some(mut right)) = (
            self.first(node),
            self.before_node(node),
            self.after_node(node),
        ) else {
            return;
        };
        loop {
            let tokens = &self.layout.tokens;
            if !(tokens.is(left, T::LParen) && tokens.is(right, T::RParen)) {
                return;
            }
            self.layout.offset(Some(first), 1, Some(left));
            self.layout.offset(Some(right), 0, Some(left));
            first = left;
            let tokens = &self.layout.tokens;
            match (tokens.before(left), tokens.after(right)) {
                (Some(l), Some(r)) => (left, right) = (l, r),
                _ => return,
            }
        }
    }

    /// The body's first token: a block stays at `base`, a statement is indented.
    fn body(&mut self, body: NodeIdentifier, base: Option<Token>) {
        let first = self.first(body);
        let offset = u32::from(!self.is(first, T::LBrace));
        self.layout.offset(first, offset, base);
    }

    #[expect(clippy::too_many_lines, reason = "one arm per construct")]
    fn lay_out(&mut self, node: NodeIdentifier) {
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
    fn list_from(
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
    fn closing(&self, last: Option<NodeIdentifier>, from: Option<Token>, kind: T) -> Option<Token> {
        let tokens = &self.layout.tokens;
        let start = match last {
            Some(n) => self.span(n)?.end_offset,
            None => tokens.span(from?).end_offset,
        };
        tokens.after_matching(start, |t| tokens.is(t, kind))
    }

    fn dot(&mut self, first: Option<Token>, property: NodeIdentifier) {
        let dot = self.before_node(property);
        let property_token = dot.and_then(|d| self.layout.tokens.after(d));
        self.layout.offset(dot, 1, first);
        self.layout.offset(property_token, 1, first);
    }

    /// Operators of a chain of binary, logical and assignment expressions: indented from the
    /// chain's first operand.
    fn chain(&mut self, node: NodeIdentifier, left: NodeIdentifier, right: NodeIdentifier) {
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
    fn member(
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

    fn function(
        &mut self,
        node: NodeIdentifier,
        name: Option<NodeIdentifier>,
        parameters: &[NodeIdentifier],
        body: NodeIdentifier,
        first: Option<Token>,
    ) {
        let tokens = &self.layout.tokens;
        let is_paren = |t: Token| tokens.is(t, T::LParen);
        let left = match parameters.first() {
            Some(&p) => self.before_node_matching(p, is_paren),
            None => self
                .before_node(body)
                .and_then(|b| tokens.before_matching(tokens.span(b).start_offset, is_paren)),
        };
        let Some(f) = first else {
            return;
        };
        let body_base = if tokens.is_punctuator(f) {
            self.parent(node).and_then(|p| self.first(p))
        } else {
            let name_start = name.and_then(|n| self.span(n)).map(|s| s.start_offset);
            let mut offset = 0;
            let between: Vec<Token> = left
                .map(|l| tokens.between(f, l).collect())
                .unwrap_or_default();
            for t in between {
                let tokens = &self.layout.tokens;
                if tokens.text(t) == "<" {
                    break;
                }
                if tokens.text(t) == "*" || Some(tokens.span(t).start_offset) == name_start {
                    offset = 1;
                }
                self.layout.offset(Some(t), offset, first);
            }
            first
        };
        let right = self.closing(parameters.last().copied(), left, T::RParen);
        self.layout.offset(left, 1, body_base);
        self.list_from(left, &self.items(parameters), right, 1);
        let body_token = self.first(body);
        self.layout.offset(body_token, 0, body_base);
    }

    fn import(
        &mut self,
        node: NodeIdentifier,
        specifiers: &[NodeIdentifier],
        source: NodeIdentifier,
        first: Option<Token>,
    ) {
        let js = self.javascript;
        let (Some(import), Some(source_token)) = (first, self.first(source)) else {
            return;
        };
        let tokens = &self.layout.tokens;
        let between: Vec<Token> = tokens.between(import, source_token).collect();
        let from = between.iter().rposition(|&t| tokens.text(t) == "from");
        // Without `from`, the source counts as a token before it.
        let split = from.unwrap_or(between.len());
        let from_token = from.map(|i| between[i]);
        let mut before: Vec<Token> = between[..split].to_vec();
        let after: Vec<Token> = if from.is_some() {
            between[split + 1..]
                .iter()
                .copied()
                .chain([source_token])
                .collect()
        } else {
            before.push(source_token);
            Vec::new()
        };
        let mut named = Vec::new();
        for &specifier in specifiers {
            if matches!(js.kind(specifier), Kind::ImportNamed { .. }) {
                named.push(specifier);
            } else if let Some(span) = self.span(specifier) {
                let remove: Vec<Token> = tokens.within(span).skip(1).collect();
                before.retain(|t| !remove.contains(t));
            }
        }
        if let (Some(&first_named), Some(&last_named)) = (named.first(), named.last()) {
            let left = self.before_node(first_named);
            let right = self.after_node_matching(last_named, |t| tokens.is(t, T::RBrace));
            if let (Some(l), Some(r)) = (left, right) {
                before.retain(|&t| !(t > l && t <= r));
            }
            self.list_from(left, &self.items(&named), right, 1);
        }
        let tokens = &self.layout.tokens;
        let braces = before
            .iter()
            .all(|&t| tokens.is(t, T::LBrace) || tokens.is(t, T::RBrace));
        self.layout.offset_all(before, u32::from(!braces), first);
        if from_token.is_some() {
            self.layout.offset(from_token, 0, first);
            self.layout.offset_all(after, 1, from_token);
        }
        self.attributes(node, source, first);
    }

    /// `with { … }` after a module source.
    fn attributes(&mut self, node: NodeIdentifier, source: NodeIdentifier, first: Option<Token>) {
        let tokens = &self.layout.tokens;
        let Some(span) = self.span(node) else {
            return;
        };
        let (Some(last), Some(source_last)) = (
            tokens.last_matching(span, |t| !tokens.is(t, T::Semi)),
            self.last(source),
        ) else {
            return;
        };
        let mut assertion: Vec<Token> = tokens.between(source_last, last).collect();
        if assertion.is_empty() {
            return;
        }
        let keyword = assertion.remove(0);
        self.layout.offset(Some(keyword), 0, first);
        if !assertion.is_empty() {
            let open = assertion.remove(0);
            self.layout.offset(Some(open), 1, Some(keyword));
            let items: Vec<Option<Item>> =
                assertion.iter().map(|&t| Some(Item::Token(t))).collect();
            self.list_from(Some(open), &items, Some(last), 1);
        }
    }

    /// `ImportSpecifier` and `ExportSpecifier`.
    fn specifier(&mut self, node: NodeIdentifier) {
        let Some(span) = self.span(node) else {
            return;
        };
        let mut tokens: Vec<Token> = self.layout.tokens.within(span).collect();
        if tokens.is_empty() {
            return;
        }
        let mut first = tokens.remove(0);
        if self.text(first) == "type" && !tokens.is_empty() {
            let type_token = first;
            first = tokens.remove(0);
            self.layout.offset(Some(first), 0, Some(type_token));
        }
        self.layout.offset_all(tokens, 1, Some(first));
    }

    #[expect(clippy::too_many_lines, reason = "one arm per statement")]
    fn control(&mut self, node: NodeIdentifier, control: Control<'_>, first: Option<Token>) {
        let tokens = &self.layout.tokens;
        match control {
            Control::Try {
                block,
                handler,
                finalizer,
            } => {
                let block_token = self.first(block);
                self.layout.offset(block_token, 0, first);
                if let Some(handler) = handler {
                    let catch = self.first(handler);
                    self.layout.offset(catch, 0, first);
                }
                if let Some(finalizer) = finalizer {
                    let finally = self.before_node(finalizer);
                    let finally_block = self.first(finalizer);
                    self.layout.offset(finally, 0, first);
                    self.layout.offset(finally_block, 0, first);
                }
            }
            Control::Catch { parameter, body } => {
                if let Some(parameter) = parameter {
                    let left = self.before_node(parameter);
                    let right = self.after_node(parameter);
                    self.layout.offset(left, 1, first);
                    self.list_from(left, &[self.node(parameter)], right, 1);
                }
                let body_token = self.first(body);
                self.layout.offset(body_token, 0, first);
            }
            Control::While { test, body, is_do } => {
                if is_do {
                    let while_token = self.after_node_matching(body, |t| !tokens.is(t, T::RParen));
                    let left = while_token.and_then(|w| tokens.after(w));
                    let right = self.after_node(test);
                    self.body(body, first);
                    self.layout.offset(while_token, 0, first);
                    self.layout.offset(left, 1, while_token);
                    self.list_from(left, &[self.node(test)], right, 1);
                } else {
                    let left = first.and_then(|f| tokens.after(f));
                    let right = self.before_node_matching(body, |t| tokens.is(t, T::RParen));
                    self.layout.offset(left, 1, first);
                    self.layout.offset(right, 0, left);
                    self.body(body, first);
                }
            }
            Control::ForEach {
                left: binding,
                body,
                is_await,
                ..
            } => {
                let await_token = if is_await {
                    first.and_then(|f| tokens.after(f))
                } else {
                    None
                };
                let left = await_token.or(first).and_then(|t| tokens.after(t));
                let left_token = self.first(binding);
                let in_or_of = self.after_node_matching(binding, |t| !tokens.is(t, T::RParen));
                let right_token = in_or_of.and_then(|t| tokens.after(t));
                let right = self.before_node_matching(body, |t| !tokens.is(t, T::LParen));
                self.layout.offset(await_token, 0, first);
                self.layout.offset(left, 1, first);
                self.layout.offset(left_token, 1, left);
                self.layout.offset(in_or_of, 1, left_token);
                self.layout.offset(right_token, 1, left_token);
                self.layout.offset(right, 0, left);
                self.body(body, first);
            }
            Control::Switch {
                discriminant,
                cases,
            } => {
                let parens = self.outer(discriminant);
                let left = parens.map(|(l, _)| l);
                let right = parens.map(|(_, r)| r);
                let left_brace = right.and_then(|r| tokens.after(r));
                let right_brace = self.last(node);
                self.layout.offset(left, 1, first);
                self.list_from(left, &[self.node(discriminant)], right, 1);
                self.layout.offset(left_brace, 0, first);
                let offset = self.layout.options.switch_case;
                self.list_from(left_brace, &self.items(cases), right_brace, offset);
            }
            Control::Case { test, consequent } => {
                if let Some(test) = test {
                    let test_tokens = self.outer(test);
                    let colon = test_tokens.and_then(|(_, l)| tokens.after(l));
                    self.layout.offset(test_tokens.map(|(f, _)| f), 1, first);
                    self.layout.offset(colon, 1, first);
                } else {
                    let colon = first.and_then(|f| tokens.after(f));
                    self.layout.offset(colon, 1, first);
                }
                if let [only] = consequent
                    && matches!(self.javascript.kind(*only), Kind::Block(_))
                {
                    let block = self.first(*only);
                    self.layout.offset(block, 0, first);
                } else {
                    for &statement in consequent {
                        let token = self.outer(statement).map(|(f, _)| f);
                        self.layout.offset(token, 1, first);
                    }
                }
            }
            Control::Jump { label: Some(_), .. } => {
                let next = first.and_then(|f| tokens.after(f));
                self.layout.offset(next, 1, first);
            }
            Control::Labeled { .. } => {
                let colon = first.and_then(|f| tokens.after(f));
                let body = colon.and_then(|c| tokens.after(c));
                self.layout.offset(colon, 1, first);
                self.layout.offset(body, 1, first);
            }
            Control::ExportList { specifiers, source } => {
                let Some(export) = first else {
                    return;
                };
                let left_braces: Vec<Token> =
                    specifiers.first().and_then(|&s| self.first(s)).map_or_else(
                        || tokens.after(export).into_iter().collect(),
                        |s| tokens.between(export, s).collect(),
                    );
                let is_close = |t: Token| tokens.is(t, T::RBrace);
                let right_brace = source.map_or_else(
                    || {
                        self.span(node)
                            .and_then(|s| tokens.last_matching(s, is_close))
                    },
                    |source| self.before_node_matching(source, is_close),
                );
                let base = left_braces.last().copied();
                self.layout.offset_all(left_braces, 0, first);
                self.list_from(base, &self.items(specifiers), right_brace, 1);
                if let (Some(source), Some(right_brace)) = (source, right_brace) {
                    let tokens = &self.layout.tokens;
                    let Some(source_token) = self.first(source) else {
                        return;
                    };
                    let mut between: Vec<Token> =
                        tokens.between(right_brace, source_token).collect();
                    if between.is_empty() {
                        return;
                    }
                    let from = between.remove(0);
                    between.push(source_token);
                    self.layout.offset(Some(from), 0, first);
                    self.layout.offset_all(between, 1, Some(from));
                    self.attributes(node, source, first);
                }
            }
            Control::ExportSpecifier { .. } => self.specifier(node),
            Control::ExportAll { source, exported } => {
                let (Some(export), Some(source_token)) = (first, self.first(source)) else {
                    return;
                };
                let between: Vec<Token> = tokens.between(export, source_token).collect();
                let Some(from_index) = between.iter().position(|&t| tokens.text(t) == "from")
                else {
                    return;
                };
                let from = between[from_index];
                let before = &between[..from_index];
                let after: Vec<Token> = between[from_index + 1..]
                    .iter()
                    .copied()
                    .chain([source_token])
                    .collect();
                if exported.is_none() {
                    self.layout.offset_all(before.to_vec(), 1, first);
                } else if let Some(as_index) = before.iter().position(|&t| tokens.text(t) == "as") {
                    self.layout
                        .offset_all(before[..as_index].to_vec(), 1, first);
                    let base = as_index.checked_sub(1).map(|i| before[i]);
                    self.layout.offset_all(before[as_index..].to_vec(), 1, base);
                }
                self.layout.offset(Some(from), 0, first);
                self.layout.offset_all(after, 1, Some(from));
                self.attributes(node, source, first);
            }
            Control::Throw(_) => {
                let next = first.and_then(|f| tokens.after(f));
                self.layout.offset(next, 1, first);
            }
            Control::Jump { .. } | Control::Debugger => {}
        }
    }
}
