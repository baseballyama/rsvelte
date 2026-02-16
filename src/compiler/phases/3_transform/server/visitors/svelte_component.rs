//! Server-side svelte:component and svelte:self visitor.

use super::super::ServerCodeGenerator;
use super::super::helpers::quote_prop_name;
use super::super::types::{ComponentPropItem, OutputPart};
use crate::ast::template::{Attribute, SvelteComponentElement, SvelteElement};
use crate::compiler::phases::phase3_transform::TransformError;

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
        let mut bindings: Vec<(String, String)> = Vec::new();
        for attr in &elem.attributes {
            match attr {
                Attribute::Attribute(node) => {
                    let attr_name = node.name.as_str();
                    if attr_name.starts_with("on") {
                        continue;
                    }
                    let value = self.extract_attribute_value_as_string(node)?;
                    push_component_prop(
                        &mut props_and_spreads,
                        format!("{}: {}", quote_prop_name(attr_name), value),
                    );
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
                    let expr_start = bind.expression.start().unwrap_or(0) as usize;
                    let expr_end = bind.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        let mut var_name = self.source[expr_start..expr_end].trim().to_string();
                        // Handle shorthand bindings where span might include "bind:"
                        if let Some(stripped) = var_name.strip_prefix("bind:") {
                            var_name = stripped.to_string();
                        }
                        bindings.push((bind_name.to_string(), var_name));
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
            });
        } else {
            self.output_parts.push(OutputPart::ComponentWithBindings {
                name: component_expr,
                props_and_spreads,
                bindings,
                has_prior_content: true,
                children,
                dynamic: true,
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
        let mut bindings: Vec<(String, String)> = Vec::new();
        for attr in &elem.attributes {
            match attr {
                Attribute::Attribute(node) => {
                    let attr_name = node.name.as_str();
                    if attr_name.starts_with("on") {
                        continue;
                    }
                    let value = self.extract_attribute_value_as_string(node)?;
                    push_component_prop(
                        &mut props_and_spreads,
                        format!("{}: {}", quote_prop_name(attr_name), value),
                    );
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
                    let expr_start = bind.expression.start().unwrap_or(0) as usize;
                    let expr_end = bind.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        let mut var_name = self.source[expr_start..expr_end].trim().to_string();
                        if let Some(stripped) = var_name.strip_prefix("bind:") {
                            var_name = stripped.to_string();
                        }
                        bindings.push((bind_name.to_string(), var_name));
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
            });
        } else {
            self.output_parts.push(OutputPart::ComponentWithBindings {
                name: comp_name,
                props_and_spreads,
                bindings,
                has_prior_content: true,
                children,
                dynamic: false,
            });
        }

        Ok(())
    }
}
