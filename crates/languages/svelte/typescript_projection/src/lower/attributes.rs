//! The attributes and directives of one element, a component or a slot, before its call.

use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{AttributeKind, Range};

use super::binding::Binding;
use super::directive::Directives;
use super::{Builder, Result, Unsupported};

/// What kind of tag the attributes are on.
#[derive(Clone, Copy, PartialEq, Eq)]
pub(super) enum Kind {
    Component,
    Slot,
    /// Checked against the intrinsic element types.
    Element {
        custom: bool,
    },
}

pub(super) struct Host {
    pub(super) name: Span,
    pub(super) kind: Kind,
    /// `<svelte:component>` or `<svelte:element>`, whose `this` is not a prop.
    pub(super) dynamic: bool,
}

impl Host {
    const fn is_component(&self) -> bool {
        matches!(self.kind, Kind::Component)
    }

    const fn intrinsic(&self) -> bool {
        matches!(self.kind, Kind::Element { .. })
    }
}

impl Builder<'_> {
    /// Pushes the properties, collects the directives, and returns the bindings.
    pub(super) fn element_attributes(
        &mut self,
        host: &Host,
        attributes: Range,
        directives: &mut Directives,
    ) -> Result<Vec<Binding>> {
        let tag = host.name.text(self.source);
        let mut bindings = Vec::new();
        for attribute in self.component.attributes(attributes) {
            match attribute.kind {
                AttributeKind::Bind => {
                    bindings.push(self.binding(
                        attribute,
                        tag,
                        host.is_component(),
                        host.intrinsic(),
                    )?);
                }
                AttributeKind::On if host.intrinsic() => {
                    let property = self.event_property(attribute)?;
                    self.scratch.push(property);
                }
                AttributeKind::On if host.is_component() => {
                    let event = self.component_event(attribute)?;
                    directives.events.push(event);
                }
                AttributeKind::Let if self.has_slot(attributes) => {
                    let property = self.component_let(attribute)?;
                    directives.slot_lets.push(property);
                }
                AttributeKind::Let if host.is_component() && !self.has_slot(attributes) => {
                    let property = self.component_let(attribute)?;
                    directives.lets.push(property);
                }
                AttributeKind::Use
                | AttributeKind::Transition { .. }
                | AttributeKind::Animate
                | AttributeKind::Style
                    if host.intrinsic() =>
                {
                    self.directive(attribute, host.name, directives)?;
                }
                AttributeKind::On
                | AttributeKind::Use
                | AttributeKind::Transition { .. }
                | AttributeKind::Animate
                | AttributeKind::Style
                | AttributeKind::Let => {
                    return Err(Unsupported::at("directives", attribute.span));
                }
                AttributeKind::Class if !host.is_component() => {}
                AttributeKind::Class | AttributeKind::Attach if host.is_component() => {
                    return Err(Unsupported::at("component directives", attribute.span));
                }
                // svelte2tsx passes a slot's name, and a dynamic component, outside the props.
                AttributeKind::Attribute
                    if (host.kind == Kind::Slot && attribute.name.text(self.source) == "name")
                        || (host.dynamic && attribute.name.text(self.source) == "this") => {}
                _ => {
                    let property = self.attribute(
                        attribute,
                        host.intrinsic(),
                        matches!(host.kind, Kind::Element { custom: true }),
                    );
                    self.scratch.push(property);
                }
            }
        }
        Ok(bindings)
    }
}
