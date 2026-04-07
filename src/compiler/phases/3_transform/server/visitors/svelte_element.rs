//! Server-side svelte:element (dynamic element) visitor.

use super::super::ServerCodeGenerator;
use super::super::helpers::{needs_clsx, prop_string};
use super::super::types::OutputPart;
use crate::ast::template::{Attribute, AttributeValue, AttributeValuePart, SvelteDynamicElement};
use crate::compiler::phases::phase3_transform::TransformError;
use crate::compiler::phases::phase3_transform::shared::template::is_boolean_attribute;

impl<'a> ServerCodeGenerator<'a> {
    pub(crate) fn generate_svelte_element(
        &mut self,
        elem: &SvelteDynamicElement,
    ) -> Result<(), TransformError> {
        // Extract the tag expression from the source
        let start = elem.tag.start().unwrap_or(0) as usize;
        let end = elem.tag.end().unwrap_or(0) as usize;

        // Check if tag is a Literal node (e.g., from this="svg")
        let tag_expr = if elem.tag.node_type() == Some("Literal") {
            // Use the raw field for proper quoting: 'svg'
            let node = elem.tag.as_node();
            if let crate::ast::typed_expr::JsNode::Literal { raw, .. } = &*node {
                raw.to_string()
            } else if let crate::ast::typed_expr::JsNode::Raw(val) = &*node {
                if let Some(raw) = val.get("raw").and_then(|r| r.as_str()) {
                    raw.to_string()
                } else if let Some(v) = val.get("value").and_then(|v| v.as_str()) {
                    format!("'{}'", v)
                } else {
                    "null".to_string()
                }
            } else {
                "null".to_string()
            }
        } else if end > start && end <= self.source.len() {
            let raw = self.source[start..end].trim().to_string();
            self.transform_store_refs(&raw)
        } else if let Some(name) = elem.tag.name() {
            format!("'{}'", name)
        } else {
            "null".to_string()
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
            dev: self.dev,
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
        let has_relevant_attrs = elem.attributes.iter().any(|attr| match attr {
            Attribute::Attribute(_) => true,
            Attribute::SpreadAttribute(_) => true,
            Attribute::ClassDirective(_) => true,
            Attribute::StyleDirective(_) => true,
            Attribute::BindDirective(bind) => bind.name != "this",
            _ => false, // Skip event handlers, use directives, etc.
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
            let mut attr_parts: Vec<String> = Vec::new();
            let css_hash: Option<String> = if elem.metadata.scoped {
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

            // Collect class and style directives
            let mut class_directives: Vec<&crate::ast::template::ClassDirective> = Vec::new();
            let mut style_directives: Vec<&crate::ast::template::StyleDirective> = Vec::new();
            for attr in &elem.attributes {
                match attr {
                    Attribute::ClassDirective(cd) => class_directives.push(cd),
                    Attribute::StyleDirective(sd) => style_directives.push(sd),
                    _ => {}
                }
            }

            // Track whether we've handled class/style via directives
            let mut handled_class = false;
            let mut handled_style = false;

            for attr in &elem.attributes {
                match attr {
                    Attribute::Attribute(node) => {
                        let name = node.name.as_str();

                        if name == "class" && !class_directives.is_empty() {
                            // Use $.attr_class() when class directives are present
                            handled_class = true;
                            let effective_css_hash = &css_hash;
                            let base_value =
                                self.build_class_base_value(node, effective_css_hash)?;
                            let directives_obj = self.build_class_directives_obj(&class_directives);
                            // Determine if the base value is dynamic (template literal or clsx expression)
                            let is_dynamic_base =
                                needs_clsx(&node.value) || base_value.starts_with('`');
                            let css_hash_arg = if is_dynamic_base {
                                // Dynamic class expression: hash goes as separate argument
                                if let Some(ref hash) = css_hash {
                                    format!(", '{}'", hash)
                                } else {
                                    ", void 0".to_string()
                                }
                            } else {
                                // Static class: hash already baked into base_value, use void 0
                                ", void 0".to_string()
                            };
                            attr_parts.push(format!(
                                "${{$.attr_class({}{}, {})}}",
                                base_value, css_hash_arg, directives_obj
                            ));
                        } else if name == "style" && !style_directives.is_empty() {
                            // Use $.attr_style() when style directives are present
                            handled_style = true;
                            let style_value = self.extract_attribute_value_as_string(node)?;
                            let directives_obj =
                                self.build_style_directives_obj(&style_directives)?;
                            attr_parts.push(format!(
                                "${{$.attr_style({}, {})}}",
                                style_value, directives_obj
                            ));
                        } else if name == "class" {
                            // Class attribute without class directives
                            let value = self.extract_attribute_value_as_literal(node)?;
                            if let Some(val) = value {
                                let val = if let Some(ref hash) = css_hash {
                                    format!("{} {}", val, hash).trim().to_string()
                                } else {
                                    val
                                };
                                attr_parts.push(format!(" {}=\"{}\"", name, val));
                            } else {
                                // Dynamic class - check if needs clsx
                                let expr = self.extract_attribute_value_as_string(node)?;
                                if needs_clsx(&node.value) {
                                    if let Some(ref hash) = css_hash {
                                        attr_parts.push(format!(
                                            "${{$.attr_class($.clsx({}), '{}')}}",
                                            expr, hash
                                        ));
                                    } else {
                                        attr_parts
                                            .push(format!("${{$.attr_class($.clsx({}))}}", expr));
                                    }
                                } else if is_boolean_attribute(name) {
                                    attr_parts
                                        .push(format!("${{$.attr('{}', {}, true)}}", name, expr));
                                } else {
                                    attr_parts.push(format!("${{$.attr('{}', {})}}", name, expr));
                                }
                            }
                        } else {
                            let value = self.extract_attribute_value_as_literal(node)?;
                            if let Some(val) = value {
                                attr_parts.push(format!(" {}=\"{}\"", name, val));
                            } else {
                                let expr = self.extract_attribute_value_as_string(node)?;
                                if is_boolean_attribute(name) {
                                    attr_parts
                                        .push(format!("${{$.attr('{}', {}, true)}}", name, expr));
                                } else {
                                    attr_parts.push(format!("${{$.attr('{}', {})}}", name, expr));
                                }
                            }
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
                    Attribute::ClassDirective(_) | Attribute::StyleDirective(_) => {
                        // Handled above/below
                    }
                    _ => {}
                }
            }

            // Handle class directives without a class attribute
            if !class_directives.is_empty() && !handled_class {
                let directives_obj = self.build_class_directives_obj(&class_directives);
                if let Some(ref hash) = css_hash {
                    attr_parts.push(format!(
                        "${{$.attr_class('{}', void 0, {})}}",
                        hash, directives_obj
                    ));
                } else {
                    attr_parts.push(format!("${{$.attr_class('', void 0, {})}}", directives_obj));
                }
            }

            // Handle style directives without a style attribute
            if !style_directives.is_empty() && !handled_style {
                let directives_obj = self.build_style_directives_obj(&style_directives)?;
                attr_parts.push(format!("${{$.attr_style('', {})}}", directives_obj));
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
                    object_parts.push(prop_string(name, &value));
                }
                Attribute::BindDirective(bind) => {
                    let name = bind.name.as_str();
                    let expr_start = bind.expression.start().unwrap_or(0) as usize;
                    let expr_end = bind.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        let expr = self.source[expr_start..expr_end].trim().to_string();
                        object_parts.push(prop_string(name, &expr));
                    }
                }
                _ => {}
            }
        }

        if object_parts.is_empty() {
            return Ok(String::new());
        }

        // Build: $.attributes({ ... })
        // For <svelte:element> with SVG/MathML metadata, we need to add the namespace flags:
        // ELEMENT_IS_NAMESPACED (1) | ELEMENT_PRESERVE_ATTRIBUTE_CASE (2) = 3
        if elem.metadata.svg || elem.metadata.mathml {
            Ok(format!(
                "${{$.attributes({{ {} }}, void 0, void 0, void 0, 3)}}",
                object_parts.join(", ")
            ))
        } else {
            Ok(format!(
                "${{$.attributes({{ {} }})}}",
                object_parts.join(", ")
            ))
        }
    }

    /// Build the base value expression for a class attribute when class directives are present.
    /// For static class values, bakes in the CSS hash. For dynamic values, wraps in $.clsx().
    fn build_class_base_value(
        &self,
        node: &crate::ast::template::AttributeNode,
        css_hash: &Option<String>,
    ) -> Result<String, TransformError> {
        let literal = self.extract_attribute_value_as_literal(node)?;
        if let Some(val) = literal {
            // Static class value - bake in CSS hash
            let val = if let Some(hash) = css_hash {
                format!("{} {}", val, hash).trim().to_string()
            } else {
                val
            };
            Ok(format!("'{}'", val))
        } else {
            // Dynamic class value - check if it's a mixed text+expression sequence
            if let AttributeValue::Sequence(parts) = &node.value {
                let has_text = parts
                    .iter()
                    .any(|p| matches!(p, AttributeValuePart::Text(t) if !t.data.trim().is_empty()));
                let has_expr = parts
                    .iter()
                    .any(|p| matches!(p, AttributeValuePart::ExpressionTag(_)));
                if has_text && has_expr {
                    // Mixed: build template literal `text ${$.stringify(expr)} text`
                    let mut tmpl = String::new();
                    for part in parts {
                        match part {
                            AttributeValuePart::Text(text) => {
                                tmpl.push_str(&text.data);
                            }
                            AttributeValuePart::ExpressionTag(expr_tag) => {
                                let es = expr_tag.expression.start().unwrap_or(0) as usize;
                                let ee = expr_tag.expression.end().unwrap_or(0) as usize;
                                if ee > es && ee <= self.source.len() {
                                    let expr = self.source[es..ee].trim().to_string();
                                    let expr = self.transform_store_refs(&expr);
                                    tmpl.push_str(&format!("${{$.stringify({})}}", expr));
                                }
                            }
                        }
                    }
                    return Ok(format!("`{}`", tmpl));
                }
            }
            let expr = self.extract_attribute_value_as_string(node)?;
            if needs_clsx(&node.value) {
                Ok(format!("$.clsx({})", expr))
            } else {
                Ok(expr)
            }
        }
    }

    /// Build a JS object literal string for class directives: { 'name': expr, ... }
    fn build_class_directives_obj(
        &self,
        directives: &[&crate::ast::template::ClassDirective],
    ) -> String {
        let parts: Vec<String> = directives
            .iter()
            .map(|cd| {
                let expr_start = cd.expression.start().unwrap_or(0) as usize;
                let expr_end = cd.expression.end().unwrap_or(0) as usize;
                let expr = if expr_end > expr_start && expr_end <= self.source.len() {
                    self.source[expr_start..expr_end].trim().to_string()
                } else {
                    cd.name.to_string()
                };
                format!("'{}': {}", cd.name, expr)
            })
            .collect();
        format!("{{ {} }}", parts.join(", "))
    }

    /// Build a JS object literal string for style directives: { prop: expr, ... }
    fn build_style_directives_obj(
        &self,
        directives: &[&crate::ast::template::StyleDirective],
    ) -> Result<String, TransformError> {
        let mut normal_parts: Vec<String> = Vec::new();
        let mut important_parts: Vec<String> = Vec::new();

        for sd in directives {
            let expr = match &sd.value {
                AttributeValue::True(_) => sd.name.to_string(),
                _ => self.extract_style_directive_value(sd)?,
            };

            let mut name = sd.name.to_string();
            // Only lowercase non-custom-properties
            if !name.starts_with("--") {
                name = name.to_lowercase();
            }

            let prop_str = if name.contains('-') {
                format!("'{}': {}", name, expr)
            } else if name == expr {
                name.clone()
            } else {
                format!("{}: {}", name, expr)
            };
            if sd.modifiers.iter().any(|m| m.as_str() == "important") {
                important_parts.push(prop_str);
            } else {
                normal_parts.push(prop_str);
            }
        }

        if !important_parts.is_empty() {
            Ok(format!(
                "[{{ {} }}, {{ {} }}]",
                normal_parts.join(", "),
                important_parts.join(", ")
            ))
        } else {
            Ok(format!("{{ {} }}", normal_parts.join(", ")))
        }
    }

    /// Extract the value expression for a style directive.
    fn extract_style_directive_value(
        &self,
        sd: &crate::ast::template::StyleDirective,
    ) -> Result<String, TransformError> {
        match &sd.value {
            AttributeValue::True(_) => Ok(sd.name.to_string()),
            AttributeValue::Sequence(parts) => {
                if parts.len() == 1
                    && let AttributeValuePart::ExpressionTag(expr_tag) = &parts[0]
                {
                    let start = expr_tag.expression.start().unwrap_or(0) as usize;
                    let end = expr_tag.expression.end().unwrap_or(0) as usize;
                    if end > start && end <= self.source.len() {
                        return Ok(self.source[start..end].trim().to_string());
                    }
                }
                // Multi-part: build template literal
                let mut result = String::new();
                let mut has_expr = false;
                for part in parts {
                    match part {
                        AttributeValuePart::Text(t) => result.push_str(&t.data),
                        AttributeValuePart::ExpressionTag(expr_tag) => {
                            has_expr = true;
                            let start = expr_tag.expression.start().unwrap_or(0) as usize;
                            let end = expr_tag.expression.end().unwrap_or(0) as usize;
                            if end > start && end <= self.source.len() {
                                let expr = self.source[start..end].trim();
                                result.push_str(&format!("${{$.stringify({})}}", expr));
                            }
                        }
                    }
                }
                if has_expr {
                    Ok(format!("`{}`", result))
                } else {
                    Ok(format!("'{}'", result))
                }
            }
            AttributeValue::Expression(expr_tag) => {
                let start = expr_tag.expression.start().unwrap_or(0) as usize;
                let end = expr_tag.expression.end().unwrap_or(0) as usize;
                if end > start && end <= self.source.len() {
                    Ok(self.source[start..end].trim().to_string())
                } else {
                    Ok("undefined".to_string())
                }
            }
        }
    }
}
