//! svelte2tsx's `slots` in the render function's return: each `<slot>`'s attributes, which type
//! the `let:` of a parent when the component declares no `$$Slots`.

use oxc_ast::ast::Expression;
use oxc_syntax::identifier::is_identifier_name;
use rsvelte_svelte_syntax::syntax_tree::{AttributeKind, AttributeValue, Part, Range};

use super::super::{Builder, Node, NodeIdentifier, Span};

/// A slot's properties: each name with the property.
type Properties<'a> = Vec<(&'a str, NodeIdentifier)>;

/// A slot's name, as text and as a node, and its properties.
type Slot<'a> = (&'a str, NodeIdentifier, Properties<'a>);

/// A `<slot>`'s attributes, and its properties, which svelte2tsx writes where the element is:
/// `None` when it would print them as something other than an object literal.
#[derive(Debug)]
pub(in crate::lower) struct SlotElement<'a> {
    attributes: Range,
    properties: Option<Properties<'a>>,
}

impl<'s> Builder<'s> {
    /// The `<slot>` with `attributes`, its properties read where it is.
    pub(in crate::lower) fn slot_element(&mut self, attributes: Range) -> SlotElement<'s> {
        let properties = if self.declares_slots() {
            None
        } else {
            self.slot_properties(attributes)
        };
        SlotElement {
            attributes,
            properties,
        }
    }

    /// The object of each slot's properties, from the attributes of each `<slot>`, or `None`
    /// when svelte2tsx would print one as something other than an object literal.
    pub(super) fn slot_def(
        &mut self,
        mut elements: Vec<SlotElement<'s>>,
    ) -> Option<NodeIdentifier> {
        // Root snippets lower first; svelte2tsx reads the slots in source order. An empty list
        // starts where the next element's does, and comes before it.
        elements.sort_unstable_by_key(|e| (e.attributes.start, e.attributes.len));
        elements.dedup_by_key(|e| (e.attributes.start, e.attributes.len));
        let mut slots: Vec<Slot<'s>> = Vec::new();
        for SlotElement {
            attributes,
            properties,
        } in elements
        {
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
            let properties = properties?;
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
    fn slot_properties(&mut self, attributes: Range) -> Option<Properties<'s>> {
        let tree = self.component;
        let mut properties: Properties<'s> = Vec::new();
        for attribute in tree.attributes(attributes) {
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
            let value = match tree.parts(parts) {
                [] => continue,
                [Part::Expression { expression, .. }] => {
                    let expression = tree.javascript.get_expression(*expression);
                    if property == "..." && !matches!(expression, Expression::Identifier(_)) {
                        // svelte2tsx spreads the name of a spread's identifier, here none.
                        continue;
                    }
                    self.slot_value(expression, self.slot_scope.len())?
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
                Node::Spread {
                    value,
                    dots: Some(dots),
                }
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
