//! What TypeScript declarations offset, as upstream's `indent-helpers/ts.js` does.

use rsvelte_typescript_syntax::lexer::T;
use rsvelte_typescript_syntax::syntax_tree::Type;
use rsvelte_typescript_syntax::{Kind, NodeIdentifier};

use super::Script;
use crate::rules::indent::layout::Item;
use crate::rules::indent::tokens::Token;

impl Script<'_, '_> {
    /// A TypeScript-only statement: what it declares, or the `export type { … }` it holds.
    pub(super) fn typescript_statement(&mut self, node: NodeIdentifier) {
        let js = self.javascript;
        if let Some(export) = js.exported_types(node) {
            self.visit(export);
            return;
        }
        let Some(declaration) = js.declaration(node) else {
            if let Some(span) = self.span(node) {
                self.layout.ignore(span);
            }
            return;
        };
        // `:statement` matches what upstream names `…Declaration`.
        let statement = match js.kind(declaration) {
            Kind::Type(ty) => !matches!(ty, Type::ExportAssignment(_)),
            Kind::Function { .. } => false,
            _ => true,
        };
        if statement {
            self.semicolon(node);
        }
        self.visit(declaration);
    }

    /// Lays out a declaration's type syntax; `first` is where `declare`, `export` or `const` starts
    /// it.
    pub(super) fn lay_out_declaration(
        &mut self,
        node: NodeIdentifier,
        ty: Type<'_>,
        first: Option<Token>,
    ) {
        match ty {
            Type::Alias {
                name,
                parameters,
                value,
            } => {
                let id = self.first(name);
                self.layout.offset(id, 1, first);
                let eq = match parameters {
                    Some(parameters) => {
                        self.layout.offset(self.first(parameters), 1, id);
                        self.after_node(parameters)
                    }
                    None => self.after_node(name),
                };
                let init = self.outer(value).map(|(f, _)| f);
                self.layout.offset(eq, 1, id);
                self.layout.offset(init, 1, id);
            }
            Type::Interface {
                name,
                parameters,
                heritage,
                body,
            } => self.interface(node, name, parameters, heritage, body),
            Type::Enum { name, members } => {
                let Some(left) = self.prefixed_name(first, name) else {
                    return;
                };
                let right = self.last(node);
                self.layout.offset(Some(left), 0, first);
                self.list_from(Some(left), &self.items(members), right, 1);
            }
            Type::EnumMember {
                name,
                initializer: Some(initializer),
            } => self.member(node, name, Some(initializer), false),
            Type::Module { name, body } => {
                let Some(left) = self.prefixed_name(first, name) else {
                    return;
                };
                if let Some(statements) = body {
                    let right = self.last(node);
                    self.layout.offset(Some(left), 0, first);
                    self.list_from(Some(left), &self.items(statements), right, 1);
                }
            }
            Type::ImportEquals { name, reference } => {
                let Some((id, id_last)) = self.outer(name) else {
                    return;
                };
                self.layout.offset(Some(id), 1, first);
                let operator = self.layout.tokens.after(id_last);
                let reference = self.outer(reference).map(|(f, _)| f);
                self.layout.offset(operator, 1, Some(id_last));
                self.layout.offset(reference, 1, Some(id_last));
            }
            Type::External(source) => {
                let left = first.and_then(|f| self.layout.tokens.after(f));
                let right = self.last(node);
                self.layout.offset(left, 1, first);
                self.list_from(left, &[self.node(source)], right, 1);
            }
            Type::ExportAssignment(expression) => {
                let expression = self.outer(expression).map(|(f, _)| f);
                let operator = expression.and_then(|e| self.layout.tokens.before(e));
                self.layout.offset(operator, 1, first);
                self.layout.offset(expression, 1, first);
            }
            Type::NamespaceExport(name) => {
                let (Some(f), Some(id)) = (first, self.first(name)) else {
                    return;
                };
                let mut between: Vec<Token> = self.layout.tokens.between(f, id).collect();
                between.push(id);
                self.layout.offset_all(between, 1, first);
            }
            _ => {}
        }
    }

    fn interface(
        &mut self,
        node: NodeIdentifier,
        name: NodeIdentifier,
        parameters: Option<NodeIdentifier>,
        heritage: Option<NodeIdentifier>,
        body: &[NodeIdentifier],
    ) {
        let first = self.first(node);
        let id = self.first(name);
        self.layout.offset(id, 1, first);
        if let Some(parameters) = parameters {
            self.layout.offset(self.first(parameters), 1, id);
        }
        if let Some(heritage) = heritage
            && let Kind::Type(Type::Heritage(references)) = self.javascript.kind(heritage)
        {
            let extends = references.first().and_then(|&r| self.before_node(r));
            self.layout.offset(extends, 1, first);
            if let Some(extends) = extends {
                self.layout.list(
                    &self.items(references),
                    Item::Token(extends),
                    None,
                    1,
                    false,
                );
            }
        }
        let header_end = heritage.or(parameters).unwrap_or(name);
        let tokens = &self.layout.tokens;
        let left = self.after_node_matching(header_end, |t| tokens.is(t, T::LBrace));
        let right = self.last(node);
        self.layout.offset(left, 0, first);
        self.list_from(left, &self.items(body), right, 1);
    }

    /// The name of an enum or a namespace one indent from `first`, the tokens before it at
    /// `first`; the `{` after the name.
    fn prefixed_name(&mut self, first: Option<Token>, name: NodeIdentifier) -> Option<Token> {
        let f = first?;
        let (id, id_last) = self.outer(name)?;
        let prefix: Vec<Token> = self.layout.tokens.between(f, id).collect();
        self.layout.offset_all(prefix, 0, first);
        self.layout.offset(Some(id), 1, first);
        self.layout.tokens.after(id_last)
    }
}
