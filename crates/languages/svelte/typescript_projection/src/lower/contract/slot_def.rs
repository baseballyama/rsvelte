//! svelte2tsx's `slots` in the render function's return: each `<slot>`'s attributes, which type
//! the `let:` of a parent when the component declares no `$$Slots`.

use oxc_ast::ast::{Expression, IdentifierReference};
use oxc_ast_visit::Visit;
use oxc_span::GetSpan;
use oxc_syntax::identifier::is_identifier_name;
use rsvelte_svelte_semantic::resolve::Resolution;
use rsvelte_svelte_syntax::syntax_tree::{Attribute, AttributeKind, AttributeValue, Part, Range};
use rsvelte_typescript_tree::document_span;

use super::super::{Builder, Node, NodeIdentifier, Span};

/// A slot's name, as text and as a node, and its properties: each name with the property.
type Slot<'a> = (&'a str, NodeIdentifier, Vec<(&'a str, NodeIdentifier)>);

impl<'s> Builder<'s> {
    /// The object of each slot's properties, from the attributes of each `<slot>`, or `None`
    /// when svelte2tsx would print one as something other than an object literal.
    pub(super) fn slot_def(&mut self, mut elements: Vec<Range>) -> Option<NodeIdentifier> {
        // Root snippets lower first; svelte2tsx reads the slots in source order. An empty list
        // starts where the next element's does, and comes before it.
        elements.sort_unstable_by_key(|range| (range.start, range.len));
        elements.dedup_by_key(|range| (range.start, range.len));
        let mut slots: Vec<Slot<'s>> = Vec::new();
        for attributes in elements {
            let attributes = self.component.attributes(attributes);
            let named = attributes
                .iter()
                .find(|a| a.kind == AttributeKind::Attribute && a.name.text(self.source) == "name");
            let (slot, slot_node) = match named.map(|a| a.value) {
                None => ("default", Node::StringLiteral("default")),
                Some(AttributeValue::Parts(parts)) => match self.component.parts(parts) {
                    [Part::Text(text)]
                        if !text
                            .text(self.source)
                            .contains(['\'', '"', '\\', '\n', '\r']) =>
                    {
                        let name = text.text(self.source);
                        let text = self.tree.push(Node::Text(*text));
                        let parts = self.tree.list(&[text]);
                        (
                            name,
                            Node::String {
                                parts,
                                template: false,
                            },
                        )
                    }
                    _ => return None,
                },
                Some(AttributeValue::True) => return None,
            };
            let properties = self.slot_properties(attributes)?;
            let slot_node = self.tree.push(slot_node);
            match slots.iter_mut().find(|(name, ..)| *name == slot) {
                Some(existing) => existing.2 = properties,
                None => slots.push((slot, slot_node, properties)),
            }
        }
        if slots.is_empty() {
            return None;
        }
        let mut entries = Vec::with_capacity(slots.len());
        for (_, name, properties) in slots {
            let members: Vec<NodeIdentifier> =
                properties.into_iter().map(|(_, member)| member).collect();
            let properties = self.tree.list(&members);
            let value = self.tree.push(Node::Object { properties });
            entries.push(self.tree.push(Node::NamedProperty { name, value }));
        }
        let properties = self.tree.list(&entries);
        Some(self.tree.push(Node::Object { properties }))
    }

    /// A slot's properties, each name with the property, or `None` when svelte2tsx would print
    /// one as something other than a property.
    fn slot_properties(
        &mut self,
        attributes: &'s [Attribute],
    ) -> Option<Vec<(&'s str, NodeIdentifier)>> {
        let mut properties: Vec<(&'s str, NodeIdentifier)> = Vec::new();
        for attribute in attributes {
            let property = match attribute.kind {
                AttributeKind::Attribute => attribute.name.text(self.source),
                AttributeKind::Spread => "...",
                _ => continue,
            };
            if property == "name" {
                continue;
            }
            let AttributeValue::Parts(parts) = attribute.value else {
                continue;
            };
            let value = match self.component.parts(parts) {
                [] => continue,
                [Part::Expression { expression, .. }] => {
                    let expression = self.expression(*expression);
                    if property == "..." && !matches!(expression, Expression::Identifier(_)) {
                        // svelte2tsx spreads the name of a spread's identifier, here none.
                        continue;
                    }
                    // svelte2tsx unpacks a name the template declares; until that is ported, any.
                    if reads_template(expression, (self.resolution)()?) {
                        self.tree.push(Node::Identifier("__rsvelte_untyped_prop()"))
                    } else {
                        self.tree
                            .push(Node::UnmappedSource(document_span(expression.span())))
                    }
                }
                // svelte2tsx types text, or text with expressions, as a string.
                _ => self.tree.push(Node::Identifier("\"\"")),
            };
            let member = if property == "..." {
                let dots = Span::new(
                    attribute.span.start_offset + 1,
                    attribute.span.start_offset + 4,
                );
                if dots.text(self.source) != "..." {
                    return None;
                }
                Node::Spread { value, dots }
            } else if is_identifier_name(property) {
                let name = self.tree.push(Node::UnmappedSource(attribute.name));
                Node::NamedProperty { name, value }
            } else {
                return None;
            };
            let member = self.tree.push(member);
            match properties.iter_mut().find(|(name, _)| *name == property) {
                Some(existing) if property != "..." => existing.1 = member,
                _ => properties.push((property, member)),
            }
        }
        Some(properties)
    }
}

/// Whether `expression` reads a name the template declares, which svelte2tsx resolves to the
/// value it unpacks.
fn reads_template(expression: &Expression<'_>, resolution: &Resolution) -> bool {
    struct Reads<'r> {
        resolution: &'r Resolution,
        template: bool,
    }
    impl<'a> Visit<'a> for Reads<'_> {
        fn visit_identifier_reference(&mut self, it: &IdentifierReference<'a>) {
            let Some(symbol) = self.resolution.symbol(it) else {
                return;
            };
            let scoping = self.resolution.scoping();
            let scope = scoping.symbol_scope_id(symbol);
            if scope != self.resolution.instance_scope() && scope != scoping.root_scope_id() {
                self.template = true;
            }
        }
    }
    let mut reads = Reads {
        resolution,
        template: false,
    };
    reads.visit_expression(expression);
    reads.template
}
