//! A `<script>` or `<style>` inside an element, which the plugin embeds as it embeds the root ones.

use super::{
    Attribute, AttributeKind, AttributeValue, ElementKind, LayoutInstructionIdentifier, Part,
    Printer, R, Span, TagAttributes, TemplateNode, TemplateNodeIdentifier,
};

impl Printer<'_, '_, '_> {
    /// `embedTag` with `isTopLevel` false: the element's own attributes, and its body formatted
    /// unless a `prettier-ignore` comment comes right before it or its language is one the plugin
    /// keeps. A `<template lang="pug">` takes this path too.
    pub(in super::super) fn nested_tag(
        &mut self,
        identifier: TemplateNodeIdentifier,
        tag: &'static str,
    ) -> R<LayoutInstructionIdentifier> {
        let c = self.c;
        let TemplateNode::Element {
            attributes,
            children,
            start_tag,
            ..
        } = *c.node(identifier)
        else {
            unreachable!("an element")
        };
        let attributes = attributes.get(&c.attributes);
        // The parser reads a script's or a style's body as one text node, the part the plugin
        // snips; a template's `printRaw` runs from its first child to its last.
        let content = match c.children(children) {
            [text] => c.node(*text).span(),
            [first, .., last] if tag == "template" => Span::new(
                c.node(*first).span().start_offset,
                c.node(*last).span().end_offset,
            ),
            _ => Span::new(start_tag.end_offset, start_tag.end_offset),
        };
        let named = self.named(attributes);
        // Embedded, the tag is never printed by `print`, so the comment is consumed here.
        let ignored = std::mem::take(&mut self.ignore.next);
        // Without a Pug plugin the plugin keeps a Pug template's body.
        let body = if ignored || self.unsupported(&named) || tag == "template" {
            self.preformatted(content)
        } else if tag == "script" {
            self.refuse_script_language(&named, content, false)?;
            self.script_body(content)?
        } else {
            self.style_body(content, &named)?
        };
        let many = attributes.len() > 1;
        let mut docs = Vec::with_capacity(attributes.len() + 1);
        for a in attributes {
            let line = self.attribute_line(many);
            let document = self.attribute(a, ElementKind::Regular)?;
            docs.push(self.cat(&[line, document]));
        }
        Ok(self.embed_tag(tag, docs, body))
    }

    /// The plugin's `isPugTemplate`, for a `<template>`'s attributes.
    pub(in super::super) fn is_pug(&self, attributes: &[Attribute]) -> bool {
        self.language(&self.named(attributes))
            .is_some_and(|(_, language)| language == "pug")
    }

    /// The attributes as the plugin's `getLangAttribute` reads them.
    fn named(&self, attributes: &[Attribute]) -> Vec<TagAttributes> {
        let c = self.c;
        // `getAttributeValue` takes the first attribute of the name, directives included, and
        // `getAttributeTextValue` the first text of its value.
        attributes
            .iter()
            .map(|a| {
                let value = match a.value {
                    AttributeValue::Parts(parts) if a.kind == AttributeKind::Attribute => {
                        c.parts(parts).iter().find_map(|p| match *p {
                            Part::Text(span) => Some(span),
                            Part::Expression { .. } => None,
                        })
                    }
                    _ => None,
                };
                (a.directive_name(&c.modifiers).unwrap_or(a.name), value)
            })
            .collect()
    }
}
