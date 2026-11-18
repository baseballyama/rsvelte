//! The attributes and directives of one element, a component or a slot, before its call.

use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{Attribute, AttributeKind, AttributeValue, Part, Range};

use super::binding::Binding;
use super::directive::Directives;
use super::{Builder, Node, NodeIdentifier, Result, refuse};

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
    /// The `>` that ends the start tag, unless it is self-closing.
    pub(super) closes_at: Option<u32>,
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
    /// The prop and the directive of a component's `bind:`, which svelte2tsx checks is bindable.
    fn bindable(&self, host: &Host, attribute: &Attribute) -> Option<(Span, Span)> {
        let name = attribute
            .directive_name(&self.component.modifiers)
            .filter(|name| host.is_component() && name.text(self.source) != "this")?;
        Some((name, attribute.span))
    }

    /// svelte2tsx keeps a component's CSS custom property out of its props, and an element's
    /// `data-` attribute, other than a `data-sveltekit-` one, out of its types.
    fn wrapper(&self, host: &Host, attribute: &Attribute) -> Option<&'static str> {
        let name = attribute.name.text(self.source);
        if host.is_component() && name.starts_with("--") {
            Some("__sveltets_2_cssProp")
        } else if host.intrinsic()
            && attribute.kind == AttributeKind::Attribute
            && name.starts_with("data-")
            && !name.starts_with("data-sveltekit-")
        {
            Some("__sveltets_2_empty")
        } else {
            None
        }
    }

    /// `property` after the comments between `after` and `attribute`, which svelte2tsx writes
    /// before it, except before a shorthand `{x}`.
    fn commented(
        &mut self,
        after: u32,
        attribute: &Attribute,
        property: NodeIdentifier,
    ) -> NodeIdentifier {
        // Nearly every component has none, so the common case does no search.
        let comments = &self.component.tag_comments;
        if comments.is_empty() {
            return property;
        }
        let starts_before = |at: u32| comments.partition_point(|comment| comment.start_offset < at);
        let gap = &comments[starts_before(after)..starts_before(attribute.span.start_offset)];
        let (Some(first), Some(last)) = (gap.first(), gap.last()) else {
            return property;
        };
        let comments = Span::new(first.start_offset, last.end_offset);
        let name = attribute.name.start_offset;
        let shorthand = attribute.kind == AttributeKind::Attribute
            && matches!(
                attribute.value,
                AttributeValue::Parts(parts) if matches!(
                    self.component.parts(parts),
                    [Part::Expression { span, .. }] if span.start_offset <= name
                )
            );
        if shorthand {
            return property;
        }
        self.tree.push(Node::Commented {
            comments,
            value: property,
        })
    }

    /// Pushes the properties, collects the directives, and returns the bindings.
    pub(super) fn element_attributes(
        &mut self,
        host: &Host,
        attributes: Range,
        directives: &mut Directives,
    ) -> Result<Vec<Binding>> {
        let tag = host.name.text(self.source);
        // svelte2tsx keeps the attributes of a `<svelte:…>` tag other than `<svelte:element>` as
        // written, as Svelte's tree gives that tag a type of its own.
        let plain = host.intrinsic() && (!tag.starts_with("svelte:") || tag == "svelte:element");
        let mut bindings = Vec::new();
        let mut after = host.name.end_offset;
        for attribute in self.component.attributes(attributes) {
            let previous = std::mem::replace(&mut after, attribute.span.end_offset);
            match attribute.kind {
                AttributeKind::Bind => {
                    directives.bindable.extend(self.bindable(host, attribute));
                    bindings.push(self.binding(
                        attribute,
                        tag,
                        host.is_component(),
                        host.intrinsic(),
                    )?);
                }
                AttributeKind::On if host.intrinsic() => {
                    let property = self.event_property(attribute)?;
                    let property = self.commented(previous, attribute, property);
                    self.scratch.push(property);
                }
                AttributeKind::On if host.is_component() => {
                    let event = self.component_event(attribute)?;
                    directives.events.push(event);
                }
                AttributeKind::Let
                    if self.has_slot(attributes)
                        || (host.intrinsic() && self.slot_parent.is_some()) =>
                {
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
                    return Err(refuse("directives", attribute.span));
                }
                AttributeKind::Class if !host.is_component() => {}
                AttributeKind::Class if host.is_component() => {
                    return Err(refuse("component directives", attribute.span));
                }
                // svelte2tsx passes a slot's name, and a dynamic component, outside the props.
                AttributeKind::Attribute
                    if (host.kind == Kind::Slot && attribute.name.text(self.source) == "name")
                        || (host.dynamic && attribute.name.text(self.source) == "this") => {}
                // A component's child names the slot it fills with a text `slot`, which svelte2tsx
                // reads as that slot rather than as a property.
                AttributeKind::Attribute
                    if host.intrinsic()
                        && self.component_parent
                        && attribute.name.text(self.source) == "slot"
                        && matches!(
                            attribute.value,
                            AttributeValue::Parts(parts)
                                if matches!(self.component.parts(parts), [Part::Text(_)])
                        ) => {}
                _ => {
                    let mut property = self.attribute(
                        attribute,
                        plain,
                        matches!(host.kind, Kind::Element { custom: true }),
                        host.closes_at,
                    );
                    if let Some(wrapper) = self.wrapper(host, attribute) {
                        let properties = self.tree.list(&[property]);
                        let object = self.tree.push(Node::Object { properties });
                        let callee = self.tree.push(Node::Identifier(wrapper));
                        let arguments = self.tree.list(&[object]);
                        let value = self.tree.push(Node::Call { callee, arguments });
                        let at = attribute.span.start_offset;
                        let dots = Span::new(at, at);
                        property = self.tree.push(Node::Spread { value, dots });
                    }
                    let property = self.commented(previous, attribute, property);
                    self.scratch.push(property);
                }
            }
        }
        Ok(bindings)
    }
}
