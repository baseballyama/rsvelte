//! Server-side slot element visitor.
//!
//! Generates `$.slot()` calls for `<slot>` elements.
//! Corresponds to SlotElement.js in the official Svelte compiler.

use super::super::ServerCodeGenerator;
use super::super::helpers::prop_string;
use super::super::types::OutputPart;
use crate::ast::template::{Attribute, AttributeValue, AttributeValuePart, SlotElement};
use crate::compiler::phases::phase3_transform::TransformError;

impl<'a> ServerCodeGenerator<'a> {
    pub(crate) fn generate_slot_element(
        &mut self,
        node: &SlotElement,
    ) -> Result<(), TransformError> {
        // Determine the slot name
        // Look for `name="..."` attribute on the slot element
        let mut slot_name = "default".to_string();
        let mut extra_props: Vec<String> = Vec::new();
        let mut spread_exprs: Vec<String> = Vec::new();

        for attr in &node.attributes {
            match attr {
                Attribute::Attribute(a) => {
                    let attr_name = a.name.as_str();
                    if attr_name == "name" {
                        // Extract the slot name value
                        match &a.value {
                            AttributeValue::Sequence(parts) => {
                                if let Some(AttributeValuePart::Text(text)) = parts.first() {
                                    slot_name = text.data.to_string();
                                }
                            }
                            AttributeValue::True(_) => {
                                // name (boolean) - doesn't make sense for slot name
                            }
                            AttributeValue::Expression(expr_tag) => {
                                let start = expr_tag.expression.start().unwrap_or(0) as usize;
                                let end = expr_tag.expression.end().unwrap_or(0) as usize;
                                if end > start && end <= self.source.len() {
                                    slot_name = self.source[start..end].trim().to_string();
                                }
                            }
                        }
                    } else if attr_name != "slot" {
                        // Other attributes become props
                        let value_expr = self.build_attribute_value_expr(&a.value);
                        extra_props.push(prop_string(attr_name, &value_expr));
                    }
                }
                Attribute::SpreadAttribute(spread) => {
                    let start = spread.expression.start().unwrap_or(0) as usize;
                    let end = spread.expression.end().unwrap_or(0) as usize;
                    if end > start && end <= self.source.len() {
                        let expr = self.source[start..end].trim().to_string();
                        let expr = self.transform_store_refs(&expr);
                        spread_exprs.push(expr);
                    }
                }
                _ => {}
            }
        }

        // Build the props expression
        let props_expr = if spread_exprs.is_empty() {
            if extra_props.is_empty() {
                "{}".to_string()
            } else {
                format!("{{ {} }}", extra_props.join(", "))
            }
        } else {
            // Use spread_props
            let mut parts = Vec::new();
            if !extra_props.is_empty() {
                parts.push(format!("{{ {} }}", extra_props.join(", ")));
            } else {
                parts.push("{}".to_string());
            }
            for spread in spread_exprs {
                parts.push(spread);
            }
            format!("$.spread_props([{}])", parts.join(", "))
        };

        // Generate fallback body if the slot has children (non-whitespace children).
        // Note: slot fallback content corresponds to SlotElement parent in the official compiler,
        // which does NOT set is_text_first=true, so we do NOT add a <!---> anchor before
        // expression/text content (unlike the root Fragment which does add an anchor).
        let frag_nodes: Vec<_> = node.fragment.nodes.iter().collect();
        let fallback = {
            // generate_children_from_nodes trims whitespace and does NOT add a <!---> anchor
            // for expression-first content (unlike generate_component which does add one).
            let mut child_gen = self.new_child_generator(false);
            match child_gen.generate_children_from_nodes_no_anchor(&frag_nodes)? {
                Some(parts) if !parts.is_empty() => {
                    child_gen.output_parts = parts;
                    Some(child_gen.output_parts)
                }
                _ => None,
            }
        };

        self.output_parts.push(OutputPart::Slot {
            name: slot_name,
            props_expr,
            fallback,
        });

        Ok(())
    }

    /// Build a value expression for an attribute value.
    /// Returns a JavaScript expression string.
    fn build_attribute_value_expr(&self, value: &AttributeValue) -> String {
        match value {
            AttributeValue::True(_) => "true".to_string(),
            AttributeValue::Sequence(parts) => {
                if parts.len() == 1 {
                    match &parts[0] {
                        AttributeValuePart::Text(text) => {
                            // Escape backslashes first, then quotes — otherwise
                            // a `\` in the source would pair with the `\"` we
                            // insert and produce an unterminated string literal.
                            let escaped = text.data.replace('\\', "\\\\").replace('"', "\\\"");
                            format!("\"{}\"", escaped)
                        }
                        AttributeValuePart::ExpressionTag(expr_tag) => {
                            let start = expr_tag.expression.start().unwrap_or(0) as usize;
                            let end = expr_tag.expression.end().unwrap_or(0) as usize;
                            if end > start && end <= self.source.len() {
                                let expr = self.source[start..end].trim();
                                self.transform_store_refs(expr)
                            } else {
                                "undefined".to_string()
                            }
                        }
                    }
                } else {
                    // Template literal for mixed content
                    let mut result = String::from("`");
                    for part in parts {
                        match part {
                            AttributeValuePart::Text(text) => {
                                result.push_str(&text.data.replace('`', "\\`"));
                            }
                            AttributeValuePart::ExpressionTag(expr_tag) => {
                                let start = expr_tag.expression.start().unwrap_or(0) as usize;
                                let end = expr_tag.expression.end().unwrap_or(0) as usize;
                                if end > start && end <= self.source.len() {
                                    let expr = self.source[start..end].trim();
                                    let expr = self.transform_store_refs(expr);
                                    result.push_str(&format!("${{{}}}", expr));
                                }
                            }
                        }
                    }
                    result.push('`');
                    result
                }
            }
            AttributeValue::Expression(expr_tag) => {
                let start = expr_tag.expression.start().unwrap_or(0) as usize;
                let end = expr_tag.expression.end().unwrap_or(0) as usize;
                if end > start && end <= self.source.len() {
                    let expr = self.source[start..end].trim();
                    self.transform_store_refs(expr)
                } else {
                    "undefined".to_string()
                }
            }
        }
    }
}
