//! The TypeScript syntax of value nodes (annotations, type arguments, `as`, assertions,
//! decorators, parameter properties), as upstream's `indent-helpers/ts.js` lays it out.

use oxc_ast::AstKind;
use oxc_ast::ast::{Class, Decorator, FormalParameter};
use oxc_span::{GetSpan, Span as OxcSpan};

use super::Script;
use crate::rules::indent::layout::Item;
use crate::rules::indent::tokens::Token;

impl<'a> Script<'_, 'a> {
    pub(super) fn lay_out_typescript(&mut self, kind: AstKind<'a>, first: Option<Token>) {
        let node = kind.span();
        match kind {
            AstKind::TSTypeAnnotation(n) => {
                let base = self.annotation_base();
                let tokens = self.tokens();
                let second = self
                    .after(first)
                    .filter(|&t| tokens.span(t).end_offset <= n.span.end);
                let question = first
                    .and_then(|c| tokens.before(c))
                    .filter(|&q| tokens.text(q) == "?");
                self.layout.offset(first, 1, base);
                self.layout.offset(second, 1, base);
                self.layout.offset(question, 1, base);
            }
            AstKind::TSAsExpression(n) => {
                self.as_expression(n.expression.span(), n.type_annotation.span());
            }
            AstKind::TSSatisfiesExpression(n) => {
                self.as_expression(n.expression.span(), n.type_annotation.span());
            }
            AstKind::TSNonNullExpression(_) | AstKind::JSDocNonNullableType(_) => {
                let last = self.last(node);
                self.layout.offset(last, 1, first);
            }
            AstKind::TSTypeAssertion(n) => {
                let expression = self.outer_first(n.expression.span());
                let right = expression.and_then(|e| self.tokens().before(e));
                self.list_from(
                    first,
                    &[Some(Self::item(n.type_annotation.span()))],
                    right,
                    1,
                );
                self.layout.offset(expression, 1, first);
            }
            AstKind::TSInstantiationExpression(n) => {
                self.type_arguments(Some(n.type_arguments.span), first);
            }
            AstKind::TSClassImplements(n) => {
                self.type_arguments(n.type_arguments.as_ref().map(|t| t.span), first);
            }
            AstKind::TSInterfaceHeritage(n) => {
                self.type_arguments(n.type_arguments.as_ref().map(|t| t.span), first);
            }
            AstKind::Decorator(n) => self.decorator(n),
            // Upstream knows no such node and leaves its tokens alone.
            AstKind::JSDocNullableType(_) | AstKind::JSDocUnknownType(_) => {
                self.layout.ignore(super::span(node));
            }
            _ => self.lay_out_type(kind, first),
        }
    }

    /// The first token of the node `ESTree` puts a type annotation in: the binding itself, not
    /// the parameter or declarator around it.
    fn annotation_base(&self) -> Option<Token> {
        match self.parent()? {
            AstKind::FormalParameter(p) => self.first(p.pattern.span()),
            AstKind::FormalParameterRest(r) => self.first(r.rest.span),
            AstKind::VariableDeclarator(d) => self.first(d.id.span()),
            AstKind::CatchParameter(c) => self.first(c.pattern.span()),
            parent => self.first(parent.span()),
        }
    }

    /// `<T>` after a name: its first token one indent from `first`.
    pub(super) fn type_arguments(&mut self, arguments: Option<OxcSpan>, first: Option<Token>) {
        if let Some(arguments) = arguments {
            let left = self.first(arguments);
            self.layout.offset(left, 1, first);
        }
    }

    /// `a as T`, `a satisfies T`: the keyword and the type one indent from the expression.
    fn as_expression(&mut self, expression: OxcSpan, ty: OxcSpan) {
        let (Some((first, last)), Some(type_first)) =
            (self.outer(expression), self.outer_first(ty))
        else {
            return;
        };
        let keyword = self.tokens().after(last);
        self.layout.offset(keyword, 1, Some(first));
        self.layout.offset(Some(type_first), 1, Some(first));
    }

    /// `@a`: what follows `@` stays with it; the first decorator leads what it decorates, and a
    /// later one aligns with the first.
    fn decorator(&mut self, decorator: &Decorator<'a>) {
        let at = self.first(decorator.span);
        let second = self.after(at);
        self.layout.offset(second, 0, at);
        let decorators: &[Decorator<'a>] = match self.parent() {
            Some(AstKind::Class(c)) => &c.decorators,
            Some(AstKind::MethodDefinition(m)) => &m.decorators,
            Some(AstKind::PropertyDefinition(p)) => &p.decorators,
            Some(AstKind::AccessorProperty(p)) => &p.decorators,
            Some(AstKind::FormalParameter(p)) => &p.decorators,
            Some(AstKind::FormalParameterRest(r)) => &r.decorators,
            _ => &[],
        };
        let (Some(first_decorator), Some(last_decorator)) = (decorators.first(), decorators.last())
        else {
            return;
        };
        if first_decorator.span == decorator.span {
            let start = self.tokens().after_offset(last_decorator.span.end);
            self.layout.offset(start, 0, at);
        } else {
            let base = self.first(first_decorator.span);
            self.layout.offset(at, 0, base);
        }
    }

    /// `constructor(private a)`: the parameter and what is between one indent from the modifier.
    pub(super) fn parameter_property(&mut self, parameter: &FormalParameter<'a>) {
        let start = parameter
            .decorators
            .last()
            .map_or(parameter.span.start, |d| d.span.end);
        let modifier = self.tokens().after_offset(start);
        let pattern = self.first(parameter.pattern.span());
        if let (Some(m), Some(p)) = (modifier, pattern) {
            let mut between: Vec<Token> = self.tokens().between(m, p).collect();
            between.push(p);
            self.layout.offset_all(between, 1, modifier);
        }
    }

    /// A class's type parameters, its superclass's type arguments and its `implements` list.
    pub(super) fn class_typescript(&mut self, class: &Class<'a>, first: Option<Token>) {
        if let Some(parameters) = &class.type_parameters {
            let base = class
                .id
                .as_ref()
                .and_then(|id| self.first(id.span))
                .or(first);
            let left = self.first(parameters.span);
            self.layout.offset(left, 1, base);
        }
        if let Some(heritage) = &class.heritage
            && let Some(arguments) = &heritage.type_arguments
        {
            let superclass = self.first(heritage.expression.span());
            self.type_arguments(Some(arguments.span), superclass);
        }
        if let Some(implements) = class.implements.first() {
            let implements_token = self.before_node(implements.span);
            self.layout.offset(implements_token, 1, first);
            if let Some(implements_token) = implements_token {
                let items = Self::items(class.implements.iter().map(|i| i.span));
                self.layout
                    .list(&items, Item::Token(implements_token), None, 1, false);
            }
        }
    }
}
