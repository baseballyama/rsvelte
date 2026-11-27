//! The calls that check an element, a component or a slot against its attributes.

use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{
    Attribute, AttributeKind, AttributeValue, Part, Range, TemplateNode,
};
use rsvelte_typescript_tree::{ExpressionIdentifier, node_span};

use super::directive::Directives;
use super::{Builder, Node, NodeIdentifier, Result, refuse};

impl Builder<'_> {
    /// `__rsvelte_component(C)(internals, properties)`, with the name it gives the component when
    /// the snippets' names are declared from its props or its instance is checked. A call that
    /// `constructs` makes the instance, of the generics its props infer.
    pub(super) fn component_call(
        &mut self,
        (component, name): (Option<ExpressionIdentifier>, Span),
        properties: NodeIdentifier,
        snippets: Range,
        name_it: bool,
        constructs: bool,
    ) -> (NodeIdentifier, Option<NodeIdentifier>) {
        // svelte-check reports a finding on the call itself, such as that the value is no
        // component, at the component's expression.
        let at = component.map_or(name.start_offset, |component| {
            node_span(self.expression(component)).start_offset
        });
        let component = match component {
            Some(component) => self.expression_source(component, None),
            None => self.tree.push(Node::AnyComponent),
        };
        let callee = self.tree.push(Node::IdentifierAt {
            name: "__rsvelte_component",
            at,
        });
        let arguments = self.tree.list(&[component]);
        let mut callee = self.tree.push(Node::Call { callee, arguments });
        let named = (snippets.len != 0 || name_it).then(|| {
            let name = self.component_instance_name();
            let value = callee;
            self.scratch
                .push(self.tree.push(Node::Const { name, value }));
            name
        });
        if let Some(name) = named {
            callee = name;
        }
        if constructs {
            let bind_this = self.tree.push(Node::Identifier("__rsvelte_bind_this"));
            let arguments = self.tree.list(&[callee]);
            callee = self.tree.push(Node::Call {
                callee: bind_this,
                arguments,
            });
        }
        let internals = self.tree.push(Node::Identifier("__rsvelte_internals"));
        let internals = self.tree.push(Node::Call {
            callee: internals,
            arguments: Range::default(),
        });
        let arguments = self.tree.list(&[internals, properties]);
        (self.tree.push(Node::Call { callee, arguments }), named)
    }

    /// `svelteHTML.createElement("name", properties)`, with the attributes its actions add
    /// between them.
    pub(super) fn element_call(
        &mut self,
        name: Span,
        start: u32,
        attributes: Range,
        actions: &[NodeIdentifier],
        properties: NodeIdentifier,
    ) -> NodeIdentifier {
        // svelte-check starts a finding on all of an element's attributes at its name's last
        // character, or at a `<svelte:element>`'s `<`, and ends it with the last attribute.
        let tag = name.text(self.source);
        let open = match tag {
            "svelte:element" => Some(Span::new(start, start + 1)),
            _ if tag.starts_with("svelte:") => None,
            _ => tag
                .chars()
                .next_back()
                .map(|last| Span::new(name.end_offset - last.len_utf8() as u32, name.end_offset)),
        };
        let properties = match open {
            Some(open) => self.tree.push(Node::Located {
                value: properties,
                open,
                close: None,
            }),
            None => properties,
        };
        let enhancers = (!actions.is_empty()).then(|| {
            let callee = self.tree.push(Node::Identifier("__sveltets_2_union"));
            let arguments = self.tree.list(actions);
            self.tree.push(Node::Call { callee, arguments })
        });
        let name = self.element_tag(name, attributes);
        let arguments = match enhancers {
            Some(enhancers) => self.tree.list(&[name, enhancers, properties]),
            None => self.tree.list(&[name, properties]),
        };
        let callee = self.element_callee();
        self.tree.push(Node::Call { callee, arguments })
    }

    /// The tag's name as a string, or the `this` of `<svelte:element>`, as svelte2tsx passes it.
    fn element_tag(&mut self, name: Span, attributes: Range) -> NodeIdentifier {
        let this = (name.text(self.source) == "svelte:element")
            .then(|| {
                self.component.attributes(attributes).iter().find(|a| {
                    a.kind == AttributeKind::Attribute && a.name.text(self.source) == "this"
                })
            })
            .flatten()
            .and_then(|a| match a.value {
                AttributeValue::Parts(parts) => Some(self.component.parts(parts)),
                AttributeValue::True => None,
            });
        let text = match this {
            Some(&[Part::Expression { expression, .. }]) => {
                return self.expression_source(expression, None);
            }
            Some(&[Part::Text(text)]) => text,
            _ => name,
        };
        let text = self.tree.push(Node::Text(text));
        let parts = self.tree.list(&[text]);
        self.tree.push(Node::String {
            parts,
            template: false,
        })
    }

    /// Whether svelte2tsx names a component's instance, which its events, its `let:` and the
    /// children filling its slots read.
    pub(super) fn reads_instance(&self, directives: &Directives, children: Range) -> bool {
        !directives.events.is_empty() || !directives.lets.is_empty() || self.fills_slot(children)
    }

    /// Whether a child of a component, through any blocks, reads a slot of its instance: one
    /// that names the slot it fills, or an element, or a component naming a slot, with a `let:`.
    fn fills_slot(&self, children: Range) -> bool {
        // An absent block branch has no children.
        let Some(children) = children.present() else {
            return false;
        };
        self.component
            .children(children)
            .iter()
            .any(|&child| match *self.component.node(child) {
                TemplateNode::Element {
                    attributes,
                    component,
                    ..
                } => {
                    let (mut slot, mut has_let) = (component.is_none(), false);
                    for attribute in self.component.attributes(attributes) {
                        if self.is_slot(attribute) {
                            if self.slot_text(attribute).is_some() {
                                return true;
                            }
                            slot = true;
                        }
                        has_let |= attribute.kind == AttributeKind::Let;
                    }
                    slot && has_let
                }
                TemplateNode::If {
                    consequent,
                    alternate,
                    ..
                } => self.fills_slot(consequent) || alternate.is_some_and(|a| self.fills_slot(a)),
                TemplateNode::Each { body, fallback, .. } => {
                    self.fills_slot(body) || self.fills_slot(fallback)
                }
                TemplateNode::Key { body, .. } => self.fills_slot(body),
                TemplateNode::Await {
                    pending,
                    then,
                    catch,
                    ..
                } => self.fills_slot(pending) || self.fills_slot(then) || self.fills_slot(catch),
                _ => false,
            })
    }

    /// Whether `attribute` is a `slot` attribute, whatever its value.
    pub(super) fn is_slot(&self, attribute: &Attribute) -> bool {
        attribute.kind == AttributeKind::Attribute && attribute.name.text(self.source) == "slot"
    }

    /// The name of a `slot` attribute that is one text, which svelte2tsx reads as the slot a
    /// component's child fills.
    pub(super) fn slot_text(&self, attribute: &Attribute) -> Option<Span> {
        match attribute.value {
            AttributeValue::Parts(parts) if self.is_slot(attribute) => {
                match self.component.parts(parts) {
                    &[Part::Text(text)] => Some(text),
                    _ => None,
                }
            }
            _ => None,
        }
    }

    /// The slot a component's child, element or component, fills with a text `slot`.
    pub(super) fn filled_slot(&self, attributes: Range) -> Option<Span> {
        (self.component.attributes(attributes).iter()).find_map(|a| self.filler_slot(a))
    }

    /// Whether the element fills a named slot of its parent component.
    pub(super) fn has_slot(&self, attributes: Range) -> bool {
        (self.component.attributes(attributes).iter()).any(|a| self.is_slot(a))
    }

    /// svelte2tsx's `isCustomElement` for a tag without a dash: an `is` with a dash in it.
    pub(super) fn has_custom_is(&self, attributes: Range) -> bool {
        self.component.attributes(attributes).iter().any(|a| {
            a.name.text(self.source) == "is"
                && matches!(a.value, AttributeValue::Parts(parts)
                        if matches!(self.component.parts(parts).first(),
                            Some(Part::Text(text)) if text.text(self.source).contains('-')))
        })
    }

    /// svelte2tsx's `__sveltets_createSlot(name, { … })`, which checks the attributes against
    /// the component's `$$Slots` when it declares one.
    pub(super) fn slot_call(
        &mut self,
        tag_start: u32,
        attributes: Range,
        properties: NodeIdentifier,
    ) -> Result<NodeIdentifier> {
        let named = self
            .component
            .attributes(attributes)
            .iter()
            .find(|a| a.kind == AttributeKind::Attribute && a.name.text(self.source) == "name");
        let name = match named.map(|a| (a, a.value)) {
            // svelte2tsx reports a default slot `$$Slots` lacks at the start of its tag.
            None => self.tree.push(Node::StringLiteralAt {
                value: "default",
                at: tag_start,
            }),
            Some((a, AttributeValue::Parts(parts))) => match self.component.parts(parts) {
                // svelte-check reports a name `$$Slots` lacks at the name.
                [Part::Text(text)] if !text.text(self.source).contains(['"', '\\', '\n', '\r']) => {
                    self.tree.push(Node::QuotedText(*text))
                }
                [Part::Text(text)] => {
                    let text = self.tree.push(Node::Text(*text));
                    let parts = self.tree.list(&[text]);
                    self.tree.push(Node::String {
                        parts,
                        template: false,
                    })
                }
                _ => return Err(refuse("dynamic slot names", a.span)),
            },
            Some((a, AttributeValue::True)) => {
                return Err(refuse("dynamic slot names", a.span));
            }
        };
        let element = self.slot_element(attributes);
        self.slot_elements.push(element);
        let mut callee = self.tree.push(Node::Identifier("__rsvelte_slots"));
        if self.declares_slots() {
            let slots = self.tree.push(Node::Identifier("$$Slots"));
            let arguments = self.tree.list(&[slots]);
            callee = self.tree.push(Node::TypeArguments { callee, arguments });
        }
        let arguments = self.tree.list(&[]);
        let callee = self.tree.push(Node::Call { callee, arguments });
        // svelte2tsx makes this function once, between its ignore comments.
        let callee = self.tree.push(Node::IgnoredRange(callee));
        let arguments = self.tree.list(&[name, properties]);
        Ok(self.tree.push(Node::Call { callee, arguments }))
    }
}
