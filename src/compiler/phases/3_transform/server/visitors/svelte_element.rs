//! Server-side svelte:element (dynamic element) visitor.

use super::super::ServerCodeGenerator;
use super::super::helpers::quote_prop_name;
use super::super::types::OutputPart;
use crate::ast::template::{Attribute, SvelteDynamicElement};
use crate::compiler::phases::phase3_transform::TransformError;

impl<'a> ServerCodeGenerator<'a> {
    pub(crate) fn generate_svelte_element(
        &mut self,
        elem: &SvelteDynamicElement,
    ) -> Result<(), TransformError> {
        // Extract the tag expression from the source
        let start = elem.tag.start().unwrap_or(0) as usize;
        let end = elem.tag.end().unwrap_or(0) as usize;

        let tag_expr = if end > start && end <= self.source.len() {
            self.source[start..end].trim().to_string()
        } else {
            // The tag expression might be a synthetic JSON literal (e.g., from this="div")
            // without start/end positions. Check if it's a string value directly.
            let json = elem.tag.as_json();
            if let Some(s) = json.as_str() {
                format!("'{}'", s)
            } else {
                "null".to_string()
            }
        };

        // Generate attributes expression if there are any
        let attrs_expr = self.generate_svelte_element_attrs_expr(elem)?;

        // Generate body content from fragment
        // Use skip_anchor=true because svelte:element children are in a callback
        // and don't need an anchor to prevent text fusion
        let body = self.generate_fragment_body_parts_inner(&elem.fragment, true)?;

        self.output_parts.push(OutputPart::SvelteElement {
            tag_expr,
            attrs_expr,
            body,
        });
        Ok(())
    }

    /// Generate attributes expression for svelte:element.
    /// In the official compiler, non-spread attributes are rendered as inline HTML strings
    /// inside a callback: `() => { $$renderer.push(` attr="value"`); }`
    /// Spread attributes use `$.attributes()` with `${...}` template syntax.
    fn generate_svelte_element_attrs_expr(
        &mut self,
        elem: &SvelteDynamicElement,
    ) -> Result<Option<String>, TransformError> {
        // Check if we have any attributes that need to be output
        let has_relevant_attrs = elem.attributes.iter().any(|attr| {
            match attr {
                Attribute::Attribute(_) => true,
                Attribute::SpreadAttribute(_) => true,
                Attribute::ClassDirective(_) => true,
                Attribute::StyleDirective(_) => true,
                Attribute::BindDirective(bind) => bind.name != "this",
                _ => false, // Skip event handlers, use directives, etc.
            }
        });

        if !has_relevant_attrs {
            return Ok(None);
        }

        // Check if we have spread attributes
        let has_spread = elem
            .attributes
            .iter()
            .any(|attr| matches!(attr, Attribute::SpreadAttribute(_)));

        if has_spread {
            // Use $.attributes() for spread attributes - callback form with ${...} template
            let attrs_call = self.build_svelte_element_spread_attributes(elem)?;
            if !attrs_call.is_empty() {
                // Wrap in callback form: () => { $$renderer.push(`${$.attributes(...)}`); }
                Ok(Some(format!(
                    "() => {{\n\t\t$$renderer.push(`{}`);\n\t}}",
                    attrs_call
                )))
            } else {
                Ok(None)
            }
        } else {
            // Build inline HTML attribute strings for the callback form
            // The output should be: () => { $$renderer.push(` attr1="val1" attr2="val2"`); }
            let mut attr_parts: Vec<String> = Vec::new();
            let css_hash: Option<String> = self.analysis.and_then(|a| {
                if !a.css.hash.is_empty() {
                    Some(a.css.hash.clone())
                } else {
                    None
                }
            });

            for attr in &elem.attributes {
                match attr {
                    Attribute::Attribute(node) => {
                        let name = node.name.as_str();
                        let value = self.extract_attribute_value_as_literal(node)?;
                        if let Some(val) = value {
                            // Check if class needs CSS hash appended
                            let val = if name == "class" {
                                if let Some(ref hash) = css_hash {
                                    format!("{} {}", val, hash).trim().to_string()
                                } else {
                                    val
                                }
                            } else {
                                val
                            };
                            attr_parts.push(format!(" {}=\"{}\"", name, val));
                        } else {
                            // Dynamic attribute - use $.attr()
                            let expr = self.extract_attribute_value_as_string(node)?;
                            attr_parts.push(format!("${{$.attr('{}', {})}}", name, expr));
                        }
                    }
                    Attribute::BindDirective(bind) => {
                        if bind.name == "this" {
                            continue;
                        }
                        let name = bind.name.as_str();
                        let expr_start = bind.expression.start().unwrap_or(0) as usize;
                        let expr_end = bind.expression.end().unwrap_or(0) as usize;
                        if expr_end > expr_start && expr_end <= self.source.len() {
                            let expr = self.source[expr_start..expr_end].trim().to_string();
                            attr_parts.push(format!("${{$.attr('{}', {})}}", name, expr));
                        }
                    }
                    _ => {}
                }
            }

            if attr_parts.is_empty() {
                Ok(None)
            } else {
                // Generate callback form: () => { $$renderer.push(` attr="value"`); }
                let attrs_str = attr_parts.join("");
                Ok(Some(format!(
                    "() => {{\n\t\t$$renderer.push(`{}`);\n\t}}",
                    attrs_str
                )))
            }
        }
    }

    /// Generate attributes for svelte:element.
    /// This handles spread attributes, class/style directives, and regular attributes.
    #[allow(dead_code)]
    fn generate_svelte_element_attributes(
        &mut self,
        elem: &SvelteDynamicElement,
    ) -> Result<Vec<OutputPart>, TransformError> {
        let mut parts = Vec::new();

        // Check if we have spread attributes
        let has_spread = elem
            .attributes
            .iter()
            .any(|attr| matches!(attr, Attribute::SpreadAttribute(_)));

        if has_spread {
            // Use $.attributes() for spread attributes
            let attributes_call = self.build_svelte_element_spread_attributes(elem)?;
            if !attributes_call.is_empty() {
                parts.push(OutputPart::Html(attributes_call));
            }
        } else {
            // Generate inline attributes
            for attr in &elem.attributes {
                if let Some(attr_str) = self.generate_attribute_for_element(attr, None)? {
                    parts.push(OutputPart::Html(attr_str));
                }
            }
        }

        Ok(parts)
    }

    /// Build $.attributes() call for svelte:element with spread.
    #[allow(dead_code)]
    fn build_svelte_element_spread_attributes(
        &mut self,
        elem: &SvelteDynamicElement,
    ) -> Result<String, TransformError> {
        let mut object_parts: Vec<String> = Vec::new();

        for attr in &elem.attributes {
            match attr {
                Attribute::SpreadAttribute(spread) => {
                    let expr_start = spread.expression.start().unwrap_or(0) as usize;
                    let expr_end = spread.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        let expr = self.source[expr_start..expr_end].trim().to_string();
                        object_parts.push(format!("...{}", expr));
                    }
                }
                Attribute::Attribute(node) => {
                    let name = node.name.as_str();
                    let value = self.extract_attribute_value_as_string(node)?;
                    let quoted_name = quote_prop_name(name);
                    object_parts.push(format!("{}: {}", quoted_name, value));
                }
                Attribute::BindDirective(bind) => {
                    let name = bind.name.as_str();
                    let expr_start = bind.expression.start().unwrap_or(0) as usize;
                    let expr_end = bind.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        let expr = self.source[expr_start..expr_end].trim().to_string();
                        let quoted_name = quote_prop_name(name);
                        object_parts.push(format!("{}: {}", quoted_name, expr));
                    }
                }
                _ => {}
            }
        }

        if object_parts.is_empty() {
            return Ok(String::new());
        }

        // Build: $.attributes({ ... }, void 0, void 0, void 0, 4)
        // The 4 is a flag for dynamic elements
        Ok(format!(
            "${{$.attributes({{ {} }}, void 0, void 0, void 0, 4)}}",
            object_parts.join(", ")
        ))
    }
}
