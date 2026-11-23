//! The component the render function returns: svelte2tsx's function component, isomorphic
//! component or generic component, with the slots the template's `<slot>` elements type.

use rsvelte_svelte_syntax::syntax_tree::{AttributeValue, Part, TemplateNode};

use super::super::{Builder, Node, NodeIdentifier, Range};
use super::{ComponentMode, Contract};
use crate::syntax_tree::Instance;

impl Builder<'_> {
    /// The component the render function returns, of the contract and of the slots the template
    /// lowered: svelte2tsx's function component in runes mode without events or slots, and its
    /// isomorphic component otherwise.
    pub(in crate::lower) fn component(&mut self, contract: Contract) -> (NodeIdentifier, Instance) {
        let Contract {
            props,
            exports,
            bindings,
            mode,
            events,
            generic,
        } = contract;
        let elements = std::mem::take(&mut self.slot_elements);
        // svelte2tsx's `usesSlots`: the template's `<slot>` elements, not `$$Slots` or `$$slots`.
        let slots = !elements.is_empty();
        match (generic, mode, slots || events.any()) {
            (true, ..) => {
                let props = if self.has_default_slot() {
                    let callee = self
                        .tree
                        .push(Node::Identifier("__rsvelte_props_with_children"));
                    let arguments = self.tree.list(&[props]);
                    self.tree.push(Node::TypeArguments { callee, arguments })
                } else {
                    props
                };
                let callee =
                    self.instantiated("__rsvelte_export_generic", &[props, exports, bindings]);
                let events =
                    self.events_value(events, events.strict || mode == ComponentMode::Runes);
                let slots = self.slots_value(elements);
                let arguments = self.tree.list(&[events, slots]);
                let component = self.tree.push(Node::Call { callee, arguments });
                (component, Instance::Returned)
            }
            (false, ComponentMode::Runes, false) => {
                let component =
                    self.instantiated("__rsvelte_export_component", &[props, exports, bindings]);
                (component, Instance::Returned)
            }
            (false, ComponentMode::Runes, true) | (false, ComponentMode::Legacy, _) => {
                let helper = if slots {
                    "__rsvelte_export_isomorphic_slots"
                } else {
                    "__rsvelte_export_isomorphic"
                };
                let callee = self.instantiated(helper, &[props, exports, bindings]);
                let slots = self.slots_value(elements);
                let events = self.events_value(events, events.strict);
                let arguments = self.tree.list(&[events, slots]);
                let component = self.tree.push(Node::Call { callee, arguments });
                (component, Instance::Constructed)
            }
        }
    }

    /// The slots value svelte2tsx's render function returns: `$$Slots`, or else the object each
    /// `<slot>`'s attributes make.
    fn slots_value(&mut self, elements: Vec<Range>) -> NodeIdentifier {
        if self.declares_slots() {
            let slots = self.tree.push(Node::Identifier("$$Slots"));
            self.instantiated("__rsvelte_value", &[slots])
        } else if elements.is_empty() {
            self.tree.push(Node::Object {
                properties: Range::default(),
            })
        } else {
            let slots = self.slot_def(elements);
            slots.unwrap_or_else(|| self.untyped_prop())
        }
    }

    /// `helper<type_arguments>()`.
    fn instantiated(
        &mut self,
        helper: &'static str,
        type_arguments: &[NodeIdentifier],
    ) -> NodeIdentifier {
        let callee = self.tree.push(Node::Identifier(helper));
        let arguments = self.tree.list(type_arguments);
        let callee = self.tree.push(Node::TypeArguments { callee, arguments });
        self.tree.push(Node::Call {
            callee,
            arguments: Range::default(),
        })
    }

    /// svelte2tsx's `slots` has a `default` key: a `<slot>` without a `name`, or named `default`.
    fn has_default_slot(&self) -> bool {
        self.component.nodes.iter().any(|node| match *node {
            TemplateNode::Element {
                name,
                component: None,
                attributes,
                ..
            } if name.text(self.source) == "slot" => {
                let named = self
                    .component
                    .attributes(attributes)
                    .iter()
                    .find(|a| a.name.text(self.source) == "name");
                named.is_none_or(|a| {
                    matches!(a.value, AttributeValue::Parts(parts)
                        if matches!(self.component.parts(parts).first(),
                            Some(Part::Text(text)) if text.text(self.source) == "default"))
                })
            }
            _ => false,
        })
    }
}
