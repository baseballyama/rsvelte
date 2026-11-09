//! How JavaScript constructs lay out their tokens.

use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript::lexer::T;
use rsvelte_typescript::syntax_tree::{Class, Control, TypeScriptKind};
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};

use super::layout::{Item, Layout};
use super::tokens::Token;

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
            | Kind::TaggedTemplate { .. }
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
}

mod forms;
mod kinds;
