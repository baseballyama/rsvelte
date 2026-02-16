//! Server-side component visitor.

use super::super::ServerCodeGenerator;
use super::super::helpers::{
    get_let_directives, get_slot_name, is_valid_js_identifier, quote_prop_name,
    strip_ts_type_annotation,
};
use super::super::types::{ComponentBinding, ComponentPropItem, OutputPart};
use crate::ast::template::{Attribute, AttributeValue, Component, Fragment, TemplateNode};
use crate::compiler::phases::phase3_transform::TransformError;
use rustc_hash::FxHashMap;

fn push_component_prop(items: &mut Vec<ComponentPropItem>, prop: String) {
    if let Some(ComponentPropItem::Props(props)) = items.last_mut() {
        props.push(prop);
    } else {
        items.push(ComponentPropItem::Props(vec![prop]));
    }
}

impl<'a> ServerCodeGenerator<'a> {
    pub(crate) fn generate_component_usage(
        &mut self,
        component: &Component,
    ) -> Result<(), TransformError> {
        let comp_name = component.name.to_string();

        // Check if there's any prior content (HTML, expressions, or other components)
        let has_prior_content = self.output_parts.iter().any(|part| {
            matches!(part, OutputPart::Html(s) if !s.trim().is_empty())
                || matches!(part, OutputPart::Expression(_))
                || matches!(part, OutputPart::RawExpression(_))
                || matches!(part, OutputPart::Component { .. })
                || matches!(part, OutputPart::ComponentWithBindings { .. })
        });

        // Extract interleaved props/spreads and bindings
        let mut props_and_spreads: Vec<ComponentPropItem> =
            Vec::with_capacity(component.attributes.len());
        let mut bindings = Vec::with_capacity(2);

        for attr in &component.attributes {
            match attr {
                Attribute::Attribute(node) => {
                    let name = node.name.as_str();
                    match &node.value {
                        AttributeValue::Expression(expr_tag) => {
                            // Get expression from ExpressionTag's expression field
                            let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                            let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                            if expr_end > expr_start && expr_end <= self.source.len() {
                                let expr_source =
                                    self.source[expr_start..expr_end].trim().to_string();
                                // Check if it's a shorthand property (name equals expression)
                                if expr_source == name && is_valid_js_identifier(name) {
                                    push_component_prop(&mut props_and_spreads, name.to_string());
                                } else {
                                    push_component_prop(
                                        &mut props_and_spreads,
                                        format!("{}: {}", quote_prop_name(name), expr_source),
                                    );
                                }
                            }
                        }
                        AttributeValue::Sequence(parts) => {
                            // Check for special case: sequence with only a single expression
                            // This happens when attribute is like foo='{bar}' - treat as direct expression
                            if parts.len() == 1
                                && let crate::ast::template::AttributeValuePart::ExpressionTag(
                                    expr_tag,
                                ) = &parts[0]
                            {
                                let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                                let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                                if expr_end > expr_start && expr_end <= self.source.len() {
                                    let expr_source =
                                        self.source[expr_start..expr_end].trim().to_string();
                                    // Check if it's a shorthand property (name equals expression)
                                    if expr_source == name && is_valid_js_identifier(name) {
                                        push_component_prop(
                                            &mut props_and_spreads,
                                            name.to_string(),
                                        );
                                    } else {
                                        push_component_prop(
                                            &mut props_and_spreads,
                                            format!("{}: {}", quote_prop_name(name), expr_source),
                                        );
                                    }
                                    continue;
                                }
                            }

                            // Handle text or mixed values like name="world"
                            let mut value_str = String::new();
                            let mut has_expression = false;
                            for part in parts {
                                match part {
                                    crate::ast::template::AttributeValuePart::Text(text) => {
                                        value_str.push_str(&text.data);
                                    }
                                    crate::ast::template::AttributeValuePart::ExpressionTag(
                                        expr_tag,
                                    ) => {
                                        has_expression = true;
                                        // For mixed values with expressions, extract from source
                                        // and wrap in $.stringify() for proper string conversion
                                        let expr_start =
                                            expr_tag.expression.start().unwrap_or(0) as usize;
                                        let expr_end =
                                            expr_tag.expression.end().unwrap_or(0) as usize;
                                        if expr_end > expr_start && expr_end <= self.source.len() {
                                            value_str.push_str("${$.stringify(");
                                            value_str
                                                .push_str(self.source[expr_start..expr_end].trim());
                                            value_str.push_str(")}");
                                        }
                                    }
                                }
                            }
                            // Always add the prop (even for empty strings like foo='')
                            // Check if the value contains expressions
                            if has_expression {
                                push_component_prop(
                                    &mut props_and_spreads,
                                    format!("{}: `{}`", quote_prop_name(name), value_str),
                                );
                            } else {
                                // Simple string value (including empty strings)
                                push_component_prop(
                                    &mut props_and_spreads,
                                    format!("{}: '{}'", quote_prop_name(name), value_str),
                                );
                            }
                        }
                        AttributeValue::True(_) => {
                            // Boolean attribute (e.g., disabled)
                            push_component_prop(
                                &mut props_and_spreads,
                                format!("{}: true", quote_prop_name(name)),
                            );
                        }
                    }
                }
                Attribute::SpreadAttribute(spread) => {
                    // Get the spread expression from source
                    let expr_start = spread.expression.start().unwrap_or(0) as usize;
                    let expr_end = spread.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        let expr = self.source[expr_start..expr_end].trim().to_string();
                        props_and_spreads.push(ComponentPropItem::Spread(expr));
                    }
                }
                Attribute::BindDirective(bind) => {
                    let prop_name = bind.name.as_str();
                    // Skip bind:this - it doesn't require do/while pattern on server
                    if prop_name == "this" {
                        continue;
                    }

                    // Check if the expression is a SequenceExpression (getter/setter pair)
                    let expr_json = bind.expression.as_json();
                    let expr_type = expr_json.get("type").and_then(|t| t.as_str()).unwrap_or("");

                    if expr_type == "SequenceExpression" {
                        // Extract getter and setter from the SequenceExpression
                        if let Some(expressions) = expr_json
                            .get("expressions")
                            .and_then(|e| e.as_array())
                            .filter(|e| e.len() >= 2)
                        {
                            let getter_start = expressions[0]
                                .get("start")
                                .and_then(|s| s.as_u64())
                                .unwrap_or(0)
                                as usize;
                            let getter_end = expressions[0]
                                .get("end")
                                .and_then(|s| s.as_u64())
                                .unwrap_or(0) as usize;
                            let setter_start = expressions[1]
                                .get("start")
                                .and_then(|s| s.as_u64())
                                .unwrap_or(0)
                                as usize;
                            let setter_end = expressions[1]
                                .get("end")
                                .and_then(|s| s.as_u64())
                                .unwrap_or(0) as usize;

                            if getter_end > getter_start
                                && getter_end <= self.source.len()
                                && setter_end > setter_start
                                && setter_end <= self.source.len()
                            {
                                let getter_expr =
                                    self.source[getter_start..getter_end].trim().to_string();
                                let setter_expr =
                                    self.source[setter_start..setter_end].trim().to_string();
                                bindings.push(ComponentBinding::SequenceExpression {
                                    prop_name: prop_name.to_string(),
                                    getter_expr,
                                    setter_expr,
                                });
                            }
                        }
                    } else {
                        let expr_start = bind.expression.start().unwrap_or(0) as usize;
                        let expr_end = bind.expression.end().unwrap_or(0) as usize;
                        if expr_end > expr_start && expr_end <= self.source.len() {
                            let mut var_name = self.source[expr_start..expr_end].trim().to_string();
                            // Handle shorthand bindings where span might include "bind:"
                            if let Some(stripped) = var_name.strip_prefix("bind:") {
                                var_name = stripped.to_string();
                            }
                            bindings.push(ComponentBinding::Simple {
                                prop_name: prop_name.to_string(),
                                var_name,
                            });
                        }
                    }
                }
                _ => {}
            }
        }

        // Collect component-level let directive names (e.g., <Counter let:count>)
        let component_let_directives: Vec<String> = component
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
        // Pass component-level let directives so constant folding is suppressed for shadowed vars
        let (children, snippets, slot_names) = self.generate_component_children_with_snippets(
            &component.fragment,
            &component_let_directives,
        )?;

        // Check if the component is dynamic (could be undefined/null)
        // A component is dynamic if it's marked as such in metadata
        let is_dynamic = component.metadata.dynamic;

        // Use ComponentWithBindings if there are any bind directives
        if bindings.is_empty() {
            self.output_parts.push(OutputPart::Component {
                name: comp_name,
                props_and_spreads,
                has_prior_content,
                children,
                snippets,
                slot_names,
                dynamic: is_dynamic,
                let_directives: component_let_directives,
            });
        } else {
            self.output_parts.push(OutputPart::ComponentWithBindings {
                name: comp_name,
                props_and_spreads,
                bindings,
                has_prior_content,
                children,
                dynamic: is_dynamic,
            });
        }

        Ok(())
    }

    /// Generate component children, extracting snippets as props.
    /// Returns (children_parts, snippets, slot_names)
    /// Snippets are tuples of (name, params, body_parts, is_true_snippet)
    /// - is_true_snippet=true means it's a SnippetBlock (needs hoisting)
    /// - is_true_snippet=false means it's a slot child (inline in $$slots with destructured params)
    #[allow(clippy::type_complexity)]
    pub(crate) fn generate_component_children_with_snippets(
        &mut self,
        fragment: &Fragment,
        component_let_directives: &[String],
    ) -> Result<
        (
            Option<Vec<OutputPart>>,
            Vec<(String, Vec<String>, Vec<OutputPart>, bool)>,
            Vec<String>,
        ),
        TransformError,
    > {
        // Pre-allocate based on typical usage patterns
        // (name, params, body_parts, is_true_snippet)
        let mut snippets: Vec<(String, Vec<String>, Vec<OutputPart>, bool)> = Vec::with_capacity(4);
        let mut slot_names: Vec<String> = Vec::with_capacity(4);

        // Group children by slot name
        // Key: slot name, Value: (nodes, let_directive_names)
        let mut slot_children: FxHashMap<String, (Vec<&TemplateNode>, Vec<String>)> =
            FxHashMap::default();

        // Separate snippets from other children, and group by slot
        for node in &fragment.nodes {
            if let TemplateNode::SnippetBlock(snippet_block) = node {
                // Extract snippet name
                let name_start = snippet_block.expression.start().unwrap_or(0) as usize;
                let name_end = snippet_block.expression.end().unwrap_or(0) as usize;
                let snippet_name = if name_end > name_start && name_end <= self.source.len() {
                    self.source[name_start..name_end].trim().to_string()
                } else {
                    "snippet".to_string()
                };

                // Extract parameters (strip TypeScript type annotations)
                let params: Vec<String> = snippet_block
                    .parameters
                    .iter()
                    .map(|p| {
                        let start = p.start().unwrap_or(0) as usize;
                        let end = p.end().unwrap_or(0) as usize;
                        if end > start && end <= self.source.len() {
                            strip_ts_type_annotation(&self.source[start..end])
                        } else {
                            String::new()
                        }
                    })
                    .filter(|s| !s.is_empty())
                    .collect();

                // Generate snippet body
                let body_parts = self.generate_snippet_body(&snippet_block.body)?;

                // Add to slot names
                let slot_name = if snippet_name == "children" {
                    "default".to_string()
                } else {
                    snippet_name.clone()
                };
                slot_names.push(slot_name);

                snippets.push((snippet_name, params, body_parts, true)); // true = is_true_snippet
            } else {
                // Get the slot name and let directives from the node's attributes
                let slot_name = get_slot_name(node);
                let let_directives = get_let_directives(node);
                let entry = slot_children.entry(slot_name).or_default();
                entry.0.push(node);
                // Merge let directives (usually there's one element with let directives per slot)
                for let_dir in let_directives {
                    if !entry.1.contains(&let_dir) {
                        entry.1.push(let_dir);
                    }
                }
            }
        }

        // Process default slot children
        // When component has let directives (e.g., <Counter let:count>), the destructured
        // parameter shadows any outer constant variable. We need to temporarily remove
        // those names from constant_vars so they're not constant-folded.
        let children = if let Some((default_nodes, _let_dirs)) = slot_children.remove("default") {
            let mut saved_constants: Vec<(String, String)> = Vec::new();
            for name in component_let_directives {
                if let Some(value) = self.constant_vars.remove(name) {
                    saved_constants.push((name.clone(), value));
                }
            }

            let result = self.generate_children_from_nodes(&default_nodes)?;

            // Restore removed constants
            for (name, value) in saved_constants {
                self.constant_vars.insert(name, value);
            }

            result
        } else {
            None
        };

        // Process named slot children (non-default) as snippets with let directive params
        for (slot_name, (nodes, let_dirs)) in slot_children {
            // Generate children content for this named slot
            if let Some(slot_parts) = self.generate_children_from_nodes(&nodes)? {
                // Add as a snippet with the slot name and let directive names as params
                slot_names.push(slot_name.clone());
                snippets.push((slot_name, let_dirs, slot_parts, false)); // false = not a true snippet
            }
        }

        Ok((children, snippets, slot_names))
    }
}
