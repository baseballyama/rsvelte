//! The TypeScript syntax of value nodes (annotations, type arguments, `as`, decorators, erased
//! class members) and TypeScript declarations, as upstream's `indent-helpers/ts.js` lays them out.

use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript_syntax::lexer::T;
use rsvelte_typescript_syntax::syntax_tree::{
    Class, SignatureKind, SyntaxTree, Type, TypeScriptKind, TypeScriptSyntax,
};
use rsvelte_typescript_syntax::{Kind, NodeIdentifier};

use super::Script;
use crate::rules::indent::tokens::Token;

/// [`Script::typescript`] of a tree: each entry of its `typescript` table by node.
pub(in crate::rules::indent) fn by_node(javascript: &SyntaxTree) -> Vec<(NodeIdentifier, u32)> {
    let mut out: Vec<(NodeIdentifier, u32)> = javascript
        .typescript
        .iter()
        .enumerate()
        .map(|(i, t)| (t.node, i as u32))
        .collect();
    out.sort_unstable();
    out
}

impl Script<'_, '_> {
    /// Lays out the TypeScript syntax of a value node and visits what it holds.
    pub(super) fn visit_typescript(&mut self, node: NodeIdentifier, base: Option<Token>) {
        let js = self.javascript;
        let at = self.typescript.partition_point(|&(n, _)| n < node);
        let mut i = at;
        while let Some(&(n, entry)) = self.typescript.get(i) {
            if n != node {
                break;
            }
            let entry = js.typescript[entry as usize];
            self.lay_out_entry(node, entry, base);
            if let Some(syntax) = entry.syntax.opt() {
                self.visit(syntax);
            }
            i += 1;
        }
    }

    fn lay_out_entry(
        &mut self,
        node: NodeIdentifier,
        entry: TypeScriptSyntax,
        base: Option<Token>,
    ) {
        let js = self.javascript;
        let syntax = entry.syntax.opt();
        let first = self.first(node);
        match entry.kind {
            TypeScriptKind::Annotation => {
                if let Some(syntax) = syntax {
                    self.type_annotation(syntax, base.or(first));
                }
            }
            TypeScriptKind::ReturnType => {
                if let Some(syntax) = syntax {
                    self.type_annotation(syntax, first);
                }
            }
            TypeScriptKind::TypeParameters => {
                if let Kind::Class(Class::Definition { name, .. }) = js.kind(node) {
                    let base = name.and_then(|n| self.first(n)).or(first);
                    self.layout
                        .offset(syntax.and_then(|s| self.first(s)), 1, base);
                }
            }
            // Recorded on the callee, whose first token is the call's.
            TypeScriptKind::TypeArgs => {
                self.layout
                    .offset(syntax.and_then(|s| self.first(s)), 1, first);
            }
            TypeScriptKind::As | TypeScriptKind::Satisfies => {
                if let Some(syntax) = syntax {
                    self.as_expression(node, syntax);
                }
            }
            TypeScriptKind::Assertion => {
                let Some(syntax) = syntax else {
                    return;
                };
                let tokens = &self.layout.tokens;
                let left = tokens.first(entry.span);
                let expression = self.outer(node).map(|(f, _)| f);
                let right = expression.and_then(|e| tokens.before(e));
                self.list_from(left, &[self.node(syntax)], right, 1);
                self.layout.offset(expression, 1, left);
            }
            TypeScriptKind::NonNull => {
                let bang = self.layout.tokens.first(entry.span);
                let base = self.outer(node).map(|(f, _)| f);
                self.layout.offset(bang, 1, base);
            }
            TypeScriptKind::Implements => {
                let Some(Kind::Type(Type::Heritage(references))) = syntax.map(|s| js.kind(s))
                else {
                    return;
                };
                let implements = references.first().and_then(|&r| self.before_node(r));
                self.layout.offset(implements, 1, first);
                if let Some(implements) = implements {
                    self.layout.list(
                        &self.items(references),
                        crate::rules::indent::layout::Item::Token(implements),
                        None,
                        1,
                        false,
                    );
                }
            }
            TypeScriptKind::Decorator => self.decorator(node, entry),
            TypeScriptKind::ParameterProperty => {
                let tokens = &self.layout.tokens;
                let modifier = tokens.first(entry.span);
                let parameter = tokens.last(entry.span).and_then(|t| tokens.after(t));
                if let (Some(m), Some(p)) = (modifier, parameter) {
                    let mut between: Vec<Token> = tokens.between(m, p).collect();
                    between.push(p);
                    self.layout.offset_all(between, 1, modifier);
                }
            }
            TypeScriptKind::Optional | TypeScriptKind::Definite | TypeScriptKind::Member => {}
        }
    }

    /// Where the type arguments after an expression end.
    pub(super) fn type_arguments_end(&self, node: NodeIdentifier) -> Option<u32> {
        let js = self.javascript;
        let at = self.typescript.partition_point(|&(n, _)| n < node);
        self.typescript[at..]
            .iter()
            .take_while(|&&(n, _)| n == node)
            .map(|&(_, i)| js.typescript[i as usize])
            .find(|t| t.kind == TypeScriptKind::TypeArgs)
            .map(|t| t.span.end_offset)
    }

    /// `: T` (or `=> T`): the colon and the token after it one indent from `base`, and a `?`
    /// before the colon too.
    pub(super) fn type_annotation(&mut self, ty: NodeIdentifier, base: Option<Token>) {
        let Some(colon) = self.annotation_colon(ty) else {
            return;
        };
        let tokens = &self.layout.tokens;
        let second = tokens.after(colon);
        let question = tokens.before(colon).filter(|&q| tokens.text(q) == "?");
        self.layout.offset(Some(colon), 1, base);
        self.layout.offset(second, 1, base);
        self.layout.offset(question, 1, base);
    }

    /// The `:` or `=>` before a type annotation.
    pub(super) fn annotation_colon(&self, ty: NodeIdentifier) -> Option<Token> {
        let (first, _) = self.outer(ty)?;
        let tokens = &self.layout.tokens;
        tokens
            .before(first)
            .filter(|&t| tokens.is(t, T::Colon) || tokens.is(t, T::Arrow))
    }

    /// `a as T`, `a satisfies T`: the keyword and the type one indent from the expression, and
    /// parentheses around the whole.
    fn as_expression(&mut self, expression: NodeIdentifier, ty: NodeIdentifier) {
        let (Some((first, last)), Some((type_first, type_last))) =
            (self.outer(expression), self.outer(ty))
        else {
            return;
        };
        let tokens = &self.layout.tokens;
        let keyword = tokens.after(last);
        let whole = Span::new(
            tokens.span(first).start_offset,
            tokens.span(type_last).end_offset,
        );
        self.layout.offset(keyword, 1, Some(first));
        self.layout.offset(Some(type_first), 1, Some(first));
        self.parentheses_of(whole);
    }

    /// `@a`: what follows `@` stays with it; the first decorator leads what it decorates, and a
    /// later one aligns with the first.
    fn decorator(&mut self, node: NodeIdentifier, entry: TypeScriptSyntax) {
        let js = self.javascript;
        let tokens = &self.layout.tokens;
        let at = tokens.first(entry.span);
        let second = at.and_then(|a| tokens.after(a));
        self.layout.offset(second, 0, at);
        let first_decorator = js
            .typescript
            .iter()
            .filter(|t| t.node == node && t.kind == TypeScriptKind::Decorator)
            .min_by_key(|t| t.span.start_offset);
        let Some(first_decorator) = first_decorator else {
            return;
        };
        if first_decorator.span == entry.span {
            let last_decorator = js
                .typescript
                .iter()
                .filter(|t| t.node == node && t.kind == TypeScriptKind::Decorator)
                .map(|t| t.span.end_offset)
                .max();
            let start = last_decorator.and_then(|end| self.layout.tokens.after_offset(end));
            self.layout.offset(start, 0, at);
        } else {
            let base = self.layout.tokens.first(first_decorator.span);
            self.layout.offset(at, 0, base);
        }
    }

    /// The members of a class body in source order, the erased ones included.
    pub(super) fn class_body(
        &self,
        class: NodeIdentifier,
        members: &[NodeIdentifier],
    ) -> Vec<NodeIdentifier> {
        let js = self.javascript;
        let at = self.typescript.partition_point(|&(n, _)| n < class);
        let erased = self.typescript[at..]
            .iter()
            .take_while(|&&(n, _)| n == class)
            .map(|&(_, i)| js.typescript[i as usize])
            .filter(|t| t.kind == TypeScriptKind::Member)
            .filter_map(|t| t.syntax.opt());
        let mut body: Vec<NodeIdentifier> = members.iter().copied().chain(erased).collect();
        body.sort_by_key(|&m| self.span(m).map_or(0, |s| s.start_offset));
        body
    }

    /// A member's last token before the `;` or `,` that ends it.
    pub(super) fn member_last(&self, node: NodeIdentifier) -> Option<Token> {
        let tokens = &self.layout.tokens;
        let last = self.last(node)?;
        if tokens.is(last, T::Semi) || tokens.is(last, T::Comma) {
            tokens.before(last)
        } else {
            Some(last)
        }
    }

    /// The range `ESTree` gives a type member, which holds the `;` or `,` after it.
    pub(super) fn member_span(&self, node: NodeIdentifier, span: Span) -> Span {
        let is_member = match self.javascript.kind(node) {
            Kind::Type(Type::Property { .. } | Type::Index { .. }) => true,
            Kind::Type(Type::Signature(s)) => {
                !matches!(s.kind, SignatureKind::Function | SignatureKind::Constructor)
            }
            _ => false,
        };
        if !is_member {
            return span;
        }
        let tokens = &self.layout.tokens;
        tokens
            .after_offset(span.end_offset)
            .filter(|&t| tokens.is(t, T::Semi) || tokens.is(t, T::Comma))
            .map_or(span, |t| {
                Span::new(span.start_offset, tokens.span(t).end_offset)
            })
    }
}
