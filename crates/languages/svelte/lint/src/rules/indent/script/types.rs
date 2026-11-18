//! What each kind of type syntax offsets, as upstream's `indent-helpers/ts.js` does.

use oxc_ast::AstKind;
use oxc_ast::ast::{TSType, TSTypeAnnotation, TSTypeParameterDeclaration};
use oxc_parser::Kind;
use oxc_span::{GetSpan, Span as OxcSpan};

use super::{Script, parameter_spans};
use crate::rules::indent::layout::Item;
use crate::rules::indent::tokens::Token;

/// How a signature starts, which decides what its parameters and return type follow.
#[derive(Clone, Copy, PartialEq, Eq)]
enum Start {
    /// `() => T`
    Function,
    /// `new () => T`
    Constructor,
    /// `(): T` in a type
    Call,
    /// `new (): T` in a type
    Construct,
    /// `key(): T`, a getter or a setter, with its key and whether it is computed.
    Method(OxcSpan, bool),
}

/// A function type or a signature of an object type.
struct Signature {
    start: Start,
    type_parameters: Option<OxcSpan>,
    parameters: Vec<OxcSpan>,
    /// The return type: the annotation from its `:` or `=>`, and the type.
    returns: Option<(OxcSpan, OxcSpan)>,
}

fn returns(annotation: &TSTypeAnnotation<'_>) -> (OxcSpan, OxcSpan) {
    (annotation.span, annotation.type_annotation.span())
}

const fn type_parameters(parameters: &TSTypeParameterDeclaration<'_>) -> OxcSpan {
    parameters.span
}

impl<'a> Script<'_, 'a> {
    #[expect(clippy::too_many_lines, reason = "one arm per type syntax")]
    pub(super) fn lay_out_type(&mut self, kind: AstKind<'a>, first: Option<Token>) {
        let node = kind.span();
        match kind {
            AstKind::TSTypeReference(n) => {
                self.type_arguments(n.type_arguments.as_ref().map(|t| t.span), first);
            }
            AstKind::TSQualifiedName(n) => self.dot(first, n.right.span),
            AstKind::TSImportTypeQualifiedName(n) => self.dot(first, n.right.span),
            AstKind::TSTypeParameterInstantiation(n) => {
                let last = self.last(node);
                let items = Self::items(n.params.iter().map(GetSpan::span));
                self.list_from(first, &items, last, 1);
            }
            AstKind::TSTypeParameterDeclaration(n) => {
                let last = self.last(node);
                let items = Self::items(n.params.iter().map(|p| p.span));
                self.list_from(first, &items, last, 1);
            }
            AstKind::TSTypeParameter(n) => {
                let constraint = n.constraint.as_ref().map(GetSpan::span);
                let default = n.default.as_ref().map(GetSpan::span);
                self.type_parameter(node, constraint, default);
            }
            AstKind::TSFunctionType(n) => self.signature(
                node,
                &Signature {
                    start: Start::Function,
                    type_parameters: n.type_parameters.as_deref().map(type_parameters),
                    parameters: parameter_spans(n.this_param.as_deref(), &n.params),
                    returns: Some(returns(&n.return_type)),
                },
            ),
            AstKind::TSConstructorType(n) => self.signature(
                node,
                &Signature {
                    start: Start::Constructor,
                    type_parameters: n.type_parameters.as_deref().map(type_parameters),
                    parameters: parameter_spans(None, &n.params),
                    returns: Some(returns(&n.return_type)),
                },
            ),
            AstKind::TSCallSignatureDeclaration(n) => self.signature(
                node,
                &Signature {
                    start: Start::Call,
                    type_parameters: n.type_parameters.as_deref().map(type_parameters),
                    parameters: parameter_spans(n.this_param.as_deref(), &n.params),
                    returns: n.return_type.as_deref().map(returns),
                },
            ),
            AstKind::TSConstructSignatureDeclaration(n) => self.signature(
                node,
                &Signature {
                    start: Start::Construct,
                    type_parameters: n.type_parameters.as_deref().map(type_parameters),
                    parameters: parameter_spans(None, &n.params),
                    returns: n.return_type.as_deref().map(returns),
                },
            ),
            AstKind::TSMethodSignature(n) => self.signature(
                node,
                &Signature {
                    start: Start::Method(n.key.span(), n.computed),
                    type_parameters: n.type_parameters.as_deref().map(type_parameters),
                    parameters: parameter_spans(n.this_param.as_deref(), &n.params),
                    returns: n.return_type.as_deref().map(returns),
                },
            ),
            AstKind::TSUnionType(n) => self.union(first, &n.types),
            AstKind::TSIntersectionType(n) => self.union(first, &n.types),
            AstKind::TSArrayType(_) => {
                let last = self.last(node);
                let bracket = last.and_then(|l| self.tokens().before(l));
                self.layout.offset(bracket, 0, first);
                self.layout.offset(last, 0, first);
            }
            AstKind::TSOptionalType(_) => {
                let last = self.last(node);
                self.layout.offset(last, 1, first);
            }
            AstKind::TSRestType(_)
            | AstKind::TSInferType(_)
            | AstKind::TSTypeOperator(_)
            | AstKind::TSTypeQuery(_) => {
                let next = self.after(first);
                self.layout.offset(next, 1, first);
            }
            AstKind::TSNamedTupleMember(n) => {
                let (Some(label), Some(element)) = (first, self.outer_first(n.element_type.span()))
                else {
                    return;
                };
                let mut between: Vec<Token> = self.tokens().between(label, element).collect();
                between.push(element);
                self.layout.offset_all(between, 1, first);
            }
            AstKind::TSTupleType(n) => {
                let last = self.last(node);
                let items = Self::items(n.element_types.iter().map(GetSpan::span));
                self.list_from(first, &items, last, 1);
            }
            AstKind::TSTypeLiteral(n) => {
                let last = self.last(node);
                let items = Self::items(n.members.iter().map(GetSpan::span));
                self.list_from(first, &items, last, 1);
            }
            AstKind::TSInterfaceBody(n) => {
                let last = self.last(node);
                let items = Self::items(n.body.iter().map(GetSpan::span));
                self.list_from(first, &items, last, 1);
            }
            AstKind::TSEnumBody(n) => {
                let last = self.last(node);
                let items = Self::items(n.members.iter().map(|m| m.span));
                self.list_from(first, &items, last, 1);
            }
            AstKind::TSModuleBlock(n) => {
                let last = self.last(node);
                let statements = n.directives.iter().map(|d| d.span);
                let items = Self::items(statements.chain(n.body.iter().map(GetSpan::span)));
                self.list_from(first, &items, last, 1);
            }
            AstKind::TSIndexedAccessType(n) => {
                let index = n.index_type.span();
                let tokens = self.tokens();
                let left = self.before_node_matching(index, |t| tokens.is(t, Kind::LBrack));
                let right = self.after_node_matching(index, |t| tokens.is(t, Kind::RBrack));
                self.layout.offset(left, 1, first);
                self.list_from(left, &[Some(Self::item(index))], right, 1);
            }
            AstKind::TSConditionalType(n) => {
                let check_token = first;
                let extends_token = self.after_node(n.check_type.span());
                let extends_type = self.first(n.extends_type.span());
                self.layout.offset(extends_token, 1, check_token);
                self.layout.offset(extends_type, 1, extends_token);
                let tokens = self.tokens();
                let question = self
                    .after_node_matching(n.extends_type.span(), |t| !tokens.is(t, Kind::RParen));
                let consequent_token = self.after(question);
                let colon =
                    self.after_node_matching(n.true_type.span(), |t| !tokens.is(t, Kind::RParen));
                let alternate_token = self.after(colon);
                // The head of a chain of conditionals in false branches.
                let mut base = n.span;
                let mut child = n;
                for ancestor in self.ancestors() {
                    match ancestor {
                        AstKind::TSConditionalType(parent)
                            if matches!(&parent.false_type, TSType::TSConditionalType(c)
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
            AstKind::TSImportType(n) => {
                let tokens = self.tokens();
                let left = first.and_then(|f| {
                    tokens.after_matching(tokens.span(f).end_offset, |t| tokens.is(t, Kind::LParen))
                });
                let arguments: Vec<OxcSpan> =
                    [Some(n.source.span), n.options.as_ref().map(|o| o.span)]
                        .into_iter()
                        .flatten()
                        .collect();
                let right = arguments
                    .last()
                    .and_then(|&a| self.after_node_matching(a, |t| tokens.is(t, Kind::RParen)));
                self.layout.offset(left, 1, first);
                self.list_from(left, &Self::items(arguments), right, 1);
                if let Some(qualifier) = &n.qualifier {
                    let dot = self.before_node(qualifier.span());
                    let property = self.after(dot);
                    self.layout.offset(dot, 1, first);
                    self.layout.offset(property, 1, first);
                }
                self.type_arguments(n.type_arguments.as_ref().map(|t| t.span), first);
            }
            AstKind::TSMappedType(n) => self.mapped(
                node,
                n.key.span,
                n.constraint.span(),
                n.name_type.as_ref().map(GetSpan::span),
                n.type_annotation.as_ref().map(GetSpan::span),
            ),
            AstKind::TSTypePredicate(n) => {
                let tokens = self.tokens();
                let operator = self
                    .after_node_matching(n.parameter_name.span(), |t| !tokens.is(t, Kind::RParen))
                    .filter(|&o| tokens.text(o) == "is");
                let right = n
                    .type_annotation
                    .as_ref()
                    .and_then(|a| self.outer_first(a.type_annotation.span()));
                self.layout.offset(operator, 1, first);
                self.layout.offset(right, 1, first);
            }
            AstKind::TSPropertySignature(n) => {
                let Some(key_last) = self.key_last(first, n.key.span(), n.computed) else {
                    return;
                };
                if let Some(annotation) = &n.type_annotation {
                    if let Some(colon) = self.first(annotation.span) {
                        let mut between: Vec<Token> =
                            self.tokens().between(key_last, colon).collect();
                        between.push(colon);
                        self.layout.offset_all(between, 1, first);
                    }
                } else if n.optional {
                    let question = self.member_last(node);
                    self.layout.offset(question, 1, first);
                }
            }
            AstKind::TSIndexSignature(n) => {
                let parameter = n.parameter.span;
                let right = self.closing(Some(parameter), first, Kind::RBrack);
                self.list_from(first, &[Some(Self::item(parameter))], right, 1);
                if let (Some(right), Some(colon)) = (right, self.first(n.type_annotation.span)) {
                    let mut between: Vec<Token> = self.tokens().between(right, colon).collect();
                    between.push(colon);
                    self.layout.offset_all(between, 1, first);
                }
            }
            _ => self.lay_out_declaration(kind, first),
        }
    }

    /// `A | B` and `A & B`: the types after the first indented from it, unless it starts a line.
    fn union(&mut self, first: Option<Token>, types: &[TSType<'a>]) {
        let Some(f) = first else {
            return;
        };
        let skip = types.first().and_then(|t| self.outer_first(t.span())) == first;
        let rest = if skip { &types[1..] } else { types };
        let tokens = self.tokens();
        let begins = tokens.begins_line(tokens.span(f).start_offset);
        let items = Self::items(rest.iter().map(GetSpan::span));
        self.layout
            .list(&items, Item::Token(f), None, u32::from(!begins), false);
    }

    /// `T extends U = V`: what follows the name is indented from it, and what follows `extends`
    /// from `extends`.
    fn type_parameter(
        &mut self,
        node: OxcSpan,
        constraint: Option<OxcSpan>,
        default: Option<OxcSpan>,
    ) {
        let tokens = self.tokens();
        let inner = [constraint, default];
        let mut all = tokens.within(super::span(node));
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
                    .any(|s| start > s.start && start < s.end)
            })
            .collect();
        let Some((&second, rest)) = after.split_first() else {
            return;
        };
        self.layout.offset(Some(second), 1, Some(first));
        if self.text(second) == "extends" {
            let mut base = second;
            let mut rest = rest.iter().copied();
            for t in rest.by_ref() {
                if self.text(t) == "=" {
                    self.layout.offset(Some(t), 1, Some(base));
                    break;
                }
                self.layout.offset(Some(t), 1, Some(second));
                base = t;
            }
            self.layout.offset_all(rest, 1, Some(base));
        } else {
            self.layout.offset_all(rest.iter().copied(), 1, Some(first));
        }
    }

    fn signature(&mut self, node: OxcSpan, signature: &Signature) {
        let first = self.first(node);
        let (left, key_last) = match signature.start {
            Start::Method(key, computed) => {
                let Some(key_last) = self.key_last(first, key, computed) else {
                    return;
                };
                let tokens = self.tokens();
                let left = tokens.after_matching(tokens.span(key_last).end_offset, |t| {
                    tokens.is(t, Kind::LParen)
                });
                if let Some(left) = left {
                    let mut between: Vec<Token> = tokens.between(key_last, left).collect();
                    between.push(left);
                    self.layout.offset_all(between, 1, first);
                }
                (left, Some(key_last))
            }
            start => {
                let mut current = first;
                if matches!(start, Start::Constructor | Start::Construct) {
                    current = self.after(current);
                    self.layout.offset(current, 1, first);
                }
                if let Some(parameters) = signature.type_parameters {
                    current = self.after_node(parameters);
                    self.layout.offset(current, 1, first);
                }
                (current, None)
            }
        };
        let right = self.closing(signature.parameters.last().copied(), left, Kind::RParen);
        let items = Self::items(signature.parameters.iter().copied());
        self.list_from(left, &items, right, 1);
        let is_type = matches!(signature.start, Start::Function | Start::Constructor);
        if is_type {
            let arrow = self.after(right);
            self.layout.offset(arrow, 1, left);
        }
        if let Some((annotation, ty)) = signature.returns
            && !is_type
            && let Some(from) = key_last.or(right)
        {
            let tokens = self.tokens();
            let colon = self
                .first(annotation)
                .filter(|&c| tokens.is(c, Kind::Colon) || tokens.is(c, Kind::Arrow));
            if let Some(colon) = colon {
                let type_first = self.outer_first(ty);
                let mut between: Vec<Token> = tokens.between(from, colon).collect();
                between.push(colon);
                between.extend(type_first);
                self.layout.offset_all(between, 1, first);
            }
        }
    }

    fn mapped(
        &mut self,
        node: OxcSpan,
        key: OxcSpan,
        constraint: OxcSpan,
        name_type: Option<OxcSpan>,
        value: Option<OxcSpan>,
    ) {
        let (Some(left_brace), Some(right_brace)) = (self.first(node), self.last(node)) else {
            return;
        };
        let left_bracket = self.before_node(key);
        let right_bracket = self.after_node(name_type.unwrap_or(constraint));
        if let Some(l) = left_bracket {
            let mut between: Vec<Token> = self.tokens().between(left_brace, l).collect();
            between.push(l);
            self.layout.offset_all(between, 1, Some(left_brace));
        }
        let items: Vec<Option<Item>> = [Some(key), Some(constraint), name_type]
            .into_iter()
            .map(|n| n.map(Self::item))
            .collect();
        self.list_from(left_bracket, &items, right_bracket, 1);
        if let (Some(key_first), Some(constraint_first)) = (self.first(key), self.first(constraint))
        {
            let mut between: Vec<Token> =
                self.tokens().between(key_first, constraint_first).collect();
            between.push(constraint_first);
            self.layout.offset_all(between, 1, Some(key_first));
        }
        let Some(right_bracket) = right_bracket else {
            return;
        };
        // Up to the value's first token, or to the `}` when there is no value.
        let end = value.and_then(|v| self.first(v));
        let mut between: Vec<Token> = self
            .tokens()
            .between(right_bracket, end.unwrap_or(right_brace))
            .chain(end)
            .collect();
        between.retain(|&t| t != right_brace);
        self.layout.offset_all(between, 1, Some(left_brace));
        self.layout.offset(Some(right_brace), 0, Some(left_brace));
    }

    /// `` `a${B}c` ``: each later part at the start, each substitution indented.
    pub(super) fn template(&mut self, node: OxcSpan) {
        let first = self.first(node);
        let tokens = self.tokens();
        let parts: Vec<Token> = tokens
            .within(super::span(node))
            .filter(|&t| tokens.is_template(t))
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
    fn key_last(&mut self, first: Option<Token>, key: OxcSpan, computed: bool) -> Option<Token> {
        let (_, key_last) = self.outer(key)?;
        if computed {
            let close = self.tokens().after(key_last);
            self.list_from(first, &[Some(Self::item(key))], close, 1);
            close
        } else {
            Some(key_last)
        }
    }

    /// A member's last token before the `;` or `,` that ends it.
    fn member_last(&self, node: OxcSpan) -> Option<Token> {
        let tokens = self.tokens();
        let last = self.last(node)?;
        if tokens.is(last, Kind::Semicolon) || tokens.is(last, Kind::Comma) {
            tokens.before(last)
        } else {
            Some(last)
        }
    }
}
