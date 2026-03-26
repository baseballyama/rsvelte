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

use crate::ast::js::Expression;
use crate::ast::template::{
    AttributeValue, AttributeValuePart, Script, ScriptContext, ScriptType, TemplateNode, Text,
};
use crate::error::ParseResult;

use super::super::parser::Parser;

/// Ensure a Script's content has been fully parsed from raw_content.
/// This performs the deferred OXC parse. Call this before accessing script.content in analysis.
pub fn ensure_script_parsed(script: &mut Script, _source: &str, line_offsets: &[usize]) {
    if script.raw_content.is_empty() {
        return; // Already parsed or no raw content
    }

    let raw = std::mem::take(&mut script.raw_content);
    let offset = script.content_offset as usize;

    // Collect leading comments from the source before the script tag
    // For now, pass empty - TODO: preserve leading comments from parse phase
    let leading_comments: Vec<String> = Vec::new();

    let program = super::expression::parse_program(
        &raw,
        offset,
        line_offsets,
        script.is_typescript,
        &leading_comments,
        script.start as usize,
        script.end as usize,
    );

    script.content = program;
}

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

        // Use SIMD-accelerated search for </script instead of byte-by-byte scanning
        loop {
            if let Some(offset) = memchr::memmem::find(&self.bytes[self.index..], b"</script") {
                self.index += offset;
                if self.is_valid_closing_tag("</script") {
                    break;
                }
                // Not a valid closing tag (e.g., </scripting), skip past it
                self.index += 8;
            } else {
                self.index = self.bytes.len();
                break;
            }
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
                    script_attributes.push(*attr_node);
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
                    script_attributes.push(*attr_node);
                } else {
                    script_attributes.push(*attr_node);
                }
            }
        }

        let use_typescript = self.ts || is_typescript;
        let leading_comments = std::mem::take(&mut self.pending_leading_comments);

        let script = if self.options.defer_script_parse {
            // Defer script content parsing to analysis phase for faster parse().
            let placeholder = Expression::from_node(crate::ast::typed_expr::JsNode::Program {
                start: content_start as u32,
                end: (content_start + script_content.len()) as u32,
                loc: None,
                body: Vec::new(),
                source_type: CompactString::from("module"),
                leading_comments: None,
                trailing_comments: None,
            });
            Script {
                node_type: ScriptType::Script,
                start: start as u32,
                end: end as u32,
                context,
                content: placeholder,
                attributes: script_attributes,
                raw_content: script_content.to_string(),
                content_offset: content_start as u32,
                is_typescript: use_typescript,
            }
        } else {
            // Eager parsing (default for tests and direct AST comparison)
            let program = super::super::expression::parse_program(
                script_content,
                content_start,
                self.expression_line_offsets(),
                use_typescript,
                &leading_comments,
                start,
                end,
            );
            Script {
                node_type: ScriptType::Script,
                start: start as u32,
                end: end as u32,
                context,
                content: program,
                attributes: script_attributes,
                raw_content: String::new(),
                content_offset: content_start as u32,
                is_typescript: use_typescript,
            }
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
