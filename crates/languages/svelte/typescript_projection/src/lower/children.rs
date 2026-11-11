//! svelte2tsx's `handleImplicitChildren`: the `children` prop a component's content passes.

use oxc_span::GetSpan;
use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{
    AttributeKind, AttributeValue, Part, Range, TemplateNode,
};

use super::{Builder, Node, NodeIdentifier, Result, Unsupported};

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
    /// follows the tag name, unless an attribute's name starts there or the tag ends; else it
    /// appends the prop, which then maps to the last character mapped before it.
    fn children_position(&self, name: Span, start_tag: Span, attributes: Range) -> u32 {
        let attributes = self.component.attributes(attributes);
        let after_name = name.end_offset as usize;
        if let Some(space) = self.source[after_name..].chars().next()
            && is_ecmascript_whitespace(space)
        {
            let overwritten = (after_name + space.len_utf8()) as u32;
            let named_there = attributes.iter().any(|a| {
                a.kind == AttributeKind::Attribute
                    && !a.shorthand
                    && a.span.start_offset == overwritten
            });
            if overwritten + 1 < start_tag.end_offset && !named_there {
                return overwritten;
            }
        }
        let last_value = attributes.iter().rev().find(|a| {
            a.kind == AttributeKind::Attribute
                && !a.shorthand
                && matches!(a.value, AttributeValue::Parts(_))
        });
        last_value.map_or_else(
            || {
                let last = name.text(self.source).chars().next_back();
                name.end_offset - last.map_or(0, |c| c.len_utf8() as u32)
            },
            |a| a.name.end_offset + 1,
        )
    }
}

impl Builder<'_> {
    /// svelte2tsx's `addImplicitSnippetProp`: each `{#snippet}` among a component's children is a
    /// prop after the attributes. Returns the snippets' names.
    pub(super) fn snippet_props(&mut self, children: Range) -> Result<Range> {
        let mut names = Vec::new();
        for &child in self.component.children(children) {
            let TemplateNode::Snippet {
                name,
                type_parameters,
                parameters,
                body,
                span,
            } = *self.component.node(child)
            else {
                continue;
            };
            if type_parameters.is_some() {
                return Err(Unsupported::at("generic snippets", span));
            }
            let javascript = &self.component.javascript;
            let name = javascript.get_expression(name).span();
            let parameters = parameters.map(|p| javascript.get_parameters(p).span);
            let name = self.source(name, None);
            let parameters = parameters.map(|at| self.source(at, None));
            let body = self.children(body)?;
            let property = self.tree.push(Node::SnippetProperty {
                name,
                parameters,
                body,
            });
            self.scratch.push(property);
            names.push(name);
        }
        Ok(self.tree.list(&names))
    }

    /// The generated name of a component whose snippets' names are declared from its props.
    pub(super) fn component_name(&mut self) -> NodeIdentifier {
        if let Some(name) = self.component_name {
            return name;
        }
        let name = self.unused_name("__rsvelte_component_");
        self.component_name = Some(name);
        name
    }
}
