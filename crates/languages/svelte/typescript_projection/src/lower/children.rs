//! svelte2tsx's `handleImplicitChildren`: the `children` prop a component's content passes.

use oxc_span::GetSpan;
use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{
    AttributeKind, AttributeValue, Part, Range, TemplateNode,
};
use rsvelte_typescript_tree::{ExpressionIdentifier, document_span};

use super::{Builder, Node, NodeIdentifier, Result, refuse};

impl Builder<'_> {
    /// Where the `children` prop maps, when the content passes one: anything but whitespace,
    /// comments, `<slot>`, snippets and elements for another slot.
    pub(super) fn implicit_children(
        &self,
        name: Span,
        start_tag: Span,
        attributes: Range,
        children: Range,
    ) -> Option<u32> {
        let passes = self.component.children(children).iter().any(|&child| {
            match *self.component.node(child) {
                TemplateNode::Text { span } => !span
                    .text(self.source)
                    .trim_matches(is_ecmascript_whitespace)
                    .is_empty(),
                TemplateNode::Comment { .. } | TemplateNode::Snippet { .. } => false,
                TemplateNode::Element {
                    name, attributes, ..
                } => name.text(self.source) != "slot" && !self.for_another_slot(attributes),
                _ => true,
            }
        });
        passes.then(|| self.children_position(name, start_tag, attributes))
    }

    /// A `slot` attribute whose value does not start with the text `default`.
    fn for_another_slot(&self, attributes: Range) -> bool {
        self.component.attributes(attributes).iter().any(|a| {
            a.kind == AttributeKind::Attribute
                && a.name.text(self.source) == "slot"
                && !matches!(a.value, AttributeValue::Parts(parts)
                    if matches!(self.component.parts(parts).first(),
                        Some(Part::Text(text)) if text.text(self.source) == "default"))
        })
    }

    /// svelte2tsx's `transform` writes the prop over the character after the whitespace that
    /// follows the tag name, unless a move starts there or the tag ends; else it appends the prop
    /// after the moves, where it maps to the last space a removed run is written as, or without
    /// one to the tag name's last character.
    fn children_position(&self, name: Span, start_tag: Span, attributes: Range) -> u32 {
        let tag = self.start_tag(name, start_tag, attributes);
        let overwritten = tag.after(name.end_offset);
        if self.source[name.end_offset as usize..].starts_with(is_ecmascript_whitespace)
            && tag.extended(overwritten) > overwritten
        {
            return overwritten;
        }
        tag.last_space()
            .unwrap_or_else(|| tag.before(name.end_offset))
    }
}

impl Builder<'_> {
    /// svelte2tsx's `addImplicitSnippetProp`: each `{#snippet}` among a component's children is a
    /// prop after the attributes. Returns the snippets' names.
    pub(super) fn snippet_props(&mut self, children: Range, is_component: bool) -> Result<Range> {
        if !is_component {
            return Ok(Range::default());
        }
        let mut names = Vec::new();
        for &child in self.component.children(children) {
            let TemplateNode::Snippet {
                name,
                type_parameters,
                parameters,
                body,
                span,
                ..
            } = *self.component.node(child)
            else {
                continue;
            };
            if type_parameters.is_some() {
                return Err(refuse("generic snippets", span));
            }
            let javascript = &self.component.javascript;
            let at = javascript.get_expression(name).span();
            let parameters = Some(javascript.get_parameters(parameters).span);
            let name = self.source(at, None);
            let parameters = parameters.map(|at| self.source(at, None));
            let body = self.snippet_body(body)?;
            let property = self.tree.push(Node::SnippetProperty {
                name,
                parameters,
                body,
            });
            self.scratch.push(property);
            names.push(self.tree.push(Node::UnmappedSource(document_span(at))));
        }
        Ok(self.tree.list(&names))
    }

    /// A snippet's body, whose elements svelte2tsx reads as having no parent element, so that
    /// the depth it names instances by starts again.
    pub(super) fn snippet_body(&mut self, body: Range) -> Result<Range> {
        let component_parent = std::mem::replace(&mut self.component_parent, false);
        let depth = std::mem::replace(&mut self.element_depth, 0);
        let body = self.children(body);
        self.component_parent = component_parent;
        self.element_depth = depth;
        body
    }

    /// The generated name of a component whose snippets' names are declared from its props.
    pub(super) fn component_instance_name(&mut self) -> NodeIdentifier {
        if let Some(name) = self.component_instance_name {
            return name;
        }
        let name = self.unused_name("__rsvelte_component_");
        self.component_instance_name = Some(name);
        name
    }

    /// The expression of `<svelte:component this={…}>`, which svelte2tsx checks as a component.
    pub(super) fn dynamic_component(
        &self,
        name: Span,
        attributes: Range,
    ) -> Result<ExpressionIdentifier> {
        self.component
            .attributes(attributes)
            .iter()
            .find(|a| a.kind == AttributeKind::Attribute && a.name.text(self.source) == "this")
            .and_then(|a| match a.value {
                AttributeValue::Parts(parts) => match self.component.parts(parts) {
                    &[Part::Expression { expression, .. }] => Some(expression),
                    _ => None,
                },
                AttributeValue::True => None,
            })
            .ok_or_else(|| refuse("svelte: elements", name))
    }
}
