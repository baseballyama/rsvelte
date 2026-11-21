//! A typed `$props()`: svelte2tsx restates the annotation in the contract without a mapping, so
//! what TypeScript finds in it is reported once.

use oxc_ast::ast::{TSType, TSTypeAnnotation};
use oxc_span::GetSpan;
use rsvelte_typescript_tree::document_span;

use super::super::{Buffer, Builder, Node, NodeIdentifier, Span};
use super::Edit;

/// The type annotation of a `$props()` declaration.
#[derive(Clone, Copy)]
pub(in super::super) struct PropsAnnotation {
    /// From the `:` to the type's end.
    whole: Span,
    /// The type.
    value: Span,
    /// Whether the type is a type reference, which svelte2tsx keeps where it is.
    reference: bool,
}

impl PropsAnnotation {
    pub(in super::super) fn of(annotation: &TSTypeAnnotation<'_>) -> Self {
        Self {
            whole: document_span(annotation.span),
            value: document_span(annotation.type_annotation.span()),
            reference: matches!(annotation.type_annotation, TSType::TSTypeReference(_)),
        }
    }
}

impl Builder<'_> {
    /// svelte2tsx's `type $$ComponentProps = …;` for an annotation that is not a type reference,
    /// which it writes at the annotation's first character after the `:`.
    pub(in super::super) fn component_props_alias(
        &mut self,
        annotation: PropsAnnotation,
    ) -> NodeIdentifier {
        let name = self.tree.push(Node::IdentifierAt {
            name: "$$ComponentProps",
            at: annotation.whole.start_offset + 1,
        });
        let value = self.source_at(annotation.value, None);
        self.tree.push(Node::TypeAlias { name, value })
    }

    /// Names the annotation in an alias before the statement at `statement`, the one copy
    /// TypeScript checks, and returns the name for the contract. svelte2tsx names an annotation
    /// that is not a type reference `$$ComponentProps`, which messages then print; they print a
    /// referenced type by its own name.
    pub(super) fn props_alias(
        &mut self,
        annotation: PropsAnnotation,
        statement: u32,
        edits: &mut Buffer<Edit>,
    ) -> NodeIdentifier {
        let at_statement = Span::new(statement, statement);
        if annotation.reference {
            let name = self.unused_name("__rsvelte_props_type");
            let value = self.source_at(annotation.value, None);
            // JavaScript keeps the reference where svelte2tsx keeps it, where TypeScript reports
            // it, and names it in a comment it does not.
            let (alias, replaced) = if self.tree.javascript {
                (Node::TypeDefinition { name, value }, None)
            } else {
                (Node::TypeAlias { name, value }, Some(annotation.value))
            };
            edits.push(Edit {
                span: at_statement,
                replacement: Some(self.tree.push(alias)),
            });
            if let Some(replaced) = replaced {
                edits.push(Edit {
                    span: replaced,
                    replacement: Some(name),
                });
            }
            return name;
        }
        if !self.props_hoisted {
            let alias = self.component_props_alias(annotation);
            edits.push(Edit {
                span: at_statement,
                replacement: Some(alias),
            });
        }
        let name = self.tree.push(Node::Identifier("$$ComponentProps"));
        // JavaScript types a declaration in a JSDoc comment before it, where svelte2tsx's
        // annotation is one svelte-check ignores.
        if self.tree.javascript {
            let declared = self.tree.push(Node::DeclaredType(name));
            edits.push(Edit {
                span: at_statement,
                replacement: Some(declared),
            });
            edits.push(Edit::removal(annotation.whole));
        } else {
            edits.push(Edit {
                span: annotation.value,
                replacement: Some(name),
            });
        }
        name
    }
}
