//! What TypeScript declarations offset, as upstream's `indent-helpers/ts.js` does.

use oxc_ast::AstKind;
use oxc_ast::ast::{TSNamespaceDeclaration, TSNamespaceDeclarationBody};
use oxc_span::{GetSpan, Span as OxcSpan};

use super::Script;
use crate::rules::indent::layout::Item;
use crate::rules::indent::tokens::Token;

impl<'a> Script<'_, 'a> {
    /// Lays out a declaration's type syntax; `first` is where `declare`, `export` or `const` starts
    /// it.
    pub(super) fn lay_out_declaration(&mut self, kind: AstKind<'a>, first: Option<Token>) {
        let node = kind.span();
        match kind {
            AstKind::TSTypeAliasDeclaration(n) => {
                let id = self.first(n.id.span);
                self.layout.offset(id, 1, first);
                let eq = match &n.type_parameters {
                    Some(parameters) => {
                        let left = self.first(parameters.span);
                        self.layout.offset(left, 1, id);
                        self.after_node(parameters.span)
                    }
                    None => self.after_node(n.id.span),
                };
                let init = self.outer_first(n.type_annotation.span());
                self.layout.offset(eq, 1, id);
                self.layout.offset(init, 1, id);
            }
            AstKind::TSInterfaceDeclaration(n) => {
                let id = self.first(n.id.span);
                self.layout.offset(id, 1, first);
                if let Some(parameters) = &n.type_parameters {
                    let left = self.first(parameters.span);
                    self.layout.offset(left, 1, id);
                }
                if let Some(heritage) = n.extends.first() {
                    let extends = self.before_node(heritage.span);
                    self.layout.offset(extends, 1, first);
                    if let Some(extends) = extends {
                        let items = Self::items(n.extends.iter().map(|h| h.span));
                        self.layout
                            .list(&items, Item::Token(extends), None, 1, false);
                    }
                }
                let body = self.first(n.body.span);
                self.layout.offset(body, 0, first);
            }
            AstKind::TSEnumDeclaration(n) => {
                let left = self.prefixed_name(first, n.id.span);
                self.layout.offset(left, 0, first);
            }
            AstKind::TSEnumMember(n) => {
                if let Some(initializer) = &n.initializer {
                    self.member(node, n.id.span(), Some(initializer.span()), false);
                }
            }
            AstKind::TSNamespaceDeclaration(n) if !self.is_inner_namespace(kind) => {
                self.namespace(n, first);
            }
            AstKind::TSExternalModuleDeclaration(n) => {
                let left = self.prefixed_name(first, n.id.span);
                if n.body.is_some() {
                    self.layout.offset(left, 0, first);
                }
            }
            AstKind::TSGlobalDeclaration(n) => {
                let left = self.prefixed_name(first, n.global_span);
                self.layout.offset(left, 0, first);
            }
            AstKind::TSImportEqualsDeclaration(n) => {
                let Some((id, id_last)) = self.outer(n.id.span) else {
                    return;
                };
                self.layout.offset(Some(id), 1, first);
                let operator = self.tokens().after(id_last);
                let reference = self.outer_first(n.module_reference.span());
                self.layout.offset(operator, 1, Some(id_last));
                self.layout.offset(reference, 1, Some(id_last));
            }
            AstKind::TSExternalModuleReference(n) => {
                let left = self.after(first);
                let right = self.last(node);
                self.layout.offset(left, 1, first);
                self.list_from(left, &[Some(Self::item(n.expression.span))], right, 1);
            }
            AstKind::TSExportAssignment(n) => {
                let expression = self.outer_first(n.expression.span());
                let operator = expression.and_then(|e| self.tokens().before(e));
                self.layout.offset(operator, 1, first);
                self.layout.offset(expression, 1, first);
            }
            AstKind::TSNamespaceExportDeclaration(n) => {
                let (Some(f), Some(id)) = (first, self.first(n.id.span)) else {
                    return;
                };
                let mut between: Vec<Token> = self.tokens().between(f, id).collect();
                between.push(id);
                self.layout.offset_all(between, 1, first);
            }
            _ => {}
        }
    }

    /// `namespace A.B {}`, which `ESTree` names `A.B`, a qualified name, with one body.
    fn namespace(&mut self, namespace: &TSNamespaceDeclaration<'a>, first: Option<Token>) {
        let mut innermost = namespace;
        let mut name = namespace.id.span;
        let head = self.first(name);
        while let TSNamespaceDeclarationBody::TSNamespaceDeclaration(inner) = &innermost.body {
            // Each `.` and name of the qualified name, from its first name.
            let dot = self.before_node(inner.id.span);
            let part = self.after(dot);
            self.layout.offset(dot, 1, head);
            self.layout.offset(part, 1, head);
            name = OxcSpan::new(name.start, inner.id.span.end);
            innermost = inner;
        }
        let left = self.prefixed_name(first, name);
        self.layout.offset(left, 0, first);
    }

    /// The name of an enum or a namespace one indent from `first`, the tokens before it at
    /// `first`; the `{` after the name.
    fn prefixed_name(&mut self, first: Option<Token>, name: OxcSpan) -> Option<Token> {
        let f = first?;
        let (id, id_last) = self.outer(name)?;
        let prefix: Vec<Token> = self.tokens().between(f, id).collect();
        self.layout.offset_all(prefix, 0, first);
        self.layout.offset(Some(id), 1, first);
        self.tokens().after(id_last)
    }
}
