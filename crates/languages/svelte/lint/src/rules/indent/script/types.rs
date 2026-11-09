//! What each kind of type syntax offsets, as upstream's `indent-helpers/ts.js` does.

use rsvelte_svelte::syntax::syntax_tree::TokenType;
use rsvelte_typescript::lexer::T;
use rsvelte_typescript::syntax_tree::{Signature, SignatureKind, Type};
use rsvelte_typescript::{Kind, NodeIdentifier};

use super::Script;
use crate::rules::indent::layout::Item;
use crate::rules::indent::tokens::Token;

impl Script<'_, '_> {
    /// Lays out a type node and visits what it holds.
    pub(super) fn visit_type(&mut self, node: NodeIdentifier, ty: Type<'_>) {
        if is_parenthesizable(ty) {
            self.parentheses(node);
        }
        self.lay_out_type(node, ty);
        let js = self.javascript;
        let mut children = Vec::new();
        match ty {
            // Upstream walks a mapped type's key and constraint, not a type parameter.
            Type::Mapped {
                parameter,
                name_type,
                value,
            } => {
                if let Kind::Type(Type::Parameter {
                    name, constraint, ..
                }) = js.kind(parameter)
                {
                    children.push(name);
                    children.extend(constraint);
                }
                children.extend(name_type);
                children.extend(value);
            }
            _ => js.for_each_type_child(node, |c| children.push(c)),
        }
        for child in children {
            self.visit(child);
        }
    }

    #[expect(clippy::too_many_lines, reason = "one arm per type syntax")]
    fn lay_out_type(&mut self, node: NodeIdentifier, ty: Type<'_>) {
        let first = self.first(node);
        match ty {
            Type::Reference {
                arguments: Some(arguments),
                ..
            } => {
                let left = self.first(arguments);
                self.layout.offset(left, 1, first);
            }
            Type::Qualified { right, .. } => self.dot(first, right),
            Type::Arguments(items) | Type::Parameters(items) => {
                let last = self.last(node);
                self.list_from(first, &self.items(items), last, 1);
            }
            Type::Parameter {
                constraint,
                default,
                ..
            } => self.type_parameter(node, constraint, default),
            Type::Signature(signature) => self.signature(node, signature),
            Type::Union(types) | Type::Intersection(types) => {
                let Some(f) = first else {
                    return;
                };
                let skip = types.first().and_then(|&t| self.outer(t)).map(|(t, _)| t) == first;
                let rest = if skip { &types[1..] } else { types };
                let begins = self
                    .layout
                    .tokens
                    .begins_line(self.layout.tokens.span(f).start_offset);
                self.layout.list(
                    &self.items(rest),
                    Item::Token(f),
                    None,
                    u32::from(!begins),
                    false,
                );
            }
            Type::Array(_) => {
                let last = self.last(node);
                let bracket = last.and_then(|l| self.layout.tokens.before(l));
                self.layout.offset(bracket, 0, first);
                self.layout.offset(last, 0, first);
            }
            Type::Optional(_) | Type::NonNull(_) => {
                let last = self.last(node);
                self.layout.offset(last, 1, first);
            }
            Type::Rest(_) | Type::Infer(_) | Type::Operator(_) | Type::Query { .. } => {
                let next = first.and_then(|f| self.layout.tokens.after(f));
                self.layout.offset(next, 1, first);
            }
            Type::Named { element, .. } => {
                let (Some(label), Some((element, _))) = (first, self.outer(element)) else {
                    return;
                };
                let mut between: Vec<Token> = self.layout.tokens.between(label, element).collect();
                between.push(element);
                self.layout.offset_all(between, 1, first);
            }
            Type::Tuple(elements) | Type::Object(elements) => {
                let last = self.last(node);
                self.list_from(first, &self.items(elements), last, 1);
            }
            Type::Indexed { index, .. } => {
                let left =
                    self.before_node_matching(index, |t| self.layout.tokens.is(t, T::LBracket));
                let right =
                    self.after_node_matching(index, |t| self.layout.tokens.is(t, T::RBracket));
                self.layout.offset(left, 1, first);
                self.list_from(left, &[self.node(index)], right, 1);
            }
            Type::Conditional {
                check,
                extends,
                consequent,
                ..
            } => self.conditional(node, check, extends, consequent),
            Type::Import {
                source, qualifier, ..
            } => {
                let left = first.and_then(|f| {
                    self.layout
                        .tokens
                        .after_matching(self.layout.tokens.span(f).end_offset, |t| {
                            self.layout.tokens.is(t, T::LParen)
                        })
                });
                let right =
                    self.after_node_matching(source, |t| self.layout.tokens.is(t, T::RParen));
                self.layout.offset(left, 1, first);
                self.list_from(left, &[self.node(source)], right, 1);
                if let Some(qualifier) = qualifier {
                    let dot = self.qualifier_dot(qualifier);
                    let property = dot.and_then(|d| self.layout.tokens.after(d));
                    self.layout.offset(dot, 1, first);
                    self.layout.offset(property, 1, first);
                }
                if let Type::Import {
                    arguments: Some(arguments),
                    ..
                } = ty
                {
                    let left = self.first(arguments);
                    self.layout.offset(left, 1, first);
                }
            }
            Type::TemplateLiteral(_) => self.template(node),
            Type::Mapped {
                parameter,
                name_type,
                value,
            } => self.mapped(node, parameter, name_type, value),
            Type::Predicate {
                name, annotation, ..
            } => {
                let operator =
                    self.after_node_matching(name, |t| !self.layout.tokens.is(t, T::RParen));
                let operator = operator.filter(|&o| self.layout.tokens.text(o) == "is");
                let right = annotation.and_then(|a| self.outer(a)).map(|(f, _)| f);
                self.layout.offset(operator, 1, first);
                self.layout.offset(right, 1, first);
                if let Some(annotation) = annotation {
                    // A predicate's annotation starts at its type, with no colon.
                    let second = right.and_then(|r| self.layout.tokens.after(r));
                    let inside = self.span(annotation).zip(second).is_some_and(|(s, t)| {
                        self.layout.tokens.span(t).end_offset <= s.end_offset
                    });
                    if inside {
                        self.layout.offset(second, 1, first);
                    }
                }
            }
            Type::Property {
                key,
                value,
                computed,
                optional,
            } => {
                let Some(key_last) = self.key_last(first, key, computed) else {
                    return;
                };
                if let Some(value) = value {
                    let colon = self.annotation_colon(value);
                    if let Some(colon) = colon {
                        let mut between: Vec<Token> =
                            self.layout.tokens.between(key_last, colon).collect();
                        between.push(colon);
                        self.layout.offset_all(between, 1, first);
                    }
                    self.type_annotation(value, first);
                } else if optional {
                    let question = self.member_last(node);
                    self.layout.offset(question, 1, first);
                }
                self.semicolon(node);
            }
            Type::Index { parameters, value } => {
                let right = self.closing(parameters.last().copied(), first, T::RBracket);
                self.list_from(first, &self.items(parameters), right, 1);
                if let (Some(value), Some(right)) = (value, right) {
                    if let Some(colon) = self.annotation_colon(value) {
                        let mut between: Vec<Token> =
                            self.layout.tokens.between(right, colon).collect();
                        between.push(colon);
                        self.layout.offset_all(between, 1, first);
                    }
                    self.type_annotation(value, first);
                }
                self.semicolon(node);
            }
            Type::Heritage(_) | Type::Leaf | Type::Reference { .. } => {}
            Type::Alias { .. }
            | Type::Interface { .. }
            | Type::Enum { .. }
            | Type::EnumMember { .. }
            | Type::Module { .. }
            | Type::ImportEquals { .. }
            | Type::External(_)
            | Type::ExportAssignment(_)
            | Type::NamespaceExport(_) => self.lay_out_declaration(node, ty, first),
        }
    }

    /// `T extends U = V`: what follows the name is indented from it, and what follows `extends`
    /// from `extends`.
    fn type_parameter(
        &mut self,
        node: NodeIdentifier,
        constraint: Option<NodeIdentifier>,
        default: Option<NodeIdentifier>,
    ) {
        let Some(span) = self.span(node) else {
            return;
        };
        let tokens = &self.layout.tokens;
        let inner = [constraint, default].map(|n| n.and_then(|n| self.span(n)));
        let mut all = tokens.within(span);
        let Some(first) = all.next() else {
            return;
        };
        // Of a constraint or a default, only the first token.
        let after: Vec<Token> = all
            .filter(|&t| {
                let start = tokens.span(t).start_offset;
                !inner
                    .iter()
                    .flatten()
                    .any(|s| start > s.start_offset && start < s.end_offset)
            })
            .collect();
        let Some((&second, rest)) = after.split_first() else {
            return;
        };
        self.layout.offset(Some(second), 1, Some(first));
        if self.layout.tokens.text(second) == "extends" {
            let mut base = second;
            let mut rest = rest.iter().copied();
            for t in rest.by_ref() {
                if self.layout.tokens.text(t) == "=" {
                    self.layout.offset(Some(t), 1, Some(base));
                    break;
                }
                self.layout.offset(Some(t), 1, Some(second));
                base = t;
            }
            self.layout.offset_all(rest, 1, Some(base));
        } else {
            self.layout.offset_all(rest.to_vec(), 1, Some(first));
        }
    }

    fn signature(&mut self, node: NodeIdentifier, signature: Signature<'_>) {
        let first = self.first(node);
        let (left, key_last) = match signature.kind {
            SignatureKind::Method | SignatureKind::Getter | SignatureKind::Setter => {
                let Some(key) = signature.key else {
                    return;
                };
                let Some(key_last) = self.key_last(first, key, signature.computed) else {
                    return;
                };
                let tokens = &self.layout.tokens;
                let left = tokens.after_matching(tokens.span(key_last).end_offset, |t| {
                    tokens.is(t, T::LParen)
                });
                if let Some(left) = left {
                    let mut between: Vec<Token> = tokens.between(key_last, left).collect();
                    between.push(left);
                    self.layout.offset_all(between, 1, first);
                }
                (left, Some(key_last))
            }
            _ => {
                let mut current = first;
                if matches!(
                    signature.kind,
                    SignatureKind::Constructor | SignatureKind::Construct
                ) {
                    current = current.and_then(|c| self.layout.tokens.after(c));
                    self.layout.offset(current, 1, first);
                }
                if let Some(parameters) = signature.type_parameters {
                    current = self.after_node(parameters);
                    self.layout.offset(current, 1, first);
                }
                (current, None)
            }
        };
        let right = self.closing(signature.parameters.last().copied(), left, T::RParen);
        self.list_from(left, &self.items(signature.parameters), right, 1);
        if signature.kind == SignatureKind::Function || signature.kind == SignatureKind::Constructor
        {
            let arrow = right.and_then(|r| self.layout.tokens.after(r));
            self.layout.offset(arrow, 1, left);
        }
        if let Some(returns) = signature.returns {
            let from = key_last.or(right);
            let colon = self.annotation_colon(returns);
            if signature.kind != SignatureKind::Function
                && signature.kind != SignatureKind::Constructor
                && let (Some(from), Some(colon)) = (from, colon)
            {
                let type_first = self.outer(returns).map(|(f, _)| f);
                let tokens = &self.layout.tokens;
                let mut between: Vec<Token> = tokens.between(from, colon).collect();
                between.push(colon);
                between.extend(type_first);
                self.layout.offset_all(between, 1, first);
            }
            self.type_annotation(returns, first);
        }
        if !matches!(
            signature.kind,
            SignatureKind::Function | SignatureKind::Constructor
        ) {
            self.semicolon(node);
        }
    }

    fn conditional(
        &mut self,
        node: NodeIdentifier,
        check: NodeIdentifier,
        extends: NodeIdentifier,
        consequent: NodeIdentifier,
    ) {
        let js = self.javascript;
        let check_token = self.first(node);
        let extends_token = self.after_node(check);
        let extends_type = self.first(extends);
        self.layout.offset(extends_token, 1, check_token);
        self.layout.offset(extends_type, 1, extends_token);
        let tokens = &self.layout.tokens;
        let question = self.after_node_matching(extends, |t| !tokens.is(t, T::RParen));
        let consequent_token = question.and_then(|q| tokens.after(q));
        let colon = self.after_node_matching(consequent, |t| !tokens.is(t, T::RParen));
        let alternate_token = colon.and_then(|c| tokens.after(c));
        let mut base = node;
        while let Some(parent) = self.parent(base) {
            match js.kind(parent) {
                Kind::Type(Type::Conditional { alternate, .. }) if alternate == base => {
                    base = parent;
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

    fn mapped(
        &mut self,
        node: NodeIdentifier,
        parameter: NodeIdentifier,
        name_type: Option<NodeIdentifier>,
        value: Option<NodeIdentifier>,
    ) {
        let js = self.javascript;
        let Kind::Type(Type::Parameter {
            name: key,
            constraint,
            ..
        }) = js.kind(parameter)
        else {
            return;
        };
        let (Some(left_brace), Some(right_brace)) = (self.first(node), self.last(node)) else {
            return;
        };
        let tokens = &self.layout.tokens;
        let left_bracket = self.before_node(key);
        let right_bracket = self.after_node(name_type.or(constraint).unwrap_or(key));
        if let Some(l) = left_bracket {
            let mut between: Vec<Token> = tokens.between(left_brace, l).collect();
            between.push(l);
            self.layout.offset_all(between, 1, Some(left_brace));
        }
        let items: Vec<Option<Item>> = [Some(key), constraint, name_type]
            .iter()
            .map(|n| n.and_then(|n| self.node(n)))
            .collect();
        self.list_from(left_bracket, &items, right_bracket, 1);
        if let (Some(constraint), Some(key_first)) = (constraint, self.first(key))
            && let Some(constraint_first) = self.first(constraint)
        {
            let tokens = &self.layout.tokens;
            let mut between: Vec<Token> = tokens.between(key_first, constraint_first).collect();
            between.push(constraint_first);
            self.layout.offset_all(between, 1, Some(key_first));
        }
        let Some(right_bracket) = right_bracket else {
            return;
        };
        let tokens = &self.layout.tokens;
        // Up to the value's first token, or to the `}` when there is no value.
        let end = value.and_then(|v| self.first(v));
        let mut between: Vec<Token> = tokens
            .between(right_bracket, end.unwrap_or(right_brace))
            .chain(end)
            .collect();
        between.retain(|&t| t != right_brace);
        self.layout.offset_all(between, 1, Some(left_brace));
        self.layout.offset(Some(right_brace), 0, Some(left_brace));
    }

    /// `` `a${B}c` ``: each later part at the start, each substitution indented.
    pub(super) fn template(&mut self, node: NodeIdentifier) {
        let first = self.first(node);
        let Some(span) = self.span(node) else {
            return;
        };
        let tokens = &self.layout.tokens;
        let parts: Vec<Token> = tokens
            .within(span)
            .filter(|&t| matches!(tokens.kind(t), TokenType::JavaScript(T::Template { .. })))
            .collect();
        // The token after each part but the last.
        let substitutions: Vec<Token> = parts[..parts.len().saturating_sub(1)]
            .iter()
            .filter_map(|&p| tokens.after(p))
            .collect();
        self.layout
            .offset_all(parts.iter().skip(1).copied(), 0, first);
        self.layout.offset_all(substitutions, 1, first);
    }

    /// The last token of a computed key's `]` or of a plain key; a computed key is laid out as a
    /// list between `first` and its `]`.
    fn key_last(
        &mut self,
        first: Option<Token>,
        key: NodeIdentifier,
        computed: bool,
    ) -> Option<Token> {
        let (_, key_last) = self.outer(key)?;
        if computed {
            let close = self.layout.tokens.after(key_last);
            self.list_from(first, &[self.node(key)], close, 1);
            close
        } else {
            Some(key_last)
        }
    }

    /// The `.` before an import type's qualifier, whose first name may be qualified further.
    fn qualifier_dot(&self, qualifier: NodeIdentifier) -> Option<Token> {
        let mut leftmost = qualifier;
        while let Kind::Type(Type::Qualified { left, .. }) = self.javascript.kind(leftmost) {
            leftmost = left;
        }
        self.before_node(leftmost)
    }
}

/// The type syntax whose parentheses upstream lays out.
const fn is_parenthesizable(ty: Type<'_>) -> bool {
    match ty {
        Type::Signature(s) => {
            matches!(s.kind, SignatureKind::Function | SignatureKind::Constructor)
        }
        Type::Leaf
        | Type::Reference { .. }
        | Type::Union(_)
        | Type::Intersection(_)
        | Type::Array(_)
        | Type::Optional(_)
        | Type::Rest(_)
        | Type::Named { .. }
        | Type::Tuple(_)
        | Type::Indexed { .. }
        | Type::Conditional { .. }
        | Type::Infer(_)
        | Type::Operator(_)
        | Type::Query { .. }
        | Type::Import { .. }
        | Type::TemplateLiteral(_)
        | Type::Object(_)
        | Type::Mapped { .. }
        | Type::Predicate { .. } => true,
        _ => false,
    }
}
