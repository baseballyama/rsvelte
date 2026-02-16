//! Server-side select, textarea, and option element visitors.

use super::super::ServerCodeGenerator;
use super::super::helpers::quote_prop_name;
use super::super::types::OutputPart;
use crate::ast::template::{
    Attribute, AttributeValue, AttributeValuePart, RegularElement, TemplateNode,
};
use crate::compiler::phases::phase3_transform::TransformError;

impl<'a> ServerCodeGenerator<'a> {
    /// Generate <select> element using $$renderer.select().
    pub(crate) fn generate_select_element(
        &mut self,
        element: &RegularElement,
    ) -> Result<(), TransformError> {
        // Extract attributes for the select element, preserving declaration order.
        // The value attribute (from value={...} or bind:value={...}) is included inline
        // in the attrs list to maintain its position relative to spreads.
        let mut attrs = Vec::new();
        let mut has_value = false;

        for attr in &element.attributes {
            match attr {
                Attribute::Attribute(node) => {
                    let attr_name = node.name.as_str();
                    if attr_name == "value" {
                        // Include value in its original position
                        let value = self.extract_attribute_value_as_string(node)?;
                        attrs.push((attr_name.to_string(), value));
                        has_value = true;
                        continue;
                    }
                    // Skip event handlers
                    if attr_name.starts_with("on") {
                        continue;
                    }
                    let value = self.extract_attribute_value_as_string(node)?;
                    attrs.push((attr_name.to_string(), value));
                }
                Attribute::BindDirective(bind) => {
                    if bind.name.as_str() == "value" {
                        // Extract the bound variable expression, keeping it in order
                        let expr_start = bind.expression.start().unwrap_or(0) as usize;
                        let expr_end = bind.expression.end().unwrap_or(0) as usize;
                        if expr_end > expr_start && expr_end <= self.source.len() {
                            let raw_expr = self.source[expr_start..expr_end].trim().to_string();
                            let value = self.transform_store_refs(&raw_expr);
                            attrs.push(("value".to_string(), value));
                            has_value = true;
                        }
                    }
                }
                Attribute::SpreadAttribute(spread) => {
                    // Include spread attributes in the select attrs object
                    let expr_start = spread.expression.start().unwrap_or(0) as usize;
                    let expr_end = spread.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        let expr = self.source[expr_start..expr_end].trim().to_string();
                        let expr = Self::transform_rune_in_template_expr(&expr);
                        attrs.push(("__spread__".to_string(), format!("...{}", expr)));
                    }
                }
                _ => {}
            }
        }
        let _ = has_value; // value is now included in attrs directly

        // Generate body parts for children
        let mut body_generator = ServerCodeGenerator::new(
            self.component_name.clone(),
            self.source.clone(),
            None,
            None,
            self.analysis,
            self.use_async,
        );
        body_generator.constant_vars = self.constant_vars.clone();

        // Process children
        let children: Vec<_> = element.fragment.nodes.iter().collect();
        let len = children.len();

        // Skip leading/trailing whitespace
        let mut start_idx = 0;
        let mut end_idx = len;

        while start_idx < len {
            if let TemplateNode::Text(text) = children[start_idx]
                && text.data.trim().is_empty()
            {
                start_idx += 1;
                continue;
            }
            break;
        }

        while end_idx > start_idx {
            if let TemplateNode::Text(text) = children[end_idx - 1]
                && text.data.trim().is_empty()
            {
                end_idx -= 1;
                continue;
            }
            break;
        }

        // Skip all whitespace-only text nodes in select elements (not just leading/trailing)
        // This matches the clean_nodes behavior in the official compiler
        for node in children.iter().take(end_idx).skip(start_idx) {
            if let TemplateNode::Text(text) = node
                && text.data.trim().is_empty()
            {
                continue;
            }
            body_generator.generate_node(node, false)?;
        }

        // Build the attributes object, preserving declaration order
        let mut attr_parts = Vec::new();
        for (name, value) in &attrs {
            if name == "__spread__" {
                // Spread attributes: emit as ...expr
                attr_parts.push(value.clone());
            } else {
                attr_parts.push(format!("{}: {}", quote_prop_name(name), value));
            }
        }
        let attrs_obj = if attr_parts.is_empty() {
            "{}".to_string()
        } else {
            format!("{{ {} }}", attr_parts.join(", "))
        };

        // Check if it has rich content (Components, RenderTags, etc.)
        let is_rich = Self::has_component_or_render_tag(&element.fragment.nodes);

        // Check if this element has a class attribute
        let has_class = attrs.iter().any(|(name, _)| name == "class");

        // Get CSS hash for scoped elements - only if they have a class attribute
        let css_hash = if element.metadata.scoped && has_class {
            self.analysis.and_then(|a| {
                if !a.css.hash.is_empty() {
                    Some(a.css.hash.clone())
                } else {
                    None
                }
            })
        } else {
            None
        };

        // Push SelectElement OutputPart
        self.output_parts.push(OutputPart::SelectElement {
            attrs_obj,
            body: body_generator.output_parts,
            is_rich,
            css_hash,
        });

        Ok(())
    }

    /// Generate <textarea> element with value as content.
    pub(crate) fn generate_textarea_element(
        &mut self,
        element: &RegularElement,
    ) -> Result<(), TransformError> {
        // Find value attribute or bind:value
        let mut value_expr: Option<String> = None;
        let mut bind_value_expr: Option<String> = None;

        for attr in &element.attributes {
            match attr {
                Attribute::Attribute(node) if node.name.as_str() == "value" => {
                    value_expr = Some(self.extract_attribute_value_as_string(node)?);
                }
                Attribute::BindDirective(bind) if bind.name.as_str() == "value" => {
                    let expr_start = bind.expression.start().unwrap_or(0) as usize;
                    let expr_end = bind.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        bind_value_expr =
                            Some(self.source[expr_start..expr_end].trim().to_string());
                    }
                }
                _ => {}
            }
        }

        // Get the body expression (value takes precedence, then bind:value)
        let body_expr = value_expr.or(bind_value_expr);

        // Start building the tag
        let mut tag = "<textarea".to_string();

        // Add other attributes (excluding value)
        for attr in &element.attributes {
            match attr {
                Attribute::Attribute(node) if node.name.as_str() == "value" => continue,
                Attribute::BindDirective(bind) if bind.name.as_str() == "value" => continue,
                Attribute::ClassDirective(_) | Attribute::StyleDirective(_) => continue,
                Attribute::OnDirective(_) => continue,
                _ => {
                    if let Some(attr_str) =
                        self.generate_attribute_for_element(attr, Some(element))?
                    {
                        tag.push_str(&attr_str);
                    }
                }
            }
        }

        tag.push('>');
        self.output_parts.push(OutputPart::Html(tag));

        // Generate the body - if we have a value expression, use it
        if let Some(expr) = body_expr {
            // Use TextareaBody OutputPart for proper statement-based generation
            self.output_parts
                .push(OutputPart::TextareaBody { value_expr: expr });
        } else {
            // No value - process children normally
            for child in &element.fragment.nodes {
                if matches!(child, TemplateNode::Comment(_)) {
                    continue;
                }
                self.generate_node(child, false)?;
            }
        }

        self.output_parts
            .push(OutputPart::Html("</textarea>".to_string()));

        Ok(())
    }

    pub(crate) fn generate_option_element(
        &mut self,
        element: &RegularElement,
    ) -> Result<(), TransformError> {
        // Extract attributes as raw entries: each is either "key: value" or "...expr"
        let mut attr_entries = Vec::new();
        for attr in &element.attributes {
            match attr {
                Attribute::Attribute(node) => {
                    let name = node.name.to_string();
                    match &node.value {
                        AttributeValue::True(_) => {
                            attr_entries.push(format!("{}: true", name));
                        }
                        AttributeValue::Sequence(parts) => {
                            // Check if it's a single expression (like value='{foo}')
                            let expr_parts: Vec<_> = parts
                                .iter()
                                .filter(|p| matches!(p, AttributeValuePart::ExpressionTag(_)))
                                .collect();
                            let text_parts: Vec<_> = parts
                                .iter()
                                .filter_map(|p| match p {
                                    AttributeValuePart::Text(t) => Some(t.data.as_str()),
                                    _ => None,
                                })
                                .collect();
                            let all_text_whitespace =
                                text_parts.iter().all(|t| t.trim().is_empty());

                            if expr_parts.len() == 1 && all_text_whitespace {
                                // Single expression - use variable reference
                                if let AttributeValuePart::ExpressionTag(expr_tag) = expr_parts[0] {
                                    let expr_start =
                                        expr_tag.expression.start().unwrap_or(0) as usize;
                                    let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                                    if expr_end > expr_start && expr_end <= self.source.len() {
                                        let expr =
                                            self.source[expr_start..expr_end].trim().to_string();
                                        attr_entries.push(format!("{}: {}", name, expr));
                                    }
                                }
                            } else {
                                // Mixed or pure text - concatenate
                                let mut value = String::new();
                                for part in parts {
                                    match part {
                                        AttributeValuePart::Text(text) => {
                                            value.push_str(&text.data);
                                        }
                                        AttributeValuePart::ExpressionTag(expr_tag) => {
                                            let expr_start =
                                                expr_tag.expression.start().unwrap_or(0) as usize;
                                            let expr_end =
                                                expr_tag.expression.end().unwrap_or(0) as usize;
                                            if expr_end > expr_start
                                                && expr_end <= self.source.len()
                                            {
                                                let expr = self.source[expr_start..expr_end]
                                                    .trim()
                                                    .to_string();
                                                value.push_str(&format!(
                                                    "${{$.stringify({})}}",
                                                    expr
                                                ));
                                            }
                                        }
                                    }
                                }
                                attr_entries.push(format!("{}: '{}'", name, value));
                            }
                        }
                        _ => {}
                    }
                }
                Attribute::SpreadAttribute(spread) => {
                    let expr_start = spread.expression.start().unwrap_or(0) as usize;
                    let expr_end = spread.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        let expr = self.source[expr_start..expr_end].trim().to_string();
                        attr_entries.push(format!("...{}", expr));
                    }
                }
                _ => {}
            }
        }

        // Check if this element has a class attribute
        let has_class = attr_entries.iter().any(|e| e.starts_with("class:"));

        // Get CSS hash for scoped elements - only if they have a class attribute
        let css_hash = if element.metadata.scoped && has_class {
            self.analysis.and_then(|a| {
                if !a.css.hash.is_empty() {
                    Some(a.css.hash.clone())
                } else {
                    None
                }
            })
        } else {
            None
        };

        // Check if we have a synthetic_value_node - if so, pass the value directly
        if let Some(synthetic_value_node) = &element.metadata.synthetic_value_node {
            // Get expression source directly
            let expr_start = synthetic_value_node.expression.start().unwrap_or(0) as usize;
            let expr_end = synthetic_value_node.expression.end().unwrap_or(0) as usize;
            let expr_source = if expr_end > expr_start && expr_end <= self.source.len() {
                self.source[expr_start..expr_end].trim().to_string()
            } else {
                "undefined".to_string()
            };

            // Check if this option has rich content
            let is_rich = Self::is_rich_option_content(&element.fragment.nodes);

            self.output_parts.push(OutputPart::OptionElement {
                attr_entries,
                body: Vec::new(),
                is_rich,
                direct_value: Some(expr_source),
                css_hash: css_hash.clone(),
            });

            return Ok(());
        }

        // Generate body parts
        let mut body_generator = ServerCodeGenerator::new(
            self.component_name.clone(),
            self.source.clone(),
            None,
            None,
            None,
            self.use_async,
        );
        body_generator.constant_vars = self.constant_vars.clone();

        // Process children (skip leading/trailing whitespace)
        let children: Vec<_> = element.fragment.nodes.iter().collect();
        let len = children.len();

        let mut start_idx = 0;
        let mut end_idx = len;

        // Skip leading whitespace
        while start_idx < len {
            if let TemplateNode::Text(text) = children[start_idx]
                && text.data.trim().is_empty()
            {
                start_idx += 1;
                continue;
            }
            break;
        }

        // Skip trailing whitespace
        while end_idx > start_idx {
            if let TemplateNode::Text(text) = children[end_idx - 1]
                && text.data.trim().is_empty()
            {
                end_idx -= 1;
                continue;
            }
            break;
        }

        for node in children.iter().take(end_idx).skip(start_idx) {
            body_generator.generate_node(node, false)?;
        }

        // Check if this option has rich content (non-option elements, components, etc.)
        let is_rich = Self::is_rich_option_content(&element.fragment.nodes);

        self.output_parts.push(OutputPart::OptionElement {
            attr_entries,
            body: body_generator.output_parts,
            is_rich,
            direct_value: None,
            css_hash,
        });

        Ok(())
    }

    /// Check if option content is "rich" (contains elements other than text, or components/render tags)
    pub(crate) fn is_rich_option_content(nodes: &[TemplateNode]) -> bool {
        for node in nodes {
            match node {
                // Regular elements in option are rich content
                TemplateNode::RegularElement(_) => return true,
                // Components are rich content
                TemplateNode::Component(_) => return true,
                TemplateNode::SvelteComponent(_) => return true,
                // Render tags and HTML tags are rich content
                TemplateNode::RenderTag(_) => return true,
                TemplateNode::HtmlTag(_) => return true,
                // Blocks that may contain rich content need recursive check
                TemplateNode::IfBlock(if_block) => {
                    if Self::is_rich_option_content(&if_block.consequent.nodes) {
                        return true;
                    }
                    if let Some(alt) = &if_block.alternate
                        && Self::is_rich_option_content(&alt.nodes)
                    {
                        return true;
                    }
                }
                TemplateNode::EachBlock(each) => {
                    if Self::is_rich_option_content(&each.body.nodes) {
                        return true;
                    }
                }
                TemplateNode::KeyBlock(key) => {
                    if Self::is_rich_option_content(&key.fragment.nodes) {
                        return true;
                    }
                }
                TemplateNode::AwaitBlock(await_block) => {
                    if let Some(pending) = &await_block.pending
                        && Self::is_rich_option_content(&pending.nodes)
                    {
                        return true;
                    }
                    if let Some(then) = &await_block.then
                        && Self::is_rich_option_content(&then.nodes)
                    {
                        return true;
                    }
                    if let Some(catch) = &await_block.catch
                        && Self::is_rich_option_content(&catch.nodes)
                    {
                        return true;
                    }
                }
                TemplateNode::SvelteBoundary(boundary) => {
                    if Self::is_rich_option_content(&boundary.fragment.nodes) {
                        return true;
                    }
                }
                // Text and expression tags are not rich content
                TemplateNode::Text(_) => {}
                TemplateNode::ExpressionTag(_) => {}
                // Other nodes
                _ => {}
            }
        }
        false
    }
}
