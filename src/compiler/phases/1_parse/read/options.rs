//! Svelte options parsing.

use crate::ast::template::{
    AttributeValue, AttributeValuePart, CustomElementOptions, SvelteOptions, TemplateNode,
};
use crate::error::ParseResult;

use super::super::parser::Parser;

impl Parser<'_> {
    /// Parse svelte:options element and extract options.
    pub fn parse_svelte_options(
        &mut self,
        start: usize,
        attributes: Vec<crate::ast::Attribute>,
    ) -> ParseResult<Option<TemplateNode>> {
        let end = self.index as u32;

        // Extract option values from attributes
        let mut runes = None;
        let mut custom_element = None;

        // Convert Vec<Attribute> to Vec<AttributeNode> for storage
        let mut attr_nodes = Vec::new();

        for attr in &attributes {
            if let crate::ast::Attribute::Attribute(attr_node) = attr {
                attr_nodes.push(attr_node.clone());

                match attr_node.name.as_str() {
                    "runes" => {
                        // runes={true} or runes={false}
                        if let AttributeValue::Expression(expr_tag) = &attr_node.value {
                            if let Some(val) = expr_tag.expression.as_json().get("value") {
                                if let Some(b) = val.as_bool() {
                                    runes = Some(b);
                                }
                            }
                        }
                    }
                    "customElement" => {
                        // customElement="tag-name"
                        if let AttributeValue::Sequence(parts) = &attr_node.value {
                            if let Some(AttributeValuePart::Text(text)) = parts.first() {
                                custom_element = Some(CustomElementOptions {
                                    tag: Some(text.data.clone()),
                                    shadow: None,
                                    props: None,
                                    extend: None,
                                });
                            }
                        }
                    }
                    _ => {}
                }
            }
        }

        // Store the options
        self.svelte_options = Some(SvelteOptions {
            start: start as u32,
            end,
            runes,
            immutable: None,
            accessors: None,
            preserve_whitespace: None,
            namespace: None,
            css: None,
            custom_element,
            attributes: attr_nodes,
        });

        // svelte:options doesn't produce a node in the fragment
        Ok(None)
    }
}
