//! Server-side select, textarea, and option element visitors.

use super::super::ServerCodeGenerator;
use super::super::helpers::prop_string;
use super::super::types::OutputPart;
use crate::ast::template::{
    Attribute, AttributeValue, AttributeValuePart, RegularElement, TemplateNode,
};
use crate::compiler::phases::phase3_transform::TransformError;
use crate::compiler::phases::phase3_transform::utils::is_svelte_whitespace_only;

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
        body_generator.is_typescript = self.is_typescript;
        body_generator.dev = self.dev;

        // Process children
        let children: Vec<_> = element.fragment.nodes.iter().collect();
        let len = children.len();

        // Skip leading/trailing whitespace
        let mut start_idx = 0;
        let mut end_idx = len;

        while start_idx < len {
            if let TemplateNode::Text(text) = children[start_idx]
                && is_svelte_whitespace_only(&text.data)
            {
                start_idx += 1;
                continue;
            }
            break;
        }

        while end_idx > start_idx {
            if let TemplateNode::Text(text) = children[end_idx - 1]
                && is_svelte_whitespace_only(&text.data)
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
                && is_svelte_whitespace_only(&text.data)
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
                attr_parts.push(prop_string(name, value));
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

        // Check if any attribute values contain `await` and async mode is enabled
        let any_attr_has_await = self.use_async
            && attrs
                .iter()
                .any(|(_, v)| super::super::helpers::expr_contains_await(v));

        // Also check if body parts contain await (e.g., option with await expr)
        let body_has_await =
            self.use_async && Self::output_parts_contain_await(&body_generator.output_parts);

        let select_part = OutputPart::SelectElement {
            attrs_obj: if any_attr_has_await {
                // Replace await expressions in attrs with temp variables
                let mut new_attrs_parts = Vec::new();
                let mut declarations = Vec::new();
                let mut temp_counter = 0;

                for (name, value) in &attrs {
                    if name == "__spread__" {
                        new_attrs_parts.push(value.clone());
                    } else if super::super::helpers::expr_contains_await(value) {
                        let temp_name = format!("$${}", temp_counter);
                        // Use $.save for select value attrs (they precede children that depend on them)
                        let await_expr = Self::extract_await_with_save(value);
                        declarations.push(format!("const {} = {};", temp_name, await_expr));
                        new_attrs_parts.push(prop_string(name, &temp_name));
                        temp_counter += 1;
                    } else {
                        new_attrs_parts.push(prop_string(name, value));
                    }
                }

                let new_attrs_obj = if new_attrs_parts.is_empty() {
                    "{}".to_string()
                } else {
                    format!("{{ {} }}", new_attrs_parts.join(", "))
                };

                // Wrap everything in AsyncChild
                self.output_parts.push(OutputPart::AsyncChild {
                    declarations,
                    inner: vec![OutputPart::SelectElement {
                        attrs_obj: new_attrs_obj,
                        body: body_generator.output_parts,
                        is_rich,
                        css_hash,
                    }],
                });

                return Ok(());
            } else {
                attrs_obj
            },
            body: if body_has_await && !any_attr_has_await {
                // Body has await but attrs don't - body children will handle their own wrapping
                body_generator.output_parts
            } else {
                body_generator.output_parts
            },
            is_rich,
            css_hash,
        };

        self.output_parts.push(select_part);

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
                        let raw_expr = self.source[expr_start..expr_end].trim().to_string();
                        bind_value_expr = Some(self.transform_store_refs(&raw_expr));
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

        // In dev mode, add $.push_element() after opening tag
        if self.dev {
            let (line, col) =
                super::element::locate_in_source(&self.source, element.start as usize);
            self.output_parts.push(OutputPart::Flush);
            self.output_parts.push(OutputPart::RawStatement(format!(
                "$.push_element($$renderer, 'textarea', {}, {});",
                line, col
            )));
        }

        // Generate the body - if we have a value expression, use it
        if let Some(expr) = body_expr {
            // Use TextareaBody OutputPart for proper statement-based generation
            self.output_parts
                .push(OutputPart::TextareaBody { value_expr: expr });
        } else {
            // No value - process children with whitespace preserved (textarea content)
            // Textarea content should not have whitespace collapsed
            let saved_preserve = self.preserve_whitespace;
            self.preserve_whitespace = true;
            for child in &element.fragment.nodes {
                if matches!(child, TemplateNode::Comment(_)) {
                    continue;
                }
                self.generate_node(child, false)?;
            }
            self.preserve_whitespace = saved_preserve;
        }

        self.output_parts
            .push(OutputPart::Html("</textarea>".to_string()));

        // In dev mode, add $.pop_element() after closing tag
        if self.dev {
            self.output_parts
                .push(OutputPart::RawStatement("$.pop_element();".to_string()));
        }

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
                        AttributeValue::Expression(expr_tag) => {
                            let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                            let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                            if expr_end > expr_start && expr_end <= self.source.len() {
                                let expr = self.source[expr_start..expr_end].trim().to_string();
                                let expr = self.strip_ts_from_expr(&expr);
                                let expr = self.transform_store_refs(&expr);
                                attr_entries.push(prop_string(&name, &expr));
                            }
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
                                        attr_entries.push(prop_string(&name, &expr));
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

            // If the expression contains `await`, wrap in AsyncChild
            let dev_loc = if self.dev {
                Some(super::element::locate_in_source(
                    &self.source,
                    element.start as usize,
                ))
            } else {
                None
            };
            if self.use_async && super::super::helpers::expr_contains_await(&expr_source) {
                let temp_name = "$$0";
                // For option direct_value, use plain await (no $.save)
                let declarations = vec![format!("const {} = {};", temp_name, expr_source)];
                self.output_parts.push(OutputPart::AsyncChild {
                    declarations,
                    inner: vec![OutputPart::OptionElement {
                        attr_entries,
                        body: Vec::new(),
                        is_rich,
                        direct_value: Some(temp_name.to_string()),
                        css_hash: css_hash.clone(),
                        dev_location: dev_loc,
                    }],
                });
            } else {
                self.output_parts.push(OutputPart::OptionElement {
                    attr_entries,
                    body: Vec::new(),
                    is_rich,
                    direct_value: Some(expr_source),
                    css_hash: css_hash.clone(),
                    dev_location: dev_loc,
                });
            }

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
        body_generator.is_typescript = self.is_typescript;
        body_generator.dev = self.dev;

        // Process children (skip leading/trailing whitespace)
        let children: Vec<_> = element.fragment.nodes.iter().collect();
        let len = children.len();

        let mut start_idx = 0;
        let mut end_idx = len;

        // Skip leading whitespace
        while start_idx < len {
            if let TemplateNode::Text(text) = children[start_idx]
                && is_svelte_whitespace_only(&text.data)
            {
                start_idx += 1;
                continue;
            }
            break;
        }

        // Skip trailing whitespace
        while end_idx > start_idx {
            if let TemplateNode::Text(text) = children[end_idx - 1]
                && is_svelte_whitespace_only(&text.data)
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

        let dev_loc = if self.dev {
            Some(super::element::locate_in_source(
                &self.source,
                element.start as usize,
            ))
        } else {
            None
        };

        self.output_parts.push(OutputPart::OptionElement {
            attr_entries,
            body: body_generator.output_parts,
            is_rich,
            direct_value: None,
            css_hash,
            dev_location: dev_loc,
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

    /// Check if any output parts contain `await` expressions.
    pub(crate) fn output_parts_contain_await(parts: &[OutputPart]) -> bool {
        for part in parts {
            match part {
                OutputPart::Html(html) | OutputPart::HtmlWithExclusions { html, .. } => {
                    if super::super::helpers::expr_contains_await(html) {
                        return true;
                    }
                }
                OutputPart::Expression(expr) => {
                    if super::super::helpers::expr_contains_await(expr) {
                        return true;
                    }
                }
                OutputPart::AsyncExpression { .. } => return true,
                OutputPart::OptionElement {
                    direct_value,
                    body,
                    attr_entries,
                    ..
                } => {
                    if let Some(v) = direct_value
                        && super::super::helpers::expr_contains_await(v)
                    {
                        return true;
                    }
                    for entry in attr_entries {
                        if super::super::helpers::expr_contains_await(entry) {
                            return true;
                        }
                    }
                    if Self::output_parts_contain_await(body) {
                        return true;
                    }
                }
                OutputPart::SelectElement {
                    attrs_obj, body, ..
                } => {
                    if super::super::helpers::expr_contains_await(attrs_obj) {
                        return true;
                    }
                    if Self::output_parts_contain_await(body) {
                        return true;
                    }
                }
                OutputPart::Component { .. } => {
                    // Components handle their own async
                }
                _ => {}
            }
        }
        false
    }

    /// Extract an await expression and wrap with `$.save()` for select value attributes.
    /// Transforms `await Promise.resolve('dog')` into `(await $.save(Promise.resolve('dog')))()`
    pub(crate) fn extract_await_with_save(expr: &str) -> String {
        let trimmed = expr.trim();
        if let Some(argument) = trimmed.strip_prefix("await ") {
            format!("(await $.save({}))()", argument.trim())
        } else {
            // Not an await expression, return as-is
            trimmed.to_string()
        }
    }
}
