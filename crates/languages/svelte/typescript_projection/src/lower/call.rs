//! The calls that check an element, a component or a slot against its attributes.

use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{AttributeKind, AttributeValue, Part, Range};
use rsvelte_typescript_tree::ExpressionIdentifier;

use super::{Builder, Node, NodeIdentifier, Result, Unsupported};

impl Builder<'_> {
    /// `__rsvelte_component(C)(internals, properties)`, with the name it gives the component when
    /// the snippets' names are declared from its props or its instance is checked.
    pub(super) fn component_call(
        &mut self,
        component: ExpressionIdentifier,
        properties: NodeIdentifier,
        snippets: Range,
        name_it: bool,
    ) -> (NodeIdentifier, Option<NodeIdentifier>) {
        let component = self.expression_source(component, None);
        let callee = self.tree.push(Node::Identifier("__rsvelte_component"));
        let arguments = self.tree.list(&[component]);
        let mut callee = self.tree.push(Node::Call { callee, arguments });
        let named = (snippets.len != 0 || name_it).then(|| {
            let name = self.component_name();
            let value = callee;
            self.scratch
                .push(self.tree.push(Node::Const { name, value }));
            name
        });
        if let Some(name) = named {
            callee = name;
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
        actions: &[NodeIdentifier],
        properties: NodeIdentifier,
    ) -> NodeIdentifier {
        let enhancers = (!actions.is_empty()).then(|| {
            let callee = self.tree.push(Node::Identifier("__sveltets_2_union"));
            let arguments = self.tree.list(actions);
            self.tree.push(Node::Call { callee, arguments })
        });
        let name = self.tree.push(Node::Text(name));
        let parts = self.tree.list(&[name]);
        let name = self.tree.push(Node::String {
            parts,
            template: false,
        });
        let arguments = match enhancers {
            Some(enhancers) => self.tree.list(&[name, enhancers, properties]),
            None => self.tree.list(&[name, properties]),
        };
        let callee = self.element_callee();
        self.tree.push(Node::Call { callee, arguments })
    }

    /// Whether the element fills a named slot of its parent component.
    pub(super) fn has_slot(&self, attributes: Range) -> bool {
        self.component
            .attributes(attributes)
            .iter()
            .any(|a| a.kind == AttributeKind::Attribute && a.name.text(self.source) == "slot")
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
        attributes: Range,
        properties: NodeIdentifier,
    ) -> Result<NodeIdentifier> {
        let named = self
            .component
            .attributes(attributes)
            .iter()
            .find(|a| a.kind == AttributeKind::Attribute && a.name.text(self.source) == "name");
        let name = match named.map(|a| (a, a.value)) {
            None => self.tree.push(Node::StringLiteral("default")),
            Some((a, AttributeValue::Parts(parts))) => match self.component.parts(parts) {
                &[Part::Text(text)] => {
                    let text = self.tree.push(Node::Text(text));
                    let parts = self.tree.list(&[text]);
                    self.tree.push(Node::String {
                        parts,
                        template: false,
                    })
                }
                _ => return Err(Unsupported::at("dynamic slot names", a.span)),
            },
            Some((a, AttributeValue::True)) => {
                return Err(Unsupported::at("dynamic slot names", a.span));
            }
        };
        let mut callee = self.tree.push(Node::Identifier("__rsvelte_slots"));
        if self.declares("$$Slots") {
            let slots = self.tree.push(Node::Identifier("$$Slots"));
            let arguments = self.tree.list(&[slots]);
            callee = self.tree.push(Node::TypeArguments { callee, arguments });
        }
        let arguments = self.tree.list(&[]);
        let callee = self.tree.push(Node::Call { callee, arguments });
        let arguments = self.tree.list(&[name, properties]);
        Ok(self.tree.push(Node::Call { callee, arguments }))
    }
}
