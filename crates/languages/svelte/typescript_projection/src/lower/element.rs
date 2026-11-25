//! An element or component: its call, with what svelte2tsx writes around it, and its children.

use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{AttributeKind, AttributeValue, Part, Range};
use rsvelte_typescript_tree::{ExpressionIdentifier, node_span};

use super::{Builder, Result, attributes, binding, directive, refuse, source_expression};
use crate::syntax_tree::{Node, NodeIdentifier};

/// Whether svelte2tsx writes the tag as an element, which `svelteHTML` types.
fn is_element(tag: &str) -> bool {
    matches!(
        tag,
        "svelte:head"
            | "svelte:options"
            | "svelte:window"
            | "svelte:body"
            | "svelte:document"
            | "svelte:fragment"
            | "svelte:element"
            | "svelte:boundary"
    ) || (tag.starts_with(|c: char| c.is_ascii_lowercase()) && !tag.starts_with("svelte:"))
}

impl Builder<'_> {
    pub(super) fn element(
        &mut self,
        name: Span,
        (start_tag, self_closing): (Span, bool),
        component: Option<ExpressionIdentifier>,
        attributes: Range,
        children: Range,
        end_name: Option<Span>,
    ) -> Result<NodeIdentifier> {
        let tag = name.text(self.source);
        // svelte2tsx passes `this` of these outside the props.
        let dynamic = matches!(tag, "svelte:component" | "svelte:element");
        let component = match component {
            None if tag == "svelte:component" => Some(self.dynamic_component(name, attributes)?),
            component => component,
        };
        let is_component = component.is_some() || tag == "svelte:self";
        if !is_component && !is_element(tag) {
            return Err(refuse("svelte: elements", name));
        }
        let slot = !is_component && tag == "slot";
        // An element whose attributes svelte2tsx checks against the intrinsic element types.
        let intrinsic = !is_component && !slot;
        let custom_element = intrinsic && (tag.contains('-') || self.has_custom_is(attributes));
        let start = self.scratch.len();
        self.scratch.reserve(attributes.len as usize + 1);
        if is_component
            && let Some(at) = self.implicit_children(name, start_tag, attributes, children)
        {
            self.scratch
                .push(self.tree.push(Node::ImplicitChildren(at)));
        }
        let mut directives = std::mem::take(&mut self.directives);
        directives.clear();
        let kind = match (is_component, slot) {
            (true, _) => attributes::Kind::Component,
            (false, true) => attributes::Kind::Slot,
            (false, false) => attributes::Kind::Element {
                custom: custom_element,
            },
        };
        let host = attributes::Host {
            name,
            kind,
            dynamic,
            closes_at: (!self_closing).then_some(start_tag.end_offset - 1),
        };
        let bindings = self.element_attributes(&host, attributes, &mut directives)?;
        let read = self.last_let_read(name, start_tag, attributes);
        self.slot_let(attributes, read, &mut directives)?;
        // `<svelte:boundary>`'s snippets are its props, as a component's are.
        let snippet_props = is_component || tag == "svelte:boundary";
        let snippets = self.snippet_props(children, snippet_props)?;
        let properties = self.finish_list(start);
        let properties = self.tree.push(Node::Object { properties });
        let instance = is_component && self.reads_instance(&directives, children);
        let (call, named) = if is_component {
            // svelte-check reports a finding on all of a component's props at its name.
            let properties = self.tree.push(Node::Located {
                value: properties,
                open: name,
                close: Some(name),
            });
            let component = match component {
                Some(component) => self.expression_source(component, None),
                None => self.tree.push(Node::AnyComponent),
            };
            self.component_call(
                component,
                properties,
                snippets,
                instance || !directives.bindable.is_empty(),
                bindings
                    .iter()
                    .any(|b| matches!(b, binding::Binding::This { .. })),
            )
        } else if slot {
            (
                self.slot_call(start_tag.start_offset, attributes, properties)?,
                None,
            )
        } else {
            (
                self.element_call(
                    name,
                    start_tag.start_offset,
                    attributes,
                    &directives.action_names,
                    properties,
                ),
                None,
            )
        };
        let named = named.map(|component| (component, name, instance));
        let after = (bindings, snippets, read);
        let (lets, instance) = self.after_call(call, named, after, &directives);
        let slot_let = directives.slot_let.take();
        self.directives = directives;
        self.class_expressions(attributes);
        let parent = std::mem::replace(&mut self.slot_parent, instance);
        let component_parent = std::mem::replace(&mut self.component_parent, is_component);
        // svelte2tsx types `<svelte:component>` and `<svelte:self>` as any component.
        let lets_of = is_component.then_some((component.filter(|_| !dynamic), attributes));
        self.element_depth += 1;
        let lowered = self.element_children(children, snippet_props, lets, lets_of);
        self.element_depth -= 1;
        lowered?;
        self.slot_parent = parent;
        self.component_parent = component_parent;
        Ok(self.close_element(start, end_name, slot_let))
    }

    /// The element's block from `start`, after its end tag's name, inside a block that reads the
    /// filled slot's `let:` first.
    fn close_element(
        &mut self,
        start: usize,
        end_name: Option<Span>,
        slot_let: Option<NodeIdentifier>,
    ) -> NodeIdentifier {
        if let Some(end_name) = end_name {
            let name = self.source(
                oxc_span::Span::new(end_name.start_offset, end_name.end_offset),
                None,
            );
            self.scratch.push(self.tree.push(Node::Statement(name)));
        }
        let body = self.finish_list(start);
        let block = self.tree.push(Node::Block { body });
        // svelte2tsx reads the filled slot's `let:` in a block around the element's, where no name
        // the element declares shadows its parent's.
        match slot_let {
            Some(slot_let) => {
                let body = self.tree.list(&[slot_let, block]);
                self.tree.push(Node::Block { body })
            }
            None => block,
        }
    }

    /// The call with what svelte2tsx writes around it: actions before, then bindings, directive
    /// checks, a component's events, the names of its snippet props and its `let:` bindings.
    /// `named` is the named component, its tag, and whether svelte2tsx names its instance.
    fn after_call(
        &mut self,
        call: NodeIdentifier,
        named: Option<(NodeIdentifier, Span, bool)>,
        (bindings, snippets, read): (Vec<binding::Binding>, Range, Option<u32>),
        directives: &directive::Directives,
    ) -> (Option<usize>, Option<directive::Constructed>) {
        self.scratch.extend_from_slice(&directives.actions);
        let call = self.bound_call(call, bindings, named.is_some());
        if let Some((component, ..)) = named {
            self.bindable_checks(component, &directives.bindable);
        }
        self.scratch.extend_from_slice(&directives.checks);
        let (Some((component, tag, names_instance)), Some(call)) = (named, call) else {
            return (None, None);
        };
        let instance = directive::Constructed {
            component,
            call,
            tag,
            depth: self.element_depth,
        };
        if names_instance {
            self.declare_instance(instance);
        }
        self.component_events(instance, &directives.events);
        if snippets.len != 0 {
            let declaration = self.tree.push(Node::SnippetNames {
                names: snippets,
                component,
            });
            self.scratch.push(declaration);
        }
        let lets = self.scratch.len();
        self.component_lets(instance, &directives.lets, read);
        ((self.scratch.len() > lets).then_some(lets), Some(instance))
    }

    /// The expressions of `class:` directives, which svelte2tsx checks after the call.
    fn class_expressions(&mut self, attributes: Range) {
        for attribute in self.component.attributes(attributes) {
            if attribute.kind == AttributeKind::Class
                && let AttributeValue::Parts(parts) = attribute.value
                && let [Part::Expression { expression, .. }] = self.component.parts(parts)
            {
                let value = source_expression(node_span(self.expression(*expression)), None);
                self.scratch.push(self.tree.push(Node::Expression(value)));
            }
        }
    }

    /// A component's snippets are its props; an element's come first.
    /// svelte2tsx's block of a component's `let:` bindings, from `lets`, holds its children, and
    /// its scope the names of the `let:` directives of the component with `lets_of`.
    fn element_children(
        &mut self,
        children: Range,
        is_component: bool,
        lets: Option<usize>,
        lets_of: Option<(Option<ExpressionIdentifier>, Range)>,
    ) -> Result<()> {
        let outer = self.slot_scope.len();
        if let Some((component, attributes)) = lets_of {
            self.declare_lets(component, attributes, children, outer);
        }
        if !is_component {
            self.append_matching(children, true)?;
        }
        self.append_matching(children, false)?;
        self.slot_scope.truncate(outer);
        if let Some(lets) = lets {
            let body = self.finish_list(lets);
            self.scratch.push(self.tree.push(Node::Block { body }));
        }
        Ok(())
    }
}
