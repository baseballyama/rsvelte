//! Svelte options parsing.
//!
//! # Svelte Compiler Correspondence
//!
//! This module corresponds to:
//! - `svelte/packages/svelte/src/compiler/phases/1-parse/read/options.js`
//!
//! It parses `<svelte:options>` elements and extracts compiler options such as
//! `runes`, `customElement`, `accessors`, `immutable`, etc.

use crate::ast::template::{
    AttributeValue, AttributeValuePart, CustomElementOptions, SvelteOptions, TemplateNode,
};
use crate::error::{ParseError, ParseResult};

use super::super::parser::Parser;

impl Parser<'_> {
    /// Parse svelte:options element and extract options.
    ///
    /// Note: This is called after the opening tag name and attributes have been parsed,
    /// and the `>` has already been consumed.
    pub fn parse_svelte_options(
        &mut self,
        start: usize,
        attributes: Vec<crate::ast::Attribute>,
        self_closing: bool,
    ) -> ParseResult<Option<TemplateNode>> {
        // If self-closing, no need to parse children or closing tag
        if !self_closing {
            // Check for children content before the closing tag
            // Skip whitespace only, then check if we're at a closing tag
            let content_start = self.index;
            self.skip_whitespace();

            // Check if there's content before the closing tag
            if self.match_str("</svelte:options") {
                // No children, just closing tag - consume it
                self.advance_by("</svelte:options".len());
                self.skip_whitespace();
                self.eat(">");
            } else if !self.is_eof() {
                // There's content - this is an error
                // First, find where the content ends
                while !self.is_eof() && !self.match_str("</svelte:options") {
                    self.advance_by(1);
                }
                let content_end = self.index;

                // Check if we found meaningful (non-whitespace) content
                let content = &self.source[content_start..content_end];
                if !content.trim().is_empty() {
                    return Err(ParseError::svelte(
                        "svelte_meta_invalid_content",
                        "<svelte:options> cannot have children",
                        (content_start, content_end),
                    ));
                }

                // Consume the closing tag
                if self.match_str("</svelte:options") {
                    self.advance_by("</svelte:options".len());
                    self.skip_whitespace();
                    self.eat(">");
                }
            }
        }

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
                        // runes (boolean attribute) or runes={true} or runes={false}
                        match &attr_node.value {
                            AttributeValue::True(_) => {
                                // Boolean attribute without value means true
                                runes = Some(true);
                            }
                            AttributeValue::Expression(expr_tag) => {
                                if let Some(val) = expr_tag.expression.as_json().get("value") {
                                    if let Some(b) = val.as_bool() {
                                        runes = Some(b);
                                    }
                                }
                            }
                            _ => {}
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
