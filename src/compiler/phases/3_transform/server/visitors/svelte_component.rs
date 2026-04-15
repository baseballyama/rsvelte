//! Server-side svelte:component and svelte:self visitor.

use super::super::ServerCodeGenerator;
use super::super::helpers::prop_string;
use super::super::types::{ComponentBinding, ComponentPropItem, OutputPart};
use crate::ast::template::{Attribute, AttributeValue, SvelteComponentElement, SvelteElement};
use crate::compiler::phases::phase3_transform::TransformError;
use crate::compiler::phases::phase3_transform::shared::template::escape_js_string;

fn push_component_prop(items: &mut Vec<ComponentPropItem>, prop: String) {
    if let Some(ComponentPropItem::Props(props)) = items.last_mut() {
        props.push(prop);
    } else {
        items.push(ComponentPropItem::Props(vec![prop]));
    }
}

impl<'a> ServerCodeGenerator<'a> {
    pub(crate) fn generate_svelte_component(
        &mut self,
        elem: &SvelteComponentElement,
    ) -> Result<(), TransformError> {
        // Extract the component expression from `this={expr}`
        let start = elem.expression.start().unwrap_or(0) as usize;
        let end = elem.expression.end().unwrap_or(0) as usize;

        let component_expr = if end > start && end <= self.source.len() {
            let raw = self.source[start..end].trim().to_string();
            let expr = self.transform_store_refs(&raw);
            // Wrap in parens so that optional chaining `?.()` applies to the
            // whole expression (e.g. `(x ? Foo : Bar)?.(...)`) instead of only
            // the last operand.  Simple identifiers like `null` or `Foo` get
            // the extra parens stripped by OXC, so this is safe.
            format!("({})", expr)
        } else {
            "null".to_string()
        };

        // Build interleaved props/spreads and bindings from attributes
        let mut props_and_spreads: Vec<ComponentPropItem> = Vec::new();
        let mut bindings: Vec<ComponentBinding> = Vec::new();
        let mut css_custom_props: Vec<(String, String)> = Vec::new();
        for attr in &elem.attributes {
            match attr {
                Attribute::Attribute(node) => {
                    let attr_name = node.name.as_str();
                    // CSS custom properties (e.g., --color="red") are handled separately
                    if attr_name.starts_with("--") {
                        let value = self.extract_css_custom_prop_value(&node.value)?;
                        css_custom_props.push((format!("'{}'", attr_name), value));
                        continue;
                    }
                    let value = self.extract_attribute_value_as_string(node)?;
                    push_component_prop(&mut props_and_spreads, prop_string(attr_name, &value));
                }
                Attribute::SpreadAttribute(spread) => {
                    let expr_start = spread.expression.start().unwrap_or(0) as usize;
                    let expr_end = spread.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        let expr = self.source[expr_start..expr_end].trim().to_string();
                        props_and_spreads.push(ComponentPropItem::Spread(expr));
                    }
                }
                Attribute::BindDirective(bind) => {
                    let bind_name = bind.name.as_str();
                    // Skip bind:this on server - it's a DOM reference only needed client-side
                    if bind_name == "this" {
                        continue;
                    }
                    let expr_start = bind.expression.start().unwrap_or(0) as usize;
                    let expr_end = bind.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        let mut var_name = self.source[expr_start..expr_end].trim().to_string();
                        // Handle shorthand bindings where span might include "bind:"
                        if let Some(stripped) = var_name.strip_prefix("bind:") {
                            var_name = stripped.to_string();
                        }
                        bindings.push(ComponentBinding::Simple {
                            prop_name: bind_name.to_string(),
                            var_name,
                        });
                    }
                }
                _ => {}
            }
        }

        // Collect let directive names
        let component_let_directives: Vec<String> = elem
            .attributes
            .iter()
            .filter_map(|attr| {
                if let Attribute::LetDirective(let_dir) = attr {
                    Some(let_dir.name.to_string())
                } else {
                    None
                }
            })
            .collect();

        // Extract snippets from the component's fragment and process children
        let (children, snippets, slot_names) = self
            .generate_component_children_with_snippets(&elem.fragment, &component_let_directives)?;

        let css_props_is_html = self.namespace != "svg";

        // Use ComponentWithBindings if there are any bind directives
        if bindings.is_empty() {
            self.output_parts.push(OutputPart::Component {
                name: component_expr,
                props_and_spreads,
                has_prior_content: true,
                children,
                snippets,
                slot_names,
                dynamic: true,
                let_directives: component_let_directives,
                css_custom_props,
                css_props_is_html,
                in_async_block: false,
                attach_expressions: Vec::new(),
                dev: self.dev,
            });
        } else {
            self.output_parts.push(OutputPart::ComponentWithBindings {
                name: component_expr,
                props_and_spreads,
                bindings,
                has_prior_content: true,
                children,
                snippets: Vec::new(),
                slot_names: Vec::new(),
                dynamic: true,
                css_custom_props,
                css_props_is_html,
                seq_bindings_hoisted: false,
                dev: self.dev,
            });
        }

        Ok(())
    }

    pub(crate) fn generate_svelte_self(
        &mut self,
        elem: &SvelteElement,
    ) -> Result<(), TransformError> {
        // <svelte:self> renders as a call to the component function itself
        let comp_name = self.component_name.to_string();

        // Build interleaved props/spreads and bindings from attributes
        let mut props_and_spreads: Vec<ComponentPropItem> = Vec::new();
        let mut bindings: Vec<ComponentBinding> = Vec::new();
        let mut css_custom_props: Vec<(String, String)> = Vec::new();
        for attr in &elem.attributes {
            match attr {
                Attribute::Attribute(node) => {
                    let attr_name = node.name.as_str();
                    // CSS custom properties (e.g., --color="red") are handled separately
                    if attr_name.starts_with("--") {
                        let value = self.extract_css_custom_prop_value(&node.value)?;
                        css_custom_props.push((format!("'{}'", attr_name), value));
                        continue;
                    }
                    let value = self.extract_attribute_value_as_string(node)?;
                    push_component_prop(&mut props_and_spreads, prop_string(attr_name, &value));
                }
                Attribute::SpreadAttribute(spread) => {
                    let expr_start = spread.expression.start().unwrap_or(0) as usize;
                    let expr_end = spread.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        let expr = self.source[expr_start..expr_end].trim().to_string();
                        props_and_spreads.push(ComponentPropItem::Spread(expr));
                    }
                }
                Attribute::BindDirective(bind) => {
                    let bind_name = bind.name.as_str();
                    // Skip bind:this on server - it's a DOM reference only needed client-side
                    if bind_name == "this" {
                        continue;
                    }
                    let expr_start = bind.expression.start().unwrap_or(0) as usize;
                    let expr_end = bind.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        let mut var_name = self.source[expr_start..expr_end].trim().to_string();
                        if let Some(stripped) = var_name.strip_prefix("bind:") {
                            var_name = stripped.to_string();
                        }
                        bindings.push(ComponentBinding::Simple {
                            prop_name: bind_name.to_string(),
                            var_name,
                        });
                    }
                }
                _ => {}
            }
        }

        // Collect let directive names
        let component_let_directives: Vec<String> = elem
            .attributes
            .iter()
            .filter_map(|attr| {
                if let Attribute::LetDirective(let_dir) = attr {
                    Some(let_dir.name.to_string())
                } else {
                    None
                }
            })
            .collect();

        // Extract children from the fragment
        let (children, snippets, slot_names) = self
            .generate_component_children_with_snippets(&elem.fragment, &component_let_directives)?;

        let css_props_is_html = self.namespace != "svg";

        // svelte:self is NOT dynamic (it always refers to the current component)
        if bindings.is_empty() {
            self.output_parts.push(OutputPart::Component {
                name: comp_name,
                props_and_spreads,
                has_prior_content: true,
                children,
                snippets,
                slot_names,
                dynamic: false,
                let_directives: component_let_directives,
                css_custom_props,
                css_props_is_html,
                in_async_block: false,
                attach_expressions: Vec::new(),
                dev: self.dev,
            });
        } else {
            self.output_parts.push(OutputPart::ComponentWithBindings {
                name: comp_name,
                props_and_spreads,
                bindings,
                has_prior_content: true,
                children,
                snippets: Vec::new(),
                slot_names: Vec::new(),
                dynamic: false,
                css_custom_props,
                css_props_is_html,
                seq_bindings_hoisted: false,
                dev: self.dev,
            });
        }

        Ok(())
    }

    /// Extract CSS custom property value from an attribute value.
    /// This mirrors the logic in generate_component_usage for CSS custom props.
    fn extract_css_custom_prop_value(
        &self,
        value: &AttributeValue,
    ) -> Result<String, TransformError> {
        match value {
            AttributeValue::Expression(expr_tag) => {
                let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                if expr_end > expr_start && expr_end <= self.source.len() {
                    Ok(self.source[expr_start..expr_end].trim().to_string())
                } else {
                    Ok("''".to_string())
                }
            }
            AttributeValue::Sequence(parts) => {
                let mut value_str = String::new();
                let mut has_expression = false;
                for part in parts {
                    match part {
                        crate::ast::template::AttributeValuePart::Text(text) => {
                            value_str.push_str(&text.data);
                        }
                        crate::ast::template::AttributeValuePart::ExpressionTag(expr_tag) => {
                            has_expression = true;
                            let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                            let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                            if expr_end > expr_start && expr_end <= self.source.len() {
                                value_str.push_str("${$.stringify(");
                                value_str.push_str(self.source[expr_start..expr_end].trim());
                                value_str.push_str(")}");
                            }
                        }
                    }
                }
                if has_expression {
                    Ok(format!("`{}`", value_str))
                } else {
                    Ok(format!("'{}'", escape_js_string(&value_str)))
                }
            }
            AttributeValue::True(_) => Ok("true".to_string()),
        }
    }
}
