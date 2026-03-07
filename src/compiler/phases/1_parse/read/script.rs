//! Script tag parsing.
//!
//! # Svelte Compiler Correspondence
//!
//! This module corresponds to:
//! - `svelte/packages/svelte/src/compiler/phases/1-parse/read/script.js`
//!
//! It provides script tag parsing for both instance (`<script>`) and module
//! (`<script context="module">` or `<script module>`) scripts.

use compact_str::CompactString;

use crate::ast::template::{
    AttributeValue, AttributeValuePart, Script, ScriptContext, ScriptType, TemplateNode, Text,
};
use crate::error::ParseResult;

use super::super::parser::Parser;

impl Parser<'_> {
    /// Merge attribute value parts into a single Text for script/style tags.
    /// This is needed because {curly braces} in quoted attribute values are NOT expressions.
    pub fn merge_attribute_parts_to_text(
        &self,
        parts: &[AttributeValuePart],
    ) -> Vec<AttributeValuePart> {
        if parts.len() <= 1 {
            // No merging needed
            return parts.to_vec();
        }

        // Find the overall range and merge the content
        let first_start = match parts.first() {
            Some(AttributeValuePart::Text(t)) => t.start,
            Some(AttributeValuePart::ExpressionTag(e)) => e.start,
            None => return vec![],
        };
        let last_end = match parts.last() {
            Some(AttributeValuePart::Text(t)) => t.end,
            Some(AttributeValuePart::ExpressionTag(e)) => e.end,
            None => return vec![],
        };

        // Get the raw content from the original source
        let raw = &self.source[first_start as usize..last_end as usize];

        vec![AttributeValuePart::Text(Text {
            start: first_start,
            end: last_end,
            raw: CompactString::from(raw),
            data: CompactString::from(raw),
        })]
    }

    /// Parse a `<script>` tag and store it in instance_script or module_script.
    pub fn parse_script_tag(
        &mut self,
        start: usize,
        attributes: Vec<crate::ast::Attribute>,
    ) -> ParseResult<Option<TemplateNode>> {
        let content_start = self.index;

        // Find the closing </script> tag (with optional whitespace before >)
        while !self.is_eof() && !self.is_valid_closing_tag("</script") {
            self.advance();
        }

        let content_end = self.index;
        let script_content = &self.source[content_start..content_end];

        // Consume </script followed by optional whitespace and >
        if self.match_str("</script") {
            self.advance_by(8); // consume '</script'
            // Skip whitespace before >
            while !self.is_eof() && self.current_char() != '>' {
                self.advance();
            }
            self.eat_optional(">"); // consume '>'
        } else if self.is_eof() {
            // Script tag was not closed - check if there's actual content
            // If there's HTML content in the script, it's element_unclosed
            // If it's empty/only whitespace at EOF, it's unexpected_eof
            let has_html_content = script_content.contains('<') || script_content.contains('{');
            if has_html_content {
                return Err(crate::error::ParseError::svelte(
                    "element_unclosed",
                    "`<script>` was left open",
                    (self.index, self.index),
                ));
            } else {
                return Err(crate::error::ParseError::svelte(
                    "unexpected_eof",
                    "Unexpected end of input",
                    (self.index, self.index),
                ));
            }
        }

        let end = self.index;

        // Determine context and language from attributes
        let mut context = ScriptContext::Default;
        let mut is_typescript = false;
        let mut script_attributes = Vec::new();

        for attr in attributes {
            // Spread attributes on script tags are treated as unknown attributes.
            // Add a dummy attribute with a name that won't match any known attribute,
            // so validate_script_attributes will emit script_unknown_attribute.
            // Corresponds to Svelte's 1-parse/read/script.js L55-62.
            if let crate::ast::Attribute::SpreadAttribute(spread) = &attr {
                script_attributes.push(crate::ast::template::AttributeNode {
                    start: spread.start,
                    end: spread.end,
                    name: compact_str::CompactString::new("{...}"),
                    name_loc: None,
                    value: AttributeValue::True(true),
                });
                continue;
            }
            if let crate::ast::Attribute::Attribute(mut attr_node) = attr {
                // For script tags, merge expression parts back into text
                // because {curly braces} in quoted attribute values are NOT expressions
                if let AttributeValue::Sequence(ref parts) = attr_node.value {
                    let merged = self.merge_attribute_parts_to_text(parts);
                    attr_node.value = AttributeValue::Sequence(merged);
                }

                if attr_node.name.as_str() == "context" {
                    if let AttributeValue::Sequence(parts) = &attr_node.value
                        && let Some(AttributeValuePart::Text(t)) = parts.first()
                    {
                        if t.data.as_str() == "module" {
                            context = ScriptContext::Module;
                        } else {
                            // Invalid context value - only "module" is allowed
                            return Err(crate::error::ParseError::svelte(
                                "script_invalid_context",
                                "If the context attribute is supplied, its value must be \"module\"\nhttps://svelte.dev/e/script_invalid_context",
                                (attr_node.start as usize, attr_node.end as usize),
                            ));
                        }
                    }
                } else if attr_node.name.as_str() == "module" {
                    // `module` attribute (boolean or with value) indicates module context
                    context = ScriptContext::Module;
                    script_attributes.push(attr_node);
                    continue;
                } else if attr_node.name.as_str() == "lang" {
                    if let AttributeValue::Sequence(parts) = &attr_node.value
                        && let Some(AttributeValuePart::Text(t)) = parts.first()
                    {
                        let lang = t.data.as_str();
                        if lang == "ts" || lang == "typescript" {
                            is_typescript = true;
                        }
                    }
                    script_attributes.push(attr_node);
                } else {
                    script_attributes.push(attr_node);
                }
            }
        }

        // Parse the script content as a JavaScript/TypeScript Program
        // Pass any pending leading comments (HTML comments before the script tag)
        // Also pass the script tag start and end positions for loc calculation
        // (Svelte uses locator(start) for loc.start and locator(parser.index) for loc.end)
        //
        // Use self.ts (global TypeScript mode) OR local is_typescript flag.
        // In the official Svelte compiler, if ANY script tag has lang="ts", ALL scripts
        // are parsed as TypeScript (parser.ts is set once globally in the constructor).
        // This is important because instance scripts may use TypeScript syntax like
        // `import type { Foo }` without having their own lang="ts" attribute.
        let use_typescript = self.ts || is_typescript;
        let leading_comments = std::mem::take(&mut self.pending_leading_comments);
        let program = super::super::expression::parse_program(
            script_content,
            content_start,
            self.expression_line_offsets(),
            use_typescript,
            &leading_comments,
            start, // Script tag start position for loc.start
            end,   // Script tag end position (after </script>) for loc.end
        );

        let script = Script {
            node_type: ScriptType::Script,
            start: start as u32,
            end: end as u32,
            context,
            content: program,
            attributes: script_attributes,
        };

        // Check for duplicate scripts
        match context {
            ScriptContext::Default => {
                if self.instance_script.is_some() {
                    return Err(crate::error::ParseError::svelte(
                        "script_duplicate",
                        "A component can only have one instance-level `<script>` element",
                        (start, end),
                    ));
                }
                self.instance_script = Some(script);
            }
            ScriptContext::Module => {
                if self.module_script.is_some() {
                    return Err(crate::error::ParseError::svelte(
                        "script_duplicate",
                        "A component can only have one `<script module>` element",
                        (start, end),
                    ));
                }
                self.module_script = Some(script);
            }
        }

        // Return None - script tags don't appear in the fragment
        Ok(None)
    }
}
