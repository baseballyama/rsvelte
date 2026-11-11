//! What each kind of JavaScript node offsets.

use oxc_ast::AstKind;
use oxc_ast::ast::{ArrayExpressionElement, BindingPattern, Expression, FormalParameter};
use oxc_parser::Kind;
use oxc_span::{GetSpan, Span as OxcSpan};

use super::{Script, annotated, parameter_spans};
use crate::rules::indent::layout::Item;
use crate::rules::indent::tokens::Token;

impl<'a> Script<'_, 'a> {
    #[expect(clippy::too_many_lines, reason = "one arm per construct")]
    pub(super) fn lay_out(&mut self, kind: AstKind<'a>) {
        let node = kind.span();
        let first = self.first(node);
        match kind {
            AstKind::ArrayExpression(n) => {
                let elements = n.elements.iter().map(|e| match e {
                    ArrayExpressionElement::Elision(_) => None,
                    e => Some(e.span()),
                });
                self.elements(first, elements, Kind::RBrack);
            }
            AstKind::ArrayPattern(n) => {
                let elements = n
                    .elements
                    .iter()
                    .map(|e| e.as_ref().map(GetSpan::span))
                    .chain(n.rest.as_ref().map(|r| Some(r.span)));
                self.elements(first, elements, Kind::RBrack);
            }
            AstKind::ArrayAssignmentTarget(n) => {
                let elements = n
                    .elements
                    .iter()
                    .map(|e| e.as_ref().map(GetSpan::span))
                    .chain(n.rest.as_ref().map(|r| Some(r.span)));
                self.elements(first, elements, Kind::RBrack);
            }
            AstKind::ObjectExpression(n) => {
                let properties = n.properties.iter().map(|p| Some(p.span()));
                self.elements(first, properties, Kind::RCurly);
            }
            AstKind::ObjectPattern(n) => {
                let properties = n
                    .properties
                    .iter()
                    .map(|p| Some(p.span))
                    .chain(n.rest.as_ref().map(|r| Some(r.span)));
                self.elements(first, properties, Kind::RCurly);
            }
            AstKind::ObjectAssignmentTarget(n) => {
                let properties = n
                    .properties
                    .iter()
                    .map(|p| Some(p.span()))
                    .chain(n.rest.as_ref().map(|r| Some(r.span)));
                self.elements(first, properties, Kind::RCurly);
            }
            AstKind::ArrowFunctionExpression(n) => {
                let second = self.after(first);
                let left = if n.r#async { second } else { first };
                let body = n.body.span();
                let arrow = self.before_node_matching(body, |t| self.tokens().is(t, Kind::Arrow));
                if n.r#async {
                    self.layout.offset(second, 1, first);
                }
                if self.is(left, Kind::LParen) {
                    let parameters = parameter_spans(None, &n.params);
                    let right = self.closing(parameters.last().copied(), left, Kind::RParen);
                    self.list_from(left, &Self::items(parameters), right, 1);
                }
                self.layout.offset(arrow, 1, first);
                self.body(body, first);
            }
            AstKind::AssignmentExpression(n) => {
                self.chain(node, true, n.left.span(), n.right.span());
            }
            AstKind::AssignmentPattern(n) => self.chain(node, true, n.left.span(), n.right.span()),
            AstKind::AssignmentTargetWithDefault(n) => {
                self.chain(node, true, n.binding.span(), n.init.span());
            }
            AstKind::BinaryExpression(n) => self.chain(node, false, n.left.span(), n.right.span()),
            AstKind::PrivateInExpression(n) => self.chain(node, false, n.left.span, n.right.span()),
            AstKind::LogicalExpression(n) => self.chain(node, false, n.left.span(), n.right.span()),
            // `ESTree`'s `Property` whose value is the `AssignmentPattern` `a = 1`.
            AstKind::AssignmentTargetPropertyIdentifier(n) => {
                if let Some(init) = &n.init {
                    self.chain(node, true, n.binding.span, init.span());
                }
            }
            AstKind::FormalParameter(n) => self.parameter(n),
            AstKind::AwaitExpression(_)
            | AstKind::ThrowStatement(_)
            | AstKind::BindingRestElement(_)
            | AstKind::AssignmentTargetRest(_)
            | AstKind::SpreadElement(_)
            | AstKind::UnaryExpression(_)
            | AstKind::UpdateExpression(_) => {
                let next = self.after(first);
                self.layout.offset(next, 1, first);
            }
            AstKind::BlockStatement(n) => {
                self.block(node, n.body.iter().map(GetSpan::span));
            }
            AstKind::FunctionBody(n) => {
                let statements = n.directives.iter().map(|d| d.span);
                self.block(
                    node,
                    statements.chain(n.statements.iter().map(GetSpan::span)),
                );
            }
            AstKind::ClassBody(n) => self.block(node, n.body.iter().map(GetSpan::span)),
            AstKind::CallExpression(n) => {
                let anchor = n
                    .type_arguments
                    .as_ref()
                    .map_or_else(|| n.callee.span(), |t| t.span);
                let tokens = self.tokens();
                let left = self.after_node_matching(anchor, |t| tokens.is(t, Kind::LParen));
                let right = self.last(node);
                if let Some(type_arguments) = &n.type_arguments {
                    let type_first = self.first(type_arguments.span);
                    self.layout.offset(type_first, 1, first);
                }
                self.optional_tokens(anchor, left, first);
                self.layout.offset(left, 1, first);
                let arguments = Self::items(n.arguments.iter().map(GetSpan::span));
                self.list_from(left, &arguments, right, 1);
            }
            AstKind::Class(n) => {
                if let Some(id) = &n.id {
                    let id_token = self.first(id.span);
                    self.layout.offset(id_token, 1, first);
                }
                if let Some(heritage) = &n.heritage {
                    let superclass = heritage.expression.span();
                    let extends = self.before_node(superclass);
                    let super_token = self.after(extends);
                    self.layout.offset(extends, 1, first);
                    self.layout.offset(super_token, 1, extends);
                }
                let body_token = self.first(n.body.span);
                self.layout.offset(body_token, 0, first);
                self.class_typescript(n, first);
            }
            AstKind::ConditionalExpression(n) => {
                let tokens = self.tokens();
                let question =
                    self.after_node_matching(n.test.span(), |t| !tokens.is(t, Kind::RParen));
                let consequent_token = self.after(question);
                let colon =
                    self.after_node_matching(n.consequent.span(), |t| !tokens.is(t, Kind::RParen));
                let alternate_token = self.after(colon);
                // The head of a chain of conditionals in alternates.
                let mut base = n.span;
                let mut child = n;
                for ancestor in self.ancestors() {
                    match ancestor {
                        AstKind::ConditionalExpression(parent)
                            if matches!(&parent.alternate, Expression::ConditionalExpression(c)
                                if std::ptr::eq(&raw const **c, child)) =>
                        {
                            base = parent.span;
                            child = parent;
                        }
                        _ => break,
                    }
                }
                let base = self.first(base);
                self.layout.offset(question, 1, base);
                self.layout.offset(colon, 1, base);
                self.layout.offset(consequent_token, 1, question);
                self.layout.offset(alternate_token, 1, colon);
            }
            AstKind::ImportMeta(_) | AstKind::NewTarget(_) => {
                let dot = self.after(first);
                let property = self.after(dot);
                self.layout.offset(dot, 1, first);
                self.layout.offset(property, 1, first);
            }
            AstKind::ComputedMemberExpression(n) => {
                let property = n.expression.span();
                let tokens = self.tokens();
                let left = self.before_node_matching(property, |t| tokens.is(t, Kind::LBrack));
                let right = self.after_node_matching(property, |t| tokens.is(t, Kind::RBrack));
                self.optional_tokens(n.object.span(), left, first);
                self.layout.offset(left, 1, first);
                self.list_from(left, &[Some(Self::item(property))], right, 1);
            }
            AstKind::StaticMemberExpression(n) => self.dot(first, n.property.span),
            AstKind::PrivateFieldExpression(n) => self.dot(first, n.field.span),
            AstKind::MethodDefinition(n) => {
                self.member(node, n.key.span(), Some(n.value.span), n.computed);
            }
            AstKind::PropertyDefinition(n) => {
                self.member(
                    node,
                    n.key.span(),
                    n.value.as_ref().map(GetSpan::span),
                    n.computed,
                );
            }
            AstKind::AccessorProperty(n) => {
                self.member(
                    node,
                    n.key.span(),
                    n.value.as_ref().map(GetSpan::span),
                    n.computed,
                );
            }
            AstKind::ObjectProperty(n) => {
                self.member(node, n.key.span(), Some(n.value.span()), n.computed);
            }
            AstKind::BindingProperty(n) => {
                self.member(node, n.key.span(), Some(n.value.span()), n.computed);
            }
            AstKind::AssignmentTargetPropertyProperty(n) => {
                self.member(node, n.name.span(), Some(n.binding.span()), n.computed);
            }
            AstKind::NewExpression(n) => {
                let callee_tokens = self.outer(n.callee.span());
                let callee_first = callee_tokens.map(|(f, _)| f);
                self.layout.offset(callee_first, 1, first);
                if let Some(type_arguments) = &n.type_arguments {
                    let type_first = self.first(type_arguments.span);
                    self.layout.offset(type_first, 1, callee_first);
                }
                if let Some((_, callee_last)) = callee_tokens {
                    let tokens = self.tokens();
                    let before = n
                        .type_arguments
                        .as_ref()
                        .map_or_else(|| tokens.span(callee_last).end_offset, |t| t.span.end);
                    if !n.arguments.is_empty() || before < node.end {
                        let right = self.last(node);
                        let left = tokens.after_offset(before);
                        self.layout.offset(left, 1, callee_first);
                        let arguments = Self::items(n.arguments.iter().map(GetSpan::span));
                        self.list_from(left, &arguments, right, 1);
                    }
                }
            }
            AstKind::ReturnStatement(n) if n.argument.is_some() => {
                let next = self.after(first);
                self.layout.offset(next, 1, first);
            }
            AstKind::BreakStatement(n) if n.label.is_some() => {
                let next = self.after(first);
                self.layout.offset(next, 1, first);
            }
            AstKind::ContinueStatement(n) if n.label.is_some() => {
                let next = self.after(first);
                self.layout.offset(next, 1, first);
            }
            AstKind::SequenceExpression(n) => {
                if let Some(f) = first {
                    let expressions = Self::items(n.expressions.iter().map(GetSpan::span));
                    self.layout
                        .list(&expressions, Item::Token(f), None, 0, false);
                }
            }
            AstKind::TemplateLiteral(_) | AstKind::TSTemplateLiteralType(_) => {
                self.template(node);
            }
            AstKind::TaggedTemplateExpression(n) => {
                let tag = self.outer_first(n.tag.span());
                if let Some(type_arguments) = &n.type_arguments {
                    let type_first = self.first(type_arguments.span);
                    let tag_first = self.first(n.tag.span());
                    self.layout.offset(type_first, 1, tag_first);
                }
                let quasi = self.first(n.quasi.span);
                self.layout.offset(quasi, 1, tag);
            }
            AstKind::VariableDeclaration(n) => {
                if let Some(f) = first {
                    let declarations = Self::items(n.declarations.iter().map(|d| d.span));
                    self.layout
                        .list(&declarations, Item::Token(f), None, 1, false);
                }
            }
            AstKind::VariableDeclarator(n) if n.init.is_some() => {
                let id = annotated(&n.id, n.type_annotation.as_ref().map(|a| a.span));
                let eq = self.after_node(id);
                let init = self.after(eq);
                self.layout.offset(eq, 1, first);
                self.layout.offset(init, 1, first);
            }
            AstKind::YieldExpression(n) if n.argument.is_some() => {
                let second = self.after(first);
                self.layout.offset(second, 1, first);
                if n.delegate {
                    let third = self.after(second);
                    self.layout.offset(third, 1, first);
                }
            }
            AstKind::StaticBlock(n) => {
                let mut next = self.after(first);
                while let Some(t) = next.filter(|&t| !self.tokens().is(t, Kind::LCurly)) {
                    self.layout.offset(Some(t), 0, first);
                    next = self.tokens().after(t);
                }
                self.layout.offset(next, 0, first);
                let close = self.last(node);
                let statements = Self::items(n.body.iter().map(GetSpan::span));
                self.list_from(next, &statements, close, 1);
            }
            _ => self.lay_out_form(kind, first),
        }
    }

    /// `ArrayExpression`, `ObjectExpression` and their patterns: the elements between the
    /// brackets; a hole is `None`.
    fn elements(
        &mut self,
        first: Option<Token>,
        elements: impl Iterator<Item = Option<OxcSpan>>,
        close: Kind,
    ) {
        let elements: Vec<Option<OxcSpan>> = elements.collect();
        let start = match elements.last() {
            Some(Some(last)) => Some(last.end),
            _ => first.map(|f| self.tokens().span(f).end_offset),
        };
        let right = start.and_then(|s| {
            let tokens = self.tokens();
            tokens.after_matching(s, |t| tokens.is(t, close))
        });
        let items: Vec<Option<Item>> = elements.into_iter().map(|e| e.map(Self::item)).collect();
        self.list_from(first, &items, right, 1);
    }

    /// `BlockStatement` and `ClassBody`: the statements or members between the braces.
    fn block(&mut self, node: OxcSpan, statements: impl Iterator<Item = OxcSpan>) {
        let statements = Self::items(statements);
        self.layout.list(
            &statements,
            Item::Node(super::span(node)),
            self.last(node).map(Item::Token),
            1,
            false,
        );
    }

    /// `?.` between an object or callee and its `[` or `(`, indented from the chain's start.
    fn optional_tokens(&mut self, object: OxcSpan, left: Option<Token>, first: Option<Token>) {
        let (Some(object_last), Some(l)) = (self.last(object), left) else {
            return;
        };
        let tokens = self.tokens();
        let optional: Vec<Token> = tokens
            .between(object_last, l)
            .filter(|&t| tokens.is(t, Kind::QuestionDot))
            .collect();
        self.layout.offset_all(optional, 1, first);
    }

    /// A parameter: `ESTree` has its pattern, an `AssignmentPattern` around it for a default, and
    /// a `TSParameterProperty` around both for a modifier.
    fn parameter(&mut self, parameter: &FormalParameter<'a>) {
        let pattern = parameter.pattern.span();
        let annotation = parameter.type_annotation.as_ref().map(|a| a.span);
        if parameter.has_modifier() {
            self.parameter_property(parameter);
        }
        if let Some(init) = &parameter.initializer {
            let assignment = if parameter.has_modifier() {
                OxcSpan::new(pattern.start, init.span().end)
            } else {
                parameter.span
            };
            self.chain(
                assignment,
                true,
                annotated(&parameter.pattern, annotation),
                init.span(),
            );
        } else if !parameter.has_modifier()
            && matches!(parameter.pattern, BindingPattern::BindingIdentifier(_))
        {
            // The identifier's range holds its annotation and `?`, so parentheses can be around it.
            self.parentheses(parameter.span);
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

    /// The `kind` token after `last`, or after `from` when there is none.
    pub(super) fn closing(
        &self,
        last: Option<OxcSpan>,
        from: Option<Token>,
        kind: Kind,
    ) -> Option<Token> {
        let tokens = self.tokens();
        let start = match last {
            Some(n) => n.end,
            None => tokens.span(from?).end_offset,
        };
        tokens.after_matching(start, |t| tokens.is(t, kind))
    }

    pub(super) fn dot(&mut self, first: Option<Token>, property: OxcSpan) {
        let dot = self.before_node(property);
        let property_token = self.after(dot);
        self.layout.offset(dot, 1, first);
        self.layout.offset(property_token, 1, first);
    }

    /// Operators of a chain of binary, logical and assignment expressions and patterns: indented
    /// from the chain's first operand; `assign` for an assignment or a pattern.
    pub(super) fn chain(&mut self, node: OxcSpan, assign: bool, left: OxcSpan, right: OxcSpan) {
        let (mut head, mut assign) = (node, assign);
        for ancestor in self.ancestors() {
            let Some((parent, parent_assign)) = chain_link(ancestor) else {
                break;
            };
            let (before, after) = (self.before_node(head), self.after_node(head));
            if self.is(before, Kind::LParen) && self.is(after, Kind::RParen) {
                break;
            }
            (head, assign) = (parent, parent_assign);
        }
        let tokens = self.tokens();
        let operator = self.after_node_matching(left, |t| !tokens.is(t, Kind::RParen));
        let base = if assign {
            self.first(head)
        } else {
            self.outer_first(head)
        };
        let left_token = self.outer_first(left);
        let right_token = self.outer_first(right);
        if left_token != base {
            self.layout.offset(left_token, 1, base);
        }
        self.layout.offset(operator, 1, base);
        self.layout.offset(right_token, 1, base);
    }

    /// A property, method or field: modifiers and key at the start, the value after the key.
    pub(super) fn member(
        &mut self,
        node: OxcSpan,
        key: OxcSpan,
        value: Option<OxcSpan>,
        computed: bool,
    ) {
        let first = self.first(node);
        let Some((key_first, key_last)) = self.outer(key) else {
            return;
        };
        let Some(f) = first else {
            return;
        };
        let mut prefix: Vec<Token> = self.tokens().between(f, key_first).collect();
        if computed {
            prefix.pop();
        }
        self.layout.offset_all(prefix, 0, first);
        let last_key = if computed {
            let left = self.tokens().before(key_first);
            let right = self.tokens().after(key_last);
            self.layout.offset(left, 0, first);
            self.list_from(left, &[Some(Self::item(key))], right, 1);
            right
        } else {
            self.layout.offset(Some(key_first), 0, first);
            Some(key_last)
        };
        if let (Some(value), Some(last_key)) = (value, last_key) {
            let Some(init) = self.first(value) else {
                return;
            };
            let mut tokens: Vec<Token> = self.tokens().between(last_key, init).collect();
            tokens.push(init);
            self.layout.offset_all(tokens, 1, Some(last_key));
        }
    }
}

/// The range of a node that continues a chain of operators, and whether it is an assignment or a
/// pattern.
fn chain_link(kind: AstKind<'_>) -> Option<(OxcSpan, bool)> {
    match kind {
        AstKind::AssignmentExpression(n) => Some((n.span, true)),
        AstKind::AssignmentPattern(n) => Some((n.span, true)),
        AstKind::AssignmentTargetWithDefault(n) => Some((n.span, true)),
        AstKind::AssignmentTargetPropertyIdentifier(n) if n.init.is_some() => Some((n.span, true)),
        AstKind::FormalParameter(n) => {
            let init = n.initializer.as_ref()?;
            let span = if n.has_modifier() {
                OxcSpan::new(n.pattern.span().start, init.span().end)
            } else {
                n.span
            };
            Some((span, true))
        }
        AstKind::BinaryExpression(n) => Some((n.span, false)),
        AstKind::PrivateInExpression(n) => Some((n.span, false)),
        AstKind::LogicalExpression(n) => Some((n.span, false)),
        _ => None,
    }
}
