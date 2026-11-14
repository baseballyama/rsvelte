//! A typed `$props()`: svelte2tsx restates the annotation in the contract without a mapping, so
//! what TypeScript finds in it is reported once.

use super::super::{Buffer, Builder, Node, NodeIdentifier, Span};
use super::Edit;

impl Builder<'_> {
    /// Names the annotation at `annotation` in an alias before the statement at `statement`, the
    /// one copy TypeScript checks, and returns the name for the contract. svelte2tsx names an
    /// annotation that is not a type reference `$$ComponentProps`, which messages then print;
    /// they print a referenced type by its own name.
    pub(super) fn props_alias(
        &mut self,
        annotation: Span,
        reference: bool,
        statement: u32,
        edits: &mut Buffer<Edit>,
    ) -> NodeIdentifier {
        let name = if reference {
            self.unused_name("__rsvelte_props_type")
        } else {
            self.tree.push(Node::Identifier("$$ComponentProps"))
        };
        let value = self.tree.push(Node::SourceCopy { span: annotation });
        let alias = self.tree.push(Node::TypeAlias { name, value });
        edits.push(Edit {
            span: Span::new(statement, statement),
            replacement: Some(alias),
        });
        edits.push(Edit {
            span: annotation,
            replacement: Some(name),
        });
        name
    }
}
